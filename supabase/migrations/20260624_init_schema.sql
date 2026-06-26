-- Kích hoạt extension PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- ==========================================
-- 1. QUẢN LÝ QUYỀN (RBAC) & NGƯỜI DÙNG
-- ==========================================

CREATE TABLE roles (
    role_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE permissions (
    permission_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    permission_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE role_permissions (
    role_id UUID REFERENCES roles(role_id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(permission_id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    department VARCHAR(100),
    phone VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 2. QUẢN LÝ TRẠI (FARMS)
-- ==========================================

CREATE TABLE farms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_code VARCHAR(50) UNIQUE NOT NULL,
    farm_name VARCHAR(255) NOT NULL,
    location_name VARCHAR(255),
    province VARCHAR(100),
    district VARCHAR(100),
    latitude DECIMAL(10, 6),
    longitude DECIMAL(10, 6),
    biosecurity_level VARCHAR(50) DEFAULT 'Cấp độ trung bình',
    overall_status VARCHAR(50) DEFAULT 'An toàn', -- 'An toàn', 'Cần chú ý', 'Rủi ro cao'
    risk_score INT DEFAULT 0,
    active_alert_count INT DEFAULT 0,
    lost_device_count INT DEFAULT 0,
    vehicles_inside_count INT DEFAULT 0,
    persons_inside_count INT DEFAULT 0,
    cleaning_tasks_today_count INT DEFAULT 0,
    last_updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_farms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(role_id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, farm_id)
);

-- ==========================================
-- 3. QUẢN LÝ VÙNG VÀ CƠ SỞ VẬT CHẤT
-- ==========================================

CREATE TABLE biosecurity_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
    zone_code VARCHAR(50) NOT NULL,
    zone_name VARCHAR(255) NOT NULL,
    zone_type VARCHAR(100), -- 'Vùng cổng', 'Vùng sát trùng xe', 'Vùng đệm', 'Vùng sạch', 'Chuồng nái', 'Vùng cấm'
    risk_level VARCHAR(50), -- 'Thấp', 'Trung bình', 'Cao', 'Nghiêm trọng'
    geom geometry(Polygon, 4326),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_zones_geom ON biosecurity_zones USING GIST (geom);

CREATE TABLE barns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
    zone_id UUID REFERENCES biosecurity_zones(id),
    barn_code VARCHAR(50) NOT NULL,
    barn_name VARCHAR(255) NOT NULL,
    capacity INT
);

-- ==========================================
-- 4. QUẢN LÝ ĐỐI TƯỢNG (XE, NHÂN SỰ)
-- ==========================================

CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
    vehicle_code VARCHAR(50) NOT NULL,
    plate_number VARCHAR(20) NOT NULL,
    vehicle_type VARCHAR(100),
    transport_unit VARCHAR(255),
    driver_name VARCHAR(255),
    driver_phone VARCHAR(20),
    rfid_tag VARCHAR(100),
    gps_device_id VARCHAR(100),
    sanitization_status VARCHAR(50) DEFAULT 'Chưa sát trùng',
    current_status VARCHAR(50) DEFAULT 'Đang hoạt động',
    current_zone_id UUID REFERENCES biosecurity_zones(id),
    last_entry_time TIMESTAMPTZ,
    last_exit_time TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE persons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
    person_code VARCHAR(50) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    department VARCHAR(100),
    person_role VARCHAR(100),
    rfid_card VARCHAR(100),
    uwb_tag VARCHAR(100),
    allowed_zones TEXT[], -- Danh sách zone_code được phép
    shower_status VARCHAR(50) DEFAULT 'Chưa tắm',
    current_status VARCHAR(50) DEFAULT 'Đang làm việc',
    current_zone_id UUID REFERENCES biosecurity_zones(id),
    last_entry_time TIMESTAMPTZ,
    last_exit_time TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 5. QUẢN LÝ THIẾT BỊ IoT
-- ==========================================

CREATE TABLE devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
    device_code VARCHAR(50) NOT NULL,
    device_name VARCHAR(255) NOT NULL,
    device_type VARCHAR(50),
    identifier_code VARCHAR(100),
    installed_zone_id UUID REFERENCES biosecurity_zones(id),
    status VARCHAR(50) DEFAULT 'Hoạt động', -- 'Hoạt động', 'Mất tín hiệu'
    last_signal_time TIMESTAMPTZ DEFAULT NOW(),
    supplier VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 6. THEO DÕI VÀ SỰ KIỆN MÔ PHỎNG
-- ==========================================

CREATE TABLE rfid_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
    device_id UUID REFERENCES devices(id),
    rfid_tag VARCHAR(100),
    read_time TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE gps_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES vehicles(id),
    latitude DECIMAL(10, 6),
    longitude DECIMAL(10, 6),
    geom geometry(Point, 4326),
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE uwb_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
    person_id UUID REFERENCES persons(id),
    zone_id UUID REFERENCES biosecurity_zones(id),
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE entry_exit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
    target_type VARCHAR(20), -- 'VEHICLE', 'PERSON'
    target_id UUID, -- vehicle_id hoặc person_id
    zone_id UUID REFERENCES biosecurity_zones(id),
    action VARCHAR(20), -- 'IN' hoặc 'OUT'
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 7. VỆ SINH & CẢNH BÁO
-- ==========================================

CREATE TABLE cleaning_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
    task_code VARCHAR(50) NOT NULL,
    barn_id UUID REFERENCES barns(id),
    assigned_to UUID REFERENCES persons(id),
    scheduled_date DATE,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    min_duration_minutes INT DEFAULT 30,
    required_routes TEXT[],
    status VARCHAR(50) DEFAULT 'Chưa bắt đầu', -- 'Đang thực hiện', 'Hoàn tất'
    approved_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cleaning_checkpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
    task_id UUID REFERENCES cleaning_tasks(id) ON DELETE CASCADE,
    checkpoint_name VARCHAR(255),
    is_visited BOOLEAN DEFAULT FALSE,
    visited_at TIMESTAMPTZ
);

CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
    alert_code VARCHAR(50),
    alert_type VARCHAR(100), -- 'Vi phạm vùng', 'Mất tín hiệu'
    severity VARCHAR(50), -- 'Thấp', 'Trung bình', 'Cao', 'Nghiêm trọng'
    message TEXT NOT NULL,
    target_type VARCHAR(20), -- 'VEHICLE', 'PERSON', 'DEVICE'
    target_id UUID,
    zone_id UUID REFERENCES biosecurity_zones(id),
    status VARCHAR(50) DEFAULT 'Chưa xử lý', -- 'Chưa xử lý', 'Đã xử lý'
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 8. IMPORT / EXPORT / AUDIT
-- ==========================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id),
    action VARCHAR(100),
    table_name VARCHAR(100),
    record_id UUID,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE import_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
    import_type VARCHAR(50),
    imported_by UUID REFERENCES profiles(id),
    file_url TEXT,
    total_records INT,
    valid_records INT,
    error_records INT,
    status VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE import_errors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
    batch_id UUID REFERENCES import_batches(id) ON DELETE CASCADE,
    row_index INT,
    row_data JSONB,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE export_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
    export_type VARCHAR(50),
    exported_by UUID REFERENCES profiles(id),
    file_url TEXT,
    format VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 9. ROW LEVEL SECURITY (RLS) ĐƠN GIẢN CHO DEMO
-- ==========================================
-- Bật RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE biosecurity_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE entry_exit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE barns ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaning_tasks ENABLE ROW LEVEL SECURITY;

-- Demo: User đã đăng nhập được truy cập. Trong thực tế sẽ lọc kỹ theo farm_id qua bảng user_farms
CREATE POLICY "Public Read All for Authenticated" ON farms FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public Update All for Authenticated" ON farms FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public All for Authenticated" ON user_farms FOR ALL TO authenticated USING (true);
CREATE POLICY "Public All for Authenticated" ON vehicles FOR ALL TO authenticated USING (true);
CREATE POLICY "Public All for Authenticated" ON persons FOR ALL TO authenticated USING (true);
CREATE POLICY "Public All for Authenticated" ON biosecurity_zones FOR ALL TO authenticated USING (true);
CREATE POLICY "Public All for Authenticated" ON entry_exit_logs FOR ALL TO authenticated USING (true);
CREATE POLICY "Public All for Authenticated" ON alerts FOR ALL TO authenticated USING (true);
CREATE POLICY "Public All for Authenticated" ON devices FOR ALL TO authenticated USING (true);
CREATE POLICY "Public All for Authenticated" ON barns FOR ALL TO authenticated USING (true);
CREATE POLICY "Public All for Authenticated" ON cleaning_tasks FOR ALL TO authenticated USING (true);
CREATE POLICY "Public All for Authenticated" ON rfid_events FOR ALL TO authenticated USING (true);
CREATE POLICY "Public All for Authenticated" ON gps_points FOR ALL TO authenticated USING (true);
CREATE POLICY "Public All for Authenticated" ON uwb_positions FOR ALL TO authenticated USING (true);
CREATE POLICY "Public All for Authenticated" ON audit_logs FOR ALL TO authenticated USING (true);
CREATE POLICY "Public All for Authenticated" ON import_batches FOR ALL TO authenticated USING (true);
CREATE POLICY "Public All for Authenticated" ON import_errors FOR ALL TO authenticated USING (true);
CREATE POLICY "Public All for Authenticated" ON export_logs FOR ALL TO authenticated USING (true);
CREATE POLICY "Public All for Authenticated" ON profiles FOR ALL TO authenticated USING (true);

-- (Để giúp việc query trên React nhàn và demo mượt mà, tôi tạm mở quyền ALL cho authenticated. Ở Production, sẽ check user_farms)
