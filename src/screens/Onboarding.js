import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { C } from '../theme';
import { useStore } from '../lib/store';
import { T, H1, Label, Button, Card, Divider, Segmented, RadioList, Toggle } from '../components/ui';
import { CatalogList, GoalEditor, PeriodPicker } from '../components/editors';
import Logo from '../components/Logo';
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
    <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 16, borderTopWidth: 1, borderColor: C.divider, backgroundColor: C.bg }}>
      {step > 0 ? <Button title={t('back')} kind="secondary" onPress={() => setStep(step - 1)} style={{ flex: 1 }} /> : null}
      <Button title={nextLabel || t('next')} disabled={!canNext} onPress={onNext} style={{ flex: 2 }} />
    </View>
  );

  const dots = (
    <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'center', paddingTop: 12, paddingBottom: 4 }}>
      {[0, 1, 2, 3].map((i) => (
        <View key={i} style={{ width: i === step ? 24 : 6, height: 6, borderRadius: 3, backgroundColor: i <= step ? C.accent : C.empty }} />
      ))}
    </View>
  );

  if (step === 0) {
    return (
      <View style={{ flex: 1 }}>
        {dots}
        <ScrollView contentContainerStyle={{ paddingHorizontal: 28, paddingVertical: 24, gap: 18, flexGrow: 1, justifyContent: 'center' }}>
          <View style={{ alignItems: 'center', marginBottom: 6 }}><Logo width={250} gold={C.gold} latin={C.ink} id="onb" /></View>
          <H1 center>{t('welcomeTitle')}</H1>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <View style={{ width: 34, height: 1, backgroundColor: C.line }} />
            <View style={{ width: 6, height: 6, backgroundColor: C.gold, transform: [{ rotate: '45deg' }] }} />
            <View style={{ width: 34, height: 1, backgroundColor: C.line }} />
          </View>
          <T center style={{ color: C.muted, lineHeight: 24 }}>{t('welcomeBody')}</T>
          <View style={{ gap: 4, marginTop: 18 }}>
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
      <View style={{ flex: 1 }}>
        {dots}
        <ScrollView contentContainerStyle={{ padding: 22, gap: 14, paddingBottom: 30 }}>
          <H1>{t('pickGoals')}</H1>
          <T style={{ color: C.muted }}>{t('pickGoalsHint')}</T>
          <CatalogList selected={picked} onToggle={(id) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))} />
          {custom.length ? (
            <View>
              <Label>{t('yourGoals')}</Label>
              <Card style={{ paddingVertical: 4, paddingHorizontal: 16 }}>
                {custom.map((g, i) => (
                  <View key={g.id}>
                    {i > 0 ? <Divider /> : null}
                    <Pressable onPress={() => setCustom((c) => c.filter((x) => x.id !== g.id))} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 13 }}>
                      <T style={{ flex: 1, fontWeight: '600' }}>{g.name}</T>
                      <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ color: C.onAccent, fontWeight: '800', fontSize: 13 }}>✓</Text>
                      </View>
                    </Pressable>
                  </View>
                ))}
              </Card>
            </View>
          ) : null}
          <Button title={t('addOwn')} kind="secondary" onPress={() => setEditing(true)} />
          {count > 6 ? (
            <View style={{ backgroundColor: C.goldSoft, borderRadius: 14, borderWidth: 1, borderColor: C.line, padding: 14 }}>
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
      <View style={{ flex: 1 }}>
        {dots}
        <ScrollView contentContainerStyle={{ padding: 22, gap: 18, paddingBottom: 30 }}>
          <H1>{t('setPeriod')}</H1>
          <T style={{ color: C.muted, lineHeight: 22, marginTop: -8 }}>{t('setPeriodHint')}</T>
          <Card style={{ paddingVertical: 6 }}>
            <Label style={{ marginTop: 10 }}>{t('hijriCalendar')}</Label>
            <RadioList value={adj} onChange={setAdj} options={[{ value: 0, label: t('hijriStandard') }, { value: -1, label: t('hijriMorocco') }]} />
          </Card>
          <PeriodPicker value={period} onChange={setPeriod} hijriAdjust={adj} />
        </ScrollView>
        {footer(true, () => setStep(3))}
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {dots}
      <ScrollView contentContainerStyle={{ padding: 20, gap: 14, paddingBottom: 30 }}>
        <H1>{t('remindersTitle')}</H1>
        <T style={{ color: C.muted }}>{t('remindersHint')}</T>
        <Card style={{ paddingHorizontal: 16, paddingVertical: 2 }}>
          <Toggle label={t('morning')} sub="05:00" value={rem.morning} onChange={(v) => setRem({ ...rem, morning: v })} />
          <Divider />
          <Toggle label={t('evening')} sub="18:00" value={rem.evening} onChange={(v) => setRem({ ...rem, evening: v })} />
        </Card>
      </ScrollView>
      {footer(true, finish, t('finish'))}
    </View>
  );
}
