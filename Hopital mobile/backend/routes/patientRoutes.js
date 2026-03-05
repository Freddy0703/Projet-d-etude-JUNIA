const express = require('express');
const router = express.Router();
const { getAll, getById, create, update, remove } = require('../controllers/patientController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Tous les authentifiés peuvent lire
router.get('/', authMiddleware, getAll);
router.get('/:id', authMiddleware, getById);

// Secrétaire et Médecin peuvent créer
router.post('/', authMiddleware, roleMiddleware('Secretaire'), create);

// Secrétaire, Médecin, Admin peuvent modifier
router.put('/:id', authMiddleware, roleMiddleware('Secretaire', 'Administrateur'), update);

// Secrétaire et Admin peuvent supprimer
router.delete('/:id', authMiddleware, roleMiddleware('Secretaire', 'Administrateur'), remove);

module.exports = router;