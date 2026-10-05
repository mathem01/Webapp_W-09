CREATE TABLE `drawings` (
	`id` text PRIMARY KEY,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`width` integer NOT NULL,
	`height` integer NOT NULL,
	`pixels` text NOT NULL,
	`is_public` integer DEFAULT false NOT NULL,
	`allow_remix` integer DEFAULT true NOT NULL,
	`remix_of_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	CONSTRAINT `fk_drawings_remix_of_id_drawings_id_fk` FOREIGN KEY (`remix_of_id`) REFERENCES `drawings`(`id`) ON DELETE SET NULL
);
--> statement-breakpoint
CREATE INDEX `idx_drawings_user_id` ON `drawings` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_drawings_remix_of_id` ON `drawings` (`remix_of_id`);