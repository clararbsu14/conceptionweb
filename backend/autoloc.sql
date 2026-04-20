-- ============================================================
-- AUTOLOC — Schéma de base de données MySQL
-- "Le confort notre atout"
-- ============================================================

CREATE DATABASE IF NOT EXISTS autoloc CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE autoloc;

-- ── Utilisateurs (admins / gérants) ──────────────────────────
CREATE TABLE IF NOT EXISTS utilisateurs (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  nom           VARCHAR(100) NOT NULL,
  prenom        VARCHAR(100) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  telephone     VARCHAR(20),
  role          ENUM('admin', 'gerant', 'client') NOT NULL DEFAULT 'client',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ── Véhicules ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vehicules (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  marque         VARCHAR(100) NOT NULL,
  modele         VARCHAR(100) NOT NULL,
  immatriculation VARCHAR(20) NOT NULL UNIQUE,
  annee          YEAR,
  type           ENUM('voiture', 'utilitaire') NOT NULL DEFAULT 'voiture',
  categorie      ENUM('voiture', 'electrique', 'premium', 'utilitaire') NOT NULL DEFAULT 'voiture',
  carburant      ENUM('Essence', 'Diesel', 'Électrique', 'Hybride') NOT NULL DEFAULT 'Essence',
  transmission   ENUM('Manuelle', 'Automatique') NOT NULL DEFAULT 'Manuelle',
  places         TINYINT UNSIGNED NOT NULL DEFAULT 5,
  prix_jour      DECIMAL(8,2) NOT NULL,
  emplacement    VARCHAR(20) COMMENT 'Ex: A1, B3 — place dans la concession',
  statut         ENUM('disponible', 'loue', 'maintenance', 'retard', 'reserve') NOT NULL DEFAULT 'disponible',
  image_url      TEXT,
  kilometrage    INT UNSIGNED DEFAULT 0,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_statut (statut),
  INDEX idx_type   (type),
  INDEX idx_categorie (categorie)
);

-- ── Réservations ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reservations (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  vehicule_id  INT NOT NULL,
  -- Informations client
  nom          VARCHAR(100) NOT NULL,
  prenom       VARCHAR(100) NOT NULL,
  email        VARCHAR(255) NOT NULL,
  telephone    VARCHAR(20) NOT NULL,
  -- Dates
  date_depart  DATE NOT NULL,
  heure_depart TIME NOT NULL DEFAULT '09:00:00',
  date_retour  DATE NOT NULL,
  heure_retour TIME NOT NULL DEFAULT '09:00:00',
  -- Détails
  options      JSON COMMENT 'Ex: ["gps","assurance_plus"]',
  commentaire  TEXT,
  montant_total DECIMAL(10,2) NOT NULL,
  statut       ENUM('confirme', 'en_cours', 'retard', 'termine', 'annule') NOT NULL DEFAULT 'confirme',
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicule_id) REFERENCES vehicules(id) ON DELETE RESTRICT,
  INDEX idx_email    (email),
  INDEX idx_statut   (statut),
  INDEX idx_dates    (date_depart, date_retour),
  INDEX idx_vehicule (vehicule_id)
);

-- ── Alertes ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS alertes (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  type       ENUM('retard', 'maintenance', 'reservation', 'systeme') NOT NULL DEFAULT 'systeme',
  message    TEXT NOT NULL,
  severity   ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'low',
  lu         TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_lu (lu)
);

-- ============================================================
-- Données initiales
-- ============================================================

-- Compte admin par défaut (mot de passe: Admin1234!)
-- Hash bcrypt généré avec 10 salt rounds
INSERT IGNORE INTO utilisateurs (nom, prenom, email, password_hash, telephone, role)
VALUES (
  'Dupont', 'Clara',
  'admin@autoloc.fr',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password
  '0123456789',
  'admin'
);

-- Véhicules exemple
INSERT IGNORE INTO vehicules (marque, modele, immatriculation, annee, type, categorie, carburant, transmission, places, prix_jour, emplacement, statut, kilometrage)
VALUES
  ('Renault', 'Clio',    'AB-123-CD', 2022, 'voiture',    'voiture',    'Essence',    'Manuelle',    5, 45.00, 'A1', 'disponible', 42300),
  ('Peugeot', '308',     'EF-456-GH', 2021, 'voiture',    'voiture',    'Diesel',     'Automatique', 5, 55.00, 'A2', 'disponible', 61200),
  ('Tesla',   'Model 3', 'IJ-789-KL', 2023, 'voiture',    'electrique', 'Électrique', 'Automatique', 5, 85.00, 'B1', 'disponible', 15600),
  ('BMW',     'Série 5', 'MN-012-OP', 2022, 'voiture',    'premium',    'Essence',    'Automatique', 5,120.00, 'B3', 'maintenance', 88900),
  ('Renault', 'Trafic',  'QR-345-ST', 2021, 'utilitaire', 'utilitaire', 'Diesel',     'Manuelle',    3, 70.00, 'C1', 'disponible', 63200),
  ('Citroën', 'C3',      'UV-678-WX', 2023, 'voiture',    'voiture',    'Essence',    'Manuelle',    5, 40.00, 'A3', 'disponible', 31500),
  ('Audi',    'A6',      'YZ-901-AB', 2023, 'voiture',    'premium',    'Diesel',     'Automatique', 5,110.00, 'B2', 'disponible', 22400),
  ('Mercedes','Vito',    'CD-234-EF', 2020, 'utilitaire', 'utilitaire', 'Diesel',     'Automatique', 6, 90.00, 'C2', 'disponible', 97300);
