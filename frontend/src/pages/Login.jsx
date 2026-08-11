import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import gsap from "gsap";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });

  const rootRef = useRef(null);
  const cardRef = useRef(null);
  const orbARef = useRef(null);
  const orbBRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(".gsap-field", { opacity: 0, y: 18 });
      gsap.set(cardRef.current, { opacity: 0, y: 30, scale: 0.98 });

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.to(cardRef.current, { opacity: 1, y: 0, scale: 1, duration: 0.8 })
        .to(".gsap-field", { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 }, "-=0.4");

      gsap.to(orbARef.current, { x: 40, y: 30, duration: 12, repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsap.to(orbBRef.current, { x: -34, y: -26, duration: 15, repeat: -1, yoyo: true, ease: "sine.inOut" });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(form);
      navigate("/dashboard");
    } catch {
      gsap.fromTo(cardRef.current, { x: -6 }, { x: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
    }
  };

  const fillDemo = () => setForm({ email: "admin@test.com", password: "Test1234!" });

  const onButtonEnter = () => gsap.to(buttonRef.current, { scale: 1.015, duration: 0.2, ease: "power2.out" });
  const onButtonLeave = () => gsap.to(buttonRef.current, { scale: 1, duration: 0.2, ease: "power2.out" });

  return (
    <div ref={rootRef} className="min-h-screen relative flex items-center justify-center overflow-hidden bg-[#060A14] font-['Instrument_Sans',sans-serif] antialiased px-6 py-16">
      <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,#000_35%,transparent_75%)]" />
      <div ref={orbARef} className="absolute top-1/4 left-1/4 w-[32rem] h-[32rem] rounded-full bg-blue-600/20 blur-[130px] pointer-events-none" />
      <div ref={orbBRef} className="absolute bottom-1/4 right-1/4 w-[28rem] h-[28rem] rounded-full bg-emerald-500/12 blur-[130px] pointer-events-none" />

      <div ref={cardRef} className="relative z-10 w-full max-w-md">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
            <path d="M6 10a6 6 0 0 1 6-6h24a6 6 0 0 1 6 6v18a6 6 0 0 1-6 6H18l-9 8v-8H6V10Z" fill="#13294B" />
            <path d="M14 21l6 6 12-13" stroke="#3B82F6" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-white font-semibold tracking-tight text-lg font-['Space_Grotesk',sans-serif]">
            HelpDesk <span className="text-blue-400">Pro</span>
          </span>
        </div>

        <div className="rounded-2xl p-[1px] bg-gradient-to-b from-white/20 via-white/5 to-transparent shadow-[0_30px_80px_-20px_rgba(59,130,246,0.4)]">
          <div className="rounded-2xl bg-[#0B152A]/80 backdrop-blur-2xl p-8">
            <div className="gsap-field mb-7 text-center">
              <h1 className="text-2xl font-semibold text-white tracking-tight font-['Space_Grotesk',sans-serif]">Welcome back</h1>
              <p className="text-sm text-slate-400 mt-1">Log in to your Help Desk workspace</p>
            </div>

            {error && (
              <div className="gsap-field mb-5 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2.5 text-sm text-red-300">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="gsap-field">
                <label className="block text-xs font-medium text-slate-400 mb-1.5 tracking-wide uppercase">Email</label>
                <input
                  type="email" name="email" required value={form.email} onChange={handleChange}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-blue-400/50 focus:bg-white/[0.07] focus:ring-4 focus:ring-blue-500/10"
                  placeholder="you@company.com"
                />
              </div>

              <div className="gsap-field">
                <label className="block text-xs font-medium text-slate-400 mb-1.5 tracking-wide uppercase">Password</label>
                <input
                  type="password" name="password" required value={form.password} onChange={handleChange}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-blue-400/50 focus:bg-white/[0.07] focus:ring-4 focus:ring-blue-500/10"
                  placeholder="••••••••"
                />
              </div>

              <button
                ref={buttonRef} type="submit" disabled={loading}
                onMouseEnter={onButtonEnter} onMouseLeave={onButtonLeave}
                className="gsap-field w-full rounded-lg bg-white py-2.5 text-sm font-medium text-[#0B1F3A] transition-all hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] disabled:opacity-60"
              >
                {loading ? "Logging in..." : "Log in"}
              </button>
            </form>

            <button
              onClick={fillDemo}
              className="gsap-field w-full mt-3 rounded-lg border border-dashed border-white/15 py-2.5 text-xs font-medium text-slate-400 hover:border-blue-400/40 hover:text-blue-300 transition-colors"
            >
              Fill demo admin credentials
            </button>

            <p className="gsap-field text-sm text-slate-400 text-center mt-7">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="text-blue-400 font-medium hover:text-blue-300 transition-colors">Register</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}