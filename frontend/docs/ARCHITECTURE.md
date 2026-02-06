# Arquitectura del Sistema Modular Basado en Roles

## Diagrama de Flujo

```
┌─────────────────────────────────────────────────────────────────┐
│                      USUARIO ACCEDE A PÁGINA                     │
│                     (ej: /plataforma/inicio)                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      page.tsx (Genérico)                         │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  export default function InicioPage() {                   │  │
│  │    return <RoleBasedContent />;                           │  │
│  │  }                                                         │  │
│  └───────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              RoleBasedContent (Selector Inteligente)             │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  1. Llama a useRoleBasedRoute()                           │  │
│  │  2. Obtiene componentPath según rol                       │  │
│  │  3. Busca componente en componentMap                      │  │
│  │  4. Renderiza componente correcto                         │  │
│  └───────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│            useRoleBasedRoute (Validación de Seguridad)           │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  ✓ Verifica autenticación                                 │  │
│  │  ✓ Obtiene rol del usuario                                │  │
│  │  ✓ Consulta roleBasedRouting.ts                           │  │
│  │  ✓ Valida acceso del rol a la ruta                        │  │
│  │  ✓ Retorna componentPath o redirecciona                   │  │
│  └───────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│          roleBasedRouting.ts (Configuración Central)             │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  routeAccessConfig = {                                    │  │
│  │    '/plataforma/inicio': {                                │  │
│  │      allowedRoles: ['STUDENT', 'TEACHER', 'ADMIN'],       │  │
│  │      component: 'InicioContent'                           │  │
│  │    }                                                       │  │
│  │  }                                                         │  │
│  │                                                            │  │
│  │  roleBasedComponents = {                                  │  │
│  │    '/plataforma/inicio': {                                │  │
│  │      STUDENT: 'student/InicioContent',                    │  │
│  │      TEACHER: 'teacher/InicioContent',                    │  │
│  │      ADMIN: 'admin/InicioContent'                         │  │
│  │    }                                                       │  │
│  │  }                                                         │  │
│  └───────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
           ┌─────────────────┼─────────────────┐
           │                 │                 │
           ▼                 ▼                 ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│   STUDENT ROL    │ │   TEACHER ROL    │ │   ADMIN ROL      │
├──────────────────┤ ├──────────────────┤ ├──────────────────┤
│ student/         │ │ teacher/         │ │ admin/           │
│ InicioContent    │ │ InicioContent    │ │ InicioContent    │
│                  │ │                  │ │                  │
│ ┌──────────────┐ │ │ ┌──────────────┐ │ │ ┌──────────────┐ │
│ │ - Mis Cursos │ │ │ │ - Mis Clases │ │ │ │ - Dashboard  │ │
│ │ - Agenda     │ │ │ │ - Horario    │ │ │ │ - Estadíst.  │ │
│ │ - Tutoría CTA│ │ │ │ - Calificac. │ │ │ │ - Gestión    │ │
│ └──────────────┘ │ │ └──────────────┘ │ │ └──────────────┘ │
└──────────────────┘ └──────────────────┘ └──────────────────┘
```

## Capas de Seguridad

```
┌─────────────────────────────────────────────────────────┐
│                   CAPA 1: Layout                         │
│        DashboardLayout - Protección de Autenticación    │
│  ┌───────────────────────────────────────────────────┐  │
│  │  if (!isAuthenticated) redirect('/plataforma')    │  │
│  └───────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                   CAPA 2: Route Guard                    │
│       useRoleBasedRoute - Validación de Rol y Ruta      │
│  ┌───────────────────────────────────────────────────┐  │
│  │  if (!hasAccess) redirect(redirectOnDenied)       │  │
│  └───────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                CAPA 3: Component Map                     │
│        RoleBasedContent - Selección de Componente       │
│  ┌───────────────────────────────────────────────────┐  │
│  │  if (!Component) show "En Construcción"           │  │
│  └───────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│               CAPA 4: Componente Final                   │
│         Renderiza contenido específico del rol          │
└─────────────────────────────────────────────────────────┘
```

## Estructura de Archivos

