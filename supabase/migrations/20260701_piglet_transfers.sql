CREATE TABLE IF NOT EXISTS public.piglet_transfers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    batch_no VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'planned', -- 'planned', 'pen_checked', 'handover', 'received', 'completed', 'cancelled'
    
    source_barn_id UUID REFERENCES public.barns(id),
    destination_barn_id UUID REFERENCES public.barns(id),
    
    -- Handover info (Bàn giao)
    handover_employee_id UUID REFERENCES public.employees(id),
    handover_date TIMESTAMPTZ,
    planned_quantity INTEGER,
    actual_handover_quantity INTEGER,
    handover_notes TEXT,
    
    -- Receiving info (Nhận heo)
    receiving_employee_id UUID REFERENCES public.employees(id),
    receiving_date TIMESTAMPTZ,
    actual_received_quantity INTEGER,
    receiving_notes TEXT,
    
    -- Pen Check info (Kiểm tra chuồng)
    pen_check_employee_id UUID REFERENCES public.employees(id),
    pen_check_date TIMESTAMPTZ,
    pen_check_passed BOOLEAN,
    pen_check_notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.piglet_transfers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to select piglet_transfers" ON public.piglet_transfers
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert piglet_transfers" ON public.piglet_transfers
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update piglet_transfers" ON public.piglet_transfers
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete piglet_transfers" ON public.piglet_transfers
    FOR DELETE USING (auth.role() = 'authenticated');
