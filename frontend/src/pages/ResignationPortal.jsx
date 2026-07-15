import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api.js";
import dayjs from "dayjs";
import { ArrowLeft, Send, CheckCircle2, AlertCircle, ShieldAlert, Cpu, HeartHandshake, Loader2 } from "lucide-react";

// resignation portal for employee self service
export default function ResignationPortal() {
  const navigate = useNavigate();
  const [resignation, setResignation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // form states
  const [lastWorkingDay, setLastWorkingDay] = useState("");
  const [reason, setReason] = useState("");

  const fetchResignation = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/resignation/my");
      if (res.data.success) {
        setResignation(res.data.resignation);
      }
    } catch (err) {
      console.error(err);
      setError("failed to retrieve exit application status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResignation();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!lastWorkingDay || !reason) {
      setError("please complete all date and justification fields");
      return;
    }
    setError("");
    setSuccess("");
    setSubmitLoading(true);

    try {
      const res = await api.post("/resignation", { lastWorkingDay, reason });
      if (res.data.success) {
        setSuccess("resignation application submitted successfully");
        setLastWorkingDay("");
        setReason("");
        fetchResignation();
      }
    } catch (err) {
      setError(err.response?.data?.message || "failed to submit exit application");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="flex-grow w-full bg-zinc-50 dark:bg-bg-dark-obsidian flex flex-col overflow-hidden relative select-none">
      
      {/* header title with explicit back navigation */}
      <div className="px-6 pt-4 pb-3 flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-900 bg-white dark:bg-bg-dark-card">
        <button
          onClick={() => navigate("/profile")}
          className="p-2 bg-zinc-50 dark:bg-bg-dark-obsidian border border-zinc-200 dark:border-zinc-800 rounded-lg cursor-pointer active:scale-95 transition-spring"
        >
          <ArrowLeft className="w-4 h-4 text-zinc-955 dark:text-white" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-zinc-950 dark:text-white tracking-tight">
            resignation portal
          </h2>
          <p className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mt-0.5">
            exit clearance self-service
          </p>
        </div>
      </div>

      {success && (
        <div className="mx-6 mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-lg text-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          {success}
        </div>
      )}
      {error && (
        <div className="mx-6 mt-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-lg text-center text-xs font-semibold text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* scrollable contents */}
      <div className="flex-1 overflow-y-auto px-6 py-5 no-scrollbar flex flex-col gap-6">
        {loading ? (
          <div className="flex-1 flex items-center justify-center min-h-[250px]">
            <Loader2 className="w-7 h-7 animate-spin text-brand-primary" />
          </div>
        ) : resignation ? (
          <>
            {/* status card */}
            <div className="bg-white dark:bg-bg-dark-card border border-zinc-100 dark:border-zinc-900 rounded-xl p-4.5 shadow-xs flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                    application status
                  </span>
                  <h3 className="text-sm font-extrabold text-zinc-950 dark:text-white mt-0.5">
                    Resignation Request
                  </h3>
                </div>
                <span
                  className={`text-[9px] font-bold tracking-wider px-2.5 py-1 rounded-md uppercase ${
                    resignation.status === "APPROVED"
                      ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30"
                      : resignation.status === "REJECTED"
                      ? "bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 border border-red-100 dark:border-red-900/30"
                      : "bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30"
                  }`}
                >
                  {resignation.status.toLowerCase()}
                </span>
              </div>

              <div className="text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-bg-dark-obsidian/60 p-3 rounded-lg flex flex-col gap-1.5 font-medium">
                <div>
                  <span className="text-zinc-400 dark:text-zinc-500 mr-1 font-bold">submitted:</span>
                  {dayjs(resignation.resignationDate).format("DD MMMM, YYYY")}
                </div>
                <div>
                  <span className="text-zinc-400 dark:text-zinc-500 mr-1 font-bold">last working day:</span>
                  {dayjs(resignation.lastWorkingDay).format("DD MMMM, YYYY")}
                </div>
                <div className="border-t border-zinc-200/50 dark:border-zinc-800/50 pt-1.5 mt-1">
                  <span className="text-zinc-400 dark:text-zinc-500 mr-1 font-bold block mb-1">submitted reason:</span>
                  <p className="leading-relaxed">{resignation.reason}</p>
                </div>
              </div>
            </div>

            {/* clearance checklists audit details */}
            <div className="bg-white dark:bg-bg-dark-card border border-zinc-100 dark:border-zinc-900 rounded-xl p-4.5 shadow-xs flex flex-col gap-4">
              <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-900 pb-2">
                clearance checklist status
              </h3>

              <div className="flex flex-col gap-4">
                {/* node 1: IT department */}
                <div className="flex items-start justify-between border-b border-zinc-100 dark:border-zinc-900/60 pb-3">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-zinc-50 dark:bg-bg-dark-obsidian border border-zinc-150 dark:border-zinc-800 flex items-center justify-center text-zinc-500">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-zinc-950 dark:text-white block">
                        IT Assets Clearance
                      </span>
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">
                        {resignation.clearanceDetails?.it?.remarks || "no clearance remarks logged"}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-[8px] font-bold px-2 py-0.5 rounded uppercase ${
                      resignation.clearanceDetails?.it?.status === "CLEARED"
                        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20"
                        : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800"
                    }`}
                  >
                    {resignation.clearanceDetails?.it?.status.toLowerCase()}
                  </span>
                </div>

                {/* node 2: Finance department */}
                <div className="flex items-start justify-between border-b border-zinc-100 dark:border-zinc-900/60 pb-3">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-zinc-50 dark:bg-bg-dark-obsidian border border-zinc-150 dark:border-zinc-800 flex items-center justify-center text-zinc-500">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-zinc-950 dark:text-white block">
                        Finance & Accounts Clearance
                      </span>
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">
                        {resignation.clearanceDetails?.finance?.remarks || "no clearance remarks logged"}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-[8px] font-bold px-2 py-0.5 rounded uppercase ${
                      resignation.clearanceDetails?.finance?.status === "CLEARED"
                        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20"
                        : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800"
                    }`}
                  >
                    {resignation.clearanceDetails?.finance?.status.toLowerCase()}
                  </span>
                </div>

                {/* node 3: HR department */}
                <div className="flex items-start justify-between">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-zinc-50 dark:bg-bg-dark-obsidian border border-zinc-150 dark:border-zinc-800 flex items-center justify-center text-zinc-500">
                      <HeartHandshake className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-zinc-950 dark:text-white block">
                        HR Exit Interview clearance
                      </span>
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">
                        {resignation.clearanceDetails?.hr?.remarks || "no clearance remarks logged"}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-[8px] font-bold px-2 py-0.5 rounded uppercase ${
                      resignation.clearanceDetails?.hr?.status === "CLEARED"
                        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20"
                        : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800"
                    }`}
                  >
                    {resignation.clearanceDetails?.hr?.status.toLowerCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* full and final settlement audit cards */}
            <div className="bg-white dark:bg-bg-dark-card border border-zinc-100 dark:border-zinc-900 rounded-xl p-4.5 shadow-xs flex flex-col gap-4">
              <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-900 pb-2">
                full & final settlement
              </h3>

              <div className="flex flex-col gap-3 font-semibold text-xs">
                <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-900/60 pb-2">
                  <span className="text-zinc-400 dark:text-zinc-500">F&F status:</span>
                  <span className="text-zinc-950 dark:text-white uppercase font-bold">
                    {resignation.ffSettlement?.status || "pending clearance"}
                  </span>
                </div>
                <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-900/60 pb-2">
                  <span className="text-zinc-400 dark:text-zinc-500">net final payout:</span>
                  <span className="text-brand-primary font-bold text-sm">
                    ₹{resignation.ffSettlement?.netPayout?.toFixed(2) || "0.00"}
                  </span>
                </div>
                <div className="bg-zinc-50 dark:bg-bg-dark-obsidian/60 p-3 rounded-lg text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 font-medium leading-relaxed">
                  <span className="font-bold text-zinc-400 dark:text-zinc-500 uppercase block mb-1">payout breakdowns:</span>
                  {resignation.ffSettlement?.calculations || "awaiting clearance calculations"}
                </div>
              </div>
            </div>
          </>
        ) : (
          /* submission form when no resignation submitted */
          <div className="bg-white dark:bg-bg-dark-card border border-zinc-100 dark:border-zinc-900 rounded-xl p-5 shadow-xs flex flex-col gap-4">
            <div className="text-center p-3">
              <AlertCircle className="w-7 h-7 text-amber-500 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-zinc-950 dark:text-white">
                initiate exit offboarding
              </h3>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold mt-1">
                please complete the details below to initiate resignation clearance.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 border-t border-zinc-100 dark:border-zinc-900 pt-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider pl-1">
                  last working day *
                </label>
                <input
                  type="date"
                  required
                  value={lastWorkingDay}
                  onChange={(e) => setLastWorkingDay(e.target.value)}
                  className="bg-zinc-50 dark:bg-bg-dark-obsidian border border-zinc-200 dark:border-zinc-800 rounded-lg px-3.5 py-2.5 text-xs text-zinc-950 dark:text-white"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider pl-1">
                  reason for resignation *
                </label>
                <textarea
                  rows="4"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="briefly explain your reason for leaving..."
                  className="bg-zinc-50 dark:bg-bg-dark-obsidian border border-zinc-200 dark:border-zinc-800 rounded-lg px-3.5 py-3 text-xs text-zinc-950 dark:text-white transition-all placeholder-zinc-300 dark:placeholder-zinc-700 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitLoading}
                className="py-3 bg-brand-primary text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-spring shadow-xs"
              >
                {submitLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>submit resignation request</span>
              </button>
            </form>
          </div>
        )}
      </div>

    </div>
  );
}
