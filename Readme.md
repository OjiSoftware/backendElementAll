# ElementAll - Backend API

Esta es la API core de **ElementAll**, encargada de la lógica de negocio, persistencia de datos y orquestación de servicios externos.

---

## Tecnologías
- **Express**: Framework web robusto y minimalista.
- **TypeScript**: Para un desarrollo seguro y tipado.
- **Prisma**: ORM moderno para interactuar con MariaDB/MySQL.
- **Docker**: Containerización de la base de datos y la aplicación.
- **Nodemailer**: Envío de correos electrónicos.
- **MercadoPago SDK**: Integración de pagos.

---

## Estructura del Código (`/src`)
El proyecto sigue una arquitectura de capas bien definida:

1. **`controllers/`**: Manejan las peticiones HTTP y las respuestas. No contienen lógica de negocio.
2. **`services/`**: Donde reside la lógica de negocio (reglas, cálculos, validaciones).
3. **`repositories/`**: Interacción pura con la base de datos mediante Prisma.
4. **`routes/`**: Definición de los endpoints y middlewares.
5. **`middlewares/`**: Autenticación, validación de schemas y manejo de errores.
6. **`types/`**: Definiciones de interfaces y tipos globales.

---

## Instalación y Uso

### 1. Preparación
```bash
npm install
```

### 2. Base de Datos con Docker
Levantar base de datos y backend con Docker Compose:
```bash
  docker compose down -v
  docker compose up --build
```
### 3.Configuración de Prisma
Acceder al contenedor del backend en otra terminal(si necesitás ejecutar comandos dentro):
```bash
  docker exec -it elementall_backend sh
```
### 4.Sincronizar el schema de Prisma con la base de datos:
```bash
  npx prisma db push
  npx prisma generate
```

<!-- ### 2. Base de Datos con Docker
```bash
docker compose up -d
```

### 3. Configuración de Prisma
Genera el cliente y sincroniza el esquema:
```bash
npx prisma generate
npx prisma db push
```

### 4. Ejecución
- **Desarrollo:** `npm run dev` (Recarga automática con ts-node-dev).
- **Producción:** `npm start` (Ejecuta el código compilado en `dist/`).

--- -->

## Variables de Entorno
Crea un archivo `.env` con las siguientes claves (puedes usar `.env.example` como base):
- `PORT`: Puerto de escucha (ej. 3000).
- `DATABASE_URL`: URI de conexión a la base de datos.
- `JWT_SECRET`: Llave para la firma de tokens.
- `MERCADOPAGO_ACCESS_TOKEN`: Token de producción/sandbox para pagos.
- `EMAIL_USER`, `EMAIL_PASS`: Credenciales de SMTP.

---

## Flujo de Datos
`Request -> Router -> Middleware -> Controller -> Service -> Repository -> Database`

---

Desarrollado para el ecosistema **ElementAll**.
