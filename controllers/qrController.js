const db = require('../config/db');

exports.estadoQrs = async (req, res) => {
    const { usuarioId } = req.body;
  
    try {
      const [activos] = await db.execute('SELECT COUNT(*) AS total FROM qrs WHERE usuario_id = ? AND estado = ?', [usuarioId, 'activo']);
      const [desactivados] = await db.execute('SELECT COUNT(*) AS total FROM qrs WHERE usuario_id = ? AND estado = ?', [usuarioId, 'desactivado']);
      const [total] = await db.execute('SELECT COUNT(*) AS total FROM qrs WHERE usuario_id = ?', [usuarioId]);
  
      res.json({
        activos: activos[0].total,
        desactivados: desactivados[0].total,
        total: total[0].total
      });
    } catch (error) {
      console.error('Error al obtener estado de QR:', error);
      res.status(500).json({ error: 'Error al obtener estado de QR' });
    }
  };

exports.contarQrs = async (req, res) => {
  const { usuarioId } = req.body;
  try {
    const [result] = await db.execute('SELECT COUNT(*) AS total FROM qrs WHERE usuario_id = ?', [usuarioId]);
    res.json({ total: result[0].total });
  } catch (error) {
    console.error('Error al contar QR:', error);
    res.status(500).json({ error: 'Error al contar QR' });
  }
};

exports.comprarQr = async (req, res) => {
  const { usuarioId } = req.body;
  try {
    const [result] = await db.execute('SELECT COUNT(*) AS total FROM qrs WHERE usuario_id = ?', [usuarioId]);
    if (result[0].total >= 10) {
      return res.status(400).json({ error: 'Máximo de QR alcanzado' });
    }
    await db.execute('INSERT INTO qrs (usuario_id, fecha_compra) VALUES (?, NOW())', [usuarioId]);
    res.json({ message: 'QR comprado exitosamente' });
  } catch (error) {
    console.error('Error al comprar QR:', error);
    res.status(500).json({ error: 'Error al comprar QR' });
  }
};
