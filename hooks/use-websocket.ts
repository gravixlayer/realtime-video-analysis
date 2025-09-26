"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { VideoAnalysisWebSocket } from "@/lib/websocket"

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

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([])
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    totalFrames: 0,
    avgProcessingTime: 0,
    avgConfidence: 0,
  })

  const wsRef = useRef<VideoAnalysisWebSocket | null>(null)

  const handleAnalysisResult = useCallback((result: AnalysisResult) => {
    setAnalysisResults((prev) => {
      const newResults = [result, ...prev].slice(0, 50) // Keep last 50 results

      // Update stats
      const totalFrames = newResults.length
      const avgProcessingTime = Math.round(newResults.reduce((sum, r) => sum + r.processing_time, 0) / totalFrames)
      const avgConfidence = Math.round((newResults.reduce((sum, r) => sum + r.confidence, 0) / totalFrames) * 100) / 100

      setStats({ totalFrames, avgProcessingTime, avgConfidence })

      return newResults
    })
  }, [])

  const handleConnectionChange = useCallback((connected: boolean) => {
    setIsConnected(connected)
    if (connected) {
      setError(null)
    }
  }, [])

  const handleError = useCallback((errorMessage: string) => {
    setError(errorMessage)
  }, [])

  const connect = useCallback(() => {
    if (!wsRef.current) {
      wsRef.current = new VideoAnalysisWebSocket(handleAnalysisResult, handleConnectionChange, handleError)
    }
    wsRef.current.connect()
  }, [handleAnalysisResult, handleConnectionChange, handleError])

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.disconnect()
    }
  }, [])

  const sendFrame = useCallback((frameData: string) => {
    if (wsRef.current) {
      wsRef.current.sendFrame(frameData)
    }
  }, [])

  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  return {
    isConnected,
    analysisResults,
    error,
    stats,
    connect,
    disconnect,
    sendFrame,
  }
}
