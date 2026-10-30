// Date helpers. Dates are stored as 'YYYY-MM-DD' strings in the phone's local time.

export const HIJRI_MONTHS = {
  en: ['Muharram', 'Safar', 'Rabiʿ I', 'Rabiʿ II', 'Jumada I', 'Jumada II', 'Rajab', 'Shaʿban', 'Ramadan', 'Shawwal', 'Dhu al-Qaʿdah', 'Dhu al-Hijjah'],
  ar: ['محرم', 'صفر', 'ربيع الأول', 'ربيع الآخر', 'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'],
};
const G_MONTHS = {
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  ar: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليوز', 'غشت', 'شتنبر', 'أكتوبر', 'نونبر', 'دجنبر'],
};
const WEEKDAYS = {
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  ar: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
};

const pad = (n) => (n < 10 ? '0' + n : '' + n);

export function toKey(d) {
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}
export function fromKey(k) {
  const [y, m, d] = k.split('-').map(Number);
  return new Date(y, m - 1, d);
}
export function todayKey() {
  return toKey(new Date());
}
export function addDays(k, n) {
  const d = fromKey(k);
  d.setDate(d.getDate() + n);
  return toKey(d);
}
export function diffDays(a, b) {
  // whole days from a to b
  return Math.round((fromKey(b) - fromKey(a)) / 86400000);
}
export function rangeKeys(a, b) {
  const out = [];
  const n = diffDays(a, b);
  for (let i = 0; i <= n; i++) out.push(addDays(a, i));
  return out;
}

// ---------- Hijri ----------
// Tabular (arithmetic) Islamic calendar. It can differ by a day or two from local moon
// sighting, so the app also applies the user's adjustment (Settings › Hijri date).
function gregorianToJdn(y, m, d) {
  const a = Math.floor((14 - m) / 12);
  const y2 = y + 4800 - a;
  const m2 = m + 12 * a - 3;
  return d + Math.floor((153 * m2 + 2) / 5) + 365 * y2 + Math.floor(y2 / 4) - Math.floor(y2 / 100) + Math.floor(y2 / 400) - 32045;
}
function jdnToHijri(jdn) {
  let l = jdn - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  l = l - 10631 * n + 354;
  const j = Math.floor((10985 - l) / 5316) * Math.floor((50 * l) / 17719) + Math.floor(l / 5670) * Math.floor((43 * l) / 15238);
  l = l - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const m = Math.floor((24 * l) / 709);
  const d = l - Math.floor((709 * m) / 24);
  const y = 30 * n + j - 30;
  return { y, m, d };
}

let intlFmt;
function intlHijri(date) {
  // Umm al-Qura through Intl when the phone supports it; otherwise null.
  if (intlFmt === undefined) {
    try {
      intlFmt = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', { day: 'numeric', month: 'numeric', year: 'numeric' });
      if (typeof intlFmt.formatToParts !== 'function') intlFmt = null;
    } catch (e) {
      intlFmt = null;
    }
  }
  if (!intlFmt) return null;
  try {
    const r = {};
    intlFmt.formatToParts(date).forEach((p) => {
      if (p.type === 'day') r.d = parseInt(p.value, 10);
      if (p.type === 'month') r.m = parseInt(p.value, 10);
      if (p.type === 'year' || p.type === 'relatedYear') r.y = r.y || parseInt(p.value, 10);
    });
    if (r.d >= 1 && r.d <= 30 && r.m >= 1 && r.m <= 12 && r.y > 1300 && r.y < 1600) return r;
  } catch (e) {}
  return null;
}

export function hijriOf(key, adjust = 0) {
  const d = fromKey(key);
  d.setDate(d.getDate() + (adjust || 0));
  const viaIntl = intlHijri(new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12));
  const tab = jdnToHijri(gregorianToJdn(d.getFullYear(), d.getMonth() + 1, d.getDate()));
  if (viaIntl) {
    // sanity check: Umm al-Qura and the arithmetic calendar must agree within 3 days
    const n = (h) => h.y * 354.367 + (h.m - 1) * 29.53 + h.d;
    if (Math.abs(n(viaIntl) - n(tab)) <= 3) return viaIntl;
  }
  return tab;
}

export function hijriText(key, lang = 'en', adjust = 0) {
  const h = hijriOf(key, adjust);
  return lang === 'ar' ? h.d + ' ' + HIJRI_MONTHS.ar[h.m - 1] + ' ' + h.y : h.d + ' ' + HIJRI_MONTHS.en[h.m - 1] + ' ' + h.y;
}

// Next Gregorian day (on or after `fromKey`) whose Hijri date is month/day.
export function nextHijri(month, day, from, adjust = 0) {
  for (let i = 0; i < 400; i++) {
    const k = addDays(from, i);
    const h = hijriOf(k, adjust);
    if (h.m === month && h.d === day) return k;
    // months with 29 days: day 30 does not exist, take the last day
    if (day === 30 && h.m === month && h.d === 29) {
      const nk = addDays(k, 1);
      if (hijriOf(nk, adjust).m !== month) return k;
    }
  }
  return null;
}

export function dayBeforeRamadan(from, adjust = 0) {
  const r = nextHijri(9, 1, addDays(from, 1), adjust);
  return r ? addDays(r, -1) : null;
}

// ---------- formatting ----------
export function fmtDate(key, lang = 'en', opts = {}) {
  const d = fromKey(key);
  const day = d.getDate();
  const mon = G_MONTHS[lang === 'ar' ? 'ar' : 'en'][d.getMonth()];
  let s = day + ' ' + mon;
  if (opts.year) s += ' ' + d.getFullYear();
  if (opts.weekday) s = WEEKDAYS[lang === 'ar' ? 'ar' : 'en'][d.getDay()] + (lang === 'ar' ? '، ' : ', ') + s;
  return s;
}
export function monthShort(key, lang = 'en') {
  return G_MONTHS[lang === 'ar' ? 'ar' : 'en'][fromKey(key).getMonth()];
}
