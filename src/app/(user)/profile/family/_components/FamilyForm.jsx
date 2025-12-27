'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Link2, User, Loader2 } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

/**
 * @typedef {Object} FamilyFormData
 * @property {string} [id]
 * @property {string} relationship
 * @property {string} full_name
 * @property {string} phone
 * @property {string} occupation
 * @property {string} company
 * @property {boolean} supports_dakwah
 * @property {string} jemaah_name
 * @property {string} [linked_user_id]
 */

/**
 * @param {Object} props
 * @param {FamilyFormData} [props.initialData]
 * @param {function(FamilyFormData): void} props.onSubmit
 * @param {function(): void} props.onCancel
 * @param {boolean} [props.isSubmitting]
 */
export default function FamilyForm({ initialData, onSubmit, onCancel, isSubmitting = false }) {
    const [formData, setFormData] = useState(
        initialData || {
            relationship: "",
            full_name: "",
            phone: "",
            occupation: "",
            company: "",
            supports_dakwah: false,
            jemaah_name: "",
            linked_user_id: null,
        }
    );

    // Spouse autocomplete states
    const [spouseSearchQuery, setSpouseSearchQuery] = useState(initialData?.full_name || "");
    const [spouseResults, setSpouseResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isLinkedSpouse, setIsLinkedSpouse] = useState(!!initialData?.linked_user_id);

    const debouncedSearchQuery = useDebounce(spouseSearchQuery, 300);

    // Search for spouse when user types (only for spouse relationship)
    useEffect(() => {
        const searchSpouse = async () => {
            if (formData.relationship !== 'Spouse' || !debouncedSearchQuery || debouncedSearchQuery.length < 2 || isLinkedSpouse) {
                setSpouseResults([]);
                setShowDropdown(false);
                return;
            }

            setIsSearching(true);
            try {
                const response = await fetch(`/api/users/search-spouse?q=${encodeURIComponent(debouncedSearchQuery)}`);
                if (response.ok) {
                    const data = await response.json();
                    setSpouseResults(data);
                    setShowDropdown(data.length > 0);
                }
            } catch (error) {
                console.error('Error searching spouse:', error);
            } finally {
                setIsSearching(false);
            }
        };

        searchSpouse();
    }, [debouncedSearchQuery, formData.relationship, isLinkedSpouse]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    // Handle selecting a linked spouse from autocomplete
    const handleSelectSpouse = (spouse) => {
        setFormData({
            ...formData,
            full_name: spouse.fullName,
            phone: spouse.phone || "",
            occupation: "", // Will be auto-filled from profile if available
            company: "",
            linked_user_id: spouse.id,
        });
        setSpouseSearchQuery(spouse.fullName);
        setIsLinkedSpouse(true);
        setShowDropdown(false);
    };

    // Handle unlinking spouse (to manually enter)
    const handleUnlinkSpouse = () => {
        setFormData({
            ...formData,
            linked_user_id: null,
        });
        setIsLinkedSpouse(false);
    };

    // Handle relationship change - reset linked spouse if changing from spouse
    const handleRelationshipChange = (value) => {
        if (value !== 'Spouse') {
            setIsLinkedSpouse(false);
            setFormData({
                ...formData,
                relationship: value,
                linked_user_id: null,
            });
        } else {
            setFormData({
                ...formData,
                relationship: value,
            });
        }
    };

    // Relationship options
    const relationshipOptions = [
        "Father",
        "Mother",
        "Spouse",
        "Sibling",
        "Child"
    ];

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="relationship">Relationship</Label>
                    <Select
                        value={formData.relationship}
                        onValueChange={handleRelationshipChange}
                        disabled={isSubmitting}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select relationship" />
                        </SelectTrigger>
                        <SelectContent>
                            {relationshipOptions.map((relationship) => (
                                <SelectItem key={relationship} value={relationship}>
                                    {relationship}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="full_name">Full Name</Label>
                        {isLinkedSpouse && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                                <Link2 className="h-3 w-3" />
                                Linked
                            </Badge>
                        )}
                    </div>
                    <div className="relative">
                        <Input
                            id="full_name"
                            value={formData.relationship === 'Spouse' ? spouseSearchQuery : formData.full_name || ""}
                            onChange={(e) => {
                                if (formData.relationship === 'Spouse' && !isLinkedSpouse) {
                                    setSpouseSearchQuery(e.target.value);
                                    setFormData((prev) => ({ ...prev, full_name: e.target.value }));
                                } else if (formData.relationship !== 'Spouse') {
                                    setFormData((prev) => ({ ...prev, full_name: e.target.value }));
                                }
                            }}
                            disabled={isSubmitting || isLinkedSpouse}
                            placeholder={formData.relationship === 'Spouse' ? "Start typing to search..." : "Enter full name"}
                            className={isLinkedSpouse ? "bg-muted" : ""}
                        />
                        {isSearching && formData.relationship === 'Spouse' && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            </div>
                        )}

                        {/* Autocomplete Dropdown */}
                        {showDropdown && formData.relationship === 'Spouse' && spouseResults.length > 0 && (
                            <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                                {spouseResults.map((spouse) => (
                                    <button
                                        key={spouse.id}
                                        type="button"
                                        onClick={() => handleSelectSpouse(spouse)}
                                        className="w-full px-4 py-2 text-left hover:bg-accent flex items-center gap-2 transition-colors"
                                    >
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <div className="flex-1">
                                            <p className="font-medium">{spouse.name}</p>
                                            {spouse.phone && (
                                                <p className="text-sm text-muted-foreground">{spouse.phone}</p>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    {isLinkedSpouse && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Link2 className="h-3 w-3" />
                            This spouse is linked to their account.
                            <button
                                type="button"
                                onClick={handleUnlinkSpouse}
                                className="text-blue-600 hover:underline"
                            >
                                Unlink to edit manually
                            </button>
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                        id="phone"
                        value={formData.phone || ""}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, phone: e.target.value }))
                        }
                        disabled={isSubmitting || isLinkedSpouse}
                        placeholder="e.g., +60123456789"
                        className={isLinkedSpouse ? "bg-muted" : ""}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="occupation">Occupation (if any)</Label>
                    <Input
                        id="occupation"
                        value={formData.occupation || ""}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, occupation: e.target.value }))
                        }
                        disabled={isSubmitting || isLinkedSpouse}
                        placeholder="e.g., Teacher, Engineer"
                        className={isLinkedSpouse ? "bg-muted" : ""}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="company">Company (if any)</Label>
                    <Input
                        id="company"
                        value={formData.company || ""}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, company: e.target.value }))
                        }
                        disabled={isSubmitting || isLinkedSpouse}
                        placeholder="e.g., ABC Corporation"
                        className={isLinkedSpouse ? "bg-muted" : ""}
                    />
                </div>

                <div className="flex items-center space-x-2 pt-2">
                    <Checkbox
                        id="supports_dakwah"
                        checked={formData.supports_dakwah}
                        onCheckedChange={(checked) => {
                            setFormData((prev) => ({
                                ...prev,
                                supports_dakwah: checked
                            }));
                        }}
                        disabled={isSubmitting}
                    />
                    <Label htmlFor="supports_dakwah">Support Dakwah</Label>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="jemaah_name">Jemaah Name (if any)</Label>
                    <Input
                        id="jemaah_name"
                        value={formData.jemaah_name || ""}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, jemaah_name: e.target.value }))
                        }
                        disabled={isSubmitting}
                        placeholder="Enter jemaah name"
                    />
                </div>
            </div>

            <div className="flex gap-4">
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save"}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    className="flex-1"
                    disabled={isSubmitting}
                >
                    Cancel
                </Button>
            </div>
        </form>
    );
} 