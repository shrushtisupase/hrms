import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api.js";
import { ArrowLeft, Users, Clock, AlertTriangle, UserMinus, Banknote, Calendar, Loader2 } from "lucide-react";

// admin console analytics overview
export default function AdminAnalyticsDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/dashboard");
      if (res.data.success) {
        setStats(res.data.stats || {});
        setTrends(res.data.payrollTrends || []);
      }
    } catch (err) {
      console.error(err);
      setError("failed to retrieve analytics dataset");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // calculations helper for presence bar charts
  const total = stats?.totalEmployees || 0;
  const getPercent = (val) => (total > 0 ? Math.round((val / total) * 100) : 0);

  // find max value in payroll history for trend bar calculation
  const maxPayout = trends.length > 0 ? Math.max(...trends.map(t => t.totalPayout)) : 1;

  return (
    <div className="flex-grow w-full bg-zinc-50 dark:bg-bg-dark-obsidian flex flex-col overflow-hidden relative select-none">
      
      {/* header title with explicit back navigation */}
      <div className="px-6 pt-4 pb-3 flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-900 bg-white dark:bg-bg-dark-card">
        <button
          onClick={() => navigate("/admin")}
          className="p-2 bg-zinc-50 dark:bg-bg-dark-obsidian border border-zinc-200 dark:border-zinc-800 rounded-lg cursor-pointer active:scale-95 transition-spring"
        >
          <ArrowLeft className="w-4 h-4 text-zinc-950 dark:text-white" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-zinc-955 dark:text-white tracking-tight">
            organization analytics
          </h2>
          <p className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mt-0.5">
            workforce business metrics
          </p>
        </div>
      </div>

      {error && (
        <div className="mx-6 mt-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-lg text-center text-xs font-semibold text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* dashboard scrolling elements */}
      <div className="flex-1 overflow-y-auto px-6 py-5 no-scrollbar flex flex-col gap-6">
        {loading ? (
          <div className="flex-1 flex items-center justify-center min-h-[300px]">
            <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
          </div>
        ) : (
          <>
            {/* stats overview layout grid */}
            <div className="grid grid-cols-2 gap-3.5">
              
              {/* card 1: total active headcount */}
              <div className="bg-white dark:bg-bg-dark-card border border-zinc-100 dark:border-zinc-900 rounded-xl p-3.5 shadow-xs flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Users className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                    headcount
                  </span>
                  <span className="text-base font-extrabold text-zinc-950 dark:text-white">
                    {stats?.totalEmployees}
                  </span>
                </div>
              </div>

              {/* card 2: active presence */}
              <div className="bg-white dark:bg-bg-dark-card border border-zinc-100 dark:border-zinc-900 rounded-xl p-3.5 shadow-xs flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Clock className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                    present today
                  </span>
                  <span className="text-base font-extrabold text-zinc-950 dark:text-white">
                    {stats?.presentToday}
                  </span>
                </div>
              </div>

              {/* card 3: exit clearances */}
              <div className="bg-white dark:bg-bg-dark-card border border-zinc-100 dark:border-zinc-900 rounded-xl p-3.5 shadow-xs flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-rose-50 dark:bg-rose-950/20 flex items-center justify-center text-rose-600 dark:text-rose-400">
                  <UserMinus className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                    exits pending
                  </span>
                  <span className="text-base font-extrabold text-zinc-950 dark:text-white">
                    {stats?.pendingClearanceCount}
                  </span>
                </div>
              </div>

              {/* card 4: current monthly payroll */}
              <div className="bg-white dark:bg-bg-dark-card border border-zinc-100 dark:border-zinc-900 rounded-xl p-3.5 shadow-xs flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <Banknote className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                    payroll run
                  </span>
                  <span className="text-base font-extrabold text-zinc-950 dark:text-white">
                    ₹{stats?.monthlyPayrollExpenditure?.toFixed(0)}
                  </span>
                </div>
              </div>

            </div>

            {/* real-time attendance distribution metrics */}
            <div className="bg-white dark:bg-bg-dark-card border border-zinc-100 dark:border-zinc-900 rounded-xl p-4.5 shadow-xs flex flex-col gap-4">
              <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-900 pb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                <span>attendance distribution (today)</span>
              </h3>

              <div className="flex flex-col gap-3.5">
                {/* present today line */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    <span>present today ({stats?.presentToday})</span>
                    <span>{getPercent(stats?.presentToday)}%</span>
                  </div>
                  <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${getPercent(stats?.presentToday)}%` }}
                    />
                  </div>
                </div>

                {/* late checks today line */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    <span>late arrivals today ({stats?.lateToday})</span>
                    <span>{getPercent(stats?.lateToday)}%</span>
                  </div>
                  <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-primary rounded-full transition-all duration-500"
                      style={{ width: `${getPercent(stats?.lateToday)}%` }}
                    />
                  </div>
                </div>

                {/* early checkout lines */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    <span>early exits today ({stats?.earlyExitToday})</span>
                    <span>{getPercent(stats?.earlyExitToday)}%</span>
                  </div>
                  <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-400 rounded-full transition-all duration-500"
                      style={{ width: `${getPercent(stats?.earlyExitToday)}%` }}
                    />
                  </div>
                </div>

                {/* absent today line */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    <span>absent today ({stats?.absentToday})</span>
                    <span>{getPercent(stats?.absentToday)}%</span>
                  </div>
                  <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-400 rounded-full transition-all duration-500"
                      style={{ width: `${getPercent(stats?.absentToday)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* payroll historical trends chart list */}
            <div className="bg-white dark:bg-bg-dark-card border border-zinc-100 dark:border-zinc-900 rounded-xl p-4.5 shadow-xs flex flex-col gap-4">
              <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-900 pb-2 flex items-center gap-1.5">
                <Banknote className="w-3.5 h-3.5 text-zinc-400" />
                <span>monthly payroll expenditure curves</span>
              </h3>

              <div className="flex flex-col gap-3">
                {trends.length > 0 ? (
                  trends.map((t, idx) => {
                    const pct = Math.max(10, Math.round((t.totalPayout / maxPayout) * 100));
                    return (
                      <div key={idx} className="flex items-center gap-3">
                        <span className="w-16 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase">
                          M{t._id.month}/{t._id.year}
                        </span>
                        <div className="flex-1 h-5 bg-zinc-100 dark:bg-zinc-800 rounded overflow-hidden relative flex items-center pl-2">
                          <div
                            className="absolute left-0 top-0 bottom-0 bg-brand-primary/15 border-r-2 border-brand-primary transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                          <span className="text-[10px] font-bold text-zinc-950 dark:text-white z-10">
                            ₹{t.totalPayout.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-4 text-xs text-zinc-400 dark:text-zinc-650 font-medium">
                    no payroll runs calculated yet
                  </div>
                )}
              </div>
            </div>

            {/* exit and offboarding clearances logs */}
            <div className="bg-white dark:bg-bg-dark-card border border-zinc-100 dark:border-zinc-900 rounded-xl p-4.5 shadow-xs flex flex-col gap-4">
              <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-900 pb-2 flex items-center gap-1.5">
                <UserMinus className="w-3.5 h-3.5 text-zinc-400" />
                <span>offboarding clearance audits</span>
              </h3>

              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="bg-zinc-50 dark:bg-bg-dark-obsidian border border-zinc-100 dark:border-zinc-900 rounded-lg p-3">
                  <span className="text-[18px] font-black text-zinc-950 dark:text-white block">
                    {stats?.resignationCount || 0}
                  </span>
                  <span className="text-[8px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mt-0.5">
                    total exits
                  </span>
                </div>
                <div className="bg-zinc-50 dark:bg-bg-dark-obsidian border border-zinc-100 dark:border-zinc-900 rounded-lg p-3">
                  <span className="text-[18px] font-black text-amber-500 block">
                    {stats?.pendingClearanceCount || 0}
                  </span>
                  <span className="text-[8px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mt-0.5">
                    pending
                  </span>
                </div>
                <div className="bg-zinc-50 dark:bg-bg-dark-obsidian border border-zinc-100 dark:border-zinc-900 rounded-lg p-3">
                  <span className="text-[18px] font-black text-emerald-500 block">
                    {stats?.completedClearanceCount || 0}
                  </span>
                  <span className="text-[8px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mt-0.5">
                    cleared
                  </span>
                </div>
              </div>

              <button
                onClick={() => navigate("/admin/clearance")}
                className="py-3 bg-brand-primary hover:bg-brand-primary/95 text-white font-bold text-xs rounded-lg active:scale-95 transition-spring tracking-wider uppercase"
              >
                manage clearances
              </button>
            </div>

          </>
        )}
      </div>

    </div>
  );
}
