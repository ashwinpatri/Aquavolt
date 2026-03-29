"""
bluetooth_serial.py — simple Bluetooth serial bridge
Run alongside app.py to expose state over Bluetooth RFCOMM.
The phone/app connects via Bluetooth serial and receives JSON state updates.
Commands received: START, STOP, POWER:<0-100>
"""
import bluetooth
import json
import threading
import time

# Import shared state from app — run this in same process or import carefully
# For standalone use, import state dict from app
try:
    from app import state, set_duty, control_loop, get_state_payload
    import threading as th
except ImportError:
    print("Run alongside app.py")
    exit(1)

UUID = "00001101-0000-1000-8000-00805F9B34FB"   # standard SPP UUID

def bt_server():
    server = bluetooth.BluetoothSocket(bluetooth.RFCOMM)
    server.bind(("", bluetooth.PORT_ANY))
    server.listen(1)
    port = server.getsockname()[1]
    bluetooth.advertise_service(
        server, "Electrochlorinator",
        service_id=UUID,
        service_classes=[UUID, bluetooth.SERIAL_PORT_CLASS],
        profiles=[bluetooth.SERIAL_PORT_PROFILE]
    )
    print(f"Bluetooth RFCOMM listening on port {port}")

    while True:
        client, addr = server.accept()
        print(f"BT connected: {addr}")
        handle_client(client)

def handle_client(client):
    try:
        while True:
            # Push state every second
            payload = json.dumps(get_state_payload()) + "\n"
            client.send(payload.encode())

            # Non-blocking check for incoming command
            client.setblocking(False)
            try:
                raw = client.recv(64).decode().strip()
                if raw == "START":
                    if not state["running"]:
                        state["running"]  = True
                        state["complete"] = False
                        state["charge"]   = 0.0
                        set_duty(70)
                        th.Thread(target=control_loop, daemon=True).start()
                elif raw == "STOP":
                    state["running"] = False
                    set_duty(0)
                elif raw.startswith("POWER:"):
                    dc = float(raw.split(":")[1])
                    set_duty(max(0, min(100, dc)))
            except Exception:
                pass
            finally:
                client.setblocking(True)

            time.sleep(1)
    except Exception as e:
        print(f"BT client disconnected: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    bt_server()
