'use client';

import { useUserProfile } from '@/app/api/hq-tree-api';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertCircle, Mail, Phone, Home, User, Building, Users, Heart, CalendarClock } from 'lucide-react';

export default function UserProfileView({ userId }) {
    const { data: profile, isLoading, error } = useUserProfile(userId);

    if (isLoading) {
        return (
            <div className="space-y-4 p-4">
                <div className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-4 w-[150px]" />
                    </div>
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <Alert variant="destructive" className="my-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    {error?.message || "Failed to load user profile"}
                </AlertDescription>
            </Alert>
        );
    }

    // Get initials for avatar fallback
    const getInitials = (name) => {
        if (!name) return "U";
        return name
            .split(" ")
            .map(part => part[0])
            .join("")
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Avatar className="h-14 w-14">
                    <AvatarImage src={profile.image} alt={profile.name} />
                    <AvatarFallback>{getInitials(profile.name)}</AvatarFallback>
                </Avatar>
                <div>
                    <h3 className="text-lg font-semibold">{profile.name}</h3>
                    <p className="text-sm text-muted-foreground">@{profile.username}</p>
                </div>
            </div>

            {/* Personal Details */}
            <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Personal Details</h4>

                {profile.email && (
                    <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{profile.email}</span>
                    </div>
                )}

                {profile.phone && (
                    <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{profile.phone}</span>
                    </div>
                )}

                {profile.address && (
                    <div className="flex items-center gap-2">
                        <Home className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{profile.address}</span>
                    </div>
                )}

                {profile.gender && (
                    <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{profile.gender}</span>
                    </div>
                )}
            </div>

            {/* Other Details */}
            <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Other Information</h4>

                {profile.branch && (
                    <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Branch: {profile.branch}</span>
                    </div>
                )}

                {profile.marital_status && (
                    <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Marital Status: {profile.marital_status}</span>
                    </div>
                )}

                {profile.family_status && (
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Family Status: {profile.family_status}</span>
                    </div>
                )}

                {profile.murobbi_id && (
                    <div className="flex items-center gap-2">
                        <CalendarClock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Murobbi ID: {profile.murobbi_id}</span>
                    </div>
                )}
            </div>
        </div>
    );
} 