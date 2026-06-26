-- ==========================================
-- SEED DATA CHO BẢN DEMO WEB (5 TRẠI)
-- ==========================================

-- 1. Xóa dữ liệu cũ nếu có
TRUNCATE TABLE export_logs, import_errors, import_batches, audit_logs, alerts, cleaning_checkpoints, cleaning_tasks, entry_exit_logs, uwb_positions, gps_points, rfid_events, devices, persons, vehicles, barns, biosecurity_zones, user_farms, farms, role_permissions, permissions, roles, profiles CASCADE;

-- 2. Thêm Roles
INSERT INTO roles (role_id, role_name, description) VALUES
('11111111-1111-1111-1111-111111111111', 'Quản trị hệ thống', 'Quản trị viên toàn quyền'),
('22222222-2222-2222-2222-222222222222', 'Quản lý trại', 'Giám sát hoạt động, phê duyệt cảnh báo'),
('33333333-3333-3333-3333-333333333333', 'Tổ vệ sinh sát trùng', 'Thực hiện vệ sinh chuồng trại'),
('44444444-4444-4444-4444-444444444444', 'Nhân viên trại', 'Làm việc bên trong trại, chăm sóc heo'),
('55555555-5555-5555-5555-555555555555', 'Bảo vệ cổng', 'Kiểm soát xe, người ra vào cổng trại');

-- 3. Thêm Trại (Farms)
INSERT INTO farms (id, farm_code, farm_name, location_name, province, district, latitude, longitude, biosecurity_level, overall_status, risk_score, active_alert_count, vehicles_inside_count, persons_inside_count) VALUES
('f0000000-0000-0000-0000-000000000001', 'FARM-001', 'Trại Nái Bình Phước 01', 'Bình Phước', 'Bình Phước', 'Đồng Phú', 11.7512, 106.7234, 'Cấp độ cao', 'Cần chú ý', 58, 2, 4, 15),
('f0000000-0000-0000-0000-000000000002', 'FARM-002', 'Trại Nái Đồng Nai 01', 'Đồng Nai', 'Đồng Nai', 'Xuân Lộc', 11.0686, 107.1676, 'Cấp độ cao', 'An toàn', 22, 0, 1, 10),
('f0000000-0000-0000-0000-000000000003', 'FARM-003', 'Trại Nái Tây Ninh 01', 'Tây Ninh', 'Tây Ninh', 'Trảng Bàng', 11.3352, 106.1099, 'Cấp độ cao', 'Rủi ro cao', 84, 5, 6, 20),
('f0000000-0000-0000-0000-000000000004', 'FARM-004', 'Trại Nái Long An 01', 'Long An', 'Long An', 'Bến Lức', 10.6956, 106.2431, 'Cấp độ trung bình', 'An toàn', 18, 0, 2, 8),
('f0000000-0000-0000-0000-000000000005', 'FARM-005', 'Trại Nái Bình Dương 01', 'Bình Dương', 'Bình Dương', 'Bến Cát', 11.3254, 106.4770, 'Cấp độ cao', 'Cần chú ý', 46, 1, 3, 12);

