import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import { useAuth } from "../context/AuthContext";
import {
  fetchTicketById,
  updateTicket,
  deleteTicket,
  fetchCategories,
  fetchPriorities,
  fetchStatuses,
} from "../api/ticketService";

const STAFF_ROLES = ["Admin", "IT Support Agent", "Manager"];

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isStaff = user?.roles?.some((r) => STAFF_ROLES.includes(r));

  const [ticket, setTicket] = useState(null);
  const [categories, setCategories] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    Promise.all([
      fetchTicketById(id),
      fetchCategories(),
      fetchPriorities(),
      fetchStatuses(),
    ])
      .then(([t, c, p, s]) => {
        setTicket(t);
        setCategories(c);
        setPriorities(p);
        setStatuses(s);
        setForm({
          title: t.title,
          description: t.description || "",
          categoryId: t.category.id,
          priorityId: t.priority.id,
          statusId: t.status.id,
        });
      })
      .catch(() => setError("Unable to load this ticket."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const updated = await updateTicket(id, {
        title: form.title,
        description: form.description,
        categoryId: Number(form.categoryId),
        priorityId: Number(form.priorityId),
        statusId: Number(form.statusId),
        assignedTo: ticket.assignedTo || null,
      });
      setTicket(updated);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTicket(id);
      navigate("/tickets");
    } catch {
      setError("Unable to delete this ticket.");
    }
  };

  if (loading) {
    return (
      <AppLayout title="Ticket Detail">
        <div className="text-slate-400 text-sm">Loading ticket...</div>
      </AppLayout>
    );
  }

  if (error && !ticket) {
    return (
      <AppLayout title="Ticket Detail">
        <div className="text-red-500 text-sm">{error}</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={ticket.referenceNo} subtitle={ticket.title}>
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6">
          {error && (
            <div className="mb-5 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                disabled={!isStaff}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea
                name="description"
                rows={5}
                value={form.description}
                onChange={handleChange}
                disabled={!isStaff}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select
                  name="categoryId"
                  value={form.categoryId}
                  onChange={handleChange}
                  disabled={!isStaff}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                <select
                  name="priorityId"
                  value={form.priorityId}
                  onChange={handleChange}
                  disabled={!isStaff}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
                >
                  {priorities.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select
                  name="statusId"
                  value={form.statusId}
                  onChange={handleChange}
                  disabled={!isStaff}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
                >
                  {statuses.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {isStaff && (
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#0B1F3A] text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-[#132a4d] disabled:opacity-60 transition-colors"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </form>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 h-fit">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Ticket Info</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Created by</dt>
              <dd className="text-slate-800 font-medium">{ticket.createdByName}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Assigned to</dt>
              <dd className="text-slate-800 font-medium">{ticket.assignedToName || "Unassigned"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Created</dt>
              <dd className="text-slate-800 font-medium">
                {new Date(ticket.createdAt).toLocaleString()}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Last updated</dt>
              <dd className="text-slate-800 font-medium">
                {new Date(ticket.updatedAt).toLocaleString()}
              </dd>
            </div>
            {ticket.resolvedAt && (
              <div className="flex justify-between">
                <dt className="text-slate-500">Resolved</dt>
                <dd className="text-slate-800 font-medium">
                  {new Date(ticket.resolvedAt).toLocaleString()}
                </dd>
              </div>
            )}
          </dl>

          <div className="mt-6 pt-5 border-t border-slate-100">
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="text-sm font-medium text-red-600 hover:text-red-700"
              >
                Cancel / Delete Ticket
              </button>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-slate-600">
                  This can&apos;t be undone. Are you sure?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleDelete}
                    className="text-sm font-medium bg-red-600 text-white px-3 py-1.5 rounded-md hover:bg-red-700"
                  >
                    Yes, delete
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="text-sm font-medium text-slate-500 hover:text-slate-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}