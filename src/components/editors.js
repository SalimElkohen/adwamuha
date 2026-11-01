import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { C, F } from '../theme';
import { useStore } from '../lib/store';
import { T, H2, Label, Button, Chip, Card, Divider, Segmented, Stepper, Field, DateField, Sheet, Radio, RadioList, TimePickerSheet, ModalSheet, PickerColumn } from './ui';
import { setName as setTitle } from '../lib/sets';
import { goalDays } from '../lib/stats';
import { addDays, dayBeforeRamadan, diffDays, todayKey, fmtDate, hijriText, nextHijri, HIJRI_MONTHS } from '../lib/dates';
import { CATALOG, catalogItem, fillAmount, goalFromCatalog } from '../data/catalog';
import { goalTitle } from '../i18n';

// ---- Journey period: start + (no end | number of days | until Ramadan | date | Hijri date)
export function PeriodPicker({ value, onChange, hijriAdjust }) {
  const { state, t } = useStore();
  const lang = state.lang;
  const adj = hijriAdjust != null ? hijriAdjust : state.hijriAdjust;
  // the start can't be earlier than today (a journey already under way keeps its own start)
  const firstStart = useRef(value.start).current;
  const minStart = firstStart < todayKey() ? firstStart : todayKey();
  const ramadanEnd = dayBeforeRamadan(value.start, adj);
  const initialMode = !value.end ? 'open' : value.end === ramadanEnd ? 'ramadan' : 'days';
  const [mode, setMode] = useState(value.mode || initialMode);
  const [days, setDays] = useState(value.end ? diffDays(value.start, value.end) + 1 : 40);
  const [hm, setHm] = useState(9);
  const [hd, setHd] = useState(1);

  const apply = (patch) => {
    const v = { ...value, ...patch };
    const m = patch.mode || mode;
    let end = v.end;
    if (m === 'open') end = null;
    if (m === 'days') end = addDays(v.start, (patch.days || days) - 1);
    if (m === 'ramadan') end = dayBeforeRamadan(v.start, adj);
    if (m === 'date') end = v.end && v.end >= v.start ? v.end : addDays(v.start, 29);
    if (m === 'hijri') {
      const k = nextHijri(patch.hm || hm, patch.hd || hd, addDays(v.start, 1), adj);
      end = k;
    }
    onChange({ start: v.start, end });
  };

  // re-compute Ramadan / Hijri end dates when the Hijri calendar setting changes
  const firstAdj = useRef(true);
  useEffect(() => {
    if (firstAdj.current) { firstAdj.current = false; return; }
    if (mode === 'ramadan' || mode === 'hijri') apply({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adj]);

  const modes = [
    { value: 'open', label: t('openEnded') },
    { value: 'days', label: t('numberOfDays') },
    { value: 'ramadan', label: t('untilRamadan') },
    { value: 'date', label: t('untilDate') },
  ];

  return (
    <View style={{ gap: 16 }}>
      <Card style={{ gap: 6 }}>
        <Label>{t('startDate')}</Label>
        <DateField value={value.start} min={minStart} hijriAdjust={adj} title={t('startDate')} onChange={(k) => apply({ start: k })} />
      </Card>

      <Card style={{ paddingVertical: 6 }}>
        <Label style={{ marginTop: 10 }}>{t('endDate')}</Label>
        {modes.map((m, i) => {
          const on = mode === m.value;
          return (
            <View key={m.value}>
              {i > 0 ? <Divider /> : null}
              <Pressable onPress={() => { setMode(m.value); apply({ mode: m.value }); }} accessibilityRole="radio" accessibilityState={{ selected: on }}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13 }}>
                <Radio on={on} />
                <T style={{ flex: 1, color: on ? C.ink : C.muted, fontWeight: on ? '600' : '400' }}>{m.label}</T>
              </Pressable>
              {on && mode === 'days' ? (
                <View style={{ paddingBottom: 14 }}>
                  <Stepper value={days} min={1} max={400} suffix={t('days')} onChange={(n) => { setDays(n); apply({ days: n }); }} />
                </View>
              ) : null}
              {on && mode === 'date' ? (
                <View style={{ paddingBottom: 14 }}>
                  <DateField value={value.end || addDays(value.start, 29)} min={value.start} hijriAdjust={adj} title={t('endDate')} onChange={(k) => onChange({ start: value.start, end: k })} />
                </View>
              ) : null}
              {on && mode === 'hijri' ? (
                <View style={{ gap: 10, paddingBottom: 14 }}>
                  <T style={{ fontSize: 13, color: C.faint }}>{t('month')}</T>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                    {HIJRI_MONTHS[lang === 'ar' ? 'ar' : 'en'].map((name, k) => (
                      <Chip key={name} label={name} active={hm === k + 1} onPress={() => { setHm(k + 1); apply({ hm: k + 1 }); }} />
                    ))}
                  </View>
                  <T style={{ fontSize: 13, color: C.faint }}>{t('dayOfMonth')}</T>
                  <Stepper value={hd} min={1} max={30} onChange={(n) => { setHd(n); apply({ hd: n }); }} />
                </View>
              ) : null}
            </View>
          );
        })}
      </Card>

      <View style={{ backgroundColor: C.bgDeep, borderRadius: 18, borderWidth: 1, borderColor: C.accent, padding: 18, alignItems: 'center', gap: 4 }}>
        <Label style={{ marginBottom: 2 }}>{t('endDate')}</Label>
        {value.end ? (
          <>
            <T center style={{ fontFamily: F.serif, fontSize: 22, lineHeight: 32 }}>{fmtDate(value.end, lang, { weekday: true, year: true })}</T>
            <T center style={{ color: C.gold, fontSize: 14 }}>{hijriText(value.end, lang, adj)}</T>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 6 }}>
              <Text style={{ fontFamily: F.serif, fontSize: 30, lineHeight: 40, color: C.gold }}>{diffDays(value.start, value.end) + 1}</Text>
              <Text style={{ color: C.muted, fontSize: 14 }}>{lang === 'ar' ? (diffDays(value.start, value.end) + 1 <= 10 ? 'أيام' : 'يومًا') : t('days')}</Text>
            </View>
          </>
        ) : (
          <T center style={{ fontFamily: F.serif, fontSize: 22, lineHeight: 32 }}>{t('openEnded')}</T>
        )}
      </View>
    </View>
  );
}

