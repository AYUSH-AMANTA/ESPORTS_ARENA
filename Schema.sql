c:-- Create Database
CREATE DATABASE IF NOT EXISTS esports;
USE esports;

-- Users Table
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL,
  role ENUM('admin', 'user') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tournaments Table
CREATE TABLE tournaments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  game VARCHAR(100),
  prize INT NOT NULL,
  entry_fee INT NOT NULL DEFAULT 0,
  date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Registrations Table
CREATE TABLE registrations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  tournament_id INT NOT NULL,
  payment_id VARCHAR(100),
  status ENUM('pending', 'success', 'failed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE
);

-- Payments Table
CREATE TABLE payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  amount INT NOT NULL,
  payment_method VARCHAR(50),
  payment_status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
  transaction_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert Sample Users
INSERT INTO users (name, email, password, role) VALUES 
('Admin User', 'admin@esports.com', 'admin123', 'admin'),
('John Doe', 'john@esports.com', 'user123', 'user'),
('Jane Smith', 'jane@esports.com', 'user456', 'user');

-- Insert Sample Tournaments
INSERT INTO tournaments (name, game, prize, entry_fee, date) VALUES 
('Valorant Championship', 'Valorant', 50000, 500, '2026-04-15'),
('CS2 Pro League', 'Counter-Strike 2', 75000, 1000, '2026-04-22'),
('Dota 2 Invitational', 'Dota 2', 100000, 2000, '2026-05-01');

-- Verify Tables Created
SHOW TABLES;
SELECT COUNT(*) as Total_Users FROM users;
SELECT COUNT(*) as Total_Tournaments FROM tournaments;