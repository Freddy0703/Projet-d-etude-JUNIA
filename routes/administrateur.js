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
      const [rows] = await db.query("SELECT prenom, nom, login, role, photoProfil FROM Utilisateur");
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).send("Erreur serveur");
    }
  });

    // Récupérer tous les patients
  router.get('/api/admin/patients', async (req, res) => {
    try {
      const [rows] = await db.query("SELECT * FROM Patient");
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).send("Erreur serveur");
    }
  });

  // Modifier un patient (formulaire ou API)
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

  // Supprimer un patient
  router.get('/api/admin/patient/delete/:id', async (req, res) => {
    try {
      await db.query("DELETE FROM Patient WHERE idPatient=?", [req.params.id]);
      res.redirect('/administrateur/patients');
    } catch (err) {
      console.error(err);
      res.status(500).send("Erreur serveur");
    }
  });

    // Récupérer tous les patients
  router.get('/api/admin/patients', async (req, res) => {
    try {
      const [rows] = await db.query("SELECT * FROM Patient");
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).send("Erreur serveur");
    }
  });

  // Afficher le formulaire de modification
  router.get('/administrateur/patient-edit/:id', async (req, res) => {
    try {
      const [rows] = await db.query("SELECT * FROM Patient WHERE idPatient=?", [req.params.id]);
      const patient = rows[0];
      res.send(`
  <style>
    /* CSS pour le formulaire de modification patient */
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: linear-gradient(135deg, #f5f9ff 0%, #ecf3fe 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0;
      padding: 20px;
    }

    .edit-patient-container {
      background: white;
      border-radius: 42px;
      padding: 2.5rem;
      max-width: 600px;
      width: 100%;
      box-shadow: 0 30px 60px -25px rgba(8, 30, 70, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(2px);
      animation: slideIn 0.3s ease;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    h3 {
      font-size: 2rem;
      font-weight: 700;
      color: #142b50;
      margin-bottom: 2rem;
      display: flex;
      align-items: center;
      gap: 12px;
      border-bottom: 2px solid #eef2f8;
      padding-bottom: 1.2rem;
    }

    h3:before {
      content: '✏️';
      font-size: 1.8rem;
      background: #e7f0ff;
      padding: 12px;
      border-radius: 30px;
      color: #2563eb;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 54px;
      height: 54px;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 1.2rem;
      margin-bottom: 2rem;
    }

    label {
      font-weight: 600;
      color: #1e3f78;
      font-size: 0.95rem;
      letter-spacing: 0.3px;
      display: block;
      margin-bottom: 0.3rem;
    }

    input, select {
      width: 100%;
      padding: 0.9rem 1.2rem;
      border: 2px solid #e2ecfd;
      border-radius: 24px;
      font-size: 1rem;
      font-weight: 500;
      color: #1e3a5f;
      background: #fbfdff;
      transition: all 0.2s;
      box-sizing: border-box;
    }

    input:focus, select:focus {
      outline: none;
      border-color: #2563eb;
      box-shadow: 0 0 0 5px rgba(37, 99, 235, 0.15);
      background: white;
    }

    input:hover, select:hover {
      border-color: #9bb9f0;
    }

    select {
      appearance: none;
      -webkit-appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%234a6085' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: calc(100% - 20px) center;
      background-size: 16px;
      padding-right: 45px;
    }

    button[type="submit"] {
      background: linear-gradient(145deg, #1e3f78, #153a6b);
      color: white;
      border: none;
      border-radius: 60px;
      padding: 1rem 2rem;
      font-weight: 700;
      font-size: 1.1rem;
      letter-spacing: 0.3px;
      cursor: pointer;
      box-shadow: 0 15px 25px -8px #0b2a4e;
      transition: all 0.2s;
      margin-top: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
    }

    button[type="submit"]:hover {
      background: linear-gradient(145deg, #153568, #0e2a52);
      transform: translateY(-4px);
      box-shadow: 0 22px 30px -10px #0b1f38;
    }

    button[type="submit"]:after {
      content: '✓';
      font-size: 1.3rem;
      opacity: 0.9;
    }

    a {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: #f0f5ff;
      color: #1e3f78;
      text-decoration: none;
      padding: 0.9rem 1.8rem;
      border-radius: 50px;
      font-weight: 600;
      border: 1.5px solid #dae3f2;
      transition: all 0.2s;
      width: fit-content;
    }

    a:hover {
      background: #2563eb;
      color: white;
      border-color: #2563eb;
      transform: translateY(-3px);
      box-shadow: 0 12px 22px -8px #1e3a8a80;
    }

    a:before {
      content: '←';
      font-size: 1.2rem;
      font-weight: 600;
    }

    input:required, select:required {
      border-left: 4px solid #2563eb;
    }

    .form-info {
      background: #edf3ff;
      border-radius: 16px;
      padding: 0.8rem 1.2rem;
      font-size: 0.9rem;
      color: #1f4885;
      margin-top: 1rem;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .form-info i {
      font-style: normal;
      font-size: 1.2rem;
    }

    @media (max-width: 650px) {
      .edit-patient-container {
        padding: 1.8rem;
      }
      
      h3 {
        font-size: 1.6rem;
      }
      
      h3:before {
        width: 44px;
        height: 44px;
        font-size: 1.4rem;
      }
      
      button[type="submit"] {
        padding: 0.8rem 1.5rem;
      }
    }
  </style>

  <div class="edit-patient-container">
    <h3>Modifier Patient</h3>
    <form action="/api/admin/patient/edit/${patient.idPatient}" method="POST">
      <div>
        <label>Nom</label>
        <input type="text" name="nom" value="${patient.nom}" required>
      </div>
      <div>
        <label>Prénom</label>
        <input type="text" name="prenom" value="${patient.prenom}" required>
      </div>
      <div>
        <label>Âge</label>
        <input type="number" name="age" value="${patient.age}" min="0" max="150">
      </div>
      <div>
        <label>Téléphone</label>
        <input type="text" name="tel" value="${patient.tel}" placeholder="+33 6 12 34 56 78">
      </div>
      <div>
        <label>Sexe</label>
        <select name="sexe" required>
          <option value="Homme" ${patient.sexe === 'Homme' ? 'selected' : ''}>Homme</option>
          <option value="Femme" ${patient.sexe === 'Femme' ? 'selected' : ''}>Femme</option>
        </select>
      </div>
      <div>
        <label>Nationalité</label>
        <input type="text" name="nationalite" value="${patient.nationalite}" placeholder="Française">
      </div>
      <button type="submit">Enregistrer</button>
    </form>
    
    <a href="/administrateur/patients">Retour Liste Patients</a>
    
    <div class="form-info">
      <i>ℹ️</i> Tous les champs marqués d'une bordure bleue sont obligatoires
    </div>
  </div>
`);
    } catch (err) {
      console.error(err);
      res.status(500).send("Erreur serveur");
    }
  });

  // Modifier un patient
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

  // Supprimer un patient
  router.get('/api/admin/patient/delete/:id', async (req, res) => {
    try {
      await db.query("DELETE FROM Patient WHERE idPatient=?", [req.params.id]);
      res.redirect('/administrateur/patients');
    } catch (err) {
      console.error(err);
      res.status(500).send("Erreur serveur");
    }
  });

    // Récupérer tous les dossiers avec patient associé
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

  // Voir les examens d’un dossier
  router.get('/api/admin/examens/:idDossier', async (req, res) => {
    try {
      const [rows] = await db.query(`
        SELECT Examen.idExamen, Examen.nom, Examen.dateResultat
        FROM Examen
        WHERE Examen.idDossier = ?
      `, [req.params.idDossier]);
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).send("Erreur serveur");
    }
  });

    // Récupérer les examens d’un dossier
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

  // Modifier un examen
  router.post('/api/admin/examen/edit/:id', async (req, res) => {
    try {
      const { nom, dateResultat } = req.body;
      await db.query(
        "UPDATE Examen SET nom=?, dateResultat=? WHERE idExamen=?",
        [nom, dateResultat, req.params.id]
      );
      res.redirect('/administrateur/examens?idDossier=' + req.body.idDossier);
    } catch (err) {
      console.error(err);
      res.status(500).send("Erreur serveur");
    }
  });

  // Supprimer un examen
  router.get('/api/admin/examen/delete/:id', async (req, res) => {
    try {
      await db.query("DELETE FROM Examen WHERE idExamen=?", [req.params.id]);
      res.redirect('/administrateur/dossiers');
    } catch (err) {
      console.error(err);
      res.status(500).send("Erreur serveur");
    }
  });

    // Récupérer l'historique des connexions
  router.get('/api/admin/historique', async (req, res) => {
    try {
      const [rows] = await db.query(`
        SELECT Utilisateur.prenom, Utilisateur.nom, Utilisateur.role, HistoriqueConnexion.action, HistoriqueConnexion.dateAction
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
