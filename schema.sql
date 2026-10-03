CREATE DATABASE IF NOT EXISTS `app_db`;
USE `app_db`;

-- 1. Admin / Users Table
DROP TABLE IF EXISTS `admin_users`;
CREATE TABLE `admin_users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `full_name` VARCHAR(100) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Employees Table
DROP TABLE IF EXISTS `employees`;
CREATE TABLE `employees` (
    `employee_id` VARCHAR(20) PRIMARY KEY,
    `first_name` VARCHAR(50) NOT NULL,
    `last_name` VARCHAR(50) NOT NULL,
    `gender` VARCHAR(10) NOT NULL,
    `dob` DATE NOT NULL,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `phone` VARCHAR(20) NOT NULL,
    `department` VARCHAR(50) NOT NULL,
    `designation` VARCHAR(50) NOT NULL,
    `joining_date` DATE NOT NULL,
    `basic_salary` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `bank_account` VARCHAR(50) NOT NULL,
    `pan_number` VARCHAR(20) NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'Active',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Salaries Table
DROP TABLE IF EXISTS `salaries`;
CREATE TABLE `salaries` (
    `salary_id` INT AUTO_INCREMENT PRIMARY KEY,
    `employee_id` VARCHAR(20) NOT NULL,
    `salary_month` VARCHAR(20) NOT NULL,
    `salary_year` INT NOT NULL,
    `basic_salary` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `hra` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `da` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `allowances` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `bonus` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `pf` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `professional_tax` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `other_deductions` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `gross_salary` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `total_deductions` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `net_salary` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `processed_date` DATE NOT NULL,
    CONSTRAINT `fk_salaries_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE,
    UNIQUE KEY `uk_employee_period` (`employee_id`, `salary_month`, `salary_year`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Payslips Table
DROP TABLE IF EXISTS `payslips`;
CREATE TABLE `payslips` (
    `payslip_id` INT AUTO_INCREMENT PRIMARY KEY,
    `employee_id` VARCHAR(20) NOT NULL,
    `salary_id` INT NOT NULL,
    `generated_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `status` VARCHAR(20) NOT NULL DEFAULT 'Generated',
    CONSTRAINT `fk_payslips_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE,
    CONSTRAINT `fk_payslips_salary` FOREIGN KEY (`salary_id`) REFERENCES `salaries` (`salary_id`) ON DELETE CASCADE,
    UNIQUE KEY `uk_employee_salary` (`employee_id`, `salary_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================================
-- Seed Initial Data
-- ========================================================

-- Initial Admin Account (admin / admin123)
INSERT INTO `admin_users` (`username`, `password`, `full_name`) VALUES 
('admin', 'admin123', 'System Administrator');

-- Initial Employees
INSERT INTO `employees` (`employee_id`, `first_name`, `last_name`, `gender`, `dob`, `email`, `phone`, `department`, `designation`, `joining_date`, `basic_salary`, `bank_account`, `pan_number`, `status`) VALUES
('EMP001', 'Rahul', 'Sharma', 'Male', '1992-05-14', 'rahul.sharma@example.com', '9876543210', 'IT', 'Senior Software Developer', '2021-06-15', 75000.00, 'HDFC000123456789', 'ABCPS1234F', 'Active'),
('EMP002', 'Priya', 'Patel', 'Female', '1995-08-22', 'priya.patel@example.com', '9876543211', 'HR', 'HR Manager', '2022-01-10', 62000.00, 'SBIN000987654321', 'BPYPP5678G', 'Active'),
('EMP003', 'Amit', 'Verma', 'Male', '1990-11-03', 'amit.verma@example.com', '9876543212', 'Finance', 'Senior Financial Analyst', '2020-09-01', 68000.00, 'ICIC000456789123', 'CAAVV9012K', 'Active'),
('EMP004', 'Sneha', 'Kulkarni', 'Female', '1994-03-18', 'sneha.k@example.com', '9876543213', 'Marketing', 'Digital Marketing Lead', '2022-04-12', 55000.00, 'AXIS000789123456', 'DESPK3456M', 'Active'),
('EMP005', 'Vikram', 'Singh', 'Male', '1989-12-25', 'vikram.singh@example.com', '9876543214', 'Operations', 'Operations Manager', '2019-11-20', 58000.00, 'KKBK000321654987', 'EFGVS7890N', 'Active'),
('EMP006', 'Ananya', 'Roy', 'Female', '1997-07-09', 'ananya.roy@example.com', '9876543215', 'IT', 'Frontend Engineer', '2023-02-15', 48000.00, 'HDFC000654987321', 'FGHAR2345P', 'Active'),
('EMP007', 'Rajesh', 'Gupta', 'Male', '1991-04-30', 'rajesh.gupta@example.com', '9876543216', 'Finance', 'Accounts Executive', '2021-08-05', 42000.00, 'PNBB000147258369', 'GHIRE6789Q', 'Active'),
('EMP008', 'Pooja', 'Nair', 'Female', '1996-09-14', 'pooja.nair@example.com', '9876543217', 'HR', 'Talent Acquisition Specialist', '2023-05-01', 40000.00, 'SBIN000369258147', 'HIJPN0123R', 'Active'),
('EMP009', 'Karthik', 'Iyer', 'Male', '1993-01-19', 'karthik.iyer@example.com', '9876543218', 'IT', 'DevOps Engineer', '2022-07-18', 70000.00, 'ICIC000852963741', 'IJKKI4567S', 'Active'),
('EMP010', 'Divya', 'Joshi', 'Female', '1998-10-05', 'divya.joshi@example.com', '9876543219', 'Marketing', 'Content Strategist', '2023-10-10', 38000.00, 'BARB000963852741', 'JKLDJ8901T', 'Inactive');

-- Initial Salaries (September 2026)
INSERT INTO `salaries` (`salary_id`, `employee_id`, `salary_month`, `salary_year`, `basic_salary`, `hra`, `da`, `allowances`, `bonus`, `pf`, `professional_tax`, `other_deductions`, `gross_salary`, `total_deductions`, `net_salary`, `processed_date`) VALUES
(1, 'EMP001', 'September', 2026, 75000.00, 30000.00, 7500.00, 5000.00, 5000.00, 9000.00, 200.00, 1000.00, 122500.00, 10200.00, 112300.00, '2026-09-20'),
(2, 'EMP002', 'September', 2026, 62000.00, 24800.00, 6200.00, 4000.00, 3000.00, 7440.00, 200.00, 500.00, 100000.00, 8140.00, 91860.00, '2026-09-20'),
(3, 'EMP003', 'September', 2026, 68000.00, 27200.00, 6800.00, 4500.00, 4000.00, 8160.00, 200.00, 800.00, 110500.00, 9160.00, 101340.00, '2026-09-20'),
(4, 'EMP004', 'September', 2026, 55000.00, 22000.00, 5500.00, 3500.00, 2000.00, 6600.00, 200.00, 500.00, 88000.00, 7300.00, 80700.00, '2026-09-20'),
(5, 'EMP005', 'September', 2026, 58000.00, 23200.00, 5800.00, 3800.00, 2500.00, 6960.00, 200.00, 600.00, 93300.00, 7760.00, 85540.00, '2026-09-20'),
(6, 'EMP006', 'September', 2026, 48000.00, 19200.00, 4800.00, 3000.00, 2000.00, 5760.00, 200.00, 400.00, 77000.00, 6360.00, 70640.00, '2026-09-20'),
(7, 'EMP007', 'September', 2026, 42000.00, 16800.00, 4200.00, 2800.00, 1500.00, 5040.00, 200.00, 300.00, 67300.00, 5540.00, 61760.00, '2026-09-20'),
(8, 'EMP008', 'September', 2026, 40000.00, 16000.00, 4000.00, 2500.00, 1500.00, 4800.00, 200.00, 300.00, 64000.00, 5300.00, 58700.00, '2026-09-20'),
(9, 'EMP009', 'September', 2026, 70000.00, 28000.00, 7000.00, 4800.00, 4500.00, 8400.00, 200.00, 900.00, 114300.00, 9500.00, 104800.00, '2026-09-20');

-- Initial Payslips
INSERT INTO `payslips` (`payslip_id`, `employee_id`, `salary_id`, `generated_date`, `status`) VALUES
(1, 'EMP001', 1, '2026-09-21 10:30:00', 'Generated'),
(2, 'EMP002', 2, '2026-09-21 10:35:00', 'Generated'),
(3, 'EMP003', 3, '2026-09-21 10:40:00', 'Generated'),
(4, 'EMP004', 4, '2026-09-21 10:45:00', 'Generated'),
(5, 'EMP005', 5, '2026-09-21 10:50:00', 'Generated'),
(6, 'EMP006', 6, '2026-09-21 10:55:00', 'Generated'),
(7, 'EMP007', 7, '2026-09-21 11:00:00', 'Generated'),
(8, 'EMP008', 8, '2026-09-21 11:05:00', 'Generated'),
(9, 'EMP009', 9, '2026-09-21 11:10:00', 'Generated');
