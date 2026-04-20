const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// GET /api/alerts — liste des alertes (admin)
router.get('/', auth(['admin', 'gerant']), async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM alerts ORDER BY created_at DESC LIMIT 50'
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /api/alerts error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// PATCH /api/alerts/:id/read — marquer une alerte comme lue
router.patch('/:id/read', auth(['admin', 'gerant']), async (req, res) => {
  try {
    await db.query('UPDATE alerts SET lue = 1 WHERE id = ?', [req.params.id]);
    res.json({ message: 'Alerte marquée comme lue' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/alerts/read-all — tout marquer comme lu
router.post('/read-all', auth(['admin', 'gerant']), async (req, res) => {
  try {
    await db.query('UPDATE alerts SET lue = 1 WHERE lue = 0');
    res.json({ message: 'Toutes les alertes marquées comme lues' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
