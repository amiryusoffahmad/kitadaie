-- Migration: Add spouse_id to users_profile table
-- Date: 2025-12-07
-- Purpose: Enable spouse interlinking between ikhwah and akhwat

ALTER TABLE `users_profile`
ADD COLUMN `spouse_id` varchar(36) COLLATE utf8mb4_general_ci DEFAULT NULL AFTER `murobbi_id`,
ADD KEY `fk_spouse` (`spouse_id`),
ADD CONSTRAINT `fk_spouse` FOREIGN KEY (`spouse_id`) REFERENCES `user` (`id`) ON DELETE SET NULL;
