import rateLimit from "express-rate-limit";

export const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "For mange forespørsler. Prøv igjen om litt." },
});

export const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "For mange innloggingsforsøk. Vent ett minutt." },
});
