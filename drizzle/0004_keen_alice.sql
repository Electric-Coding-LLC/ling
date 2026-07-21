CREATE TABLE `kana_extension_knowledge` (
	`user_id` text NOT NULL,
	`pattern_id` text NOT NULL,
	`known_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `pattern_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
