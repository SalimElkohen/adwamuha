import React, { useEffect, useRef } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { C, tone } from '../theme';
import { useStore } from '../lib/store';
import { T, H1, Card, Label, Ring } from '../components/ui';
import { addDays, diffDays, hijriOf, HIJRI_MONTHS, monthShort, rangeKeys, todayKey, fromKey } from '../lib/dates';
import { constancy, dayFraction, excusedFor, onItsDay, weekBlock, goalScore, goalStreak, isActiveOn, mark, goalStart } from '../lib/stats';
import { catalogItem } from '../data/catalog';
import { goalShort, goalTitle } from '../i18n';
import { setName } from '../lib/sets';
import { F } from '../theme';

const CELL = 12, GAP = 2, NAME_W = 118;
const EXCUSED = 'rgba(201,218,207,0.38)'; // soft grey-green: excused day
const WEEK_MET = 'rgba(227,194,119,0.6)'; // soft gold: weekly target reached

// one table for a group of goals (a set or a challenge)
function Grid({ goals }) {
  const { state, actions, t, rtl } = useStore();
  const lang = state.lang;
  const today = todayKey();
  const p = state.period;
  let first = null;
  goals.forEach((g) => { const s = goalStart(g, state); if (!first || s < first) first = s; });
  first = first || p.start;
  let last = goals.some((g) => !g.challengeId) ? p.end || addDays(today, 6) : null;
  goals.forEach((g) => { if (g.end && (!last || g.end > last)) last = g.end; });
  if (!last) last = addDays(today, 6);
  const days = rangeKeys(first, last);
  const scroller = useRef(null);
  const ti = days.indexOf(today);

  useEffect(() => {
    if (scroller.current && ti > 0) {
      const x = Math.max(0, ti * (CELL + GAP) - 200);
      setTimeout(() => scroller.current && scroller.current.scrollTo({ x, animated: false }), 0);
    }
  }, [ti]);

  // month labels (Gregorian + Hijri)
  const gLabels = [], hLabels = [];
  days.forEach((k, i) => {
    // a new month label replaces one that started fewer than 5 cells earlier, so they never overlap
    const put = (arr, text) => { if (arr.length && i - arr[arr.length - 1].i < 5) arr.pop(); arr.push({ i, text }); };
    if (i === 0 || fromKey(k).getDate() === 1) put(gLabels, monthShort(k, lang));
    const h = hijriOf(k, state.hijriAdjust);
    if (i === 0 || h.d === 1) put(hLabels, HIJRI_MONTHS[lang === 'ar' ? 'ar' : 'en'][h.m - 1]);
  });
  const W = days.length * (CELL + GAP);

  const labelRow = (labels, color) => (
    <View style={{ height: 16, width: W }}>
      {labels.map((l) => (
        <Text key={l.i} numberOfLines={1} style={{ position: 'absolute', left: l.i * (CELL + GAP), fontSize: 10, color, width: 90 }}>{l.text}</Text>
      ))}
    </View>
  );

  const rows = goals.map((g) => ({ key: g.id, name: goalShort(g, lang, catalogItem), goal: g }));

  return (
    <View style={{ flexDirection: 'row', direction: 'ltr' }}>
      <View style={{ width: NAME_W, paddingTop: 16 * 2 + 12 }}>
        {rows.map((r) => (
          <View key={r.key} style={{ height: 22, marginBottom: GAP, justifyContent: 'center' }}>
            <Text numberOfLines={1} style={{ fontSize: 12, fontWeight: '600', color: C.ink, textAlign: rtl ? 'right' : 'left', writingDirection: rtl ? 'rtl' : 'ltr', paddingRight: 8 }}>{r.name}</Text>
          </View>
        ))}
        <View style={{ height: 22, marginTop: 6, justifyContent: 'center' }}>
          <Text style={{ fontSize: 12, color: C.muted, textAlign: rtl ? 'right' : 'left', paddingRight: 8 }}>{t('allDaily')}</Text>
        </View>
      </View>
      <ScrollView horizontal ref={scroller} showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
        <View>
          {labelRow(gLabels, C.muted)}
          {labelRow(hLabels, C.gold)}
          <View style={{ height: 12, width: W }}>
            {ti >= 0 ? <Text style={{ position: 'absolute', left: ti * (CELL + GAP) + 1, fontSize: 10, color: C.gold }}>▼</Text> : null}
          </View>
          {rows.map((r) => (
            <View key={r.key} style={{ flexDirection: 'row', height: 22, marginBottom: GAP }}>
              {days.map((k) => {
                const active = isActiveOn(r.goal, state, k) && onItsDay(r.goal, k);
                const m = mark(state, r.goal.id, k);
                const fut = k > today;
                const exc = active && m !== 'd' && excusedFor(state, r.goal, k);
                // weekly goals: the other days of a week whose target is met are shaded; otherwise left almost blank (not missed)
                const wk = active && !m && !exc && !fut && r.goal.freq === 'weekly';
                const met = wk && (() => { const bl = weekBlock(r.goal, state, k); return bl.target > 0 && bl.done >= bl.target; })();
                const bg = !active ? 'transparent' : m === 'd' ? C.accent : exc ? EXCUSED : m === 'x' ? C.miss : fut ? 'transparent' : wk ? (met ? WEEK_MET : 'rgba(248,243,232,0.04)') : C.empty;
                return (
                  <View key={k} style={{ width: CELL, height: 22, marginRight: GAP, borderRadius: 2, backgroundColor: bg, borderWidth: active && fut ? 1 : 0, borderColor: C.line }} />
                );
              })}
            </View>
          ))}
          <View style={{ flexDirection: 'row', height: 22, marginTop: 6 }}>
            {days.map((k) => {
              const daily = goals.filter((g) => g.freq !== 'weekly' && isActiveOn(g, state, k) && !excusedFor(state, g, k));
              const f = daily.length ? daily.filter((g) => mark(state, g.id, k) === 'd').length / daily.length : null;
              const fut = k > today;
              return <View key={k} style={{ width: CELL, height: 22, marginRight: GAP, borderRadius: 3, backgroundColor: f == null || fut ? 'transparent' : C.empty, overflow: 'hidden', justifyContent: 'flex-end' }}>
                {f && !fut ? <View style={{ height: 22 * f, backgroundColor: C.accent, opacity: 0.85 }} /> : null}
              </View>;
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

export default function Progress() {
  const { state, t, rtl } = useStore();
  const lang = state.lang;
  const today = todayKey();
  const p = state.period;
  const score = constancy(state, today);
  const goals = state.goals.filter((g) => !g.archived);
  const sets = state.sets && state.sets.length ? state.sets : [{ id: 'worship', name: null }];
  const setOf = (g) => (sets.some((x) => x.id === g.setId) ? g.setId : sets[0].id);
  const groups = [
    ...sets.map((st) => ({ key: st.id, title: setName(st, t), name: setName(st, t), goals: goals.filter((g) => !g.challengeId && setOf(g) === st.id) })),
    ...state.challenges.map((c) => ({ key: c.id, title: t('challengeTag') + ' · ' + (c.title[lang] || c.title.en), name: c.title[lang] || c.title.en, goals: goals.filter((g) => g.challengeId === c.id) })),
  ].filter((gr) => gr.goals.length);
  const total = p.end ? diffDays(p.start, p.end) + 1 : null;
  const elapsed = Math.max(0, Math.min(total || 1e9, diffDays(p.start, today) + 1));
  const left = total ? Math.max(0, total - elapsed) : null;

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }}>
      <H1 style={{ paddingTop: 4 }}>{t('tabProgress')}</H1>
      <Card>
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', flexWrap: 'wrap', gap: 16 }}>
          <View style={{ alignItems: 'center', gap: 6 }}>
            <Ring size={128} stroke={8} pct={total ? (100 * elapsed) / total : 100} color={C.accent} center={String(elapsed)} sub={total ? '/ ' + total : t('openJourney')} />
            <Label style={{ marginBottom: 0, marginTop: 4 }}>{t('journey')}</Label>
            <T center style={{ fontSize: 12, color: C.faint }}>{total ? t('daysLeft', { n: left }) : t('openJourney')}</T>
          </View>
          <View style={{ alignItems: 'center', gap: 6 }}>
            <Ring size={128} stroke={8} pct={score.pct || 0} color={tone(score.pct)} center={score.pct == null ? '—' : Math.round(score.pct) + '%'} sub={t('constancy')} />
            <Label style={{ marginBottom: 0, marginTop: 4 }}>{t('overall')}</Label>
            <T center style={{ fontSize: 12, color: C.faint }}>{score.done} / {score.expected}</T>
          </View>
        </View>
      </Card>

      {groups.map((gr) => {
        const sc = constancy(state, today, gr.goals);
        return (
          <Card key={gr.key}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Label style={{ flex: 1, marginBottom: 0 }}>{gr.title}</Label>
              <Text style={{ fontFamily: F.serif, fontSize: 18, color: sc.pct == null ? C.faint : tone(sc.pct) }}>{sc.pct == null ? '—' : Math.round(sc.pct) + '%'}</Text>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: 16 }}>
              {gr.goals.map((g) => {
                const s = goalScore(g, state, today);
                const k = g.freq === 'weekly' ? 0 : goalStreak(g, state, today);
                return (
                  <View key={g.id} style={{ width: '33.33%', alignItems: 'center', gap: 4, paddingHorizontal: 4 }}>
                    <Ring size={72} stroke={5} pct={s.pct || 0} color={tone(s.pct)} center={s.pct == null ? '—' : Math.round(s.pct) + '%'} />
                    <Text numberOfLines={2} style={{ fontSize: 12, fontWeight: '600', color: C.ink, textAlign: 'center', writingDirection: rtl ? 'rtl' : 'ltr' }}>{goalShort(g, lang, catalogItem)}</Text>
                    <Text style={{ fontSize: 11, color: k > 0 ? C.gold : C.faint }}>{k > 0 ? '✦ ' + k : s.done + '/' + s.expected}</Text>
                  </View>
                );
              })}
            </View>
          </Card>
        );
      })}

      <Label style={{ marginTop: 8, marginBottom: -4 }}>{t('allDays')}</Label>
      {groups.map((gr) => (
        <Card key={'grid_' + gr.key}>
          <T style={{ fontFamily: F.serif, fontSize: 18, lineHeight: 28, marginBottom: 6 }}>{gr.name}</T>
          <Grid goals={gr.goals} />
        </Card>
      ))}
      <View style={{ paddingHorizontal: 4, gap: 6 }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {[[C.accent, t('legendDone')], [WEEK_MET, t('legendWeekMet')], [C.miss, t('legendMissed')], [EXCUSED, t('legendExcused')], [C.empty, t('legendOpen')]].map(([c, l]) => (
            <View key={l} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: c }} />
              <Text style={{ fontSize: 12, color: C.muted }}>{l}</Text>
            </View>
          ))}
          <Text style={{ fontSize: 12, color: C.muted }}><Text style={{ color: C.gold }}>▼</Text> {t('legendToday')}</Text>
        </View>
        <T style={{ fontSize: 12, color: C.faint }}>{t('gridHint')}</T>
      </View>
    </ScrollView>
  );
}
