// Goals offered at first launch. Users pick any of these and can add their own.
// freq: 'daily' or 'weekly' (perWeek times a week). target/unit: optional count or amount.

export const CATALOG = [
  { id: 'five_on_time', pack: 'muslim', freq: 'daily', en: '5 prayers on time', ar: 'الصلوات الخمس في وقتها' },
  { id: 'fajr_on_time', pack: 'muslim', freq: 'daily', en: 'Fajr on time', ar: 'صلاة الفجر في وقتها' },
  { id: 'mosque', pack: 'muslim', freq: 'daily', en: 'At least one prayer in the mosque', ar: 'صلاة واحدة على الأقل في المسجد' },
  { id: 'quran', pack: 'muslim', freq: 'daily', target: '¼', unitEn: 'hizb of Quran', unitAr: 'حزب من القرآن', en: 'Read Quran', ar: 'قراءة القرآن' },
  { id: 'adhkar_morning', pack: 'muslim', freq: 'daily', en: 'Morning adhkar', ar: 'أذكار الصباح' },
  { id: 'adhkar_evening', pack: 'muslim', freq: 'daily', en: 'Evening adhkar', ar: 'أذكار المساء' },
  { id: 'istighfar', pack: 'muslim', freq: 'daily', target: '1000', unitEn: 'times', unitAr: 'مرة', en: 'Istighfar', ar: 'الاستغفار' },
  { id: 'duha', pack: 'muslim', freq: 'daily', en: 'Duha prayer', ar: 'صلاة الضحى' },
  { id: 'witr', pack: 'muslim', freq: 'daily', en: 'Witr', ar: 'صلاة الوتر' },
  { id: 'shafa_witr', pack: 'muslim', freq: 'daily', en: 'Shafʿ & Witr', ar: 'الشفع والوتر' },
  { id: 'sadaqa', pack: 'muslim', freq: 'weekly', perWeek: 1, en: 'Sadaqa', ar: 'الصدقة' },
  { id: 'fast_mon_thu', pack: 'muslim', freq: 'weekly', perWeek: 2, en: 'Fast Monday & Thursday', ar: 'صيام الاثنين والخميس' },
  { id: 'sport', pack: 'life', freq: 'weekly', perWeek: 3, en: 'Sport', ar: 'الرياضة' },
  { id: 'read_pages', pack: 'life', freq: 'weekly', perWeek: 3, target: '10', unitEn: 'pages', unitAr: 'صفحات', en: 'Read a book', ar: 'قراءة كتاب' },
  { id: 'sleep_early', pack: 'life', freq: 'daily', en: 'Sleep before 23:00', ar: 'النوم قبل الساعة 23:00' },
  { id: 'no_sugar', pack: 'life', freq: 'daily', en: 'No sugar', ar: 'بدون سكر' },
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
