# DOCUMENTACIÓN DE API - MÓDULO DE MATERIALES (FILES & FOLDERS)

Este documento detalla los endpoints relacionados con la gestión de contenido educativo: carpetas, archivos, versionado y flujo de eliminación.

---

## 📂 Gestión de Carpetas (Folders)

Base URL: `/api/v1/materials/folders`

### 1. Crear Carpeta
`POST /`

**Roles:** `ADMIN`, `PROFESSOR`, `SUPER_ADMIN`

**Request Body:**
```json
{
  "evaluationId": "string (ID de la evaluación a la que pertenece)",
  "name": "string (Nombre de la carpeta)",
  "parentFolderId": "string (Opcional. ID de la carpeta padre)",
  "visibleFrom": "string (ISO Date)",
  "visibleUntil": "string (ISO Date)"
}
```

**Respuesta (201 Created):**
```json
{
  "statusCode": 201,
  "message": "Carpeta creada exitosamente",
  "data": {
    "id": "10",
    "name": "Semana 1",
    "evaluationId": "5",
    ...
  }
}
```

### 2. Listar Carpetas Raíz
`GET /evaluation/:id`

**Roles:** `STUDENT` (con matrícula), `ADMIN`, `PROFESSOR`

**Descripción:** Obtiene las carpetas de nivel superior (sin padre) asociadas a una evaluación específica.

### 3. Ver Contenido de Carpeta
`GET /:id`

**Roles:** `STUDENT` (con matrícula), `ADMIN`, `PROFESSOR`

**Descripción:** Obtiene los detalles de una carpeta y sus subcarpetas directas.
*Nota: Para ver los archivos dentro de la carpeta, se debe consultar el endpoint de listado de materiales (pendiente de documentación si no se incluye en el detalle).*

---

## 📄 Gestión de Archivos (Materials)

Base URL: `/api/v1/materials`

### 1. Subir Material (Nuevo)
`POST /`

**Roles:** `ADMIN`, `PROFESSOR`, `SUPER_ADMIN`
**Content-Type:** `multipart/form-data`

**Form Data:**
- `file`: (Binario) El archivo a subir.
- `materialFolderId`: "string" (ID de la carpeta destino).
- `displayName`: "string" (Nombre visible para el alumno).
- `visibleFrom`: "string" (ISO Date, opcional).

**Respuesta (201 Created):**
```json
{
  "statusCode": 201,
  "message": "Material subido exitosamente",
  "data": {
    "id": "50",
    "displayName": "Silabo.pdf",
    "fileVersionId": "1",
    ...
  }
}
```

### 2. Subir Nueva Versión (Actualizar)
`POST /:id/versions`

**Roles:** `ADMIN`, `PROFESSOR`, `SUPER_ADMIN`
**Content-Type:** `multipart/form-data`

**Descripción:** Sube un nuevo archivo que reemplaza al anterior bajo el mismo `Material ID`. Se incrementa el número de versión automáticamente.

**Form Data:**
- `file`: (Binario) El nuevo archivo.

### 3. Descargar Archivo
`GET /:id/download`

**Roles:** `STUDENT` (con matrícula), `ADMIN`, `PROFESSOR`

**Descripción:** Inicia la descarga del archivo físico.
*Seguridad:* Verifica estrictamente que el usuario tenga acceso a la evaluación asociada mediante `AccessEngine`.

### 4. Solicitar Eliminación
`POST /:id/request-deletion`

**Roles:** `PROFESSOR`, `ADMIN`

**Request Body:**
```json
{
  "reason": "string (Motivo de la eliminación)"
}
```

**Respuesta (200 OK):**
```json
{
  "message": "Solicitud de eliminación registrada"
}
```

---

## 🛡️ Administración de Materiales (Admin Side)

Base URL: `/api/v1/admin/materials`

### 1. Listar Solicitudes Pendientes
`GET /requests/pending`

**Roles:** `ADMIN`, `SUPER_ADMIN`

**Descripción:** Lista todas las solicitudes de eliminación con estado `PENDING`.

### 2. Revisar Solicitud (Aprobar/Rechazar)
`POST /requests/:id/review`

**Roles:** `ADMIN`, `SUPER_ADMIN`

**Request Body:**
```json
{
  "action": "APPROVE | REJECT",
  "adminComment": "string (Opcional)"
}
```

**Efectos:**
- **APPROVE:** El material pasa a estado `ARCHIVED` (oculto).
- **REJECT:** El material se mantiene `ACTIVE`.

### 3. Eliminación Física (Hard Delete)
`DELETE /:id/hard-delete`

**Roles:** `SUPER_ADMIN` (Exclusivo)

**Descripción:** Elimina definitivamente el registro del material y sus versiones de la base de datos.
*Requisito:* El material debe estar previamente en estado `ARCHIVED`.
