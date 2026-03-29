"""
pi_server.py — runs on the Raspberry Pi
Receives START / STOP commands from laptop over USB serial
Sends back voltage, current, power, charge, duty, running, timestamp every 0.5s
"""

import time
import json
import serial
import serial.tools.list_ports

try:
    import RPi.GPIO as GPIO
    import board
    import busio
    from adafruit_ina219 import INA219, ADCResolution
    HARDWARE = True
except ImportError:
    HARDWARE = False
    print("Simulation mode — no hardware detected")

PWM_PIN       = 18
PWM_FREQ      = 1000
BAUD_RATE     = 115200
SEND_INTERVAL = 0.5

state = {
    "running":    False,
    "duty_cycle": 0,
    "charge":     0.0,
}

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
    ina = INA219(i2c, addr=0x40)
    ina.bus_adc_resolution   = ADCResolution.ADCRES_12BIT_128S
    ina.shunt_adc_resolution = ADCResolution.ADCRES_12BIT_128S

def set_duty(dc):
    state["duty_cycle"] = dc
    if HARDWARE and pwm:
        pwm.ChangeDutyCycle(dc)

def read_sensors():
    if HARDWARE and ina:
        try:
            v = ina.bus_voltage + ina.shunt_voltage / 1000
            a = max(ina.current / 1000, 0)
            return round(v, 3), round(a, 3)
        except:
            pass
    dc = state["duty_cycle"]
    v  = round((dc / 100) * 5.5, 2)
    a  = round((dc / 100) * 1.8, 3)
    return v, a

def find_serial_port():
    ports = serial.tools.list_ports.comports()
    for p in ports:
        if "ttyGS0" in p.device or "ttyACM" in p.device or "ttyUSB" in p.device:
            return p.device
    return "/dev/ttyGS0"

def serial_bridge(port):
    print(f"Opening serial on {port} at {BAUD_RATE} baud")
    try:
        ser = serial.Serial(port, BAUD_RATE, timeout=0.1)
    except Exception as e:
        print(f"Could not open serial port: {e}")
        return

    last_send    = 0
    last_charge_time = time.time()

    while True:
        # ── Read command from laptop ──────────────────────────────────────
        try:
            line = ser.readline().decode("utf-8").strip()
        except:
            line = ""

        if line:
            try:
                cmd    = json.loads(line)
                action = cmd.get("action", "")

                if action == "START":
                    state["duty_cycle"] = float(cmd.get("duty_cycle", 70))
                    state["running"]    = True
                    state["charge"]     = 0.0
                    last_charge_time    = time.time()
                    set_duty(state["duty_cycle"])
                    print(f"Started at {state['duty_cycle']}% power")

                elif action == "STOP":
                    state["running"] = False
                    set_duty(0)
                    print("Stopped")

                elif action == "SET_POWER":
                    dc = float(cmd.get("duty_cycle", 70))
                    set_duty(max(0, min(100, dc)))

            except json.JSONDecodeError:
                pass

        # ── Accumulate charge only while running ─────────────────────────
        now = time.time()
        if state["running"]:
            dt = now - last_charge_time
            _, a = read_sensors()
            state["charge"] += a * dt
        last_charge_time = now

        # ── Send payload every 0.5s ───────────────────────────────────────
        if now - last_send >= SEND_INTERVAL:
            last_send = now
            v, a = read_sensors()
            payload = {
                "voltage":   v,
                "current":   a,
                "power":     round(v * a, 3),
                "charge":    round(state["charge"], 2),
                "duty":      state["duty_cycle"],
                "running":   state["running"],
                "timestamp": round(now * 1000),
            }
            try:
                ser.write((json.dumps(payload) + "\n").encode("utf-8"))
            except:
                print("Serial write failed")

if __name__ == "__main__":
    init_hardware()
    port = find_serial_port()
    serial_bridge(port)
