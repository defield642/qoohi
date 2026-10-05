const SERIES = [
  { key: "appAccounts", label: "App accounts", color: "#7c3aed" },
  { key: "familyLearners", label: "Family learners", color: "#ea580c" },
  { key: "institutions", label: "Institutions", color: "#db2777" },
  { key: "institutionLearners", label: "Institution learners", color: "#0891b2" },
];

export default function RegistrationGrowthChart({ data = [] }) {
  const rows = Array.isArray(data) ? data.slice(-6) : [];
  const maxValue = Math.max(1, ...rows.flatMap((row) => SERIES.map(({ key }) => Number(row[key]) || 0)));
  const chart = { left: 40, top: 18, width: 520, height: 150 };
  const groupWidth = chart.width / Math.max(rows.length, 1);
  const barWidth = Math.min(14, groupWidth / (SERIES.length + 1));
  const gridValues = [0, Math.ceil(maxValue / 2), maxValue];

  return (
    <div className="min-w-0">
      <div className="mb-3 flex flex-wrap gap-x-5 gap-y-2" aria-label="Chart legend">
        {SERIES.map((series) => (
          <span key={series.key} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
            <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: series.color }} aria-hidden="true" />
            {series.label}
          </span>
        ))}
      </div>
      {rows.length ? (
        <svg
          className="h-auto w-full overflow-visible"
          viewBox="0 0 600 215"
          role="img"
          aria-label="Monthly registration counts for app accounts, family learners, institutions, and institution learners"
        >
          <title>QOOHI monthly registrations</title>
          <desc>Aggregate registrations over the latest six months. No personal information is included.</desc>
          {gridValues.map((value, index) => {
            const y = chart.top + chart.height - (value / maxValue) * chart.height;
            return (
              <g key={`${value}-${index}`}>
                <line x1={chart.left} x2={chart.left + chart.width} y1={y} y2={y} stroke="#e2e8f0" strokeDasharray="4 5" />
                <text x={chart.left - 8} y={y + 4} textAnchor="end" fill="#64748b" fontSize="11">{value.toLocaleString()}</text>
              </g>
            );
          })}
          {rows.map((row, rowIndex) => {
            const center = chart.left + groupWidth * (rowIndex + 0.5);
            return (
              <g key={`${row.label}-${rowIndex}`}>
                {SERIES.map((series, seriesIndex) => {
                  const value = Number(row[series.key]) || 0;
                  const height = (value / maxValue) * chart.height;
                  const x = center + (seriesIndex - (SERIES.length - 1) / 2) * (barWidth + 3) - barWidth / 2;
                  const y = chart.top + chart.height - height;
                  return (
                    <rect
                      key={series.key}
                      x={x}
                      y={y}
                      width={barWidth}
                      height={height}
                      rx="3"
                      fill={series.color}
                    >
                      <title>{`${row.label}: ${series.label} ${value.toLocaleString()}`}</title>
                    </rect>
                  );
                })}
                <text x={center} y={chart.top + chart.height + 24} textAnchor="middle" fill="#475569" fontSize="11" fontWeight="600">
                  {row.label}
                </text>
              </g>
            );
          })}
        </svg>
      ) : (
        <p className="rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm font-medium text-slate-600">
          Registration activity will appear here as accounts are created.
        </p>
      )}
    </div>
  );
}
