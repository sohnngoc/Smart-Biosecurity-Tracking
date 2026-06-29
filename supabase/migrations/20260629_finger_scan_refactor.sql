-- Migration: Finger Scan & Work Assignment Refactor
-- Date: 2026-06-29

-- 1. HR & Permissions
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
    employee_code VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    department VARCHAR(100),
    job_title VARCHAR(100),
    phone VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS employee_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    role_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS employee_fingerprints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    fingerprint_hash VARCHAR(255) NOT NULL,
    device_id UUID, -- Optional: enrolled device
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    leave_date DATE NOT NULL,
    leave_type VARCHAR(50), -- sick, vacation, personal
    status VARCHAR(50) DEFAULT 'approved',
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Zones & Checkpoints
CREATE TABLE IF NOT EXISTS farm_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
    zone_name VARCHAR(100) NOT NULL,
    zone_type VARCHAR(50), -- isolation, production, living, warehouse
    risk_level VARCHAR(50) DEFAULT 'normal', -- normal, sensitive, isolation, critical
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS barns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zone_id UUID REFERENCES farm_zones(id) ON DELETE CASCADE,
    barn_name VARCHAR(100) NOT NULL,
    barn_type VARCHAR(50), -- farrowing, gestation, nursery
    capacity INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS checkpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
    checkpoint_name VARCHAR(100) NOT NULL,
    checkpoint_type VARCHAR(50), -- gate, shower, barn_door, warehouse, isolation
    zone_id UUID REFERENCES farm_zones(id) ON DELETE SET NULL,
    barn_id UUID REFERENCES barns(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shower_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    checkpoint_id UUID REFERENCES checkpoints(id) ON DELETE CASCADE,
    room_name VARCHAR(50),
    max_capacity INT DEFAULT 5,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Devices
CREATE TABLE IF NOT EXISTS finger_scan_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
    checkpoint_id UUID REFERENCES checkpoints(id) ON DELETE SET NULL,
    device_name VARCHAR(100) NOT NULL,
    device_serial VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'online', -- online, offline, error, maintenance
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    firmware_version VARCHAR(50),
    battery_level INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Entry Requests (Vet, Guests, Contractors)
CREATE TABLE IF NOT EXISTS farm_entry_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
    requester_name VARCHAR(255) NOT NULL,
    department VARCHAR(100),
    visitor_type VARCHAR(50), -- vet, guest, contractor, internal
    phone VARCHAR(20),
    plate_number VARCHAR(20),
    entry_date DATE NOT NULL,
    session_type VARCHAR(50), -- morning, afternoon, full_day
    purpose TEXT,
    zones_requested TEXT[],
    needs_isolation_access BOOLEAN DEFAULT FALSE,
    swab_result VARCHAR(50), -- yes, no, pending
    swab_attachment_url TEXT,
    contact_person VARCHAR(100),
    notes TEXT,
    status VARCHAR(50) DEFAULT 'submitted', -- draft, submitted, approved, rejected, checked_in, completed
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS farm_entry_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES farm_entry_requests(id) ON DELETE CASCADE,
    approver_id UUID,
    status VARCHAR(50) NOT NULL, -- approved, rejected
    reason TEXT,
    zones_approved TEXT[],
    valid_until TIMESTAMPTZ,
    high_risk_flag BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Work Assignment
CREATE TABLE IF NOT EXISTS daily_work_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
    plan_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'draft', -- draft, published, locked
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(farm_id, plan_date)
);

