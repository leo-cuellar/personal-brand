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
 * Extrae el link de la publicación (no del perfil del autor)
 */
function extractPostLink(postElement: HTMLElement): string {
  // Buscar link específico de la publicación
  const publicationLinkSelectors = [
    "a[href*='/feed/update/']", // Link directo a la publicación
    "a[href*='/activity-']", // Link de actividad
    "a[data-control-name='feed_update']", // Data attribute específico
    "a[href*='/posts/']", // Posts individuales
  ];

  for (const selector of publicationLinkSelectors) {
    const linkElement = postElement.querySelector<HTMLAnchorElement>(selector);
    if (linkElement?.href && !linkElement.href.includes("/in/")) {
      // Asegurarse de que no sea un link de perfil
      const href = linkElement.href.split("?")[0];
      if (href.includes("/feed/update/") || href.includes("/activity-") || href.includes("/posts/")) {
        return href;
      }
    }
  }

  // Buscar en el contenedor del post por data attributes
  const postContainer = postElement.closest("[data-urn]") || postElement;
  const dataUrn = postContainer.getAttribute("data-urn");
  if (dataUrn && dataUrn.includes("activity")) {
    // Construir link desde el data-urn
    const activityId = dataUrn.split(":activity:")[1]?.split(",")[0];
    if (activityId) {
      return `https://www.linkedin.com/feed/update/${activityId}`;
    }
  }

  // Fallback: usar URL actual si estamos en la página del post
  if (window.location.href.includes("/feed/update/") || window.location.href.includes("/activity-")) {
    return window.location.href.split("?")[0];
  }

  // Último fallback: construir desde la URL actual
  return window.location.href.split("?")[0];
}

/**
 * Extrae el autor del post y su perfil
 */
function extractPostAuthor(postElement: HTMLElement): { name: string; profileUrl?: string } {
  const authorSelectors = [
    "span.feed-shared-actor__name",
    "a[data-test-id='post-actor-name']",
    "span.visually-hidden", // A veces el nombre está en aria-label
  ];

  let authorName = "Unknown";
  let profileUrl: string | undefined;

  for (const selector of authorSelectors) {
    const authorElement = postElement.querySelector(selector);
    if (authorElement) {
      const text = authorElement.textContent?.trim();
      if (text && text.length > 0) {
        authorName = text;

        // Buscar link del perfil
        const linkElement = authorElement.closest("a") ||
          postElement.querySelector<HTMLAnchorElement>(`a[href*='/in/']`);
        if (linkElement?.href) {
          const href = linkElement.href.split("?")[0];
          if (href.includes("/in/")) {
            profileUrl = href;
          }
        }
        break;
      }
    }
  }

  // Si no encontramos el link, buscar en el contenedor del actor
  if (!profileUrl) {
    const actorLink = postElement.querySelector<HTMLAnchorElement>("a.feed-shared-actor__container-link, a[data-test-id='post-actor-name']");
    if (actorLink?.href && actorLink.href.includes("/in/")) {
      profileUrl = actorLink.href.split("?")[0];
    }
  }

  return { name: authorName, profileUrl };
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
  button.innerHTML = "<span class='social-assistant-button-icon'>+</span>";
  button.setAttribute("aria-label", "Agregar como inspiración");
  button.setAttribute("title", "Agregar como inspiración");
  button.setAttribute("data-post-link", postData.link);
  button.setAttribute("data-post-text", postData.text);

  button.addEventListener("click", async (e) => {
    e.preventDefault();
    e.stopPropagation();

    button.disabled = true;
    button.classList.add("loading");
    button.innerHTML = "<span class='social-assistant-button-icon'>...</span>";

    try {
      // Enviar mensaje al background service worker
      const response = await chrome.runtime.sendMessage({
        type: "ADD_INSPIRATION",
        data: {
          text: postData.text,
          metadata: postData.metadata,
        },
      });

      if (response.success) {
        button.classList.remove("loading");
        button.classList.add("success");
        button.innerHTML = "<span class='social-assistant-button-icon'>✓</span>";
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
      button.innerHTML = "<span class='social-assistant-button-icon'>✕</span>";
      button.disabled = false;
      setTimeout(() => {
        button.classList.remove("error");
        button.innerHTML = "<span class='social-assistant-button-icon'>+</span>";
      }, 3000);
    }
  });

  return button;
}

/**
 * Encuentra el contenedor adecuado para insertar el botón
 * El botón se posiciona en la esquina superior derecha del contenedor principal
 */
function findButtonContainer(postElement: HTMLElement): HTMLElement | null {
  // Buscar el contenedor principal del post (el div con data-id)
  const mainContainer = postElement.closest('div[data-id*="urn:li:activity"]');
  if (mainContainer) {
    return mainContainer as HTMLElement;
  }

  // Fallback: usar el elemento del post directamente
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

  const authorInfo = extractPostAuthor(postElement);

  const postData: LinkedInPost = {
    text,
    link: extractPostLink(postElement),
    author: authorInfo.name,
    metadata: {
      author_profile_name: authorInfo.name,
      author_profile_url: authorInfo.profileUrl,
    },
  };

  // Crear y agregar botón
  const button = createAddButton(postElement, postData);
  const container = findButtonContainer(postElement);

  if (container) {
    // Asegurar que el contenedor tenga position: relative para el posicionamiento absoluto
    const containerStyle = window.getComputedStyle(container);
    if (containerStyle.position === "static") {
      container.style.position = "relative";
    }

    // Asegurar que el contenedor tenga overflow visible para que el botón se vea fuera
    if (containerStyle.overflow === "hidden" || containerStyle.overflow === "clip") {
      container.style.overflow = "visible";
    }

    // Agregar el botón al contenedor (se posicionará absolutamente con CSS, fuera del rectángulo)
    container.appendChild(button);
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

