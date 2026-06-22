# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the app

Open `index.html` directly in a browser (`file://`) — no build step, no install, no server required. For the preview server used during development:

```
python -m http.server 4178
```

Then open `http://localhost:4178`.

## Architecture

**Buildless vanilla JS** — all scripts are classic `<script>` tags (not ES modules) so the app works on `file://` without a server. Each file exposes one global on `window`.

Load order in `index.html` matters:
```
store.js → cycle.js → calendar.js → planner.js → charts.js → app.js
```

### Globals and responsibilities

| Global | File | Role |
|---|---|---|
| `Store` | `js/store.js` | All localStorage reads/writes, exercise catalog, workout queries, export/import |
| `Cycle` | `js/cycle.js` | Auto-cycles split variants (LEGS1↔LEGS2 etc.) based on prior workout history |
| `CalendarView` | `js/calendar.js` | Renders the monthly grid; calls `Store` for workout chips |
| `Planner` | `js/planner.js` | Day-planner modal + exercise picker overlay; owns `editingEntries` and drag-drop state |
| `Charts` | `js/charts.js` | Progress view with split filter tabs and hand-drawn SVG line chart |
| *(none)* | `js/app.js` | Wires tabs, export/import button, ESC key, `CalendarView ↔ Planner` round-trip |

### Data model (single JSON in `localStorage` key `gymtracker.v1`)

```js
{
  version: 1,
  exercises: [{ id, name, split: "PUSH"|"PULL"|"LEGS", isStretch: bool }],
  workouts: [{
    id, date: "YYYY-MM-DD", split, variant: 1|2, location,
    entries: [{ exerciseId, isStretch, sets: [{weight, reps}], note }]
  }]
}
```

One workout per calendar day. Exercises are a shared catalog; entries reference them by `exerciseId`.

### Key patterns

- **Persistence**: `Store.upsertWorkout(wk)` is called on every input change in the planner (auto-save). Never call `Store.save()` directly from views — use the domain methods.
- **Re-render**: views call their own `render()` after any state change. There is no virtual DOM or diffing — the modal innerHTML is fully rebuilt on each render, which is safe because `editingEntries` (a module-level object in `planner.js`) tracks which entries are in edit mode across renders.
- **Drag-and-drop**: `dragSrcIdx` in `planner.js` tracks the source index. On drop, `wk.entries` is spliced in-place and `editingEntries` is cleared.
- **Charts filter**: `state.split` in `charts.js` gates which exercises appear in the dropdown. Switching split resets `state.exerciseId`.
- **History queries**: `Store.lastSetsForExercise(id, ignoreDate)` ignores sets where both weight and reps are blank/zero — this prevents placeholder rows from appearing in the progress charts or memory hints.

### Seeding historical data

`seed-history.js` is a one-shot browser console script that rebuilds all of `localStorage` from hardcoded workout history. Run it in the console, then use the Export button to save a backup JSON. It is **not** loaded by `index.html`.

## Styling

CSS variables are defined in `:root` in `styles.css`. Split colours (`--push`, `--pull`, `--legs`) drive both the calendar chips and the planner split buttons via shared `.chip-push/pull/legs` classes. The `[hidden]` rule at the top of `styles.css` is critical — it prevents overlay `display:flex` from overriding the HTML `hidden` attribute.
