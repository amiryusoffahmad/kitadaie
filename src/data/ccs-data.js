/**
 * CCS (Centralized Cluster System) Form Data
 * Constants for cluster mappings and form select options
 */

// Branch options for Murobbi
export const BRANCH_OPTIONS = [
  "Utara",
  "Tengah",
  "Borneo",
  "Pantai Timur",
  "MEA",
  "ANZ",
  "Indonesia",
  "Afrika",
  "Europe",
];

// Tahapan Murobbi options
export const TAHAPAN_MUROBBI_OPTIONS = ["TDU", "TMA", "PG/GP"];

// Gender options
export const GENDER_OPTIONS = ["Ikhwah (Lelaki)", "Akhwat (Perempuan)"];

// Kategori Mutarobbi options
export const KATEGORI_MUTAROBBI_OPTIONS = [
  "Taklim Lepasan Sekolah (TLS)",
  "Taklim Lepasan Program Sekolah (TLP)",
  "Asasi Matrik (TMA)",
  "Halaqah Lepasan Matrik (HLM)",
  "Undergraduate (TDU)",
  "Postgraduate (Master/PhD)",
  "Graduan Profesional (GP)",
];

// Status Mutarobbi options
export const STATUS_MUTAROBBI_OPTIONS = [
  "Mufaraqah (Keluar halaqoh)",
  "Dibuang halaqoh",
  "Diturunkan tahapan (downgrade)",
];

// Kenal Tarbiyah options
export const KENAL_TARBIYAH_OPTIONS = [
  "Dalam talian (Online)",
  "Luar talian (Offline)",
  "Lain-lain",
];

// Umur Tarbiyah options
export const UMUR_TARBIYAH_OPTIONS = [
  "1 - 3 bulan",
  "3 - 6 bulan",
  "6 bulan - 1 tahun",
  "1 - 2 tahun",
  "2 - 5 tahun",
  "Lebih daripada 5 tahun",
  "kurang dari 1 bulan",
];

// Kampus Mutarobbi options
export const KAMPUS_MUTAROBBI_OPTIONS = [
  "Universiti Malaya (UM)",
  "Universiti Putra Malaysia (UPM)",
  "Universiti Kebangsaan Malaysia (UKM)",
  "Universiti Teknologi Petronas (UTP)",
  "Universiti Malaysia Sabah (UMS)",
  "Universiti Malaysia Sarawak (UniMaS)",
  "Universiti Sains Malaysia (USM)",
  "Universiti Malaysia Kelantan (UMK)",
  "Universiti Malaysia Pahang (UMP)",
  "Universiti Islam Antarabangsa (UIA)",
  "Lain-lain",
];

// Tahap Pendidikan options
export const TAHAP_PENDIDIKAN_OPTIONS = [
  "Asasi",
  "Lepasan Asasi/Matrikulasi (HLM)",
  "Sarjana Muda (Undergraduate - Degree)",
  "Lepasan Graduan (Postgraduate - Master, PhD)",
  "Graduan Profesional",
  "Diploma/Sijil Kemahiran",
  "Sijil Pelajaran Malaysia (SPM)",
  "Lain-lain",
];

// Tahun Pengajian options
export const TAHUN_PENGAJIAN_OPTIONS = ["1", "2", "3", "4", "5", "Lain-lain"];

// Level Mutarobbi options
export const LEVEL_MUTAROBBI_OPTIONS = [
  "YOSH",
  "TU lapisan B",
  "TU lapisan A",
  "TM Tier 1",
  "TM Tier 2",
  "TM Tier 3",
  "Taklim Qawiy",
  "Pemula Ula",
  "Pemula",
  "Pemula Qawiy",
  "Penggerak",
];

// Main cluster options (Sebab Utama & Sebab Tambahan)
export const CLUSTER_OPTIONS = [
  "1. Keluarga",
  "2. Ekonomi",
  "3. Jemaah",
  "4. Kawan-kawan",
  "5. Akademik/Pekerjaan",
  "6. Jawatan/Rumah/Cuti",
  "7. Emosi/Jiwa/Perasaan",
  "8. Pengurusan Diri & Amanah",
  "9. Karat-karat jahiliah (KKJ)",
  "10. Sikap/Kesungguhan",
  "11. IQ/Personaliti",
  "12. Fitnah",
  "13. Adab/Ketsiqohan",
  "14. Negeri",
  "15. Kesihatan/Mental/Saka",
  "16. Manja",
];

// Tambah Kluster options
export const TAMBAH_KLUSTER_OPTIONS = ["Ya", "Tidak"];

