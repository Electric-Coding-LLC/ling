CREATE TABLE `station_introductions` (
	`user_id` text NOT NULL,
	`station_id` text NOT NULL,
	`introduced_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `station_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
