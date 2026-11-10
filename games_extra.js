/**
 * NEON CARNIVAL // EXTRA 16 FRIV-STYLE ARCADE MINI-GAMES
 * Extends MiniGamesArcade with 16 more playable cabinets (total 32 games).
 * Every game starts comfortably and ramps up in difficulty!
 */

Object.assign(MiniGamesArcade, {
  // ==================== 16. CYBER INVADERS ====================
  runSpaceInvaders() {
    const W = 440, H = 460;
    this.useCanvasMode(W, H);
    const ctx = this.ctx;

    let shipX = W / 2;
    let moveDir = 0;
    let tickets = 0;
    let wave = 1;
    let hearts = 3;
    let invuln = 0;
    let bullets = [];
    let enemyBullets = [];
    let aliens = [];
    let alienDir = 1;
    let fireCooldown = 0;

    const spawnWave = () => {
      aliens = [];
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 7; c++) {
          aliens.push({
            x: 58 + c * 52,
            y: 48 + r * 38,
            w: 28,
            h: 22,
            pts: r === 0 ? 35 : 20,
            color: r === 0 ? '#fbbf24' : r === 1 ? '#c084fc' : '#22d3ee'
          });
        }
      }
    };
    spawnWave();

    const updateHud = () => {
      this.setHud({
        scoreLabel: `Tickets (Wave ${wave}/2)`,
        scoreVal: tickets.toLocaleString(),
        infoLabel: 'Hearts',
        infoVal: '♥'.repeat(hearts) + '♡'.repeat(3 - hearts)
      });
    };
    updateHud();

    const fire = () => {
      if (fireCooldown > 0 || !this.isRoundActive) return;
      bullets.push({ x: shipX, y: H - 44, vy: -7.5 });
      fireCooldown = 14;
      ArcadeAudio.playLaser();
    };

    this.controlsBar.innerHTML = `
      <div class="flex items-center justify-between gap-2 w-full">
        <button id="si-l" class="flex-1 py-2.5 rounded-xl bg-slate-900 border border-cyan-500/40 text-cyan-300 font-bold text-xs">◀ Kiri</button>
        <button id="si-f" class="px-5 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-black text-xs uppercase">Tembak (Space)</button>
        <button id="si-r" class="flex-1 py-2.5 rounded-xl bg-slate-900 border border-cyan-500/40 text-cyan-300 font-bold text-xs">Kanan ▶</button>
      </div>
    `;
    const bindH = (id, d) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('pointerdown', (e) => { e.preventDefault(); moveDir = d; });
      const stop = () => { if (moveDir === d) moveDir = 0; };
      el.addEventListener('pointerup', stop);
      el.addEventListener('pointerleave', stop);
    };
    bindH('si-l', -1);
    bindH('si-r', 1);
    document.getElementById('si-f')?.addEventListener('click', fire);

    const onKD = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') moveDir = -1;
      if (e.key === 'ArrowRight' || e.key === 'd') moveDir = 1;
      if (e.code === 'Space') { e.preventDefault(); fire(); }
    };
    const onKU = (e) => {
      if ((e.key === 'ArrowLeft' || e.key === 'a') && moveDir === -1) moveDir = 0;
      if ((e.key === 'ArrowRight' || e.key === 'd') && moveDir === 1) moveDir = 0;
    };
    window.addEventListener('keydown', onKD);
    window.addEventListener('keyup', onKU);
    this.cleanupFns.push(() => { window.removeEventListener('keydown', onKD); window.removeEventListener('keyup', onKU); });

    const loop = () => {
      if (!this.isRoundActive) return;
      if (invuln > 0) invuln -= 1;
      if (fireCooldown > 0) fireCooldown -= 1;
      shipX = Math.max(24, Math.min(W - 24, shipX + moveDir * 5.2));

      // Progressive alien speed as count drops & wave rises (slower start!)
      const alienSpeed = (0.55 + (wave - 1) * 0.3) + (21 - aliens.length) * 0.045;
      let hitEdge = false;
      for (const a of aliens) {
        a.x += alienDir * alienSpeed;
        if (a.x > W - 36 || a.x < 12) hitEdge = true;
      }
      if (hitEdge) {
        alienDir *= -1;
        for (const a of aliens) {
          a.y += 16;
          if (a.y + a.h >= H - 48) {
            this.finishRound(0, 'INVADERS LANDED — KALAH!', `Pasukan alien berhasil mendarat di Wave ${wave}! (0 Tickets).`);
            return;
          }
        }
      }

      // Enemy plasma shot
      if (aliens.length > 0 && Math.random() < 0.015 + wave * 0.008) {
        const shooter = aliens[Math.floor(Math.random() * aliens.length)];
        enemyBullets.push({ x: shooter.x + shooter.w / 2, y: shooter.y + shooter.h, vy: 3.2 + wave * 0.4 });
      }

      for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.y += b.vy;
        if (b.y < -10) { bullets.splice(i, 1); continue; }
        for (let j = aliens.length - 1; j >= 0; j--) {
          const a = aliens[j];
          if (b.x > a.x && b.x < a.x + a.w && b.y > a.y && b.y < a.y + a.h) {
            tickets += a.pts;
            aliens.splice(j, 1);
            bullets.splice(i, 1);
            ArcadeAudio.playCoinInsert();
            updateHud();
            break;
          }
        }
      }

      for (let i = enemyBullets.length - 1; i >= 0; i--) {
        const eb = enemyBullets[i];
        eb.y += eb.vy;
        if (invuln === 0 && Math.abs(eb.x - shipX) < 16 && Math.abs(eb.y - (H - 30)) < 14) {
          enemyBullets.splice(i, 1);
          hearts -= 1;
          ArcadeAudio.playError();
          updateHud();
          if (hearts <= 0) {
            this.finishRound(0, 'HATI HABIS — KALAH!', `Pesawat hancur kehabisan 3 hati di Wave ${wave}! (0 Tickets).`);
            return;
          }
          invuln = 60;
          continue;
        }
        if (eb.y > H + 10) enemyBullets.splice(i, 1);
      }

      if (aliens.length === 0) {
        if (wave >= 2) {
          this.finishRound(tickets + 200, 'GALAXY DEFENDED!', `Berhasil menghancurkan 2 Wave Alien (+200 Bonus): ${tickets + 200} Tickets!`);
          return;
        }
        wave += 1;
        tickets += 100;
        spawnWave();
        updateHud();
      }

      ctx.fillStyle = '#060913';
      ctx.fillRect(0, 0, W, H);
      for (const a of aliens) {
        ctx.fillStyle = a.color;
        ctx.fillRect(a.x, a.y, a.w, a.h);
        ctx.fillStyle = '#060913';
        ctx.fillRect(a.x + 6, a.y + 6, 4, 4);
        ctx.fillRect(a.x + a.w - 10, a.y + 6, 4, 4);
      }
      if (invuln === 0 || invuln % 8 < 4) {
        ctx.fillStyle = invuln > 0 ? '#fbbf24' : '#22d3ee';
        ctx.beginPath(); ctx.moveTo(shipX, H - 42); ctx.lineTo(shipX - 16, H - 20); ctx.lineTo(shipX + 16, H - 20); ctx.closePath(); ctx.fill();
      }
      ctx.fillStyle = '#fde047';
      bullets.forEach((b) => ctx.fillRect(b.x - 2, b.y, 4, 10));
      ctx.fillStyle = '#f43f5e';
      enemyBullets.forEach((b) => ctx.fillRect(b.x - 2, b.y, 4, 10));

      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  },

  // ==================== 17. NEON MEMORY MATRIX ====================
  runMemoryMatrix() {
    this.useDomMode();
    let level = 1;
    let tickets = 0;
    let sequence = [];
    let userIdx = 0;
    let locked = true;

    const updateHud = () => {
      this.setHud({
        scoreLabel: 'Tickets Won',
        scoreVal: tickets.toLocaleString(),
        infoLabel: 'Pattern Length',
        infoVal: `${sequence.length} Steps`
      });
    };

    const renderGrid = (litIdx = -1) => {
      this.domStage.innerHTML = `
        <div class="grid grid-cols-3 gap-3 p-4 w-full max-w-xs mx-auto">
          ${Array.from({ length: 9 })
            .map((_, i) => `
              <button data-mm="${i}" class="aspect-square rounded-2xl border-2 transition-all ${
                litIdx === i
                  ? 'bg-cyan-400 border-white scale-95 shadow-[0_0_25px_#22d3ee]'
                  : 'bg-slate-900/90 border-purple-500/40 hover:border-cyan-400/70'
              }"></button>`)
            .join('')}
        </div>`;

      this.domStage.querySelectorAll('[data-mm]').forEach((btn) => {
        btn.addEventListener('click', () => {
          if (locked || !this.isRoundActive) return;
          const idx = parseInt(btn.getAttribute('data-mm'), 10);
          renderGrid(idx);
          this.timeouts.push(setTimeout(() => renderGrid(-1), 160));

          if (idx === sequence[userIdx]) {
            ArcadeAudio.playTick(0.8);
            userIdx += 1;
            if (userIdx >= sequence.length) {
              tickets += level * 25;
              ArcadeAudio.playCoinInsert();
              if (level >= 8) {
                this.finishRound(tickets + 150, 'MEMORY MASTER!', `Menyelesaikan 8 level pola memori (+150 Bonus): ${tickets + 150} Tickets!`);
              } else {
                level += 1;
                this.timeouts.push(setTimeout(nextRound, 550));
              }
            }
          } else {
            this.finishRound(tickets, 'WRONG SEQUENCE!', `Urutan salah di Level ${level}! Hadiah: ${tickets} Tickets.`);
          }
        });
      });
    };

    const nextRound = () => {
      if (!this.isRoundActive) return;
      locked = true;
      userIdx = 0;
      if (sequence.length === 0) sequence.push(Math.floor(Math.random() * 9), Math.floor(Math.random() * 9));
      else sequence.push(Math.floor(Math.random() * 9));
      updateHud();
      this.controlsBar.innerHTML = `<p class="text-xs text-amber-300 font-semibold">Perhatikan urutan lampu...</p>`;
      renderGrid(-1);

      const stepMs = Math.max(260, 520 - level * 30);
      sequence.forEach((cell, step) => {
        this.timeouts.push(setTimeout(() => {
          if (!this.isRoundActive) return;
          ArcadeAudio.playBounce();
          renderGrid(cell);
        }, (step + 1) * stepMs));
        this.timeouts.push(setTimeout(() => {
          if (!this.isRoundActive) return;
          renderGrid(-1);
          if (step === sequence.length - 1) {
            locked = false;
            this.controlsBar.innerHTML = `<p class="text-xs text-cyan-300 font-semibold">Giliranmu! Ulangi ${sequence.length} langkah yang tadi menyala.</p>`;
          }
        }, (step + 1) * stepMs + stepMs * 0.6));
      });
    };
    nextRound();
  },

  // ==================== 18. CYBER FRUIT SLASH ====================
  runFruitSlash() {
    const W = 440, H = 440;
    this.useCanvasMode(W, H);
    const ctx = this.ctx;

    let tickets = 0;
    let missed = 0;
    let elapsed = 0;
    let items = [];
    let trail = [];
    let isPointerDown = false;

    const updateHud = () => {
      this.setHud({
        scoreLabel: 'Tickets Won',
        scoreVal: tickets.toLocaleString(),
        infoLabel: 'Missed (Max 3)',
        infoVal: '✖'.repeat(missed) + '○'.repeat(3 - missed)
      });
    };
    updateHud();

    this.controlsBar.innerHTML = `<p class="text-xs text-center text-cyan-300 font-semibold">Tahan &amp; geser kursor/jari untuk menebas buah neon! Hindari 💣!</p>`;

    const spawn = () => {
      const count = elapsed > 14 ? 2 : 1;
      const fruits = [
        { icon: '🍉', pts: 20, color: '#34d399' },
        { icon: '🍋', pts: 25, color: '#fbbf24' },
        { icon: '🍇', pts: 35, color: '#c084fc' },
        { icon: '🍍', pts: 50, color: '#22d3ee' }
      ];
      for (let i = 0; i < count; i++) {
        const isBomb = Math.random() < (elapsed < 7 ? 0.10 : 0.24);
        const f = fruits[Math.floor(Math.random() * fruits.length)];
        items.push({
          x: 60 + Math.random() * (W - 120),
          y: H + 20,
          vx: (Math.random() - 0.5) * 3.0,
          vy: -(9.2 + Math.random() * 2.4),
          r: 22,
          isBomb,
          icon: isBomb ? '💣' : f.icon,
          pts: isBomb ? 0 : f.pts,
          color: isBomb ? '#f43f5e' : f.color
        });
      }
    };

    const secId = setInterval(() => { elapsed += 1; }, 1000);
    const spawnerId = setInterval(spawn, 1150);
    this.intervals.push(secId, spawnerId);
    spawn();

    const getPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      return { x: ((e.clientX - rect.left) / rect.width) * W, y: ((e.clientY - rect.top) / rect.height) * H };
    };
    const sliceAt = (p) => {
      trail.push({ x: p.x, y: p.y, life: 1 });
      for (let i = items.length - 1; i >= 0; i--) {
        const it = items[i];
        if (Math.hypot(p.x - it.x, p.y - it.y) < it.r + 8) {
          if (it.isBomb) {
            this.finishRound(Math.floor(tickets * 0.4), 'BOMB SLICED!', `Kamu menebas 💣 Bom! Tiket dipotong menjadi ${Math.floor(tickets * 0.4)}.`);
            return;
          }
          tickets += it.pts;
          ArcadeAudio.playCoinInsert();
          items.splice(i, 1);
          updateHud();
        }
      }
    };

    const onDown = (e) => { isPointerDown = true; sliceAt(getPos(e)); };
    const onMove = (e) => { if (isPointerDown) sliceAt(getPos(e)); };
    const onUp = () => { isPointerDown = false; };
    this.canvas.addEventListener('pointerdown', onDown);
    this.canvas.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    this.cleanupFns.push(() => {
      this.canvas.removeEventListener('pointerdown', onDown);
      this.canvas.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    });

    const loop = () => {
      if (!this.isRoundActive) return;

      for (let i = items.length - 1; i >= 0; i--) {
        const it = items[i];
        it.vy += 0.25;
        it.x += it.vx;
        it.y += it.vy;
        if (it.y > H + 36 && it.vy > 0) {
          if (!it.isBomb) {
            missed += 1;
            ArcadeAudio.playError();
            updateHud();
            if (missed >= 3) {
              this.finishRound(tickets, '3 FRUITS MISSED!', `Terlalu banyak buah terlewat! Total hadiah: ${tickets} Tickets.`);
              return;
            }
          }
          items.splice(i, 1);
        }
      }

      ctx.fillStyle = '#060913';
      ctx.fillRect(0, 0, W, H);
      for (const it of items) {
        ctx.beginPath(); ctx.arc(it.x, it.y, it.r, 0, Math.PI * 2);
        ctx.fillStyle = '#0f172a'; ctx.fill();
        ctx.strokeStyle = it.color; ctx.lineWidth = 3; ctx.stroke();
        ctx.font = '20px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(it.icon, it.x, it.y);
      }
      for (let i = trail.length - 1; i >= 0; i--) {
        const t = trail[i]; t.life -= 0.1;
        if (t.life <= 0) { trail.splice(i, 1); continue; }
        ctx.fillStyle = `rgba(34, 211, 238, ${t.life})`;
        ctx.beginPath(); ctx.arc(t.x, t.y, 6 * t.life, 0, Math.PI * 2); ctx.fill();
      }

      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  },

  // ==================== 19. HYPER PONG ARENA (1P VS AI / 2P LOCAL 1V1) ====================
  runPongDuel() {
    const W = 460, H = 360;
    this.useCanvasMode(W, H);
    const ctx = this.ctx;
    const is2P = this.playerMode === '2p';

    let p1Y = H / 2 - 36, p2Y = H / 2 - 36;
    const pH = 72;
    let p1Score = 0, p2Score = 0;
    const ball = { x: W / 2, y: H / 2, vx: 3.1, vy: 2.0, r: 8 };

    const updateHud = () => {
      this.setHud({
        scoreLabel: is2P ? 'P1 (Cyan) vs P2 (Pink)' : 'You vs AI (First to 5)',
        scoreVal: `${p1Score} - ${p2Score}`,
        infoLabel: 'Mode',
        infoVal: is2P ? '2P LOCAL' : '1P SOLO'
      });
    };
    updateHud();

    let p1Dir = 0, p2Dir = 0;
    if (is2P) {
      this.controlsBar.innerHTML = `
        <div class="flex items-center justify-between gap-2 w-full">
          <div class="flex items-center gap-1">
            <button id="pg-p1u" class="px-3 py-2 rounded-lg bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 font-bold text-xs">P1 ▲</button>
            <button id="pg-p1d" class="px-3 py-2 rounded-lg bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 font-bold text-xs">P1 ▼</button>
          </div>
          <span class="text-[11px] text-slate-300 hidden sm:inline">P1: W/S • P2: ↑/↓</span>
          <div class="flex items-center gap-1">
            <button id="pg-p2u" class="px-3 py-2 rounded-lg bg-rose-500/20 border border-rose-400/50 text-rose-300 font-bold text-xs">P2 ▲</button>
            <button id="pg-p2d" class="px-3 py-2 rounded-lg bg-rose-500/20 border border-rose-400/50 text-rose-300 font-bold text-xs">P2 ▼</button>
          </div>
        </div>`;
      const bindP = (id, setter, val) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener('pointerdown', (e) => { e.preventDefault(); setter(val); });
        const stop = () => setter(0);
        el.addEventListener('pointerup', stop);
        el.addEventListener('pointerleave', stop);
      };
      bindP('pg-p1u', (v) => (p1Dir = v), -1);
      bindP('pg-p1d', (v) => (p1Dir = v), 1);
      bindP('pg-p2u', (v) => (p2Dir = v), -1);
      bindP('pg-p2d', (v) => (p2Dir = v), 1);
    } else {
      this.controlsBar.innerHTML = `<p class="text-xs text-center text-cyan-300 font-semibold">Gerakkan paddle kiri dengan kursor/sentuhan atau W/S/↑/↓. Menang 5 poin = 350 Tickets!</p>`;
    }

    const onMove = (e) => {
      if (is2P) return;
      const rect = this.canvas.getBoundingClientRect();
      const my = ((e.clientY - rect.top) / rect.height) * H;
      p1Y = Math.max(8, Math.min(H - pH - 8, my - pH / 2));
    };
    const onKD = (e) => {
      if (e.key === 'w' || e.key === 'W' || (!is2P && e.key === 'ArrowUp')) { e.preventDefault(); p1Dir = -1; }
      if (e.key === 's' || e.key === 'S' || (!is2P && e.key === 'ArrowDown')) { e.preventDefault(); p1Dir = 1; }
      if (is2P && e.key === 'ArrowUp') { e.preventDefault(); p2Dir = -1; }
      if (is2P && e.key === 'ArrowDown') { e.preventDefault(); p2Dir = 1; }
    };
    const onKU = (e) => {
      if ((e.key === 'w' || e.key === 'W' || (!is2P && e.key === 'ArrowUp')) && p1Dir === -1) p1Dir = 0;
      if ((e.key === 's' || e.key === 'S' || (!is2P && e.key === 'ArrowDown')) && p1Dir === 1) p1Dir = 0;
      if (is2P && e.key === 'ArrowUp' && p2Dir === -1) p2Dir = 0;
      if (is2P && e.key === 'ArrowDown' && p2Dir === 1) p2Dir = 0;
    };
    this.canvas.addEventListener('pointermove', onMove);
    window.addEventListener('keydown', onKD);
    window.addEventListener('keyup', onKU);
    this.cleanupFns.push(() => { this.canvas.removeEventListener('pointermove', onMove); window.removeEventListener('keydown', onKD); window.removeEventListener('keyup', onKU); });

    const resetBall = (dir) => {
      ball.x = W / 2; ball.y = H / 2;
      ball.vx = 3.1 * dir;
      ball.vy = (Math.random() - 0.5) * 4.0;
    };

    const loop = () => {
      if (!this.isRoundActive) return;
      p1Y = Math.max(8, Math.min(H - pH - 8, p1Y + p1Dir * 6.5));

      if (is2P) {
        p2Y = Math.max(8, Math.min(H - pH - 8, p2Y + p2Dir * 6.5));
      } else {
        const aiSpeed = 2.4 + p1Score * 0.42;
        if (ball.y > p2Y + pH / 2 + 6) p2Y += aiSpeed;
        else if (ball.y < p2Y + pH / 2 - 6) p2Y -= aiSpeed;
        p2Y = Math.max(8, Math.min(H - pH - 8, p2Y));
      }

      ball.x += ball.vx; ball.y += ball.vy;
      if (ball.y - ball.r < 6 || ball.y + ball.r > H - 6) ball.vy = -ball.vy;

      if (ball.vx < 0 && ball.x - ball.r <= 28 && ball.x >= 14 && ball.y >= p1Y - 4 && ball.y <= p1Y + pH + 4) {
        const hit = (ball.y - (p1Y + pH / 2)) / (pH / 2);
        ball.vx = Math.min(8.4, Math.abs(ball.vx) * 1.05);
        ball.vy = hit * 5.0;
        ArcadeAudio.playBounce();
      }
      if (ball.vx > 0 && ball.x + ball.r >= W - 28 && ball.x <= W - 14 && ball.y >= p2Y - 4 && ball.y <= p2Y + pH + 4) {
        const hit = (ball.y - (p2Y + pH / 2)) / (pH / 2);
        ball.vx = -Math.min(8.4, Math.abs(ball.vx) * 1.05);
        ball.vy = hit * 5.0;
        ArcadeAudio.playTick(0.6);
      }

      if (ball.x < 0) {
        p2Score += 1; ArcadeAudio.playError(); updateHud();
        if (p2Score >= 5) {
          if (is2P) {
            this.finishRound(350, 'PLAYER 2 MENANG!', `Player 2 mengalahkan Player 1 dengan skor ${p2Score}-${p1Score} (+350 Tickets)!`);
          } else {
            this.finishRound(0, 'AI WINS — KALAH!', `Cyber AI menang 5-${p1Score}! (0 Tickets).`);
          }
          return;
        }
        resetBall(1);
      }
      if (ball.x > W) {
        p1Score += 1; ArcadeAudio.playCoinInsert(); updateHud();
        if (p1Score >= 5) {
          this.finishRound(350, is2P ? 'PLAYER 1 MENANG!' : 'VICTORY VS AI!', `${is2P ? 'Player 1' : 'Kamu'} menang dengan skor 5-${p2Score} (+350 Tickets)!`);
          return;
        }
        resetBall(-1);
      }

      ctx.fillStyle = '#060913';
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.setLineDash([8, 8]); ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#22d3ee'; ctx.fillRect(16, p1Y, 12, pH);
      ctx.fillStyle = '#f43f5e'; ctx.fillRect(W - 28, p2Y, 12, pH);
      ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2); ctx.fillStyle = '#fbbf24'; ctx.fill();

      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  },

  // ==================== 20. NEON MINE HUNTER (5x5 MINESWEEPER) ====================
  runMinesweeperMini() {
    this.useDomMode();
    const SIZE = 5, TOTAL = 25, MINES = 5;
    let mineSet = new Set();
    while (mineSet.size < MINES) mineSet.add(Math.floor(Math.random() * TOTAL));

    const revealed = new Array(TOTAL).fill(false);
    let safeOpened = 0;
    let banked = 0;
    let ended = false;

    const countAdj = (idx) => {
      const r = Math.floor(idx / SIZE), c = idx % SIZE;
      let n = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && mineSet.has(nr * SIZE + nc)) n += 1;
        }
      }
      return n;
    };

    const updateHud = () => {
      this.setHud({
        scoreLabel: 'At-Risk Tickets',
        scoreVal: banked.toLocaleString(),
        infoLabel: 'Safe Cells',
        infoVal: `${safeOpened} / ${TOTAL - MINES}`
      });
    };
    updateHud();

    this.controlsBar.innerHTML = `
      <div class="flex items-center justify-between gap-3 w-full">
        <span class="text-xs text-slate-300">5 ranjau tersembunyi! Angka = jumlah ranjau di sekitar.</span>
        <button id="ms-cash" disabled class="px-4 py-2 rounded-xl bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-black text-xs uppercase shrink-0">Cash Out</button>
      </div>
    `;
    const cashBtn = document.getElementById('ms-cash');
    cashBtn?.addEventListener('click', () => {
      if (ended || banked <= 0) return;
      ended = true;
      for (let i = 0; i < TOTAL; i++) revealed[i] = true;
      render();
      this.timeouts.push(setTimeout(() => this.finishRound(banked, 'SAFE SWEEP!', `Berhasil mengamankan ${banked} Prize Tickets!`), 750));
    });

    const render = () => {
      if (cashBtn) { cashBtn.disabled = ended || banked <= 0; cashBtn.textContent = `Cash Out (+${banked})`; }
      this.domStage.innerHTML = `
        <div class="grid grid-cols-5 gap-2 p-3 w-full max-w-xs mx-auto">
          ${Array.from({ length: TOTAL })
            .map((_, i) => {
              if (!revealed[i]) {
                return `<button data-ms="${i}" ${ended ? 'disabled' : ''} class="aspect-square rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/35 text-xs font-bold text-cyan-300">?</button>`;
              }
              if (mineSet.has(i)) {
                return `<div class="aspect-square rounded-xl bg-rose-500/30 border border-rose-500 flex items-center justify-center text-lg">💣</div>`;
              }
              const adj = countAdj(i);
              return `<div class="aspect-square rounded-xl bg-slate-950 border border-emerald-500/40 flex items-center justify-center font-mono-num font-black text-sm ${adj === 0 ? 'text-slate-600' : adj === 1 ? 'text-cyan-300' : adj === 2 ? 'text-amber-300' : 'text-rose-400'}">${adj}</div>`;
            })
            .join('')}
        </div>`;

      if (!ended) {
        this.domStage.querySelectorAll('[data-ms]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const idx = parseInt(btn.getAttribute('data-ms'), 10);
            if (revealed[idx] || ended) return;
            revealed[idx] = true;

            if (mineSet.has(idx)) {
              ended = true;
              banked = 0;
              ArcadeAudio.playError();
              for (let i = 0; i < TOTAL; i++) revealed[i] = true;
              render();
              this.timeouts.push(setTimeout(() => this.finishRound(0, 'MINE DETONATED!', 'Kamu menginjak ranjau! Semua tiket ronde ini hangus.'), 1000));
            } else {
              safeOpened += 1;
              banked += 30;
              ArcadeAudio.playCoinInsert();
              updateHud();
              render();
              if (safeOpened >= TOTAL - MINES) {
                ended = true;
                this.timeouts.push(setTimeout(() => this.finishRound(banked + 300, 'BOARD CLEARED!', `Sapu bersih seluruh sel aman (+300 Bonus): ${banked + 300} Tickets!`), 700));
              }
            }
          });
        });
      }
    };
    render();
  },

  // ==================== 21. TURBO MATH RUSH ====================
  runMathBlitz() {
    this.useDomMode();
    let qNum = 1;
    let tickets = 0;
    let timerId = null;

    this.controlsBar.innerHTML = `<p class="text-xs text-center text-cyan-300 font-semibold">Jawab 10 soal hitung cepat! Timer makin cepat tiap soal.</p>`;

    const nextQ = () => {
      if (!this.isRoundActive) return;
      this.setHud({ scoreLabel: 'Tickets Won', scoreVal: tickets.toLocaleString(), infoLabel: 'Question', infoVal: `${qNum} / 10` });

      const maxNum = 10 + qNum * 6;
      const ops = qNum <= 3 ? ['+', '-'] : ['+', '-', '×'];
      const op = ops[Math.floor(Math.random() * ops.length)];
      let a = Math.floor(Math.random() * maxNum) + 2;
      let b = Math.floor(Math.random() * (op === '×' ? 12 : maxNum)) + 2;
      if (op === '-' && b > a) [a, b] = [b, a];
      const ans = op === '+' ? a + b : op === '-' ? a - b : a * b;

      const choices = new Set([ans]);
      while (choices.size < 4) {
        const fake = ans + (Math.floor(Math.random() * 14) - 7);
        if (fake >= 0 && fake !== ans) choices.add(fake);
      }
      const arr = Array.from(choices).sort(() => Math.random() - 0.5);

      const maxMs = Math.max(1900, 4800 - qNum * 270);
      const startT = performance.now();

      this.domStage.innerHTML = `
        <div class="w-full max-w-sm mx-auto p-4 space-y-4 text-center">
          <div class="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div id="mb-bar" class="h-full bg-gradient-to-r from-cyan-400 to-amber-400" style="width:100%"></div>
          </div>
          <div class="py-5 rounded-2xl bg-slate-900 border border-cyan-500/30 font-display font-black text-3xl text-white">${a} ${op} ${b} = ?</div>
          <div class="grid grid-cols-2 gap-3">
            ${arr.map((v) => `<button data-ma="${v}" class="py-3.5 rounded-xl bg-slate-900 hover:bg-cyan-500/20 border border-slate-700 hover:border-cyan-400 font-mono-num font-bold text-lg text-cyan-200">${v}</button>`).join('')}
          </div>
        </div>`;

      clearInterval(timerId);
      timerId = setInterval(() => {
        const left = maxMs - (performance.now() - startT);
        const bar = document.getElementById('mb-bar');
        if (bar) bar.style.width = `${Math.max(0, (left / maxMs) * 100)}%`;
        if (left <= 0) {
          clearInterval(timerId);
          this.finishRound(tickets, 'TIME OUT!', `Waktu habis di soal ke-${qNum}! Total hadiah: ${tickets} Tickets.`);
        }
      }, 30);
      this.intervals.push(timerId);

      this.domStage.querySelectorAll('[data-ma]').forEach((btn) => {
        btn.addEventListener('click', () => {
          clearInterval(timerId);
          const picked = parseInt(btn.getAttribute('data-ma'), 10);
          if (picked === ans) {
            tickets += 25 + qNum * 5;
            ArcadeAudio.playCoinInsert();
            if (qNum >= 10) this.finishRound(tickets + 100, 'MATH GENIUS!', `10 soal beruntun benar (+100 Bonus): ${tickets + 100} Tickets!`);
            else { qNum += 1; nextQ(); }
          } else {
            this.finishRound(tickets, 'WRONG ANSWER!', `Jawaban salah di soal ke-${qNum} (seharusnya ${ans})! Hadiah: ${tickets} Tickets.`);
          }
        });
      });
    };
    nextQ();
  },

  // ==================== 22. CYBER WORD HACKER ====================
  runTypingStorm() {
    const W = 440, H = 440;
    this.useCanvasMode(W, H);
    const ctx = this.ctx;

    const wordList = ['NEON', 'CYBER', 'LASER', 'HACK', 'BYTE', 'NODE', 'PULSE', 'CORE', 'APEX', 'VOLT', 'SYNC', 'DATA', 'CODE', 'GRID', 'WARP', 'FLUX'];
    let tickets = 0;
    let lives = 3;
    let activeWords = [];
    let typed = '';
    let speed = 0.55;

    const updateHud = () => {
      this.setHud({
        scoreLabel: `Tickets | Typed: ${typed || '—'}`,
        scoreVal: tickets.toLocaleString(),
        infoLabel: 'Firewall HP',
        infoVal: '♥'.repeat(lives) + '♡'.repeat(3 - lives)
      });
    };
    updateHud();

    const spawnWord = () => {
      const w = wordList[Math.floor(Math.random() * wordList.length)];
      activeWords.push({ text: w, x: 55 + Math.random() * (W - 110), y: 20 });
    };
    spawnWord();
    const spId = setInterval(() => { if (activeWords.length < 4) spawnWord(); }, 1850);
    this.intervals.push(spId);

    this.controlsBar.innerHTML = `<p class="text-xs text-center text-cyan-300 font-semibold">Ketik huruf kata yang jatuh (Desktop) atau klik langsung kata di layar (Mobile)!</p>`;

    const destroyWord = (idx) => {
      tickets += activeWords[idx].text.length * 12;
      speed = Math.min(2.2, speed + 0.035);
      activeWords.splice(idx, 1);
      typed = '';
      ArcadeAudio.playCoinInsert();
      updateHud();
    };

    const onKey = (e) => {
      if (!this.isRoundActive) return;
      if (e.key === 'Backspace') { typed = typed.slice(0, -1); updateHud(); return; }
      if (/^[a-zA-Z]$/.test(e.key)) {
        typed += e.key.toUpperCase();
        const exactIdx = activeWords.findIndex((w) => w.text === typed);
        if (exactIdx !== -1) { destroyWord(exactIdx); return; }
        if (!activeWords.some((w) => w.text.startsWith(typed))) typed = '';
        updateHud();
      }
    };
    const onClick = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mx = ((e.clientX - rect.left) / rect.width) * W;
      const my = ((e.clientY - rect.top) / rect.height) * H;
      for (let i = activeWords.length - 1; i >= 0; i--) {
        const w = activeWords[i];
        if (Math.abs(mx - w.x) < 42 && Math.abs(my - w.y) < 22) { destroyWord(i); break; }
      }
    };
    window.addEventListener('keydown', onKey);
    this.canvas.addEventListener('pointerdown', onClick);
    this.cleanupFns.push(() => { window.removeEventListener('keydown', onKey); this.canvas.removeEventListener('pointerdown', onClick); });

    const loop = () => {
      if (!this.isRoundActive) return;
      for (let i = activeWords.length - 1; i >= 0; i--) {
        activeWords[i].y += speed;
        if (activeWords[i].y >= H - 28) {
          activeWords.splice(i, 1);
          lives -= 1;
          ArcadeAudio.playError();
          updateHud();
          if (lives <= 0) {
            this.finishRound(tickets, 'FIREWALL BREACHED!', `Sistem ditembus kode jatuh! Total hadiah: ${tickets} Tickets.`);
            return;
          }
        }
      }

      ctx.fillStyle = '#060913';
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = '#f43f5e'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, H - 24); ctx.lineTo(W, H - 24); ctx.stroke();

      for (const w of activeWords) {
        const matched = typed && w.text.startsWith(typed);
        ctx.fillStyle = matched ? 'rgba(34, 211, 238, 0.25)' : 'rgba(15, 23, 42, 0.9)';
        ctx.strokeStyle = matched ? '#22d3ee' : '#c084fc';
        ctx.lineWidth = 2;
        ctx.fillRect(w.x - 40, w.y - 14, 80, 28);
        ctx.strokeRect(w.x - 40, w.y - 14, 80, 28);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 13px JetBrains Mono, monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(w.text, w.x, w.y);
      }

      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  },

  // ==================== 23. GRAVITY SWITCH (G-SWITCH) ====================
  runGravityFlip() {
    const W = 460, H = 360;
    this.useCanvasMode(W, H);
    const ctx = this.ctx;

    let player = { x: 80, y: H - 56, size: 24, vy: 0, gravDir: 1 };
    let obstacles = [];
    let passed = 0;
    let hearts = 3;
    let invuln = 0;
    let speed = 2.4;
    let spawnDist = 0;
    const TARGET = 12;

    const updateHud = () => {
      this.setHud({
        scoreLabel: `Gates (${passed}/${TARGET})`,
        scoreVal: `${passed * 30} TIX`,
        infoLabel: 'Hearts',
        infoVal: '♥'.repeat(hearts) + '♡'.repeat(3 - hearts)
      });
    };
    updateHud();

    const flip = () => {
      if (!this.isRoundActive) return;
      player.gravDir *= -1;
      ArcadeAudio.playLaser();
    };

    this.controlsBar.innerHTML = `<button id="gf-btn" class="w-full py-3 rounded-xl bg-amber-400 text-slate-950 font-black text-xs uppercase">🧲 FLIP GRAVITY (Space / Klik Layar)</button>`;
    document.getElementById('gf-btn')?.addEventListener('pointerdown', (e) => { e.preventDefault(); flip(); });
    this.canvas.addEventListener('pointerdown', flip);
    const onKey = (e) => { if (e.code === 'Space' || e.key === 'ArrowUp' || e.key === 'ArrowDown') { e.preventDefault(); flip(); } };
    window.addEventListener('keydown', onKey);
    this.cleanupFns.push(() => { this.canvas.removeEventListener('pointerdown', flip); window.removeEventListener('keydown', onKey); });

    const loop = () => {
      if (!this.isRoundActive) return;
      if (invuln > 0) invuln -= 1;
      player.vy += 0.9 * player.gravDir;
      player.vy = Math.max(-11, Math.min(11, player.vy));
      player.y += player.vy;
      if (player.y < 28) { player.y = 28; player.vy = 0; }
      if (player.y > H - 28 - player.size) { player.y = H - 28 - player.size; player.vy = 0; }

      spawnDist += speed;
      if (spawnDist >= 235) {
        spawnDist = 0;
        const onTop = Math.random() < 0.5;
        obstacles.push({
          x: W + 20,
          y: onTop ? 28 : H - 28 - 115,
          w: 24,
          h: 115,
          scored: false
        });
      }

      for (let i = obstacles.length - 1; i >= 0; i--) {
        const o = obstacles[i];
        o.x -= speed;
        if (invuln === 0 && player.x + 2 < o.x + o.w && player.x + player.size - 2 > o.x && player.y + 2 < o.y + o.h && player.y + player.size - 2 > o.y) {
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
          if (passed > 3) speed = Math.min(8.0, 2.4 + (passed - 3) * 0.13);
          ArcadeAudio.playTick(0.8);
          updateHud();
          if (passed >= TARGET) {
            this.finishRound(400, 'GRAVITY MASTER!', `Berhasil melewati ${TARGET} rintangan gravitasi (+400 Tickets)!`);
            return;
          }
        }
        if (o.x < -30) obstacles.splice(i, 1);
      }

      ctx.fillStyle = '#060913';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, W, 28);
      ctx.fillRect(0, H - 28, W, 28);
      if (invuln === 0 || invuln % 8 < 4) {
        ctx.fillStyle = invuln > 0 ? '#fbbf24' : '#22d3ee';
        ctx.fillRect(player.x, player.y, player.size, player.size);
      }
      ctx.fillStyle = '#f43f5e';
      obstacles.forEach((o) => ctx.fillRect(o.x, o.y, o.w, o.h));

      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  },

  // ==================== 24. NEON KEEPY-UPPY ====================
  runPaddleKeepup() {
    const W = 420, H = 460;
    this.useCanvasMode(W, H);
    const ctx = this.ctx;

    let kicks = 0;
    let ball = { x: W / 2, y: 120, vx: 1.2, vy: 0, r: 24 };
    let gravity = 0.18;

    const updateHud = () => {
      this.setHud({
        scoreLabel: 'Tickets (15/Kick)',
        scoreVal: (kicks * 15).toLocaleString(),
        infoLabel: 'Kicks',
        infoVal: `${kicks}`
      });
    };
    updateHud();

    this.controlsBar.innerHTML = `<p class="text-xs text-center text-cyan-300 font-semibold">Klik/Tap tepat di bola untuk menendangnya ke atas! Jangan sampai jatuh!</p>`;

    const onKick = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mx = ((e.clientX - rect.left) / rect.width) * W;
      const my = ((e.clientY - rect.top) / rect.height) * H;
      if (Math.hypot(mx - ball.x, my - ball.y) <= ball.r + 18) {
        kicks += 1;
        ball.vy = -(6.8 + Math.min(2.8, kicks * 0.08));
        ball.vx = (ball.x - mx) * 0.25 + (Math.random() - 0.5) * 2.0;
        gravity = Math.min(0.42, 0.18 + kicks * 0.005);
        ArcadeAudio.playBounce();
        updateHud();
      }
    };
    this.canvas.addEventListener('pointerdown', onKick);
    this.cleanupFns.push(() => this.canvas.removeEventListener('pointerdown', onKick));

    const loop = () => {
      if (!this.isRoundActive) return;
      ball.vy += gravity;
      ball.x += ball.vx;
      ball.y += ball.vy;

      if (ball.x - ball.r < 8) { ball.x = 8 + ball.r; ball.vx = Math.abs(ball.vx); }
      if (ball.x + ball.r > W - 8) { ball.x = W - 8 - ball.r; ball.vx = -Math.abs(ball.vx); }
      if (ball.y - ball.r < 8) { ball.y = 8 + ball.r; ball.vy = Math.abs(ball.vy) * 0.7; }

      if (ball.y > H + ball.r) {
        this.finishRound(kicks * 15, 'BALL DROPPED!', `Total ${kicks} tendangan juggle! Hadiah: ${kicks * 15} Tickets.`);
        return;
      }

      ctx.fillStyle = '#060913';
      ctx.fillRect(0, 0, W, H);
      ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
      ctx.fillStyle = '#22d3ee'; ctx.fill();
      ctx.lineWidth = 4; ctx.strokeStyle = '#fbbf24'; ctx.stroke();
      ctx.font = '22px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('⚽', ball.x, ball.y);

      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  },

  // ==================== 25. CHROMA CATCHER ====================
  runColorCatch() {
    const W = 440, H = 460;
    this.useCanvasMode(W, H);
    const ctx = this.ctx;

    const palette = [
      { name: 'CYAN', hex: '#22d3ee' },
      { name: 'AMBER', hex: '#fbbf24' },
      { name: 'PURPLE', hex: '#c084fc' }
    ];
    let target = palette[0];
    let bucketX = W / 2 - 40;
    const bW = 80;
    let tickets = 0;
    let lives = 3;
    let orbs = [];
    let speed = 2.1;

    const updateHud = () => {
      this.setHud({
        scoreLabel: `Catch: ${target.name}`,
        scoreVal: tickets.toLocaleString(),
        infoLabel: 'Lives',
        infoVal: '♥'.repeat(lives) + '♡'.repeat(3 - lives)
      });
    };
    updateHud();

    this.controlsBar.innerHTML = `<p class="text-xs text-center text-amber-300 font-semibold">Tangkap HANYA warna yang tertulis di HUD! Target berubah setiap 6 detik.</p>`;

    const shiftId = setInterval(() => {
      target = palette[Math.floor(Math.random() * palette.length)];
      ArcadeAudio.playClick();
      updateHud();
    }, 6000);
    const spId = setInterval(() => {
      const c = palette[Math.floor(Math.random() * palette.length)];
      orbs.push({ x: 24 + Math.random() * (W - 48), y: -15, r: 13, color: c });
      speed = Math.min(5.5, speed + 0.045);
    }, 700);
    this.intervals.push(shiftId, spId);

    const onMove = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mx = ((e.clientX - rect.left) / rect.width) * W;
      bucketX = Math.max(8, Math.min(W - bW - 8, mx - bW / 2));
    };
    this.canvas.addEventListener('pointermove', onMove);
    this.cleanupFns.push(() => this.canvas.removeEventListener('pointermove', onMove));

    const loop = () => {
      if (!this.isRoundActive) return;

      for (let i = orbs.length - 1; i >= 0; i--) {
        const o = orbs[i];
        o.y += speed;
        if (o.y + o.r >= H - 34 && o.y - o.r <= H - 14 && o.x >= bucketX && o.x <= bucketX + bW) {
          if (o.color.name === target.name) {
            tickets += 25;
            ArcadeAudio.playCoinInsert();
          } else {
            lives -= 1;
            ArcadeAudio.playError();
            if (lives <= 0) {
              this.finishRound(tickets, 'WRONG COLOR!', `Nyawa habis! Total hadiah: ${tickets} Tickets.`);
              return;
            }
          }
          orbs.splice(i, 1);
          updateHud();
          continue;
        }
        if (o.y > H + 20) orbs.splice(i, 1);
      }

      ctx.fillStyle = '#060913';
      ctx.fillRect(0, 0, W, H);
      for (const o of orbs) {
        ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
        ctx.fillStyle = o.color.hex; ctx.fill();
      }
      ctx.fillStyle = target.hex;
      ctx.fillRect(bucketX, H - 32, bW, 16);

      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  },

  // ==================== 26. WIRE PULSE RUN ====================
  runLaserMaze() {
    const W = 440, H = 460;
    this.useCanvasMode(W, H);
    const ctx = this.ctx;

    let orbX = W / 2;
    let walls = [];
    let passed = 0;
    let hearts = 3;
    let invuln = 0;
    let speed = 2.0;
    let distAcc = 0;
    const TARGET = 15;

    const updateHud = () => {
      this.setHud({
        scoreLabel: `Gates (${passed}/${TARGET})`,
        scoreVal: `${passed * 25} TIX`,
        infoLabel: 'Hearts',
        infoVal: '♥'.repeat(hearts) + '♡'.repeat(3 - hearts)
      });
    };
    updateHud();

    this.controlsBar.innerHTML = `<p class="text-xs text-center text-cyan-300 font-semibold">Geser orb biru melewati celah gerbang laser merah tanpa menyentuhnya!</p>`;

    const onMove = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      orbX = Math.max(14, Math.min(W - 14, ((e.clientX - rect.left) / rect.width) * W));
    };
    this.canvas.addEventListener('pointermove', onMove);
    this.cleanupFns.push(() => this.canvas.removeEventListener('pointermove', onMove));

    const loop = () => {
      if (!this.isRoundActive) return;
      if (invuln > 0) invuln -= 1;
      distAcc += speed;
      if (distAcc >= 175) {
        distAcc = 0;
        const rampP = Math.max(0, passed - 3);
        const gapW = Math.max(54, 114 - rampP * 1.8);
        const gapX = 24 + Math.random() * (W - gapW - 48);
        walls.push({ y: -20, gapX, gapW, h: 18, scored: false });
      }

      for (let i = walls.length - 1; i >= 0; i--) {
        const w = walls[i];
        w.y += speed;
        if (invuln === 0 && H - 70 + 9 > w.y && H - 70 - 9 < w.y + w.h) {
          if (orbX - 9 < w.gapX || orbX + 9 > w.gapX + w.gapW) {
            walls.splice(i, 1);
            hearts -= 1;
            ArcadeAudio.playError();
            updateHud();
            if (hearts <= 0) {
              this.finishRound(0, 'HATI HABIS — KALAH!', `Ketiga hati habis sebelum melewati ${TARGET} gerbang! (0 Tickets).`);
              return;
            }
            invuln = 55;
            continue;
          }
        }
        if (!w.scored && w.y > H - 60) {
          w.scored = true;
          passed += 1;
          if (passed > 3) speed = Math.min(6.0, 2.0 + (passed - 3) * 0.09);
          ArcadeAudio.playTick(0.7);
          updateHud();
          if (passed >= TARGET) {
            this.finishRound(400, 'PULSE MAZE CLEARED!', `Berhasil melewati ${TARGET} gerbang laser dengan ${hearts} hati (+400 Tickets)!`);
            return;
          }
        }
        if (w.y > H + 30) walls.splice(i, 1);
      }

      ctx.fillStyle = '#060913';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#f43f5e';
      for (const w of walls) {
        ctx.fillRect(0, w.y, w.gapX, w.h);
        ctx.fillRect(w.gapX + w.gapW, w.y, W - (w.gapX + w.gapW), w.h);
      }
      if (invuln === 0 || invuln % 8 < 4) {
        ctx.beginPath(); ctx.arc(orbX, H - 70, 10, 0, Math.PI * 2);
        ctx.fillStyle = invuln > 0 ? '#fbbf24' : '#22d3ee'; ctx.fill();
      }

      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  },

  // ==================== 27. NEON HOPPER (FROGGER) ====================
  runCrossyNeon() {
    const W = 420, H = 440, STEP = 44;
    this.useCanvasMode(W, H);
    const ctx = this.ctx;

    let frog = { x: W / 2 - 14, y: H - 36, size: 26 };
    let tickets = 0;
    let level = 1;
    let hearts = 3;
    const lanes = [];

    const buildLanes = () => {
      lanes.length = 0;
      for (let r = 0; r < 6; r++) {
        const dir = r % 2 === 0 ? 1 : -1;
        const spd = (1.5 + level * 0.45 + (r % 3) * 0.4) * dir;
        const cars = [];
        for (let c = 0; c < 3; c++) cars.push({ x: c * 155 + Math.random() * 30, w: 54 });
        lanes.push({ y: 90 + r * STEP, spd, cars, color: r % 2 === 0 ? '#f43f5e' : '#c084fc' });
      }
    };
    buildLanes();

    const updateHud = () => {
      this.setHud({
        scoreLabel: `Crossings (${level - 1}/3)`,
        scoreVal: tickets.toLocaleString(),
        infoLabel: 'Hearts',
        infoVal: '♥'.repeat(hearts) + '♡'.repeat(3 - hearts)
      });
    };
    updateHud();

    const hop = (dx, dy) => {
      if (!this.isRoundActive) return;
      frog.x = Math.max(8, Math.min(W - frog.size - 8, frog.x + dx * STEP));
      frog.y = Math.max(24, Math.min(H - 36, frog.y + dy * STEP));
      ArcadeAudio.playClick();
      if (frog.y <= 55) {
        tickets += 150;
        if (level >= 3) {
          this.finishRound(tickets, 'HIGHWAY CONQUERED!', `Berhasil menyeberang 3 kali dengan ${hearts} hati tersisa (+${tickets} Tickets)!`);
          return;
        }
        level += 1;
        frog.y = H - 36;
        buildLanes();
        ArcadeAudio.playCoinInsert();
        updateHud();
      }
    };

    this.controlsBar.innerHTML = `
      <div class="flex items-center justify-center gap-2 w-full">
        <button id="cn-l" class="px-4 py-2.5 rounded-xl bg-slate-900 border border-cyan-500/40 text-cyan-300 font-bold">◀</button>
        <button id="cn-u" class="px-5 py-2.5 rounded-xl bg-emerald-400 text-slate-950 font-black">▲ LOMPAT</button>
        <button id="cn-d" class="px-4 py-2.5 rounded-xl bg-slate-900 border border-cyan-500/40 text-cyan-300 font-bold">▼</button>
        <button id="cn-r" class="px-4 py-2.5 rounded-xl bg-slate-900 border border-cyan-500/40 text-cyan-300 font-bold">▶</button>
      </div>
    `;
    document.getElementById('cn-l')?.addEventListener('click', () => hop(-1, 0));
    document.getElementById('cn-r')?.addEventListener('click', () => hop(1, 0));
    document.getElementById('cn-u')?.addEventListener('click', () => hop(0, -1));
    document.getElementById('cn-d')?.addEventListener('click', () => hop(0, 1));
    const onK = (e) => {
      if (e.key === 'ArrowUp' || e.key === 'w') { e.preventDefault(); hop(0, -1); }
      if (e.key === 'ArrowDown' || e.key === 's') { e.preventDefault(); hop(0, 1); }
      if (e.key === 'ArrowLeft' || e.key === 'a') { e.preventDefault(); hop(-1, 0); }
      if (e.key === 'ArrowRight' || e.key === 'd') { e.preventDefault(); hop(1, 0); }
    };
    window.addEventListener('keydown', onK);
    this.cleanupFns.push(() => window.removeEventListener('keydown', onK));

    const loop = () => {
      if (!this.isRoundActive) return;

      for (const l of lanes) {
        for (const c of l.cars) {
          c.x += l.spd;
          if (l.spd > 0 && c.x > W + 20) c.x = -65;
          if (l.spd < 0 && c.x < -70) c.x = W + 20;

          if (frog.x + 3 < c.x + c.w && frog.x + frog.size - 3 > c.x && frog.y + 3 < l.y + 28 && frog.y + frog.size - 3 > l.y) {
            hearts -= 1;
            ArcadeAudio.playError();
            updateHud();
            if (hearts <= 0) {
              this.finishRound(0, 'HATI HABIS — KALAH!', `Ketiga hati habis tertabrak kendaraan di Level ${level}! (0 Tickets).`);
              return;
            }
            frog.x = W / 2 - 14;
            frog.y = H - 36;
            break;
          }
        }
      }

      ctx.fillStyle = '#060913';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(52, 211, 153, 0.2)';
      ctx.fillRect(0, 18, W, 56);
      for (const l of lanes) {
        ctx.fillStyle = 'rgba(255,255,255,0.03)';
        ctx.fillRect(0, l.y - 4, W, 36);
        ctx.fillStyle = l.color;
        for (const c of l.cars) ctx.fillRect(c.x, l.y, c.w, 28);
      }
      ctx.fillStyle = '#34d399';
      ctx.fillRect(frog.x, frog.y, frog.size, frog.size);

      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  },

  // ==================== 28. ORBITAL DEFENSE ====================
  runAsteroidTurret() {
    const W = 440, H = 440, CX = W / 2, CY = H / 2;
    this.useCanvasMode(W, H);
    const ctx = this.ctx;

    let tickets = 0;
    let timeLeft = 25;
    let hearts = 3;
    let shots = [];
    let rocks = [];

    const updateHud = () => {
      this.setHud({
        scoreLabel: `Tickets (${timeLeft}s)`,
        scoreVal: tickets.toLocaleString(),
        infoLabel: 'Hearts',
        infoVal: '♥'.repeat(hearts) + '♡'.repeat(3 - hearts)
      });
    };
    updateHud();

    this.controlsBar.innerHTML = `<p class="text-xs text-center text-cyan-300 font-semibold">3 Hati! Tembak asteroid &amp; bertahan 25 detik. Hati habis = KALAH!</p>`;

    const secId = setInterval(() => {
      timeLeft -= 1;
      updateHud();
      if (timeLeft <= 0) {
        clearInterval(secId);
        this.finishRound(tickets + 150, 'CORE DEFENDED!', `Reaktor selamat 25 detik (+150 Bonus): ${tickets + 150} Tickets!`);
      }
    }, 1000);
    const spId = setInterval(() => {
      const elapsed = 25 - timeLeft;
      const ang = Math.random() * Math.PI * 2;
      const dist = 290;
      const spd = 0.9 + elapsed * 0.045;
      rocks.push({
        x: CX + Math.cos(ang) * dist,
        y: CY + Math.sin(ang) * dist,
        vx: -Math.cos(ang) * spd,
        vy: -Math.sin(ang) * spd,
        r: 15
      });
    }, 950);
    this.intervals.push(secId, spId);

    const onShoot = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mx = ((e.clientX - rect.left) / rect.width) * W;
      const my = ((e.clientY - rect.top) / rect.height) * H;
      const ang = Math.atan2(my - CY, mx - CX);
      shots.push({ x: CX, y: CY, vx: Math.cos(ang) * 8, vy: Math.sin(ang) * 8 });
      ArcadeAudio.playLaser();
    };
    this.canvas.addEventListener('pointerdown', onShoot);
    this.cleanupFns.push(() => this.canvas.removeEventListener('pointerdown', onShoot));

    const loop = () => {
      if (!this.isRoundActive) return;

      for (let i = shots.length - 1; i >= 0; i--) {
        const s = shots[i];
        s.x += s.vx; s.y += s.vy;
        if (s.x < 0 || s.x > W || s.y < 0 || s.y > H) shots.splice(i, 1);
      }

      for (let i = rocks.length - 1; i >= 0; i--) {
        const r = rocks[i];
        r.x += r.vx; r.y += r.vy;
        if (Math.hypot(r.x - CX, r.y - CY) < 22 + r.r) {
          rocks.splice(i, 1);
          hearts -= 1;
          ArcadeAudio.playError();
          updateHud();
          if (hearts <= 0) {
            this.finishRound(0, 'HATI HABIS — KALAH!', `Inti reaktor hancur kehabisan 3 hati! (0 Tickets).`);
            return;
          }
          continue;
        }
        for (let j = shots.length - 1; j >= 0; j--) {
          if (Math.hypot(r.x - shots[j].x, r.y - shots[j].y) < r.r + 5) {
            tickets += 25;
            rocks.splice(i, 1);
            shots.splice(j, 1);
            ArcadeAudio.playCoinInsert();
            updateHud();
            break;
          }
        }
      }

      ctx.fillStyle = '#060913';
      ctx.fillRect(0, 0, W, H);
      ctx.beginPath(); ctx.arc(CX, CY, 22, 0, Math.PI * 2);
      ctx.fillStyle = '#22d3ee'; ctx.fill();
      ctx.fillStyle = '#fbbf24';
      shots.forEach((s) => { ctx.beginPath(); ctx.arc(s.x, s.y, 4, 0, Math.PI * 2); ctx.fill(); });
      ctx.fillStyle = '#f43f5e';
      rocks.forEach((r) => { ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2); ctx.fill(); });

      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  },

  // ==================== 29. QUICK DRAW DUEL ====================
  runReactionDuel() {
    this.useDomMode();
    let round = 1;
    let tickets = 0;
    let state = 'waiting'; // waiting | ready
    let goTime = 0;

    this.controlsBar.innerHTML = `<p class="text-xs text-center text-cyan-300 font-semibold">Tunggu layar berubah HIJAU lalu klik secepat mungkin! Klik sebelum hijau = FOUL!</p>`;

    const startDuel = () => {
      if (!this.isRoundActive) return;
      state = 'waiting';
      const rivalLimit = Math.max(240, 620 - round * 80);
      this.setHud({ scoreLabel: 'Tickets Won', scoreVal: tickets.toLocaleString(), infoLabel: `Duel ${round}/5`, infoVal: `Rival: ${rivalLimit}ms` });

      this.domStage.innerHTML = `
        <div class="p-6 text-center">
          <button id="rd-pad" class="w-full max-w-xs h-52 mx-auto rounded-3xl bg-rose-500/20 border-2 border-rose-500 flex flex-col items-center justify-center gap-2 transition-all">
            <span class="font-display font-black text-2xl text-rose-300">WAIT...</span>
            <span class="text-xs text-slate-400">Jangan klik dulu!</span>
          </button>
        </div>`;

      const pad = document.getElementById('rd-pad');
      const delay = 1100 + Math.random() * 1900;
      const tId = setTimeout(() => {
        if (!this.isRoundActive || !pad) return;
        state = 'ready';
        goTime = performance.now();
        pad.className = 'w-full max-w-xs h-52 mx-auto rounded-3xl bg-emerald-500 border-2 border-white flex flex-col items-center justify-center gap-2 shadow-[0_0_35px_#34d399]';
        pad.innerHTML = `<span class="font-display font-black text-3xl text-slate-950">FIRE!!</span><span class="text-xs font-bold text-slate-900">KLIK SEKARANG!</span>`;
        ArcadeAudio.playLaser();
      }, delay);
      this.timeouts.push(tId);

      pad?.addEventListener('pointerdown', () => {
        if (!this.isRoundActive) return;
        clearTimeout(tId);
        if (state === 'waiting') {
          this.finishRound(tickets, 'FALSE START!', `Kamu menembak terlalu cepat di Duel #${round}! Total: ${tickets} Tickets.`);
          return;
        }
        const reaction = Math.round(performance.now() - goTime);
        if (reaction <= rivalLimit) {
          tickets += 70 + round * 20;
          ArcadeAudio.playCoinInsert();
          if (round >= 5) {
            this.finishRound(tickets + 150, 'FASTEST IN THE WEST!', `Menang 5 duel berturut-turut (+150 Bonus): ${tickets + 150} Tickets!`);
          } else {
            round += 1;
            startDuel();
          }
        } else {
          this.finishRound(tickets, 'TOO SLOW!', `Reaksi ${reaction}ms kalah dari rival (${rivalLimit}ms)! Total: ${tickets} Tickets.`);
        }
      });
    };
    startDuel();
  },

  // ==================== 30. NEON BALLOON BLITZ ====================
  runBalloonPop() {
    const W = 440, H = 460;
    this.useCanvasMode(W, H);
    const ctx = this.ctx;

    let tickets = 0;
    let escaped = 0;
    let elapsed = 0;
    let balloons = [];

    const updateHud = () => {
      this.setHud({
        scoreLabel: 'Tickets Won',
        scoreVal: tickets.toLocaleString(),
        infoLabel: 'Escaped (Max 4)',
        infoVal: `${escaped} / 4`
      });
    };
    updateHud();

    this.controlsBar.innerHTML = `<p class="text-xs text-center text-cyan-300 font-semibold">Pecahkan balon sebelum terbang lewat atas! Hindari 🐡 balon berduri!</p>`;

    const secId = setInterval(() => { elapsed += 1; }, 1000);
    const spId = setInterval(() => {
      const isSpike = Math.random() < (elapsed < 6 ? 0.12 : 0.22);
      balloons.push({
        x: 34 + Math.random() * (W - 68),
        y: H + 25,
        vy: 1.4 + elapsed * 0.09 + Math.random() * 0.7,
        r: 21,
        isSpike,
        pts: isSpike ? 0 : Math.random() < 0.2 ? 50 : 20,
        color: isSpike ? '#f43f5e' : '#22d3ee'
      });
    }, 780);
    this.intervals.push(secId, spId);

    const onPop = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mx = ((e.clientX - rect.left) / rect.width) * W;
      const my = ((e.clientY - rect.top) / rect.height) * H;
      for (let i = balloons.length - 1; i >= 0; i--) {
        const b = balloons[i];
        if (Math.hypot(mx - b.x, my - b.y) <= b.r + 6) {
          if (b.isSpike) {
            this.finishRound(Math.floor(tickets * 0.5), 'SPIKE BALLOON!', `Kamu memecahkan 🐡 berduri! Hadiah dipotong 50% menjadi ${Math.floor(tickets * 0.5)}.`);
            return;
          }
          tickets += b.pts;
          balloons.splice(i, 1);
          ArcadeAudio.playBounce();
          updateHud();
          break;
        }
      }
    };
    this.canvas.addEventListener('pointerdown', onPop);
    this.cleanupFns.push(() => this.canvas.removeEventListener('pointerdown', onPop));

    const loop = () => {
      if (!this.isRoundActive) return;

      for (let i = balloons.length - 1; i >= 0; i--) {
        const b = balloons[i];
        b.y -= b.vy;
        if (b.y < -25) {
          if (!b.isSpike) {
            escaped += 1;
            ArcadeAudio.playError();
            updateHud();
            if (escaped >= 4) {
              this.finishRound(tickets, 'BALLOONS ESCAPED!', `4 balon lolos ke langit! Total hadiah: ${tickets} Tickets.`);
              return;
            }
          }
          balloons.splice(i, 1);
        }
      }

      ctx.fillStyle = '#060913';
      ctx.fillRect(0, 0, W, H);
      for (const b of balloons) {
        ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = b.isSpike ? '#450a0a' : '#0f172a'; ctx.fill();
        ctx.strokeStyle = b.pts === 50 ? '#fbbf24' : b.color; ctx.lineWidth = 3; ctx.stroke();
        ctx.font = '18px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(b.isSpike ? '🐡' : '🎈', b.x, b.y);
      }

      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  },

  // ==================== 31. RING ORBIT DASH ====================
  runOrbitJump() {
    const W = 420, H = 420, CX = W / 2, CY = H / 2;
    this.useCanvasMode(W, H);
    const ctx = this.ctx;

    let angle = 0;
    let outerTrack = true;
    let laps = 0;
    let hearts = 3;
    let invuln = 0;
    let speed = 0.025;
    const TARGET_LAPS = 6;
    const spikes = [
      { ang: 1.5, outer: true },
      { ang: 3.3, outer: false },
      { ang: 4.9, outer: true }
    ];

    const updateHud = () => {
      this.setHud({
        scoreLabel: `Laps (${laps}/${TARGET_LAPS})`,
        scoreVal: `${laps * 70} TIX`,
        infoLabel: 'Hearts',
        infoVal: '♥'.repeat(hearts) + '♡'.repeat(3 - hearts)
      });
    };
    updateHud();

    const toggleTrack = () => {
      if (!this.isRoundActive) return;
      outerTrack = !outerTrack;
      ArcadeAudio.playLaser();
    };

    this.controlsBar.innerHTML = `<button id="oj-btn" class="w-full py-3 rounded-xl bg-purple-500 text-white font-black text-xs uppercase">🪐 SWITCH ORBIT (Space / Klik Layar)</button>`;
    document.getElementById('oj-btn')?.addEventListener('pointerdown', (e) => { e.preventDefault(); toggleTrack(); });
    this.canvas.addEventListener('pointerdown', toggleTrack);
    const onKey = (e) => { if (e.code === 'Space') { e.preventDefault(); toggleTrack(); } };
    window.addEventListener('keydown', onKey);
    this.cleanupFns.push(() => { this.canvas.removeEventListener('pointerdown', toggleTrack); window.removeEventListener('keydown', onKey); });

    const loop = () => {
      if (!this.isRoundActive) return;
      if (invuln > 0) invuln -= 1;
      const prevAng = angle;
      angle = (angle + speed) % (Math.PI * 2);
      if (angle < prevAng) {
        laps += 1;
        speed = Math.min(0.068, 0.025 + laps * 0.003);
        ArcadeAudio.playCoinInsert();
        updateHud();
        if (laps >= TARGET_LAPS) {
          this.finishRound(420, 'ORBIT CHAMPION!', `Menyelesaikan ${TARGET_LAPS} putaran orbit dengan ${hearts} hati tersisa (+420 Tickets)!`);
          return;
        }
      }

      const rPlayer = outerTrack ? 155 : 108;
      const px = CX + Math.cos(angle) * rPlayer;
      const py = CY + Math.sin(angle) * rPlayer;

      for (const s of spikes) {
        const sr = s.outer ? 155 : 108;
        const sx = CX + Math.cos(s.ang) * sr;
        const sy = CY + Math.sin(s.ang) * sr;
        if (invuln === 0 && Math.hypot(px - sx, py - sy) < 18) {
          hearts -= 1;
          ArcadeAudio.playError();
          updateHud();
          if (hearts <= 0) {
            this.finishRound(0, 'HATI HABIS — KALAH!', `Ketiga hati habis menabrak duri merah di putaran ke-${laps + 1}! (0 Tickets).`);
            return;
          }
          invuln = 55;
          break;
        }
      }

      ctx.fillStyle = '#060913';
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.35)'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(CX, CY, 155, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(CX, CY, 108, 0, Math.PI * 2); ctx.stroke();

      for (const s of spikes) {
        const sr = s.outer ? 155 : 108;
        ctx.beginPath(); ctx.arc(CX + Math.cos(s.ang) * sr, CY + Math.sin(s.ang) * sr, 11, 0, Math.PI * 2);
        ctx.fillStyle = '#f43f5e'; ctx.fill();
      }

      if (invuln === 0 || invuln % 8 < 4) {
        ctx.beginPath(); ctx.arc(px, py, 12, 0, Math.PI * 2);
        ctx.fillStyle = invuln > 0 ? '#fbbf24' : '#22d3ee'; ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
      }

      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  },

  // ==================== 32. NEON AIR HOCKEY (1P / 2P) ====================
  runAirHockey() {
    const W = 400, H = 480;
    this.useCanvasMode(W, H);
    const ctx = this.ctx;
    const is2P = this.playerMode === '2p';

    const p1 = { x: W / 2, y: H - 65, r: 22, vx: 0, vy: 0 };
    const p2 = { x: W / 2, y: 65, r: 22, vx: 0, vy: 0 };
    const puck = { x: W / 2, y: H / 2, vx: 0, vy: 0, r: 12 };
    let s1 = 0, s2 = 0;
    const GOAL_W = 136;

    const updateHud = () => {
      this.setHud({
        scoreLabel: is2P ? 'P1 (Bawah) - P2 (Atas)' : 'You - AI (First to 5)',
        scoreVal: `${s1} - ${s2}`,
        infoLabel: 'Mode',
        infoVal: is2P ? '2P TABLE' : '1P SOLO'
      });
    };
    updateHud();

    this.controlsBar.innerHTML = is2P
      ? `<p class="text-xs text-center text-purple-300 font-semibold">2P: P1 geser bawah (WASD / sentuh bawah) • P2 geser atas (Panah / sentuh atas)!</p>`
      : `<p class="text-xs text-center text-cyan-300 font-semibold">1P: Gerakkan pemukul biru dengan mouse/sentuhan/WASD! Gol 5x untuk menang 400 Tickets.</p>`;

    const keys = {};
    const onKD = (e) => { keys[e.key] = true; if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault(); };
    const onKU = (e) => { keys[e.key] = false; };
    window.addEventListener('keydown', onKD);
    window.addEventListener('keyup', onKU);

    const onMove = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mx = ((e.clientX - rect.left) / rect.width) * W;
      const my = ((e.clientY - rect.top) / rect.height) * H;
      if (!is2P || my > H / 2) {
        p1.x = Math.max(p1.r + 8, Math.min(W - p1.r - 8, mx));
        p1.y = Math.max(H / 2 + p1.r, Math.min(H - p1.r - 8, my));
      } else if (is2P && my <= H / 2) {
        p2.x = Math.max(p2.r + 8, Math.min(W - p2.r - 8, mx));
        p2.y = Math.max(p2.r + 8, Math.min(H / 2 - p2.r, my));
      }
    };
    this.canvas.addEventListener('pointermove', onMove);
    this.cleanupFns.push(() => {
      window.removeEventListener('keydown', onKD);
      window.removeEventListener('keyup', onKU);
      this.canvas.removeEventListener('pointermove', onMove);
    });

    const resetPuck = (toBottom) => {
      puck.x = W / 2;
      puck.y = H / 2 + (toBottom ? 35 : -35);
      puck.vx = (Math.random() - 0.5) * 3;
      puck.vy = toBottom ? 2.5 : -2.5;
    };
    resetPuck(true);

    const collideMallet = (m) => {
      const dx = puck.x - m.x, dy = puck.y - m.y;
      const dist = Math.hypot(dx, dy);
      if (dist < puck.r + m.r && dist > 0.001) {
        const nx = dx / dist, ny = dy / dist;
        puck.x = m.x + nx * (puck.r + m.r + 1);
        puck.y = m.y + ny * (puck.r + m.r + 1);
        const spd = Math.max(6.2, Math.min(11, Math.hypot(puck.vx, puck.vy) * 1.08));
        puck.vx = nx * spd + m.vx * 0.45;
        puck.vy = ny * spd + m.vy * 0.45;
        ArcadeAudio.playBounce();
      }
    };

    const loop = () => {
      if (!this.isRoundActive) return;

      const prev1x = p1.x, prev1y = p1.y;
      if (keys['a'] || keys['A'] || (!is2P && keys['ArrowLeft'])) p1.x -= 6;
      if (keys['d'] || keys['D'] || (!is2P && keys['ArrowRight'])) p1.x += 6;
      if (keys['w'] || keys['W'] || (!is2P && keys['ArrowUp'])) p1.y -= 6;
      if (keys['s'] || keys['S'] || (!is2P && keys['ArrowDown'])) p1.y += 6;
      p1.x = Math.max(p1.r + 8, Math.min(W - p1.r - 8, p1.x));
      p1.y = Math.max(H / 2 + p1.r, Math.min(H - p1.r - 8, p1.y));
      p1.vx = p1.x - prev1x; p1.vy = p1.y - prev1y;

      const prev2x = p2.x, prev2y = p2.y;
      if (is2P) {
        if (keys['ArrowLeft']) p2.x -= 6;
        if (keys['ArrowRight']) p2.x += 6;
        if (keys['ArrowUp']) p2.y -= 6;
        if (keys['ArrowDown']) p2.y += 6;
      } else {
        const aiSpd = 3.6 + s1 * 0.45;
        const targetX = puck.y < H / 2 ? puck.x : W / 2;
        const targetY = puck.y < H / 2 ? Math.min(H / 2 - 30, Math.max(40, puck.y - 18)) : 65;
        p2.x += Math.max(-aiSpd, Math.min(aiSpd, targetX - p2.x));
        p2.y += Math.max(-aiSpd, Math.min(aiSpd, targetY - p2.y));
      }
      p2.x = Math.max(p2.r + 8, Math.min(W - p2.r - 8, p2.x));
      p2.y = Math.max(p2.r + 8, Math.min(H / 2 - p2.r, p2.y));
      p2.vx = p2.x - prev2x; p2.vy = p2.y - prev2y;

      puck.x += puck.vx; puck.y += puck.vy;
      puck.vx *= 0.992; puck.vy *= 0.992;

      if (puck.x - puck.r < 8) { puck.x = 8 + puck.r; puck.vx = Math.abs(puck.vx); }
      if (puck.x + puck.r > W - 8) { puck.x = W - 8 - puck.r; puck.vx = -Math.abs(puck.vx); }

      const inGoalX = Math.abs(puck.x - W / 2) < GOAL_W / 2;
      if (puck.y - puck.r < 8) {
        if (inGoalX) {
          s1 += 1; ArcadeAudio.playCoinInsert(); updateHud();
          if (s1 >= 5) {
            this.finishRound(400, is2P ? 'PLAYER 1 MENANG!' : 'AIR HOCKEY CHAMPION!', `${is2P ? 'Player 1' : 'Kamu'} menang ${s1}-${s2} (+400 Tickets)!`);
            return;
          }
          resetPuck(false);
        } else { puck.y = 8 + puck.r; puck.vy = Math.abs(puck.vy); }
      }
      if (puck.y + puck.r > H - 8) {
        if (inGoalX) {
          s2 += 1; ArcadeAudio.playError(); updateHud();
          if (s2 >= 5) {
            this.finishRound(is2P ? 400 : 0, is2P ? 'PLAYER 2 MENANG!' : 'AI STRIKER WINS — KALAH!', is2P ? `Player 2 menang ${s2}-${s1} (+400 Tickets)!` : `AI menang 5-${s1}! (0 Tickets).`);
            return;
          }
          resetPuck(true);
        } else { puck.y = H - 8 - puck.r; puck.vy = -Math.abs(puck.vy); }
      }

      collideMallet(p1);
      collideMallet(p2);

      ctx.fillStyle = '#060913';
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.35)'; ctx.lineWidth = 4;
      ctx.strokeRect(6, 6, W - 12, H - 12);
      ctx.beginPath(); ctx.moveTo(6, H / 2); ctx.lineTo(W - 6, H / 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(W / 2, H / 2, 46, 0, Math.PI * 2); ctx.stroke();

      ctx.fillStyle = '#060913';
      ctx.fillRect(W / 2 - GOAL_W / 2, 0, GOAL_W, 10);
      ctx.fillRect(W / 2 - GOAL_W / 2, H - 10, GOAL_W, 10);

      ctx.beginPath(); ctx.arc(p1.x, p1.y, p1.r, 0, Math.PI * 2); ctx.fillStyle = '#22d3ee'; ctx.fill();
      ctx.beginPath(); ctx.arc(p2.x, p2.y, p2.r, 0, Math.PI * 2); ctx.fillStyle = '#f43f5e'; ctx.fill();
      ctx.beginPath(); ctx.arc(puck.x, puck.y, puck.r, 0, Math.PI * 2); ctx.fillStyle = '#fbbf24'; ctx.fill();

      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  },

  // ==================== 33. CYBER TANK ARENA (1P / 2P, 3 HEARTS) ====================
  runTankDuel() {
    const W = 460, H = 400;
    this.useCanvasMode(W, H);
    const ctx = this.ctx;
    const is2P = this.playerMode === '2p';

    const t1 = { x: 64, y: H / 2, ang: 0, hp: 3, cd: 0, color: '#22d3ee' };
    const t2 = { x: W - 64, y: H / 2, ang: Math.PI, hp: 3, cd: 0, color: '#f43f5e' };
    const walls = [
      { x: 155, y: 80, w: 22, h: 90 },
      { x: 155, y: 230, w: 22, h: 90 },
      { x: W - 177, y: 80, w: 22, h: 90 },
      { x: W - 177, y: 230, w: 22, h: 90 },
      { x: W / 2 - 14, y: H / 2 - 42, w: 28, h: 84 }
    ];
    const shells = [];

    const updateHud = () => {
      this.setHud({
        scoreLabel: 'P1 Hearts',
        scoreVal: '♥'.repeat(t1.hp) + '♡'.repeat(3 - t1.hp),
        infoLabel: is2P ? 'P2 Hearts' : 'AI Tank Hearts',
        infoVal: '♥'.repeat(t2.hp) + '♡'.repeat(3 - t2.hp)
      });
    };
    updateHud();

    const shootTank = (tank) => {
      if (tank.cd > 0 || !this.isRoundActive) return;
      tank.cd = 24;
      shells.push({
        x: tank.x + Math.cos(tank.ang) * 20,
        y: tank.y + Math.sin(tank.ang) * 20,
        vx: Math.cos(tank.ang) * 5.6,
        vy: Math.sin(tank.ang) * 5.6,
        bounces: 1,
        owner: tank
      });
      ArcadeAudio.playLaser();
    };

    this.controlsBar.innerHTML = is2P
      ? `<div class="flex flex-wrap items-center justify-between gap-2 w-full text-[11px] font-semibold">
           <span class="text-cyan-300">P1: WASD + Space/F</span>
           <span class="text-rose-300">P2: Panah + Enter</span>
         </div>`
      : `<div class="flex items-center justify-between gap-2 w-full">
           <span class="text-xs text-cyan-300">Gerak: WASD / Panah • Tembak: Space</span>
           <button id="td-fire" class="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-black text-xs uppercase">Fire (Space)</button>
         </div>`;
    document.getElementById('td-fire')?.addEventListener('click', () => shootTank(t1));

    const keys = {};
    const onKD = (e) => {
      keys[e.key] = true;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
      if (e.code === 'Space' || e.key === 'f' || e.key === 'F') shootTank(t1);
      if (is2P && (e.key === 'Enter' || e.key === '/')) shootTank(t2);
    };
    const onKU = (e) => { keys[e.key] = false; };
    window.addEventListener('keydown', onKD);
    window.addEventListener('keyup', onKU);
    this.cleanupFns.push(() => { window.removeEventListener('keydown', onKD); window.removeEventListener('keyup', onKU); });

    const moveTank = (tank, dx, dy) => {
      if (dx === 0 && dy === 0) return;
      tank.ang = Math.atan2(dy, dx);
      const nx = Math.max(22, Math.min(W - 22, tank.x + dx * 3.0));
      const ny = Math.max(22, Math.min(H - 22, tank.y + dy * 3.0));
      const hitW = walls.some((w) => nx + 14 > w.x && nx - 14 < w.x + w.w && ny + 14 > w.y && ny - 14 < w.y + w.h);
      if (!hitW) { tank.x = nx; tank.y = ny; }
    };

    const loop = () => {
      if (!this.isRoundActive) return;
      if (t1.cd > 0) t1.cd -= 1;
      if (t2.cd > 0) t2.cd -= 1;

      let d1x = 0, d1y = 0;
      if (keys['a'] || keys['A'] || (!is2P && keys['ArrowLeft'])) d1x -= 1;
      if (keys['d'] || keys['D'] || (!is2P && keys['ArrowRight'])) d1x += 1;
      if (keys['w'] || keys['W'] || (!is2P && keys['ArrowUp'])) d1y -= 1;
      if (keys['s'] || keys['S'] || (!is2P && keys['ArrowDown'])) d1y += 1;
      moveTank(t1, d1x, d1y);

      if (is2P) {
        let d2x = 0, d2y = 0;
        if (keys['ArrowLeft']) d2x -= 1;
        if (keys['ArrowRight']) d2x += 1;
        if (keys['ArrowUp']) d2y -= 1;
        if (keys['ArrowDown']) d2y += 1;
        moveTank(t2, d2x, d2y);
      } else {
        const angToP1 = Math.atan2(t1.y - t2.y, t1.x - t2.x);
        t2.ang = angToP1;
        const dist = Math.hypot(t1.x - t2.x, t1.y - t2.y);
        if (dist > 140) moveTank(t2, Math.cos(angToP1) * 0.55, Math.sin(angToP1) * 0.55);
        if (Math.random() < 0.03) shootTank(t2);
      }

      for (let i = shells.length - 1; i >= 0; i--) {
        const s = shells[i];
        s.x += s.vx; s.y += s.vy;
        if (s.x < 6 || s.x > W - 6) { s.vx = -s.vx; s.bounces -= 1; }
        if (s.y < 6 || s.y > H - 6) { s.vy = -s.vy; s.bounces -= 1; }
        if (s.bounces < 0) { shells.splice(i, 1); continue; }

        if (walls.some((w) => s.x > w.x && s.x < w.x + w.w && s.y > w.y && s.y < w.y + w.h)) {
          shells.splice(i, 1);
          continue;
        }

        if (s.owner !== t1 && Math.hypot(s.x - t1.x, s.y - t1.y) < 16) {
          shells.splice(i, 1);
          t1.hp -= 1;
          ArcadeAudio.playError();
          updateHud();
          if (t1.hp <= 0) {
            this.finishRound(is2P ? 420 : 0, is2P ? 'PLAYER 2 MENANG!' : 'TANK DESTROYED — KALAH!', is2P ? 'Player 2 menghancurkan Tank Player 1 (+420 Tickets)!' : 'Tankmu kehabisan 3 hati! (0 Tickets).');
            return;
          }
        } else if (s.owner !== t2 && Math.hypot(s.x - t2.x, s.y - t2.y) < 16) {
          shells.splice(i, 1);
          t2.hp -= 1;
          ArcadeAudio.playCoinInsert();
          updateHud();
          if (t2.hp <= 0) {
            this.finishRound(420, is2P ? 'PLAYER 1 MENANG!' : 'TANK ARENA VICTORY!', `${is2P ? 'Player 1' : 'Kamu'} menghancurkan tank lawan (+420 Tickets)!`);
            return;
          }
        }
      }

      ctx.fillStyle = '#060913';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#1e293b'; ctx.strokeStyle = '#c084fc'; ctx.lineWidth = 2;
      for (const w of walls) { ctx.fillRect(w.x, w.y, w.w, w.h); ctx.strokeRect(w.x, w.y, w.w, w.h); }

      [t1, t2].forEach((t) => {
        ctx.save();
        ctx.translate(t.x, t.y);
        ctx.rotate(t.ang);
        ctx.fillStyle = t.color;
        ctx.fillRect(-14, -12, 28, 24);
        ctx.fillStyle = '#fff';
        ctx.fillRect(4, -3, 16, 6);
        ctx.restore();
      });

      ctx.fillStyle = '#fbbf24';
      shells.forEach((s) => { ctx.beginPath(); ctx.arc(s.x, s.y, 4, 0, Math.PI * 2); ctx.fill(); });

      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  },

  // ==================== 34. NEON POWER TUG (1P / 2P MASH BATTLE) ====================
  runTugOfWar() {
    const W = 460, H = 320;
    this.useCanvasMode(W, H);
    const ctx = this.ctx;
    const is2P = this.playerMode === '2p';

    let pos = 0; // -100 (P1 wins) to +100 (P2/AI wins)
    let elapsed = 0;

    const updateHud = () => {
      this.setHud({
        scoreLabel: is2P ? 'P1 (Cyan) vs P2 (Pink)' : 'You vs AI Tug',
        scoreVal: `${Math.round(50 - pos / 2)}% - ${Math.round(50 + pos / 2)}%`,
        infoLabel: 'Mode',
        infoVal: is2P ? '2P MASH' : '1P SOLO'
      });
    };
    updateHud();

    const pullP1 = () => {
      if (!this.isRoundActive) return;
      pos -= 7.5;
      ArcadeAudio.playTick(0.9);
      updateHud();
    };
    const pullP2 = () => {
      if (!this.isRoundActive) return;
      pos += 7.5;
      ArcadeAudio.playTick(0.4);
      updateHud();
    };

    this.controlsBar.innerHTML = is2P
      ? `<div class="flex items-center justify-between gap-3 w-full">
           <button id="tw-p1" class="flex-1 py-3.5 rounded-xl bg-cyan-400 active:scale-95 text-slate-950 font-display font-black text-xs uppercase">⚡ P1 TARIK (Tombol A)</button>
           <button id="tw-p2" class="flex-1 py-3.5 rounded-xl bg-rose-500 active:scale-95 text-white font-display font-black text-xs uppercase">⚡ P2 TARIK (Tombol L)</button>
         </div>`
      : `<button id="tw-p1" class="w-full py-3.5 rounded-xl bg-cyan-400 active:scale-95 text-slate-950 font-display font-black text-xs uppercase">⚡ TAP / TEKAN SPACE SECEPATNYA!</button>`;

    document.getElementById('tw-p1')?.addEventListener('pointerdown', (e) => { e.preventDefault(); pullP1(); });
    document.getElementById('tw-p2')?.addEventListener('pointerdown', (e) => { e.preventDefault(); pullP2(); });

    const onK = (e) => {
      if (e.repeat) return;
      if (is2P) {
        if (e.key === 'a' || e.key === 'A') pullP1();
        if (e.key === 'l' || e.key === 'L') pullP2();
      } else if (e.code === 'Space' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        pullP1();
      }
    };
    window.addEventListener('keydown', onK);
    this.cleanupFns.push(() => window.removeEventListener('keydown', onK));

    const aiInterval = setInterval(() => {
      elapsed += 0.2;
      if (!is2P && this.isRoundActive) {
        pos += 4.2 + Math.min(3.5, elapsed * 0.25);
        updateHud();
      }
    }, 200);
    this.intervals.push(aiInterval);

    const loop = () => {
      if (!this.isRoundActive) return;

      if (pos <= -100) {
        this.finishRound(350, is2P ? 'PLAYER 1 MENANG!' : 'POWER TUG VICTORY!', `${is2P ? 'Player 1' : 'Kamu'} menang adu tenaga neon (+350 Tickets)!`);
        return;
      }
      if (pos >= 100) {
        this.finishRound(is2P ? 350 : 0, is2P ? 'PLAYER 2 MENANG!' : 'AI OVERPOWERED YOU — KALAH!', is2P ? 'Player 2 menang adu tenaga neon (+350 Tickets)!' : 'Cyber AI menarikmu melewati batas! (0 Tickets).');
        return;
      }

      ctx.fillStyle = '#060913';
      ctx.fillRect(0, 0, W, H);

      const barX = 40, barW = W - 80, midX = W / 2 + (pos / 100) * (barW / 2);
      ctx.fillStyle = '#22d3ee';
      ctx.fillRect(barX, H / 2 - 22, midX - barX, 44);
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(midX, H / 2 - 22, barX + barW - midX, 44);

      ctx.beginPath(); ctx.arc(midX, H / 2, 26, 0, Math.PI * 2);
      ctx.fillStyle = '#fbbf24'; ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.stroke();

      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  },

  // ==================== 35. NEON BUMPER SUMO (1P / 2P RING-OUT) ====================
  runSumoBumpers() {
    const W = 440, H = 440, CX = W / 2, CY = H / 2;
    this.useCanvasMode(W, H);
    const ctx = this.ctx;
    const is2P = this.playerMode === '2p';

    const p1 = { x: CX - 70, y: CY, vx: 0, vy: 0, r: 22, color: '#22d3ee' };
    const p2 = { x: CX + 70, y: CY, vx: 0, vy: 0, r: 22, color: '#f43f5e' };
    let s1 = 0, s2 = 0;
    let ringR = 185;

    const updateHud = () => {
      this.setHud({
        scoreLabel: is2P ? 'P1 vs P2 (First to 3)' : 'You vs AI (First to 3)',
        scoreVal: `${s1} - ${s2}`,
        infoLabel: 'Mode',
        infoVal: is2P ? '2P SUMO' : '1P SOLO'
      });
    };
    updateHud();

    this.controlsBar.innerHTML = is2P
      ? `<p class="text-xs text-center text-purple-300 font-semibold">2P: P1 (WASD) vs P2 (Panah)! Dorong lawan keluar dari ring yang menyusut!</p>`
      : `<p class="text-xs text-center text-cyan-300 font-semibold">1P: Gerak dengan WASD / Panah! Dorong AI keluar ring 3 kali untuk menang 400 Tickets!</p>`;

    const keys = {};
    const onKD = (e) => { keys[e.key] = true; if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault(); };
    const onKU = (e) => { keys[e.key] = false; };
    window.addEventListener('keydown', onKD);
    window.addEventListener('keyup', onKU);
    this.cleanupFns.push(() => { window.removeEventListener('keydown', onKD); window.removeEventListener('keyup', onKU); });

    const resetRound = () => {
      p1.x = CX - 65; p1.y = CY; p1.vx = 0; p1.vy = 0;
      p2.x = CX + 65; p2.y = CY; p2.vx = 0; p2.vy = 0;
      ringR = 185;
    };

    const loop = () => {
      if (!this.isRoundActive) return;
      ringR = Math.max(95, ringR - 0.08);

      const accel = 0.52;
      if (keys['a'] || keys['A'] || (!is2P && keys['ArrowLeft'])) p1.vx -= accel;
      if (keys['d'] || keys['D'] || (!is2P && keys['ArrowRight'])) p1.vx += accel;
      if (keys['w'] || keys['W'] || (!is2P && keys['ArrowUp'])) p1.vy -= accel;
      if (keys['s'] || keys['S'] || (!is2P && keys['ArrowDown'])) p1.vy += accel;

      if (is2P) {
        if (keys['ArrowLeft']) p2.vx -= accel;
        if (keys['ArrowRight']) p2.vx += accel;
        if (keys['ArrowUp']) p2.vy -= accel;
        if (keys['ArrowDown']) p2.vy += accel;
      } else {
        const ang = Math.atan2(p1.y - p2.y, p1.x - p2.x);
        const aiPow = 0.34 + s1 * 0.05;
        p2.vx += Math.cos(ang) * aiPow;
        p2.vy += Math.sin(ang) * aiPow;
      }

      [p1, p2].forEach((p) => {
        p.vx *= 0.94; p.vy *= 0.94;
        p.x += p.vx; p.y += p.vy;
      });

      // Elastic bumper collision
      const dx = p2.x - p1.x, dy = p2.y - p1.y;
      const dist = Math.hypot(dx, dy);
      if (dist < p1.r + p2.r && dist > 0.001) {
        const nx = dx / dist, ny = dy / dist;
        const overlap = p1.r + p2.r - dist;
        p1.x -= nx * overlap * 0.5; p1.y -= ny * overlap * 0.5;
        p2.x += nx * overlap * 0.5; p2.y += ny * overlap * 0.5;
        const rvx = p2.vx - p1.vx, rvy = p2.vy - p1.vy;
        const sep = rvx * nx + rvy * ny;
        if (sep < 0) {
          const imp = -1.65 * sep;
          p1.vx -= nx * imp * 0.5; p1.vy -= ny * imp * 0.5;
          p2.vx += nx * imp * 0.5; p2.vy += ny * imp * 0.5;
          ArcadeAudio.playBounce();
        }
      }

      if (Math.hypot(p1.x - CX, p1.y - CY) > ringR) {
        s2 += 1; ArcadeAudio.playError(); updateHud();
        if (s2 >= 3) {
          this.finishRound(is2P ? 400 : 0, is2P ? 'PLAYER 2 MENANG!' : 'SUMO RING-OUT — KALAH!', is2P ? `Player 2 menang Sumo ${s2}-${s1} (+400 Tickets)!` : `AI menjatuhkanmu 3 kali! (0 Tickets).`);
          return;
        }
        resetRound();
      } else if (Math.hypot(p2.x - CX, p2.y - CY) > ringR) {
        s1 += 1; ArcadeAudio.playCoinInsert(); updateHud();
        if (s1 >= 3) {
          this.finishRound(400, is2P ? 'PLAYER 1 MENANG!' : 'SUMO CHAMPION!', `${is2P ? 'Player 1' : 'Kamu'} menang Sumo ${s1}-${s2} (+400 Tickets)!`);
          return;
        }
        resetRound();
      }

      ctx.fillStyle = '#060913';
      ctx.fillRect(0, 0, W, H);
      ctx.beginPath(); ctx.arc(CX, CY, ringR, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(192, 132, 252, 0.1)'; ctx.fill();
      ctx.strokeStyle = '#c084fc'; ctx.lineWidth = 4; ctx.stroke();

      [p1, p2].forEach((p) => {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color; ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
      });

      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }
});

