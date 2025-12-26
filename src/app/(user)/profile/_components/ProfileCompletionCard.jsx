'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  User,
  GraduationCap,
  Users,
  Heart,
  Shield,
  AlertCircle,
  CheckCircle2
} from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Get color based on completion percentage
 */
function getCompletionColor(percentage) {
  if (percentage === 100) return 'text-green-600'
  if (percentage >= 76) return 'text-blue-600'
  if (percentage >= 51) return 'text-yellow-600'
  if (percentage >= 26) return 'text-orange-600'
  return 'text-red-600'
}

/**
 * Get background color for progress bar
 */
function getProgressColor(percentage) {
  if (percentage === 100) return 'bg-green-600'
  if (percentage >= 76) return 'bg-blue-600'
  if (percentage >= 51) return 'bg-yellow-600'
  if (percentage >= 26) return 'bg-orange-600'
  return 'bg-red-600'
}

/**
 * Get section icon
 */
function getSectionIcon(sectionName) {
  const icons = {
    personal: User,
    education: GraduationCap,
    family: Users,
    spouse: Heart,
    role: Shield
  }
  return icons[sectionName] || AlertCircle
}

/**
 * Section breakdown item
 */
function SectionBreakdownItem({ name, data }) {
  const Icon = getSectionIcon(name)
  const percentage = data?.percentage || 0
  const isComplete = percentage === 100

  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        <Icon className={cn(
          "h-4 w-4",
          isComplete ? "text-green-600" : "text-muted-foreground"
        )} />
        <span className="text-sm capitalize">{name}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={cn(
          "text-sm font-medium",
          getCompletionColor(percentage)
        )}>
          {percentage}%
        </span>
        {isComplete && (
          <CheckCircle2 className="h-4 w-4 text-green-600" />
        )}
      </div>
    </div>
  )
}

/**
 * Profile Completion Card Component
 */
export function ProfileCompletionCard({ completion, isLoading = false }) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-8 bg-muted rounded"></div>
            <div className="h-2 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!completion) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Unable to load profile completion</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const percentage = completion.percentage || 0
  const isComplete = percentage === 100
  const breakdown = completion.breakdown || {}

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Profile Completion</h3>
          <div className={cn(
            "text-2xl font-bold",
            getCompletionColor(percentage)
          )}>
            {percentage}%
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress
            value={percentage}
            className="h-3"
            indicatorClassName={getProgressColor(percentage)}
          />
          {isComplete ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm font-medium">Profile Complete!</span>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {completion.missingFields?.length || 0} fields remaining
            </p>
          )}
        </div>

        {/* Section Breakdown */}
        {Object.keys(breakdown).length > 0 && (
          <div className="border-t pt-4 space-y-1">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              Sections
            </h4>
            {Object.entries(breakdown).map(([name, data]) => (
              <SectionBreakdownItem
                key={name}
                name={name}
                data={data}
              />
            ))}
          </div>
        )}

        {/* Missing Fields Preview */}
        {!isComplete && completion.missingFields && completion.missingFields.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              Next Steps
            </h4>
            <ul className="space-y-1">
              {completion.missingFields.slice(0, 3).map((field, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">•</span>
                  <span className="capitalize">{field.replace(/_/g, ' ')}</span>
                </li>
              ))}
              {completion.missingFields.length > 3 && (
                <li className="text-sm text-muted-foreground italic">
                  + {completion.missingFields.length - 3} more fields
                </li>
              )}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
