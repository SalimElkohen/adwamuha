import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { C, F, tone } from '../theme';
import { useStore } from '../lib/store';
import { T, H1, H2, Card, Divider, Label, Button, Confirm } from '../components/ui';
import { diffDays, fmtDate, hijriText, todayKey } from '../lib/dates';
import { BUILT_IN_CHALLENGES, challengeDates, loadRemoteChallenges } from '../data/challenges';
import { catalogItem } from '../data/catalog';
import { goalScore } from '../lib/stats';

export default function Challenges() {
  const { state, actions, t } = useStore();
  const lang = state.lang;
  const today = todayKey();
  const [remote, setRemote] = useState([]);
  const [leaving, setLeaving] = useState(null);
  useEffect(() => { loadRemoteChallenges().then(setRemote); }, []);
  const all = [...BUILT_IN_CHALLENGES, ...remote.filter((r) => !BUILT_IN_CHALLENGES.some((b) => b.id === r.id))];
  const joinedIds = state.challenges.map((c) => c.id);

  const goalNames = (ch) => ch.goals.map((g) => {
    if (typeof g === 'string') { const c = catalogItem(g); return c ? (lang === 'ar' ? c.ar : c.en) : g; }
    return lang === 'ar' ? g.ar : g.en;
  }).join(lang === 'ar' ? '، ' : ', ');

  return (
    <View style={{ flex: 1 }}>
    <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }}>
      <View style={{ paddingTop: 4 }}>
        <H1>{t('tabChallenges')}</H1>
        <T style={{ color: C.muted, lineHeight: 22 }}>{t('challengesHint')}</T>
      </View>

      {state.challenges.length ? <Label style={{ marginTop: 6, marginBottom: 0 }}>{t('activeChallenges')}</Label> : null}
      {state.challenges.map((c) => {
        const gs = state.goals.filter((g) => c.goalIds.includes(g.id) || (c.linkedIds || []).includes(g.id)).map((g) => ({ ...g, start: c.start, end: c.end, challengeId: c.id }));
        let d = 0, e = 0;
        gs.forEach((g) => { const r = goalScore(g, state, today); d += r.done; e += r.expected; });
        const pct = e ? (100 * d) / e : null;
        const total = diffDays(c.start, c.end) + 1;
        const n = Math.max(0, Math.min(total, diffDays(c.start, today) + 1));
        return (
          <Card key={c.id} style={{ borderColor: C.gold, gap: 10 }}>
            <H2>{c.title[lang] || c.title.en}</H2>
            <T style={{ fontSize: 13, color: C.muted }}>{t('from', { a: fmtDate(c.start, lang), b: fmtDate(c.end, lang, { year: true }) })}</T>
            <View style={{ height: 4, borderRadius: 2, backgroundColor: C.empty, overflow: 'hidden' }}>
              <View style={{ width: (100 * n) / total + '%', height: 4, backgroundColor: C.gold }} />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 13, color: C.muted }}>{t('dayOf', { n, total })}</Text>
              <Text style={{ fontSize: 13, fontWeight: '700', color: tone(pct) }}>{t('constancy')} {pct == null ? '—' : Math.round(pct) + '%'}</Text>
            </View>
            <Button small kind="secondary" title={t('leave')} onPress={() => setLeaving(c)} />
          </Card>
        );
      })}

      <Label style={{ marginTop: 6, marginBottom: 0 }}>{t('available')}</Label>
      {all.filter((ch) => !joinedIds.includes(ch.id)).map((ch) => {
        const dates = challengeDates(ch, today, state.hijriAdjust);
        const len = diffDays(dates.start, dates.end) + 1;
        const tx = ch[lang] || ch.en;
        return (
          <Card key={ch.id} style={{ gap: 10 }}>
            <H2>{tx.title}</H2>
            <T style={{ color: C.muted, fontSize: 14, lineHeight: 21 }}>{tx.desc}</T>
            <T style={{ fontSize: 13, color: C.ink }}><Text style={{ color: C.gold }}>✦ </Text>{goalNames(ch)}</T>
            <Divider />
            <View style={{ gap: 2 }}>
              <T style={{ fontSize: 13, fontWeight: '600' }}>{t('from', { a: fmtDate(dates.start, lang), b: fmtDate(dates.end, lang, { year: true }) })} · {t('durationDays', { n: len })}</T>
              <T style={{ fontSize: 12, color: C.gold }}>{hijriText(dates.start, lang, state.hijriAdjust)} → {hijriText(dates.end, lang, state.hijriAdjust)}</T>
            </View>
            <Button title={t('join')} onPress={() => actions.joinChallenge(ch, dates.start, dates.end)} />
          </Card>
        );
      })}

      <Label style={{ marginTop: 6, marginBottom: 0 }}>{t('history')}</Label>
      {!state.history.length ? <T style={{ color: C.faint }}>{t('noHistory')}</T> : null}
      {state.history.length ? (
        <Card style={{ paddingVertical: 4 }}>
          {state.history.map((h, i) => (
            <View key={h.id + h.finishedAt}>
              {i > 0 ? <Divider /> : null}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 }}>
                <View style={{ flex: 1 }}>
                  <T style={{ fontWeight: '600' }}>{h.title[lang] || h.title.en}</T>
                  <T style={{ fontSize: 12, color: C.faint }}>{t('from', { a: fmtDate(h.start, lang), b: fmtDate(h.end, lang, { year: true }) })}</T>
                </View>
                <Text style={{ fontFamily: F.serif, fontSize: 22, color: tone(h.pct) }}>{h.pct == null ? '—' : h.pct + '%'}</Text>
              </View>
            </View>
          ))}
        </Card>
      ) : null}

    </ScrollView>
      {leaving ? (
        <Confirm text={t('leave') + ': ' + (leaving.title[lang] || leaving.title.en) + '?'} yes={t('yes')} no={t('no')}
          onNo={() => setLeaving(null)} onYes={() => { actions.finishChallenge(leaving.id, true); setLeaving(null); }} />
      ) : null}
    </View>
  );
}
