import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaArrowRight,
  FaBookOpen,
  FaChalkboardTeacher,
  FaChevronRight,
  FaEdit,
  FaEnvelope,
  FaGraduationCap,
  FaHistory,
  FaLaptopCode,
  FaLayerGroup,
  FaLink,
  FaMinusCircle,
  FaRobot,
  FaShieldAlt,
  FaTrophy,
  FaUserGraduate,
  FaUsers,
  FaWallet,
  FaWhatsapp,
} from "react-icons/fa";
import GuestDashboard, { StudentDashboard } from "./student.jsx";
import StudentRegister from "./studentregister.jsx";
import TeacherRegister from "./teacherregister.jsx";
import ParentRegister from "./parentregister.jsx";
import TeacherDashboard from "./teacher.jsx";
import ParentDashboard from "./parent.jsx";
import {
  ActionButton,
  AuthShell,
  Badge,
  GlassPanel,
  Input,
  Notice,
  PageStack,
  SectionLabel,
  SecondaryButton,
  SpeakTextButton,
} from "./UserUi.jsx";
const QoohiLogo = "/qoohi-icon.svg";
const bg1 = QoohiLogo;
const bg2 = QoohiLogo;
const bg3 = QoohiLogo;
const bg4 = QoohiLogo;
const bg5 = QoohiLogo;
const bg6 = QoohiLogo;
const fc26Img = QoohiLogo;
const codImg = QoohiLogo;
const gtaImg = QoohiLogo;
const websiteImg = QoohiLogo;
const aiTechImg = QoohiLogo;
const iepImg = QoohiLogo;
const libraryImg = QoohiLogo;
const loginImg = QoohiLogo;

function GoogleMark({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path fill="#4285F4" d="M21.35 12.27c0-.72-.06-1.41-.18-2.07H12v3.92h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.24Z" />
      <path fill="#34A853" d="M12 21.67c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.74 9.74 0 0 0 12 21.67Z" />
      <path fill="#FBBC05" d="M6.54 13.75A5.85 5.85 0 0 1 6.23 12c0-.61.1-1.2.31-1.75V7.72H3.3A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.06 1.05 4.28l3.24-2.53Z" />
      <path fill="#EA4335" d="M12 6.22c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.3 14.63 2.33 12 2.33a9.74 9.74 0 0 0-8.7 5.39l3.24 2.53c.77-2.31 2.92-4.03 5.46-4.03Z" />
    </svg>
  );
}

function ImageCropModal({ file, onCancel, onConfirm }) {
  const [src, setSrc] = useState("");
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const imageRef = useRef(null);
  const dragRef = useRef(null);
  const cropSize = 260;
  useEffect(() => {
    if (!file) return undefined;
    const reader = new FileReader();
    reader.onload = () => setSrc(String(reader.result || ""));
    reader.readAsDataURL(file);
    return () => setSrc("");
  }, [file]);
  if (!file || !src) return null;
  const move = (event) => { if (dragRef.current) setOffset({ x: event.clientX - dragRef.current.x, y: event.clientY - dragRef.current.y }); };
  const stop = () => { dragRef.current = null; };
  const confirm = () => {
    const image = imageRef.current;
    if (!image) return;
    const outputSize = 400;
    const canvas = document.createElement("canvas"); canvas.width = outputSize; canvas.height = outputSize;
    const context = canvas.getContext("2d");
    const scale = (outputSize / cropSize) * zoom;
    const width = image.naturalWidth * scale; const height = image.naturalHeight * scale;
    context.drawImage(image, (outputSize - width) / 2 + offset.x * (outputSize / cropSize), (outputSize - height) / 2 + offset.y * (outputSize / cropSize), width, height);
    canvas.toBlob((blob) => { if (!blob) return; const reader = new FileReader(); reader.onload = () => onConfirm(String(reader.result || "")); reader.readAsDataURL(blob); }, "image/jpeg", 0.9);
  };
  return <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"><div className="w-full max-w-sm rounded-3xl border border-white/15 bg-slate-950 p-6 shadow-2xl"><h3 className="text-center text-lg font-black text-white">Adjust profile photo</h3><div onPointerDown={(event) => { dragRef.current = { x: event.clientX - offset.x, y: event.clientY - offset.y }; }} onPointerMove={move} onPointerUp={stop} onPointerLeave={stop} className="relative mx-auto mt-5 cursor-grab overflow-hidden rounded-full border-2 border-cyan-400/40 bg-slate-900 active:cursor-grabbing" style={{ width: cropSize, height: cropSize, touchAction: "none" }}><img ref={imageRef} src={src} alt="Crop preview" draggable="false" className="pointer-events-none absolute left-1/2 top-1/2 max-w-none select-none" style={{ transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${zoom})` }} /></div><label className="mt-5 flex items-center gap-3 text-xs font-bold text-slate-300">Zoom<input type="range" min="1" max="3" step="0.05" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} className="flex-1 accent-cyan-400" /></label><div className="mt-6 flex gap-3"><SecondaryButton type="button" className="flex-1" onClick={onCancel}>Cancel</SecondaryButton><ActionButton type="button" className="flex-1" onClick={confirm}>Save Photo</ActionButton></div></div></div>;
}
const qoohiAiImg = QoohiLogo;
const teacherImg = QoohiLogo;

const MotionDiv = motion.div;

const API_BASE = import.meta.env.DEV ? "" : (import.meta.env.VITE_API_BASE || "");
const MPESA_API_BASE = import.meta.env.VITE_MPESA_API_BASE || "http://localhost:8080";

const backgrounds = [bg1, bg2, bg3, bg4, bg5, bg6];
const packageCards = [
  {
    key: "computer_packages",
    name: "Computer Packages",
    priceKsh: 4500,
    badge: "Starter Track",
    courses: [
      "MS Word",
      "MS Excel",
      "MS Powerpoint",
      "Email setup and use",
      "Typing skills",
    ],
    icon: FaLaptopCode,
    image: websiteImg,
  },
  {
    key: "coding_ai_training",
    name: "Coding and AI Training",
    priceKsh: 9500,
    badge: "Creator Track",
    courses: [
      "Machine Learning and AI Skills",
      "Python Programming",
      "Web Design",
      "Vibe Coding",
    ],
    icon: FaRobot,
    image: aiTechImg,
  },
  {
    key: "both",
    name: "FULL COURSE",
    priceKsh: 13500,
    badge: "Best Value",
    courses: [
      "Computer packages",
      "Machine Learning and AI Skills",
      "Python Programming",
      "Web Design",
      "Vibe Coding",
    ],
    icon: FaGraduationCap,
    image: aiTechImg,
  },
];
const tournamentInfo = {
  title: "FC 26 Tournament",
  capacity: 10,
  feeKsh: 250,
  winnerPrizeKsh: 700,
  secondPrizeKsh: 300,
};

