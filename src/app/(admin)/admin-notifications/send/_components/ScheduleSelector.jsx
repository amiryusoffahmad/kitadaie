"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ScheduleSelector({ value, onChange }) {
  const handleScheduleTypeChange = (scheduleType) => {
    onChange({
      scheduleType,
      scheduledAt: null,
      recurrencePattern: null,
      recurrenceConfig: null,
    });
  };

  const handleScheduledAtChange = (e) => {
    onChange({
      ...value,
      scheduledAt: e.target.value,
    });
  };

  const handleRecurrencePatternChange = (pattern) => {
    onChange({
      ...value,
      recurrencePattern: pattern,
      recurrenceConfig: {
        time: "09:00",
        ...(pattern === "weekly" && { dayOfWeek: 1 }),
        ...(pattern === "monthly" && { dayOfMonth: 1 }),
      },
    });
  };

  const handleRecurrenceConfigChange = (key, newValue) => {
    onChange({
      ...value,
      recurrenceConfig: {
        ...value.recurrenceConfig,
        [key]: newValue,
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Label>When to Send</Label>
        <RadioGroup
          value={value.scheduleType}
          onValueChange={handleScheduleTypeChange}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="immediate" id="immediate" />
            <Label htmlFor="immediate" className="font-normal cursor-pointer">
              Send Immediately - Send as soon as you submit
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="scheduled" id="scheduled" />
            <Label htmlFor="scheduled" className="font-normal cursor-pointer">
              Schedule for Later - Send at a specific date and time
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="recurring" id="recurring" />
            <Label htmlFor="recurring" className="font-normal cursor-pointer">
              Recurring - Send automatically on a schedule
            </Label>
          </div>
        </RadioGroup>
      </div>

      {value.scheduleType === "scheduled" && (
        <div className="space-y-2">
          <Label htmlFor="scheduled-at">
            Date and Time <span className="text-destructive">*</span>
          </Label>
          <Input
            id="scheduled-at"
            type="datetime-local"
            value={value.scheduledAt || ""}
            onChange={handleScheduledAtChange}
            min={new Date().toISOString().slice(0, 16)}
            required
          />
          <p className="text-xs text-muted-foreground">
            Notification will be sent at the specified time
          </p>
        </div>
      )}

      {value.scheduleType === "recurring" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recurrence-pattern">
              Recurrence Pattern <span className="text-destructive">*</span>
            </Label>
            <Select
              value={value.recurrencePattern || ""}
              onValueChange={handleRecurrencePatternChange}
            >
              <SelectTrigger id="recurrence-pattern">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {value.recurrencePattern === "weekly" && (
            <div className="space-y-2">
              <Label htmlFor="day-of-week">Day of Week</Label>
              <Select
                value={value.recurrenceConfig?.dayOfWeek?.toString() || "1"}
                onValueChange={(val) =>
                  handleRecurrenceConfigChange("dayOfWeek", parseInt(val))
                }
              >
                <SelectTrigger id="day-of-week">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Sunday</SelectItem>
                  <SelectItem value="1">Monday</SelectItem>
                  <SelectItem value="2">Tuesday</SelectItem>
                  <SelectItem value="3">Wednesday</SelectItem>
                  <SelectItem value="4">Thursday</SelectItem>
                  <SelectItem value="5">Friday</SelectItem>
                  <SelectItem value="6">Saturday</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {value.recurrencePattern === "monthly" && (
            <div className="space-y-2">
              <Label htmlFor="day-of-month">Day of Month</Label>
              <Select
                value={value.recurrenceConfig?.dayOfMonth?.toString() || "1"}
                onValueChange={(val) =>
                  handleRecurrenceConfigChange("dayOfMonth", parseInt(val))
                }
              >
                <SelectTrigger id="day-of-month">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <SelectItem key={day} value={day.toString()}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {value.recurrencePattern && (
            <div className="space-y-2">
              <Label htmlFor="time">Time of Day</Label>
              <Input
                id="time"
                type="time"
                value={value.recurrenceConfig?.time || "09:00"}
                onChange={(e) =>
                  handleRecurrenceConfigChange("time", e.target.value)
                }
                required
              />
            </div>
          )}

          {value.recurrencePattern && (
            <div className="rounded-md bg-muted p-4">
              <p className="text-sm font-medium">Summary:</p>
              <p className="text-sm text-muted-foreground mt-1">
                {value.recurrencePattern === "daily" &&
                  `Send every day at ${value.recurrenceConfig?.time || "09:00"}`}
                {value.recurrencePattern === "weekly" &&
                  `Send every ${["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][value.recurrenceConfig?.dayOfWeek || 1]} at ${value.recurrenceConfig?.time || "09:00"}`}
                {value.recurrencePattern === "monthly" &&
                  `Send on day ${value.recurrenceConfig?.dayOfMonth || 1} of every month at ${value.recurrenceConfig?.time || "09:00"}`}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
