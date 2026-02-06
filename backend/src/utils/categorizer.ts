// Auto-kategorisering basert på nøkkelord i transaksjonstekst
// Matches common Norwegian merchants/descriptions to categories

interface CategoryRule {
  keywords: string[];
  categoryId: string;
}

const rules: CategoryRule[] = [
  // Mat og dagligvarer
  {
    keywords: ['rema', 'kiwi', 'meny', 'bunnpris', 'coop', 'extra', 'spar', 'joker', 'dagligvare', 'matbutikk', 'oda.com'],
    categoryId: 'cat_mat',
  },
  // Transport
  {
    keywords: ['skyss', 'bybanen', 'vy', 'nsb', 'tog', 'buss', 'taxi', 'uber', 'bensin', 'circle k', 'esso', 'shell', 'parkering'],
    categoryId: 'cat_transport',
  },
  // Restaurant
  {
    keywords: ['restaurant', 'café', 'kafé', 'pizza', 'sushi', 'burger', 'mcdonald', 'foodora', 'wolt', 'just eat'],
    categoryId: 'cat_restaurant',
  },
  // Bolig
  {
    keywords: ['husleie', 'leie', 'bolig', 'lån', 'boliglån', 'felleskost', 'kommunale'],
    categoryId: 'cat_husleie',
  },
  // Strøm
  {
    keywords: ['strøm', 'tibber', 'fjordkraft', 'hafslund', 'lyse', 'bkk'],
    categoryId: 'cat_strom',
  },
  // Telefon/Internett
  {
    keywords: ['telenor', 'telia', 'ice', 'altibox', 'get', 'tele2', 'mycall'],
    categoryId: 'cat_telefon',
  },
  // Abonnementer
  {
    keywords: ['netflix', 'spotify', 'hbo', 'viaplay', 'disney+', 'youtube', 'apple', 'adobe', 'microsoft'],
    categoryId: 'cat_abonnement',
  },
  // Forsikring
  {
    keywords: ['forsikring', 'gjensidige', 'if ', 'tryg', 'storebrand', 'frende', 'dnb forsikring'],
    categoryId: 'cat_forsikring',
  },
  // Trening
  {
    keywords: ['sats', 'treningssenter', 'fitness', 'evo', '3t'],
    categoryId: 'cat_trening',
  },
  // Klær
  {
    keywords: ['h&m', 'zara', 'cubus', 'dressmann', 'stormberg', 'xxl', 'sport 1', 'klær'],
    categoryId: 'cat_klær',
  },
  // Helse
  {
    keywords: ['apotek', 'lege', 'tannlege', 'sykehus', 'helfo', 'helsestasjon', 'fysioterapi', 'psykolog'],
    categoryId: 'cat_helse',
  },
  // Lønn
  {
    keywords: ['lønn', 'salary', 'lønnsutbetaling', 'arbeidsgiver'],
    categoryId: 'cat_lonn',
  },
  // Feriepenger
  {
    keywords: ['feriepenger', 'feriepengeutbetaling'],
    categoryId: 'cat_feriepenger',
  },
  // BSU
  {
    keywords: ['bsu', 'boligsparing'],
    categoryId: 'cat_bsu',
  },
  // Fagforening
  {
    keywords: ['fagforening', 'lo ', 'nito', 'tekna', 'unio', 'akademikerne', 'fellesforbundet'],
    categoryId: 'cat_fagforening',
  },
  // Reise
  {
    keywords: ['flybillett', 'hotel', 'airbnb', 'booking.com', 'sas', 'norwegian', 'widerøe'],
    categoryId: 'cat_reise',
  },
  // Gave
  {
    keywords: ['gave', 'present', 'blomster'],
    categoryId: 'cat_gave',
  },
];

export function suggestCategory(description: string): string | null {
  const lower = description.toLowerCase();

  for (const rule of rules) {
    for (const keyword of rule.keywords) {
      if (lower.includes(keyword)) {
        return rule.categoryId;
      }
    }
  }

  return null;
}

export function suggestCategories(description: string): string[] {
  const lower = description.toLowerCase();
  const matches: string[] = [];

  for (const rule of rules) {
    for (const keyword of rule.keywords) {
      if (lower.includes(keyword)) {
        if (!matches.includes(rule.categoryId)) {
          matches.push(rule.categoryId);
        }
        break;
      }
    }
  }

  return matches;
}
