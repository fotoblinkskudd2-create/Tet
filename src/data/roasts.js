// Roast messages organized by context, persona, and level
export const roasts = {
  // Daily greeting roasts
  dailyGreeting: {
    success: {
      soft: [
        'Greit, du er faktisk ikke helt håpløs i dag.',
        'Se der ja, du klarte å stå opp. Det er en start.',
        'Ikke verst. Du har faktisk gjort noe produktivt.',
        'Du har overrasket meg positivt. Ikke vær uvant.',
      ],
      normal: [
        'Ok, du har faktisk levert. Fortsett sånn.',
        'Du beviser at du kan når du gidder. Gid oftere.',
        'Greit, kanskje du ikke er helt fortapt likevel.',
        'Solid dag. Klarer du å holde det gående?',
      ],
      brutal: [
        'Ikke bli for komfortabel. Én god dag betyr ingenting.',
        'Greit. Nå gjør det samme i morgen, og dagen etter, og...',
        'Wow, du oppførte deg som et funksjonelt menneske. Vil det vare?',
        'Bra. Nå har du satt standarden. Ikke skuff.',
      ],
    },
    failing: {
      soft: [
        'Kanskje i morgen går det bedre?',
        'Det er fortsatt tid til å snu dagen.',
        'Hmm, ikke den beste starten, men du kan komme tilbake.',
        'Dagen er ikke over enda. Prøv igjen?',
      ],
      normal: [
        'Du har scrolla mer enn du har levd. Gratulerer.',
        'Samme gamle deg, ser jeg. Kjedelig.',
        'Du lover mye, leverer lite. Som vanlig.',
        'Skal du faktisk gjøre noe i dag, eller...?',
      ],
      brutal: [
        'Du kaster bort dagen din som om du har uendelig med de.',
        'Patetisk. Du vet hva du skal gjøre, men gjør det ikke.',
        'Du er mester i å finne unnskyldninger. Null resultater.',
        'Dagen din var en soft reboot av ingenting.',
      ],
    },
  },

  // Notification messages
  notifications: {
    morning: {
      soft: [
        'God morgen. Kanskje begynne dagen?',
        'Du sa du ville starte tidlig. Det var visst løgn.',
        'Morgenen går fort. Kanskje det er på tide?',
      ],
      normal: [
        'Du burde vært i gang for 2 timer siden. Hva skjer?',
        'Morgentaskene dine venter. De har mistet håpet.',
        'Sakte og late, det er ditt motto.',
      ],
      brutal: [
        'Alle andre har gjort noe produktivt. Du? Netflix?',
        'Du sa "new me". Så langt ser jeg bare "same Wi-Fi".',
        'Morgenen er bortkasta. Som vanlig.',
      ],
    },
    midday: {
      soft: [
        'Halvveis gjennom dagen. Ingenting gjort?',
        'Lunsj er fint, men kanskje gjør noe først?',
        'Tiden går, og du... scroller?',
      ],
      normal: [
        'Middag. Null tasks gjort. Imponerende unngåelse.',
        'Du har gjort akkurat ingenting. Er det planen?',
        'Det er fortsatt tid, men du kommer til å kaste bort den også.',
      ],
      brutal: [
        'Halvveis gjennom dagen og du har vært ubrukelig. Klassiker.',
        'Dagen din er allerede fucked. Vil du i det minste redde kvelden?',
        'Du burde skamme deg. Men det gjør du nok ikke.',
      ],
    },
    evening: {
      soft: [
        'Kvelden er her. Noen planer om å gjøre noe?',
        'Dagen forsvinner. Kanskje prøve litt?',
        'Siste sjanse til å redde dagen.',
      ],
      normal: [
        'Dagen din var en katastrofe. Prøv igjen i morgen?',
        'Null produktivitet. Null overraskelse.',
        'Du klarte å kaste bort en hel dag. Gratulerer.',
      ],
      brutal: [
        'Dagen din var en soft reboot av ingenting. Vil du prøve igjen i morgen?',
        'Du har fucka bort hele dagen. Føler du deg bra?',
        'Patetisk. Samme faenskap i morgen?',
      ],
    },
  },

  // Snooze messages
  snooze: {
    soft: [
      'Greit, jeg gir deg 10 minutter til.',
      'Utsettelse er en form for selvbedrag, men ok.',
      'Snooze igjen? Klassisk deg.',
    ],
    normal: [
      'Du har utsatt dette 5 ganger allerede. Patetisk.',
      'Snooze er ikke en strategi. Det er en felle.',
      'Jo mer du utsetter, jo verre blir det.',
    ],
    brutal: [
      'Utsett mer. Se hvor det tar deg. Spoiler: ingensteds.',
      'Du er en mester i unngåelse. Null respekt.',
      'Snooze er for tapere. Er det deg?',
    ],
  },

  // Stats summary roasts
  statsSummary: {
    poor: {
      soft: [
        'Ikke akkurat imponerende, men du kan forbedre deg.',
        'Litt svakt, men alle har dårlige uker.',
        'Rom for forbedring. Mye rom.',
      ],
      normal: [
        'Du holder bare løfter til Netflix.',
        'Konsistensen din er imponerende. Konsistent dårlig.',
        'Du er god på én ting: å feile.',
      ],
      brutal: [
        'Statistikken din er et monument over dårlige valg.',
        'Du er en case study i hvordan man IKKE gjør ting.',
        'Pinlig. Absolutt pinlig.',
      ],
    },
    average: {
      soft: [
        'Greit nok. Ikke fantastisk, men greit.',
        'Du gjør minimum. Akkurat nok til å ikke være håpløs.',
        'Middelmådig. Som alt annet du gjør.',
      ],
      normal: [
        '50/50. Ikke imponerende, ikke katastrofe.',
        'Du klarer halvparten. Den andre halvparten? Hvem vet.',
        'Mediocre er ditt mellomnavn.',
      ],
      brutal: [
        'Gjennomsnitt er for folk uten ambisjoner. Er det deg?',
        '50% er en F i de fleste sammenhenger.',
        'Du sikter lavt og treffer det hver gang.',
      ],
    },
    good: {
      soft: [
        'Bra! Faktisk bra.',
        'Du leverer. Godt jobba.',
        'Se der, du kan når du vil.',
      ],
      normal: [
        'Solid. Fortsett sånn.',
        'Ikke dårlig. Ikke dårlig i det hele tatt.',
        'Du har faktisk levert. Imponerende.',
      ],
      brutal: [
        'Greit. Ikke bli for komfortabel.',
        'Bra, men jeg forventer dette hver uke.',
        'Endelig leverer du. Fortsett.',
      ],
    },
  },

  // Leaderboard roasts
  leaderboard: {
    topTier: [
      'Functional Human',
      'Actually Trying',
      'Surprisingly Competent',
      'Above Average (Barely)',
    ],
    midTier: [
      'Mediocre and Proud',
      'Sometimes Functional',
      'Inconsistent at Best',
      'Could Try Harder',
    ],
    bottomTier: [
      'Chaos Goblin',
      'Walking Red Flag (Productivity Edition)',
      'Professional Procrastinator',
      'Master of Excuses',
      'Actively Avoiding Success',
    ],
  },

  // Panic redemption mode
  panicRedemption: {
    start: {
      soft: [
        'Greit, la oss se om du kan redde noe av dagen.',
        'Bedre sent enn aldri, antar jeg.',
        'Siste sjanse. Gjør noe med den.',
      ],
      normal: [
        'Panic mode? Du burde vært i panic for 6 timer siden.',
        'Ok, siste forsøk på å ikke være helt ubrukelig i dag.',
        'La oss se om du kan gjennomføre noe. Tviler.',
      ],
      brutal: [
        'Desperat? Bra. Kanskje det motiverer deg.',
        'Du har fucka hele dagen. Dette er hail Mary-pasningen din.',
        'Panic redemption? Mer som "patetisk forsøk nummer 47".',
      ],
    },
    success: {
      soft: [
        'Ok. Du redda dagen. Så vidt.',
        'Greit. Du klarte det. Fortsett sånn.',
        'Ikke dårlig. Du kom tilbake.',
      ],
      normal: [
        'Du fiksa det. Men hvorfor vente til siste sekund?',
        'Redda. Men du burde aldri vært i den situasjonen.',
        'Ok, du kan faktisk levere under press. Bra.',
      ],
      brutal: [
        'Du redda dagen. Men ikke gjør det til en vane å feile først.',
        'Greit. Men tenk hvis du startet sånn? Mind-blowing, jeg vet.',
        'Suksess. Nå gjør det fra starten av neste gang, dust.',
      ],
    },
    failure: {
      soft: [
        'Du prøvde i hvert fall. Det er noe.',
        'Ikke i dag. Kanskje i morgen?',
        'Du kom kort. Men du prøvde.',
      ],
      normal: [
        'Du klarte å feile på letteste vanskelighetsgrad.',
        'Selv når du virkelig prøver, leverer du ikke.',
        'Patetisk forsøk. Patetisk resultat.',
      ],
      brutal: [
        'Du klarte å fucke opp panic mode. Imponerende inkompetanse.',
        'Selv under press er du ubrukelig. Wow.',
        'Du er håpløs. Absolutt håpløs.',
      ],
    },
  },
};

export default roasts;
