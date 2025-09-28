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

export class VideoAnalysisWebSocket {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  constructor(
    private onAnalysisResult: (result: AnalysisResult) => void,
    private onConnectionChange: (connected: boolean) => void,
    private onError: (error: string) => void,
  ) {}

  connect() {
    try {
      // Use WebSocket for real-time communication
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
      const wsUrl = `${protocol}//${window.location.host}/api/websocket`

      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = () => {
        console.log("WebSocket connected")
        this.reconnectAttempts = 0
        this.onConnectionChange(true)
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)

          if (data.type === "analysis_result") {
            this.onAnalysisResult(data.result)
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error)
        }
      }

      this.ws.onclose = () => {
        console.log("WebSocket disconnected")
        this.onConnectionChange(false)
        this.attemptReconnect()
      }

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error)
        this.onError("WebSocket connection error")
      }
    } catch (error) {
      console.error("Failed to create WebSocket:", error)
      this.onError("Failed to establish WebSocket connection")
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  sendFrame(frameData: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = {
        type: "analyze_frame",
        frame: frameData,
        timestamp: Date.now(),
      }

      this.ws.send(JSON.stringify(message))
    } else {
      console.warn("WebSocket not connected, cannot send frame")
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)

      setTimeout(() => {
        this.connect()
      }, this.reconnectDelay * this.reconnectAttempts)
    } else {
      this.onError("Failed to reconnect after multiple attempts")
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }
}
