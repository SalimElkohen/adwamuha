import { addDays, diffDays, rangeKeys } from './dates';

// A goal is tracked from its own start (the day it was added, or its challenge start)
// to its own end (challenge end, or the journey end, or open-ended).
export function goalStart(goal, state) {
  const s = goal.start || state.period.start;
  return s > state.period.start || goal.challengeId ? s : state.period.start;
}
export function goalEnd(goal, state) {
  if (goal.end) return goal.end;
  return state.period.end || null;
}
export function isActiveOn(goal, state, key) {
  if (goal.archived) return false;
  const a = goalStart(goal, state);
  const b = goalEnd(goal, state);
  return key >= a && (!b || key <= b);
}
export function activeGoals(state, key) {
  return state.goals.filter((g) => isActiveOn(g, state, key));
}
export function mark(state, goalId, key) {
  const m = state.marks[goalId];
  return (m && m[key]) || null;
}

// Weekly goals count in 7-day blocks from the goal's start.
export function weekBlock(goal, state, key) {
  const a = goalStart(goal, state);
  const idx = Math.floor(diffDays(a, key) / 7);
  const bs = addDays(a, idx * 7);
  let be = addDays(bs, 6);
  const end = goalEnd(goal, state);
  if (end && be > end) be = end;
  const len = diffDays(bs, be) + 1;
  const target = Math.min(goal.perWeek || 1, Math.ceil(((goal.perWeek || 1) * len) / 7));
  let done = 0;
  rangeKeys(bs, be).forEach((k) => {
    if (mark(state, goal.id, k) === 'd') done++;
  });
  return { start: bs, end: be, target, done, index: idx };
}

// done / expected for one goal from its start up to `today` (or its end).
export function goalScore(goal, state, today) {
  const a = goalStart(goal, state);
  const endG = goalEnd(goal, state);
  const b = endG && endG < today ? endG : today;
  if (b < a) return { done: 0, expected: 0, pct: null };
  if (goal.freq === 'weekly') {
    let done = 0, expected = 0;
    let k = a;
    while (k <= b) {
      const blk = weekBlock(goal, state, k);
      const finished = blk.end < today || (endG && blk.end === endG && endG <= today);
      const d = Math.min(blk.done, blk.target);
      if (finished) { done += d; expected += blk.target; }
      else { done += d; expected += d; } // current week: neutral until it ends
      k = addDays(blk.end, 1);
    }
    return { done, expected, pct: expected ? (100 * done) / expected : null };
  }
  let done = 0;
  const days = diffDays(a, b) + 1;
  rangeKeys(a, b).forEach((k) => {
    if (mark(state, goal.id, k) === 'd') done++;
  });
  return { done, expected: days, pct: days ? (100 * done) / days : null };
}

export function constancy(state, today, goals) {
  let done = 0, expected = 0;
  (goals || state.goals.filter((g) => !g.archived)).forEach((g) => {
    const s = goalScore(g, state, today);
    done += s.done;
    expected += s.expected;
  });
  return { done, expected, pct: expected ? (100 * done) / expected : null };
}

// Days in a row (ending today, or yesterday if today is not finished yet) on which every
// daily goal active that day was done.
export function dayComplete(state, key) {
  const daily = activeGoals(state, key).filter((g) => g.freq !== 'weekly');
  if (!daily.length) return null;
  return daily.every((g) => mark(state, g.id, key) === 'd');
}
export function streak(state, today) {
  let k = today;
  if (dayComplete(state, k) !== true) k = addDays(k, -1);
  let n = 0;
  for (let i = 0; i < 2000; i++) {
    if (k < state.period.start) break;
    const c = dayComplete(state, k);
    if (c === true) n++;
    else if (c === null) { /* no daily goals that day: skip */ }
    else break;
    k = addDays(k, -1);
  }
  return n;
}
export function goalStreak(goal, state, today) {
  let k = mark(state, goal.id, today) === 'd' ? today : addDays(today, -1);
  const a = goalStart(goal, state);
  let n = 0;
  while (k >= a && mark(state, goal.id, k) === 'd') { n++; k = addDays(k, -1); }
  return n;
}
export function dayFraction(state, key) {
  const daily = activeGoals(state, key).filter((g) => g.freq !== 'weekly');
  if (!daily.length) return null;
  return daily.filter((g) => mark(state, g.id, key) === 'd').length / daily.length;
}
