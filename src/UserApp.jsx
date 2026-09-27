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
import QoohiLogo from "./assets/qoohiLogo.jpeg";
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

export default function UserApp() {
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
    fetchJson("/api/teacher/overview", {
      headers: { Authorization: `Bearer ${sessionToken}` },
    })
      .then((data) => setTeacherOverview(data))
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
    window.location.hash = nextRoute === "home" ? "" : nextRoute;
    setRoute(nextRoute);
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
      <main className="mx-auto min-h-screen max-w-7xl px-4 pb-32 pt-4 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          <MotionDiv
            key={route}
            initial={{
              opacity: 0,
              y: 20,
              scale: 0.98,
              filter: "blur(8px)",
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              filter: "blur(0px)",
            }}
            exit={{
              opacity: 0,
              y: -20,
              scale: 0.98,
              filter: "blur(8px)",
            }}
            transition={{
              duration: 0.55,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {route === "home" && (
              sessionToken ? (oauthChoiceRequired && availableDashboards.length > 1 ? <DashboardChooser dashboards={availableDashboards} onSelect={switchDashboard} /> : <DashboardPage
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
                    const refreshed = await fetchJson("/api/teacher/overview", {
                      headers: { Authorization: `Bearer ${sessionToken}` },
                    });
                    setTeacherOverview(refreshed);
                  } catch (err) {
                    setStatusMessage(err.message);
                  }
                }}
                loading={loadingDashboard}
                logout={logout}
                unreadNotifs={unreadNotifs}
                openChat={openChat}
              />) : <LoginPage
                statusMessage={statusMessage}
                onSubmit={(payload) =>
                  handleCodeRequest({ ...payload, mode: "login" })
                }
                onGoToRegister={(page) => {
                  if (page === "parent") {
                    setRegistrationTarget({ type: "parent", packageKey: "" });
                    goTo("register");
                  } else if (page === "teacher") {
                    setRegistrationTarget({ type: "teacher", packageKey: "" });
                    goTo("register");
                  }
                }}
              />
            )}
            {route === "about" && <AboutPage goTo={goTo} />}
                        {route === "contact" && <ContactPage />}
            {route === "register" && (
              <RegisterPage
                registrationTarget={registrationTarget}
                onSubmit={handleCodeRequest}
                statusMessage={statusMessage}
              />
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
                    const refreshed = await fetchJson("/api/teacher/overview", {
                      headers: { Authorization: `Bearer ${sessionToken}` },
                    });
                    setTeacherOverview(refreshed);
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
          </MotionDiv>
        </AnimatePresence>
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

const menuNavItems = [
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
];

function Header({ route, goTo, dashboard }) {
  const [logoFailed, setLogoFailed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleMenu = (id) => {
    goTo(id);
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/80 shadow-2xl backdrop-blur-2xl">
      <div className="mx-auto max-w-[1400px] px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <button
            type="button"
            onClick={() => goTo("home")}
            className="group flex flex-shrink-0 items-center gap-3 transition-transform active:scale-95"
          >
            <div className="relative h-10 w-10 sm:h-12 sm:w-12">
              <div className="absolute -inset-1 rounded-xl bg-cyan-400 opacity-20 blur-md transition-opacity group-hover:opacity-40" />
              {logoFailed ? (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-cyan-400 text-lg font-black text-slate-900">Q</div>
              ) : (
                <img
                  src={QoohiLogo}
                  alt="QOOHI Logo"
                  className="relative z-20 h-full w-full rounded-xl border border-white/40 object-cover shadow-2xl shadow-cyan-500/20"
                  onError={() => setLogoFailed(true)}
                />
              )}
            </div>
            <div className="hidden text-left sm:block">
              <h1 className="text-xl font-black leading-none tracking-tight text-white">QOOHI</h1>
              <p className="mt-0.5 text-[9px] font-black uppercase tracking-[0.4em] text-cyan-400">Digital Future</p>
            </div>
          </button>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Nav Pills: Home + Dashboard */}
          <nav className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goTo("home")}
              className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-widest transition ${
                route === "home"
                  ? "bg-cyan-400 text-slate-900 shadow-[0_0_15px_rgba(34,211,238,0.35)]"
                  : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => goTo(dashboard ? "dashboard" : "login")}
              className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-widest transition ${
                route === "dashboard" || route === "login"
                  ? "bg-cyan-400 text-slate-900 shadow-[0_0_15px_rgba(34,211,238,0.35)]"
                  : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              {dashboard ? "Dashboard" : "Login"}
            </button>

            {/* Menu Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-black uppercase tracking-widest transition ${
                  menuOpen
                    ? "bg-white/15 text-white"
                    : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="flex flex-col gap-[3px]">
                  <span className={`block h-[2px] w-4 rounded-full bg-current transition-all ${menuOpen ? "translate-y-[5px] rotate-45" : ""}`} />
                  <span className={`block h-[2px] w-4 rounded-full bg-current transition-all ${menuOpen ? "opacity-0" : ""}`} />
                  <span className={`block h-[2px] w-4 rounded-full bg-current transition-all ${menuOpen ? "-translate-y-[5px] -rotate-45" : ""}`} />
                </span>
                <span className="hidden sm:inline">Menu</span>
              </button>

              {/* Dropdown */}
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-2xl border border-white/15 bg-slate-950/95 shadow-2xl shadow-black/60 backdrop-blur-2xl">
                    <div className="p-2">
                      {menuNavItems.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleMenu(item.id)}
                          className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold transition ${
                            route === item.id
                              ? "bg-cyan-500/20 text-cyan-300"
                              : "text-slate-300 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
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
            <ActionButton className="!px-12 !py-6 !text-xl shadow-[0_0_30px_rgba(34,211,238,0.3)]" onClick={() => goTo("contact")}>
              Explore Programs
            </ActionButton>
            <SecondaryButton className="!px-12 !py-6 !text-xl" onClick={() => goTo("contact")}>
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

function AuthShell({ children, isRegister = false, onRegister, onLogin }) {
  return (
    <div className={`qoohi-auth-container ${isRegister ? "active" : ""}`}>
      <div className={`qoohi-auth-form-box ${isRegister ? "qoohi-auth-sign-up" : "qoohi-auth-login"}`}><div className="qoohi-auth-form">{children}</div></div>
      <div className="qoohi-auth-toggle-container"><div className="qoohi-auth-toggle">
        <div className="qoohi-auth-toggle-panel qoohi-auth-toggle-left"><h1>Welcome Back!</h1><p>Already have an account?</p><button type="button" className="qoohi-auth-btn qoohi-auth-btn-hidden" onClick={onLogin}>Login</button></div>
        <div className="qoohi-auth-toggle-panel qoohi-auth-toggle-right"><h1>Hello, Welcome</h1><p>Don&apos;t have an Account</p><button type="button" className="qoohi-auth-btn qoohi-auth-btn-hidden" onClick={onRegister}>Register</button></div>
      </div></div>
    </div>
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

function RegisterPage({ registrationTarget, onSubmit, statusMessage }) {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", whatsapp: "", specialization: "", childName: "", childGradeLevel: "", childGoals: "", selectedPackage: registrationTarget.packageKey || "coding_ai_training" }); const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const [selectedRole, setSelectedRole] = useState(registrationTarget.type === "teacher" ? "teacher" : "parent"); const type = selectedRole; const label = type === "teacher" ? "Coach" : "Parent"; const set = (key) => (value) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event) => { event.preventDefault(); setBusy(true); setError(""); try { await onSubmit({ ...form, fullName: `${form.firstName} ${form.lastName}`.trim(), registrationType: registrationTarget.type === "course" ? "course" : type, registrationRole: type }); } catch (err) { setError(err.message); } finally { setBusy(false); } };
  return <AuthShell isRegister={true} onLogin={() => { window.location.hash = "login"; }}><form className="space-y-4" onSubmit={submit}><h1>Create Account</h1><p className="qoohi-role-label">Register as</p><div className="qoohi-role-picker"><button type="button" className={selectedRole === "parent" ? "selected" : ""} onClick={() => setSelectedRole("parent")}>Parent</button><button type="button" className={selectedRole === "teacher" ? "selected" : ""} onClick={() => setSelectedRole("teacher")}>Coach</button></div><div className="grid gap-4 sm:grid-cols-2"><Input label="First name" value={form.firstName} onChange={set("firstName")} /><Input label="Last name" value={form.lastName} onChange={set("lastName")} /></div><Input label="Email address" type="email" value={form.email} onChange={set("email")} /><Input label="WhatsApp number" type="tel" value={form.whatsapp} onChange={set("whatsapp")} />{type === "teacher" && <Input label="Specialisation (e.g. Mathematics, Physics, Grade 10)" value={form.specialization} onChange={set("specialization")} />}{(type === "parent" || type === "iep") && <div className="grid gap-4 sm:grid-cols-2"><Input label="Child’s name" value={form.childName} onChange={set("childName")} /><Input label="Child’s grade" value={form.childGradeLevel} onChange={set("childGradeLevel")} /></div>}{type === "course" && <label className="block"><span className="mb-2 block text-sm font-bold text-slate-200">Learning package</span><select value={form.selectedPackage} onChange={(e) => set("selectedPackage")(e.target.value)} className="w-full rounded-[1.25rem] border border-white/10 bg-slate-950/60 px-5 py-4 text-white outline-none"><option value="computer_packages">Computer Packages</option><option value="coding_ai_training">Coding and AI Training</option><option value="both">Both Packages</option></select></label>}{(statusMessage || error) && <Notice tone={error ? "error" : "info"}>{error || statusMessage}</Notice>}<ActionButton disabled={busy} type="submit" className="w-full">{busy ? "Sending code..." : "Create account"}</ActionButton><div className="relative py-3 text-center text-xs font-black uppercase tracking-widest text-slate-500"><span className="bg-slate-950 px-3">or sign up with Google</span><span className="absolute inset-x-0 top-1/2 -z-10 border-t border-white/10" /></div><SocialButtons mode="register" role={selectedRole} /></form></AuthShell>;
}

function VerifyPage({ pendingVerification, onVerify, statusMessage }) {
  const [code, setCode] = useState(""); const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const submit = async (event) => { event.preventDefault(); setBusy(true); setError(""); try { await onVerify({ ...pendingVerification, code }); } catch (err) { setError(err.message); } finally { setBusy(false); } };
  return <AuthShell><form className="space-y-5" onSubmit={submit}><h1>Verify Email</h1><label className="block"><span className="mb-2 block text-sm font-bold text-slate-200">Six-digit code</span><input autoFocus required inputMode="numeric" maxLength="6" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} className="w-full rounded-[1.25rem] border border-cyan-300/30 bg-slate-950/60 px-5 py-5 text-center text-3xl font-black tracking-[.45em] text-white outline-none focus:border-cyan-300" placeholder="000000" /></label>{(error || statusMessage) && <Notice tone={error ? "error" : "info"}>{error || statusMessage}</Notice>}<ActionButton disabled={busy || code.length < 4} type="submit" className="w-full">{busy ? "Verifying..." : "Verify email"}</ActionButton></form></AuthShell>;
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
  const [depositForm, setDepositForm] = useState({ phone: "", amount: "" });
  const [depositResult, setDepositResult] = useState(null);
  const [withdrawForm, setWithdrawForm] = useState({
    amount: "",
    mpesaName: "",
    mpesaNumber: "",
  });

  useEffect(() => {
    if (!dashboard?.student) return;
    setProfileDraft({
      fullName: dashboard.student.fullName || "",
      whatsapp: dashboard.student.whatsapp || "",
      avatarUrl: dashboard.student.avatarUrl || "",
    });
  }, [dashboard]);

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
  const hasCourses = dashboard.enrollments && dashboard.enrollments.length > 0;
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

  const allStudents = [...parentChildren, ...enrolledStudents];

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
    ...(isTeacher ? [{ id: "roster", Icon: FaChalkboardTeacher, label: "Roster" }] : []),
    ...(isTeacher ? [{ id: "specializations", Icon: FaLayerGroup, label: "Specializations" }] : []),
    ...(isParent ? [{ id: "parent", Icon: FaUsers, label: "Support" }] : []),
    ...(isParent ? [{ id: "register-child", Icon: FaUserGraduate, label: "Register Your Child" }] : []),
    ...(isParent ? [{ id: "materials", Icon: FaBookOpen, label: "Materials" }] : []),
  ];

  const openProfile = (tab = "view") => {
    setProfileTab(tab);
    setProfileStatus("");
    setProfileModalOpen(true);
  };

  const handleAvatarFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setProfileDraft((current) => ({
        ...current,
        avatarUrl: String(reader.result || ""),
      }));
    };
    reader.readAsDataURL(file);
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
      title="Dashboard"
      subtitle="Profile, balance, services, and activity"
      compact
    >
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
      <div className="flex flex-row gap-6">

        {/* Left Sidebar */}
        <aside className="flex flex-col w-52 flex-shrink-0">
          <div className="sticky top-24 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/90 backdrop-blur-xl">
            <div className="border-b border-white/10 p-4">
              <button type="button" onClick={() => setActiveSection("profile")} className="group flex w-full items-center gap-3 text-left">
                <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full border-2 border-white/20 bg-slate-800 transition group-hover:border-cyan-400/40">
                  {profileAvatar
                    ? <img src={profileAvatar} alt="" className="h-full w-full object-cover" />
                    : <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-cyan-800 to-blue-900 text-sm font-black text-cyan-200">{fullName?.[0]?.toUpperCase() || "Q"}</div>
                  }
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-white">{firstName || fullName}</p>
                  <p className="truncate text-[10px] capitalize text-slate-500">{roleLabel}</p>
                </div>
              </button>
              <div className="mt-3 flex items-center justify-between rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-2">
                <span className="text-[10px] text-slate-500">Balance</span>
                <span className="text-sm font-black text-cyan-300">Ksh {balance.toLocaleString()}</span>
              </div>
            </div>
            <nav className="space-y-0.5 p-2">
              {sidebarNav.map(({ id, Icon, label }) => (
                <button key={id} type="button" onClick={() => setActiveSection(id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                    activeSection === id
                      ? "bg-cyan-500/20 font-bold text-cyan-300"
                      : "font-medium text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className={`flex-shrink-0 text-[15px] ${activeSection === id ? "text-cyan-400" : "text-slate-600"}`} />
                  {label}
                </button>
              ))}
            </nav>
            {availableDashboards?.length > 1 && (
              <div className="border-t border-white/10 p-2">
                <p className="px-3 pb-1 text-[10px] font-black uppercase tracking-widest text-slate-600">Switch dashboard</p>
                {availableDashboards.map((item) => (
                  <button key={item.role} type="button" onClick={() => onSwitchDashboard?.(item.role)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-xs font-bold text-cyan-300 transition hover:bg-cyan-500/10">
                    {item.role === "teacher" ? "Coach dashboard" : "Parent dashboard"}
                  </button>
                ))}
              </div>
            )}
            <div className="border-t border-white/10 p-2">
              <button type="button" onClick={logout}
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
              { label: "Courses", value: dashboard.enrollments.length, color: "text-white", bg: "bg-white/5 border-white/10" },
              { label: "Messages", value: dashboard.messages.length, color: "text-white", bg: "bg-white/5 border-white/10" },
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
                <p className="mt-3 text-sm text-slate-500">{dashboard.messages.length} message{dashboard.messages.length !== 1 ? "s" : ""} from your instructor.</p>
              )}
              {showMessages && (
                <div className="mt-5 space-y-3">
                  {dashboard.messages.length === 0 && (
                    <p className="rounded-2xl border border-white/5 bg-white/5 px-5 py-4 text-sm text-slate-500">No messages yet.</p>
                  )}
                  {dashboard.messages.map((message) => (
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

          {/* Student roadmap */}
          {isStudent && assessmentStatus === "completed" && (
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
          )}

          {/* Teacher: student roster */}
          {isTeacher && (
            <GlassPanel className="p-6 sm:p-8">
              <SectionLabel>Coach Tools</SectionLabel>
              <h3 className="mt-2 text-xl font-black text-white">Learner Roster</h3>
              <div className="mt-6 overflow-x-auto rounded-2xl border border-white/5 bg-slate-950/50">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/5 text-[10px] uppercase tracking-widest text-slate-500">
                      <th className="px-4 py-3">Student</th>
                      <th className="px-4 py-3">Balance</th>
                      <th className="px-4 py-3">Level</th>
                      <th className="px-4 py-3 text-right">IEP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {allStudents.map((s) => (
                      <tr key={s.id} className="transition hover:bg-white/5">
                        <td className="px-4 py-4">
                          <p className="font-bold text-white">{s.full_name}</p>
                          <p className="text-xs text-slate-500">{s.email}</p>
                        </td>
                        <td className="px-4 py-4 font-bold text-cyan-300">Ksh {Number(s.balance || 0).toLocaleString()}</td>
                        <td className="px-4 py-4">
                          <span className="rounded-full bg-cyan-500/10 px-2 py-1 text-xs font-bold text-cyan-300">Lvl {s.performance_level}</span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <button
                            onClick={() => setEditingIep(s)}
                            className="rounded-full border border-cyan-400/30 px-3 py-1.5 text-xs font-black text-cyan-400 transition hover:bg-cyan-400 hover:text-slate-900"
                          >
                            Edit IEP
                          </button>
                        </td>
                      </tr>
                    ))}
                    {allStudents.length === 0 && (
                      <tr>
                        <td colSpan="4" className="px-4 py-10 text-center text-sm text-slate-500">No students found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {editingIep && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
                  <GlassPanel className="w-full max-w-md p-8">
                    <SectionLabel>Edit IEP</SectionLabel>
                    <h2 className="mt-2 text-2xl font-black text-white">{editingIep.full_name}</h2>
                    <div className="mt-6 space-y-5">
                      <label className="block">
                        <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-400">Assessment Status</span>
                        <select
                          className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-400"
                          value={editingIep.assessment_status}
                          onChange={(e) => setEditingIep({ ...editingIep, assessment_status: e.target.value })}
                        >
                          <option value="waiting">Waiting</option>
                          <option value="completed">Completed</option>
                        </select>
                      </label>
                      <label className="block">
                        <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-400">Performance Level</span>
                        <select
                          className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-400"
                          value={editingIep.performance_level}
                          onChange={(e) => setEditingIep({ ...editingIep, performance_level: Number(e.target.value) })}
                        >
                          {[0, 1, 2, 3, 4, 5].map((lvl) => (
                            <option key={lvl} value={lvl}>Level {lvl}</option>
                          ))}
                        </select>
                      </label>
                      <div className="flex gap-3 pt-2">
                        <ActionButton className="flex-1 !py-3 !text-sm" onClick={() => { onUpdateIep(editingIep.id, editingIep.assessment_status, editingIep.performance_level); setEditingIep(null); }}>
                          Save Changes
                        </ActionButton>
                        <SecondaryButton className="flex-1 !py-3 !text-sm" onClick={() => setEditingIep(null)}>Cancel</SecondaryButton>
                      </div>
                    </div>
                  </GlassPanel>
                </div>
              )}
            </GlassPanel>
          )}

          {/* Parent quick-links */}
          {isParent && (
            <GlassPanel className="p-6 sm:p-8">
              <SectionLabel>Parent Hub</SectionLabel>
              <h3 className="mt-2 text-xl font-black text-white">Support your child's learning</h3>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setActiveSection("materials")}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-cyan-400/30 hover:bg-cyan-400/5"
                >
                  <div className="rounded-xl bg-cyan-500/10 p-3"><FaBookOpen className="text-lg text-cyan-300" /></div>
                  <div>
                    <p className="font-bold text-white">Purchase Materials</p>
                    <p className="text-xs text-slate-500">Workbooks & kits</p>
                  </div>
                </button>
                <button
                  type="button"
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-cyan-400/30 hover:bg-cyan-400/5"
                >
                  <div className="rounded-xl bg-emerald-500/10 p-3"><FaEnvelope className="text-lg text-emerald-300" /></div>
                  <div>
                    <p className="font-bold text-white">Contact Coach</p>
                    <p className="text-xs text-slate-500">Send a message</p>
                  </div>
                </button>
              </div>
            </GlassPanel>
          )}

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
                {dashboard.messages.length === 0
                  ? <p className="py-12 text-center text-sm text-slate-600">No messages from your instructor yet.</p>
                  : dashboard.messages.map(message => (
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

          {/* ROADMAP section */}
          {activeSection === "roadmap" && (
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
          )}

          {/* ROSTER section (teacher) */}
          {activeSection === "roster" && (
            <GlassPanel className="p-6 sm:p-8">
              <SectionLabel>Coach Tools</SectionLabel>
              <h3 className="mt-2 mb-6 text-2xl font-black text-white">Learner Roster</h3>
              <div className="overflow-hidden rounded-2xl border border-white/5 bg-slate-950/50">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/5 text-[10px] uppercase tracking-widest text-slate-500">
                      <th className="px-5 py-4">Student</th><th className="px-5 py-4">Balance</th><th className="px-5 py-4">Level</th><th className="px-5 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {allStudents.length === 0
                      ? <tr><td colSpan="4" className="px-5 py-10 text-center text-sm text-slate-600">No students found.</td></tr>
                      : allStudents.map(s => (
                        <tr key={s.id} className="transition hover:bg-white/5">
                          <td className="px-5 py-4"><p className="font-bold text-white">{s.full_name}</p><p className="text-xs text-slate-500">{s.email}</p></td>
                          <td className="px-5 py-4 font-bold text-cyan-300">Ksh {Number(s.balance || 0).toLocaleString()}</td>
                          <td className="px-5 py-4"><span className="rounded-full bg-cyan-500/10 px-2 py-1 text-xs font-bold text-cyan-300">Lvl {s.performance_level}</span></td>
                          <td className="px-5 py-4 text-right"><button onClick={() => setEditingIep(s)} className="rounded-full border border-cyan-400/30 px-3 py-1.5 text-xs font-black text-cyan-400 transition hover:bg-cyan-400 hover:text-slate-900">Edit IEP</button></td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              {editingIep && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
                  <GlassPanel className="w-full max-w-md p-8">
                    <SectionLabel>Edit IEP</SectionLabel>
                    <h2 className="mt-2 text-2xl font-black text-white">{editingIep.full_name}</h2>
                    <div className="mt-6 space-y-5">
                      <label className="block">
                        <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-400">Assessment Status</span>
                        <select className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-400" value={editingIep.assessment_status} onChange={e => setEditingIep({ ...editingIep, assessment_status: e.target.value })}>
                          <option value="waiting">Waiting</option><option value="completed">Completed</option>
                        </select>
                      </label>
                      <label className="block">
                        <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-400">Performance Level</span>
                        <select className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-400" value={editingIep.performance_level} onChange={e => setEditingIep({ ...editingIep, performance_level: Number(e.target.value) })}>
                          {[0,1,2,3,4,5].map(lvl => <option key={lvl} value={lvl}>Level {lvl}</option>)}
                        </select>
                      </label>
                      <div className="flex gap-3 pt-2">
                        <ActionButton className="flex-1 !py-3 !text-sm" onClick={() => { onUpdateIep(editingIep.id, editingIep.assessment_status, editingIep.performance_level); setEditingIep(null); }}>Save Changes</ActionButton>
                        <SecondaryButton className="flex-1 !py-3 !text-sm" onClick={() => setEditingIep(null)}>Cancel</SecondaryButton>
                      </div>
                    </div>
                  </GlassPanel>
                </div>
              )}
            </GlassPanel>
          )}

          {/* SUPPORT section (parent) */}
          {activeSection === "parent" && (
            <div className="space-y-6">
              <GlassPanel className="p-6 sm:p-8">
                <SectionLabel>Parent Hub</SectionLabel>
                <h3 className="mt-2 mb-6 text-2xl font-black text-white">Support your child's learning</h3>

                {dashboard.children && dashboard.children.length > 0 ? (
                  <div className="grid gap-4">
                    {dashboard.children.map((child) => (
                      <div key={child.id} className="rounded-[1.5rem] border border-white/10 bg-slate-950/45 p-5">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="text-lg font-black text-white">{child.child_name}</p>
                            <p className="mt-1 text-sm text-slate-400">Grade {child.grade_level}</p>
                            {child.goals && <p className="mt-2 text-sm text-slate-300">Goals: {child.goals}</p>}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {child.assessment_status === "completed" ? (
                              <span className="rounded-full bg-emerald-400/15 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-emerald-200">
                                IEP: {child.performance_level || "Completed"}
                              </span>
                            ) : child.assessment_status === "in_progress" ? (
                              <span className="rounded-full bg-amber-400/15 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-amber-200">
                                Assessment in progress
                              </span>
                            ) : (
                              <span className="rounded-full bg-slate-400/15 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-slate-300">
                                Awaiting assessment
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No children registered yet. Use "Register Your Child" to add one.</p>
                )}

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-6">
                    <div className="rounded-xl bg-emerald-500/10 p-4"><FaEnvelope className="text-2xl text-emerald-300" /></div>
                    <div><p className="font-bold text-white">Contact Coach</p><p className="mt-1 text-sm text-slate-500">Send a direct message</p></div>
                  </div>
                </div>
              </GlassPanel>
            </div>
          )}

          {/* REGISTER CHILD section (parent) */}
          {activeSection === "register-child" && (
            <ParentRegisterChildSection authHeaders={authHeaders} onRefresh={onRefresh} />
          )}

          {/* MATERIALS section (parent) */}
          {activeSection === "materials" && (
            <ParentMaterialsSection authHeaders={authHeaders} balance={balance} openProfile={openProfile} />
          )}

          {/* SPECIALIZATIONS section (teacher) */}
          {activeSection === "specializations" && (
            <TeacherSpecializationsSection
              key={dashboard.student?.specializations || ""}
              authHeaders={authHeaders}
              initialSpecs={dashboard.student?.specializations || ""}
            />
          )}

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

function ParentRegisterChildSection({ authHeaders, onRefresh }) {
  const [childName, setChildName] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [goals, setGoals] = useState("");
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
        body: JSON.stringify({ childName, gradeLevel, goals }),
      });
      setChildName("");
      setGradeLevel("");
      setGoals("");
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

function getSubjectsForGrade(grade) {
  const g = Number(grade);
  if (g >= 1 && g <= 3) return KENYAN_SUBJECTS.lower;
  if (g >= 4 && g <= 6) return KENYAN_SUBJECTS.upper;
  if (g >= 7 && g <= 9) return KENYAN_SUBJECTS.junior;
  return KENYAN_SUBJECTS.lower;
}

function ParentMaterialsSection({ authHeaders, balance, openProfile }) {
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
  const [downloadingImg, setDownloadingImg] = useState(null);
  const subjects = getSubjectsForGrade(grade);

  const gradeRef = useRef(grade);
  gradeRef.current = grade;

  useEffect(() => {
    generateSubjects(grade);
  }, []);

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

  const generateSubjects = async (g) => {
    setGenerating(true);
    setMatError("");
    const subjs = getSubjectsForGrade(g);
    try {
      const generatedEntries = await Promise.all(
        subjs.map(async (subj) => {
          const language = /kiswahili|swahili/i.test(subj) ? "kiswahili" : "english";
          const prompt = `Create comprehensive Grade ${g} Kenyan CBC curriculum notes for ${subj}. Include a title, learning objectives, main concepts, activities, revision questions, and examples relevant to Kenya. Use ${language === "kiswahili" ? "Kiswahili" : "English"} only. Return plain text with clear sections and no markdown symbols.`;
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
    setTopicGuides((prev) => ({ ...prev, [subject]: { loading: true, guide: "", error: "" } }));
    try {
      const res = await fetchJson("/api/ai/topic-guide", {
        method: "POST",
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ subject, grade }),
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
    generateSubjects(g);
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
      const filename = `grade${grade}-${subject.replace(/\s+/g, "-").toLowerCase()}`;
      if (format === "doc") {
        const html = `<html><body><h1>Grade ${grade} - ${subject}</h1><pre style="font-family:sans-serif;font-size:14px;line-height:1.6">${content}</pre></body></html>`;
        const blob = new Blob([html], { type: "application/msword" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${filename}.doc`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const blob = new Blob([content], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${filename}.txt`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      setMatError(err.message);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <GlassPanel className="p-6 sm:p-8">
      <SectionLabel>CBC Materials</SectionLabel>
      <h3 className="mt-2 mb-2 text-2xl font-black text-white">Kenyan Curriculum Materials</h3>
      <p className="mb-6 text-sm text-slate-400">Select a grade to view subjects. Click any subject card to see learning content.</p>

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
        <div className="flex-1 min-w-[220px]">
          <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Search image</label>
          <div className="flex gap-2">
            <input
              value={imageSearchTopic}
              onChange={(e) => setImageSearchTopic(e.target.value)}
              placeholder="Search any topic image"
              className="flex-1 rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-cyan-400/60 placeholder-slate-600"
            />
            <button
              type="button"
              onClick={generateSearchImage}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.22em] text-slate-300 transition hover:bg-white/10"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {matError && <p className="mb-4 text-sm text-rose-400">{matError}</p>}

      {searchedImage && (
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
                        onClick={() => downloadAs("doc", subject, content)}
                        disabled={downloading === subject}
                        className="flex-1 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-slate-300 transition hover:bg-white/10 disabled:opacity-50"
                      >
                        {downloading === subject ? "..." : "Word"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setOpenTeacherPanel(openTeacherPanel === subject ? null : subject)}
                        className="flex-1 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300 transition hover:bg-cyan-400/20"
                      >
                        Teacher
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

                        {/* AI Topic Guide */}
                        <button
                          type="button"
                          onClick={() => fetchTopicGuide(subject)}
                          disabled={topicGuides[subject]?.loading}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-left text-xs font-semibold text-white transition hover:bg-white/10 disabled:opacity-50"
                        >
                          {topicGuides[subject]?.loading ? "🤖 Generating guide…" : "🤖 AI Topic-by-Topic Guide (20 KSH)"}
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

function TeacherSpecializationsSection({ authHeaders, initialSpecs = "" }) {
  const [specs, setSpecs] = useState(initialSpecs);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus("");
    try {
      await fetchJson("/api/teacher/specializations", {
        method: "POST",
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ specializations: specs }),
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
        {status && <p className={`text-sm ${status.includes("success") ? "text-emerald-400" : "text-rose-400"}`}>{status}</p>}
        <ActionButton type="submit" disabled={saving} className="!px-6 !py-3 !text-sm">
          {saving ? "Saving..." : "Save Specializations"}
        </ActionButton>
      </form>
    </GlassPanel>
  );
}

function PageStack({ title, subtitle, children, compact = false }) {

  return (
    <div className="space-y-12">
      <div className={`relative flex flex-col ${compact ? "gap-4 lg:flex-row lg:items-center" : "gap-6 lg:flex-row lg:items-end"} lg:justify-between`}>
        <div className={`max-w-3xl ${compact ? "space-y-2" : "space-y-4"}`}>
          <SectionLabel>QOOHI PLATFORM</SectionLabel>
          <h1
            className={`font-black text-white ${
              compact
                ? "text-4xl leading-tight tracking-tight sm:text-5xl lg:text-6xl"
                : "text-6xl leading-[0.9] tracking-tighter uppercase sm:text-8xl"
            }`}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              className={`max-w-4xl ${
                compact
                  ? "mt-1 text-sm font-semibold tracking-normal text-slate-300 sm:text-base"
                  : "mt-4 text-xl font-bold uppercase tracking-[0.05em] text-cyan-400/80 sm:text-2xl"
              }`}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

function GlassPanel({ className = "", children }) {
  return (
    <section className={`rounded-[2rem] border border-white/10 bg-white/10 shadow-2xl shadow-black/30 backdrop-blur-xl ${className}`}>
      {children}
    </section>
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

function Input({ label, value, onChange, type = "text" }) {
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

function ActionButton({ children, onClick, type = "button", disabled = false, className = "" }) {
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

function SecondaryButton({ children, onClick, className = "" }) {
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

function Notice({ children, tone }) {
  const classes =
    tone === "error"
      ? "border-rose-300/25 bg-rose-400/10 text-rose-100"
      : "border-cyan-300/25 bg-cyan-400/10 text-cyan-50";
  return <div className={`rounded-[1.25rem] border px-6 py-4 text-lg font-bold ${classes}`}>{children}</div>;
}

function Badge({ children }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-black uppercase tracking-[0.24em] text-white/85">
      {children}
    </span>
  );
}

function SectionLabel({ children }) {
  return <p className="text-sm font-black uppercase tracking-[0.4em] text-cyan-300">{children}</p>;
}

function getRouteFromHash() {
  if (typeof window === "undefined") return "home";
  return window.location.hash.replace("#", "").split("?")[0].trim() || "home";
}

async function fetchJson(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
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
    <footer className="fixed bottom-0 inset-x-0 z-40 border-t border-white/10 bg-slate-950/80 py-4 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left: Copyright & Branding */}
        <div className="flex items-center gap-4">
          <button onClick={() => goTo("home")} className="flex items-center gap-2 group">
            <img src={QoohiLogo} alt="QOOHI Logo" className="h-8 w-8 rounded-lg border border-white/10 transition-transform group-hover:scale-110" />
            <span className="hidden text-sm font-black tracking-widest text-white sm:block">QOOHI</span>
          </button>
          <p className="hidden text-[10px] text-slate-500 sm:block">
            &copy; {new Date().getFullYear()}
          </p>
        </div>

        {/* Center: Quick Links (Desktop) */}
        <div className="hidden items-center gap-6 md:flex">
          {["iep"].map((id) => (
            <button
              key={id}
              onClick={() => id === "iep" ? openParentRegistration() : goTo(id)}
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 transition hover:text-cyan-400"
            >
              {id === "iep" ? "Learner IEP" : id}
            </button>
          ))}
        </div>

        {/* Right: Contact & Support */}
        <div className="flex items-center gap-5">
          <div className="flex gap-4">
            <a href="mailto:qoohitech@gmail.com" className="text-slate-400 hover:text-cyan-400 transition">
              <FaEnvelope className="text-lg" />
            </a>
            <a href="https://wa.me/254712451604" className="text-slate-400 hover:text-cyan-400 transition">
              <FaWhatsapp className="text-lg" />
            </a>
          </div>
          <button 
            onClick={() => goTo("contact")}
            className="rounded-full bg-cyan-400/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-cyan-300 border border-cyan-400/20 hover:bg-cyan-400/20 transition"
          >
            Support
          </button>
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

  return (
    <PageStack
      title="QOOHI AI"
      subtitle="Ask anything. Learn. Build. Create."
    >
      <GlassPanel className="flex h-[70vh] flex-col p-4">
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          

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

        <div className="flex items-center gap-2 border-t border-white/10 p-4">
          <input
            className="flex-1 rounded-xl bg-slate-950/60 px-4 py-3 text-white outline-none"
            placeholder="Type your message..."
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
