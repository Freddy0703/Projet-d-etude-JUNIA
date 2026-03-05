const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// POST /api/auth/login
const login = async (req, res) => {
  const { login, password } = req.body;

  if (!login || !password) {
    return res.status(400).json({ message: 'Login et mot de passe requis.' });
  }

  try {
    const [rows] = await db.query('SELECT * FROM Utilisateur WHERE login = ?', [login]);

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Identifiants incorrects.' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Identifiants incorrects.' });
    }

    // Mise à jour statut + dateConnexion
    const now = new Date();
    await db.query(
      'UPDATE Utilisateur SET statut = "En ligne", dateConnexion = ? WHERE idUser = ?',
      [now, user.idUser]
    );

    // Historique connexion
    await db.query(
      'INSERT INTO HistoriqueConnexion (idUser, action, dateAction) VALUES (?, "Connexion", ?)',
      [user.idUser, now]
    );

    const token = jwt.sign(
      { idUser: user.idUser, login: user.login, role: user.role, nom: user.nom, prenom: user.prenom },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Connexion réussie',
      token,
      user: {
        idUser: user.idUser,
        prenom: user.prenom,
        nom: user.nom,
        login: user.login,
        role: user.role,
        photoProfil: user.photoProfil
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// POST /api/auth/logout
const logout = async (req, res) => {
  const { idUser } = req.user;

  try {
    const now = new Date();
    await db.query(
      'UPDATE Utilisateur SET statut = "Hors ligne", dateDeconnexion = ? WHERE idUser = ?',
      [now, idUser]
    );

    await db.query(
      'INSERT INTO HistoriqueConnexion (idUser, action, dateAction) VALUES (?, "Deconnexion", ?)',
      [idUser, now]
    );

    res.json({ message: 'Déconnexion réussie.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// GET /api/auth/me
const me = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT idUser, prenom, nom, login, role, statut, dateConnexion, photoProfil FROM Utilisateur WHERE idUser = ?',
      [req.user.idUser]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Utilisateur introuvable.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// PUT /api/auth/change-password
const changePassword = async (req, res) => {
  const { ancienPassword, nouveauPassword } = req.body;
  const { idUser } = req.user;

  try {
    const [rows] = await db.query('SELECT * FROM Utilisateur WHERE idUser = ?', [idUser]);
    if (rows.length === 0) return res.status(404).json({ message: 'Utilisateur introuvable.' });

    const isMatch = await bcrypt.compare(ancienPassword, rows[0].password);
    if (!isMatch) return res.status(400).json({ message: 'Ancien mot de passe incorrect.' });

    const hash = await bcrypt.hash(nouveauPassword, 10);
    await db.query('UPDATE Utilisateur SET password = ? WHERE idUser = ?', [hash, idUser]);

    res.json({ message: 'Mot de passe modifié avec succès.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

module.exports = { login, logout, me, changePassword };