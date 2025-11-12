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
  link: string;
  personId?: string;
}) {
  // TODO: Obtener la URL base del backend desde storage o configuración
  const apiBaseUrl = await getApiBaseUrl();
  
  const response = await fetch(`${apiBaseUrl}/api/inspirations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: data.text,
      link: data.link,
      personId: data.personId,
      source: "manual",
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to add inspiration");
  }

  return await response.json();
}

async function getApiBaseUrl(): Promise<string> {
  // Por defecto, usar localhost en desarrollo
  const result = await chrome.storage.sync.get(["apiBaseUrl"]);
  return result.apiBaseUrl || "http://localhost:3000";
}

