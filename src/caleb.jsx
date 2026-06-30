import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FaCalendarAlt,
  FaChartBar,
  FaGamepad,
  FaRedo,
  FaSave,
  FaTrophy,
} from "react-icons/fa";

import bg1 from "./background/pexels-enginakyurt-1435752.jpg";
import bg2 from "./background/pexels-francesco-ungaro-673648.jpg";
import bg3 from "./background/pexels-pixabay-268533.jpg";
import bg4 from "./background/pexels-pixabay-356056.jpg";
import bg5 from "./background/pexels-pixabay-531880.jpg";
import bg6 from "./background/pexels-veeterzy-303383.jpg";

const MotionImg = motion.img;

const DEFAULT_COLUMNS = [
  "mpesa",
  "cash",
  "tv1",
  "tv2",
  "tv3",
  "tv4",
  "cyber",
  "token",
  "movies",
  "total",
];

const API_BASE = import.meta.env.VITE_API_BASE || "";

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseLocalDateKey(dateStr) {
  const [year, month, day] = String(dateStr || "")
    .split("-")
    .map(Number);
  if (!year || !month || !day) {
    return new Date();
  }
  return new Date(year, month - 1, day);
}

function formatDayTitle(dateStr) {
  return parseLocalDateKey(dateStr).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function normalizeFinanceRecord(record) {
  const columns = Array.isArray(record?.columns) && record.columns.length > 0
    ? record.columns
    : DEFAULT_COLUMNS;
  const values = record?.values && typeof record.values === "object"
    ? record.values
    : {};

  const normalizedValues = {};
  columns.forEach((column) => {
    normalizedValues[column] = values[column] ?? "";
  });

  return {
    date: record?.date || "",
    columns,
    values: normalizedValues,
    updatedAt: record?.updatedAt || null,
  };
}

export default function Caleb() {
  const [record, setRecord] = useState({
    date: "",
    columns: DEFAULT_COLUMNS,
    values: {},
    updatedAt: null,
  });
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [bgIndex, setBgIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [savedSnapshot, setSavedSnapshot] = useState("");
  const [financeReady, setFinanceReady] = useState(false);
  const [historyData, setHistoryData] = useState({
    yesterday: normalizeFinanceRecord({}),
  });

  // Analytics
  const [analyticsDate, setAnalyticsDate] = useState(getLocalDateKey());
  const [analytics, setAnalytics] = useState({
    dailyIncome: 0,
    weeklyIncome: 0,
    monthlyIncome: 0,
    yearlyIncome: 0,
    weekRange: "",
    monthRange: "",
    yearRange: "",
    selectedDate: getLocalDateKey(),
  });
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const [tournament, setTournament] = useState(null);
  const [tournamentError, setTournamentError] = useState("");
  const [activeSection, setActiveSection] = useState("finance");

  const backgrounds = [bg1, bg2, bg3, bg4, bg5, bg6];

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setDate(getLocalDateKey(now));
      setTime(
        now.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % backgrounds.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [backgrounds.length]);

  useEffect(() => {
    if (!date) return;
    setFinanceReady(false);

    const yesterday = shiftDate(date, -1);

    Promise.all([
      fetch(`${API_BASE}/api/finance/get?date=${date}`).then((res) => res.json()),
      fetch(`${API_BASE}/api/finance/get?date=${yesterday}`).then((res) => res.json()),
    ])
      .then(([today, yesterdayData]) => {
        const normalized = normalizeFinanceRecord(today);
        setRecord(normalized);
        setSavedSnapshot(JSON.stringify(normalized));
        setHistoryData({ yesterday: normalizeFinanceRecord(yesterdayData) });
        setFinanceReady(true);
      })
      .catch(() => {
        const fallback = normalizeFinanceRecord({ date });
        setRecord(fallback);
        setSavedSnapshot(JSON.stringify(fallback));
        setFinanceReady(true);
      });
  }, [date]);

  // Load analytics whenever analyticsDate changes
  useEffect(() => {
    if (!analyticsDate) return;
    setLoadingAnalytics(true);
    fetch(`${API_BASE}/api/finance/analytics?date=${analyticsDate}`)
      .then((res) => res.json())
      .then((data) => {
        setAnalytics({
          dailyIncome: data.dailyIncome || 0,
          weeklyIncome: data.weeklyIncome || 0,
          monthlyIncome: data.monthlyIncome || 0,
          yearlyIncome: data.yearlyIncome || 0,
          weekRange: data.weekRange || "",
          monthRange: data.monthRange || "",
          yearRange: data.yearRange || "",
          selectedDate: data.selectedDate || analyticsDate,
        });
      })
      .catch(() => {})
      .finally(() => setLoadingAnalytics(false));
  }, [analyticsDate]);

  const handleChange = (column, value) => {
    setRecord((prev) => ({
      ...prev,
      values: {
        ...prev.values,
        [column]: value,
      },
    }));
  };

  useEffect(() => {
    if (!date || !record.columns.length || !financeReady) return;

    const currentSnapshot = JSON.stringify(record);
    if (currentSnapshot === savedSnapshot) return;

    const timeout = setTimeout(() => {
      setSaving(true);

      fetch(`${API_BASE}/api/finance/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date,
          ...record.values,
        }),
      })
        .then((res) => res.json())
        .then((res) => {
          const normalized = normalizeFinanceRecord(res.record || { date, ...record });
          setRecord(normalized);
          setSavedSnapshot(JSON.stringify(normalized));
          setSaving(false);
          // Refresh analytics for today after save
          setAnalyticsDate(getLocalDateKey());
        })
        .catch(() => setSaving(false));
    }, 700);

    return () => clearTimeout(timeout);
  }, [date, record, savedSnapshot, financeReady]);

  useEffect(() => {
    loadTournament();
  }, []);

  const loadTournament = async () => {
    setTournamentError("");
    try {
      const data = await fetchJson("/api/admin/overview");
      setTournament(data.tournament);
    } catch (err) {
      setTournamentError(err.message);
    }
  };

  const toggleRegistration = async (open) => {
    try {
      await fetchJson("/api/admin/tournament/toggle-registration", "POST", JSON.stringify({ open }));
      loadTournament();
    } catch (err) {
      setTournamentError(err.message);
    }
  };

  const startTournament = async () => {
    try {
      const data = await fetchJson("/api/admin/tournament/start", "POST", JSON.stringify({}));
      setTournament(data.tournament);
    } catch (err) {
      setTournamentError(err.message);
    }
  };

  const updateMatch = async (matchId, homeScore, awayScore) => {
    try {
      const data = await fetchJson(
        `/api/admin/tournament/matches/${matchId}`,
        "POST",
        JSON.stringify({
          homeScore: Number(homeScore),
          awayScore: Number(awayScore),
        }),
      );
      setTournament(data.tournament);
    } catch (err) {
      setTournamentError(err.message);
    }
  };

  const calebNav = [
    { id: "finance", Icon: FaSave, label: "Finance" },
    { id: "tournament", Icon: FaGamepad, label: "Tournament" },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      <AnimatePresence>
        <MotionImg
          key={bgIndex}
          src={backgrounds[bgIndex]}
          className="absolute h-full w-full object-cover"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        />
      </AnimatePresence>

      <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm" />

      <div className="relative z-10 mx-auto max-w-7xl p-4 sm:p-6">

        {/* Header */}
        <header className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-cyan-400">QOOHI Operations</p>
            <h1 className="text-3xl font-black text-white">{formatDayTitle(date)}</h1>
            <p className="mt-1 text-sm text-slate-400">{time}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold ${saving ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-400 animate-pulse" : "border-emerald-400/20 bg-emerald-400/10 text-emerald-400"}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${saving ? "bg-cyan-400" : "bg-emerald-400"}`} />
              {saving ? "Saving..." : "Saved"}
            </span>
            <button onClick={loadTournament} className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white transition hover:bg-white/10">
              <FaRedo className="text-xs" /> Refresh
            </button>
          </div>
        </header>

        {/* Sidebar Layout */}
        <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">

          {/* Left Sidebar */}
          <aside className="hidden lg:flex flex-col w-48 flex-shrink-0">
            <div className="sticky top-6 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80 backdrop-blur-xl">
              <div className="border-b border-white/10 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Navigation</p>
              </div>
              <nav className="space-y-0.5 p-2">
                {calebNav.map(({ id, Icon, label }) => (
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
              <div className="border-t border-white/10 p-4">
                <div className="rounded-xl border border-white/5 bg-white/5 p-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">Today</p>
                  <p className="mt-1 text-xs font-bold text-white">{date}</p>
                  <p className="mt-0.5 text-[10px] text-slate-500">{time}</p>
                </div>
              </div>
            </div>
          </aside>

          {/* Mobile Nav */}
          <div className="flex lg:hidden gap-2 overflow-x-auto pb-2">
            {calebNav.map(({ id, Icon, label }) => (
              <button key={id} type="button" onClick={() => setActiveSection(id)}
                className={`flex flex-shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition ${
                  activeSection === id ? "bg-cyan-500 text-slate-950" : "border border-white/10 bg-white/5 text-slate-400 hover:text-white"
                }`}
              >
                <Icon className="text-xs" />{label}
              </button>
            ))}
          </div>

          {/* Section Content */}
          <div className="min-w-0 flex-1">

            {/* FINANCE section */}
            {activeSection === "finance" && (
              <div className="space-y-6">
                {/* Finance Table */}
                <div className="overflow-x-auto rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">
                  <table className="w-full min-w-[760px] border-collapse text-center">
                    <thead className="bg-slate-950/60">
                      <tr>
                        {record.columns.map((column) => (
                          <th key={column} className="px-3 py-4 text-[10px] font-black uppercase tracking-widest text-cyan-400">
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        {record.columns.map((column) => (
                          <td key={column} className="border-t border-white/5 p-2">
                            <textarea
                              rows={1}
                              className="min-h-[56px] w-full resize-none overflow-hidden rounded-xl bg-slate-950/40 px-3 py-3 text-center font-bold text-white placeholder-slate-700 transition-colors focus:bg-slate-950/80 focus:outline-none focus:ring-1 focus:ring-cyan-400/30"
                              value={record.values[column] || ""}
                              onChange={(event) => handleChange(column, event.target.value)}
                              placeholder="—"
                            />
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Yesterday History */}
                <div className="grid gap-4 md:grid-cols-2">
                  <HistoryCard
                    label={`Yesterday • ${formatDayTitle(shiftDate(date, -1))}`}
                    record={historyData.yesterday}
                  />
                  {/* Analytics Date Selector */}
                  <div className="rounded-[1.5rem] border border-cyan-500/20 bg-cyan-500/5 p-6 backdrop-blur-xl">
                    <div className="flex items-center gap-3 mb-4">
                      <FaCalendarAlt className="text-cyan-400" />
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400">Select date to see total income for that day</p>
                    </div>
                    <input
                      type="date"
                      value={analyticsDate}
                      onChange={(e) => setAnalyticsDate(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-cyan-400"
                    />
                    {!loadingAnalytics && (
                      <div className="mt-4 flex items-center justify-between rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3">
                        <span className="text-xs font-bold text-slate-400">{analyticsDate === getLocalDateKey() ? "Today's income" : `Income for ${analyticsDate}`}</span>
                        <span className="text-lg font-black text-cyan-300">Ksh {Number(analytics.dailyIncome || 0).toLocaleString()}</span>
                      </div>
                    )}
                    {loadingAnalytics && (
                      <div className="mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm text-slate-500">
                        Loading...
                      </div>
                    )}
                  </div>
                </div>

                {/* Income Summary Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                  <IncomeCard
                    icon={<FaChartBar />}
                    label="Weekly Income"
                    sublabel={analytics.weekRange ? `Mon–Sun · ${analytics.weekRange}` : "Current week"}
                    value={analytics.weeklyIncome}
                    color="cyan"
                    loading={loadingAnalytics}
                  />
                  <IncomeCard
                    icon={<FaChartBar />}
                    label="Monthly Income"
                    sublabel={analytics.monthRange || "Current month"}
                    value={analytics.monthlyIncome}
                    color="blue"
                    loading={loadingAnalytics}
                  />
                  <IncomeCard
                    icon={<FaChartBar />}
                    label="Yearly Income"
                    sublabel={analytics.yearRange || String(new Date().getFullYear())}
                    value={analytics.yearlyIncome}
                    color="emerald"
                    loading={loadingAnalytics}
                  />
                </div>
              </div>
            )}

            {/* TOURNAMENT section */}
            {activeSection === "tournament" && (
              <div className="space-y-6">
                {/* Controls */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => toggleRegistration(true)}
                    className={`rounded-full px-5 py-2.5 text-xs font-black uppercase tracking-widest transition ${
                      tournament?.registrationOpen ? "bg-emerald-400 text-slate-950" : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
                    }`}
                  >
                    Open Registration
                  </button>
                  <button
                    onClick={() => toggleRegistration(false)}
                    className={`rounded-full px-5 py-2.5 text-xs font-black uppercase tracking-widest transition ${
                      !tournament?.registrationOpen ? "bg-rose-400 text-slate-950" : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
                    }`}
                  >
                    Close Registration
                  </button>
                  <button
                    onClick={startTournament}
                    className="flex items-center gap-2 rounded-full bg-cyan-400 px-6 py-2.5 text-xs font-black uppercase tracking-widest text-slate-950 transition hover:bg-cyan-300"
                  >
                    <FaTrophy /> Start Tournament
                  </button>
                </div>

                {tournamentError && (
                  <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm font-bold text-rose-200">
                    {tournamentError}
                  </div>
                )}

                {tournament ? (
                  <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
                    <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                      <div className="mb-5 flex items-center justify-between">
                        <h3 className="font-black uppercase tracking-widest text-white">Standings</h3>
                        <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-300">
                          {Array.isArray(tournament.registered) ? tournament.registered.length : 0} Players
                        </span>
                      </div>
                      <table className="w-full text-left text-sm">
                        <thead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                          <tr>
                            <th className="pb-3">#</th>
                            <th className="pb-3">Name</th>
                            <th className="pb-3">P</th>
                            <th className="pb-3">GD</th>
                            <th className="pb-3 text-right">Pts</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {(tournament.standings || []).map((row, i) => (
                            <tr key={row.registrationId} className={i === 0 ? "text-amber-200" : ""}>
                              <td className="py-3 text-slate-600 font-bold">{i + 1}</td>
                              <td className="py-3 font-bold">{row.name}</td>
                              <td className="py-3 text-slate-400">{row.played}</td>
                              <td className="py-3 text-slate-400">{row.goalDifference}</td>
                              <td className="py-3 text-right font-black text-cyan-400">{row.points}</td>
                            </tr>
                          ))}
                          {(tournament.standings || []).length === 0 && (
                            <tr>
                              <td colSpan="5" className="py-10 text-center text-slate-500 font-bold">No players registered.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                      <h3 className="mb-5 font-black uppercase tracking-widest text-white">Active Matches</h3>
                      <div className="space-y-3">
                        {(tournament.matches || []).map((match) => (
                          <MatchEditor key={match.id} match={match} onSave={updateMatch} />
                        ))}
                        {(tournament.matches || []).length === 0 && (
                          <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center">
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Matches appear after tournament starts</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
                    <FaTrophy className="mx-auto mb-4 text-4xl text-slate-700" />
                    <p className="font-bold text-slate-500">No tournament data. Click Refresh to load.</p>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

function shiftDate(dateStr, days) {
  const next = parseLocalDateKey(dateStr);
  next.setDate(next.getDate() + days);
  return getLocalDateKey(next);
}

function IncomeCard({ icon, label, sublabel, value, color = "cyan", loading }) {
  const colors = {
    cyan: "border-cyan-500/20 bg-cyan-500/5 text-cyan-400",
    blue: "border-blue-500/20 bg-blue-500/5 text-blue-400",
    emerald: "border-emerald-500/20 bg-emerald-500/5 text-emerald-400",
    amber: "border-amber-500/20 bg-amber-500/5 text-amber-400",
  };
  const cls = colors[color] || colors.cyan;

  return (
    <div className={`rounded-[1.5rem] border p-6 backdrop-blur-xl ${cls}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm">{icon}</span>
        <p className="text-[10px] font-black uppercase tracking-[0.3em]">{label}</p>
      </div>
      {loading ? (
        <div className="h-8 animate-pulse rounded-lg bg-white/10" />
      ) : (
        <p className="text-3xl font-black text-white">Ksh {Number(value || 0).toLocaleString()}</p>
      )}
      <p className="mt-2 text-[10px] text-slate-500 truncate">{sublabel}</p>
    </div>
  );
}

function HistoryCard({ label, record }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
      <p className="mb-4 text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400">
        {label}
      </p>
      <div className="grid grid-cols-2 gap-x-8 gap-y-3">
        {record.columns.map((column) => (
          <div key={column} className="flex items-center justify-between border-b border-white/5 pb-2 text-xs">
            <span className="font-black uppercase tracking-widest text-slate-500">{column}</span>
            <span className="font-bold text-white">{record.values[column] || "-"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MatchEditor({ match, onSave }) {
  const [homeScore, setHomeScore] = useState(
    Number.isInteger(match.home_score) ? String(match.home_score) : "",
  );
  const [awayScore, setAwayScore] = useState(
    Number.isInteger(match.away_score) ? String(match.away_score) : "",
  );

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest text-rose-400">{match.stage} • R{match.round_number}</span>
      </div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center justify-between gap-4">
          <span className="flex-1 font-bold text-white">{match.home_name}</span>
          <input
            value={homeScore}
            onChange={(e) => setHomeScore(e.target.value)}
            className="w-16 rounded-lg border border-white/10 bg-slate-900 px-2 py-2 text-center font-black focus:border-cyan-400 outline-none"
            placeholder="-"
          />
        </div>
        <div className="hidden text-slate-600 sm:block">vs</div>
        <div className="flex flex-1 items-center justify-between gap-4">
          <input
            value={awayScore}
            onChange={(e) => setAwayScore(e.target.value)}
            className="w-16 rounded-lg border border-white/10 bg-slate-900 px-2 py-2 text-center font-black focus:border-cyan-400 outline-none"
            placeholder="-"
          />
          <span className="flex-1 text-right font-bold text-white">{match.away_name}</span>
        </div>
        <button
          onClick={() => onSave(match.id, homeScore, awayScore)}
          className="rounded-xl bg-cyan-400 p-3 text-slate-950 hover:bg-cyan-300 transition"
        >
          <FaSave />
        </button>
      </div>
    </div>
  );
}

async function fetchJson(path, method = "GET", body) {
  const adminKey = localStorage.getItem("qoohi_admin_key") || "";
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(adminKey ? { "x-admin-key": adminKey } : {}),
    },
    body,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Request failed.");
  }
  return data;
}
