# Social Assistant Chrome Extension

Extensión de Chrome para agregar publicaciones de LinkedIn como inspiraciones en Social Assistant.

## Estructura

```
extension/
├── manifest.json          # Configuración de la extensión (Manifest V3)
├── tsconfig.json          # Configuración TypeScript
├── src/
│   ├── content/          # Content script (se inyecta en LinkedIn)
│   │   ├── index.ts
│   │   └── styles.css
│   ├── background/       # Service worker (background script)
│   │   └── index.ts
│   ├── popup/            # UI del popup de la extensión
│   │   ├── index.html
│   │   ├── index.ts
│   │   └── styles.css
│   └── types/            # Tipos TypeScript compartidos
│       └── index.ts
└── public/               # Assets estáticos (iconos, etc.)
    └── icons/
```

## Desarrollo

### Prerrequisitos

- Node.js y npm
- TypeScript
- Build tool (webpack, rollup, o esbuild)

### Build

La extensión necesita ser compilada de TypeScript a JavaScript. Puedes usar:

- **esbuild**: Rápido y simple
- **webpack**: Más configuración pero más flexible
- **rollup**: Bueno para bundles pequeños

### Cargar la extensión en Chrome

1. Compila el código TypeScript a JavaScript
2. Abre Chrome y ve a `chrome://extensions/`
3. Activa "Modo de desarrollador"
4. Haz clic en "Cargar extensión sin empaquetar"
5. Selecciona la carpeta `extension/`

## Funcionalidad

### Content Script (`src/content/index.ts`)

- Se inyecta automáticamente en páginas de LinkedIn
- Detecta publicaciones en el feed
- Muestra un botón para agregar como inspiración
- Extrae el texto y link de la publicación

### Background Service Worker (`src/background/index.ts`)

- Maneja comunicación entre content script y popup
- Realiza llamadas a la API del backend
- Gestiona almacenamiento local

### Popup (`src/popup/`)

- Interfaz para configurar la URL del backend
- Muestra estado de la extensión

## Integración con Services

La extensión puede importar funciones de `services/api-wrapper/` para hacer llamadas a la API:

```typescript
import { createInspiration } from "@services/api-wrapper/inspirations";

// Usar en el content script o background
await createInspiration({
  text: "Texto de la publicación",
  link: "https://linkedin.com/...",
  personId: "...",
  source: "manual"
});
```

## TODO

- [ ] Implementar detección de posts en LinkedIn
- [ ] Extraer texto y metadata de publicaciones
- [ ] Agregar botón UI en posts de LinkedIn
- [ ] Integrar con API wrapper de services
- [ ] Manejar autenticación/API keys
- [ ] Agregar iconos de la extensión
- [ ] Configurar build process (esbuild/webpack)
- [ ] Testing

