"use client";

import { useEffect, useState } from "react";

export type DateFormat =
  | "compact"      // "May 10, 2026"
  | "verbose"      // "May 10, 2026" (long month)
  | "full"         // "May 10, 2026 at 5:00 PM"
  | "dueDate"      // "Sat, May 10, 5:00 PM"
  | "time"         // "5:00 PM"
  | "monthYear"    // "May 2026"
  | "longDate";    // "Sunday, May 10, 2026"

const OPTIONS: Record<Exclude<DateFormat, "full">, Intl.DateTimeFormatOptions> = {
  compact:   { year: "numeric", month: "short", day: "numeric" },
  verbose:   { year: "numeric", month: "long",  day: "numeric" },
  dueDate:   { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true },
  time:      { hour: "numeric", minute: "2-digit", hour12: true },
  monthYear: { year: "numeric", month: "short" },
  longDate:  { weekday: "long", year: "numeric", month: "long", day: "numeric" },
};

export function formatDateForUser(date: Date, format: DateFormat): string {
  if (format === "full") {
    const datePart = new Intl.DateTimeFormat("en-US", OPTIONS.compact).format(date);
    const timePart = new Intl.DateTimeFormat("en-US", OPTIONS.time).format(date);
    return `${datePart} at ${timePart}`;
  }
  return new Intl.DateTimeFormat("en-US", OPTIONS[format]).format(date);
}

export interface FormattedDateProps {
  iso: string | Date | null | undefined;
  format?: DateFormat;
  fallback?: string;
  className?: string;
}

export function FormattedDate({
  iso,
  format = "compact",
  fallback = "",
  className,
}: FormattedDateProps) {
  const [text, setText] = useState<string>(fallback);

  useEffect(() => {
    if (!iso) {
      setText(fallback);
      return;
    }
    const date = typeof iso === "string" ? new Date(iso) : iso;
    if (isNaN(date.getTime())) {
      setText(fallback);
      return;
    }
    setText(formatDateForUser(date, format));
  }, [iso, format, fallback]);

  const dateTimeAttr = !iso
    ? undefined
    : typeof iso === "string"
      ? iso
      : iso.toISOString();

  return (
    <time dateTime={dateTimeAttr} className={className} suppressHydrationWarning>
      {text}
    </time>
  );
}
