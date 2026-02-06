// Norwegian Bokmål translations
export const nb = {
  // Navigation
  nav: {
    dashboard: 'Oversikt',
    transactions: 'Transaksjoner',
    addTransaction: 'Ny transaksjon',
    accounts: 'Kontoer',
    budgets: 'Budsjetter',
    reports: 'Rapporter',
    settings: 'Innstillinger',
    logout: 'Logg ut',
  },

  // Auth
  auth: {
    login: 'Logg inn',
    register: 'Opprett konto',
    email: 'E-post',
    password: 'Passord',
    confirmPassword: 'Bekreft passord',
    name: 'Fullt navn',
    loginButton: 'Logg inn',
    registerButton: 'Opprett konto',
    loggingIn: 'Logger inn...',
    registering: 'Oppretter...',
    noAccount: 'Har du ikke konto?',
    hasAccount: 'Har du allerede en konto?',
    googleLogin: 'Logg inn med Google',
    forgotPassword: 'Glemt passord?',
  },

  // Dashboard
  dashboard: {
    title: 'Oversikt',
    totalBalance: 'Total saldo',
    monthlyIncome: 'Inntekt denne måneden',
    monthlyExpenses: 'Utgifter denne måneden',
    budgetProgress: 'Budsjettfremdrift',
    upcomingRecurring: 'Kommende faste utgifter',
    recentTransactions: 'Siste transaksjoner',
    incomeVsExpenses: 'Inntekt vs. utgifter',
    noData: 'Ingen data ennå. Legg til kontoer og transaksjoner for å se oversikten.',
  },

  // Accounts
  accounts: {
    title: 'Kontoer',
    addAccount: 'Legg til konto',
    accountName: 'Kontonavn',
    accountType: 'Kontotype',
    bankName: 'Bank',
    balance: 'Saldo',
    types: {
      checking: 'Brukskonto',
      savings: 'Sparekonto',
      credit: 'Kredittkort',
      bsu: 'BSU',
    },
  },

  // Transactions
  transactions: {
    title: 'Transaksjoner',
    addTransaction: 'Ny transaksjon',
    description: 'Beskrivelse',
    amount: 'Beløp',
    date: 'Dato',
    category: 'Kategori',
    account: 'Konto',
    type: 'Type',
    tags: 'Etiketter',
    notes: 'Notater',
    receipt: 'Kvittering',
    income: 'Inntekt',
    expense: 'Utgift',
    transfer: 'Overføring',
    search: 'Søk i transaksjoner...',
    noTransactions: 'Ingen transaksjoner funnet',
    splitTransaction: 'Del transaksjon',
    importCsv: 'Importer fra CSV',
    uploadReceipt: 'Last opp kvittering',
    autoCategory: 'Foreslått kategori',
    showing: 'Viser',
    of: 'av',
    page: 'Side',
  },

  // Budgets
  budgets: {
    title: 'Budsjetter',
    addBudget: 'Nytt budsjett',
    category: 'Kategori',
    budgeted: 'Budsjettert',
    spent: 'Brukt',
    remaining: 'Gjenstår',
    month: 'Måned',
    year: 'År',
    noBudgets: 'Ingen budsjetter satt for denne måneden',
  },

  // Reports
  reports: {
    title: 'Rapporter',
    monthlyReport: 'Månedsrapport',
    annualReport: 'Årsrapport',
    netWorth: 'Nettoverdi',
    forecast: 'Prognose',
    export: 'Eksporter',
    exportCsv: 'Last ned CSV',
    exportPdf: 'Last ned PDF',
    taxSummary: 'Skattesammendrag',
    totalIncome: 'Total inntekt',
    totalExpenses: 'Totale utgifter',
    net: 'Netto',
  },

  // Settings
  settings: {
    title: 'Innstillinger',
    darkMode: 'Mørk modus',
    language: 'Språk',
    currency: 'Valuta',
    dateFormat: 'Datoformat',
    profile: 'Profil',
    security: 'Sikkerhet',
  },

  // Common
  common: {
    save: 'Lagre',
    cancel: 'Avbryt',
    delete: 'Slett',
    edit: 'Rediger',
    close: 'Lukk',
    loading: 'Laster...',
    error: 'Feil',
    success: 'Suksess',
    confirm: 'Bekreft',
    back: 'Tilbake',
    next: 'Neste',
    previous: 'Forrige',
    nok: 'kr',
    yes: 'Ja',
    no: 'Nei',
  },

  // Months
  months: [
    'Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Desember',
  ],
};

// Formatting helpers
export function formatNOK(amount: number): string {
  const abs = Math.abs(amount);
  const [whole, dec] = abs.toFixed(2).split('.');
  const formatted = whole.replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0'); // non-breaking space
  return `${amount < 0 ? '-' : ''}${formatted},${dec} kr`;
}

export function formatNOKShort(amount: number): string {
  const abs = Math.abs(amount);
  if (abs >= 1_000_000) {
    return `${amount < 0 ? '-' : ''}${(abs / 1_000_000).toFixed(1).replace('.', ',')} mill. kr`;
  }
  if (abs >= 10_000) {
    return `${amount < 0 ? '-' : ''}${Math.round(abs).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0')} kr`;
  }
  return formatNOK(amount);
}

export function formatDateNO(isoDate: string): string {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-');
  return `${day}.${month}.${year}`;
}

export function formatDateShort(isoDate: string): string {
  if (!isoDate) return '';
  const [, month, day] = isoDate.split('-');
  return `${day}.${month}`;
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}
