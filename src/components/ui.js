import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';
import { C, F, R } from '../theme';
import { useStore } from '../lib/store';
import { fmtDate, hijriText, addDays, todayKey, toKey, fromKey, daysInMonth, G_MONTHS_LONG } from '../lib/dates';

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

// Serif headings in Amiri, the logo's typeface.
export function H1({ children, style, center }) {
  return <T center={center} style={[{ fontFamily: F.serif, fontSize: 32, lineHeight: 44, color: C.ink }, style]}>{children}</T>;
}
export function H2({ children, style, center }) {
  return <T center={center} style={[{ fontFamily: F.serif, fontSize: 21, lineHeight: 30, color: C.ink }, style]}>{children}</T>;
}

export function Card({ style, children }) {
  return <View style={[{ backgroundColor: C.surface, borderRadius: R.card, borderWidth: 1, borderColor: C.line, padding: 18 }, style]}>{children}</View>;
}

export function Divider({ style }) {
  return <View style={[{ height: 1, backgroundColor: C.divider }, style]} />;
}

export function Label({ children, style }) {
  return <T style={[{ fontSize: 11, lineHeight: 15, letterSpacing: 1.6, fontWeight: '600', color: C.gold, textTransform: 'uppercase', marginBottom: 10 }, style]}>{children}</T>;
}

export function Button({ title, onPress, kind = 'primary', disabled, style, small }) {
  const primary = kind === 'primary', danger = kind === 'danger';
  const bg = primary ? C.accent : 'transparent';
  const fg = primary ? C.onAccent : danger ? C.miss : C.gold;
  const border = primary ? C.accent : danger ? 'rgba(233,163,142,0.45)' : C.line;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        { backgroundColor: bg, borderRadius: R.pill, minHeight: small ? 38 : 52, paddingHorizontal: small ? 14 : 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: border, opacity: disabled ? 0.4 : pressed ? 0.8 : 1 },
        style,
      ]}
    >
      <Text style={{ color: fg, fontSize: small ? 14 : 16, fontWeight: '600', letterSpacing: 0.3, textAlign: 'center' }}>{title}</Text>
    </Pressable>
  );
}

export function Chip({ label, active, onPress, style }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
      onPress={onPress}
      style={[{ paddingVertical: 8, paddingHorizontal: 14, borderRadius: R.pill, borderWidth: 1, borderColor: active ? C.accent : C.divider, backgroundColor: active ? C.accentSoft : 'transparent' }, style]}
    >
      <Text style={{ color: active ? C.gold : C.muted, fontWeight: active ? '600' : '500', fontSize: 14 }}>{label}</Text>
    </Pressable>
  );
}

export function Segmented({ options, value, onChange }) {
  return (
    <View style={{ flexDirection: 'row', backgroundColor: C.surface, borderRadius: R.pill, borderWidth: 1, borderColor: C.line, padding: 4, gap: 4 }}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable key={String(o.value)} onPress={() => onChange(o.value)} accessibilityRole="button" accessibilityState={{ selected: on }}
            style={{ flex: 1, paddingVertical: 10, borderRadius: R.pill, alignItems: 'center', backgroundColor: on ? C.accent : 'transparent' }}>
            <Text style={{ fontSize: 15, fontWeight: on ? '700' : '500', color: on ? C.onAccent : C.muted }}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Toggle({ value, onChange, label, sub }) {
  return (
    <Pressable onPress={() => onChange(!value)} accessibilityRole="switch" accessibilityState={{ checked: !!value }}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 }}>
      <View style={{ flex: 1 }}>
        <T style={{ fontWeight: '600' }}>{label}</T>
        {sub ? <T style={{ fontSize: 13, color: C.faint }}>{sub}</T> : null}
      </View>
      <View style={{ width: 50, height: 30, borderRadius: 15, backgroundColor: value ? C.accent : C.empty, padding: 3, alignItems: value ? 'flex-end' : 'flex-start' }}>
        <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: value ? C.onAccent : C.muted }} />
      </View>
    </Pressable>
  );
}

function RoundButton({ glyph, onPress, label }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label}
      style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 20, lineHeight: 22, color: C.gold }}>{glyph}</Text>
    </Pressable>
  );
}

