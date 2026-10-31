# Media Feature 🎭

## 📋 Descripción

La feature **Media** es el sistema completo para mostrar información detallada de películas y series. Incluye una página de detalles con hero visual, metadatos, reparto, trailers, galería de imágenes, proveedores de streaming y sistema de reseñas. Es la experiencia principal para explorar contenido específico en la plataforma.

## 🎯 Propósito

- **Información completa**: Mostrar todos los detalles de películas y series
- **Experiencia visual**: Hero con backdrop, poster y metadatos destacados
- **Interacción social**: Sistema de reseñas y valoraciones de usuarios
- **Contenido multimedia**: Trailers, galerías y material promocional
- **Información práctica**: Reparto, proveedores de streaming y metadatos

## 🏗️ Estructura de Archivos

```
src/features/media/
├── README.md                    # Este archivo
├── pages/
│   └── MediaPage.tsx            # Página principal de media
├── store/                       # Gestión de estado con Zustand
│   ├── mediaStore.ts           # Implementación del store
│   └── types.ts                # Tipos del store
├── types/
│   ├── index.ts                 # Exportaciones de tipos
│   ├── content.ts               # Tipos de Serie y Pelicula
│   ├── mediaBase.ts             # Tipos base de Media
│   ├── people.ts                # Tipos de personas (actores, creadores)
│   ├── gallery.ts               # Tipos de galería de imágenes
│   ├── supplements.ts           # Tipos de trailers y proveedores
│   ├── metadata.ts              # Tipos para metadatos
│   ├── creators.ts              # Tipos para creadores
│   └── trailer.ts               # Tipos para trailers
├── services/
│   ├── galleryService.ts        # Servicio de galería de imágenes
│   ├── movieService.ts          # Servicio de películas
│   ├── seriesService.ts         # Servicio de series
│   ├── movieMetadata.ts         # Metadatos de películas
│   └── seriesMetadata.ts        # Metadatos de series
└── components/
    ├── index.ts                 # Exportaciones principales
    ├── hero/                    # Componentes del hero
    │   ├── HeroSection.tsx      # Hero principal
    │   ├── PosterModal.tsx      # Modal de poster
    │   ├── actions/             # Botones de acción
    │   ├── backdrop/            # Imagen de fondo
    │   ├── creators/            # Información de creadores
    │   ├── genres/              # Lista de géneros
    │   ├── metadata/            # Metadatos
    │   ├── poster/              # Poster principal
    │   └── title/               # Título y puntuación
    ├── cast/                    # Componentes del reparto
    │   ├── CastSection.tsx      # Sección principal
    │   ├── ActorCard.tsx        # Tarjeta de actor
    │   └── ActorSliderControls.tsx # Controles de slider
    ├── gallery/                 # Componentes de galería
    │   ├── GallerySection.tsx   # Sección principal
    │   ├── GalleryGrid.tsx      # Grid de imágenes
    │   └── GalleryTabs.tsx      # Tabs de navegación
    ├── trailer/                 # Componentes de trailers
    │   ├── TrailersSection.tsx  # Sección de trailers
    │   ├── TrailerPlayer.tsx    # Reproductor de trailers
    │   └── TrailerList.tsx      # Lista de trailers
    ├── platforms/               # Componentes de plataformas
    │   ├── StreamingProviders.tsx # Proveedores de streaming
    │   └── platformUtils.ts     # Utilidades de plataformas
    └── review/                  # Componentes de reseñas
        └── ReviewSection.tsx    # Sistema de reseñas
```

## 🧩 Componentes Principales

### MediaPage
**Ubicación**: `pages/MediaPage.tsx`

Página principal que orquesta toda la experiencia de media:

- **Layout principal**: Estructura de la página completa
- **Gestión de estado**: Manejo de reseñas y modales
- **Composición**: Combina todas las secciones principales
- **Props interface**: Recibe objeto Media como entrada

### Store de Estado
**Ubicación**: `store/mediaStore.ts`

Store centralizado con Zustand que maneja:

- **Modal del Poster**: Control de visibilidad del modal de imagen grande
- **Sistema de Reseñas**: Estado de carga, datos y errores
- **Galería**: Navegación entre tabs y selección de imágenes
- **Trailers**: Control del reproductor de trailers
- **Gestión de errores**: Manejo de errores en carga de datos
- **Estados de carga**: Control de estados de loading en componentes

#### Uso del Store
```typescript
// Acceso al estado del modal
const { showPosterModal, setShowPosterModal } = useMediaStore();

// Gestión de reseñas
const { reviews, loadingReviews, errorReviews, setReviews, setLoadingReviews, setErrorReviews } = useMediaStore();

// Control de galería
const { activeGalleryTab, setActiveGalleryTab, selectedGalleryImage, setSelectedGalleryImage } = useMediaStore();

// Control de trailers
// El tráiler seleccionado es estado local de `TrailersSection`: en el store
// global se arrastraba de una ficha a la siguiente.
```

