const db = require('../config/db');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Config multer pour photo profil
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `user_${Date.now()}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Fichier doit être une image'));
  }
});

// GET /api/utilisateurs
const getAll = async (req, res) => {
  try {
    let query = 'SELECT idUser, prenom, nom, login, role, statut, dateConnexion, dateDeconnexion, photoProfil FROM Utilisateur';
    let params = [];

    if (req.query.role) {
      query += ' WHERE role = ?';
      params = [req.query.role];
    }

    query += ' ORDER BY nom ASC';
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// GET /api/utilisateurs/:id
const getById = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT idUser, prenom, nom, login, role, statut, dateConnexion, dateDeconnexion, photoProfil FROM Utilisateur WHERE idUser = ?',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Utilisateur introuvable.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// POST /api/utilisateurs
const create = async (req, res) => {
  const { prenom, nom, login, password, role } = req.body;

  if (!prenom || !nom || !login || !password || !role) {
    return res.status(400).json({ message: 'Tous les champs sont requis.' });
  }

  try {
    const [existing] = await db.query('SELECT idUser FROM Utilisateur WHERE login = ?', [login]);
    if (existing.length > 0) return res.status(409).json({ message: 'Login déjà utilisé.' });

    const hash = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO Utilisateur (prenom, nom, login, password, role) VALUES (?, ?, ?, ?, ?)',
      [prenom, nom, login, hash, role]
    );

    res.status(201).json({ message: 'Utilisateur créé avec succès.', idUser: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// PUT /api/utilisateurs/:id
const update = async (req, res) => {
  const { prenom, nom, login, role } = req.body;
  try {
    const [result] = await db.query(
      'UPDATE Utilisateur SET prenom=?, nom=?, login=?, role=? WHERE idUser=?',
      [prenom, nom, login, role, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Utilisateur introuvable.' });
    res.json({ message: 'Utilisateur modifié.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// DELETE /api/utilisateurs/:id
const remove = async (req, res) => {
  try {
    // Ne pas supprimer soi-même
    if (parseInt(req.params.id) === req.user.idUser) {
      return res.status(400).json({ message: 'Vous ne pouvez pas supprimer votre propre compte.' });
    }
    const [result] = await db.query('DELETE FROM Utilisateur WHERE idUser = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Utilisateur introuvable.' });
    res.json({ message: 'Utilisateur supprimé.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// PUT /api/utilisateurs/:id/photo
const updatePhoto = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Aucune image fournie.' });

    // Récupérer l'ancienne photo
    const [rows] = await db.query('SELECT photoProfil FROM Utilisateur WHERE idUser = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Utilisateur introuvable.' });

    const oldPhoto = rows[0].photoProfil;
    if (oldPhoto && oldPhoto !== 'default.png') {
      const oldPath = path.join(__dirname, '../uploads', oldPhoto);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    await db.query('UPDATE Utilisateur SET photoProfil = ? WHERE idUser = ?', [req.file.filename, req.params.id]);
    res.json({ message: 'Photo mise à jour.', photoProfil: req.file.filename });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// GET /api/utilisateurs/historique
const getHistorique = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT h.*, u.prenom, u.nom, u.role
      FROM HistoriqueConnexion h
      JOIN Utilisateur u ON h.idUser = u.idUser
      ORDER BY h.dateAction DESC
      LIMIT 100
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// GET /api/utilisateurs/connectes
const getConnectes = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT idUser, prenom, nom, role, statut, dateConnexion, photoProfil FROM Utilisateur WHERE statut = "En ligne"'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

module.exports = { getAll, getById, create, update, remove, updatePhoto, getHistorique, getConnectes, upload };