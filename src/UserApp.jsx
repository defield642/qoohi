import {
  useState,
  useEffect,
  useCallback,
  useMemo,
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
import bg1 from "./background/pexels-enginakyurt-1435752.jpg";
import bg2 from "./background/pexels-francesco-ungaro-673648.jpg";
import bg3 from "./background/pexels-pixabay-268533.jpg";
import bg4 from "./background/pexels-pixabay-356056.jpg";
import bg5 from "./background/pexels-pixabay-531880.jpg";
import bg6 from "./background/pexels-veeterzy-303383.jpg";
import fc26Img from "./games/fc26.jpeg";
import codImg from "./games/cod.jpeg";
import gtaImg from "./games/gta.jpeg";
import websiteImg from "./Tech/WEBSITE & SOFTWARE.webp";
import aiTechImg from "./Tech/AI TECH.webp";
import iepImg from "./home/iep.jpeg";
import learnImg from "./home/learn.jpeg";
import libraryImg from "./home/library.jpeg";
import loginImg from "./home/login.webp";
import qoohiAiImg from "./home/qoohi ai.jpeg";
import teacherImg from "./home/teacher.jpeg";

const MotionDiv = motion.div;

const API_BASE = import.meta.env.VITE_API_BASE || "";

const backgrounds = [bg1, bg2, bg3, bg4, bg5, bg6];
const navItems = [
  { id: "home", label: "Home", img: fc26Img },
  { id: "teachers", label: "Teachers", img: teacherImg },
  { id: "resources", label: "Resources", img: libraryImg },
  { id: "learn", label: "Learn", img: learnImg },
  { id: "games", label: "Games", img: gtaImg },
  { id: "new", label: "New on QOOHI", img: fc26Img },
  { id: "qoohiai", label: "QOOHI AI", img: qoohiAiImg },
  { id: "about", label: "About", img: loginImg },
  { id: "contact", label: "Contact", img: teacherImg },
];
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
    image: learnImg,
  },
];
const tournamentInfo = {
  title: "FC 26 Tournament",
  capacity: 10,
  feeKsh: 250,
  winnerPrizeKsh: 700,
  secondPrizeKsh: 300,
};

// Global set to prevent garbage collection of utterances (crucial for Chrome/Linux)
const activeUtterances = new Set();

const FEMALE_VOICE_KEYWORDS = [
  "female", "samantha", "karen", "moira", "tessa", "fiona", "veena",
  "zira", "hazel", "catherine", "alice", "microsoft heather",
  "google uk english female", "google us english female",
  "google français female", "google deutsch female",
];

function pickFemaleVoice(voices) {
  if (!voices || voices.length === 0) return null;
  const lower = voices.map((v) => ({ voice: v, name: v.name.toLowerCase() }));
  const byKeyword = lower.find((v) =>
    FEMALE_VOICE_KEYWORDS.some((kw) => v.name.includes(kw))
  );
  if (byKeyword) return byKeyword.voice;
  const byLang = lower.find((v) => v.name.includes("united states") || v.lang?.startsWith("en"));
  if (byLang) return byLang.voice;
  return voices[0];
}

function useVoiceGuide(voiceScript) {
  const [voiceEnabled, setVoiceEnabled] = useState(() => {
    return localStorage.getItem("qoohi_voice_enabled") !== "false";
  });
  const [isSpeaking, setIsSpeaking] = useState(false);

  const synth = typeof window !== "undefined" ? window.speechSynthesis : null;

  const speak = useCallback((force = false) => {
    if (!synth || !voiceScript || (!voiceEnabled && !force)) return;

    try {
      synth.cancel();
      
      const utterance = new SpeechSynthesisUtterance();
      utterance.text = voiceScript;
      utterance.lang = "en-US";
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        activeUtterances.delete(utterance);
      };
      utterance.onerror = (e) => {
        console.error("Speech error:", e);
        setIsSpeaking(false);
        activeUtterances.delete(utterance);
      };

      activeUtterances.add(utterance);

      const voices = synth.getVoices();
      const female = pickFemaleVoice(voices);
      if (female) utterance.voice = female;

      synth.speak(utterance);
    } catch (err) {
      console.error("Synthesis failed", err);
    }
  }, [synth, voiceScript, voiceEnabled]);

  useEffect(() => {
    if (!voiceEnabled || !voiceScript || !synth) return;

    const t = setTimeout(() => {
      if (!synth.speaking) speak();
    }, 1000);

    return () => {
      clearTimeout(t);
      synth.cancel();
    };
  }, [voiceScript, voiceEnabled, synth, speak]);

  const toggleVoice = () => {
    const newState = !voiceEnabled;
    setVoiceEnabled(newState);
    localStorage.setItem("qoohi_voice_enabled", newState.toString());
    if (newState) {
      setTimeout(() => speak(true), 50);
    } else {
      synth?.cancel();
      setIsSpeaking(false);
    }
  };

  return { voiceEnabled, toggleVoice, isSpeaking };
}

