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

// Re-schedules the two daily reminders. Called on launch and whenever settings change,
// so the hadith in each reminder rotates.
export async function scheduleReminders(state, t) {
  if (Platform.OS === 'web') return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    const r = state.reminders || {};
    if (!r.morning && !r.evening) return;
    const ok = await ensurePermission();
    if (!ok) return;
    const lang = state.lang === 'ar' ? 'ar' : 'en';
    const dayNo = Math.floor(Date.now() / 86400000);
    const pick = (use, offset) => {
      const list = HADITH.filter((h) => h.use.includes(use));
      return list[(dayNo + offset) % list.length];
    };
    const jobs = [];
    if (r.morning) {
      const h = pick('morning', 0);
      jobs.push({ title: t('notifMorningTitle'), body: (lang === 'ar' ? h.ar : h.en) + ' (' + (lang === 'ar' ? h.refAr : h.refEn) + ')', time: parseTime(r.morningTime, { hour: 5, minute: 0 }) });
    }
    if (r.evening) {
      const h = pick('evening', 1);
      jobs.push({ title: t('notifEveningTitle'), body: (lang === 'ar' ? h.ar : h.en) + ' (' + (lang === 'ar' ? h.refAr : h.refEn) + ')', time: parseTime(r.eveningTime, { hour: 18, minute: 0 }) });
    }
    for (const j of jobs) {
      await Notifications.scheduleNotificationAsync({
        content: { title: j.title, body: j.body },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: j.time.hour, minute: j.time.minute },
      });
    }
  } catch (e) {}
}
