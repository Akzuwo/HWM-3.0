import { Card, Stat, formatBytes } from "./shared.jsx";

export default function Database({ info, actions }) {
  const db = info?.database;
  return (
    <div className="page">
      <div className="page-title"><h1>Database</h1><button onClick={() => actions.openFolder("data")}>Datenordner oeffnen</button></div>
      <Card title="SQLite">
        <Stat label="Pfad" value={db?.path || "-"} ok={db?.exists} />
        <Stat label="Existiert" value={db?.exists ? "ja" : "nein"} ok={db?.exists} />
        <Stat label="Dateigroesse" value={formatBytes(db?.size)} />
        <Stat label="Geaendert" value={db?.modifiedAt ? new Date(db.modifiedAt).toLocaleString() : "-"} />
      </Card>
      <Card title="Panel">
        <button onClick={() => actions.openControlPanel("/server/files?area=data")}>Lokales Controlpanel Datenansicht</button>
      </Card>
    </div>
  );
}
