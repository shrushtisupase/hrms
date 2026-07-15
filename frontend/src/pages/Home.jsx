import React, { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore.js";
import api from "../utils/api.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { Fingerprint, Users, Clock, CalendarCheck, Loader2 } from "lucide-react";

dayjs.extend(utc);

// principal dashboard dashboard
export default function Home() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const isAdminOrHR = user?.role === "ADMIN" || user?.role === "HR";

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      // fetch today's attendance status for current employee (in UTC to avoid timezone offset alignment bugs)
      const attRes = await api.get("/attendance/my-history");
      const todayStr = dayjs().utc().format("YYYY-MM-DD");
      const todayRecord = attRes.data.history?.find(
        (r) => dayjs(r.date).utc().format("YYYY-MM-DD") === todayStr
      );
      setAttendance(todayRecord || null);

      // if admin or hr, fetch administrative dashboard stats
      if (isAdminOrHR) {
        const statsRes = await api.get("/dashboard");
        setStats(statsRes.data);
      }
    } catch (err) {
      console.error(err);
      setError("failed to load dashboard info");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCheckIn = async () => {
    setActionLoading(true);
    setError("");
    try {
      const res = await api.post("/attendance/checkin");
      if (res.data.success) {
        setAttendance(res.data.attendance);
        fetchDashboardData();
      }
    } catch (err) {
      setError(err.response?.data?.message || "check-in failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    setError("");
    try {
      const res = await api.post("/attendance/checkout");
      if (res.data.success) {
        setAttendance(res.data.attendance);
        fetchDashboardData();
      }
    } catch (err) {
      setError(err.response?.data?.message || "check-out failed");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="flex-1 w-full bg-zinc-50 dark:bg-bg-dark-obsidian flex flex-col overflow-y-auto no-scrollbar pb-6 select-none">
      {/* greeting header */}
      <div className="px-6 pt-4 pb-3 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-955 dark:text-white tracking-tight">
            hello, {user?.firstName}
          </h2>
          <p className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mt-0.5">
            {user?.designation || "employee"} • {user?.employeeId}
          </p>
        </div>
      </div>

      {error && (
        <div className="mx-6 mb-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-lg text-center text-xs font-semibold text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-zinc-950 dark:text-white" />
        </div>
      ) : (
        <div className="flex flex-col items-center px-6 gap-6">
          {/* dynamic check-in/out dial */}
          <div className="w-full flex flex-col items-center justify-center py-6 bg-white dark:bg-bg-dark-card border border-zinc-100 dark:border-zinc-900 rounded-xl shadow-xs">
            <div className="relative w-48 h-48 rounded-full flex items-center justify-center bg-zinc-50 dark:bg-bg-dark-obsidian border-4 border-zinc-100 dark:border-zinc-900 shadow-inner">
              
              {!attendance ? (
                // state: not checked in
                <button
                  onClick={handleCheckIn}
                  disabled={actionLoading}
                  className="w-[90%] h-[90%] rounded-full bg-brand-primary text-white flex flex-col items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-spring animate-soft-pulse shadow-lg shadow-brand-primary/20"
                >
                  {actionLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <Fingerprint className="w-8 h-8" />
                      <span className="text-xs font-bold uppercase tracking-wider">check in</span>
                    </>
                  )}
                </button>
              ) : !attendance.checkOut ? (
                // state: checked in, active session
                <button
                  onClick={handleCheckOut}
                  disabled={actionLoading}
                  className="w-[90%] h-[90%] rounded-full bg-white text-zinc-950 dark:bg-bg-dark-obsidian dark:text-white border-2 border-brand-primary flex flex-col items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-spring shadow-xs"
                >
                  {actionLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <Clock className="w-8 h-8 text-brand-primary" />
                      <span className="text-xs font-bold uppercase tracking-wider text-brand-primary">check out</span>
                    </>
                  )}
                </button>
              ) : (
                // state: shift completed
                <div className="w-[90%] h-[90%] rounded-full bg-zinc-50 dark:bg-bg-dark-obsidian flex flex-col items-center justify-center gap-1">
                  <Fingerprint className="w-8 h-8 text-zinc-300 dark:text-zinc-700" />
                  <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-650 uppercase tracking-widest">
                    shift done
                  </span>
                  <span className="text-xs font-extrabold text-zinc-950 dark:text-white">
                    {attendance.hoursWorked} hrs
                  </span>
                </div>
              )}
            </div>

            {/* check-in logs block */}
            <div className="mt-4 text-center">
              {attendance ? (
                <div className="flex flex-col gap-0.5 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                  <span>
                    in: {dayjs(attendance.checkIn).format("hh:mm a")}
                  </span>
                  {attendance.checkOut && (
                    <span>
                      out: {dayjs(attendance.checkOut).format("hh:mm a")}
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-xs text-zinc-400 dark:text-zinc-600 font-medium">
                  session not started today
                </span>
              )}
            </div>
          </div>          {/* metrics panels (admin/hr stats) */}
          {isAdminOrHR && stats?.stats && (
            <div className="w-full grid grid-cols-3 gap-3">
              <div className="bg-white dark:bg-bg-dark-card border border-zinc-100 dark:border-zinc-900 rounded-xl p-3 text-center">
                <Users className="w-4 h-4 text-zinc-400 dark:text-zinc-600 mx-auto mb-1" />
                <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                  headcount
                </span>
                <span className="text-lg font-bold text-zinc-950 dark:text-white">
                  {stats.stats.totalEmployees}
                </span>
              </div>
              <div className="bg-white dark:bg-bg-dark-card border border-zinc-100 dark:border-zinc-900 rounded-xl p-3 text-center">
                <CalendarCheck className="w-4 h-4 text-zinc-400 dark:text-zinc-600 mx-auto mb-1" />
                <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                  present
                </span>
                <span className="text-lg font-bold text-zinc-950 dark:text-white">
                  {stats.stats.presentToday}
                </span>
              </div>
              <div className="bg-white dark:bg-bg-dark-card border border-zinc-100 dark:border-zinc-900 rounded-xl p-3 text-center">
                <Clock className="w-4 h-4 text-zinc-400 dark:text-zinc-600 mx-auto mb-1" />
                <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                  on leave
                </span>
                <span className="text-lg font-bold text-zinc-950 dark:text-white">
                  {stats.stats.onLeaveToday}
                </span>
              </div>
            </div>
          )}

          {/* recent activity streams */}
          {isAdminOrHR && stats?.recentActivities && (
            <div className="w-full flex flex-col gap-2.5">
              <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-wider pl-1">
                active check-ins
              </h3>
              <div className="bg-white dark:bg-bg-dark-card border border-zinc-100 dark:border-zinc-900 rounded-xl divide-y divide-zinc-100 dark:divide-zinc-800 overflow-hidden">
                {stats.recentActivities.recentCheckins?.length > 0 ? (
                  stats.recentActivities.recentCheckins.map((item) => (
                    <div key={item._id} className="p-3 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-zinc-950 dark:text-white block">
                          {item.employee?.firstName} {item.employee?.lastName}
                        </span>
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                          {item.employee?.employeeId}
                        </span>
                      </div>
                      <span className="font-medium text-zinc-500 dark:text-zinc-400">
                        {dayjs(item.checkIn).format("hh:mm a")}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-zinc-400 dark:text-zinc-600 font-medium">
                    no active check-ins today
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
