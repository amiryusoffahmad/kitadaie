'use client'

import { cn } from '@/lib/utils'
import { CheckCircle2, AlertCircle, Sparkles } from 'lucide-react'

/**
 * Get color based on completion percentage
 */
function getCompletionColor(percentage) {
  if (percentage === 100) return 'bg-green-500'
  if (percentage >= 76) return 'bg-blue-500'
  if (percentage >= 51) return 'bg-purple-500'
  if (percentage >= 26) return 'bg-orange-500'
  return 'bg-red-500'
}

/**
 * Get motivational message based on completion percentage
 */
function getMotivationalMessage(percentage) {
  if (percentage === 100) return { text: "Complete!", emoji: "🎉", color: "text-green-600" }
  if (percentage >= 76) return { text: "Almost done!", emoji: "🎯", color: "text-blue-600" }
  if (percentage >= 51) return { text: "Keep going!", emoji: "⭐", color: "text-purple-600" }
  if (percentage >= 26) return { text: "Making progress!", emoji: "💪", color: "text-orange-600" }
  return { text: "Let's start!", emoji: "🚀", color: "text-red-600" }
}

/**
 * Modern Circular progress indicator with gradient
 */
function CircularProgress({ percentage, size = 'large' }) {
  const radius = size === 'large' ? 40 : 24
  const stroke = size === 'large' ? 8 : 5
  const normalizedRadius = radius - stroke / 2
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  const sizeClass = size === 'large' ? 'h-24 w-24' : 'h-14 w-14'
  const textSize = size === 'large' ? 'text-2xl' : 'text-sm'

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
          stroke="#e5e7eb"
          strokeWidth={stroke}
          fill="none"
        />
        {/* Progress circle with gradient effect */}
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
          className="transition-all duration-1000 ease-out"
          style={{
            filter: 'drop-shadow(0 0 4px rgba(0, 0, 0, 0.1))'
          }}
        />
      </svg>
      {/* Percentage text with gradient */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={cn(
          "font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent",
          textSize
        )}>
          {percentage}%
        </span>
      </div>
    </div>
  )
}

/**
 * Large completion widget for profile overview - Modern Design
 */
export function CompletionWidget({ completion, isLoading = false }) {
  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-5 flex flex-col items-center justify-center shadow-sm">
        <div className="h-24 w-24 rounded-full bg-muted/50 animate-pulse"></div>
        <div className="h-4 w-20 bg-muted/50 rounded mt-3 animate-pulse"></div>
      </div>
    )
  }

  if (!completion) {
    return (
      <div className="bg-secondary rounded-xl p-5 flex flex-col items-center justify-center shadow-sm">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <p className="text-xs text-muted-foreground mt-2">No data</p>
      </div>
    )
  }

  const percentage = completion.percentage || 0
  const isComplete = percentage === 100
  const motivation = getMotivationalMessage(percentage)

  return (
    <div className={cn(
      "rounded-xl p-5 flex flex-col items-center justify-center space-y-3 shadow-lg transition-all duration-300 hover:shadow-xl border-2",
      isComplete
        ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200"
        : "bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-purple-200"
    )}>
      <CircularProgress percentage={percentage} size="large" />
      <div className="text-center">
        <p className={cn("text-sm font-bold mb-1", motivation.color)}>
          {motivation.text} {motivation.emoji}
        </p>
        {isComplete ? (
          <div className="flex items-center gap-1 justify-center text-green-600 mt-1">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-xs font-medium">Profile Complete</span>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground mt-1 font-medium">
            {completion.missingFieldsCount || 0} fields remaining
          </p>
        )}
      </div>
    </div>
  )
}

/**
 * Small completion widget for section overview
 */
export function SectionCompletionWidget({ sectionName, percentage, isLoading = false }) {
  if (isLoading) {
    return (
      <div className="bg-secondary rounded-[7px] p-4 flex flex-col items-center justify-center">
        <div className="h-14 w-14 rounded-full bg-muted/50 animate-pulse"></div>
        <div className="h-3 w-16 bg-muted/50 rounded mt-2 animate-pulse"></div>
      </div>
    )
  }

  const completionPercentage = percentage || 0
  const isComplete = completionPercentage === 100

  return (
    <div className={cn(
      "bg-secondary rounded-[7px] p-4 flex flex-col items-center justify-center space-y-2",
      isComplete && "bg-green-50 dark:bg-green-950/20"
    )}>
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
