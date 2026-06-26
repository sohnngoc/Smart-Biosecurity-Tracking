const express = require('express');
const router = express.Router();

// Middleware kiểm tra xác thực JWT (Cần triển khai thực tế bằng Supabase Admin/JWT verify)
const verifyAuth = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ error: 'Không tìm thấy token xác thực' });
    }
    // TODO: Verify token via Supabase
    next();
};

// ==========================================
// API XE RA/VÀO & IMPORT/EXPORT (Demo)
// ==========================================

router.get('/xe', verifyAuth, async (req, res) => {
    try {
        const { data, error } = await global.supabase.from('vehicles').select('*');
        if (error) throw error;
        res.json({ data });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/xe/vao-trai', verifyAuth, async (req, res) => {
    const { rfid_tag, zone_id } = req.body;
    try {
        // 1. Kiểm tra xe
        const { data: vehicle } = await global.supabase
            .from('vehicles')
            .select('*')
            .eq('rfid_tag', rfid_tag)
            .single();
            
        if (!vehicle) return res.status(404).json({ error: 'Không tìm thấy thông tin xe theo thẻ RFID' });
        
        // 2. Kiểm tra sát trùng
        if (vehicle.sanitization_status !== 'Đã sát trùng') {
            // Ghi cảnh báo
            await global.supabase.from('alerts').insert({
                farm_id: vehicle.farm_id,
                alert_type: 'Chưa sát trùng',
                severity: 'Cao',
                message: `Xe ${vehicle.plate_number} chưa xác nhận sát trùng nhưng đang cố vào cổng.`,
                target_type: 'VEHICLE',
                target_id: vehicle.vehicle_id,
                zone_id: zone_id
            });
            return res.status(403).json({ error: 'Xe chưa sát trùng. Không được phép vào!' });
        }
        
        // 3. Cho vào và ghi log
        await global.supabase.from('entry_exit_logs').insert({
            target_type: 'VEHICLE',
            target_id: vehicle.vehicle_id,
            zone_id: zone_id,
            action: 'IN'
        });
        
        res.json({ message: 'Xe được phép vào trại', vehicle });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Các endpoint mock cho Import/Export
router.post('/xe/import-excel', verifyAuth, (req, res) => {
    res.json({ message: 'Tính năng import Excel đang được phát triển.' });
});
router.get('/xe/export-excel', verifyAuth, (req, res) => {
    res.json({ message: 'Tính năng export Excel đang được phát triển.' });
});

// ==========================================
// API TỔNG QUAN / DASHBOARD
// ==========================================

router.get('/tong-quan', verifyAuth, async (req, res) => {
    try {
        // Mock dữ liệu
        res.json({
            data: {
                xeTrongTrai: 12,
                nguoiKhuSach: 45,
                canhBaoChuaXuLy: 3,
                thietBiMatTinHieu: 1
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
