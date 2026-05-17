import { Card } from "./shared.jsx";

const folders = [
  ["backend", "Backend-Ordner"],
  ["data", "data"],
  ["logs", "logs"],
  ["imports", "imports"],
  ["exports", "exports"],
  ["backups", "backups"]
];

export default function Files({ actions }) {
  return (
    <div className="page">
      <div className="page-title"><h1>Files</h1></div>
      <Card title="Schnellzugriff">
        <div className="button-grid">
          {folders.map(([key, label]) => <button key={key} onClick={() => actions.openFolder(key)}>{label} oeffnen</button>)}
        </div>
      </Card>
    </div>
  );
}
