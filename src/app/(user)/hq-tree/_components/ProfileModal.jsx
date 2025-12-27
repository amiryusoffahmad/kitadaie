'use client'

import { useState, useEffect } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  User,
  GraduationCap,
  Users,
  Award,
  MapPin,
  Phone,
  Mail,
  Building2,
  Heart,
  Loader2
} from "lucide-react"
import { getUserFullProfile } from "@/server/actions/hq-tree-actions"
import { toast } from "sonner"

/**
 * ProfileModal Component - Shows read-only full profile
 */
export function ProfileModal({ userId, isOpen, onClose, userName }) {
  const [profileData, setProfileData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen && userId) {
      fetchProfile()
    }
  }, [isOpen, userId])

  const fetchProfile = async () => {
    setIsLoading(true)
    try {
      const data = await getUserFullProfile(userId)
      setProfileData(data)
    } catch (error) {
      toast.error(error.message || "Failed to load profile")
      onClose()
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[92vh] overflow-y-auto p-0">
        <SheetHeader className="px-4 pt-4 pb-3 sticky top-0 bg-background z-10 border-b">
          <SheetTitle className="text-base">Profile</SheetTitle>
          <SheetDescription className="text-xs">
            Read-only view of {userName}'s profile
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : profileData ? (
          <div className="px-4 pt-4 pb-6 space-y-4">
            {/* User Header */}
            <div className="flex items-center gap-3">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profileData.user?.image} />
                <AvatarFallback className="text-lg">
                  {profileData.profile?.first_name?.[0] || profileData.user?.name?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold truncate">
                  {profileData.profile?.first_name || profileData.user?.name}
                </h2>
                <p className="text-xs text-muted-foreground truncate">@{profileData.user?.username}</p>
                {profileData.profile?.branch && (
                  <Badge variant="secondary" className="mt-1.5 text-xs">
                    {profileData.profile.branch}
                  </Badge>
                )}
              </div>
            </div>

            <Separator className="my-3" />

            {/* Personal Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <User className="h-4 w-4" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5 pt-0">
                {profileData.profile?.gender && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Gender</span>
                    <span className="text-sm font-medium capitalize">{profileData.profile.gender}</span>
                  </div>
                )}
                {profileData.personalInfo?.ic_no && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">IC Number</span>
                    <span className="text-sm font-medium">{profileData.personalInfo.ic_no}</span>
                  </div>
                )}
                {profileData.profile?.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm">{profileData.profile.phone}</span>
                  </div>
                )}
                {profileData.user?.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm truncate">{profileData.user.email}</span>
                  </div>
                )}
                {profileData.profile?.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <span className="text-sm flex-1 leading-relaxed">{profileData.profile.address}</span>
                  </div>
                )}
                {profileData.profile?.marital_status && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Marital Status</span>
                    <span className="text-sm font-medium capitalize">{profileData.profile.marital_status}</span>
                  </div>
                )}
                {profileData.profile?.income_classification && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Income</span>
                    <span className="text-sm font-medium">{profileData.profile.income_classification}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Education */}
            {(profileData.highSchool || profileData.education?.length > 0) && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                    <GraduationCap className="h-4 w-4" />
                    Education
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  {/* High School */}
                  {profileData.highSchool && (
                    <div className="space-y-1">
                      <h4 className="text-xs font-semibold text-muted-foreground">High School</h4>
                      <div className="text-sm space-y-0.5">
                        <p className="font-medium">{profileData.highSchool.school_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {profileData.highSchool.type} • {profileData.highSchool.state}
                        </p>
                        {profileData.highSchool.spm_year && (
                          <p className="text-xs text-muted-foreground">SPM {profileData.highSchool.spm_year}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* University */}
                  {profileData.education?.map((edu, index) => (
                    <div key={index} className="space-y-1">
                      {index === 0 && <Separator className="my-2" />}
                      <h4 className="text-xs font-semibold text-muted-foreground">
                        {edu.degree === 'High School' ? 'High School' : 'University'}
                      </h4>
                      <div className="text-sm space-y-0.5">
                        <p className="font-medium">{edu.university}</p>
                        <p className="text-xs text-muted-foreground">
                          {edu.degree} in {edu.field_of_study}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {edu.start_year} - {edu.is_current ? 'Present' : edu.end_year}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Family */}
            {profileData.family?.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                    <Users className="h-4 w-4" />
                    Family
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 pt-0">
                  {profileData.family.map((member, index) => (
                    <div key={index} className="flex justify-between items-start py-2 border-b last:border-0">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{member.full_name || member.FULL_NAME}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {member.relationship || member.RELATIONSHIP}
                        </p>
                      </div>
                      {(member.occupation || member.OCCUPATION) && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0 ml-2">
                          <Building2 className="h-3 w-3" />
                          <span className="truncate max-w-[100px]">{member.occupation || member.OCCUPATION}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Certifications */}
            {profileData.certifications?.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                    <Award className="h-4 w-4" />
                    Certifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 pt-0">
                  {profileData.certifications.map((cert, index) => (
                    <div key={index} className="space-y-1 py-2 border-b last:border-0">
                      <p className="font-medium text-sm leading-tight">{cert.NAME}</p>
                      <p className="text-xs text-muted-foreground">
                        {cert.ISSUING_INSTITUTION} • {cert.YEAR_OBTAINED}
                      </p>
                      <Badge variant="outline" className="text-[10px] h-5">
                        {cert.TYPE}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
