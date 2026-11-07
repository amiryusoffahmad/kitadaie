"use server"

import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

const MUTABAAH_ACTIVITY_NAMES = [
  "Tahajjud Prayer",
  "Fajr Jamaah Prayer",
  "Mathurat",
  "Dhuha Prayer",
  "100x Istighfar",
  "1 Juz Quran Recitation",
]

const isMamnuExemptActivity = (activity) => /mathurat|istighfar/i.test(activity.name)

const toDateKey = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

const parseDateKey = (dateKey) => new Date(`${dateKey}T00:00:00.000Z`)

const formatUtcDateKey = (date) => date.toISOString().slice(0, 10)

const addDaysToDateKey = (dateKey, days) => {
  const date = parseDateKey(dateKey)
  date.setUTCDate(date.getUTCDate() + days)
  return formatUtcDateKey(date)
}

const getDateKeysBetween = (startDate, endDate) => {
  const dates = []
  for (let date = startDate; date <= endDate; date = addDaysToDateKey(date, 1)) {
    dates.push(date)
  }
  return dates
}

async function getTrackedMutabaahActivities(query = db) {
  const activities = await query("mutabaah_activities").select().orderBy("id")
  return activities.slice(0, MUTABAAH_ACTIVITY_NAMES.length)
}

export async function getMutabaahActivities() {
  try {
    const activities = await getTrackedMutabaahActivities()

    return { success: true, activities }
  } catch (error) {
    console.error("Failed to get mutabaah activities:", error)
    return { success: false, error: "Failed to get activities" }
  }
}

export async function getMutabaahEntries(date) {
  try {
    const headersList = await headers()
    const session = await auth.api.getSession({ headers: headersList })
    if (!session?.user) {
      return { success: false, error: "Not authenticated" }
    }

    const entries = await db("mutabaah_entries")
      .select({
        id: "mutabaah_entries.id",
        activity_id: "mutabaah_entries.activity_id",
        completed: "mutabaah_entries.completed",
        name: "mutabaah_activities.name",
        description: "mutabaah_activities.description"
      })
      .leftJoin("mutabaah_activities", "mutabaah_entries.activity_id", "mutabaah_activities.id")
      .where("mutabaah_entries.user_id", session.user.id)
      .where("mutabaah_entries.date", date)

    return { success: true, entries }
  } catch (error) {
    console.error("Failed to get mutabaah entries:", error)
    return { success: false, error: "Failed to get entries" }
  }
}

export async function toggleMutabaahEntry(activityId, date, completed) {
  try {
    const headersList = await headers()
    const session = await auth.api.getSession({ headers: headersList })
    if (!session?.user) {
      return { success: false, error: "Not authenticated" }
    }

    const existingEntry = await db("mutabaah_entries")
      .select()
      .where("user_id", session.user.id)
      .where("activity_id", activityId)
      .where("date", date)
      .first()

    if (existingEntry) {
      await db("mutabaah_entries")
        .update({ completed: completed ? 1 : 0 })
        .where("id", existingEntry.id)
    } else {
      await db("mutabaah_entries")
        .insert({
          user_id: session.user.id,
          activity_id: activityId,
          date: date,
          completed: completed ? 1 : 0
        })
    }

    return { success: true }
  } catch (error) {
    console.error("Failed to toggle mutabaah entry:", error)
    return { success: false, error: "Failed to update entry" }
  }
}

export async function getMutabaahSettings() {
  try {
    const headersList = await headers()
    const session = await auth.api.getSession({ headers: headersList })
    if (!session?.user) {
      return { success: false, error: "Not authenticated" }
    }

    const settings = await db("mutabaah_settings")
      .select()
      .where("user_id", session.user.id)
      .first()

    const profile = await db("users_profile")
      .select("gender")
      .where("id", session.user.id)
      .first()

    return {
      success: true,
      settings: {
        ...(settings || { end_of_week: 0 }),
        is_female: ["female", "perempuan", "akhwat", "wanita"].includes((profile?.gender || "").toLowerCase())
      }
    }
  } catch (error) {
    console.error("Failed to get mutabaah settings:", error)
    return { success: false, error: "Failed to get settings" }
  }
}

