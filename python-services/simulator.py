import time
import json
import random
import paho.mqtt.client as mqtt

MQTT_BROKER = "localhost"
MQTT_PORT = 1883
MQTT_USER = "admin"
MQTT_PASS = "admin"

def on_connect(client, userdata, flags, rc):
    print(f"Connected to MQTT broker with result code {rc}")

client = mqtt.Client()
client.username_pw_set(MQTT_USER, MQTT_PASS)
client.on_connect = on_connect

client.connect(MQTT_BROKER, MQTT_PORT, 60)
client.loop_start()

# Dữ liệu mẫu
farm_id = "FARM-001"
gate_id = "GATE-01"
vehicles = ["VH-001"] # Xe 93C-12345
rfid_tags = ["RFID-VH-0001", "RFID-NV-0001"]

def simulate():
    print("Bắt đầu giả lập dữ liệu IoT...")
    try:
        while True:
            # 1. Giả lập xe đi qua cổng (RFID)
            if random.random() > 0.8:
                payload = {
                    "device_id": "RFID-READER-01",
                    "rfid_tag": rfid_tags[0],
                    "timestamp": int(time.time() * 1000)
                }
                topic = f"farm/{farm_id}/gate/{gate_id}/rfid"
                client.publish(topic, json.dumps(payload))
                print(f"[RFID] Đã gửi lên {topic}: {payload}")

            # 2. Giả lập GPS xe đang di chuyển trong trại
            payload_gps = {
                "latitude": 11.505 + random.uniform(-0.001, 0.001),
                "longitude": 106.505 + random.uniform(-0.001, 0.001),
                "speed": random.uniform(5.0, 15.0),
                "heading": random.uniform(0, 360),
                "timestamp": int(time.time() * 1000)
            }
            topic_gps = f"farm/{farm_id}/vehicle/{vehicles[0]}/gps"
            client.publish(topic_gps, json.dumps(payload_gps))
            print(f"[GPS] Đã gửi lên {topic_gps}: Tọa độ ({payload_gps['latitude']}, {payload_gps['longitude']})")

            time.sleep(5) # Mỗi 5 giây gửi một lần
    except KeyboardInterrupt:
        print("Dừng giả lập.")
        client.loop_stop()
        client.disconnect()

if __name__ == "__main__":
    simulate()
