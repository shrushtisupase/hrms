import React, { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore.js";
import api from "../utils/api.js";
import dayjs from "dayjs";
import { Calendar, Search, SlidersHorizontal, Loader2 } from "lucide-react";

// logs list screen
export default function Attendance() {
  const { user } = useAuthStore();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState("my"); // my or staff
  const [searchEmail, setSearchEmail] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");

  const isAdminOrHR = user?.role === "ADMIN" || user?.role === "HR";

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError("");
      
      let res;
      if (viewType === "my") {
        res = await api.get("/attendance/my-history", {
          params: { startDate, endDate },
        });
        setHistory(res.data.history || []);
      } else {
        res = await api.get("/attendance/report", {
          params: { startDate, endDate },
        });
        
        let filtered = res.data.records || [];
        if (searchEmail) {
          filtered = filtered.filter((r) =>
            r.employee?.email.toLowerCase().includes(searchEmail.toLowerCase())
          );
        }
        setHistory(filtered);
      }
    } catch (err) {
      console.error(err);
      setError("failed to load attendance logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [viewType, startDate, endDate, searchEmail]);

  return (
    <div className="flex-1 w-full bg-zinc-50 dark:bg-bg-dark-obsidian flex flex-col overflow-hidden select-none">
      {/* header title */}
      <div className="px-6 pt-4 pb-3 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-950 dark:text-white tracking-tight">
            attendance log
          </h2>
          <p className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mt-0.5">
            system check-ins / outs
          </p>
        </div>
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
              my check-ins
            </button>
            <button
              onClick={() => setViewType("staff")}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                viewType === "staff"
                  ? "bg-brand-primary text-white shadow-sm"
                  : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-955 dark:hover:text-zinc-300"
              }`}
            >
              staff directory
            </button>
          </div>
        </div>
      )}

      {/* filters container */}
      <div className="px-6 mb-4 flex flex-col gap-2">
        {viewType === "staff" && (
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-600" />
            <input
              type="text"
              placeholder="search by staff email..."
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              className="w-full bg-white dark:bg-bg-dark-card border border-zinc-100 dark:border-zinc-900 rounded-lg pl-10 pr-4 py-2.5 text-xs text-zinc-950 dark:text-white transition-all placeholder-zinc-350 dark:placeholder-zinc-700"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-wider pl-1">
              start date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-white dark:bg-bg-dark-card border border-zinc-100 dark:border-zinc-900 rounded-lg px-3 py-2 text-xs text-zinc-950 dark:text-white"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-wider pl-1">
              end date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-white dark:bg-bg-dark-card border border-zinc-100 dark:border-zinc-900 rounded-lg px-3 py-2 text-xs text-zinc-950 dark:text-white"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="mx-6 mb-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-lg text-center text-xs font-semibold text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* logs list container */}
      <div className="flex-1 overflow-y-auto px-6 pb-4 no-scrollbar flex flex-col gap-3">
        {loading ? (
          <div className="flex-grow flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-zinc-950 dark:text-white" />
          </div>
        ) : history.length > 0 ? (
          history.map((record) => (
            <div
              key={record._id}
              className="bg-white dark:bg-bg-dark-card border border-zinc-100 dark:border-zinc-900 rounded-xl p-4 flex items-center justify-between shadow-sm"
            >
              <div>
                <span className="text-xs font-bold text-zinc-950 dark:text-white block">
                  {record.employee && typeof record.employee === "object"
                    ? `${record.employee.firstName} ${record.employee.lastName}`
                    : dayjs(record.date).utc().format("MMMM DD, YYYY")}
                </span>
                <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">
                  {record.employee && typeof record.employee === "object"
                    ? dayjs(record.date).utc().format("MMMM DD, YYYY")
                    : `${record.hoursWorked || 0} hrs worked`}
                </span>
                <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 flex items-center gap-1 mt-1">
                  in: {record.checkIn ? dayjs(record.checkIn).format("hh:mm A") : "--"} • out:{" "}
                  {record.checkOut ? dayjs(record.checkOut).format("hh:mm A") : "--"}
                </span>
              </div>

              <div className="flex flex-col items-end gap-1.5">
                <span
                  className={`text-[8px] font-bold tracking-widest px-2 py-0.5 rounded-full uppercase ${
                    record.status === "PRESENT"
                      ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950"
                      : record.status === "HALF_DAY"
                      ? "border border-zinc-200 text-zinc-600 dark:border-zinc-800 dark:text-zinc-400"
                      : "bg-zinc-100 text-zinc-400 dark:bg-zinc-950 dark:text-zinc-600"
                  }`}
                >
                  {record.status.toLowerCase()}
                </span>
                {record.employee && typeof record.employee === "object" && (
                  <span className="text-xs font-bold text-zinc-950 dark:text-white">
                    {record.hoursWorked || 0} hrs
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <Calendar className="w-8 h-8 text-zinc-300 dark:text-zinc-800 mb-2" />
            <p className="text-xs text-zinc-400 dark:text-zinc-600 font-medium">
              no attendance records found
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
