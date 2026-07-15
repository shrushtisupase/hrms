import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api.js";
import dayjs from "dayjs";
import { ArrowLeft, User, ShieldAlert, Loader2, Save, X, Edit3, Trash2 } from "lucide-react";

// full manager overview and configuration profile details for a specific employee
export default function EmployeeProfileDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // edit mode variables
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("EMPLOYEE");
  const [deptId, setDeptId] = useState("");
  const [designation, setDesignation] = useState("");
  const [basicSalary, setBasicSalary] = useState(0);
  const [isActive, setIsActive] = useState(true);

  // delete verification modal
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteEmailInput, setDeleteEmailInput] = useState("");

  const fetchEmployeeData = async () => {
    try {
      setLoading(true);
      setError("");

      const [empRes, deptRes] = await Promise.all([
        api.get(`/employees/${id}`),
        api.get("/departments"),
      ]);

      const emp = empRes.data.employee;
      setEmployee(emp);
      setDepartments(deptRes.data.departments || []);

      // initialize edit fields
      setFirstName(emp.firstName || "");
      setLastName(emp.lastName || "");
      setRole(emp.role || "EMPLOYEE");
      setDeptId(emp.department?._id || "");
      setDesignation(emp.designation || "");
      setBasicSalary(emp.basicSalary || 0);
      setIsActive(emp.isActive !== false);
    } catch (err) {
      console.error(err);
      setError("failed to load employee details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeData();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await api.patch(`/employees/${id}`, {
        firstName,
        lastName,
        role,
        department: deptId || undefined,
        designation: designation || undefined,
        basicSalary: Number(basicSalary),
        isActive,
      });

      if (res.data.success) {
        setEmployee(res.data.employee);
        setSuccess("profile record updated successfully");
        setIsEditing(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || "update failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteEmailInput.trim().toLowerCase() !== employee?.email.toLowerCase()) {
      return;
    }

    setActionLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await api.delete(`/employees/${id}`);
      if (res.data.success) {
        setSuccess("employee account deleted successfully");
        setShowDeleteDialog(false);
        // wait for message flash before redirecting
        setTimeout(() => {
          navigate("/employees", { replace: true });
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || "failed to delete employee record");
      setShowDeleteDialog(false);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && !employee) {
    return (
      <div className="flex-grow w-full bg-zinc-50 dark:bg-bg-dark-obsidian flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-950 dark:text-white" />
      </div>
    );
  }

  const initials = `${employee?.firstName?.[0] || ""}${employee?.lastName?.[0] || ""}`.toUpperCase();

  return (
    <div className="flex-grow w-full bg-zinc-50 dark:bg-bg-dark-obsidian flex flex-col overflow-hidden relative select-none">
      {/* header back navigation bar */}
      <div className="px-6 pt-4 pb-3 flex items-center gap-3">
        <button
          onClick={() => navigate("/employees")}
          className="p-2 bg-white dark:bg-bg-dark-card border border-zinc-150 dark:border-zinc-900 rounded-lg cursor-pointer active:scale-95 transition-spring shadow-xs"
        >
          <ArrowLeft className="w-4 h-4 text-zinc-950 dark:text-white" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-zinc-950 dark:text-white tracking-tight">
            employee file
          </h2>
          <p className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mt-0.5">
            managerial viewpoint
          </p>
        </div>
      </div>

      {success && (
        <div className="mx-6 mb-3 p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-lg text-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          {success}
        </div>
      )}

      {error && (
        <div className="mx-6 mb-3 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-lg text-center text-xs font-semibold text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* scrollable employee profile profile info cards */}
      <div className="flex-grow overflow-y-auto px-6 pb-6 no-scrollbar flex flex-col gap-6">
        
        {/* visual branding card */}
        <div className="bg-white dark:bg-bg-dark-card border border-zinc-100 dark:border-zinc-900 rounded-xl p-5 flex items-center gap-4 shadow-xs relative">
          <div className="w-14 h-14 bg-brand-primary text-white dark:bg-brand-primary dark:text-white rounded-full flex items-center justify-center font-extrabold text-lg shadow-sm">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-extrabold text-zinc-950 dark:text-white truncate">
              {employee?.firstName} {employee?.lastName}
            </h3>
            <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500 block mt-0.5">
              ID: {employee?.employeeId}
            </span>
            <span className="text-[10px] font-bold tracking-widest px-2 py-0.5 rounded-full bg-brand-primary-light text-brand-primary dark:bg-brand-primary-dark/30 dark:text-brand-primary uppercase inline-block mt-2">
              {employee?.role.toLowerCase()}
            </span>
          </div>

          {/* edit toggle button on static view */}
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="absolute right-4 top-4 p-2 bg-zinc-50 dark:bg-bg-dark-obsidian text-zinc-400 hover:text-brand-primary dark:hover:text-brand-primary rounded-lg border border-zinc-100 dark:border-zinc-900 cursor-pointer active:scale-95 transition-spring"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* profile data or edit details form */}
        {!isEditing ? (
          /* view 1: static visual profile */
          <div className="bg-white dark:bg-bg-dark-card border border-zinc-100 dark:border-zinc-900 rounded-xl p-4 shadow-sm flex flex-col gap-4">
            <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-100 dark:border-zinc-900 pb-2">
              <User className="w-3.5 h-3.5" />
              <span>employment metrics</span>
            </h4>

            <div className="flex flex-col gap-3.5">
              <div className="grid grid-cols-2 gap-4 border-b border-zinc-100 dark:border-zinc-900 pb-3">
                <div>
                  <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase block">designation</span>
                  <span className="text-xs font-bold text-zinc-950 dark:text-white block mt-0.5">{employee?.designation || "not assigned"}</span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase block">department</span>
                  <span className="text-xs font-bold text-zinc-955 dark:text-white block mt-0.5">{employee?.department?.name || "unassigned"}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-b border-zinc-100 dark:border-zinc-900 pb-3">
                <div>
                  <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase block">basic monthly salary</span>
                  <span className="text-xs font-bold text-zinc-955 dark:text-white block mt-0.5">₹{employee?.basicSalary?.toFixed(2) || "0.00"}</span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase block">joining date</span>
                  <span className="text-xs font-bold text-zinc-955 dark:text-white block mt-0.5">
                    {employee?.joiningDate ? dayjs(employee.joiningDate).utc().format("MMMM DD, YYYY") : "unregistered"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase block">email contact</span>
                  <span className="text-xs font-bold text-zinc-950 dark:text-white block mt-0.5 truncate">{employee?.email}</span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase block">account status</span>
                  <span className={`text-xs font-extrabold block mt-0.5 ${employee?.isActive !== false ? "text-emerald-600" : "text-zinc-400"}`}>
                    {employee?.isActive !== false ? "active" : "inactive"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* view 2: active editing form fields */
          <div className="bg-white dark:bg-bg-dark-card border border-zinc-100 dark:border-zinc-900 rounded-xl p-4 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-2">
              <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5" />
                <span>edit configurations</span>
              </h4>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 text-zinc-400 hover:text-zinc-950 dark:hover:text-white rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider pl-1">
                    first name
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="bg-zinc-50 dark:bg-bg-dark-obsidian border border-zinc-100 dark:border-zinc-900 rounded-lg px-3 py-2.5 text-xs text-zinc-950 dark:text-white"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider pl-1">
                    last name
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="bg-zinc-50 dark:bg-bg-dark-obsidian border border-zinc-100 dark:border-zinc-900 rounded-lg px-3 py-2.5 text-xs text-zinc-950 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider pl-1">
                    access role
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
                  <label className="text-[10px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider pl-1">
                    department
                  </label>
                  <select
                    value={deptId}
                    onChange={(e) => setDeptId(e.target.value)}
                    className="bg-zinc-50 dark:bg-bg-dark-obsidian border border-zinc-100 dark:border-zinc-900 rounded-lg px-3 py-2.5 text-xs text-zinc-955 dark:text-white"
                  >
                    <option value="">unassigned</option>
                    {departments.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.name.toLowerCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-zinc-455 dark:text-zinc-500 uppercase tracking-wider pl-1">
                    basic salary
                  </label>
                  <input
                    type="number"
                    value={basicSalary}
                    onChange={(e) => setBasicSalary(e.target.value)}
                    className="bg-zinc-50 dark:bg-bg-dark-obsidian border border-zinc-100 dark:border-zinc-900 rounded-lg px-3 py-2.5 text-xs text-zinc-950 dark:text-white"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-zinc-455 dark:text-zinc-500 uppercase tracking-wider pl-1">
                    active status
                  </label>
                  <select
                    value={String(isActive)}
                    onChange={(e) => setIsActive(e.target.value === "true")}
                    className="bg-zinc-50 dark:bg-bg-dark-obsidian border border-zinc-100 dark:border-zinc-900 rounded-lg px-3 py-2.5 text-xs text-zinc-950 dark:text-white"
                  >
                    <option value="true">active status</option>
                    <option value="false">inactive / terminated</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider pl-1">
                  job designation
                </label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="bg-zinc-50 dark:bg-bg-dark-obsidian border border-zinc-100 dark:border-zinc-900 rounded-lg px-3 py-2.5 text-xs text-zinc-950 dark:text-white"
                />
              </div>

              <div className="flex gap-2.5 mt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-3 border border-zinc-200 text-zinc-955 dark:border-zinc-800 dark:text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-spring"
                >
                  <X className="w-4 h-4" />
                  <span>cancel</span>
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-grow flex-1 py-3 bg-brand-primary text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-spring shadow-xs hover:bg-brand-primary/95"
                >
                  {actionLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>save configurations</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Danger Zone for employee removal */}
        <div className="bg-red-50/20 dark:bg-red-950/10 border border-red-200/50 dark:border-red-950/40 rounded-xl p-5 shadow-xs flex flex-col gap-3">
          <h4 className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4" />
            <span>danger zone</span>
          </h4>
          <p className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 leading-relaxed">
            Deleting this employee account will completely purge their record, including checking sessions, payslips, leaves history, and credentials from the system database. This operation is permanent and cannot be undone.
          </p>
          <button
            onClick={() => {
              setDeleteEmailInput("");
              setShowDeleteDialog(true);
            }}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98] transition-spring shadow-md mt-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>delete employee account</span>
          </button>
        </div>
      </div>

      {/* GitHub-style email-matching delete confirmation overlay dialog */}
      {showDeleteDialog && (
        <div className="absolute inset-0 bg-zinc-950/50 backdrop-blur-xs z-50 flex items-center justify-center p-6">
          <div className="w-full max-w-sm bg-white dark:bg-bg-dark-card border border-zinc-100 dark:border-zinc-900 rounded-xl p-6 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200 select-none">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-2">
              <h3 className="text-sm font-extrabold text-red-600 dark:text-red-400 uppercase tracking-wide flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" />
                <span>confirm account deletion</span>
              </h3>
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="p-1 text-zinc-400 hover:text-zinc-900 rounded"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium leading-relaxed">
              This action <span className="font-bold text-zinc-950 dark:text-white">cannot</span> be undone. You are permanently removing the account file for <span className="font-bold text-zinc-950 dark:text-white">{employee?.firstName} {employee?.lastName}</span>.
            </p>

            <div className="flex flex-col gap-2 bg-zinc-50 dark:bg-bg-dark-obsidian p-3 rounded-lg border border-zinc-100 dark:border-zinc-900">
              <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                type employee email address to verify:
              </label>
              <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 select-all block mt-0.5 truncate bg-white dark:bg-bg-dark-card px-2 py-1 rounded border border-dashed border-zinc-200 dark:border-zinc-800">
                {employee?.email}
              </span>
              <input
                type="text"
                placeholder="type email address..."
                value={deleteEmailInput}
                onChange={(e) => setDeleteEmailInput(e.target.value)}
                className="w-full bg-white dark:bg-bg-dark-card border border-zinc-200 dark:border-zinc-800 rounded px-3 py-2 text-xs text-zinc-950 dark:text-white mt-1 transition-all"
              />
            </div>

            <div className="flex gap-2 mt-1">
              <button
                type="button"
                onClick={() => setShowDeleteDialog(false)}
                className="flex-1 py-2.5 border border-zinc-200 text-zinc-950 dark:border-zinc-850 dark:text-white font-bold text-xs rounded-lg cursor-pointer active:scale-95 transition-spring"
              >
                cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteEmailInput.trim().toLowerCase() !== employee?.email.toLowerCase() || actionLoading}
                className="flex-grow flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-zinc-100 disabled:text-zinc-400 dark:disabled:bg-bg-dark-obsidian dark:disabled:text-zinc-700 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1 cursor-pointer active:scale-95 transition-spring shadow-xs"
              >
                {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>confirm delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
