import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { C, F, tone } from '../theme';
import { useStore } from '../lib/store';
import { T, H1, Card, Divider, Label, Button } from '../components/ui';
import { addDays, diffDays, fmtDate, hijriText, todayKey } from '../lib/dates';
import { activeGoals, constancy, goalScore, goalStreak, mark, streak, weekBlock } from '../lib/stats';
import { catalogItem } from '../data/catalog';
import { goalTitle, goalDetail } from '../i18n';
import { hadithForDay } from '../data/hadith';

function GoalRow({ goal, day, readOnly }) {
  const { state, actions, t } = useStore();
  const lang = state.lang;
  const today = todayKey();
  const m = mark(state, goal.id, day);
  let sub = goalDetail(goal, lang, catalogItem, t);
  let met = false;
  if (goal.freq === 'weekly') {
    const b = weekBlock(goal, state, day);
    met = b.done >= b.target && m !== 'd';
    sub = met ? '✓ ' + t('goalReached') + ' · ' + b.done + '/' + b.target : sub + ' · ' + t('thisWeek', { d: b.done, t: b.target });
  } else {
    const s = goalStreak(goal, state, day <= today ? day : today);
    if (s > 0) sub = sub + ' · ✦ ' + s;
  }
  const done = m === 'd', miss = m === 'x';
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', opacity: met && !done ? 0.75 : 1 }}>
      <Pressable disabled={readOnly} onPress={() => actions.toggleMark(goal.id, day, 'd')} accessibilityRole="button" accessibilityState={{ checked: done }}
        style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14 }}>
        <View style={{ width: 28, height: 28, borderRadius: 14, borderWidth: 1.5,
          borderColor: done ? C.accent : miss ? C.miss : met ? C.gold : C.faint,
          backgroundColor: done ? C.accent : miss ? C.missSoft : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
          {done || miss || met ? <Text style={{ color: done ? C.onAccent : miss ? C.miss : C.gold, fontWeight: '800', fontSize: 13 }}>{miss ? '✕' : '✓'}</Text> : null}
        </View>
        <View style={{ flex: 1 }}>
          <T style={{ fontWeight: '600', color: miss ? C.muted : C.ink, textDecorationLine: miss ? 'line-through' : 'none' }}>{goalTitle(goal, lang, catalogItem)}</T>
          <T style={{ fontSize: 13, lineHeight: 18, color: met ? C.gold : C.faint }}>{sub}</T>
        </View>
      </Pressable>
      <Pressable disabled={readOnly} onPress={() => actions.toggleMark(goal.id, day, 'x')} accessibilityRole="button" accessibilityLabel="Not done" hitSlop={8}
        style={{ width: 30, height: 30, borderRadius: 15, borderWidth: 1, borderColor: miss ? C.miss : C.divider, alignItems: 'center', justifyContent: 'center', marginHorizontal: 4 }}>
        <Text style={{ fontSize: 11, color: miss ? C.miss : C.faint }}>✕</Text>
      </Pressable>
    </View>
  );
}

function Rows({ list, day, future }) {
  return list.map((g, i) => (
    <View key={g.id}>
      {i > 0 ? <Divider /> : null}
      <GoalRow goal={g} day={day} readOnly={future} />
    </View>
  ));
}

