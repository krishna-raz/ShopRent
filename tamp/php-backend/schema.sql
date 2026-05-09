-- Shop Rental Management System - MySQL Schema

CREATE DATABASE IF NOT EXISTS shop_rental;
USE shop_rental;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'superadmin') DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Shops Table
CREATE TABLE IF NOT EXISTS shops (
    id INT PRIMARY KEY AUTO_INCREMENT,
    shop_number VARCHAR(50) UNIQUE NOT NULL,
    shop_name VARCHAR(255),
    floor VARCHAR(50) NOT NULL,
    monthly_rent DECIMAL(10, 2) NOT NULL,
    occupancy_status ENUM('Vacant', 'Occupied') DEFAULT 'Vacant',
    tenant_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tenants Table
CREATE TABLE IF NOT EXISTS tenants (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tenant_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    aadhaar VARCHAR(20),
    address TEXT,
    shop_id INT NOT NULL,
    shop_number VARCHAR(50),
    rent_amount DECIMAL(10, 2) NOT NULL,
    joining_date DATE NOT NULL,
    security_deposit DECIMAL(10, 2) NOT NULL,
    deposit_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deposit_status ENUM('Active', 'Refunded', 'Partial Refund', 'Deducted') DEFAULT 'Active',
    refundable_amount DECIMAL(10, 2) NOT NULL,
    refund_date TIMESTAMP NULL,
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (shop_id) REFERENCES shops(id)
);

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tenant_id INT NOT NULL,
    tenant_name VARCHAR(255) NOT NULL,
    shop_number VARCHAR(50) NOT NULL,
    month VARCHAR(7) NOT NULL,
    rent_amount DECIMAL(10, 2) NOT NULL,
    paid_amount DECIMAL(10, 2) NOT NULL,
    due_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('Paid', 'Partial', 'Pending') NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_mode VARCHAR(50) DEFAULT 'Cash',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    UNIQUE KEY unique_tenant_month (tenant_id, month)
);

-- Payment Transactions Table (Granular History)
CREATE TABLE IF NOT EXISTS payment_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    payment_id INT,
    tenant_id INT NOT NULL,
    tenant_name VARCHAR(255) NOT NULL,
    shop_number VARCHAR(50) NOT NULL,
    month VARCHAR(7) NOT NULL,
    rent_amount DECIMAL(10, 2) NOT NULL,
    transaction_amount DECIMAL(10, 2) NOT NULL,
    paid_amount DECIMAL(10, 2) NOT NULL,
    remaining_due DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL,
    payment_mode VARCHAR(50) DEFAULT 'Cash',
    notes TEXT,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- Deposit Transactions Table
CREATE TABLE IF NOT EXISTS deposit_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tenant_id INT NOT NULL,
    tenant_name VARCHAR(255) NOT NULL,
    shop_number VARCHAR(50),
    type ENUM('Collection', 'Refund', 'Deduction') NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    reason TEXT,
    balance_before DECIMAL(10, 2) DEFAULT 0,
    balance_after DECIMAL(10, 2) DEFAULT 0,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    action VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    entity_type ENUM('Tenant', 'Shop', 'Payment', 'Deposit', 'Auth') NOT NULL,
    entity_id INT,
    performed_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default superadmin
INSERT INTO users (name, email, password, role) VALUES
('Super Admin', 'admin@shoprent.com', '$2y$10$8K1p/a0dL1LXMIgoEDFrwOfMQbELqAD8g6GIrUaW1m8l0vED/7AXu', 'superadmin');
-- Default password: admin123
