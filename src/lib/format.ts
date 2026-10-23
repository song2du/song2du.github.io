export function formatDate(value: string, style: "long" | "short" = "long") {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    ...(style === "long" && { day: "numeric" }),
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}
