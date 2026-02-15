# Learnify - Gamified Learning Management System

A full-stack, responsive Learning Management System (LMS) built with Next.js, MongoDB, and React. Learnify gamifies the learning experience with points, badges, levels, and leaderboards.

## Features

### For Teachers
- ✅ Create and manage courses
- ✅ Create lessons with content and resources
- ✅ Build quizzes with multiple question types (multiple choice, true/false, short answer)
- ✅ Enroll and manage students
- ✅ View class analytics and student progress
- ✅ Publish/unpublish courses
- ✅ Track student completion rates

### For Students
- ✅ Browse and search courses
- ✅ Enroll in courses
- ✅ View lessons and learning materials
- ✅ Attempt quizzes with instant grading
- ✅ Track learning progress
- ✅ Earn points and badges
- ✅ Level up system
- ✅ View global leaderboard
- ✅ Receive email notifications

### Admin
- ✅ User management
- ✅ Course moderation
- ✅ System analytics
- ✅ Badge management

### Gamification
- 🎮 Points system (per lesson, per quiz)
- 🏆 Badges for milestones
- 📊 Level progression (100 points per level)
- 🎯 Global and class leaderboards
- 🔥 Streak tracking (coming soon)

## Tech Stack

### Frontend
- **Framework**: Next.js 16 with App Router
- **UI**: React 19 + shadcn/ui
- **Styling**: Tailwind CSS v4
- **Forms**: React Hook Form + Zod
- **State**: SWR for data fetching

### Backend
- **Database**: PostgreSQL (Supabase)
- **Auth**: Supabase Auth (email/password)
- **API**: REST API + GraphQL (Apollo optional)
- **Server Functions**: Next.js API Routes
- **Validation**: Server & client validation

### DevOps
- **Hosting**: Vercel
- **Database**: Supabase PostgreSQL
- **Storage**: Vercel Blob (file uploads)
- **Email**: Resend (email notifications)

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/yourusername/learnify.git
cd learnify
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
# or
yarn install
\`\`\`

3. Set up environment variables (.env.local):
\`\`\`bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_JWT_SECRET=your_jwt_secret
\`\`\`

4. Run database migrations:
\`\`\`bash
# Run via Supabase dashboard or:
npm run db:migrate
\`\`\`

5. Seed demo data:
\`\`\`bash
npm run db:seed
\`\`\`

6. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

\`\`\`
learnify/
├── app/
│   ├── api/                    # REST API routes
│   ├── auth/                   # Authentication pages
│   ├── dashboard/              # User dashboards
│   ├── courses/                # Course pages
│   ├── teacher/                # Teacher-specific pages
│   ├── leaderboard/            # Leaderboard page
│   ├── layout.tsx              # Root layout
│   ├── globals.css             # Global styles
│   └── page.tsx                # Home page
├── components/
│   ├── dashboard/              # Dashboard components
│   ├── forms/                  # Form components
│   ├── quiz/                   # Quiz components
│   └── ui/                     # shadcn/ui components
├── lib/
│   ├── supabase/               # Supabase client setup
│   ├── api-helpers.ts          # API helper functions
│   └── schemas.ts              # Validation schemas
├── middleware.ts               # Authentication middleware
├── scripts/                    # Database migration scripts
├── __tests__/                  # Test files
├── next.config.mjs             # Next.js config
├── tailwind.config.ts          # Tailwind config
└── tsconfig.json               # TypeScript config
\`\`\`

## Database Schema

### Core Tables
- **profiles**: User profiles extending auth.users
- **courses**: Course information
- **lessons**: Course lessons
- **resources**: Lesson resources (PDFs, videos, etc.)
- **quizzes**: Quiz questions
- **questions**: Quiz questions with metadata
- **answer_options**: Multiple choice/true-false options
- **enrollments**: Student course enrollments

### Progress & Gamification
- **lesson_progress**: Track completed lessons
- **quiz_attempts**: Track quiz attempts and scores
- **student_answers**: Individual student answers
- **user_stats**: Gamification stats (points, level, etc.)
- **badges**: Badge definitions
- **user_badges**: Earned badges per user

### Notifications
- **notifications**: Email/in-app notifications

## API Endpoints

### Courses
- `GET /api/courses` - List published courses
- `POST /api/courses` - Create course (teacher)
- `GET /api/courses/[id]` - Get course details
- `PUT /api/courses/[id]` - Update course (teacher)
- `DELETE /api/courses/[id]` - Delete course (teacher)

### Enrollments
- `POST /api/enrollments` - Enroll in course

### Quizzes
- `GET /api/quizzes?lesson_id=X` - Get lesson quizzes
- `POST /api/quiz-attempts` - Submit quiz

### User
- `GET /api/user/stats` - Get user stats
- `GET /api/leaderboard` - Get leaderboard

## Authentication

Learnify uses Supabase Auth with email/password authentication:

1. Sign up as Student or Teacher
2. Email confirmation required
3. Session stored in secure cookies
4. Middleware protects authenticated routes

## Gamification System

### Points
- 10 points per lesson completion (default)
- 50 points per passed quiz (default)
- 0 points for failed quiz

### Levels
- Level up every 1000 points
- Current level determines displayed badge
- User stats tracked per user

### Badges
- First Steps: Complete 1 lesson
- Quiz Master: Complete 5 quizzes
- Point Collector: Earn 100 points
- Level Up: Reach level 2
- Course Completer: Complete 1 course
- Speed Learner: Complete 10 lessons

### Leaderboard
- Global leaderboard ranked by total points
- Real-time updates
- Top 50 displayed
- Rank with ties handled by order

## Testing

Run unit tests:
\`\`\`bash
npm run test
\`\`\`

Run integration tests:
\`\`\`bash
npm run test:integration
\`\`\`

## Deployment

### Deploy to Vercel

1. Connect your GitHub repository to Vercel
2. Add environment variables
3. Click Deploy

### Manual Deployment

\`\`\`bash
# Build
npm run build

# Start
npm start
\`\`\`

## Environment Variables

See `.env.example` for all required variables.

## Security Considerations

- ✅ Row-Level Security (RLS) enforced on all tables
- ✅ JWT-based authentication
- ✅ Client and server validation
- ✅ CSRF protection via Supabase middleware
- ✅ Sensitive data accessed server-side only
- ✅ Rate limiting recommended for production

## Performance

- Image optimization with Next.js Image
- Code splitting by route
- Supabase query optimization
- Caching strategy with SWR
- Database indexes on frequently queried columns

## Future Features

- [ ] Real-time collaboration features
- [ ] Streaming video lessons
- [ ] Advanced analytics dashboard
- [ ] Social learning (peer comments, discussions)
- [ ] Certificate generation
- [ ] Payment integration (premium courses)
- [ ] Mobile app
- [ ] Dark mode polish
- [ ] Multi-language support
- [ ] Accessibility audit

## Contributing

Contributions welcome! Please submit a pull request with:
- Clear commit messages
- Tests for new features
- Updated documentation

## License

MIT License - see LICENSE file

## Support

For issues or questions:
1. Check existing GitHub issues
2. Create a new issue with details
3. Include environment and steps to reproduce

## Roadmap

**Q1 2025**
- Real-time notifications
- Advanced analytics
- Certificate system

**Q2 2025**
- Streaming video support
- Advanced quiz types
- Learning paths

**Q3 2025**
- Mobile app (React Native)
- AI-powered recommendations
- Peer review system

---

Built with ❤️ using Next.js and Supabase