// ---- Goal editor (new or existing)
export function GoalEditor({ goal, onSave, onDelete, onClose, setId: initialSet }) {
  const { state, t } = useStore();
  const lang = state.lang;
  const startName = goal ? goalTitle(goal, lang, catalogItem) : '';
  const cat = goal && goal.catalogId ? catalogItem(goal.catalogId) : null;
  const [name, setName] = useState(startName);
  const [freq, setFreq] = useState(goal ? goal.freq : 'daily');
  const [perWeek, setPerWeek] = useState(goal && goal.perWeek ? goal.perWeek : 3);
  const [target, setTarget] = useState(goal ? goal.target || '' : '');
  const [unit, setUnit] = useState(goal ? goal.unit || (cat ? (lang === 'ar' ? cat.unitAr : cat.unitEn) || '' : '') : '');
  const [setId, setSetId] = useState((goal && goal.setId) || initialSet || (state.sets[0] && state.sets[0].id) || 'worship');
  const showSets = state.sets.length > 1 && !(goal && goal.challengeId);

  const save = () => {
    const n = name.trim();
    if (!n) return;
    const fixedDays = goal && goalDays(goal);
    const patch = { freq: fixedDays ? 'weekly' : freq, perWeek: fixedDays ? 1 : freq === 'weekly' ? perWeek : null, target: String(target).trim(), unit: unit.trim() || null };
    if (!(goal && goal.challengeId)) patch.setId = setId;
    if (!goal || n !== startName) { patch.name = n; patch.catalogId = null; patch.title = null; }
    onSave(patch);
  };

  return (
    <Sheet onClose={onClose}>
      <ScrollView style={{ flexGrow: 0, flexShrink: 1 }} contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <H2>{goal ? t('editGoal') : t('newGoal')}</H2>
        <View style={{ gap: 6 }}>
          <Label style={{ marginBottom: 0 }}>{t('goalName')}</Label>
          <Field value={name} onChangeText={setName} placeholder={t('goalNamePh')} />
        </View>
        <View style={{ gap: 8 }}>
          <Label style={{ marginBottom: 0 }}>{t('frequency')}</Label>
          {goal && goalDays(goal) ? (
            <T style={{ color: C.muted }}>{t('monOrThu')}</T>
          ) : (
            <>
              <Segmented value={freq} onChange={setFreq} options={[{ value: 'daily', label: t('daily') }, { value: 'weekly', label: t('timesPerWeek') }]} />
              {freq === 'weekly' ? <Stepper value={perWeek} min={1} max={6} onChange={setPerWeek} suffix="× / 7" /> : null}
            </>
          )}
        </View>
        <View style={{ gap: 6 }}>
          <Label style={{ marginBottom: 0 }}>{t('target')}</Label>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Field value={String(target)} onChangeText={setTarget} placeholder={t('targetPh')} style={{ flex: 1 }} />
            <Field value={unit} onChangeText={setUnit} placeholder={t('unitPh')} style={{ flex: 2 }} />
          </View>
        </View>
        {showSets ? (
          <View>
            <Label style={{ marginBottom: 0 }}>{t('inSet')}</Label>
            <RadioList value={setId} onChange={setSetId} options={state.sets.map((x) => ({ value: x.id, label: setTitle(x, t) }))} />
          </View>
        ) : null}
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
          <Button title={t('cancel')} kind="secondary" onPress={onClose} style={{ flex: 1 }} />
          <Button title={t('save')} onPress={save} disabled={!name.trim()} style={{ flex: 1 }} />
        </View>
        {goal && onDelete ? <Button title={t('delete')} kind="danger" onPress={onDelete} /> : null}
      </ScrollView>
    </Sheet>
  );
}

