import electron from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { BackendProcess, checkUrl, getFileInfo, readLogFiles } from "./backendProcess.js";
import { ALLOWED_FOLDERS, getControlCenterRoot, getRendererEntry } from "./paths.js";
import { getServerPaths, getSetupState, initializeServerStorage, installPythonDependencies, readInstallInfo } from "./serverSetup.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const { app, BrowserWindow, ipcMain, shell, dialog } = electron;
const isDev = !app.isPackaged;
let mainWindow = null;

const backend = new BackendProcess((status) => {
  mainWindow?.webContents.send("backend:update", status);
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 960,
    minHeight: 620,
    title: "HWM Server Control Center",
    backgroundColor: "#0b1018",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    }
  });

  if (isDev) {
    mainWindow.loadURL(getRendererEntry(true));
  } else {
    mainWindow.loadFile(getRendererEntry(false));
  }
}

function folderPathForKey(key) {
  const paths = { ...getServerPaths(), dist: path.join(getControlCenterRoot(), "dist") };
  const property = ALLOWED_FOLDERS.get(key);
  return property ? paths[property] : null;
}

async function buildAppInfo() {
  const paths = getServerPaths();
  const installInfo = readInstallInfo();
  const [api, panel] = await Promise.all([
    checkUrl("http://127.0.0.1:5000/healthz"),
    checkUrl("http://127.0.0.1:5050")
  ]);
  return {
    version: app.getVersion(),
    installed: Boolean(installInfo),
    installInfo,
    paths,
    apiPort: 5000,
    panelPort: 5050,
    api,
    panel,
    database: getFileInfo(paths.sqlite),
    logFiles: readLogFiles(paths.logs)
  };
}

ipcMain.handle("backend:start", () => backend.start());
ipcMain.handle("backend:stop", () => backend.stop());
ipcMain.handle("backend:restart", () => backend.restart());
ipcMain.handle("backend:status", () => backend.getStatus());
ipcMain.handle("logs:get", () => ({ processLogs: backend.getLogs(500), logFiles: readLogFiles(getServerPaths().logs) }));
ipcMain.handle("app:info", buildAppInfo);
ipcMain.handle("setup:state", getSetupState);
ipcMain.handle("setup:initialize", (_event, options) => initializeServerStorage(options || {}));
ipcMain.handle("setup:repair", (_event) => initializeServerStorage({ backendMode: readInstallInfo()?.backendMode || "python", repair: true }));
ipcMain.handle("setup:install-python-deps", installPythonDependencies);
ipcMain.handle("open:folder", async (_event, key) => {
  const folderPath = folderPathForKey(key);
  if (!folderPath) {
    throw new Error("Dieser Ordner ist nicht freigegeben.");
  }
  const result = await shell.openPath(folderPath);
  return { ok: !result, message: result || "OK", path: folderPath };
});
ipcMain.handle("open:control-panel", async (_event, route = "/server") => {
  const allowedRoutes = new Set(["/server", "/server/dashboard", "/server/logs", "/server/files", "/server/import", "/server/files?area=data", "/server/files?area=backups"]);
  const safeRoute = allowedRoutes.has(route) ? route : "/server";
  await shell.openExternal(`http://127.0.0.1:5050${safeRoute}`);
  return { ok: true };
});

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", async (event) => {
  if (!backend.getStatus().running) {
    return;
  }
  event.preventDefault();
  const choice = dialog.showMessageBoxSync(mainWindow, {
    type: "question",
    buttons: ["Backend weiterlaufen lassen", "Backend stoppen"],
    defaultId: 0,
    cancelId: 0,
    title: "Backend laeuft noch",
    message: "Das HWM-Backend laeuft noch.",
    detail: "Soll das Backend beim Schliessen gestoppt werden?"
  });
  if (choice === 1) {
    await backend.stop();
  }
  app.exit(0);
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

export const controlCenterRoot = getControlCenterRoot();
