import { Badge, Card, Stat, formatUptime } from "./shared.jsx";

export default function Server({ status, info, actions }) {
  return (
    <div className="page">
      <div className="page-title"><h1>Server</h1><Badge ok={status.running}>{status.running ? "laeuft" : "aus"}</Badge></div>
      <Card title="Prozesssteuerung">
        <div className="button-grid compact">
          <button className="primary large" onClick={actions.start}>Start</button>
          <button className="large" onClick={actions.stop}>Stop</button>
          <button className="large" onClick={actions.restart}>Restart</button>
        </div>
      </Card>
      <div className="grid two">
        <Card title="Prozess">
          <Stat label="PID" value={status.pid || "-"} ok={status.running} />
          <Stat label="Startzeit" value={status.startedAt ? new Date(status.startedAt).toLocaleString() : "-"} />
          <Stat label="Uptime" value={formatUptime(status.uptimeMs)} />
          <Stat label="Letzter Fehler" value={status.lastError || "-"} warn={Boolean(status.lastError)} />
        </Card>
        <Card title="Ports">
          <Stat label="Port 5000 API" value={info?.api?.ok ? `OK (${info.api.statusCode})` : "nicht erreichbar"} ok={info?.api?.ok} />
          <Stat label="Port 5050 Panel" value={info?.panel?.ok ? `OK (${info.panel.statusCode})` : "nicht erreichbar"} ok={info?.panel?.ok} warn={!info?.panel?.ok} />
        </Card>
      </div>
    </div>
  );
}
