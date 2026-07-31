import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import StatusTimeline from "../components/StatusTimeline";
import { useAuth } from "../context/AuthContext";
import {
  fetchTicketById,
  updateTicket,
  deleteTicket,
  assignTicket,
  escalateTicket,
  fetchComments,
  addComment,
  fetchActivityLog,
  fetchCategories,
  fetchPriorities,
  fetchStatuses,
  fetchAgents,
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
  const [agents, setAgents] = useState([]);
  const [comments, setComments] = useState([]);
  const [activity, setActivity] = useState([]);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [postingComment, setPostingComment] = useState(false);
  const [escalating, setEscalating] = useState(false);
  const [activeTab, setActiveTab] = useState("comments");

  const loadAll = () => {
    const calls = [
      fetchTicketById(id),
      fetchCategories(),
      fetchPriorities(),
      fetchStatuses(),
      fetchComments(id),
      fetchActivityLog(id),
    ];
    if (isStaff) calls.push(fetchAgents());

    return Promise.all(calls).then((results) => {
      const [t, c, p, s, cm, act, ag] = results;
      setTicket(t);
      setCategories(c);
      setPriorities(p);
      setStatuses(s);
      setComments(cm);
      setActivity(act);
      if (ag) setAgents(ag);
      setForm({
        title: t.title,
        description: t.description || "",
        categoryId: t.category.id,
        priorityId: t.priority.id,
        statusId: t.status.id,
      });
    });
  };

  useEffect(() => {
    setLoading(true);
    loadAll()
      .catch(() => setError("Unable to load this ticket."))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      const act = await fetchActivityLog(id);
      setActivity(act);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleAssign = async (e) => {
    const agentId = e.target.value ? Number(e.target.value) : null;
    try {
      const updated = await assignTicket(id, agentId);
      setTicket(updated);
      const act = await fetchActivityLog(id);
      setActivity(act);
    } catch {
      setError("Unable to assign this ticket.");
    }
  };

  const handleEscalate = async () => {
    setEscalating(true);
    try {
      const updated = await escalateTicket(id, "Escalated from ticket detail view");
      setTicket(updated);
      setForm((f) => ({ ...f, priorityId: updated.priority.id }));
      const act = await fetchActivityLog(id);
      setActivity(act);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to escalate this ticket.");
    } finally {
      setEscalating(false);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setPostingComment(true);
    try {
      const created = await addComment(id, newComment, isInternalNote);
      setComments((prev) => [...prev, created]);
      setNewComment("");
      setIsInternalNote(false);
      const act = await fetchActivityLog(id);
      setActivity(act);
    } catch {
      setError("Unable to post this comment.");
    } finally {
      setPostingComment(false);
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
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-5">
        <StatusTimeline currentStatus={ticket.status.name} />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
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
                  rows={4}
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
                  <button
                    type="button"
                    onClick={handleEscalate}
                    disabled={escalating}
                    className="bg-white border border-red-200 text-red-600 text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-red-50 disabled:opacity-60 transition-colors"
                  >
                    {escalating ? "Escalating..." : "Escalate Priority"}
                  </button>
                </div>
              )}
            </form>
          </div>

          <div className="bg-white rounded-xl border border-slate-200">
            <div className="flex border-b border-slate-200">
              <button
                onClick={() => setActiveTab("comments")}
                className={`px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  activeTab === "comments"
                    ? "border-[#0B1F3A] text-[#0B1F3A]"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                Comments
              </button>
              <button
                onClick={() => setActiveTab("activity")}
                className={`px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  activeTab === "activity"
                    ? "border-[#0B1F3A] text-[#0B1F3A]"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                Activity Log
              </button>
            </div>

            {activeTab === "comments" && (
              <div className="p-6">
                <div className="space-y-4 mb-5 max-h-96 overflow-y-auto">
                  {comments.length === 0 && (
                    <p className="text-sm text-slate-400">No comments yet.</p>
                  )}
                  {comments.map((c) => (
                    <div key={c.commentId} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#0B1F3A] text-white flex items-center justify-center text-xs font-semibold shrink-0">
                        {c.userName?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-800">{c.userName}</span>
                          {c.isInternal && (
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">
                              Internal note
                            </span>
                          )}
                          <span className="text-xs text-slate-400">
                            {new Date(c.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mt-0.5">{c.commentText}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handlePostComment} className="border-t border-slate-100 pt-4">
                  <textarea
                    rows={3}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                  />
                  <div className="flex items-center justify-between mt-2">
                    {isStaff ? (
                      <label className="flex items-center gap-2 text-sm text-slate-600">
                        <input
                          type="checkbox"
                          checked={isInternalNote}
                          onChange={(e) => setIsInternalNote(e.target.checked)}
                        />
                        Internal note (not visible to requester)
                      </label>
                    ) : <span />}
                    <button
                      type="submit"
                      disabled={postingComment}
                      className="bg-[#0B1F3A] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#132a4d] disabled:opacity-60 transition-colors"
                    >
                      {postingComment ? "Posting..." : "Post Comment"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === "activity" && (
              <div className="p-6">
                {activity.length === 0 && (
                  <p className="text-sm text-slate-400">No activity recorded yet.</p>
                )}
                <ul className="space-y-3">
                  {activity.map((a) => (
                    <li key={a.logId} className="flex gap-3 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                      <div>
                        <span className="text-slate-700">{a.action}</span>
                        <span className="text-slate-400"> &middot; {a.userName} &middot; {new Date(a.createdAt).toLocaleString()}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 h-fit">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Ticket Info</h2>
          <dl className="space-y-3 text-sm mb-5">
            <div className="flex justify-between">
              <dt className="text-slate-500">Created by</dt>
              <dd className="text-slate-800 font-medium">{ticket.createdByName}</dd>
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

          {isStaff && (
            <div className="border-t border-slate-100 pt-4 mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Assigned Agent
              </label>
              <select
                value={ticket.assignedTo || ""}
                onChange={handleAssign}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              >
                <option value="">Unassigned</option>
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
          )}
          {!isStaff && (
            <div className="border-t border-slate-100 pt-4 mb-4 text-sm">
              <span className="text-slate-500">Assigned to </span>
              <span className="text-slate-800 font-medium">
                {ticket.assignedToName || "Unassigned"}
              </span>
            </div>
          )}

          <div className="pt-1 border-t border-slate-100">
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="text-sm font-medium text-red-600 hover:text-red-700 mt-4"
              >
                Cancel / Delete Ticket
              </button>
            ) : (
              <div className="space-y-2 mt-4">
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