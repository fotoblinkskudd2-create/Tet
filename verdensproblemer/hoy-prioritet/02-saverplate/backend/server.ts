// SaverPlate Backend — Express + TypeScript med listings, orders og geo-søk
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { randomUUID } from "crypto";
import jwt from "jsonwebtoken";

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const app = express();
app.use(cors());
app.use(express.json());

// --- Types ---

interface User {
  id: string;
  email: string;
  name: string;
  role: "buyer" | "seller" | "admin";
  passwordHash: string;
}

interface StoreListing {
  id: string;
  storeId: string;
  storeName: string;
  lat: number;
  lng: number;
  title: string;
  description: string;
  originalPrice: number;
  price: number;
  quantityAvailable: number;
  pickupStart: string;
  pickupEnd: string;
  imageUrl?: string;
  createdAt: string;
}

interface Order {
  id: string;
  buyerId: string;
  listingId: string;
  quantity: number;
  totalPrice: number;
  status: "pending" | "confirmed" | "picked_up" | "cancelled";
  createdAt: string;
}

// --- In-memory DB ---

const users: User[] = [
  { id: "user_1", email: "buyer@test.com", name: "Test Buyer", role: "buyer", passwordHash: "test123" },
  { id: "user_2", email: "seller@test.com", name: "Baker Hansen", role: "seller", passwordHash: "test123" },
];

const listings: StoreListing[] = [
  {
    id: "lst_1", storeId: "user_2", storeName: "Baker Hansen",
    lat: 59.912, lng: 10.752, title: "Brød-bag",
    description: "3 baguetter + 2 kanelboller — ferske fra i dag",
    originalPrice: 120, price: 39, quantityAvailable: 5,
    pickupStart: "2026-02-24T17:00:00Z", pickupEnd: "2026-02-24T19:00:00Z",
    createdAt: new Date().toISOString(),
  },
  {
    id: "lst_2", storeId: "user_2", storeName: "Baker Hansen",
    lat: 59.915, lng: 10.748, title: "Kake-bag",
    description: "2 sjokoladekaker + 1 gulrotkake",
    originalPrice: 200, price: 69, quantityAvailable: 3,
    pickupStart: "2026-02-24T16:00:00Z", pickupEnd: "2026-02-24T18:00:00Z",
    createdAt: new Date().toISOString(),
  },
];

const orders: Order[] = [];

// --- Auth ---

interface AuthRequest extends Request { userId?: string; userRole?: string; }

function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });
  try {
    const payload = jwt.verify(header.slice(7), JWT_SECRET) as { userId: string; role: string };
    req.userId = payload.userId;
    req.userRole = payload.role;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

app.post("/v1/auth/login", (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email && u.passwordHash === password);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
});

// --- Geo helper (Haversine) ---

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// --- Listings ---

app.get("/v1/listings", (req: Request, res: Response) => {
  const lat = parseFloat(req.query.lat as string) || 59.91;
  const lng = parseFloat(req.query.lng as string) || 10.75;
  const radius = parseFloat(req.query.r as string) || 5;

  const nearby = listings
    .filter((l) => l.quantityAvailable > 0)
    .map((l) => ({ ...l, distanceKm: haversineKm(lat, lng, l.lat, l.lng) }))
    .filter((l) => l.distanceKm <= radius)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  const formatted = nearby.map((l) => ({
    id: l.id,
    store: { id: l.storeId, name: l.storeName, lat: l.lat, lng: l.lng },
    title: l.title,
    description: l.description,
    original_price: l.originalPrice,
    price: l.price,
    quantity_available: l.quantityAvailable,
    pickup_start: l.pickupStart,
    pickup_end: l.pickupEnd,
    image_url: l.imageUrl,
    distance_km: Math.round(l.distanceKm * 100) / 100,
  }));

  res.json({ listings: formatted, total: formatted.length });
});

app.get("/v1/listings/:id", (req: Request, res: Response) => {
  const listing = listings.find((l) => l.id === req.params.id);
  if (!listing) return res.status(404).json({ error: "Not found" });
  res.json(listing);
});

app.post("/v1/listings", authMiddleware, (req: AuthRequest, res: Response) => {
  if (req.userRole !== "seller") return res.status(403).json({ error: "Sellers only" });
  const { title, description, original_price, price, quantity_available, pickup_start, pickup_end, lat, lng } = req.body;
  const listing: StoreListing = {
    id: `lst_${randomUUID().slice(0, 8)}`,
    storeId: req.userId!,
    storeName: users.find((u) => u.id === req.userId)?.name || "Ukjent",
    lat, lng, title, description,
    originalPrice: original_price,
    price,
    quantityAvailable: quantity_available,
    pickupStart: pickup_start,
    pickupEnd: pickup_end,
    createdAt: new Date().toISOString(),
  };
  listings.push(listing);
  res.status(201).json(listing);
});

// --- Orders ---

app.post("/v1/orders", authMiddleware, (req: AuthRequest, res: Response) => {
  const { listing_id, quantity } = req.body;
  const listing = listings.find((l) => l.id === listing_id);
  if (!listing) return res.status(404).json({ error: "Listing not found" });
  if (listing.quantityAvailable < quantity) return res.status(400).json({ error: "Not enough available" });

  listing.quantityAvailable -= quantity;

  const order: Order = {
    id: `ord_${randomUUID().slice(0, 8)}`,
    buyerId: req.userId!,
    listingId: listing_id,
    quantity,
    totalPrice: listing.price * quantity,
    status: "confirmed",
    createdAt: new Date().toISOString(),
  };
  orders.push(order);
  res.status(201).json(order);
});

app.get("/v1/orders", authMiddleware, (req: AuthRequest, res: Response) => {
  const userOrders = orders.filter((o) => o.buyerId === req.userId);
  res.json(userOrders);
});

app.put("/v1/orders/:id/pickup", authMiddleware, (req: AuthRequest, res: Response) => {
  const order = orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });
  order.status = "picked_up";
  res.json(order);
});

// --- Health ---

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", listings: listings.length, orders: orders.length });
});

app.listen(PORT, () => console.log(`SaverPlate API on port ${PORT}`));
export default app;
