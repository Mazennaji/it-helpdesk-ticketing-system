import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const modules = [
  { id: "MOD-01", title: "Ticket Management", body: "Create, categorize, and track every request from submission to resolution." },
  { id: "MOD-02", title: "Smart Assignment", body: "Route tickets automatically by category, or assign manually when judgment calls for it." },
  { id: "MOD-03", title: "AI Triage", body: "Incoming tickets are categorized and prioritized before an agent even opens them." },
  { id: "MOD-04", title: "Real-Time Notifications", body: "Agents and requesters see status changes the moment they happen." },
  { id: "MOD-05", title: "Reporting & Analytics", body: "Resolution time, ticket volume, and agent load, in one dashboard." },
  { id: "MOD-06", title: "Knowledge Base", body: "Point requesters to an answer before they need to open a ticket at all." },
];

const steps = [
  { n: "01", title: "Submit", body: "An employee describes the issue in plain language, no forms to decode." },
  { n: "02", title: "Triage", body: "The system reads the request and assigns a category and priority." },
  { n: "03", title: "Assign", body: "The ticket lands in the right queue, or gets picked up directly." },
  { n: "04", title: "Resolve", body: "The agent works the ticket, and the requester watches it move." },
];

const roles = [
  { name: "Employee", body: "Submits tickets, tracks their status, and gets answers from the knowledge base." },
  { name: "IT Support Agent", body: "Works assigned tickets, adds internal notes, and resolves or escalates." },
  { name: "Manager", body: "Watches team load and resolution time across every open queue." },
  { name: "Admin", body: "Controls users, roles, categories, and system-wide settings." },
];

const statuses = [
  { label: "Open", color: "#3B82F6", fill: "8%" },
  { label: "In Progress", color: "#F59E0B", fill: "52%" },
  { label: "Resolved", color: "#10B981", fill: "100%" },
];

const stats = [
  { value: "42%", label: "Faster first response" },
  { value: "5", label: "Statuses, one clear flow" },
  { value: "24/7", label: "Self-service assistant" },
];

