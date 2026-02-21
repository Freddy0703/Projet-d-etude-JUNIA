const express = require('express');
const session = require('express-session');
const path = require('path');
const mysql = require('mysql2/promise');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));

// Sessions
app.use(session({
    secret: 'secretKeyHopital',
    resave: false,
    saveUninitialized: true
}));

// Connexion MySQL
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '', 
    database: 'hopital_db'
});

app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
});

function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }
    res.redirect('/connexion');
}

const connexionRoutes = require('./routes/connexion')(db);
const deconnexionRoutes = require('./routes/deconnexion');
const adminRoutes = require('./routes/administrateur')(db);

app.use('/connexion', connexionRoutes);
app.use('/deconnexion', deconnexionRoutes);
app.use('/', adminRoutes);

app.get('/', (req, res) => {
    res.redirect('/connexion');
});

app.get('/administrateur/dashboard', isAuthenticated, (req, res) => {
    if (req.session.user.role === 'Administrateur') {
        res.sendFile(path.join(__dirname, 'administrateur/dashboard.html'));
    } else {
        res.redirect('/connexion');
    }
});

app.get('/secretaire/dashboard', isAuthenticated, (req, res) => {
    if (req.session.user.role === 'Secretaire') {
        res.sendFile(path.join(__dirname, 'secretaire/dashboard.html'));
    } else {
        res.redirect('/connexion');
    }
});

app.get('/medecin/dashboard', isAuthenticated, (req, res) => {
    if (req.session.user.role === 'Medecin') {
        res.sendFile(path.join(__dirname, 'medecin/dashboard.html'));
    } else {
        res.redirect('/connexion');
    }
});

app.get('/administrateur/parametres', isAuthenticated, (req, res) => {
  if (req.session.user.role === 'Administrateur') {
    res.sendFile(path.join(__dirname, 'administrateur/parametres.html'));
  } else {
    res.redirect('/connexion');
  }
});

app.get('/administrateur/utilisateurs', isAuthenticated, (req, res) => {
  if (req.session.user.role === 'Administrateur') {
    res.sendFile(path.join(__dirname, 'administrateur/utilisateurs.html'));
  } else {
    res.redirect('/connexion');
  }
});

app.get('/administrateur/utilisateurs-list', isAuthenticated, (req, res) => {
  if (req.session.user.role === 'Administrateur') {
    res.sendFile(path.join(__dirname, 'administrateur/utilisateurs-list.html'));
  } else {
    res.redirect('/connexion');
  }
});

app.get('/administrateur/patients', isAuthenticated, (req, res) => {
  if (req.session.user.role === 'Administrateur') {
    res.sendFile(path.join(__dirname, 'administrateur/patients.html'));
  } else {
    res.redirect('/connexion');
  }
});

app.get('/administrateur/dossiers', isAuthenticated, (req, res) => {
  if (req.session.user.role === 'Administrateur') {
    res.sendFile(path.join(__dirname, 'administrateur/dossiers.html'));
  } else {
    res.redirect('/connexion');
  }
});


app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
