"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, BookOpen, GraduationCap, ArrowRight, ShieldCheck } from "lucide-react"
import Link from "next/link"

interface Course {
  _id: string
  title: string
  description: string
  difficultyLevel?: string
  category?: string
  teacherId?: { _id: string; name?: string }
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("/api/courses?published=true")
        const data = await response.json()
        setCourses(data)
        setFilteredCourses(data)
      } catch (error) {
        console.error("Error fetching courses:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [])

  useEffect(() => {
    const filtered = courses.filter(
      (course) =>
        course.title.toLowerCase().includes(search.toLowerCase()) ||
        course.description.toLowerCase().includes(search.toLowerCase()),
    )
    setFilteredCourses(filtered)
  }, [search, courses])

  if (loading) {
    return (
      <div className="min-h-svh bg-[#030014] flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto" />
            <ShieldCheck className="w-8 h-8 text-blue-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <p className="text-blue-300/50 font-black tracking-[0.3em] uppercase text-xs">Scanning Course Database</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-[#030014] text-white pb-20 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse delay-1000" />
      </div>

      {/* Header Section */}
      <div className="relative z-10 border-b border-white/10 bg-white/[0.03] backdrop-blur-3xl py-16 px-4 shadow-2xl overflow-hidden">
        <div className="max-w-7xl mx-auto text-center space-y-6">
          <Badge variant="outline" className="rounded-full border-blue-500/20 text-blue-400 bg-blue-500/5 px-6 py-1.5 font-black tracking-[0.3em] uppercase text-[10px] animate-in fade-in slide-in-from-top-4 duration-700">
            Academy Database
          </Badge>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white uppercase italic leading-none animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            Browse Courses
          </h1>
          <p className="text-blue-100/70 text-xl font-semibold tracking-tight max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            Discover and enroll in advanced courses to expand your mastery.
          </p>

          <div className="max-w-2xl mx-auto pt-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400/40 group-focus-within:text-blue-400 transition-colors" />
              <Input
                placeholder="Search Courses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-16 pl-16 pr-8 bg-[#0a0b25]/80 backdrop-blur-2xl border-white/10 text-white placeholder:text-white/30 rounded-[24px] focus:border-blue-500/50 focus:ring-blue-500/20 transition-all text-lg font-bold"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="max-w-7xl mx-auto px-4 py-16 relative z-10">
        {filteredCourses.length === 0 ? (
          <div className="text-center py-32 space-y-6">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/5">
              <BookOpen className="w-10 h-10 text-white/10" />
            </div>
            <p className="text-blue-200/30 text-2xl font-black italic uppercase tracking-tighter">No Courses Identified. Adjust Search Query.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <Link key={course._id} href={`/courses/${course._id}`} className="group">
                <Card className="h-full bg-[#0a0b25]/60 backdrop-blur-xl border-white/10 rounded-[40px] overflow-hidden hover:border-blue-400/40 hover:shadow-[0_0_50px_-15px_rgba(59,130,246,0.5)] transition-all duration-500 hover:-translate-y-2 relative border-t-blue-500/30 shadow-2xl">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-all duration-700">
                    <BookOpen className="w-16 h-16 text-blue-400" />
                  </div>

                  <CardHeader className="p-10 pb-4">
                    <div className="flex justify-between items-start mb-6">
                      <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 rounded-lg py-1 px-4 text-[10px] font-black uppercase tracking-widest leading-none">
                        {course.category || "General Knowledge"}
                      </Badge>
                      <Badge variant="outline" className="border-white/5 text-white/40 uppercase text-[9px] font-black tracking-widest px-3 py-1 bg-white/[0.02]">
                        {course.difficultyLevel || "Staged"}
                      </Badge>
                    </div>
                    <CardTitle className="text-3xl font-black leading-tight italic tracking-tight group-hover:text-blue-400 transition-colors uppercase">
                      {course.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="px-10 pb-10 flex flex-col justify-between grow">
                    <p className="text-blue-100/70 font-semibold text-sm line-clamp-3 mb-10 min-h-[60px] leading-relaxed">
                      {course.description}
                    </p>

                    <div className="pt-8 border-t border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                          <GraduationCap className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Lead Instructor</p>
                          <p className="text-xs font-bold text-white/90">{course.teacherId?.name || "Neural Network"}</p>
                        </div>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-white/[0.03] group-hover:bg-blue-600 flex items-center justify-center border border-white/5 transition-all">
                        <ArrowRight className="w-5 h-5 text-white opacity-40 group-hover:opacity-100 transition-all" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
