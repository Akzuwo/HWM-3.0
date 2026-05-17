import electron from "electron";
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { getBackendPaths, getPackagedResourceRoot } from "./paths.js";

const SERVER_DIRS = ["backend", "data", "logs", "imports", "exports", "backups", "config", "runtime"];
const INSTALL_INFO = "install-info.json";
const { app } = electron;

export function getServerPaths() {
  const localAppData = process.env.LOCALAPPDATA || path.resolve(app.getPath("appData"), "..", "Local");
  const serverHome = path.join(localAppData, "HWM Server Control Center", "server");
  return {
    serverHome,
    backendInstall: path.join(serverHome, "backend"),
    data: path.join(serverHome, "data"),
    logs: path.join(serverHome, "logs"),
    imports: path.join(serverHome, "imports"),
    exports: path.join(serverHome, "exports"),
    backups: path.join(serverHome, "backups"),
    config: path.join(serverHome, "config"),
    runtime: path.join(serverHome, "runtime"),
    sqlite: path.join(serverHome, "data", "hwm.sqlite"),
    installInfo: path.join(serverHome, INSTALL_INFO),
    backendExe: path.join(serverHome, "backend", "backend.exe"),
    runLocalServer: path.join(serverHome, "backend", "run_local_server.py")
  };
}

export function getAvailableBackendModes() {
  const resources = resolveResources();
  return {
    exe: fs.existsSync(resources.backendExe),
    python: fs.existsSync(resources.backendPython)
  };
}

export function readInstallInfo() {
  const paths = getServerPaths();
  try {
    return JSON.parse(fs.readFileSync(paths.installInfo, "utf-8"));
  } catch {
    return null;
  }
}

export function isServerInstalled() {
  const paths = getServerPaths();
  const info = readInstallInfo();
  return Boolean(info && fs.existsSync(paths.sqlite) && fs.existsSync(paths.backendInstall));
}

export async function initializeServerStorage({ backendMode = "exe", repair = false } = {}) {
  const paths = getServerPaths();
  const steps = [];
  const log = (step, ok = true, message = "") => steps.push({ step, ok, message });

  try {
    createServerDirs(paths);
    log("Ordner erstellen");

    const resources = resolveResources();
    const mode = backendMode === "exe" && fs.existsSync(resources.backendExe) ? "exe" : "python";
    if (backendMode === "exe" && mode !== "exe") {
      log("backend.exe pruefen", false, "backend.exe ist nicht im Paket enthalten; Python-Modus wird verwendet.");
    }

    installBackendFiles(resources, paths, mode, repair);
    log("Backenddateien kopieren");

    if (repair && fs.existsSync(paths.sqlite)) {
      backupDatabase(paths);
      log("Datenbank-Backup vor Reparatur");
    }

    const initResult = await runBackendInit(paths, mode);
    log("SQLite erzeugen und Schema initialisieren", initResult.ok, initResult.message);

    const now = new Date().toISOString();
    const previous = readInstallInfo();
    const info = {
      installedVersion: app.getVersion(),
      backendMode: mode,
      installPath: paths.serverHome,
      createdAt: previous?.createdAt || now,
      lastUpdatedAt: now
    };
    fs.writeFileSync(paths.installInfo, JSON.stringify(info, null, 2), "utf-8");
    log("Installationsinfo schreiben");

    return { ok: true, steps, installInfo: info, paths, availableModes: getAvailableBackendModes() };
  } catch (error) {
    writeSetupLog(paths, `ERROR ${new Date().toISOString()} ${error.stack || error.message}`);
    return { ok: false, steps, error: error.message, paths, availableModes: getAvailableBackendModes() };
  }
}

export async function getSetupState() {
  const paths = getServerPaths();
  return {
    installed: isServerInstalled(),
    installInfo: readInstallInfo(),
    paths,
    availableModes: getAvailableBackendModes(),
    sqliteExists: fs.existsSync(paths.sqlite)
  };
}

export async function installPythonDependencies() {
  const paths = getServerPaths();
  if (!fs.existsSync(paths.backendInstall)) {
    await initializeServerStorage({ backendMode: "python", repair: true });
  }
  const requirements = path.join(paths.backendInstall, "requirements.txt");
  if (!fs.existsSync(requirements)) {
    throw new Error("requirements.txt fehlt im installierten Backend.");
  }
  try {
    return await spawnCollect("py", ["-3", "-m", "pip", "install", "-r", requirements], { cwd: paths.backendInstall });
  } catch {
    return await spawnCollect("python", ["-m", "pip", "install", "-r", requirements], { cwd: paths.backendInstall });
  }
}

