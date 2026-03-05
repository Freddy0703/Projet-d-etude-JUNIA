const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les photos de profil
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/patients', require('./routes/patientRoutes'));
app.use('/api/dossiers', require('./routes/dossierRoutes'));
app.use('/api/examens', require('./routes/examenRoutes'));
app.use('/api/utilisateurs', require('./routes/utilisateurRoutes'));

// Route test
app.get('/', (req, res) => {
  res.json({
    message: '🏥 Hôpital Moulaye Abdellah - API opérationnelle',
    version: '1.0.0',
    status: 'running'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur le port ${PORT}`);
  console.log(`🌐 http://localhost:${PORT}`);
});