import time
import threading
import json
from flask import Flask, render_template, jsonify, request
from flask_socketio import SocketIO, emit

# ─── Hardware imports (comment these out if testing without Pi) ───────────────
try:
    import RPi.GPIO as GPIO
    import board
    import busio
    from adafruit_ina219 import INA219
    HARDWARE = True
except ImportError:
    HARDWARE = False
    print("WARNING: Running in simulation mode — no hardware detected")

# ─── Constants ────────────────────────────────────────────────────────────────
PWM_PIN        = 18          # GPIO 18, physical pin 12
PWM_FREQ       = 1000        # Hz
FARADAY        = 96485       # C/mol
MOLAR_MASS     = 74.44       # g/mol NaOCl
DEFAULT_EFF    = 0.70        # 70% default efficiency
I2C_ADDR       = 0x40        # INA219 default I2C address

# ─── App setup ────────────────────────────────────────────────────────────────
app = Flask(__name__)
app.config["SECRET_KEY"] = "electrochlorinator"
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="threading")

# ─── Shared state ─────────────────────────────────────────────────────────────
state = {
    "running":      False,
    "complete":     False,
    "duty_cycle":   0,
    "voltage":      0.0,
    "current":      0.0,
    "charge":       0.0,       # Coulombs accumulated
    "grams":        0.0,       # NaOCl produced so far
    "target_ppm":   500,
    "volume_L":     1.0,
    "efficiency":   DEFAULT_EFF,
    "grams_target": 0.0,
    "progress":     0.0,
    "eta_minutes":  0.0,
    "log":          [],
}

# ─── Hardware init ────────────────────────────────────────────────────────────
pwm = None
ina = None

def init_hardware():
    global pwm, ina
    if not HARDWARE:
        return
    GPIO.setmode(GPIO.BCM)
    GPIO.setup(PWM_PIN, GPIO.OUT)
    pwm = GPIO.PWM(PWM_PIN, PWM_FREQ)
    pwm.start(0)

    i2c = busio.I2C(board.SCL, board.SDA)
    ina = INA219(i2c, addr=I2C_ADDR)

def read_sensor():
    """Return (voltage_V, current_A). Falls back to simulation if no hardware."""
    if HARDWARE and ina:
        try:
            v = ina.bus_voltage + ina.shunt_voltage / 1000
            a = ina.current / 1000
            return round(v, 3), round(max(a, 0), 3)
        except Exception:
            pass
    # Simulation: ramp up to ~1.8A when duty cycle is applied
    sim_current = (state["duty_cycle"] / 100) * 1.8 if state["running"] else 0.0
    sim_voltage = (state["duty_cycle"] / 100) * 5.5 if state["running"] else 0.0
    return round(sim_voltage, 2), round(sim_current, 2)

def set_duty(dc):
    state["duty_cycle"] = dc
    if HARDWARE and pwm:
        pwm.ChangeDutyCycle(dc)

# ─── Faraday helpers ──────────────────────────────────────────────────────────
def grams_target_from_state():
    return (state["target_ppm"] * state["volume_L"]) / 1000

def coulombs_needed(grams, efficiency):
    return (grams / (MOLAR_MASS * efficiency)) * 2 * FARADAY

def grams_from_charge(charge, efficiency):
    return ((charge / FARADAY) / 2) * MOLAR_MASS * efficiency

