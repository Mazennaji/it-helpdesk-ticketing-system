import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import AppLayout from "../components/AppLayout";
import { useAuth } from "../context/AuthContext";
import { fetchTickets } from "../api/ticketService";

const statCards = [
  { key: "Open", label: "Open", accent: "#3B82F6" },
  { key: "In Progress", label: "In Progress", accent: "#F59E0B" },
  { key: "Resolved", label: "Resolved", accent: "#10B981" },
  { key: "Critical", label: "Critical", accent: "#EF4444", byPriority: true },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const rootRef = useRef(null);
  const cardRefs = useRef([]);
  const chartRef = useRef(null);
  const valueRefs = useRef([]);

  useEffect(() => {
    fetchTickets({ pageSize: 200 })
      .then((res) => setTickets(res.items))
      .catch(() => setTickets([]))
      .finally(() => setLoading(false));
  }, []);

  const counts = statCards.reduce((acc, s) => {
    acc[s.key] = s.byPriority
      ? tickets.filter((t) => t.priority === s.key).length
      : tickets.filter((t) => t.status === s.key).length;
    return acc;
  }, {});

  useEffect(() => {
    if (loading) return;
    const ctx = gsap.context(() => {
      gsap.set(cardRefs.current, { y: 24, opacity: 0 });
      gsap.set(chartRef.current, { y: 24, opacity: 0 });

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.to(cardRefs.current, { y: 0, opacity: 1, duration: 0.55, stagger: 0.1 })
        .to(chartRef.current, { y: 0, opacity: 1, duration: 0.55 }, "-=0.25");

      valueRefs.current.forEach((el, i) => {
        if (!el) return;
        const target = counts[statCards[i].key] ?? 0;
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
  }, [loading, tickets]);

  const onCardEnter = (i) => {
    gsap.to(cardRefs.current[i], { y: -4, duration: 0.25, ease: "power2.out" });
  };
  const onCardLeave = (i) => {
    gsap.to(cardRefs.current[i], { y: 0, duration: 0.25, ease: "power2.out" });
  };

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
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  {stat.label}
                </span>
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: stat.accent }}
                />
              </div>
              <p
                ref={(el) => (valueRefs.current[i] = el)}
                className="text-3xl font-semibold text-slate-900 tracking-tight"
              >
                0
              </p>
            </div>
          ))}
        </div>

        <div
          ref={chartRef}
          className="bg-white rounded-xl border border-slate-200 p-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-semibold text-slate-800">
              Ticket Volume Trend
            </h2>
            <span className="text-xs text-slate-400">Last 30 days</span>
          </div>
          <div className="h-56 rounded-lg bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center text-sm text-slate-400">
            Chart integration coming in a later sprint
          </div>
        </div>
      </div>
    </AppLayout>
  );
}