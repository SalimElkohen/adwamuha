import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Pattern, Rect, Stop } from 'react-native-svg';
import { useStore } from '../lib/store';
import { WELCOME } from '../data/hadith';

// Welcome page in the spirit of al-Masjid an-Nabawi: ivory marble, a pointed arch
// framing the hadith, and a faint eight-pointed star lattice on the walls.
export const MADINAH = {
  ivory: '#F8F3E8',
  ivoryDeep: '#EDE3CD',
  niche: '#FCFAF4',
  gold: '#B8913F',
  goldSoft: '#D9C08A',
  dome: '#2F8A5F',
  domeDeep: '#226B49',
  ink: '#2A2317',
  inkSoft: '#6B5D43',
};
const M = MADINAH;

// One tile of the lattice: an eight-pointed star (two squares) with spokes to the tile edges.
function starTile(T) {
  const c = T / 2, R = T * 0.3, r = R * 0.765;
  let d = '';
  for (let k = 0; k < 16; k++) {
    const a = (Math.PI / 8) * k - Math.PI / 2;
    const rad = k % 2 === 0 ? R : r;
    d += (k === 0 ? 'M' : 'L') + (c + rad * Math.cos(a)).toFixed(2) + ' ' + (c + rad * Math.sin(a)).toFixed(2) + ' ';
  }
  d += 'Z ';
  // spokes from the star tips to edge midpoints and corners, so tiles join into one lattice
  for (let k = 0; k < 8; k++) {
    const a = (Math.PI / 4) * k - Math.PI / 2;
    const x1 = c + R * Math.cos(a), y1 = c + R * Math.sin(a);
    const x2 = k % 2 === 0 ? c + c * Math.round(Math.cos(a)) : c + c * Math.sign(Math.cos(a));
    const y2 = k % 2 === 0 ? c + c * Math.round(Math.sin(a)) : c + c * Math.sign(Math.sin(a));
    d += 'M' + x1.toFixed(2) + ' ' + y1.toFixed(2) + ' L' + x2.toFixed(2) + ' ' + y2.toFixed(2) + ' ';
  }
  return d;
}

// Pointed (two-centred) arch: straight sides from the bottom up to the springing line,
// then two arcs meeting at the apex.
function archPath(xL, xR, ys, yb, k = 0.66) {
  const span = xR - xL, r = span * k, xc = (xL + xR) / 2;
  const h = Math.sqrt(r * r - (r - span / 2) * (r - span / 2));
  const ya = ys - h;
  return { d: `M${xL} ${yb} L${xL} ${ys} A${r} ${r} 0 0 1 ${xc} ${ya} A${r} ${r} 0 0 1 ${xR} ${ys} L${xR} ${yb} Z`, ya };
}

// height of the arched part for a given span
function archRise(span, k = 0.66) {
  const r = span * k;
  return Math.sqrt(r * r - (r - span / 2) * (r - span / 2));
}

function rosette(cx, cy, R) {
  const r = R * 0.765;
  let d = '';
  for (let k = 0; k < 16; k++) {
    const a = (Math.PI / 8) * k - Math.PI / 2;
    const rad = k % 2 === 0 ? R : r;
    d += (k === 0 ? 'M' : 'L') + (cx + rad * Math.cos(a)).toFixed(2) + ' ' + (cy + rad * Math.sin(a)).toFixed(2) + ' ';
  }
  return d + 'Z';
}

