CREATE TYPE "public"."survey_instance_status" AS ENUM('scheduled', 'active', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."survey_target_audience" AS ENUM('submitters', 'signups', 'all_project_members');--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE 'survey_available' BEFORE 'test_notification';--> statement-breakpoint
CREATE TABLE "survey_instances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_id" uuid NOT NULL,
	"round_id" bigint NOT NULL,
	"project_id" uuid NOT NULL,
	"status" "survey_instance_status" DEFAULT 'scheduled' NOT NULL,
	"target_audience" "survey_target_audience" NOT NULL,
	"trigger_date" timestamp NOT NULL,
	"expires_at" timestamp,
	"notifications_sent" boolean DEFAULT false NOT NULL,
	"notifications_sent_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "survey_responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"instance_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"round_id" bigint NOT NULL,
	"answers" jsonb NOT NULL,
	"is_complete" boolean DEFAULT false NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"submitted_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "survey_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"project_id" uuid,
	"created_by" uuid,
	"questions" jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "survey_instances" ADD CONSTRAINT "survey_instances_template_id_survey_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."survey_templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "survey_instances" ADD CONSTRAINT "survey_instances_round_id_round_metadata_id_fk" FOREIGN KEY ("round_id") REFERENCES "public"."round_metadata"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "survey_instances" ADD CONSTRAINT "survey_instances_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "survey_responses" ADD CONSTRAINT "survey_responses_instance_id_survey_instances_id_fk" FOREIGN KEY ("instance_id") REFERENCES "public"."survey_instances"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "survey_responses" ADD CONSTRAINT "survey_responses_user_id_users_userid_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("userid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "survey_responses" ADD CONSTRAINT "survey_responses_round_id_round_metadata_id_fk" FOREIGN KEY ("round_id") REFERENCES "public"."round_metadata"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "survey_templates" ADD CONSTRAINT "survey_templates_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "survey_templates" ADD CONSTRAINT "survey_templates_created_by_users_userid_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("userid") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "survey_instances_round_id_idx" ON "survey_instances" USING btree ("round_id");--> statement-breakpoint
CREATE INDEX "survey_instances_project_id_idx" ON "survey_instances" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "survey_instances_status_idx" ON "survey_instances" USING btree ("status");--> statement-breakpoint
CREATE INDEX "survey_instances_trigger_date_idx" ON "survey_instances" USING btree ("trigger_date");--> statement-breakpoint
CREATE INDEX "survey_responses_instance_id_idx" ON "survey_responses" USING btree ("instance_id");--> statement-breakpoint
CREATE INDEX "survey_responses_user_id_idx" ON "survey_responses" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "survey_responses_round_id_idx" ON "survey_responses" USING btree ("round_id");--> statement-breakpoint
CREATE UNIQUE INDEX "survey_responses_instance_user_idx" ON "survey_responses" USING btree ("instance_id","user_id");--> statement-breakpoint
CREATE INDEX "survey_templates_project_id_idx" ON "survey_templates" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "survey_templates_is_active_idx" ON "survey_templates" USING btree ("is_active","is_deleted");