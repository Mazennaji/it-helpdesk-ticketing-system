import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import NotificationBell from "./NotificationBell";
import AssistantWidget from "./AssistantWidget";

const iconProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

const navItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: (
      <svg {...iconProps}>
        <rect x="3" y="3" width="7" height="9" rx="1" />
        <rect x="14" y="3" width="7" height="5" rx="1" />
        <rect x="14" y="12" width="7" height="9" rx="1" />
        <rect x="3" y="16" width="7" height="5" rx="1" />
      </svg>
    ),
  },
  {
    label: "Tickets",
    path: "/tickets",
    icon: (
      <svg {...iconProps}>
        <path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1-2 2H5a2 2 0 0 1-2-2 2 2 0 0 0 0-4z" />
        <path d="M13 7v10" strokeDasharray="1.5 2.5" />
      </svg>
    ),
  },
  {
    label: "Reports",
    path: "/reports",
    icon: (
      <svg {...iconProps}>
        <path d="M3 3v18h18" />
        <path d="M7 15l3-4 3 2 4-6" />
      </svg>
    ),
  },
  {
    label: "Knowledge Base",
    path: "/knowledge-base",
    icon: (
      <svg {...iconProps}>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
  {
    label: "Settings",
    path: "/settings",
    icon: (
      <svg {...iconProps}>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

function initialsOf(name) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function SidebarContent({ user, location, onNavigate }) {
  return (
    <>
      <div className="flex items-center gap-2.5 px-3 mb-9">
        <span className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
          <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
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
        </span>
        <span className="text-white font-semibold tracking-tight text-base">
          HelpDesk <span className="text-blue-400">Pro</span>
        </span>
      </div>

      <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        Menu
      </p>
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const active =
            item.path === "/dashboard"
              ? location.pathname === "/dashboard"
              : location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.label}
              to={item.path}
              onClick={onNavigate}
              className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
              }`}
            >
              <span
                className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full bg-blue-400 transition-all ${
                  active ? "h-6 opacity-100" : "h-0 opacity-0"
                }`}
              />
              <span
                className={`transition-colors ${
                  active ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300"
                }`}
              >
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/5 border border-white/10">
          <span className="w-9 h-9 shrink-0 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center text-xs font-semibold leading-none select-none">
            {initialsOf(user?.fullName)}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate leading-tight">
              {user?.fullName}
            </p>
            <p className="text-[11px] text-slate-400 truncate leading-tight">
              {user?.roles?.join(", ")}
            </p>
          </div>
        </div>
        <p className="px-3 mt-4 text-[11px] text-slate-600">
          &copy; {new Date().getFullYear()} HelpDesk Pro
        </p>
      </div>
    </>
  );
}

export default function AppLayout({ title, subtitle, children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [query, setQuery] = useState("");
  const menuRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    const onEsc = (e) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setDrawerOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  const submitSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (q) navigate(`/tickets?q=${encodeURIComponent(q)}`);
  };

  return (
    <div className="min-h-screen flex bg-[#0B152A]">
      <aside className="hidden md:flex md:w-64 flex-col bg-gradient-to-b from-[#0B1F3A] to-[#0A1B33] text-slate-300 px-4 py-6 border-r border-white/5">
        <SidebarContent user={user} location={location} />
      </aside>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-64 flex flex-col bg-gradient-to-b from-[#0B1F3A] to-[#0A1B33] text-slate-300 px-4 py-6 shadow-2xl animate-[slideInLeft_0.2s_ease-out]">
            <button
              onClick={() => setDrawerOpen(false)}
              className="absolute top-5 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close menu"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
            <SidebarContent
              user={user}
              location={location}
              onNavigate={() => setDrawerOpen(false)}
            />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-[#0B152A]/80 backdrop-blur-md border-b border-white/8">
          <div className="px-4 md:px-8 h-16 flex items-center gap-3 md:gap-4">
            <button
              onClick={() => setDrawerOpen(true)}
              className="md:hidden w-10 h-10 shrink-0 flex items-center justify-center rounded-xl hover:bg-white/5 transition-colors text-slate-300"
              aria-label="Open menu"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            </button>

            <div className="min-w-0">
              <h1 className="text-base font-semibold text-white tracking-tight truncate">
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
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:bg-white/[0.07] focus:border-blue-400/40 focus:ring-2 focus:ring-blue-500/15 transition"
                />
              </div>
            </form>

            <div className="flex items-center gap-1.5 lg:ml-3 ml-auto">
              <div className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/5 transition-colors">
                <NotificationBell />
              </div>

              <div className="w-px h-6 bg-white/10 mx-1.5 hidden sm:block" />

              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className="flex items-center gap-2.5 pl-1.5 pr-2 py-1.5 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <span className="w-9 h-9 shrink-0 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center text-sm font-semibold leading-none tracking-normal select-none border border-white/10">
                    {initialsOf(user?.fullName)}
                  </span>
                  <span className="text-left hidden sm:block leading-tight">
                    <span className="block text-sm font-medium text-white">
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
                  <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-[#0E1B33] border border-white/10 shadow-xl shadow-black/40 overflow-hidden animate-[fadeIn_0.12s_ease-out]">
                    <div className="px-4 py-3.5 border-b border-white/8 flex items-center gap-3">
                      <span className="w-10 h-10 shrink-0 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center text-sm font-semibold leading-none select-none border border-white/10">
                        {initialsOf(user?.fullName)}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">
                          {user?.fullName}
                        </p>
                        <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                      </div>
                    </div>

                    <div className="py-1.5">
                      <Link
                        to="/settings"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 transition-colors"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="3" />
                          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                        </svg>
                        Settings
                      </Link>
                    </div>

                    <div className="py-1.5 border-t border-white/8">
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
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

        <main className="flex-1 p-4 sm:p-6 md:p-8">{children}</main>
      </div>

      <AssistantWidget />
    </div>
  );
}