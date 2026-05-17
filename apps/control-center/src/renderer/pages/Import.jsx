import { Card, Stat } from "./shared.jsx";

export default function Import({ info, actions }) {
  return (
    <div className="page">
      <div className="page-title"><h1>Import</h1><button onClick={() => actions.openFolder("imports")}>Importsordner oeffnen</button></div>
      <Card title="Import-Bereich">
        <Stat label="Ordner" value={info?.paths?.imports || "-"} />
        <button onClick={() => actions.openControlPanel("/server/import")}>Lokales Controlpanel Import</button>
      </Card>
    </div>
  );
}
