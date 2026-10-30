import { addDays, dayBeforeRamadan, nextHijri } from '../lib/dates';

// Seasonal challenges. The app shows these built-in ones, plus any published online at
// REMOTE_CHALLENGES_URL (a JSON array in the same shape), so new challenges can be
// released without an App Store update. Leave it empty until you host the file.
export const REMOTE_CHALLENGES_URL = '';

// period: { type: 'days', days } | { type: 'untilRamadan' } | { type: 'hijri', month, from, to }
export const BUILT_IN_CHALLENGES = [
  {
    id: 'ramadan_prep',
    en: { title: 'Ramadan preparation', desc: 'Build small, steady habits now so Ramadan finds you ready. Runs until the day before Ramadan.' },
    ar: { title: 'الاستعداد لرمضان', desc: 'ابنِ عادات صغيرة ثابتة الآن ليجدك رمضان مستعدًا. يستمر حتى اليوم الذي يسبق رمضان.' },
    period: { type: 'untilRamadan' },
    goals: ['fajr_on_time', 'quran', 'istighfar', 'fast_mon_thu'],
  },
  {
    id: 'fajr_40',
    en: { title: '40 days of Fajr', desc: 'Pray Fajr on time for 40 days in a row.' },
    ar: { title: 'أربعون يومًا مع الفجر', desc: 'صلِّ الفجر في وقتها أربعين يومًا متتالية.' },
    period: { type: 'days', days: 40 },
    goals: ['fajr_on_time'],
  },
  {
    id: 'dhul_hijjah_10',
    en: { title: 'First 10 days of Dhul Hijjah', desc: 'The best days of the year: dhikr, fasting and good deeds from 1 to 10 Dhul Hijjah.' },
    ar: { title: 'العشر الأوائل من ذي الحجة', desc: 'أفضل أيام السنة: ذكر وصيام وعمل صالح من ١ إلى ١٠ ذي الحجة.' },
    period: { type: 'hijri', month: 12, from: 1, to: 10 },
    goals: ['adhkar_morning', 'adhkar_evening', 'sadaqa', { en: 'Takbir', ar: 'التكبير', freq: 'daily' }],
  },
];

export function challengeDates(ch, today, adjust = 0) {
  const p = ch.period || {};
  if (p.type === 'days') return { start: today, end: addDays(today, (p.days || 30) - 1) };
  if (p.type === 'untilRamadan') {
    const end = dayBeforeRamadan(today, adjust);
    return { start: today, end: end || addDays(today, 29) };
  }
  if (p.type === 'hijri') {
    // if we are inside the window already, start today; otherwise the next window
    const end = nextHijri(p.month, p.to, today, adjust);
    let start = end ? addDays(end, -(p.to - p.from)) : today;
    if (start < today) start = today;
    return { start, end: end || addDays(today, p.to - p.from) };
  }
  return { start: today, end: addDays(today, 29) };
}

export async function loadRemoteChallenges() {
  if (!REMOTE_CHALLENGES_URL) return [];
  try {
    const r = await fetch(REMOTE_CHALLENGES_URL, { cache: 'no-store' });
    if (!r.ok) return [];
    const list = await r.json();
    return Array.isArray(list) ? list.filter((c) => c && c.id && c.en && c.ar && Array.isArray(c.goals)) : [];
  } catch (e) {
    return [];
  }
}
