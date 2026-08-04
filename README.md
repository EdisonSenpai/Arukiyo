<div align="center">

# ARUKIYO

### Walk. Discover. Unlock the world.

**歩いて、世界をひらく。**

A Japanese-inspired mobile exploration game that turns real-world movement into progress, discovery, collections, and adventure.

[![Development Stage](https://img.shields.io/badge/stage-3A%20completed-D85B4B?style=for-the-badge)](#development-progress)
[![Platform](https://img.shields.io/badge/platform-Android-3DDC84?style=for-the-badge&logo=android&logoColor=white)](#technology)
[![Expo](https://img.shields.io/badge/Expo-SDK%2057-000020?style=for-the-badge&logo=expo&logoColor=white)](#technology)
[![React Native](https://img.shields.io/badge/React%20Native-0.86-61DAFB?style=for-the-badge&logo=react&logoColor=black)](#technology)
[![License](https://img.shields.io/badge/license-MIT-D3A84A?style=for-the-badge)](LICENSE)

</div>

---

## About Arukiyo

Arukiyo is a mobile application built around one simple idea:

> Leave the house, explore the real world, and gradually reveal your own map.

The application combines real-world walking, location-based discovery, game progression, Japanese-inspired visual design, daily challenges, collectible landmarks, badges, rewards, and a persistent **fog-of-war** map.

Users begin from a private **Home** area and unlock new roads, locations, and map cells as they travel. Important places such as monuments, museums, parks, historical buildings, and landmarks will become collectible discoveries with their own information, rewards, stamps, and profile badges.

## Current experience

The current Android development build already includes:

- a complete Japanese-inspired mobile interface;
- Home, Explore, Quests, Journal, Profile, and Shop sections;
- real foreground GPS positioning;
- an encrypted private Home location stored on the device;
- a real interactive MapLibre map;
- H3-based geographic exploration cells;
- persistent discovered cells stored in SQLite;
- a functional fog-of-war system;
- live foreground exploration sessions;
- a real route line drawn from accepted GPS points;
- live distance, duration, GPS-point, and new-cell counters;
- GPS quality filtering for inaccurate, duplicated, stale, and implausible points;
- persistent session summaries and route-point storage in SQLite;
- a local exploration-session history;
- completed and interrupted-session handling;
- current-location and Home map markers;
- local completion statistics and exploration reset tools;
- English-first localization with Romanian, Japanese, and device-language modes;
- dedicated Settings and Language screens;
- wireless Android development and physical-device testing.

## Core product vision

Arukiyo is planned as a progressive real-world exploration RPG with:

- exploration percentages for Home area, neighbourhood, city, region, country, continent, and world;
- roads and map areas revealed through real movement;
- collectible landmarks with history, rarity, rewards, and equippable badges;
- XP, levels, explorer ranks, coins, Sakura Shards, streaks, and achievements;
- daily, weekly, and monthly missions;
- distance, walking, discovery, history, photography, and travel progression paths;
- a cosmetic shop with themes, profile frames, map styles, mascots, and effects;
- a Japanese stamp-book travel journal;
- seasonal collections and exploration events;
- optional friends, teams, and group expeditions;
- route memories and generated travel postcards;
- offline exploration support;
- future augmented-reality discovery features;
- privacy controls, safety rules, accessibility options, and anti-cheat protection.

## Development progress

| Stage | Status | Scope |
| --- | ---: | --- |
| Stage 0 | ✅ Complete | Windows environment, Expo project, Android SDK, JDK 17, physical-device build |
| Stage 1A | ✅ Complete | Arukiyo visual identity, tabs, Home, Quests, Journal, Profile, and Shop prototypes |
| Stage 2A | ✅ Complete | Foreground GPS, encrypted Home location, permission handling, location accuracy |
| Stage 2B | ✅ Complete | MapLibre map, H3 cells, SQLite persistence, live exploration, fog of war |
| Stage 2C | ✅ Complete | English-first localization, Romanian and Japanese, map polish, real Home icon |
| Stage 3A | ✅ Complete | Persistent sessions, live route, distance, duration, GPS filtering, summaries, and history |
| Stage 3B | ⏭ Next | XP, levels, coins, reward rules, daily bonuses, and real Home dashboard statistics |
| Stage 3C | Planned | Discovery animations, haptics, animated rewards, and richer journey summaries |
| Stage 4 | Planned | Landmark discovery, collections, badges, historical information |
| Stage 5 | Planned | Accounts, synchronization, FastAPI backend, PostgreSQL and PostGIS |

> Arukiyo is under active development and is not yet a production release.

## Map and exploration model

Arukiyo converts GPS coordinates into H3 hexagonal cells. Entering a sufficiently accurate cell records it locally as discovered. During an active session, accepted GPS points also form a persistent real-world route.

| Map state | Meaning |
| --- | --- |
| Dark hexagon | Undiscovered fog-of-war cell |
| Pink hexagon | Previously discovered cell |
| Gold hexagon | Current cell |
| Green marker | Current GPS position |
| Red marker | Private Home location |
| Red route line | Accepted movement during the current session |

Exploration cells, sessions, session statistics, and accepted route points are persisted locally in SQLite. The exact Home coordinate is stored separately through Expo Secure Store and is not uploaded to a server in the current implementation.

## Session tracking and GPS validation

Stage 3A records foreground exploration sessions while the application is open. Each accepted point stores its coordinates, timestamp, accuracy, altitude, speed, heading, and route sequence.

A point can be filtered when:

- reported accuracy is worse than the configured threshold;
- it is too close to the previous accepted point;
- its timestamp is stale or invalid;
- the implied movement speed is implausible for walking exploration.

Filtered points do not increase route distance or create false route segments. If foreground tracking is interrupted, the active session is finalized and preserved as an interrupted journey instead of being silently lost.

## Languages

Arukiyo currently provides:

- **English** as the default language;
- **Romanian**;
- **Japanese**;
- a **Use device language** mode that follows Android when the language is supported.

The selected language is stored locally and restored when the application is reopened.

## Technology

| Area | Technology |
| --- | --- |
| Mobile application | React Native 0.86 + TypeScript |
| Development platform | Expo SDK 57 + Expo Router |
| Android build | Android SDK 36, Gradle, JDK 17 |
| Map rendering | MapLibre React Native |
| Geographic grid | H3 |
| Local structured storage | Expo SQLite |
| Sensitive local storage | Expo Secure Store |
| Foreground location | Expo Location |
| Localization | i18next + react-i18next + Expo Localization |
| Planned backend | FastAPI |
| Planned database | PostgreSQL + PostGIS |
| Planned caching/tasks | Redis |

## Architecture

```mermaid
flowchart TD
    UI[React Native UI\nExpo Router] --> EXP[Exploration Session Engine]
    EXP --> GPS[Expo Location]
    EXP --> FILTER[GPS Accuracy and Movement Filter]
    FILTER --> ROUTE[Live MapLibre Route]
    FILTER --> GRID[H3 Geographic Grid]
    GRID --> CELLS[(Explored Cells\nExpo SQLite)]
    EXP --> SESSIONS[(Sessions and Route Points\nExpo SQLite)]
    GPS --> HOME[Private Home Location]
    HOME --> SECURE[Expo Secure Store]
    CELLS -. future sync .-> API[FastAPI Backend]
    SESSIONS -. future sync .-> API
    API -. future .-> POSTGIS[(PostgreSQL + PostGIS)]
```

## Repository structure

```text
Arukiyo/
├── assets/                  App icons, splash assets, and images
├── scripts/                 Required build helpers and compatibility patches
├── src/
│   ├── app/                 Expo Router screens, session history, and summaries
│   ├── components/          Reusable interface and MapLibre components
│   ├── constants/           Theme and exploration configuration
│   ├── hooks/               Exploration and live-session state
│   ├── i18n/                English, Romanian, and Japanese resources
│   ├── lib/                 H3, SQLite, GPS filtering, and secure-storage utilities
│   └── providers/           Application-level language state
├── app.json                 Expo application configuration
├── package.json             Dependencies and project commands
└── README.md
```

The native `android/` and `ios/` directories are generated locally through Expo Prebuild and are intentionally excluded from Git.

## Development setup

### Requirements

- Windows 11;
- Node.js 24 LTS;
- npm 11 or newer;
- JDK 17;
- Android Studio;
- Android SDK Platform 36 and Build Tools 36;
- an Android physical device or emulator;
- USB debugging or Wireless debugging.

### Install dependencies

```powershell
npm install
```

The project contains a post-install compatibility patch for the current `h3-js` and Hermes combination.

### Generate the Android project

```powershell
npx expo prebuild --clean --platform android
powershell -ExecutionPolicy Bypass -File .\scripts\fix-gradle-jvm.ps1
```

### Build and install the development application

```powershell
adb devices -l
npx expo run:android --device
```

### Start normal development

After the native development build is installed:

```powershell
npm run dev
```

Routine TypeScript and interface changes do not require rebuilding the APK. A new native build is required after adding or changing native modules.

## Stage 3A validation flow

1. Confirm that the application starts and the stored language is restored.
2. Open **Explore** and start a foreground exploration session.
3. Confirm that the live-session card shows distance, duration, accepted GPS points, filtered points, and newly discovered cells.
4. Walk through a real outdoor route and confirm that the red route line follows accepted movement.
5. Confirm that standing still does not continuously increase distance.
6. Stop the session and confirm that the summary screen opens automatically.
7. Open **Session history** and confirm that the completed session is present.
8. Close and reopen Arukiyo and confirm that session history persists.
9. Start another session, send the application to the background, and confirm that it is preserved as interrupted.
10. Re-test the full flow in English, Romanian, and Japanese.

## Screenshots

Clean in-app screenshots will be added after Stage 3C, when the route, rewards, and discovery-feedback interface is stable enough to represent the project accurately.

Planned gallery:

- Home dashboard;
- MapLibre fog of war and live route;
- completed-session summary;
- local journey history;
- quests and streaks;
- Japanese travel journal;
- profile badges and collections;
- cosmetic shop.

## Privacy and safety principles

Arukiyo is designed around privacy-aware location handling:

- Home is treated as sensitive information;
- exact Home coordinates are stored locally in encrypted storage;
- public interfaces will use an approximate Home area;
- location tracking is currently foreground-only;
- sessions are finalized if foreground tracking is interrupted;
- users will receive explicit controls before background tracking is introduced;
- live location sharing will never be enabled by default;
- private property, unsafe areas, and inaccessible locations must not become mandatory objectives;
- users will be able to delete local exploration and location data.

## Known development notes

- The current MapLibre style uses development/demo tiles and will be replaced before release.
- Foreground exploration works; background exploration is intentionally disabled.
- GPS thresholds are initial development values and will be tuned through additional outdoor testing.
- `h3-js` currently needs a small Hermes compatibility patch, applied automatically after `npm install`.
- Gradle is pinned to Java 17 through the project helper script.
- Do not run `npm audit fix --force` without reviewing Expo and React Native compatibility.

## Contributing

Arukiyo is currently developed as a focused personal project. Issues and implementation discussions may be opened as the project moves closer to a public testing phase.

Please do not submit large architectural changes without prior discussion, because the mobile, geographic, progression, and backend systems are being introduced incrementally by development stage.

## Author

**Eduard Donea** — [EdisonSenpai](https://github.com/EdisonSenpai)

## License

Arukiyo is released under the [MIT License](LICENSE).

Third-party frameworks, libraries, map data, fonts, icons, and other assets remain subject to their respective licenses and attribution requirements.

---

<div align="center">

**Arukiyo — your world begins one step from home.**

</div>
