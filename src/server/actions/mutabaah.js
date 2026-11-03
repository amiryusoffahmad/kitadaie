"use server"

import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { validDate, todayDate, addDays, monthRange, summaryCycle } from "@/features/mutabaah/dates.mjs"

export async function getMutabaahActivities() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) return { success: false, error: "Not authenticated" }
    const activities = await db("mutabaah_activities")
      .select()
      .orderBy("id")

    return { success: true, activities }
  } catch (error) {
    console.error("Failed to get mutabaah activities:", error)
    return { success: false, error: "Failed to get activities" }
  }
}

export async function getMutabaahEntries(date) {
  try {
    if (!validDate(date)) return { success: false, error: "Please select a valid date." }
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
    if (!Number.isInteger(activityId) || activityId < 1 || !validDate(date) || typeof completed !== "boolean") return { success: false, error: "Invalid activity or date." }
    const headersList = await headers()
    const session = await auth.api.getSession({ headers: headersList })
    if (!session?.user) {
      return { success: false, error: "Not authenticated" }
    }

    if (!await db("mutabaah_activities").where("id", activityId).first()) return { success: false, error: "Activity not found." }
    await db("mutabaah_entries")
      .insert({ user_id: session.user.id, activity_id: activityId, date, completed: completed ? 1 : 0 })
      .onConflict(["user_id", "activity_id", "date"])
      .merge({ completed: completed ? 1 : 0 })

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

    return { success: true, settings: settings || { end_of_week: 0 } }
  } catch (error) {
    console.error("Failed to get mutabaah settings:", error)
    return { success: false, error: "Failed to get settings" }
  }
}

export async function updateMutabaahSettings(endOfWeek) {
  try {
    if (!Number.isInteger(endOfWeek) || endOfWeek < 0 || endOfWeek > 6) return { success: false, error: "Invalid halaqah day." }
    const headersList = await headers()
    const session = await auth.api.getSession({ headers: headersList })
    if (!session?.user) {
      return { success: false, error: "Not authenticated" }
    }

    await db("mutabaah_settings")
      .insert({ user_id: session.user.id, end_of_week: endOfWeek })
      .onConflict("user_id").merge({ end_of_week: endOfWeek })

    return { success: true }
  } catch (error) {
    console.error("Failed to update mutabaah settings:", error)
    return { success: false, error: "Failed to update settings" }
  }
}

