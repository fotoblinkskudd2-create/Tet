import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';
import { AIRecommendationEngine } from '../services/aiRecommendationEngine';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const COOKIE_NAME = 'session';

// In-memory storage (following existing pattern)
interface LeasingCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface LeasingItem {
  id: string;
  category_id: string;
  name: string;
  description: string;
  monthly_price: number;
  deposit: number;
  min_lease_months: number;
  max_lease_months: number;
  specifications: Record<string, any>;
  image_url?: string;
  provider: string;
  rating: number;
  available: boolean;
}

interface UserPreference {
  id: string;
  user_id: string;
  category_id: string;
  budget_min: number;
  budget_max: number;
  preferred_duration: number;
  priorities: Record<string, number>;
  usage_pattern: string;
  must_have_features: string[];
  nice_to_have_features: string[];
}

interface AIRecommendation {
  id: string;
  user_id: string;
  preference_id: string;
  item_id: string;
  score: number;
  reasoning: any;
  match_details: any;
  created_at: Date;
}

interface LeasingContract {
  id: string;
  user_id: string;
  item_id: string;
  recommendation_id?: string;
  monthly_payment: number;
  deposit_paid: number;
  duration_months: number;
  start_date: string;
  end_date: string;
  status: string;
  satisfaction_rating?: number;
}

const categories = new Map<string, LeasingCategory>();
const leasingItems = new Map<string, LeasingItem>();
const userPreferences = new Map<string, UserPreference>();
const recommendations = new Map<string, AIRecommendation>();
const contracts = new Map<string, LeasingContract>();

// Initialize sample data
function initializeSampleData() {
  // Categories
  const carCategory = { id: uuid(), name: 'Biler', description: 'Personbiler og elektriske kjøretøy', icon: '🚗' };
  const apartmentCategory = { id: uuid(), name: 'Leiligheter', description: 'Urbane og moderne leiligheter', icon: '🏠' };
  const electronicsCategory = { id: uuid(), name: 'Elektronikk', description: 'Laptops, telefoner og enheter', icon: '💻' };
  const equipmentCategory = { id: uuid(), name: 'Utstyr', description: 'Verktøy og spesialutstyr', icon: '🔧' };

  categories.set(carCategory.id, carCategory);
  categories.set(apartmentCategory.id, apartmentCategory);
  categories.set(electronicsCategory.id, electronicsCategory);
  categories.set(equipmentCategory.id, equipmentCategory);

  // Sample cars
  leasingItems.set(uuid(), {
    id: uuid(),
    category_id: carCategory.id,
    name: 'Tesla Model 3 Long Range',
    description: 'Elektrisk sedan med fantastisk rekkevidde og autopilot',
    monthly_price: 6500.00,
    deposit: 25000.00,
    min_lease_months: 12,
    max_lease_months: 48,
    specifications: {
      range_km: 614,
      acceleration_0_100: 4.4,
      seats: 5,
      eco_friendly: true,
      autopilot: true,
      luxury_level: 8
    },
    provider: 'Tesla Leasing Norge',
    rating: 4.8,
    available: true
  });

  leasingItems.set(uuid(), {
    id: uuid(),
    category_id: carCategory.id,
    name: 'Toyota Yaris Hybrid',
    description: 'Kompakt og økonomisk hybrid perfekt for byen',
    monthly_price: 3200.00,
    deposit: 15000.00,
    min_lease_months: 12,
    max_lease_months: 36,
    specifications: {
      range_km: 450,
      fuel_consumption: 0.38,
      seats: 5,
      eco_friendly: true,
      city_friendly: true,
      luxury_level: 5
    },
    provider: 'Toyota Leasing',
    rating: 4.5,
    available: true
  });

  leasingItems.set(uuid(), {
    id: uuid(),
    category_id: carCategory.id,
    name: 'BMW iX3',
    description: 'Premium elektrisk SUV med sportlig kjøredynamikk',
    monthly_price: 7800.00,
    deposit: 35000.00,
    min_lease_months: 24,
    max_lease_months: 48,
    specifications: {
      range_km: 460,
      acceleration_0_100: 6.8,
      seats: 5,
      eco_friendly: true,
      luxury_level: 9,
      cargo_space: 510
    },
    provider: 'BMW Financial Services',
    rating: 4.7,
    available: true
  });

  // Sample electronics
  leasingItems.set(uuid(), {
    id: uuid(),
    category_id: electronicsCategory.id,
    name: 'MacBook Pro 16" M3 Max',
    description: 'Kraftig laptop for kreativt arbeid og utvikling',
    monthly_price: 1850.00,
    deposit: 5000.00,
    min_lease_months: 12,
    max_lease_months: 36,
    specifications: {
      ram_gb: 36,
      storage_tb: 1,
      screen_inches: 16,
      performance_score: 10,
      portability: 7,
      battery_hours: 18
    },
    provider: 'Tech Lease Norway',
    rating: 4.9,
    available: true
  });

  leasingItems.set(uuid(), {
    id: uuid(),
    category_id: electronicsCategory.id,
    name: 'Dell XPS 13',
    description: 'Ultraportabel og elegant arbeidslaptop',
    monthly_price: 980.00,
    deposit: 2500.00,
    min_lease_months: 12,
    max_lease_months: 24,
    specifications: {
      ram_gb: 16,
      storage_tb: 0.512,
      screen_inches: 13,
      performance_score: 7,
      portability: 10,
      battery_hours: 12
    },
    provider: 'Tech Lease Norway',
    rating: 4.4,
    available: true
  });

  // Sample apartment
  leasingItems.set(uuid(), {
    id: uuid(),
    category_id: apartmentCategory.id,
    name: 'Moderne 2-roms i Grünerløkka',
    description: 'Sentral beliggenhet, nyrenovert med balkong',
    monthly_price: 18500.00,
    deposit: 55500.00,
    min_lease_months: 12,
    max_lease_months: 36,
    specifications: {
      sqm: 55,
      rooms: 2,
      floor: 3,
      balcony: true,
      parking: false,
      location_score: 9,
      modern: true
    },
    provider: 'Urban Leasing AS',
    rating: 4.6,
    available: true
  });
}

