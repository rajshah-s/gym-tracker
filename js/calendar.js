/* Monthly calendar grid (Apple-Calendar style, week starts Monday).
   Exposes a global `CalendarView`. */
(function () {
  "use strict";

  var MONTHS = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  var WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  var state = { y: 0, m: 0, onDayClick: null, container: null };

  function init(container, onDayClick) {
    var now = new Date();
    state.y = now.getFullYear();
    state.m = now.getMonth();
    state.onDayClick = onDayClick;
    state.container = container;
    render();
  }

  function go(delta) {
    state.m += delta;
    while (state.m < 0) { state.m += 12; state.y -= 1; }
    while (state.m > 11) { state.m -= 12; state.y += 1; }
    render();
  }
  function today() {
    var now = new Date();
    state.y = now.getFullYear();
    state.m = now.getMonth();
    render();
  }

  // Monday-based weekday index (0=Mon .. 6=Sun)
  function mondayIndex(jsDay) { return (jsDay + 6) % 7; }

  function render() {
    var c = state.container;
    if (!c) return;
    c.innerHTML = "";

    var todayKey = Store.dateKey(new Date());

    var head = el("div", "cal-head");
    var title = el("div", "cal-title");
    title.textContent = MONTHS[state.m] + " " + state.y;
    var nav = el("div", "cal-nav");
    nav.appendChild(navBtn("‹", function () { go(-1); }));
    nav.appendChild(navBtn("Today", today, "today-btn"));
    nav.appendChild(navBtn("›", function () { go(1); }));
    head.appendChild(title);
    head.appendChild(nav);
    c.appendChild(head);

    var grid = el("div", "cal-grid");
    WEEKDAYS.forEach(function (w) {
      var wd = el("div", "cal-weekday");
      wd.textContent = w;
      grid.appendChild(wd);
    });

    var first = new Date(state.y, state.m, 1);
    var startOffset = mondayIndex(first.getDay());
    var daysInMonth = new Date(state.y, state.m + 1, 0).getDate();
    var totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;

    for (var i = 0; i < totalCells; i++) {
      var dayNum = i - startOffset + 1;
      var cell = el("div", "cal-cell");
      if (dayNum < 1 || dayNum > daysInMonth) {
        cell.className += " is-empty";
        grid.appendChild(cell);
        continue;
      }
      var d = new Date(state.y, state.m, dayNum);
      var key = Store.dateKey(d);

      var num = el("div", "cal-daynum");
      num.textContent = dayNum;
      if (key === todayKey) num.className += " is-today";
      cell.appendChild(num);

      var w = Store.getWorkout(key);
      if (w) {
        var chip = el("div", "chip chip-" + w.split.toLowerCase());
        chip.textContent = Cycle.label(w.split, w.variant);
        cell.appendChild(chip);
        var count = (w.entries || []).filter(function (e) { return !e.isStretch; }).length;
        if (count) {
          var meta = el("div", "cal-meta");
          meta.textContent = count + (count === 1 ? " exercise" : " exercises");
          cell.appendChild(meta);
        }
      }

      (function (k) {
        cell.addEventListener("click", function () {
          if (state.onDayClick) state.onDayClick(k);
        });
      })(key);

      grid.appendChild(cell);
    }

    c.appendChild(grid);

    var legend = el("div", "cal-legend");
    [["PUSH", "push"], ["PULL", "pull"], ["LEGS", "legs"]].forEach(function (p) {
      var item = el("span", "legend-item");
      var sw = el("span", "legend-swatch chip-" + p[1]);
      var lbl = el("span", "");
      lbl.textContent = p[0];
      item.appendChild(sw); item.appendChild(lbl);
      legend.appendChild(item);
    });
    c.appendChild(legend);
  }

  function navBtn(text, fn, cls) {
    var b = el("button", "cal-navbtn" + (cls ? " " + cls : ""));
    b.textContent = text;
    b.addEventListener("click", fn);
    return b;
  }
  function el(tag, cls) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    return e;
  }

  window.CalendarView = { init: init, render: render };
})();
