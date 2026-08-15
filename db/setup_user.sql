-- Creates the supercarrental database and the application user used by the
-- backend (see backend/.env.example). Run once, as the MySQL/MariaDB root
-- user:
--
--   mysql -u root -p < db/setup_user.sql
--
-- This is a development-only setup: the password below is intentionally a
-- plain, shared dev credential (not a production secret) so anyone cloning
-- the repo can get a working local database without asking anyone for
-- credentials.

CREATE DATABASE IF NOT EXISTS supercarrental
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'supercarrental_app'@'localhost' IDENTIFIED BY 'supercarrental_dev_pw';
GRANT SELECT, INSERT, UPDATE, DELETE ON supercarrental.* TO 'supercarrental_app'@'localhost';
FLUSH PRIVILEGES;
