import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const modules = [
  {
    id: "MOD-01",
    title: "Ticket Management",
    body: "Create, categorize, and track every request from submission to resolution.",
  },
  {
    id: "MOD-02",
    title: "Smart Assignment",
    body: "Route tickets automatically by category, or assign manually when judgment calls for it.",
  },
  {
    id: "MOD-03",
    title: "AI Triage",
    body: "Incoming tickets are categorized and prioritized before an agent even opens them.",
  },
  {
    id: "MOD-04",
    title: "Real-Time Notifications",
    body: "Agents and requesters see status changes the moment they happen.",
  },
  {
    id: "MOD-05",
    title: "Reporting & Analytics",
    body: "Resolution time, ticket volume, and agent load, in one dashboard.",
  },
  {
    id: "MOD-06",
    title: "Knowledge Base",
    body: "Point requesters to an answer before they need to open a ticket at all.",
  },
];

const steps = [
  {
    n: "01",
    title: "Submit",
    body: "An employee describes the issue in plain language, no forms to decode.",
  },
  {
    n: "02",
    title: "Triage",
    body: "The system reads the request and assigns a category and priority.",
  },
  {
    n: "03",
    title: "Assign",
    body: "The ticket lands in the right queue, or gets picked up directly.",
  },
  {
    n: "04",
    title: "Resolve",
    body: "The agent works the ticket, and the requester watches it move.",
  },
];

const roles = [
  {
    name: "Employee",
    body: "Submits tickets, tracks their status, and gets answers from the knowledge base.",
  },
  {
    name: "IT Support Agent",
    body: "Works assigned tickets, adds internal notes, and resolves or escalates.",
  },
  {
    name: "Manager",
    body: "Watches team load and resolution time across every open queue.",
  },
  {
    name: "Admin",
    body: "Controls users, roles, categories, and system-wide settings.",
  },
];

const statuses = [
  { label: "Open", color: "#3B82F6", fill: "8%" },
  { label: "In Progress", color: "#F59E0B", fill: "52%" },
  { label: "Resolved", color: "#10B981", fill: "100%" },
];

