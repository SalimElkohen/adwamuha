// Green Dome palette, inspired by the green dome of the Prophet's Mosque ﷺ in Madinah.
// Three colours only — dome green, ivory, gold — plus a soft terracotta reserved for "not done".
export const C = {
  bg: '#1D6B4E', // dome green
  bgDeep: '#175A41',
  surface: '#185C44', // cards sit a shade deeper than the ground, like inlaid panels
  raised: '#21765A', // controls inside cards (segmented track, steppers)
  ink: '#F8F3E8', // ivory
  muted: '#C9DACF',
  faint: '#8FB9A5',
  line: 'rgba(227,194,119,0.28)', // gold hairline around cards and outlined controls
  divider: 'rgba(248,243,232,0.09)', // between rows inside a card
  accent: '#E3C277', // gold
  onAccent: '#163F2F',
  accentSoft: 'rgba(227,194,119,0.13)',
  gold: '#E3C277',
  goldSoft: 'rgba(227,194,119,0.10)',
  miss: '#E9A38E', // soft terracotta
  missSoft: 'rgba(233,163,142,0.12)',
  warn: '#F0C661',
  empty: 'rgba(248,243,232,0.10)',
  white: '#FFFFFF',
};

export const F = {
  serif: 'Amiri-Bold', // headings: the logo's typeface
  serifRegular: 'Amiri-Regular',
};

export const R = { card: 18, row: 14, pill: 999 };

export function tone(p) {
  if (p == null) return C.faint;
  return p >= 80 ? C.accent : p >= 50 ? C.warn : C.miss;
}
