import { useEffect, useMemo, useState } from "react";
import Overview from "./pages/Overview.jsx";
import Server from "./pages/Server.jsx";
import Logs from "./pages/Logs.jsx";
import Database from "./pages/Database.jsx";
import Backups from "./pages/Backups.jsx";
import Import from "./pages/Import.jsx";
import Files from "./pages/Files.jsx";
import Settings from "./pages/Settings.jsx";
import Setup from "./pages/Setup.jsx";

const pages = [
  ["overview", "Overview", Overview],
  ["server", "Server", Server],
  ["logs", "Logs", Logs],
  ["database", "Database", Database],
  ["backups", "Backups", Backups],
  ["import", "Import", Import],
  ["files", "Files", Files],
  ["settings", "Settings", Settings]
];

const api = window.hwmControlCenter;

function Dot({ ok, warn }) {
  const className = ok ? "dot ok" : warn ? "dot warn" : "dot bad";
  return <span className={className} />;
}

export default function App() {
  const [active, setActive] = useState("overview");
  const [status, setStatus] = useState({ running: false, logs: [] });
  const [info, setInfo] = useState(null);
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState("");
  const [setupState, setSetupState] = useState(null);
  const ActivePage = useMemo(() => pages.find(([key]) => key === active)?.[2] || Overview, [active]);

  const refresh = async () => {
    const [nextStatus, nextInfo, nextSetup] = await Promise.all([api.getBackendStatus(), api.getAppInfo(), api.getSetupState()]);
    setStatus(nextStatus);
    setInfo(nextInfo);
    setSetupState(nextSetup);
  };

  useEffect(() => {
    refresh();
    const remove = api.onBackendUpdate(setStatus);
    const timer = setInterval(refresh, 4000);
    return () => {
      remove();
      clearInterval(timer);
    };
  }, []);

  const run = async (label, action) => {
    setBusy(label);
    setNotice("");
    try {
      const result = await action();
      setStatus(result?.running !== undefined ? result : await api.getBackendStatus());
      await refresh();
    } catch (error) {
      setNotice(error.message || String(error));
    } finally {
      setBusy("");
    }
  };

  const actions = {
    start: () => run("start", api.startBackend),
    stop: () => run("stop", api.stopBackend),
    restart: () => run("restart", api.restartBackend),
    openFolder: async (key) => {
      try {
        await api.openFolder(key);
      } catch (error) {
        setNotice(error.message || String(error));
      }
    },
    openControlPanel: (route) => api.openControlPanel(route),
    repairSetup: () => run("repair", api.repairSetup),
    refresh
  };

  const apiOk = Boolean(info?.api?.ok);
  const panelOk = Boolean(info?.panel?.ok);

  if (setupState && !setupState.installed) {
    return <Setup setupState={setupState} onReady={refresh} />;
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">HWM</span>
          <div>
            <strong>Server Control</strong>
            <small>Local cockpit</small>
          </div>
        </div>
        <nav>
          {pages.map(([key, label]) => (
            <button key={key} className={active === key ? "active" : ""} onClick={() => setActive(key)}>
              {label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="status-strip">
            <span><Dot ok={status.running} /> Backend {status.running ? "laeuft" : "aus"}</span>
            <span><Dot ok={apiOk} /> API 5000</span>
            <span><Dot ok={panelOk} warn={!panelOk} /> Panel 5050</span>
          </div>
          <div className="top-actions">
            <button className="primary" disabled={busy === "start"} onClick={actions.start}>Start</button>
            <button disabled={busy === "stop"} onClick={actions.stop}>Stop</button>
            <button disabled={busy === "restart"} onClick={actions.restart}>Restart</button>
          </div>
        </header>
        {notice && <div className="notice">{notice}</div>}
        <ActivePage status={status} info={info} setupState={setupState} actions={actions} />
      </main>
    </div>
  );
}
