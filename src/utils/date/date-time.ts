import { toZonedTime } from 'date-fns-tz';

export function isBrDate(v: string): boolean {
  return typeof v === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(v.trim());
}

export function parseBrDateToUTC(v: string): Date | null {
  if (!isBrDate(v)) return null;

  const [dd, mm, yyyy] = v
    .trim()
    .split('/')
    .map((x) => Number(x));
  if (!dd || !mm || !yyyy) return null;

  const d = new Date(Date.UTC(yyyy, mm - 1, dd));
  if (d.getUTCFullYear() !== yyyy || d.getUTCMonth() !== mm - 1 || d.getUTCDate() !== dd) {
    return null;
  }
  return d;
}

export function formatBrDateInZone(date: Date, timeZone: string): string {
  const z = toZonedTime(date, timeZone);
  const dia = String(z.getDate()).padStart(2, '0');
  const mes = String(z.getMonth() + 1).padStart(2, '0');
  const ano = z.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

export function hasPassedLocalTime(
  timeZone: string,
  hour: number,
  minute = 0,
  now = new Date(),
): boolean {
  const z = toZonedTime(now, timeZone);
  return z.getHours() > hour || (z.getHours() === hour && z.getMinutes() >= minute);
}

export function formatarData(data: Date, timeZone?: string): string {
  if (timeZone) return formatBrDateInZone(data, timeZone);

  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const ano = data.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

export function parseExecutedAt(executedAtString: string): Date | null {
  const s = executedAtString?.trim();
  if (!s) return null;

  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return null;

  return d;
}

export function isSameZonedDay(a: Date, b: Date, timeZone: string): boolean {
  const az = toZonedTime(a, timeZone);
  const bz = toZonedTime(b, timeZone);

  return (
    az.getFullYear() === bz.getFullYear() &&
    az.getMonth() === bz.getMonth() &&
    az.getDate() === bz.getDate()
  );
}

export function parseIsoDateToUTC(v: string): Date {
  const [yyyy, mm, dd] = v.split("-").map(Number);
  if (!yyyy || !mm || !dd) throw new Error(`Data ISO inválida: ${v}`);
  return new Date(Date.UTC(yyyy, mm - 1, dd));
}