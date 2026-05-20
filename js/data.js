// FORGE — PH-PPL Program Data Configuration
// ============================================
// This file contains ALL exercise definitions, warm-ups, tips, and video links.
// To add, remove, or modify exercises: edit this file only. No other code changes needed.
// To add a new exercise: copy an existing exercise block and modify the fields.
// To remove an exercise: delete its block from the exercises array.

const FORGE_DATA = {
  version: "1.0.0",
  programName: "PH-PPL",
  cycleDays: [
    { id: "push-a", name: "Push A", type: "power", label: "Power", color: "amber" },
    { id: "pull-a", name: "Pull A", type: "power", label: "Power", color: "amber" },
    { id: "legs-a", name: "Legs A", type: "power", label: "Power", color: "amber" },
    { id: "rest-1", name: "Rest", type: "rest", label: "Recovery", color: "gray" },
    { id: "push-b", name: "Push B", type: "hypertrophy", label: "Hypertrophy", color: "cyan" },
    { id: "pull-b", name: "Pull B", type: "hypertrophy", label: "Hypertrophy", color: "cyan" },
    { id: "legs-b", name: "Legs B", type: "hypertrophy", label: "Hypertrophy", color: "cyan" },
    { id: "rest-2", name: "Rest", type: "rest", label: "Recovery", color: "gray" }
  ],

  // RPE descriptions for reference tooltips
  rpeGuide: {
    7: "Could do 3 more reps",
    8: "Could do 2 more reps",
    9: "Could do 1 more rep",
    10: "Nothing left"
  },

  // Progression rules displayed in settings/info
  progressionRules: {
    power: "When you complete all prescribed sets and reps at RPE 7-8, add the smallest weight increment available next session.",
    hypertrophy: "Work the rep range from bottom to top. When you hit the top of the range across all sets, add weight and reset to the bottom of the range."
  },

  workouts: {
    // =========================================================
    // PUSH A — POWER
    // =========================================================
    "push-a": {
      id: "push-a",
      name: "Push A",
      type: "power",
      label: "Power",
      goal: "Strength — heavy compounds, low reps, long rest",
      estimatedMinutes: 55,
      warmup: {
        name: "Dynamic Warm-Up",
        duration: "5 minutes",
        movements: [
          "Arm circles, 10 forward and 10 back",
          "Band pull-aparts, 15 reps with a light band, squeezing shoulder blades",
          "Push-up walkouts, 5 reps, walking hands out slowly into full push-up position",
          "Empty bar or light dumbbell bench press, 10-12 easy reps to groove the pattern"
        ]
      },
      exercises: [
        {
          id: "bb-flat-bench",
          name: "Barbell Flat Bench Press",
          sets: 4,
          reps: "5",
          rpe: "7-8",
          rest: 150, // seconds
          restLabel: "2-3 min",
          weightMode: "free", // free | bw | bw-plus | bw-minus
          image: "bb-flat-bench.png",
          video: "https://www.youtube.com/watch?v=rT7DgCr-3pg",
          tip: "Plant the feet, retract the shoulder blades, control the descent to chest, drive through the floor on the press. This is your primary strength marker for pressing. Track it religiously.",
          isFinisher: false
        },
        {
          id: "bb-overhead-press",
          name: "Standing Barbell OHP",
          sets: 4,
          reps: "5",
          rpe: "7-8",
          rest: 150,
          restLabel: "2-3 min",
          weightMode: "free",
          image: "bb-overhead-press.png",
          video: "https://www.youtube.com/watch?v=2yjwXTZQDDI",
          tip: "Brace the core hard before each rep. Slight lean back is fine, but the bar path should travel straight up over the crown of the head. No leg drive. Strict press.",
          isFinisher: false
        },
        {
          id: "weighted-dips-a",
          name: "Weighted Dips",
          sets: 3,
          reps: "6-8",
          rpe: "8",
          rest: 120,
          restLabel: "2 min",
          weightMode: "bw-plus",
          image: "weighted-dips.png",
          video: "https://www.youtube.com/watch?v=2z8JmcrW-As",
          tip: "Use a belt or hold a dumbbell between the feet. Slight forward lean to keep emphasis on chest and triceps. Full depth, elbows to roughly 90 degrees. If bodyweight dips aren't at 8+ clean reps yet, stay unweighted.",
          isFinisher: false
        },
        {
          id: "cg-bench-press",
          name: "Close-Grip Bench Press",
          sets: 3,
          reps: "8",
          rpe: "8",
          rest: 90,
          restLabel: "90 sec",
          weightMode: "free",
          image: "cg-bench-press.png",
          video: "https://www.youtube.com/watch?v=nEF0bv2FW94",
          tip: "Hands roughly shoulder width. Tuck the elbows slightly. This is both a tricep builder and a bench press accessory. Controlled descent, no bouncing.",
          isFinisher: false
        },
        {
          id: "explosive-pushup",
          name: "Explosive Push-Ups",
          sets: 2,
          reps: "to failure",
          rpe: "-",
          rest: 60,
          restLabel: "60 sec",
          weightMode: "bw",
          image: "explosive-pushup.png",
          video: "https://www.youtube.com/watch?v=bCBFRCKjJME",
          tip: "Standard push-ups with maximum speed on the concentric. If you can clap, clap. If not, just press as explosively as possible. Power intent, not grinding reps.",
          isFinisher: true,
          finisherProgression: "Building toward handstand push-ups. Explosive push-ups develop pressing power."
        }
      ]
    },

    // =========================================================
    // PULL A — POWER
    // =========================================================
    "pull-a": {
      id: "pull-a",
      name: "Pull A",
      type: "power",
      label: "Power",
      goal: "Strength — heavy compounds, low reps, long rest",
      estimatedMinutes: 50,
      warmup: {
        name: "Dynamic Warm-Up",
        duration: "5 minutes",
        movements: [
          "Band pull-aparts, 15 reps",
          "Cat-cow stretches, 8 slow reps through full spinal range",
          "Thoracic rotations from half-kneeling, 8 each side",
          "Light lat pulldowns or light dumbbell rows, 10 reps to wake up the lats"
        ]
      },
      exercises: [
        {
          id: "bb-bent-row",
          name: "Barbell Bent-Over Row",
          sets: 4,
          reps: "5",
          rpe: "7-8",
          rest: 150,
          restLabel: "2-3 min",
          weightMode: "free",
          image: "bb-bent-row.png",
          video: "https://www.youtube.com/watch?v=FWJR5Ve8bnQ",
          tip: "Hinge at the hips, torso at roughly 45 degrees, pull the bar to the lower chest. A small amount of body english is fine on the last rep or two, but this should be mostly strict. Squeeze the shoulder blades at the top.",
          isFinisher: false
        },
        {
          id: "weighted-pullup",
          name: "Weighted Pull-Ups",
          sets: 4,
          reps: "5-6",
          rpe: "8",
          rest: 150,
          restLabel: "2-3 min",
          weightMode: "bw-plus",
          image: "weighted-pullup.png",
          video: "https://www.youtube.com/watch?v=eGo4IYlbE5g",
          tip: "Full dead hang at the bottom, chin over bar at the top. Use a belt for added weight. If bodyweight pull-ups aren't solid at 6+ reps yet, do heavy lat pulldowns at the same rep scheme instead.",
          isFinisher: false
        },
        {
          id: "bb-shrugs",
          name: "Barbell Shrugs",
          sets: 3,
          reps: "8",
          rpe: "8",
          rest: 90,
          restLabel: "90 sec",
          weightMode: "free",
          image: "bb-shrugs.png",
          video: "https://www.youtube.com/watch?v=cJRVVxmytaM",
          tip: "Heavy. Hold at the top for a one-count. Straight up and down, no rolling the shoulders.",
          isFinisher: false
        },
        {
          id: "bb-curls",
          name: "Barbell Curls",
          sets: 3,
          reps: "8",
          rpe: "8",
          rest: 90,
          restLabel: "90 sec",
          weightMode: "free",
          image: "bb-curls.png",
          video: "https://www.youtube.com/watch?v=kwG2ipFRgFo",
          tip: "Strict. If the torso is swaying, the weight is too heavy. Curls on power day are heavier and lower rep than most people do them. Treat them like a real lift.",
          isFinisher: false
        },
        {
          id: "dead-hang",
          name: "Dead Hangs",
          sets: 2,
          reps: "max time",
          rpe: "-",
          rest: 60,
          restLabel: "60 sec",
          weightMode: "bw",
          image: "dead-hang.png",
          video: "https://www.youtube.com/watch?v=wPmGMqaKhJo",
          tip: "Full grip, shoulders engaged (not shrugging up to the ears). Track your times. When consistently over 60 seconds, start adding scapular pulls from the hang for sets of 8-10.",
          isFinisher: true,
          finisherProgression: "Building toward advanced pull-up variations. Dead hangs develop grip endurance and scapular stability."
        }
      ]
    },

    // =========================================================
    // LEGS A — POWER
    // =========================================================
    "legs-a": {
      id: "legs-a",
      name: "Legs A",
      type: "power",
      label: "Power",
      goal: "Strength — heavy compounds, low reps, long rest",
      estimatedMinutes: 55,
      warmup: {
        name: "Dynamic Warm-Up",
        duration: "5 minutes",
        movements: [
          "Leg swings front to back, 10 each leg",
          "Lateral leg swings, 10 each",
          "Bodyweight squats, 10 slow reps focusing on depth",
          "Walking lunges, 8 each leg",
          "Hip circles (standing, big circles with the knee), 8 each direction per leg"
        ]
      },
      exercises: [
        {
          id: "bb-back-squat",
          name: "Barbell Back Squat",
          sets: 4,
          reps: "5",
          rpe: "7-8",
          rest: 150,
          restLabel: "2-3 min",
          weightMode: "free",
          image: "bb-back-squat.png",
          video: "https://www.youtube.com/watch?v=ultWZbUMPL8",
          tip: "Primary lower body strength marker. Full depth (hip crease at or below knee level). Brace hard before each rep. Controlled descent, powerful drive out of the hole. Feet roughly shoulder width, toes pointed slightly out.",
          isFinisher: false
        },
        {
          id: "romanian-deadlift",
          name: "Romanian Deadlift",
          sets: 4,
          reps: "5",
          rpe: "7-8",
          rest: 150,
          restLabel: "2-3 min",
          weightMode: "free",
          image: "romanian-deadlift.png",
          video: "https://www.youtube.com/watch?v=7j-2w4-P14I",
          tip: "Bar stays close to the legs. Push the hips back until you feel a strong stretch in the hamstrings, then drive the hips forward to stand. This is a hinge, not a squat. Slight knee bend that doesn't change throughout the rep.",
          isFinisher: false
        },
        {
          id: "leg-press",
          name: "Leg Press",
          sets: 3,
          reps: "8",
          rpe: "8",
          rest: 120,
          restLabel: "2 min",
          weightMode: "free",
          image: "leg-press.png",
          video: "https://www.youtube.com/watch?v=IZxyjW7MPJQ",
          tip: "Feet high and wide for more glute and hamstring emphasis, or centered for quad emphasis. Full range of motion, knees tracking over toes. Don't lock out at the top.",
          isFinisher: false
        },
        {
          id: "standing-calf-raise",
          name: "Weighted Standing Calf Raises",
          sets: 4,
          reps: "10",
          rpe: "8",
          rest: 90,
          restLabel: "90 sec",
          weightMode: "free",
          image: "standing-calf-raise.png",
          video: "https://www.youtube.com/watch?v=YMVhHmKSsqI",
          tip: "Load this heavy. Full stretch at the bottom (let the heels drop), hard squeeze at the top with a two-count hold. Calves respond to heavy loads and full range. Don't bounce.",
          isFinisher: false
        },
        {
          id: "box-jumps",
          name: "Box Jumps",
          sets: 3,
          reps: "6-8",
          rpe: "-",
          rest: 60,
          restLabel: "60 sec",
          weightMode: "bw",
          image: "box-jump.png",
          video: "https://www.youtube.com/watch?v=NBY9-kTuHEk",
          tip: "Focus on explosive hip extension and soft landings. Step down between reps rather than rebounding. Progress the height over weeks, not the reps. This is power output, not conditioning.",
          isFinisher: true,
          finisherProgression: "Building toward full unassisted pistol squats. Box jumps develop explosive hip and quad power."
        }
      ]
    },

    // =========================================================
    // PUSH B — HYPERTROPHY
    // =========================================================
    "push-b": {
      id: "push-b",
      name: "Push B",
      type: "hypertrophy",
      label: "Hypertrophy",
      goal: "Volume — moderate loads, higher reps, controlled tempos",
      estimatedMinutes: 55,
      warmup: {
        name: "Dynamic Warm-Up",
        duration: "5 minutes",
        movements: [
          "Arm circles, 10 each direction",
          "Band dislocates (pass band over and behind head), 10 slow reps",
          "Scapular push-ups (protract and retract shoulder blades without bending elbows), 10 reps",
          "Light cable flyes, 12 reps to get blood into the chest"
        ]
      },
      exercises: [
        {
          id: "db-incline-press",
          name: "Dumbbell Incline Press",
          sets: 4,
          reps: "10-12",
          rpe: "8-9",
          rest: 90,
          restLabel: "90 sec",
          weightMode: "free",
          image: "db-incline-press.png",
          video: "https://www.youtube.com/watch?v=8iPEnn-ltC8",
          tip: "Set bench to 30-degree incline. Three-count descent on every rep. Squeeze at the top without clanking the dumbbells together. Shifts emphasis to upper chest and front delts.",
          isFinisher: false
        },
        {
          id: "cable-flyes",
          name: "Cable Flyes",
          sets: 3,
          reps: "12-15",
          rpe: "9",
          rest: 60,
          restLabel: "60 sec",
          weightMode: "free",
          image: "cable-flyes.png",
          video: "https://www.youtube.com/watch?v=Iwe6AmxVf7o",
          tip: "Slight bend in the elbows, maintained throughout. Think hugging motion. Squeeze for a one-count at peak contraction. Light enough to feel the muscle, heavy enough that 15 is actually hard.",
          isFinisher: false
        },
        {
          id: "db-lateral-raise",
          name: "Dumbbell Lateral Raises",
          sets: 4,
          reps: "12-15",
          rpe: "8-9",
          rest: 60,
          restLabel: "60 sec",
          weightMode: "free",
          image: "db-lateral-raise.png",
          video: "https://www.youtube.com/watch?v=3VcKaXpzqRo",
          tip: "Slight forward lean, thumbs tilted slightly down (like pouring water). Controlled up, slow down. Don't ego-lift these. Feel the burn at rep 10, fight for 15.",
          isFinisher: false
        },
        {
          id: "cable-oh-tricep-ext",
          name: "Overhead Tricep Extension",
          sets: 3,
          reps: "12-15",
          rpe: "9",
          rest: 60,
          restLabel: "60 sec",
          weightMode: "free",
          image: "cable-oh-tricep-ext.png",
          video: "https://www.youtube.com/watch?v=kiuVA0gs3EI",
          tip: "Face away from cable stack, rope behind the head. Extend fully overhead, squeeze at lockout. The long head of the tricep gets stretched in this position, which is important since flat pressing doesn't load it well.",
          isFinisher: false
        },
        {
          id: "tricep-pushdown",
          name: "Tricep Pushdowns",
          sets: 3,
          reps: "12-15",
          rpe: "9",
          rest: 60,
          restLabel: "60 sec",
          weightMode: "free",
          image: "tricep-pushdown.png",
          video: "https://www.youtube.com/watch?v=2-LAMcpzODU",
          tip: "Elbows pinned to the sides. Full extension at the bottom, controlled return. Two different tricep angles in one session gives balanced development across all three heads.",
          isFinisher: false
        },
        {
          id: "pike-pushup",
          name: "Pike Push-Ups",
          sets: 2,
          reps: "to failure",
          rpe: "-",
          rest: 60,
          restLabel: "60 sec",
          weightMode: "bw",
          image: "pike-pushup.png",
          video: "https://www.youtube.com/watch?v=sposDXWEB0A",
          tip: "Hips high, head between the arms, pressing vertically. Entry point toward handstand push-ups. If too hard, elevate feet on a bench to reduce load. Track rep counts. When hitting 15+ on both sets, elevate feet higher.",
          isFinisher: true,
          finisherProgression: "Building toward handstand push-ups. Pike push-ups build overhead pressing strength and shoulder stability."
        }
      ]
    },

    // =========================================================
    // PULL B — HYPERTROPHY
    // =========================================================
    "pull-b": {
      id: "pull-b",
      name: "Pull B",
      type: "hypertrophy",
      label: "Hypertrophy",
      goal: "Volume — moderate loads, higher reps, controlled tempos",
      estimatedMinutes: 55,
      warmup: {
        name: "Dynamic Warm-Up",
        duration: "5 minutes",
        movements: [
          "Band pull-aparts, 15 reps",
          "Arm circles, 10 each direction",
          "Scapular pull-ups (pull shoulder blades down without bending elbows), 8 reps",
          "Light single-arm dumbbell rows, 12 reps to activate the lats"
        ]
      },
      exercises: [
        {
          id: "seated-cable-row",
          name: "Seated Cable Row",
          sets: 4,
          reps: "10-12",
          rpe: "8-9",
          rest: 90,
          restLabel: "90 sec",
          weightMode: "free",
          image: "seated-cable-row.png",
          video: "https://www.youtube.com/watch?v=GZbfZ033f74",
          tip: "Sit upright, pull handle to lower chest, squeeze shoulder blades for a one-count. Three-count return on every rep. Pull with the elbows, not the hands.",
          isFinisher: false
        },
        {
          id: "wide-lat-pulldown",
          name: "Wide-Grip Lat Pulldown",
          sets: 4,
          reps: "10-12",
          rpe: "8-9",
          rest: 90,
          restLabel: "90 sec",
          weightMode: "free",
          image: "wide-lat-pulldown.png",
          video: "https://www.youtube.com/watch?v=CAwf7n6Luuc",
          tip: "Pull to upper chest, not behind neck. Lean back slightly. Drive elbows down toward hips. Slow negative on every rep. Complements heavy pull-ups on power day through different grip width and angle.",
          isFinisher: false
        },
        {
          id: "face-pulls",
          name: "Face Pulls",
          sets: 3,
          reps: "15",
          rpe: "8",
          rest: 60,
          restLabel: "60 sec",
          weightMode: "free",
          image: "face-pulls.png",
          video: "https://www.youtube.com/watch?v=rep-qVOkqgk",
          tip: "Cable at face height. Pull toward face with elbows high, externally rotating so hands finish beside ears. Non-negotiable shoulder health work. Rear delts and rotator cuff muscles that keep shoulders functioning through all the pressing.",
          isFinisher: false
        },
        {
          id: "db-hammer-curls",
          name: "Dumbbell Hammer Curls",
          sets: 3,
          reps: "12",
          rpe: "9",
          rest: 60,
          restLabel: "60 sec",
          weightMode: "free",
          image: "db-hammer-curls.png",
          video: "https://www.youtube.com/watch?v=zC3nLlEvin4",
          tip: "Neutral grip (palms facing each other). Alternating or simultaneous. Controlled, no swinging. Hits brachialis and brachioradialis for arm thickness and forearm development.",
          isFinisher: false
        },
        {
          id: "rear-delt-flyes",
          name: "Rear Delt Flyes",
          sets: 3,
          reps: "12-15",
          rpe: "9",
          rest: 60,
          restLabel: "60 sec",
          weightMode: "free",
          image: "rear-delt-flyes.png",
          video: "https://www.youtube.com/watch?v=EA7u4Q_8HQ0",
          tip: "Bent over, slight elbow bend, raise out to sides with a squeeze at top. Light weight, high control. Balances all the pressing in this program.",
          isFinisher: false
        },
        {
          id: "inverted-row",
          name: "Inverted Rows",
          sets: 2,
          reps: "to failure",
          rpe: "-",
          rest: 60,
          restLabel: "60 sec",
          weightMode: "bw",
          image: "inverted-row.png",
          video: "https://www.youtube.com/watch?v=dYNdjKjMbyc",
          tip: "Bar in rack at waist height. Hang underneath, body straight, pull chest to bar. More horizontal = harder. Start at an angle that allows 8+ reps. When horizontal at 15+, add a weighted vest or elevate feet.",
          isFinisher: true,
          finisherProgression: "Building toward advanced pull-up variations. Inverted rows build horizontal pulling endurance."
        }
      ]
    },

    // =========================================================
    // LEGS B — HYPERTROPHY
    // =========================================================
    "legs-b": {
      id: "legs-b",
      name: "Legs B",
      type: "hypertrophy",
      label: "Hypertrophy",
      goal: "Volume — moderate loads, higher reps, controlled tempos",
      estimatedMinutes: 60,
      warmup: {
        name: "Dynamic Warm-Up",
        duration: "5 minutes",
        movements: [
          "Leg swings, 10 each direction per leg",
          "Hip circles, 8 each direction",
          "Bodyweight squats, 10 reps",
          "Glute bridges on the floor, 10 reps with squeeze at top",
          "Lateral band walks, 10 steps each direction (if band available)"
        ]
      },
      exercises: [
        {
          id: "bulgarian-split-squat",
          name: "Bulgarian Split Squats",
          sets: 4,
          reps: "10-12 each",
          rpe: "8-9",
          rest: 90,
          restLabel: "90 sec",
          weightMode: "free",
          image: "bulgarian-split-squat.png",
          video: "https://www.youtube.com/watch?v=2C-uNgKwPLE",
          tip: "Rear foot on bench. Dumbbells at sides. Drop back knee straight down, drive through front heel. Unilateral work exposes and fixes imbalances bilateral squats hide. Rest between legs, not between sets.",
          isFinisher: false
        },
        {
          id: "lying-leg-curl",
          name: "Lying Leg Curl",
          sets: 4,
          reps: "12",
          rpe: "9",
          rest: 60,
          restLabel: "60 sec",
          weightMode: "free",
          image: "lying-leg-curl.png",
          video: "https://www.youtube.com/watch?v=1Tq3QdYUuHs",
          tip: "Squeeze hard at peak contraction, three-count negative on every rep. Don't let hips lift off the pad. RDL on power day loads hamstrings stretched; leg curl loads them shortened. You need both.",
          isFinisher: false
        },
        {
          id: "leg-extension",
          name: "Leg Extension",
          sets: 4,
          reps: "12",
          rpe: "9",
          rest: 60,
          restLabel: "60 sec",
          weightMode: "free",
          image: "leg-extension.png",
          video: "https://www.youtube.com/watch?v=YyvSfVjQeL0",
          tip: "Full extension at top with one-count squeeze. Slow negative. Quads in isolation. Complements squat and split squat patterns.",
          isFinisher: false
        },
        {
          id: "walking-lunges",
          name: "Walking Lunges",
          sets: 3,
          reps: "12 each",
          rpe: "8-9",
          rest: 90,
          restLabel: "90 sec",
          weightMode: "free",
          image: "walking-lunges.png",
          video: "https://www.youtube.com/watch?v=L8fvypPrzzs",
          tip: "Dumbbells at sides. Long stride, upright torso, back knee kisses floor. High-fatigue by design after split squats, curls, and extensions. Moderate weight, quality steps.",
          isFinisher: false
        },
        {
          id: "seated-calf-raise",
          name: "Seated Calf Raises",
          sets: 4,
          reps: "15",
          rpe: "9",
          rest: 60,
          restLabel: "60 sec",
          weightMode: "free",
          image: "seated-calf-raise.png",
          video: "https://www.youtube.com/watch?v=JbyjNymZOt0",
          tip: "Full stretch at bottom, hard squeeze at top. Seated raises emphasize the soleus (deeper calf muscle underneath the gastrocnemius). Standing raises on power day hit the gastroc. Both days, both muscles.",
          isFinisher: false
        },
        {
          id: "assisted-pistol-squat",
          name: "Assisted Pistol Squats",
          sets: 2,
          reps: "max each leg",
          rpe: "-",
          rest: 60,
          restLabel: "60 sec",
          weightMode: "bw",
          image: "assisted-pistol-squat.png",
          video: "https://www.youtube.com/watch?v=qDcniqddTeE",
          tip: "Hold a rack post or TRX for balance. Lower on one leg to bench, touch glutes to surface, stand up. Use as much assistance as needed. Progressively lower box height and reduce hold over weeks. When you can pistol to a standard bench unassisted for 5+ reps per leg, the box comes away.",
          isFinisher: true,
          finisherProgression: "Building toward full unassisted pistol squats. Assisted pistols build single-leg strength, balance, and ankle mobility."
        }
      ]
    }
  },

  // e1RM calculation using Epley formula
  // weight × (1 + reps / 30)
  calculateE1RM: function(weight, reps) {
    if (reps === 1) return weight;
    return Math.round(weight * (1 + reps / 30));
  }
};

// Make available globally
if (typeof window !== 'undefined') {
  window.FORGE_DATA = FORGE_DATA;
}
