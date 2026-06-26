-- Migration: 20260626_add_periodic_assessment.sql
-- Thêm các bảng cho module Đánh giá trại định kỳ ATSH

-- 1. Bảng assessment_forms (Lưu danh mục form)
CREATE TABLE IF NOT EXISTS public.assessment_forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    form_type TEXT NOT NULL, -- 'hardware', 'software', 'checklist'
    description TEXT,
    version TEXT DEFAULT '1.0',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Bảng assessment_criteria (Lưu danh mục tiêu chí của từng form)
CREATE TABLE IF NOT EXISTS public.assessment_criteria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID REFERENCES public.assessment_forms(id) ON DELETE CASCADE,
    group_name TEXT NOT NULL,
    criteria_code TEXT,
    criteria_name TEXT NOT NULL,
    criteria_description TEXT,
    weight NUMERIC NOT NULL DEFAULT 1.0,
    input_type TEXT NOT NULL, -- 'score_1_5', 'checklist_status'
    is_mandatory BOOLEAN DEFAULT false,
    evidence_required BOOLEAN DEFAULT false,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Bảng farm_assessment_sessions (Lưu mỗi kỳ đánh giá của một trại)
CREATE TABLE IF NOT EXISTS public.farm_assessment_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE,
    form_id UUID REFERENCES public.assessment_forms(id) ON DELETE RESTRICT,
    assessment_period TEXT NOT NULL, -- e.g., 'Tháng 6/2026'
    assessment_month INT NOT NULL,
    assessment_year INT NOT NULL,
    assessment_date DATE NOT NULL,
    assessor_id UUID, -- REFERENCES auth.users(id) - bỏ qua constraint ở đây để dễ dev, có thể join sau
    status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'submitted', 'approved', 'rejected'
    total_weight NUMERIC DEFAULT 0,
    total_converted_score NUMERIC DEFAULT 0,
    score_percent NUMERIC DEFAULT 0,
    risk_level TEXT DEFAULT 'Chưa đánh giá',
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Bảng farm_assessment_answers (Lưu câu trả lời chi tiết)
CREATE TABLE IF NOT EXISTS public.farm_assessment_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.farm_assessment_sessions(id) ON DELETE CASCADE,
    criteria_id UUID REFERENCES public.assessment_criteria(id) ON DELETE CASCADE,
    score NUMERIC, -- 1 to 5
    checklist_status TEXT, -- 'Đạt', 'Chưa đạt', 'Không đạt'
    is_na BOOLEAN DEFAULT false,
    converted_score NUMERIC DEFAULT 0,
    evidence_urls JSONB, -- Lưu URL ảnh bằng chứng
    notes TEXT,
    corrective_action TEXT,
    action_owner TEXT,
    due_date DATE,
    action_status TEXT DEFAULT 'open', -- 'open', 'in_progress', 'done', 'overdue'
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(session_id, criteria_id) -- Mỗi session chỉ có 1 answer cho 1 tiêu chí
);

-- 5. Bảng farm_assessment_dashboard_summary (Lưu kết quả tổng hợp mới nhất)
CREATE TABLE IF NOT EXISTS public.farm_assessment_dashboard_summary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE UNIQUE,
    latest_hardware_score NUMERIC DEFAULT 0,
    latest_hardware_risk_level TEXT DEFAULT 'Chưa đánh giá',
    latest_software_score NUMERIC DEFAULT 0,
    latest_software_risk_level TEXT DEFAULT 'Chưa đánh giá',
    latest_checklist_score NUMERIC DEFAULT 0,
    latest_checklist_risk_level TEXT DEFAULT 'Chưa đánh giá',
    overall_assessment_score NUMERIC DEFAULT 0,
    overall_risk_level TEXT DEFAULT 'Chưa đánh giá',
    mandatory_failed_count INT DEFAULT 0,
    open_corrective_actions INT DEFAULT 0,
    last_assessment_date DATE,
    last_assessment_period TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.assessment_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farm_assessment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farm_assessment_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farm_assessment_dashboard_summary ENABLE ROW LEVEL SECURITY;

-- Tạo policies cơ bản (Cho phép anon read/write tạm thời để dễ dev, sẽ thắt chặt sau)
CREATE POLICY "Enable all for anon forms" ON public.assessment_forms FOR ALL USING (true);
CREATE POLICY "Enable all for anon criteria" ON public.assessment_criteria FOR ALL USING (true);
CREATE POLICY "Enable all for anon sessions" ON public.farm_assessment_sessions FOR ALL USING (true);
CREATE POLICY "Enable all for anon answers" ON public.farm_assessment_answers FOR ALL USING (true);
CREATE POLICY "Enable all for anon summary" ON public.farm_assessment_dashboard_summary FOR ALL USING (true);

