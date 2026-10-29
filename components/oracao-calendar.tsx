"use client";

import confetti from "canvas-confetti";
import clsx from "clsx";
import { useMemo, useRef, useState } from "react";
import { format, parseISO } from "date-fns";
import { ptBR, enUS, it } from "date-fns/locale";
import { useLanguage } from "@/lib/language-context";
import type { Language, Message } from "@/lib/i18n";
import LanguageSwitcher from "./language-switcher";

import { buildPrayer, getAffirmationForDay, TOTAL_DAYS } from "@/lib/content";
import type { JourneyDay } from "@/lib/types";

import AppModal from "@/components/app-modal";
import { useJourney } from "@/lib/use-journey";

type ViewMode = "prayer" | "calendar";
type TextSize = "normal" | "large" | "xlarge";
type CycleFilter = "all" | "cycle-1" | "cycle-2" | "cycle-3";

const dateLocales = { "pt-BR": ptBR, en: enUS, it };
const datePatterns = {
  "pt-BR": { full: "d 'de' MMMM 'de' yyyy", header: "EEEE, d 'de' MMMM", completed: "d 'de' MMMM 'às' HH:mm" },
  en: { full: "MMMM d, yyyy", header: "EEEE, MMMM d", completed: "MMMM d 'at' HH:mm" },
  it: { full: "d MMMM yyyy", header: "EEEE d MMMM", completed: "d MMMM 'alle' HH:mm" },
};
function localizedDate(value: string, language: Language, kind: "full" | "header" | "completed") {
  try { return format(parseISO(value), datePatterns[language][kind], { locale: dateLocales[language] }); }
  catch { return value; }
}

