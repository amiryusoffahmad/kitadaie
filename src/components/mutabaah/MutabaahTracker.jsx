"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarDays, Settings, TrendingUp } from "lucide-react"
import { 
  getMutabaahActivities, 
  getMutabaahEntries, 
  toggleMutabaahEntry,
  getMutabaahSettings,
  updateMutabaahSettings,
  getWeeklyMutabaahResults 
} from "@/server/actions/mutabaah"

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

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    loadEntriesForDate(currentDate)
  }, [currentDate])

  const loadInitialData = async () => {
    try {
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
        setWeeklyResults(result)
        setShowWeeklyResults(true)
      } else {
        console.error("Failed to get weekly results:", result.error)
      }
    } catch (error) {
      console.error("Failed to get weekly results:", error)
    }
  }

  const isActivityCompleted = (activityId) => {
    const entry = entries.find(e => e.activity_id === activityId)
    return entry ? entry.completed === 1 : false
  }

  const getTodayCompletionCount = () => {
    return entries.filter(e => e.completed === 1).length
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
                {weeklyResults.totalCompleted} out of {weeklyResults.totalDays} days completed
              </p>
              <p className="text-sm text-gray-500 mt-1">
                (Need 5+ days to pass)
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Activity Breakdown:</h4>
              {weeklyResults.activities.map(activity => {
                let activityScore = 0
                Object.entries(weeklyResults.weekData).forEach(([date, dayData]) => {
                  if (dayData[activity.id]) {
                    activityScore++
                  }
                })
                
                const isPassed = activityScore >= 5
                
                return (
                  <div key={activity.id} className="flex items-center justify-between p-3 rounded border">
                    <div className="flex-1">
                      <h5 className="font-medium text-sm">{activity.name}</h5>
                      <p className="text-xs text-gray-500">{activity.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${
                        isPassed ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {activityScore}/7
                      </span>
                      <Badge 
                        variant={isPassed ? "default" : "destructive"} 
                        className={isPassed ? "bg-green-100 text-green-800" : ""}
                      >
                        {isPassed ? "PASS" : "FAIL"}
                      </Badge>
                    </div>
                  </div>
                )
              })}
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
            <div>
              <label className="block text-sm font-medium mb-2">
                Halaqah Day
              </label>
              <Select 
                value={settings.end_of_week.toString()} 
                onValueChange={(value) => {
                  console.log('Day selection changed:', value)
                  handleUpdateSettings(parseInt(value))
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select the Halaqah day">
                    {DAYS_OF_WEEK.find(day => day.value === settings.end_of_week)?.label || "Select day"}
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
              <p className="text-xs text-gray-500 mt-1">
                Choose which day marks the end of your weekly tracking cycle
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
                onClick={() => setShowSettings(true)}
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleShowWeeklyResults}
              >
                <TrendingUp className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Date</label>
            <input
              type="date"
              value={currentDate}
              onChange={(e) => setCurrentDate(e.target.value)}
              className="w-full p-2 border rounded-md"
            />
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
                    <p className={`text-sm ${isCompleted ? 'line-through text-gray-400' : 'text-gray-600'}`}>
                      {activity.description}
                    </p>
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