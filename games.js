/**
 * NEON CARNIVAL // PLAYABLE FRIV-STYLE HARDCORE ARCADE ENGINE
 * 15 Playable Cabinet Mini-Games (+ Lucky Wheel on Main Stage = 16 Total):
 * Hardcore challenge tuning with real hazards, tight timings, and risk/reward!
 */

const MiniGamesArcade = {
  currentGame: null,
  playerMode: '1p', // '1p' | '2p'
  isOpen: false,
  isRoundActive: false,
  rafId: null,
  intervals: [],
  timeouts: [],
  cleanupFns: [],

  modal: null,
  canvas: null,
  ctx: null,
  domStage: null,
  controlsBar: null,
  overlay: null,

  init() {
    this.modal = document.getElementById('arcade-cabinet-modal');
    this.canvas = document.getElementById('arcade-canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.domStage = document.getElementById('arcade-dom-stage');
    this.controlsBar = document.getElementById('arcade-controls-bar');
    this.overlay = document.getElementById('arcade-stage-overlay');

    document.getElementById('btn-close-cabinet')?.addEventListener('click', () => this.close());
    this.modal?.addEventListener('click', (e) => {
      if (e.target === this.modal) this.close();
    });

    document.getElementById('btn-cabinet-start')?.addEventListener('click', () => {
      this.startRound();
    });

    document.getElementById('btn-cabinet-back')?.addEventListener('click', () => {
      this.close();
    });

    document.getElementById('btn-mode-1p')?.addEventListener('click', () => {
      ArcadeAudio.playClick();
      this.setPlayerMode('1p');
    });
    document.getElementById('btn-mode-2p')?.addEventListener('click', () => {
      ArcadeAudio.playClick();
      this.setPlayerMode('2p');
    });
  },

  setPlayerMode(mode) {
    this.playerMode = mode === '2p' ? '2p' : '1p';
    const b1 = document.getElementById('btn-mode-1p');
    const b2 = document.getElementById('btn-mode-2p');
    const activeCls = 'px-3.5 py-2 rounded-lg text-xs font-display font-bold transition-all bg-cyan-500/20 text-cyan-300 border border-cyan-400/50';
    const active2pCls = 'px-3.5 py-2 rounded-lg text-xs font-display font-bold transition-all bg-purple-500/25 text-purple-200 border border-purple-400/60';
    const idleCls = 'px-3.5 py-2 rounded-lg text-xs font-display font-bold transition-all text-slate-400 hover:text-white border border-transparent';

    if (b1 && b2) {
      b1.className = this.playerMode === '1p' ? activeCls : idleCls;
      b2.className = this.playerMode === '2p' ? active2pCls : idleCls;
    }
  },

  open(game) {
    if (!this.modal || !game) return;
    this.clearRuntime();
    this.currentGame = game;
    this.setPlayerMode('1p');
    this.isOpen = true;
    this.isRoundActive = false;

    document.getElementById('cabinet-icon').textContent = game.icon;
    document.getElementById('cabinet-title').textContent = game.title;
    document.getElementById('cabinet-badge').textContent = game.badge;
    document.getElementById('cabinet-cost-pill').textContent = `${game.tokenCost} Tokens / Round`;

    const diffEl = document.getElementById('cabinet-difficulty');
    if (diffEl) {
      const diff = game.difficulty || 'HARD';
      diffEl.textContent = `💀 ${diff}`;
      diffEl.className =
        diff === 'INSANE'
          ? 'px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-400/50'
          : diff === 'EXTREME'
          ? 'px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40'
          : 'px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40';
    }

    this.setHud({ scoreLabel: 'Tickets Won', scoreVal: '0', infoLabel: 'Difficulty', infoVal: game.difficulty || 'HARD' });

    this.showOverlay({
      title: game.title.toUpperCase(),
      subtitle: game.description,
      rewardText: '',
      btnText: `INSERT ${game.tokenCost} TOKENS & PLAY`,
      showBack: false
    });

    this.prepareGameIdleView(game.id);
    this.modal.classList.remove('hidden');
    this.modal.classList.add('flex');
  },

  close() {
    if (!this.modal) return;
    this.clearRuntime();
    this.isOpen = false;
    this.isRoundActive = false;
    this.modal.classList.add('hidden');
    this.modal.classList.remove('flex');
  },

  clearRuntime() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.intervals.forEach((id) => clearInterval(id));
    this.timeouts.forEach((id) => clearTimeout(id));
    this.intervals = [];
    this.timeouts = [];
    this.cleanupFns.forEach((fn) => {
      try { fn(); } catch (_) {}
    });
    this.cleanupFns = [];
    if (this.controlsBar) this.controlsBar.innerHTML = '';
  },

  setHud({ scoreLabel, scoreVal, infoLabel, infoVal }) {
    if (scoreLabel !== undefined) document.getElementById('cabinet-hud-score-label').textContent = scoreLabel;
    if (scoreVal !== undefined) document.getElementById('cabinet-hud-score').textContent = scoreVal;
    if (infoLabel !== undefined) document.getElementById('cabinet-hud-info-label').textContent = infoLabel;
    if (infoVal !== undefined) document.getElementById('cabinet-hud-info').textContent = infoVal;
  },

  showOverlay({ title, subtitle, rewardText, btnText, showBack = false }) {
    if (!this.overlay) return;
    document.getElementById('overlay-title').textContent = title;
    document.getElementById('overlay-subtitle').textContent = subtitle;
    const rewardBox = document.getElementById('overlay-reward-box');
    const rewardVal = document.getElementById('overlay-reward-val');
    if (rewardText) {
      rewardBox.classList.remove('hidden');
      rewardVal.textContent = rewardText;
    } else {
      rewardBox.classList.add('hidden');
    }
    document.getElementById('btn-cabinet-start').textContent = btnText;
    const backBtn = document.getElementById('btn-cabinet-back');
    if (showBack) backBtn.classList.remove('hidden');
    else backBtn.classList.add('hidden');

    const modeSelector = document.getElementById('overlay-mode-selector');
    if (modeSelector) {
      if (this.currentGame?.supportsTwoPlayer) {
        modeSelector.classList.remove('hidden');
        modeSelector.classList.add('flex');
      } else {
        modeSelector.classList.add('hidden');
        modeSelector.classList.remove('flex');
      }
    }

    this.overlay.classList.remove('hidden');
    this.overlay.classList.add('flex');
  },

  hideOverlay() {
    if (!this.overlay) return;
    this.overlay.classList.add('hidden');
    this.overlay.classList.remove('flex');
  },

  useCanvasMode(w, h) {
    if (this.domStage) {
      this.domStage.classList.add('hidden');
      this.domStage.innerHTML = '';
    }
    if (this.canvas) {
      this.canvas.classList.remove('hidden');
      this.canvas.width = w;
      this.canvas.height = h;
      this.canvas.style.aspectRatio = `${w} / ${h}`;
    }
  },

  useDomMode() {
    if (this.canvas) this.canvas.classList.add('hidden');
    if (this.domStage) this.domStage.classList.remove('hidden');
  },

  prepareGameIdleView(gameId) {
    const domGames = new Set([
      'mystery-box',
      'reflex-grid',
      'whack-glitch',
      'memory-matrix',
      'minesweeper-mini',
      'math-blitz',
      'reaction-duel',
      'connect-four',
      'tic-tac-toe-4x4',
      '2048-neon'
    ]);
    if (domGames.has(gameId)) {
      this.useDomMode();
      this.domStage.innerHTML = `
        <div class="text-center py-12 px-4">
          <div class="text-5xl mb-3">${this.currentGame?.icon || '🎮'}</div>
          <p class="text-xs font-mono-num text-cyan-300 uppercase tracking-widest">Arcade Challenge Ready</p>
        </div>`;
      return;
    }

    const dims = {
      'pinball-bounce': [420, 500],
      'coin-drop': [440, 480],
      'cyber-claw': [440, 460],
      'neon-skeeball': [400, 500],
      'ring-toss': [440, 460],
      'laser-duck': [460, 420],
      'cyber-flap': [420, 460],
      'snake-rush': [420, 420],
      'brick-breaker': [440, 460],
      'meteor-dodge': [440, 460],
      'tower-stack': [420, 460],
      'cyber-dash': [460, 360],
      'space-invaders': [440, 460],
      'fruit-slash': [440, 440],
      'pong-duel': [460, 360],
      'typing-storm': [440, 440],
      'gravity-flip': [460, 360],
      'paddle-keepup': [420, 460],
      'color-catch': [440, 460],
      'laser-maze': [440, 460],
      'crossy-neon': [420, 440],
      'asteroid-turret': [440, 440],
      'balloon-pop': [440, 460],
      'orbit-jump': [420, 420],
      'air-hockey': [400, 480],
      'tank-duel': [460, 400],
      'tug-of-war': [460, 320],
      'sumo-bumpers': [440, 440],
      'tron-cycles': [440, 440],
      'tetris-mini': [320, 480],
      'simon-rhythm': [400, 460]
    }[gameId] || [440, 460];

    this.useCanvasMode(dims[0], dims[1]);
    const ctx = this.ctx;
    if (!ctx) return;
    ctx.fillStyle = '#060913';
    ctx.fillRect(0, 0, dims[0], dims[1]);
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < dims[0]; x += 28) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, dims[1]); ctx.stroke(); }
    for (let y = 0; y < dims[1]; y += 28) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(dims[0], y); ctx.stroke(); }
  },

  startRound() {
    const game = this.currentGame;
    if (!game) return;

    if (ArcadeState.tokens < game.tokenCost) {
      ArcadeAudio.playError();
      showToast('Token tidak cukup! Klik "+FREE" di bar atas untuk isi ulang +250 Token.', 'amber');
      return;
    }

    this.clearRuntime();
    ArcadeAudio.playCoinInsert();
    updateBalances(-game.tokenCost, 0);
    this.isRoundActive = true;
    this.hideOverlay();

    const runners = {
      'pinball-bounce': () => this.runPinball(),
      'mystery-box': () => this.runMysteryBox(),
      'coin-drop': () => this.runCoinDrop(),
      'cyber-claw': () => this.runCyberClaw(),
      'neon-skeeball': () => this.runSkeeBall(),
      'ring-toss': () => this.runRingToss(),
      'laser-duck': () => this.runLaserDuck(),
      'cyber-flap': () => this.runCyberFlap(),
      'snake-rush': () => this.runSnakeRush(),
      'brick-breaker': () => this.runBrickBreaker(),
      'meteor-dodge': () => this.runMeteorDodge(),
      'reflex-grid': () => this.runReflexGrid(),
      'tower-stack': () => this.runTowerStack(),
      'whack-glitch': () => this.runWhackGlitch(),
      'cyber-dash': () => this.runCyberDash(),
      'space-invaders': () => this.runSpaceInvaders(),
      'memory-matrix': () => this.runMemoryMatrix(),
      'fruit-slash': () => this.runFruitSlash(),
      'pong-duel': () => this.runPongDuel(),
      'minesweeper-mini': () => this.runMinesweeperMini(),
      'math-blitz': () => this.runMathBlitz(),
      'typing-storm': () => this.runTypingStorm(),
      'gravity-flip': () => this.runGravityFlip(),
      'paddle-keepup': () => this.runPaddleKeepup(),
      'color-catch': () => this.runColorCatch(),
      'laser-maze': () => this.runLaserMaze(),
      'crossy-neon': () => this.runCrossyNeon(),
      'asteroid-turret': () => this.runAsteroidTurret(),
      'reaction-duel': () => this.runReactionDuel(),
      'balloon-pop': () => this.runBalloonPop(),
      'orbit-jump': () => this.runOrbitJump(),
      'air-hockey': () => this.runAirHockey(),
      'tank-duel': () => this.runTankDuel(),
      'tug-of-war': () => this.runTugOfWar(),
      'sumo-bumpers': () => this.runSumoBumpers(),
      'connect-four': () => this.runConnectFour(),
      'tic-tac-toe-4x4': () => this.runTicTacToeBlitz(),
      'tron-cycles': () => this.runTronCycles(),
      'tetris-mini': () => this.runTetrisMini(),
      '2048-neon': () => this.run2048Neon(),
      'simon-rhythm': () => this.runPianoTiles()
    };

    if (runners[game.id]) runners[game.id]();
  },

  finishRound(ticketsWon, summaryTitle, summaryDetail) {
    if (!this.isOpen) return;
    this.isRoundActive = false;
    this.clearRuntime();

    const finalTickets = Math.max(0, Math.round(ticketsWon));
    if (finalTickets > 0) {
      updateBalances(0, finalTickets);
      const isBig = finalTickets >= 200;
      ArcadeAudio.playWinFanfare(isBig);
      ConfettiEngine.burst(isBig ? 140 : 50);
      addNotification(
        `${this.currentGame.title}: +${finalTickets.toLocaleString()} Tickets!`,
        summaryDetail,
        isBig ? 'amber' : 'cyan'
      );
    } else {
      ArcadeAudio.playError();
    }

    this.showOverlay({
      title: summaryTitle,
      subtitle: summaryDetail,
      rewardText: finalTickets > 0 ? `+${finalTickets.toLocaleString()} PRIZE TICKETS` : '0 TICKETS — KALAH!',
      btnText: `TRY AGAIN (${this.currentGame.tokenCost} TOKENS)`,
      showBack: true
    });
  },

  // ==================== 1. PINBALL BOUNCE (EXTREME: 2 BALLS + BLACK HOLES) ====================
  runPinball() {
    const W = 420, H = 500;
    this.useCanvasMode(W, H);
    const ctx = this.ctx;

    let ballsLeft = 2;
    let rawPoints = 0;
    let combo = 1;
    let ballActive = false;

    const ball = { x: 210, y: 65, vx: 0, vy: 0, r: 9 };
    const bumpers = [
      { x: 120, y: 140, r: 19, pts: 15, color: '#22d3ee', flash: 0 },
      { x: 300, y: 140, r: 19, pts: 15, color: '#22d3ee', flash: 0 },
      { x: 210, y: 175, r: 22, pts: 35, color: '#fbbf24', flash: 0 },
      { x: 135, y: 260, r: 17, pts: 20, color: '#c084fc', flash: 0 },
      { x: 285, y: 260, r: 17, pts: 20, color: '#c084fc', flash: 0 }
    ];
    // Black hole hazard that resets combo and slams ball down
    const hazards = [
      { x: 210, y: 295, r: 17, pulse: 0 }
    ];

    const leftFlipper = { px: 108, py: 452, len: 72, restAngle: 0.48, activeAngle: -0.48, angle: 0.48, pressed: false };
    const rightFlipper = { px: 312, py: 452, len: 72, restAngle: Math.PI - 0.48, activeAngle: Math.PI + 0.48, angle: Math.PI - 0.48, pressed: false };
    const sparks = [];

    const updateHud = () => {
      this.setHud({
        scoreLabel: `Score (${combo}x) [Min 100]`,
        scoreVal: rawPoints.toLocaleString(),
        infoLabel: 'Balls Left',
        infoVal: '●'.repeat(ballsLeft) + '○'.repeat(2 - ballsLeft)
      });
    };
    updateHud();

    const launchBall = () => {
      if (ballActive || ballsLeft <= 0) return;
      ballActive = true;
      ball.x = 170 + Math.random() * 80;
      ball.y = 46;
      ball.vx = (Math.random() - 0.5) * 6;
      ball.vy = 2;
      combo = 1;
      ArcadeAudio.playLaser();
      updateHud();
    };

    this.controlsBar.innerHTML = `
      <div class="flex items-center justify-between gap-2 w-full">
        <button id="pb-left" class="flex-1 py-3 rounded-xl bg-slate-900 active:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-display font-bold text-xs uppercase select-none">◀ Left (A/←)</button>
        <button id="pb-launch" class="px-4 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-display font-black text-xs uppercase select-none">Launch</button>
        <button id="pb-right" class="flex-1 py-3 rounded-xl bg-slate-900 active:bg-purple-500/30 border border-purple-500/40 text-purple-300 font-display font-bold text-xs uppercase select-none">Right (D/→) ▶</button>
      </div>
    `;

    const bindHold = (el, onDown, onUp) => {
      if (!el) return;
      el.addEventListener('pointerdown', (e) => { e.preventDefault(); onDown(); });
      el.addEventListener('pointerup', onUp);
      el.addEventListener('pointerleave', onUp);
      el.addEventListener('pointercancel', onUp);
    };
    bindHold(document.getElementById('pb-left'), () => (leftFlipper.pressed = true), () => (leftFlipper.pressed = false));
    bindHold(document.getElementById('pb-right'), () => (rightFlipper.pressed = true), () => (rightFlipper.pressed = false));
    document.getElementById('pb-launch')?.addEventListener('click', launchBall);

    const onKeyDown = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') { e.preventDefault(); leftFlipper.pressed = true; }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') { e.preventDefault(); rightFlipper.pressed = true; }
      if (e.code === 'Space') { e.preventDefault(); launchBall(); }
    };
    const onKeyUp = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') leftFlipper.pressed = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') rightFlipper.pressed = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    this.cleanupFns.push(() => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    });

    const collideSegment = (x1, y1, x2, y2, boost = 0) => {
      const dx = x2 - x1, dy = y2 - y1;
      const lenSq = dx * dx + dy * dy;
      let t = ((ball.x - x1) * dx + (ball.y - y1) * dy) / lenSq;
      t = Math.max(0, Math.min(1, t));
      const cx = x1 + t * dx, cy = y1 + t * dy;
      const distX = ball.x - cx, distY = ball.y - cy;
      const dist = Math.hypot(distX, distY);
      const minDist = ball.r + 5;
      if (dist < minDist && dist > 0.0001) {
        const nx = distX / dist, ny = distY / dist;
        ball.x = cx + nx * minDist;
        ball.y = cy + ny * minDist;
        const dot = ball.vx * nx + ball.vy * ny;
        if (dot < 0) {
          ball.vx -= 1.82 * dot * nx;
          ball.vy -= 1.82 * dot * ny;
          if (boost > 0) {
            ball.vx += nx * boost * t;
            ball.vy += ny * boost * t;
            ArcadeAudio.playBounce();
          }
        }
      }
    };

    this.timeouts.push(setTimeout(launchBall, 300));

    const loop = () => {
      if (!this.isRoundActive) return;

      const prevL = leftFlipper.angle;
      const prevR = rightFlipper.angle;
      leftFlipper.angle += ((leftFlipper.pressed ? leftFlipper.activeAngle : leftFlipper.restAngle) - leftFlipper.angle) * 0.45;
      rightFlipper.angle += ((rightFlipper.pressed ? rightFlipper.activeAngle : rightFlipper.restAngle) - rightFlipper.angle) * 0.45;
      const lVel = Math.abs(leftFlipper.angle - prevL);
      const rVel = Math.abs(rightFlipper.angle - prevR);

      if (ballActive) {
        for (let step = 0; step < 3; step++) {
          ball.vy += 0.082; // Balanced progressive gravity
          ball.x += ball.vx / 3;
          ball.y += ball.vy / 3;

          if (ball.x - ball.r < 18) { ball.x = 18 + ball.r; ball.vx = Math.abs(ball.vx) * 0.85; }
          if (ball.x + ball.r > W - 18) { ball.x = W - 18 - ball.r; ball.vx = -Math.abs(ball.vx) * 0.85; }
          if (ball.y - ball.r < 18) { ball.y = 18 + ball.r; ball.vy = Math.abs(ball.vy) * 0.85; }

          collideSegment(18, 80, 75, 18);
          collideSegment(W - 18, 80, W - 75, 18);
          collideSegment(18, 398, 108, 452);
          collideSegment(W - 18, 398, 312, 452);

          const lx2 = leftFlipper.px + Math.cos(leftFlipper.angle) * leftFlipper.len;
          const ly2 = leftFlipper.py + Math.sin(leftFlipper.angle) * leftFlipper.len;
          collideSegment(leftFlipper.px, leftFlipper.py, lx2, ly2, leftFlipper.pressed && lVel > 0.02 ? 10.5 : 0.5);

          const rx2 = rightFlipper.px + Math.cos(rightFlipper.angle) * rightFlipper.len;
          const ry2 = rightFlipper.py + Math.sin(rightFlipper.angle) * rightFlipper.len;
          collideSegment(rightFlipper.px, rightFlipper.py, rx2, ry2, rightFlipper.pressed && rVel > 0.02 ? 10.5 : 0.5);

          for (const b of bumpers) {
            const dx = ball.x - b.x, dy = ball.y - b.y;
            const dist = Math.hypot(dx, dy);
            if (dist < ball.r + b.r && dist > 0.001) {
              const nx = dx / dist, ny = dy / dist;
              ball.x = b.x + nx * (ball.r + b.r + 1);
              ball.y = b.y + ny * (ball.r + b.r + 1);
              ball.vx = nx * 8.2;
              ball.vy = ny * 8.2;
              b.flash = 1;
              rawPoints += b.pts * combo;
              combo = Math.min(4, combo + 1);
              ArcadeAudio.playBounce();
              updateHud();
              for (let s = 0; s < 6; s++) sparks.push({ x: b.x, y: b.y, vx: (Math.random() - 0.5) * 6, vy: (Math.random() - 0.5) * 6, life: 1, color: b.color });
            }
          }

          // Black hole hazard
          for (const h of hazards) {
            const dx = ball.x - h.x, dy = ball.y - h.y;
            if (Math.hypot(dx, dy) < ball.r + h.r) {
              h.pulse = 1;
              combo = 1;
              rawPoints = Math.max(0, rawPoints - 25);
              ball.y = h.y + h.r + ball.r + 4;
              ball.vy = 8.5;
              ball.vx = (Math.random() - 0.5) * 4;
              ArcadeAudio.playError();
              updateHud();
            }
          }
        }

        const spd = Math.hypot(ball.vx, ball.vy);
        if (spd > 15) { ball.vx = (ball.vx / spd) * 15; ball.vy = (ball.vy / spd) * 15; }

        if (ball.y > H + 18) {
          ballActive = false;
          ballsLeft -= 1;
          ArcadeAudio.playError();
          updateHud();
          if (ballsLeft <= 0) {
            const won = rawPoints >= 100 ? rawPoints : Math.floor(rawPoints * 0.25);
            this.finishRound(
              won,
              rawPoints >= 100 ? 'PINBALL SURVIVOR!' : 'PINBALL DRAINED!',
              rawPoints >= 100
                ? `Skor ${rawPoints} lolos target minimum! Kamu menang ${won} Prize Tickets!`
                : `Skor ${rawPoints} di bawah target minimum (100)! Penalti berlaku, dapat ${won} Tickets.`
            );
            return;
          }
        }
      }

      ctx.fillStyle = '#060913';
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(18, 398); ctx.lineTo(18, 80); ctx.lineTo(75, 18);
      ctx.lineTo(W - 75, 18); ctx.lineTo(W - 18, 80); ctx.lineTo(W - 18, 398);
      ctx.stroke();

      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(18, 398); ctx.lineTo(108, 452);
      ctx.moveTo(W - 18, 398); ctx.lineTo(312, 452);
      ctx.stroke();

      // Hazard Black Hole
      for (const h of hazards) {
        if (h.pulse > 0) h.pulse = Math.max(0, h.pulse - 0.06);
        ctx.save();
        ctx.beginPath();
        ctx.arc(h.x, h.y, h.r + h.pulse * 6, 0, Math.PI * 2);
        ctx.fillStyle = '#450a0a';
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#f43f5e';
        ctx.shadowBlur = 16;
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#fda4af';
        ctx.font = 'bold 10px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('VOID', h.x, h.y + 3);
        ctx.restore();
      }

      for (const b of bumpers) {
        if (b.flash > 0) b.flash = Math.max(0, b.flash - 0.08);
        ctx.save();
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r + b.flash * 5, 0, Math.PI * 2);
        ctx.fillStyle = b.flash > 0.2 ? b.color : '#0f172a';
        ctx.strokeStyle = b.color;
        ctx.lineWidth = 3;
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = b.flash > 0.2 ? '#000' : '#fff';
        ctx.font = 'bold 11px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`+${b.pts}`, b.x, b.y);
        ctx.restore();
      }

      const drawFlipper = (f, color) => {
        const x2 = f.px + Math.cos(f.angle) * f.len;
        const y2 = f.py + Math.sin(f.angle) * f.len;
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineWidth = 11;
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(f.px, f.py);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.restore();
      };
      drawFlipper(leftFlipper, '#22d3ee');
      drawFlipper(rightFlipper, '#c084fc');

      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx; s.y += s.vy; s.life -= 0.07;
        if (s.life <= 0) { sparks.splice(i, 1); continue; }
        ctx.fillStyle = s.color;
        ctx.fillRect(s.x, s.y, 4, 4);
      }

      if (ballActive) {
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
        ctx.fillStyle = '#67e8f9';
        ctx.fill();
      } else {
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 13px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('PRESS SPACE / LAUNCH!', W / 2, 360);
      }

      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  },

  // ==================== 2. MYSTERY BOX (HARD: 2 SKULL BOMBS + CASH OUT) ====================
  runMysteryBox() {
    this.useDomMode();
    let bankedTickets = 0;
    let openedCount = 0;
    let finished = false;

    const prizePool = [
      { label: '600 TIX', sub: 'MEGA KEY', value: 600, type: 'jackpot', icon: '👑', color: 'border-amber-400 bg-amber-500/20 text-amber-300 glow-amber' },
      { label: '220 TIX', sub: 'RARE GEM', value: 220, type: 'high', icon: '💎', color: 'border-cyan-400 bg-cyan-500/20 text-cyan-300 glow-cyan' },
      { label: '120 TIX', sub: 'NEON CORE', value: 120, type: 'mid', icon: '🔮', color: 'border-purple-400 bg-purple-500/20 text-purple-300' },
      { label: '70 TIX', sub: 'STAR CHIP', value: 70, type: 'low', icon: '⭐', color: 'border-slate-500 bg-slate-800/80 text-slate-200' },
      { label: 'BOMB!', sub: 'WIPEOUT', value: 0, type: 'bomb', icon: '💀', color: 'border-rose-500 bg-rose-500/25 text-rose-300' },
      { label: 'BOMB!', sub: 'WIPEOUT', value: 0, type: 'bomb', icon: '💣', color: 'border-rose-500 bg-rose-500/25 text-rose-300' }
    ].sort(() => Math.random() - 0.5);

    const opened = new Array(6).fill(false);

    const updateHud = () => {
      this.setHud({
        scoreLabel: 'At-Risk Tickets',
        scoreVal: bankedTickets.toLocaleString(),
        infoLabel: 'Bombs Hidden',
        infoVal: '2 💀 in 6'
      });
    };
    updateHud();

    this.controlsBar.innerHTML = `
      <div class="flex items-center justify-between gap-3 w-full">
        <span class="text-xs text-slate-300">Buka kotak aman atau amankan tiket sebelum kena Bom!</span>
        <button id="mb-cashout" disabled class="px-5 py-2.5 rounded-xl bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-display font-black text-xs uppercase shrink-0">Cash Out (0)</button>
      </div>
    `;

    const cashBtn = document.getElementById('mb-cashout');
    cashBtn?.addEventListener('click', () => {
      if (finished || bankedTickets <= 0) return;
      finished = true;
      for (let k = 0; k < 6; k++) opened[k] = true;
      renderBoxes();
      this.timeouts.push(setTimeout(() => {
        this.finishRound(bankedTickets, 'SAFE CASH OUT!', `Keputusan cerdas! Kamu menyelamatkan ${bankedTickets.toLocaleString()} Prize Tickets sebelum meledak!`);
      }, 900));
    });

    const renderBoxes = () => {
      if (cashBtn) {
        cashBtn.disabled = finished || bankedTickets <= 0;
        cashBtn.textContent = `Cash Out (+${bankedTickets})`;
      }

      this.domStage.innerHTML = `
        <div class="grid grid-cols-3 gap-3 sm:gap-4 p-4 w-full max-w-md mx-auto">
          ${prizePool
            .map((p, i) => {
              if (opened[i]) {
                return `
                  <div class="aspect-square rounded-2xl border-2 ${p.color} flex flex-col items-center justify-center p-2 text-center animate-[bumpScale_0.35s_ease]">
                    <span class="text-2xl sm:text-3xl mb-1">${p.icon}</span>
                    <span class="font-display font-black text-xs sm:text-sm">${p.label}</span>
                    <span class="text-[9px] uppercase tracking-wider opacity-85">${p.sub}</span>
                  </div>`;
              }
              return `
                <button data-box-idx="${i}" ${finished ? 'disabled' : ''} class="mystery-crate aspect-square rounded-2xl bg-slate-900/95 hover:bg-slate-800 border-2 border-purple-500/40 hover:border-cyan-400 flex flex-col items-center justify-center gap-1.5 transition-all hover:-translate-y-1 active:scale-95 glow-purple cursor-pointer">
                  <span class="text-3xl sm:text-4xl">🎁</span>
                  <span class="font-mono-num text-[10px] text-cyan-300 font-bold">VAULT #${i + 1}</span>
                </button>`;
            })
            .join('')}
        </div>`;

      if (!finished) {
        this.domStage.querySelectorAll('.mystery-crate').forEach((btn) => {
          btn.addEventListener('click', () => {
            if (finished) return;
            const idx = parseInt(btn.getAttribute('data-box-idx'), 10);
            if (opened[idx]) return;

            opened[idx] = true;
            openedCount += 1;
            const prize = prizePool[idx];

            if (prize.type === 'bomb') {
              finished = true;
              bankedTickets = 0;
              ArcadeAudio.playError();
              updateHud();
              renderBoxes();
              this.timeouts.push(setTimeout(() => {
                for (let k = 0; k < 6; k++) opened[k] = true;
                renderBoxes();
              }, 350));
              this.timeouts.push(setTimeout(() => {
                this.finishRound(0, 'KABOOM! HANGUS!', 'Kamu membuka Bomb Tengkorak! Semua tiket di brankas ronde ini hangus!');
              }, 1300));
            } else {
              bankedTickets += prize.value;
              ArcadeAudio.playCoinInsert();
              updateHud();
              renderBoxes();
              if (openedCount >= 4) {
                finished = true;
                this.timeouts.push(setTimeout(() => {
                  for (let k = 0; k < 6; k++) opened[k] = true;
                  renderBoxes();
                }, 400));
                this.timeouts.push(setTimeout(() => {
                  this.finishRound(bankedTickets, 'ALL SAFE VAULTS CLEARED!', `Luar biasa! Kamu menghindari kedua bom & menyapu bersih ${bankedTickets.toLocaleString()} Tickets!`);
                }, 1300));
              }
            }
          });
        });
      }
    };
    renderBoxes();
  },

  // ==================== 3. COIN DROP (EXTREME: 0/PENALTY SLOTS + LASER BAR) ====================
  runCoinDrop() {
    const W = 440, H = 480;
    this.useCanvasMode(W, H);
    const ctx = this.ctx;

    let coinsLeft = 5;
    let totalTickets = 0;
    let dropperX = W / 2;
    let barPhase = 0;
    const activeCoins = [];
    const pegs = [];
    const slotValues = [-25, 0, 45, 350, 45, 0, -25];
    const slotFlashes = new Array(7).fill(0);

    for (let r = 0; r < 8; r++) {
      const cols = r % 2 === 0 ? 7 : 8;
      const offsetX = (W - (cols - 1) * 48) / 2;
      for (let c = 0; c < cols; c++) {
        pegs.push({ x: offsetX + c * 48, y: 90 + r * 38, r: 5, flash: 0 });
      }
    }

    const updateHud = () => {
      this.setHud({
        scoreLabel: 'Net Tickets',
        scoreVal: totalTickets.toLocaleString(),
        infoLabel: 'Coins Left',
        infoVal: `${coinsLeft} Coins`
      });
    };
    updateHud();

    const dropCoin = () => {
      if (coinsLeft <= 0) return;
      coinsLeft -= 1;
      activeCoins.push({ x: dropperX + (Math.random() - 0.5) * 4, y: 36, vx: (Math.random() - 0.5) * 1.2, vy: 1.6, r: 9 });
      ArcadeAudio.playClick();
      updateHud();
    };

    this.controlsBar.innerHTML = `
      <div class="flex items-center justify-between gap-2 w-full">
        <span class="text-xs text-rose-300 font-semibold">Sisi arena terbuka! Jika koin jatuh keluar arena = KALAH!</span>
        <button id="cd-drop-btn" class="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-display font-black text-xs uppercase shrink-0">Drop Coin</button>
      </div>
    `;
    document.getElementById('cd-drop-btn')?.addEventListener('click', dropCoin);

    const onPointerMove = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      dropperX = Math.max(54, Math.min(W - 54, ((e.clientX - rect.left) / rect.width) * W));
    };
    const onCanvasClick = (e) => { onPointerMove(e); dropCoin(); };
    const onKeyDown = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') dropperX = Math.max(54, dropperX - 22);
      if (e.key === 'ArrowRight' || e.key === 'd') dropperX = Math.min(W - 54, dropperX + 22);
      if (e.code === 'Space') { e.preventDefault(); dropCoin(); }
    };
    this.canvas.addEventListener('pointermove', onPointerMove);
    this.canvas.addEventListener('click', onCanvasClick);
    window.addEventListener('keydown', onKeyDown);
    this.cleanupFns.push(() => {
      this.canvas.removeEventListener('pointermove', onPointerMove);
      this.canvas.removeEventListener('click', onCanvasClick);
      window.removeEventListener('keydown', onKeyDown);
    });

    const arenaLeft = 36;
    const arenaRight = W - 36;
    const slotWidth = (arenaRight - arenaLeft) / 7;

    const loop = () => {
      if (!this.isRoundActive) return;
      barPhase += 0.025 + (5 - coinsLeft) * 0.005;
      const barX = W / 2 + Math.sin(barPhase) * 95;
      const barY = 235;
      const barW = 68;

      for (let i = activeCoins.length - 1; i >= 0; i--) {
        const c = activeCoins[i];
        c.vy += 0.27;
        c.vx *= 0.994;
        c.x += c.vx;
        c.y += c.vy;

        // Top guardrails only (y < 120); below y = 120 sides are OPEN!
        if (c.y < 120) {
          if (c.x - c.r < arenaLeft) { c.x = arenaLeft + c.r; c.vx = Math.abs(c.vx) * 0.7; }
          if (c.x + c.r > arenaRight) { c.x = arenaRight - c.r; c.vx = -Math.abs(c.vx) * 0.7; }
        }

        // Check if coin fell out of the left/right arena bounds -> INSTANT LOSS!
        if (c.x < arenaLeft - 14 || c.x > arenaRight + 14) {
          ArcadeAudio.playError();
          this.finishRound(
            0,
            'OUT OF ARENA — KALAH!',
            'Koin/bola keluar dari sisi arena! Seluruh hadiah ronde ini hangus (0 Tickets).'
          );
          return;
        }

        // Moving deflector bar
        if (c.x > barX - barW / 2 - c.r && c.x < barX + barW / 2 + c.r && Math.abs(c.y - barY) < c.r + 5) {
          c.y = c.y < barY ? barY - c.r - 5 : barY + c.r + 5;
          c.vy = -Math.abs(c.vy) * 0.65;
          c.vx += Math.cos(barPhase) * 3.8;
          ArcadeAudio.playLaser();
        }

        for (const p of pegs) {
          const dx = c.x - p.x, dy = c.y - p.y;
          const dist = Math.hypot(dx, dy);
          if (dist < c.r + p.r && dist > 0.001) {
            const nx = dx / dist, ny = dy / dist;
            c.x = p.x + nx * (c.r + p.r + 0.5);
            c.y = p.y + ny * (c.r + p.r + 0.5);
            const dot = c.vx * nx + c.vy * ny;
            if (dot < 0) {
              c.vx -= 1.65 * dot * nx;
              c.vy -= 1.65 * dot * ny;
              c.vx += (Math.random() - 0.5) * 1.25;
              p.flash = 1;
              ArcadeAudio.playTick(0.5);
            }
          }
        }

        if (c.y >= H - 44) {
          if (c.x < arenaLeft || c.x > arenaRight) {
            ArcadeAudio.playError();
            this.finishRound(
              0,
              'OUT OF ARENA — KALAH!',
              'Koin jatuh melewati luar batas slot! Seluruh hadiah ronde ini hangus.'
            );
            return;
          }
          const slotIdx = Math.max(0, Math.min(6, Math.floor((c.x - arenaLeft) / slotWidth)));
          const won = slotValues[slotIdx];
          totalTickets = Math.max(0, totalTickets + won);
          slotFlashes[slotIdx] = 1;
          if (won > 0) ArcadeAudio.playCoinInsert();
          else ArcadeAudio.playError();
          activeCoins.splice(i, 1);
          updateHud();

          if (coinsLeft === 0 && activeCoins.length === 0) {
            this.timeouts.push(setTimeout(() => {
              this.finishRound(totalTickets, 'COIN DROP COMPLETE!', `Hasil bersih 5 koinmu: ${totalTickets.toLocaleString()} Prize Tickets!`);
            }, 450));
          }
        }
      }

      ctx.fillStyle = '#060913';
      ctx.fillRect(0, 0, W, H);

      // Draw Void Zones on Left & Right Edges
      ctx.fillStyle = 'rgba(244, 63, 94, 0.14)';
      ctx.fillRect(0, 120, arenaLeft - 8, H - 120);
      ctx.fillRect(arenaRight + 8, 120, W - (arenaRight + 8), H - 120);

      // Top Guardrails
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(arenaLeft, 24); ctx.lineTo(arenaLeft, 120);
      ctx.moveTo(arenaRight, 24); ctx.lineTo(arenaRight, 120);
      ctx.stroke();

      // Open Danger Out-of-Bounds Dashed Lines
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.7)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(arenaLeft - 8, 120); ctx.lineTo(arenaLeft - 8, H);
      ctx.moveTo(arenaRight + 8, 120); ctx.lineTo(arenaRight + 8, H);
      ctx.stroke();
      ctx.setLineDash([]);

      if (coinsLeft > 0) {
        ctx.beginPath(); ctx.arc(dropperX, 34, 10, 0, Math.PI * 2);
        ctx.fillStyle = '#fbbf24'; ctx.fill();
      }

      // Deflector Bar
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(barX - barW / 2, barY - 4, barW, 8);

      for (const p of pegs) {
        if (p.flash > 0) p.flash = Math.max(0, p.flash - 0.08);
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.flash > 0.2 ? '#fbbf24' : '#22d3ee';
        ctx.fill();
      }

      for (let s = 0; s < 7; s++) {
        if (slotFlashes[s] > 0) slotFlashes[s] = Math.max(0, slotFlashes[s] - 0.05);
        const sx = arenaLeft + s * slotWidth;
        const val = slotValues[s];
        ctx.fillStyle = val < 0 ? 'rgba(244, 63, 94, 0.22)' : val === 350 ? 'rgba(251, 191, 36, 0.22)' : 'rgba(15, 23, 42, 0.9)';
        ctx.strokeStyle = val < 0 ? '#f43f5e' : val === 350 ? '#fbbf24' : '#334155';
        ctx.lineWidth = 2;
        ctx.fillRect(sx + 2, H - 50, slotWidth - 4, 42);
        ctx.strokeRect(sx + 2, H - 50, slotWidth - 4, 42);
        ctx.fillStyle = val < 0 ? '#fda4af' : val === 350 ? '#fde047' : '#67e8f9';
        ctx.font = 'bold 11px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(val, sx + slotWidth / 2, H - 25);
      }

      for (const c of activeCoins) {
        ctx.beginPath(); ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        ctx.fillStyle = '#fbbf24'; ctx.fill();
      }

      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  },

  // ==================== 4. CYBER CLAW 3000 (EXTREME: 2 TRIES + SLIP PHYSICS) ====================
  runCyberClaw() {
    const W = 440, H = 460;
    this.useCanvasMode(W, H);
    const ctx = this.ctx;

    let triesLeft = 2;
    let totalTickets = 0;
    let clawX = 220, clawY = 72;
    let clawState = 'idle';
    let moveDir = 0;
    let grabbedCap = null;
    let openAmount = 1;
    let slipTimer = 0;

    const capsules = [
      { x: 135, y: 400, r: 19, val: 60, color: '#22d3ee', icon: '💠' },
      { x: 185, y: 406, r: 18, val: 0, color: '#64748b', icon: '🪨' },
      { x: 240, y: 394, r: 21, val: 500, color: '#fbbf24', icon: '👑' },
      { x: 298, y: 405, r: 19, val: 140, color: '#c084fc', icon: '💎' },
      { x: 356, y: 400, r: 19, val: 0, color: '#64748b', icon: '🪨' },
      { x: 402, y: 404, r: 18, val: 90, color: '#34d399', icon: '⭐' }
    ];

    const updateHud = () => {
      this.setHud({
        scoreLabel: 'Tickets Won',
        scoreVal: totalTickets.toLocaleString(),
        infoLabel: 'Claw Tries',
        infoVal: `${triesLeft} Left`
      });
    };
    updateHud();

    const dropClaw = () => {
      if (clawState !== 'idle' || triesLeft <= 0) return;
      clawState = 'down';
      moveDir = 0;
      ArcadeAudio.playLaser();
    };

    this.controlsBar.innerHTML = `
      <div class="flex items-center justify-between gap-2 w-full">
        <button id="cc-left" class="flex-1 py-3 rounded-xl bg-slate-900 border border-cyan-500/40 text-cyan-300 font-display font-bold text-xs uppercase select-none">◀ Kiri</button>
        <button id="cc-drop" class="px-5 py-3 rounded-xl bg-amber-400 text-slate-950 font-display font-black text-xs uppercase select-none">Drop Claw</button>
        <button id="cc-right" class="flex-1 py-3 rounded-xl bg-slate-900 border border-cyan-500/40 text-cyan-300 font-display font-bold text-xs uppercase select-none">Kanan ▶</button>
      </div>
    `;
    const bindHold = (id, dir) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('pointerdown', (e) => { e.preventDefault(); moveDir = dir; });
      const stop = () => { if (moveDir === dir) moveDir = 0; };
      el.addEventListener('pointerup', stop);
      el.addEventListener('pointerleave', stop);
    };
    bindHold('cc-left', -1);
    bindHold('cc-right', 1);
    document.getElementById('cc-drop')?.addEventListener('click', dropClaw);

    const onKeyDown = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') moveDir = -1;
      if (e.key === 'ArrowRight' || e.key === 'd') moveDir = 1;
      if (e.code === 'Space') { e.preventDefault(); dropClaw(); }
    };
    const onKeyUp = (e) => {
      if ((e.key === 'ArrowLeft' || e.key === 'a') && moveDir === -1) moveDir = 0;
      if ((e.key === 'ArrowRight' || e.key === 'd') && moveDir === 1) moveDir = 0;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    this.cleanupFns.push(() => { window.removeEventListener('keydown', onKeyDown); window.removeEventListener('keyup', onKeyUp); });

    const loop = () => {
      if (!this.isRoundActive) return;

      if (clawState === 'idle') {
        clawX = Math.max(95, Math.min(W - 35, clawX + moveDir * 4.5));
      } else if (clawState === 'down') {
        clawY += 5.5;
        for (const cap of capsules) {
          const offset = Math.abs(clawX - cap.x);
          if (offset < cap.r + 3 && Math.abs(clawY + 18 - cap.y) < cap.r + 6) {
            grabbedCap = cap;
            // If not dead-center (< 8px), high chance it slips halfway up!
            slipTimer = offset > 8 ? 32 : 999;
            clawState = 'up';
            openAmount = 0.2;
            ArcadeAudio.playBounce();
            break;
          }
        }
        if (clawState === 'down' && clawY >= 384) { clawState = 'up'; openAmount = 0.2; }
      } else if (clawState === 'up') {
        clawY -= 4;
        if (grabbedCap) {
          slipTimer -= 1;
          if (slipTimer <= 0) {
            // Slipped and fell back!
            grabbedCap.y = 402;
            grabbedCap = null;
            openAmount = 0.9;
            ArcadeAudio.playError();
          } else {
            grabbedCap.x = clawX;
            grabbedCap.y = clawY + 24;
          }
        }
        if (clawY <= 72) {
          clawY = 72;
          clawState = grabbedCap ? 'deliver' : 'reset';
        }
      } else if (clawState === 'deliver') {
        clawX -= 4.5;
        if (grabbedCap) { grabbedCap.x = clawX; grabbedCap.y = clawY + 24; }
        if (clawX <= 52) {
          totalTickets += grabbedCap.val;
          if (grabbedCap.val > 0) ArcadeAudio.playCoinInsert();
          else ArcadeAudio.playError();
          capsules.splice(capsules.indexOf(grabbedCap), 1);
          grabbedCap = null;
          openAmount = 1;
          clawState = 'reset';
          updateHud();
        }
      } else if (clawState === 'reset') {
        triesLeft -= 1;
        clawState = 'idle';
        openAmount = 1;
        clawX = Math.max(120, clawX);
        updateHud();
        if (triesLeft <= 0) {
          this.timeouts.push(setTimeout(() => {
            this.finishRound(totalTickets, 'CLAW SESSION ENDED!', `Kamu mencapit ${totalTickets.toLocaleString()} Prize Tickets dalam 2 percobaan!`);
          }, 350));
        }
      }

      ctx.fillStyle = '#060913';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(34, 211, 238, 0.12)';
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 2;
      ctx.fillRect(16, 330, 74, 118);
      ctx.strokeRect(16, 330, 74, 118);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(92, 420, W - 108, 28);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(16, 26, W - 32, 10);

      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(clawX, 36); ctx.lineTo(clawX, clawY); ctx.stroke();
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(clawX - 12, clawY - 8, 24, 12);

      const spread = 10 + openAmount * 13;
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(clawX - 6, clawY + 4); ctx.lineTo(clawX - spread, clawY + 20); ctx.lineTo(clawX - spread + 7, clawY + 30);
      ctx.moveTo(clawX + 6, clawY + 4); ctx.lineTo(clawX + spread, clawY + 20); ctx.lineTo(clawX + spread - 7, clawY + 30);
      ctx.stroke();

      for (const cap of capsules) {
        ctx.beginPath(); ctx.arc(cap.x, cap.y, cap.r, 0, Math.PI * 2);
        ctx.fillStyle = '#0f172a'; ctx.fill();
        ctx.lineWidth = 3; ctx.strokeStyle = cap.color; ctx.stroke();
        ctx.font = '15px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(cap.icon, cap.x, cap.y - 4);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 9px JetBrains Mono, monospace';
        ctx.fillText(cap.val > 0 ? `${cap.val}` : 'BATU', cap.x, cap.y + 11);
      }

      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  },

  // ==================== 5. NEON SKEE-BALL (HARD: MOVING BLOCKER + 0 ON MISS) ====================
  runSkeeBall() {
    const W = 400, H = 500;
    this.useCanvasMode(W, H);
    const ctx = this.ctx;

    let ballsLeft = 4;
    let totalTickets = 0;
    const ball = { x: 200, y: 442, vx: 0, vy: 0, r: 13, rolling: false };
    let dragStart = null, dragCurr = null;
    let blockerPhase = 0;

    const pockets = [
      { x: 96, y: 76, r: 18, pts: 100, color: '#fbbf24', flash: 0 },
      { x: 304, y: 76, r: 18, pts: 100, color: '#fbbf24', flash: 0 },
      { x: 200, y: 122, r: 20, pts: 60, color: '#c084fc', flash: 0 },
      { x: 200, y: 122, r: 46, pts: 30, color: '#22d3ee', flash: 0 },
      { x: 200, y: 122, r: 78, pts: 15, color: '#38bdf8', flash: 0 }
    ];

    const updateHud = () => {
      this.setHud({
        scoreLabel: 'Tickets Won',
        scoreVal: totalTickets.toLocaleString(),
        infoLabel: 'Balls Left',
        infoVal: `${ballsLeft} Balls`
      });
    };
    updateHud();

    this.controlsBar.innerHTML = `<p class="text-xs text-center text-cyan-300 font-semibold">Tarik &amp; lempar bola ke ring sambil melewati palang penghalang yang bergerak!</p>`;

    const getPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      return { x: ((e.clientX - rect.left) / rect.width) * W, y: ((e.clientY - rect.top) / rect.height) * H };
    };
    const onDown = (e) => { if (!ball.rolling) { dragStart = getPos(e); dragCurr = dragStart; } };
    const onMove = (e) => { if (dragStart) dragCurr = getPos(e); };
    const onUp = () => {
      if (!dragStart || !dragCurr) return;
      const dx = dragCurr.x - dragStart.x, dy = dragCurr.y - dragStart.y;
      if (dy < -18) {
        ball.rolling = true;
        ball.vx = Math.max(-7, Math.min(7, dx * 0.09));
        ball.vy = Math.max(-16, Math.min(-7.5, dy * 0.12));
        ArcadeAudio.playLaser();
      }
      dragStart = null; dragCurr = null;
    };
    this.canvas.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    this.cleanupFns.push(() => {
      this.canvas.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    });

    const loop = () => {
      if (!this.isRoundActive) return;
      blockerPhase += 0.03 + (4 - ballsLeft) * 0.007;
      const blockerX = W / 2 + Math.sin(blockerPhase) * 110;
      const blockerY = 235;
      const blockerW = 84;

      if (ball.rolling) {
        ball.x += ball.vx;
        ball.y += ball.vy;
        ball.vx *= 0.986;
        ball.vy *= 0.98;

        if (ball.x < 34) { ball.x = 34; ball.vx = Math.abs(ball.vx); }
        if (ball.x > W - 34) { ball.x = W - 34; ball.vx = -Math.abs(ball.vx); }

        // Blocker collision bounces ball back down!
        if (ball.x > blockerX - blockerW / 2 - ball.r && ball.x < blockerX + blockerW / 2 + ball.r && Math.abs(ball.y - blockerY) < ball.r + 6) {
          ball.y = blockerY + ball.r + 7;
          ball.vy = Math.abs(ball.vy) * 0.85;
          ArcadeAudio.playError();
        }

        const speed = Math.hypot(ball.vx, ball.vy);
        if (ball.y < 195 && (speed < 3.5 || ball.y < 52)) {
          let earned = 0; // Miss = 0!
          for (const p of pockets) {
            if (Math.hypot(ball.x - p.x, ball.y - p.y) <= p.r) {
              earned = p.pts;
              p.flash = 1;
              break;
            }
          }
          totalTickets += earned;
          if (earned > 0) ArcadeAudio.playCoinInsert();
          else ArcadeAudio.playError();

          ball.rolling = false; ball.x = 200; ball.y = 442;
          ballsLeft -= 1;
          updateHud();
          if (ballsLeft <= 0) {
            this.timeouts.push(setTimeout(() => {
              this.finishRound(totalTickets, 'SKEE-BALL COMPLETE!', `Total perolehan 4 bola: ${totalTickets.toLocaleString()} Prize Tickets!`);
            }, 400));
          }
        } else if (speed < 0.7 || ball.y > H) {
          ball.rolling = false; ball.x = 200; ball.y = 442;
          ballsLeft -= 1;
          ArcadeAudio.playError();
          updateHud();
          if (ballsLeft <= 0) {
            this.timeouts.push(setTimeout(() => {
              this.finishRound(totalTickets, 'SKEE-BALL COMPLETE!', `Total perolehan 4 bola: ${totalTickets.toLocaleString()} Prize Tickets!`);
            }, 400));
          }
        }
      }

      ctx.fillStyle = '#060913';
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(192, 132, 252, 0.45)';
      ctx.lineWidth = 4;
      ctx.strokeRect(24, 20, W - 48, H - 36);

      for (let i = pockets.length - 1; i >= 0; i--) {
        const p = pockets[i];
        if (p.flash > 0) p.flash = Math.max(0, p.flash - 0.06);
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.flash > 0.1 ? p.color : 'rgba(15, 23, 42, 0.9)';
        ctx.strokeStyle = p.color; ctx.lineWidth = 3;
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#fff'; ctx.font = 'bold 10px JetBrains Mono, monospace'; ctx.textAlign = 'center';
        ctx.fillText(p.pts, p.x, p.y - (i >= 3 ? p.r - 12 : -4));
      }

      // Blocker Bar
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(blockerX - blockerW / 2, blockerY - 5, blockerW, 10);

      if (dragStart && dragCurr && !ball.rolling) {
        const dx = dragCurr.x - dragStart.x, dy = dragCurr.y - dragStart.y;
        if (dy < -10) {
          ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 3; ctx.setLineDash([6, 6]);
          ctx.beginPath(); ctx.moveTo(ball.x, ball.y); ctx.lineTo(ball.x + dx * 1.1, ball.y + dy * 1.1); ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
      ctx.fillStyle = '#22d3ee'; ctx.fill();

      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  },

  // ==================== 6. RING TOSS BLITZ (EXTREME: WIND DRIFT + TIGHT HITBOX) ====================
  runRingToss() {
    const W = 440, H = 460;
    this.useCanvasMode(W, H);
    const ctx = this.ctx;

    let ringsLeft = 6;
    let totalTickets = 0;
    let timePhase = 0;
    let wind = (Math.random() - 0.5) * 32; // Mild start, ramps up later
    let aimX = W / 2, aimY = 230;
    const flyingRings = [];
    const landedRings = [];

    const bottles = [
      { baseX: 110, y: 270, pts: 40, color: '#22d3ee' },
      { baseX: 220, y: 270, pts: 40, color: '#22d3ee' },
      { baseX: 330, y: 270, pts: 40, color: '#22d3ee' },
      { baseX: 155, y: 170, pts: 90, color: '#c084fc' },
      { baseX: 285, y: 170, pts: 90, color: '#c084fc' },
      { baseX: 220, y: 105, pts: 250, color: '#fbbf24' }
    ];

    const updateHud = () => {
      const wDir = wind > 0 ? `→ +${Math.round(wind)}` : `← ${Math.round(wind)}`;
      this.setHud({
        scoreLabel: 'Tickets Won',
        scoreVal: totalTickets.toLocaleString(),
        infoLabel: `Wind (${wDir})`,
        infoVal: `${ringsLeft} Rings`
      });
    };
    updateHud();

    this.controlsBar.innerHTML = `<p class="text-xs text-center text-amber-300 font-semibold">Perhatikan arah angin di HUD! Gelang akan terdorong angin ke kiri/kanan saat melayang.</p>`;

    const getPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      return { x: ((e.clientX - rect.left) / rect.width) * W, y: ((e.clientY - rect.top) / rect.height) * H };
    };
    const onMove = (e) => { const p = getPos(e); aimX = p.x; aimY = Math.min(340, Math.max(60, p.y)); };
    const onToss = (e) => {
      if (ringsLeft <= 0) return;
      onMove(e);
      ringsLeft -= 1;
      flyingRings.push({ startX: W / 2, startY: H - 20, targetX: aimX + wind, targetY: aimY, t: 0 });
      const windStrength = 36 + (6 - ringsLeft) * 8;
      wind = (Math.random() - 0.5) * windStrength; // Wind gets stronger each throw!
      ArcadeAudio.playLaser();
      updateHud();
    };
    this.canvas.addEventListener('pointermove', onMove);
    this.canvas.addEventListener('click', onToss);
    this.cleanupFns.push(() => { this.canvas.removeEventListener('pointermove', onMove); this.canvas.removeEventListener('click', onToss); });

    const loop = () => {
      if (!this.isRoundActive) return;
      timePhase += 0.032 + (6 - ringsLeft) * 0.007; // Smooth start, ramps up!

      bottles.forEach((b, idx) => {
        b.x = b.baseX + Math.sin(timePhase + idx * 1.3) * (idx === 5 ? 48 : 30);
      });

      for (let i = flyingRings.length - 1; i >= 0; i--) {
        const r = flyingRings[i];
        r.t += 0.055;
        if (r.t >= 1) {
          let hit = false;
          for (const b of bottles) {
            if (Math.hypot(r.targetX - b.x, r.targetY - (b.y - 12)) < 15) {
              hit = true;
              totalTickets += b.pts;
              landedRings.push({ bottle: b });
              ArcadeAudio.playCoinInsert();
              updateHud();
              break;
            }
          }
          if (!hit) ArcadeAudio.playError();
          flyingRings.splice(i, 1);

          if (ringsLeft === 0 && flyingRings.length === 0) {
            this.timeouts.push(setTimeout(() => {
              this.finishRound(totalTickets, 'RING TOSS COMPLETE!', `Skor akurasi melawan angin: ${totalTickets.toLocaleString()} Prize Tickets!`);
            }, 450));
          }
        }
      }

      ctx.fillStyle = '#060913';
      ctx.fillRect(0, 0, W, H);

      for (const b of bottles) {
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = b.color;
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.roundRect(b.x - 14, b.y - 6, 28, 40, 6); ctx.fill(); ctx.stroke();
        ctx.fillRect(b.x - 6, b.y - 24, 12, 18); ctx.strokeRect(b.x - 6, b.y - 24, 12, 18);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 10px JetBrains Mono, monospace'; ctx.textAlign = 'center';
        ctx.fillText(`+${b.pts}`, b.x, b.y + 18);
      }

      for (const lr of landedRings) {
        ctx.strokeStyle = '#fde047'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.ellipse(lr.bottle.x, lr.bottle.y - 6, 15, 6, 0, 0, Math.PI * 2); ctx.stroke();
      }

      for (const r of flyingRings) {
        const cx = r.startX + (r.targetX - r.startX) * r.t;
        const cy = r.startY + (r.targetY - r.startY) * r.t - Math.sin(r.t * Math.PI) * 70;
        ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.ellipse(cx, cy, 34 - r.t * 17, 15 - r.t * 7, 0, 0, Math.PI * 2); ctx.stroke();
      }

      ctx.strokeStyle = 'rgba(34, 211, 238, 0.75)'; ctx.lineWidth = 2; ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.ellipse(aimX, aimY, 16, 8, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);

      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  },

  // ==================== 7. LASER DUCK ALLEY (HARD: 18 AMMO LIMIT + MISS PENALTY) ====================
  runLaserDuck() {
    const W = 460, H = 420;
    this.useCanvasMode(W, H);
    const ctx = this.ctx;

    let ammo = 18;
    let totalTickets = 0;
    let combo = 0;
    const ducks = [];
    const lasers = [];
    const popups = [];

    const spawnDuck = (row) => {
      const dir = row % 2 === 0 ? 1 : -1;
      const roll = Math.random();
      const type = roll < 0.14 ? 'gold' : roll < 0.36 ? 'bomb' : roll < 0.65 ? 'purple' : 'cyan';
      const shotsFired = 18 - ammo;
      const ramp = shotsFired * 0.11;
      const specs = {
        cyan: { pts: 20, speed: 2.0 + ramp, color: '#22d3ee', icon: '🦆' },
        purple: { pts: 45, speed: 2.8 + ramp, color: '#c084fc', icon: '🦆' },
        gold: { pts: 140, speed: 3.5 + ramp, color: '#fbbf24', icon: '👑' },
        bomb: { pts: -40, speed: 2.2 + ramp, color: '#f43f5e', icon: '💣' }
      }[type];

      ducks.push({
        x: dir === 1 ? -30 : W + 30,
        y: 85 + row * 105,
        dir, type, pts: specs.pts,
        speed: specs.speed + Math.random() * 0.9,
        color: specs.color, icon: specs.icon, r: 20
      });
    };
    for (let r = 0; r < 3; r++) spawnDuck(r);

    const updateHud = () => {
      this.setHud({
        scoreLabel: `Tickets (${combo}x)`,
        scoreVal: totalTickets.toLocaleString(),
        infoLabel: 'Laser Ammo',
        infoVal: `${ammo} Shots`
      });
    };
    updateHud();

    this.controlsBar.innerHTML = `<p class="text-xs text-center text-rose-300 font-semibold">Hanya 18 amunisi! Meleset = -10 poin &amp; reset kombo, kena 💣 = -40 poin!</p>`;

    const spawnerId = setInterval(() => {
      if (ducks.length < 7) spawnDuck(Math.floor(Math.random() * 3));
    }, 520);
    this.intervals.push(spawnerId);

    const onShoot = (e) => {
      if (ammo <= 0) return;
      ammo -= 1;
      const rect = this.canvas.getBoundingClientRect();
      const mx = ((e.clientX - rect.left) / rect.width) * W;
      const my = ((e.clientY - rect.top) / rect.height) * H;
      lasers.push({ x: mx, y: my, life: 1 });
      ArcadeAudio.playLaser();

      let hitAny = false;
      for (let i = ducks.length - 1; i >= 0; i--) {
        const d = ducks[i];
        if (Math.hypot(mx - d.x, my - d.y) <= d.r + 4) {
          hitAny = true;
          if (d.type === 'bomb') {
            combo = 0;
            totalTickets = Math.max(0, totalTickets + d.pts);
            ArcadeAudio.playError();
            popups.push({ x: d.x, y: d.y, text: `${d.pts}`, color: '#f43f5e', life: 1 });
          } else {
            combo += 1;
            const gained = d.pts * (combo >= 5 ? 2 : 1);
            totalTickets += gained;
            ArcadeAudio.playCoinInsert();
            popups.push({ x: d.x, y: d.y, text: `+${gained}`, color: d.color, life: 1 });
          }
          ducks.splice(i, 1);
          break;
        }
      }
      if (!hitAny) {
        combo = 0;
        totalTickets = Math.max(0, totalTickets - 10);
        popups.push({ x: mx, y: my, text: 'MISS -10', color: '#94a3b8', life: 1 });
      }
      updateHud();

      if (ammo <= 0) {
        this.timeouts.push(setTimeout(() => {
          this.finishRound(totalTickets, 'OUT OF AMMO!', `Akurasi 18 tembakan menghasilkan ${totalTickets.toLocaleString()} Prize Tickets!`);
        }, 350));
      }
    };
    this.canvas.addEventListener('pointerdown', onShoot);
    this.cleanupFns.push(() => this.canvas.removeEventListener('pointerdown', onShoot));

    const loop = () => {
      if (!this.isRoundActive) return;
      for (let i = ducks.length - 1; i >= 0; i--) {
        const d = ducks[i];
        d.x += d.speed * d.dir;
        if (d.x < -50 || d.x > W + 50) ducks.splice(i, 1);
      }

      ctx.fillStyle = '#060913';
      ctx.fillRect(0, 0, W, H);
      for (let r = 0; r < 3; r++) {
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.25)'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(0, 109 + r * 105); ctx.lineTo(W, 109 + r * 105); ctx.stroke();
      }
      for (const d of ducks) {
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = '#0f172a'; ctx.fill();
        ctx.lineWidth = 3; ctx.strokeStyle = d.color; ctx.stroke();
        ctx.font = '17px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(d.icon, d.x, d.y - 3);
        ctx.fillStyle = d.color; ctx.font = 'bold 8px JetBrains Mono, monospace';
        ctx.fillText(d.pts > 0 ? `+${d.pts}` : `${d.pts}`, d.x, d.y + 12);
      }
      for (let i = lasers.length - 1; i >= 0; i--) {
        const l = lasers[i]; l.life -= 0.14;
        if (l.life <= 0) { lasers.splice(i, 1); continue; }
        ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(W / 2, H); ctx.lineTo(l.x, l.y); ctx.stroke();
      }
      for (let i = popups.length - 1; i >= 0; i--) {
        const p = popups[i]; p.y -= 1.2; p.life -= 0.03;
        if (p.life <= 0) { popups.splice(i, 1); continue; }
        ctx.fillStyle = p.color; ctx.font = 'bold 14px Orbitron, sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(p.text, p.x, p.y);
      }
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  },

  // ==================== 8. CYBER FLAP (PROGRESSIVE FRIV FLAPPY GAUNTLET) ====================
  runCyberFlap() {
    const W = 420, H = 460;
    this.useCanvasMode(W, H);
    const ctx = this.ctx;

    let bird = { x: 95, y: 200, vy: 0, r: 12 };
    let pipes = [];
    let passed = 0;
    let hearts = 3;
    let invuln = 0;
    let speed = 1.9;
    let pipeDist = 0;
    const TARGET = 12;

    const updateHud = () => {
      this.setHud({
        scoreLabel: `Pipes (${passed}/${TARGET})`,
        scoreVal: `${passed * 30} TIX`,
        infoLabel: 'Hearts',
        infoVal: '♥'.repeat(hearts) + '♡'.repeat(3 - hearts)
      });
    };
    updateHud();

    const flap = () => {
      if (!this.isRoundActive) return;
      bird.vy = -5.8;
      ArcadeAudio.playLaser();
    };

    this.controlsBar.innerHTML = `<button id="cf-flap" class="w-full py-3 rounded-xl bg-cyan-400 active:bg-cyan-300 text-slate-950 font-display font-black text-xs uppercase">🚀 FLAP / NAIK (Space / Klik Layar)</button>`;
    document.getElementById('cf-flap')?.addEventListener('pointerdown', (e) => { e.preventDefault(); flap(); });
    this.canvas.addEventListener('pointerdown', flap);
    const onKey = (e) => { if (e.code === 'Space' || e.key === 'ArrowUp') { e.preventDefault(); flap(); } };
    window.addEventListener('keydown', onKey);
    this.cleanupFns.push(() => {
      this.canvas.removeEventListener('pointerdown', flap);
      window.removeEventListener('keydown', onKey);
    });

    const spawnPipe = (xPos = W + 40) => {
      const rampCount = Math.max(0, passed - 3);
      const gap = Math.max(92, 144 - rampCount * 1.6); // Wide initial gap, narrows slowly
      const topH = 55 + Math.random() * (H - gap - 110);
      pipes.push({ x: xPos, w: 46, topH, gap, scored: false });
    };
    spawnPipe(W + 60);

    const loseHeart = () => {
      hearts -= 1;
      ArcadeAudio.playError();
      updateHud();
      if (hearts <= 0) {
        this.finishRound(0, 'HATI HABIS — KALAH!', `Ketiga hati habis di pipa ke-${passed + 1}! (Target ${TARGET} pipa untuk menang).`);
        return true;
      }
      invuln = 65;
      bird.y = H / 2;
      bird.vy = -2.5;
      return false;
    };

    const loop = () => {
      if (!this.isRoundActive) return;
      if (invuln > 0) invuln -= 1;
      pipeDist += speed;
      if (pipeDist >= 245) {
        pipeDist = 0;
        spawnPipe();
      }

      bird.vy += 0.26;
      bird.y += bird.vy;

      if (bird.y - bird.r < 0 || bird.y + bird.r > H) {
        if (invuln === 0) {
          if (loseHeart()) return;
        } else {
          bird.y = Math.max(bird.r, Math.min(H - bird.r, bird.y));
          bird.vy = 0;
        }
      }

      for (let i = pipes.length - 1; i >= 0; i--) {
        const p = pipes[i];
        p.x -= speed;

        if (invuln === 0 && bird.x + bird.r - 2 > p.x && bird.x - bird.r + 2 < p.x + p.w) {
          if (bird.y - bird.r + 2 < p.topH || bird.y + bird.r - 2 > p.topH + p.gap) {
            if (loseHeart()) return;
          }
        }

        if (!p.scored && p.x + p.w < bird.x) {
          p.scored = true;
          passed += 1;
          if (passed > 3) speed = Math.min(5.2, 1.9 + (passed - 3) * 0.09);
          ArcadeAudio.playCoinInsert();
          updateHud();
          if (passed >= TARGET) {
            this.finishRound(360, 'CYBER FLAP CLEARED!', `Berhasil melewati ${TARGET} gerbang laser dengan ${hearts} hati tersisa (+360 Tickets)!`);
            return;
          }
        }
        if (p.x + p.w < -20) pipes.splice(i, 1);
      }

      ctx.fillStyle = '#060913';
      ctx.fillRect(0, 0, W, H);

      for (const p of pipes) {
        ctx.fillStyle = 'rgba(244, 63, 94, 0.25)';
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 3;
        ctx.fillRect(p.x, 0, p.w, p.topH);
        ctx.strokeRect(p.x, 0, p.w, p.topH);
        ctx.fillRect(p.x, p.topH + p.gap, p.w, H - (p.topH + p.gap));
        ctx.strokeRect(p.x, p.topH + p.gap, p.w, H - (p.topH + p.gap));
      }

      if (invuln === 0 || invuln % 8 < 4) {
        ctx.beginPath(); ctx.arc(bird.x, bird.y, bird.r, 0, Math.PI * 2);
        ctx.fillStyle = invuln > 0 ? '#fbbf24' : '#22d3ee'; ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
      }

      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  },

  // ==================== 9. NEON SNAKE BLITZ (HARD: MINES + SPEED RAMP) ====================
  runSnakeRush() {
    const W = 420, H = 420, CELL = 20, COLS = 21, ROWS = 21;
    this.useCanvasMode(W, H);
    const ctx = this.ctx;

    let snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
    let dir = { x: 1, y: 0 }, nextDir = { x: 1, y: 0 };
    let tickets = 0;
    let mines = [];
    let tickMs = 185; // Gradual slow start -> speeds up gently over many orbs!

    const freeCell = (safeFromHead = false) => {
      while (true) {
        const cx = Math.floor(Math.random() * COLS);
        const cy = Math.floor(Math.random() * ROWS);
        const hitSnake = snake.some((s) => s.x === cx && s.y === cy);
        const hitMine = mines.some((m) => m.x === cx && m.y === cy);
        const tooClose = safeFromHead && Math.abs(cx - snake[0].x) + Math.abs(cy - snake[0].y) < 5;
        if (!hitSnake && !hitMine && !tooClose) return { x: cx, y: cy };
      }
    };
    let food = freeCell();
    for (let i = 0; i < 2; i++) mines.push(freeCell(true));

    const updateHud = () => {
      this.setHud({
        scoreLabel: 'Tickets Won',
        scoreVal: tickets.toLocaleString(),
        infoLabel: 'Mines / Speed',
        infoVal: `${mines.length} 💀 | ${Math.round(1000 / tickMs)}/s`
      });
    };
    updateHud();

    const setDir = (nx, ny) => {
      if (nx === -dir.x && ny === -dir.y) return;
      nextDir = { x: nx, y: ny };
    };

    this.controlsBar.innerHTML = `
      <div class="flex items-center justify-center gap-2 w-full">
        <button id="sn-l" class="px-4 py-2.5 rounded-xl bg-slate-900 border border-cyan-500/40 text-cyan-300 font-bold">◀</button>
        <button id="sn-u" class="px-4 py-2.5 rounded-xl bg-slate-900 border border-cyan-500/40 text-cyan-300 font-bold">▲</button>
        <button id="sn-d" class="px-4 py-2.5 rounded-xl bg-slate-900 border border-cyan-500/40 text-cyan-300 font-bold">▼</button>
        <button id="sn-r" class="px-4 py-2.5 rounded-xl bg-slate-900 border border-cyan-500/40 text-cyan-300 font-bold">▶</button>
      </div>
    `;
    document.getElementById('sn-l')?.addEventListener('click', () => setDir(-1, 0));
    document.getElementById('sn-r')?.addEventListener('click', () => setDir(1, 0));
    document.getElementById('sn-u')?.addEventListener('click', () => setDir(0, -1));
    document.getElementById('sn-d')?.addEventListener('click', () => setDir(0, 1));

    const onKey = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') { e.preventDefault(); setDir(-1, 0); }
      if (e.key === 'ArrowRight' || e.key === 'd') { e.preventDefault(); setDir(1, 0); }
      if (e.key === 'ArrowUp' || e.key === 'w') { e.preventDefault(); setDir(0, -1); }
      if (e.key === 'ArrowDown' || e.key === 's') { e.preventDefault(); setDir(0, 1); }
    };
    window.addEventListener('keydown', onKey);
    this.cleanupFns.push(() => window.removeEventListener('keydown', onKey));

    let lastStep = performance.now();
    const loop = (now) => {
      if (!this.isRoundActive) return;

      if (now - lastStep >= tickMs) {
        lastStep = now;
        dir = nextDir;
        const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

        // Wall, Self, or Mine collision = Game Over
        const hitWall = head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS;
        const hitSelf = snake.some((s) => s.x === head.x && s.y === head.y);
        const hitMine = mines.some((m) => m.x === head.x && m.y === head.y);

        if (hitWall || hitSelf || hitMine) {
          this.finishRound(tickets, 'SNAKE TERMINATED!', `${hitMine ? 'Menabrak ranjau merah!' : 'Menabrak dinding/ekor!'} Total hadiah: ${tickets} Tickets.`);
          return;
        }

        snake.unshift(head);
        if (head.x === food.x && head.y === food.y) {
          tickets += 30;
          food = freeCell();
          if (snake.length >= 6 && snake.length % 3 === 0 && mines.length < 16) mines.push(freeCell(true));
          tickMs = Math.max(68, Math.round(tickMs - 2.5)); // Gradual speed ramp
          ArcadeAudio.playCoinInsert();
          updateHud();
        } else {
          snake.pop();
        }
      }

      ctx.fillStyle = '#060913';
      ctx.fillRect(0, 0, W, H);

      // Mines
      for (const m of mines) {
        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(m.x * CELL + 3, m.y * CELL + 3, CELL - 6, CELL - 6);
      }

      // Food
      ctx.beginPath();
      ctx.arc(food.x * CELL + CELL / 2, food.y * CELL + CELL / 2, 7, 0, Math.PI * 2);
      ctx.fillStyle = '#fbbf24';
      ctx.fill();

      // Snake
      snake.forEach((s, idx) => {
        ctx.fillStyle = idx === 0 ? '#22d3ee' : '#a855f7';
        ctx.fillRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2);
      });

      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  },

  // ==================== 10. HYPER BRICK BREAKER (EXTREME: 1 LIFE + SHORT PADDLE) ====================
  runBrickBreaker() {
    const W = 440, H = 460;
    this.useCanvasMode(W, H);
    const ctx = this.ctx;

    let tickets = 0;
    let bricksBroken = 0;
    let hearts = 3;
    const paddle = { x: W / 2 - 44, y: H - 28, w: 88, h: 12 }; // Starts fair, shrinks gradually!
    const ball = { x: W / 2, y: H - 46, vx: 2.4, vy: -3.1, r: 8 };
    const bricks = [];

    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 8; c++) {
        const hp = r < 2 ? 2 : 1; // Top 2 rows armored!
        bricks.push({
          x: 18 + c * 51,
          y: 44 + r * 26,
          w: 46,
          h: 18,
          hp,
          pts: hp === 2 ? 35 : 20,
          color: hp === 2 ? '#c084fc' : '#22d3ee'
        });
      }
    }

    const updateHud = () => {
      const rem = bricks.filter((b) => b.hp > 0).length;
      this.setHud({
        scoreLabel: `Tickets (${rem} Bata)`,
        scoreVal: tickets.toLocaleString(),
        infoLabel: 'Hearts',
        infoVal: '♥'.repeat(hearts) + '♡'.repeat(3 - hearts)
      });
    };
    updateHud();

    this.controlsBar.innerHTML = `<p class="text-xs text-center text-cyan-300 font-semibold">3 Hati (♥♥♥)! Geser paddle dengan mouse/sentuhan/← →. Hati habis = kalah!</p>`;

    let keyDir = 0;
    const onMove = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mx = ((e.clientX - rect.left) / rect.width) * W;
      paddle.x = Math.max(8, Math.min(W - paddle.w - 8, mx - paddle.w / 2));
    };
    const onKD = (e) => { if (e.key === 'ArrowLeft' || e.key === 'a') keyDir = -1; if (e.key === 'ArrowRight' || e.key === 'd') keyDir = 1; };
    const onKU = (e) => { if ((e.key === 'ArrowLeft' || e.key === 'a') && keyDir === -1) keyDir = 0; if ((e.key === 'ArrowRight' || e.key === 'd') && keyDir === 1) keyDir = 0; };
    this.canvas.addEventListener('pointermove', onMove);
    window.addEventListener('keydown', onKD);
    window.addEventListener('keyup', onKU);
    this.cleanupFns.push(() => {
      this.canvas.removeEventListener('pointermove', onMove);
      window.removeEventListener('keydown', onKD);
      window.removeEventListener('keyup', onKU);
    });

    const loop = () => {
      if (!this.isRoundActive) return;

      paddle.x = Math.max(8, Math.min(W - paddle.w - 8, paddle.x + keyDir * 7));
      ball.x += ball.vx;
      ball.y += ball.vy;

      if (ball.x - ball.r < 6) { ball.x = 6 + ball.r; ball.vx = Math.abs(ball.vx); }
      if (ball.x + ball.r > W - 6) { ball.x = W - 6 - ball.r; ball.vx = -Math.abs(ball.vx); }
      if (ball.y - ball.r < 6) { ball.y = 6 + ball.r; ball.vy = Math.abs(ball.vy); }

      // Paddle bounce
      if (ball.vy > 0 && ball.y + ball.r >= paddle.y && ball.y - ball.r <= paddle.y + paddle.h && ball.x >= paddle.x - 4 && ball.x <= paddle.x + paddle.w + 4) {
        const hitPos = (ball.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2);
        const speedScale = Math.min(7.2, Math.abs(ball.vy) * 1.012);
        ball.vx = hitPos * (speedScale * 0.88);
        ball.vy = -speedScale;
        ArcadeAudio.playBounce();
      }

      // Bricks
      let alive = 0;
      for (const b of bricks) {
        if (b.hp <= 0) continue;
        alive += 1;
        if (ball.x + ball.r > b.x && ball.x - ball.r < b.x + b.w && ball.y + ball.r > b.y && ball.y - ball.r < b.y + b.h) {
          b.hp -= 1;
          ball.vy = -ball.vy;
          if (b.hp <= 0) {
            tickets += b.pts;
            bricksBroken += 1;
            if (bricksBroken > 12) paddle.w = Math.max(60, 88 - (bricksBroken - 12) * 0.55);
            ArcadeAudio.playCoinInsert();
          } else {
            b.color = '#fbbf24';
            ArcadeAudio.playTick(0.8);
          }
          updateHud();
          break;
        }
      }

      if (alive === 0) {
        tickets += 200;
        this.finishRound(tickets, 'ALL BRICKS SHATTERED!', `Luar biasa! Kamu menyapu seluruh 40 bata (+200 Clear Bonus): ${tickets} Tickets!`);
        return;
      }

      if (ball.y > H + 15) {
        hearts -= 1;
        ArcadeAudio.playError();
        updateHud();
        if (hearts <= 0) {
          this.finishRound(0, 'HATI HABIS — KALAH!', `Ketiga hati habis sebelum menghancurkan seluruh bata! (0 Tickets).`);
          return;
        }
        ball.x = paddle.x + paddle.w / 2;
        ball.y = paddle.y - 16;
        ball.vx = (Math.random() > 0.5 ? 1 : -1) * 2.5;
        ball.vy = -3.2;
      }

      ctx.fillStyle = '#060913';
      ctx.fillRect(0, 0, W, H);
      for (const b of bricks) {
        if (b.hp <= 0) continue;
        ctx.fillStyle = b.color;
        ctx.fillRect(b.x, b.y, b.w, b.h);
      }
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);
      ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
      ctx.fillStyle = '#fff'; ctx.fill();

      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  },

  // ==================== 11. SPACE METEOR DODGE (INSANE 25s SURVIVAL) ====================
  runMeteorDodge() {
    const W = 440, H = 460;
    this.useCanvasMode(W, H);
    const ctx = this.ctx;

    let timeLeft = 25;
    let collected = 0;
    let hearts = 3;
    let invuln = 0;
    const ship = { x: W / 2, y: H - 55, r: 12 };
    const meteors = [];
    const stars = [];

    const updateHud = () => {
      this.setHud({
        scoreLabel: `Tickets (${timeLeft}s)`,
        scoreVal: collected.toLocaleString(),
        infoLabel: 'Hearts',
        infoVal: '♥'.repeat(hearts) + '♡'.repeat(3 - hearts)
      });
    };
    updateHud();

    this.controlsBar.innerHTML = `<p class="text-xs text-center text-rose-300 font-semibold">3 Hati! Bertahan 25 detik dari hujan meteor! Jika 3 hati habis = KALAH (0 Tickets)!</p>`;

    const onMove = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      ship.x = Math.max(16, Math.min(W - 16, ((e.clientX - rect.left) / rect.width) * W));
      ship.y = Math.max(40, Math.min(H - 16, ((e.clientY - rect.top) / rect.height) * H));
    };
    this.canvas.addEventListener('pointermove', onMove);
    this.cleanupFns.push(() => this.canvas.removeEventListener('pointermove', onMove));

    const timerId = setInterval(() => {
      timeLeft -= 1;
      updateHud();
      if (timeLeft <= 0) {
        clearInterval(timerId);
        const total = collected + 250;
        this.finishRound(total, 'GALAXY SURVIVOR!', `Kamu selamat 25 detik penuh! +250 Survivor Bonus => Total ${total} Tickets!`);
      }
    }, 1000);

    let spawnAcc = 0;
    const spawner = setInterval(() => {
      const elapsed = 25 - timeLeft;
      spawnAcc += 1;
      // Wide calm phase (0-9s), medium phase (9-17s), intense phase (18-25s)
      if (elapsed < 9 && spawnAcc % 2 !== 0) return;

      const count = elapsed >= 18 ? 2 : 1;
      for (let i = 0; i < count; i++) {
        meteors.push({
          x: Math.random() * W,
          y: -20,
          vx: (Math.random() - 0.5) * (0.9 + elapsed * 0.06),
          vy: 1.9 + elapsed * 0.14 + Math.random() * 0.8,
          r: 10 + Math.random() * 8
        });
      }
      if (Math.random() < 0.45) {
        stars.push({ x: 30 + Math.random() * (W - 60), y: -15, vy: 2.3 + elapsed * 0.05, r: 9 });
      }
    }, 300);
    this.intervals.push(timerId, spawner);

    const loop = () => {
      if (!this.isRoundActive) return;
      if (invuln > 0) invuln -= 1;

      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        m.x += m.vx; m.y += m.vy;
        if (invuln === 0 && Math.hypot(ship.x - m.x, ship.y - m.y) < ship.r + m.r - 3) {
          meteors.splice(i, 1);
          hearts -= 1;
          ArcadeAudio.playError();
          updateHud();
          if (hearts <= 0) {
            this.finishRound(0, 'HATI HABIS — KALAH!', `Pesawat hancur kehabisan 3 hati sebelum 25 detik! (0 Tickets).`);
            return;
          }
          invuln = 60;
          continue;
        }
        if (m.y > H + 30) meteors.splice(i, 1);
      }

      for (let i = stars.length - 1; i >= 0; i--) {
        const s = stars[i];
        s.y += s.vy;
        if (Math.hypot(ship.x - s.x, ship.y - s.y) < ship.r + s.r + 4) {
          collected += 35;
          ArcadeAudio.playCoinInsert();
          updateHud();
          stars.splice(i, 1);
          continue;
        }
        if (s.y > H + 20) stars.splice(i, 1);
      }

      ctx.fillStyle = '#060913';
      ctx.fillRect(0, 0, W, H);

      for (const s of stars) {
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = '#fbbf24'; ctx.fill();
      }
      for (const m of meteors) {
        ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fillStyle = '#f43f5e'; ctx.fill();
        ctx.strokeStyle = '#fda4af'; ctx.lineWidth = 2; ctx.stroke();
      }

      // Draw Ship Triangle
      if (invuln === 0 || invuln % 8 < 4) {
        ctx.beginPath();
        ctx.moveTo(ship.x, ship.y - 14);
        ctx.lineTo(ship.x - 12, ship.y + 12);
        ctx.lineTo(ship.x + 12, ship.y + 12);
        ctx.closePath();
        ctx.fillStyle = invuln > 0 ? '#fbbf24' : '#22d3ee';
        ctx.fill();
      }

      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  },

  // ==================== 12. REFLEX ODD-TILE (INSANE 1.5s BRAIN SPEED) ====================
  runReflexGrid() {
    this.useDomMode();
    let level = 1;
    let totalTickets = 0;
    let timeMs = 3000; // Start with comfortable 3s warm-up, tightens per level!
    let timerId = null;

    const updateHud = () => {
      this.setHud({
        scoreLabel: 'Tickets Won',
        scoreVal: totalTickets.toLocaleString(),
        infoLabel: 'Level',
        infoVal: `${level} / 10`
      });
    };

    this.controlsBar.innerHTML = `<p class="text-xs text-center text-cyan-300 font-semibold">Klik 1 ubin yang warnanya sedikit berbeda sebelum timer bar habis!</p>`;

    const startLevel = () => {
      if (!this.isRoundActive) return;
      updateHud();
      const gridSize = level >= 6 ? 5 : 4;
      const total = gridSize * gridSize;
      const oddIdx = Math.floor(Math.random() * total);
      const baseHue = Math.floor(Math.random() * 360);
      const diff = Math.max(9, 32 - level * 2.1); // Clear early levels, subtle at high levels!
      const oddLight = 50 + (Math.random() > 0.5 ? diff : -diff);

      let rem = Math.max(1250, 3200 - (level - 1) * 180);
      const maxRem = rem;

      this.domStage.innerHTML = `
        <div class="w-full max-w-sm mx-auto p-4 space-y-3">
          <div class="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div id="rg-bar" class="h-full bg-gradient-to-r from-cyan-400 to-rose-500 transition-none" style="width: 100%"></div>
          </div>
          <div class="grid gap-2" style="grid-template-columns: repeat(${gridSize}, minmax(0, 1fr))">
            ${Array.from({ length: total })
              .map((_, i) => {
                const bg = i === oddIdx ? `hsl(${baseHue}, 82%, ${oddLight}%)` : `hsl(${baseHue}, 82%, 50%)`;
                return `<button data-rg="${i}" class="aspect-square rounded-xl border border-white/10 hover:scale-95 transition-transform" style="background:${bg}"></button>`;
              })
              .join('')}
          </div>
        </div>`;

      clearInterval(timerId);
      const startT = performance.now();
      timerId = setInterval(() => {
        const left = maxRem - (performance.now() - startT);
        const bar = document.getElementById('rg-bar');
        if (bar) bar.style.width = `${Math.max(0, (left / maxRem) * 100)}%`;
        if (left <= 0) {
          clearInterval(timerId);
          this.finishRound(totalTickets, 'TIME OUT!', `Waktu habis di Level ${level}! Total hadiah: ${totalTickets} Tickets.`);
        }
      }, 30);
      this.intervals.push(timerId);

      this.domStage.querySelectorAll('[data-rg]').forEach((btn) => {
        btn.addEventListener('click', () => {
          clearInterval(timerId);
          const picked = parseInt(btn.getAttribute('data-rg'), 10);
          if (picked === oddIdx) {
            totalTickets += level * 15;
            ArcadeAudio.playCoinInsert();
            if (level >= 10) {
              this.finishRound(totalTickets + 150, 'REFLEX MASTER!', `Menaklukkan 10 Level (+150 Bonus)! Total ${totalTickets + 150} Tickets!`);
            } else {
              level += 1;
              startLevel();
            }
          } else {
            this.finishRound(totalTickets, 'WRONG TILE!', `Salah pilih ubin di Level ${level}! Total hadiah: ${totalTickets} Tickets.`);
          }
        });
      });
    };

    startLevel();
  },

  // ==================== 13. CYBER STACKER (EXTREME MICRO-TIMING) ====================
  runTowerStack() {
    const W = 420, H = 460;
    this.useCanvasMode(W, H);
    const ctx = this.ctx;

    let floor = 0;
    let tickets = 0;
    const blockH = 26;
    const stack = [{ x: 130, w: 160, color: '#22d3ee' }];
    let active = { x: 20, w: 160, vx: 2.0 }; // Smooth warm-up on floors 1-4, then ramps up!

    const updateHud = () => {
      this.setHud({
        scoreLabel: 'Tickets Won',
        scoreVal: tickets.toLocaleString(),
        infoLabel: 'Floor',
        infoVal: `${floor} / 12`
      });
    };
    updateHud();

    const dropBlock = () => {
      if (!this.isRoundActive) return;
      const top = stack[stack.length - 1];
      const overlapStart = Math.max(active.x, top.x);
      const overlapEnd = Math.min(active.x + active.w, top.x + top.w);
      const overlapW = overlapEnd - overlapStart;

      if (overlapW <= 2) {
        this.finishRound(tickets, 'TOWER COLLAPSED!', `Blok meleset di Lantai ${floor + 1}! Total hadiah: ${tickets} Tickets.`);
        return;
      }

      floor += 1;
      const earned = floor * 15;
      tickets += earned;
      stack.push({
        x: overlapStart,
        w: overlapW,
        color: floor % 2 === 0 ? '#22d3ee' : '#c084fc'
      });
      ArcadeAudio.playCoinInsert();
      updateHud();

      if (floor >= 12) {
        this.finishRound(tickets + 250, 'FLOOR 12 JACKPOT!', `Menara sempurna 12 lantai (+250 Bonus)! Total ${tickets + 250} Tickets!`);
        return;
      }

      const speedMag = floor <= 4 ? 2.0 + floor * 0.25 : 3.0 + (floor - 4) * 0.45;
      const nextSpeed = speedMag * (floor % 2 === 0 ? 1 : -1);
      active = { x: nextSpeed > 0 ? 10 : W - overlapW - 10, w: overlapW, vx: nextSpeed };
    };

    this.controlsBar.innerHTML = `<button id="ts-drop" class="w-full py-3 rounded-xl bg-amber-400 text-slate-950 font-display font-black text-xs uppercase">⬇️ JATUHKAN BLOK (Space / Klik Layar)</button>`;
    document.getElementById('ts-drop')?.addEventListener('pointerdown', (e) => { e.preventDefault(); dropBlock(); });
    this.canvas.addEventListener('pointerdown', dropBlock);
    const onKey = (e) => { if (e.code === 'Space') { e.preventDefault(); dropBlock(); } };
    window.addEventListener('keydown', onKey);
    this.cleanupFns.push(() => { this.canvas.removeEventListener('pointerdown', dropBlock); window.removeEventListener('keydown', onKey); });

    const loop = () => {
      if (!this.isRoundActive) return;
      active.x += active.vx;
      if (active.x <= 8) { active.x = 8; active.vx = Math.abs(active.vx); }
      if (active.x + active.w >= W - 8) { active.x = W - 8 - active.w; active.vx = -Math.abs(active.vx); }

      ctx.fillStyle = '#060913';
      ctx.fillRect(0, 0, W, H);

      stack.forEach((b, i) => {
        const by = H - 30 - (i + 1) * blockH;
        ctx.fillStyle = b.color;
        ctx.fillRect(b.x, by, b.w, blockH - 3);
      });

      const ay = H - 30 - (stack.length + 1) * blockH;
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(active.x, ay, active.w, blockH - 3);

      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  },

  // ==================== 14. WHACK-A-GLITCH (HARD: 600ms + STUN BOMBS) ====================
  runWhackGlitch() {
    this.useDomMode();
    let timeLeft = 18;
    let totalTickets = 0;
    let stunned = false;
    const slots = new Array(9).fill(null);

    const updateHud = () => {
      this.setHud({
        scoreLabel: 'Tickets Won',
        scoreVal: totalTickets.toLocaleString(),
        infoLabel: stunned ? 'STUNNED!' : 'Timer',
        infoVal: `${timeLeft}s`
      });
    };
    updateHud();

    this.controlsBar.innerHTML = `<p class="text-xs text-center text-rose-300 font-semibold">Pukul 🤖 (+25) &amp; 👑 (+75) secepat kilat! Jangan pukul 💣 (Stun 1 detik &amp; -50)!</p>`;

    const render = () => {
      this.domStage.innerHTML = `
        <div class="grid grid-cols-3 gap-3 p-4 w-full max-w-sm mx-auto">
          ${slots
            .map((s, i) => `
              <button data-wg="${i}" class="aspect-square rounded-2xl border-2 flex items-center justify-center text-3xl transition-all ${
                s === 'gold'
                  ? 'border-amber-400 bg-amber-500/20'
                  : s === 'bot'
                  ? 'border-cyan-400 bg-cyan-500/20'
                  : s === 'bomb'
                  ? 'border-rose-500 bg-rose-500/25'
                  : 'border-slate-800 bg-slate-900/90'
              }">
                ${s === 'gold' ? '👑' : s === 'bot' ? '🤖' : s === 'bomb' ? '💣' : ''}
              </button>`)
            .join('')}
        </div>`;

      this.domStage.querySelectorAll('[data-wg]').forEach((btn) => {
        btn.addEventListener('pointerdown', () => {
          if (stunned || !this.isRoundActive) return;
          const idx = parseInt(btn.getAttribute('data-wg'), 10);
          const item = slots[idx];
          if (!item) return;

          slots[idx] = null;
          if (item === 'bomb') {
            totalTickets = Math.max(0, totalTickets - 50);
            stunned = true;
            ArcadeAudio.playError();
            this.timeouts.push(setTimeout(() => { stunned = false; updateHud(); }, 1000));
          } else {
            totalTickets += item === 'gold' ? 75 : 25;
            ArcadeAudio.playCoinInsert();
          }
          updateHud();
          render();
        });
      });
    };
    render();

    const spawnPop = () => {
      if (!this.isRoundActive) return;
      slots.fill(null);
      const elapsed = 18 - timeLeft;
      const progress = Math.min(1, elapsed / 18);
      const count = elapsed > 8 && Math.random() < 0.5 ? 2 : 1;
      for (let k = 0; k < count; k++) {
        const idx = Math.floor(Math.random() * 9);
        const r = Math.random();
        const bombChance = 0.16 + progress * 0.24;
        slots[idx] = r < 0.16 ? 'gold' : r < bombChance + 0.16 ? 'bomb' : 'bot';
      }
      render();
      const nextDelay = Math.round(1150 - progress * 550);
      this.timeouts.push(setTimeout(spawnPop, nextDelay));
    };
    spawnPop();

    const secInterval = setInterval(() => {
      timeLeft -= 1;
      updateHud();
      if (timeLeft <= 0) {
        clearInterval(secInterval);
        this.finishRound(totalTickets, 'TIME UP!', `Refleks palu cyborg-mu menghasilkan ${totalTickets.toLocaleString()} Prize Tickets!`);
      }
    }, 1000);
    this.intervals.push(secInterval);
  },

  // ==================== 15. CYBER DASH RUNNER (INSANE FRIV SPIKE RUNNER) ====================
  runCyberDash() {
    const W = 460, H = 360, GROUND = 300;
    this.useCanvasMode(W, H);
    const ctx = this.ctx;

    let player = { x: 76, y: GROUND - 28, w: 28, h: 28, vy: 0, grounded: true };
    let obstacles = [];
    let passed = 0;
    let hearts = 3;
    let invuln = 0;
    let speed = 3.2; // Approachable start, ramps up smoothly!
    let spawnTimer = 70;
    const TARGET = 15;

    const updateHud = () => {
      this.setHud({
        scoreLabel: `Goal (${passed}/${TARGET})`,
        scoreVal: `${passed * 25} TIX`,
        infoLabel: 'Hearts',
        infoVal: '♥'.repeat(hearts) + '♡'.repeat(3 - hearts)
      });
    };
    updateHud();

    const jump = () => {
      if (!this.isRoundActive || !player.grounded) return;
      player.vy = -10.8;
      player.grounded = false;
      ArcadeAudio.playLaser();
    };

    this.controlsBar.innerHTML = `<button id="cdash-jump" class="w-full py-3 rounded-xl bg-purple-500 text-white font-display font-black text-xs uppercase">⬆️ LOMPAT (Space / Klik Layar)</button>`;
    document.getElementById('cdash-jump')?.addEventListener('pointerdown', (e) => { e.preventDefault(); jump(); });
    this.canvas.addEventListener('pointerdown', jump);
    const onKey = (e) => { if (e.code === 'Space' || e.key === 'ArrowUp') { e.preventDefault(); jump(); } };
    window.addEventListener('keydown', onKey);
    this.cleanupFns.push(() => { this.canvas.removeEventListener('pointerdown', jump); window.removeEventListener('keydown', onKey); });

    const loop = () => {
      if (!this.isRoundActive) return;
      if (invuln > 0) invuln -= 1;

      player.vy += 0.62;
      player.y += player.vy;
      if (player.y >= GROUND - player.h) {
        player.y = GROUND - player.h;
        player.vy = 0;
        player.grounded = true;
      }

      spawnTimer -= 1;
      if (spawnTimer <= 0) {
        const isDrone = Math.random() < 0.32 && passed >= 6;
        obstacles.push({
          x: W + 20,
          y: isDrone ? GROUND - 66 : GROUND - 28,
          w: isDrone ? 30 : 22 + (passed >= 5 && Math.random() < 0.4 ? 14 : 0),
          h: 28,
          isDrone,
          scored: false
        });
        const rampPassed = Math.max(0, passed - 4);
        spawnTimer = Math.max(44, 105 - rampPassed * 1.4) + Math.random() * 24;
      }

      for (let i = obstacles.length - 1; i >= 0; i--) {
        const o = obstacles[i];
        o.x -= speed;

        if (invuln === 0 && player.x + 4 < o.x + o.w && player.x + player.w - 4 > o.x && player.y + 4 < o.y + o.h && player.y + player.h - 2 > o.y) {
          obstacles.splice(i, 1);
          hearts -= 1;
          ArcadeAudio.playError();
          updateHud();
          if (hearts <= 0) {
            this.finishRound(0, 'HATI HABIS — KALAH!', `Ketiga hati habis sebelum melewati ${TARGET} rintangan! (0 Tickets).`);
            return;
          }
          invuln = 55;
          continue;
        }

        if (!o.scored && o.x + o.w < player.x) {
          o.scored = true;
          passed += 1;
          if (passed > 4) speed = Math.min(9.4, 3.2 + (passed - 4) * 0.13);
          ArcadeAudio.playTick(0.9);
          updateHud();
          if (passed >= TARGET) {
            this.finishRound(400, 'DASH CHAMPION!', `Berhasil melewati ${TARGET} rintangan dengan ${hearts} hati tersisa (+400 Tickets)!`);
            return;
          }
        }
        if (o.x + o.w < -30) obstacles.splice(i, 1);
      }

      ctx.fillStyle = '#060913';
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(0, GROUND); ctx.lineTo(W, GROUND); ctx.stroke();

      // Player Fox/Bot
      if (invuln === 0 || invuln % 8 < 4) {
        ctx.fillStyle = invuln > 0 ? '#fbbf24' : '#22d3ee';
        ctx.fillRect(player.x, player.y, player.w, player.h);
        ctx.fillStyle = '#fff';
        ctx.fillRect(player.x + 16, player.y + 6, 6, 6);
      }

      // Obstacles
      for (const o of obstacles) {
        ctx.fillStyle = o.isDrone ? '#c084fc' : '#f43f5e';
        if (o.isDrone) {
          ctx.fillRect(o.x, o.y, o.w, o.h);
        } else {
          ctx.beginPath();
          ctx.moveTo(o.x, o.y + o.h);
          ctx.lineTo(o.x + o.w / 2, o.y);
          ctx.lineTo(o.x + o.w, o.y + o.h);
          ctx.closePath();
          ctx.fill();
        }
      }

      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }
};
