-- ==========================================
-- BỔ SUNG CÁC BẢNG & CỘT CHO MÔ PHỎNG RỦI RO (RISK SIMULATION)
-- ==========================================

-- 1. Bảng Quản lý Lịch sử Chạy Mô phỏng (Simulation Runs)
CREATE TABLE simulation_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
    scenario_code VARCHAR(50) NOT NULL,
    scenario_name VARCHAR(255) NOT NULL,
    run_status VARCHAR(50) DEFAULT 'Running', -- 'Running', 'Completed', 'Reset'
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    created_by UUID REFERENCES profiles(id),
    notes TEXT
);

-- 2. Bảng Theo dõi Biến động Điểm Rủi ro (Risk Score Logs)
CREATE TABLE risk_score_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
    scenario_run_id UUID REFERENCES simulation_runs(id) ON DELETE CASCADE,
    risk_score_before INT NOT NULL,
    risk_score_after INT NOT NULL,
    risk_level VARCHAR(50), -- 'Safe', 'Warning', 'High Risk', 'Critical'
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Bảng Quản lý Lô Vật tư / Thức ăn / Dụng cụ
CREATE TABLE supply_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
    supply_type VARCHAR(50), -- 'feed', 'tool', 'medicine', 'equipment', 'other'
    supplier_name VARCHAR(255),
    qr_code_or_rfid VARCHAR(100),
    current_zone_id UUID REFERENCES biosecurity_zones(id),
    approval_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'missing'
    disinfection_status VARCHAR(50) DEFAULT 'not_completed', -- 'not_completed', 'completed'
    received_at TIMESTAMPTZ DEFAULT NOW(),
    moved_by_person_id UUID REFERENCES persons(id)
);

-- 4. Bổ sung cột cho các bảng hiện tại
-- Thêm liên kết kịch bản cho Cảnh báo (alerts)
ALTER TABLE alerts
ADD COLUMN IF NOT EXISTS scenario_run_id UUID REFERENCES simulation_runs(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS recommended_action TEXT;

-- Bảng cleaning_tasks: Thêm cột số lần vệ sinh yêu cầu/thực tế (Scenario 4)
ALTER TABLE cleaning_tasks
ADD COLUMN IF NOT EXISTS required_cleaning_count INT DEFAULT 1,
ADD COLUMN IF NOT EXISTS actual_cleaning_count INT DEFAULT 0;

-- Bảng vehicles: Bổ sung current_zone nếu chưa có (đã có current_zone_id), thêm disinfection_status
ALTER TABLE vehicles
ADD COLUMN IF NOT EXISTS disinfection_status VARCHAR(50) DEFAULT 'pending';

-- Bảng persons: Bổ sung biosecurity_clearance_status
ALTER TABLE persons
ADD COLUMN IF NOT EXISTS biosecurity_clearance_status VARCHAR(50) DEFAULT 'not_cleared';

-- Bảng devices: Bổ sung offline_duration_minutes
ALTER TABLE devices
ADD COLUMN IF NOT EXISTS offline_duration_minutes INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS blind_spot_area VARCHAR(255);

-- 5. Cấp quyền RLS cho các bảng mới (Demo: Mở ALL cho authenticated)
ALTER TABLE simulation_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_score_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE supply_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public All for Authenticated" ON simulation_runs FOR ALL TO authenticated USING (true);
CREATE POLICY "Public All for Authenticated" ON risk_score_logs FOR ALL TO authenticated USING (true);
CREATE POLICY "Public All for Authenticated" ON supply_batches FOR ALL TO authenticated USING (true);
