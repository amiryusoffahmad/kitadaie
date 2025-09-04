"use server"

import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function getMutabaahActivities() {
  try {
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

    console.log('Toggle mutabaah entry:', {
      userId: session.user.id,
      activityId,
      date,
      completed
    })

    const existingEntry = await db("mutabaah_entries")
      .select()
      .where("user_id", session.user.id)
      .where("activity_id", activityId)
      .where("date", date)
      .first()

    console.log('Existing entry found:', existingEntry)

    if (existingEntry) {
      const updateResult = await db("mutabaah_entries")
        .update({ completed: completed ? 1 : 0 })
        .where("id", existingEntry.id)
      console.log('Update result:', updateResult)
    } else {
      const insertData = {
        user_id: session.user.id,
        activity_id: activityId,
        date: date,
        completed: completed ? 1 : 0
      }
      console.log('Inserting new entry:', insertData)
      
      const insertResult = await db("mutabaah_entries")
        .insert(insertData)
      console.log('Insert result:', insertResult)
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

    return { success: true, settings: settings || { end_of_week: 0 } }
  } catch (error) {
    console.error("Failed to get mutabaah settings:", error)
    return { success: false, error: "Failed to get settings" }
  }
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

    console.log('Fetching weekly results for user:', session.user.id, 'from', startDate, 'to', endDate)

    const entries = await db("mutabaah_entries")
      .select({
        date: "date",
        activity_id: "activity_id",
        completed: "completed",
        activity_name: "mutabaah_activities.name"
      })
      .leftJoin("mutabaah_activities", "mutabaah_entries.activity_id", "mutabaah_activities.id")
      .where("mutabaah_entries.user_id", session.user.id)
      .where("mutabaah_entries.date", ">=", startDate)
      .where("mutabaah_entries.date", "<=", endDate)
      .orderBy("date")

    console.log('Found entries:', entries)

    const activities = await db("mutabaah_activities")
      .select()
      .orderBy("id")

    console.log('Activities:', activities)

    const weekData = {}
    const currentDate = new Date(startDate)
    const endDateObj = new Date(endDate)

    while (currentDate <= endDateObj) {
      const dateStr = currentDate.toISOString().split('T')[0]
      weekData[dateStr] = {}
      
      activities.forEach(activity => {
        weekData[dateStr][activity.id] = false
      })

      currentDate.setDate(currentDate.getDate() + 1)
    }

    entries.forEach(entry => {
      // Convert the database date to YYYY-MM-DD format for comparison
      const entryDateStr = new Date(entry.date).toISOString().split('T')[0]
      console.log('Processing entry date:', entry.date, 'converted to:', entryDateStr)
      
      if (weekData[entryDateStr]) {
        weekData[entryDateStr][entry.activity_id] = entry.completed === 1
        console.log(`Set activity ${entry.activity_id} for date ${entryDateStr} to ${entry.completed === 1}`)
      } else {
        console.log(`Date ${entryDateStr} not found in weekData keys:`, Object.keys(weekData))
      }
    })

    // Calculate per-activity completion counts
    const activityResults = {}
    activities.forEach(activity => {
      activityResults[activity.id] = {
        name: activity.name,
        completedDays: 0,
        totalDays: 7,
        isPassed: false
      }
    })

    // Count completions per activity across all days
    Object.keys(weekData).forEach(date => {
      activities.forEach(activity => {
        if (weekData[date][activity.id]) {
          activityResults[activity.id].completedDays++
        }
      })
    })

    // Check if each activity passes (≥5 out of 7 days)
    let allActivitiesPassed = true
    activities.forEach(activity => {
      activityResults[activity.id].isPassed = activityResults[activity.id].completedDays >= 5
      if (!activityResults[activity.id].isPassed) {
        allActivitiesPassed = false
      }
    })

    const isPassed = allActivitiesPassed
    
    const finalResult = { 
      success: true, 
      weekData, 
      activities,
      activityResults,
      isPassed,
      result: isPassed ? "PASS" : "FAIL",
      totalDays: 7
    }
    
    console.log('Final weekly result:', finalResult)
    
    return finalResult
  } catch (error) {
    console.error("Failed to get weekly mutabaah results:", error)
    return { success: false, error: "Failed to get weekly results" }
  }
}

export async function updateMutabaahActivityDescriptions() {
  try {
    await db("mutabaah_activities")
      .update({ description: "" })
      .whereIn("id", [1, 2, 3, 4, 5])

    return { success: true, message: "Activity descriptions cleared successfully" }
  } catch (error) {
    console.error("Failed to update activity descriptions:", error)
    return { success: false, error: "Failed to update activity descriptions" }
  }
}

