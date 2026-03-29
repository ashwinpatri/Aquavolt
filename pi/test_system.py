"""
test_system.py — step by step hardware test
Run this before app.py to verify everything is wired correctly.
Usage: python3 test_system.py
"""

import time
import sys

print("\n=== Electrochlorinator System Test ===\n")

# ─── Test 1: I2C + INA219 ─────────────────────────────────────────────────────
print("Test 1: INA219 current sensor...")
try:
    import board
    import busio
    from adafruit_ina219 import INA219
    i2c = busio.I2C(board.SCL, board.SDA)
    ina = INA219(i2c, addr=0x40)
    v = ina.bus_voltage + ina.shunt_voltage / 1000
    a = ina.current / 1000
    print(f"  PASS — Voltage: {v:.2f}V  Current: {a:.3f}A")
    print(f"  (Both should be near 0 when cell is not powered yet)")
except Exception as e:
    print(f"  FAIL — {e}")
    print("  Check: INA219 VCC→Pin1, GND→Pin6, SDA→Pin3, SCL→Pin5")
    print("  Check: sudo i2cdetect -y 1 should show 40 in the grid")

print()

# ─── Test 2: GPIO + MOSFET ────────────────────────────────────────────────────
print("Test 2: GPIO PWM (MOSFET gate on Pin 12)...")
try:
    import RPi.GPIO as GPIO
    GPIO.setmode(GPIO.BCM)
    GPIO.setup(18, GPIO.OUT)
    pwm = GPIO.PWM(18, 1000)
    pwm.start(0)
    print("  GPIO ready. Ramping power 0 → 50% → 0 over 6 seconds...")
    print("  Watch for bubbles at the electrodes!\n")

    for dc in [10, 20, 30, 40, 50, 40, 30, 20, 10, 0]:
        pwm.ChangeDutyCycle(dc)
        try:
            v = ina.bus_voltage + ina.shunt_voltage / 1000
            a = ina.current / 1000
        except:
            v, a = 0, 0
        bar = "#" * int(dc / 5)
        print(f"  Power: {dc:3d}%  [{bar:<10}]  {v:.2f}V  {a:.3f}A")
        time.sleep(0.6)

    pwm.ChangeDutyCycle(0)
    pwm.stop()
    GPIO.cleanup()
    print("\n  PASS — PWM working. Did you see bubbles? If yes, system is good!")
except Exception as e:
    print(f"  FAIL — {e}")
    print("  Check: 330 ohm resistor between Pin 12 and MOSFET Gate")
    print("  Check: MOSFET Source → GND,  Drain → anode rod")

print()

# ─── Test 3: Quick 60 second production run ──────────────────────────────────
print("Test 3: 60 second production run at 70% power...")
print("  This will run the cell for 1 minute and estimate NaOCl produced.")
answer = input("  Ready? Make sure the jar has brine in it. Press Enter to start or Q to skip: ")
if answer.strip().lower() == "q":
    print("  Skipped.\n")
else:
    try:
        import RPi.GPIO as GPIO
        import board, busio
        from adafruit_ina219 import INA219

        GPIO.setmode(GPIO.BCM)
        GPIO.setup(18, GPIO.OUT)
        pwm = GPIO.PWM(18, 1000)
        pwm.start(70)

        i2c = busio.I2C(board.SCL, board.SDA)
        ina = INA219(i2c, addr=0x40)

        FARADAY     = 96485
        MOLAR_MASS  = 74.44
        EFFICIENCY  = 0.70
        charge      = 0.0
        last        = time.time()
        duration    = 60

        print(f"\n  {'Time':>5}  {'Voltage':>8}  {'Current':>8}  {'Charge':>8}  {'NaOCl':>8}")
        print(f"  {'(s)':>5}  {'(V)':>8}  {'(A)':>8}  {'(C)':>8}  {'(mg)':>8}")
        print("  " + "-" * 50)

        for i in range(duration):
            now = time.time()
            dt  = now - last
            last = now

            v = ina.bus_voltage + ina.shunt_voltage / 1000
            a = max(ina.current / 1000, 0)
            charge += a * dt
            grams   = ((charge / FARADAY) / 2) * MOLAR_MASS * EFFICIENCY
            mg      = grams * 1000

            if i % 10 == 0:
                print(f"  {i:>5}  {v:>8.2f}  {a:>8.3f}  {charge:>8.1f}  {mg:>8.2f}")

            time.sleep(1)

        pwm.ChangeDutyCycle(0)
        pwm.stop()
        GPIO.cleanup()

        ppm_1L = (grams / 1.0) * 1000
        print(f"\n  Run complete!")
        print(f"  Total charge:      {charge:.1f} C")
        print(f"  NaOCl produced:    {grams*1000:.2f} mg  ({grams:.4f} g)")
        print(f"  Est. conc (1L jar): {ppm_1L:.1f} ppm")
        print(f"\n  Dip your test strip now — should show some free chlorine.")
        print(f"  After a full run (~21 min at 70%) you will reach 500 ppm.")
        print(f"\n  PASS — System is working correctly!" if charge > 10 else
              f"\n  WARNING — Very low charge accumulated ({charge:.1f}C). Check wiring.")

    except Exception as e:
        print(f"  FAIL — {e}")

print("\n=== Test complete ===\n")
