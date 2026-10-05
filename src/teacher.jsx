import { useEffect, useMemo, useState } from "react";
import { ActionButton, GlassPanel, SectionLabel, SecondaryButton } from "./UserUi.jsx";

export default function TeacherDashboard({
  view,
  students = [],
  editingIep,
  setEditingIep,
  onUpdateIep,
  specializations,
  authHeaders,
  workspace = {},
  onRefresh,
  openChat,
  fetchJson,
}) {
  if (view === "overview" || view === "roster") {
    return <>
      {view === "roster" && <TeacherWorkspaceControls authHeaders={authHeaders} workspace={workspace} onRefresh={onRefresh} openChat={openChat} fetchJson={fetchJson} />}
      <GlassPanel className="p-6 sm:p-8">
        <SectionLabel>Coach Tools</SectionLabel>
        <h3 className="mt-2 text-xl font-black text-white">Learner Roster</h3>
        <div className="mt-6 overflow-x-auto rounded-2xl border border-white/5 bg-slate-950/50">
          <table className="w-full text-left text-sm">
            <thead><tr className="border-b border-white/5 text-[10px] uppercase tracking-widest text-slate-500"><th className="px-4 py-3">Student</th><th className="px-4 py-3">Balance</th><th className="px-4 py-3">Level</th><th className="px-4 py-3 text-right">IEP</th></tr></thead>
            <tbody className="divide-y divide-white/5">
              {students.map((student) => (
                <tr key={student.id} className="transition hover:bg-white/5">
                  <td className="px-4 py-4"><p className="font-bold text-white">{student.full_name}</p><p className="text-xs text-slate-500">{student.email}</p></td>
                  <td className="px-4 py-4 font-bold text-cyan-300">Ksh {Number(student.balance || 0).toLocaleString()}</td>
                  <td className="px-4 py-4"><span className="rounded-full bg-cyan-500/10 px-2 py-1 text-xs font-bold text-cyan-300">Lvl {student.performance_level}</span></td>
                  <td className="px-4 py-4 text-right"><button onClick={() => setEditingIep(student)} className="rounded-full border border-cyan-400/30 px-3 py-1.5 text-xs font-black text-cyan-400 transition hover:bg-cyan-400 hover:text-slate-900">Edit IEP</button></td>
                </tr>
              ))}
              {students.length === 0 && <tr><td colSpan="4" className="px-4 py-10 text-center text-sm text-slate-500">No students found.</td></tr>}
            </tbody>
          </table>
        </div>
        {editingIep && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <GlassPanel className="w-full max-w-md p-8">
              <SectionLabel>Edit IEP</SectionLabel>
              <h2 className="mt-2 text-2xl font-black text-white">{editingIep.full_name}</h2>
              <div className="mt-6 space-y-5">
                <label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-400">Assessment Status</span><select className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-400" value={editingIep.assessment_status} onChange={(event) => setEditingIep({ ...editingIep, assessment_status: event.target.value })}><option value="waiting">Waiting</option><option value="completed">Completed</option></select></label>
                <label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-400">Performance Level</span><select className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-400" value={editingIep.performance_level} onChange={(event) => setEditingIep({ ...editingIep, performance_level: Number(event.target.value) })}>{[0,1,2,3,4,5].map((level) => <option key={level} value={level}>Level {level}</option>)}</select></label>
                <div className="flex gap-3 pt-2"><ActionButton className="flex-1 !py-3 !text-sm" onClick={() => { onUpdateIep(editingIep.id, editingIep.assessment_status, editingIep.performance_level); setEditingIep(null); }}>Save Changes</ActionButton><SecondaryButton className="flex-1 !py-3 !text-sm" onClick={() => setEditingIep(null)}>Cancel</SecondaryButton></div>
              </div>
            </GlassPanel>
          </div>
        )}
      </GlassPanel>
    </>;
  }

  if (view === "specializations") return <TeacherSpecializationsSection authHeaders={authHeaders} initialSpecs={specializations} fetchJson={fetchJson} />;
  if (view === "discover-learners") return <TeacherLearnerDirectory authHeaders={authHeaders} fetchJson={fetchJson} />;
  return null;
}

