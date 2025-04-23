const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/datos', authMiddleware, async (req, res) => {
  const [rows] = await db.execute('SELECT nombre, matricula, saldo FROM usuarios WHERE id = ?', [req.user.id]);
  res.json(rows[0]);
});

module.exports = router;
