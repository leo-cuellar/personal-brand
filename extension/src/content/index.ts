/**
 * Content Script for LinkedIn
 * Se inyecta en las páginas de LinkedIn para detectar publicaciones
 */

import type { LinkedInPost } from "../types";

console.log("Social Assistant: Content script loaded");

// Selectores para posts de LinkedIn (pueden cambiar con actualizaciones de LinkedIn)
const POST_SELECTORS = [
  "div[data-id*='urn:li:activity']", // Posts en feed principal
  "article.feed-shared-update-v2", // Posts en feed
  "div.feed-shared-update-v2", // Variante del selector
  "article[data-id*='urn:li:activity']", // Posts con data-id
];

// Set para rastrear posts ya procesados
const processedPosts = new Set<string>();

// Clase para identificar botones de la extensión
const BUTTON_CLASS = "social-assistant-add-btn";
const BUTTON_DATA_ATTR = "data-social-assistant-processed";

/**
 * Extrae el texto de un post de LinkedIn
 */
function extractPostText(postElement: HTMLElement): string {
  // Intentar múltiples selectores para el contenido del post
  const textSelectors = [
    "div.feed-shared-text",
    "div.feed-shared-text__text-view",
    "span.break-words",
    "div[data-test-id='post-text']",
    "div.attributed-text-segment-list__content",
  ];

  for (const selector of textSelectors) {
    const textElement = postElement.querySelector(selector);
    if (textElement) {
      return textElement.textContent?.trim() || "";
    }
  }

  // Fallback: buscar cualquier texto visible
  return postElement.textContent?.trim() || "";
}

/**
 * Extrae el link del post
 */
function extractPostLink(postElement: HTMLElement): string {
  // Buscar link en el post
  const linkSelectors = [
    "a[href*='/feed/update/']",
    "a[href*='/activity-']",
    "a.relative",
  ];

  for (const selector of linkSelectors) {
    const linkElement = postElement.querySelector<HTMLAnchorElement>(selector);
    if (linkElement?.href) {
      return linkElement.href.split("?")[0]; // Remover query params
    }
  }

  // Fallback: usar URL actual si estamos en la página del post
  if (window.location.href.includes("/feed/update/") || window.location.href.includes("/activity-")) {
    return window.location.href.split("?")[0];
  }

  return window.location.href;
}

/**
 * Extrae el autor del post
 */
function extractPostAuthor(postElement: HTMLElement): string {
  const authorSelectors = [
    "span.feed-shared-actor__name",
    "a[data-test-id='post-actor-name']",
    "span.visually-hidden", // A veces el nombre está en aria-label
  ];

  for (const selector of authorSelectors) {
    const authorElement = postElement.querySelector(selector);
    if (authorElement) {
      const text = authorElement.textContent?.trim();
      if (text && text.length > 0) {
        return text;
      }
    }
  }

  return "Unknown";
}

/**
 * Genera un ID único para el post basado en su contenido y posición
 */
function generatePostId(postElement: HTMLElement): string {
  const text = extractPostText(postElement);
  const link = extractPostLink(postElement);
  // Usar hash simple del texto + link
  return `${link}-${text.substring(0, 50)}`.replace(/[^a-zA-Z0-9]/g, "-");
}

/**
 * Crea el botón para agregar como inspiración
 */
function createAddButton(postElement: HTMLElement, postData: LinkedInPost): HTMLButtonElement {
  const button = document.createElement("button");
  button.className = `social-assistant-button ${BUTTON_CLASS}`;
  button.textContent = "➕ Agregar como inspiración";
  button.setAttribute("data-post-link", postData.link);
  button.setAttribute("data-post-text", postData.text);

  button.addEventListener("click", async (e) => {
    e.preventDefault();
    e.stopPropagation();

    button.disabled = true;
    button.classList.add("loading");
    button.textContent = "Agregando...";

    try {
      // Enviar mensaje al background service worker
      const response = await chrome.runtime.sendMessage({
        type: "ADD_INSPIRATION",
        data: {
          text: postData.text,
          link: postData.link,
        },
      });

      if (response.success) {
        button.classList.remove("loading");
        button.classList.add("success");
        button.textContent = "✅ Agregado";
        setTimeout(() => {
          button.style.display = "none";
        }, 2000);
      } else {
        throw new Error(response.error || "Failed to add inspiration");
      }
    } catch (error) {
      console.error("Error adding inspiration:", error);
      button.classList.remove("loading");
      button.classList.add("error");
      button.textContent = "❌ Error";
      button.disabled = false;
      setTimeout(() => {
        button.classList.remove("error");
        button.textContent = "➕ Agregar como inspiración";
      }, 3000);
    }
  });

  return button;
}

/**
 * Encuentra el contenedor adecuado para insertar el botón
 */
function findButtonContainer(postElement: HTMLElement): HTMLElement | null {
  // Buscar contenedor de acciones del post
  const actionContainers = [
    postElement.querySelector("div.feed-shared-social-action-bar"),
    postElement.querySelector("div.social-actions-button"),
    postElement.querySelector("div.feed-shared-update-v2__actions"),
  ];

  for (const container of actionContainers) {
    if (container) {
      return container as HTMLElement;
    }
  }

  // Fallback: crear un contenedor al final del post
  return postElement;
}

/**
 * Procesa un post individual
 */
function processPost(postElement: HTMLElement): void {
  // Verificar si ya fue procesado
  const postId = generatePostId(postElement);
  if (processedPosts.has(postId) || postElement.hasAttribute(BUTTON_DATA_ATTR)) {
    return;
  }

  // Verificar si ya tiene nuestro botón
  if (postElement.querySelector(`.${BUTTON_CLASS}`)) {
    return;
  }

  // Extraer datos del post
  const text = extractPostText(postElement);
  if (!text || text.length < 10) {
    // Ignorar posts sin contenido suficiente
    return;
  }

  const postData: LinkedInPost = {
    text,
    link: extractPostLink(postElement),
    author: extractPostAuthor(postElement),
  };

  // Crear y agregar botón
  const button = createAddButton(postElement, postData);
  const container = findButtonContainer(postElement);

  if (container) {
    // Insertar botón al inicio del contenedor de acciones
    container.insertBefore(button, container.firstChild);
    postElement.setAttribute(BUTTON_DATA_ATTR, "true");
    processedPosts.add(postId);
  }
}

/**
 * Detecta y procesa todos los posts visibles
 */
function detectAndProcessPosts(): void {
  for (const selector of POST_SELECTORS) {
    const posts = document.querySelectorAll<HTMLElement>(selector);
    posts.forEach((post) => {
      try {
        processPost(post);
      } catch (error) {
        console.error("Error processing post:", error);
      }
    });
  }
}

// Observar cambios en el DOM (LinkedIn usa SPA)
const observer = new MutationObserver(() => {
  detectAndProcessPosts();
});

// Iniciar observación cuando el DOM esté listo
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
    detectAndProcessPosts();
  });
} else {
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
  detectAndProcessPosts();
}

// También detectar cuando se hace scroll (LinkedIn carga posts dinámicamente)
let scrollTimeout: number | null = null;
window.addEventListener("scroll", () => {
  if (scrollTimeout) {
    clearTimeout(scrollTimeout);
  }
  scrollTimeout = window.setTimeout(() => {
    detectAndProcessPosts();
  }, 500);
});

