import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import AppLayout from "../components/AppLayout";
import { useAuth } from "../context/AuthContext";
import {
  fetchArticles, fetchArticle, fetchArticleCategories,
  createArticle, updateArticle, deleteArticle,
} from "../api/knowledgeBaseService";

const STAFF_ROLES = ["Admin", "IT Support Agent", "Manager"];
const inputCls = "w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400/40 transition";
const emptyDraft = { title: "", category: "", summary: "", body: "", isPublished: true };

function ArticleBody({ text }) {
  if (!text) return null;
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let list = null;
  const flush = () => { if (list) { blocks.push(list); list = null; } };
  lines.forEach((raw, i) => {
    const line = raw.trim();
    const ordered = line.match(/^(\d+)[.)]\s*(.*)$/);
    const bullet = line.match(/^[-*•]\s*(.*)$/);
    if (ordered) { if (!list || list.type !== "ol") { flush(); list = { type: "ol", items: [], key: `ol-${i}` }; } list.items.push(ordered[2]); }
    else if (bullet) { if (!list || list.type !== "ul") { flush(); list = { type: "ul", items: [], key: `ul-${i}` }; } list.items.push(bullet[1]); }
    else if (line === "") { flush(); }
    else { flush(); blocks.push({ type: "p", text: line, key: `p-${i}` }); }
  });
  flush();
  return (
    <div className="text-sm text-slate-300 leading-relaxed space-y-3">
      {blocks.map((b) => {
        if (b.type === "p") return <p key={b.key}>{b.text}</p>;
        if (b.type === "ol") return (<ol key={b.key} className="list-decimal pl-6 space-y-1.5 marker:text-slate-500 marker:font-medium">{b.items.map((it, idx) => (<li key={idx} className="pl-1">{it}</li>))}</ol>);
        return (<ul key={b.key} className="list-disc pl-6 space-y-1.5 marker:text-slate-500">{b.items.map((it, idx) => (<li key={idx} className="pl-1">{it}</li>))}</ul>);
      })}
    </div>
  );
}

