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
 * Extrae el texto de un post de LinkedIn preservando saltos de línea
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
    const textElement = postElement.querySelector(selector) as HTMLElement | null;
    if (textElement) {
      // Usar innerText para preservar saltos de línea naturales
      // innerText respeta el formato visual del texto, incluyendo saltos de línea
      let text = textElement.innerText || textElement.textContent || "";

      // Procesar el HTML para preservar saltos de línea de elementos de bloque
      const htmlContent = textElement.innerHTML || "";
      if (htmlContent) {
        // Convertir <br> y <br/> en saltos de línea
        text = htmlContent
          .replace(/<br\s*\/?>/gi, '\n')
          // Convertir párrafos y divs en saltos de línea
          .replace(/<\/p>/gi, '\n')
          .replace(/<\/div>/gi, '\n')
          // Remover todas las etiquetas HTML restantes
          .replace(/<[^>]*>/g, '')
          // Decodificar entidades HTML comunes
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'");
      }

      // Limpiar espacios múltiples pero preservar saltos de línea
      text = text
        .split('\n')
        .map((line: string) => line.trim())
        .filter((line: string) => line.length > 0)
        .join('\n')
        .trim();

      return text || "";
    }
  }

  // Fallback: buscar cualquier texto visible preservando formato
  const fallbackText = postElement.innerText || postElement.textContent || "";
  return fallbackText.trim();
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
 * Crea el botón "Save" para la barra de acciones sociales
 */
function createSaveActionButton(postElement: HTMLElement, postData: LinkedInPost): HTMLButtonElement {
  const button = document.createElement("button");
  button.className = `artdeco-button artdeco-button--muted artdeco-button--3 artdeco-button--tertiary social-actions-button flex-wrap ${BUTTON_CLASS}`;
  button.setAttribute("aria-label", "Save post as idea");
  button.setAttribute("type", "button");

  const buttonText = document.createElement("span");
  buttonText.className = "artdeco-button__text";

  const buttonContent = document.createElement("div");
  buttonContent.className = "flex-wrap justify-center artdeco-button__text align-items-center";

  // Ícono SVG de plus
  const iconSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  iconSvg.setAttribute("role", "none");
  iconSvg.setAttribute("aria-hidden", "true");
  iconSvg.setAttribute("class", "artdeco-button__icon");
  iconSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  iconSvg.setAttribute("width", "16");
  iconSvg.setAttribute("height", "16");
  iconSvg.setAttribute("viewBox", "0 0 16 16");

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", "M8 1a1 1 0 0 1 1 1v5h5a1 1 0 1 1 0 2H9v5a1 1 0 1 1-2 0V9H2a1 1 0 1 1 0-2h5V2a1 1 0 0 1 1-1z");
  path.setAttribute("fill", "currentColor");
  iconSvg.appendChild(path);

  // Texto "Save idea"
  const textSpan = document.createElement("span");
  textSpan.className = "artdeco-button__text social-action-button__text";
  textSpan.textContent = "Save idea";

  buttonContent.appendChild(iconSvg);
  buttonContent.appendChild(textSpan);
  buttonText.appendChild(buttonContent);
  button.appendChild(buttonText);

  // Ajustar estilos para centrar ícono y texto verticalmente
  buttonContent.style.cssText = "display: flex; align-items: center; gap: 6px;";
  iconSvg.style.cssText = "display: flex; align-items: center;";

  button.setAttribute("data-post-link", postData.link);
  button.setAttribute("data-post-text", postData.text);

  return button;
}

/**
 * Interfaz extendida para elementos con referencias al botón original
 */
interface HTMLElementWithButtonRef extends HTMLElement {
  _originalButtonContainer?: HTMLElement;
  _originalButton?: HTMLButtonElement;
}

/**
 * Crea el contenedor con el formulario para guardar como idea
 */
