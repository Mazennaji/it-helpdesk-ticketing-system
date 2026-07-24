import { useAuth } from "../context/AuthContext";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Tickets", path: "/tickets" },
  { label: "Reports", path: "/reports" },
  { label: "Knowledge Base", path: "/knowledge-base" },
  { label: "Settings", path: "/settings" },
];

export default function AppLayout({ title, subtitle, children }) {
  const { user, logout } = useAuth();
  const location = useLocation();

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
        <header className="bg-white border-b border-slate-200 px-6 md:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-slate-900 tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-slate-800">{user?.fullName}</p>
              <p className="text-xs text-slate-500">{user?.roles?.join(", ")}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-[#0B1F3A] text-white flex items-center justify-center text-sm font-semibold">
              {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <button
              onClick={logout}
              className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
            >
              Log out
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}