require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());

// Stripe webhook needs the raw body for signature verification — must be mounted BEFORE express.json()
const paymentRouter = require('./routes/payment');
app.post('/api/payment/webhook', express.raw({ type: 'application/json' }), paymentRouter.webhookHandler);

app.use(express.json());

// Static uploads (inspection photos)
app.use('/uploads', express.static(require('path').join(__dirname, 'uploads'), {
  maxAge: '7d',
  fallthrough: false,
}));

// Routes
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/vehicles',  require('./routes/vehicles'));
app.use('/api/bookings',        require('./routes/bookings'));
app.use('/api/admin/bookings',  require('./routes/bookings'));
app.use('/api/dashboard',       require('./routes/dashboard'));
app.use('/api/admin/dashboard', require('./routes/dashboard'));
app.use('/api/alerts',          require('./routes/alerts'));
app.use('/api/payment',         paymentRouter);
app.use('/api/inspections',     require('./routes/inspections'));
app.use('/api/admin/sinistres', require('./routes/sinistres'));
app.use('/api/sinistres',       require('./routes/sinistres'));

// Test de connexion
app.get('/', (req, res) => {
  res.json({ message: 'API Auto loc fonctionne !' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});