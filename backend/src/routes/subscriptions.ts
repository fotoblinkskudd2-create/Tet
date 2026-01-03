import { Router, Request, Response } from 'express';
import crypto from 'crypto';

const router = Router();

interface Subscription {
  id: string;
  name: string;
  provider: string;
  amount: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly' | 'quarterly';
  lastCharged: Date;
  nextCharge: Date;
  category: string;
  status: 'active' | 'unused' | 'flagged';
  lastUsed?: Date;
  daysUnused: number;
  cancellationEmail?: string;
  alternatives?: Alternative[];
}

interface Alternative {
  name: string;
  price: number;
  savings: number;
  description: string;
  url: string;
}

interface CancellationEmail {
  to: string;
  subject: string;
  body: string;
  tone: 'polite' | 'firm' | 'polite-firm';
}

// Mock subscription data - In production, this would integrate with MCP for bank data
const mockSubscriptions: Subscription[] = [
  {
    id: crypto.randomUUID(),
    name: 'Premium Streaming Service',
    provider: 'StreamMax Pro',
    amount: 15.99,
    currency: 'USD',
    billingCycle: 'monthly',
    lastCharged: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    nextCharge: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    category: 'Entertainment',
    status: 'unused',
    lastUsed: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
    daysUnused: 120,
    alternatives: [
      {
        name: 'Basic Plan',
        price: 8.99,
        savings: 7.00,
        description: 'HD streaming on 1 device',
        url: 'https://streammax.com/basic'
      },
      {
        name: 'Competitor Lite',
        price: 6.99,
        savings: 9.00,
        description: 'Ad-supported streaming with same content',
        url: 'https://competitor.com/lite'
      }
    ]
  },
  {
    id: crypto.randomUUID(),
    name: 'Fitness App Pro',
    provider: 'FitLife',
    amount: 12.99,
    currency: 'USD',
    billingCycle: 'monthly',
    lastCharged: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    nextCharge: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    category: 'Health',
    status: 'unused',
    lastUsed: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000),
    daysUnused: 95,
    alternatives: [
      {
        name: 'Free Tier',
        price: 0,
        savings: 12.99,
        description: 'Basic workouts with ads',
        url: 'https://fitlife.com/free'
      }
    ]
  },
  {
    id: crypto.randomUUID(),
    name: 'Cloud Storage Plus',
    provider: 'CloudVault',
    amount: 9.99,
    currency: 'USD',
    billingCycle: 'monthly',
    lastCharged: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    nextCharge: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    category: 'Productivity',
    status: 'active',
    lastUsed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    daysUnused: 2
  }
];

// Get all subscriptions with unused flags
router.get('/subscriptions', async (req: Request, res: Response) => {
  try {
    const { unusedDaysThreshold = 90 } = req.query;
    const threshold = Number(unusedDaysThreshold);

    const subscriptions = mockSubscriptions.map(sub => ({
      ...sub,
      status: sub.daysUnused >= threshold ? 'flagged' : sub.status
    }));

    const totalMonthly = subscriptions.reduce((sum, sub) => {
      const monthly = sub.billingCycle === 'yearly'
        ? sub.amount / 12
        : sub.billingCycle === 'quarterly'
        ? sub.amount / 3
        : sub.amount;
      return sum + monthly;
    }, 0);

    const unusedSubscriptions = subscriptions.filter(
      sub => sub.daysUnused >= threshold
    );

    const potentialSavings = unusedSubscriptions.reduce((sum, sub) => {
      const monthly = sub.billingCycle === 'yearly'
        ? sub.amount / 12
        : sub.billingCycle === 'quarterly'
        ? sub.amount / 3
        : sub.amount;
      return sum + monthly;
    }, 0);

    res.json({
      subscriptions,
      summary: {
        total: subscriptions.length,
        active: subscriptions.filter(s => s.status === 'active').length,
        unused: unusedSubscriptions.length,
        totalMonthlySpend: totalMonthly,
        potentialMonthlySavings: potentialSavings
      }
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Generate cancellation email
router.post('/subscriptions/:id/cancel-email', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tone = 'polite-firm' } = req.body;

    const subscription = mockSubscriptions.find(s => s.id === id);
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    const email = generateCancellationEmail(subscription, tone);

    res.json({
      email,
      subscription: {
        name: subscription.name,
        provider: subscription.provider,
        amount: subscription.amount
      },
      alternatives: subscription.alternatives || []
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Generate cancellation email content
function generateCancellationEmail(
  subscription: Subscription,
  tone: 'polite' | 'firm' | 'polite-firm'
): CancellationEmail {
  const providerEmail = `support@${subscription.provider.toLowerCase().replace(/\s+/g, '')}.com`;

  let greeting = 'Dear Customer Support Team,';
  let opening = '';
  let closing = '';

  if (tone === 'polite') {
    opening = `I hope this message finds you well. I am writing to request the cancellation of my ${subscription.name} subscription.`;
    closing = 'Thank you for your understanding and for the service you have provided. I wish you all the best.';
  } else if (tone === 'firm') {
    opening = `I am writing to formally request the immediate cancellation of my ${subscription.name} subscription.`;
    closing = 'I expect confirmation of this cancellation within 48 hours. Thank you for your prompt attention to this matter.';
  } else {
    opening = `I am writing to request the cancellation of my ${subscription.name} subscription. While I have appreciated your service, I find that I am no longer using it regularly enough to justify the cost.`;
    closing = 'I would appreciate confirmation of this cancellation at your earliest convenience. Thank you for your understanding.';
  }

  const body = `${greeting}

${opening}

Account Details:
- Service: ${subscription.name}
- Billing Amount: $${subscription.amount.toFixed(2)} ${subscription.currency} (${subscription.billingCycle})
- Last Used: ${subscription.lastUsed ? new Date(subscription.lastUsed).toLocaleDateString() : 'N/A'}

I would like this cancellation to take effect immediately and request that no further charges be made to my account.

${subscription.alternatives && subscription.alternatives.length > 0
  ? `I have found alternative services that better meet my current needs and budget, including ${subscription.alternatives[0].name} which offers similar functionality at a more competitive price point.`
  : ''
}

Please confirm the cancellation and provide details on any final charges or refunds, if applicable.

${closing}

Best regards`;

  return {
    to: providerEmail,
    subject: `Cancellation Request - ${subscription.name} Subscription`,
    body,
    tone
  };
}

// Sync subscriptions with MCP (bank data)
router.post('/subscriptions/sync', async (req: Request, res: Response) => {
  try {
    // This would integrate with MCP to fetch actual bank transactions
    // For now, returning mock data
    res.json({
      synced: mockSubscriptions.length,
      newSubscriptions: 0,
      updatedSubscriptions: mockSubscriptions.length,
      lastSync: new Date()
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
