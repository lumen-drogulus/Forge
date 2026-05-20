// FORGE — Main Application Logic
// ================================

(function() {
  'use strict';

  // ===== STATE =====
  const state = {
    currentTab: 'home',
    cycleIndex: 0,          // 0-7 position in the 8-day cycle
    workoutActive: false,
    workoutPhase: 'overview', // overview | warmup | exercise | complete
    currentExerciseIndex: 0,
    currentSetIndex: 0,
    skippedExercises: [],
    activeWorkoutLog: null,
    timerInterval: null,
    timerRemaining: 0,
    timerRunning: false,
    bodyWeight: 180,         // default, configurable in settings
    sheetsUrl: '',           // Google Sheets webhook URL
    weightUnit: 'lbs'
  };

  // ===== STORAGE =====
  const Store = {
    get(key) {
      try { return JSON.parse(localStorage.getItem('forge_' + key)); }
      catch { return null; }
    },
    set(key, val) {
      localStorage.setItem('forge_' + key, JSON.stringify(val));
    },
    getLogs() { return this.get('logs') || {}; },
    saveLogs(logs) { this.set('logs', logs); },
    getPRs() { return this.get('prs') || {}; },
    savePRs(prs) { this.set('prs', prs); },
    getSettings() {
      return this.get('settings') || {
        cycleIndex: 0,
        bodyWeight: 180,
        weightUnit: 'lbs',
        sheetsUrl: '',
        cycleStartDate: new Date().toISOString().split('T')[0]
      };
    },
    saveSettings(s) { this.set('settings', s); },
    getCompletedDays() { return this.get('completedDays') || []; },
    getActiveWorkout() { return this.get('activeWorkout'); },
    saveActiveWorkout(data) {
      if (data) this.set('activeWorkout', data);
      else localStorage.removeItem('forge_activeWorkout');
    }
  };

  // ===== INIT =====
  function init() {
    const settings = Store.getSettings();
    state.cycleIndex = settings.cycleIndex || 0;
    state.bodyWeight = settings.bodyWeight || 180;
    state.weightUnit = settings.weightUnit || 'lbs';
    state.sheetsUrl = settings.sheetsUrl || '';

    setupNavigation();
    restoreActiveWorkout();
    renderTab('home');
    hideSplash();
    registerSW();

    // Save workout state when app goes to background (before OS kills the tab)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden' && state.workoutActive) {
        persistWorkoutState();
      }
    });
  }

  function restoreActiveWorkout() {
    const saved = Store.getActiveWorkout();
    if (!saved || !saved.activeWorkoutLog) return;
    // Verify the saved workout matches current cycle position
    if (saved.cycleIndex !== state.cycleIndex) {
      Store.saveActiveWorkout(null);
      return;
    }
    state.workoutActive = true;
    state.workoutPhase = saved.workoutPhase || 'overview';
    state.currentExerciseIndex = saved.currentExerciseIndex || 0;
    state.currentSetIndex = saved.currentSetIndex || 0;
    state.skippedExercises = saved.skippedExercises || [];
    state.activeWorkoutLog = saved.activeWorkoutLog;
  }

  function persistWorkoutState() {
    if (!state.workoutActive) {
      Store.saveActiveWorkout(null);
      return;
    }
    Store.saveActiveWorkout({
      cycleIndex: state.cycleIndex,
      workoutPhase: state.workoutPhase,
      currentExerciseIndex: state.currentExerciseIndex,
      currentSetIndex: state.currentSetIndex,
      skippedExercises: state.skippedExercises,
      activeWorkoutLog: state.activeWorkoutLog
    });
  }

  function hideSplash() {
    setTimeout(() => {
      const splash = document.getElementById('splash');
      if (splash) { splash.classList.add('hidden'); setTimeout(() => splash.remove(), 600); }
    }, 1500);
  }

  function registerSW() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }
  }

  // ===== NAVIGATION =====
  function setupNavigation() {
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        if (state.workoutActive && btn.dataset.tab === 'home') {
          renderWorkoutView();
          return;
        }
        renderTab(btn.dataset.tab);
      });
    });
    document.getElementById('info-backdrop').addEventListener('click', closeInfoPanel);
    document.getElementById('settings-btn').addEventListener('click', () => renderTab('settings'));
  }

  function renderTab(tab) {
    state.currentTab = tab;
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    const activeBtn = document.querySelector(`.nav-item[data-tab="${tab}"]`);
    if (activeBtn) activeBtn.classList.add('active');

    const main = document.getElementById('main-content');
    switch(tab) {
      case 'home': state.workoutActive ? renderWorkoutView() : renderHome(main); break;
      case 'tracker': renderTracker(main); break;
      case 'prs': renderPRs(main); break;
      case 'settings': renderSettings(main); break;
    }
  }

  // ===== HOME SCREEN =====
  function renderHome(el) {
    const day = FORGE_DATA.cycleDays[state.cycleIndex];
    const workout = FORGE_DATA.workouts[day.id];
    const isRest = day.type === 'rest';
    const typeClass = day.type === 'hypertrophy' ? 'hypertrophy' : day.type === 'rest' ? 'rest' : 'power';

    el.innerHTML = `
      <div class="section-header">Cycle position</div>
      <div class="cycle-bar">${renderCycleBar()}</div>
      ${renderCalendar()}
      <div class="today-card ${typeClass}">
        <div class="today-card-top">
          <div>
            <div class="today-label ${typeClass}">Today</div>
            <div class="today-name">${day.name}</div>
            <div class="today-meta">${isRest ? 'Recovery day' : `${day.label} · ${workout.exercises.length} exercises · ~${workout.estimatedMinutes} min`}</div>
          </div>
          <div class="today-day-badge">Day ${state.cycleIndex + 1}/8</div>
        </div>
      </div>
      ${isRest ? `
        <button class="start-btn" style="background:var(--gray);color:var(--text-secondary);" onclick="FORGE.skipRestDay()">
          COMPLETE REST DAY
        </button>
      ` : `
        <button class="start-btn ${typeClass}" onclick="FORGE.startWorkout()">
          START WORKOUT
        </button>
      `}
    `;
  }

  function renderCycleBar() {
    return FORGE_DATA.cycleDays.map((d, i) => {
      let cls = d.type === 'rest' ? 'rest' : d.type;
      if (i < state.cycleIndex) cls += ' past';
      else if (i === state.cycleIndex) cls += ' current';
      else cls += ' future';
      return `<div class="cycle-dot ${cls}"></div>`;
    }).join('');
  }

  function renderCalendar() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const monthName = today.toLocaleString('default', { month: 'long', year: 'numeric' });
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayDate = today.getDate();
    const completedDays = Store.getCompletedDays();

    let grid = '<div class="calendar-grid">';
    ['S','M','T','W','T','F','S'].forEach(d => { grid += `<div class="cal-day-header">${d}</div>`; });
    for (let i = 0; i < firstDay; i++) grid += '<div class="cal-day empty"></div>';
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const completed = completedDays.find(c => c.date === dateStr);
      let cls = 'cal-day';
      if (d === todayDate) {
        const dayType = FORGE_DATA.cycleDays[state.cycleIndex].type;
        cls += ` today ${dayType === 'hypertrophy' ? 'hypertrophy-type' : dayType === 'rest' ? 'rest-type' : 'power-type'}`;
      } else if (completed) {
        cls += ` ${completed.type === 'hypertrophy' ? 'hypertrophy-done' : completed.type === 'rest' ? 'rest-done' : 'power-done'}`;
      } else if (d > todayDate) {
        const daysAhead = d - todayDate;
        const futureIdx = (state.cycleIndex + daysAhead) % 8;
        const futureType = FORGE_DATA.cycleDays[futureIdx].type;
        cls += ` future-planned ${futureType === 'hypertrophy' ? 'hypertrophy-type' : futureType === 'rest' ? 'rest-type' : 'power-type'}`;
      }
      grid += `<div class="${cls}">${d}</div>`;
    }
    grid += '</div>';

    return `
      <div class="calendar-section">
        <div class="calendar-header">
          <div class="calendar-month">${monthName}</div>
        </div>
        ${grid}
        <div class="calendar-legend">
          <div><span class="legend-dot" style="background:var(--amber)"></span>Power</div>
          <div><span class="legend-dot" style="background:var(--cyan)"></span>Hypertrophy</div>
          <div><span class="legend-dot" style="background:var(--gray)"></span>Rest</div>
        </div>
      </div>
    `;
  }

  // ===== WORKOUT FLOW =====
  function startWorkout() {
    const day = FORGE_DATA.cycleDays[state.cycleIndex];
    const workout = FORGE_DATA.workouts[day.id];
    if (!workout) return;

    state.workoutActive = true;
    state.workoutPhase = 'overview';
    state.currentExerciseIndex = 0;
    state.currentSetIndex = 0;
    state.skippedExercises = [];
    state.activeWorkoutLog = {
      dayId: day.id,
      date: new Date().toISOString(),
      exercises: workout.exercises.map(ex => ({
        id: ex.id,
        name: ex.name,
        sets: [],
        completed: false
      }))
    };
    renderWorkoutView();
    persistWorkoutState();
  }

  function renderWorkoutView() {
    const main = document.getElementById('main-content');
    switch(state.workoutPhase) {
      case 'overview': renderWorkoutOverview(main); break;
      case 'warmup': renderWarmup(main); break;
      case 'exercise': renderExercise(main); break;
      case 'complete': renderComplete(main); break;
    }
  }

  function renderWorkoutOverview(el) {
    const day = FORGE_DATA.cycleDays[state.cycleIndex];
    const workout = FORGE_DATA.workouts[day.id];
    const typeClass = day.type === 'hypertrophy' ? 'hypertrophy' : 'power';

    let items = `
      <div class="wo-item" onclick="FORGE.goToWarmup()">
        <div class="wo-num warmup"><i class="ti ti-flame" style="font-size:14px"></i></div>
        <div class="wo-item-info">
          <div class="wo-item-name">Warm-Up</div>
          <div class="wo-item-detail">${workout.warmup.duration} · Dynamic stretches</div>
        </div>
        <div class="wo-item-status"><i class="ti ti-chevron-right"></i></div>
      </div>
    `;

    workout.exercises.forEach((ex, i) => {
      const log = state.activeWorkoutLog.exercises[i];
      const done = log.completed;
      const skipped = state.skippedExercises.includes(i);
      let numCls = done ? 'wo-num done' : 'wo-num';
      let itemCls = done ? 'wo-item completed' : skipped ? 'wo-item skipped' : 'wo-item';

      items += `
        <div class="${itemCls}" onclick="FORGE.goToExercise(${i})">
          <div class="${numCls}">${done ? '<i class="ti ti-check" style="font-size:12px"></i>' : i + 1}</div>
          <div class="wo-item-info">
            <div class="wo-item-name">${ex.name}${ex.isFinisher ? `<span class="finisher-tag ${typeClass}">Finisher</span>` : ''}</div>
            <div class="wo-item-detail">${ex.sets} sets · ${ex.reps} reps · ${ex.restLabel}</div>
          </div>
          <div class="wo-item-status"><i class="ti ti-chevron-right"></i></div>
        </div>
      `;
    });

    const allDone = state.activeWorkoutLog.exercises.every(e => e.completed);

    el.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <div>
          <div class="exercise-day-label ${typeClass === 'hypertrophy' ? 'text-cyan' : 'text-amber'}">${day.name} · ${day.label}</div>
          <div style="font-size:12px;color:var(--text-secondary);">${workout.goal}</div>
        </div>
        <button class="skip-btn" onclick="FORGE.endWorkout()">End</button>
      </div>
      <div class="workout-overview-list">${items}</div>
      ${allDone ? `<button class="save-set-btn ${typeClass}" onclick="FORGE.completeWorkout()">COMPLETE WORKOUT</button>` : ''}
    `;
  }

  function renderWarmup(el) {
    const day = FORGE_DATA.cycleDays[state.cycleIndex];
    const workout = FORGE_DATA.workouts[day.id];
    const typeClass = day.type === 'hypertrophy' ? 'hypertrophy' : 'power';

    el.innerHTML = `
      <button class="back-btn" onclick="FORGE.backToOverview()" style="margin-bottom:12px;">
        <i class="ti ti-chevron-left"></i> Back
      </button>
      <div class="warmup-card">
        <div class="warmup-title">${workout.warmup.name}</div>
        <div class="warmup-duration">${workout.warmup.duration}</div>
        ${workout.warmup.movements.map(m => `<div class="warmup-movement">${m}</div>`).join('')}
      </div>
      <button class="warmup-done-btn ${typeClass}" onclick="FORGE.warmupDone()">
        WARM-UP COMPLETE
      </button>
    `;
  }

  function renderExercise(el) {
    const day = FORGE_DATA.cycleDays[state.cycleIndex];
    const workout = FORGE_DATA.workouts[day.id];
    const ex = workout.exercises[state.currentExerciseIndex];
    const log = state.activeWorkoutLog.exercises[state.currentExerciseIndex];
    const typeClass = day.type === 'hypertrophy' ? 'hypertrophy' : 'power';
    const totalExercises = workout.exercises.length;

    // Get previous data for this exercise
    const prevData = getPreviousExerciseData(ex.id, day.id);
    const prData = getPR(ex.id);
    const trendData = getTrend(ex.id, day.id);

    // Determine number of sets (for 'to failure' exercises, use the defined sets count)
    const numSets = ex.sets;
    const currentSet = state.currentSetIndex;

    // Build set indicators
    let setIndicators = '';
    for (let s = 0; s < numSets; s++) {
      const loggedSet = log.sets[s];
      let cls = 'set-indicator';
      if (loggedSet) cls += ' done';
      else if (s === currentSet) cls += ` current ${typeClass}`;
      else cls += ' upcoming';

      setIndicators += `
        <div class="${cls}">
          <div class="si-label">${loggedSet ? `Set ${s+1} ✓` : s === currentSet ? `Set ${s+1} · now` : `Set ${s+1}`}</div>
          <div class="si-data">${loggedSet ? `${loggedSet.display}` : '—'}</div>
        </div>
      `;
    }

    // Weight input based on mode
    const isBW = ex.weightMode === 'bw';
    const isBWPlus = ex.weightMode === 'bw-plus';
    const isBWMinus = ex.weightMode === 'bw-minus';
    const hasBWModes = isBW || isBWPlus || isBWMinus;
    const lastWeight = log.sets.length > 0 ? log.sets[log.sets.length - 1].weight : (prevData ? prevData.weight : '');

    // Build rep options
    const repOptions = buildRepOptions(ex.reps);

    const allSetsDone = currentSet >= numSets;

    el.innerHTML = `
      <div class="exercise-header">
        <div class="exercise-header-left">
          <button class="back-btn" onclick="FORGE.backToOverview()"><i class="ti ti-chevron-left"></i></button>
          <div>
            <div class="exercise-day-label ${typeClass === 'hypertrophy' ? 'text-cyan' : 'text-amber'}">${day.name} · ${day.label}</div>
            <div class="exercise-position">Exercise ${state.currentExerciseIndex + 1} of ${totalExercises}</div>
          </div>
        </div>
        <button class="skip-btn" onclick="FORGE.skipExercise()">Skip <i class="ti ti-arrow-right" style="font-size:12px"></i></button>
      </div>

      <div class="exercise-name">${ex.name}</div>
      <div class="exercise-params">${ex.sets} sets · ${ex.reps} reps${ex.rpe !== '-' ? ` · RPE ${ex.rpe}` : ''} · Rest ${ex.restLabel}</div>

      <div class="exercise-actions">
        <button class="action-btn" onclick="FORGE.showInfo()">
          <i class="ti ti-info-circle"></i> Tips
        </button>
        <button class="action-btn" onclick="window.open('${ex.video}', '_blank')">
          <i class="ti ti-player-play"></i> Demo
        </button>
      </div>

      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-label">Last time</div>
          <div class="stat-value font-mono">${prevData ? prevData.weight + ' ' + state.weightUnit : '—'}</div>
          <div class="stat-detail">${prevData ? prevData.detail : 'No data'}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">e1RM PR</div>
          <div class="stat-value pr font-mono">${prData ? prData.e1rm + ' ' + state.weightUnit : '—'}</div>
          <div class="stat-detail">${prData ? prData.detail : 'No data'}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Trend</div>
          <div class="stat-value ${trendData ? (trendData.direction === 'up' ? 'trend-up' : trendData.direction === 'down' ? 'trend-down' : '') : ''} font-mono">
            ${trendData ? `${trendData.direction === 'up' ? '↑' : trendData.direction === 'down' ? '↓' : '→'} ${trendData.percent}` : '—'}
          </div>
          <div class="stat-detail">${trendData ? trendData.detail : 'Need 3+ sessions'}</div>
        </div>
      </div>

      <div class="set-indicators">${setIndicators}</div>

      ${allSetsDone ? `
        <button class="save-set-btn ${typeClass}" onclick="FORGE.finishExercise()">
          ${state.currentExerciseIndex < totalExercises - 1 ? 'NEXT EXERCISE' : 'FINISH LAST EXERCISE'}
        </button>
      ` : `
        <div class="set-label">Set ${currentSet + 1} of ${numSets}</div>

        ${hasBWModes ? `
          <div class="bw-toggle" id="bw-toggle">
            <button class="bw-btn ${isBW ? 'active' : ''} ${typeClass}" onclick="FORGE.setBWMode('bw')">BW</button>
            <button class="bw-btn ${isBWPlus ? 'active' : ''} ${typeClass}" onclick="FORGE.setBWMode('bw-plus')">BW+</button>
            <button class="bw-btn ${isBWMinus ? 'active' : ''} ${typeClass}" onclick="FORGE.setBWMode('bw-minus')">BW-</button>
            <button class="bw-btn ${!hasBWModes ? 'active' : ''} ${typeClass}" onclick="FORGE.setBWMode('free')">Free</button>
          </div>
        ` : ''}

        <div class="input-row">
          <div class="input-group">
            <label>Weight (${state.weightUnit})</label>
            ${isBW ? `
              <div style="background:var(--bg-surface);border-radius:6px;padding:10px;text-align:center;font-family:var(--font-mono);font-size:18px;color:var(--text-secondary);">BW</div>
            ` : `
              <div class="weight-input-wrap">
                <button class="weight-adj" onclick="FORGE.adjWeight(-5)">-5</button>
                <input type="number" class="weight-input ${typeClass}" id="weight-input" value="${lastWeight}" inputmode="numeric" placeholder="0">
                <button class="weight-adj" onclick="FORGE.adjWeight(5)">+5</button>
              </div>
            `}
          </div>
          <div class="input-group">
            <label>Reps</label>
            <div class="select-wrap">
              <select class="reps-select" id="reps-input">
                ${repOptions}
              </select>
            </div>
          </div>
        </div>

        <div class="rest-timer ${state.timerRunning ? 'active' : ''} ${typeClass}" id="rest-timer">
          <div class="rest-timer-left">
            <i class="ti ti-clock rest-timer-icon" style="color:var(${typeClass === 'hypertrophy' ? '--cyan' : '--amber'})"></i>
            <span class="rest-timer-label">${state.timerRunning ? 'Resting...' : 'Rest timer'}</span>
          </div>
          <div class="rest-timer-right">
            <span class="rest-timer-display ${typeClass}" id="timer-display">${formatTime(state.timerRunning ? state.timerRemaining : ex.rest)}</span>
            <button class="rest-timer-badge ${typeClass}" onclick="FORGE.toggleTimer(${ex.rest})">${state.timerRunning ? 'Stop' : ex.restLabel}</button>
          </div>
        </div>

        <button class="save-set-btn ${typeClass}" onclick="FORGE.saveSet()">
          SAVE SET
        </button>
      `}
    `;
  }

  // ===== SET LOGGING =====
  function saveSet() {
    const day = FORGE_DATA.cycleDays[state.cycleIndex];
    const workout = FORGE_DATA.workouts[day.id];
    const ex = workout.exercises[state.currentExerciseIndex];
    const log = state.activeWorkoutLog.exercises[state.currentExerciseIndex];
    const isBW = ex.weightMode === 'bw';

    let weight, reps, display;

    if (isBW) {
      weight = state.bodyWeight;
      reps = document.getElementById('reps-input').value;
      display = `BW × ${reps}`;
    } else {
      weight = parseFloat(document.getElementById('weight-input').value) || 0;
      reps = document.getElementById('reps-input').value;

      if (ex.weightMode === 'bw-plus') {
        display = `BW+${weight} × ${reps}`;
        weight = state.bodyWeight + weight;
      } else if (ex.weightMode === 'bw-minus') {
        display = `BW-${weight} × ${reps}`;
        weight = Math.max(0, state.bodyWeight - weight);
      } else {
        display = `${weight} × ${reps}`;
      }
    }

    const repsNum = reps === 'F' ? 0 : parseInt(reps) || 0;

    log.sets.push({
      weight: weight,
      reps: repsNum,
      repsDisplay: reps,
      display: display,
      timestamp: Date.now()
    });

    state.currentSetIndex++;
    stopTimer();

    // Auto-start rest timer after saving a set (if not the last set)
    if (state.currentSetIndex < ex.sets) {
      startTimer(ex.rest);
    }

    // Check for PR
    if (repsNum > 0 && weight > 0) {
      checkAndUpdatePR(ex.id, ex.name, weight, repsNum);
    }

    renderExercise(document.getElementById('main-content'));
    persistWorkoutState();
  }

  function finishExercise() {
    const log = state.activeWorkoutLog.exercises[state.currentExerciseIndex];
    log.completed = true;
    stopTimer();

    // Move to next incomplete exercise or back to overview
    const nextIndex = findNextExercise();
    if (nextIndex !== -1) {
      state.currentExerciseIndex = nextIndex;
      state.currentSetIndex = 0;
      renderExercise(document.getElementById('main-content'));
    } else {
      state.workoutPhase = 'overview';
      renderWorkoutView();
    }
    persistWorkoutState();
  }

  function findNextExercise() {
    const exercises = state.activeWorkoutLog.exercises;
    // First check sequential
    for (let i = state.currentExerciseIndex + 1; i < exercises.length; i++) {
      if (!exercises[i].completed) return i;
    }
    // Then check skipped
    for (let i = 0; i < exercises.length; i++) {
      if (!exercises[i].completed) return i;
    }
    return -1;
  }

  function skipExercise() {
    if (!state.skippedExercises.includes(state.currentExerciseIndex)) {
      state.skippedExercises.push(state.currentExerciseIndex);
    }
    stopTimer();
    const nextIndex = findNextExercise();
    if (nextIndex !== -1 && nextIndex !== state.currentExerciseIndex) {
      state.currentExerciseIndex = nextIndex;
      state.currentSetIndex = 0;
      state.workoutPhase = 'exercise';
      renderWorkoutView();
    } else {
      state.workoutPhase = 'overview';
      renderWorkoutView();
    }
    persistWorkoutState();
  }

  function goToExercise(index) {
    state.currentExerciseIndex = index;
    state.currentSetIndex = state.activeWorkoutLog.exercises[index].sets.length;
    state.workoutPhase = 'exercise';
    renderWorkoutView();
    persistWorkoutState();
  }

  function goToWarmup() {
    state.workoutPhase = 'warmup';
    renderWorkoutView();
  }

  function warmupDone() {
    state.workoutPhase = 'exercise';
    state.currentExerciseIndex = 0;
    state.currentSetIndex = 0;
    renderWorkoutView();
  }

  function backToOverview() {
    stopTimer();
    state.workoutPhase = 'overview';
    renderWorkoutView();
  }

  function completeWorkout() {
    state.workoutPhase = 'complete';
    saveWorkoutToStorage();
    advanceCycle();
    renderWorkoutView();
  }

  function endWorkout() {
    if (confirm('End workout? Logged sets will be saved.')) {
      if (state.activeWorkoutLog.exercises.some(e => e.sets.length > 0)) {
        saveWorkoutToStorage();
      }
      resetWorkoutState();
      renderTab('home');
    }
  }

  function renderComplete(el) {
    const day = FORGE_DATA.cycleDays[(state.cycleIndex + 7) % 8]; // previous day since we already advanced
    const totalSets = state.activeWorkoutLog.exercises.reduce((sum, e) => sum + e.sets.length, 0);
    const totalReps = state.activeWorkoutLog.exercises.reduce((sum, e) =>
      sum + e.sets.reduce((s, set) => s + (set.reps || 0), 0), 0);

    el.innerHTML = `
      <div class="complete-screen">
        <div class="complete-icon"><i class="ti ti-check"></i></div>
        <div class="complete-title">FORGED</div>
        <div class="complete-detail">${day.name} · ${day.label} complete<br>${totalSets} sets · ${totalReps} reps</div>
        <button class="complete-btn" onclick="FORGE.finishAndGoHome()">DONE</button>
      </div>
    `;
  }

  function finishAndGoHome() {
    resetWorkoutState();
    renderTab('home');
  }

  function resetWorkoutState() {
    state.workoutActive = false;
    state.workoutPhase = 'overview';
    state.currentExerciseIndex = 0;
    state.currentSetIndex = 0;
    state.skippedExercises = [];
    state.activeWorkoutLog = null;
    stopTimer();
    persistWorkoutState();
  }

  function skipRestDay() {
    const today = new Date().toISOString().split('T')[0];
    const completed = Store.getCompletedDays();
    completed.push({ date: today, type: 'rest', dayId: 'rest' });
    Store.set('completedDays', completed);
    advanceCycle();
    renderTab('home');
  }

  // ===== STORAGE & SYNC =====
  function saveWorkoutToStorage() {
    const logs = Store.getLogs();
    const dateKey = new Date().toISOString().split('T')[0];
    const logEntry = {
      ...state.activeWorkoutLog,
      completedAt: new Date().toISOString()
    };

    if (!logs[state.activeWorkoutLog.dayId]) logs[state.activeWorkoutLog.dayId] = [];
    logs[state.activeWorkoutLog.dayId].push(logEntry);
    Store.saveLogs(logs);

    // Save completed day for calendar
    const completed = Store.getCompletedDays();
    const day = FORGE_DATA.cycleDays[(state.cycleIndex + 7) % 8];
    completed.push({ date: dateKey, type: day.type, dayId: day.id });
    Store.set('completedDays', completed);

    // Sync to Google Sheets
    syncToSheets(logEntry);
  }

  function advanceCycle() {
    state.cycleIndex = (state.cycleIndex + 1) % 8;
    const settings = Store.getSettings();
    settings.cycleIndex = state.cycleIndex;
    Store.saveSettings(settings);
  }

  function syncToSheets(logEntry) {
    if (!state.sheetsUrl) return;
    try {
      const rows = [];
      logEntry.exercises.forEach(ex => {
        ex.sets.forEach((set, i) => {
          rows.push({
            date: logEntry.completedAt,
            day: logEntry.dayId,
            exercise: ex.name,
            set: i + 1,
            weight: set.weight,
            reps: set.reps,
            display: set.display
          });
        });
      });
      fetch(state.sheetsUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows }),
        mode: 'no-cors'
      }).catch(() => {});
    } catch(e) {}
  }

  // ===== PR TRACKING =====
  function checkAndUpdatePR(exerciseId, exerciseName, weight, reps) {
    const prs = Store.getPRs();
    const e1rm = FORGE_DATA.calculateE1RM(weight, reps);

    if (!prs[exerciseId]) {
      prs[exerciseId] = { name: exerciseName, e1rm: e1rm, weight: weight, reps: reps, date: new Date().toISOString() };
      Store.savePRs(prs);
      return true;
    }

    if (e1rm > prs[exerciseId].e1rm) {
      prs[exerciseId] = { name: exerciseName, e1rm: e1rm, weight: weight, reps: reps, date: new Date().toISOString() };
      Store.savePRs(prs);
      return true;
    }
    return false;
  }

  function getPR(exerciseId) {
    const prs = Store.getPRs();
    if (!prs[exerciseId]) return null;
    const pr = prs[exerciseId];
    return {
      e1rm: pr.e1rm,
      detail: `${pr.weight}×${pr.reps}`
    };
  }

  function getPreviousExerciseData(exerciseId, dayId) {
    const logs = Store.getLogs();
    if (!logs[dayId] || logs[dayId].length === 0) return null;
    const lastLog = logs[dayId][logs[dayId].length - 1];
    const exLog = lastLog.exercises.find(e => e.id === exerciseId);
    if (!exLog || exLog.sets.length === 0) return null;
    const lastSet = exLog.sets[exLog.sets.length - 1];
    const avgWeight = Math.round(exLog.sets.reduce((s, set) => s + set.weight, 0) / exLog.sets.length);
    return {
      weight: avgWeight,
      detail: `${exLog.sets.length}×${lastSet.repsDisplay || lastSet.reps}`
    };
  }

  function getTrend(exerciseId, dayId) {
    const logs = Store.getLogs();
    if (!logs[dayId] || logs[dayId].length < 3) return null;
    const recent = logs[dayId].slice(-3);
    const e1rms = recent.map(log => {
      const exLog = log.exercises.find(e => e.id === exerciseId);
      if (!exLog || exLog.sets.length === 0) return 0;
      const bestSet = exLog.sets.reduce((best, s) => {
        const e1 = FORGE_DATA.calculateE1RM(s.weight, s.reps || 0);
        return e1 > best ? e1 : best;
      }, 0);
      return bestSet;
    }).filter(v => v > 0);

    if (e1rms.length < 2) return null;
    const first = e1rms[0];
    const last = e1rms[e1rms.length - 1];
    const change = ((last - first) / first * 100);
    return {
      direction: change > 1 ? 'up' : change < -1 ? 'down' : 'flat',
      percent: `${Math.abs(Math.round(change))}%`,
      detail: `${e1rms.length} sessions`
    };
  }

  // ===== REST TIMER =====
  function startTimer(duration) {
    stopTimer();
    state.timerRemaining = duration;
    state.timerRunning = true;
    state.timerInterval = setInterval(() => {
      state.timerRemaining--;
      const display = document.getElementById('timer-display');
      if (display) display.textContent = formatTime(state.timerRemaining);
      if (state.timerRemaining <= 0) {
        stopTimer();
        playTimerAlert();
        // Update display
        const display2 = document.getElementById('timer-display');
        if (display2) display2.textContent = 'Done!';
      }
    }, 1000);
  }

  function stopTimer() {
    if (state.timerInterval) {
      clearInterval(state.timerInterval);
      state.timerInterval = null;
    }
    state.timerRunning = false;
  }

  function toggleTimer(duration) {
    if (state.timerRunning) {
      stopTimer();
      renderExercise(document.getElementById('main-content'));
    } else {
      startTimer(duration);
    }
  }

  function playTimerAlert() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      [0, 200, 400].forEach(delay => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        osc.type = 'sine';
        gain.gain.value = 0.3;
        osc.start(ctx.currentTime + delay / 1000);
        osc.stop(ctx.currentTime + delay / 1000 + 0.15);
      });
    } catch(e) {}
  }

  function formatTime(seconds) {
    if (seconds <= 0) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  // ===== WEIGHT INPUT HELPERS =====
  function adjWeight(amount) {
    const input = document.getElementById('weight-input');
    if (!input) return;
    const current = parseFloat(input.value) || 0;
    input.value = Math.max(0, current + amount);
  }

  function setBWMode(mode) {
    const day = FORGE_DATA.cycleDays[state.cycleIndex];
    const workout = FORGE_DATA.workouts[day.id];
    const ex = workout.exercises[state.currentExerciseIndex];
    ex.weightMode = mode;
    renderExercise(document.getElementById('main-content'));
  }

  function buildRepOptions(repsStr) {
    if (repsStr === 'to failure' || repsStr === 'max time' || repsStr === 'max each leg') {
      let opts = '<option value="F">Failure</option>';
      for (let i = 1; i <= 50; i++) opts += `<option value="${i}">${i}</option>`;
      return opts;
    }
    const match = repsStr.match(/(\d+)-?(\d+)?/);
    if (!match) return '<option value="0">0</option>';
    const low = parseInt(match[1]);
    const high = match[2] ? parseInt(match[2]) : low;
    let opts = '';
    for (let i = Math.max(1, low - 3); i <= high + 5; i++) {
      opts += `<option value="${i}" ${i === low ? 'selected' : ''}>${i}</option>`;
    }
    opts += '<option value="F">Failure</option>';
    return opts;
  }

  // ===== INFO PANEL =====
  function showInfo() {
    const day = FORGE_DATA.cycleDays[state.cycleIndex];
    const workout = FORGE_DATA.workouts[day.id];
    const ex = workout.exercises[state.currentExerciseIndex];

    const panel = document.getElementById('info-panel');
    const content = document.getElementById('info-panel-content');
    const backdrop = document.getElementById('info-backdrop');

    content.innerHTML = `
      <div class="info-panel-title">${ex.name}</div>
      <img class="info-panel-image" src="images/${ex.image}" alt="${ex.name}" onerror="this.style.display='none'">
      <div class="info-panel-tip">${ex.tip}</div>
      ${ex.isFinisher ? `<div style="font-size:12px;color:var(--amber);margin-bottom:12px;">🔥 ${ex.finisherProgression}</div>` : ''}
      <button class="info-panel-video-btn" onclick="window.open('${ex.video}', '_blank')">
        <i class="ti ti-player-play"></i> Watch demo video
      </button>
    `;

    panel.classList.add('open');
    backdrop.classList.add('open');
  }

  function closeInfoPanel() {
    document.getElementById('info-panel').classList.remove('open');
    document.getElementById('info-backdrop').classList.remove('open');
  }

  // ===== TRACKER TAB =====
  function renderTracker(el) {
    el.innerHTML = `
      <div class="section-header" style="margin-top:8px;">Workout tracker</div>
      <div class="tracker-link-card">
        <h2>FORGE Tracker</h2>
        <p>Your detailed workout history, trends, charts, and analytics live in Google Sheets for deep review.</p>
        ${state.sheetsUrl ? `
          <button class="tracker-open-btn" onclick="window.open('${state.sheetsUrl.replace('/exec','/edit')}', '_blank')">
            <i class="ti ti-external-link"></i> Open tracker
          </button>
        ` : `
          <p style="color:var(--text-muted);font-size:12px;">Set up your Google Sheets URL in Settings to enable sync and tracking.</p>
        `}
      </div>
      ${renderRecentWorkouts()}
    `;
  }

  function renderRecentWorkouts() {
    const logs = Store.getLogs();
    const allLogs = [];
    Object.values(logs).forEach(dayLogs => {
      dayLogs.forEach(log => allLogs.push(log));
    });
    allLogs.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
    const recent = allLogs.slice(0, 10);

    if (recent.length === 0) return '<div class="empty-state"><div class="empty-state-icon">📊</div><div class="empty-state-text">Complete a workout to see history here.</div></div>';

    let html = '<div class="section-header">Recent workouts</div>';
    recent.forEach(log => {
      const date = new Date(log.completedAt).toLocaleDateString();
      const dayInfo = FORGE_DATA.cycleDays.find(d => d.id === log.dayId);
      const totalSets = log.exercises.reduce((s, e) => s + e.sets.length, 0);
      const typeClass = dayInfo && dayInfo.type === 'hypertrophy' ? 'text-cyan' : 'text-amber';
      html += `
        <div class="wo-item" style="margin-bottom:4px;">
          <div class="wo-item-info">
            <div class="wo-item-name"><span class="${typeClass}">${dayInfo ? dayInfo.name : log.dayId}</span></div>
            <div class="wo-item-detail">${date} · ${totalSets} sets</div>
          </div>
        </div>
      `;
    });
    return html;
  }

  // ===== PR TAB =====
  function renderPRs(el) {
    const prs = Store.getPRs();
    const prList = Object.values(prs).sort((a, b) => b.e1rm - a.e1rm);

    if (prList.length === 0) {
      el.innerHTML = `
        <div class="section-header" style="margin-top:8px;">Personal records</div>
        <div class="empty-state">
          <div class="empty-state-icon">🏆</div>
          <div class="empty-state-text">Complete your first workout to start tracking PRs.</div>
        </div>
      `;
      return;
    }

    el.innerHTML = `
      <div class="section-header" style="margin-top:8px;">Personal records (e1RM)</div>
      <div class="pr-list">
        ${prList.map(pr => `
          <div class="pr-item">
            <div>
              <div class="pr-item-name">${pr.name}</div>
              <div class="pr-item-detail">${pr.weight} × ${pr.reps} · ${new Date(pr.date).toLocaleDateString()}</div>
            </div>
            <div class="pr-item-value">${pr.e1rm} ${state.weightUnit}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // ===== SETTINGS TAB =====
  function renderSettings(el) {
    const settings = Store.getSettings();
    el.innerHTML = `
      <div class="section-header" style="margin-top:8px;">Settings</div>
      <div style="display:flex;flex-direction:column;gap:12px;">
        <div class="warmup-card">
          <label style="font-size:13px;color:var(--text-secondary);display:block;margin-bottom:4px;">Body weight (${state.weightUnit})</label>
          <input type="number" class="weight-input" id="settings-bw" value="${settings.bodyWeight}" inputmode="numeric" style="width:100%;">
        </div>
        <div class="warmup-card">
          <label style="font-size:13px;color:var(--text-secondary);display:block;margin-bottom:4px;">Current cycle day (1-8)</label>
          <input type="number" class="weight-input" id="settings-cycle" value="${state.cycleIndex + 1}" min="1" max="8" inputmode="numeric" style="width:100%;">
        </div>
        <div class="warmup-card">
          <label style="font-size:13px;color:var(--text-secondary);display:block;margin-bottom:4px;">Google Sheets webhook URL</label>
          <input type="url" class="weight-input" id="settings-sheets" value="${settings.sheetsUrl || ''}" placeholder="https://script.google.com/..." style="width:100%;font-size:13px;">
        </div>
        <button class="start-btn power" onclick="FORGE.saveSettings()">SAVE SETTINGS</button>
        <div style="margin-top:16px;">
          <button class="action-btn" onclick="FORGE.exportData()" style="width:100%;justify-content:center;">
            <i class="ti ti-download"></i> Export all data (JSON)
          </button>
        </div>
        <div>
        <button class="action-btn" onclick="FORGE.clearToday()" style="width:100%;justify-content:center;color:var(--amber);">
            <i class="ti ti-rotate-2"></i> Clear today's workout
          </button>
        </div>
        <div>
          <button class="action-btn" onclick="FORGE.clearData()" style="width:100%;justify-content:center;color:var(--red);">
            <i class="ti ti-trash"></i> Clear all data
          </button>
        </div>
      </div>
    `;
  }

  function saveSettings() {
    const bw = parseFloat(document.getElementById('settings-bw').value) || 180;
    const cycle = parseInt(document.getElementById('settings-cycle').value) || 1;
    const sheets = document.getElementById('settings-sheets').value || '';

    state.bodyWeight = bw;
    state.cycleIndex = Math.max(0, Math.min(7, cycle - 1));
    state.sheetsUrl = sheets;

    Store.saveSettings({
      bodyWeight: bw,
      cycleIndex: state.cycleIndex,
      weightUnit: state.weightUnit,
      sheetsUrl: sheets
    });

    alert('Settings saved.');
    renderTab('home');
  }

  function exportData() {
    const data = {
      logs: Store.getLogs(),
      prs: Store.getPRs(),
      settings: Store.getSettings(),
      completedDays: Store.getCompletedDays()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `forge-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function clearToday() {
    const today = new Date().toISOString().split('T')[0];
    const completed = Store.getCompletedDays();
    const todayEntry = completed.find(c => c.date === today);

    if (!todayEntry) {
      alert('No workout logged today.');
      return;
    }

    if (confirm('Clear today\'s workout? This removes the log and rolls back your cycle position.')) {
      // Remove from completed days
      const filtered = completed.filter(c => c.date !== today);
      Store.set('completedDays', filtered);

      // Remove from logs
      const logs = Store.getLogs();
      if (logs[todayEntry.dayId]) {
        logs[todayEntry.dayId] = logs[todayEntry.dayId].filter(
          log => !log.completedAt || !log.completedAt.startsWith(today)
        );
        if (logs[todayEntry.dayId].length === 0) delete logs[todayEntry.dayId];
        Store.saveLogs(logs);
      }

      // Roll back cycle index
      state.cycleIndex = (state.cycleIndex + 7) % 8;
      const settings = Store.getSettings();
      settings.cycleIndex = state.cycleIndex;
      Store.saveSettings(settings);

      // Clear any active workout
      resetWorkoutState();
      renderTab('home');
    }
  }
  
  function clearData() {
    if (confirm('This will delete ALL workout data, PRs, and settings. Are you sure?')) {
      if (confirm('Really? This cannot be undone.')) {
        localStorage.clear();
        state.cycleIndex = 0;
        renderTab('home');
      }
    }
  }

  // ===== PUBLIC API =====
  window.FORGE = {
    startWorkout,
    skipRestDay,
    goToWarmup,
    goToExercise,
    warmupDone,
    backToOverview,
    skipExercise,
    saveSet,
    finishExercise,
    completeWorkout,
    endWorkout,
    finishAndGoHome,
    showInfo,
    toggleTimer: toggleTimer,
    adjWeight,
    setBWMode,
    saveSettings,
    exportData,
    clearData
  };

  // ===== BOOT =====
  document.addEventListener('DOMContentLoaded', init);

})();
