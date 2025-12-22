'use client'

import { useEffect, useState } from 'react'
import { useSession } from '@/lib/auth-client'
import { getProfileCompletion } from '@/server/actions/profile-completion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  User,
  GraduationCap,
  Users,
  Heart,
  Shield,
  ChevronDown,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

/**
 * Get motivational message based on completion percentage
 */
function getMotivationalMessage(percentage) {
  if (percentage === 100) return { text: "Profile Complete!", emoji: "🎉", color: "text-green-600" }
  if (percentage >= 76) return { text: "So close to perfect!", emoji: "🎯", color: "text-blue-600" }
  if (percentage >= 51) return { text: "Almost there! Keep going!", emoji: "⭐", color: "text-purple-600" }
  if (percentage >= 26) return { text: "You're making progress!", emoji: "💪", color: "text-orange-600" }
  return { text: "Let's get started!", emoji: "🚀", color: "text-red-600" }
}

/**
 * Get section colors and configuration
 */
function getSectionConfig(sectionName) {
  const configs = {
    personal: {
      icon: User,
      label: 'Personal Info',
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50',
      iconColor: 'text-blue-600',
      progressColor: 'bg-blue-600'
    },
    education: {
      icon: GraduationCap,
      label: 'Education',
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-50 to-pink-50',
      iconColor: 'text-purple-600',
      progressColor: 'bg-purple-600'
    },
    family: {
      icon: Users,
      label: 'Family',
      gradient: 'from-orange-500 to-red-500',
      bgGradient: 'from-orange-50 to-red-50',
      iconColor: 'text-orange-600',
      progressColor: 'bg-orange-600'
    },
    spouse: {
      icon: Heart,
      label: 'Spouse',
      gradient: 'from-pink-500 to-rose-500',
      bgGradient: 'from-pink-50 to-rose-50',
      iconColor: 'text-pink-600',
      progressColor: 'bg-pink-600'
    },
    role: {
      icon: Shield,
      label: 'Role',
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-50 to-emerald-50',
      iconColor: 'text-green-600',
      progressColor: 'bg-green-600'
    }
  }
  return configs[sectionName] || configs.personal
}

/**
 * Animated Progress Ring Component
 */
function AnimatedProgressRing({ percentage, size = 200, strokeWidth = 16 }) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (percentage / 100) * circumference

  const getStrokeColor = () => {
    if (percentage === 100) return '#10b981' // green
    if (percentage >= 76) return '#3b82f6' // blue
    if (percentage >= 51) return '#8b5cf6' // purple
    if (percentage >= 26) return '#f59e0b' // orange
    return '#ef4444' // red
  }

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle with gradient */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getStrokeColor()}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{
            filter: 'drop-shadow(0 0 8px rgba(0, 0, 0, 0.1))'
          }}
        />
      </svg>
      {/* Percentage text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {percentage}%
        </span>
        <span className="text-sm text-muted-foreground mt-1">Complete</span>
      </div>
    </div>
  )
}

/**
 * Section Progress Card
 */
function SectionCard({ name, data }) {
  const config = getSectionConfig(name)
  const Icon = config.icon
  const percentage = data?.percentage || 0
  const completed = data?.maxScore - data?.missing?.length || 0
  const total = data?.maxScore || 0
  const isComplete = percentage === 100

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      <div className={cn("h-2 bg-gradient-to-r", config.gradient)} />
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-3 rounded-xl bg-gradient-to-br transition-transform duration-300 group-hover:scale-110",
              config.bgGradient
            )}>
              <Icon className={cn("h-6 w-6", config.iconColor)} />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{config.label}</h3>
              <p className="text-sm text-muted-foreground">
                {completed} of {total} fields
              </p>
            </div>
          </div>
          {isComplete && (
            <CheckCircle2 className="h-6 w-6 text-green-600 animate-in zoom-in duration-300" />
          )}
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className={cn(
              "font-bold",
              isComplete ? "text-green-600" : config.iconColor
            )}>
              {percentage}%
            </span>
          </div>
          <Progress
            value={percentage}
            className="h-3"
            indicatorClassName={config.progressColor}
          />
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Missing Fields Accordion Section
 */
