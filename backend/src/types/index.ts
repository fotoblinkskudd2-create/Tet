import { Request } from "express";

export interface AuthPayload {
  userId: string;
  email: string;
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

export interface RegisterBody {
  email: string;
  password: string;
  name: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface HealthProfileBody {
  heightCm: number;
  goalWeightKg: number;
  activityLevel: "SEDENTARY" | "LIGHT" | "MODERATE" | "ACTIVE" | "VERY_ACTIVE";
  birthDate: string;
  sex: "MALE" | "FEMALE" | "OTHER";
}

export interface FoodLogBody {
  foodId: string;
  amount: number;
  unit?: string;
  mealType: "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";
  date: string;
}

export interface WeightLogBody {
  weightKg: number;
  date: string;
  note?: string;
}

export interface NutritionSummary {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}
