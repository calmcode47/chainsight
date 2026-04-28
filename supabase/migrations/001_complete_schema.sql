-- ChainSight Complete Schema Migration
-- Deliverable: supabase/migrations/001_complete_schema.sql

-- 1. Trigger function for updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. TABLE: shipments
CREATE TABLE IF NOT EXISTS shipments (
  id TEXT PRIMARY KEY,
  origin_city TEXT NOT NULL,
  origin_country TEXT NOT NULL,
  origin_lat FLOAT8 NOT NULL,
  origin_lng FLOAT8 NOT NULL,
  destination_city TEXT NOT NULL,
  destination_country TEXT NOT NULL,
  destination_lat FLOAT8 NOT NULL,
  destination_lng FLOAT8 NOT NULL,
  carrier TEXT NOT NULL,
  eta TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Idempotent column additions for shipments
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS current_city TEXT;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS current_country TEXT;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS current_lat FLOAT8;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS current_lng FLOAT8;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS mode TEXT NOT NULL DEFAULT 'sea';
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'on_time';
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS progress_percent INTEGER NOT NULL DEFAULT 0;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS cargo_type TEXT;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS weight_kg FLOAT8;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS value_usd FLOAT8;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS delay_hours INTEGER NOT NULL DEFAULT 0;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS disruption_type TEXT;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS route_nodes JSONB NOT NULL DEFAULT '[]';

-- Add constraints (DO block to handle existing constraints safely)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_shipment_mode') THEN
        ALTER TABLE shipments ADD CONSTRAINT check_shipment_mode CHECK (mode IN ('air','sea','road','rail'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_shipment_status') THEN
        ALTER TABLE shipments ADD CONSTRAINT check_shipment_status CHECK (status IN ('on_time','at_risk','delayed','critical'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_shipment_progress') THEN
        ALTER TABLE shipments ADD CONSTRAINT check_shipment_progress CHECK (progress_percent BETWEEN 0 AND 100);
    END IF;
END $$;

-- 3. TABLE: disruption_alerts
CREATE TABLE IF NOT EXISTS disruption_alerts (
  id TEXT PRIMARY KEY,
  shipment_id TEXT NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  severity TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE disruption_alerts ADD COLUMN IF NOT EXISTS predicted_delay_hours INTEGER NOT NULL DEFAULT 0;
ALTER TABLE disruption_alerts ADD COLUMN IF NOT EXISTS affected_region TEXT;
ALTER TABLE disruption_alerts ADD COLUMN IF NOT EXISTS ai_confidence FLOAT8 NOT NULL DEFAULT 0.5;
ALTER TABLE disruption_alerts ADD COLUMN IF NOT EXISTS resolved BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE disruption_alerts ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_alert_severity') THEN
        ALTER TABLE disruption_alerts ADD CONSTRAINT check_alert_severity CHECK (severity IN ('low','medium','high','critical'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_alert_confidence') THEN
        ALTER TABLE disruption_alerts ADD CONSTRAINT check_alert_confidence CHECK (ai_confidence BETWEEN 0.0 AND 1.0);
    END IF;
END $$;

-- 4. TABLE: route_optimizations
CREATE TABLE IF NOT EXISTS route_optimizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id TEXT NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  time_saving_hours INTEGER NOT NULL DEFAULT 0,
  cost_delta_usd FLOAT8 NOT NULL DEFAULT 0,
  risk_reduction_percent INTEGER NOT NULL DEFAULT 0,
  gemini_reasoning TEXT,
  accepted BOOLEAN NOT NULL DEFAULT FALSE
);

ALTER TABLE route_optimizations ADD COLUMN IF NOT EXISTS original_route JSONB NOT NULL DEFAULT '[]';
ALTER TABLE route_optimizations ADD COLUMN IF NOT EXISTS alternative_route JSONB NOT NULL DEFAULT '[]';
ALTER TABLE route_optimizations ADD COLUMN IF NOT EXISTS recommended_carrier TEXT;
ALTER TABLE route_optimizations ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- 5. TABLE: metrics_snapshots
CREATE TABLE IF NOT EXISTS metrics_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  total_shipments INTEGER NOT NULL DEFAULT 0,
  on_time INTEGER NOT NULL DEFAULT 0,
  at_risk INTEGER NOT NULL DEFAULT 0,
  delayed INTEGER NOT NULL DEFAULT 0,
  critical INTEGER NOT NULL DEFAULT 0,
  avg_delay_hours FLOAT8 NOT NULL DEFAULT 0,
  disruptions_detected INTEGER NOT NULL DEFAULT 0,
  routes_optimized INTEGER NOT NULL DEFAULT 0,
  cost_saved_usd FLOAT8 NOT NULL DEFAULT 0
);

-- 6. TABLE: ai_analysis_logs
CREATE TABLE IF NOT EXISTS ai_analysis_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_type TEXT NOT NULL CHECK (analysis_type IN ('disruption_analysis','route_optimization','chat_query')),
  input_summary TEXT,
  gemini_response TEXT,
  tokens_used INTEGER,
  latency_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Apply triggers
DROP TRIGGER IF EXISTS tr_shipments_updated_at ON shipments;
CREATE TRIGGER tr_shipments_updated_at
  BEFORE UPDATE ON shipments
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- 8. Indexes
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
CREATE INDEX IF NOT EXISTS idx_shipments_carrier ON shipments(carrier);
CREATE INDEX IF NOT EXISTS idx_shipments_mode ON shipments(mode);
CREATE INDEX IF NOT EXISTS idx_alerts_shipment ON disruption_alerts(shipment_id);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON disruption_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_resolved ON disruption_alerts(resolved);
CREATE INDEX IF NOT EXISTS idx_snapshots_at ON metrics_snapshots(snapshot_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_logs_type ON ai_analysis_logs(analysis_type);
CREATE INDEX IF NOT EXISTS idx_ai_logs_created ON ai_analysis_logs(created_at DESC);

-- 9. Enable RLS
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE disruption_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_optimizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analysis_logs ENABLE ROW LEVEL SECURITY;

-- 10. Policies
-- Service Role Bypass (For Backend/Admin)
DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('shipments', 'disruption_alerts', 'route_optimizations', 'metrics_snapshots', 'ai_analysis_logs')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "service_role_bypass" ON %I', t);
        EXECUTE format('CREATE POLICY "service_role_bypass" ON %I FOR ALL TO service_role USING (true) WITH CHECK (true)', t);
    END LOOP;
END $$;

-- Anon Read-Only Policies
DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN VALUES ('shipments'), ('disruption_alerts'), ('metrics_snapshots')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "anon_read_only" ON %I', t);
        EXECUTE format('CREATE POLICY "anon_read_only" ON %I FOR SELECT TO anon USING (true)', t);
    END LOOP;
END $$;
