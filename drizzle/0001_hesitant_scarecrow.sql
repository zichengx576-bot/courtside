CREATE TABLE `wearing_experiences` (
	`id` text PRIMARY KEY NOT NULL,
	`author_hash` text NOT NULL,
	`nickname` text NOT NULL,
	`shoe` text NOT NULL,
	`court` text NOT NULL,
	`rating` integer NOT NULL,
	`content` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `experiences_created_idx` ON `wearing_experiences` (`created_at`);--> statement-breakpoint
CREATE INDEX `experiences_author_idx` ON `wearing_experiences` (`author_hash`,`created_at`);