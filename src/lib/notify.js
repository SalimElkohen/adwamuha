import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { HADITH } from '../data/hadith';

// Show reminders even when the app is open.
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
  });
} catch (e) {}

function parseTime(s, fallback) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(s || '');
  if (!m) return fallback;
  return { hour: Math.min(23, +m[1]), minute: Math.min(59, +m[2]) };
}

export async function ensurePermission() {
  if (Platform.OS === 'web') return false;
  try {
    const cur = await Notifications.getPermissionsAsync();
    if (cur.granted) return true;
    if (!cur.canAskAgain) return false;
    const req = await Notifications.requestPermissionsAsync({ ios: { allowAlert: true, allowSound: true, allowBadge: false } });
    return !!req.granted;
  } catch (e) {
    return false;
  }
}

// Re-schedules the daily reminders (any number, each at its own time). Called on launch and whenever settings change,
// so the hadith in each reminder rotates.
export async function scheduleReminders(state, t) {
  if (Platform.OS === 'web') return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    const list = ((state.reminders || {}).list || []).filter((x) => x.on);
    if (!list.length) return;
    const ok = await ensurePermission();
    if (!ok) return;
    const lang = state.lang === 'ar' ? 'ar' : 'en';
    const dayNo = Math.floor(Date.now() / 86400000);
    const pick = (use, offset) => {
      const pool = HADITH.filter((h) => h.use.includes(use));
      return pool[(dayNo + offset) % pool.length];
    };
    // each reminder at its own time; before noon a morning title and hadith, after noon an evening one
    const jobs = list.map((x, i) => {
      const time = parseTime(x.time, { hour: 5, minute: 0 });
      const am = time.hour < 12;
      const h = pick(am ? 'morning' : 'evening', i);
      return { title: t(am ? 'notifMorningTitle' : 'notifEveningTitle'), body: (lang === 'ar' ? h.ar : h.en) + ' (' + (lang === 'ar' ? h.refAr : h.refEn) + ')', time };
    });
    for (const j of jobs) {
      await Notifications.scheduleNotificationAsync({
        content: { title: j.title, body: j.body },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: j.time.hour, minute: j.time.minute },
      });
    }
  } catch (e) {}
}
