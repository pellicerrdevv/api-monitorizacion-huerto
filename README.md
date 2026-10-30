# API REST - Monitorización de un Huerto

Para llevar a cabo la monitorización del huerto dispondremos de sensores y lecturas. En primer lugar, los sensores, cada uno de los cuales se encarga de medir una única magnitud. En segundo lugar, las lecturas, asociadas cada una de ellas a un sensor en concreto. Los sensores deben ser capaces de determinar si las mediciones de dichas lecturas superan un umbral definido considerándose anomalías. Además, el acceso a este huerto queda restringido a dos tipos de roles:

- **User**: con capacidad para consultar y registrar mediciones
- **Admin**: con capacidad de administrar el catálogo de sensores

## Tecnologías

- Node 22
- Express 5
- TypeScript
- MongoDB Atlas + Mongoose
- Zod
- JWT + bcrypt
- Swagger UI
- Vitest + Supertest

## Requisitos

1. Tener Node 22 o superior
2. Cuenta de MongoDB Atlas

## Instalación

Para instalar esta aplicación habrá que seguir el siguiente orden:

1. `git clone <url>`
2. `cd api-monitorizacion-huerto`
3. `npm install`

## Configuración

1. Es necesario copiar el .env.example a un .env (usando cp .env.example .env o usando Copy-Item en Powershell)
2. Rellenar las variables del .env
3. Uso de dos bases de datos, para poder hacer pruebas sin perder la base de datos auténtica:
   - La primera: huerto, que es la real.
   - La segunda: huerto_test, donde se vacían los test.
4. _IMPORTANTE_ --> .env no se tiene que subir bajo ninguna circunstancia al repositorio de Github
5. También funciona usando un MongoDB local, sin cambiar código:
   - `MONGODB_URI=mongodb://localhost:27017/huerto`
   - `MONGODB_URI_TEST=mongodb://localhost:27017/huerto_test`

## Ejecución

1. Ejecutar: npm run dev que arranca el servidor en http://localhost:3000, al iniciar conecta con MongoDB y crea el admin si no existe.
2. Para poder iniciar sesión como administrador, tienes que usar en `POST /api/auth/login` el email y la contraseña que hayas puesto en `ADMIN_EMAIL` y `ADMIN_PASSWORD` de tu .env. Por motivos de seguridad, el registro público: `POST /api/auth/register` siempre crea a los usuarios con rol `user`, nunca crea administradores.

## Documentación

1. Cualquier documentación podrá ser revisada en la siguiente URL --> http://localhost:3000/api/docs
2. Para usar Authorize : login -> copiar token -> Authorize
   _IMPORTANTE_ --> el token caduca a las 8 horas.

## Endpoints

| Método | Ruta                              | Descripción                                   | Acceso      | Respuesta OK |
| ------ | --------------------------------- | --------------------------------------------- | ----------- | ------------ |
| POST   | `/api/auth/register`              | Registro de usuario (siempre con el rol user) | Público     | 201          |
| POST   | `/api/auth/login`                 | Usuario inicia sesión                         | Público     | 200          |
| GET    | `/api/sensors`                    | Obtención de la lista de sensores             | Autenticado | 200          |
| GET    | `/api/sensors/:id`                | Obtener un sensor por su id                   | Autenticado | 200          |
| POST   | `/api/sensors`                    | Crear un sensor                               | Admin       | 201          |
| PATCH  | `/api/sensors/:id`                | Modificar un sensor                           | Admin       | 200          |
| DELETE | `/api/sensors/:id`                | Eliminar un sensor                            | Admin       | 204          |
| POST   | `/api/sensors/:sensorId/readings` | Crear una lectura asociada a un sensor        | Autenticado | 201          |
| GET    | `/api/readings`                   | Obtención de la lista de lecturas             | Autenticado | 200          |

**Parámetros de consulta de `GET /api/readings`**:

- `page`: número de página (por defecto 1)
- `limit`: resultados por página (por defecto 10, máximo 50)
- `sensor`: id de un sensor
- `magnitude`: `soil_moisture`, `temperature`, `light` o `air_humidity`
- `anomalous`: `true` o `false`
- `sort`: `measuredAt`, `-measuredAt` (por defecto), `value` o `-value`

Ejemplo: `/api/readings?magnitude=soil_moisture&anomalous=true&sort=-value&page=1&limit=10`

## Tests

1. Para llevar a cabo los test es necesario ejecutar el siguiente comando : npm test, que usa MONGODB_URI_TEST
2. Los resultados deben mostrar un total de 16 tests repartidos en tres ficheros(auth, sensores,lecturas)

## Estructura del proyecto

```
api-monitorizacion-huerto/
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── vitest.config.ts
│
├── src/
│ ├── app.ts
│ ├── server.ts
│ ├── config/
│ ├── errors/
│ ├── schemas/
│ ├── middlewares/
│ ├── docs/
│ ├── routes/
│ ├── controllers/
│ ├── services/
│ ├── models/
│ └── types/
│
└── tests/
    └── integration/
```

## Autor

Juan Manuel Corchado Pellicer - Desarrollo de Aplicaciones Avanzadas
