-- ============================================================
-- AUTOLOC — Stripe payment fields
-- Run: mysql -u root -p autoloc < migrations/add-payment-fields.sql
-- ============================================================

USE autoloc;

-- Idempotent column adds (works on either bookings/reservations table name)
SET @tbl := IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES
                WHERE TABLE_SCHEMA = 'autoloc' AND TABLE_NAME = 'bookings') > 0,
               'bookings', 'reservations');

-- paiement_statut
SET @col_exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = 'autoloc' AND TABLE_NAME = @tbl AND COLUMN_NAME = 'paiement_statut'
);
SET @sql := IF(@col_exists = 0,
  CONCAT('ALTER TABLE ', @tbl, " ADD COLUMN paiement_statut ENUM('en_attente','paye','rembourse') NOT NULL DEFAULT 'en_attente'"),
  'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- stripe_payment_id
SET @col_exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = 'autoloc' AND TABLE_NAME = @tbl AND COLUMN_NAME = 'stripe_payment_id'
);
SET @sql := IF(@col_exists = 0,
  CONCAT('ALTER TABLE ', @tbl, ' ADD COLUMN stripe_payment_id VARCHAR(255) NULL'),
  'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- Allow 'en_attente' in the booking status enum (some schemas only have 'confirme'/'confirmee')
SET @col_type := (
  SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = 'autoloc' AND TABLE_NAME = @tbl AND COLUMN_NAME = 'statut'
);
SET @needs_update := IF(@col_type LIKE "%'en_attente'%", 0, 1);
SET @sql := IF(@needs_update = 1,
  CONCAT('ALTER TABLE ', @tbl,
         " MODIFY COLUMN statut ENUM('en_attente','confirme','confirmee','en_cours','retard','termine','terminee','annule','annulee') NOT NULL DEFAULT 'en_attente'"),
  'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- Verification
SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'autoloc'
  AND TABLE_NAME = @tbl
  AND COLUMN_NAME IN ('statut', 'paiement_statut', 'stripe_payment_id');
