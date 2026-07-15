import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore.js";
import api from "../utils/api.js";
import { ShieldCheck, Eye, EyeOff, Loader2 } from "lucide-react";

// user sign-in screen
export default function Login() {
  const { token, login } = useAuthStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (token) {
      navigate("/", { replace: true });
    }
  }, [token, navigate]);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("please fill in all fields");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });
      if (res.data.success) {
        login(res.data.token, res.data.user);
      }
    } catch (err) {
      setError(err.response?.data?.message || "invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 w-full bg-white dark:bg-bg-dark-obsidian flex flex-col justify-center px-8 py-6 select-none overflow-y-auto no-scrollbar">
      {/* branding header */}
      <div className="mb-10 text-center">
        <div className="mx-auto w-12 h-12 bg-brand-primary rounded-xl flex items-center justify-center mb-4 shadow-md shadow-brand-primary/20 animate-soft-pulse">
          <ShieldCheck className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tighter text-zinc-950 dark:text-white">
          hrms.
        </h1>
        <p className="text-xs font-semibold tracking-wide text-zinc-400 dark:text-zinc-500 mt-1 uppercase">
          human resource gateway
        </p>
      </div>

      {/* error block */}
      {error && (
        <div className="mb-5 p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-lg text-xs font-semibold text-center text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* login form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider pl-1">
            email address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value.toLowerCase())}
            placeholder="e.g. name@hrms.com"
            disabled={loading}
            className="w-full bg-zinc-50 dark:bg-bg-dark-card border border-zinc-200 dark:border-zinc-800 focus:border-brand-primary dark:focus:border-brand-primary rounded-lg px-4 py-3.5 text-sm text-zinc-955 dark:text-white transition-all placeholder-zinc-300 dark:placeholder-zinc-700"
          />
        </div>

        <div className="flex flex-col gap-1.5 relative">
          <label className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider pl-1">
            secret passcode
          </label>
          <div className="relative w-full">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              className="w-full bg-zinc-50 dark:bg-bg-dark-card border border-zinc-200 dark:border-zinc-800 focus:border-brand-primary dark:focus:border-brand-primary rounded-lg pl-4 pr-11 py-3.5 text-sm text-zinc-955 dark:text-white transition-all placeholder-zinc-300 dark:placeholder-zinc-700"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-650 hover:text-zinc-600 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-primary text-white font-semibold text-sm py-4 rounded-lg mt-4 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-brand-primary/20 hover:bg-brand-primary/95"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>verifying access...</span>
            </>
          ) : (
            <span>sign in</span>
          )}
        </button>
      </form>
    </div>
  );
}
