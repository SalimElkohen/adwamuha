import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addDays, dayBeforeRamadan, todayKey } from './dates';
import { catalogItem, goalFromCatalog } from '../data/catalog';
import { goalScore } from './stats';
import { makeT } from '../i18n';
import { MAX_SETS, SET_IDS, migrateSets } from './sets';

const KEY = 'adwamuha:v1';

export function initialState() {
  return {
    version: 1,
    lang: 'en',
    onboarded: false,
    hijriAdjust: 0,
    period: { start: todayKey(), end: null },
    sets: [], // [{ id: 'worship' | 'strong', name: string | null }] – at most two
    goals: [],
    marks: {},
    reminders: { list: [] }, // [{ id, time: 'HH:MM', on }] – none until the user adds one
    challenges: [], // { id, title:{en,ar}, start, end, goalIds }
    history: [], // { id, title, start, end, pct, finishedAt }
    excused: {}, // { 'YYYY-MM-DD': 'all' } – travelling or ill
    seen: {}, // cards already shown and closed (milestones, seasons, restarts)
    growSnooze: {}, // { goalId: 'YYYY-MM-DD' } – ask again after this day
  };
}

// older installs had two fixed reminders: keep them as list entries
function migrateReminders(s) {
  const r = s.reminders || {};
  if (Array.isArray(r.list)) return s;
  const list = [];
  if (s.onboarded && r.morning) list.push({ id: 'r_m', time: r.morningTime || '05:00', on: true });
  if (s.onboarded && r.evening) list.push({ id: 'r_e', time: r.eveningTime || '18:00', on: true });
  return { ...s, reminders: { list } };
}

// repair: goals left with a future start after the journey was moved earlier
function fixGoalStarts(s) {
  const p = s.period || {};
  const today = todayKey();
  if (!p.start || p.start > today) return s;
  let changed = false;
  const goals = (s.goals || []).map((g) => {
    if (!g.challengeId && g.start && g.start > today) { changed = true; return { ...g, start: p.start }; }
    return g;
  });
  return changed ? { ...s, goals } : s;
}

const Ctx = createContext(null);

