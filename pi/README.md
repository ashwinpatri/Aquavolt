# Electrochlorinator — Pi Setup & Run Guide

## 1. Flash the Pi
- Use Raspberry Pi Imager → Raspberry Pi OS Lite (64-bit)
- In Imager settings (gear icon): set hostname, WiFi, SSH, username/password

## 2. SSH in
```
ssh pi@electrochlorinator.local
```

## 3. Install dependencies
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install python3-pip python3-smbus i2c-tools git bluetooth bluez python3-bluetooth -y
pip3 install flask flask-socketio adafruit-circuitpython-ina219 RPi.GPIO pybluez
```

## 4. Enable I2C
```bash
sudo raspi-config
# Interface Options → I2C → Enable → reboot
```

## 5. Verify INA219 is detected
```bash
sudo i2cdetect -y 1
# Should show 0x40 in the grid
```

## 6. Enable Bluetooth pairing
Edit /etc/bluetooth/main.conf:
```
DiscoverableTimeout = 0
PairableTimeout = 0
```
Then: sudo systemctl restart bluetooth

## 7. Copy files to Pi
```bash
scp -r electrochlorinator/ pi@electrochlorinator.local:~/
```

## 8. Run the app
```bash
cd ~/electrochlorinator
python3 app.py
```
Open http://electrochlorinator.local:5000 on your phone/laptop.

## 9. Bluetooth (optional, for friend's app)
In a second terminal:
```bash
python3 bluetooth_serial.py
```
Pair your phone in Bluetooth settings, then connect via RFCOMM.
Commands: START / STOP / POWER:70

## Wiring reminder
- Pi Pin 1  → INA219 VCC
- Pi Pin 3  → INA219 SDA
- Pi Pin 5  → INA219 SCL
- Pi Pin 6  → INA219 GND
- Pi Pin 12 → 330Ω resistor → MOSFET Gate