### HeroSection
**Ubicación**: `components/hero/HeroSection.tsx`

Hero visual principal con información destacada:

- **Layout responsive**: Móvil centrado, desktop lateral
- **Backdrop dinámico**: Imagen de fondo con gradientes
- **Poster interactivo**: Click para modal ampliado
- **Metadatos completos**: Título, géneros, puntuación, sinopsis
- **Botones de acción**: Favoritos, listas, reseñas

#### Subcomponentes especializados:
- **BackdropImage**: Imagen de fondo optimizada
- **MediaPoster**: Poster principal con interacción
- **MediaTitle**: Título con puntuación
- **GenresList**: Chips de géneros
- **MediaMetadata**: Duración, fecha, temporadas
- **CreatorInfo**: Información de creadores/directores
- **ActionButtons**: Botones de interacción

### CastSection
**Ubicación**: `components/cast/CastSection.tsx`

Sección de reparto con slider/grid adaptativo:

- **Layout inteligente**: Grid en desktop (≤6 actores), slider en otros casos
- **Slider avanzado**: Embla carousel con controles
- **Responsive**: Adaptación completa móvil/tablet/desktop
- **Estados de drag**: Feedback visual durante interacción

#### Características:
- Detección automática de dispositivo
- Grid para pocos actores en desktop
- Slider para móvil y muchos actores
- Controles de navegación cuando es necesario

### GallerySection
**Ubicación**: `components/gallery/GallerySection.tsx`

Galería de imágenes con tabs de navegación:

- **Categorías**: Backdrops, Posters, Logos
- **Grid responsivo**: Adaptación por breakpoints
- **Lazy loading**: Carga de imágenes bajo demanda
- **Modal de vista**: Ampliación de imágenes

### ReviewSection
**Ubicación**: `components/review/ReviewSection.tsx`

Sistema completo de reseñas de usuarios:

- **Autenticación**: Solo usuarios logueados
- **CRUD completo**: Crear, leer, actualizar reseñas
- **Sistema de estrellas**: Valoración 1-10 con medias estrellas
- **Edición inline**: Modificar reseñas propias
- **Estados de carga**: Loading, error, vacío

## 📊 Tipos y Interfaces

### Tipos Base
**Ubicación**: `types/mediaBase.ts`

```typescript
interface Media {
  id: string;
  titulo: string;
  sinopsis: string;
  fecha: string;
  generos: string[];
  poster: string;
  backdrop: string;
  puntuacion: number;
  tipo: MediaType;
  actores: Actor[];
  trailers: Trailer[];
  proveedores?: WatchProvider[];
  duracion?: number;
  creador?: Creator;
  imagenes?: Image[];
}

type MediaType = 'serie' | 'pelicula';
```

### Tipos Específicos
**Ubicación**: `types/content.ts`

```typescript
interface Serie extends Media {
  temporadas: number;
  episodios: number;
  creadores?: Creator[];
  // Campos de TMDB
  name?: string;
  first_air_date?: string;
}

interface Pelicula extends Media {
  duracion: number;
  // Campos de TMDB
  title?: string;
  release_date?: string;
}
```

### Tipos de Personas
**Ubicación**: `types/people.ts`

```typescript
interface Actor {
  id: string;
  nombre: string;
  personaje: string;
  foto: string;
}

interface Creator {
  id: number;
  nombre: string;
  foto: string;
}
```

## 🌐 Servicios y API

### galleryService
**Ubicación**: `services/galleryService.ts`

Servicio para obtener imágenes de media:

```typescript
const getMediaImages = (
  mediaId: string, 
  mediaType: 'movie' | 'series'
): Promise<WallpapersResponse>
```

#### Funcionalidades:
- **Endpoints dinámicos**: Películas y series
- **Timeout handling**: AbortController con 10s timeout
- **Transformación**: Mapeo de datos de API a formato interno
- **Error resilience**: Fallback a arrays vacíos

### Servicios de Metadatos
**Ubicación**: `services/movieMetadata.ts` / `seriesMetadata.ts`

Servicios especializados para metadatos específicos por tipo de media.

## 🎨 Sistema de Diseño

### Layout y Spacing
- **Hero height**: 80vh mínimo
- **Container**: mx-auto con padding responsive
- **Sections**: mb-12 pt-8 para espaciado consistente
- **Negative margin**: -mt-20 para overlay de contenido

### Responsive Breakpoints
- **Mobile**: < 768px - Layout vertical, controles simplificados
- **Tablet**: 768px-1024px - Layout intermedio
- **Desktop**: ≥ 1024px - Layout completo con sidebar

### Colores y Efectos
- **Background**: #0F0F0F base, #18181b/80 para cards
- **Text**: text-white principal, text-gray-300 secundario
- **Accent**: pixela-accent para elementos importantes
- **Borders**: border-white/10 para separaciones sutiles

