const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// GET /api/bookings — liste (admin) ou filtres
router.get('/', auth(['admin', 'gerant']), async (req, res) => {
  try {
    const { statut, limit, sort } = req.query;
    let sql = `
      SELECT b.*,
             b.date_debut AS date_depart,
             b.date_fin_prevue AS date_retour,
             b.prix_total AS montant_total,
             v.marque, v.modele, v.categorie, v.prix_jour,
             u.nom, u.prenom, u.email, u.telephone
      FROM bookings b
      LEFT JOIN vehicles v ON v.id = b.vehicle_id
      LEFT JOIN users u ON u.id = b.client_id
      WHERE 1=1
    `;
    const params = [];

    if (statut) { sql += ' AND b.statut = ?'; params.push(statut); }

    sql += sort === 'recent' ? ' ORDER BY b.created_at DESC' : ' ORDER BY b.date_debut DESC';
    if (limit) { sql += ' LIMIT ?'; params.push(Number(limit)); }

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('GET /api/bookings error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/bookings/lookup — retrouver une réservation (client, par email + id)
router.get('/lookup', async (req, res) => {
  try {
    const { email, reference } = req.query;
    if (!email || !reference) {
      return res.status(400).json({ message: 'Email et numéro de réservation requis' });
    }

    const [rows] = await db.query(
      `SELECT b.*,
              b.date_debut AS date_depart,
              b.date_fin_prevue AS date_retour,
              b.prix_total AS montant_total,
              v.marque, v.modele, v.categorie, v.prix_jour,
              u.nom, u.prenom, u.email, u.telephone
       FROM bookings b
       LEFT JOIN vehicles v ON v.id = b.vehicle_id
       LEFT JOIN users u ON u.id = b.client_id
       WHERE b.id = ? AND u.email = ?`,
      [reference, email]
    );

    if (!rows.length) {
      return res.status(404).json({ message: 'Aucune réservation trouvée avec ces informations.' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/bookings/:id — détail d'une réservation
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT b.*,
              b.date_debut AS date_depart,
              b.date_fin_prevue AS date_retour,
              b.prix_total AS montant_total,
              v.marque, v.modele, v.categorie, v.prix_jour,
              u.nom, u.prenom, u.email, u.telephone
       FROM bookings b
       LEFT JOIN vehicles v ON v.id = b.vehicle_id
       LEFT JOIN users u ON u.id = b.client_id
       WHERE b.id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Réservation introuvable' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/bookings — créer une réservation (public)
router.post('/', async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const {
      vehicule_id, nom, prenom, email, telephone,
      date_depart, heure_depart, date_retour, heure_retour,
      options, commentaire, montant_total,
    } = req.body;

    const vehicle_id = vehicule_id;

    if (!vehicle_id || !nom || !prenom || !email || !telephone || !date_depart || !date_retour) {
      return res.status(400).json({ message: 'Champs obligatoires manquants' });
    }

    // Find or create client user
    let clientId;
    const [existingUser] = await conn.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser.length) {
      clientId = existingUser[0].id;
    } else {
      const [newUser] = await conn.query(
        'INSERT INTO users (nom, prenom, email, telephone, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)',
        [nom, prenom, email, telephone, 'no-login', 'client']
      );
      clientId = newUser.insertId;
    }

    // Check vehicle availability
    const [vehicle] = await conn.query(
      "SELECT * FROM vehicles WHERE id = ? AND statut = 'disponible'",
      [vehicle_id]
    );

    let finalVehicleId = vehicle_id;
    let usedSimilar = false;

    if (!vehicle.length) {
      const [original] = await conn.query('SELECT * FROM vehicles WHERE id = ?', [vehicle_id]);
      if (original.length) {
        const v = original[0];
        const [similar] = await conn.query(
          "SELECT * FROM vehicles WHERE statut = 'disponible' AND id != ? AND type = ? ORDER BY ABS(prix_jour - ?) ASC LIMIT 1",
          [vehicle_id, v.type, v.prix_jour]
        );
        if (similar.length) {
          finalVehicleId = similar[0].id;
          usedSimilar = true;
        } else {
          await conn.rollback();
          return res.status(409).json({ message: 'Ce véhicule n\'est plus disponible et aucun véhicule similaire n\'est disponible.' });
        }
      } else {
        await conn.rollback();
        return res.status(404).json({ message: 'Véhicule introuvable' });
      }
    }

    // Calculate price
    const jours = Math.ceil((new Date(date_retour) - new Date(date_depart)) / (1000 * 60 * 60 * 24));
    const [vRow] = await conn.query('SELECT prix_jour FROM vehicles WHERE id = ?', [finalVehicleId]);
    const total = montant_total || (vRow[0].prix_jour * jours);

    // Insert booking
    const [result] = await conn.query(
      `INSERT INTO bookings
       (client_id, vehicle_id, date_debut, date_fin_prevue, statut, prix_total, notes)
       VALUES (?, ?, ?, ?, 'confirmee', ?, ?)`,
      [clientId, finalVehicleId, date_depart, date_retour, total,
       commentaire || null]
    );

    // Mark vehicle as reserved
    await conn.query("UPDATE vehicles SET statut = 'loue' WHERE id = ?", [finalVehicleId]);

    await conn.commit();

    res.status(201).json({
      id: result.insertId,
      vehicle_id: finalVehicleId,
      usedSimilar,
      montant_total: total,
      statut: 'confirmee',
    });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  } finally {
    conn.release();
  }
});

// PATCH /api/bookings/:id — modifier statut ou dates
router.patch('/:id', async (req, res) => {
  try {
    const { date_depart, date_retour, statut } = req.body;

    const [existing] = await db.query('SELECT * FROM bookings WHERE id = ?', [req.params.id]);
    if (!existing.length) return res.status(404).json({ message: 'Réservation introuvable' });

    const r = existing[0];
    if (['annulee', 'terminee'].includes(r.statut) && !statut) {
      return res.status(400).json({ message: 'Cette réservation ne peut plus être modifiée.' });
    }

    const updates = [];
    const params = [];

    if (date_depart) { updates.push('date_debut = ?');      params.push(date_depart); }
    if (date_retour) { updates.push('date_fin_prevue = ?');  params.push(date_retour); }
    if (statut)      { updates.push('statut = ?');           params.push(statut); }

    if (!updates.length) return res.status(400).json({ message: 'Aucun champ à modifier' });

    params.push(req.params.id);
    await db.query(`UPDATE bookings SET ${updates.join(', ')} WHERE id = ?`, params);

    // Update vehicle status when booking status changes
    if (statut === 'terminee') {
      await db.query("UPDATE vehicles SET statut = 'disponible' WHERE id = ?", [r.vehicle_id]);
    } else if (statut === 'annulee') {
      await db.query("UPDATE vehicles SET statut = 'disponible' WHERE id = ?", [r.vehicle_id]);
    }

    const [updated] = await db.query('SELECT * FROM bookings WHERE id = ?', [req.params.id]);
    res.json(updated[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// PATCH /api/bookings/:id/cancel — annuler une réservation
router.patch('/:id/cancel', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM bookings WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Réservation introuvable' });

    const r = rows[0];
    if (['annulee', 'terminee'].includes(r.statut)) {
      return res.status(400).json({ message: 'Cette réservation ne peut pas être annulée.' });
    }

    await db.query("UPDATE bookings SET statut = 'annulee' WHERE id = ?", [r.id]);
    await db.query("UPDATE vehicles SET statut = 'disponible' WHERE id = ?", [r.vehicle_id]);

    res.json({ message: 'Réservation annulée', id: r.id });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
