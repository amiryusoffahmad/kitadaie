'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { useHQTree, useUserProfile } from '@/app/api/hq-tree-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ChevronDown, ChevronRight, Network, User, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import UserProfileView from './user-profile-view';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function HQTreeView() {
    const { data: session } = useSession();
    const { data: treeData, isLoading, error, refetch } = useHQTree();
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [open, setOpen] = useState(false);

    // Add debugging info
    useEffect(() => {
        console.log("[HQ TREE CLIENT] Session data:", session);
        console.log("[HQ TREE CLIENT] Current user ID:", session?.user?.id);
        console.log("[HQ TREE CLIENT] Current user username:", session?.user?.username);
    }, [session]);

    useEffect(() => {
        console.log("[HQ TREE CLIENT] Tree data received:", treeData);
        console.log("[HQ TREE CLIENT] Downlines count:", treeData?.downlines?.length || 0);
    }, [treeData]);

    const handleUserClick = (userId) => {
        setSelectedUserId(userId);
        setOpen(true);
    };

    if (isLoading) {
        console.log("[HQ TREE CLIENT] Loading tree data...");
        return (
            <div className="space-y-4">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-40" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-6 w-full" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error) {
        console.error("[HQ TREE CLIENT] Error loading data:", error);
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                    {error.message || "Failed to load HQ Tree data"}
                    <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => refetch()}
                    >
                        Try Again
                    </Button>
                </AlertDescription>
            </Alert>
        );
    }

    if (!treeData || !treeData.downlines || treeData.downlines.length === 0) {
        console.log("[HQ TREE CLIENT] No downlines found in tree data");
        console.log("[HQ TREE CLIENT] Tree data object:", treeData);

        return (
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No Downlines Found</AlertTitle>
                <AlertDescription>
                    <p>You currently don't have any downlines in your HQ Tree.</p>

                    <div className="mt-4 p-3 bg-secondary/50 rounded-md">
                        <h3 className="text-sm font-medium mb-2 flex items-center gap-1">
                            <Info className="h-4 w-4" /> Troubleshooting Information
                        </h3>
                        <div className="text-xs space-y-1">
                            <p className="flex justify-between">
                                <span>Your identifier:</span>
                                <code className="bg-secondary px-1 rounded">{treeData?.username || 'Not found'}</code>
                            </p>
                            <p>For others to appear in your tree, they need to set this value as their "Murobbi ID" in their profile settings.</p>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="mt-2 text-xs"
                                            onClick={() => refetch()}
                                        >
                                            Refresh Data
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Retry loading your downlines</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>
                </AlertDescription>
            </Alert>
        );
    }

    // Group downlines by first letter of name
    const groupedDownlines = treeData.downlines.reduce((groups, user) => {
        const firstLetter = user.name.charAt(0).toUpperCase();
        if (!groups[firstLetter]) {
            groups[firstLetter] = [];
        }
        groups[firstLetter].push(user);
        return groups;
    }, {});

    // Sort groups alphabetically
    const sortedGroups = Object.keys(groupedDownlines).sort();

    return (
        <>
            <div className="space-y-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Network className="h-5 w-5" />
                            HQ-01
                        </CardTitle>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => refetch()}
                                    >
                                        <Info className="h-4 w-4" />
                                        <span className="sr-only">Your identifier: {treeData.username}</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Your identifier: <strong>{treeData.username}</strong></p>
                                    <p className="text-xs">This is what others should use as Murobbi ID</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {sortedGroups.map(group => (
                                <div key={group} className="space-y-1">
                                    {groupedDownlines[group].map(user => (
                                        <div
                                            key={user.id}
                                            className="pl-6 py-2 flex items-center gap-2 hover:bg-muted rounded-md cursor-pointer transition-colors"
                                            onClick={() => handleUserClick(user.id)}
                                        >
                                            <div className="border-l-2 h-6 absolute left-6 top-10" />
                                            <div className="w-6 border-t-2 absolute left-6" />
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={user.image} alt={user.name} />
                                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <span>{user.name}</span>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>User Profile</DialogTitle>
                    </DialogHeader>
                    {selectedUserId && <UserProfileView userId={selectedUserId} />}
                </DialogContent>
            </Dialog>
        </>
    );
} 