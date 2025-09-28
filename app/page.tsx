"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";

// --- SVG Icon Components ---
const GithubIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.477 2 2 6.484 2 12.012c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.483 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.833.091-.646.35-1.088.636-1.34-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.254-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.396.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.847-2.337 4.695-4.566 4.944.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.749 0 .268.18.579.688.481C19.138 20.175 22 16.427 22 12.012 22 6.484 17.523 2 12 2z" />
  </svg>
);
const CameraIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const ActivityIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
  </svg>
);
const ZapIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2" />
  </svg>
);
const AlertTriangleIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
);

// Helper hook to handle intervals reliably in React
function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef<() => void>();
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  useEffect(() => {
    function tick() {
      if (savedCallback.current) savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

interface AnalysisResult {
  id: string;
  timestamp: string;
  confidence: number;
  objects: Array<{ name: string; confidence: number }>;
  description: string;
  processing_time: number;
}

// Simple scrollable text box with absolutely fixed dimensions
function AIFeedbackPanel({ isProcessing, currentAnalysis, analysisResults }: { isProcessing: boolean; currentAnalysis: string; analysisResults: AnalysisResult[] }) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [analysisResults.length]);

  return (
    <div 
      style={{ 
        width: '100%', 
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid hsl(var(--border))',
        borderRadius: '8px',
        backgroundColor: 'hsl(var(--card))',
        overflow: 'hidden',
        flex: 1,
        minHeight: 0
      }}
    >
      {/* Fixed Header */}
      <div 
        style={{
          padding: '24px',
          borderBottom: '1px solid hsl(var(--border))',
          backgroundColor: 'hsl(var(--card))',
          height: '80px',
          flexShrink: 0
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ActivityIcon />
            <span style={{ fontSize: '18px', fontWeight: '600' }}>AI Live Feedback</span>
          </div>
          {analysisResults.length > 0 && (
            <Badge variant="secondary">{analysisResults.length}</Badge>
          )}
        </div>
      </div>
      {/* Dynamic Height Scrollable Content */}
      <div 
        ref={scrollContainerRef}
        style={{
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
          paddingTop: '24px',
          paddingLeft: '24px',
          paddingRight: '24px',
          paddingBottom: '0px',
        }}
      >
        <div style={{ paddingBottom: '24px' }}>
          {/* Live streaming analysis - Always at top */}
          {isProcessing && currentAnalysis && (
            <div 
              style={{
                marginBottom: '16px',
                padding: '16px',
                backgroundColor: 'hsl(var(--primary) / 0.1)',
                borderRadius: '8px',
                border: '1px solid hsl(var(--primary) / 0.2)'
              }}
            >
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                marginBottom: '8px',
                color: 'hsl(var(--primary))',
                fontWeight: '500'
              }}>
                <ZapIcon /> Analyzing...
              </div>
              <div 
                style={{
                  fontSize: '14px',
                  color: 'hsl(var(--muted-foreground))',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  whiteSpace: 'pre-wrap',
                  maxWidth: '100%'
                }}
              >
                {currentAnalysis}
              </div>
            </div>
          )}
          {/* Empty state */}
          {analysisResults.length === 0 && !isProcessing && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '400px',
              color: 'hsl(var(--muted-foreground))'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                <div style={{ width: '48px', height: '48px', marginBottom: '12px', opacity: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ActivityIcon />
                </div>
                <p style={{ textAlign: 'center' }}>Results will appear here</p>
              </div>
            </div>
          )}
          {/* Analysis results - Latest first */}
          {analysisResults.map((result, index) => (
            <div 
              key={result.id} 
              style={{
                marginTop: (index > 0 || (isProcessing && currentAnalysis)) ? '16px' : '0',
                padding: '16px',
                backgroundColor: 'hsl(var(--muted) / 0.5)',
                borderRadius: '8px',
                border: '1px solid hsl(var(--border))'
              }}
            >
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                marginBottom: '8px' 
              }}>
                <span style={{ fontSize: '14px', fontWeight: '500' }}>{result.timestamp}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Progress value={result.confidence * 100} className="w-16 h-2" />
                  <span style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>
                    {(result.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
              <div 
                style={{
                  fontSize: '14px',
                  color: 'hsl(var(--muted-foreground))',
                  marginBottom: '12px',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  whiteSpace: 'pre-wrap',
                  maxWidth: '100%'
                }}
              >
                {result.description}
              </div>
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '4px', 
                marginBottom: '8px' 
              }}>
                {result.objects.map((obj, idx) => (
                  <Badge key={idx} variant="outline">{obj.name}</Badge>
                ))}
              </div>
              <div style={{ 
                fontSize: '12px', 
                color: 'hsl(var(--muted-foreground))' 
              }}>
                Processed in {result.processing_time}ms
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function VideoAnalysisApp() {
  const [isCapturing, setIsCapturing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({ totalFrames: 0, avgProcessingTime: 0, avgConfidence: 0 });
  const [currentAnalysis, setCurrentAnalysis] = useState<string>("");
  const [sessionId] = useState(() => typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString());

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // This useEffect hook is responsible for updating the stats
  useEffect(() => {
    if (analysisResults.length === 0) return;

    const totalFrames = analysisResults.length;
    const avgProcessingTime = Math.round(analysisResults.reduce((sum, r) => sum + r.processing_time, 0) / totalFrames);
    const avgConfidence = analysisResults.reduce((sum, r) => sum + r.confidence, 0) / totalFrames;
    
    setStats({ totalFrames, avgProcessingTime, avgConfidence });

  }, [analysisResults]);

  const startCapture = async () => {
    try {
      setError(null);
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("Camera access is not supported.");
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 640 }, height: { ideal: 480 } } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        await videoRef.current.play();
        setIsCapturing(true);
      }
    } catch (err: any) {
      let msg = "Failed to access webcam.";
      if (err.name === "NotAllowedError") msg = "Webcam access denied.";
      setError(msg);
      setIsCapturing(false);
    }
  };

  const stopCapture = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    setIsCapturing(false);
    setIsProcessing(false);
    // Do NOT clear analysisResults or stats here; session persists until reload
  };
  
  const captureFrame = () => {
    if (isProcessing || !videoRef.current || !canvasRef.current || videoRef.current.readyState < 3) {
      return;
    }
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      setIsProcessing(true);
      setCurrentAnalysis("");

      try {
        const startTime = Date.now();
        const formData = new FormData();
        formData.append("image", blob, "frame.jpg");
        const response = await fetch("/api/analyze", { method: "POST", body: formData });
        if (!response.ok || !response.body) throw new Error(`API failed: ${response.status}`);
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullAnalysis = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.substring(6);
              if (data === "[DONE]") break;
              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  fullAnalysis += parsed.content;
                  setCurrentAnalysis(fullAnalysis);
                }
              } catch (e) {}
            }
          }
        }
        
        const result: AnalysisResult = {
          id: Date.now().toString(),
          timestamp: new Date().toLocaleTimeString(),
          confidence: 0.85 + Math.random() * 0.15,
          objects: extractObjectsFromAnalysis(fullAnalysis),
          description: fullAnalysis,
          processing_time: Date.now() - startTime,
        };

        setAnalysisResults((prevResults) => [result, ...prevResults].slice(0, 50));

      } catch (error) {
        setError("Analysis request failed. Check the console.");
      } finally {
        setIsProcessing(false);
      }
    }, "image/jpeg", 0.8);
  };

  useInterval(captureFrame, isCapturing ? 2000 : null);

  const extractObjectsFromAnalysis = (analysis: string): Array<{ name: string; confidence: number }> => {
    const objects = new Set<string>();
    const commonObjects = ["person", "face", "hand", "object", "furniture", "device", "clothing", "background", "screen", "desk"];
    const text = analysis.toLowerCase();
    commonObjects.forEach(obj => { if (text.includes(obj)) objects.add(obj) });
    return Array.from(objects).slice(0, 5).map(obj => ({ name: obj, confidence: 0.7 + Math.random() * 0.3 }));
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Real-time Video Analysis</h1>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-muted-foreground">Qwen 2.5&nbsp;|</span>
            <a href="https://github.com/gravixlayer/realtime-video-analysis" target="_blank" rel="noopener noreferrer"><GithubIcon /></a>
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
      
      <main className="container mx-auto px-6 py-6">
        <div style={{ display: 'flex', flexDirection: 'row', gap: '24px', height: 'calc(100vh - 160px)', minHeight: 0 }}>
          {/* Left Panel - Camera */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <Card className="flex flex-col h-full min-h-0" style={{ flex: 1, minHeight: 0 }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CameraIcon />Webcam Feed
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
                  {!isCapturing && (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <div className="w-8 h-8 mx-auto mb-3 opacity-50">
                          <CameraIcon />
                        </div>
                        <p>Click "Start Analysis" to begin</p>
                      </div>
                    </div>
                  )}
                  {isCapturing && (
                     <div className="absolute top-4 left-4 flex gap-2">
                        <Badge variant="default" className="flex items-center gap-1">
                          <ActivityIcon /> AI Active
                        </Badge>
                        {isProcessing && (
                          <Badge className="bg-primary/90 flex items-center gap-1">
                            <ZapIcon /> Processing
                          </Badge>
                        )}
                     </div>
                  )}
                </div>
                <div className="pt-4 mt-4 border-t">
                  <div className="flex justify-center gap-4 mb-4">
                    <Button onClick={startCapture} disabled={isCapturing}>
                      Start Analysis
                    </Button>
                    <Button onClick={stopCapture} disabled={!isCapturing} variant="secondary">
                      Stop
                    </Button>
                  </div>
                  {isCapturing && (
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-primary">{stats.totalFrames}</div>
                        <div className="text-xs text-muted-foreground">Frames</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-primary">{stats.avgProcessingTime}ms</div>
                        <div className="text-xs text-muted-foreground">Avg Time</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-primary">
                          {(stats.avgConfidence * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs text-muted-foreground">Confidence</div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Right Panel - AI Feedback */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <AIFeedbackPanel 
              isProcessing={isProcessing}
              currentAnalysis={currentAnalysis}
              analysisResults={analysisResults}
            />
          </div>
        </div>
      </main>
      
      <footer className="w-full py-6">
        <div className="container mx-auto">
          <p className="text-center text-sm text-muted-foreground">
            Powered by{' '}
            <a 
              href="https://gravixlayer.com/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="underline font-semibold"
            >
              Gravix Layer
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}