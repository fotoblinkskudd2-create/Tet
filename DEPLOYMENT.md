# Deployment Guide

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- PostgreSQL 14+ database
- HTTPS domain (required for WebAuthn)
- Modern browser support

## Local Development Setup

### 1. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 2. Database Setup

```bash
# Create PostgreSQL database
createdb secureauth

# Set up environment variables
cp .env.example .env

# Edit .env with your database URL
DATABASE_URL="postgresql://user:password@localhost:5432/secureauth"
```

### 3. Generate Secrets

Generate strong secrets for JWT tokens:

```bash
# Access token secret
openssl rand -base64 64

# Refresh token secret
openssl rand -base64 64

# Encryption key (optional, for data encryption)
openssl rand -base64 32
```

Add these to your `.env` file.

### 4. Configure WebAuthn

For local development:

```env
WEBAUTHN_RP_NAME="Secure Auth System"
WEBAUTHN_RP_ID="localhost"
WEBAUTHN_ORIGIN="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Important:** WebAuthn requires:
- `localhost` for development (HTTP allowed)
- Valid HTTPS domain for production
- `rpID` must match your domain

### 5. Initialize Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# (Optional) Open Prisma Studio to view data
npm run db:studio
```

### 6. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## Production Deployment

### Environment Configuration

Create production `.env`:

```env
# Database (use connection pooling)
DATABASE_URL="postgresql://user:password@db.example.com:5432/prod_db?sslmode=require&pgbouncer=true"

# JWT Secrets (MUST BE DIFFERENT FROM DEV)
JWT_ACCESS_SECRET="[64-character random string]"
JWT_REFRESH_SECRET="[different 64-character random string]"

# Encryption Key
ENCRYPTION_KEY="[32-character random string]"

# WebAuthn (MUST USE YOUR DOMAIN)
WEBAUTHN_RP_NAME="Your App Name"
WEBAUTHN_RP_ID="yourdomain.com"
WEBAUTHN_ORIGIN="https://yourdomain.com"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"

# Security
BCRYPT_ROUNDS=12
ACCESS_TOKEN_EXPIRES_MINUTES=5
SESSION_MAX_AGE_DAYS=30

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000

# Node Environment
NODE_ENV=production
```

### Deployment Platforms

#### Vercel (Recommended for Next.js)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Environment Variables:**
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Add all variables from `.env`
3. Mark secrets as "Sensitive"
4. Set for Production environment

**Database:**
- Use Vercel Postgres, or
- Use external PostgreSQL (Supabase, Neon, etc.)
- Enable connection pooling

#### Docker

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine AS base

# Dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build Next.js
RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

Update `next.config.js`:

```javascript
const nextConfig = {
  output: 'standalone',
  // ... rest of config
};
```

Build and run:

```bash
# Build image
docker build -t secure-auth .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="..." \
  -e JWT_ACCESS_SECRET="..." \
  -e JWT_REFRESH_SECRET="..." \
  secure-auth
```

#### Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Add PostgreSQL
railway add

# Deploy
railway up
```

Add environment variables in Railway dashboard.

#### AWS (EC2/ECS)

1. **EC2 Instance:**
   - Ubuntu 22.04 LTS
   - Install Node.js 18+
   - Install PostgreSQL or use RDS
   - Configure security groups (443, 80)
   - Set up nginx reverse proxy
   - Enable SSL with Let's Encrypt

2. **ECS (Elastic Container Service):**
   - Use Docker image
   - Configure task definition
   - Use RDS for PostgreSQL
   - Set up ALB with HTTPS
   - Store secrets in AWS Secrets Manager

### Database Migration

For production database setup:

```bash
# Production database migration
DATABASE_URL="postgresql://..." npx prisma db push

# Or use Prisma Migrate for version control
npx prisma migrate dev
npx prisma migrate deploy
```

### SSL/TLS Setup

WebAuthn **requires** HTTPS in production.

#### Option 1: Platform SSL (Easiest)
- Vercel: Automatic SSL
- Railway: Automatic SSL
- Heroku: Automatic SSL

#### Option 2: Let's Encrypt (Self-hosted)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

#### Option 3: CloudFlare

1. Add domain to CloudFlare
2. Enable "Full (strict)" SSL mode
3. Configure origin certificates
4. Enable HSTS

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Security Checklist

Before going to production:

- [ ] Generate strong, unique secrets (64+ characters)
- [ ] Use environment variables (never hardcode)
- [ ] Enable HTTPS/TLS
- [ ] Configure correct WebAuthn domain
- [ ] Set up database backups
- [ ] Enable database SSL
- [ ] Configure rate limiting
- [ ] Set up monitoring/logging
- [ ] Test passkey registration
- [ ] Test 2FA flow
- [ ] Test token refresh
- [ ] Test session revocation
- [ ] Review security headers
- [ ] Enable CORS properly
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure email notifications (optional)
- [ ] Test account lockout
- [ ] Test breach detection
- [ ] Review audit logs
- [ ] Perform security scan
- [ ] Test on multiple browsers
- [ ] Test on mobile devices

## Monitoring

### Application Monitoring

Recommended tools:
- **Vercel Analytics** (for Vercel deployments)
- **Sentry** (error tracking)
- **LogRocket** (session replay)
- **DataDog** (APM)

### Database Monitoring

```bash
# PostgreSQL slow query log
ALTER DATABASE secureauth SET log_min_duration_statement = 1000;

