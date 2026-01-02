export function parseBrDateToUTC(v: string) {
  const [dd, mm, yyyy] = v.split('/').map((x) => Number(x));
  if (!dd || !mm || !yyyy) return null;

  const d = new Date(Date.UTC(yyyy, mm - 1, dd));
  if (d.getUTCFullYear() !== yyyy || d.getUTCMonth() !== mm - 1 || d.getUTCDate() !== dd) {
    return null;
  }
  return d;
}
