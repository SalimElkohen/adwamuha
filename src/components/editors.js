import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { C, F } from '../theme';
import { useStore } from '../lib/store';
import { T, H2, Label, Button, Chip, Card, Divider, Segmented, Stepper, Field, DateStepper, Sheet, Radio } from './ui';
import { addDays, dayBeforeRamadan, diffDays, fmtDate, hijriText, nextHijri, HIJRI_MONTHS } from '../lib/dates';
import { CATALOG, catalogItem, goalFromCatalog } from '../data/catalog';
import { goalTitle } from '../i18n';

// ---- Journey period: start + (no end | number of days | until Ramadan | date | Hijri date)
export function PeriodPicker({ value, onChange, hijriAdjust }) {
  const { state, t } = useStore();
  const lang = state.lang;
  const adj = hijriAdjust != null ? hijriAdjust : state.hijriAdjust;
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
    { value: 'hijri', label: t('untilHijri') },
  ];

  return (
    <View style={{ gap: 16 }}>
      <Card style={{ gap: 6 }}>
        <Label>{t('startDate')}</Label>
        <DateStepper value={value.start} hijriAdjust={adj} onChange={(k) => apply({ start: k })} />
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
                  <DateStepper value={value.end || addDays(value.start, 29)} min={value.start} hijriAdjust={adj} onChange={(k) => onChange({ start: value.start, end: k })} />
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
              <Text style={{ color: C.muted, fontSize: 14 }}>{t('days')}</Text>
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
export function GoalEditor({ goal, onSave, onDelete, onClose }) {
  const { state, t } = useStore();
  const lang = state.lang;
  const startName = goal ? goalTitle(goal, lang, catalogItem) : '';
  const cat = goal && goal.catalogId ? catalogItem(goal.catalogId) : null;
  const [name, setName] = useState(startName);
  const [freq, setFreq] = useState(goal ? goal.freq : 'daily');
  const [perWeek, setPerWeek] = useState(goal && goal.perWeek ? goal.perWeek : 3);
  const [target, setTarget] = useState(goal ? goal.target || '' : '');
  const [unit, setUnit] = useState(goal ? goal.unit || (cat ? (lang === 'ar' ? cat.unitAr : cat.unitEn) || '' : '') : '');

  const save = () => {
    const n = name.trim();
    if (!n) return;
    const patch = { freq, perWeek: freq === 'weekly' ? perWeek : null, target: target.trim(), unit: unit.trim() || null };
    if (!goal || n !== startName) { patch.name = n; patch.catalogId = null; patch.title = null; }
    onSave(patch);
  };

  return (
    <Sheet onClose={onClose}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <H2>{goal ? t('editGoal') : t('newGoal')}</H2>
        <View style={{ gap: 6 }}>
          <Label style={{ marginBottom: 0 }}>{t('goalName')}</Label>
          <Field value={name} onChangeText={setName} placeholder={t('goalNamePh')} />
        </View>
        <View style={{ gap: 8 }}>
          <Label style={{ marginBottom: 0 }}>{t('frequency')}</Label>
          <Segmented value={freq} onChange={setFreq} options={[{ value: 'daily', label: t('daily') }, { value: 'weekly', label: t('timesPerWeek') }]} />
          {freq === 'weekly' ? <Stepper value={perWeek} min={1} max={6} onChange={setPerWeek} suffix="× / 7" /> : null}
        </View>
        <View style={{ gap: 6 }}>
          <Label style={{ marginBottom: 0 }}>{t('target')}</Label>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Field value={String(target)} onChangeText={setTarget} placeholder={t('targetPh')} style={{ flex: 1 }} />
            <Field value={unit} onChangeText={setUnit} placeholder={t('unitPh')} style={{ flex: 2 }} />
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
          <Button title={t('cancel')} kind="secondary" onPress={onClose} style={{ flex: 1 }} />
          <Button title={t('save')} onPress={save} disabled={!name.trim()} style={{ flex: 1 }} />
        </View>
        {goal && onDelete ? <Button title={t('delete')} kind="danger" onPress={onDelete} /> : null}
      </ScrollView>
    </Sheet>
  );
}

// ---- Catalog list with check marks (used in onboarding and settings)
export function CatalogList({ selected, onToggle, exclude = [] }) {
  const { state, t } = useStore();
  const lang = state.lang;
  const groups = [
    { key: 'muslim', title: t('muslimPack') },
    { key: 'life', title: t('lifePack') },
  ];
  return (
    <View style={{ gap: 22 }}>
      {groups.map((g) => {
        const items = CATALOG.filter((c) => c.pack === g.key && !exclude.includes(c.id));
        if (!items.length) return null;
        return (
          <View key={g.key}>
            <Label>{g.title}</Label>
            <Card style={{ paddingVertical: 4, paddingHorizontal: 16 }}>
              {items.map((c, i) => {
                const on = selected.includes(c.id);
                const unit = lang === 'ar' ? c.unitAr : c.unitEn;
                const sub = [c.target ? c.target + (unit ? ' ' + unit : '') : null, c.freq === 'weekly' ? t('perWeek', { n: c.perWeek }) : t('daily')].filter(Boolean).join(' · ');
                return (
                  <View key={c.id}>
                    {i > 0 ? <Divider /> : null}
                    <Pressable onPress={() => onToggle(c.id)} accessibilityRole="checkbox" accessibilityState={{ checked: on }}
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 13 }}>
                      <View style={{ flex: 1 }}>
                        <T style={{ fontWeight: '600', color: on ? C.ink : C.muted }}>{lang === 'ar' ? c.ar : c.en}</T>
                        <T style={{ fontSize: 13, color: C.faint, marginTop: 1 }}>{sub}</T>
                      </View>
                      <View style={{ width: 26, height: 26, borderRadius: 13, borderWidth: 1.5, borderColor: on ? C.accent : C.line, backgroundColor: on ? C.accent : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                        {on ? <Text style={{ color: C.onAccent, fontWeight: '800', fontSize: 13 }}>✓</Text> : null}
                      </View>
                    </Pressable>
                  </View>
                );
              })}
            </Card>
          </View>
        );
      })}
    </View>
  );
}

export function CatalogSheet({ onClose, onAdd }) {
  const { state, t } = useStore();
  const have = useMemo(() => state.goals.filter((g) => !g.archived && !g.challengeId && g.catalogId).map((g) => g.catalogId), [state.goals]);
  const [sel, setSel] = useState([]);
  return (
    <Sheet onClose={onClose}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }}>
        <H2>{t('addFromList')}</H2>
        <CatalogList selected={sel} exclude={have} onToggle={(id) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))} />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Button title={t('cancel')} kind="secondary" onPress={onClose} style={{ flex: 1 }} />
          <Button title={t('addGoal')} disabled={!sel.length} onPress={() => onAdd(sel.map((id) => goalFromCatalog(catalogItem(id))))} style={{ flex: 1 }} />
        </View>
      </ScrollView>
    </Sheet>
  );
}
