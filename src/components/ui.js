import React from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';
import { C, R } from '../theme';
import { useStore } from '../lib/store';
import { fmtDate, hijriText, addDays, todayKey } from '../lib/dates';

// Text that aligns to the reading direction of the current language.
export function T({ style, children, center, ...rest }) {
  const { rtl } = useStore();
  return (
    <Text
      {...rest}
      style={[{ color: C.ink, fontSize: 16, lineHeight: 22, textAlign: center ? 'center' : rtl ? 'right' : 'left', writingDirection: rtl ? 'rtl' : 'ltr' }, style]}
    >
      {children}
    </Text>
  );
}

export function Card({ style, children }) {
  return <View style={[{ backgroundColor: C.surface, borderRadius: R.card, borderWidth: 1, borderColor: C.line, padding: 16 }, style]}>{children}</View>;
}

export function Label({ children, style }) {
  return <T style={[{ fontSize: 12, lineHeight: 16, letterSpacing: 0.8, fontWeight: '700', color: C.muted, textTransform: 'uppercase', marginBottom: 10 }, style]}>{children}</T>;
}

export function Button({ title, onPress, kind = 'primary', disabled, style, small }) {
  const bg = kind === 'primary' ? C.accent : kind === 'danger' ? C.missSoft : C.surface;
  const fg = kind === 'primary' ? C.white : kind === 'danger' ? C.miss : C.ink;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        { backgroundColor: bg, borderRadius: 12, paddingVertical: small ? 8 : 14, paddingHorizontal: small ? 12 : 18, alignItems: 'center', justifyContent: 'center', borderWidth: kind === 'secondary' ? 1 : 0, borderColor: C.line, opacity: disabled ? 0.45 : pressed ? 0.8 : 1 },
        style,
      ]}
    >
      <Text style={{ color: fg, fontSize: small ? 14 : 16, fontWeight: '600' }}>{title}</Text>
    </Pressable>
  );
}

export function Chip({ label, active, onPress, style }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
      onPress={onPress}
      style={[{ paddingVertical: 8, paddingHorizontal: 12, borderRadius: R.pill, borderWidth: 1, borderColor: active ? C.accent : C.line, backgroundColor: active ? C.accentSoft : C.surface }, style]}
    >
      <Text style={{ color: active ? C.accent : C.ink, fontWeight: active ? '600' : '500', fontSize: 14 }}>{label}</Text>
    </Pressable>
  );
}

export function Segmented({ options, value, onChange }) {
  return (
    <View style={{ flexDirection: 'row', backgroundColor: C.empty, borderRadius: 12, padding: 3, gap: 3 }}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable key={String(o.value)} onPress={() => onChange(o.value)} accessibilityRole="button" accessibilityState={{ selected: on }}
            style={{ flex: 1, paddingVertical: 9, borderRadius: 10, alignItems: 'center', backgroundColor: on ? C.surface : 'transparent' }}>
            <Text style={{ fontSize: 14, fontWeight: on ? '700' : '500', color: on ? C.ink : C.muted }}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Toggle({ value, onChange, label, sub }) {
  return (
    <Pressable onPress={() => onChange(!value)} accessibilityRole="switch" accessibilityState={{ checked: !!value }}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 }}>
      <View style={{ flex: 1 }}>
        <T style={{ fontWeight: '600' }}>{label}</T>
        {sub ? <T style={{ fontSize: 13, color: C.muted }}>{sub}</T> : null}
      </View>
      <View style={{ width: 50, height: 30, borderRadius: 15, backgroundColor: value ? C.accent : C.line, padding: 3, alignItems: value ? 'flex-end' : 'flex-start' }}>
        <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: C.white }} />
      </View>
    </Pressable>
  );
}

