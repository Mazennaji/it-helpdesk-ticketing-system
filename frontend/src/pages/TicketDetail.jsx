import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import StatusTimeline from "../components/StatusTimeline";
import { GlassCard } from "../components/premium";
import CommentBody from "../components/CommentBody";
import { useAuth } from "../context/AuthContext";
import {
  fetchTicketById, updateTicket, deleteTicket, assignTicket, escalateTicket,
  fetchComments, addComment, fetchActivityLog,
  fetchCategories, fetchPriorities, fetchStatuses, fetchAgents,
} from "../api/ticketService";
import { fetchAttachments, uploadAttachment, downloadAttachment } from "../api/attachmentService";
import { draftReply } from "../api/aiService";

const STAFF_ROLES = ["Admin", "IT Support Agent", "Manager"];
const inputCls = "w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-blue-400/40 focus:ring-2 focus:ring-blue-500/10 disabled:bg-white/[0.02] disabled:text-slate-500";
const selectCls = "w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 outline-none focus:border-blue-400/40 disabled:bg-white/[0.02] disabled:text-slate-500 [&>option]:bg-[#0C1426]";

function formatFileSize(kb) {
  if (kb < 1024) return `${kb} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

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
  const [attachments, setAttachments] = useState([]);
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
  const [uploadProgress, setUploadProgress] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [drafting, setDrafting] = useState(false);
  const fileInputRef = useRef(null);

  const loadAll = () => {
    const calls = [
      fetchTicketById(id), fetchCategories(), fetchPriorities(), fetchStatuses(),
      fetchComments(id), fetchActivityLog(id), fetchAttachments(id),
    ];
    if (isStaff) calls.push(fetchAgents());
    return Promise.all(calls).then((results) => {
      const [t, c, p, s, cm, act, att, ag] = results;
      setTicket(t); setCategories(c); setPriorities(p); setStatuses(s);
      setComments(cm); setActivity(act); setAttachments(att);
      if (ag) setAgents(ag);
      setForm({ title: t.title, description: t.description || "", categoryId: t.category.id, priorityId: t.priority.id, statusId: t.status.id });
    });
  };

  useEffect(() => {
    setLoading(true);
    loadAll().catch(() => setError("Unable to load this ticket.")).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setError(null);
    try {
      const updated = await updateTicket(id, {
        title: form.title, description: form.description,
        categoryId: Number(form.categoryId), priorityId: Number(form.priorityId),
        statusId: Number(form.statusId), assignedTo: ticket.assignedTo || null,
      });
      setTicket(updated);
      setActivity(await fetchActivityLog(id));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save changes.");
    } finally { setSaving(false); }
  };

  const handleAssign = async (e) => {
    const agentId = e.target.value ? Number(e.target.value) : null;
    try { setTicket(await assignTicket(id, agentId)); setActivity(await fetchActivityLog(id)); }
    catch { setError("Unable to assign this ticket."); }
  };

  const handleEscalate = async () => {
    setEscalating(true);
    try {
      const updated = await escalateTicket(id, "Escalated from ticket detail view");
      setTicket(updated);
      setForm((f) => ({ ...f, priorityId: updated.priority.id }));
      setActivity(await fetchActivityLog(id));
    } catch (err) { setError(err.response?.data?.message || "Unable to escalate this ticket."); }
    finally { setEscalating(false); }
  };

  const handleDraftReply = async () => {
    if (drafting) return;
    setDrafting(true);
    try { const { reply } = await draftReply({ ticketId: Number(id) }); setNewComment(reply); }
    catch { setError("Unable to draft a reply right now."); }
    finally { setDrafting(false); }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setPostingComment(true);
    try {
      const created = await addComment(id, newComment, isInternalNote);
      setComments((prev) => [...prev, created]);
      setNewComment(""); setIsInternalNote(false);
      setActivity(await fetchActivityLog(id));
    } catch { setError("Unable to post this comment."); }
    finally { setPostingComment(false); }
  };

  const handleDelete = async () => {
    try { await deleteTicket(id); navigate("/tickets"); }
    catch { setError("Unable to delete this ticket."); }
  };

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null); setUploadProgress(0);
    try {
      const created = await uploadAttachment(id, file, setUploadProgress);
      setAttachments((prev) => [created, ...prev]);
      setActivity(await fetchActivityLog(id));
    } catch (err) { setUploadError(err.response?.data?.message || "Unable to upload this file."); }
    finally { setUploadProgress(null); if (fileInputRef.current) fileInputRef.current.value = ""; }
  };

  const handleDownload = async (attachment) => {
    try { await downloadAttachment(id, attachment.attachmentId, attachment.fileName); }
    catch { setUploadError("Unable to download this file."); }
  };

  if (loading) {
    return <AppLayout title="Ticket Detail"><div className="text-slate-500 text-sm relative z-10">Loading ticket...</div></AppLayout>;
  }
  if (error && !ticket) {
    return <AppLayout title="Ticket Detail"><div className="text-red-400 text-sm relative z-10">{error}</div></AppLayout>;
  }

  const tabBtn = (key, label) => (
    <button onClick={() => setActiveTab(key)}
      className={`px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${activeTab === key ? "border-blue-400 text-white" : "border-transparent text-slate-400 hover:text-slate-200"}`}>
      {label}
    </button>
  );

  return (
    <AppLayout title={ticket.referenceNo} subtitle={ticket.title}>
      <div className="relative z-10">
        <GlassCard className="p-6 mb-4">
          <StatusTimeline currentStatus={ticket.status.name} />
        </GlassCard>

        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <GlassCard className="p-6">
              {error && (<div className="mb-5 rounded-md bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-300">{error}</div>)}
              <form onSubmit={handleSave} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Title</label>
                  <input type="text" name="title" value={form.title} onChange={handleChange} disabled={!isStaff} className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                  <textarea name="description" rows={4} value={form.description} onChange={handleChange} disabled={!isStaff} className={inputCls} />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
                    <select name="categoryId" value={form.categoryId} onChange={handleChange} disabled={!isStaff} className={selectCls}>
                      {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Priority</label>
                    <select name="priorityId" value={form.priorityId} onChange={handleChange} disabled={!isStaff} className={selectCls}>
                      {priorities.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
                    <select name="statusId" value={form.statusId} onChange={handleChange} disabled={!isStaff} className={selectCls}>
                      {statuses.map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}
                    </select>
                  </div>
                </div>
                {isStaff && (
                  <div className="flex gap-3 pt-2">
                    <button type="submit" disabled={saving}
                      className="sheen bg-white text-[#0B1F3A] text-sm font-medium px-5 py-2.5 rounded-lg hover:shadow-[0_0_28px_rgba(59,130,246,0.45)] disabled:opacity-60 transition-all">
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                    <button type="button" onClick={handleEscalate} disabled={escalating}
                      className="border border-red-500/30 text-red-300 text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-red-500/10 disabled:opacity-60 transition-colors">
                      {escalating ? "Escalating..." : "Escalate Priority"}
                    </button>
                  </div>
                )}
              </form>
            </GlassCard>

            <GlassCard className="overflow-hidden">
              <div className="flex border-b border-white/8">
                {tabBtn("comments", "Comments")}
                {tabBtn("attachments", `Attachments${attachments.length > 0 ? ` (${attachments.length})` : ""}`)}
                {tabBtn("activity", "Activity Log")}
              </div>

              {activeTab === "comments" && (
                <div className="p-6">
                  <div className="space-y-4 mb-5 max-h-96 overflow-y-auto premium-scroll">
                    {comments.length === 0 && <p className="text-sm text-slate-500">No comments yet.</p>}
                    {comments.map((c) => (
                      <div key={c.commentId} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-300 border border-white/10 flex items-center justify-center text-xs font-semibold shrink-0">
                          {c.userName?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-200">{c.userName}</span>
                            {c.isInternal && (<span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300">Internal note</span>)}
                            <span className="text-xs text-slate-500">{new Date(c.createdAt).toLocaleString()}</span>
                          </div>
                          <CommentBody text={c.commentText} className="mt-0.5" />
                        </div>
                      </div>
                    ))}
                  </div>
                  <form onSubmit={handlePostComment} className="border-t border-white/8 pt-4">
                    {isStaff && (
                      <div className="flex justify-end mb-2">
                        <button type="button" onClick={handleDraftReply} disabled={drafting}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-400 hover:text-blue-300 disabled:opacity-40 disabled:cursor-not-allowed">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 3l1.9 5.8L20 10l-5.1 3.7L16 20l-4-3.5L8 20l1.1-6.3L4 10l6.1-1.2z" />
                          </svg>
                          {drafting ? "Drafting..." : "Draft with AI"}
                        </button>
                      </div>
                    )}
                    <textarea rows={3} value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Add a comment..." className={inputCls} />
                    <div className="flex items-center justify-between mt-2">
                      {isStaff ? (
                        <label className="flex items-center gap-2 text-sm text-slate-400">
                          <input type="checkbox" checked={isInternalNote} onChange={(e) => setIsInternalNote(e.target.checked)} />
                          Internal note (not visible to requester)
                        </label>
                      ) : <span />}
                      <button type="submit" disabled={postingComment}
                        className="sheen bg-white text-[#0B1F3A] text-sm font-medium px-4 py-2 rounded-lg hover:shadow-[0_0_28px_rgba(59,130,246,0.45)] disabled:opacity-60 transition-all">
                        {postingComment ? "Posting..." : "Post Comment"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === "attachments" && (
                <div className="p-6">
                  {uploadError && (<div className="mb-4 rounded-md bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-300">{uploadError}</div>)}
                  <div className="space-y-3 mb-5">
                    {attachments.length === 0 && <p className="text-sm text-slate-500">No attachments yet.</p>}
                    {attachments.map((a) => (
                      <div key={a.attachmentId} className="flex items-center justify-between border border-white/8 rounded-lg px-4 py-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" className="shrink-0">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" />
                          </svg>
                          <div className="min-w-0">
                            <p className="text-sm text-slate-200 truncate">{a.fileName}</p>
                            <p className="text-xs text-slate-500">{formatFileSize(a.fileSizeKb)} &middot; {a.uploadedByName} &middot; {new Date(a.uploadedAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <button onClick={() => handleDownload(a)} className="text-sm font-medium text-blue-400 hover:text-blue-300 shrink-0 ml-3">Download</button>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-white/8 pt-4">
                    <input ref={fileInputRef} type="file" onChange={handleFileSelected} className="hidden" id="attachment-upload" />
                    <label htmlFor="attachment-upload" className="inline-block cursor-pointer border border-white/15 text-slate-200 text-sm font-medium px-4 py-2 rounded-lg hover:bg-white/5 transition-colors">
                      {uploadProgress !== null ? `Uploading... ${uploadProgress}%` : "Attach a file"}
                    </label>
                    <p className="text-xs text-slate-500 mt-2">Max 10MB. Images, PDFs, Office docs, text/log/CSV files only.</p>
                  </div>
                </div>
              )}

              {activeTab === "activity" && (
                <div className="p-6">
                  {activity.length === 0 && <p className="text-sm text-slate-500">No activity recorded yet.</p>}
                  <ul className="space-y-3">
                    {activity.map((a) => (
                      <li key={a.logId} className="flex gap-3 text-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 glow-dot mt-1.5 shrink-0" style={{ color: "#60A5FA" }} />
                        <div>
                          <span className="text-slate-300">{a.action}</span>
                          <span className="text-slate-500"> &middot; {a.userName} &middot; {new Date(a.createdAt).toLocaleString()}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </GlassCard>
          </div>

          <GlassCard className="p-6 h-fit">
            <h2 className="text-sm font-semibold text-white mb-4">Ticket Info</h2>
            <dl className="space-y-3 text-sm mb-5">
              <div className="flex justify-between"><dt className="text-slate-500">Created by</dt><dd className="text-slate-200 font-medium">{ticket.createdByName}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Created</dt><dd className="text-slate-200 font-medium">{new Date(ticket.createdAt).toLocaleString()}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Last updated</dt><dd className="text-slate-200 font-medium">{new Date(ticket.updatedAt).toLocaleString()}</dd></div>
              {ticket.resolvedAt && (<div className="flex justify-between"><dt className="text-slate-500">Resolved</dt><dd className="text-slate-200 font-medium">{new Date(ticket.resolvedAt).toLocaleString()}</dd></div>)}
            </dl>

            {isStaff && (
              <div className="border-t border-white/8 pt-4 mb-4">
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Assigned Agent</label>
                <select value={ticket.assignedTo || ""} onChange={handleAssign} className={selectCls}>
                  <option value="">Unassigned</option>
                  {agents.map((a) => (<option key={a.id} value={a.id}>{a.name}</option>))}
                </select>
              </div>
            )}
            {!isStaff && (
              <div className="border-t border-white/8 pt-4 mb-4 text-sm">
                <span className="text-slate-500">Assigned to </span>
                <span className="text-slate-200 font-medium">{ticket.assignedToName || "Unassigned"}</span>
              </div>
            )}

            <div className="pt-1 border-t border-white/8">
              {!confirmDelete ? (
                <button onClick={() => setConfirmDelete(true)} className="text-sm font-medium text-red-400 hover:text-red-300 mt-4">Cancel / Delete Ticket</button>
              ) : (
                <div className="space-y-2 mt-4">
                  <p className="text-sm text-slate-400">This can&apos;t be undone. Are you sure?</p>
                  <div className="flex gap-3">
                    <button onClick={handleDelete} className="text-sm font-medium bg-red-600 text-white px-3 py-1.5 rounded-md hover:bg-red-700">Yes, delete</button>
                    <button onClick={() => setConfirmDelete(false)} className="text-sm font-medium text-slate-400 hover:text-slate-200">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </AppLayout>
  );
}