'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Heart, Search, AlertCircle, CheckCircle2, Users } from 'lucide-react'
import { getAllUsersProfileCompletion } from '@/server/actions/profile-completion'
import { verifySpouseLinking } from '@/server/actions/spouse-actions'
import SpouseSelector from '@/components/SpouseSelector'
import { toast } from 'sonner'

export default function SpouseManagementContainer() {
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const usersData = await getAllUsersProfileCompletion()

      // Filter only married users
      const marriedUsers = usersData.filter(user => {
        const maritalStatus = user.breakdown?.personal?.missing?.find(
          f => f.field === 'Marital Status'
        )
        return !maritalStatus // Has marital status filled
      })

      setUsers(marriedUsers)
    } catch (error) {
      console.error('Error loading users:', error)
      toast.error('Failed to load users')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(search.toLowerCase()) ||
    user.email?.toLowerCase().includes(search.toLowerCase()) ||
    user.firstName?.toLowerCase().includes(search.toLowerCase())
  )

  const stats = {
    total: users.length,
    linked: users.filter(u => u.breakdown?.spouse?.percentage === 100).length,
    unlinked: users.filter(u => u.breakdown?.spouse?.percentage < 100).length
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div>
        <h1 className='text-3xl font-bold tracking-tight flex items-center gap-2'>
          <Heart className='h-8 w-8' />
          Spouse Management
        </h1>
        <p className='text-muted-foreground mt-2'>
          Link married users (Ikhwah ↔ Akhwat) for mutual profile connection
        </p>
      </div>

      {/* Stats */}
      <div className='grid gap-4 md:grid-cols-3'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Total Married Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.total}</div>
            <p className='text-xs text-muted-foreground'>Users with marital status "Married"</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-green-600'>Linked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-600'>{stats.linked}</div>
            <p className='text-xs text-muted-foreground'>
              {stats.total > 0 ? Math.round((stats.linked / stats.total) * 100) : 0}% linked
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-orange-600'>Not Linked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-orange-600'>{stats.unlinked}</div>
            <p className='text-xs text-muted-foreground'>Need spouse linking</p>
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      <div className='grid gap-6 lg:grid-cols-2'>
        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle>Married Users</CardTitle>
            <CardDescription>Select a user to manage their spouse link</CardDescription>
            <div className='pt-4'>
              <Label htmlFor='search'>Search Users</Label>
              <div className='relative mt-2'>
                <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
                <Input
                  id='search'
                  placeholder='Name, email...'
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className='pl-8'
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className='space-y-3'>
                {[1, 2, 3].map((i) => (
                  <div key={i} className='h-16 bg-muted animate-pulse rounded' />
                ))}
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className='text-center py-8 text-muted-foreground'>
                No married users found
              </div>
            ) : (
              <div className='border rounded-lg overflow-hidden'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => {
                      const isLinked = user.breakdown?.spouse?.percentage === 100
                      const isSelected = selectedUser?.userId === user.userId

                      return (
                        <TableRow
                          key={user.userId}
                          className={`cursor-pointer ${isSelected ? 'bg-muted' : ''}`}
                          onClick={() => setSelectedUser(user)}
                        >
                          <TableCell>
                            <div>
                              <p className='font-medium'>{user.firstName || user.name}</p>
                              <p className='text-xs text-muted-foreground'>{user.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant='outline'>
                              {user.gender === 'male' ? 'Ikhwah' : 'Akhwat'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {isLinked ? (
                              <CheckCircle2 className='h-4 w-4 text-green-600' />
                            ) : (
                              <AlertCircle className='h-4 w-4 text-orange-600' />
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Spouse Selector */}
        <div>
          {selectedUser ? (
            <SpouseSelector
              userId={selectedUser.userId}
              currentSpouseId={selectedUser.breakdown?.spouse?.percentage === 100 ? 'linked' : null}
              maritalStatus='married'
              onUpdate={loadData}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Users className='h-5 w-5' />
                  No User Selected
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Alert>
                  <AlertCircle className='h-4 w-4' />
                  <AlertDescription>
                    Select a user from the list to manage their spouse linking.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Instructions */}
      <Alert>
        <AlertCircle className='h-4 w-4' />
        <AlertDescription>
          <strong>How spouse linking works:</strong>
          <ul className='list-disc list-inside mt-2 space-y-1 text-sm'>
            <li>Only users with marital status "Married" can be linked</li>
            <li>Only opposite gender users can be linked (Ikhwah ↔ Akhwat)</li>
            <li>Linking is mutual - both users are automatically linked to each other</li>
            <li>Each user can only be linked to one spouse at a time</li>
            <li>Unlinking removes the connection for both users</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  )
}
