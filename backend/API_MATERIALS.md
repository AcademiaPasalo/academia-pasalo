# API DOCUMENTATION - MÓDULO DE MATERIALES (FILESYSTEM)

Este módulo gestiona el repositorio de archivos educativos (PDFs, PPTs, Videos, etc.) organizados en carpetas jerárquicas.
**Importante:** El acceso de lectura está protegido por el motor de matrículas (`AccessEngine`). Un alumno solo puede ver materiales si su matrícula incluye la evaluación asociada y está vigente.

## 🔐 Seguridad y Autenticación
Todos los endpoints requieren:
- **Header:** `Authorization: Bearer <access_token>`
- **Roles:** Especificados en cada endpoint.

---

## 1. GESTIÓN DE CARPETAS (`/materials/folders`)

### 1.1. Crear Nueva Carpeta
Crea un contenedor para materiales. Puede ser una carpeta raíz o una subcarpeta.

- **Endpoint:** `POST /materials/folders`
- **Roles Permitidos:** `PROFESSOR`, `ADMIN`, `SUPER_ADMIN` (Estudiantes ⛔)
- **Content-Type:** `application/json`

#### Body (Request)
| Campo | Tipo | Requerido | Descripción |
| :--- | :--- | :---: | :--- |
| `evaluationId` | String (BigInt) | ✅ | ID de la Evaluación (Examen/Curso) al que pertenece. |
| `name` | String | ✅ | Nombre visual de la carpeta (Ej. "Semana 1"). |
| `parentFolderId` | String (BigInt) | ❌ | ID de la carpeta padre. Omitir o enviar `null` para crear en raíz. |
| `visibleFrom` | String (ISO Date) | ❌ | Fecha de apertura automática. (Ej. "2026-02-01T08:00:00Z"). |
| `visibleUntil` | String (ISO Date) | ❌ | Fecha de cierre automático. |

#### Respuesta Exitosa (201 Created)
```json
{
  "statusCode": 201,
  "message": "Carpeta creada exitosamente",
  "data": {
    "id": "15",
    "evaluationId": "102",
    "parentFolderId": null,
    "name": "Semana 1 - Introducción",
    "folderStatusId": "1", // 1 = ACTIVE
    "createdAt": "2026-01-29T10:00:00.000Z"
  }
}
```

---

### 1.2. Obtener Carpetas Raíz (Nivel 0)
Obtiene las carpetas iniciales de una evaluación. Es el punto de entrada para navegar.

- **Endpoint:** `GET /materials/folders/evaluation/:evaluationId`
- **Roles Permitidos:** `STUDENT` (si tiene matrícula), `PROFESSOR`, `ADMIN`
- **Parámetros URL:** `evaluationId` (ID de la evaluación)

#### Respuesta Exitosa (200 OK)
```json
{
  "statusCode": 200,
  "message": "Contenido raíz obtenido exitosamente",
  "data": [
    {
      "id": "10",
      "name": "Material de Clase",
      "parentFolderId": null,
      "evaluationId": "102"
    },
    {
      "id": "11",
      "name": "Laboratorios",
      "parentFolderId": null,
      "evaluationId": "102"
    }
  ]
}
```

---

### 1.3. Obtener Contenido de Carpeta (Navegación)
Retorna lo que hay DENTRO de una carpeta específica: sus subcarpetas y sus archivos.

- **Endpoint:** `GET /materials/folders/:folderId`
- **Roles Permitidos:** `STUDENT` (con permiso), `PROFESSOR`, `ADMIN`

#### Respuesta Exitosa (200 OK)
**Estructura Mixta:** Devuelve dos arrays, `folders` (subcarpetas) y `materials` (archivos).

```json
{
  "statusCode": 200,
  "message": "Contenido de carpeta obtenido exitosamente",
  "data": {
    "folders": [
      {
        "id": "22",
        "name": "Lecturas Complementarias",
        "parentFolderId": "10"
      }
    ],
    "materials": [
      {
        "id": "55", // ID del Material (usar este para descargar)
        "displayName": "Sílabo del Curso.pdf",
        "fileResource": {
          "mimeType": "application/pdf",
          "sizeBytes": "1048576"
        },
        "createdAt": "2026-01-28T15:30:00.000Z"
      }
    ]
  }
}
```

---

## 2. GESTIÓN DE ARCHIVOS (`/materials`)

### 2.1. Subir Archivo (Upload)
Sube un archivo físico y lo asocia a una carpeta.

- **Endpoint:** `POST /materials`
- **Roles Permitidos:** `PROFESSOR`, `ADMIN` (Estudiantes ⛔)
- **Content-Type:** `multipart/form-data` (IMPORTANTE)

#### FormData Fields
| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `file` | File (Binary) | El archivo físico a subir. Máx 50MB (configuración recomendada). |
| `materialFolderId` | String | ID de la carpeta donde se guardará. |
| `displayName` | String | Nombre visible para el alumno (puede ser diferente al nombre del archivo original). |
| `visibleFrom` | String (ISO) | (Opcional) Fecha de publicación programada. |

#### Respuesta Exitosa (201 Created)
```json
{
  "statusCode": 201,
  "message": "Material subido exitosamente",
  "data": {
    "id": "89", // Guardar este ID para referencias futuras
    "displayName": "Guía de Estudio.pdf",
    "materialFolderId": "22",
    "fileResourceId": "501",
    "createdAt": "2026-01-29T12:00:00Z"
  }
}
```

---

### 2.2. Solicitar Eliminación (Soft Delete)
Los profesores NO pueden borrar archivos directamente (para evitar accidentes o malicia). Deben solicitarlo.

- **Endpoint:** `POST /materials/request-deletion`
- **Roles Permitidos:** `PROFESSOR`, `ADMIN`
- **Content-Type:** `application/json`

#### Body (Request)
| Campo | Valores | Descripción |
| :--- | :--- | :--- |
| `entityType` | `"material"` \| `"folder"` | Qué se quiere borrar. |
| `entityId` | String | ID del ítem. |
| `reason` | String | Justificación (Ej. "Archivo duplicado" o "Material desactualizado"). |

#### Respuesta Exitosa (200 OK)
```json
{
  "statusCode": 200,
  "message": "Solicitud de eliminación registrada"
}
```
*Nota: El ítem seguirá visible hasta que un ADMIN apruebe la solicitud en el panel de auditoría.*

---

## 3. FLUJO DE TRABAJO (Frontend Cheatsheet)

### ¿Cómo pintar el árbol de archivos?
1.  Llamar a **1.2 (Get Roots)** pasando el ID de la Evaluación actual.
    *   *Renderizar:* Carpetas devueltas.
2.  Al hacer clic en una carpeta, obtener su ID y llamar a **1.3 (Get Contents)**.
    *   *Renderizar:*
        *   Array `folders` -> Dibujar iconos de carpeta 📁 (Navegables).
        *   Array `materials` -> Dibujar iconos de archivo 📄 (Descargables/Visualizables).

### ¿Cómo descargar?
*(Pendiente de implementar endpoint de streaming directo, actualmente se devuelve la URL o el stream binario. Se recomienda usar el ID del material)*.