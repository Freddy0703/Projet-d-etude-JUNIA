const express = require('express');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// Configuration de multer pour upload photo
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../images'));
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

module.exports = (db) => {

  // ---------------- PROFIL ----------------
  router.get('/api/medecin/profile', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'Medecin') {
      return res.status(403).json({ error: "Accès refusé" });
    }
    res.json(req.session.user);
  });

  // ---------------- DASHBOARD ----------------
  router.get('/api/medecin/dashboard', async (req, res) => {
    try {
      if (!req.session.user || req.session.user.role !== 'Medecin') {
        return res.status(403).json({ error: "Accès refusé" });
      }

      const [patients] = await db.query("SELECT COUNT(*) AS totalPatients FROM Patient");
      const [dossiers] = await db.query("SELECT COUNT(*) AS totalDossiers FROM Dossier");
      const [examens] = await db.query("SELECT COUNT(*) AS totalExamens FROM Examen");

      const [hommes] = await db.query("SELECT COUNT(*) AS hommes FROM Patient WHERE sexe='Homme'");
      const [femmes] = await db.query("SELECT COUNT(*) AS femmes FROM Patient WHERE sexe='Femme'");

      const [lastPatients] = await db.query(`
        SELECT Patient.nom, Patient.prenom, Patient.age, Patient.tel, Dossier.idDossier, Dossier.dateCreation
        FROM Patient
        INNER JOIN Dossier ON Patient.idPatient = Dossier.idPatient
        ORDER BY Dossier.idDossier DESC LIMIT 3
      `);

      res.json({
        stats: {
          totalPatients: patients[0].totalPatients,
          totalDossiers: dossiers[0].totalDossiers,
          totalExamens: examens[0].totalExamens,
          hommes: hommes[0].hommes,
          femmes: femmes[0].femmes
        },
        lastPatients: lastPatients
      });
    } catch (err) {
      console.error(err);
      res.status(500).send("Erreur serveur");
    }
  });

  // ---------------- PATIENTS ----------------
  router.get('/api/medecin/patients', async (req, res) => {
    try {
      const [rows] = await db.query("SELECT * FROM Patient");
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).send("Erreur serveur");
    }
  });

  // ---------------- DOSSIERS ----------------
  // Tous les dossiers
  router.get('/api/medecin/dossiers', async (req, res) => {
    try {
      const [rows] = await db.query(`
        SELECT Dossier.idDossier, Dossier.dateCreation, Patient.nom, Patient.prenom
        FROM Dossier
        INNER JOIN Patient ON Dossier.idPatient = Patient.idPatient
      `);
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).send("Erreur serveur");
    }
  });

  // Dossiers d’un patient
  router.get('/api/medecin/dossiers/:idPatient', async (req, res) => {
    try {
      const [rows] = await db.query("SELECT * FROM Dossier WHERE idPatient=?", [req.params.idPatient]);
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).send("Erreur serveur");
    }
  });

  // Ajouter un dossier
  router.post('/api/medecin/dossier/add', async (req, res) => {
    try {
      const { idPatient, dateCreation } = req.body;
      await db.query("INSERT INTO Dossier (dateCreation, idPatient) VALUES (?, ?)", [dateCreation, idPatient]);
      res.redirect('/medecin/dossiers?patient=' + idPatient);
    } catch (err) {
      console.error(err);
      res.status(500).send("Erreur serveur");
    }
  });

  // Mettre à jour un dossier
  router.post('/api/medecin/dossier/update/:idDossier', async (req, res) => {
    try {
      const { dateCreation } = req.body;
      const [rows] = await db.query("SELECT idPatient FROM Dossier WHERE idDossier=?", [req.params.idDossier]);
      const idPatient = rows[0].idPatient;

      await db.query("UPDATE Dossier SET dateCreation=? WHERE idDossier=?", [dateCreation, req.params.idDossier]);
      res.redirect('/medecin/dossiers?patient=' + idPatient);
    } catch (err) {
      console.error(err);
      res.status(500).send("Erreur serveur");
    }
  });

  // Supprimer un dossier
  router.get('/api/medecin/dossier/delete/:idDossier', async (req, res) => {
    try {
      const [rows] = await db.query("SELECT idPatient FROM Dossier WHERE idDossier=?", [req.params.idDossier]);
      const idPatient = rows[0].idPatient;

      await db.query("DELETE FROM Dossier WHERE idDossier=?", [req.params.idDossier]);
      res.redirect('/medecin/dossiers?patient=' + idPatient);
    } catch (err) {
      console.error(err);
      res.status(500).send("Erreur serveur");
    }
  });

  // ---------------- EXAMENS ----------------
  router.get('/api/medecin/examens/:idDossier', async (req, res) => {
    try {
      const [rows] = await db.query("SELECT idExamen, nom, dateResultat FROM Examen WHERE idDossier=?", [req.params.idDossier]);
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).send("Erreur serveur");
    }
  });

  router.post('/api/medecin/examen/add', async (req, res) => {
    try {
      const { nom, dateResultat, idDossier } = req.body;
      await db.query("INSERT INTO Examen (nom, dateResultat, idDossier) VALUES (?, ?, ?)", [nom, dateResultat, idDossier]);
      res.redirect('/medecin/examens/' + idDossier);
    } catch (err) {
      console.error(err);
      res.status(500).send("Erreur serveur");
    }
  });

  router.post('/api/medecin/examen/edit/:id', async (req, res) => {
    try {
      const { nom, dateResultat, idDossier } = req.body;
      await db.query("UPDATE Examen SET nom=?, dateResultat=? WHERE idExamen=?", [nom, dateResultat, req.params.id]);
      res.redirect('/medecin/examens/' + idDossier);
    } catch (err) {
      console.error(err);
      res.status(500).send("Erreur serveur");
    }
  });

  router.get('/api/medecin/examen/delete/:id', async (req, res) => {
    try {
      const dossierId = req.query.dossier;
      await db.query("DELETE FROM Examen WHERE idExamen=?", [req.params.id]);
      res.redirect('/medecin/examens/' + dossierId);
    } catch (err) {
      console.error(err);
      res.status(500).send("Erreur serveur");
    }
  });

  // ---------------- PARAMÈTRES ----------------
  router.post('/api/medecin/update', upload.single('photoProfil'), async (req, res) => {
    try {
      const prenom = req.body.prenom || req.session.user.prenom;
      const nom = req.body.nom || req.session.user.nom;
      const login = req.body.login || req.session.user.login;
      const photoProfil = req.file ? req.file.filename : (req.session.user.photoProfil || 'default.png');

      await db.query("UPDATE Utilisateur SET prenom=?, nom=?, login=?, photoProfil=? WHERE idUser=?", [prenom, nom, login, photoProfil, req.session.user.id]);

      req.session.user.prenom = prenom;
      req.session.user.nom = nom;
      req.session.user.login = login;
      req.session.user.photoProfil = photoProfil;

      res.redirect('/medecin/parametres');
    } catch (err) {
      console.error(err);
      res.status(500).send("Erreur serveur");
    }
  });

    router.post('/api/medecin/change-password', async (req, res) => {
    try {
      const { currentPassword, newPassword, confirmPassword } = req.body;

      // Récupérer l'utilisateur connecté
      const [rows] = await db.query("SELECT * FROM Utilisateur WHERE idUser=?", [req.session.user.id]);
      const user = rows[0];

      // Vérifier mot de passe actuel
      const match = await bcrypt.compare(currentPassword, user.password);
      if (!match) return res.send("Mot de passe actuel incorrect");

      // Vérifier confirmation
      if (newPassword !== confirmPassword) return res.send("Les mots de passe ne correspondent pas");

      // Hasher et mettre à jour
      const hashed = await bcrypt.hash(newPassword, 10);
      await db.query("UPDATE Utilisateur SET password=? WHERE idUser=?", [hashed, req.session.user.id]);

      res.send("Mot de passe changé avec succès");
    } catch (err) {
      console.error(err);
      res.status(500).send("Erreur serveur");
    }
  });
  return router;
};
