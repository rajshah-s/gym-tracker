/* Split variant auto-cycling: LEGS1<->LEGS2, PUSH1<->PUSH2, PULL1<->PULL2.
   Exposes a global `Cycle`. */
(function () {
  "use strict";

  // The variant to use for `split` on `date`, based on the most recent prior
  // workout of that split. Defaults to 1 when there is no history.
  function nextVariant(split, date) {
    var last = Store.lastWorkoutOfSplit(split, date);
    if (!last) return 1;
    return last.variant === 1 ? 2 : 1;
  }

  // e.g. ("LEGS", 1) -> "LEGS1"
  function label(split, variant) { return split + (variant || 1); }

  window.Cycle = { nextVariant: nextVariant, label: label };
})();
