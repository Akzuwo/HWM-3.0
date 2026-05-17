import { Badge, Card, LogView, Stat } from "./shared.jsx";

export default function Overview({ status, info, actions }) {
  return (
    <div className="page">
      <section className="hero-status">
        <div>
          <p>HWM Backend · {info?.installInfo?.backendMode === "exe" ? "backend.exe" : "Python-Dateien"}</p>
          <h1>{status.running ? "Backend laeuft" : "Backend ist gestoppt"}</h1>
          <span>{info?.paths?.serverHome || "Lokale Steuerung fuer Server, Daten, Logs und Panel."}</span>
        </div>
        <Badge ok={status.running}>{status.running ? "RUNNING" : "STOPPED"}</Badge>
      </section>

      <div className="grid three">
        <Card><Stat label="API 127.0.0.1:5000" value={info?.api?.ok ? "erreichbar" : "nicht erreichbar"} ok={info?.api?.ok} /></Card>
        <Card><Stat label="Panel 127.0.0.1:5050" value={info?.panel?.ok ? "erreichbar" : "nicht erreichbar"} ok={info?.panel?.ok} warn={!info?.panel?.ok} /></Card>
        <Card><Stat label="SQLite" value={info?.database?.exists ? "gefunden" : "nicht gefunden"} ok={info?.database?.exists} /></Card>
      </div>

      <Card title="Aktionen">
        <div className="button-grid">
          <button className="primary large" onClick={actions.start}>Backend starten</button>
          <button className="large" onClick={actions.stop}>Backend stoppen</button>
          <button className="large" onClick={actions.restart}>Backend neustarten</button>
          <button onClick={actions.repairSetup}>Setup reparieren</button>
          <button onClick={() => actions.openControlPanel("/server")}>Controlpanel oeffnen</button>
          <button onClick={() => actions.openFolder("server")}>Serverordner</button>
          <button onClick={() => actions.openFolder("backend")}>Backend-Ordner</button>
          <button onClick={() => actions.openFolder("data")}>Datenordner</button>
          <button onClick={() => actions.openFolder("logs")}>Logsordner</button>
        </div>
      </Card>

      <Card title="Letzte 20 Logzeilen">
        <LogView logs={(status.logs || []).slice(-20)} />
      </Card>
    </div>
  );
}
