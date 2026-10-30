export const C = {
  bg: '#F6F4EE',
  surface: '#FFFFFF',
  ink: '#14211B',
  muted: '#5F6E66',
  faint: '#8C978F',
  line: '#E3E1D8',
  accent: '#1D6B4E',
  accentSoft: '#DCEFE5',
  gold: '#A27620',
  goldSoft: '#F4EAD3',
  miss: '#B8433B',
  missSoft: '#F7E2DF',
  warn: '#C48510',
  empty: '#EBE9E1',
  white: '#FFFFFF',
};

export const R = { card: 16, row: 14, pill: 999 };

export function tone(p) {
  if (p == null) return C.faint;
  return p >= 80 ? C.accent : p >= 50 ? C.warn : C.miss;
}
