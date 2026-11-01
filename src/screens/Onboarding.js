import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { C, F } from '../theme';
import { useStore } from '../lib/store';
import { T, H1, Label, Button, Card, Divider, Segmented, RadioList, Toggle } from '../components/ui';
import { CatalogTiles, GoalEditor, GoalTile, PeriodPicker, ReminderList, TileGrid } from '../components/editors';
import { SET_IDS, defaultName } from '../lib/sets';
import Logo from '../components/Logo';
import { CATALOG, catalogItem, goalFromCatalog } from '../data/catalog';
import { todayKey } from '../lib/dates';
import { goalDetail } from '../i18n';

export default function Onboarding() {
  const { state, actions, t } = useStore();
  const [step, setStep] = useState(0);
  // set 1 (worship) starts with three suggestions ticked; set 2 only exists once a goal is ticked in it
  const [picked, setPicked] = useState({ worship: ['mosque', 'fajr_on_time', 'quran'], strong: [] });
  const [custom, setCustom] = useState([]);
  const [editing, setEditing] = useState(null); // set id the new goal goes into
  const [period, setPeriod] = useState({ start: todayKey(), end: null });
  const [adj, setAdj] = useState(0);
  const [remList, setRemList] = useState([]); // no reminders until the user adds some
  const lang = state.lang;
  const rtl = lang === 'ar';
  const inSet = (id) => picked[id].length + custom.filter((g) => g.setId === id).length;
  const count = inSet('worship') + inSet('strong');

  const finish = () => {
    const active = SET_IDS.filter((id) => inSet(id) > 0);
    const sets = active.map((id) => ({ id, name: null })); // set names are fixed
    const goals = [
      ...active.flatMap((id) => picked[id].map((c) => goalFromCatalog(catalogItem(c), { start: period.start, setId: id }))),
      ...custom.map((g) => ({ ...g, start: period.start })),
    ];
    actions.finishOnboarding({ lang, sets, goals, period, hijriAdjust: adj, reminders: { list: remList } });
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
            <View style={{ direction: 'ltr' }}>{/* English left, العربية right, in both languages */}
            <Segmented value={lang} onChange={actions.setLang} options={[{ value: 'en', label: 'English' }, { value: 'ar', label: 'العربية' }]} />
          </View>
          </View>
        </ScrollView>
        {footer(true, () => setStep(1), t('start'))}
      </View>
    );
  }

  if (step === 1) {
    const toggle = (setId, c) => setPicked((p) => ({ ...p, [setId]: p[setId].includes(c) ? p[setId].filter((x) => x !== c) : [...p[setId], c] }));
    const setCard = (id, i) => {
      const on = inSet(id) > 0;
      const items = CATALOG.filter((c) => !c.hidden && c.pack === (id === 'worship' ? 'muslim' : 'life'));
      const mine = custom.filter((g) => g.setId === id);
      return (
        <View key={id}>
          <Card style={{ paddingTop: 4, paddingBottom: 6, paddingHorizontal: 12, borderColor: on ? C.accent : C.line }}>
            <View style={{ paddingTop: 12, paddingBottom: 12, gap: 6 }}>
              <T style={{ fontFamily: F.serif, fontSize: 22, lineHeight: 32, color: on ? C.ink : C.muted }}>{defaultName(id, t)}</T>
              {(() => {
                // each set shows its hadith: Arabic always, the English meaning in English mode
                const k = id === 'strong' ? 'setStrong' : 'setWorship';
                const arText = id === 'strong' ? '«المؤمنُ القويُّ خيرٌ وأحبُّ إلى اللهِ من المؤمنِ الضعيفِ، وفي كلٍّ خيرٌ»' : '«وما يَزالُ عبدي يتقرَّبُ إليَّ بالنَّوافلِ حتى أُحِبَّه»';
                return (
                  <View style={{ gap: 2, paddingTop: 2 }}>
                    <Text style={{ fontFamily: F.serifRegular, fontSize: 15, lineHeight: 26, color: C.gold, textAlign: 'right', writingDirection: 'rtl', direction: 'rtl' }}>{rtl ? t(k + 'Hadith') : arText}</Text>
                    {!rtl ? <T style={{ fontSize: 12, lineHeight: 17, color: C.muted, fontStyle: 'italic' }}>{t(k + 'Hadith')}</T> : null}
                    <T style={{ fontSize: 11, color: C.faint, letterSpacing: 0.4 }}>{t(k + 'Ref')}</T>
                  </View>
                );
              })()}
              {!on ? <T style={{ fontSize: 12, color: C.faint }}>{t('setOff')}</T> : null}
            </View>
            <TileGrid>
              <CatalogTiles items={items} selected={picked[id]} onToggle={(c) => toggle(id, c)} />
              {mine.map((g) => (
                <GoalTile key={g.id} rtl={rtl} on onPress={() => setCustom((c) => c.filter((x) => x.id !== g.id))}
                  title={g.name} detail={goalDetail(g, lang, catalogItem, t)} />
              ))}
            </TileGrid>
            <Pressable onPress={() => setEditing(id)} accessibilityRole="button" style={{ paddingTop: 14, paddingBottom: 8, alignItems: 'center' }}>
              <Text style={{ color: C.gold, fontWeight: '600', fontSize: 15 }}>{t('addOwn')}</Text>
            </Pressable>
          </Card>
        </View>
      );
    };
    return (
      <View style={{ flex: 1 }}>
        {dots}
        <ScrollView contentContainerStyle={{ padding: 22, gap: 18, paddingBottom: 30 }} keyboardShouldPersistTaps="handled">
          <View style={{ gap: 6 }}>
            <H1>{t('pickGoals')}</H1>
            <T style={{ color: C.muted, lineHeight: 22 }}>{t('pickGoalsHint')}</T>
          </View>
          {SET_IDS.map(setCard)}
          {count > 6 ? (
            <View style={{ backgroundColor: C.goldSoft, borderRadius: 14, borderWidth: 1, borderColor: C.line, padding: 14 }}>
              <T style={{ fontSize: 14 }}>{t('tooMany')}</T>
            </View>
          ) : null}
        </ScrollView>
        {footer(count > 0, () => setStep(2))}
        {editing ? (
          <GoalEditor setId={editing} onClose={() => setEditing(null)}
            onSave={(patch) => { setCustom((c) => [...c, { id: 'u_' + Date.now().toString(36), archived: false, ...patch, setId: editing }]); setEditing(null); }} />
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
          <ReminderList list={remList} onChange={setRemList} />
        </Card>
      </ScrollView>
      {footer(true, finish, t('finish'))}
    </View>
  );
}
