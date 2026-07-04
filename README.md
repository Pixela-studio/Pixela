# Pixela

**Autores:** Ruyi & Pablo | 2ºDAW  
**Copyright © 2026 Pablo Gil Díaz y Ruyi Xia Ye**

---

### 🌟 Introducción

**Pixela** es una plataforma interactiva diseñada para el descubrimiento y gestión de series y películas con una experiencia de usuario premium. Ofrece tendencias globales, búsqueda avanzada, perfiles personalizados y una comunidad activa de reseñas.

Este proyecto ha evolucionado desde sus inicios académicos hasta convertirse en una aplicación **Full Stack moderna con Next.js 15**, integrando las tecnologías más demandadas del mercado.

---

### 🚀 Stack Tecnológico

Pixela unifica frontend y backend en una arquitectura eficiente y escalable:

*   **Core:** [Next.js 16](https://nextjs.org/) (App Router & API Routes) + [React 19](https://react.dev/).
*   **Lenguaje:** [TypeScript](https://www.typescriptlang.org/).
*   **Base de Datos:** [PostgreSQL](https://www.postgresql.org/) en [Supabase](https://supabase.com/).
*   **ORM:** [Prisma](https://www.prisma.io/).
*   **Autenticación:** [Auth.js (NextAuth v5)](https://authjs.dev/).
*   **Estilos:** [Tailwind CSS](https://tailwindcss.com/) (Diseño "Glassmorphism").
*   **Datos:** API de [TMDB](https://www.themoviedb.org/).
*   **Package manager & runtime:** [Bun](https://bun.sh/).
*   **Despliegue:** [Vercel](https://vercel.com/).

### Requisitos y arranque local

```bash
cd pixela
bun install
bunx prisma generate
bun run dev
```

Necesitas [Bun ≥ 1.3](https://bun.sh/docs/installation). El proyecto usa `bun.lock` — no reintroduzcas `package-lock.json`.

**¿Cómo funciona?**
Toda la aplicación opera sobre Next.js. El frontend consume una API interna (`/api/...`) que actúa como proxy seguro hacia TMDB y gestiona la lógica de negocio (usuarios, favoritos) directamente contra la base de datos PostgreSQL, eliminando la necesidad de servidores backend externos complejos.

---

### ✨ Funcionalidades

*   🔥 **Tendencias y Cartelera:** Carruseles dinámicos actualizados diariamente.
*   🔍 **Buscador y Categorías:** Encuentra contenido por título o género.
*   👤 **Perfil Social:** Avatares personalizados, listas de favoritos y reseñas.
*   📱 **Diseño Adaptativo:** Experiencia fluida en Móvil, Tablet y PC.
*   🌗 **Modo Oscuro Premium:** Interfaz inmersiva para consumo de contenido.

---

### 📚 Recursos e Historial

*   **Repositorio GitHub:** [Historial de Commits](https://github.com/envyx10/Pixela/commits/main/)
*   **Ramas del Proyecto:** [Ramas Activas](https://github.com/envyx10/Pixela/branches/active)
*   **Diseño (Figma):** [Ver Proyecto Figma](https://www.figma.com/design/CPQe3LpPHQXKW1AWTYJhOG/PROYECTO-PIXELA.IO?m=auto&t=XRjSeFZfbLBWJ1JM-6)
*   **Anteproyecto:** [Notion](https://sphenoid-stone-975.notion.site/ANTEPROYECTO-PIXELA-1c2bccfbf6a4800c8945f8c8dfb77095)
*   **Documentación Técnica:** [Google Drive](https://docs.google.com/document/d/1xqrrvgyTaQhrhDkg3hRDdx-euwUsP8KDyauRK608kks/edit?usp=sharing)

**Vídeos del Proyecto:**
*   📅 **30/04/2025 (Check-In):** [Ver en Vimeo](https://vimeo.com/1080303986/9f50bbfb83?share=copy)
*   📅 **15/06/2025 (Entrega Final):** [Ver en Vimeo](https://vimeo.com/1093512042?share=copy)

---

### 👥 Autores y Contacto

| [Pablo Gil Díaz](https://www.linkedin.com/in/envyx10/) | [Ruyi Xia Ye](https://www.linkedin.com/in/ruyi-xia-ye-b19853189/) |
| :---: | :---: |
| Linkedin | Linkedin |

> **Copyright © 2026 Pablo Gil Díaz y Ruyi Xia Ye.** Todos los derechos reservados.
