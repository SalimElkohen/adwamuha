import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { C, tone } from '../theme';
import { useStore } from '../lib/store';
import { T, Card, Label, Button } from '../components/ui';
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
    if (s > 0) sub = sub + ' · 🔥 ' + s;
  }
  const bg = m === 'd' ? C.accentSoft : m === 'x' ? C.missSoft : met ? C.bg : C.surface;
  const border = m === 'd' ? C.accent : m === 'x' ? C.miss : C.line;
  return (
    <View style={{ flexDirection: 'row', borderWidth: 1, borderColor: border, borderStyle: met ? 'dashed' : 'solid', backgroundColor: bg, borderRadius: 14, overflow: 'hidden' }}>
      <Pressable disabled={readOnly} onPress={() => actions.toggleMark(goal.id, day, 'd')} accessibilityRole="button" accessibilityState={{ checked: m === 'd' }}
        style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: met ? 9 : 13, paddingHorizontal: 14 }}>
        <View style={{ width: met ? 22 : 28, height: met ? 22 : 28, borderRadius: 14, borderWidth: 2, borderColor: m === 'd' ? C.accent : m === 'x' ? C.miss : met ? C.gold : C.line, backgroundColor: m === 'd' ? C.accent : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: m === 'd' ? C.white : m === 'x' ? C.miss : met ? C.gold : 'transparent', fontWeight: '800', fontSize: met ? 12 : 15 }}>{m === 'x' ? '✕' : '✓'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <T style={{ fontWeight: met ? '500' : '600', color: met ? C.muted : C.ink }}>{goalTitle(goal, lang, catalogItem)}</T>
          <T style={{ fontSize: 13, lineHeight: 18, color: met ? C.gold : C.muted }}>{sub}</T>
        </View>
      </Pressable>
      <Pressable disabled={readOnly} onPress={() => actions.toggleMark(goal.id, day, 'x')} accessibilityRole="button" accessibilityLabel="Not done"
        style={{ width: 48, alignItems: 'center', justifyContent: 'center', borderLeftWidth: 1, borderColor: border }}>
        <Text style={{ fontSize: 16, color: m === 'x' ? C.miss : C.faint }}>✕</Text>
      </Pressable>
    </View>
  );
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
    <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 40 }}>
      <View>
        <T style={{ fontSize: 28, lineHeight: 34, fontWeight: '700' }}>{fmtDate(today, lang, { weekday: true })}</T>
        <T style={{ color: C.gold, fontSize: 15 }}>{hijriText(today, lang, state.hijriAdjust)}</T>
      </View>

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Card style={{ flex: 1, padding: 14 }}>
          <Label style={{ marginBottom: 4 }}>{t('constancy')}</Label>
          <Text style={{ fontSize: 32, fontWeight: '700', color: score.pct == null ? C.faint : tone(score.pct), fontVariant: ['tabular-nums'], textAlign: rtl ? 'right' : 'left' }}>
            {score.pct == null ? '—' : Math.round(score.pct) + '%'}
          </Text>
          <T style={{ fontSize: 12, color: C.muted, lineHeight: 16 }}>{score.pct == null ? t('noScoreYet') : score.done + ' / ' + score.expected}</T>
        </Card>
        <Card style={{ flex: 1, padding: 14 }}>
          <Label style={{ marginBottom: 4 }}>{t('streak')}</Label>
          <Text style={{ fontSize: 32, fontWeight: '700', color: st > 0 ? C.gold : C.faint, fontVariant: ['tabular-nums'], textAlign: rtl ? 'right' : 'left' }}>{st > 0 ? '🔥 ' + st : '0'}</Text>
          <T style={{ fontSize: 12, color: C.muted, lineHeight: 16 }}>{t('streakDays', { n: st })}</T>
        </Card>
      </View>

      {ended.map((c) => {
        const gs = state.goals.filter((g) => c.goalIds.includes(g.id) || (c.linkedIds || []).includes(g.id)).map((g) => ({ ...g, start: c.start, end: c.end, challengeId: c.id }));
        let d = 0, e = 0;
        gs.forEach((g) => { const r = goalScore(g, state, today); d += r.done; e += r.expected; });
        const title = c.title[lang] || c.title.en;
        return (
          <Card key={c.id} style={{ backgroundColor: C.goldSoft, borderColor: C.gold, gap: 10 }}>
            <T style={{ fontWeight: '700', fontSize: 17 }}>{t('challengeDone', { title })}</T>
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

      <Card style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Pressable onPress={() => setDay(addDays(day, -1))} disabled={day <= p.start} accessibilityLabel="Previous day"
            style={{ width: 38, height: 38, borderRadius: 10, borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center', opacity: day <= p.start ? 0.35 : 1 }}>
            <Text style={{ fontSize: 20, color: C.ink }}>{prev}</Text>
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontSize: 17, fontWeight: '700', color: C.ink }}>{total ? t('dayOf', { n: Math.max(n, 0), total }) : t('dayN', { n: Math.max(n, 0) })}</Text>
            <Text style={{ fontSize: 13, color: C.muted }}>{day === today ? t('today') : fmtDate(day, lang, { weekday: true })}</Text>
          </View>
          <Pressable onPress={() => setDay(addDays(day, 1))} disabled={day >= today} accessibilityLabel="Next day"
            style={{ width: 38, height: 38, borderRadius: 10, borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center', opacity: day >= today ? 0.35 : 1 }}>
            <Text style={{ fontSize: 20, color: C.ink }}>{next}</Text>
          </Pressable>
        </View>

        {future ? <T style={{ color: C.muted }}>{t('futureDay')}</T> : null}
        {!goals.length ? <T style={{ color: C.muted }}>{t('noGoals')}</T> : null}
        {habits.map((g) => <GoalRow key={g.id} goal={g} day={day} readOnly={future} />)}
        {active.map((c) => {
          const cg = goals.filter((g) => g.challengeId === c.id);
          if (!cg.length) return null;
          return (
            <View key={c.id} style={{ gap: 8, marginTop: 4 }}>
              <T style={{ fontSize: 12, fontWeight: '700', color: C.gold, letterSpacing: 0.6 }}>
                {t('challengeTag').toUpperCase()} · {(c.title[lang] || c.title.en)} · {t('dayOf', { n: diffDays(c.start, day) + 1, total: diffDays(c.start, c.end) + 1 })}
              </T>
              {cg.map((g) => <GoalRow key={g.id} goal={g} day={day} readOnly={future} />)}
            </View>
          );
        })}
        <T style={{ fontSize: 12, color: C.faint }}>{t('tapDone')}</T>
        {day !== today ? <Button small kind="secondary" title={t('backToToday')} onPress={() => setDay(today)} /> : null}
      </Card>

      <Card style={{ backgroundColor: C.goldSoft, borderColor: 'transparent', gap: 8 }}>
        <Text style={{ fontSize: 19, lineHeight: 34, color: C.ink, textAlign: 'center', writingDirection: 'rtl' }}>{h.ar}</Text>
        {lang !== 'ar' ? <Text style={{ fontSize: 14, lineHeight: 21, color: C.muted, textAlign: 'center' }}>{h.en}</Text> : null}
        <Text style={{ fontSize: 12, color: C.gold, textAlign: 'center' }}>{lang === 'ar' ? h.refAr : h.refEn}</Text>
      </Card>
    </ScrollView>
  );
}
