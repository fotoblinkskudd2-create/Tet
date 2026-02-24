// BridgeBank Backend — Double-entry ledger, P2P transfers, USSD handler
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import crypto from "crypto";
import { z } from "zod";

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- In-memory ledger (replace with PostgreSQL + Prisma in production) ---
interface Account {
  id: string;
  userId: string;
  accountNumber: string;
  balance: number;
  currency: string;
  tier: string;
  status: string;
}

interface LedgerEntry {
  id: string;
  transactionId: string;
  accountId: string;
  type: "debit" | "credit";
  amount: number;
  balanceAfter: number;
  description: string;
  createdAt: Date;
}

const accounts: Map<string, Account> = new Map();
const ledger: LedgerEntry[] = [];

function getOrCreateAccount(userId: string): Account {
  let acc = accounts.get(userId);
  if (!acc) {
    acc = {
      id: crypto.randomUUID(),
      userId,
      accountNumber: `BB-${Math.random().toString().slice(2, 6)}-${Math.random().toString().slice(2, 6)}`,
      balance: 10000,
      currency: "KES",
      tier: "basic",
      status: "active",
    };
    accounts.set(userId, acc);
  }
  return acc;
}

// Atomic double-entry transfer between two accounts
function executeTransfer(fromId: string, toId: string, amount: number, desc: string): string {
  const from = accounts.get(fromId);
  const to = accounts.get(toId);
  if (!from || !to) throw new Error("Account not found");
  if (from.balance < amount) throw new Error("Insufficient funds");

  const txnId = crypto.randomUUID();
  from.balance -= amount;
  to.balance += amount;

  ledger.push(
    { id: crypto.randomUUID(), transactionId: txnId, accountId: from.id, type: "debit", amount, balanceAfter: from.balance, description: desc, createdAt: new Date() },
    { id: crypto.randomUUID(), transactionId: txnId, accountId: to.id, type: "credit", amount, balanceAfter: to.balance, description: desc, createdAt: new Date() },
  );
  return txnId;
}

// --- Auth middleware ---
function auth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  const account = getOrCreateAccount(token);
  (req as any).userId = token;
  (req as any).account = account;
  next();
}

// --- Routes ---

app.get("/v1/accounts/me", auth, (req: Request, res: Response) => {
  const acc = (req as any).account;
  res.json({ id: acc.id, accountNumber: acc.accountNumber, balance: acc.balance, currency: acc.currency, tier: acc.tier });
});

app.get("/v1/accounts/me/balance", auth, (req: Request, res: Response) => {
  res.json({ balance: (req as any).account.balance, currency: (req as any).account.currency });
});

const p2pSchema = z.object({
  phone: z.string().min(8),
  amount: z.number().positive(),
});

app.post("/v1/transfers/p2p", auth, (req: Request, res: Response) => {
  const parsed = p2pSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const recipientAccount = getOrCreateAccount(parsed.data.phone);
  try {
    const txnId = executeTransfer((req as any).userId, parsed.data.phone, parsed.data.amount, `P2P to ${parsed.data.phone}`);
    res.json({
      transactionId: txnId,
      amount: parsed.data.amount,
      recipient: parsed.data.phone,
      newBalance: (req as any).account.balance,
      status: "completed",
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/v1/transfers/history", auth, (req: Request, res: Response) => {
  const accId = (req as any).account.id;
  const entries = ledger
    .filter((e) => e.accountId === accId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 50)
    .map((e) => ({
      id: e.transactionId,
      amount: e.type === "credit" ? e.amount : -e.amount,
      type: e.type,
      description: e.description,
      date: e.createdAt.toISOString().split("T")[0],
      counterparty: null,
    }));
  res.json(entries);
});

// USSD callback handler — processes Africa's Talking USSD sessions
app.post("/v1/ussd/callback", (req: Request, res: Response) => {
  const { sessionId, phoneNumber, text } = req.body;
  const parts = (text || "").split("*");
  let response = "";

  if (text === "") {
    response = `CON Velkommen til BridgeBank\n1. Sjekk saldo\n2. Send penger\n3. Spare\n4. Lån\n5. Finn agent\n0. Hjelp`;
  } else if (parts[0] === "1") {
    const acc = getOrCreateAccount(phoneNumber);
    response = `END Din saldo er ${acc.currency} ${acc.balance.toFixed(2)}`;
  } else if (parts[0] === "2" && parts.length === 1) {
    response = `CON Tast mottakers telefonnummer:`;
  } else if (parts[0] === "2" && parts.length === 2) {
    response = `CON Tast beløp å sende til ${parts[1]}:`;
  } else if (parts[0] === "2" && parts.length === 3) {
    const amount = parseFloat(parts[2]);
    if (isNaN(amount) || amount <= 0) {
      response = `END Ugyldig beløp. Prøv igjen.`;
    } else {
      try {
        getOrCreateAccount(parts[1]);
        executeTransfer(phoneNumber, parts[1], amount, `USSD P2P to ${parts[1]}`);
        response = `END Sendt ${amount} til ${parts[1]}. Ny saldo: ${accounts.get(phoneNumber)?.balance.toFixed(2)}`;
      } catch {
        response = `END Feil: Ikke nok midler.`;
      }
    }
  } else if (parts[0] === "0") {
    response = `END BridgeBank hjelp: Ring 0800-BRIDGE eller besøk bridgebank.app`;
  } else {
    response = `END Ugyldig valg. Prøv igjen.`;
  }

  res.set("Content-Type", "text/plain");
  res.send(response);
});

app.get("/health", (_req, res) => res.json({ status: "ok", service: "bridgebank-api" }));

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`BridgeBank API running on port ${PORT}`));

export default app;
