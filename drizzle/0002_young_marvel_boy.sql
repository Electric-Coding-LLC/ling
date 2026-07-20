CREATE TABLE `hiragana_knowledge` (
	`user_id` text NOT NULL,
	`kana` text NOT NULL,
	`known_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `kana`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
