/*
SQLyog Ultimate
MySQL - 8.0.30 : Database - kitadaie
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

/*Table structure for table `mutabaah_activities` */

DROP TABLE IF EXISTS `mutabaah_activities`;

CREATE TABLE `mutabaah_activities` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `description` text COLLATE utf8mb4_general_ci,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `mutabaah_activities` */

insert  into `mutabaah_activities`(`id`,`name`,`description`) values 
(1,'Istighfar 100x','Istighfar 100 times per day'),
(2,'Tahajud','Tahajud prayer'),
(3,'Dhuha','Dhuha prayer'),
(4,'Mathurat','Mathurat pagi dan petang'),
(5,'Tilawah 1 Juz','Tilawah 1 juz');

/*Table structure for table `mutabaah_entries` */

DROP TABLE IF EXISTS `mutabaah_entries`;

CREATE TABLE `mutabaah_entries` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(36) COLLATE utf8mb4_general_ci NOT NULL,
  `activity_id` int NOT NULL,
  `date` date NOT NULL,
  `completed` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_activity_date` (`user_id`,`activity_id`,`date`),
  KEY `fk_mutabaah_entries_user` (`user_id`),
  KEY `fk_mutabaah_entries_activity` (`activity_id`),
  CONSTRAINT `fk_mutabaah_entries_activity` FOREIGN KEY (`activity_id`) REFERENCES `mutabaah_activities` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_mutabaah_entries_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Table structure for table `mutabaah_settings` */

DROP TABLE IF EXISTS `mutabaah_settings`;

CREATE TABLE `mutabaah_settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(36) COLLATE utf8mb4_general_ci NOT NULL,
  `end_of_week` tinyint NOT NULL DEFAULT '0' COMMENT '0=Sunday, 1=Monday, ..., 6=Saturday',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_id` (`user_id`),
  CONSTRAINT `fk_mutabaah_settings_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
