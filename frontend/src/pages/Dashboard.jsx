import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell,
} from "recharts";
import AppLayout from "../components/AppLayout";
import SlaSummaryStrip from "../components/SlaSummaryStrip";
import { GlassCard, SectionHeading } from "../components/premium";
import { useAuth } from "../context/AuthContext";
import {
  fetchDashboardSummary, fetchVolumeTrend, fetchByCategory, fetchByPriority,
} from "../api/dashboardService";

const statCards = [
  { key: "open", label: "Open", accent: "#3B82F6" },
  { key: "inProgress", label: "In Progress", accent: "#F59E0B" },
  { key: "resolved", label: "Resolved", accent: "#10B981" },
  { key: "critical", label: "Critical", accent: "#EF4444" },
];

const PRIORITY_COLORS = { Low: "#94A3B8", Medium: "#3B82F6", High: "#F59E0B", Critical: "#EF4444" };

const tooltipStyle = {
  fontSize: 12, borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(12,20,38,0.92)", backdropFilter: "blur(8px)", color: "#E2E8F0",
  boxShadow: "0 12px 40px -12px rgba(0,0,0,0.8)",
};

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState([]);
  const [byCategory, setByCategory] = useState([]);
  const [byPriority, setByPriority] = useState([]);
  const [loading, setLoading] = useState(true);

  const rootRef = useRef(null);
  const tileRefs = useRef([]);
  const valueRefs = useRef([]);
  const chartRef = useRef(null);
  const sideRef = useRef(null);

  useEffect(() => {
    Promise.all([fetchDashboardSummary(), fetchVolumeTrend(30), fetchByCategory(), fetchByPriority()])
      .then(([s, v, c, p]) => { setSummary(s); setTrend(v); setByCategory(c); setByPriority(p); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading || !summary) return;
    const ctx = gsap.context(() => {
      gsap.set(tileRefs.current, { y: 28, opacity: 0 });
      gsap.set(chartRef.current, { y: 28, opacity: 0 });
      gsap.set(sideRef.current, { y: 28, opacity: 0 });

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.to(tileRefs.current, { y: 0, opacity: 1, duration: 0.6, stagger: 0.09 })
        .to(chartRef.current, { y: 0, opacity: 1, duration: 0.6 }, "-=0.3")
        .to(sideRef.current, { y: 0, opacity: 1, duration: 0.6 }, "-=0.4");

      const values = { open: summary.open, inProgress: summary.inProgress, resolved: summary.resolved, critical: summary.critical };
      valueRefs.current.forEach((el, i) => {
        if (!el) return;
        const target = values[statCards[i].key] ?? 0;
        const counter = { val: 0 };
        gsap.to(counter, {
          val: target, duration: 1.3, delay: 0.25 + i * 0.09, ease: "power2.out",
          onUpdate: () => { el.textContent = Math.round(counter.val); },
        });
      });
    }, rootRef);
    return () => ctx.revert();
  }, [loading, summary]);

  return (
    <AppLayout
      title={`Welcome back${user?.fullName ? `, ${user.fullName.split(" ")[0]}` : ""}`}
      subtitle="Here's what's happening across your support queue today"
    >
      <div ref={rootRef} className="relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {statCards.map((stat, i) => (
            <div
              key={stat.key}
              ref={(el) => (tileRefs.current[i] = el)}
              className="glass glass-hover-lift sheen p-5 relative overflow-hidden"
            >
              <div className="absolute inset-x-0 top-0 h-px opacity-70"
                style={{ background: `linear-gradient(90deg, transparent, ${stat.accent}, transparent)` }} />
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">{stat.label}</span>
                <span className="w-2 h-2 rounded-full glow-dot" style={{ color: stat.accent, backgroundColor: stat.accent }} />
              </div>
              <p ref={(el) => (valueRefs.current[i] = el)} className="text-4xl font-semibold text-white tracking-tight tabular-nums">0</p>
            </div>
          ))}
        </div>

        <SlaSummaryStrip />

        <div className="grid lg:grid-cols-3 gap-4 mb-4">
          <div ref={chartRef} className="lg:col-span-2">
            <GlassCard glow className="p-7">
              <SectionHeading
                eyebrow="30-day window"
                title="Ticket Volume Trend"
                right={<span className="text-xs text-slate-500 font-mono">live</span>}
              />
              <div style={{ width: "100%", height: 280 }}>
                <ResponsiveContainer>
                  <AreaChart data={trend}>
                    <defs>
                      <linearGradient id="dashVol" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} minTickGap={24} />
                    <YAxis tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Area type="monotone" dataKey="count" stroke="#60A5FA" strokeWidth={2.5} fill="url(#dashVol)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </div>

          <div ref={sideRef}>
            <GlassCard className="p-7 h-full">
              <SectionHeading eyebrow="Distribution" title="By Priority" />
              <div style={{ width: "100%", height: 220 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={byPriority} dataKey="count" nameKey="label" innerRadius={52} outerRadius={82} paddingAngle={3} stroke="#0C1426" strokeWidth={2}>
                      {byPriority.map((entry) => (<Cell key={entry.label} fill={PRIORITY_COLORS[entry.label] || "#94A3B8"} />))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center mt-2">
                {byPriority.map((entry) => (
                  <span key={entry.label} className="flex items-center gap-1.5 text-xs text-slate-400">
                    <span className="w-2 h-2 rounded-full glow-dot" style={{ color: PRIORITY_COLORS[entry.label], backgroundColor: PRIORITY_COLORS[entry.label] || "#94A3B8" }} />
                    {entry.label} <span className="text-slate-500 tabular-nums">{entry.count}</span>
                  </span>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>

        <GlassCard className="p-7">
          <SectionHeading eyebrow="Breakdown" title="Tickets by Category" />
          <div style={{ width: "100%", height: 240 }}>
            <ResponsiveContainer>
              <BarChart data={byCategory} layout="vertical" margin={{ left: 20 }}>
                <defs>
                  <linearGradient id="dashBar" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#6366F1" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="label" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} width={90} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                <Bar dataKey="count" fill="url(#dashBar)" radius={[0, 6, 6, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>
    </AppLayout>
  );
}