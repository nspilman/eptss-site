CREATE TABLE "comment_associations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"comment_id" uuid NOT NULL,
	"user_content_id" uuid,
	"round_id" bigint,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "comments" DROP CONSTRAINT "comments_content_id_user_content_id_fk";
--> statement-breakpoint
ALTER TABLE "comment_associations" ADD CONSTRAINT "comment_associations_comment_id_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comment_associations" ADD CONSTRAINT "comment_associations_user_content_id_user_content_id_fk" FOREIGN KEY ("user_content_id") REFERENCES "public"."user_content"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comment_associations" ADD CONSTRAINT "comment_associations_round_id_round_metadata_id_fk" FOREIGN KEY ("round_id") REFERENCES "public"."round_metadata"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" DROP COLUMN "content_id";