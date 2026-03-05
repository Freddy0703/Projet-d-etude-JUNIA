const express = require('express');
const router = express.Router();
const {
  getAll, getById, create, update, remove,
  updatePhoto, getHistorique, getConnectes, upload
} = require('../controllers/utilisateurController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Routes spéciales AVANT /:id
router.get('/historique', authMiddleware, roleMiddleware('Administrateur'), getHistorique);
router.get('/connectes', authMiddleware, roleMiddleware('Administrateur'), getConnectes);

router.get('/', authMiddleware, roleMiddleware('Administrateur', 'Secretaire'), getAll);
router.get('/:id', authMiddleware, getById);

// Secrétaire peut créer des médecins, Admin peut créer tous
router.post('/', authMiddleware, roleMiddleware('Administrateur', 'Secretaire'), create);
router.put('/:id', authMiddleware, roleMiddleware('Administrateur', 'Secretaire'), update);
router.delete('/:id', authMiddleware, roleMiddleware('Administrateur'), remove);

// Photo de profil - n'importe quel utilisateur connecté peut changer sa photo
router.put('/:id/photo', authMiddleware, upload.single('photo'), updatePhoto);

module.exports = router;