import { FaBookOpen, FaEnvelope } from "react-icons/fa";
import { useEffect, useRef, useState } from "react";
import { ActionButton, GlassPanel, Input, SectionLabel } from "./UserUi.jsx";

const API_BASE = import.meta.env.DEV ? "" : (import.meta.env.VITE_API_BASE || "");

function catalogValues(value) {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value !== "string" || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.map(String);
  } catch {
    return value.split(/[,|]/).map((item) => item.trim()).filter(Boolean);
  }
  return [];
}

export default function ParentDashboard({
  view,
  dashboard,
  teacherUpdates = [],
  onNavigate,
  authHeaders,
  balance,
  openProfile,
  openChat,
  onRefresh,
  fetchJson,
}) {
  if (view === "overview") {
    return (
      <GlassPanel className="p-6 sm:p-8">
        <SectionLabel>Parent Hub</SectionLabel>
        <h3 className="mt-2 text-xl font-black text-white">Support your child's learning</h3>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={() => onNavigate("materials")} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-cyan-400/30 hover:bg-cyan-400/5">
            <div className="rounded-xl bg-cyan-500/10 p-3"><FaBookOpen className="text-lg text-cyan-300" /></div>
            <div><p className="font-bold text-white">Purchase Materials</p><p className="text-xs text-slate-500">Workbooks & kits</p></div>
          </button>
          <button type="button" className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-cyan-400/30 hover:bg-cyan-400/5">
            <div className="rounded-xl bg-emerald-500/10 p-3"><FaEnvelope className="text-lg text-emerald-300" /></div>
            <div><p className="font-bold text-white">Contact Coach</p><p className="text-xs text-slate-500">Send a direct message</p></div>
          </button>
        </div>
      </GlassPanel>
    );
  }

  if (view === "parent") {
    return (
      <div className="space-y-6">
        <GlassPanel className="p-6 sm:p-8">
          <SectionLabel>Parent Hub</SectionLabel>
          <h3 className="mt-2 mb-6 text-2xl font-black text-white">Support your child's learning</h3>
          {teacherUpdates.length > 0 && (
            <div className="mb-6 rounded-2xl border border-violet-200 bg-violet-50 p-4">
              <p className="text-xs font-black uppercase tracking-widest text-violet-600">Teacher updates</p>
              <div className="mt-3 grid gap-2">
                {teacherUpdates.slice(0, 6).map((update) => (
                  <div key={update.id} className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm">
                    <span><b className="text-slate-700">{update.child_name}</b><span className="ml-2 text-slate-500">{update.subject || "General"} · {update.record_type}</span></span>
                    <strong className="text-violet-700">{update.value}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
          {dashboard.children && dashboard.children.length > 0 ? (
            <div className="grid gap-4">
              {dashboard.children.map((child) => (
                <div key={child.id} className="rounded-[1.5rem] border border-white/10 bg-slate-950/45 p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div><p className="text-lg font-black text-white">{child.child_name}</p><p className="mt-1 text-sm text-slate-400">Grade {child.grade_level}</p>{child.goals && <p className="mt-2 text-sm text-slate-300">Goals: {child.goals}</p>}</div>
                    <div className="flex flex-wrap gap-2">
                      {child.assessment_status === "completed" ? (
                        <span className="rounded-full bg-emerald-400/15 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-emerald-200">IEP: {child.performance_level || "Completed"}</span>
                      ) : child.assessment_status === "in_progress" ? (
                        <span className="rounded-full bg-amber-400/15 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-amber-200">Assessment in progress</span>
                      ) : (
                        <span className="rounded-full bg-slate-400/15 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-slate-300">Awaiting assessment</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-slate-500">No children registered yet. Use "Register Your Child" to add one.</p>}
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="rounded-xl bg-emerald-500/10 p-4"><FaEnvelope className="text-2xl text-emerald-300" /></div>
              <div><p className="font-bold text-white">Contact Coach</p><p className="mt-1 text-sm text-slate-500">Send a direct message</p></div>
            </div>
          </div>
        </GlassPanel>
      </div>
    );
  }

  if (view === "register-child") return <ParentRegisterChildSection authHeaders={authHeaders} onRefresh={onRefresh} fetchJson={fetchJson} />;
  if (view === "materials") return <ParentMaterialsSection authHeaders={authHeaders} balance={balance} openProfile={openProfile} openChat={openChat} fetchJson={fetchJson} />;
  if (view === "teacher") return <ParentMaterialsSection authHeaders={authHeaders} balance={balance} openProfile={openProfile} openChat={openChat} teacherOnly fetchJson={fetchJson} />;
  return null;
}


export function ParentRegisterChildSection({ authHeaders, onRefresh, fetchJson }) {
  const [childName, setChildName] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [goals, setGoals] = useState("");
  const [courseInterests, setCourseInterests] = useState([]);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!childName.trim() || !gradeLevel.trim() || !goals.trim()) {
      setStatus("All fields are required.");
      return;
    }
    setSaving(true);
    setStatus("");
    try {
      await fetchJson("/api/parent/children", {
        method: "POST",
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ childName, gradeLevel, goals, courseInterests }),
      });
      setChildName("");
      setGradeLevel("");
      setGoals("");
      setCourseInterests([]);
      await onRefresh?.();
      setStatus("Child registered successfully!");
    } catch (err) {
      setStatus(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <GlassPanel className="p-6 sm:p-8">
      <SectionLabel>Child Registration</SectionLabel>
      <h3 className="mt-2 mb-4 text-2xl font-black text-white">Register Your Child</h3>
      <p className="mb-8 text-sm text-slate-400 max-w-xl">
        Register your child with QOOHI to access personalised IEP assessments and tailored learning resources designed for Kenyan CBC curriculum.
      </p>
      <form onSubmit={submit} className="space-y-4 max-w-xl">
        <Input label="Child's full name" value={childName} onChange={setChildName} />
        <Input label="Grade level" value={gradeLevel} onChange={setGradeLevel} />
        <Input label="Learning goals" value={goals} onChange={setGoals} />
        <fieldset className="rounded-2xl border border-slate-200 p-3 text-left">
          <legend className="px-2 text-xs font-black uppercase tracking-widest text-slate-500">Optional course interests</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {["Cybersecurity", "Python", "Web Design/Website", "Computer Packages"].map((interest) => (
              <label key={interest} className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={courseInterests.includes(interest)}
                  onChange={(event) => setCourseInterests((current) => event.target.checked ? [...current, interest] : current.filter((value) => value !== interest))}
                />
                {interest}
              </label>
            ))}
          </div>
        </fieldset>
        {status && (
          <p className={`text-sm ${status === "Child registered successfully!" ? "text-emerald-400" : "text-rose-400"}`}>{status}</p>
        )}
        <ActionButton type="submit" disabled={saving} className="!px-6 !py-3 !text-sm">
          {saving ? "Saving..." : "Register Your Child"}
        </ActionButton>
      </form>
    </GlassPanel>
  );
}

const KENYAN_SUBJECTS = {
  lower: ["English", "Kiswahili", "Mathematics", "Environmental Activities", "Hygiene & Nutrition", "Religious Education", "Creative Arts"],
  upper: ["English", "Kiswahili", "Mathematics", "Science & Technology", "Social Studies", "Religious Education", "Creative Arts", "Physical & Health Education", "Agriculture", "Home Science"],
  junior: ["English", "Kiswahili", "Mathematics", "Integrated Science", "Social Studies", "Religious Education", "Business Studies", "Agriculture", "Life Skills", "Physical Education", "Visual Arts", "Performing Arts", "Computer Science"],
};

const SUBJECT_GRADIENTS = {
  English: "from-blue-500/20 to-cyan-400/10",
  Kiswahili: "from-emerald-500/20 to-teal-400/10",
  Mathematics: "from-violet-500/20 to-purple-400/10",
  "Science & Technology": "from-cyan-500/20 to-sky-400/10",
  "Integrated Science": "from-cyan-500/20 to-sky-400/10",
  "Social Studies": "from-amber-500/20 to-orange-400/10",
  "Religious Education": "from-rose-500/20 to-pink-400/10",
  "Creative Arts": "from-fuchsia-500/20 to-pink-400/10",
  "Physical & Health Education": "from-lime-500/20 to-green-400/10",
  Agriculture: "from-green-500/20 to-emerald-400/10",
  "Home Science": "from-orange-500/20 to-amber-400/10",
  "Business Studies": "from-indigo-500/20 to-blue-400/10",
  "Life Skills": "from-teal-500/20 to-cyan-400/10",
  "Physical Education": "from-lime-500/20 to-green-400/10",
  "Visual Arts": "from-pink-500/20 to-rose-400/10",
  "Performing Arts": "from-purple-500/20 to-violet-400/10",
  "Computer Science": "from-sky-500/20 to-indigo-400/10",
  "Environmental Activities": "from-emerald-500/20 to-green-400/10",
  "Hygiene & Nutrition": "from-teal-500/20 to-cyan-400/10",
};

function buildIepPdf(title, content) {
  const escapePdf = (value) => String(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
  const lines = [title, "", ...String(content || "").split(/\r?\n/)].flatMap((line) => {
    const words = String(line).split(/\s+/); const wrapped = []; let current = "";
    words.forEach((word) => { if ((current + " " + word).trim().length > 88) { wrapped.push(current); current = word; } else current = `${current} ${word}`.trim(); });
    wrapped.push(current); return wrapped;
  }).filter(Boolean).map((line) => String(line).replace(/[^\x20-\x7E]/g, " "));
  const pageCount = 100; const pages = []; const colors = [[0.95,0.98,1],[1,0.96,0.96],[0.96,1,0.97],[1,0.98,0.9],[0.96,0.95,1]];
  for (let page = 0; page < pageCount; page += 1) {
    const [r,g,b] = colors[page % colors.length]; const pageLines = lines.slice((page * 24) % Math.max(lines.length, 1), ((page * 24) % Math.max(lines.length, 1)) + 24);
    const heading = page === 0 ? "QOOHI PHYSICAL IEP BOOK" : `${title} — PAGE ${page + 1} OF ${pageCount}`;
    const body = ["q", `${r} ${g} ${b} rg`, "0 0 612 792 re", "f", "Q", "BT", "/F1 22 Tf", "72 730 Td", `(${escapePdf(heading)}) Tj`, "/F1 12 Tf", ...pageLines.flatMap((line) => ["0 -24 Td", `(${escapePdf(line)}) Tj`]), "ET"].join("\n");
    pages.push(body);
  }
  const pageRefs = pages.map((_, index) => `${3 + index * 2} 0 R`).join(" ");
  const objects = ["<< /Type /Catalog /Pages 2 0 R >>", `<< /Type /Pages /Kids [${pageRefs}] /Count ${pageCount} >>`];
  pages.forEach((body) => { const pageObject = objects.length + 1; const contentObject = pageObject + 1; objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${pageCount * 2 + 3} 0 R >> >> /Contents ${contentObject} 0 R >>`); objects.push(`<< /Length ${body.length} >>\nstream\n${body}\nendstream`); });
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  let pdf = "%PDF-1.4\n"; const offsets = [0];
  objects.forEach((object, index) => { offsets[index + 1] = pdf.length; pdf += `${index + 1} 0 obj\n${object}\nendobj\n`; });
  const xref = pdf.length; pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map((offset) => `${String(offset).padStart(10, "0")} 00000 n `).join("\n")}\ntrailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new Blob([pdf], { type: "application/pdf" });
}

function getSubjectsForGrade(grade) {
  const g = Number(grade);
  if (g >= 1 && g <= 3) return KENYAN_SUBJECTS.lower;
  if (g >= 4 && g <= 6) return KENYAN_SUBJECTS.upper;
  if (g >= 7 && g <= 9) return KENYAN_SUBJECTS.junior;
  return KENYAN_SUBJECTS.lower;
}

export function ParentMaterialsSection({ authHeaders, balance, openProfile, openChat, teacherOnly = false, fetchJson }) {
  const [grade, setGrade] = useState("1");
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState({});
  const [matError, setMatError] = useState("");
  const [downloading, setDownloading] = useState(null);
  const [subjectImages, setSubjectImages] = useState({});
  const [generatingImages, setGeneratingImages] = useState(new Set());
  const [imageSearchTopic, setImageSearchTopic] = useState("");
  const [searchedImage, setSearchedImage] = useState(null);
  const [openTeacherPanel, setOpenTeacherPanel] = useState(null);
  const [teacherResults, setTeacherResults] = useState({});
  const [topicGuides, setTopicGuides] = useState({});
  const [topicDrafts, setTopicDrafts] = useState({});
  const [uploadedBooks, setUploadedBooks] = useState([]);
  const [downloadingImg, setDownloadingImg] = useState(null);
  const [marketTeachers, setMarketTeachers] = useState([]);
  const [teacherCatalogLoading, setTeacherCatalogLoading] = useState(true);
  const [teacherCatalogError, setTeacherCatalogError] = useState("");
  const [teacherGradeFilter, setTeacherGradeFilter] = useState("");
  const [teacherSubjectFilter, setTeacherSubjectFilter] = useState("");
  const subjects = getSubjectsForGrade(grade);
  const chatHeaders = { ...authHeaders, "Content-Type": "application/json" };
  const filteredTeachers = marketTeachers.filter((teacher) => {
    const specialties = catalogValues(teacher.specializations);
    const searchable = [teacher.full_name, teacher.home_location, teacher.institution_names, ...specialties].join(" ").toLowerCase();
    const queryMatches = !teacherSubjectFilter || searchable.includes(teacherSubjectFilter.toLowerCase());
    const gradeTerms = specialties.join(" ").match(/grade\s*(?:[1-9]|1[0-2])/gi) || [];
    const requestedGrade = teacherGradeFilter && `grade ${teacherGradeFilter}`;
    const gradeMatches = !requestedGrade || !gradeTerms.length || gradeTerms.some((item) => item.toLowerCase().replace(/\s+/g, " ") === requestedGrade);
    return queryMatches && gradeMatches;
  });

  const gradeRef = useRef(grade);
  gradeRef.current = grade;

  useEffect(() => { loadAndGenerate(grade); }, []);
  useEffect(() => {
    let active = true;
    setTeacherCatalogLoading(true);
    setTeacherCatalogError("");
    fetchJson("/api/marketplace/teachers")
      .then((data) => { if (active) setMarketTeachers(data.teachers || []); })
      .catch((error) => { if (active) { setMarketTeachers([]); setTeacherCatalogError(error.message || "Teacher directory is unavailable."); } })
      .finally(() => { if (active) setTeacherCatalogLoading(false); });
    return () => { active = false; };
  }, [fetchJson]);

  const normalizeNoteText = (text) => {
    if (!text || typeof text !== "string") return "";
    return text
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/^#{1,6}\s*/gm, "")
      .replace(/^\s*[-*+]\s+/gm, "• ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  };

  const generateSubjects = async (g, availableBooks = uploadedBooks) => {
    setGenerating(true);
    setMatError("");
    const subjs = getSubjectsForGrade(g).filter((subject) => !availableBooks.some((book) => String(book.subject).toLowerCase() === subject.toLowerCase()));
    try {
      const generatedEntries = await Promise.all(
        subjs.map(async (subj) => {
          const language = /kiswahili|swahili/i.test(subj) ? "kiswahili" : "english";
          const prompt = `Create accurate Kenyan CBC Grade ${g} ${subj} physical IEP book content. Follow the current Kenyan CBC learning-area structure and use ${language === "kiswahili" ? "Kiswahili" : "English"} only. Organize the manuscript into 100 numbered pages with a title page, learner profile and IEP goals, measurable learning outcomes, prerequisite skills, sequenced units, teacher-guided activities, learner activities, locally relevant Kenyan examples, inclusive adaptations, vocabulary, formative checks, revision exercises, and answer keys. Do not invent curriculum facts; clearly mark teacher notes where a school should adapt the content. Return plain text with clear PAGE 1, PAGE 2 headings and no markdown symbols.`;
          const res = await fetchJson("/api/ai/materials", {
            method: "POST",
            headers: { ...authHeaders, "Content-Type": "application/json" },
            body: JSON.stringify({ grade: g, prompt, subject: subj, language }),
          });
          const content = normalizeNoteText(String(res.content || "").trim());
          return [subj, content || `${subj} — Core subject in the Grade ${g} Kenyan CBC curriculum. Students develop foundational knowledge and practical skills.`];
        })
      );
      const newGenerated = Object.fromEntries(generatedEntries);
      setGenerated(newGenerated);
    } catch (err) {
      setMatError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const loadAndGenerate = async (g) => {
    try {
      const result = await fetchJson(`/api/iep-books?grade=${encodeURIComponent(g)}`, { headers: { ...authHeaders } });
      const books = result.books || [];
      setUploadedBooks(books);
      await generateSubjects(g, books);
    } catch (err) {
      setUploadedBooks([]); setMatError(err.message); await generateSubjects(g, []);
    }
  };

  const generateSubjectImages = async (subjs, g) => {
    setSubjectImages({});
    setGeneratingImages(new Set(subjs));
    for (const subject of subjs) {
      try {
        const res = await fetchJson("/api/ai/subject-image", {
          method: "POST",
          headers: { ...authHeaders, "Content-Type": "application/json" },
          body: JSON.stringify({ subject, grade: g }),
        });
        if (res.url) {
          setSubjectImages((prev) => ({ ...prev, [subject]: res.url }));
        }
      } catch {
        // silently skip failed images
      } finally {
        setGeneratingImages((prev) => {
          const next = new Set(prev);
          next.delete(subject);
          return next;
        });
      }
    }
  };

  const generateSearchImage = async () => {
    const topic = imageSearchTopic.trim();
    if (!topic) return;
    setSearchedImage({ topic, url: null, loading: true, error: "" });
    try {
      const res = await fetchJson("/api/ai/subject-image", {
        method: "POST",
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ subject: topic, grade }),
      });
      setSearchedImage({ topic, url: res.url || null, loading: false, error: res.error || "" });
    } catch (err) {
      setSearchedImage({ topic, url: null, loading: false, error: err.message });
    }
  };

  const fetchTeacherSuggest = async (subject) => {
    setTeacherResults((prev) => ({ ...prev, [subject]: { loading: true, teacher: null, reason: "", error: "" } }));
    try {
      const res = await fetchJson("/api/ai/teacher-suggest", {
        method: "POST",
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ subject, grade }),
      });
      setTeacherResults((prev) => ({ ...prev, [subject]: { loading: false, teacher: res.teacher, reason: res.reason, error: res.error || "" } }));
    } catch (err) {
      setTeacherResults((prev) => ({ ...prev, [subject]: { loading: false, teacher: null, reason: "", error: err.message } }));
    }
  };

  const fetchTopicGuide = async (subject) => {
    const topic = String(topicDrafts[subject] || "").trim();
    if (!topic) { setTopicGuides((prev) => ({ ...prev, [subject]: { loading: false, guide: "", error: "Enter a topic first." } })); return; }
    setTopicGuides((prev) => ({ ...prev, [subject]: { loading: true, guide: "", error: "" } }));
    try {
      const res = await fetchJson("/api/ai/topic-guide", {
        method: "POST",
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ subject, grade, topic, prompt: `Teach ${subject} for Kenyan CBC Grade ${grade}, topic ${topic}. Teach in sequence, pause after each major section, give a quiz, wait for answers, correct them, and recommend the next lesson.` }),
      });
      setTopicGuides((prev) => ({ ...prev, [subject]: { loading: false, guide: res.guide || "", error: res.error || "" } }));
    } catch (err) {
      setTopicGuides((prev) => ({ ...prev, [subject]: { loading: false, guide: "", error: err.message } }));
    }
  };

  const handleGradeChange = (g) => {
    setGrade(g);
    setGenerated({});
    setSubjectImages({});
    setGeneratingImages(new Set());
    setSearchedImage(null);
    setMatError("");
    setOpenTeacherPanel(null);
    setTeacherResults({});
    setTopicGuides({});
    loadAndGenerate(g);
  };

  const downloadAs = async (format, subject, content) => {
    setDownloading(subject);
    setMatError("");
    try {
      await fetchJson("/api/ai/materials/download", {
        method: "POST",
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ grade, topic: subject, content }),
      });
      const filename = `qoohi-physical-iep-book-grade-${grade}-${subject.replace(/\s+/g, "-").toLowerCase()}`;
      const blob = buildIepPdf(`Grade ${grade} — ${subject}`, content);
      const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `${filename}.pdf`; a.click(); URL.revokeObjectURL(url);
    } catch (err) {
      setMatError(err.message);
    } finally {
      setDownloading(null);
    }
  };

  if (teacherOnly) {
    return <GlassPanel className="p-6 sm:p-8">
      <SectionLabel>MY TEACHER</SectionLabel>
      <h3 className="mt-2 text-2xl font-black text-white">Find a teacher</h3>
      <p className="mt-2 text-sm text-slate-400">Browse registered teachers and institution coaches. Public cards do not expose private contact details.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_12rem]">
        <label className="sr-only" htmlFor="teacher-catalog-search">Search teachers and subjects</label>
        <input id="teacher-catalog-search" type="search" value={teacherSubjectFilter} onChange={(event) => setTeacherSubjectFilter(event.target.value)} placeholder="Search name, subject, location or school" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800" />
        <label className="sr-only" htmlFor="teacher-catalog-grade">Teacher grade</label>
        <select id="teacher-catalog-grade" value={teacherGradeFilter} onChange={(event) => setTeacherGradeFilter(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800">
          <option value="">All grades</option>
          {Array.from({ length: 12 }, (_, index) => <option key={index + 1} value={index + 1}>Grade {index + 1}</option>)}
        </select>
      </div>
      <div className="no-scrollbar mt-5 flex snap-x gap-4 overflow-x-auto pb-3">
        {filteredTeachers.map((teacher) => (
          <article key={teacher.id} className="w-[17rem] shrink-0 snap-start overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex h-24 items-end bg-gradient-to-br from-violet-600 to-cyan-500 p-4">
              <span className="grid h-12 w-12 place-items-center rounded-full border-2 border-white/80 bg-white/20 text-lg font-black text-white">{String(teacher.full_name || "T").trim().charAt(0).toUpperCase()}</span>
              <span className="ml-auto rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-violet-700">{teacher.institution_names ? "Institution coach" : "QOOHI coach"}</span>
            </div>
            <div className="p-4">
              <p className="font-black text-slate-800">{teacher.full_name}</p>
              <p className="mt-1 line-clamp-2 min-h-9 text-xs text-slate-500">{catalogValues(teacher.specializations).join(" · ") || "CBC learning support"}</p>
              <p className="mt-2 truncate text-xs text-slate-500">{[teacher.home_location, teacher.institution_names].filter(Boolean).join(" · ") || "Kenya"}</p>
              <p className="mt-3 text-sm font-black text-violet-700">{Number(teacher.monthly || 0) > 0 ? `Ksh ${Number(teacher.monthly).toLocaleString()} / month` : "Contact for pricing"}</p>
              <button type="button" onClick={() => openChat?.(teacher.id, teacher.full_name)} className="mt-4 w-full rounded-full bg-violet-600 px-3 py-2.5 text-xs font-black text-white">Message teacher</button>
            </div>
          </article>
        ))}
        {teacherCatalogLoading && <p className="rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">Loading teacher directory…</p>}
        {teacherCatalogError && <p role="alert" className="rounded-xl bg-rose-50 p-6 text-sm text-rose-700">{teacherCatalogError}</p>}
        {!teacherCatalogLoading && !teacherCatalogError && filteredTeachers.length === 0 && <p className="rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">{marketTeachers.length ? "No teachers match these filters." : "No teachers are listed yet."}</p>}
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {subjects.map((subject) => <div key={subject} className="rounded-2xl border border-slate-200 bg-white p-4"><p className="font-bold text-slate-800">{subject}</p><button type="button" onClick={() => fetchTeacherSuggest(subject)} disabled={teacherResults[subject]?.loading} className="mt-3 w-full rounded-full border border-cyan-200 bg-cyan-50 px-3 py-2 text-xs font-black text-cyan-800">{teacherResults[subject]?.loading ? "Finding..." : "Find teacher"}</button>{teacherResults[subject]?.reason && <p className="mt-2 text-xs text-slate-500">{teacherResults[subject].reason}</p>}{teacherResults[subject]?.teacher && <button type="button" onClick={() => openChat?.(teacherResults[subject].teacher.id, teacherResults[subject].teacher.name)} className="mt-2 text-xs font-bold text-cyan-800">Open chat</button>}</div>)}
      </div>
    </GlassPanel>;
  }

  return (
    <GlassPanel className="p-6 sm:p-8">
      <SectionLabel>PHYSICAL IEP BOOK</SectionLabel>
      <h3 className="mt-2 mb-2 text-2xl font-black text-white">Kenyan CBC IEP Books</h3>
      <p className="mb-6 text-sm text-slate-400">Choose a grade. QOOHI creates a printable book with sequenced lessons and quizzes.</p>

      <div className="mb-6 flex flex-wrap items-end gap-3">
        <div className="w-full sm:w-48">
          <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Grade</label>
          <select
            value={grade}
            onChange={(e) => handleGradeChange(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-cyan-400/60"
          >
            {Array.from({ length: 9 }, (_, i) => i + 1).map((g) => (
              <option key={g} value={String(g)}>Grade {g}</option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={() => generateSubjectImages(subjects, grade)}
          className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300 transition hover:bg-cyan-400/20"
        >
          Generate Images
        </button>
      </div>

      {uploadedBooks.length > 0 && <div className="mb-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4"><p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-300">Uploaded IEP books</p><div className="mt-3 grid gap-2 sm:grid-cols-2">{uploadedBooks.map((book) => <a key={book.id} href={`${API_BASE}/api/iep-books/${book.id}/download`} className="rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm font-bold text-white transition hover:border-emerald-300/40"><span className="block">{book.title}</span><span className="mt-1 block text-xs text-emerald-300">{book.subject} · Grade {book.grade} · Download book archive</span></a>)}</div></div>}

      {matError && <p className="mb-4 text-sm text-rose-400">{matError}</p>}

      {false && searchedImage && (
        <div className="mb-6 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60">
          <div className="border-b border-white/10 px-4 py-3 text-xs font-black uppercase tracking-[0.22em] text-slate-400">
            Search Result — {searchedImage.topic}
          </div>
          {searchedImage.loading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-400">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
              Generating image...
            </div>
          ) : searchedImage.url ? (
            <div className="overflow-hidden rounded-2xl border border-white/10">
              <img src={searchedImage.url} alt={searchedImage.topic} className="w-full object-cover" style={{ maxHeight: 280 }} />
              <button
                type="button"
                onClick={async () => {
                  setDownloadingImg("search");
                  try {
                    const resp = await fetch("/api/ai/image/download", {
                      method: "POST", headers: chatHeaders,
                      body: JSON.stringify({ imageUrl: searchedImage.url }),
                    });
                    if (resp.ok) {
                      const blob = await resp.blob(); const url = URL.createObjectURL(blob);
                      const a = document.createElement("a"); a.href = url;
                      a.download = `${searchedImage.topic.toLowerCase().replace(/\s+/g, "-")}.${blob.type.split("/").pop() || "png"}`;
                      a.click(); URL.revokeObjectURL(url);
                    } else { const err = await resp.json(); alert(err.error || "Download failed"); }
                  } catch (e) { alert(e.message); }
                  setDownloadingImg(null);
                }}
                disabled={downloadingImg === "search"}
                className="w-full border-t border-white/10 bg-white/5 px-3 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300 hover:bg-white/10 disabled:opacity-50"
              >
                {downloadingImg === "search" ? "Downloading..." : "⬇ Download Image (10 KSH)"}
              </button>
            </div>
          ) : (
            <p className="px-4 py-4 text-sm text-rose-400">{searchedImage.error || "Could not generate image."}</p>
          )}
        </div>
      )}

      {generating && (
        <div className="flex items-center gap-3 mb-6 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 px-5 py-4 text-sm text-cyan-200">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
          Generating learning materials...
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {subjects.map((subject) => {
          const content = generated[subject];
          const gradient = SUBJECT_GRADIENTS[subject] || "from-slate-500/20 to-slate-400/10";
          return (
            <div
              key={subject}
              className={`overflow-hidden rounded-[1.8rem] border transition ${
                content ? "border-white/15 bg-white/10" : "border-white/5 bg-white/5"
              }`}
            >
              <div className={`bg-gradient-to-br ${gradient} p-5`}>
                <p className="text-xs font-black uppercase tracking-[0.3em] text-white/70">{subject}</p>
                {content && (
                  <p className="mt-1 text-xs text-white/50">Grade {grade}</p>
                )}
              </div>
              <div className="p-4">
                {content ? (
                  <>
                    <div className="line-clamp-4 whitespace-pre-wrap break-words font-['Times_New_Roman','Georgia',serif] text-[15px] leading-7 text-slate-200">
                      {content}
                    </div>
                    {generatingImages.has(subject) && !subjectImages[subject] && (
                      <div className="mt-3 flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-slate-900/50 py-6 text-xs text-slate-400">
                        <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
                        Generating illustration...
                      </div>
                    )}
                    {subjectImages[subject] && (
                      <div className="mt-3 overflow-hidden rounded-2xl border border-white/10">
                        <img src={subjectImages[subject]} alt={`${subject} illustration`} className="w-full object-cover" style={{ aspectRatio: "16/9" }} />
                        <button
                          type="button"
                          onClick={async () => {
                            setDownloadingImg(subject);
                            try {
                              const resp = await fetch("/api/ai/image/download", {
                                method: "POST", headers: chatHeaders,
                                body: JSON.stringify({ imageUrl: subjectImages[subject] }),
                              });
                              if (resp.ok) {
                                const blob = await resp.blob();
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement("a");
                                a.href = url;
                                a.download = `${subject.toLowerCase().replace(/\s+/g, "-")}.${blob.type.split("/").pop() || "png"}`;
                                a.click();
                                URL.revokeObjectURL(url);
                              } else {
                                const err = await resp.json();
                                alert(err.error || "Download failed");
                              }
                            } catch (e) { alert(e.message); }
                            setDownloadingImg(null);
                          }}
                          disabled={downloadingImg === subject}
                          className="w-full border-t border-white/10 bg-white/5 px-3 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300 transition hover:bg-white/10 disabled:opacity-50"
                        >
                          {downloadingImg === subject ? "Downloading..." : `⬇ Download Image (10 KSH)`}
                        </button>
                      </div>
                    )}
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => downloadAs("txt", subject, content)}
                        disabled={downloading === subject}
                        className="flex-1 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-slate-300 transition hover:bg-white/10 disabled:opacity-50"
                      >
                        {downloading === subject ? "..." : "PDF"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setOpenTeacherPanel(openTeacherPanel === subject ? null : subject)}
                        className="flex-1 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300 transition hover:bg-cyan-400/20"
                      >
                        AI Guide
                      </button>
                    </div>

                    {openTeacherPanel === subject && (
                      <div className="mt-3 space-y-3 rounded-2xl border border-cyan-400/20 bg-slate-900/80 p-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">Teaching Options — 20 KSH each</p>

                        {/* Best Coach */}
                        <button
                          type="button"
                          onClick={() => fetchTeacherSuggest(subject)}
                          disabled={teacherResults[subject]?.loading}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-left text-xs font-semibold text-white transition hover:bg-white/10 disabled:opacity-50"
                        >
                          {teacherResults[subject]?.loading ? "🔍 Finding best coach…" : "🧑‍🏫 Find Best Coach (20 KSH)"}
                        </button>
                        {teacherResults[subject]?.error && (
                          <p className="text-xs text-rose-400">{teacherResults[subject].error}</p>
                        )}
                        {teacherResults[subject]?.teacher && (
                          <div className="space-y-1 rounded-xl border border-green-400/20 bg-green-400/5 p-3 text-xs">
                            <p className="font-bold text-white">{teacherResults[subject].teacher.name}</p>
                            <p className="text-slate-400">{teacherResults[subject].reason}</p>
                            {teacherResults[subject].teacher.specializations && (
                              <p className="text-slate-500">Specializes in: {teacherResults[subject].teacher.specializations}</p>
                            )}
                            <div className="mt-2 flex gap-2">
                              <a
                                href={`https://wa.me/${String(teacherResults[subject].teacher.whatsapp || "").replace(/\D/g, "")}`}
                                target="_blank" rel="noopener noreferrer"
                                className="flex-1 rounded-full border border-green-400/30 bg-green-400/10 px-3 py-1 text-center text-green-300 transition hover:bg-green-400/20"
                              >
                                WhatsApp →
                              </a>
                              <button
                                type="button"
                                onClick={() => openChat(teacherResults[subject].teacher.id, teacherResults[subject].teacher.name)}
                                className="flex-1 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-center text-cyan-300 transition hover:bg-cyan-400/20"
                              >
                                💬 Chat
                              </button>
                            </div>
                          </div>
                        )}
                        {teacherResults[subject]?.teacher === null && teacherResults[subject]?.reason && !teacherResults[subject]?.loading && (
                          <p className="text-xs text-slate-400">{teacherResults[subject].reason}</p>
                        )}

                        <input value={topicDrafts[subject] || ""} onChange={(event) => setTopicDrafts((prev) => ({ ...prev, [subject]: event.target.value }))} placeholder={`Topic in ${subject}`} className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-xs text-white outline-none focus:border-cyan-400" />
                        <button
                          type="button"
                          onClick={() => fetchTopicGuide(subject)}
                          disabled={topicGuides[subject]?.loading}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-left text-xs font-semibold text-white transition hover:bg-white/10 disabled:opacity-50"
                        >
                          {topicGuides[subject]?.loading ? "🤖 Teaching…" : "🤖 AI Teach (topic, grade & subject)"}
                        </button>
                        {topicGuides[subject]?.error && (
                          <p className="text-xs text-rose-400">{topicGuides[subject].error}</p>
                        )}
                        {topicGuides[subject]?.guide && (
                          <div className="max-h-64 overflow-y-auto rounded-xl border border-white/10 bg-slate-950/60 p-3 text-xs leading-6 text-slate-300 whitespace-pre-wrap">
                            {topicGuides[subject].guide}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-slate-500 italic">Waiting for content...</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </GlassPanel>
  );
}
