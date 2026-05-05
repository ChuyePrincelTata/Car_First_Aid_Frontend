import type { Diagnostic, DiagnosticResult, VideoLink } from "@/context/DiagnosticsContext"

type RawDiagnosticResult = {
  issue?: string
  description?: string
  severity?: string
  confidence?: number
  recommendation?: string
  recommendations?: string[]
  videoLinks?: VideoLink[]
  video_links?: VideoLink[]
}

const normalizeSeverity = (severity?: string): DiagnosticResult["severity"] => {
  const value = severity?.toLowerCase()
  if (value === "high" || value === "critical") return "high"
  if (value === "medium") return "medium"
  return "low"
}

export const createYouTubeSearchUrl = (query: string) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`

export const getSafeVideoUrl = (video: VideoLink, issue?: string) => {
  const hasPlaceholderId = /watch\?v=example/i.test(video.url)
  if (!video.url || hasPlaceholderId) {
    return createYouTubeSearchUrl(`${issue ?? video.title} car repair`)
  }

  return video.url
}

export const getFallbackVideoLinks = (issue: string): VideoLink[] => [
  {
    title: `Search YouTube: ${issue} diagnosis`,
    url: createYouTubeSearchUrl(`${issue} diagnosis car repair`),
  },
  {
    title: `Search YouTube: ${issue} fix`,
    url: createYouTubeSearchUrl(`${issue} fix car repair`),
  },
]

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
  const issue = result.issue ?? title
  const recommendations = result.recommendations ?? (result.recommendation ? [result.recommendation] : [])
  const rawVideoLinks = result.videoLinks ?? result.video_links ?? getFallbackVideoLinks(issue)

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
      issue,
      confidence: result.confidence ?? 0,
      description: result.description ?? "No detailed description was provided.",
      recommendation: recommendations.join("\n"),
      recommendations,
      severity: normalizeSeverity(result.severity),
      videoLinks: rawVideoLinks.map((video) => ({
        ...video,
        url: getSafeVideoUrl(video, issue),
      })),
    },
  }
}
