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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { CheckIcon, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

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
 * @param {function(string): void} props.onDegreeChange 
 */
export default function EducationForm({
    initialData,
    onSubmit,
    onCancel,
    isSubmitting = false,
    onDegreeChange
}) {
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
    const [open, setOpen] = useState(false);
    const [universitiesOptions, setUniversitiesOptions] = useState([]);

    // University options based on degree
    useEffect(() => {
        if (formData.degree === "Foundation") {
            setUniversitiesOptions([
                { value: "Asasi UiTM", label: "Asasi UiTM (AsiD)" },
                { value: "Asasi UMS", label: "Asasi UMS (AUMS)" },
                { value: "Asasi UKM", label: "Asasi UKM (AsPin)" },
                { value: "Asasi UM", label: "Asasi UM (PAsUM)" },
                { value: "Asasi UPM", label: "Asasi UPM (AsPutra)" },
                { value: "Asasi USIM", label: "Asasi USIM (Tahmidi)" },
                { value: "Asasi UNIMAS", label: "Asasi UNIMAS (AUniMaS)" },
                { value: "Asasi UIA", label: "Asasi UIA (CFS)" },
                { value: "Asasi Unisza", label: "Asasi Unisza" },
                { value: "Asasi UMT", label: "Asasi UMT" },
                { value: "Asasi UUM", label: "Asasi UUM" },
                { value: "Kolej Matrikulasi Melaka", label: "Kolej Matrikulasi Melaka (KMM)" },
                { value: "Kolej Matrikulasi Negeri Sembilan", label: "Kolej Matrikulasi Negeri Sembilan (KMNS)" },
                { value: "Kolej Matrikulasi Pulau Pinang", label: "Kolej Matrikulasi Pulau Pinang (KMPP)" },
                { value: "Kolej Matrikulasi Perlis", label: "Kolej Matrikulasi Perlis (KMP)" },
                { value: "Kolej Matrikulasi Labuan", label: "Kolej Matrikulasi Labuan (KML)" },
                { value: "Kolej Matrikulasi Johor", label: "Kolej Matrikulasi Johor (KMJ)" },
                { value: "Kolej Matrikulasi Perak", label: "Kolej Matrikulasi Perak (KMPK)" },
                { value: "Kolej Matrikulasi Pahang", label: "Kolej Matrikulasi Pahang (KMPh)" },
                { value: "Kolej Matrikulasi Kejuruteraan Kedah", label: "Kolej Matrikulasi Kejuruteraan Kedah (KMKK)" },
                { value: "Kolej Matrikulasi Kejuruteraan Pahang", label: "Kolej Matrikulasi Kejuruteraan Pahang (KMKPh)" },
                { value: "Kolej Matrikulasi Kejuruteraan Johor", label: "Kolej Matrikulasi Kejuruteraan Johor (KMKJ)" },
                { value: "Kolej Matrikulasi Selangor", label: "Kolej Matrikulasi Selangor (KMS)" },
                { value: "Kolej Matrikulasi Kelantan", label: "Kolej Matrikulasi Kelantan (KMKt)" },
                { value: "Kolej Matrikulasi Sarawak", label: "Kolej Matrikulasi Sarawak (KMSw)" },
                { value: "Kolej MARA Kulim", label: "Kolej MARA Kulim (KMKu)" },
                { value: "Kolej MARA Kuala Nerang", label: "Kolej MARA Kuala Nerang (KMKN)" },
            ]);
        } else if (formData.degree === "Bachelor") {
            setUniversitiesOptions([
                { value: "Universiti Malaya", label: "Universiti Malaya (UM)" },
                { value: "Universiti Sains Malaysia", label: "Universiti Sains Malaysia (USM)" },
                { value: "Universiti Kebangsaan Malaysia", label: "Universiti Kebangsaan Malaysia (UKM)" },
                { value: "Universiti Putra Malaysia", label: "Universiti Putra Malaysia (UPM)" },
                { value: "Universiti Teknologi Malaysia", label: "Universiti Teknologi Malaysia (UTM)" },
                { value: "Universiti Malaysia Sarawak", label: "Universiti Malaysia Sarawak (UniMaS)" },
                { value: "Universiti Islam Antarabangsa Malaysia", label: "Universiti Islam Antarabangsa Malaysia (UIAM)" },
                { value: "Universiti Sains Islam Malaysia", label: "Universiti Sains Islam Malaysia (USIM)" },
                { value: "Universiti Sultan Zainal Abidin", label: "Universiti Sultan Zainal Abidin (UniSZA)" },
                { value: "Universiti Teknologi MARA", label: "Universiti Teknologi MARA (UiTM)" },
                { value: "Universiti Malaysia Sabah", label: "Universiti Malaysia Sabah (UMS)" },
                { value: "Universiti Teknikal Malaysia Melaka", label: "Universiti Teknikal Malaysia Melaka (UTeM)" },
                { value: "Universiti Malaysia Perlis", label: "Universiti Malaysia Perlis (UniMAP)" },
                { value: "Universiti Tun Hussein Onn Malaysia", label: "Universiti Tun Hussein Onn Malaysia (UTHM)" },
                { value: "Universiti Malaysia Pahang", label: "Universiti Malaysia Pahang (UMP)" },
                { value: "Universiti Utara Malaysia", label: "Universiti Utara Malaysia (UUM)" },
                { value: "Universiti Pendidikan Sultan Idris", label: "Universiti Pendidikan Sultan Idris (UPSI)" },
                { value: "Universiti Malaysia Terengganu", label: "Universiti Malaysia Terengganu (UMT)" },
                { value: "Universiti Malaysia Kelantan", label: "Universiti Malaysia Kelantan (UMK)" },
                { value: "Universiti Pertahanan Nasional Malaysia", label: "Universiti Pertahanan Nasional Malaysia (UPNM)" },
            ]);
        }
    }, [formData.degree]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const handleDegreeChange = (value) => {
        setFormData((prev) => ({ ...prev, degree: value }));
        if (onDegreeChange) {
            onDegreeChange(value);
        }
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

    // This is just for degree selection at the top
    if (!formData.degree) {
        return (
            <form className="space-y-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="degree">Select Degree</Label>
                        <Select
                            value={formData.degree}
                            onValueChange={handleDegreeChange}
                            disabled={isSubmitting}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select degree" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="High School">High School</SelectItem>
                                <SelectItem value="Bachelor">Bachelor's Degree</SelectItem>
                                <SelectItem value="Master">Master's Degree</SelectItem>
                                <SelectItem value="PhD">PhD</SelectItem>
                                <SelectItem value="Foundation">Foundation / Matriculation</SelectItem>
                                <SelectItem value="Diploma">Diploma</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex gap-4">
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

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="degree">Degree</Label>
                    <Select
                        value={formData.degree}
                        onValueChange={handleDegreeChange}
                        disabled={isSubmitting}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select degree" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="High School">High School</SelectItem>
                            <SelectItem value="Bachelor">Bachelor's Degree</SelectItem>
                            <SelectItem value="Master">Master's Degree</SelectItem>
                            <SelectItem value="PhD">PhD</SelectItem>
                            <SelectItem value="Foundation">Foundation / Matriculation</SelectItem>
                            <SelectItem value="Diploma">Diploma</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {(formData.degree === "Foundation" || formData.degree === "Bachelor") ? (
                    <div className="space-y-2">
                        <Label htmlFor="university">
                            {formData.degree === "Foundation" ? "Institution" : "University"}
                        </Label>
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={open}
                                    className="w-full justify-between"
                                    disabled={isSubmitting}
                                >
                                    {formData.university
                                        ? universitiesOptions.find(
                                            (university) => university.value === formData.university
                                        )?.label || formData.university
                                        : `Select ${formData.degree === "Foundation" ? "institution" : "university"}...`}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                                <Command>
                                    <CommandInput placeholder={`Search ${formData.degree === "Foundation" ? "institution" : "university"}...`} />
                                    <CommandEmpty>
                                        No {formData.degree === "Foundation" ? "institution" : "university"} found. Enter a custom {formData.degree === "Foundation" ? "institution" : "university"} name.
                                        <Input
                                            value={formData.university || ""}
                                            onChange={(e) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    university: e.target.value
                                                }))
                                            }
                                            placeholder="Enter custom value"
                                            className="mt-2"
                                        />
                                        <Button
                                            type="button"
                                            className="mt-2 w-full"
                                            onClick={() => setOpen(false)}
                                        >
                                            Use custom value
                                        </Button>
                                    </CommandEmpty>
                                    <CommandList>
                                        <CommandGroup>
                                            {universitiesOptions.map((university) => (
                                                <CommandItem
                                                    key={university.value}
                                                    value={university.value}
                                                    onSelect={(currentValue) => {
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            university: currentValue
                                                        }));
                                                        setOpen(false);
                                                    }}
                                                >
                                                    <CheckIcon
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            formData.university === university.value
                                                                ? "opacity-100"
                                                                : "opacity-0"
                                                        )}
                                                    />
                                                    {university.label}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>
                ) : (
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
                )}

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
                            disabled={isSubmitting}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select end year" />
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