function Backdrop({ W, H, arch }) {
  const T = Math.round(Math.max(40, W / 9));
  const { xL, xR, ys, yb } = arch;
  const outer = archPath(xL, xR, ys, yb);
  const inner = archPath(xL + 8, xR - 8, ys, yb - 8);
  const cx = W / 2;
  return (
    <Svg width={W} height={H} style={{ position: 'absolute', top: 0, left: 0 }}>
      <Defs>
        <LinearGradient id="marble" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={M.ivory} />
          <Stop offset="1" stopColor={M.ivoryDeep} />
        </LinearGradient>
        <Pattern id="girih" patternUnits="userSpaceOnUse" width={T} height={T}>
          <Path d={starTile(T)} stroke={M.gold} strokeWidth={0.9} fill="none" opacity={0.32} />
        </Pattern>
      </Defs>
      <Rect x={0} y={0} width={W} height={H} fill="url(#marble)" />
      <Rect x={0} y={0} width={W} height={H} fill="url(#girih)" />
      {/* the niche */}
      <Path d={outer.d} fill={M.niche} stroke={M.gold} strokeWidth={1.6} />
      <Path d={inner.d} fill="none" stroke={M.goldSoft} strokeWidth={0.9} />
      <Path d={rosette(cx, outer.ya + (ys - outer.ya) * 0.24, 9)} fill="none" stroke={M.gold} strokeWidth={1} />
    </Svg>
  );
}

export default function Splash({ onDone }) {
  const { state, t } = useStore();
  const ar = state.lang === 'ar';
  const [size, setSize] = useState(null);
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 900, delay: 250, useNativeDriver: true }).start();
    const id = setTimeout(onDone, 8000);
    return () => clearTimeout(id);
  }, [onDone, fade]);

  let body = null;
  if (size) {
    const { width: W, height: H } = size;
    const s = Math.max(0.8, Math.min(1.1, H / 800));
    const xL = Math.max(20, W * 0.06), xR = W - xL;
    const rise = archRise(xR - xL);
    const ya = Math.max(44, H * 0.06);
    const ys = ya + rise, yb = H - 132;
    const arch = { xL, xR, ys, yb };
    const top = ya + rise * 0.4;
    // keep the text inside the curve: arch width at the text's top line
    const span = xR - xL, r = span * 0.66, dy = Math.max(0, ys - (top + 6));
    const edge = dy > 0 ? xL + r - Math.sqrt(Math.max(0, r * r - dy * dy)) : xL;
    const inset = Math.max(xL + 18, edge + 12);
    body = (
      <>
        <Backdrop W={W} H={H} arch={arch} />
        <Animated.View style={{ position: 'absolute', left: inset, right: inset, top, bottom: H - yb + 14, justifyContent: 'center', gap: 14 * s, opacity: fade }}>
          <Text style={{ fontFamily: 'Amiri-Regular', fontSize: 23 * s, lineHeight: 46 * s, color: M.ink, textAlign: 'center', writingDirection: 'rtl' }}>{WELCOME.ar}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <View style={{ width: 34, height: 1, backgroundColor: M.goldSoft }} />
            <View style={{ width: 7, height: 7, backgroundColor: M.gold, transform: [{ rotate: '45deg' }] }} />
            <View style={{ width: 34, height: 1, backgroundColor: M.goldSoft }} />
          </View>
          {!ar ? (
            <Text style={{ fontFamily: 'Amiri-Italic', fontSize: 15.5 * s, lineHeight: 23 * s, color: M.inkSoft, textAlign: 'center' }}>“{WELCOME.en}”</Text>
          ) : null}
          <Text style={{ fontFamily: 'Amiri-Regular', fontSize: 13.5 * s, color: M.gold, textAlign: 'center', letterSpacing: ar ? 0 : 0.6 }}>{ar ? WELCOME.refAr : WELCOME.refEn}</Text>
        </Animated.View>
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 20, alignItems: 'center', gap: 2 }}>
          <Text style={{ fontFamily: 'Amiri-Bold', fontSize: 24, color: M.gold, lineHeight: 34 }}>أدومها</Text>
          <Text style={{ fontSize: 11, letterSpacing: 3.5, color: M.domeDeep, fontWeight: '600' }}>ADWAMUHĀ</Text>
          <Text style={{ fontSize: 11, color: M.inkSoft, opacity: 0.7, marginTop: 8 }}>{t('tapToContinue')}</Text>
        </View>
      </>
    );
  }

  return (
    <Pressable onPress={onDone} accessibilityLabel={t('tapToContinue')} style={{ flex: 1, backgroundColor: M.ivory }}>
      <View style={{ flex: 1 }} onLayout={(e) => setSize(e.nativeEvent.layout)}>{body}</View>
    </Pressable>
  );
}
