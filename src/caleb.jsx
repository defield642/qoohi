import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
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

const API_BASE =
  import.meta.env.VITE_API_BASE || (import.meta.env.PROD ? "" : "http://localhost:3000");

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
    weekAgo: normalizeFinanceRecord({}),
  });

  const [tournament, setTournament] = useState(null);
  const [tournamentError, setTournamentError] = useState("");

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
    const weekAgo = shiftDate(date, -7);

    Promise.all([
      fetch(`${API_BASE}/api/finance/get?date=${date}`).then((res) => res.json()),
      fetch(`${API_BASE}/api/finance/get?date=${yesterday}`).then((res) => res.json()),
      fetch(`${API_BASE}/api/finance/get?date=${weekAgo}`).then((res) => res.json()),
    ])
      .then(([today, yesterdayData, weekAgoData]) => {
        const normalized = normalizeFinanceRecord(today);
        setRecord(normalized);
        setSavedSnapshot(JSON.stringify(normalized));
        setHistoryData({
          yesterday: normalizeFinanceRecord(yesterdayData),
          weekAgo: normalizeFinanceRecord(weekAgoData),
        });
        setFinanceReady(true);
      })
      .catch(() => {
        const fallback = normalizeFinanceRecord({ date });
        setRecord(fallback);
        setSavedSnapshot(JSON.stringify(fallback));
        setFinanceReady(true);
      });
  }, [date]);

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

      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div className="relative z-10 mx-auto max-w-7xl p-6">
        <header className="mb-12">
          <h1 className="text-4xl font-black">{formatDayTitle(date)}</h1>
          <p className="mt-2 text-xl text-gray-400">{time}</p>
        </header>

        <section className="mb-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-black uppercase tracking-tighter">Finance Log</h2>
            <p className={`text-sm font-bold ${saving ? "text-cyan-400 animate-pulse" : "text-emerald-400"}`}>
              {saving ? "Saving..." : "All changes saved"}
            </p>
          </div>

          <div className="overflow-x-auto rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">
            <table className="w-full min-w-[960px] border-collapse text-center">
              <thead className="bg-slate-950/50">
                <tr>
                  {record.columns.map((column) => (
                    <th key={column} className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
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
                        className="min-h-[60px] w-full resize-none overflow-hidden rounded-xl bg-slate-950/40 px-3 py-4 text-center font-bold text-white focus:bg-slate-950/80 focus:outline-none transition-colors"
                        value={record.values[column] || ""}
                        onChange={(event) => handleChange(column, event.target.value)}
                      />
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <HistoryCard
              label={`Yesterday • ${formatDayTitle(shiftDate(date, -1))}`}
              record={historyData.yesterday}
            />
            <HistoryCard
              label={`7 Days Ago • ${formatDayTitle(shiftDate(date, -7))}`}
              record={historyData.weekAgo}
            />
          </div>
        </section>

        <section className="mb-12">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <FaGamepad className="text-3xl text-rose-400" />
              <h2 className="text-2xl font-black uppercase tracking-tighter">Tournament Manager</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => toggleRegistration(true)}
                className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-widest transition ${
                  tournament?.registrationOpen ? "bg-emerald-400 text-slate-950" : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                Open Registration
              </button>
              <button
                onClick={() => toggleRegistration(false)}
                className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-widest transition ${
                  !tournament?.registrationOpen ? "bg-rose-400 text-slate-950" : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                Close Registration
              </button>
              <button
                onClick={startTournament}
                className="flex items-center gap-2 rounded-full bg-cyan-400 px-6 py-2 text-xs font-black uppercase tracking-widest text-slate-950 transition hover:bg-cyan-300"
              >
                <FaTrophy /> Start Tournament
              </button>
            </div>
          </div>

          {tournamentError && (
            <div className="mb-6 rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm font-bold text-rose-200">
              {tournamentError}
            </div>
          )}

          {tournament && (
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-lg font-black uppercase tracking-widest">Standings</h3>
                  <span className="text-xs font-bold text-slate-400">{tournament.registered} Players</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                      <tr>
                        <th className="pb-4">Name</th>
                        <th className="pb-4">P</th>
                        <th className="pb-4">GD</th>
                        <th className="pb-4 text-right">Pts</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {tournament.standings.map((row) => (
                        <tr key={row.registrationId}>
                          <td className="py-4 font-bold">{row.name}</td>
                          <td className="py-4">{row.played}</td>
                          <td className="py-4">{row.goalDifference}</td>
                          <td className="py-4 text-right font-black text-cyan-400">{row.points}</td>
                        </tr>
                      ))}
                      {tournament.standings.length === 0 && (
                        <tr>
                          <td colSpan="4" className="py-10 text-center text-slate-500 font-bold">No players registered.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
                <h3 className="mb-6 text-lg font-black uppercase tracking-widest">Active Matches</h3>
                <div className="grid gap-4">
                  {tournament.matches.map((match) => (
                    <MatchEditor key={match.id} match={match} onSave={updateMatch} />
                  ))}
                  {tournament.matches.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center">
                      <p className="text-slate-500 font-bold uppercase tracking-widest">Matches will appear here after starting</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function shiftDate(dateStr, days) {
  const next = parseLocalDateKey(dateStr);
  next.setDate(next.getDate() + days);
  return getLocalDateKey(next);
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
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-admin-key": localStorage.getItem("qoohi_admin_key") || "",
    },
    body,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Request failed.");
  }
  return data;
}
