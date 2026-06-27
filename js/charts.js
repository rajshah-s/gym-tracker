/* Progress view: per-exercise SVG line chart. Exposes a global `Charts`. */
(function () {
  "use strict";

  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var SPLITS = ["PUSH", "PULL", "LEGS"];
  var state = { container: null, split: "PUSH", exerciseId: null, metric: "weight" };

  function init(container) { state.container = container; }

  function render() {
    var c = state.container;
    if (!c) return;
    c.innerHTML = "";

    var allWithHist = Store.exercisesWithHistory();
    var head = el("div", "pr-head");
    var title = el("h2", "pr-title");
    title.textContent = "Progress";
    head.appendChild(title);
    c.appendChild(head);

    if (!allWithHist.length) {
      var empty = el("div", "pr-empty");
      empty.textContent = "No logged sets yet. Plan a day and record some weights to see progress here.";
      c.appendChild(empty);
      return;
    }

    // Split filter tabs
    var splitTabs = el("div", "pr-split-tabs");
    SPLITS.forEach(function (sp) {
      var btn = el("button", "pr-split-tab chip-" + sp.toLowerCase() + (state.split === sp ? " is-on" : ""));
      btn.textContent = sp;
      btn.addEventListener("click", function () {
        state.split = sp;
        state.exerciseId = null; // reset selection when switching split
        render();
      });
      splitTabs.appendChild(btn);
    });
    c.appendChild(splitTabs);

    // Filter exercises to selected split
    var withHist = allWithHist.filter(function (e) { return e.split === state.split; });

    if (!withHist.length) {
      var noEx = el("div", "pr-empty");
      noEx.textContent = "No " + state.split + " exercises logged yet.";
      c.appendChild(noEx);
      return;
    }

    // keep selection valid within the current split
    if (!state.exerciseId || !withHist.some(function (e) { return e.id === state.exerciseId; })) {
      state.exerciseId = withHist[0].id;
    }

    var controls = el("div", "pr-controls");
    controls.appendChild(searchableSelect(withHist, state.exerciseId, function (id) {
      state.exerciseId = id; render();
    }));

    var toggle = el("div", "pr-toggle");
    [["weight", "Top set (kg)"], ["volume", "Volume (kg·reps)"]].forEach(function (t) {
      var b = el("button", "pr-tg" + (state.metric === t[0] ? " is-on" : ""));
      b.textContent = t[1];
      b.addEventListener("click", function () { state.metric = t[0]; render(); });
      toggle.appendChild(b);
    });
    controls.appendChild(toggle);
    c.appendChild(controls);

    var hist = Store.historyForExercise(state.exerciseId);
    var points = hist.map(function (h) {
      var val, detail;
      if (state.metric === "weight") {
        // top set = heaviest weight logged that session; show its reps
        var top = h.sets.slice().sort(function (a, b) { return num(b.weight) - num(a.weight); })[0];
        val = num(top.weight);
        detail = num(top.weight) + " kg × " + num(top.reps) + " reps";
      } else {
        val = h.sets.reduce(function (a, s) { return a + num(s.weight) * num(s.reps); }, 0);
        detail = h.sets.map(function (s) { return num(s.weight) + "×" + num(s.reps); }).join("  ·  ");
      }
      return { date: h.date, val: val, detail: detail };
    });

    c.appendChild(drawChart(points));

    // recent table
    c.appendChild(recentTable(hist.slice(-8).reverse()));
  }

  function drawChart(points) {
    var W = 720, H = 320, padL = 48, padR = 18, padT = 18, padB = 36;

    // Wrapper holds the SVG + an HTML tooltip so we can style the hover label.
    var wrap = el("div", "pr-chart-wrap");
    var tip = el("div", "pr-tooltip");
    tip.hidden = true;

    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    svg.setAttribute("class", "pr-chart");
    wrap.appendChild(svg);
    wrap.appendChild(tip);

    if (points.length === 0) return wrap;

    var vals = points.map(function (p) { return p.val; });
    var maxV = Math.max.apply(null, vals);
    var minV = Math.min.apply(null, vals);
    if (maxV === minV) { maxV = maxV + 1; minV = Math.max(0, minV - 1); }
    var range = maxV - minV;

    var n = points.length;
    function px(i) { return n === 1 ? (padL + (W - padL - padR) / 2) : padL + (W - padL - padR) * (i / (n - 1)); }
    function py(v) { return padT + (H - padT - padB) * (1 - (v - minV) / range); }

    // gridlines + y labels
    var ticks = 4;
    for (var t = 0; t <= ticks; t++) {
      var v = minV + range * (t / ticks);
      var y = py(v);
      var line = svgEl("line", { x1: padL, y1: y, x2: W - padR, y2: y, class: "grid" });
      svg.appendChild(line);
      var lbl = svgEl("text", { x: padL - 8, y: y + 4, class: "axis-y" });
      lbl.textContent = round1(v);
      svg.appendChild(lbl);
    }

    // path
    var d = "";
    points.forEach(function (p, i) { d += (i === 0 ? "M" : "L") + px(i) + " " + py(p.val) + " "; });
    var path = svgEl("path", { d: d.trim(), class: "pr-line" });
    svg.appendChild(path);

    // points + x labels (thin out labels if many)
    var labelEvery = Math.ceil(n / 8);
    points.forEach(function (p, i) {
      var cx = px(i), cy = py(p.val);
      // larger transparent hit target for easy hovering, plus the visible dot
      var hit = svgEl("circle", { cx: cx, cy: cy, r: 12, class: "pr-dot-hit" });
      var dot = svgEl("circle", { cx: cx, cy: cy, r: 3.5, class: "pr-dot" });
      svg.appendChild(hit);
      svg.appendChild(dot);

      function showTip() {
        dot.classList.add("is-hover");
        tip.innerHTML = '<span class="pr-tip-date">' + fmtDate(p.date) + '</span>' +
                        '<span class="pr-tip-detail">' + p.detail + '</span>';
        tip.hidden = false;
        // position above the dot, in % of the viewBox so it tracks responsive scaling
        tip.style.left = (cx / W * 100) + "%";
        tip.style.top = (cy / H * 100) + "%";
      }
      function hideTip() { dot.classList.remove("is-hover"); tip.hidden = true; }
      hit.addEventListener("mouseenter", showTip);
      hit.addEventListener("mouseleave", hideTip);

      if (i % labelEvery === 0 || i === n - 1) {
        var xl = svgEl("text", { x: cx, y: H - 12, class: "axis-x" });
        xl.textContent = fmtDate(p.date);
        svg.appendChild(xl);
      }
    });

    return wrap;
  }

  // Searchable dropdown: a button that opens a filterable list. Manages its own
  // open/filter state locally; only calls onChange (which re-renders) on select.
  function searchableSelect(items, currentId, onChange) {
    var current = items.filter(function (i) { return i.id === currentId; })[0];
    var wrap = el("div", "pr-combo");

    var btn = el("button", "pr-combo-btn"); btn.type = "button";
    var label = el("span", "pr-combo-label");
    label.textContent = current ? current.name : "Select exercise…";
    var caret = el("span", "pr-combo-caret"); caret.textContent = "▾";
    btn.appendChild(label); btn.appendChild(caret);

    var panel = el("div", "pr-combo-panel"); panel.hidden = true;
    var search = el("input", "pr-combo-search");
    search.type = "text"; search.placeholder = "Search exercise…";
    var list = el("div", "pr-combo-list");
    panel.appendChild(search); panel.appendChild(list);

    wrap.appendChild(btn); wrap.appendChild(panel);

    function renderList() {
      var q = search.value.trim().toLowerCase();
      list.innerHTML = "";
      var matches = items.filter(function (i) { return i.name.toLowerCase().indexOf(q) !== -1; });
      if (!matches.length) {
        var none = el("div", "pr-combo-empty"); none.textContent = "No matches";
        list.appendChild(none); return;
      }
      matches.forEach(function (i) {
        var item = el("button", "pr-combo-item" + (i.id === currentId ? " is-sel" : ""));
        item.type = "button"; item.textContent = i.name;
        item.addEventListener("click", function () { close(); onChange(i.id); });
        list.appendChild(item);
      });
    }

    function onDocClick(e) { if (!wrap.contains(e.target)) close(); }
    function open() {
      panel.hidden = false; wrap.classList.add("is-open");
      search.value = ""; renderList(); search.focus();
      document.addEventListener("mousedown", onDocClick);
    }
    function close() {
      panel.hidden = true; wrap.classList.remove("is-open");
      document.removeEventListener("mousedown", onDocClick);
    }

    btn.addEventListener("click", function () { panel.hidden ? open() : close(); });
    search.addEventListener("input", renderList);
    search.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { e.stopPropagation(); close(); btn.focus(); }
      else if (e.key === "Enter") {
        e.preventDefault();
        var first = list.querySelector(".pr-combo-item");
        if (first) first.click();
      }
    });

    return wrap;
  }

  function recentTable(rows) {
    var wrap = el("div", "pr-recent");
    var h = el("div", "pr-recent-h");
    h.textContent = "Recent sessions";
    wrap.appendChild(h);
    rows.forEach(function (r) {
      var line = el("div", "pr-recent-row");
      var d = el("span", "pr-recent-date"); d.textContent = fmtDate(r.date);
      var s = el("span", "pr-recent-sets");
      s.textContent = r.sets.map(function (x) { return num(x.weight) + "×" + num(x.reps); }).join("   ");
      line.appendChild(d); line.appendChild(s);
      wrap.appendChild(line);
    });
    return wrap;
  }

  function fmtDate(key) {
    var p = key.split("-");
    return (+p[2]) + " " + MONTHS[+p[1] - 1];
  }
  function num(v) { var n = parseFloat(v); return isNaN(n) ? 0 : n; }
  function round1(v) { return Math.round(v * 10) / 10; }

  function el(tag, cls) { var e = document.createElement(tag); if (cls) e.className = cls; return e; }
  function svgEl(tag, attrs) {
    var e = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (var k in attrs) if (attrs.hasOwnProperty(k)) e.setAttribute(k, attrs[k]);
    return e;
  }

  window.Charts = { init: init, render: render };
})();
