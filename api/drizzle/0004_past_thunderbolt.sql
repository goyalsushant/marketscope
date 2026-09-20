ALTER TABLE "portfolio_stores" ADD COLUMN "category_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "portfolio_stores" ADD CONSTRAINT "portfolio_stores_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "portfolio_stores_category_idx" ON "portfolio_stores" USING btree ("category_id");--> statement-breakpoint
ALTER TABLE "portfolio_stores" DROP COLUMN "category";