// ---- Catalog rows with check marks (inside a Card)
export function CatalogRows({ items, selected, onToggle }) {
  const { state, t } = useStore();
  const lang = state.lang;
  return items.map((c, i) => {
    const on = selected.includes(c.id);
    const unit = lang === 'ar' ? c.unitAr : c.unitEn;
    const sub = [c.target ? c.target + (unit ? ' ' + unit : '') : null, c.days ? t('monOrThu') : c.weekInUnit ? null : c.freq === 'weekly' ? t('perWeek', { n: c.perWeek }) : t('daily')].filter(Boolean).join(' · ');
    return (
      <View key={c.id}>
        {i > 0 ? <Divider /> : null}
        <Pressable onPress={() => onToggle(c.id)} accessibilityRole="checkbox" accessibilityState={{ checked: on }}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 13 }}>
          <View style={{ flex: 1 }}>
            <T style={{ fontWeight: '600', color: on ? C.ink : C.muted }}>{fillAmount(lang === 'ar' ? c.ar : c.en, c.target)}</T>
            <T style={{ fontSize: 13, color: C.faint, marginTop: 1 }}>{sub}</T>
          </View>
          <View style={{ width: 26, height: 26, borderRadius: 13, borderWidth: 1.5, borderColor: on ? C.accent : C.line, backgroundColor: on ? C.accent : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
            {on ? <Text style={{ color: C.onAccent, fontWeight: '800', fontSize: 13 }}>✓</Text> : null}
          </View>
        </Pressable>
      </View>
    );
  });
}

