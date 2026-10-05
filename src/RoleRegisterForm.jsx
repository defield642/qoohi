import { useState } from "react";
import { ActionButton, AuthShell, Input, Notice, SocialButtons } from "./UserUi.jsx";

export default function RoleRegisterForm({ registrationTarget, onSubmit, statusMessage, onLogin, apiBase = "" }) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    whatsapp: "",
    specialization: "",
    childName: "",
    childGradeLevel: "",
    childGoals: "",
    selectedPackage: registrationTarget.packageKey || "coding_ai_training",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [selectedRole, setSelectedRole] = useState(registrationTarget.type === "teacher" ? "teacher" : "parent");
  const type = selectedRole;
  const set = (key) => (value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await onSubmit({
        ...form,
        fullName: `${form.firstName} ${form.lastName}`.trim(),
        registrationType: registrationTarget.type === "course" ? "course" : type,
        registrationRole: type,
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
        <h1>Create Account</h1>
        <p className="qoohi-role-label">Register as</p>
        <div className="qoohi-role-picker">
          <button type="button" className={selectedRole === "parent" ? "selected" : ""} onClick={() => setSelectedRole("parent")}>Parent</button>
          <button type="button" className={selectedRole === "teacher" ? "selected" : ""} onClick={() => setSelectedRole("teacher")}>Coach</button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="First name" value={form.firstName} onChange={set("firstName")} />
          <Input label="Last name" value={form.lastName} onChange={set("lastName")} />
        </div>
        <Input label="Email address" type="email" value={form.email} onChange={set("email")} />
        <Input label="WhatsApp number" type="tel" value={form.whatsapp} onChange={set("whatsapp")} />
        {type === "teacher" && <Input label="Specialisation (e.g. Mathematics, Physics, Grade 10)" value={form.specialization} onChange={set("specialization")} />}
        {(type === "parent" || type === "iep") && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Child’s name" value={form.childName} onChange={set("childName")} />
            <Input label="Child’s grade" value={form.childGradeLevel} onChange={set("childGradeLevel")} />
          </div>
        )}
        {type === "course" && (
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-200">Learning package</span>
            <select value={form.selectedPackage} onChange={(event) => set("selectedPackage")(event.target.value)} className="w-full rounded-[1.25rem] border border-white/10 bg-slate-950/60 px-5 py-4 text-white outline-none">
              <option value="computer_packages">Computer Packages</option>
              <option value="coding_ai_training">Coding and AI Training</option>
              <option value="both">Both Packages</option>
            </select>
          </label>
        )}
        {(statusMessage || error) && <Notice tone={error ? "error" : "info"}>{error || statusMessage}</Notice>}
        <ActionButton disabled={busy} type="submit" className="w-full">{busy ? "Sending code..." : "Create account"}</ActionButton>
        <div className="relative py-3 text-center text-xs font-black uppercase tracking-widest text-slate-500">
          <span className="bg-slate-950 px-3">or sign up with Google</span>
          <span className="absolute inset-x-0 top-1/2 -z-10 border-t border-white/10" />
        </div>
        <SocialButtons mode="register" role={selectedRole} apiBase={apiBase} />
      </form>
    </AuthShell>
  );
}
