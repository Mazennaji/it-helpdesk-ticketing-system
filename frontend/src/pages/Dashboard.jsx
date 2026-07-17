import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-800">
          IT Help Desk &amp; Ticketing System
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-600">
            {user?.fullName} <span className="text-slate-400">·</span>{" "}
            {user?.roles?.join(", ")}
          </span>
          <button
            onClick={logout}
            className="text-sm font-medium text-red-600 hover:text-red-700"
          >
            Log out
          </button>
        </div>
      </header>

      <main className="p-6">
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
          Dashboard content goes here — ticket widgets, charts, and recent
          activity will be built out in the coming weeks.
        </div>
      </main>
    </div>
  );
}
