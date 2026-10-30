import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Pressable, Text, View } from 'react-native';
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

// length of the outline drawn by archPath (sides, both arcs, and the closing base)
function archLength(xL, xR, ys, yb, k = 0.66) {
  const span = xR - xL, r = span * k;
  const alpha = Math.acos((r - span / 2) / r);
  return 2 * (yb - ys) + 2 * r * alpha + span;
}

// The opening sequence, in milliseconds.
export const INTRO = { total: 2300, pattern: [0, 700], arch: [200, 1300], inner: [450, 1300], fill: [700, 800], star: [1300, 450], text: 1400, brand: 1800, hold: 2000, swap: 1000, after: 1400 };
// hadith fully shown at total; it stays `hold` ms, then gives way to the logo (`swap` ms); the app opens `after` ms later
const OPEN_AT = INTRO.total + INTRO.hold + INTRO.swap + INTRO.after;
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const ease = (v) => (v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2);
const phase = (t, [start, dur]) => ease(clamp01((t - start) / dur));

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

function Backdrop({ W, H, arch, t }) {
  const T = Math.round(Math.max(40, W / 9));
  const { xL, xR, ys, yb } = arch;
  const outer = archPath(xL, xR, ys, yb);
  const inner = archPath(xL + 8, xR - 8, ys, yb - 8);
  const Lo = archLength(xL, xR, ys, yb), Li = archLength(xL + 8, xR - 8, ys, yb - 8);
  const cx = W / 2;
  const pa = phase(t, INTRO.arch), pi = phase(t, INTRO.inner);
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
      <Rect x={0} y={0} width={W} height={H} fill="url(#girih)" opacity={phase(t, INTRO.pattern)} />
      {/* the niche fills in while its gold outline draws itself */}
      <Path d={outer.d} fill={M.niche} fillOpacity={phase(t, INTRO.fill)} stroke="none" />
      <Path d={outer.d} fill="none" stroke={M.gold} strokeWidth={1.6} strokeDasharray={`${Lo} ${Lo}`} strokeDashoffset={Lo * (1 - pa)} />
      <Path d={inner.d} fill="none" stroke={M.goldSoft} strokeWidth={0.9} strokeDasharray={`${Li} ${Li}`} strokeDashoffset={Li * (1 - pi)} />
      <Path d={rosette(cx, outer.ya + (ys - outer.ya) * 0.24, 9)} fill="none" stroke={M.gold} strokeWidth={1} opacity={phase(t, INTRO.star)} />
    </Svg>
  );
}