// ---- Goal tiles: 3 per row. Title in gold (English bold in English, Arabic calligraphy in Arabic),
// white text below (the Arabic name in English mode, then amount and frequency). A chosen tile has a gold border and ✓.
export function GoalTile({ title, second, detail, on, onPress, rtl }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="checkbox" accessibilityState={{ checked: !!on }}
      style={{ width: '31.5%', borderRadius: 14, paddingVertical: 9, paddingHorizontal: 5, alignItems: 'center', borderWidth: 1,
        borderColor: on ? C.accent : 'rgba(227,194,119,0.22)', backgroundColor: on ? C.accentSoft : 'rgba(0,0,0,0.08)' }}>
      {rtl ? (
        <Text style={{ fontFamily: F.serif, fontSize: 17, lineHeight: 26, color: C.gold, textAlign: 'center' }}>{title}</Text>
      ) : (
        <Text style={{ fontSize: 12.5, lineHeight: 16, fontWeight: '700', color: C.gold, textAlign: 'center' }}>{title}</Text>
      )}
      {second ? <Text style={{ fontFamily: F.serifRegular, fontSize: 13.5, lineHeight: 21, color: C.ink, textAlign: 'center', marginTop: 1 }}>{second}</Text> : null}
      {detail ? <Text style={{ fontSize: rtl ? 10.5 : 9.5, lineHeight: 13, color: 'rgba(248,243,232,0.78)', textAlign: 'center', marginTop: 2 }}>{detail}</Text> : null}
      {on ? (
        <View style={[{ position: 'absolute', top: -6, width: 18, height: 18, borderRadius: 9, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' }, rtl ? { left: -5 } : { right: -5 }]}>
          <Text style={{ color: C.onAccent, fontSize: 10, fontWeight: '800' }}>✓</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

export function TileGrid({ children }) {
  return <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, paddingTop: 6 }}>{children}</View>;
}

export function catalogDetail(c, lang, t) {
  const unit = lang === 'ar' ? c.unitAr : c.unitEn;
  // keep number groups like 33 · 33 · 33 + 1 in reading order inside Arabic text
  const tg = c.target && lang === 'ar' && /[·+]/.test(c.target) ? '\u2066' + c.target + '\u2069' : c.target;
  return [tg && !c.amountInName ? tg + (unit ? ' ' + unit : '') : null, c.days ? t('monOrThu') : c.weekInUnit ? null : c.freq === 'weekly' ? t('perWeek', { n: c.perWeek }) : t('daily')].filter(Boolean).join(' · ');
}

export function CatalogTiles({ items, selected, onToggle }) {
  const { state, t } = useStore();
  const lang = state.lang, rtl = lang === 'ar';
  return items.map((c) => (
    <GoalTile key={c.id} rtl={rtl} on={selected.includes(c.id)} onPress={() => onToggle(c.id)}
      title={fillAmount(rtl ? c.arShort || c.ar : c.enShort || c.en, c.target)}
      second={rtl ? null : fillAmount(c.arShort || c.ar, c.target)}
      detail={catalogDetail(c, lang, t)} />
  ));
}

// ---- Catalog list grouped by pack (used when adding goals from Settings)
export function CatalogList({ selected, onToggle, exclude = [], only }) {
  const { t } = useStore();
  const groups = [
    { key: 'muslim', title: t('muslimPack') },
    { key: 'life', title: t('lifePack') },
  ].filter((g) => !only || g.key === only); // a set only offers its own suggestions
  return (
    <View style={{ gap: 22 }}>
      {groups.map((g) => {
        const items = CATALOG.filter((c) => c.pack === g.key && !c.hidden && !exclude.includes(c.id));
        if (!items.length) return null;
        return (
          <View key={g.key}>
            <Label>{g.title}</Label>
            <Card style={{ padding: 12 }}>
              <TileGrid><CatalogTiles items={items} selected={selected} onToggle={onToggle} /></TileGrid>
            </Card>
          </View>
        );
      })}
    </View>
  );
}

export function CatalogSheet({ onClose, onAdd, setId }) {
  const { state, t } = useStore();
  const have = useMemo(() => state.goals.filter((g) => !g.archived && !g.challengeId && g.catalogId).map((g) => g.catalogId), [state.goals]);
  const [sel, setSel] = useState([]);
  return (
    <Sheet onClose={onClose}>
      <ScrollView style={{ flexGrow: 0, flexShrink: 1 }} contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }}>
        <H2>{t('addFromList')}</H2>
        <CatalogList selected={sel} exclude={have} only={setId ? (setId === 'strong' ? 'life' : 'muslim') : null} onToggle={(id) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))} />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Button title={t('cancel')} kind="secondary" onPress={onClose} style={{ flex: 1 }} />
          <Button title={t('addGoal')} disabled={!sel.length} onPress={() => onAdd(sel.map((id) => goalFromCatalog(catalogItem(id))))} style={{ flex: 1 }} />
        </View>
      </ScrollView>
    </Sheet>
  );
}

