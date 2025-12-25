import { Router, Request, Response } from 'express';

const router = Router();

// Nordic mythology and death metal themed word banks
const nordicMyths = [
  'Ragnarok', 'Fenrir', 'Hel', 'Valkyrie', 'Yggdrasil', 'Jormungandr',
  'Valhalla', 'Odin', 'Thor', 'Loki', 'Midgard', 'Asgard', 'Niflheim',
  'Muspelheim', 'Nidhogg', 'Sleipnir', 'Mjolnir', 'Gungnir'
];

const grotesqueImagery = {
  no: [
    'bloddryppende', 'forrådnende', 'avrevne', 'knuste', 'splintrede',
    'slaktede', 'flådd', 'brennende', 'frosne', 'skjelvende',
    'kvalte', 'slitne', 'sønderrevne', 'forpinte', 'utmattede'
  ],
  en: [
    'blood-soaked', 'rotting', 'torn', 'crushed', 'splintered',
    'slaughtered', 'flayed', 'burning', 'frozen', 'trembling',
    'suffocated', 'weary', 'shredded', 'tormented', 'exhausted'
  ]
};

const deathMetalVerbs = {
  no: [
    'ødelegger', 'knuser', 'river', 'brenner', 'fryser', 'sluker',
    'flår', 'kaster', 'slakter', 'kveler', 'dreper', 'utsletter',
    'oppløser', 'tilintgjør', 'tilintetgjør', 'maler', 'splintrer'
  ],
  en: [
    'destroys', 'crushes', 'tears', 'burns', 'freezes', 'devours',
    'flays', 'casts', 'slaughters', 'strangles', 'kills', 'obliterates',
    'dissolves', 'annihilates', 'eradicates', 'grinds', 'splinters'
  ]
};

const darkNouns = {
  no: [
    'mørket', 'avgrunnen', 'helvete', 'døden', 'øde', 'forfall',
    'ragnarok', 'kaos', 'lidelse', 'pine', 'fortvilelse', 'vanvidd',
    'tomhet', 'fortapelsen', 'underverden', 'skyggen', 'aske'
  ],
  en: [
    'darkness', 'abyss', 'hell', 'death', 'desolation', 'decay',
    'ragnarok', 'chaos', 'suffering', 'torment', 'despair', 'madness',
    'emptiness', 'damnation', 'underworld', 'shadow', 'ash'
  ]
};

