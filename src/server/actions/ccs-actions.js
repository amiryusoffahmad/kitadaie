"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

/**
 * Submit a CCS (Centralized Cluster System) form
 * @param {Object} formData - The form data to submit
 * @returns {Promise<{success: boolean, message: string, data?: any}>}
 */
export async function submitCCSForm(formData) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return {
        success: false,
        message: "Authentication required",
      };
    }

    // Prepare data for insertion
    const submissionData = {
      // Section 1: Basic Information
      murobbi_email: formData.murobbiEmail,
      murobbi_name: formData.murobbiName,
      murobbi_branch: formData.murobbiCawangan,
      tahun_ditarbiyah: formData.tahunDitarbiyah,
      tahun_membina: formData.tahunMembina,
      tempoh_membina: formData.tempohMembina,
      bilangan_mutarobbi: formData.bilanganMutarobbi,
      tahapan_murobbi: formData.tahapanMurobbi,

      // Section 2: Mutarobbi Information
      mutarobbi_name: formData.namaMutarobbi,
      mutarobbi_gender: formData.jantinaMutarobbi,
      mutarobbi_category: formData.kategoriMutarobbi,
      mutarobbi_status: formData.statusMutarobbi,
      kenal_tarbiyah: formData.kenalTarbiyah,
      kenal_tarbiyah_other: formData.kenalTarbiyahOther || null,

      // Section 3: Date & Time
      tarikh_mufaraqah: formData.tarikhMufaraqah,
      masa_mufaraqah: formData.masaMufaraqah,

      // Section 4: Detailed Information
      umur_tarbiyah: formData.umurTarbiyah,
      kampus_mutarobbi: formData.kampusMutarobbi,
      kampus_mutarobbi_other: formData.kampusMutarobbiOther || null,
      tahap_pendidikan: formData.tahapPendidikan,
      tahap_pendidikan_other: formData.tahapPendidikanOther || null,
      tahun_pengajian: formData.tahunPengajian,
      tahun_pengajian_other: formData.tahunPengajianOther || null,
      kursus_mutarobbi: formData.kursusMutarobbi,
      level_mutarobbi: formData.levelMutarobbi,

      // Section 5: Cluster Information
      sebab_utama: formData.sebabUtama,
      sub_kluster: formData.subKluster,
      keterangan_kluster: formData.keteranganKluster || null,
      tambah_kluster: formData.tambahKluster,
      sebab_tambahan: formData.sebabTambahan || null,
      sub_kluster_2: formData.subKluster2 || null,
      keterangan_tambahan: formData.keteranganTambahan || null,

      // Section 6: Final Information
      kitadaie_id: formData.kitadaieId || null,
      mfa_email: formData.mfaEmail || null,
    };

    // Insert into database
    const [insertId] = await db("ccs_submissions").insert(submissionData);

    // Revalidate the path if needed
    revalidatePath("/ccs-form");

    return {
      success: true,
      message: "Your submission was successful.",
      data: { id: insertId },
    };
  } catch (error) {
    console.error("Error submitting CCS form:", error);
    return {
      success: false,
      message: "Your submission failed because of an error.",
    };
  }
}

/**
 * Get all CCS submissions (admin only)
 * @returns {Promise<{success: boolean, message: string, data?: any}>}
 */
export async function getCCSSubmissions() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return {
        success: false,
        message: "Authentication required",
      };
    }

    // Check if user is admin
    if (session.user.role !== "admin") {
      return {
        success: false,
        message: "Unauthorized: Admin access required",
      };
    }

    const submissions = await db("ccs_submissions")
      .select("*")
      .orderBy("created_at", "desc");

    return {
      success: true,
      message: "Submissions retrieved successfully",
      data: submissions,
    };
  } catch (error) {
    console.error("Error fetching CCS submissions:", error);
    return {
      success: false,
      message: "Failed to fetch submissions",
    };
  }
}

/**
 * Get a single CCS submission by ID (admin only)
 * @param {number} id - The submission ID
 * @returns {Promise<{success: boolean, message: string, data?: any}>}
 */
export async function getCCSSubmission(id) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return {
        success: false,
        message: "Authentication required",
      };
    }

    // Check if user is admin
    if (session.user.role !== "admin") {
      return {
        success: false,
        message: "Unauthorized: Admin access required",
      };
    }

    const submission = await db("ccs_submissions")
      .where("id", id)
      .first();

    if (!submission) {
      return {
        success: false,
        message: "Submission not found",
      };
    }

    return {
      success: true,
      message: "Submission retrieved successfully",
      data: submission,
    };
  } catch (error) {
    console.error("Error fetching CCS submission:", error);
    return {
      success: false,
      message: "Failed to fetch submission",
    };
  }
}
