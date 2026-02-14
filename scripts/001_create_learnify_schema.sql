-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table (extends Supabase auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin')),
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);
CREATE POLICY "profiles_select_public" ON public.profiles FOR SELECT USING (true);

-- Courses table
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT,
  difficulty_level TEXT DEFAULT 'intermediate' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  max_students INTEGER,
  points_per_lesson INTEGER DEFAULT 10,
  points_per_quiz INTEGER DEFAULT 50,
  image_url TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "courses_select_all" ON public.courses FOR SELECT USING (is_published = TRUE OR auth.uid() = teacher_id);
CREATE POLICY "courses_insert_teacher" ON public.courses FOR INSERT WITH CHECK (auth.uid() = teacher_id);
CREATE POLICY "courses_update_teacher" ON public.courses FOR UPDATE USING (auth.uid() = teacher_id);
CREATE POLICY "courses_delete_teacher" ON public.courses FOR DELETE USING (auth.uid() = teacher_id);

-- Lessons table
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  order_index INTEGER NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lessons_select_own_course" ON public.lessons FOR SELECT 
  USING (
    EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND (is_published = TRUE OR auth.uid() = teacher_id))
  );
CREATE POLICY "lessons_insert_teacher" ON public.lessons FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND auth.uid() = teacher_id)
  );
CREATE POLICY "lessons_update_teacher" ON public.lessons FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND auth.uid() = teacher_id)
  );
CREATE POLICY "lessons_delete_teacher" ON public.lessons FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND auth.uid() = teacher_id)
  );

-- Resources table
CREATE TABLE IF NOT EXISTS public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "resources_select_own_lesson" ON public.resources FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.lessons l 
      JOIN public.courses c ON l.course_id = c.id 
      WHERE l.id = lesson_id AND (c.is_published = TRUE OR auth.uid() = c.teacher_id)
    )
  );
CREATE POLICY "resources_insert_teacher" ON public.resources FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.lessons l 
      JOIN public.courses c ON l.course_id = c.id 
      WHERE l.id = lesson_id AND auth.uid() = c.teacher_id
    )
  );
CREATE POLICY "resources_update_teacher" ON public.resources FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.lessons l 
      JOIN public.courses c ON l.course_id = c.id 
      WHERE l.id = lesson_id AND auth.uid() = c.teacher_id
    )
  );
CREATE POLICY "resources_delete_teacher" ON public.resources FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.lessons l 
      JOIN public.courses c ON l.course_id = c.id 
      WHERE l.id = lesson_id AND auth.uid() = c.teacher_id
    )
  );

-- Quizzes table
CREATE TABLE IF NOT EXISTS public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  passing_score INTEGER DEFAULT 70,
  attempts_allowed INTEGER DEFAULT -1,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quizzes_select_published" ON public.quizzes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.lessons l 
      JOIN public.courses c ON l.course_id = c.id 
      WHERE l.id = lesson_id AND (c.is_published = TRUE OR auth.uid() = c.teacher_id)
    )
  );
CREATE POLICY "quizzes_insert_teacher" ON public.quizzes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.lessons l 
      JOIN public.courses c ON l.course_id = c.id 
      WHERE l.id = lesson_id AND auth.uid() = c.teacher_id
    )
  );
CREATE POLICY "quizzes_update_teacher" ON public.quizzes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.lessons l 
      JOIN public.courses c ON l.course_id = c.id 
      WHERE l.id = lesson_id AND auth.uid() = c.teacher_id
    )
  );
CREATE POLICY "quizzes_delete_teacher" ON public.quizzes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.lessons l 
      JOIN public.courses c ON l.course_id = c.id 
      WHERE l.id = lesson_id AND auth.uid() = c.teacher_id
    )
  );

-- Questions table
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'short_answer', 'true_false')),
  points INTEGER DEFAULT 1,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "questions_select_published" ON public.questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.quizzes q
      JOIN public.lessons l ON q.lesson_id = l.id
      JOIN public.courses c ON l.course_id = c.id
      WHERE q.id = quiz_id AND (c.is_published = TRUE OR auth.uid() = c.teacher_id)
    )
  );
