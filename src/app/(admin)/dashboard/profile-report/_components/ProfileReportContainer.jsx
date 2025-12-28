'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getAllUsersProfileCompletion, getProfileCompletionStats } from '@/server/actions/profile-completion'
import ProfileStats from './ProfileStats'
import ProfileFilters from './ProfileFilters'
import ProfileTable from './ProfileTable'
import ExportButton from './ExportButton'
import { toast } from 'sonner'
import { PageHeader } from '@/components/admin'

export default function ProfileReportContainer() {
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
    completionRange: 'all',
    gender: 'all',
    branch: 'all'
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [usersData, statsData] = await Promise.all([
        getAllUsersProfileCompletion(),
        getProfileCompletionStats()
      ])
      setUsers(usersData)
      setStats(statsData)
    } catch (error) {
      console.error('Error loading profile completion data:', error)
      toast.error('Failed to load profile completion data')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredUsers = useMemo(() => {
    let filtered = [...users]

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower) ||
          user.username?.toLowerCase().includes(searchLower) ||
          user.firstName?.toLowerCase().includes(searchLower)
      )
    }

    // Completion range filter
    if (filters.completionRange !== 'all') {
      switch (filters.completionRange) {
        case 'incomplete':
          filtered = filtered.filter((user) => user.percentage < 100)
          break
        case 'critical':
          filtered = filtered.filter((user) => user.percentage < 26)
          break
        case 'low':
          filtered = filtered.filter(
            (user) => user.percentage >= 26 && user.percentage < 51
          )
          break
        case 'medium':
          filtered = filtered.filter(
            (user) => user.percentage >= 51 && user.percentage < 76
          )
          break
        case 'almostComplete':
          filtered = filtered.filter(
            (user) => user.percentage >= 76 && user.percentage < 100
          )
          break
        case 'complete':
          filtered = filtered.filter((user) => user.percentage === 100)
          break
      }
    }

    // Gender filter
    if (filters.gender !== 'all') {
      filtered = filtered.filter(
        (user) => user.gender?.toLowerCase() === filters.gender
      )
    }

    // Branch filter
    if (filters.branch !== 'all') {
      filtered = filtered.filter((user) => user.branch === filters.branch)
    }

    return filtered
  }, [users, filters])

  const resetFilters = () => {
    setFilters({
      search: '',
      completionRange: 'all',
      gender: 'all',
      branch: 'all'
    })
  }

  return (
    <div className='space-y-6'>
      <PageHeader
        title="Profile Completion Report"
        description="Monitor and track user profile completion status across the organization"
        action={<ExportButton />}
      />

      {/* Statistics */}
      <ProfileStats stats={stats} isLoading={isLoading} />

      {/* Filters & Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Profiles</CardTitle>
          <CardDescription>
            {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}{' '}
            {filters.search ||
            filters.completionRange !== 'all' ||
            filters.gender !== 'all' ||
            filters.branch !== 'all'
              ? 'matching your filters'
              : 'in total'}
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          <ProfileFilters
            filters={filters}
            setFilters={setFilters}
            onReset={resetFilters}
          />
          <ProfileTable users={filteredUsers} isLoading={isLoading} />
        </CardContent>
      </Card>
    </div>
  )
}
