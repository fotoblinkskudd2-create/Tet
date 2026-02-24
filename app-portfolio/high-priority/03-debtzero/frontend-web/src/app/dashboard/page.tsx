// DebtZero Web — Gjeldsdashboard med plan-generator og visuell nedtelling
"use client";

import { useEffect, useState } from "react";

interface Debt {
  id: string;
  name: string;
  type: string;
  balance: number;
  interestRate: number;
  minimumPayment: number;
  isFocus: boolean;
}

interface Plan {
  method: string;
  totalMonths: number;
  totalInterestPaid: number;
  interestSaved: number;
  payoffDate: string;
}

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.debtzero.app/v1";

export default function DebtDashboardPage() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [method, setMethod] = useState<"avalanche" | "snowball">("avalanche");
  const [extra, setExtra] = useState(200);

  useEffect(() => {
    setDebts([
      { id: "1", name: "Studielån", type: "student_loan", balance: 82000, interestRate: 4.5, minimumPayment: 450, isFocus: false },
      { id: "2", name: "Visa kredittkort", type: "credit_card", balance: 15000, interestRate: 24.9, minimumPayment: 300, isFocus: true },
      { id: "3", name: "Billån", type: "car_loan", balance: 5000, interestRate: 6.0, minimumPayment: 200, isFocus: false },
    ]);
    setPlan({ method: "avalanche", totalMonths: 42, totalInterestPaid: 18200, interestSaved: 12400, payoffDate: "2029-08-15" });
  }, []);

  const totalDebt = debts.reduce((s, d) => s + d.balance, 0);
  const totalPaid = 102000 - totalDebt;
  const pctPaid = Math.round((totalPaid / 102000) * 100);

  const generatePlan = async () => {
    try {
      const res = await fetch(`${API}/plans/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer demo" },
        body: JSON.stringify({ method, extraMonthly: extra }),
      });
      if (res.ok) setPlan(await res.json());
    } catch {}
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8 max-w-4xl mx-auto">
      {/* Total Progress */}
      <section className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-8 text-white shadow-lg mb-6">
        <p className="text-sm opacity-80">Total gjeld</p>
        <h1 className="text-4xl font-bold mt-1">${totalDebt.toLocaleString()}</h1>
        <div className="w-full bg-white/20 rounded-full h-4 mt-4">
          <div className="bg-emerald-400 h-4 rounded-full transition-all" style={{ width: `${pctPaid}%` }} />
        </div>
        <div className="flex justify-between mt-2 text-sm opacity-70">
          <span>{pctPaid}% betalt</span>
          <span>Gjeldfri: {plan?.payoffDate || "beregner..."}</span>
        </div>
      </section>

      {/* Debt List */}
      <section className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <h2 className="text-lg font-bold mb-4">Dine gjelder</h2>
        <div className="space-y-3">
          {debts.sort((a, b) => b.interestRate - a.interestRate).map((debt) => (
            <div key={debt.id} className="flex items-center justify-between p-4 rounded-xl border hover:bg-slate-50 transition">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{debt.name}</h3>
                  {debt.isFocus && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-600">
                      FOKUS
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {debt.interestRate}% rente · ${debt.minimumPayment}/mnd minimum
                </p>
              </div>
              <span className="text-xl font-bold text-red-500">${debt.balance.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Plan Generator */}
      <section className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <h2 className="text-lg font-bold mb-4">Nedbetalingsplan</h2>
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setMethod("avalanche")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${method === "avalanche" ? "bg-indigo-600 text-white" : "bg-gray-100"}`}
          >
            Skred (lavest rente)
          </button>
          <button
            onClick={() => setMethod("snowball")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${method === "snowball" ? "bg-indigo-600 text-white" : "bg-gray-100"}`}
          >
            Snøball (lavest saldo)
          </button>
        </div>
        <div className="flex items-center gap-3 mb-4">
          <label className="text-sm">Ekstra/mnd:</label>
          <input
            type="number"
            value={extra}
            onChange={(e) => setExtra(Number(e.target.value))}
            className="border rounded-lg px-3 py-2 w-28 text-sm"
          />
          <button onClick={generatePlan} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
            Beregn
          </button>
        </div>
        {plan && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Stat label="Metode" value={plan.method} />
            <Stat label="Tid til gjeldfri" value={`${plan.totalMonths} mnd`} />
            <Stat label="Total rente" value={`$${plan.totalInterestPaid.toLocaleString()}`} />
            <Stat label="Rente spart" value={`$${plan.interestSaved.toLocaleString()}`} accent />
          </div>
        )}
      </section>

      {/* Milestone */}
      <section className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold mb-2">Neste milepæl</h2>
        <p className="text-gray-500">Betal av Visa kredittkort → spar $8,200 i renter</p>
        <button className="mt-3 bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 transition">
          Registrer betaling
        </button>
      </section>
    </main>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="text-center p-3 rounded-lg bg-slate-50">
      <p className="text-xs text-gray-400">{label}</p>
      <p className={`text-lg font-bold ${accent ? "text-emerald-500" : ""}`}>{value}</p>
    </div>
  );
}
