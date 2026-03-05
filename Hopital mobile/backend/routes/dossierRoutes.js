const express = require('express');
const router = express.Router();
const { getAll, getById, getByPatient, create, update, remove } = require('../controllers/dossierController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

router.get('/', authMiddleware, getAll);
router.get('/patient/:idPatient', authMiddleware, getByPatient);
router.get('/:id', authMiddleware, getById);

router.post('/', authMiddleware, roleMiddleware('Medecin', 'Secretaire'), create);
router.put('/:id', authMiddleware, roleMiddleware('Medecin', 'Administrateur'), update);
router.delete('/:id', authMiddleware, roleMiddleware('Administrateur'), remove);

module.exports = router;