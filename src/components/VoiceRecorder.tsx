'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Mic, MicOff, Pause, Play, Square, Upload } from 'lucide-react'
import { cn, formatDuration, getAudioMimeType } from '@/lib/utils'
import type { VoiceRecorderProps, AudioRecordingState, TranscriptionResult } from '@/types'

export default function VoiceRecorder({
  onTranscriptionComplete,
  onRecordingStateChange,
  maxDuration = 600, // 10 minutes default
  autoSave = true,
  folderId,
}: VoiceRecorderProps) {
  const [recordingState, setRecordingState] = useState<AudioRecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    audioBlob: undefined,
    audioUrl: undefined,
  })
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)

  // Update parent component when recording state changes
  useEffect(() => {
    onRecordingStateChange?.(recordingState)
  }, [recordingState, onRecordingStateChange])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const startTimer = useCallback(() => {
    timerRef.current = setInterval(() => {
      setRecordingState(prev => {
        const newDuration = prev.duration + 1
        
        // Auto-stop if max duration reached
        if (newDuration >= maxDuration) {
          stopRecording()
          return prev
        }
        
        return { ...prev, duration: newDuration }
      })
    }, 1000)
  }, [maxDuration])

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const startRecording = useCallback(async () => {
    try {
      setError(null)
      
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000,
        },
      })
      
      streamRef.current = stream
      
      const mimeType = getAudioMimeType()
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 128000,
      })
      
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: mimeType })
        const audioUrl = URL.createObjectURL(audioBlob)
        
        setRecordingState(prev => ({
          ...prev,
          isRecording: false,
          isPaused: false,
          audioBlob,
          audioUrl,
        }))
        
        if (autoSave) {
          transcribeAudio(audioBlob)
        }
      }
      
      mediaRecorder.start(1000) // Collect data every 1 second
      
      setRecordingState(prev => ({
        ...prev,
        isRecording: true,
        isPaused: false,
        duration: 0,
        audioBlob: undefined,
        audioUrl: undefined,
      }))
      
      startTimer()
      startWaveformAnimation(stream)
      
    } catch (error) {
      console.error('Error starting recording:', error)
      setError('无法访问麦克风，请检查权限设置')
    }
  }, [autoSave, startTimer])

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState.isRecording) {
      if (recordingState.isPaused) {
        mediaRecorderRef.current.resume()
        startTimer()
        setRecordingState(prev => ({ ...prev, isPaused: false }))
      } else {
        mediaRecorderRef.current.pause()
        stopTimer()
        setRecordingState(prev => ({ ...prev, isPaused: true }))
      }
    }
  }, [recordingState.isRecording, recordingState.isPaused, startTimer, stopTimer])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState.isRecording) {
      mediaRecorderRef.current.stop()
      stopTimer()
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
    }
  }, [recordingState.isRecording, stopTimer])

  const startWaveformAnimation = useCallback((stream: MediaStream) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const audioContext = new AudioContext()
    const analyser = audioContext.createAnalyser()
    const source = audioContext.createMediaStreamSource(stream)
    
    source.connect(analyser)
    analyser.fftSize = 256
    
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const draw = () => {
      if (!recordingState.isRecording) return
      
      analyser.getByteFrequencyData(dataArray)
      
      ctx.fillStyle = 'rgb(15, 23, 42)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      const barWidth = (canvas.width / bufferLength) * 2.5
      let barHeight
      let x = 0
      
      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * canvas.height * 0.8
        
        ctx.fillStyle = `rgb(59, 130, 246)`
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight)
        
        x += barWidth + 1
      }
      
      animationRef.current = requestAnimationFrame(draw)
    }
    
    draw()
  }, [recordingState.isRecording])

  const transcribeAudio = useCallback(async (audioBlob: Blob) => {
    if (!audioBlob) return
    
    setIsTranscribing(true)
    setError(null)
    
    try {
      const formData = new FormData()
      formData.append('file', audioBlob, 'recording.webm')
      
      const whisperApiUrl = process.env.NEXT_PUBLIC_WHISPER_API_URL || 'http://localhost:8000'
      const response = await fetch(`${whisperApiUrl}/transcribe/`, {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        throw new Error(`转录失败: ${response.statusText}`)
      }
      
      const result: TranscriptionResult = await response.json()
      onTranscriptionComplete(result)
      
    } catch (error) {
      console.error('Transcription error:', error)
      setError(error instanceof Error ? error.message : '转录失败，请重试')
    } finally {
      setIsTranscribing(false)
    }
  }, [onTranscriptionComplete])

  const uploadAudioFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('audio/')) {
      setError('请选择音频文件')
      return
    }
    
    setError(null)
    const audioUrl = URL.createObjectURL(file)
    
    setRecordingState(prev => ({
      ...prev,
      audioBlob: file,
      audioUrl,
      duration: 0,
    }))
    
    await transcribeAudio(file)
  }, [transcribeAudio])

  const resetRecording = useCallback(() => {
    if (recordingState.audioUrl) {
      URL.revokeObjectURL(recordingState.audioUrl)
    }
    
    setRecordingState({
      isRecording: false,
      isPaused: false,
      duration: 0,
      audioBlob: undefined,
      audioUrl: undefined,
    })
    
    setError(null)
  }, [recordingState.audioUrl])

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Waveform Canvas */}
          <div className="relative h-32 bg-slate-900 rounded-lg overflow-hidden">
            <canvas
              ref={canvasRef}
              width={800}
              height={128}
              className="w-full h-full"
            />
            {!recordingState.isRecording && !recordingState.audioUrl && (
              <div className="absolute inset-0 flex items-center justify-center text-white/60">
                <div className="text-center">
                  <Mic className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">点击开始录音或上传音频文件</p>
                </div>
              </div>
            )}
          </div>

          {/* Recording Controls */}
          <div className="flex items-center justify-center space-x-4">
            {!recordingState.isRecording && !recordingState.audioBlob ? (
              <>
                <Button
                  onClick={startRecording}
                  size="lg"
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  <Mic className="w-5 h-5 mr-2" />
                  开始录音
                </Button>
                
                <div className="relative">
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) uploadAudioFile(file)
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Button variant="outline" size="lg">
                    <Upload className="w-5 h-5 mr-2" />
                    上传音频
                  </Button>
                </div>
              </>
            ) : recordingState.isRecording ? (
              <>
                <Button
                  onClick={pauseRecording}
                  variant="outline"
                  size="lg"
                >
                  {recordingState.isPaused ? (
                    <Play className="w-5 h-5 mr-2" />
                  ) : (
                    <Pause className="w-5 h-5 mr-2" />
                  )}
                  {recordingState.isPaused ? '继续' : '暂停'}
                </Button>
                
                <Button
                  onClick={stopRecording}
                  variant="destructive"
                  size="lg"
                >
                  <Square className="w-5 h-5 mr-2" />
                  停止录音
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => transcribeAudio(recordingState.audioBlob!)}
                  disabled={isTranscribing}
                  size="lg"
                >
                  {isTranscribing ? '转录中...' : '重新转录'}
                </Button>
                
                <Button
                  onClick={resetRecording}
                  variant="outline"
                  size="lg"
                >
                  重新录音
                </Button>
              </>
            )}
          </div>

          {/* Recording Status */}
          <div className="text-center space-y-2">
            {recordingState.isRecording && (
              <div className="flex items-center justify-center space-x-2">
                <div className={cn(
                  "w-3 h-3 bg-red-500 rounded-full",
                  recordingState.isPaused ? "animate-none" : "animate-pulse"
                )} />
                <span className="text-lg font-mono">
                  {formatDuration(recordingState.duration)}
                </span>
                {recordingState.isPaused && (
                  <span className="text-sm text-muted-foreground">已暂停</span>
                )}
              </div>
            )}
            
            {recordingState.audioUrl && !recordingState.isRecording && (
              <div className="space-y-2">
                <audio
                  src={recordingState.audioUrl}
                  controls
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground">
                  录音时长: {formatDuration(recordingState.duration)}
                </p>
              </div>
            )}
            
            {isTranscribing && (
              <div className="flex items-center justify-center space-x-2 text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                <span>正在转录音频...</span>
              </div>
            )}
            
            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}