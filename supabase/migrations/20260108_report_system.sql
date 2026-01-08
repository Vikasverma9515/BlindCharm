-- Create galaxy_reports table
CREATE TABLE IF NOT EXISTS public.galaxy_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    reported_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    details TEXT,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, reviewed, resolved, dismissed
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.galaxy_reports ENABLE ROW LEVEL SECURITY;

-- Reporters can view their own reports
CREATE POLICY "Users can view their own reports"
    ON public.galaxy_reports
    FOR SELECT
    USING (reporter_id = auth.uid());

-- Reporters can create reports
CREATE POLICY "Users can create reports"
    ON public.galaxy_reports
    FOR INSERT
    WITH CHECK (reporter_id = auth.uid());

-- Only admins can view/update all reports (Assuming admin logic later, for now secure)
-- Add indexes
CREATE INDEX idx_galaxy_reports_reporter ON public.galaxy_reports(reporter_id);
CREATE INDEX idx_galaxy_reports_reported ON public.galaxy_reports(reported_id);
CREATE INDEX idx_galaxy_reports_status ON public.galaxy_reports(status);
