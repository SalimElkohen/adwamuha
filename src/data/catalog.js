// Goals offered at first launch. Users pick any of these and can add their own.
// freq: 'daily' or 'weekly' (perWeek times a week). target/unit: optional count or amount.

export const CATALOG = [
  { id: 'mosque', pack: 'muslim', freq: 'daily', en: 'At least one prayer in the mosque', ar: 'صلاة واحدة على الأقل في المسجد' },
  { id: 'fajr_on_time', pack: 'muslim', freq: 'daily', en: 'Fajr on time', ar: 'صلاة الفجر في وقتها' },
  { id: 'quran', pack: 'muslim', freq: 'daily', target: '¼', unitEn: 'hizb of Quran', unitAr: 'حزب من القرآن', en: 'Read Quran', ar: 'قراءة القرآن' },
  { id: 'adhkar_morning', pack: 'muslim', freq: 'daily', en: 'Morning adhkar', ar: 'أذكار الصباح' },
  { id: 'adhkar_evening', pack: 'muslim', freq: 'daily', en: 'Evening adhkar', ar: 'أذكار المساء' },
  { id: 'istighfar', pack: 'muslim', freq: 'daily', target: '100', unitEn: 'times', unitAr: 'مرة', en: 'Istighfar', ar: 'الاستغفار' },
  { id: 'salawat', pack: 'muslim', freq: 'daily', target: '100', unitEn: 'times', unitAr: 'مرة', en: 'Salawat on the Prophet ﷺ', ar: 'الصلاة على النبي ﷺ' },
  { id: 'tahlil', pack: 'muslim', freq: 'daily', target: '100 + 100', unitEn: 'morning & evening', unitAr: 'صباحًا ومساءً', en: 'Lā ilāha illā-llāh waḥdahu lā sharīka lah…', ar: 'لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير' },
  { id: 'duha', pack: 'muslim', freq: 'daily', en: 'Duha prayer', ar: 'صلاة الضحى' },
  { id: 'shafa_witr', pack: 'muslim', freq: 'daily', en: 'Shafʿ & Witr', ar: 'الشفع والوتر' },
  { id: 'sadaqa', pack: 'muslim', freq: 'weekly', perWeek: 1, en: 'Sadaqa', ar: 'الصدقة' },
  { id: 'fast_mon_thu', pack: 'muslim', freq: 'weekly', perWeek: 2, en: 'Fast Monday and/or Thursday', ar: 'صيام الاثنين و/أو الخميس' },
  { id: 'sport', pack: 'life', freq: 'weekly', perWeek: 3, en: 'Sport', ar: 'الرياضة' },
  // weekInUnit: the unit already says "a week", so the "1× a week" line is not shown
  { id: 'read_pages', pack: 'life', freq: 'weekly', perWeek: 1, weekInUnit: true, target: '10', unitEn: 'pages a week', unitAr: 'صفحات في الأسبوع', en: 'Read a book', ar: 'قراءة كتاب' },
  { id: 'sleep_early', pack: 'life', freq: 'daily', en: 'Sleep early', ar: 'النوم مبكرًا' },
  { id: 'early_start', pack: 'life', freq: 'daily', en: 'Start the day early', ar: 'البكور' },
  { id: 'eat_healthy', pack: 'life', freq: 'daily', en: 'Eat healthy', ar: 'الأكل الصحي' },
  // retired suggestions: no longer offered, kept so goals people already track still show their names
  { id: 'five_on_time', pack: 'muslim', hidden: true, freq: 'daily', en: '5 prayers on time', ar: 'الصلوات الخمس في وقتها' },
  { id: 'no_sugar', pack: 'life', hidden: true, freq: 'daily', en: 'No sugar', ar: 'بدون سكر' },
  { id: 'witr', pack: 'muslim', hidden: true, freq: 'daily', en: 'Witr', ar: 'صلاة الوتر' },
];

export function catalogItem(id) {
  return CATALOG.find((c) => c.id === id);
}

export function goalFromCatalog(c, extra = {}) {
  return {
    id: c.id + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
    catalogId: c.id,
    name: null,
    freq: c.freq,
    perWeek: c.perWeek || null,
    target: c.target || '',
    unit: null,
    archived: false,
    ...extra,
  };
}
