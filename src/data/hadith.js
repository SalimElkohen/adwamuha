// Hadith library for the welcome screen, daily card and reminders.
// Arabic texts, references and gradings are taken from the Dorar Saniyya hadith
// encyclopedia (dorar.net); each entry keeps its Dorar page in `dorar`.
// English renderings are meaning-based translations, still to be reviewed.

export const WELCOME = {
  introAr: 'قال رسول الله ﷺ:',
  introEn: 'The Messenger of Allah ﷺ said:',
  ar: 'أَحَبُّ الأعمالِ إلى اللهِ أدْومُها وإن قَلَّ',
  en: 'The most beloved deed to Allah is the most regular and constant, even if it is little.',
  refEn: 'Sahih Muslim 783',
  refAr: 'صحيح مسلم ٧٨٣',
  grade: 'صحيح',
  dorar: 'https://dorar.net/hadith/sharh/113728',
};

export const HADITH = [
  {
    id: 'adwamuha',
    ar: 'أَحَبُّ الأعمالِ إلى اللهِ أدْومُها وإن قَلَّ',
    en: 'The most beloved deed to Allah is the most constant, even if it is little.',
    refEn: 'Sahih Muslim 783', refAr: 'صحيح مسلم ٧٨٣',
    dorar: 'https://dorar.net/hadith/sharh/113728',
    use: ['daily', 'morning', 'restart'],
  },
  {
    id: 'dawama',
    ar: 'وكان أحَبَّ الدِّينِ إليه ما دامَ عليه صاحِبُه',
    en: 'The deed of religion he loved most was the one its doer kept up.',
    refEn: 'Sahih al-Bukhari 43', refAr: 'صحيح البخاري ٤٣',
    dorar: 'https://dorar.net/hadith/sharh/2681',
    use: ['daily', 'evening'],
  },
  {
    id: 'tuteeqoon',
    ar: 'علَيكُم بما تُطيقونَ، فواللهِ لا يَمَلُّ اللهُ حتَّى تَمَلُّوا',
    en: 'Take on only what you are able to do, for by Allah, Allah does not grow weary until you grow weary.',
    refEn: 'Sahih al-Bukhari 43', refAr: 'صحيح البخاري ٤٣',
    dorar: 'https://dorar.net/hadith/sharh/2681',
    use: ['daily', 'restart'],
  },
  {
    id: 'yusr',
    ar: 'إنَّ الدِّينَ يُسرٌ، ولَن يُشادَّ الدِّينَ أحَدٌ إلَّا غَلَبَه، فسَدِّدوا وقارِبوا، وأبشِروا',
    en: 'The religion is easy. No one overburdens himself in religion except that it overpowers him. So be balanced, come close to perfection, and receive good tidings.',
    refEn: 'Sahih al-Bukhari 39', refAr: 'صحيح البخاري ٣٩',
    dorar: 'https://dorar.net/h/lXt1iJzo',
    use: ['daily', 'morning', 'restart'],
  },
  {
    id: 'niyyah',
    ar: 'إنَّما الأعمالُ بالنيَّاتِ، وإنَّما لكلِّ امرئٍ ما نوى',
    en: 'Actions are only by intentions, and every person will have only what they intended.',
    refEn: 'Al-Bukhari 1 · Muslim 1907', refAr: 'رواه البخاري ومسلم',
    dorar: 'https://dorar.net/feqhia/2644/%D8%A7%D9%84%D9%85%D8%A8%D8%AD%D8%AB-%D8%A7%D9%84%D8%B3%D8%A7%D8%A8%D8%B9:-%D8%A7%D9%84%D9%86%D9%8A%D9%80%D9%80%D9%91%D9%8E%D9%80%D9%80%D8%A9%D9%8F-%D9%81%D9%8A-%D8%A7%D9%84%D8%B5%D9%80%D9%91%D9%8E%D9%80%D9%80%D9%88%D9%85%D9%90%C2%A0',
    use: ['daily', 'morning'],
  },
  {
    id: 'la_takun',
    ar: 'يا عَبْدَ اللَّهِ، لا تَكُنْ مِثْلَ فُلانٍ؛ كانَ يَقُومُ اللَّيْلَ، فَتَرَكَ قِيَامَ اللَّيْلِ',
    en: 'O Abdullah, do not be like so-and-so: he used to pray at night, then he gave up praying at night.',
    refEn: 'Al-Bukhari 1152 · Muslim 1159', refAr: 'رواه البخاري ومسلم',
    dorar: 'https://dorar.net/hadith/sharh/1864',
    use: ['daily', 'evening'],
  },
  {
    id: 'safar',
    ar: 'إذا مَرِضَ العَبدُ أو سافَرَ كُتِبَ له مِثلُ ما كان يَعمَلُ مُقِيمًا صَحيحًا',
    en: 'When a servant falls ill or travels, the reward of what he used to do while at home and healthy is written for him.',
    refEn: 'Sahih al-Bukhari 2996', refAr: 'صحيح البخاري ٢٩٩٦',
    dorar: 'https://dorar.net/hadith/sharh/60920',
    use: ['daily', 'restart'],
  },
  {
    id: 'nawafil',
    ar: 'وما يَزالُ عَبْدِي يَتَقَرَّبُ إلَيَّ بالنَّوافِلِ حتَّى أُحِبَّهُ',
    en: 'My servant keeps drawing nearer to Me with voluntary deeds until I love him. (hadith qudsi)',
    refEn: 'Sahih al-Bukhari 6502', refAr: 'صحيح البخاري ٦٥٠٢',
    dorar: 'https://dorar.net/hadith/sharh/114740',
    use: ['daily', 'evening'],
  },
  {
    id: 'ihris',
    ar: 'احْرِصْ علَى ما يَنْفَعُكَ، وَاسْتَعِنْ باللَّهِ وَلَا تَعْجِزْ',
    en: 'Be eager for what benefits you, seek help from Allah, and do not give up.',
    refEn: 'Sahih Muslim 2664', refAr: 'صحيح مسلم ٢٦٦٤',
    dorar: 'https://dorar.net/hadith/sharh/21374',
    use: ['daily', 'morning', 'restart'],
  },
  {
    id: 'tawwabun',
    ar: 'كلُّ ابنِ آدمَ خطَّاءٌ، وخيرُ الخطَّائينَ التَّوَّابونَ',
    en: 'Every child of Adam errs, and the best of those who err are those who repent.',
    refEn: 'At-Tirmidhi 2499 (hasan)', refAr: 'سنن الترمذي ٢٤٩٩ (حسن)',
    dorar: 'https://dorar.net/h/Axwahn2Z',
    use: ['restart', 'evening'],
  },
];

export function hadithForDay(dayNumber, use = 'daily') {
  const list = HADITH.filter((h) => h.use.includes(use));
  const i = ((dayNumber % list.length) + list.length) % list.length;
  return list[i];
}
