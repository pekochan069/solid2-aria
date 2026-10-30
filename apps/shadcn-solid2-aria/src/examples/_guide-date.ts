export function parseNaturalDate(value: string): Date | undefined {
  const normalized = value.trim().toLowerCase();
  const date = new Date();
  date.setHours(12, 0, 0, 0);

  if (normalized === "today") {
    return date;
  }

  if (normalized === "tomorrow") {
    date.setDate(date.getDate() + 1);

    return date;
  }

  if (normalized === "next week") {
    date.setDate(date.getDate() + 7);

    return date;
  }

  const days = /^in (?<days>\d+) days?$/u.exec(normalized)?.groups?.days;

  if ((days ?? "") !== "") {
    date.setDate(date.getDate() + Number(days));

    return date;
  }

  const weekdays = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  const weekday = weekdays.indexOf(normalized.replace(/^next /u, ""));

  if (weekday !== -1) {
    date.setDate(date.getDate() + ((weekday - date.getDay() + 7) % 7 || 7));

    return date;
  }

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}
