"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Home,
  Lock,
  User,
  ArrowRight,
  Loader2,
  ArrowLeft,
  Eye,
  EyeOff,
  Sun,
  Moon,
} from "lucide-react";
import { http } from "@/services/http";

export default function SuperAdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeSession, setActiveSession] = useState<{ name: string; username: string } | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("platform_theme") as "dark" | "light" | null;
      if (saved) setTheme(saved);
    }

    http
      .get<{ authenticated: boolean; user?: { name: string; username: string } }>("/api/super-admin/me")
      .then((res) => {
        if (res.data?.authenticated && res.data.user) {
          setActiveSession(res.data.user);
        }
      })
      .catch(() => {});
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("platform_theme", next);
  };

  const isDark = theme === "dark";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await http.post<{ ok: boolean }>("/api/super-admin/login", {
        username,
        password,
      });

      if (res.data.ok) {
        router.push("/super-admin");
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Invalid Super Admin credentials";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`relative min-h-screen flex flex-col justify-between overflow-hidden transition-colors duration-300 ${
        isDark
          ? "bg-[#07090e] text-white selection:bg-purple-600 selection:text-white"
          : "bg-neutral-50 text-neutral-900 selection:bg-purple-500 selection:text-white"
      }`}
    >
      {/* Ambient background mesh glow effects */}
      <div
        className={`pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full blur-[160px] ${
          isDark ? "bg-purple-600/15" : "bg-purple-300/30"
        }`}
      />
      <div
        className={`pointer-events-none absolute -bottom-40 right-10 w-[500px] h-[400px] rounded-full blur-[150px] ${
          isDark ? "bg-indigo-600/10" : "bg-indigo-200/40"
        }`}
      />

      {/* Top Navbar */}
      <header className="relative z-10 mx-auto w-full max-w-5xl px-4 sm:px-6 pt-6 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className={`group inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold backdrop-blur-md transition ${
              isDark
                ? "border-neutral-800/80 bg-neutral-900/60 text-neutral-300 hover:border-neutral-700 hover:text-white"
                : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100 shadow-xs"
            }`}
          >
            <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform text-purple-500" />
            <span>Platform Home</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            title={`Switch to ${isDark ? "Light" : "Dark"} mode`}
            className={`p-2 rounded-full border transition cursor-pointer ${
              isDark
                ? "border-neutral-800 bg-neutral-900 text-amber-300 hover:bg-neutral-800"
                : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100 shadow-xs"
            }`}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4 text-neutral-700" />}
          </button>

          <div
            className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold backdrop-blur-md ${
              isDark
                ? "border-purple-500/20 bg-purple-950/30 text-purple-300"
                : "border-purple-200 bg-purple-50 text-purple-700"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
            <span className="tracking-wide">Super Admin Console</span>
          </div>
        </div>
      </header>

      {/* Login Card Container */}
      <main className="relative z-10 mx-auto w-full max-w-md px-4 py-8 my-auto space-y-4">
        {activeSession && (
          <div
            className={`rounded-2xl border p-4 text-xs flex items-center justify-between shadow-xl backdrop-blur-xl animate-in fade-in ${
              isDark
                ? "border-purple-500/40 bg-purple-950/60 text-purple-200"
                : "border-purple-300 bg-purple-50/90 text-purple-900"
            }`}
          >
            <div>
              <p className="font-bold flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Active Session Detected
              </p>
              <p className={`text-[11px] mt-0.5 ${isDark ? "text-purple-300" : "text-purple-700"}`}>
                Logged in as <strong>{activeSession.name}</strong> (@{activeSession.username})
              </p>
            </div>
            <Link
              href="/super-admin"
              className="px-3.5 py-1.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-500 shadow-md shadow-purple-600/30 transition flex items-center gap-1"
            >
              <span>Console</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        )}

        <div
          className={`relative rounded-3xl border p-6 sm:p-9 shadow-2xl backdrop-blur-xl ${
            isDark
              ? "border-neutral-800/90 bg-neutral-900/80 shadow-purple-950/40"
              : "border-neutral-200 bg-white/95 shadow-neutral-200"
          }`}
        >
          {/* Top glowing gradient line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-purple-600 via-indigo-500 to-pink-500 rounded-t-3xl" />

          {/* Header & Icon */}
          <div className="text-center mb-7">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-tr from-purple-600/25 to-indigo-600/25 text-purple-500 border border-purple-500/30 mb-4 shadow-lg shadow-purple-500/20">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? "text-white" : "text-neutral-900"}`}>
              Super Admin Control
            </h1>
            <p className={`text-xs sm:text-sm mt-1.5 max-w-xs mx-auto leading-relaxed ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
              Verify partner registrations, manage payments & toggle restaurant status
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${isDark ? "text-neutral-300" : "text-neutral-700"}`}>
                  <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                  Super Admin Username
                </label>
                <span className="text-[10px] text-neutral-400 font-mono">Master ID</span>
              </div>
              <div
                className={`group relative flex items-center rounded-2xl border p-1.5 transition-all duration-200 shadow-inner focus-within:border-purple-500 focus-within:ring-4 focus-within:ring-purple-500/20 ${
                  isDark
                    ? "border-neutral-700/80 bg-neutral-950/80 focus-within:bg-neutral-950"
                    : "border-neutral-300 bg-neutral-50 focus-within:bg-white"
                }`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors ${
                    isDark
                      ? "bg-neutral-900 border-neutral-800 text-neutral-400 group-focus-within:bg-purple-600/20 group-focus-within:border-purple-500/40 group-focus-within:text-purple-300"
                      : "bg-white border-neutral-200 text-neutral-500 group-focus-within:bg-purple-50 group-focus-within:border-purple-400 group-focus-within:text-purple-600"
                  }`}
                >
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Enter super admin username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`w-full bg-transparent px-3 py-2 text-sm font-medium focus:outline-none ${
                    isDark ? "text-white placeholder:text-neutral-500" : "text-neutral-900 placeholder:text-neutral-400"
                  }`}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${isDark ? "text-neutral-300" : "text-neutral-700"}`}>
                  <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                  Master Password
                </label>
                <span className="text-[10px] text-neutral-400 font-mono">Encrypted</span>
              </div>
              <div
                className={`group relative flex items-center rounded-2xl border p-1.5 transition-all duration-200 shadow-inner focus-within:border-purple-500 focus-within:ring-4 focus-within:ring-purple-500/20 ${
                  isDark
                    ? "border-neutral-700/80 bg-neutral-950/80 focus-within:bg-neutral-950"
                    : "border-neutral-300 bg-neutral-50 focus-within:bg-white"
                }`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors ${
                    isDark
                      ? "bg-neutral-900 border-neutral-800 text-neutral-400 group-focus-within:bg-purple-600/20 group-focus-within:border-purple-500/40 group-focus-within:text-purple-300"
                      : "bg-white border-neutral-200 text-neutral-500 group-focus-within:bg-purple-50 group-focus-within:border-purple-400 group-focus-within:text-purple-600"
                  }`}
                >
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full bg-transparent px-3 py-2 text-sm font-medium focus:outline-none ${
                    isDark ? "text-white placeholder:text-neutral-500" : "text-neutral-900 placeholder:text-neutral-400"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors cursor-pointer mr-0.5 ${
                    isDark ? "text-neutral-400 hover:text-white hover:bg-neutral-800/80" : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/60"
                  }`}
                  title={showPassword ? "Hide Password" : "Show Password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {errorMsg && (
              <div
                className={`rounded-xl p-3 text-xs border flex items-start gap-2 ${
                  isDark
                    ? "bg-red-950/80 text-red-300 border-red-800/80"
                    : "bg-red-50 text-red-800 border-red-200"
                }`}
              >
                <span className="font-bold text-red-500">Error:</span>
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-linear-to-r from-purple-600 via-indigo-600 to-pink-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-600/30 hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verifying Credentials…</span>
                </>
              ) : (
                <>
                  <span>Sign In to Super Admin</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className={`relative z-10 text-center py-5 text-xs ${isDark ? "text-neutral-500" : "text-neutral-400"}`}>
        PizzaHub Partner Hub • Super Administrator Console • Secure TLS 1.3
      </footer>
    </div>
  );
}
