CREATE TABLE "mailing_list_unsubscription" (
	"id" bigint PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "mailing_list_unsubscription_email_unique" UNIQUE("email")
);
