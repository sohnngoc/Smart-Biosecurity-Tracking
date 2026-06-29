DO $$
DECLARE
    v_farm_id UUID;
    v_zone_cong UUID;
    v_zone_tam UUID;
    v_zone_kho UUID;
    v_zone_de UUID;
    v_zone_bau UUID;
    v_zone_cach_ly UUID;
    
    v_barn_cong UUID;
    v_barn_tam1 UUID; v_barn_tam2 UUID; v_barn_tam3 UUID; v_barn_tam4 UUID; v_barn_tam5 UUID;
    v_barn_khothuoc UUID; v_barn_khocam UUID;
    v_barn_de1 UUID; v_barn_de2 UUID; v_barn_de3 UUID;
    v_barn_bau1 UUID; v_barn_bau2 UUID;
    v_barn_cl1 UUID; v_barn_cl2 UUID; v_barn_hbcl UUID;

    v_shower_tam1 UUID; v_shower_tam2 UUID; v_shower_tam3 UUID; v_shower_tam4 UUID; v_shower_tam5 UUID;

    v_emp_vet UUID;
    v_emp_cn_de UUID;
    v_emp_cn_bau UUID;
    v_emp_cn_cach_ly UUID;
    v_emp_admin UUID;
    
    v_plan_id UUID;
    v_req_id UUID;