```
frontend/src/
│
├── app/plataforma/(dashboard)/
│   ├── inicio/page.tsx ──────────────┐
│   ├── curso/[id]/page.tsx ──────────┤
│   ├── calendario/page.tsx ──────────┤──── Páginas Genéricas
│   └── notificaciones/page.tsx ──────┘     (No saben de roles)
│
├── components/
│   ├── RoleBasedContent.tsx ─────────────── Selector Inteligente
│   │
│   ├── pages/
│   │   ├── student/  ┐
│   │   │   ├── InicioContent.tsx    ┐
│   │   │   ├── CursoContent.tsx     │
│   │   │   └── CalendarioContent.tsx│──── Componentes Específicos
│   │   │                             │     (Saben todo del rol)
│   │   ├── teacher/  │               │
│   │   │   ├── InicioContent.tsx    │
│   │   │   └── ...                  │
│   │   │                             │
│   │   └── admin/    │               │
│   │       ├── InicioContent.tsx    │
│   │       └── ...                  ┘
│   │
│   ├── dashboard/  ──────────────────────── Compartidos
│   │   ├── Sidebar.tsx                     (Todos los roles)
│   │   ├── TopBar.tsx
│   │   └── RoleSwitcher.tsx
│   │
│   └── ui/  ─────────────────────────────── Componentes UI
│       ├── Icon.tsx                         (Todos los roles)
│       ├── Button.tsx
│       └── ...
│
├── lib/
│   └── roleBasedRouting.ts ──────────────── Configuración Central
│                                            - routeAccessConfig
│                                            - roleBasedComponents
│                                            - Funciones de validación
│
├── hooks/
│   ├── useRoleBasedRoute.ts ─────────────── Hook de Seguridad
│   └── useNavigation.ts ─────────────────── Hook de Navegación
│
└── config/
    └── navigation.ts ────────────────────── Navegación por Rol
```

## Flujo de Datos

```
┌─────────────┐
│   Usuario   │
└──────┬──────┘
       │ Navega
       ▼
┌─────────────────────┐
│   AuthContext       │ ◄── Estado Global
│   - user            │
│   - roles           │
│   - isAuthenticated │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│   useNavigation     │ ◄── Genera navegación
│   - Obtiene rol     │     según rol activo
│   - Carga cursos    │
│   - Marca activos   │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│   DashboardLayout   │ ◄── Muestra sidebar
│   - Sidebar         │     con nav items
│   - TopBar          │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│   page.tsx          │ ◄── Renderiza contenido
│   RoleBasedContent  │     según rol
└─────────────────────┘
```

## Ejemplo Completo: Usuario Cambia de Rol

```
1. Usuario hace click en RoleSwitcher
   └─> Selecciona "Docente"

2. RoleSwitcher llama switchProfile(roleId)
   └─> AuthContext actualiza lastActiveRoleId
   └─> Guarda en localStorage
   └─> Recarga página (window.location.reload())

3. Al recargar:
   └─> AuthContext lee token actualizado
   └─> Identifica rol activo: TEACHER

4. useNavigation genera nav items para TEACHER
   └─> navigationConfig['TEACHER']

5. Página /plataforma/inicio renderiza:
   └─> RoleBasedContent
   └─> useRoleBasedRoute('/plataforma/inicio')
   └─> roleBasedComponents['/plataforma/inicio']['TEACHER']
   └─> Componente: 'teacher/InicioContent'
   └─> Renderiza: TeacherInicioContent

6. Usuario ve contenido específico de docente ✅
```

## Prevención de Bypasses

### Bypass Intentado: URL Directa

```
Usuario intenta: /plataforma/admin/usuarios
Rol actual: STUDENT

Flujo:
1. DashboardLayout: Autenticado
2. useRoleBasedRoute: Rol no permitido
3. Redirección: /plataforma/inicio
4. Resultado: Acceso denegado
```

### Bypass Intentado: Manipulación de Estado

```
Usuario intenta: Modificar localStorage
Rol falso: ADMIN

Flujo:
1. AuthContext lee JWT del servidor
2. JWT tiene rol real: STUDENT
3. Ignora localStorage manipulado
4. useRoleBasedRoute valida con rol real
5. Resultado: Acceso denegado
```

### Bypass Intentado: Import Directo

```typescript
// Usuario intenta importar directamente
import AdminContent from '@/components/pages/admin/InicioContent';

// Esto NO bypasea seguridad porque:
// 1. El componente no tiene datos sin autenticación
// 2. Las llamadas API validan en backend
// 3. El componente necesita contexto del rol
```

## Escalabilidad

### Agregar Nuevo Rol

```typescript
// 1. Agregar a types
type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN' | 'SUPER_ADMIN' | 'COORDINATOR';

// 2. Agregar navegación
navigationConfig.COORDINATOR = [...];

// 3. Agregar componentes
components/pages/coordinator/...

// 4. Actualizar roleBasedComponents
roleBasedComponents['/plataforma/inicio'].COORDINATOR = 'coordinator/InicioContent';

// Listo! Todo funciona automáticamente
```

### Agregar Nueva Página Global

```typescript
// 1. Crear page.tsx genérico
app/plataforma/(dashboard)/mi-pagina/page.tsx

// 2. Configurar acceso
routeAccessConfig['/plataforma/mi-pagina'] = {...};
roleBasedComponents['/plataforma/mi-pagina'] = {...};

// 3. Crear componentes por rol
components/pages/student/MiPaginaContent.tsx
components/pages/teacher/MiPaginaContent.tsx

// 4. Registrar en componentMap
componentMap['student/MiPaginaContent'] = ...;

// Página lista para todos los roles!
```

---

**Ventajas del Sistema:**
- Un solo lugar para rutas (page.tsx)
- Seguridad centralizada
- Componentes modulares y mantenibles
- Fácil agregar roles o páginas
- Prevención automática de bypasses
- TypeScript y type safety completo
