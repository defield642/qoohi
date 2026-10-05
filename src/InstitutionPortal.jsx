import { useEffect, useState } from "react";
import InstitutionDashboard, { InstitutionPreview } from "./institution.jsx";
import InstitutionRegister from "./institutionregister.jsx";

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

export default function InstitutionPortal() {
  const [mode, setMode] = useState("register");
  const [form, setForm] = useState({ name: "", email: "", location: "", phone: "", school_type: "junior", logo_url: "", motto: "", latitude: null, longitude: null });
  const [suggestions, setSuggestions] = useState([]);
  const [placeQuery, setPlaceQuery] = useState("");
  const [code, setCode] = useState("");
  const [token, setToken] = useState(() => localStorage.getItem("qoohi_institution_token") || "");
  const [data, setData] = useState(() => { try { return JSON.parse(localStorage.getItem("qoohi_institution_dashboard") || "null"); } catch { return null; } });
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
  const refresh = async (activeToken = token) => {
    const result = await request("/schools/dashboard", { token: activeToken });
    const next = { ...result, institution: result.institution };
    setData(next);
    localStorage.setItem("qoohi_institution_dashboard", JSON.stringify(next));
    return next;
  };

  useEffect(() => {
    if (!token) return;
    refresh().catch(() => {
      localStorage.removeItem("qoohi_institution_token");
      localStorage.removeItem("qoohi_institution_dashboard");
      setToken("");
      setData(null);
    });
  }, [token]);

  useEffect(() => {
    if (mode !== "register" || placeQuery.trim().length < 3) { setSuggestions([]); return undefined; }
    const timer = setTimeout(() => {
      request(`/places/suggest?q=${encodeURIComponent(placeQuery)}`)
        .then((result) => setSuggestions(result.suggestions || []))
        .catch(() => setSuggestions([]));
    }, 300);
    return () => clearTimeout(timer);
  }, [placeQuery, mode]);

  const choosePlace = async (placeId) => {
    setBusy(true); setError("");
    try {
      const result = await request("/places/details", { method: "POST", body: { placeId } });
      const place = result.place;
      setForm((current) => ({ ...current, name: place.name || current.name, location: place.location || current.location, phone: place.phone || current.phone, logo_url: place.photo_url || current.logo_url, latitude: place.latitude ?? null, longitude: place.longitude ?? null }));
      setPlaceQuery("");
      setSuggestions([]);
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  };

  const submitAuth = async (event) => {
    event.preventDefault(); setBusy(true); setError(""); setStatus("");
    try {
      const result = await request(`/schools/${mode === "login" ? "login" : "register"}`, { method: "POST", body: mode === "login" ? { email: form.email } : form });
      setStatus(result.message); setMode("verify");
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  };

  const verify = async (event) => {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const result = await request("/schools/verify", { method: "POST", body: { email: form.email, code } });
      localStorage.setItem("qoohi_institution_token", result.access_token);
      setToken(result.access_token);
      setData({ institution: result.institution, classes: [], students: [], staff: [] });
      setStatus("");
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  };

  const signOut = () => {
    localStorage.removeItem("qoohi_institution_token"); localStorage.removeItem("qoohi_institution_dashboard");
    setToken(""); setData(null); setCode(""); setMode("login"); setError(""); setStatus("");
  };

  if (token && data?.institution) return <InstitutionDashboard data={data} token={token} refresh={refresh} onSignOut={signOut} />;
  if (showPreview) return <InstitutionPreview onOpenAuth={(nextMode) => { setMode(nextMode); setShowPreview(false); }} />;

  return <InstitutionRegister
    mode={mode}
    setMode={setMode}
    form={form}
    update={update}
    suggestions={suggestions}
    choosePlace={choosePlace}
    setPlaceQuery={setPlaceQuery}
    setForm={setForm}
    busy={busy}
    submitAuth={submitAuth}
    code={code}
    setCode={setCode}
    verify={verify}
    status={status}
    error={error}
    apiBase={API_BASE}
  />;
}
