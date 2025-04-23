const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const db = require('../config/db');

router.post('/login', authController.login);
router.post('/registro', authController.registro);
router.post('/actualizar-datos', authController.actualizarDatos);
router.post('/cambiar-contrasena', authController.cambiarContrasena);

router.post('/verificar', async (req, res) => {
  const { correo, matricula } = req.body;
  try {
    const [usuarios] = await db.execute(
      'SELECT id FROM usuarios WHERE correo = ? OR matricula = ?',
      [correo, matricula]
    );
    res.json({ existe: usuarios.length > 0 });
  } catch (error) {
    console.error('Error en verificación:', error);
    res.status(500).json({ error: 'Error al verificar existencia' });
  }
});

module.exports = router;
