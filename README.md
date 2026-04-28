# Portfolio — Martín Pentito

Portfolio web estático con estética de editor de código (VSCode-like), desplegado en **GitHub Pages**.  
Funciona como **PWA** (Progressive Web App): instalable, cacheable y disponible offline.

🔗 **Demo en vivo:** [martinpentito.github.io/Portafolio_espejo_codigo_HTML_CSS_JS](https://martinpentito.github.io/Portafolio_espejo_codigo_HTML_CSS_JS/)

---

## Estructura del proyecto

```
Portafolio_espejo_codigo_HTML_CSS_JS/
├── index.html          # Shell HTML mínimo — todo el contenido se renderiza desde JS
├── manifest.json       # Configuración PWA (ícono, nombre, colores)
├── sw.js               # Service Worker: caché offline por estrategia
├── css/
│   └── styles.css      # Estilos VSCode-like, 3 temas, responsive 320px–4K
├── js/
│   └── script.js       # Lógica principal: i18n, temas, render, GitHub API, command palette
├── data/
│   └── data.json       # Fuente única de datos del perfil ← editar aquí
└── assets/
    ├── ThisJipi_img.png               # Foto de perfil
    ├── ThisJipi_img_backgroundoff.png # Ícono PWA / favicon
    ├── Pentito Martín.pdf             # CV descargable
    └── Certificados.pdf               # Certificados en PDF
```

---

## Cómo funciona

1. **`index.html`** define la estructura base (shell vacío).  
2. **`js/script.js`** carga `data/data.json` y la GitHub API en paralelo, anima el boot y renderiza el contenido como bloques de código Python estilizado.  
3. **`css/styles.css`** aplica la estética de editor con variables CSS intercambiables por tema.  
4. **`sw.js`** intercepta las peticiones y aplica estrategias de caché diferenciadas.

---

## Cómo ejecutar localmente

> ⚠️ Es necesario un servidor HTTP local porque `fetch('data/data.json')` falla con `file://`.

**Con VS Code + Live Server:**
1. Instalar la extensión [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer).
2. Click derecho en `index.html` → *Open with Live Server*.

**Con Python:**
```bash
python -m http.server 8080
# Abrir http://localhost:8080
```

**Con Node.js (npx):**
```bash
npx serve .
```

---

## Editar el contenido

Todo el contenido del portfolio vive en **`data/data.json`**. Modificar ese archivo actualiza automáticamente todas las secciones.

### Estructura de `data.json`

| Clave | Descripción |
|---|---|
| `personal` | Nombre, título, foco, ubicación, email, ruta del CV y foto |
| `summary` | Párrafo de presentación (objeto multilingüe) |
| `techStack` | Array de tecnologías (STACK) |
| `platforms` | Array de plataformas |
| `tools` | Array de herramientas |
| `media` | Array de links públicos `{ label, url }` (sidebar) |
| `languages` | Idiomas personales con nivel |
| `profile` | Array de rasgos de personalidad |
| `highlights` | Puntos clave del perfil |
| `experience` | Historial laboral (empresa, rol, período, descripción) |
| `education` | Formación académica (institución, título, período, descripción) |
| `services` | Servicios ofrecidos (título, descripción) |
| `projects` | Proyectos manuales (ver sección de proyectos) |

### Campos multilingüe

Los campos que contienen texto visible usan un objeto con las 4 claves de idioma:

```json
"title": {
  "es": "Texto en español",
  "en": "English text",
  "de": "Deutscher Text",
  "ja": "日本語テキスト"
}
```

Si un campo acepta solo un idioma, usá un string directo.

### Agregar un proyecto manual

Agregar un objeto al array `"projects"` en `data.json`:

```json
{
  "name": "Nombre del proyecto",
  "type": { "es": "Tipo", "en": "Type", "de": "Typ", "ja": "種別" },
  "stack": ["HTML", "CSS", "JavaScript"],
  "description": { "es": "...", "en": "...", "de": "...", "ja": "..." },
  "role":        { "es": "...", "en": "...", "de": "...", "ja": "..." },
  "duration":    { "es": "2 semanas", "en": "2 weeks", "de": "2 Wochen", "ja": "2週間" },
  "challenge":   { "es": "...", "en": "...", "de": "...", "ja": "..." },
  "solution":    { "es": "...", "en": "...", "de": "...", "ja": "..." },
  "result":      { "es": "...", "en": "...", "de": "...", "ja": "..." },
  "url": "https://...",
  "repoUrl": "https://github.com/..."
}
```

Los proyectos manuales se **fusionan** con los repositorios públicos de GitHub que tengan Pages activado. Si un proyecto manual y un repo de GitHub tienen el mismo `name`, el manual tiene precedencia.

---

## Funcionalidades

### Internacionalización (i18n)
4 idiomas: **ES · EN · DE · JA** — persistido en `localStorage`.  
Cambiar de idioma re-renderiza el portfolio sin recargar la página.

### Temas VSCode
3 temas intercambiables via botones en el sidebar:
- **Dark+** (por defecto)
- **Monokai**
- **Abyss**

El tema activo se persiste en `localStorage`. Los temas son variables CSS puras, aplicadas en `:root`.

### Command Palette
Atajo `Ctrl+K` / `⌘K` (o clic en el hint del statusbar).  
Comandos disponibles: navegar a sección, cambiar tema/idioma, copiar email, descargar CV, ver certificados.

### GitHub API
Carga automáticamente los repositorios públicos con GitHub Pages activado.  
Timeout de 5 s; si la API falla o aplica rate-limit (403/429), el portfolio carga igualmente.

### PWA (Service Worker)
Estrategias de caché por tipo de recurso:

| Recurso | Estrategia |
|---|---|
| HTML, CSS, JS, imágenes | Cache-first |
| `data.json` | Network-first con fallback a caché |
| GitHub API | Network-first con fallback a caché |
| CDN externo (Boxicons) | Solo red, sin cachear |

Para forzar actualización del caché, incrementar `CACHE_NAME` en `sw.js`.

---

## Archivos de script documentados

Cada función en `js/script.js` tiene JSDoc con descripción, parámetros y valor de retorno.  
Las secciones principales del script están delimitadas por comentarios `// ─── Sección ───`.

| Sección | Descripción |
|---|---|
| Inicialización | `DOMContentLoaded`, arranque de subsistemas |
| Idioma | `setLanguage`, `applyLanguageMetadata`, i18n |
| Mobile sidebar | Toggle colapsable en viewports ≤ 768 px |
| Tema | `applyTheme`, variables CSS, persistencia |
| Carga de datos | `loadPortfolio`, `fetchData`, `fetchGitHubRepos` |
| Animación de boot | Secuencia terminal tipo `python portfolio.py` |
| Renderizado | `renderPortfolio`, `buildSidebar`, SEO |
| Contenido principal | `buildMainContent`, secciones builders |
| Sistema de proyectos | Merge manual + GitHub, filtros |
| Media / links | Íconos SVG inline, links del sidebar |
| Helpers HTML | `codeLine`, `blankLine`, `cardGridLine`, etc. |
| Animaciones | Scroll, slideIn, typing, counters |
| Interacciones | Clipboard, tabs, scroll activo |
| Command palette | Apertura, cierre, filtrado, navegación por teclado |
| Utilidades | `t()`, `localizeDeep`, `normalizeSearchText`, `escapeHtml` |
| Seguridad | `escapeHtml` / `escapeAttribute` — prevención de XSS |

---

## Nota sobre la imagen de perfil

Si `assets/ThisJipi_img.png` no existe o falla al cargar, la interfaz muestra automáticamente un fallback circular con las iniciales del nombre. Esto se controla por CSS (clase `missing-image`) y se dispara por el evento `error` de la imagen.
