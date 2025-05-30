# 🦷 Odon-Sistema - Sistema de Gestión Odontológica

**Odon-Sistema** es una aplicación web para la gestión integral de un consultorio odontológico. Permite registrar pacientes, agendar citas, consultar historiales clínicos, y gestionar usuarios, todo desde un panel centralizado.

---

## 🚀 Tecnologías utilizadas

- **Frontend:** React.js
- **Backend:** Node.js + Express
- **Base de datos:** MySQL
- **Estilo:** CSS personalizado
- **Control de versiones:** Git y GitHub

---

## 🗂️ Estructura del Proyecto

odon-sistema/
├── backend/
│ ├── server.js
│ └── package.json
├── frontend/
│ ├── public/
│ └── src/
│ ├── components/
│ ├── pages/
│ ├── services/
│ └── App.js

---

## ⚙️ Instalación y Ejecución Local

### 1. Clonar el repositorio

```bash
git clone https://github.com/DZantosH/UACMeal.git
cd UACMeal

#Configurar el Backend
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=odontologia
PORT=5000

# Inicia el servidor:
npm start

# Configurar el Frontend
cd ../frontend
npm install
npm start
```

🧩 Funcionalidades
-Registro y edición de pacientes
-Agendado de citas con calendario
-Consulta del historial clínico
-Sistema de login y control de usuarios
-Administración desde un panel centralizado

📌 Estado del proyecto
✅ En desarrollo activo. Se está trabajando en módulos como edición de citas, historial clínico detallado y reportes por paciente.

🛡️ Seguridad
-Autenticación y autorización de usuarios
-Validación de datos en el servidor
-Protección de rutas sensibles

📄 Licencia
Este proyecto está bajo la licencia MIT. Consulta el archivo LICENSE para más detalles.

🤝 Contribuciones
Las contribuciones son bienvenidas. Por favor, abre un issue para discutir cambios importantes antes de realizar un pull request.

Desarrollado por Brandon Reynoso y Edgar Hernandez. Para consultas o sugerencias, por favor abre un issue en el repositorio.
