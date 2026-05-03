import type { Diagnostic, DiagnosticResult, VideoLink } from "@/context/DiagnosticsContext"

type RawDiagnosticResult = {
  issue?: string
  description?: string
  severity?: string
  confidence?: number
  recommendation?: string
  recommendations?: string[]
  videoLinks?: VideoLink[]
}

const normalizeSeverity = (severity?: string): DiagnosticResult["severity"] => {
  const value = severity?.toLowerCase()
  if (value === "high" || value === "critical") return "high"
  if (value === "medium") return "medium"
  return "low"
}

export const createDiagnosticHistoryItem = ({
  type,
  title,
  result,
  sourceUri,
  inputSummary,
}: {
  type: Diagnostic["type"]
  title: string
  result: RawDiagnosticResult
  sourceUri?: string
  inputSummary?: string
}): Diagnostic => {
  const recommendations = result.recommendations ?? (result.recommendation ? [result.recommendation] : [])

  return {
    id: `${type}-${Date.now()}`,
    type,
    title,
    date: new Date().toISOString(),
    status: "completed",
    resolved: false,
    sourceUri,
    inputSummary,
    result: {
      issue: result.issue ?? title,
      confidence: result.confidence ?? 0,
      description: result.description ?? "No detailed description was provided.",
      recommendation: recommendations.join("\n"),
      recommendations,
      severity: normalizeSeverity(result.severity),
      videoLinks: result.videoLinks ?? [],
    },
  }
}
