'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Play, Pause, RotateCcw, Volume2, Settings } from 'lucide-react'
import '@/styles/components/text-to-speech.css'

interface TextToSpeechProps {
  text: string
  title?: string
  autoPlay?: boolean
}

export function TextToSpeech({ text, title, autoPlay = false }: TextToSpeechProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [progress, setProgress] = useState(0)
  const [rate, setRate] = useState(1.0)
  const [pitch, setPitch] = useState(1.0)
  const [volume, setVolume] = useState(1.0)
  const [selectedVoice, setSelectedVoice] = useState<string>('')
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [showSettings, setShowSettings] = useState(false)
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [estimatedTime, setEstimatedTime] = useState(0)
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis
      
      const loadVoices = () => {
        const availableVoices = synthRef.current!.getVoices()
        const japaneseVoices = availableVoices.filter(voice => 
          voice.lang.startsWith('ja') || voice.lang.startsWith('ja-JP')
        )
        const otherVoices = availableVoices.filter(voice => 
          !voice.lang.startsWith('ja')
        )
        
        setVoices([...japaneseVoices, ...otherVoices])
        
        if (japaneseVoices.length > 0) {
          setSelectedVoice(japaneseVoices[0].name)
        } else if (availableVoices.length > 0) {
          setSelectedVoice(availableVoices[0].name)
        }
      }
      
      loadVoices()
      synthRef.current.addEventListener('voiceschanged', loadVoices)
      
      const wordsCount = text.split(/\s+/).length
      const wordsPerMinute = 150
      setEstimatedTime(Math.ceil(wordsCount / wordsPerMinute))
      
      return () => {
        synthRef.current?.removeEventListener('voiceschanged', loadVoices)
      }
    }
  }, [])

  useEffect(() => {
    if (autoPlay && !isPlaying) {
      handlePlay()
    }
  }, [autoPlay])

  const cleanText = (content: string) => {
    return content
      .replace(/[#*`\[\]()]/g, '')
      .replace(/\n+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  }

  const handlePlay = () => {
    if (!synthRef.current) return
    
    if (isPaused && utteranceRef.current) {
      synthRef.current.resume()
      setIsPaused(false)
      setIsPlaying(true)
      startProgressTracking()
      return
    }
    
    const cleanedText = title ? `${title}。${cleanText(text)}` : cleanText(text)
    const utterance = new SpeechSynthesisUtterance(cleanedText)
    
    const voice = voices.find(v => v.name === selectedVoice)
    if (voice) {
      utterance.voice = voice
    }
    
    utterance.rate = rate
    utterance.pitch = pitch
    utterance.volume = volume
    
    utterance.onstart = () => {
      setIsPlaying(true)
      setIsPaused(false)
      startProgressTracking()
    }
    
    utterance.onend = () => {
      setIsPlaying(false)
      setIsPaused(false)
      setProgress(100)
      stopProgressTracking()
    }
    
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event)
      setIsPlaying(false)
      setIsPaused(false)
      stopProgressTracking()
    }
    
    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        setCurrentWordIndex(prev => prev + 1)
      }
    }
    
    utteranceRef.current = utterance
    synthRef.current.speak(utterance)
  }

  const handlePause = () => {
    if (!synthRef.current) return
    
    synthRef.current.pause()
    setIsPaused(true)
    setIsPlaying(false)
    stopProgressTracking()
  }

  const handleStop = () => {
    if (!synthRef.current) return
    
    synthRef.current.cancel()
    setIsPlaying(false)
    setIsPaused(false)
    setProgress(0)
    setCurrentWordIndex(0)
    stopProgressTracking()
  }

  const startProgressTracking = () => {
    const totalWords = text.split(/\s+/).length
    let wordCount = 0
    
    progressIntervalRef.current = setInterval(() => {
      wordCount += rate * 2.5
      const progressPercent = Math.min((wordCount / totalWords) * 100, 100)
      setProgress(progressPercent)
      
      if (progressPercent >= 100) {
        stopProgressTracking()
      }
    }, 100)
  }

  const stopProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }
  }

  const formatTime = (minutes: number) => {
    if (minutes < 1) return '1分未満'
    return `約${minutes}分`
  }

  if (!synthRef.current) {
    return (
      <div className="text-to-speech text-to-speech--unavailable">
        <Volume2 className="text-to-speech__icon" />
        <span>音声読み上げは、このブラウザではサポートされていません</span>
      </div>
    )
  }

  return (
    <div className="text-to-speech">
      <div className="text-to-speech__header">
        <div className="text-to-speech__title">
          <Volume2 className="text-to-speech__icon" />
          <span>音声で聴く</span>
          <span className="text-to-speech__time">{formatTime(estimatedTime)}</span>
        </div>
        <button
          className="text-to-speech__settings-toggle"
          onClick={() => setShowSettings(!showSettings)}
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {showSettings && (
        <div className="text-to-speech__settings">
          <div className="text-to-speech__setting">
            <label>音声</label>
            <Select value={selectedVoice} onValueChange={setSelectedVoice}>
              <SelectTrigger className="text-to-speech__select">
                <SelectValue placeholder="音声を選択" />
              </SelectTrigger>
              <SelectContent>
                {voices.map(voice => (
                  <SelectItem key={voice.name} value={voice.name}>
                    {voice.name} ({voice.lang})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="text-to-speech__setting">
            <label>速度: {rate.toFixed(1)}x</label>
            <Slider
              value={[rate]}
              onValueChange={([value]) => setRate(value)}
              min={0.5}
              max={2.0}
              step={0.1}
              className="text-to-speech__slider"
            />
          </div>

          <div className="text-to-speech__setting">
            <label>ピッチ: {pitch.toFixed(1)}</label>
            <Slider
              value={[pitch]}
              onValueChange={([value]) => setPitch(value)}
              min={0.5}
              max={2.0}
              step={0.1}
              className="text-to-speech__slider"
            />
          </div>

          <div className="text-to-speech__setting">
            <label>音量: {Math.round(volume * 100)}%</label>
            <Slider
              value={[volume]}
              onValueChange={([value]) => setVolume(value)}
              min={0}
              max={1}
              step={0.1}
              className="text-to-speech__slider"
            />
          </div>
        </div>
      )}

      <div className="text-to-speech__controls">
        <div className="text-to-speech__buttons">
          {!isPlaying && !isPaused ? (
            <Button
              onClick={handlePlay}
              className="text-to-speech__button text-to-speech__button--primary"
            >
              <Play className="w-4 h-4" />
              再生
            </Button>
          ) : (
            <>
              {isPlaying ? (
                <Button
                  onClick={handlePause}
                  className="text-to-speech__button text-to-speech__button--primary"
                >
                  <Pause className="w-4 h-4" />
                  一時停止
                </Button>
              ) : (
                <Button
                  onClick={handlePlay}
                  className="text-to-speech__button text-to-speech__button--primary"
                >
                  <Play className="w-4 h-4" />
                  再開
                </Button>
              )}
              <Button
                onClick={handleStop}
                variant="outline"
                className="text-to-speech__button"
              >
                <RotateCcw className="w-4 h-4" />
                停止
              </Button>
            </>
          )}
        </div>

        {(isPlaying || isPaused || progress > 0) && (
          <div className="text-to-speech__progress">
            <div className="text-to-speech__progress-bar">
              <div 
                className="text-to-speech__progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-to-speech__progress-text">
              {Math.round(progress)}%
            </span>
          </div>
        )}
      </div>
    </div>
  )
}