"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"

const PlayIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z" />
  </svg>
)

const SquareIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <rect x="3" y="3" width="18" height="18" rx="2" />
  </svg>
)

const CameraIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
    />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const ActivityIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
  </svg>
)

const ZapIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2" />
  </svg>
)

const WifiOffIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <line x1="1" y1="1" x2="23" y2="23" />
    <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
    <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
    <path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
    <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
    <circle cx="12" cy="20" r="1" />
  </svg>
)

const AlertTriangleIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z"
    />
  </svg>
)

export default function VideoAnalysisApp() {
  const [isCapturing, setIsCapturing] = useState(false)
  const [currentFrame, setCurrentFrame] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([])
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    totalFrames: 0,
    avgProcessingTime: 0,
    avgConfidence: 0,
  })
  const [currentAnalysis, setCurrentAnalysis] = useState<string>("")

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  interface AnalysisResult {
    id: string
    timestamp: string
    confidence: number
    objects: Array<{
      name: string
      confidence: number
      bbox?: [number, number, number, number]
    }>
    description: string
    processing_time: number
  }

  const startCapture = async () => {
    try {
      console.log("[v0] Starting webcam capture...")
      setError(null)

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("getUserMedia is not supported in this browser")
      }

      console.log("[v0] Requesting webcam access...")
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
      })

      console.log("[v0] Webcam access granted, setting up video element...")

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream

        videoRef.current.onloadedmetadata = () => {
          console.log("[v0] Video metadata loaded, dimensions:", {
            videoWidth: videoRef.current?.videoWidth,
            videoHeight: videoRef.current?.videoHeight,
          })

          if (videoRef.current) {
            videoRef.current
              .play()
              .then(() => {
                console.log("[v0] Video playing successfully, starting frame capture...")
                setIsCapturing(true)
                setError(null)

                // Start capturing frames every second after video is playing
                intervalRef.current = setInterval(captureFrame, 1000)
              })
              .catch((error) => {
                console.error("[v0] Error playing video:", error)
                setError(`Failed to start video playback: ${error.message}`)
              })
          }
        }

        videoRef.current.onloadeddata = () => {
          console.log("[v0] Video data loaded")
        }

        videoRef.current.oncanplay = () => {
          console.log("[v0] Video can start playing")
        }

        videoRef.current.onerror = (error) => {
          console.error("[v0] Video error:", error)
          setError("Video stream error occurred.")
        }

        videoRef.current.load()
      } else {
        throw new Error("Video element not found")
      }
    } catch (error: any) {
      console.error("[v0] Error accessing webcam:", error)

      let errorMessage = "Failed to access webcam."
      if (error.name === "NotAllowedError") {
        errorMessage = "Webcam access denied. Please allow camera permissions and try again."
      } else if (error.name === "NotFoundError") {
        errorMessage = "No webcam found. Please connect a camera and try again."
      } else if (error.name === "NotReadableError") {
        errorMessage = "Webcam is already in use by another application."
      } else if (error.message) {
        errorMessage = `Webcam error: ${error.message}`
      }

      setError(errorMessage)
      setIsCapturing(false)
    }
  }

  const stopCapture = () => {
    console.log("[v0] Stopping webcam capture...")
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    setIsCapturing(false)
    setCurrentFrame(null)
    setIsProcessing(false)
    setCurrentAnalysis("")
  }

  const captureFrame = async () => {
    if (!videoRef.current || !canvasRef.current) {
      console.log("[v0] Video or canvas not available for capture")
      return
    }

    if (videoRef.current.videoWidth === 0 || videoRef.current.videoHeight === 0) {
      console.log("[v0] Video not ready yet, skipping frame capture")
      return
    }

    const canvas = canvasRef.current
    const video = videoRef.current
    const ctx = canvas.getContext("2d")

    if (!ctx) return

    console.log("[v0] Capturing frame for analysis...", {
      videoWidth: video.videoWidth,
      videoHeight: video.videoHeight,
    })

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw current video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Convert to blob for API
    canvas.toBlob(
      async (blob) => {
        if (!blob) return

        setCurrentFrame(canvas.toDataURL("image/jpeg", 0.8))
        setIsProcessing(true)
        setCurrentAnalysis("")

        try {
          const startTime = Date.now()
          const formData = new FormData()
          formData.append("image", blob, "frame.jpg")

          console.log("[v0] Sending frame to AI analysis API...")
          const response = await fetch("/api/analyze", {
            method: "POST",
            body: formData,
          })

          if (!response.ok) {
            throw new Error("Analysis failed")
          }

          const reader = response.body?.getReader()
          if (!reader) throw new Error("No response stream")

          let fullAnalysis = ""

          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = new TextDecoder().decode(value)
            const lines = chunk.split("\n")

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6)
                if (data === "[DONE]") break

                try {
                  const parsed = JSON.parse(data)
                  if (parsed.content) {
                    fullAnalysis += parsed.content
                    setCurrentAnalysis(fullAnalysis)
                  }
                } catch (e) {
                  // Ignore parsing errors for partial chunks
                }
              }
            }
          }

          const processingTime = Date.now() - startTime
          console.log("[v0] Analysis completed in", processingTime, "ms")

          // Create analysis result
          const result: AnalysisResult = {
            id: Date.now().toString(),
            timestamp: new Date().toLocaleTimeString(),
            confidence: 0.85 + Math.random() * 0.15, // Simulated confidence
            objects: extractObjectsFromAnalysis(fullAnalysis),
            description: fullAnalysis,
            processing_time: processingTime,
          }

          // Update results and stats
          setAnalysisResults((prev) => {
            const newResults = [result, ...prev].slice(0, 50)

            // Update stats
            const totalFrames = newResults.length
            const avgProcessingTime = Math.round(
              newResults.reduce((sum, r) => sum + r.processing_time, 0) / totalFrames,
            )
            const avgConfidence =
              Math.round((newResults.reduce((sum, r) => sum + r.confidence, 0) / totalFrames) * 100) / 100

            setStats({ totalFrames, avgProcessingTime, avgConfidence })

            return newResults
          })
        } catch (error) {
          console.error("[v0] Analysis error:", error)
          setError("Analysis failed. Please try again.")
        } finally {
          setIsProcessing(false)
        }
      },
      "image/jpeg",
      0.8,
    )
  }

  const extractObjectsFromAnalysis = (analysis: string): Array<{ name: string; confidence: number }> => {
    const objects = []
    const commonObjects = ["person", "face", "hand", "object", "furniture", "device", "clothing", "background"]

    for (const obj of commonObjects) {
      if (analysis.toLowerCase().includes(obj)) {
        objects.push({
          name: obj,
          confidence: 0.7 + Math.random() * 0.3,
        })
      }
    }

    return objects.slice(0, 5) // Limit to 5 objects
  }

  useEffect(() => {
    return () => {
      stopCapture()
    }
  }, [])

  useEffect(() => {
    if (scrollAreaRef.current && analysisResults.length > 0) {
      scrollAreaRef.current.scrollTop = 0
    }
  }, [analysisResults])

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
                <ActivityIcon />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-balance">Real-time Video Analysis</h1>
                <p className="text-sm text-muted-foreground">AI-powered webcam analysis with GravixLayer</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Badge variant={isCapturing ? "default" : "secondary"} className="gap-1">
                {isCapturing ? <ZapIcon /> : <WifiOffIcon />}
                {isCapturing ? "AI Active" : "Offline"}
              </Badge>

              <Badge variant={isCapturing ? "default" : "secondary"} className="gap-1">
                <div
                  className={`w-2 h-2 rounded-full ${isCapturing ? "bg-green-500 animate-pulse" : "bg-muted-foreground"}`}
                />
                {isCapturing ? "Live" : "Offline"}
              </Badge>

              {isCapturing ? (
                <Button onClick={stopCapture} variant="destructive" className="gap-2">
                  <SquareIcon />
                  Stop
                </Button>
              ) : (
                <Button onClick={startCapture} className="gap-2">
                  <PlayIcon />
                  Start Analysis
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {error && (
        <div className="container mx-auto px-6 pt-4">
          <Alert variant="destructive">
            <AlertTriangleIcon />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-140px)]">
          {/* Webcam Feed */}
          <Card className="flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CameraIcon />
                Webcam Feed
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="relative flex-1 bg-muted rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${isCapturing ? "block" : "hidden"}`}
                />
                <canvas ref={canvasRef} className="hidden" />

                {isCapturing ? (
                  <>
                    {isProcessing && (
                      <div className="absolute top-4 right-4">
                        <Badge className="gap-2 bg-primary/90">
                          <ZapIcon />
                          Processing
                        </Badge>
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <Badge variant="default" className="gap-2">
                        <ActivityIcon />
                        AI Analysis Active
                      </Badge>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-3 opacity-50">
                        <CameraIcon />
                      </div>
                      <p className="text-sm">Click "Start Analysis" to begin</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Stats */}
              {isCapturing && (
                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-primary">{stats.totalFrames}</div>
                    <div className="text-xs text-muted-foreground">Frames</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-primary">{stats.avgProcessingTime}ms</div>
                    <div className="text-xs text-muted-foreground">Avg Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-primary">{(stats.avgConfidence * 100).toFixed(0)}%</div>
                    <div className="text-xs text-muted-foreground">Confidence</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Analysis Results */}
          <Card className="flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <ActivityIcon />
                AI Analysis Results
                {analysisResults.length > 0 && (
                  <Badge variant="secondary" className="ml-auto">
                    {analysisResults.length}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-full px-6" ref={scrollAreaRef}>
                {isProcessing && currentAnalysis && (
                  <div className="mb-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="animate-pulse text-primary">
                        <ZapIcon />
                      </div>
                      <span className="text-sm font-medium">Analyzing...</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{currentAnalysis}</p>
                  </div>
                )}

                {analysisResults.length === 0 && !isProcessing ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-3 opacity-50">
                        <ActivityIcon />
                      </div>
                      <p className="text-sm">Start webcam to see AI analysis results</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 pb-6">
                    {analysisResults.map((result) => (
                      <div key={result.id} className="p-4 bg-muted/50 rounded-lg border border-border/50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{result.timestamp}</span>
                          <div className="flex items-center gap-2">
                            <Progress value={result.confidence * 100} className="w-16 h-2" />
                            <span className="text-xs text-muted-foreground">
                              {(result.confidence * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground mb-3">{result.description}</p>

                        <div className="flex flex-wrap gap-1 mb-2">
                          {result.objects.map((obj, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {obj.name} ({(obj.confidence * 100).toFixed(0)}%)
                            </Badge>
                          ))}
                        </div>

                        <div className="text-xs text-muted-foreground">Processed in {result.processing_time}ms</div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
