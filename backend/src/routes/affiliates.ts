import { Router, Request, Response } from 'express';
import { v4 as uuid } from 'uuid';

interface AffiliateProfile {
  id: string;
  userId: string;
  referralCode: string;
  commissionTier: 'bronze' | 'silver' | 'gold' | 'platinum';
  totalEarnings: number;
  totalReferrals: number;
  createdAt: string;
}

interface Referral {
  id: string;
  affiliateId: string;
  referredUserId: string;
  commissionAmount: number;
  status: 'pending' | 'approved' | 'paid';
  createdAt: string;
}

interface AffiliateClick {
  id: string;
  affiliateId: string;
  productUrl: string;
  clickedAt: string;
  ipAddress?: string;
  converted: boolean;
}

const affiliateProfiles = new Map<string, AffiliateProfile>();
const referrals = new Map<string, Referral>();
const clicks = new Map<string, AffiliateClick>();
const userToAffiliate = new Map<string, string>();

const router = Router();

function generateReferralCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

function getCommissionRate(tier: AffiliateProfile['commissionTier']): number {
  const rates = {
    bronze: 0.05,
    silver: 0.10,
    gold: 0.15,
    platinum: 0.20
  };
  return rates[tier];
}

function calculateTier(totalReferrals: number): AffiliateProfile['commissionTier'] {
  if (totalReferrals >= 100) return 'platinum';
  if (totalReferrals >= 50) return 'gold';
  if (totalReferrals >= 10) return 'silver';
  return 'bronze';
}

router.post('/profile', (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const existingAffiliateId = userToAffiliate.get(userId);
    if (existingAffiliateId) {
      const existing = affiliateProfiles.get(existingAffiliateId);
      return res.status(200).json(existing);
    }

    const affiliateId = uuid();
    const referralCode = generateReferralCode();

    const profile: AffiliateProfile = {
      id: affiliateId,
      userId,
      referralCode,
      commissionTier: 'bronze',
      totalEarnings: 0,
      totalReferrals: 0,
      createdAt: new Date().toISOString()
    };

    affiliateProfiles.set(affiliateId, profile);
    userToAffiliate.set(userId, affiliateId);

    res.status(201).json(profile);
  } catch (err) {
    res.status(500).json({
      error: 'Failed to create affiliate profile',
      details: (err as Error).message
    });
  }
});

router.get('/profile', (req: Request, res: Response) => {
  const userId = (req as any).userId;

  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const affiliateId = userToAffiliate.get(userId);
  if (!affiliateId) {
    return res.status(404).json({ error: 'Affiliate profile not found' });
  }

  const profile = affiliateProfiles.get(affiliateId);
  res.json(profile);
});

router.post('/clicks', (req: Request, res: Response) => {
  try {
    const { referralCode, productUrl } = req.body || {};

    if (!referralCode || !productUrl) {
      return res.status(400).json({
        error: 'referralCode and productUrl are required'
      });
    }

    const affiliate = Array.from(affiliateProfiles.values())
      .find(a => a.referralCode === referralCode);

    if (!affiliate) {
      return res.status(404).json({ error: 'Invalid referral code' });
    }

    const clickId = uuid();
    const click: AffiliateClick = {
      id: clickId,
      affiliateId: affiliate.id,
      productUrl,
      clickedAt: new Date().toISOString(),
      ipAddress: req.ip,
      converted: false
    };

    clicks.set(clickId, click);

    res.status(201).json({
      clickId,
      redirectUrl: productUrl
    });
  } catch (err) {
    res.status(500).json({
      error: 'Failed to track click',
      details: (err as Error).message
    });
  }
});

router.post('/conversions', (req: Request, res: Response) => {
  try {
    const { clickId, amount } = req.body || {};

    if (!clickId || !amount) {
      return res.status(400).json({
        error: 'clickId and amount are required'
      });
    }

    const click = clicks.get(clickId);
    if (!click) {
      return res.status(404).json({ error: 'Click not found' });
    }

    if (click.converted) {
      return res.status(409).json({ error: 'Click already converted' });
    }

    const affiliate = affiliateProfiles.get(click.affiliateId);
    if (!affiliate) {
      return res.status(404).json({ error: 'Affiliate not found' });
    }

    click.converted = true;
    clicks.set(clickId, click);

    const commissionRate = getCommissionRate(affiliate.commissionTier);
    const commissionAmount = amount * commissionRate;

    affiliate.totalEarnings += commissionAmount;
    affiliate.totalReferrals += 1;
    affiliate.commissionTier = calculateTier(affiliate.totalReferrals);
    affiliateProfiles.set(affiliate.id, affiliate);

    const referralId = uuid();
    const referral: Referral = {
      id: referralId,
      affiliateId: affiliate.id,
      referredUserId: clickId,
      commissionAmount,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    referrals.set(referralId, referral);

    res.status(201).json({
      referralId,
      commissionAmount,
      newTier: affiliate.commissionTier,
      totalEarnings: affiliate.totalEarnings
    });
  } catch (err) {
    res.status(500).json({
      error: 'Failed to process conversion',
      details: (err as Error).message
    });
  }
});

router.get('/stats', (req: Request, res: Response) => {
  const userId = (req as any).userId;

  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const affiliateId = userToAffiliate.get(userId);
  if (!affiliateId) {
    return res.status(404).json({ error: 'Affiliate profile not found' });
  }

  const profile = affiliateProfiles.get(affiliateId);
  const affiliateReferrals = Array.from(referrals.values())
    .filter(r => r.affiliateId === affiliateId);
  const affiliateClicks = Array.from(clicks.values())
    .filter(c => c.affiliateId === affiliateId);

  const stats = {
    profile,
    totalClicks: affiliateClicks.length,
    totalConversions: affiliateClicks.filter(c => c.converted).length,
    conversionRate: affiliateClicks.length > 0
      ? (affiliateClicks.filter(c => c.converted).length / affiliateClicks.length * 100).toFixed(2) + '%'
      : '0%',
    referrals: affiliateReferrals,
    pendingEarnings: affiliateReferrals
      .filter(r => r.status === 'pending')
      .reduce((sum, r) => sum + r.commissionAmount, 0),
    paidEarnings: affiliateReferrals
      .filter(r => r.status === 'paid')
      .reduce((sum, r) => sum + r.commissionAmount, 0)
  };

  res.json(stats);
});

router.get('/leaderboard', (req: Request, res: Response) => {
  const allAffiliates = Array.from(affiliateProfiles.values())
    .sort((a, b) => b.totalEarnings - a.totalEarnings)
    .slice(0, 10)
    .map(a => ({
      referralCode: a.referralCode,
      commissionTier: a.commissionTier,
      totalEarnings: a.totalEarnings,
      totalReferrals: a.totalReferrals
    }));

  res.json({
    leaderboard: allAffiliates
  });
});

export default router;
