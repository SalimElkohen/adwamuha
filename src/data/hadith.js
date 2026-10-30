// Hadith library for the welcome screen, daily card and reminders.
// IMPORTANT: Arabic texts and references must be verified by a qualified person before
// public release (see `reviewed`). English renderings are meaning-based translations.
// Numbering follows the common Dar-us-Salam / sunnah.com numbering.

export const WELCOME = {
  ar: 'سَدِّدُوا وَقَارِبُوا، وَاعْلَمُوا أَنْ لَنْ يُدْخِلَ أَحَدَكُمْ عَمَلُهُ الْجَنَّةَ، وَأَنَّ أَحَبَّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ',
  en: 'Do good deeds properly, sincerely and moderately, and know that your deeds will not make you enter Paradise, and that the most beloved deed to Allah is the most regular and constant, even if it were little.',
  refEn: 'Sahih al-Bukhari 6464',
  refAr: 'صحيح البخاري ٦٤٦٤',
  reviewed: false,
};

export const HADITH = [
  {
    id: 'adwamuha',
    ar: 'أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ',
    en: 'The most beloved deed to Allah is the most constant, even if it is little.',
    refEn: 'Sahih al-Bukhari 6464', refAr: 'صحيح البخاري ٦٤٦٤',
    use: ['daily', 'morning', 'restart'],
  },
  {
    id: 'dawama',
    ar: 'وَكَانَ أَحَبَّ الدِّينِ إِلَيْهِ مَا دَاوَمَ عَلَيْهِ صَاحِبُهُ',
    en: 'The deed of religion he loved most was the one its doer kept up regularly.',
    refEn: 'Sahih al-Bukhari 43', refAr: 'صحيح البخاري ٤٣',
    use: ['daily', 'evening'],
  },
  {
    id: 'tuteeqoon',
    ar: 'عَلَيْكُمْ بِمَا تُطِيقُونَ، فَوَاللَّهِ لاَ يَمَلُّ اللَّهُ حَتَّى تَمَلُّوا',
    en: 'Take on only what you are able to do, for by Allah, Allah does not grow weary until you grow weary.',
    refEn: 'Sahih al-Bukhari 43', refAr: 'صحيح البخاري ٤٣',
    use: ['daily', 'restart'],
  },
  {
    id: 'yusr',
    ar: 'إِنَّ الدِّينَ يُسْرٌ، وَلَنْ يُشَادَّ الدِّينَ أَحَدٌ إِلاَّ غَلَبَهُ، فَسَدِّدُوا وَقَارِبُوا وَأَبْشِرُوا',
    en: 'The religion is easy. No one overburdens himself in religion except that it overpowers him. So be balanced, come close to perfection, and receive good tidings.',
    refEn: 'Sahih al-Bukhari 39', refAr: 'صحيح البخاري ٣٩',
    use: ['daily', 'morning', 'restart'],
  },
  {
    id: 'niyyah',
    ar: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى',
    en: 'Actions are only by intentions, and every person will have only what they intended.',
    refEn: 'Sahih al-Bukhari 1', refAr: 'صحيح البخاري ١',
    use: ['daily', 'morning'],
  },
  {
    id: 'la_takun',
    ar: 'يَا عَبْدَ اللَّهِ، لاَ تَكُنْ مِثْلَ فُلاَنٍ، كَانَ يَقُومُ اللَّيْلَ فَتَرَكَ قِيَامَ اللَّيْلِ',
    en: 'O Abdullah, do not be like so-and-so: he used to pray at night, then he gave up praying at night.',
    refEn: 'Sahih al-Bukhari 1152', refAr: 'صحيح البخاري ١١٥٢',
    use: ['daily', 'evening'],
  },
  {
    id: 'safar',
    ar: 'إِذَا مَرِضَ الْعَبْدُ أَوْ سَافَرَ كُتِبَ لَهُ مِثْلُ مَا كَانَ يَعْمَلُ مُقِيمًا صَحِيحًا',
    en: 'When a servant falls ill or travels, the reward of what he used to do while at home and healthy is written for him.',
    refEn: 'Sahih al-Bukhari 2996', refAr: 'صحيح البخاري ٢٩٩٦',
    use: ['daily', 'restart'],
  },
  {
    id: 'nawafil',
    ar: 'وَمَا يَزَالُ عَبْدِي يَتَقَرَّبُ إِلَيَّ بِالنَّوَافِلِ حَتَّى أُحِبَّهُ',
    en: 'My servant keeps drawing nearer to Me with voluntary deeds until I love him.',
    refEn: 'Sahih al-Bukhari 6502', refAr: 'صحيح البخاري ٦٥٠٢',
    use: ['daily', 'evening'],
  },
  {
    id: 'ihris',
    ar: 'احْرِصْ عَلَى مَا يَنْفَعُكَ، وَاسْتَعِنْ بِاللَّهِ، وَلاَ تَعْجَزْ',
    en: 'Be eager for what benefits you, seek help from Allah, and do not give up.',
    refEn: 'Sahih Muslim 2664', refAr: 'صحيح مسلم ٢٦٦٤',
    use: ['daily', 'morning', 'restart'],
  },
  {
    id: 'tawwabun',
    ar: 'كُلُّ ابْنِ آدَمَ خَطَّاءٌ، وَخَيْرُ الْخَطَّائِينَ التَّوَّابُونَ',
    en: 'Every child of Adam errs, and the best of those who err are those who repent.',
    refEn: 'Jamiʿ at-Tirmidhi 2499 (hasan)', refAr: 'جامع الترمذي ٢٤٩٩ (حسن)',
    use: ['restart', 'evening'],
  },
];

export function hadithForDay(dayNumber, use = 'daily') {
  const list = HADITH.filter((h) => h.use.includes(use));
  const i = ((dayNumber % list.length) + list.length) % list.length;
  return list[i];
}
