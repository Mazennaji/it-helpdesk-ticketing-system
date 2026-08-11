import { useEffect, useState } from "react";
import { fetchSlaSummary } from "../api/slaService";

export default function SlaSummaryStrip() {
  const [sla, setSla] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchSlaSummary()
      .then((d) => active && setSla(d))
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  if (loading || !sla) return null;

  const compliance = sla.compliancePercent ?? 100;
  const complianceColor =
    compliance >= 90 ? "#10B981" : compliance >= 75 ? "#F59E0B" : "#EF4444";

  const cells = [
    { label: "SLA Breached", value: sla.breached, accent: "#EF4444" },
    { label: "Due Soon", value: sla.dueSoon, accent: "#F59E0B" },
    { label: "On Track", value: sla.onTrack, accent: "#10B981" },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">SLA Overview</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Resolution targets by priority · Critical 4h · High 8h · Medium 24h · Low 72h
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold tracking-tight" style={{ color: complianceColor }}>
            {compliance}%
          </p>
          <p className="text-xs text-slate-400">compliance</p>
        </div>
      </div>

      <div className="h-2 rounded-full bg-slate-100 overflow-hidden mb-5">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${compliance}%`, backgroundColor: complianceColor }}
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        {cells.map((c) => (
          <div key={c.label} className="rounded-lg border border-slate-100 bg-slate-50/60 px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.accent }} />
              <span className="text-xs font-medium text-slate-500">{c.label}</span>
            </div>
            <p className="text-2xl font-semibold text-slate-900 tracking-tight">{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}