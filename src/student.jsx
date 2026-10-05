import { useEffect, useState } from "react";
import { FaBookOpen, FaLink, FaWhatsapp } from "react-icons/fa";
import { GlassPanel, SectionLabel } from "./UserUi.jsx";
import RegistrationGrowthChart from "./RegistrationGrowthChart.jsx";

const TOPICS = {
  Mathematics: {
    primary: ["Counting and place value", "Addition and subtraction", "Shapes and patterns", "Fractions"],
    intermediate: ["Fractions and decimals", "Multiplication and division", "Measurement", "Geometry"],
    junior: ["Ratio and proportion", "Integers and algebra", "Geometry and measurement", "Statistics and probability"],
    senior: ["Functions and graphs", "Trigonometry", "Sequences and series", "Statistics and probability"],
  },
  English: {
    primary: ["Reading comprehension", "Vocabulary and spelling", "Sentence building", "Writing a short story"],
    intermediate: ["Reading comprehension", "Grammar and punctuation", "Paragraph writing", "Vocabulary in context"],
    junior: ["Comprehension and inference", "Parts of speech", "Essay writing", "Literature"],
    senior: ["Critical reading", "Grammar and style", "Argumentative writing", "Literary analysis"],
  },
  Kiswahili: {
    primary: ["Kusoma na kuelewa", "Msamiati", "Sarufi ya msingi", "Kuandika sentensi"],
    intermediate: ["Ufahamu", "Aina za maneno", "Uandishi wa insha", "Msamiati na methali"],
    junior: ["Ufahamu na uchambuzi", "Sarufi", "Uandishi wa insha", "Fasihi"],
    senior: ["Uchambuzi wa matini", "Sarufi na matumizi", "Uandishi wa hoja", "Fasihi simulizi"],
  },
  Science: {
    primary: ["Living things", "Materials and their properties", "Weather and environment", "The human body"],
    intermediate: ["Plants and animals", "Matter and energy", "Forces and motion", "The environment"],
    junior: ["Cells and body systems", "Matter and materials", "Energy and electricity", "Ecosystems"],
    senior: ["Biology foundations", "Chemistry foundations", "Physics and energy", "Scientific investigation"],
  },
  Cybersecurity: {
    primary: ["Keeping personal information safe", "Strong passwords", "Spotting suspicious messages", "Being kind online"],
    intermediate: ["Password safety", "Phishing and scams", "Privacy settings", "Safe browsing"],
    junior: ["Phishing and social engineering", "Account security", "Digital footprints", "Malware basics"],
    senior: ["Threat modelling", "Network security basics", "Cryptography concepts", "Incident response"],
  },
  Python: {
    primary: ["Sequencing instructions", "Variables and values", "Simple print commands", "Drawing with code"],
    intermediate: ["Variables and data types", "Conditions", "Loops", "Writing simple functions"],
    junior: ["Lists and dictionaries", "Loops and conditions", "Functions and modules", "Debugging"],
    senior: ["Object-oriented programming", "Files and data", "Algorithms", "Building a small application"],
  },
};

function gradeBand(grade) {
  if (grade <= 3) return "primary";
  if (grade <= 6) return "intermediate";
  if (grade <= 9) return "junior";
  return "senior";
}

