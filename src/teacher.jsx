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
  if (view === "classes") return <TeacherClasses authHeaders={authHeaders} workspace={workspace} onRefresh={onRefresh} fetchJson={fetchJson} />;
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

function TeacherClasses({ authHeaders, workspace = {}, onRefresh, fetchJson }) {
  const [classes, setClasses] = useState(workspace.classes || []);
  const [classForm, setClassForm] = useState({ name: "", subject: "", grade: "", description: "" });
  const [selectedClass, setSelectedClass] = useState(null);
  const [details, setDetails] = useState(null);
  const [availableLearners, setAvailableLearners] = useState([]);
  const [selectedLessonId, setSelectedLessonId] = useState(null);
  const [lessonForm, setLessonForm] = useState({ title: "", subject: "", startsAt: "", meetingUrl: "", notes: "", notesFile: null });
  const [assignmentForm, setAssignmentForm] = useState({ title: "", subject: "", instructions: "", dueAt: "", linkUrl: "", file: null });
  const [marks, setMarks] = useState({});
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const authorization = authHeaders?.Authorization;

  useEffect(() => setClasses(workspace.classes || []), [workspace.classes]);

  const refreshClasses = async () => {
    const data = await fetchJson("/api/teacher/classes", { headers: authHeaders });
    setClasses(data.classes || []);
    await onRefresh?.();
  };
  const refreshDetails = async (classId = selectedClass?.id) => {
    if (!classId) return;
    const [data, available] = await Promise.all([
      fetchJson(`/api/teacher/classes/${classId}`, { headers: authHeaders }),
      fetchJson(`/api/teacher/classes/${classId}/available-learners`, { headers: authHeaders }),
    ]);
    setDetails(data);
    setAvailableLearners(available.learners || []);
  };
  const run = async (operation, successMessage) => {
    setBusy(true);
    setError("");
    setStatus("");
    try {
      await operation();
      setStatus(successMessage);
    } catch (requestError) {
      setError(requestError.message || "The request could not be completed.");
    } finally {
      setBusy(false);
    }
  };
  const createClass = async (event) => {
    event.preventDefault();
    await run(async () => {
      await fetchJson("/api/teacher/classes", {
        method: "POST",
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify(classForm),
      });
      setClassForm({ name: "", subject: "", grade: "", description: "" });
      await refreshClasses();
    }, "Class created.");
  };
  const openClass = async (classItem) => {
    setSelectedClass(classItem);
    setDetails(null);
    setSelectedLessonId(null);
    setError("");
    try {
      await refreshDetails(classItem.id);
    } catch (requestError) {
      setError(requestError.message || "Class details could not be loaded.");
    }
  };
  const addLearner = async (learner) => {
    await run(async () => {
      await fetchJson(`/api/teacher/classes/${selectedClass.id}/students`, {
        method: "POST",
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ learnerType: learner.learnerType, learnerId: learner.learnerId }),
      });
      await refreshDetails();
      await refreshClasses();
    }, `${learner.fullName} added to class.`);
  };
  const addLesson = async (event) => {
    event.preventDefault();
    await run(async () => {
      const form = new FormData();
      for (const [key, value] of Object.entries(lessonForm)) {
        if (key === "notesFile") {
          if (value) form.append("notesFile", value);
        } else if (value) {
          form.append(key, value);
        }
      }
      await fetchJson(`/api/teacher/classes/${selectedClass.id}/lessons`, {
        method: "POST",
        headers: { Authorization: authorization },
        body: form,
      });
      setLessonForm({ title: "", subject: selectedClass.subject || "", startsAt: "", meetingUrl: "", notes: "", notesFile: null });
      setSelectedLessonId(null);
      await refreshDetails();
      await refreshClasses();
    }, "Lesson scheduled.");
  };
  const addAssignment = async (event) => {
    event.preventDefault();
    await run(async () => {
      const form = new FormData();
      form.append("classId", String(selectedClass.id));
      for (const [key, value] of Object.entries(assignmentForm)) {
        if (key === "file") {
          if (value) form.append("file", value);
        } else if (value) {
          form.append(key, value);
        }
      }
      await fetchJson("/api/teacher/assignments", {
        method: "POST",
        headers: { Authorization: authorization },
        body: form,
      });
      setAssignmentForm({ title: "", subject: selectedClass.subject || "", instructions: "", dueAt: "", linkUrl: "", file: null });
      await refreshDetails();
      await refreshClasses();
    }, "Assignment posted to the class.");
  };
  const markSubmission = async (submission) => {
    const mark = marks[submission.submissionId] || {};
    await run(async () => {
      await fetchJson(`/api/teacher/submissions/${submission.submissionId}/mark`, {
        method: "POST",
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify(mark),
      });
      await refreshDetails();
    }, `Mark saved for ${submission.learnerName}.`);
  };
  const openProtectedFile = async (url) => {
    const response = await fetch(url, { headers: authorization ? { Authorization: authorization } : {} });
    if (!response.ok) {
      const problem = await response.json().catch(() => ({}));
      throw new Error(problem.error || "The file could not be downloaded.");
    }
    const fileUrl = URL.createObjectURL(await response.blob());
    const filename = response.headers.get("Content-Disposition")?.match(/filename="?([^";]+)"?/i)?.[1] || "qoohi-document.pdf";
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = filename.replace(/[\\/"\r\n]/g, "_");
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(fileUrl), 60_000);
  };

  if (!selectedClass) {
    return <GlassPanel className="p-6 sm:p-8">
      <SectionLabel>Teacher workspace</SectionLabel>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4"><div><h3 className="text-2xl font-black text-white">Your classes</h3><p className="mt-2 text-sm text-slate-400">Create a class to schedule lessons, share assignments, and track learner progress.</p></div><span className="rounded-full bg-violet-100 px-4 py-2 text-sm font-black text-violet-800">{classes.length} classes</span></div>
      <form onSubmit={createClass} className="mt-6 grid gap-3 rounded-2xl border border-violet-200 bg-violet-50 p-4 sm:grid-cols-2 lg:grid-cols-5">
        <input required maxLength={180} value={classForm.name} onChange={(event) => setClassForm((current) => ({ ...current, name: event.target.value }))} placeholder="Class name" className="min-w-0 rounded-xl border border-violet-200 bg-white px-3 py-3 text-sm text-slate-900" />
        <input value={classForm.subject} onChange={(event) => setClassForm((current) => ({ ...current, subject: event.target.value }))} placeholder="Subject (optional)" className="min-w-0 rounded-xl border border-violet-200 bg-white px-3 py-3 text-sm text-slate-900" />
        <select value={classForm.grade} onChange={(event) => setClassForm((current) => ({ ...current, grade: event.target.value }))} className="rounded-xl border border-violet-200 bg-white px-3 py-3 text-sm text-slate-900"><option value="">Grade (optional)</option>{Array.from({ length: 12 }, (_, index) => <option key={index + 1}>Grade {index + 1}</option>)}</select>
        <input value={classForm.description} onChange={(event) => setClassForm((current) => ({ ...current, description: event.target.value }))} placeholder="Description" className="min-w-0 rounded-xl border border-violet-200 bg-white px-3 py-3 text-sm text-slate-900" />
        <ActionButton type="submit" disabled={busy || !classForm.name.trim()} className="!rounded-xl !py-3 !text-sm">Create class</ActionButton>
      </form>
      {error && <p role="alert" className="mt-4 rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-800">{error}</p>}
      {status && <p role="status" className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-800">{status}</p>}
      <div className="qoohi-class-cards mt-6">
        {classes.map((classItem, index) => <button key={classItem.id} type="button" onClick={() => openClass(classItem)} className={`qoohi-class-card qoohi-class-tone-${index % 4}`}>
          <span>{classItem.grade || classItem.subject || "QOOHI class"}</span><strong>{classItem.name}</strong><small>{classItem.subject || "Learning class"}{classItem.grade ? ` · ${classItem.grade}` : ""}</small><small>{Number(classItem.student_count || 0)} learners</small><b>{Number(classItem.current_lesson || 0) ? `Current: Lesson ${classItem.current_lesson}` : "No lessons yet"} <span aria-hidden="true">→</span></b>
        </button>)}
        {!classes.length && <p className="rounded-2xl border border-dashed border-white/20 p-7 text-sm text-slate-400">No classes yet. Create your first class above.</p>}
      </div>
    </GlassPanel>;
  }

  return <GlassPanel className="p-5 sm:p-8">
    <button type="button" onClick={() => { setSelectedClass(null); setDetails(null); setStatus(""); setError(""); }} className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-bold text-white hover:bg-white/10">← All classes</button>
    <div className="mt-5 flex flex-wrap items-start justify-between gap-3"><div><SectionLabel>{selectedClass.subject || "Class management"}</SectionLabel><h3 className="mt-2 text-3xl font-black text-white">{details?.class?.name || selectedClass.name}</h3><p className="mt-2 text-sm text-slate-400">{details?.class?.grade || selectedClass.grade || "Grade not specified"} · {(details?.learners || []).length} enrolled learners · {Number(details?.class?.currentLesson || 0) ? `Lesson ${details.class.currentLesson} current` : "No lessons yet"}</p></div><span className="rounded-full bg-violet-100 px-4 py-2 text-sm font-black text-violet-800">{details?.class?.subject || selectedClass.subject || "Learning class"}</span></div>
    {(status || error) && <p role={error ? "alert" : "status"} className={`mt-4 rounded-xl p-3 text-sm font-bold ${error ? "bg-rose-50 text-rose-800" : "bg-emerald-50 text-emerald-800"}`}>{error || status}</p>}
    <div className="mt-6 grid gap-5 xl:grid-cols-2">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 text-slate-900">
        <h4 className="text-lg font-black text-slate-900">Add learners</h4>
        <p className="mt-1 text-xs text-slate-600">Choose from the registered learner cards and add them directly to this class.</p>
        <div className="no-scrollbar mt-3 flex snap-x gap-3 overflow-x-auto pb-2">
          {availableLearners.map((learner) => <article key={`${learner.learnerType}-${learner.learnerId}`} className="w-52 shrink-0 snap-start rounded-xl border border-violet-100 bg-violet-50 p-3">
            <strong className="block truncate text-sm text-slate-900">{learner.fullName}</strong>
            <p className="mt-1 text-xs capitalize text-slate-600">{learner.grade || "Grade not listed"} · {learner.learnerType.replace("_", " ")}</p>
            <button type="button" disabled={busy} onClick={() => addLearner(learner)} className="mt-3 w-full rounded-full bg-violet-700 px-3 py-2 text-xs font-black text-white disabled:opacity-50">Add to this class</button>
          </article>)}
          {!availableLearners.length && <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">All available learners are already in this class, or no learner registrations are available yet.</p>}
        </div>
        <h5 className="mt-4 font-black text-slate-900">Class roster · {Number(details?.class?.currentLesson || 0) ? `Current lesson ${details.class.currentLesson}` : "No lessons yet"}</h5>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">{(details?.learners || []).map((learner) => {
          const graded = (details?.submissions || []).filter((item) => item.learnerType === learner.learnerType && Number(item.learnerId) === Number(learner.learnerId) && item.score !== null && item.maxScore > 0);
          const average = graded.length ? Math.round(graded.reduce((sum, item) => sum + (Number(item.score) / Number(item.maxScore)) * 100, 0) / graded.length) : null;
          return <article key={`${learner.learnerType}-${learner.learnerId}`} className="rounded-xl border border-slate-200 bg-slate-50 p-3"><strong className="text-sm text-slate-900">{learner.fullName}</strong><p className="mt-1 text-xs text-slate-600">{learner.grade || "Grade not listed"} · {learner.learnerType.replace("_", " ")}</p><p className="mt-1 text-xs font-bold text-cyan-800">{Number(details?.class?.currentLesson || 0) ? `Current lesson: ${details.class.currentLesson}` : "Lesson not started"}</p><p className="mt-2 text-xs font-bold text-violet-800">{graded.length} marked / {details?.assignments?.length || 0} assignments{average !== null ? ` · ${average}% average` : ""}</p></article>;
        })}{!details?.learners?.length && <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">No learners are enrolled yet.</p>}</div>
      </section>
      <form onSubmit={addLesson} className="grid content-start gap-3 rounded-2xl border border-cyan-200 bg-cyan-50 p-4">
        <h4 className="text-lg font-black text-cyan-950">Add lesson {Number(details?.class?.currentLesson || 0) + 1}</h4>
        <input required value={lessonForm.title} onChange={(event) => setLessonForm((current) => ({ ...current, title: event.target.value }))} placeholder="Lesson title" className="rounded-xl border border-cyan-200 bg-white px-3 py-3 text-sm text-slate-900" />
        <div className="grid gap-3 sm:grid-cols-2"><input value={lessonForm.subject || selectedClass.subject || ""} onChange={(event) => setLessonForm((current) => ({ ...current, subject: event.target.value }))} placeholder="Subject" className="rounded-xl border border-cyan-200 bg-white px-3 py-3 text-sm text-slate-900" /><input type="datetime-local" value={lessonForm.startsAt} onChange={(event) => setLessonForm((current) => ({ ...current, startsAt: event.target.value }))} className="rounded-xl border border-cyan-200 bg-white px-3 py-3 text-sm text-slate-900" /></div>
        <input type="url" value={lessonForm.meetingUrl} onChange={(event) => setLessonForm((current) => ({ ...current, meetingUrl: event.target.value }))} placeholder="Class meeting link (https://…)" className="rounded-xl border border-cyan-200 bg-white px-3 py-3 text-sm text-slate-900" />
        <textarea rows="2" value={lessonForm.notes} onChange={(event) => setLessonForm((current) => ({ ...current, notes: event.target.value }))} placeholder="Lesson notes" className="rounded-xl border border-cyan-200 bg-white px-3 py-3 text-sm text-slate-900" />
        <label className="grid gap-1 text-sm font-bold text-cyan-950">Upload lesson notes (PDF, optional)<input type="file" accept="application/pdf,.pdf" onChange={(event) => { setLessonForm((current) => ({ ...current, notesFile: event.target.files?.[0] || null })); event.currentTarget.value = ""; }} className="rounded-xl border border-cyan-200 bg-white p-2 text-sm text-slate-900" /></label>
        {lessonForm.notesFile && <p className="text-xs font-semibold text-cyan-900">Selected: {lessonForm.notesFile.name}</p>}
        <ActionButton type="submit" disabled={busy || !lessonForm.title.trim()} className="!rounded-xl !py-3 !text-sm">Save lesson {Number(details?.class?.currentLesson || 0) + 1}</ActionButton>
      </form>
      <form onSubmit={addAssignment} className="grid content-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <h4 className="text-lg font-black text-amber-950">Post an assignment</h4>
        <input required value={assignmentForm.title} onChange={(event) => setAssignmentForm((current) => ({ ...current, title: event.target.value }))} placeholder="Assignment title" className="rounded-xl border border-amber-200 bg-white px-3 py-3 text-sm text-slate-900" />
        <div className="grid gap-3 sm:grid-cols-2"><input value={assignmentForm.subject || selectedClass.subject || ""} onChange={(event) => setAssignmentForm((current) => ({ ...current, subject: event.target.value }))} placeholder="Subject" className="rounded-xl border border-amber-200 bg-white px-3 py-3 text-sm text-slate-900" /><input type="datetime-local" value={assignmentForm.dueAt} onChange={(event) => setAssignmentForm((current) => ({ ...current, dueAt: event.target.value }))} className="rounded-xl border border-amber-200 bg-white px-3 py-3 text-sm text-slate-900" /></div>
        <textarea rows="2" value={assignmentForm.instructions} onChange={(event) => setAssignmentForm((current) => ({ ...current, instructions: event.target.value }))} placeholder="Instructions for learners" className="rounded-xl border border-amber-200 bg-white px-3 py-3 text-sm text-slate-900" />
        <input type="url" value={assignmentForm.linkUrl} onChange={(event) => setAssignmentForm((current) => ({ ...current, linkUrl: event.target.value }))} placeholder="Lesson or assignment link (https://…)" className="rounded-xl border border-amber-200 bg-white px-3 py-3 text-sm text-slate-900" />
        <label className="grid gap-1 text-sm font-bold text-amber-950">Attach a PDF (optional)<input type="file" accept="application/pdf,.pdf" onChange={(event) => { const file = event.target.files?.[0] || null; setAssignmentForm((current) => ({ ...current, file })); event.currentTarget.value = ""; }} className="rounded-xl border border-amber-200 bg-white p-2 text-sm text-slate-900" /></label>
        <ActionButton type="submit" disabled={busy || (!assignmentForm.file && !assignmentForm.linkUrl.trim())} className="!rounded-xl !py-3 !text-sm">Post assignment</ActionButton>
      </form>
      <section className="rounded-2xl border border-slate-200 bg-white p-4 text-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-2"><h4 className="text-lg font-black text-slate-900">Lesson library</h4><span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-black text-cyan-900">Current: Lesson {details?.class?.currentLesson || 0}</span></div>
        <div className="qoohi-class-cards mt-3">{(details?.lessons || []).map((lesson, index) => <button key={lesson.id} type="button" onClick={() => setSelectedLessonId(String(selectedLessonId) === String(lesson.id) ? null : lesson.id)} aria-expanded={String(selectedLessonId) === String(lesson.id)} className={`qoohi-class-card qoohi-class-tone-${index % 4} !min-h-40`}>
          <span>Lesson {lesson.lessonNumber}</span><strong>{lesson.title}</strong><small>{lesson.subject || selectedClass.subject || "Class lesson"}</small><b>{String(selectedLessonId) === String(lesson.id) ? "Close lesson" : "Open lesson"} <span aria-hidden="true">→</span></b>
        </button>)}{!details?.lessons?.length && <p className="text-sm text-slate-500">No lessons have been added yet.</p>}</div>
        {details?.lessons?.filter((lesson) => String(lesson.id) === String(selectedLessonId)).map((lesson) => <article key={`lesson-detail-${lesson.id}`} className="mt-4 rounded-2xl border border-cyan-200 bg-cyan-50 p-4">
          <p className="text-xs font-black uppercase tracking-widest text-cyan-800">Lesson {lesson.lessonNumber}</p><h5 className="mt-1 text-lg font-black text-slate-900">{lesson.title}</h5><p className="mt-1 text-xs font-semibold text-slate-600">{lesson.subject || selectedClass.subject || "Lesson"}{lesson.starts_at ? ` · ${new Date(lesson.starts_at).toLocaleString()}` : ""}</p>
          {lesson.notes && <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">{lesson.notes}</p>}
          {lesson.meeting_url && <a href={lesson.meeting_url} target="_blank" rel="noreferrer" className="mt-3 inline-flex rounded-full bg-violet-700 px-4 py-2 text-xs font-black text-white">Open class link</a>}
          {lesson.notesFilename && <button type="button" onClick={() => run(() => openProtectedFile(`/api/classes/lessons/${lesson.id}/notes`), "Lesson notes download started.")} className="mt-3 inline-flex rounded-full border border-cyan-300 bg-white px-4 py-2 text-xs font-black text-cyan-950">Download lesson notes PDF</button>}
        </article>)}
      </section>
    </div>
    <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 text-slate-900">
      <h4 className="text-lg font-black text-slate-900">Posted assignments</h4>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">{(details?.assignments || []).map((assignment) => <article key={assignment.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4"><strong>{assignment.title}</strong><p className="mt-1 text-xs text-slate-600">{assignment.subject || selectedClass.subject || "Assignment"}{assignment.due_at ? ` · Due ${new Date(assignment.due_at).toLocaleString()}` : ""}</p>{assignment.instructions && <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{assignment.instructions}</p>}<div className="mt-3 flex flex-wrap gap-2">{assignment.link_url && <a href={assignment.link_url} target="_blank" rel="noreferrer" className="rounded-full bg-violet-700 px-4 py-2 text-xs font-black text-white">Open shared link</a>}{assignment.filename && <button type="button" onClick={() => run(() => openProtectedFile(`/api/teacher/assignments/${assignment.id}/download`), "Assignment PDF download started.")} className="rounded-full border border-violet-300 px-4 py-2 text-xs font-black text-violet-900">Download posted PDF</button>}</div></article>)}{!details?.assignments?.length && <p className="text-sm text-slate-500">No assignments posted yet.</p>}</div>
    </section>
    <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 text-slate-900">
      <h4 className="text-lg font-black text-slate-900">Submissions and marking</h4>
      <div className="mt-3 grid gap-3">{(details?.submissions || []).map((submission) => <article key={submission.submissionId} className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 lg:grid-cols-[1fr_auto_2fr_auto] lg:items-center">
        <div><strong>{submission.learnerName}</strong><p className="text-xs text-slate-600">{submission.assignmentTitle} · submitted {new Date(submission.submittedAt).toLocaleString()}</p>{submission.markedAt && <p className="mt-1 text-sm font-black text-emerald-800">Current mark: {submission.score}/{submission.maxScore}</p>}</div>
        <button type="button" onClick={() => run(() => openProtectedFile(`/api/teacher/submissions/${submission.submissionId}/file`), "Answer PDF download started.")} className="rounded-full border border-violet-200 bg-white px-3 py-2 text-xs font-black text-violet-800">Download answer PDF</button>
        <div className="grid gap-2 sm:grid-cols-[6rem_6rem_1fr]"><input aria-label="Score" type="number" min="0" step="0.01" placeholder="Score" value={marks[submission.submissionId]?.score ?? submission.score ?? ""} onChange={(event) => setMarks((current) => ({ ...current, [submission.submissionId]: { ...current[submission.submissionId], score: event.target.value, maxScore: current[submission.submissionId]?.maxScore ?? submission.maxScore ?? "" } }))} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900" /><input aria-label="Maximum score" type="number" min="0.01" step="0.01" placeholder="Out of" value={marks[submission.submissionId]?.maxScore ?? submission.maxScore ?? ""} onChange={(event) => setMarks((current) => ({ ...current, [submission.submissionId]: { ...current[submission.submissionId], score: current[submission.submissionId]?.score ?? submission.score ?? "", maxScore: event.target.value } }))} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900" /><input aria-label="Feedback" placeholder="Feedback" value={marks[submission.submissionId]?.feedback ?? submission.feedback ?? ""} onChange={(event) => setMarks((current) => ({ ...current, [submission.submissionId]: { ...current[submission.submissionId], score: current[submission.submissionId]?.score ?? submission.score ?? "", maxScore: current[submission.submissionId]?.maxScore ?? submission.maxScore ?? "", feedback: event.target.value } }))} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900" /></div>
        <button type="button" disabled={busy || !String(marks[submission.submissionId]?.score ?? submission.score ?? "").trim() || !String(marks[submission.submissionId]?.maxScore ?? submission.maxScore ?? "").trim()} onClick={() => markSubmission(submission)} className="rounded-full bg-emerald-700 px-4 py-2 text-xs font-black text-white disabled:opacity-50">Publish mark</button>
      </article>)}{!details?.submissions?.length && <p className="text-sm text-slate-500">No learner submissions yet.</p>}</div>
      <div className="mt-5"><h5 className="font-black text-slate-900">Progress by learner</h5><div className="mt-2 grid gap-2 sm:grid-cols-2">{(details?.learners || []).map((learner) => {
        const graded = (details?.submissions || []).filter((item) => item.learnerType === learner.learnerType && Number(item.learnerId) === Number(learner.learnerId) && item.score !== null && Number(item.maxScore) > 0);
        const percent = graded.length ? Math.round(graded.reduce((sum, item) => sum + (Number(item.score) / Number(item.maxScore)) * 100, 0) / graded.length) : 0;
        return <div key={`progress-${learner.learnerType}-${learner.learnerId}`} className="rounded-xl bg-slate-100 p-3"><div className="flex justify-between gap-3 text-sm"><strong>{learner.fullName}</strong><span>{graded.length}/{details?.assignments?.length || 0} marked · {graded.length ? `${percent}%` : "No marks yet"}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-300"><div className="h-full rounded-full bg-violet-700" style={{ width: `${percent}%` }} /></div></div>;
      })}</div></div>
    </section>
  </GlassPanel>;
}