-- ==========================================
-- SEED DATA 
-- ==========================================

-- 1. Chèn Forms
INSERT INTO public.assessment_forms (code, name, form_type, description) VALUES
('HARDWARE', 'Phần cứng', 'hardware', 'Đánh giá cấu trúc vật lý, hàng rào, thiết bị sát trùng'),
('SOFTWARE', 'Phần mềm', 'software', 'Đánh giá quy trình, con người, quản lý dữ liệu ATSH'),
('CHECKLIST_NAI_HB', 'CheckLIST NÁI-HB', 'checklist', 'Kiểm tra thực tế các điểm kiểm soát trọng yếu Nái - Hậu bị')
ON CONFLICT (code) DO NOTHING;

-- 2. Chèn Tiêu chí mẫu cho Phần cứng (HARDWARE)
WITH hw_form AS (SELECT id FROM public.assessment_forms WHERE code = 'HARDWARE')
INSERT INTO public.assessment_criteria (form_id, group_name, criteria_code, criteria_name, criteria_description, weight, input_type, is_mandatory, display_order)
SELECT id, 'Nhóm cổng trại', 'HW_01', 'Hàng rào bảo vệ', 'Hàng rào chắc chắn, không có lỗ hổng lớn hơn 5cm', 2.0, 'score_1_5', true, 1 FROM hw_form UNION ALL
SELECT id, 'Nhóm cổng trại', 'HW_02', 'Cổng phun sát trùng xe', 'Hệ thống phun sương hoạt động tốt, dung dịch đủ nồng độ', 3.0, 'score_1_5', true, 2 FROM hw_form UNION ALL
SELECT id, 'Nhóm điểm sát trùng', 'HW_03', 'Phòng tắm sát trùng nhân sự', 'Đầy đủ xà phòng, nước sạch, đèn UV hoạt động', 2.5, 'score_1_5', false, 3 FROM hw_form UNION ALL
SELECT id, 'Nhóm khu chăn nuôi', 'HW_04', 'Lưới chống chuột/chim', 'Kín hoàn toàn ở các lỗ thông gió', 1.5, 'score_1_5', false, 4 FROM hw_form;

-- 3. Chèn Tiêu chí mẫu cho Phần mềm (SOFTWARE)
WITH sw_form AS (SELECT id FROM public.assessment_forms WHERE code = 'SOFTWARE')
INSERT INTO public.assessment_criteria (form_id, group_name, criteria_code, criteria_name, criteria_description, weight, input_type, is_mandatory, display_order)
SELECT id, 'Nhóm quản lý con người', 'SW_01', 'Ghi chép cách ly 48h', 'Sổ nhật ký có chữ ký xác nhận của bảo vệ và nhân viên', 3.0, 'score_1_5', true, 1 FROM sw_form UNION ALL
SELECT id, 'Nhóm quản lý con người', 'SW_02', 'Đào tạo ATSH', 'Tất cả nhân viên mới được đào tạo và kiểm tra', 2.0, 'score_1_5', false, 2 FROM sw_form UNION ALL
SELECT id, 'Nhóm nước uống', 'SW_03', 'Kiểm tra chất lượng nước', 'Có biên bản test nước định kỳ 6 tháng/lần', 2.5, 'score_1_5', true, 3 FROM sw_form;

-- 4. Chèn Tiêu chí mẫu cho CheckLIST NÁI-HB (CHECKLIST_NAI_HB)
WITH cl_form AS (SELECT id FROM public.assessment_forms WHERE code = 'CHECKLIST_NAI_HB')
INSERT INTO public.assessment_criteria (form_id, group_name, criteria_code, criteria_name, criteria_description, weight, input_type, is_mandatory, display_order)
SELECT id, 'Khu cách ly hậu bị', 'CL_01', 'Lấy mẫu máu kiểm tra PRRS', 'Thực hiện lấy mẫu 100% lô heo mới nhập', 3.0, 'checklist_status', true, 1 FROM cl_form UNION ALL
SELECT id, 'Khu cách ly hậu bị', 'CL_02', 'Phun sát trùng hành lang', 'Thực hiện 2 lần/ngày', 1.5, 'checklist_status', false, 2 FROM cl_form UNION ALL
SELECT id, 'Khu đẻ', 'CL_03', 'Nhúng ủng bằng Iot', 'Tất cả công nhân phải nhúng ủng trước khi vào chuồng đẻ', 2.0, 'checklist_status', true, 3 FROM cl_form;
