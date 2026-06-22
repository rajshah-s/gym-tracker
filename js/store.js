/* Data layer: localStorage persistence, queries, export/import.
   Exposes a global `Store`. No build step, no modules. */
(function () {
  "use strict";

  var KEY = "gymtracker.v1";

  // ---- Seed: exercise catalog only (no fake workout history) ----
  // Names taken from the user's Google Sheet so the memory list is useful on
  // day one. Weights/reps still build up naturally as workouts are logged.
  var SEED = [
    // LEGS
    ["Calf Machine", "LEGS"], ["Leg Press Machine", "LEGS"],
    ["SL: Leg Press Machine", "LEGS"], ["Hack Squat", "LEGS"],
    ["Leg Extensions", "LEGS"], ["Glute Extensions", "LEGS"],
    ["Hip Adductors", "LEGS"],
    // PUSH
    ["Chest Press Arc Machine", "PUSH"], ["High-Low Cable Fly", "PUSH"],
    ["Upper Chest & Front Delt Mc", "PUSH"], ["Shoulder Press Machine", "PUSH"],
    ["Skullcrushers", "PUSH"], ["Seated Lateral Raises", "PUSH"],
    ["SA: Tricep Pushdown", "PUSH"], ["SA: Cable Lateral Raises", "PUSH"],
    ["SA: Rear Delt Pulls", "PUSH"],
    // PULL
    ["Barbell Upper Back Rows", "PULL"], ["Lat Pulldown", "PULL"],
    ["SA: Lat Pulldown", "PULL"], ["Bicep Curl Machine", "PULL"],
    ["Lat Pullover", "PULL"], ["Trap Pulls", "PULL"],
    ["Cable Hammer Curls", "PULL"], ["SA: Rear Delt Pulls", "PULL"]
  ];

  function freshData() {
    var data = { version: 1, exercises: [], workouts: [] };
    SEED.forEach(function (s) {
      data.exercises.push({ id: genId(), name: s[0], split: s[1], isStretch: false });
    });
    // One shared "Stretches" marker per split.
    ["PUSH", "PULL", "LEGS"].forEach(function (sp) {
      data.exercises.push({ id: genId(), name: "Stretches", split: sp, isStretch: true });
    });
    return data;
  }

  var _data = null;

  // ---- Duplicate-exercise merges ----
  // [canonicalName, aliasName, split]. Applied idempotently on every load so the
  // catalog self-heals in whatever browser the data lives in. To merge more
  // duplicates later, just add a row here.
  var MERGES = [
    ["Bicep Cable Curls",       "Cable Curls",               "PULL"],
    ["Upper Back Cable Rows",   "Seated Horizontal Row",     "PULL"],
    ["SA: Bench JPG Pulls",     "SA: JPG Knee Lat Pulls",    "PULL"],
    ["SA: Cable Lateral Raises","SA: Lateral Raises",        "PUSH"],
    ["SA: Tricep Kickbacks",    "SA: H-L Tricep Kickbacks",  "PUSH"],
    ["Katana Raises",           "Katana Extensions",         "PUSH"]
  ];

  function applyMerges(data) {
    var changed = false;
    MERGES.forEach(function (m) {
      var canonName = m[0], aliasName = m[1], split = m[2];
      var alias = data.exercises.filter(function (e) {
        return e.name === aliasName && e.split === split;
      })[0];
      if (!alias) return; // nothing to merge

      var canon = data.exercises.filter(function (e) {
        return e.name === canonName && e.split === split;
      })[0];

      if (!canon) {
        // Canonical missing — just rename the alias in place.
        alias.name = canonName;
        changed = true;
        return;
      }

      // Remap every workout entry from the alias to the canonical exercise.
      (data.workouts || []).forEach(function (w) {
        (w.entries || []).forEach(function (en) {
          if (en.exerciseId === alias.id) en.exerciseId = canon.id;
        });
      });
      // Drop the alias from the catalog.
      data.exercises = data.exercises.filter(function (e) { return e.id !== alias.id; });
      changed = true;
    });
    return changed;
  }

  function genId() {
    return "id_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
  }

  function load() {
    if (_data) return _data;
    var raw = null;
    try { raw = localStorage.getItem(KEY); } catch (e) { raw = null; }
    if (!raw) {
      _data = freshData();
      save();
    } else {
      try {
        _data = JSON.parse(raw);
      } catch (e) {
        _data = freshData();
        save();
      }
      if (!_data.exercises) _data.exercises = [];
      if (!_data.workouts) _data.workouts = [];
      if (applyMerges(_data)) save();
    }
    return _data;
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(_data)); }
    catch (e) { alert("Could not save data: " + e.message); }
  }

  // ---- Date helpers (local time, no timezone surprises) ----
  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function dateKey(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }

  // ---- Exercise queries ----
  function exercisesForSplit(split) {
    return load().exercises.filter(function (e) { return e.split === split; });
  }
  function exerciseById(id) {
    return load().exercises.filter(function (e) { return e.id === id; })[0] || null;
  }
  function addExercise(name, split, isStretch) {
    var ex = { id: genId(), name: name.trim(), split: split, isStretch: !!isStretch };
    load().exercises.push(ex);
    save();
    return ex;
  }

  // ---- Workout queries ----
  function getWorkout(date) {
    return load().workouts.filter(function (w) { return w.date === date; })[0] || null;
  }
  function upsertWorkout(workout) {
    var d = load();
    var idx = -1;
    for (var i = 0; i < d.workouts.length; i++) {
      if (d.workouts[i].date === workout.date) { idx = i; break; }
    }
    if (idx >= 0) d.workouts[idx] = workout;
    else d.workouts.push(workout);
    save();
  }
  function deleteWorkout(date) {
    var d = load();
    d.workouts = d.workouts.filter(function (w) { return w.date !== date; });
    save();
  }

  // Most recent workout of a split strictly before `beforeDate` (YYYY-MM-DD).
  function lastWorkoutOfSplit(split, beforeDate) {
    var matches = load().workouts.filter(function (w) {
      return w.split === split && (!beforeDate || w.date < beforeDate);
    });
    matches.sort(function (a, b) { return a.date < b.date ? 1 : -1; }); // newest first
    return matches[0] || null;
  }

  // A set "counts" as logged history only once it has a real number entered
  // (so blank placeholder rows don't pollute charts or memory hints).
  function num(v) { var n = parseFloat(v); return isNaN(n) ? 0 : n; }
  function hasValue(set) { return num(set.weight) > 0 || num(set.reps) > 0; }
  function loggedSets(sets) { return (sets || []).filter(hasValue); }

  // Most recent sets logged for a given exercise (for prefill). Optionally
  // ignore a specific date (the one being edited).
  function lastSetsForExercise(exerciseId, ignoreDate) {
    var ws = load().workouts.slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; });
    for (var i = 0; i < ws.length; i++) {
      if (ignoreDate && ws[i].date === ignoreDate) continue;
      var entries = ws[i].entries || [];
      for (var j = 0; j < entries.length; j++) {
        if (entries[j].exerciseId === exerciseId) {
          var sets = loggedSets(entries[j].sets);
          if (sets.length) return { date: ws[i].date, sets: sets };
        }
      }
    }
    return null;
  }

  // Full chronological history of an exercise: [{date, sets}], oldest first.
  function historyForExercise(exerciseId) {
    var out = [];
    load().workouts.forEach(function (w) {
      (w.entries || []).forEach(function (en) {
        if (en.exerciseId === exerciseId) {
          var sets = loggedSets(en.sets);
          if (sets.length) out.push({ date: w.date, sets: sets });
        }
      });
    });
    out.sort(function (a, b) { return a.date < b.date ? -1 : 1; });
    return out;
  }

  function exercisesWithHistory() {
    var d = load();
    var ids = {};
    d.workouts.forEach(function (w) {
      (w.entries || []).forEach(function (en) {
        if (loggedSets(en.sets).length) ids[en.exerciseId] = true;
      });
    });
    return d.exercises.filter(function (e) { return ids[e.id]; });
  }

  // ---- Export / Import ----
  function exportJSON() { return JSON.stringify(load(), null, 2); }
  function importJSON(text) {
    var parsed = JSON.parse(text);
    if (!parsed || !Array.isArray(parsed.exercises) || !Array.isArray(parsed.workouts)) {
      throw new Error("That file doesn't look like a Gym Tracker backup.");
    }
    _data = parsed;
    save();
  }

  window.Store = {
    genId: genId,
    load: load,
    save: save,
    dateKey: dateKey,
    exercisesForSplit: exercisesForSplit,
    exerciseById: exerciseById,
    addExercise: addExercise,
    getWorkout: getWorkout,
    upsertWorkout: upsertWorkout,
    deleteWorkout: deleteWorkout,
    lastWorkoutOfSplit: lastWorkoutOfSplit,
    lastSetsForExercise: lastSetsForExercise,
    historyForExercise: historyForExercise,
    exercisesWithHistory: exercisesWithHistory,
    exportJSON: exportJSON,
    importJSON: importJSON
  };
})();
