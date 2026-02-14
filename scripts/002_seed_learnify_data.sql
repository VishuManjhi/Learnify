-- Insert seed data for Learnify

-- Note: In production, these would be created via the auth system.
-- For demo purposes, we'll insert directly. In real app, use auth.users.

-- Insert badges
INSERT INTO public.badges (name, description, icon_url, requirement_type, requirement_value) VALUES
('First Steps', 'Complete your first lesson', '🎯', 'lessons', 1),
('Quiz Master', 'Complete 5 quizzes', '🎓', 'quizzes', 5),
('Point Collector', 'Earn 100 points', '⭐', 'points', 100),
('Level Up', 'Reach level 2', 'levels', 2),
('Course Completer', 'Complete 1 course', '✓', 'courses', 1),
('Speed Learner', 'Complete 10 lessons', '⚡', 'lessons', 10)
ON CONFLICT DO NOTHING;

-- Sample quizzes query for existing courses (this requires manual setup in UI first)
-- Once courses and lessons are created, create quizzes through the API or UI
