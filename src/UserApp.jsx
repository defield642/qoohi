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

const API_BASE =
  import.meta.env.VITE_API_BASE || (import.meta.env.PROD ? "" : "http://localhost:3000");

const backgrounds = [bg1, bg2, bg3, bg4, bg5, bg6];
const navItems = [
  { id: "home", label: "Home", img: fc26Img },
  { id: "iep", label: "Learner IEP", img: iepImg },
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
      // Small delay to ensure state update has propagated if needed
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
  // ... (rest of state)

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
            {route === "resources" && <ResourcesPage openParentRegistration={openParentRegistration} />}
            {route === "games" && <GamesPage />}
            {route === "new" && (
              <NewPage openTournamentRegistration={openTournamentRegistration} />
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
                onUpdateIep={async (userId, assessmentStatus, performanceLevel) => {
                  try {
                    const data = await fetchJson(`/api/admin/users/${userId}/iep`, {
                      method: "POST",
                      // Reuse admin endpoint if teacher has key, but wait, teachers use session!
                      // I should add a teacher-specific IEP update endpoint or modify the admin one.
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
            label="FC 26"
            sublabel="Tournament"
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
            onClick={() => goTo("login")}
            image={loginImg}
            label="Login"
            sublabel="Dashboard"
          />

          {/* IEP */}
          <HomeButton 
            onClick={() => goTo("iep")}
            image={iepImg}
            label="IEP"
            sublabel="Performance"
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

function ResourcesPage({ openParentRegistration }) {
  const voiceScript = "The QOOHI Resource Library. Your gateway to mastery. Access digital e-books, gamified exercises, and interactive videos, or order physical workbooks and activity kits delivered to your doorstep. Supporting every step of your growth.";

  return (
    <PageStack 
      title="Digital Library" 
      subtitle="Comprehensive soft and hard learning resources for every stage."
      voiceScript={voiceScript}
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

function NewPage({ openTournamentRegistration }) {
  const voiceScript = "The QOOHI Spotlight. Where competition meets community. Register for our featured FC 26 tournament, win big, and climb the standings. Stay updated with the latest in digital sports and community events.";

  return (
    <PageStack 
      title="Spotlight" 
      subtitle="Latest updates and featured community tournaments."
      voiceScript={voiceScript}
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
  const [form, setForm] = useState({ fullName: "", whatsapp: "", email: "" });
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
}) {
  const [showMessages, setShowMessages] = useState(false);
  const [editingIep, setEditingIep] = useState(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileTab, setProfileTab] = useState("view");
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
  const profileScript = `Welcome ${firstName || ""} to your QOOHI dashboard. Review your profile, balance, services, and activity. Deposit funds, withdraw when needed, and keep your learning journey moving.`;

  const allStudents = teacherOverview
    ? teacherOverview.groups
        .filter((g) => !["teacher", "parent"].includes(g.key))
        .flatMap((g) => g.members)
        .filter((v, i, a) => a.findIndex((t) => t.id === v.id) === i)
    : [];

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

  return (
    <PageStack
      title="Dashboard"
      subtitle="Profile, balance, services, and activity"
      voiceScript={profileScript}
      compact
    >
      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        <GlassPanel className="overflow-hidden border-white/15 bg-slate-900/60 p-0">
          <div className="relative h-32 bg-gradient-to-r from-cyan-500/30 via-sky-500/20 to-slate-900">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.35),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.2),transparent_40%)]" />
          </div>
          <div className="px-6 pb-6 pt-0 sm:px-8">
            <div className="-mt-14 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <button
                type="button"
                onClick={() => openProfile("view")}
                className="group flex items-end gap-4 text-left"
              >
                <div className="relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-[1.75rem] border border-white/20 bg-slate-950 shadow-2xl shadow-cyan-500/20">
                  {profileAvatar ? (
                    <img src={profileAvatar} alt={fullName} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-900 text-4xl font-black text-cyan-300">
                      {fullName?.[0] || "Q"}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/35 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <div className="space-y-2 pb-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">{fullName}</h2>
                    <Badge>{roleLabel}</Badge>
                  </div>
                  <p className="max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                    {isTeacher
                      ? "Teacher dashboard for tracking learners, updating IEPs, and sending focused guidance."
                      : isParent
                        ? "Parent dashboard for account balance, messages, and learner support."
                        : "Student dashboard for your profile, learning progress, balance, and premium services."}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-300">
                      Balance Ksh {balance.toLocaleString()}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-300">
                      {dashboard.student.email}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-300">
                      {dashboard.student.whatsapp}
                    </span>
                    {profileUpdateCharge > 0 && (
                      <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-amber-200">
                        Profile edits Ksh {profileUpdateCharge.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </button>

              <div className="flex flex-wrap gap-2 md:justify-end">
                <SecondaryButton onClick={() => openProfile("edit")} className="!px-4 !py-2 !text-sm">
                  <FaEdit /> Edit Profile
                </SecondaryButton>
                <ActionButton onClick={() => openProfile("deposit")} className="!px-4 !py-2 !text-sm">
                  <FaWallet /> Deposit
                </ActionButton>
                <SecondaryButton onClick={() => openProfile("withdraw")} className="!px-4 !py-2 !text-sm">
                  <FaMinusCircle /> Withdraw
                </SecondaryButton>
                <SecondaryButton onClick={logout} className="!px-4 !py-2 !text-sm">
                  Logout
                </SecondaryButton>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <InfoChip label="Status" value={assessmentStatus === "completed" ? `Level ${performanceLevel}` : "Assessment pending"} />
              <InfoChip label="Balance" value={`Ksh ${balance.toLocaleString()}`} />
              <InfoChip label="Courses" value={dashboard.enrollments.length.toString()} />
              <InfoChip label="Messages" value={dashboard.messages.length.toString()} />
            </div>
          </div>
        </GlassPanel>

        <div className="space-y-6">
          <GlassPanel className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <SectionLabel>Available Services</SectionLabel>
                <h3 className="mt-3 text-2xl font-black text-white">Charges & quick actions</h3>
              </div>
              <button
                type="button"
                onClick={() => openProfile("deposit")}
                className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-cyan-300 transition hover:bg-cyan-400/20"
              >
                Top Up
              </button>
            </div>
            <div className="mt-5 max-h-[26rem] space-y-3 overflow-y-auto pr-1">
              {serviceCharges.map((service) => {
                const meta = serviceActions[service.service_key] || {};
                const charge = Number(service.charge_ksh || 0);
                const enabled = Number(service.active || 0) === 1;
                const blocked = charge > 0 && !canAfford(charge);
                return (
                  <button
                    key={service.service_key}
                    type="button"
                    onClick={() => {
                      if (!enabled) return;
                      if (service.service_key === "profile_update") {
                        openProfile("edit");
                        return;
                      }
                      if (blocked) {
                        openProfile("deposit");
                        return;
                      }
                      if (meta.route) {
                        goTo(meta.route);
                      }
                    }}
                    className={`flex w-full items-center justify-between gap-4 rounded-[1.5rem] border px-4 py-4 text-left transition ${
                      enabled
                        ? "border-white/10 bg-white/5 hover:border-cyan-400/30 hover:bg-cyan-400/10"
                        : "border-white/5 bg-white/5 opacity-60"
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-black uppercase tracking-[0.18em] text-white">{service.label}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-400">{service.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-cyan-300">Ksh {charge.toLocaleString()}</p>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                        {!enabled ? "Disabled" : blocked ? "Top up required" : meta.label || "Open"}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </GlassPanel>

          <GlassPanel className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <SectionLabel>Activity</SectionLabel>
                <h3 className="mt-3 text-2xl font-black text-white">Recent balance activity</h3>
              </div>
              <FaHistory className="text-2xl text-cyan-300" />
            </div>
            <div className="mt-5 space-y-3">
              {recentTransactions.slice(0, 5).map((item) => (
                <div key={item.id} className="rounded-[1.35rem] border border-white/10 bg-white/5 px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-white">{item.description || item.type}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">{item.type}</p>
                    </div>
                    <p className={`text-sm font-black ${Number(item.amount || 0) < 0 ? "text-rose-300" : "text-emerald-300"}`}>
                      {Number(item.amount || 0) < 0 ? "-" : "+"}Ksh {Math.abs(Number(item.amount || 0)).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
              {recentTransactions.length === 0 && (
                <p className="rounded-[1.35rem] border border-white/10 bg-white/5 px-4 py-5 text-sm text-slate-400">
                  No balance activity yet.
                </p>
              )}
            </div>
          </GlassPanel>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {isStudent && assessmentStatus === "completed" && (
          <GlassPanel className="p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <SectionLabel>Your Roadmap</SectionLabel>
                <h2 className="mt-3 text-2xl font-black text-white">Recommended Resources</h2>
              </div>
              <FaBookOpen className="text-4xl text-cyan-300" />
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-5">
                <p className="text-xs font-black uppercase tracking-widest text-cyan-400">Digital</p>
                <h4 className="mt-2 text-xl font-black text-white">Workbook - Lvl {performanceLevel}</h4>
                <button className="mt-4 flex items-center gap-2 text-sm font-black text-cyan-300 hover:underline">
                  <FaLink /> Download
                </button>
              </div>
              <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-5">
                <p className="text-xs font-black uppercase tracking-widest text-amber-400">Physical</p>
                <h4 className="mt-2 text-xl font-black text-white">Activity Kit</h4>
                <button className="mt-4 flex items-center gap-2 text-sm font-black text-amber-300 hover:underline">
                  <FaWhatsapp /> Request
                </button>
              </div>
            </div>
          </GlassPanel>
        )}

        {isTeacher && (
          <GlassPanel className="p-8">
            <SectionLabel>Teacher Tools</SectionLabel>
            <h2 className="mt-3 text-2xl font-black text-white">Problem-Solving Log</h2>
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-[10px] uppercase tracking-widest text-slate-500">
                    <th className="pb-4">Student</th>
                    <th className="pb-4">Balance</th>
                    <th className="pb-4">Level</th>
                    <th className="pb-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {allStudents.map((s) => (
                    <tr key={s.id}>
                      <td className="py-5 font-black text-white text-lg">
                        {s.full_name}
                        <div className="text-xs font-normal text-slate-500">{s.email}</div>
                      </td>
                      <td className="py-5 font-bold text-cyan-300">Ksh {(Number(s.balance || 0)).toLocaleString()}</td>
                      <td className="py-5 text-cyan-300 font-bold">Lvl {s.performance_level}</td>
                      <td className="py-5 text-right">
                        <button
                          onClick={() => setEditingIep(s)}
                          className="rounded-lg border border-cyan-400/30 px-3 py-1 text-xs font-black uppercase text-cyan-400 transition hover:bg-cyan-400 hover:text-slate-900"
                        >
                          Edit IEP
                        </button>
                      </td>
                    </tr>
                  ))}
                  {allStudents.length === 0 && (
                    <tr>
                      <td colSpan="4" className="py-10 text-center text-slate-500 font-bold">No students found.</td>
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
                  <div className="mt-6 space-y-6">
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
                    <div className="flex gap-3 pt-4">
                      <ActionButton
                        className="flex-1 !py-3 !text-sm"
                        onClick={() => {
                          onUpdateIep(editingIep.id, editingIep.assessment_status, editingIep.performance_level);
                          setEditingIep(null);
                        }}
                      >
                        Save Changes
                      </ActionButton>
                      <SecondaryButton className="flex-1 !py-3 !text-sm" onClick={() => setEditingIep(null)}>
                        Cancel
                      </SecondaryButton>
                    </div>
                  </div>
                </GlassPanel>
              </div>
            )}
          </GlassPanel>
        )}

        {isParent && (
          <GlassPanel className="p-8">
            <SectionLabel>Support My Child</SectionLabel>
            <div className="mt-6 space-y-3">
              <SecondaryButton className="w-full !justify-start" onClick={() => window.location.hash = "resources"}>
                <FaBookOpen className="text-cyan-300" />
                <span>Purchase Materials</span>
              </SecondaryButton>
              <SecondaryButton className="w-full !justify-start">
                <FaEnvelope className="text-cyan-300" />
                <span>Contact Teacher</span>
              </SecondaryButton>
            </div>
          </GlassPanel>
        )}

        {hasTournament && (
          <GlassPanel className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <SectionLabel>E-Sports</SectionLabel>
                <h2 className="mt-3 text-3xl font-black text-white">{tournamentInfo.title}</h2>
              </div>
              <FaTrophy className="text-4xl text-amber-300" />
            </div>
            {dashboard.tournament && (
              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full text-left text-sm text-slate-200">
                  <thead className="text-[10px] uppercase tracking-widest text-slate-500">
                    <tr>
                      <th className="pb-3">Player</th>
                      <th className="pb-3">P</th>
                      <th className="pb-3">GD</th>
                      <th className="pb-3">Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.tournament.standings.map((row) => (
                      <tr key={row.registrationId} className="border-t border-white/5">
                        <td className="py-3 font-semibold text-white">{row.name}</td>
                        <td className="py-3">{row.played}</td>
                        <td className="py-3">{row.goalDifference}</td>
                        <td className="py-3 font-bold text-cyan-300">{row.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </GlassPanel>
        )}

        {hasCourses && (
          <GlassPanel className="p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <SectionLabel>Course Admin</SectionLabel>
                <h2 className="mt-3 text-2xl font-black text-white">Materials & Updates</h2>
              </div>
              <ActionButton onClick={() => setShowMessages(!showMessages)} className="!px-4 !py-2 text-xs">
                {showMessages ? "Hide" : "View"}
              </ActionButton>
            </div>
            {showMessages && (
              <div className="mt-6 space-y-4">
                {dashboard.messages.map((message) => (
                  <div key={message.id} className="rounded-2xl border border-white/5 bg-slate-900/60 p-5">
                    <h4 className="font-bold text-white">{message.subject}</h4>
                    <p className="mt-2 text-sm text-slate-400">{message.body}</p>
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
      </div>

      {profileModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xl">
          <GlassPanel className="w-full max-w-5xl overflow-hidden border-white/15 bg-slate-950/95 p-0">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 px-6 py-5 sm:px-8">
              <div>
                <SectionLabel>Profile Hub</SectionLabel>
                <h3 className="mt-2 text-2xl font-black text-white">{fullName}</h3>
                <p className="mt-1 text-sm text-slate-400">Edit your profile, top up balance, and manage withdrawals.</p>
              </div>
              <button
                type="button"
                onClick={() => setProfileModalOpen(false)}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-white transition hover:bg-white/10"
              >
                Close
              </button>
            </div>
            <div className="flex flex-wrap gap-2 border-b border-white/10 px-6 py-4 sm:px-8">
              {[
                ["view", "Overview"],
                ["edit", "Edit Profile"],
                ["deposit", "Deposit"],
                ["withdraw", "Withdraw"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setProfileTab(key);
                    setProfileStatus("");
                  }}
                  className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.22em] transition ${
                    profileTab === key
                      ? "bg-cyan-400 text-slate-950"
                      : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="grid gap-6 p-6 lg:grid-cols-[0.95fr_1.05fr] sm:p-8">
              <div className="space-y-4">
                <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center gap-4">
                    <div className="h-20 w-20 overflow-hidden rounded-[1.35rem] border border-white/10 bg-slate-900">
                      {profileAvatar ? (
                        <img src={profileAvatar} alt={fullName} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-slate-900 text-2xl font-black text-cyan-300">
                          {fullName?.[0] || "Q"}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">{roleLabel}</p>
                      <h4 className="mt-2 text-2xl font-black text-white">{fullName}</h4>
                      <p className="mt-1 text-sm text-slate-400">{dashboard.student.email}</p>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-2">
                    <InfoChip label="Balance" value={`Ksh ${balance.toLocaleString()}`} />
                    <InfoChip label="WhatsApp" value={dashboard.student.whatsapp} />
                  </div>
                </div>
                <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-300">Recent Deposits</p>
                  <div className="mt-4 space-y-2">
                    {recentDeposits.slice(0, 3).map((item) => (
                      <div key={item.id} className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-300">
                        Ksh {Number(item.amount || 0).toLocaleString()} • {item.status}
                      </div>
                    ))}
                    {recentDeposits.length === 0 && <p className="text-sm text-slate-500">No deposits yet.</p>}
                  </div>
                </div>
                <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-300">Recent Withdrawals</p>
                  <div className="mt-4 space-y-2">
                    {recentWithdrawals.slice(0, 3).map((item) => (
                      <div key={item.id} className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-300">
                        Ksh {Number(item.amount || 0).toLocaleString()} • {item.status}
                      </div>
                    ))}
                    {recentWithdrawals.length === 0 && <p className="text-sm text-slate-500">No withdrawals yet.</p>}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {profileStatus && <Notice>{profileStatus}</Notice>}

                {profileTab === "view" && (
                  <div className="space-y-4">
                    <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                      <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-300">About</p>
                      <p className="mt-3 text-sm leading-7 text-slate-300">
                        Keep your profile updated so the QOOHI team can reach you quickly. Your balance is used for paid services, and deposits appear here before admin verification.
                      </p>
                    </div>
                    <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                      <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-300">Activity</p>
                      <div className="mt-4 space-y-2">
                        {recentTransactions.slice(0, 4).map((item) => (
                          <div key={item.id} className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-300">
                            {item.description || item.type}
                          </div>
                        ))}
                        {recentTransactions.length === 0 && <p className="text-sm text-slate-500">No recent activity.</p>}
                      </div>
                    </div>
                  </div>
                )}

                {profileTab === "edit" && (
                  <form className="space-y-4 rounded-[1.75rem] border border-white/10 bg-white/5 p-5" onSubmit={saveProfile}>
                    <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-300">Edit Profile</p>
                    <div className="grid gap-4 sm:grid-cols-[0.8fr_1.2fr]">
                      <div className="space-y-3">
                        <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-950">
                          {profileAvatar ? (
                            <img src={profileAvatar} alt="Preview" className="h-52 w-full object-cover" />
                          ) : (
                            <div className="flex h-52 items-center justify-center bg-slate-900 text-5xl font-black text-cyan-300">{fullName?.[0] || "Q"}</div>
                          )}
                        </div>
                        <label className="block rounded-[1.25rem] border border-dashed border-cyan-400/30 bg-cyan-400/5 px-4 py-4 text-center text-sm text-cyan-200 transition hover:bg-cyan-400/10">
                          <span className="font-bold uppercase tracking-[0.22em]">Choose Picture</span>
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleAvatarFile(e.target.files?.[0])} />
                        </label>
                        <button
                          type="button"
                          onClick={() => setProfileDraft((current) => ({ ...current, avatarUrl: "" }))}
                          className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-slate-300 hover:bg-white/10"
                        >
                          Remove Picture
                        </button>
                      </div>
                      <div className="space-y-4">
                        <Input label="Full name" value={profileDraft.fullName} onChange={(value) => setProfileDraft((current) => ({ ...current, fullName: value }))} />
                        <Input label="WhatsApp" value={profileDraft.whatsapp} onChange={(value) => setProfileDraft((current) => ({ ...current, whatsapp: value }))} />
                        <InfoChip label="Email" value={dashboard.student.email} />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3 pt-2">
                      <ActionButton type="submit" disabled={savingProfile} className="!px-5 !py-3 !text-sm">
                        {savingProfile ? "Saving..." : "Save Profile"}
                      </ActionButton>
                      <SecondaryButton type="button" className="!px-5 !py-3 !text-sm" onClick={() => setProfileTab("view")}>
                        Cancel
                      </SecondaryButton>
                    </div>
                  </form>
                )}

                {profileTab === "deposit" && (
                  <form className="space-y-4 rounded-[1.75rem] border border-white/10 bg-white/5 p-5" onSubmit={submitDeposit}>
                    <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-300">Deposit Funds</p>
                    <p className="text-sm text-slate-400">Add any amount to your balance. Admin will verify your M-Pesa reference.</p>
                    <Input label="Amount (Ksh)" type="number" value={depositForm.amount} onChange={(value) => setDepositForm((current) => ({ ...current, amount: value }))} />
                    <Input label="M-Pesa reference" value={depositForm.mpesaRef} onChange={(value) => setDepositForm((current) => ({ ...current, mpesaRef: value }))} />
                    <Input label="Phone number" value={depositForm.phone} onChange={(value) => setDepositForm((current) => ({ ...current, phone: value }))} />
                    <div className="flex flex-wrap gap-3 pt-2">
                      <ActionButton type="submit" disabled={submittingDeposit} className="!px-5 !py-3 !text-sm">
                        {submittingDeposit ? "Submitting..." : "Submit Deposit"}
                      </ActionButton>
                      <SecondaryButton type="button" className="!px-5 !py-3 !text-sm" onClick={() => setProfileTab("view")}>
                        Cancel
                      </SecondaryButton>
                    </div>
                  </form>
                )}

                {profileTab === "withdraw" && (
                  <form className="space-y-4 rounded-[1.75rem] border border-white/10 bg-white/5 p-5" onSubmit={submitWithdraw}>
                    <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-300">Withdraw Funds</p>
                    <p className="text-sm text-slate-400">Request a payout to your M-Pesa number and name.</p>
                    <Input label="Amount (Ksh)" type="number" value={withdrawForm.amount} onChange={(value) => setWithdrawForm((current) => ({ ...current, amount: value }))} />
                    <Input label="M-Pesa name" value={withdrawForm.mpesaName} onChange={(value) => setWithdrawForm((current) => ({ ...current, mpesaName: value }))} />
                    <Input label="M-Pesa number" value={withdrawForm.mpesaNumber} onChange={(value) => setWithdrawForm((current) => ({ ...current, mpesaNumber: value }))} />
                    <div className="flex flex-wrap gap-3 pt-2">
                      <ActionButton type="submit" disabled={submittingWithdraw} className="!px-5 !py-3 !text-sm">
                        {submittingWithdraw ? "Submitting..." : "Submit Withdrawal"}
                      </ActionButton>
                      <SecondaryButton type="button" className="!px-5 !py-3 !text-sm" onClick={() => setProfileTab("view")}>
                        Cancel
                      </SecondaryButton>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </GlassPanel>
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
          {["iep", "teachers", "resources", "learn", "games"].map((id) => (
            <button
              key={id}
              onClick={() => goTo(id)}
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
