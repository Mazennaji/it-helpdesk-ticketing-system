import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import { createTicket, fetchCategories, fetchPriorities } from "../api/ticketService";
import { classifyTicket } from "../api/aiService";
import { useAuth } from "../context/AuthContext";

const STAFF_ROLES = ["Admin", "IT Support Agent", "Manager"];

export default function CreateTicket() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isStaff = user?.roles?.some((r) => STAFF_ROLES.includes(r));

  const [categories, setCategories] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", categoryId: "", priorityId: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [classifying, setClassifying] = useState(false);
  const [aiHint, setAiHint] = useState(null);

  useEffect(() => {
    Promise.all([fetchCategories(), fetchPriorities()]).then(([c, p]) => {
      setCategories(c);
      setPriorities(p);
      setForm((f) => ({
        ...f,
        categoryId: f.categoryId || c[0]?.id || "",
        priorityId: f.priorityId || p[0]?.id || "",
      }));
    });
  }, []);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSuggest = async () => {
    if (!form.description.trim() || classifying) return;
    setClassifying(true);
    setAiHint(null);
    try {
      const s = await classifyTicket({ title: form.title, description: form.description });
      if (!s.categoryId) {
        setAiHint("Couldn't confidently categorize this yet. Add more detail or set it manually.");
        return;
      }
      setForm((f) => ({
        ...f,
        categoryId: s.categoryId,
        priorityId: s.priorityId ?? f.priorityId,
      }));
      const confident = s.confidence >= 0.7;
      if (isStaff && confident) {
        setAiHint(`Auto-filled: ${s.category} / ${s.priority}. ${s.reasoning || ""}`);
      } else {
        setAiHint(`Suggested: ${s.category} / ${s.priority}. ${s.reasoning || ""} You can change these before submitting.`);
      }
    } catch {
      setAiHint("AI suggestion is unavailable right now. Please set category and priority manually.");
    } finally {
      setClassifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const ticket = await createTicket({
        title: form.title,
        description: form.description,
        categoryId: Number(form.categoryId),
        priorityId: Number(form.priorityId),
      });
      navigate(`/tickets/${ticket.ticketId}`);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create the ticket.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout title="Create Ticket" subtitle="Submit a new support request">
      <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-2xl">
        {error && (
          <div className="mb-5 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
            <input
              type="text"
              name="title"
              required
              value={form.title}
              onChange={handleChange}
              placeholder="Short summary of the issue"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-slate-700">Description</label>
              <button
                type="button"
                onClick={handleSuggest}
                disabled={classifying || !form.description.trim()}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3l1.9 5.8L20 10l-5.1 3.7L16 20l-4-3.5L8 20l1.1-6.3L4 10l6.1-1.2z" />
                </svg>
                {classifying ? "Analyzing..." : "Suggest category & priority"}
              </button>
            </div>
            <textarea
              name="description"
              rows={5}
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the issue in as much detail as possible"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
            />
            {aiHint && (
              <p className="mt-2 text-xs text-slate-500 bg-blue-50/60 border border-blue-100 rounded-md px-3 py-2">
                {aiHint}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select
                name="categoryId"
                value={form.categoryId}
                onChange={handleChange}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
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
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              >
                {priorities.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#0B1F3A] text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-[#132a4d] disabled:opacity-60 transition-colors"
            >
              {submitting ? "Submitting..." : "Submit Ticket"}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}