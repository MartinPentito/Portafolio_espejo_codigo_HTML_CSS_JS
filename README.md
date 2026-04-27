# Portfolio - Martín Pentito

Portfolio web estático con estética inspirada en editor de código.

## Archivos principales

```
Portafolio_espejo_codigo_HTML_CSS_JS/
├── index.html
├── css/
│   └── styles.css
├── js/
│   └── script.js
├── data/
│   └── data.json
└── README.md
```

## Cómo funciona

- `index.html` define la estructura base del portfolio.
- `js/script.js` carga `data/data.json` y renderiza el contenido en pantalla.
- `css/styles.css` mantiene la estética tipo editor y el diseño responsive.
- `data/data.json` es la fuente única de datos del perfil.

## Edición de contenido

Para actualizar el portfolio, modifica `data/data.json`.

- `personal`: nombre, rol, enfoque, ubicación y foto.
- `platforms`, `techStack`, `tools`: stack y herramientas.
- `media`: enlaces públicos.
- `languages`, `profile`: idiomas y rasgos.
- `highlights`, `projects`: resumen técnico y proyectos.

## Ejecución

Usa Live Server o cualquier servidor local para abrir `index.html`.

Si abres el archivo directamente con `file://`, algunos navegadores bloquean la carga de `data/data.json`.

## Nota sobre la imagen

Si `profile.jpg` no existe, la interfaz muestra automáticamente un fallback con las iniciales.
