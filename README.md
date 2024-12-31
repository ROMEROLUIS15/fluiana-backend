

## Documentación de Convención de Carpetas y Archivos

### Estructura de Carpetas

1. **`src/`**: Carpeta principal del código fuente.
   - Contiene todo el código fuente de la aplicación.

2. **`src/index.ts`**: Punto de entrada de la aplicación.
   - Configura y levanta el servidor Express.
   - Importa middlewares, rutas y configura la gestión de errores globalmente.

3. **`src/routes`**: Carpeta donde se guardan las routes de cada modelo.

4. **`src/router.ts`**: Carpeta para los controladores.
   - Cada archivo maneja una o más rutas relacionadas.
   - Contiene funciones que manejan las peticiones HTTP y la lógica de negocio asociada.

5. **`src/controllers/`**: Carpeta para los controladores.
   - Cada archivo maneja una o más rutas relacionadas.
   - Contiene funciones que manejan las peticiones HTTP y la lógica de negocio asociada.

6. **`src/models/`**: Carpeta para los modelos de datos.
   - Define los esquemas de datos utilizando bibliotecas como Mongoose (si se usa MongoDB) o Sequelize (si se usa MySQL).
   - Cada archivo representa un modelo de datos y define cómo interactuar con la base de datos.

7. **`src/middlewares/`**: Carpeta para middlewares personalizados.
   - Contiene funciones de middleware que pueden interceptar y modificar las peticiones HTTP.
   - Ejemplos: middleware de autenticación, validación de datos, logging, etc.

8. **`src/services/`**: Carpeta para servicios adicionales.
   - Incluye funciones que no están directamente relacionadas con las rutas o controladores.
   - Ejemplos: integraciones con API externas, manejo de correo electrónico, gestión de base de datos, etc.

### Convención de Archivos

- **Controladores (`controllers/`)**:
  - **`nombreController.ts`**: Archivo que define funciones para manejar las peticiones HTTP relacionadas con un recurso específico.
  - Ejemplo: `userController.ts`, `authController.ts`.

- **Modelos (`models/`)**:
  - **`nombreModel.ts`**: Archivo que define el esquema de datos para un modelo específico.
  - Define cómo se estructuran y validan los datos antes de almacenarlos en la base de datos.
  - Ejemplo: `userModel.ts`, `postModel.ts`.

- **Middlewares (`middlewares/`)**:
  - **`nombreMiddleware.ts`**: Archivo que define una función de middleware específica.
  - Interfaz entre las peticiones HTTP entrantes y el servidor Express.
  - Ejemplo: `authMiddleware.ts`, `validationMiddleware.ts`.

- **Servicios (`services/`)**:
  - **`nombreServicio.ts`**: Archivo que contiene funciones y lógica de negocio relacionada con un servicio específico.
  - Puede integrarse con API externas, manejar lógica compleja, etc.
  - Ejemplo: `emailService.ts`, `databaseService.ts`.

### Migraciones de Base de Datos

#### Sequelize (MySQL)

Para manejar migraciones en una base de datos MySQL usando Sequelize:

1. **Instalar Sequelize CLI**:
   ```bash
   npm install --save-dev sequelize-cli
   ```

2. **Configurar Sequelize**:
   - Crear un archivo de configuración `sequelize-cli.json` en la raíz del proyecto con los detalles de la conexión a la base de datos.

3. **Generar una Migración**:
   - Ejemplo para crear una tabla `Users`:
     ```bash
     npx sequelize-cli model:generate --name User --attributes firstName:string,lastName:string,email:string
     ```

4. **Ejecutar Migraciones**:
   - Aplicar las migraciones pendientes a la base de datos:
     ```bash
     npx sequelize-cli db:migrate
     ```

5. **Des-hacer una Migración**:
   - Retroceder la última migración realizada:
     ```bash
     npx sequelize-cli db:migrate:undo
     ```

### Uso del Patrón MVC

El patrón Modelo-Vista-Controlador (MVC) se implementa de la siguiente manera en este proyecto:

- **Modelo (`models/`)**:
  - Define los esquemas de datos y la lógica de acceso a la base de datos.
  - Ejemplo: `userModel.ts`, `postModel.ts`.

- **Vista**:
  - En el contexto de una API RESTful, la "vista" sería la representación de los datos en formato JSON que se envían como respuesta a las peticiones HTTP.

- **Controlador (`controllers/`)**:
  - Contiene funciones que manejan las solicitudes HTTP y coordinan las interacciones entre el modelo y la vista.
  - Ejemplo: `userController.ts`, `authController.ts`.

### Variables de Entorno

- **`.env`**: Archivo de configuración para variables de entorno.
  - Contiene información sensible como claves API, credenciales de base de datos, etc.
  - Carga variables en `process.env` al inicio de la aplicación para configurar el entorno de ejecución.

Ejemplo de `.env`:
```
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=secret
API_KEY=abcdef123456
```

---

Esta documentación proporciona una guía detallada sobre la estructura de carpetas, archivos, migraciones y el uso del patrón MVC en un proyecto Node.js con Express y TypeScript.
