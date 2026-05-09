const PDFDocument = require('pdfkit');

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
  return v.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' EUR';
}

function diffJours(start, end) {
  if (!start || !end) return 0;
  const ms = new Date(end) - new Date(start);
  const j = Math.ceil(ms / (1000 * 60 * 60 * 24));
  return j > 0 ? j : 0;
}

function generateInvoicePdf({ booking, client, vehicle }) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks = [];
      doc.on('data', c => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const dateDepart = booking.date_debut || booking.date_depart;
      const dateRetour = booking.date_fin_prevue || booking.date_retour;
      const total = Number(booking.prix_total ?? booking.montant_total ?? 0);
      const caution = Number(booking.caution_percue ?? 0);
      const jours = diffJours(dateDepart, dateRetour);
      const prixJour = jours > 0 ? total / jours : Number(vehicle.prix_jour || 0);
      const totalTTC = total + caution;

      const PAGE_W = doc.page.width;
      const LEFT = 50;
      const RIGHT = PAGE_W - 50;
      const CONTENT_W = RIGHT - LEFT;

      // Header band
      doc.rect(0, 0, PAGE_W, 90).fill(ORANGE);
      doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(28).text("AUTOLOC'", LEFT, 28);
      doc.font('Helvetica').fontSize(9)
        .text('LE CONFORT NOTRE ATOUT', LEFT, 64, { characterSpacing: 2 });

      let y = 120;

      // Title
      doc.fillColor(MUTED).font('Helvetica-Bold').fontSize(9)
        .text('FACTURE', LEFT, y, { characterSpacing: 2 });
      y += 14;
      doc.fillColor(DARK).font('Helvetica-Bold').fontSize(20)
        .text('Votre facture de location', LEFT, y);
      y += 32;

      // Meta
      doc.fillColor(MUTED).font('Helvetica').fontSize(10).text('N° de facture', LEFT, y);
      doc.fillColor(DARK).font('Helvetica-Bold').text(`#${booking.id}`, LEFT, y, { width: CONTENT_W, align: 'right' });
      y += 14;
      doc.fillColor(MUTED).font('Helvetica').text("Date d'émission", LEFT, y);
      doc.fillColor(DARK).font('Helvetica-Bold').text(fmtDateFR(new Date()), LEFT, y, { width: CONTENT_W, align: 'right' });
      y += 28;

      // CLIENT
      y = sectionTitle(doc, 'CLIENT', LEFT, y);
      const clientLines = [
        { text: `${client.prenom || ''} ${client.nom || ''}`.trim(), bold: true, size: 12 },
        { text: client.email || '', size: 10, color: MUTED },
      ];
      if (client.telephone) clientLines.push({ text: client.telephone, size: 10, color: MUTED });
      y = filledBox(doc, LEFT, y, CONTENT_W, clientLines);

      // VEHICLE
      y = sectionTitle(doc, 'VÉHICULE', LEFT, y);
      const vehicleLines = [
        { text: `${vehicle.marque || ''} ${vehicle.modele || ''}`.trim(), bold: true, size: 12 },
      ];
      const subParts = [];
      if (vehicle.immatriculation) subParts.push(`Immatriculation : ${vehicle.immatriculation}`);
      if (vehicle.categorie) subParts.push(`Catégorie : ${vehicle.categorie}`);
      if (subParts.length) vehicleLines.push({ text: subParts.join('  ·  '), size: 10, color: MUTED });
      y = filledBox(doc, LEFT, y, CONTENT_W, vehicleLines);

      // RENTAL DETAILS
      y = sectionTitle(doc, 'DÉTAILS DE LA LOCATION', LEFT, y);
      y = keyValBox(doc, LEFT, y, CONTENT_W, [
        ['Date de départ', fmtDateFR(dateDepart)],
        ['Date de retour', fmtDateFR(dateRetour)],
        ['Durée', `${jours} jour${jours > 1 ? 's' : ''}`],
      ]);

      // PRICING TABLE
      y = sectionTitle(doc, 'DÉTAIL DU PRIX', LEFT, y);

      const colDesc = LEFT + 12;
      const colDur  = LEFT + CONTENT_W * 0.50;
      const colPrix = LEFT + CONTENT_W * 0.65;
      const innerW  = CONTENT_W - 24;

      // Header row
      doc.rect(LEFT, y, CONTENT_W, 24).fill(SURFACE);
      doc.fillColor(MUTED).font('Helvetica-Bold').fontSize(9);
      doc.text('DESCRIPTION', colDesc, y + 8);
      doc.text('DURÉE', colDur, y + 8);
      doc.text('PRIX/JOUR', colPrix, y + 8);
      doc.text('TOTAL', LEFT + 12, y + 8, { width: innerW, align: 'right' });
      y += 24;

      // Rental row
      doc.fillColor(DARK).font('Helvetica').fontSize(10);
      doc.text('Location véhicule', colDesc, y + 8);
      doc.text(`${jours} j`, colDur, y + 8);
      doc.text(fmtMoney(prixJour), colPrix, y + 8);
      doc.text(fmtMoney(total), LEFT + 12, y + 8, { width: innerW, align: 'right' });
      y += 28;
      doc.moveTo(LEFT, y).lineTo(LEFT + CONTENT_W, y).strokeColor(BORDER).lineWidth(0.5).stroke();

      if (caution > 0) {
        doc.fillColor(DARK).font('Helvetica').fontSize(10);
        doc.text('Caution', colDesc, y + 8);
        doc.text(fmtMoney(caution), LEFT + 12, y + 8, { width: innerW, align: 'right' });
        y += 28;
        doc.moveTo(LEFT, y).lineTo(LEFT + CONTENT_W, y).strokeColor(BORDER).lineWidth(0.5).stroke();
      }

      // TOTAL row
      doc.rect(LEFT, y, CONTENT_W, 36).fill(SURFACE);
      doc.fillColor(DARK).font('Helvetica-Bold').fontSize(11).text('TOTAL TTC', colDesc, y + 13);
      doc.fillColor(ORANGE).font('Helvetica-Bold').fontSize(14)
        .text(fmtMoney(totalTTC), LEFT + 12, y + 11, { width: innerW, align: 'right' });
      y += 44;

      doc.fillColor(MUTED).font('Helvetica').fontSize(8)
        .text('Prix TTC, carburant non inclus.', LEFT, y);
      y += 28;

      // Thanks + footer
      doc.fillColor(DARK).font('Helvetica-Bold').fontSize(12)
        .text('Merci pour votre confiance !', LEFT, y, { width: CONTENT_W, align: 'center' });
      y += 28;
      doc.moveTo(LEFT, y).lineTo(RIGHT, y).strokeColor(BORDER).lineWidth(0.5).stroke();
      y += 10;
      doc.fillColor(MUTED).font('Helvetica').fontSize(9)
        .text("AUTOLOC' · 41 Boulevard Vauban, 59800 Lille", LEFT, y, { width: CONTENT_W, align: 'center' });
      y += 12;
      doc.text('contact@autoloc.fr · 01 23 45 67 89', LEFT, y, { width: CONTENT_W, align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

function sectionTitle(doc, label, x, y) {
  doc.fillColor(MUTED).font('Helvetica-Bold').fontSize(9)
    .text(label, x, y, { characterSpacing: 1.5 });
  return y + 16;
}

function filledBox(doc, x, y, w, lines) {
  const PAD_Y = 12;
  const PAD_X = 14;
  let textH = 0;
  lines.forEach((ln, i) => {
    const size = ln.size || 10;
    textH += size + 4;
  });
  const h = textH + PAD_Y;
  doc.rect(x, y, w, h).fill(SURFACE);
  let cy = y + PAD_Y / 2;
  lines.forEach(ln => {
    const size = ln.size || 10;
    doc.fillColor(ln.color || DARK)
      .font(ln.bold ? 'Helvetica-Bold' : 'Helvetica')
      .fontSize(size)
      .text(ln.text, x + PAD_X, cy, { width: w - PAD_X * 2 });
    cy += size + 4;
  });
  return y + h + 8;
}

function keyValBox(doc, x, y, w, pairs) {
  const PAD_Y = 6;
  const PAD_X = 14;
  const ROW_H = 24;
  const h = pairs.length * ROW_H + PAD_Y;
  let cy = y + PAD_Y / 2;
  pairs.forEach(([k, v], i) => {
    if (i > 0) {
      doc.moveTo(x, cy).lineTo(x + w, cy).strokeColor(BORDER).lineWidth(0.5).stroke();
    }
    doc.fillColor(MUTED).font('Helvetica').fontSize(10).text(k, x + PAD_X, cy + 7);
    doc.fillColor(DARK).font('Helvetica-Bold').text(v, x + PAD_X, cy + 7, { width: w - PAD_X * 2, align: 'right' });
    cy += ROW_H;
  });
  doc.rect(x, y, w, 0).strokeColor(BORDER).lineWidth(0.5).stroke();
  return y + h + 8;
}

module.exports = { generateInvoicePdf };
