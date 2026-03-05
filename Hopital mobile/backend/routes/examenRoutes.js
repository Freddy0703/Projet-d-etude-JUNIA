const express = require('express');
const router = express.Router();
const { getAll, getById, create, update, remove } = require('../controllers/examenController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

router.get('/', authMiddleware, getAll);
router.get('/:id', authMiddleware, getById);

router.post('/', authMiddleware, roleMiddleware('Medecin'), create);
router.put('/:id', authMiddleware, roleMiddleware('Medecin'), update);
router.delete('/:id', authMiddleware, roleMiddleware('Medecin', 'Administrateur'), remove);

module.exports = router;