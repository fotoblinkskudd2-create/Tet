"use client";

interface Meal {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface MealCardProps {
  day: string;
  meals: {
    breakfast: Meal;
    lunch: Meal;
    dinner: Meal;
    snack: Meal;
  };
  totalCalories: number;
}

/** Displays a single day's meal plan */
export default function MealCard({ day, meals, totalCalories }: MealCardProps) {
  return (
    <div className="bg-white rounded-xl border p-5 hover:shadow-md transition">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-800">{day}</h3>
        <span className="text-sm font-mono text-primary-600">
          {totalCalories} kcal
        </span>
      </div>

      <div className="space-y-3">
        <MealRow label="Frokost" meal={meals.breakfast} />
        <MealRow label="Lunsj" meal={meals.lunch} />
        <MealRow label="Middag" meal={meals.dinner} />
        <MealRow label="Snack" meal={meals.snack} />
      </div>
    </div>
  );
}

function MealRow({ label, meal }: { label: string; meal: Meal }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
      <div>
        <p className="text-xs text-slate-400 uppercase tracking-wide">
          {label}
        </p>
        <p className="text-sm font-medium">{meal.name}</p>
      </div>
      <span className="font-mono text-xs text-slate-500">
        {meal.calories} kcal
      </span>
    </div>
  );
}
