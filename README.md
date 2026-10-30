# Adwamuhā · أدومها

> «أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ» — Sahih al-Bukhari 6464

A free iPhone app for daily good deeds and personal goals, built around constancy.
English and Arabic. Everything stays on the phone.

## What is inside
- `App.js` – app shell: welcome screen, onboarding, tabs
- `src/screens/` – Splash (hadith welcome), Onboarding, Today, Progress, Challenges, Settings
- `src/lib/` – dates & Hijri calendar, scoring (constancy, streaks), storage, reminders
- `src/data/` – hadith library, goal catalogue, seasonal challenges
- `src/i18n.js` – all English and Arabic text
- `docs/index.html` – privacy policy (publish with GitHub Pages)
- `.github/workflows/ios-release.yml` – one-tap build + upload to TestFlight

## Before public release
- Have the Arabic hadith texts and references in `src/data/hadith.js` checked by a qualified person.
- Set your own `ios.bundleIdentifier` in `app.json` if `com.adwamuha.app` is taken.

## Publishing a new seasonal challenge without an App Store update
Host a JSON file (same shape as `BUILT_IN_CHALLENGES` in `src/data/challenges.js`) and put its
URL in `REMOTE_CHALLENGES_URL`. After that one update, new challenges appear in the app as soon
as you edit the file.

## Commands (if you ever use a computer)
```
npm install
npx expo start          # preview in Expo Go
eas build -p ios --profile production --auto-submit
```
