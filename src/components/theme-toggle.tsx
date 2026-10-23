"use client";

import { useLayoutEffect, useSyncExternalStore } from "react";
import { THEME_STORAGE_KEY } from "@/lib/theme";

type Theme = "light" | "dark";

const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());

function systemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function currentTheme(): Theme {
  const chosen = document.documentElement.getAttribute("data-theme");
  return chosen === "light" || chosen === "dark" ? chosen : systemTheme();
}

function subscribe(listener: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  listeners.add(listener);
  media.addEventListener("change", listener);
  return () => {
    listeners.delete(listener);
    media.removeEventListener("change", listener);
  };
}

function savedTheme(): Theme | null {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return saved === "light" || saved === "dark" ? saved : null;
  } catch {
    return null;
  }
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, currentTheme, () => null);

  // In development, React's Strict Mode remount clears attributes the inline script
  // set on <html>, so re-apply the saved choice. A no-op in production.
  useLayoutEffect(() => {
    const saved = savedTheme();
    if (saved && document.documentElement.getAttribute("data-theme") !== saved) {
      document.documentElement.setAttribute("data-theme", saved);
      notify();
    }
  }, []);

  function toggle() {
    const next: Theme = currentTheme() === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Storage blocked: the choice lasts until the page is reloaded.
    }
    notify();
  }

  const label = theme === "dark" ? "Switch to light mode" : "Switch to dark mode";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="grid size-8 place-items-center rounded-md text-muted transition-colors hover:bg-surface hover:text-fg"
    >
      {/* The server can't know the theme, so the icon appears once the page hydrates. */}
      {theme === "dark" ? <SunIcon /> : theme === "light" ? <MoonIcon /> : null}
    </button>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <circle cx="8" cy="8" r="3" />
      <path d="M8 1.5v1.3M8 13.2v1.3M1.5 8h1.3M13.2 8h1.3M3.4 3.4l.9.9M11.7 11.7l.9.9M3.4 12.6l.9-.9M11.7 4.3l.9-.9" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" aria-hidden="true">
      <path d="M13.5 9.6A5.6 5.6 0 0 1 6.4 2.5a5.6 5.6 0 1 0 7.1 7.1Z" />
    </svg>
  );
}
