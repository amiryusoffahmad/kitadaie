'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { PlusCircle, Edit, Trash2, Plus, Calendar } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Client-side API functions to interact with server actions
const API_ENDPOINT = '/api/admin/tprog';

// Helper function to format dates
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString();
}

async function fetchClasses() {
    try {
        const response = await fetch(`${API_ENDPOINT}/classes`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch classes');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching classes:', error);
        throw error;
    }
}

async function createClass(classData) {
    try {
        const response = await fetch(`${API_ENDPOINT}/classes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(classData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create class');
        }

        return await response.json();
    } catch (error) {
        console.error('Error creating class:', error);
        throw error;
    }
}

async function fetchAssignments(classId) {
    try {
        const response = await fetch(`${API_ENDPOINT}/classes/${classId}/assignments`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch assignments');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching assignments:', error);
        throw error;
    }
}

async function createAssignment(classId, assignmentData) {
    try {
        const response = await fetch(`${API_ENDPOINT}/classes/${classId}/assignments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(assignmentData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create assignment');
        }

        return await response.json();
    } catch (error) {
        console.error('Error creating assignment:', error);
        throw error;
    }
}

// Add delete functions
async function deleteClass(classId) {
    try {
        const response = await fetch(`${API_ENDPOINT}/classes/${classId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to delete class');
        }

        return true;
    } catch (error) {
        console.error('Error deleting class:', error);
        throw error;
    }
}

async function deleteAssignment(classId, assignmentId) {
    try {
        const response = await fetch(`${API_ENDPOINT}/classes/${classId}/assignments/${assignmentId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to delete assignment');
        }

        return true;
    } catch (error) {
        console.error('Error deleting assignment:', error);
        throw error;
    }
}

// Add update functions after the delete functions
async function updateClass(classId, classData) {
    try {
        const response = await fetch(`${API_ENDPOINT}/classes/${classId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(classData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update class');
        }

        return await response.json();
    } catch (error) {
        console.error('Error updating class:', error);
        throw error;
    }
}

async function updateAssignment(classId, assignmentId, assignmentData) {
    try {
        const response = await fetch(`${API_ENDPOINT}/classes/${classId}/assignments/${assignmentId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(assignmentData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update assignment');
        }

        return await response.json();
    } catch (error) {
        console.error('Error updating assignment:', error);
        throw error;
    }
}

export default function DataList() {
    const router = useRouter();
    const [classes, setClasses] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);
    const [isCreateClassDialogOpen, setIsCreateClassDialogOpen] = useState(false);
    const [isCreateAssignmentDialogOpen, setIsCreateAssignmentDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Edit state variables
    const [isEditClassDialogOpen, setIsEditClassDialogOpen] = useState(false);
    const [isEditAssignmentDialogOpen, setIsEditAssignmentDialogOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState(null);
    const [editClassForm, setEditClassForm] = useState({
        name: '',
        class_code: '',
        description: '',
    });
    const [editAssignmentForm, setEditAssignmentForm] = useState({
        title: '',
        instructions: '',
        due_date: '',
    });

    // Confirmation dialogs
    const [isDeleteClassDialogOpen, setIsDeleteClassDialogOpen] = useState(false);
    const [isDeleteAssignmentDialogOpen, setIsDeleteAssignmentDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    // Form states
    const [newClass, setNewClass] = useState({
        name: '',
        class_code: '',
        description: '',
    });

    const [newAssignment, setNewAssignment] = useState({
        title: '',
        instructions: '',
        due_date: '',
    });

    // Fetch classes on component mount
    useEffect(() => {
        const loadClasses = async () => {
            setIsLoading(true);
            try {
                const data = await fetchClasses();
                setClasses(data);
            } catch (error) {
                toast({
                    title: "Error",
                    description: error.message || "Failed to load classes",
                    variant: "destructive"
                });
                setClasses([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadClasses();
    }, []); // Empty dependency array since toast import is not a hook

    // Fetch assignments when a class is selected
    useEffect(() => {
        if (!selectedClass) return;

        const loadAssignments = async () => {
            setIsLoading(true);
            try {
                const data = await fetchAssignments(selectedClass.id);
                setAssignments(data);
            } catch (error) {
                toast({
                    title: "Error",
                    description: error.message || "Failed to load assignments",
                    variant: "destructive"
                });
                setAssignments([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadAssignments();
    }, [selectedClass]); // Only depend on selectedClass

    const handleSelectClass = (classItem) => {
        setSelectedClass(classItem);
    };

    const handleCreateClass = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Validate required fields
            if (!newClass.name || !newClass.class_code) {
                throw new Error('Class name and code are required');
            }

            await createClass(newClass);
            toast({
                title: "Success",
                description: "Class created successfully",
            });

            // Refresh class list
            const updatedClasses = await fetchClasses();
            setClasses(updatedClasses);

            // Reset form and close dialog
            setNewClass({
                name: '',
                class_code: '',
                description: '',
            });
            setIsCreateClassDialogOpen(false);
        } catch (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to create class",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateAssignment = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Validate required fields
            if (!newAssignment.title || !newAssignment.due_date) {
                throw new Error('Assignment title and due date are required');
            }

            await createAssignment(selectedClass.id, newAssignment);
            toast({
                title: "Success",
                description: "Assignment created successfully",
            });

            // Refresh assignment list
            const updatedAssignments = await fetchAssignments(selectedClass.id);
            setAssignments(updatedAssignments);

            // Reset form and close dialog
            setNewAssignment({
                title: '',
                instructions: '',
                due_date: '',
            });
            setIsCreateAssignmentDialogOpen(false);
        } catch (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to create assignment",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Handle class deletion
    const handleDeleteClass = async () => {
        if (!itemToDelete) return;

        setIsLoading(true);
        try {
            await deleteClass(itemToDelete.id);

            // Remove class from list
            setClasses(classes.filter(c => c.id !== itemToDelete.id));

            // Reset selected class if it was deleted
            if (selectedClass && selectedClass.id === itemToDelete.id) {
                setSelectedClass(null);
            }

            toast({
                title: "Success",
                description: "Class deleted successfully",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to delete class",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
            setIsDeleteClassDialogOpen(false);
            setItemToDelete(null);
        }
    };

    // Handle assignment deletion
    const handleDeleteAssignment = async () => {
        if (!itemToDelete || !selectedClass) return;

        setIsLoading(true);
        try {
            await deleteAssignment(selectedClass.id, itemToDelete.id);

            // Remove assignment from list
            setAssignments(assignments.filter(a => a.id !== itemToDelete.id));

            toast({
                title: "Success",
                description: "Assignment deleted successfully",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to delete assignment",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
            setIsDeleteAssignmentDialogOpen(false);
            setItemToDelete(null);
        }
    };

    // Handle edit class form initialization
    const handleEditClassClick = (e, classItem) => {
        e.stopPropagation();
        setItemToEdit(classItem);
        setEditClassForm({
            name: classItem.name,
            class_code: classItem.class_code,
            description: classItem.description || '',
        });
        setIsEditClassDialogOpen(true);
    };

    // Handle edit assignment form initialization
    const handleEditAssignmentClick = (assignment) => {
        setItemToEdit(assignment);

        // Format the date for the datetime-local input
        const dueDate = new Date(assignment.due_date);

        // Format to YYYY-MM-DDThh:mm
        const formattedDate = dueDate.toISOString().slice(0, 16);

        setEditAssignmentForm({
            title: assignment.title,
            instructions: assignment.instructions || '',
            due_date: formattedDate,
        });
        setIsEditAssignmentDialogOpen(true);
    };

    // Handle class update
    const handleUpdateClass = async (e) => {
        e.preventDefault();
        if (!itemToEdit) return;

        setIsLoading(true);
        try {
            // Validate required fields
            if (!editClassForm.name) {
                throw new Error('Class name is required');
            }

            // We don't validate the class code change here since the API will handle that

            const updatedClass = await updateClass(itemToEdit.id, editClassForm);

            // Update the class in the local state
            setClasses(classes.map(c =>
                c.id === itemToEdit.id ? updatedClass : c
            ));

            // Update selected class if it was the one edited
            if (selectedClass && selectedClass.id === itemToEdit.id) {
                setSelectedClass(updatedClass);
            }

            toast({
                title: "Success",
                description: "Class updated successfully",
            });

            // Close dialog and reset form
            setIsEditClassDialogOpen(false);
            setItemToEdit(null);
        } catch (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to update class",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Handle assignment update
    const handleUpdateAssignment = async (e) => {
        e.preventDefault();
        if (!itemToEdit || !selectedClass) return;

        setIsLoading(true);
        try {
            // Validate required fields
            if (!editAssignmentForm.title || !editAssignmentForm.due_date) {
                throw new Error('Assignment title and due date are required');
            }

            const updatedAssignment = await updateAssignment(
                selectedClass.id,
                itemToEdit.id,
                editAssignmentForm
            );

            // Update the assignment in the local state
            setAssignments(assignments.map(a =>
                a.id === itemToEdit.id ? updatedAssignment : a
            ));

            toast({
                title: "Success",
                description: "Assignment updated successfully",
            });

            // Close dialog and reset form
            setIsEditAssignmentDialogOpen(false);
            setItemToEdit(null);
        } catch (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to update assignment",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-tight">Class Management</h1>
                <Dialog open={isCreateClassDialogOpen} onOpenChange={setIsCreateClassDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Create Class
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Class</DialogTitle>
                            <DialogDescription>
                                Fill in the class details. Click save when you're done.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateClass}>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="class-name" className="text-right">
                                        Class Name
                                    </Label>
                                    <Input
                                        id="class-name"
                                        value={newClass.name}
                                        onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                                        className="col-span-3"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="class-code" className="text-right">
                                        Class Code
                                    </Label>
                                    <Input
                                        id="class-code"
                                        value={newClass.class_code}
                                        onChange={(e) => setNewClass({ ...newClass, class_code: e.target.value })}
                                        className="col-span-3"
                                        maxLength={6}
                                        required
                                        placeholder="6 character code (e.g. CS101)"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="description" className="text-right">
                                        Description
                                    </Label>
                                    <Textarea
                                        id="description"
                                        value={newClass.description}
                                        onChange={(e) => setNewClass({ ...newClass, description: e.target.value })}
                                        className="col-span-3"
                                        rows={3}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? 'Creating...' : 'Create Class'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Delete Class Confirmation Dialog */}
            <Dialog open={isDeleteClassDialogOpen} onOpenChange={setIsDeleteClassDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Class</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this class? This action cannot be undone.
                            All assignments and enrollments for this class will also be deleted.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteClassDialogOpen(false)} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteClass} disabled={isLoading}>
                            {isLoading ? 'Deleting...' : 'Delete Class'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Assignment Confirmation Dialog */}
            <Dialog open={isDeleteAssignmentDialogOpen} onOpenChange={setIsDeleteAssignmentDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Assignment</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this assignment? This action cannot be undone.
                            All student submissions for this assignment will also be deleted.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteAssignmentDialogOpen(false)} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteAssignment} disabled={isLoading}>
                            {isLoading ? 'Deleting...' : 'Delete Assignment'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Class Dialog */}
            <Dialog open={isEditClassDialogOpen} onOpenChange={setIsEditClassDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Class</DialogTitle>
                        <DialogDescription>
                            Update the class details. Click save when you're done.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdateClass}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-class-name" className="text-right">
                                    Class Name
                                </Label>
                                <Input
                                    id="edit-class-name"
                                    value={editClassForm.name}
                                    onChange={(e) => setEditClassForm({ ...editClassForm, name: e.target.value })}
                                    className="col-span-3"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-class-code" className="text-right">
                                    Class Code
                                </Label>
                                <Input
                                    id="edit-class-code"
                                    value={editClassForm.class_code}
                                    onChange={(e) => setEditClassForm({ ...editClassForm, class_code: e.target.value })}
                                    className="col-span-3"
                                    maxLength={6}
                                    disabled // Prevent changing class code as it might be referenced elsewhere
                                    placeholder="6 character code (e.g. CS101)"
                                />
                                <div className="col-span-4 text-xs text-muted-foreground ml-auto w-3/4">
                                    Note: Class code cannot be changed once created.
                                </div>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-description" className="text-right">
                                    Description
                                </Label>
                                <Textarea
                                    id="edit-description"
                                    value={editClassForm.description}
                                    onChange={(e) => setEditClassForm({ ...editClassForm, description: e.target.value })}
                                    className="col-span-3"
                                    rows={3}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Assignment Dialog */}
            <Dialog open={isEditAssignmentDialogOpen} onOpenChange={setIsEditAssignmentDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Assignment</DialogTitle>
                        <DialogDescription>
                            Update the assignment details. Click save when you're done.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdateAssignment}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-title" className="text-right">
                                    Title
                                </Label>
                                <Input
                                    id="edit-title"
                                    value={editAssignmentForm.title}
                                    onChange={(e) => setEditAssignmentForm({ ...editAssignmentForm, title: e.target.value })}
                                    className="col-span-3"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-instructions" className="text-right">
                                    Instructions
                                </Label>
                                <Textarea
                                    id="edit-instructions"
                                    value={editAssignmentForm.instructions}
                                    onChange={(e) => setEditAssignmentForm({ ...editAssignmentForm, instructions: e.target.value })}
                                    className="col-span-3"
                                    rows={3}
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-due-date" className="text-right">
                                    Due Date
                                </Label>
                                <Input
                                    id="edit-due-date"
                                    type="datetime-local"
                                    value={editAssignmentForm.due_date}
                                    onChange={(e) => setEditAssignmentForm({ ...editAssignmentForm, due_date: e.target.value })}
                                    className="col-span-3"
                                    required
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Tabs defaultValue="classes">
                <TabsList>
                    <TabsTrigger value="classes">Classes</TabsTrigger>
                    {selectedClass && <TabsTrigger value="assignments">Assignments</TabsTrigger>}
                </TabsList>

                <TabsContent value="classes" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Classes</CardTitle>
                            <CardDescription>Manage your classes here. Click on a class to view assignments.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableCaption>List of available classes</TableCaption>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Code</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead className="w-[150px]">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {classes.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center h-32">
                                                {isLoading ? 'Loading classes...' : 'No classes found. Create your first class!'}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        classes.map((classItem) => (
                                            <TableRow
                                                key={classItem.id}
                                                className={selectedClass?.id === classItem.id ? 'bg-muted/50' : 'cursor-pointer'}
                                                onClick={() => handleSelectClass(classItem)}
                                            >
                                                <TableCell className="font-medium">{classItem.name}</TableCell>
                                                <TableCell>{classItem.class_code}</TableCell>
                                                <TableCell>{classItem.description}</TableCell>
                                                <TableCell className="space-x-2">
                                                    <Button size="icon" variant="ghost" onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEditClassClick(e, classItem);
                                                    }}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setItemToDelete(classItem);
                                                            setIsDeleteClassDialogOpen(true);
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {selectedClass && (
                    <TabsContent value="assignments" className="space-y-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Assignments for {selectedClass.name}</CardTitle>
                                    <CardDescription>Class Code: {selectedClass.class_code}</CardDescription>
                                </div>
                                <Dialog open={isCreateAssignmentDialogOpen} onOpenChange={setIsCreateAssignmentDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Assignment
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Create New Assignment</DialogTitle>
                                            <DialogDescription>
                                                Create a new assignment for {selectedClass.name}.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <form onSubmit={handleCreateAssignment}>
                                            <div className="grid gap-4 py-4">
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <Label htmlFor="title" className="text-right">
                                                        Title
                                                    </Label>
                                                    <Input
                                                        id="title"
                                                        value={newAssignment.title}
                                                        onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                                                        className="col-span-3"
                                                        required
                                                    />
                                                </div>
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <Label htmlFor="instructions" className="text-right">
                                                        Instructions
                                                    </Label>
                                                    <Textarea
                                                        id="instructions"
                                                        value={newAssignment.instructions}
                                                        onChange={(e) => setNewAssignment({ ...newAssignment, instructions: e.target.value })}
                                                        className="col-span-3"
                                                        rows={3}
                                                    />
                                                </div>
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <Label htmlFor="due-date" className="text-right">
                                                        Due Date
                                                    </Label>
                                                    <Input
                                                        id="due-date"
                                                        type="datetime-local"
                                                        value={newAssignment.due_date}
                                                        onChange={(e) => setNewAssignment({ ...newAssignment, due_date: e.target.value })}
                                                        className="col-span-3"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button type="submit" disabled={isLoading}>
                                                    {isLoading ? 'Creating...' : 'Create Assignment'}
                                                </Button>
                                            </DialogFooter>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableCaption>List of assignments for {selectedClass.name}</TableCaption>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Title</TableHead>
                                            <TableHead>Instructions</TableHead>
                                            <TableHead>Due Date</TableHead>
                                            <TableHead className="w-[150px]">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {assignments.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center h-32">
                                                    {isLoading ? 'Loading assignments...' : 'No assignments found. Create your first assignment!'}
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            assignments.map((assignment) => (
                                                <TableRow key={assignment.id}>
                                                    <TableCell className="font-medium">{assignment.title}</TableCell>
                                                    <TableCell>{assignment.instructions?.substring(0, 50)}...</TableCell>
                                                    <TableCell>{formatDate(assignment.due_date)}</TableCell>
                                                    <TableCell className="space-x-2">
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleEditAssignmentClick(assignment);
                                                            }}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setItemToDelete(assignment);
                                                                setIsDeleteAssignmentDialogOpen(true);
                                                            }}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                )}
            </Tabs>
        </div>
    )
}