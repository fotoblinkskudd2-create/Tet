"use client";

interface CalorieRingProps {
  consumed: number;
  target: number;
  size?: number;
}

/** Circular progress ring showing calories consumed vs target */
export default function CalorieRing({
  consumed,
  target,
  size = 180,
}: CalorieRingProps) {
  const percentage = Math.min((consumed / target) * 100, 100);
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const remaining = Math.max(target - consumed, 0);

  const color =
    consumed > target
      ? "#ef4444"
      : consumed > target * 0.8
        ? "#f97316"
        : "#22c55e";

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#f1f5f9"
          strokeWidth="12"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div
        className="absolute flex flex-col items-center justify-center"
        style={{ width: size, height: size }}
      >
        <span className="text-3xl font-bold font-mono text-slate-800">
          {consumed}
        </span>
        <span className="text-xs text-slate-400">av {target} kcal</span>
        <span className="text-sm font-medium mt-1" style={{ color }}>
          {remaining > 0 ? `${remaining} igjen` : "Over mål!"}
        </span>
      </div>
    </div>
  );
}
