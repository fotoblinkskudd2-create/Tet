import { Router, Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import crypto from 'crypto';

interface VaultCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  dangerLevel: number;
}

interface VaultEntry {
  id: string;
  categoryId: string;
  title: string;
  question: string;
  answer: string;
  tags: string[];
  dangerLevel: number;
  warningText: string;
  viewCount: number;
}

interface UnlockSession {
  id: string;
  userId?: string;
  sessionToken: string;
  puzzleSolved: boolean;
  puzzleType: string;
  expiresAt: Date;
  createdAt: Date;
}

interface PuzzleDefinition {
  type: string;
  question: string;
  hint: string;
  solution: string;
}

// In-memory storage (in production, use database)
const categories = new Map<string, VaultCategory>();
const entries = new Map<string, VaultEntry>();
const unlockSessions = new Map<string, UnlockSession>();

const router = Router();

// Puzzle definitions
const PUZZLES: PuzzleDefinition[] = [
  {
    type: 'cipher',
    question: 'Dekrypter denne meldingen: "IRUERGHQ NQRZOHGJH DZDLWV"',
    hint: 'Caesar cipher med shift 3',
    solution: 'FORBIDDEN KNOWLEDGE AWAITS',
  },
  {
    type: 'riddle',
    question: 'Jeg er skjult fra de fleste, søkt av noen få. Jeg kan lyse eller forlede. Hva er jeg?',
    hint: 'Tenk på hva denne vaulten inneholder...',
    solution: 'KUNNSKAP',
  },
  {
    type: 'math',
    question: 'Løs: (13 × 7) + (21 × 3) - (8 × 4) = ?',
    hint: 'Vær nøye med regneoperasjonene',
    solution: '123',
  },
  {
    type: 'anagram',
    question: 'Løs anagrammet: "SKARP TUNIS MOK"',
    hint: 'Et ord relatert til hemmeligheter...',
    solution: 'KONSPIRASJON',
  },
];

// Initialize sample data
function initializeVault() {
  // Categories
  const cat1: VaultCategory = {
    id: uuid(),
    name: 'Konspirasjoner',
    description: 'Teorier som utfordrer det offisielle narrativet',
    icon: '🕵️',
    dangerLevel: 3,
  };
  const cat2: VaultCategory = {
    id: uuid(),
    name: 'Okkultisme',
    description: 'Skjulte mysterier og esoterisk kunnskap',
    icon: '🔮',
    dangerLevel: 4,
  };
  const cat3: VaultCategory = {
    id: uuid(),
    name: 'Ekstreme Filosofier',
    description: 'Radikale tankesystemer og ideologier',
    icon: '🧠',
    dangerLevel: 3,
  };
  const cat4: VaultCategory = {
    id: uuid(),
    name: 'Forbudt Vitenskap',
    description: 'Eksperimenter og kunnskap samfunnet skjuler',
    icon: '⚗️',
    dangerLevel: 5,
  };
  const cat5: VaultCategory = {
    id: uuid(),
    name: 'Gamle Hemmeligheter',
    description: 'Tapt kunnskap fra sivilisasjoner',
    icon: '📜',
    dangerLevel: 2,
  };

  categories.set(cat1.id, cat1);
  categories.set(cat2.id, cat2);
  categories.set(cat3.id, cat3);
  categories.set(cat4.id, cat4);
  categories.set(cat5.id, cat5);

  // Entries
  const entry1: VaultEntry = {
    id: uuid(),
    categoryId: cat1.id,
    title: 'Hvem kontrollerer egentlig økonomien?',
    question: 'Hvilke skjulte krefter styrer det globale finanssystemet?',
    answer: 'Dette er et dypt spørsmål som har blitt diskutert i århundrer. Sentralbanker, store finansinstitusjoner og internasjonale organisasjoner spiller alle viktige roller i det globale økonomiske systemet. Mens noen hevder at demokratisk valgte myndigheter har kontroll, argumenterer kritikere for at uformelle nettverk av finanselite har uforholdsmessig innflytelse. Sannheten er sannsynligvis mer kompleks enn noen enkel konspirasjonsteori antyder - økonomisk makt er distribuert mellom mange aktører med både konkurrerende og overlappende interesser.',
    tags: ['økonomi', 'sentralbanker', 'finanselite'],
    dangerLevel: 3,
    warningText: '⚠️ Dette innholdet presenterer alternative perspektiver som kan utfordre etablerte syn',
    viewCount: 0,
  };

  const entry2: VaultEntry = {
    id: uuid(),
    categoryId: cat2.id,
    title: 'Hva er kaosmagi?',
    question: 'Forklar prinsippene bak kaosmagi og dens praksis',
    answer: 'Kaosmagi er en moderne magisk tradisjon utviklet på 1970-tallet, særlig av Peter J. Carroll og Ray Sherwin. Den kombinerer elementer fra ulike okkulte tradisjoner med en pragmatisk, eksperimentell tilnærming. Hovedprinsippene inkluderer: belief as a tool (tro som et verktøy man kan skifte mellom), gnosis (endrede bevissthetsstater), sigilmagi (symbolsk manifestasjon av hensikt), og avvisning av dogmatiske systemer. Utøvere ser magi som en form for anvendt psykologi eller "nevroteknologi" heller enn bokstavelig overnaturlig kraft.',
    tags: ['magi', 'okkultisme', 'kaos'],
    dangerLevel: 4,
    warningText: '⚠️ ADVARSEL: Innhold om okkulte praksiser. Kun for studieformål.',
    viewCount: 0,
  };

  const entry3: VaultEntry = {
    id: uuid(),
    categoryId: cat3.id,
    title: 'Hva er nihilisme egentlig?',
    question: 'Utforsk de dypeste aspektene av nihilistisk filosofi',
    answer: 'Nihilisme er en filosofisk posisjon som hevder at livet mangler objektiv mening, formål eller iboende verdi. Utviklet av tenkere som Friedrich Nietzsche (som faktisk kritiserte nihilisme), hevder denne filosofien at tradisjonelle verdier og moralsystemer er grunnløse. Eksistensiell nihilisme antyder at individuelle liv mangler mening, mens moralsk nihilisme avviser objektiv moral. Men mange filosofer argumenterer for at erkjennelse av nihilisme kan være et utgangspunkt for å skape personlig mening heller enn å ende i fortvilelse - en posisjon Nietzsche fremmet gjennom konsepter som "Übermensch" og "evig gjenkomst".',
    tags: ['filosofi', 'eksistensialisme', 'mening'],
    dangerLevel: 3,
    warningText: '⚠️ Dette innholdet utforsker mørke filosofiske konsepter',
    viewCount: 0,
  };

  entries.set(entry1.id, entry1);
  entries.set(entry2.id, entry2);
  entries.set(entry3.id, entry3);
}

