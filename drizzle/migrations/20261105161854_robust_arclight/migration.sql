CREATE TABLE `likes` (
	`user_id` text NOT NULL,
	`drawing_id` text NOT NULL,
	`created_at` integer NOT NULL,
	CONSTRAINT `likes_pk` PRIMARY KEY(`user_id`, `drawing_id`),
	CONSTRAINT `fk_likes_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_likes_drawing_id_drawings_id_fk` FOREIGN KEY (`drawing_id`) REFERENCES `drawings`(`id`) ON DELETE CASCADE
);
