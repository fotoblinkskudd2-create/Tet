// SendFair Backend — FX engine, transfer quotes, Stellar settlement, payout routing
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import crypto from "crypto";
import { z } from "zod";

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());

// Mid-market rates (in production: real-time from CurrencyLayer/ECB)
const midRates: Record<string, Record<string, number>> = {
  USD: { MXN: 17.15, KES: 153.20, INR: 83.10, PHP: 55.80, NGN: 1520.00, GBP: 0.79, EUR: 0.92, BDT: 110.50 },
  GBP: { KES: 194.00, INR: 105.20, NGN: 1920.00, USD: 1.27, EUR: 1.17 },
  EUR: { MAD: 10.85, TRY: 34.20, USD: 1.09, GBP: 0.86 },
  AED: { INR: 22.65, PKR: 76.20, PHP: 15.20, BDT: 30.10 },
};

// Competitor fee comparison
const competitorFees: Record<string, number> = {
  "Western Union": 0.08,
  "MoneyGram": 0.065,
  "Wise": 0.015,
  "Remitly": 0.025,
};

function getRate(from: string, to: string): number | null {
  return midRates[from]?.[to] || null;
}

function auth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  (req as any).userId = token;
  next();
}

const quoteSchema = z.object({
  sendCurrency: z.string().length(3),
  receiveCurrency: z.string().length(3),
  sendAmount: z.number().positive().max(10000),
  payoutMethod: z.enum(["bank", "mobile_money", "cash", "wallet"]).optional(),
});

// Quote engine: calculates receive amount, fee, delivery time, and competitor comparison
app.post("/v1/transfers/quote", auth, (req: Request, res: Response) => {
  const parsed = quoteSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { sendCurrency, receiveCurrency, sendAmount, payoutMethod = "bank" } = parsed.data;
  const rate = getRate(sendCurrency, receiveCurrency);
  if (!rate) return res.status(400).json({ error: `Corridor ${sendCurrency}→${receiveCurrency} not supported` });

  const ourRate = rate * 0.998; // 0.2% margin
  const fee = sendAmount <= 500 ? 0.99 : sendAmount * 0.005;
  const netSend = sendAmount - fee;
  const receiveAmount = netSend * ourRate;

  const deliveryMinutes: Record<string, number> = { bank: 60, mobile_money: 5, cash: 120, wallet: 2 };
  const estimatedMinutes = deliveryMinutes[payoutMethod] || 60;

  const competitorComparison = Object.entries(competitorFees).map(([name, feeRate]) => ({
    name,
    theirFee: Math.round(sendAmount * feeRate * 100) / 100,
    theirReceive: Math.round((sendAmount - sendAmount * feeRate) * rate * 0.97 * 100) / 100,
    yourSavings: Math.round((sendAmount * feeRate - fee + (ourRate - rate * 0.97) * netSend) * 100) / 100,
  }));

  res.json({
    sendAmount,
    sendCurrency,
    receiveAmount: Math.round(receiveAmount * 100) / 100,
    receiveCurrency,
    exchangeRate: ourRate,
    midMarketRate: rate,
    fee,
    feePercentage: Math.round((fee / sendAmount) * 10000) / 100,
    payoutMethod,
    estimatedDeliveryMinutes: estimatedMinutes,
    estimatedDelivery: estimatedMinutes < 60 ? `${estimatedMinutes} minutter` : `${Math.ceil(estimatedMinutes / 60)} time(r)`,
    competitorComparison,
    expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  });
});

// Create and process transfer
interface Transfer {
  id: string;
  senderId: string;
  recipientId: string;
  sendAmount: number;
  sendCurrency: string;
  receiveAmount: number;
  receiveCurrency: string;
  fee: number;
  exchangeRate: number;
  payoutMethod: string;
  status: string;
  stellarTxHash: string | null;
  createdAt: Date;
}

const transfers: Map<string, Transfer> = new Map();

app.post("/v1/transfers/create", auth, (req: Request, res: Response) => {
  const { recipientId, sendAmount, sendCurrency, receiveCurrency, payoutMethod = "bank" } = req.body;

  const rate = getRate(sendCurrency, receiveCurrency);
  if (!rate) return res.status(400).json({ error: "Unsupported corridor" });

  const fee = sendAmount <= 500 ? 0.99 : sendAmount * 0.005;
  const ourRate = rate * 0.998;
  const receiveAmount = (sendAmount - fee) * ourRate;

  const transfer: Transfer = {
    id: crypto.randomUUID(),
    senderId: (req as any).userId,
    recipientId,
    sendAmount,
    sendCurrency,
    receiveAmount: Math.round(receiveAmount * 100) / 100,
    receiveCurrency,
    fee,
    exchangeRate: ourRate,
    payoutMethod,
    status: "processing",
    stellarTxHash: `stellar_${crypto.randomBytes(16).toString("hex")}`,
    createdAt: new Date(),
  };

  transfers.set(transfer.id, transfer);

  // Simulate async settlement
  setTimeout(() => {
    const t = transfers.get(transfer.id);
    if (t) t.status = "delivered";
  }, 5000);

  res.status(201).json(transfer);
});

app.get("/v1/transfers/:id/status", auth, (req: Request, res: Response) => {
  const transfer = transfers.get(req.params.id);
  if (!transfer) return res.status(404).json({ error: "Transfer not found" });
  res.json(transfer);
});

app.get("/v1/transfers/history", auth, (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const userTransfers = Array.from(transfers.values())
    .filter((t) => t.senderId === userId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  res.json(userTransfers);
});

// Live exchange rates with competitor comparison
app.get("/v1/rates/:from/:to", (req: Request, res: Response) => {
  const rate = getRate(req.params.from, req.params.to);
  if (!rate) return res.status(404).json({ error: "Currency pair not found" });

  res.json({
    from: req.params.from,
    to: req.params.to,
    midMarketRate: rate,
    ourRate: rate * 0.998,
    updatedAt: new Date().toISOString(),
  });
});

// Available corridors
app.get("/v1/corridors", (_req: Request, res: Response) => {
  const corridors = Object.entries(midRates).flatMap(([from, tos]) =>
    Object.keys(tos).map((to) => ({
      from,
      to,
      payoutMethods: ["bank", "mobile_money", "cash"],
      minAmount: 10,
      maxAmount: 10000,
    })),
  );
  res.json(corridors);
});

app.get("/health", (_req, res) => res.json({ status: "ok", service: "sendfair-api" }));

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => console.log(`SendFair API on port ${PORT}`));

export default app;
