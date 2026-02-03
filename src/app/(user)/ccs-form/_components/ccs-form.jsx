"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, AlertCircle, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import { submitCCSForm } from "@/server/actions/ccs-actions";
import { getUserDetails } from "@/server/actions/get-user-details";
import {
  BRANCH_OPTIONS,
  TAHAPAN_MUROBBI_OPTIONS,
  GENDER_OPTIONS,
  KATEGORI_MUTAROBBI_OPTIONS,
  STATUS_MUTAROBBI_OPTIONS,
  KENAL_TARBIYAH_OPTIONS,
  UMUR_TARBIYAH_OPTIONS,
  KAMPUS_MUTAROBBI_OPTIONS,
  TAHAP_PENDIDIKAN_OPTIONS,
  TAHUN_PENGAJIAN_OPTIONS,
  LEVEL_MUTAROBBI_OPTIONS,
  CLUSTER_OPTIONS,
  TAMBAH_KLUSTER_OPTIONS,
  CLUSTER_MAPPINGS,
} from "@/data/ccs-data";

// Custom zodResolver that handles errors properly
const safeZodResolver = (schema) => async (data) => {
  try {
    const values = await schema.parseAsync(data);
    return {
      values,
      errors: {},
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        values: {},
        errors: error.issues.reduce((acc, issue) => {
          const path = issue.path.join(".");
          acc[issue.path[0]] = {
            type: issue.code,
            message: issue.message,
          };
          return acc;
        }, {}),
      };
    }
    throw error;
  }
};

// Validation schema
const formSchema = z.object({
  // Section 1: Basic Information
  murobbiEmail: z.string().email("Email tidak sah"),
  murobbiName: z.string().min(1, "Nama diperlukan"),
  murobbiCawangan: z.string().min(1, "Cawangan diperlukan"),
  tahunDitarbiyah: z.coerce.number().min(1900, "Tahun tidak sah"),
  tahunMembina: z.coerce.number().min(1900, "Tahun tidak sah"),
  tempohMembina: z.coerce.number().min(0, "Tempoh tidak sah"),
  bilanganMutarobbi: z.coerce.number().min(0, "Bilangan tidak sah"),
  tahapanMurobbi: z.string().min(1, "Tahapan diperlukan"),

  // Section 2: Mutarobbi Information
  namaMutarobbi: z.string().min(1, "Nama mutarobbi diperlukan"),
  jantinaMutarobbi: z.string().min(1, "Jantina diperlukan"),
  kategoriMutarobbi: z.string().min(1, "Kategori diperlukan"),
  statusMutarobbi: z.string().min(1, "Status diperlukan"),
  kenalTarbiyah: z.string().min(1, "Pilihan diperlukan"),
  kenalTarbiyahOther: z.string().optional(),

  // Section 3: Date & Time
  tarikhMufaraqah: z.string().min(1, "Tarikh diperlukan"),
  masaMufaraqah: z.string().min(1, "Masa diperlukan"),

  // Section 4: Detailed Information
  umurTarbiyah: z.string().min(1, "Umur tarbiyah diperlukan"),
  kampusMutarobbi: z.string().min(1, "Kampus diperlukan"),
  kampusMutarobbiOther: z.string().optional(),
  tahapPendidikan: z.string().min(1, "Tahap pendidikan diperlukan"),
  tahapPendidikanOther: z.string().optional(),
  tahunPengajian: z.string().min(1, "Tahun pengajian diperlukan"),
  tahunPengajianOther: z.string().optional(),
  kursusMutarobbi: z.string().min(1, "Kursus diperlukan"),
  levelMutarobbi: z.string().min(1, "Level diperlukan"),

  // Section 5: Cluster Information
  fahamKluster: z.boolean().refine((val) => val === true, {
    message: "Sila tandakan untuk meneruskan",
  }),
  sebabUtama: z.string().min(1, "Sebab utama diperlukan"),
  subKluster: z.string().min(1, "Sub-kluster diperlukan"),
  keteranganKluster: z.string().optional(),
  tambahKluster: z.string().min(1, "Pilihan diperlukan"),
  sebabTambahan: z.string().optional(),
  subKluster2: z.string().optional(),
  keteranganTambahan: z.string().optional(),

  // Section 6: Final Information
  kitadaieId: z.string().optional(),
  mfaEmail: z.string().optional(),
  pengesahan: z.boolean().refine((val) => val === true, {
    message: "Pengesahan diperlukan untuk menghantar",
  }),
});

