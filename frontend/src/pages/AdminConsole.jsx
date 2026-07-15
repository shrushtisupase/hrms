import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api.js";
import dayjs from "dayjs";
import { ArrowLeft, Users, Building2, Banknote, Loader2, Download } from "lucide-react";

// admin console view shell (focused on onboarding, depts, and payroll engine)
export default function AdminConsole() {
  const navigate = useNavigate();
  const [activeSubTab, setActiveSubTab] = useState("staff"); // staff, departments, payroll
  const [departments, setDepartments] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // employee registration form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("EMPLOYEE");
  const [designation, setDesignation] = useState("");
  const [basicSalary, setBasicSalary] = useState(3000);
  const [deptId, setDeptId] = useState("");
  const [joiningDate, setJoiningDate] = useState("");

  // department creation states
  const [deptName, setDeptName] = useState("");
  const [deptDesc, setDeptDesc] = useState("");

  // payroll run states
  const [payMonth, setPayMonth] = useState(new Date().getMonth() + 1);
  const [payYear, setPayYear] = useState(new Date().getFullYear());

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      if (activeSubTab === "staff") {
        const deptsRes = await api.get("/departments");
        setDepartments(deptsRes.data.departments || []);
      } else if (activeSubTab === "departments") {
        const deptsRes = await api.get("/departments");
        setDepartments(deptsRes.data.departments || []);
      } else if (activeSubTab === "payroll") {
        const payRes = await api.get("/payroll", {
          params: { month: payMonth, year: payYear },
        });
        setPayrolls(payRes.data.payrolls || []);
      }
    } catch (err) {
      console.error(err);
      setError("failed to retrieve data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeSubTab]);

  const handleRegisterEmployee = async (e) => {
    e.preventDefault();
    if (!email || !password || !firstName || !lastName || !joiningDate) {
      setError("please complete required fields");
      return;
    }
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await api.post("/auth/register", {
        email,
        password,
        firstName,
        lastName,
        role,
        designation,
        basicSalary: Number(basicSalary),
        department: deptId || undefined,
        joiningDate,
      });

      if (res.data.success) {
        setSuccess("employee registered successfully");
        setEmail("");
        setPassword("");
        setFirstName("");
        setLastName("");
        setDesignation("");
        setJoiningDate("");
        fetchData();
      }
    } catch (err) {
      setError(err.response?.data?.message || "registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDept = async (e) => {
    e.preventDefault();
    if (!deptName) {
      setError("department name is required");
      return;
    }
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await api.post("/departments", {
        name: deptName,
        description: deptDesc,
      });
      if (res.data.success) {
        setSuccess("department created successfully");
        setDeptName("");
        setDeptDesc("");
        fetchData();
      }
    } catch (err) {
      setError(err.response?.data?.message || "failed to create department");
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePayroll = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await api.post("/payroll/generate", {
        month: Number(payMonth),
        year: Number(payYear),
      });
      if (res.data.success) {
        setSuccess(res.data.message);
        fetchData();
      }
    } catch (err) {
      setError(err.response?.data?.message || "payroll generation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePayrollStatus = async (id, status) => {
    try {
      const res = await api.patch(`/payroll/${id}/status`, { status });
      if (res.data.success) {
        fetchData();
      }
    } catch (err) {
      setError(err.response?.data?.message || "status update failed");
    }
  };

  const handleDownloadPayslip = async (id, empId) => {
    try {
      const res = await api.get(`/payroll/${id}/payslip`, {
        responseType: "blob",
      });
      const blob = new Blob([res.data], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `payslip-${empId}.pdf`;
      link.click();
    } catch (err) {
      setError("payslip download failed");
    }
  };

  return (
    <div className="flex-1 w-full bg-zinc-50 dark:bg-bg-dark-obsidian flex flex-col overflow-hidden select-none">
      {/* console sub-header */}
      <div className="px-6 pt-4 pb-3 flex items-center gap-3">
        <button
          onClick={() => navigate("/profile")}
          className="p-2 bg-white dark:bg-bg-dark-card border border-zinc-100 dark:border-zinc-900 rounded-lg cursor-pointer active:scale-95 transition-spring shadow-xs"
        >
          <ArrowLeft className="w-4 h-4 text-zinc-950 dark:text-white" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-zinc-950 dark:text-white tracking-tight">
            admin console
          </h2>
          <p className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mt-0.5">
            organization settings
          </p>
        </div>
      </div>

      {/* admin sub-navigation */}
      <div className="px-6 mb-4 flex gap-1.5 overflow-x-auto no-scrollbar">
        {[
          { id: "staff", label: "onboard staff", icon: Users },
          { id: "departments", label: "departments", icon: Building2 },
          { id: "payroll", label: "payroll engine", icon: Banknote },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer transition-all border shrink-0 ${
                isActive
                  ? "bg-brand-primary text-white border-brand-primary shadow-xs"
                  : "bg-white text-zinc-400 border-zinc-100 dark:bg-bg-dark-card dark:text-zinc-500 dark:border-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-300"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* error/success alerts */}
      {success && (
        <div className="mx-6 mb-3 p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900/50 rounded-lg text-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          {success}
        </div>
      )}
      {error && (
        <div className="mx-6 mb-3 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-lg text-center text-xs font-semibold text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* main content display based on tab selection */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 no-scrollbar flex flex-col gap-6">
        {loading && !departments.length && !payrolls.length ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-zinc-950 dark:text-white" />
          </div>
        ) : (
          <>
            {/* sub-view 1: staff management */}
            {activeSubTab === "staff" && (
              <div className="bg-white dark:bg-bg-dark-card border border-zinc-100 dark:border-zinc-900 rounded-xl p-4 shadow-sm flex flex-col gap-4">
                <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-900 pb-2">
                  onboard new employee
                </h3>
                <form onSubmit={handleRegisterEmployee} className="flex flex-col gap-3.5">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider pl-1">
                        first name *
                      </label>
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="bg-zinc-50 dark:bg-bg-dark-obsidian border border-zinc-100 dark:border-zinc-900 rounded-lg px-3 py-2 text-xs text-zinc-950 dark:text-white"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider pl-1">
                        last name *
                      </label>
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="bg-zinc-50 dark:bg-bg-dark-obsidian border border-zinc-100 dark:border-zinc-900 rounded-lg px-3 py-2 text-xs text-zinc-950 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider pl-1">
                      email address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-zinc-50 dark:bg-bg-dark-obsidian border border-zinc-100 dark:border-zinc-900 rounded-lg px-3 py-2 text-xs text-zinc-950 dark:text-white"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider pl-1">
                      access password *
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-zinc-50 dark:bg-bg-dark-obsidian border border-zinc-100 dark:border-zinc-900 rounded-lg px-3 py-2 text-xs text-zinc-950 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider pl-1">
                        role *
                      </label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="bg-zinc-50 dark:bg-bg-dark-obsidian border border-zinc-100 dark:border-zinc-900 rounded-lg px-3 py-2.5 text-xs text-zinc-950 dark:text-white"
                      >
                        <option value="EMPLOYEE">employee</option>
                        <option value="HR">hr officer</option>
                        <option value="ADMIN">administrator</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider pl-1">
                        joining date *
                      </label>
                      <input
                        type="date"
                        required
                        value={joiningDate}
                        onChange={(e) => setJoiningDate(e.target.value)}
                        className="bg-zinc-50 dark:bg-bg-dark-obsidian border border-zinc-100 dark:border-zinc-900 rounded-lg px-3 py-2 text-xs text-zinc-950 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider pl-1">
                        department
                      </label>
                      <select
                        value={deptId}
                        onChange={(e) => setDeptId(e.target.value)}
                        className="bg-zinc-50 dark:bg-bg-dark-obsidian border border-zinc-100 dark:border-zinc-900 rounded-lg px-3 py-2.5 text-xs text-zinc-950 dark:text-white"
                      >
                        <option value="">unassigned</option>
                        {departments.map((d) => (
                          <option key={d._id} value={d._id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider pl-1">
                        basic salary
                      </label>
                      <input
                        type="number"
                        value={basicSalary}
                        onChange={(e) => setBasicSalary(e.target.value)}
                        className="bg-zinc-50 dark:bg-bg-dark-obsidian border border-zinc-100 dark:border-zinc-900 rounded-lg px-3 py-2 text-xs text-zinc-950 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider pl-1">
                      job designation
                    </label>
                    <input
                      type="text"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      placeholder="e.g. software engineer"
                      className="bg-zinc-50 dark:bg-bg-dark-obsidian border border-zinc-100 dark:border-zinc-900 rounded-lg px-3 py-2 text-xs text-zinc-950 dark:text-white placeholder-zinc-300 dark:placeholder-zinc-700"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="py-3 bg-brand-primary hover:bg-brand-primary/95 text-white font-bold text-xs rounded-lg cursor-pointer active:scale-95 transition-spring shadow-sm flex items-center justify-center gap-1.5"
                  >
                    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    <span>complete onboarding</span>
                  </button>
                </form>
              </div>
            )}

            {/* sub-view 2: department management */}
            {activeSubTab === "departments" && (
              <>
                {/* dept form */}
                <div className="bg-white dark:bg-bg-dark-card border border-zinc-100 dark:border-zinc-900 rounded-xl p-4 shadow-sm flex flex-col gap-4">
                  <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-900 pb-2">
                    create department
                  </h3>
                  <form onSubmit={handleCreateDept} className="flex flex-col gap-3.5">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider pl-1">
                        department name
                      </label>
                      <input
                        type="text"
                        required
                        value={deptName}
                        onChange={(e) => setDeptName(e.target.value)}
                        className="bg-zinc-50 dark:bg-bg-dark-obsidian border border-zinc-100 dark:border-zinc-900 rounded-lg px-3 py-2 text-xs text-zinc-955 dark:text-white"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider pl-1">
                        description details
                      </label>
                      <input
                        type="text"
                        value={deptDesc}
                        onChange={(e) => setDeptDesc(e.target.value)}
                        className="bg-zinc-50 dark:bg-bg-dark-obsidian border border-zinc-100 dark:border-zinc-900 rounded-lg px-3 py-2 text-xs text-zinc-955 dark:text-white"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="py-3 bg-brand-primary hover:bg-brand-primary/95 text-white font-bold text-xs rounded-lg cursor-pointer active:scale-95 transition-spring shadow-sm flex items-center justify-center gap-1.5"
                    >
                      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                      <span>register department</span>
                    </button>
                  </form>
                </div>

                {/* dept directory */}
                <div className="flex flex-col gap-2.5">
                  <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider pl-1">
                    registered departments ({departments.length})
                  </h3>
                  <div className="flex flex-col gap-2">
                    {departments.map((d) => (
                      <div
                        key={d._id}
                        className="bg-white dark:bg-bg-dark-card border border-zinc-100 dark:border-zinc-900 rounded-xl p-4 shadow-sm"
                      >
                        <span className="text-xs font-bold text-zinc-950 dark:text-white block">
                          {d.name}
                        </span>
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium block mt-0.5">
                          {d.description || "no description provided"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* sub-view 3: payroll management */}
            {activeSubTab === "payroll" && (
              <>
                {/* payroll generation forms */}
                <div className="bg-white dark:bg-bg-dark-card border border-zinc-100 dark:border-zinc-900 rounded-xl p-4 shadow-sm flex flex-col gap-4">
                  <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-900 pb-2">
                    generate monthly payroll runs
                  </h3>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider pl-1">
                        month
                      </label>
                      <select
                        value={payMonth}
                        onChange={(e) => setPayMonth(Number(e.target.value))}
                        className="bg-zinc-50 dark:bg-bg-dark-obsidian border border-zinc-100 dark:border-zinc-900 rounded-lg px-3 py-2.5 text-xs text-zinc-950 dark:text-white"
                      >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                          <option key={m} value={m}>
                            {dayjs().month(m - 1).format("MMMM")}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider pl-1">
                        year
                      </label>
                      <input
                        type="number"
                        value={payYear}
                        onChange={(e) => setPayYear(Number(e.target.value))}
                        className="bg-zinc-50 dark:bg-bg-dark-obsidian border border-zinc-100 dark:border-zinc-900 rounded-lg px-3 py-2 text-xs text-zinc-950 dark:text-white"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleGeneratePayroll}
                    disabled={loading}
                    className="py-3 bg-brand-primary hover:bg-brand-primary/95 text-white font-bold text-xs rounded-lg cursor-pointer active:scale-95 transition-spring shadow-sm flex items-center justify-center gap-1.5"
                  >
                    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    <span>execute payroll calculation</span>
                  </button>
                </div>

                {/* payroll directory list */}
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between pl-1">
                    <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                      calculated payrolls ({payrolls.length})
                    </h3>
                    <button
                      onClick={fetchData}
                      className="text-[10px] font-bold text-brand-primary hover:text-brand-primary/90 uppercase"
                    >
                      refresh
                    </button>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    {payrolls.map((p) => (
                      <div
                        key={p._id}
                        className="bg-white dark:bg-bg-dark-card border border-zinc-100 dark:border-zinc-900 rounded-xl p-4 flex flex-col gap-3 shadow-sm"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-xs font-bold text-zinc-950 dark:text-white block">
                              {p.employee?.firstName} {p.employee?.lastName}
                            </span>
                            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">
                              net salary: ${p.netSalary?.toFixed(2)}
                            </span>
                          </div>
                          <span
                            className={`text-[8px] font-bold tracking-widest px-2 py-0.5 rounded-full uppercase ${
                              p.status === "PAID"
                                ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950"
                                : "bg-zinc-100 text-zinc-650 dark:bg-zinc-800 dark:text-zinc-400"
                            }`}
                          >
                            {p.status.toLowerCase()}
                          </span>
                        </div>

                        {/* actions buttons */}
                        <div className="flex gap-2">
                          {p.status !== "PAID" && (
                            <button
                              onClick={() => handleUpdatePayrollStatus(p._id, "PAID")}
                              className="flex-1 py-1.5 bg-brand-primary text-white font-bold text-[10px] rounded-lg cursor-pointer active:scale-95 transition-spring shadow-xs hover:bg-brand-primary/95"
                            >
                              mark as paid
                            </button>
                          )}
                          <button
                            onClick={() => handleDownloadPayslip(p._id, p.employee?.employeeId)}
                            className="flex-grow flex-1 py-1.5 border border-zinc-200 text-zinc-950 dark:border-zinc-800 dark:text-white font-bold text-[10px] rounded-lg cursor-pointer active:scale-95 transition-spring flex items-center justify-center gap-1.5"
                          >
                            <Download className="w-3 h-3" />
                            <span>payslip</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
