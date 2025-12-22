'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react'

export default function ProfileStats({ stats, isLoading }) {
  if (isLoading) {
    return (
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <div className='h-4 w-24 bg-muted animate-pulse rounded' />
              <div className='h-4 w-4 bg-muted animate-pulse rounded' />
            </CardHeader>
            <CardContent>
              <div className='h-8 w-16 bg-muted animate-pulse rounded' />
              <div className='h-3 w-32 bg-muted animate-pulse rounded mt-2' />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      description: 'Registered users',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Complete Profiles',
      value: stats?.completeProfiles || 0,
      description: `${stats?.totalUsers > 0 ? Math.round((stats.completeProfiles / stats.totalUsers) * 100) : 0}% completion rate`,
      icon: CheckCircle2,
      color: 'text-green-600'
    },
    {
      title: 'Incomplete Profiles',
      value: stats?.incompleteProfiles || 0,
      description: `${stats?.totalUsers > 0 ? Math.round((stats.incompleteProfiles / stats.totalUsers) * 100) : 0}% need attention`,
      icon: AlertCircle,
      color: 'text-orange-600'
    },
    {
      title: 'Average Completion',
      value: `${stats?.averageCompletion || 0}%`,
      description: 'Overall average',
      icon: TrendingUp,
      color: 'text-purple-600'
    }
  ]

  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
      {statCards.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                {stat.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stat.value}</div>
              <p className='text-xs text-muted-foreground'>
                {stat.description}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
