require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const mqttClient = require('./mqtt/client');
const routes = require('./routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Khởi tạo Supabase Client
const supabaseUrl = process.env.SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy';
global.supabase = createClient(supabaseUrl, supabaseKey);

// Đăng ký API Routes
app.use('/api', routes);

// Middleware xử lý lỗi chung
app.use((err, req, res, next) => {
    console.error('Lỗi hệ thống:', err.stack);
    res.status(500).json({ error: 'Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.' });
});

const PORT = process.env.API_PORT || 3000;
app.listen(PORT, () => {
    console.log(`Backend API đang chạy tại http://localhost:${PORT}`);
    
    // Khởi động MQTT listener
    mqttClient.init();
});
