"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { getRole } from "@/server/user/user.server";

/**
 * Get CCS statistics for dashboard
 * @param {object} filters - { dateFrom, dateTo }
 * @returns {Promise<{success: boolean, message: string, data?: object}>}
 */
export async function getCCSStats(filters = {}) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return {
        success: false,
        message: "Authentication required",
      };
    }

    // Check if user is admin
    const roleData = await getRole(session.user.id);
    if (roleData.role !== "admin") {
      return {
        success: false,
        message: "Unauthorized: Admin access required",
      };
    }

    // Total submissions
    const totalResult = await db("ccs_submissions")
      .count("* as count")
      .first();
    const total = totalResult.count;

    // Recent submissions (last 30 days) - based on tarikh_mufaraqah
    const recentResult = await db("ccs_submissions")
      .where("tarikh_mufaraqah", ">=", db.raw("DATE_SUB(CURDATE(), INTERVAL 30 DAY)"))
      .count("* as count")
      .first();
    const recent = recentResult.count;

    // Gender breakdown
    const genderBreakdown = await db("ccs_submissions")
      .select("mutarobbi_gender")
      .count("* as count")
      .groupBy("mutarobbi_gender");

    const ikhwah = genderBreakdown.find(
      (item) => item.mutarobbi_gender === "Ikhwah (Lelaki)"
    )?.count || 0;
    const akhwat = genderBreakdown.find(
      (item) => item.mutarobbi_gender === "Akhwat (Perempuan)"
    )?.count || 0;

    // Status breakdown
    const statusBreakdown = await db("ccs_submissions")
      .select("mutarobbi_status")
      .count("* as count")
      .groupBy("mutarobbi_status");

    const { dateFrom, dateTo } = filters;

    // Branch breakdown with optional date filtering
    let branchQuery = db("ccs_submissions")
      .select("murobbi_branch")
      .count("* as count");

    // Apply date filters if provided
    if (dateFrom) {
      branchQuery = branchQuery.where("tarikh_mufaraqah", ">=", dateFrom);
    }
    if (dateTo) {
      branchQuery = branchQuery.where("tarikh_mufaraqah", "<=", dateTo);
    }

    const branchBreakdown = await branchQuery
      .groupBy("murobbi_branch")
      .orderBy("count", "desc");

    return {
      success: true,
      message: "Stats retrieved successfully",
      data: {
        total,
        recent,
        gender: {
          ikhwah,
          akhwat,
        },
        status: statusBreakdown,
        branches: branchBreakdown,
      },
    };
  } catch (error) {
    console.error("Error getting CCS stats:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Get cluster distribution for pie chart
 * @param {object} filters - { dateFrom, dateTo }
 * @returns {Promise<{success: boolean, message: string, data?: array}>}
 */
export async function getClusterDistribution(filters = {}) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return {
        success: false,
        message: "Authentication required",
      };
    }

    // Check if user is admin
    const roleData = await getRole(session.user.id);
    if (roleData.role !== "admin") {
      return {
        success: false,
        message: "Unauthorized: Admin access required",
      };
    }

    const { dateFrom, dateTo } = filters;

    // Get distribution by main cluster (sebab_utama)
    let query = db("ccs_submissions")
      .select("sebab_utama")
      .count("* as count");

    // Apply date filters if provided
    if (dateFrom) {
      query = query.where("tarikh_mufaraqah", ">=", dateFrom);
    }
    if (dateTo) {
      query = query.where("tarikh_mufaraqah", "<=", dateTo);
    }

    const distribution = await query
      .groupBy("sebab_utama")
      .orderBy("count", "desc");

    // Get top 5 clusters with sub-cluster breakdown
    const top5Clusters = distribution.slice(0, 5);
    const detailedBreakdown = await Promise.all(
      top5Clusters.map(async (cluster) => {
        const subClusters = await db("ccs_submissions")
          .select("sub_kluster")
          .count("* as count")
          .where("sebab_utama", cluster.sebab_utama)
          .whereNotNull("sub_kluster")
          .groupBy("sub_kluster")
          .orderBy("count", "desc")
          .limit(5);

        return {
          cluster: cluster.sebab_utama,
          count: cluster.count,
          subClusters,
        };
      })
    );

    return {
      success: true,
      message: "Cluster distribution retrieved successfully",
      data: {
        distribution,
        detailedBreakdown,
      },
    };
  } catch (error) {
    console.error("Error getting cluster distribution:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Get mufaraqah trend data
 * @param {string} period - "monthly" or "weekly"
 * @returns {Promise<{success: boolean, message: string, data?: array}>}
 */
export async function getMufaraqahTrend(period = "monthly") {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return {
        success: false,
        message: "Authentication required",
      };
    }

    // Check if user is admin
    const roleData = await getRole(session.user.id);
    if (roleData.role !== "admin") {
      return {
        success: false,
        message: "Unauthorized: Admin access required",
      };
    }

    let trendData;

    if (period === "weekly") {
      // Last 12 weeks
      const result = await db.raw(`
        SELECT
          YEARWEEK(tarikh_mufaraqah, 1) as period,
          DATE(DATE_SUB(tarikh_mufaraqah, INTERVAL WEEKDAY(tarikh_mufaraqah) DAY)) as week_start,
          COUNT(*) as count
        FROM ccs_submissions
        WHERE tarikh_mufaraqah >= DATE_SUB(CURDATE(), INTERVAL 12 WEEK)
        GROUP BY period, week_start
        ORDER BY period ASC
      `);
      trendData = result[0];
    } else {
      // Last 12 months (default)
      const result = await db.raw(`
        SELECT
          DATE_FORMAT(tarikh_mufaraqah, '%Y-%m') as period,
          COUNT(*) as count
        FROM ccs_submissions
        WHERE tarikh_mufaraqah >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
        GROUP BY period
        ORDER BY period ASC
      `);
      trendData = result[0];
    }

    return {
      success: true,
      message: "Trend data retrieved successfully",
      data: trendData,
    };
  } catch (error) {
    console.error("Error getting mufaraqah trend:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Get paginated CCS submissions with filters
 * @param {object} params - { page, limit, search, dateFrom, dateTo, cluster, branch, gender, status, sortBy, sortOrder }
 * @returns {Promise<{success: boolean, message: string, data?: object}>}
 */
export async function getCCSSubmissionsPaginated(params = {}) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return {
        success: false,
        message: "Authentication required",
      };
    }

    // Check if user is admin
    const roleData = await getRole(session.user.id);
    if (roleData.role !== "admin") {
      return {
        success: false,
        message: "Unauthorized: Admin access required",
      };
    }

    const {
      page = 1,
      limit = 50,
      search = "",
      dateFrom = null,
      dateTo = null,
      cluster = null,
      branch = null,
      gender = null,
      status = null,
      sortBy = "created_at",
      sortOrder = "desc",
    } = params;

    // Build query
    let query = db("ccs_submissions");

    // Apply filters
    if (search) {
      query = query.where(function () {
        this.where("mutarobbi_name", "like", `%${search}%`)
          .orWhere("murobbi_name", "like", `%${search}%`)
          .orWhere("murobbi_email", "like", `%${search}%`);
      });
    }

    if (dateFrom) {
      query = query.where("tarikh_mufaraqah", ">=", dateFrom);
    }

    if (dateTo) {
      query = query.where("tarikh_mufaraqah", "<=", dateTo);
    }

    if (cluster) {
      query = query.where("sebab_utama", cluster);
    }

    if (branch) {
      query = query.where("murobbi_branch", branch);
    }

    if (gender) {
      query = query.where("mutarobbi_gender", gender);
    }

    if (status) {
      query = query.where("mutarobbi_status", status);
    }

    // Get total count
    const totalResult = await query.clone().count("* as count").first();
    const total = totalResult.count;
    const totalPages = Math.ceil(total / limit);

    // Get paginated data
    const submissions = await query
      .orderBy(sortBy, sortOrder)
      .limit(limit)
      .offset((page - 1) * limit);

    return {
      success: true,
      message: "Submissions retrieved successfully",
      data: {
        submissions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages,
        },
      },
    };
  } catch (error) {
    console.error("Error getting paginated submissions:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Export CCS submissions to CSV with filters
 * @param {object} filters - { search, dateFrom, dateTo, cluster, branch, gender, status }
 * @returns {Promise<{success: boolean, message: string, data?: string}>}
 */
export async function exportCCSToCSV(filters = {}) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return {
        success: false,
        message: "Authentication required",
      };
    }

    // Check if user is admin
    const roleData = await getRole(session.user.id);
    if (roleData.role !== "admin") {
      return {
        success: false,
        message: "Unauthorized: Admin access required",
      };
    }

    const {
      search = "",
      dateFrom = null,
      dateTo = null,
      cluster = null,
      branch = null,
      gender = null,
      status = null,
    } = filters;

    // Build query (same filters as pagination)
    let query = db("ccs_submissions");

    if (search) {
      query = query.where(function () {
        this.where("mutarobbi_name", "like", `%${search}%`)
          .orWhere("murobbi_name", "like", `%${search}%`)
          .orWhere("murobbi_email", "like", `%${search}%`);
      });
    }

    if (dateFrom) {
      query = query.where("tarikh_mufaraqah", ">=", dateFrom);
    }

    if (dateTo) {
      query = query.where("tarikh_mufaraqah", "<=", dateTo);
    }

    if (cluster) {
      query = query.where("sebab_utama", cluster);
    }

    if (branch) {
      query = query.where("murobbi_branch", branch);
    }

    if (gender) {
      query = query.where("mutarobbi_gender", gender);
    }

    if (status) {
      query = query.where("mutarobbi_status", status);
    }

    // Get all matching records
    const submissions = await query.orderBy("created_at", "desc");

    // Build CSV string
    const csvHeaders = [
      "ID",
      "Murobbi Name",
      "Murobbi Email",
      "Murobbi Branch",
      "Tahun Ditarbiyah",
      "Tahun Membina",
      "Tempoh Membina",
      "Bilangan Mutarobbi",
      "Tahapan Murobbi",
      "Mutarobbi Name",
      "Gender",
      "Kategori",
      "Status",
      "Kenal Tarbiyah",
      "Tarikh Mufaraqah",
      "Masa Mufaraqah",
      "Umur Tarbiyah",
      "Kampus",
      "Tahap Pendidikan",
      "Tahun Pengajian",
      "Kursus",
      "Level",
      "Sebab Utama",
      "Sub Kluster",
      "Keterangan",
      "Tambah Kluster",
      "Sebab Tambahan",
      "Sub Kluster 2",
      "Keterangan Tambahan",
      "KitaDaie ID",
      "MFA Email",
      "Created At",
    ];

    const escapeCsvValue = (value) => {
      if (value === null || value === undefined) return "";
      const stringValue = String(value);
      if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    const csvRows = [csvHeaders.join(",")];

    submissions.forEach((submission) => {
      const row = [
        submission.id,
        escapeCsvValue(submission.murobbi_name),
        escapeCsvValue(submission.murobbi_email),
        escapeCsvValue(submission.murobbi_branch),
        submission.tahun_ditarbiyah,
        submission.tahun_membina,
        submission.tempoh_membina,
        submission.bilangan_mutarobbi,
        escapeCsvValue(submission.tahapan_murobbi),
        escapeCsvValue(submission.mutarobbi_name),
        escapeCsvValue(submission.mutarobbi_gender),
        escapeCsvValue(submission.mutarobbi_category),
        escapeCsvValue(submission.mutarobbi_status),
        escapeCsvValue(submission.kenal_tarbiyah),
        submission.tarikh_mufaraqah,
        submission.masa_mufaraqah,
        submission.umur_tarbiyah,
        escapeCsvValue(submission.kampus_mutarobbi),
        escapeCsvValue(submission.tahap_pendidikan),
        escapeCsvValue(submission.tahun_pengajian),
        escapeCsvValue(submission.kursus_mutarobbi),
        escapeCsvValue(submission.level_mutarobbi),
        escapeCsvValue(submission.sebab_utama),
        escapeCsvValue(submission.sub_kluster),
        escapeCsvValue(submission.keterangan_kluster),
        escapeCsvValue(submission.tambah_kluster),
        escapeCsvValue(submission.sebab_tambahan),
        escapeCsvValue(submission.sub_kluster_2),
        escapeCsvValue(submission.keterangan_tambahan),
        escapeCsvValue(submission.kitadaie_id),
        escapeCsvValue(submission.mfa_email),
        submission.created_at,
      ];
      csvRows.push(row.join(","));
    });

    const csvString = csvRows.join("\n");

    return {
      success: true,
      message: `Exported ${submissions.length} records successfully`,
      data: csvString,
    };
  } catch (error) {
    console.error("Error exporting to CSV:", error);
    return { success: false, message: error.message };
  }
}
