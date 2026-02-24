# Task ARCH4 — Local Time Setting for Temporal Systems

## Goal
The temporal system calculates lunar phases and planetary days based on
real calendar dates, but players can't set their timezone. This means
the lunar/planetary modifiers may be wrong for players not in UTC.
Add a timezone/local time setting in Options so the temporal system
is accurate for the player's actual location.

## Definition of Done
- [ ] `npm run build` passes
- [ ] Options screen has a "Local Time Zone" setting
- [ ] Player can select their UTC offset (-12 to +14)
- [ ] OR player can click "Use Device Time" to auto-detect
- [ ] Temporal system uses this offset when calculating phase/day
- [ ] Setting persists in localStorage
- [ ] HUD footer shows correct lunar phase and planet for player's timezone
- [ ] Dashboard (H) shows correct temporal info

## Scope — touch ONLY these files
- `src/ui/menus.js` (options screen)
- `src/systems/temporal-system.js` (add offset parameter)
- `src/core/storage.js` (persist timezone setting)

---

## EDIT 1 — temporal-system.js: accept timezone offset

Find where temporal-system.js calculates the current date. Add offset support:

```js
// In temporal-system.js, find getLocalDate() or equivalent
// Add offset parameter:

getLocalDate(utcOffsetHours = 0) {
  const now = new Date();
  // Apply offset
  const localMs = now.getTime() + (utcOffsetHours * 60 * 60 * 1000);
  return new Date(localMs);
}

// If temporal system uses `new Date()` directly anywhere,
// replace with: this.getLocalDate(this.utcOffset)

// Add property:
setTimezoneOffset(hours) {
  this.utcOffset = hours;
}
```

---

## EDIT 2 — storage.js: add timezone persistence

```js
// Add to existing save/load functions:
export function saveTimezone(offsetHours) {
  localStorage.setItem('glitch_timezone', String(offsetHours));
}

export function loadTimezone() {
  const saved = localStorage.getItem('glitch_timezone');
  if (saved !== null) return parseFloat(saved);
  // Auto-detect from browser
  return -(new Date().getTimezoneOffset() / 60);
}
```

---

## EDIT 3 — menus.js: timezone option in Options screen

Find the Options/Settings screen draw function. Add a new option row:

```js
// Timezone display options
const TZ_OPTIONS = [
  { label: 'Auto-detect', value: 'auto' },
  { label: 'UTC-12 (Baker Island)', value: -12 },
  { label: 'UTC-11 (Samoa)', value: -11 },
  { label: 'UTC-10 (Hawaii)', value: -10 },
  { label: 'UTC-9 (Alaska)', value: -9 },
  { label: 'UTC-8 (Pacific US)', value: -8 },
  { label: 'UTC-7 (Mountain US)', value: -7 },
  { label: 'UTC-6 (Central US)', value: -6 },
  { label: 'UTC-5 (Eastern US)', value: -5 },
  { label: 'UTC-4 (Atlantic)', value: -4 },
  { label: 'UTC-3 (Brazil)', value: -3 },
  { label: 'UTC-2', value: -2 },
  { label: 'UTC-1 (Azores)', value: -1 },
  { label: 'UTC+0 (London)', value: 0 },
  { label: 'UTC+1 (Paris)', value: 1 },
  { label: 'UTC+2 (Cairo)', value: 2 },
  { label: 'UTC+3 (Moscow)', value: 3 },
  { label: 'UTC+4 (Dubai)', value: 4 },
  { label: 'UTC+5 (Karachi)', value: 5 },
  { label: 'UTC+5:30 (India)', value: 5.5 },
  { label: 'UTC+6 (Dhaka)', value: 6 },
  { label: 'UTC+7 (Bangkok)', value: 7 },
  { label: 'UTC+8 (Beijing)', value: 8 },
  { label: 'UTC+9 (Tokyo)', value: 9 },
  { label: 'UTC+10 (Sydney)', value: 10 },
  { label: 'UTC+11 (Vladivostok)', value: 11 },
  { label: 'UTC+12 (Auckland)', value: 12 },
  { label: 'UTC+13 (Tonga)', value: 13 },
  { label: 'UTC+14 (Kiribati)', value: 14 },
];
```

In the options draw function, add a "TIMEZONE" row that cycles through
TZ_OPTIONS on left/right arrow press. Show current selection.

On change, call:
```js
const val = selectedTz.value === 'auto'
  ? -(new Date().getTimezoneOffset() / 60)
  : selectedTz.value;
saveTimezone(val);
temporalSystem.setTimezoneOffset(val);
```

---

## EDIT 4 — main.js: load timezone on startup

Near where temporal system is initialized, add:
```js
import { loadTimezone } from './core/storage.js';
temporalSystem.setTimezoneOffset(loadTimezone());
```

---

## Verification
```bash
npm run build
```
Browser:
1. Options screen → "TIMEZONE" option visible
2. Select UTC-5 (Eastern US) → HUD footer updates lunar/planet label
3. Select "Auto-detect" → browser timezone used
4. Refresh game → timezone setting persists
5. H key dashboard → shows correct temporal info for selected timezone
6. If player is in a non-UTC timezone and selects their zone,
   planetary day matches real-world esoteric calendar

## Commit message
```
feat: ARCH4 local timezone setting -- temporal systems accurate to player location
```