CREATE TABLE IF NOT EXISTS assigned_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID REFERENCES daily_work_plans(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    task_category VARCHAR(100), -- farrowing, gestation, vet, disinfection, maintenance
    zone_id UUID REFERENCES farm_zones(id) ON DELETE SET NULL,
    barn_id UUID REFERENCES barns(id) ON DELETE SET NULL,
    checkpoint_id UUID REFERENCES checkpoints(id) ON DELETE SET NULL, -- specific door or warehouse
    shift VARCHAR(50), -- day, night
    assigned_shower_id UUID REFERENCES shower_rooms(id) ON DELETE SET NULL,
    task_description TEXT,
    biosecurity_level VARCHAR(50) DEFAULT 'normal', -- normal, sensitive, isolation, critical
    expected_start TIMESTAMPTZ,
    expected_end TIMESTAMPTZ,
    status VARCHAR(50) DEFAULT 'assigned', -- assigned, in_progress, completed, overdue, cancelled
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS task_report_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES assigned_tasks(id) ON DELETE CASCADE,
    submitted_by UUID REFERENCES employees(id) ON DELETE SET NULL,
    report_data JSONB NOT NULL, -- Flexible structure based on role
    issue_flag BOOLEAN DEFAULT FALSE,
    issue_description TEXT,
    photo_urls TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Access Control & Finger Scan
CREATE TABLE IF NOT EXISTS finger_scan_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
    device_id UUID REFERENCES finger_scan_devices(id) ON DELETE SET NULL,
    checkpoint_id UUID REFERENCES checkpoints(id) ON DELETE SET NULL,
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    scan_time TIMESTAMPTZ DEFAULT NOW(),
    decision VARCHAR(50), -- allow, deny, warning
    reason TEXT,
    risk_level VARCHAR(50),
    door_opened BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Biosecurity
CREATE TABLE IF NOT EXISTS biosecurity_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
    alert_type VARCHAR(100) NOT NULL, -- wrong_shower, skipped_shower, wrong_barn, isolation_breach, unauthorized_warehouse, etc.
    severity VARCHAR(50) NOT NULL, -- low, medium, high, critical
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    checkpoint_id UUID REFERENCES checkpoints(id) ON DELETE SET NULL,
    task_id UUID REFERENCES assigned_tasks(id) ON DELETE SET NULL,
    scan_log_id UUID REFERENCES finger_scan_logs(id) ON DELETE SET NULL,
    description TEXT,
    suggested_action TEXT,
    status VARCHAR(50) DEFAULT 'open', -- open, acknowledged, resolved, dismissed
    resolved_by UUID,
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS biosecurity_score_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
    log_date DATE NOT NULL,
    score INT NOT NULL, -- 0-100
    rating VARCHAR(50), -- excellent, good, warning, high_risk, critical
    factors JSONB, -- what caused the score to drop/increase
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_fingerprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE barns ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE shower_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE finger_scan_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_entry_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_entry_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_work_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE assigned_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_report_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE finger_scan_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE biosecurity_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE biosecurity_score_logs ENABLE ROW LEVEL SECURITY;

-- Create basic policies (Allow all for anon in MVP for easy demo)
CREATE POLICY "Allow anon select on employees" ON employees FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert on employees" ON employees FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update on employees" ON employees FOR UPDATE TO anon USING (true);

-- (Repeat basic policies for other tables if necessary for demo)
-- For MVP demo, disable RLS to avoid access blocks if prefered, or create generous policies.
-- I'll keep RLS enabled but allow anon/authenticated full access for demo simplicity.

-- Add generous policies for all new tables
CREATE POLICY "Allow all on employee_roles" ON employee_roles FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on employee_fingerprints" ON employee_fingerprints FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on leave_requests" ON leave_requests FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on farm_zones" ON farm_zones FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on barns" ON barns FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on checkpoints" ON checkpoints FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on shower_rooms" ON shower_rooms FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on finger_scan_devices" ON finger_scan_devices FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on farm_entry_requests" ON farm_entry_requests FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on farm_entry_approvals" ON farm_entry_approvals FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on daily_work_plans" ON daily_work_plans FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on assigned_tasks" ON assigned_tasks FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on task_report_submissions" ON task_report_submissions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on finger_scan_logs" ON finger_scan_logs FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on biosecurity_alerts" ON biosecurity_alerts FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on biosecurity_score_logs" ON biosecurity_score_logs FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