export async function getMutabaahMamnuStatus(date) {
  try {
    const headersList = await headers()
    const session = await auth.api.getSession({ headers: headersList })
    if (!session?.user) return { success: false, error: "Not authenticated" }

    const profile = await db("users_profile").select("gender").where("id", session.user.id).first()
    const isFemale = ["female", "perempuan", "akhwat", "wanita"].includes((profile?.gender || "").toLowerCase())
    if (!isFemale) return { success: true, isFemale: false, isMamnu: false }

    const record = await db("mutabaah_mamnu_days")
      .where({ user_id: session.user.id, date })
      .first()
    return { success: true, isFemale: true, isMamnu: Boolean(record) }
  } catch (error) {
    console.error("Failed to get mamnu status:", error)
    return { success: false, error: "Failed to get mamnu status" }
  }
}

export async function toggleMutabaahMamnu(date, isMamnu) {
  try {
    const headersList = await headers()
    const session = await auth.api.getSession({ headers: headersList })
    if (!session?.user) return { success: false, error: "Not authenticated" }

    const profile = await db("users_profile").select("gender").where("id", session.user.id).first()
    const isFemale = ["female", "perempuan", "akhwat", "wanita"].includes((profile?.gender || "").toLowerCase())
    if (!isFemale) return { success: false, error: "Mamnu is only available for female users" }

    if (isMamnu) {
      await db("mutabaah_mamnu_days").insert({ user_id: session.user.id, date }).onConflict(["user_id", "date"]).ignore()
    } else {
      await db("mutabaah_mamnu_days").where({ user_id: session.user.id, date }).delete()
    }
    return { success: true, isMamnu }
  } catch (error) {
    console.error("Failed to toggle mamnu:", error)
    return { success: false, error: "Failed to update mamnu status" }
  }
}

async function getMamnuDays(userId, startDate, endDate) {
  const rows = await db("mutabaah_mamnu_days")
    .select("date")
    .where("user_id", userId)
    .where("date", ">=", startDate)
    .where("date", "<=", endDate)
  return rows.map((row) => typeof row.date === "string" ? row.date.slice(0, 10) : toDateKey(new Date(row.date)))
}

export async function updateMutabaahSettings(endOfWeek) {
  try {
    const headersList = await headers()
    const session = await auth.api.getSession({ headers: headersList })
    if (!session?.user) {
      return { success: false, error: "Not authenticated" }
    }

    const existingSettings = await db("mutabaah_settings")
      .select()
      .where("user_id", session.user.id)
      .first()

    if (existingSettings) {
      await db("mutabaah_settings")
        .update({ end_of_week: endOfWeek })
        .where("user_id", session.user.id)
    } else {
      await db("mutabaah_settings")
        .insert({
          user_id: session.user.id,
          end_of_week: endOfWeek
        })
    }

    return { success: true }
  } catch (error) {
    console.error("Failed to update mutabaah settings:", error)
    return { success: false, error: "Failed to update settings" }
  }
}

export async function getWeeklyMutabaahResults(startDate, endDate) {
  try {
    const headersList = await headers()
    const session = await auth.api.getSession({ headers: headersList })
    if (!session?.user) {
      return { success: false, error: "Not authenticated" }
    }

    const [entries, activities, mamnuDays] = await Promise.all([
      db("mutabaah_entries")
        .select(
          db.raw("DATE_FORMAT(??, '%Y-%m-%d') as date", ["mutabaah_entries.date"]),
          {
            activity_id: "mutabaah_entries.activity_id",
            completed: "mutabaah_entries.completed",
            activity_name: "mutabaah_activities.name"
          }
        )
        .leftJoin("mutabaah_activities", "mutabaah_entries.activity_id", "mutabaah_activities.id")
        .where("mutabaah_entries.user_id", session.user.id)
        .where("mutabaah_entries.date", ">=", startDate)
        .where("mutabaah_entries.date", "<=", endDate)
        .orderBy("date"),
      getTrackedMutabaahActivities(),
      getMamnuDays(session.user.id, startDate, endDate),
    ])

    const weekData = {}
    getDateKeysBetween(startDate, endDate).forEach((date) => {
      weekData[date] = {}
      activities.forEach(activity => {
        weekData[date][activity.id] = false
      })
    })

    entries.forEach(entry => {
      const entryDateStr = entry.date
      if (weekData[entryDateStr]) {
        weekData[entryDateStr][entry.activity_id] = entry.completed === 1
      }
    })

    const activityResults = {}
    activities.forEach(activity => {
      const totalDays = isMamnuExemptActivity(activity) ? 7 : 7 - mamnuDays.length
      activityResults[activity.id] = {
        name: activity.name,
        completedDays: 0,
        totalDays,
        isPassed: false
      }
    })

    Object.keys(weekData).forEach(date => {
      activities.forEach(activity => {
        if ((!mamnuDays.includes(date) || isMamnuExemptActivity(activity)) && weekData[date][activity.id]) {
          activityResults[activity.id].completedDays++
        }
      })
    })

    let allActivitiesPassed = true
    activities.forEach(activity => {
      const result = activityResults[activity.id]
      const threshold = mamnuDays.length > 0 && !isMamnuExemptActivity(activity) ? result.totalDays : 5
      result.isPassed = result.totalDays === 0 || result.completedDays >= threshold
      if (!activityResults[activity.id].isPassed) {
        allActivitiesPassed = false
      }
    })

    return {
      success: true,
      weekData,
      activities,
      activityResults,
      isPassed: allActivitiesPassed,
      result: allActivitiesPassed ? "PASS" : "FAIL",
      totalDays: 7,
      mamnuDays: mamnuDays.length
    }
  } catch (error) {
    console.error("Failed to get weekly mutabaah results:", error)
    return { success: false, error: "Failed to get weekly results" }
  }
}