export function Stepper({ value, min = 1, max = 99, onChange, suffix }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
      <RoundButton glyph="−" label="Less" onPress={() => onChange(Math.max(min, value - 1))} />
      <Text style={{ minWidth: 56, textAlign: 'center', fontSize: 20, fontWeight: '600', color: C.ink, fontVariant: ['tabular-nums'] }}>{value}{suffix ? ' ' + suffix : ''}</Text>
      <RoundButton glyph="+" label="More" onPress={() => onChange(Math.min(max, value + 1))} />
    </View>
  );
}

export function Field({ value, onChangeText, placeholder, keyboardType, style }) {
  const { rtl } = useStore();
  return (
    <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={C.faint} keyboardType={keyboardType}
      style={[{ borderWidth: 1, borderColor: C.line, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 13, fontSize: 16, color: C.ink, backgroundColor: C.surface, textAlign: rtl ? 'right' : 'left' }, style]} />
  );
}

// Date picker by steps: shows Gregorian + Hijri.
export function Radio({ on }) {
  return (
    <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: on ? C.accent : C.faint, alignItems: 'center', justifyContent: 'center' }}>
      {on ? <View style={{ width: 11, height: 11, borderRadius: 6, backgroundColor: C.accent }} /> : null}
    </View>
  );
}

export function RadioList({ options, value, onChange }) {
  return options.map((o, i) => {
    const on = value === o.value;
    return (
      <View key={String(o.value)}>
        {i > 0 ? <Divider /> : null}
        <Pressable onPress={() => onChange(o.value)} accessibilityRole="radio" accessibilityState={{ selected: on }}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13 }}>
          <Radio on={on} />
          <Text style={{ flex: 1, fontSize: 16, color: on ? C.ink : C.muted, fontWeight: on ? '600' : '400' }}>{o.label}</Text>
        </Pressable>
      </View>
    );
  });
}

export function DateStepper({ value, onChange, min, hijriAdjust }) {
  const { state, t } = useStore();
  const lang = state.lang;
  const adj = hijriAdjust != null ? hijriAdjust : state.hijriAdjust;
  const go = (d) => {
    let k = addDays(value, d);
    if (min && k < min) k = min;
    onChange(k);
  };
  const isToday = value === todayKey();
  const b = (txt, d) => (
    <Pressable key={txt} onPress={() => go(d)} accessibilityRole="button"
      style={{ flex: 1, height: 36, borderRadius: 18, borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: C.ink, fontSize: 13, fontVariant: ['tabular-nums'] }}>{txt}</Text>
    </Pressable>
  );
  return (
    <View style={{ gap: 14 }}>
      <View>
        <T style={{ fontFamily: F.serif, fontSize: 22, lineHeight: 32 }}>{fmtDate(value, lang, { weekday: true, year: true })}</T>
        <T style={{ color: C.gold, fontSize: 14 }}>{hijriText(value, lang, adj)}</T>
      </View>
      <View style={{ flexDirection: 'row', gap: 5, direction: 'ltr' }}>
        {b('−30', -30)}{b('−7', -7)}{b('−1', -1)}
        <Pressable onPress={() => onChange(min && todayKey() < min ? min : todayKey())} accessibilityRole="button"
          style={{ flex: 1.9, height: 36, borderRadius: 18, borderWidth: 1, borderColor: C.accent, backgroundColor: isToday ? C.accent : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: isToday ? C.onAccent : C.gold, fontSize: 13, fontWeight: '600' }}>{t('today')}</Text>
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
      <SvgText x={cx} y={sub ? cx - size * 0.02 : cx + size * 0.08} fontSize={Math.round(size * (sub ? 0.22 : 0.26))} fontFamily={F.serif} fill={C.ink} textAnchor="middle">{center}</SvgText>
      {sub ? <SvgText x={cx} y={cx + size * 0.17} fontSize={Math.round(size * 0.09)} fill={C.faint} textAnchor="middle">{sub}</SvgText> : null}
    </Svg>
  );
}

