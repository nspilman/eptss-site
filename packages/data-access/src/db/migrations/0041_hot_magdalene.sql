ALTER TABLE "email_reminders_sent" ADD COLUMN "project_id" uuid;--> statement-breakpoint
ALTER TABLE "round_metadata" ADD COLUMN "project_id" uuid;--> statement-breakpoint
ALTER TABLE "sign_ups" ADD COLUMN "project_id" uuid;--> statement-breakpoint
ALTER TABLE "song_selection_votes" ADD COLUMN "project_id" uuid;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "project_id" uuid;--> statement-breakpoint
ALTER TABLE "email_reminders_sent" ADD CONSTRAINT "email_reminders_sent_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "round_metadata" ADD CONSTRAINT "round_metadata_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sign_ups" ADD CONSTRAINT "sign_ups_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "song_selection_votes" ADD CONSTRAINT "song_selection_votes_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;