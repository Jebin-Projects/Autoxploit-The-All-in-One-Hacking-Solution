-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 09, 2025 at 07:03 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `autoxploit`
--

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`) VALUES
(3, 'Android Exploits'),
(4, 'Computer Exploits'),
(2, 'Network Scanning'),
(1, 'Website Exploits');

-- --------------------------------------------------------

--
-- Table structure for table `scans`
--

CREATE TABLE `scans` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `scan_name` varchar(100) NOT NULL,
  `category` varchar(50) NOT NULL,
  `target_url` varchar(255) NOT NULL,
  `is_vulnerable` tinyint(1) DEFAULT 0,
  `scan_results` text DEFAULT NULL,
  `scanned_at` datetime DEFAULT current_timestamp(),
  `category_id` int(11) NOT NULL,
  `tool_used` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `scans`
--

INSERT INTO `scans` (`id`, `user_id`, `scan_name`, `category`, `target_url`, `is_vulnerable`, `scan_results`, `scanned_at`, `category_id`, `tool_used`) VALUES
(19, 1, 'CSRF Scan', 'Website Exploits', 'http://192.168.75.129/dvwa/vulnerabilities/csrf/', 1, '{\"totalVulnerabilities\":1,\"techniques\":[],\"isVulnerable\":true}', '2025-02-20 11:20:42', 1, 'CSRF'),
(20, 3, 'XSS Scan', 'Website Exploits', 'http://192.168.75.129/dvwa/vulnerabilities/xss_r/', 1, '{\"totalVulnerabilities\":20,\"techniques\":[\"Script Injection\",\"Event Handlers\",\"Data Exfiltration\",\"Eval Function\"],\"isVulnerable\":true}', '2025-02-20 11:21:24', 1, 'XSS'),
(21, 3, 'SQL Injection Scan', 'Website Exploits', 'http://192.168.75.129/dvwa/vulnerabilities/sqli/', 1, '{\"totalVulnerabilities\":31,\"techniques\":[\"Script Injection\"],\"isVulnerable\":true}', '2025-02-20 11:44:44', 1, 'SQLi'),
(22, 3, 'SQL Injection Scan', 'Website Exploits', 'http://192.168.75.129/dvwa/vulnerabilities/sqli/', 1, '{\"totalVulnerabilities\":31,\"techniques\":[\"Script Injection\"],\"isVulnerable\":true}', '2025-02-20 11:46:29', 1, 'SQLi'),
(23, 3, 'SQL Injection Scan', 'Website Exploits', 'http://192.168.75.129/dvwa/vulnerabilities/sqli/', 1, '{\"totalVulnerabilities\":31,\"techniques\":[\"Script Injection\"],\"isVulnerable\":true}', '2025-02-20 11:48:18', 1, 'SQLi'),
(24, 3, 'XSS Scan', 'Website Exploits', 'http://192.168.75.129/dvwa/vulnerabilities/xss_r/', 1, '{\"totalVulnerabilities\":20,\"techniques\":[\"Script Injection\",\"Event Handlers\",\"Data Exfiltration\",\"Eval Function\"],\"isVulnerable\":true}', '2025-03-01 11:21:43', 1, 'XSS'),
(25, 3, 'XSS Scan', 'Website Exploits', 'http://192.168.75.129/dvwa/vulnerabilities/xss_r/', 1, '{\"totalVulnerabilities\":20,\"techniques\":[\"Script Injection\",\"Event Handlers\",\"Data Exfiltration\",\"Eval Function\"],\"isVulnerable\":true}', '2025-03-01 11:27:29', 1, 'XSS'),
(26, 3, 'XSS Scan', 'Website Exploits', 'http://192.168.75.129/dvwa/vulnerabilities/xss_r/', 1, '{\"totalVulnerabilities\":20,\"techniques\":[\"Script Injection\",\"Event Handlers\",\"Data Exfiltration\",\"Eval Function\"],\"isVulnerable\":true}', '2025-03-07 19:46:53', 1, 'XSS'),
(27, 3, 'CSRF Scan', 'Website Exploits', 'http://192.168.75.129/dvwa/vulnerabilities/csrf/', 1, '{\"totalVulnerabilities\":1,\"techniques\":[],\"isVulnerable\":true}', '2025-04-05 15:26:21', 1, 'CSRF'),
(31, 3, 'File Upload Vulnerability Scan', '', 'http://192.168.75.129/dvwa/vulnerabilities/upload/', 1, '[{\"status\":\"vulnerable\",\"file_name\":\"test.php\",\"reason\":\"Uploaded file is accessible and may be executed\"},{\"status\":\"vulnerable\",\"file_name\":\"test.exe\",\"reason\":\"Uploaded file is accessible and may be executed\"},{\"status\":\"vulnerable\",\"file_name\":\"test.jpg\",\"reason\":\"Uploaded file is accessible and may be executed\"}]', '2025-04-05 15:37:03', 1, 'Custom File Upload Scanner'),
(32, 3, 'SQL Injection Scan', 'Android Exploits', 'http://192.168.75.129/dvwa/vulnerabilities/sqli/', 1, '{\"totalVulnerabilities\":31,\"techniques\":[\"Script Injection\"],\"isVulnerable\":true}', '2025-04-05 15:58:04', 1, 'SQLi'),
(33, 3, 'SQL Injection Scan', 'SQL Injection', 'http://192.168.75.129/dvwa/vulnerabilities/sqli/', 1, '{\"totalVulnerabilities\":31,\"techniques\":[\"Script Injection\"],\"isVulnerable\":true}', '2025-04-05 16:03:53', 1, 'SQLi'),
(34, 3, 'XSS Scan', 'Website Exploits', 'http://192.168.75.129/dvwa/vulnerabilities/xss_r/', 1, '{\"totalVulnerabilities\":20,\"techniques\":[\"Script Injection\",\"Event Handlers\",\"Data Exfiltration\",\"Eval Function\"],\"isVulnerable\":true}', '2025-04-05 16:09:21', 1, 'XSS'),
(35, 3, 'File Upload Vulnerability Scan', '', 'http://192.168.75.129/dvwa/vulnerabilities/upload/', 1, '[{\"status\":\"vulnerable\",\"file_name\":\"test.php\",\"reason\":\"Uploaded file is accessible and may be executed\"},{\"status\":\"vulnerable\",\"file_name\":\"test.exe\",\"reason\":\"Uploaded file is accessible and may be executed\"},{\"status\":\"vulnerable\",\"file_name\":\"test.jpg\",\"reason\":\"Uploaded file is accessible and may be executed\"}]', '2025-04-05 16:11:52', 1, 'Custom File Upload Scanner'),
(36, 3, 'File Upload Vulnerability Scan', '', 'http://192.168.75.129/dvwa/vulnerabilities/', 0, '[{\"status\":\"error\",\"file_name\":\"test.php\",\"reason\":\"File upload failed. Backend rejected the file.\"},{\"status\":\"error\",\"file_name\":\"test.exe\",\"reason\":\"File upload failed. Backend rejected the file.\"},{\"status\":\"error\",\"file_name\":\"test.jpg\",\"reason\":\"File upload failed. Backend rejected the file.\"}]', '2025-04-05 16:12:01', 1, 'Custom File Upload Scanner'),
(37, 3, 'File Upload Vulnerability Scan', '', 'http://192.168.75.129/dvwa/vulnerabilities/', 0, '[{\"status\":\"error\",\"file_name\":\"test.php\",\"reason\":\"File upload failed. Backend rejected the file.\"},{\"status\":\"error\",\"file_name\":\"test.exe\",\"reason\":\"File upload failed. Backend rejected the file.\"},{\"status\":\"error\",\"file_name\":\"test.jpg\",\"reason\":\"File upload failed. Backend rejected the file.\"}]', '2025-04-05 16:12:39', 1, 'Custom File Upload Scanner'),
(38, 3, 'SQL Injection Scan', 'SQL Injection', 'http://192.168.75.129/dvwa/vulnerabilities/sqli/', 0, '{\"totalVulnerabilities\":0,\"techniques\":[],\"isVulnerable\":false}', '2025-04-05 17:24:52', 1, 'SQLi'),
(39, 3, 'SQL Injection Scan', 'SQL Injection', 'http://192.168.75.129/dvwa/vulnerabilities/sqli/', 0, '{\"totalVulnerabilities\":0,\"techniques\":[],\"isVulnerable\":false}', '2025-04-05 17:26:34', 1, 'SQLi'),
(40, 3, 'SQL Injection Scan', 'SQL Injection', 'http://192.168.75.129/dvwa/vulnerabilities/sqli/', 0, '{\"totalVulnerabilities\":0,\"techniques\":[],\"isVulnerable\":false}', '2025-04-05 17:29:07', 1, 'SQLi'),
(41, 3, 'SQL Injection Scan', 'SQL Injection', 'http://192.168.75.129/dvwa/vulnerabilities/sqli/', 1, '{\"totalVulnerabilities\":1,\"techniques\":[],\"isVulnerable\":true}', '2025-04-05 17:30:46', 1, 'SQLi'),
(42, 3, 'XSS Scan', 'Website Exploits', 'http://192.168.75.129/dvwa/vulnerabilities/xss_r/', 1, '{\"totalVulnerabilities\":20,\"techniques\":[\"Script Injection\",\"Event Handlers\",\"Data Exfiltration\",\"Eval Function\"],\"isVulnerable\":true}', '2025-04-05 17:35:16', 1, 'XSS'),
(43, 3, 'CSRF Scan', 'Website Exploits', 'http://192.168.75.129/dvwa/vulnerabilities/csrf/', 1, '{\"totalVulnerabilities\":1,\"techniques\":[],\"isVulnerable\":true}', '2025-04-05 17:36:01', 1, 'CSRF'),
(44, 3, 'SQL Injection Scan', 'SQL Injection', 'http://192.168.75.129/dvwa/vulnerabilities/sqli/', 1, '{\"totalVulnerabilities\":1,\"techniques\":[],\"isVulnerable\":true}', '2025-04-07 07:29:19', 1, 'SQLi'),
(45, 3, 'SQL Injection Scan', 'SQL Injection', 'http://192.168.75.129/dvwa/vulnerabilities/sqli/', 1, '{\"totalVulnerabilities\":1,\"techniques\":[],\"isVulnerable\":true}', '2025-04-07 11:25:38', 1, 'SQLi'),
(46, 3, 'XSS Scan', 'Website Exploits', 'http://192.168.75.129/dvwa/vulnerabilities/xss_r/', 1, '{\"totalVulnerabilities\":20,\"techniques\":[\"Script Injection\",\"Event Handlers\",\"Data Exfiltration\",\"Eval Function\"],\"isVulnerable\":true}', '2025-04-07 11:26:10', 1, 'XSS'),
(47, 3, 'CSRF Scan', 'Website Exploits', 'http://192.168.75.129/dvwa/vulnerabilities/csrf/', 1, '{\"totalVulnerabilities\":1,\"techniques\":[],\"isVulnerable\":true}', '2025-04-07 11:26:34', 1, 'CSRF'),
(48, 3, 'File Upload Vulnerability Scan', '', 'http://192.168.75.129/dvwa/vulnerabilities/upload/', 0, '[{\"status\":\"error\",\"file_name\":\"test.php\",\"reason\":\"Failed to check file access. Response: No response\"},{\"status\":\"error\",\"file_name\":\"test.exe\",\"reason\":\"Failed to check file access. Response: No response\"},{\"status\":\"error\",\"file_name\":\"test.jpg\",\"reason\":\"Failed to check file access. Response: No response\"}]', '2025-04-07 11:28:05', 1, 'Custom File Upload Scanner'),
(49, 3, 'SQL Injection Scan', 'SQL Injection', 'http://192.168.75.129/dvwa/vulnerabilities/sqli/', 1, '{\"totalVulnerabilities\":1,\"techniques\":[],\"isVulnerable\":true}', '2025-04-13 00:38:22', 1, 'SQLi'),
(50, 3, 'XSS Scan', 'Website Exploits', 'http://192.168.75.129/dvwa/vulnerabilities/xss_r/', 1, '{\"totalVulnerabilities\":20,\"techniques\":[\"Script Injection\",\"Event Handlers\",\"Data Exfiltration\",\"Eval Function\"],\"isVulnerable\":true}', '2025-04-13 00:41:11', 1, 'XSS');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `created_at`, `updated_at`) VALUES
(1, 'john_doe', 'john@example.com', 'password123', '2025-02-19 02:40:41', '2025-02-19 02:40:41'),
(2, 'jane_smith', 'jane@example.com', 'securepass', '2025-02-19 02:40:41', '2025-02-19 02:40:41'),
(3, 'jebin', 'antojebin002@gmail.com', 'jebin@123', '2025-02-19 03:01:49', '2025-02-19 03:01:49'),
(4, 'tester', 'nanto23bca@student.mes.ac.in', 'test@123', '2025-04-05 14:29:38', '2025-04-05 14:29:38'),
(5, 'tehshs', 'antojebin001@gmail.com', 'jebin@123', '2025-04-05 14:33:53', '2025-04-05 14:33:53'),
(7, 'aaa', 'nanto23bca@studenta.mes.ac.in', 'jebin@123', '2025-04-05 16:51:04', '2025-04-05 16:51:04'),
(8, 'Maheshen', '7678093448@gmail.com', 'test@123', '2025-04-07 07:26:07', '2025-04-07 07:26:07'),
(9, 'tester1', 'testcollege@gmail.com', 'test@123', '2025-04-07 11:24:57', '2025-04-07 11:24:57');

-- --------------------------------------------------------

--
-- Table structure for table `vulnerabilities`
--

CREATE TABLE `vulnerabilities` (
  `id` int(11) NOT NULL,
  `scan_id` int(11) NOT NULL,
  `vulnerability_name` varchar(100) NOT NULL,
  `severity` enum('Low','Medium','High','Critical') NOT NULL,
  `description` text DEFAULT NULL,
  `remediation` text DEFAULT NULL,
  `detected_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `scans`
--
ALTER TABLE `scans`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `vulnerabilities`
--
ALTER TABLE `vulnerabilities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `scan_id` (`scan_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `scans`
--
ALTER TABLE `scans`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `vulnerabilities`
--
ALTER TABLE `vulnerabilities`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `scans`
--
ALTER TABLE `scans`
  ADD CONSTRAINT `scans_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `scans_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `vulnerabilities`
--
ALTER TABLE `vulnerabilities`
  ADD CONSTRAINT `vulnerabilities_ibfk_1` FOREIGN KEY (`scan_id`) REFERENCES `scans` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
