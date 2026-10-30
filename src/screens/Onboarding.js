import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { C } from '../theme';
import { useStore } from '../lib/store';
import { T, Label, Button, Segmented, Toggle } from '../components/ui';
import { CatalogList, GoalEditor, PeriodPicker } from '../components/editors';
import { catalogItem, goalFromCatalog } from '../data/catalog';
import { todayKey } from '../lib/dates';

export default function Onboarding() {
  const { state, actions, t } = useStore();
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState(['five_on_time', 'fajr_on_time', 'quran']);
  const [custom, setCustom] = useState([]);
  const [editing, setEditing] = useState(false);
  const [period, setPeriod] = useState({ start: todayKey(), end: null });
  const [adj, setAdj] = useState(0);
  const [rem, setRem] = useState({ morning: true, evening: true });
  const lang = state.lang;
  const count = picked.length + custom.length;

  const finish = () => {
    const goals = [
      ...picked.map((id) => goalFromCatalog(catalogItem(id), { start: period.start })),
      ...custom.map((g) => ({ ...g, start: period.start })),
    ];
    actions.finishOnboarding({ lang, goals, period, hijriAdjust: adj, reminders: rem });
  };

  const footer = (canNext, onNext, nextLabel) => (
    <View style={{ flexDirection: 'row', gap: 10, padding: 16, borderTopWidth: 1, borderColor: C.line, backgroundColor: C.bg }}>
      {step > 0 ? <Button title={t('back')} kind="secondary" onPress={() => setStep(step - 1)} style={{ flex: 1 }} /> : null}
      <Button title={nextLabel || t('next')} disabled={!canNext} onPress={onNext} style={{ flex: 2 }} />
    </View>
  );

  const dots = (
    <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'center', paddingTop: 8 }}>
      {[0, 1, 2, 3].map((i) => (
        <View key={i} style={{ width: i === step ? 22 : 7, height: 7, borderRadius: 4, backgroundColor: i <= step ? C.accent : C.line }} />
      ))}
    </View>
  );

  if (step === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bg }}>
        {dots}
        <ScrollView contentContainerStyle={{ padding: 24, gap: 22, flexGrow: 1, justifyContent: 'center' }}>
          <Text style={{ fontSize: 40, color: C.accent, textAlign: 'center', fontWeight: '700' }}>أدومها</Text>
          <T center style={{ fontSize: 24, lineHeight: 30, fontWeight: '700' }}>{t('welcomeTitle')}</T>
          <T center style={{ color: C.muted }}>{t('welcomeBody')}</T>
          <View style={{ gap: 8, marginTop: 10 }}>
            <Label style={{ textAlign: 'center' }}>{t('chooseLanguage')}</Label>
            <Segmented value={lang} onChange={actions.setLang} options={[{ value: 'en', label: 'English' }, { value: 'ar', label: 'العربية' }]} />
          </View>
        </ScrollView>
        {footer(true, () => setStep(1), t('start'))}
      </View>
    );
  }

  if (step === 1) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bg }}>
        {dots}
        <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 30 }}>
          <T style={{ fontSize: 26, lineHeight: 32, fontWeight: '700' }}>{t('pickGoals')}</T>
          <T style={{ color: C.muted }}>{t('pickGoalsHint')}</T>
          <CatalogList selected={picked} onToggle={(id) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))} />
          {custom.length ? (
            <View style={{ gap: 8 }}>
              <Label style={{ marginBottom: 2 }}>{t('yourGoals')}</Label>
              {custom.map((g) => (
                <Pressable key={g.id} onPress={() => setCustom((c) => c.filter((x) => x.id !== g.id))}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: C.accent, backgroundColor: C.accentSoft }}>
                  <View style={{ width: 24, height: 24, borderRadius: 7, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: C.white, fontWeight: '800' }}>✓</Text>
                  </View>
                  <T style={{ flex: 1, fontWeight: '600' }}>{g.name}</T>
                </Pressable>
              ))}
            </View>
          ) : null}
          <Button title={t('addOwn')} kind="secondary" onPress={() => setEditing(true)} />
          {count > 6 ? (
            <View style={{ backgroundColor: C.goldSoft, borderRadius: 12, padding: 12 }}>
              <T style={{ fontSize: 14 }}>{t('tooMany')}</T>
            </View>
          ) : null}
        </ScrollView>
        {footer(count > 0, () => setStep(2))}
        {editing ? (
          <GoalEditor onClose={() => setEditing(false)}
            onSave={(patch) => { setCustom((c) => [...c, { id: 'u_' + Date.now().toString(36), archived: false, ...patch }]); setEditing(false); }} />
        ) : null}
      </View>
    );
  }

  if (step === 2) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bg }}>
        {dots}
        <ScrollView contentContainerStyle={{ padding: 20, gap: 18, paddingBottom: 30 }}>
          <T style={{ fontSize: 26, lineHeight: 32, fontWeight: '700' }}>{t('setPeriod')}</T>
          <T style={{ color: C.muted }}>{t('setPeriodHint')}</T>
          <View style={{ gap: 8 }}>
            <Label style={{ marginBottom: 0 }}>{t('hijriCalendar')}</Label>
            <Segmented value={adj} onChange={setAdj} options={[{ value: 0, label: t('hijriStandard') }, { value: -1, label: t('hijriMorocco') }]} />
          </View>
          <PeriodPicker value={period} onChange={setPeriod} hijriAdjust={adj} />
        </ScrollView>
        {footer(true, () => setStep(3))}
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {dots}
      <ScrollView contentContainerStyle={{ padding: 20, gap: 14, paddingBottom: 30 }}>
        <T style={{ fontSize: 26, lineHeight: 32, fontWeight: '700' }}>{t('remindersTitle')}</T>
        <T style={{ color: C.muted }}>{t('remindersHint')}</T>
        <View style={{ backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.line, paddingHorizontal: 16, paddingVertical: 4 }}>
          <Toggle label={t('morning')} sub="05:00" value={rem.morning} onChange={(v) => setRem({ ...rem, morning: v })} />
          <View style={{ height: 1, backgroundColor: C.line }} />
          <Toggle label={t('evening')} sub="18:00" value={rem.evening} onChange={(v) => setRem({ ...rem, evening: v })} />
        </View>
      </ScrollView>
      {footer(true, finish, t('finish'))}
    </View>
  );
}
