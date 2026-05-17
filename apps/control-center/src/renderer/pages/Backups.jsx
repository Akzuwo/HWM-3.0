import { Card, Stat } from "./shared.jsx";

export default function Backups({ info, actions }) {
  return (
    <div className="page">
      <div className="page-title"><h1>Backups</h1><button onClick={() => actions.openFolder("backups")}>Backupsordner oeffnen</button></div>
      <Card title="Backup-Bereich">
        <Stat label="Ordner" value={info?.paths?.backups || "-"} />
        <p className="muted">Backup-Liste ist vorbereitet; automatische Backups koennen in einer naechsten Version hier angebunden werden.</p>
        <button onClick={() => actions.openControlPanel("/server/files?area=backups")}>Lokales Controlpanel Backups</button>
      </Card>
    </div>
  );
}
