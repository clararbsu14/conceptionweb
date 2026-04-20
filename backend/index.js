const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/vehicles',  require('./routes/vehicles'));
app.use('/api/bookings',  require('./routes/bookings'));
app.use('/api/dashboard',       require('./routes/dashboard'));
app.use('/api/admin/dashboard', require('./routes/dashboard'));
app.use('/api/alerts',          require('./routes/alerts'));

// Test de connexion
app.get('/', (req, res) => {
  res.json({ message: 'API Auto loc fonctionne !' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});