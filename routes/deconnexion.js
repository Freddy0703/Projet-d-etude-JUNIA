const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    req.session.destroy(() => {
        res.sendFile('deconnexion.html', { root: 'public' });
    });
});

module.exports = router;
