CREATE TABLE IF NOT EXISTS public.piglet_handovers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    transfer_id UUID REFERENCES public.piglet_transfers(id),
    status VARCHAR(50) DEFAULT 'Draft',
    
    document_no VARCHAR(100),
    handover_time TIMESTAMPTZ,
    
    source_farm_name VARCHAR(255),
    dest_farm_name VARCHAR(255),
    dest_farm_type VARCHAR(100),
    sender_engineer_id UUID REFERENCES public.employees(id),
    receiver_engineer_id UUID REFERENCES public.employees(id),
    
    driver_name VARCHAR(100),
    driver_phone VARCHAR(50),
    vehicle_plate VARCHAR(50),
    vehicle_sanitized BOOLEAN,
    departure_time TIMESTAMPTZ,
    arrival_time TIMESTAMPTZ,
    
    total_qty INTEGER,
    male_qty INTEGER,
    female_qty INTEGER,
    total_weight NUMERIC,
    avg_weight NUMERIC,
    issues_qty INTEGER,
    issues_reason TEXT,
    
    vaccine_data JSONB DEFAULT '[]'::jsonb,
    age_data JSONB DEFAULT '[]'::jsonb,
    
    photos TEXT[],
    document_photo_url TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.piglet_handovers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to select piglet_handovers" ON public.piglet_handovers
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert piglet_handovers" ON public.piglet_handovers
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update piglet_handovers" ON public.piglet_handovers
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete piglet_handovers" ON public.piglet_handovers
    FOR DELETE USING (auth.role() = 'authenticated');
