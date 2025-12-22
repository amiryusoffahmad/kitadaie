'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Search, X } from 'lucide-react'

export default function ProfileFilters({ filters, setFilters, onReset }) {
  return (
    <div className='space-y-4'>
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {/* Search */}
        <div className='space-y-2'>
          <Label htmlFor='search'>Search</Label>
          <div className='relative'>
            <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
            <Input
              id='search'
              placeholder='Name, email, username...'
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className='pl-8'
            />
          </div>
        </div>

        {/* Completion Range */}
        <div className='space-y-2'>
          <Label htmlFor='completionRange'>Completion Range</Label>
          <Select
            value={filters.completionRange}
            onValueChange={(value) =>
              setFilters({ ...filters, completionRange: value })
            }
          >
            <SelectTrigger id='completionRange'>
              <SelectValue placeholder='All' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Users</SelectItem>
              <SelectItem value='incomplete'>Incomplete (&lt;100%)</SelectItem>
              <SelectItem value='critical'>Critical (0-25%)</SelectItem>
              <SelectItem value='low'>Low (26-50%)</SelectItem>
              <SelectItem value='medium'>Medium (51-75%)</SelectItem>
              <SelectItem value='almostComplete'>Almost Complete (76-99%)</SelectItem>
              <SelectItem value='complete'>Complete (100%)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Gender Filter */}
        <div className='space-y-2'>
          <Label htmlFor='gender'>Gender</Label>
          <Select
            value={filters.gender}
            onValueChange={(value) =>
              setFilters({ ...filters, gender: value })
            }
          >
            <SelectTrigger id='gender'>
              <SelectValue placeholder='All' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All</SelectItem>
              <SelectItem value='male'>Ikhwah (Male)</SelectItem>
              <SelectItem value='female'>Akhwat (Female)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Branch Filter */}
        <div className='space-y-2'>
          <Label htmlFor='branch'>Branch</Label>
          <Select
            value={filters.branch}
            onValueChange={(value) =>
              setFilters({ ...filters, branch: value })
            }
          >
            <SelectTrigger id='branch'>
              <SelectValue placeholder='All' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Branches</SelectItem>
              <SelectItem value='Kuala Lumpur'>Kuala Lumpur</SelectItem>
              <SelectItem value='Selangor'>Selangor</SelectItem>
              <SelectItem value='Penang'>Penang</SelectItem>
              <SelectItem value='Johor'>Johor</SelectItem>
              {/* Add more branches as needed */}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Reset Button */}
      {(filters.search ||
        filters.completionRange !== 'all' ||
        filters.gender !== 'all' ||
        filters.branch !== 'all') && (
        <div className='flex justify-end'>
          <Button variant='outline' size='sm' onClick={onReset}>
            <X className='mr-2 h-4 w-4' />
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  )
}
