'use client';

import { useState, useMemo } from 'react';
import {
    useHQTree,
    useHQAssignments,
    useAssignUserToHQ,
    useRemoveUserFromHQ
} from '@/app/api/hq-tree-api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Search, UserPlus, UserMinus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

export default function HQAssignments({ hqId }) {
    const { data: treeData, isLoading: isLoadingTree } = useHQTree();
    const { data: assignments, isLoading: isLoadingAssignments } = useHQAssignments(hqId);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [activeTab, setActiveTab] = useState("available");

    const assignUserMutation = useAssignUserToHQ();
    const removeUserMutation = useRemoveUserFromHQ();

    // Calculate which downlines are not yet assigned to this HQ
    const availableDownlines = useMemo(() => {
        if (!treeData?.downlines || !assignments) return [];

        // Create a set of assigned usernames for quick lookup
        const assignedUsernames = new Set(assignments.map(a => a.username));

        // Filter downlines that are not in the assigned set
        return treeData.downlines.filter(user => !assignedUsernames.has(user.username));
    }, [treeData, assignments]);

    // Filter both lists by search query
    const filteredAvailable = useMemo(() => {
        if (!availableDownlines) return [];
        if (!searchQuery.trim()) return availableDownlines;

        const query = searchQuery.toLowerCase();
        return availableDownlines.filter(user =>
            user.name.toLowerCase().includes(query) ||
            user.username.toLowerCase().includes(query) ||
            (user.email && user.email.toLowerCase().includes(query))
        );
    }, [availableDownlines, searchQuery]);

    const filteredAssigned = useMemo(() => {
        if (!assignments) return [];
        if (!searchQuery.trim()) return assignments;

        const query = searchQuery.toLowerCase();
        return assignments.filter(user =>
            user.name.toLowerCase().includes(query) ||
            user.username.toLowerCase().includes(query) ||
            (user.email && user.email.toLowerCase().includes(query))
        );
    }, [assignments, searchQuery]);

    const handleUserSelect = (username, isChecked) => {
        if (isChecked) {
            setSelectedUsers(prev => [...prev, username]);
        } else {
            setSelectedUsers(prev => prev.filter(u => u !== username));
        }
    };

    const handleAssignSelected = () => {
        if (selectedUsers.length === 0) return;

        // Create a promise for each user to assign
        const promises = selectedUsers.map(username =>
            assignUserMutation.mutateAsync({ hqId, userUsername: username })
        );

        // Handle all promises together
        Promise.all(promises).finally(() => {
            setSelectedUsers([]);
        });
    };

    const handleRemoveUser = (username) => {
        removeUserMutation.mutate({ hqId, userUsername: username });
    };

    if (isLoadingTree || isLoadingAssignments) {
        return (
            <div className="py-2 h-full">
                <div className="flex justify-between mb-4">
                    <Skeleton className="h-10 w-36" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="border rounded-md p-4 h-[80%]">
                    <Skeleton className="h-6 w-40 mb-4" />
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="flex items-center gap-2 mb-2">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <Skeleton className="h-6 flex-1" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="py-2 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8"
                    />
                </div>

                {activeTab === "available" && (
                    <Button
                        onClick={handleAssignSelected}
                        disabled={selectedUsers.length === 0 || assignUserMutation.isPending}
                        className="flex items-center gap-1 whitespace-nowrap"
                    >
                        {assignUserMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <UserPlus className="h-4 w-4" />
                        )}
                        {selectedUsers.length > 0
                            ? `Assign (${selectedUsers.length})`
                            : "Assign"}
                    </Button>
                )}
            </div>

            <Tabs
                defaultValue="available"
                className="flex-1 flex flex-col"
                value={activeTab}
                onValueChange={setActiveTab}
            >
                <TabsList className="grid grid-cols-2 mb-4">
                    <TabsTrigger value="available" className="flex gap-2 items-center">
                        Available
                        <Badge variant="secondary" className="ml-1">
                            {filteredAvailable.length}
                        </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="assigned" className="flex gap-2 items-center">
                        Assigned
                        <Badge variant="secondary" className="ml-1">
                            {filteredAssigned.length}
                        </Badge>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="available" className="flex-1 data-[state=active]:flex flex-col">
                    <div className="border rounded-md p-3 flex-1 flex flex-col">
                        <ScrollArea className="flex-1 h-[400px] sm:max-h-[500px]">
                            {filteredAvailable.length > 0 ? (
                                <div className="space-y-2 pr-2">
                                    {filteredAvailable.map(user => (
                                        <div
                                            key={user.username}
                                            className="flex items-center gap-2 p-2 hover:bg-secondary/40 rounded-md"
                                        >
                                            <Checkbox
                                                id={`user-${user.username}`}
                                                checked={selectedUsers.includes(user.username)}
                                                onCheckedChange={(checked) => handleUserSelect(user.username, checked)}
                                            />
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={user.image} alt={user.name} />
                                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate">{user.name}</p>
                                                <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-full py-8">
                                    <p className="text-muted-foreground">No available users found</p>
                                </div>
                            )}
                        </ScrollArea>
                    </div>
                </TabsContent>

                <TabsContent value="assigned" className="flex-1 data-[state=active]:flex flex-col">
                    <div className="border rounded-md p-3 flex-1 flex flex-col">
                        <ScrollArea className="flex-1 h-[400px] sm:max-h-[500px]">
                            {filteredAssigned.length > 0 ? (
                                <div className="space-y-2 pr-2">
                                    {filteredAssigned.map(user => (
                                        <div
                                            key={user.username}
                                            className="flex items-center gap-2 p-2 bg-secondary/20 rounded-md"
                                        >
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={user.image} alt={user.name} />
                                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate">{user.name}</p>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    Assigned on {format(new Date(user.assigned_at), 'PPP')}
                                                </p>
                                            </div>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => handleRemoveUser(user.username)}
                                                disabled={removeUserMutation.isPending}
                                                title="Remove user from HQ"
                                            >
                                                {removeUserMutation.isPending &&
                                                    removeUserMutation.variables?.userUsername === user.username ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <UserMinus className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-full py-8">
                                    <p className="text-muted-foreground">No users assigned to this HQ</p>
                                </div>
                            )}
                        </ScrollArea>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
} 