// YouTube video IDs for brutal metal songs
const brutalMetalVideos = [
  'qR7U1HIhxfA', // Amon Amarth - Twilight Of The Thunder God
  'JFYVcz7h3o0', // Arch Enemy - Nemesis
  'zqIzIkJbvq8', // Bloodbath - Eaten
  '5aaOqUYG8Tw', // Cannibal Corpse - Hammer Smashed Face
  'XP7-CaWmP0o', // Dimmu Borgir - Progenies Of The Great Apocalypse
  'iijKLHCQw5o', // Behemoth - Ov Fire and the Void
  '4CSFkjPm0A0', // At The Gates - Slaughter of the Soul
  'Ndu33Uv7Ub0', // Carcass - Heartwork
  '_Mbxe33BYW8', // Gojira - Backbone
  'z8ZqFlw6hYg', // Meshuggah - Bleed
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generateNorwegianVerse(theme: string): string {
  const adjective = getRandomElement(grotesqueImagery.no);
  const verb = getRandomElement(deathMetalVerbs.no);
  const noun = getRandomElement(darkNouns.no);
  const myth = getRandomElement(nordicMyths);

  const templates = [
    `I ${noun}s dype skygge
${adjective} ${theme} ${verb}
${myth}s vrede raser frem
Gjennom blod og aske`,

    `${myth} kaller fra avgrunnen
${adjective} sjeler ${verb} i ${noun}
${theme.toUpperCase()} - evig pine
Mørket sluker alt`,

    `Fra ${noun}s rike stiger
${adjective} ${theme}, ${verb} alt
${myth}s hammer knuser
Håp til splinter, blod til is`,

    `${theme.toUpperCase()}!
${adjective} og forlatt
${myth} ${verb} ${noun}
Ragnarok - den siste natt`,

    `I nordlysets blodige glød
${adjective} ${theme} ${verb}
${myth}s skygge faller
Over ${noun}s domene`,
  ];

  return getRandomElement(templates);
}

function generateEnglishVerse(theme: string): string {
  const adjective = getRandomElement(grotesqueImagery.en);
  const verb = getRandomElement(deathMetalVerbs.en);
  const noun = getRandomElement(darkNouns.en);
  const myth = getRandomElement(nordicMyths);

  const templates = [
    `In the shadow of ${noun}
${adjective} ${theme} ${verb}
${myth}'s wrath unleashed
Through blood and ash`,

    `${myth} calls from the abyss
${adjective} souls ${verb} in ${noun}
${theme.toUpperCase()} - eternal torment
Darkness consumes all`,

    `From ${noun}'s realm arises
${adjective} ${theme}, ${verb} everything
${myth}'s hammer crushes
Hope to splinters, blood to ice`,

    `${theme.toUpperCase()}!
${adjective} and forsaken
${myth} ${verb} ${noun}
Ragnarok - the final night`,

    `In the aurora's crimson glow
${adjective} ${theme} ${verb}
${myth}'s shadow falls
Upon ${noun}'s domain`,
  ];

  return getRandomElement(templates);
}

function generateLyrics(themes: string[], language: 'no' | 'en'): string {
  const numVerses = 3 + Math.floor(Math.random() * 2); // 3-4 verses
  const verses: string[] = [];

  // Title
  const title = language === 'no'
    ? `"${themes[0].toUpperCase()} I MØRKET"`
    : `"${themes[0].toUpperCase()} IN DARKNESS"`;

  verses.push(title);
  verses.push('═'.repeat(50));
  verses.push('');

  // Generate verses
  for (let i = 0; i < numVerses; i++) {
    const theme = getRandomElement(themes);
    const verse = language === 'no'
      ? generateNorwegianVerse(theme)
      : generateEnglishVerse(theme);

    verses.push(`[Verse ${i + 1}]`);
    verses.push(verse);
    verses.push('');

    // Add chorus after verse 1 and 3
    if (i === 0 || i === 2) {
      const chorusTheme = themes[0];
      const myth = getRandomElement(nordicMyths);
      const noun = getRandomElement(darkNouns[language]);

      const chorus = language === 'no'
        ? `[Refreng]
${chorusTheme.toUpperCase()}! ${chorusTheme.toUpperCase()}!
${myth} ${getRandomElement(deathMetalVerbs.no)}!
I ${noun}, vi ${getRandomElement(deathMetalVerbs.no)}!
${chorusTheme.toUpperCase()}! Evig ${noun}!`
        : `[Chorus]
${chorusTheme.toUpperCase()}! ${chorusTheme.toUpperCase()}!
${myth} ${getRandomElement(deathMetalVerbs.en)}!
In ${noun}, we ${getRandomElement(deathMetalVerbs.en)}!
${chorusTheme.toUpperCase()}! Eternal ${noun}!`;

      verses.push(chorus);
      verses.push('');
    }
  }

  // Outro
  const myth = getRandomElement(nordicMyths);
  const outro = language === 'no'
    ? `[Outro]
${myth}... ${myth}...
Mørket tar oss alle...
${themes[0]}... for evig...`
    : `[Outro]
${myth}... ${myth}...
Darkness takes us all...
${themes[0]}... forever...`;

  verses.push(outro);
  verses.push('');
  verses.push('═'.repeat(50));
  verses.push('🔥💀 DØDSMETAL 💀🔥');

  return verses.join('\n');
}

router.post('/generate', (req: Request, res: Response) => {
  try {
    const { themes: themesInput, language = 'no' } = req.body;

    if (!themesInput || typeof themesInput !== 'string') {
      return res.status(400).json({
        lyrics: language === 'no'
          ? 'Mangler temaer. Skriv inn temaer separert med komma.'
          : 'Missing themes. Enter themes separated by commas.',
      });
    }

    // Parse themes from comma-separated string
    const themes = themesInput
      .split(',')
      .map((t: string) => t.trim())
      .filter((t: string) => t.length > 0);

    if (themes.length === 0) {
      return res.status(400).json({
        lyrics: language === 'no'
          ? 'Må ha minst ett tema.'
          : 'Must have at least one theme.',
      });
    }

    // Generate lyrics
    const lyrics = generateLyrics(themes, language as 'no' | 'en');

    // Pick a random brutal metal video
    const youtubeId = getRandomElement(brutalMetalVideos);

    res.json({
      lyrics,
      language,
      themes,
      youtubeId,
    });
  } catch (error) {
    res.status(500).json({
      lyrics: 'En feil oppstod under genereringen. / An error occurred during generation.',
      error: (error as Error).message,
    });
  }
});

export default router;
