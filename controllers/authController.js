const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dominiosPermitidos = ['alumnos.uacm.edu.mx', 'estudiantes.uacm.edu.mx'];

const esCorreoValido = (correo) => {
  const dominioCorreo = correo.split('@')[1];
  return dominiosPermitidos.includes(dominioCorreo);
};

exports.registro = async (req, res) => {
  const {
    nombres,
    apellido_paterno,
    apellido_materno,
    matricula,
    correo,
    contrasena
  } = req.body;

  try {
    // Validar dominio del correo
    if (!esCorreoValido(correo)) {
      return res.status(400).json({ message: 'Solo se permiten correos institucionales de la UACM.' });
    }

    // Verificar si ya existe el correo o matrícula
    const [existe] = await db.execute(
      'SELECT id FROM usuarios WHERE correo = ? OR matricula = ?',
      [correo, matricula]
    );
    if (existe.length > 0) {
      return res.status(400).json({ message: 'Correo o matrícula ya registrados.' });
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    // Insertar en la base de datos
    await db.execute(
      'INSERT INTO usuarios (nombres, apellido_paterno, apellido_materno, matricula, correo, contrasena) VALUES (?, ?, ?, ?, ?, ?)',
      [nombres, apellido_paterno, apellido_materno, matricula, correo, hashedPassword]
    );

    res.json({ message: 'Usuario registrado exitosamente' });
  } catch (error) {
    console.error('Error al registrar:', error);
    res.status(500).json({ error: 'Error al registrar el usuario' });
  }
};


exports.login = async (req, res) => {
  const { matricula, contrasena } = req.body;

  try {
    const [usuarios] = await db.execute('SELECT * FROM usuarios WHERE matricula = ?', [matricula]);
    if (usuarios.length === 0) {
      return res.status(400).json({ message: 'Matrícula o contraseña incorrecta' });
    }

    const usuario = usuarios[0];
    const esValida = await bcrypt.compare(contrasena, usuario.contrasena);

    if (!esValida) {
      return res.status(400).json({ message: 'Matrícula o contraseña incorrecta' });
    }

    // Todo bien, generar token y enviar datos
    const token = jwt.sign({ id: usuario.id, matricula: usuario.matricula }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({
      token,
      usuario: {
        id: usuario.id,
        nombres: usuario.nombres,
        apellido_paterno: usuario.apellido_paterno,
        matricula: usuario.matricula,
        saldo: usuario.saldo
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error al iniciar sesión.' });
  }
};


exports.cambiarContrasena = async (req, res) => {
  const { matricula, contrasenaActual, nuevaContrasena } = req.body;

  try {
    // Buscar usuario por matrícula
    const [usuarios] = await db.execute('SELECT contrasena FROM usuarios WHERE matricula = ?', [matricula]);
    if (usuarios.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    const contrasenaHash = usuarios[0].contrasena;

    // Verificar contraseña actual
    const esValida = await bcrypt.compare(contrasenaActual, contrasenaHash);
    if (!esValida) {
      return res.status(400).json({ message: 'Contraseña actual incorrecta.' });
    }

    // Encriptar la nueva contraseña
    const nuevaHash = await bcrypt.hash(nuevaContrasena, 10);

    // Actualizar en la base de datos
    await db.execute('UPDATE usuarios SET contrasena = ? WHERE matricula = ?', [nuevaHash, matricula]);

    res.json({ message: 'Contraseña actualizada correctamente.' });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({ error: 'Error al cambiar la contraseña.' });
  }
};

exports.actualizarDatos = async (req, res) => {
  const { matricula, nombres, apellido_paterno, apellido_materno } = req.body;

  try {
    // Verificar si el usuario existe
    const [usuarios] = await db.execute('SELECT id FROM usuarios WHERE matricula = ?', [matricula]);
    if (usuarios.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    // Actualizar nombres y apellidos
    await db.execute(
      'UPDATE usuarios SET nombres = ?, apellido_paterno = ?, apellido_materno = ? WHERE matricula = ?',
      [nombres, apellido_paterno, apellido_materno, matricula]
    );

    res.json({ message: 'Datos personales actualizados correctamente.' });
  } catch (error) {
    console.error('Error al actualizar datos:', error);
    res.status(500).json({ error: 'Error al actualizar datos personales.' });
  }
};

