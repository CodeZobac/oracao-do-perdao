"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { useLanguage } from "@/lib/language-context";
import LanguageSwitcher from "./language-switcher";

export default function AppModal({ title, onClose, children, className = "" }: {
  title: string; onClose: () => void; children: ReactNode; className?: string;
}) {
  const { t } = useLanguage();
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => {
      dialog?.close();
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, []);
  return createPortal(
    <dialog ref={dialogRef} aria-label={title} className={`app-modal paper-panel ${className}`} onCancel={event => {
      event.preventDefault(); onClose();
    }}>
      <button type="button" className="modal-close" aria-label={t("closeModal")} onClick={onClose}>✕</button>
      <div className="mb-5 pr-8"><LanguageSwitcher /></div>
      {children}
    </dialog>, document.body,
  );
}
