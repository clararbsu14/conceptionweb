-- ============================================================
-- AUTOLOC — Vehicle inspection + sinistre tables
-- Run: mysql -u root -p autoloc < migrations/add-inspections.sql
-- ============================================================

USE autoloc;

CREATE TABLE IF NOT EXISTS vehicle_inspections (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  booking_id        INT NOT NULL,
  type              ENUM('depart','retour') NOT NULL,
  photos            JSON,
  etat_general      ENUM('excellent','bon','moyen','mauvais') DEFAULT 'bon',
  kilometrage       INT,
  niveau_carburant  ENUM('vide','quart','moitie','trois-quarts','plein'),
  commentaires      TEXT,
  signature_agent   TEXT,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  INDEX idx_booking (booking_id),
  INDEX idx_type    (type)
);

CREATE TABLE IF NOT EXISTS sinistres (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  booking_id      INT NOT NULL,
  vehicle_id      INT NOT NULL,
  type            ENUM('rayure','bosse','bris_glace','autre') NOT NULL,
  description     TEXT,
  photo_avant     VARCHAR(500),
  photo_apres     VARCHAR(500),
  localisation    VARCHAR(255),
  montant_estime  DECIMAL(10,2),
  statut          ENUM('declare','en_cours','resolu','classe') DEFAULT 'declare',
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
  INDEX idx_statut  (statut),
  INDEX idx_booking (booking_id),
  INDEX idx_vehicle (vehicle_id)
);

SELECT TABLE_NAME, TABLE_ROWS
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'autoloc'
  AND TABLE_NAME IN ('vehicle_inspections', 'sinistres');
