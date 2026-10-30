import React, { useEffect, useRef } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { C, tone } from '../theme';
import { useStore } from '../lib/store';
import { T, Card, Label, Ring } from '../components/ui';
import { addDays, diffDays, hijriOf, HIJRI_MONTHS, monthShort, rangeKeys, todayKey, fromKey } from '../lib/dates';
import { constancy, dayFraction, goalScore, goalStreak, isActiveOn, mark, goalStart } from '../lib/stats';
import { catalogItem } from '../data/catalog';
import { goalTitle } from '../i18n';

const CELL = 12, GAP = 2, NAME_W = 118;

function Grid() {
  const { state, actions, t, rtl } = useStore();
  const lang = state.lang;
  const today = todayKey();
  const p = state.period;
  const goals = state.goals.filter((g) => !g.archived);
  let first = p.start;
  goals.forEach((g) => { const s = goalStart(g, state); if (s < first) first = s; });
  let last = p.end || addDays(today, 6);
  goals.forEach((g) => { if (g.end && g.end > last) last = g.end; });
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
    if (i === 0 || fromKey(k).getDate() === 1) gLabels.push({ i, text: monthShort(k, lang) });
    const h = hijriOf(k, state.hijriAdjust);
    if (i === 0 || h.d === 1) hLabels.push({ i, text: HIJRI_MONTHS[lang === 'ar' ? 'ar' : 'en'][h.m - 1] });
  });
  const W = days.length * (CELL + GAP);

  const labelRow = (labels, color) => (
    <View style={{ height: 16, width: W }}>
      {labels.map((l) => (
        <Text key={l.i} numberOfLines={1} style={{ position: 'absolute', left: l.i * (CELL + GAP), fontSize: 10, color, width: 90 }}>{l.text}</Text>
      ))}
    </View>
  );

  const rows = goals.map((g) => ({ key: g.id, name: goalTitle(g, lang, catalogItem), goal: g }));

  return (
    <View style={{ flexDirection: 'row', direction: 'ltr' }}>
      <View style={{ width: NAME_W, paddingTop: 16 * 2 + 12 }}>
        {rows.map((r) => (
          <View key={r.key} style={{ height: 22, marginBottom: GAP, justifyContent: 'center' }}>
            <Text numberOfLines={1} style={{ fontSize: 12, fontWeight: '600', color: C.ink, textAlign: rtl ? 'right' : 'left', paddingRight: 8 }}>{r.name}</Text>
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
                const active = isActiveOn(r.goal, state, k);
                const m = mark(state, r.goal.id, k);
                const fut = k > today;
                const bg = !active ? 'transparent' : m === 'd' ? C.accent : m === 'x' ? C.miss : fut ? 'transparent' : C.empty;
                return (
                  <Pressable key={k} disabled={!active || fut} onPress={() => actions.cycleMark(r.goal.id, k)}
                    style={{ width: CELL, height: 22, marginRight: GAP, borderRadius: 3, backgroundColor: bg, borderWidth: active && fut ? 1 : 0, borderColor: C.line }} />
                );
              })}
            </View>
          ))}
          <View style={{ flexDirection: 'row', height: 22, marginTop: 6 }}>
            {days.map((k) => {
              const f = dayFraction(state, k);
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
  const { state, t } = useStore();
  const lang = state.lang;
  const today = todayKey();
  const p = state.period;
  const score = constancy(state, today);
  const goals = state.goals.filter((g) => !g.archived);
  const total = p.end ? diffDays(p.start, p.end) + 1 : null;
  const elapsed = Math.max(0, Math.min(total || 1e9, diffDays(p.start, today) + 1));
  const left = total ? Math.max(0, total - elapsed) : null;

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 40 }}>
      <T style={{ fontSize: 28, lineHeight: 34, fontWeight: '700' }}>{t('tabProgress')}</T>
      <Card>
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', flexWrap: 'wrap', gap: 16 }}>
          <View style={{ alignItems: 'center', gap: 6 }}>
            <Ring size={132} stroke={12} pct={total ? (100 * elapsed) / total : 100} color={C.accent} center={String(elapsed)} sub={total ? '/ ' + total : t('openJourney')} />
            <T center style={{ fontWeight: '700', fontSize: 14 }}>{t('journey')}</T>
            <T center style={{ fontSize: 12, color: C.muted }}>{total ? t('daysLeft', { n: left }) : t('openJourney')}</T>
          </View>
          <View style={{ alignItems: 'center', gap: 6 }}>
            <Ring size={132} stroke={12} pct={score.pct || 0} color={tone(score.pct)} center={score.pct == null ? '—' : Math.round(score.pct) + '%'} sub={t('constancy')} />
            <T center style={{ fontWeight: '700', fontSize: 14 }}>{t('overall')}</T>
            <T center style={{ fontSize: 12, color: C.muted }}>{score.done} / {score.expected}</T>
          </View>
        </View>
      </Card>

      <Card>
        <Label>{t('goals')}</Label>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: 16 }}>
          {goals.map((g) => {
            const s = goalScore(g, state, today);
            const k = g.freq === 'weekly' ? 0 : goalStreak(g, state, today);
            return (
              <View key={g.id} style={{ width: '33.33%', alignItems: 'center', gap: 4, paddingHorizontal: 4 }}>
                <Ring size={74} stroke={8} pct={s.pct || 0} color={tone(s.pct)} center={s.pct == null ? '—' : Math.round(s.pct) + '%'} />
                <Text numberOfLines={2} style={{ fontSize: 12, fontWeight: '600', color: C.ink, textAlign: 'center' }}>{goalTitle(g, lang, catalogItem)}</Text>
                <Text style={{ fontSize: 11, color: k > 0 ? C.gold : C.faint }}>{k > 0 ? '🔥 ' + k : s.done + '/' + s.expected}</Text>
              </View>
            );
          })}
        </View>
      </Card>

      <Card>
        <Label>{t('allDays')}</Label>
        <Grid />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 12 }}>
          {[[C.accent, t('legendDone')], [C.miss, t('legendMissed')], [C.empty, t('legendOpen')]].map(([c, l]) => (
            <View key={l} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <View style={{ width: 11, height: 11, borderRadius: 3, backgroundColor: c }} />
              <Text style={{ fontSize: 12, color: C.muted }}>{l}</Text>
            </View>
          ))}
          <Text style={{ fontSize: 12, color: C.muted }}><Text style={{ color: C.gold }}>▼</Text> {t('legendToday')}</Text>
        </View>
        <T style={{ fontSize: 12, color: C.faint, marginTop: 6 }}>{t('gridHint')}</T>
      </Card>
    </ScrollView>
  );
}
