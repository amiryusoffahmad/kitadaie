'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

/**
 * @typedef {Object} PersonalFormData
 * @property {string} [id]
 * @property {string} first_name
 * @property {string} gender
 * @property {string} email
 * @property {string} phone
 * @property {string} address
 * @property {string} [profile_picture]
 * @property {string} branch
 * @property {string} income_classification
 * @property {string} marital_status
 * @property {string} family_status
 * @property {string} [murobbi_id]
 * @property {string} [ic_no]
 */

/**
 * @param {Object} props
 * @param {PersonalFormData} [props.initialData]
 * @param {function(PersonalFormData): void} props.onSubmit
 * @param {function(): void} props.onCancel
 * @param {boolean} [props.isSubmitting]
 */
export default function PersonalForm({ initialData, onSubmit, onCancel, isSubmitting = false }) {
    const [formData, setFormData] = useState(
        initialData || {
            first_name: "",
            gender: "",
            email: "",
            phone: "",
            address: "",
            branch: "",
            income_classification: "",
            marital_status: "",
            family_status: "",
            murobbi_id: "",
            ic_no: "",
        }
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await onSubmit(formData);
            toast.success("Profile updated successfully!", {
                description: "Your personal information has been saved.",
            });
        } catch (error) {
            console.error("Error saving profile:", error);
            toast.error("Failed to update profile", {
                description: "Please try again later.",
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                        id="first_name"
                        value={formData.first_name || ""}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, first_name: e.target.value }))
                        }
                        disabled={isSubmitting}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                        value={formData.gender}
                        onValueChange={(value) =>
                            setFormData((prev) => ({ ...prev, gender: value }))
                        }
                        disabled={isSubmitting}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, email: e.target.value }))
                        }
                        disabled={isSubmitting}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, phone: e.target.value }))
                        }
                        disabled={isSubmitting}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="address">Current Address</Label>
                    <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, address: e.target.value }))
                        }
                        disabled={isSubmitting}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="branch">Branch</Label>
                    <Select
                        value={formData.branch}
                        onValueChange={(value) =>
                            setFormData((prev) => ({ ...prev, branch: value }))
                        }
                        disabled={isSubmitting}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select branch" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Malaysia - Central">Malaysia - Central</SelectItem>
                            <SelectItem value="Malaysia - Northern">Malaysia - Northern</SelectItem>
                            <SelectItem value="Malaysia - Eastern">Malaysia - Eastern</SelectItem>
                            <SelectItem value="Malaysia - Borneo">Malaysia - Borneo</SelectItem>
                            <SelectItem value="Europe">Europe</SelectItem>
                            <SelectItem value="ANZ">ANZ</SelectItem>
                            <SelectItem value="MEA">MEA</SelectItem>
                            <SelectItem value="IDN">IDN</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="murobbi_id">Murobbi ID</Label>
                    <Input
                        id="murobbi_id"
                        value={formData.murobbi_id || ""}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, murobbi_id: e.target.value }))
                        }
                        disabled={isSubmitting}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="income_classification">Income Classification</Label>
                    <Select
                        value={formData.income_classification}
                        onValueChange={(value) =>
                            setFormData((prev) => ({ ...prev, income_classification: value }))
                        }
                        disabled={isSubmitting}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select income classification" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="B1">B1 (less than RM2500)</SelectItem>
                            <SelectItem value="B2">B2 (RM2500 - RM3165)</SelectItem>
                            <SelectItem value="B3">B3 (RM3170 - RM3969)</SelectItem>
                            <SelectItem value="B4">B4 (RM3970 - RM4849)</SelectItem>
                            <SelectItem value="M1">M1 (RM4850 - RM5849)</SelectItem>
                            <SelectItem value="M2">M2 (RM5880 - RM7099)</SelectItem>
                            <SelectItem value="M3">M3 (RM7110 - RM8699)</SelectItem>
                            <SelectItem value="M4">M4 (RM8700 - RM10959)</SelectItem>
                            <SelectItem value="T1">T1 (RM10960 - RM15039)</SelectItem>
                            <SelectItem value="T2">T2 (more than RM15039)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="marital_status">Marital Status</Label>
                    <Select
                        value={formData.marital_status}
                        onValueChange={(value) =>
                            setFormData((prev) => ({ ...prev, marital_status: value }))
                        }
                        disabled={isSubmitting}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select marital status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Single">Single</SelectItem>
                            <SelectItem value="Married">Married</SelectItem>
                            <SelectItem value="Divorced">Divorced</SelectItem>
                            <SelectItem value="Widowed">Widowed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="family_status">Family Status</Label>
                    <Select
                        value={formData.family_status}
                        onValueChange={(value) =>
                            setFormData((prev) => ({ ...prev, family_status: value }))
                        }
                        disabled={isSubmitting}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select family status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Normal">Normal</SelectItem>
                            <SelectItem value="Deceased mother">Deceased mother</SelectItem>
                            <SelectItem value="Deceased father">Deceased father</SelectItem>
                            <SelectItem value="Deceased parents">Deceased parents</SelectItem>
                            <SelectItem value="Divorced parents">Divorced parents</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="ic_no">IC Number</Label>
                    <Input
                        id="ic_no"
                        value={formData.ic_no || ""}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, ic_no: e.target.value }))
                        }
                        disabled={isSubmitting}
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