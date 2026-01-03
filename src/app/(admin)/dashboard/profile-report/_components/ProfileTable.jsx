'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Eye, ChevronDown, ChevronRight } from 'lucide-react'
import { getCompletionStatus } from '@/lib/profile-completion-calculator'
import MissingFieldsView from './MissingFieldsView'

export default function ProfileTable({ users, isLoading }) {
  const [expandedUser, setExpandedUser] = useState(null)

  if (isLoading) {
    return (
      <div className='border rounded-lg'>
        <div className='p-4'>
          <div className='space-y-4'>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className='flex items-center space-x-4'>
                <div className='h-10 w-10 rounded-full bg-muted animate-pulse' />
                <div className='flex-1 space-y-2'>
                  <div className='h-4 w-48 bg-muted animate-pulse rounded' />
                  <div className='h-3 w-32 bg-muted animate-pulse rounded' />
                </div>
                <div className='h-8 w-20 bg-muted animate-pulse rounded' />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!users || users.length === 0) {
    return (
      <div className='border rounded-lg p-8 text-center text-muted-foreground'>
        No users found matching your criteria.
      </div>
    )
  }

  const getStatusBadge = (percentage) => {
    const status = getCompletionStatus(percentage)
    const variants = {
      green: 'default',
      blue: 'secondary',
      yellow: 'outline',
      orange: 'destructive',
      red: 'destructive'
    }
    return (
      <Badge variant={variants[status.color] || 'secondary'}>
        {status.label}
      </Badge>
    )
  }

  const toggleExpand = (userId) => {
    setExpandedUser(expandedUser === userId ? null : userId)
  }

  return (
    <div className='border rounded-lg overflow-hidden'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='w-12'></TableHead>
            <TableHead>User</TableHead>
            <TableHead>Gender</TableHead>
            <TableHead>Branch</TableHead>
            <TableHead>Completion</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Missing Fields</TableHead>
            <TableHead className='text-right'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <>
              <TableRow
                key={user.userId}
                className={expandedUser === user.userId ? 'bg-muted/50' : ''}
              >
                <TableCell>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => toggleExpand(user.userId)}
                    className='h-8 w-8 p-0'
                  >
                    {expandedUser === user.userId ? (
                      <ChevronDown className='h-4 w-4' />
                    ) : (
                      <ChevronRight className='h-4 w-4' />
                    )}
                  </Button>
                </TableCell>
                <TableCell>
                  <div className='flex flex-col'>
                    <span className='font-medium'>
                      {user.firstName || user.name || 'No Name'}
                    </span>
                    <span className='text-sm text-muted-foreground'>
                      {user.email}
                    </span>
                    <span className='text-xs text-muted-foreground'>
                      @{user.username || 'no-username'}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {user.gender ? (
                    <Badge variant='outline'>
                      {user.gender === 'Male' ? 'Ikhwah' : 'Akhwat'}
                    </Badge>
                  ) : (
                    <span className='text-muted-foreground text-sm'>-</span>
                  )}
                </TableCell>
                <TableCell>
                  {user.branch || (
                    <span className='text-muted-foreground text-sm'>-</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className='space-y-1 min-w-[150px]'>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm font-medium'>
                        {user.percentage}%
                      </span>
                      <span className='text-xs text-muted-foreground'>
                        {user.score}/100
                      </span>
                    </div>
                    <Progress value={user.percentage} className='h-2' />
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(user.percentage)}</TableCell>
                <TableCell>
                  <Badge variant='secondary'>
                    {user.missingFieldsCount}
                  </Badge>
                </TableCell>
                <TableCell className='text-right'>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => toggleExpand(user.userId)}
                  >
                    <Eye className='h-4 w-4 mr-2' />
                    Details
                  </Button>
                </TableCell>
              </TableRow>
              {expandedUser === user.userId && (
                <TableRow>
                  <TableCell colSpan={8} className='bg-muted/50'>
                    <MissingFieldsView user={user} />
                  </TableCell>
                </TableRow>
              )}
            </>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
