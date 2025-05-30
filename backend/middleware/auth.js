const jwt = require('jsonwebtoken');

// Middleware para verificar token JWT
const verifyToken = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ error: 'Acceso denegado. Token requerido.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({ error: 'Token inválido.' });
    }
};

// Middleware para verificar roles específicos
const verifyRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Usuario no autenticado.' });
        }

        if (!roles.includes(req.user.rol)) {
            return res.status(403).json({ error: 'No tienes permisos para realizar esta acción.' });
        }

        next();
    };
};

// Middleware específicos por rol
const verifyAdmin = verifyRole(['Administrador']);
const verifyDoctor = verifyRole(['Doctor', 'Administrador']);
const verifySecretaria = verifyRole(['Secretaria', 'Administrador']);
const verifyDoctorOrSecretaria = verifyRole(['Doctor', 'Secretaria', 'Administrador']);

module.exports = {
    verifyToken,
    verifyRole,
    verifyAdmin,
    verifyDoctor,
    verifySecretaria,
    verifyDoctorOrSecretaria
};