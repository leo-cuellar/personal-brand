/**
 * Background Service Worker
 * Maneja comunicación entre content script y popup
 */

chrome.runtime.onInstalled.addListener(() => {
  console.log("Social Assistant extension installed");
});

// Escuchar mensajes del content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "ADD_IDEA") {
    // Llamar a la API del backend para agregar idea
    handleAddIdea(message.data)
      .then((result) => {
        sendResponse({ success: true, data: result });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
    return true; // Indica que responderemos de forma asíncrona
  }

  // Mantener compatibilidad con mensajes antiguos (por si acaso)
  if (message.type === "ADD_INSPIRATION") {
    // Redirigir a ADD_IDEA para mantener compatibilidad
    handleAddIdea({
      text: message.data.text,
      description: message.data.description,
      personalBrandId: message.data.personalBrandId,
      metadata: message.data.metadata,
    })
      .then((result) => {
        sendResponse({ success: true, data: result });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }
});

async function handleAddIdea(data: {
  text: string;
  description?: string;
  personalBrandId?: string;
  metadata?: {
    author_profile_name?: string;
    author_profile_url?: string;
    post_url?: string;
    post_date?: string;
  };
}) {
  const apiBaseUrl = await getApiBaseUrl();

  if (!apiBaseUrl) {
    throw new Error("API base URL not configured. Please set it in the extension popup.");
  }

  // Construir el payload para crear la idea
  const payload = {
    title: "LinkedIn Post",
    description: data.description?.trim() || "Publication about the same topic and similar content",
    status: "accepted" as const,
    source: "linkedin_post" as const,
    sourceSummary: data.text, // El texto completo del post
    metadata: data.metadata || null,
    personalBrandId: data.personalBrandId || "00000000-0000-0000-0000-000000000001",
    link: null,
    isArchived: false,
  };

  const response = await fetch(`${apiBaseUrl}/api/publication-ideas`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let errorMessage = "Failed to add idea";
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch {
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  const result = await response.json();
  return result;
}

async function getApiBaseUrl(): Promise<string> {
  // Por defecto, usar localhost en desarrollo
  const result = await chrome.storage.sync.get(["apiBaseUrl"]);
  return result.apiBaseUrl || "http://localhost:3000";
}

