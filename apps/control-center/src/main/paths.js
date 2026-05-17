import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function getRepoRoot() {
  const candidates = [
    process.env.HWM_REPO_ROOT,
    process.cwd(),
    __dirname,
    process.resourcesPath,
    path.dirname(process.execPath || "")
  ].filter(Boolean);

  for (const candidate of candidates) {
    const found = findRepoRoot(candidate);
    if (found) {
      return found;
    }
  }

  return path.resolve(__dirname, "..", "..", "..", "..");
}

function findRepoRoot(startPath) {
  let current = path.resolve(startPath);
  try {
    if (fs.existsSync(current) && fs.statSync(current).isFile()) {
      current = path.dirname(current);
    }
  } catch {
    return null;
  }

  while (true) {
    if (fs.existsSync(path.join(current, "apps", "backend", "app.py"))) {
      return current;
    }
    const parent = path.dirname(current);
    if (parent === current) {
      return null;
    }
    current = parent;
  }
}

export function getControlCenterRoot() {
  return path.resolve(__dirname, "..", "..");
}

export function getRendererEntry(isDev) {
  if (isDev) {
    return "http://127.0.0.1:5173";
  }
  return path.join(getControlCenterRoot(), "dist-renderer", "index.html");
}

export function getBackendPaths() {
  const repoRoot = getRepoRoot();
  const backendRoot = path.join(repoRoot, "apps", "backend");
  return {
    repoRoot,
    backendRoot,
    data: path.join(backendRoot, "data"),
    logs: path.join(backendRoot, "logs"),
    imports: path.join(backendRoot, "imports"),
    exports: path.join(backendRoot, "exports"),
    backups: path.join(backendRoot, "backups"),
    sqlite: path.join(backendRoot, "data", "hwm.sqlite"),
    runLocalServer: path.join(backendRoot, "run_local_server.py"),
    dist: path.join(repoRoot, "apps", "control-center", "dist")
  };
}

export function getPackagedResourceRoot() {
  if (process.resourcesPath && fs.existsSync(process.resourcesPath)) {
    return process.resourcesPath;
  }
  return path.join(getControlCenterRoot(), "resources");
}

export const ALLOWED_FOLDERS = new Map([
  ["server", "serverHome"],
  ["backend", "backendInstall"],
  ["data", "data"],
  ["logs", "logs"],
  ["imports", "imports"],
  ["exports", "exports"],
  ["backups", "backups"],
  ["runtime", "runtime"],
  ["dist", "dist"]
]);
