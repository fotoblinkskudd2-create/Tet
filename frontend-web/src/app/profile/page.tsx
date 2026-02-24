"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import { api } from "@/lib/api";
import { useUserStore } from "@/stores/userStore";

export default function ProfilePage() {
  const router = useRouter();
  const { token, user, logout } = useUserStore();
  const [profile, setProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    heightCm: "",
    goalWeightKg: "",
    activityLevel: "MODERATE",
    birthDate: "",
    sex: "FEMALE",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    loadProfile();
  }, [token]);

  async function loadProfile() {
    if (!token) return;
    try {
      const data = await api.profile.get(token);
      setProfile(data);
      setForm({
        heightCm: data.heightCm?.toString() || "",
        goalWeightKg: data.goalWeightKg?.toString() || "",
        activityLevel: data.activityLevel || "MODERATE",
        birthDate: data.birthDate?.slice(0, 10) || "",
        sex: data.sex || "FEMALE",
      });
    } catch {
      setEditing(true);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setMessage("");

    try {
      const data = await api.profile.update(token, {
        heightCm: parseFloat(form.heightCm),
        goalWeightKg: parseFloat(form.goalWeightKg),
        activityLevel: form.activityLevel,
        birthDate: form.birthDate,
        sex: form.sex,
      });
      setProfile(data);
      setEditing(false);
      setMessage("Profil oppdatert!");
    } catch (err: any) {
      setMessage(err.message || "Feil ved lagring");
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    logout();
    router.push("/");
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pt-16">
      <Navigation />

      <main className="max-w-2xl mx-auto px-4 pt-6 space-y-6">
        <h1 className="text-2xl font-bold text-slate-800">Profil</h1>

        {/* User info */}
        <div className="bg-white rounded-2xl border p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-600">
                {user?.name?.[0] || "?"}
              </span>
            </div>
            <div>
              <p className="font-semibold text-lg">{user?.name}</p>
              <p className="text-sm text-slate-500">{user?.email}</p>
              <span className="inline-block mt-1 text-xs font-medium bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
                {user?.subscription || "FREE"}
              </span>
            </div>
          </div>
        </div>

        {/* Health profile */}
        <div className="bg-white rounded-2xl border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-700">Helseprofil</h2>
            {!editing && profile && (
              <button
                onClick={() => setEditing(true)}
                className="text-sm text-primary-600 font-medium"
              >
                Rediger
              </button>
            )}
          </div>

          {editing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-600">Høyde (cm)</label>
                  <input
                    type="number"
                    value={form.heightCm}
                    onChange={(e) =>
                      setForm({ ...form, heightCm: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
                    required
                    aria-label="Høyde i centimeter"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-600">
                    Målvekt (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.goalWeightKg}
                    onChange={(e) =>
                      setForm({ ...form, goalWeightKg: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
                    required
                    aria-label="Målvekt i kilogram"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-600">Fødselsdato</label>
                  <input
                    type="date"
                    value={form.birthDate}
                    onChange={(e) =>
                      setForm({ ...form, birthDate: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
                    required
                    aria-label="Fødselsdato"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-600">Kjønn</label>
                  <select
                    value={form.sex}
                    onChange={(e) => setForm({ ...form, sex: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
                    aria-label="Kjønn"
                  >
                    <option value="FEMALE">Kvinne</option>
                    <option value="MALE">Mann</option>
                    <option value="OTHER">Annet</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm text-slate-600">Aktivitetsnivå</label>
                <select
                  value={form.activityLevel}
                  onChange={(e) =>
                    setForm({ ...form, activityLevel: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
                  aria-label="Aktivitetsnivå"
                >
                  <option value="SEDENTARY">Stillesittende</option>
                  <option value="LIGHT">Lett aktiv</option>
                  <option value="MODERATE">Moderat aktiv</option>
                  <option value="ACTIVE">Aktiv</option>
                  <option value="VERY_ACTIVE">Svært aktiv</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-primary-500 text-white py-2.5 rounded-lg font-medium hover:bg-primary-600 transition disabled:opacity-50"
              >
                {saving ? "Lagrer..." : "Lagre profil"}
              </button>
            </form>
          ) : profile ? (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <ProfileField label="Høyde" value={`${profile.heightCm} cm`} />
              <ProfileField
                label="Målvekt"
                value={`${profile.goalWeightKg} kg`}
              />
              <ProfileField
                label="Daglig mål"
                value={`${profile.dailyTarget} kcal`}
              />
              <ProfileField label="BMR" value={`${Math.round(profile.bmr)} kcal`} />
              <ProfileField label="TDEE" value={`${profile.tdee} kcal`} />
              <ProfileField label="Aktivitet" value={profile.activityLevel} />
            </div>
          ) : (
            <p className="text-slate-400 text-sm">
              Fyll ut helseprofilen for å beregne ditt kaloribudsjett.
            </p>
          )}

          {message && (
            <p className="text-sm text-center text-primary-600 font-medium mt-3">
              {message}
            </p>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full text-center py-3 text-red-500 font-medium hover:bg-red-50 rounded-xl transition"
        >
          Logg ut
        </button>
      </main>
    </div>
  );
}

function ProfileField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="py-2">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="font-medium text-slate-700">{value}</p>
    </div>
  );
}
