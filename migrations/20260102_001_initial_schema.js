/**
 * Initial schema — mirrors kd-db-structure-020126.sql
 *
 * For EXISTING databases (prod/staging): do NOT run this migration.
 * Instead, mark it as done by inserting into knex_migrations:
 *   INSERT INTO knex_migrations (name, batch, migration_time)
 *   VALUES ('20260102_001_initial_schema.js', 1, NOW());
 *
 * For FRESH databases: run `bun db:migrate` to create all tables.
 *
 * Tables owned by better-auth (user, account, session, verification)
 * are included here so a fresh DB setup is fully self-contained.
 */

/** @param { import("knex").Knex } knex */
exports.up = async function (knex) {
  await knex.raw("SET FOREIGN_KEY_CHECKS = 0");

  // ── better-auth tables ──────────────────────────────────────────────────
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS \`user\` (
      \`id\` varchar(36) COLLATE utf8mb4_general_ci NOT NULL,
      \`name\` text COLLATE utf8mb4_general_ci NOT NULL,
      \`email\` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
      \`emailVerified\` tinyint(1) NOT NULL,
      \`image\` text COLLATE utf8mb4_general_ci,
      \`createdAt\` datetime NOT NULL,
      \`updatedAt\` datetime NOT NULL,
      \`username\` varchar(36) COLLATE utf8mb4_general_ci DEFAULT NULL,
      \`displayUsername\` text COLLATE utf8mb4_general_ci,
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`email\` (\`email\`),
      UNIQUE KEY \`username\` (\`username\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);

  await knex.raw(`
    CREATE TABLE IF NOT EXISTS \`account\` (
      \`id\` varchar(36) COLLATE utf8mb4_general_ci NOT NULL,
      \`accountId\` text COLLATE utf8mb4_general_ci NOT NULL,
      \`providerId\` text COLLATE utf8mb4_general_ci NOT NULL,
      \`userId\` varchar(36) COLLATE utf8mb4_general_ci NOT NULL,
      \`accessToken\` text COLLATE utf8mb4_general_ci,
      \`refreshToken\` text COLLATE utf8mb4_general_ci,
      \`idToken\` text COLLATE utf8mb4_general_ci,
      \`accessTokenExpiresAt\` datetime DEFAULT NULL,
      \`refreshTokenExpiresAt\` datetime DEFAULT NULL,
      \`scope\` text COLLATE utf8mb4_general_ci,
      \`password\` text COLLATE utf8mb4_general_ci,
      \`createdAt\` datetime NOT NULL,
      \`updatedAt\` datetime NOT NULL,
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);

  await knex.raw(`
    CREATE TABLE IF NOT EXISTS \`session\` (
      \`id\` varchar(36) COLLATE utf8mb4_general_ci NOT NULL,
      \`expiresAt\` datetime NOT NULL,
      \`token\` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
      \`createdAt\` datetime NOT NULL,
      \`updatedAt\` datetime NOT NULL,
      \`ipAddress\` text COLLATE utf8mb4_general_ci,
      \`userAgent\` text COLLATE utf8mb4_general_ci,
      \`userId\` varchar(36) COLLATE utf8mb4_general_ci NOT NULL,
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`token\` (\`token\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);

  await knex.raw(`
    CREATE TABLE IF NOT EXISTS \`verification\` (
      \`id\` varchar(36) COLLATE utf8mb4_general_ci NOT NULL,
      \`identifier\` text COLLATE utf8mb4_general_ci NOT NULL,
      \`value\` text COLLATE utf8mb4_general_ci NOT NULL,
      \`expiresAt\` datetime NOT NULL,
      \`createdAt\` datetime DEFAULT NULL,
      \`updatedAt\` datetime DEFAULT NULL,
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);

  // ── profile & personal data ─────────────────────────────────────────────
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS \`users_profile\` (
      \`id\` varchar(36) COLLATE utf8mb4_general_ci NOT NULL,
      \`first_name\` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
      \`gender\` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
      \`email\` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
      \`phone\` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
      \`address\` text COLLATE utf8mb4_general_ci,
      \`profile_picture\` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
      \`branch\` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
      \`income_classification\` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
      \`marital_status\` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
      \`family_status\` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
      \`murobbi_id\` varchar(36) COLLATE utf8mb4_general_ci DEFAULT NULL,
      \`created_at\` datetime DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      CONSTRAINT \`fk_users_profile_user\` FOREIGN KEY (\`id\`) REFERENCES \`user\` (\`id\`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);

  await knex.raw(`
    CREATE TABLE IF NOT EXISTS \`personal_information\` (
      \`id\` int NOT NULL AUTO_INCREMENT,
      \`user_id\` varchar(36) COLLATE utf8mb4_general_ci NOT NULL,
      \`ic_no\` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
      \`created_at\` datetime DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`uk_personal_information_user_id\` (\`user_id\`),
      UNIQUE KEY \`uk_personal_information_ic_no\` (\`ic_no\`),
      CONSTRAINT \`fk_personal_information_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\` (\`id\`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);

  await knex.raw(`
    CREATE TABLE IF NOT EXISTS \`education\` (
      \`id\` int NOT NULL AUTO_INCREMENT,
      \`user_id\` varchar(36) COLLATE utf8mb4_general_ci NOT NULL,
      \`university\` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
      \`field_of_study\` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
      \`degree\` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
      \`start_year\` varchar(4) COLLATE utf8mb4_general_ci NOT NULL,
      \`end_year\` varchar(4) COLLATE utf8mb4_general_ci DEFAULT NULL,
      \`is_current\` tinyint(1) DEFAULT '0',
      \`created_at\` datetime DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      \`course\` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
      \`scholarship\` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
      PRIMARY KEY (\`id\`),
      KEY \`fk_education_user\` (\`user_id\`),
      CONSTRAINT \`fk_education_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\` (\`id\`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);

  await knex.raw(`
    CREATE TABLE IF NOT EXISTS \`high_school\` (
      \`id\` int NOT NULL AUTO_INCREMENT,
      \`user_id\` varchar(36) COLLATE utf8mb4_general_ci NOT NULL,
      \`state\` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
      \`type\` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
      \`school_name\` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
      \`position\` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
      \`spm_result\` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
      \`highest_achievement\` text COLLATE utf8mb4_general_ci,
      \`spm_year\` varchar(4) COLLATE utf8mb4_general_ci NOT NULL,
      \`created_at\` datetime DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      KEY \`fk_high_school_user\` (\`user_id\`),
      CONSTRAINT \`fk_high_school_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\` (\`id\`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);

  await knex.raw(`
    CREATE TABLE IF NOT EXISTS \`family\` (
      \`id\` int NOT NULL AUTO_INCREMENT,
      \`user_id\` varchar(36) COLLATE utf8mb4_general_ci NOT NULL,
      \`linked_user_id\` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
      \`relationship\` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
      \`full_name\` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
      \`phone\` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
      \`occupation\` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
      \`company\` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
      \`supports_dakwah\` tinyint(1) DEFAULT '0',
      \`jemaah_name\` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
      \`created_at\` datetime DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      KEY \`FK_FAMILY_USER\` (\`user_id\`),
      KEY \`FK_FAMILY_LINKED_USER\` (\`linked_user_id\`),
      CONSTRAINT \`FK_FAMILY_LINKED_USER\` FOREIGN KEY (\`linked_user_id\`) REFERENCES \`user\` (\`id\`) ON DELETE SET NULL,
      CONSTRAINT \`FK_FAMILY_USER\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\` (\`id\`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);

  await knex.raw(`
    CREATE TABLE IF NOT EXISTS \`certification\` (
      \`id\` int NOT NULL AUTO_INCREMENT,
      \`user_id\` varchar(36) COLLATE utf8mb4_general_ci NOT NULL,
      \`type\` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
      \`name\` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
      \`issuing_institution\` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
      \`year_obtained\` varchar(4) COLLATE utf8mb4_general_ci NOT NULL,
      \`created_at\` datetime DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      KEY \`FK_CERTIFICATION_USER\` (\`user_id\`),
      CONSTRAINT \`FK_CERTIFICATION_USER\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\` (\`id\`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);

  // ── org structure ───────────────────────────────────────────────────────
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS \`departments\` (
      \`id\` int NOT NULL AUTO_INCREMENT,
      \`name\` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      \`code\` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      \`telegram_group_id\` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
      \`created_at\` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`code\` (\`code\`),
      KEY \`idx_code\` (\`code\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);

  await knex.raw(`
    CREATE TABLE IF NOT EXISTS \`org_roles\` (
      \`id\` int NOT NULL AUTO_INCREMENT,
      \`name\` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      \`code\` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      \`telegram_group_id\` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
      \`created_at\` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`code\` (\`code\`),
      KEY \`idx_code\` (\`code\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);

  await knex.raw(`
    CREATE TABLE IF NOT EXISTS \`user_roles\` (
      \`id\` bigint NOT NULL AUTO_INCREMENT,
      \`user_id\` varchar(36) COLLATE utf8mb4_general_ci DEFAULT NULL,
      \`role\` varchar(36) COLLATE utf8mb4_general_ci DEFAULT NULL,
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);

  await knex.raw(`
    CREATE TABLE IF NOT EXISTS \`user_notification_preferences\` (
      \`id\` int NOT NULL AUTO_INCREMENT,
      \`user_id\` varchar(36) COLLATE utf8mb4_general_ci NOT NULL,
      \`telegram_enabled\` tinyint(1) DEFAULT '0',
      \`telegram_chat_id\` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
      \`in_app_enabled\` tinyint(1) DEFAULT '1',
      \`created_at\` datetime DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`uk_user_notification_preferences_user_id\` (\`user_id\`),
      CONSTRAINT \`fk_user_notification_preferences_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\` (\`id\`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);

  // ── uploads (no FK constraints, referenced by many tables) ─────────────
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS \`uploads\` (
      \`id\` int NOT NULL AUTO_INCREMENT,
      \`filename\` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
      \`original_filename\` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
      \`path\` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
      \`size\` int NOT NULL,
      \`mimetype\` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
      \`user_id\` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
      \`document_type\` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
      \`reference_id\` int DEFAULT NULL,
      \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      KEY \`idx_user_id\` (\`user_id\`),
      KEY \`idx_reference_id\` (\`reference_id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);

  // ── resources ───────────────────────────────────────────────────────────
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS \`resource_categories\` (
      \`id\` int NOT NULL AUTO_INCREMENT,
      \`name\` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
      \`slug\` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
      \`description\` text COLLATE utf8mb4_unicode_ci,
      \`color\` varchar(7) COLLATE utf8mb4_unicode_ci DEFAULT '#3b82f6',
      \`created_at\` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      \`created_by\` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`slug\` (\`slug\`),
      KEY \`idx_slug\` (\`slug\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await knex.raw(`
    CREATE TABLE IF NOT EXISTS \`resources\` (
      \`id\` int NOT NULL AUTO_INCREMENT,
      \`title\` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
      \`file_id\` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
      \`category_id\` int DEFAULT NULL,
      \`tags\` text COLLATE utf8mb4_unicode_ci,
      \`description\` text COLLATE utf8mb4_unicode_ci,
      \`created_at\` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      \`created_by\` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
      \`is_active\` tinyint(1) DEFAULT '1',
      PRIMARY KEY (\`id\`),
      KEY \`idx_file\` (\`file_id\`),
      KEY \`idx_category\` (\`category_id\`),
      KEY \`idx_created_at\` (\`created_at\`),
      KEY \`idx_is_active\` (\`is_active\`),
      CONSTRAINT \`resources_ibfk_1\` FOREIGN KEY (\`category_id\`) REFERENCES \`resource_categories\` (\`id\`) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  // ── push & notifications ────────────────────────────────────────────────
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS \`push_subscriptions\` (
      \`id\` int NOT NULL AUTO_INCREMENT,
      \`user_id\` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      \`endpoint\` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      \`p256dh_key\` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      \`auth_key\` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      \`device_info\` json DEFAULT NULL,
      \`is_active\` tinyint(1) DEFAULT '1',
      \`created_at\` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      \`last_used_at\` timestamp NULL DEFAULT NULL,
      PRIMARY KEY (\`id\`),
      KEY \`idx_user_id\` (\`user_id\`),
      KEY \`idx_is_active\` (\`is_active\`),
      KEY \`idx_user_active\` (\`user_id\`,\`is_active\`),
      KEY \`idx_last_used\` (\`last_used_at\`),
      CONSTRAINT \`fk_push_subscriptions_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\` (\`id\`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);

  await knex.raw(`
    CREATE TABLE IF NOT EXISTS \`notifications\` (
      \`id\` int NOT NULL AUTO_INCREMENT,
      \`user_id\` varchar(36) COLLATE utf8mb4_general_ci NOT NULL,
      \`title\` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
      \`message\` text COLLATE utf8mb4_general_ci NOT NULL,
      \`type\` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
      \`resource_id\` varchar(36) COLLATE utf8mb4_general_ci DEFAULT NULL,
      \`resource_type\` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
      \`read\` tinyint(1) DEFAULT '0',
      \`telegram_sent\` tinyint(1) DEFAULT '0',
      \`created_at\` datetime DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      KEY \`idx_notifications_user_id\` (\`user_id\`),
      KEY \`idx_notifications_read\` (\`read\`),
      KEY \`idx_notifications_type\` (\`type\`),
      CONSTRAINT \`fk_notifications_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\` (\`id\`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);

  // ── admin notifications ─────────────────────────────────────────────────
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS \`admin_notification_templates\` (
      \`id\` int NOT NULL AUTO_INCREMENT,
      \`name\` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      \`title\` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      \`message\` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      \`created_by\` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      \`created_at\` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      KEY \`idx_created_by\` (\`created_by\`),
      KEY \`idx_name\` (\`name\`),
      CONSTRAINT \`fk_admin_notification_templates_user\` FOREIGN KEY (\`created_by\`) REFERENCES \`user\` (\`id\`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);

  await knex.raw(`
    CREATE TABLE IF NOT EXISTS \`admin_notifications\` (
      \`id\` int NOT NULL AUTO_INCREMENT,
      \`title\` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      \`message\` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      \`action_url\` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL,
      \`target_type\` enum('everyone','department','role','specific_users') COLLATE utf8mb4_general_ci NOT NULL,
      \`target_department_id\` int DEFAULT NULL,
      \`target_role_id\` int DEFAULT NULL,
      \`target_user_ids\` json DEFAULT NULL,
      \`schedule_type\` enum('immediate','scheduled','recurring') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'immediate',
      \`scheduled_at\` datetime DEFAULT NULL,
      \`recurrence_pattern\` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
      \`recurrence_config\` json DEFAULT NULL,
      \`status\` enum('draft','scheduled','sent','cancelled','recurring_active') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'draft',
      \`sent_at\` datetime DEFAULT NULL,
      \`sent_count\` int DEFAULT '0',
      \`template_id\` int DEFAULT NULL,
      \`created_by\` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      \`created_at\` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      KEY \`idx_status\` (\`status\`),
      KEY \`idx_scheduled_at\` (\`scheduled_at\`),
      KEY \`idx_target_type\` (\`target_type\`),
      KEY \`idx_created_by\` (\`created_by\`),
      KEY \`idx_target_department\` (\`target_department_id\`),
      KEY \`idx_target_role\` (\`target_role_id\`),
      KEY \`idx_template\` (\`template_id\`),
      KEY \`idx_action_url\` (\`action_url\`(255)),
      CONSTRAINT \`fk_admin_notifications_department\` FOREIGN KEY (\`target_department_id\`) REFERENCES \`departments\` (\`id\`) ON DELETE SET NULL,
      CONSTRAINT \`fk_admin_notifications_role\` FOREIGN KEY (\`target_role_id\`) REFERENCES \`org_roles\` (\`id\`) ON DELETE SET NULL,
      CONSTRAINT \`fk_admin_notifications_template\` FOREIGN KEY (\`template_id\`) REFERENCES \`admin_notification_templates\` (\`id\`) ON DELETE SET NULL,
      CONSTRAINT \`fk_admin_notifications_user\` FOREIGN KEY (\`created_by\`) REFERENCES \`user\` (\`id\`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);

  await knex.raw(`
    CREATE TABLE IF NOT EXISTS \`admin_notification_recipients\` (
      \`id\` int NOT NULL AUTO_INCREMENT,
      \`admin_notification_id\` int NOT NULL,
      \`notification_id\` int NOT NULL,
      \`user_id\` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      \`delivered_at\` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
      \`push_sent\` tinyint(1) DEFAULT '0',
      \`push_sent_at\` timestamp NULL DEFAULT NULL,
      PRIMARY KEY (\`id\`),
      KEY \`idx_admin_notification\` (\`admin_notification_id\`),
      KEY \`idx_notification\` (\`notification_id\`),
      KEY \`idx_user\` (\`user_id\`),
      KEY \`idx_push_sent\` (\`push_sent\`),
      CONSTRAINT \`fk_admin_notification_recipients_admin_notification\` FOREIGN KEY (\`admin_notification_id\`) REFERENCES \`admin_notifications\` (\`id\`) ON DELETE CASCADE,
      CONSTRAINT \`fk_admin_notification_recipients_notification\` FOREIGN KEY (\`notification_id\`) REFERENCES \`notifications\` (\`id\`) ON DELETE CASCADE,
      CONSTRAINT \`fk_admin_notification_recipients_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\` (\`id\`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);

  await knex.raw(`
    CREATE TABLE IF NOT EXISTS \`admin_notification_recurrence_log\` (
      \`id\` int NOT NULL AUTO_INCREMENT,
      \`admin_notification_id\` int NOT NULL,
      \`execution_date\` date NOT NULL,
      \`sent_count\` int DEFAULT '0',
      \`executed_at\` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
      \`status\` enum('success','failed','partial') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'success',
      \`error_message\` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`uk_admin_notification_execution_date\` (\`admin_notification_id\`,\`execution_date\`),
      KEY \`idx_admin_notification\` (\`admin_notification_id\`),
      KEY \`idx_execution_date\` (\`execution_date\`),
      CONSTRAINT \`fk_admin_notification_recurrence_log\` FOREIGN KEY (\`admin_notification_id\`) REFERENCES \`admin_notifications\` (\`id\`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);

  // ── mutabaah ────────────────────────────────────────────────────────────
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS \`mutabaah_activities\` (
      \`id\` int NOT NULL AUTO_INCREMENT,
      \`name\` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
      \`description\` text COLLATE utf8mb4_general_ci,
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);

  await knex.raw(`
    CREATE TABLE IF NOT EXISTS \`mutabaah_entries\` (
      \`id\` int NOT NULL AUTO_INCREMENT,
      \`user_id\` varchar(36) COLLATE utf8mb4_general_ci NOT NULL,
      \`activity_id\` int NOT NULL,
      \`date\` date NOT NULL,
      \`completed\` tinyint(1) DEFAULT '0',
      \`created_at\` datetime DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`uk_user_activity_date\` (\`user_id\`,\`activity_id\`,\`date\`),
      KEY \`fk_mutabaah_entries_user\` (\`user_id\`),
      KEY \`fk_mutabaah_entries_activity\` (\`activity_id\`),
      CONSTRAINT \`fk_mutabaah_entries_activity\` FOREIGN KEY (\`activity_id\`) REFERENCES \`mutabaah_activities\` (\`id\`) ON DELETE CASCADE,
      CONSTRAINT \`fk_mutabaah_entries_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\` (\`id\`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);

  await knex.raw(`
    CREATE TABLE IF NOT EXISTS \`mutabaah_settings\` (
      \`id\` int NOT NULL AUTO_INCREMENT,
      \`user_id\` varchar(36) COLLATE utf8mb4_general_ci NOT NULL,
      \`end_of_week\` tinyint NOT NULL DEFAULT '0',
      \`created_at\` datetime DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`uk_user_id\` (\`user_id\`),
      CONSTRAINT \`fk_mutabaah_settings_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\` (\`id\`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);

  // ── pentajmikan ─────────────────────────────────────────────────────────
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS \`pentajmikan\` (
      \`id\` int NOT NULL AUTO_INCREMENT,
      \`name\` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
      \`description\` text COLLATE utf8mb4_general_ci,
      \`total_participants\` int DEFAULT '0',
      \`date\` datetime NOT NULL,
      \`niche\` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
      \`image_id\` int DEFAULT NULL,
      \`created_by\` varchar(36) COLLATE utf8mb4_general_ci NOT NULL,
      \`created_at\` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      KEY \`image_id\` (\`image_id\`),
      KEY \`created_by\` (\`created_by\`),
      CONSTRAINT \`pentajmikan_ibfk_1\` FOREIGN KEY (\`image_id\`) REFERENCES \`uploads\` (\`id\`) ON DELETE SET NULL,
      CONSTRAINT \`pentajmikan_ibfk_2\` FOREIGN KEY (\`created_by\`) REFERENCES \`user\` (\`id\`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);

  await knex.raw(`
    CREATE TABLE IF NOT EXISTS \`pentajmikan_participants\` (
      \`id\` int NOT NULL AUTO_INCREMENT,
      \`pentajmikan_id\` int NOT NULL,
      \`user_id\` varchar(36) COLLATE utf8mb4_general_ci NOT NULL,
      \`created_at\` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`unique_participation\` (\`pentajmikan_id\`,\`user_id\`),
      KEY \`user_id\` (\`user_id\`),
      CONSTRAINT \`pentajmikan_participants_ibfk_1\` FOREIGN KEY (\`pentajmikan_id\`) REFERENCES \`pentajmikan\` (\`id\`) ON DELETE CASCADE,
      CONSTRAINT \`pentajmikan_participants_ibfk_2\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\` (\`id\`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);

  // ── tprog ───────────────────────────────────────────────────────────────
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS \`tprog_class\` (
      \`id\` int NOT NULL AUTO_INCREMENT,
      \`class_code\` varchar(6) COLLATE utf8mb4_general_ci NOT NULL,
      \`name\` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
      \`description\` text COLLATE utf8mb4_general_ci,
      \`created_by\` varchar(36) COLLATE utf8mb4_general_ci NOT NULL,
      \`created_at\` datetime DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`uk_class_code\` (\`class_code\`),
      KEY \`fk_class_creator\` (\`created_by\`),
      CONSTRAINT \`fk_class_creator\` FOREIGN KEY (\`created_by\`) REFERENCES \`user\` (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);

  await knex.raw(`
    CREATE TABLE IF NOT EXISTS \`tprog_assignment\` (
      \`id\` int NOT NULL AUTO_INCREMENT,
      \`class_id\` int NOT NULL,
      \`title\` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
      \`instructions\` text COLLATE utf8mb4_general_ci,
      \`due_date\` datetime NOT NULL,
      \`created_at\` datetime DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      \`file_id\` int DEFAULT NULL,
      PRIMARY KEY (\`id\`),
      KEY \`fk_assignment_class\` (\`class_id\`),
      KEY \`fk_assignment_file\` (\`file_id\`),
      CONSTRAINT \`fk_assignment_class\` FOREIGN KEY (\`class_id\`) REFERENCES \`tprog_class\` (\`id\`),
      CONSTRAINT \`fk_assignment_file\` FOREIGN KEY (\`file_id\`) REFERENCES \`uploads\` (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);

  await knex.raw(`
    CREATE TABLE IF NOT EXISTS \`tprog_enrollment\` (
      \`id\` int NOT NULL AUTO_INCREMENT,
      \`class_id\` int NOT NULL,
      \`user_id\` varchar(36) COLLATE utf8mb4_general_ci NOT NULL,
      \`status\` enum('active','inactive') COLLATE utf8mb4_general_ci DEFAULT 'active',
      \`enrolled_at\` datetime DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`uk_class_user\` (\`class_id\`,\`user_id\`),
      KEY \`fk_enrollment_user\` (\`user_id\`),
      CONSTRAINT \`fk_enrollment_class\` FOREIGN KEY (\`class_id\`) REFERENCES \`tprog_class\` (\`id\`),
      CONSTRAINT \`fk_enrollment_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\` (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);

  await knex.raw(`
    CREATE TABLE IF NOT EXISTS \`tprog_submission\` (
      \`id\` int NOT NULL AUTO_INCREMENT,
      \`assignment_id\` int NOT NULL,
      \`user_id\` varchar(36) COLLATE utf8mb4_general_ci NOT NULL,
      \`status\` enum('not_submitted','pending_review','approved','overdue') COLLATE utf8mb4_general_ci DEFAULT 'not_submitted',
      \`file_id\` int DEFAULT NULL,
      \`submitted_at\` datetime DEFAULT NULL,
      \`created_at\` datetime DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      \`feedback\` text COLLATE utf8mb4_general_ci,
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`uk_assignment_user\` (\`assignment_id\`,\`user_id\`),
      KEY \`fk_submission_user\` (\`user_id\`),
      KEY \`fk_submission_file\` (\`file_id\`),
      CONSTRAINT \`fk_submission_assignment\` FOREIGN KEY (\`assignment_id\`) REFERENCES \`tprog_assignment\` (\`id\`),
      CONSTRAINT \`fk_submission_file\` FOREIGN KEY (\`file_id\`) REFERENCES \`uploads\` (\`id\`),
      CONSTRAINT \`fk_submission_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\` (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);

  await knex.raw(`
    CREATE TABLE IF NOT EXISTS \`tprog_role\` (
      \`id\` int NOT NULL AUTO_INCREMENT,
      \`username_student\` varchar(36) COLLATE utf8mb4_general_ci DEFAULT NULL,
      \`username_advisor\` varchar(36) COLLATE utf8mb4_general_ci DEFAULT NULL,
      PRIMARY KEY (\`id\`),
      KEY \`fk_student\` (\`username_student\`),
      KEY \`fk_advisor\` (\`username_advisor\`),
      CONSTRAINT \`fk_advisor\` FOREIGN KEY (\`username_advisor\`) REFERENCES \`user\` (\`username\`),
      CONSTRAINT \`fk_student\` FOREIGN KEY (\`username_student\`) REFERENCES \`user\` (\`username\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);

  // ── hq tree ─────────────────────────────────────────────────────────────
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS \`hq_tree\` (
      \`id\` int NOT NULL AUTO_INCREMENT,
      \`username_mt\` varchar(36) COLLATE utf8mb4_general_ci DEFAULT NULL,
      \`username_m\` varchar(36) COLLATE utf8mb4_general_ci DEFAULT NULL,
      PRIMARY KEY (\`id\`),
      KEY \`fk_mt\` (\`username_mt\`),
      KEY \`fk_m\` (\`username_m\`),
      CONSTRAINT \`fk_m\` FOREIGN KEY (\`username_m\`) REFERENCES \`user\` (\`username\`),
      CONSTRAINT \`fk_mt\` FOREIGN KEY (\`username_mt\`) REFERENCES \`user\` (\`username\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);

  // ── events ──────────────────────────────────────────────────────────────
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS \`events\` (
      \`id\` int NOT NULL AUTO_INCREMENT,
      \`name\` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
      \`description\` text COLLATE utf8mb4_general_ci,
      \`start_date\` datetime NOT NULL,
      \`end_date\` datetime DEFAULT NULL,
      \`venue\` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
      \`max_participants\` int DEFAULT NULL,
      \`current_registrations\` int DEFAULT '0',
      \`image_id\` int DEFAULT NULL,
      \`is_active\` tinyint(1) DEFAULT '1',
      \`created_by\` varchar(36) COLLATE utf8mb4_general_ci NOT NULL,
      \`created_at\` datetime DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      KEY \`fk_event_image\` (\`image_id\`),
      KEY \`fk_event_creator\` (\`created_by\`),
      CONSTRAINT \`fk_event_creator\` FOREIGN KEY (\`created_by\`) REFERENCES \`user\` (\`id\`),
      CONSTRAINT \`fk_event_image\` FOREIGN KEY (\`image_id\`) REFERENCES \`uploads\` (\`id\`) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);

  await knex.raw("SET FOREIGN_KEY_CHECKS = 1");
};

/** @param { import("knex").Knex } knex */
exports.down = async function (knex) {
  await knex.raw("SET FOREIGN_KEY_CHECKS = 0");

  const tables = [
    "events",
    "hq_tree",
    "tprog_role",
    "tprog_submission",
    "tprog_enrollment",
    "tprog_assignment",
    "tprog_class",
    "pentajmikan_participants",
    "pentajmikan",
    "mutabaah_settings",
    "mutabaah_entries",
    "mutabaah_activities",
    "admin_notification_recurrence_log",
    "admin_notification_recipients",
    "admin_notifications",
    "admin_notification_templates",
    "notifications",
    "push_subscriptions",
    "resources",
    "resource_categories",
    "uploads",
    "user_notification_preferences",
    "user_roles",
    "org_roles",
    "departments",
    "certification",
    "family",
    "high_school",
    "education",
    "personal_information",
    "users_profile",
    "verification",
    "session",
    "account",
    "user",
  ];

  for (const table of tables) {
    await knex.schema.dropTableIfExists(table);
  }

  await knex.raw("SET FOREIGN_KEY_CHECKS = 1");
};
