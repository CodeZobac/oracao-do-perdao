import { addDays, differenceInCalendarDays, format, parseISO, startOfDay } from "date-fns";
import { getAffirmationForDay, getRoleForDay, RESET_HOUR, TOTAL_DAYS } from "./content";
import type { JourneySnapshot } from "./types";

export const STORAGE_KEY = "oracao.journey.v1";
export interface StoredJourney {
  version: 1;
  consentedAt: string;
  startDate: string;
  completions: Record<string, string>;
  resetCount: number;
  lastResetAt: string | null;
}

export function prayerDate(now: Date): Date {
  const date = startOfDay(now);
  return now.getHours() < RESET_HOUR ? addDays(date, -1) : date;
}
export function createJourney(now = new Date(), previous?: StoredJourney): StoredJourney {
  return {
    version: 1,
    consentedAt: previous?.consentedAt ?? now.toISOString(),
    startDate: format(prayerDate(now), "yyyy-MM-dd"),
    completions: {},
    resetCount: previous ? previous.resetCount + 1 : 0,
    lastResetAt: previous ? now.toISOString() : null,
  };
}
export function parseJourney(raw: string): StoredJourney {
  let value: StoredJourney;
  try { value = JSON.parse(raw) as StoredJourney; }
  catch { throw new Error("storageUnreadable"); }
  const validTimestamp = (date: unknown) => typeof date === "string" && Number.isFinite(Date.parse(date));
  if (!value || value.version !== 1 || !validTimestamp(value.consentedAt) ||
      typeof value.startDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value.startDate) ||
      !Number.isFinite(parseISO(value.startDate).getTime()) ||
      format(parseISO(value.startDate), "yyyy-MM-dd") !== value.startDate ||
      !Number.isInteger(value.resetCount) || value.resetCount < 0 ||
      !(value.lastResetAt === null || validTimestamp(value.lastResetAt)) ||
      !value.completions || typeof value.completions !== "object" || Array.isArray(value.completions) ||
      Object.entries(value.completions).some(([day, date]) => !/^[1-9]\d*$/.test(day) || Number(day) > TOTAL_DAYS || !validTimestamp(date))) {
    throw new Error("storageInvalid");
  }
  return value;
}
export function buildSnapshot(state: StoredJourney, now = new Date()): JourneySnapshot {
  const start = parseISO(state.startDate);
  const elapsed = differenceInCalendarDays(prayerDate(now), start) + 1;
  const active = Math.max(1, Math.min(TOTAL_DAYS, elapsed));
  const days = Array.from({ length: TOTAL_DAYS }, (_, index) => ({
    dayNumber: index + 1,
    scheduledDate: format(addDays(start, index), "yyyy-MM-dd"),
    roleType: getRoleForDay(index + 1),
    affirmationText: getAffirmationForDay(index + 1),
    completedAt: state.completions[String(index + 1)] ?? null,
  }));
  const completed = days.filter(day => day.completedAt).length;
  return {
    startedAt: state.startDate, endsAt: format(addDays(start, TOTAL_DAYS - 1), "yyyy-MM-dd"),
    completedThroughDay: completed, todayDayNumber: active, activeDayNumber: active,
    maxNavigableDay: TOTAL_DAYS, resetCount: state.resetCount, lastResetAt: state.lastResetAt,
    lastResetReason: state.lastResetAt ? "journeyRestarted" : null,
    isComplete: completed === TOTAL_DAYS, days,
  };
}
export function missedDays(state: StoredJourney, now = new Date()): number[] {
  const elapsed = Math.min(TOTAL_DAYS, differenceInCalendarDays(prayerDate(now), parseISO(state.startDate)));
  return Array.from({ length: Math.max(0, elapsed) }, (_, index) => index + 1)
    .filter(day => !state.completions[String(day)]);
}
export function toggleDay(state: StoredJourney, day: number, now = new Date()): StoredJourney {
  if (missedDays(state, now).length) throw new Error("resolveWarning");
  const elapsed = differenceInCalendarDays(prayerDate(now), parseISO(state.startDate)) + 1;
  if (!Number.isInteger(day) || day < 1 || day > TOTAL_DAYS || day > elapsed) {
    throw new Error("futureReadOnly");
  }
  const completions = { ...state.completions };
  if (completions[String(day)]) delete completions[String(day)];
  else completions[String(day)] = now.toISOString();
  return { ...state, completions };
}
export function confirmMissedDay(state: StoredJourney, now = new Date()): StoredJourney {
  const missed = missedDays(state, now);
  if (missed.length !== 1) throw new Error("confirmationExpired");
  return { ...state, completions: { ...state.completions, [String(missed[0])]: now.toISOString() } };
}
