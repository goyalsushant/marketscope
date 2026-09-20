ALTER TABLE "discovered_stores" ADD COLUMN "location" geography(Point, 4326);--> statement-breakpoint
ALTER TABLE "portfolio_stores" ADD COLUMN "location" geography(Point, 4326);--> statement-breakpoint
ALTER TABLE "markets" ADD COLUMN "boundary" geography(Polygon, 4326);

CREATE INDEX "markets_boundary_gist_idx"
ON "markets"
USING GIST ("boundary");

CREATE INDEX "portfolio_stores_location_gist_idx"
ON "portfolio_stores"
USING GIST ("location");

CREATE INDEX "discovered_stores_location_gist_idx"
ON "discovered_stores"
USING GIST ("location");