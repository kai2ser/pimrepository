ALTER TABLE "policy_records" ADD CONSTRAINT "policy_records_country_countries_iso3_fk" FOREIGN KEY ("country") REFERENCES "public"."countries"("iso3") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_accounts_user_id" ON "accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_sessions_user_id" ON "sessions" USING btree ("user_id");