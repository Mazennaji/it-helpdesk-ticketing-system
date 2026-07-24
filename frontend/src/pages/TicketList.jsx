import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import { fetchTickets, fetchCategories, fetchPriorities, fetchStatuses } from "../api/ticketService";

const priorityColors = {
  Low: "bg-slate-100 text-slate-600",
  Medium: "bg-blue-100 text-blue-700",
  High: "bg-amber-100 text-amber-700",
  Critical: "bg-red-100 text-red-700",
};

const statusColors = {
  Open: "bg-blue-100 text-blue-700",
  "In Progress": "bg-amber-100 text-amber-700",
  Pending: "bg-slate-100 text-slate-600",
  Resolved: "bg-emerald-100 text-emerald-700",
  Closed: "bg-slate-200 text-slate-500",
};

export default function TicketList() {
  const [tickets, setTickets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [filters, setFilters] = useState({ search: "", categoryId: "", priorityId: "", statusId: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    const params = {};
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

  const handleFilterChange = (e) =>
    setFilters((f) => ({ ...f, [e.target.name]: e.target.value }));

  return (
    <AppLayout title="Tickets" subtitle="All support requests across your queue">
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-5 flex flex-wrap gap-3 items-center">
        <input
          type="text"
          name="search"
          value={filters.search}
          onChange={handleFilterChange}
          placeholder="Search by title or reference no..."
          className="flex-1 min-w-[220px] rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
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
          {statuses.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <Link
          to="/tickets/new"
          className="ml-auto bg-[#0B1F3A] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#132a4d] transition-colors"
        >
          + New Ticket
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
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
              <tr><td colSpan={7} className="px-5 py-8 text-center text-slate-400">Loading tickets...</td></tr>
            )}
            {!loading && error && (
              <tr><td colSpan={7} className="px-5 py-8 text-center text-red-500">{error}</td></tr>
            )}
            {!loading && !error && tickets.length === 0 && (
              <tr><td colSpan={7} className="px-5 py-8 text-center text-slate-400">No tickets found.</td></tr>
            )}
            {!loading && !error && tickets.map((t) => (
              <tr key={t.ticketId} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="px-5 py-3">
                  <Link to={`/tickets/${t.ticketId}`} className="font-mono text-blue-700 hover:underline">
                    {t.referenceNo}
                  </Link>
                </td>
                <td className="px-5 py-3 text-slate-800">{t.title}</td>
                <td className="px-5 py-3 text-slate-600">{t.category}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${priorityColors[t.priority] || "bg-slate-100 text-slate-600"}`}>
                    {t.priority}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[t.status] || "bg-slate-100 text-slate-600"}`}>
                    {t.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-slate-600">{t.assignedToName || "Unassigned"}</td>
                <td className="px-5 py-3 text-slate-500">
                  {new Date(t.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
}