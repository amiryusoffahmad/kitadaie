'use client';

import { useState } from "react";
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
        }
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        onSubmit(formData);
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
                        onValueChange={(value) =>
                            setFormData((prev) => ({ ...prev, relationship: value }))
                        }
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
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                        id="full_name"
                        value={formData.full_name || ""}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, full_name: e.target.value }))
                        }
                        disabled={isSubmitting}
                        placeholder="Enter full name"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                        id="phone"
                        value={formData.phone || ""}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, phone: e.target.value }))
                        }
                        disabled={isSubmitting}
                        placeholder="e.g., +60123456789"
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
                        disabled={isSubmitting}
                        placeholder="e.g., Teacher, Engineer"
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
                        disabled={isSubmitting}
                        placeholder="e.g., ABC Corporation"
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