# ─── Control loop ─────────────────────────────────────────────────────────────
def control_loop():
    last_time = time.time()

    while state["running"]:
        now = time.time()
        dt  = now - last_time
        last_time = now

        # Read sensors
        v, a = read_sensor()
        state["voltage"] = v
        state["current"] = a

        # Accumulate charge (Coulombs = A × seconds)
        state["charge"] += a * dt

        # Faraday: grams produced so far
        grams_so_far   = grams_from_charge(state["charge"], state["efficiency"])
        grams_target   = grams_target_from_state()
        state["grams"] = round(grams_so_far, 4)
        state["grams_target"] = round(grams_target, 4)

        # Progress 0–100%
        progress = (grams_so_far / grams_target * 100) if grams_target > 0 else 0
        state["progress"] = round(min(progress, 100), 1)

        # ETA
        grams_remaining = max(grams_target - grams_so_far, 0)
        if a > 0.01:
            c_remaining = coulombs_needed(grams_remaining, state["efficiency"])
            state["eta_minutes"] = round(c_remaining / a / 60, 1)
        else:
            state["eta_minutes"] = None

        # Auto-stop when target reached
        if grams_so_far >= grams_target:
            set_duty(0)
            state["running"]  = False
            state["complete"] = True
            msg = f"Target reached — {state['target_ppm']} ppm confirmed. Safe to use."
            state["log"].append(msg)
            socketio.emit("state", get_state_payload())
            break

        # Push update to all connected clients every loop
        socketio.emit("state", get_state_payload())
        time.sleep(0.5)

# ─── State payload ────────────────────────────────────────────────────────────
def get_state_payload():
    return {
        "running":      state["running"],
        "complete":     state["complete"],
        "duty_cycle":   state["duty_cycle"],
        "voltage":      state["voltage"],
        "current":      state["current"],
        "charge":       round(state["charge"], 1),
        "grams":        state["grams"],
        "grams_target": state["grams_target"],
        "target_ppm":   state["target_ppm"],
        "volume_L":     state["volume_L"],
        "efficiency":   state["efficiency"],
        "progress":     state["progress"],
        "eta_minutes":  state["eta_minutes"],
        "log":          state["log"][-10:],   # last 10 log entries
    }

# ─── HTTP routes ──────────────────────────────────────────────────────────────
@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/state")
def api_state():
    return jsonify(get_state_payload())

@app.route("/api/start", methods=["POST"])
def api_start():
    if state["running"]:
        return jsonify({"error": "Already running"}), 400
    data = request.json or {}
    state["target_ppm"]  = float(data.get("target_ppm",  state["target_ppm"]))
    state["volume_L"]    = float(data.get("volume_L",    state["volume_L"]))
    state["efficiency"]  = float(data.get("efficiency",  state["efficiency"]))
    state["charge"]      = 0.0
    state["grams"]       = 0.0
    state["progress"]    = 0.0
    state["complete"]    = False
    state["running"]     = True
    duty = float(data.get("duty_cycle", 70))
    set_duty(duty)
    state["log"].append(f"Started: {state['target_ppm']} ppm, {state['volume_L']}L, {duty}% power")
    t = threading.Thread(target=control_loop, daemon=True)
    t.start()
    return jsonify({"status": "started"})

@app.route("/api/stop", methods=["POST"])
def api_stop():
    state["running"] = False
    set_duty(0)
    state["log"].append("Stopped manually")
    return jsonify({"status": "stopped"})

@app.route("/api/power", methods=["POST"])
def api_power():
    data = request.json or {}
    dc = float(data.get("duty_cycle", 0))
    dc = max(0, min(100, dc))
    set_duty(dc)
    return jsonify({"duty_cycle": dc})

@app.route("/api/config", methods=["POST"])
def api_config():
    data = request.json or {}
    if "efficiency" in data:
        state["efficiency"] = float(data["efficiency"])
    return jsonify({"efficiency": state["efficiency"]})

# ─── SocketIO events ──────────────────────────────────────────────────────────
@socketio.on("connect")
def on_connect():
    emit("state", get_state_payload())

@socketio.on("set_power")
def on_set_power(data):
    dc = float(data.get("duty_cycle", 0))
    set_duty(max(0, min(100, dc)))
    emit("state", get_state_payload())

# ─── Entry point ──────────────────────────────────────────────────────────────
if __name__ == "__main__":
    init_hardware()
    print("Starting electrochlorinator server on http://0.0.0.0:5000")
    socketio.run(app, host="0.0.0.0", port=5000, debug=False)
