import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import gsap from "gsap";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });

  const rootRef = useRef(null);
  const panelRef = useRef(null);
  const orbARef = useRef(null);
  const orbBRef = useRef(null);
  const formRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(".gsap-field", { opacity: 0, y: 18 });
      gsap.set(panelRef.current, { opacity: 0, x: -24 });
      gsap.set(formRef.current, { opacity: 0, x: 24 });

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.to(panelRef.current, { opacity: 1, x: 0, duration: 0.7 })
        .to(formRef.current, { opacity: 1, x: 0, duration: 0.7 }, "<0.1")
        .to(".gsap-field", { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 }, "-=0.35");

      gsap.to(orbARef.current, {
        y: 26,
        x: 14,
        duration: 7,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      gsap.to(orbBRef.current, {
        y: -20,
        x: -18,
        duration: 9,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(form);
      navigate("/dashboard");
    } catch {
      gsap.fromTo(
        formRef.current,
        { x: -6 },
        { x: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" }
      );
    }
  };

  const onButtonEnter = () => {
    gsap.to(buttonRef.current, { scale: 1.015, duration: 0.2, ease: "power2.out" });
  };
  const onButtonLeave = () => {
    gsap.to(buttonRef.current, { scale: 1, duration: 0.2, ease: "power2.out" });
  };

  return (
    <div ref={rootRef} className="min-h-screen flex bg-[#0B1220]">
      <div
        ref={panelRef}
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#0B1F3A] via-[#0E274A] to-[#0B1220]"
      >
        <div
          ref={orbARef}
          className="absolute -top-24 -left-16 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl"
        />
        <div
          ref={orbBRef}
          className="absolute bottom-0 right-0 w-[28rem] h-[28rem] rounded-full bg-emerald-400/10 blur-3xl"
        />

        <div className="relative z-10 flex flex-col justify-between p-14 w-full">
          <div className="flex items-center gap-3">
            <svg width="34" height="34" viewBox="0 0 48 48" fill="none">
              <path
                d="M6 10a6 6 0 0 1 6-6h24a6 6 0 0 1 6 6v18a6 6 0 0 1-6 6H18l-9 8v-8H6V10Z"
                fill="#13294B"
              />
              <path
                d="M14 21l6 6 12-13"
                stroke="#3B82F6"
                strokeWidth="3.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-white font-semibold tracking-tight text-lg">
              HelpDesk <span className="text-blue-400">Pro</span>
            </span>
          </div>

          <div>
            <h2 className="text-3xl font-semibold text-white leading-snug tracking-tight">
              Enterprise support,
              <br />
              resolved faster.
            </h2>
            <p className="mt-4 text-slate-400 text-sm max-w-sm leading-relaxed">
              Centralized ticketing, intelligent routing, and real-time
              visibility for modern IT teams.
            </p>
          </div>

          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} HelpDesk Pro. All rights reserved.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center bg-[#F7F8FA] px-6 py-16">
        <div ref={formRef} className="w-full max-w-sm">
          <div className="gsap-field mb-8">
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Log in to your Help Desk workspace
            </p>
          </div>

          {error && (
            <div className="gsap-field mb-5 rounded-lg bg-red-50 border border-red-100 px-4 py-2.5 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="gsap-field">
              <label className="block text-xs font-medium text-slate-600 mb-1.5 tracking-wide uppercase">
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                placeholder="you@company.com"
              />
            </div>

            <div className="gsap-field">
              <label className="block text-xs font-medium text-slate-600 mb-1.5 tracking-wide uppercase">
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                value={form.password}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                placeholder="••••••••"
              />
            </div>

            <button
              ref={buttonRef}
              type="submit"
              disabled={loading}
              onMouseEnter={onButtonEnter}
              onMouseLeave={onButtonLeave}
              className="gsap-field w-full rounded-lg bg-[#0B1F3A] py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-950/20 transition-colors hover:bg-[#132a4d] disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>

          <p className="gsap-field text-sm text-slate-500 text-center mt-8">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="text-[#0B1F3A] font-medium hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}