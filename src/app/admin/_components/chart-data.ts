// Günlük grafikler için ortak "son N gün" kova (bucket) mantığı — Siparişler,
// Ürünler ve Ödeme Kayıtları sayfalarındaki günlük grafikler bunu paylaşıyor,
// aynı döngüyü 3 yerde tekrarlamamak için.

const DAY_MONTH_TR = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short" });

export function bucketByDay<T>(
  items: T[],
  getDate: (item: T) => Date,
  getValue: (item: T) => number,
  days: number
): { label: string; value: number }[] {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));

  return Array.from({ length: days }, (_, i) => {
    const dayStart = new Date(start);
    dayStart.setDate(start.getDate() + i);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayStart.getDate() + 1);

    const value = items
      .filter((item) => {
        const d = getDate(item);
        return d >= dayStart && d < dayEnd;
      })
      .reduce((sum, item) => sum + getValue(item), 0);

    return { label: DAY_MONTH_TR.format(dayStart), value };
  });
}

export function daysAgo(days: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - (days - 1));
  return d;
}

const MONTH_LABELS_TR = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

export function monthsAgoStart(months: number): Date {
  const d = new Date();
  d.setMonth(d.getMonth() - (months - 1));
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function bucketByMonth<T>(
  items: T[],
  getDate: (item: T) => Date,
  getValue: (item: T) => number,
  months: number
): { label: string; value: number }[] {
  const start = monthsAgoStart(months);

  return Array.from({ length: months }, (_, i) => {
    const monthDate = new Date(start);
    monthDate.setMonth(start.getMonth() + i);

    const value = items
      .filter(
        (item) =>
          getDate(item).getFullYear() === monthDate.getFullYear() &&
          getDate(item).getMonth() === monthDate.getMonth()
      )
      .reduce((sum, item) => sum + getValue(item), 0);

    return { label: `${MONTH_LABELS_TR[monthDate.getMonth()]} ${String(monthDate.getFullYear()).slice(2)}`, value: Math.round(value) };
  });
}