function createSaveForm(postElement: HTMLElement, postData: LinkedInPost, originalContainer: HTMLElement, originalButton: HTMLButtonElement): HTMLElementWithButtonRef {
  const container = document.createElement("div") as HTMLElementWithButtonRef;
  container.className = `social-assistant-save-form ${BUTTON_CLASS}`;
  container.style.cssText = `
    padding: 8px 16px 12px 16px;
    margin-top: 8px;
    border-top: 1px solid #e0e0e0;
    background-color: #f9f9f9;
    border-radius: 0 0 8px 8px;
  `;

  // Guardar referencias al botón original
  container._originalButtonContainer = originalContainer;
  container._originalButton = originalButton;

  // Input para descripción opcional
  const inputContainer = document.createElement("div");
  inputContainer.style.cssText = "margin-bottom: 12px;";

  const label = document.createElement("label");
  label.textContent = "Description (optional)";
  label.style.cssText = `
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: #666;
    margin-bottom: 6px;
  `;

  const textarea = document.createElement("textarea");
  textarea.className = "social-assistant-description-input";
  textarea.setAttribute("placeholder", "Add a description for this idea...");
  textarea.setAttribute("rows", "2");
  textarea.style.cssText = `
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 14px;
    font-family: inherit;
    resize: vertical;
    box-sizing: border-box;
  `;

  inputContainer.appendChild(label);
  inputContainer.appendChild(textarea);

  // Contenedor de botones
  const buttonsContainer = document.createElement("div");
  buttonsContainer.style.cssText = `
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  `;

  // Botón Cancel
  const cancelButton = document.createElement("button");
  cancelButton.className = "artdeco-button artdeco-button--muted artdeco-button--2 artdeco-button--tertiary";
  cancelButton.textContent = "Cancel";
  cancelButton.setAttribute("type", "button");
  cancelButton.addEventListener("click", () => {
    // Restaurar el botón original
    const originalContainer = container._originalButtonContainer;
    if (originalContainer && container.parentNode) {
      container.parentNode.replaceChild(originalContainer, container);
    } else {
      container.remove();
    }
  });

  // Botón Save
  const saveButton = document.createElement("button");
  saveButton.className = "artdeco-button artdeco-button--primary artdeco-button--2";

  const saveButtonText = document.createElement("span");
  saveButtonText.className = "artdeco-button__text";

  const saveButtonContent = document.createElement("div");
  saveButtonContent.style.cssText = "display: flex; align-items: center; gap: 6px; justify-content: center;";

  const saveIconSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  saveIconSvg.setAttribute("role", "none");
  saveIconSvg.setAttribute("aria-hidden", "true");
  saveIconSvg.setAttribute("class", "artdeco-button__icon");
  saveIconSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  saveIconSvg.setAttribute("width", "16");
  saveIconSvg.setAttribute("height", "16");
  saveIconSvg.setAttribute("viewBox", "0 0 16 16");
  saveIconSvg.style.cssText = "display: flex; align-items: center;";

  const saveIconPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
  saveIconPath.setAttribute("d", "M8 1a1 1 0 0 1 1 1v5h5a1 1 0 1 1 0 2H9v5a1 1 0 1 1-2 0V9H2a1 1 0 1 1 0-2h5V2a1 1 0 0 1 1-1z");
  saveIconPath.setAttribute("fill", "currentColor");
  saveIconSvg.appendChild(saveIconPath);

  const saveTextSpan = document.createElement("span");
  saveTextSpan.textContent = "Save idea";

  saveButtonContent.appendChild(saveIconSvg);
  saveButtonContent.appendChild(saveTextSpan);
  saveButtonText.appendChild(saveButtonContent);
  saveButton.appendChild(saveButtonText);

  saveButton.setAttribute("type", "button");

  // Manejar el guardado de la idea
  saveButton.addEventListener("click", async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Deshabilitar el botón mientras se guarda
    saveButton.disabled = true;
    const originalText = saveTextSpan.textContent;
    saveTextSpan.textContent = "Saving...";

    try {
      // Enviar mensaje al background service worker
      const response = await chrome.runtime.sendMessage({
        type: "ADD_IDEA",
        data: {
          text: postData.text, // sourceSummary
          description: textarea.value.trim() || undefined, // description opcional
          personalBrandId: undefined, // Se usará el default en el backend
          metadata: {
            author_profile_name: postData.metadata?.author_profile_name,
            author_profile_url: postData.metadata?.author_profile_url,
            post_date: new Date().toISOString(),
          },
        },
      });

      if (response.success) {
        // Mostrar éxito brevemente
        saveTextSpan.textContent = "Saved!";
        setTimeout(() => {
          // Restaurar el botón original después de guardar
          const originalContainer = container._originalButtonContainer;
          if (originalContainer && container.parentNode) {
            container.parentNode.replaceChild(originalContainer, container);
          } else {
            container.remove();
          }
        }, 1000);
      } else {
        throw new Error(response.error || "Failed to save idea");
      }
    } catch (error) {
      console.error("Error saving idea:", error);
      saveButton.disabled = false;
      saveTextSpan.textContent = originalText || "Save idea";
      alert(`Error saving idea: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  });

  buttonsContainer.appendChild(cancelButton);
  buttonsContainer.appendChild(saveButton);

  container.appendChild(inputContainer);
  container.appendChild(buttonsContainer);

  return container;
}

/**
 * Crea el botón para agregar como inspiración (versión antigua, mantiene compatibilidad)
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
 * Encuentra el contenedor de acciones sociales (update-v2-social-activity)
 * donde se encuentran los botones Like, Comment, Repost, Send
 */
function findSocialActivityBar(postElement: HTMLElement): HTMLElement | null {
  // Buscar el div con clase update-v2-social-activity
  const socialActivityBar = postElement.querySelector(".update-v2-social-activity");
  return socialActivityBar as HTMLElement | null;
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
  const link = extractPostLink(postElement);

  const postData: LinkedInPost = {
    text,
    link,
    author: authorInfo.name,
    metadata: {
      author_profile_name: authorInfo.name,
      author_profile_url: authorInfo.profileUrl,
    },
  };

  // Intentar agregar el botón Save debajo del activity bar
  const socialActivityBar = findSocialActivityBar(postElement);
  if (socialActivityBar) {
    // Verificar si ya tiene nuestro botón o formulario
    const existingContainer = socialActivityBar.parentElement?.querySelector(`.${BUTTON_CLASS}`);
    if (!existingContainer) {
      const saveButton = createSaveActionButton(postElement, postData);

      // Crear contenedor para el botón debajo del activity bar
      const buttonContainer = document.createElement("div");
      buttonContainer.className = `social-assistant-save-container ${BUTTON_CLASS}`;
      buttonContainer.style.cssText = `
        padding: 12px 16px;
        margin-top: 8px;
        border-top: 1px solid #e0e0e0;
        display: flex;
        justify-content: center;
      `;

      // Hacer que el botón ocupe todo el ancho
      saveButton.style.cssText = "width: 100%; justify-content: center;";

      buttonContainer.appendChild(saveButton);

      // Insertar después del div update-v2-social-activity
      socialActivityBar.parentNode?.insertBefore(buttonContainer, socialActivityBar.nextSibling);

      // Cuando se hace click en el botón Save, reemplazarlo con el formulario
      saveButton.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Crear el formulario (pasa las referencias al botón original)
        const saveForm = createSaveForm(postElement, postData, buttonContainer, saveButton);

        // Reemplazar el contenedor del botón con el formulario
        buttonContainer.replaceWith(saveForm);
      });

      postElement.setAttribute(BUTTON_DATA_ATTR, "true");
      processedPosts.add(postId);
      return;
    }
  }

  // Fallback: agregar botón en la esquina superior derecha (comportamiento anterior)
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

