const transporter = require('../config/mailer');
const { invoiceTemplate } = require('../templates/invoiceEmail');
const { generateInvoicePdf } = require('./invoicePdf');

const FROM = () => process.env.EMAIL_FROM || `AUTOLOC' <${process.env.EMAIL_USER}>`;

function isMailerConfigured() {
  return Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);
}

async function sendInvoiceEmail(booking, client, vehicle) {
  if (!isMailerConfigured()) {
    console.warn('[email] EMAIL_USER / EMAIL_PASS not configured — skipping invoice email');
    return false;
  }
  if (!client?.email) {
    console.warn('[email] No client email — skipping invoice email');
    return false;
  }

  let pdfBuffer;
  try {
    pdfBuffer = await generateInvoicePdf({ booking, client, vehicle });
    console.log(`[email] PDF generated for booking #${booking.id} (${pdfBuffer.length} bytes)`);
  } catch (err) {
    console.error('[email] PDF generation FAILED:', err.message);
    console.error(err.stack);
    return false;
  }

  const html = invoiceTemplate({ booking, client, vehicle });

  try {
    const info = await transporter.sendMail({
      from: FROM(),
      to: client.email,
      subject: `AUTOLOC' — Votre facture #${booking.id}`,
      html,
      attachments: [{
        filename: `facture-autoloc-${booking.id}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      }],
    });
    console.log(`[email] Invoice sent to ${client.email} (messageId: ${info.messageId})`);
    return true;
  } catch (error) {
    console.error('[email] Invoice send FAILED:', error.message);
    console.error(error.stack);
    return false;
  }
}

async function sendBookingConfirmationEmail(booking, client, vehicle) {
  if (!isMailerConfigured()) {
    console.warn('[email] EMAIL_USER / EMAIL_PASS not configured — skipping confirmation email');
    return false;
  }
  if (!client?.email) {
    console.warn('[email] No client email — skipping confirmation email');
    return false;
  }

  const dateDepart = booking.date_debut || booking.date_depart;
  const dateRetour = booking.date_fin_prevue || booking.date_retour;
  const fmt = (d) => d
    ? new Date(d).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : '—';
  const total = booking.prix_total ?? booking.montant_total ?? 0;

  const html = `
    <div style="font-family: Inter, 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FFFFFF;">
      <div style="background: #F97316; padding: 28px 24px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -0.02em;">AUTOLOC&apos;</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 13px; font-weight: 600;">Confirmation de réservation</p>
      </div>
      <div style="padding: 32px 28px; background: white; color: #0F172A;">
        <h2 style="margin:0 0 12px;font-size:18px;font-weight:700;">Bonjour ${escapeHtml(client.prenom || '')} ${escapeHtml(client.nom || '')},</h2>
        <p style="margin:0 0 8px;color:#475569;font-size:14px;line-height:1.6;">Votre réservation <strong style="color:#0F172A;">#${escapeHtml(booking.id)}</strong> est confirmée.</p>
        <div style="background: #F8FAFC; border-radius: 12px; padding: 20px; margin: 24px 0;font-size:14px;line-height:1.8;color:#334155;">
          <p style="margin:0;"><strong style="color:#0F172A;">Véhicule :</strong> ${escapeHtml(vehicle.marque || '')} ${escapeHtml(vehicle.modele || '')}</p>
          <p style="margin:0;"><strong style="color:#0F172A;">Départ :</strong> ${fmt(dateDepart)}</p>
          <p style="margin:0;"><strong style="color:#0F172A;">Retour :</strong> ${fmt(dateRetour)}</p>
          <p style="margin:8px 0 0;"><strong style="color:#0F172A;">Montant total :</strong> <span style="color: #F97316; font-size: 1.2rem; font-weight: 800;">${Number(total).toLocaleString('fr-FR')}€</span></p>
        </div>
        <p style="margin:0 0 8px;color:#475569;font-size:14px;">Vous trouverez ci-dessous votre facture. Vous pouvez aussi la consulter à tout moment depuis votre espace «&nbsp;Ma réservation&nbsp;».</p>
        <p style="margin: 24px 0 0;color: #64748B; font-size: 12px;line-height:1.7;">
          Pour toute question : <a href="mailto:contact@autoloc.fr" style="color:#F97316;text-decoration:none;">contact@autoloc.fr</a><br>
          41 Boulevard Vauban, 59800 Lille — 01 23 45 67 89
        </p>
      </div>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: FROM(),
      to: client.email,
      subject: `AUTOLOC' — Confirmation de réservation #${booking.id}`,
      html,
    });
    console.log(`[email] Confirmation sent to ${client.email} (messageId: ${info.messageId})`);
    return true;
  } catch (error) {
    console.error('[email] Confirmation send FAILED:', error.message);
    console.error(error.stack);
    return false;
  }
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

module.exports = { sendInvoiceEmail, sendBookingConfirmationEmail };
