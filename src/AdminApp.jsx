import { useEffect, useState } from "react";
import {
  FaChalkboardTeacher,
  FaCheck,
  FaEnvelope,
  FaGamepad,
  FaLaptopCode,
  FaMoneyBillWave,
  FaRedo,
  FaRobot,
  FaSave,
  FaShieldAlt,
  FaSlidersH,
  FaTimes,
  FaUserCircle,
  FaUsers,
  FaWallet,
} from "react-icons/fa";
import bg1 from "./background/pexels-pixabay-356056.jpg";
import bg2 from "./background/pexels-veeterzy-303383.jpg";
import bg3 from "./background/pexels-francesco-ungaro-673648.jpg";
import bg4 from "./background/pexels-enginakyurt-1435752.jpg";
import bg5 from "./background/pexels-pixabay-268533.jpg";
import bg6 from "./background/pexels-pixabay-531880.jpg";

const API_BASE =
  import.meta.env.VITE_API_BASE || (import.meta.env.PROD ? "" : "http://localhost:3000");

const DEFAULT_FINANCE_COLUMNS = [
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



const groupIcons = {
  computer_packages: FaLaptopCode,
  coding_ai_training: FaRobot,
  both: FaUsers,
  tournament: FaGamepad,
  teacher: FaChalkboardTeacher,
  parent: FaUsers,
  iep: FaShieldAlt,
};

const groupColors = {
  computer_packages: "from-sky-500/30 to-cyan-400/10",
  coding_ai_training: "from-emerald-500/30 to-teal-400/10",
  both: "from-amber-500/30 to-orange-400/10",
  tournament: "from-rose-500/30 to-fuchsia-400/10",
  teacher: "from-violet-500/30 to-purple-400/10",
  parent: "from-blue-500/30 to-indigo-400/10",
  iep: "from-cyan-500/30 to-sky-400/10",
};

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

function shiftDate(dateStr, days) {
  const next = parseLocalDateKey(dateStr);
  next.setDate(next.getDate() + days);
  return getLocalDateKey(next);
}

function normalizeFinanceRecord(record, date) {
  const columns = Array.isArray(record?.columns) && record.columns.length > 0
    ? record.columns
    : DEFAULT_FINANCE_COLUMNS;
  const incomingValues =
    record?.values && typeof record.values === "object" ? record.values : {};
  const values = {};
  columns.forEach((column) => {
    values[column] = incomingValues[column] ?? "";
  });

  return {
    date: record?.date || date,
    columns,
    values,
    updatedAt: record?.updatedAt || null,
  };
}

function buildServiceChargeDrafts(items = []) {
  return items.reduce((drafts, item) => {
    drafts[item.service_key] = {
      label: item.label || "",
      description: item.description || "",
      chargeKsh: String(item.charge_ksh ?? 0),
      active: Number(item.active || 0) === 1,
      sortOrder: String(item.sort_order ?? 0),
    };
    return drafts;
  }, {});
}

export default function AdminApp() {
  const [adminKey, setAdminKey] = useState(localStorage.getItem("qoohi_admin_key") || "");
  const [overview, setOverview] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [adminVerified, setAdminVerified] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [financeDate, setFinanceDate] = useState(getLocalDateKey());
  const [financeRecord, setFinanceRecord] = useState(
    normalizeFinanceRecord({ date: getLocalDateKey() }, getLocalDateKey()),
  );
  const [historyData, setHistoryData] = useState({
    yesterday: normalizeFinanceRecord({}, shiftDate(getLocalDateKey(), -1)),
    weekAgo: normalizeFinanceRecord({}, shiftDate(getLocalDateKey(), -7)),
  });
  const [composer, setComposer] = useState({
    subject: "",
    message: "",
    pdfLinks: "",
  });
  const [users, setUsers] = useState([]);
  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [serviceCharges, setServiceCharges] = useState([]);
  const [serviceDrafts, setServiceDrafts] = useState({});
  const [balanceForm, setBalanceForm] = useState({
    userId: "",
    amount: "",
    reason: "Admin adjustment",
  });
  const [balanceMode, setBalanceMode] = useState("add");
  const [adjustingBalance, setAdjustingBalance] = useState(false);
  const [savingChargeKey, setSavingChargeKey] = useState("");
  const [processingDepositId, setProcessingDepositId] = useState(null);
  const [processingWithdrawalId, setProcessingWithdrawalId] = useState(null);
  const [depositNotes, setDepositNotes] = useState({});
  const [withdrawNotes, setWithdrawNotes] = useState({});
  const [adminStatus, setAdminStatus] = useState("");
  const backgroundImages = [bg1, bg2, bg3, bg4, bg5, bg6];
  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  const loadFinanceRecord = async (dateToLoad) => {
    const response = await fetch(`${API_BASE}/api/finance/get?date=${dateToLoad}`);
    const data = await response.json().catch(() => ({}));
    return normalizeFinanceRecord(data, dateToLoad);
  };

  useEffect(() => {
    Promise.all([
      loadFinanceRecord(financeDate),
      loadFinanceRecord(shiftDate(financeDate, -1)),
      loadFinanceRecord(shiftDate(financeDate, -7)),
    ])
      .then(([today, yesterday, weekAgo]) => {
        setFinanceRecord(today);
        setHistoryData({ yesterday, weekAgo });
      })
      .catch(() => {
        setFinanceRecord(normalizeFinanceRecord({}, financeDate));
      });
  }, [financeDate]);

  useEffect(() => {
    setServiceDrafts(buildServiceChargeDrafts(serviceCharges));
  }, [serviceCharges]);

  const loadCollections = async (key = adminKey) => {
    const [usersData, depositsData, withdrawalsData] = await Promise.all([
      fetchJson("/api/admin/users/all", key),
      fetchJson("/api/admin/deposits", key),
      fetchJson("/api/admin/withdrawals", key),
    ]);
    setUsers(usersData.users || []);
    setDeposits(depositsData.deposits || []);
    setWithdrawals(withdrawalsData.withdrawals || []);
  };

  const loadOverview = async () => {
    setLoading(true);
    setError("");
    setAdminStatus("");
    try {
      const data = await fetchJson("/api/admin/overview", adminKey);
      setOverview(data);
      setServiceCharges(Array.isArray(data.serviceCharges) ? data.serviceCharges : []);
      setAdminVerified(true);
      if (!selectedGroup && data.groups.length > 0) {
        setSelectedGroup(data.groups[0]);
      }
      localStorage.setItem("qoohi_admin_key", adminKey);
      try {
        await loadCollections(adminKey);
      } catch (collectionErr) {
        setError(collectionErr.message);
      }
    } catch (err) {
      setAdminVerified(false);
      setOverview(null);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const activeGroup =
    overview?.groups.find((group) => group.key === selectedGroup?.key) || null;

  const sendMessage = async (targetType, targetId) => {
    setError("");
    try {
      const data = await fetchJson(
        "/api/admin/messages",
        adminKey,
        "POST",
        JSON.stringify({
          targetType,
          targetId,
          subject: composer.subject,
          message: composer.message,
          pdfLinks: composer.pdfLinks
            .split("\n")
            .map((item) => item.trim())
            .filter(Boolean),
        }),
      );
      setComposer({ subject: "", message: "", pdfLinks: "" });
      setOverview((current) => ({ ...current, groups: data.groups }));
    } catch (err) {
      setError(err.message);
    }
  };

  const updateMatch = async (matchId, homeScore, awayScore) => {
    setError("");
    try {
      const data = await fetchJson(
        `/api/admin/tournament/matches/${matchId}`,
        adminKey,
        "POST",
        JSON.stringify({
          homeScore: Number(homeScore),
          awayScore: Number(awayScore),
        }),
      );
      setOverview((current) => ({ ...current, tournament: data.tournament }));
    } catch (err) {
      setError(err.message);
    }
  };

  const updateIep = async (userId, assessmentStatus, performanceLevel) => {
    setError("");
    try {
      const data = await fetchJson(
        `/api/admin/users/${userId}/iep`,
        adminKey,
        "POST",
        JSON.stringify({
          assessmentStatus,
          performanceLevel: Number(performanceLevel),
        }),
      );
      setOverview((current) => ({ ...current, groups: data.groups }));
      // Update selectedMember if it was the one being edited
      if (selectedMember?.id === userId) {
        const updatedMember = data.groups
          .flatMap((g) => g.members)
          .find((m) => m.id === userId);
        if (updatedMember) setSelectedMember(updatedMember);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const restartTournament = async () => {
    setError("");
    try {
      const data = await fetchJson(
        "/api/admin/tournament/restart",
        adminKey,
        "POST",
        JSON.stringify({}),
      );
      setOverview((current) => ({ ...current, tournament: data.tournament }));
    } catch (err) {
      setError(err.message);
    }
  };

  const saveBalanceUpdate = async (event) => {
    event.preventDefault();
    setAdjustingBalance(true);
    setError("");
    setAdminStatus("");
    try {
      const amount = Math.abs(Number(balanceForm.amount || 0));
      if (!balanceForm.userId || !amount) {
        throw new Error("Choose a user and enter a non-zero amount.");
      }
      const signedAmount = balanceMode === "deduct" ? -amount : amount;
      await fetchJson(
        "/api/admin/balance/update",
        adminKey,
        "POST",
        JSON.stringify({
          userId: Number(balanceForm.userId),
          amount: signedAmount,
          reason: balanceForm.reason,
        }),
      );
      setBalanceForm({ userId: "", amount: "", reason: "Admin adjustment" });
      setBalanceMode("add");
      await loadOverview();
      setAdminStatus("Balance updated successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setAdjustingBalance(false);
    }
  };

  const saveServiceCharge = async (serviceKey) => {
    setSavingChargeKey(serviceKey);
    setError("");
    setAdminStatus("");
    try {
      const draft = serviceDrafts[serviceKey] || {};
      await fetchJson(
        `/api/admin/service-charges/${serviceKey}`,
        adminKey,
        "POST",
        JSON.stringify({
          label: draft.label,
          description: draft.description,
          chargeKsh: Number(draft.chargeKsh || 0),
          active: Boolean(draft.active),
          sortOrder: Number(draft.sortOrder || 0),
        }),
      );
      await loadOverview();
      setAdminStatus(`Saved ${draft.label || serviceKey}.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingChargeKey("");
    }
  };

  const processDeposit = async (depositId, status) => {
    setProcessingDepositId(depositId);
    setError("");
    setAdminStatus("");
    try {
      await fetchJson(
        `/api/admin/deposits/${depositId}/verify`,
        adminKey,
        "POST",
        JSON.stringify({
          status,
          note: depositNotes[depositId] || "",
        }),
      );
      await loadOverview();
      setAdminStatus(status === "verified" ? "Deposit verified." : "Deposit rejected.");
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessingDepositId(null);
    }
  };

  const processWithdrawal = async (withdrawalId, status) => {
    setProcessingWithdrawalId(withdrawalId);
    setError("");
    setAdminStatus("");
    try {
      await fetchJson(
        `/api/admin/withdrawals/${withdrawalId}/process`,
        adminKey,
        "POST",
        JSON.stringify({
          status,
          note: withdrawNotes[withdrawalId] || "",
        }),
      );
      await loadOverview();
      setAdminStatus(status === "processed" ? "Withdrawal processed." : "Withdrawal rejected.");
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessingWithdrawalId(null);
    }
  };

  const sortedServiceCharges = [...serviceCharges].sort(
    (left, right) => Number(left.sort_order || 0) - Number(right.sort_order || 0),
  );
  const totalBalance = users.reduce((sum, user) => sum + Number(user.balance || 0), 0);
  const pendingDeposits = deposits.filter((item) => item.status === "pending").length;
  const pendingWithdrawals = withdrawals.filter((item) => item.status === "pending").length;
  const activeCharges = serviceCharges.filter((item) => Number(item.active || 0) === 1).length;
  const selectedBalanceUser = users.find((user) => String(user.id) === String(balanceForm.userId)) || null;

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      {backgroundImages.map((img, index) => (
        <div
          key={index}
          className={`absolute inset-0 bg-cover bg-center transition-all duration-[3000ms] ${
            index === bgIndex ? "scale-100 opacity-100" : "scale-110 opacity-0"
          }`}
          style={{
            backgroundImage: `
              linear-gradient(
                160deg,
                rgba(2,6,23,0.96),
                rgba(15,23,42,0.92)
              ),
              url(${img})
            `,
          }}
        />
      ))}

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <header className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.34em] text-cyan-200">
            Secure Admin
          </p>
          <h1 className="mt-3 text-4xl font-black text-white">QOOHI Admin</h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-300">
            Manage balances, service pricing, deposits, withdrawals, and group updates from one workspace.
          </p>
        </header>

        <section className="mb-8 rounded-[2rem] border border-white/10 bg-white/10 p-8 backdrop-blur-xl">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
            <Field label="Admin access key">
              <input
                type="password"
                value={adminKey}
                onChange={(event) => setAdminKey(event.target.value)}
                className="w-full rounded-[1.25rem] border border-white/12 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-cyan-300/60"
              />
            </Field>
            <button
              onClick={loadOverview}
              className="inline-flex h-[52px] items-center justify-center rounded-full bg-cyan-300 px-6 text-sm font-black text-slate-950 transition hover:bg-cyan-200"
            >
              {loading ? "Verifying..." : "Open admin"}
            </button>
          </div>
          {adminVerified && !error && (
            <div className="mt-4 rounded-[1.25rem] border border-emerald-300/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
              Admin key verified.
            </div>
          )}
          {error && <Notice>{error}</Notice>}
        </section>

        {overview && adminVerified && (
          <div className="space-y-8">
            {adminStatus && (
              <div className="rounded-[1.5rem] border border-emerald-300/20 bg-emerald-400/10 px-5 py-4 text-sm font-semibold text-emerald-100">
                {adminStatus}
              </div>
            )}

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              {[
                { label: "Users", value: users.length.toLocaleString(), note: "Total accounts" },
                { label: "Balance", value: `Ksh ${totalBalance.toLocaleString()}`, note: "Combined user balance" },
                { label: "Pending deposits", value: pendingDeposits.toLocaleString(), note: "Awaiting verification" },
                { label: "Pending withdrawals", value: pendingWithdrawals.toLocaleString(), note: "Awaiting processing" },
                { label: "Active charges", value: activeCharges.toLocaleString(), note: "Editable service prices" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-[1.75rem] border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-200">{stat.label}</p>
                  <h3 className="mt-3 text-3xl font-black text-white">{stat.value}</h3>
                  <p className="mt-2 text-sm text-slate-300">{stat.note}</p>
                </div>
              ))}
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.34em] text-cyan-200">Balances</p>
                    <h2 className="mt-2 text-2xl font-black text-white">All user accounts</h2>
                  </div>
                  <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-slate-300">
                    <FaWallet /> Balance center
                  </div>
                </div>
                <div className="mt-6 max-h-[34rem] overflow-y-auto pr-1">
                  <table className="min-w-full text-left text-sm text-slate-200">
                    <thead className="sticky top-0 bg-slate-950/95 text-xs uppercase tracking-[0.24em] text-cyan-100 backdrop-blur-xl">
                      <tr>
                        <th className="pb-4">User</th>
                        <th className="pb-4">Role</th>
                        <th className="pb-4">Balance</th>
                        <th className="pb-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className={`border-t border-white/10 ${balanceForm.userId === String(user.id) ? "bg-cyan-300/5" : ""}`}>
                          <td className="py-4 pr-4">
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-12 overflow-hidden rounded-2xl border border-white/10 bg-slate-950">
                                {user.avatar_url ? (
                                  <img src={user.avatar_url} alt={user.full_name} className="h-full w-full object-cover" />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center bg-slate-900 text-lg font-black text-cyan-300">
                                    {(user.full_name || "Q")[0]}
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="font-semibold text-white">{user.full_name}</p>
                                <p className="text-xs text-slate-400">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 text-slate-300">{user.role}</td>
                          <td className="py-4 font-bold text-cyan-300">Ksh {Number(user.balance || 0).toLocaleString()}</td>
                          <td className="py-4 text-right">
                            <button
                              onClick={() => setBalanceForm((current) => ({ ...current, userId: String(user.id) }))}
                              className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-cyan-200 transition hover:bg-cyan-300 hover:text-slate-950"
                            >
                              Edit balance
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.34em] text-cyan-200">Balance editor</p>
                      <h2 className="mt-2 text-2xl font-black text-white">
                        {selectedBalanceUser ? selectedBalanceUser.full_name : "Choose a user"}
                      </h2>
                    </div>
                    <FaUserCircle className="text-3xl text-cyan-200" />
                  </div>
                  {selectedBalanceUser && (
                    <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-slate-950/50 p-4">
                      <p className="text-sm font-semibold text-white">{selectedBalanceUser.email}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.22em] text-slate-400">{selectedBalanceUser.role}</p>
                      <p className="mt-3 text-sm text-slate-300">
                        Current balance: <span className="font-bold text-cyan-300">Ksh {Number(selectedBalanceUser.balance || 0).toLocaleString()}</span>
                      </p>
                    </div>
                  )}
                  <form className="mt-5 space-y-4" onSubmit={saveBalanceUpdate}>
                    <Field label="User">
                      <select
                        value={balanceForm.userId}
                        onChange={(event) => setBalanceForm((current) => ({ ...current, userId: event.target.value }))}
                        className="w-full rounded-[1.25rem] border border-white/12 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-cyan-300/60"
                      >
                        <option value="">Select a user</option>
                        {users.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.full_name} • Ksh {Number(user.balance || 0).toLocaleString()}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => setBalanceMode("add")}
                        className={`rounded-[1.2rem] border px-4 py-3 text-sm font-bold transition ${
                          balanceMode === "add"
                            ? "border-cyan-300/40 bg-cyan-300/10 text-cyan-200"
                            : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                        }`}
                      >
                        Add balance
                      </button>
                      <button
                        type="button"
                        onClick={() => setBalanceMode("deduct")}
                        className={`rounded-[1.2rem] border px-4 py-3 text-sm font-bold transition ${
                          balanceMode === "deduct"
                            ? "border-rose-300/40 bg-rose-300/10 text-rose-200"
                            : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                        }`}
                      >
                        Deduct balance
                      </button>
                    </div>
                    <Field label={`Amount (${balanceMode})`}>
                      <input
                        type="number"
                        min="0"
                        value={balanceForm.amount}
                        onChange={(event) => setBalanceForm((current) => ({ ...current, amount: event.target.value }))}
                        className="w-full rounded-[1.25rem] border border-white/12 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-cyan-300/60"
                      />
                    </Field>
                    <Field label="Reason">
                      <input
                        value={balanceForm.reason}
                        onChange={(event) => setBalanceForm((current) => ({ ...current, reason: event.target.value }))}
                        className="w-full rounded-[1.25rem] border border-white/12 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-cyan-300/60"
                      />
                    </Field>
                    <button
                      type="submit"
                      disabled={adjustingBalance}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <FaSave /> {adjustingBalance ? "Saving..." : "Save balance"}
                    </button>
                  </form>
                </div>
              </div>
            </section>

            <section className="rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.34em] text-cyan-200">Services</p>
                  <h2 className="mt-2 text-2xl font-black text-white">Editable service charges</h2>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-slate-300">
                  <FaSlidersH /> {activeCharges} active of {serviceCharges.length}
                </div>
              </div>
              <div className="mt-6 grid gap-4 xl:grid-cols-2">
                {sortedServiceCharges.map((service) => {
                  const draft = serviceDrafts[service.service_key] || {
                    label: service.label,
                    description: service.description,
                    chargeKsh: String(service.charge_ksh ?? 0),
                    active: Number(service.active || 0) === 1,
                    sortOrder: String(service.sort_order ?? 0),
                  };
                  const active = Boolean(draft.active);
                  return (
                    <div key={service.service_key} className="rounded-[1.75rem] border border-white/10 bg-slate-950/45 p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-200">{service.service_key}</p>
                          <h3 className="mt-2 text-xl font-black text-white">{draft.label}</h3>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setServiceDrafts((current) => ({
                              ...current,
                              [service.service_key]: {
                                ...draft,
                                active: !active,
                              },
                            }))
                          }
                          className={`rounded-full border px-3 py-2 text-[10px] font-black uppercase tracking-[0.24em] transition ${
                            active
                              ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-200"
                              : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                          }`}
                        >
                          {active ? "Active" : "Inactive"}
                        </button>
                      </div>
                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <Field label="Label">
                          <input
                            value={draft.label}
                            onChange={(event) =>
                              setServiceDrafts((current) => ({
                                ...current,
                                [service.service_key]: { ...draft, label: event.target.value },
                              }))
                            }
                            className="w-full rounded-[1.25rem] border border-white/12 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-cyan-300/60"
                          />
                        </Field>
                        <Field label="Charge (Ksh)">
                          <input
                            type="number"
                            min="0"
                            value={draft.chargeKsh}
                            onChange={(event) =>
                              setServiceDrafts((current) => ({
                                ...current,
                                [service.service_key]: { ...draft, chargeKsh: event.target.value },
                              }))
                            }
                            className="w-full rounded-[1.25rem] border border-white/12 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-cyan-300/60"
                          />
                        </Field>
                        <Field label="Sort order">
                          <input
                            type="number"
                            min="0"
                            value={draft.sortOrder}
                            onChange={(event) =>
                              setServiceDrafts((current) => ({
                                ...current,
                                [service.service_key]: { ...draft, sortOrder: event.target.value },
                              }))
                            }
                            className="w-full rounded-[1.25rem] border border-white/12 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-cyan-300/60"
                          />
                        </Field>
                        <label className="block sm:col-span-2">
                          <span className="mb-2 block text-sm font-semibold text-slate-200">Description</span>
                          <textarea
                            rows="3"
                            value={draft.description}
                            onChange={(event) =>
                              setServiceDrafts((current) => ({
                                ...current,
                                [service.service_key]: { ...draft, description: event.target.value },
                              }))
                            }
                            className="w-full rounded-[1.25rem] border border-white/12 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-cyan-300/60"
                          />
                        </label>
                      </div>
                      <button
                        type="button"
                        onClick={() => saveServiceCharge(service.service_key)}
                        disabled={savingChargeKey === service.service_key}
                        className="mt-4 inline-flex items-center gap-2 rounded-full bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <FaSave /> {savingChargeKey === service.service_key ? "Saving..." : "Save charge"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-2">
              <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.34em] text-cyan-200">Deposits</p>
                    <h2 className="mt-2 text-2xl font-black text-white">Verify incoming payments</h2>
                  </div>
                  <FaWallet className="text-3xl text-cyan-200" />
                </div>
                <div className="mt-6 max-h-[34rem] space-y-4 overflow-y-auto pr-1">
                  {deposits.map((item) => (
                    <div key={item.id} className="rounded-[1.5rem] border border-white/10 bg-slate-950/45 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-white">{item.full_name}</p>
                          <p className="text-xs text-slate-400">{item.email}</p>
                        </div>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-slate-300">
                          {item.status}
                        </span>
                      </div>
                      <div className="mt-4 grid gap-2 text-sm text-slate-300">
                        <p>Ksh {Number(item.amount || 0).toLocaleString()}</p>
                        <p>Reference: {item.mpesa_ref || "-"}</p>
                        <p>Phone: {item.phone || "-"}</p>
                      </div>
                      <label className="mt-4 block">
                        <span className="mb-2 block text-xs font-bold uppercase tracking-[0.24em] text-slate-400">Admin note</span>
                        <input
                          value={depositNotes[item.id] ?? item.admin_note ?? ""}
                          onChange={(event) =>
                            setDepositNotes((current) => ({ ...current, [item.id]: event.target.value }))
                          }
                          className="w-full rounded-[1.2rem] border border-white/12 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-cyan-300/60"
                        />
                      </label>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => processDeposit(item.id, "verified")}
                          disabled={processingDepositId === item.id}
                          className="inline-flex items-center gap-2 rounded-full bg-emerald-300 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-slate-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <FaCheck /> {processingDepositId === item.id ? "Working..." : "Verify"}
                        </button>
                        <button
                          type="button"
                          onClick={() => processDeposit(item.id, "rejected")}
                          disabled={processingDepositId === item.id}
                          className="inline-flex items-center gap-2 rounded-full border border-rose-300/30 bg-rose-300/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-rose-100 transition hover:bg-rose-300/20 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <FaTimes /> Reject
                        </button>
                      </div>
                    </div>
                  ))}
                  {deposits.length === 0 && <p className="text-sm text-slate-400">No deposits found.</p>}
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.34em] text-cyan-200">Withdrawals</p>
                    <h2 className="mt-2 text-2xl font-black text-white">Process payout requests</h2>
                  </div>
                  <FaMoneyBillWave className="text-3xl text-cyan-200" />
                </div>
                <div className="mt-6 max-h-[34rem] space-y-4 overflow-y-auto pr-1">
                  {withdrawals.map((item) => (
                    <div key={item.id} className="rounded-[1.5rem] border border-white/10 bg-slate-950/45 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-white">{item.full_name}</p>
                          <p className="text-xs text-slate-400">{item.email}</p>
                        </div>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-slate-300">
                          {item.status}
                        </span>
                      </div>
                      <div className="mt-4 grid gap-2 text-sm text-slate-300">
                        <p>Ksh {Number(item.amount || 0).toLocaleString()}</p>
                        <p>M-Pesa name: {item.mpesa_name || "-"}</p>
                        <p>M-Pesa number: {item.mpesa_number || "-"}</p>
                      </div>
                      <label className="mt-4 block">
                        <span className="mb-2 block text-xs font-bold uppercase tracking-[0.24em] text-slate-400">Admin note</span>
                        <input
                          value={withdrawNotes[item.id] ?? item.admin_note ?? ""}
                          onChange={(event) =>
                            setWithdrawNotes((current) => ({ ...current, [item.id]: event.target.value }))
                          }
                          className="w-full rounded-[1.2rem] border border-white/12 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-cyan-300/60"
                        />
                      </label>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => processWithdrawal(item.id, "processed")}
                          disabled={processingWithdrawalId === item.id}
                          className="inline-flex items-center gap-2 rounded-full bg-emerald-300 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-slate-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <FaCheck /> {processingWithdrawalId === item.id ? "Working..." : "Process"}
                        </button>
                        <button
                          type="button"
                          onClick={() => processWithdrawal(item.id, "rejected")}
                          disabled={processingWithdrawalId === item.id}
                          className="inline-flex items-center gap-2 rounded-full border border-rose-300/30 bg-rose-300/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-rose-100 transition hover:bg-rose-300/20 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <FaTimes /> Reject
                        </button>
                      </div>
                    </div>
                  ))}
                  {withdrawals.length === 0 && <p className="text-sm text-slate-400">No withdrawals found.</p>}
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-[0.34em] text-cyan-200">Groups</p>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {overview.groups.map((group) => {
                  const Icon = groupIcons[group.key] || FaUsers;
                  return (
                    <button
                      key={group.key}
                      onClick={() => {
                        setSelectedGroup(group);
                        setSelectedMember(null);
                      }}
                      className={`overflow-hidden rounded-[1.8rem] border p-6 text-left backdrop-blur-xl transition ${
                        selectedGroup?.key === group.key
                          ? "border-cyan-300/50 bg-cyan-300/10"
                          : "border-white/10 bg-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className={`rounded-[1.3rem] bg-gradient-to-br ${groupColors[group.key]} p-5`}>
                        <Icon className="text-3xl text-white" />
                        <p className="mt-8 text-xs font-bold uppercase tracking-[0.3em] text-white/80">Category</p>
                        <h2 className="mt-2 text-2xl font-black text-white">{group.name}</h2>
                        <p className="mt-2 text-sm text-white/80">{group.count} members</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.34em] text-cyan-200">
                    INCOME & EXPENSES
                  </p>
                  <h2 className="mt-2 text-2xl font-black text-white">
                    {formatDayTitle(financeDate)}
                  </h2>
                  <p className="mt-2 text-sm text-slate-300">
                    Last updated: {financeRecord.updatedAt ? new Date(financeRecord.updatedAt).toLocaleString("en-US") : "Not saved yet"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setFinanceDate((current) => shiftDate(current, -1))}
                    className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white"
                  >
                    Previous Day
                  </button>
                  <button
                    onClick={() => setFinanceDate(getLocalDateKey())}
                    className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => setFinanceDate((current) => shiftDate(current, 1))}
                    className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white"
                  >
                    Next Day
                  </button>
                </div>
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="min-w-[960px] w-full border border-white/10 text-center">
                  <thead className="bg-slate-900 text-white">
                    <tr>
                      {financeRecord.columns.map((column) => (
                        <th key={column} className="p-3 text-xs uppercase tracking-[0.18em]">
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {financeRecord.columns.map((column) => (
                        <td key={column} className="p-2 align-top">
                          <div className="min-h-[48px] w-full whitespace-pre-wrap rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-left text-white">
                            {financeRecord.values[column] || "-"}
                          </div>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <HistoryCard
                  label={`Yesterday • ${formatDayTitle(shiftDate(financeDate, -1))}`}
                  record={historyData.yesterday}
                />
                <HistoryCard
                  label={`7 Days Ago • ${formatDayTitle(shiftDate(financeDate, -7))}`}
                  record={historyData.weekAgo}
                />
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
              <div className="space-y-6">
                <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.34em] text-cyan-200">Members</p>
                      <h2 className="mt-2 text-2xl font-black text-white">{activeGroup?.name || "Select a group"}</h2>
                    </div>
                    {activeGroup && (
                      <button
                        onClick={() => sendMessage("group", activeGroup.key)}
                        className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/10"
                      >
                        <FaEnvelope /> Message group
                      </button>
                    )}
                  </div>

                  <div className="mt-6 grid gap-3">
                    {(activeGroup?.members || []).map((member) => (
                      <button
                        key={member.id}
                        onClick={() => setSelectedMember(member)}
                        className={`rounded-[1.4rem] border px-4 py-4 text-left transition ${
                          selectedMember?.id === member.id
                            ? "border-cyan-300/50 bg-cyan-300/10"
                            : "border-white/10 bg-slate-950/40 hover:border-white/20"
                        }`}
                      >
                        <p className="font-bold text-white">{member.full_name}</p>
                        <p className="mt-1 text-sm text-slate-300">{member.email}</p>
                        <p className="mt-1 text-sm text-slate-300">{member.whatsapp}</p>
                      </button>
                    ))}
                    {activeGroup && activeGroup.members.length === 0 && (
                      <p className="rounded-[1.4rem] border border-white/10 bg-slate-950/40 px-4 py-5 text-slate-300">
                        No members in this category yet.
                      </p>
                    )}
                  </div>
                </div>

                <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.34em] text-cyan-200">Tournament controls</p>
                      <h2 className="mt-2 text-2xl font-black text-white">Matches and restart</h2>
                    </div>
                    <button
                      onClick={restartTournament}
                      className="inline-flex items-center gap-2 rounded-full bg-rose-300 px-4 py-2 text-sm font-black text-slate-950 transition hover:bg-rose-200"
                    >
                      <FaRedo /> Restart tournament
                    </button>
                  </div>

                  <div className="mt-6 overflow-x-auto">
                    <table className="min-w-full text-left text-sm text-slate-200">
                      <thead className="text-xs uppercase tracking-[0.24em] text-cyan-100">
                        <tr>
                          <th className="pb-3">Player</th>
                          <th className="pb-3">P</th>
                          <th className="pb-3">GD</th>
                          <th className="pb-3">Pts</th>
                        </tr>
                      </thead>
                      <tbody>
                        {overview.tournament.standings.map((row) => (
                          <tr key={row.registrationId} className="border-t border-white/10">
                            <td className="py-3 font-semibold text-white">{row.name}</td>
                            <td className="py-3">{row.played}</td>
                            <td className="py-3">{row.goalDifference}</td>
                            <td className="py-3">{row.points}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {selectedMember && (
                  <div className="rounded-[2rem] border border-cyan-400/20 bg-cyan-400/5 p-6 backdrop-blur-xl">
                    <p className="text-xs font-bold uppercase tracking-[0.34em] text-cyan-200">IEP Editor</p>
                    <h2 className="mt-2 text-2xl font-black text-white">
                      IEP: {selectedMember.full_name}
                    </h2>
                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      <Field label="Assessment Status">
                        <select
                          value={selectedMember.assessment_status || "waiting"}
                          onChange={(e) => updateIep(selectedMember.id, e.target.value, selectedMember.performance_level)}
                          className="w-full rounded-[1.25rem] border border-white/12 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-cyan-300/60"
                        >
                          <option value="waiting">Waiting</option>
                          <option value="completed">Completed</option>
                        </select>
                      </Field>
                      <Field label="Performance Level (0-5)">
                        <select
                          value={selectedMember.performance_level || 0}
                          onChange={(e) => updateIep(selectedMember.id, selectedMember.assessment_status, e.target.value)}
                          className="w-full rounded-[1.25rem] border border-white/12 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-cyan-300/60"
                        >
                          {[0, 1, 2, 3, 4, 5].map((lvl) => (
                            <option key={lvl} value={lvl}>Level {lvl}</option>
                          ))}
                        </select>
                      </Field>
                    </div>
                  </div>
                )}

                <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
                  <p className="text-xs font-bold uppercase tracking-[0.34em] text-cyan-200">Composer</p>
                  <h2 className="mt-2 text-2xl font-black text-white">
                    {selectedMember ? `Message ${selectedMember.full_name}` : activeGroup ? `Message ${activeGroup.name}` : "Choose a target"}
                  </h2>
                  <div className="mt-6 grid gap-4">
                    <Field label="Subject">
                      <input
                        value={composer.subject}
                        onChange={(event) => setComposer((current) => ({ ...current, subject: event.target.value }))}
                        className="w-full rounded-[1.25rem] border border-white/12 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-cyan-300/60"
                      />
                    </Field>
                    <Field label="Message">
                      <textarea
                        rows="6"
                        value={composer.message}
                        onChange={(event) => setComposer((current) => ({ ...current, message: event.target.value }))}
                        className="w-full rounded-[1.25rem] border border-white/12 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-cyan-300/60"
                      />
                    </Field>
                    <Field label="PDF links, one per line">
                      <textarea
                        rows="4"
                        value={composer.pdfLinks}
                        onChange={(event) => setComposer((current) => ({ ...current, pdfLinks: event.target.value }))}
                        className="w-full rounded-[1.25rem] border border-white/12 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-cyan-300/60"
                      />
                    </Field>
                    <div className="flex flex-wrap gap-3">
                      {selectedMember && (
                        <button
                          onClick={() => sendMessage("user", String(selectedMember.id))}
                          className="inline-flex items-center gap-2 rounded-full bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-200"
                        >
                          <FaEnvelope /> Send to member
                        </button>
                      )}
                      {activeGroup && (
                        <button
                          onClick={() => sendMessage("group", activeGroup.key)}
                          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                        >
                          <FaUsers /> Send to group
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
                  <p className="text-xs font-bold uppercase tracking-[0.34em] text-cyan-200">Match results</p>
                  <h2 className="mt-2 text-2xl font-black text-white">Update every match result</h2>
                  <div className="mt-6 space-y-4">
                    {overview.tournament.matches.map((match) => (
                      <MatchEditor key={match.id} match={match} onSave={updateMatch} />
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

function HistoryCard({ label, record }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-300">
        {label}
      </p>
      <div className="space-y-2">
        {record.columns.map((column) => (
          <div key={column} className="flex items-start justify-between gap-3 text-sm">
            <span className="font-semibold uppercase text-slate-300">{column}</span>
            <span className="text-right text-white">{record.values[column] || "-"}</span>
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
    <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/40 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-200">
        {match.stage} round {match.round_number}
      </p>
      <p className="mt-2 font-bold text-white">
        {match.home_name} vs {match.away_name}
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <input
          value={homeScore}
          onChange={(event) => setHomeScore(event.target.value)}
          className="rounded-[1.25rem] border border-white/12 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-cyan-300/60"
          placeholder="Home"
        />
        <input
          value={awayScore}
          onChange={(event) => setAwayScore(event.target.value)}
          className="rounded-[1.25rem] border border-white/12 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-cyan-300/60"
          placeholder="Away"
        />
        <button
          onClick={() => onSave(match.id, homeScore, awayScore)}
          className="rounded-full bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-200"
        >
          Save
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-200">{label}</span>
      {children}
    </label>
  );
}

function Notice({ children }) {
  return (
    <div className="mt-4 rounded-[1.25rem] border border-rose-300/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
      {children}
    </div>
  );
}

async function fetchJson(path, adminKey, method = "GET", body) {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-admin-key": adminKey,
    },
    body,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Request failed.");
  }
  return data;
}
