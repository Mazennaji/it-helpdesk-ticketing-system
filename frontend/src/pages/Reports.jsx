import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell,
} from "recharts";
import AppLayout from "../components/AppLayout";
import { fetchReportSummary, fetchReportTrend, fetchReportByCategory, fetchReportByPriority } from "../api/reportsService";

const RANGE_OPTIONS = [
  { label: "30 days", value: 30 },
  { label: "90 days", value: 90 },
  { label: "6 months", value: 180 },
];

const PRIORITY_COLORS = { Low: "#94A3B8", Medium: "#3B82F6", High: "#F59E0B", Critical: "#EF4444" };

const summaryCards = [
  { key: "totalOpenQueue", label: "Open Queue", accent: "#3B82F6" },
  { key: "inProgress", label: "In Progress", accent: "#F59E0B" },
  { key: "resolved", label: "Resolved", accent: "#10B981" },
  { key: "closed", label: "Closed", accent: "#64748B" },
  { key: "critical", label: "Critical", accent: "#EF4444" },
  { key: "pending", label: "Pending", accent: "#8B5CF6" },
];

const tooltipStyle = { fontSize: 12, borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "#0E1B33", color: "#E2E8F0" };

function toCsv(rows) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  return [headers.join(","), ...rows.map((r) => headers.map((h) => `"${String(r[h] ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");
}
function downloadCsv(filename, rows) {
  const blob = new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function Reports() {
  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState([]);
  const [byCategory, setByCategory] = useState([]);
  const [byPriority, setByPriority] = useState([]);
  const [range, setRange] = useState(90);
  const [loading, setLoading] = useState(true);

  const rootRef = useRef(null);
  const cardRefs = useRef([]);
  const trendRef = useRef(null);
  const breakdownRef = useRef(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([fetchReportSummary(), fetchReportTrend(range), fetchReportByCategory(), fetchReportByPriority()])
      .then(([s, t, c, p]) => {
        if (!active) return;
        setSummary(s); setTrend(t); setByCategory(c); setByPriority(p);
      })
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [range]);

  useEffect(() => {
    if (loading || !summary) return;
    const ctx = gsap.context(() => {
      gsap.set(cardRefs.current, { y: 24, opacity: 0 });
      gsap.set(trendRef.current, { y: 24, opacity: 0 });
      gsap.set(breakdownRef.current, { y: 24, opacity: 0 });
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.to(cardRefs.current, { y: 0, opacity: 1, duration: 0.5, stagger: 0.08 })
        .to(trendRef.current, { y: 0, opacity: 1, duration: 0.55 }, "-=0.2")
        .to(breakdownRef.current, { y: 0, opacity: 1, duration: 0.55 }, "-=0.3");
    }, rootRef);
    return () => ctx.revert();
  }, [loading, summary]);

  const totalTickets = byPriority.reduce((sum, p) => sum + p.count, 0);

  return (
    <AppLayout title="Reports" subtitle="Analytics and exportable insights across your support operation">
      <div ref={rootRef}>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="inline-flex rounded-lg border border-white/10 bg-[#0E1B33] p-1">
            {RANGE_OPTIONS.map((opt) => (
              <button key={opt.value} onClick={() => setRange(opt.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  range === opt.value ? "bg-white text-[#0B1F3A]" : "text-slate-400 hover:text-white"
                }`}>
                {opt.label}
              </button>
            ))}
          </div>
          <button onClick={() => downloadCsv(`ticket-trend-${range}d.csv`, trend)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-200 bg-[#0E1B33] border border-white/10 rounded-lg hover:bg-white/5 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Export Trend CSV
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {summaryCards.map((stat, i) => (
            <div key={stat.key} ref={(el) => (cardRefs.current[i] = el)}
              className="rounded-xl border border-white/8 bg-[#0E1B33] p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">{stat.label}</span>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: stat.accent, boxShadow: `0 0 8px ${stat.accent}` }} />
              </div>
              <p className="text-2xl font-semibold text-white tracking-tight">{summary?.[stat.key] ?? 0}</p>
            </div>
          ))}
        </div>

        <div ref={trendRef} className="rounded-xl border border-white/8 bg-[#0E1B33] p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm font-semibold text-white">Ticket Volume Over Time</h2>
              <p className="text-xs text-slate-500 mt-0.5">{totalTickets} tickets across the selected window</p>
            </div>
            <span className="text-xs text-slate-500">{RANGE_OPTIONS.find((o) => o.value === range)?.label}</span>
          </div>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="volFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} minTickGap={24} />
                <YAxis tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2.5} fill="url(#volFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div ref={breakdownRef} className="grid lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-white/8 bg-[#0E1B33] p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-semibold text-white">Tickets by Category</h2>
              <button onClick={() => downloadCsv("tickets-by-category.csv", byCategory)} className="text-xs font-medium text-blue-400 hover:text-blue-300">Export</button>
            </div>
            <div style={{ width: "100%", height: 260 }}>
              <ResponsiveContainer>
                <BarChart data={byCategory} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <YAxis type="category" dataKey="label" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} width={90} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                  <Bar dataKey="count" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border border-white/8 bg-[#0E1B33] p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-semibold text-white">Tickets by Priority</h2>
              <button onClick={() => downloadCsv("tickets-by-priority.csv", byPriority)} className="text-xs font-medium text-blue-400 hover:text-blue-300">Export</button>
            </div>
            <div style={{ width: "100%", height: 260 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={byPriority} dataKey="count" nameKey="label" innerRadius={55} outerRadius={85} paddingAngle={2} stroke="#0E1B33">
                    {byPriority.map((entry) => (<Cell key={entry.label} fill={PRIORITY_COLORS[entry.label] || "#94A3B8"} />))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              {byPriority.map((entry) => (
                <span key={entry.label} className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PRIORITY_COLORS[entry.label] || "#94A3B8" }} />
                  {entry.label} ({entry.count})
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}