export default function LandingPage() {
  const heroRef = useRef(null);
  const statusLabelRef = useRef(null);
  const statusDotRef = useRef(null);
  const barRef = useRef(null);
  const sectionRefs = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(".hero-in", { opacity: 0, y: 22 });
      gsap.timeline({ defaults: { ease: "power3.out" } })
        .to(".hero-in", { opacity: 1, y: 0, duration: 0.7, stagger: 0.12 });

      const cycle = gsap.timeline({ repeat: -1, defaults: { ease: "power2.inOut" } });
      statuses.forEach((s) => {
        cycle.to(barRef.current, { width: s.fill, duration: 1.1 }, "+=0.9");
        cycle.call(() => {
          statusLabelRef.current.textContent = s.label;
          statusDotRef.current.style.backgroundColor = s.color;
          statusLabelRef.current.style.color = s.color;
        }, null, "<");
      });

      sectionRefs.current.forEach((el) => {
        if (!el) return;
        gsap.fromTo(
          el.querySelectorAll(".reveal"),
          { opacity: 0, y: 26 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 78%",
              toggleActions: "play none none none",
            },
          }
        );
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const addSectionRef = (el) => {
    if (el && !sectionRefs.current.includes(el)) sectionRefs.current.push(el);
  };

  return (
    <div ref={heroRef} className="bg-[#F7F8FA] text-slate-900 font-[\'Inter\',sans-serif]">
      <header className="max-w-6xl mx-auto flex items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2.5">
          <svg width="30" height="30" viewBox="0 0 48 48" fill="none">
            <path d="M6 10a6 6 0 0 1 6-6h24a6 6 0 0 1 6 6v18a6 6 0 0 1-6 6H18l-9 8v-8H6V10Z" fill="#0B1F3A" />
            <path d="M14 21l6 6 12-13" stroke="#3B82F6" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-semibold tracking-tight text-lg font-[\'Space_Grotesk\',sans-serif]">
            HelpDesk <span className="text-blue-600">Pro</span>
          </span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#how-it-works" className="text-sm text-slate-600 hover:text-slate-900 hidden sm:inline">
            How it works
          </a>
          <a href="#modules" className="text-sm text-slate-600 hover:text-slate-900 hidden sm:inline">
            Modules
          </a>
          <Link to="/login" className="text-sm font-medium text-slate-700 hover:text-slate-900">
            Log in
          </Link>
          <Link
            to="/register"
            className="text-sm font-medium bg-[#0B1F3A] text-white px-4 py-2 rounded-lg hover:bg-[#132a4d] transition-colors"
          >
            Start a pilot
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden bg-gradient-to-b from-[#0B1220] via-[#0B1F3A] to-[#0E274A]">
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:44px_44px]" />

        <div className="relative max-w-6xl mx-auto px-6 pt-16 pb-24 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="hero-in text-xs font-semibold tracking-[0.2em] text-blue-400 uppercase mb-5 font-[\'IBM_Plex_Mono\',monospace]">
              IT Service Desk
            </p>
            <h1 className="hero-in text-4xl sm:text-5xl font-semibold text-white leading-[1.1] tracking-tight font-[\'Space_Grotesk\',sans-serif]">
              Every ticket.
              <br />
              Tracked, assigned, resolved.
            </h1>
            <p className="hero-in mt-6 text-slate-400 text-base leading-relaxed max-w-md">
              HelpDesk Pro gives IT teams one queue for every request —
              automatically categorized, prioritized, and routed to the
              right agent.
            </p>
            <div className="hero-in mt-9 flex items-center gap-4">
              <Link
                to="/register"
                className="bg-white text-[#0B1F3A] font-medium text-sm px-5 py-3 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Start a pilot
              </Link>
              <a
                href="#how-it-works"
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                See how it works &rarr;
              </a>
            </div>
          </div>

          <div className="hero-in">
            <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 backdrop-blur-sm max-w-sm ml-auto">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-[\'IBM_Plex_Mono\',monospace] text-slate-400">
                  TCK-1042
                </span>
                <span className="flex items-center gap-1.5 text-xs font-medium">
                  <span ref={statusDotRef} className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span ref={statusLabelRef} className="text-blue-400">Open</span>
                </span>
              </div>
              <p className="text-white text-sm font-medium leading-snug mb-1">
                VPN connection dropping intermittently
              </p>
              <p className="text-slate-500 text-xs mb-5">
                Reported by J. Alvarez &middot; Network
              </p>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-red-500/15 text-red-400">
                  High priority
                </span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                  Assigned: S. Cho
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden mt-4">
                <div ref={barRef} className="h-full rounded-full bg-blue-500" style={{ width: "8%" }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section ref={addSectionRef} className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid sm:grid-cols-4 gap-6 text-center">
          {roles.map((role) => (
            <div key={role.name} className="reveal">
              <p className="font-semibold text-sm mb-1.5 font-[\'Space_Grotesk\',sans-serif]">
                {role.name}
              </p>
              <p className="text-sm text-slate-500 leading-relaxed">{role.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how-it-works" ref={addSectionRef} className="bg-white border-y border-slate-200 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <p className="reveal text-xs font-semibold tracking-[0.2em] text-blue-600 uppercase mb-3 font-[\'IBM_Plex_Mono\',monospace]">
            How it works
          </p>
          <h2 className="reveal text-3xl font-semibold tracking-tight mb-14 font-[\'Space_Grotesk\',sans-serif] max-w-lg">
            From submitted to resolved, in four steps.
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step) => (
              <div key={step.n} className="reveal">
                <span className="block text-4xl font-semibold text-slate-200 font-[\'Space_Grotesk\',sans-serif] mb-3">
                  {step.n}
                </span>
                <p className="font-semibold text-sm mb-1.5">{step.title}</p>
                <p className="text-sm text-slate-500 leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="modules" ref={addSectionRef} className="max-w-6xl mx-auto px-6 py-24">
        <p className="reveal text-xs font-semibold tracking-[0.2em] text-blue-600 uppercase mb-3 font-[\'IBM_Plex_Mono\',monospace]">
          System modules
        </p>
        <h2 className="reveal text-3xl font-semibold tracking-tight mb-14 font-[\'Space_Grotesk\',sans-serif] max-w-lg">
          Everything a support queue actually needs.
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {modules.map((mod) => (
            <div
              key={mod.id}
              className="reveal border border-slate-200 rounded-xl p-6 hover:border-slate-300 hover:shadow-sm transition-all"
            >
              <span className="text-xs font-[\'IBM_Plex_Mono\',monospace] text-blue-600">
                {mod.id}
              </span>
              <p className="font-semibold text-sm mt-2 mb-1.5">{mod.title}</p>
              <p className="text-sm text-slate-500 leading-relaxed">{mod.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section ref={addSectionRef} className="bg-[#0B1F3A] py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="reveal text-3xl sm:text-4xl font-semibold text-white tracking-tight font-[\'Space_Grotesk\',sans-serif] mb-5">
            Bring order to your support queue.
          </h2>
          <p className="reveal text-slate-400 mb-9 max-w-md mx-auto">
            Set up your first queue in minutes. No credit card, no sales call.
          </p>
          <Link
            to="/register"
            className="reveal inline-block bg-white text-[#0B1F3A] font-medium text-sm px-6 py-3 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Start a pilot
          </Link>
        </div>
      </section>

      <footer className="max-w-6xl mx-auto px-6 py-10 flex items-center justify-between text-sm text-slate-500">
        <span className="font-[\'Space_Grotesk\',sans-serif] text-slate-700 font-semibold">
          HelpDesk <span className="text-blue-600">Pro</span>
        </span>
        <span>&copy; {new Date().getFullYear()} HelpDesk Pro. All rights reserved.</span>
      </footer>
    </div>
  );
}