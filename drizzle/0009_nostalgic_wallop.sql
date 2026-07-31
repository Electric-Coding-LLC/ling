PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_vocabulary_knowledge` (
	`user_id` text NOT NULL,
	`item_id` text NOT NULL,
	`review_direction` text NOT NULL,
	`known_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `item_id`, `review_direction`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_vocabulary_knowledge`("user_id", "item_id", "review_direction", "known_at") SELECT "user_id", "item_id", 'meaning-to-japanese', "known_at" FROM `vocabulary_knowledge` WHERE "station_id" = 'words';--> statement-breakpoint
DROP TABLE `vocabulary_knowledge`;--> statement-breakpoint
ALTER TABLE `__new_vocabulary_knowledge` RENAME TO `vocabulary_knowledge`;--> statement-breakpoint
DELETE FROM `station_introductions` WHERE `station_id` IN ('nouns', 'verbs', 'adjectives');--> statement-breakpoint
PRAGMA foreign_keys=ON;