export async function getBiweeklyMutabaahSummary() {
  try {
    const headersList = await headers()
    const session = await auth.api.getSession({ headers: headersList })
    if (!session?.user) {
      return { success: false, error: "Not authenticated" }
    }

    // Get the last 2 weeks of data
    const endDate = new Date()
    const startDate = new Date(endDate)
    startDate.setDate(endDate.getDate() - 13) // 2 weeks = 14 days, so go back 13 days

    console.log('Fetching biweekly summary for user:', session.user.id, 'from', startDate.toISOString().split('T')[0], 'to', endDate.toISOString().split('T')[0])

    const entries = await db("mutabaah_entries")
      .select({
        date: "date",
        activity_id: "activity_id", 
        completed: "completed",
      })
      .where("mutabaah_entries.user_id", session.user.id)
      .where("mutabaah_entries.date", ">=", startDate.toISOString().split('T')[0])
      .where("mutabaah_entries.date", "<=", endDate.toISOString().split('T')[0])
      .orderBy("date")

    const activities = await db("mutabaah_activities")
      .select()
      .orderBy("id")

    // Create biweekly data structure
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

    // Fill in the actual data
    entries.forEach(entry => {
      const entryDateStr = new Date(entry.date).toISOString().split('T')[0]
      if (biweeklyData[entryDateStr]) {
        biweeklyData[entryDateStr][entry.activity_id] = entry.completed === 1
      }
    })

    // Calculate per-activity results (need ≥10 out of 14 days to pass)
    const activityResults = {}
    activities.forEach(activity => {
      activityResults[activity.id] = {
        name: activity.name,
        completedDays: 0,
        totalDays: 14,
        isPassed: false
      }
    })

    // Count completions per activity
    Object.keys(biweeklyData).forEach(date => {
      activities.forEach(activity => {
        if (biweeklyData[date][activity.id]) {
          activityResults[activity.id].completedDays++
        }
      })
    })

    // Check if each activity passes (≥10 out of 14 days = ~71%)
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
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
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

    // Get user settings to know when week ends
    const settings = await db("mutabaah_settings")
      .where("user_id", session.user.id)
      .first()
    
    const endOfWeekDay = settings?.end_of_week || 0 // Default to Sunday

    // Calculate two-week period that resets every 2 weeks
    const today = new Date()
    const currentDay = today.getDay()
    
    // Find the most recent end-of-week day
    let lastEndOfWeek = new Date(today)
    if (currentDay <= endOfWeekDay) {
      // This week's end of week hasn't passed yet, so use last week's
      lastEndOfWeek.setDate(today.getDate() - (7 - endOfWeekDay + currentDay))
    } else {
      // This week's end of week has passed
      lastEndOfWeek.setDate(today.getDate() - (currentDay - endOfWeekDay))
    }

    // Calculate which 2-week cycle we're in
    const epochStart = new Date('2024-01-01') // Reference date (Monday)
    const daysSinceEpoch = Math.floor((lastEndOfWeek - epochStart) / (1000 * 60 * 60 * 24))
    const weeksSinceEpoch = Math.floor(daysSinceEpoch / 7)
    const twoWeekCycle = Math.floor(weeksSinceEpoch / 2)
    
    // Calculate the start of current 2-week cycle
    const cycleStartWeek = twoWeekCycle * 2
    const cycleStart = new Date(epochStart)
    cycleStart.setDate(epochStart.getDate() + (cycleStartWeek * 7))
    
    // Calculate week 1 and week 2 ranges
    const week1Start = new Date(cycleStart)
    const week1End = new Date(cycleStart)
    week1End.setDate(week1Start.getDate() + 6)
    
    const week2Start = new Date(week1End)
    week2Start.setDate(week1End.getDate() + 1)
    const week2End = new Date(week2Start)
    week2End.setDate(week2Start.getDate() + 6)

    console.log('Weekly summaries calculation:', {
      today: today.toISOString().split('T')[0],
      endOfWeekDay,
      week1: `${week1Start.toISOString().split('T')[0]} to ${week1End.toISOString().split('T')[0]}`,
      week2: `${week2Start.toISOString().split('T')[0]} to ${week2End.toISOString().split('T')[0]}`
    })

    // Get data for both weeks
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
  // Get entries for this week
  const entries = await db("mutabaah_entries")
    .select({
      date: "date",
      activity_id: "activity_id", 
      completed: "completed",
    })
    .where("mutabaah_entries.user_id", userId)
    .where("mutabaah_entries.date", ">=", startDate.toISOString().split('T')[0])
    .where("mutabaah_entries.date", "<=", endDate.toISOString().split('T')[0])
    .orderBy("date")

  const activities = await db("mutabaah_activities")
    .select()
    .orderBy("id")

  // Create week data structure
  const weekData = {}
  let currentDate = new Date(startDate)
  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0]
    weekData[dateStr] = {}
    activities.forEach(activity => {
      weekData[dateStr][activity.id] = false
    })
    currentDate.setDate(currentDate.getDate() + 1)
  }

  // Fill in actual data
  entries.forEach(entry => {
    const entryDateStr = new Date(entry.date).toISOString().split('T')[0]
    if (weekData[entryDateStr]) {
      weekData[entryDateStr][entry.activity_id] = entry.completed === 1
    }
  })

  // Calculate per-activity results (need ≥5 out of 7 days to pass)
  const activityResults = {}
  activities.forEach(activity => {
    activityResults[activity.id] = {
      name: activity.name,
      completedDays: 0,
      totalDays: 7,
      isPassed: false
    }
  })

  // Count completions per activity
  Object.keys(weekData).forEach(date => {
    activities.forEach(activity => {
      if (weekData[date][activity.id]) {
        activityResults[activity.id].completedDays++
      }
    })
  })

  // Check if each activity passes (≥5 out of 7 days = ~71%)
  let allActivitiesPassed = true
  activities.forEach(activity => {
    activityResults[activity.id].isPassed = activityResults[activity.id].completedDays >= 5
    if (!activityResults[activity.id].isPassed) {
      allActivitiesPassed = false
    }
  })

  // Generate summary text
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

    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0) // Last day of the month

    console.log('Fetching monthly results for user:', session.user.id, 'for month:', month, 'year:', year)
    console.log('Date range:', startDate.toISOString().split('T')[0], 'to', endDate.toISOString().split('T')[0])

    const entries = await db("mutabaah_entries")
      .select({
        date: "date",
        activity_id: "activity_id",
        completed: "completed",
      })
      .where("mutabaah_entries.user_id", session.user.id)
      .where("mutabaah_entries.date", ">=", startDate.toISOString().split('T')[0])
      .where("mutabaah_entries.date", "<=", endDate.toISOString().split('T')[0])
      .orderBy("date")

    const activities = await db("mutabaah_activities")
      .select()
      .orderBy("id")

    console.log('Found entries for month:', entries.length)
    console.log('Activities found:', activities.length)

    const monthlyData = {}
    let currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0]
      monthlyData[dateStr] = {}
      activities.forEach(activity => {
        monthlyData[dateStr][activity.id] = false
      })
      currentDate.setDate(currentDate.getDate() + 1)
    }

    console.log('Total days in monthlyData:', Object.keys(monthlyData).length)
    console.log('Month data keys (first 5):', Object.keys(monthlyData).slice(0, 5))
    console.log('Month data keys (last 5):', Object.keys(monthlyData).slice(-5))

    entries.forEach(entry => {
      const entryDateStr = new Date(entry.date).toISOString().split('T')[0]
      if (monthlyData[entryDateStr]) {
        monthlyData[entryDateStr][entry.activity_id] = entry.completed === 1
      }
    })

    // Calculate per-activity completion counts for the month
    const activityResults = {}
    activities.forEach(activity => {
      activityResults[activity.id] = {
        name: activity.name,
        completedDays: 0,
        totalDays: Object.keys(monthlyData).length,
        isPassed: false
      }
    })

    // Count completions per activity across all days in month
    Object.keys(monthlyData).forEach(date => {
      activities.forEach(activity => {
        if (monthlyData[date][activity.id]) {
          activityResults[activity.id].completedDays++
        }
      })
    })

    // Check if each activity passes (≥70% of days in month)
    let allActivitiesPassed = true
    let totalDaysInMonth = Object.keys(monthlyData).length
    const passThreshold = Math.ceil(totalDaysInMonth * 0.7)
    
    activities.forEach(activity => {
      activityResults[activity.id].isPassed = activityResults[activity.id].completedDays >= passThreshold
      if (!activityResults[activity.id].isPassed) {
        allActivitiesPassed = false
      }
    })

    const isMonthPassed = allActivitiesPassed

    // Calculate overall completion for display purposes
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

    const result = {
      success: true,
      month: month,
      year: year,
      passedDays: overallCompletedDays, // For display in graph
      totalDays: totalDaysInMonth,
      passThreshold: passThreshold,
      isPassed: isMonthPassed,
      status: isMonthPassed ? "PASS" : "FAIL",
      activityResults: activityResults
    }
    
    console.log('Final monthly result:', result)
    
    return result
  } catch (error) {
    console.error("Failed to get monthly mutabaah results:", error)
    return { success: false, error: "Failed to get monthly results" }
  }
}