// Run: node scripts/verify-photo-urls.js
// Pulls every photo_url from the vehicles table and reports HTTP status.

const https = require('https');
const db = require('../db');

function head(url) {
  return new Promise((resolve) => {
    const req = https.request(url, { method: 'HEAD', timeout: 8000 }, (res) => {
      resolve(res.statusCode);
    });
    req.on('error', () => resolve('ERR'));
    req.on('timeout', () => { req.destroy(); resolve('TIMEOUT'); });
    req.end();
  });
}

(async () => {
  const [rows] = await db.query('SELECT id, marque, modele, photo_url FROM vehicles ORDER BY id');
  const broken = [];

  for (const v of rows) {
    if (!v.photo_url) {
      console.log(`⚠️  [${v.id}] ${v.marque} ${v.modele} — NO URL`);
      broken.push(v);
      continue;
    }
    const code = await head(v.photo_url);
    const ok = code === 200;
    console.log(`${ok ? '✓ ' : '✗ '} [${v.id}] ${v.marque} ${v.modele} — ${code}`);
    if (!ok) broken.push({ ...v, code });
  }

  console.log(`\n── Summary ──`);
  console.log(`Total: ${rows.length} | OK: ${rows.length - broken.length} | Broken: ${broken.length}`);
  if (broken.length) {
    console.log(`\nBroken vehicles:`);
    broken.forEach(v => console.log(`  - [${v.id}] ${v.marque} ${v.modele} (${v.code || 'no URL'})`));
  }

  process.exit(0);
})();
