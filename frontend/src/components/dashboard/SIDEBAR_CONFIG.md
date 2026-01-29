# 🎨 Configuración del Sidebar

## 📍 Dónde se definen los íconos del Sidebar

Los íconos del Sidebar se configuran en la **página que usa el componente**, por ejemplo en:
```
src/app/plataforma/inicio/page.tsx
```

## 🔧 Estructura de Configuración

### Ejemplo Completo

```tsx
import Sidebar, { SidebarNavItem, SidebarUser } from '@/components/dashboard/Sidebar';

const navItems: SidebarNavItem[] = [
  { 
    icon: 'home',              // Nombre del ícono de Material Symbols
    label: 'Inicio',           // Texto que se muestra
    href: '#',                 // URL de destino
    active: true,              // Si está activo (resaltado)
    iconVariant: 'rounded',    // 'outlined' | 'rounded' | 'sharp'
    iconFilled: true           // true = relleno, false = contorno
  },
  { 
    icon: 'menu_book',
    label: 'Cursos',
    href: '#',
    expandable: true,          // Si tiene submenú
    iconVariant: 'rounded',
    iconFilled: false,
    subItems: [                // Items del submenú
      { 
        icon: 'circle', 
        label: 'Mis Cursos', 
        href: '#',
        iconVariant: 'outlined',
        iconFilled: true
      },
      { 
        icon: 'circle', 
        label: 'Explorar', 
        href: '#' 
      }
    ]
  },
  { 
    icon: 'calendar_month',
    label: 'Calendario',
    href: '#',
    iconVariant: 'rounded'
    // iconFilled se omite, por defecto es false (contorno)
  }
];
```

---

## 🎯 Propiedades de SidebarNavItem

| Propiedad | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `icon` | `string` | - | ⚠️ **Requerido**. Nombre del ícono de Material Symbols |
| `label` | `string` | - | ⚠️ **Requerido**. Texto del item de navegación |
| `href` | `string` | - | ⚠️ **Requerido**. URL de destino |
| `active` | `boolean` | `false` | Si el item está activo/seleccionado |
| `expandable` | `boolean` | `false` | Si el item tiene submenú |
| `subItems` | `SidebarNavItem[]` | - | Array de sub-items (solo si `expandable: true`) |
| `iconVariant` | `'outlined' \| 'rounded' \| 'sharp'` | `'outlined'` | Estilo del ícono |
| `iconFilled` | `boolean` | `false` | Si el ícono está relleno |

---

## 💡 Ejemplos de Configuración de Íconos

### Ícono Activo con Relleno
Item activo/seleccionado con ícono relleno:
```tsx
{ 
  icon: 'home',
  label: 'Inicio',
  href: '/inicio',
  active: true,
  iconVariant: 'rounded',
  iconFilled: true
}
```

### Ícono Normal (Contorno)
Item normal con ícono outline:
```tsx
{ 
  icon: 'notifications',
  label: 'Notificaciones',
  href: '/notificaciones',
  iconVariant: 'rounded',
  iconFilled: false  // o simplemente omitir esta línea
}
```

### Ícono con Submenú
Item expandible con submenú:
```tsx
{ 
  icon: 'menu_book',
  label: 'Cursos',
  href: '#',
  expandable: true,
  iconVariant: 'rounded',
  subItems: [
    { 
      icon: 'book', 
      label: 'Mis Cursos', 
      href: '/cursos/mis-cursos',
      iconFilled: true  // Sub-item con relleno
    },
    { 
      icon: 'explore', 
      label: 'Explorar', 
      href: '/cursos/explorar' 
    }
  ]
}
```

---

## 🎨 Estilos Visuales Disponibles

### Outlined (Bordes Rectos)
```tsx
iconVariant: 'outlined'
```
Estilo limpio y profesional con bordes rectos.

### Rounded (Bordes Redondeados)
```tsx
iconVariant: 'rounded'
```
Estilo suave y amigable con bordes redondeados. **Recomendado para el dashboard**.

### Sharp (Bordes Angulares)
```tsx
iconVariant: 'sharp'
```
Estilo técnico y moderno con bordes angulares.

---

## 🎭 Relleno vs Contorno

### Filled (Relleno)
```tsx
iconFilled: true
```
Ícono sólido/relleno. Ideal para:
- Items activos/seleccionados
- Íconos principales
- Llamar la atención

### Outline (Contorno)
```tsx
iconFilled: false  // o simplemente omitir
```
Ícono con contorno. Ideal para:
- Items normales/no activos
- Navegación secundaria
- Mantener la UI ligera

---

## 📋 Configuración del Usuario

El perfil del usuario en el Sidebar también se configura en la página:

```tsx
const user: SidebarUser = {
  name: 'Juan Pérez',
  initials: 'JP',
  role: 'Alumno',
  avatarColor: 'bg-purple-600'  // o cualquier color de Tailwind
};
```

---

## 🔍 Buscar Íconos

Para encontrar nombres de íconos disponibles:
1. Visita: [Google Material Symbols](https://fonts.google.com/icons)
2. Busca el ícono que necesitas
3. Copia el nombre exacto (ej: `home`, `menu_book`, `calendar_month`)
4. Úsalo en la propiedad `icon`

---

## ⚡ Tips

1. **Consistencia**: Usa el mismo `iconVariant` en toda la navegación principal
2. **Contraste**: Los items activos deberían tener `iconFilled: true`
3. **Jerarquía**: Los sub-items pueden tener íconos más simples (`circle`, `remove`)
4. **Performance**: Las propiedades son opcionales, solo agrega las que necesites
