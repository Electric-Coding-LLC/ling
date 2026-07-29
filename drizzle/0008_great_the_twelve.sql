CREATE TABLE `vocabulary_knowledge` (
	`user_id` text NOT NULL,
	`station_id` text NOT NULL,
	`item_id` text NOT NULL,
	`known_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `station_id`, `item_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
