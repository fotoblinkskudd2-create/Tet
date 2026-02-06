import { format, parse } from 'date-fns'
import { nb } from 'date-fns/locale'

export function formatNOK(amount: number): string {
  const formatted = new Intl.NumberFormat('nb-NO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount))
  const sign = amount < 0 ? '−' : ''
  return `${sign}${formatted} kr`
}

export function formatNumber(amount: number, decimals = 2): string {
  return new Intl.NumberFormat('nb-NO', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount)
}

export function formatDateNO(dateStr: string): string {
  const date = new Date(dateStr)
  return format(date, 'dd.MM.yyyy')
}

export function formatDateLong(dateStr: string): string {
  const date = new Date(dateStr)
  return format(date, 'd. MMMM yyyy', { locale: nb })
}

export function formatMonthYear(month: number, year: number): string {
  const date = new Date(year, month - 1, 1)
  return format(date, 'MMMM yyyy', { locale: nb })
}

export function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === today.toDateString()) return 'I dag'
  if (date.toDateString() === yesterday.toDateString()) return 'I går'
  return format(date, 'dd.MM.yyyy')
}

export function parseDateNO(dateStr: string): Date {
  return parse(dateStr, 'dd.MM.yyyy', new Date())
}

export function parseNorwegianAmount(str: string): number {
  const cleaned = str.replace(/\s/g, '').replace(',', '.')
  const num = parseFloat(cleaned)
  return isNaN(num) ? 0 : num
}

export function getCurrentPeriod(): { month: number; year: number } {
  const now = new Date()
  return { month: now.getMonth() + 1, year: now.getFullYear() }
}
