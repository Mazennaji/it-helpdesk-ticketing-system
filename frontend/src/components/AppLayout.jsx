import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import NotificationBell from "./NotificationBell";
import AssistantWidget from "./AssistantWidget";

const navItems = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Tickets", path: "/tickets" },
  { label: "Reports", path: "/reports" },
  { label: "Knowledge Base", path: "/knowledge-base" },
  { label: "Settings", path: "/settings" },
];

function initialsOf(name) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export default function AppLayout({ title, subtitle, children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const menuRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    const onEsc = (e) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  const submitSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (q) navigate(`/tickets?q=${encodeURIComponent(q)}`);
  };

  return (
    <div className="min-h-screen flex bg-[#F7F8FA]">
      <aside className="hidden md:flex md:w-64 flex-col bg-[#0B1F3A] text-slate-300 px-5 py-6">
        <div className="flex items-center gap-2.5 px-2 mb-10">
          <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
            <path
              d="M6 10a6 6 0 0 1 6-6h24a6 6 0 0 1 6 6v18a6 6 0 0 1-6 6H18l-9 8v-8H6V10Z"
              fill="#13294B"
            />
            <path
              d="M14 21l6 6 12-13"
              stroke="#3B82F6"
              strokeWidth="3.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-white font-semibold tracking-tight text-base">
            HelpDesk <span className="text-blue-400">Pro</span>
          </span>
        </div>

        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const active = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto px-2 pt-6 border-t border-white/10">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} HelpDesk Pro
          </p>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/80">
          <div className="px-6 md:px-8 h-16 flex items-center gap-4">
            <div className="min-w-0">
              <h1 className="text-base font-semibold text-slate-900 tracking-tight truncate">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs text-slate-400 mt-0.5 truncate hidden sm:block">
                  {subtitle}
                </p>
              )}
            </div>

            <form
              onSubmit={submitSearch}
              className="hidden lg:flex items-center ml-auto w-72 group"
            >
              <div className="relative w-full">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                  <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search tickets"
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-slate-100/80 border border-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-200 focus:ring-2 focus:ring-blue-500/15 transition"
                />
              </div>
            </form>

            <div className={`flex items-center gap-1.5 ${"lg:ml-3 ml-auto"}`}>
              <div className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors">
                <NotificationBell />
              </div>

              <div className="w-px h-6 bg-slate-200 mx-1.5" />

              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className="flex items-center gap-2.5 pl-1.5 pr-2 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <span className="w-9 h-9 shrink-0 rounded-full bg-[#0B1F3A] text-white flex items-center justify-center text-sm font-semibold leading-none tracking-normal select-none">
                    {initialsOf(user?.fullName)}
                  </span>
                  <span className="text-left hidden sm:block leading-tight">
                    <span className="block text-sm font-medium text-slate-800">
                      {user?.fullName}
                    </span>
                    <span className="block text-xs text-slate-400">
                      {user?.roles?.join(", ")}
                    </span>
                  </span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    className={`text-slate-400 hidden sm:block transition-transform ${menuOpen ? "rotate-180" : ""}`}
                  >
                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-white border border-slate-200 shadow-xl shadow-slate-900/5 overflow-hidden animate-[fadeIn_0.12s_ease-out]">
                    <div className="px-4 py-3.5 border-b border-slate-100 flex items-center gap-3">
                      <span className="w-10 h-10 shrink-0 rounded-full bg-[#0B1F3A] text-white flex items-center justify-center text-sm font-semibold leading-none select-none">
                        {initialsOf(user?.fullName)}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">
                          {user?.fullName}
                        </p>
                        <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                      </div>
                    </div>

                    <div className="py-1.5">
                      <Link
                        to="/settings"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="3" />
                          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                        </svg>
                        Settings
                      </Link>
                    </div>

                    <div className="py-1.5 border-t border-slate-100">
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                          <path d="M16 17l5-5-5-5M21 12H9" />
                        </svg>
                        Log out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>

      <AssistantWidget />
    </div>
  );
}