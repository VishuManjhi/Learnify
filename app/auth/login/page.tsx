"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { toast } from "sonner"
import { Sparkles, Mail, Lock, LogIn, ArrowRight, ShieldCheck } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      toast.success("Account created! Please sign in.")
    }
  }, [searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      })

      if (result?.error) {
        setError("Invalid email or password")
        return
      }

      router.push("/dashboard")
      router.refresh()
    } catch (error: unknown) {
      setError("An error occurred during sign in")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-svh w-full items-center justify-center p-4 md:p-10 overflow-hidden bg-[#030014]">
      {/* Deep Space / Nebula Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/15 rounded-full blur-[150px] animate-pulse delay-1000 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-indigo-500/5 rounded-full blur-[180px] pointer-events-none" />

        {/* Subtle grid pattern for texture */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none mix-blend-overlay" />
      </div>

      <div className="w-full max-w-[440px] relative z-10 animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-3 text-center items-center">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
              <div className="relative w-20 h-20 bg-[#0a0a20] border border-blue-500/20 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:-translate-y-1 group-hover:rotate-3">
                <Sparkles className="w-12 h-12 text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]" />
              </div>
            </div>
            <div className="space-y-1">
              <h1 className="text-5xl font-black tracking-tighter text-white drop-shadow-sm">
                LEARNIFY
              </h1>
              <div className="flex items-center gap-2 justify-center">
                <div className="h-[1px] w-8 bg-blue-500/30" />
                <p className="text-blue-200/80 font-black uppercase tracking-[0.2em] text-[10px]">Portal of Knowledge</p>
                <div className="h-[1px] w-8 bg-blue-500/30" />
              </div>
            </div>
          </div>

          <Card className="bg-[#0a0b25]/90 backdrop-blur-xl border border-white/10 shadow-[0_0_60px_-12px_rgba(59,130,246,0.4)] relative overflow-hidden group rounded-[32px]">
            {/* Animated top border */}
            <div className="absolute top-0 left-0 w-full h-[2px] overflow-hidden">
              <div className="w-full h-full bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-shimmer translate-x-[-100%]" />
            </div>

            <CardHeader className="space-y-1 pb-8 px-8 pt-8 text-center border-b border-white/10 bg-white/[0.03]">
              <CardTitle className="text-2xl font-black text-white italic tracking-tight uppercase flex items-center justify-center gap-2">
                <ShieldCheck className="w-6 h-6 text-blue-400" />
                Access Terminal
              </CardTitle>
              <CardDescription className="text-blue-100/70 font-semibold tracking-wide">
                Identity verification required for academy access.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleLogin} className="space-y-8">
                <div className="space-y-5">
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-blue-100/90 font-black text-xs uppercase tracking-widest flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5" />
                      Digital Identifier
                    </Label>
                    <div className="relative group">
                      <Input
                        id="email"
                        type="email"
                        placeholder="identifier@nexus.com"
                        required
                        className="bg-[#030014]/50 border-white/20 focus:border-blue-400/50 focus:ring-blue-400/20 transition-all h-14 text-white placeholder:text-white/30 rounded-2xl pl-12"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 group-focus-within:text-blue-400 transition-colors">
                        <LogIn className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-blue-200/70 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                        <Lock className="w-3.5 h-3.5" />
                        Security Cipher
                      </Label>
                      <Link
                        href="/auth/forgot-password"
                        className="text-[10px] text-blue-400/70 hover:text-blue-400 transition-colors font-black uppercase tracking-tighter"
                      >
                        Lost Access?
                      </Link>
                    </div>
                    <div className="relative group">
                      <Input
                        id="password"
                        type="password"
                        required
                        className="bg-[#030014]/50 border-white/20 focus:border-blue-400/50 focus:ring-blue-400/20 transition-all h-14 text-white rounded-2xl pl-12"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 group-focus-within:text-blue-400 transition-colors">
                        <Lock className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold text-center animate-in shake-in-1">
                    ERR: {error.toUpperCase()}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-14 text-sm font-black uppercase tracking-[0.2em] bg-blue-600 hover:bg-blue-500 text-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(37,99,235,0.5)] transition-all hover:scale-[1.02] active:scale-[0.98] group"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      Initialize Link
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </Button>

                <div className="text-center">
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-4">OR</p>
                  <Link
                    href="/auth/sign-up"
                    className="group inline-flex items-center gap-2 text-xs font-black text-blue-400/70 hover:text-blue-400 transition-all uppercase tracking-widest"
                  >
                    Forge New Identity
                    <div className="w-6 h-6 rounded-full border border-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/10 transition-colors">
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="flex justify-center items-center gap-6 opacity-40">
            <p className="text-[10px] text-blue-100/70 font-black uppercase tracking-widest">End-to-End Encryption</p>
            <div className="w-1 h-1 rounded-full bg-blue-500/40" />
            <p className="text-[10px] text-blue-100/70 font-black uppercase tracking-widest">Secure Node V4.2</p>
          </div>
        </div>
      </div>
    </div>
  )
}
