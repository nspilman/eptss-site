CREATE TABLE "round_prompts" (
	"id" bigint PRIMARY KEY NOT NULL,
	"round_id" bigint NOT NULL,
	"prompt_text" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "round_prompts" ADD CONSTRAINT "round_prompts_round_id_round_metadata_id_fk" FOREIGN KEY ("round_id") REFERENCES "public"."round_metadata"("id") ON DELETE no action ON UPDATE no action;