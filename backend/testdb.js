const pool = require('./db');

async function test() {
  try {
    const [rows] = await pool.query('SELECT * FROM vehicles');
    console.log('Connexion OK ! Véhicules trouvés :', rows.length);
    process.exit(0);
  } catch (err) {
    console.error('Erreur de connexion :', err.message);
    process.exit(1);
  }
}

test();