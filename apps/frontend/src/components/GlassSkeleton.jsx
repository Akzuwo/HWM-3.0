export function GlassSkeleton({ label = 'Inhalte werden geladen', rows = 3, compact = false }) {
  return (
    <div
      className={`loading-glass-placeholder${compact ? ' loading-glass-placeholder--compact' : ''}`}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <span className="visually-hidden">{label}</span>
      {Array.from({ length: rows }, (_, index) => (
        <span className="loading-glass-placeholder__row" key={index} aria-hidden="true"></span>
      ))}
    </div>
  );
}
