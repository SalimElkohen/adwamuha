import React from 'react';
import { View } from 'react-native';
import Svg, { Defs, G, Path, Pattern, Rect } from 'react-native-svg';
import { C } from '../theme';

function octagram(cx, cy, R, rot = 0) {
  const r = R * 0.765;
  let d = '';
  for (let k = 0; k < 16; k++) {
    const a = (Math.PI / 8) * k - Math.PI / 2 + rot;
    const rad = k % 2 === 0 ? R : r;
    d += (k === 0 ? 'M' : 'L') + (cx + rad * Math.cos(a)).toFixed(2) + ' ' + (cy + rad * Math.sin(a)).toFixed(2) + ' ';
  }
  return d + 'Z';
}

// Moroccan zellige "star and cross": one eight-pointed star per tile whose axis points meet
// the neighbouring stars, leaving crosses between them; drawn as gold ribbons with a small
// inner star, like carved tile work.
export function ZelligeTile({ T, gold, bg, opacity }) {
  const c = T / 2;
  const ribbon = octagram(c, c, c);
  return (
    <G opacity={opacity}>
      <Path d={ribbon} stroke={gold} strokeWidth={T * 0.075} fill="none" strokeLinejoin="round" />
      <Path d={ribbon} stroke={bg} strokeWidth={T * 0.03} fill="none" strokeLinejoin="round" />
      <Path d={octagram(c, c, c * 0.42, Math.PI / 8)} stroke={gold} strokeWidth={T * 0.022} fill="none" />
    </G>
  );
}

// The zellige of the opening, as a quiet background behind the app's screens.
export default function Lattice({ opacity = 0.16, tile = 48 }) {
  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      <Svg width="100%" height="100%">
        <Defs>
          <Pattern id="appLattice" patternUnits="userSpaceOnUse" width={tile} height={tile}>
            <ZelligeTile T={tile} gold={C.gold} bg={C.bg} opacity={opacity} />
          </Pattern>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#appLattice)" />
      </Svg>
    </View>
  );
}
