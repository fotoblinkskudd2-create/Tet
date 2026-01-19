import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  database: {
    url: process.env.DATABASE_URL || '',
    supabaseUrl: process.env.SUPABASE_URL || '',
    supabaseKey: process.env.SUPABASE_KEY || '',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-me',
    expiresIn: '30d',
  },

  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    embeddingModel: 'text-embedding-3-small', // or text-embedding-ada-002
    embeddingDimensions: 1536,
  },

  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    model: 'claude-3-5-sonnet-20241022',
    maxTokens: 4096,
  },

  pinecone: {
    apiKey: process.env.PINECONE_API_KEY || '',
    environment: process.env.PINECONE_ENVIRONMENT || '',
    indexName: process.env.PINECONE_INDEX || 'graveai-memories',
  },

  elevenlabs: {
    apiKey: process.env.ELEVENLABS_API_KEY || '',
  },

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    priceIdPremium: process.env.STRIPE_PRICE_ID_PREMIUM || '',
    priceIdEternal: process.env.STRIPE_PRICE_ID_ETERNAL || '',
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 min
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },

  // Subscription limits
  limits: {
    free: {
      maxDeceasedPersons: 1,
      maxDataSizeMB: 500,
      maxChatMinutesPerMonth: 30,
      voiceCloning: false,
      arFeatures: false,
      familySharing: false,
    },
    premium: {
      maxDeceasedPersons: 10,
      maxDataSizeMB: 50000, // 50GB
      maxChatMinutesPerMonth: -1, // unlimited
      voiceCloning: true,
      arFeatures: true,
      familySharing: true,
    },
    eternal: {
      maxDeceasedPersons: 50,
      maxDataSizeMB: 100000, // 100GB
      maxChatMinutesPerMonth: -1,
      voiceCloning: true,
      arFeatures: true,
      familySharing: true,
    },
  },
};
