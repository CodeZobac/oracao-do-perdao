"use client";

import clsx from "clsx";
import { languages, languageNames } from "@/lib/i18n";
import { useLanguage } from "@/lib/language-context";

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();
  return (
    <div role="group" aria-label={t("language")} className="inline-flex max-w-full flex-wrap justify-center gap-1 rounded-2xl border border-[var(--line)] bg-white/70 p-1 shadow-xs">
      {languages.map(option => (
        <button key={option} type="button" lang={option} aria-pressed={language === option}
          onClick={() => setLanguage(option)}
          className={clsx("cursor-pointer rounded-xl px-3 py-2 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]",
            language === option ? "bg-[var(--foreground)] text-white shadow-xs" : "text-[var(--muted)] hover:bg-white hover:text-[var(--foreground)]")}>
          {languageNames[option]}
        </button>
      ))}
    </div>
  );
}