// Initialize data on startup
initializeSampleData();

// Auth middleware
function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = (req as any).cookies?.[COOKIE_NAME] || req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    (req as any).userId = payload.userId;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// GET /api/leasing/categories - Get all leasing categories
router.get('/categories', (req: Request, res: Response) => {
  res.json(Array.from(categories.values()));
});

// GET /api/leasing/items - Get all leasing items (optionally filtered by category)
router.get('/items', (req: Request, res: Response) => {
  const categoryId = req.query.category as string | undefined;

  let items = Array.from(leasingItems.values());

  if (categoryId) {
    items = items.filter(item => item.category_id === categoryId);
  }

  res.json(items);
});

// GET /api/leasing/items/:id - Get specific leasing item
router.get('/items/:id', (req: Request, res: Response) => {
  const item = leasingItems.get(req.params.id);
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }
  res.json(item);
});

// POST /api/leasing/preferences - Create or update user preferences
router.post('/preferences', authMiddleware, (req: Request, res: Response) => {
  const userId = (req as any).userId as string;
  const {
    category_id,
    budget_min,
    budget_max,
    preferred_duration,
    priorities,
    usage_pattern,
    must_have_features,
    nice_to_have_features
  } = req.body;

  if (!category_id || budget_max === undefined) {
    return res.status(400).json({ error: 'category_id and budget_max are required' });
  }

  // Find existing preference for this user and category
  const existingPref = Array.from(userPreferences.values()).find(
    p => p.user_id === userId && p.category_id === category_id
  );

  const preference: UserPreference = {
    id: existingPref?.id || uuid(),
    user_id: userId,
    category_id,
    budget_min: budget_min || 0,
    budget_max,
    preferred_duration: preferred_duration || 24,
    priorities: priorities || {},
    usage_pattern: usage_pattern || '',
    must_have_features: must_have_features || [],
    nice_to_have_features: nice_to_have_features || []
  };

  userPreferences.set(preference.id, preference);
  res.status(existingPref ? 200 : 201).json(preference);
});

// GET /api/leasing/preferences - Get user's preferences
router.get('/preferences', authMiddleware, (req: Request, res: Response) => {
  const userId = (req as any).userId as string;
  const categoryId = req.query.category as string | undefined;

  let prefs = Array.from(userPreferences.values()).filter(p => p.user_id === userId);

  if (categoryId) {
    prefs = prefs.filter(p => p.category_id === categoryId);
  }

  res.json(prefs);
});

