import { Card, Stat } from "./shared.jsx";

export default function Settings({ info }) {
  return (
    <div className="page">
      <div className="page-title"><h1>Settings</h1></div>
      <div className="grid two">
        <Card title="Ports">
          <Stat label="API-Port" value={info?.apiPort || 5000} />
          <Stat label="Panel-Port" value={info?.panelPort || 5050} />
        </Card>
        <Card title="App">
          <Stat label="Version" value={info?.version || "-"} />
          <Stat label="Backend-Modus" value={info?.installInfo?.backendMode || "-"} />
          <Stat label="Server-Home" value={info?.paths?.serverHome || "-"} />
          <Stat label="Backend-Pfad" value={info?.paths?.backendInstall || "-"} />
        </Card>
      </div>
      <Card title="Sicherheit">
        <p className="muted">Dieses Control Center ist fuer lokale Server-Laptops gedacht. Sensible Backend-Funktionen sollten nur lokal erreichbar sein; Secrets und rohe .env-Dateien werden hier nicht angezeigt.</p>
      </Card>
    </div>
  );
}
