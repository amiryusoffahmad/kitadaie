'use client';

import { useState, useEffect } from 'react';
import { useHQTree, useUserProfile, useUserHQs, useCreateHQ, useUpdateHQ, useDeleteHQ, useHQAssignments } from '@/app/api/hq-tree-api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Pencil,
    Trash,
    Users,
    Plus,
    Save,
    X,
    Loader2,
    Network,
    Info,
    AlertCircle,
    ChevronDown,
    ChevronRight,
    User
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import HQAssignments from './hq-assignments';
import UserProfileView from './user-profile-view';

export function HQManagement() {
    const { data: treeData, isLoading: isLoadingTree, error: treeError, refetch: refetchTree } = useHQTree();
    const { data: hqs, isLoading: isLoadingHQs, error: hqsError } = useUserHQs();

    const [newHQName, setNewHQName] = useState('');
    const [editHQId, setEditHQId] = useState(null);
    const [editName, setEditName] = useState('');
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [deleteHQId, setDeleteHQId] = useState(null);
    const [selectedHQId, setSelectedHQId] = useState(null);
    const [showAssignments, setShowAssignments] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [showUserProfile, setShowUserProfile] = useState(false);

    const createHQMutation = useCreateHQ();
    const updateHQMutation = useUpdateHQ();
    const deleteHQMutation = useDeleteHQ();

    // Add debugging info for tree data
    useEffect(() => {
        if (treeData) {
            console.log("[HQ TREE CLIENT] Tree data received:", treeData);
            console.log("[HQ TREE CLIENT] Downlines count:", treeData?.downlines?.length || 0);
        }
    }, [treeData]);

    const handleCreateHQ = () => {
        if (!newHQName.trim()) return;

        createHQMutation.mutate(newHQName, {
            onSuccess: () => {
                setNewHQName('');
                setShowCreateDialog(false);
            }
        });
    };

    const startEditHQ = (hq) => {
        setEditHQId(hq.id);
        setEditName(hq.name);
    };

    const cancelEditHQ = () => {
        setEditHQId(null);
        setEditName('');
    };

    const handleUpdateHQ = (id) => {
        if (!editName.trim()) return;

        updateHQMutation.mutate(
            { id, name: editName },
            {
                onSuccess: () => {
                    setEditHQId(null);
                    setEditName('');
                }
            }
        );
    };

    const openDeleteDialog = (id) => {
        setDeleteHQId(id);
    };

    const handleDeleteHQ = () => {
        if (!deleteHQId) return;

        deleteHQMutation.mutate(deleteHQId, {
            onSuccess: () => {
                setDeleteHQId(null);
                if (selectedHQId === deleteHQId) {
                    setSelectedHQId(null);
                    setShowAssignments(false);
                }
            }
        });
    };

    const handleShowAssignments = (hqId) => {
        setSelectedHQId(hqId);
        setShowAssignments(true);
    };

    const handleUserClick = (userId) => {
        setSelectedUserId(userId);
        setShowUserProfile(true);
    };

    // Function to render the downlines view
    const renderDownlinesView = () => {
        if (isLoadingTree) {
            return (
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
            );
        }

        if (treeError) {
            return (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        {treeError.message || "Failed to load HQ Tree data"}
                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => refetchTree()}
                        >
                            Try Again
                        </Button>
                    </AlertDescription>
                </Alert>
            );
        }

        if (!treeData || !treeData.downlines || treeData.downlines.length === 0) {
            return (
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>No MTs Found</AlertTitle>
                    <AlertDescription>
                        <p>You currently don't have any MTs in your HQ Tree.</p>

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
                                                onClick={() => refetchTree()}
                                            >
                                                Refresh Data
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Retry loading your MTs</p>
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
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Network className="h-5 w-5" />
                        Your MTs
                    </CardTitle>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => refetchTree()}
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
        );
    };

    // Function to render the HQ management view
    const renderHQManagementView = () => {
        if (isLoadingHQs) {
            return (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <Skeleton className="h-8 w-40" />
                            <Skeleton className="h-10 w-28" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center gap-2 pl-6 py-2">
                                    <Skeleton className="h-8 w-8 rounded-full" />
                                    <Skeleton className="h-6 w-40" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            );
        }

        if (hqsError) {
            return (
                <Card>
                    <CardHeader>
                        <CardTitle>HQ Management</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="p-4 bg-destructive/10 text-destructive rounded-md">
                            {hqsError.message || "Failed to load HQs"}
                        </div>
                    </CardContent>
                </Card>
            );
        }

        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Halaqah
                        </span>
                        <Button
                            onClick={() => setShowCreateDialog(true)}
                            className="flex items-center gap-1"
                        >
                            <Plus className="h-4 w-4" />
                            Create HQ
                        </Button>
                    </CardTitle>
                    <CardDescription>
                        Create and manage HQ to organize your mutarabbi
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {hqs && hqs.length > 0 ? (
                        <div className="space-y-1">
                            {hqs.map((hq) => (
                                <HQTreeItem
                                    key={hq.id}
                                    hq={hq}
                                    onEdit={startEditHQ}
                                    onDelete={openDeleteDialog}
                                    onShowAssignments={handleShowAssignments}
                                    isEditing={editHQId === hq.id}
                                    editName={editName}
                                    setEditName={setEditName}
                                    handleUpdateHQ={handleUpdateHQ}
                                    cancelEditHQ={cancelEditHQ}
                                    updateMutationPending={updateHQMutation.isPending}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center p-8 text-muted-foreground border border-dashed rounded-md">
                            <p>No HQs created yet. Click "Create HQ" to get started.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    };

    // Component for a single HQ in the tree
    const HQTreeItem = ({
        hq,
        onEdit,
        onDelete,
        onShowAssignments,
        isEditing,
        editName,
        setEditName,
        handleUpdateHQ,
        cancelEditHQ,
        updateMutationPending
    }) => {
        const [expanded, setExpanded] = useState(false);
        const { data: assignments, isLoading } = useHQAssignments(hq.id);

        const toggleExpanded = (e) => {
            e.stopPropagation();
            setExpanded(!expanded);
        };

        return (
            <div className="border rounded-md overflow-hidden mb-4">
                <div className="p-3 flex items-center justify-between bg-muted/30">
                    {isEditing ? (
                        <div className="flex items-center gap-2 flex-1">
                            <Input
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="max-w-xs"
                            />
                            <div className="flex items-center gap-1">
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => handleUpdateHQ(hq.id)}
                                    disabled={updateMutationPending}
                                >
                                    {updateMutationPending ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Save className="h-4 w-4" />
                                    )}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={cancelEditHQ}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 flex-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={toggleExpanded}
                            >
                                {expanded ?
                                    <ChevronDown className="h-4 w-4" /> :
                                    <ChevronRight className="h-4 w-4" />
                                }
                            </Button>
                            <div>
                                <p className="font-medium">{hq.name}</p>
                                <p className="text-xs text-muted-foreground">
                                    Created: {format(new Date(hq.created_at), 'PPP')}
                                </p>
                            </div>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <Button
                            size="icon"
                            variant="outline"
                            onClick={() => onShowAssignments(hq.id)}
                            title="Manage Assignments"
                        >
                            <Users className="h-4 w-4" />
                        </Button>
                        {!isEditing && (
                            <>
                                <Button
                                    size="icon"
                                    variant="outline"
                                    onClick={() => onEdit(hq)}
                                    title="Edit HQ"
                                >
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                    size="icon"
                                    variant="destructive"
                                    onClick={() => onDelete(hq.id)}
                                    title="Delete HQ"
                                >
                                    <Trash className="h-4 w-4" />
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {expanded && (
                    <div className="p-2 pl-6 bg-background">
                        {isLoading ? (
                            <div className="py-2">
                                <Skeleton className="h-4 w-24 mb-3" />
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex items-center gap-2 py-1">
                                        <Skeleton className="h-6 w-6 rounded-full" />
                                        <Skeleton className="h-4 w-32" />
                                    </div>
                                ))}
                            </div>
                        ) : assignments && assignments.length > 0 ? (
                            <div className="py-2">
                                <p className="text-sm font-medium text-muted-foreground mb-2">Assigned MTs ({assignments.length})</p>
                                <div className="space-y-1">
                                    {assignments.map(user => (
                                        <div
                                            key={user.id}
                                            className="pl-6 py-2 flex items-center gap-2 hover:bg-muted rounded-md cursor-pointer transition-colors"
                                            onClick={() => handleUserClick(user.id)}
                                        >
                                            <div className="border-l-2 h-6 absolute left-6 top-10" />
                                            <div className="w-6 border-t-2 absolute left-6" />
                                            <Avatar className="h-7 w-7">
                                                <AvatarImage src={user.image} alt={user.name} />
                                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm">{user.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="py-4 text-center text-sm text-muted-foreground">
                                <p>No users assigned to this HQ yet</p>
                                <Button
                                    variant="link"
                                    size="sm"
                                    onClick={() => onShowAssignments(hq.id)}
                                    className="mt-1"
                                >
                                    Assign Users
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <>
            <div className="space-y-6">
                {/* HQ Management - moved to top */}
                {renderHQManagementView()}

                {/* Downlines Tree View - moved to bottom */}
                <div className="mt-8">
                    {renderDownlinesView()}
                </div>
            </div>

            {/* Create HQ Dialog */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New HQ</DialogTitle>
                        <DialogDescription>
                            Enter a name for the new HQ.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Input
                            placeholder="HQ Name"
                            value={newHQName}
                            onChange={(e) => setNewHQName(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowCreateDialog(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreateHQ}
                            disabled={!newHQName.trim() || createHQMutation.isPending}
                        >
                            {createHQMutation.isPending ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Plus className="h-4 w-4 mr-2" />
                            )}
                            Create
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteHQId} onOpenChange={(open) => !open && setDeleteHQId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the HQ and remove all user assignments.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteHQ}
                            className="bg-destructive hover:bg-destructive/90"
                            disabled={deleteHQMutation.isPending}
                        >
                            {deleteHQMutation.isPending ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Trash className="h-4 w-4 mr-2" />
                            )}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Assignments Dialog */}
            <Dialog open={showAssignments} onOpenChange={setShowAssignments}>
                <DialogContent className="w-[95vw] max-w-[900px] h-[90vh] max-h-[700px] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>HQ Assignments</DialogTitle>
                        <DialogDescription>
                            Manage users assigned to this HQ.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-hidden">
                        {selectedHQId && <HQAssignments hqId={selectedHQId} />}
                    </div>
                </DialogContent>
            </Dialog>

            {/* User Profile Dialog */}
            <Dialog open={showUserProfile} onOpenChange={setShowUserProfile}>
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