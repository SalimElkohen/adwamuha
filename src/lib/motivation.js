// Gentle motivation: per-goal milestones, Hijri season eves, kind restarts and step-ups.
import { addDays, hijriOf, rangeKeys } from './dates';
import { activeGoals, bestStreak, dayComplete, excusedFor, goalStart, goalStreak, mark, streakEnding } from './stats';
import { catalogItem } from '../data/catalog';

export const MILESTONES = [3, 7, 10, 15, 20, 30, 50, 100];
// step-ups for goals with an amount, in order
const hundreds = ['100', '200', '300', '400', '500', '600', '700', '800', '900', '1000'];
export const GROW = { quran: ['¼', '½', '1', '2'], istighfar: hundreds, salawat: hundreds };

// one card per goal whose streak just reached a milestone
export function milestoneCards(state, today) {
  const out = [];
  activeGoals(state, today).forEach((g) => {
    if (g.freq === 'weekly') return;
    const n = goalStreak(g, state, today);
    if (!MILESTONES.includes(n)) return;
    const end = mark(state, g.id, today) === 'd' ? today : addDays(today, -1);
    const key = 'm:' + g.id + ':' + n + ':' + addDays(end, -(n - 1)); // a new streak can reach the same milestone again
    if (!(state.seen || {})[key]) out.push({ key, goal: g, n });
  });
  return out.sort((a, b) => b.n - a.n);
}

// eve of Rajab (7), Shaʿbān (8) and Ramadan (9)
export function seasonCard(state, today) {
  const h = hijriOf(addDays(today, 1), state.hijriAdjust);
  if (h.d !== 1 || ![7, 8, 9].includes(h.m)) return null;
  const key = 's:' + h.y + '-' + h.m;
  return (state.seen || {})[key] ? null : { key, month: h.m, year: h.y };
}

// yesterday broke a streak of 3 days or more
export function restartCard(state, today) {
  const y = addDays(today, -1);
  if (y < state.period.start || dayComplete(state, y) !== false) return null;
  const prev = streakEnding(state, addDays(today, -2));
  if (prev < 3) return null;
  const key = 'r:' + y;
  return (state.seen || {})[key] ? null : { key, prev, best: bestStreak(state, today) };
}

// a goal kept at 90% or more for the last 30 days, with a next step available
export function growCard(state, today) {
  for (const g of activeGoals(state, today)) {
    const steps = GROW[g.catalogId];
    if (!steps || g.challengeId || g.freq === 'weekly') continue;
    const c = catalogItem(g.catalogId);
    const cur = String(g.target || (c && c.target) || '');
    const i = steps.indexOf(cur);
    if (i < 0 || i === steps.length - 1) continue;
    if ((state.growSnooze || {})[g.id] && state.growSnooze[g.id] > today) continue;
    const from = addDays(today, -30);
    if (goalStart(g, state) > from) continue; // tracked for at least 30 days
    let done = 0, expected = 0;
    rangeKeys(from, addDays(today, -1)).forEach((k) => {
      const d = mark(state, g.id, k) === 'd';
      if (excusedFor(state, g, k) && !d) return;
      expected++; if (d) done++;
    });
    if (expected >= 20 && done / expected >= 0.9) return { goal: g, from: cur, to: steps[i + 1] };
  }
  return null;
}
