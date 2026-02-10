# Eficen 360 - Backend

## Requisitos

- Node.js >= 18
- Docker y Docker Compose
- Prisma 7.3

## Instalación y configuración

1. Instalar dependencias:

  npm install

2. Generar Prisma Client:

  npx prisma generate

3. Configurar variables de entorno en un archivo `.env`:

  MYSQL_ROOT_PASSWORD=root
  MYSQL_DATABASE=elementall
  MYSQL_USER=app
  MYSQL_PASSWORD=app

  PORT=3000

  DATABASE_HOST=mysql
  DATABASE_PORT=3306
  DATABASE_USER=app
  DATABASE_PASSWORD=app
  DATABASE_NAME=elementall

  DATABASE_URL="mysql://app:app@mysql:3306/elementall"


4. Levantar base de datos y backend con Docker Compose:

  docker compose down -v
  docker compose up --build

5. Acceder al contenedor del backend en otra terminal(si necesitás ejecutar comandos dentro):

  docker exec -it elementall_backend sh

6. Sincronizar el schema de Prisma con la base de datos:

  npx prisma db push

## Uso de la API

| Método | Uso                        |
|--------|----------------------------|
| GET    | Obtener datos              |
| POST   | Crear datos                |
| PUT    | Actualizar datos           |
| PATCH  | Actualizar parcialmente    |
| DELETE | Eliminar datos             |

## Flujo de trabajo del backend

Frontend
   |
   v
Routes (conectan URL y método HTTP con controller)
   |
   v
Controller (recibe req, llama al service y devuelve res)
   |
   v
Service (aplica reglas de negocio y llama al repository)
   |
   v
Repository (interactúa directamente con la base de datos)
   |
   v
Service (retorna datos procesados)
   |
   v
Controller (res.json(datos))
   |
   v
Frontend recibe respuesta

## Notas

- Controllers: usar `req.body` para creación/modificación y `req.params`/`req.query` para IDs o filtros.
- Devolver datos: `res.json()`.
- Errores: `res.status(código).json({ error: "Mensaje" })`.



## A TENER EN CUENTA
- Chequear que el carrito se guarde en localstorage pero verifique los datos con el backend para seguridad. Sino hacer que
el stock se modifique solamente al checkout y la venta se cree al iniciar carrito.