# Monitor connections
SELECT count(*) FROM pg_stat_activity;

# Check table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Security Monitoring

Monitor these metrics:
- Failed login attempts per IP
- Rate limit violations
- Unusual session patterns
- Token rotation failures
- Account lockouts
- New device registrations
- Passkey additions/removals

Create alerts for:
- High failed login rate
- Breach detection triggers
- Database connection failures
- High error rates

## Backup Strategy

### Database Backups

```bash
# Daily automated backup
pg_dump -h localhost -U user secureauth > backup_$(date +%Y%m%d).sql

# Restore
psql -h localhost -U user secureauth < backup_20250101.sql
```

Use automated backup solutions:
- **Vercel Postgres**: Automatic backups
- **AWS RDS**: Automated snapshots
- **Supabase**: Point-in-time recovery

### Environment Backup

Store encrypted backups of:
- `.env` file (encrypted!)
- JWT secrets
- Encryption keys
- Database credentials

## Scaling Considerations

### Database Scaling

1. **Connection Pooling**
   ```env
   DATABASE_URL="postgresql://...?pgbouncer=true&connection_limit=10"
   ```

2. **Read Replicas**
   - Use for session queries
   - Use for audit log queries
   - Keep writes on primary

3. **Indexing**
   ```sql
   CREATE INDEX idx_session_user ON "Session"(userId);
   CREATE INDEX idx_session_refresh ON "Session"(refreshToken);
   CREATE INDEX idx_audit_user ON "AuditLog"(userId);
   ```

### Application Scaling

1. **Horizontal Scaling**
   - Deploy multiple instances
   - Use load balancer
   - Session data in database (not memory)

2. **Rate Limiting with Redis**
   ```typescript
   // Replace in-memory with Redis
   import { RateLimiterRedis } from 'rate-limiter-flexible';
   import Redis from 'ioredis';

   const redis = new Redis(process.env.REDIS_URL);
   const limiter = new RateLimiterRedis({
     storeClient: redis,
     points: 100,
     duration: 900,
   });
   ```

3. **Caching**
   - Cache user data (short TTL)
   - Cache session lookups
   - Use Redis or Vercel KV

## Troubleshooting

### WebAuthn Not Working

**Issue:** Passkey registration fails

**Solutions:**
1. Check HTTPS is enabled
2. Verify `rpID` matches domain exactly
3. Verify `origin` matches current URL
4. Check browser console for errors
5. Try different browser
6. Check browser supports WebAuthn

### Database Connection Issues

**Issue:** Cannot connect to database

**Solutions:**
1. Check `DATABASE_URL` format
2. Verify database is running
3. Check SSL mode (`?sslmode=require`)
4. Test connection: `psql $DATABASE_URL`
5. Check firewall rules
6. Verify credentials

### Rate Limit False Positives

**Issue:** Users getting rate limited incorrectly

**Solutions:**
1. Check proxy configuration
2. Use `X-Forwarded-For` header properly
3. Increase limits for authenticated users
4. Implement user-based rate limiting
5. Consider Redis for distributed limiting

### Token Refresh Loop

**Issue:** Continuous token refresh requests

**Solutions:**
1. Check token expiration times
2. Verify JWT secrets are correct
3. Check session version matching
4. Clear browser storage
5. Check for clock skew

## Performance Optimization

### Database Queries

```typescript
// Use select to limit fields
const user = await db.user.findUnique({
  where: { id },
  select: { id: true, email: true, totpEnabled: true },
});

// Use indexes
// Already defined in schema

// Batch operations
const users = await db.user.findMany({
  where: { id: { in: userIds } },
});
```

### API Response Times

Target response times:
- Authentication: < 500ms
- Token refresh: < 200ms
- Session queries: < 100ms
- Passkey operations: < 1s (user interaction)

### Frontend Optimization

```typescript
// Lazy load components
const SessionManager = lazy(() => import('./components/auth/SessionManager'));

// Memoize expensive operations
const processedSessions = useMemo(() => {
  return sessions.map(formatSession);
}, [sessions]);
```

## Support

For deployment issues:
1. Check logs first
2. Review this guide
3. Check SECURITY.md
4. Search GitHub issues
5. Open new issue with details

## License

See LICENSE file for terms.
