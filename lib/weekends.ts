export function getWeekends(startDate: Date, endDate: Date): Date[] {
  const result: Date[] = [];
  const current = new Date(
    Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate())
  );

  while (current.getUTCDay() !== 6) {
    current.setUTCDate(current.getUTCDate() + 1);
  }

  while (current <= endDate) {
    result.push(new Date(current));
    current.setUTCDate(current.getUTCDate() + 7);
  }

  return result;
}

export function dateKey(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().slice(0, 10);
}
