// Norwegian formatting utilities

export function formatNOK(amount: number): string {
  const abs = Math.abs(amount);
  const [whole, decimals] = abs.toFixed(2).split('.');
  const formatted = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${amount < 0 ? '-' : ''}${formatted},${decimals} kr`;
}

export function formatDateNO(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  return `${day}.${month}.${year}`;
}

export function parseNorwegianDate(dateStr: string): string | null {
  const match = dateStr.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (match) {
    const [, day, month, year] = match;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  return null;
}

const monthNames = [
  'januar', 'februar', 'mars', 'april', 'mai', 'juni',
  'juli', 'august', 'september', 'oktober', 'november', 'desember'
];

export function formatMonthNO(month: number): string {
  return monthNames[month - 1] || '';
}

export function formatMonthYearNO(year: number, month: number): string {
  return `${monthNames[month - 1]} ${year}`;
}
