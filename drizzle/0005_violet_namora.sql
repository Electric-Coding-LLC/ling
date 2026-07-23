CREATE TABLE `mora_timing_knowledge` (
	`user_id` text NOT NULL,
	`review_id` text NOT NULL,
	`known_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `review_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
