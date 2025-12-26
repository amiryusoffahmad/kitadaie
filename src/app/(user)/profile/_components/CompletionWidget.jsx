'use client'

import { cn } from '@/lib/utils'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

/**
 * Get color based on completion percentage
 */
function getCompletionColor(percentage) {
  if (percentage === 100) return 'text-green-600'
  if (percentage >= 76) return 'text-blue-600'
  if (percentage >= 51) return 'text-purple-600'
  if (percentage >= 26) return 'text-orange-600'
  return 'text-red-600'
}

/**
 * Get motivational message based on completion percentage
 */
function getMotivationalMessage(percentage) {
  if (percentage === 100) return { text: "Complete!", color: "text-green-600" }
  if (percentage >= 76) return { text: "Almost done!", color: "text-blue-600" }
  if (percentage >= 51) return { text: "Keep going!", color: "text-purple-600" }
  if (percentage >= 26) return { text: "Making progress!", color: "text-orange-600" }
  return { text: "Let's start!", color: "text-red-600" }
}

/**
 * Simple Circular progress indicator
 */
function CircularProgress({ percentage, size = 'large' }) {
  const radius = size === 'large' ? 40 : 24
  const stroke = size === 'large' ? 6 : 4
  const normalizedRadius = radius - stroke / 2
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  const sizeClass = size === 'large' ? 'h-24 w-24' : 'h-14 w-14'
  const textSize = size === 'large' ? 'text-xl' : 'text-sm'

  const getStrokeColor = () => {
    if (percentage === 100) return '#10b981' // green
    if (percentage >= 76) return '#3b82f6' // blue
    if (percentage >= 51) return '#8b5cf6' // purple
    if (percentage >= 26) return '#f59e0b' // orange
    return '#ef4444' // red
  }

  return (
    <div className={cn("relative", sizeClass)}>
      <svg className="transform -rotate-90" width={radius * 2} height={radius * 2}>
        {/* Background circle */}
        <circle
          cx={radius}
          cy={radius}
          r={normalizedRadius}
          stroke="currentColor"
          strokeWidth={stroke}
          fill="none"
          className="text-muted"
        />
        {/* Progress circle */}
        <circle
          cx={radius}
          cy={radius}
          r={normalizedRadius}
          stroke={getStrokeColor()}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      {/* Percentage text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={cn("font-bold", textSize, getCompletionColor(percentage))}>
          {percentage}%
        </span>
      </div>
    </div>
  )
}

/**
 * Horizontal completion widget with progress bar
 */
export function CompletionWidget({ completion, isLoading = false }) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="h-4 w-32 bg-muted/50 rounded animate-pulse"></div>
            <div className="h-4 w-12 bg-muted/50 rounded animate-pulse"></div>
          </div>
          <div className="h-2 w-full bg-muted/50 rounded-full animate-pulse"></div>
          <div className="h-3 w-24 bg-muted/50 rounded mt-2 animate-pulse"></div>
        </CardContent>
      </Card>
    )
  }

  if (!completion) {
    return (
      <Card>
        <CardContent className="p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No completion data available</p>
        </CardContent>
      </Card>
    )
  }

  const percentage = completion.percentage || 0
  const isComplete = percentage === 100
  const motivation = getMotivationalMessage(percentage)
  const missingFieldsCount = completion.missingFields?.length || 0

  return (

    <Card>
      <CardContent className="py-0 px-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <p className="pb-2 font-semibold">Profile Completion</p>
            {isComplete && <CheckCircle2 className="h-4 w-4 text-green-600" />}
          </div>
          <p className={cn("text-sm font-bold", getCompletionColor(percentage))}>
            {percentage}%
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500 ease-out",
              isComplete ? "bg-green-600" :
                percentage >= 76 ? "bg-blue-600" :
                  percentage >= 51 ? "bg-purple-600" :
                    percentage >= 26 ? "bg-orange-600" :
                      "bg-red-600"
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>

        <p className={cn("text-xs mt-2", motivation.color)}>
          {isComplete
            ? "All fields completed"
            : `${missingFieldsCount} ${missingFieldsCount === 1 ? 'field' : 'fields'} remaining`
          }
        </p>
      </CardContent>
    </Card>
  )
}

/**
 * Small completion widget for section overview
 */
export function SectionCompletionWidget({ sectionName, percentage, isLoading = false }) {
  if (isLoading) {
    return (
      <div className="bg-card border rounded-lg p-4 flex flex-col items-center justify-center">
        <div className="h-14 w-14 rounded-full bg-muted/50 animate-pulse"></div>
        <div className="h-3 w-16 bg-muted/50 rounded mt-2 animate-pulse"></div>
      </div>
    )
  }

  const completionPercentage = percentage || 0
  const isComplete = completionPercentage === 100

  return (
    <div className="bg-card border rounded-lg p-4 flex flex-col items-center justify-center space-y-2">
      <CircularProgress percentage={completionPercentage} size="small" />
      <div className="text-center">
        <p className="text-xs font-medium capitalize">{sectionName}</p>
        {isComplete && (
          <CheckCircle2 className="h-3 w-3 text-green-600 mx-auto mt-1" />
        )}
      </div>
    </div>
  )
}

/**
 * Get section icon color gradient
 */
function getSectionGradient(name) {
  const gradients = {
    personal: 'from-blue-400 to-cyan-400',
    education: 'from-purple-400 to-pink-400',
    family: 'from-orange-400 to-red-400',
    spouse: 'from-pink-400 to-rose-400',
    role: 'from-green-400 to-emerald-400'
  }
  return gradients[name] || 'from-gray-400 to-gray-500'
}

/**
 * Section breakdown widget showing all sections - Modern Design
 */
export function SectionBreakdownWidget({ breakdown, isLoading = false }) {
  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl p-5 shadow-lg">
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center space-y-2">
              <div className="h-14 w-14 rounded-full bg-muted/50 animate-pulse"></div>
              <div className="h-3 w-12 bg-muted/50 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!breakdown) {
    return (
      <div className="bg-secondary rounded-xl p-5 flex items-center justify-center shadow-sm">
        <p className="text-xs text-muted-foreground">No breakdown available</p>
      </div>
    )
  }

  const sections = Object.entries(breakdown).map(([name, data]) => ({
    name,
    percentage: data?.percentage || 0
  }))

  const completedCount = sections.filter(s => s.percentage === 100).length

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 rounded-xl p-5 space-y-3 shadow-lg border-2 border-blue-100 transition-all duration-300 hover:shadow-xl">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Sections
        </h3>
        <span className="text-xs font-semibold text-muted-foreground">
          {completedCount}/{sections.length}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {sections.map(({ name, percentage }) => {
          const isComplete = percentage === 100
          return (
            <div key={name} className="flex flex-col items-center space-y-2 group">
              <div className="relative">
                <CircularProgress percentage={percentage} size="small" />
                {isComplete && (
                  <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5 animate-in zoom-in">
                    <CheckCircle2 className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
              <p className="text-[10px] font-semibold capitalize text-center leading-tight group-hover:text-blue-600 transition-colors">
                {name}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
