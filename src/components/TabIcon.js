import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

// Thin-line icons in the app's gold. 24×24 grid.
function star(cx, cy, R, r) {
  let d = '';
  for (let i = 0; i < 16; i++) {
    const a = (Math.PI / 8) * i - Math.PI / 2;
    const rad = i % 2 ? r : R;
    d += (i ? 'L' : 'M') + (cx + rad * Math.cos(a)).toFixed(2) + ' ' + (cy + rad * Math.sin(a)).toFixed(2);
  }
  return d + 'Z';
}

export default function TabIcon({ name, color, size = 24 }) {
  const p = { stroke: color, strokeWidth: 1.6, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'today' ? (
        <>
          <Circle cx="12" cy="12" r="8.5" {...p} />
          <Path d="M8 12.3l2.7 2.7L16.2 9.5" {...p} />
        </>
      ) : null}
      {name === 'progress' ? (
        <>
          <Circle cx="12" cy="12" r="8.5" {...p} opacity={0.35} />
          <Path d="M12 3.5A8.5 8.5 0 0 1 19.4 16.2" {...p} />
          <Circle cx="12" cy="12" r="2" fill={color} />
        </>
      ) : null}
      {name === 'challenges' ? <Path d={star(12, 12, 9.5, 6.2)} {...p} /> : null}
      {name === 'settings' ? (
        <>
          <Path d="M4 7h16M4 12h16M4 17h16" {...p} opacity={0.35} />
          <Circle cx="9" cy="7" r="2" {...p} fill={color} />
          <Circle cx="15" cy="12" r="2" {...p} fill={color} />
          <Circle cx="7" cy="17" r="2" {...p} fill={color} />
        </>
      ) : null}
    </Svg>
  );
}
