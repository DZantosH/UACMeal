# 🍽️ Comedor Tickets App

Aplicación web para gestionar venta de tickets de comedor. Incluye autenticación de usuarios, compra de tickets, saldo en cuenta y generación de códigos QR.

---

## 🚀 Tecnologías usadas

- **Frontend**: React + Vite + Axios + Tailwind CSS
- **Backend**: Node.js + Express
- **Base de datos**: MySQL
- **Autenticación**: JWT
- **Seguridad**: Bcrypt

---

## 📦 Estructura del proyecto

```
comedor-tickets/
├── frontend/           # React app (cliente)
├── backend/            # API en Express
├── database/           # Scripts SQL para MySQL
├── iniciar_proyecto.cmd
└── README.md
```

---

## ⚙️ Instalación local

### 1. Clonar repositorio

```bash
git clone https://github.com/tu-usuario/comedor-tickets-app.git
cd comedor-tickets-app
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env  # crea tu archivo de entorno
npm run dev
```

### 3. Frontend

```bash
cd ../frontend
npm install
npm run dev
```

### 4. Acceso

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`

---

## 🔐 Rutas protegidas

La vista `/inicio` solo es accesible si hay un token válido en el `localStorage`.  
El token se guarda al iniciar sesión correctamente.

---

## 📄 Licencia

Este proyecto es libre de usar para fines académicos o personales.
