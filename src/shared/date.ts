export const HOUR_MS = 60 * 60 * 1000;

export function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * HOUR_MS);
}

export function now(): Date {
  return new Date();
}
