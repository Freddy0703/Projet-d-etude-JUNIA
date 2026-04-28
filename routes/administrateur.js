const express = require('express');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// Configuration de multer pour stocker les fichiers uploadés dans /images
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
  // Dashboard admin
  router.get('/api/admin/dashboard', async (req, res) => {
    try {
      if (!req.session.user || req.session.user.role !== 'Administrateur') {
        return res.status(403).json({ error: "Accès refusé" });
      }

      const [patients] = await db.query("SELECT COUNT(*) AS totalPatients FROM Patient");
      const [medecins] = await db.query("SELECT COUNT(*) AS totalMedecins FROM Utilisateur WHERE role='Medecin'");
      const [secretaires] = await db.query("SELECT COUNT(*) AS totalSecretaires FROM Utilisateur WHERE role='Secretaire'");
      const [dossiers] = await db.query("SELECT COUNT(*) AS totalDossiers FROM Dossier");

      const [lastMedecins] = await db.query("SELECT prenom, nom, login, dateConnexion FROM Utilisateur WHERE role='Medecin' ORDER BY idUser DESC LIMIT 3");
      const [lastSecretaires] = await db.query("SELECT prenom, nom, login, dateConnexion FROM Utilisateur WHERE role='Secretaire' ORDER BY idUser DESC LIMIT 3");

      res.json({
        user: req.session.user,
        stats: {
          totalPatients: patients[0].totalPatients,
          totalMedecins: medecins[0].totalMedecins,
          totalSecretaires: secretaires[0].totalSecretaires,
          totalDossiers: dossiers[0].totalDossiers
        },
        medecins: lastMedecins,
        secretaires: lastSecretaires
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // Profil admin
  router.get('/api/admin/profile', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'Administrateur') {
      return res.status(403).json({ error: "Accès refusé" });
    }
    res.json(req.session.user);
  });

  // Mise à jour infos admin
  router.post('/api/admin/update', upload.single('photoProfil'), async (req, res) => {
    try {
      const prenom = req.body.prenom || req.session.user.prenom;
      const nom = req.body.nom || req.session.user.nom;
      const login = req.body.login || req.session.user.login;
      const photoProfil = req.file ? req.file.filename : (req.session.user.photoProfil || 'default.png');

      await db.query(
        "UPDATE Utilisateur SET prenom=?, nom=?, login=?, photoProfil=? WHERE idUser=?",
        [prenom, nom, login, photoProfil, req.session.user.id]
      );

      req.session.user.prenom = prenom;
      req.session.user.nom = nom;
      req.session.user.login = login;
      req.session.user.photoProfil = photoProfil;

      res.redirect('/administrateur/parametres');
    } catch (err) {
      console.error(err);
      res.status(500).send("Erreur serveur");
    }
  });

  // Changement mot de passe admin
  router.post('/api/admin/change-password', async (req, res) => {
    try {
      const { currentPassword, newPassword, confirmPassword } = req.body;
      const [rows] = await db.query("SELECT * FROM Utilisateur WHERE idUser=?", [req.session.user.id]);
      const user = rows[0];

      const match = await bcrypt.compare(currentPassword, user.password);
      if (!match) return res.send("Mot de passe actuel incorrect");
      if (newPassword !== confirmPassword) return res.send("Les mots de passe ne correspondent pas");

      const hashed = await bcrypt.hash(newPassword, 10);
      await db.query("UPDATE Utilisateur SET password=? WHERE idUser=?", [hashed, req.session.user.id]);

      res.send("Mot de passe changé avec succès");
    } catch (err) {
      console.error(err);
      res.status(500).send("Erreur serveur");
    }
  });

  // Ajouter un utilisateur
  router.post('/api/admin/add-user', upload.single('photoProfil'), async (req, res) => {
    try {
      const { prenom, nom, login, password, role } = req.body;
      const photoProfil = req.file ? req.file.filename : 'default.png';
      const hashed = await bcrypt.hash(password, 10);

      await db.query(
        "INSERT INTO Utilisateur (prenom, nom, login, password, role, photoProfil) VALUES (?, ?, ?, ?, ?, ?)",
        [prenom, nom, login, hashed, role, photoProfil]
      );

      res.redirect('/administrateur/utilisateurs');
    } catch (err) {
      console.error(err);
      res.status(500).send("Erreur serveur");
    }
  });

  // Récupérer tous les utilisateurs
  router.get('/api/admin/users', async (req, res) => {
    try {
      const [rows] = await db.query("SELECT idUser, prenom, nom, login, role, photoProfil FROM Utilisateur");
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).send("Erreur serveur");
    }
  });

  // Supprimer définitivement un utilisateur
  router.get('/api/admin/user/delete/:idUser', async (req, res) => {
    try {
      await db.query("DELETE FROM Utilisateur WHERE idUser=?", [req.params.idUser]);
      res.redirect('/administrateur/utilisateurs-list');
    } catch (err) {
      console.error(err);
      res.status(500).send("Erreur serveur");
    }
  });

  // Patients
  router.get('/api/admin/patients', async (req, res) => {
    try {
      const [rows] = await db.query("SELECT * FROM Patient");
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).send("Erreur serveur");
    }
  });

  router.post('/api/admin/patient/edit/:id', async (req, res) => {
    try {
      const { nom, prenom, age, tel, sexe, nationalite } = req.body;
      await db.query(
        "UPDATE Patient SET nom=?, prenom=?, age=?, tel=?, sexe=?, nationalite=? WHERE idPatient=?",
        [nom, prenom, age, tel, sexe, nationalite, req.params.id]
      );
      res.redirect('/administrateur/patients');
    } catch (err) {
      console.error(err);
      res.status(500).send("Erreur serveur");
    }
  });

  router.get('/api/admin/patient/delete/:id', async (req, res) => {
    try {
      await db.query("DELETE FROM Patient WHERE idPatient=?", [req.params.id]);
      res.redirect('/administrateur/patients');
    } catch (err) {
      console.error(err);
      res.status(500).send("Erreur serveur");
    }
  });

  // Dossiers
  router.get('/api/admin/dossiers', async (req, res) => {
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

  // Examens
  router.get('/api/admin/examens/:idDossier', async (req, res) => {
    try {
      const [rows] = await db.query(
        "SELECT idExamen, nom, dateResultat FROM Examen WHERE idDossier=?",
        [req.params.idDossier]
      );
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).send("Erreur serveur");
    }
  });

  router.post('/api/admin/examen/edit/:id', async (req, res) => {
    try {
      const { nom, dateResultat, idDossier } = req.body;
      await db.query(
        "UPDATE Examen SET nom=?, dateResultat=? WHERE idExamen=?",
        [nom, dateResultat, req.params.id]
      );
      res.redirect('/administrateur/examens/' + idDossier);
    } catch (err) {
      console.error(err);
      res.status(500).send("Erreur serveur");
    }
  });

    router.get('/api/admin/examen/delete/:id', async (req, res) => {
    try {
      await db.query("DELETE FROM Examen WHERE idExamen=?", [req.params.id]);
      res.redirect('/administrateur/dossiers');
    } catch (err) {
      console.error(err);
      res.status(500).send("Erreur serveur");
    }
  });

  // Historique des connexions
  router.get('/api/admin/historique', async (req, res) => {
    try {
      const [rows] = await db.query(`
        SELECT Utilisateur.prenom, Utilisateur.nom, Utilisateur.role,
               HistoriqueConnexion.action, HistoriqueConnexion.dateAction
        FROM HistoriqueConnexion
        INNER JOIN Utilisateur ON HistoriqueConnexion.idUser = Utilisateur.idUser
        ORDER BY HistoriqueConnexion.dateAction DESC
      `);
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).send("Erreur serveur");
    }
  });

  return router;
};
