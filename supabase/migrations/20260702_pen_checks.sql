CREATE TABLE IF NOT EXISTS public.pen_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    transfer_id UUID REFERENCES public.piglet_transfers(id),
    status VARCHAR(50) DEFAULT 'Draft',
    
    barn_id UUID REFERENCES public.barns(id),
    pen_code VARCHAR(50),
    check_time TIMESTAMPTZ,
    inspector_id UUID REFERENCES public.employees(id),
    supervisor_id UUID REFERENCES public.employees(id),
    expected_receive_date DATE,
    expected_quantity INTEGER,
    expected_source_farm VARCHAR(100),
    expected_vehicle_plate VARCHAR(50),
    
    checklist_data JSONB DEFAULT '{}'::jsonb,
    
    is_ready BOOLEAN,
    issues_found TEXT,
    notes TEXT,
    photos TEXT[],
    signature_url TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.pen_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to select pen_checks" ON public.pen_checks
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert pen_checks" ON public.pen_checks
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update pen_checks" ON public.pen_checks
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete pen_checks" ON public.pen_checks
    FOR DELETE USING (auth.role() = 'authenticated');