-- 4. Thêm Vùng An Toàn Sinh Học cho FARM-001 (Mô phỏng 1 trại)
INSERT INTO biosecurity_zones (id, farm_id, zone_code, zone_name, zone_type, risk_level, geom) VALUES
('e0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'ZONE-001', 'Cổng Trại Chính', 'Vùng cổng', 'Thấp', ST_GeomFromText('POLYGON((106.7234 11.7512, 106.7235 11.7512, 106.7235 11.7513, 106.7234 11.7513, 106.7234 11.7512))', 4326)),
('e0000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000001', 'ZONE-002', 'Vùng sát trùng xe', 'Vùng sát trùng xe', 'Trung bình', ST_GeomFromText('POLYGON((106.7235 11.7513, 106.7236 11.7513, 106.7236 11.7514, 106.7235 11.7514, 106.7235 11.7513))', 4326)),
('e0000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000001', 'ZONE-003', 'Vùng đệm nội bộ', 'Vùng đệm', 'Trung bình', ST_GeomFromText('POLYGON((106.7236 11.7514, 106.7237 11.7514, 106.7237 11.7515, 106.7236 11.7515, 106.7236 11.7514))', 4326)),
('e0000000-0000-0000-0000-000000000004', 'f0000000-0000-0000-0000-000000000001', 'ZONE-004', 'Chuồng Nái 01', 'Chuồng nái', 'Cao', ST_GeomFromText('POLYGON((106.7237 11.7515, 106.7238 11.7515, 106.7238 11.7516, 106.7237 11.7516, 106.7237 11.7515))', 4326)),
('e0000000-0000-0000-0000-000000000005', 'f0000000-0000-0000-0000-000000000001', 'ZONE-005', 'Khu xử lý chất thải', 'Vùng nguy cơ cao', 'Nghiêm trọng', ST_GeomFromText('POLYGON((106.7238 11.7516, 106.7239 11.7516, 106.7239 11.7517, 106.7238 11.7517, 106.7238 11.7516))', 4326));

-- 5. Thêm Xe (FARM-001)
INSERT INTO vehicles (id, farm_id, vehicle_code, plate_number, vehicle_type, driver_name, rfid_tag, sanitization_status, current_zone_id) VALUES
('b0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'VH-001', '93C-12345', 'Xe chở cám', 'Nguyễn Văn Tài', 'RFID-VH-001', 'Đã sát trùng', 'e0000000-0000-0000-0000-000000000002'),
('b0000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000001', 'VH-002', '93C-67890', 'Xe bắt heo', 'Trần Hữu Nam', 'RFID-VH-002', 'Chưa sát trùng', 'e0000000-0000-0000-0000-000000000001'),
('b0000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000001', 'VH-003', '51D-33333', 'Xe chuyên chở thiết bị', 'Lê Hoàng', 'RFID-VH-003', 'Đã sát trùng', 'e0000000-0000-0000-0000-000000000003');

-- 6. Thêm Nhân Sự (FARM-001)
INSERT INTO persons (id, farm_id, person_code, full_name, department, person_role, rfid_card, uwb_tag, shower_status, current_zone_id) VALUES
('c0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'NV-001', 'Lê Thị Thu', 'Chăn nuôi', 'Nhân viên trại', 'RFID-NV-001', 'UWB-NV-001', 'Đã tắm sát trùng', 'e0000000-0000-0000-0000-000000000004'),
('c0000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000001', 'NV-002', 'Phạm Minh Toàn', 'Vệ sinh', 'Tổ vệ sinh', 'RFID-NV-002', 'UWB-NV-002', 'Đã tắm sát trùng', 'e0000000-0000-0000-0000-000000000004'),
('c0000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000001', 'NV-003', 'Hoàng Bảo', 'Bảo vệ', 'Bảo vệ cổng', 'RFID-NV-003', 'UWB-NV-003', 'Chưa tắm', 'e0000000-0000-0000-0000-000000000001');

-- 7. Thêm Thiết bị (FARM-001)
INSERT INTO devices (id, farm_id, device_code, device_name, device_type, installed_zone_id, status) VALUES
('d0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'DEV-001', 'Đầu đọc RFID Cổng 1', 'Đầu đọc RFID', 'e0000000-0000-0000-0000-000000000001', 'Hoạt động'),
('d0000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000001', 'DEV-002', 'UWB Anchor Chuồng Nái 01', 'UWB Anchor', 'e0000000-0000-0000-0000-000000000004', 'Hoạt động'),
('d0000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000001', 'DEV-003', 'Camera AI Cổng', 'Cảm biến cổng', 'e0000000-0000-0000-0000-000000000001', 'Mất tín hiệu');

-- 8. Thêm Cảnh báo (FARM-001)
INSERT INTO alerts (id, farm_id, alert_code, alert_type, severity, message, target_type, target_id, zone_id, status) VALUES
('a0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'ALT-001', 'Chưa sát trùng', 'Cao', 'Xe 93C-67890 đang cố gắng tiến vào Vùng đệm mà chưa được xác nhận sát trùng.', 'VEHICLE', 'b0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000003', 'Chưa xử lý'),
('a0000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000001', 'ALT-002', 'Mất tín hiệu', 'Trung bình', 'Thiết bị Camera AI Cổng (DEV-003) mất kết nối hơn 15 phút.', 'DEVICE', 'd0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000001', 'Chưa xử lý');

-- Lưu ý: Đối với việc đăng nhập trên React Web, bạn cần tạo User thủ công qua Supabase Dashboard (Ví dụ: admin@demo.com) 
-- Sau đó, copy UUID của user đó và chèn vào bảng `user_farms` thông qua giao diện hoặc truy vấn SQL để có quyền truy cập trại.
-- Ví dụ SQL: INSERT INTO user_farms (user_id, farm_id) VALUES ('<USER_UUID_TỪ_AUTH>', 'f0000000-0000-0000-0000-000000000001');
