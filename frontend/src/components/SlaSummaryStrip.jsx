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
    return () => { active = false; };
  }, []);

  if (loading || !sla) return null;

  const compliance = sla.compliancePercent ?? 100;
  const complianceColor = compliance >= 90 ? "#10B981" : compliance >= 75 ? "#F59E0B" : "#EF4444";

  const cells = [
    { label: "SLA Breached", value: sla.breached, accent: "#EF4444" },
    { label: "Due Soon", value: sla.dueSoon, accent: "#F59E0B" },
    { label: "On Track", value: sla.onTrack, accent: "#10B981" },
  ];

  return (
    <div className="glass p-6 mb-4 relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 neon-line opacity-40" />
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] text-blue-300/80 uppercase mb-1.5 font-mono">
            <span className="w-5 h-px bg-blue-400/50" /> Service levels
          </p>
          <h2 className="text-base font-semibold text-white">SLA Overview</h2>
          <p className="text-xs text-slate-500 mt-0.5">Critical 4h · High 8h · Medium 24h · Low 72h</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-semibold tracking-tight tabular-nums" style={{ color: complianceColor, textShadow: `0 0 24px ${complianceColor}66` }}>
            {compliance}%
          </p>
          <p className="text-xs text-slate-500">compliance</p>
        </div>
      </div>

      <div className="h-2 rounded-full bg-white/8 overflow-hidden mb-5">
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${compliance}%`, background: `linear-gradient(90deg, ${complianceColor}, ${complianceColor}bb)`, boxShadow: `0 0 16px ${complianceColor}` }} />
      </div>

      <div className="grid grid-cols-3 gap-3">
        {cells.map((c) => (
          <div key={c.label} className="rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3 hover:bg-white/[0.04] transition-colors">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full glow-dot" style={{ color: c.accent, backgroundColor: c.accent }} />
              <span className="text-xs font-medium text-slate-400">{c.label}</span>
            </div>
            <p className="text-2xl font-semibold text-white tracking-tight tabular-nums">{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}