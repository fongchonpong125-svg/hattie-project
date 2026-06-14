# Hattie's Word Garden Project Structure

- `src/data.ts`: seed words, rewards, and asset mapping.
- `src/types.ts`: persistent learning, mastery, wallet, and reward contracts.
- `src/logic.ts`: deterministic mastery, analytics, question selection, and star rules.
- `src/store.ts`: Zustand application state persisted immediately through localForage.
- `src/App.tsx`: route-level child and parent experiences plus shared UI.
- `src/index.css`: paper-cut garden design system and responsive iPad layouts.
- `src/logic.test.ts`: core rule coverage for mastery, anti-farming, and analytics.

The child experience intentionally has shallow navigation and one task per screen.
Parent routes use session authentication and operate on the same local IndexedDB data.
