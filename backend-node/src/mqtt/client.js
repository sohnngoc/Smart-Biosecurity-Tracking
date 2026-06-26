const mqtt = require('mqtt');

let client;

const init = () => {
    const brokerUrl = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';
    
    console.log(`Đang kết nối tới MQTT Broker tại ${brokerUrl}...`);
    
    client = mqtt.connect(brokerUrl, {
        username: process.env.MQTT_USERNAME || 'admin',
        password: process.env.MQTT_PASSWORD || 'admin',
        reconnectPeriod: 5000, // Tự động kết nối lại sau 5s
    });

    client.on('connect', () => {
        console.log('✅ Kết nối MQTT thành công');
        
        // Đăng ký các topic cần theo dõi
        const topics = [
            'farm/+/gate/+/rfid',
            'farm/+/vehicle/+/gps',
            'farm/+/barn/+/uwb',
            'farm/+/cleaning/+/status',
            'farm/+/device/+/heartbeat'
        ];
        
        client.subscribe(topics, (err) => {
            if (err) {
                console.error('Lỗi khi đăng ký topic:', err);
            } else {
                console.log('Đã đăng ký lắng nghe các topic IoT.');
            }
        });
    });

    client.on('message', async (topic, message) => {
        try {
            const payload = JSON.parse(message.toString());
            console.log(`[MQTT] Nhận dữ liệu từ ${topic}:`, payload);
            
            // TODO: Phân loại topic và lưu vào Supabase
            // Ví dụ: Lưu sự kiện RFID
            if (topic.includes('/rfid')) {
                // supabase.from('rfid_events').insert({...})
            } else if (topic.includes('/gps')) {
                // Lấy vehicle_id từ topic: farm/:farmId/vehicle/:vehicleId/gps
                const parts = topic.split('/');
                const vehicleId = parts[3];
                // Lấy latitude, longitude từ payload
                // supabase.rpc('insert_gps_point', { ... })
            }
            
        } catch (error) {
            console.error('Lỗi phân tích dữ liệu MQTT:', error.message);
        }
    });

    client.on('error', (err) => {
        console.error('Lỗi kết nối MQTT:', err.message);
    });
    
    client.on('offline', () => {
        console.warn('MQTT Broker mất kết nối. Đang thử lại...');
    });
};

module.exports = {
    init,
    getClient: () => client
};
