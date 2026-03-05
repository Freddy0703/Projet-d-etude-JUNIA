const db = require('../config/db');

// GET /api/patients
const getAll = async (req, res) => {
  try {
    const search = req.query.search || '';
    let query = 'SELECT * FROM Patient';
    let params = [];

    if (search) {
      query += ' WHERE nom LIKE ? OR prenom LIKE ? OR tel LIKE ?';
      params = [`%${search}%`, `%${search}%`, `%${search}%`];
    }

    query += ' ORDER BY nom ASC';
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// GET /api/patients/:id
const getById = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Patient WHERE idPatient = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Patient introuvable.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// POST /api/patients
const create = async (req, res) => {
  const { nom, prenom, age, tel, sexe, nationalite } = req.body;
  if (!nom || !prenom || !sexe) {
    return res.status(400).json({ message: 'Nom, prénom et sexe sont requis.' });
  }
  try {
    const [result] = await db.query(
      'INSERT INTO Patient (nom, prenom, age, tel, sexe, nationalite) VALUES (?, ?, ?, ?, ?, ?)',
      [nom, prenom, age || null, tel || null, sexe, nationalite || null]
    );
    res.status(201).json({ message: 'Patient ajouté avec succès.', idPatient: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// PUT /api/patients/:id
const update = async (req, res) => {
  const { nom, prenom, age, tel, sexe, nationalite } = req.body;
  try {
    const [result] = await db.query(
      'UPDATE Patient SET nom=?, prenom=?, age=?, tel=?, sexe=?, nationalite=? WHERE idPatient=?',
      [nom, prenom, age, tel, sexe, nationalite, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Patient introuvable.' });
    res.json({ message: 'Patient modifié avec succès.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// DELETE /api/patients/:id
const remove = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM Patient WHERE idPatient = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Patient introuvable.' });
    res.json({ message: 'Patient supprimé avec succès.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

module.exports = { getAll, getById, create, update, remove };