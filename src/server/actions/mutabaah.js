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
    const session = await auth.api.getSession({ headers: headers() })
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
    const session = await auth.api.getSession({ headers: headers() })
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
    const session = await auth.api.getSession({ headers: headers() })
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
    const session = await auth.api.getSession({ headers: headers() })
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
    const session = await auth.api.getSession({ headers: headers() })
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

    let totalCompleted = 0
    let totalDays = 0

    Object.keys(weekData).forEach(date => {
      let dayCompleted = 0
      activities.forEach(activity => {
        if (weekData[date][activity.id]) {
          dayCompleted++
        }
      })
      
      if (dayCompleted === activities.length) {
        totalCompleted++
      }
      totalDays++
    })

    const isPassed = totalCompleted >= 5
    
    const finalResult = { 
      success: true, 
      weekData, 
      activities,
      totalCompleted,
      totalDays: 7,
      isPassed,
      result: isPassed ? "PASS" : "FAIL"
    }
    
    console.log('Final weekly result:', finalResult)
    
    return finalResult
  } catch (error) {
    console.error("Failed to get weekly mutabaah results:", error)
    return { success: false, error: "Failed to get weekly results" }
  }
}