export function StudentDashboard({ view, performanceLevel }) {
  if (view === "overview") {
    return (
      <GlassPanel className="p-6 sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <SectionLabel>Learning Roadmap</SectionLabel>
            <h3 className="mt-2 text-xl font-black text-white">Recommended Resources</h3>
          </div>
          <FaBookOpen className="text-3xl text-cyan-300" />
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5">
            <p className="text-xs font-black uppercase tracking-widest text-cyan-400">Digital</p>
            <h4 className="mt-2 text-lg font-black text-white">Workbook · Level {performanceLevel}</h4>
            <button className="mt-4 flex items-center gap-2 text-sm font-bold text-cyan-300 hover:text-white transition">
              <FaLink /> Download
            </button>
          </div>
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
            <p className="text-xs font-black uppercase tracking-widest text-amber-400">Physical</p>
            <h4 className="mt-2 text-lg font-black text-white">Activity Kit</h4>
            <button className="mt-4 flex items-center gap-2 text-sm font-bold text-amber-300 hover:text-white transition">
              <FaWhatsapp /> Request via WhatsApp
            </button>
          </div>
        </div>
      </GlassPanel>
    );
  }

  if (view === "roadmap") {
    return (
      <GlassPanel className="p-6 sm:p-8">
        <SectionLabel>Learning Roadmap</SectionLabel>
        <h3 className="mt-2 mb-8 text-2xl font-black text-white">Level {performanceLevel} Recommendations</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-6">
            <p className="text-xs font-black uppercase tracking-widest text-cyan-400">Digital</p>
            <h4 className="mt-2 text-lg font-black text-white">Workbook · Level {performanceLevel}</h4>
            <p className="mt-2 text-sm text-slate-500">Personalized digital exercises and assessments.</p>
          </div>
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6">
            <p className="text-xs font-black uppercase tracking-widest text-amber-400">Physical</p>
            <h4 className="mt-2 text-lg font-black text-white">Activity Kit</h4>
            <p className="mt-2 text-sm text-slate-500">Hands-on learning materials and workbooks.</p>
            <button className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-amber-300 transition hover:text-white"><FaWhatsapp /> Request via WhatsApp</button>
          </div>
        </div>
      </GlassPanel>
    );
  }

  return null;
}

