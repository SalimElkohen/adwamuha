// Green Dome palette: inspired by the green dome of the Prophet's Mosque ﷺ in Madinah —
// deep dome green as the ground, gold for what is achieved, ivory for text.
export const C = {
  bg: '#1D6B4E', // dome green
  bgDeep: '#175A41',
  surface: '#22775A', // cards, a step lighter than the ground
  ink: '#F8F3E8', // ivory text
  muted: '#CFE0D6',
  faint: '#9CC2AF',
  line: '#3A8A6A',
  accent: '#E3C277', // gold: done, primary actions
  onAccent: '#163F2F', // text on gold
  accentSoft: '#356E4C', // gold-tinted green for done rows
  gold: '#E3C277',
  goldSoft: '#2E6A4E',
  miss: '#F4A08F',
  missSoft: '#5B5240',
  warn: '#F2C14E',
  empty: '#2C7F5F',
  white: '#FFFFFF',
};

export const R = { card: 16, row: 14, pill: 999 };

export function tone(p) {
  if (p == null) return C.faint;
  return p >= 80 ? C.accent : p >= 50 ? C.warn : C.miss;
}
