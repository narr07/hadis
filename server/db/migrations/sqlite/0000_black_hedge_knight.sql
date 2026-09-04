CREATE TABLE `hadiths` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`narrator` text NOT NULL,
	`number` integer NOT NULL,
	`arab` text NOT NULL,
	`translation` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `narrator_idx` ON `hadiths` (`narrator`);--> statement-breakpoint
CREATE INDEX `narrator_number_idx` ON `hadiths` (`narrator`,`number`);