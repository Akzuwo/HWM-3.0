import { spawn } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { getServerPaths, initializeServerStorage, readInstallInfo } from "./serverSetup.js";

const MAX_LOG_LINES = 1000;

export class BackendProcess {
  constructor(onUpdate) {
    this.child = null;
    this.startedAt = null;
    this.lastError = "";
    this.logs = [];
    this.onUpdate = onUpdate;
  }

  getStatus() {
    return {
      running: Boolean(this.child && !this.child.killed && this.child.exitCode === null),
      pid: this.child?.pid ?? null,
      startedAt: this.startedAt,
      uptimeMs: this.startedAt ? Date.now() - this.startedAt : 0,
      lastError: this.lastError,
      logs: this.logs.slice(-200)
    };
  }

  async start() {
    if (this.getStatus().running) {
      return this.getStatus();
    }

    const paths = getServerPaths();
    if (!fs.existsSync(paths.backendInstall)) {
      await initializeServerStorage({ backendMode: readInstallInfo()?.backendMode || "python", repair: true });
    }
    if (!fs.existsSync(paths.backendInstall)) {
      throw new Error(`Installierter Backend-Ordner nicht gefunden: ${paths.backendInstall}`);
    }

    const candidates = this.#buildStartCandidates(paths);
    let lastFailure = null;

    for (const candidate of candidates) {
      try {
        this.#appendLog("system", `Starte Backend: ${candidate.command} ${candidate.args.join(" ")}`);
        this.child = spawn(candidate.command, candidate.args, {
          cwd: paths.backendInstall,
          windowsHide: true,
          shell: false,
          env: { ...process.env, PYTHONUNBUFFERED: "1", HWM_SERVER_HOME: paths.serverHome }
        });
        this.startedAt = Date.now();
        this.lastError = "";
        this.#wireChild(candidate);
        this.#emit();
        return this.getStatus();
      } catch (error) {
        lastFailure = error;
        this.#appendLog("stderr", `${candidate.command} konnte nicht gestartet werden: ${error.message}`);
      }
    }

    const message = lastFailure?.message || "Python konnte nicht gestartet werden.";
    this.lastError = `Backend-Start fehlgeschlagen: ${message}. Pruefe, ob Python und die Backend-Abhaengigkeiten installiert sind.`;
    this.#emit();
    throw new Error(this.lastError);
  }

  async stop() {
    if (!this.getStatus().running) {
      return this.getStatus();
    }

    const child = this.child;
    this.#appendLog("system", "Stoppe Backend-Prozess...");
    if (process.platform === "win32") {
      spawn("taskkill", ["/pid", String(child.pid), "/T", "/F"], { windowsHide: true, shell: false });
    } else {
      child.kill("SIGTERM");
    }
    return await this.#waitForExit(child, 5000);
  }

  async restart() {
    await this.stop();
    return this.start();
  }

  getLogs(limit = 200) {
    return this.logs.slice(-limit);
  }

  #buildStartCandidates(paths) {
    const mode = readInstallInfo()?.backendMode || "python";
    const commonArgs = [
      "--server-home", paths.serverHome,
      "--api-host", "0.0.0.0",
      "--api-port", "5000",
      "--panel-host", "127.0.0.1",
      "--panel-port", "5050"
    ];
    if (mode === "exe" && fs.existsSync(paths.backendExe)) {
      return [{ command: paths.backendExe, args: commonArgs }];
    }
    if (fs.existsSync(paths.runLocalServer)) {
      return [
        { command: "py", args: ["-3", "run_local_server.py", ...commonArgs] },
        { command: "python", args: ["run_local_server.py", ...commonArgs] }
      ];
    }
    throw new Error("Kein Backend-Startpunkt gefunden. Bitte Setup reparieren.");
  }

  #wireChild(candidate) {
    const child = this.child;
    child.stdout?.on("data", (data) => this.#appendChunk("stdout", data));
    child.stderr?.on("data", (data) => this.#appendChunk("stderr", data));
    child.on("error", (error) => {
      this.lastError = `${candidate.command} Fehler: ${error.message}`;
      this.#appendLog("stderr", this.lastError);
      this.child = null;
      this.startedAt = null;
      this.#emit();
    });
    child.on("exit", (code, signal) => {
      this.#appendLog("system", `Backend beendet. Code=${code ?? "n/a"} Signal=${signal ?? "n/a"}`);
      if (code && code !== 0) {
        this.lastError = `Backend wurde mit Code ${code} beendet.`;
      }
      this.child = null;
      this.startedAt = null;
      this.#emit();
    });
  }

  #appendChunk(source, data) {
    String(data)
      .split(/\r?\n/)
      .map((line) => line.trimEnd())
      .filter(Boolean)
      .forEach((line) => this.#appendLog(source, line));
  }

  #appendLog(source, message) {
    this.logs.push({ time: new Date().toISOString(), source, message });
    if (this.logs.length > MAX_LOG_LINES) {
      this.logs = this.logs.slice(-MAX_LOG_LINES);
    }
    this.#emit();
  }

  #emit() {
    this.onUpdate?.(this.getStatus());
  }

  #waitForExit(child, timeoutMs) {
    return new Promise((resolve) => {
      const done = () => resolve(this.getStatus());
      const timer = setTimeout(done, timeoutMs);
      child.once("exit", () => {
        clearTimeout(timer);
        done();
      });
    });
  }
}

export function checkUrl(url, timeoutMs = 1500) {
  return new Promise((resolve) => {
    const request = http.get(url, { timeout: timeoutMs }, (response) => {
      response.resume();
      resolve({ ok: response.statusCode >= 200 && response.statusCode < 500, statusCode: response.statusCode });
    });
    request.on("timeout", () => {
      request.destroy();
      resolve({ ok: false, statusCode: null });
    });
    request.on("error", () => resolve({ ok: false, statusCode: null }));
  });
}

export function getFileInfo(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return {
      exists: true,
      path: filePath,
      size: stats.size,
      modifiedAt: stats.mtime.toISOString()
    };
  } catch {
    return { exists: false, path: filePath, size: 0, modifiedAt: null };
  }
}

export function readLogFiles(logsDir) {
  try {
    if (!fs.existsSync(logsDir)) {
      return [];
    }
    return fs
      .readdirSync(logsDir, { withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => {
        const filePath = path.join(logsDir, entry.name);
        const stats = fs.statSync(filePath);
        return { name: entry.name, path: filePath, size: stats.size, modifiedAt: stats.mtime.toISOString() };
      })
      .sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt));
  } catch {
    return [];
  }
}
