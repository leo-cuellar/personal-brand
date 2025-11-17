/**
 * Background Service Worker
 * Maneja comunicación entre content script y popup
 */

chrome.runtime.onInstalled.addListener(() => {
  console.log("Social Assistant extension installed");
});

// Escuchar mensajes del content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "ADD_INSPIRATION") {
    // TODO: Implementar lógica para agregar inspiración
    // Llamar a la API del backend
    handleAddInspiration(message.data)
      .then((result) => {
        sendResponse({ success: true, data: result });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
    return true; // Indica que responderemos de forma asíncrona
  }
});

async function handleAddInspiration(data: {
  text: string;
  personalBrandId?: string;
  metadata?: {
    author_profile_name?: string;
    author_profile_url?: string;
  };
}) {
  const apiBaseUrl = await getApiBaseUrl();

  if (!apiBaseUrl) {
    throw new Error("API base URL not configured. Please set it in the extension popup.");
  }

  const response = await fetch(`${apiBaseUrl}/api/inspirations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: data.text,
      link: null, // LinkedIn posts don't need link
      personalBrandId: data.personalBrandId || "00000000-0000-0000-0000-000000000001",
      source: "linkedin_post",
      metadata: data.metadata || null,
    }),
  });

  if (!response.ok) {
    let errorMessage = "Failed to add inspiration";
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