export default function Splash({ onDone }) {
  const { state, t: tr } = useStore();
  const ar = state.lang === 'ar';
  const short = WELCOME.ar.length < 70; // a short hadith gets larger type
  const [size, setSize] = useState(null);
  const fade = useRef(new Animated.Value(0)).current;
  const brand = useRef(new Animated.Value(0)).current;
  const swap = useRef(new Animated.Value(0)).current; // 0 = hadith, 1 = logo in the centre
  const [t, setT] = useState(0); // time into the opening sequence, ms

  useEffect(() => {
    let raf, alive = true;
    const run = (reduce) => {
      if (!alive) return;
      if (reduce) {
        setT(INTRO.total); fade.setValue(1); brand.setValue(1);
        Animated.timing(swap, { toValue: 1, duration: 400, delay: INTRO.hold, useNativeDriver: true }).start();
        return;
      }
      const t0 = Date.now();
      const tick = () => {
        if (!alive) return;
        const now = Date.now() - t0;
        setT(Math.min(now, INTRO.total));
        if (now < INTRO.total) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      Animated.timing(fade, { toValue: 1, duration: 900, delay: INTRO.text, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
      Animated.timing(brand, { toValue: 1, duration: 700, delay: INTRO.brand, useNativeDriver: true }).start();
      Animated.timing(swap, { toValue: 1, duration: INTRO.swap, delay: INTRO.total + INTRO.hold, easing: Easing.inOut(Easing.cubic), useNativeDriver: true }).start();
    };
    Promise.resolve(AccessibilityInfo && AccessibilityInfo.isReduceMotionEnabled ? AccessibilityInfo.isReduceMotionEnabled() : false)
      .then(run, () => run(false));
    const id = setTimeout(onDone, OPEN_AT);
    return () => { alive = false; cancelAnimationFrame(raf); clearTimeout(id); };
  }, [onDone, fade, brand, swap]);

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
    const LOGO_H = 52;
    const logoTop = H - 40 - LOGO_H; // resting place under the arch
    const centre = top + (yb - top) * 0.42; // optical centre of the niche
    const logoRise = centre - (logoTop + LOGO_H / 2);
    body = (
      <>
        <Backdrop W={W} H={H} arch={arch} t={t} />
        <Animated.View style={{ position: 'absolute', left: inset, right: inset, top, bottom: H - yb + 14, justifyContent: 'center', gap: (short ? 20 : 14) * s, opacity: Animated.multiply(fade, swap.interpolate({ inputRange: [0, 0.45], outputRange: [1, 0], extrapolate: 'clamp' })), transform: [{ translateY: fade.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }}>
          <Text style={{ fontFamily: 'Amiri-Regular', fontSize: (short ? 32 : 23) * s, lineHeight: (short ? 62 : 46) * s, color: M.ink, textAlign: 'center', writingDirection: 'rtl' }}>{WELCOME.ar}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <View style={{ width: 34, height: 1, backgroundColor: M.goldSoft }} />
            <View style={{ width: 7, height: 7, backgroundColor: M.gold, transform: [{ rotate: '45deg' }] }} />
            <View style={{ width: 34, height: 1, backgroundColor: M.goldSoft }} />
          </View>
          {!ar ? (
            <Text style={{ fontFamily: 'Amiri-Italic', fontSize: (short ? 18 : 15.5) * s, lineHeight: (short ? 27 : 23) * s, color: M.inkSoft, textAlign: 'center' }}>“{WELCOME.en}”</Text>
          ) : null}
          <Text style={{ fontFamily: 'Amiri-Regular', fontSize: (short ? 15 : 13.5) * s, color: M.gold, textAlign: 'center', letterSpacing: ar ? 0 : 0.6 }}>{ar ? WELCOME.refAr : WELCOME.refEn}</Text>
        </Animated.View>
        {/* the logo starts at the bottom, then rises to the centre of the arch and grows */}
        <Animated.View style={{ position: 'absolute', left: 0, right: 0, top: logoTop, height: LOGO_H, alignItems: 'center', justifyContent: 'center', opacity: brand,
          transform: [
            { translateY: swap.interpolate({ inputRange: [0, 1], outputRange: [0, logoRise] }) },
            { scale: swap.interpolate({ inputRange: [0, 1], outputRange: [1, 2.3] }) },
          ] }}>
          <Text style={{ fontFamily: 'Amiri-Bold', fontSize: 24, color: M.gold, lineHeight: 34 }}>أدومها</Text>
          <Text style={{ fontSize: 11, letterSpacing: 3.5, color: M.domeDeep, fontWeight: '600' }}>ADWAMUHĀ</Text>
        </Animated.View>
        <Animated.View style={{ position: 'absolute', left: 0, right: 0, bottom: 18, alignItems: 'center', opacity: brand }}>
          <Text style={{ fontSize: 11, color: M.inkSoft, opacity: 0.7 }}>{tr('tapToContinue')}</Text>
        </Animated.View>
      </>
    );
  }

  return (
    <Pressable onPress={onDone} accessibilityLabel={tr('tapToContinue')} style={{ flex: 1, backgroundColor: M.ivory }}>
      <View style={{ flex: 1 }} onLayout={(e) => setSize(e.nativeEvent.layout)}>{body}</View>
    </Pressable>
  );
}
