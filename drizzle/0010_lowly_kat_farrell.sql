CREATE TABLE `network_place_visits` (
	`user_id` text NOT NULL,
	`place_id` text NOT NULL,
	`visited_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `place_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `network_place_visits` (`user_id`, `place_id`, `visited_at`)
SELECT
	`user_id`,
	CASE `station_id`
		WHEN 'mora-timing' THEN 'mora'
		WHEN 'pitch-accent' THEN 'pitch'
		WHEN 'sound-marks' THEN 'marks'
		WHEN 'combined-sounds' THEN 'combined'
		ELSE `station_id`
	END,
	`introduced_at`
FROM `station_introductions`
WHERE `station_id` IN (
	'vowels',
	'hiragana',
	'katakana',
	'sound-marks',
	'combined-sounds',
	'words',
	'mora-timing',
	'pitch-accent'
)
ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO `network_place_visits` (`user_id`, `place_id`, `visited_at`)
SELECT `user_id`, 'romaji', MIN(`known_at`)
FROM `romaji_knowledge`
GROUP BY `user_id`
ON CONFLICT DO NOTHING;
