import electron from "electron";

const { contextBridge, ipcRenderer } = electron;

const api = {
  startBackend: () => ipcRenderer.invoke("backend:start"),
  stopBackend: () => ipcRenderer.invoke("backend:stop"),
  restartBackend: () => ipcRenderer.invoke("backend:restart"),
  getBackendStatus: () => ipcRenderer.invoke("backend:status"),
  getLogs: () => ipcRenderer.invoke("logs:get"),
  getAppInfo: () => ipcRenderer.invoke("app:info"),
  getSetupState: () => ipcRenderer.invoke("setup:state"),
  initializeServerStorage: (options) => ipcRenderer.invoke("setup:initialize", options),
  repairSetup: () => ipcRenderer.invoke("setup:repair"),
  installPythonDependencies: () => ipcRenderer.invoke("setup:install-python-deps"),
  openFolder: (key) => ipcRenderer.invoke("open:folder", key),
  openControlPanel: (route) => ipcRenderer.invoke("open:control-panel", route),
  onBackendUpdate: (callback) => {
    const listener = (_event, status) => callback(status);
    ipcRenderer.on("backend:update", listener);
    return () => ipcRenderer.removeListener("backend:update", listener);
  }
};

contextBridge.exposeInMainWorld("hwmControlCenter", api);
