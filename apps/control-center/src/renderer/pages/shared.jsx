export function Badge({ ok, warn, children }) {
  return <span className={ok ? "badge ok" : warn ? "badge warn" : "badge bad"}>{children}</span>;
}

export function Card({ title, children, className = "" }) {
  return (
    <section className={`card ${className}`}>
      {title && <h2>{title}</h2>}
      {children}
    </section>
  );
}

export function Stat({ label, value, ok, warn }) {
  return (
    <div className="stat">
      <span>{label}</span>
      <strong className={ok ? "good" : warn ? "warn-text" : ""}>{value}</strong>
    </div>
  );
}

export function LogView({ logs = [] }) {
  const lines = logs.slice(-200);
  return (
    <pre className="log-view">
      {lines.length ? lines.map((line) => `[${new Date(line.time).toLocaleTimeString()}] ${line.source}: ${line.message}`).join("\n") : "Noch keine Prozesslogs."}
    </pre>
  );
}

export function formatBytes(size = 0) {
  if (!size) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(size) / Math.log(1024)), units.length - 1);
  return `${(size / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

export function formatUptime(ms = 0) {
  if (!ms) return "-";
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${h}h ${m}m ${s}s`;
}
