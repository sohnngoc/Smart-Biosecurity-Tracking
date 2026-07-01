-- ==============================================================================
-- Module: Sustainability / Carbon MRV
-- Date: 2026-07-03
-- Description: Schema for tracking GHG emissions (Scope 1 & 3, FLAG/Non-FLAG)
-- ==============================================================================

-- 1. Carbon Reporting Periods
CREATE TABLE IF NOT EXISTS public.carbon_reporting_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period_name TEXT NOT NULL, -- e.g., '2025', 'Q1-2025'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT DEFAULT 'Open', -- Open, Closed
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Carbon Farm Profiles
CREATE TABLE IF NOT EXISTS public.carbon_farm_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    reporting_period_id UUID REFERENCES public.carbon_reporting_periods(id),
    sows_count INTEGER NOT NULL,
    climate_zone TEXT,
    production_system TEXT,
    manure_system TEXT,
    baseline_year INTEGER,
    flag_boundary TEXT,
    no_deforestation_commitment BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(farm_id, reporting_period_id)
);

-- 3. Carbon Emission Factors Library
CREATE TABLE IF NOT EXISTS public.carbon_emission_factors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_type TEXT NOT NULL, -- e.g., 'Enteric Fermentation', 'Feed - Corn'
    scope TEXT NOT NULL, -- 'Scope 1', 'Scope 2', 'Scope 3'
    flag_status TEXT NOT NULL, -- 'FLAG', 'Non-FLAG'
    factor_value NUMERIC NOT NULL,
    unit TEXT NOT NULL, -- e.g., 'kg CH4/head/yr', 'kg CO2e/kg'
    source TEXT,
    methodology TEXT,
    version TEXT,
    valid_from DATE,
    valid_to DATE,
    data_quality_level TEXT, -- Tier 1, Tier 2, etc.
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Carbon Activity Records (Raw Input Data)
CREATE TABLE IF NOT EXISTS public.carbon_activity_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    period_id UUID NOT NULL REFERENCES public.carbon_reporting_periods(id),
    activity_type TEXT NOT NULL, -- 'Herd Activity', 'Feed Input', 'Non-FLAG Activity'
    category TEXT, -- e.g., 'Sows', 'Corn', 'Logistics'
    description TEXT,
    quantity NUMERIC NOT NULL,
    unit TEXT NOT NULL,
    rearing_months NUMERIC, -- for animal days conversion
    data_source TEXT,
    vendor TEXT,
    verified_by TEXT,
    status TEXT DEFAULT 'Draft', -- Draft, Verified
    evidence_urls TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Carbon Calculation Runs (Log of formula executions)
CREATE TABLE IF NOT EXISTS public.carbon_calculation_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES public.farms(id),
    period_id UUID NOT NULL REFERENCES public.carbon_reporting_periods(id),
    run_date TIMESTAMPTZ DEFAULT NOW(),
    executed_by TEXT,
    status TEXT DEFAULT 'Success',
    notes TEXT
);

-- 6. Carbon Emission Results (Calculated tCO2e)
CREATE TABLE IF NOT EXISTS public.carbon_emission_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id UUID REFERENCES public.carbon_calculation_runs(id) ON DELETE CASCADE,
    farm_id UUID NOT NULL REFERENCES public.farms(id),
    period_id UUID NOT NULL REFERENCES public.carbon_reporting_periods(id),
    activity_record_id UUID REFERENCES public.carbon_activity_records(id),
    ef_id UUID REFERENCES public.carbon_emission_factors(id),
    scope TEXT NOT NULL,
    flag_status TEXT NOT NULL,
    emission_source TEXT,
    calculated_tco2e NUMERIC NOT NULL,
    formula_used TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Carbon Outbreak Scenarios (Avoided Emissions Simulation)
CREATE TABLE IF NOT EXISTS public.carbon_outbreak_scenarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES public.farms(id),
    outbreak_type TEXT NOT NULL,
    sows_lost_without_biotrace INTEGER NOT NULL,
    sows_lost_with_biotrace INTEGER NOT NULL,
    piglets_lost_without_biotrace INTEGER,
    piglets_lost_with_biotrace INTEGER,
    avoided_sow_replacement INTEGER NOT NULL,
    rearing_months NUMERIC NOT NULL,
    ef_enteric_manure NUMERIC NOT NULL,
    gwp100_ch4 NUMERIC NOT NULL,
    methodology TEXT,
    avoided_tco2e NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Carbon Report Exports
CREATE TABLE IF NOT EXISTS public.carbon_report_exports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID REFERENCES public.farms(id),
    period_id UUID REFERENCES public.carbon_reporting_periods(id),
    export_format TEXT, -- 'CSV', 'Excel'
    exported_by TEXT,
    file_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- SEED DATA
-- ==========================================

