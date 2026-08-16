ALTER TABLE `posts` ADD `deleted_at` integer;--> statement-breakpoint
CREATE INDEX `posts_active_published_listing_idx` ON `posts` (`deleted_at`,`status`,`published_at`);--> statement-breakpoint
CREATE INDEX `posts_admin_listing_idx` ON `posts` (`deleted_at`,`updated_at`);