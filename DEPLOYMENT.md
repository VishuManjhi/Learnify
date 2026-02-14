# Learnify Deployment Guide

## Deployment to Vercel

### Prerequisites
- GitHub account with repository
- Vercel account
- Supabase project

### Step 1: Prepare Repository

\`\`\`bash
# Initialize git if needed
git init

# Add all files
git add .

# Commit
git commit -m "Initial Learnify commit"

# Push to GitHub
git push -u origin main
\`\`\`

### Step 2: Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Select "Next.js" framework

### Step 3: Environment Variables

Add these environment variables in Vercel project settings:

\`\`\`
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_JWT_SECRET
POSTGRES_URL
POSTGRES_PRISMA_URL
POSTGRES_URL_NON_POOLING
POSTGRES_USER
POSTGRES_PASSWORD
POSTGRES_DATABASE
POSTGRES_HOST
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=https://yourdomain.com/auth/callback
\`\`\`

### Step 4: Deploy

Click "Deploy" and Vercel will automatically:
1. Build your Next.js app
2. Run optimizations
3. Deploy to production

### Step 5: Setup Custom Domain (Optional)

1. Add your domain in Vercel project settings
2. Update DNS records
3. Enable automatic HTTPS

## Database Setup

### Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Get your project credentials

### Run Migrations

Via Supabase SQL Editor:

1. Open SQL Editor
2. Run `scripts/001_create_learnify_schema.sql`
3. Run `scripts/002_seed_learnify_data.sql`

Or via command line:

\`\`\`bash
supabase db push
supabase seed run
\`\`\`

## Post-Deployment Checklist

- [ ] Test authentication flow
- [ ] Create test courses
- [ ] Verify email notifications
- [ ] Test quiz functionality
- [ ] Check leaderboard updates
- [ ] Monitor database performance
- [ ] Set up error tracking (Sentry)
- [ ] Enable CORS if needed
- [ ] Configure rate limiting
- [ ] Backup database

## Monitoring

### Vercel Analytics
- Built-in performance monitoring
- Check deployment logs
- Monitor function execution times

### Supabase Monitoring
- Database query performance
- Auth logs
- Real-time activity

## Troubleshooting

### Common Issues

**Auth not working**
- Check environment variables
- Verify email confirmation is enabled
- Check callback URL matches

**Database connection errors**
- Verify connection string
- Check network access
- Ensure IP is whitelisted

**Quiz scoring not updating**
- Check RLS policies
- Verify user_stats table has user entry
- Monitor database logs

## Scaling

### Database Optimization
- Enable connection pooling
- Add indexes on frequently queried columns
- Archive old quiz attempts

### API Performance
- Implement caching strategies
- Use database read replicas
- Enable CDN for static assets

## Backup & Recovery

### Automated Backups
Supabase provides automatic daily backups.

### Manual Backup

\`\`\`bash
# Via Supabase CLI
supabase db pull

# Export as SQL
pg_dump connection_string > backup.sql
\`\`\`

### Restore

\`\`\`bash
psql connection_string < backup.sql
\`\`\`

---

Need help? Check the [README.md](README.md) or contact support.