export async function getWeeklyMutabaahResults(startDate, endDate) {
  try {
    if (!validDate(startDate) || !validDate(endDate) || addDays(startDate, 6) !== endDate) return { success: false, error: "Invalid week range." }
    const headersList = await headers()
    const session = await auth.api.getSession({ headers: headersList })
    if (!session?.user) {
      return { success: false, error: "Not authenticated" }
    }

    const [entries, activities] = await Promise.all([
      db("mutabaah_entries")
        .select({
          date: db.raw("DATE_FORMAT(mutabaah_entries.date, '%Y-%m-%d')"),
          activity_id: "activity_id",
          completed: "completed",
          activity_name: "mutabaah_activities.name"
        })
        .leftJoin("mutabaah_activities", "mutabaah_entries.activity_id", "mutabaah_activities.id")
        .where("mutabaah_entries.user_id", session.user.id)
        .where("mutabaah_entries.date", ">=", startDate)
        .where("mutabaah_entries.date", "<=", endDate)
        .orderBy("date"),
      db("mutabaah_activities").select().orderBy("id"),
    ])

    const weekData = {}
    const currentDate = new Date(startDate)
    const endDateObj = new Date(endDate)

    while (currentDate <= endDateObj) {
      const dateStr = currentDate.toISOString().split('T')[0]
      weekData[dateStr] = {}
      activities.forEach(activity => {
        weekData[dateStr][activity.id] = false
      })
      currentDate.setUTCDate(currentDate.getUTCDate() + 1)
    }

    entries.forEach(entry => {
      const entryDateStr = entry.date
      if (weekData[entryDateStr]) {
        weekData[entryDateStr][entry.activity_id] = entry.completed === 1
      }
    })

    const activityResults = {}
    activities.forEach(activity => {
      activityResults[activity.id] = {
        name: activity.name,
        completedDays: 0,
        totalDays: 7,
        isPassed: false
      }
    })

    Object.keys(weekData).forEach(date => {
      activities.forEach(activity => {
        if (weekData[date][activity.id]) {
          activityResults[activity.id].completedDays++
        }
      })
    })

    let allActivitiesPassed = activities.length > 0
    activities.forEach(activity => {
      activityResults[activity.id].isPassed = activityResults[activity.id].completedDays >= 5
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
      totalDays: 7
    }
  } catch (error) {
    console.error("Failed to get weekly mutabaah results:", error)
    return { success: false, error: "Failed to get weekly results" }
  }
}

export async function getBiweeklyMutabaahSummary() {
  try {
    const headersList = await headers()
    const session = await auth.api.getSession({ headers: headersList })
    if (!session?.user) {
      return { success: false, error: "Not authenticated" }
    }

    const endDate = new Date(`${todayDate()}T00:00:00Z`)
    const startDate = new Date(`${addDays(todayDate(), -13)}T00:00:00Z`)

    const startStr = startDate.toISOString().split('T')[0]
    const endStr = endDate.toISOString().split('T')[0]

    const [entries, activities] = await Promise.all([
      db("mutabaah_entries")
        .select({ date: db.raw("DATE_FORMAT(mutabaah_entries.date, '%Y-%m-%d')"), activity_id: "activity_id", completed: "completed" })
        .where("mutabaah_entries.user_id", session.user.id)
        .where("mutabaah_entries.date", ">=", startStr)
        .where("mutabaah_entries.date", "<=", endStr)
        .orderBy("date"),
      db("mutabaah_activities").select().orderBy("id"),
    ])

    const biweeklyData = {}
    let currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0]
      biweeklyData[dateStr] = {}
      activities.forEach(activity => {
        biweeklyData[dateStr][activity.id] = false
      })
      currentDate.setUTCDate(currentDate.getUTCDate() + 1)
    }

    entries.forEach(entry => {
      const entryDateStr = entry.date
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

    let allActivitiesPassed = activities.length > 0
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

    const endOfWeekDay = settings?.end_of_week ?? 0
    const cycle = summaryCycle(todayDate(), endOfWeekDay)
    const cycleStart = new Date(`${cycle.start}T00:00:00Z`)
    const week1Start = cycleStart
    const week1End = new Date(`${cycle.week1End}T00:00:00Z`)
    const week2Start = new Date(`${cycle.week2Start}T00:00:00Z`)
    const week2End = new Date(`${cycle.end}T00:00:00Z`)

    const [week1Data, week2Data] = await Promise.all([
      getWeekData(session.user.id, week1Start, week1End),
      getWeekData(session.user.id, week2Start, week2End)
    ])

    return {
      success: true,
      week1: {
        ...week1Data,
        startDate: week1Start.toISOString().split('T')[0],
        endDate: week1End.toISOString().split('T')[0],
        weekNumber: 1
      },
      week2: {
        ...week2Data,
        startDate: week2Start.toISOString().split('T')[0],
        endDate: week2End.toISOString().split('T')[0],
        weekNumber: 2
      },
      cycleStart: cycleStart.toISOString().split('T')[0],
      cycleEnd: week2End.toISOString().split('T')[0]
    }
  } catch (error) {
    console.error("Failed to get weekly summaries:", error)
    return { success: false, error: "Failed to get weekly summaries" }
  }
}

async function getWeekData(userId, startDate, endDate) {
  const [entries, activities] = await Promise.all([
    db("mutabaah_entries")
      .select({ date: db.raw("DATE_FORMAT(mutabaah_entries.date, '%Y-%m-%d')"), activity_id: "activity_id", completed: "completed" })
      .where("mutabaah_entries.user_id", userId)
      .where("mutabaah_entries.date", ">=", startDate.toISOString().split('T')[0])
      .where("mutabaah_entries.date", "<=", endDate.toISOString().split('T')[0])
      .orderBy("date"),
    db("mutabaah_activities").select().orderBy("id"),
  ])

  const weekData = {}
  let currentDate = new Date(startDate)
  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0]
    weekData[dateStr] = {}
    activities.forEach(activity => {
      weekData[dateStr][activity.id] = false
    })
    currentDate.setUTCDate(currentDate.getUTCDate() + 1)
  }

  entries.forEach(entry => {
    const entryDateStr = entry.date
    if (weekData[entryDateStr]) {
      weekData[entryDateStr][entry.activity_id] = entry.completed === 1
    }
  })

  const activityResults = {}
  activities.forEach(activity => {
    activityResults[activity.id] = {
      name: activity.name,
      completedDays: 0,
      totalDays: 7,
      isPassed: false
    }
  })

  Object.keys(weekData).forEach(date => {
    activities.forEach(activity => {
      if (weekData[date][activity.id]) {
        activityResults[activity.id].completedDays++
      }
    })
  })

  let allActivitiesPassed = activities.length > 0
  activities.forEach(activity => {
    activityResults[activity.id].isPassed = activityResults[activity.id].completedDays >= 5
    if (!activityResults[activity.id].isPassed) {
      allActivitiesPassed = false
    }
  })

  const passedActivities = activities.filter(a => activityResults[a.id].isPassed)
  const failedActivities = activities.filter(a => !activityResults[a.id].isPassed)

  let summaryText = ""
  if (allActivitiesPassed) {
    summaryText = `🎉 Excellent week! All ${activities.length} activities passed. `
  } else if (passedActivities.length > failedActivities.length) {
    summaryText = `✅ Good progress! ${passedActivities.length}/${activities.length} activities passed. `
  } else {
    summaryText = `⚠️ Needs improvement. Only ${passedActivities.length}/${activities.length} activities passed. `
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
    totalActivities: activities.length
  }
}

