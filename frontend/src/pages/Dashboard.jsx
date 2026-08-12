import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import AppLayout from "../components/AppLayout";
import SlaSummaryStrip from "../components/SlaSummaryStrip";
import { useAuth } from "../context/AuthContext";
import {
  fetchDashboardSummary,
  fetchVolumeTrend,
  fetchByCategory,
  fetchByPriority,
} from "../api/dashboardService";

const statCards = [
  { key: "open", label: "Open", accent: "#3B82F6" },
  { key: "inProgress", label: "In Progress", accent: "#F59E0B" },
  { key: "resolved", label: "Resolved", accent: "#10B981" },
  { key: "critical", label: "Critical", accent: "#EF4444" },
];

const PRIORITY_COLORS = {
  Low: "#94A3B8",
  Medium: "#3B82F6",
  High: "#F59E0B",
  Critical: "#EF4444",
};

const tooltipStyle = {
  fontSize: 12,
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.1)",
  background: "#0E1B33",
  color: "#E2E8F0",
};

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState([]);
  const [byCategory, setByCategory] = useState([]);
  const [byPriority, setByPriority] = useState([]);
  const [loading, setLoading] = useState(true);

  const rootRef = useRef(null);
  const cardRefs = useRef([]);
  const chartRef = useRef(null);
  const breakdownRef = useRef(null);
  const valueRefs = useRef([]);

  useEffect(() => {
    Promise.all([
      fetchDashboardSummary(),
      fetchVolumeTrend(30),
      fetchByCategory(),
      fetchByPriority(),
    ])
      .then(([s, v, c, p]) => {
        setSummary(s);
        setTrend(v);
        setByCategory(c);
        setByPriority(p);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading || !summary) return;
    const ctx = gsap.context(() => {
      gsap.set(cardRefs.current, { y: 24, opacity: 0 });
      gsap.set(chartRef.current, { y: 24, opacity: 0 });
      gsap.set(breakdownRef.current, { y: 24, opacity: 0 });

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.to(cardRefs.current, { y: 0, opacity: 1, duration: 0.55, stagger: 0.1 })
        .to(chartRef.current, { y: 0, opacity: 1, duration: 0.55 }, "-=0.25")
        .to(breakdownRef.current, { y: 0, opacity: 1, duration: 0.55 }, "-=0.3");

      const values = { open: summary.open, inProgress: summary.inProgress, resolved: summary.resolved, critical: summary.critical };
      valueRefs.current.forEach((el, i) => {
        if (!el) return;
        const target = values[statCards[i].key] ?? 0;
        const counter = { val: 0 };
        gsap.to(counter, {
          val: target,
          duration: 1.1,
          delay: 0.2 + i * 0.1,
          ease: "power2.out",
          onUpdate: () => { el.textContent = Math.round(counter.val); },
        });
      });
    }, rootRef);

    return () => ctx.revert();
  }, [loading, summary]);

  const onCardEnter = (i) => gsap.to(cardRefs.current[i], { y: -4, duration: 0.25, ease: "power2.out" });
  const onCardLeave = (i) => gsap.to(cardRefs.current[i], { y: 0, duration: 0.25, ease: "power2.out" });

  return (
    <AppLayout
      title={`Welcome back${user?.fullName ? `, ${user.fullName.split(" ")[0]}` : ""}`}
      subtitle="Here's what's happening across your support queue today"
    >
      <div ref={rootRef}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statCards.map((stat, i) => (
            <div
              key={stat.key}
              ref={(el) => (cardRefs.current[i] = el)}
              onMouseEnter={() => onCardEnter(i)}
              onMouseLeave={() => onCardLeave(i)}
              className="rounded-xl border border-white/8 bg-[#0E1B33] p-5 transition-all hover:border-white/15"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                  {stat.label}
                </span>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: stat.accent, boxShadow: `0 0 10px ${stat.accent}` }} />
              </div>
              <p
                ref={(el) => (valueRefs.current[i] = el)}
                className="text-3xl font-semibold text-white tracking-tight"
              >
                0
              </p>
            </div>
          ))}
        </div>

        <SlaSummaryStrip />

        <div ref={chartRef} className="rounded-xl border border-white/8 bg-[#0E1B33] p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-semibold text-white">Ticket Volume Trend</h2>
            <span className="text-xs text-slate-500">Last 30 days</span>
          </div>
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div ref={breakdownRef} className="grid lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-white/8 bg-[#0E1B33] p-8">
            <h2 className="text-sm font-semibold text-white mb-6">Tickets by Category</h2>
            <div style={{ width: "100%", height: 240 }}>
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
            <h2 className="text-sm font-semibold text-white mb-6">Tickets by Priority</h2>
            <div style={{ width: "100%", height: 240 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={byPriority}
                    dataKey="count"
                    nameKey="label"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={2}
                    stroke="#0E1B33"
                  >
                    {byPriority.map((entry) => (
                      <Cell key={entry.label} fill={PRIORITY_COLORS[entry.label] || "#94A3B8"} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              {byPriority.map((entry) => (
                <span key={entry.label} className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: PRIORITY_COLORS[entry.label] || "#94A3B8" }}
                  />
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