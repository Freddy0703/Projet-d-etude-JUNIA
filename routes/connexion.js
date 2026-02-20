const express = require('express');
const bcrypt = require('bcrypt');

module.exports = (db) => {
    const router = express.Router();

    router.get('/', (req, res) => {
        res.sendFile('connexion.html', { root: 'public' });
    });

    router.post('/', async (req, res) => {
        const { login, password } = req.body;

        try {
            const [rows] = await db.query("SELECT * FROM Utilisateur WHERE login = ?", [login]);

            if (rows.length === 0) {
                return res.send("Utilisateur introuvable");
            }

            const user = rows[0];
            const match = await bcrypt.compare(password, user.password);

            if (!match) {
                return res.send("Mot de passe incorrect");
            }

            // Stocker l’utilisateur en session
            req.session.user = {
                id: user.idUser,
                role: user.role,
                prenom: user.prenom,
                nom: user.nom
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