export async function updateMutabaahActivityDescriptions() {
  try {
    await db.transaction(async (trx) => {
      let activities = await trx("mutabaah_activities").select().orderBy("id")

      while (activities.length < MUTABAAH_ACTIVITY_NAMES.length) {
        await trx("mutabaah_activities").insert({
          name: MUTABAAH_ACTIVITY_NAMES[activities.length],
          description: "",
        })
        activities = await trx("mutabaah_activities").select().orderBy("id")
      }

      for (const [index, activity] of activities
        .slice(0, MUTABAAH_ACTIVITY_NAMES.length)
        .entries()) {
        await trx("mutabaah_activities")
          .where({ id: activity.id })
          .update({
            name: MUTABAAH_ACTIVITY_NAMES[index],
            description: "",
          })
      }
    })

    return { success: true, message: "Mutabaah activities synchronized successfully" }
  } catch (error) {
    console.error("Failed to synchronize mutabaah activities:", error)
    return { success: false, error: "Failed to synchronize activities" }
  }
}

export async function getBiweeklyMutabaahSummary() {
  try {
    const headersList = await headers()
    const session = await auth.api.getSession({ headers: headersList })
    if (!session?.user) {
      return { success: false, error: "Not authenticated" }
    }

    const endDate = new Date()
    const startDate = new Date(endDate)
    startDate.setDate(endDate.getDate() - 13)

    const startStr = startDate.toISOString().split('T')[0]
    const endStr = endDate.toISOString().split('T')[0]

    const [entries, activities] = await Promise.all([
      db("mutabaah_entries")
        .select({ date: "date", activity_id: "activity_id", completed: "completed" })
        .where("mutabaah_entries.user_id", session.user.id)
        .where("mutabaah_entries.date", ">=", startStr)
        .where("mutabaah_entries.date", "<=", endStr)
        .orderBy("date"),
      getTrackedMutabaahActivities(),
    ])

    const biweeklyData = {}
    let currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0]
      biweeklyData[dateStr] = {}
      activities.forEach(activity => {
        biweeklyData[dateStr][activity.id] = false
      })
      currentDate.setDate(currentDate.getDate() + 1)
    }

    entries.forEach(entry => {
      const entryDateStr = new Date(entry.date).toISOString().split('T')[0]
      if (biweeklyData[entryDateStr]) {
        biweeklyData[entryDateStr][entry.activity_id] = entry.completed === 1
      }
    })

    const activityResults = {}
    activities.forEach(activity => {
      activityResults[activity.id] = {
        name: activity.name,
        completedDays: 0,
        totalDays: 14,
        isPassed: false
      }
    })

    Object.keys(biweeklyData).forEach(date => {
      activities.forEach(activity => {
        if (biweeklyData[date][activity.id]) {
          activityResults[activity.id].completedDays++
        }
      })
    })

    let allActivitiesPassed = true
    activities.forEach(activity => {
      activityResults[activity.id].isPassed = activityResults[activity.id].completedDays >= 10
      if (!activityResults[activity.id].isPassed) {
        allActivitiesPassed = false
      }
    })

    return {
      success: true,
      biweeklyData,
      activities,
      activityResults,
      isPassed: allActivitiesPassed,
      result: allActivitiesPassed ? "PASS" : "FAIL",
      totalDays: 14,
      startDate: startStr,
      endDate: endStr
    }
  } catch (error) {
    console.error("Failed to get biweekly mutabaah summary:", error)
    return { success: false, error: "Failed to get biweekly summary" }
  }
}