// ---- Reminders: any number, each at its own time (none by default).
// A reminder can have a name and be linked to one or several goals.
// goals: [{ id, name }] the goals that can be linked
export function ReminderList({ list, onChange, goals = [] }) {
  const { t } = useStore();
  const [editing, setEditing] = useState(null); // reminder id, or 'new'
  const sorted = [...list].sort((a, b) => (a.time < b.time ? -1 : 1));
  const cur = editing && editing !== 'new' ? list.find((r) => r.id === editing) : null;
  const nameOf = (id) => (goals.find((g) => g.id === id) || {}).name;
  const save = (r) => {
    if (editing === 'new') onChange([...list, { ...r, id: 'r_' + Date.now().toString(36), on: true }]);
    else onChange(list.map((x) => (x.id === editing ? { ...x, ...r } : x)));
    setEditing(null);
  };
  return (
    <View>
      {!sorted.length ? <T style={{ color: C.faint, paddingVertical: 12 }}>{t('noReminders')}</T> : null}
      {sorted.map((r, i) => {
        const linked = (r.goalIds || []).map(nameOf).filter(Boolean);
        const sub = [r.label, linked.join(' · ')].filter(Boolean).join(' — ') || t(+r.time.slice(0, 2) < 12 ? 'morning' : 'evening');
        return (
          <View key={r.id}>
            {i > 0 ? <Divider /> : null}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 }}>
              <Pressable onPress={() => setEditing(r.id)} accessibilityRole="button" style={{ flex: 1 }}>
                <Text style={{ fontFamily: F.serif, fontSize: 26, lineHeight: 34, color: r.on ? C.ink : C.faint, fontVariant: ['tabular-nums'] }}>{r.time}</Text>
                <T numberOfLines={2} style={{ fontSize: 12, lineHeight: 16, color: r.label || linked.length ? C.gold : C.faint }}>{sub}</T>
              </Pressable>
              <Pressable onPress={() => onChange(list.map((x) => (x.id === r.id ? { ...x, on: !x.on } : x)))} accessibilityRole="switch" accessibilityState={{ checked: r.on }}
                style={{ width: 50, height: 30, borderRadius: 15, backgroundColor: r.on ? C.accent : C.empty, padding: 3, alignItems: r.on ? 'flex-end' : 'flex-start', direction: 'ltr' }}>
                <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: r.on ? C.onAccent : C.muted }} />
              </Pressable>
              <Pressable onPress={() => onChange(list.filter((x) => x.id !== r.id))} accessibilityLabel={t('delete')} hitSlop={8}
                style={{ width: 30, height: 30, borderRadius: 15, borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: C.faint, fontSize: 12 }}>✕</Text>
              </Pressable>
            </View>
          </View>
        );
      })}
      <Divider />
      <Pressable onPress={() => setEditing('new')} accessibilityRole="button" style={{ paddingVertical: 14, alignItems: 'center' }}>
        <Text style={{ color: C.gold, fontWeight: '600', fontSize: 15 }}>{t('addReminder')}</Text>
      </Pressable>
      <ReminderSheet visible={!!editing} value={cur || { time: list.length ? '18:00' : '05:00', label: '', goalIds: [] }} goals={goals}
        onClose={() => setEditing(null)} onSave={save} />
    </View>
  );
}

// time, optional name and linked goals in one panel
function ReminderSheet({ visible, value, goals, onClose, onSave }) {
  const { t } = useStore();
  const p2 = (n) => (n < 10 ? '0' + n : '' + n);
  const [h, setH] = useState(5);
  const [m, setM] = useState(0);
  const [label, setLabel] = useState('');
  const [ids, setIds] = useState([]);
  useEffect(() => {
    if (!visible) return;
    const [a, b] = (value.time || '05:00').split(':').map(Number);
    setH(a); setM(b); setLabel(value.label || ''); setIds(value.goalIds || []);
  }, [visible]);
  const hours = Array.from({ length: 24 }, (_, k) => ({ value: k, label: p2(k) }));
  const mins = Array.from({ length: 60 }, (_, k) => ({ value: k, label: p2(k) }));
  return (
    <ModalSheet visible={visible} onClose={onClose}>
      <ScrollView style={{ maxHeight: 620 }} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }} keyboardShouldPersistTaps="handled">
        <Label style={{ marginBottom: 0 }}>{t('reminderTime')}</Label>
        <Text style={{ fontFamily: F.serif, fontSize: 36, lineHeight: 46, color: C.ink, textAlign: 'center', fontVariant: ['tabular-nums'] }}>{p2(h)}:{p2(m)}</Text>
        <View style={{ flexDirection: 'row', gap: 8, direction: 'ltr' }}>
          <PickerColumn items={hours} value={h} onChange={setH} />
          <PickerColumn items={mins} value={m} onChange={setM} />
        </View>
        <Label style={{ marginBottom: 0, marginTop: 4 }}>{t('reminderName')}</Label>
        <Field value={label} onChangeText={setLabel} placeholder={t('reminderNamePh')} />
        {goals.length ? (
          <View style={{ gap: 8 }}>
            <Label style={{ marginBottom: 0, marginTop: 4 }}>{t('reminderGoals')}</Label>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
              {goals.map((g) => (
                <Chip key={g.id} label={g.name} active={ids.includes(g.id)} onPress={() => setIds((x) => (x.includes(g.id) ? x.filter((y) => y !== g.id) : [...x, g.id]))} />
              ))}
            </View>
          </View>
        ) : null}
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
          <Button title={t('cancel')} kind="secondary" onPress={onClose} style={{ flex: 1 }} />
          <Button title={t('save')} onPress={() => onSave({ time: p2(h) + ':' + p2(m), label: label.trim(), goalIds: ids })} style={{ flex: 1 }} />
        </View>
      </ScrollView>
    </ModalSheet>
  );
}
