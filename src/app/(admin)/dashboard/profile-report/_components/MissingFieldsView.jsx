'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { AlertCircle } from 'lucide-react'

export default function MissingFieldsView({ user }) {
  const { breakdown, missingFields } = user

  if (!breakdown) {
    return (
      <div className='p-4 text-center text-muted-foreground'>
        No breakdown data available
      </div>
    )
  }

  const categories = [
    { key: 'personal', label: 'Personal Information', color: 'bg-blue-500' },
    { key: 'education', label: 'Education', color: 'bg-green-500' },
    { key: 'family', label: 'Family', color: 'bg-purple-500' },
    { key: 'spouse', label: 'Spouse', color: 'bg-pink-500' },
    { key: 'role', label: 'Role & Murobbi', color: 'bg-orange-500' }
  ]

  return (
    <div className='p-6 space-y-6'>
      {/* Category Scores */}
      <div>
        <h4 className='text-sm font-semibold mb-4'>Category Breakdown</h4>
        <div className='grid gap-4 md:grid-cols-5'>
          {categories.map((cat) => {
            const data = breakdown[cat.key]
            return (
              <Card key={cat.key}>
                <CardHeader className='pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    {cat.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-2'>
                    <div className='flex items-center justify-between'>
                      <span className='text-2xl font-bold'>
                        {data.percentage}%
                      </span>
                      <Badge variant='outline' className='text-xs'>
                        {data.score}/{data.maxScore}
                      </Badge>
                    </div>
                    <Progress value={data.percentage} className='h-2' />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Missing Fields */}
      {missingFields && missingFields.length > 0 && (
        <div>
          <h4 className='text-sm font-semibold mb-4 flex items-center gap-2'>
            <AlertCircle className='h-4 w-4 text-destructive' />
            Missing Fields ({missingFields.length})
          </h4>
          <div className='grid gap-3 md:grid-cols-2 lg:grid-cols-3'>
            {missingFields.map((field, index) => (
              <Card key={index} className='border-destructive/50'>
                <CardContent className='pt-4'>
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <p className='text-xs font-medium text-muted-foreground mb-1'>
                        {field.category}
                      </p>
                      <p className='text-sm font-medium'>{field.field}</p>
                    </div>
                    <Badge variant='destructive' className='text-xs'>
                      {field.weight}%
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {missingFields && missingFields.length === 0 && (
        <div className='p-4 text-center text-green-600 bg-green-50 rounded-lg border border-green-200'>
          <p className='font-medium'>✓ Profile is 100% complete!</p>
        </div>
      )}
    </div>
  )
}
