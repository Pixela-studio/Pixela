# About Feature 📖

## 📋 Descripción

La feature **About** es una sección informativa que presenta la identidad y la misión de Pixela. Es contenido estático que comunica los valores de la plataforma.

> La sección "Nuestro Equipo" se retiró; con ella se fueron el subcomponente `TeamMemberCard`, el array `TEAM_MEMBERS`, el tipo `TeamMember` y las fotos de `/public/about/img/`.

## 🎯 Propósito

- **Presentar la marca**: Mostrar quiénes somos y qué hacemos
- **Comunicar la misión**: Explicar el propósito de Pixela como plataforma

## 🏗️ Estructura de Archivos

```
src/features/about/
├── README.md                    # Este archivo
├── index.ts                     # Exportaciones principales
├── types/                       # Tipos y interfaces
│   ├── components.ts           # Interfaces de componentes
│   └── index.ts               # Exportaciones centralizadas
├── components/
│   └── AboutSection.tsx         # Componente principal
└── data/
    └── aboutData.tsx            # Datos estáticos
```

## 🧩 Componentes

### AboutSection
**Ubicación**: `components/AboutSection.tsx`

Componente principal que renderiza toda la sección "Acerca de". Incluye:

- **Título y descripción general**: Presentación de la plataforma
- **Tarjetas de características**: Pasión, Comunidad (próximamente), Misión

#### Subcomponentes:

##### FeatureCard
- Renderiza una tarjeta individual de característica
- Muestra ícono, título, descripción
- Soporte para etiqueta "Próximamente"

## 📊 Datos y Configuración

### Interfaces TypeScript
**Ubicación**: `types/components.ts`

```typescript
interface FeatureCard {
  icon: React.ReactNode;
  title: string;
  description: string;
  isComingSoon?: boolean;
}
```

### Datos Estáticos
**Ubicación**: `data/aboutData.tsx`

#### FEATURE_CARDS
- Array con las características principales de Pixela
- Iconos usando React Icons (FaFilm, FaUsers, FaHeart)
- Una característica marcada como "próximamente"

## 🎨 Estilos y Diseño

### Sistema de Diseño
- **Colores**: Tema oscuro con acentos en `pixela-accent`
- **Tipografía**: Font Outfit para títulos
- **Efectos**: Animaciones flotantes, hover effects, transiciones suaves
- **Responsive**: Diseño adaptativo para móviles, tablets y desktop

### Clases CSS Principales
- `bg-pixela-dark`: Fondo principal oscuro
- `text-pixela-accent`: Color de acento para textos importantes
- `animate-float-smooth`: Animación flotante personalizada

## 📱 Responsividad

- **Mobile**: Layout vertical, tipografía reducida, cards apiladas
- **Tablet (iPad)**: Ajustes intermedios, grids adaptados
- **Desktop**: Layout completo, efectos hover avanzados

## 🔗 Dependencias

### Externas
- `react-icons/fa`: Iconos Font Awesome

### Internas
- `@/features/about/types`: Interfaces y tipos
- `@/features/about/data`: Datos estáticos

## 📋 Uso

```tsx
import { AboutSection } from '@/features/about';

// En una página o layout
<AboutSection />
```

## 🛠️ Mantenimiento

### Para modificar características:
1. Editar el array `FEATURE_CARDS` en `data/aboutData.tsx`
2. Añadir/quitar tarjetas según necesidad

### Para modificar tipos:
1. Editar las interfaces en `types/components.ts`
2. Actualizar las importaciones en los archivos que las usan

## 🎯 Características Principales

- ✅ **Misión y valores**: Comunicación clara de propósito
- ✅ **Diseño atractivo**: UI moderna con animaciones
- ✅ **Completamente responsive**: Funciona en todos los dispositivos
- ⏳ **Comunidad**: Funcionalidad próximamente

## 📝 Notas Importantes

- La característica "Comunidad" está marcada como próximamente
- Todos los textos están en español para la audiencia objetivo
