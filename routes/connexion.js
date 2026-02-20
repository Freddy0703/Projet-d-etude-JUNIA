const express = require('express');
const bcrypt = require('bcrypt');

module.exports = (db) => {
    const router = express.Router();

    // Affichage du formulaire
    router.get('/', (req, res) => {
        res.sendFile('connexion.html', { root: 'public' });
    });

    // Traitement du formulaire
    router.post('/', async (req, res) => {
        const { login, password } = req.body;

        try {
            const [rows] = await db.query("SELECT * FROM Utilisateur WHERE login = ?", [login]);

            if (rows.length === 0) {
                return res.send("Utilisateur introuvable");
            }

            const user = rows[0];

            // Correction : transformer $2y$ en $2b$ pour compatibilité NodeJS
            const hash = user.password.replace(/^\$2y\$/, '$2b$');

            const match = await bcrypt.compare(password, hash);

            if (!match) {
                return res.send("Mot de passe incorrect");
            }

            // Stocker l’utilisateur en session
            req.session.user = {
                id: user.idUser,
                role: user.role,
                prenom: user.prenom,
                nom: user.nom,
                login: user.login, // email
                photoProfil: user.photoProfil ? user.photoProfil : 'default.png'
            };


            // Redirection selon le rôle
            if (user.role === 'Administrateur') {
                res.redirect('/administrateur/dashboard');
            } else if (user.role === 'Secretaire') {
                res.redirect('/secretaire/dashboard');
            } else if (user.role === 'Medecin') {
                res.redirect('/medecin/dashboard');
            } else {
                res.redirect('/connexion');
            }

        } catch (err) {
            console.error(err);
            res.send("Erreur serveur");
        }
    });

    return router;
};
