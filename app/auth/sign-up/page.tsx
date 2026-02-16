"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { signUpSchema } from "@/lib/schemas"
import { Sparkles, ArrowRight, ShieldCheck, UserPlus, Fingerprint, Mail, Lock, UserCircle } from "lucide-react"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [role, setRole] = useState("student")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const validate = () => {
    const newErrors: Record<string, string> = {}

    const emailError = signUpSchema.email(email)
    if (emailError !== true) newErrors.email = emailError

    const passwordError = signUpSchema.password(password)
    if (passwordError !== true) newErrors.password = passwordError

    const nameError = signUpSchema.fullName(fullName)
    if (nameError !== true) newErrors.fullName = nameError

    if (password !== repeatPassword) {
      newErrors.repeatPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          name: fullName,
          role,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setErrors({
          submit: data.error || "An error occurred during signup",
        })
        return
      }

      router.push("/auth/login?registered=true")
    } catch (error: unknown) {
      setErrors({
        submit: error instanceof Error ? error.message : "An error occurred",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-svh w-full items-center justify-center p-4 md:p-10 overflow-hidden bg-[#030014]">
      {/* Deep Space Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/15 rounded-full blur-[150px] animate-pulse delay-1000 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-indigo-500/5 rounded-full blur-[180px] pointer-events-none" />
      </div>

      <div className="w-full max-w-[500px] relative z-10 animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-3 text-center items-center">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
              <div className="relative w-16 h-16 bg-[#0a0a20] border border-blue-500/20 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:-translate-y-1 group-hover:rotate-3">
                <Sparkles className="w-10 h-10 text-blue-400" />
              </div>
            </div>
            <div className="space-y-1">
              <h1 className="text-4xl font-black tracking-tighter text-white drop-shadow-sm uppercase italic">
                LEARNIFY
              </h1>
              <p className="text-blue-200/80 font-black uppercase tracking-[0.2em] text-[10px]">Initialize New Intelligence Record</p>
            </div>
          </div>

          <Card className="bg-[#0a0b25]/90 backdrop-blur-xl border border-white/10 shadow-[0_0_60px_-12px_rgba(59,130,246,0.4)] relative overflow-hidden rounded-[32px]">
            <CardHeader className="space-y-1 pb-8 px-10 pt-10 text-center border-b border-white/10 bg-white/[0.03]">
              <CardTitle className="text-3xl font-black text-white italic tracking-tight uppercase flex items-center justify-center gap-3">
                <UserPlus className="w-7 h-7 text-blue-400" />
                Forge Identity
              </CardTitle>
              <CardDescription className="text-blue-100/70 font-semibold tracking-wide">
                Join the Nexus Academy and begin your synchronization.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-10">
              <form onSubmit={handleSignUp} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="full-name" className="text-blue-100/90 font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                      <Fingerprint className="w-3.5 h-3.5" />
                      Real Name Org
                    </Label>
                    <Input
                      id="full-name"
                      placeholder="John Doe"
                      required
                      className="bg-[#030014]/50 border-white/20 focus:border-blue-400/50 focus:ring-blue-400/20 transition-all h-12 text-white placeholder:text-white/30 rounded-xl"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                    {errors.fullName && <p className="text-[10px] text-rose-500 font-bold uppercase tracking-tighter">{errors.fullName}</p>}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="role" className="text-blue-100/90 font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                      <UserCircle className="w-3.5 h-3.5" />
                      Designation
                    </Label>
                    <Select value={role} onValueChange={setRole}>
                      <SelectTrigger id="role" className="bg-[#030014]/50 border-white/20 focus:border-blue-400/50 focus:ring-blue-400/20 transition-all h-12 text-white rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0a0b25] border-white/20 text-white">
                        <SelectItem value="student">STUDENT SCHOLAR</SelectItem>
                        <SelectItem value="teacher">NEXUS INSTRUCTOR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-blue-100/90 font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5" />
                    Digital Identifier
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@nexus.com"
                    required
                    className="bg-[#030014]/50 border-white/20 focus:border-blue-400/50 focus:ring-blue-400/20 transition-all h-12 text-white placeholder:text-white/30 rounded-xl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  {errors.email && <p className="text-[10px] text-rose-500 font-bold uppercase tracking-tighter">{errors.email}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="password" className="text-blue-100/90 font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5" />
                      Access Cipher
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      className="bg-[#030014]/50 border-white/20 focus:border-blue-400/50 focus:ring-blue-400/20 transition-all h-12 text-white rounded-xl"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    {errors.password && <p className="text-[10px] text-rose-500 font-bold uppercase tracking-tighter">{errors.password}</p>}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="repeat-password" className="text-blue-100/90 font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verify Cipher
                    </Label>
                    <Input
                      id="repeat-password"
                      type="password"
                      required
                      className="bg-[#030014]/50 border-white/20 focus:border-blue-400/50 focus:ring-blue-400/20 transition-all h-12 text-white rounded-xl"
                      value={repeatPassword}
                      onChange={(e) => setRepeatPassword(e.target.value)}
                    />
                    {errors.repeatPassword && <p className="text-[10px] text-rose-500 font-bold uppercase tracking-tighter">{errors.repeatPassword}</p>}
                  </div>
                </div>

                {errors.submit && (
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold text-center">
                    ERR: {errors.submit.toUpperCase()}
                  </div>
                )}

                <Button type="submit" className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-600/20 transition-all hover:scale-105 active:scale-95 group" disabled={isLoading}>
                  {isLoading ? "INITIALIZING..." : (
                    <div className="flex items-center gap-2">
                      FORGE IDENTITY
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </Button>

                <div className="text-center pt-4">
                  <p className="text-xs text-blue-200/50 font-bold uppercase tracking-widest">
                    Already an elite scholar?{" "}
                    <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 transition-colors underline underline-offset-4">
                      LINK ACCESS
                    </Link>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
