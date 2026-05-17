import { useMemo, useState } from "react";
import { Card, LogView, formatBytes } from "./shared.jsx";

export default function Logs({ status, info, actions }) {
  const [filter, setFilter] = useState("");
  const logs = useMemo(() => {
    const query = filter.trim().toLowerCase();
    if (!query) return status.logs || [];
    return (status.logs || []).filter((line) => `${line.source} ${line.message}`.toLowerCase().includes(query));
  }, [status.logs, filter]);

  return (
    <div className="page">
      <div className="page-title"><h1>Logs</h1><button onClick={actions.refresh}>Neu laden</button></div>
      <Card title="Live stdout/stderr">
        <input className="search" value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Suchen oder filtern..." />
        <LogView logs={logs} />
      </Card>
      <Card title="Logdateien">
        <div className="table">
          {(info?.logFiles || []).length ? info.logFiles.map((file) => (
            <div className="row" key={file.path}>
              <code>{file.name}</code>
              <span>{formatBytes(file.size)}</span>
              <span>{new Date(file.modifiedAt).toLocaleString()}</span>
            </div>
          )) : <p className="muted">Keine Logdateien gefunden.</p>}
        </div>
      </Card>
    </div>
  );
}
