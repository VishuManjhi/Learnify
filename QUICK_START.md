# Learnify - Quick Start Guide

Get Learnify up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Supabase account (free tier works great)

## Step 1: Clone & Install

\`\`\`bash
# Clone the repository (or download the code)
cd learnify

# Install dependencies
npm install
\`\`\`

## Step 2: Set Up Supabase

1. Go to [supabase.com](https://supabase.com)
2. Create a new project (choose PostgreSQL)
3. Wait for database to initialize
4. Go to **Settings > API** to get your credentials:
   - Copy your **Project URL**
   - Copy your **Anon Public Key**
   - Copy your **Service Role Key**

## Step 3: Configure Environment Variables

Create `.env.local` in the project root:

\`\`\`bash
# Copy the template
cp .env.example .env.local

# Edit .env.local and add your Supabase credentials:
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
SUPABASE_JWT_SECRET=your-jwt-secret
POSTGRES_URL=your-postgres-url
POSTGRES_PRISMA_URL=your-postgres-prisma-url
POSTGRES_URL_NON_POOLING=your-postgres-url-non-pooling
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-password
POSTGRES_DATABASE=postgres
POSTGRES_HOST=your-postgres-host
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/auth/callback
\`\`\`

## Step 4: Run Database Migrations

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire content from `scripts/001_create_learnify_schema.sql`
4. Paste into the SQL editor
5. Click **Run**
6. Wait for completion (takes ~30 seconds)

Then seed demo data:

1. Create another new query
2. Copy content from `scripts/002_seed_learnify_data.sql`
3. Paste and run

## Step 5: Start Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser!

## First Time Setup

### Create a Teacher Account

1. Click **Get Started** on homepage
2. Select **Teacher** role
3. Sign up with email
4. Check email for confirmation link
5. Click link to confirm email
6. You'll be redirected to dashboard

### Create a Student Account

1. Open new private/incognito window
2. Repeat signup process but select **Student** role
3. Two accounts in different roles!

### Try It Out

**As Teacher**:
1. Dashboard → Create Course
2. Fill in course details
3. Click Create
4. Add lessons to your course

**As Student**:
1. Go to Browse Courses
2. Search for teacher's course
3. Click Enroll
4. View lessons
5. Take quizzes
6. Earn points!

## Troubleshooting

### "Connection refused" error
- Make sure Supabase project is running
- Check `.env.local` has correct credentials
- Run `npm install` again

### "Email confirmation required"
- Check your email (including spam folder)
- Click confirmation link in email
- Login will work after confirmation

### "Page not found" after signup
- Make sure `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` is set correctly
- Try refreshing the page
- Check browser console for errors

### Database migration errors
- Ensure you copied the SQL correctly
- Check for any existing tables (drop if needed)
- Run migration again

## Key URLs

- **Home**: http://localhost:3000
- **Dashboard**: http://localhost:3000/dashboard
- **Courses**: http://localhost:3000/courses
- **Leaderboard**: http://localhost:3000/leaderboard
- **Login**: http://localhost:3000/auth/login
- **Sign Up**: http://localhost:3000/auth/sign-up

## Next Steps

1. **Customize Branding**: Edit colors in `app/globals.css`
2. **Add Courses**: Create courses through teacher dashboard
3. **Build Features**: Add new API routes and components
4. **Deploy**: Follow `DEPLOYMENT.md` for Vercel deployment
5. **Scale**: Add more users and courses

## Support

- Read `README.md` for detailed documentation
- Check `DEPLOYMENT.md` for deployment help
- See `BUILD_SUMMARY.md` for architecture overview

## Default Test Credentials

Teacher:
- Email: teacher@example.com
- Password: Learnify123!

Student:
- Email: student@example.com
- Password: Learnify123!

(Create these via signup after database is ready)

---

Happy learning! 🎓
\`\`\`
