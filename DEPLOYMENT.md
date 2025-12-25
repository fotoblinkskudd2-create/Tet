# Deployment Guide - Employee Appraisal Portal

This guide will walk you through deploying the Employee Appraisal Portal to Railway with PostgreSQL.

## Prerequisites

- Railway account (sign up at https://railway.app)
- GitHub account (for connecting your repository)
- Resend account for email notifications (optional but recommended - https://resend.com)
- Google Cloud Console account (optional, for Google OAuth)

## Step 1: Prepare Your Application

1. **Ensure all code is committed to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Review your `.env.example` file** to understand required environment variables.

## Step 2: Create a Railway Project

1. Go to [Railway.app](https://railway.app) and sign in
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Authorize Railway to access your GitHub account
5. Select your repository

## Step 3: Add PostgreSQL Database

1. In your Railway project, click "New Service"
2. Select "Database"
3. Choose "PostgreSQL"
4. Railway will automatically create a PostgreSQL database and provide a `DATABASE_URL`

## Step 4: Configure Environment Variables

In your Railway project settings, add the following environment variables:

### Required Variables:

```env
# Database (automatically provided by Railway PostgreSQL)
DATABASE_URL=<automatically set by Railway>

# NextAuth
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
NEXTAUTH_URL=https://your-app.railway.app

# Email (Resend) - Get API key from https://resend.com
RESEND_API_KEY=re_your_api_key_here
FROM_EMAIL=noreply@yourdomain.com

# App Configuration
NEXT_PUBLIC_APP_NAME=Employee Appraisal Portal
NEXT_PUBLIC_APP_URL=https://your-app.railway.app
NEXT_PUBLIC_MAX_FILE_SIZE=5242880
```

### Optional Variables (for Google OAuth):

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXT_PUBLIC_GOOGLE_AUTH_ENABLED=true
```

## Step 5: Configure Build Settings

Railway should auto-detect your Next.js app, but verify these settings:

- **Build Command:** `npm run build` (or `yarn build`)
- **Start Command:** `npm start` (or `yarn start`)
- **Install Command:** `npm install` (or `yarn install`)

## Step 6: Deploy

1. Railway will automatically start deploying your app
2. Monitor the deployment logs for any errors
3. Once deployed, Railway will provide a URL (e.g., `your-app.railway.app`)

## Step 7: Initialize Database

After your first deployment:

1. Railway will automatically run Prisma migrations through the `postinstall` script
2. To manually run migrations, use Railway's CLI:
   ```bash
   railway run npx prisma migrate deploy
   ```

3. To seed the database with an admin user, connect to your Railway environment:
   ```bash
   railway run npx prisma studio
   ```
   Or create an admin user via the signup page and then manually update their role in the database.

## Step 8: Set Up Email (Resend)

1. Sign up at [Resend.com](https://resend.com)
2. Add and verify your domain (or use their test domain for development)
3. Create an API key
4. Add the API key to your Railway environment variables as `RESEND_API_KEY`
5. Set `FROM_EMAIL` to your verified email address

## Step 9: Set Up Google OAuth (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or select existing)
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure OAuth consent screen
6. Set authorized redirect URIs:
   - `https://your-app.railway.app/api/auth/callback/google`
   - `http://localhost:3000/api/auth/callback/google` (for development)
7. Copy Client ID and Client Secret
8. Add to Railway environment variables

## Step 10: Create Initial Admin User

### Method 1: Manual Database Update
1. Sign up through the app as a regular user
2. Use Railway's PostgreSQL client or Prisma Studio:
   ```bash
   railway run npx prisma studio
   ```
3. Find your user in the User table
4. Change the `role` field from `EMPLOYEE` to `ADMIN`

### Method 2: Direct Database Access
Connect to your Railway PostgreSQL database and run:
```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your-email@example.com';
```

## Step 11: Verify Deployment

1. Visit your deployed URL
2. Sign up or log in as admin
3. Test creating templates
4. Test assigning appraisals
5. Test the employee and manager workflows
6. Test PDF generation

## Monitoring and Logs

- **View Logs:** Railway dashboard → Your service → Logs tab
- **Database Logs:** Railway dashboard → PostgreSQL service → Logs tab
- **Metrics:** Railway provides CPU, memory, and network metrics

## Custom Domain (Optional)

1. In Railway project settings, go to "Settings" → "Domains"
2. Click "Add Domain"
3. Enter your custom domain
4. Update your DNS records as instructed
5. Update `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` environment variables

## Troubleshooting

### Database Connection Issues
```bash
# Test database connection
railway run npx prisma db push
```

### Build Failures
- Check that all dependencies are in `package.json`
- Verify build logs for specific errors
- Ensure `NODE_VERSION` is set if needed (e.g., `NODE_VERSION=18`)

### Email Not Sending
- Verify Resend API key is correct
- Check domain verification in Resend dashboard
- Review Railway logs for email errors

### Environment Variables Not Loading
- Ensure variables are set in Railway dashboard
- Restart the service after adding variables
- Use `railway variables` command to verify

## Alternative: Deployment to Vercel + Railway Database

1. **Deploy to Vercel:**
   ```bash
   npm i -g vercel
   vercel
   ```

2. **Use Railway PostgreSQL:**
   - Create PostgreSQL database on Railway
   - Copy `DATABASE_URL` from Railway
   - Add to Vercel environment variables

3. **Configure Vercel:**
   - Add all environment variables from `.env.example`
   - Set `NEXTAUTH_URL` to your Vercel deployment URL

## Security Best Practices

1. **Always use strong secrets:**
   ```bash
   openssl rand -base64 32
   ```

2. **Enable HTTPS only** (Railway does this automatically)

3. **Regularly update dependencies:**
   ```bash
   npm audit
   npm audit fix
   ```

4. **Set up proper CORS** if using custom domains

5. **Monitor logs** for suspicious activity

6. **Backup database regularly** (Railway provides automatic backups)

## Support

For issues:
- Check Railway documentation: https://docs.railway.app
- Check Next.js documentation: https://nextjs.org/docs
- Check Prisma documentation: https://www.prisma.io/docs

## Cost Estimates

- **Railway Starter Plan:** $5/month (includes 500 hours, 512MB RAM)
- **Railway PostgreSQL:** Included in plan
- **Resend:** Free tier includes 100 emails/day
- **Total:** ~$5/month for small teams

---

Your Employee Appraisal Portal is now deployed and ready to use! 🎉
