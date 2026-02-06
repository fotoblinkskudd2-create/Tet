import type { Category } from './types'

export const SYSTEM_CATEGORIES: Category[] = [
  { id: 'cat-mat', name: 'Mat og dagligvarer', icon: '🛒', color: '#22c55e', isSystem: true },
  { id: 'cat-transport', name: 'Transport', icon: '🚌', color: '#3b82f6', isSystem: true },
  { id: 'cat-bolig', name: 'Bolig og husleie', icon: '🏠', color: '#8b5cf6', isSystem: true },
  { id: 'cat-strom', name: 'Strøm og nett', icon: '⚡', color: '#eab308', isSystem: true },
  { id: 'cat-helse', name: 'Helse', icon: '🏥', color: '#ef4444', isSystem: true },
  { id: 'cat-underholdning', name: 'Underholdning', icon: '🎬', color: '#f97316', isSystem: true },
  { id: 'cat-klaer', name: 'Klær og sko', icon: '👕', color: '#ec4899', isSystem: true },
  { id: 'cat-restaurant', name: 'Restaurant og uteliv', icon: '🍽️', color: '#d946ef', isSystem: true },
  { id: 'cat-trening', name: 'Trening og sport', icon: '💪', color: '#14b8a6', isSystem: true },
  { id: 'cat-forsikring', name: 'Forsikring', icon: '🛡️', color: '#6366f1', isSystem: true },
  { id: 'cat-abonnement', name: 'Abonnement', icon: '📱', color: '#0ea5e9', isSystem: true },
  { id: 'cat-sparing', name: 'Sparing og BSU', icon: '🏦', color: '#10b981', isSystem: true },
  { id: 'cat-skattetrekk', name: 'Skattetrekk', icon: '📋', color: '#64748b', isSystem: true },
  { id: 'cat-feriepenger', name: 'Feriepenger', icon: '🌴', color: '#06b6d4', isSystem: true },
  { id: 'cat-lonn', name: 'Lønn', icon: '💰', color: '#22c55e', isSystem: true },
  { id: 'cat-annet', name: 'Annet', icon: '📦', color: '#94a3b8', isSystem: true },
]

const KEYWORD_MAP: Record<string, string> = {
  'meny': 'cat-mat', 'rema': 'cat-mat', 'kiwi': 'cat-mat', 'coop': 'cat-mat',
  'bunnpris': 'cat-mat', 'extra': 'cat-mat', 'spar': 'cat-mat', 'joker': 'cat-mat',
  'vy': 'cat-transport', 'skyss': 'cat-transport', 'bybanen': 'cat-transport',
  'circle k': 'cat-transport', 'bensin': 'cat-transport', 'parkering': 'cat-transport',
  'bompenger': 'cat-transport', 'flybuss': 'cat-transport',
  'husleie': 'cat-bolig', 'leie': 'cat-bolig', 'borettslag': 'cat-bolig',
  'strøm': 'cat-strom', 'bkk': 'cat-strom', 'tibber': 'cat-strom',
  'restaurant': 'cat-restaurant', 'cafe': 'cat-restaurant', 'kaffe': 'cat-restaurant',
  'starbucks': 'cat-restaurant', 'espresso': 'cat-restaurant',
  'netflix': 'cat-underholdning', 'spotify': 'cat-underholdning', 'hbo': 'cat-underholdning',
  'disney': 'cat-underholdning', 'kino': 'cat-underholdning',
  'sats': 'cat-trening', 'treningssenter': 'cat-trening', 'evo': 'cat-trening',
  'h&m': 'cat-klaer', 'zara': 'cat-klaer', 'cubus': 'cat-klaer', 'xxl': 'cat-klaer',
  'apotek': 'cat-helse', 'lege': 'cat-helse', 'tannlege': 'cat-helse',
  'forsikring': 'cat-forsikring', 'gjensidige': 'cat-forsikring',
  'lønn': 'cat-lonn', 'salary': 'cat-lonn',
  'skatt': 'cat-skattetrekk', 'skattetrekk': 'cat-skattetrekk',
  'feriepenger': 'cat-feriepenger',
  'bsu': 'cat-sparing', 'sparing': 'cat-sparing',
}

export function autoCategorize(description: string): string | null {
  const lower = description.toLowerCase()
  for (const [keyword, categoryId] of Object.entries(KEYWORD_MAP)) {
    if (lower.includes(keyword)) return categoryId
  }
  return null
}

export function getCategoryById(id: string): Category | undefined {
  return SYSTEM_CATEGORIES.find((c) => c.id === id)
}

export function getCategoryName(id: string): string {
  return getCategoryById(id)?.name ?? 'Ukjent'
}