initializeVault();

// Helper to verify unlock session
function verifyUnlockSession(token: string): boolean {
  const session = [...unlockSessions.values()].find(s => s.sessionToken === token);
  if (!session) return false;
  if (!session.puzzleSolved) return false;
  if (new Date() > session.expiresAt) return false;
  return true;
}

// Routes

// Get a random puzzle
router.get('/puzzle', (req: Request, res: Response) => {
  const randomPuzzle = PUZZLES[Math.floor(Math.random() * PUZZLES.length)];
  res.json({
    type: randomPuzzle.type,
    question: randomPuzzle.question,
    hint: randomPuzzle.hint,
  });
});

// Submit puzzle solution
router.post('/unlock', (req: Request, res: Response) => {
  const { solution, puzzleType } = req.body;

  if (!solution) {
    return res.status(400).json({ error: 'Solution is required' });
  }

  const puzzle = PUZZLES.find(p => p.type === puzzleType);
  if (!puzzle) {
    return res.status(400).json({ error: 'Invalid puzzle type' });
  }

  const normalizedSolution = String(solution).trim().toUpperCase();
  const normalizedAnswer = puzzle.solution.trim().toUpperCase();

  if (normalizedSolution === normalizedAnswer) {
    // Create unlock session
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const unlockSession: UnlockSession = {
      id: uuid(),
      sessionToken,
      puzzleSolved: true,
      puzzleType: puzzle.type,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      createdAt: new Date(),
    };

    unlockSessions.set(unlockSession.id, unlockSession);

    res.json({
      success: true,
      sessionToken,
      message: '🔓 TILGANG INNVILGET. Velkommen til den Forbudte Kunnskapens Hvelv.',
      expiresAt: unlockSession.expiresAt,
    });
  } else {
    res.status(403).json({
      success: false,
      message: '❌ FEIL LØSNING. Hvelvet forblir låst.',
    });
  }
});

// Verify unlock status
router.get('/verify/:token', (req: Request, res: Response) => {
  const { token } = req.params;
  const isValid = verifyUnlockSession(token);

  res.json({
    unlocked: isValid,
  });
});

// Get all categories (requires unlock)
router.get('/categories', (req: Request, res: Response) => {
  const token = req.headers['x-vault-token'] as string;

  if (!verifyUnlockSession(token)) {
    return res.status(403).json({ error: 'Vault is locked. Solve the puzzle first.' });
  }

  res.json(Array.from(categories.values()));
});

// Get all entries (requires unlock)
router.get('/entries', (req: Request, res: Response) => {
  const token = req.headers['x-vault-token'] as string;

  if (!verifyUnlockSession(token)) {
    return res.status(403).json({ error: 'Vault is locked. Solve the puzzle first.' });
  }

  const categoryId = req.query.categoryId as string | undefined;
  let results = Array.from(entries.values());

  if (categoryId) {
    results = results.filter(e => e.categoryId === categoryId);
  }

  res.json(results);
});

// Get single entry (requires unlock)
router.get('/entries/:id', (req: Request, res: Response) => {
  const token = req.headers['x-vault-token'] as string;

  if (!verifyUnlockSession(token)) {
    return res.status(403).json({ error: 'Vault is locked. Solve the puzzle first.' });
  }

  const { id } = req.params;
  const entry = entries.get(id);

  if (!entry) {
    return res.status(404).json({ error: 'Entry not found' });
  }

  // Increment view count
  entry.viewCount++;
  entries.set(id, entry);

  res.json(entry);
});

export default router;
