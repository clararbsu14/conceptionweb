const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');
const transporter = require('../config/mailer');

const ALLOWED_TYPES = ['rayure', 'bosse', 'bris_glace', 'autre'];
const ALLOWED_STATUTS = ['declare', 'en_cours', 'resolu', 'classe'];

const TYPE_LABEL = {
  rayure: 'Rayure', bosse: 'Bosse', bris_glace: 'Bris de glace', autre: 'Autre',
};

// POST /api/sinistres — agent declares a sinistre on a booking
router.post('/', auth(['admin', 'gerant']), async (req, res) => {
  try {
    const {
      booking_id, type, description,
      photo_avant, photo_apres, localisation, montant_estime,
    } = req.body;

    if (!booking_id || !type) return res.status(400).json({ message: 'booking_id et type requis' });
    if (!ALLOWED_TYPES.includes(type)) return res.status(400).json({ message: 'type invalide' });

    const [bookingRows] = await db.query(
      'SELECT id, vehicle_id FROM bookings WHERE id = ?',
      [booking_id]
    );
    if (!bookingRows.length) return res.status(404).json({ message: 'Réservation introuvable' });
    const vehicle_id = bookingRows[0].vehicle_id;

    const [result] = await db.query(
      `INSERT INTO sinistres
       (booking_id, vehicle_id, type, description, photo_avant, photo_apres, localisation, montant_estime, statut)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'declare')`,
      [
        booking_id, vehicle_id, type,
        description || null,
        photo_avant || null,
        photo_apres || null,
        localisation || null,
        montant_estime ? Number(montant_estime) : null,
      ]
    );

    res.status(201).json({ id: result.insertId, booking_id, vehicle_id, type, statut: 'declare' });

    // Best-effort alert email to the configured admin inbox
    sendSinistreAlert(result.insertId).catch(err =>
      console.error('[email] sinistre alert failed:', err.message)
    );
  } catch (err) {
    console.error('POST /api/sinistres error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/admin/sinistres — list with booking + vehicle + client
router.get('/', auth(['admin', 'gerant']), async (req, res) => {
  try {
    const { statut } = req.query;
    let sql = `
      SELECT s.*,
             v.marque, v.modele, v.immatriculation,
             u.nom, u.prenom, u.email, u.telephone,
             b.date_debut, b.date_fin_prevue, b.prix_total
      FROM sinistres s
      LEFT JOIN bookings b ON b.id = s.booking_id
      LEFT JOIN vehicles v ON v.id = s.vehicle_id
      LEFT JOIN users u    ON u.id = b.client_id
      WHERE 1=1
    `;
    const params = [];
    if (statut && ALLOWED_STATUTS.includes(statut)) {
      sql += ' AND s.statut = ?';
      params.push(statut);
    }
    sql += ' ORDER BY s.created_at DESC';

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('GET /api/admin/sinistres error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// PATCH /api/admin/sinistres/:id — update status / amount
router.patch('/:id', auth(['admin', 'gerant']), async (req, res) => {
  try {
    const allowed = { statut: ALLOWED_STATUTS, montant_estime: null, description: null, localisation: null };
    const updates = [];
    const params = [];

    for (const [field, validValues] of Object.entries(allowed)) {
      if (req.body[field] === undefined) continue;
      if (validValues && !validValues.includes(req.body[field])) {
        return res.status(400).json({ message: `${field} invalide` });
      }
      updates.push(`${field} = ?`);
      params.push(field === 'montant_estime' && req.body[field] !== null
        ? Number(req.body[field])
        : req.body[field]);
    }

    if (!updates.length) return res.status(400).json({ message: 'Aucun champ à modifier' });

    params.push(req.params.id);
    await db.query(`UPDATE sinistres SET ${updates.join(', ')} WHERE id = ?`, params);

    const [rows] = await db.query('SELECT * FROM sinistres WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Sinistre introuvable' });
    res.json(rows[0]);
  } catch (err) {
    console.error('PATCH /api/admin/sinistres/:id error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/admin/sinistres/:id/send-quote — email quote to client
router.post('/:id/send-quote', auth(['admin', 'gerant']), async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT s.*, v.marque, v.modele, v.immatriculation,
              u.nom, u.prenom, u.email
       FROM sinistres s
       LEFT JOIN bookings b ON b.id = s.booking_id
       LEFT JOIN vehicles v ON v.id = s.vehicle_id
       LEFT JOIN users u    ON u.id = b.client_id
       WHERE s.id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Sinistre introuvable' });
    const s = rows[0];

    if (!s.email) return res.status(400).json({ message: 'Aucun email client associé' });
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(503).json({ message: 'Email non configuré' });
    }

    const html = quoteEmailHtml(s);
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || `AUTOLOC' <${process.env.EMAIL_USER}>`,
      to: s.email,
      subject: `AUTOLOC' — Devis sinistre #${s.id}`,
      html,
    });
    console.log(`[email] quote sent to ${s.email} (messageId: ${info.messageId})`);
    res.json({ success: true, message: `Devis envoyé à ${s.email}` });
  } catch (err) {
    console.error('POST /api/admin/sinistres/:id/send-quote error:', err);
    res.status(500).json({ message: err.message || 'Erreur serveur' });
  }
});

async function sendSinistreAlert(sinistreId) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;

  const [rows] = await db.query(
    `SELECT s.*, v.marque, v.modele, v.immatriculation,
            u.nom, u.prenom, u.email
     FROM sinistres s
     LEFT JOIN bookings b ON b.id = s.booking_id
     LEFT JOIN vehicles v ON v.id = s.vehicle_id
     LEFT JOIN users u    ON u.id = b.client_id
     WHERE s.id = ?`,
    [sinistreId]
  );
  if (!rows.length) return;
  const s = rows[0];

  const html = `
    <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;color:#0F172A;">
      <div style="background:#DC2626;padding:20px 24px;border-radius:12px 12px 0 0;color:#FFF;">
        <h1 style="margin:0;font-size:18px;font-weight:800;">⚠️ Nouveau sinistre déclaré</h1>
        <p style="margin:6px 0 0;font-size:13px;opacity:0.9;">Sinistre #${s.id} · ${TYPE_LABEL[s.type] || s.type}</p>
      </div>
      <div style="background:#FFF;border:1px solid #E2E8F0;border-top:none;border-radius:0 0 12px 12px;padding:24px;font-size:14px;line-height:1.7;">
        <p><strong>Réservation :</strong> #${s.booking_id}</p>
        <p><strong>Véhicule :</strong> ${esc(s.marque)} ${esc(s.modele)} (${esc(s.immatriculation || '—')})</p>
        <p><strong>Client :</strong> ${esc(s.prenom || '')} ${esc(s.nom || '')} — ${esc(s.email || '—')}</p>
        ${s.localisation ? `<p><strong>Localisation :</strong> ${esc(s.localisation)}</p>` : ''}
        ${s.description ? `<p><strong>Description :</strong> ${esc(s.description)}</p>` : ''}
        ${s.montant_estime ? `<p><strong>Estimation :</strong> ${Number(s.montant_estime).toFixed(2)} €</p>` : ''}
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || `AUTOLOC' <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    subject: `[AUTOLOC'] Sinistre #${sinistreId} déclaré`,
    html,
  });
  console.log(`[email] sinistre alert sent for #${sinistreId}`);
}

function quoteEmailHtml(s) {
  return `
    <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;color:#0F172A;">
      <div style="background:#F97316;padding:24px;border-radius:12px 12px 0 0;color:#FFF;text-align:center;">
        <h1 style="margin:0;font-size:24px;font-weight:900;">AUTOLOC&apos;</h1>
        <p style="margin:6px 0 0;font-size:13px;opacity:0.9;">Devis sinistre</p>
      </div>
      <div style="background:#FFF;border:1px solid #E2E8F0;border-top:none;border-radius:0 0 12px 12px;padding:28px;font-size:14px;line-height:1.7;">
        <p>Bonjour ${esc(s.prenom || '')} ${esc(s.nom || '')},</p>
        <p>Suite à votre location du véhicule <strong>${esc(s.marque)} ${esc(s.modele)}</strong> (réservation #${s.booking_id}), nous avons constaté le sinistre suivant :</p>
        <div style="background:#F8FAFC;border-radius:10px;padding:16px;margin:16px 0;">
          <p style="margin:0 0 6px;"><strong>Type :</strong> ${TYPE_LABEL[s.type] || s.type}</p>
          ${s.localisation ? `<p style="margin:0 0 6px;"><strong>Localisation :</strong> ${esc(s.localisation)}</p>` : ''}
          ${s.description ? `<p style="margin:0;"><strong>Description :</strong> ${esc(s.description)}</p>` : ''}
        </div>
        ${s.montant_estime
          ? `<p>Le montant estimé des réparations s'élève à
             <strong style="color:#F97316;font-size:1.15rem;">${Number(s.montant_estime).toFixed(2)} €</strong>.</p>`
          : `<p>Notre équipe finalise actuellement l'estimation des réparations et vous transmettra le montant sous peu.</p>`}
        <p style="margin-top:24px;color:#64748B;font-size:12px;line-height:1.6;">
          Pour toute question : <a href="mailto:contact@autoloc.fr" style="color:#F97316;text-decoration:none;">contact@autoloc.fr</a><br>
          AUTOLOC' — 41 Boulevard Vauban, 59800 Lille
        </p>
      </div>
    </div>
  `;
}

function esc(v) {
  if (v == null) return '';
  return String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

module.exports = router;
