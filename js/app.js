/* App wiring: view switching, planner launch, export/import.
   Loaded last; all other globals are ready. */
(function () {
  "use strict";

  var views = {
    calendar: document.getElementById("view-calendar"),
    progress: document.getElementById("view-progress")
  };

  function init() {
    Store.load();
    Planner.init();
    CalendarView.init(views.calendar, openDay);
    Charts.init(views.progress);
    CalendarView.render();
    Charts.render();

    document.getElementById("btn-export").addEventListener("click", doExport);
    document.getElementById("btn-import").addEventListener("click", function () {
      document.getElementById("import-file").click();
    });
    document.getElementById("import-file").addEventListener("change", doImport);

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        document.getElementById("picker-overlay").hidden = true;
        document.getElementById("planner-overlay").hidden = true;
        CalendarView.render();
        Charts.render();
      }
    });
  }

  function openDay(dateKey) {
    Planner.open(dateKey, function () { CalendarView.render(); Charts.render(); });
  }

  function doExport() {
    var blob = new Blob([Store.exportJSON()], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "gym-tracker-backup-" + Store.dateKey(new Date()) + ".json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function doImport(e) {
    var file = e.target.files && e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      if (!confirm("Importing will replace ALL current data with the backup. Continue?")) {
        e.target.value = "";
        return;
      }
      try {
        Store.importJSON(reader.result);
        CalendarView.render();
        Charts.render();
        alert("Backup imported successfully.");
      } catch (err) {
        alert("Import failed: " + err.message);
      }
      e.target.value = "";
    };
    reader.readAsText(file);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