// Cluster to Sub-Cluster mappings
export const CLUSTER_MAPPINGS = {
  "": [],
  "1. Keluarga": [
    "Keluarga tiada fikrah/tiada latar belakang akademik/tidak bekerja",
    "Keluarga dari jemaah lain",
    "Keluarga latar belakang Islamik",
    "Ditekan supaya menyara keluarga",
    "Balik rumah, bercuti panjang (dihalang keluarga)",
    "Mengikut pilihan keluarga",
    "Menjaga ahli keluarga yang sakit",
    "Saudara-mara masuk campur dalam urusan",
    "Merupakan anak tunggal/sulung/bongsu",
    "Keluarga berkefahaman jahiliah",
    "Lain-lain",
  ],
  "2. Ekonomi": [
    "Mahu mengejar kekayaan",
    "Tidak suka berbisnes",
    "Bercorak fikiran makan gaji",
    "Mempunyai masalah kewangan",
    "Kena menampung ekonomi sendirian",
    "Lain-lain",
  ],
  "3. Jemaah": [
    "Keluarga sudah punya jemaah",
    "Menyertai banyak jemaah",
    "Golongan habaib/suka jemaah pondok/suka jadi berilmu semata-mata",
    "Lain-lain",
  ],
  "4. Kawan-kawan": [
    "Mengikut teman sehalaqoh yang mufaraqoh (ukhwah melampau)",
    "Terpengaruh dengan rakan sebilik dan/atau rakan sekelas",
    "Lain-lain",
  ],
  "5. Akademik/Pekerjaan": [
    "Mahu menjaga Purata Nilai Gred (GPA)",
    "Masalah akademik",
    "Jadual padat (masalah pengurusan masa)",
    "Tidak mahu mengikut pengarahan dakwah",
    "Lain-lain",
  ],
  "6. Jawatan/Rumah/Cuti": [
    "Mahu mendapatkan mata merit dan kolej",
    "Mahu menyertai MPP/JTK",
    "Selesa duduk rumah lama-lama masa cuti (tanpa dihalang keluarga)",
    "Tidak suka tinggal di rumah dakwah",
    "Futur",
    "Lain-lain",
  ],
  "7. Emosi/Jiwa/Perasaan": [
    "Merasa tidak layak/tidak mampu",
    "Ego/tak boleh ditegur",
    "Terlalu banyak berfikir/berfikiran rumit",
    "Terlampau mengikut perasaan (melancholic)",
    "Lain-lain",
  ],
  "8. Pengurusan Diri & Amanah": [
    "Terlalu banyak menanggung amanah dakwah",
    "Masalah pengurusan",
    "Tidak dibimbing dengan baik",
    "Kurang dimanfaatkan oleh dakwah",
    "Lain-lain",
  ],
  "9. Karat-karat jahiliah (KKJ)": [
    "Seronok berpasangan (couple)",
    "Suka permainan video (game)",
    "Suka menonton filem (movie)",
    "Suka menonton pornografi",
    "LGBTQ (Lesbian, Gay, Bisexual, Transgender, Queer)",
    "Merokok",
    "Lain-lain",
  ],
  "10. Sikap/Kesungguhan": [
    "Suka bertangguh",
    "Walaupun sudah ditegur, berulang kali masalah yang sama",
    "Lain-lain",
  ],
  "11. IQ/Personaliti": [
    "Terlampau bodoh (moron)",
    "Terlampau suka bersendiri (introvert)",
    "Masalah skil komunikasi",
    "Terlampau tenang (phlegmatic)",
    "Lain-lain",
  ],
  "12. Fitnah": [
    "Diserang mengejut (ambush)",
    "Program tidak mendapat izin (legal)",
    "Dibasuh oleh pihak atasan/pentadbiran/senior/jemaah lain/JTK",
    "Lain-lain",
  ],
  "13. Adab/Ketsiqohan": [
    "Tidak taat pengarahan murobbi/qiyadah",
    "Tidak menyelesaikan tugasan halaqoh",
    "Tidak meminta izin murobbi untuk balik rumah",
    "Datang lambat ke halaqoh",
    "Lain-lain",
  ],
  "14. Negeri": [
    "Perlis",
    "Kedah",
    "Pulau Pinang",
    "Perak",
    "Selangor",
    "Melaka",
    "Negeri Sembilan",
    "Johor",
    "Pahang",
    "Terengganu",
    "Kelantan",
    "Sarawak",
    "Sabah",
    "Wilayah Persekutuan Kuala Lumpur",
    "Wilayah Persekutuan Putrajaya",
    "Wilayah Persekutuan Labuan",
  ],
  "15. Kesihatan/Mental/Saka": [
    "Komitmen ke hospital",
    "Terkekang untuk aktif dalam dakwah kerana masalah fizikal",
    "Terkekang untuk aktif dalam dakwah kerana masalah mental",
    "Mempunyai saka/terkena gangguan jin/terkena sihir",
    "Merasa banyak menyusahkan ikhwah-akhwat (kerana masalah fizikal/mental yang dihidapi)",
    "Lain-lain",
  ],
  "16. Manja": ["Tak diberi pengarahan sejak awal", "Lain-lain"],
};