function MissingFieldsSection({ missingFields, breakdown }) {
  const [openSections, setOpenSections] = useState({})

  const fieldsByCategory = {}
  Object.entries(breakdown).forEach(([sectionName, data]) => {
    if (data.missing && data.missing.length > 0) {
      fieldsByCategory[sectionName] = data.missing
    }
  })

  if (Object.keys(fieldsByCategory).length === 0) {
    return null
  }

  return (
    <Card className="overflow-hidden">
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 border-b">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-amber-600" />
          <h3 className="font-semibold text-lg">Missing Fields</h3>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Complete these fields to reach 100%
        </p>
      </div>

      <CardContent className="p-0">
        {Object.entries(fieldsByCategory).map(([sectionName, fields]) => {
          const config = getSectionConfig(sectionName)
          const Icon = config.icon
          const isOpen = openSections[sectionName]

          return (
            <Collapsible
              key={sectionName}
              open={isOpen}
              onOpenChange={(open) => setOpenSections(prev => ({ ...prev, [sectionName]: open }))}
            >
              <CollapsibleTrigger className="w-full hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between p-4 border-b">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg bg-gradient-to-br", config.bgGradient)}>
                      <Icon className={cn("h-4 w-4", config.iconColor)} />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">{config.label}</p>
                      <p className="text-sm text-muted-foreground">
                        {fields.length} field{fields.length > 1 ? 's' : ''} missing
                      </p>
                    </div>
                  </div>
                  <ChevronDown className={cn(
                    "h-5 w-5 text-muted-foreground transition-transform duration-200",
                    isOpen && "rotate-180"
                  )} />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="p-4 space-y-2 bg-muted/20">
                  {fields.map((field, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-background rounded-lg border"
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-amber-500" />
                        <span className="text-sm">{field.field}</span>
                      </div>
                      <Button size="sm" variant="ghost" asChild>
                        <Link href="/profile">
                          Complete
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )
        })}
      </CardContent>
    </Card>
  )
}

/**
 * Profile Completion Page
 */
export default function ProfileCompletionPage() {
  const { data: session } = useSession()
  const [completion, setCompletion] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchCompletion() {
      if (!session?.user?.id) return

      try {
        setIsLoading(true)
        const data = await getProfileCompletion(session.user.id)
        setCompletion(data)
      } catch (error) {
        console.error('Error fetching profile completion:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCompletion()
  }, [session?.user?.id])

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="space-y-8 animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-64 bg-muted rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-48 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!completion) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Unable to load profile completion</h3>
            <p className="text-sm text-muted-foreground">Please try refreshing the page</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const percentage = completion.percentage || 0
  const motivation = getMotivationalMessage(percentage)
  const isComplete = percentage === 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="container mx-auto p-6 max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Profile Completion
            </h1>
            <p className="text-muted-foreground mt-1">
              Track your profile progress and complete missing fields
            </p>
          </div>
          <Sparkles className="h-8 w-8 text-purple-600" />
        </div>

        {/* Hero Section - Progress Ring */}
        <Card className="overflow-hidden shadow-xl">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-1">
            <div className="bg-background">
              <CardContent className="p-12">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                  {/* Progress Ring */}
                  <div className="flex flex-col items-center">
                    <AnimatedProgressRing percentage={percentage} size={220} strokeWidth={18} />
                    <div className={cn("mt-6 text-center")}>
                      <p className={cn("text-2xl font-bold mb-1", motivation.color)}>
                        {motivation.text} {motivation.emoji}
                      </p>
                      <p className="text-muted-foreground">
                        {isComplete
                          ? "Your profile is fully completed!"
                          : `${completion.missingFields?.length || 0} fields remaining`
                        }
                      </p>
                    </div>
                  </div>

                  {/* Stats Cards */}
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                      <CardContent className="p-6">
                        <p className="text-sm text-blue-700 font-medium mb-2">Total Score</p>
                        <p className="text-3xl font-bold text-blue-900">
                          {completion.score}/100
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                      <CardContent className="p-6">
                        <p className="text-sm text-purple-700 font-medium mb-2">Sections</p>
                        <p className="text-3xl font-bold text-purple-900">
                          {Object.values(completion.breakdown).filter(s => s.percentage === 100).length}/5
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                      <CardContent className="p-6">
                        <p className="text-sm text-green-700 font-medium mb-2">Completed</p>
                        <p className="text-3xl font-bold text-green-900">
                          {Object.values(completion.breakdown).reduce((sum, s) => sum + (s.maxScore - s.missing.length), 0)} fields
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                      <CardContent className="p-6">
                        <p className="text-sm text-orange-700 font-medium mb-2">Missing</p>
                        <p className="text-3xl font-bold text-orange-900">
                          {completion.missingFields?.length || 0} fields
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* CTA Button */}
                <div className="mt-8 text-center">
                  {isComplete ? (
                    <Button size="lg" variant="default" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700" asChild>
                      <Link href="/profile">
                        <CheckCircle2 className="mr-2 h-5 w-5" />
                        View Full Profile
                      </Link>
                    </Button>
                  ) : (
                    <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" asChild>
                      <Link href="/profile">
                        <Sparkles className="mr-2 h-5 w-5" />
                        Complete Your Profile
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </div>
          </div>
        </Card>

        {/* Section Progress Cards */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            Section Breakdown
            <span className="text-sm text-muted-foreground font-normal">
              ({Object.values(completion.breakdown).filter(s => s.percentage === 100).length}/5 complete)
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(completion.breakdown).map(([name, data]) => (
              <SectionCard key={name} name={name} data={data} />
            ))}
          </div>
        </div>

        {/* Missing Fields Section */}
        {!isComplete && (
          <MissingFieldsSection
            missingFields={completion.missingFields}
            breakdown={completion.breakdown}
          />
        )}

        {/* Completion Badge */}
        {isComplete && (
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 overflow-hidden">
            <CardContent className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-600 mb-4 animate-bounce">
                <CheckCircle2 className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-green-900 mb-2">
                Congratulations! 🎉
              </h3>
              <p className="text-green-700">
                Your profile is 100% complete. Great job!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
