"use client";

import { useState, useCallback } from "react";
import { api } from "@/lib/api";
import { useUserStore } from "@/stores/userStore";

interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingG: number;
}

interface FoodSearchProps {
  onSelect: (food: FoodItem) => void;
}

/** Searchable food lookup component with debounce */
export default function FoodSearch({ onSelect }: FoodSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FoodItem[]>([]);
  const [searching, setSearching] = useState(false);
  const token = useUserStore((s) => s.token);

  const search = useCallback(
    async (q: string) => {
      if (!q || q.length < 2 || !token) {
        setResults([]);
        return;
      }

      setSearching(true);
      try {
        const data = await api.food.search(token, q);
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    },
    [token]
  );

  let debounceTimer: NodeJS.Timeout;
  function handleChange(value: string) {
    setQuery(value);
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => search(value), 300);
  }

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Søk etter matvare..."
        className="w-full border rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
        aria-label="Søk etter matvare"
      />
      {searching && (
        <div className="absolute right-3 top-3 text-sm text-slate-400">
          Søker...
        </div>
      )}

      {results.length > 0 && (
        <ul className="absolute top-full left-0 right-0 bg-white border rounded-lg mt-1 shadow-lg max-h-64 overflow-y-auto z-10">
          {results.map((food) => (
            <li key={food.id}>
              <button
                onClick={() => {
                  onSelect(food);
                  setQuery("");
                  setResults([]);
                }}
                className="w-full text-left px-4 py-3 hover:bg-primary-50 transition flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-sm">{food.name}</p>
                  <p className="text-xs text-slate-400">
                    per {food.servingG}g
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-semibold text-primary-600">
                    {food.calories} kcal
                  </p>
                  <p className="text-xs text-slate-400">
                    P:{food.protein}g K:{food.carbs}g F:{food.fat}g
                  </p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
