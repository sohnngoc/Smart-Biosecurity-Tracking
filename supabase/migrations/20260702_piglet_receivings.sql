CREATE TABLE IF NOT EXISTS public.piglet_receivings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    transfer_id UUID REFERENCES public.piglet_transfers(id),
    handover_id UUID REFERENCES public.piglet_handovers(id),
    pen_check_id UUID REFERENCES public.pen_checks(id),
    status VARCHAR(50) DEFAULT 'Draft',
    
    arrival_time TIMESTAMPTZ,
    receiver_id UUID REFERENCES public.employees(id),
    barn_id UUID REFERENCES public.barns(id),
    
    actual_qty INTEGER,
    male_qty INTEGER,
    female_qty INTEGER,
    total_weight NUMERIC,
    avg_weight NUMERIC,
    dead_qty INTEGER,
    cull_qty INTEGER,
    cull_reason TEXT,
    sick_qty INTEGER,
    diarrhea_qty INTEGER,
    respiratory_qty INTEGER,
    dehydration_qty INTEGER,
    injured_qty INTEGER,
    photos TEXT[],
    
    expected_qty INTEGER,
    surplus_qty INTEGER,
    deficit_qty INTEGER,
    weight_diff NUMERIC,
    diff_notes TEXT,
    diff_confirmer_id UUID REFERENCES public.employees(id),
    
    physique_score VARCHAR(50),
    health_score VARCHAR(50),
    uniformity_score VARCHAR(50),
    sample_qty INTEGER,
    is_accepted BOOLEAN,
    evidence_photos TEXT[],
    
    has_claim BOOLEAN DEFAULT false,
    claim_type VARCHAR(100),
    claim_deadline TIMESTAMPTZ,
    claim_assignee_id UUID REFERENCES public.employees(id),
    claim_status VARCHAR(50),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.piglet_receivings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to select piglet_receivings" ON public.piglet_receivings
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert piglet_receivings" ON public.piglet_receivings
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update piglet_receivings" ON public.piglet_receivings
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete piglet_receivings" ON public.piglet_receivings
    FOR DELETE USING (auth.role() = 'authenticated');
