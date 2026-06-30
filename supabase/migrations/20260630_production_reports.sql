-- Bảng 1: Báo cáo tổng quan tuần
CREATE TABLE IF NOT EXISTS production_weekly_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    year INT NOT NULL,
    week_no INT NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_herd INT,
    productive_sows INT,
    gilts INT,
    boars INT,
    batch_888_total INT,
    batch_888_old INT,
    batch_888_new INT,
    feed_sow_total NUMERIC,
    feed_sow_avg_kg_day NUMERIC,
    piglet_feed_total_kg NUMERIC,
    piglet_feed_avg NUMERIC,
    created_by UUID,
    source_type TEXT DEFAULT 'manual',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng 2: Chỉ tiêu & thực tế phối giống
CREATE TABLE IF NOT EXISTS breeding_weekly_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    year INT NOT NULL,
    week_no INT NOT NULL,
    target_count NUMERIC,
    plan_count INT,
    actual_count INT,
    from_weaned_sows INT,
    from_gilts INT,
    problem_sows INT,
    delta_vs_target NUMERIC,
    actual_rate NUMERIC,
    next_week_plan INT
);

-- Bảng 3: Chỉ tiêu đẻ & sơ sinh
CREATE TABLE IF NOT EXISTS farrowing_weekly_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    year INT NOT NULL,
    week_no INT NOT NULL,
    farrowed_sows INT,
    total_born INT,
    born_per_sow NUMERIC,
    stillborn_count INT,
    stillborn_rate NUMERIC,
    liveborn_count INT,
    liveborn_per_sow NUMERIC
);

-- Bảng 4: Heo con chết
CREATE TABLE IF NOT EXISTS piglet_mortality_weekly (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    year INT NOT NULL,
    week_no INT NOT NULL,
    dead_under_sow INT,
    dead_under_sow_rate NUMERIC,
    dead_after_weaning INT,
    dead_after_weaning_rate NUMERIC,
    hb_return_dead INT,
    total_dead INT,
    total_dead_rate NUMERIC
);

-- Bảng 5: Xuất heo cai sữa
CREATE TABLE IF NOT EXISTS piglet_export_weekly (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    year INT NOT NULL,
    week_no INT NOT NULL,
    export_plan INT,
    export_actual INT,
    export_balance INT,
    avg_weight NUMERIC,
    ending_inventory INT,
    monthly_export_total INT,
    recipient_farm TEXT,
    ticket_no TEXT,
    note TEXT
);

-- Bảng 6: Kế hoạch tuần tới
CREATE TABLE IF NOT EXISTS next_week_production_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    year INT NOT NULL,
    base_week_no INT NOT NULL,
    plan_week_no INT NOT NULL,
    export_plan INT,
    export_schedule_text TEXT,
    farrowing_sows_plan INT,
    liveborn_forecast NUMERIC,
    piglet_death_forecast INT,
    breeding_cs_plan INT,
    breeding_gilt_plan INT,
    breeding_problem_plan INT,
    breeding_total_plan INT,
    import_gilt_plan INT,
    cull_plan INT
);

-- Bảng 7: Kế hoạch cám
CREATE TABLE IF NOT EXISTS feed_order_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    year INT NOT NULL,
    week_no INT NOT NULL,
    order_date DATE,
    manager_name TEXT,
    vehicle_plate TEXT,
    farm_code TEXT,
    farm_group TEXT,
    feed_mill TEXT,
    transporter TEXT,
    product_code TEXT,
    product_name TEXT,
    bag_size_kg NUMERIC,
    bags NUMERIC,
    total_kg NUMERIC,
    po_no TEXT,
    note TEXT,
    biosecurity_check_status TEXT DEFAULT 'pending'
);

-- Bảng 8: Đăng ký loại heo
CREATE TABLE IF NOT EXISTS cull_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    ear_tag TEXT NOT NULL,
    parity INT,
    animal_type TEXT,
    cull_reason TEXT,
    problem_date DATE,
    batch_888_date DATE,
    status TEXT DEFAULT 'Draft',
    created_by UUID,
    approved_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng 9: Báo cáo tổng hợp loại heo
CREATE TABLE IF NOT EXISTS cull_weekly_summary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    year INT NOT NULL,
    week_no INT NOT NULL,
    reason TEXT NOT NULL,
    boar_count INT DEFAULT 0,
    gilt_count INT DEFAULT 0,
    w1_count INT DEFAULT 0,
    w2_count INT DEFAULT 0,
    w3_count INT DEFAULT 0,
    w4_count INT DEFAULT 0,
    w5_count INT DEFAULT 0,
    w6_count INT DEFAULT 0,
    w7_plus_count INT DEFAULT 0,
    total_count INT DEFAULT 0
);

