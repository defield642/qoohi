import { useState } from "react";
import { ActionButton, AuthShell, Input, Notice, SocialButtons } from "./UserUi.jsx";

export default function StudentRegister({ onSubmit, statusMessage, onLogin, apiBase = "" }) {
  const [form, setForm] = useState({ email: "", whatsapp: "", gradeLevel: "", courseInterests: [] });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const courses = ["Cybersecurity", "Python", "Web Design/Website", "Computer Packages"];

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await onSubmit({
        ...form,
        fullName: form.email.split("@")[0],
        registrationType: "student",
        registrationRole: "student",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell isRegister onLogin={onLogin}>
      <form className="space-y-4" onSubmit={submit}>
        <h1>Student Account</h1>
        <p className="qoohi-role-label">Learn with QOOHI</p>
        <Input label="Email address" type="email" value={form.email} onChange={(email) => setForm((current) => ({ ...current, email }))} />
        <Input label="WhatsApp number" type="tel" value={form.whatsapp} onChange={(whatsapp) => setForm((current) => ({ ...current, whatsapp }))} />
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-600">Grade</span>
          <select value={form.gradeLevel} onChange={(event) => setForm((current) => ({ ...current, gradeLevel: event.target.value }))} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800">
            <option value="">Select grade (optional)</option>
            {Array.from({ length: 12 }, (_, index) => <option key={index + 1} value={`Grade ${index + 1}`}>Grade {index + 1}</option>)}
          </select>
        </label>
        <fieldset className="rounded-2xl border border-slate-200 p-3 text-left">
          <legend className="px-2 text-xs font-black uppercase tracking-widest text-slate-500">Course interest</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {courses.map((course) => (
              <label key={course} className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={form.courseInterests.includes(course)}
                  onChange={(event) => setForm((current) => ({
                    ...current,
                    courseInterests: event.target.checked
                      ? [...current.courseInterests, course]
                      : current.courseInterests.filter((item) => item !== course),
                  }))}
                />
                {course}
              </label>
            ))}
          </div>
        </fieldset>
        {(error || statusMessage) && <Notice tone={error ? "error" : "info"}>{error || statusMessage}</Notice>}
        <ActionButton type="submit" disabled={busy || !form.courseInterests.length} className="w-full">{busy ? "Sending code..." : "Create student account"}</ActionButton>
        <SocialButtons mode="register" role="student" apiBase={apiBase} />
      </form>
    </AuthShell>
  );
}