// POST /api/leasing/recommendations - Get AI recommendations based on preferences
router.post('/recommendations', authMiddleware, async (req: Request, res: Response) => {
  const userId = (req as any).userId as string;
  const { preference_id } = req.body;

  if (!preference_id) {
    return res.status(400).json({ error: 'preference_id is required' });
  }

  const preference = userPreferences.get(preference_id);
  if (!preference || preference.user_id !== userId) {
    return res.status(404).json({ error: 'Preference not found' });
  }

  // Get available items for this category
  const availableItems = Array.from(leasingItems.values()).filter(
    item => item.category_id === preference.category_id && item.available
  );

  // Generate AI recommendations
  const recommendationResults = await AIRecommendationEngine.generateRecommendations(
    preference,
    availableItems
  );

  // Store recommendations
  const storedRecommendations: AIRecommendation[] = [];
  for (const result of recommendationResults) {
    const rec: AIRecommendation = {
      id: uuid(),
      user_id: userId,
      preference_id,
      item_id: result.item_id,
      score: result.score,
      reasoning: result.reasoning,
      match_details: result.match_details,
      created_at: new Date()
    };
    recommendations.set(rec.id, rec);
    storedRecommendations.push(rec);
  }

  // Enhance recommendations with item details
  const enhancedRecommendations = storedRecommendations.map(rec => ({
    ...rec,
    item: leasingItems.get(rec.item_id)
  }));

  res.json(enhancedRecommendations);
});

// GET /api/leasing/recommendations - Get user's past recommendations
router.get('/recommendations', authMiddleware, (req: Request, res: Response) => {
  const userId = (req as any).userId as string;

  const userRecs = Array.from(recommendations.values())
    .filter(rec => rec.user_id === userId)
    .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
    .slice(0, 20); // Last 20 recommendations

  const enhanced = userRecs.map(rec => ({
    ...rec,
    item: leasingItems.get(rec.item_id)
  }));

  res.json(enhanced);
});

// POST /api/leasing/contracts - Create a new leasing contract
router.post('/contracts', authMiddleware, (req: Request, res: Response) => {
  const userId = (req as any).userId as string;
  const {
    item_id,
    recommendation_id,
    duration_months,
    start_date
  } = req.body;

  if (!item_id || !duration_months || !start_date) {
    return res.status(400).json({ error: 'item_id, duration_months, and start_date are required' });
  }

  const item = leasingItems.get(item_id);
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }

  if (!item.available) {
    return res.status(400).json({ error: 'Item is no longer available' });
  }

  // Calculate end date
  const startDateObj = new Date(start_date);
  const endDateObj = new Date(startDateObj);
  endDateObj.setMonth(endDateObj.getMonth() + duration_months);

  const contract: LeasingContract = {
    id: uuid(),
    user_id: userId,
    item_id,
    recommendation_id,
    monthly_payment: item.monthly_price,
    deposit_paid: item.deposit,
    duration_months,
    start_date,
    end_date: endDateObj.toISOString().split('T')[0],
    status: 'active'
  };

  contracts.set(contract.id, contract);

  // Mark item as unavailable (in real system, would check inventory)
  item.available = false;

  res.status(201).json({
    ...contract,
    item
  });
});

// GET /api/leasing/contracts - Get user's contracts
router.get('/contracts', authMiddleware, (req: Request, res: Response) => {
  const userId = (req as any).userId as string;

  const userContracts = Array.from(contracts.values())
    .filter(contract => contract.user_id === userId);

  const enhanced = userContracts.map(contract => ({
    ...contract,
    item: leasingItems.get(contract.item_id)
  }));

  res.json(enhanced);
});

// GET /api/leasing/contracts/:id - Get specific contract
router.get('/contracts/:id', authMiddleware, (req: Request, res: Response) => {
  const userId = (req as any).userId as string;
  const contract = contracts.get(req.params.id);

  if (!contract || contract.user_id !== userId) {
    return res.status(404).json({ error: 'Contract not found' });
  }

  res.json({
    ...contract,
    item: leasingItems.get(contract.item_id)
  });
});

export default router;
