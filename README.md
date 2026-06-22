# Gym Tracker

A local, offline gym-progress tracker. Monthly calendar overview (Apple-Calendar
style); click a day to plan a PUSH / PULL / LEGS workout. The split **variant**
(e.g. `LEGS1` ↔ `LEGS2`) auto-cycles based on what you did last, and exercises are
suggested from your own history with your last weights pre-filled.

## How to open

Just **double-click `index.html`** — it runs in your browser with no install, no
internet, and no accounts. Everything is saved locally in your browser.

## Features

- **Calendar** main view, color-coded by split (PUSH = blue, PULL = orange, LEGS = green).
- **Day planner**: pick a split → variant auto-cycles → add exercises (variable number
  of sets, each `weight × reps`), set a **location** tag (BERC, ZUID, …), and add
  **stretch/warmup** marker rows.
- **Exercise memory**: the add-exercise list shows everything you've done for that split,
  most-recent first, with your last weights as a hint and pre-fill. Type a new name to
  create a new exercise on the fly.
- **Progress** tab: per-exercise line chart of top-set weight or total volume over time.

## Backing up your data

Your data lives in this browser only. Use the **Export** button to download a JSON
backup, and **Import** to restore it (e.g. on another computer or after clearing your
browser). Back up periodically so you don't lose history.

## Files

```
index.html      app shell
styles.css      styling
js/store.js     data + localStorage + export/import
js/cycle.js     variant auto-cycling
js/calendar.js  month grid
js/planner.js   day planner + exercise picker
js/charts.js    progress charts
js/app.js       wiring
```
