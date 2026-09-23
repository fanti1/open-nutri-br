const dateFormat = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
const shortDateFormat = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' });
const timeFormat = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' });
const weekdayFormat = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
const monthFormat = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' });
const numberFormat = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });

export function formatDate(iso: string): string {
  return dateFormat.format(parseDate(iso));
}

export function formatShortDate(iso: string): string {
  return shortDateFormat.format(parseDate(iso)).replace('.', '');
}

export function formatTime(iso: string): string {
  return timeFormat.format(new Date(iso));
}

export function formatDateTime(iso: string): string {
  return `${formatDate(iso)} às ${formatTime(iso)}`;
}

export function formatWeekday(date: Date): string {
  const text = weekdayFormat.format(date);
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function formatMonth(date: Date): string {
  const text = monthFormat.format(date);
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function formatNumber(value: number, maxFractionDigits = 2): string {
  if (maxFractionDigits === 2) return numberFormat.format(value);
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: maxFractionDigits }).format(value);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${formatNumber(bytes / 1024)} KB`;
  return `${formatNumber(bytes / (1024 * 1024))} MB`;
}

/** "Hoje", "Amanhã", "Ontem" ou a data curta. */
export function relativeDay(iso: string, now = new Date()): string {
  const diff = Math.round((startOfDay(new Date(iso)).getTime() - startOfDay(now).getTime()) / 86_400_000);
  if (diff === 0) return 'Hoje';
  if (diff === 1) return 'Amanhã';
  if (diff === -1) return 'Ontem';
  return formatShortDate(iso);
}

/** Datas "AAAA-MM-DD" (sem hora) são interpretadas no fuso local, não em UTC. */
export function parseDate(value: string): Date {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T12:00:00`) : new Date(value);
}

export function toDateOnly(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** Idade completa em anos e meses na data de referência. */
export function ageParts(birthDate: string, at = new Date()): { years: number; months: number; totalMonths: number } {
  const birth = parseDate(birthDate);
  let months = (at.getFullYear() - birth.getFullYear()) * 12 + (at.getMonth() - birth.getMonth());
  if (at.getDate() < birth.getDate()) months -= 1;
  months = Math.max(0, months);
  return { years: Math.floor(months / 12), months: months % 12, totalMonths: months };
}

/** Idade em meses com fração (como a OMS usa nas curvas: dias / 30,4375). */
export function ageInMonthsDecimal(birthDate: string, at = new Date()): number {
  const days = (startOfDay(at).getTime() - startOfDay(parseDate(birthDate)).getTime()) / 86_400_000;
  return Math.max(0, Math.round((days / 30.4375) * 100) / 100);
}

export function formatAge(birthDate: string, at = new Date()): string {
  const { years, months } = ageParts(birthDate, at);
  if (years >= 3) return `${years} anos`;
  if (years === 0) return months === 1 ? '1 mês' : `${months} meses`;
  return `${years} ${years === 1 ? 'ano' : 'anos'} e ${months} ${months === 1 ? 'mês' : 'meses'}`;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}
