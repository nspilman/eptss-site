CREATE INDEX "comment_associations_comment_id_idx" ON "comment_associations" USING btree ("comment_id");--> statement-breakpoint
CREATE INDEX "comment_associations_user_content_id_idx" ON "comment_associations" USING btree ("user_content_id");--> statement-breakpoint
CREATE INDEX "comment_associations_round_id_idx" ON "comment_associations" USING btree ("round_id");--> statement-breakpoint
CREATE INDEX "comment_upvotes_comment_id_idx" ON "comment_upvotes" USING btree ("comment_id");--> statement-breakpoint
CREATE INDEX "comment_upvotes_user_id_idx" ON "comment_upvotes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "comment_upvotes_comment_user_idx" ON "comment_upvotes" USING btree ("comment_id","user_id");--> statement-breakpoint
CREATE INDEX "comments_parent_comment_id_idx" ON "comments" USING btree ("parent_comment_id");--> statement-breakpoint
CREATE INDEX "comments_user_id_idx" ON "comments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "comments_created_at_idx" ON "comments" USING btree ("created_at");