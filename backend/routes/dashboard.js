const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// GET /api/dashboard/stats — KPI stats from real DB
router.get('/stats', auth(['admin', 'gerant']), async (req, res) => {
  try {
    // Vehicle stats
    const [[vehicles]] = await db.query(`
      SELECT
        COUNT(*) AS total_vehicules,
        SUM(statut = 'disponible') AS disponibles,
        SUM(statut = 'loue') AS en_location,
        SUM(statut = 'en_maintenance') AS en_maintenance,
        SUM(statut = 'retard') AS retards_vehicules
      FROM vehicles
    `);

    // Taux d'occupation = véhicules non-disponibles / total
    const taux_occupation = vehicles.total_vehicules > 0
      ? Math.round(((vehicles.total_vehicules - vehicles.disponibles) / vehicles.total_vehicules) * 100)
      : 0;

    // Revenus du mois courant
    const [[revMois]] = await db.query(`
      SELECT COALESCE(SUM(prix_total), 0) AS revenus_mois
      FROM bookings
      WHERE statut IN ('terminee', 'en_cours')
        AND MONTH(date_debut) = MONTH(CURDATE())
        AND YEAR(date_debut) = YEAR(CURDATE())
    `);

    // RevPAC = revenus mois / nb véhicules actifs / nb jours du mois
    const joursInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const vehiculesActifs = vehicles.total_vehicules - (vehicles.en_maintenance || 0);
    const revpac = vehiculesActifs > 0 && joursInMonth > 0
      ? Math.round(parseFloat(revMois.revenus_mois) / vehiculesActifs / joursInMonth * 100) / 100
      : 0;

    // Durée moyenne des locations terminées
    const [[duree]] = await db.query(`
      SELECT COALESCE(AVG(DATEDIFF(date_fin_prevue, date_debut)), 0) AS duree_moyenne
      FROM bookings
      WHERE statut = 'terminee'
    `);

    // Véhicules à réviser (moins de 2000 km avant prochain entretien)
    const [[revisions]] = await db.query(`
      SELECT COUNT(*) AS vehicules_a_reviser
      FROM vehicles
      WHERE (km_prochain_entretien - kilometrage) < 2000
        AND (km_prochain_entretien - kilometrage) >= 0
    `);

    // Retards actifs
    const [[retards]] = await db.query(`
      SELECT COUNT(*) AS retards_actifs
      FROM bookings
      WHERE statut = 'retard'
    `);

    // Réservations ce mois
    const [[resMois]] = await db.query(`
      SELECT COUNT(*) AS reservations_ce_mois
      FROM bookings
      WHERE MONTH(date_debut) = MONTH(CURDATE())
        AND YEAR(date_debut) = YEAR(CURDATE())
    `);

    // Bookings stats for backward compat
    const [[bookingsStats]] = await db.query(`
      SELECT
        COUNT(*) AS total_reservations,
        SUM(DATE(date_debut) = CURDATE()) AS reservations_today,
        SUM(DATE(date_debut) BETWEEN DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND CURDATE()) AS reservations_week
      FROM bookings
    `);

    res.json({
      ...vehicles,
      ...bookingsStats,
      revenus_mois: parseFloat(revMois.revenus_mois),
      taux_occupation,
      revpac,
      duree_moyenne: Math.round(parseFloat(duree.duree_moyenne) * 10) / 10,
      vehicules_a_reviser: revisions.vehicules_a_reviser,
      retards_actifs: retards.retards_actifs,
      reservations_ce_mois: resMois.reservations_ce_mois,
    });
  } catch (err) {
    console.error('GET /api/dashboard/stats error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/dashboard/revenue-chart — last 6 months revenue
router.get('/revenue-chart', auth(['admin', 'gerant']), async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        DATE_FORMAT(date_debut, '%Y-%m') AS mois,
        SUM(prix_total) AS total
      FROM bookings
      WHERE date_debut >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
        AND statut IN ('terminee', 'en_cours')
      GROUP BY DATE_FORMAT(date_debut, '%Y-%m')
      ORDER BY mois ASC
    `);

    // Fill in missing months with 0
    const result = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toISOString().slice(0, 7); // YYYY-MM
      const found = rows.find(r => r.mois === key);
      result.push({
        mois: key,
        total: found ? parseFloat(found.total) : 0,
      });
    }

    res.json(result);
  } catch (err) {
    console.error('GET /api/dashboard/revenue-chart error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/dashboard/top-vehicles — top 5 most rented
router.get('/top-vehicles', auth(['admin', 'gerant']), async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        v.id, v.marque, v.modele, v.photo_url AS image_url,
        COUNT(b.id) AS nb_locations,
        COALESCE(SUM(b.prix_total), 0) AS revenus
      FROM bookings b
      JOIN vehicles v ON b.vehicle_id = v.id
      WHERE b.statut != 'annulee'
      GROUP BY v.id, v.marque, v.modele, v.photo_url
      ORDER BY nb_locations DESC
      LIMIT 5
    `);

    res.json(rows.map(r => ({
      ...r,
      nb_locations: r.nb_locations,
      revenus: parseFloat(r.revenus),
    })));
  } catch (err) {
    console.error('GET /api/dashboard/top-vehicles error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/dashboard/alerts — real-time alerts
router.get('/alerts', auth(['admin', 'gerant']), async (req, res) => {
  try {
    const alerts = [];

    // 1. Retards actifs
    const [retards] = await db.query(`
      SELECT b.id, b.date_fin_prevue,
             DATEDIFF(CURDATE(), b.date_fin_prevue) AS jours_retard,
             u.nom, u.prenom, u.telephone,
             v.marque, v.modele, v.immatriculation
      FROM bookings b
      JOIN users u ON b.client_id = u.id
      JOIN vehicles v ON b.vehicle_id = v.id
      WHERE b.statut = 'retard'
      ORDER BY b.date_fin_prevue ASC
    `);
    retards.forEach(r => {
      alerts.push({
        id: 'retard-' + r.id,
        type: 'retard',
        severity: 'high',
        title: `Retard de ${r.jours_retard} jour${r.jours_retard > 1 ? 's' : ''}`,
        message: `${r.prenom} ${r.nom} — ${r.marque} ${r.modele} (${r.immatriculation}). Retour prévu le ${new Date(r.date_fin_prevue).toLocaleDateString('fr-FR')}.`,
        telephone: r.telephone,
        booking_id: r.id,
      });
    });

    // 2. Révisions proches (< 2000 km)
    const [revisions] = await db.query(`
      SELECT id, marque, modele, immatriculation, kilometrage,
             km_prochain_entretien,
             (km_prochain_entretien - kilometrage) AS km_restants
      FROM vehicles
      WHERE (km_prochain_entretien - kilometrage) < 2000
        AND (km_prochain_entretien - kilometrage) >= 0
      ORDER BY km_restants ASC
    `);
    revisions.forEach(v => {
      alerts.push({
        id: 'revision-' + v.id,
        type: 'maintenance',
        severity: v.km_restants < 500 ? 'high' : 'medium',
        title: `Révision dans ${v.km_restants} km`,
        message: `${v.marque} ${v.modele} (${v.immatriculation}) — ${v.kilometrage.toLocaleString('fr-FR')} km actuels, entretien prévu à ${v.km_prochain_entretien.toLocaleString('fr-FR')} km.`,
        vehicle_id: v.id,
      });
    });

    // 3. Retours aujourd'hui
    const [retours] = await db.query(`
      SELECT b.id, b.date_fin_prevue,
             u.nom, u.prenom,
             v.marque, v.modele
      FROM bookings b
      JOIN users u ON b.client_id = u.id
      JOIN vehicles v ON b.vehicle_id = v.id
      WHERE DATE(b.date_fin_prevue) = CURDATE()
        AND b.statut = 'en_cours'
    `);
    retours.forEach(r => {
      alerts.push({
        id: 'retour-' + r.id,
        type: 'retour',
        severity: 'low',
        title: 'Retour prévu aujourd\'hui',
        message: `${r.prenom} ${r.nom} — ${r.marque} ${r.modele}. Retour prévu le ${new Date(r.date_fin_prevue).toLocaleDateString('fr-FR')}.`,
        booking_id: r.id,
      });
    });

    // 4. Réservations à confirmer
    const [[confirmer]] = await db.query(`
      SELECT COUNT(*) AS cnt FROM bookings WHERE statut = 'en_attente'
    `);
    if (confirmer.cnt > 0) {
      alerts.push({
        id: 'confirmer',
        type: 'reservation',
        severity: 'medium',
        title: `${confirmer.cnt} réservation${confirmer.cnt > 1 ? 's' : ''} en attente`,
        message: `${confirmer.cnt} réservation${confirmer.cnt > 1 ? 's' : ''} en attente de confirmation.`,
      });
    }

    res.json(alerts);
  } catch (err) {
    console.error('GET /api/dashboard/alerts error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/dashboard/retards — backward compat
router.get('/retards', auth(['admin', 'gerant']), async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT b.*, v.marque, v.modele, v.immatriculation,
             u.nom, u.prenom
      FROM bookings b
      LEFT JOIN vehicles v ON v.id = b.vehicle_id
      LEFT JOIN users u ON u.id = b.client_id
      WHERE b.statut = 'retard'
      ORDER BY b.date_fin_prevue ASC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