export default function UserApp() {
  const [route, setRoute] = useState(getRouteFromHash());
  const [registrationTarget, setRegistrationTarget] = useState({
    type: "course",
    packageKey: "coding_ai_training",
  });
  const [pendingVerification, setPendingVerification] = useState({
    email: "",
    mode: "register",
  });
  const [sessionToken, setSessionToken] = useState(
    localStorage.getItem("qoohi_session_token") || "",
  );
  const [dashboard, setDashboard] = useState(null);
  const [teacherOverview, setTeacherOverview] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [loadingDashboard, setLoadingDashboard] = useState(false);

  // 🔓 AUDIO UNBLOCKER
  useEffect(() => {
    const unlock = () => {
      if (window.speechSynthesis) {
        const silent = new SpeechSynthesisUtterance("");
        silent.volume = 0;
        window.speechSynthesis.speak(silent);
        window.removeEventListener("click", unlock);
        window.removeEventListener("keydown", unlock);
      }
    };
    window.addEventListener("click", unlock);
    window.addEventListener("keydown", unlock);
    return () => {
      window.removeEventListener("click", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  const refreshTeacherOverview = useCallback(async () => {
    if (!sessionToken || !dashboard || dashboard.student?.role !== "teacher") {
      setTeacherOverview(null);
      return null;
    }
    const data = await fetchJson("/api/teacher/overview", {
      headers: { Authorization: `Bearer ${sessionToken}` },
    });
    setTeacherOverview(data);
    return data;
  }, [dashboard, sessionToken]);

  useEffect(() => {
    refreshTeacherOverview().catch(() => setTeacherOverview(null));
  }, [refreshTeacherOverview]);

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
      .then((data) => setDashboard(data.dashboard))
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
    return data.dashboard;
  }, [sessionToken]);

  const goTo = (nextRoute) => {
    window.location.hash = nextRoute === "home" ? "" : nextRoute;
    setRoute(nextRoute);
  };

  const openCourseRegistration = (packageKey) => {
    setRegistrationTarget({ type: "course", packageKey });
    goTo("register");
  };

  const openMaterialsPage = () => {
    goTo("resources");
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
    });
    setStatusMessage(data.message || "Verification code sent.");
    goTo("verify");
  };

  const handleCodeVerify = async ({ email, code, mode }) => {
    const data = await fetchJson("/api/auth/verify-code", {
      method: "POST",
      body: JSON.stringify({ email, code, mode }),
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

  return (
    <div
      className="min-h-screen bg-slate-950 text-white"
      style={{
        backgroundImage: `linear-gradient(145deg, rgba(3,7,18,0.92), rgba(15,23,42,0.86)), url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <Header route={route} goTo={goTo} />
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
              <HomePage
                dashboard={dashboard}
                goTo={goTo}
              />
            )}
            {route === "about" && <AboutPage goTo={goTo} />}
            {route === "iep" && <IEPPage openIepRegistration={openIepRegistration} />}
            {route === "teachers" && <TeachersPage openTeacherRegistration={openTeacherRegistration} />}
            {route === "resources" && <ResourcesPage openParentRegistration={openParentRegistration} sessionToken={sessionToken} />}
            {route === "games" && <GamesPage />}
            {route === "new" && (
              <NewPage openMaterialsPage={openMaterialsPage} />
            )}
            {route === "learn" && (
              <LearnPage openCourseRegistration={openCourseRegistration} />
            )}
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
              />
            )}
            {route === "dashboard" && (
              <DashboardPage
                dashboard={dashboard}
                teacherOverview={teacherOverview}
                sessionToken={sessionToken}
                goTo={goTo}
                onRefresh={refreshDashboard}
                onRefreshTeacherOverview={refreshTeacherOverview}
                onUpdateIep={async (userId, assessmentStatus, performanceLevel) => {
                  try {
                    const data = await fetchJson(`/api/admin/users/${userId}/iep`, {
                      method: "POST",
                      headers: { Authorization: `Bearer ${sessionToken}` },
                      body: JSON.stringify({ assessmentStatus, performanceLevel }),
                    });
                    setTeacherOverview(data);
                  } catch (err) {
                    setStatusMessage(err.message);
                  }
                }}
                loading={loadingDashboard}
                logout={logout}
              />
            )}
            {route === "qoohiai" && <QoohiAIPage sessionToken={sessionToken} />}
          </MotionDiv>
        </AnimatePresence>
      </main>
      <Footer goTo={goTo} />
    </div>
  );
}

function Header({ route, goTo }) {
  const [logoFailed, setLogoFailed] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/80 shadow-2xl backdrop-blur-2xl">
      <div className="mx-auto max-w-[1400px] px-[clamp(0.75rem,2vw,1.5rem)] py-[clamp(0.5rem,1vw,0.8rem)] sm:px-[clamp(1rem,2vw,1.5rem)]">
        <div className="flex items-center gap-[clamp(0.5rem,1vw,0.9rem)]">
          <button
            type="button"
            onClick={() => goTo("home")}
            className="group flex flex-shrink-0 items-center gap-[clamp(0.35rem,0.8vw,0.75rem)] transition-transform active:scale-95"
          >
            <div className="relative h-[clamp(2.2rem,5vw,3.5rem)] w-[clamp(2.2rem,5vw,3.5rem)]">
              <div className="absolute -inset-1 rounded-xl bg-cyan-400 opacity-20 blur-md transition-opacity group-hover:opacity-40" />
              {logoFailed ? (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-cyan-400 text-[clamp(1rem,2vw,1.35rem)] font-black text-slate-900">
                  Q
                </div>
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
              <h1 className="text-[clamp(1rem,2vw,1.45rem)] font-black leading-none tracking-[-0.02em] text-white">
                QOOHI
              </h1>
              <p className="mt-1 text-[clamp(0.42rem,0.9vw,0.62rem)] font-black uppercase tracking-[0.38em] text-cyan-400">
                Digital Future
              </p>
            </div>
          </button>

          <nav className="min-w-0 flex-1">
            <div
              className="no-scrollbar flex w-full items-center overflow-x-auto rounded-[clamp(0.85rem,2vw,1.2rem)] border border-white/10 bg-white/5 px-[clamp(0.2rem,0.5vw,0.35rem)] py-[clamp(0.18rem,0.45vw,0.3rem)] backdrop-blur-md"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              <div className="flex w-max min-w-full items-center gap-[clamp(0.2rem,0.45vw,0.45rem)]">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-current={route === item.id ? "page" : undefined}
                    onClick={() => goTo(item.id)}
                    className={`flex flex-none items-center gap-[clamp(0.2rem,0.45vw,0.4rem)] rounded-full px-[clamp(0.35rem,0.75vw,0.65rem)] py-[clamp(0.28rem,0.6vw,0.5rem)] text-[clamp(0.42rem,0.8vw,0.72rem)] font-black uppercase tracking-[0.16em] transition-all duration-300 ${
                      route === item.id
                        ? "bg-cyan-400 text-slate-900 shadow-[0_0_15px_rgba(34,211,238,0.35)]"
                        : "text-slate-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <div className="h-[clamp(0.85rem,1.9vw,1.35rem)] w-[clamp(0.85rem,1.9vw,1.35rem)] overflow-hidden rounded-full">
                      <img
                        src={item.img}
                        alt=""
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                    <span className="whitespace-nowrap leading-none">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}

function HomePage({ dashboard, goTo }) {
  const firstName = dashboard?.student?.fullName?.split(" ")[0];
  const voiceScript = `Welcome ${firstName || ""} to QOOHI. We are elevating learning, creativity, and play. Explore our FC 26 tournaments, individualized education programs, and advanced AI training. Your journey to mastery starts here.`;
  const { voiceEnabled, toggleVoice, isSpeaking } = useVoiceGuide(voiceScript);

  return (
    <div className="relative flex min-h-[78vh] items-center justify-center overflow-hidden px-4">
      {/* VOICE TOGGLE */}
      <div className="absolute right-6 top-6 z-20">
        <button
          onClick={toggleVoice}
          className={`flex items-center gap-3 rounded-2xl border px-6 py-4 transition-all active:scale-95 ${
            voiceEnabled 
              ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.2)]" 
              : "border-white/10 bg-white/5 text-slate-500"
          }`}
        >
          <div className="relative flex h-3 w-3">
            {(voiceEnabled || isSpeaking) && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>}
            <span className={`relative inline-flex h-3 w-3 rounded-full ${voiceEnabled ? "bg-cyan-400" : "bg-slate-600"}`}></span>
          </div>
          <span className="text-xs font-black uppercase tracking-widest">
            {isSpeaking ? "Speaking..." : voiceEnabled ? "Voice Guide On" : "Voice Guide Off"}
          </span>
        </button>
      </div>

      {/* BACKGROUND GLOW */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.25, 0.4, 0.25],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
          }}
          className="absolute left-1/2 top-1/2 h-[550px] w-[550px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/10 blur-3xl"
        />
      </div>

      {/* CONTENT */}
      <div className="relative z-10 w-full max-w-6xl px-4 py-20 text-center">
        {/* WELCOME */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-6"
        >
          <span className="inline-block rounded-full border border-cyan-400/20 bg-cyan-400/10 px-6 py-2 text-[10px] font-black uppercase tracking-[0.5em] text-cyan-400 backdrop-blur-md shadow-[0_0_20px_rgba(34,211,238,0.1)]">
            {firstName ? `Welcome Back, ${firstName}` : "Welcome To The Future"}
          </span>
        </motion.div>

        {/* QOOHI */}
        <div className="relative inline-block group">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 1,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="
              relative
              z-10
              bg-gradient-to-b
              from-white
              via-white/90
              to-cyan-200/40
              bg-clip-text
              text-6xl
              xs:text-7xl
              font-black
              leading-none
              tracking-tight
              text-transparent
              sm:text-[9rem]
              lg:text-[13rem]
              xl:text-[15rem]
            "
          >
            QOOHI
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            className="absolute inset-0 z-0 blur-3xl bg-cyan-400/30 -inset-x-10 group-hover:bg-cyan-400/50 transition-colors duration-1000"
          />
        </div>

        {/* SUBTEXT */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            delay: 0.4,
            duration: 1,
          }}
          className="mx-auto mt-8 max-w-2xl text-lg font-medium tracking-[0.2em] text-slate-400 sm:text-2xl"
        >
          Elevating <span className="text-white border-b border-cyan-400/30 pb-1">Learning</span>, <span className="text-white border-b border-cyan-400/30 pb-1">Creativity</span> & <span className="text-white border-b border-cyan-400/30 pb-1">Play</span>
        </motion.p>

        {/* BUTTONS GRID */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.7,
            duration: 0.8,
          }}
          className="mt-20 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 xl:gap-6"
        >
          {/* FC26 */}
          <HomeButton 
            onClick={() => goTo("new")}
            image={fc26Img}
            label="Materials"
            sublabel="Grades 1-9"
          />

          {/* LEARN */}
          <HomeButton 
            onClick={() => goTo("learn")}
            image={learnImg}
            label="Learn"
            sublabel="Courses"
          />

          {/* LOGIN */}
          <HomeButton
            onClick={() => {
              if (dashboard) {
                goTo("dashboard");
              } else {
                goTo("login");
              }
            }}
            image={loginImg}
            label={dashboard ? "Dashboard" : "Login"}
            sublabel="Dashboard"
          />
       
          {/* PARENTS */}
          <HomeButton 
            onClick={openParentRegistration}
            image={libraryImg}
            label="Parent"
            sublabel="Register"
          />

          {/* TEACHERS */}
          <HomeButton 
            onClick={() => goTo("teachers")}
            image={teacherImg}
            label="Teacher"
            sublabel="Community"
          />

          {/* RESOURCES */}
          <HomeButton 
            onClick={() => goTo("resources")}
            image={libraryImg}
            label="Library"
            sublabel="Resources"
          />

          {/* QOOHI AI */}
          <HomeButton 
            onClick={() => goTo("qoohiai")}
            image={qoohiAiImg}
            label="QOOHI AI"
            sublabel="Smart Assistant"
            highlight
          />
        </motion.div>
      </div>
    </div>
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

function EventHero() {
  return (
    <div className="relative">
      <img
        src={fc26Img}
        alt="FC 26 tournament"
        className="h-[320px] w-full rounded-[2rem] object-cover shadow-2xl shadow-black/50"
      />
      <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-t from-slate-950 via-slate-950/10 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-amber-200">
          New on QOOHI
        </p>
        <h2 className="mt-2 text-3xl font-black text-white">{tournamentInfo.title}</h2>
        <p className="mt-2 text-sm text-slate-200">
          Register with Ksh {tournamentInfo.feeKsh}. Winner gets Ksh{" "}
          {tournamentInfo.winnerPrizeKsh}.
        </p>
      </div>
    </div>
  );
}

function AboutPage({ goTo }) {
  const [qaInput, setQaInput] = useState("");
  const [qaLoading, setQaLoading] = useState(false);
  const [qaMessages, setQaMessages] = useState([]);

  const voiceScript = "Welcome to QOOHI. We are on a mission to bridge the gap between potential and success for every Kenyan student. Our platform combines advanced diagnostics with expert mentorship to create a truly personalized learning journey. I am here to answer any questions you may have about our vision, programs, or tournaments. Just type your question below.";

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
        2. Human Centered (Teachers as mentors focusing on emotional/cognitive growth).
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
    <PageStack title="Our Story" subtitle="Pioneering the next generation of individualized education." voiceScript={voiceScript}>
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
            <ActionButton className="!px-12 !py-6 !text-xl shadow-[0_0_30px_rgba(34,211,238,0.3)]" onClick={() => goTo("learn")}>
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

function IEPPage({ openIepRegistration }) {
  const voiceScript = "Welcome to the Individualized Education Program. Here, we don't just teach; we transform. Every student receives a unique diagnostic assessment to find their perfect learning band. From Foundational to Advanced, we map your path to success.";

  return (
    <PageStack 
      title="Individualized Education" 
      subtitle="Data-driven diagnostic assessment and adaptive level placement."
      voiceScript={voiceScript}
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
          <ActionButton className="w-full !text-xl !py-6 !rounded-[2rem]" onClick={openIepRegistration}>Register for Assessment</ActionButton>
        </div>
      </div>
    </PageStack>
  );
}

function TeachersPage({ openTeacherRegistration }) {
  return (
    <PageStack 
      title="Teacher Portal" 
      subtitle="Teachers as Solution Providers"
    >
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="relative overflow-hidden rounded-[3rem] border border-white/10 bg-slate-900 group">
          <img src={teacherImg} alt="Teachers" className="absolute inset-0 h-full w-full object-cover opacity-40 transition-transform duration-700 group-hover:scale-110" />
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
          <ActionButton className="mt-12 !text-xl !py-6 !rounded-[2rem]" onClick={openTeacherRegistration}>Register as Teacher</ActionButton>
        </div>
      </div>
    </PageStack>
  );
}

function ResourcesPage({ openParentRegistration, sessionToken }) {
  const voiceScript = "Kenyan CBC materials for grades one through nine. Describe what you need, generate a printable lesson pack, and download it after payment.";
  const [gradeLevel, setGradeLevel] = useState("1");
  const [prompt, setPrompt] = useState("");
  const [materialTitle, setMaterialTitle] = useState("");
  const [materialBody, setMaterialBody] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [status, setStatus] = useState("");
  const [loadingMaterial, setLoadingMaterial] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let active = true;
    fetchJson("/api/public/teachers")
      .then((data) => {
        if (active) setTeachers(Array.isArray(data.teachers) ? data.teachers : []);
      })
      .catch(() => {
        if (active) setTeachers([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const keywordScore = (teacher) => {
    const haystack = `${teacher.full_name || ""} ${teacher.specializations || ""}`.toLowerCase();
    const tokens = `${gradeLevel} ${prompt}`.toLowerCase().split(/[^a-z0-9]+/).filter((item) => item.length > 2);
    return tokens.reduce((score, token) => score + (haystack.includes(token) ? 2 : 0), 0) + (teacher.specializations ? 1 : 0);
  };

  const recommendedTeachers = [...teachers]
    .sort((left, right) => keywordScore(right) - keywordScore(left))
    .slice(0, 4);

  const requestMaterials = async () => {
    const topic = prompt.trim();
    if (!topic) {
      throw new Error("Describe the material you want before generating it.");
    }
    setLoadingMaterial(true);
    setStatus("");
    try {
      const data = await fetchJson("/api/ai/materials", {
        method: "POST",
        body: JSON.stringify({ grade: gradeLevel, topic }),
      });
      setMaterialTitle(data.title || `Grade ${gradeLevel} materials`);
      setMaterialBody(data.content || "");
      setStatus("Materials ready. Review the preview below.");
      return data;
    } finally {
      setLoadingMaterial(false);
    }
  };

  const downloadMaterials = async () => {
    setDownloading(true);
    setStatus("");
    try {
      if (!sessionToken) {
        throw new Error("Please log in before downloading materials.");
      }
      const generated = materialBody ? { title: materialTitle, content: materialBody } : await requestMaterials();
      await fetchJson("/api/user/service/use", {
        method: "POST",
        headers: { Authorization: `Bearer ${sessionToken}` },
        body: JSON.stringify({ serviceKey: "materials_download" }),
      });
      const fileTitle = generated.title || `Grade ${gradeLevel} materials`;
      const blob = new Blob([
        `${fileTitle}

${generated.content || materialBody || ""}
`,
      ], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${fileTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "qoohi-materials"}.txt`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      setStatus("Download started after charging Ksh 10.");
    } catch (err) {
      setStatus(err.message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <PageStack
      title="Kenyan Materials"
      subtitle="Grades 1 to 9 learning packs, teacher recommendations, and instant printable downloads."
      voiceScript={voiceScript}
    >
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6 rounded-[3rem] border border-white/10 bg-slate-950/90 p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <SectionLabel>Grade selector</SectionLabel>
              <h2 className="mt-2 text-3xl font-black text-white">Choose Grade {gradeLevel}</h2>
            </div>
            <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-cyan-300">
              Download Ksh 10
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:grid-cols-9">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((grade) => (
              <button
                key={grade}
                type="button"
                onClick={() => setGradeLevel(String(grade))}
                className={`rounded-2xl border px-3 py-3 text-sm font-black transition ${
                  String(gradeLevel) === String(grade)
                    ? "border-cyan-300 bg-cyan-300 text-slate-950"
                    : "border-white/10 bg-white/5 text-white hover:border-cyan-400/40 hover:bg-cyan-400/10"
                }`}
              >
                {grade}
              </button>
            ))}
          </div>

          <label className="block space-y-3">
            <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Describe what you want</span>
            <textarea
              rows="6"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Example: make revision notes and exercises for Grade 4 fractions with simple answers"
              className="w-full rounded-[1.5rem] border border-white/10 bg-slate-950/80 px-4 py-4 text-white outline-none placeholder:text-slate-600 focus:border-cyan-300/60"
            />
          </label>

          <div className="flex flex-wrap gap-3">
            <ActionButton type="button" onClick={requestMaterials} disabled={loadingMaterial} className="!px-6 !py-3 !text-sm">
              {loadingMaterial ? "Generating..." : "Generate materials"}
            </ActionButton>
            <button
              type="button"
              onClick={downloadMaterials}
              disabled={downloading}
              className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-6 py-3 text-sm font-black text-emerald-200 transition hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {downloading ? "Downloading..." : "Download for Ksh 10"}
            </button>
            <button
              type="button"
              onClick={openParentRegistration}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
            >
              Register as Parent
            </button>
          </div>

          {status && <Notice tone={status.toLowerCase().includes("ready") ? "info" : "error"}>{status}</Notice>}

          {materialBody && (
            <div className="rounded-[2rem] border border-cyan-400/20 bg-cyan-400/5 p-6">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-300">Preview</p>
              <h3 className="mt-2 text-2xl font-black text-white">{materialTitle || `Grade ${gradeLevel} materials`}</h3>
              <pre className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-300">{materialBody}</pre>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-[3rem] border border-white/10 bg-white/5 p-6 sm:p-8">
            <SectionLabel>Teacher recommendations</SectionLabel>
            <h3 className="mt-2 text-2xl font-black text-white">Who to contact</h3>
            <p className="mt-2 text-sm text-slate-400">These are the teachers most aligned with the grade and topic you typed.</p>
            <div className="mt-6 space-y-3">
              {recommendedTeachers.length === 0 && <p className="rounded-2xl border border-white/5 bg-white/5 px-4 py-4 text-sm text-slate-500">No teachers available yet.</p>}
              {recommendedTeachers.map((teacher) => {
                const phone = String(teacher.whatsapp || "").replace(/\D/g, "");
                const message = `Hello ${teacher.full_name || "teacher"}, I need help with Grade ${gradeLevel} materials: ${prompt || "general guidance"}`;
                const whatsappHref = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}` : null;
                return (
                  <div key={teacher.id} className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="text-lg font-black text-white">{teacher.full_name}</p>
                        <p className="mt-1 text-sm text-slate-400">{teacher.specializations || "General support"}</p>
                        <p className="mt-1 text-xs text-slate-500">{teacher.email}</p>
                      </div>
                      {whatsappHref && (
                        <a href={whatsappHref} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-slate-950 transition hover:bg-emerald-300">
                          WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[3rem] border border-cyan-400/20 bg-cyan-400/5 p-6 sm:p-8">
            <SectionLabel>How it works</SectionLabel>
            <ol className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
              <li>1. Select a grade from 1 to 9.</li>
              <li>2. Describe the exact topic or exercise you need.</li>
              <li>3. Generate the materials with OpenAI.</li>
              <li>4. Download the file after the Ksh 10 charge is processed.</li>
            </ol>
          </div>
        </div>
      </div>
    </PageStack>
  );
}

function GamesPage() {
  const voiceScript = "Welcome to QOOHI Games. This is where competition meets community. Whether you are here for the FC 26 tournament, squad tactics in COD, or the social hub of GTA, gaming on QOOHI is about more than just play—it is about mastery and engagement. Join a tournament and climb the standings today.";
  const games = [
    { name: "FC 26", copy: "Tournament football and community competition.", image: fc26Img, sub: "Community Play" },
    { name: "COD", copy: "Action and squad-based gameplay.", image: codImg, sub: "Squad Tactics" },
    { name: "GTA", copy: "Open world sessions with social play energy.", image: gtaImg, sub: "Social Hub" },
  ];

  return (
    <PageStack title="QOOHI Games" subtitle="Gaming feeds tournament registration and standings." voiceScript={voiceScript}>
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

function NewPage({ openMaterialsPage }) {
  const voiceScript = "Browse grade 1 to grade 9 Kenyan learning materials and open the full materials workspace.";

  return (
    <PageStack
      title="Materials Spotlight"
      subtitle="Quick access to the new Kenyan CBC materials workspace."
      voiceScript={voiceScript}
    >
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative overflow-hidden rounded-[4rem] border border-white/10 bg-slate-950 shadow-2xl group">
          <img src={libraryImg} alt="Materials library" className="absolute inset-0 h-full w-full object-cover opacity-20 transition-transform duration-1000 group-hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950/45 to-transparent" />
          <div className="relative p-10 sm:p-16">
            <SectionLabel>Kenyan CBC</SectionLabel>
            <h2 className="mt-6 text-5xl font-black text-white leading-tight sm:text-6xl">Grade 1 to 9 materials, generated on demand.</h2>
            <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-300">
              Parents can describe what they want, generate printable notes and exercises with OpenAI, and download the pack after a small Ksh 10 charge.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <button onClick={openMaterialsPage} className="inline-flex items-center gap-2 rounded-full bg-cyan-300 px-6 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-200">
                Open Materials
              </button>
              <button onClick={() => window.location.hash = "learn"} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10">
                View Courses
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          {[
            { title: "Grades 1-3", text: "Reading basics, counting, and guided practice." },
            { title: "Grades 4-6", text: "Core CBC revision, notes, and homework packs." },
            { title: "Grades 7-9", text: "Deeper subject support and exam prep materials." },
          ].map((item) => (
            <div key={item.title} className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-md">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-300">{item.title}</p>
              <p className="mt-3 text-sm leading-7 text-slate-300">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </PageStack>
  );
}

function LearnPage({ openCourseRegistration }) {
  const voiceScript = "Welcome to QOOHI Learning. Master the digital future with our expert-led courses. Choose from our Starter Track for computer essentials, our Creator Track for Coding and AI, or enroll in the Full Course for the ultimate transformation. Your journey to digital mastery starts here.";

  return (
    <PageStack 
      title="Mastery Center" 
      subtitle="Expert-led paths for Computer Packages, Coding, and Artificial Intelligence."
      voiceScript={voiceScript}
    >
      <div className="grid gap-8 lg:grid-cols-3">
        {packageCards.map((item) => (
          <div key={item.key} className="group relative flex h-full flex-col overflow-hidden rounded-[3rem] border border-white/10 bg-slate-950 transition-all duration-500 hover:border-cyan-400/30 hover:shadow-[0_0_40px_rgba(34,211,238,0.15)]">
            <div className="relative h-64 overflow-hidden bg-gradient-to-br from-slate-900 to-slate-950 p-10 flex flex-col justify-end">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-cyan-400/5 blur-3xl transition-all group-hover:bg-cyan-400/10" />
              <div className="relative z-10">
                <SectionLabel className="!text-cyan-400">{item.badge}</SectionLabel>
                <h2 className="mt-4 text-4xl font-black text-white uppercase tracking-tighter italic leading-none">{item.name}</h2>
              </div>
            </div>
            
            <div className="flex flex-1 flex-col p-8">
              <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-md">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-200/60">
                  Curriculum Includes
                </p>
                <ul className="mt-5 space-y-4 text-sm font-bold text-slate-300">
                  {item.courses.map((course) => (
                    <li key={course} className="flex items-center gap-3">
                      <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                      <span>{course}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="mt-auto pt-8 flex items-center justify-between border-t border-white/5">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tuition Fee</p>
                  <p className="mt-1 text-3xl font-black text-white">Ksh {item.priceKsh.toLocaleString()}</p>
                </div>
                <ActionButton onClick={() => openCourseRegistration(item.key)} className="!py-4 !px-8 !rounded-2xl shadow-xl shadow-cyan-400/20">
                  Enroll
                </ActionButton>
              </div>
            </div>
          </div>
        ))}
      </div>
    </PageStack>
  );
}

function ContactPage() {
  const voiceScript = "Need to get in touch? We are here to help. You can reach us via email, WhatsApp, or access your student dashboard for support. We look forward to hearing from you.";
  return (
    <PageStack title="Contact QOOHI" voiceScript={voiceScript}>
      <div className="grid gap-6 md:grid-cols-3">
        <ContactCard icon={FaEnvelope} label="Email" value="Email QOOHI" href="mailto:qoohitech@gmail.com" />
        <ContactCard
          icon={FaWhatsapp}
          label="WhatsApp"
          value="+254 712 451604"
          href="https://wa.me/254712451604?text=QOOHI%20HELLO"
        />
        <ContactCard icon={FaUsers} label="STUDENT ACCESS" value="DASHBOARD" href="#login" />
      </div>
    </PageStack>
  );
}

function RegisterPage({ registrationTarget, onSubmit, statusMessage }) {
  const [form, setForm] = useState({ fullName: "", whatsapp: "", email: "", specialization: "", childName: "", childGradeLevel: "", childGoals: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const selectedPackage = packageCards.find((item) => item.key === registrationTarget.packageKey);
  const isTournament = registrationTarget.type === "tournament";
  const isTeacher = registrationTarget.type === "teacher";
  const isStudent = registrationTarget.type === "student";
  const isParent = registrationTarget.type === "parent";
  const isIep = registrationTarget.type === "iep";

  const getEyebrow = () => {
    if (isTournament) return "Tournament registration";
    if (isTeacher) return "Teacher Registration";
    if (isStudent) return "Learner Registration";
    if (isParent) return "Parent Registration";
    if (isIep) return "IEP Assessment Registration";
    return "Course registration";
  };

  const getTitle = () => {
    if (isTournament) return "Register for the FC 26 tournament";
    if (isTeacher) return "Join as a Problem-Solving Teacher";
    if (isStudent) return "Register for Individualized Learning";
    if (isParent) return "Register as a Supporting Parent";
    if (isIep) return "Register for IEP Assessment";
    return `Register for ${selectedPackage?.name || "QOOHI learning"}`;
  };

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await onSubmit({
        ...form,
        mode: "register",
        registrationType: registrationTarget.type,
        selectedPackage: (isTeacher || isStudent || isParent || isTournament || isIep) ? "" : registrationTarget.packageKey,
        specialization: form.specialization,
        childName: form.childName,
        childGradeLevel: form.childGradeLevel,
        childGoals: form.childGoals,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CenteredPanel
      eyebrow={getEyebrow()}
      title={getTitle()}
    >
      <div className="mb-6 rounded-[1.5rem] border border-cyan-300/20 bg-cyan-400/10 p-6 text-lg font-bold text-cyan-50">
        {isTournament ? (
          <ul className="space-y-1">
            <li>• Entry Fee: Ksh {tournamentInfo.feeKsh}</li>
            <li>• Winner: Ksh {tournamentInfo.winnerPrizeKsh}</li>
          </ul>
        ) : isTeacher ? (
          <ul className="space-y-1">
            <li>• Access IEP Tools</li>
            <li>• Placement Data</li>
            <li>• Teaching Resources</li>
          </ul>
        ) : isStudent ? (
          <ul className="space-y-1">
            <li>• Diagnostic Assessment</li>
            <li>• Personal Roadmap</li>
            <li>• Level Placement</li>
          </ul>
        ) : isIep ? (
          <ul className="space-y-1">
            <li>• Diagnostic Assessment</li>
            <li>• Personalized Learning Plan</li>
            <li>• Level Placement</li>
          </ul>
        ) : isParent ? (
          <ul className="space-y-1">
            <li>• Progress Tracking</li>
            <li>• Material Purchase</li>
          </ul>
        ) : (
          <p>
            • Package: <strong>{selectedPackage?.name}</strong> <br />
            • Price: <strong>Ksh {selectedPackage?.priceKsh}</strong>
          </p>
        )}
      </div>
      <form className="space-y-4" onSubmit={submit}>
        <Input label="Full name" value={form.fullName} onChange={(value) => setForm((current) => ({ ...current, fullName: value }))} />
        <Input label="WhatsApp number" value={form.whatsapp} onChange={(value) => setForm((current) => ({ ...current, whatsapp: value }))} />
        <Input label="Email address" type="email" value={form.email} onChange={(value) => setForm((current) => ({ ...current, email: value }))} />
        {isTeacher && (
          <Input
            label="Specialization"
            value={form.specialization}
            onChange={(value) => setForm((current) => ({ ...current, specialization: value }))}
            placeholder="Math, Science, English, CBC support"
          />
        )}
        {isParent && (
          <div className="space-y-4">
            <Input
              label="Child name"
              value={form.childName}
              onChange={(value) => setForm((current) => ({ ...current, childName: value }))}
              placeholder="Student full name"
            />
            <Input
              label="Grade level"
              value={form.childGradeLevel}
              onChange={(value) => setForm((current) => ({ ...current, childGradeLevel: value }))}
              placeholder="Grade 1 to Grade 9"
            />
            <label className="block space-y-2">
              <span className="text-sm font-bold text-slate-300">Goals for your child</span>
              <textarea
                rows="4"
                value={form.childGoals}
                onChange={(event) => setForm((current) => ({ ...current, childGoals: event.target.value }))}
                placeholder="Example: improve reading fluency, pass maths, and build confidence"
                className="w-full rounded-[1.5rem] border border-white/10 bg-slate-950/80 px-4 py-4 text-white outline-none placeholder:text-slate-600 focus:border-cyan-300/60"
              />
            </label>
          </div>
        )}
        {statusMessage && <Notice tone="info">{statusMessage}</Notice>}
        {error && <Notice tone="error">{error}</Notice>}
        <ActionButton disabled={submitting} type="submit">
          {submitting ? "Sending code..." : "Send code"}
        </ActionButton>
      </form>
    </CenteredPanel>
  );
}

function VerifyPage({ pendingVerification, onVerify, statusMessage }) {
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await onVerify({
        email: pendingVerification.email,
        code,
        mode: pendingVerification.mode,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CenteredPanel eyebrow="Verify code">
      <form className="space-y-4" onSubmit={submit}>
        <Input label="Verification code" value={code} onChange={setCode} />
        {statusMessage && <Notice tone="info">{statusMessage}</Notice>}
        {error && <Notice tone="error">{error}</Notice>}
        <ActionButton disabled={submitting} type="submit">
          {submitting ? "Verifying..." : "Verify and continue"}
        </ActionButton>
      </form>
    </CenteredPanel>
  );
}

function LoginPage({ onSubmit, statusMessage }) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await onSubmit({ email });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CenteredPanel eyebrow="login">
      <form className="space-y-4" onSubmit={submit}>
        <Input label="Email address" type="email" value={email} onChange={setEmail} />
        {statusMessage && <Notice tone="info">{statusMessage}</Notice>}
        {error && <Notice tone="error">{error}</Notice>}
        <ActionButton disabled={submitting} type="submit">
          {submitting ? "Sending..." : "Send login code"}
        </ActionButton>
      </form>
    </CenteredPanel>
  );
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
  onRefreshTeacherOverview,
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
  const [depositForm, setDepositForm] = useState({
    amount: "",
    mpesaRef: "",
    phone: "",
  });
  const [withdrawForm, setWithdrawForm] = useState({
    amount: "",
    mpesaName: "",
    mpesaNumber: "",
  });
  const [teacherSpecializationsDraft, setTeacherSpecializationsDraft] = useState("");
  
  // Parent materials state
  const [parentGradeLevel, setParentGradeLevel] = useState("1");
  const [parentPrompt, setParentPrompt] = useState("");
  const [parentMaterialTitle, setParentMaterialTitle] = useState("");
  const [parentMaterialBody, setParentMaterialBody] = useState("");
  const [parentLoadingMaterial, setParentLoadingMaterial] = useState(false);
  const [parentStatus, setParentStatus] = useState("");
  const [parentDownloading, setParentDownloading] = useState(false);

  useEffect(() => {
    if (!dashboard?.student) return;
    setProfileDraft({
      fullName: dashboard.student.fullName || "",
      whatsapp: dashboard.student.whatsapp || "",
      avatarUrl: dashboard.student.avatarUrl || "",
    });
    if (dashboard.student.role === "teacher") {
      setTeacherSpecializationsDraft(dashboard.student.specializations || teacherOverview?.currentTeacher?.specializations || "");
    }
  }, [dashboard, teacherOverview]);

  // Auto-generate materials when grade changes for parent
  useEffect(() => {
    if (dashboard?.student?.role === "parent" && parentPrompt.trim()) {
      const timer = setTimeout(() => {
        requestParentMaterials();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [parentGradeLevel, parentPrompt]);

  const requestParentMaterials = async () => {
    const topic = parentPrompt.trim();
    if (!topic || dashboard?.student?.role !== "parent") return;
    
    setParentLoadingMaterial(true);
    setParentStatus("");
    try {
      const data = await fetchJson("/api/ai/materials", {
        method: "POST",
        body: JSON.stringify({ grade: parentGradeLevel, topic }),
      });
      setParentMaterialTitle(data.title || `Grade ${parentGradeLevel} materials`);
      setParentMaterialBody(data.content || "");
      setParentStatus("Materials ready. You can download below.");
    } catch (err) {
      setParentStatus(err.message || "Failed to generate materials.");
    } finally {
      setParentLoadingMaterial(false);
    }
  };

  const downloadParentMaterials = async () => {
    setParentDownloading(true);
    setParentStatus("");
    try {
      if (!sessionToken) {
        throw new Error("Please log in before downloading materials.");
      }
      if (!parentMaterialBody) {
        await requestParentMaterials();
      }
      await fetchJson("/api/user/service/use", {
        method: "POST",
        headers: { Authorization: `Bearer ${sessionToken}` },
        body: JSON.stringify({ serviceKey: "materials_download" }),
      });
      const fileTitle = parentMaterialTitle || `Grade ${parentGradeLevel} materials`;
      const blob = new Blob([
        `${fileTitle}\n\n${parentMaterialBody || ""}\n`,
      ], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${fileTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "qoohi-materials"}.txt`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      setParentStatus("Download started after charging Ksh 10.");
    } catch (err) {
      setParentStatus(err.message);
    } finally {
      setParentDownloading(false);
    }
  };

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
  const canAfford = (charge) => Number(charge || 0) <= 0 || balance >= Number(charge || 0);
  const authHeaders = sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {};
  const profileUpdateCharge = Number(
    serviceCharges.find((service) => service.service_key === "profile_update")?.charge_ksh || 0,
  );
  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);
  const firstName = fullName?.split(" ")[0] || "";
  const profileScript = `Welcome ${firstName || ""} to your QOOHI dashboard. Review your profile, balance, services, and activity. Deposit funds, withdraw when needed, and keep your learning journey moving.`;

  const teacherChildren = Array.isArray(teacherOverview?.children) ? teacherOverview.children : [];
  const teacherRoster = Array.isArray(teacherOverview?.teachers) ? teacherOverview.teachers : [];

  const serviceActions = {
    computer_packages: { route: "learn", label: "Open Courses" },
    coding_ai_training: { route: "learn", label: "Open Courses" },
    both: { route: "learn", label: "Open Courses" },
    tournament_entry: { route: "new", label: "Join Tournament" },
    ai_chat: { route: "qoohiai", label: "Open AI" },
    resume_generation: { route: "qoohiai", label: "Build Resume" },
    cyber_services: { route: "contact", label: "Open Support" },
    iep_assessment: { route: "iep", label: "Take Assessment" },
    teacher_registration: { route: "teachers", label: "Open Teachers" },
    parent_registration: { route: "resources", label: "Open Resources" },
    profile_update: { route: null, label: "Edit Profile" },
  };

  const sidebarNav = [
    { id: "profile", Icon: FaUserGraduate, label: "Profile" },
    { id: "balance", Icon: FaWallet, label: "Balance" },
    { id: "services", Icon: FaLayerGroup, label: "Services" },
    { id: "activity", Icon: FaHistory, label: "Activity" },
    ...(isParent ? [{ id: "materials", Icon: FaBookOpen, label: "Materials" }] : []),
    ...(hasCourses ? [{ id: "courses", Icon: FaBookOpen, label: "Courses" }] : []),
    ...(isStudent && assessmentStatus === "completed" ? [{ id: "roadmap", Icon: FaGraduationCap, label: "Roadmap" }] : []),
    ...(isTeacher ? [{ id: "roster", Icon: FaChalkboardTeacher, label: "Roster" }] : []),
    ...(isParent ? [{ id: "parent", Icon: FaUsers, label: "Support" }] : []),
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
    try {
      await fetchJson("/api/deposit/submit", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          amount: depositForm.amount,
          mpesaRef: depositForm.mpesaRef,
          phone: depositForm.phone,
        }),
      });
      setDepositForm({ amount: "", mpesaRef: "", phone: "" });
      setProfileStatus("Deposit request submitted for admin verification.");
      await onRefresh?.();
      setProfileTab("view");
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

  const saveTeacherSpecializations = async () => {
    setProfileStatus("");
    try {
      await fetchJson("/api/teacher/specializations", {
        method: "POST",
        headers: { Authorization: `Bearer ${sessionToken}` },
        body: JSON.stringify({ specializations: teacherSpecializationsDraft }),
      });
      await onRefreshTeacherOverview?.();
      setProfileStatus("Teacher specializations saved.");
    } catch (err) {
      setProfileStatus(err.message);
    }
  };

  return (
    <PageStack
      title="Dashboard"
      subtitle="Profile, balance, services, and activity"
      voiceScript={profileScript}
      compact
    >
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
                <div className="relative h-44 bg-gradient-to-br from-cyan-700/50 via-blue-700/40 to-indigo-900/60">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(34,211,238,0.25),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(99,102,241,0.3),transparent_55%)]" />
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMxLjIgMCAyLjQtLjUgMy4yLTEuNHMxLjMtMi4xIDEuMy0zLjMtLjUtMi40LTEuMy0zLjItMS45LTEuMy0zLjItMS4zLTIuNC41LTMuMiAxLjMtMS4zIDItMS4zIDMuMi41IDIuNCAxLjMgMy4yIDEuOSAxLjMgMy4yIDEuM3ptLTEyIDBjMS4yIDAgMi40LS41IDMuMi0xLjRzMS4zLTIuMSAxLjMtMy4zLS41LTIuNC0xLjMtMy4yLTEuOS0xLjMtMy4yLTEuMy0yLjQuNS0zLjIgMS4zLTEuMyAyLTEuMyAzLjIuNSAyLjQgMS4zIDMuMiAxLjkgMS4zIDMuMiAxLjN6IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIi8+PC9nPjwvc3ZnPg==')] opacity-40" />
                </div>

                <div className="px-6 pb-8 sm:px-10">
                  <div className="-mt-16 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
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
                        ? "Teacher · Tracking learners, updating IEPs, and sending focused guidance."
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

              <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
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

                  {/* Teacher: learner roster */}
                  {isTeacher && (
                    <GlassPanel className="p-6 sm:p-8">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <SectionLabel>Teacher Tools</SectionLabel>
                          <h3 className="mt-2 text-xl font-black text-white">Parent-registered children</h3>
                          <p className="mt-2 text-sm text-slate-500">Only learners registered by parents appear here.</p>
                        </div>
                        <div className="w-full max-w-xl rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4">
                          <p className="text-xs font-black uppercase tracking-widest text-cyan-400">Your specializations</p>
                          <textarea
                            rows="3"
                            value={teacherSpecializationsDraft}
                            onChange={(event) => setTeacherSpecializationsDraft(event.target.value)}
                            placeholder="Math, English, literacy, CBC support, exam prep"
                            className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-300/60"
                          />
                          <div className="mt-3 flex flex-wrap gap-3">
                            <button
                              type="button"
                              onClick={saveTeacherSpecializations}
                              className="inline-flex items-center gap-2 rounded-full bg-cyan-300 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-slate-950 transition hover:bg-cyan-200"
                            >
                              Save specializations
                            </button>
                            <span className="text-xs text-slate-500">These help parents find and contact you.</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 grid gap-3">
                        {teacherChildren.length === 0 && (
                          <p className="rounded-2xl border border-white/5 bg-white/5 px-4 py-5 text-center text-sm text-slate-500">No parent-registered children yet.</p>
                        )}
                        {teacherChildren.map((child) => {
                          const whatsappDigits = String(child.parent_whatsapp || "").replace(/\D/g, "");
                          const whatsappHref = whatsappDigits
                            ? `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(`Hello ${child.parent_name || "parent"}, I am reaching out about ${child.child_name || "your child"}.`)}`
                            : null;
                          return (
                            <div key={child.id} className="rounded-[1.5rem] border border-white/10 bg-slate-950/50 p-4">
                              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                <div>
                                  <p className="text-lg font-black text-white">{child.child_name}</p>
                                  <p className="mt-1 text-sm text-slate-300">Grade {child.grade_level}</p>
                                  <p className="mt-1 text-sm text-slate-400">Parent: {child.parent_name}</p>
                                  <p className="mt-2 text-sm leading-7 text-slate-300">Goals: {child.goals}</p>
                                </div>
                                {whatsappHref && (
                                  <a href={whatsappHref} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-slate-950 transition hover:bg-emerald-300">
                                    WhatsApp parent
                                  </a>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </GlassPanel>
                  )}

                  {/* Parent quick-links */}
                  {isParent && (
                    <GlassPanel className="p-6 sm:p-8">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <SectionLabel>Parent Hub</SectionLabel>
                          <h3 className="mt-2 text-xl font-black text-white">Support your child's learning</h3>
                          <p className="mt-2 text-sm text-slate-500">Register children, set goals, and open the materials workspace for grade-specific packs.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => goTo("resources")}
                          className="inline-flex items-center gap-2 rounded-full bg-cyan-300 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-slate-950 transition hover:bg-cyan-200"
                        >
                          Open materials
                        </button>
                      </div>

                      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        <button
                          type="button"
                          onClick={() => goTo("resources")}
                          className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-cyan-400/30 hover:bg-cyan-400/5"
                        >
                          <div className="rounded-xl bg-cyan-500/10 p-3"><FaBookOpen className="text-lg text-cyan-300" /></div>
                          <div>
                            <p className="font-bold text-white">Purchase Materials</p>
                            <p className="text-xs text-slate-500">Ksh 10 downloads</p>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => goTo("teachers")}
                          className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-cyan-400/30 hover:bg-cyan-400/5"
                        >
                          <div className="rounded-xl bg-emerald-500/10 p-3"><FaEnvelope className="text-lg text-emerald-300" /></div>
                          <div>
                            <p className="font-bold text-white">Contact Teacher</p>
                            <p className="text-xs text-slate-500">Recommended matches</p>
                          </div>
                        </button>
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <p className="text-xs font-black uppercase tracking-widest text-cyan-400">Registered children</p>
                          <p className="mt-2 text-2xl font-black text-white">{dashboard.children.length}</p>
                        </div>
                      </div>

                      <div className="mt-6 space-y-3">
                        {dashboard.children.length === 0 ? (
                          <p className="rounded-2xl border border-white/5 bg-white/5 px-4 py-5 text-center text-sm text-slate-500">No children registered yet.</p>
                        ) : (
                          dashboard.children.map((child) => (
                            <div key={`${child.child_name}-${child.created_at}`} className="rounded-[1.5rem] border border-white/10 bg-slate-950/50 p-4">
                              <p className="text-lg font-black text-white">{child.child_name}</p>
                              <p className="mt-1 text-sm text-slate-300">Grade {child.grade_level}</p>
                              <p className="mt-2 text-sm leading-7 text-slate-400">Goals: {child.goals}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </GlassPanel>
                  )}
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

          {/* MATERIALS section - Parent Only */}
          {activeSection === "materials" && isParent && (
            <div className="space-y-6 rounded-[2rem] border border-white/10 bg-slate-950/90 p-6 sm:p-8">
              <div>
                <SectionLabel>Generate Learning Materials</SectionLabel>
                <h2 className="mt-2 text-3xl font-black text-white">Create materials for your child</h2>
                <p className="mt-2 text-sm text-slate-400">Select a grade and describe what you need. Materials are automatically generated.</p>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Grade</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((grade) => (
                      <button
                        key={grade}
                        type="button"
                        onClick={() => setParentGradeLevel(String(grade))}
                        className={`rounded-xl border px-4 py-2 text-sm font-black transition ${
                          String(parentGradeLevel) === String(grade)
                            ? "border-cyan-300 bg-cyan-300 text-slate-950"
                            : "border-white/10 bg-white/5 text-white hover:border-cyan-400/40 hover:bg-cyan-400/10"
                        }`}
                      >
                        {grade}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <label className="block space-y-3">
                <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Describe what you want</span>
                <textarea
                  rows="4"
                  value={parentPrompt}
                  onChange={(event) => setParentPrompt(event.target.value)}
                  placeholder="Example: make revision notes and exercises for Grade 4 fractions with simple answers"
                  className="w-full rounded-[1.5rem] border border-white/10 bg-slate-950/80 px-4 py-4 text-white outline-none placeholder:text-slate-600 focus:border-cyan-300/60"
                />
              </label>

              {parentLoadingMaterial && (
                <div className="text-sm text-cyan-300">Generating materials...</div>
              )}

              {parentStatus && <Notice tone={parentStatus.toLowerCase().includes("ready") ? "info" : "error"}>{parentStatus}</Notice>}

              {parentMaterialBody && (
                <div className="rounded-[2rem] border border-cyan-400/20 bg-cyan-400/5 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-300">Preview</p>
                    <button
                      onClick={downloadParentMaterials}
                      disabled={parentDownloading}
                      className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-xs font-black text-emerald-200 transition hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {parentDownloading ? "Downloading..." : "Download for Ksh 10"}
                    </button>
                  </div>
                  <h3 className="text-2xl font-black text-white">{parentMaterialTitle || `Grade ${parentGradeLevel} materials`}</h3>
                  <pre className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-300 max-h-96 overflow-y-auto">{parentMaterialBody}</pre>
                </div>
              )}
            </div>
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

          {/* ROSTER section - Teacher only */}
          {activeSection === "roster" && isTeacher && (
            <GlassPanel className="p-6 sm:p-8">
              <SectionLabel>Teacher Roster</SectionLabel>
              <h3 className="mt-2 mb-6 text-2xl font-black text-white">Your Learners</h3>
              <div className="space-y-4">
                {teacherChildren.length === 0 ? (
                  <p className="py-12 text-center text-sm text-slate-600">No learners assigned to you yet.</p>
                ) : (
                  teacherChildren.map((child) => (
                    <div key={child.id} className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-white">{child.child_name}</h4>
                          <p className="text-sm text-slate-400">Grade {child.grade_level}</p>
                          <p className="text-sm text-slate-400">Parent: {child.parent_name}</p>
                          <p className="mt-2 text-sm text-slate-300">Goals: {child.goals}</p>
                        </div>
                        <button
                          onClick={() => {
                            const whatsappDigits = String(child.parent_whatsapp || "").replace(/\D/g, "");
                            if (whatsappDigits) {
                              window.open(`https://wa.me/${whatsappDigits}?text=${encodeURIComponent(`Hello ${child.parent_name || "parent"}, I am reaching out about ${child.child_name || "your child"}.`)}`, "_blank");
                            }
                          }}
                          className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-slate-950 transition hover:bg-emerald-300"
                        >
                          <FaWhatsapp /> Contact Parent
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </GlassPanel>
          )}

          {/* SUPPORT section - Parent only */}
          {activeSection === "parent" && isParent && (
            <GlassPanel className="p-6 sm:p-8">
              <SectionLabel>Parent Support Hub</SectionLabel>
              <h3 className="mt-2 mb-6 text-2xl font-black text-white">Resources for Parents</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <h4 className="font-bold text-white">Materials Library</h4>
                  <p className="mt-2 text-sm text-slate-400">Generate and download learning materials for your child's grade level.</p>
                  <button
                    type="button"
                    onClick={() => setActiveSection("materials")}
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-cyan-400 px-4 py-2 text-xs font-black text-slate-950 transition hover:bg-cyan-300"
                  >
                    Go to Materials
                  </button>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <h4 className="font-bold text-white">Connect with Teachers</h4>
                  <p className="mt-2 text-sm text-slate-400">Find and contact teachers who specialize in your child's learning needs.</p>
                  <button
                    type="button"
                    onClick={() => goTo("teachers")}
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-400 px-4 py-2 text-xs font-black text-slate-950 transition hover:bg-emerald-300"
                  >
                    <FaWhatsapp /> Find Teachers
                  </button>
                </div>
              </div>
            </GlassPanel>
          )}
        </div>
      </div>

      {/* Profile Modal */}
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
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-cyan-400">Deposit via M-Pesa</p>
                      <p className="mt-2 text-sm text-slate-400">Send any amount to the QOOHI M-Pesa till, then submit the reference below. Admin will verify and credit your balance.</p>
                    </div>
                    <Input label="Amount (Ksh)" type="number" value={depositForm.amount} onChange={(v) => setDepositForm((c) => ({ ...c, amount: v }))} />
                    <Input label="M-Pesa transaction code" value={depositForm.mpesaRef} onChange={(v) => setDepositForm((c) => ({ ...c, mpesaRef: v }))} />
                    <Input label="Phone number used" value={depositForm.phone} onChange={(v) => setDepositForm((c) => ({ ...c, phone: v }))} />
                    <div className="flex gap-3 pt-2">
                      <ActionButton type="submit" disabled={submittingDeposit} className="!px-6 !py-3 !text-sm">
                        {submittingDeposit ? "Submitting..." : "Submit Deposit"}
                      </ActionButton>
                      <SecondaryButton type="button" className="!px-6 !py-3 !text-sm" onClick={() => setProfileTab("view")}>Cancel</SecondaryButton>
                    </div>
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

function PageStack({ title, subtitle, children, voiceScript, compact = false }) {
  const { voiceEnabled, toggleVoice, isSpeaking } = useVoiceGuide(voiceScript);

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

        {voiceScript && (
          <button
            onClick={toggleVoice}
            className={`flex items-center gap-3 rounded-2xl border px-6 py-4 transition-all active:scale-95 ${
              voiceEnabled
                ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.2)]"
                : "border-white/10 bg-white/5 text-slate-500"
            }`}
          >
            <div className="relative flex h-3 w-3">
              {(voiceEnabled || isSpeaking) && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>}
              <span className={`relative inline-flex h-3 w-3 rounded-full ${voiceEnabled ? "bg-cyan-400" : "bg-slate-600"}`}></span>
            </div>
            <span className="text-xs font-black uppercase tracking-widest">
              {isSpeaking ? "Speaking..." : voiceEnabled ? "Voice Guide On" : "Voice Guide Off"}
            </span>
          </button>
        )}
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
  return window.location.hash.replace("#", "").trim() || "home";
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

function Footer({ goTo }) {
  return (
    <footer className="fixed bottom-0 inset-x-0 z-40 border-t border-white/10 bg-slate-950/80 py-4 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <button onClick={() => goTo("home")} className="flex items-center gap-2 group">
            <img src={QoohiLogo} alt="QOOHI Logo" className="h-8 w-8 rounded-lg border border-white/10 transition-transform group-hover:scale-110" />
            <span className="hidden text-sm font-black tracking-widest text-white sm:block">QOOHI</span>
          </button>
          <p className="hidden text-[10px] text-slate-500 sm:block">
            &copy; {new Date().getFullYear()}
          </p>
        </div>

        <div className="hidden items-center gap-6 md:flex">
          {["teachers", "resources", "learn", "games"].map((id) => (
            <button
              key={id}
              onClick={() => goTo(id)}
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 transition hover:text-cyan-400"
            >
              {id === "resources" ? "materials" : id}
            </button>
          ))}
        </div>

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
  const voiceScript = "Welcome to QOOHI AI. I am your smart assistant, here to help you learn, build, and create. Ask me anything, or choose a specialized service like CV and Resume generation. I am here to support your journey.";

  const aiSessionId = useMemo(() => {
    const saved = localStorage.getItem("qoohi_ai_session_id");
    if (saved) {
      return saved;
    }
    const created = crypto.randomUUID();
    localStorage.setItem("qoohi_ai_session_id", created);
    return created;
  }, []);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Choose a service below to continue.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editText, setEditText] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [showServiceButtons, setShowServiceButtons] = useState(true);
  const [resumeFlow, setResumeFlow] = useState({
    step: "payment",
    paymentProof: "",
    name: "",
    location: "",
    email: "",
    phone: "",
    skill: "",
    workExperience: "",
    school: "",
    areaOfStudy: "",
    preview: "",
    filename: "",
    downloadUrl: "",
  });

  const authHeaders = sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {};

  useEffect(() => () => {
    if (resumeFlow.downloadUrl) {
      URL.revokeObjectURL(resumeFlow.downloadUrl);
    }
  }, [resumeFlow.downloadUrl]);

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

  const speakMessage = (text) => {
    if (!window.speechSynthesis) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    synth.resume();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    
    activeUtterances.add(utterance);
    utterance.onend = () => activeUtterances.delete(utterance);
    utterance.onerror = () => activeUtterances.delete(utterance);

    const voices = synth.getVoices();
    const female = pickFemaleVoice(voices);
    if (female) utterance.voice = female;
    
    setTimeout(() => {
      synth.speak(new SpeechSynthesisUtterance(""));
      synth.speak(utterance);
    }, 50);
  };

  const startEdit = (index, content) => {
    setEditingIndex(index);
    setEditText(content);
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditText("");
  };

  const startResumeFlow = () => {
    setSelectedService("cv_resume");
    setShowServiceButtons(false);
    appendMessage({ role: "user", content: "CV/RESUME" });
    appendMessage(
      {
        role: "assistant",
        content:
          "First pay 100KSH to Till number 7581346, then paste your M-PESA confirmation message here so I can verify it.",
      },
    );
    setResumeFlow({
      step: "payment",
      paymentProof: "",
      name: "",
      location: "",
      email: "",
      phone: "",
      skill: "",
      workExperience: "",
      school: "",
      areaOfStudy: "",
      preview: "",
      filename: "",
      downloadUrl: "",
    });
  };

  const startCyberFlow = () => {
    const whatsappLink = "https://wa.me/254712508450?text=Hello%20QOOHI%2C%20I%20need%20cyber%20online%20services.";
    setSelectedService("cyber_services");
    setShowServiceButtons(false);
    appendMessage({ role: "user", content: "CYBER ONLINE SERVICES" });
    appendMessage(
      {
        role: "assistant",
        content:
          "We offer the following services:\n\n1. SHA REGISTRATION\n2. TSC NUMBER REGISTRATIONS\n3. ALL ECITIZEN SERVICES\n4. DRIVING LICENSE APPLICATIONS\n5. GREEN CARD APPLICATION\n\nShare your information on WhatsApp here:\n" +
          whatsappLink,
      },
    );
  };

  const generateResumePreview = async (payload) => {
    const response = await fetch(`${API_BASE}/api/ai/resume/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
      },
      body: JSON.stringify({
        sessionId: aiSessionId,
        name: payload.name,
        location: payload.location,
        email: payload.email,
        phone: payload.phone,
        skill: payload.skill,
        workExperience: payload.workExperience,
        school: payload.school,
        areaOfStudy: payload.areaOfStudy,
        feedback: payload.feedback,
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.resume) {
      throw new Error(data.error || "Failed to generate resume.");
    }
    return data;
  };

  const buildResumeDocument = (name, resumeText) => {
    const safeName = String(name || "Resume");
    const escaped = resumeText
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\n/g, "<br />");

    return `
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${safeName} Resume</title>
        </head>
        <body style="font-family: -apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', 'Fira Sans', Ubuntu, Oxygen, 'Oxygen Sans', Cantarell, 'Droid Sans', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Lucida Grande', Helvetica, Arial, sans-serif; line-height: 1.5; padding: 32px; color: #111827;">
          <h1 style="margin-bottom: 24px;">${safeName}</h1>
          <div>${escaped}</div>
        </body>
      </html>
    `;
  };

  const createResumeDownload = (name, resumeText, filename) => {
    if (resumeFlow.downloadUrl) {
      URL.revokeObjectURL(resumeFlow.downloadUrl);
    }
    const blob = new Blob([buildResumeDocument(name, resumeText)], {
      type: "application/msword",
    });
    return {
      filename: filename || `${name || "resume"}-qoohi-resume.doc`,
      downloadUrl: URL.createObjectURL(blob),
    };
  };

  const handleResumeInput = async (text) => {
    if (resumeFlow.step === "payment") {
      const looksVerified =
        /confirmed/i.test(text) &&
        /ksh\s*100/i.test(text);

      if (!looksVerified) {
        appendMessage(
          {
            role: "assistant",
            content:
              "I could not verify that payment message yet. Please paste the full M-PESA confirmation showing Ksh100.00 paid to Till number 7581346.",
          },
        );
        return;
      }

      setResumeFlow((prev) => ({
        ...prev,
        step: "name",
        paymentProof: text,
      }));
      appendMessage(
        {
          role: "assistant",
          content: "Payment verified. Share your full name.",
        },
      );
      return;
    }

    if (resumeFlow.step === "name") {
      setResumeFlow((prev) => ({
        ...prev,
        step: "location",
        name: text,
      }));
      appendMessage(
        {
          role: "assistant",
          content: "Share your location.",
        },
      );
      return;
    }

    if (resumeFlow.step === "location") {
      setResumeFlow((prev) => ({
        ...prev,
        step: "email",
        location: text,
      }));
      appendMessage(
        {
          role: "assistant",
          content: "Share your email address.",
        },
      );
      return;
    }

    if (resumeFlow.step === "email") {
      setResumeFlow((prev) => ({
        ...prev,
        step: "phone",
        email: text,
      }));
      appendMessage(
        {
          role: "assistant",
          content: "Share your phone number.",
        },
      );
      return;
    }

    if (resumeFlow.step === "phone") {
      setResumeFlow((prev) => ({
        ...prev,
        step: "skill",
        phone: text,
      }));
      appendMessage(
        {
          role: "assistant",
          content: "Share your main professional skill.",
        },
      );
      return;
    }

    if (resumeFlow.step === "skill") {
      setResumeFlow((prev) => ({
        ...prev,
        step: "workExperience",
        skill: text,
      }));
      appendMessage(
        {
          role: "assistant",
          content: "Share your work experience.",
        },
      );
      return;
    }

    if (resumeFlow.step === "workExperience") {
      setResumeFlow((prev) => ({
        ...prev,
        step: "school",
        workExperience: text,
      }));
      appendMessage(
        {
          role: "assistant",
          content: "Share your school.",
        },
      );
      return;
    }

    if (resumeFlow.step === "school") {
      setResumeFlow((prev) => ({
        ...prev,
        step: "areaOfStudy",
        school: text,
      }));
      appendMessage(
        {
          role: "assistant",
          content: "Share your area of study.",
        },
      );
      return;
    }

    if (resumeFlow.step === "areaOfStudy") {
      setLoading(true);
      try {
        const nextFlow = {
          ...resumeFlow,
          areaOfStudy: text,
        };
        const data = await generateResumePreview({
          name: nextFlow.name,
          location: nextFlow.location,
          email: nextFlow.email,
          phone: nextFlow.phone,
          skill: nextFlow.skill,
          workExperience: nextFlow.workExperience,
          school: nextFlow.school,
          areaOfStudy: text,
        });

        setResumeFlow((prev) => ({
          ...prev,
          step: "confirm",
          areaOfStudy: text,
          preview: data.resume,
          filename: data.filename,
        }));
        appendMessage(
          {
            role: "assistant",
            content:
              `Here is your professionally prepared resume draft:\n\n${data.resume}\n\nIf you are okay with it, reply yes. If you want changes, tell me what to adjust.`,
          },
        );
      } catch {
        appendMessage(
          {
            role: "assistant",
            content: "I could not generate the resume right now. Check the OpenAI backend settings and try again.",
          },
        );
      } finally {
        setLoading(false);
      }
      return;
    }

    if (resumeFlow.step === "confirm") {
      const approved = /\b(yes|ok|okay|looks good|good|proceed|continue)\b/i.test(text);

      if (approved) {
        const download = createResumeDownload(
          resumeFlow.name,
          resumeFlow.preview,
          resumeFlow.filename,
        );
        setResumeFlow((prev) => ({
          ...prev,
          step: "done",
          filename: download.filename,
          downloadUrl: download.downloadUrl,
        }));
        appendMessage(
          {
            role: "assistant",
            content: "Your Word file is ready. Click the download button below.",
          },
        );
        return;
      }

      setResumeFlow((prev) => ({
        ...prev,
        step: "feedback",
      }));
      appendMessage(
        {
          role: "assistant",
          content: "Tell me what to change in the resume and I will generate another version.",
        },
      );
      return;
    }

    if (resumeFlow.step === "feedback") {
      setLoading(true);
      try {
        const data = await generateResumePreview({
          name: resumeFlow.name,
          location: resumeFlow.location,
          email: resumeFlow.email,
          phone: resumeFlow.phone,
          skill: resumeFlow.skill,
          workExperience: resumeFlow.workExperience,
          school: resumeFlow.school,
          areaOfStudy: resumeFlow.areaOfStudy,
          feedback: text,
        });
        setResumeFlow((prev) => ({
          ...prev,
          step: "confirm",
          preview: data.resume,
          filename: data.filename,
        }));
        appendMessage(
          {
            role: "assistant",
            content:
              `Updated professional resume draft:\n\n${data.resume}\n\nReply yes if this one is okay, or send more changes.`,
          },
        );
      } catch {
        appendMessage(
          {
            role: "assistant",
            content: "I could not update the resume right now. Try again after the OpenAI API is configured.",
          },
        );
      } finally {
        setLoading(false);
      }
      return;
    }

    appendMessage(
      {
        role: "assistant",
        content: "Your resume is ready. Use the download button below or start over to create another one.",
      },
    );
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

    if (selectedService === "cv_resume") {
      await handleResumeInput(trimmedInput);
      return;
    }

    const finalMessages = [...messages, userMessage];
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({ messages: finalMessages }),
      });

      const data = await res.json();

      const reply = data?.reply;

      if (!reply) throw new Error("No reply");

      appendMessage({ role: "assistant", content: reply });
      if (!selectedService) {
        setSelectedService("general");
      }
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
      voiceScript={voiceScript}
    >
      <GlassPanel className="flex h-[70vh] flex-col p-4">
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {showServiceButtons && (
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                onClick={startResumeFlow}
                className="rounded-2xl border border-cyan-300/30 bg-cyan-300/10 p-5 text-left transition hover:bg-cyan-300/20"
              >
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-200">
                  Service 1
                </p>
                <h3 className="mt-2 text-xl font-black text-white">CV/RESUME</h3>
              </button>
              <button
                onClick={startCyberFlow}
                className="rounded-2xl border border-emerald-300/30 bg-emerald-300/10 p-5 text-left transition hover:bg-emerald-300/20"
              >
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-200">
                  Service 2
                </p>
                <h3 className="mt-2 text-xl font-black text-white">CYBER ONLINE SERVICES</h3>
              </button>
            </div>
          )}

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
                      {msg.role === "assistant" && index === messages.length - 1 && !loading ? (
                        <StreamingText text={msg.content} />
                      ) : (
                        msg.content
                      )}
                    </div>
                    
                    <div className="absolute top-0 flex items-center gap-1 opacity-0 transition-all group-hover:opacity-100 py-1.5 px-3 bg-slate-950/90 border border-white/10 backdrop-blur-md rounded-2xl shadow-2xl z-20 -top-10 left-0">
                      <button
                        onClick={() => copyMessage(msg.content)}
                        className="p-1.5 text-slate-400 hover:text-cyan-400 transition"
                        title="Copy"
                      >
                        <FaLink className="text-xs" />
                      </button>
                      <button
                        onClick={() => speakMessage(msg.content)}
                        className="p-1.5 text-slate-400 hover:text-cyan-400 transition"
                        title="Speak"
                      >
                        <FaRobot className="text-xs" />
                      </button>
                      {msg.role === "user" && selectedService !== "cv_resume" && (
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

          {selectedService === "cyber_services" && (
            <a
              href="https://wa.me/254712508450?text=Hello%20QOOHI%2C%20I%20need%20cyber%20online%20services."
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-fit rounded-xl bg-emerald-400 px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-emerald-300"
            >
              Open WhatsApp
            </a>
          )}

          {resumeFlow.downloadUrl && (
            <a
              href={resumeFlow.downloadUrl}
              download={resumeFlow.filename}
              className="inline-flex w-fit rounded-xl bg-cyan-400 px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-300"
            >
              Download Resume
            </a>
          )}

          {loading && (
            <div className="text-sm text-cyan-300">
              QOOHI AI is thinking...
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 border-t border-white/10 p-4">
          <input
            className="flex-1 rounded-xl bg-slate-950/60 px-4 py-3 text-white outline-none"
            placeholder={
              selectedService === "cv_resume"
                ? "Type your response for the resume process..."
                : "Type your message..."
            }
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
