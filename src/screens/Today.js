import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { C, F, tone } from '../theme';
import { useStore } from '../lib/store';
import { T, H1, Card, Chip, Divider, Label, Button } from '../components/ui';
import { addDays, diffDays, fmtDate, hijriText, todayKey } from '../lib/dates';
import { activeGoals, bestStreak, constancy, excusedFor, goalDays, goalScore, goalStreak, mark, onItsDay, streak, weekBlock, weekday } from '../lib/stats';
import { growCard, milestoneCards, restartCard, seasonCard } from '../lib/motivation';
import { HADITH, WELCOME } from '../data/hadith';
import { catalogItem } from '../data/catalog';
import { goalTitle, goalDetail } from '../i18n';
import { hadithForDay } from '../data/hadith';
import { setName } from '../lib/sets';

function GoalRow({ goal, day, readOnly, alsoIn }) {
  const { state: st0 } = useStore();
  const exc = excusedFor(st0, goal, day);
  const { state, actions, t } = useStore();
  const lang = state.lang;
  const today = todayKey();
  const m = mark(state, goal.id, day);
  let sub = goalDetail(goal, lang, catalogItem, t);
  let met = false;
  let byMonday = false; // already done on another day this week: shown as done, cannot be changed
  if (goalDays(goal)) {
    const other = weekBlock(goal, state, day).sched.find((k) => k !== day && mark(state, goal.id, k) === 'd');
    if (other && m !== 'd') {
      byMonday = true;
      sub = t('fastDoneOn', { day: t('weekdays').split(',')[weekday(other)] });
    }
  } else if (goal.freq === 'weekly') {
    const b = weekBlock(goal, state, day);
    met = b.done >= b.target && m !== 'd';
    sub = met ? '✓ ' + t('goalReached') + ' · ' + b.done + '/' + b.target : sub + ' · ' + t('thisWeek', { d: b.done, t: b.target });
  } else {
    const s = goalStreak(goal, state, day <= today ? day : today);
    if (s > 0) sub = sub + ' · ✦ ' + s;
  }
  const done = m === 'd' || byMonday, miss = m === 'x';
  if (exc && !done) sub = t('excusedLine');
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', opacity: exc && !done ? 0.45 : met && !done ? 0.75 : 1 }}>
      <Pressable disabled={readOnly || byMonday} onPress={() => actions.toggleMark(goal.id, day, 'd')} accessibilityRole="button" accessibilityState={{ checked: done }}
        style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14 }}>
        <View style={{ width: 28, height: 28, borderRadius: 14, borderWidth: 1.5,
          borderColor: done ? C.accent : miss ? C.miss : met ? C.gold : C.faint,
          backgroundColor: done ? C.accent : miss ? C.missSoft : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
          {done || miss || met ? <Text style={{ color: done ? C.onAccent : miss ? C.miss : C.gold, fontWeight: '800', fontSize: 13 }}>{miss ? '✕' : '✓'}</Text> : null}
        </View>
        <View style={{ flex: 1 }}>
          <T style={{ fontWeight: '600', color: miss ? C.muted : C.ink, textDecorationLine: miss ? 'line-through' : 'none' }}>{goalTitle(goal, lang, catalogItem)}</T>
          <T style={{ fontSize: 13, lineHeight: 18, color: met ? C.gold : C.faint }}>{sub}{alsoIn ? <Text style={{ color: C.gold }}>{'  ◆ ' + alsoIn}</Text> : null}</T>
        </View>
      </Pressable>
      <Pressable disabled={readOnly || exc || byMonday} onPress={() => actions.toggleMark(goal.id, day, 'x')} accessibilityRole="button" accessibilityLabel="Not done" hitSlop={8}
        style={{ width: 30, height: 30, borderRadius: 15, borderWidth: 1, borderColor: miss ? C.miss : C.divider, alignItems: 'center', justifyContent: 'center', marginHorizontal: 4 }}>
        <Text style={{ fontSize: 11, color: miss ? C.miss : C.faint }}>✕</Text>
      </Pressable>
    </View>
  );
}

const EXCUSE_AR = '«إذا مَرِضَ العَبدُ أو سافَرَ كُتِبَ له مِثلُ ما كان يَعمَلُ مُقيمًا صَحيحًا»';

