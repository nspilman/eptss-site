CREATE TABLE IF NOT EXISTS "mailing_list_unsubscription" (
	"id" bigint PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "mailing_list_unsubscription_email_unique" UNIQUE("email")
);
