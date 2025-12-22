'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Heart, UserX, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  getSpouseCandidates,
  linkSpouses,
  unlinkSpouse,
  getSpouseInfo,
  verifySpouseLinking
} from '@/server/actions/spouse-actions'

export default function SpouseSelector({ userId, currentSpouseId, maritalStatus, onUpdate }) {
  const [candidates, setCandidates] = useState([])
  const [selectedSpouse, setSelectedSpouse] = useState('')
  const [currentSpouse, setCurrentSpouse] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showUnlinkDialog, setShowUnlinkDialog] = useState(false)
  const [verification, setVerification] = useState(null)

  useEffect(() => {
    loadData()
  }, [userId, currentSpouseId])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [candidatesData, spouseData, verificationData] = await Promise.all([
        getSpouseCandidates(userId),
        currentSpouseId ? getSpouseInfo(userId) : Promise.resolve(null),
        currentSpouseId ? verifySpouseLinking(userId) : Promise.resolve(null)
      ])

      setCandidates(candidatesData)
      setCurrentSpouse(spouseData)
      setVerification(verificationData)
      setSelectedSpouse(currentSpouseId || '')
    } catch (error) {
      console.error('Error loading spouse data:', error)
      toast.error('Failed to load spouse information')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLink = async () => {
    if (!selectedSpouse || selectedSpouse === currentSpouseId) {
      return
    }

    try {
      setIsSaving(true)
      const result = await linkSpouses(userId, selectedSpouse)

      if (result.success) {
        toast.success(result.message)
        await loadData()
        if (onUpdate) onUpdate()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error('Error linking spouse:', error)
      toast.error('Failed to link spouse')
    } finally {
      setIsSaving(false)
    }
  }

  const handleUnlink = async () => {
    try {
      setIsSaving(true)
      const result = await unlinkSpouse(userId)

      if (result.success) {
        toast.success(result.message)
        setSelectedSpouse('')
        setCurrentSpouse(null)
        setVerification(null)
        setShowUnlinkDialog(false)
        await loadData()
        if (onUpdate) onUpdate()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error('Error unlinking spouse:', error)
      toast.error('Failed to unlink spouse')
    } finally {
      setIsSaving(false)
    }
  }

  // Check if user is married
  const isMarried = ['married', 'berkahwin'].includes(maritalStatus?.toLowerCase())

  if (!isMarried) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Heart className='h-5 w-5' />
            Spouse Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription>
              Spouse linking is only available for users with marital status set to "Married".
              Please update marital status first.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Heart className='h-5 w-5' />
            Spouse Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex items-center justify-center py-8'>
            <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Heart className='h-5 w-5' />
            Spouse Information
          </CardTitle>
          <CardDescription>
            Link this user to their spouse for mutual profile connection
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* Verification Status */}
          {verification && verification.hasSpouse && (
            <Alert variant={verification.isValid ? 'default' : 'destructive'}>
              {verification.isValid ? (
                <CheckCircle2 className='h-4 w-4' />
              ) : (
                <AlertCircle className='h-4 w-4' />
              )}
              <AlertDescription>
                {verification.message}
                {verification.issue === 'not_mutual' && (
                  <span className='block mt-2 text-sm'>
                    Fix this by re-linking or unlinking and linking again.
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Current Spouse Display */}
          {currentSpouse && (
            <div className='p-4 border rounded-lg bg-muted/50'>
              <div className='flex items-start justify-between'>
                <div>
                  <p className='text-sm font-medium text-muted-foreground mb-1'>
                    Currently Linked To:
                  </p>
                  <p className='font-semibold text-lg'>
                    {currentSpouse.first_name || currentSpouse.name}
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    {currentSpouse.email}
                  </p>
                  <div className='flex gap-2 mt-2'>
                    <Badge variant='outline'>
                      {currentSpouse.gender === 'male' ? 'Ikhwah' : 'Akhwat'}
                    </Badge>
                    {currentSpouse.branch && (
                      <Badge variant='secondary'>{currentSpouse.branch}</Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant='destructive'
                  size='sm'
                  onClick={() => setShowUnlinkDialog(true)}
                  disabled={isSaving}
                >
                  <UserX className='h-4 w-4 mr-2' />
                  Unlink
                </Button>
              </div>
            </div>
          )}

          {/* Spouse Selector */}
          <div className='space-y-2'>
            <Label htmlFor='spouse-select'>
              {currentSpouse ? 'Change Spouse' : 'Select Spouse'}
            </Label>
            <Select
              value={selectedSpouse}
              onValueChange={setSelectedSpouse}
              disabled={isSaving}
            >
              <SelectTrigger id='spouse-select'>
                <SelectValue placeholder='Choose a spouse...' />
              </SelectTrigger>
              <SelectContent>
                {candidates.length === 0 ? (
                  <div className='p-4 text-center text-sm text-muted-foreground'>
                    No eligible candidates available
                  </div>
                ) : (
                  candidates.map((candidate) => (
                    <SelectItem key={candidate.id} value={candidate.id}>
                      <div className='flex items-center justify-between w-full'>
                        <span>
                          {candidate.first_name || candidate.name}
                          {candidate.spouse_id === userId && ' (Currently linked)'}
                        </span>
                        <span className='text-xs text-muted-foreground ml-4'>
                          {candidate.gender === 'male' ? 'Ikhwah' : 'Akhwat'}
                          {candidate.branch && ` • ${candidate.branch}`}
                        </span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {candidates.length === 0 && (
              <p className='text-xs text-muted-foreground'>
                No opposite gender users found with marital status "Married" who are not already linked.
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className='flex gap-2'>
            <Button
              onClick={handleLink}
              disabled={!selectedSpouse || selectedSpouse === currentSpouseId || isSaving}
              className='flex-1'
            >
              {isSaving ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Linking...
                </>
              ) : (
                <>
                  <Heart className='mr-2 h-4 w-4' />
                  {currentSpouse ? 'Update Link' : 'Link Spouse'}
                </>
              )}
            </Button>
          </div>

          {/* Info */}
          <Alert>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription className='text-xs'>
              Spouse linking is mutual - both users will be linked to each other automatically.
              Only opposite gender users can be linked.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Unlink Confirmation Dialog */}
      <AlertDialog open={showUnlinkDialog} onOpenChange={setShowUnlinkDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unlink Spouse?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the spouse link for both{' '}
              <span className='font-semibold'>
                {currentSpouse?.first_name || currentSpouse?.name}
              </span>{' '}
              and the current user. This action can be reversed by linking again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSaving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUnlink}
              disabled={isSaving}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {isSaving ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Unlinking...
                </>
              ) : (
                'Unlink Spouse'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
