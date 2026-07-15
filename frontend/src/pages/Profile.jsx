import React, { useState } from "react";
import { useAuthStore } from "../store/authStore.js";
import api from "../utils/api.js";
import { User, LogOut, KeyRound, Settings, Loader2, Moon, Sun, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

// user settings page
export default function Profile() {
  const navigate = useNavigate();
  const { user, token, logout, darkMode, setDarkMode } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // profile details state
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [contactNumber, setContactNumber] = useState(user?.contactNumber || "");
  const [address, setAddress] = useState(user?.address || "");

  // passcode shift state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const isAdminOrHR = user?.role === "ADMIN" || user?.role === "HR";

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await api.patch("/employees/profile", {
        firstName,
        lastName,
        contactNumber,
        address,
      });

      if (res.data.success) {
        setSuccess("profile updated successfully");
        // update localzustand user object
        useAuthStore.setState({ user: res.data.user });
      }
    } catch (err) {
      setError(err.response?.data?.message || "failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      setError("please complete all passcode fields");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await api.patch("/employees/change-password", {
        currentPassword,
        newPassword,
      });

      if (res.data.success) {
        setSuccess("passcode changed successfully");
        setCurrentPassword("");
        setNewPassword("");
      }
    } catch (err) {
      setError(err.response?.data?.message || "passcode change failed");
    } finally {
      setLoading(false);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const initials = `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase();

  return (
    <div className="flex-1 w-full bg-zinc-50 dark:bg-bg-dark-obsidian flex flex-col overflow-y-auto no-scrollbar pb-6 select-none">
      {/* header title */}
      <div className="px-6 pt-4 pb-3">
        <h2 className="text-2xl font-bold text-zinc-955 dark:text-white tracking-tight">
          profile details
        </h2>
        <p className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mt-0.5">
          individual configuration
        </p>
      </div>

      {success && (
        <div className="mx-6 mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-lg text-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          {success}
        </div>
      )}

      {error && (
        <div className="mx-6 mb-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-lg text-center text-xs font-semibold text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* scrollable elements wrapper */}
      <div className="flex flex-col px-6 gap-5">
        
        {/* avatar detail branding card */}
        <div className="bg-white dark:bg-bg-dark-card border border-zinc-100 dark:border-zinc-900 rounded-xl p-4.5 flex items-center gap-4.5 shadow-xs">
          <div className="w-12 h-12 bg-brand-primary text-white dark:bg-brand-primary dark:text-white rounded-full flex items-center justify-center font-extrabold text-base shadow-sm">
            {initials}
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-zinc-950 dark:text-white">
              {user?.firstName} {user?.lastName}
            </h3>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium block mt-0.5">
              ID: {user?.employeeId} • {user?.designation || "employee"}
            </span>
          </div>
        </div>

        {/* monochrome dark/light mode toggle widget */}
        <div className="bg-white dark:bg-bg-dark-card border border-zinc-100 dark:border-zinc-900 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            {darkMode ? (
              <Moon className="w-5 h-5 text-zinc-400 dark:text-zinc-500" />
            ) : (
              <Sun className="w-5 h-5 text-zinc-400" />
            )}
            <div>
              <span className="text-xs font-bold text-zinc-955 dark:text-white block">
                monochrome dark mode
              </span>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">
                high contrast low-light palette
              </span>
            </div>
          </div>
          <button
            onClick={toggleDarkMode}
            className="w-12 h-6 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full relative cursor-pointer transition-all duration-300 flex items-center px-1"
          >
            <div
              className={`w-4 h-4 rounded-full bg-zinc-950 dark:bg-white transition-all duration-300 ${
                darkMode ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* update details forms */}
        <div className="bg-white dark:bg-bg-dark-card border border-zinc-100 dark:border-zinc-900 rounded-xl p-4 shadow-xs flex flex-col gap-4">
          <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-100 dark:border-zinc-900 pb-2">
            <User className="w-3.5 h-3.5" />
            <span>personal information</span>
          </h3>

          <form onSubmit={handleUpdateProfile} className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider pl-1">
                  first name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="bg-zinc-50 dark:bg-bg-dark-obsidian border border-zinc-100 dark:border-zinc-900 rounded-lg px-3 py-2.5 text-xs text-zinc-955 dark:text-white"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider pl-1">
                  last name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="bg-zinc-50 dark:bg-bg-dark-obsidian border border-zinc-100 dark:border-zinc-900 rounded-lg px-3 py-2.5 text-xs text-zinc-955 dark:text-white"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider pl-1">
                contact phone
              </label>
              <input
                type="text"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                className="bg-zinc-50 dark:bg-bg-dark-obsidian border border-zinc-100 dark:border-zinc-900 rounded-lg px-3 py-2.5 text-xs text-zinc-955 dark:text-white"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider pl-1">
                home address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="bg-zinc-50 dark:bg-bg-dark-obsidian border border-zinc-100 dark:border-zinc-900 rounded-lg px-3 py-2.5 text-xs text-zinc-955 dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="py-3 bg-brand-primary text-white font-bold text-xs rounded-lg cursor-pointer active:scale-95 transition-spring shadow-xs hover:bg-brand-primary/95 flex items-center justify-center gap-1.5"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              <span>update information</span>
            </button>
          </form>
        </div>

        {/* change passcode forms */}
        <div className="bg-white dark:bg-bg-dark-card border border-zinc-100 dark:border-zinc-900 rounded-xl p-4 shadow-xs flex flex-col gap-4">
          <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-100 dark:border-zinc-900 pb-2">
            <KeyRound className="w-3.5 h-3.5" />
            <span>change secret passcode</span>
          </h3>

          <form onSubmit={handleChangePassword} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider pl-1">
                current passcode
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="bg-zinc-50 dark:bg-bg-dark-obsidian border border-zinc-100 dark:border-zinc-900 rounded-lg px-3 py-2.5 text-xs text-zinc-955 dark:text-white"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider pl-1">
                new passcode
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-zinc-50 dark:bg-bg-dark-obsidian border border-zinc-100 dark:border-zinc-900 rounded-lg px-3 py-2.5 text-xs text-zinc-955 dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="py-3 border border-zinc-200 text-zinc-950 dark:border-zinc-800 dark:text-white font-bold text-xs rounded-lg cursor-pointer active:scale-95 transition-spring flex items-center justify-center gap-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-900"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              <span>update secret passcode</span>
            </button>
          </form>
        </div>

        {/* access to organization panel (if admin or hr) */}
        {isAdminOrHR && (
          <button
            onClick={() => navigate("/admin")}
            className="w-full py-4.5 bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 border border-zinc-100 dark:border-zinc-800 font-extrabold text-xs tracking-widest uppercase rounded-xl cursor-pointer active:scale-95 transition-spring shadow-md flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>admin settings console</span>
          </button>
        )}

        {/* log out button trigger */}
        <button
          onClick={logout}
          className="w-full py-4 border border-red-200 text-red-600 dark:border-red-950/40 dark:text-red-400 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-spring shadow-xs hover:bg-red-50/20"
        >
          <LogOut className="w-4.5 h-4.5" />
          <span>log out of session</span>
        </button>
      </div>
    </div>
  );
}
