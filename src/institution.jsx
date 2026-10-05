import { useEffect, useState } from "react";
import RegistrationGrowthChart from "./RegistrationGrowthChart.jsx";

const API_BASE = (import.meta.env.VITE_API_BASE || "http://localhost:8080").replace(/\/$/, "");
const SUBJECTS = ["Mathematics", "English", "Kiswahili", "Integrated Science", "Social Studies", "Agriculture", "Creative Arts", "Pre-Technical Studies", "Religious Education", "Business Studies"];

async function request(path, { method = "GET", body, token } = {}) {
  const response = await fetch(`${API_BASE}/api${path}`, {
    method,
    headers: { ...(body ? { "Content-Type": "application/json" } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Institution request failed.");
  return data;
}

export function InstitutionPreview({ onOpenAuth }) {
  const [stats, setStats] = useState(null);
  const [statsError, setStatsError] = useState("");
  useEffect(() => {
    let active = true;
    const loadStats = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/public/preview-stats`);
        if (!response.ok) throw new Error("Live registration trends are unavailable.");
        const data = await response.json();
        if (active) {
          setStats(data);
          setStatsError("");
        }
      } catch (error) {
        if (active) setStatsError(error.message || "Live registration trends are unavailable.");
      }
    };
    loadStats();
    const timer = setInterval(loadStats, 30000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);
  return <main className="institution-preview-shell">
    <header className="institution-preview-top"><div className="institution-preview-brand-mark">Q</div><div className="institution-preview-brand-copy"><strong>QOOHI</strong><p className="institution-dashboard-eyebrow">QOOHI for institutions</p><h1>One calm workspace for every learner.</h1></div><nav className="institution-preview-actions"><button type="button" onClick={() => onOpenAuth("login")}>Login</button><button type="button" onClick={() => onOpenAuth("register")}>Register</button></nav></header>
    <section className="institution-preview-hero"><div><p className="institution-dashboard-eyebrow">Institution workspace preview</p><h2>Connect classes, teachers, and families.</h2><p>Preview learner rosters, CBC classes, teaching teams, recommendations, and school settings before opening your institution account.</p><button type="button" onClick={() => onOpenAuth("register")}>Create institution workspace</button></div><div className="institution-preview-orb">🏫</div></section>
    <section className="institution-preview-growth" aria-labelledby="institution-growth-title">
      <div className="institution-preview-growth-heading"><div><p className="institution-dashboard-eyebrow">QOOHI community</p><h2 id="institution-growth-title">Registration activity</h2><p>Monthly app and institution registrations for the latest six months.</p></div><span>Refreshes every 30 seconds</span></div>
      {stats
        ? <RegistrationGrowthChart data={stats.growth} />
        : <p role="status" className="rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm font-medium text-slate-600">{statsError ? "Registration activity could not be loaded." : "Loading registration activity…"}</p>}
      <p className="institution-preview-data-note">Only monthly aggregate registrations are shown. No names, contact details, or private learner records are displayed.</p>
    </section>
    {statsError && <p role="status" className="institution-preview-error">{statsError}</p>}
    <section className="institution-preview-panels">
      <article><p className="institution-dashboard-eyebrow">Public resources</p><h3>IEP books for learning</h3><p>Families and learners can safely review available learning material and explore the AI tutor in the public preview.</p></article>
      <article><p className="institution-dashboard-eyebrow">Built for schools</p><h3>From registration to insight</h3><p>Register learners in classes, add teachers, and keep family updates in one private workspace.</p></article>
    </section>
  </main>;
}

export default function InstitutionDashboard({ data, token, refresh, onSignOut }) {
  const institution = data.institution;
  const [activeTab, setActiveTab] = useState("Overview");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [classForm, setClassForm] = useState({ grade: institution.school_type === "senior" ? "Grade 10" : "Grade 1", name: "" });
  const [studentForm, setStudentForm] = useState({ full_name: "", registration_no: "", parent_name: "", parent_email: "", parent_phone: "", parent_location: "", parent_latitude: null, parent_longitude: null, grade_key: "", class_name: "", teacher: "", subjects: [], course_interests: [] });
  const [staffForm, setStaffForm] = useState({ full_name: "", email: "", whatsapp: "", location: "", latitude: null, longitude: null, subjects: "" });
  const [profile, setProfile] = useState({ ...institution, initialized: Boolean(institution.initialized) });
  const [placeTarget, setPlaceTarget] = useState("");
  const [placeQuery, setPlaceQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const gradeOptions = institution.school_type === "senior"
    ? ["Grade 10", "Grade 11", "Grade 12"]
    : Array.from({ length: 9 }, (_, index) => `Grade ${index + 1}`);
  const counts = { learners: data.students?.length || 0, classes: data.classes?.length || 0, teachers: data.staff?.length || 0 };

  useEffect(() => {
    if (!placeTarget || placeQuery.trim().length < 3) { setSuggestions([]); return undefined; }
    const timer = setTimeout(() => request(`/places/suggest?q=${encodeURIComponent(placeQuery)}`).then((result) => setSuggestions(result.suggestions || [])).catch(() => setSuggestions([])), 300);
    return () => clearTimeout(timer);
  }, [placeQuery, placeTarget]);

  const run = async (operation, doneMessage = "Saved successfully.") => {
    setBusy(true); setError(""); setStatus("");
    try { await operation(); await refresh(); setStatus(doneMessage); }
    catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };
  const saveClass = (event) => { event.preventDefault(); run(() => request("/schools/classes", { method: "POST", token, body: classForm }), "Class added.").then(() => setClassForm((current) => ({ ...current, name: "" }))); };
  const saveStudent = (event) => { event.preventDefault(); run(async () => { const result = await request("/schools/students", { method: "POST", token, body: studentForm }); setStatus(`Learner saved. Parent invitation: ${result.student.invitation_link}`); }, "Learner added.").then(() => setStudentForm({ full_name: "", registration_no: "", parent_name: "", parent_email: "", parent_phone: "", parent_location: "", parent_latitude: null, parent_longitude: null, grade_key: "", class_name: "", teacher: "", subjects: [], course_interests: [] })); };
  const saveStaff = (event) => { event.preventDefault(); run(() => request("/schools/staff", { method: "POST", token, body: staffForm }), "Teacher added.").then(() => setStaffForm({ full_name: "", email: "", whatsapp: "", location: "", latitude: null, longitude: null, subjects: "" })); };
  const saveProfile = (event) => { event.preventDefault(); run(async () => { const result = await request("/schools/profile", { method: "POST", token, body: profile }); setProfile(result.institution); }, "Institution profile updated."); };
  const recommend = (student, subject) => run(async () => {
    const result = await request(`/schools/students/${student.id}/recommendations`, { method: "POST", token, body: { subject } });
    setStatus(result.recommendations.length ? `${result.recommendations.length} teacher recommendation(s) sent for ${subject}.` : `No QOOHI teacher with a ${subject} profile is available yet.`);
  }, `Recommendation sent for ${subject}.`);
  const chooseLocation = async (placeId) => {
    try {
      const result = await request("/places/details", { method: "POST", body: { placeId } });
      const place = result.place;
      if (placeTarget === "profile") setProfile((current) => ({ ...current, location: place.location, latitude: place.latitude, longitude: place.longitude, name: current.name || place.name, phone: current.phone || place.phone, logo_url: current.logo_url || place.photo_url }));
      if (placeTarget === "student") setStudentForm((current) => ({ ...current, parent_location: place.location, parent_latitude: place.latitude, parent_longitude: place.longitude }));
      if (placeTarget === "staff") setStaffForm((current) => ({ ...current, location: place.location, latitude: place.latitude, longitude: place.longitude }));
      setPlaceQuery(place.location); setSuggestions([]); setPlaceTarget("");
    } catch (e) { setError(e.message); }
  };
  const locationInput = (target, value, placeholder) => <div className="institution-place-field"><input required value={value} placeholder={placeholder} onFocus={() => { setPlaceTarget(target); setPlaceQuery(value); }} onChange={(event) => {
    setPlaceTarget(target); setPlaceQuery(event.target.value);
    if (target === "profile") setProfile((current) => ({ ...current, location: event.target.value, latitude: null, longitude: null }));
    if (target === "student") setStudentForm((current) => ({ ...current, parent_location: event.target.value, parent_latitude: null, parent_longitude: null }));
    if (target === "staff") setStaffForm((current) => ({ ...current, location: event.target.value, latitude: null, longitude: null }));
  }} />{placeTarget === target && suggestions.length > 0 && <div className="institution-place-suggestions">{suggestions.map((place) => <button type="button" key={place.placeId} onClick={() => chooseLocation(place.placeId)}>{place.text}</button>)}</div>}</div>;
  const setStudentField = (key) => (event) => setStudentForm((current) => ({ ...current, [key]: event.target.value }));
  const setStaffField = (key) => (event) => setStaffForm((current) => ({ ...current, [key]: event.target.value }));
  const subjects = (raw) => { try { return JSON.parse(raw || "[]"); } catch { return []; } };

  return <main className="institution-dashboard-shell">
    <aside className="institution-sidebar">
      <div className="institution-brand"><div className="institution-brand-mark">Q</div><div><b>QOOHI</b><small>Institution Portal</small></div></div>
      <nav className="institution-sidebar-nav">{["Overview", "Classes", "Coaches", "Settings"].map((item, index) => <button key={item} className={activeTab === item ? "active" : ""} type="button" onClick={() => { setActiveTab(item); setStatus(""); setError(""); }}><span>{["⌂", "▦", "♧", "⚙"][index]}</span>{item}</button>)}</nav>
      <div className="institution-sidebar-account"><p>Signed in as</p><strong>{institution.email}</strong><button type="button" onClick={onSignOut}>Sign out</button></div>
    </aside>
    <section className="institution-dashboard-main">
      <header className="institution-topbar"><div><p className="institution-dashboard-eyebrow">{activeTab}</p><h1>{institution.name}</h1><p>{institution.location} · {institution.school_type === "senior" ? "CBC Senior School · Grades 10–12" : "CBC Primary / Junior · Grades 1–9"}</p></div><div className="institution-topbar-actions"><span className="institution-dashboard-status">{institution.initialized ? "Workspace active" : "Setup required"}</span><button className="institution-avatar" type="button" onClick={() => setActiveTab("Settings")}>{institution.name?.[0]?.toUpperCase() || "Q"}</button></div></header>
      {(status || error) && <p className={error ? "institution-error" : "institution-status"}>{error || status}</p>}
      {activeTab === "Overview" && <>
        <section className="institution-hero-card"><div><p className="institution-dashboard-eyebrow">Institution workspace</p><h2>{institution.motto || "A connected place to support every learner."}</h2><p>Manage your classes, learner roster, teaching team, and support recommendations.</p></div>{institution.logo_url && <img className="institution-hero-logo" src={institution.logo_url.startsWith("/") ? `${API_BASE}${institution.logo_url}` : institution.logo_url} alt="Institution logo" />}</section>
        <section className="institution-stat-grid institution-stat-grid-modern"><div><span>Total learners</span><strong>{counts.learners}</strong><small>Registered on the roster</small></div><div><span>Active classes</span><strong>{counts.classes}</strong><small>Across your grade levels</small></div><div><span>Teachers</span><strong>{counts.teachers}</strong><small>Teaching team records</small></div><div><span>Workspace</span><strong>{institution.initialized ? "Ready" : "New"}</strong><small>Institution account</small></div></section>
        {!institution.initialized && <button className="institution-btn institution-dashboard-btn" disabled={busy} onClick={() => run(async () => { await request("/schools/setup", { method: "POST", token }); }, "Workspace initialized.")}>Initialize school structure</button>}
        <section className="institution-content-grid"><article className="institution-content-card"><h3>Institution profile</h3><div className="institution-profile-row"><span>Email</span><b>{institution.email}</b></div><div className="institution-profile-row"><span>Phone</span><b>{institution.phone || "Not added"}</b></div><div className="institution-profile-row"><span>Motto</span><b>{institution.motto || "Not added"}</b></div><button className="institution-btn institution-dashboard-btn" onClick={() => setActiveTab("Settings")}>Edit profile</button></article><article className="institution-content-card"><h3>Quick actions</h3><div className="institution-quick-actions"><button type="button" onClick={() => setActiveTab("Classes")}>Add class</button><button type="button" onClick={() => setActiveTab("Coaches")}>Add teacher</button></div></article></section>
      </>}
      {activeTab === "Classes" && <section className="institution-tab-panel"><p className="institution-dashboard-eyebrow">School structure</p><h2>Classes</h2><form className="institution-data-form" onSubmit={saveClass}><label>Grade<select value={classForm.grade} onChange={(event) => setClassForm((current) => ({ ...current, grade: event.target.value }))}>{gradeOptions.map((grade) => <option key={grade}>{grade}</option>)}</select></label><label>Class name<input required placeholder="e.g. Grade 1 Blue" value={classForm.name} onChange={(event) => setClassForm((current) => ({ ...current, name: event.target.value }))} /></label><button className="institution-btn" disabled={busy}>Add class</button></form><div className="institution-record-list">{data.classes?.map((item) => <div className="institution-record" key={item.id}><strong>{item.name}</strong><span>{item.grade}</span></div>)}{!counts.classes && <p>No classes added yet.</p>}</div></section>}
      {activeTab === "Learners" && <section className="institution-tab-panel"><p className="institution-dashboard-eyebrow">Roster management</p><h2>Register a learner</h2><form className="institution-data-form institution-form-grid" onSubmit={saveStudent}><input required placeholder="Student / pupil name" value={studentForm.full_name} onChange={setStudentField("full_name")} /><input required placeholder="Registration number" value={studentForm.registration_no} onChange={setStudentField("registration_no")} /><input required placeholder="Parent / guardian name" value={studentForm.parent_name} onChange={setStudentField("parent_name")} /><input required type="email" placeholder="Parent email" value={studentForm.parent_email} onChange={setStudentField("parent_email")} /><input required placeholder="Parent WhatsApp number" value={studentForm.parent_phone} onChange={setStudentField("parent_phone")} />{locationInput("student", studentForm.parent_location, "Parent home location in Kenya")}<select required value={studentForm.grade_key} onChange={(event) => setStudentForm((current) => ({ ...current, grade_key: event.target.value, class_name: "" }))}><option value="">Select grade</option>{gradeOptions.map((grade) => <option key={grade}>{grade}</option>)}</select><select required value={studentForm.class_name} onChange={setStudentField("class_name")}><option value="">Select class</option>{data.classes?.filter((item) => item.grade === studentForm.grade_key).map((item) => <option key={item.id}>{item.name}</option>)}</select><input placeholder="Current class teacher (optional)" value={studentForm.teacher} onChange={setStudentField("teacher")} /><fieldset className="institution-subject-picker"><legend>Underperforming subjects</legend>{SUBJECTS.map((subject) => <label key={subject}><input type="checkbox" checked={studentForm.subjects.includes(subject)} onChange={(event) => setStudentForm((current) => ({ ...current, subjects: event.target.checked ? [...current.subjects, subject] : current.subjects.filter((item) => item !== subject) }))} />{subject}</label>)}</fieldset><fieldset className="institution-subject-picker"><legend>Optional course interests</legend>{["Cybersecurity", "Python", "Web Design/Website", "Computer Packages"].map((interest) => <label key={interest}><input type="checkbox" checked={studentForm.course_interests.includes(interest)} onChange={(event) => setStudentForm((current) => ({ ...current, course_interests: event.target.checked ? [...current.course_interests, interest] : current.course_interests.filter((item) => item !== interest) }))} />{interest}</label>)}</fieldset><button className="institution-btn" disabled={busy}>Register learner</button></form>
        <h3 className="institution-list-heading">Learner roster</h3><div className="institution-record-list">{data.students?.map((student) => <article className="institution-record institution-record-student" key={student.id}><div><strong>{student.full_name}</strong><p>{student.grade_key} · {student.class_name} · {student.parent_name}</p><small>{student.registration_no || student.external_id}</small></div><div className="institution-recommend-actions">{subjects(student.underperforming_subjects_json).map((subject) => <button type="button" disabled={busy} key={subject} onClick={() => recommend(student, subject)}>Recommend {subject}</button>)}</div></article>)}{!counts.learners && <p>No learners registered yet.</p>}</div></section>}
      {activeTab === "Coaches" && <section className="institution-tab-panel"><p className="institution-dashboard-eyebrow">Teaching team</p><h2>Add a teacher</h2><form className="institution-data-form institution-form-grid" onSubmit={saveStaff}><input required placeholder="Teacher name" value={staffForm.full_name} onChange={setStaffField("full_name")} /><input type="email" placeholder="Teacher email" value={staffForm.email} onChange={setStaffField("email")} /><input placeholder="WhatsApp number" value={staffForm.whatsapp} onChange={setStaffField("whatsapp")} />{locationInput("staff", staffForm.location, "Teacher home location in Kenya")}<input placeholder="Subjects taught, comma separated" value={staffForm.subjects} onChange={setStaffField("subjects")} /><button className="institution-btn" disabled={busy}>Add teacher</button></form><h3 className="institution-list-heading">Teaching team</h3><div className="institution-record-list">{data.staff?.map((teacher) => <div className="institution-record" key={teacher.id}><div><strong>{teacher.full_name}</strong><p>{teacher.email || "No email"} · {teacher.whatsapp || "No WhatsApp"}</p></div><span>{teacher.location || "Location not added"}</span></div>)}{!counts.teachers && <p>No teachers added yet.</p>}</div></section>}
      {activeTab === "Settings" && <section className="institution-tab-panel"><p className="institution-dashboard-eyebrow">Settings / Profile</p><h2>Institution profile</h2><div className="institution-settings-layout"><form className="institution-data-form" onSubmit={saveProfile}><input required placeholder="Institution name" value={profile.name || ""} onChange={(event) => setProfile((current) => ({ ...current, name: event.target.value }))} />{locationInput("profile", profile.location || "", "Institution location in Kenya")}<input placeholder="Phone number" value={profile.phone || ""} onChange={(event) => setProfile((current) => ({ ...current, phone: event.target.value }))} /><select value={profile.school_type || "junior"} onChange={(event) => setProfile((current) => ({ ...current, school_type: event.target.value }))}><option value="junior">CBC Primary / Junior (Grades 1–9)</option><option value="senior">CBC Senior School (Grades 10–12)</option></select><input placeholder="Institution logo URL" value={profile.logo_url || ""} onChange={(event) => setProfile((current) => ({ ...current, logo_url: event.target.value }))} /><textarea placeholder="Institution motto" value={profile.motto || ""} onChange={(event) => setProfile((current) => ({ ...current, motto: event.target.value }))} /><button className="institution-btn" disabled={busy}>Save profile</button></form><aside className="institution-profile-preview"><p className="institution-dashboard-eyebrow">Profile preview</p>{profile.logo_url && <img src={profile.logo_url.startsWith("/") ? `${API_BASE}${profile.logo_url}` : profile.logo_url} alt="Institution profile" />}<h3>{profile.name}</h3><p>{profile.motto || "Institution motto"}</p><small>{profile.location}</small><small>{profile.phone}</small></aside></div><button className="institution-btn institution-dashboard-btn institution-signout" type="button" onClick={onSignOut}>Sign out of institution</button></section>}
    </section>
  </main>;
}
