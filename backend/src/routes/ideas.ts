import { Router, Request, Response } from 'express';
import { v4 as uuid } from 'uuid';

interface IdeaCategory {
  name: string;
  description: string;
}

interface GeneratedIdea {
  id: string;
  title: string;
  description: string;
  categories: IdeaCategory[];
  details: {
    targetAudience: string;
    implementation: string[];
    monetization: string[];
    timeline: string;
    resources: string[];
  };
  affiliateOpportunities: {
    platforms: string[];
    strategies: string[];
    estimatedCommission: string;
  };
  createdAt: string;
  userId?: string;
}

const ideas = new Map<string, GeneratedIdea>();
const router = Router();

function generateRichIdea(keywords: string[], userId?: string): GeneratedIdea {
  const keywordText = keywords.join(', ');
  const primaryKeyword = keywords[0] || 'generell';

  const ideaId = uuid();
  const timestamp = new Date().toISOString();

  const categories: IdeaCategory[] = [
    { name: 'Digital', description: 'Nettbasert løsning med iOS-støtte' },
    { name: 'Innovativ', description: 'Moderne tilnærming til problemløsning' },
    { name: 'Brukervennlig', description: 'Optimalisert for mobil og web' }
  ];

  const idea: GeneratedIdea = {
    id: ideaId,
    title: `${primaryKeyword.charAt(0).toUpperCase() + primaryKeyword.slice(1)}-drevet Løsning for Digital Transformasjon`,
    description: `En innovativ plattform som kombinerer ${keywordText} for å skape verdi gjennom moderne teknologi. Denne løsningen er spesielt designet for iOS web og React, og gir brukerne en sømløs opplevelse på tvers av enheter.`,
    categories,
    details: {
      targetAudience: `Primært rettet mot profesjonelle og entusiaster innen ${primaryKeyword}, samt bedrifter som ønsker å digitalisere sine prosesser. Sekundært publikum inkluderer utviklere og tech-savvy brukere som verdsetter kvalitet og innovasjon.`,
      implementation: [
        `Utvikle en React-basert frontend med Next.js for optimal ytelse og SEO`,
        `Implementere responsive design med fokus på iOS Safari-kompatibilitet`,
        `Integrere ${keywordText} i kjernefunksjonaliteten gjennom moderne API-er`,
        `Bygge en Express.js backend med TypeScript for type-sikkerhet`,
        `Implementere sanntids-funksjoner med WebSocket for bedre brukeropplevelse`,
        `Legge til PWA-støtte for app-lignende opplevelse på iOS`
      ],
      monetization: [
        `Freemium-modell: Gratis basisversjon med premium funksjoner`,
        `Abonnementsbasert inntekt: Månedlige/årlige planer`,
        `Affiliate-partnerskap: Provisjonsbaserte inntekter fra relevante produkter`,
        `B2B-lisenser: Enterprise-løsninger for større organisasjoner`,
        `API-tilgang: Utviklere betaler for å integrere med plattformen`
      ],
      timeline: `Fase 1 (1-2 måneder): MVP med kjernefunksjonalitet | Fase 2 (3-4 måneder): Beta-testing og iterasjon | Fase 3 (5-6 måneder): Full lansering med affiliate-integrasjon`,
      resources: [
        `Utviklingsteam: 2-3 fullstack-utviklere med React/TypeScript-erfaring`,
        `Designer: 1 UX/UI-designer for iOS-optimalisering`,
        `Infrastruktur: Cloud hosting (Vercel/AWS) med CDN`,
        `Markedsføring: Innholdsmarkedsføring og sosiale medier-strategi`,
        `Verktøy: GitHub, Figma, Analytics, A/B-testing platform`
      ]
    },
    affiliateOpportunities: {
      platforms: [
        'Amazon Associates (30-dagers cookie, 1-10% provisjon)',
        'ShareASale (omfattende nettverk av merkevarer)',
        'CJ Affiliate (store internasjonale merkevarer)',
        'Impact (tech og SaaS-produkter)',
        'Partnerize (premium brands og høye provisjoner)'
      ],
      strategies: [
        `Innholdsmarkedsføring: Lag verdifulle guider og tutorials relatert til ${keywordText}`,
        `Produktanmeldelser: Ærlige anmeldelser av relevante produkter og tjenester`,
        `Sammenligningstabeller: Hjelp brukere med å velge riktige verktøy`,
        `Email-marketing: Bygg en liste og del kuraterte anbefalinger`,
        `YouTube/Video: Lag video-innhold med affiliate-lenker i beskrivelsen`,
        `Sosiale medier: Del nyttige tips med affiliate-integrasjon`
      ],
      estimatedCommission: `Basert på ${primaryKeyword}-nisjen: 5-15% per salg for digitale produkter, 1-5% for fysiske produkter. Gjennomsnittlig ordrestørrelse på 500-2000 NOK kan gi 25-300 NOK per konvertering. Med 1000 besøkende/måned og 2% konverteringsrate = 20 salg/måned = 500-6000 NOK i månedlig affiliate-inntekt.`
    },
    createdAt: timestamp,
    userId
  };

  ideas.set(ideaId, idea);
  return idea;
}

router.post('/generate', (req: Request, res: Response) => {
  try {
    const { keywords } = req.body || {};

    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return res.status(400).json({
        error: 'Keywords array is required and must contain at least one keyword'
      });
    }

    const cleanKeywords = keywords
      .map((k: any) => String(k).trim())
      .filter((k: string) => k.length > 0);

    if (cleanKeywords.length === 0) {
      return res.status(400).json({
        error: 'At least one valid keyword is required'
      });
    }

    const userId = (req as any).userId;
    const idea = generateRichIdea(cleanKeywords, userId);

    res.status(201).json(idea);
  } catch (err) {
    res.status(500).json({
      error: 'Failed to generate idea',
      details: (err as Error).message
    });
  }
});

router.get('/:id', (req: Request, res: Response) => {
  const ideaId = req.params.id;
  const idea = ideas.get(ideaId);

  if (!idea) {
    return res.status(404).json({ error: 'Idea not found' });
  }

  res.json(idea);
});

router.get('/', (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const allIdeas = Array.from(ideas.values());

  const filteredIdeas = userId
    ? allIdeas.filter(idea => idea.userId === userId)
    : allIdeas;

  res.json({
    ideas: filteredIdeas,
    count: filteredIdeas.length
  });
});

export default router;
