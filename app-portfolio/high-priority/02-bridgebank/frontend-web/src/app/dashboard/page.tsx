// BridgeBank Web — Dashboard med kontooversikt, overføringer og agentfinner
"use client";

import { useEffect, useState } from "react";

interface Account {
  id: string;
  accountNumber: string;
  balance: number;
  currency: string;
  tier: string;
}

interface Transaction {
  id: string;
  amount: number;
  type: string;
  description: string;
  date: string;
}

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.bridgebank.app/v1";

async function apiFetch<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

export default function DashboardPage() {
  const [account, setAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [sendPhone, setSendPhone] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [sendStatus, setSendStatus] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("bb_token") || "demo";
    Promise.all([
      apiFetch<Account>("/accounts/me", token),
      apiFetch<Transaction[]>("/transfers/history", token),
    ])
      .then(([a, t]) => { setAccount(a); setTransactions(t); })
      .catch(() => {
        setAccount({ id: "demo", accountNumber: "BB-1234-5678", balance: 12450, currency: "KES", tier: "basic" });
        setTransactions([
          { id: "1", amount: -500, type: "debit", description: "Sendt til Amina", date: "2026-02-23" },
          { id: "2", amount: 2000, type: "credit", description: "Innskudd via agent", date: "2026-02-22" },
          { id: "3", amount: -150, type: "debit", description: "Safaricom airtime", date: "2026-02-21" },
        ]);
      });
  }, []);

  const handleSend = async () => {
    setSendStatus("Sender...");
    try {
      const token = localStorage.getItem("bb_token") || "demo";
      await fetch(`${API}/transfers/p2p`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ phone: sendPhone, amount: parseFloat(sendAmount) }),
      });
      setSendStatus("Sendt!");
      setSendPhone("");
      setSendAmount("");
    } catch {
      setSendStatus("Feil ved sending");
    }
  };

  return (
    <main className="min-h-screen bg-amber-50 p-4 md:p-8 max-w-4xl mx-auto">
      {/* Balance Card */}
      {account && (
        <section className="bg-gradient-to-br from-teal-600 to-teal-800 rounded-2xl p-8 text-white shadow-lg mb-6">
          <p className="text-sm opacity-80">Din saldo</p>
          <h1 className="text-4xl font-bold mt-1">
            {account.currency} {account.balance.toLocaleString("en", { minimumFractionDigits: 2 })}
          </h1>
          <p className="text-xs opacity-60 mt-2">Konto: {account.accountNumber} · Tier: {account.tier}</p>
        </section>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { icon: "↑", label: "Send", color: "bg-teal-100 text-teal-700" },
          { icon: "↓", label: "Motta", color: "bg-green-100 text-green-700" },
          { icon: "💰", label: "Spare", color: "bg-amber-100 text-amber-700" },
          { icon: "📍", label: "Agent", color: "bg-blue-100 text-blue-700" },
        ].map((a) => (
          <button key={a.label} className={`${a.color} rounded-xl p-4 text-center font-medium hover:opacity-80 transition`}>
            <span className="text-2xl block">{a.icon}</span>
            <span className="text-xs">{a.label}</span>
          </button>
        ))}
      </div>

      {/* Send Money */}
      <section className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <h2 className="text-lg font-bold mb-4">Send penger</h2>
        <div className="flex gap-3">
          <input
            placeholder="Telefonnummer"
            value={sendPhone}
            onChange={(e) => setSendPhone(e.target.value)}
            className="flex-1 border rounded-lg px-3 py-2 text-sm"
          />
          <input
            placeholder="Beløp"
            type="number"
            value={sendAmount}
            onChange={(e) => setSendAmount(e.target.value)}
            className="w-28 border rounded-lg px-3 py-2 text-sm"
          />
          <button onClick={handleSend} className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition">
            Send
          </button>
        </div>
        {sendStatus && <p className="text-sm mt-2 text-gray-500">{sendStatus}</p>}
      </section>

      {/* Transactions */}
      <section className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold mb-4">Siste transaksjoner</h2>
        <div className="space-y-3">
          {transactions.map((txn) => (
            <div key={txn.id} className="flex items-center justify-between py-2 border-b last:border-0">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${txn.amount > 0 ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                  {txn.amount > 0 ? "↓" : "↑"}
                </div>
                <div>
                  <p className="text-sm font-medium">{txn.description}</p>
                  <p className="text-xs text-gray-400">{txn.date}</p>
                </div>
              </div>
              <span className={`font-semibold text-sm ${txn.amount > 0 ? "text-green-600" : "text-gray-900"}`}>
                {txn.amount > 0 ? "+" : ""}{txn.amount.toLocaleString("en", { minimumFractionDigits: 2 })}
              </span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
