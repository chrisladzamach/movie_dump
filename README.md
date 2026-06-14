# Movie Dump

Aplicación web fullstack para registrar y compartir películas vistas entre dos usuarios.

## Stack

- **Backend:** Node.js, Express, TypeScript, MySQL, JWT, bcrypt, Socket.io
- **Frontend:** React, TypeScript, React Router DOM, Tailwind CSS
- **API externa:** TMDB (fetch nativo, sin axios)

## Requisitos

- Node.js 18+
- MySQL 8+

## Configuración

### 1. Base de datos

```bash
mysql -u root -p < database/schema.sql
```

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Variables de entorno:

```
BACKEND_PORT=
JWT_SECRET=
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=
TMDB_API_KEY=
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Características

- Solo dispositivos móviles (bloqueo frontend + backend por User-Agent)
- Autenticación JWT (registro, login, logout)
- Búsqueda TMDB y registro de películas con valoraciones
- Watchlist con marcar como vista
- Filtros por género, favorita, valoración, fecha y quién la vio
- Estadísticas compartidas
- Notificaciones en tiempo real vía WebSocket

## Estructura

```
backend/src/   controllers, services, repositories, middlewares, routes, models, config, utils
frontend/src/  pages, components, services, hooks, layouts, routes
```