export default function GuestDashboard({ onRegisterRole, apiBase = "" }) {
  const [role, setRole] = useState("parent");
  const [aiActive, setAiActive] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(180);
  const [stats, setStats] = useState(null);
  const [statsError, setStatsError] = useState("");
  const [grade, setGrade] = useState("1");
  const [books, setBooks] = useState([]);
  const [booksLoading, setBooksLoading] = useState(true);
  const [booksError, setBooksError] = useState("");
  const [selectedBook, setSelectedBook] = useState(null);
  const [previewFiles, setPreviewFiles] = useState([]);
  const [activePreviewFile, setActivePreviewFile] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [customTopic, setCustomTopic] = useState("");
  const [aiReply, setAiReply] = useState("");
  const [aiError, setAiError] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const roles = {
    parent: { title: "Parent dashboard", accent: "#8b5cf6", note: "Track learning, explore IEP resources, and connect with teachers." },
    teacher: { title: "Teacher dashboard", accent: "#ec4899", note: "Organise learning, share resources, and support learners." },
    student: { title: "Student dashboard", accent: "#f59e0b", note: "Learn step by step, practise, and ask for support." },
  };
  const current = roles[role];

  useEffect(() => {
    let active = true;
    const loadStats = async () => {
      try {
        const response = await fetch(`${apiBase}/api/public/preview-stats`);
        if (!response.ok) throw new Error("Public registration trends are temporarily unavailable.");
        const data = await response.json();
        if (active) {
          setStats(data);
          setStatsError("");
        }
      } catch (error) {
        if (active) setStatsError(error.message || "Public registration trends are temporarily unavailable.");
      }
    };
    loadStats();
    const timer = setInterval(loadStats, 30000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [apiBase]);

  useEffect(() => {
    let active = true;
    setBooksLoading(true);
    setBooksError("");
    fetch(`${apiBase}/api/iep-books?grade=${encodeURIComponent(grade)}`)
      .then(async (response) => {
        if (!response.ok) throw new Error("Books could not be loaded right now.");
        return response.json();
      })
      .then((data) => { if (active) setBooks(Array.isArray(data.books) ? data.books : []); })
      .catch((error) => { if (active) { setBooks([]); setBooksError(error.message); } })
      .finally(() => { if (active) setBooksLoading(false); });
    return () => { active = false; };
  }, [apiBase, grade]);

  useEffect(() => {
    if (!aiActive) return undefined;
    const timer = setInterval(() => {
      const remaining = Math.max(0, secondsLeft - 1);
      setSecondsLeft(remaining);
      if (!remaining) setAiActive(false);
    }, 1000);
    return () => clearInterval(timer);
  }, [aiActive, secondsLeft]);

  const startAi = () => {
    if (!aiActive && secondsLeft > 0) {
      setAiActive(true);
    }
  };

  const askAi = async (event) => {
    event.preventDefault();
    const selectedTopic = topic === "__custom__" ? customTopic.trim() : topic;
    if (!selectedTopic || !aiActive || aiLoading) return;
    setAiLoading(true);
    setAiError("");
    setAiReply("");
    try {
      const response = await fetch(`${apiBase}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: `Teach Kenyan CBC Grade ${grade} ${subject}: ${selectedTopic}. Explain in age-appropriate steps and ask one short check-for-understanding question.` }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || data.message || data.error || "The AI tutor is temporarily unavailable.");
      setAiReply(data.reply || data.content || "No answer was returned. Please try another question.");
    } catch (error) {
      setAiError(error.message || "The AI tutor is temporarily unavailable.");
    } finally {
      setAiLoading(false);
    }
  };

  const openBookPreview = async (book) => {
    setSelectedBook(book);
    setPreviewFiles([]);
    setActivePreviewFile(null);
    setPreviewError("");
    setPreviewLoading(true);
    try {
      const response = await fetch(`${apiBase}/api/iep-books/${book.id}/preview`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || data.message || "This book could not be previewed.");
      const files = Array.isArray(data.files) ? data.files : [];
      setPreviewFiles(files);
      setActivePreviewFile(files.find((file) => file.kind !== "unsupported") || files[0] || null);
    } catch (error) {
      setPreviewError(error.message || "This book could not be previewed.");
    } finally {
      setPreviewLoading(false);
    }
  };

  return <section className="preview-dashboard mx-auto max-w-6xl">
    <div className="preview-hero rounded-[2rem] p-6 shadow-sm sm:p-10">
      <div><p className="text-xs font-black uppercase tracking-[.28em] text-violet-600">QOOHI preview</p><h1 className="mt-3 text-3xl font-black text-slate-900 sm:text-5xl">See your learning world in one place.</h1><p className="mt-4 max-w-2xl text-slate-600">Explore the {current.title.toLowerCase()}. Personal learning records stay private to their account.</p></div>
      <div className="preview-avatar" style={{ background: current.accent }} aria-hidden="true">{role === "parent" ? "P" : role === "teacher" ? "T" : "S"}</div>
    </div>
    <div className="mt-5 flex gap-2 rounded-2xl bg-white p-2 shadow-sm" role="tablist">{Object.entries(roles).map(([key, item]) => <button key={key} type="button" onClick={() => setRole(key)} className={`flex-1 rounded-xl px-3 py-3 text-sm font-black capitalize transition ${role === key ? "text-white shadow" : "text-slate-500 hover:bg-violet-50"}`} style={role === key ? { background: item.accent } : undefined}>{key}</button>)}</div>
    <div className="mt-4 flex justify-end"><button type="button" onClick={() => onRegisterRole(role)} className="rounded-full bg-violet-600 px-5 py-2.5 text-sm font-black text-white">Register as {role}</button></div>
    <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1.2fr]">
      <div className="preview-card rounded-[1.5rem] bg-white p-6 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[.2em] text-violet-600">QOOHI community</p>
        <h2 className="mt-2 text-xl font-black text-slate-900">{current.title}</h2>
        <p className="mt-2 text-sm text-slate-500">{current.note}</p>
        <div className="mt-5 rounded-2xl bg-slate-50 p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
            <div><h3 className="text-base font-black text-slate-800">Registration activity</h3><p className="mt-1 text-xs text-slate-600">Monthly totals for the latest six months</p></div>
            <span className="text-xs font-semibold text-slate-600">Refreshes every 30 seconds</span>
          </div>
          {stats
            ? <RegistrationGrowthChart data={stats.growth} />
            : <p role="status" className="rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm font-medium text-slate-600">{statsError ? "Registration activity could not be loaded." : "Loading registration activity…"}</p>}
        </div>
        {statsError && <p role="status" className="mt-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm font-semibold text-amber-950">{statsError}</p>}
        <p className="mt-3 text-xs font-medium text-slate-600">Only monthly aggregate registrations are shown; no names, contact details, or private learning records are exposed.</p>
      </div>
      <div className="preview-card rounded-[1.5rem] bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[.2em] text-violet-600">AI learning coach</p><h2 className="mt-2 text-xl font-black text-slate-900">Ask a learning question</h2><p className="mt-2 text-sm text-slate-500">Try the real tutor for up to three minutes. Please do not enter private information.</p></div><span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-black text-violet-700">{aiActive ? `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")} left` : "3 min preview"}</span></div>
        {!aiActive && secondsLeft > 0 && <button type="button" onClick={startAi} className="mt-5 rounded-full bg-violet-600 px-5 py-3 text-sm font-black text-white hover:bg-violet-700">Start AI preview</button>}
        {!aiActive && secondsLeft === 0 && <div className="mt-5"><p className="text-sm text-slate-600">Your guest tutor time has ended.</p><button type="button" onClick={() => onRegisterRole(role)} className="mt-3 rounded-full bg-violet-600 px-5 py-3 text-sm font-black text-white">Register to continue</button></div>}
        {aiActive && <form onSubmit={askAi} className="mt-5 space-y-3">
          <div className="grid gap-3 sm:grid-cols-[10rem_1fr]">
            <label className="text-sm font-bold text-slate-700">Grade<select value={grade} onChange={(event) => { setGrade(event.target.value); setTopic(""); }} className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900">{Array.from({ length: 12 }, (_, index) => <option key={index + 1} value={index + 1}>Grade {index + 1}</option>)}</select></label>
            <label className="text-sm font-bold text-slate-700">Subject<select value={subject} onChange={(event) => { setSubject(event.target.value); setTopic(""); }} className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900"><option value="">Choose a subject</option>{["Mathematics", "English", "Kiswahili", "Science", "Cybersecurity", "Python"].map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
          </div>
          {subject && grade && <label className="block text-sm font-bold text-slate-700">Topic<select required value={topic} onChange={(event) => setTopic(event.target.value)} className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900"><option value="">Choose a Grade {grade} {subject} topic</option>{TOPICS[subject][gradeBand(Number(grade))].map((item) => <option key={item} value={item}>{item}</option>)}<option value="__custom__">Ask another question…</option></select></label>}
          {topic === "__custom__" && <label className="block text-sm font-bold text-slate-700">Your question<textarea required maxLength={1000} value={customTopic} onChange={(event) => setCustomTopic(event.target.value)} rows={2} placeholder="Enter a learning question without personal information" className="mt-1 block w-full resize-y rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-500" /></label>}
          <button type="submit" disabled={aiLoading || !topic || (topic === "__custom__" && !customTopic.trim())} className="rounded-full bg-violet-600 px-5 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50">{aiLoading ? "Teaching…" : "Ask the tutor"}</button>
        </form>}
        {aiError && <p role="alert" className="mt-3 rounded-xl border border-rose-300 bg-rose-50 p-3 text-base font-semibold text-rose-900">{aiError}</p>}
        {aiReply && <div className="mt-4 max-h-64 overflow-y-auto whitespace-pre-wrap rounded-2xl bg-violet-50 p-4 text-sm leading-6 text-slate-700">{aiReply}</div>}
      </div>
    </div>
    <div className="preview-card mt-5 rounded-[1.5rem] bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><p className="text-xs font-black uppercase tracking-[.2em] text-amber-600">IEP BOOK LIBRARY</p><h2 className="mt-2 text-2xl font-black text-slate-900">Review real learning books</h2><p className="mt-2 text-sm text-slate-500">Books are loaded from the library for the selected grade.</p></div>
        <label className="text-xs font-bold text-slate-600">Grade<select value={grade} onChange={(event) => setGrade(event.target.value)} className="ml-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800">{Array.from({ length: 12 }, (_, index) => <option key={index + 1} value={index + 1}>Grade {index + 1}</option>)}</select></label>
      </div>
      {booksLoading ? <p className="mt-5 text-sm text-slate-500">Loading library…</p> : booksError ? <p role="alert" className="mt-4 rounded-xl border border-rose-300 bg-rose-50 p-3 text-base font-semibold text-rose-900">{booksError}</p> : books.length ? (
        <div className="no-scrollbar mt-5 flex snap-x gap-4 overflow-x-auto pb-3">{books.map((book) => <article key={book.id} className="w-64 shrink-0 snap-start rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs font-black uppercase tracking-widest text-amber-700">{book.subject || "IEP learning book"}</p><h3 className="mt-2 line-clamp-2 min-h-12 font-black text-slate-800">{book.title}</h3><p className="mt-2 text-xs text-slate-500">Grade {book.grade}</p><button type="button" onClick={() => openBookPreview(book)} className="mt-4 w-full rounded-full bg-amber-500 px-4 py-2.5 text-xs font-black text-white hover:bg-amber-600">Preview book</button></article>)}</div>
      ) : <p className="mt-5 rounded-xl border border-dashed border-slate-300 p-5 text-sm text-slate-500">No books are available for Grade {grade} yet.</p>}
      {selectedBook && <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/75 p-3 sm:p-6" role="dialog" aria-modal="true" aria-label={`Preview ${selectedBook.title}`}><div className="flex h-[92dvh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"><div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3"><div className="min-w-0"><p className="truncate font-black text-slate-800">{selectedBook.title}</p><p className="text-xs text-slate-500">Grade {selectedBook.grade} · {selectedBook.subject}</p></div><button type="button" onClick={() => setSelectedBook(null)} className="rounded-full border border-slate-200 px-4 py-2 text-xs font-black text-slate-700">Close</button></div><div className="flex min-h-0 flex-1 flex-col sm:flex-row">{previewLoading ? <p className="p-6 text-sm text-slate-500">Preparing safe book preview…</p> : previewError ? <p role="alert" className="m-5 rounded-xl border border-rose-300 bg-rose-50 p-4 text-base font-semibold text-rose-900">{previewError}</p> : <><nav aria-label="Book contents" className="no-scrollbar flex max-h-36 shrink-0 gap-2 overflow-x-auto border-b border-slate-200 p-3 sm:max-h-none sm:w-64 sm:flex-col sm:overflow-y-auto sm:overflow-x-hidden sm:border-b-0 sm:border-r">{previewFiles.map((file) => <button key={file.entry} type="button" disabled={file.kind === "unsupported"} onClick={() => setActivePreviewFile(file)} className={`min-w-40 rounded-xl px-3 py-2 text-left text-xs ${activePreviewFile?.entry === file.entry ? "bg-violet-100 font-black text-violet-800" : "bg-slate-50 text-slate-600"} disabled:cursor-not-allowed disabled:opacity-50`}><span className="block truncate">{file.name}</span><span className="mt-1 block uppercase text-[10px]">{file.kind === "unsupported" ? "Unavailable in safe preview" : file.kind}</span></button>)}</nav><div className="min-h-0 flex-1 bg-slate-100">{activePreviewFile && activePreviewFile.kind !== "unsupported" ? <iframe title={`${activePreviewFile.name} from ${selectedBook.title}`} src={`${apiBase}/api/iep-books/${selectedBook.id}/preview/file?entry=${encodeURIComponent(activePreviewFile.entry)}`} className="h-full min-h-64 w-full border-0" /> : <p className="p-6 text-sm text-slate-600">{previewFiles.length ? "Select a PDF, image, or text file to review. Other file types are not opened in the public preview." : "This book archive contains no files available for safe preview."}</p>}</div></>}</div></div></div>}
    </div>
  </section>;
}
