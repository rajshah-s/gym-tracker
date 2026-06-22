/* One-time history seeder. Run in browser console once, then Export the backup.
   Safe to run multiple times — always replaces the full dataset. */
(function () {
  var E = {}, EX = [], EID = 0, WX = [], WID = 0;

  function ex(name, split, isStretch) {
    var k = name + '|' + split;
    if (!E[k]) { E[k] = 'e' + (++EID); EX.push({ id: E[k], name: name, split: split, isStretch: !!isStretch }); }
    return E[k];
  }
  function s(w, r) { return { weight: w, reps: r }; }
  function W(date, split, variant, location, ens) {
    var entries = ens.map(function (e) {
      return { exerciseId: ex(e[0], split, !!e[1]), isStretch: !!e[1], sets: e[2] || [], note: e[3] || '' };
    });
    WX.push({ id: 'w' + (++WID), date: date, split: split, variant: variant, location: location, entries: entries });
  }

  // ---- WEEK 1 ----
  W('2026-05-18', 'LEGS', 1, 'BERC', [
    ['Stretches',           1, [],                              'Only stretching no cardio'],
    ['Barbell Squat',       0, [s(40,10),s(60,8),s(60,6)],     'No weight warmup'],
    ['Calf Machine',        0, [s(32,12),s(32,12),s(32,10)],   ''],
    ['Leg Extensions',      0, [s(66,10),s(66,8),s(14,7)],     'Set 3: SL'],
    ['Hamstring Curls',     0, [s(45,12),s(45,10),s(45,8)],    ''],
    ['Elliptical Cardio',   1, [],                              '8min, 70 kcal burned']
  ]);
  W('2026-05-20', 'PUSH', 1, 'ZUID', [
    ['Incline Smith Press',       0, [s(20,12),s(30,12),s(40,8)],  ''],
    ['Cable Seated Pec Fly',      0, [s(7,12),s(10,10),s(7,10)],   'Max Height Bench'],
    ['Reverse Tricep Pushdown',   0, [s(24,12),s(24,10),s(20,10)], 'Set 2: dropset 20x4'],
    ['SA: Rear Delt Pulls',       0, [s(7,12),s(9,8),s(7,10)],     'Set 2: dropset 7x3'],
    ['SA: Tricep Kickbacks',      0, [s(7,10),s(7,8),s(7,8)],      ''],
    ['SA: Lateral Raises',        0, [s(7,8),s(7,6),s(7,4)],       'Dropsets: 5x4'],
    ['Vertical Chest Press',      0, [s(20,12),s(30,12)],           '']
  ]);
  W('2026-05-21', 'PULL', 1, 'ZUID', [
    ['Assisted Pull Ups',         0, [s(9,10),s(7,10)],             ''],
    ['Barbell Upper Back Rows',   0, [s(20,10),s(20,8),s(30,6)],   ''],
    ['Lat Pullovers',             0, [s(20,10),s(18,12),s(20,10)], ''],
    ['SA: Bench JPG Pulls',       0, [s(18,10),s(18,10),s(16,12)], ''],
    ['Bicep Cable Curls',         0, [s(23,12),s(20,10),s(11,25)], 'Set 3: Dropset'],
    ['Hammer Curls',              0, [s(12,10),s(12,8)],            'Set 3: Dropset 6kg to failure']
  ]);
  W('2026-05-22', 'LEGS', 2, 'ZUID', [
    ['Stretches',                 1, [], ''],
    ['Leg Extensions',            0, [s(52,12),s(52,10),s(45,10)], ''],
    ['Hamstring Curls',           0, [s(47,10),s(45,10),s(27,6)],  'Set 3: SL'],
    ['Hack Squat',                0, [s(20,10),s(30,8),s(30,6)],   ''],
    ['RDLs',                      0, [s(18,12),s(18,12),s(18,10)], ''],
    ['Elliptical Cardio',         1, [],                             '8 min, 60 kcal burned'],
    ['Seated Calf',               0, [s(20,14),s(20,10),s(20,10)], ''],
    ['Stretches',                 1, [], '']
  ]);
  W('2026-05-23', 'PUSH', 2, 'BERC', [
    ['Incline Smith Press',       0, [s(60,12),s(70,6),s(60,8)],   ''],
    ['Pec Deck',                  0, [s(73,12),s(73,10),s(73,10)], ''],
    ['SA: Tricep Pushdown',       0, [s(23,8),s(20,10),s(20,10)],  ''],
    ['SA: Rear Delt Pulls',       0, [s(14,8),s(14,10),s(14,8)],   ''],
    ['Katana Raises',             0, [s(6,10),s(6,10),s(6,10)],    '']
  ]);
  W('2026-05-24', 'PULL', 2, 'BERC + Pre', [
    ['Lat Pulldown Freeweight Mc',  0, [s(70,12),s(100,10),s(100,10)], ''],
    ['Bicep Cable Curls',           0, [s(54,8),s(50,10),s(45,6)],     'Set 3: Dropset 23kg x30'],
    ['SA: JPG Knee Lat Pulls',      0, [s(36,10),s(36,8)],             ''],
    ['Seated Horizontal Row',       0, [s(59,6),s(52,8),s(45,7)],      ''],
    ['Seated Hammer Curl',          0, [s(14,10),s(14,8),s(14,10)],    '']
  ]);

  // ---- WEEK 2 ----
  W('2026-05-26', 'PUSH', 1, 'ZUID + Pre', [
    ['Incline Dumbbell Press',      0, [s(20,12),s(22,12),s(26,8)],    ''],
    ['Cable Seated Pec Fly',        0, [s(11.8,12),s(9.1,10)],         ''],
    ['Cable Incline Fly',           0, [s(9.1,6),s(6.8,12)],           ''],
    ['Dual SA: Tricep Pulls',       0, [s(6.8,10),s(9.1,8),s(6.8,8)], 'Slippery hands'],
    ['Dual SA: Lateral Raises',     0, [s(6.8,5),s(4.5,8),s(4.5,8)],  ''],
    ['SA: Overhead Tricep Pull',    0, [s(9.1,8),s(6.8,10)],           ''],
    ['SA: Rear Delt Pulls',         0, [s(5.2,12),s(6.8,10)],          '']
  ]);
  W('2026-05-27', 'LEGS', 1, 'ZUID', [
    ['Stretches',                   1, [], ''],
    ['Leg Extensions',              0, [s(66,6),s(59,8),s(25,10)],     'Set 3: SL Dropset'],
    ['Hamstring Curls',             0, [s(48,12),s(52,8),s(45,8)],     ''],
    ['Hip Adductors',               0, [s(39,10),s(45,6),s(39,8)],     'Most soreness'],
    ['Calf Raises',                 0, [s(20,10),s(30,5),s(30,4)],     ''],
    ['SL: Bulgarian Split Squats',  0, [s(10,8),s(10,10),s(10,9)],     ''],
    ['Hack Squat',                  0, [s(10,12),s(15,8)],              '']
  ]);
  W('2026-05-29', 'PULL', 1, 'BERC + Pre', [
    ['Front Lat Pulldown Machine',  0, [s(52,12),s(59,9),s(59,8)],     'Went real heavy'],
    ['Rear Delt Fly Machine',       0, [s(52,9),s(45,8),s(45,7)],      ''],
    ['SA: Horiz Row Freeweight Mc', 0, [s(20,12),s(30,8)],             'Set 2: R30x8 L30x4'],
    ['Bicep Cable Curls',           0, [s(54,7),s(50,8),s(45,8)],      'Left forearms fatigued'],
    ['SA: Bicep Cable Curl',        0, [s(18,8),s(18,8)],              ''],
    ['Barbell Upper Back Rows',     0, [s(40,12),s(50,6),s(20,10)],    ''],
    ['Pull Ups',                    0, [s(0,7),s(0,3)],                 'Set 1: Wide grip']
  ]);
  W('2026-05-30', 'PUSH', 2, 'BERC', [
    ['Pec Deck',                    0, [s(73,10),s(79,9),s(79,6)],     ''],
    ['Cable Incline Fly',           0, [s(7.9,8),s(7.9,8),s(5.7,12)], ''],
    ['Katana Extensions',           0, [s(7.9,6),s(5.7,12),s(5.7,7)], ''],
    ['SA: Tricep Pushdown',         0, [s(20,6),s(18,9),s(18,7)],      ''],
    ['Lateral Raises',              0, [s(8,12),s(8,12),s(8,6)],       ''],
    ['Shoulder Press Freeweight Mc',0, [s(20,12),s(30,8),s(30,12)],    'Each side']
  ]);

  // ---- WEEK 3 ----
  W('2026-06-01', 'LEGS', 2, 'BERC + Pre', [
    ['Stretches',                   1, [], ''],
    ['Hack Squat',                  0, [s(30,10),s(30,8),s(20,10)],    ''],
    ['Leg Extensions',              0, [s(66,8),s(59,10),s(52,8)],     ''],
    ['Hamstring Curls',             0, [s(45,8),s(41,8),s(23,6)],      'Set 3: Dropset SL'],
    ['RDLs',                        0, [s(20,10),s(20,8),s(20,7)],     ''],
    ['Calf Machine',                0, [s(72,12),s(72,10)],             ''],
    ['Stretches',                   1, [], '']
  ]);
  W('2026-06-02', 'PULL', 2, 'BERC', [
    ['Upper Back Cable Rows',       0, [s(52,11),s(59,7),s(59,6)],     ''],
    ['Rear Delt Fly Machine',       0, [s(52,8),s(45,8),s(45,9)],      ''],
    ['Preacher Curls',              0, [s(10,12),s(15,8),s(15,8)],     ''],
    ['Lat Pullovers',               0, [s(41,12),s(41,8),s(41,8)],     ''],
    ['Cable Hammer Curls',          0, [s(36,10),s(41,8),s(41,6)],     ''],
    ['Pull Ups',                    0, [s(0,5),s(0,4)],                 '']
  ]);
  W('2026-06-03', 'PUSH', 1, 'BERC + Pre', [
    ['Incline Smith Press',         0, [s(20,12),s(30,6),s(25,7)],     ''],
    ['Chest Press Arc Machine',     0, [s(59,8),s(52,8),s(52,8)],      ''],
    ['SA: Tricep Pulls',            0, [s(14,8),s(11.3,9),s(11.3,8)],  ''],
    ['Rope Overhead Tricep Pulls',  0, [s(18,10),s(27,5),s(18,8)],     'Also 18kg x7'],
    ['Standing Mid Chest Cable Flys',0,[s(7.9,12),s(12,5),s(10,8)],   ''],
    ['Dual SA: Lateral Raises',     0, [s(5.7,12),s(7.9,4),s(5.7,6)], '']
  ]);
  W('2026-06-05', 'LEGS', 1, 'BERC + Pre', [
    ['Stretches',                   1, [], ''],
    ['Hack Squat',                  0, [s(30,12),s(40,7),s(30,8)],     'Each side weight'],
    ['Leg Press',                   0, [s(40,12),s(50,8),s(50,4)],     ''],
    ['Hamstring Curls',             0, [s(45,10),s(36,12),s(36,10)],   ''],
    ['Leg Extensions',              0, [s(59,12),s(59,10),s(25,8)],    'Set 3: SL Dropset'],
    ['Calf Machine',                0, [s(72,10),s(66,12)],             ''],
    ['Push Pull Weights',           1, [],                               '40kg 1m, 20kg 1m'],
    ['Stretches',                   1, [], '']
  ]);
  W('2026-06-07', 'PULL', 1, 'BERC', [
    ['Assisted Pull Ups',           0, [s(9,10),s(6.9,8),s(6.9,8)],   ''],
    ['Lat Pulldown',                0, [s(66,6),s(59,7),s(55,8)],      ''],
    ['SA: Horiz Row Freeweight Mc', 0, [s(20,12),s(30,10),s(20,8)],    'Set 2: R30x10 L30x8'],
    ['Hammer Curls',                0, [s(14,14),s(14,12),s(16,6)],    ''],
    ['Lat Pulldown Freeweight Mc',  0, [s(40,8),s(40,8)],              ''],
    ['Cable Curls',                 0, [s(50,5),s(41,6)],               'Left wrist pain'],
    ['Back Extensions',             0, [s(10,12),s(10,8),s(10,8)],     '']
  ]);

  // ---- WEEK 4 ----
  W('2026-06-09', 'PUSH', 2, 'BERC + Pre', [
    ['Incline Smith Press',         0, [s(25,8),s(25,9),s(22.5,8)],    ''],
    ['SA: Tricep Pushdown',         0, [s(23,6),s(18,8),s(18,7)],      ''],
    ['SA: Rear Delt Pulls',         0, [s(14,12),s(16.3,7),s(14,8)],   ''],
    ['Shoulder Press Machine',      0, [s(50,8),s(50,7),s(45,7)],      'Also 27kg x10'],
    ['Pec Deck',                    0, [s(73,8),s(66,10),s(66,8)],     ''],
    ['Rope Overhead Tricep Pulls',  0, [s(23,10),s(23,10),s(23,8)],    ''],
    ['SA: H-L Tricep Kickbacks',    0, [s(9,8),s(9,9)],                '']
  ]);
  W('2026-06-10', 'PULL', 2, 'BERC', [
    ['Pull Ups',                    0, [s(0,8),s(0,8),s(0,7)],         ''],
    ['SA: Horiz Row Freeweight Mc', 0, [s(20,12),s(25,10),s(25,9)],    ''],
    ['Cable Curls',                 0, [s(50,12),s(54,8),s(27,27)],    ''],
    ['Seated Row: Old',             0, [s(45,10),s(45,7),s(41,8)],     ''],
    ['Back Extensions',             0, [s(10,10),s(10,10),s(10,10)],   '']
  ]);
  W('2026-06-11', 'LEGS', 2, 'ZUID', [
    ['Stretches',                   1, [], ''],
    ['Hack Squat',                  0, [s(30,10),s(25,10),s(25,8)],    ''],
    ['Hip Adductors',               0, [s(45,6),s(39,12),s(39,10)],    ''],
    ['Hamstring Curls',             0, [s(55,6),s(45,12),s(25,6)],     'Set 3: SL; also SL 18kg x8'],
    ['SL: Bulgarian Split Squats',  0, [s(10,8),s(10,9),s(10,6)],      ''],
    ['Glute Extensions',            0, [s(10,10),s(10,10),s(10,10)],   '']
  ]);
  W('2026-06-13', 'PULL', 1, 'BERC', [
    ['Pull Ups',                    0, [s(0,10),s(0,9),s(0,8)],        'Set 2: bicep'],
    ['Lat Pulldown Freeweight Mc',  0, [s(40,12),s(45,9),s(45,8)],     ''],
    ['Seated Row: Old',             0, [s(50,8),s(45,8),s(41,8)],      ''],
    ['SA: Bicep Cable Curl',        0, [s(23,7),s(20,10),s(20,8)],     'Set 2: R20x10 L8'],
    ['Lat Pullovers',               0, [s(41,11),s(41,8),s(45,7)],     ''],
    ['Hammer Curls',                0, [s(16,10),s(16,8),s(16,7)],     ''],
    ['Barbell Upper Back Rows',     0, [s(20,10),s(20,8),s(20,8)],     '']
  ]);
  W('2026-06-14', 'PUSH', 1, 'BERC', [
    ['Low-High Pec Fly',            0, [s(10.2,12),s(12.5,7),s(10.2,8)],'Also 10.2kg x7'],
    ['Pec Deck',                    0, [s(79,9),s(79,6),s(73,5)],      ''],
    ['Tricep Pushdown',             0, [s(54,12),s(59,8),s(56,8)],     ''],
    ['Rope Overhead Tricep Pulls',  0, [s(27,10),s(27,7),s(23,10)],    ''],
    ['Shoulder Press Machine',      0, [s(54,8),s(50,6),s(50,10)],     ''],
    ['SA: H-L Tricep Kickbacks',    0, [s(11,8),s(9,12),s(9,8)],       ''],
    ['Seated Lateral Raises',       0, [s(10,8),s(10,6),s(10,8)],      ''],
    ['Stretches',                   1, [],                               '30 Pushups']
  ]);

  // ---- WEEK 5 ----
  W('2026-06-15', 'LEGS', 1, 'BERC', [
    ['Stretches',                   1, [], ''],
    ['Calf Machine',                0, [s(72,10),s(72,10),s(72,9)],    ''],
    ['SL: Leg Press Machine',       0, [s(63,10),s(63,11),s(63,12)],   ''],
    ['Hack Squat',                  0, [s(20,10),s(20,10)],             ''],
    ['Glute Extensions',            0, [s(10,12),s(10,10),s(10,8)],    'Heavy soreness glutes and lower back'],
    ['Stretches',                   1, [], '']
  ]);
  W('2026-06-16', 'PUSH', 2, 'BERC', [
    ['Chest Press Arc Machine',     0, [s(45,10),s(45,12),s(45,10)],   ''],
    ['Upper Chest & Front Delt Mc', 0, [s(25,10),s(25,9),s(25,10)],    ''],
    ['Skullcrushers',               0, [s(20,10),s(20,10),s(20,8)],    ''],
    ['Seated Lateral Raises',       0, [s(10,10),s(10,7)],              ''],
    ['SA: Tricep Pushdown',         0, [s(20,10),s(20,10)],             ''],
    ['SA: Cable Lateral Raises',    0, [s(11,8),s(11,8)],               ''],
    ['SA: Rear Delt Pulls',         0, [s(14,10),s(14,7)],              '']
  ]);
  W('2026-06-17', 'PULL', 2, 'ZUID + Pre', [
    ['Barbell Upper Back Rows',     0, [s(60,6),s(50,8),s(50,8)],      ''],
    ['Lat Pulldown',                0, [s(66,7),s(52,12)],              ''],
    ['SA: Lat Pulldown',            0, [s(18,8),s(18,7)],               ''],
    ['Bicep Curl Machine',          0, [s(36,12),s(45,7)],              ''],
    ['Lat Pullovers',               0, [s(27.3,10),s(25,8)],            ''],
    ['SA: Rear Delt Pulls',         0, [s(12,12),s(12,12)],             ''],
    ['Trap Pulls',                  0, [s(107,8),s(100,10)],            ''],
    ['Cable Hammer Curls',          0, [s(27,12),s(27,6)],              '']
  ]);
  W('2026-06-19', 'LEGS', 2, 'BERC', [
    ['Stretches',                   1, [], ''],
    ['SL: Leg Press Machine',       0, [s(36,12),s(72,12),s(77,8)],    ''],
    ['Calf Machine',                0, [s(72,10),s(72,12),s(81,10)],   ''],
    ['Leg Extensions',              0, [s(66,10),s(66,7),s(18,8)],     'Set 3: SL'],
    ['Hip Adductors',               0, [s(41,13),s(42,13),s(43,13)],   ''],
    ['Hack Squat',                  0, [s(10,12),s(10,10)],             ''],
    ['Stretches',                   1, [], '']
  ]);
  W('2026-06-20', 'PUSH', 1, 'BERC', [
    ['High-Low Cable Fly',          0, [s(10.2,10),s(10.2,10),s(10.2,9)],''],
    ['Shoulder Press Machine',      0, [s(45,12),s(50,7)],              ''],
    ['Chest Press Machine',         0, [s(54,10),s(54,10),s(54,8)],    ''],
    ['SA: Tricep Pushdown',         0, [s(23,6),s(18,8),s(18,8)],      ''],
    ['SA: Cable Lateral Raises',    0, [s(14,6),s(11,9),s(11,8)],      ''],
    ['Bar Overhead Tricep Pulls',   0, [s(32,9),s(32,8)],               '']
  ]);
  W('2026-06-21', 'PULL', 1, 'BERC + Pre', [
    ['Pull Ups',                    0, [s(0,8),s(0,7)],                 ''],
    ['D-Handle Rows',               0, [s(52,11),s(55,6),s(55,6)],     ''],
    ['SA: Bicep Cable Curl',        0, [s(23,8),s(23,7)],               ''],
    ['Lat Pulldown',                0, [s(59,8),s(52,9),s(52,6)],      ''],
    ['Hammer Curls',                0, [s(16,8),s(16,9)],               ''],
    ['SA: Rear Delt Pulls',         0, [s(18,8),s(18,7)],               ''],
    ['Stretches',                   1, [],                               '50 Push ups & 30 Situps + 2x1m Plank']
  ]);

  // ---- Extra catalog entries (exercises known but not yet logged) ----
  var extras = [
    ['Leg Press Machine','LEGS'],['Hip Adductor','LEGS'],
    ['Barbell Squat','LEGS'],['RDLs','LEGS'],['Seated Calf','LEGS'],
    ['Calf Raises','LEGS'],['SL: Bulgarian Split Squats','LEGS'],
    ['Pec Deck','PUSH'],['Skullcrushers','PUSH'],
    ['Incline Smith Press','PUSH'],['Incline Dumbbell Press','PUSH'],
    ['Cable Incline Fly','PUSH'],['Cable Seated Pec Fly','PUSH'],
    ['Lateral Raises','PUSH'],['Dual SA: Lateral Raises','PUSH'],
    ['SA: Overhead Tricep Pull','PUSH'],['Rope Overhead Tricep Pulls','PUSH'],
    ['Bar Overhead Tricep Pulls','PUSH'],['SA: Tricep Pulls','PUSH'],
    ['Dual SA: Tricep Pulls','PUSH'],['Katana Raises','PUSH'],
    ['Katana Extensions','PUSH'],['Reverse Tricep Pushdown','PUSH'],
    ['Preacher Curls','PULL'],['Rear Delt Fly Machine','PULL'],
    ['Front Lat Pulldown Machine','PULL'],['Assisted Pull Ups','PULL'],
    ['Seated Horizontal Row','PULL'],['Seated Hammer Curl','PULL'],
    ['Cable Curls','PULL'],['Seated Row: Old','PULL'],
    ['Back Extensions','PULL'],['Upper Back Cable Rows','PULL'],
    ['D-Handle Rows','PULL'],['SA: Bench JPG Pulls','PULL'],
    ['SA: JPG Knee Lat Pulls','PULL'],['SA: Horiz Row Freeweight Mc','PULL']
  ];
  extras.forEach(function (e) { ex(e[0], e[1], false); });
  // Stretches per split
  ['PUSH','PULL','LEGS'].forEach(function(sp){ ex('Stretches',sp,true); });

  localStorage.setItem('gymtracker.v1', JSON.stringify({ version: 1, exercises: EX, workouts: WX }));
  console.log('Seeded: ' + EX.length + ' exercises, ' + WX.length + ' workouts. Reloading…');
  setTimeout(function(){ location.reload(); }, 300);
})();
