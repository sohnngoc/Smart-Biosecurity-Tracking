-- 1. Bảng assessment_periods
CREATE TABLE IF NOT EXISTS public.assessment_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period_name TEXT NOT NULL UNIQUE, -- 'Tháng 7/2026'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Thêm cột period_id vào session
ALTER TABLE public.farm_assessment_sessions 
ADD COLUMN IF NOT EXISTS period_id UUID REFERENCES public.assessment_periods(id) ON DELETE CASCADE;

-- Bỏ UNIQUE constraint nếu có xung đột, hoặc thêm UNIQUE (farm_id, form_id, period_id)
ALTER TABLE public.farm_assessment_sessions DROP CONSTRAINT IF EXISTS farm_assessment_sessions_unique_farm_form_period;
ALTER TABLE public.farm_assessment_sessions ADD CONSTRAINT farm_assessment_sessions_unique_farm_form_period UNIQUE (farm_id, form_id, period_id);

-- 2. Hàm và Trigger tự động sinh Session cho MỌI TRẠI khi có kỳ mới
CREATE OR REPLACE FUNCTION public.fn_auto_create_sessions_for_new_period()
RETURNS TRIGGER AS $$
DECLARE
    f RECORD;
    frm RECORD;
BEGIN
    -- Vòng lặp qua tất cả các trại
    FOR f IN SELECT id FROM public.farms -- WHERE status = 'active'
    LOOP
        -- Vòng lặp qua tất cả các biểu mẫu đang active
        FOR frm IN SELECT id, code FROM public.assessment_forms WHERE is_active = true
        LOOP
            INSERT INTO public.farm_assessment_sessions (
                farm_id, form_id, period_id, assessment_period, assessment_month, assessment_year, assessment_date, status
            ) VALUES (
                f.id, frm.id, NEW.id, NEW.period_name, EXTRACT(MONTH FROM NEW.start_date), EXTRACT(YEAR FROM NEW.start_date), NEW.start_date, 'draft'
            ) ON CONFLICT DO NOTHING;
        END LOOP;
    END LOOP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_after_insert_assessment_period ON public.assessment_periods;
CREATE TRIGGER trg_after_insert_assessment_period
AFTER INSERT ON public.assessment_periods
FOR EACH ROW EXECUTE FUNCTION public.fn_auto_create_sessions_for_new_period();

-- 3. Hàm và Trigger tự động sinh Session cho TRẠI MỚI đối với các kỳ đang active
CREATE OR REPLACE FUNCTION public.fn_auto_create_sessions_for_new_farm()
RETURNS TRIGGER AS $$
DECLARE
    p RECORD;
    frm RECORD;
BEGIN
    -- Vòng lặp qua tất cả các kỳ đang active
    FOR p IN SELECT * FROM public.assessment_periods WHERE is_active = true
    LOOP
        -- Vòng lặp qua tất cả form
        FOR frm IN SELECT id, code FROM public.assessment_forms WHERE is_active = true
        LOOP
            INSERT INTO public.farm_assessment_sessions (
                farm_id, form_id, period_id, assessment_period, assessment_month, assessment_year, assessment_date, status
            ) VALUES (
                NEW.id, frm.id, p.id, p.period_name, EXTRACT(MONTH FROM p.start_date), EXTRACT(YEAR FROM p.start_date), p.start_date, 'draft'
            ) ON CONFLICT DO NOTHING;
        END LOOP;
    END LOOP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_after_insert_farm ON public.farms;
CREATE TRIGGER trg_after_insert_farm
AFTER INSERT ON public.farms
FOR EACH ROW EXECUTE FUNCTION public.fn_auto_create_sessions_for_new_farm();

-- RLS
ALTER TABLE public.assessment_periods ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all for anon periods" ON public.assessment_periods;
CREATE POLICY "Enable all for anon periods" ON public.assessment_periods FOR ALL USING (true);
