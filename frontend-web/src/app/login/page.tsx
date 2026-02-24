"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useUserStore } from "@/stores/userStore";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setAuth = useUserStore((s) => s.setAuth);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { user, accessToken, refreshToken } = await api.auth.login({
        email,
        password,
      });
      setAuth(user, accessToken, refreshToken);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Innlogging feilet");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">L</span>
            </div>
            <span className="font-bold text-2xl text-primary-700">
              LeanLife
            </span>
          </Link>
          <p className="mt-3 text-slate-500">Logg inn på kontoen din</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm border p-8 space-y-5"
        >
          {error && (
            <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              E-post
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              placeholder="din@epost.no"
              required
              aria-label="E-postadresse"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Passord
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              placeholder="••••••••"
              required
              aria-label="Passord"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-500 text-white py-2.5 rounded-lg font-medium hover:bg-primary-600 transition disabled:opacity-50"
          >
            {loading ? "Logger inn..." : "Logg inn"}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-slate-500">
          Har du ikke konto?{" "}
          <Link href="/register" className="text-primary-600 font-medium">
            Registrer deg gratis
          </Link>
        </p>
      </div>
    </div>
  );
}