function createServerDirs(paths) {
  for (const dir of SERVER_DIRS) {
    fs.mkdirSync(paths[dir === "backend" ? "backendInstall" : dir], { recursive: true });
  }
}

function resolveResources() {
  const root = getPackagedResourceRoot();
  const devBackend = getBackendPaths().backendRoot;
  const backendPython = path.join(root, "backend-python");
  const backendExe = path.join(root, "backend-exe", "backend.exe");
  return {
    root,
    backendPython: fs.existsSync(backendPython) ? backendPython : devBackend,
    backendExe
  };
}

function installBackendFiles(resources, paths, mode, repair) {
  fs.mkdirSync(paths.backendInstall, { recursive: true });
  if (mode === "exe") {
    fs.copyFileSync(resources.backendExe, paths.backendExe);
  }

  copyDirectory(resources.backendPython, paths.backendInstall, {
    overwrite: repair,
    exclude: new Set(["data", "logs", "imports", "exports", "backups", "__pycache__", ".pytest_cache", ".venv", "venv", "tests"])
  });

  if (!fs.existsSync(path.join(paths.backendInstall, "schema.sql"))) {
    throw new Error("schema.sql fehlt in den Backend-Ressourcen.");
  }
  if (!fs.existsSync(paths.runLocalServer)) {
    throw new Error("run_local_server.py fehlt in den Backend-Ressourcen.");
  }
}

function copyDirectory(source, target, options) {
  if (!fs.existsSync(source)) {
    throw new Error(`Backend-Ressourcen nicht gefunden: ${source}`);
  }
  fs.mkdirSync(target, { recursive: true });
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    if (options.exclude.has(entry.name) || entry.name.startsWith(".env")) {
      continue;
    }
    const src = path.join(source, entry.name);
    const dest = path.join(target, entry.name);
    if (entry.isDirectory()) {
      copyDirectory(src, dest, options);
      continue;
    }
    if (/\.(sqlite|sqlite3|db|log)$/i.test(entry.name)) {
      continue;
    }
    if (["create_missing_tables.py", "create_remaining_tables.py", "import_from_mysql_dump.py"].includes(entry.name)) {
      continue;
    }
    if (!options.overwrite && fs.existsSync(dest)) {
      continue;
    }
    fs.copyFileSync(src, dest);
  }
}

function runBackendInit(paths, mode) {
  const command = mode === "exe" ? paths.backendExe : "py";
  const args = mode === "exe"
    ? ["--init-only", "--server-home", paths.serverHome]
    : ["-3", "run_local_server.py", "--init-only", "--server-home", paths.serverHome];
  return spawnCollect(command, args, { cwd: paths.backendInstall }).catch(() => {
    if (mode === "python") {
      return spawnCollect("python", ["run_local_server.py", "--init-only", "--server-home", paths.serverHome], { cwd: paths.backendInstall });
    }
    throw new Error("backend.exe konnte die SQLite-Initialisierung nicht ausfuehren.");
  });
}

function spawnCollect(command, args, options) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { ...options, shell: false, windowsHide: true, env: { ...process.env, PYTHONUNBUFFERED: "1" } });
    let stdout = "";
    let stderr = "";
    child.stdout?.on("data", (data) => { stdout += String(data); });
    child.stderr?.on("data", (data) => { stderr += String(data); });
    child.on("error", reject);
    child.on("exit", (code) => {
      const message = (stdout || stderr).trim();
      if (code === 0) {
        resolve({ ok: true, message });
      } else {
        reject(new Error(message || `${command} wurde mit Code ${code} beendet.`));
      }
    });
  });
}

function writeSetupLog(paths, line) {
  try {
    fs.mkdirSync(paths.logs, { recursive: true });
    fs.appendFileSync(path.join(paths.logs, "setup.log"), `${line}\n`, "utf-8");
  } catch {
    // Setup logging must not hide the original setup error.
  }
}

function backupDatabase(paths) {
  fs.mkdirSync(paths.backups, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  fs.copyFileSync(paths.sqlite, path.join(paths.backups, `hwm-before-repair-${stamp}.sqlite`));
}