-- Seed specific farms if they don't exist by name
INSERT INTO public.farms (id, name, type, region, capacity, biosecurity_level)
VALUES 
    ('b3b3b3b3-3333-3333-3333-333333333333', 'Ngọc Sơn Farm', 'Nái Đẻ', 'Miền Bắc', 1200, 'High'),
    ('b4b4b4b4-4444-4444-4444-444444444444', 'Bình Phước Farm', 'Nái Đẻ', 'Miền Nam', 2400, 'High'),
    ('b5b5b5b5-5555-5555-5555-555555555555', 'Đồng Nai Farm', 'Nái Đẻ', 'Miền Nam', 1800, 'Medium')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, capacity = EXCLUDED.capacity;

-- Seed Period
INSERT INTO public.carbon_reporting_periods (id, period_name, start_date, end_date)
VALUES ('p1p1p1p1-1111-1111-1111-111111111111', '2026', '2026-01-01', '2026-12-31')
ON CONFLICT (id) DO NOTHING;

-- Seed Emission Factors
INSERT INTO public.carbon_emission_factors (id, activity_type, scope, flag_status, factor_value, unit, source, methodology, data_quality_level)
VALUES 
    ('ef111111-1111-1111-1111-111111111111', 'Enteric Fermentation - Sows', 'Scope 1', 'FLAG', 14.5, 'kg CH4/head/yr', 'IPCC 2019', 'Tier 1', 'High'),
    ('ef222222-2222-2222-2222-222222222222', 'Manure Management - Sows', 'Scope 1', 'FLAG', 21.0, 'kg CH4/head/yr', 'IPCC 2019', 'Tier 1', 'High'),
    ('ef333333-3333-3333-3333-333333333333', 'Feed - Corn (Soybean mix)', 'Scope 3', 'FLAG', 0.85, 'kg CO2e/kg', 'AgriFootprint', 'LCA', 'Medium'),
    ('ef444444-4444-4444-4444-444444444444', 'Diesel (Generator)', 'Scope 1', 'Non-FLAG', 2.68, 'kg CO2e/liter', 'DEFRA 2023', 'Standard', 'High'),
    ('ef555555-5555-5555-5555-555555555555', 'Logistics (Trucking)', 'Scope 3', 'Non-FLAG', 0.12, 'kg CO2e/tkm', 'GLEC', 'Standard', 'Medium')
ON CONFLICT (id) DO NOTHING;

-- Seed Baseline Farm Profiles
INSERT INTO public.carbon_farm_profiles (farm_id, reporting_period_id, sows_count, climate_zone, production_system, manure_system, baseline_year, flag_boundary, no_deforestation_commitment)
VALUES 
    ('b3b3b3b3-3333-3333-3333-333333333333', 'p1p1p1p1-1111-1111-1111-111111111111', 1200, 'Tropical', 'Intensive', 'Liquid/Slurry', 2025, 'Farm Gate', TRUE),
    ('b4b4b4b4-4444-4444-4444-444444444444', 'p1p1p1p1-1111-1111-1111-111111111111', 2400, 'Tropical', 'Intensive', 'Liquid/Slurry', 2025, 'Farm Gate', TRUE),
    ('b5b5b5b5-5555-5555-5555-555555555555', 'p1p1p1p1-1111-1111-1111-111111111111', 1800, 'Tropical', 'Intensive', 'Solid Storage', 2025, 'Farm Gate', FALSE)
ON CONFLICT DO NOTHING;

-- Seed some mock Emission Results for Dashboard
INSERT INTO public.carbon_emission_results (farm_id, period_id, scope, flag_status, emission_source, calculated_tco2e, formula_used)
VALUES 
    ('b3b3b3b3-3333-3333-3333-333333333333', 'p1p1p1p1-1111-1111-1111-111111111111', 'Scope 1', 'FLAG', 'Enteric Fermentation', 469.8, '1200 * 14.5 * 27 / 1000'),
    ('b3b3b3b3-3333-3333-3333-333333333333', 'p1p1p1p1-1111-1111-1111-111111111111', 'Scope 1', 'FLAG', 'Manure Management', 680.4, '1200 * 21.0 * 27 / 1000'),
    ('b3b3b3b3-3333-3333-3333-333333333333', 'p1p1p1p1-1111-1111-1111-111111111111', 'Scope 3', 'FLAG', 'Feed Production', 1250.0, '1470000 * 0.85 / 1000'),
    ('b3b3b3b3-3333-3333-3333-333333333333', 'p1p1p1p1-1111-1111-1111-111111111111', 'Scope 1', 'Non-FLAG', 'Generator Fuel', 45.5, '17000 * 2.68 / 1000'),
    ('b3b3b3b3-3333-3333-3333-333333333333', 'p1p1p1p1-1111-1111-1111-111111111111', 'Scope 3', 'Non-FLAG', 'Logistics', 112.3, '935000 * 0.12 / 1000')
ON CONFLICT DO NOTHING;

-- Seed Avoided Emission Scenario for Ngoc Son
INSERT INTO public.carbon_outbreak_scenarios (farm_id, outbreak_type, sows_lost_without_biotrace, sows_lost_with_biotrace, avoided_sow_replacement, rearing_months, ef_enteric_manure, gwp100_ch4, avoided_tco2e)
VALUES 
    ('b3b3b3b3-3333-3333-3333-333333333333', 'ASF', 800, 50, 750, 7, 14.5, 27, 171.28)
ON CONFLICT DO NOTHING;
