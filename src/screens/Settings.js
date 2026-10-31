import React, { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { C, F } from '../theme';
import { useStore } from '../lib/store';
import { T, H1, H2, Card, Divider, Label, Button, Segmented, RadioList, Toggle, Confirm, Sheet } from '../components/ui';
import { GoalEditor, CatalogSheet, PeriodPicker } from '../components/editors';
import { diffDays, fmtDate, hijriText } from '../lib/dates';
import { catalogItem } from '../data/catalog';
import { goalTitle, goalDetail } from '../i18n';
import { MAX_SETS, cleanName, setName } from '../lib/sets';

export default function Settings() {
  const { state, actions, t, rtl } = useStore();
  const lang = state.lang;
  const [edit, setEdit] = useState(null); // goal | 'new'
  const [adding, setAdding] = useState(null); // set id
  const [newIn, setNewIn] = useState(null); // set id for a new own goal
  const [delSet, setDelSet] = useState(null);
  const [del, setDel] = useState(null);
  const [period, setPeriod] = useState(null);
  const [reset, setReset] = useState(false);
  const goals = state.goals.filter((g) => !g.archived && !g.challengeId);
  const sets = state.sets && state.sets.length ? state.sets : [{ id: 'worship', name: null }];
  const setOf = (g) => (sets.some((x) => x.id === g.setId) ? g.setId : sets[0].id);
  const p = state.period;
  const chevron = rtl ? '‹' : '›';

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={{ flexGrow: 0, flexShrink: 1 }} contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }}>
        <H1 style={{ paddingTop: 4 }}>{t('tabSettings')}</H1>

        <Card style={{ gap: 10 }}>
          <Label style={{ marginBottom: 0 }}>{t('language')}</Label>
          <Segmented value={lang} onChange={actions.setLang} options={[{ value: 'en', label: 'English' }, { value: 'ar', label: 'العربية' }]} />
        </Card>

        {sets.map((st, i) => {
          const list = goals.filter((g) => setOf(g) === st.id);
          return (
            <Card key={st.id} style={{ gap: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, borderBottomWidth: 1, borderColor: C.line, marginBottom: 4 }}>
                <TextInput value={st.name != null ? st.name : setName(st, t)} accessibilityLabel={t('setName')} maxLength={32}
                  onChangeText={(v) => actions.renameSet(st.id, v)} onEndEditing={(e) => actions.renameSet(st.id, cleanName(e.nativeEvent.text, st.id, t))} onBlur={() => actions.renameSet(st.id, cleanName(st.name, st.id, t))}
                  style={{ flex: 1, fontFamily: F.serif, fontSize: 21, color: C.ink, paddingVertical: 6, backgroundColor: 'transparent', borderWidth: 0, textAlign: rtl ? 'right' : 'left' }} />
                <Text style={{ color: C.gold, fontSize: 15 }}>✎</Text>
              </View>
              {st.id === 'strong' && !st.name ? <T style={{ fontSize: 11, color: C.faint, letterSpacing: 0.4 }}>{t('setStrongRef')}</T> : null}
              {list.map((g, k) => (
                <Pressable key={g.id} onPress={() => setEdit(g)} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderTopWidth: k ? 1 : 0, borderColor: C.divider, gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <T style={{ fontWeight: '600' }}>{goalTitle(g, lang, catalogItem)}</T>
                    <T style={{ fontSize: 13, color: C.faint }}>{goalDetail(g, lang, catalogItem, t)}</T>
                  </View>
                  <Text style={{ fontSize: 20, color: C.gold }}>{chevron}</Text>
                </Pressable>
              ))}
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                <Button small kind="secondary" title={t('addFromList')} onPress={() => setAdding(st.id)} style={{ flex: 1 }} />
                <Button small kind="secondary" title={t('addOwn')} onPress={() => setNewIn(st.id)} style={{ flex: 1 }} />
              </View>
              {sets.length > 1 ? (
                <Pressable onPress={() => setDelSet(st)} accessibilityRole="button" style={{ alignSelf: 'center', paddingTop: 12, paddingBottom: 2 }}>
                  <Text style={{ color: C.miss, fontSize: 13 }}>{t('deleteSet')}</Text>
                </Pressable>
              ) : null}
            </Card>
          );
        })}
        {sets.length < MAX_SETS ? <Button kind="secondary" title={t('addSecondSet')} onPress={actions.addSet} /> : null}

        <Card style={{ gap: 10 }}>
          <Label style={{ marginBottom: 0 }}>{t('setPeriod')}</Label>
          <View>
            <T style={{ fontFamily: F.serif, fontSize: 18, lineHeight: 28 }}>{fmtDate(p.start, lang, { year: true })} → {p.end ? fmtDate(p.end, lang, { year: true }) : t('openEnded')}</T>
            <T style={{ fontSize: 13, color: C.gold }}>{hijriText(p.start, lang, state.hijriAdjust)}{p.end ? ' → ' + hijriText(p.end, lang, state.hijriAdjust) + ' · ' + (diffDays(p.start, p.end) + 1) + ' ' + t('days') : ''}</T>
          </View>
          <Button small kind="secondary" title={t('change')} onPress={() => setPeriod({ ...p })} />
          <Divider style={{ marginVertical: 4 }} />
          <Label style={{ marginBottom: 0 }}>{t('hijriAdjust')}</Label>
          <RadioList value={state.hijriAdjust} onChange={actions.setHijriAdjust} options={[{ value: 0, label: t('hijriStandard') }, { value: -1, label: t('hijriMorocco') }]} />
        </Card>

        <Card style={{ paddingVertical: 6 }}>
          <Label style={{ marginTop: 10, marginBottom: 0 }}>{t('reminders')}</Label>
          <Toggle label={t('morning')} sub={state.reminders.morningTime} value={state.reminders.morning} onChange={(v) => actions.setReminders({ morning: v })} />
          <Divider />
          <Toggle label={t('evening')} sub={state.reminders.eveningTime} value={state.reminders.evening} onChange={(v) => actions.setReminders({ evening: v })} />
        </Card>

        <Card style={{ gap: 6 }}>
          <Label style={{ marginBottom: 0 }}>{t('privacy')}</Label>
          <T style={{ fontSize: 14, color: C.muted, lineHeight: 20 }}>{t('privacyBody')}</T>
          <Divider style={{ marginVertical: 8 }} />
          <Label style={{ marginBottom: 0 }}>{t('about')}</Label>
          <T style={{ fontSize: 14, color: C.muted, lineHeight: 20 }}>{t('aboutBody')}</T>
          <T style={{ fontSize: 12, color: C.faint, marginTop: 4 }}>Adwamuhā 1.0</T>
        </Card>

        <Button kind="danger" title={t('resetAll')} onPress={() => setReset(true)} />
      </ScrollView>

      {newIn ? (
        <GoalEditor setId={newIn} onClose={() => setNewIn(null)}
          onSave={(patch) => { actions.addGoal({ id: 'u_' + Date.now().toString(36), archived: false, setId: newIn, ...patch }); setNewIn(null); }} />
      ) : null}
      {delSet ? (
        <Confirm danger text={t('deleteSetConfirm', { name: setName(delSet, t) })} yes={t('delete')} no={t('cancel')}
          onNo={() => setDelSet(null)} onYes={() => { actions.deleteSet(delSet.id); setDelSet(null); }} />
      ) : null}
      {edit ? (
        <GoalEditor goal={edit} onClose={() => setEdit(null)}
          onSave={(patch) => {
            actions.updateGoal(edit.id, patch);
            setEdit(null);
          }}
          onDelete={() => { setDel(edit); setEdit(null); }} />
      ) : null}
      {adding ? <CatalogSheet onClose={() => setAdding(null)} onAdd={(list) => { list.forEach((g) => actions.addGoal({ ...g, setId: adding })); setAdding(null); }} /> : null}
      {del ? (
        <Confirm danger text={t('deleteConfirm', { name: goalTitle(del, lang, catalogItem) })} yes={t('delete')} no={t('cancel')}
          onNo={() => setDel(null)} onYes={() => { actions.deleteGoal(del.id); setDel(null); }} />
      ) : null}
      {period ? (
        <Sheet onClose={() => setPeriod(null)}>
          <ScrollView style={{ flexGrow: 0, flexShrink: 1 }} contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }}>
            <H2>{t('setPeriod')}</H2>
            <PeriodPicker value={period} onChange={setPeriod} />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button title={t('cancel')} kind="secondary" onPress={() => setPeriod(null)} style={{ flex: 1 }} />
              <Button title={t('save')} onPress={() => { actions.setPeriod({ start: period.start, end: period.end }); setPeriod(null); }} style={{ flex: 1 }} />
            </View>
          </ScrollView>
        </Sheet>
      ) : null}
      {reset ? <Confirm danger text={t('resetConfirm')} yes={t('resetAll')} no={t('cancel')} onNo={() => setReset(false)} onYes={() => { actions.resetAll(); setReset(false); }} /> : null}
    </View>
  );
}