export function Stepper({ value, min = 1, max = 99, onChange, suffix }) {
  const btn = (txt, d) => (
    <Pressable onPress={() => onChange(Math.max(min, Math.min(max, value + d)))} accessibilityRole="button"
      style={{ width: 40, height: 40, borderRadius: 10, borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center', backgroundColor: C.surface }}>
      <Text style={{ fontSize: 20, color: C.ink }}>{txt}</Text>
    </Pressable>
  );
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      {btn('−', -1)}
      <Text style={{ minWidth: 44, textAlign: 'center', fontSize: 18, fontWeight: '600', color: C.ink, fontVariant: ['tabular-nums'] }}>{value}{suffix ? ' ' + suffix : ''}</Text>
      {btn('+', 1)}
    </View>
  );
}

export function Field({ value, onChangeText, placeholder, keyboardType, style }) {
  const { rtl } = useStore();
  return (
    <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={C.faint} keyboardType={keyboardType}
      style={[{ borderWidth: 1, borderColor: C.line, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: C.ink, backgroundColor: C.bg, textAlign: rtl ? 'right' : 'left' }, style]} />
  );
}

// Date picker by steps: shows Gregorian + Hijri.
export function DateStepper({ value, onChange, min }) {
  const { state, t } = useStore();
  const lang = state.lang;
  const go = (d) => {
    let k = addDays(value, d);
    if (min && k < min) k = min;
    onChange(k);
  };
  const b = (txt, d) => (
    <Pressable key={txt} onPress={() => go(d)} accessibilityRole="button"
      style={{ paddingHorizontal: 10, height: 36, borderRadius: 10, borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center', backgroundColor: C.surface }}>
      <Text style={{ fontSize: 14, color: C.ink, fontWeight: '500' }}>{txt}</Text>
    </Pressable>
  );
  return (
    <View style={{ gap: 8 }}>
      <View>
        <T style={{ fontWeight: '700', fontSize: 17 }}>{fmtDate(value, lang, { weekday: true, year: true })}</T>
        <T style={{ color: C.gold, fontSize: 14 }}>{hijriText(value, lang, state.hijriAdjust)}</T>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {b('−30', -30)}{b('−7', -7)}{b('−1', -1)}
        <Pressable onPress={() => onChange(min && todayKey() < min ? min : todayKey())} style={{ paddingHorizontal: 10, height: 36, borderRadius: 10, backgroundColor: C.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 14, color: C.accent, fontWeight: '600' }}>{t('today')}</Text>
        </Pressable>
        {b('+1', 1)}{b('+7', 7)}{b('+30', 30)}
      </View>
    </View>
  );
}

export function Ring({ pct, size = 76, stroke = 8, color = C.accent, center, sub, ticks = [], track = C.empty }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(100, pct || 0));
  const cx = size / 2;
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Circle cx={cx} cy={cx} r={r} stroke={track} strokeWidth={stroke} fill="none" />
      {p > 0 ? (
        <Circle cx={cx} cy={cx} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round"
          strokeDasharray={`${c} ${c}`} strokeDashoffset={c * (1 - p / 100)} transform={`rotate(-90 ${cx} ${cx})`} />
      ) : null}
      {ticks.map((f, i) => {
        const a = 2 * Math.PI * f - Math.PI / 2;
        return <Circle key={i} cx={cx + r * Math.cos(a)} cy={cx + r * Math.sin(a)} r={stroke / 2 + 1.5} fill={C.gold} stroke={C.surface} strokeWidth={2} />;
      })}
      <SvgText x={cx} y={sub ? cx - size * 0.02 : cx + size * 0.08} fontSize={Math.round(size * (sub ? 0.2 : 0.24))} fontWeight="600" fill={C.ink} textAnchor="middle">{center}</SvgText>
      {sub ? <SvgText x={cx} y={cx + size * 0.17} fontSize={Math.round(size * 0.09)} fill={C.muted} textAnchor="middle">{sub}</SvgText> : null}
    </Svg>
  );
}

// Simple overlay used for editors and confirmations (rendered by the screen root).
export function Sheet({ children, onClose }) {
  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 50 }}>
      <Pressable onPress={onClose} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(20,33,27,0.35)' }} accessibilityLabel="Close" />
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, maxHeight: '88%', backgroundColor: C.bg, borderTopLeftRadius: 22, borderTopRightRadius: 22, paddingTop: 10 }}>
        <View style={{ alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: C.line, marginBottom: 6 }} />
        {children}
      </View>
    </View>
  );
}

export function Confirm({ text, yes, no, onYes, onNo, danger }) {
  return (
    <Sheet onClose={onNo}>
      <View style={{ padding: 20, gap: 16, paddingBottom: 36 }}>
        <T style={{ fontSize: 17, fontWeight: '600' }}>{text}</T>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Button title={no} kind="secondary" onPress={onNo} style={{ flex: 1 }} />
          <Button title={yes} kind={danger ? 'danger' : 'primary'} onPress={onYes} style={{ flex: 1 }} />
        </View>
      </View>
    </Sheet>
  );
}
