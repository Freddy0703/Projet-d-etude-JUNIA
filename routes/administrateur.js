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
  // Dashboard admin (statistiques + derniers utilisateurs)
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

  // Profil admin (affichage dans paramètres)
  router.get('/api/admin/profile', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'Administrateur') {
      return res.status(403).json({ error: "Accès refusé" });
    }
    res.json(req.session.user);
  });

  // Mise à jour infos admin (nom, prénom, email, photo uploadée)
  router.post('/api/admin/update', upload.single('photoProfil'), async (req, res) => {
    try {
      const prenom = req.body.prenom || req.session.user.prenom;
      const nom = req.body.nom || req.session.user.nom;
      const login = req.body.login || req.session.user.login;

      // Si un fichier est uploadé, on prend son nom, sinon on garde l’ancien ou default.png
      const photoProfil = req.file ? req.file.filename : (req.session.user.photoProfil || 'default.png');

      await db.query(
        "UPDATE Utilisateur SET prenom=?, nom=?, login=?, photoProfil=? WHERE idUser=?",
        [prenom, nom, login, photoProfil, req.session.user.id]
      );

      // Mettre à jour la session
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

  return router;
};
