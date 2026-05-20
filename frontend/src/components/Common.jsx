export function Metric({ value, label }) {
  return (
    <div className="metric-pill">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

export function ToggleGroup({ label, options, value, onChange }) {
  return (
    <div className="toggle-group" aria-label={label}>
      <span className="toggle-label">{label}</span>
      <div className="toggle-options">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`toggle-chip ${value === option.value ? "is-active" : ""}`}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ListBlock({ title, items }) {
  return (
    <div>
      <h4>{title}</h4>
      <ul className="plain-list">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
