import { v4 as uuid } from 'uuid';
import { suggestCategory } from './categorizer';

export interface CsvTransaction {
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  categoryId: string | null;
}

interface ParseResult {
  transactions: CsvTransaction[];
  errors: string[];
  format: string;
}

// Norwegian date DD.MM.YYYY -> YYYY-MM-DD
function parseNorwegianDate(dateStr: string): string | null {
  const trimmed = dateStr.trim();

  // DD.MM.YYYY
  const dotMatch = trimmed.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (dotMatch) {
    const [, day, month, year] = dotMatch;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  // DD.MM.YY
  const shortMatch = trimmed.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2})$/);
  if (shortMatch) {
    const [, day, month, yr] = shortMatch;
    const year = parseInt(yr) > 50 ? `19${yr}` : `20${yr}`;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  // YYYY-MM-DD (already ISO)
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) return trimmed;

  return null;
}

// Parse Norwegian number format: "1 234,56" or "-1234,56"
function parseNorwegianNumber(numStr: string): number | null {
  const cleaned = numStr
    .trim()
    .replace(/\s/g, '')   // remove space thousands separator
    .replace(/\./g, '')    // remove dot thousands separator
    .replace(',', '.');    // comma decimal -> dot decimal

  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

// Detect CSV format from header row
function detectFormat(header: string): { format: string; delimiter: string } {
  const lower = header.toLowerCase();

  if (lower.includes('bokførtdato') || lower.includes('bokført dato')) {
    return { format: 'sbanken', delimiter: ';' };
  }
  if (lower.includes('transaksjonsdato') && lower.includes('beløp')) {
    return { format: 'sparebanken_vest', delimiter: ';' };
  }
  if (lower.includes('dato') && lower.includes('forklaring')) {
    return { format: 'dnb', delimiter: ';' };
  }

  // Fallback: generic Norwegian bank CSV
  const delimiter = header.includes(';') ? ';' : ',';
  return { format: 'generic', delimiter };
}

function parseSbanken(lines: string[], delimiter: string): ParseResult {
  const transactions: CsvTransaction[] = [];
  const errors: string[] = [];

  // Sbanken: Bokførtdato;Rentedato;Arkivref;Type;Tekst;Ut av konto;Inn på konto
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cols = line.split(delimiter);
    if (cols.length < 7) {
      errors.push(`Linje ${i + 1}: Ugyldig format`);
      continue;
    }

    const date = parseNorwegianDate(cols[0]);
    if (!date) {
      errors.push(`Linje ${i + 1}: Ugyldig dato "${cols[0]}"`);
      continue;
    }

    const description = cols[4].trim().replace(/"/g, '');
    const utAvKonto = parseNorwegianNumber(cols[5]);
    const innPåKonto = parseNorwegianNumber(cols[6]);

    let amount: number;
    let type: 'income' | 'expense';

    if (innPåKonto && innPåKonto > 0) {
      amount = innPåKonto;
      type = 'income';
    } else if (utAvKonto && utAvKonto !== 0) {
      amount = Math.abs(utAvKonto);
      type = 'expense';
    } else {
      errors.push(`Linje ${i + 1}: Kunne ikke lese beløp`);
      continue;
    }

    transactions.push({
      date,
      description,
      amount,
      type,
      categoryId: suggestCategory(description),
    });
  }

  return { transactions, errors, format: 'Sbanken' };
}

function parseSparebankenVest(lines: string[], delimiter: string): ParseResult {
  const transactions: CsvTransaction[] = [];
  const errors: string[] = [];

  // Sparebanken Vest: Transaksjonsdato;Beskrivelse;Beløp;...
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cols = line.split(delimiter);
    if (cols.length < 3) {
      errors.push(`Linje ${i + 1}: Ugyldig format`);
      continue;
    }

    const date = parseNorwegianDate(cols[0]);
    if (!date) {
      errors.push(`Linje ${i + 1}: Ugyldig dato "${cols[0]}"`);
      continue;
    }

    const description = cols[1].trim().replace(/"/g, '');
    const rawAmount = parseNorwegianNumber(cols[2]);
    if (rawAmount === null) {
      errors.push(`Linje ${i + 1}: Ugyldig beløp "${cols[2]}"`);
      continue;
    }

    transactions.push({
      date,
      description,
      amount: Math.abs(rawAmount),
      type: rawAmount >= 0 ? 'income' : 'expense',
      categoryId: suggestCategory(description),
    });
  }

  return { transactions, errors, format: 'Sparebanken Vest' };
}

function parseGeneric(lines: string[], delimiter: string): ParseResult {
  const transactions: CsvTransaction[] = [];
  const errors: string[] = [];

  const header = lines[0].toLowerCase().split(delimiter).map(h => h.trim().replace(/"/g, ''));
  const dateIdx = header.findIndex(h => h.includes('dato') || h === 'date');
  const descIdx = header.findIndex(h => h.includes('beskrivelse') || h.includes('tekst') || h.includes('forklaring') || h === 'description');
  const amountIdx = header.findIndex(h => h.includes('beløp') || h.includes('amount') || h.includes('sum'));
  const inIdx = header.findIndex(h => h.includes('inn') || h.includes('credit'));
  const outIdx = header.findIndex(h => h.includes('ut') || h.includes('debit'));

  if (dateIdx === -1 || descIdx === -1) {
    return { transactions: [], errors: ['Kunne ikke finne dato- og beskrivelseskolonner i CSV-filen'], format: 'Ukjent' };
  }

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cols = line.split(delimiter).map(c => c.trim().replace(/"/g, ''));
    const date = parseNorwegianDate(cols[dateIdx] || '');
    if (!date) {
      errors.push(`Linje ${i + 1}: Ugyldig dato`);
      continue;
    }

    const description = cols[descIdx] || '';
    let amount: number;
    let type: 'income' | 'expense';

    if (amountIdx !== -1) {
      const raw = parseNorwegianNumber(cols[amountIdx] || '0');
      if (raw === null) {
        errors.push(`Linje ${i + 1}: Ugyldig beløp`);
        continue;
      }
      amount = Math.abs(raw);
      type = raw >= 0 ? 'income' : 'expense';
    } else if (inIdx !== -1 && outIdx !== -1) {
      const inAmt = parseNorwegianNumber(cols[inIdx] || '0') || 0;
      const outAmt = parseNorwegianNumber(cols[outIdx] || '0') || 0;
      if (inAmt > 0) {
        amount = inAmt;
        type = 'income';
      } else {
        amount = Math.abs(outAmt);
        type = 'expense';
      }
    } else {
      errors.push(`Linje ${i + 1}: Finner ikke beløpskolonne`);
      continue;
    }

    transactions.push({
      date,
      description,
      amount,
      type,
      categoryId: suggestCategory(description),
    });
  }

  return { transactions, errors, format: 'Generisk' };
}

export function parseCsv(csvContent: string): ParseResult {
  const lines = csvContent.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) {
    return { transactions: [], errors: ['CSV-filen er tom eller har bare overskrifter'], format: 'Ukjent' };
  }

  const { format, delimiter } = detectFormat(lines[0]);

  switch (format) {
    case 'sbanken':
      return parseSbanken(lines, delimiter);
    case 'sparebanken_vest':
      return parseSparebankenVest(lines, delimiter);
    case 'dnb':
    case 'generic':
    default:
      return parseGeneric(lines, delimiter);
  }
}
