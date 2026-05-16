-- phpMyAdmin SQL Dump
-- version 4.7.1
-- https://www.phpmyadmin.net/
--
-- Host: mc-mysql01.mc-host24.de
-- Erstellungszeit: 16. Mai 2026 um 21:47
-- Server-Version: 10.5.23-MariaDB-0+deb11u1
-- PHP-Version: 7.0.33-0ubuntu0.16.04.16

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Datenbank: `s4203_reports`
--

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `admin_audit_logs`
--

CREATE TABLE `admin_audit_logs` (
  `id` int(11) NOT NULL,
  `actor_id` int(11) NOT NULL,
  `action` varchar(64) NOT NULL,
  `entity_type` varchar(64) NOT NULL,
  `entity_id` int(11) DEFAULT NULL,
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL
) ;

--
-- Daten für Tabelle `admin_audit_logs`
--

INSERT INTO `admin_audit_logs` (`id`, `actor_id`, `action`, `entity_type`, `entity_id`, `details`, `created_at`) VALUES
(15, 17, 'update', 'user', 17, '{\"email\": \"timo_wigger@sluz.ch\", \"role\": \"admin\", \"class_id\": 4, \"is_active\": true}', '2025-10-30 14:57:01'),
(16, 17, 'update', 'user', 17, '{\"email\": \"timo_wigger@sluz.ch\", \"role\": \"admin\", \"class_id\": 2, \"is_active\": true}', '2025-10-30 14:57:50'),
(17, 17, 'update', 'user', 1, '{\"email\": \"admin@localhost\", \"role\": \"admin\", \"is_active\": true}', '2025-10-31 08:12:11'),
(18, 17, 'update', 'user', 14, '{\"email\": \"joseph_stuecklin@sluz.ch\", \"role\": \"class_admin\", \"class_id\": 2, \"is_active\": true}', '2025-10-31 08:16:26'),
(19, 17, 'update', 'user', 14, '{\"email\": \"joseph_stuecklin@sluz.ch\", \"role\": \"class_admin\", \"class_id\": 8, \"is_active\": true}', '2025-10-31 08:50:22'),
(20, 17, 'update', 'user', 14, '{\"email\": \"joseph_stuecklin@sluz.ch\", \"role\": \"class_admin\", \"class_id\": 2, \"is_active\": true}', '2025-10-31 08:50:44'),
(21, 17, 'update', 'user', 14, '{\"email\": \"joseph_stuecklin@sluz.ch\", \"role\": \"teacher\", \"class_id\": 1, \"is_active\": true}', '2025-10-31 08:51:44'),
(22, 17, 'update', 'user', 14, '{\"email\": \"joseph_stuecklin@sluz.ch\", \"role\": \"class_admin\", \"class_id\": 2, \"is_active\": true}', '2025-10-31 08:52:23'),
(23, 17, 'update', 'user', 14, '{\"email\": \"joseph_stuecklin@sluz.ch\", \"role\": \"teacher\", \"class_id\": 2, \"is_active\": true}', '2025-10-31 10:42:22'),
(24, 17, 'update', 'user', 14, '{\"email\": \"joseph_stuecklin@sluz.ch\", \"role\": \"class_admin\", \"class_id\": 2, \"is_active\": true}', '2025-10-31 10:43:45'),
(25, 17, 'update', 'user', 20, '{\"email\": \"kevin_ottiger@sluz.ch\", \"role\": \"class_admin\", \"class_id\": 2, \"is_active\": true}', '2025-10-31 14:44:07'),
(26, 17, 'update', 'user', 21, '{\"email\": \"valentin_wurmet@sluz.ch\", \"role\": \"class_admin\", \"class_id\": 2, \"is_active\": true}', '2025-11-03 08:49:31'),
(27, 17, 'update', 'user', 14, '{\"email\": \"joseph_stuecklin@sluz.ch\", \"role\": \"student\", \"class_id\": 2, \"is_active\": true}', '2025-11-03 08:49:37'),
(28, 17, 'update', 'user', 12, '{\"email\": \"armon_elvedi@sluz.ch\", \"role\": \"student\", \"class_id\": 7, \"is_active\": true}', '2025-11-03 11:54:13'),
(29, 17, 'delete', 'user', 12, '{}', '2025-11-03 11:55:14'),
(30, 17, 'update', 'user', 22, '{\"email\": \"armon_elvedi@sluz.ch\", \"role\": \"class_admin\", \"class_id\": 7, \"is_active\": true}', '2025-11-03 11:59:50'),
(31, 17, 'update', 'user', 17, '{\"email\": \"timo_wigger@sluz.ch\", \"role\": \"teacher\", \"class_id\": 2, \"is_active\": true}', '2025-11-03 15:36:32'),
(32, 17, 'update', 'user', 14, '{\"email\": \"joseph_stuecklin@sluz.ch\", \"role\": \"class_admin\", \"class_id\": 2, \"is_active\": true}', '2025-11-03 15:47:59'),
(33, 17, 'update', 'user', 14, '{\"email\": \"joseph_stuecklin@sluz.ch\", \"role\": \"student\", \"class_id\": 2, \"is_active\": true}', '2025-11-03 15:59:24'),
(34, 17, 'update', 'user', 13, '{\"email\": \"jakob_norer@sluz.ch\", \"role\": \"class_admin\", \"class_id\": 4, \"is_active\": true}', '2025-11-03 15:59:37'),
(35, 17, 'create', 'class', 11, '{\"slug\": \"k23a\", \"title\": \"K23a\", \"is_active\": true}', '2025-11-03 16:00:04'),
(36, 17, 'create', 'user', 23, '{\"email\": \"timowigger8@gmail.com\", \"role\": \"student\", \"class_id\": 2, \"is_active\": true}', '2025-11-03 16:05:30'),
(37, 17, 'update', 'user', 9, '{\"email\": \"david_iellamo@sluz.ch\", \"role\": \"class_admin\", \"class_id\": 4, \"is_active\": true}', '2025-11-05 13:42:15'),
(38, 17, 'create', 'user', 24, '{\"email\": \"claudia.pinna@sluz.ch\", \"role\": \"teacher\", \"class_id\": 1, \"is_active\": true}', '2025-11-05 13:55:08'),
(39, 17, 'delete', 'user', 24, '{}', '2025-11-05 13:55:30'),
(40, 17, 'create', 'user', 25, '{\"email\": \"claudio.pinna@sluz.ch\", \"role\": \"teacher\", \"class_id\": 1, \"is_active\": true}', '2025-11-05 13:59:00'),
(41, 17, 'delete', 'user', 25, '{}', '2025-11-05 23:02:28'),
(42, 17, 'update', 'user', 26, '{\"email\": \"jan_christen@sluz.ch\", \"role\": \"class_admin\", \"class_id\": 4, \"is_active\": true}', '2025-11-12 12:16:54'),
(43, 17, 'delete', 'user', 21, '{}', '2025-11-13 09:39:18'),
(44, 17, 'update', 'user', 23, '{\"email\": \"timowigger8@gmail.com\", \"role\": \"student\", \"class_id\": 2, \"is_active\": false}', '2025-11-26 14:36:42'),
(45, 17, 'update', 'user', 23, '{\"email\": \"timowigger8@gmail.com\", \"role\": \"student\", \"class_id\": 2, \"is_active\": true}', '2025-11-26 14:37:33'),
(46, 17, 'create', 'class', 12, '{\"slug\": \"U24f\", \"title\": \"U24f\", \"is_active\": true}', '2025-12-17 12:18:06'),
(47, 17, 'create', 'user', 29, '{\"email\": \"timothee.liniger@sluz.ch\", \"role\": \"teacher\", \"class_id\": null, \"is_active\": true}', '2025-12-18 13:24:35'),
(48, 17, 'create', 'class', 13, '{\"slug\": \"Testklasse\", \"title\": \"Testklasse\", \"is_active\": true}', '2025-12-18 13:27:58'),
(49, 17, 'update', 'user', 29, '{\"email\": \"timothee.liniger@sluz.ch\", \"role\": \"teacher\", \"is_active\": true}', '2025-12-19 08:24:31'),
(50, 17, 'update', 'user', 29, '{\"email\": \"timothee.liniger@sluz.ch\", \"role\": \"teacher\", \"class_id\": 13, \"is_active\": true}', '2025-12-19 08:30:07'),
(51, 17, 'update', 'user', 17, '{\"email\": \"timo_wigger@sluz.ch\", \"role\": \"admin\", \"class_id\": 13, \"is_active\": true}', '2025-12-19 08:30:31'),
(52, 17, 'update', 'user', 17, '{\"email\": \"timo_wigger@sluz.ch\", \"role\": \"admin\", \"class_id\": 2, \"is_active\": true}', '2025-12-19 08:31:34'),
(53, 17, 'update', 'user', 29, '{\"email\": \"timothee.liniger@sluz.ch\", \"role\": \"teacher\", \"class_id\": 1, \"is_active\": true}', '2025-12-19 08:31:43'),
(54, 17, 'update', 'user', 29, '{\"email\": \"timothee.liniger@sluz.ch\", \"role\": \"admin\", \"class_id\": 1, \"is_active\": true}', '2026-01-02 15:16:44'),
(55, 17, 'update', 'class', 13, '{\"slug\": \"T26a\", \"title\": \"Testklasse\", \"description\": \"Testklasse\", \"is_active\": true}', '2026-01-02 15:17:30'),
(56, 17, 'delete', 'class', 13, '{}', '2026-01-05 23:15:55'),
(57, 17, 'create', 'class', 14, '{\"slug\": \"T26a\", \"title\": \"Testklasse\", \"is_active\": true}', '2026-01-05 23:16:09'),
(58, 17, 'update', 'user', 29, '{\"email\": \"timothee.liniger@sluz.ch\", \"role\": \"admin\", \"class_id\": 14, \"is_active\": true}', '2026-01-05 23:16:19'),
(59, 17, 'update', 'class', 14, '{\"slug\": \"T26a\", \"title\": \"T26a\", \"description\": \"Testklasse\", \"is_active\": true}', '2026-01-05 23:17:38'),
(60, 17, 'create', 'class', 15, '{\"slug\": \"L22a\", \"title\": \"L22a\", \"is_active\": true}', '2026-01-05 23:23:05'),
(61, 17, 'update', 'user', 29, '{\"email\": \"timothee.liniger@sluz.ch\", \"role\": \"admin\", \"class_id\": 1, \"is_active\": true}', '2026-01-05 23:23:32'),
(62, 17, 'delete', 'class', 14, '{}', '2026-01-05 23:23:41'),
(63, 17, 'delete', 'class', 15, '{}', '2026-01-05 23:23:47'),
(64, 17, 'create', 'class', 16, '{\"slug\": \"T26c\", \"title\": \"T26c\", \"is_active\": true}', '2026-01-05 23:24:14'),
(65, 17, 'update', 'class', 16, '{\"slug\": \"T24c\", \"title\": \"T24c\", \"description\": \"Klasse T24c\", \"is_active\": true}', '2026-01-05 23:24:54'),
(66, 17, 'update', 'user', 14, '{\"email\": \"joseph_stuecklin@sluz.ch\", \"role\": \"student\", \"class_id\": 2, \"is_active\": false}', '2026-01-12 16:30:55'),
(67, 17, 'update', 'user', 14, '{\"email\": \"joseph_stuecklin@sluz.ch\", \"role\": \"student\", \"class_id\": 2, \"is_active\": true}', '2026-01-12 16:31:16'),
(68, 17, 'update', 'user', 23, '{\"email\": \"timowigger8@gmail.com\", \"role\": \"student\", \"class_id\": 2, \"is_active\": true}', '2026-01-21 21:19:42'),
(69, 17, 'update', 'user', 22, '{\"email\": \"armon_elvedi@sluz.ch\", \"role\": \"class_admin\", \"class_id\": 7, \"is_active\": true}', '2026-01-22 12:45:55'),
(70, 17, 'update', 'user', 14, '{\"email\": \"joseph_stuecklin@sluz.ch\", \"role\": \"class_admin\", \"class_id\": 2, \"is_active\": true}', '2026-02-02 08:29:49'),
(71, 17, 'delete', 'class', 16, '{}', '2026-02-02 13:22:33'),
(72, 17, 'update', 'user', 29, '{\"email\": \"timothee.liniger@sluz.ch\", \"role\": \"teacher\", \"class_id\": 1, \"is_active\": true}', '2026-02-26 10:57:44'),
(73, 17, 'update', 'user', 31, '{\"email\": \"tim_wolf@sluz.ch\", \"role\": \"class_admin\", \"class_id\": 2, \"is_active\": true}', '2026-03-25 10:41:29'),
(74, 17, 'update', 'user', 22, '{\"email\": \"armon_elvedi@sluz.ch\", \"role\": \"class_admin\", \"class_id\": 7, \"is_active\": true}', '2026-04-20 12:13:35'),
(75, 17, 'update', 'user', 22, '{\"email\": \"armon_elvedi@sluz.ch\", \"role\": \"class_admin\", \"class_id\": 7, \"is_active\": true}', '2026-04-20 12:14:11'),
(76, 17, 'update', 'user', 32, '{\"email\": \"stinematilda_walter@sluz.ch\", \"role\": \"class_admin\", \"class_id\": 2, \"is_active\": true}', '2026-04-21 22:21:47'),
(77, 17, 'update', 'user', 31, '{\"email\": \"tim_wolf@sluz.ch\", \"role\": \"student\", \"class_id\": 2, \"is_active\": true}', '2026-04-21 22:21:53'),
(78, 17, 'create', 'user', 33, '{\"email\": \"marisa_angiola@yahoo.de\", \"role\": \"student\", \"class_id\": 2, \"is_active\": true}', '2026-04-29 23:23:54'),
(79, 17, 'create', 'class', 17, '{\"slug\": \"L25a\", \"title\": \"L25a\", \"is_active\": true}', '2026-04-30 14:31:05'),
(80, 17, 'update', 'user', 32, '{\"email\": \"stinematilda_walter@sluz.ch\", \"role\": \"admin\", \"class_id\": 2, \"is_active\": true}', '2026-04-30 14:32:39'),
(81, 17, 'update', 'user', 32, '{\"email\": \"stinematilda_walter@sluz.ch\", \"role\": \"teacher\", \"class_id\": 2, \"is_active\": true}', '2026-05-04 08:30:45'),
(82, 17, 'update', 'user', 32, '{\"email\": \"stinematilda_walter@sluz.ch\", \"role\": \"admin\", \"class_id\": 2, \"is_active\": true}', '2026-05-04 08:37:08'),
(83, 17, 'update', 'user', 34, '{\"email\": \"claudia.waterbaer@sluz.ch\", \"role\": \"teacher\", \"class_id\": 1, \"is_active\": true}', '2026-05-12 09:38:16');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `app_versions`
--

