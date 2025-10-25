# StoreMIS Vercel Deployment Guide

## Prerequisites
- Vercel account (free tier available)
- Aiven PostgreSQL database (already set up)
- Git repository (GitHub, GitLab, or Bitbucket)

## Step 1: Prepare Your Repository

1. **Commit your changes:**
   ```bash
   git add .
   git commit -m "Fix deployment configuration"
   git push origin main
   ```

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel CLI (Recommended)
1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy your project:**
   ```bash
   vercel
   ```
   - Follow the prompts to configure your project
   - Choose your Git repository
   - Select the framework (Next.js)

### Option B: Deploy via Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your Git repository
4. Vercel will auto-detect Next.js

## Step 3: Configure Environment Variables

**Important:** You need to set environment variables in your Vercel dashboard, NOT in the vercel.json file.

### How to Set Environment Variables in Vercel:

1. **Go to your Vercel dashboard**
2. **Select your project**
3. **Go to Settings → Environment Variables**
4. **Add each variable one by one:**

### Required Environment Variables:
```

```

**Note:** Replace `your-app-name` with your actual Vercel app URL.

### Optional Environment Variables (for email functionality):



## Step 4: Database Setup

1. **Run Prisma migrations:**
   ```bash
   npx prisma migrate deploy
   ```

2. **Generate Prisma client:**
   ```bash
   npx prisma generate
   ```

## Step 5: Deploy and Test

1. **Trigger a new deployment** (if using dashboard method)
2. **Check the deployment logs** for any errors
3. **Test your application** at the provided Vercel URL

## Troubleshooting

### Common Issues:

1. **Build Failures:**
   - Check that all dependencies are in package.json
   - Verify Prisma client is generated
   - Check for TypeScript errors
   - Ensure no conflicting file structures

2. **Database Connection Issues:**
   - Verify your DATABASE_URL is correct
   - Check if your Aiven database allows connections from Vercel IPs
   - Ensure SSL mode is set to 'require'

3. **Environment Variables:**
   - Ensure all required variables are set in Vercel dashboard
   - Check variable names match exactly (case-sensitive)

### Useful Commands:
```bash
# Check Prisma connection
npx prisma db pull

# View database in Prisma Studio
npx prisma studio

# Test build locally
npm run build
```

## Security Notes

1. **Never commit .env files** to your repository
2. **Use strong secrets** for NEXTAUTH_SECRET and JWT_SECRET
3. **Enable SSL** for your database connection
4. **Regularly update dependencies** for security patches

## Post-Deployment

1. **Set up custom domain** (optional)
2. **Configure monitoring** and analytics
3. **Set up automated deployments** from your main branch
4. **Configure backup strategies** for your database

Your StoreMIS application should now be live on Vercel with your Aiven PostgreSQL database!
