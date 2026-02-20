const express = require('express');
const router = express.Router();

module.exports = (db) => {
  // API pour le dashboard admin
  router.get('/api/admin/dashboard', async (req, res) => {
    try {
      // Vérifier que l'utilisateur est connecté
      if (!req.session.user || req.session.user.role !== 'Administrateur') {
        return res.status(403).json({ error: "Accès refusé" });
      }

      const [patients] = await db.query("SELECT COUNT(*) AS totalPatients FROM Patient");
      const [medecins] = await db.query("SELECT COUNT(*) AS totalMedecins FROM Utilisateur WHERE role='Medecin'");
      const [secretaires] = await db.query("SELECT COUNT(*) AS totalSecretaires FROM Utilisateur WHERE role='Secretaire'");
      const [dossiers] = await db.query("SELECT COUNT(*) AS totalDossiers FROM Dossier");

      const [lastMedecins] = await db.query("SELECT * FROM Utilisateur WHERE role='Medecin' ORDER BY idUser DESC LIMIT 3");
      const [lastSecretaires] = await db.query("SELECT * FROM Utilisateur WHERE role='Secretaire' ORDER BY idUser DESC LIMIT 3");

      res.json({
        user: req.session.user, // infos de l'admin connecté
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

  return router;
};
