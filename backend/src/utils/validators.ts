import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Ugyldig e-postadresse"),
  password: z.string().min(8, "Passord må være minst 8 tegn"),
  name: z.string().min(1, "Navn er påkrevd").max(100),
});

export const loginSchema = z.object({
  email: z.string().email("Ugyldig e-postadresse"),
  password: z.string().min(1, "Passord er påkrevd"),
});

export const healthProfileSchema = z.object({
  heightCm: z.number().min(100).max(250),
  goalWeightKg: z.number().min(30).max(300),
  activityLevel: z.enum([
    "SEDENTARY",
    "LIGHT",
    "MODERATE",
    "ACTIVE",
    "VERY_ACTIVE",
  ]),
  birthDate: z.string().datetime({ offset: true }).or(z.string().date()),
  sex: z.enum(["MALE", "FEMALE", "OTHER"]),
});

export const foodLogSchema = z.object({
  foodId: z.string().uuid(),
  amount: z.number().positive(),
  unit: z.string().default("g"),
  mealType: z.enum(["BREAKFAST", "LUNCH", "DINNER", "SNACK"]),
  date: z.string().date(),
});

export const weightLogSchema = z.object({
  weightKg: z.number().min(20).max(500),
  date: z.string().date(),
  note: z.string().max(500).optional(),
});

export const foodSearchSchema = z.object({
  q: z.string().min(1).max(200),
});