export function CCSForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subKlusterOptions, setSubKlusterOptions] = useState([]);
  const [subKluster2Options, setSubKluster2Options] = useState([]);
  const [userIdLookup, setUserIdLookup] = useState("");
  const [isLookingUp, setIsLookingUp] = useState(false);

  const form = useForm({
    resolver: safeZodResolver(formSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      murobbiEmail: "",
      murobbiName: "",
      murobbiCawangan: "",
      tahunDitarbiyah: "",
      tahunMembina: "",
      tempohMembina: "",
      bilanganMutarobbi: "",
      tahapanMurobbi: "",
      namaMutarobbi: "",
      jantinaMutarobbi: "",
      kategoriMutarobbi: "",
      statusMutarobbi: "",
      kenalTarbiyah: "",
      kenalTarbiyahOther: "",
      tarikhMufaraqah: "",
      masaMufaraqah: "",
      umurTarbiyah: "",
      kampusMutarobbi: "",
      kampusMutarobbiOther: "",
      tahapPendidikan: "",
      tahapPendidikanOther: "",
      tahunPengajian: "",
      tahunPengajianOther: "",
      kursusMutarobbi: "",
      levelMutarobbi: "",
      fahamKluster: false,
      sebabUtama: "",
      subKluster: "",
      keteranganKluster: "",
      tambahKluster: "",
      sebabTambahan: "",
      subKluster2: "",
      keteranganTambahan: "",
      kitadaieId: "",
      mfaEmail: "",
      pengesahan: false,
    },
  });

  // Watch fields for conditional logic
  const kenalTarbiyah = form.watch("kenalTarbiyah");
  const kampusMutarobbi = form.watch("kampusMutarobbi");
  const tahapPendidikan = form.watch("tahapPendidikan");
  const tahunPengajian = form.watch("tahunPengajian");
  const sebabUtama = form.watch("sebabUtama");
  const subKluster = form.watch("subKluster");
  const tambahKluster = form.watch("tambahKluster");
  const sebabTambahan = form.watch("sebabTambahan");
  const subKluster2 = form.watch("subKluster2");

  // Update sub-kluster options when sebabUtama changes
  useEffect(() => {
    if (sebabUtama) {
      const options = CLUSTER_MAPPINGS[sebabUtama] || [];
      setSubKlusterOptions(options);
      form.setValue("subKluster", "");
    }
  }, [sebabUtama, form]);

  // Update sub-kluster2 options when sebabTambahan changes
  useEffect(() => {
    if (sebabTambahan) {
      const options = CLUSTER_MAPPINGS[sebabTambahan] || [];
      setSubKluster2Options(options);
      form.setValue("subKluster2", "");
    }
  }, [sebabTambahan, form]);

  // Handle user lookup
  const handleUserLookup = async () => {
    if (!userIdLookup.trim()) {
      toast.error("Sila masukkan ID pengguna");
      return;
    }

    setIsLookingUp(true);
    try {
      const result = await getUserDetails(userIdLookup);

      if (result.success && result.data) {
        // Auto-fill the form fields
        form.setValue("murobbiEmail", result.data.email);
        form.setValue("murobbiName", result.data.name);
        form.setValue("murobbiCawangan", result.data.branch);
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error looking up user:", error);
      toast.error("Ralat semasa mencari pengguna");
    } finally {
      setIsLookingUp(false);
    }
  };

  // Field labels mapping for better error display
  const fieldLabels = {
    murobbiEmail: "1. Email",
    murobbiName: "2. Nama Penuh Murobbi",
    murobbiCawangan: "3. Murobbi dari Cawangan",
    tahunDitarbiyah: "4. Tahun anda mula ditarbiyah",
    tahunMembina: "5. Tahun anda mula membina",
    tempohMembina: "6. Tempoh pengalaman anda membina",
    bilanganMutarobbi: "7. Bilangan mutarobbi yang masih dihalaqohkan",
    tahapanMurobbi: "8. Tahapan murobbi",
    namaMutarobbi: "1. Nama penuh mutarobbi yang mufaraqah/dibuang",
    jantinaMutarobbi: "2. Jantina mutarobbi",
    kategoriMutarobbi: "3. Kategori mutarobbi",
    statusMutarobbi: "4. Status mutarobbi",
    kenalTarbiyah: "5. Mengenal tarbiyah secara",
    tarikhMufaraqah: "6. Tarikh Mufaraqah",
    masaMufaraqah: "7. Masa Mufaraqah",
    umurTarbiyah: "8. Umur tarbiyah sebelum mufaraqoh/dibuang",
    kampusMutarobbi: "9. Kampus mutarobbi",
    tahapPendidikan: "10. Tahap pendidikan tertinggi",
    tahunPengajian: "11. Tahun Pengajian",
    kursusMutarobbi: "12. Kursus Mutarobbi",
    levelMutarobbi: "13. Tahapan mutarobbi",
    fahamKluster: "Faham berkenaan kluster-kluster",
    sebabUtama: "14. Sebab utama mutarobbi tersebut mufaraqoh/dibuang",
    subKluster: "15. Sub-kluster",
    tambahKluster: "17. Sebab tambahan",
    pengesahan: "Pengesahan",
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const result = await submitCCSForm(data);

      if (result.success) {
        toast.success(result.message);
        form.reset();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onError = () => {
    // Show toast notification
    toast.error("Sila betulkan maklumat yang tidak lengkap atau tidak sah");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-8">
        {/* Section 1: Basic Information */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">a. Maklumat Asas Murobbi</h2>

          {/* User ID Lookup */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md space-y-3">
            <Label htmlFor="userIdLookup">
              ID Pengguna (Username atau Email)
            </Label>
            <p className="text-sm text-muted-foreground">
              Masukkan ID pengguna anda untuk auto-isi maklumat anda
            </p>
            <div className="flex gap-2">
              <Input
                id="userIdLookup"
                placeholder="Contoh: 1000 atau email@contoh.com"
                value={userIdLookup}
                onChange={(e) => setUserIdLookup(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleUserLookup();
                  }
                }}
              />
              <Button
                type="button"
                onClick={handleUserLookup}
                disabled={isLookingUp}
                className="flex-shrink-0"
              >
                {isLookingUp ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mencari...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Cari
                  </>
                )}
              </Button>
            </div>
          </div>

          <FormField
            control={form.control}
            name="murobbiEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>1. Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="email@contoh.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="murobbiName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>2. Nama Penuh Murobbi</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="murobbiCawangan"
            render={({ field }) => (
              <FormItem>
                <FormLabel>3. Murobbi dari Cawangan</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih cawangan" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {BRANCH_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tahunDitarbiyah"
            render={({ field }) => (
              <FormItem>
                <FormLabel>4. Tahun anda mula ditarbiyah</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Contoh: 2012" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tahunMembina"
            render={({ field }) => (
              <FormItem>
                <FormLabel>5. Tahun anda mula membina</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Contoh: 2013" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tempohMembina"
            render={({ field }) => (
              <FormItem>
                <FormLabel>6. Tempoh pengalaman anda membina (bulan)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Contoh: 20" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bilanganMutarobbi"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  7. Berapakah bilangan mutarobbi yang masih dihalaqohkan?
                </FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Contoh: 3" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tahapanMurobbi"
            render={({ field }) => (
              <FormItem>
                <FormLabel>8. Anda adalah murobbi pada tahapan:</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih tahapan" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {TAHAPAN_MUROBBI_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Section 2: Mutarobbi Information */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">b. Maklumat Mutarobbi</h2>

          <FormField
            control={form.control}
            name="namaMutarobbi"
            render={({ field }) => (
              <FormItem>
                <FormLabel>1. Nama penuh mutarobbi yang mufaraqah/dibuang</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="jantinaMutarobbi"
            render={({ field }) => (
              <FormItem>
                <FormLabel>2. Mutarobbi anda seorang</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jantina" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {GENDER_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="kategoriMutarobbi"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>3. Mutarobbi yang mufaraqah adalah:</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="flex flex-col space-y-1"
                  >
                    {KATEGORI_MUTAROBBI_OPTIONS.map((option) => (
                      <FormItem
                        key={option}
                        className="flex items-center space-x-3 space-y-0"
                      >
                        <FormControl>
                          <RadioGroupItem value={option} />
                        </FormControl>
                        <FormLabel className="font-normal">{option}</FormLabel>
                      </FormItem>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="statusMutarobbi"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>4. Mutarobbi tersebut:</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="flex flex-col space-y-1"
                  >
                    {STATUS_MUTAROBBI_OPTIONS.map((option) => (
                      <FormItem
                        key={option}
                        className="flex items-center space-x-3 space-y-0"
                      >
                        <FormControl>
                          <RadioGroupItem value={option} />
                        </FormControl>
                        <FormLabel className="font-normal">{option}</FormLabel>
                      </FormItem>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="kenalTarbiyah"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>5. Mutarobbi tersebut mengenal tarbiyah secara:</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="flex flex-col space-y-1"
                  >
                    {KENAL_TARBIYAH_OPTIONS.map((option) => (
                      <FormItem
                        key={option}
                        className="flex items-center space-x-3 space-y-0"
                      >
                        <FormControl>
                          <RadioGroupItem value={option} />
                        </FormControl>
                        <FormLabel className="font-normal">{option}</FormLabel>
                      </FormItem>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {kenalTarbiyah === "Lain-lain" && (
            <FormField
              control={form.control}
              name="kenalTarbiyahOther"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Nyatakan" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {/* Section 3: Date & Time */}
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Sila nyatakan tarikh dan masa status mutarobbi tersebut ditetapkan
          </div>

          <FormField
            control={form.control}
            name="tarikhMufaraqah"
            render={({ field }) => (
              <FormItem>
                <FormLabel>6. Tarikh Mufaraqah</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="masaMufaraqah"
            render={({ field }) => (
              <FormItem>
                <FormLabel>7. Masa Mufaraqah</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Section 4: Detailed Information */}
        <div className="space-y-4">
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-center text-sm">
              Sila berikan maklumat yang <strong>benar, sahih dan tepat</strong>{" "}
              untuk direkodkan berkenaan mutarobbi anda.
            </p>
          </div>

          <FormField
            control={form.control}
            name="umurTarbiyah"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>8. Umur tarbiyah sebelum mufaraqoh/dibuang:</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="flex flex-col space-y-1"
                  >
                    {UMUR_TARBIYAH_OPTIONS.map((option) => (
                      <FormItem
                        key={option}
                        className="flex items-center space-x-3 space-y-0"
                      >
                        <FormControl>
                          <RadioGroupItem value={option} />
                        </FormControl>
                        <FormLabel className="font-normal">{option}</FormLabel>
                      </FormItem>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="kampusMutarobbi"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>9. Mutarobbi tersebut merupakan kader kampus:</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="flex flex-col space-y-1"
                  >
                    {KAMPUS_MUTAROBBI_OPTIONS.map((option) => (
                      <FormItem
                        key={option}
                        className="flex items-center space-x-3 space-y-0"
                      >
                        <FormControl>
                          <RadioGroupItem value={option} />
                        </FormControl>
                        <FormLabel className="font-normal">{option}</FormLabel>
                      </FormItem>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {kampusMutarobbi === "Lain-lain" && (
            <FormField
              control={form.control}
              name="kampusMutarobbiOther"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Nyatakan" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="tahapPendidikan"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>10. Tahap pendidikan tertinggi:</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="flex flex-col space-y-1"
                  >
                    {TAHAP_PENDIDIKAN_OPTIONS.map((option) => (
                      <FormItem
                        key={option}
                        className="flex items-center space-x-3 space-y-0"
                      >
                        <FormControl>
                          <RadioGroupItem value={option} />
                        </FormControl>
                        <FormLabel className="font-normal">{option}</FormLabel>
                      </FormItem>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {tahapPendidikan === "Lain-lain" && (
            <FormField
              control={form.control}
              name="tahapPendidikanOther"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Nyatakan" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="tahunPengajian"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>11. Tahun Pengajian:</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="flex flex-col space-y-1"
                  >
                    {TAHUN_PENGAJIAN_OPTIONS.map((option) => (
                      <FormItem
                        key={option}
                        className="flex items-center space-x-3 space-y-0"
                      >
                        <FormControl>
                          <RadioGroupItem value={option} />
                        </FormControl>
                        <FormLabel className="font-normal">{option}</FormLabel>
                      </FormItem>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {tahunPengajian === "Lain-lain" && (
            <FormField
              control={form.control}
              name="tahunPengajianOther"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Nyatakan" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="kursusMutarobbi"
            render={({ field }) => (
              <FormItem>
                <FormLabel>12. Kursus Mutarobbi:</FormLabel>
                <FormControl>
                  <Input placeholder="Contoh: Kejuruteraan Elektrik" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="levelMutarobbi"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>13. Mutarobbi tersebut berada dalam tahapan:</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="flex flex-col space-y-1"
                  >
                    {LEVEL_MUTAROBBI_OPTIONS.map((option) => (
                      <FormItem
                        key={option}
                        className="flex items-center space-x-3 space-y-0"
                      >
                        <FormControl>
                          <RadioGroupItem value={option} />
                        </FormControl>
                        <FormLabel className="font-normal">{option}</FormLabel>
                      </FormItem>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Section 5: Cluster Information */}
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Berikut adalah kluster-kluster yang sedia ada, sebagai rujukan untuk
            memilih sebab yang sesuai mutarobbi tersebut mufaraqoh/dibuang
          </div>

          {/* 16 Clusters Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-border">
              <thead>
                <tr>
                  <th
                    colSpan="2"
                    className="border border-border bg-muted p-3 text-center"
                  >
                    16 Kluster Cabaran Dakwah
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr>
                  <td className="border border-border p-3 align-top">
                    <strong>1. Keluarga</strong>
                    <br />
                    <br />
                    Pelbagai masalah disebabkan oleh keluarga seperti paksaan,
                    tekanan, berbeza fahaman, latar belakang akademik, dipaksa
                    duduk rumah, ahli keluarga sakit, saudara mara mencampuri
                    urusan, anak bongsu/tunggal/sulung
                  </td>
                  <td className="border border-border p-3 align-top">
                    <strong>2. Ekonomi</strong>
                    <br />
                    <br />
                    Mahu mengejar kekayaan, tidak suka berbisnes, kena menanggung
                    ekonomi sendirian, bercorak fikiran makan gaji, mempunyai
                    masalah kewangan
                  </td>
                </tr>
                <tr>
                  <td className="border border-border p-3 align-top">
                    <strong>3. Jemaah</strong>
                    <br />
                    <br />
                    Keluarga sudah mempunyai jemaah, menyertai banyak jemaah,
                    golongan haba'ib/suka jemaah pondok/suka jadi berilmu
                    semata-mata
                  </td>
                  <td className="border border-border p-3 align-top">
                    <strong>4. Kawan-kawan</strong>
                    <br />
                    <br />
                    Pengaruh rakan sebilik/sekelas, mengikut teman sehalaqah yang
                    mufaraqah (ukhwah melampau)
                  </td>
                </tr>
                <tr>
                  <td className="border border-border p-3 align-top">
                    <strong>5. Akademik/Kerja</strong>
                    <br />
                    <br />
                    Mahu menjaga GPA, jadual padat, tidak mahu mengikut pengarahan
                    dakwah, masalah akademik
                  </td>
                  <td className="border border-border p-3 align-top">
                    <strong>6. Jawatan/Rumah/Cuti</strong>
                    <br />
                    <br />
                    Mahu mata merit, MPP/JTK, selesa di rumah masa cuti, tidak suka
                    rumah dakwah, futur
                  </td>
                </tr>
                <tr>
                  <td className="border border-border p-3 align-top">
                    <strong>7. Emosi/Jiwa/Perasaan</strong>
                    <br />
                    <br />
                    Merasa tidak layak/mampu, ego/tidak boleh ditegur, terlalu
                    banyak berfikir, terlampau mengikut perasaan (melankolik)
                  </td>
                  <td className="border border-border p-3 align-top">
                    <strong>8. Pengurusan Diri & Amanah</strong>
                    <br />
                    <br />
                    Tidak dibimbing, masalah pengurusan, kurang dimanfaatkan,
                    terlalu banyak beban
                  </td>
                </tr>
                <tr>
                  <td className="border border-border p-3 align-top">
                    <strong>9. Karat-karat Jahiliah</strong>
                    <br />
                    <br />
                    Suka berpasangan, suka permainan video, suka menonton filem,
                    suka menonton pornografi, merokok, LGBTQ
                  </td>
                  <td className="border border-border p-3 align-top">
                    <strong>10. Sikap/Kesungguhan</strong>
                    <br />
                    <br />
                    Suka bertangguh, masalah berulang walaupun sudah ditegur
                  </td>
                </tr>
                <tr>
                  <td className="border border-border p-3 align-top">
                    <strong>11. IQ/Personaliti</strong>
                    <br />
                    <br />
                    Terlampau bodoh, masalah skil komunikasi, terlampau tenang,
                    terlampau suka bersendirian
                  </td>
                  <td className="border border-border p-3 align-top">
                    <strong>12. Fitnah</strong>
                    <br />
                    <br />
                    Diserang mengejut, program tidak mendapat izin, dibasuh oleh
                    pihak atasan/senior/JTK
                  </td>
                </tr>
                <tr>
                  <td className="border border-border p-3 align-top">
                    <strong>13. Adab/Kethiqohan</strong>
                    <br />
                    <br />
                    Tidak taat, tidak menyelesaikan tugasan, tidak beradab (datang
                    lambat, tidak minta izin)
                  </td>
                  <td className="border border-border p-3 align-top">
                    <strong>14. Negeri</strong>
                    <br />
                    <br />
                    Bersifat kenegerian
                  </td>
                </tr>
                <tr>
                  <td className="border border-border p-3 align-top">
                    <strong>15. Kesihatan/Mental/Saka</strong>
                    <br />
                    <br />
                    Masalah mental/fizikal, komitmen ke hospital, disihir/saka/gangguan
                    jin
                  </td>
                  <td className="border border-border p-3 align-top">
                    <strong>16. Manja</strong>
                    <br />
                    <br />
                    Tidak diberi pengarahan sejak awal
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <FormField
            control={form.control}
            name="fahamKluster"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Saya sudah membaca dan faham berkenaan kluster-kluster
                    tersebut dan mahu meneruskan.
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sebabUtama"
            render={({ field }) => (
              <FormItem>
                <FormLabel>14. Sebab utama mutarobbi tersebut mufaraqoh/dibuang</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih sebab utama" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CLUSTER_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {sebabUtama && (
            <FormField
              control={form.control}
              name="subKluster"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    15. Sila tandakan sub-kluster yang sesuai untuk mutarobbi tersebut
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih sub-kluster" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subKlusterOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {(sebabUtama === "14. Negeri" || subKluster === "Lain-lain") && (
            <FormField
              control={form.control}
              name="keteranganKluster"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>16. Keterangan</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="Berikan keterangan yang jelas berdasarkan kluster yang dipilih"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="tambahKluster"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>
                  17. Adakah mutarobbi tersebut mempunyai sebab tambahan yang
                  menyebabkannya mufaraqoh/dibuang? (selain sebab utama yang telah
                  dinyatakan)
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="flex flex-row space-x-4"
                  >
                    {TAMBAH_KLUSTER_OPTIONS.map((option) => (
                      <FormItem
                        key={option}
                        className="flex items-center space-x-3 space-y-0"
                      >
                        <FormControl>
                          <RadioGroupItem value={option} />
                        </FormControl>
                        <FormLabel className="font-normal">{option}</FormLabel>
                      </FormItem>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {tambahKluster === "Ya" && (
            <>
              <FormField
                control={form.control}
                name="sebabTambahan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      18. Sebab tambahan mutarobbi tersebut mufaraqoh/dibuang
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih sebab tambahan" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CLUSTER_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {sebabTambahan && (
                <FormField
                  control={form.control}
                  name="subKluster2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        19. Sila tandakan sub-kluster tambahan yang sesuai untuk
                        mutarobbi tersebut
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih sub-kluster tambahan" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {subKluster2Options.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {(sebabTambahan === "14. Negeri" ||
                subKluster2 === "Lain-lain") && (
                  <FormField
                    control={form.control}
                    name="keteranganTambahan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>20. Keterangan Tambahan</FormLabel>
                        <FormControl>
                          <Textarea
                            rows={3}
                            placeholder="Berikan keterangan yang jelas berdasarkan kluster yang dipilih"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
            </>
          )}
        </div>

        {/* Section 6: Final Information */}
        <div className="space-y-4">
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-center text-sm">
              Pastikan anda telah memberikan maklumat sebaiknya sebelum menghantar
              borang.
            </p>
          </div>

          <FormField
            control={form.control}
            name="kitadaieId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>21. ID KitaDaie Mutarobbi (jika ada)</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="mfaEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>22. Email MyFundAction Mutarobbi (jika ada)</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="pengesahan"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Saya sudah menyemak keseluruhan borang ini dan mengesahkan
                    bahawa segala maklumat yang diisi adalah sahih, benar dan betul.
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
        </div>

        {/* Error Summary - Displayed above submit button */}
        {Object.keys(form.formState.errors).length > 0 && (
          <div className="p-4 bg-red-50 border border-red-300 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <h3 className="text-red-800 font-semibold mb-2">
                  Sila betulkan ralat berikut sebelum menghantar borang:
                </h3>
                <ul className="space-y-1 text-sm text-red-700">
                  {Object.entries(form.formState.errors).map(([fieldName, error]) => (
                    <li key={fieldName} className="flex items-start gap-2">
                      <span className="text-red-500 mt-0.5">•</span>
                      <span>
                        <strong>{fieldLabels[fieldName] || fieldName}:</strong> {error.message}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full"
          size="lg"
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? "Menghantar..." : "Submit"}
        </Button>
      </form>
    </Form>
  );
}
