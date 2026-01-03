"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

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

  const form = useForm({
    resolver: zodResolver(formSchema),
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Section 1: Basic Information */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Maklumat Asas Murobbi</h2>

          <FormField
            control={form.control}
            name="murobbiEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
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
                <FormLabel>Nama Penuh Murobbi</FormLabel>
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
                <FormLabel>Murobbi dari Cawangan</FormLabel>
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
                <FormLabel>Tahun anda mula ditarbiyah</FormLabel>
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
                <FormLabel>Tahun anda mula membina</FormLabel>
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
                <FormLabel>Tempoh pengalaman anda membina (bulan)</FormLabel>
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
                  Berapakah bilangan mutarobbi yang masih dihalaqohkan?
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
                <FormLabel>Anda adalah murobbi pada tahapan:</FormLabel>
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
          <h2 className="text-lg font-semibold">Maklumat Mutarobbi</h2>

          <FormField
            control={form.control}
            name="namaMutarobbi"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama penuh mutarobbi yang mufaraqah/dibuang</FormLabel>
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
                <FormLabel>Mutarobbi anda seorang</FormLabel>
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
                <FormLabel>Mutarobbi yang mufaraqah adalah:</FormLabel>
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
                <FormLabel>Mutarobbi tersebut:</FormLabel>
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
                <FormLabel>Mutarobbi tersebut mengenal tarbiyah secara:</FormLabel>
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
                <FormLabel>Tarikh Mufaraqah</FormLabel>
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
                <FormLabel>Masa Mufaraqah</FormLabel>
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
                <FormLabel>Umur tarbiyah sebelum mufaraqoh/dibuang:</FormLabel>
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
                <FormLabel>Mutarobbi tersebut merupakan kader kampus:</FormLabel>
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
                <FormLabel>Tahap pendidikan tertinggi:</FormLabel>
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
                <FormLabel>Tahun Pengajian:</FormLabel>
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
                <FormLabel>Kursus Mutarobbi:</FormLabel>
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
                <FormLabel>Mutarobbi tersebut berada dalam tahapan:</FormLabel>
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
                <FormLabel>Sebab utama mutarobbi tersebut mufaraqoh/dibuang</FormLabel>
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
                    Sila tandakan sub-kluster yang sesuai untuk mutarobbi tersebut
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
                  <FormLabel>Keterangan</FormLabel>
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
                  Adakah mutarobbi tersebut mempunyai sebab tambahan yang
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
                      Sebab tambahan mutarobbi tersebut mufaraqoh/dibuang
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
                        Sila tandakan sub-kluster tambahan yang sesuai untuk
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
                      <FormLabel>Keterangan Tambahan</FormLabel>
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
                <FormLabel>ID KitaDaie Mutarobbi (jika ada)</FormLabel>
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
                <FormLabel>Email MyFundAction Mutarobbi (jika ada)</FormLabel>
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
