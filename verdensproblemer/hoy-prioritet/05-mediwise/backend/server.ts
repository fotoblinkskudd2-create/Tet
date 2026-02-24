// MediWise Backend — Medications, reminders, interactions, and pill identification
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

interface Medication {
  id: string;
  userId: string;
  name: string;
  dosage: string;
  frequency: string;
  instructions?: string;
  active: boolean;
}

interface Reminder {
  id: string;
  medicationId: string;
  scheduledAt: string;
  confirmedAt: string | null;
}

// --- Seed data ---

const users = [
  { id: "user_1", email: "olav@test.com", passwordHash: "test123", name: "Olav Hansen", role: "patient" },
  { id: "user_2", email: "karin@test.com", passwordHash: "test123", name: "Karin Hansen", role: "caregiver" },
];

const medications: Medication[] = [
  { id: "med_1", userId: "user_1", name: "Metformin", dosage: "500mg", frequency: "2x daglig", instructions: "Ta med mat", active: true },
  { id: "med_2", userId: "user_1", name: "Warfarin", dosage: "5mg", frequency: "1x daglig", instructions: "Ta til fast tid", active: true },
  { id: "med_3", userId: "user_1", name: "Atorvastatin", dosage: "20mg", frequency: "1x daglig", instructions: "Ta om kvelden", active: true },
  { id: "med_4", userId: "user_1", name: "Lisinopril", dosage: "10mg", frequency: "1x daglig", active: true },
  { id: "med_5", userId: "user_1", name: "Omeprazol", dosage: "20mg", frequency: "1x daglig", instructions: "Ta 30 min før mat", active: true },
];

const reminders: Reminder[] = [
  { id: "rem_1", medicationId: "med_1", scheduledAt: new Date().toISOString(), confirmedAt: null },
  { id: "rem_2", medicationId: "med_2", scheduledAt: new Date().toISOString(), confirmedAt: null },
  { id: "rem_3", medicationId: "med_3", scheduledAt: new Date(Date.now() + 8 * 3600000).toISOString(), confirmedAt: null },
];

const caregiverLinks = [
  { caregiverId: "user_2", patientId: "user_1" },
];

// Known drug interactions database (simplified)
const knownInteractions = [
  {
    drugA: "Warfarin", drugB: "Metformin",
    severity: "low" as const,
    description: "Metformin kan påvirke Warfarin-effekten marginalt.",
    recommendation: "Overvåk INR-verdier regelmessig.",
  },
  {
    drugA: "Warfarin", drugB: "Omeprazol",
    severity: "moderate" as const,
    description: "Omeprazol kan øke Warfarin-nivåer og blødningsrisiko.",
    recommendation: "Kontakt legen din for dosejustering. Vurder alternativ syrehemmer.",
  },
];

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
  } catch { res.status(401).json({ error: "Invalid token" }); }
}

app.post("/v1/auth/login", (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email && u.passwordHash === password);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
});

// --- Medications ---

app.get("/v1/medications", authMiddleware, (req: AuthRequest, res: Response) => {
  const userMeds = medications.filter((m) => m.userId === req.userId && m.active);
  res.json(userMeds);
});

app.post("/v1/medications", authMiddleware, (req: AuthRequest, res: Response) => {
  const { name, dosage, frequency, instructions } = req.body;
  if (!name || !dosage || !frequency) {
    return res.status(400).json({ error: "name, dosage, and frequency are required" });
  }
  const med: Medication = {
    id: `med_${randomUUID().slice(0, 8)}`,
    userId: req.userId!,
    name, dosage, frequency,
    instructions: instructions || undefined,
    active: true,
  };
  medications.push(med);
  res.status(201).json(med);
});

app.delete("/v1/medications/:id", authMiddleware, (req: AuthRequest, res: Response) => {
  const med = medications.find((m) => m.id === req.params.id && m.userId === req.userId);
  if (!med) return res.status(404).json({ error: "Not found" });
  med.active = false;
  res.json({ deleted: true });
});

// --- Interactions ---

