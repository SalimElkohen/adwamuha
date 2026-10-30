import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StoreProvider, useStore } from './src/lib/store';
import { scheduleReminders } from './src/lib/notify';
import { C } from './src/theme';
import Splash, { MADINAH } from './src/screens/Splash';
import Onboarding from './src/screens/Onboarding';
import Today from './src/screens/Today';
import Progress from './src/screens/Progress';
import Challenges from './src/screens/Challenges';
import Settings from './src/screens/Settings';

const TABS = [
  { key: 'today', label: 'tabToday', icon: '◉' },
  { key: 'progress', label: 'tabProgress', icon: '◔' },
  { key: 'challenges', label: 'tabChallenges', icon: '✦' },
  { key: 'settings', label: 'tabSettings', icon: '≡' },
];

function Main() {
  const { state, t, rtl } = useStore();
  const [splash, setSplash] = useState(true);
  const [tab, setTab] = useState('today');
  const done = useCallback(() => setSplash(false), []);

  const r = state.reminders;
  useEffect(() => {
    if (state.onboarded) scheduleReminders(state, t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.onboarded, state.lang, r.morning, r.evening, r.morningTime, r.eveningTime]);

  let body;
  if (splash) body = <Splash onDone={done} />;
  else if (!state.onboarded) body = <Onboarding />;
  else {
    const Screen = tab === 'today' ? Today : tab === 'progress' ? Progress : tab === 'challenges' ? Challenges : Settings;
    body = (
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1 }}><Screen /></View>
        <View style={{ flexDirection: 'row', borderTopWidth: 1, borderColor: C.line, backgroundColor: C.surface, paddingTop: 6, paddingBottom: 4 }}>
          {TABS.map((x) => {
            const on = tab === x.key;
            return (
              <Pressable key={x.key} onPress={() => setTab(x.key)} accessibilityRole="tab" accessibilityState={{ selected: on }}
                style={{ flex: 1, alignItems: 'center', paddingVertical: 4, gap: 2 }}>
                <Text style={{ fontSize: 18, color: on ? C.accent : C.faint }}>{x.icon}</Text>
                <Text style={{ fontSize: 11, fontWeight: on ? '700' : '500', color: on ? C.accent : C.muted }}>{t(x.label)}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView edges={splash ? ['top', 'bottom'] : ['top', 'bottom']} style={{ flex: 1, backgroundColor: splash ? MADINAH.ivory : C.bg }}>
      <StatusBar style="dark" />
      <View style={{ flex: 1, direction: rtl ? 'rtl' : 'ltr' }}>{body}</View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <Main />
      </StoreProvider>
    </SafeAreaProvider>
  );
}