CREATE TABLE `app_versions` (
  `id` int(11) NOT NULL,
  `version` varchar(20) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `app_versions`
--

INSERT INTO `app_versions` (`id`, `version`, `created_at`) VALUES
(1, 'v1.4.10-dev', '2025-02-13 14:55:22'),
(2, 'v1.4.11-dev', '2025-02-13 15:32:53'),
(3, 'v1.4.13-dev', '2025-02-13 15:38:31'),
(4, 'v1.4.14-dev', '2025-02-14 10:40:09'),
(5, 'v1.5.1-dev', '2025-02-17 09:32:33'),
(6, 'v1.5.2-dev', '2025-02-18 11:07:00'),
(7, 'v1.5.3-dev', '2025-03-09 17:01:55'),
(8, 'v1.5.4-dev', '2025-03-13 16:19:11'),
(9, 'v1.5.5-dev', '2025-03-14 12:29:20');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `aufgaben`
--

CREATE TABLE `aufgaben` (
  `id` int(11) NOT NULL,
  `typ` enum('hausaufgabe','pruefung') NOT NULL,
  `klasse` varchar(20) DEFAULT 'all',
  `fachkuerzel` varchar(10) NOT NULL,
  `beschreibung` text NOT NULL,
  `faellig_am` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `aufgaben`
--

INSERT INTO `aufgaben` (`id`, `typ`, `klasse`, `fachkuerzel`, `beschreibung`, `faellig_am`) VALUES
(23, 'hausaufgabe', 'all', 'BI', 'Arbeitsauftäge von KW 15,19,20', '2025-05-30 00:00:00'),
(24, 'hausaufgabe', 'all', 'EN', '*AUFGABE:* test correction GWB1+ unit 7, *INFO:* Full sentences in ex. 1 & 2', '2025-05-13 09:50:00'),
(25, 'hausaufgabe', 'all', 'EN', 'GWB1+ workbook: p.68', '2025-05-15 10:40:00'),
(26, 'hausaufgabe', 'all', 'GS', 'Arbeitsauftrag 15.05.2025 \"Deutsche Einigung\"', '2025-05-28 08:50:00'),
(27, 'hausaufgabe', 'all', 'IN', 'Aufgabe 3 in Kapitel 2', '2025-06-05 15:00:00'),
(30, 'pruefung', 'all', 'IT', 'Langenscheidt S 177-206', '2025-05-27 14:00:00'),
(31, 'pruefung', 'all', 'MA', 'Vektorgeometrie', '2025-06-18 12:00:00'),
(32, 'pruefung', 'all', 'IN', 'Datenbanken NEU', '2025-05-14 08:00:00'),
(33, 'pruefung', 'all', 'EN', 'Abgabe Extract', '2025-05-27 00:00:00'),
(34, 'pruefung', 'all', 'SPM-PS', 'SF Physikprüfung 4', '2025-05-15 13:10:00'),
(35, 'pruefung', 'all', 'BI', 'Evolution', '2025-06-06 15:00:00'),
(36, 'pruefung', 'all', 'SPM-MA', 'Komplexe Zahlen, Verschiebedatum 10.06.2025', '2025-06-03 00:00:00'),
(37, 'pruefung', 'all', 'GS', 'Essay', '2025-06-11 08:50:00'),
(38, 'pruefung', 'all', 'FR', 'Langenscheidt Prüfung zwei S. 47 - 80', '2025-05-16 08:00:00'),
(39, 'pruefung', 'all', 'IN', 'Informationen und Daten', '2025-06-18 08:00:00'),
(45, 'hausaufgabe', 'all', 'BI', 'Arbeitsauftäge von KW 15,19,20', '2025-06-06 00:00:00'),
(46, 'hausaufgabe', 'all', 'EN', '*AUFGABE:* test correction GWB1+ unit 7, *INFO:* Full sentences in ex. 1 & 2', '2025-05-13 09:50:00'),
(47, 'hausaufgabe', 'all', 'EN', 'GWB1+ workbook: p.68', '2025-05-15 10:40:00'),
(48, 'hausaufgabe', 'all', 'GS', '*Arbeitsauftrag vom 15.05.2025:* Kapitel \"Deutsche Einigung\" lesen und anschliessend die Aufgaben dazu lösen', '2025-05-28 00:00:00'),
(49, 'hausaufgabe', 'all', 'IN', 'Aufgabe 3 in Kapitel 2 und *binär 5*', '2025-06-05 00:00:00'),
(50, 'hausaufgabe', 'all', 'IT', 'Buch Kapitel 3 lesen + Aufgabenblatt Kapitel 6 lösen', '2025-06-03 14:00:00'),
(51, 'hausaufgabe', 'all', 'EN', 'GWB1+ workbook Seite 73', '2025-06-03 09:50:00'),
(52, 'pruefung', 'all', 'IT', 'Langenscheidt S 177-206', '2025-05-27 14:00:00'),
(53, 'pruefung', 'all', 'MA', 'Vektorgeometrie', '2025-06-18 12:00:00'),
(54, 'pruefung', 'all', 'IN', 'Datenbanken NEU', '2025-05-14 08:00:00'),
(55, 'pruefung', 'all', 'EN', 'Abgabe Extract', '2025-05-27 00:00:00'),
(56, 'pruefung', 'all', 'SPM-PS', 'SF Physikprüfung 4', '2025-05-15 13:10:00'),
(57, 'pruefung', 'all', 'BI', 'Ökologie', '2025-06-06 00:00:00'),
(58, 'pruefung', 'all', 'SPM-MA', 'Komplexe Zahlen, Verschiebedatum 10.06.2025', '2025-06-03 00:00:00'),
(59, 'pruefung', 'all', 'GS', 'Essay', '2025-06-11 08:50:00'),
(60, 'pruefung', 'all', 'FR', 'Langenscheidt Prüfung zwei S. 47 - 80', '2025-05-16 08:00:00'),
(61, 'pruefung', 'all', 'IN', 'Informationen und Daten', '2025-06-18 08:00:00'),
(62, 'pruefung', 'all', 'EN', '*Mündlich Prüfungen E12:* \n11:30 Timo, 11:45 Joseph, 12:00 Marvin, 12:15 Beatriz, 12:30 Liana, 12:45 Jonas', '2025-06-03 00:00:00'),
(63, 'pruefung', 'all', 'EN', '*Mündlich Prüfung E12:* 11.30 Tim, 11:45 Mischa, 12:00 Gideon, 12:15 Kevin, 12:30 Valentin, 12:45 Luan', '2025-06-06 00:00:00'),
(64, 'pruefung', 'all', 'GG', 'China', '2025-06-16 13:10:00'),
(65, 'pruefung', 'all', 'EN', 'Unit 8', '2025-06-17 09:50:00');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `calendar_preferences`
--

CREATE TABLE `calendar_preferences` (
  `user_id` int(11) NOT NULL,
  `muted_subjects` text DEFAULT NULL,
  `show_completed_todos` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `classes`
--

CREATE TABLE `classes` (
  `id` int(11) NOT NULL,
  `slug` varchar(64) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Daten für Tabelle `classes`
--

INSERT INTO `classes` (`id`, `slug`, `title`, `description`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'default', 'Standardklasse', 'Standardklasse für bestehende Daten', 1, '2025-10-17 12:16:56', '2025-10-17 12:16:56'),
(2, 'L23a', 'L23a', 'Klasse L23a', 1, '2025-10-17 12:16:56', '2025-10-17 12:16:56'),
(4, 'L23b', 'L23b', 'Klasse L23b', 1, '2025-10-20 13:09:09', '2025-10-20 15:12:09'),
(7, 'L24a', 'L24a', 'Klasse L24a', 1, '2025-10-24 09:55:35', '2025-10-24 11:56:25'),
(8, 'L22c', 'L22c', 'Klasse L22c', 1, '2025-10-28 13:46:48', '2025-10-29 10:47:38'),
(9, 'K24a', 'K24a', 'Klasse K24a', 1, '2025-10-29 10:47:38', '2025-10-29 10:47:38'),
(11, 'K23a', 'K23a', 'Klasse K23a', 1, '2025-11-03 15:00:04', '2025-11-03 16:00:35'),
(12, 'U24f', 'U24f', 'Klasse U24f', 1, '2025-12-17 11:18:06', '2025-12-17 11:18:06'),
(17, 'L25a', 'L25a', 'Klasse L25a', 1, '2026-04-30 12:31:05', '2026-04-30 12:31:05');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `class_schedules`
--

CREATE TABLE `class_schedules` (
  `id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `source` varchar(255) DEFAULT NULL,
  `import_hash` varchar(64) DEFAULT NULL,
  `imported_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Daten für Tabelle `class_schedules`
--

INSERT INTO `class_schedules` (`id`, `class_id`, `source`, `import_hash`, `imported_at`, `created_at`) VALUES
(1, 2, 'admin_dashboard', '7b10a72045db189ff64f8d95de9d6222642467372f3aaf57f13f606d9beb2629', '2025-10-31 09:30:51', '2025-10-30 07:37:10'),
(2, 7, 'admin_dashboard', '1b4051e359000b9a18ad306a36fcd119e111d52beae0c7131e1238798c123dfa', '2025-11-03 14:05:12', '2025-11-03 14:05:12'),
(3, 17, 'admin_dashboard', '48e4800b9c6c228a9d661d7076dd7e0791334acf8a0cd2a417a61bf7028d298a', '2026-04-30 12:31:23', '2026-04-30 12:31:23'),
(4, 12, 'admin_dashboard', '7637852d0ea484e0d23bc704ff6604e544aa72d67f3d12f07ed501b2c5356dbb', '2026-05-08 08:11:34', '2026-05-08 08:11:34'),
(5, 4, 'admin_dashboard', '5824b08096e3ad1f6434d47e250dd2d312b5bfc7a3b42b4271dc7eea19809b86', '2026-05-08 08:11:46', '2026-05-08 08:11:46');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `eintraege`
--

CREATE TABLE `eintraege` (
  `id` int(11) NOT NULL,
  `class_id` varchar(4) NOT NULL DEFAULT 'L23a',
  `beschreibung` text NOT NULL,
  `datum` date NOT NULL,
  `enddatum` date DEFAULT NULL,
  `startzeit` time DEFAULT NULL,
  `endzeit` time DEFAULT NULL,
  `typ` enum('hausaufgabe','pruefung','event','ferien','todo') NOT NULL,
  `fach` varchar(100) NOT NULL DEFAULT '',
  `owner_user_id` int(11) DEFAULT NULL,
  `is_private` tinyint(1) NOT NULL DEFAULT 0,
  `is_done` tinyint(1) NOT NULL DEFAULT 0,
  `todo_status` varchar(32) DEFAULT NULL
) ;

--
-- Daten für Tabelle `eintraege`
--

INSERT INTO `eintraege` (`id`, `class_id`, `beschreibung`, `datum`, `enddatum`, `startzeit`, `endzeit`, `typ`, `fach`, `owner_user_id`, `is_private`, `is_done`, `todo_status`) VALUES
(1, 'L23a', 'Sofies Welt, Aristoteles, S.127-147 (S.72-90 Sokrates freiwillig)', '2025-10-17', '2025-10-17', NULL, NULL, 'hausaufgabe', 'PH', NULL, 0, 0, NULL),
(2, 'L23a', 'Arbeitsaufträge vom Dienstag', '2025-10-17', '2025-10-17', NULL, NULL, 'hausaufgabe', 'CH', NULL, 0, 0, NULL),
(3, 'L23a', 'Arbeitsaufträge von letzter Woche. (Siehe Mail)', '2025-10-20', '2025-10-20', NULL, NULL, 'hausaufgabe', 'MA', NULL, 0, 0, NULL),
(4, 'L23a', 'Arbeitsaufträge vorangegangene Woche. (Siehe E-Mail)', '2025-10-21', '2025-10-21', NULL, NULL, 'hausaufgabe', 'WR', NULL, 0, 0, NULL),
(5, 'L23a', 'Langenscheidt S 177-206', '2025-05-27', '2025-05-27', NULL, NULL, 'pruefung', 'IT', NULL, 0, 0, NULL),
(6, 'L23a', 'Vektorgeometrie', '2025-06-18', '2025-06-18', NULL, NULL, 'pruefung', 'MA', NULL, 0, 0, NULL),
(7, 'L23a', 'Datenbanken NEU', '2025-05-14', '2025-05-14', NULL, NULL, 'pruefung', 'IN', NULL, 0, 0, NULL),
(8, 'L23a', 'Abgabe Extract', '2025-05-27', '2025-05-27', NULL, NULL, 'pruefung', 'EN', NULL, 0, 0, NULL),
(9, 'L23a', 'SF Physikprüfung 4', '2025-05-15', '2025-05-15', NULL, NULL, 'pruefung', 'SPM-PS', NULL, 0, 0, NULL),
(10, 'L23a', 'Ökologie', '2025-06-06', '2025-06-06', NULL, NULL, 'pruefung', 'BI', NULL, 0, 0, NULL),
(11, 'L23a', 'Komplexe Zahlen, Verschiebedatum 10.06.2025', '2025-06-03', '2025-06-03', NULL, NULL, 'pruefung', 'SPM-MA', NULL, 0, 0, NULL),
(12, 'L23a', 'Einigung in Europa (Prüfungsform in Abklärung', '2025-06-11', '2025-06-11', NULL, NULL, 'pruefung', 'GS', NULL, 0, 0, NULL),
(13, 'L23a', 'Langenscheidt Prüfung zwei S. 47 - 80', '2025-05-16', '2025-05-16', NULL, NULL, 'pruefung', 'FR', NULL, 0, 0, NULL),
(14, 'L23a', 'Informationen und Daten', '2025-06-18', '2025-06-18', NULL, NULL, 'pruefung', 'IN', NULL, 0, 0, NULL),
(15, 'L23a', '*Mündlich Prüfungen E12:* \n11:30 Timo, 11:45 Joseph, 12:00 Marvin, 12:15 Beatriz, 12:30 Liana, 12:45 Jonas', '2025-06-03', '2025-06-03', NULL, NULL, 'pruefung', 'EN', NULL, 0, 0, NULL),
(16, 'L23a', '*Mündlich Prüfung E12:* 11.30 Tim, 11:45 Mischa, 12:00 Gideon, 12:15 Kevin, 12:30 Valentin, 12:45 Luan', '2025-06-06', '2025-06-06', NULL, NULL, 'pruefung', 'EN', NULL, 0, 0, NULL),
(17, 'L23a', 'China', '2025-06-16', '2025-06-16', NULL, NULL, 'pruefung', 'GG', NULL, 0, 0, NULL),
(18, 'L23a', 'Unit 8', '2025-06-17', '2025-06-17', NULL, NULL, 'pruefung', 'EN', NULL, 0, 0, NULL),
(19, 'L23a', 'Kräfte', '2025-06-12', '2025-06-12', NULL, NULL, 'pruefung', 'PS', NULL, 0, 0, NULL),
(20, 'L23a', 'Prüfung', '2025-10-27', '2025-10-27', NULL, NULL, 'pruefung', 'SPM-MA', NULL, 0, 0, NULL),
(21, 'L23a', 'Prüfung', '2025-12-15', '2025-12-15', NULL, NULL, 'pruefung', 'SPM-MA', NULL, 0, 0, NULL),
(22, 'L23a', 'Prüfung', '2025-10-28', '2025-10-28', NULL, NULL, 'pruefung', 'CH', NULL, 0, 0, NULL),
(23, 'L23a', 'Prüfung', '2024-12-16', '2024-12-16', NULL, NULL, 'pruefung', 'CH', NULL, 0, 0, NULL),
(25, 'L23a', 'Prüfung', '2026-01-15', '2026-01-15', NULL, NULL, 'pruefung', 'PS', NULL, 0, 0, NULL),
(26, 'L23a', 'Prüfung', '2025-09-19', '2025-09-19', NULL, NULL, 'pruefung', 'SPM-PS', NULL, 0, 0, NULL),
(27, 'L23a', 'Prüfung Statik', '2025-12-12', '2025-12-12', '08:00:00', '09:35:00', 'pruefung', 'SPM-PS', NULL, 0, 0, NULL),
(28, 'L23a', 'Vorträge FSP (Gewichtung: 0,5), Andere Daten 04.09 und 10.09', '2025-09-03', '2025-09-03', NULL, NULL, 'pruefung', 'FR', NULL, 0, 0, NULL),
(29, 'L23a', 'Prüfung', '2025-11-07', '2025-11-07', '09:50:00', '11:25:00', 'pruefung', 'PH', NULL, 0, 0, NULL),
(30, 'L23a', 'Prüfung', '2026-01-09', '2026-01-09', NULL, NULL, 'pruefung', 'PH', NULL, 0, 0, NULL),
(31, 'L23a', 'Aufsatzt', '2025-09-01', '2025-09-01', NULL, NULL, 'pruefung', 'DE', NULL, 0, 0, NULL),
(32, 'L23a', 'Inhaltssicherung Lektüre 22 Bahnen', '2025-09-08', '2025-09-08', NULL, NULL, 'pruefung', 'DE', NULL, 0, 0, NULL),
(33, 'L23a', 'Prüfung Jazzanalyse', '2025-11-03', '2025-11-03', '15:00:00', '16:35:00', 'pruefung', 'SMU', NULL, 0, 0, NULL),
(34, 'L23a', 'Mündlich Prüfung Lektüre (Dialoganalyse) ALT', '2025-11-13', '2025-11-13', NULL, NULL, 'pruefung', 'DE', NULL, 0, 0, NULL),
(35, 'L23a', 'Mündlich Prüfung Lektüre (Dialoganalyse) ALT', '2025-11-17', '2025-11-17', NULL, NULL, 'pruefung', 'DE', NULL, 0, 0, NULL),
(36, 'L23a', 'ALT Multiple Chioce Prüfung Werter Buch 1.', '2025-11-27', '2025-11-27', '08:00:00', '09:35:00', 'pruefung', 'DE', NULL, 0, 0, NULL),
(37, 'L23a', 'Voci S. 80 - 112 (Gewichtung: 0,5)', '2025-09-11', '2025-09-11', NULL, NULL, 'pruefung', 'FR', NULL, 0, 0, NULL),
(38, 'L23a', 'EF Prüfungen', '2025-10-23', '2025-10-23', NULL, NULL, 'pruefung', 'EF', NULL, 0, 0, NULL),
(39, 'L23a', 'Prüfung', '2025-10-20', '2025-10-20', NULL, NULL, 'pruefung', 'GS', NULL, 0, 0, NULL),
(40, 'L23a', 'Septakkorde und Zwischendominanten', '2025-10-28', '2025-10-28', NULL, NULL, 'pruefung', 'SMU', NULL, 0, 0, NULL),
(41, 'L23a', 'Personalwesen BWL', '2025-11-04', '2025-11-04', '08:00:00', '08:45:00', 'pruefung', 'WR', NULL, 0, 0, NULL),
(42, 'L23a', 'Voci Prüfung S. 112 - 147', '2025-11-12', '2025-11-12', '13:10:00', '15:00:00', 'pruefung', 'FR', NULL, 0, 0, NULL),
(43, 'L23a', 'Prüfung Melodie- und Rythmusdiktat (Gewichtung: 0,5)', '2025-09-16', '2025-09-16', NULL, NULL, 'pruefung', 'SMU', NULL, 0, 0, NULL),
(44, 'L23a', 'ALT Mündlich Prüfung', '2025-11-18', '2025-11-18', NULL, NULL, 'pruefung', 'SMU', NULL, 0, 0, NULL),
(45, 'L23a', 'Prüfung Quellenanalyse', '2025-11-24', '2025-11-24', '08:00:00', '09:35:00', 'pruefung', 'GS', NULL, 0, 0, NULL),
(46, 'L23a', 'Ergänzungsfachprüfungen', '2025-12-11', '2025-12-11', '13:10:00', '14:45:00', 'pruefung', '', NULL, 0, 0, NULL),
(47, 'L23a', 'Prüfung', '2025-12-16', '2025-12-16', '08:00:00', '08:45:00', 'pruefung', 'CH', NULL, 0, 0, NULL),
(48, 'L23a', 'Prüfung', '2025-12-18', '2025-12-18', NULL, NULL, 'pruefung', 'DE', NULL, 0, 0, NULL),
(49, 'L23a', 'Prüfung', '2026-01-13', '2026-01-13', '08:00:00', '08:45:00', 'pruefung', 'WR', NULL, 0, 0, NULL),
(50, 'L23a', 'Erfahrungen aus dem FSP Zi18 ', '2025-10-27', '2025-10-27', NULL, NULL, 'pruefung', 'IT', NULL, 0, 0, NULL),
(51, 'L23a', 'Abgabe FSP Bericht', '2025-09-19', '2025-09-19', NULL, NULL, 'pruefung', 'IT', NULL, 0, 0, NULL),
(52, 'L23a', 'Langenscheidt S. 147-177', '2026-01-08', '2026-01-08', NULL, NULL, 'pruefung', 'FR', NULL, 0, 0, NULL),
(53, 'L23a', 'Prüfung', '2025-09-17', '2025-09-17', NULL, NULL, 'pruefung', 'IT', NULL, 0, 0, NULL),
(54, 'L23a', 'Prüfung', '2025-09-17', '2025-09-17', NULL, NULL, 'pruefung', 'MA', NULL, 0, 0, NULL),
(55, 'L23a', 'Prüfung 3', '2026-01-14', '2026-01-14', NULL, NULL, 'pruefung', 'MA', NULL, 0, 0, NULL),
(56, 'L23a', 'Prüfung', '2025-11-26', '2025-11-26', '09:50:00', '11:25:00', 'pruefung', 'MA', NULL, 0, 0, NULL),
(57, 'L23a', 'Mateo Falcone Prüfung', '2025-10-29', '2025-10-29', NULL, NULL, 'pruefung', 'FR', NULL, 0, 0, NULL),
(58, 'L23a', 'reading/listening', '2025-10-17', '2025-10-17', NULL, NULL, 'pruefung', 'EN', NULL, 0, 0, NULL),
(59, 'L23a', 'grammar/vocabulary ', '2025-10-24', '2025-10-24', NULL, NULL, 'pruefung', 'EN', NULL, 0, 0, NULL),
(60, 'L23a', '*Lernziele:*\nI tempi del passato:\npassato remoto\npassato prossimo\nimperfetto\nVerbi pronominali:\nfarcela, prendersela, andarsene, …\nLe congiunzioni:\nSiccome, poiché, dato che, visto che, perché\nIl gerundio\nFormazione\nAl posto di una frase secondaria (mentre, siccome, se…)', '2025-12-03', '2025-12-03', '13:10:00', '14:45:00', 'pruefung', 'IT', NULL, 0, 0, NULL),
(61, 'L23a', 'Vortrag Dr. Wolfgang Welsch\n\nOrt:                  Aula\nBeginn:           8:50 Uhr (Absenzenkontrolle wird durchgeführt)\nEnde:              11:25 Uhr\nMitnehmen:     falls im Unterricht erstellt, vorbereitete Fragen', '2025-10-30', '2025-10-30', '08:50:00', '11:25:00', 'event', '', NULL, 0, 0, NULL),
(62, 'L23a', 'Voci Prüfung', '2025-10-29', '2025-10-29', '13:10:00', '14:00:00', 'pruefung', 'IT', NULL, 0, 0, NULL),
(63, 'L23a', '', '2025-11-06', '2025-11-06', '10:40:00', '11:25:00', 'pruefung', 'PS', NULL, 0, 0, NULL),
(64, 'L23a', 'ALT Multiple Choice Emilia Galotti', '2025-11-10', '2025-11-10', '13:10:00', '15:00:00', 'pruefung', 'DE', NULL, 0, 0, NULL),
(65, 'L23a', '', '2025-12-04', '2025-12-04', '10:40:00', '11:25:00', 'pruefung', 'FR', NULL, 0, 0, NULL),
(67, 'L24a', 'Blatt fertig lösen', '2025-11-06', '2025-11-06', '09:50:00', '11:25:00', 'hausaufgabe', 'FR', NULL, 0, 0, NULL),
(68, 'K24a', 'Ferien', '2025-12-22', '2026-01-04', NULL, NULL, 'ferien', '', NULL, 0, 0, NULL),
(68, 'L22c', 'Ferien', '2025-12-22', '2026-01-04', NULL, NULL, 'ferien', '', NULL, 0, 0, NULL),
(68, 'L23a', 'Weihnachtsferien', '2025-12-22', '2026-01-04', NULL, NULL, 'ferien', '', NULL, 0, 0, NULL),
(68, 'L23b', 'Ferien', '2025-12-22', '2026-01-04', NULL, NULL, 'ferien', '', NULL, 0, 0, NULL),
(68, 'L24a', 'Ferien', '2025-12-22', '2026-01-04', NULL, NULL, 'ferien', '', NULL, 0, 0, NULL),
(71, 'L23a', 'Test correction', '2025-11-07', '2025-11-07', '13:10:00', '13:55:00', 'hausaufgabe', 'EN', NULL, 0, 0, NULL),
(72, 'L23b', '', '2025-11-07', '2025-11-07', '13:10:00', '13:55:00', 'pruefung', 'PS', NULL, 0, 0, NULL),
(73, 'K23a', 'Blues at School\n\nAula', '2025-11-10', '2025-11-10', '12:45:00', '14:00:00', 'event', '', NULL, 0, 0, NULL),
(73, 'K24a', 'Blues at School\n\nAula', '2025-11-10', '2025-11-10', '12:45:00', '14:00:00', 'event', '', NULL, 0, 0, NULL),
(73, 'L22c', 'Blues at School\n\nAula', '2025-11-10', '2025-11-10', '12:45:00', '14:00:00', 'event', '', NULL, 0, 0, NULL),
(73, 'L23a', 'Blues at School\n\nAula', '2025-11-10', '2025-11-10', '12:45:00', '14:00:00', 'event', '', NULL, 0, 0, NULL),
(73, 'L23b', 'Blues at School\n\nAula', '2025-11-10', '2025-11-10', '12:45:00', '14:00:00', 'event', '', NULL, 0, 0, NULL),
(73, 'L24a', 'Blues at School\n\nAula', '2025-11-10', '2025-11-10', '12:45:00', '14:00:00', 'event', '', NULL, 0, 0, NULL),
(74, 'L23a', 'Abgabe Tiefdruck', '2025-11-10', '2025-11-10', '00:00:00', NULL, 'pruefung', 'BG', NULL, 0, 0, NULL),
(75, 'K23a', 'Präsentationen Maturaarbeit', '2025-12-01', '2025-12-01', '08:00:00', '16:35:00', 'event', '', NULL, 0, 0, NULL),
(75, 'K24a', 'Präsentationen Maturaarbeit', '2025-12-01', '2025-12-01', '08:00:00', '16:35:00', 'event', '', NULL, 0, 0, NULL),
(75, 'L22c', 'Präsentationen Maturaarbeit', '2025-12-01', '2025-12-01', '08:00:00', '16:35:00', 'event', '', NULL, 0, 0, NULL),
(75, 'L23a', 'Präsentationen Maturaarbeit', '2025-12-01', '2025-12-01', '08:00:00', '16:35:00', 'event', '', NULL, 0, 0, NULL),
(75, 'L23b', 'Präsentationen Maturaarbeit', '2025-12-01', '2025-12-01', '08:00:00', '16:35:00', 'event', '', NULL, 0, 0, NULL),
(75, 'L24a', 'Präsentationen Maturaarbeit', '2025-12-01', '2025-12-01', '08:00:00', '16:35:00', 'event', '', NULL, 0, 0, NULL),
(76, 'L23a', 'Controllare le soluzioni degli esercizi sui verbi pronominali (-> OneNote)\nEsercizi pp. 120-121 (numeri 1-5)\nLangenscheidt pp. 65-74 (fino a ubbidire)', '2025-11-12', '2025-11-12', '13:10:00', '15:00:00', 'hausaufgabe', 'IT', NULL, 0, 0, NULL),
(77, 'L23a', 'Buchseiten lesen und Stichworte zu der Frage \"Welche Rolle hatte die uns zugeteilte Nation\" notieren', '2025-11-17', '2025-11-17', '08:00:00', '10:35:00', 'hausaufgabe', 'GS', NULL, 0, 0, NULL),
(78, 'L23a', 'Aufgaben Matrizenmultiplikation lösen (d, e, f, g, h)', '2025-11-17', '2025-11-17', '15:00:00', '16:35:00', 'hausaufgabe', 'SPM-MA', NULL, 0, 0, NULL),
(80, 'L23a', 'Read the text you were alloted and make sure you can tell your partner about it. (handout on brands)', '2025-11-14', '2025-11-14', '13:10:00', '13:55:00', 'hausaufgabe', 'EN', NULL, 0, 0, NULL),
(81, 'L23a', 'Finish the play and mark interesting passages. (Priestley, An Inspector Calls)', '2025-11-18', '2025-11-18', '08:50:00', '10:35:00', 'hausaufgabe', 'EN', NULL, 0, 0, NULL),
(82, 'L23a', 'Essay', '2025-12-02', '2025-12-02', '08:50:00', '09:35:00', 'pruefung', 'EN', NULL, 0, 0, NULL),
(83, 'L23a', 'Aufgabe 2 Dossier 5 Drehimpuls', '2025-11-28', '2025-11-28', '08:00:00', '09:35:00', 'hausaufgabe', 'SPM-PS', NULL, 0, 0, NULL),
(84, 'L23a', 'Aufgaben 4 und 5 in Dossier 10.2 fertiglösen', '2025-12-02', '2025-12-02', '10:35:00', '11:25:00', 'hausaufgabe', 'CH', NULL, 0, 0, NULL),
(85, 'L23a', 'Model the letter on the texts in the student\'s book (p.131) or workbook (p.89). Either write it on a piece of paper or upload a worddocument into your personal writing folder on One.Drive. Please, abstain from using ChatGPT as tempting as it may be.', '2025-11-25', '2025-11-25', '08:50:00', '09:35:00', 'hausaufgabe', 'EN', NULL, 0, 0, NULL),
(86, 'L23a', 'Paraphrase the highlighted expressions in the text\n*handout: article Eat Sleep Buy Die*', '2025-11-28', '2025-11-28', '13:10:00', '13:55:00', 'hausaufgabe', 'EN', NULL, 0, 0, NULL),
(87, 'L23a', 'Presentazioni', '2025-12-04', '2025-12-04', '09:50:00', '10:35:00', 'pruefung', 'IT', NULL, 0, 0, NULL),
(88, 'L23a', 'OneNote Seite 7 Aufgabe 2', '2025-12-11', '2025-12-11', '08:00:00', '09:35:00', 'hausaufgabe', 'DE', NULL, 0, 0, NULL),
(89, 'L23a', 'Booklet 7A Wish-sentences	Read the text about Paula Wilcox and do ex. 4b & c', '2025-12-05', '2025-12-05', '13:10:00', '13:55:00', 'hausaufgabe', 'EN', NULL, 0, 0, NULL),
(90, 'L23a', 'Aufgabe 8a oder 8b und 9a oder 9b', '2025-12-10', '2025-12-10', '09:50:00', '11:25:00', 'hausaufgabe', 'MA', NULL, 0, 0, NULL),
(91, 'L23a', 'One Note Seite 8', '2025-12-15', '2025-12-15', '13:10:00', '14:45:00', 'hausaufgabe', 'DE', NULL, 0, 0, NULL),
(92, 'L23a', 'booklet FoV ethical fashion / buy less stuff	Work on the vocabulary exercises for 20\'.', '2025-12-12', '2025-12-12', '13:10:00', '13:55:00', 'hausaufgabe', 'EN', NULL, 0, 0, NULL),
(93, 'L23a', 'Grammar + voc Unit 10', '2026-01-23', '2026-01-23', '13:10:00', '13:55:00', 'pruefung', 'EN', NULL, 0, 0, NULL),
(94, 'L23a', 'Reading + listening', '2026-01-16', '2026-01-16', '13:10:00', '13:55:00', 'pruefung', 'EN', NULL, 0, 0, NULL),
(95, 'L23a', 'Vocabulary', '2026-01-30', '2026-01-30', '13:10:00', '13:55:00', 'pruefung', 'EN', NULL, 0, 0, NULL),
(97, 'K23a', 'Projekt-Halbtag\n\nProjekt-Halbtag: Einführung in wissenschaftliches Arbeiten \n(Arbeitsjournal, Recherchieren, Zitieren, Bibliographieren)', '2026-02-04', '2026-02-04', '08:00:00', '11:25:00', 'event', '', NULL, 0, 0, NULL),
(97, 'L23a', 'Projekt-Halbtag\n\nEinführung in wissenschaftliches Arbeiten \n(Arbeitsjournal, Recherchieren, Zitieren, Bibliographieren)', '2026-02-04', '2026-02-04', '08:00:00', '11:25:00', 'event', '', NULL, 0, 0, NULL),
(97, 'L23b', 'Projekt-Halbtag\n\nProjekt-Halbtag: Einführung in wissenschaftliches Arbeiten \n(Arbeitsjournal, Recherchieren, Zitieren, Bibliographieren)', '2026-02-04', '2026-02-04', '08:00:00', '11:25:00', 'event', '', NULL, 0, 0, NULL),
(98, 'L23a', 'Mandare I compiti', '2025-12-19', '2025-12-19', '23:58:00', '23:59:00', 'hausaufgabe', 'IT', NULL, 0, 0, NULL),
(99, 'L23a', 'Read p.5-27, either take notes in the reading journal or the book: Summarize each page with a sentence or a word. Mark passages that you find interesting. You CAN start completing the worksheet.', '2026-01-06', '2026-01-06', '08:50:00', '10:35:00', 'hausaufgabe', 'EN', NULL, 0, 0, NULL),
(100, 'L23a', '*Arbeitsauftrag von vor den Ferien:*\nLesen Sie im Skript die Seiten 17–18 (Kapitel 3.3.3 Krankenkasse) und schauen Sie sich die folgenden zwei Filme an. Sie finden die Filme unter Dateien --> Sozialversicherungen abgelegt: \nFilm 1: Krankenkasse einfach erklärt\nFilm 2: Krankentaggeld bei einer Kündigung', '2026-01-06', '2026-01-06', '08:00:00', '08:45:00', 'hausaufgabe', 'WR', NULL, 0, 0, NULL),
(101, 'L23a', 'Test', '2026-06-12', '2026-06-12', '09:50:00', '11:25:00', 'pruefung', 'PH', NULL, 0, 0, NULL),
(102, 'L23a', 'Test', '2026-05-29', '2026-05-29', '08:00:00', '09:35:00', 'pruefung', 'SPM-PS', NULL, 0, 0, NULL),
(103, 'L23a', 'Essay Decartes', '2026-03-13', '2026-03-13', '09:50:00', '11:25:00', 'pruefung', 'PH', NULL, 0, 0, NULL),
(104, 'L23a', 'Test', '2026-03-20', '2026-03-20', '08:00:00', '09:35:00', 'pruefung', 'SPM-PS', NULL, 0, 0, NULL),
(105, 'L23a', 'Seite 1 im OneNote vervollständigen', '2026-01-12', '2026-01-12', '13:10:00', '14:45:00', 'hausaufgabe', 'DE', NULL, 0, 0, NULL),
(106, 'L23a', 'booklet The psychology of music p.7 ex.4 Bring your EF Adv books as well', '2026-01-16', '2026-01-16', '13:10:00', '13:55:00', 'hausaufgabe', 'EN', NULL, 0, 0, NULL),
(107, 'L23a', 'Disher, The Divine Wind	Read p.27- 46. Take notes on what happens and mark any passages you find interesting. You can start completing the handout.', '2026-01-13', '2026-01-13', '09:50:00', '11:25:00', 'hausaufgabe', 'EN', NULL, 0, 0, NULL),
(108, 'L23a', 'Pinocchio', '2026-01-15', '2026-01-15', '09:50:00', '10:35:00', 'pruefung', 'IT', NULL, 0, 0, NULL),
(109, 'L23a', 'textgebunden Erörterung', '2026-02-23', '2026-02-23', '13:10:00', '14:45:00', 'pruefung', 'DE', NULL, 0, 0, NULL),
(110, 'L23a', 'ALT mündlich. Klassik und Romantik', '2026-04-20', '2026-04-20', '13:10:00', '14:45:00', 'pruefung', 'DE', NULL, 0, 0, NULL),
(111, 'L23a', 'ALT mündlich. Klassik und Romantik', '2026-04-23', '2026-04-23', '08:00:00', '09:35:00', 'pruefung', 'DE', NULL, 0, 0, NULL),
(112, 'L23a', 'ALT mündlich. Klassik und Romantik', '2026-04-27', '2026-04-27', '13:10:00', '14:45:00', 'pruefung', 'DE', NULL, 0, 0, NULL),
(113, 'L23a', 'ALT Essay schreiben', '2026-05-28', '2026-05-28', '08:00:00', '09:35:00', 'pruefung', 'DE', NULL, 0, 0, NULL),
(114, 'K23a', 'Fasnachtsferien', '2026-02-09', '2026-02-22', NULL, NULL, 'ferien', '', NULL, 0, 0, NULL),
(114, 'K24a', 'Fasnachtsferien', '2026-02-09', '2026-02-22', NULL, NULL, 'ferien', '', NULL, 0, 0, NULL),
(114, 'L22c', 'Fasnachtsferien', '2026-02-09', '2026-02-22', NULL, NULL, 'ferien', '', NULL, 0, 0, NULL),
(114, 'L23a', 'Fasnachtsferien', '2026-02-09', '2026-02-22', NULL, NULL, 'ferien', '', NULL, 0, 0, NULL),
(114, 'L23b', 'Fasnachtsferien', '2026-02-09', '2026-02-22', NULL, NULL, 'ferien', '', NULL, 0, 0, NULL),
(114, 'L24a', 'Fasnachtsferien', '2026-02-09', '2026-02-22', NULL, NULL, 'ferien', '', NULL, 0, 0, NULL),
(114, 'U24f', 'Fasnachtsferien', '2026-02-09', '2026-02-22', NULL, NULL, 'ferien', '', NULL, 0, 0, NULL),
(115, 'K23a', 'Wintersporttag\n\nVerschiebedatum 2', '2026-02-27', '2026-02-27', '08:00:00', '16:35:00', 'event', '', NULL, 0, 0, NULL),
(115, 'K24a', 'Wintersporttag\n\nVerschiebedatum 2', '2026-02-27', '2026-02-27', '08:00:00', '16:35:00', 'event', '', NULL, 0, 0, NULL),
(115, 'L22c', 'Wintersporttag\n\nVerschiebedatum 2', '2026-02-27', '2026-02-27', '08:00:00', '16:35:00', 'event', '', NULL, 0, 0, NULL),
(115, 'L23a', 'Wintersporttag\n\nVerschiebedatum 2', '2026-02-27', '2026-02-27', '08:00:00', '16:35:00', 'event', '', NULL, 0, 0, NULL),
(115, 'L23b', 'Wintersporttag\n\nVerschiebedatum 2', '2026-02-27', '2026-02-27', '08:00:00', '16:35:00', 'event', '', NULL, 0, 0, NULL),
(115, 'L24a', 'Wintersporttag\n\nVerschiebedatum 2', '2026-02-27', '2026-02-27', '08:00:00', '16:35:00', 'event', '', NULL, 0, 0, NULL),
(115, 'U24f', 'Wintersporttag\n\nVerschiebedatum 2', '2026-02-27', '2026-02-27', '08:00:00', '16:35:00', 'event', '', NULL, 0, 0, NULL),
(116, 'L23a', 'Analysieren Sie die beiden exemplarischen Gedichte \"Das Göttliche\" und \"Sehnsucht\". Sie finden die Gedichte auf der ersten Doppelseite des ausgedruckten Lyrik-Readers. Folgen Sie der Anleitung und den Fragen/Aufträgen auf der OneNote-Seite \"2 Exemplarische Analyse\".\nBeantworten Sie Auftrag 1a und vor allem Auftrag 1b auf den Seiten 3 und 4 des Lyrik-Readers. Sie sollen alle Gedichte durchlesen, sie der Epoche zuordnen und dabei eine Begründung notieren.', '2026-01-19', '2026-01-19', '13:10:00', '14:45:00', 'hausaufgabe', 'DE', NULL, 0, 0, NULL),
(117, 'L23a', 'Gruppenprüfung', '2026-03-16', '2026-03-16', '08:00:00', '09:35:00', 'pruefung', 'GS', NULL, 0, 0, NULL),
(119, 'L23a', 'Gruppenprüfung', '2026-03-23', '2026-03-23', '08:00:00', '09:35:00', 'pruefung', 'GS', NULL, 0, 0, NULL),
(120, 'L23a', 'Disher, The Divine Wind	Read p.47-66, keep track of the contents and mark interesting passages.', '2026-01-27', '2026-01-27', '08:50:00', '09:35:00', 'hausaufgabe', 'EN', NULL, 0, 0, NULL),
(121, 'L23a', 'Thesen zum zweiten Text formulieren', '2026-01-29', '2026-01-29', '08:00:00', '09:35:00', 'hausaufgabe', 'DE', NULL, 0, 0, NULL),
(122, 'L23a', 'Kurvendiskussion/Parabelgleichungsaufgaben/Extremalwertaufgaben', '2026-05-27', '2026-05-27', '09:50:00', '11:25:00', 'pruefung', 'MA', NULL, 0, 0, NULL),
(123, 'L23a', 'Prüfung', '2026-06-24', '2026-06-24', '09:50:00', '11:25:00', 'pruefung', 'MA', NULL, 0, 0, NULL),
(124, 'L23a', 'EF Prüfungen', '2026-02-26', '2026-02-26', '13:10:00', '14:45:00', 'pruefung', 'EF', NULL, 0, 0, NULL),
(125, 'L23a', 'Prüfung', '2026-03-20', '2026-03-20', '14:00:00', '15:50:00', 'pruefung', 'MA', NULL, 0, 0, NULL),
(126, 'L23a', 'Affine Abbildungen', '2026-03-23', '2026-03-23', '15:00:00', '16:35:00', 'pruefung', 'SPM-MA', NULL, 0, 0, NULL),
(127, 'L23a', 'Bis Aufgabe 2b lösen', '2026-02-02', '2026-02-02', '13:10:00', '14:45:00', 'hausaufgabe', 'DE', NULL, 0, 0, NULL),
(128, 'L23a', 'Über Reneé Descartes, S.275-291 lesen', '2026-01-30', '2026-01-30', '09:50:00', '11:25:00', 'hausaufgabe', 'PH', NULL, 0, 0, NULL),
(129, 'L23a', 'Descartes Meditationes 1 und', '2026-02-06', '2026-02-06', '09:50:00', '11:25:00', 'hausaufgabe', 'PH', NULL, 0, 0, NULL),
(130, 'L23a', 'Buch fertiglesen', '2026-02-03', '2026-02-03', '08:50:00', '10:40:00', 'hausaufgabe', 'EN', NULL, 0, 0, NULL),
(131, 'L23a', 'Prüfung', '2026-06-01', '2026-06-01', '15:00:00', '16:35:00', 'pruefung', 'SPM-MA', NULL, 0, 0, NULL),
(132, 'L23a', 'GWR 3. Prüfung', '2026-03-31', '2026-03-31', '08:00:00', '08:45:00', 'pruefung', 'WR', NULL, 0, 0, NULL),
(133, 'L23a', 'ALT Multiple Choice Wilhelm Tell', '2026-03-02', '2026-03-02', '13:10:00', '14:45:00', 'pruefung', 'DE', NULL, 0, 0, NULL),
(134, 'L23a', 'p.6: Read either paragraphs 2 & 3 (student A) or paragraphs 4 & 5 (student B) and match the questions in ex. b to your paragraphs. You will have to inform your partner about the contents of what you read.', '2026-02-06', '2026-02-06', '13:10:00', '13:55:00', 'hausaufgabe', 'EN', NULL, 0, 0, NULL),
(135, 'L23a', 'Säure Base Chemie Teil 2', '2026-03-24', '2026-03-24', '10:40:00', '11:25:00', 'pruefung', 'CH', NULL, 0, 0, NULL),
(136, 'L23a', 'Students Book p. 154 und Test Correction', '2026-02-27', '2026-02-27', '13:10:00', '13:55:00', 'hausaufgabe', 'EN', NULL, 0, 0, NULL),
(139, 'L23a', 'Aufgabenblatt lösen (teils freiwillig)', '2026-03-03', '2026-03-03', '10:40:00', '11:25:00', 'hausaufgabe', 'CH', NULL, 0, 0, NULL),
(140, 'L23a', 'Test Voc Nr 31 à 36', '2026-03-19', '2026-03-19', '09:50:00', '10:35:00', 'pruefung', 'FR', NULL, 0, 0, NULL),
(141, 'L23a', 'Esame (gramm. e voc.)', '2026-03-11', '2026-03-11', '13:10:00', '14:45:00', 'pruefung', 'IT', NULL, 0, 0, NULL),
(143, 'K23a', 'Osterferien', '2026-04-03', '2026-04-19', NULL, NULL, 'ferien', '', NULL, 0, 0, NULL),
(143, 'K24a', 'Osterferien', '2026-04-03', '2026-04-19', NULL, NULL, 'ferien', '', NULL, 0, 0, NULL),
(143, 'L22c', 'Osterferien', '2026-04-03', '2026-04-19', NULL, NULL, 'ferien', '', NULL, 0, 0, NULL),
(143, 'L23a', 'Osterferien', '2026-04-03', '2026-04-19', NULL, NULL, 'ferien', '', NULL, 0, 0, NULL),
(143, 'L23b', 'Osterferien', '2026-04-03', '2026-04-19', NULL, NULL, 'ferien', '', NULL, 0, 0, NULL),
(143, 'L24a', 'Osterferien', '2026-04-03', '2026-04-19', NULL, NULL, 'ferien', '', NULL, 0, 0, NULL),
(143, 'U24f', 'Osterferien', '2026-04-03', '2026-04-19', NULL, NULL, 'ferien', '', NULL, 0, 0, NULL),
(144, 'K23a', 'Auffahrtsbrücke', '2026-05-14', '2026-05-17', NULL, NULL, 'ferien', '', NULL, 0, 0, NULL),
(144, 'K24a', 'Auffahrtsbrücke', '2026-05-14', '2026-05-17', NULL, NULL, 'ferien', '', NULL, 0, 0, NULL),
(144, 'L22c', 'Auffahrtsbrücke', '2026-05-14', '2026-05-17', NULL, NULL, 'ferien', '', NULL, 0, 0, NULL),
(144, 'L23a', 'Auffahrtsbrücke', '2026-05-14', '2026-05-17', NULL, NULL, 'ferien', '', NULL, 0, 0, NULL),
(144, 'L23b', 'Auffahrtsbrücke', '2026-05-14', '2026-05-17', NULL, NULL, 'ferien', '', NULL, 0, 0, NULL),
(144, 'L24a', 'Auffahrtsbrücke', '2026-05-14', '2026-05-17', NULL, NULL, 'ferien', '', NULL, 0, 0, NULL),
(144, 'U24f', 'Auffahrtsbrücke', '2026-05-14', '2026-05-17', NULL, NULL, 'ferien', '', NULL, 0, 0, NULL),
(145, 'K23a', 'Pfingstmontag', '2026-05-25', '2026-05-25', NULL, NULL, 'ferien', '', NULL, 0, 0, NULL),
(145, 'K24a', 'Pfingstmontag', '2026-05-25', '2026-05-25', NULL, NULL, 'ferien', '', NULL, 0, 0, NULL),
(145, 'L22c', 'Pfingstmontag', '2026-05-25', '2026-05-25', NULL, NULL, 'ferien', '', NULL, 0, 0, NULL),
(145, 'L23a', 'Pfingstmontag', '2026-05-25', '2026-05-25', NULL, NULL, 'ferien', '', NULL, 0, 0, NULL),
(145, 'L23b', 'Pfingstmontag', '2026-05-25', '2026-05-25', NULL, NULL, 'ferien', '', NULL, 0, 0, NULL),
(145, 'L24a', 'Pfingstmontag', '2026-05-25', '2026-05-25', NULL, NULL, 'ferien', '', NULL, 0, 0, NULL),
(145, 'U24f', 'Pfingstmontag', '2026-05-25', '2026-05-25', NULL, NULL, 'ferien', '', NULL, 0, 0, NULL),
(146, 'K23a', 'Fronleichnamsbrücke', '2026-06-04', '2026-06-07', NULL, NULL, 'ferien', '', NULL, 0, 0, NULL),
(146, 'K24a', 'Fronleichnamsbrücke', '2026-06-04', '2026-06-07', NULL, NULL, 'ferien', '', NULL, 0, 0, NULL),
(146, 'L22c', 'Fronleichnamsbrücke', '2026-06-04', '2026-06-07', NULL, NULL, 'ferien', '', NULL, 0, 0, NULL),
(146, 'L23a', 'Fronleichnamsbrücke', '2026-06-04', '2026-06-07', NULL, NULL, 'ferien', '', NULL, 0, 0, NULL),
(146, 'L23b', 'Fronleichnamsbrücke', '2026-06-04', '2026-06-07', NULL, NULL, 'ferien', '', NULL, 0, 0, NULL),
(146, 'L24a', 'Fronleichnamsbrücke', '2026-06-04', '2026-06-07', NULL, NULL, 'ferien', '', NULL, 0, 0, NULL),
(146, 'U24f', 'Fronleichnamsbrücke', '2026-06-04', '2026-06-07', NULL, NULL, 'ferien', '', NULL, 0, 0, NULL),
(147, 'K23a', 'Sommerferien', '2026-07-06', '2026-08-16', NULL, NULL, 'ferien', '', NULL, 0, 0, NULL),
(147, 'K24a', 'Sommerferien', '2026-07-06', '2026-08-16', NULL, NULL, 'ferien', '', NULL, 0, 0, NULL),
(147, 'L22c', 'Sommerferien', '2026-07-06', '2026-08-16', NULL, NULL, 'ferien', '', NULL, 0, 0, NULL),
(147, 'L23a', 'Sommerferien', '2026-07-06', '2026-08-16', NULL, NULL, 'ferien', '', NULL, 0, 0, NULL),
(147, 'L23b', 'Sommerferien', '2026-07-06', '2026-08-16', NULL, NULL, 'ferien', '', NULL, 0, 0, NULL),
(147, 'L24a', 'Sommerferien', '2026-07-06', '2026-08-16', NULL, NULL, 'ferien', '', NULL, 0, 0, NULL),
(147, 'U24f', 'Sommerferien', '2026-07-06', '2026-08-16', NULL, NULL, 'ferien', '', NULL, 0, 0, NULL),
(148, 'L23a', 'literature test on devine winds', '2026-03-03', '2026-03-03', '08:50:00', '09:35:00', 'pruefung', 'EN', NULL, 0, 0, NULL),
(149, 'L23a', 'Examen oral: Frío viento del infiero', '2026-03-03', '2026-03-03', '13:10:00', '14:45:00', 'pruefung', 'SES', NULL, 0, 0, NULL),
(150, 'L23a', 'Rédaction 1', '2026-03-11', '2026-03-11', '13:10:00', '14:45:00', 'pruefung', 'FR', NULL, 0, 0, NULL),
(151, 'L23a', 'Examen Juventud en movimiento', '2026-03-23', '2026-03-23', '13:10:00', '14:45:00', 'pruefung', 'SES', NULL, 0, 0, NULL),
(153, 'L23a', 'Titrationsaufgabe fertig lösen', '2026-03-10', '2026-03-10', '10:40:00', '11:25:00', 'hausaufgabe', 'CH', NULL, 0, 0, NULL),
(154, 'L23a', 'unit 8A: ex.1, 2, 3 (key at the back of the book), p.6: Read either paragraphs 2 & 3 (student A) or paragraphs 4 & 5 (student B) and match the questions in ex. b to your paragraphs. You will have to inform your partner about the contents of what you read.', '2026-03-06', '2026-03-06', '13:10:00', '13:55:00', 'hausaufgabe', 'EN', NULL, 0, 0, NULL),
(155, 'L23a', '4. Aufzug lesen', '2026-03-12', '2026-03-12', '08:00:00', '09:35:00', 'hausaufgabe', 'DE', NULL, 0, 0, NULL),
(156, 'L23a', 'ALT Geschichte Mündlich', '2026-03-30', '2026-03-30', '08:00:00', '09:35:00', 'pruefung', 'GS', NULL, 0, 0, NULL),
(157, 'L23a', 'Abgabe Disposition Maturaarbeit', '2026-03-13', '2026-03-13', NULL, NULL, 'todo', '', 17, 1, 0, 'offen'),
(158, 'L23a', '5. Akt Lesen', '2026-03-16', '2026-03-16', '13:10:00', '14:45:00', 'hausaufgabe', 'DE', NULL, 0, 0, NULL),
(159, 'L23a', 'Elternabend der 5. Klassen\n\nElternabend zum Thema «Studienwahl» satt.\n*Die Teilnahme für Sie ist obligatorisch.*\nWeitere Informationen entnehmen Sie der Einladung im Anhang. Ihre Eltern haben ebenfalls eine Einladung erhalten.', '2026-05-11', '2026-05-11', '19:00:00', '22:00:00', 'event', '', NULL, 0, 0, NULL),
(161, 'L23a', 'Lernziele anschauen um in der Lektion Fragen stellen zu können', '2026-03-24', '2026-03-24', '08:00:00', '08:45:00', 'hausaufgabe', 'WR', NULL, 0, 0, NULL),
(162, 'L23a', 'Elektrizitätslehre', '2026-04-02', '2026-04-02', '10:40:00', '11:25:00', 'pruefung', 'PS', NULL, 0, 0, NULL),
(163, 'L23a', 'Prüfung Romantik', '2026-04-21', '2026-04-21', '13:10:00', '13:55:00', 'pruefung', 'SMU', NULL, 0, 0, NULL),
(164, 'L23a', 'EF Prüfungen 3', '2026-04-30', '2026-04-30', '13:10:00', '14:45:00', 'pruefung', 'EF', NULL, 0, 0, NULL),
(165, 'L23a', 'Prüfung', '2026-05-11', '2026-05-11', '08:00:00', '09:35:00', 'pruefung', 'GS', NULL, 0, 0, NULL),
(166, 'L23a', 'Gehörbildungsprüfung gross', '2026-05-12', '2026-05-12', '13:10:00', '13:55:00', 'pruefung', 'SMU', NULL, 0, 0, NULL),
(167, 'L23a', 'Selbstkorrektur Textgebundene Erörterung', '2026-03-27', '2026-03-27', NULL, NULL, 'todo', '', 17, 1, 0, 'offen'),
(168, 'L23a', 'Grammar', '2026-05-05', '2026-05-05', '08:50:00', '10:35:00', 'pruefung', 'EN', NULL, 0, 0, NULL),
(169, 'L23a', 'vocab.', '2026-05-08', '2026-05-08', '13:10:00', '13:55:00', 'pruefung', 'EN', NULL, 0, 0, NULL),
(170, 'L23a', 'Test di vocabolario pagine 293-318', '2026-04-22', '2026-04-22', '13:10:00', '14:45:00', 'pruefung', 'IT', NULL, 0, 0, NULL),
(171, 'L23b', 'vocabolario', '2026-04-22', '2026-04-22', '13:10:00', '14:45:00', 'pruefung', 'IT', NULL, 0, 0, NULL),
(172, 'L23a', 'vocabolario + grammatica', '2026-05-27', '2026-05-27', '13:10:00', '14:45:00', 'pruefung', 'IT', NULL, 0, 0, NULL),
(173, 'L23a', 'presentazioni', '2026-05-13', '2026-05-13', '13:10:00', '14:45:00', 'pruefung', 'IT', NULL, 0, 0, NULL),
(174, 'L23a', 'test vocabolario', '2026-06-10', '2026-06-10', '13:10:00', '14:45:00', 'pruefung', 'IT', NULL, 0, 0, NULL),
(175, 'L23a', 'Redoxchemie', '2026-06-02', '2026-06-02', '10:40:00', '11:25:00', 'pruefung', 'CH', NULL, 0, 0, NULL),
(177, 'L23a', 'Abgabe reading project III', '2026-04-19', '2026-04-19', '23:58:00', '23:59:00', 'pruefung', 'EN', NULL, 0, 0, NULL),
(178, 'L23a', 'Klimawoche\n\nWelche Landschaften entstehen, wenn \ndie Gletscher verschwinden? —Vortrag von Dr. Daniel Odermatt, Eawag\n5. Klassen Aula', '2026-04-27', '2026-04-27', '09:50:00', '10:35:00', 'event', '', NULL, 0, 0, NULL),
(179, 'L23a', 'Klimawoche\n\nPsychology for change\nWovon hängen unsere Entscheidungen ab? — Workshop von myclimate\nL23a Zi E016', '2026-04-28', '2026-04-28', '13:10:00', '16:35:00', 'event', '', NULL, 0, 0, NULL),
(180, 'L23a', 'Aufgaben zu Redoxgleichungen fertiglösen (Übung 11.1 A2 (a. bis d.))', '2026-04-28', '2026-04-28', '10:40:00', '11:25:00', 'hausaufgabe', 'CH', NULL, 0, 0, NULL),
(181, 'L23a', 'Grammar bank p. 159', '2026-04-24', '2026-04-24', '13:10:00', '13:55:00', 'hausaufgabe', 'EN', NULL, 0, 0, NULL),
(182, 'L23a', 'Maturandentag', '2026-05-13', '2026-05-13', '08:00:00', '11:25:00', 'event', '', NULL, 0, 0, NULL),
(183, 'L23a', 'Examen sur les fables', '2026-05-13', '2026-05-13', '13:10:00', '14:45:00', 'pruefung', 'FR', NULL, 0, 0, NULL),
(184, 'L23a', 'iusölhfc', '2026-05-04', '2026-05-04', '15:00:00', '16:35:00', 'hausaufgabe', 'SPM-MA', NULL, 0, 0, NULL),
(185, 'L23a', 'vocab.', '2026-06-09', '2026-06-09', '08:50:00', '10:40:00', 'pruefung', 'EN', NULL, 0, 0, NULL),
(186, 'L23a', 'english presentation\nAnna, Lea, Timo', '2026-05-26', '2026-05-26', '08:50:00', '10:40:00', 'pruefung', 'EN', NULL, 0, 0, NULL),
(187, 'L23a', 'Examen de grammaire (26-30), vocabulaire (43-48) + compréhension orale/écrite (100%)', '2026-06-03', '2026-06-03', '13:10:00', '13:55:00', 'pruefung', 'FR', NULL, 0, 0, NULL),
(188, 'L23a', 'Examen de rédaction (100%)', '2026-06-17', '2026-06-17', '13:10:00', '14:45:00', 'pruefung', 'FR', NULL, 0, 0, NULL),
(189, 'L23a', 'ALT Multiple Choice Woyzek', '2026-06-08', '2026-06-08', '13:10:00', '14:00:00', 'pruefung', 'DE', NULL, 0, 0, NULL),
(190, 'L23a', 'Kalkulation', '2026-06-11', '2026-06-11', '10:40:00', '11:25:00', 'pruefung', 'WR', NULL, 0, 0, NULL),
(191, 'L23a', 'Übung 11.2 A1', '2026-05-05', '2026-05-05', '10:40:00', '11:25:00', 'hausaufgabe', 'CH', NULL, 0, 0, NULL);

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `email_verifications`
--

CREATE TABLE `email_verifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `code` varchar(8) NOT NULL,
  `expires_at` datetime NOT NULL,
  `failed_attempts` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Daten für Tabelle `email_verifications`
--

INSERT INTO `email_verifications` (`id`, `user_id`, `email`, `code`, `expires_at`, `failed_attempts`, `created_at`) VALUES
(22, 34, 'claudia.waterbaer@sluz.ch', '41734327', '2026-05-09 21:55:18', 0, '2026-05-09 23:47:18');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `encrypted_grade_vaults`
--

CREATE TABLE `encrypted_grade_vaults` (
  `user_id` int(11) NOT NULL,
  `vault_json` mediumtext NOT NULL,
  `revision` int(11) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `events`
--

CREATE TABLE `events` (
  `id` int(11) NOT NULL,
  `titel` varchar(255) NOT NULL,
  `beschreibung` text DEFAULT NULL,
  `startzeit` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `hausaufgaben`
--

CREATE TABLE `hausaufgaben` (
  `id` int(11) NOT NULL,
  `fachkuerzel` varchar(50) DEFAULT NULL,
  `beschreibung` text DEFAULT NULL,
  `faellig_am` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `hausaufgaben`
--

INSERT INTO `hausaufgaben` (`id`, `fachkuerzel`, `beschreibung`, `faellig_am`) VALUES
(336, 'PH', 'Sofies Welt, Aristoteles, S.127-147 (S.72-90 Sokrates freiwillig)', '2025-10-17 00:00:00'),
(337, 'CH', 'Arbeitsaufträge vom Dienstag', '2025-10-17 00:00:00'),
(338, 'MA', 'Arbeitsaufträge von letzter Woche. (Siehe Mail)', '2025-10-20 00:00:00'),
(339, 'WR', 'Arbeitsaufträge vorangegangene Woche. (Siehe E-Mail)', '2025-10-21 00:00:00'),
(340, 'DE', 'Emilia Galotti lesen bis S. 73', '2025-10-27 00:00:00'),
(341, 'DE', 'Emilia Galotti feritg lesen', '2025-11-03 00:00:00'),
(342, 'FR', 'Jean-Luc persécuté', '2025-11-05 13:10:00'),
(343, 'EN', 'Testcorrection', '2025-11-04 00:00:00'),
(344, 'FR', 'Jean Luc Kapitel 7, Voc 28', '2025-11-25 13:10:00');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `password_resets`
--

CREATE TABLE `password_resets` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `code` varchar(16) NOT NULL,
  `expires_at` datetime NOT NULL,
  `used_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Daten für Tabelle `password_resets`
--

INSERT INTO `password_resets` (`id`, `user_id`, `email`, `code`, `expires_at`, `used_at`, `created_at`) VALUES
(19, 29, 'timothee.liniger@sluz.ch', '45275475', '2025-12-19 16:22:42', NULL, '2025-12-19 17:07:42'),
(24, 14, 'joseph_stuecklin@sluz.ch', '43179238', '2026-01-06 10:03:34', NULL, '2026-01-06 10:48:34'),
(27, 23, 'timowigger8@gmail.com', '07643812', '2026-02-25 09:54:30', NULL, '2026-02-25 10:39:30'),
(34, 19, 'jean_beng@sluz.ch', '64151797', '2026-02-26 13:20:23', NULL, '2026-02-26 14:05:23'),
(43, 31, 'tim_wolf@sluz.ch', '26266954', '2026-03-25 09:58:09', NULL, '2026-03-25 10:43:09'),
(45, 17, 'timo_wigger@sluz.ch', '80487843', '2026-04-28 07:34:31', NULL, '2026-04-28 09:19:31');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `pruefungen`
--

CREATE TABLE `pruefungen` (
  `id` int(11) NOT NULL,
  `fachkuerzel` varchar(50) DEFAULT NULL,
  `beschreibung` text DEFAULT NULL,
  `pruefungsdatum` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `pruefungen`
--

INSERT INTO `pruefungen` (`id`, `fachkuerzel`, `beschreibung`, `pruefungsdatum`) VALUES
(10, 'IT', 'Langenscheidt S 177-206', '2025-05-27 14:00:00'),
(12, 'MA', 'Vektorgeometrie', '2025-06-18 12:00:00'),
(14, 'IN', 'Datenbanken NEU', '2025-05-14 08:00:00'),
(21, 'EN', 'Abgabe Extract', '2025-05-27 00:00:00'),
(24, 'SPM-PS', 'SF Physikprüfung 4', '2025-05-15 13:10:00'),
(25, 'BI', 'Ökologie', '2025-06-06 00:00:00'),
(26, 'SPM-MA', 'Komplexe Zahlen, Verschiebedatum 10.06.2025', '2025-06-03 00:00:00'),
(27, 'GS', 'Einigung in Europa (Prüfungsform in Abklärung', '2025-06-11 00:00:00'),
(28, 'FR', 'Langenscheidt Prüfung zwei S. 47 - 80', '2025-05-16 08:00:00'),
(29, 'IN', 'Informationen und Daten', '2025-06-18 08:00:00'),
(30, 'EN', '*Mündlich Prüfungen E12:* \n11:30 Timo, 11:45 Joseph, 12:00 Marvin, 12:15 Beatriz, 12:30 Liana, 12:45 Jonas', '2025-06-03 00:00:00'),
(31, 'EN', '*Mündlich Prüfung E12:* 11.30 Tim, 11:45 Mischa, 12:00 Gideon, 12:15 Kevin, 12:30 Valentin, 12:45 Luan', '2025-06-06 00:00:00'),
(32, 'GG', 'China', '2025-06-16 13:10:00'),
(33, 'EN', 'Unit 8', '2025-06-17 09:50:00'),
(34, 'PS', 'Kräfte', '2025-06-12 14:00:00'),
(36, 'SPM-MA', 'Prüfung', '2025-10-27 15:00:00'),
(37, 'SPM-MA', 'Prüfung', '2025-12-15 00:00:00'),
(38, 'CH', 'Prüfung', '2025-10-28 10:40:00'),
(39, 'CH', 'Prüfung', '2024-12-16 10:40:00'),
(40, 'PS', 'Prüfung', '2025-11-13 00:00:00'),
(41, 'PS', 'Prüfung', '2026-01-15 10:40:00'),
(42, 'SPM-PS', 'Prüfung', '2025-09-19 00:00:00'),
(43, 'SPM-PS', '', '2025-12-12 08:00:00'),
(44, 'FR', 'Vorträge FSP (Gewichtung: 0,5), Andere Daten 04.09 und 10.09', '2025-09-03 13:10:00'),
(45, 'PH', 'Prüfung', '2025-11-07 00:00:00'),
(48, 'PH', 'Prüfung', '2026-01-09 00:00:00'),
(49, 'DE', 'Aufsatzt', '2025-09-01 00:00:00'),
(50, 'DE', 'Inhaltssicherung Lektüre 22 Bahnen', '2025-09-08 00:00:00'),
(51, 'SMU', 'Prüfung Jazzanalyse', '2025-11-03 00:00:00'),
(52, 'DE', 'Mündlich Prüfung Lektüre (Dialoganalyse) ALT', '2025-11-13 00:00:00'),
(53, 'DE', 'Mündlich Prüfung Lektüre (Dialoganalyse) ALT', '2025-11-17 00:00:00'),
(54, 'DE', 'ALT Multiple Chioce Prüfung Werter', '2025-11-27 00:00:00'),
(55, 'FR', 'Voci S. 80 - 112 (Gewichtung: 0,5)', '2025-09-11 00:00:00'),
(56, 'EF', 'EF Prüfungen', '2025-10-23 00:00:00'),
(57, 'GS', 'Prüfung', '2025-10-20 00:00:00'),
(58, 'SMU', 'Septakkorde und Zwischendominanten', '2025-10-28 00:00:00'),
(59, 'WR', 'Prüfung', '2025-11-04 00:00:00'),
(60, 'FR', 'Voci Prüfung S. 112 - 147', '2025-11-12 00:00:00'),
(61, 'SMU', 'Prüfung Melodie- und Rythmusdiktat (Gewichtung: 0,5)', '2025-09-16 13:10:00'),
(62, 'SMU', 'ALT Mündlich Prüfung', '2025-11-18 00:00:00'),
(63, 'GS', 'Prüfung Quellenanalyse', '2025-11-24 00:00:00'),
(64, 'EF', 'Ergänzungsfachprüfungen', '2025-12-11 00:00:00'),
(65, 'WR', 'Prüfung', '2025-12-16 00:00:00'),
(66, 'DE', 'Prüfung', '2025-12-18 00:00:00'),
(67, 'CH', 'Prüfung', '2026-01-13 00:00:00'),
(68, 'IT', 'Erfahrungen aus dem FSP Zi18 ', '2025-10-27 11:40:00'),
(69, 'IT', 'Abgabe FSP Bericht', '2025-09-19 00:00:00'),
(70, 'FR', 'Langenscheidt S. 147-177', '2026-01-08 00:00:00'),
(71, 'IT', 'Prüfung', '2025-09-17 00:00:00'),
(72, 'MA', 'Prüfung', '2025-09-17 00:00:00'),
(73, 'MA', 'Prüfung 3', '2026-01-14 00:00:00'),
(74, 'MA', 'Prüfung', '2025-11-26 00:00:00'),
(75, 'FR', 'Mateo Falcone Prüfung', '2025-10-29 13:10:00'),
(76, 'EN', 'reading/listening', '2025-10-17 00:00:00'),
(77, 'EN', 'grammar/vocabulary ', '2025-10-24 00:00:00'),
(78, 'IT', 'Voci Langenscheidt pp. 52-64, 163-176', '2025-11-05 00:00:00'),
(79, 'DE', 'ALT Emila Galotti', '2025-11-10 00:00:00'),
(80, 'PS', 'Physik Prüfung 1', '2025-11-06 00:00:00'),
(81, 'SMU', '', '2025-11-04 13:10:00'),
(82, 'EN', 'Inspector Calls', '2025-12-02 08:50:00');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `reports`
--

CREATE TABLE `reports` (
  `id` int(11) NOT NULL,
  `player_uuid` varchar(36) NOT NULL,
  `reporter_name` varchar(16) NOT NULL,
  `reason` text NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` varchar(16) DEFAULT 'offen',
  `assigned_staff` varchar(100) DEFAULT NULL,
  `notes` varchar(2048) NOT NULL DEFAULT '',
  `last_updated` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `reports`
--

INSERT INTO `reports` (`id`, `player_uuid`, `reporter_name`, `reason`, `timestamp`, `status`, `assigned_staff`, `notes`, `last_updated`) VALUES
(20, '978326fe-5c2c-4c23-892d-90b66a532c63', 'Botphone3124', 'darf me das?', '2025-10-17 10:43:48', 'offen', NULL, 'test', '2026-03-10 11:13:11'),
(22, '978326fe-5c2c-4c23-892d-90b66a532c63', 'Lets_go_AT', 'liam kannst du das lesen?', '2025-10-17 10:45:54', 'offen', NULL, '', '2026-03-10 11:13:12');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `school_holidays`
--

CREATE TABLE `school_holidays` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` varchar(40) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `description` text DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `special_days`
--

CREATE TABLE `special_days` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `scope` varchar(20) NOT NULL DEFAULT 'global',
  `class_id` int(11) DEFAULT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `mode` varchar(40) NOT NULL,
  `description` text DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `special_day_lessons`
--

CREATE TABLE `special_day_lessons` (
  `id` int(11) NOT NULL,
  `special_day_id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `room` varchar(255) DEFAULT NULL,
  `group_name` varchar(100) DEFAULT NULL,
  `start_time` varchar(8) NOT NULL,
  `end_time` varchar(8) NOT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `special_events`
--

CREATE TABLE `special_events` (
  `id` int(11) NOT NULL,
  `title` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `typ` enum('ferien','ausfall','verschiebung') NOT NULL,
  `start` datetime NOT NULL,
  `ende` datetime NOT NULL,
  `raum` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `stundenplan_entries`
--

CREATE TABLE `stundenplan_entries` (
  `id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `tag` varchar(10) NOT NULL,
  `lesson_number` int(11) DEFAULT NULL,
  `start` varchar(5) NOT NULL,
  `end` varchar(5) NOT NULL,
  `fach` varchar(100) NOT NULL,
  `raum` varchar(50) NOT NULL,
  `group_name` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `stundenplan_entries`
--

INSERT INTO `stundenplan_entries` (`id`, `class_id`, `tag`, `lesson_number`, `start`, `end`, `fach`, `raum`, `group_name`) VALUES
(1, 1, 'Monday', NULL, '00:00', '08:00', 'Unterrichtsfrei', '-', NULL),
(2, 1, 'Monday', NULL, '08:00', '08:45', 'Geschichte', '114', NULL),
(3, 1, 'Monday', NULL, '08:45', '08:50', 'Pause', '-', NULL),
(4, 1, 'Monday', NULL, '08:50', '09:35', 'Geschichte', '114', NULL),
(5, 1, 'Monday', NULL, '09:35', '09:50', 'Pause', '-', NULL),
(6, 1, 'Monday', NULL, '09:50', '10:35', 'Sport', 'T1/T2', NULL),
(7, 1, 'Monday', NULL, '10:35', '10:40', 'Pause', '-', NULL),
(8, 1, 'Monday', NULL, '10:40', '11:25', 'Sport', 'T1/T7', NULL),
(9, 1, 'Monday', NULL, '11:25', '11:30', 'Pause', '-', NULL),
(10, 1, 'Monday', NULL, '12:15', '13:10', 'Mittagspause', '-', NULL),
(11, 1, 'Monday', NULL, '13:10', '13:55', 'Deutsch', 'E9', NULL),
(12, 1, 'Monday', NULL, '13:55', '14:00', 'Pause', '-', NULL),
(13, 1, 'Monday', NULL, '14:00', '14:45', 'Deutsch', 'E9', NULL),
(14, 1, 'Monday', NULL, '14:45', '14:55', 'Pause', '-', NULL),
(15, 1, 'Monday', NULL, '15:00', '15:45', 'SPM-MA/SES/SMUü', 'E7/E10/E016', NULL),
(16, 1, 'Monday', NULL, '15:45', '15:50', 'Pause', '-', NULL),
(17, 1, 'Monday', NULL, '15:50', '16:35', 'SPM-MA/SES/SMUü', 'E7/E10/E016', NULL),
(18, 1, 'Monday', NULL, '16:40', '17:25', 'Klassenstunde', 'E8', NULL),
(19, 1, 'Monday', NULL, '17:25', '23:59', 'Unterrichtsfrei', '-', NULL),
(20, 1, 'Tuesday', NULL, '00:00', '08:00', 'Unterrichtsfrei', '-', NULL),
(21, 1, 'Tuesday', NULL, '08:00', '08:45', 'Wirtschaft', '117', NULL),
(22, 1, 'Tuesday', NULL, '08:45', '08:50', 'Pause', '-', NULL),
(23, 1, 'Tuesday', NULL, '08:50', '09:35', 'Englisch', 'E11', NULL),
(24, 1, 'Tuesday', NULL, '09:35', '09:50', 'Pause', '-', NULL),
(25, 1, 'Tuesday', NULL, '09:50', '10:35', 'Englisch', 'E11', NULL),
(26, 1, 'Tuesday', NULL, '10:35', '10:40', 'Pause', '-', NULL),
(27, 1, 'Tuesday', NULL, '10:40', '11:25', 'Chemie', '206', NULL),
(28, 1, 'Tuesday', NULL, '11:25', '13:10', 'Mittagspause', '-', NULL),
(29, 1, 'Tuesday', NULL, '13:10', '13:55', 'SES/SMU', 'E10/E016', NULL),
(30, 1, 'Tuesday', NULL, '13:55', '14:00', 'Pause', '-', NULL),
(31, 1, 'Tuesday', NULL, '14:00', '14:45', 'SES/SMU', 'E10/E016', NULL),
(32, 1, 'Tuesday', NULL, '14:45', '23:59', 'Unterrichtsfrei', '-', NULL),
(33, 1, 'Wednesday', NULL, '00:00', '08:00', 'Unterrichtsfrei', '-', NULL),
(34, 1, 'Wednesday', NULL, '08:00', '08:45', 'Freilektion', '-', NULL),
(35, 1, 'Wednesday', NULL, '08:45', '08:50', 'Pause', '-', NULL),
(36, 1, 'Wednesday', NULL, '08:50', '09:35', 'Freilektion', '-', NULL),
(37, 1, 'Wednesday', NULL, '09:35', '09:50', 'Pause', '-', NULL),
(38, 1, 'Wednesday', NULL, '09:50', '10:35', 'Mathematik', 'E14', NULL),
(39, 1, 'Wednesday', NULL, '10:35', '10:40', 'Pause', '-', NULL),
(40, 1, 'Wednesday', NULL, '10:40', '11:25', 'Mathematik', 'E14', NULL),
(41, 1, 'Wednesday', NULL, '11:25', '13:10', 'Mittagspause', '-', NULL),
(42, 1, 'Wednesday', NULL, '13:10', '13:55', 'Italienisch/Französisch', '17/E16', NULL),
(43, 1, 'Wednesday', NULL, '13:55', '14:00', 'Pause', '-', NULL),
(44, 1, 'Wednesday', NULL, '14:00', '14:45', 'Italienisch/Französisch', '17/E16', NULL),
(45, 1, 'Wednesday', NULL, '14:45', '15:00', 'Pause', '-', NULL),
(46, 1, 'Wednesday', NULL, '15:00', '15:45', 'Bildnerisches Gestalten/Musik', '22/E020', NULL),
(47, 1, 'Wednesday', NULL, '15:45', '15:50', 'Pause', '-', NULL),
(48, 1, 'Wednesday', NULL, '15:50', '16:35', 'Bildnerisches Gestalten/Frei', '22/-', NULL),
(49, 1, 'Wednesday', NULL, '16:35', '23:59', 'Unterrichtsfrei', '-', NULL),
(50, 1, 'Thursday', NULL, '00:00', '08:00', 'Unterrichtsfrei', '-', NULL),
(51, 1, 'Thursday', NULL, '08:00', '08:45', 'Deutsch', '114', NULL),
(52, 1, 'Thursday', NULL, '08:45', '08:50', 'Pause', '-', NULL),
(53, 1, 'Thursday', NULL, '08:50', '09:35', 'Deutsch', '114', NULL),
(54, 1, 'Thursday', NULL, '09:35', '09:50', 'Pause', '-', NULL),
(55, 1, 'Thursday', NULL, '09:50', '10:35', 'Italienisch/Französisch', '214/E16', NULL),
(56, 1, 'Thursday', NULL, '10:35', '10:40', 'Pause', '-', NULL),
(57, 1, 'Thursday', NULL, '10:40', '11:25', 'Physik', '107', NULL),
(58, 1, 'Thursday', NULL, '11:25', '13:10', 'Mittagspause', '-', NULL),
(59, 1, 'Thursday', NULL, '13:10', '13:55', 'Ergänzungsfächer', 'div.', NULL),
(60, 1, 'Thursday', NULL, '13:55', '14:00', 'Pause', '-', NULL),
(61, 1, 'Thursday', NULL, '14:00', '14:45', 'Ergänzungsfächer', 'div.', NULL),
(62, 1, 'Thursday', NULL, '14:45', '15:00', 'Pause', '-', NULL),
(63, 1, 'Thursday', NULL, '15:00', '15:45', 'Chemie prak./Physik prak.', '211,20/112', NULL),
(64, 1, 'Thursday', NULL, '15:45', '15:50', 'Pause', '-', NULL),
(65, 1, 'Thursday', NULL, '15:50', '16:35', 'Chemie prak./Physik prak.', '211,20/112', NULL),
(66, 1, 'Thursday', NULL, '16:35', '23:59', 'Unterrichtsfrei', '-', NULL),
(67, 1, 'Friday', NULL, '00:00', '08:00', 'Unterrichtsfrei', '-', NULL),
(68, 1, 'Friday', NULL, '08:00', '08:45', 'SPM-PS/Frei', '110/-', NULL),
(69, 1, 'Friday', NULL, '08:45', '08:50', 'Pause', '-', NULL),
(70, 1, 'Friday', NULL, '08:50', '09:35', 'SPM-PS/Frei', '110/-', NULL),
(71, 1, 'Friday', NULL, '09:35', '09:50', 'Pause', '-', NULL),
(72, 1, 'Friday', NULL, '09:50', '10:35', 'Philosophie', '219', NULL),
(73, 1, 'Friday', NULL, '10:35', '10:40', 'Pause', '-', NULL),
(74, 1, 'Friday', NULL, '10:40', '11:25', 'Philosophie', '219', NULL),
(75, 1, 'Friday', NULL, '11:25', '13:10', 'Mittagspause', '-', NULL),
(76, 1, 'Friday', NULL, '13:10', '13:55', 'Englisch', 'E11', NULL),
(77, 1, 'Friday', NULL, '13:55', '14:00', 'Pause', '-', NULL),
(78, 1, 'Friday', NULL, '14:00', '14:45', 'Mathematik', 'E14', NULL),
(79, 1, 'Friday', NULL, '14:45', '15:00', 'Pause', '-', NULL),
(80, 1, 'Friday', NULL, '15:00', '15:45', 'Mathematik', 'E14', NULL),
(81, 1, 'Friday', NULL, '15:45', '23:59', 'Unterrichtsfrei', '-', NULL),
(82, 1, 'Saturday', NULL, '00:00', '23:59', 'Wochenende (Samstag)', '-', NULL),
(83, 1, 'Sunday', NULL, '00:00', '23:59', 'Wochenende (Sonntag)', '-', NULL),
(167, 2, 'Monday', NULL, '00:00', '08:00', 'Unterrichtsfrei', '-', NULL),
(168, 2, 'Monday', NULL, '08:00', '08:45', 'Geschichte', '114', NULL),
(169, 2, 'Monday', NULL, '08:45', '08:50', 'Pause', '-', NULL),
(170, 2, 'Monday', NULL, '08:50', '09:35', 'Geschichte', '114', NULL),
(171, 2, 'Monday', NULL, '09:35', '09:50', 'Pause', '-', NULL),
(172, 2, 'Monday', NULL, '09:50', '10:35', 'Sport', 'T1/T2', NULL),
(173, 2, 'Monday', NULL, '10:35', '10:40', 'Pause', '-', NULL),
(174, 2, 'Monday', NULL, '10:40', '11:25', 'Sport', 'T1/T7', NULL),
(175, 2, 'Monday', NULL, '11:25', '11:30', 'Pause', '-', NULL),
(176, 2, 'Monday', NULL, '12:15', '13:10', 'Mittagspause', '-', NULL),
(177, 2, 'Monday', NULL, '13:10', '13:55', 'Deutsch', 'E9', NULL),
(178, 2, 'Monday', NULL, '13:55', '14:00', 'Pause', '-', NULL),
(179, 2, 'Monday', NULL, '14:00', '14:45', 'Deutsch', 'E9', NULL),
(180, 2, 'Monday', NULL, '14:45', '14:55', 'Pause', '-', NULL),
(181, 2, 'Monday', NULL, '15:00', '15:45', 'SPM-MA/SES/SMUü', 'E15/E10/E016', NULL),
(182, 2, 'Monday', NULL, '15:45', '15:50', 'Pause', '-', NULL),
(183, 2, 'Monday', NULL, '15:50', '16:35', 'SPM-MA/SES/SMUü', 'E15/E10/E016', NULL),
(184, 2, 'Monday', NULL, '16:40', '17:25', 'Klassenstunde', 'E8', NULL),
(185, 2, 'Monday', NULL, '17:25', '23:59', 'Unterrichtsfrei', '-', NULL),
(186, 2, 'Tuesday', NULL, '00:00', '08:00', 'Unterrichtsfrei', '-', NULL),
(187, 2, 'Tuesday', NULL, '08:00', '08:45', 'Wirtschaft', '117', NULL),
(188, 2, 'Tuesday', NULL, '08:45', '08:50', 'Pause', '-', NULL),
(189, 2, 'Tuesday', NULL, '08:50', '09:35', 'Englisch', 'E11', NULL),
(190, 2, 'Tuesday', NULL, '09:35', '09:50', 'Pause', '-', NULL),
(191, 2, 'Tuesday', NULL, '09:50', '10:35', 'Englisch', 'E11', NULL),
(192, 2, 'Tuesday', NULL, '10:35', '10:40', 'Pause', '-', NULL),
(193, 2, 'Tuesday', NULL, '10:40', '11:25', 'Chemie', '206', NULL),
(194, 2, 'Tuesday', NULL, '11:25', '13:10', 'Mittagspause', '-', NULL),
(195, 2, 'Tuesday', NULL, '13:10', '13:55', 'SES/SMU', 'E10/E016', NULL),
(196, 2, 'Tuesday', NULL, '13:55', '14:00', 'Pause', '-', NULL),
(197, 2, 'Tuesday', NULL, '14:00', '14:45', 'SES/SMU', 'E10/E016', NULL),
(198, 2, 'Tuesday', NULL, '14:45', '23:59', 'Unterrichtsfrei', '-', NULL),
(199, 2, 'Wednesday', NULL, '00:00', '08:00', 'Unterrichtsfrei', '-', NULL),
(200, 2, 'Wednesday', NULL, '08:00', '08:45', 'Freilektion', '-', NULL),
(201, 2, 'Wednesday', NULL, '08:45', '08:50', 'Pause', '-', NULL),
(202, 2, 'Wednesday', NULL, '08:50', '09:35', 'Freilektion', '-', NULL),
(203, 2, 'Wednesday', NULL, '09:35', '09:50', 'Pause', '-', NULL),
(204, 2, 'Wednesday', NULL, '09:50', '10:35', 'Mathematik', 'E14', NULL),
(205, 2, 'Wednesday', NULL, '10:35', '10:40', 'Pause', '-', NULL),
(206, 2, 'Wednesday', NULL, '10:40', '11:25', 'Mathematik', 'E14', NULL),
(207, 2, 'Wednesday', NULL, '11:25', '13:10', 'Mittagspause', '-', NULL),
(208, 2, 'Wednesday', NULL, '13:10', '13:55', 'Italienisch/Französisch', '17/E16', NULL),
(209, 2, 'Wednesday', NULL, '13:55', '14:00', 'Pause', '-', NULL),
(210, 2, 'Wednesday', NULL, '14:00', '14:45', 'Italienisch/Französisch', '17/E16', NULL),
(211, 2, 'Wednesday', NULL, '14:45', '15:00', 'Pause', '-', NULL),
(212, 2, 'Wednesday', NULL, '15:00', '15:45', 'Bildnerisches Gestalten/Musik', '22/E020', NULL),
(213, 2, 'Wednesday', NULL, '15:45', '15:50', 'Pause', '-', NULL),
(214, 2, 'Wednesday', NULL, '15:50', '16:35', 'Bildnerisches Gestalten/Frei', '22/-', NULL),
(215, 2, 'Wednesday', NULL, '16:35', '23:59', 'Unterrichtsfrei', '-', NULL),
(216, 2, 'Thursday', NULL, '00:00', '08:00', 'Unterrichtsfrei', '-', NULL),
(217, 2, 'Thursday', NULL, '08:00', '08:45', 'Deutsch', '114', NULL),
(218, 2, 'Thursday', NULL, '08:45', '08:50', 'Pause', '-', NULL),
(219, 2, 'Thursday', NULL, '08:50', '09:35', 'Deutsch', '114', NULL),
(220, 2, 'Thursday', NULL, '09:35', '09:50', 'Pause', '-', NULL),
(221, 2, 'Thursday', NULL, '09:50', '10:35', 'Italienisch/Französisch', '214/E16', NULL),
(222, 2, 'Thursday', NULL, '10:35', '10:40', 'Pause', '-', NULL),
(223, 2, 'Thursday', NULL, '10:40', '11:25', 'Physik', '107', NULL),
(224, 2, 'Thursday', NULL, '11:25', '13:10', 'Mittagspause', '-', NULL),
(225, 2, 'Thursday', NULL, '13:10', '13:55', 'Ergänzungsfächer', 'div.', NULL),
(226, 2, 'Thursday', NULL, '13:55', '14:00', 'Pause', '-', NULL),
(227, 2, 'Thursday', NULL, '14:00', '14:45', 'Ergänzungsfächer', 'div.', NULL),
(228, 2, 'Thursday', NULL, '14:45', '15:00', 'Pause', '-', NULL),
(229, 2, 'Thursday', NULL, '15:00', '15:45', 'Chemie prak./Physik prak.', '211,20/112', NULL),
(230, 2, 'Thursday', NULL, '15:45', '15:50', 'Pause', '-', NULL),
(231, 2, 'Thursday', NULL, '15:50', '16:35', 'Chemie prak./Physik prak.', '211,20/112', NULL),
(232, 2, 'Thursday', NULL, '16:35', '23:59', 'Unterrichtsfrei', '-', NULL),
(233, 2, 'Friday', NULL, '00:00', '08:00', 'Unterrichtsfrei', '-', NULL),
(234, 2, 'Friday', NULL, '08:00', '08:45', 'SPM-PS/Frei', '110/-', NULL),
(235, 2, 'Friday', NULL, '08:45', '08:50', 'Pause', '-', NULL),
(236, 2, 'Friday', NULL, '08:50', '09:35', 'SPM-PS/Frei', '110/-', NULL),
(237, 2, 'Friday', NULL, '09:35', '09:50', 'Pause', '-', NULL),
(238, 2, 'Friday', NULL, '09:50', '10:35', 'Philosophie', '219', NULL),
(239, 2, 'Friday', NULL, '10:35', '10:40', 'Pause', '-', NULL),
(240, 2, 'Friday', NULL, '10:40', '11:25', 'Philosophie', '219', NULL),
(241, 2, 'Friday', NULL, '11:25', '13:10', 'Mittagspause', '-', NULL),
(242, 2, 'Friday', NULL, '13:10', '13:55', 'Englisch', 'E11', NULL),
(243, 2, 'Friday', NULL, '13:55', '14:00', 'Pause', '-', NULL),
(244, 2, 'Friday', NULL, '14:00', '14:45', 'Mathematik', 'E14', NULL),
(245, 2, 'Friday', NULL, '14:45', '15:00', 'Pause', '-', NULL),
(246, 2, 'Friday', NULL, '15:00', '15:45', 'Mathematik', 'E14', NULL),
(247, 2, 'Friday', NULL, '15:45', '23:59', 'Unterrichtsfrei', '-', NULL),
(248, 2, 'Saturday', NULL, '00:00', '23:59', 'Wochenende (Samstag)', '-', NULL),
(249, 2, 'Sunday', NULL, '00:00', '23:59', 'Wochenende (Sonntag)', '-', NULL),
(250, 7, 'Monday', NULL, '00:00', '08:00', 'Unterrichtsfrei', '-', NULL),
(251, 7, 'Monday', NULL, '08:00', '08:45', 'Klassenstunde', '213', NULL),
(252, 7, 'Monday', NULL, '08:45', '08:50', 'Pause', '-', NULL),
(253, 7, 'Monday', NULL, '08:50', '09:35', 'Mathematik', '107', NULL),
(254, 7, 'Monday', NULL, '09:35', '09:50', 'Pause', '-', NULL),
(255, 7, 'Monday', NULL, '09:50', '10:35', 'Französisch', '17', NULL),
(256, 7, 'Monday', NULL, '10:35', '10:40', 'Pause', '-', NULL),
(257, 7, 'Monday', NULL, '10:40', '11:25', 'Französisch', '17', NULL),
(258, 7, 'Monday', NULL, '11:25', '11:30', 'Pause', '-', NULL),
(259, 7, 'Monday', NULL, '12:15', '13:10', 'Mittagspause', '-', NULL),
(260, 7, 'Monday', NULL, '13:10', '13:55', 'Schwerpunktfach Chemie', '209', NULL),
(261, 7, 'Monday', NULL, '13:55', '14:00', 'Pause', '-', NULL),
(262, 7, 'Monday', NULL, '14:00', '14:45', 'Geografie', '113', NULL),
(263, 7, 'Monday', NULL, '14:45', '14:55', 'Pause', '-', NULL),
(264, 7, 'Monday', NULL, '15:00', '15:45', 'Geografie', '113', NULL),
(265, 7, 'Monday', NULL, '15:45', '15:50', 'Pause', '-', NULL),
(266, 7, 'Monday', NULL, '15:50', '16:35', 'Sport', 'T1/T2', NULL),
(267, 7, 'Monday', NULL, '16:40', '17:25', 'Sport', 'T1/T2', NULL),
(268, 7, 'Monday', NULL, '17:25', '23:59', 'Unterrichtsfrei', '-', NULL),
(269, 7, 'Tuesday', NULL, '00:00', '08:00', 'Unterrichtsfrei', '-', NULL),
(270, 7, 'Tuesday', NULL, '08:00', '08:45', 'Schwerpunktfach WR', '215', NULL),
(271, 7, 'Tuesday', NULL, '08:45', '08:50', 'Pause', '-', NULL),
(272, 7, 'Tuesday', NULL, '08:50', '09:35', 'Schwerpunktfach WR', '215', NULL),
(273, 7, 'Tuesday', NULL, '09:35', '09:50', 'Pause', '-', NULL),
(274, 7, 'Tuesday', NULL, '09:50', '10:35', 'Englisch', 'E12', NULL),
(275, 7, 'Tuesday', NULL, '10:35', '10:40', 'Pause', '-', NULL),
(276, 7, 'Tuesday', NULL, '10:40', '11:25', 'Mathematik', '107', NULL),
(277, 7, 'Tuesday', NULL, '11:25', '13:10', 'Mittagspause', '-', NULL),
(278, 7, 'Tuesday', NULL, '13:10', '13:55', 'Deutsch', '213', NULL),
(279, 7, 'Tuesday', NULL, '13:55', '14:00', 'Pause', '-', NULL),
(280, 7, 'Tuesday', NULL, '14:00', '14:45', 'Deutsch', '213', NULL),
(281, 7, 'Tuesday', NULL, '14:45', '15:00', 'Pause', '-', NULL),
(282, 7, 'Tuesday', NULL, '15:00', '15:45', 'Biologie', '205', NULL),
(283, 7, 'Tuesday', NULL, '15:45', '23:59', 'Unterrichtsfrei', '-', NULL),
(284, 7, 'Wednesday', NULL, '00:00', '08:00', 'Unterrichtsfrei', '-', NULL),
(285, 7, 'Wednesday', NULL, '08:00', '08:45', 'Englisch', 'E11', NULL),
(286, 7, 'Wednesday', NULL, '08:45', '08:50', 'Pause', '-', NULL),
(287, 7, 'Wednesday', NULL, '08:50', '09:35', 'Informatik', '102', NULL),
(288, 7, 'Wednesday', NULL, '09:35', '09:50', 'Pause', '-', NULL),
(289, 7, 'Wednesday', NULL, '09:50', '10:35', 'Geschichte', '212', NULL),
(290, 7, 'Wednesday', NULL, '10:35', '10:40', 'Pause', '-', NULL),
(291, 7, 'Wednesday', NULL, '10:40', '11:25', 'Geschichte', '212', NULL),
(292, 7, 'Wednesday', NULL, '11:25', '13:10', 'Mittagspause', '-', NULL),
(293, 7, 'Wednesday', NULL, '13:10', '13:55', 'Freilektion', '-', NULL),
(294, 7, 'Wednesday', NULL, '13:55', '14:00', 'Pause', '-', NULL),
(295, 7, 'Wednesday', NULL, '14:00', '14:45', 'Schwerpunktfach Spanisch', 'E10', NULL),
(296, 7, 'Wednesday', NULL, '14:45', '15:00', 'Pause', '-', NULL),
(297, 7, 'Wednesday', NULL, '15:00', '15:45', 'Chemie', '206', NULL),
(298, 7, 'Wednesday', NULL, '15:45', '15:50', 'Pause', '-', NULL),
(299, 7, 'Wednesday', NULL, '15:50', '16:35', 'Chemie', '206', NULL),
(300, 7, 'Wednesday', NULL, '16:35', '23:59', 'Unterrichtsfrei', '-', NULL),
(301, 7, 'Thursday', NULL, '00:00', '08:00', 'Unterrichtsfrei', '-', NULL),
(302, 7, 'Thursday', NULL, '08:00', '08:45', 'Schwerpunktfächer', '205/216/209/215', NULL),
(303, 7, 'Thursday', NULL, '08:45', '08:50', 'Pause', '-', NULL),
(304, 7, 'Thursday', NULL, '08:50', '09:35', 'Schwerpunktfächer', '205/216/209/215', NULL),
(305, 7, 'Thursday', NULL, '09:35', '09:50', 'Pause', '-', NULL),
(306, 7, 'Thursday', NULL, '09:50', '10:35', 'Französisch', '19', NULL),
(307, 7, 'Thursday', NULL, '10:35', '10:40', 'Pause', '-', NULL),
(308, 7, 'Thursday', NULL, '10:40', '11:25', 'Französisch', '19', NULL),
(309, 7, 'Thursday', NULL, '11:25', '13:10', 'Mittagspause', '-', NULL),
(310, 7, 'Thursday', NULL, '13:10', '13:55', 'Biologie', '205', NULL),
(311, 7, 'Thursday', NULL, '13:55', '14:00', 'Pause', '-', NULL),
(312, 7, 'Thursday', NULL, '14:00', '14:45', 'Mathematik', '110', NULL),
(313, 7, 'Thursday', NULL, '14:45', '15:00', 'Pause', '-', NULL),
(314, 7, 'Thursday', NULL, '15:00', '15:45', 'Mathematik', '110', NULL),
(315, 7, 'Thursday', NULL, '15:45', '15:50', 'Pause', '-', NULL),
(316, 7, 'Thursday', NULL, '15:50', '16:35', 'Wahlpflichtfächer', '122/E020', NULL),
(317, 7, 'Thursday', NULL, '16:35', '16:40', 'Pause', '-', NULL),
(318, 7, 'Thursday', NULL, '16:40', '17:25', 'Wahlpflichtfächer', '122', NULL),
(319, 7, 'Thursday', NULL, '17:25', '23:59', 'Unterrichtsfrei', '-', NULL),
(320, 7, 'Friday', NULL, '00:00', '08:00', 'Unterrichtsfrei', '-', NULL),
(321, 7, 'Friday', NULL, '08:00', '08:45', 'Deutsch', '213', NULL),
(322, 7, 'Friday', NULL, '08:45', '08:50', 'Pause', '-', NULL),
(323, 7, 'Friday', NULL, '08:50', '09:35', 'Deutsch', '213', NULL),
(324, 7, 'Friday', NULL, '09:35', '09:50', 'Pause', '-', NULL),
(325, 7, 'Friday', NULL, '09:50', '10:35', 'Schwerpunktfächer', 'E10/215/201', NULL),
(326, 7, 'Friday', NULL, '10:35', '10:40', 'Pause', '-', NULL),
(327, 7, 'Friday', NULL, '10:40', '11:25', 'Schwerpunktfächer', 'E10/215/201', NULL),
(328, 7, 'Friday', NULL, '11:25', '13:10', 'Mittagspause', '-', NULL),
(329, 7, 'Friday', NULL, '13:10', '13:55', 'Sport', 'T1', NULL),
(330, 7, 'Friday', NULL, '13:55', '14:00', 'Pause', '-', NULL),
(331, 7, 'Friday', NULL, '14:00', '14:45', 'Physik', '107', NULL),
(332, 7, 'Friday', NULL, '14:45', '15:00', 'Pause', '-', NULL),
(333, 7, 'Friday', NULL, '15:00', '15:45', 'Physik', '107', NULL),
(334, 7, 'Friday', NULL, '15:45', '15:50', 'Pause', '-', NULL),
(335, 7, 'Friday', NULL, '15:50', '16:35', 'Englisch', 'E11', NULL),
(336, 7, 'Friday', NULL, '15:45', '23:59', 'Unterrichtsfrei', '-', NULL),
(337, 7, 'Saturday', NULL, '00:00', '23:59', 'Wochenende (Samstag)', '-', NULL),
(338, 7, 'Sunday', NULL, '00:00', '23:59', 'Wochenende (Sonntag)', '-', NULL),
(339, 17, 'Monday', NULL, '00:00', '08:00', 'Unterrichtsfrei', '-', NULL),
(340, 17, 'Monday', NULL, '08:00', '08:45', 'Geschichte', '212', NULL),
(341, 17, 'Monday', NULL, '08:45', '08:50', 'Pause', '-', NULL),
(342, 17, 'Monday', NULL, '08:50', '09:35', 'Englisch', 'E11', NULL),
(343, 17, 'Monday', NULL, '09:35', '09:50', 'Pause', '-', NULL),
(344, 17, 'Monday', NULL, '09:50', '10:35', 'Mathematik', 'E7', NULL),
(345, 17, 'Monday', NULL, '10:35', '10:40', 'Pause', '-', NULL),
(346, 17, 'Monday', NULL, '10:40', '11:25', 'Mathematik', 'E7', NULL),
(347, 17, 'Monday', NULL, '11:25', '11:30', 'Pause', '-', NULL),
(348, 17, 'Monday', NULL, '12:15', '13:10', 'Förderkurs Mathematik', 'E7', NULL),
(349, 17, 'Monday', NULL, '12:15', '13:10', 'Mittagspause', '-', NULL),
(350, 17, 'Monday', NULL, '13:10', '13:55', 'SBG/Mittagspause', '22/-', NULL),
(351, 17, 'Monday', NULL, '13:55', '14:00', 'Pause', '-', NULL),
(352, 17, 'Monday', NULL, '14:00', '14:45', 'SBG/Wirtschaft', '22/215', NULL),
(353, 17, 'Monday', NULL, '14:45', '14:55', 'Pause', '-', NULL),
(354, 17, 'Monday', NULL, '15:00', '15:45', 'Deutsch', '114', NULL),
(355, 17, 'Monday', NULL, '15:45', '15:50', 'Pause', '-', NULL),
(356, 17, 'Monday', NULL, '15:50', '16:35', 'Deutsch', '114', NULL),
(357, 17, 'Monday', NULL, '16:40', '23:59', 'Unterrichtsfrei', '-', NULL),
(358, 17, 'Tuesday', NULL, '00:00', '08:00', 'Unterrichtsfrei', '-', NULL),
(359, 17, 'Tuesday', NULL, '08:00', '08:45', 'Klassenstunde', '202', NULL),
(360, 17, 'Tuesday', NULL, '08:45', '08:50', 'Pause', '-', NULL),
(361, 17, 'Tuesday', NULL, '08:50', '09:35', 'Französisch', '18', NULL),
(362, 17, 'Tuesday', NULL, '09:35', '09:50', 'Pause', '-', NULL),
(363, 17, 'Tuesday', NULL, '09:50', '10:35', 'BG', '122', NULL),
(364, 17, 'Tuesday', NULL, '10:35', '10:40', 'Pause', '-', NULL),
(365, 17, 'Tuesday', NULL, '10:40', '11:25', 'BG', '122', NULL),
(366, 17, 'Tuesday', NULL, '11:25', '13:10', 'Mittagspause', '-', NULL),
(367, 17, 'Tuesday', NULL, '13:10', '13:55', 'Biologie Praktikum/Informatik Praktikum', '205/E7', NULL),
(368, 17, 'Tuesday', NULL, '13:55', '14:00', 'Pause', '-', NULL),
(369, 17, 'Tuesday', NULL, '14:00', '14:45', 'Biologie Praktikum/Informatik Praktikum', '205/E7', NULL),
(370, 17, 'Tuesday', NULL, '15:00', '15:45', 'Religion', '116', NULL),
(371, 17, 'Tuesday', NULL, '15:45', '23:59', 'Unterrichtsfrei', '-', NULL),
(372, 17, 'Wednesday', NULL, '00:00', '08:00', 'Unterrichtsfrei', '-', NULL),
(373, 17, 'Wednesday', NULL, '08:00', '08:45', 'Musik', 'E016', NULL),
(374, 17, 'Wednesday', NULL, '08:45', '08:50', 'Pause', '-', NULL),
(375, 17, 'Wednesday', NULL, '08:50', '09:35', 'Musik', 'E016', NULL),
(376, 17, 'Wednesday', NULL, '09:35', '09:50', 'Pause', '-', NULL),
(377, 17, 'Wednesday', NULL, '09:50', '10:35', 'Geographie', '103', NULL),
(378, 17, 'Wednesday', NULL, '10:35', '10:40', 'Pause', '-', NULL),
(379, 17, 'Wednesday', NULL, '10:40', '11:25', 'Geographie', '103', NULL),
(380, 17, 'Wednesday', NULL, '11:25', '13:10', 'Mittagspause', '-', NULL),
(381, 17, 'Wednesday', NULL, '13:10', '13:55', 'Geschichte', '212', NULL),
(382, 17, 'Wednesday', NULL, '13:55', '14:00', 'Pause', '-', NULL),
(383, 17, 'Wednesday', NULL, '14:00', '14:45', 'Französisch', '18', NULL),
(384, 17, 'Wednesday', NULL, '14:45', '15:00', 'Pause', '-', NULL),
(385, 17, 'Wednesday', NULL, '15:00', '15:45', 'Wirtschaft/SBG', '216/118', NULL),
(386, 17, 'Wednesday', NULL, '15:45', '15:50', 'Pause', '-', NULL),
(387, 17, 'Wednesday', NULL, '15:50', '16:35', 'Biologie', '202', NULL),
(388, 17, 'Wednesday', NULL, '16:35', '23:59', 'Unterrichtsfrei', '-', NULL),
(389, 17, 'Thursday', NULL, '00:00', '08:00', 'Unterrichtsfrei', '-', NULL),
(390, 17, 'Thursday', NULL, '08:00', '08:45', 'Religion', '116', NULL),
(391, 17, 'Thursday', NULL, '08:45', '08:50', 'Pause', '-', NULL),
(392, 17, 'Thursday', NULL, '08:50', '09:35', 'Mathematik', 'E15', NULL),
(393, 17, 'Thursday', NULL, '09:35', '09:50', 'Pause', '-', NULL),
(394, 17, 'Thursday', NULL, '09:50', '10:35', 'Französisch', '18', NULL),
(395, 17, 'Thursday', NULL, '10:35', '10:40', 'Pause', '-', NULL),
(396, 17, 'Thursday', NULL, '10:40', '11:25', 'Sport', 'T1', NULL),
(397, 17, 'Thursday', NULL, '11:25', '13:55', 'Mittagspause', '-', NULL),
(398, 17, 'Thursday', NULL, '13:55', '14:00', 'Pause', '-', NULL),
(399, 17, 'Thursday', NULL, '14:00', '14:45', 'Englisch', 'E11', NULL),
(400, 17, 'Thursday', NULL, '14:45', '15:00', 'Pause', '-', NULL),
(401, 17, 'Thursday', NULL, '15:00', '15:45', 'Informatik', 'E7', NULL),
(402, 17, 'Thursday', NULL, '15:45', '23:59', 'Unterrichtsfrei', '-', NULL),
(403, 17, 'Friday', NULL, '00:00', '08:00', 'Unterrichtsfrei', '-', NULL),
(404, 17, 'Friday', NULL, '08:00', '08:45', 'Deutsch', '114', NULL),
(405, 17, 'Friday', NULL, '08:45', '08:50', 'Pause', '-', NULL),
(406, 17, 'Friday', NULL, '08:50', '09:35', 'Deutsch', '114', NULL),
(407, 17, 'Friday', NULL, '09:35', '09:50', 'Pause', '-', NULL),
(408, 17, 'Friday', NULL, '09:50', '10:35', 'Chemie', '206', NULL),
(409, 17, 'Friday', NULL, '10:35', '10:40', 'Pause', '-', NULL),
(410, 17, 'Friday', NULL, '10:40', '11:25', 'Chemie', '206', NULL),
(411, 17, 'Friday', NULL, '11:25', '13:10', 'Mittagspause', '-', NULL),
(412, 17, 'Friday', NULL, '13:10', '13:55', 'Sport', 'T2', NULL),
(413, 17, 'Friday', NULL, '13:55', '14:00', 'Pause', '-', NULL),
(414, 17, 'Friday', NULL, '14:00', '14:45', 'Sport', 'T2', NULL),
(415, 17, 'Friday', NULL, '14:45', '15:00', 'Pause', '-', NULL),
(416, 17, 'Friday', NULL, '15:00', '15:45', 'Englisch', 'E11', NULL),
(417, 17, 'Friday', NULL, '15:45', '15:50', 'Pause', '-', NULL),
(418, 17, 'Friday', NULL, '15:50', '16:35', 'Mathematik', 'E7', NULL),
(419, 17, 'Friday', NULL, '16:35', '23:59', 'Unterrichtsfrei', '-', NULL),
(420, 17, 'Saturday', NULL, '00:00', '23:59', 'Wochenende (Samstag)', '-', NULL),
(421, 17, 'Sunday', NULL, '00:00', '23:59', 'Wochenende (Sonntag)', '-', NULL),
(422, 12, 'Monday', NULL, '00:00', '08:00', 'Unterrichtsfrei', '-', NULL),
(423, 12, 'Monday', NULL, '08:00', '08:45', 'Geschichte', '214', NULL),
(424, 12, 'Monday', NULL, '08:45', '08:50', 'Pause', '-', NULL),
(425, 12, 'Monday', NULL, '08:50', '09:35', 'Deutsch', 'E015', NULL),
(426, 12, 'Monday', NULL, '09:35', '09:50', 'Pause', '-', NULL),
(427, 12, 'Monday', NULL, '09:50', '10:35', 'Hauswirtschaft/Informatik und Medien', 'E019/13', NULL),
(428, 12, 'Monday', NULL, '10:35', '10:40', 'Pause', '-', NULL),
(429, 12, 'Monday', NULL, '10:40', '11:25', 'Hauswirtschaft/Informatik und Medien', 'E019/13', NULL),
(430, 12, 'Monday', NULL, '11:25', '11:30', 'Pause', '-', NULL),
(431, 12, 'Monday', NULL, '11:30', '12:15', 'Hauswirtschaft', 'E019', NULL),
(432, 12, 'Monday', NULL, '12:15', '12:20', 'Pause', '-', NULL),
(433, 12, 'Monday', NULL, '12:20', '13:05', 'Hauswirtschaft', 'E019', NULL),
(434, 12, 'Monday', NULL, '13:05', '13:10', 'Pause', '-', NULL),
(435, 12, 'Monday', NULL, '13:10', '13:55', 'Mathematik', 'E13', NULL),
(436, 12, 'Monday', NULL, '13:55', '14:00', 'Pause', '-', NULL),
(437, 12, 'Monday', NULL, '14:00', '14:45', 'Geografie', '106', NULL),
(438, 12, 'Monday', NULL, '14:45', '15:00', 'Pause', '-', NULL),
(439, 12, 'Monday', NULL, '15:00', '15:45', 'Geografie', '106', NULL),
(440, 12, 'Monday', NULL, '15:45', '23:59', 'Unterrichtsfrei', '-', NULL),
(441, 12, 'Tuesday', NULL, '00:00', '08:00', 'Unterrichtsfrei', '-', NULL),
(442, 12, 'Tuesday', NULL, '08:00', '08:45', 'Biologie', '201', NULL),
(443, 12, 'Tuesday', NULL, '08:45', '08:50', 'Pause', '-', NULL),
(444, 12, 'Tuesday', NULL, '08:50', '09:35', 'Biologie', '201', NULL),
(445, 12, 'Tuesday', NULL, '09:35', '09:50', 'Pause', '-', NULL),
(446, 12, 'Tuesday', NULL, '09:50', '10:35', 'Religionskunde / Ethik', '118', NULL),
(447, 12, 'Tuesday', NULL, '10:35', '10:40', 'Pause', '-', NULL),
(448, 12, 'Tuesday', NULL, '10:40', '11:25', 'Sport', 'T1/T2', NULL),
(449, 12, 'Tuesday', NULL, '11:25', '13:10', 'Mittagspause', '-', NULL),
(450, 12, 'Tuesday', NULL, '13:10', '13:55', 'Französisch', '16', NULL),
(451, 12, 'Tuesday', NULL, '13:55', '14:00', 'Pause', '-', NULL),
(452, 12, 'Tuesday', NULL, '14:00', '14:45', 'Mathematik', 'E13', NULL),
(453, 12, 'Tuesday', NULL, '14:45', '15:00', 'Pause', '-', NULL),
(454, 12, 'Tuesday', NULL, '15:00', '15:45', 'Mathematik', 'E13', NULL),
(455, 12, 'Tuesday', NULL, '15:45', '15:50', 'Pause', '-', NULL),
(456, 12, 'Tuesday', NULL, '15:50', '16:35', 'Naturwissenschaften Technik und', '206', NULL),
(457, 12, 'Tuesday', NULL, '16:35', '23:59', 'Unterrichtsfrei', '-', NULL),
(458, 12, 'Wednesday', NULL, '00:00', '08:50', 'Unterrichtsfrei', '-', NULL),
(459, 12, 'Wednesday', NULL, '08:50', '09:35', 'Klassenstunde', '202', NULL),
(460, 12, 'Wednesday', NULL, '09:35', '09:50', 'Pause', '-', NULL),
(461, 12, 'Wednesday', NULL, '09:50', '10:35', 'Bildnerisches Gestalten', '22', NULL),
(462, 12, 'Wednesday', NULL, '10:35', '10:40', 'Pause', '-', NULL),
(463, 12, 'Wednesday', NULL, '10:40', '11:25', 'Bildnerisches Gestalten', '22', NULL),
(464, 12, 'Wednesday', NULL, '11:25', '13:10', 'Mittagspause', '-', NULL),
(465, 12, 'Wednesday', NULL, '13:10', '13:55', 'Musik', 'E020', NULL),
(466, 12, 'Wednesday', NULL, '13:55', '14:00', 'Pause', '-', NULL),
(467, 12, 'Wednesday', NULL, '14:00', '14:45', 'Musik', 'E020', NULL),
(468, 12, 'Wednesday', NULL, '14:45', '15:00', 'Pause', '-', NULL),
(469, 12, 'Wednesday', NULL, '15:00', '15:45', 'Geschichte', '214', NULL),
(470, 12, 'Wednesday', NULL, '15:45', '23:59', 'Unterrichtsfrei', '-', NULL),
(471, 12, 'Thursday', NULL, '00:00', '08:00', 'Unterrichtsfrei', '-', NULL),
(472, 12, 'Thursday', NULL, '08:00', '08:45', 'Naturwissenschaften Technik und', '221', NULL),
(473, 12, 'Thursday', NULL, '08:45', '08:50', 'Pause', '-', NULL),
(474, 12, 'Thursday', NULL, '08:50', '09:35', 'Sport', 'T1/T2', NULL),
(475, 12, 'Thursday', NULL, '09:35', '09:50', 'Pause', '-', NULL),
(476, 12, 'Thursday', NULL, '09:50', '10:35', 'Sport', 'T1/T2', NULL),
(477, 12, 'Thursday', NULL, '10:35', '10:40', 'Pause', '-', NULL),
(478, 12, 'Thursday', NULL, '10:40', '11:25', 'Mathematik', 'E13', NULL),
(479, 12, 'Thursday', NULL, '11:25', '13:10', 'Mittagspause', '-', NULL),
(480, 12, 'Thursday', NULL, '13:10', '13:55', 'Deutsch', '216', NULL),
(481, 12, 'Thursday', NULL, '13:55', '14:00', 'Pause', '-', NULL),
(482, 12, 'Thursday', NULL, '14:00', '14:45', 'Deutsch', '216', NULL),
(483, 12, 'Thursday', NULL, '14:45', '15:00', 'Pause', '-', NULL),
(484, 12, 'Thursday', NULL, '15:00', '15:45', 'Englisch', '116', NULL),
(485, 12, 'Thursday', NULL, '15:45', '23:59', 'Unterrichtsfrei', '-', NULL),
(486, 12, 'Friday', NULL, '00:00', '08:00', 'Unterrichtsfrei', '-', NULL),
(487, 12, 'Friday', NULL, '08:00', '08:45', 'Naturwissenschaften Technik und', '221', NULL),
(488, 12, 'Friday', NULL, '08:45', '08:50', 'Pause', '-', NULL),
(489, 12, 'Friday', NULL, '08:50', '09:35', 'Naturwissenschaften Technik und', '221', NULL),
(490, 12, 'Friday', NULL, '09:35', '09:50', 'Pause', '-', NULL),
(491, 12, 'Friday', NULL, '09:50', '10:35', 'Französisch', '16', NULL),
(492, 12, 'Friday', NULL, '10:35', '10:40', 'Pause', '-', NULL),
(493, 12, 'Friday', NULL, '10:40', '11:25', 'Französisch', '16', NULL),
(494, 12, 'Friday', NULL, '11:25', '13:10', 'Mittagspause', '-', NULL),
(495, 12, 'Friday', NULL, '13:10', '13:55', 'Englisch', 'E16', NULL),
(496, 12, 'Friday', NULL, '13:55', '14:00', 'Pause', '-', NULL),
(497, 12, 'Friday', NULL, '14:00', '14:45', 'Interkultureller Sprachvergleich', '213', NULL),
(498, 12, 'Friday', NULL, '14:45', '15:00', 'Pause', '-', NULL),
(499, 12, 'Friday', NULL, '15:00', '15:45', 'Interkultureller Sprachvergleich', '213', NULL),
(500, 12, 'Friday', NULL, '15:45', '23:59', 'Unterrichtsfrei', '-', NULL),
(501, 12, 'Saturday', NULL, '00:00', '23:59', 'Wochenende (Samstag)', '-', NULL),
(502, 12, 'Sunday', NULL, '00:00', '23:59', 'Wochenende (Sonntag)', '-', NULL),
(503, 4, 'Monday', NULL, '00:00', '08:50', 'Unterrichtsfrei', '-', NULL),
(504, 4, 'Monday', NULL, '08:50', '09:35', 'Mathematik', '115', NULL),
(505, 4, 'Monday', NULL, '09:35', '09:50', 'Pause', '-', NULL),
(506, 4, 'Monday', NULL, '09:50', '10:35', 'Sport', 'T1/T2', NULL),
(507, 4, 'Monday', NULL, '10:35', '10:40', 'Pause', '-', NULL),
(508, 4, 'Monday', NULL, '10:40', '11:25', 'Sport', 'T1/T2', NULL),
(509, 4, 'Monday', NULL, '11:25', '13:10', 'Mittagspause', '-', NULL),
(510, 4, 'Monday', NULL, '13:10', '13:55', 'Chemie Praktikum/Physik Praktikum', '206/211/112', NULL),
(511, 4, 'Monday', NULL, '13:55', '14:00', 'Pause', '-', NULL),
(512, 4, 'Monday', NULL, '14:00', '14:45', 'Chemie Praktikum/Physik Praktikum', '206/211/112', NULL),
(513, 4, 'Monday', NULL, '14:45', '15:00', 'Pause', '-', NULL),
(514, 4, 'Monday', NULL, '15:00', '15:45', 'SBC-CH/SWR/SBG', '206/211/117/122', NULL),
(515, 4, 'Monday', NULL, '15:45', '15:50', 'Pause', '-', NULL),
(516, 4, 'Monday', NULL, '15:50', '16:35', 'SBC-CH/SWR/SBG', '206/211/117/122', NULL),
(517, 4, 'Monday', NULL, '16:35', '16:40', 'Pause', '-', NULL),
(518, 4, 'Monday', NULL, '16:40', '17:25', 'Klassenstunde', 'E7', NULL),
(519, 4, 'Monday', NULL, '17:25', '23:59', 'Unterrichtsfrei', '-', NULL),
(520, 4, 'Tuesday', NULL, '00:00', '08:00', 'Unterrichtsfrei', '-', NULL),
(521, 4, 'Tuesday', NULL, '08:00', '08:45', 'Mathematik', '115', NULL),
(522, 4, 'Tuesday', NULL, '08:45', '08:50', 'Pause', '-', NULL),
(523, 4, 'Tuesday', NULL, '08:50', '09:35', 'Englisch', 'E12', NULL),
(524, 4, 'Tuesday', NULL, '09:35', '09:50', 'Pause', '-', NULL),
(525, 4, 'Tuesday', NULL, '09:50', '10:35', 'Wirtschaft und Recht', '215', NULL),
(526, 4, 'Tuesday', NULL, '10:35', '10:40', 'Pause', '-', NULL),
(527, 4, 'Tuesday', NULL, '10:40', '11:25', 'Philosophie', '219', NULL),
(528, 4, 'Tuesday', NULL, '11:25', '13:10', 'Mittagspause', '-', NULL),
(529, 4, 'Tuesday', NULL, '13:10', '13:55', 'SBC-BI/SWR Frei/SBG', '202/-/122', NULL),
(530, 4, 'Tuesday', NULL, '13:55', '14:00', 'Pause', '-', NULL),
(531, 4, 'Tuesday', NULL, '14:00', '14:45', 'SBC-BI/SWR Frei/SBG', '202/-/122', NULL),
(532, 4, 'Tuesday', NULL, '14:45', '23:59', 'Unterrichtsfrei', '-', NULL),
(533, 4, 'Wednesday', NULL, '00:00', '08:00', 'Unterrichtsfrei', '-', NULL),
(534, 4, 'Wednesday', NULL, '08:00', '08:45', 'SBC-CH/SWR Frei/SBG Frei', '209/-/-', NULL),
(535, 4, 'Wednesday', NULL, '08:45', '08:50', 'Pause', '-', NULL),
(536, 4, 'Wednesday', NULL, '08:50', '09:35', 'Chemie', '209', NULL),
(537, 4, 'Wednesday', NULL, '09:35', '09:50', 'Pause', '-', NULL),
(538, 4, 'Wednesday', NULL, '09:50', '10:35', 'Englisch', 'E11', NULL),
(539, 4, 'Wednesday', NULL, '10:35', '10:40', 'Pause', '-', NULL),
(540, 4, 'Wednesday', NULL, '10:40', '11:25', 'Philosophie', '219', NULL),
(541, 4, 'Wednesday', NULL, '11:25', '13:10', 'Mittagspause', '-', NULL),
(542, 4, 'Wednesday', NULL, '13:10', '13:55', 'Französisch/Italienisch', '16/17', NULL),
(543, 4, 'Wednesday', NULL, '13:55', '14:00', 'Pause', '-', NULL),
(544, 4, 'Wednesday', NULL, '14:00', '14:45', 'Französisch/Italienisch', '16/17', NULL),
(545, 4, 'Wednesday', NULL, '14:45', '15:00', 'Pause', '-', NULL),
(546, 4, 'Wednesday', NULL, '15:00', '15:45', 'Deutsch', 'E7', NULL),
(547, 4, 'Wednesday', NULL, '15:45', '15:50', 'Pause', '-', NULL),
(548, 4, 'Wednesday', NULL, '15:50', '16:35', 'Deutsch', 'E7', NULL),
(549, 4, 'Wednesday', NULL, '16:35', '23:59', 'Unterrichtsfrei', '-', NULL),
(550, 4, 'Thursday', NULL, '00:00', '08:00', 'Unterrichtsfrei', '-', NULL),
(551, 4, 'Thursday', NULL, '08:00', '08:45', 'Bildnerisches Gestalten/Musik', '22/E020', NULL),
(552, 4, 'Thursday', NULL, '08:45', '08:50', 'Pause', '-', NULL),
(553, 4, 'Thursday', NULL, '08:50', '09:35', 'Bildnerisches Gestalten', '22', NULL),
(554, 4, 'Thursday', NULL, '09:35', '09:50', 'Pause', '-', NULL),
(555, 4, 'Thursday', NULL, '09:50', '10:35', 'Französisch/Italienisch', '16/214', NULL),
(556, 4, 'Thursday', NULL, '10:35', '10:40', 'Pause', '-', NULL),
(557, 4, 'Thursday', NULL, '10:40', '11:25', 'Englisch', 'E11', NULL),
(558, 4, 'Thursday', NULL, '11:25', '13:10', 'Mittagspause', '-', NULL),
(559, 4, 'Thursday', NULL, '13:10', '13:55', 'Ergänzungsfächer', 'diverse', NULL),
(560, 4, 'Thursday', NULL, '13:55', '14:00', 'Pause', '-', NULL),
(561, 4, 'Thursday', NULL, '14:00', '14:45', 'Ergänzungsfächer', 'diverse', NULL),
(562, 4, 'Thursday', NULL, '14:45', '15:00', 'Pause', '-', NULL),
(563, 4, 'Thursday', NULL, '15:00', '15:45', 'Mathematik', '115', NULL),
(564, 4, 'Thursday', NULL, '15:45', '15:50', 'Pause', '-', NULL),
(565, 4, 'Thursday', NULL, '15:50', '16:35', 'Mathematik', '115', NULL),
(566, 4, 'Thursday', NULL, '16:35', '23:59', 'Unterrichtsfrei', '-', NULL),
(567, 4, 'Friday', NULL, '00:00', '08:00', 'Unterrichtsfrei', '-', NULL),
(568, 4, 'Friday', NULL, '08:00', '08:45', 'SBC Frei/SWR/SBG Frei', '-/117/-', NULL),
(569, 4, 'Friday', NULL, '08:45', '08:50', 'Pause', '-', NULL),
(570, 4, 'Friday', NULL, '08:50', '09:35', 'SBC Frei/SWR/SBG Frei', '-/117/-', NULL),
(571, 4, 'Friday', NULL, '09:35', '09:50', 'Pause', '-', NULL),
(572, 4, 'Friday', NULL, '09:50', '10:35', 'Geschichte', '212', NULL),
(573, 4, 'Friday', NULL, '10:35', '10:40', 'Pause', '-', NULL),
(574, 4, 'Friday', NULL, '10:40', '11:25', 'Geschichte', '212', NULL),
(575, 4, 'Friday', NULL, '11:25', '13:10', 'Mittagspause', '-', NULL),
(576, 4, 'Friday', NULL, '13:10', '13:55', 'Physik', '107', NULL),
(577, 4, 'Friday', NULL, '13:55', '14:00', 'Pause', '-', NULL),
(578, 4, 'Friday', NULL, '14:00', '14:45', 'Deutsch', '16', NULL),
(579, 4, 'Friday', NULL, '14:45', '15:00', 'Pause', '-', NULL),
(580, 4, 'Friday', NULL, '15:00', '15:45', 'Deutsch', '16', NULL),
(581, 4, 'Friday', NULL, '15:45', '23:59', 'Unterrichtsfrei', '-', NULL),
(582, 4, 'Saturday', NULL, '00:00', '23:59', 'Wochenende (Samstag)', '-', NULL),
(583, 4, 'Sunday', NULL, '00:00', '23:59', 'Wochenende (Sonntag)', '-', NULL);

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `timetable_exceptions`
--

CREATE TABLE `timetable_exceptions` (
  `id` int(11) NOT NULL,
  `type` varchar(40) NOT NULL,
  `class_id` int(11) NOT NULL,
  `group_name` varchar(100) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `lesson_number` int(11) DEFAULT NULL,
  `start_time` varchar(8) DEFAULT NULL,
  `end_time` varchar(8) DEFAULT NULL,
  `original_subject` varchar(255) DEFAULT NULL,
  `new_subject` varchar(255) DEFAULT NULL,
  `original_room` varchar(255) DEFAULT NULL,
  `new_room` varchar(255) DEFAULT NULL,
  `original_start_time` varchar(8) DEFAULT NULL,
  `original_end_time` varchar(8) DEFAULT NULL,
  `new_start_time` varchar(8) DEFAULT NULL,
  `new_end_time` varchar(8) DEFAULT NULL,
  `reason` text DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `visible_to_students` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('student','teacher','admin','class_admin') NOT NULL DEFAULT 'student',
  `class_id` int(11) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `last_login_at` datetime DEFAULT NULL,
  `email_verified_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Daten für Tabelle `users`
--

INSERT INTO `users` (`id`, `email`, `password_hash`, `role`, `class_id`, `is_active`, `last_login_at`, `email_verified_at`, `created_at`, `updated_at`) VALUES
(1, 'admin@localhost', '$argon2id$v=19$m=65536,t=3,p=4$IHFmPD/b18zz6WKZ/rYdjA$3YOaQZCmjDh/WeTcWWBdld5/h+bHFDC1PyF0p84gQAI', 'admin', NULL, 1, '2025-10-31 07:13:59', '2025-10-31 07:13:55', '2025-10-17 12:16:56', '2025-10-31 08:13:59'),
(9, 'david_iellamo@sluz.ch', '$argon2id$v=19$m=65536,t=3,p=4$oYgl1kqQdaqIomzZW1rEbA$bHvqY8R1hzbt2yVDqTnGS6i1mkzcywllEhDfOSmaoe8', 'class_admin', 4, 1, '2025-11-05 12:42:30', '2025-10-23 14:04:28', '2025-10-23 14:04:28', '2025-11-05 13:42:30'),
(13, 'jakob_norer@sluz.ch', '$argon2id$v=19$m=65536,t=3,p=4$XKpJmMnx0LT5KEx4Jmhdxw$terez09+i/+2ZhyW3rVZ2b2AA+5w9QnRLGxfFgPn+qs', 'class_admin', 4, 1, '2026-04-20 15:13:23', '2025-10-26 15:17:02', '2025-10-26 16:05:38', '2026-04-20 17:13:23'),
(14, 'joseph_stuecklin@sluz.ch', '$argon2id$v=19$m=65536,t=3,p=4$kCYT7VGK0OPAjL1+xGI6Zw$xRt5C/sAAYIresqVPMMFceD8d0BkaVz0LWVqQ7dgzF4', 'class_admin', 2, 1, '2026-05-12 19:51:00', '2025-10-27 12:40:49', '2025-10-27 13:39:29', '2026-05-12 21:51:00'),
(17, 'timo_wigger@sluz.ch', '$argon2id$v=19$m=65536,t=3,p=4$SvQkO5ewG2bMc13cbFAQPQ$L4t4+MSC+lv2b6rVABmpHB7nL5MLIUFPg0cLSPAsQ9k', 'admin', 2, 1, '2026-05-13 13:24:31', '2025-10-28 14:37:15', '2024-10-28 15:36:00', '2026-05-13 15:24:31'),
(18, 'jonas_katz@sluz.ch', '$argon2id$v=19$m=65536,t=3,p=4$uqHaj+VQiEzoNCMhYlV+FQ$VdSXhwwmy6P735rwnAe4xL0Z188VJ2H/vnt1lTWxVrM', 'student', 2, 1, '2026-03-24 08:38:08', '2025-10-29 09:55:19', '2025-10-29 10:52:26', '2026-03-24 09:38:08'),
(19, 'jean_beng@sluz.ch', '$argon2id$v=19$m=65536,t=3,p=4$MM8RjRXG49fy50hpszrJ7A$6H++xk/rDIqSmnLLZVue6UStj0UvjCbwiLcrTIkZFSI', 'student', 8, 1, '2026-02-26 13:04:58', '2025-10-30 13:39:57', '2025-10-30 14:39:00', '2026-02-26 14:04:58'),
(20, 'kevin_ottiger@sluz.ch', '$argon2id$v=19$m=65536,t=3,p=4$dt8Q9M7ToI/OqFpVH8rQCw$TuyBmMCFlPvNKv53mBYa/+mLenRibhw8fFfHICotfhw', 'class_admin', 2, 1, '2026-05-16 09:32:41', '2025-10-31 13:43:16', '2025-10-31 14:42:11', '2026-05-16 11:32:41'),
(22, 'armon_elvedi@sluz.ch', '$argon2id$v=19$m=65536,t=3,p=4$Q42I2N5Pg4Vcbg0aJRyjbg$THnFWnukZx8cvyvZMy5WiX0Pc1eJE4YHwNXMlTLXVFs', 'class_admin', 7, 1, '2026-05-07 20:30:23', '2025-11-03 10:59:04', '2025-11-03 11:57:56', '2026-05-07 22:30:23'),
(23, 'timowigger8@gmail.com', '$argon2id$v=19$m=65536,t=3,p=4$MvknLJDxWs6HbFLQz4shMA$PBYRKa8AvP7Fs4CtWvqJ8ra6O0MGldaCi316Hm+XamI', 'student', 2, 1, '2026-05-16 13:10:55', '2025-11-03 15:06:53', '2025-11-03 15:05:30', '2026-05-16 15:10:55'),
(26, 'jan_christen@sluz.ch', '$argon2id$v=19$m=65536,t=3,p=4$ELiBF16oBIVaNPLegWiSkA$ovpCKd+aofiOHlZgDX30gX39u1pDnet8gXVXra2Vs+Q', 'class_admin', 4, 1, '2025-11-12 11:17:41', '2025-11-12 11:15:18', '2025-11-12 12:13:57', '2025-11-12 12:17:41'),
(27, 'valentin_wurmet@sluz.ch', '$argon2id$v=19$m=65536,t=3,p=4$KbjkLBJ6hwwQ1Gvgtp49xQ$5mNgnmuUS1EuAa0CUrd+gfA4G6Dhm2L12jbvFtQWcUI', 'student', 2, 1, '2026-05-12 16:26:13', '2025-11-16 17:53:42', '2025-11-16 18:52:04', '2026-05-12 18:26:13'),
(28, 'dario_marra@sluz.ch', '$argon2id$v=19$m=65536,t=3,p=4$9Jad5t5yESFUFVPzEH4HNw$/6yyVOhFW0qMBfwNOLaGXgXuF0v6/J/wEC9RvISQ+zc', 'student', 4, 1, '2025-11-26 13:34:10', '2025-11-26 13:34:02', '2025-11-26 14:31:56', '2025-11-26 14:34:10'),
(29, 'timothee.liniger@sluz.ch', '$argon2id$v=19$m=65536,t=3,p=4$d6E4YSKwIHjIBwAQI2j+eg$f9Cuovht4ui8dXUu91CUe8RX5gtNTithDU2lmG4QQLg', 'teacher', 1, 1, '2026-01-02 11:41:44', '2025-12-19 08:31:43', '2025-12-18 12:24:35', '2026-02-26 10:57:44'),
(30, 'marvin_florezpai@sluz.ch', '$argon2id$v=19$m=65536,t=3,p=4$HgE7Ag/WmIjly8jz4lYbZA$oM2eN7NtRQ3CyjoMbhdROFYgwSzfbU40UcD0Wjzq68c', 'student', 2, 1, '2026-01-22 12:12:35', '2026-01-07 10:48:32', '2026-01-07 11:48:12', '2026-01-22 13:12:35'),
(31, 'tim_wolf@sluz.ch', '$argon2id$v=19$m=65536,t=3,p=4$9hQ4ZdL3PWSasx2mX4/o8A$df+7rKBGXWco1+0VLvkYKOzs+AJlppeCOjzvRr4hcdo', 'student', 2, 1, '2026-04-27 15:59:15', '2026-03-25 09:40:56', '2026-03-25 10:39:33', '2026-04-27 17:59:15'),
(32, 'stinematilda_walter@sluz.ch', '$argon2id$v=19$m=65536,t=3,p=4$DXSgIwv8p7BYxhwhYDsKtg$OLhec+6vXYLyJhP87XLFWXTwSkIglfYft0rXhuVMbQs', 'admin', 2, 1, '2026-05-13 19:43:43', '2026-04-20 11:14:52', '2026-04-20 13:12:54', '2026-05-13 21:43:43'),
(33, 'marisa_angiola@yahoo.de', '$argon2id$v=19$m=65536,t=3,p=4$H7JTWm3pzJIdpcqXpu2DPw$t7UgEiymkvUqn22AFTFrj0Y+FZtKp6t2K8iyymnj8Fc', 'student', 2, 1, NULL, NULL, '2026-04-29 21:23:54', '2026-04-29 21:23:54'),
(34, 'claudia.waterbaer@sluz.ch', '$argon2id$v=19$m=65536,t=3,p=4$hevitSMF7Ab/LxThNXUyWw$xEfx1n0Bl9Tnattw/2Vhom5HhVBAUGPw2TjscpWDQLM', 'teacher', 1, 1, NULL, '2026-04-20 11:14:52', '2026-05-09 23:47:18', '2026-05-12 09:39:45');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `user_app_info`
--

CREATE TABLE `user_app_info` (
  `id` int(11) NOT NULL,
  `windows_username` varchar(100) NOT NULL,
  `app_version` varchar(20) NOT NULL,
  `last_updated` datetime DEFAULT current_timestamp(),
  `isadmin` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `user_app_info`
--

INSERT INTO `user_app_info` (`id`, `windows_username`, `app_version`, `last_updated`, `isadmin`) VALUES
(1, 'timow', 'v1.5.3-dev', '2025-10-17 14:56:04', 1),
(2, 'josep', 'v1.5.5-dev', '2025-03-31 09:12:35', 0),
(3, 'evjackson', 'v1.4.13-dev', '2025-02-13 15:52:34', 0),
(4, 'srober', 'v1.4.13-dev', '2025-02-13 15:52:47', 0),
(5, 'Timo', 'v1.5.5-dev', '2025-06-01 14:50:56', 0),
(6, 'otti2', 'v1.5.5-dev', '2025-03-31 09:14:12', 0),
(7, 'valen', 'v1.5.5-dev', '2025-05-05 08:31:31', 0),
(8, 'randyweave', 'v1.5.2-dev', '2025-02-18 11:14:37', 0),
(9, 'asafri', 'v1.5.2-dev', '2025-02-18 11:18:05', 0),
(10, 'gregor', 'v1.5.2-dev', '2025-02-19 09:17:13', 0),
(11, 'petefisher', 'v1.5.2-dev', '2025-02-19 09:26:57', 0),
(12, 'hrtwi', 'v1.5.2-dev', '2025-03-06 20:20:17', 0),
(13, 'jonas_4u1igqf', 'v1.5.3-dev', '2025-03-11 09:26:06', 0),
(15, 'marvi', 'v1.5.3-dev', '2025-03-25 07:44:37', 0);

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `weekly_preview_cache`
--

CREATE TABLE `weekly_preview_cache` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `class_id` varchar(20) NOT NULL,
  `locale` varchar(8) NOT NULL,
  `window_start` date NOT NULL,
  `window_end` date NOT NULL,
  `include_todos` tinyint(1) NOT NULL DEFAULT 1,
  `summary_markdown` mediumtext NOT NULL,
  `source_hash` char(64) NOT NULL,
  `created_at` datetime NOT NULL,
  `expires_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Daten für Tabelle `weekly_preview_cache`
--

INSERT INTO `weekly_preview_cache` (`id`, `user_id`, `class_id`, `locale`, `window_start`, `window_end`, `include_todos`, `summary_markdown`, `source_hash`, `created_at`, `expires_at`) VALUES
(3, 27, 'L23a', 'de', '2026-02-26', '2026-03-04', 1, '- 2026-02-26 13:10: Prüfung (EF) - EF Prüfungen\n- 2026-02-27 13:10: Hausaufgabe (EN) - Students Book p. 154 und Test Correction\n- 2026-02-27 8:00:: Event - Wintersporttag\n- 2026-03-02 13:10: Prüfung (DE) - ALT Multiple Choice Wilhelm Tell\n- 2026-03-03 10:40: Hausaufgabe (CH) - Aufgabenblatt lösen (teils freiwillig)', '18b35a4faf70fe6504d74289322aebffee23bc432bc5a188cebbe3203c5c29a9', '2026-02-26 09:41:30', '2026-02-26 10:26:30'),
(8, 17, 'L24a', 'de', '2026-02-26', '2026-03-04', 1, 'In den nächsten 7 Tagen hast du 0 Prüfungen, 0 Hausaufgaben, 0 ToDos und 1 Events.\n- Morgen hast du ein Event: Wintersporttag um 8:00:.', '238e64027761f4852f26cd6cb8160a8cfd8c988ad1123a24de3b73082a33c603', '2026-02-26 10:03:03', '2026-02-26 10:48:03'),
(11, 19, 'L22c', 'de', '2026-02-26', '2026-03-04', 1, 'In den nächsten 7 Tagen hast du 0 Prüfungen, 0 Hausaufgaben, 0 ToDos und 1 Events.\n- Morgen hast du ein Event: Wintersporttag um 8:00:.', '238e64027761f4852f26cd6cb8160a8cfd8c988ad1123a24de3b73082a33c603', '2026-02-26 13:05:12', '2026-02-26 13:50:12'),
(16, 17, 'L23a', 'de', '2026-02-26', '2026-03-04', 1, 'In den nächsten 7 Tagen hast du 4 Prüfungen, 2 Hausaufgaben, 0 ToDos und 1 Events.\n- Heute hast du einen EF Test um 13:10.\n- Morgen ist eine Hausaufgabe in EN fällig um 13:10.\n- Morgen hast du ein Event: Wintersporttag um 8:00:.\n- Am Montag hast du einen DE Test um 13:10.\n- Am Dienstag ist eine Hausaufgabe in CH fällig um 10:40.\n- Am Dienstag hast du einen SES Test um 13:10.\n- Am Dienstag hast du einen EN Test um 8:50:.', 'e20f303ec4d2536b7e6733bf00bb6999af6e82318e56519b8f36faa834b3dd95', '2026-02-26 15:00:11', '2026-02-26 15:45:11'),
(24, 17, 'L23a', 'de', '2026-03-02', '2026-03-08', 1, 'In den nächsten 7 Tagen hast du 3 Prüfungen, 1 Hausaufgaben, 0 ToDos und 0 Events.\n- Heute hast du einen DE Test um 13:10.\n- Morgen ist eine Hausaufgabe in CH fällig um 10:40.\n- Morgen hast du einen SES Test um 13:10.\n- Morgen hast du einen EN Test um 8:50:.', '259945b902ce1f6d481c37e4a41cc1b1d8fb1a8bc62fb590f4024ab25546d2d4', '2026-03-02 07:55:32', '2026-03-02 08:40:32'),
(25, 17, 'L23a', 'de', '2026-03-04', '2026-03-10', 1, 'In den nächsten 7 Tagen hast du 0 Prüfungen, 2 Hausaufgaben, 0 ToDos und 0 Events.\n- Übermorgen ist eine Hausaufgabe in EN fällig um 13:10.\n- Am Dienstag ist eine Hausaufgabe in CH fällig um 10:40.', 'a158eee78cd5b201072f22db48c3561475fe1421eb6873eaabda358b7ac0145c', '2026-03-04 13:53:40', '2026-03-04 14:38:40'),
(26, 17, 'L23a', 'de', '2026-03-05', '2026-03-11', 1, 'In den nächsten 7 Tagen hast du 2 Prüfungen, 2 Hausaufgaben, 0 ToDos und 0 Events.\n- Morgen ist eine Hausaufgabe in EN fällig um 13:10.\n- Am Dienstag ist eine Hausaufgabe in CH fällig um 10:40.\n- Am Mittwoch hast du einen IT Test um 13:10.\n- Am Mittwoch hast du einen FR Test um 13:10.', 'a7000ad2e126fec619b9dae8b8bc697c71d42981f965be8e61735e3cf1d20fcd', '2026-03-05 08:46:47', '2026-03-05 09:31:47'),
(27, 17, 'L23a', 'de', '2026-03-06', '2026-03-12', 1, 'In den nächsten 7 Tagen hast du 2 Prüfungen, 3 Hausaufgaben, 0 ToDos und 0 Events.\n- Heute ist eine Hausaufgabe in EN fällig um 13:10.\n- Am Dienstag ist eine Hausaufgabe in CH fällig um 10:40.\n- Am Mittwoch hast du einen IT Test um 13:10.\n- Am Mittwoch hast du einen FR Test um 13:10.\n- Am Donnerstag ist eine Hausaufgabe in DE fällig um 8:00:.', '9264379c61b95556fd3db7cffebe3b394a01c6113e68eb1627c19d2eeebb21b9', '2026-03-06 11:11:25', '2026-03-06 11:56:25'),
(28, 17, 'L23a', 'de', '2026-03-07', '2026-03-13', 1, 'In den nächsten 7 Tagen hast du 3 Prüfungen, 2 Hausaufgaben, 0 ToDos und 0 Events.\n- Am Dienstag ist eine Hausaufgabe in CH fällig um 10:40.\n- Am Mittwoch hast du einen IT Test um 13:10.\n- Am Mittwoch hast du einen FR Test um 13:10.\n- Am Donnerstag ist eine Hausaufgabe in DE fällig um 8:00:.\n- Am Freitag hast du einen PH Test um 9:50:.', '13c99a2db3bb3979aeb9ba141863257a75d010e0ac495d7a65faf504f076b991', '2026-03-07 21:32:56', '2026-03-07 22:17:56'),
(30, 17, 'L23a', 'de', '2026-03-09', '2026-03-15', 1, 'In den nächsten 7 Tagen hast du 3 Prüfungen, 2 Hausaufgaben, 0 ToDos und 0 Events.\n- Morgen ist eine Hausaufgabe in CH fällig um 10:40.\n- Übermorgen hast du einen IT Test um 13:10.\n- Übermorgen hast du einen FR Test um 13:10.\n- Am Donnerstag ist eine Hausaufgabe in DE fällig um 8:00:.\n- Am Freitag hast du einen PH Test um 9:50:.', '13c99a2db3bb3979aeb9ba141863257a75d010e0ac495d7a65faf504f076b991', '2026-03-09 13:29:30', '2026-03-09 14:14:30'),
(32, 17, 'L23a', 'de', '2026-03-11', '2026-03-17', 1, 'In den nächsten 7 Tagen hast du 4 Prüfungen, 1 Hausaufgaben, 1 ToDos und 0 Events.\n- Heute hast du einen IT Test um 13:10.\n- Heute hast du einen FR Test um 13:10.\n- Morgen ist eine Hausaufgabe in DE fällig um 8:00:.\n- Übermorgen steht dein ToDo an: Abgabe Disposition Maturaarbeit.\n- Übermorgen hast du einen PH Test um 9:50:.\n- Am Montag hast du einen GS Test um 8:00:.', '9fc2a9fb6d1a94ba33e799d27352237cd1d1955f32b65e7406339da9e0385195', '2026-03-11 10:18:02', '2026-03-11 11:03:02'),
(33, 17, 'L23a', 'de', '2026-03-12', '2026-03-18', 1, 'In den nächsten 7 Tagen hast du 2 Prüfungen, 2 Hausaufgaben, 1 ToDos und 0 Events.\n- Heute ist eine Hausaufgabe in DE fällig um 8:00:.\n- Morgen steht dein ToDo an: Abgabe Disposition Maturaarbeit.\n- Morgen hast du einen PH Test um 9:50:.\n- Am Montag ist eine Hausaufgabe in DE fällig um 13:10.\n- Am Montag hast du einen GS Test um 8:00:.', '05b4105396f918b4e6bbb81462ef1ddc89d604fbe60fa069f04abeb3f2ca242c', '2026-03-12 07:06:30', '2026-03-12 07:51:30'),
(34, 23, 'L23a', 'de', '2026-03-12', '2026-03-18', 1, 'In den nächsten 7 Tagen hast du 2 Prüfungen, 2 Hausaufgaben, 0 ToDos und 0 Events.\n- Heute ist eine Hausaufgabe in DE fällig um 8:00:.\n- Morgen hast du einen PH Test um 9:50:.\n- Am Montag ist eine Hausaufgabe in DE fällig um 13:10.\n- Am Montag hast du einen GS Test um 8:00:.', '8a2d5233852a28ce5de33495017993e455a2287a7baca2ab05a8e73394fe607b', '2026-03-12 12:31:55', '2026-03-12 13:16:55'),
(36, 17, 'L23a', 'de', '2026-03-13', '2026-03-19', 1, 'In den nächsten 7 Tagen hast du 3 Prüfungen, 1 Hausaufgaben, 1 ToDos und 0 Events.\n- Heute steht dein ToDo an: Abgabe Disposition Maturaarbeit.\n- Heute hast du einen PH Test um 9:50:.\n- Am Montag ist eine Hausaufgabe in DE fällig um 13:10.\n- Am Montag hast du einen GS Test um 8:00:.\n- Am Donnerstag hast du einen FR Test um 9:50:.', 'fd52aa84b3d7f03ead2df72939f2e0e07bd99881245c486406af1a13ee6dca1b', '2026-03-13 10:12:05', '2026-03-13 10:57:05'),
(37, 17, 'L23a', 'de', '2026-03-16', '2026-03-22', 1, 'In den nächsten 7 Tagen hast du 4 Prüfungen, 1 Hausaufgaben, 1 ToDos und 0 Events.\n- Heute ist eine Hausaufgabe in DE fällig um 13:10.\n- Heute hast du einen GS Test um 8:00:.\n- Am Donnerstag hast du einen FR Test um 9:50:.\n- Am Freitag steht dein ToDo an: Merkblätter Geschichte (siehe Whatsapp Chat) Bis um 20:00 Uhr.\n- Am Freitag hast du einen MA Test um 14:00.\n- Am Freitag hast du einen SPM-PS Test um 8:00:.', '0af759b8a760a26aacf9a3cf91095e607a42fc6293a92a25c01a32ff21aaa1d1', '2026-03-16 08:20:55', '2026-03-16 09:05:55'),
(38, 17, 'L23a', 'de', '2026-03-17', '2026-03-23', 1, 'In den nächsten 7 Tagen hast du 6 Prüfungen, 0 Hausaufgaben, 1 ToDos und 0 Events.\n- Übermorgen hast du einen FR Test um 9:50:.\n- Am Freitag steht dein ToDo an: Merkblätter Geschichte (siehe Whatsapp Chat) Bis um 20:00 Uhr.\n- Am Freitag hast du einen MA Test um 14:00.\n- Am Freitag hast du einen SPM-PS Test um 8:00:.\n- Am Montag hast du einen SES Test um 13:10.\n- Am Montag hast du einen SPM-MA Test um 15:00.\n- Am Montag hast du einen GS Test um 8:00:.', 'dc61e0bb120a81c8abd1602f0c1fd7216ad9eab7fcdb801a3910b05ab4b620e4', '2026-03-17 06:53:42', '2026-03-17 07:38:42'),
(39, 17, 'L23a', 'de', '2026-03-23', '2026-03-29', 1, 'In den nächsten 7 Tagen hast du 4 Prüfungen, 1 Hausaufgaben, 0 ToDos und 0 Events.\n- Heute hast du einen SES Test um 13:10.\n- Heute hast du einen SPM-MA Test um 15:00.\n- Heute hast du einen GS Test um 8:00:.\n- Morgen hast du einen CH Test um 10:40.\n- Morgen ist eine Hausaufgabe in WR fällig um 8:00:.', '9360ea6fe2b447964f5a4f8ca9ef45c0dcbf7e042bbd908a33a1c04dda76687f', '2026-03-23 07:29:24', '2026-03-23 08:14:24'),
(40, 18, 'L23a', 'en', '2026-03-24', '2026-03-30', 1, 'In the next 7 days you have 2 exams, 1 homework items, 0 todos and 0 events.\n- Today you have an exam in CH at 10:40.\n- Today a homework task is due in WR at 8:00:.\n- On Monday you have an exam in GS at 8:00:.', '88c45f6009193b914aa7447d393facb5281796f23dd78ada0d5f159ef10384dd', '2026-03-24 08:38:25', '2026-03-24 09:23:25'),
(43, 31, 'L23a', 'en', '2026-03-25', '2026-03-31', 1, 'In the next 7 days you have 2 exams, 0 homework items, 0 todos and 0 events.\n- On Monday you have an exam in GS at 8:00:.\n- On Tuesday you have an exam in WR at 8:00:.', '99893d05cdbc33435710afa06a48391e2637c0d0d1a9d5d9ae651948d5d1020e', '2026-03-25 09:41:59', '2026-03-25 10:26:59'),
(44, 17, 'L23a', 'de', '2026-03-25', '2026-03-31', 1, 'In den nächsten 7 Tagen hast du 2 Prüfungen, 0 Hausaufgaben, 1 ToDos und 0 Events.\n- Übermorgen steht dein ToDo an: Selbstkorrektur Textgebundene Erörterung.\n- Am Montag hast du einen GS Test um 8:00:.\n- Am Dienstag hast du einen WR Test um 8:00:.', 'b59e82925b47b3b5e010cfff956b4a2c0d11b44c74df680a4dd8844811816936', '2026-03-25 12:15:57', '2026-03-25 13:00:57'),
(45, 17, 'L23a', 'de', '2026-03-27', '2026-04-02', 1, 'In den nächsten 7 Tagen hast du 3 Prüfungen, 0 Hausaufgaben, 1 ToDos und 0 Events.\n- Heute steht dein ToDo an: Selbstkorrektur Textgebundene Erörterung.\n- Am Montag hast du einen GS Test um 8:00:.\n- Am Dienstag hast du einen WR Test um 8:00:.\n- Am Donnerstag hast du einen PS Test um 10:40.', '8cdd66cc10d1a63d246e89b8d81da712bc8c924802aa4b9adb3d9bffd99b5c9c', '2026-03-27 14:48:36', '2026-03-27 15:33:36'),
(46, 17, 'L23a', 'de', '2026-04-02', '2026-04-08', 1, 'In den nächsten 7 Tagen hast du 1 Prüfungen, 0 Hausaufgaben, 0 ToDos und 0 Events.\n- Heute hast du einen PS Test um 10:40.\n- Morgen beginnen Ferien.', 'dfdee4e3d7dc6930b35ac6bb0723e3da0ad93eee9096a641f5c70a4366edee13', '2026-04-02 05:39:36', '2026-04-02 06:24:36'),
(47, 17, 'L23a', 'de', '2026-04-09', '2026-04-15', 1, 'In den nächsten 7 Tagen hast du keine Einträge.', '4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945', '2026-04-08 22:11:36', '2026-04-08 22:56:36'),
(48, 17, 'L23a', 'de', '2026-04-11', '2026-04-17', 1, 'In den nächsten 7 Tagen hast du keine Einträge.', '4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945', '2026-04-11 11:10:32', '2026-04-11 11:55:32'),
(49, 17, 'L23a', 'de', '2026-04-21', '2026-04-27', 1, 'In den nächsten 7 Tagen hast du 4 Prüfungen, 1 Hausaufgaben, 0 ToDos und 1 Events.\n- Heute hast du einen SMU Test um 13:10.\n- Morgen hast du einen IT Test um 13:10.\n- Übermorgen hast du einen DE Test um 8:00:.\n- Am Freitag ist eine Hausaufgabe in EN fällig um 13:10.\n- Am Montag hast du einen DE Test um 13:10.\n- Am Montag hast du ein Event: Klimawoche um 9:50:.', 'c8efad23824e27e213f1b8a5614a9bdf241f2420b2131d6466dd84e608056b0d', '2026-04-21 20:20:43', '2026-04-21 21:05:43'),
(50, 32, 'L23a', 'de', '2026-04-27', '2026-05-03', 1, 'In den nächsten 7 Tagen hast du 2 Prüfungen, 1 Hausaufgaben, 0 ToDos und 2 Events.\n- Heute hast du einen DE Test um 13:10.\n- Heute hast du ein Event: Klimawoche um 9:50:.\n- Morgen ist eine Hausaufgabe in CH fällig um 10:40.\n- Morgen hast du ein Event: Klimawoche um 13:10.\n- Am Donnerstag hast du einen EF Test um 13:10.', '1376666bf21dc0c173084398f782777d449c7c501139c86910f47fb92b2b0e4e', '2026-04-27 06:47:26', '2026-04-27 07:32:26'),
(51, 17, 'L23a', 'de', '2026-04-27', '2026-05-03', 1, 'In den nächsten 7 Tagen hast du 2 Prüfungen, 1 Hausaufgaben, 0 ToDos und 2 Events.\n- Heute hast du einen DE Test um 13:10.\n- Heute hast du ein Event: Klimawoche um 9:50:.\n- Morgen ist eine Hausaufgabe in CH fällig um 10:40.\n- Morgen hast du ein Event: Klimawoche um 13:10.\n- Am Donnerstag hast du einen EF Test um 13:10.', '1376666bf21dc0c173084398f782777d449c7c501139c86910f47fb92b2b0e4e', '2026-04-27 13:03:16', '2026-04-27 13:48:16'),
(52, 32, 'L25a', 'de', '2026-05-04', '2026-05-10', 1, 'In den nächsten 7 Tagen hast du keine Einträge.', '4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945', '2026-05-04 06:48:35', '2026-05-04 07:33:35'),
(53, 32, 'L23a', 'de', '2026-05-04', '2026-05-10', 1, 'In den nächsten 7 Tagen hast du 2 Prüfungen, 2 Hausaufgaben, 0 ToDos und 0 Events.\n- Heute ist eine Hausaufgabe in SPM-MA fällig um 15:00.\n- Morgen ist eine Hausaufgabe in CH fällig um 10:40.\n- Morgen hast du einen EN Test um 8:50:.\n- Am Freitag hast du einen EN Test um 13:10.', '7a7b3a5ae6a2aeafbd5e5b34b1dfe07bf1e3a13b1217027891c1a371d9af7101', '2026-05-04 06:48:42', '2026-05-04 07:33:42'),
(54, 17, 'L23a', 'de', '2026-05-04', '2026-05-10', 1, 'In den nächsten 7 Tagen hast du 2 Prüfungen, 2 Hausaufgaben, 0 ToDos und 0 Events.\n- Heute ist eine Hausaufgabe in SPM-MA fällig um 15:00.\n- Morgen ist eine Hausaufgabe in CH fällig um 10:40.\n- Morgen hast du einen EN Test um 8:50:.\n- Am Freitag hast du einen EN Test um 13:10.', '7a7b3a5ae6a2aeafbd5e5b34b1dfe07bf1e3a13b1217027891c1a371d9af7101', '2026-05-04 07:11:01', '2026-05-04 07:56:01'),
(55, 17, 'L23a', 'de', '2026-05-10', '2026-05-16', 1, 'In den nächsten 7 Tagen hast du 4 Prüfungen, 0 Hausaufgaben, 0 ToDos und 2 Events.\n- Morgen hast du ein Event: Elternabend der 5 um 19:00. Klassen.\n- Morgen hast du einen GS Test um 8:00:.\n- Übermorgen hast du einen SMU Test um 13:10.\n- Am Mittwoch hast du einen IT Test um 13:10.\n- Am Mittwoch hast du einen FR Test um 13:10.\n- Am Mittwoch hast du ein Event: Maturandentag um 8:00:.\n- Am Donnerstag beginnen Ferien.', 'b6fc3d933c70bfc10b126fbc591d5311943a8d5b1ddb5b83a0d780cb37e60ffb', '2026-05-10 16:52:24', '2026-05-10 17:37:24');

--
-- Indizes der exportierten Tabellen
--

--
-- Indizes für die Tabelle `app_versions`
--
ALTER TABLE `app_versions`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `aufgaben`
--
ALTER TABLE `aufgaben`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `calendar_preferences`
--
ALTER TABLE `calendar_preferences`
  ADD PRIMARY KEY (`user_id`);

--
-- Indizes für die Tabelle `classes`
--
ALTER TABLE `classes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_classes_slug` (`slug`),
  ADD UNIQUE KEY `uq_classes_title` (`title`);

--
-- Indizes für die Tabelle `class_schedules`
--
ALTER TABLE `class_schedules`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_class_schedules_class` (`class_id`);

--
-- Indizes für die Tabelle `eintraege`
--
ALTER TABLE `eintraege`
  ADD PRIMARY KEY (`id`,`class_id`),
  ADD KEY `idx_eintraege_owner_private` (`owner_user_id`,`is_private`),
  ADD KEY `idx_eintraege_private_date` (`is_private`,`datum`);

--
-- Indizes für die Tabelle `email_verifications`
--
ALTER TABLE `email_verifications`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_email_verifications_user` (`user_id`),
  ADD KEY `idx_email_verifications_user` (`user_id`),
  ADD KEY `idx_email_verifications_code` (`code`);

--
-- Indizes für die Tabelle `encrypted_grade_vaults`
--
ALTER TABLE `encrypted_grade_vaults`
  ADD PRIMARY KEY (`user_id`);

--
-- Indizes für die Tabelle `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `hausaufgaben`
--
ALTER TABLE `hausaufgaben`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `password_resets`
--
ALTER TABLE `password_resets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_password_resets_user` (`user_id`),
  ADD KEY `idx_password_resets_email` (`email`),
  ADD KEY `idx_password_resets_code` (`code`);

--
-- Indizes für die Tabelle `pruefungen`
--
ALTER TABLE `pruefungen`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `reports`
--
ALTER TABLE `reports`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `school_holidays`
--
ALTER TABLE `school_holidays`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_school_holidays_range` (`start_date`,`end_date`,`type`);

--
-- Indizes für die Tabelle `special_days`
--
ALTER TABLE `special_days`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_special_days_range` (`scope`,`class_id`,`start_date`,`end_date`,`mode`);

--
-- Indizes für die Tabelle `special_day_lessons`
--
ALTER TABLE `special_day_lessons`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_special_day_lessons_day` (`special_day_id`,`class_id`,`sort_order`);

--
-- Indizes für die Tabelle `special_events`
--
ALTER TABLE `special_events`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `stundenplan_entries`
--
ALTER TABLE `stundenplan_entries`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_stundenplan_class_day` (`class_id`,`tag`,`start`);

--
-- Indizes für die Tabelle `timetable_exceptions`
--
ALTER TABLE `timetable_exceptions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_timetable_exceptions_lookup` (`class_id`,`start_date`,`end_date`,`date`,`type`),
  ADD KEY `idx_timetable_exceptions_date` (`date`);

--
-- Indizes für die Tabelle `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_users_email` (`email`),
  ADD KEY `idx_users_class_id` (`class_id`);

--
-- Indizes für die Tabelle `user_app_info`
--
ALTER TABLE `user_app_info`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `windows_username` (`windows_username`);

--
-- Indizes für die Tabelle `weekly_preview_cache`
--
ALTER TABLE `weekly_preview_cache`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_weekly_preview_lookup` (`user_id`,`class_id`,`locale`,`window_start`,`window_end`,`include_todos`,`expires_at`),
  ADD KEY `idx_weekly_preview_user_created` (`user_id`,`created_at`);

--
-- AUTO_INCREMENT für exportierte Tabellen
--

--
-- AUTO_INCREMENT für Tabelle `admin_audit_logs`
--
ALTER TABLE `admin_audit_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT für Tabelle `app_versions`
--
ALTER TABLE `app_versions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;
--
-- AUTO_INCREMENT für Tabelle `aufgaben`
--
ALTER TABLE `aufgaben`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=66;
--
-- AUTO_INCREMENT für Tabelle `classes`
--
ALTER TABLE `classes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;
--
-- AUTO_INCREMENT für Tabelle `class_schedules`
--
ALTER TABLE `class_schedules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;
--
-- AUTO_INCREMENT für Tabelle `eintraege`
--
ALTER TABLE `eintraege`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT für Tabelle `email_verifications`
--
ALTER TABLE `email_verifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;
--
-- AUTO_INCREMENT für Tabelle `events`
--
ALTER TABLE `events`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT für Tabelle `hausaufgaben`
--
ALTER TABLE `hausaufgaben`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=345;
--
-- AUTO_INCREMENT für Tabelle `password_resets`
--
ALTER TABLE `password_resets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;
--
-- AUTO_INCREMENT für Tabelle `pruefungen`
--
ALTER TABLE `pruefungen`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=83;
--
-- AUTO_INCREMENT für Tabelle `reports`
--
ALTER TABLE `reports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;
--
-- AUTO_INCREMENT für Tabelle `school_holidays`
--
ALTER TABLE `school_holidays`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT für Tabelle `special_days`
--
ALTER TABLE `special_days`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT für Tabelle `special_day_lessons`
--
ALTER TABLE `special_day_lessons`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT für Tabelle `special_events`
--
ALTER TABLE `special_events`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT für Tabelle `stundenplan_entries`
--
ALTER TABLE `stundenplan_entries`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=584;
--
-- AUTO_INCREMENT für Tabelle `timetable_exceptions`
--
ALTER TABLE `timetable_exceptions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT für Tabelle `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;
--
-- AUTO_INCREMENT für Tabelle `user_app_info`
--
ALTER TABLE `user_app_info`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;
--
-- AUTO_INCREMENT für Tabelle `weekly_preview_cache`
--
ALTER TABLE `weekly_preview_cache`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=56;
--
-- Constraints der exportierten Tabellen
--

--
-- Constraints der Tabelle `class_schedules`
--
ALTER TABLE `class_schedules`
  ADD CONSTRAINT `fk_class_schedules_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE;

--
-- Constraints der Tabelle `email_verifications`
--
ALTER TABLE `email_verifications`
  ADD CONSTRAINT `fk_email_verifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints der Tabelle `encrypted_grade_vaults`
--
ALTER TABLE `encrypted_grade_vaults`
  ADD CONSTRAINT `fk_encrypted_grade_vaults_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints der Tabelle `password_resets`
--
ALTER TABLE `password_resets`
  ADD CONSTRAINT `fk_password_resets_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints der Tabelle `stundenplan_entries`
--
ALTER TABLE `stundenplan_entries`
  ADD CONSTRAINT `fk_stundenplan_entries_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE;

--
-- Constraints der Tabelle `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE SET NULL;

--
-- Constraints der Tabelle `weekly_preview_cache`
--
ALTER TABLE `weekly_preview_cache`
  ADD CONSTRAINT `fk_weekly_preview_cache_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
