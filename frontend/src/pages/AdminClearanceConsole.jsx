import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api.js";
import dayjs from "dayjs";
import { ArrowLeft, UserMinus, ShieldAlert, Cpu, HeartHandshake, Loader2, Check, X, MessageSquare, AlertCircle, FileText, Landmark } from "lucide-react";

// manager exit clearance approval dashboard
export default function AdminClearanceConsole() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // expanded exit record id
  const [expandedId, setExpandedId] = useState(null);

  // clearance status state parameters
  const [remarks, setRemarks] = useState({});

  const fetchResignations = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/resignation");
      if (res.data.success) {
        setList(res.data.list || []);
      }
    } catch (err) {
      console.error(err);
      setError("failed to retrieve resignation records list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResignations();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    setActionLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await api.patch(`/resignation/${id}/status`, { status });
      if (res.data.success) {
        setSuccess(`resignation request successfully ${status.toLowerCase() === "approved" ? "accepted" : "rejected"}`);
        fetchResignations();
      }
    } catch (err) {
      setError(err.response?.data?.message || "failed to update request status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateClearance = async (id, dept, status) => {
    setActionLoading(true);
    setError("");
    setSuccess("");

    try {
      const key = `${id}-${dept}`;
      const res = await api.patch(`/resignation/${id}/clearance`, {
        dept,
        status,
        remarks: remarks[key] || "",
      });

      if (res.data.success) {
        setSuccess(`${dept.toUpperCase()} clearance checkpoint updated successfully`);
        fetchResignations();
      }
    } catch (err) {
      setError(err.response?.data?.message || "failed to update clearance node");
    } finally {
      setActionLoading(false);
    }
  };

  const handleFinalizeExit = async (id) => {
    setActionLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await api.patch(`/resignation/${id}/finalize`);
      if (res.data.success) {
        setSuccess("exit clearance successfully finalized and account deactivated");
        fetchResignations();
      }
    } catch (err) {
      setError(err.response?.data?.message || "finalizing clearance failed");
    } finally {
      setActionLoading(false);
    }
  };

  // grouping exits
  const pendingRequests = list.filter(r => r.status === "PENDING");
  const activeClearances = list.filter(r => r.status === "APPROVED" && r.ffSettlement?.status === "UNPAID");
  const completedExits = list.filter(r => r.status === "APPROVED" && r.ffSettlement?.status === "PAID");

  return (
    <div className="flex-grow w-full bg-zinc-50 dark:bg-bg-dark-obsidian flex flex-col overflow-hidden relative select-none">
      
      {/* header title with explicit back navigation */}
      <div className="px-6 pt-4 pb-3 flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-900 bg-white dark:bg-bg-dark-card">
        <button
          onClick={() => navigate("/profile")}
          className="p-2 bg-zinc-50 dark:bg-bg-dark-obsidian border border-zinc-200 dark:border-zinc-800 rounded-lg cursor-pointer active:scale-95 transition-spring"
        >
          <ArrowLeft className="w-4 h-4 text-zinc-950 dark:text-white" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-zinc-955 dark:text-white tracking-tight">
            exit clearances console
          </h2>
          <p className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mt-0.5">
            resignation and offboarding pipeline
          </p>
        </div>
      </div>

      {success && (
        <div className="mx-6 mt-3 p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900/50 rounded-lg text-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          {success}
        </div>
      )}
      {error && (
        <div className="mx-6 mt-3 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-lg text-center text-xs font-semibold text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* exit records scrollable container */}
      <div className="flex-1 overflow-y-auto px-6 py-4 no-scrollbar flex flex-col gap-6">
        {loading ? (
          <div className="flex-1 flex items-center justify-center min-h-[200px]">
            <Loader2 className="w-7 h-7 animate-spin text-brand-primary" />
          </div>
        ) : (
          <>
            {/* section 1: decision pending resignations */}
            <div className="flex flex-col gap-3">
              <h3 className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider pl-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>resignation requests decision board ({pendingRequests.length})</span>
              </h3>
              {pendingRequests.length > 0 ? (
                pendingRequests.map((record) => {
                  const emp = record.employee || {};
                  return (
                    <div
                      key={record._id}
                      className="bg-white dark:bg-bg-dark-card border border-zinc-100 dark:border-zinc-900 rounded-xl p-4 flex flex-col gap-3 shadow-xs"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-xs font-bold text-zinc-950 dark:text-white block">
                            {emp.firstName} {emp.lastName}
                          </span>
                          <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-semibold block mt-0.5">
                            LWD: {dayjs(record.lastWorkingDay).format("DD MMM, YYYY")} • ID: {emp.employeeId}
                          </span>
                        </div>
                        <span className="text-[8px] font-bold px-2 py-0.5 rounded uppercase bg-amber-50 text-amber-600 border border-amber-100/50">
                          pending decision
                        </span>
                      </div>

                      <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium bg-zinc-50 dark:bg-bg-dark-obsidian/60 p-2.5 rounded-lg leading-relaxed">
                        <span className="text-[8px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-1">
                          resignation reason
                        </span>
                        {record.reason}
                      </div>

                      <div className="flex gap-2.5 border-t border-zinc-100 dark:border-zinc-900/60 pt-3">
                        <button
                          onClick={() => handleUpdateStatus(record._id, "REJECTED")}
                          disabled={actionLoading}
                          className="flex-1 py-2 border border-red-200 text-red-600 font-bold text-xs rounded-lg cursor-pointer active:scale-95 transition-spring"
                        >
                          Reject Exit
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(record._id, "APPROVED")}
                          disabled={actionLoading}
                          className="flex-grow flex-1 py-2 bg-brand-primary text-white font-bold text-xs rounded-lg active:scale-95 transition-spring flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          <span>Accept & Start Clearance</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="bg-white dark:bg-bg-dark-card border border-zinc-100 dark:border-zinc-900 rounded-xl p-4 text-center text-xs text-zinc-400 dark:text-zinc-650">
                  no resignation requests pending decision
                </div>
              )}
            </div>

            {/* section 2: active clearance checklist cases */}
            <div className="flex flex-col gap-3">
              <h3 className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider pl-1 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" />
                <span>active clearances pipeline ({activeClearances.length})</span>
              </h3>
              {activeClearances.length > 0 ? (
                activeClearances.map((record) => {
                  const isExpanded = expandedId === record._id;
                  const emp = record.employee || {};
                  const itClr = record.clearanceDetails?.it?.status === "CLEARED";
                  const finClr = record.clearanceDetails?.finance?.status === "CLEARED";
                  const hrClr = record.clearanceDetails?.hr?.status === "CLEARED";
                  const isAllCleared = itClr && finClr && hrClr;

                  return (
                    <div
                      key={record._id}
                      className="bg-white dark:bg-bg-dark-card border border-zinc-100 dark:border-zinc-900 rounded-xl p-4 flex flex-col gap-3 shadow-xs"
                    >
                      <div
                        className="flex items-start justify-between cursor-pointer"
                        onClick={() => setExpandedId(isExpanded ? null : record._id)}
                      >
                        <div>
                          <span className="text-xs font-bold text-zinc-955 dark:text-white block">
                            {emp.firstName} {emp.lastName}
                          </span>
                          <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-semibold block mt-0.5">
                            LWD: {dayjs(record.lastWorkingDay).format("DD MMM, YYYY")} • click to manage checklist
                          </span>
                        </div>
                        <span className="text-[8px] font-bold px-2 py-0.5 rounded uppercase bg-blue-50 text-blue-600 border border-blue-100/50">
                          clearance stage
                        </span>
                      </div>

                      {isExpanded && (
                        <div className="border-t border-zinc-100 dark:border-zinc-900/60 pt-3 mt-1 flex flex-col gap-4">
                          {/* clearance checklist grids */}
                          <div className="flex flex-col gap-3">
                            
                            {/* IT check */}
                            <div className="flex flex-col gap-2 p-2.5 bg-zinc-50 dark:bg-bg-dark-obsidian/40 border border-zinc-100 dark:border-zinc-900/60 rounded-lg">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-zinc-950 dark:text-white flex items-center gap-1.5">
                                  <Cpu className="w-3.5 h-3.5 text-zinc-400" />
                                  IT Assets Clearance
                                </span>
                                <span className={`text-[8.5px] font-extrabold uppercase ${itClr ? "text-emerald-500" : "text-zinc-400"}`}>
                                  {record.clearanceDetails?.it?.status}
                                </span>
                              </div>
                              <div className="flex flex-col gap-2 mt-1">
                                <div className="relative">
                                  <MessageSquare className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                                  <input
                                    type="text"
                                    placeholder="IT remarks (serial, devices returned)..."
                                    value={remarks[`${record._id}-it`] || record.clearanceDetails?.it?.remarks || ""}
                                    onChange={(e) => setRemarks(prev => ({ ...prev, [`${record._id}-it`]: e.target.value }))}
                                    className="w-full bg-white dark:bg-bg-dark-card border border-zinc-200 dark:border-zinc-800 rounded px-7 py-1 text-[10px] text-zinc-950 dark:text-white"
                                  />
                                </div>
                                <button
                                  onClick={() => handleUpdateClearance(record._id, "it", itClr ? "PENDING" : "CLEARED")}
                                  disabled={actionLoading}
                                  className={`py-1 text-[10px] font-bold rounded cursor-pointer ${
                                    itClr
                                      ? "border border-red-200 text-red-600"
                                      : "bg-brand-primary text-white"
                                  }`}
                                >
                                  {itClr ? "revert clearance" : "mark as cleared"}
                                </button>
                              </div>
                            </div>

                            {/* Finance check */}
                            <div className="flex flex-col gap-2 p-2.5 bg-zinc-50 dark:bg-bg-dark-obsidian/40 border border-zinc-100 dark:border-zinc-900/60 rounded-lg">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-zinc-950 dark:text-white flex items-center gap-1.5">
                                  <ShieldAlert className="w-3.5 h-3.5 text-zinc-400" />
                                  Finance Clearance
                                </span>
                                <span className={`text-[8.5px] font-extrabold uppercase ${finClr ? "text-emerald-500" : "text-zinc-400"}`}>
                                  {record.clearanceDetails?.finance?.status}
                                </span>
                              </div>
                              <div className="flex flex-col gap-2 mt-1">
                                <div className="relative">
                                  <MessageSquare className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                                  <input
                                    type="text"
                                    placeholder="Finance remarks (loans, dues settled)..."
                                    value={remarks[`${record._id}-finance`] || record.clearanceDetails?.finance?.remarks || ""}
                                    onChange={(e) => setRemarks(prev => ({ ...prev, [`${record._id}-finance`]: e.target.value }))}
                                    className="w-full bg-white dark:bg-bg-dark-card border border-zinc-200 dark:border-zinc-800 rounded px-7 py-1 text-[10px] text-zinc-950 dark:text-white"
                                  />
                                </div>
                                <button
                                  onClick={() => handleUpdateClearance(record._id, "finance", finClr ? "PENDING" : "CLEARED")}
                                  disabled={actionLoading}
                                  className={`py-1 text-[10px] font-bold rounded cursor-pointer ${
                                    finClr
                                      ? "border border-red-200 text-red-600"
                                      : "bg-brand-primary text-white"
                                  }`}
                                >
                                  {finClr ? "revert clearance" : "mark as cleared"}
                                </button>
                              </div>
                            </div>

                            {/* HR check */}
                            <div className="flex flex-col gap-2 p-2.5 bg-zinc-50 dark:bg-bg-dark-obsidian/40 border border-zinc-100 dark:border-zinc-900/60 rounded-lg">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-zinc-955 dark:text-white flex items-center gap-1.5">
                                  <HeartHandshake className="w-3.5 h-3.5 text-zinc-400" />
                                  HR Exit Interview
                                </span>
                                <span className={`text-[8.5px] font-extrabold uppercase ${hrClr ? "text-emerald-500" : "text-zinc-400"}`}>
                                  {record.clearanceDetails?.hr?.status}
                                </span>
                              </div>
                              <div className="flex flex-col gap-2 mt-1">
                                <div className="relative">
                                  <MessageSquare className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                                  <input
                                    type="text"
                                    placeholder="HR remarks (interview notes, exit complete)..."
                                    value={remarks[`${record._id}-hr`] || record.clearanceDetails?.hr?.remarks || ""}
                                    onChange={(e) => setRemarks(prev => ({ ...prev, [`${record._id}-hr`]: e.target.value }))}
                                    className="w-full bg-white dark:bg-bg-dark-card border border-zinc-200 dark:border-zinc-800 rounded px-7 py-1 text-[10px] text-zinc-955 dark:text-white"
                                  />
                                </div>
                                <button
                                  onClick={() => handleUpdateClearance(record._id, "hr", hrClr ? "PENDING" : "CLEARED")}
                                  disabled={actionLoading}
                                  className={`py-1 text-[10px] font-bold rounded cursor-pointer ${
                                    hrClr
                                      ? "border border-red-200 text-red-600"
                                      : "bg-brand-primary text-white"
                                  }`}
                                >
                                  {hrClr ? "revert clearance" : "mark as cleared"}
                                </button>
                              </div>
                            </div>

                          </div>

                          {/* F&F Settlement details panel */}
                          <div className="border-t border-zinc-100 dark:border-zinc-900/60 pt-3.5 flex flex-col gap-2 text-xs font-semibold">
                            <div className="flex justify-between font-bold text-zinc-500 dark:text-zinc-450">
                              <span>Calculated Payout:</span>
                              <span className="text-brand-primary text-sm">₹{record.ffSettlement?.netPayout?.toFixed(2)}</span>
                            </div>
                            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 bg-zinc-50 dark:bg-bg-dark-obsidian/45 p-2.5 rounded-lg border border-zinc-100 dark:border-zinc-900/60 leading-relaxed font-medium">
                              {record.ffSettlement?.calculations}
                            </p>
                          </div>

                          {/* exit final approval trigger */}
                          <button
                            onClick={() => handleFinalizeExit(record._id)}
                            disabled={actionLoading || !isAllCleared}
                            className={`w-full py-3 font-bold text-xs rounded-lg active:scale-95 transition-spring flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                              isAllCleared
                                ? "bg-brand-primary text-white hover:bg-brand-primary/95"
                                : "bg-zinc-250 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-650 cursor-not-allowed border border-zinc-200/50 dark:border-zinc-900/40"
                            }`}
                          >
                            <Check className="w-4 h-4" />
                            <span>Complete Clearance & Disburse F&F</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="bg-white dark:bg-bg-dark-card border border-zinc-100 dark:border-zinc-900 rounded-xl p-4 text-center text-xs text-zinc-400 dark:text-zinc-655">
                  no exit cases currently in clearance pipeline
                </div>
              )}
            </div>

            {/* section 3: completed exit clearances */}
            <div className="flex flex-col gap-3">
              <h3 className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider pl-1 flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5" />
                <span>finalized & settled exits ({completedExits.length})</span>
              </h3>
              {completedExits.length > 0 ? (
                completedExits.map((record) => {
                  const emp = record.employee || {};
                  return (
                    <div
                      key={record._id}
                      className="bg-white dark:bg-bg-dark-card border border-zinc-100 dark:border-zinc-900 rounded-xl p-4 flex flex-col gap-2.5 shadow-xs opacity-75 hover:opacity-100 transition-opacity"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-xs font-bold text-zinc-950 dark:text-white block">
                            {emp.firstName} {emp.lastName}
                          </span>
                          <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-semibold block mt-0.5">
                            settled payout: ₹{record.ffSettlement?.netPayout?.toFixed(2)}
                          </span>
                        </div>
                        <span className="text-[8px] font-bold px-2 py-0.5 rounded uppercase bg-emerald-50 text-emerald-600 border border-emerald-100/50">
                          completed & paid
                        </span>
                      </div>
                      <div className="text-[10px] text-zinc-400 dark:text-zinc-500 bg-zinc-50 dark:bg-bg-dark-obsidian/45 p-2 rounded border border-zinc-100 dark:border-zinc-900/60 leading-relaxed font-semibold">
                        clearance complete. exit interview logs registered. employee account permanently deactivated on {dayjs(record.ffSettlement?.paymentDate).format("DD MMM, YYYY")}.
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="bg-white dark:bg-bg-dark-card border border-zinc-100 dark:border-zinc-900 rounded-xl p-4 text-center text-xs text-zinc-400 dark:text-zinc-655">
                  no completed exit settlements logged
                </div>
              )}
            </div>
          </>
        )}
      </div>

    </div>
  );
}
