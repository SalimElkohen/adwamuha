import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Pressable, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Pattern, Rect, Stop } from 'react-native-svg';
import { useStore } from '../lib/store';
import { todayKey } from '../lib/dates';
import Logo from '../components/Logo';
import { ZelligeTile } from '../components/Lattice';
import { WELCOME } from '../data/hadith';

// Welcome page in the spirit of al-Masjid an-Nabawi: ivory marble, a pointed arch
// framing the hadith, and a faint eight-pointed star lattice on the walls.
export const MADINAH = {
  ivory: '#1D6B4E', // ground: dome green (name kept for the layout code)
  ivoryDeep: '#165840',
  niche: '#185C43', // the niche, a shade deeper than the walls
  gold: '#E3C277',
  goldSoft: '#B99A55',
  dome: '#2F8A5F',
  domeDeep: '#F8F3E8',
  ink: '#F8F3E8',
  inkSoft: '#CFE0D6',
};
const M = MADINAH;

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
export const INTRO = { total: 2300, pattern: [0, 700], arch: [200, 1300], inner: [450, 1300], fill: [700, 800], star: [1300, 450], text: 1400, brand: 1800, hold: 2500, focus: 700, zoom: 1100, morph: 700, after: 2000 };
// hadith fully shown at total; it stays `hold` ms. Then the word أدومها lights up while the rest fades (`focus`),
// glides to the centre and grows (`zoom`), and turns into the logo (`morph`); `after` ms later "tap to continue" appears
const SEQ_AT = INTRO.total + INTRO.hold;
const TAP_AT = SEQ_AT + INTRO.focus + INTRO.zoom + INTRO.morph + INTRO.after;
// the hadith in two fixed lines, with the app's name as its own word
const LINE1 = 'أَحَبُّ الأعمالِ إلى اللهِ';
const WORD = 'أدْومُها';
const REST = 'وإن قَلَّ';
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
  const T = Math.round(Math.max(44, W / 8));
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
          <ZelligeTile T={T} gold={M.gold} bg={M.ivory} opacity={0.3} />
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
  const focus = useRef(new Animated.Value(0)).current; // the word lights up, the rest fades
  const zoom = useRef(new Animated.Value(0)).current; // the word moves to the centre and grows
  const morph = useRef(new Animated.Value(0)).current; // the word becomes the logo
  const hint = useRef(new Animated.Value(0)).current; // "tap to continue"
  const [canTap, setCanTap] = useState(false);
  const { actions } = useStore();
  // the full opening plays on the first launch of the day; later launches show the logo briefly
  const [quick] = useState(() => state.lastIntro === todayKey());
  const [t, setT] = useState(0); // time into the opening sequence, ms
  const lay = useRef({}).current; // layout of the hadith pieces, to know where the word sits
  const [wordBox, setWordBox] = useState(null);
  const onLay = (k) => (e) => {
    lay[k] = e.nativeEvent.layout;
    if (lay.block && lay.row && lay.word) {
      const x = lay.block.x + lay.row.x + lay.word.x, y = lay.block.y + lay.row.y + lay.word.y;
      setWordBox((o) => (o && o.x === x && o.y === y && o.w === lay.word.width ? o : { x, y, w: lay.word.width, h: lay.word.height }));
    }
  };

  useEffect(() => {
    if (!quick) return undefined;
    setT(INTRO.total); fade.setValue(1); focus.setValue(1); zoom.setValue(1); morph.setValue(1);
    const id = setTimeout(onDone, 1500);
    return () => clearTimeout(id);
  }, [quick]);

  useEffect(() => {
    if (quick) return undefined;
    actions.markIntro(todayKey());
    let raf, alive = true;
    const io = Easing.inOut(Easing.cubic);
    const run = (reduce) => {
      if (!alive) return;
      if (reduce) {
        // no movement: the rest fades, then the word fades into the logo in place
        setT(INTRO.total); fade.setValue(1);
        Animated.sequence([
          Animated.delay(INTRO.hold),
          Animated.timing(focus, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(morph, { toValue: 1, duration: 500, useNativeDriver: true }),
        ]).start();
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
      Animated.timing(focus, { toValue: 1, duration: INTRO.focus, delay: SEQ_AT, easing: io, useNativeDriver: true }).start();
      Animated.timing(zoom, { toValue: 1, duration: INTRO.zoom, delay: SEQ_AT + INTRO.focus, easing: io, useNativeDriver: true }).start();
      Animated.timing(morph, { toValue: 1, duration: INTRO.morph, delay: SEQ_AT + INTRO.focus + INTRO.zoom - 150, easing: io, useNativeDriver: true }).start();
    };
    Promise.resolve(AccessibilityInfo && AccessibilityInfo.isReduceMotionEnabled ? AccessibilityInfo.isReduceMotionEnabled() : false)
      .then(run, () => run(false));
    // only once the logo has sat in the centre for `after` ms: show the hint and accept the tap
    const id = setTimeout(() => {
      if (!alive) return;
      setCanTap(true);
      if (quick) return;
      Animated.timing(hint, { toValue: 1, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    }, TAP_AT);
    return () => { alive = false; cancelAnimationFrame(raf); clearTimeout(id); };
  }, [fade, focus, zoom, morph, hint]);

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
    const LOGO_W = Math.min(300, (xR - xL) * 0.86); // logo width in the centre
    const LOGO_H = (LOGO_W * 190) / 330;
    const sc = LOGO_W / 330;
    const centre = top + (yb - top) * 0.42; // optical centre of the niche
    const logoTop = centre - LOGO_H / 2;
    const AR = 31 * s; // hadith type size
    // where the word goes: the centre of the logo's Arabic, at the logo's size
    let wx = 0, wy = 0, k = 1;
    if (wordBox) {
      const cx = inset + wordBox.x + wordBox.w / 2, cy = top + wordBox.y + wordBox.h / 2;
      wx = W / 2 - cx;
      wy = logoTop + 92 * sc - cy;
      k = (0.93 * 118 * sc) / AR; // Amiri Regular with vowel marks runs a little wider than the logo's Bold
    }
    const others = Animated.multiply(fade, focus.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }));
    const arText = { fontFamily: 'Amiri-Regular', fontSize: AR, lineHeight: AR * 1.9, color: M.ink, textAlign: 'center' };
    body = (
      <>
        <Backdrop W={W} H={H} arch={arch} t={t} />
        <Animated.View style={{ position: 'absolute', left: inset, right: inset, top, bottom: H - yb + 14, justifyContent: 'center', gap: 14 * s, transform: [{ translateY: fade.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }}>
          <Animated.Text style={{ fontFamily: 'Amiri-Regular', fontSize: 18 * s, lineHeight: 30 * s, color: M.gold, textAlign: 'center', writingDirection: 'rtl', marginBottom: -6 * s, opacity: others }}>{WELCOME.introAr}</Animated.Text>
          <Animated.View onLayout={onLay('block')} style={{ alignItems: 'center', opacity: fade }}>
            <Animated.Text numberOfLines={1} style={[arText, { writingDirection: 'rtl', opacity: focus.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) }]}>{LINE1}</Animated.Text>
            {/* row-reverse with ltr direction: the word sits on the right, as Arabic reads, in either app language */}
            <View onLayout={onLay('row')} style={{ flexDirection: 'row-reverse', direction: 'ltr', justifyContent: 'center', alignItems: 'center', gap: 9 * s }}>
              <Animated.View onLayout={onLay('word')} style={{ opacity: morph.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }), zIndex: 2,
                transform: [
                  { translateX: zoom.interpolate({ inputRange: [0, 1], outputRange: [0, wx] }) },
                  { translateY: zoom.interpolate({ inputRange: [0, 1], outputRange: [0, wy] }) },
                  { scale: zoom.interpolate({ inputRange: [0, 1], outputRange: [1, k] }) },
                ] }}>
                <Text style={arText}>{WORD}</Text>
                <Animated.Text style={[arText, { position: 'absolute', left: 0, right: 0, top: 0, color: M.gold, opacity: focus }]}>{WORD}</Animated.Text>
              </Animated.View>
              <Animated.Text style={[arText, { opacity: focus.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) }]}>{REST}</Animated.Text>
            </View>
          </Animated.View>
          <Animated.View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: others }}>
            <View style={{ width: 34, height: 1, backgroundColor: M.goldSoft }} />
            <View style={{ width: 7, height: 7, backgroundColor: M.gold, transform: [{ rotate: '45deg' }] }} />
            <View style={{ width: 34, height: 1, backgroundColor: M.goldSoft }} />
          </Animated.View>
          {!ar ? (
            <Animated.Text style={{ fontFamily: 'Amiri-Italic', fontSize: 18 * s, lineHeight: 27 * s, color: M.inkSoft, textAlign: 'center', opacity: others }}>{WELCOME.introEn} “{WELCOME.en}”</Animated.Text>
          ) : null}
          <Animated.Text style={{ fontFamily: 'Amiri-Regular', fontSize: 15 * s, color: M.gold, textAlign: 'center', letterSpacing: ar ? 0 : 0.6, opacity: others }}>{ar ? WELCOME.refAr : WELCOME.refEn}</Animated.Text>
        </Animated.View>
        {/* the logo appears where the word arrives */}
        <Animated.View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: logoTop, height: LOGO_H, alignItems: 'center', justifyContent: 'center', opacity: morph }}>
          <Logo width={LOGO_W} gold={M.gold} latin={M.ink} id="splash" />
        </Animated.View>
        <Animated.View style={{ position: 'absolute', left: 0, right: 0, bottom: 18, alignItems: 'center', opacity: hint, transform: [{ translateY: hint.interpolate({ inputRange: [0, 1], outputRange: [6, 0] }) }] }}>
          <Text style={{ fontSize: 16, color: M.gold, letterSpacing: 0.6, fontWeight: '500' }}>{tr('tapToContinue')}</Text>
        </Animated.View>
      </>
    );
  }

  return (
    <Pressable onPress={canTap ? onDone : undefined} disabled={!canTap} accessibilityLabel={tr('tapToContinue')} style={{ flex: 1, backgroundColor: M.ivory }}>
      <View style={{ flex: 1 }} onLayout={(e) => setSize(e.nativeEvent.layout)}>{body}</View>
    </Pressable>
  );
}