### Componentes Visuales
- **Gradientes**: backdrop overlays con múltiples capas
- **Blur effects**: backdrop-blur en modales y overlays
- **Shadows**: shadow-lg en cards elevados
- **Transitions**: duration-300 para interacciones

## 🔗 Dependencias

### Externas
- `embla-carousel-react`: Slider de reparto avanzado
- `next/image`: Optimización de imágenes
- `react-icons/fi`: Iconos Feather
- `clsx`: Utilidad para clases CSS condicionales
- `zustand`: Gestión de estado global

### Internas
- `@/api/reviews/reviews`: API de reseñas
- `@/stores/useAuthStore`: Store de autenticación
- `@/api/shared/apiEndpoints`: Endpoints de API
- `@/api/shared/apiHelpers`: Helpers de API

## 📱 Uso

```tsx
import { MediaPage } from '@/features/media';

// En una página de detalles
<MediaPage media={mediaData} />
```

### Estructura de datos requerida:
```tsx
interface Media {
  id: string;
  titulo: string;
  tipo: 'pelicula' | 'series';
  poster: string;
  backdrop: string;
  // ... otros campos
}
```

## 🛠️ Configuración

### Breakpoints para CastSection:
```typescript
const BREAKPOINTS = {
  mobile: 768,    // < 768px
  tablet: 1024,   // 768px - 1024px
  desktop: 1024   // >= 1024px
};
```

### Límites de display:
```typescript
const CAST_GRID_LIMIT = 6; // Máximo para grid en desktop
```

### Timeouts de servicios:
```typescript
const API_TIMEOUT = 10000; // 10 segundos
```

## 🎯 Características Principales

- ✅ **Hero visual completo**: Backdrop, poster, metadatos y acciones
- ✅ **Sistema de reseñas**: CRUD completo con autenticación
- ✅ **Galería multimedia**: Imágenes categorizadas con lazy loading y retry
- ✅ **Reparto dinámico**: Grid/slider adaptativo según contenido
- ✅ **Trailers integrados**: Reproducción de contenido promocional con lista
- ✅ **Proveedores de streaming**: Información de disponibilidad con URLs dinámicas
- ✅ **Modal de poster**: Vista ampliada de imágenes
- ✅ **Responsive design**: Adaptación completa a dispositivos
- ✅ **Estados de carga**: Loading, error y vacío con retry
- ✅ **Optimización de imágenes**: Next.js Image con lazy loading
- ✅ **Manejo de errores**: Sistema robusto de manejo de errores
- ✅ **Debug logging**: Sistema de logs para debugging
- ✅ **Timeout handling**: Prevención de requests colgados

## 🚀 Optimizaciones

### Rendimiento
- **Lazy loading**: Imágenes de galería bajo demanda
- **Component splitting**: Separación en subcomponentes especializados
- **API timeout**: Prevención de requests colgados
- **Conditional rendering**: Grid vs slider según contexto

### UX/UI
- **Layout adaptativo**: Desktop sidebar, móvil vertical
- **Feedback visual**: Estados de loading y error claros
- **Interacciones fluidas**: Transiciones de 300ms
- **Navigation controls**: Slider con controles cuando es necesario

### Accesibilidad
- **Alt texts**: Imágenes con descripciones apropiadas
- **Keyboard navigation**: Soporte para navegación con teclado
- **Focus management**: Estados de foco visibles
- **ARIA labels**: Etiquetas descriptivas en controles

## 📝 Notas Importantes

- **Autenticación requerida**: Reviews solo para usuarios logueados
- **Tipos híbridos**: Media base con extensiones para Serie/Pelicula
- **TMDB compatibility**: Campos opcionales para compatibilidad con TMDB
- **Error boundaries**: Fallbacks para fallos de API con retry
- **Device detection**: Lógica para optimizar por dispositivo
- **Image optimization**: Múltiples formatos y tamaños
- **Estado global**: Uso de Zustand para estado compartido
- **Debug logging**: Sistema de logs para facilitar debugging
- **Timeout handling**: Prevención de requests colgados con AbortController
- **URL dinámicas**: Sistema de URLs dinámicas para plataformas de streaming

## 🔧 Extensibilidad

### Para añadir nuevas secciones:
1. Crear componente en directorio apropiado
2. Exportar en `components/index.ts`
3. Integrar en `MediaPage.tsx`
4. Añadir tipos necesarios si es requerido

### Para modificar layout responsive:
1. Ajustar breakpoints en componentes afectados
2. Actualizar clases CSS responsive
3. Revisar lógica de device detection

### Para añadir nuevos tipos de media:
1. Extender `MediaType` en `types/mediaBase.ts`
2. Crear interfaz específica en `types/content.ts`
3. Actualizar servicios y componentes según necesidad
4. Añadir lógica de mapeo en `HeroSection.tsx`

### Para modificar el estado global:
1. Actualizar tipos en `store/types.ts`
2. Modificar implementación en `store/mediaStore.ts`
3. Actualizar componentes que usan el store 