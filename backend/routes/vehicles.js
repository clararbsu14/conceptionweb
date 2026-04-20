const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

const VEHICLE_SELECT = `
  SELECT *, nb_places AS places, photo_url AS image_url
  FROM vehicles
`;

// GET /api/vehicles — liste des véhicules (public, avec filtres)
router.get('/', async (req, res) => {
  try {
    const { type, categorie, carburant, transmission, prix_max, places, statut, admin } = req.query;
    let sql = VEHICLE_SELECT + ' WHERE 1=1';
    const params = [];

    if (!admin) {
      sql += " AND statut != 'en_maintenance'";
    }
    // type frontend: "voiture" = tout sauf utilitaire, "utilitaire" = utilitaire
    if (type === 'voiture')       { sql += " AND type != 'utilitaire'"; }
    else if (type === 'utilitaire') { sql += " AND type = 'utilitaire'"; }
    else if (type)                { sql += ' AND type = ?'; params.push(type); }

    if (categorie)    { sql += ' AND categorie = ?';    params.push(categorie); }
    if (carburant)    { sql += ' AND carburant = ?';    params.push(carburant); }
    if (transmission) { sql += ' AND transmission = ?'; params.push(transmission); }
    if (prix_max)     { sql += ' AND prix_jour <= ?';   params.push(Number(prix_max)); }
    if (places)       { sql += ' AND nb_places >= ?';   params.push(Number(places)); }
    if (statut)       { sql += ' AND statut = ?';       params.push(statut); }

    sql += ' ORDER BY prix_jour ASC';

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('GET /api/vehicles error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/vehicles/:id — détail d'un véhicule
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(VEHICLE_SELECT + ' WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Véhicule introuvable' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/vehicles/:id/similar — trouver un véhicule similaire disponible
router.get('/:id/similar', async (req, res) => {
  try {
    const [original] = await db.query(VEHICLE_SELECT + ' WHERE id = ?', [req.params.id]);
    if (!original.length) return res.status(404).json({ message: 'Véhicule introuvable' });
    const v = original[0];

    const [similar] = await db.query(
      VEHICLE_SELECT + `
       WHERE statut = 'disponible' AND id != ? AND categorie = ?
       AND ABS(prix_jour - ?) <= 20
       ORDER BY ABS(prix_jour - ?) ASC
       LIMIT 3`,
      [v.id, v.categorie, v.prix_jour, v.prix_jour]
    );
    res.json(similar);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/vehicles — créer un véhicule (admin)
router.post('/', auth(['admin', 'gerant']), async (req, res) => {
  try {
    const { marque, modele, immatriculation, annee, categorie, type, carburant,
            transmission, places, prix_jour, statut, image_url, kilometrage } = req.body;

    if (!marque || !modele || !immatriculation || !prix_jour) {
      return res.status(400).json({ message: 'Champs obligatoires manquants' });
    }

    const [result] = await db.query(
      `INSERT INTO vehicles
       (marque, modele, immatriculation, annee, categorie, type, carburant,
        transmission, nb_places, prix_jour, statut, photo_url, kilometrage)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [marque, modele, immatriculation, annee || null, categorie || 'voiture',
       type || 'citadine', carburant || 'Essence', transmission || 'Manuelle',
       places || 5, prix_jour, statut || 'disponible', image_url || null, kilometrage || 0]
    );

    const [newVehicle] = await db.query(VEHICLE_SELECT + ' WHERE id = ?', [result.insertId]);
    res.status(201).json(newVehicle[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// PUT /api/vehicles/:id — mettre à jour un véhicule (admin)
router.put('/:id', auth(['admin', 'gerant']), async (req, res) => {
  try {
    // Map frontend field names to DB column names
    const fieldMap = {
      marque: 'marque', modele: 'modele', immatriculation: 'immatriculation',
      annee: 'annee', categorie: 'categorie', type: 'type',
      carburant: 'carburant', transmission: 'transmission',
      places: 'nb_places', prix_jour: 'prix_jour',
      statut: 'statut', image_url: 'photo_url', kilometrage: 'kilometrage',
    };
    const updates = [];
    const params = [];

    Object.entries(fieldMap).forEach(([frontKey, dbCol]) => {
      if (req.body[frontKey] !== undefined) {
        updates.push(`${dbCol} = ?`);
        params.push(req.body[frontKey]);
      }
    });

    if (!updates.length) return res.status(400).json({ message: 'Aucun champ à modifier' });

    params.push(req.params.id);
    await db.query(`UPDATE vehicles SET ${updates.join(', ')} WHERE id = ?`, params);
    const [rows] = await db.query(VEHICLE_SELECT + ' WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// PATCH /api/vehicles/:id — mise à jour partielle (statut, kilometrage…)
router.patch('/:id', auth(['admin', 'gerant']), async (req, res) => {
  try {
    const allowed = ['statut', 'kilometrage'];
    const updates = [];
    const params = [];

    allowed.forEach(f => {
      if (req.body[f] !== undefined) {
        updates.push(`${f} = ?`);
        params.push(req.body[f]);
      }
    });

    if (!updates.length) return res.status(400).json({ message: 'Aucun champ valide' });

    params.push(req.params.id);
    await db.query(`UPDATE vehicles SET ${updates.join(', ')} WHERE id = ?`, params);
    res.json({ message: 'Mis à jour' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// DELETE /api/vehicles/:id — supprimer un véhicule (admin)
router.delete('/:id', auth(['admin', 'gerant']), async (req, res) => {
  try {
    const [active] = await db.query(
      "SELECT id FROM bookings WHERE vehicule_id = ? AND statut IN ('confirme','en_cours')",
      [req.params.id]
    );
    if (active.length) {
      return res.status(400).json({ message: 'Ce véhicule a des réservations actives' });
    }
    await db.query('DELETE FROM vehicles WHERE id = ?', [req.params.id]);
    res.json({ message: 'Véhicule supprimé' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
