// Goal sets: up to two named groups of everyday goals (challenges are separate).
// Set 1 "Worship / العبادات", set 2 "The strong believer / المؤمن القويّ" (Sahih Muslim 2664).
// A set's name is null while the user keeps the default, so it follows the app language.
import { catalogItem } from '../data/catalog';

export const SET_IDS = ['worship', 'strong'];
export const MAX_SETS = 2;

// set names are fixed (not editable); they follow the app language
export function setName(set, t) {
  return t(set && set.id === 'strong' ? 'setStrong' : 'setWorship');
}
export function defaultName(id, t) {
  return t(id === 'strong' ? 'setStrong' : 'setWorship');
}
// the name to store: null when it is empty or the same as the default
export function cleanName(value, id, t) {
  const v = (value || '').trim();
  return !v || v === defaultName(id, t) ? null : v;
}
// which set a goal belongs in by default (catalog pack)
export function packSet(catalogId) {
  const c = catalogId ? catalogItem(catalogId) : null;
  return c && c.pack === 'life' ? 'strong' : 'worship';
}
// Data from before sets existed (or saved with an empty set list): give every everyday goal
// a set from its suggestion pack, and make sure each set in use exists. Safe to run on every launch.
export function migrateSets(s) {
  if (!s.onboarded) return s.sets ? s : { ...s, sets: [] };
  let changed = false;
  const goals = (s.goals || []).map((g) => {
    if (g.challengeId || SET_IDS.includes(g.setId)) return g;
    changed = true;
    return { ...g, setId: packSet(g.catalogId) };
  });
  const have = (s.sets || []).filter((x) => SET_IDS.includes(x.id));
  const used = SET_IDS.filter((id) => goals.some((g) => !g.challengeId && !g.archived && g.setId === id));
  const sets = [...have];
  used.forEach((id) => { if (!sets.some((x) => x.id === id)) { sets.push({ id, name: null }); changed = true; } });
  if (!sets.length) { sets.push({ id: 'worship', name: null }); changed = true; }
  sets.sort((a, b) => SET_IDS.indexOf(a.id) - SET_IDS.indexOf(b.id));
  return changed || sets.length !== (s.sets || []).length ? { ...s, goals, sets } : s;
}
export function setGoals(state, setId, list) {
  return (list || state.goals).filter((g) => !g.challengeId && !g.archived && (g.setId || 'worship') === setId);
}