function ArticleCard({ article, onOpen }) {
  return (
    <button onClick={() => onOpen(article.id)} className="text-left glass glass-hover-lift p-5 group">
      <div className="flex items-center gap-2 mb-2.5">
        <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-500/15 text-blue-300">{article.category || "General"}</span>
        {!article.isPublished && (<span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/15 text-amber-300">Draft</span>)}
      </div>
      <h3 className="text-sm font-semibold text-white mb-1.5 group-hover:text-blue-300 transition-colors">{article.title}</h3>
      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{article.summary}</p>
    </button>
  );
}

export default function KnowledgeBase() {
  const { user } = useAuth();
  const isStaff = useMemo(() => (user?.roles || []).some((r) => STAFF_ROLES.includes(r)), [user]);

  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const rootRef = useRef(null);
  const gridRef = useRef(null);

  const load = () => {
    setLoading(true);
    const params = {};
    if (search.trim()) params.search = search.trim();
    if (activeCategory !== "All") params.category = activeCategory;
    Promise.all([fetchArticles(params), fetchArticleCategories()])
      .then(([list, cats]) => { setArticles(list); setCategories(cats); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, activeCategory]);

  useEffect(() => {
    if (loading) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(gridRef.current?.children || [], { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, stagger: 0.05, ease: "power3.out" });
    }, rootRef);
    return () => ctx.revert();
  }, [loading, articles]);

  const openArticle = async (id) => { try { setSelected(await fetchArticle(id)); } catch { /* ignore */ } };
  const startCreate = () => setEditing({ ...emptyDraft });
  const startEdit = (article) => { setSelected(null); setEditing({ ...article }); };

  const saveDraft = async () => {
    if (!editing.title.trim()) return;
    setSaving(true);
    try { if (editing.id) await updateArticle(editing.id, editing); else await createArticle(editing); setEditing(null); load(); }
    catch { /* ignore */ } finally { setSaving(false); }
  };

  const removeArticle = async (id) => {
    if (!window.confirm("Delete this article? This cannot be undone.")) return;
    try { await deleteArticle(id); setSelected(null); load(); } catch { /* ignore */ }
  };

  const categoryPills = ["All", ...categories];

  return (
    <AppLayout title="Knowledge Base" subtitle="Search guides and solutions, or browse by category">
      <div ref={rootRef} className="relative z-10">
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="relative flex-1 min-w-[240px]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" /><path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input className={`${inputCls} pl-10`} placeholder="Search articles…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          {isStaff && (
            <button onClick={startCreate} className="sheen inline-flex items-center gap-2 px-4 py-2.5 bg-white text-[#0B1F3A] text-sm font-medium rounded-lg hover:shadow-[0_0_28px_rgba(59,130,246,0.45)] transition-all whitespace-nowrap">
              <span className="text-base leading-none">+</span> New Article
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {categoryPills.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${activeCategory === cat ? "bg-blue-500 text-white" : "bg-white/5 border border-white/10 text-slate-300 hover:border-white/20"}`}>
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-sm text-slate-500 py-16 text-center">Loading articles…</div>
        ) : articles.length === 0 ? (
          <div className="text-sm text-slate-500 py-16 text-center">No articles found. {isStaff && "Create the first one to get started."}</div>
        ) : (
          <div ref={gridRef} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {articles.map((a) => (<ArticleCard key={a.id} article={a} onOpen={openArticle} />))}
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-start justify-center p-4 md:p-8 overflow-y-auto premium-scroll" onClick={() => setSelected(null)}>
          <div className="glass max-w-2xl w-full my-8" onClick={(e) => e.stopPropagation()}>
            <div className="p-8">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-500/15 text-blue-300">{selected.category || "General"}</span>
                  {!selected.isPublished && (<span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/15 text-amber-300">Draft</span>)}
                </div>
                <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-slate-300 text-xl leading-none">×</button>
              </div>
              <h2 className="text-xl font-semibold text-white tracking-tight mb-3">{selected.title}</h2>
              <p className="text-sm text-slate-400 mb-6">{selected.summary}</p>
              <ArticleBody text={selected.body} />
              {isStaff && (
                <div className="flex gap-3 mt-8 pt-6 border-t border-white/8">
                  <button onClick={() => startEdit(selected)} className="px-4 py-2 text-sm font-medium text-slate-200 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">Edit</button>
                  <button onClick={() => removeArticle(selected.id)} className="px-4 py-2 text-sm font-medium text-red-300 bg-red-500/10 rounded-lg hover:bg-red-500/15 transition-colors">Delete</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-start justify-center p-4 md:p-8 overflow-y-auto premium-scroll">
          <div className="glass max-w-2xl w-full my-8">
            <div className="p-8 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-white">{editing.id ? "Edit Article" : "New Article"}</h2>
                <button onClick={() => setEditing(null)} className="text-slate-500 hover:text-slate-300 text-xl leading-none">×</button>
              </div>
              <input className={inputCls} placeholder="Title" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
              <input className={inputCls} placeholder="Category (e.g. Network, Hardware, Accounts)" value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} list="kb-categories" />
              <datalist id="kb-categories">{categories.map((c) => (<option key={c} value={c} />))}</datalist>
              <textarea className={`${inputCls} resize-none`} rows={2} placeholder="Short summary shown on the card" value={editing.summary} onChange={(e) => setEditing({ ...editing, summary: e.target.value })} />
              <textarea className={`${inputCls} resize-none`} rows={10} placeholder="Article body" value={editing.body} onChange={(e) => setEditing({ ...editing, body: e.target.value })} />
              <label className="flex items-center gap-2.5 text-sm text-slate-300">
                <input type="checkbox" checked={editing.isPublished} onChange={(e) => setEditing({ ...editing, isPublished: e.target.checked })} className="w-4 h-4 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500/30" />
                Publish immediately (uncheck to save as draft)
              </label>
              <div className="flex gap-3 pt-2">
                <button onClick={saveDraft} disabled={saving || !editing.title.trim()} className="sheen px-5 py-2.5 bg-white text-[#0B1F3A] text-sm font-medium rounded-lg hover:shadow-[0_0_28px_rgba(59,130,246,0.45)] disabled:opacity-60 transition-all">
                  {saving ? "Saving…" : "Save"}
                </button>
                <button onClick={() => setEditing(null)} className="px-5 py-2.5 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}