export default function LandingPage() {
  const heroRef = useRef(null);
  const spotlightRef = useRef(null);
  const cardWrapRef = useRef(null);
  const statusLabelRef = useRef(null);
  const statusDotRef = useRef(null);
  const barRef = useRef(null);
  const orb1Ref = useRef(null);
  const orb2Ref = useRef(null);
  const sectionRefs = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(".hero-in", { opacity: 0, y: 24 });
      gsap.timeline({ defaults: { ease: "power3.out" } })
        .to(".hero-in", { opacity: 1, y: 0, duration: 0.8, stagger: 0.12, delay: 0.15 });

      gsap.to(orb1Ref.current, { x: 40, y: 30, duration: 12, repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsap.to(orb2Ref.current, { x: -34, y: -26, duration: 15, repeat: -1, yoyo: true, ease: "sine.inOut" });

      const cycle = gsap.timeline({ repeat: -1, defaults: { ease: "power2.inOut" } });
      statuses.forEach((s) => {
        cycle.to(barRef.current, { width: s.fill, duration: 1.1 }, "+=0.9");
        cycle.call(() => {
          if (!statusLabelRef.current) return;
          statusLabelRef.current.textContent = s.label;
          statusDotRef.current.style.backgroundColor = s.color;
          statusLabelRef.current.style.color = s.color;
          statusDotRef.current.style.boxShadow = `0 0 12px ${s.color}`;
        }, null, "<");
      });

      sectionRefs.current.forEach((el) => {
        if (!el) return;
        gsap.fromTo(
          el.querySelectorAll(".reveal"),
          { opacity: 0, y: 30 },
          {
            opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 80%", toggleActions: "play none none none" },
          }
        );
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const onHeroMove = (e) => {
    const rect = heroRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (spotlightRef.current) {
      gsap.to(spotlightRef.current, { x: x - 300, y: y - 300, duration: 0.6, ease: "power2.out" });
    }
    if (cardWrapRef.current) {
      const cx = (e.clientX / window.innerWidth - 0.5) * 14;
      const cy = (e.clientY / window.innerHeight - 0.5) * 14;
      gsap.to(cardWrapRef.current, { rotateY: cx, rotateX: -cy, duration: 0.6, ease: "power2.out" });
    }
  };

  const addSectionRef = (el) => {
    if (el && !sectionRefs.current.includes(el)) sectionRefs.current.push(el);
  };

  return (
    <div className="bg-[#060A14] text-slate-100 font-['Instrument_Sans',sans-serif] antialiased overflow-hidden">
      <header className="relative z-20 max-w-6xl mx-auto flex items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2.5">
          <svg width="30" height="30" viewBox="0 0 48 48" fill="none">
            <path d="M6 10a6 6 0 0 1 6-6h24a6 6 0 0 1 6 6v18a6 6 0 0 1-6 6H18l-9 8v-8H6V10Z" fill="#13294B" />
            <path d="M14 21l6 6 12-13" stroke="#3B82F6" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-semibold tracking-tight text-lg font-['Space_Grotesk',sans-serif] text-white">
            HelpDesk <span className="text-blue-400">Pro</span>
          </span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#how-it-works" className="text-sm text-slate-400 hover:text-white hidden sm:inline transition-colors">How it works</a>
          <a href="#modules" className="text-sm text-slate-400 hover:text-white hidden sm:inline transition-colors">Modules</a>
          <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Log in</Link>
          <Link to="/register" className="text-sm font-medium bg-white/10 border border-white/15 backdrop-blur text-white px-4 py-2 rounded-lg hover:bg-white/15 transition-colors">
            Start a pilot
          </Link>
        </div>
      </header>

      <section
        ref={heroRef}
        onMouseMove={onHeroMove}
        className="relative min-h-[88vh] flex items-center"
        style={{ perspective: "1200px" }}
      >
        <div className="absolute inset-0 [background-image:radial-gradient(circle_at_center,rgba(59,130,246,0.08),transparent_60%)]" />
        <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,#000_40%,transparent_75%)]" />
        <div ref={orb1Ref} className="absolute top-10 left-1/4 w-[34rem] h-[34rem] rounded-full bg-blue-600/20 blur-[130px] pointer-events-none" />
        <div ref={orb2Ref} className="absolute bottom-0 right-10 w-[30rem] h-[30rem] rounded-full bg-emerald-500/12 blur-[130px] pointer-events-none" />
        <div ref={spotlightRef} className="absolute w-[600px] h-[600px] rounded-full bg-blue-400/10 blur-[100px] pointer-events-none hidden lg:block" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center w-full py-16">
          <div>
            <p className="hero-in inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-blue-300 uppercase mb-6 font-['IBM_Plex_Mono',monospace]">
              <span className="w-6 h-px bg-blue-400/60" />
              IT Service Desk
            </p>
            <h1 className="hero-in text-4xl sm:text-5xl xl:text-6xl font-semibold leading-[1.05] tracking-tight font-['Space_Grotesk',sans-serif]">
              <span className="text-white">Every ticket.</span>
              <br />
              <span className="bg-gradient-to-r from-blue-200 via-white to-blue-300 bg-clip-text text-transparent">
                Tracked, assigned, resolved.
              </span>
            </h1>
            <p className="hero-in mt-6 text-slate-400 text-base leading-relaxed max-w-md">
              HelpDesk Pro gives IT teams one queue for every request — automatically categorized, prioritized, and routed to the right agent.
            </p>
            <div className="hero-in mt-9 flex items-center gap-4">
              <Link to="/register" className="relative bg-white text-[#0B1F3A] font-medium text-sm px-5 py-3 rounded-lg hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] transition-all">
                Start a pilot
              </Link>
              <a href="#how-it-works" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                See how it works &rarr;
              </a>
            </div>

            <div className="hero-in mt-14 grid grid-cols-3 gap-6 max-w-md border-t border-white/10 pt-8">
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-semibold text-white font-['Space_Grotesk',sans-serif] tracking-tight">{s.value}</p>
                  <p className="text-[11px] text-slate-500 mt-1 leading-tight">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div ref={cardWrapRef} className="hero-in" style={{ transformStyle: "preserve-3d" }}>
            <div className="relative rounded-2xl p-[1px] bg-gradient-to-b from-white/20 via-white/5 to-transparent max-w-sm ml-auto shadow-[0_20px_70px_-20px_rgba(59,130,246,0.5)]">
              <div className="rounded-2xl bg-[#0B152A]/80 backdrop-blur-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-['IBM_Plex_Mono',monospace] text-slate-400">TCK-1042</span>
                  <span className="flex items-center gap-1.5 text-xs font-medium">
                    <span ref={statusDotRef} className="w-1.5 h-1.5 rounded-full bg-blue-500" style={{ boxShadow: "0 0 12px #3B82F6" }} />
                    <span ref={statusLabelRef} className="text-blue-400">Open</span>
                  </span>
                </div>
                <p className="text-white text-sm font-medium leading-snug mb-1">VPN connection dropping intermittently</p>
                <p className="text-slate-500 text-xs mb-5 font-['IBM_Plex_Mono',monospace]">Reported by J. Alvarez &middot; Network</p>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/20">High priority</span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10">Assigned: S. Cho</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden mt-4">
                  <div ref={barRef} className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400" style={{ width: "8%" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section ref={addSectionRef} className="relative max-w-6xl mx-auto px-6 py-20">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {roles.map((role) => (
            <div key={role.name} className="reveal rounded-2xl border border-white/5 bg-white/[0.02] p-5 hover:border-white/10 hover:bg-white/[0.04] transition-all">
              <p className="font-semibold text-sm mb-1.5 font-['Space_Grotesk',sans-serif] text-white">{role.name}</p>
              <p className="text-sm text-slate-500 leading-relaxed">{role.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how-it-works" ref={addSectionRef} className="relative border-y border-white/5 py-24 bg-white/[0.015]">
        <div className="absolute top-0 left-1/4 w-[30rem] h-[16rem] rounded-full bg-blue-600/10 blur-[110px] pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-6">
          <p className="reveal text-xs font-semibold tracking-[0.2em] text-blue-400 uppercase mb-3 font-['IBM_Plex_Mono',monospace]">How it works</p>
          <h2 className="reveal text-3xl sm:text-4xl font-semibold tracking-tight mb-14 font-['Space_Grotesk',sans-serif] max-w-lg text-white">
            From submitted to resolved, in four steps.
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step) => (
              <div key={step.n} className="reveal">
                <span className="block text-5xl font-semibold text-white/10 font-['Space_Grotesk',sans-serif] mb-3 tracking-tight">{step.n}</span>
                <p className="font-semibold text-sm mb-1.5 text-white">{step.title}</p>
                <p className="text-sm text-slate-500 leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="modules" ref={addSectionRef} className="relative max-w-6xl mx-auto px-6 py-24">
        <p className="reveal text-xs font-semibold tracking-[0.2em] text-blue-400 uppercase mb-3 font-['IBM_Plex_Mono',monospace]">System modules</p>
        <h2 className="reveal text-3xl sm:text-4xl font-semibold tracking-tight mb-14 font-['Space_Grotesk',sans-serif] max-w-lg text-white">
          Everything a support queue actually needs.
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {modules.map((mod) => (
            <div key={mod.id} className="reveal group relative rounded-xl p-[1px] bg-gradient-to-b from-white/10 to-transparent hover:from-blue-400/40 transition-all">
              <div className="rounded-xl bg-[#0A1220] p-6 h-full group-hover:bg-[#0C1526] transition-colors">
                <span className="text-xs font-['IBM_Plex_Mono',monospace] text-blue-400">{mod.id}</span>
                <p className="font-semibold text-sm mt-2 mb-1.5 text-white group-hover:text-blue-300 transition-colors">{mod.title}</p>
                <p className="text-sm text-slate-500 leading-relaxed">{mod.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section ref={addSectionRef} className="relative overflow-hidden py-24 border-t border-white/5">
        <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,#000_30%,transparent_70%)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[40rem] h-[22rem] rounded-full bg-blue-600/15 blur-[110px] pointer-events-none" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <h2 className="reveal text-3xl sm:text-4xl font-semibold text-white tracking-tight font-['Space_Grotesk',sans-serif] mb-5">
            Bring order to your support queue.
          </h2>
          <p className="reveal text-slate-400 mb-9 max-w-md mx-auto">
            Set up your first queue in minutes. No credit card, no sales call.
          </p>
          <Link to="/register" className="reveal inline-block bg-white text-[#0B1F3A] font-medium text-sm px-6 py-3 rounded-lg hover:shadow-[0_0_40px_rgba(59,130,246,0.5)] transition-all">
            Start a pilot
          </Link>
        </div>
      </section>

      <footer className="relative max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500 border-t border-white/5">
        <span className="font-['Space_Grotesk',sans-serif] text-white font-semibold">
          HelpDesk <span className="text-blue-400">Pro</span>
        </span>
        <span>&copy; {new Date().getFullYear()} HelpDesk Pro. All rights reserved.</span>
      </footer>
    </div>
  );
}