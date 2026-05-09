const ORANGE = '#F97316';
const DARK = '#0F172A';
const MUTED = '#64748B';
const BORDER = '#E2E8F0';
const SURFACE = '#F8FAFC';

function fmtDateFR(d) {
  if (!d) return '—';
  const date = new Date(d);
  if (isNaN(date)) return '—';
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

function fmtMoney(n) {
  const v = Number(n) || 0;
  return v.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

function diffJours(start, end) {
  if (!start || !end) return 0;
  const ms = new Date(end) - new Date(start);
  const j = Math.ceil(ms / (1000 * 60 * 60 * 24));
  return j > 0 ? j : 0;
}

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function invoiceTemplate({ booking, client, vehicle }) {
  const dateDepart = booking.date_debut || booking.date_depart;
  const dateRetour = booking.date_fin_prevue || booking.date_retour;
  const total = Number(booking.prix_total ?? booking.montant_total ?? 0);
  const caution = Number(booking.caution_percue ?? 0);
  const jours = diffJours(dateDepart, dateRetour);
  const prixJour = jours > 0 ? total / jours : Number(vehicle.prix_jour || 0);
  const totalTTC = total + caution;
  const today = fmtDateFR(new Date());

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Facture #${escapeHtml(booking.id)}</title>
</head>
<body style="margin:0;padding:0;background:${SURFACE};font-family:'Inter','Segoe UI',Arial,sans-serif;color:${DARK};-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${SURFACE};padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);">

          <!-- Header -->
          <tr>
            <td style="background:${ORANGE};padding:32px 32px;text-align:center;">
              <p style="margin:0;color:#FFFFFF;font-size:32px;font-weight:900;letter-spacing:-0.02em;">AUTOLOC&apos;</p>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:11px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;">Le confort notre atout</p>
            </td>
          </tr>

          <!-- Title block -->
          <tr>
            <td style="padding:32px 32px 8px;">
              <p style="margin:0;color:${MUTED};font-size:11px;font-weight:600;letter-spacing:0.15em;text-transform:uppercase;">Facture</p>
              <h1 style="margin:6px 0 0;color:${DARK};font-size:24px;font-weight:800;letter-spacing:-0.02em;">Votre facture de location</h1>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:18px;">
                <tr>
                  <td style="font-size:13px;color:${MUTED};">N° de facture</td>
                  <td style="font-size:13px;color:${DARK};font-weight:700;text-align:right;">#${escapeHtml(booking.id)}</td>
                </tr>
                <tr>
                  <td style="font-size:13px;color:${MUTED};padding-top:4px;">Date d&apos;émission</td>
                  <td style="font-size:13px;color:${DARK};font-weight:600;text-align:right;padding-top:4px;">${today}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Client -->
          <tr>
            <td style="padding:24px 32px 0;">
              <p style="margin:0 0 10px;color:${MUTED};font-size:11px;font-weight:600;letter-spacing:0.15em;text-transform:uppercase;">Client</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${SURFACE};border-radius:12px;padding:16px;">
                <tr>
                  <td style="padding:14px 16px;">
                    <p style="margin:0;color:${DARK};font-size:15px;font-weight:700;">${escapeHtml(client.prenom || '')} ${escapeHtml(client.nom || '')}</p>
                    <p style="margin:4px 0 0;color:${MUTED};font-size:13px;">${escapeHtml(client.email || '')}</p>
                    ${client.telephone ? `<p style="margin:4px 0 0;color:${MUTED};font-size:13px;">${escapeHtml(client.telephone)}</p>` : ''}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Vehicle -->
          <tr>
            <td style="padding:20px 32px 0;">
              <p style="margin:0 0 10px;color:${MUTED};font-size:11px;font-weight:600;letter-spacing:0.15em;text-transform:uppercase;">Véhicule</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${SURFACE};border-radius:12px;">
                <tr>
                  <td style="padding:14px 16px;">
                    <p style="margin:0;color:${DARK};font-size:15px;font-weight:700;">${escapeHtml(vehicle.marque || '')} ${escapeHtml(vehicle.modele || '')}</p>
                    <p style="margin:4px 0 0;color:${MUTED};font-size:13px;">
                      ${vehicle.immatriculation ? `Immatriculation : <strong style="color:${DARK};">${escapeHtml(vehicle.immatriculation)}</strong>` : ''}
                      ${vehicle.immatriculation && vehicle.categorie ? ' &middot; ' : ''}
                      ${vehicle.categorie ? `Catégorie : <strong style="color:${DARK};text-transform:capitalize;">${escapeHtml(vehicle.categorie)}</strong>` : ''}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Rental details -->
          <tr>
            <td style="padding:20px 32px 0;">
              <p style="margin:0 0 10px;color:${MUTED};font-size:11px;font-weight:600;letter-spacing:0.15em;text-transform:uppercase;">Détails de la location</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${BORDER};border-radius:12px;">
                <tr>
                  <td style="padding:12px 16px;border-bottom:1px solid ${BORDER};font-size:13px;color:${MUTED};">Date de départ</td>
                  <td style="padding:12px 16px;border-bottom:1px solid ${BORDER};font-size:13px;color:${DARK};font-weight:600;text-align:right;">${fmtDateFR(dateDepart)}</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;border-bottom:1px solid ${BORDER};font-size:13px;color:${MUTED};">Date de retour</td>
                  <td style="padding:12px 16px;border-bottom:1px solid ${BORDER};font-size:13px;color:${DARK};font-weight:600;text-align:right;">${fmtDateFR(dateRetour)}</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;font-size:13px;color:${MUTED};">Durée</td>
                  <td style="padding:12px 16px;font-size:13px;color:${DARK};font-weight:600;text-align:right;">${jours} jour${jours > 1 ? 's' : ''}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Pricing table -->
          <tr>
            <td style="padding:24px 32px 0;">
              <p style="margin:0 0 10px;color:${MUTED};font-size:11px;font-weight:600;letter-spacing:0.15em;text-transform:uppercase;">Détail du prix</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${BORDER};border-radius:12px;border-collapse:separate;border-spacing:0;overflow:hidden;">
                <thead>
                  <tr style="background:${SURFACE};">
                    <th align="left"  style="padding:10px 14px;font-size:11px;font-weight:700;color:${MUTED};text-transform:uppercase;letter-spacing:0.08em;border-bottom:1px solid ${BORDER};">Description</th>
                    <th align="left"  style="padding:10px 8px;font-size:11px;font-weight:700;color:${MUTED};text-transform:uppercase;letter-spacing:0.08em;border-bottom:1px solid ${BORDER};">Durée</th>
                    <th align="right" style="padding:10px 8px;font-size:11px;font-weight:700;color:${MUTED};text-transform:uppercase;letter-spacing:0.08em;border-bottom:1px solid ${BORDER};">Prix/jour</th>
                    <th align="right" style="padding:10px 14px;font-size:11px;font-weight:700;color:${MUTED};text-transform:uppercase;letter-spacing:0.08em;border-bottom:1px solid ${BORDER};">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style="padding:14px;font-size:13px;color:${DARK};border-bottom:1px solid ${BORDER};">Location véhicule</td>
                    <td style="padding:14px 8px;font-size:13px;color:${DARK};border-bottom:1px solid ${BORDER};">${jours} j</td>
                    <td align="right" style="padding:14px 8px;font-size:13px;color:${DARK};border-bottom:1px solid ${BORDER};">${fmtMoney(prixJour)}</td>
                    <td align="right" style="padding:14px;font-size:13px;color:${DARK};font-weight:600;border-bottom:1px solid ${BORDER};">${fmtMoney(total)}</td>
                  </tr>
                  ${caution > 0 ? `
                  <tr>
                    <td style="padding:14px;font-size:13px;color:${DARK};border-bottom:1px solid ${BORDER};">Caution</td>
                    <td style="padding:14px 8px;border-bottom:1px solid ${BORDER};"></td>
                    <td style="padding:14px 8px;border-bottom:1px solid ${BORDER};"></td>
                    <td align="right" style="padding:14px;font-size:13px;color:${DARK};font-weight:600;border-bottom:1px solid ${BORDER};">${fmtMoney(caution)}</td>
                  </tr>` : ''}
                  <tr>
                    <td style="padding:16px 14px;font-size:14px;color:${DARK};font-weight:800;background:${SURFACE};">TOTAL TTC</td>
                    <td style="background:${SURFACE};"></td>
                    <td style="background:${SURFACE};"></td>
                    <td align="right" style="padding:16px 14px;font-size:18px;color:${ORANGE};font-weight:900;background:${SURFACE};letter-spacing:-0.01em;">${fmtMoney(totalTTC)}</td>
                  </tr>
                </tbody>
              </table>
              <p style="margin:8px 2px 0;color:${MUTED};font-size:11px;">Prix TTC, carburant non inclus.</p>
            </td>
          </tr>

          <!-- Thanks -->
          <tr>
            <td style="padding:28px 32px 8px;text-align:center;">
              <p style="margin:0;color:${DARK};font-size:15px;font-weight:600;">Merci pour votre confiance&nbsp;!</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:16px 32px 32px;text-align:center;border-top:1px solid ${BORDER};margin-top:8px;">
              <p style="margin:16px 0 0;color:${MUTED};font-size:12px;line-height:1.7;">
                <strong style="color:${DARK};">AUTOLOC&apos;</strong> &middot; 41 Boulevard Vauban, 59800 Lille<br>
                <a href="mailto:contact@autoloc.fr" style="color:${ORANGE};text-decoration:none;">contact@autoloc.fr</a> &middot;
                <a href="tel:+33123456789" style="color:${ORANGE};text-decoration:none;">01 23 45 67 89</a>
              </p>
            </td>
          </tr>
        </table>

        <p style="margin:16px 0 0;color:${MUTED};font-size:11px;">
          &copy; ${new Date().getFullYear()} AUTOLOC&apos; — Tous droits réservés
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

module.exports = { invoiceTemplate };
