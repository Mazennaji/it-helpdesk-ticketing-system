import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import AppLayout from "../components/AppLayout";
import { GlassCard } from "../components/premium";
import { useAuth } from "../context/AuthContext";
import { fetchMyProfile, updateMyProfile, changeMyPassword, updateMyPreferences } from "../api/settingsService";

const TABS = [
  { key: "profile", label: "Profile" },
  { key: "security", label: "Security" },
  { key: "preferences", label: "Preferences" },
];

function Banner({ kind, message, onClose }) {
  if (!message) return null;
  const styles = kind === "error" ? "bg-red-500/10 border-red-500/20 text-red-300" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-300";
  return (
    <div className={`flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm mb-5 ${styles}`}>
      <span>{message}</span>
      <button onClick={onClose} className="text-current opacity-60 hover:opacity-100">×</button>
    </div>
  );
}

function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-slate-400 mb-1.5">{label}</span>
      {children}
      {hint && <span className="block text-xs text-slate-500 mt-1">{hint}</span>}
    </label>
  );
}

const inputCls = "w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400/40 transition";

export default function Settings() {
  const { user } = useAuth();
  const [tab, setTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState({ kind: null, message: "" });
  const [profile, setProfile] = useState({ fullName: "", email: "", department: "", phoneNumber: "" });
  const [pwd, setPwd] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [prefs, setPrefs] = useState({ emailNotifications: true, inAppNotifications: true });

  const rootRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    let active = true;
    fetchMyProfile()
      .then((data) => {
        if (!active) return;
        setProfile({ fullName: data.fullName ?? "", email: data.email ?? "", department: data.department ?? "", phoneNumber: data.phoneNumber ?? "" });
        setPrefs({ emailNotifications: data.emailNotifications ?? true, inAppNotifications: data.inAppNotifications ?? true });
      })
      .catch(() => setBanner({ kind: "error", message: "Could not load your profile." }))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (loading) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(panelRef.current, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "power3.out" });
    }, rootRef);
    return () => ctx.revert();
  }, [loading, tab]);

  const flash = (kind, message) => {
    setBanner({ kind, message });
    if (kind === "success") setTimeout(() => setBanner({ kind: null, message: "" }), 3500);
  };

  const saveProfile = async () => {
    setSaving(true);
    try { await updateMyProfile({ fullName: profile.fullName, department: profile.department, phoneNumber: profile.phoneNumber }); flash("success", "Profile updated."); }
    catch (err) { flash("error", err.response?.data?.message || "Could not save your profile."); }
    finally { setSaving(false); }
  };

  const savePassword = async () => {
    if (pwd.newPassword !== pwd.confirmPassword) { flash("error", "New passwords do not match."); return; }
    if (pwd.newPassword.length < 6) { flash("error", "New password must be at least 6 characters."); return; }
    setSaving(true);
    try {
      await changeMyPassword({ currentPassword: pwd.currentPassword, newPassword: pwd.newPassword });
      setPwd({ currentPassword: "", newPassword: "", confirmPassword: "" });
      flash("success", "Password changed.");
    } catch (err) { flash("error", err.response?.data?.message || "Could not change your password."); }
    finally { setSaving(false); }
  };

  const savePrefs = async (next) => {
    setPrefs(next);
    try { await updateMyPreferences(next); flash("success", "Preferences saved."); }
    catch { flash("error", "Could not save preferences."); }
  };

  return (
    <AppLayout title="Settings" subtitle="Manage your account and preferences">
      <div ref={rootRef} className="relative z-10 max-w-3xl">
        <Banner kind={banner.kind} message={banner.message} onClose={() => setBanner({ kind: null, message: "" })} />

        <div className="flex gap-1 border-b border-white/8 mb-6">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2.5 text-sm font-medium -mb-px border-b-2 transition-colors ${tab === t.key ? "border-blue-400 text-white" : "border-transparent text-slate-400 hover:text-slate-200"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-sm text-slate-500 py-12 text-center">Loading your settings…</div>
        ) : (
          <div ref={panelRef}>
            {tab === "profile" && (
              <GlassCard className="p-8 space-y-5">
                <div className="flex items-center gap-4 pb-5 border-b border-white/8">
                  <div className="w-14 h-14 rounded-full bg-blue-500/20 text-blue-300 border border-white/10 flex items-center justify-center text-lg font-semibold">
                    {profile.fullName?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{profile.fullName || "—"}</p>
                    <p className="text-xs text-slate-500">{user?.roles?.join(", ") || "User"}</p>
                  </div>
                </div>
                <Field label="Full name"><input className={inputCls} value={profile.fullName} onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} /></Field>
                <Field label="Email" hint="Email is managed by your administrator."><input className={`${inputCls} opacity-60`} value={profile.email} disabled /></Field>
                <div className="grid sm:grid-cols-2 gap-5">
                  <Field label="Department"><input className={inputCls} value={profile.department} onChange={(e) => setProfile({ ...profile, department: e.target.value })} /></Field>
                  <Field label="Phone number"><input className={inputCls} value={profile.phoneNumber} onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })} /></Field>
                </div>
                <div className="pt-2">
                  <button onClick={saveProfile} disabled={saving} className="sheen px-5 py-2.5 bg-white text-[#0B1F3A] text-sm font-medium rounded-lg hover:shadow-[0_0_28px_rgba(59,130,246,0.45)] disabled:opacity-60 transition-all">
                    {saving ? "Saving…" : "Save changes"}
                  </button>
                </div>
              </GlassCard>
            )}

            {tab === "security" && (
              <GlassCard className="p-8 space-y-5">
                <Field label="Current password"><input type="password" className={inputCls} value={pwd.currentPassword} onChange={(e) => setPwd({ ...pwd, currentPassword: e.target.value })} /></Field>
                <div className="grid sm:grid-cols-2 gap-5">
                  <Field label="New password"><input type="password" className={inputCls} value={pwd.newPassword} onChange={(e) => setPwd({ ...pwd, newPassword: e.target.value })} /></Field>
                  <Field label="Confirm new password"><input type="password" className={inputCls} value={pwd.confirmPassword} onChange={(e) => setPwd({ ...pwd, confirmPassword: e.target.value })} /></Field>
                </div>
                <div className="pt-2">
                  <button onClick={savePassword} disabled={saving} className="sheen px-5 py-2.5 bg-white text-[#0B1F3A] text-sm font-medium rounded-lg hover:shadow-[0_0_28px_rgba(59,130,246,0.45)] disabled:opacity-60 transition-all">
                    {saving ? "Updating…" : "Update password"}
                  </button>
                </div>
              </GlassCard>
            )}

            {tab === "preferences" && (
              <GlassCard className="p-8 divide-y divide-white/8">
                {[
                  { key: "emailNotifications", title: "Email notifications", desc: "Receive ticket updates and assignments by email." },
                  { key: "inAppNotifications", title: "In-app notifications", desc: "Show the notification bell badge for new activity." },
                ].map((row) => (
                  <div key={row.key} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                    <div>
                      <p className="text-sm font-medium text-slate-200">{row.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{row.desc}</p>
                    </div>
                    <button role="switch" aria-checked={prefs[row.key]} onClick={() => savePrefs({ ...prefs, [row.key]: !prefs[row.key] })}
                      className={`relative w-11 h-6 rounded-full transition-colors ${prefs[row.key] ? "bg-blue-500" : "bg-white/15"}`}>
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${prefs[row.key] ? "translate-x-5" : ""}`} />
                    </button>
                  </div>
                ))}
              </GlassCard>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}