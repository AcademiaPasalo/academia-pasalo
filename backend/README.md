# Academia Pasalo - Backend

API REST desarrollada con NestJS para la gestión integral de la plataforma educativa Academia Pasalo. Este proyecto sigue una arquitectura modular y escalable, utilizando prácticas de desarrollo profesionales y tipado estricto.

## Requisitos Previos

Asegúrese de tener instalado el siguiente software antes de comenzar:

- Node.js (v20 o superior recomendado)
- Docker Desktop (para servicios de infraestructura como Redis)
- MySQL 8.0
- npm (gestor de paquetes)

## Instalación y Configuración

Siga estos pasos para configurar el entorno de desarrollo local.

### 1. Clonar el repositorio y acceder al directorio

```bash
git clone <url-del-repositorio>
cd academia-pasalo/backend
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configuración de Variables de Entorno

El proyecto utiliza un archivo `.env` para gestionar la configuración. Se proporciona un archivo de plantilla con las claves necesarias.

```bash
cp .env.example .env
```

Abra el archivo `.env` recién creado y complete los valores correspondientes a su entorno local (Base de Datos, Google OAuth, etc.).

### 4. Base de Datos (MySQL)

Este proyecto **NO** utiliza sincronización automática (`synchronize: true`) por seguridad y control estricto del esquema.

1. Cree la base de datos `academia_pasalo` en su servidor MySQL.
2. Ejecute manualmente los scripts SQL ubicados en la raíz del proyecto para crear las tablas y datos iniciales:
   - `creacion_tablas_academia_pasalo_v1.sql`
   - `datos_iniciales_academa_pasalo_v1.sql` (si aplica)

### 5. Servicios de Infraestructura (Docker)

El proyecto utiliza Docker Compose para gestionar servicios auxiliares como Redis.

**Iniciar Redis (Obligatorio para Auth y Caché):**

```bash
docker compose up -d redis
```
Esto levantará una instancia de Redis 8.0 (Alpine) optimizada para caché y gestión de sesiones.

### 6. Actualizar Base de Datos de GeoIP

Para las funcionalidades de seguridad y detección de ubicación, es necesario descargar la base de datos local de GeoIP.

```bash
npm run geoip:update
```

## Ejecución del Proyecto

### Desarrollo (Watch Mode)

```bash
npm run start:dev
```
La API estará disponible en `http://localhost:3000/api/v1` (o el puerto configurado).

### Producción

```bash
npm run build
npm run start:prod
```

## Pruebas (Testing)

El proyecto cuenta con suites de pruebas unitarias y de extremo a extremo (E2E) para garantizar la calidad y seguridad.

```bash
# Pruebas Unitarias
npm run test

# Pruebas E2E (Seguridad y Flujos Críticos)
npm run test:e2e
```

## Infraestructura y Futuro

Actualmente, la infraestructura Docker soporta:

- **Redis 8.0:** Utilizado para caché de alto rendimiento (Cache-Aside) y gestión segura de sesiones distribuidas.

**Planificación Futura:**
Se tiene previsto integrar los siguientes servicios en el contenedor de Docker para soportar la escalabilidad del sistema:

- **BullMQ:** Para el manejo de colas de tareas en segundo plano (emails, procesamiento de videos).
- **ELK Stack:** Para centralización de logs y observabilidad avanzada.

## Contribución

Por favor, revise los archivos `CONTRIBUTING.md` y `arquitectura_deseable.txt` antes de realizar cambios. Se aplican reglas estrictas de estilo, tipado y arquitectura.