CREATE POLICY "questions_insert_teacher" ON public.questions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.quizzes q
      JOIN public.lessons l ON q.lesson_id = l.id
      JOIN public.courses c ON l.course_id = c.id
      WHERE q.id = quiz_id AND auth.uid() = c.teacher_id
    )
  );

-- Answer options table
CREATE TABLE IF NOT EXISTS public.answer_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.answer_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "answer_options_select_published" ON public.answer_options FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.questions q
      JOIN public.quizzes qz ON q.quiz_id = qz.id
      JOIN public.lessons l ON qz.lesson_id = l.id
      JOIN public.courses c ON l.course_id = c.id
      WHERE q.id = question_id AND (c.is_published = TRUE OR auth.uid() = c.teacher_id)
    )
  );

-- Enrollments table
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(course_id, student_id)
);

ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "enrollments_select_own" ON public.enrollments FOR SELECT
  USING (auth.uid() = student_id OR 
    EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND auth.uid() = teacher_id));
CREATE POLICY "enrollments_insert_student" ON public.enrollments FOR INSERT
  WITH CHECK (auth.uid() = student_id);
CREATE POLICY "enrollments_delete_own" ON public.enrollments FOR DELETE
  USING (auth.uid() = student_id);

-- Lesson progress table
CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(lesson_id, student_id)
);

ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lesson_progress_select_own" ON public.lesson_progress FOR SELECT
  USING (auth.uid() = student_id);
CREATE POLICY "lesson_progress_insert_student" ON public.lesson_progress FOR INSERT
  WITH CHECK (auth.uid() = student_id);
CREATE POLICY "lesson_progress_update_student" ON public.lesson_progress FOR UPDATE
  USING (auth.uid() = student_id);

-- Quiz attempts table
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER,
  percentage FLOAT,
  passed BOOLEAN,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quiz_attempts_select_own" ON public.quiz_attempts FOR SELECT
  USING (auth.uid() = student_id);
CREATE POLICY "quiz_attempts_insert_student" ON public.quiz_attempts FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- Student answers table
CREATE TABLE IF NOT EXISTS public.student_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES public.quiz_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  selected_option_id UUID REFERENCES public.answer_options(id) ON DELETE SET NULL,
  short_answer TEXT,
  is_correct BOOLEAN,
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.student_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "student_answers_select_own" ON public.student_answers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.quiz_attempts qa 
      WHERE qa.id = attempt_id AND auth.uid() = qa.student_id
    )
  );
CREATE POLICY "student_answers_insert_student" ON public.student_answers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.quiz_attempts qa 
      WHERE qa.id = attempt_id AND auth.uid() = qa.student_id
    )
  );

-- Gamification: User stats table
CREATE TABLE IF NOT EXISTS public.user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  level_progress INTEGER DEFAULT 0,
  lessons_completed INTEGER DEFAULT 0,
  quizzes_completed INTEGER DEFAULT 0,
  courses_enrolled INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_stats_select_public" ON public.user_stats FOR SELECT USING (true);
CREATE POLICY "user_stats_insert_own" ON public.user_stats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_stats_update_own" ON public.user_stats FOR UPDATE USING (auth.uid() = user_id);

-- Badges table
CREATE TABLE IF NOT EXISTS public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon_url TEXT,
  requirement_type TEXT NOT NULL CHECK (requirement_type IN ('points', 'lessons', 'quizzes', 'courses')),
  requirement_value INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "badges_select_all" ON public.badges FOR SELECT USING (true);

-- User badges (earned badges)
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_badges_select_own" ON public.user_badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_badges_select_public" ON public.user_badges FOR SELECT USING (true);

-- Email notifications log table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('enrollment', 'quiz_result', 'course_complete', 'badge_earned')),
  related_course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  message TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select_own" ON public.notifications FOR SELECT USING (auth.uid() = recipient_id);
CREATE POLICY "notifications_insert_system" ON public.notifications FOR INSERT WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_courses_teacher_id ON public.courses(teacher_id);
CREATE INDEX IF NOT EXISTS idx_courses_is_published ON public.courses(is_published);
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON public.lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON public.enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON public.enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_student_id ON public.lesson_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_student_id ON public.quiz_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON public.user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON public.user_badges(user_id);
