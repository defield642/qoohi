import { useEffect, useLayoutEffect, useRef, useState } from "react";

export function PageStack({ title, subtitle, children, compact = false }) {
  return (
    <div className="space-y-12">
      <div className={`relative flex flex-col ${compact ? "gap-4 lg:flex-row lg:items-center" : "gap-6 lg:flex-row lg:items-end"} lg:justify-between`}>
        <div className={`max-w-3xl ${compact ? "space-y-2" : "space-y-4"}`}>
          <SectionLabel>QOOHI PLATFORM</SectionLabel>
          <h1 className={`font-black text-white ${compact ? "text-4xl leading-tight tracking-tight sm:text-5xl lg:text-6xl" : "text-6xl leading-[0.9] tracking-tighter uppercase sm:text-8xl"}`}>
            {title}
          </h1>
          {subtitle && (
            <p className={`max-w-4xl ${compact ? "mt-1 text-sm font-semibold tracking-normal text-slate-300 sm:text-base" : "mt-4 text-xl font-bold uppercase tracking-[0.05em] text-cyan-400/80 sm:text-2xl"}`}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

export function SectionLabel({ children }) {
  return <p className="text-sm font-black uppercase tracking-[0.4em] text-cyan-300">{children}</p>;
}

export function GlassPanel({ className = "", children }) {
  return (
    <section className={`rounded-[2rem] border border-white/10 bg-white/10 shadow-2xl shadow-black/30 backdrop-blur-xl ${className}`}>
      {children}
    </section>
  );
}

export function Badge({ children }) {
  return <span className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-black uppercase tracking-[0.24em] text-white/85">{children}</span>;
}

export function ActionButton({ children, onClick, type = "button", disabled = false, className = "" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-cyan-300 px-8 py-4 text-lg font-black text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ children, onClick, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-8 py-4 text-lg font-bold text-white transition hover:border-cyan-300/40 hover:bg-white/10 ${className}`}
    >
      {children}
    </button>
  );
}

export function AuthShell({ children, isRegister = false, onRegister, onLogin }) {
  const formRef = useRef(null);
  const transitionTimer = useRef(null);
  const [showRegister, setShowRegister] = useState(isRegister);

  useLayoutEffect(() => {
    if (formRef.current) formRef.current.scrollTop = 0;
  }, [showRegister]);

  useEffect(() => {
    setShowRegister(isRegister);
    return () => {
      if (transitionTimer.current) {
        window.clearTimeout(transitionTimer.current);
        transitionTimer.current = null;
      }
    };
  }, [isRegister]);

  const switchMode = (registerMode, callback) => {
    if (!callback) return;
    setShowRegister(registerMode);
    if (transitionTimer.current) window.clearTimeout(transitionTimer.current);
    transitionTimer.current = window.setTimeout(() => {
      transitionTimer.current = null;
      callback();
    }, 600);
  };

  return (
    <div className={`qoohi-auth-container ${showRegister ? "active" : ""}`}>
      <div className={`qoohi-auth-form-box ${showRegister ? "qoohi-auth-sign-up" : "qoohi-auth-login"}`}>
        <div ref={formRef} className="qoohi-auth-form">
          {children}
        </div>
      </div>
      <div className="qoohi-auth-toggle-container"><div className="qoohi-auth-toggle">
        <div className="qoohi-auth-toggle-panel qoohi-auth-toggle-left"><h1>Welcome Back!</h1><p>Already have an account?</p><button type="button" className="qoohi-auth-btn qoohi-auth-btn-hidden" onClick={() => switchMode(false, onLogin)}>Login</button></div>
        <div className="qoohi-auth-toggle-panel qoohi-auth-toggle-right"><h1>Hello, Welcome</h1><p>Don&apos;t have an Account</p><button type="button" className="qoohi-auth-btn qoohi-auth-btn-hidden" onClick={() => switchMode(true, onRegister)}>Register</button></div>
      </div></div>
    </div>
  );
}

export function Input({ label, value, onChange, type = "text" }) {
  return (
    <label className="block">
      <span className="mb-2 block text-lg font-bold text-slate-200">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={label}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-[1.25rem] border border-white/12 bg-slate-950/60 px-5 py-4 text-lg text-white outline-none transition focus:border-cyan-300/60"
      />
    </label>
  );
}

export function Notice({ children, tone }) {
  const classes =
    tone === "error"
      ? "border-rose-300/25 bg-rose-400/10 text-rose-100"
      : "border-cyan-300/25 bg-cyan-400/10 text-cyan-50";
  return <div className={`rounded-[1.25rem] border px-6 py-4 text-lg font-bold ${classes}`}>{children}</div>;
}

export function SocialButtons({ mode = "login", role = "", apiBase = "" }) {
  const startOAuth = () => {
    const params = new URLSearchParams({ mode });
    if (mode === "register" && role) params.set("role", role);
    window.location.assign(`${apiBase}/api/auth/oauth/google/start?${params.toString()}`);
  };
  return <div className="grid grid-cols-1 gap-3"><button type="button" onClick={startOAuth} className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-700 transition hover:bg-slate-50"><GoogleMark /> Continue with Google</button></div>;
}

function GoogleMark() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path fill="#4285F4" d="M21.35 12.27c0-.72-.06-1.41-.18-2.07H12v3.92h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.24Z" />
      <path fill="#34A853" d="M12 21.67c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.74 9.74 0 0 0 12 21.67Z" />
      <path fill="#FBBC05" d="M6.54 13.75A5.85 5.85 0 0 1 6.23 12c0-.61.1-1.2.31-1.75V7.72H3.3A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.06 1.05 4.28l3.24-2.53Z" />
      <path fill="#EA4335" d="M12 6.22c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.3 14.63 2.33 12 2.33a9.74 9.74 0 0 0-8.7 5.39l3.24 2.53c.77-2.31 2.92-4.03 5.46-4.03Z" />
    </svg>
  );
}
