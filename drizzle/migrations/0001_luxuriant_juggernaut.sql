CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"user_email" text,
	"action" varchar(20) NOT NULL,
	"entity" varchar(20) NOT NULL,
	"entity_id" uuid,
	"detail" text,
	"ip" varchar(45),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_audit_logs_created" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_user_id" ON "audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_entity_id" ON "audit_logs" USING btree ("entity_id");--> statement-breakpoint
CREATE INDEX "idx_countries_name" ON "countries" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_policy_records_policy_tier" ON "policy_records" USING btree ("policy_guidance_tier");--> statement-breakpoint
CREATE INDEX "idx_policy_records_strategy_tier" ON "policy_records" USING btree ("strategy_tier");