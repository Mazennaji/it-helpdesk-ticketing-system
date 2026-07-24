import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import AppLayout from "../components/AppLayout";
import { fetchTickets, fetchCategories, fetchPriorities, fetchStatuses } from "../api/ticketService";

const priorityColors = {
  Low: { bg: "#F1F5F9", text: "#475569", dot: "#94A3B8" },
  Medium: { bg: "#DBEAFE", text: "#1D4ED8", dot: "#3B82F6" },
  High: { bg: "#FEF3C7", text: "#B45309", dot: "#F59E0B" },
  Critical: { bg: "#FEE2E2", text: "#B91C1C", dot: "#EF4444" },
};

const statusColors = {
  Open: { bg: "#DBEAFE", text: "#1D4ED8" },
  "In Progress": { bg: "#FEF3C7", text: "#B45309" },
  Pending: { bg: "#F1F5F9", text: "#475569" },
  Resolved: { bg: "#D1FAE5", text: "#047857" },
  Closed: { bg: "#E2E8F0", text: "#64748B" },
};

const statCards = [
  { key: "Open", label: "Open", accent: "#3B82F6" },
  { key: "In Progress", label: "In Progress", accent: "#F59E0B" },
  { key: "Resolved", label: "Resolved", accent: "#10B981" },
  { key: "Critical", label: "Critical", accent: "#EF4444", byPriority: true },
];

export default function TicketList() {
  const [tickets, setTickets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [filters, setFilters] = useState({ search: "", categoryId: "", priorityId: "", statusId: "" });
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
    setLoading(true);
    const params = { pageSize: 200 };
    if (filters.search) params.search = filters.search;
    if (filters.categoryId) params.categoryId = filters.categoryId;
    if (filters.priorityId) params.priorityId = filters.priorityId;
    if (filters.statusId) params.statusId = filters.statusId;

    const timeout = setTimeout(() => {
      fetchTickets(params)
        .then((res) => setTickets(res.items))
        .catch(() => setError("Unable to load tickets."))
        .finally(() => setLoading(false));
    }, 250);

    return () => clearTimeout(timeout);
  }, [filters]);

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

  const handleFilterChange = (e) =>
    setFilters((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onRowEnter = (el) => gsap.to(el, { backgroundColor: "#F8FAFC", duration: 0.15 });
  const onRowLeave = (el) => gsap.to(el, { backgroundColor: "#FFFFFF", duration: 0.15 });

  const onBtnEnter = () => gsap.to(newBtnRef.current, { scale: 1.03, duration: 0.2, ease: "power2.out" });
  const onBtnLeave = () => gsap.to(newBtnRef.current, { scale: 1, duration: 0.2, ease: "power2.out" });

  return (
    <AppLayout title="Tickets" subtitle="All support requests across your queue">
      <div ref={rootRef}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statCards.map((s, i) => (
            <div
              key={s.key}
              ref={(el) => (statRefs.current[i] = el)}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  {s.label}
                </span>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.accent }} />
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
          ref={filterBarRef}
          className="bg-white rounded-xl border border-slate-200 p-5 mb-5 flex flex-wrap gap-3 items-center"
        >
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Search by title or reference no..."
            className="flex-1 min-w-[220px] rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          />
          <select
            name="categoryId"
            value={filters.categoryId}
            onChange={handleFilterChange}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
            name="priorityId"
            value={filters.priorityId}
            onChange={handleFilterChange}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
          >
            <option value="">All priorities</option>
            {priorities.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <select
            name="statusId"
            value={filters.statusId}
            onChange={handleFilterChange}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
          >
            <option value="">All statuses</option>
            {statuses.map((st) => (
              <option key={st.id} value={st.id}>{st.name}</option>
            ))}
          </select>
          <Link
            ref={newBtnRef}
            to="/tickets/new"
            onMouseEnter={onBtnEnter}
            onMouseLeave={onBtnLeave}
            className="ml-auto bg-[#0B1F3A] text-white text-sm font-medium px-4 py-2 rounded-lg shadow-lg shadow-blue-950/10 hover:bg-[#132a4d] transition-colors inline-block"
          >
            + New Ticket
          </Link>
        </div>

        <div ref={tableRef} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-left text-xs text-slate-500 uppercase tracking-wide">
                <th className="px-5 py-3 font-medium">Reference</th>
                <th className="px-5 py-3 font-medium">Title</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Priority</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Assigned</th>
                <th className="px-5 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-slate-400">Loading tickets...</td></tr>
              )}
              {!loading && error && (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-red-500">{error}</td></tr>
              )}
              {!loading && !error && tickets.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-slate-400">No tickets found.</td></tr>
              )}
              {!loading && !error && tickets.map((t) => {
                const pc = priorityColors[t.priority] || priorityColors.Low;
                const sc = statusColors[t.status] || statusColors.Open;
                return (
                  <tr
                    key={t.ticketId}
                    className="border-b border-slate-100 last:border-0"
                    onMouseEnter={(e) => onRowEnter(e.currentTarget)}
                    onMouseLeave={(e) => onRowLeave(e.currentTarget)}
                  >
                    <td className="px-5 py-3">
                      <Link to={`/tickets/${t.ticketId}`} className="font-mono text-blue-700 hover:underline">
                        {t.referenceNo}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-slate-800">{t.title}</td>
                    <td className="px-5 py-3 text-slate-600">{t.category}</td>
                    <td className="px-5 py-3">
                      <span
                        className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: pc.bg, color: pc.text }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: pc.dot }} />
                        {t.priority}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: sc.bg, color: sc.text }}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{t.assignedToName || "Unassigned"}</td>
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