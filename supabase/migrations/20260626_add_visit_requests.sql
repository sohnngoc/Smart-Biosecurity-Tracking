-- Migration to create farm_visit_requests table

CREATE TABLE IF NOT EXISTS public.farm_visit_requests (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    farm_id uuid REFERENCES public.farms(id) ON DELETE CASCADE,
    requester_id uuid REFERENCES auth.users(id),
    requester_name text NOT NULL,
    department text NOT NULL,
    position text NOT NULL,
    vehicle_plate_number text,
    has_vehicle boolean DEFAULT false,
    estimated_visit_date date NOT NULL,
    visit_session text NOT NULL CHECK (visit_session IN ('morning', 'afternoon', 'full_day')),
    visit_purpose text NOT NULL,
    visit_purpose_detail text,
    swab_available boolean DEFAULT false,
    swab_result text CHECK (swab_result IN ('not_available', 'negative', 'positive', 'pending', 'not_applicable')),
    swab_date date,
    swab_attachment_urls jsonb DEFAULT '[]'::jsonb,
    requester_note text,
    vet_note text,
    status text NOT NULL DEFAULT 'pending_vet_approval' CHECK (status IN ('draft', 'submitted', 'pending_vet_approval', 'approved', 'rejected', 'need_more_info', 'cancelled', 'completed')),
    approved_by uuid REFERENCES auth.users(id),
    approved_at timestamptz,
    rejected_by uuid REFERENCES auth.users(id),
    rejected_at timestamptz,
    rejection_reason text,
    need_more_info_reason text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_farm_visit_requests_farm_id ON public.farm_visit_requests(farm_id);
CREATE INDEX IF NOT EXISTS idx_farm_visit_requests_requester_id ON public.farm_visit_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_farm_visit_requests_status ON public.farm_visit_requests(status);
CREATE INDEX IF NOT EXISTS idx_farm_visit_requests_estimated_visit_date ON public.farm_visit_requests(estimated_visit_date);
CREATE INDEX IF NOT EXISTS idx_farm_visit_requests_approved_by ON public.farm_visit_requests(approved_by);

-- Setup RLS (Open for now to facilitate demo, production would use auth.uid() matching)
ALTER TABLE public.farm_visit_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all authenticated select" ON public.farm_visit_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow all authenticated insert" ON public.farm_visit_requests FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow all authenticated update" ON public.farm_visit_requests FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow all authenticated delete" ON public.farm_visit_requests FOR DELETE TO authenticated USING (true);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_farm_visit_requests_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_farm_visit_requests_updated_at ON public.farm_visit_requests;

CREATE TRIGGER update_farm_visit_requests_updated_at
    BEFORE UPDATE ON public.farm_visit_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_farm_visit_requests_updated_at_column();
