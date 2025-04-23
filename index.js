const express = require('express');
const cors = require('cors');
const app = express();
const authRoutes = require('./routes/authRoutes');
const qrRoutes = require('./routes/qrRoutes');  // ← Nuevo

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/qr', qrRoutes); 

app.listen(4000, () => {
  console.log('Servidor corriendo en puerto 4000');
});
