import rateLimit from 'express-rate-limit';
import { config } from '../config';
import { Request } from 'express';

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: 'For mange forespørsler fra denne IP-en, prøv igjen senere.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    // Use user ID if authenticated, otherwise IP
    return req.userId || req.ip || 'unknown';
  },
});

// Stricter limiter for expensive operations like chat
export const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: 'For mange meldinger, vennligst vent litt.',
  keyGenerator: (req: Request) => req.userId || req.ip || 'unknown',
  skip: (req: Request) => {
    // Premium and eternal users get higher limits
    if (req.user?.subscriptionTier === 'premium') return false;
    if (req.user?.subscriptionTier === 'eternal') return true; // No limit
    return false;
  },
});

// Voice generation is expensive, limit it more
export const voiceLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3, // 3 voice generations per minute
  message: 'For mange stemme-genereringer, vennligst vent.',
  keyGenerator: (req: Request) => req.userId || req.ip || 'unknown',
  skip: (req: Request) => {
    // Only premium and eternal can generate voice
    return req.user?.subscriptionTier === 'premium' || req.user?.subscriptionTier === 'eternal';
  },
});

// File upload limiter
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 uploads per 15 minutes
  message: 'For mange opplastinger, prøv igjen senere.',
  keyGenerator: (req: Request) => req.userId || req.ip || 'unknown',
});

// Auth endpoints (signup/login) need strict limiting
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 minutes
  message: 'For mange innloggingsforsøk, prøv igjen om 15 minutter.',
  standardHeaders: true,
  legacyHeaders: false,
});
