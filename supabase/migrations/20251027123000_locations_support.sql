/*
  # Places & Locations Support

  Adds tables to persist user locations and recent Google Places searches.

  New tables:
    - saved_locations: user-saved locations (name, address, lat/lng, place_id)
    - recent_place_searches: ephemeral history of recent place selections

  Security:
    - RLS enabled on both tables
    - Policies restrict access to the owning user via get_current_user_id()

  Maintenance:
    - Trigger keeps only the most recent 100 searches per user
*/

-- Create saved_locations table
CREATE TABLE IF NOT EXISTS public.saved_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  place_id TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_saved_locations_profile_user_id ON public.saved_locations(profile_user_id);
CREATE INDEX IF NOT EXISTS idx_saved_locations_created_at ON public.saved_locations(created_at);
CREATE INDEX IF NOT EXISTS idx_saved_locations_place_id ON public.saved_locations(place_id);

-- Enable RLS
ALTER TABLE public.saved_locations ENABLE ROW LEVEL SECURITY;

-- Policies for saved_locations
CREATE POLICY "Users can view their saved locations" ON public.saved_locations
  FOR SELECT USING (profile_user_id = get_current_user_id());

CREATE POLICY "Users can insert their saved locations" ON public.saved_locations
  FOR INSERT WITH CHECK (profile_user_id = get_current_user_id());

CREATE POLICY "Users can update their saved locations" ON public.saved_locations
  FOR UPDATE USING (profile_user_id = get_current_user_id());

CREATE POLICY "Users can delete their saved locations" ON public.saved_locations
  FOR DELETE USING (profile_user_id = get_current_user_id());

-- Auto update updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_saved_locations_updated_at ON public.saved_locations;
CREATE TRIGGER trg_saved_locations_updated_at
  BEFORE UPDATE ON public.saved_locations
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();


-- Create recent_place_searches table
CREATE TABLE IF NOT EXISTS public.recent_place_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  query TEXT,
  place_id TEXT,
  name TEXT,
  address TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_recent_place_searches_profile_user_id ON public.recent_place_searches(profile_user_id);
CREATE INDEX IF NOT EXISTS idx_recent_place_searches_created_at ON public.recent_place_searches(created_at);
CREATE INDEX IF NOT EXISTS idx_recent_place_searches_place_id ON public.recent_place_searches(place_id);

-- Enable RLS
ALTER TABLE public.recent_place_searches ENABLE ROW LEVEL SECURITY;

-- Policies for recent_place_searches
CREATE POLICY "Users can view their place searches" ON public.recent_place_searches
  FOR SELECT USING (profile_user_id = get_current_user_id());

CREATE POLICY "Users can insert their place searches" ON public.recent_place_searches
  FOR INSERT WITH CHECK (profile_user_id = get_current_user_id());

CREATE POLICY "Users can delete their place searches" ON public.recent_place_searches
  FOR DELETE USING (profile_user_id = get_current_user_id());

-- Optional: pruning trigger to keep only last 100 searches per user
CREATE OR REPLACE FUNCTION prune_recent_place_searches()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.recent_place_searches r
  WHERE r.profile_user_id = NEW.profile_user_id
    AND r.id IN (
      SELECT id
      FROM public.recent_place_searches
      WHERE profile_user_id = NEW.profile_user_id
      ORDER BY created_at DESC
      OFFSET 100
    );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prune_recent_place_searches ON public.recent_place_searches;
CREATE TRIGGER trg_prune_recent_place_searches
  AFTER INSERT ON public.recent_place_searches
  FOR EACH ROW
  EXECUTE FUNCTION prune_recent_place_searches();
