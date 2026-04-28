CREATE INDEX IF NOT EXISTS idx_route_path_gist
ON routes
USING GIST (path);