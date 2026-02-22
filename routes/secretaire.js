const express = require('express');
const path = require('path');
const router = express.Router();

module.exports = (db) => {

  // Profil secrétaire
  router.get('/api/secretaire/profile', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'Secretaire') {
      return res.status(403).json({ error: "Accès refusé" });
    }
    res.json(req.session.user);
  });

  // Dashboard secrétaire enrichi
  router.get('/api/secretaire/dashboard', async (req, res) => {
    try {
      if (!req.session.user || req.session.user.role !== 'Secretaire') {
        return res.status(403).json({ error: "Accès refusé" });
      }

      const [patients] = await db.query("SELECT COUNT(*) AS totalPatients FROM Patient");
      const [medecins] = await db.query("SELECT COUNT(*) AS totalMedecins FROM Utilisateur WHERE role='Medecin'");
      const [dossiers] = await db.query("SELECT COUNT(*) AS totalDossiers FROM Dossier");
      const [hommes] = await db.query("SELECT COUNT(*) AS hommes FROM Patient WHERE sexe='Homme'");
      const [femmes] = await db.query("SELECT COUNT(*) AS femmes FROM Patient WHERE sexe='Femme'");
      const [lastPatients] = await db.query("SELECT * FROM Patient ORDER BY idPatient DESC LIMIT 5");

      res.json({
        stats: {
          totalPatients: patients[0].totalPatients,
          totalMedecins: medecins[0].totalMedecins,
          totalDossiers: dossiers[0].totalDossiers,
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
  // Liste des patients
router.get('/api/secretaire/patients', async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM Patient");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur serveur");
  }
});

// Ajouter un patient
router.post('/api/secretaire/patient/add', async (req, res) => {
  try {
    const { nom, prenom, age, tel, sexe, nationalite } = req.body;
    await db.query(
      "INSERT INTO Patient (nom, prenom, age, tel, sexe, nationalite) VALUES (?, ?, ?, ?, ?, ?)",
      [nom, prenom, age, tel, sexe, nationalite]
    );
    res.redirect('/secretaire/patients');
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur serveur");
  }
});

// Modifier un patient
router.post('/api/secretaire/patient/edit/:idPatient', async (req, res) => {
  try {
    const { nom, prenom, age, tel, sexe, nationalite } = req.body;
    await db.query(
      "UPDATE Patient SET nom=?, prenom=?, age=?, tel=?, sexe=?, nationalite=? WHERE idPatient=?",
      [nom, prenom, age, tel, sexe, nationalite, req.params.idPatient]
    );
    res.redirect('/secretaire/patients');
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur serveur");
  }
});

// Supprimer un patient
router.get('/api/secretaire/patient/delete/:idPatient', async (req, res) => {
  try {
    await db.query("DELETE FROM Patient WHERE idPatient=?", [req.params.idPatient]);
    res.redirect('/secretaire/patients');
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur serveur");
  }
});

// Liste des médecins
router.get('/api/secretaire/medecins', async (req, res) => {
  try {
    const [rows] = await db.query("SELECT idUser, prenom, nom, login FROM Utilisateur WHERE role='Medecin'");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur serveur");
  }
});

// Ajouter un médecin
router.post('/api/secretaire/medecin/add', async (req, res) => {
  try {
    const { prenom, nom, login, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    await db.query(
      "INSERT INTO Utilisateur (prenom, nom, login, password, role, statut) VALUES (?, ?, ?, ?, 'Medecin', 'Hors ligne')",
      [prenom, nom, login, hashed]
    );
    res.redirect('/secretaire/medecins');
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur serveur");
  }
});

// Modifier un médecin
router.post('/api/secretaire/medecin/edit/:idUser', async (req, res) => {
  try {
    const { prenom, nom, login } = req.body;
    await db.query(
      "UPDATE Utilisateur SET prenom=?, nom=?, login=? WHERE idUser=? AND role='Medecin'",
      [prenom, nom, login, req.params.idUser]
    );
    res.redirect('/secretaire/medecins');
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur serveur");
  }
});

// Supprimer un médecin
router.get('/api/secretaire/medecin/delete/:idUser', async (req, res) => {
  try {
    await db.query("DELETE FROM Utilisateur WHERE idUser=? AND role='Medecin'", [req.params.idUser]);
    res.redirect('/secretaire/medecins');
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur serveur");
  }
});

const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');

// Config multer pour upload photo
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

// Mise à jour infos secrétaire
router.post('/api/secretaire/update', upload.single('photoProfil'), async (req, res) => {
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

    res.redirect('/secretaire/parametres');
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur serveur");
  }
});

// Changement mot de passe secrétaire
router.post('/api/secretaire/change-password', async (req, res) => {
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


  return router;
};
