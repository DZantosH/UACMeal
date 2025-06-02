const express = require("express");
const router = express.Router();
const pool = require("../config/database");

// Obtener todos los usuarios
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM usuarios");
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
});

// Obtener solo los doctores
router.get("/doctores", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, nombre, apellido_paterno, apellido_materno FROM usuarios WHERE rol = 'Doctor' AND activo = 1"
    );
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener doctores:", error);
    res.status(500).json({ error: "Error al obtener doctores" });
  }
});

// Crear nuevo usuario
router.post("/", async (req, res) => {
  try {
    const {
      nombre,
      apellido_paterno,
      apellido_materno,
      email,
      password,
      rol,
      telefono,
    } = req.body;

    const [result] = await pool.query(
      "INSERT INTO usuarios (nombre, apellido_paterno, apellido_materno, email, password, rol, telefono) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [nombre, apellido_paterno, apellido_materno, email, password, rol, telefono]
    );

    res.status(201).json({ id: result.insertId });
  } catch (error) {
    console.error("Error al crear usuario:", error);
    res.status(500).json({ error: "Error al crear usuario" });
  }
});

module.exports = router;
