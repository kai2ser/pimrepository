CREATE TABLE "accounts" (
	"user_id" uuid NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"provider_account_id" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "accounts_provider_provider_account_id_pk" PRIMARY KEY("provider","provider_account_id")
);
--> statement-breakpoint
CREATE TABLE "countries" (
	"iso3" char(3) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"gdp_2024_bn" numeric(12, 3),
	"pub_inv_pct_gdp" numeric(6, 4),
	"pub_inv_2024_bn" numeric(12, 3)
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"record_id" uuid NOT NULL,
	"lang_type" varchar(5) NOT NULL,
	"lang_code" varchar(10),
	"lang_label" varchar(100),
	"blob_url" text NOT NULL,
	"file_name" text,
	"file_size" integer,
	"uploaded_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_record_lang" UNIQUE("record_id","lang_type")
);
--> statement-breakpoint
CREATE TABLE "policy_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"country" varchar(100) NOT NULL,
	"name_eng" text NOT NULL,
	"name_orig" text,
	"year" smallint,
	"source" text,
	"year_revised" smallint,
	"overview" text,
	"policy_guidance_tier" smallint,
	"strategy_tier" smallint,
	"comment" text,
	"link" text,
	"pages" smallint,
	"tokens" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"session_token" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"email" text,
	"email_verified" timestamp,
	"image" text,
	"password_hash" text,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification_tokens" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verification_tokens_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_record_id_policy_records_id_fk" FOREIGN KEY ("record_id") REFERENCES "public"."policy_records"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_documents_record_id" ON "documents" USING btree ("record_id");--> statement-breakpoint
CREATE INDEX "idx_policy_records_country" ON "policy_records" USING btree ("country");--> statement-breakpoint
CREATE INDEX "idx_policy_records_country_name" ON "policy_records" USING btree ("country","name_eng");