// Bottom sheet used for editors and confirmations (rendered by the screen root).
export function Sheet({ children, onClose }) {
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 50, justifyContent: 'flex-end' }}>
      <Pressable onPress={onClose} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(8,30,22,0.6)' }} accessibilityLabel="Close" />
      <View style={{ maxHeight: '88%', backgroundColor: C.bgDeep, borderTopLeftRadius: 26, borderTopRightRadius: 26, borderTopWidth: 1, borderColor: C.line, paddingTop: 10 }}>
        <View style={{ alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: C.line, marginBottom: 6 }} />
        {children}
      </View>
    </KeyboardAvoidingView>
  );
}

export function Confirm({ text, yes, no, onYes, onNo, danger }) {
  return (
    <Sheet onClose={onNo}>
      <View style={{ padding: 22, gap: 18, paddingBottom: 38 }}>
        <H2>{text}</H2>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Button title={no} kind="secondary" onPress={onNo} style={{ flex: 1 }} />
          <Button title={yes} kind={danger ? 'danger' : 'primary'} onPress={onYes} style={{ flex: 1 }} />
        </View>
      </View>
    </Sheet>
  );
}

// ---- Pickers shown in a full-screen modal (works from inside scroll views)
export function ModalSheet({ visible, onClose, children }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Pressable onPress={onClose} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(8,30,22,0.6)' }} accessibilityLabel="Close" />
        <View style={{ backgroundColor: C.bgDeep, borderTopLeftRadius: 26, borderTopRightRadius: 26, borderTopWidth: 1, borderColor: C.line, paddingTop: 10, paddingBottom: 30 }}>
          <View style={{ alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: C.line, marginBottom: 6 }} />
          {children}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const ROW = 44;
// one scrollable column of choices; the chosen one is gold
export function PickerColumn({ items, value, onChange, flex = 1 }) {
  const ref = useRef(null);
  const i = Math.max(0, items.findIndex((x) => x.value === value));
  useEffect(() => {
    const id = setTimeout(() => ref.current && ref.current.scrollTo({ y: Math.max(0, i * ROW - ROW * 2), animated: false }), 0);
    return () => clearTimeout(id);
  }, [i]);
  return (
    <View style={{ flex, height: ROW * 5, borderRadius: 14, borderWidth: 1, borderColor: C.line, overflow: 'hidden' }}>
      <ScrollView ref={ref} showsVerticalScrollIndicator={false}>
        {items.map((x) => {
          const on = x.value === value;
          return (
            <Pressable key={String(x.value)} onPress={() => onChange(x.value)} accessibilityRole="button" accessibilityState={{ selected: on }}
              style={{ height: ROW, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? C.accentSoft : 'transparent' }}>
              <Text style={{ fontSize: 17, color: on ? C.gold : C.muted, fontWeight: on ? '700' : '400', fontVariant: ['tabular-nums'] }}>{x.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

// Date chosen from day / month / year menus, with the Hijri equivalent
export function DatePickerSheet({ visible, value, min, hijriAdjust, onDone, onClose, title }) {
  const { state, t } = useStore();
  const lang = state.lang;
  const adj = hijriAdjust != null ? hijriAdjust : state.hijriAdjust;
  const d0 = fromKey(value || todayKey());
  const [y, setY] = useState(d0.getFullYear());
  const [m, setM] = useState(d0.getMonth() + 1);
  const [d, setD] = useState(d0.getDate());
  useEffect(() => {
    if (!visible) return;
    const x = fromKey(value || todayKey());
    setY(x.getFullYear()); setM(x.getMonth() + 1); setD(x.getDate());
  }, [visible, value]);
  const dd = Math.min(d, daysInMonth(y, m));
  let key = toKey(new Date(y, m - 1, dd));
  const tooEarly = min && key < min;
  const thisYear = new Date().getFullYear();
  const years = [thisYear - 1, thisYear, thisYear + 1, thisYear + 2].map((v) => ({ value: v, label: String(v) }));
  const months = G_MONTHS_LONG[lang === 'ar' ? 'ar' : 'en'].map((n, k) => ({ value: k + 1, label: n }));
  const days = Array.from({ length: daysInMonth(y, m) }, (_, k) => ({ value: k + 1, label: String(k + 1) }));
  return (
    <ModalSheet visible={visible} onClose={onClose}>
      <View style={{ paddingHorizontal: 20, gap: 14 }}>
        {title ? <Label style={{ marginBottom: 0 }}>{title}</Label> : null}
        <View>
          <T style={{ fontFamily: F.serif, fontSize: 21, lineHeight: 30 }}>{fmtDate(key, lang, { weekday: true, year: true })}</T>
          <T style={{ color: C.gold, fontSize: 14 }}>{hijriText(key, lang, adj)}</T>
          {tooEarly ? <T style={{ color: C.miss, fontSize: 13 }}>{t('dateTooEarly')}</T> : null}
        </View>
        <View style={{ flexDirection: 'row', gap: 8, direction: 'ltr' }}>
          <PickerColumn items={days} value={dd} onChange={setD} flex={0.8} />
          <PickerColumn items={months} value={m} onChange={setM} flex={1.6} />
          <PickerColumn items={years} value={y} onChange={setY} flex={1} />
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Button title={t('cancel')} kind="secondary" onPress={onClose} style={{ flex: 1 }} />
          <Button title={t('done')} disabled={!!tooEarly} onPress={() => onDone(key)} style={{ flex: 1 }} />
        </View>
      </View>
    </ModalSheet>
  );
}

// A date shown with its Hijri equivalent; tapping it opens the date menus
export function DateField({ value, onChange, min, hijriAdjust, title }) {
  const { state, t } = useStore();
  const lang = state.lang;
  const adj = hijriAdjust != null ? hijriAdjust : state.hijriAdjust;
  const [open, setOpen] = useState(false);
  return (
    <View>
      <Pressable onPress={() => setOpen(true)} accessibilityRole="button"
        style={{ flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: C.line, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12 }}>
        <View style={{ flex: 1 }}>
          <T style={{ fontFamily: F.serif, fontSize: 20, lineHeight: 28 }}>{fmtDate(value, lang, { weekday: true, year: true })}</T>
          <T style={{ color: C.gold, fontSize: 14 }}>{hijriText(value, lang, adj)}</T>
        </View>
        <Text style={{ color: C.gold, fontSize: 14, fontWeight: '600' }}>{t('change')}</Text>
      </Pressable>
      <DatePickerSheet visible={open} value={value} min={min} hijriAdjust={adj} title={title} onClose={() => setOpen(false)} onDone={(k) => { setOpen(false); onChange(k); }} />
    </View>
  );
}

// Time chosen from hour / minute menus
export function TimePickerSheet({ visible, value, onDone, onClose, title }) {
  const { t } = useStore();
  const [h0, m0] = (value || '05:00').split(':').map(Number);
  const [h, setH] = useState(h0);
  const [m, setM] = useState(m0 - (m0 % 5));
  useEffect(() => { if (visible) { const [a, b] = (value || '05:00').split(':').map(Number); setH(a); setM(b - (b % 5)); } }, [visible, value]);
  const p2 = (n) => (n < 10 ? '0' + n : '' + n);
  const hours = Array.from({ length: 24 }, (_, k) => ({ value: k, label: p2(k) }));
  const mins = Array.from({ length: 12 }, (_, k) => ({ value: k * 5, label: p2(k * 5) }));
  return (
    <ModalSheet visible={visible} onClose={onClose}>
      <View style={{ paddingHorizontal: 20, gap: 14 }}>
        {title ? <Label style={{ marginBottom: 0 }}>{title}</Label> : null}
        <Text style={{ fontFamily: F.serif, fontSize: 40, lineHeight: 52, color: C.ink, textAlign: 'center', fontVariant: ['tabular-nums'] }}>{p2(h)}:{p2(m)}</Text>
        <View style={{ flexDirection: 'row', gap: 8, direction: 'ltr' }}>
          <PickerColumn items={hours} value={h} onChange={setH} />
          <PickerColumn items={mins} value={m} onChange={setM} />
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Button title={t('cancel')} kind="secondary" onPress={onClose} style={{ flex: 1 }} />
          <Button title={t('done')} onPress={() => onDone(p2(h) + ':' + p2(m))} style={{ flex: 1 }} />
        </View>
      </View>
    </ModalSheet>
  );
}