function interestList(value) {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value !== "string" || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function TeacherLearnerDirectory({ authHeaders, fetchJson }) {
  const [learners, setLearners] = useState([]);
  const [grade, setGrade] = useState("");
  const [interest, setInterest] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const authorization = authHeaders?.Authorization;

  useEffect(() => {
    let active = true;
    fetchJson("/api/teacher/learners", { headers: authorization ? { Authorization: authorization } : {} })
      .then((data) => { if (active) setLearners(data.learners || []); })
      .catch((err) => { if (active) setError(err.message || "Learners could not be loaded."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [authorization, fetchJson]);

  const filtered = useMemo(() => learners.filter((learner) => {
    const learnerGrade = String(learner.grade_level || "").match(/\d{1,2}/)?.[0];
    const interests = interestList(learner.interests_json);
    const text = `${learner.display_name || ""} ${learnerGrade || ""} ${interests.join(" ")}`.toLowerCase();
    return (!grade || learnerGrade === grade)
      && (!interest || interests.some((item) => item.toLowerCase() === interest.toLowerCase()))
      && (!search.trim() || text.includes(search.trim().toLowerCase()));
  }), [grade, interest, learners, search]);

  return <GlassPanel className="p-6 sm:p-8">
    <SectionLabel>Teach a child</SectionLabel>
    <h3 className="mt-2 text-2xl font-black text-white">Discover learners</h3>
    <p className="mt-2 text-sm text-slate-500">Browse registered learners by grade and opted-in course interests. Parent goals and contact details are not shown.</p>
    <div className="mt-5 grid gap-3 sm:grid-cols-3">
      <label className="sr-only" htmlFor="learner-search">Search learner cards</label>
      <input id="learner-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search learner or interest" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800" />
      <label className="sr-only" htmlFor="learner-grade">Filter by grade</label>
      <select id="learner-grade" value={grade} onChange={(event) => setGrade(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800"><option value="">All grades</option>{Array.from({ length: 12 }, (_, index) => <option key={index + 1} value={index + 1}>Grade {index + 1}</option>)}</select>
      <label className="sr-only" htmlFor="learner-interest">Filter by course interest</label>
      <select id="learner-interest" value={interest} onChange={(event) => setInterest(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800"><option value="">All course interests</option><option>Cybersecurity</option><option>Python</option><option>Web Design/Website</option><option>Computer Packages</option></select>
    </div>
    {error && <p role="alert" className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
    {loading ? <p className="mt-6 text-sm text-slate-500">Loading learner cards…</p> : (
      <div className="no-scrollbar mt-5 flex snap-x gap-4 overflow-x-auto pb-3">
        {filtered.map((learner) => (
          <article key={learner.learner_key} className="w-[17rem] shrink-0 snap-start rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-cyan-50 text-lg font-black text-cyan-800">{String(learner.display_name || "L").trim().charAt(0).toUpperCase()}</span>
              <div className="min-w-0"><p className="truncate font-black text-slate-800">{learner.display_name}</p><p className="text-xs capitalize text-slate-500">{learner.source_type} learner</p></div>
            </div>
            <p className="mt-4 rounded-xl bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700">{learner.grade_level || "Grade not provided"}</p>
            <div className="mt-3 flex min-h-7 flex-wrap gap-1.5">{interestList(learner.interests_json).map((item) => <span key={item} className="rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-bold text-violet-700">{item}</span>)}{interestList(learner.interests_json).length === 0 && <span className="text-xs text-slate-400">No course interests selected</span>}</div>
          </article>
        ))}
        {filtered.length === 0 && <p className="rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">{learners.length ? "No learners match these filters." : "No learner registrations are available yet."}</p>}
      </div>
    )}
  </GlassPanel>;
}

export function TeacherWorkspaceControls({ authHeaders, workspace = {}, onRefresh, openChat, fetchJson }) {
  const [className, setClassName] = useState("");
  const [record, setRecord] = useState({ studentUserId: "", subject: "", recordType: "grade", value: "", notes: "" });
  const [assignment, setAssignment] = useState({ classId: "", title: "", file: null });
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const run = async (operation) => { setBusy(true); setStatus(""); setError(""); try { await operation(); await onRefresh?.(); setStatus("Saved successfully."); } catch (e) { setError(e.message); } finally { setBusy(false); } };
  return <div className="mb-6 grid gap-4 lg:grid-cols-3">
    <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4"><p className="text-xs font-black uppercase tracking-widest text-violet-600">New class</p><div className="mt-3 flex gap-2"><input value={className} onChange={(e) => setClassName(e.target.value)} placeholder="Class name" className="min-w-0 flex-1 rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm" /><button type="button" disabled={busy || !className.trim()} onClick={() => run(async () => { await fetchJson("/api/teacher/classes", { method: "POST", headers: authHeaders, body: JSON.stringify({ name: className }) }); setClassName(""); })} className="rounded-xl bg-violet-600 px-3 py-2 text-xs font-black text-white">Add</button></div></div>
    <div className="rounded-2xl border border-pink-200 bg-pink-50 p-4"><p className="text-xs font-black uppercase tracking-widest text-pink-600">Grade / attendance</p><div className="mt-3 grid gap-2"><select value={record.studentUserId} onChange={(e) => setRecord((c) => ({ ...c, studentUserId: e.target.value }))} className="rounded-xl border border-pink-200 bg-white px-3 py-2 text-sm"><option value="">Choose learner</option>{(workspace.students || []).map((student) => <option key={`u-${student.id}`} value={student.id}>{student.full_name}</option>)}{(workspace.children || []).map((child) => <option key={`c-${child.id}`} value={`ps_${child.id}`}>{child.child_name} · parent link</option>)}</select><div className="flex gap-2"><input value={record.subject} onChange={(e) => setRecord((c) => ({ ...c, subject: e.target.value }))} placeholder="Subject" className="min-w-0 flex-1 rounded-xl border border-pink-200 bg-white px-3 py-2 text-sm" /><input value={record.value} onChange={(e) => setRecord((c) => ({ ...c, value: e.target.value }))} placeholder="Grade / Present" className="min-w-0 flex-1 rounded-xl border border-pink-200 bg-white px-3 py-2 text-sm" /></div><button type="button" disabled={busy || !record.studentUserId} onClick={() => run(async () => { const parentLinked = String(record.studentUserId).startsWith("ps_"); const payload = parentLinked ? { ...record, studentUserId: "", parentStudentId: String(record.studentUserId).replace("ps_", "") } : record; await fetchJson("/api/teacher/progress", { method: "POST", headers: authHeaders, body: JSON.stringify(payload) }); })} className="rounded-xl bg-pink-600 px-3 py-2 text-xs font-black text-white">Save record</button></div></div>
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4"><p className="text-xs font-black uppercase tracking-widest text-amber-700">PDF assignment</p><div className="mt-3 grid gap-2"><select value={assignment.classId} onChange={(e) => setAssignment((c) => ({ ...c, classId: e.target.value }))} className="rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm"><option value="">Choose class</option>{(workspace.classes || []).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><input value={assignment.title} onChange={(e) => setAssignment((c) => ({ ...c, title: e.target.value }))} placeholder="Assignment title" className="rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm" /><input type="file" accept="application/pdf,.pdf" onChange={(e) => setAssignment((c) => ({ ...c, file: e.target.files?.[0] || null }))} className="text-xs" /><button type="button" disabled={busy || !assignment.classId || !assignment.file} onClick={() => run(async () => { const form = new FormData(); form.append("classId", assignment.classId); form.append("title", assignment.title); form.append("file", assignment.file); await fetchJson("/api/teacher/assignments", { method: "POST", headers: { Authorization: authHeaders.Authorization }, body: form }); })} className="rounded-xl bg-amber-500 px-3 py-2 text-xs font-black text-white">Upload PDF</button></div></div>
    {(status || error) && <p className={`lg:col-span-3 rounded-xl px-3 py-2 text-sm font-bold ${error ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>{error || status}</p>}
    {(workspace.students || []).slice(0, 8).map((student) => <div key={`chat-${student.id}`} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"><span className="font-bold text-slate-700">{student.full_name}</span><button type="button" onClick={() => openChat?.(student.id, student.full_name)} className="rounded-full bg-violet-100 px-3 py-1 text-xs font-black text-violet-700">Message</button></div>)}
  </div>;
}

export function TeacherSpecializationsSection({ authHeaders, initialSpecs = "", fetchJson }) {
  const [specs, setSpecs] = useState(initialSpecs);
  const [prices, setPrices] = useState({ daily: "", weekly: "", monthly: "", sixMonth: "", yearly: "10000" });
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus("");
    try {
      await fetchJson("/api/teacher/pricing", {
        method: "POST",
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ specializations: specs, ...prices }),
      });
      setStatus("Specializations saved successfully.");
    } catch (err) {
      setStatus(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <GlassPanel className="p-6 sm:p-8">
      <SectionLabel>Coach Profile</SectionLabel>
      <h3 className="mt-2 mb-4 text-2xl font-black text-white">Add Specializations</h3>
      <p className="mb-6 text-sm text-slate-400 max-w-xl">List the subjects and CBC strands you specialise in. This helps parents and students find the right coach.</p>
      <form onSubmit={save} className="space-y-4 max-w-xl">
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Your Specializations</label>
          <textarea
            rows={5}
            value={specs}
            onChange={(e) => setSpecs(e.target.value)}
            placeholder="e.g. Mathematics (Grade 4-9), Science, English Creative Writing, CBC Digital Literacy..."
            className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-cyan-400/60 placeholder-slate-600 resize-none"
            required
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2"><p className="sm:col-span-2 text-xs font-black uppercase tracking-widest text-slate-400">Your service prices</p>{[["daily", "Daily (24 hours)"], ["weekly", "Weekly"], ["monthly", "Monthly"], ["sixMonth", "6 months"], ["yearly", "12 months / yearly"]].map(([key, label]) => <label key={key} className="text-xs font-bold text-slate-400">{label}<input type="number" min="0" value={prices[key]} onChange={(e) => setPrices((current) => ({ ...current, [key]: e.target.value }))} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-white" placeholder="Ksh" /></label>)}</div>
        {status && <p className={`text-sm ${status.includes("success") ? "text-emerald-400" : "text-rose-400"}`}>{status}</p>}
        <ActionButton type="submit" disabled={saving} className="!px-6 !py-3 !text-sm">
          {saving ? "Saving..." : "Save Specializations"}
        </ActionButton>
      </form>
    </GlassPanel>
  );
}