export function LearnerClasses({ authHeaders, fetchJson }) {
  const [classes, setClasses] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedLessonId, setSelectedLessonId] = useState(null);
  const [selectedLearnerKey, setSelectedLearnerKey] = useState("");
  const [files, setFiles] = useState({});
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const authorization = authHeaders?.Authorization;

  const loadClasses = async () => {
    const data = await fetchJson("/api/classes", { headers: authHeaders });
    setClasses(data.classes || []);
  };
  useEffect(() => {
    let active = true;
    const refresh = () => fetchJson("/api/classes", { headers: authorization ? { Authorization: authorization } : {} })
      .then((data) => { if (active) { setClasses(data.classes || []); setError(""); } })
      .catch((requestError) => { if (active) setError(requestError.message || "Classes could not be loaded."); })
      .finally(() => { if (active) setLoading(false); });
    refresh();
    const timer = window.setInterval(refresh, 30_000);
    window.addEventListener("focus", refresh);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
    };
  }, [authorization, fetchJson]);

  const groupedClasses = useMemo(() => {
    const groups = new Map();
    for (const item of classes) {
      const key = String(item.id);
      if (!groups.has(key)) groups.set(key, { ...item, learners: [] });
      groups.get(key).learners.push(item);
    }
    return [...groups.values()];
  }, [classes]);
  const selectedClass = groupedClasses.find((item) => String(item.id) === String(selectedId));
  const selectedLearner = selectedClass?.learners.find((item) => `${item.learnerType}-${item.learnerId}` === selectedLearnerKey) || selectedClass?.learners[0];

  const openProtectedFile = async (url) => {
    const response = await fetch(url, { headers: authorization ? { Authorization: authorization } : {} });
    if (!response.ok) {
      const problem = await response.json().catch(() => ({}));
      throw new Error(problem.error || "The file could not be downloaded.");
    }
    const objectUrl = URL.createObjectURL(await response.blob());
    const link = document.createElement("a");
    link.href = objectUrl;
    const filename = response.headers.get("Content-Disposition")?.match(/filename="?([^";]+)"?/i)?.[1] || "qoohi-document.pdf";
    link.download = filename.replace(/[\\/"\r\n]/g, "_");
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
  };
  const submitAnswer = async (assignment) => {
    const file = files[assignment.id];
    if (!file) return;
    setBusyId(assignment.id);
    setError("");
    setStatus("");
    try {
      const form = new FormData();
      form.append("file", file);
      if (selectedLearner?.learnerType !== "user") {
        form.append("learnerType", selectedLearner.learnerType);
        form.append("learnerId", String(selectedLearner.learnerId));
      }
      await fetchJson(`/api/classes/assignments/${assignment.id}/submissions`, {
        method: "POST",
        headers: { Authorization: authorization },
        body: form,
      });
      await loadClasses();
      setStatus("Your answer has been submitted to the teacher.");
      setFiles((current) => ({ ...current, [assignment.id]: null }));
    } catch (requestError) {
      setError(requestError.message || "Your answer could not be submitted.");
    } finally {
      setBusyId(null);
    }
  };
  const openLessonNotes = async (lesson) => {
    const response = await fetch(`/api/classes/lessons/${lesson.id}/notes`, { headers: authorization ? { Authorization: authorization } : {} });
    if (!response.ok) {
      const problem = await response.json().catch(() => ({}));
      throw new Error(problem.error || "Lesson notes could not be downloaded.");
    }
    const objectUrl = URL.createObjectURL(await response.blob());
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = response.headers.get("Content-Disposition")?.match(/filename="?([^";]+)"?/i)?.[1] || "lesson-notes.pdf";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
  };

  if (loading) return <GlassPanel className="p-6 sm:p-8"><p className="text-sm font-bold text-slate-600">Loading your classes…</p></GlassPanel>;
  if (!selectedClass) return <GlassPanel className="p-6 sm:p-8">
    <SectionLabel>Learning workspace</SectionLabel><div className="mt-2 flex flex-wrap items-end justify-between gap-3"><div><h3 className="text-2xl font-black text-white">My classes</h3><p className="mt-2 text-sm text-slate-400">Lessons, assignments, marks, and progress shared by your teachers.</p></div><span className="rounded-full bg-violet-100 px-4 py-2 text-sm font-black text-violet-800">{groupedClasses.length} classes</span></div>
    {error && <p role="alert" className="mt-4 rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-800">{error}</p>}
    <div className="qoohi-class-cards mt-6">{groupedClasses.map((item, index) => <button key={item.id} type="button" onClick={() => { setSelectedId(item.id); setSelectedLearnerKey(`${item.learners[0].learnerType}-${item.learners[0].learnerId}`); setSelectedLessonId(null); setError(""); setStatus(""); }} className={`qoohi-class-card qoohi-class-tone-${index % 4}`}><span>{item.grade || item.subject || "Class"}</span><strong>{item.name}</strong><small>{item.subject || "Learning class"} · {item.teacherName}</small><small>{item.learners.length} enrolled learner{item.learners.length === 1 ? "" : "s"}</small><b>{Number(item.currentLesson || 0) ? `Current: Lesson ${item.currentLesson}` : "No lessons yet"} <span aria-hidden="true">→</span></b></button>)}{!groupedClasses.length && <p className="rounded-2xl border border-dashed border-white/20 p-7 text-sm text-slate-400">No classes have been assigned yet. Your teacher will add your class here.</p>}</div>
  </GlassPanel>;

  const learnerAssignments = selectedLearner?.assignments || [];
  const marked = learnerAssignments.filter((item) => item.score !== null && Number(item.maxScore) > 0);
  const average = marked.length ? Math.round(marked.reduce((sum, item) => sum + Number(item.score) / Number(item.maxScore) * 100, 0) / marked.length) : null;
  return <GlassPanel className="p-5 sm:p-8">
    <button type="button" onClick={() => { setSelectedId(null); setSelectedLessonId(null); setStatus(""); setError(""); }} className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-bold text-white hover:bg-white/10">← All classes</button>
    <div className="mt-5 flex flex-wrap items-start justify-between gap-3"><div><SectionLabel>{selectedClass.subject || "Class workspace"}</SectionLabel><h3 className="mt-2 text-3xl font-black text-white">{selectedClass.name}</h3><p className="mt-2 text-sm text-slate-400">{selectedClass.grade || selectedLearner?.learnerGrade || "Grade not specified"} · Teacher: {selectedClass.teacherName} · Current lesson: {selectedClass.currentLesson || 0}</p></div>{selectedClass.learners.length > 1 && <label className="grid gap-1 text-sm font-bold text-white">Learner<select value={selectedLearnerKey} onChange={(event) => setSelectedLearnerKey(event.target.value)} className="min-w-48 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900">{selectedClass.learners.map((learner) => <option key={`${learner.learnerType}-${learner.learnerId}`} value={`${learner.learnerType}-${learner.learnerId}`}>{learner.learnerName}</option>)}</select></label>}</div>
    {(status || error) && <p role={error ? "alert" : "status"} className={`mt-4 rounded-xl p-3 text-sm font-bold ${error ? "bg-rose-50 text-rose-800" : "bg-emerald-50 text-emerald-800"}`}>{error || status}</p>}
    <section className="mt-6 rounded-2xl border border-white/10 bg-white/95 p-4 text-slate-900 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2"><h4 className="text-lg font-black text-slate-900">Course progress</h4><span className="rounded-full bg-violet-100 px-3 py-1.5 text-sm font-black text-violet-900">{average === null ? "No marks published" : `${average}% average`}</span></div>
      <p className="mt-2 text-sm text-slate-700">{marked.length} of {learnerAssignments.length} assignments marked for {selectedLearner?.learnerName || "this learner"}.</p>
      {average !== null && <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-violet-700" style={{ width: `${average}%` }} /></div>}
    </section>
    <div className="mt-5 grid gap-5 lg:grid-cols-2">
      <section className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><h4 className="text-lg font-black text-cyan-950">Lesson library</h4><span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-black text-cyan-900">Current: Lesson {selectedClass.currentLesson || 0}</span></div><div className="qoohi-class-cards mt-3">{(selectedClass.lessons || []).map((lesson, index) => <button key={lesson.id} type="button" onClick={() => setSelectedLessonId(String(selectedLessonId) === String(lesson.id) ? null : lesson.id)} aria-expanded={String(selectedLessonId) === String(lesson.id)} className={`qoohi-class-card qoohi-class-tone-${index % 4} !min-h-40`}><span>Lesson {lesson.lessonNumber}</span><strong>{lesson.title}</strong><small>{lesson.subject || selectedClass.subject || "Class lesson"}</small><b>{String(selectedLessonId) === String(lesson.id) ? "Close lesson" : "Open lesson"} <span aria-hidden="true">→</span></b></button>)}{!selectedClass.lessons?.length && <p className="rounded-xl bg-white p-4 text-sm text-slate-600">No lessons have been added yet.</p>}</div>{selectedClass.lessons?.filter((lesson) => String(lesson.id) === String(selectedLessonId)).map((lesson) => <article key={`lesson-detail-${lesson.id}`} className="mt-4 rounded-2xl border border-cyan-200 bg-white p-4"><p className="text-xs font-black uppercase tracking-widest text-cyan-800">Lesson {lesson.lessonNumber}</p><h5 className="mt-1 text-lg font-black text-slate-900">{lesson.title}</h5><p className="mt-1 text-xs font-semibold text-slate-600">{lesson.subject || selectedClass.subject || "Lesson"}{lesson.starts_at ? ` · ${new Date(lesson.starts_at).toLocaleString()}` : ""}</p>{lesson.notes && <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">{lesson.notes}</p>}{lesson.meeting_url && <a href={lesson.meeting_url} target="_blank" rel="noreferrer" className="mt-3 inline-flex rounded-full bg-violet-700 px-4 py-2 text-xs font-black text-white">Join lesson</a>}{lesson.notesFilename && <button type="button" onClick={() => openLessonNotes(lesson).catch((requestError) => setError(requestError.message))} className="mt-3 inline-flex rounded-full border border-cyan-300 px-4 py-2 text-xs font-black text-cyan-950">Download lesson notes PDF</button>}</article>)}</section>
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4"><h4 className="text-lg font-black text-amber-950">Assignments</h4><div className="mt-3 grid gap-3">{learnerAssignments.map((assignment) => <article key={assignment.id} className="rounded-xl border border-amber-100 bg-white p-4"><div className="flex flex-wrap items-start justify-between gap-2"><div><strong className="text-slate-900">{assignment.title}</strong><p className="text-xs text-slate-600">{assignment.subject || selectedClass.subject || "Assignment"}{assignment.dueAt ? ` · Due ${new Date(assignment.dueAt).toLocaleString()}` : ""}</p></div>{assignment.markedAt && <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-900">Mark {assignment.score}/{assignment.maxScore}</span>}</div>
        {assignment.instructions && <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{assignment.instructions}</p>}
        <div className="mt-3 flex flex-wrap gap-2">{assignment.linkUrl && <a href={assignment.linkUrl} target="_blank" rel="noreferrer" className="rounded-full bg-violet-700 px-4 py-2 text-xs font-black text-white">Open assignment link</a>}{assignment.filename && <button type="button" onClick={() => openProtectedFile(`/api/classes/assignments/${assignment.id}/file`).catch((requestError) => setError(requestError.message))} className="rounded-full border border-violet-300 px-4 py-2 text-xs font-black text-violet-900">Download teacher PDF</button>}</div>
        {assignment.feedback && <p className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-950"><strong>Teacher feedback:</strong> {assignment.feedback}</p>}
        {assignment.submittedAt && <p className="mt-3 text-xs font-bold text-slate-600">Answer submitted {new Date(assignment.submittedAt).toLocaleString()}{assignment.markedAt ? ` · marked ${new Date(assignment.markedAt).toLocaleString()}` : " · awaiting teacher mark"}</p>}
        <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]"><input type="file" accept="application/pdf,.pdf" aria-label={`Upload answer for ${assignment.title}`} onChange={(event) => { const file = event.target.files?.[0] || null; setFiles((current) => ({ ...current, [assignment.id]: file })); event.currentTarget.value = ""; }} className="min-w-0 rounded-lg border border-slate-300 bg-white p-2 text-sm text-slate-900" /><button type="button" disabled={!files[assignment.id] || busyId === assignment.id} onClick={() => submitAnswer(assignment)} className="rounded-full bg-emerald-700 px-4 py-2 text-xs font-black text-white disabled:opacity-50">{busyId === assignment.id ? "Uploading…" : assignment.submissionId ? "Replace answer PDF" : "Submit answer PDF"}</button></div>
      </article>)}{!learnerAssignments.length && <p className="rounded-xl bg-white p-4 text-sm text-slate-600">No assignments have been posted yet.</p>}</div></section>
    </div>
  </GlassPanel>;
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
