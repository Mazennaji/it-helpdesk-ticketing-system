import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { label: "Dashboard", active: true },
  { label: "Tickets", active: false },
  { label: "Reports", active: false },
  { label: "Knowledge Base", active: false },
  { label: "Settings", active: false },
];

const stats = [
  { label: "Open", value: 24, accent: "#3B82F6" },
  { label: "In Progress", value: 12, accent: "#F59E0B" },
  { label: "Resolved", value: 138, accent: "#10B981" },
  { label: "Critical", value: 3, accent: "#EF4444" },
];

export default function Dashboard() {
  const { user, logout } = useAuth();

  const rootRef = useRef(null);
  const sidebarRef = useRef(null);
  const headerRef = useRef(null);
  const cardRefs = useRef([]);
  const chartRef = useRef(null);
  const valueRefs = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(sidebarRef.current, { x: -40, opacity: 0 });
      gsap.set(headerRef.current, { y: -16, opacity: 0 });
      gsap.set(cardRefs.current, { y: 24, opacity: 0 });
      gsap.set(chartRef.current, { y: 24, opacity: 0 });

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.to(sidebarRef.current, { x: 0, opacity: 1, duration: 0.6 })
        .to(headerRef.current, { y: 0, opacity: 1, duration: 0.5 }, "-=0.3")
        .to(cardRefs.current, { y: 0, opacity: 1, duration: 0.55, stagger: 0.1 }, "-=0.2")
        .to(chartRef.current, { y: 0, opacity: 1, duration: 0.55 }, "-=0.25");

      valueRefs.current.forEach((el, i) => {
        const target = stats[i].value;
        const counter = { val: 0 };
        gsap.to(counter, {
          val: target,
          duration: 1.1,
          delay: 0.4 + i * 0.1,
          ease: "power2.out",
          onUpdate: () => {
            el.textContent = Math.round(counter.val);
          },
        });
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  const onCardEnter = (i) => {
    gsap.to(cardRefs.current[i], { y: -4, duration: 0.25, ease: "power2.out" });
  };
  const onCardLeave = (i) => {
    gsap.to(cardRefs.current[i], { y: 0, duration: 0.25, ease: "power2.out" });
  };

  return (
    <div ref={rootRef} className="min-h-screen flex bg-[#F7F8FA]">
      <aside
        ref={sidebarRef}
        className="hidden md:flex md:w-64 flex-col bg-[#0B1F3A] text-slate-300 px-5 py-6"
      >
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
          {navItems.map((item) => (
            <a
              key={item.label}
              href="#"
              className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                item.active
                  ? "bg-white/10 text-white"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="mt-auto px-2 pt-6 border-t border-white/10">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} HelpDesk Pro
          </p>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header
          ref={headerRef}
          className="bg-white border-b border-slate-200 px-6 md:px-8 py-4 flex items-center justify-between"
        >
          <div>
            <h1 className="text-lg font-semibold text-slate-900 tracking-tight">
              Welcome back{user?.fullName ? `, ${user.fullName.split(" ")[0]}` : ""}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Here&apos;s what&apos;s happening across your support queue today
            </p>
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

        <main className="flex-1 p-6 md:p-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                ref={(el) => (cardRefs.current[i] = el)}
                onMouseEnter={() => onCardEnter(i)}
                onMouseLeave={() => onCardLeave(i)}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    {stat.label}
                  </span>
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: stat.accent }}
                  />
                </div>
                <p
                  ref={(el) => (valueRefs.current[i] = el)}
                  className="text-3xl font-semibold text-slate-900 tracking-tight"
                >
                  0
                </p>
              </div>
            ))}
          </div>

          <div
            ref={chartRef}
            className="bg-white rounded-xl border border-slate-200 p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-semibold text-slate-800">
                Ticket Volume Trend
              </h2>
              <span className="text-xs text-slate-400">Last 30 days</span>
            </div>
            <div className="h-56 rounded-lg bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center text-sm text-slate-400">
              Chart integration coming in a later sprint
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}