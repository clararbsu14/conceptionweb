-- ============================================================
-- AUTOLOC — Mise à jour des photos de véhicules
-- Run: mysql -u root -p autoloc < update-vehicle-photos.sql
-- ============================================================

USE autoloc;

-- Safety: add photo_url column if it doesn't exist (tolerates either schema)
SET @col_exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = 'autoloc' AND TABLE_NAME = 'vehicles' AND COLUMN_NAME = 'photo_url'
);
SET @sql := IF(@col_exists = 0, 'ALTER TABLE vehicles ADD COLUMN photo_url TEXT', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ── CITADINES ──────────────────────────────────────────────
UPDATE vehicles SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/2019_Renault_Clio_IV_facelift%2C_front_8.15.19.jpg/800px-2019_Renault_Clio_IV_facelift%2C_front_8.15.19.jpg'
  WHERE marque = 'Renault' AND modele = 'Clio';

UPDATE vehicles SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/2020_Renault_Zoe_ZE50_facelift_%28front%29.jpg/800px-2020_Renault_Zoe_ZE50_facelift_%28front%29.jpg'
  WHERE marque = 'Renault' AND modele = 'Zoe';

UPDATE vehicles SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/2020_Peugeot_208_GT_Line_1.2_Front.jpg/800px-2020_Peugeot_208_GT_Line_1.2_Front.jpg'
  WHERE marque = 'Peugeot' AND modele = '208';

UPDATE vehicles SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/VW_Polo_VI_2G_Comfortline_Reflex-Silber_Frontansicht.jpg/800px-VW_Polo_VI_2G_Comfortline_Reflex-Silber_Frontansicht.jpg'
  WHERE marque = 'Volkswagen' AND modele = 'Polo';

UPDATE vehicles SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/2020_Toyota_Yaris_GR_Sport_1.5_Front.jpg/800px-2020_Toyota_Yaris_GR_Sport_1.5_Front.jpg'
  WHERE marque = 'Toyota' AND modele = 'Yaris';

UPDATE vehicles SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Fiat_500_2015.jpg/800px-Fiat_500_2015.jpg'
  WHERE marque = 'Fiat' AND modele = '500';

UPDATE vehicles SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Opel_Corsa_F_IMG_3112.jpg/800px-Opel_Corsa_F_IMG_3112.jpg'
  WHERE marque = 'Opel' AND modele = 'Corsa';

UPDATE vehicles SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Honda_Jazz_GK_facelift_01_China_2018-04-25.jpg/800px-Honda_Jazz_GK_facelift_01_China_2018-04-25.jpg'
  WHERE marque = 'Honda' AND modele = 'Jazz';

UPDATE vehicles SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Dacia_Sandero_III_IMG_4036.jpg/800px-Dacia_Sandero_III_IMG_4036.jpg'
  WHERE marque = 'Dacia' AND modele = 'Sandero';

-- ── BERLINES ───────────────────────────────────────────────
UPDATE vehicles SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/2021_Volkswagen_Golf_Style_2.0_TDI_Front.jpg/800px-2021_Volkswagen_Golf_Style_2.0_TDI_Front.jpg'
  WHERE marque = 'Volkswagen' AND modele = 'Golf';

-- NOTE: typo fix — was /3/thirty/ which is not a valid Wikimedia path.
-- Using the canonical BMW 3 Series (G20) image.
UPDATE vehicles SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/2019_BMW_330i_M_Sport_Automatic_2.0.jpg/800px-2019_BMW_330i_M_Sport_Automatic_2.0.jpg'
  WHERE marque = 'BMW' AND modele = 'Série 3';

UPDATE vehicles SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Audi_A4_B9_IMG_0134.jpg/800px-Audi_A4_B9_IMG_0134.jpg'
  WHERE marque = 'Audi' AND modele = 'A4';

UPDATE vehicles SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/2022_Mercedes-Benz_C-Class_%28W206%29_C_200_sedan_%28Australia%29%2C_front_8.22.22.jpg/800px-2022_Mercedes-Benz_C-Class_%28W206%29_C_200_sedan_%28Australia%29%2C_front_8.22.22.jpg'
  WHERE marque = 'Mercedes' AND modele = 'Classe C';

UPDATE vehicles SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Peugeot_508_SW_I_facelift_IMG_0271.jpg/800px-Peugeot_508_SW_I_facelift_IMG_0271.jpg'
  WHERE marque = 'Peugeot' AND modele = '508';

UPDATE vehicles SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Skoda_Octavia_III_facelift_IMG_9375.jpg/800px-Skoda_Octavia_III_facelift_IMG_9375.jpg'
  WHERE marque = 'Skoda' AND modele = 'Octavia';

UPDATE vehicles SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/2019_Peugeot_308_SW_GT_Line_BlueHDi_130.jpg/800px-2019_Peugeot_308_SW_GT_Line_BlueHDi_130.jpg'
  WHERE marque = 'Peugeot' AND modele = '308';

UPDATE vehicles SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Renault_Talisman_IMG_0002.jpg/800px-Renault_Talisman_IMG_0002.jpg'
  WHERE marque = 'Renault' AND modele = 'Talisman';

-- ── SUV ────────────────────────────────────────────────────
UPDATE vehicles SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Toyota_RAV4_2019_%2848442836271%29.jpg/800px-Toyota_RAV4_2019_%2848442836271%29.jpg'
  WHERE marque = 'Toyota' AND modele = 'RAV4';

UPDATE vehicles SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/2017_Peugeot_3008_GT_Line_BlueHDi_130.jpg/800px-2017_Peugeot_3008_GT_Line_BlueHDi_130.jpg'
  WHERE marque = 'Peugeot' AND modele = '3008';

UPDATE vehicles SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/VW_Tiguan_II_Facelift_IMG_1485.jpg/800px-VW_Tiguan_II_Facelift_IMG_1485.jpg'
  WHERE marque = 'Volkswagen' AND modele = 'Tiguan';

UPDATE vehicles SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Dacia_Duster_II_IMG_2722.jpg/800px-Dacia_Duster_II_IMG_2722.jpg'
  WHERE marque = 'Dacia' AND modele = 'Duster';

UPDATE vehicles SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/2021_Nissan_Qashqai_Tekna_1.3_DiG-T_mild_hybrid_Front.jpg/800px-2021_Nissan_Qashqai_Tekna_1.3_DiG-T_mild_hybrid_Front.jpg'
  WHERE marque = 'Nissan' AND modele = 'Qashqai';

UPDATE vehicles SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/2020_Ford_Kuga_ST-Line_X_EcoBlue_190_Front.jpg/800px-2020_Ford_Kuga_ST-Line_X_EcoBlue_190_Front.jpg'
  WHERE marque = 'Ford' AND modele = 'Kuga';

UPDATE vehicles SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/2021_Jeep_Compass_Limited_4xe_Front.jpg/800px-2021_Jeep_Compass_Limited_4xe_Front.jpg'
  WHERE marque = 'Jeep' AND modele = 'Compass';

UPDATE vehicles SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/2022_Kia_Sportage_GT-Line_1.6_T-GDi_Front.jpg/800px-2022_Kia_Sportage_GT-Line_1.6_T-GDi_Front.jpg'
  WHERE marque = 'Kia' AND modele = 'Sportage';

UPDATE vehicles SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/2021_Hyundai_Tucson_NX4_Hybrid_Front.jpg/800px-2021_Hyundai_Tucson_NX4_Hybrid_Front.jpg'
  WHERE marque = 'Hyundai' AND modele = 'Tucson';

-- ── PREMIUM / LUXE ─────────────────────────────────────────
UPDATE vehicles SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/2020_BMW_X5_xDrive30d_M_Sport_Front.jpg/800px-2020_BMW_X5_xDrive30d_M_Sport_Front.jpg'
  WHERE marque = 'BMW' AND modele = 'X5';

UPDATE vehicles SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/2020_Mercedes-Benz_GLE_300d_4MATIC_Front.jpg/800px-2020_Mercedes-Benz_GLE_300d_4MATIC_Front.jpg'
  WHERE marque = 'Mercedes' AND modele = 'GLE';

UPDATE vehicles SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Audi_Q7_4M_Facelift_IMG_3844.jpg/800px-Audi_Q7_4M_Facelift_IMG_3844.jpg'
  WHERE marque = 'Audi' AND modele = 'Q7';

UPDATE vehicles SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Porsche_Cayenne_III_IMG_1445.jpg/800px-Porsche_Cayenne_III_IMG_1445.jpg'
  WHERE marque = 'Porsche' AND modele = 'Cayenne';

UPDATE vehicles SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/2021_Tesla_Model_3_SR%2B_in_Midnight_Silver%2C_front_8.21.jpg/800px-2021_Tesla_Model_3_SR%2B_in_Midnight_Silver%2C_front_8.21.jpg'
  WHERE marque = 'Tesla' AND modele = 'Model 3';

UPDATE vehicles SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/2021_Tesla_Model_Y_Long_Range_in_Pearl_White%2C_front_8.21.jpg/800px-2021_Tesla_Model_Y_Long_Range_in_Pearl_White%2C_front_8.21.jpg'
  WHERE marque = 'Tesla' AND modele = 'Model Y';

UPDATE vehicles SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Range_Rover_Evoque_2019_facelift.jpg/800px-Range_Rover_Evoque_2019_facelift.jpg'
  WHERE marque = 'Range Rover' AND modele = 'Evoque';

UPDATE vehicles SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Mercedes-Benz_A-Class_%28W177%29_IMG_3297.jpg/800px-Mercedes-Benz_A-Class_%28W177%29_IMG_3297.jpg'
  WHERE marque = 'Mercedes' AND modele = 'Classe A';

-- ── UTILITAIRES ────────────────────────────────────────────
UPDATE vehicles SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Renault_Master_III_Phase_II_front.jpg/800px-Renault_Master_III_Phase_II_front.jpg'
  WHERE marque = 'Renault' AND modele = 'Master';

UPDATE vehicles SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Ford_Transit_Custom_facelift_2023.jpg/800px-Ford_Transit_Custom_facelift_2023.jpg'
  WHERE marque = 'Ford' AND modele = 'Transit';

UPDATE vehicles SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Peugeot_Boxer_III_facelift_IMG_0903.jpg/800px-Peugeot_Boxer_III_facelift_IMG_0903.jpg'
  WHERE marque = 'Peugeot' AND modele = 'Boxer';

UPDATE vehicles SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Mercedes-Benz_Sprinter_III_IMG_0983.jpg/800px-Mercedes-Benz_Sprinter_III_IMG_0983.jpg'
  WHERE marque = 'Mercedes' AND modele = 'Sprinter';

UPDATE vehicles SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/VW_Crafter_II_IMG_3821.jpg/800px-VW_Crafter_II_IMG_3821.jpg'
  WHERE marque = 'Volkswagen' AND modele = 'Crafter';

UPDATE vehicles SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Citroen_Jumper_III_facelift_IMG_0012.jpg/800px-Citroen_Jumper_III_facelift_IMG_0012.jpg'
  WHERE marque = 'Citroën' AND modele = 'Jumper';

UPDATE vehicles SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Renault_Trafic_III_facelift_IMG_2341.jpg/800px-Renault_Trafic_III_facelift_IMG_2341.jpg'
  WHERE marque = 'Renault' AND modele = 'Trafic';

-- ── MONOSPACES ─────────────────────────────────────────────
UPDATE vehicles SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Renault_Scenic_IV_IMG_4412.jpg/800px-Renault_Scenic_IV_IMG_4412.jpg'
  WHERE marque = 'Renault' AND modele = 'Scenic';

UPDATE vehicles SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/VW_Touran_II_facelift_IMG_2219.jpg/800px-VW_Touran_II_facelift_IMG_2219.jpg'
  WHERE marque = 'Volkswagen' AND modele = 'Touran';

UPDATE vehicles SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Peugeot_5008_II_facelift_IMG_3341.jpg/800px-Peugeot_5008_II_facelift_IMG_3341.jpg'
  WHERE marque = 'Peugeot' AND modele = '5008';

UPDATE vehicles SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Citroen_C4_Picasso_II_facelift_IMG_0023.jpg/800px-Citroen_C4_Picasso_II_facelift_IMG_0023.jpg'
  WHERE marque = 'Citroën' AND modele = 'C4 Picasso';

UPDATE vehicles SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Ford_Galaxy_III_facelift_IMG_3312.jpg/800px-Ford_Galaxy_III_facelift_IMG_3312.jpg'
  WHERE marque = 'Ford' AND modele = 'Galaxy';

-- ── Verification ───────────────────────────────────────────
SELECT id, marque, modele,
       CASE WHEN photo_url IS NULL THEN '⚠️ MISSING' ELSE '✓' END AS has_photo,
       SUBSTRING(photo_url, 1, 80) AS photo_preview
FROM vehicles
ORDER BY id;