export async function getMonthlyMutabaahResults(year, month) {
  try {
    const headersList = await headers()
    const session = await auth.api.getSession({ headers: headersList })
    if (!session?.user) {
      return { success: false, error: "Not authenticated" }
    }

    const range = monthRange(year, month)
    const startDate = new Date(`${range.start}T00:00:00Z`)
    const endDate = new Date(`${range.end}T00:00:00Z`)

    const startStr = startDate.toISOString().split('T')[0]
    const endStr = endDate.toISOString().split('T')[0]

    const [entries, activities] = await Promise.all([
      db("mutabaah_entries")
        .select({ date: db.raw("DATE_FORMAT(mutabaah_entries.date, '%Y-%m-%d')"), activity_id: "activity_id", completed: "completed" })
        .where("mutabaah_entries.user_id", session.user.id)
        .where("mutabaah_entries.date", ">=", startStr)
        .where("mutabaah_entries.date", "<=", endStr)
        .orderBy("date"),
      db("mutabaah_activities").select().orderBy("id"),
    ])

    const monthlyData = {}
    let currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0]
      monthlyData[dateStr] = {}
      activities.forEach(activity => {
        monthlyData[dateStr][activity.id] = false
      })
      currentDate.setUTCDate(currentDate.getUTCDate() + 1)
    }

    entries.forEach(entry => {
      const entryDateStr = entry.date
      if (monthlyData[entryDateStr]) {
        monthlyData[entryDateStr][entry.activity_id] = entry.completed === 1
      }
    })

    const activityResults = {}
    activities.forEach(activity => {
      activityResults[activity.id] = {
        name: activity.name,
        completedDays: 0,
        totalDays: Object.keys(monthlyData).length,
        isPassed: false
      }
    })

    Object.keys(monthlyData).forEach(date => {
      activities.forEach(activity => {
        if (monthlyData[date][activity.id]) {
          activityResults[activity.id].completedDays++
        }
      })
    })

    let allActivitiesPassed = activities.length > 0
    const totalDaysInMonth = Object.keys(monthlyData).length
    const passThreshold = Math.ceil(totalDaysInMonth * 0.7)

    activities.forEach(activity => {
      activityResults[activity.id].isPassed = activityResults[activity.id].completedDays >= passThreshold
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
      activityResults
    }
  } catch (error) {
    console.error("Failed to get monthly mutabaah results:", error)
    return { success: false, error: "Failed to get monthly results" }
  }
}
