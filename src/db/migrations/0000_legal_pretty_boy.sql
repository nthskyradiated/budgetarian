CREATE TABLE `email_verification_codes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`code` text NOT NULL,
	`email` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `expenses_categories` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text(64) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `expenses` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text(64) NOT NULL,
	`category` text(64) NOT NULL,
	`amount` real NOT NULL,
	`project_id` text NOT NULL,
	`is_recurring` integer DEFAULT false NOT NULL,
	`timestamp` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `projects_expenses_categories` (
	`id` integer PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`expense_category_id` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`expense_category_id`) REFERENCES `expenses_categories`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `projects_inflows_categories` (
	`id` integer PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`inflow_category_id` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`inflow_category_id`) REFERENCES `inflows_categories`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `inflows_categories` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text(64) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `inflows` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text(64) NOT NULL,
	`category` text(64) NOT NULL,
	`amount` real NOT NULL,
	`project_id` text NOT NULL,
	`is_recurring` integer DEFAULT false NOT NULL,
	`timestamp` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `oauth_users` (
	`user_id` text NOT NULL,
	`provider` text NOT NULL,
	`provider_user_id` text NOT NULL,
	PRIMARY KEY(`provider`, `provider_user_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `password_reset_tokens` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text(255) NOT NULL,
	`details` text(255) NOT NULL,
	`starting_funds` real NOT NULL,
	`total_funds` real NOT NULL,
	`timestamp` text DEFAULT (CURRENT_TIMESTAMP),
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text(255),
	`username` text(255),
	`email` text(255) NOT NULL,
	`password` text(255),
	`is_email_verified` integer DEFAULT false,
	`avatar_url` text,
	`auth_methods` text NOT NULL,
	`stripe_customer_id` text(100),
	`timestamp` text DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `expenses_categories_name_unique` ON `expenses_categories` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `inflows_categories_name_unique` ON `inflows_categories` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `password_reset_tokens_id_unique` ON `password_reset_tokens` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `projects_name_unique` ON `projects` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_stripe_customer_id_unique` ON `users` (`stripe_customer_id`);