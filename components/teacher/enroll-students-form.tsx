"use client"

import { useState, type FormEvent, ChangeEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface EnrollStudentsFormProps {
  courseId: string
}

interface EnrollResponse {
  enrolled: { email: string; userId: string }[]
  alreadyEnrolled: { email: string; userId: string }[]
  notFound: string[]
  summary?: {
    totalRequested: number
    enrolled: number
    alreadyEnrolled: number
    notFound: number
  }
}

function extractEmailsFromText(text: string): string[] {
  const parts = text
    .split(/[\n,;]+/g)
    .map((p) => p.trim())
    .filter(Boolean)

  // Simple email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return Array.from(new Set(parts.filter((p) => emailRegex.test(p.toLowerCase()))))
}

export function EnrollStudentsForm({ courseId }: EnrollStudentsFormProps) {
  const [emailsText, setEmailsText] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<EnrollResponse | null>(null)

  const handleCsvChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const emails = extractEmailsFromText(text)
      if (emails.length === 0) {
        setError("No valid email addresses found in CSV")
        return
      }

      // Merge emails from CSV into the textarea for transparency
      const existing = extractEmailsFromText(emailsText)
      const merged = Array.from(new Set([...existing, ...emails]))
      setEmailsText(merged.join("\n"))
      setError(null)
    } catch (err) {
      setError("Failed to read CSV file")
    }
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    const emails = extractEmailsFromText(emailsText)
    if (emails.length === 0) {
      setError("Please provide at least one valid email address")
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`/api/teacher/courses/${courseId}/enroll`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ emails }),
      })

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null
        throw new Error(data?.error || "Failed to enroll students")
      }

      const data = (await response.json()) as EnrollResponse
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to enroll students")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="emails">
            Student emails (one per line, or separated by commas/semicolons)
          </Label>
          <Textarea
            id="emails"
            value={emailsText}
            onChange={(e) => setEmailsText(e.target.value)}
            rows={4}
            placeholder={"student1@example.com\nstudent2@example.com"}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="csv">Or upload CSV containing emails</Label>
          <Input
            id="csv"
            type="file"
            accept=".csv,text/csv"
            onChange={handleCsvChange}
          />
          <p className="text-xs text-muted-foreground">
            The CSV can contain multiple columns; all values that look like emails will be used.
          </p>
        </div>

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">
            {error}
          </div>
        )}

        <Button type="submit" disabled={loading}>
          {loading ? "Enrolling..." : "Enroll Students"}
        </Button>
      </form>

      {result && (
        <div className="space-y-2 text-sm">
          {result.summary && (
            <p className="text-muted-foreground">
              Processed {result.summary.totalRequested} email(s):{" "}
              {result.summary.enrolled} enrolled,{" "}
              {result.summary.alreadyEnrolled} already enrolled,{" "}
              {result.summary.notFound} not found.
            </p>
          )}

          {result.enrolled.length > 0 && (
            <div>
              <p className="font-medium">Newly enrolled:</p>
              <ul className="list-disc list-inside text-muted-foreground">
                {result.enrolled.map((item) => (
                  <li key={item.userId}>{item.email}</li>
                ))}
              </ul>
            </div>
          )}

          {result.alreadyEnrolled.length > 0 && (
            <div>
              <p className="font-medium">Already enrolled:</p>
              <ul className="list-disc list-inside text-muted-foreground">
                {result.alreadyEnrolled.map((item) => (
                  <li key={item.userId}>{item.email}</li>
                ))}
              </ul>
            </div>
          )}

          {result.notFound.length > 0 && (
            <div>
              <p className="font-medium">No user account found for:</p>
              <ul className="list-disc list-inside text-muted-foreground">
                {result.notFound.map((email) => (
                  <li key={email}>{email}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