export default function Today() {
  const { state, actions, t, rtl } = useStore();
  const lang = state.lang;
  const today = todayKey();
  const [day, setDay] = useState(today);
  const p = state.period;
  const started = today >= p.start;
  const goals = activeGoals(state, day);
  const habits = goals.filter((g) => !g.challengeId);
  const score = constancy(state, today);
  const st = streak(state, today);
  const n = diffDays(p.start, day) + 1;
  const total = p.end ? diffDays(p.start, p.end) + 1 : null;
  const ended = state.challenges.filter((c) => c.end < today);
  const active = state.challenges.filter((c) => c.end >= today && c.start <= day);
  const h = hadithForDay(diffDays('2020-01-01', day));
  const future = day > today;
  const prev = rtl ? '›' : '‹', next = rtl ? '‹' : '›';

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }}>
      <View style={{ paddingTop: 4 }}>
        <Label style={{ marginBottom: 2 }}>{hijriText(today, lang, state.hijriAdjust)}</Label>
        <H1>{fmtDate(today, lang, { weekday: true })}</H1>
      </View>

      <Card style={{ flexDirection: 'row', paddingVertical: 16, paddingHorizontal: 0 }}>
        <View style={{ flex: 1, alignItems: 'center', gap: 2 }}>
          <Label>{t('constancy')}</Label>
          <Text style={{ fontFamily: F.serif, fontSize: 34, lineHeight: 46, color: score.pct == null ? C.faint : tone(score.pct) }}>
            {score.pct == null ? '—' : Math.round(score.pct) + '%'}
          </Text>
          <T center style={{ fontSize: 12, color: C.faint, lineHeight: 16 }}>{score.pct == null ? t('noScoreYet') : score.done + ' / ' + score.expected}</T>
        </View>
        <View style={{ width: 1, backgroundColor: C.divider, marginVertical: 4 }} />
        <View style={{ flex: 1, alignItems: 'center', gap: 2 }}>
          <Label>{t('streak')}</Label>
          <Text style={{ fontFamily: F.serif, fontSize: 34, lineHeight: 46, color: st > 0 ? C.gold : C.faint }}>{st}</Text>
          <T center style={{ fontSize: 12, color: C.faint, lineHeight: 16 }}>{t('streakDays', { n: st })}</T>
        </View>
      </Card>

      {ended.map((c) => {
        const gs = state.goals.filter((g) => c.goalIds.includes(g.id) || (c.linkedIds || []).includes(g.id)).map((g) => ({ ...g, start: c.start, end: c.end, challengeId: c.id }));
        let d = 0, e = 0;
        gs.forEach((g) => { const r = goalScore(g, state, today); d += r.done; e += r.expected; });
        const title = c.title[lang] || c.title.en;
        return (
          <Card key={c.id} style={{ backgroundColor: C.goldSoft, borderColor: C.gold, gap: 10 }}>
            <T style={{ fontFamily: F.serif, fontSize: 20, lineHeight: 30 }}>{t('challengeDone', { title })}</T>
            <T style={{ color: C.muted }}>{t('challengeDoneBody', { pct: e ? Math.round((100 * d) / e) + '%' : '—' })}</T>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Button small kind="secondary" title={t('extend7')} onPress={() => actions.extendChallenge(c.id, 7)} style={{ flex: 1 }} />
              <Button small kind="secondary" title={t('extend30')} onPress={() => actions.extendChallenge(c.id, 30)} style={{ flex: 1 }} />
              <Button small title={t('finishChallenge')} onPress={() => actions.finishChallenge(c.id)} style={{ flex: 1 }} />
            </View>
          </Card>
        );
      })}

      {!started ? (
        <Card><T>{t('beforeStart', { date: fmtDate(p.start, lang, { weekday: true }) })}</T></Card>
      ) : null}

      <Card style={{ paddingVertical: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingBottom: 10 }}>
          <Pressable onPress={() => setDay(addDays(day, -1))} disabled={day <= p.start} accessibilityLabel="Previous day"
            style={{ width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center', opacity: day <= p.start ? 0.3 : 1 }}>
            <Text style={{ fontSize: 20, color: C.gold }}>{prev}</Text>
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontFamily: F.serif, fontSize: 19, lineHeight: 28, color: C.ink }}>{total ? t('dayOf', { n: Math.max(n, 0), total }) : t('dayN', { n: Math.max(n, 0) })}</Text>
            <Text style={{ fontSize: 12, color: C.faint, letterSpacing: 0.4 }}>{day === today ? t('today') : fmtDate(day, lang, { weekday: true })}</Text>
          </View>
          <Pressable onPress={() => setDay(addDays(day, 1))} disabled={day >= today} accessibilityLabel="Next day"
            style={{ width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center', opacity: day >= today ? 0.3 : 1 }}>
            <Text style={{ fontSize: 20, color: C.gold }}>{next}</Text>
          </Pressable>
        </View>

        <Divider />
        {future ? <T style={{ color: C.muted, paddingTop: 12 }}>{t('futureDay')}</T> : null}
        {!goals.length ? <T style={{ color: C.muted, paddingTop: 12 }}>{t('noGoals')}</T> : null}
        <Rows list={habits} day={day} future={future} />
        {active.map((c) => {
          const cg = goals.filter((g) => g.challengeId === c.id);
          if (!cg.length) return null;
          return (
            <View key={c.id} style={{ marginTop: 6 }}>
              <View style={{ borderTopWidth: 1, borderColor: C.line, paddingTop: 12 }}>
                <Label>{t('challengeTag')} · {(c.title[lang] || c.title.en)} · {t('dayOf', { n: diffDays(c.start, day) + 1, total: diffDays(c.start, c.end) + 1 })}</Label>
              </View>
              <Rows list={cg} day={day} future={future} />
            </View>
          );
        })}
        <Divider />
        <T center style={{ fontSize: 12, color: C.faint, paddingTop: 10, paddingBottom: day !== today ? 10 : 4 }}>{t('tapDone')}</T>
        {day !== today ? <Button small kind="secondary" title={t('backToToday')} onPress={() => setDay(today)} style={{ marginBottom: 6 }} /> : null}
      </Card>

      <View style={{ alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ width: 28, height: 1, backgroundColor: C.line }} />
          <View style={{ width: 6, height: 6, backgroundColor: C.gold, transform: [{ rotate: '45deg' }] }} />
          <View style={{ width: 28, height: 1, backgroundColor: C.line }} />
        </View>
        <Text style={{ fontFamily: F.serifRegular, fontSize: 21, lineHeight: 38, color: C.ink, textAlign: 'center', writingDirection: 'rtl' }}>{h.ar}</Text>
        {lang !== 'ar' ? <Text style={{ fontSize: 14, lineHeight: 22, color: C.muted, textAlign: 'center', fontStyle: 'italic' }}>{h.en}</Text> : null}
        <Text style={{ fontSize: 11, color: C.gold, textAlign: 'center', letterSpacing: 1.2 }}>{lang === 'ar' ? h.refAr : h.refEn}</Text>
      </View>
    </ScrollView>
  );
}
