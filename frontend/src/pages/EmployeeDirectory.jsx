import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api.js";
import { Search, Building2, Users, ArrowRight, Loader2 } from "lucide-react";

// dedicated staff directory view for admin and hr
export default function EmployeeDirectory() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // query filters state
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [empRes, deptRes] = await Promise.all([
        api.get("/employees"),
        api.get("/departments"),
      ]);

      setEmployees(empRes.data.employees || []);
      setDepartments(deptRes.data.departments || []);
    } catch (err) {
      console.error(err);
      setError("failed to retrieve directory information");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // filtering logic
  const filteredEmployees = employees.filter((emp) => {
    const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
    const email = emp.email.toLowerCase();
    const query = search.toLowerCase();
    const matchesSearch = fullName.includes(query) || email.includes(query);

    const matchesDept = deptFilter === "" || emp.department?._id === deptFilter;

    return matchesSearch && matchesDept;
  });

  const totalHeadcount = employees.length;
  const activeCount = employees.filter((e) => e.isActive).length;

  return (
    <div className="flex-1 w-full bg-zinc-50 dark:bg-bg-dark-obsidian flex flex-col overflow-hidden select-none">
      {/* header title */}
      <div className="px-6 pt-4 pb-3 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-950 dark:text-white tracking-tight">
            staff directory
          </h2>
          <p className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mt-0.5">
            organization roster
          </p>
        </div>
      </div>

      {error && (
        <div className="mx-6 mb-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-lg text-center text-xs font-semibold text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* metrics dashboard */}
      <div className="px-6 mb-4 grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-bg-dark-card border border-zinc-100 dark:border-zinc-900 rounded-xl p-3.5 flex items-center gap-3 shadow-xs">
          <div className="p-2 bg-brand-primary-light text-brand-primary dark:bg-brand-primary-dark/20 dark:text-brand-primary rounded-lg">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
              headcount
            </span>
            <span className="text-lg font-bold text-zinc-955 dark:text-white">
              {totalHeadcount}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-bg-dark-card border border-zinc-100 dark:border-zinc-900 rounded-xl p-3.5 flex items-center gap-3 shadow-xs">
          <div className="p-2 bg-brand-primary-light text-brand-primary dark:bg-brand-primary-dark/20 dark:text-brand-primary rounded-lg">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
              active staff
            </span>
            <span className="text-lg font-bold text-zinc-955 dark:text-white">
              {activeCount}
            </span>
          </div>
        </div>
      </div>

      {/* search and filters block */}
      <div className="px-6 mb-4 flex flex-col gap-2.5">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-650" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="search by name or email address..."
            className="w-full bg-white dark:bg-bg-dark-card border border-zinc-100 dark:border-zinc-900 rounded-lg pl-10 pr-4 py-2.5 text-xs text-zinc-950 dark:text-white transition-all placeholder-zinc-300 dark:placeholder-zinc-700"
          />
        </div>

        <div>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="w-full bg-white dark:bg-bg-dark-card border border-zinc-100 dark:border-zinc-900 rounded-lg px-3.5 py-2.5 text-xs text-zinc-950 dark:text-white"
          >
            <option value="">all departments</option>
            {departments.map((dept) => (
              <option key={dept._id} value={dept._id}>
                {dept.name.toLowerCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* employee grid container */}
      <div className="flex-1 overflow-y-auto px-6 pb-4 no-scrollbar flex flex-col gap-3">
        {loading && !employees.length ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-zinc-950 dark:text-white" />
          </div>
        ) : filteredEmployees.length > 0 ? (
          filteredEmployees.map((emp) => (
            <div
              key={emp._id}
              onClick={() => navigate(`/employees/${emp._id}`)}
              className="bg-white dark:bg-bg-dark-card border border-zinc-100 dark:border-zinc-900 rounded-xl p-4 flex items-center justify-between shadow-xs hover:border-brand-primary/30 dark:hover:border-brand-primary/30 transition-all cursor-pointer group"
            >
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-zinc-955 dark:text-white truncate">
                    {emp.firstName} {emp.lastName}
                  </span>
                  {!emp.isActive && (
                    <span className="text-[8px] font-bold tracking-widest bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 px-1.5 py-0.5 rounded-full uppercase">
                      inactive
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium block mt-0.5">
                  ID: {emp.employeeId} • {emp.designation || "unassigned role"}
                </span>
                <span className="text-[9px] text-zinc-300 dark:text-zinc-600 block mt-1 truncate">
                  {emp.email}
                </span>
              </div>

              <div className="p-2 bg-zinc-50 dark:bg-zinc-950 rounded-lg text-zinc-400 group-hover:text-brand-primary dark:group-hover:text-brand-primary group-hover:translate-x-0.5 transition-all">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          ))
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <Users className="w-8 h-8 text-zinc-300 dark:text-zinc-800 mb-2" />
            <p className="text-xs text-zinc-400 dark:text-zinc-650 font-medium">
              no matching employee files found
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