-- Bảng 10: Kế hoạch vaccine
CREATE TABLE IF NOT EXISTS vaccine_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    year INT NOT NULL,
    animal_group TEXT,
    cohort_week INT,
    quantity INT,
    vaccine_type TEXT,
    planned_week INT,
    actual_week INT,
    status TEXT DEFAULT 'Planned',
    note TEXT
);

-- Bảng 11: Lô hậu bị nhập (để theo dõi survival / breeding rate)
CREATE TABLE IF NOT EXISTS gilt_replacement_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    year INT NOT NULL,
    import_month INT,
    import_week INT,
    quantity INT,
    avg_import_age NUMERIC,
    source_farm TEXT,
    dead_count INT DEFAULT 0,
    dead_rate NUMERIC,
    cull_count INT DEFAULT 0,
    cull_rate NUMERIC,
    bred_count INT DEFAULT 0,
    bred_rate NUMERIC,
    avg_breeding_age NUMERIC,
    remaining_count INT,
    note TEXT
);

-- Bảng 12: Lộ trình tăng đàn
CREATE TABLE IF NOT EXISTS herd_growth_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    year INT NOT NULL,
    week_no INT NOT NULL,
    target_scale INT,
    target_productive_sows INT,
    actual_productive_sows INT,
    sow_increase INT,
    current_gilts INT,
    gilt_increase INT,
    total_herd INT,
    total_herd_increase INT,
    target_achievement_rate NUMERIC,
    import_gilt INT,
    bred_sows INT
);

-- Bảng 13: Cấu hình chuẩn / Chỉ tiêu sản xuất
CREATE TABLE IF NOT EXISTS production_targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    year INT NOT NULL,
    metric_code TEXT NOT NULL,
    metric_name TEXT NOT NULL,
    std_value NUMERIC,
    unit TEXT,
    direction TEXT, -- higher_is_better, lower_is_better, target_range
    warning_threshold NUMERIC,
    critical_threshold NUMERIC
);

-- Bảng 14: Báo cáo Insight / Cảnh báo sinh tự động
CREATE TABLE IF NOT EXISTS production_smart_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    year INT NOT NULL,
    week_no INT NOT NULL,
    severity TEXT NOT NULL, -- good, info, warning, critical
    category TEXT, -- production, breeding, mortality, feed, export, vaccine, biosecurity
    title TEXT NOT NULL,
    description TEXT,
    recommended_action TEXT,
    related_metric TEXT,
    related_task_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- RLS POLICIES FOR DEMO (Public All for Authenticated)
-- ==========================================

CREATE POLICY "Public All for Authenticated" ON production_weekly_reports FOR ALL TO authenticated USING (true);
CREATE POLICY "Public All for Authenticated" ON breeding_weekly_metrics FOR ALL TO authenticated USING (true);
CREATE POLICY "Public All for Authenticated" ON farrowing_weekly_metrics FOR ALL TO authenticated USING (true);
CREATE POLICY "Public All for Authenticated" ON piglet_mortality_weekly FOR ALL TO authenticated USING (true);
CREATE POLICY "Public All for Authenticated" ON piglet_export_weekly FOR ALL TO authenticated USING (true);
CREATE POLICY "Public All for Authenticated" ON next_week_production_plans FOR ALL TO authenticated USING (true);
CREATE POLICY "Public All for Authenticated" ON feed_order_plans FOR ALL TO authenticated USING (true);
CREATE POLICY "Public All for Authenticated" ON cull_registrations FOR ALL TO authenticated USING (true);
CREATE POLICY "Public All for Authenticated" ON cull_weekly_summary FOR ALL TO authenticated USING (true);
CREATE POLICY "Public All for Authenticated" ON vaccine_schedules FOR ALL TO authenticated USING (true);
CREATE POLICY "Public All for Authenticated" ON gilt_replacement_batches FOR ALL TO authenticated USING (true);
CREATE POLICY "Public All for Authenticated" ON herd_growth_plans FOR ALL TO authenticated USING (true);
CREATE POLICY "Public All for Authenticated" ON production_targets FOR ALL TO authenticated USING (true);
CREATE POLICY "Public All for Authenticated" ON production_smart_insights FOR ALL TO authenticated USING (true);
