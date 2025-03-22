'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

/**
 * @typedef {Object} HighSchoolFormData
 * @property {string} [id]
 * @property {string} state
 * @property {string} type
 * @property {string} school_name
 * @property {string} position
 * @property {string} spm_result
 * @property {string} highest_achievement
 * @property {string} spm_year
 */

/**
 * @param {Object} props
 * @param {HighSchoolFormData} [props.initialData]
 * @param {function(HighSchoolFormData): void} props.onSubmit
 * @param {function(): void} props.onCancel
 * @param {boolean} [props.isSubmitting]
 */
export default function HighSchoolForm({ initialData, onSubmit, onCancel, isSubmitting = false }) {
    const [formData, setFormData] = useState(
        initialData || {
            state: "",
            type: "",
            school_name: "",
            position: "",
            spm_result: "",
            highest_achievement: "",
            spm_year: "",
        }
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    // Generate year options from 1950 to current year
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 1950 + 1 }, (_, i) => (currentYear - i).toString());

    // Malaysian states
    const malaysianStates = [
        "Johor",
        "Kedah",
        "Kelantan",
        "Melaka",
        "Negeri Sembilan",
        "Pahang",
        "Perak",
        "Perlis",
        "Pulau Pinang",
        "Sabah",
        "Sarawak",
        "Selangor",
        "Terengganu",
        "Wilayah Persekutuan Kuala Lumpur",
        "Wilayah Persekutuan Labuan",
        "Wilayah Persekutuan Putrajaya",
        "Others"
    ];

    // School types
    const schoolTypes = [
        "MRSM",
        "SABK",
        "SBP",
        "SMK",
        "SMKA",
        "SWASTA",
        "Others"
    ];

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Select
                        value={formData.state}
                        onValueChange={(value) =>
                            setFormData((prev) => ({ ...prev, state: value }))
                        }
                        disabled={isSubmitting}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                            {malaysianStates.map((state) => (
                                <SelectItem key={state} value={state}>
                                    {state}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="type">School Type</Label>
                    <Select
                        value={formData.type}
                        onValueChange={(value) =>
                            setFormData((prev) => ({ ...prev, type: value }))
                        }
                        disabled={isSubmitting}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select school type" />
                        </SelectTrigger>
                        <SelectContent>
                            {schoolTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                    {type}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="school_name">School Name</Label>
                    <Input
                        id="school_name"
                        value={formData.school_name || ""}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, school_name: e.target.value }))
                        }
                        disabled={isSubmitting}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="position">Position in School</Label>
                    <Input
                        id="position"
                        value={formData.position || ""}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, position: e.target.value }))
                        }
                        disabled={isSubmitting}
                        placeholder="e.g., Prefect, Head Boy/Girl, Class Monitor"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="spm_result">SPM Result</Label>
                    <Input
                        id="spm_result"
                        value={formData.spm_result || ""}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, spm_result: e.target.value }))
                        }
                        disabled={isSubmitting}
                        placeholder="e.g., 8A 1B 1C"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="highest_achievement">Highest Achievement</Label>
                    <Textarea
                        id="highest_achievement"
                        value={formData.highest_achievement || ""}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, highest_achievement: e.target.value }))
                        }
                        disabled={isSubmitting}
                        placeholder="Describe your highest achievements in high school"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="spm_year">SPM Year</Label>
                    <Select
                        value={formData.spm_year}
                        onValueChange={(value) =>
                            setFormData((prev) => ({ ...prev, spm_year: value }))
                        }
                        disabled={isSubmitting}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select SPM year" />
                        </SelectTrigger>
                        <SelectContent>
                            {years.map((year) => (
                                <SelectItem key={year} value={year}>
                                    {year}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
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