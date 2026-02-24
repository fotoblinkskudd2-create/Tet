type Sex = "MALE" | "FEMALE" | "OTHER";
type Activity = "SEDENTARY" | "LIGHT" | "MODERATE" | "ACTIVE" | "VERY_ACTIVE";

const ACTIVITY_MULTIPLIERS: Record<Activity, number> = {
  SEDENTARY: 1.2,
  LIGHT: 1.375,
  MODERATE: 1.55,
  ACTIVE: 1.725,
  VERY_ACTIVE: 1.9,
};

/** Mifflin-St Jeor equation for BMR */
export function calculateBMR(
  weightKg: number,
  heightCm: number,
  ageYears: number,
  sex: Sex
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;
  return sex === "MALE" ? base + 5 : base - 161;
}

/** Total Daily Energy Expenditure */
export function calculateTDEE(bmr: number, activity: Activity): number {
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activity]);
}

/** Daily calorie target for weight loss (~0.5 kg/week = 500 kcal deficit) */
export function calculateDailyTarget(
  tdee: number,
  goalType: "lose" | "maintain" | "gain" = "lose"
): number {
  switch (goalType) {
    case "lose":
      return Math.max(1200, tdee - 500);
    case "gain":
      return tdee + 300;
    default:
      return tdee;
  }
}

export function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
}

export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}
