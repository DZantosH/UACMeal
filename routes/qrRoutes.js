const express = require('express');
const router = express.Router();
const qrController = require('../controllers/qrController');

router.post('/contar', qrController.contarQrs);
router.post('/comprar', qrController.comprarQr);
router.post('/estado', qrController.estadoQrs);


module.exports = router;
