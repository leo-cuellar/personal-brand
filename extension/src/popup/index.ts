/**
 * Popup UI
 * Interfaz de usuario para la extensión
 */

document.addEventListener("DOMContentLoaded", async () => {
  const apiUrlInput = document.getElementById("apiUrl") as HTMLInputElement;
  const saveButton = document.getElementById("saveSettings") as HTMLButtonElement;
  const statusDiv = document.getElementById("status") as HTMLDivElement;

  // Cargar configuración guardada
  const result = await chrome.storage.sync.get(["apiBaseUrl"]);
  if (result.apiBaseUrl) {
    apiUrlInput.value = result.apiBaseUrl;
  }

  // Guardar configuración
  saveButton.addEventListener("click", async () => {
    const apiUrl = apiUrlInput.value.trim();
    if (apiUrl) {
      await chrome.storage.sync.set({ apiBaseUrl: apiUrl });
      statusDiv.textContent = "Configuración guardada";
      statusDiv.className = "status success";
      setTimeout(() => {
        statusDiv.textContent = "Configuración";
        statusDiv.className = "status";
      }, 2000);
    }
  });
});

