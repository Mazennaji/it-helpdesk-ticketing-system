import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import gsap from "gsap";
import AppLayout from "../components/AppLayout";
import { useAuth } from "../context/AuthContext";
import { fetchTickets, fetchCategories, fetchPriorities, fetchStatuses } from "../api/ticketService";
import { evaluateSla, formatRemaining, SLA_STYLES } from "../utils/sla";

const STAFF_ROLES = ["Admin", "IT Support Agent", "Manager"];

const priorityColors = {
  Low: { bg: "rgba(148,163,184,0.15)", text: "#CBD5E1", dot: "#94A3B8" },
  Medium: { bg: "rgba(59,130,246,0.15)", text: "#93C5FD", dot: "#3B82F6" },
  High: { bg: "rgba(245,158,11,0.15)", text: "#FCD34D", dot: "#F59E0B" },
  Critical: { bg: "rgba(239,68,68,0.15)", text: "#FCA5A5", dot: "#EF4444" },
};

const statusColors = {
  Open: { bg: "rgba(59,130,246,0.15)", text: "#93C5FD" },
  "In Progress": { bg: "rgba(245,158,11,0.15)", text: "#FCD34D" },
  Pending: { bg: "rgba(139,92,246,0.15)", text: "#C4B5FD" },
  Resolved: { bg: "rgba(16,185,129,0.15)", text: "#6EE7B7" },
  Closed: { bg: "rgba(100,116,139,0.15)", text: "#CBD5E1" },
};

const SLA_DARK = {
  Breached: { bg: "rgba(239,68,68,0.15)", text: "#FCA5A5", dot: "#EF4444" },
  DueSoon: { bg: "rgba(245,158,11,0.15)", text: "#FCD34D", dot: "#F59E0B" },
  OnTrack: { bg: "rgba(16,185,129,0.15)", text: "#6EE7B7", dot: "#10B981" },
  Met: { bg: "rgba(148,163,184,0.15)", text: "#CBD5E1", dot: "#94A3B8" },
  Missed: { bg: "rgba(239,68,68,0.15)", text: "#FCA5A5", dot: "#EF4444" },
};

const statCards = [
  { key: "Open", label: "Open", accent: "#3B82F6" },
  { key: "In Progress", label: "In Progress", accent: "#F59E0B" },
  { key: "Resolved", label: "Resolved", accent: "#10B981" },
  { key: "Critical", label: "Critical", accent: "#EF4444", byPriority: true },
];

