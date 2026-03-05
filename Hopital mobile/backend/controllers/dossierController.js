const db = require('../config/db');

// GET /api/dossiers
const getAll = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT d.*, p.nom, p.prenom, p.age, p.sexe
      FROM Dossier d
      JOIN Patient p ON d.idPatient = p.idPatient
      ORDER BY d.dateCreation DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// GET /api/dossiers/:id
const getById = async (req, res) => {
  try {
    const [dossier] = await db.query(`
      SELECT d.*, p.nom, p.prenom, p.age, p.sexe, p.tel, p.nationalite
      FROM Dossier d
      JOIN Patient p ON d.idPatient = p.idPatient
      WHERE d.idDossier = ?
    `, [req.params.id]);

    if (dossier.length === 0) return res.status(404).json({ message: 'Dossier introuvable.' });

    const [examens] = await db.query(
      'SELECT * FROM Examen WHERE idDossier = ? ORDER BY dateResultat DESC',
      [req.params.id]
    );

    res.json({ ...dossier[0], examens });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// GET /api/dossiers/patient/:idPatient
const getByPatient = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM Dossier WHERE idPatient = ? ORDER BY dateCreation DESC',
      [req.params.idPatient]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// POST /api/dossiers
const create = async (req, res) => {
  const { idPatient } = req.body;
  if (!idPatient) return res.status(400).json({ message: 'idPatient requis.' });

  try {
    const dateCreation = new Date().toISOString().split('T')[0];
    const [result] = await db.query(
      'INSERT INTO Dossier (dateCreation, idPatient) VALUES (?, ?)',
      [dateCreation, idPatient]
    );
    res.status(201).json({ message: 'Dossier créé avec succès.', idDossier: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// PUT /api/dossiers/:id
const update = async (req, res) => {
  const { dateCreation } = req.body;
  try {
    const [result] = await db.query(
      'UPDATE Dossier SET dateCreation=? WHERE idDossier=?',
      [dateCreation, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Dossier introuvable.' });
    res.json({ message: 'Dossier mis à jour.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// DELETE /api/dossiers/:id
const remove = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM Dossier WHERE idDossier = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Dossier introuvable.' });
    res.json({ message: 'Dossier supprimé.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

module.exports = { getAll, getById, getByPatient, create, update, remove };