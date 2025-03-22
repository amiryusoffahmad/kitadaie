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
 * @typedef {Object} EducationFormData
 * @property {string} [id]
 * @property {string} university
 * @property {string} field_of_study
 * @property {string} course
 * @property {string} degree
 * @property {string} start_year
 * @property {string} end_year
 * @property {boolean} is_current
 * @property {string} scholarship
 */

/**
 * @param {Object} props
 * @param {EducationFormData} [props.initialData]
 * @param {function(EducationFormData): void} props.onSubmit
 * @param {function(): void} props.onCancel
 * @param {boolean} [props.isSubmitting]
 */
export default function EducationForm({ initialData, onSubmit, onCancel, isSubmitting = false }) {
    const [formData, setFormData] = useState(
        initialData || {
            university: "",
            field_of_study: "",
            course: "",
            degree: "",
            start_year: "",
            end_year: "",
            is_current: false,
            scholarship: "",
        }
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    // Generate year options from 1950 to current year
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 1950 + 1 }, (_, i) => (currentYear - i).toString());

    // Field of study options
    const fieldOfStudyOptions = [
        "Accountancy",
        "Engineering",
        "Health Science",
        "HR/HD",
        "Language",
        "Law",
        "Medic",
        "Science",
        "Technology/IT",
        "Others"
    ];

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="university">University</Label>
                    <Input
                        id="university"
                        value={formData.university || ""}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, university: e.target.value }))
                        }
                        disabled={isSubmitting}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="field_of_study">Field of Study</Label>
                    <Select
                        value={formData.field_of_study}
                        onValueChange={(value) =>
                            setFormData((prev) => ({ ...prev, field_of_study: value }))
                        }
                        disabled={isSubmitting}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select field of study" />
                        </SelectTrigger>
                        <SelectContent>
                            {fieldOfStudyOptions.map((field) => (
                                <SelectItem key={field} value={field}>
                                    {field}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="course">Course</Label>
                    <Input
                        id="course"
                        value={formData.course || ""}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, course: e.target.value }))
                        }
                        disabled={isSubmitting}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="degree">Degree</Label>
                    <Select
                        value={formData.degree}
                        onValueChange={(value) =>
                            setFormData((prev) => ({ ...prev, degree: value }))
                        }
                        disabled={isSubmitting}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select degree" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Bachelor">Bachelor's Degree</SelectItem>
                            <SelectItem value="Master">Master's Degree</SelectItem>
                            <SelectItem value="PhD">PhD</SelectItem>
                            <SelectItem value="Associate">Associate Degree</SelectItem>
                            <SelectItem value="Diploma">Diploma</SelectItem>
                            <SelectItem value="Certificate">Certificate</SelectItem>
                            <SelectItem value="High School">High School</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="scholarship">Scholarship (if any)</Label>
                    <Input
                        id="scholarship"
                        value={formData.scholarship || ""}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, scholarship: e.target.value }))
                        }
                        disabled={isSubmitting}
                        placeholder="e.g., JPA, MARA, Corporate"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="start_year">Start Year</Label>
                    <Select
                        value={formData.start_year}
                        onValueChange={(value) =>
                            setFormData((prev) => ({ ...prev, start_year: value }))
                        }
                        disabled={isSubmitting}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select start year" />
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

                <div className="flex items-center space-x-2 pt-2">
                    <Checkbox
                        id="is_current"
                        checked={formData.is_current}
                        onCheckedChange={(checked) => {
                            setFormData((prev) => ({
                                ...prev,
                                is_current: checked,
                                // Clear end year if current is checked
                                end_year: checked ? "" : prev.end_year
                            }));
                        }}
                        disabled={isSubmitting}
                    />
                    <Label htmlFor="is_current">Currently studying here</Label>
                </div>

                {!formData.is_current && (
                    <div className="space-y-2">
                        <Label htmlFor="end_year">End Year</Label>
                        <Select
                            value={formData.end_year}
                            onValueChange={(value) =>
                                setFormData((prev) => ({ ...prev, end_year: value }))
                            }
                            disabled={isSubmitting || formData.is_current}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select end year" />
                            </SelectTrigger>
                            <SelectContent>
                                {years.map((year) => (
                                    <SelectItem
                                        key={year}
                                        value={year}
                                        disabled={formData.start_year && parseInt(year) < parseInt(formData.start_year)}
                                    >
                                        {year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
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