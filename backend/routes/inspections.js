const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');
const { memoryUpload, processInspectionPhoto } = require('../services/uploadService');

// POST /api/inspections — agent uploads inspection photos + metadata
router.post('/', auth(['admin', 'gerant']), memoryUpload.array('photos', 6), async (req, res) => {
  try {
    const {
      booking_id, type, etat_general, kilometrage,
      niveau_carburant, commentaires, signature_agent,
    } = req.body;

    if (!booking_id || !type) {
      return res.status(400).json({ message: 'booking_id et type requis' });
    }
    if (!['depart', 'retour'].includes(type)) {
      return res.status(400).json({ message: "type doit être 'depart' ou 'retour'" });
    }

    const [bookingRows] = await db.query('SELECT id FROM bookings WHERE id = ?', [booking_id]);
    if (!bookingRows.length) return res.status(404).json({ message: 'Réservation introuvable' });

    const photoUrls = [];
    for (const file of req.files || []) {
      const url = await processInspectionPhoto(file.buffer);
      photoUrls.push(url);
    }

    const [result] = await db.query(
      `INSERT INTO vehicle_inspections
       (booking_id, type, photos, etat_general, kilometrage, niveau_carburant, commentaires, signature_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        booking_id,
        type,
        JSON.stringify(photoUrls),
        etat_general || 'bon',
        kilometrage ? Number(kilometrage) : null,
        niveau_carburant || null,
        commentaires || null,
        signature_agent || null,
      ]
    );

    res.status(201).json({
      id: result.insertId,
      booking_id: Number(booking_id),
      type,
      photos: photoUrls,
    });
  } catch (err) {
    console.error('POST /api/inspections error:', err);
    res.status(500).json({ message: err.message || 'Erreur serveur' });
  }
});

// GET /api/inspections/:booking_id — both depart + retour for a booking
router.get('/:booking_id', auth(['admin', 'gerant']), async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, booking_id, type, photos, etat_general, kilometrage,
              niveau_carburant, commentaires, signature_agent, created_at
       FROM vehicle_inspections
       WHERE booking_id = ?
       ORDER BY type ASC, created_at DESC`,
      [req.params.booking_id]
    );
    const out = { depart: null, retour: null };
    for (const r of rows) {
      const parsed = { ...r, photos: safeJson(r.photos) };
      if (!out[r.type]) out[r.type] = parsed;
    }
    res.json(out);
  } catch (err) {
    console.error('GET /api/inspections/:booking_id error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

function safeJson(v) {
  if (Array.isArray(v)) return v;
  if (typeof v !== 'string') return [];
  try { return JSON.parse(v) || []; } catch { return []; }
}

module.exports = router;
