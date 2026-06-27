/* Day planner modal + exercise picker. Exposes a global `Planner`. */
(function () {
  "use strict";

  var SPLITS = ["PUSH", "PULL", "LEGS"];
  var MONTHS = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  var overlay, modal, pickerOverlay, pickerModal;
  var wk = null;
  var onClose = null;
  var editingEntries = {}; // index -> true for entries in edit mode
  var dragSrcIdx = null;

  function init() {
    overlay = document.getElementById("planner-overlay");
    modal = document.getElementById("planner-modal");
    pickerOverlay = document.getElementById("picker-overlay");
    pickerModal = document.getElementById("picker-modal");
    overlay.addEventListener("click", function (e) {
      if (e.target.getAttribute("data-close")) close();
    });
    pickerOverlay.addEventListener("click", function (e) {
      if (e.target.getAttribute("data-close")) hidePicker();
    });
  }

  function open(dateKey, closeCb) {
    onClose = closeCb || null;
    editingEntries = {}; // existing entries start collapsed
    var existing = Store.getWorkout(dateKey);
    if (existing) {
      wk = JSON.parse(JSON.stringify(existing));
    } else {
      wk = { id: Store.genId(), date: dateKey, split: null, variant: 1, location: "", entries: [] };
    }
    overlay.hidden = false;
    render();
  }

  function close() {
    overlay.hidden = true;
    if (onClose) onClose();
  }

  function persist() {
    if (wk.split && (wk.entries.length || wk.location)) Store.upsertWorkout(wk);
    else if (!wk.entries.length && !wk.location) Store.deleteWorkout(wk.date);
  }

  function formatLong(key) {
    var p = key.split("-");
    var d = new Date(+p[0], +p[1] - 1, +p[2]);
    return DAYS[d.getDay()] + ", " + (+p[2]) + " " + MONTHS[+p[1] - 1] + " " + p[0];
  }

  function setSummary(sets) {
    if (!sets || !sets.length) return "—";
    return sets.map(function (s) {
      var w = (s.weight !== "" && s.weight !== null && s.weight !== undefined) ? s.weight : "—";
      var r = (s.reps !== "" && s.reps !== null && s.reps !== undefined) ? s.reps : "—";
      return w + " kg × " + r;
    }).join("  ·  ");
  }

  // After deleting entry at deletedIdx, shift editing indices.
  function shiftEditingAfterDelete(deletedIdx) {
    var next = {};
    Object.keys(editingEntries).forEach(function (k) {
      var i = parseInt(k, 10);
      if (i < deletedIdx) next[i] = true;
      else if (i > deletedIdx) next[i - 1] = true;
    });
    editingEntries = next;
  }

  // ---------- render ----------
  function render() {
    modal.innerHTML = "";

    var head = el("div", "pl-head");
    var dateEl = el("div", "pl-date");
    dateEl.textContent = formatLong(wk.date);
    var x = el("button", "pl-x");
    x.innerHTML = "&times;"; x.title = "Close";
    x.addEventListener("click", close);
    head.appendChild(dateEl); head.appendChild(x);
    modal.appendChild(head);

    var splitRow = el("div", "pl-splitrow");
    SPLITS.forEach(function (sp) {
      var b = el("button", "split-btn chip-" + sp.toLowerCase() + (wk.split === sp ? " is-on" : ""));
      b.textContent = sp;
      b.addEventListener("click", function () { chooseSplit(sp); });
      splitRow.appendChild(b);
    });
    modal.appendChild(splitRow);

    if (wk.split) {
      var vrow = el("div", "pl-variant");
      var vlabel = el("span", "variant-pill chip-" + wk.split.toLowerCase());
      vlabel.textContent = Cycle.label(wk.split, wk.variant);
      vrow.appendChild(vlabel);
      var hint = el("span", "variant-hint"); hint.textContent = "auto-cycled";
      vrow.appendChild(hint);

      var locWrap = el("label", "pl-loc");
      locWrap.appendChild(document.createTextNode("Location"));
      var loc = el("input", "loc-input");
      loc.type = "text"; loc.placeholder = "e.g. BERC"; loc.value = wk.location || "";
      loc.addEventListener("input", function () { wk.location = loc.value; persist(); });
      locWrap.appendChild(loc);
      vrow.appendChild(locWrap);
      modal.appendChild(vrow);

      var list = el("div", "pl-entries");
      if (!wk.entries.length) {
        var empty = el("div", "pl-empty");
        empty.textContent = "No exercises yet. Add one below.";
        list.appendChild(empty);
      }
      wk.entries.forEach(function (entry, idx) {
        list.appendChild(renderEntry(entry, idx));
      });
      modal.appendChild(list);

      var addBtn = el("button", "btn add-ex");
      addBtn.textContent = "+ Add exercise";
      addBtn.addEventListener("click", function () { showPicker(wk.split); });
      modal.appendChild(addBtn);
    } else {
      var prompt = el("div", "pl-empty");
      prompt.textContent = "Pick a split to start planning this day.";
      modal.appendChild(prompt);
    }

    var foot = el("div", "pl-foot");
    var del = el("button", "btn danger");
    del.textContent = "Delete day";
    del.addEventListener("click", function () {
      if (confirm("Delete this whole day's workout?")) { Store.deleteWorkout(wk.date); close(); }
    });
    var done = el("button", "btn primary");
    done.textContent = "Done";
    done.addEventListener("click", close);
    foot.appendChild(del); foot.appendChild(done);
    modal.appendChild(foot);
  }

  function chooseSplit(sp) {
    if (wk.split === sp) return;
    wk.split = sp;
    wk.variant = Cycle.nextVariant(sp, wk.date);
    editingEntries = {};
    persist(); render();
  }

  // ---------- drag handle SVG ----------
  function dragHandleSVG() {
    var handle = el("span", "drag-handle");
    handle.title = "Drag to reorder";
    handle.innerHTML = '<svg width="10" height="16" viewBox="0 0 10 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><circle cx="2.5" cy="3" r="1.5"/><circle cx="7.5" cy="3" r="1.5"/><circle cx="2.5" cy="8" r="1.5"/><circle cx="7.5" cy="8" r="1.5"/><circle cx="2.5" cy="13" r="1.5"/><circle cx="7.5" cy="13" r="1.5"/></svg>';
    return handle;
  }

  // ---------- drag and drop ----------
  function bindDrag(wrap, idx) {
    wrap.draggable = true;
    wrap.addEventListener("dragstart", function (e) {
      dragSrcIdx = idx;
      e.dataTransfer.effectAllowed = "move";
      setTimeout(function () { wrap.classList.add("dragging"); }, 0);
    });
    wrap.addEventListener("dragend", function () {
      wrap.classList.remove("dragging");
      document.querySelectorAll(".entry").forEach(function (n) { n.classList.remove("drag-over"); });
    });
    wrap.addEventListener("dragover", function (e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      wrap.classList.add("drag-over");
    });
    wrap.addEventListener("dragleave", function () {
      wrap.classList.remove("drag-over");
    });
    wrap.addEventListener("drop", function (e) {
      e.preventDefault();
      wrap.classList.remove("drag-over");
      if (dragSrcIdx === null || dragSrcIdx === idx) return;
      var moved = wk.entries.splice(dragSrcIdx, 1)[0];
      wk.entries.splice(idx, 0, moved);
      editingEntries = {};
      persist(); render();
    });
  }

  // ---------- entry rendering ----------
  function renderEntry(entry, idx) {
    var ex = Store.exerciseById(entry.exerciseId);
    var name = ex ? ex.name : "(removed)";
    return editingEntries[idx]
      ? renderEntryEdit(entry, idx, name)
      : renderEntryView(entry, idx, name);
  }

  function renderEntryView(entry, idx, name) {
    var wrap = el("div", "entry entry-collapsed" + (entry.isStretch ? " entry-stretch" : ""));
    bindDrag(wrap, idx);

    // Top row: handle · name · actions
    var topRow = el("div", "entry-top-row");
    topRow.appendChild(dragHandleSVG());

    var nameEl = el("span", "entry-name"); nameEl.textContent = name;
    topRow.appendChild(nameEl);

    var actions = el("div", "entry-actions");
    var editBtn = el("button", "entry-edit-btn");
    editBtn.innerHTML = "&#9998;"; editBtn.title = "Edit";
    editBtn.addEventListener("click", function () { editingEntries[idx] = true; render(); });
    var rmBtn = el("button", "entry-rm");
    rmBtn.innerHTML = "&times;"; rmBtn.title = "Remove";
    rmBtn.addEventListener("click", function () {
      wk.entries.splice(idx, 1); shiftEditingAfterDelete(idx); persist(); render();
    });
    actions.appendChild(editBtn); actions.appendChild(rmBtn);
    topRow.appendChild(actions);
    wrap.appendChild(topRow);

    // Set badges row (or stretch note)
    if (entry.isStretch) {
      if (entry.note) {
        var noteEl = el("div", "entry-stretch-note"); noteEl.textContent = entry.note;
        wrap.appendChild(noteEl);
      }
    } else if (entry.sets && entry.sets.length) {
      var setsRow = el("div", "entry-sets-row");
      entry.sets.forEach(function (s) {
        var badge = el("span", "entry-set-badge");
        var w = (s.weight !== "" && s.weight !== null && s.weight !== undefined) ? s.weight : "—";
        var r = (s.reps !== "" && s.reps !== null && s.reps !== undefined) ? s.reps : "—";
        badge.textContent = w + " kg × " + r;
        setsRow.appendChild(badge);
      });
      wrap.appendChild(setsRow);
    }

    return wrap;
  }

  function renderEntryEdit(entry, idx, name) {
    var wrap = el("div", "entry entry-expanded" + (entry.isStretch ? " entry-stretch" : ""));
    bindDrag(wrap, idx);

    var top = el("div", "entry-top");

    var leftGroup = el("div", "entry-top-row"); leftGroup.style.gap = "8px"; leftGroup.style.flex = "1";
    leftGroup.appendChild(dragHandleSVG());
    var nameEl = el("div", "entry-name"); nameEl.textContent = name;
    leftGroup.appendChild(nameEl);

    var actions = el("div", "entry-actions");
    var doneBtn = el("button", "entry-done-btn"); doneBtn.textContent = "Done";
    doneBtn.addEventListener("click", function () { delete editingEntries[idx]; render(); });
    var rmBtn = el("button", "entry-rm"); rmBtn.innerHTML = "&times;"; rmBtn.title = "Remove";
    rmBtn.addEventListener("click", function () {
      wk.entries.splice(idx, 1); shiftEditingAfterDelete(idx); persist(); render();
    });
    actions.appendChild(doneBtn); actions.appendChild(rmBtn);

    top.appendChild(leftGroup); top.appendChild(actions);
    wrap.appendChild(top);

    if (entry.isStretch) {
      var note = el("input", "stretch-note");
      note.type = "text"; note.placeholder = "note — e.g. 30 Pushups";
      note.value = entry.note || "";
      note.addEventListener("input", function () { entry.note = note.value; persist(); });
      wrap.appendChild(note);
      return wrap;
    }

    var sets = el("div", "sets");
    (entry.sets || []).forEach(function (set, si) { sets.appendChild(renderSet(entry, set, si)); });
    var addSet = el("button", "add-set-inline"); addSet.textContent = "+"; addSet.title = "Add set";
    addSet.addEventListener("click", function () {
      entry.sets = entry.sets || [];
      var prev = entry.sets[entry.sets.length - 1];
      entry.sets.push(prev ? { weight: prev.weight, reps: prev.reps } : { weight: "", reps: "" });
      persist(); render();
    });
    sets.appendChild(addSet);
    wrap.appendChild(sets);
    return wrap;
  }

  function renderSet(entry, set, si) {
    var chip = el("span", "set-chip");

    var w = el("input", "set-input wi");
    w.type = "number"; w.step = "0.1"; w.min = "0"; w.placeholder = "kg";
    w.inputMode = "decimal"; // numeric keypad (with decimal) on mobile
    w.value = set.weight === 0 || set.weight ? set.weight : "";
    w.addEventListener("input", function () { set.weight = numOrBlank(w.value); persist(); });

    var x = el("span", "set-x"); x.textContent = "×";

    var r = el("input", "set-input ri");
    r.type = "number"; r.step = "1"; r.min = "0"; r.placeholder = "reps";
    r.inputMode = "numeric"; // whole-number keypad on mobile
    r.value = set.reps === 0 || set.reps ? set.reps : "";
    r.addEventListener("input", function () { set.reps = numOrBlank(r.value); persist(); });

    var rm = el("button", "set-rm");
    rm.innerHTML = "&times;"; rm.title = "Remove set";
    rm.addEventListener("click", function () {
      entry.sets.splice(si, 1); persist(); render();
    });

    chip.appendChild(w); chip.appendChild(x); chip.appendChild(r); chip.appendChild(rm);
    return chip;
  }

  function numOrBlank(v) {
    if (v === "" || v === null) return "";
    var n = parseFloat(v); return isNaN(n) ? "" : n;
  }

  // ---------- exercise picker ----------
  function showPicker(split) { pickerOverlay.hidden = false; renderPicker(split, ""); }
  function hidePicker() { pickerOverlay.hidden = true; }

  function renderPicker(split, query) {
    pickerModal.innerHTML = "";
    var head = el("div", "pk-head");
    var h = el("div", "pk-title"); h.textContent = "Add " + split + " exercise";
    var x = el("button", "pl-x"); x.innerHTML = "&times;"; x.addEventListener("click", hidePicker);
    head.appendChild(h); head.appendChild(x);
    pickerModal.appendChild(head);

    var search = el("input", "pk-search");
    search.type = "text"; search.placeholder = "Search or type a new exercise…"; search.value = query;
    search.addEventListener("input", function () { renderListOnly(split, search.value); });
    pickerModal.appendChild(search);

    var listWrap = el("div", "pk-list"); listWrap.id = "pk-list";
    pickerModal.appendChild(listWrap);
    fillList(listWrap, split, query);
    setTimeout(function () { search.focus(); }, 0);
  }

  function renderListOnly(split, query) {
    var listWrap = document.getElementById("pk-list");
    if (listWrap) fillList(listWrap, split, query);
  }

  function fillList(listWrap, split, query) {
    listWrap.innerHTML = "";
    var q = (query || "").trim().toLowerCase();
    var items = Store.exercisesForSplit(split).filter(function (e) {
      return !q || e.name.toLowerCase().indexOf(q) >= 0;
    });
    items.sort(function (a, b) {
      var la = Store.lastSetsForExercise(a.id, wk.date);
      var lb = Store.lastSetsForExercise(b.id, wk.date);
      if (la && lb) return la.date < lb.date ? 1 : -1;
      if (la) return -1; if (lb) return 1;
      return a.name.localeCompare(b.name);
    });

    items.forEach(function (ex) {
      var row = el("button", "pk-item");
      var left = el("div", "pk-item-name");
      left.textContent = ex.name + (ex.isStretch ? "  (stretch)" : "");
      row.appendChild(left);
      var last = ex.isStretch ? null : Store.lastSetsForExercise(ex.id, wk.date);
      if (last) {
        var hint = el("div", "pk-item-hint");
        hint.textContent = "last: " + last.sets.map(function (s) {
          return (s.weight || 0) + "×" + (s.reps || 0);
        }).join(", ");
        row.appendChild(hint);
      }
      row.addEventListener("click", function () { addExerciseEntry(ex); });
      listWrap.appendChild(row);
    });

    var name = (query || "").trim();
    var exists = items.some(function (e) { return e.name.toLowerCase() === name.toLowerCase(); });
    if (name && !exists) {
      var create = el("div", "pk-create");
      var btn = el("button", "pk-item pk-newbtn");
      btn.innerHTML = "<strong>+ Create \"" + escapeHtml(name) + "\"</strong>";
      var asStretch = el("label", "pk-stretch");
      var cb = el("input", ""); cb.type = "checkbox";
      asStretch.appendChild(cb);
      asStretch.appendChild(document.createTextNode(" as stretch/warmup"));
      btn.addEventListener("click", function () {
        var ex = Store.addExercise(name, split, cb.checked);
        addExerciseEntry(ex);
      });
      create.appendChild(btn); create.appendChild(asStretch);
      listWrap.appendChild(create);
    }
  }

  function addExerciseEntry(ex) {
    var entry = { exerciseId: ex.id, isStretch: !!ex.isStretch, sets: [], note: "" };
    if (!ex.isStretch) {
      var last = Store.lastSetsForExercise(ex.id, wk.date);
      entry.sets = last ? JSON.parse(JSON.stringify(last.sets)) : [{ weight: "", reps: "" }];
    }
    wk.entries.push(entry);
    editingEntries[wk.entries.length - 1] = true; // open new entry in edit mode
    persist(); hidePicker(); render();
  }

  function el(tag, cls) {
    var e = document.createElement(tag); if (cls) e.className = cls; return e;
  }
  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  window.Planner = { init: init, open: open };
})();