export default function TicketList() {
  const { user } = useAuth();
  const isStaff = user?.roles?.some((r) => STAFF_ROLES.includes(r));

  const [searchParams, setSearchParams] = useSearchParams();

  const [tickets, setTickets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [filters, setFilters] = useState({
    search: searchParams.get("q") || "",
    categoryId: "",
    priorityId: "",
    statusId: "",
  });
  const [assignedToMe, setAssignedToMe] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const rootRef = useRef(null);
  const statRefs = useRef([]);
  const valueRefs = useRef([]);
  const filterBarRef = useRef(null);
  const tableRef = useRef(null);
  const newBtnRef = useRef(null);
  const prevStats = useRef({});

  useEffect(() => {
    Promise.all([fetchCategories(), fetchPriorities(), fetchStatuses()])
      .then(([c, p, s]) => {
        setCategories(c);
        setPriorities(p);
        setStatuses(s);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const q = searchParams.get("q") || "";
    setFilters((f) => (f.search === q ? f : { ...f, search: q }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    const params = { pageSize: 200 };
    if (filters.search) params.search = filters.search;
    if (filters.categoryId) params.categoryId = filters.categoryId;
    if (filters.priorityId) params.priorityId = filters.priorityId;
    if (filters.statusId) params.statusId = filters.statusId;
    if (assignedToMe) params.assignedToMe = true;

    const timeout = setTimeout(() => {
      fetchTickets(params)
        .then((res) => setTickets(res.items))
        .catch(() => setError("Unable to load tickets."))
        .finally(() => setLoading(false));
    }, 250);

    return () => clearTimeout(timeout);
  }, [filters, assignedToMe]);

  const counts = statCards.reduce((acc, s) => {
    acc[s.key] = s.byPriority
      ? tickets.filter((t) => t.priority === s.key).length
      : tickets.filter((t) => t.status === s.key).length;
    return acc;
  }, {});

  useEffect(() => {
    if (loading) return;
    const ctx = gsap.context(() => {
      gsap.set(filterBarRef.current, { opacity: 0, y: -14 });
      gsap.set(statRefs.current, { opacity: 0, y: 18 });
      gsap.set(tableRef.current, { opacity: 0, y: 20 });

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.to(statRefs.current, { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 })
        .to(filterBarRef.current, { opacity: 1, y: 0, duration: 0.5 }, "-=0.25")
        .to(tableRef.current, { opacity: 1, y: 0, duration: 0.5 }, "-=0.25");

      valueRefs.current.forEach((el, i) => {
        if (!el) return;
        const key = statCards[i].key;
        const from = prevStats.current[key] ?? 0;
        const to = counts[key] ?? 0;
        const counter = { val: from };
        gsap.to(counter, {
          val: to,
          duration: 0.8,
          ease: "power2.out",
          onUpdate: () => { el.textContent = Math.round(counter.val); },
        });
      });
      prevStats.current = { ...counts };
    }, rootRef);

    return () => ctx.revert();
  }, [loading, tickets]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((f) => ({ ...f, [name]: value }));
    if (name === "search") {
      const next = new URLSearchParams(searchParams);
      if (value) next.set("q", value);
      else next.delete("q");
      setSearchParams(next, { replace: true });
    }
  };

  const onRowEnter = (el) => gsap.to(el, { backgroundColor: "rgba(255,255,255,0.03)", duration: 0.15 });
  const onRowLeave = (el) => gsap.to(el, { backgroundColor: "rgba(0,0,0,0)", duration: 0.15 });

  const onBtnEnter = () => gsap.to(newBtnRef.current, { scale: 1.03, duration: 0.2, ease: "power2.out" });
  const onBtnLeave = () => gsap.to(newBtnRef.current, { scale: 1, duration: 0.2, ease: "power2.out" });

  const selectCls = "rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 outline-none focus:border-blue-400/40 [&>option]:bg-[#0E1B33]";

  return (
    <AppLayout title="Tickets" subtitle="All support requests across your queue">
      <div ref={rootRef}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statCards.map((s, i) => (
            <div
              key={s.key}
              ref={(el) => (statRefs.current[i] = el)}
              className="rounded-xl border border-white/8 bg-[#0E1B33] p-5 transition-all hover:border-white/15"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                  {s.label}
                </span>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.accent, boxShadow: `0 0 10px ${s.accent}` }} />
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

        <div
          ref={filterBarRef}
          className="rounded-xl border border-white/8 bg-[#0E1B33] p-5 mb-5 flex flex-wrap gap-3 items-center"
        >
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Search by title or reference no..."
            className="flex-1 min-w-[220px] rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-blue-400/40 focus:ring-4 focus:ring-blue-500/10"
          />
          <select name="categoryId" value={filters.categoryId} onChange={handleFilterChange} className={selectCls}>
            <option value="">All categories</option>
            {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
          </select>
          <select name="priorityId" value={filters.priorityId} onChange={handleFilterChange} className={selectCls}>
            <option value="">All priorities</option>
            {priorities.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
          </select>
          <select name="statusId" value={filters.statusId} onChange={handleFilterChange} className={selectCls}>
            <option value="">All statuses</option>
            {statuses.map((st) => (<option key={st.id} value={st.id}>{st.name}</option>))}
          </select>
          {isStaff && (
            <label className="flex items-center gap-2 text-sm text-slate-400 px-1">
              <input type="checkbox" checked={assignedToMe} onChange={(e) => setAssignedToMe(e.target.checked)} />
              Assigned to me
            </label>
          )}
          <Link
            ref={newBtnRef}
            to="/tickets/new"
            onMouseEnter={onBtnEnter}
            onMouseLeave={onBtnLeave}
            className="ml-auto bg-white text-[#0B1F3A] text-sm font-medium px-4 py-2 rounded-lg hover:shadow-[0_0_24px_rgba(59,130,246,0.35)] transition-all inline-block"
          >
            + New Ticket
          </Link>
        </div>

        <div ref={tableRef} className="rounded-xl border border-white/8 bg-[#0E1B33] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/[0.03] border-b border-white/8 text-left text-xs text-slate-400 uppercase tracking-wide">
                <th className="px-5 py-3 font-medium">Reference</th>
                <th className="px-5 py-3 font-medium">Title</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Priority</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">SLA</th>
                <th className="px-5 py-3 font-medium">Assigned</th>
                <th className="px-5 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={8} className="px-5 py-10 text-center text-slate-500">Loading tickets...</td></tr>
              )}
              {!loading && error && (
                <tr><td colSpan={8} className="px-5 py-10 text-center text-red-400">{error}</td></tr>
              )}
              {!loading && !error && tickets.length === 0 && (
                <tr><td colSpan={8} className="px-5 py-10 text-center text-slate-500">No tickets found.</td></tr>
              )}
              {!loading && !error && tickets.map((t) => {
                const pc = priorityColors[t.priority] || priorityColors.Low;
                const sc = statusColors[t.status] || statusColors.Open;
                return (
                  <tr
                    key={t.ticketId}
                    className="border-b border-white/5 last:border-0"
                    onMouseEnter={(e) => onRowEnter(e.currentTarget)}
                    onMouseLeave={(e) => onRowLeave(e.currentTarget)}
                  >
                    <td className="px-5 py-3">
                      <Link to={`/tickets/${t.ticketId}`} className="font-mono text-blue-400 hover:text-blue-300 hover:underline">
                        {t.referenceNo}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-slate-200">{t.title}</td>
                    <td className="px-5 py-3 text-slate-400">{t.category}</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: pc.bg, color: pc.text }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: pc.dot }} />
                        {t.priority}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: sc.bg, color: sc.text }}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {(() => {
                        const sla = t.sla
                          ? {
                              state: t.sla.state,
                              dueAt: new Date(t.sla.dueAt),
                              targetHours: t.sla.targetHours,
                              hoursRemaining: t.sla.hoursRemaining,
                              isResolved: t.sla.state === "Met" || t.sla.state === "Missed",
                            }
                          : evaluateSla(t);
                        const style = SLA_DARK[sla.state] || SLA_DARK.OnTrack;
                        const label = SLA_STYLES[sla.state]?.label || sla.state;
                        return (
                          <span
                            className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: style.bg, color: style.text }}
                            title={`Target ${sla.targetHours}h · due ${sla.dueAt.toLocaleString()}`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: style.dot }} />
                            {sla.isResolved ? label : formatRemaining(sla.hoursRemaining)}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-5 py-3 text-slate-400">{t.assignedToName || "Unassigned"}</td>
                    <td className="px-5 py-3 text-slate-500">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}