function Callout({ title, quote, refText, body, onClose, children }) {
  const { rtl } = useStore();
  return (
    <Card style={{ borderColor: C.accent, backgroundColor: C.bgDeep, gap: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
        <T style={{ flex: 1, fontFamily: F.serif, fontSize: 19, lineHeight: 28 }}>{title}</T>
        {onClose ? (
          <Pressable onPress={onClose} hitSlop={10} accessibilityLabel="Close" style={{ width: 26, height: 26, borderRadius: 13, borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: C.faint, fontSize: 11 }}>✕</Text>
          </Pressable>
        ) : null}
      </View>
      {quote ? <Text style={{ fontFamily: F.serifRegular, fontSize: 17, lineHeight: 30, color: C.gold, textAlign: rtl ? 'right' : 'left' }}>{quote}</Text> : null}
      {refText ? <T style={{ fontSize: 11, color: C.faint, letterSpacing: 0.4 }}>{refText}</T> : null}
      {body ? <T style={{ fontSize: 14, lineHeight: 21, color: C.muted }}>{body}</T> : null}
      {children}
    </Card>
  );
}

function Rows({ list, day, future, linked = {} }) {
  return list.map((g, i) => (
    <View key={g.id}>
      {i > 0 ? <Divider /> : null}
      <GoalRow goal={g} day={day} readOnly={future} alsoIn={linked[g.id]} />
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
  const goals = activeGoals(state, day).filter((g) => onItsDay(g, day)); // Monday/Thursday goals only on their days
  const habits = goals.filter((g) => !g.challengeId);
  const sets = state.sets && state.sets.length ? state.sets : [{ id: 'worship', name: null }];
  const setOf = (g) => (sets.some((x) => x.id === g.setId) ? g.setId : sets[0].id);
  const linked = {};
  state.challenges.forEach((c) => (c.linkedIds || []).forEach((id) => { linked[id] = c.title[lang] || c.title.en; }));
  const groups = sets.map((st) => ({ st, list: habits.filter((g) => setOf(g) === st.id) })).filter((x) => x.list.length);
  const score = constancy(state, today);
  const st = streak(state, today);
  const n = diffDays(p.start, day) + 1;
  const total = p.end ? diffDays(p.start, p.end) + 1 : null;
  const ended = state.challenges.filter((c) => c.end < today);
  const active = state.challenges.filter((c) => c.end >= today && c.start <= day);
  const h = hadithForDay(diffDays('2020-01-01', day));
  const future = day > today;
  const prev = rtl ? '›' : '‹', next = rtl ? '‹' : '›';
  const excuse = (state.excused || {})[day] || null;
  const season = seasonCard(state, today);
  const restart = restartCard(state, today);
  const restartH = HADITH.find((x) => x.id === 'tuteeqoon') || h;
  const miles = milestoneCards(state, today);
  const grow = growCard(state, today);
  // at most two cards at a time, in this order; closing one lets the next appear
  const cardOrder = [season && 'season', restart && 'restart', ...miles.map((mc) => mc.key), grow && 'grow'].filter(Boolean).slice(0, 2);
  const showCard = (k) => day === today && cardOrder.includes(k);
  const growItem = grow ? catalogItem(grow.goal.catalogId) : null;
  const growUnit = grow ? grow.goal.unit || (growItem ? (lang === 'ar' ? growItem.unitAr : growItem.unitEn) : '') : '';
  const setScores = sets.map((x) => {
    const sc = constancy(state, today, state.goals.filter((g) => !g.archived && !g.challengeId && setOf(g) === x.id));
    return setName(x, t) + ' ' + (sc.pct == null ? '—' : Math.round(sc.pct) + '%');
  }).join(' · ');

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

      {!future && started ? (
        excuse ? (
          <Callout title={t('excusedAllTitle')} quote={EXCUSE_AR}
            refText={t('excusedRef')} body={(lang !== 'ar' ? t('excusedHadith') + ' ' : '') + t('excusedBody')}>
            <Button small kind="secondary" title={t('undo')} onPress={() => actions.setExcused(day, null)} style={{ alignSelf: 'flex-start', paddingHorizontal: 18 }} />
          </Callout>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            <Chip label={'✈︎  ' + t(day === today ? 'excuseAll' : 'excuseAllPast')} onPress={() => actions.setExcused(day, 'all')} />
          </View>
        )
      ) : null}

      {season && showCard('season') ? (
        <Callout onClose={() => actions.dismiss(season.key)}
          title={t(season.month === 7 ? 'rajabTitle' : season.month === 8 ? 'shabanTitle' : 'ramadanTitle')}
          quote={season.month === 7 ? '﴿مِنْهَا أَرْبَعَةٌ حُرُمٌ﴾' : season.month === 8 ? '«وما رأيتُه أكثرَ صيامًا منه في شعبان»' : null}
          refText={season.month === 7 ? t('rajabRef') : season.month === 8 ? t('shabanRef') : null}
          body={[season.month === 7 ? t('rajabBody') : null, season.month !== 7 ? t('seasonSummary', { list: setScores, best: t('nDays', { n: bestStreak(state, today) }) }) : null].filter(Boolean).join(' ')} />
      ) : null}
      {restart && showCard('restart') ? (
        <Callout onClose={() => actions.dismiss(restart.key)} title={t('restartTitle')} quote={restartH.ar} refText={lang === 'ar' ? restartH.refAr : restartH.refEn}
          body={t('restartBody', { n: t('nDays', { n: restart.best }) })} />
      ) : null}
      {miles.filter((mc) => showCard(mc.key)).map((mc) => (
        <Callout key={mc.key} onClose={() => actions.dismiss(mc.key)} title={'✦ ' + t('milestoneTitle', { n: t('nDays', { n: mc.n }), goal: goalTitle(mc.goal, lang, catalogItem) })}
          quote={'«' + WELCOME.ar + '»'} refText={lang === 'ar' ? WELCOME.refAr : WELCOME.refEn} />
      ))}
      {grow && showCard('grow') ? (
        <Callout title={t('growTitle')} body={t('growBody', { goal: goalTitle(grow.goal, lang, catalogItem) })}>
          <Text style={{ fontFamily: F.serif, fontSize: 22, color: C.gold, textAlign: 'center', paddingVertical: 4 }}>{t('growStep', { from: grow.from, to: grow.to, unit: growUnit })}</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button small kind="secondary" title={t('growLater')} onPress={() => actions.snoozeGrow(grow.goal.id, addDays(today, 30))} style={{ flex: 1 }} />
            <Button small title={t('growYes')} onPress={() => { actions.updateGoal(grow.goal.id, { target: grow.to }); actions.snoozeGrow(grow.goal.id, addDays(today, 30)); }} style={{ flex: 1 }} />
          </View>
        </Callout>
      ) : null}

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
        {groups.map(({ st, list }, i) => {
          const sc = constancy(state, today, state.goals.filter((g) => !g.archived && !g.challengeId && setOf(g) === st.id));
          return (
            <View key={st.id} style={{ marginTop: i ? 6 : 0 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 14, paddingBottom: 2, borderTopWidth: i ? 1 : 0, borderColor: C.line }}>
                <Label style={{ flex: 1, marginBottom: 0 }}>{setName(st, t)}</Label>
                <Text style={{ fontFamily: F.serif, fontSize: 17, color: sc.pct == null ? C.faint : tone(sc.pct) }}>{sc.pct == null ? '—' : Math.round(sc.pct) + '%'}</Text>
              </View>
              <Rows list={list} day={day} future={future} linked={linked} />
            </View>
          );
        })}
        {active.map((c) => {
          const cg = goals.filter((g) => g.challengeId === c.id);
          if (!cg.length) return null;
          return (
            <View key={c.id} style={{ marginTop: 6 }}>
              <View style={{ borderTopWidth: 1, borderColor: C.line, paddingTop: 14, paddingBottom: 2 }}>
                <Label style={{ marginBottom: 0 }}>{t('challengeTag')} · {(c.title[lang] || c.title.en)}</Label>
                <T style={{ fontSize: 12, color: C.faint }}>{t('dayOf', { n: diffDays(c.start, day) + 1, total: diffDays(c.start, c.end) + 1 })}</T>
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