export default function UserPortal() {
  const [route, setRoute] = useState(getRouteFromHash());
  // ... (rest of state)



  const [registrationTarget, setRegistrationTarget] = useState({
    type: "course",
    packageKey: "coding_ai_training",
  });
  const [pendingVerification, setPendingVerification] = useState({
    email: "",
    mode: "register",
    selectedRole: "",
  });
  const [sessionToken, setSessionToken] = useState(
    localStorage.getItem("qoohi_session_token") || "",
  );
  const [dashboard, setDashboard] = useState(null);
  const [chatWith, setChatWith] = useState(null);
  const [chatWithName, setChatWithName] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState([]);
  const [teacherOverview, setTeacherOverview] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [oauthChoiceRequired, setOauthChoiceRequired] = useState(false);
  const [availableDashboards, setAvailableDashboards] = useState([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthToken = params.get("oauth_token");
    if (params.get("oauth_select") === "1") setOauthChoiceRequired(true);
    const hashQuery = window.location.hash.includes("?")
      ? new URLSearchParams(window.location.hash.split("?")[1])
      : null;
    const oauthError = params.get("oauth_error") || hashQuery?.get("oauth_error");
    if (oauthToken) {
      localStorage.setItem("qoohi_session_token", oauthToken);
      setSessionToken(oauthToken);
      window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
    }
    if (oauthError) {
      setStatusMessage(`Google sign-in failed: ${oauthError}`);
      window.history.replaceState({}, document.title, `${window.location.pathname}#login`);
    }
  }, []);

  useEffect(() => {
    if (!dashboard || dashboard.student?.role !== "teacher") {
      setTeacherOverview(null);
      return;
    }
    Promise.all([
      fetchJson("/api/teacher/overview", { headers: { Authorization: `Bearer ${sessionToken}` } }),
      fetchJson("/api/teacher/workspace", { headers: { Authorization: `Bearer ${sessionToken}` } }),
    ])
      .then(([overview, workspace]) => setTeacherOverview({ ...overview, ...workspace }))
      .catch(() => setTeacherOverview(null));
  }, [dashboard, sessionToken]);

  const backgroundImage = useMemo(
    () => backgrounds[Math.floor(Math.random() * backgrounds.length)],
    [],
  );

  useEffect(() => {
    const syncHash = () => setRoute(getRouteFromHash());
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  useEffect(() => {
    if (!sessionToken) {
      setDashboard(null);
      return;
    }
    setLoadingDashboard(true);
    fetchJson("/api/student/dashboard", {
      headers: { Authorization: `Bearer ${sessionToken}` },
    })
      .then((data) => {
        setDashboard(data.dashboard);
        setAvailableDashboards(data.dashboard?.availableDashboards || []);
      })
      .catch(() => {
        setDashboard(null);
        localStorage.removeItem("qoohi_session_token");
        setSessionToken("");
      })
      .finally(() => setLoadingDashboard(false));
  }, [sessionToken]);

  const refreshDashboard = useCallback(async () => {
    if (!sessionToken) return null;
    const data = await fetchJson("/api/student/dashboard", {
      headers: { Authorization: `Bearer ${sessionToken}` },
    });
    setDashboard(data.dashboard);
    setAvailableDashboards(data.dashboard?.availableDashboards || []);
    return data.dashboard;
  }, [sessionToken]);

  const switchDashboard = async (role) => {
    if (!sessionToken || !["parent", "teacher"].includes(role)) return;
    setLoadingDashboard(true);
    try {
      const data = await fetchJson(`/api/student/dashboard?role=${encodeURIComponent(role)}`, { headers: { Authorization: `Bearer ${sessionToken}` } });
      setDashboard(data.dashboard);
      setAvailableDashboards(data.dashboard?.availableDashboards || []);
      setOauthChoiceRequired(false);
    } finally { setLoadingDashboard(false); }
  };

  const goTo = (nextRoute) => {
    setRoute(nextRoute);
    const nextHash = nextRoute === "home" ? "" : `#${nextRoute}`;
    if (window.location.hash !== nextHash) window.location.hash = nextHash;
  };

  const openCourseRegistration = (packageKey) => {
    setRegistrationTarget({ type: "course", packageKey });
    goTo("register");
  };

  const openTournamentRegistration = () => {
    setRegistrationTarget({ type: "tournament", packageKey: "" });
    goTo("register");
  };

  const openTeacherRegistration = () => {
    setRegistrationTarget({ type: "teacher", packageKey: "" });
    goTo("register");
  };

  const openIepRegistration = () => {
    setRegistrationTarget({ type: "iep", packageKey: "" });
    goTo("register");
  };

  const openParentRegistration = () => {
    setRegistrationTarget({ type: "parent", packageKey: "" });
    goTo("register");
  };

  const handleCodeRequest = async (payload) => {
    const data = await fetchJson("/api/auth/send-code", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setPendingVerification({
      email: payload.email,
      mode: payload.mode,
      selectedRole: payload.selectedRole || "",
    });
    setStatusMessage(data.message || "Verification code sent.");
    goTo("verify");
  };

  const handleCodeVerify = async ({ email, code, mode, selectedRole }) => {
    const data = await fetchJson("/api/auth/verify-code", {
      method: "POST",
      body: JSON.stringify({ email, code, mode, selectedRole: selectedRole || undefined }),
    });
    localStorage.setItem("qoohi_session_token", data.sessionToken);
    setSessionToken(data.sessionToken);
    setDashboard(data.dashboard);
    setStatusMessage("Welcome to your QOOHI dashboard.");
    goTo("dashboard");
  };

  const logout = () => {
    localStorage.removeItem("qoohi_session_token");
    setSessionToken("");
    setDashboard(null);
    goTo("home");
  };

  const chatHeaders = { Authorization: `Bearer ${sessionToken}`, "Content-Type": "application/json" };
  const myUserId = dashboard?.student?.id;

  const openChat = async (userId, userName) => {
    setChatWith(userId);
    setChatWithName(userName);
    setChatOpen(true);
    setChatInput("");
    try {
      const res = await fetchJson(`/api/chat/messages?with=${userId}`, { headers: chatHeaders });
      setChatMessages(res.messages || []);
    } catch { setChatMessages([]); }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim() || !chatWith) return;
    const msg = chatInput.trim();
    setChatInput("");
    setChatMessages((prev) => [...prev, { from_user_id: myUserId, message: msg, created_at: new Date().toISOString(), from_name: dashboard?.student?.fullName || "" }]);
    try {
      await fetchJson("/api/chat/send", {
        method: "POST", headers: chatHeaders,
        body: JSON.stringify({ toUserId: chatWith, message: msg }),
      });
    } catch {}
  };

  const fetchUnreadNotifs = async () => {
    try {
      const res = await fetchJson("/api/chat/unread", { headers: chatHeaders });
      setUnreadNotifs(res.notifications || []);
    } catch {}
  };

  useEffect(() => {
    if (!sessionToken) return;
    fetchUnreadNotifs();
    const interval = setInterval(fetchUnreadNotifs, 8000);
    return () => clearInterval(interval);
  }, [sessionToken]);

  return (
    <div
      className="app-light min-h-screen bg-slate-100 text-slate-900"
    >
      <Header route={route} goTo={goTo} dashboard={dashboard} />
      <main className={`mx-auto min-h-screen max-w-7xl px-4 pb-32 pt-4 sm:px-6 lg:px-8 ${route === "dashboard" ? "dashboard-route" : ""}`}>
        <div>
            {route === "home" && (
              sessionToken ? (oauthChoiceRequired && availableDashboards.length > 1 ? <DashboardChooser dashboards={availableDashboards} onSelect={switchDashboard} />               : <DashboardPage
                dashboard={dashboard}
                teacherOverview={teacherOverview}
                sessionToken={sessionToken}
                goTo={goTo}
                openParentRegistration={openParentRegistration}
                onRefresh={refreshDashboard}
                availableDashboards={availableDashboards}
                onSwitchDashboard={switchDashboard}
                onUpdateIep={async (userId, assessmentStatus, performanceLevel) => {
                  try {
                    const isParentStudent = String(userId).startsWith("ps_");
                    if (isParentStudent) {
                      const childId = String(userId).replace("ps_", "");
                      await fetchJson("/api/teacher/children/iep", {
                        method: "POST",
                        headers: { Authorization: `Bearer ${sessionToken}`, "Content-Type": "application/json" },
                        body: JSON.stringify({ childId: Number(childId), assessmentStatus, performanceLevel }),
                      });
                    } else {
                      await fetchJson(`/api/admin/users/${userId}/iep`, {
                        method: "POST",
                        headers: { Authorization: `Bearer ${sessionToken}` },
                        body: JSON.stringify({ assessmentStatus, performanceLevel }),
                      });
                    }
                    const [overview, workspace] = await Promise.all([
                      fetchJson("/api/teacher/overview", { headers: { Authorization: `Bearer ${sessionToken}` } }),
                      fetchJson("/api/teacher/workspace", { headers: { Authorization: `Bearer ${sessionToken}` } }),
                    ]);
                    setTeacherOverview({ ...overview, ...workspace });
                  } catch (err) {
                    setStatusMessage(err.message);
                  }
                }}
                loading={loadingDashboard}
                logout={logout}
                unreadNotifs={unreadNotifs}
                openChat={openChat}
              />) : <GuestDashboard apiBase={API_BASE} goTo={goTo} onRegisterRole={(role) => {
                setRegistrationTarget({ type: role, packageKey: "" });
                goTo("register");
              }} />
            )}
            {route === "register" && (
              registrationTarget.type === "student"
                ? <StudentRegister onSubmit={handleCodeRequest} statusMessage={statusMessage} onLogin={() => goTo("login")} apiBase={API_BASE} />
                : registrationTarget.type === "teacher"
                  ? <TeacherRegister registrationTarget={registrationTarget} onSubmit={handleCodeRequest} statusMessage={statusMessage} onLogin={() => goTo("login")} apiBase={API_BASE} />
                  : <ParentRegister registrationTarget={registrationTarget} onSubmit={handleCodeRequest} statusMessage={statusMessage} onLogin={() => goTo("login")} apiBase={API_BASE} />
            )}
            {route === "verify" && (
              <VerifyPage
                pendingVerification={pendingVerification}
                onVerify={handleCodeVerify}
                statusMessage={statusMessage}
              />
            )}
            {route === "login" && (
              <LoginPage
                statusMessage={statusMessage}
                onSubmit={(payload) =>
                  handleCodeRequest({
                    ...payload,
                    mode: "login",
                  })
                }
                onGoToRegister={(page) => {
                  setRegistrationTarget({ type: page === "teacher" ? "teacher" : "parent", packageKey: "" });
                  goTo("register");
                }}
              />
            )}
            {route === "dashboard" && (
              <DashboardPage
                dashboard={dashboard}
                teacherOverview={teacherOverview}
                sessionToken={sessionToken}
                goTo={goTo}
                openParentRegistration={openParentRegistration}
                onRefresh={refreshDashboard}
                availableDashboards={availableDashboards}
                onSwitchDashboard={switchDashboard}
                onUpdateIep={async (userId, assessmentStatus, performanceLevel) => {
                  try {
                    const isParentStudent = String(userId).startsWith("ps_");
                    if (isParentStudent) {
                      const childId = String(userId).replace("ps_", "");
                      const data = await fetchJson("/api/teacher/children/iep", {
                        method: "POST",
                        headers: { Authorization: `Bearer ${sessionToken}`, "Content-Type": "application/json" },
                        body: JSON.stringify({ childId: Number(childId), assessmentStatus, performanceLevel }),
                      });
                    } else {
                      const data = await fetchJson(`/api/admin/users/${userId}/iep`, {
                        method: "POST",
                        headers: { Authorization: `Bearer ${sessionToken}` },
                        body: JSON.stringify({ assessmentStatus, performanceLevel }),
                      });
                    }
                    const [overview, workspace] = await Promise.all([
                      fetchJson("/api/teacher/overview", { headers: { Authorization: `Bearer ${sessionToken}` } }),
                      fetchJson("/api/teacher/workspace", { headers: { Authorization: `Bearer ${sessionToken}` } }),
                    ]);
                    setTeacherOverview({ ...overview, ...workspace });
                  } catch (err) {
                    setStatusMessage(err.message);
                  }
                }}
                loading={loadingDashboard}
                logout={logout}
                unreadNotifs={unreadNotifs}
                openChat={openChat}
              />
            )}
            {route === "qoohiai" && <QoohiAIPage sessionToken={sessionToken} />}
        </div>
      </main>
      <Footer goTo={goTo} openParentRegistration={openParentRegistration} />

      {/* ── Chat Card ── */}
      {chatOpen && chatWith && (
        <div className="fixed bottom-4 right-4 z-50 flex h-[420px] w-[340px] flex-col rounded-2xl border border-white/20 bg-slate-900/95 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <span className="text-sm font-bold text-white">{chatWithName}</span>
            <button type="button" onClick={() => setChatOpen(false)} className="text-xs text-slate-500 hover:text-white">✕</button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ scrollBehavior: "smooth" }}>
            {chatMessages.length === 0 && <p className="text-xs text-slate-500 text-center py-4">No messages yet. Start a conversation!</p>}
            {chatMessages.map((msg, i) => {
              const isMine = msg.from_user_id === myUserId;
              return (
                <div key={i} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-xs leading-5 ${isMine ? "bg-cyan-500/20 text-cyan-100" : "bg-slate-800 text-slate-200"}`}>
                    {!isMine && <p className="text-[10px] font-bold text-cyan-400 mb-0.5">{msg.from_name}</p>}
                    <p>{msg.message}</p>
                    <p className="text-[9px] text-slate-500 mt-0.5 text-right">{new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex gap-2 border-t border-white/10 p-3">
            <input
              className="flex-1 rounded-xl bg-slate-950/60 px-3 py-2 text-xs text-white outline-none"
              placeholder="Type a message..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendChatMessage()}
            />
            <button
              type="button"
              onClick={sendChatMessage}
              className="rounded-xl bg-cyan-400 px-3 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-300"
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* ── Chat Notification Badge ── */}
      {unreadNotifs.length > 0 && !chatOpen && (
        <button
          type="button"
          onClick={async () => {
            const n = unreadNotifs[0];
            await openChat(n.from_user_id, n.from_name);
          }}
          className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-2xl border border-cyan-400/30 bg-cyan-500/20 px-4 py-3 text-xs font-bold text-cyan-200 shadow-lg backdrop-blur-xl hover:bg-cyan-500/30"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-400 text-[10px] font-black text-slate-950">{unreadNotifs.length}</span>
          New message{unreadNotifs.length > 1 ? "s" : ""}
        </button>
      )}
    </div>
  );
}

function Header({ route, goTo, dashboard }) {
  return (
    <header className="qoohi-purple-header sticky top-0 z-50 border-b border-purple-500 bg-purple-600 shadow-lg">
      <div className="mx-auto max-w-[1400px] px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => goTo("home")}
            className="group flex flex-shrink-0 items-center gap-3 transition-transform active:scale-95"
          >
            <img src="/qoohi-icon.svg" alt="" className="h-10 w-10 rounded-xl shadow-sm sm:h-12 sm:w-12" />
            <div className="text-left">
              <h1 className="text-xl font-black leading-none tracking-tight text-white">QOOHI</h1>
              <p className="mt-0.5 hidden text-[9px] font-black uppercase tracking-[0.3em] text-purple-100 sm:block">Digital Future</p>
            </div>
          </button>

          <div className="flex-1" />

          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => goTo("home")}
              className={`rounded-full px-2 py-2 text-[10px] font-black uppercase tracking-widest transition sm:px-4 sm:text-xs ${
                route === "home"
                  ? "bg-white text-purple-700 shadow-sm"
                  : "text-purple-100 hover:bg-purple-500/50"
              }`}
            >
              Home
            </button>
            {dashboard && <a href="/institution/" className="rounded-full px-2 py-2 text-[10px] font-black uppercase tracking-widest text-purple-100 transition hover:bg-purple-500/50 sm:px-4 sm:text-xs">Institution</a>}
            <button
              type="button"
              onClick={() => goTo(dashboard ? "dashboard" : "login")}
              className={`rounded-full px-2 py-2 text-[10px] font-black uppercase tracking-widest transition sm:px-4 sm:text-xs ${
                route === "dashboard" || route === "login"
                  ? "bg-white text-purple-700 shadow-sm"
                  : "text-purple-100 hover:bg-purple-500/50"
              }`}
            >
              {dashboard ? "Dashboard" : "Login"}
            </button>

          </nav>
        </div>
      </div>
    </header>
  );
}

function HomeButton({ onClick, image, label, sublabel, highlight = false }) {
  return (
    <button
      onClick={onClick}
      className={`group relative flex flex-col items-center overflow-hidden rounded-[2.5rem] border p-3 transition-all duration-500 hover:-translate-y-2 ${
        highlight
          ? "border-cyan-400/40 bg-cyan-400/10 shadow-[0_0_30px_rgba(34,211,238,0.2)]"
          : "border-white/10 bg-white/5 hover:border-cyan-400/40 hover:bg-white/10 hover:shadow-[0_0_30px_rgba(34,211,238,0.15)]"
      }`}
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-[2rem]">
        <img
          src={image}
          alt={label}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-115"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-40" />
      </div>
      <div className="mt-4 pb-2">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white">
          {label}
        </p>
        <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.1em] text-cyan-400/70 group-hover:text-cyan-300">
          {sublabel}
        </p>
      </div>
    </button>
  );
}

function AboutPage({ goTo }) {
  const [qaInput, setQaInput] = useState("");
  const [qaLoading, setQaLoading] = useState(false);
  const [qaMessages, setQaMessages] = useState([]);

  const askQoohiExpert = async (e) => {
    e.preventDefault();
    if (!qaInput.trim() || qaLoading) return;

    const userMsg = { role: "user", content: qaInput.trim() };
    setQaMessages((prev) => [...prev, userMsg]);
    setQaInput("");
    setQaLoading(true);

    const systemPrompt = {
      role: "system",
      content: `You are the Official QOOHI Expert. Your goal is to answer questions about QOOHI accurately and professionally.

      KEY INFO ABOUT QOOHI:
      - Mission: Bridging the Gap Between Potential & Success.
      - Core Realization: Every learner is unique; traditional models fail Individualized Education Programs (IEP).
      - Pillars:
        1. Tech First (AI, modern software, real-time tracking).
        2. Human Centered (Coaches as mentors focusing on emotional/cognitive growth).
        3. Gamified Mastery (Using gaming and tournaments for engagement).
      - Vision: Empower 1 million Kenyans to build, innovate, and lead in the global digital economy.
      - Programs:
        1. Computer Packages (Ksh 4500): MS Word, Excel, PowerPoint, etc.
        2. Coding & AI Training (Ksh 9500): Machine Learning, Python, Web Design, Vibe Coding.
        3. Full Course (Ksh 13500): Combines both tracks.
      - Tournament: FC 26 Tournament (Ksh 250 entry, Ksh 750 winner prize).
      - Contact: 254712451604, qoohitech@gmail.com.

      Always be helpful, inspiring, and professional. If you don't know something specific, refer them to our contact info.`
    };

    try {
      const res = await fetch(`${API_BASE}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [systemPrompt, ...qaMessages, userMsg] }),
      });
      const data = await res.json();
      if (data.reply) {
        setQaMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      }
    } catch {
      setQaMessages((prev) => [...prev, { role: "assistant", content: "I'm having a bit of trouble connecting right now. Please try again or contact us directly!" }]);
    } finally {
      setQaLoading(false);
    }
  };

  const values = [
    {
      icon: <FaLaptopCode />,
      title: "Tech Excellence",
      desc: "We leverage cutting-edge AI and software to create superior learning outcomes.",
      color: "text-cyan-400",
      bg: "bg-cyan-400/5",
    },
    {
      icon: <FaUsers />,
      title: "Human Connection",
      desc: "Our mentors focus on the emotional and cognitive growth that machines can't replicate.",
      color: "text-blue-400",
      bg: "bg-blue-400/5",
    },
    {
      icon: <FaTrophy />,
      title: "Competitive Spirit",
      desc: "We believe in the power of play and competition to drive mastery and engagement.",
      color: "text-amber-400",
      bg: "bg-amber-400/5",
    },
    {
      icon: <FaShieldAlt />,
      title: "Integrity First",
      desc: "Transparent assessments and data-driven results you can trust for every student.",
      color: "text-emerald-400",
      bg: "bg-emerald-400/5",
    },
  ];

  return (
    <PageStack title="Our Story" subtitle="Pioneering the next generation of individualized education.">
      <div className="space-y-20 pb-12">
        {/* MISSION HERO */}
        <section className="relative overflow-hidden rounded-[2rem] bg-slate-900 border border-white/10">
          <div className="grid lg:grid-cols-2">
            <div className="relative min-h-[400px]">
              <img src={bg6} alt="Mission" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/40 to-transparent" />
            </div>
            <div className="relative flex flex-col justify-center p-8 sm:p-12 lg:p-16">
              <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-cyan-400/10 blur-[100px]" />
              <SectionLabel>Our Mission</SectionLabel>
              <h2 className="mt-6 text-4xl font-black text-white sm:text-5xl leading-[1.1]">
                Bridging the Gap Between <br />
                <span className="text-cyan-400 italic">Potential</span> & <span className="text-cyan-400">Success</span>.
              </h2>
              <p className="mt-8 text-lg font-medium leading-relaxed text-slate-300">
                QOOHI was founded on a simple but powerful realization: every learner is unique.
                Traditional education models often fail to account for Individualized Education Programs (IEP).
                We've built a platform that combines advanced diagnostics with expert mentorship
                to create a truly personalized learning journey for every Kenyan student.
              </p>
            </div>
          </div>
        </section>

        {/* AI EXPERT Q&A */}
        <section className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-900/50 p-8 sm:p-12">
          <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-blue-400/10 blur-[120px]" />
          <div className="max-w-3xl mx-auto text-center">
            <SectionLabel>Advanced Interaction</SectionLabel>
            <h2 className="mt-6 text-3xl font-black text-white sm:text-4xl">Ask the QOOHI Expert</h2>
            <p className="mt-4 text-slate-400 font-medium italic">
              "I am an AI trained on the QOOHI mission. Ask me anything about our programs, vision, or how we help learners."
            </p>

            <div className="mt-10 space-y-4 text-left">
              <AnimatePresence>
                {qaMessages.slice(-3).map((msg, i) => (
                  <MotionDiv
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-5 rounded-2xl ${msg.role === 'user' ? 'bg-cyan-400/10 border border-cyan-400/20 ml-12' : 'bg-white/5 border border-white/10 mr-12'}`}
                  >
                    <p className={`text-xs font-black uppercase tracking-widest mb-2 ${msg.role === 'user' ? 'text-cyan-400' : 'text-slate-500'}`}>
                      {msg.role === 'user' ? 'You' : 'QOOHI Expert'}
                    </p>
                    <p className="text-white leading-relaxed">{msg.content}</p>
                  </MotionDiv>
                ))}
              </AnimatePresence>

              <form onSubmit={askQoohiExpert} className="relative mt-8">
                <input
                  type="text"
                  value={qaInput}
                  onChange={(e) => setQaInput(e.target.value)}
                  placeholder="What are your computer packages?"
                  className="w-full rounded-2xl border border-white/15 bg-white/5 py-5 pl-6 pr-32 text-white placeholder-slate-500 focus:border-cyan-400/50 focus:outline-none focus:ring-1 focus:ring-cyan-400/50 transition-all"
                />
                <button
                  type="submit"
                  disabled={qaLoading || !qaInput.trim()}
                  className="absolute right-2 top-2 bottom-2 rounded-xl bg-cyan-400 px-6 text-sm font-black text-slate-950 transition hover:bg-cyan-300 disabled:opacity-50 disabled:hover:bg-cyan-400"
                >
                  {qaLoading ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" /> : 'Ask Expert'}
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* CORE VALUES GRID */}
        <section>
          <div className="mb-12 text-center">
            <SectionLabel>Our Values</SectionLabel>
            <h2 className="mt-4 text-3xl font-black text-white sm:text-4xl">The DNA of QOOHI</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v, i) => (
              <div key={i} className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-8 transition-all hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.07]">
                <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl ${v.bg} ${v.color} text-3xl transition-transform group-hover:scale-110`}>
                  {v.icon}
                </div>
                <h3 className="mb-3 text-xl font-black text-white">{v.title}</h3>
                <p className="text-sm font-medium leading-relaxed text-slate-400">{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* VISION SECTION */}
        <section className="relative overflow-hidden rounded-[3rem] border border-cyan-400/20 bg-gradient-to-b from-cyan-400/10 to-transparent p-12 sm:p-20 text-center">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-cyan-400/20 blur-[120px]" />
          <SectionLabel>Our Vision</SectionLabel>
          <h2 className="mx-auto mt-8 max-w-4xl text-3xl font-black leading-tight text-white sm:text-6xl">
            To empower 1 million <span className="text-cyan-400">Kenyans</span> with the skills to <span className="text-white/60">build</span>, <span className="text-white/60">innovate</span>, and <span className="text-white/60">lead</span> in the global digital economy.
          </h2>
          <div className="mt-16 flex flex-wrap justify-center gap-6">
            <ActionButton className="!px-12 !py-6 !text-xl shadow-[0_0_30px_rgba(34,211,238,0.3)]" onClick={() => goTo("register")}>
              Explore Programs
            </ActionButton>
            <SecondaryButton className="!px-12 !py-6 !text-xl" onClick={() => goTo("register")}>
              Partner With Us
            </SecondaryButton>
          </div>
        </section>
      </div>
    </PageStack>
  );
}

function IEPPage({ openIepRegistration, openParentRegistration }) {

  return (
    <PageStack
      title="Individualized Education"
      subtitle="Data-driven diagnostic assessment and adaptive level placement."
    >
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="relative overflow-hidden rounded-[3rem] border border-white/10 bg-slate-900 group shadow-2xl">
          <img src={iepImg} alt="Assessment" className="absolute inset-0 h-full w-full object-cover opacity-20 transition-transform duration-700 group-hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950/40 to-transparent" />
          <div className="relative p-10 sm:p-14">
            <SectionLabel>Core Assessment</SectionLabel>
            <h2 className="mt-6 text-4xl font-black text-white sm:text-5xl uppercase tracking-tighter italic">Precision <br/><span className="text-cyan-400 not-italic">Diagnostics</span></h2>
            <ul className="mt-10 space-y-5 text-xl font-black text-slate-300 sm:text-2xl">
              {["Academic Ability", "Learning Styles", "Cognitive Levels", "Socio-Emotional", "Special Needs"].map(item => (
                <li key={item} className="flex items-center gap-4 hover:text-white transition-colors group/li">
                  <div className="h-3 w-3 rounded-full bg-cyan-400 shadow-[0_0_15px_cyan] group-hover/li:scale-125 transition-transform" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <GlassPanel className="p-8 sm:p-10">
            <SectionLabel>Performance Levels</SectionLabel>
            <div className="mt-8 space-y-3">
              {["Foundational", "Developing", "Approaching", "Proficient", "Advanced"].map((level, i) => (
                <div key={level} className="flex items-center justify-between rounded-2xl bg-white/5 p-4 border border-white/10 hover:bg-white/10 transition-colors">
                  <span className="text-sm font-black text-white uppercase tracking-tight">Level {i + 1}: {level}</span>
                  <Badge className="!text-cyan-400 !border-cyan-400/20">Band {i + 1}</Badge>
                </div>
              ))}
            </div>
          </GlassPanel>
          <ActionButton className="w-full !text-xl !py-6 !rounded-[2rem]" onClick={openParentRegistration}>Register Your Child Here</ActionButton>
        </div>
      </div>
    </PageStack>
  );
}

function TeachersPage({ openTeacherRegistration }) {
  return (
    <PageStack
      title="Coach Portal"
      subtitle="Coaches as Solution Providers"
    >
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="relative overflow-hidden rounded-[3rem] border border-white/10 bg-slate-900 group">
          <img src={teacherImg} alt="Coaches" className="absolute inset-0 h-full w-full object-cover opacity-40 transition-transform duration-700 group-hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-slate-950/40 to-transparent" />
          <div className="relative p-10 sm:p-14">
            <SectionLabel>Core Focus</SectionLabel>
            <ul className="mt-8 space-y-6 text-xl font-black text-white sm:text-2xl">
              <li className="flex items-center gap-5 hover:translate-x-2 transition-transform"><FaChalkboardTeacher className="text-cyan-400 text-3xl" /> Differentiated Instruction</li>
              <li className="flex items-center gap-5 hover:translate-x-2 transition-transform"><FaLayerGroup className="text-cyan-400 text-3xl" /> Real-time Monitoring</li>
              <li className="flex items-center gap-5 hover:translate-x-2 transition-transform"><FaUsers className="text-cyan-400 text-3xl" /> Smart Grouping</li>
              <li className="flex items-center gap-5 hover:translate-x-2 transition-transform"><FaArrowRight className="text-cyan-400 text-3xl" /> Progress Tracking</li>
            </ul>
          </div>
        </div>

        <div className="relative flex flex-col justify-center overflow-hidden rounded-[3rem] border border-cyan-400/20 bg-cyan-400/5 p-10 sm:p-16 text-center shadow-[0_0_50px_rgba(34,211,238,0.1)]">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-400/10 blur-[100px]" />
          <SectionLabel>Join Our Faculty</SectionLabel>
          <h2 className="mt-8 text-4xl font-black text-white leading-tight sm:text-5xl">Empower your classroom with data-driven <span className="text-cyan-400 underline decoration-cyan-400/30 underline-offset-8">IEP tools</span>.</h2>
          <ActionButton className="mt-12 !text-xl !py-6 !rounded-[2rem]" onClick={openTeacherRegistration}>Register as Coach</ActionButton>
        </div>
      </div>
    </PageStack>
  );
}

function ResourcesPage({ openParentRegistration }) {

  return (
    <PageStack
      title="Digital Library"
      subtitle="Comprehensive soft and hard learning resources for every stage."
    >
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="relative overflow-hidden rounded-[3rem] border border-white/10 bg-slate-900 group">
          <img src={libraryImg} alt="Soft Copies" className="absolute inset-0 h-full w-full object-cover opacity-20 transition-transform duration-700 group-hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950/40 to-transparent" />
          <div className="relative p-10 sm:p-14">
            <SectionLabel>Instant Access</SectionLabel>
            <h3 className="mt-4 text-5xl font-black text-white uppercase tracking-tighter">Soft <span className="text-cyan-400">Copies</span></h3>
            <ul className="mt-10 space-y-4 text-xl font-bold text-slate-300">
              {["Interactive E-books", "Educational Videos", "Gamified Exercises", "Printable PDFs"].map(item => (
                <li key={item} className="flex items-center gap-3">
                  <FaChevronRight className="text-cyan-400 text-sm" /> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[3rem] border border-white/10 bg-slate-900 group">
          <img src={bg2} alt="Hard Copies" className="absolute inset-0 h-full w-full object-cover opacity-20 transition-transform duration-700 group-hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950/40 to-transparent" />
          <div className="relative p-10 sm:p-14">
            <SectionLabel>Tangible Tools</SectionLabel>
            <h3 className="mt-4 text-5xl font-black text-white uppercase tracking-tighter">Hard <span className="text-cyan-400">Copies</span></h3>
            <ul className="mt-10 space-y-4 text-xl font-bold text-slate-300">
              {["Level-Specific Workbooks", "Graded Reading Books", "Flashcard Sets", "Activity Kits"].map(item => (
                <li key={item} className="flex items-center gap-3">
                  <FaChevronRight className="text-cyan-400 text-sm" /> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lg:col-span-2 relative overflow-hidden rounded-[3rem] border border-cyan-400/20 bg-cyan-400/5 p-10 sm:p-14 shadow-2xl shadow-cyan-400/10 flex flex-wrap items-center justify-between gap-8">
          <div className="max-w-xl">
            <SectionLabel>For Parents</SectionLabel>
            <h2 className="mt-4 text-4xl font-black text-white">Parents as Financiers</h2>
            <p className="mt-4 text-lg text-slate-300 font-bold leading-relaxed">Support your child's growth through physical kits and graded materials designed for their specific IEP level.</p>
          </div>
          <ActionButton onClick={openParentRegistration} className="!text-xl !py-5 px-12 !rounded-2xl">Register as Parent</ActionButton>
        </div>
      </div>
    </PageStack>
  );
}

function GamesPage() {
  const games = [
    { name: "FC 26", copy: "Tournament football and community competition.", image: fc26Img, sub: "Community Play" },
    { name: "COD", copy: "Action and squad-based gameplay.", image: codImg, sub: "Squad Tactics" },
    { name: "GTA", copy: "Open world sessions with social play energy.", image: gtaImg, sub: "Social Hub" },
  ];

  return (
    <PageStack title="QOOHI Games" subtitle="Gaming feeds tournament registration and standings.">
      <div className="grid gap-8 md:grid-cols-3">
        {games.map((game) => (
          <div key={game.name} className="group relative flex flex-col overflow-hidden rounded-[3rem] border border-white/10 bg-slate-950 transition-all hover:border-cyan-400/40 hover:-translate-y-2">
            <div className="relative h-64 w-full overflow-hidden">
              <img src={game.image} alt={game.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-115" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-8">
                <SectionLabel className="!text-cyan-400">{game.sub}</SectionLabel>
                <h2 className="mt-2 text-3xl font-black text-white uppercase">{game.name}</h2>
              </div>
            </div>
            <div className="p-8">
              <p className="text-slate-300 font-medium leading-relaxed">{game.copy}</p>
              <div className="mt-8 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400/60">Live Tournaments</span>
                <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_cyan]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </PageStack>
  );
}

function NewPage({ openTournamentRegistration }) {

  return (
    <PageStack
      title="Spotlight"
      subtitle="Latest updates and featured community tournaments."
    >
      <div className="relative overflow-hidden rounded-[4rem] border border-white/10 bg-slate-950 shadow-2xl group">
        <div className="grid gap-0 lg:grid-cols-2">
          <div className="relative min-h-[400px] overflow-hidden">
            <img src={fc26Img} alt="FC 26" className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/40 to-transparent" />
          </div>
          <div className="flex flex-col justify-center p-10 sm:p-16 relative z-10">
            <div className="inline-flex w-fit items-center gap-3 rounded-full bg-amber-400/10 px-6 py-2 text-amber-400 border border-amber-400/20 mb-8">
              <FaTrophy className="text-sm animate-bounce" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Featured Event</span>
            </div>
            <h2 className="text-5xl font-black text-white tracking-tighter sm:text-7xl uppercase leading-[0.85]">FC 26 <br/><span className="text-cyan-400">CHAMPIONS</span></h2>
            <p className="mt-10 text-xl font-bold leading-relaxed text-slate-400 max-w-lg">
              Compete in our premier football tournament. 10 elite slots. Ultimate prestige.
            </p>
            <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div className="rounded-[1.5rem] border border-white/5 bg-white/5 p-6 backdrop-blur-md">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Entry</p>
                <p className="mt-1 text-2xl font-black text-white">Ksh 250</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/5 bg-white/5 p-6 backdrop-blur-md">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Winner</p>
                <p className="mt-1 text-2xl font-black text-amber-400">Ksh 700</p>
              </div>
            </div>
            <ActionButton className="mt-12 !text-xl !py-6 !rounded-[2rem] shadow-[0_0_30px_rgba(34,211,238,0.3)]" onClick={openTournamentRegistration}>
              SECURE YOUR SLOT
            </ActionButton>
          </div>
        </div>
      </div>
    </PageStack>
  );
}

function InstitutionPage() {
  const apiBase = import.meta.env.VITE_INSTITUTION_API_BASE || "http://localhost:8081/api/schools";
  const [form, setForm] = useState({ name: "", email: "", school_type: "junior", location: "", phone: "" });
  const [code, setCode] = useState("");
  const [token, setToken] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [institutionMode, setInstitutionMode] = useState("register");

  const post = async (path, body, accessToken = "") => {
    const response = await fetch(`${apiBase}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Institution service request failed.");
    return data;
  };

  const register = async (event) => {
    event.preventDefault(); setBusy(true); setError(""); setStatus("");
    try {
      const data = await post("/register/", form);
      setStatus(data.message || "Verification code sent. Check the institution email.");
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  const verify = async (event) => {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const data = await post("/verify/", { email: form.email, code });
      setToken(data.access_token);
      setStatus("Institution verified. Your school workspace is ready.");
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  const setup = async () => {
    setBusy(true); setError("");
    try {
      await post("/setup/", {}, token);
      setStatus("Institution structure created with default sections. You can now add classes and students.");
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  const institutionLogin = async (event) => {
    event.preventDefault(); setBusy(true); setError(""); setStatus("");
    try { const data = await post("/login/", { email: form.email }); setStatus(data.message || "Verification code sent."); setInstitutionMode("verify"); } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  return (
    <AuthShell isRegister={institutionMode === "register"} onLogin={() => setInstitutionMode("login")} onRegister={() => setInstitutionMode("register")}>
      <div className="qoohi-institution-form">
        {institutionMode === "register" && <><h1>Create Account</h1><p className="qoohi-institution-kicker">Register your institution</p><form className="mt-3 space-y-2" onSubmit={register}><input required placeholder="School name" value={form.name} onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))} /><input required type="email" placeholder="Institution email" value={form.email} onChange={(e) => setForm((c) => ({ ...c, email: e.target.value }))} /><input required placeholder="Location" value={form.location} onChange={(e) => setForm((c) => ({ ...c, location: e.target.value }))} /><input placeholder="Phone number" value={form.phone} onChange={(e) => setForm((c) => ({ ...c, phone: e.target.value }))} /><select value={form.school_type} onChange={(e) => setForm((c) => ({ ...c, school_type: e.target.value }))}><option value="junior">Junior / primary pathway</option><option value="senior">Senior secondary</option></select><button disabled={busy} className="qoohi-auth-btn w-full" type="submit">{busy ? "Sending..." : "Register institution"}</button></form></>}
        {institutionMode === "login" && <><h1>Institution Login</h1><p className="qoohi-institution-kicker">Access your institution workspace</p><form className="mt-3 space-y-2" onSubmit={institutionLogin}><input required type="email" placeholder="Institution email" value={form.email} onChange={(e) => setForm((c) => ({ ...c, email: e.target.value }))} /><button disabled={busy} className="qoohi-auth-btn w-full" type="submit">{busy ? "Sending..." : "Send login code"}</button></form></>}
        {institutionMode === "verify" && <><h1>Verify Email</h1><p className="qoohi-institution-kicker">Enter the code sent to {form.email}</p><form className="mt-3 space-y-2" onSubmit={verify}><input required inputMode="numeric" maxLength="6" placeholder="Six-digit verification code" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} /><button disabled={busy || !code || !form.email} className="qoohi-auth-btn qoohi-institution-outline w-full" type="submit">{busy ? "Verifying..." : "Verify email"}</button></form>{token && <button type="button" disabled={busy} onClick={setup} className="qoohi-auth-btn w-full">Initialize school structure</button>}</>}
        {(status || error) && <p className={error ? "qoohi-institution-error" : "qoohi-institution-status"}>{error || status}</p>}
      </div>
    </AuthShell>
  );
}

function SocialButtons({ mode = "login", role = "" }) {
  const startOAuth = () => {
    const params = new URLSearchParams({ mode });
    if (mode === "register" && role) params.set("role", role);
    window.location.assign(`${API_BASE}/api/auth/oauth/google/start?${params.toString()}`);
  };
  return <div className="grid grid-cols-1 gap-3"><button type="button" onClick={startOAuth} className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-700 transition hover:bg-slate-50"><GoogleMark /> Continue with Google</button></div>;
}

function DashboardChooser({ dashboards, onSelect }) {
  return <AuthShell><div className="w-full space-y-4 text-center"><h1>Select Dashboard</h1><p className="text-sm text-slate-500">Choose the QOOHI workspace you want to open.</p>{dashboards.map((item) => <button key={item.role} type="button" onClick={() => onSelect(item.role)} className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-cyan-400 hover:bg-cyan-50"><span><b className="block text-slate-800">{item.name}</b><small className="capitalize text-slate-500">{item.role === "teacher" ? "Coach" : "Parent"}</small></span><span className="text-xs font-black uppercase text-cyan-700">Open</span></button>)}</div></AuthShell>;
}

function LoginPage({ onSubmit, statusMessage, onGoToRegister }) {
  const [email, setEmail] = useState(""); const [submitting, setSubmitting] = useState(false); const [error, setError] = useState(""); const [checkingRoles, setCheckingRoles] = useState(false); const [dashboards, setDashboards] = useState([]);
  const submit = async (event) => { event.preventDefault(); if (!email.trim()) return; setError(""); setCheckingRoles(true); try { const data = await fetchJson("/api/auth/check-roles", { method: "POST", body: JSON.stringify({ email }) }); if (data.single) { setSubmitting(true); await onSubmit({ email, selectedRole: "" }); setSubmitting(false); } else if (data.dashboards?.length > 1) setDashboards(data.dashboards); } catch (err) { setError(err.message); setDashboards([]); } finally { setCheckingRoles(false); } };
  const selectAndLogin = async (role) => { setSubmitting(true); setError(""); try { await onSubmit({ email, selectedRole: role }); } catch (err) { setError(err.message); } finally { setSubmitting(false); } };
  return <AuthShell isRegister={false} onRegister={() => onGoToRegister?.("parent")}>
    {dashboards.length === 0 ? <form className="space-y-4" onSubmit={submit}><h1>Login</h1><Input label="Email" type="email" value={email} onChange={setEmail} />{(statusMessage || error) && <Notice tone={error ? "error" : "info"}>{error || statusMessage}</Notice>}<ActionButton disabled={submitting || checkingRoles} type="submit" className="w-full">{checkingRoles ? "Checking..." : submitting ? "Sending..." : "Login"}</ActionButton><div className="qoohi-social-copy">or continue with Google</div><SocialButtons mode="login" /><div className="qoohi-auth-note">No account? Use the Register panel.</div></form> : <div className="space-y-4"><h1>Select Dashboard</h1><p className="text-sm text-slate-500">Choose which dashboard to open:</p>{dashboards.map((db, i) => <button key={i} type="button" onClick={() => selectAndLogin(db.role)} disabled={submitting} className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3 text-left"><span><b className="block capitalize text-slate-800">{db.role}</b><small className="text-slate-500">{db.name}</small></span><span className="text-xs font-bold uppercase text-cyan-700">Select</span></button>)}</div>}
  </AuthShell>;
}

function StudentRegisterPage({ onSubmit, statusMessage }) {
  const [form, setForm] = useState({ email: "", whatsapp: "", courseInterests: [] });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const courses = ["Cybersecurity", "Python", "Web Design/Website", "Computer Packages"];
  const submit = async (event) => { event.preventDefault(); setBusy(true); setError(""); try { await onSubmit({ ...form, fullName: form.email.split("@")[0], registrationType: "student", registrationRole: "student" }); } catch (err) { setError(err.message); } finally { setBusy(false); } };
  return <AuthShell isRegister onLogin={() => { window.location.hash = "login"; }}><form className="space-y-4" onSubmit={submit}><h1>Student Account</h1><p className="qoohi-role-label">Learn with QOOHI</p><Input label="Email address" type="email" value={form.email} onChange={(value) => setForm((current) => ({ ...current, email: value }))} /><Input label="WhatsApp number" type="tel" value={form.whatsapp} onChange={(value) => setForm((current) => ({ ...current, whatsapp: value }))} /><fieldset className="rounded-2xl border border-slate-200 p-3 text-left"><legend className="px-2 text-xs font-black uppercase tracking-widest text-slate-500">Course interest</legend><div className="grid gap-2 sm:grid-cols-2">{courses.map((course) => <label key={course} className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={form.courseInterests.includes(course)} onChange={(event) => setForm((current) => ({ ...current, courseInterests: event.target.checked ? [...current.courseInterests, course] : current.courseInterests.filter((item) => item !== course) }))} />{course}</label>)}</div></fieldset>{(error || statusMessage) && <Notice tone={error ? "error" : "info"}>{error || statusMessage}</Notice>}<ActionButton type="submit" disabled={busy || !form.courseInterests.length} className="w-full">{busy ? "Sending code..." : "Create student account"}</ActionButton><SocialButtons mode="register" role="student" /></form></AuthShell>;
}

function RegisterPage({ registrationTarget, onSubmit, statusMessage }) {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", whatsapp: "", specialization: "", childName: "", childGradeLevel: "", childGoals: "", selectedPackage: registrationTarget.packageKey || "coding_ai_training" }); const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const [selectedRole, setSelectedRole] = useState(registrationTarget.type === "teacher" ? "teacher" : "parent"); const type = selectedRole; const label = type === "teacher" ? "Coach" : "Parent"; const set = (key) => (value) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event) => { event.preventDefault(); setBusy(true); setError(""); try { await onSubmit({ ...form, fullName: `${form.firstName} ${form.lastName}`.trim(), registrationType: registrationTarget.type === "course" ? "course" : type, registrationRole: type }); } catch (err) { setError(err.message); } finally { setBusy(false); } };
  return <AuthShell isRegister={true} onLogin={() => { window.location.hash = "login"; }}><form className="space-y-4" onSubmit={submit}><h1>Create Account</h1><p className="qoohi-role-label">Register as</p><div className="qoohi-role-picker"><button type="button" className={selectedRole === "parent" ? "selected" : ""} onClick={() => setSelectedRole("parent")}>Parent</button><button type="button" className={selectedRole === "teacher" ? "selected" : ""} onClick={() => setSelectedRole("teacher")}>Coach</button></div><div className="grid gap-4 sm:grid-cols-2"><Input label="First name" value={form.firstName} onChange={set("firstName")} /><Input label="Last name" value={form.lastName} onChange={set("lastName")} /></div><Input label="Email address" type="email" value={form.email} onChange={set("email")} /><Input label="WhatsApp number" type="tel" value={form.whatsapp} onChange={set("whatsapp")} />{type === "teacher" && <Input label="Specialisation (e.g. Mathematics, Physics, Grade 10)" value={form.specialization} onChange={set("specialization")} />}{(type === "parent" || type === "iep") && <div className="grid gap-4 sm:grid-cols-2"><Input label="Child’s name" value={form.childName} onChange={set("childName")} /><Input label="Child’s grade" value={form.childGradeLevel} onChange={set("childGradeLevel")} /></div>}{type === "course" && <label className="block"><span className="mb-2 block text-sm font-bold text-slate-200">Learning package</span><select value={form.selectedPackage} onChange={(e) => set("selectedPackage")(e.target.value)} className="w-full rounded-[1.25rem] border border-white/10 bg-slate-950/60 px-5 py-4 text-white outline-none"><option value="computer_packages">Computer Packages</option><option value="coding_ai_training">Coding and AI Training</option><option value="both">Both Packages</option></select></label>}{(statusMessage || error) && <Notice tone={error ? "error" : "info"}>{error || statusMessage}</Notice>}<ActionButton disabled={busy} type="submit" className="w-full">{busy ? "Sending code..." : "Create account"}</ActionButton><div className="relative py-3 text-center text-xs font-black uppercase tracking-widest text-slate-500"><span className="bg-slate-950 px-3">or sign up with Google</span><span className="absolute inset-x-0 top-1/2 -z-10 border-t border-white/10" /></div><SocialButtons mode="register" role={selectedRole} /></form></AuthShell>;
}

function VerifyPage({ pendingVerification, onVerify, statusMessage }) {
  const [code, setCode] = useState(""); const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const submit = async (event) => { event.preventDefault(); setBusy(true); setError(""); try { await onVerify({ ...pendingVerification, code }); } catch (err) { setError(err.message); } finally { setBusy(false); } };
  return <AuthShell><form className="space-y-5" onSubmit={submit}><h1>Verify Email</h1><label className="block"><span className="mb-2 block text-sm font-bold text-slate-200">Six-digit code</span><input autoFocus required inputMode="numeric" maxLength="6" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} className="w-full rounded-[1.25rem] border border-cyan-300/30 bg-slate-950/60 px-5 py-5 text-center text-3xl font-black tracking-[.45em] text-white outline-none focus:border-cyan-300" placeholder="000000" /></label>{(error || statusMessage) && <Notice tone={error ? "error" : "info"}>{error || statusMessage}</Notice>}<ActionButton disabled={busy || code.length < 4} type="submit" className="w-full">{busy ? "Verifying..." : "Verify email"}</ActionButton></form></AuthShell>;
}

function PreviewDashboard({ goTo, onStartStudent }) {
  const [role, setRole] = useState("parent");
  const [aiStartedAt, setAiStartedAt] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(180);
  const roles = {
    parent: { name: "Amina Otieno", title: "Parent dashboard", accent: "#8b5cf6", stat: "3 learners", note: "Track progress and connect with trusted teachers." },
    teacher: { name: "James Mwangi", title: "Teacher dashboard", accent: "#ec4899", stat: "24 learners", note: "Organise classes, share assignments, and guide every learner." },
    student: { name: "Brian Kamau", title: "Student dashboard", accent: "#f59e0b", stat: "Grade 8", note: "Learn step by step, practise, and ask for support." },
  };
  const current = roles[role];
  useEffect(() => {
    if (!aiStartedAt) return undefined;
    const timer = setInterval(() => {
      const remaining = Math.max(0, 180 - Math.floor((Date.now() - aiStartedAt) / 1000));
      setSecondsLeft(remaining);
      if (!remaining) { clearInterval(timer); setAiStartedAt(null); goTo("register"); }
    }, 1000);
    return () => clearInterval(timer);
  }, [aiStartedAt, goTo]);
  const startAi = () => { if (!aiStartedAt) { setAiStartedAt(Date.now()); setSecondsLeft(180); } };
  return <section className="preview-dashboard mx-auto max-w-6xl">
    <div className="preview-hero rounded-[2rem] p-6 shadow-sm sm:p-10">
      <div><p className="text-xs font-black uppercase tracking-[.28em] text-violet-600">QOOHI preview</p><h1 className="mt-3 text-3xl font-black text-slate-900 sm:text-5xl">See your learning world in one place.</h1><p className="mt-4 max-w-2xl text-slate-600">Explore a realistic {current.title.toLowerCase()} before you register. Your data and progress will be private to your account.</p></div>
      <div className="preview-avatar" style={{ background: current.accent }}>{current.name[0]}</div>
    </div>
    <div className="mt-5 flex gap-2 rounded-2xl bg-white p-2 shadow-sm" role="tablist">{Object.entries(roles).map(([key, item]) => <button key={key} type="button" onClick={() => setRole(key)} className={`flex-1 rounded-xl px-3 py-3 text-sm font-black capitalize transition ${role === key ? "text-white shadow" : "text-slate-500 hover:bg-violet-50"}`} style={role === key ? { background: item.accent } : undefined}>{key}</button>)}</div>
    <div className="mt-4 flex justify-end"><button type="button" onClick={role === "student" ? onStartStudent : () => goTo("register")} className="rounded-full bg-violet-600 px-5 py-2.5 text-sm font-black text-white">Register as {role}</button></div>
    <div className="mt-5 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="preview-card relative rounded-[1.5rem] bg-white p-6 shadow-sm"><span className="preview-tap-hint">☝</span><p className="text-sm font-bold text-slate-500">Welcome back</p><h2 className="mt-2 text-2xl font-black text-slate-900">{current.name}</h2><p className="mt-1 text-sm text-slate-500">{current.note}</p><div className="mt-6 flex items-end justify-between"><strong className="text-3xl font-black" style={{ color: current.accent }}>{current.stat}</strong><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">On track</span></div></div>
        <div className="preview-card rounded-[1.5rem] bg-white p-6 shadow-sm"><p className="text-sm font-bold text-slate-500">Weekly activity</p><div className="mt-6 flex h-24 items-end gap-2">{[35,62,48,80,55,72,90].map((height, index) => <span key={index} className="flex-1 rounded-t-lg" style={{ height: `${height}%`, background: index === 6 ? current.accent : "#ddd6fe" }} />)}</div><p className="mt-3 text-xs font-bold text-slate-400">Learning minutes · 7 day view</p></div>
        <div className="preview-card rounded-[1.5rem] bg-white p-6 shadow-sm sm:col-span-2"><div className="flex items-center justify-between"><div><p className="text-xs font-black uppercase tracking-[.2em] text-violet-600">AI learning coach</p><h2 className="mt-2 text-xl font-black text-slate-900">Personalised lessons and quizzes</h2></div><span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-black text-violet-700">3 min free</span></div><p className="mt-3 text-sm text-slate-500">Choose a subject, grade, and topic. QOOHI teaches in sequence and checks understanding after each section.</p><button type="button" onClick={startAi} className="mt-5 rounded-full bg-violet-600 px-5 py-3 text-sm font-black text-white hover:bg-violet-700">{aiStartedAt ? `AI preview · ${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")}` : "Try AI teaching"}</button></div>
      </div>
      <div className="preview-card rounded-[1.5rem] bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-xs font-black uppercase tracking-[.2em] text-amber-600">IEP BOOK</p><h2 className="mt-2 text-2xl font-black text-slate-900">Kenyan CBC learning book</h2></div><span className="text-3xl">📚</span></div><p className="mt-4 text-sm text-slate-500">Structured lessons, inclusive activities, revision checks, and parent-friendly progress notes.</p><div className="mt-6 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 p-5 text-white"><p className="text-xs font-black uppercase tracking-widest text-white/75">Preview copy</p><p className="mt-2 text-lg font-black">Grade 6 · Mathematics</p><p className="mt-1 text-sm text-white/80">Fractions and problem solving</p></div><button type="button" onClick={() => goTo("login")} className="mt-5 w-full rounded-full border border-violet-200 bg-violet-50 px-5 py-3 text-sm font-black text-violet-700 hover:bg-violet-100">Register to download</button></div>
    </div>
  </section>;
}

function DashboardPage({
  dashboard,
  teacherOverview,
  onUpdateIep,
  loading,
  logout,
  goTo,
  sessionToken,
  onRefresh,
  availableDashboards,
  onSwitchDashboard,
  openParentRegistration,
  unreadNotifs,
  openChat,
}) {
  const [showMessages, setShowMessages] = useState(false);
  const [editingIep, setEditingIep] = useState(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileTab, setProfileTab] = useState("view");
  const [activeSection, setActiveSection] = useState("profile");
  const [profileStatus, setProfileStatus] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [submittingDeposit, setSubmittingDeposit] = useState(false);
  const [submittingWithdraw, setSubmittingWithdraw] = useState(false);
  const [profileDraft, setProfileDraft] = useState({
    fullName: "",
    whatsapp: "",
    avatarUrl: "",
  });
  const [cropFile, setCropFile] = useState(null);
  const [depositForm, setDepositForm] = useState({ phone: "", amount: "" });
  const [depositResult, setDepositResult] = useState(null);
  const [withdrawForm, setWithdrawForm] = useState({
    amount: "",
    mpesaName: "",
    mpesaNumber: "",
  });
  const [teacherUpdates, setTeacherUpdates] = useState([]);

  useEffect(() => {
    if (!dashboard?.student) return;
    setProfileDraft({
      fullName: dashboard.student.fullName || "",
      whatsapp: dashboard.student.whatsapp || "",
      avatarUrl: dashboard.student.avatarUrl || "",
    });
  }, [dashboard]);

  useEffect(() => {
    if (dashboard?.student?.role !== "parent" || !sessionToken) { setTeacherUpdates([]); return; }
    fetchJson("/api/parent/teacher-updates", { headers: { Authorization: `Bearer ${sessionToken}` } })
      .then((data) => setTeacherUpdates(data.updates || []))
      .catch(() => setTeacherUpdates([]));
  }, [dashboard, sessionToken]);

  if (loading) {
    return (
      <CenteredPanel
        eyebrow="Dashboard"
        title="Syncing your profile"
        subtitle="Retrieving your personalized learning and account view..."
      />
    );
  }

  if (!dashboard) {
    return (
      <CenteredPanel
        eyebrow="Dashboard"
        title="No active session"
        subtitle="Please register or log in to access your dashboard."
      />
    );
  }

  const enrollments = Array.isArray(dashboard.enrollments) ? dashboard.enrollments : [];
  const messages = Array.isArray(dashboard.messages) ? dashboard.messages : [];
  const role = dashboard.student?.role || "student";
  const isTeacher = role === "teacher";
  const isParent = role === "parent";
  const isStudent = role === "student";
  const assessmentStatus = dashboard.student?.assessmentStatus || "waiting";
  const performanceLevel = dashboard.student?.performanceLevel || 0;
  const balance = Number(dashboard.student?.balance || 0);
  const serviceCharges = Array.isArray(dashboard.serviceCharges) ? dashboard.serviceCharges : [];
  const recentTransactions = Array.isArray(dashboard.recentTransactions) ? dashboard.recentTransactions : [];
  const recentDeposits = Array.isArray(dashboard.deposits) ? dashboard.deposits : [];
  const recentWithdrawals = Array.isArray(dashboard.withdrawals) ? dashboard.withdrawals : [];
  const profileAvatar = profileDraft.avatarUrl || dashboard.student?.avatarUrl || "";
  const fullName = profileDraft.fullName || dashboard.student.fullName;
  const hasCourses = enrollments.length > 0;
  const hasTournament = !!dashboard.tournamentRegistration;
  const canAfford = (charge) => Number(charge || 0) <= 0 || balance >= Number(charge || 0);
  const authHeaders = sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {};
  const profileUpdateCharge = Number(
    serviceCharges.find((service) => service.service_key === "profile_update")?.charge_ksh || 0,
  );
  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);
  const firstName = fullName?.split(" ")[0] || "";

  const parentChildren = teacherOverview
    ? (teacherOverview.children || []).map((c) => ({
        id: `ps_${c.id}`,
        full_name: c.child_name,
        email: c.parent_email || "",
        grade_level: c.grade_level,
        goals: c.goals,
        balance: 0,
        performance_level: c.performance_level || 0,
        assessment_status: c.assessment_status || "waiting",
        isParentStudent: true,
        parent_name: c.parent_name,
        parent_whatsapp: c.parent_whatsapp,
      }))
    : [];

  const enrolledStudents = teacherOverview
    ? (teacherOverview.groups
        ?.filter((g) => !["teacher", "parent"].includes(g.key))
        .flatMap((g) => g.members) || [])
        .filter((v, i, a) => a.findIndex((t) => t.id === v.id) === i)
    : [];

  const workspaceStudents = teacherOverview?.students || [];
  const allStudents = [...parentChildren, ...enrolledStudents, ...workspaceStudents, ...(teacherOverview?.institutionLearners || [])]
    .filter((v, i, a) => a.findIndex((t) => String(t.id) === String(v.id)) === i);

  const serviceActions = {
    computer_packages: { route: "learn", label: "Open Courses" },
    coding_ai_training: { route: "learn", label: "Open Courses" },
    both: { route: "learn", label: "Open Courses" },
    tournament_entry: { route: "new", label: "Join Tournament" },
    ai_chat: { route: "qoohiai", label: "Open AI" },
    resume_generation: { route: "qoohiai", label: "Build Resume" },
    cyber_services: { route: "contact", label: "Open Support" },
    iep_assessment: { route: "iep", label: "Take Assessment" },
    teacher_registration: { route: "teachers", label: "Open Coaches" },
    parent_registration: { route: "resources", label: "Open Resources" },
    profile_update: { route: null, label: "Edit Profile" },
  };

  const sidebarNav = [
    { id: "profile", Icon: FaUserGraduate, label: "Profile" },
    { id: "balance", Icon: FaWallet, label: "Balance" },
    { id: "services", Icon: FaLayerGroup, label: "Services" },
    { id: "activity", Icon: FaHistory, label: "Activity" },
    ...(hasCourses ? [{ id: "courses", Icon: FaBookOpen, label: "Courses" }] : []),
    ...(isStudent && assessmentStatus === "completed" ? [{ id: "roadmap", Icon: FaGraduationCap, label: "Roadmap" }] : []),
    ...(isTeacher ? [{ id: "classes", Icon: FaBookOpen, label: "Classes" }] : []),
    ...(isTeacher ? [{ id: "roster", Icon: FaChalkboardTeacher, label: "Roster" }] : []),
    ...(isTeacher ? [{ id: "teach-a-child", Icon: FaUserGraduate, label: "Teach a child" }] : []),
    ...(isTeacher ? [{ id: "specializations", Icon: FaLayerGroup, label: "Specializations" }] : []),
    ...(isParent ? [{ id: "parent", Icon: FaUsers, label: "Support" }] : []),
    ...(isParent ? [{ id: "register-child", Icon: FaUserGraduate, label: "Register Your Child" }] : []),
    ...((isParent || isStudent) ? [{ id: "classes", Icon: FaBookOpen, label: "Classes" }] : []),
    ...(isParent ? [{ id: "materials", Icon: FaBookOpen, label: "IEP BOOK" }] : []),
    ...((isParent || isStudent) ? [{ id: "teacher", Icon: FaChalkboardTeacher, label: "MY TEACHER" }] : []),
  ];

  const openProfile = (tab = "view") => {
    setProfileTab(tab);
    setProfileStatus("");
    setProfileModalOpen(true);
  };

  const handleAvatarFile = (file) => {
    if (!file) return;
    setCropFile(file);
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setSavingProfile(true);
    setProfileStatus("");
    try {
      if (profileUpdateCharge > 0) {
        await fetchJson("/api/user/service/use", {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({ serviceKey: "profile_update" }),
        });
      }
      await fetchJson("/api/user/profile", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          fullName: profileDraft.fullName,
          whatsapp: profileDraft.whatsapp,
          avatarUrl: profileDraft.avatarUrl,
        }),
      });
      await onRefresh?.();
      setProfileStatus("Profile updated.");
      setProfileTab("view");
    } catch (err) {
      setProfileStatus(err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const submitDeposit = async (event) => {
    event.preventDefault();
    setSubmittingDeposit(true);
    setProfileStatus("");
    setDepositResult(null);
    try {
      const response = await fetch(`${MPESA_API_BASE}/api/mpesa/stk-push`, {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${sessionToken}` },
        body: JSON.stringify({ phone: depositForm.phone, amount: Number(depositForm.amount), accountReference: dashboard.student.email, description: "QOOHI wallet deposit" }),
      });
      const res = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(res.error || "Could not send STK Push.");
      setDepositForm({ phone: "", amount: "" });
      setDepositResult(res);
      await onRefresh?.();
    } catch (err) {
      setProfileStatus(err.message);
    } finally {
      setSubmittingDeposit(false);
    }
  };

  const submitWithdraw = async (event) => {
    event.preventDefault();
    setSubmittingWithdraw(true);
    setProfileStatus("");
    try {
      await fetchJson("/api/withdraw/request", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          amount: withdrawForm.amount,
          mpesaName: withdrawForm.mpesaName,
          mpesaNumber: withdrawForm.mpesaNumber,
        }),
      });
      setWithdrawForm({ amount: "", mpesaName: "", mpesaNumber: "" });
      setProfileStatus("Withdrawal request submitted.");
      await onRefresh?.();
      setProfileTab("view");
    } catch (err) {
      setProfileStatus(err.message);
    } finally {
      setSubmittingWithdraw(false);
    }
  };

  return (
    <PageStack
      title={fullName ? `${fullName}'s Dashboard` : `${roleLabel} Dashboard`}
      subtitle={`${roleLabel} workspace`}
      compact
      showPlatformLabel={false}
    >
      <div className="mb-4 flex justify-end"><button type="button" aria-label="Notifications" onClick={() => unreadNotifs?.[0] && openChat?.(unreadNotifs[0].from_user_id, unreadNotifs[0].from_name)} className="relative rounded-full border border-violet-200 bg-white px-4 py-2 text-xl shadow-sm">🔔{unreadNotifs?.length > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white">{unreadNotifs.length}</span>}</button></div>
      {cropFile && <ImageCropModal file={cropFile} onCancel={() => setCropFile(null)} onConfirm={(avatarUrl) => { setProfileDraft((current) => ({ ...current, avatarUrl })); setCropFile(null); }} />}
      {unreadNotifs?.length > 0 && (
        <div className="mb-4 space-y-2">
          {unreadNotifs.map((n, i) => (
            <button
              key={i}
              type="button"
              onClick={() => openChat?.(n.from_user_id, n.from_name)}
              className="flex w-full items-center gap-3 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-5 py-3 text-left transition hover:bg-cyan-500/20"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-400 text-xs font-black text-slate-950">{n.count}</span>
              <div>
                <p className="text-sm font-bold text-white">Message from {n.from_name}</p>
                <p className="text-xs text-cyan-200">Click to open chat</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* ── Dashboard Sidebar Layout ── */}
      <div className="flex flex-row gap-3 sm:gap-6">

        {/* Left Sidebar */}
        <aside className="sticky top-24 flex w-16 flex-shrink-0 flex-col sm:w-52">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/90 backdrop-blur-xl">
            <div className="border-b border-white/10 p-2 sm:p-4">
              <button type="button" aria-label={`${firstName || fullName || roleLabel} profile`} title={firstName || fullName || roleLabel} onClick={() => setActiveSection("profile")} className="group flex w-full items-center justify-center gap-3 text-left sm:justify-start">
                <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full border-2 border-white/20 bg-slate-800 transition group-hover:border-cyan-400/40">
                  {profileAvatar
                    ? <img src={profileAvatar} alt="" className="h-full w-full object-cover" />
                    : <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-cyan-800 to-blue-900 text-sm font-black text-cyan-200">{fullName?.[0]?.toUpperCase() || "Q"}</div>
                  }
                </div>
                <div className="hidden min-w-0 sm:block">
                  <p className="truncate text-sm font-bold text-white">{firstName || fullName}</p>
                  <p className="truncate text-[10px] capitalize text-slate-500">{roleLabel}</p>
                </div>
              </button>
              <div className="mt-3 hidden items-center justify-between rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 sm:flex">
                <span className="text-[10px] text-slate-500">Balance</span>
                <span className="text-sm font-black text-cyan-300">Ksh {balance.toLocaleString()}</span>
              </div>
            </div>
            <nav className="space-y-0.5 p-2">
              {sidebarNav.map(({ id, Icon, label }) => (
                <button key={id} type="button" onClick={() => setActiveSection(id)}
                  className={`flex w-full items-center justify-center gap-3 rounded-xl px-2 py-3 text-left text-sm transition sm:justify-start sm:px-3 sm:py-2.5 ${
                    activeSection === id
                      ? "bg-cyan-500/20 font-bold text-cyan-300"
                      : "font-medium text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className={`flex-shrink-0 text-[15px] ${activeSection === id ? "text-cyan-400" : "text-slate-600"}`} />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </nav>
            {availableDashboards?.length > 1 && (
              <div className="border-t border-white/10 p-2">
                <p className="px-3 pb-1 text-[10px] font-black uppercase tracking-widest text-slate-600">Switch dashboard</p>
                {availableDashboards.map((item) => (
                  <button key={item.role} type="button" onClick={() => onSwitchDashboard?.(item.role)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-xs font-bold text-cyan-300 transition hover:bg-cyan-500/10">
                    <span className="hidden sm:inline">{item.role === "teacher" ? "Coach dashboard" : "Parent dashboard"}</span><span className="sm:hidden">{item.role === "teacher" ? "C" : "P"}</span>
                  </button>
                ))}
              </div>
            )}
            <div className="border-t border-white/10 p-2">
              <button type="button" aria-label="Sign Out" title="Sign Out" onClick={logout}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-400 transition hover:bg-rose-500/10"
              >
                <FaMinusCircle className="flex-shrink-0 text-[15px]" /> Sign Out
              </button>
            </div>
          </div>
        </aside>



        {/* Section Content */}
        <div className="min-w-0 flex-1">

          {/* PROFILE section */}
          {activeSection === "profile" && (
            <GlassPanel className="mx-auto max-w-xl p-6 sm:p-8">
              <div className="flex flex-col items-center text-center"><div className="relative h-24 w-24"><div className="h-24 w-24 overflow-hidden rounded-full border-2 border-white/15 bg-slate-800">{profileAvatar ? <img src={profileAvatar} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-3xl font-black text-cyan-300">{fullName?.[0]?.toUpperCase() || "Q"}</div>}</div><label className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-cyan-400 text-slate-950 shadow-lg"><FaEdit className="text-xs" /><input type="file" accept="image/*" className="hidden" onChange={(event) => handleAvatarFile(event.target.files?.[0])} /></label></div><h3 className="mt-4 text-xl font-black text-white">Edit Profile</h3></div>
              <form className="mt-8 space-y-5" onSubmit={saveProfile}><Input label="Full name" value={profileDraft.fullName} onChange={(value) => setProfileDraft((current) => ({ ...current, fullName: value }))} /><Input label="WhatsApp number" value={profileDraft.whatsapp} onChange={(value) => setProfileDraft((current) => ({ ...current, whatsapp: value }))} /><div className="rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-500">{dashboard.student.email}</div>{profileStatus && <p className="text-sm text-emerald-400">{profileStatus}</p>}<ActionButton type="submit" disabled={savingProfile} className="w-full">{savingProfile ? "Saving..." : "Save Changes"}</ActionButton></form>
            </GlassPanel>
          )}

          {false && activeSection === "profile" && (
            <div className="space-y-6">
              <div className="overflow-hidden rounded-[2rem] border border-white/15 bg-slate-900/80 shadow-2xl shadow-black/40 backdrop-blur-xl">
                {/* Cover banner */}
        <div className="relative h-44 bg-gradient-to-br from-cyan-700/50 via-blue-700/40 to-indigo-900/60">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(34,211,238,0.25),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(99,102,241,0.3),transparent_55%)]" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMxLjIgMCAyLjQtLjUgMy4yLTEuNHMxLjMtMi4xIDEuMy0zLjMtLjUtMi40LTEuMy0zLjItMS45LTEuMy0zLjItMS4zLTIuNC41LTMuMiAxLjMtMS4zIDItMS4zIDMuMi41IDIuNCAxLjMgMy4yIDEuOSAxLjMgMy4yIDEuM3ptLTEyIDBjMS4yIDAgMi40LS41IDMuMi0xLjRzMS4zLTIuMSAxLjMtMy4zLS41LTIuNC0xLjMtMy4yLTEuOS0xLjMtMy4yLTEuMy0yLjQuNS0zLjIgMS4zLTEuMyAyLTEuMyAzLjIuNSAyLjQgMS4zIDMuMiAxLjkgMS4zIDMuMiAxLjN6IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIi8+PC9nPjwvc3ZnPg==')] opacity-40" />
        </div>

        <div className="px-6 pb-8 sm:px-10">
          {/* Avatar + action row */}
          <div className="-mt-16 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            {/* Avatar */}
            <button
              type="button"
              onClick={() => openProfile("view")}
              className="group relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-full border-4 border-slate-900 bg-slate-800 shadow-2xl shadow-black/60 transition-transform hover:scale-105"
            >
              {profileAvatar ? (
                <img src={profileAvatar} alt={fullName} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-cyan-800 to-blue-900 text-4xl font-black text-cyan-200">
                  {fullName?.[0]?.toUpperCase() || "Q"}
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all group-hover:bg-black/40">
                <FaEdit className="scale-0 text-xl text-white transition-transform group-hover:scale-100" />
              </div>
            </button>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 pb-1">
              <button
                type="button"
                onClick={() => openProfile("edit")}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-bold text-white backdrop-blur-sm transition hover:border-white/30 hover:bg-white/15"
              >
                <FaEdit className="text-xs" /> Edit Profile
              </button>
              <button
                type="button"
                onClick={() => openProfile("deposit")}
                className="inline-flex items-center gap-2 rounded-full bg-cyan-500 px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
              >
                <FaWallet className="text-xs" /> Deposit
              </button>
              <button
                type="button"
                onClick={() => openProfile("withdraw")}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-bold text-white backdrop-blur-sm transition hover:border-white/30 hover:bg-white/15"
              >
                <FaMinusCircle className="text-xs" /> Withdraw
              </button>
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-5 py-2.5 text-sm font-bold text-rose-300 transition hover:bg-rose-500/20"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Name + info */}
          <div className="mt-5">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">{fullName}</h2>
              <span className="rounded-full bg-cyan-500/20 px-3 py-1 text-xs font-black uppercase tracking-widest text-cyan-300">
                {roleLabel}
              </span>
              {assessmentStatus === "completed" && (
                <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-black uppercase tracking-widest text-emerald-300">
                  Level {performanceLevel}
                </span>
              )}
            </div>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
              {isTeacher
                ? "Coach · Tracking learners, updating IEPs, and sending focused guidance."
                : isParent
                  ? "Parent · Account balance, messages, and learner support hub."
                  : "Student · Learning progress, balance, and premium services."}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-slate-500">
              <span className="flex items-center gap-1.5"><FaEnvelope className="text-xs text-slate-600" />{dashboard.student.email}</span>
              {dashboard.student.whatsapp && (
                <span className="flex items-center gap-1.5"><FaWhatsapp className="text-xs text-slate-600" />{dashboard.student.whatsapp}</span>
              )}
              {profileUpdateCharge > 0 && (
                <span className="text-amber-400/80">Profile edits cost Ksh {profileUpdateCharge.toLocaleString()}</span>
              )}
            </div>
          </div>

          {/* LinkedIn-style stat pills */}
          <div className="mt-6 flex flex-wrap gap-3 border-t border-white/10 pt-6">
            {[
              { label: "Balance", value: `Ksh ${balance.toLocaleString()}`, color: "text-cyan-300", bg: "bg-cyan-500/10 border-cyan-500/20" },
              { label: "Courses", value: enrollments.length, color: "text-white", bg: "bg-white/5 border-white/10" },
              { label: "Messages", value: messages.length, color: "text-white", bg: "bg-white/5 border-white/10" },
              { label: "Status", value: assessmentStatus === "completed" ? "Assessed" : "Pending", color: assessmentStatus === "completed" ? "text-emerald-300" : "text-amber-300", bg: assessmentStatus === "completed" ? "bg-emerald-500/10 border-emerald-500/20" : "bg-amber-500/10 border-amber-500/20" },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className={`flex items-center gap-2 rounded-full border px-4 py-2 ${bg}`}>
                <span className="text-xs font-semibold text-slate-500">{label}</span>
                <span className={`text-sm font-black ${color}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Content Grid ── */}
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">

        {/* Left: Role-specific content */}
        <div className="space-y-6">

          {/* Course messages */}
          {hasCourses && (
            <GlassPanel className="p-6 sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <SectionLabel>Course Admin</SectionLabel>
                  <h3 className="mt-2 text-xl font-black text-white">Materials & Updates</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMessages(!showMessages)}
                  className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-cyan-300 transition hover:bg-cyan-400/20"
                >
                  {showMessages ? "Hide" : "View All"}
                </button>
              </div>
              {!showMessages && (
                <p className="mt-3 text-sm text-slate-500">{messages.length} message{messages.length !== 1 ? "s" : ""} from your instructor.</p>
              )}
              {showMessages && (
                <div className="mt-5 space-y-3">
                  {messages.length === 0 && (
                    <p className="rounded-2xl border border-white/5 bg-white/5 px-5 py-4 text-sm text-slate-500">No messages yet.</p>
                  )}
                  {messages.map((message) => (
                    <div key={message.id} className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
                      <h4 className="font-bold text-white">{message.subject}</h4>
                      <p className="mt-2 text-sm leading-6 text-slate-400">{message.body}</p>
                      {message.pdfLinks.map((link, idx) => (
                        <a key={idx} href={link} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-white transition">
                          <FaLink /> Open Material
                        </a>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </GlassPanel>
          )}

          {isStudent && assessmentStatus === "completed" && <StudentDashboard view="overview" performanceLevel={performanceLevel} />}

          {isTeacher && <TeacherDashboard view="overview" students={allStudents} editingIep={editingIep} setEditingIep={setEditingIep} onUpdateIep={onUpdateIep} />}

          {isParent && <ParentDashboard view="overview" onNavigate={setActiveSection} />}

          {/* Tournament standings */}
          {false && hasTournament && (
            <GlassPanel className="p-6 sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <SectionLabel>E-Sports</SectionLabel>
                  <h3 className="mt-2 text-xl font-black text-white">{tournamentInfo.title}</h3>
                </div>
                <FaTrophy className="text-3xl text-amber-300" />
              </div>
              {dashboard.tournament && (
                <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/5 text-[10px] uppercase tracking-widest text-slate-500">
                        <th className="px-4 py-3">Player</th>
                        <th className="px-4 py-3">P</th>
                        <th className="px-4 py-3">GD</th>
                        <th className="px-4 py-3 font-black text-amber-400">Pts</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {dashboard.tournament.standings.map((row, i) => (
                        <tr key={row.registrationId} className={`transition hover:bg-white/5 ${i === 0 ? "bg-amber-500/5" : ""}`}>
                          <td className="px-4 py-3">
                            <span className="font-semibold text-white">{i + 1}. {row.name}</span>
                          </td>
                          <td className="px-4 py-3 text-slate-400">{row.played}</td>
                          <td className="px-4 py-3 text-slate-400">{row.goalDifference}</td>
                          <td className="px-4 py-3 font-black text-amber-300">{row.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </GlassPanel>
          )}
        </div>

        {/* Right sidebar: Balance + Services + Activity */}
        <div className="space-y-6">

          {/* Balance card */}
          <div className="overflow-hidden rounded-[2rem] border border-cyan-500/20 bg-gradient-to-br from-cyan-900/40 to-blue-900/40 p-6 shadow-xl backdrop-blur-xl">
            <p className="text-xs font-black uppercase tracking-widest text-cyan-400">Account Balance</p>
            <p className="mt-3 text-5xl font-black text-white">Ksh {balance.toLocaleString()}</p>
            <p className="mt-1 text-sm text-cyan-400/60">Available funds</p>
            <div className="mt-6 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => openProfile("deposit")}
                className="flex items-center justify-center gap-2 rounded-2xl bg-cyan-500 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-400"
              >
                <FaWallet /> Deposit
              </button>
              <button
                type="button"
                onClick={() => openProfile("withdraw")}
                className="flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
              >
                <FaMinusCircle /> Withdraw
              </button>
            </div>
          </div>

          {/* Activity section */}

          {/* Recent activity */}
          <GlassPanel className="p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <SectionLabel>Activity</SectionLabel>
                <h3 className="mt-1 text-lg font-black text-white">Recent transactions</h3>
              </div>
              <FaHistory className="text-lg text-cyan-400/60" />
            </div>
            <div className="mt-4 space-y-2">
              {recentTransactions.slice(0, 6).map((item) => {
                const amt = Number(item.amount || 0);
                const positive = amt >= 0;
                return (
                  <div key={item.id} className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
                    <div className={`h-8 w-8 flex-shrink-0 rounded-full flex items-center justify-center text-xs ${positive ? "bg-emerald-500/15 text-emerald-400" : "bg-rose-500/15 text-rose-400"}`}>
                      {positive ? "+" : "−"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white truncate">{item.description || item.type}</p>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-600">{item.type}</p>
                    </div>
                    <p className={`text-sm font-black flex-shrink-0 ${positive ? "text-emerald-300" : "text-rose-300"}`}>
                      {positive ? "+" : "−"}Ksh {Math.abs(amt).toLocaleString()}
                    </p>
                  </div>
                );
              })}
              {recentTransactions.length === 0 && (
                <p className="rounded-2xl border border-white/5 bg-white/5 px-4 py-5 text-sm text-slate-500">No activity yet. Deposit to get started.</p>
              )}
            </div>
          </GlassPanel>
        </div>
      </div>
            </div>
          )}

          {/* BALANCE section */}
          {activeSection === "balance" && (
            <div className="space-y-6">
              <div className="overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/90 to-slate-800/80 p-8 backdrop-blur-xl">
                <SectionLabel>Account Balance</SectionLabel>
                <p className="mt-3 text-6xl font-black text-white">Ksh {balance.toLocaleString()}</p>
                <p className="mt-1 text-sm text-slate-500">Available funds</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button type="button" onClick={() => openProfile("deposit")} className="inline-flex items-center gap-2 rounded-full bg-cyan-500 px-6 py-3 font-bold text-slate-950 transition hover:bg-cyan-400">
                    <FaWallet /> Deposit via M-Pesa
                  </button>
                  <button type="button" onClick={() => openProfile("withdraw")} className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 font-bold text-white transition hover:bg-white/15">
                    <FaMinusCircle /> Withdraw
                  </button>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <GlassPanel className="p-6">
                  <p className="mb-4 text-xs font-black uppercase tracking-widest text-cyan-400">Deposits</p>
                  <div className="space-y-2">
                    {recentDeposits.length === 0
                      ? <p className="text-sm text-slate-600">No deposits yet.</p>
                      : recentDeposits.map(item => (
                        <div key={item.id} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3">
                          <span className={`text-xs font-bold uppercase ${item.status === "verified" ? "text-emerald-400" : item.status === "rejected" ? "text-rose-400" : "text-amber-400"}`}>{item.status}</span>
                          <span className="font-bold text-white">Ksh {Number(item.amount || 0).toLocaleString()}</span>
                        </div>
                      ))}
                  </div>
                </GlassPanel>
                <GlassPanel className="p-6">
                  <p className="mb-4 text-xs font-black uppercase tracking-widest text-rose-400">Withdrawals</p>
                  <div className="space-y-2">
                    {recentWithdrawals.length === 0
                      ? <p className="text-sm text-slate-600">No withdrawals yet.</p>
                      : recentWithdrawals.map(item => (
                        <div key={item.id} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3">
                          <span className={`text-xs font-bold uppercase ${item.status === "processed" ? "text-emerald-400" : item.status === "rejected" ? "text-rose-400" : "text-amber-400"}`}>{item.status}</span>
                          <span className="font-bold text-white">Ksh {Number(item.amount || 0).toLocaleString()}</span>
                        </div>
                      ))}
                  </div>
                </GlassPanel>
              </div>
              <GlassPanel className="p-6">
                <p className="mb-4 text-xs font-black uppercase tracking-widest text-cyan-400">Transaction History</p>
                <div className="space-y-2">
                  {recentTransactions.length === 0
                    ? <p className="py-8 text-center text-sm text-slate-600">No transactions yet.</p>
                    : recentTransactions.map(item => {
                        const amt = Number(item.amount || 0);
                        return (
                          <div key={item.id} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 px-4 py-3">
                            <div className={`h-8 w-8 flex-shrink-0 rounded-full flex items-center justify-center text-xs ${amt >= 0 ? "bg-emerald-500/15 text-emerald-400" : "bg-rose-500/15 text-rose-400"}`}>{amt >= 0 ? "+" : "−"}</div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-bold text-white">{item.description || item.type}</p>
                              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-600">{item.type}</p>
                            </div>
                            <p className={`flex-shrink-0 text-sm font-black ${amt >= 0 ? "text-emerald-300" : "text-rose-300"}`}>{amt >= 0 ? "+" : "−"}Ksh {Math.abs(amt).toLocaleString()}</p>
                          </div>
                        );
                      })}
                </div>
              </GlassPanel>
            </div>
          )}

          {/* SERVICES section */}
          {activeSection === "services" && (
            <GlassPanel className="p-6 sm:p-8">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <SectionLabel>Platform Services</SectionLabel>
                  <h3 className="mt-2 text-2xl font-black text-white">Available charges</h3>
                </div>
                <button type="button" onClick={() => openProfile("deposit")} className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-cyan-400 transition hover:bg-cyan-500/20">Top Up</button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {serviceCharges.map((service) => {
                  const meta = serviceActions[service.service_key] || {};
                  const charge = Number(service.charge_ksh || 0);
                  const enabled = Number(service.active || 0) === 1;
                  const blocked = charge > 0 && !canAfford(charge);
                  return (
                    <button key={service.service_key} type="button" disabled={!enabled}
                      onClick={() => {
                        if (!enabled) return;
                        if (service.service_key === "profile_update") { openProfile("edit"); return; }
                        if (blocked) { openProfile("deposit"); return; }
                        if (meta.route) goTo(meta.route);
                      }}
                      className={`rounded-2xl border p-5 text-left transition ${!enabled ? "cursor-default border-white/5 bg-white/5 opacity-40" : blocked ? "cursor-pointer border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10" : "cursor-pointer border-white/10 bg-white/5 hover:border-cyan-400/30 hover:bg-cyan-400/5"}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-white">{service.label}</p>
                          <p className="mt-1 text-xs leading-5 text-slate-500">{service.description}</p>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <p className="text-lg font-black text-cyan-300">{charge > 0 ? `Ksh ${charge.toLocaleString()}` : "Free"}</p>
                          <p className={`text-[10px] font-bold uppercase tracking-wide ${!enabled ? "text-slate-600" : blocked ? "text-rose-400" : "text-emerald-400"}`}>{!enabled ? "Disabled" : blocked ? "Top up needed" : meta.label || "Available"}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
                {serviceCharges.length === 0 && <p className="col-span-2 py-8 text-center text-sm text-slate-600">No services configured.</p>}
              </div>
            </GlassPanel>
          )}

          {/* ACTIVITY section */}
          {activeSection === "activity" && (
            <GlassPanel className="p-6 sm:p-8">
              <SectionLabel>Activity Feed</SectionLabel>
              <h3 className="mt-2 mb-6 text-2xl font-black text-white">All transactions</h3>
              <div className="space-y-2">
                {recentTransactions.length === 0
                  ? <p className="py-12 text-center text-sm text-slate-600">No activity yet.</p>
                  : recentTransactions.map(item => {
                      const amt = Number(item.amount || 0);
                      return (
                        <div key={item.id} className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/5 px-5 py-4">
                          <div className={`h-10 w-10 flex-shrink-0 rounded-full flex items-center justify-center font-black ${amt >= 0 ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300"}`}>{amt >= 0 ? "+" : "−"}</div>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-white">{item.description || item.type}</p>
                            <p className="mt-0.5 text-xs uppercase tracking-wide text-slate-500">{item.type} · {item.status}</p>
                          </div>
                          <p className={`flex-shrink-0 text-lg font-black ${amt >= 0 ? "text-emerald-300" : "text-rose-300"}`}>{amt >= 0 ? "+" : "−"}Ksh {Math.abs(amt).toLocaleString()}</p>
                        </div>
                      );
                    })}
              </div>
            </GlassPanel>
          )}

          {/* COURSES section */}
          {activeSection === "courses" && (
            <GlassPanel className="p-6 sm:p-8">
              <SectionLabel>Course Admin</SectionLabel>
              <h3 className="mt-2 mb-6 text-2xl font-black text-white">Materials &amp; Updates</h3>
              <div className="space-y-4">
                {messages.length === 0
                  ? <p className="py-12 text-center text-sm text-slate-600">No messages from your instructor yet.</p>
                  : messages.map(message => (
                    <div key={message.id} className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
                      <h4 className="font-bold text-white">{message.subject}</h4>
                      <p className="mt-2 text-sm leading-6 text-slate-400">{message.body}</p>
                      {message.pdfLinks.map((link, idx) => (
                        <a key={idx} href={link} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-cyan-400 transition hover:text-white">
                          <FaLink /> Open Material
                        </a>
                      ))}
                    </div>
                  ))}
              </div>
            </GlassPanel>
          )}

          {activeSection === "roadmap" && <StudentDashboard view="roadmap" performanceLevel={performanceLevel} />}

          {activeSection === "roster" && <TeacherDashboard
            view="roster"
            students={allStudents}
            editingIep={editingIep}
            setEditingIep={setEditingIep}
            onUpdateIep={onUpdateIep}
            authHeaders={authHeaders}
            workspace={teacherOverview || {}}
            onRefresh={onRefresh}
            openChat={openChat}
            fetchJson={fetchJson}
          />}
          {activeSection === "classes" && isTeacher && <TeacherDashboard
            view="classes"
            authHeaders={authHeaders}
            workspace={teacherOverview || {}}
            onRefresh={onRefresh}
            fetchJson={fetchJson}
          />}
          {activeSection === "classes" && (isParent || isStudent) && <ParentDashboard
            view="classes"
            authHeaders={authHeaders}
            fetchJson={fetchJson}
          />}
          {activeSection === "teach-a-child" && <TeacherDashboard
            view="discover-learners"
            authHeaders={authHeaders}
            fetchJson={fetchJson}
          />}

          {activeSection === "parent" && <ParentDashboard view="parent" dashboard={dashboard} teacherUpdates={teacherUpdates} />}
          {activeSection === "register-child" && <ParentDashboard view="register-child" authHeaders={authHeaders} onRefresh={onRefresh} fetchJson={fetchJson} />}
          {activeSection === "materials" && <ParentDashboard view="materials" authHeaders={authHeaders} balance={balance} openProfile={openProfile} openChat={openChat} fetchJson={fetchJson} />}
          {activeSection === "teacher" && <ParentDashboard view="teacher" authHeaders={authHeaders} balance={balance} openProfile={openProfile} openChat={openChat} fetchJson={fetchJson} />}
          {activeSection === "specializations" && <TeacherDashboard
            view="specializations"
            specializations={dashboard.student?.specializations || ""}
            authHeaders={authHeaders}
            fetchJson={fetchJson}
          />}

          {/* TOURNAMENT section */}
          {false && activeSection === "tournament" && (
            <GlassPanel className="p-6 sm:p-8">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div><SectionLabel>E-Sports</SectionLabel><h3 className="mt-2 text-2xl font-black text-white">{tournamentInfo.title}</h3></div>
                <FaTrophy className="text-4xl text-amber-300" />
              </div>
              {dashboard.tournament ? (
                <div className="overflow-hidden rounded-2xl border border-white/10">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/5 text-[10px] uppercase tracking-widest text-slate-500">
                        <th className="px-5 py-3">#</th><th className="px-5 py-3">Player</th><th className="px-5 py-3">P</th><th className="px-5 py-3">GD</th><th className="px-5 py-3 text-amber-400">Pts</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {dashboard.tournament.standings.map((row, i) => (
                        <tr key={row.registrationId} className={`transition hover:bg-white/5 ${i === 0 ? "bg-amber-500/5" : ""}`}>
                          <td className="px-5 py-4 font-bold text-slate-500">{i + 1}</td>
                          <td className="px-5 py-4 font-semibold text-white">{row.name}</td>
                          <td className="px-5 py-4 text-slate-400">{row.played}</td>
                          <td className="px-5 py-4 text-slate-400">{row.goalDifference}</td>
                          <td className="px-5 py-4 font-black text-amber-300">{row.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-slate-500">No tournament data yet.</p>
              )}
            </GlassPanel>
          )}

        </div>
      </div>

      {/* ── Profile Modal ── */}
      {profileModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-xl">
          <div className="relative my-8 w-full max-w-4xl overflow-hidden rounded-[2rem] border border-white/15 bg-slate-950/98 shadow-2xl">

            {/* Modal header */}
            <div className="flex items-center justify-between gap-4 border-b border-white/10 px-6 py-5 sm:px-8">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 overflow-hidden rounded-full border border-white/15 bg-slate-800 flex-shrink-0">
                  {profileAvatar ? (
                    <img src={profileAvatar} alt={fullName} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-lg font-black text-cyan-300">{fullName?.[0] || "Q"}</div>
                  )}
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-cyan-400">{roleLabel}</p>
                  <h3 className="text-lg font-black text-white">{fullName}</h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setProfileModalOpen(false)}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition hover:bg-white/10"
              >
                ✕ Close
              </button>
            </div>

            {/* Tab bar */}
            <div className="flex gap-1 border-b border-white/10 px-6 py-3 sm:px-8">
              {[["view", "Overview"], ["edit", "Edit Profile"], ["deposit", "Deposit"], ["withdraw", "Withdraw"]].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => { setProfileTab(key); setProfileStatus(""); }}
                  className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-widest transition ${
                    profileTab === key
                      ? "bg-cyan-500 text-slate-950"
                      : "text-slate-400 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Modal body */}
            <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[280px_1fr]">

              {/* Left: profile summary */}
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center gap-3">
                    <div className="h-16 w-16 overflow-hidden rounded-full border border-white/15 bg-slate-800 flex-shrink-0">
                      {profileAvatar ? (
                        <img src={profileAvatar} alt={fullName} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xl font-black text-cyan-300">{fullName?.[0] || "Q"}</div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-white truncate">{fullName}</p>
                      <p className="text-xs text-slate-500 truncate">{dashboard.student.email}</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between rounded-xl bg-cyan-500/10 px-3 py-2">
                      <span className="text-xs text-slate-400">Balance</span>
                      <span className="text-sm font-black text-cyan-300">Ksh {balance.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2">
                      <span className="text-xs text-slate-400">WhatsApp</span>
                      <span className="text-sm font-bold text-white">{dashboard.student.whatsapp || "—"}</span>
                    </div>
                  </div>
                </div>

                {/* Deposits summary */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="text-xs font-black uppercase tracking-widest text-cyan-400 mb-3">Deposits</p>
                  <div className="space-y-2">
                    {recentDeposits.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-2 rounded-xl border border-white/5 bg-slate-950/60 px-3 py-2">
                        <span className="text-xs text-slate-400 capitalize">{item.status}</span>
                        <span className="text-xs font-bold text-white">Ksh {Number(item.amount || 0).toLocaleString()}</span>
                      </div>
                    ))}
                    {recentDeposits.length === 0 && <p className="text-xs text-slate-600">No deposits yet.</p>}
                  </div>
                </div>

                {/* Withdrawals summary */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="text-xs font-black uppercase tracking-widest text-rose-400 mb-3">Withdrawals</p>
                  <div className="space-y-2">
                    {recentWithdrawals.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-2 rounded-xl border border-white/5 bg-slate-950/60 px-3 py-2">
                        <span className="text-xs text-slate-400 capitalize">{item.status}</span>
                        <span className="text-xs font-bold text-white">Ksh {Number(item.amount || 0).toLocaleString()}</span>
                      </div>
                    ))}
                    {recentWithdrawals.length === 0 && <p className="text-xs text-slate-600">No withdrawals yet.</p>}
                  </div>
                </div>
              </div>

              {/* Right: tab content */}
              <div className="space-y-4">
                {profileStatus && (
                  <div className={`rounded-2xl border px-5 py-4 text-sm font-bold ${
                    profileStatus.toLowerCase().includes("error") || profileStatus.toLowerCase().includes("fail") || profileStatus.toLowerCase().includes("insufficient")
                      ? "border-rose-500/30 bg-rose-500/10 text-rose-300"
                      : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                  }`}>
                    {profileStatus}
                  </div>
                )}

                {/* Overview tab */}
                {profileTab === "view" && (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                      <p className="text-xs font-black uppercase tracking-widest text-cyan-400 mb-3">About your account</p>
                      <p className="text-sm leading-7 text-slate-400">
                        Keep your profile updated so the QOOHI team can reach you. Your balance funds paid services. Deposits are reviewed by admin before crediting. Withdrawals are sent to your M-Pesa number.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                      <p className="text-xs font-black uppercase tracking-widest text-cyan-400 mb-4">Recent activity</p>
                      <div className="space-y-2">
                        {recentTransactions.slice(0, 5).map((item) => {
                          const amt = Number(item.amount || 0);
                          return (
                            <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl bg-slate-950/60 px-4 py-3 text-sm">
                              <span className="text-slate-300 truncate">{item.description || item.type}</span>
                              <span className={`font-bold flex-shrink-0 ${amt >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                                {amt >= 0 ? "+" : "−"}Ksh {Math.abs(amt).toLocaleString()}
                              </span>
                            </div>
                          );
                        })}
                        {recentTransactions.length === 0 && <p className="text-sm text-slate-600">No activity yet.</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* Edit profile tab */}
                {profileTab === "edit" && (
                  <form className="space-y-6 rounded-2xl border border-white/10 bg-white/5 p-6" onSubmit={saveProfile}>
                    <p className="text-xs font-black uppercase tracking-widest text-cyan-400">Edit Profile</p>

                    {/* Picture upload with live preview */}
                    <div className="flex gap-5 items-start">
                      <div className="flex-shrink-0">
                        <div className="h-28 w-28 overflow-hidden rounded-full border-2 border-white/20 bg-slate-800">
                          {profileDraft.avatarUrl ? (
                            <img src={profileDraft.avatarUrl} alt="Preview" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-3xl font-black text-cyan-300">{profileDraft.fullName?.[0]?.toUpperCase() || "Q"}</div>
                          )}
                        </div>
                        <label className="mt-3 block w-28 cursor-pointer rounded-xl border border-dashed border-cyan-400/40 bg-cyan-400/5 py-2 text-center text-[10px] font-black uppercase tracking-widest text-cyan-400 hover:bg-cyan-400/10 transition">
                          Change
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleAvatarFile(e.target.files?.[0])} />
                        </label>
                        {profileDraft.avatarUrl && (
                          <button
                            type="button"
                            onClick={() => setProfileDraft((c) => ({ ...c, avatarUrl: "" }))}
                            className="mt-2 block w-28 rounded-xl border border-rose-500/20 bg-rose-500/5 py-2 text-center text-[10px] font-black uppercase tracking-widest text-rose-400 hover:bg-rose-500/10 transition"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <div className="flex-1 space-y-4 min-w-0">
                        <Input label="Full name" value={profileDraft.fullName} onChange={(v) => setProfileDraft((c) => ({ ...c, fullName: v }))} />
                        <Input label="WhatsApp number" value={profileDraft.whatsapp} onChange={(v) => setProfileDraft((c) => ({ ...c, whatsapp: v }))} />
                        <div className="rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-500">
                          <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-1">Email (read-only)</span>
                          {dashboard.student.email}
                        </div>
                      </div>
                    </div>
                    {profileUpdateCharge > 0 && (
                      <p className="text-xs text-amber-400/80">Saving this profile costs Ksh {profileUpdateCharge.toLocaleString()} from your balance.</p>
                    )}
                    <div className="flex gap-3 pt-2">
                      <ActionButton type="submit" disabled={savingProfile} className="!px-6 !py-3 !text-sm">
                        {savingProfile ? "Saving..." : "Save Profile"}
                      </ActionButton>
                      <SecondaryButton type="button" className="!px-6 !py-3 !text-sm" onClick={() => setProfileTab("view")}>Cancel</SecondaryButton>
                    </div>
                  </form>
                )}

                {/* Deposit tab */}
                {profileTab === "deposit" && (
                  <form className="space-y-5 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-6" onSubmit={submitDeposit}>
                    <div><p className="text-xs font-black uppercase tracking-widest text-cyan-400">Add money to wallet</p><h3 className="mt-2 text-2xl font-black text-white">M-Pesa STK Push</h3><p className="mt-2 text-sm leading-6 text-slate-400">Enter your M-Pesa number and amount. A payment prompt will appear on your phone for PIN confirmation.</p></div>
                    <Input label="M-Pesa phone number" type="tel" value={depositForm.phone} onChange={(v) => setDepositForm((c) => ({ ...c, phone: v }))} />
                    <Input label="Amount (Ksh)" type="number" value={depositForm.amount} onChange={(v) => setDepositForm((c) => ({ ...c, amount: v }))} />
                    {depositResult && <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-4 text-sm text-emerald-100"><p className="font-black uppercase tracking-widest text-emerald-300">STK prompt sent</p><p className="mt-1">Check your phone and enter your M-Pesa PIN. Your wallet will update after payment confirmation.</p>{depositResult.checkoutRequestId && <p className="mt-1 text-xs text-emerald-300">Request: {depositResult.checkoutRequestId}</p>}</div>}
                    <div className="flex gap-3 pt-2"><ActionButton type="submit" disabled={submittingDeposit || !depositForm.phone || !depositForm.amount} className="!px-6 !py-3 !text-sm">{submittingDeposit ? "Sending prompt..." : "Send STK Push"}</ActionButton><SecondaryButton type="button" className="!px-6 !py-3 !text-sm" onClick={() => { setProfileTab("view"); setDepositResult(null); }}>Cancel</SecondaryButton></div>
                  </form>
                )}

                {/* Withdraw tab */}
                {profileTab === "withdraw" && (
                  <form className="space-y-5 rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6" onSubmit={submitWithdraw}>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-rose-400">Withdraw to M-Pesa</p>
                      <p className="mt-2 text-sm text-slate-400">Request a payout. Admin will process and send to your M-Pesa number. Ensure your name and number match your M-Pesa account exactly.</p>
                    </div>
                    <Input label="Amount (Ksh)" type="number" value={withdrawForm.amount} onChange={(v) => setWithdrawForm((c) => ({ ...c, amount: v }))} />
                    <Input label="M-Pesa registered name" value={withdrawForm.mpesaName} onChange={(v) => setWithdrawForm((c) => ({ ...c, mpesaName: v }))} />
                    <Input label="M-Pesa phone number" value={withdrawForm.mpesaNumber} onChange={(v) => setWithdrawForm((c) => ({ ...c, mpesaNumber: v }))} />
                    <div className="flex gap-3 pt-2">
                      <ActionButton type="submit" disabled={submittingWithdraw} className="!px-6 !py-3 !text-sm">
                        {submittingWithdraw ? "Submitting..." : "Submit Withdrawal"}
                      </ActionButton>
                      <SecondaryButton type="button" className="!px-6 !py-3 !text-sm" onClick={() => setProfileTab("view")}>Cancel</SecondaryButton>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </PageStack>
  );
}

function CenteredPanel({ eyebrow, title, subtitle, children }) {
  return (
    <div className="mx-auto max-w-2xl">
      <GlassPanel className="p-8 sm:p-10">
        <SectionLabel>{eyebrow}</SectionLabel>
        <h1 className="mt-3 text-4xl font-black text-white">{title}</h1>
        <p className="mt-4 text-slate-200">{subtitle}</p>
        <div className="mt-8">{children}</div>
      </GlassPanel>
    </div>
  );
}

function PackageCard({ item, onClick }) {
  return (
    <GlassPanel className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <SectionLabel>{item.badge}</SectionLabel>
          <h3 className="mt-3 text-2xl font-black text-white">{item.name}</h3>
        </div>
        <item.icon className="text-3xl text-cyan-200" />
      </div>
      <p className="mt-4 text-sm leading-7 text-slate-200">{item.summary}</p>
      <p className="mt-6 text-3xl font-black text-amber-200">Ksh {item.priceKsh}</p>
      <SecondaryButton className="mt-6" onClick={onClick}>
        Register
      </SecondaryButton>
    </GlassPanel>
  );
}

function FeatureCard({ title, copy }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
      <h3 className="text-lg font-bold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-slate-200">{copy}</p>
    </div>
  );
}

function ContactCard({ icon, label, value, href }) {
  const Icon = icon;
  return (
    <a href={href} className="rounded-[2rem] border border-white/10 bg-white/10 p-8 backdrop-blur-xl transition hover:border-cyan-400/30 hover:bg-cyan-400/10">
      <Icon className="text-3xl text-cyan-200" />
      <p className="mt-5 text-xs font-bold uppercase tracking-[0.28em] text-cyan-100">
        {label}
      </p>
      <h2 className="mt-3 text-2xl font-black text-white">{value}</h2>
    </a>
  );
}

function InfoChip({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-3">
      <span className="text-slate-300">{label}</span>
      <span className="font-bold text-white">{value}</span>
    </div>
  );
}

function getRouteFromHash() {
  if (typeof window === "undefined") return "home";
  return window.location.hash.replace("#", "").split("?")[0].trim() || "home";
}

async function fetchJson(path, options = {}) {
  const multipart = typeof FormData !== "undefined" && options.body instanceof FormData;
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(multipart ? {} : { "Content-Type": "application/json" }),
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Request failed.");
  }
  return data;
}

function Footer({ goTo, openParentRegistration }) {
  return (
    <footer className="qoohi-purple-footer fixed inset-x-0 bottom-0 z-40 border-t border-purple-800 bg-purple-900 py-3 text-purple-100">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 text-center sm:flex-row sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => goTo("home")} className="group flex items-center gap-2">
            <img src="/qoohi-icon.svg" alt="" className="h-8 w-8 rounded-lg transition-transform group-hover:scale-110" />
            <span className="text-sm font-black tracking-widest text-white">QOOHI</span>
          </button>
        </div>

        <div className="flex flex-col items-center gap-1 sm:flex-row sm:gap-5">
          <p className="text-[10px] text-purple-200">
            &copy; {new Date().getFullYear()}
          </p>
          <button
            type="button"
            onClick={() => openParentRegistration()}
            className="text-[10px] font-bold uppercase tracking-[0.2em] text-purple-200 transition hover:text-white"
          >
            Learner IEP
          </button>
        </div>

        <div className="flex items-center gap-5">
          <div className="flex items-center gap-3">
            <a href="mailto:qoohitech@gmail.com" aria-label="Email QOOHI" className="inline-flex items-center gap-2 rounded-full border border-purple-700 px-3 py-2 text-purple-100 transition hover:bg-purple-800 hover:text-white">
              <FaEnvelope aria-hidden="true" className="text-lg" />
              <span className="text-xs font-bold">Email</span>
            </a>
            <a href="https://wa.me/254712451604" aria-label="Chat with QOOHI on WhatsApp" className="inline-flex items-center gap-2 rounded-full border border-purple-700 px-3 py-2 text-purple-100 transition hover:bg-purple-800 hover:text-white">
              <FaWhatsapp aria-hidden="true" className="text-xl text-green-300" />
              <span className="text-xs font-bold">WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
function StreamingText({ text, speed = 20 }) {
  const [displayedText, setDisplayedText] = useState("");
  useEffect(() => {
    setDisplayedText("");
    let i = 0;
    const timer = setInterval(() => {
      setDisplayedText(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(timer);
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return <p className="whitespace-pre-wrap">{displayedText}</p>;
}

function QoohiAIPage({ sessionToken }) {

  const authHeaders = sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {};

  const aiSessionId = useMemo(() => {
    const saved = localStorage.getItem("qoohi_ai_session_id");
    if (saved) return saved;
    const created = crypto.randomUUID();
    localStorage.setItem("qoohi_ai_session_id", created);
    return created;
  }, []);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editText, setEditText] = useState("");
  const [lessonSetup, setLessonSetup] = useState({ subject: "", grade: "1", topic: "" });

  const [streamingContent, setStreamingContent] = useState("");
  const streamingContentRef = useRef("");

  const appendMessage = (message) => {
    setMessages((prev) => [...prev, message]);
  };

  const copyMessage = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      console.log("Copy failed");
    }
  };

  // ✏️ START EDIT
  const startEdit = (index, content) => {
    setEditingIndex(index);
    setEditText(content);
  };

  // ❌ CANCEL EDIT
  const cancelEdit = () => {
    setEditingIndex(null);
    setEditText("");
  };

  const sendMessage = async (overrideMessages) => {
    if (loading) return;

    if (overrideMessages) {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/ai/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders,
          },
          body: JSON.stringify({ messages: overrideMessages }),
        });
        const data = await res.json();
        const reply = data?.reply;
        if (!reply) throw new Error("No reply");
        setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "⚠️ AI error. Please try again.",
          },
        ]);
      } finally {
        setLoading(false);
      }
      return;
    }

    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    const userMessage = { role: "user", content: trimmedInput };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    const finalMessages = [...messages, userMessage];
    setLoading(true);
    setStreamingContent("");
    streamingContentRef.current = "";

    try {
      const res = await fetch(`${API_BASE}/api/ai/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({ messages: finalMessages }),
      });

      if (!res.ok) {
        if (res.status === 402) {
          const errData = await res.json().catch(() => ({}));
          appendMessage({
            role: "assistant",
            content: "⚠️ " + (errData.error || "Insufficient balance. Please deposit funds to continue.") + "\n\nTop up from your Dashboard to unlock AI chat.",
          });
          setLoading(false);
          return;
        }
        throw new Error("Stream error: " + res.status);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";

        for (const part of parts) {
          const lines = part.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6).trim();
              if (data === "[DONE]") continue;
              try {
                const parsed = JSON.parse(data);
                const delta = parsed.choices?.[0]?.delta?.content || "";
                if (delta) {
                  streamingContentRef.current += delta;
                  setStreamingContent(streamingContentRef.current);
                }
              } catch {}
            }
          }
        }
      }

      const finalContent = streamingContentRef.current;
      if (finalContent) {
        appendMessage({ role: "assistant", content: finalContent });
      }
      setStreamingContent("");
      streamingContentRef.current = "";
      } catch {
      try {
        const fallbackRes = await fetch(`${API_BASE}/api/ai/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders,
          },
          body: JSON.stringify({ messages: finalMessages }),
        });
        const fallbackData = await fallbackRes.json();
        const reply = fallbackData?.reply;
        if (reply) {
          appendMessage({ role: "assistant", content: reply });
        } else {
          throw new Error("No reply");
        }
      } catch {
        appendMessage({
          role: "assistant",
          content: "⚠️ AI error. Please try again.",
        });
      }
    } finally {
      setLoading(false);
      setStreamingContent("");
      streamingContentRef.current = "";
    }
  };

  const saveEdit = async (index) => {
    const updated = [...messages];

    updated[index] = {
      ...updated[index],
      content: editText,
    };

    const trimmed = updated.slice(0, index + 1);

    setMessages(trimmed);
    setEditingIndex(null);
    setEditText("");

    await sendMessage(trimmed);
  };

  const startLesson = () => {
    const { subject, grade, topic } = lessonSetup;
    if (!subject.trim() || !topic.trim()) return;
    const prompt = `Teach me ${subject.trim()} for Kenyan CBC Grade ${grade}, topic ${topic.trim()}. Teach in a clear sequence. After each major section, stop and give me a short quiz; wait for my answers before continuing. Correct my answers and keep a progress/IEP note as we continue.`;
    localStorage.setItem("qoohi_iep_progress", JSON.stringify({ subject: subject.trim(), grade, topic: topic.trim(), updatedAt: new Date().toISOString() }));
    sendMessage([{ role: "user", content: prompt }]);
  };

  return (
    <PageStack
      title="QOOHI AI"
      subtitle="Ask anything. Learn. Build. Create."
    >
      <GlassPanel className="flex h-[70vh] min-h-[18rem] flex-col p-4">
        <div className="mb-3 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-4">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-300">Start a lesson</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_110px_1fr_auto]">
            <input value={lessonSetup.subject} onChange={(event) => setLessonSetup((current) => ({ ...current, subject: event.target.value }))} placeholder="Subject e.g. Mathematics" className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400" />
            <select value={lessonSetup.grade} onChange={(event) => setLessonSetup((current) => ({ ...current, grade: event.target.value }))} className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400">{Array.from({ length: 12 }, (_, index) => <option key={index + 1} value={String(index + 1)}>Grade {index + 1}</option>)}</select>
            <input value={lessonSetup.topic} onChange={(event) => setLessonSetup((current) => ({ ...current, topic: event.target.value }))} placeholder="Topic e.g. Fractions" className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400" />
            <button type="button" onClick={startLesson} disabled={loading || !lessonSetup.subject.trim() || !lessonSetup.topic.trim()} className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-black text-slate-950 disabled:opacity-50">Teach me</button>
          </div>
        </div>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">


          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.role === "user"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`group relative max-w-[85%] rounded-[1.5rem] px-5 py-4 text-[14px] font-medium leading-relaxed transition-all shadow-xl sm:max-w-[70%] ${
                  msg.role === "user"
                    ? "bg-gradient-to-br from-cyan-400 to-cyan-500 text-slate-950 rounded-tr-none shadow-cyan-400/20"
                    : "bg-slate-900/80 backdrop-blur-xl text-white border border-white/10 rounded-tl-none shadow-black/40"
                }`}
              >
                {editingIndex === index ? (
                  <div className="space-y-3">
                    <textarea
                      className="w-full rounded-xl bg-slate-950 p-4 text-white outline-none ring-1 ring-white/10 focus:ring-cyan-400"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={4}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveEdit(index)}
                        className="flex-1 rounded-xl bg-cyan-400 py-2.5 text-xs font-black text-slate-950 transition hover:bg-white"
                      >
                        SAVE CHANGES
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex-1 rounded-xl bg-white/10 py-2.5 text-xs font-black text-white transition hover:bg-white/20"
                      >
                        CANCEL
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {msg.content}
                    </div>
                    <SpeakTextButton text={msg.content} className="mt-3" />

                    <div className="absolute top-0 flex items-center gap-1 opacity-0 transition-all group-hover:opacity-100 py-1.5 px-3 bg-slate-950/90 border border-white/10 backdrop-blur-md rounded-2xl shadow-2xl z-20 -top-10 left-0">
                      <button
                        onClick={() => copyMessage(msg.content)}
                        className="p-1.5 text-slate-400 hover:text-cyan-400 transition"
                        title="Copy"
                      >
                        <FaLink className="text-xs" />
                      </button>
                      {msg.role === "user" && (
                        <button
                          onClick={() => startEdit(index, msg.content)}
                          className="p-1.5 text-slate-400 hover:text-cyan-400 transition"
                          title="Edit"
                        >
                          <FaChevronRight className="rotate-90 text-xs" />
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}



          {streamingContent && (
            <div className="flex justify-start">
              <div className="group relative max-w-[85%] rounded-[1.5rem] px-5 py-4 text-[14px] font-medium leading-relaxed transition-all shadow-xl sm:max-w-[70%] bg-slate-900/80 backdrop-blur-xl text-white border border-white/10 rounded-tl-none shadow-black/40">
                <div className="whitespace-pre-wrap leading-relaxed">{streamingContent}</div>
              </div>
            </div>
          )}
          {loading && !streamingContent && (
            <div className="text-sm text-cyan-300">
              QOOHI AI is thinking...
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2 border-t border-white/10 p-4">
          <input
            aria-label="Answer the tutor's question or send a message"
            className="flex-1 rounded-xl bg-slate-950/60 px-4 py-3 text-white outline-none"
            placeholder="Type your answer or message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && sendMessage()
            }
          />

          <button
            onClick={() => sendMessage()}
            disabled={loading}
            className="rounded-xl bg-cyan-400 px-5 py-3 font-bold text-slate-950 hover:bg-cyan-300 disabled:opacity-50"
          >
            🚀 Send
          </button>
        </div>
      </GlassPanel>
    </PageStack>
  );
}
