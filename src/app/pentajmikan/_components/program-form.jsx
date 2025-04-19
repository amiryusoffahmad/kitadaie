'use client'

import { useState, useEffect } from 'react'
import { useCreatePentajmikan, useUpdatePentajmikan, searchUsers } from '@/app/api/pentajmikan-api'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from '@/components/ui/command'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { Check, ChevronsUpDown, Loader2, Upload, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'

export default function ProgramForm({ initialData, onSuccess, isEdit = false }) {
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(initialData?.image_url || null);
    const [participants, setParticipants] = useState(initialData?.participants || []);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [openCombobox, setOpenCombobox] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Use the appropriate mutation
    const createProgram = useCreatePentajmikan();
    const updateProgram = useUpdatePentajmikan();

    const { register, handleSubmit, formState: { errors, isSubmitting }, watch, setValue } = useForm({
        defaultValues: initialData || {
            name: '',
            description: '',
            total_participants: '',
            date: new Date().toISOString().split('T')[0],
            niche: '',
        }
    });

    // Add a useEffect to handle initializing from existing data
    useEffect(() => {
        console.log('Initializing program form with data:', {
            image_url: initialData?.image_url,
            image_id: initialData?.image_id,
            date: initialData?.date
        });

        if (initialData?.image_url) {
            // If we have an image_url in the initial data, use it directly
            console.log('Setting image preview from image_url:', initialData.image_url);
            setImagePreview(initialData.image_url);
        } else if (initialData?.image_id) {
            // Fallback to constructing the URL from image_id
            const imagePath = `/uploads/${initialData.image_id}`;
            console.log('Setting image preview from constructed path:', imagePath);
            setImagePreview(imagePath);
        }

        if (initialData?.participants) {
            // Initialize participants from initialData
            setParticipants(initialData.participants || []);
        }

        // Format date for datetime-local input if it exists
        if (initialData?.date) {
            try {
                // Create a date object from the initialData date
                const date = new Date(initialData.date);

                // Check if it's a valid date
                if (!isNaN(date.getTime())) {
                    // Format the date to the format required by datetime-local input: YYYY-MM-DDThh:mm
                    // This ensures the date is in local timezone and properly formatted
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    const hours = String(date.getHours()).padStart(2, '0');
                    const minutes = String(date.getMinutes()).padStart(2, '0');

                    const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}`;
                    console.log('Setting date input value to:', formattedDate);

                    // Set the value in the form
                    setValue('date', formattedDate);
                } else {
                    console.error('Invalid date received:', initialData.date);
                }
            } catch (error) {
                console.error('Error formatting date:', error);
            }
        }
    }, [initialData, setValue]);

    // Handle image selection
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Remove selected image
    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
    };

    // Handle participant search
    const handleSearch = async (query) => {
        setSearchQuery(query);

        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        try {
            setIsSearching(true);
            let results = [];

            try {
                results = await searchUsers(query);
            } catch (searchError) {
                console.error('Error calling searchUsers:', searchError);
                results = [];
            }

            // Ensure results is always an array
            if (!results || !Array.isArray(results)) {
                console.error('Search results is not an array:', results);
                results = [];
            }

            // Filter out already selected participants
            const filteredResults = results.filter(
                (user) => !participants.some((p) => p.id === user.id)
            );

            setSearchResults(filteredResults);
        } catch (error) {
            console.error('Error in search handling:', error);
            toast.error('Failed to search users');
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    // Add a participant
    const addParticipant = (user) => {
        setParticipants((prev) => [...prev, user]);
        setSearchResults([]);
        setSearchQuery('');
    };

    // Remove a participant
    const removeParticipant = (userId) => {
        setParticipants((prev) => prev.filter((p) => p.id !== userId));
    };

    // Upload image
    const uploadImage = async () => {
        if (!imageFile) {
            console.log('No image file to upload');
            return null;
        }

        try {
            setIsUploading(true);
            const formData = new FormData();

            // Log file info
            console.log('File details:', {
                name: imageFile.name,
                type: imageFile.type,
                size: imageFile.size
            });

            // Append file with a clear file name to help with debugging
            formData.append('file', imageFile, imageFile.name);
            formData.append('document_type', 'pentajmikan_image');
            formData.append('reference_id', initialData?.id || '0');

            console.log('Uploading image, FormData created');

            // Make the fetch request with error handling
            const response = await fetch('/api/uploads', {
                method: 'POST',
                body: formData,
            });

            console.log('Upload response status:', response.status);

            // Handle non-OK responses
            if (!response.ok) {
                let errorMessage = `Upload failed with status: ${response.status}`;

                try {
                    const errorData = await response.json();
                    console.error('Upload error response:', errorData);
                    errorMessage = errorData.error || errorMessage;
                } catch (parseError) {
                    console.error('Failed to parse error response:', parseError);
                }

                throw new Error(errorMessage);
            }

            // Parse the successful response
            let data;
            try {
                data = await response.json();
                console.log('Upload success data:', data);
            } catch (parseError) {
                console.error('Failed to parse success response:', parseError);
                throw new Error('Failed to parse server response');
            }

            if (!data || !data.upload || !data.upload.id) {
                console.error('Upload response missing required data:', data);
                throw new Error('Invalid response from server');
            }

            return data.upload.id;
        } catch (error) {
            console.error('Image upload error:', error);
            toast.error(`Failed to upload image: ${error.message || 'Unknown error'}`);
            return null;
        } finally {
            setIsUploading(false);
        }
    };

    // Submit form
    const onSubmit = async (data) => {
        try {
            // Upload image if selected
            let imageId = initialData?.image_id;

            if (imageFile) {
                // If a new image is selected, upload it
                imageId = await uploadImage();
                if (!imageId && !initialData?.image_id) {
                    toast.error('Failed to upload image. Please try again.');
                    return; // Stop if image upload failed and we don't have an existing image
                }
            }

            // Prepare form data
            const formData = {
                ...data,
                image_id: imageId, // Use uploaded image id or existing one
                participants: participants.map(p => p.id)
            };

            console.log('Submitting form data:', formData);

            let result;
            if (isEdit && initialData?.id) {
                result = await updateProgram.mutateAsync({ id: initialData.id, data: formData });
                toast.success('Program updated successfully');
            } else {
                result = await createProgram.mutateAsync(formData);
                toast.success('Program created successfully');
            }

            if (onSuccess) {
                onSuccess(isEdit ? initialData.id : result?.id);
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            toast.error(error.message || 'Failed to save program');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>{isEdit ? 'Edit Program' : 'New Program'}</CardTitle>
                    <CardDescription>
                        Enter the details of your program.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Image Upload */}
                    <div className="space-y-2">
                        <Label htmlFor="image">Program Image</Label>
                        <div className="border rounded-md p-4">
                            {imagePreview ? (
                                <div className="relative w-full h-64">
                                    <Image
                                        src={imagePreview}
                                        alt="Program image preview"
                                        fill
                                        className="object-contain"
                                    />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-2 right-2"
                                        onClick={removeImage}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : initialData?.image_id ? (
                                <div className="relative w-full h-64">
                                    <Image
                                        src={initialData.image_url || `/uploads/${initialData.image_id}`}
                                        alt={initialData.name}
                                        fill
                                        priority
                                        className="object-contain"
                                        onError={(e) => {
                                            console.error('Image failed to load:', e);
                                            e.target.style.display = 'none';
                                            e.target.parentNode.style.display = 'none';
                                            document.getElementById('image-fallback').style.display = 'flex';
                                        }}
                                    />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-2 right-2"
                                        onClick={() => setValue('image_id', null)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-64 bg-muted/40 rounded-md border-2 border-dashed">
                                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                    <p className="text-sm text-muted-foreground">
                                        Click to upload or drag and drop
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        JPG, PNG or GIF up to 5MB
                                    </p>
                                    <Input
                                        id="image"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageChange}
                                    />
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        className="mt-4"
                                        onClick={() => document.getElementById('image').click()}
                                    >
                                        Select Image
                                    </Button>
                                </div>
                            )}
                            <div id="image-fallback" className="hidden flex-col items-center justify-center h-64 bg-muted/40 rounded-md border-2 border-dashed">
                                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                <p className="text-sm text-muted-foreground">
                                    Error loading image. Click to upload a new one.
                                </p>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    className="mt-4"
                                    onClick={() => document.getElementById('image').click()}
                                >
                                    Select Image
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Program Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">
                            Program Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="name"
                            {...register('name', { required: 'Program name is required' })}
                            placeholder="Enter program name"
                            className={errors.name ? 'border-red-500' : ''}
                        />
                        {errors.name && (
                            <p className="text-sm text-red-500">{errors.name.message}</p>
                        )}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            {...register('description')}
                            placeholder="Enter program description"
                            rows={4}
                        />
                    </div>

                    {/* Total Participants */}
                    <div className="space-y-2">
                        <Label htmlFor="total_participants">Total Participants</Label>
                        <Input
                            id="total_participants"
                            type="number"
                            {...register('total_participants', {
                                valueAsNumber: true,
                                min: { value: 0, message: 'Must be a positive number' },
                            })}
                            placeholder="Enter expected number of participants"
                            className={errors.total_participants ? 'border-red-500' : ''}
                        />
                        {errors.total_participants && (
                            <p className="text-sm text-red-500">{errors.total_participants.message}</p>
                        )}
                    </div>

                    {/* Date and Time */}
                    <div className="space-y-2">
                        <Label htmlFor="date">
                            Date and Time <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="date"
                            type="datetime-local"
                            {...register('date', { required: 'Date is required' })}
                            className={errors.date ? 'border-red-500' : ''}
                        />
                        {errors.date && (
                            <p className="text-sm text-red-500">{errors.date.message}</p>
                        )}
                    </div>

                    {/* Program Niche */}
                    <div className="space-y-2">
                        <Label htmlFor="niche">Program Niche/Category</Label>
                        <Input
                            id="niche"
                            {...register('niche')}
                            placeholder="Enter program category or niche"
                        />
                    </div>

                    {/* Participants Selection */}
                    <div className="space-y-4">
                        <Label>Participants</Label>

                        {/* Search/Add Participant */}
                        <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={openCombobox}
                                    className="w-full justify-between"
                                >
                                    Search for participants
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0" align="start">
                                <Command>
                                    <CommandInput
                                        placeholder="Search users..."
                                        value={searchQuery}
                                        onValueChange={handleSearch}
                                    />
                                    {isSearching && (
                                        <div className="flex items-center justify-center py-6">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span className="ml-2 text-sm">Searching...</span>
                                        </div>
                                    )}
                                    {!isSearching && (
                                        <>
                                            <CommandEmpty>No users found.</CommandEmpty>
                                            <CommandGroup>
                                                {searchQuery.length < 2 ? (
                                                    <div className="py-6 px-4 text-sm text-center text-muted-foreground">
                                                        Type at least 2 characters to search...
                                                    </div>
                                                ) : Array.isArray(searchResults) && searchResults.length > 0 ? (
                                                    searchResults.map((user) => (
                                                        <CommandItem
                                                            key={user.id}
                                                            value={user.id.toString()}
                                                            onSelect={() => {
                                                                addParticipant(user);
                                                                setOpenCombobox(false);
                                                            }}
                                                        >
                                                            <div className="flex items-center">
                                                                {user.avatar && (
                                                                    <div className="w-6 h-6 rounded-full overflow-hidden mr-2">
                                                                        <Image
                                                                            src={user.avatar}
                                                                            alt={user.name}
                                                                            width={24}
                                                                            height={24}
                                                                        />
                                                                    </div>
                                                                )}
                                                                <span>{user.name}</span>
                                                                <span className="ml-2 text-xs text-muted-foreground">
                                                                    {user.email}
                                                                </span>
                                                            </div>
                                                        </CommandItem>
                                                    ))
                                                ) : (
                                                    <div className="py-6 px-4 text-sm text-center text-muted-foreground">
                                                        No matching users found
                                                    </div>
                                                )}
                                            </CommandGroup>
                                        </>
                                    )}
                                </Command>
                            </PopoverContent>
                        </Popover>

                        {/* Selected Participants */}
                        <div className="flex flex-wrap gap-2 mt-2">
                            {participants.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No participants selected</p>
                            ) : (
                                participants.map((participant) => (
                                    <Badge key={participant.id} variant="secondary" className="flex items-center gap-1">
                                        {participant.name}
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-4 w-4 p-0"
                                            onClick={() => removeParticipant(participant.id)}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </Badge>
                                ))
                            )}
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="flex justify-end space-x-2">
                    <Button
                        type="submit"
                        disabled={isSubmitting || isUploading}
                    >
                        {(isSubmitting || isUploading) ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {isUploading ? 'Uploading...' : 'Saving...'}
                            </>
                        ) : (
                            isEdit ? 'Update Program' : 'Create Program'
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
}