// Goal sets: up to two named groups of everyday goals (challenges are separate).
// Set 1 "Worship / العبادات", set 2 "The strong believer / المؤمن القويّ" (Sahih Muslim 2664).
// A set's name is null while the user keeps the default, so it follows the app language.
import { catalogItem } from '../data/catalog';

export const SET_IDS = ['worship', 'strong'];
export const MAX_SETS = 2;

export function setName(set, t) {
  if (set && set.name && set.name.trim()) return set.name.trim();
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
// existing users (no sets yet): put each goal in the set of its pack
export function migrateSets(s) {
  if (s.sets) return s;
  const goals = (s.goals || []).map((g) => (g.challengeId || g.setId ? g : { ...g, setId: packSet(g.catalogId) }));
  const used = SET_IDS.filter((id) => goals.some((g) => !g.challengeId && !g.archived && g.setId === id));
  const sets = (used.length ? used : ['worship']).map((id) => ({ id, name: null }));
  return { ...s, goals, sets };
}
export function setGoals(state, setId, list) {
  return (list || state.goals).filter((g) => !g.challengeId && !g.archived && (g.setId || 'worship') === setId);
}
