/* Cloud sync via Supabase REST. One shared dataset per personal "sync code".
   Use the SAME code on phone + laptop to share data. Exposes a global `Sync`.

   The publishable key below is public-safe (it only grants what RLS allows).
   Privacy comes from your sync code, which lives only in this browser. */
(function () {
  "use strict";

  var URL_BASE = "https://nnbrbqpgnzxpprxnaphg.supabase.co/rest/v1";
  var KEY = "sb_publishable_t-kcKkrbflkud3NdJ21SJw_K9Iv8sFa";
  var TABLE = "gym_data";
  var CODE_KEY = "gymtracker.synccode";

  var code = null;
  var pushTimer = null;
  var applying = false;     // true while writing remote data into Store (don't echo back)
  var onRemote = null;      // re-render callback after remote data is applied

  function headers(extra) {
    var h = { apikey: KEY, Authorization: "Bearer " + KEY, "Content-Type": "application/json" };
    if (extra) for (var k in extra) h[k] = extra[k];
    return h;
  }

  function setStatus(text) {
    var el = document.getElementById("sync-status");
    if (el) el.textContent = text;
  }

  function getCode() {
    code = localStorage.getItem(CODE_KEY);
    if (!code) {
      code = (window.prompt(
        "Enter your sync code.\n\nMake one up (e.g. a password only you know) and use the SAME code on every device to share your data."
      ) || "").trim();
      if (code) localStorage.setItem(CODE_KEY, code);
    }
    return code;
  }

  function pull() {
    if (!code) return;
    setStatus("Syncing…");
    fetch(URL_BASE + "/" + TABLE + "?sync_code=eq." + encodeURIComponent(code) + "&select=data",
      { headers: headers() })
      .then(function (r) { return r.json(); })
      .then(function (rows) {
        if (rows && rows.length && rows[0].data) {
          applying = true;
          try { Store.importJSON(JSON.stringify(rows[0].data)); } catch (e) {}
          applying = false;
          if (onRemote) onRemote();
          setStatus("Synced ✓");
        } else {
          // Cloud is empty for this code — seed it with whatever is on this device.
          push();
        }
      })
      .catch(function () { setStatus("Offline"); });
  }

  function push() {
    if (!code) return;
    setStatus("Saving…");
    var payload = { sync_code: code, data: Store.load(), updated_at: new Date().toISOString() };
    fetch(URL_BASE + "/" + TABLE,
      { method: "POST",
        headers: headers({ Prefer: "resolution=merge-duplicates,return=minimal" }),
        body: JSON.stringify(payload) })
      .then(function (r) { setStatus(r.ok ? "Synced ✓" : "Save error"); })
      .catch(function () { setStatus("Offline"); });
  }

  function schedulePush() {
    if (applying || !code) return;
    clearTimeout(pushTimer);
    pushTimer = setTimeout(push, 1200);  // debounce rapid edits
  }

  // Re-pull whenever the app returns to the foreground. iOS keeps a home-screen
  // PWA suspended in memory, so switching back to it doesn't reload — without
  // this, edits made on another device wouldn't appear until a full relaunch.
  function maybePull() {
    if (!code || document.visibilityState !== "visible") return;
    // Don't yank data out from under an open day-planner edit.
    var pov = document.getElementById("planner-overlay");
    if (pov && !pov.hidden) return;
    pull();
  }

  function start(renderCb) {
    onRemote = renderCb;
    if (!getCode()) { setStatus("Not synced"); return; }
    pull();
    document.addEventListener("visibilitychange", maybePull);
    window.addEventListener("focus", maybePull);
    window.addEventListener("pageshow", maybePull);
  }

  // Called by Store.save() after every local change.
  function onLocalSave() { schedulePush(); }

  // Let the user switch / clear their sync code.
  function changeCode() {
    localStorage.removeItem(CODE_KEY);
    location.reload();
  }

  window.Sync = {
    start: start, pull: pull, push: push,
    onLocalSave: onLocalSave, changeCode: changeCode
  };
})();