export async function getWeeklySummaries() {
  try {
    const headersList = await headers()
    const session = await auth.api.getSession({ headers: headersList })
    if (!session?.user) {
      return { success: false, error: "Not authenticated" }
    }

    const settings = await db("mutabaah_settings")
      .where("user_id", session.user.id)
      .first()

    const endOfWeekDay = settings?.end_of_week || 0

    const today = new Date()
    const todayDateKey = toDateKey(today)
    const currentDay = parseDateKey(todayDateKey).getUTCDay()
    const daysSinceWeekEnd = (currentDay - endOfWeekDay + 7) % 7 || 7
    const lastEndOfWeek = addDaysToDateKey(todayDateKey, -daysSinceWeekEnd)

    const epochStart = "2024-01-01"
    const daysSinceEpoch = Math.floor(
      (parseDateKey(lastEndOfWeek) - parseDateKey(epochStart)) / (1000 * 60 * 60 * 24)
    )
    const weeksSinceEpoch = Math.floor(daysSinceEpoch / 7)
    const twoWeekCycle = Math.floor(weeksSinceEpoch / 2)

    const cycleStartWeek = twoWeekCycle * 2
    const cycleStart = addDaysToDateKey(epochStart, cycleStartWeek * 7)
    const week1Start = cycleStart
    const week1End = addDaysToDateKey(week1Start, 6)
    const week2Start = addDaysToDateKey(week1End, 1)
    const week2End = addDaysToDateKey(week2Start, 6)

    const [week1Data, week2Data] = await Promise.all([
      getWeekData(session.user.id, week1Start, week1End),
      getWeekData(session.user.id, week2Start, week2End)
    ])

    return {
      success: true,
      week1: {
        ...week1Data,
        startDate: week1Start,
        endDate: week1End,
        weekNumber: 1
      },
      week2: {
        ...week2Data,
        startDate: week2Start,
        endDate: week2End,
        weekNumber: 2
      },
      cycleStart,
      cycleEnd: week2End
    }
  } catch (error) {
    console.error("Failed to get weekly summaries:", error)
    return { success: false, error: "Failed to get weekly summaries" }
  }
}

async function getWeekData(userId, startDate, endDate) {
  const [entries, activities, mamnuDays] = await Promise.all([
    db("mutabaah_entries")
      .select(
        db.raw("DATE_FORMAT(??, '%Y-%m-%d') as date", ["mutabaah_entries.date"]),
        { activity_id: "activity_id", completed: "completed" }
      )
      .where("mutabaah_entries.user_id", userId)
      .where("mutabaah_entries.date", ">=", startDate)
      .where("mutabaah_entries.date", "<=", endDate)
      .orderBy("date"),
    getTrackedMutabaahActivities(),
    getMamnuDays(userId, startDate, endDate),
  ])

  const weekData = {}
  getDateKeysBetween(startDate, endDate).forEach((date) => {
    weekData[date] = {}
    activities.forEach(activity => {
      weekData[date][activity.id] = false
    })
  })

  entries.forEach(entry => {
    const entryDateStr = entry.date
    if (weekData[entryDateStr]) {
      weekData[entryDateStr][entry.activity_id] = entry.completed === 1
    }
  })

  const activityResults = {}
  activities.forEach(activity => {
    const totalDays = isMamnuExemptActivity(activity) ? 7 : 7 - mamnuDays.length
    activityResults[activity.id] = {
      name: activity.name,
      completedDays: 0,
      totalDays,
      isPassed: false
    }
  })

  Object.keys(weekData).forEach(date => {
    activities.forEach(activity => {
      if ((!mamnuDays.includes(date) || isMamnuExemptActivity(activity)) && weekData[date][activity.id]) {
        activityResults[activity.id].completedDays++
      }
    })
  })

  let allActivitiesPassed = true
  activities.forEach(activity => {
    const result = activityResults[activity.id]
    const threshold = mamnuDays.length > 0 && !isMamnuExemptActivity(activity) ? result.totalDays : 5
    result.isPassed = result.totalDays === 0 || result.completedDays >= threshold
    if (!activityResults[activity.id].isPassed) {
      allActivitiesPassed = false
    }
  })

  const passedActivities = activities.filter(a => activityResults[a.id].isPassed)
  const failedActivities = activities.filter(a => !activityResults[a.id].isPassed)

  let summaryText = ""
  if (allActivitiesPassed) {
    summaryText = `Excellent week! All ${activities.length} activities passed. `
  } else if (passedActivities.length > failedActivities.length) {
    summaryText = `Good progress! ${passedActivities.length}/${activities.length} activities passed. `
  } else {
    summaryText = `Needs improvement. Only ${passedActivities.length}/${activities.length} activities passed. `
  }

  if (failedActivities.length > 0) {
    summaryText += `Focus on: ${failedActivities.map(a => a.name).join(', ')}.`
  }

  return {
    weekData,
    activities,
    activityResults,
    isPassed: allActivitiesPassed,
    result: allActivitiesPassed ? "PASS" : "FAIL",
    totalDays: 7,
    summaryText,
    passedActivities: passedActivities.length,
    totalActivities: activities.length,
    mamnuDays: mamnuDays.length
  }
}