BEGIN
    SELECT id INTO v_farm_id FROM farms ORDER BY farm_code ASC LIMIT 1;
    
    -- Clean up existing data for a fresh demo state
    DELETE FROM biosecurity_alerts WHERE farm_id = v_farm_id;
    DELETE FROM finger_scan_logs WHERE farm_id = v_farm_id;
    DELETE FROM assigned_tasks;
    DELETE FROM daily_work_plans WHERE farm_id = v_farm_id;
    DELETE FROM farm_entry_approvals;
    DELETE FROM farm_entry_requests WHERE farm_id = v_farm_id;
    DELETE FROM finger_scan_devices WHERE farm_id = v_farm_id;
    DELETE FROM shower_rooms;
    DELETE FROM checkpoints WHERE farm_id = v_farm_id;
    DELETE FROM barns WHERE farm_id = v_farm_id;
    DELETE FROM biosecurity_zones WHERE farm_id = v_farm_id;
    DELETE FROM farm_zones WHERE farm_id = v_farm_id;
    DELETE FROM employees WHERE farm_id = v_farm_id;

    -- 1. ZONES (Insert to both farm_zones and biosecurity_zones to satisfy messy foreign keys)
    
    -- Cổng
    INSERT INTO farm_zones (farm_id, zone_name, zone_type, risk_level) VALUES (v_farm_id, 'Khu Vực Cổng', 'external', 'low') RETURNING id INTO v_zone_cong;
    INSERT INTO biosecurity_zones (id, farm_id, zone_code, zone_name, zone_type, risk_level, is_active) VALUES (v_zone_cong, v_farm_id, 'Z_CONG', 'Khu Vực Cổng', 'external', 'low', true);

    -- Tắm
    INSERT INTO farm_zones (farm_id, zone_name, zone_type, risk_level) VALUES (v_farm_id, 'Khu Vực Tắm/Sát Trùng', 'sanitation', 'low') RETURNING id INTO v_zone_tam;
    INSERT INTO biosecurity_zones (id, farm_id, zone_code, zone_name, zone_type, risk_level, is_active) VALUES (v_zone_tam, v_farm_id, 'Z_TAM', 'Khu Vực Tắm/Sát Trùng', 'sanitation', 'low', true);

    -- Kho
    INSERT INTO farm_zones (farm_id, zone_name, zone_type, risk_level) VALUES (v_farm_id, 'Khu Vực Kho', 'warehouse', 'medium') RETURNING id INTO v_zone_kho;
    INSERT INTO biosecurity_zones (id, farm_id, zone_code, zone_name, zone_type, risk_level, is_active) VALUES (v_zone_kho, v_farm_id, 'Z_KHO', 'Khu Vực Kho', 'warehouse', 'medium', true);

    -- Đẻ
    INSERT INTO farm_zones (farm_id, zone_name, zone_type, risk_level) VALUES (v_farm_id, 'Khu Vực Chuồng Đẻ', 'farrowing', 'high') RETURNING id INTO v_zone_de;
    INSERT INTO biosecurity_zones (id, farm_id, zone_code, zone_name, zone_type, risk_level, is_active) VALUES (v_zone_de, v_farm_id, 'Z_DE', 'Khu Vực Chuồng Đẻ', 'farrowing', 'high', true);

    -- Bầu
    INSERT INTO farm_zones (farm_id, zone_name, zone_type, risk_level) VALUES (v_farm_id, 'Khu Vực Chuồng Bầu', 'gestation', 'high') RETURNING id INTO v_zone_bau;
    INSERT INTO biosecurity_zones (id, farm_id, zone_code, zone_name, zone_type, risk_level, is_active) VALUES (v_zone_bau, v_farm_id, 'Z_BAU', 'Khu Vực Chuồng Bầu', 'gestation', 'high', true);

    -- Cách Ly
    INSERT INTO farm_zones (farm_id, zone_name, zone_type, risk_level) VALUES (v_farm_id, 'Khu Vực Cách Ly', 'isolation', 'critical') RETURNING id INTO v_zone_cach_ly;
    INSERT INTO biosecurity_zones (id, farm_id, zone_code, zone_name, zone_type, risk_level, is_active) VALUES (v_zone_cach_ly, v_farm_id, 'Z_CACH_LY', 'Khu Vực Cách Ly', 'isolation', 'critical', true);

    -- 2. BARNS & CHECKPOINTS & DEVICES (Total 24 Devices)
    -- schema: barns(id, farm_id, zone_id, barn_code, barn_name, capacity)
    -- schema: checkpoints(id, farm_id, checkpoint_name, checkpoint_type, zone_id, barn_id)
    -- schema: finger_scan_devices(id, farm_id, checkpoint_id, device_name, device_serial, status)
    
    -- Cổng (1)
    INSERT INTO barns (farm_id, zone_id, barn_code, barn_name, capacity) VALUES (v_farm_id, v_zone_cong, 'B_CONG', 'Cổng Trại', 10) RETURNING id INTO v_barn_cong;
    INSERT INTO checkpoints (farm_id, zone_id, barn_id, checkpoint_name, checkpoint_type) VALUES (v_farm_id, v_zone_cong, v_barn_cong, 'Cổng Chính', 'gate') RETURNING id INTO v_req_id;
    INSERT INTO finger_scan_devices (farm_id, checkpoint_id, device_name, device_serial, status) VALUES (v_farm_id, v_req_id, 'FS-Cổng', '00:11:22:33:01', 'online');

    -- Tắm 1-5 (5)
    INSERT INTO barns (farm_id, zone_id, barn_code, barn_name, capacity) VALUES (v_farm_id, v_zone_tam, 'B_TAM1', 'Phòng Tắm 1', 1) RETURNING id INTO v_barn_tam1;
    INSERT INTO checkpoints (farm_id, zone_id, barn_id, checkpoint_name, checkpoint_type) VALUES (v_farm_id, v_zone_tam, v_barn_tam1, 'Cửa Tắm 1', 'shower') RETURNING id INTO v_req_id;
    INSERT INTO shower_rooms (checkpoint_id, room_name, max_capacity) VALUES (v_req_id, 'Phòng Tắm 1', 1) RETURNING id INTO v_shower_tam1;
    INSERT INTO finger_scan_devices (farm_id, checkpoint_id, device_name, device_serial, status) VALUES (v_farm_id, v_req_id, 'FS-T1', '00:11:22:33:T1', 'online');

    INSERT INTO barns (farm_id, zone_id, barn_code, barn_name, capacity) VALUES (v_farm_id, v_zone_tam, 'B_TAM2', 'Phòng Tắm 2', 1) RETURNING id INTO v_barn_tam2;
    INSERT INTO checkpoints (farm_id, zone_id, barn_id, checkpoint_name, checkpoint_type) VALUES (v_farm_id, v_zone_tam, v_barn_tam2, 'Cửa Tắm 2', 'shower') RETURNING id INTO v_req_id;
    INSERT INTO shower_rooms (checkpoint_id, room_name, max_capacity) VALUES (v_req_id, 'Phòng Tắm 2', 1) RETURNING id INTO v_shower_tam2;
    INSERT INTO finger_scan_devices (farm_id, checkpoint_id, device_name, device_serial, status) VALUES (v_farm_id, v_req_id, 'FS-T2', '00:11:22:33:T2', 'online');

    INSERT INTO barns (farm_id, zone_id, barn_code, barn_name, capacity) VALUES (v_farm_id, v_zone_tam, 'B_TAM3', 'Phòng Tắm 3', 1) RETURNING id INTO v_barn_tam3;
    INSERT INTO checkpoints (farm_id, zone_id, barn_id, checkpoint_name, checkpoint_type) VALUES (v_farm_id, v_zone_tam, v_barn_tam3, 'Cửa Tắm 3', 'shower') RETURNING id INTO v_req_id;
    INSERT INTO shower_rooms (checkpoint_id, room_name, max_capacity) VALUES (v_req_id, 'Phòng Tắm 3', 1) RETURNING id INTO v_shower_tam3;
    INSERT INTO finger_scan_devices (farm_id, checkpoint_id, device_name, device_serial, status) VALUES (v_farm_id, v_req_id, 'FS-T3', '00:11:22:33:T3', 'online');

    INSERT INTO barns (farm_id, zone_id, barn_code, barn_name, capacity) VALUES (v_farm_id, v_zone_tam, 'B_TAM4', 'Phòng Tắm 4', 1) RETURNING id INTO v_barn_tam4;
    INSERT INTO checkpoints (farm_id, zone_id, barn_id, checkpoint_name, checkpoint_type) VALUES (v_farm_id, v_zone_tam, v_barn_tam4, 'Cửa Tắm 4', 'shower') RETURNING id INTO v_req_id;
    INSERT INTO shower_rooms (checkpoint_id, room_name, max_capacity) VALUES (v_req_id, 'Phòng Tắm 4', 1) RETURNING id INTO v_shower_tam4;
    INSERT INTO finger_scan_devices (farm_id, checkpoint_id, device_name, device_serial, status) VALUES (v_farm_id, v_req_id, 'FS-T4', '00:11:22:33:T4', 'online');

    INSERT INTO barns (farm_id, zone_id, barn_code, barn_name, capacity) VALUES (v_farm_id, v_zone_tam, 'B_TAM5', 'Phòng Tắm 5', 1) RETURNING id INTO v_barn_tam5;
    INSERT INTO checkpoints (farm_id, zone_id, barn_id, checkpoint_name, checkpoint_type) VALUES (v_farm_id, v_zone_tam, v_barn_tam5, 'Cửa Tắm 5', 'shower') RETURNING id INTO v_req_id;
    INSERT INTO shower_rooms (checkpoint_id, room_name, max_capacity) VALUES (v_req_id, 'Phòng Tắm 5', 1) RETURNING id INTO v_shower_tam5;
    INSERT INTO finger_scan_devices (farm_id, checkpoint_id, device_name, device_serial, status) VALUES (v_farm_id, v_req_id, 'FS-T5', '00:11:22:33:T5', 'online');

    -- Kho thuốc, Kho cám (2)
    INSERT INTO barns (farm_id, zone_id, barn_code, barn_name, capacity) VALUES (v_farm_id, v_zone_kho, 'B_KTHUOC', 'Kho Thuốc', 5) RETURNING id INTO v_barn_khothuoc;
    INSERT INTO checkpoints (farm_id, zone_id, barn_id, checkpoint_name, checkpoint_type) VALUES (v_farm_id, v_zone_kho, v_barn_khothuoc, 'Cửa Kho Thuốc', 'barn_door') RETURNING id INTO v_req_id;
    INSERT INTO finger_scan_devices (farm_id, checkpoint_id, device_name, device_serial, status) VALUES (v_farm_id, v_req_id, 'FS-K.Thuốc', '00:11:22:33:K1', 'online');

    INSERT INTO barns (farm_id, zone_id, barn_code, barn_name, capacity) VALUES (v_farm_id, v_zone_kho, 'B_KCAM', 'Kho Cám', 5) RETURNING id INTO v_barn_khocam;
    INSERT INTO checkpoints (farm_id, zone_id, barn_id, checkpoint_name, checkpoint_type) VALUES (v_farm_id, v_zone_kho, v_barn_khocam, 'Cửa Kho Cám', 'barn_door') RETURNING id INTO v_req_id;
    INSERT INTO finger_scan_devices (farm_id, checkpoint_id, device_name, device_serial, status) VALUES (v_farm_id, v_req_id, 'FS-K.Cám', '00:11:22:33:K2', 'online');

    -- Chuồng Đẻ 1, 2, 3 (mỗi chuồng 2 thiết bị) (6)
    INSERT INTO barns (farm_id, zone_id, barn_code, barn_name, capacity) VALUES (v_farm_id, v_zone_de, 'B_DE1', 'Chuồng Đẻ 1', 50) RETURNING id INTO v_barn_de1;
    INSERT INTO checkpoints (farm_id, zone_id, barn_id, checkpoint_name, checkpoint_type) VALUES (v_farm_id, v_zone_de, v_barn_de1, 'Đẻ 1 - Cửa Vào', 'barn_door') RETURNING id INTO v_req_id;
    INSERT INTO finger_scan_devices (farm_id, checkpoint_id, device_name, device_serial, status) VALUES (v_farm_id, v_req_id, 'FS-Đ1-Vào', '00:11:D1:IN', 'online');
    INSERT INTO checkpoints (farm_id, zone_id, barn_id, checkpoint_name, checkpoint_type) VALUES (v_farm_id, v_zone_de, v_barn_de1, 'Đẻ 1 - Cửa Ra', 'barn_door') RETURNING id INTO v_req_id;
    INSERT INTO finger_scan_devices (farm_id, checkpoint_id, device_name, device_serial, status) VALUES (v_farm_id, v_req_id, 'FS-Đ1-Ra', '00:11:D1:OUT', 'online');

    INSERT INTO barns (farm_id, zone_id, barn_code, barn_name, capacity) VALUES (v_farm_id, v_zone_de, 'B_DE2', 'Chuồng Đẻ 2', 50) RETURNING id INTO v_barn_de2;
    INSERT INTO checkpoints (farm_id, zone_id, barn_id, checkpoint_name, checkpoint_type) VALUES (v_farm_id, v_zone_de, v_barn_de2, 'Đẻ 2 - Cửa Vào', 'barn_door') RETURNING id INTO v_req_id;
    INSERT INTO finger_scan_devices (farm_id, checkpoint_id, device_name, device_serial, status) VALUES (v_farm_id, v_req_id, 'FS-Đ2-Vào', '00:11:D2:IN', 'online');
    INSERT INTO checkpoints (farm_id, zone_id, barn_id, checkpoint_name, checkpoint_type) VALUES (v_farm_id, v_zone_de, v_barn_de2, 'Đẻ 2 - Cửa Ra', 'barn_door') RETURNING id INTO v_req_id;
    INSERT INTO finger_scan_devices (farm_id, checkpoint_id, device_name, device_serial, status) VALUES (v_farm_id, v_req_id, 'FS-Đ2-Ra', '00:11:D2:OUT', 'online');

    INSERT INTO barns (farm_id, zone_id, barn_code, barn_name, capacity) VALUES (v_farm_id, v_zone_de, 'B_DE3', 'Chuồng Đẻ 3', 50) RETURNING id INTO v_barn_de3;
    INSERT INTO checkpoints (farm_id, zone_id, barn_id, checkpoint_name, checkpoint_type) VALUES (v_farm_id, v_zone_de, v_barn_de3, 'Đẻ 3 - Cửa Vào', 'barn_door') RETURNING id INTO v_req_id;
    INSERT INTO finger_scan_devices (farm_id, checkpoint_id, device_name, device_serial, status) VALUES (v_farm_id, v_req_id, 'FS-Đ3-Vào', '00:11:D3:IN', 'online');
    INSERT INTO checkpoints (farm_id, zone_id, barn_id, checkpoint_name, checkpoint_type) VALUES (v_farm_id, v_zone_de, v_barn_de3, 'Đẻ 3 - Cửa Ra', 'barn_door') RETURNING id INTO v_req_id;
    INSERT INTO finger_scan_devices (farm_id, checkpoint_id, device_name, device_serial, status) VALUES (v_farm_id, v_req_id, 'FS-Đ3-Ra', '00:11:D3:OUT', 'online');

    -- Chuồng Bầu 1, 2 (4)
    INSERT INTO barns (farm_id, zone_id, barn_code, barn_name, capacity) VALUES (v_farm_id, v_zone_bau, 'B_BAU1', 'Chuồng Bầu 1', 100) RETURNING id INTO v_barn_bau1;
    INSERT INTO checkpoints (farm_id, zone_id, barn_id, checkpoint_name, checkpoint_type) VALUES (v_farm_id, v_zone_bau, v_barn_bau1, 'Bầu 1 - Cửa Vào', 'barn_door') RETURNING id INTO v_req_id;
    INSERT INTO finger_scan_devices (farm_id, checkpoint_id, device_name, device_serial, status) VALUES (v_farm_id, v_req_id, 'FS-B1-Vào', '00:11:B1:IN', 'online');
    INSERT INTO checkpoints (farm_id, zone_id, barn_id, checkpoint_name, checkpoint_type) VALUES (v_farm_id, v_zone_bau, v_barn_bau1, 'Bầu 1 - Cửa Ra', 'barn_door') RETURNING id INTO v_req_id;
    INSERT INTO finger_scan_devices (farm_id, checkpoint_id, device_name, device_serial, status) VALUES (v_farm_id, v_req_id, 'FS-B1-Ra', '00:11:B1:OUT', 'online');

    INSERT INTO barns (farm_id, zone_id, barn_code, barn_name, capacity) VALUES (v_farm_id, v_zone_bau, 'B_BAU2', 'Chuồng Bầu 2', 100) RETURNING id INTO v_barn_bau2;
    INSERT INTO checkpoints (farm_id, zone_id, barn_id, checkpoint_name, checkpoint_type) VALUES (v_farm_id, v_zone_bau, v_barn_bau2, 'Bầu 2 - Cửa Vào', 'barn_door') RETURNING id INTO v_req_id;
    INSERT INTO finger_scan_devices (farm_id, checkpoint_id, device_name, device_serial, status) VALUES (v_farm_id, v_req_id, 'FS-B2-Vào', '00:11:B2:IN', 'online');
    INSERT INTO checkpoints (farm_id, zone_id, barn_id, checkpoint_name, checkpoint_type) VALUES (v_farm_id, v_zone_bau, v_barn_bau2, 'Bầu 2 - Cửa Ra', 'barn_door') RETURNING id INTO v_req_id;
    INSERT INTO finger_scan_devices (farm_id, checkpoint_id, device_name, device_serial, status) VALUES (v_farm_id, v_req_id, 'FS-B2-Ra', '00:11:B2:OUT', 'online');

    -- Chuồng Cách Ly 1, 2 (4)
    INSERT INTO barns (farm_id, zone_id, barn_code, barn_name, capacity) VALUES (v_farm_id, v_zone_cach_ly, 'B_CL1', 'Cách Ly 1', 20) RETURNING id INTO v_barn_cl1;
    INSERT INTO checkpoints (farm_id, zone_id, barn_id, checkpoint_name, checkpoint_type) VALUES (v_farm_id, v_zone_cach_ly, v_barn_cl1, 'Cách Ly 1 - Cửa Vào', 'barn_door') RETURNING id INTO v_req_id;
    INSERT INTO finger_scan_devices (farm_id, checkpoint_id, device_name, device_serial, status) VALUES (v_farm_id, v_req_id, 'FS-CL1-Vào', '00:11:CL1:IN', 'online');
    INSERT INTO checkpoints (farm_id, zone_id, barn_id, checkpoint_name, checkpoint_type) VALUES (v_farm_id, v_zone_cach_ly, v_barn_cl1, 'Cách Ly 1 - Cửa Ra', 'barn_door') RETURNING id INTO v_req_id;
    INSERT INTO finger_scan_devices (farm_id, checkpoint_id, device_name, device_serial, status) VALUES (v_farm_id, v_req_id, 'FS-CL1-Ra', '00:11:CL1:OUT', 'online');

    INSERT INTO barns (farm_id, zone_id, barn_code, barn_name, capacity) VALUES (v_farm_id, v_zone_cach_ly, 'B_CL2', 'Cách Ly 2', 20) RETURNING id INTO v_barn_cl2;
    INSERT INTO checkpoints (farm_id, zone_id, barn_id, checkpoint_name, checkpoint_type) VALUES (v_farm_id, v_zone_cach_ly, v_barn_cl2, 'Cách Ly 2 - Cửa Vào', 'barn_door') RETURNING id INTO v_req_id;
    INSERT INTO finger_scan_devices (farm_id, checkpoint_id, device_name, device_serial, status) VALUES (v_farm_id, v_req_id, 'FS-CL2-Vào', '00:11:CL2:IN', 'online');
    INSERT INTO checkpoints (farm_id, zone_id, barn_id, checkpoint_name, checkpoint_type) VALUES (v_farm_id, v_zone_cach_ly, v_barn_cl2, 'Cách Ly 2 - Cửa Ra', 'barn_door') RETURNING id INTO v_req_id;
    INSERT INTO finger_scan_devices (farm_id, checkpoint_id, device_name, device_serial, status) VALUES (v_farm_id, v_req_id, 'FS-CL2-Ra', '00:11:CL2:OUT', 'online');

    -- Chuồng Hậu Bị Cách Ly (2)
    INSERT INTO barns (farm_id, zone_id, barn_code, barn_name, capacity) VALUES (v_farm_id, v_zone_cach_ly, 'B_HBCL', 'Hậu Bị Cách Ly', 30) RETURNING id INTO v_barn_hbcl;
    INSERT INTO checkpoints (farm_id, zone_id, barn_id, checkpoint_name, checkpoint_type) VALUES (v_farm_id, v_zone_cach_ly, v_barn_hbcl, 'Hậu Bị CL - Cửa Vào', 'barn_door') RETURNING id INTO v_req_id;
    INSERT INTO finger_scan_devices (farm_id, checkpoint_id, device_name, device_serial, status) VALUES (v_farm_id, v_req_id, 'FS-HBCL-Vào', '00:11:HB:IN', 'online');
    INSERT INTO checkpoints (farm_id, zone_id, barn_id, checkpoint_name, checkpoint_type) VALUES (v_farm_id, v_zone_cach_ly, v_barn_hbcl, 'Hậu Bị CL - Cửa Ra', 'barn_door') RETURNING id INTO v_req_id;
    INSERT INTO finger_scan_devices (farm_id, checkpoint_id, device_name, device_serial, status) VALUES (v_farm_id, v_req_id, 'FS-HBCL-Ra', '00:11:HB:OUT', 'online');


    -- 3. EMPLOYEES
    -- schema: employees(id, farm_id, employee_code, full_name, department, job_title, phone)
    INSERT INTO employees (farm_id, employee_code, full_name, department, job_title, phone) VALUES (v_farm_id, 'EMP001', 'Nguyễn Văn Vet', 'Technical', 'Vet', '0901234567') RETURNING id INTO v_emp_vet;
    INSERT INTO employees (farm_id, employee_code, full_name, department, job_title, phone) VALUES (v_farm_id, 'EMP002', 'Lê Thị Đẻ (CN)', 'Production', 'Worker', '0901111111') RETURNING id INTO v_emp_cn_de;
    INSERT INTO employees (farm_id, employee_code, full_name, department, job_title, phone) VALUES (v_farm_id, 'EMP003', 'Trần Văn Bầu (CN)', 'Production', 'Worker', '0902222222') RETURNING id INTO v_emp_cn_bau;
    INSERT INTO employees (farm_id, employee_code, full_name, department, job_title, phone) VALUES (v_farm_id, 'EMP004', 'Phạm Văn Cách Ly (CN)', 'Production', 'Worker', '0903333333') RETURNING id INTO v_emp_cn_cach_ly;
    INSERT INTO employees (farm_id, employee_code, full_name, department, job_title, phone) VALUES (v_farm_id, 'EMP005', 'Quản Lý Trang Trại', 'Admin', 'Admin', '0909999999') RETURNING id INTO v_emp_admin;

    -- 4. ĐĂNG KÝ VÀO TRẠI (farm_entry_requests) & DUYỆT (farm_entry_approvals)
    -- Yêu cầu 1: Đã duyệt (Vet)
    INSERT INTO farm_entry_requests (farm_id, requester_name, visitor_type, phone, entry_date, session_type, purpose, swab_result, needs_isolation_access, status)
    VALUES (v_farm_id, 'Nguyễn Văn Vet', 'vet', '0901234567', CURRENT_DATE, 'full_day', 'Kiểm tra sức khỏe đàn heo định kỳ', 'negative', true, 'approved') RETURNING id INTO v_req_id;
    INSERT INTO farm_entry_approvals (request_id, approver_id, status, reason, high_risk_flag)
    VALUES (v_req_id, v_emp_admin, 'approved', 'Đã kiểm tra chứng nhận âm tính.', true);

    -- Yêu cầu 2: Chờ duyệt (Khách)
    INSERT INTO farm_entry_requests (farm_id, requester_name, visitor_type, phone, entry_date, session_type, purpose, swab_result, needs_isolation_access, status)
    VALUES (v_farm_id, 'Đối tác Cám CP', 'contractor', '0988888888', CURRENT_DATE + INTERVAL '1 day', 'morning', 'Bảo trì silo cám', 'pending', false, 'submitted');

    -- Yêu cầu 3: Từ chối do dương tính
    INSERT INTO farm_entry_requests (farm_id, requester_name, visitor_type, phone, entry_date, session_type, purpose, swab_result, needs_isolation_access, status)
    VALUES (v_farm_id, 'Thợ sửa điện', 'contractor', '0977777777', CURRENT_DATE, 'morning', 'Sửa điện khu tắm', 'positive', false, 'rejected') RETURNING id INTO v_req_id;
    INSERT INTO farm_entry_approvals (request_id, approver_id, status, reason, high_risk_flag)
    VALUES (v_req_id, v_emp_admin, 'rejected', 'Test nhanh dương tính tại cổng.', true);


    -- 5. PHÂN CÔNG CÔNG VIỆC (daily_work_plans & assigned_tasks)
    INSERT INTO daily_work_plans (farm_id, plan_date, created_by, status) 
    VALUES (v_farm_id, CURRENT_DATE, v_emp_admin, 'published') RETURNING id INTO v_plan_id;

    -- assigned_tasks schema: id, plan_id, employee_id, task_category, zone_id, barn_id, checkpoint_id, shift, assigned_shower_id, task_description, biosecurity_level, expected_start, expected_end, status, notes
    
    -- Task cho CN Đẻ
    INSERT INTO assigned_tasks (plan_id, employee_id, zone_id, barn_id, assigned_shower_id, task_category, status, task_description)
    VALUES (v_plan_id, v_emp_cn_de, v_zone_de, v_barn_de1, v_shower_tam1, 'feeding', 'completed', 'Cho ăn chuồng đẻ 1');
    INSERT INTO assigned_tasks (plan_id, employee_id, zone_id, barn_id, assigned_shower_id, task_category, status, task_description)
    VALUES (v_plan_id, v_emp_cn_de, v_zone_de, v_barn_de2, v_shower_tam1, 'cleaning', 'in_progress', 'Dọn vệ sinh chuồng đẻ 2');

    -- Task cho CN Bầu
    INSERT INTO assigned_tasks (plan_id, employee_id, zone_id, barn_id, assigned_shower_id, task_category, status, task_description)
    VALUES (v_plan_id, v_emp_cn_bau, v_zone_bau, v_barn_bau1, v_shower_tam2, 'vaccination', 'pending', 'Tiêm vắc xin chuồng bầu 1');

    -- Task cho CN Cách Ly
    INSERT INTO assigned_tasks (plan_id, employee_id, zone_id, barn_id, assigned_shower_id, task_category, status, task_description)
    VALUES (v_plan_id, v_emp_cn_cach_ly, v_zone_cach_ly, v_barn_cl1, v_shower_tam5, 'cleaning', 'in_progress', 'Dọn chuồng cách ly 1');

    -- Task cho Vet
    INSERT INTO assigned_tasks (plan_id, employee_id, zone_id, barn_id, assigned_shower_id, task_category, status, task_description)
    VALUES (v_plan_id, v_emp_vet, v_zone_de, v_barn_de1, v_shower_tam3, 'health_check', 'completed', 'Khám sức khỏe chuồng đẻ 1');
    INSERT INTO assigned_tasks (plan_id, employee_id, zone_id, barn_id, assigned_shower_id, task_category, status, task_description)
    VALUES (v_plan_id, v_emp_vet, v_zone_cach_ly, v_barn_hbcl, v_shower_tam3, 'health_check', 'pending', 'Khám sức khỏe chuồng hậu bị');


    -- 6. NGƯỜI RA VÀO (finger_scan_logs & biosecurity_alerts)
    DECLARE
        v_chk_cong UUID; v_chk_tam1 UUID; v_chk_tam2 UUID; v_chk_tam5 UUID; v_chk_de1_vao UUID; v_chk_bau1_vao UUID;
    BEGIN
        SELECT id INTO v_chk_cong FROM checkpoints WHERE checkpoint_name = 'Cổng Chính' LIMIT 1;
        SELECT id INTO v_chk_tam1 FROM checkpoints WHERE checkpoint_name = 'Cửa Tắm 1' LIMIT 1;
        SELECT id INTO v_chk_tam2 FROM checkpoints WHERE checkpoint_name = 'Cửa Tắm 2' LIMIT 1;
        SELECT id INTO v_chk_tam5 FROM checkpoints WHERE checkpoint_name = 'Cửa Tắm 5' LIMIT 1;
        SELECT id INTO v_chk_de1_vao FROM checkpoints WHERE checkpoint_name = 'Đẻ 1 - Cửa Vào' LIMIT 1;
        SELECT id INTO v_chk_bau1_vao FROM checkpoints WHERE checkpoint_name = 'Bầu 1 - Cửa Vào' LIMIT 1;

        -- Hợp lệ: CN Đẻ vào cổng -> tắm 1 -> vào Đẻ 1
        INSERT INTO finger_scan_logs (farm_id, checkpoint_id, employee_id, decision, reason, risk_level)
        VALUES (v_farm_id, v_chk_cong, v_emp_cn_de, 'allow', 'Hợp lệ', 'low');
        INSERT INTO finger_scan_logs (farm_id, checkpoint_id, employee_id, decision, reason, risk_level)
        VALUES (v_farm_id, v_chk_tam1, v_emp_cn_de, 'allow', 'Đúng phòng tắm được phân công', 'low');
        INSERT INTO finger_scan_logs (farm_id, checkpoint_id, employee_id, decision, reason, risk_level)
        VALUES (v_farm_id, v_chk_de1_vao, v_emp_cn_de, 'allow', 'Hợp lệ', 'low');

        -- Cảnh báo: CN Bầu đi nhầm phòng tắm 1 (đáng lẽ phải đi tắm 2)
        INSERT INTO finger_scan_logs (farm_id, checkpoint_id, employee_id, decision, reason, risk_level)
        VALUES (v_farm_id, v_chk_tam1, v_emp_cn_bau, 'warning', 'Sai phòng tắm phân công (Phải tắm ở Tắm 2)', 'medium') RETURNING id INTO v_req_id;
        INSERT INTO biosecurity_alerts (farm_id, alert_type, severity, employee_id, checkpoint_id, scan_log_id, description, status)
        VALUES (v_farm_id, 'wrong_shower', 'medium', v_emp_cn_bau, v_chk_tam1, v_req_id, 'Trần Văn Bầu tắm sai phòng (Tắm 1 thay vì Tắm 2)', 'open');

        -- Khẩn cấp: CN Cách Ly đi vào Chuồng Bầu 1 (Trái phép, cross-contamination)
        INSERT INTO finger_scan_logs (farm_id, checkpoint_id, employee_id, decision, reason, risk_level)
        VALUES (v_farm_id, v_chk_bau1_vao, v_emp_cn_cach_ly, 'deny', 'Cố gắng vào khu vực không được cấp quyền', 'critical') RETURNING id INTO v_req_id;
        INSERT INTO biosecurity_alerts (farm_id, alert_type, severity, employee_id, checkpoint_id, scan_log_id, description, status)
        VALUES (v_farm_id, 'unauthorized_access', 'critical', v_emp_cn_cach_ly, v_chk_bau1_vao, v_req_id, 'Phạm Văn Cách Ly cố gắng xâm nhập Chuồng Bầu 1!', 'open');
    END;

END $$;
