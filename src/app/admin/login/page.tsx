"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { isAxiosError } from "axios";
import { ArrowLeft, LayoutDashboard, ArrowRight } from "lucide-react";
import { http } from "@/services/http";

function errMsg(e: unknown, fallback: string) {
  if (isAxiosError(e) && e.response?.data && typeof e.response.data === "object") {
    const d = e.response.data as { error?: string };
    if (d.error) return d.error;
  }
  return fallback;
}

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeSession, setActiveSession] = useState<{ username: string; restaurantName?: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if already authenticated
    http
      .get<{ ok: boolean; admin?: { username: string; restaurantName?: string } }>("/api/admin/me")
      .then((res) => {
        if (res.data?.ok && res.data.admin) {
          setActiveSession(res.data.admin);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#faf8f5] p-4 font-body">
      <div className="w-full max-w-md space-y-4">
        {/* Back Button */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3.5 py-1.5 text-xs font-bold text-neutral-700 shadow-xs hover:bg-neutral-50 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>← Back to Home</span>
          </Link>

          {activeSession && (
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#e60000] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#cc0000] transition"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span>Go to Dashboard →</span>
            </Link>
          )}
        </div>

        {activeSession && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-900 flex items-center justify-between shadow-xs">
            <div>
              <p className="font-bold">Active Session Detected</p>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                Logged in as <strong>@{activeSession.username}</strong> ({activeSession.restaurantName || "Partner"})
              </p>
            </div>
            <Link
              href="/admin"
              className="px-3 py-1.5 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 transition flex items-center gap-1"
            >
              <span>Dashboard</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        )}

        <div className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-xl">
          <div className="flex items-center gap-3.5 mb-6 pb-5 border-b border-neutral-100">
            <div className="relative h-18 w-18 shrink-0 overflow-hidden rounded-full ring-3 ring-[#ffde00] bg-white shadow-lg">
              <Image
                src="/kya-khaugey.png"
                alt="Khaoge Kya?"
                fill
                className="object-cover"
                sizes="72px"
                priority
              />
            </div>
            <div>
              <h1 className="font-navbar-brand text-2xl font-black text-[#0b2545] leading-tight">
                KHA<span className="text-[#e51b24]">OGE</span> KYA<span className="text-[#e51b24]">?</span>
              </h1>
              <p className="text-[11px] font-bold text-[#e51b24] uppercase tracking-wider">
                Partner Admin Portal
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-base font-bold text-neutral-900">Partner Sign In</h2>
            <p className="mt-0.5 text-xs text-neutral-500">
              Manage your menu, orders and settings
            </p>
          </div>

          <form
            className="mt-6 space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setMsg(null);
              setLoading(true);
              try {
                await http.post("/api/admin/login", { username, password });
                router.push("/admin");
                router.refresh();
              } catch (e) {
                setMsg(errMsg(e, "Invalid username or password."));
              } finally {
                setLoading(false);
              }
            }}
          >
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Username
              </label>
              <input
                required
                autoComplete="username"
                className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none ring-[#e60000]/30 focus:ring-2"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Password
              </label>
              <input
                required
                type="password"
                autoComplete="current-password"
                className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none ring-[#e60000]/30 focus:ring-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#e60000] py-3 text-sm font-bold text-white shadow-lg shadow-red-500/30 hover:bg-[#cc0000] transition disabled:opacity-60 cursor-pointer"
            >
              {loading ? "Signing in…" : "Sign in to Dashboard"}
            </button>
          </form>

          {msg && (
            <div className="mt-4 rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200">
              {msg}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