app.post("/v1/medications/interactions", authMiddleware, (req: AuthRequest, res: Response) => {
  const { medication_ids } = req.body;
  const userMeds = medications.filter((m) => medication_ids.includes(m.id));
  const found: typeof knownInteractions = [];

  for (let i = 0; i < userMeds.length; i++) {
    for (let j = i + 1; j < userMeds.length; j++) {
      const interaction = knownInteractions.find(
        (ki) =>
          (ki.drugA === userMeds[i].name && ki.drugB === userMeds[j].name) ||
          (ki.drugA === userMeds[j].name && ki.drugB === userMeds[i].name)
      );
      if (interaction) found.push(interaction);
    }
  }

  res.json(found);
});

// --- Pill Identification (mock) ---

app.post("/v1/medications/identify", authMiddleware, (req: AuthRequest, res: Response) => {
  // In production: receive image, run through CoreML/TensorFlow model or OpenAI Vision
  res.json({
    name: "Atorvastatin",
    dosage: "20mg",
    confidence: 0.94,
    description: "Hvit, oval tablett brukt til å senke kolesterol.",
    ndc: "0071-0157-23",
  });
});

// --- Reminders ---

app.get("/v1/reminders", authMiddleware, (req: AuthRequest, res: Response) => {
  const userMedIds = medications.filter((m) => m.userId === req.userId).map((m) => m.id);
  const userReminders = reminders
    .filter((r) => userMedIds.includes(r.medicationId))
    .map((r) => {
      const med = medications.find((m) => m.id === r.medicationId);
      return {
        id: r.id,
        medication_id: r.medicationId,
        medication_name: med?.name || "Ukjent",
        scheduled_at: r.scheduledAt,
        confirmed_at: r.confirmedAt,
      };
    });
  res.json(userReminders);
});

app.put("/v1/reminders/:id/confirm", authMiddleware, (req: AuthRequest, res: Response) => {
  const reminder = reminders.find((r) => r.id === req.params.id);
  if (!reminder) return res.status(404).json({ error: "Not found" });
  reminder.confirmedAt = new Date().toISOString();
  res.json({ confirmed: true, confirmed_at: reminder.confirmedAt });
});

// --- Adherence Report ---

app.get("/v1/reports/adherence", authMiddleware, (req: AuthRequest, res: Response) => {
  const userMedIds = medications.filter((m) => m.userId === req.userId).map((m) => m.id);
  const userReminders = reminders.filter((r) => userMedIds.includes(r.medicationId));
  const total = userReminders.length;
  const confirmed = userReminders.filter((r) => r.confirmedAt).length;

  res.json({
    total_reminders: total,
    confirmed: confirmed,
    adherence_rate: total > 0 ? Math.round((confirmed / total) * 100) : 0,
    period: "last_30_days",
    medications: medications
      .filter((m) => m.userId === req.userId && m.active)
      .map((m) => ({ name: m.name, dosage: m.dosage })),
  });
});

// --- Caregiver ---

app.get("/v1/caregivers/dependents", authMiddleware, (req: AuthRequest, res: Response) => {
  const links = caregiverLinks.filter((l) => l.caregiverId === req.userId);
  const dependents = links.map((l) => {
    const patient = users.find((u) => u.id === l.patientId);
    return { id: patient?.id, name: patient?.name };
  });
  res.json(dependents);
});

app.get("/v1/caregivers/dependents/:id/status", authMiddleware, (req: AuthRequest, res: Response) => {
  const link = caregiverLinks.find((l) => l.caregiverId === req.userId && l.patientId === req.params.id);
  if (!link) return res.status(403).json({ error: "Not authorized" });

  const patientMeds = medications.filter((m) => m.userId === req.params.id && m.active);
  const patientMedIds = patientMeds.map((m) => m.id);
  const todayReminders = reminders.filter((r) => patientMedIds.includes(r.medicationId));

  res.json({
    patient_name: users.find((u) => u.id === req.params.id)?.name,
    medications_count: patientMeds.length,
    today_doses: todayReminders.length,
    doses_taken: todayReminders.filter((r) => r.confirmedAt).length,
    doses_missed: todayReminders.filter((r) => !r.confirmedAt && new Date(r.scheduledAt) < new Date()).length,
  });
});

// --- Health ---

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", medications: medications.length });
});

app.listen(PORT, () => console.log(`MediWise API on port ${PORT}`));
export default app;
