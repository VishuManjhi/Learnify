// Validation schemas for the app
export const signUpSchema = {
  email: (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || "Invalid email",
  password: (val: string) => val.length >= 8 || "Password must be at least 8 characters",
  fullName: (val: string) => val.length >= 2 || "Full name must be at least 2 characters",
}

export const courseSchema = {
  title: (val: string) => val.length >= 3 || "Title must be at least 3 characters",
  description: (val: string) => val.length >= 10 || "Description must be at least 10 characters",
}

export const lessonSchema = {
  title: (val: string) => val.length >= 3 || "Title must be at least 3 characters",
  content: (val: string) => val.length >= 10 || "Content must be at least 10 characters",
}

export const quizSchema = {
  title: (val: string) => val.length >= 3 || "Title must be at least 3 characters",
  passingScore: (val: number) => (val >= 0 && val <= 100) || "Score must be between 0-100",
}

export const questionSchema = {
  questionText: (val: string) => val.length >= 5 || "Question must be at least 5 characters",
  points: (val: number) => val >= 1 || "Points must be at least 1",
}
