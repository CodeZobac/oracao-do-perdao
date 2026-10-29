import type { RoleType } from "@/lib/content";

export interface JourneyDay {
  dayNumber: number;
  scheduledDate: string;
  roleType: RoleType;
  affirmationText: string;
  completedAt: string | null;
}

export interface JourneySnapshot {
  startedAt: string;
  endsAt: string;
  completedThroughDay: number;
  todayDayNumber: number;
  activeDayNumber: number;
  maxNavigableDay: number;
  resetCount: number;
  lastResetAt: string | null;
  lastResetReason: string | null;
  isComplete: boolean;
  days: JourneyDay[];
}

