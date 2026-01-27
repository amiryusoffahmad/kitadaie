"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CalendarDays, Settings, TrendingUp, ChevronLeft, ChevronRight, BarChart3, MoreVertical, BookOpen, FileText, Volume2, PlayCircle, PauseCircle, Zap } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { 
  getMutabaahActivities, 
  getMutabaahEntries, 
  toggleMutabaahEntry,
  getMutabaahSettings,
  updateMutabaahSettings,
  getWeeklyMutabaahResults,
  getMonthlyMutabaahResults,
  updateMutabaahActivityDescriptions,
  getWeeklySummaries
} from "@/server/actions/mutabaah"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" }
]

export default function MutabaahTracker() {
  const [activities, setActivities] = useState([])
  const [entries, setEntries] = useState([])
  const [settings, setSettings] = useState({ end_of_week: 0 })
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [showWeeklyResults, setShowWeeklyResults] = useState(false)
  const [weeklyResults, setWeeklyResults] = useState(null)
  const [showMonthlyResults, setShowMonthlyResults] = useState(false)
  const [monthlyResults, setMonthlyResults] = useState(null)
  const [showWeeklySummaries, setShowWeeklySummaries] = useState(false)
  const [weeklySummaries, setWeeklySummaries] = useState(null)
  const [showMathurat, setShowMathurat] = useState(false)
  const [audioPermission, setAudioPermission] = useState(null)
  const [isPlaying, setIsPlaying] = useState(null)
  const [currentAudio, setCurrentAudio] = useState(null)
  const [audioProgress, setAudioProgress] = useState(0)
  const [audioDuration, setAudioDuration] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [currentAudioType, setCurrentAudioType] = useState(null)

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    loadEntriesForDate(currentDate)
  }, [currentDate])

  useEffect(() => {
    checkAudioPermission()
  }, [])

  const checkAudioPermission = async () => {
    try {
      if (typeof window !== 'undefined' && navigator.mediaDevices) {
        const permission = await navigator.permissions.query({ name: 'microphone' })
        setAudioPermission(permission.state)
      }
    } catch (error) {
      console.log('Audio permission check not supported or failed:', error)
      setAudioPermission('granted')
    }
  }

  const stopCurrentAudio = () => {
    if (currentAudio) {
      currentAudio.pause()
      currentAudio.currentTime = 0
      setCurrentAudio(null)
      setCurrentAudioType(null)
      setIsPlaying(null)
      setIsPaused(false)
      setAudioProgress(0)
      setAudioDuration(0)
    }
  }

  const updateProgress = () => {
    if (currentAudio && !currentAudio.paused) {
      setAudioProgress(currentAudio.currentTime)
      setAudioDuration(currentAudio.duration || 0)
    }
  }

  // Add continuous progress updates
  useEffect(() => {
    let intervalId = null
    
    if (currentAudio && isPlaying) {
      intervalId = setInterval(() => {
        if (currentAudio && !currentAudio.paused) {
          setAudioProgress(currentAudio.currentTime)
          setAudioDuration(currentAudio.duration || 0)
        }
      }, 100) // Update every 100ms for smooth progress
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [currentAudio, isPlaying])

  const toggleAudio = async (audioFile, audioType) => {
    try {
      if (typeof window === 'undefined') return

      // Case 1: Currently playing this audio - pause it
      if (isPlaying === audioType && currentAudio && !isPaused) {
        currentAudio.pause()
        setIsPlaying(null)
        setIsPaused(true)
        console.log('Paused audio at position:', currentAudio.currentTime)
        return
      }

      // Case 2: Currently paused and this is the same audio - resume it
      if (isPaused && isPlaying === null && currentAudio && currentAudioType === audioType) {
        console.log('Resuming audio from position:', currentAudio.currentTime)
        await currentAudio.play()
        setIsPlaying(audioType)
        setIsPaused(false)
        return
      }

      // Case 3: Starting new audio or switching audio files
      // Stop any existing audio first
      if (currentAudio) {
        stopCurrentAudio()
      }

      if (audioPermission === 'denied') {
        alert('Audio permission is required. Please enable it in your browser settings.')
        return
      }

      console.log('Creating new audio for:', audioFile)
      const audio = new Audio(audioFile)
      setCurrentAudio(audio)
      setCurrentAudioType(audioType)
      setIsPlaying(audioType)
      setIsPaused(false)

      // Set playback speed
      audio.playbackRate = playbackSpeed

      // Add progress tracking with better event handling
      audio.addEventListener('timeupdate', () => {
        setAudioProgress(audio.currentTime)
        setAudioDuration(audio.duration || 0)
      })
      
      audio.addEventListener('loadedmetadata', () => {
        setAudioDuration(audio.duration || 0)
        setAudioProgress(0)
      })
      
      audio.addEventListener('canplaythrough', () => {
        setAudioDuration(audio.duration || 0)
      })

      audio.onended = () => {
        setIsPlaying(null)
        setIsPaused(false)
        setAudioProgress(0)
      }
      
      audio.onerror = () => {
        setIsPlaying(null)
        setCurrentAudio(null)
        setCurrentAudioType(null)
        setIsPaused(false)
        setAudioProgress(0)
        setAudioDuration(0)
        alert(`Error playing ${audioType} audio. Please check if the file exists.`)
      }

      await audio.play()
    } catch (error) {
      setIsPlaying(null)
      setCurrentAudio(null)
      setCurrentAudioType(null)
      setIsPaused(false)
      setAudioProgress(0)
      setAudioDuration(0)
      if (error.name === 'NotAllowedError') {
        alert('Please allow audio playback in your browser and try again.')
      } else {
        alert(`Error playing ${audioType} audio: ${error.message}`)
      }
    }
  }

  const seekAudio = (newTime) => {
    if (currentAudio && !isNaN(newTime)) {
      currentAudio.currentTime = newTime
      setAudioProgress(newTime)
      
      // Force immediate update of progress display
      setTimeout(() => {
        if (currentAudio) {
          setAudioProgress(currentAudio.currentTime)
        }
      }, 50)
    }
  }

  const changePlaybackSpeed = (speed) => {
    setPlaybackSpeed(speed)
    if (currentAudio) {
      currentAudio.playbackRate = speed
    }
  }

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const loadInitialData = async () => {
    try {
      // Clear activity descriptions first
      await updateMutabaahActivityDescriptions()
      
      const [activitiesRes, settingsRes] = await Promise.all([
        getMutabaahActivities(),
        getMutabaahSettings()
      ])

      if (activitiesRes.success) {
        setActivities(activitiesRes.activities)
      }

      if (settingsRes.success) {
        setSettings(settingsRes.settings)
      }

      await loadEntriesForDate(currentDate)
    } catch (error) {
      console.error("Failed to load initial data:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadEntriesForDate = async (date) => {
    try {
      const result = await getMutabaahEntries(date)
      if (result.success) {
        setEntries(result.entries)
      }
    } catch (error) {
      console.error("Failed to load entries:", error)
    }
  }

  const handleToggleActivity = async (activityId, completed) => {
    try {
      const result = await toggleMutabaahEntry(activityId, currentDate, completed)
      if (result.success) {
        await loadEntriesForDate(currentDate)
      } else {
        console.error("Failed to toggle activity:", result.error)
      }
    } catch (error) {
      console.error("Failed to toggle activity:", error)
    }
  }

  const handleUpdateSettings = async (endOfWeek) => {
    try {
      const result = await updateMutabaahSettings(endOfWeek)
      if (result.success) {
        setSettings({ ...settings, end_of_week: endOfWeek })
        setShowSettings(false)
      }
    } catch (error) {
      console.error("Failed to update settings:", error)
    }
  }

  const getWeekRange = (date, endOfWeekDay) => {
    const currentDate = new Date(date)
    const currentDay = currentDate.getDay()
    
    // Calculate the current week that includes the selected date
    let endOfWeek = new Date(currentDate)
    
    if (currentDay <= endOfWeekDay) {
      // End of week is this week or today
      endOfWeek.setDate(currentDate.getDate() + (endOfWeekDay - currentDay))
    } else {
      // End of week is next week
      endOfWeek.setDate(currentDate.getDate() + (7 - currentDay + endOfWeekDay))
    }
    
    const startOfWeek = new Date(endOfWeek)
    startOfWeek.setDate(endOfWeek.getDate() - 6)
    
    console.log('Week range calculation:', {
      currentDate: date,
      currentDay,
      endOfWeekDay,
      startOfWeek: startOfWeek.toISOString().split('T')[0],
      endOfWeek: endOfWeek.toISOString().split('T')[0]
    })
    
    return {
      start: startOfWeek.toISOString().split('T')[0],
      end: endOfWeek.toISOString().split('T')[0]
    }
  }

  const handleShowWeeklyResults = async () => {
    try {
      const weekRange = getWeekRange(currentDate, settings.end_of_week)
      console.log('Fetching weekly results for range:', weekRange)
      
      const result = await getWeeklyMutabaahResults(weekRange.start, weekRange.end)
      console.log('Weekly results response:', result)
      
      if (result.success) {
        // Add week range to results
        result.weekRange = weekRange
        setWeeklyResults(result)
        setShowWeeklyResults(true)
      } else {
        console.error("Failed to get weekly results:", result.error)
      }
    } catch (error) {
      console.error("Failed to get weekly results:", error)
    }
  }

  const handleShowMonthlyResults = async () => {
    setLoading(true)
    setShowMonthlyResults(true)
    setShowWeeklyResults(false) // Hide weekly results if showing monthly
    setShowWeeklySummaries(false) // Hide weekly summaries

    try {
      const monthlyData = []
      const today = new Date()
      
      for (let i = 0; i < 12; i++) { // Get data for the last 12 months
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
        const year = date.getFullYear()
        const month = date.getMonth() + 1 // Month is 0-indexed
        
        const result = await getMonthlyMutabaahResults(year, month)
        if (result.success) {
          const completionPercentage = result.totalDays > 0 ? (result.passedDays / result.totalDays) * 100 : 0
          monthlyData.unshift({ // Add to the beginning to keep chronological order
            name: date.toLocaleString('default', { month: 'short' }),
            fullName: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
            year: date.getFullYear(),
            status: result.isPassed ? 1 : 0,
            passedDays: result.passedDays,
            totalDays: result.totalDays,
            statusText: result.status,
            completionPercentage: completionPercentage,
            passThreshold: result.passThreshold || Math.ceil(result.totalDays * 0.7)
          })
        } else {
          console.error(`Failed to get monthly results for ${month}/${year}:`, result.error)
          monthlyData.unshift({
            name: date.toLocaleString('default', { month: 'short' }),
            fullName: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
            year: date.getFullYear(),
            status: 0, // Assume fail if data fetch fails
            passedDays: 0,
            totalDays: 0,
            statusText: "ERROR",
            completionPercentage: 0,
            passThreshold: 0
          })
        }
      }
      setMonthlyResults(monthlyData)
    } catch (error) {
      console.error("Failed to get monthly results:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleShowWeeklySummaries = async () => {
    setLoading(true)
    setShowWeeklySummaries(true)
    setShowWeeklyResults(false) // Hide other views
    setShowMonthlyResults(false)

    try {
      const result = await getWeeklySummaries()
      if (result.success) {
        setWeeklySummaries(result)
      } else {
        console.error("Failed to get weekly summaries:", result.error)
      }
    } catch (error) {
      console.error("Failed to get weekly summaries:", error)
    } finally {
      setLoading(false)
    }
  }

  const isActivityCompleted = (activityId) => {
    const entry = entries.find(e => e.activity_id === activityId)
    return entry ? entry.completed === 1 : false
  }

  const getTodayCompletionCount = () => {
    return entries.filter(e => e.completed === 1).length
  }

  const goToPreviousDay = () => {
    const previousDay = new Date(currentDate)
    previousDay.setDate(previousDay.getDate() - 1)
    setCurrentDate(previousDay.toISOString().split('T')[0])
  }

  const goToNextDay = () => {
    const nextDay = new Date(currentDate)
    nextDay.setDate(nextDay.getDate() + 1)
    setCurrentDate(nextDay.toISOString().split('T')[0])
  }

  const getActivitySuggestion = (activityName, completedDays, totalDays) => {
    const percentage = (completedDays / totalDays) * 100
    const activityLower = activityName.toLowerCase()
    
    if (percentage >= 85) {
      return { type: "excellent", message: "🎉 Excellent! Keep up this amazing consistency!" }
    } else if (percentage >= 70) {
      return { type: "good", message: "✅ Good progress! You're on track to pass." }
    } else if (percentage >= 50) {
      if (activityLower.includes('tahajud')) {
        return { type: "warning", message: "🌙 Try setting a gentle alarm 15 minutes earlier. Even 2 rakat counts!" }
      } else if (activityLower.includes('dhuha')) {
        return { type: "warning", message: "☀️ Link Dhuha to your morning routine - maybe after breakfast?" }
      } else if (activityLower.includes('istighfar')) {
        return { type: "warning", message: "🤲 Set phone reminders throughout the day. Count while commuting!" }
      } else if (activityLower.includes('mathurat')) {
        return { type: "warning", message: "📖 Try doing it right after Fajr and Maghrib prayers." }
      } else if (activityLower.includes('tilawah')) {
        return { type: "warning", message: "📚 Start with just 1 page after each prayer. Build the habit first!" }
      } else if (activityLower.includes('subuh')) {
        return { type: "warning", message: "🕌 Sleep earlier to wake up easier. Ask Allah for help in making this consistent." }
      } else {
        return { type: "warning", message: "💪 You can improve! Try linking this to an existing daily habit." }
      }
    } else {
      if (activityLower.includes('tahajud')) {
        return { type: "critical", message: "🚨 Tahajud is concerning. Start with just 10 minutes before Fajr. Make du'a for strength!" }
      } else if (activityLower.includes('dhuha')) {
        return { type: "critical", message: "🚨 Dhuha needs attention. Just 2 rakat after sunrise - set it as your morning goal!" }
      } else if (activityLower.includes('istighfar')) {
        return { type: "critical", message: "🚨 Istighfar is low. Use a tasbih or counter app. Do 25 four times a day!" }
      } else if (activityLower.includes('mathurat')) {
        return { type: "critical", message: "🚨 Mathurat is concerning. Download an app with audio to follow along!" }
      } else if (activityLower.includes('tilawah')) {
        return { type: "critical", message: "🚨 Tilawah needs urgent attention. Start with 5 minutes daily - consistency over quantity!" }
      } else if (activityLower.includes('subuh')) {
        return { type: "critical", message: "🚨 Subuh is concerning. This is priority #1 - ask someone to call you daily!" }
      } else {
        return { type: "critical", message: "🚨 This needs immediate attention. Break it into smaller, easier steps!" }
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Mutabaah...</p>
        </div>
      </div>
    )
  }

  if (showMathurat) {
    return (
      <div className="max-w-md mx-auto space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Mathurat
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowMathurat(false)}
              >
                Back
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-5 w-5 text-green-600" />
                  <h3 className="font-medium text-green-800">📚 Daily Mathurat</h3>
                </div>
                <p className="text-sm text-green-700">
                  Read your daily du'a and dhikr from the Mathurat collection. Best recited after Fajr and Maghrib prayers.
                </p>
              </div>
              
              <div className="space-y-3">
                <Button
                  className="w-full flex items-center gap-2"
                  onClick={() => {
                    window.open('https://www.mathurat.com/', '_blank')
                  }}
                >
                  <FileText className="h-4 w-4" />
                  Open Al-Ma'thurat (Web)
                </Button>

                <Button 
                  className="w-full flex items-center gap-2"
                  variant={(isPlaying === 'pagi' || (isPaused && currentAudio?.src.includes('Pagi'))) ? 'default' : 'outline'}
                  onClick={() => toggleAudio('/Al-Mathurat Pagi.mp3', 'pagi')}
                >
                  {isPlaying === 'pagi' ? (
                    <PauseCircle className="h-4 w-4" />
                  ) : (
                    <PlayCircle className="h-4 w-4" />
                  )}
                  {isPlaying === 'pagi' ? 'Pause Pagi' : 
                   (isPaused && currentAudio?.src.includes('Pagi')) ? 'Resume Pagi' : 'Audio Mathurat Pagi'}
                </Button>

                <Button 
                  className="w-full flex items-center gap-2"
                  variant={(isPlaying === 'petang' || (isPaused && currentAudio?.src.includes('Petang'))) ? 'default' : 'outline'}
                  onClick={() => toggleAudio('/Al-Mathurat Petang.mp3', 'petang')}
                >
                  {isPlaying === 'petang' ? (
                    <PauseCircle className="h-4 w-4" />
                  ) : (
                    <PlayCircle className="h-4 w-4" />
                  )}
                  {isPlaying === 'petang' ? 'Pause Petang' : 
                   (isPaused && currentAudio?.src.includes('Petang')) ? 'Resume Petang' : 'Audio Mathurat Petang'}
                </Button>

                {/* Audio Progress Controls */}
                {(isPlaying || isPaused) && currentAudio && (
                  <div className="p-4 bg-gray-50 rounded-lg border space-y-3">
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-700">
                        {(isPlaying === 'pagi' || (isPaused && currentAudio?.src.includes('Pagi'))) ? '🌅 Mathurat Pagi' : '🌆 Mathurat Petang'}
                        {isPaused && <span className="ml-2 text-xs text-gray-500">(Paused)</span>}
                      </p>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="relative">
                        <input
                          type="range"
                          min="0"
                          max={Math.max(audioDuration, 1)}
                          value={audioProgress}
                          onChange={(e) => {
                            const newValue = parseFloat(e.target.value)
                            seekAudio(newValue)
                          }}
                          onInput={(e) => {
                            const newValue = parseFloat(e.target.value)
                            setAudioProgress(newValue) // Immediate visual update
                          }}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          style={{
                            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${Math.min(100, (audioProgress / Math.max(audioDuration, 1)) * 100)}%, #e5e7eb ${Math.min(100, (audioProgress / Math.max(audioDuration, 1)) * 100)}%, #e5e7eb 100%)`,
                          }}
                        />
                      </div>
                      
                      {/* Time Display */}
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>{formatTime(audioProgress)}</span>
                        <span>{formatTime(audioDuration)}</span>
                      </div>
                    </div>

                    {/* Speed Control */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                      <span className="text-sm text-gray-600 flex items-center gap-1">
                        <Zap className="h-4 w-4" />
                        Speed:
                      </span>
                      <Select 
                        value={playbackSpeed.toString()} 
                        onValueChange={(value) => changePlaybackSpeed(parseFloat(value))}
                      >
                        <SelectTrigger className="w-20 h-8 text-xs">
                          <SelectValue>
                            {playbackSpeed}x
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0.5">0.5x</SelectItem>
                          <SelectItem value="0.75">0.75x</SelectItem>
                          <SelectItem value="1">1x</SelectItem>
                          <SelectItem value="1.25">1.25x</SelectItem>
                          <SelectItem value="1.5">1.5x</SelectItem>
                          <SelectItem value="1.75">1.75x</SelectItem>
                          <SelectItem value="2">2x</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
                
                <p className="text-xs text-gray-600">
                  💡 Tip: Save this to your device for offline reading
                </p>
              </div>
              
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-left">
                <h4 className="font-medium text-blue-800 mb-2">📖 How to use Mathurat:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Morning: Read after Fajr prayer</li>
                  <li>• Evening: Read after Maghrib prayer</li>
                  <li>• Read with presence of heart</li>
                  <li>• Can be read from memory or PDF</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (showWeeklyResults && weeklyResults) {
    return (
      <div className="max-w-md mx-auto space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Weekly Results
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowWeeklyResults(false)}
              >
                Back
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className={`text-4xl font-bold mb-2 ${
                weeklyResults.isPassed ? 'text-green-600' : 'text-red-600'
              }`}>
                {weeklyResults.result}
              </div>
              <p className="text-gray-600">
                Weekly evaluation based on individual activities
              </p>
              {weeklyResults.weekRange && (
                <p className="text-sm text-blue-600 font-medium mt-1">
                  📅 {new Date(weeklyResults.weekRange.start).toLocaleDateString('en-GB')} - {new Date(weeklyResults.weekRange.end).toLocaleDateString('en-GB')}
                </p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                (Each activity needs ≥5 days out of 7 to pass)
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Activity Breakdown:</h4>
              {Object.entries(weeklyResults.activityResults).map(([activityId, result]) => (
                <div key={activityId} className="flex items-center justify-between p-3 rounded border">
                  <div className="flex-1">
                    <h5 className="font-medium text-sm">{result.name}</h5>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${
                      result.isPassed ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {result.completedDays}/7
                    </span>
                    <Badge 
                      variant={result.isPassed ? "default" : "destructive"} 
                      className={result.isPassed ? "bg-green-100 text-green-800" : ""}
                    >
                      {result.isPassed ? "PASS" : "FAIL"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            {/* Weekly Summary */}
            <div className="space-y-3 mt-4 pt-4 border-t">
              <h4 className="font-medium">📝 Week Summary:</h4>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-700">
                  {(() => {
                    const passedActivities = Object.values(weeklyResults.activityResults).filter(a => a.isPassed)
                    const failedActivities = Object.values(weeklyResults.activityResults).filter(a => !a.isPassed)
                    const totalActivities = Object.values(weeklyResults.activityResults).length
                    
                    let summaryText = ""
                    if (weeklyResults.isPassed) {
                      summaryText = `🎉 Excellent week! All ${totalActivities} activities passed. `
                    } else if (passedActivities.length > failedActivities.length) {
                      summaryText = `✅ Good progress! ${passedActivities.length}/${totalActivities} activities passed. `
                    } else {
                      summaryText = `⚠️ Needs improvement. Only ${passedActivities.length}/${totalActivities} activities passed. `
                    }

                    if (failedActivities.length > 0) {
                      summaryText += `Focus on: ${failedActivities.map(a => a.name).join(', ')}.`
                    }

                    return summaryText
                  })()}
                </p>
              </div>
              
              {/* Motivation message */}
              <div className={`p-3 rounded-lg ${
                weeklyResults.isPassed 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-blue-50 border border-blue-200'
              }`}>
                <p className={`text-sm font-medium ${
                  weeklyResults.isPassed ? 'text-green-800' : 'text-blue-800'
                }`}>
                  {weeklyResults.isPassed 
                    ? "🎉 MashaAllah! Keep this momentum going into next week!"
                    : "💪 Don't give up! Use this week's lessons to improve next week. Small steps lead to big changes."
                  }
                </p>
                <p className={`text-xs mt-1 ${
                  weeklyResults.isPassed ? 'text-green-600' : 'text-blue-600'
                }`}>
                  Each activity needs ≥5 days out of 7 to pass
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (showWeeklySummaries && weeklySummaries) {
    return (
      <div className="max-w-md mx-auto space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Weekly Summary
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowWeeklySummaries(false)}
              >
                Back
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Cycle info */}
            <div className="text-center pb-2">
              <p className="text-sm text-blue-600 font-medium">
                📅 {new Date(weeklySummaries.cycleStart).toLocaleDateString('en-GB')} - {new Date(weeklySummaries.cycleEnd).toLocaleDateString('en-GB')}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                2-week cycle • Resets automatically every 2 weeks
              </p>
            </div>

            {/* Week 1 Summary */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-800 flex items-center gap-2">
                  📊 Week 1 Summary
                  <Badge 
                    variant={weeklySummaries.week1.isPassed ? "default" : "destructive"}
                    className={weeklySummaries.week1.isPassed ? "bg-green-100 text-green-800" : ""}
                  >
                    {weeklySummaries.week1.result}
                  </Badge>
                </h4>
              </div>
              
              <p className="text-sm text-blue-600">
                📅 {new Date(weeklySummaries.week1.startDate).toLocaleDateString('en-GB')} - {new Date(weeklySummaries.week1.endDate).toLocaleDateString('en-GB')}
              </p>
              
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                {weeklySummaries.week1.summaryText}
              </p>
              
              <div className="space-y-2">
                {Object.entries(weeklySummaries.week1.activityResults).map(([activityId, result]) => (
                  <div key={activityId} className="flex items-center justify-between p-2 rounded border">
                    <span className="text-sm">{result.name}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${
                        result.isPassed ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {result.completedDays}/7
                      </span>
                      <Badge 
                        variant={result.isPassed ? "default" : "destructive"} 
                        className={result.isPassed ? "bg-green-100 text-green-800" : ""}
                      >
                        {result.isPassed ? "PASS" : "FAIL"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Week 2 Summary */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-800 flex items-center gap-2">
                  📊 Week 2 Summary
                  <Badge 
                    variant={weeklySummaries.week2.isPassed ? "default" : "destructive"}
                    className={weeklySummaries.week2.isPassed ? "bg-green-100 text-green-800" : ""}
                  >
                    {weeklySummaries.week2.result}
                  </Badge>
                </h4>
              </div>
              
              <p className="text-sm text-blue-600">
                📅 {new Date(weeklySummaries.week2.startDate).toLocaleDateString('en-GB')} - {new Date(weeklySummaries.week2.endDate).toLocaleDateString('en-GB')}
              </p>
              
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                {weeklySummaries.week2.summaryText}
              </p>
              
              <div className="space-y-2">
                {Object.entries(weeklySummaries.week2.activityResults).map(([activityId, result]) => (
                  <div key={activityId} className="flex items-center justify-between p-2 rounded border">
                    <span className="text-sm">{result.name}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${
                        result.isPassed ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {result.completedDays}/7
                      </span>
                      <Badge 
                        variant={result.isPassed ? "default" : "destructive"} 
                        className={result.isPassed ? "bg-green-100 text-green-800" : ""}
                      >
                        {result.isPassed ? "PASS" : "FAIL"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Motivation message */}
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
              <p className="text-sm font-medium text-blue-800">
                💡 Track your progress week by week for better consistency!
              </p>
              <p className="text-xs mt-1 text-blue-600">
                Each activity needs ≥5 days out of 7 to pass • Summary resets every 2 weeks
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (showMonthlyResults && monthlyResults) {
    return (
      <div className="max-w-md mx-auto space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Monthly Results
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowMonthlyResults(false)}
              >
                Back
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Year display */}
            {monthlyResults.length > 0 && (
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  📅 {monthlyResults[monthlyResults.length - 1]?.year} - {monthlyResults[0]?.year}
                </h3>
              </div>
            )}
            
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyResults} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    height={30}
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    tickFormatter={(value) => `${value}%`}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    formatter={(value, name, props) => [
                      `${props.payload.passedDays}/${props.payload.totalDays} days (${value.toFixed(1)}%)`,
                      'Completion'
                    ]}
                    labelFormatter={(label, payload) => {
                      const entry = payload?.[0]?.payload
                      return entry ? `${entry.fullName}` : `Month: ${label}`
                    }}
                    contentStyle={{
                      backgroundColor: '#f8f9fa',
                      border: '1px solid #dee2e6',
                      borderRadius: '4px'
                    }}
                  />
                  <Bar 
                    dataKey="completionPercentage" 
                    name="Monthly Progress"
                    radius={[4, 4, 0, 0]}
                  >
                    {monthlyResults.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.status === 1 ? '#22c55e' : '#ef4444'}
                        opacity={0.8}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Progress Summary */}
            <div className="mt-4 space-y-3">
              <div className="flex justify-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>Pass (≥70%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span>Fail (&lt;70%)</span>
                </div>
              </div>
              
              {/* Monthly breakdown */}
              <div className="max-h-32 overflow-y-auto space-y-1">
                {monthlyResults.slice().reverse().map((month, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                    <span className="font-medium">{month.name}</span>
                    <div className="flex items-center gap-2">
                      <span>{month.passedDays}/{month.totalDays} days</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        month.status === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {month.statusText}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (showSettings) {
    return (
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Mutabaah Settings
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowSettings(false)}
              >
                Cancel
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <h3 className="font-medium text-blue-900">📚 Important Setup Required!</h3>
              </div>
              <p className="text-sm text-blue-800 leading-relaxed">
                <strong>Please set your Halaqah day below!</strong> This determines when your weekly mutabaah cycle ends. 
                Choose the day when you typically review your weekly progress with your halaqah group.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                🗓️ My Halaqah Day
              </label>
              <Select 
                value={settings.end_of_week.toString()} 
                onValueChange={(value) => {
                  console.log('Day selection changed:', value)
                  handleUpdateSettings(parseInt(value))
                }}
              >
                <SelectTrigger className="border-2 border-blue-200 focus:border-blue-500">
                  <SelectValue placeholder="⚠️ Please select your halaqah day">
                    {DAYS_OF_WEEK.find(day => day.value === settings.end_of_week)?.label || "⚠️ Please select your halaqah day"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {DAYS_OF_WEEK.map(day => (
                    <SelectItem key={day.value} value={day.value.toString()}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-600 mt-2 flex items-center gap-1">
                <span>💡</span>
                <span>This sets when your weekly tracking cycle resets for pass/fail calculation.</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Mutabaah Tracker
            </CardTitle>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowMathurat(true)}
                className="flex items-center gap-1"
              >
                <BookOpen className="h-4 w-4" />
                <span className="text-xs">Mathurat</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" title="More options">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowSettings(true)}>
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleShowWeeklyResults}>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Weekly Results
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleShowWeeklySummaries}>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Weekly Summary
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleShowMonthlyResults}>
                    <CalendarDays className="h-4 w-4 mr-2" />
                    Monthly Results
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Date</label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousDay}
                className="px-2"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <input
                type="date"
                value={currentDate}
                onChange={(e) => setCurrentDate(e.target.value)}
                className="flex-1 p-2 border rounded-md"
              />
              
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextDay}
                className="px-2"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              💡 Use arrow buttons to navigate days quickly
            </p>
          </div>

          <div className="flex items-center justify-between">
            <h3 className="font-medium">Today's Progress</h3>
            <Badge variant={getTodayCompletionCount() === activities.length ? "default" : "secondary"}>
              {getTodayCompletionCount()}/{activities.length}
            </Badge>
          </div>

          <div className="space-y-3">
            {activities.map(activity => {
              const isCompleted = isActivityCompleted(activity.id)
              
              return (
                <div 
                  key={activity.id}
                  className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-gray-50"
                >
                  <Checkbox
                    checked={isCompleted}
                    onCheckedChange={(checked) => {
                      console.log('Checkbox changed:', activity.id, checked)
                      handleToggleActivity(activity.id, checked)
                    }}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <h4 className={`font-medium ${isCompleted ? 'line-through text-gray-500' : ''}`}>
                      {activity.name}
                    </h4>
                  </div>
                </div>
              )
            })}
          </div>

          {getTodayCompletionCount() === activities.length && (
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-green-800 font-medium">🎉 All activities completed!</p>
              <p className="text-green-600 text-sm">May Allah accept your efforts</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}