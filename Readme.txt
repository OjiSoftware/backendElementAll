
Metodos de uso para la api(usenlos para peticiones, creates, updates, etc)
Método	    Uso
GET	        Obtener datos
POST	    Crear datos
PUT	        Actualizar datos
PATCH	    Actualizar parcialmente
DELETE	    Eliminar datos

Orden para hacer el back
1. Route      => conectamos el controller con express, lo usamos de puente digamos.
2. Controller => Recibe la request del frontend, llama al service y responde al modulo (cliente, producto, etc). Basicamente es donde se manejan errores y decidimos qué código HTTP devolver
3. Service    => lógica de negocio (que se hace con los datos antes o despues de que se guarden)
4. Repository => solo buscamos interactuar con la bd. "Es la única capa que "sabe" dónde están los datos."
5. Server => ultimo paso, agregar al server.ts la ruta del modulo correspondiente

Como funciona el route:
URL + método HTTP → función que se ejecuta
(GET /api/client/5)

esto me lo hizo gpt esta bueno para entender como es el orden de trabajo cuando se hace una peticion

Frontend
   |
   v
Routes (router.put("/:id", controller.updateClient))
   |
   v
Controller (recibe req.body, llama al service)
   |
   v
Service (valida reglas de negocio, llama repository)
   |
   v
Repository (actualiza DB)
   |
   v
Service (retorna cliente actualizado)
   |
   v
Controller (res.json(cliente))
   |
   v
Frontend recibe respuesta


Controller:
Siempre que crees o modifiques datos, tomas la información de req.body.
Siempre que necesites un ID o un filtro, tomas de req.params o req.query.

Siempre que quieras devolver datos: res.json().
Siempre que quieras indicar error: res.status(404).json({error: "No encontrado"}).

==========================================================================================================================================================================================================================================================================================================================================

Actualizar el proyecto 

1- git pull origin joaquin

2- rm -rf node_modules package-lock.json

3- npm install


4- Generar Prisma Client
 npx prisma generate


5- Configurar base de datos local
osea creen la bd (testdb) en su dbeaver

6- Levantar MySQL :
docker run --name mysql-dev -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=elementall -p 3306:3306 -d mysql:8


7- Crear .env:
DATABASE_URL="mysql://root:root@localhost:3306/elementall"
PORT=3000


8- Aplicar migraciones
npx prisma migrate dev


9- Levantar servidor
npm run dev


Por las dudas cuando hagan el npm i, y el prisma generate, verifiquen las versiones de prisma, para que este todo en la 6.9