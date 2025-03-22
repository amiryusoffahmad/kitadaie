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

/**
 * @typedef {Object} CertificationFormData
 * @property {string} [id]
 * @property {string} type
 * @property {string} name
 * @property {string} issuing_institution
 * @property {string} year_obtained
 */

/**
 * @param {Object} props
 * @param {CertificationFormData} [props.initialData]
 * @param {function(CertificationFormData): void} props.onSubmit
 * @param {function(): void} props.onCancel
 * @param {boolean} [props.isSubmitting]
 */
export default function CertificationForm({ initialData, onSubmit, onCancel, isSubmitting = false }) {
    const [formData, setFormData] = useState(
        initialData || {
            type: "",
            name: "",
            issuing_institution: "",
            year_obtained: "",
        }
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    // Generate year options from 1950 to current year
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 1950 + 1 }, (_, i) => (currentYear - i).toString());

    // Certification types
    const certificationTypes = [
        "Professional",
        "Academic",
        "Technical",
        "Other"
    ];

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="type">Certification Type</Label>
                    <Select
                        value={formData.type}
                        onValueChange={(value) =>
                            setFormData((prev) => ({ ...prev, type: value }))
                        }
                        disabled={isSubmitting}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select certification type" />
                        </SelectTrigger>
                        <SelectContent>
                            {certificationTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                    {type}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="name">Certification Name</Label>
                    <Input
                        id="name"
                        value={formData.name || ""}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, name: e.target.value }))
                        }
                        disabled={isSubmitting}
                        placeholder="e.g., AWS Certified Solutions Architect"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="issuing_institution">Issuing Institution</Label>
                    <Input
                        id="issuing_institution"
                        value={formData.issuing_institution || ""}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, issuing_institution: e.target.value }))
                        }
                        disabled={isSubmitting}
                        placeholder="e.g., Amazon Web Services"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="year_obtained">Year Obtained</Label>
                    <Select
                        value={formData.year_obtained}
                        onValueChange={(value) =>
                            setFormData((prev) => ({ ...prev, year_obtained: value }))
                        }
                        disabled={isSubmitting}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select year obtained" />
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