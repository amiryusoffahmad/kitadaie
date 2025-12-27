'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, User, AlertCircle } from "lucide-react"
import { getMentees, getMentor } from "@/server/actions/hq-tree-actions"
import { ProfileModal } from "./ProfileModal"
import { toast } from "sonner"

export function HQTreeList() {
  const [mentees, setMentees] = useState([])
  const [mentor, setMentor] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [menteesData, mentorData] = await Promise.all([
        getMentees(),
        getMentor()
      ])
      setMentees(menteesData || [])
      setMentor(mentorData)
    } catch (error) {
      toast.error("Failed to load HQ Tree data")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCardClick = (user) => {
    setSelectedUser(user)
    setIsProfileOpen(true)
  }

  const handleCloseProfile = () => {
    setIsProfileOpen(false)
    setSelectedUser(null)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Mentor Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-24" />
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2.5">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mentees Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-24" />
          <div className="grid gap-2">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2.5">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3.5 w-28" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Mentor Section */}
      {mentor && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold flex items-center gap-1.5 text-muted-foreground">
            <User className="h-4 w-4" />
            My Mentor
          </h2>
          <Card
            className="cursor-pointer hover:bg-accent/50 transition-colors active:scale-[0.98]"
            onClick={() => handleCardClick(mentor)}
          >
            <CardContent className="p-3">
              <div className="flex items-center gap-2.5">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={mentor.image} />
                  <AvatarFallback className="text-sm">
                    {mentor.first_name?.[0] || mentor.name?.[0] || 'M'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {mentor.first_name || mentor.name}
                  </p>
                  {mentor.branch && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {mentor.branch}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Mentees Section */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold flex items-center gap-1.5 text-muted-foreground">
          <Users className="h-4 w-4" />
          My Mentees ({mentees.length})
        </h2>

        {mentees.length === 0 ? (
          <Alert className="py-3">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              You don't have any mentees yet.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid gap-2">
            {mentees.map((mentee) => (
              <Card
                key={mentee.id}
                className="cursor-pointer hover:bg-accent/50 transition-colors active:scale-[0.98]"
                onClick={() => handleCardClick(mentee)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={mentee.image} />
                      <AvatarFallback className="text-sm">
                        {mentee.first_name?.[0] || mentee.name?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {mentee.first_name || mentee.name}
                      </p>
                      {mentee.branch && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {mentee.branch}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Profile Modal */}
      {selectedUser && (
        <ProfileModal
          userId={selectedUser.id}
          userName={selectedUser.first_name || selectedUser.name}
          isOpen={isProfileOpen}
          onClose={handleCloseProfile}
        />
      )}
    </div>
  )
}
