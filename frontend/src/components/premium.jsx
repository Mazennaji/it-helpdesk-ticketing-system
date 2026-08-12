import { useEffect, useRef } from "react";

export function AuroraBackdrop({ cursorGlow = true }) {
  const glowRef = useRef(null);

  useEffect(() => {
    if (!cursorGlow) return;
    let raf = null;
    const onMove = (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        if (glowRef.current) {
          glowRef.current.style.left = `${e.clientX}px`;
          glowRef.current.style.top = `${e.clientY}px`;
        }
        raf = null;
      });
    };
    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [cursorGlow]);

  return (
    <>
      <div className="aurora-layer">
        <span className="aurora-orb a" />
        <span className="aurora-orb b" />
        <span className="aurora-orb c" />
      </div>
      <div className="aurora-grid" />
      {cursorGlow && <div ref={glowRef} className="cursor-glow hidden lg:block" />}
    </>
  );
}

export function GlassCard({ children, className = "", glow = false, lift = false, ...rest }) {
  if (glow) {
    return (
      <div className={`gradient-border ${lift ? "glass-hover-lift" : ""}`} {...rest}>
        <div className={`glass !border-0 !shadow-none bg-[#0C1426]/80 h-full ${className}`}>
          {children}
        </div>
      </div>
    );
  }
  return (
    <div className={`glass ${lift ? "glass-hover-lift" : ""} ${className}`} {...rest}>
      {children}
    </div>
  );
}

export function SectionHeading({ eyebrow, title, right }) {
  return (
    <div className="flex items-end justify-between mb-6">
      <div>
        {eyebrow && (
          <p className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] text-blue-300/80 uppercase mb-2 font-mono">
            <span className="w-5 h-px bg-blue-400/50" />
            {eyebrow}
          </p>
        )}
        <h2 className="text-base font-semibold text-white tracking-tight">{title}</h2>
      </div>
      {right}
    </div>
  );
}

export function StatTile({ label, value, accent = "#3B82F6", innerRef, big = false }) {
  return (
    <div
      ref={innerRef}
      className="glass glass-hover-lift sheen p-5 group"
      style={{ "--glow": accent }}
    >
      <div
        className="absolute inset-x-0 top-0 h-px opacity-60"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
      />
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">{label}</span>
        <span className="w-2 h-2 rounded-full glow-dot" style={{ color: accent, backgroundColor: accent }} />
      </div>
      <p className={`${big ? "text-4xl" : "text-3xl"} font-semibold text-white tracking-tight tabular-nums`}>
        {value}
      </p>
    </div>
  );
}