const db = require('../config/db');

// GET /api/examens?idDossier=x
const getAll = async (req, res) => {
  try {
    let query = `
      SELECT e.*, d.dateCreation, p.nom, p.prenom
      FROM Examen e
      JOIN Dossier d ON e.idDossier = d.idDossier
      JOIN Patient p ON d.idPatient = p.idPatient
    `;
    let params = [];

    if (req.query.idDossier) {
      query += ' WHERE e.idDossier = ?';
      params = [req.query.idDossier];
    }

    query += ' ORDER BY e.dateResultat DESC';
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// GET /api/examens/:id
const getById = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Examen WHERE idExamen = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Examen introuvable.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// POST /api/examens
const create = async (req, res) => {
  const { nom, dateResultat, idDossier } = req.body;
  if (!nom || !idDossier) return res.status(400).json({ message: 'Nom et idDossier requis.' });

  try {
    const [result] = await db.query(
      'INSERT INTO Examen (nom, dateResultat, idDossier) VALUES (?, ?, ?)',
      [nom, dateResultat || null, idDossier]
    );
    res.status(201).json({ message: 'Examen ajouté.', idExamen: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// PUT /api/examens/:id
const update = async (req, res) => {
  const { nom, dateResultat } = req.body;
  try {
    const [result] = await db.query(
      'UPDATE Examen SET nom=?, dateResultat=? WHERE idExamen=?',
      [nom, dateResultat, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Examen introuvable.' });
    res.json({ message: 'Examen modifié.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// DELETE /api/examens/:id
const remove = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM Examen WHERE idExamen = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Examen introuvable.' });
    res.json({ message: 'Examen supprimé.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

module.exports = { getAll, getById, create, update, remove };