-- Bảng lưu trữ lịch sử điểm rủi ro và các chỉ số tổng thể của trại
CREATE TABLE IF NOT EXISTS report_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL,
  report_date DATE NOT NULL DEFAULT CURRENT_DATE,
  risk_score INT NOT NULL,
  risk_level TEXT NOT NULL,
  total_critical_alerts INT DEFAULT 0,
  total_high_alerts INT DEFAULT 0,
  vehicle_risk_events INT DEFAULT 0,
  people_risk_events INT DEFAULT 0,
  device_offline_count INT DEFAULT 0,
  cleaning_overdue_count INT DEFAULT 0,
  supply_violation_count INT DEFAULT 0,
  scenario_run_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(farm_id, report_date, scenario_run_id)
);

-- Bảng lưu trữ SLA xử lý cảnh báo
CREATE TABLE IF NOT EXISTS alert_sla_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID NOT NULL,
  farm_id UUID NOT NULL,
  alert_severity TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  sla_deadline TIMESTAMPTZ NOT NULL,
  is_overdue BOOLEAN DEFAULT FALSE,
  resolution_time_minutes INT,
  scenario_run_id TEXT
);

-- Bảng nhật ký di chuyển (Traceability)
CREATE TABLE IF NOT EXISTS movement_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL,
  entity_type TEXT NOT NULL, -- 'vehicle', 'person', 'supply', 'tool'
  entity_id TEXT NOT NULL,
  entity_name TEXT NOT NULL,
  from_zone TEXT,
  to_zone TEXT NOT NULL,
  is_authorized BOOLEAN DEFAULT TRUE,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  scenario_run_id TEXT
);

-- Bảng tuân thủ sát trùng
CREATE TABLE IF NOT EXISTS disinfection_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL,
  entity_type TEXT NOT NULL, -- 'vehicle', 'person', 'supply', 'tool'
  entity_id TEXT NOT NULL,
  disinfection_type TEXT, -- 'shower', 'spray', 'uv', 'ozone'
  is_passed BOOLEAN DEFAULT TRUE,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  scenario_run_id TEXT
);

-- Bảng công việc vệ sinh (Cleaning)
CREATE TABLE IF NOT EXISTS cleaning_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL,
  target_zone TEXT NOT NULL,
  task_name TEXT NOT NULL,
  assigned_to TEXT,
  scheduled_time TIMESTAMPTZ NOT NULL,
  completed_time TIMESTAMPTZ,
  status TEXT DEFAULT 'Pending', -- 'Pending', 'Completed', 'Overdue'
  evidence_url TEXT,
  scenario_run_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng log tình trạng thiết bị (Device Health)
CREATE TABLE IF NOT EXISTS device_health_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL,
  device_id TEXT NOT NULL,
  device_name TEXT NOT NULL,
  status TEXT NOT NULL, -- 'Offline', 'Online', 'Low Battery'
  offline_duration_minutes INT DEFAULT 0,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  scenario_run_id TEXT
);

-- Bảng báo cáo nguyên nhân gốc rễ (Incident Root Cause)
CREATE TABLE IF NOT EXISTS incident_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL,
  alert_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  related_entity_type TEXT,
  related_entity_id TEXT,
  root_cause TEXT,
  corrective_action TEXT,
  preventive_action TEXT,
  status TEXT DEFAULT 'Open', -- 'Open', 'Investigating', 'Closed'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  scenario_run_id TEXT
);

-- Bảng quản lý lô vật tư (Supply Batches)
CREATE TABLE IF NOT EXISTS supply_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL,
  batch_code TEXT NOT NULL,
  supply_type TEXT NOT NULL,
  supplier_name TEXT,
  status TEXT DEFAULT 'Pending', -- 'Pending', 'Approved', 'Quarantined', 'Rejected'
  target_zone TEXT,
  received_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  approved_by TEXT,
  scenario_run_id TEXT
);

-- Bảng tính điểm rủi ro theo khu vực (Zone Risk Scores)
CREATE TABLE IF NOT EXISTS zone_risk_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL,
  zone_id TEXT NOT NULL,
  zone_name TEXT NOT NULL,
  risk_score INT DEFAULT 0,
  violation_count INT DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  scenario_run_id TEXT
);

-- Bảng benchmark giữa các trại
CREATE TABLE IF NOT EXISTS farm_benchmark_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL,
  report_date DATE NOT NULL DEFAULT CURRENT_DATE,
  ranking_position INT,
  average_resolution_time INT,
  cleaning_compliance_rate FLOAT,
  disinfection_compliance_rate FLOAT,
  device_uptime_rate FLOAT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(farm_id, report_date)
);
