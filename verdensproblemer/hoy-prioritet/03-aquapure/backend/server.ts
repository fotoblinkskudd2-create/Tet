// AquaPure Backend — Express + TypeScript med vannkvalitet, rapporter og sensordata
import express, { Request, Response } from "express";
import cors from "cors";
import { randomUUID } from "crypto";

const PORT = process.env.PORT || 3001;
const app = express();
app.use(cors());
app.use(express.json());

// --- Types ---

interface WaterReport {
  id: string;
  userId?: string;
  lat: number;
  lng: number;
  type: string;
  severity: number;
  description: string;
  photoUrl?: string;
  verified: boolean;
  createdAt: string;
}

interface SensorReading {
  sensorId: string;
  timestamp: string;
  ph: number;
  chlorine: number;
  turbidity: number;
  bacteriaCount: number;
  temp: number;
}

// --- Seed data ---

const reports: WaterReport[] = [
  {
    id: "rpt_1", lat: -6.801, lng: 37.702, type: "contamination", severity: 7,
    description: "Vannet er brunt og har sterk lukt etter regnstorm",
    verified: true, createdAt: "2026-02-23T10:00:00Z",
  },
  {
    id: "rpt_2", lat: -6.815, lng: 37.710, type: "disease", severity: 9,
    description: "Flere barn i landsbyen har diaré siste uke — mistenker vannkilden",
    verified: false, createdAt: "2026-02-24T08:00:00Z",
  },
  {
    id: "rpt_3", lat: -6.790, lng: 37.695, type: "shortage", severity: 6,
    description: "Brønnen har vært tørr i 3 dager",
    verified: true, createdAt: "2026-02-22T14:00:00Z",
  },
];

function generateSensorReadings(sensorId: string, hours: number): SensorReading[] {
  const readings: SensorReading[] = [];
  const now = Date.now();
  for (let i = hours; i >= 0; i--) {
    readings.push({
      sensorId,
      timestamp: new Date(now - i * 3600000).toISOString(),
      ph: 6.5 + Math.random() * 2.5,
      chlorine: 0.1 + Math.random() * 0.5,
      turbidity: 1 + Math.random() * 8,
      bacteriaCount: Math.floor(Math.random() * 100),
      temp: 22 + Math.random() * 6,
    });
  }
  return readings;
}

const sensorReadings = generateSensorReadings("sensor_001", 48);

// --- Haversine ---

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// --- Reports ---

app.get("/v1/reports", (req: Request, res: Response) => {
  const lat = parseFloat(req.query.lat as string) || -6.8;
  const lng = parseFloat(req.query.lng as string) || 37.7;
  const radius = parseFloat(req.query.r as string) || 10;

  const nearby = reports
    .filter((r) => haversineKm(lat, lng, r.lat, r.lng) <= radius)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((r) => ({
      id: r.id, lat: r.lat, lng: r.lng, type: r.type,
      severity: r.severity, description: r.description,
      photo_url: r.photoUrl, verified: r.verified,
      created_at: r.createdAt,
    }));

  res.json(nearby);
});

app.post("/v1/reports", (req: Request, res: Response) => {
  const { lat, lng, type, severity, description, photo_url } = req.body;
  if (!lat || !lng || !type || !severity || !description) {
    return res.status(400).json({ error: "Missing required fields: lat, lng, type, severity, description" });
  }

  const report: WaterReport = {
    id: `rpt_${randomUUID().slice(0, 8)}`,
    lat, lng, type, severity, description,
    photoUrl: photo_url,
    verified: false,
    createdAt: new Date().toISOString(),
  };
  reports.push(report);
  res.status(201).json({
    id: report.id, lat: report.lat, lng: report.lng, type: report.type,
    severity: report.severity, description: report.description,
    photo_url: report.photoUrl, verified: report.verified,
    created_at: report.createdAt,
  });
});

app.get("/v1/reports/:id", (req: Request, res: Response) => {
  const report = reports.find((r) => r.id === req.params.id);
  if (!report) return res.status(404).json({ error: "Not found" });
  res.json(report);
});

// --- Quality ---

app.get("/v1/quality", (req: Request, res: Response) => {
  const latest = sensorReadings[sensorReadings.length - 1];
  const safetyLevel =
    latest.ph >= 6.5 && latest.ph <= 8.5 && latest.turbidity < 4 && latest.bacteriaCount < 10
      ? "safe"
      : latest.turbidity < 10 && latest.bacteriaCount < 50
      ? "moderate"
      : "unsafe";

  res.json({
    safety_level: safetyLevel,
    ph: Math.round(latest.ph * 100) / 100,
    chlorine: Math.round(latest.chlorine * 1000) / 1000,
    turbidity: Math.round(latest.turbidity * 10) / 10,
    last_updated: latest.timestamp,
  });
});

// --- Sensors ---

app.get("/v1/sensors/:id/readings", (req: Request, res: Response) => {
  const hours = parseInt(req.query.hours as string) || 24;
  const cutoff = new Date(Date.now() - hours * 3600000).toISOString();
  const filtered = sensorReadings
    .filter((r) => r.sensorId === req.params.id && r.timestamp >= cutoff)
    .map((r) => ({
      sensor_id: r.sensorId, timestamp: r.timestamp,
      ph: Math.round(r.ph * 100) / 100,
      chlorine: Math.round(r.chlorine * 1000) / 1000,
      turbidity: Math.round(r.turbidity * 10) / 10,
      bacteria_count: r.bacteriaCount,
      temp: Math.round(r.temp * 10) / 10,
    }));
  res.json(filtered);
});

// --- Admin heatmap ---

app.get("/v1/admin/heatmap", (_req: Request, res: Response) => {
  const heatPoints = reports.map((r) => ({
    lat: r.lat,
    lng: r.lng,
    weight: r.severity,
  }));
  res.json({ points: heatPoints });
});

// --- Health ---

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", reports: reports.length, sensors: 1 });
});

app.listen(PORT, () => console.log(`AquaPure API on port ${PORT}`));
export default app;
