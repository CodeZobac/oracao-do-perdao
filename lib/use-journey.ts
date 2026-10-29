"use client";

import { useEffect, useState } from "react";
import { buildSnapshot, confirmMissedDay, createJourney, missedDays, parseJourney, STORAGE_KEY, toggleDay, type StoredJourney } from "./journey";

import { errorKey, type MessageKey } from "./i18n";

export function useJourney() {
  const [state, setState] = useState<StoredJourney | null>(null);
  const [ready, setReady] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [consentOpen, setConsentOpen] = useState(false);
  const [warningOpen, setWarningOpen] = useState(false);
  const [error, setError] = useState<MessageKey | null>(null);
  const [corrupt, setCorrupt] = useState(false);

  useEffect(() => {
    const load = () => {
      const time = new Date();
      setNow(time);
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const stored = raw ? parseJourney(raw) : null;
        setState(stored);
        setCorrupt(false);
        setError(null);
        setConsentOpen(!stored);
        setWarningOpen(Boolean(stored && missedDays(stored, time).length));
      } catch (cause) {
        setError(errorKey(cause, "storageReadFailed"));
        setCorrupt(true);
        setState(null);
      }
      setReady(true);
    };
    load();
    const sync = (event: StorageEvent) => { if (event.key === STORAGE_KEY || event.key === null) load(); };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  useEffect(() => {
    const check = () => {
      const time = new Date();
      setNow(time);
      if (state && missedDays(state, time).length) setWarningOpen(true);
    };
    const visible = () => { if (document.visibilityState === "visible") check(); };
    const next = new Date();
    next.setHours(5, 0, 0, 0);
    if (next.getTime() <= Date.now()) next.setDate(next.getDate() + 1);
    const timeout = window.setTimeout(check, next.getTime() - Date.now() + 50);
    window.addEventListener("focus", check);
    document.addEventListener("visibilitychange", visible);
    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener("focus", check);
      document.removeEventListener("visibilitychange", visible);
    };
  }, [state, now]);

  function save(next: StoredJourney) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setState(next);
      setNow(new Date());
      setError(null);
      return true;
    } catch {
      setError("storageSaveFailed");
      return false;
    }
  }
  function latest() {
    setNow(new Date());
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const current = raw ? parseJourney(raw) : null;
      if (!current) { setState(null); setConsentOpen(true); }
      else setState(current);
      return current;
    } catch (cause) {
      setError(errorKey(cause, "savedReadFailed"));
      return null;
    }
  }
  function accept() {
    if (corrupt) return;
    setNow(new Date());
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const existing = parseJourney(raw);
        setState(existing);
        setConsentOpen(false);
        setWarningOpen(missedDays(existing).length > 0);
        return;
      }
    } catch (cause) {
      setError(errorKey(cause, "localReadFailed"));
      return;
    }
    if (save(createJourney())) setConsentOpen(false);
  }
  function toggle(day: number): boolean {
    if (!state) { setConsentOpen(true); return false; }
    const current = latest();
    if (!current) return false;
    if (missedDays(current).length) { setWarningOpen(true); return false; }
    try {
      const next = toggleDay(current, day);
      const saved = save(next);
      if (saved && missedDays(next).length) setWarningOpen(true);
      return saved;
    }
    catch (cause) { setError(errorKey(cause, "savedReadFailed")); return false; }
  }
  function resolve(restart: boolean) {
    const current = latest();
    if (!current) return;
    try {
      const next = restart ? createJourney(new Date(), current) : confirmMissedDay(current);
      if (save(next)) setWarningOpen(false);
    } catch (cause) {
      setNow(new Date());
      setError(errorKey(cause, "savedReadFailed"));
    }
  }
  function resetCorrupt() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setCorrupt(false); setError(null); setConsentOpen(true);
    } catch { setError("resetFailed"); }
  }
  const snapshot = buildSnapshot(state ?? createJourney(now), now);
  return { ready, snapshot, consentOpen, setConsentOpen, warningOpen, setWarningOpen, error,
    corrupt, resetCorrupt, accept, toggle, resolve, missed: state ? missedDays(state, now) : [] };
}
