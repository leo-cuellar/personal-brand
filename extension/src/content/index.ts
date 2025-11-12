/**
 * Content Script for LinkedIn
 * Se inyecta en las páginas de LinkedIn para detectar publicaciones
 */

console.log("Social Assistant: Content script loaded");

// Detectar cuando se carga una publicación
function detectPost() {
  // TODO: Implementar lógica para detectar posts de LinkedIn
  // y mostrar botón para agregar como inspiración
}

// Observar cambios en el DOM (LinkedIn usa SPA)
const observer = new MutationObserver(() => {
  detectPost();
});

// Iniciar observación cuando el DOM esté listo
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
    detectPost();
  });
} else {
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
  detectPost();
}