function launchCelebration(isFinalDay: boolean) {
  if (typeof window === "undefined") {
    return;
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  const baseOptions = {
    spread: isFinalDay ? 130 : 85,
    startVelocity: isFinalDay ? 45 : 30,
    ticks: isFinalDay ? 450 : 250,
    scalar: isFinalDay ? 1.2 : 0.95,
    zIndex: 999,
  };

  confetti({
    ...baseOptions,
    origin: { x: 0.25, y: 0.7 },
    particleCount: isFinalDay ? 180 : 90,
  });
  confetti({
    ...baseOptions,
    origin: { x: 0.75, y: 0.7 },
    particleCount: isFinalDay ? 180 : 90,
  });

  if (isFinalDay) {
    window.setTimeout(() => {
      confetti({
        ...baseOptions,
        origin: { x: 0.5, y: 0.35 },
        particleCount: 240,
        gravity: 0.85,
      });
    }, 250);
  }
}

export default function OracaoCalendar() {
  const journey = useJourney();
  const { t } = useLanguage();
  if (!journey.ready) return <main className="p-6" aria-live="polite">{t("loading")}</main>;
  return <Calendar journey={journey} />;
}

function Calendar({ journey }: { journey: ReturnType<typeof useJourney> }) {
  const { snapshot } = journey;
  const { language, t } = useLanguage();
  const formatDayHeader = (date: string) => localizedDate(date, language, "header");
  const formatCompactDate = (date: string) => localizedDate(date, language, "full");
  const formatCompletedTimestamp = (date: string) => localizedDate(date, language, "completed");
  const [selectedDayNumber, setSelectedDayNumber] = useState(snapshot.activeDayNumber);
  const [viewMode, setViewMode] = useState<ViewMode>("prayer");
  const [cycleFilter, setCycleFilter] = useState<CycleFilter>("all");
  const [textSize, setTextSize] = useState<TextSize>("normal");
  const [focusMode, setFocusMode] = useState(false);
  const [copiedAffirmation, setCopiedAffirmation] = useState(false);
  const [statusMessage, setStatusMessage] = useState<Message | null>(null);
  const errorMessage = journey.error ? t(journey.error) : null;
  const prayerTopRef = useRef<HTMLDivElement | null>(null);

  const visibleDayNumber = Math.max(1, Math.min(selectedDayNumber, TOTAL_DAYS));
  const selectedDay: JourneyDay =
    snapshot.days.find((day) => day.dayNumber === visibleDayNumber) ?? snapshot.days[0];
  const prayer = useMemo(() => buildPrayer(selectedDay.roleType, language), [selectedDay.roleType, language]);
  const affirmationText = getAffirmationForDay(selectedDay.dayNumber, language);
  const isCompleted = Boolean(selectedDay.completedAt);
  const isFutureDay = selectedDay.scheduledDate > snapshot.days[snapshot.activeDayNumber - 1].scheduledDate;
  const canGoPrevious = visibleDayNumber > 1;
  const canGoNext = visibleDayNumber < TOTAL_DAYS;
  const progressPercentage = Math.round((snapshot.completedThroughDay / TOTAL_DAYS) * 100);
  const isFinalDay = selectedDay.dayNumber === TOTAL_DAYS;

  const todayLabel = format(new Date(), datePatterns[language].header, { locale: dateLocales[language] });

  const filteredCalendarDays = useMemo(() => {
    if (cycleFilter === "cycle-1") {
      return snapshot.days.slice(0, 30);
    }
    if (cycleFilter === "cycle-2") {
      return snapshot.days.slice(30, 60);
    }
    if (cycleFilter === "cycle-3") {
      return snapshot.days.slice(60, 90);
    }
    return snapshot.days;
  }, [snapshot.days, cycleFilter]);

  function handleToggleDay() {
    if (journey.toggle(selectedDay.dayNumber)) {
      setStatusMessage({ key: isCompleted ? "dayReopened" : "dayCompleted", values: { day: selectedDay.dayNumber } });
      if (!isCompleted) launchCelebration(snapshot.completedThroughDay + 1 === TOTAL_DAYS);
    }
  }

  function handleCopyAffirmation() {
    if (!navigator.clipboard) { setStatusMessage({ key: "copyFailed" }); return; }
    navigator.clipboard.writeText(affirmationText).then(() => {
      setCopiedAffirmation(true);
      window.setTimeout(() => setCopiedAffirmation(false), 2400);
    }).catch(() => setStatusMessage({ key: "copyFailed" }));
  }

  function selectDayFromCalendar(day: JourneyDay) {
    setSelectedDayNumber(day.dayNumber);
    setViewMode("prayer");
    window.setTimeout(() => {
      prayerTopRef.current?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "start",
      });
    }, 100);
  }

  return (
    <main className="app-frame flex min-h-screen w-full items-start justify-center px-3 py-4 sm:px-5 sm:py-6 lg:px-8 lg:py-8">
      <section className={clsx("focus-blur-target glass-panel soft-entrance relative flex w-full max-w-[1440px] flex-col overflow-hidden rounded-[2rem] px-4 py-5 sm:px-6 sm:py-6 lg:px-10 lg:py-8", focusMode && "is-blurred")}>
        {/* Brand header */}
        <div className="relative z-10 mb-6 flex flex-col items-center gap-3 border-b border-[var(--line)] pb-6 text-center sm:flex-row sm:flex-wrap sm:text-left">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt={t("brandAlt")} width={164} height={82} className="h-20 w-auto" />
          <div className="sm:ml-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent)] sm:text-sm">{t("prayerTitle")}</p>
            <p className="font-display text-4xl font-bold leading-tight tracking-tight text-[var(--foreground)] sm:text-5xl">Cristina Cairo</p>
          </div>
          <div className="sm:ml-auto"><LanguageSwitcher /></div>
        </div>
        {/* Subtle decorative glow highlights */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.85),transparent_70%)]" />
        <div className="pointer-events-none absolute -right-12 top-10 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(196,108,79,0.14),transparent_70%)] blur-2xl" />
        <div className="pointer-events-none absolute -left-12 bottom-12 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(73,103,83,0.12),transparent_70%)] blur-2xl" />

        {/* Global Header */}
        <header className="relative z-10 flex flex-col gap-5 border-b border-[var(--line)] pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-white/80 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--muted)] shadow-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--leaf)] animate-pulse" />
                {t("journeyTitle")}
              </span>
              <span className="text-xs text-[var(--muted)] font-medium">
                {t("todayPrefix")} {todayLabel}
              </span>
            </div>

            <div>
              <h1 className="font-display text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl lg:text-[3.4rem]">
                {t("calendarTitle")}
              </h1>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--muted)] sm:text-base">
                {t("subtitle")}
              </p>
            </div>
          </div>

          {/* Progress & Navigation Switcher */}
          <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center lg:flex-col lg:items-end">
            <div className="paper-panel flex w-full flex-col justify-center rounded-[1.3rem] px-4 py-3 sm:w-auto lg:min-w-[340px]">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                <span>{t("progress")}</span>
                <span className="font-bold text-[var(--foreground)]">
                  {snapshot.completedThroughDay}/{TOTAL_DAYS} {t("days")} ({progressPercentage}%)
                </span>
              </div>
              <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-[rgba(73,103,83,0.12)]">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,var(--leaf),var(--accent))] transition-[width] duration-700 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <div className="mt-2.5 flex items-center justify-between text-[11px] text-[var(--muted)]">
                <span>{t("currentDay")} <strong>{snapshot.activeDayNumber}</strong></span>
                <span>{t("remaining")} <strong>{TOTAL_DAYS - snapshot.completedThroughDay} {t("days")}</strong></span>
              </div>
            </div>

            {/* View Mode Buttons */}
            <nav className="inline-flex rounded-full border border-[var(--line)] bg-white/70 p-1 shadow-xs self-start sm:self-auto" aria-label={t("viewMode")}>
              <button
                type="button"
                onClick={() => setViewMode("prayer")}
                className={clsx(
                  "rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide transition cursor-pointer",
                  viewMode === "prayer"
                    ? "bg-[var(--foreground)] text-white shadow-xs"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]",
                )}
              >
                {t("dailyPrayer")}
              </button>
              <button
                type="button"
                onClick={() => setViewMode("calendar")}
                className={clsx(
                  "rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide transition cursor-pointer",
                  viewMode === "calendar"
                    ? "bg-[var(--foreground)] text-white shadow-xs"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]",
                )}
              >
                {t("map")}
              </button>
            </nav>
          </div>
        </header>

        {/* Notifications & System Messages */}
        <div className="relative z-10 mt-4 flex flex-col gap-3">
          {snapshot.lastResetReason ? (
            <div className="flex items-start gap-3 rounded-[1.2rem] border border-[rgba(196,108,79,0.3)] bg-[rgba(255,244,238,0.96)] p-3.5 text-sm leading-6 text-[var(--foreground)] shadow-xs">
              <span className="text-lg">⚠️</span>
              <div>
                <p className="font-semibold text-[var(--accent)]">{t("cycleRestarted")}</p>
                <p className="text-[var(--muted)]">{t("journeyRestarted")}</p>
              </div>
            </div>
          ) : null}

          {statusMessage ? (
            <div className="flex items-center justify-between rounded-[1.2rem] border border-[rgba(73,103,83,0.3)] bg-[rgba(244,252,246,0.96)] px-4 py-3 text-sm leading-6 text-[var(--leaf)] shadow-xs">
              <div className="flex items-center gap-2">
                <span>✨</span>
                <span className="font-medium">{t(statusMessage.key, statusMessage.values)}</span>
              </div>
              <button
                type="button"
                onClick={() => setStatusMessage(null)}
                className="text-xs font-bold text-[var(--muted)] hover:text-[var(--foreground)] cursor-pointer"
                aria-label={t("closeMessage")}
              >
                ✕
              </button>
            </div>
          ) : null}

          {errorMessage ? (
            <div className="flex items-center justify-between rounded-[1.2rem] border border-[rgba(196,108,79,0.3)] bg-[rgba(255,246,242,0.96)] px-4 py-3 text-sm leading-6 text-[var(--accent)] shadow-xs">
              <div className="flex items-center gap-2">
                <span>⚠️</span>
                <span className="font-medium">{errorMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => journey.setConsentOpen(true)}
                className="text-xs font-bold text-[var(--muted)] hover:text-[var(--foreground)] cursor-pointer"
                aria-label={t("storageInfo")}
              >
                {t("details")}
              </button>
            </div>
          ) : null}
        </div>

        {/* VIEW 1: PRAYER VIEW */}
        {viewMode === "prayer" ? (
          <div ref={prayerTopRef} className="relative z-10 mt-5 flex flex-col gap-5">
            {/* Day Bar & Navigation */}
            <div className="flex flex-col gap-3 rounded-[1.4rem] border border-[var(--line)] bg-white/70 p-3 sm:p-4 md:flex-row md:items-center md:justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedDayNumber((value) => Math.max(1, value - 1))}
                  disabled={!canGoPrevious}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] bg-white text-xl text-[var(--foreground)] transition hover:bg-[var(--panel-strong)] disabled:cursor-not-allowed disabled:opacity-30 shadow-xs cursor-pointer"
                  aria-label={t("previousDay")}
                >
                  ←
                </button>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--muted)]">
                      {t("day")} {selectedDay.dayNumber} {t("of")} {TOTAL_DAYS}
                    </span>
                    {selectedDay.dayNumber === snapshot.activeDayNumber && (
                      <span className="rounded-full bg-[rgba(73,103,83,0.12)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--leaf)]">
                        {t("today")}
                      </span>
                    )}
                  </div>
                  <h2 className="font-display text-2xl font-semibold capitalize text-[var(--foreground)] sm:text-3xl">
                    {formatDayHeader(selectedDay.scheduledDate)}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedDayNumber((value) => Math.min(snapshot.maxNavigableDay, value + 1))}
                  disabled={!canGoNext}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] bg-white text-xl text-[var(--foreground)] transition hover:bg-[var(--panel-strong)] disabled:cursor-not-allowed disabled:opacity-30 shadow-xs cursor-pointer"
                  aria-label={t("nextDay")}
                >
                  →
                </button>
              </div>

              {/* Status and Role Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={clsx(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider",
                    selectedDay.roleType === "pai"
                      ? "border border-[rgba(196,108,79,0.3)] bg-[rgba(196,108,79,0.1)] text-[var(--accent)]"
                      : "border border-[rgba(73,103,83,0.3)] bg-[rgba(73,103,83,0.1)] text-[var(--leaf)]",
                  )}
                >
                  <span>{selectedDay.roleType === "pai" ? "☀️" : "🌿"}</span>
                  {t(selectedDay.roleType === "pai" ? "dedicatedFather" : "dedicatedMother")}
                </span>

                <span
                  className={clsx(
                    "rounded-full px-3 py-1 text-xs font-semibold",
                    isCompleted
                      ? "border border-[rgba(73,103,83,0.3)] bg-[rgba(244,252,246,0.95)] text-[var(--leaf)]"
                      : "border border-[rgba(196,108,79,0.3)] bg-[rgba(255,247,242,0.95)] text-[var(--accent)]",
                  )}
                >
                  {isCompleted ? t("prayerComplete") : t("availablePrayer")}
                </span>

                {isFinalDay && (
                  <span className="rounded-full border border-[rgba(226,185,98,0.5)] bg-[rgba(226,185,98,0.2)] px-3 py-1 text-xs font-bold text-[rgba(122,88,18,0.95)]">
                    {t("celebration")}
                  </span>
                )}
              </div>
            </div>

            {/* Main Reading & Sidebar Layout */}
            <div
              className={clsx(
                "grid gap-6",
                "lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px]",
              )}
            >
              {/* Prayer Sanctuary Card */}
              <article
                className={clsx(
                  "paper-panel relative flex flex-col rounded-[2rem] p-6 sm:p-8 lg:p-10 transition-all",
                  isFinalDay && isCompleted && "finale-burst",
                )}
              >
                {/* Contemplation Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] pb-4 mb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                      {t("reading")}
                    </span>
                    <div className="inline-flex rounded-full border border-[var(--line)] bg-white/80 p-0.5 shadow-xs" role="group" aria-label={t("textSize")}>
                      <button
                        type="button"
                        onClick={() => setTextSize("normal")}
                        className={clsx(
                          "rounded-full px-2.5 py-1 text-xs font-bold transition cursor-pointer",
                          textSize === "normal" ? "bg-[var(--foreground)] text-white" : "text-[var(--muted)] hover:text-[var(--foreground)]",
                        )}
                        title={t("normalText")}
                      >
                        A
                      </button>
                      <button
                        type="button"
                        onClick={() => setTextSize("large")}
                        className={clsx(
                          "rounded-full px-2.5 py-1 text-xs font-bold transition cursor-pointer",
                          textSize === "large" ? "bg-[var(--foreground)] text-white" : "text-[var(--muted)] hover:text-[var(--foreground)]",
                        )}
                        title={t("largerText")}
                      >
                        A+
                      </button>
                      <button
                        type="button"
                        onClick={() => setTextSize("xlarge")}
                        className={clsx(
                          "rounded-full px-2.5 py-1 text-xs font-bold transition cursor-pointer",
                          textSize === "xlarge" ? "bg-[var(--foreground)] text-white" : "text-[var(--muted)] hover:text-[var(--foreground)]",
                        )}
                        title={t("largestText")}
                      >
                        A++
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFocusMode((prev) => !prev)}
                      className={clsx(
                        "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-xs font-semibold transition shadow-xs cursor-pointer",
                        focusMode
                          ? "border-[var(--leaf)] bg-[var(--leaf)] text-white"
                          : "border-[var(--line)] bg-white/80 text-[var(--foreground)] hover:bg-white",
                      )}
                    >
                      <span>{focusMode ? t("exitFocus") : t("focus")}</span>
                    </button>
                  </div>
                </div>

                {/* Prayer Title & Opening */}
                <div className="mb-6 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="h-px w-8 bg-[var(--accent)]" />
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--accent)]">
                      {prayer.title}
                    </p>
                  </div>

                  <h3 className="font-display text-3xl font-semibold leading-tight text-[var(--foreground)] sm:text-4xl lg:text-[2.9rem]">
                    {prayer.opening}
                  </h3>
                </div>

                {/* Prayer Verses */}
                <div
                  className={clsx(
                    "prayer-scroll space-y-4 text-[var(--foreground)]",
                    textSize === "normal" && "text-base sm:text-[1.06rem] leading-8 sm:leading-[2.1rem]",
                    textSize === "large" && "text-lg sm:text-[1.2rem] leading-9 sm:leading-[2.35rem]",
                    textSize === "xlarge" && "text-xl sm:text-[1.35rem] leading-10 sm:leading-[2.6rem]",
                  )}
                >
                  {prayer.paragraphs.map((paragraph, index) => (
                    <p
                      key={index}
                      className={clsx(
                        index === 0 && "drop-cap font-medium",
                        "transition-all duration-300",
                      )}
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>

                {/* Gentle footer in prayer box */}
                <div className="mt-10 flex items-center justify-between border-t border-[var(--line)] pt-5 text-xs text-[var(--muted)]">
                  <span className="italic">{t("quote")}</span>
                  <span>{t("amen")}</span>
                </div>
              </article>

              {/* Sidebar / Auxiliary Column */}
              {(
                <aside className="flex flex-col gap-5">
                  {/* Action Card: Complete / Reopen Day */}
                  <div
                    className={clsx(
                      "paper-panel rounded-[1.6rem] p-5 shadow-xs transition-all",
                      isCompleted
                        ? "border-[rgba(73,103,83,0.3)] bg-[rgba(248,253,249,0.98)]"
                        : "border-[rgba(73,103,83,0.35)] bg-white/90 breathing-glow",
                    )}
                  >
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[var(--muted)]">
                      <span>{isCompleted ? t("dayStatus") : t("completion")}</span>
                    </div>

                    <div className="mt-3">
                      {isCompleted ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-lg font-bold text-[var(--leaf)]">
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[rgba(73,103,83,0.15)] text-sm">
                              ✓
                            </span>
                            <span>{t("day")} {selectedDay.dayNumber} {t("completed")}</span>
                          </div>
                          <p className="text-sm leading-6 text-[var(--muted)]">
                            {t("completionNote")}
                          </p>
                          {selectedDay.completedAt && (
                            <p className="text-xs font-medium text-[var(--muted)]">
                              {t("recordedAt")} {formatCompletedTimestamp(selectedDay.completedAt)}.
                            </p>
                          )}
                          <button
                            type="button"
                            onClick={() => void handleToggleDay()}
                            disabled={isFutureDay}
                            className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-[var(--foreground)] underline underline-offset-2 transition cursor-pointer"
                          >
                            {t("uncomplete")}
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-sm leading-6 text-[var(--foreground)]">
                            {t("completeHelp")}
                          </p>
                          <button
                            type="button"
                            onClick={() => void handleToggleDay()}
                            disabled={isFutureDay}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,var(--leaf),#385241)] px-5 py-3.5 text-sm font-bold text-white shadow-md transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                          >
                            <span>🌿</span>
                            <span>{isFutureDay ? t("availableOnDay") : t("completeAction")}</span>
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 border-t border-[var(--line)] pt-3 text-[11px] leading-4.5 text-[var(--muted)]">
                      <span className="font-semibold text-[var(--foreground)]">{t("freeReading")}</span> {t("readingHelp")}
                    </div>
                  </div>

                  {/* Sacred Affirmation Card (Replacing previous photo block) */}
                  <div className="sacred-seal rounded-[1.6rem] p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.24em] text-[var(--accent)]">
                        <span>☀️</span>
                        {t("affirmation")}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyAffirmation}
                        className="inline-flex items-center gap-1 rounded-full border border-[var(--line)] bg-white/70 px-2.5 py-1 text-[11px] font-semibold text-[var(--muted)] transition hover:bg-white hover:text-[var(--foreground)] cursor-pointer"
                        title={t("copyTitle")}
                      >
                        {copiedAffirmation ? t("copied") : t("copy")}
                      </button>
                    </div>

                    <div className="mt-4 rounded-xl border border-[rgba(206,162,85,0.2)] bg-white/60 p-4 shadow-2xs">
                      <p className="font-display text-xl font-medium leading-snug text-[var(--foreground)] sm:text-2xl">
                        “{affirmationText}”
                      </p>
                    </div>

                    <p className="mt-3 text-xs leading-5 text-[var(--muted)]">
                      {t("affirmationHelp")}
                    </p>
                  </div>

                  {/* Journey Summary Box */}
                  <div className="paper-panel rounded-[1.6rem] p-5 shadow-xs text-xs space-y-2.5">
                    <p className="font-bold uppercase tracking-[0.2em] text-[var(--muted)]">
                      {t("journeyDetails")}
                    </p>
                    <div className="flex justify-between border-b border-[var(--line)] pb-1.5 text-[var(--muted)]">
                      <span>{t("startDate")}</span>
                      <span className="font-semibold text-[var(--foreground)]">{formatCompactDate(snapshot.startedAt)}</span>
                    </div>
                    <div className="flex justify-between border-b border-[var(--line)] pb-1.5 text-[var(--muted)]">
                      <span>{t("endDate")}</span>
                      <span className="font-semibold text-[var(--foreground)]">{formatCompactDate(snapshot.endsAt)}</span>
                    </div>
                    <div className="flex justify-between text-[var(--muted)]">
                      <span>{t("restarts")}</span>
                      <span className="font-semibold text-[var(--foreground)]">{snapshot.resetCount}</span>
                    </div>
                  </div>
                </aside>
              )}
            </div>
          </div>
        ) : (
          /* VIEW 2: 90-DAY JOURNEY MAP / CALENDAR GRID */
          <div className="relative z-10 mt-6 flex flex-col gap-6">
            {/* Calendar Controls */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[var(--line)] pb-4">
              <div>
                <h2 className="font-display text-2xl font-semibold text-[var(--foreground)] sm:text-3xl">
                  {t("fullMap")}
                </h2>
                <p className="text-xs text-[var(--muted)] sm:text-sm">
                  {t("mapHelp")}
                </p>
              </div>

              {/* Cycle Filter Pills */}
              <div className="inline-flex flex-wrap gap-1.5 rounded-xl border border-[var(--line)] bg-white/70 p-1">
                <button
                  type="button"
                  onClick={() => setCycleFilter("all")}
                  className={clsx(
                    "rounded-lg px-3 py-1 text-xs font-semibold transition cursor-pointer",
                    cycleFilter === "all"
                      ? "bg-[var(--foreground)] text-white shadow-xs"
                      : "text-[var(--muted)] hover:text-[var(--foreground)]",
                  )}
                >
                  {t("allDays")}
                </button>
                <button
                  type="button"
                  onClick={() => setCycleFilter("cycle-1")}
                  className={clsx(
                    "rounded-lg px-3 py-1 text-xs font-semibold transition cursor-pointer",
                    cycleFilter === "cycle-1"
                      ? "bg-[var(--foreground)] text-white shadow-xs"
                      : "text-[var(--muted)] hover:text-[var(--foreground)]",
                  )}
                >
                  {t("phase1")}
                </button>
                <button
                  type="button"
                  onClick={() => setCycleFilter("cycle-2")}
                  className={clsx(
                    "rounded-lg px-3 py-1 text-xs font-semibold transition cursor-pointer",
                    cycleFilter === "cycle-2"
                      ? "bg-[var(--foreground)] text-white shadow-xs"
                      : "text-[var(--muted)] hover:text-[var(--foreground)]",
                  )}
                >
                  {t("phase2")}
                </button>
                <button
                  type="button"
                  onClick={() => setCycleFilter("cycle-3")}
                  className={clsx(
                    "rounded-lg px-3 py-1 text-xs font-semibold transition cursor-pointer",
                    cycleFilter === "cycle-3"
                      ? "bg-[var(--foreground)] text-white shadow-xs"
                      : "text-[var(--muted)] hover:text-[var(--foreground)]",
                  )}
                >
                  {t("phase3")}
                </button>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--muted)]">
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-md bg-[rgba(73,103,83,0.2)] border border-[var(--leaf)]" />
                <span>{t("completed")}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-md bg-white border-2 border-[var(--accent)]" />
                <span>{t("selectedDay")}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-md bg-white border-2 border-[var(--leaf)]" />
                <span>{t("activeDay")}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-md bg-white border border-[var(--line)]" />
                <span>{t("availableDay")}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-[var(--accent)]">{t("fatherLegend")}</span>
                <span className="text-[11px] font-bold text-[var(--leaf)]">{t("motherLegend")}</span>
              </div>
            </div>

            {/* 90-Day Grid */}
            <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-10">
              {filteredCalendarDays.map((day) => {
                const dayCompleted = Boolean(day.completedAt);
                const isCurrent = day.dayNumber === selectedDay.dayNumber;
                const isTodayActive = day.dayNumber === snapshot.activeDayNumber;

                return (
                  <button
                    key={day.dayNumber}
                    type="button"
                    onClick={() => selectDayFromCalendar(day)}
                    className={clsx(
                      "relative flex flex-col items-center justify-between rounded-xl p-2.5 text-center transition-all duration-200 cursor-pointer",
                      isCurrent && "ring-2 ring-[var(--accent)] shadow-sm scale-105 z-10",
                      dayCompleted
                        ? "bg-[rgba(244,252,246,0.95)] border border-[rgba(73,103,83,0.3)] text-[var(--leaf)] hover:bg-[rgba(235,249,238,1)]"
                        : isTodayActive
                          ? "bg-white border-2 border-[var(--leaf)] text-[var(--foreground)] shadow-xs hover:bg-[var(--panel-strong)]"
                          : "bg-white/80 border border-[var(--line)] text-[var(--foreground)] hover:bg-white hover:border-[rgba(196,108,79,0.35)]",
                    )}
                  >
                    <div className="flex w-full items-center justify-between text-[10px]">
                      <span className={clsx("font-bold", day.roleType === "pai" ? "text-[var(--accent)]" : "text-[var(--leaf)]")}>
                        {day.roleType === "pai" ? t("father") : t("mother")}
                      </span>
                      {dayCompleted ? (
                        <span className="text-[11px] font-bold text-[var(--leaf)]">✓</span>
                      ) : null}
                    </div>

                    <span className="my-1 font-display text-lg font-bold">
                      {day.dayNumber}
                    </span>

                    <span className="text-[9px] uppercase tracking-wider text-[var(--muted)]">
                      {day.scheduledDate ? format(parseISO(day.scheduledDate), language === "en" ? "MM/dd" : "dd/MM") : ""}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </section>
      {journey.corrupt && <div className="storage-notice" role="alert">
        <p>{errorMessage}</p>
        <button type="button" onClick={() => {
          if (window.confirm(t("resetConfirm"))) journey.resetCorrupt();
        }}>{t("resetLocal")}</button>
      </div>}
      {journey.consentOpen && <AppModal title={t("saveProgress")} onClose={() => journey.setConsentOpen(false)}>
        <h2 className="font-display text-3xl">{t("saveProgress")}</h2>
        <p>{t("consentIntro")}</p>
        <p>{t("consentData")}</p>
        <p>{t("consentPrivacy")}</p>
        {journey.error && <p role="alert">{errorMessage}</p>}
        <div className="modal-actions">
          <button type="button" onClick={journey.accept} disabled={journey.corrupt}>{t("accept")}</button>
          <button type="button" onClick={() => journey.setConsentOpen(false)}>{t("readOnly")}</button>
        </div>
      </AppModal>}
      {journey.warningOpen && journey.missed.length > 0 && !journey.consentOpen && <AppModal title={t("brokenSequence")} onClose={() => journey.setWarningOpen(false)}>
        <h2 className="font-display text-3xl">{t("brokenSequence")}</h2>
        <p>{journey.missed.length === 1
          ? t("missedOne", { day: journey.missed[0], date: formatCompactDate(snapshot.days[journey.missed[0] - 1].scheduledDate) })
          : t("missedMany", { count: journey.missed.length })}</p>
        <p>{t("practiceInfo")}</p>
        <p>{t("restartInfo")}</p>
        {journey.error && <p role="alert">{errorMessage}</p>}
        <div className="modal-actions">
          {journey.missed.length === 1 && <button type="button" onClick={() => journey.resolve(false)}>{t("didPrayer")}</button>}
          <button type="button" onClick={() => {
            journey.resolve(true);
            setSelectedDayNumber(1);
          }}>{t("restart")}</button>
        </div>
      </AppModal>}
      {focusMode && !journey.consentOpen && !journey.warningOpen && <AppModal title={prayer.title} className="focus-modal" onClose={() => setFocusMode(false)}>
        <p className="text-xs font-semibold uppercase tracking-widest text-[#a8472f]">{prayer.title}</p>
        <h2 className="font-display text-4xl font-medium text-[#1f1610]">{prayer.opening}</h2>
        <div className={clsx("space-y-6 leading-loose text-[#2a1f18]", textSize === "normal" ? "text-lg" : textSize === "large" ? "text-xl" : "text-2xl")}>
          {prayer.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
        </div>
      </AppModal>}
    </main>
  );
}