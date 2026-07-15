import React, { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore.js";
import api from "../utils/api.js";
import dayjs from "dayjs";
import { Calendar, Plus, Check, X, Loader2, MessageSquare, AlertTriangle } from "lucide-react";

// leave manager portal
export default function Leaves() {
  const { user } = useAuthStore();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [viewType, setViewType] = useState("my"); // my or staff
  const [showApplyModal, setShowApplyModal] = useState(false);

  // form states
  const [leaveType, setLeaveType] = useState("SICK");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  // approval remarks states
  const [remarks, setRemarks] = useState({});

  const isAdminOrHR = user?.role === "ADMIN" || user?.role === "HR";

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      setError("");
      let res;
      if (isAdminOrHR) {
        res = await api.get("/leaves");
      } else {
        res = await api.get("/leaves/my-history");
      }
      setLeaves(res.data.leaves || []);
    } catch (err) {
      console.error(err);
      setError("failed to retrieve leave history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason) {
      setError("please complete all date and explanation fields");
      return;
    }

    setActionLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await api.post("/leaves", {
        leaveType,
        startDate,
        endDate,
        reason,
      });

      if (res.data.success) {
        setSuccess("leave request submitted successfully");
        setStartDate("");
        setEndDate("");
        setReason("");
        setShowApplyModal(false);
        fetchLeaves();
      }
    } catch (err) {
      setError(err.response?.data?.message || "failed to submit application");
    } finally {
      setActionLoading(false);
    }
  };

  const handleProcessLeave = async (id, status) => {
    setActionLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await api.patch(`/leaves/${id}/approve`, {
        status,
        remarks: remarks[id] || "",
      });

      if (res.data.success) {
        setSuccess(`leave request has been ${status.toLowerCase()}`);
        fetchLeaves();
      }
    } catch (err) {
      setError(err.response?.data?.message || "approval processing failed");
    } finally {
      setActionLoading(false);
    }
  };

  const myLeaves = isAdminOrHR
    ? leaves.filter((l) => (typeof l.employee === "object" ? l.employee?._id : l.employee) === user?.id)
    : leaves;
  const staffLeaves = isAdminOrHR
    ? leaves.filter((l) => (typeof l.employee === "object" ? l.employee?._id : l.employee) !== user?.id)
    : [];

  const getLeaveBalances = (targetUserId) => {
    const userApprovedLeaves = leaves.filter(
      (l) => {
        const empId = typeof l.employee === "object" ? l.employee?._id : l.employee;
        return String(empId) === String(targetUserId) && l.status === "APPROVED";
      }
    );

    const sickUsed = userApprovedLeaves
      .filter((l) => l.leaveType === "SICK")
      .reduce((sum, l) => sum + (l.days || 0), 0);

    const casualUsed = userApprovedLeaves
      .filter((l) => l.leaveType === "CASUAL")
      .reduce((sum, l) => sum + (l.days || 0), 0);

    const annualUsed = userApprovedLeaves
      .filter((l) => l.leaveType === "ANNUAL")
      .reduce((sum, l) => sum + (l.days || 0), 0);

    return {
      sick: Math.max(0, 12 - sickUsed),
      casual: Math.max(0, 10 - casualUsed),
      annual: Math.max(0, 15 - annualUsed),
    };
  };

  const myBalances = getLeaveBalances(user?.id);

  return (
    <div className="flex-grow w-full bg-zinc-50 dark:bg-bg-dark-obsidian flex flex-col overflow-hidden relative select-none">
      {/* header title */}
      <div className="px-6 pt-4 pb-3 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-950 dark:text-white tracking-tight">
            leaves manager
          </h2>
          <p className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mt-0.5">
            absence ledger
          </p>
        </div>

        {/* apply button visible only when viewing self tab */}
        {viewType === "my" && (
          <button
            onClick={() => setShowApplyModal(true)}
            className="p-2.5 bg-brand-primary text-white rounded-lg cursor-pointer active:scale-95 transition-spring shadow-xs"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* role toggle */}
      {isAdminOrHR && (
        <div className="px-6 mb-4">
          <div className="flex bg-zinc-100 dark:bg-bg-dark-card p-1 rounded-lg">
            <button
              onClick={() => setViewType("my")}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                viewType === "my"
                  ? "bg-brand-primary text-white shadow-sm"
                  : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-300"
              }`}
            >
              my leaves
            </button>
            <button
              onClick={() => setViewType("staff")}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                viewType === "staff"
                  ? "bg-brand-primary text-white shadow-sm"
                  : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-955 dark:hover:text-zinc-300"
              }`}
            >
              review staff
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="mx-6 mb-3 p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-lg text-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          {success}
        </div>
      )}



      {/* scrollable requests logs list */}
      <div className="flex-1 overflow-y-auto px-6 pb-4 no-scrollbar flex flex-col gap-3">
        {viewType === "my" && !loading && (
          <div className="grid grid-cols-3 gap-2.5 mb-1.5 shrink-0">
            <div className="bg-white dark:bg-bg-dark-card border border-zinc-100 dark:border-zinc-900 rounded-xl p-3 text-center shadow-xs">
              <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                casual leaves
              </span>
              <span className="text-sm font-extrabold text-zinc-950 dark:text-white mt-1 block">
                {myBalances.casual} / 10
              </span>
            </div>
            <div className="bg-white dark:bg-bg-dark-card border border-zinc-100 dark:border-zinc-900 rounded-xl p-3 text-center shadow-xs">
              <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                sick leaves
              </span>
              <span className="text-sm font-extrabold text-zinc-950 dark:text-white mt-1 block">
                {myBalances.sick} / 12
              </span>
            </div>
            <div className="bg-white dark:bg-bg-dark-card border border-zinc-100 dark:border-zinc-900 rounded-xl p-3 text-center shadow-xs">
              <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                annual leaves
              </span>
              <span className="text-sm font-extrabold text-zinc-950 dark:text-white mt-1 block">
                {myBalances.annual} / 15
              </span>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex-grow flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-zinc-950 dark:text-white" />
          </div>
        ) : (viewType === "my" ? myLeaves : staffLeaves).length > 0 ? (
          (viewType === "my" ? myLeaves : staffLeaves).map((record) => (
            <div
              key={record._id}
              className="bg-white dark:bg-bg-dark-card border border-zinc-100 dark:border-zinc-900 rounded-xl p-4 flex flex-col gap-3.5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold text-zinc-950 dark:text-white block">
                    {viewType === "staff" && record.employee
                      ? `${record.employee.firstName} ${record.employee.lastName}`
                      : `${record.leaveType} LEAVE`}
                  </span>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold block mt-0.5">
                    {dayjs(record.startDate).utc().format("DD MMM")} -{" "}
                    {dayjs(record.endDate).utc().format("DD MMM, YYYY")} • {record.totalDays} day(s)
                  </span>
                </div>
                <span
                  className={`text-[8px] font-bold tracking-wider px-2 py-0.5 rounded-md uppercase ${
                    record.status === "APPROVED"
                      ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30"
                      : record.status === "REJECTED"
                      ? "bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 border border-red-100 dark:border-red-900/30"
                      : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700"
                  }`}
                >
                  {record.status.toLowerCase()}
                </span>
              </div>

              {viewType === "staff" && record.employee && (
                <div className="text-[9.5px] font-bold text-zinc-400 dark:text-zinc-500 bg-zinc-50/50 dark:bg-bg-dark-obsidian/45 p-2 rounded-lg border border-zinc-100 dark:border-zinc-900/60 flex items-center justify-around">
                  <span className="uppercase text-[8.5px] tracking-wider text-zinc-500 dark:text-zinc-400">balance:</span>
                  <span>sick: {getLeaveBalances(record.employee?._id || record.employee).sick}/12</span>
                  <span>casual: {getLeaveBalances(record.employee?._id || record.employee).casual}/10</span>
                  <span>annual: {getLeaveBalances(record.employee?._id || record.employee).annual}/15</span>
                </div>
              )}

              {/* reason details */}
              <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium bg-zinc-50 dark:bg-bg-dark-obsidian/60 p-2.5 rounded-lg">
                <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide block mb-0.5">
                  reason details
                </span>
                {record.reason}
              </div>

              {/* manager comments note (if approved/rejected) */}
              {record.remarks && (
                <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium border-l-2 border-zinc-350 pl-2.5 mt-1">
                  <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide block mb-0.5">
                    manager remarks
                  </span>
                  {record.remarks}
                </div>
              )}

              {/* action console processing block (only for staff, pending status, manager role) */}
              {viewType === "staff" && record.status === "PENDING" && (
                <div className="flex flex-col gap-2.5 mt-1 border-t border-zinc-100 dark:border-zinc-900 pt-3">
                  <div className="relative">
                    <MessageSquare className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="write approval/rejection remarks..."
                      value={remarks[record._id] || ""}
                      onChange={(e) =>
                        setRemarks((prev) => ({ ...prev, [record._id]: e.target.value }))
                      }
                      className="w-full bg-zinc-50 dark:bg-bg-dark-obsidian border border-zinc-150 dark:border-zinc-800 rounded px-8 py-1.5 text-xs text-zinc-950 dark:text-white"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleProcessLeave(record._id, "REJECTED")}
                      disabled={actionLoading}
                      className="flex-1 py-1.5 border border-red-200 text-red-600 dark:border-red-950/40 dark:text-red-400 font-bold text-[10px] rounded flex items-center justify-center gap-1 cursor-pointer active:scale-95 transition-spring"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>reject</span>
                    </button>
                    <button
                      onClick={() => handleProcessLeave(record._id, "APPROVED")}
                      disabled={actionLoading}
                      className="flex-grow flex-1 py-1.5 bg-brand-primary text-white font-bold text-[10px] rounded flex items-center justify-center gap-1 cursor-pointer active:scale-95 transition-spring shadow-xs hover:bg-brand-primary/95"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>approve</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <AlertTriangle className="w-8 h-8 text-red-500 mb-2 animate-bounce" />
            <p className="text-xs text-red-500 font-bold">
              failed to retrieve leave history
            </p>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-600 font-medium mt-1">
              please verify your network connection or try again.
            </span>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <Calendar className="w-8 h-8 text-zinc-300 dark:text-zinc-800 mb-2" />
            <p className="text-xs text-zinc-400 dark:text-zinc-650 font-medium">
              no leave requests available
            </p>
          </div>
        )}
      </div>

      {/* apply request modal overlay */}
      {showApplyModal && (
        <div className="absolute inset-0 bg-zinc-950/50 backdrop-blur-xs z-50 flex items-end justify-center">
          <div className="w-full bg-white dark:bg-bg-dark-card border-t border-zinc-100 dark:border-zinc-900 rounded-t-xl p-6 shadow-2xl flex flex-col gap-4 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-2">
              <h3 className="text-sm font-bold text-zinc-950 dark:text-white uppercase tracking-wider">
                apply for leave
              </h3>
              <button
                onClick={() => setShowApplyModal(false)}
                className="p-1 text-zinc-400 hover:text-zinc-950 dark:hover:text-white rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyLeave} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider pl-1">
                  category
                </label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-bg-dark-obsidian border border-zinc-100 dark:border-zinc-900 rounded-lg px-3 py-2.5 text-xs text-zinc-955 dark:text-white"
                >
                  <option value="SICK">sick leave</option>
                  <option value="CASUAL">casual leave</option>
                  <option value="ANNUAL">annual vacation</option>
                  <option value="UNPAID">unpaid absence</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider pl-1">
                    start date
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-bg-dark-obsidian border border-zinc-100 dark:border-zinc-900 rounded-lg px-3 py-2 text-xs text-zinc-950 dark:text-white"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider pl-1">
                    end date
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-bg-dark-obsidian border border-zinc-100 dark:border-zinc-900 rounded-lg px-3 py-2 text-xs text-zinc-955 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider pl-1">
                  reason / explanation
                </label>
                <textarea
                  rows="3"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="briefly explain your absence reason..."
                  className="w-full bg-zinc-50 dark:bg-bg-dark-obsidian border border-zinc-100 dark:border-zinc-900 rounded-lg px-4 py-3 text-xs text-zinc-950 dark:text-white transition-all placeholder-zinc-300 dark:placeholder-zinc-700 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="py-3 bg-brand-primary text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-spring shadow-xs hover:bg-brand-primary/95 mt-2"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span>submit application</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