export async function getMonthlyMutabaahResults(year, month) {
  try {
    const headersList = await headers()
    const session = await auth.api.getSession({ headers: headersList })
    if (!session?.user) {
      return { success: false, error: "Not authenticated" }
    }

    const startStr = `${year}-${String(month).padStart(2, "0")}-01`
    const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate()
    const endStr = `${year}-${String(month).padStart(2, "0")}-${String(daysInMonth).padStart(2, "0")}`

    const [entries, activities, mamnuDays] = await Promise.all([
      db("mutabaah_entries")
        .select(
          db.raw("DATE_FORMAT(??, '%Y-%m-%d') as date", ["mutabaah_entries.date"]),
          { activity_id: "activity_id", completed: "completed" }
        )
        .where("mutabaah_entries.user_id", session.user.id)
        .where("mutabaah_entries.date", ">=", startStr)
        .where("mutabaah_entries.date", "<=", endStr)
        .orderBy("date"),
      getTrackedMutabaahActivities(),
      getMamnuDays(session.user.id, startStr, endStr),
    ])

    const monthlyData = {}
    getDateKeysBetween(startStr, endStr).forEach((date) => {
      monthlyData[date] = {}
      activities.forEach(activity => {
        monthlyData[date][activity.id] = false
      })
    })

    entries.forEach(entry => {
      const entryDateStr = entry.date
      if (monthlyData[entryDateStr]) {
        monthlyData[entryDateStr][entry.activity_id] = entry.completed === 1
      }
    })

    const activityResults = {}
    activities.forEach(activity => {
      const totalDays = isMamnuExemptActivity(activity) ? Object.keys(monthlyData).length : Object.keys(monthlyData).length - mamnuDays.length
      activityResults[activity.id] = {
        name: activity.name,
        completedDays: 0,
        totalDays,
        isPassed: false
      }
    })

    Object.keys(monthlyData).forEach(date => {
      activities.forEach(activity => {
        if ((!mamnuDays.includes(date) || isMamnuExemptActivity(activity)) && monthlyData[date][activity.id]) {
          activityResults[activity.id].completedDays++
        }
      })
    })

    let allActivitiesPassed = true
    const totalDaysInMonth = Object.keys(monthlyData).length
    const passThreshold = Math.ceil(totalDaysInMonth * 0.7)

    activities.forEach(activity => {
      const result = activityResults[activity.id]
      const threshold = mamnuDays.length > 0 && !isMamnuExemptActivity(activity) ? result.totalDays : passThreshold
      result.isPassed = result.totalDays === 0 || result.completedDays >= threshold
      if (!activityResults[activity.id].isPassed) {
        allActivitiesPassed = false
      }
    })

    let overallCompletedDays = 0
    Object.keys(monthlyData).forEach(date => {
      let dayFullyCompleted = true
      activities.forEach(activity => {
        if (!monthlyData[date][activity.id]) {
          dayFullyCompleted = false
        }
      })
      if (dayFullyCompleted && activities.length > 0) {
        overallCompletedDays++
      }
    })

    return {
      success: true,
      month,
      year,
      passedDays: overallCompletedDays,
      totalDays: totalDaysInMonth,
      passThreshold,
      isPassed: allActivitiesPassed,
      status: allActivitiesPassed ? "PASS" : "FAIL",
      activityResults,
      mamnuDays: mamnuDays.length
    }
  } catch (error) {
    console.error("Failed to get monthly mutabaah results:", error)
    return { success: false, error: "Failed to get monthly results" }
  }
}
