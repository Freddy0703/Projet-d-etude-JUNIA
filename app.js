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

app.use('/connexion', connexionRoutes);
app.use('/deconnexion', deconnexionRoutes);


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

const adminRoutes = require('./routes/administrateur')(db);
app.use('/', adminRoutes);


app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
