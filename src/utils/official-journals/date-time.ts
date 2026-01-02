
const BR_DATE_UTC = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' });

export function isBrDate(v: string) {
  return typeof v === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(v.trim());
}

export function parseBrDateToUTC(v: string) {
  const [dd, mm, yyyy] = v.split('/').map((x) => Number(x));
  if (!dd || !mm || !yyyy) return null;

  const d = new Date(Date.UTC(yyyy, mm - 1, dd));
  if (d.getUTCFullYear() !== yyyy || d.getUTCMonth() !== mm - 1 || d.getUTCDate() !== dd) {
    return null;
  }
  return d;
}

export function formatBrDateUtc(dateStr?: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '';
  return BR_DATE_UTC.format(d);
}