import { useState } from "react";
import { Card, Badge } from "./shared.jsx";

export default function Setup({ setupState, onReady }) {
  const defaultMode = setupState?.availableModes?.exe ? "exe" : "python";
  const [mode, setMode] = useState(defaultMode);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [depsResult, setDepsResult] = useState("");

  const runSetup = async () => {
    setBusy(true);
    setResult(null);
    const next = await window.hwmControlCenter.initializeServerStorage({ backendMode: mode });
    setResult(next);
    setBusy(false);
    if (next.ok) {
      await onReady();
    }
  };

  const installDeps = async () => {
    setBusy(true);
    setDepsResult("");
    try {
      const result = await window.hwmControlCenter.installPythonDependencies();
      setDepsResult(result.message || "Dependencies installiert.");
    } catch (error) {
      setDepsResult(error.message || String(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="setup-screen">
      <div className="setup-panel">
        <div className="brand setup-brand">
          <span className="brand-mark">HWM</span>
          <div>
            <strong>Server Control Center</strong>
            <small>First-Run-Setup</small>
          </div>
        </div>
        <h1>Serverumgebung einrichten</h1>
        <p className="muted">Die lokalen Serverdaten werden unter AppData gespeichert. Bestehende Daten werden nicht ueberschrieben.</p>

        <Card title="Backend-Modus">
          <label className="choice">
            <input type="radio" checked={mode === "exe"} disabled={!setupState?.availableModes?.exe} onChange={() => setMode("exe")} />
            <span>
              <strong>Empfohlen: Backend als .exe</strong>
              <small>Startet ohne Python und ohne installierte Python-Module.</small>
            </span>
            {setupState?.availableModes?.exe ? <Badge ok>verfuegbar</Badge> : <Badge warn>nicht gebaut</Badge>}
          </label>
          <label className="choice">
            <input type="radio" checked={mode === "python"} onChange={() => setMode("python")} />
            <span>
              <strong>Entwickler-Modus: Python-Dateien</strong>
              <small>Braucht Python und Backend-Dependencies auf dem System.</small>
            </span>
            <Badge ok={setupState?.availableModes?.python}>verfuegbar</Badge>
          </label>
        </Card>

        <Card title="Installationspfad">
          <code>{setupState?.paths?.serverHome}</code>
        </Card>

        <button className="primary large" disabled={busy} onClick={runSetup}>
          {busy ? "Richte ein..." : "Serverumgebung einrichten"}
        </button>
        {mode === "python" && (
          <button disabled={busy} onClick={installDeps}>Python-Dependencies installieren</button>
        )}
        {depsResult && <Card title="Dependency-Installation"><pre className="log-view">{depsResult}</pre></Card>}

        {result && (
          <Card title={result.ok ? "Setup abgeschlossen" : "Setup fehlgeschlagen"}>
            <div className="table">
              {(result.steps || []).map((step) => (
                <div className="row setup-row" key={step.step}>
                  <span>{step.step}</span>
                  <span>{step.ok ? "OK" : "Hinweis"}</span>
                  <span>{step.message}</span>
                </div>
              ))}
            </div>
            {result.error && <p className="notice inline">{result.error}</p>}
          </Card>
        )}
      </div>
    </div>
  );
}