export function StoreProvider({ children }) {
  const [state, setState] = useState(null);
  const saveTimer = useRef(null);

  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (!alive) return;
        let s = initialState();
        if (raw) {
          try { s = fixGoalStarts(migrateReminders(migrateSets({ ...s, ...JSON.parse(raw) }))); } catch (e) {}
        }
        setState(s);
      })
      .catch(() => alive && setState(initialState()));
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!state) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {});
    }, 250);
  }, [state]);

  const update = useCallback((fn) => setState((s) => fn(s)), []);

  const actions = useMemo(() => ({
    setLang: (lang) => update((s) => ({ ...s, lang })),
    setHijriAdjust: (hijriAdjust) =>
      update((s) => {
        // a journey that ends the day before Ramadan follows the calendar setting
        const p = s.period || {};
        const wasRamadan = p.end && p.end === dayBeforeRamadan(p.start, s.hijriAdjust);
        const period = wasRamadan ? { ...p, end: dayBeforeRamadan(p.start, hijriAdjust) || p.end } : p;
        return { ...s, hijriAdjust, period };
      }),
    setPeriod: (period) =>
      update((s) => {
        // goals that began with the journey move with its start date
        const old = s.period && s.period.start;
        const goals = old && period.start !== old
          ? s.goals.map((g) => (!g.challengeId && (!g.start || g.start === old) ? { ...g, start: period.start } : g))
          : s.goals;
        return { ...s, period, goals };
      }),
    setReminders: (r) => update((s) => ({ ...s, reminders: { ...s.reminders, ...r } })),
    finishOnboarding: ({ lang, sets, goals, period, hijriAdjust, reminders }) =>
      update((s) => ({ ...s, lang, sets, goals, period, hijriAdjust, reminders: { ...s.reminders, ...reminders }, onboarded: true })),
    setExcused: (key, kind) =>
      update((s) => {
        const excused = { ...(s.excused || {}) };
        if (kind) excused[key] = kind; else delete excused[key];
        return { ...s, excused };
      }),
    markIntro: (k) => update((s) => ({ ...s, lastIntro: k })),
    dismiss: (key) => update((s) => ({ ...s, seen: { ...(s.seen || {}), [key]: true } })),
    snoozeGrow: (goalId, until) => update((s) => ({ ...s, growSnooze: { ...(s.growSnooze || {}), [goalId]: until } })),
    renameSet: (id, name) => update((s) => ({ ...s, sets: s.sets.map((x) => (x.id === id ? { ...x, name } : x)) })),
    addSet: () =>
      update((s) => {
        if (s.sets.length >= MAX_SETS) return s;
        const id = SET_IDS.find((x) => !s.sets.some((y) => y.id === x));
        return { ...s, sets: [...s.sets, { id, name: null }] };
      }),
    deleteSet: (id) =>
      update((s) => {
        if (s.sets.length <= 1) return s;
        const gone = s.goals.filter((g) => !g.challengeId && g.setId === id).map((g) => g.id);
        const marks = { ...s.marks };
        gone.forEach((g) => delete marks[g]);
        return {
          ...s,
          sets: s.sets.filter((x) => x.id !== id),
          goals: s.goals.filter((g) => !gone.includes(g.id)),
          marks,
          challenges: s.challenges.map((c) => ({ ...c, linkedIds: (c.linkedIds || []).filter((x) => !gone.includes(x)) })),
        };
      }),
    toggleMark: (goalId, key, val) =>
      update((s) => {
        const m = { ...(s.marks[goalId] || {}) };
        if (m[key] === val) delete m[key];
        else m[key] = val;
        return { ...s, marks: { ...s.marks, [goalId]: m } };
      }),
    cycleMark: (goalId, key) =>
      update((s) => {
        const m = { ...(s.marks[goalId] || {}) };
        const c = m[key];
        if (!c) m[key] = 'd';
        else if (c === 'd') m[key] = 'x';
        else delete m[key];
        return { ...s, marks: { ...s.marks, [goalId]: m } };
      }),
    addGoal: (goal) => update((s) => ({ ...s, goals: [...s.goals, { start: todayKey() > s.period.start ? todayKey() : s.period.start, ...goal }] })),
    updateGoal: (id, patch) => update((s) => ({ ...s, goals: s.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)) })),
    deleteGoal: (id) =>
      update((s) => {
        const marks = { ...s.marks };
        delete marks[id];
        return {
          ...s,
          goals: s.goals.filter((g) => g.id !== id),
          marks,
          challenges: s.challenges.map((c) => ({ ...c, goalIds: c.goalIds.filter((x) => x !== id) })),
        };
      }),
    joinChallenge: (ch, start, end) =>
      update((s) => {
        // goals the user already tracks as habits are linked, not duplicated
        const linkedIds = [];
        const goals = ch.goals
          .map((g) => {
            if (typeof g === 'string') {
              const existing = s.goals.find((x) => x.catalogId === g && !x.archived && !x.challengeId);
              if (existing) { linkedIds.push(existing.id); return null; }
              const c = catalogItem(g);
              return c ? goalFromCatalog(c, { challengeId: ch.id, start, end }) : null;
            }
            return {
              id: 'c_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
              catalogId: null,
              title: { en: g.en, ar: g.ar },
              freq: g.freq || 'daily',
              perWeek: g.perWeek || null,
              target: g.target || '',
              unit: null,
              challengeId: ch.id,
              start,
              end,
              archived: false,
            };
          })
          .filter(Boolean);
        const entry = { id: ch.id, title: { en: ch.en.title, ar: ch.ar.title }, start, end, goalIds: goals.map((g) => g.id), linkedIds };
        return { ...s, goals: [...s.goals, ...goals], challenges: [...s.challenges.filter((c) => c.id !== ch.id), entry] };
      }),
    extendChallenge: (id, days) =>
      update((s) => {
        const ch = s.challenges.find((c) => c.id === id);
        if (!ch) return s;
        const end = addDays(ch.end < todayKey() ? addDays(todayKey(), -1) : ch.end, days);
        return {
          ...s,
          challenges: s.challenges.map((c) => (c.id === id ? { ...c, end } : c)),
          goals: s.goals.map((g) => (ch.goalIds.includes(g.id) ? { ...g, end } : g)),
        };
      }),
    finishChallenge: (id, leaveEarly) =>
      update((s) => {
        const ch = s.challenges.find((c) => c.id === id);
        if (!ch) return s;
        const today = todayKey();
        const end = leaveEarly && ch.end > today ? today : ch.end;
        const all = [...ch.goalIds, ...(ch.linkedIds || [])];
        const goals = s.goals.filter((g) => all.includes(g.id));
        let done = 0, expected = 0;
        goals.forEach((g) => {
          const r = goalScore({ ...g, start: ch.start, end, challengeId: ch.id }, s, today);
          done += r.done; expected += r.expected;
        });
        const record = { id: ch.id + '_' + ch.start, title: ch.title, start: ch.start, end, pct: expected ? Math.round((100 * done) / expected) : null, finishedAt: today };
        return {
          ...s,
          challenges: s.challenges.filter((c) => c.id !== id),
          goals: s.goals.map((g) => (ch.goalIds.includes(g.id) ? { ...g, archived: true, end } : g)),
          history: [record, ...s.history],
        };
      }),
    resetAll: () => setState({ ...initialState() }),
  }), [update]);

  const value = useMemo(() => (state ? { state, actions, t: makeT(state.lang), rtl: state.lang === 'ar' } : null), [state, actions]);
  if (!value) return null;
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  return useContext(Ctx);
}
