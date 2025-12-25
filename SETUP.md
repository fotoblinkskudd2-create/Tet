# Setup Guide - Employee Appraisal Portal

Complete guide to set up the Employee Appraisal Portal locally and for production.

## Table of Contents

1. [Local Development Setup](#local-development-setup)
2. [Environment Configuration](#environment-configuration)
3. [Database Setup](#database-setup)
4. [Running the Application](#running-the-application)
5. [Creating Admin User](#creating-admin-user)
6. [Production Deployment](#production-deployment)

---

## Local Development Setup

### Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL 14+ (or use Docker)
- Git

### Step 1: Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd Tet

# Install dependencies
npm install
# or
yarn install
```

### Step 2: Set Up PostgreSQL

#### Option A: Local PostgreSQL
Install PostgreSQL locally and create a database:
```bash
# MacOS
brew install postgresql
brew services start postgresql
createdb appraisal_db

# Ubuntu/Debian
sudo apt-get install postgresql
sudo service postgresql start
sudo -u postgres createdb appraisal_db
```

#### Option B: Docker PostgreSQL
```bash
docker run --name appraisal-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=appraisal_db \
  -p 5432:5432 \
  -d postgres:14
```

### Step 3: Configure Environment Variables

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your settings
nano .env
```

**Minimum required for local development:**
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/appraisal_db"
NEXTAUTH_SECRET="your-secret-key-generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
```

**Optional (for full functionality):**
```env
# Email (Resend)
RESEND_API_KEY="re_your_api_key"
FROM_EMAIL="noreply@yourdomain.com"

# Google OAuth
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

### Step 4: Initialize Database

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to view database
npx prisma studio
```

### Step 5: Run Development Server

```bash
npm run dev
# or
yarn dev
```

Visit http://localhost:3000

---

## Environment Configuration

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `NEXTAUTH_SECRET` | Secret key for NextAuth | Generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Full URL of your app | `http://localhost:3000` or production URL |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `RESEND_API_KEY` | Resend email API key | - |
| `FROM_EMAIL` | Email sender address | `noreply@example.com` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | - |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | - |
| `NEXT_PUBLIC_APP_NAME` | Application name | `Employee Appraisal Portal` |
| `NEXT_PUBLIC_APP_URL` | Public app URL | Same as `NEXTAUTH_URL` |
| `NEXT_PUBLIC_MAX_FILE_SIZE` | Max file upload size | `5242880` (5MB) |

---

## Database Setup

### Understanding the Schema

The application uses these main models:
- **User** - Employees, Managers, and Admins
- **AppraisalTemplate** - Question templates created by admins
- **Appraisal** - Individual appraisal instances
- **Response** - Employee and manager answers to questions
- **Notification** - In-app notifications

### Running Migrations

```bash
# Development (creates migration and applies it)
npx prisma migrate dev

# Production (applies existing migrations)
npx prisma migrate deploy

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

### Viewing/Editing Data

```bash
# Open Prisma Studio (database GUI)
npx prisma studio
```

---

## Running the Application

### Development Mode

```bash
npm run dev
```
- Hot reload enabled
- Detailed error messages
- Runs on http://localhost:3000

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Linting

```bash
npm run lint
```

---

## Creating Admin User

### Method 1: Sign Up + Manual Role Update

1. Start the app: `npm run dev`
2. Go to http://localhost:3000/auth/signup
3. Create account with your email
4. Open Prisma Studio: `npx prisma studio`
5. Go to User model
6. Find your user by email
7. Change `role` from `EMPLOYEE` to `ADMIN`
8. Save changes

### Method 2: Direct Database Query

```bash
# Connect to database
psql <your-database-url>

# Update user role
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your-email@example.com';
```

### Method 3: Prisma Script

Create `scripts/create-admin.ts`:
```typescript
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: { role: 'ADMIN' },
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })

  console.log('Admin user created:', admin)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

Run it:
```bash
npx ts-node scripts/create-admin.ts
```

---

## Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions for:
- Railway (recommended)
- Vercel + Railway Database
- Other platforms

### Quick Deploy to Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Add PostgreSQL
railway add --database postgresql

# Deploy
railway up
```

---

## Troubleshooting

### "Cannot connect to database"
- Verify PostgreSQL is running: `pg_isready`
- Check `DATABASE_URL` is correct
- Ensure database exists: `psql -l`

### "Prisma Client not found"
```bash
npx prisma generate
```

### "Module not found" errors
```bash
rm -rf node_modules package-lock.json
npm install
```

### Email not sending
- Check `RESEND_API_KEY` is valid
- Verify email domain in Resend dashboard
- Check logs for specific errors

### Port 3000 already in use
```bash
# Find and kill process
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

---

## Development Workflow

### Creating a New Feature

1. Create feature branch:
   ```bash
   git checkout -b feature/your-feature
   ```

2. Make changes and test:
   ```bash
   npm run dev
   ```

3. Run migrations if database changed:
   ```bash
   npx prisma migrate dev --name your-migration
   ```

4. Commit and push:
   ```bash
   git add .
   git commit -m "Add your feature"
   git push origin feature/your-feature
   ```

### Database Changes

1. Update `prisma/schema.prisma`
2. Create migration:
   ```bash
   npx prisma migrate dev --name describe-changes
   ```
3. Commit both schema and migration files

---

## Testing the Application

### User Roles to Test

1. **Admin:**
   - Create appraisal templates
   - Assign appraisals to employees
   - View all appraisals
   - Manage users

2. **Manager:**
   - Review submitted appraisals
   - Provide feedback and ratings
   - Complete appraisals
   - Download PDF reports

3. **Employee:**
   - View assigned appraisals
   - Complete self-assessment
   - Submit for review
   - View completed appraisals

### Test Workflow

1. Create admin user (see above)
2. Create template as admin
3. Create employee and manager users
4. Assign appraisal to employee
5. Complete appraisal as employee
6. Review as manager
7. Download PDF report

---

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth Documentation](https://next-auth.js.org)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Railway Documentation](https://docs.railway.app)

---

## Getting Help

If you encounter issues:
1. Check this guide and DEPLOYMENT.md
2. Review application logs
3. Check database connection
4. Verify environment variables
5. Consult the documentation links above

Happy coding! 🚀
