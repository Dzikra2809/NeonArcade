/**
 * NEON CARNIVAL // MORE FRIV & 2-PLAYER ARCADE MINI-GAMES (GAMES 36-41 + WHEEL = 42 TOTAL)
 * Includes: Neon Connect 4 (1P/2P), Cyber Tic-Tac-Toe Blitz (1P/2P),
 * Neon Light Cycles Tron (1P/2P), Cyber Block Drop Tetris, Neon 2048 Merge, Neon Piano Tiles.
 */

Object.assign(MiniGamesArcade, {
  // ==================== 36. NEON CONNECT 4 (1P VS AI / 2P) ====================
  runConnectFour() {
    this.useDomMode();
    const ROWS = 6, COLS = 7;
    const is2P = this.playerMode === '2p';
    const board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    let turn = 1; // 1 = Cyan, 2 = Pink/AI
    let locked = false;

    const updateHud = () => {
      this.setHud({
        scoreLabel: is2P ? 'Turn' : 'You vs Cyber AI',
        scoreVal: turn === 1 ? 'P1 (CYAN)' : is2P ? 'P2 (PINK)' : 'AI THINKING',
        infoLabel: 'Mode',
        infoVal: is2P ? '2P BOARD' : '1P SOLO'
      });
    };
    updateHud();

    this.controlsBar.innerHTML = `<p class="text-xs text-center text-cyan-300 font-semibold">Klik kolom mana saja untuk menjatuhkan keping neon! Sambung 4 segaris untuk menang 450 Tickets.</p>`;

    const dropRow = (c) => {
      for (let r = ROWS - 1; r >= 0; r--) {
        if (board[r][c] === 0) return r;
      }
      return -1;
    };

    const checkWin = (p) => {
      const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (board[r][c] !== p) continue;
          for (const [dr, dc] of dirs) {
            let cnt = 1;
            for (let k = 1; k < 4; k++) {
              const nr = r + dr * k, nc = c + dc * k;
              if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr][nc] === p) cnt++;
              else break;
            }
            if (cnt >= 4) return true;
          }
        }
      }
      return false;
    };

    const isDraw = () => board[0].every((v) => v !== 0);

    const pickAiCol = () => {
      const valid = [];
      for (let c = 0; c < COLS; c++) if (dropRow(c) !== -1) valid.push(c);
      for (const c of valid) {
        const r = dropRow(c); board[r][c] = 2;
        if (checkWin(2)) { board[r][c] = 0; return c; }
        board[r][c] = 0;
      }
      for (const c of valid) {
        const r = dropRow(c); board[r][c] = 1;
        if (checkWin(1)) { board[r][c] = 0; return c; }
        board[r][c] = 0;
      }
      if (valid.includes(3) && Math.random() < 0.65) return 3;
      return valid[Math.floor(Math.random() * valid.length)];
    };

    const makeMove = (col) => {
      if (locked || !this.isRoundActive) return;
      const r = dropRow(col);
      if (r === -1) return;

      board[r][col] = turn;
      ArcadeAudio.playBounce();
      render();

      if (checkWin(turn)) {
        locked = true;
        const winner = turn;
        this.timeouts.push(setTimeout(() => {
          if (winner === 1) {
            this.finishRound(450, is2P ? 'PLAYER 1 MENANG!' : 'CONNECT 4 VICTORY!', `${is2P ? 'Player 1' : 'Kamu'} menyambung 4 keping neon (+450 Tickets)!`);
          } else {
            this.finishRound(is2P ? 450 : 0, is2P ? 'PLAYER 2 MENANG!' : 'CYBER AI WINS — KALAH!', is2P ? 'Player 2 menyambung 4 keping neon (+450 Tickets)!' : 'AI menyambung 4 keping terlebih dahulu! (0 Tickets).');
          }
        }, 400));
        return;
      }
      if (isDraw()) {
        locked = true;
        this.timeouts.push(setTimeout(() => this.finishRound(100, 'SERI / DRAW!', 'Papan penuh tanpa pemenang! Konsolasi +100 Tickets.'), 400));
        return;
      }

      turn = turn === 1 ? 2 : 1;
      updateHud();

      if (!is2P && turn === 2) {
        locked = true;
        this.timeouts.push(setTimeout(() => {
          locked = false;
          makeMove(pickAiCol());
        }, 420));
      }
    };

    const render = () => {
      this.domStage.innerHTML = `
        <div class="w-full max-w-sm mx-auto p-3">
          <div class="grid grid-cols-7 gap-1.5 bg-slate-900/95 p-2.5 rounded-2xl border border-cyan-500/35">
            ${board
              .map((row) =>
                row
                  .map(
                    (cell, c) => `
                  <button data-c4="${c}" class="aspect-square rounded-full border-2 transition-all flex items-center justify-center ${
                      cell === 1
                        ? 'bg-cyan-400 border-white shadow-[0_0_12px_#22d3ee]'
                        : cell === 2
                        ? 'bg-rose-500 border-white shadow-[0_0_12px_#f43f5e]'
                        : 'bg-slate-950 border-slate-800 hover:border-cyan-400/60'
                    }"></button>`
                  )
                  .join('')
              )
              .join('')}
          </div>
        </div>`;

      this.domStage.querySelectorAll('[data-c4]').forEach((btn) => {
        btn.addEventListener('click', () => {
          if (!is2P && turn === 2) return;
          makeMove(parseInt(btn.getAttribute('data-c4'), 10));
        });
      });
    };
    render();
  },

  // ==================== 37. CYBER TIC-TAC-TOE BLITZ (1P / 2P, BO3 + 3.5s TURN) ====================
  runTicTacToeBlitz() {
    this.useDomMode();
    const is2P = this.playerMode === '2p';
    let s1 = 0, s2 = 0;
    let board = Array(9).fill('');
    let turn = 'X';
    let turnTimer = null;

    const wins = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
    const hasWon = (sym) => wins.some(([a, b, c]) => board[a] === sym && board[b] === sym && board[c] === sym);

    const updateHud = () => {
      this.setHud({
        scoreLabel: is2P ? 'BO3: P1 (X) - P2 (O)' : 'BO3: You (X) - AI (O)',
        scoreVal: `${s1} - ${s2}`,
        infoLabel: 'Turn (3.5s)',
        infoVal: turn === 'X' ? 'P1 [X]' : is2P ? 'P2 [O]' : 'AI [O]'
      });
    };

    this.controlsBar.innerHTML = `<p class="text-xs text-center text-amber-300 font-semibold">Best-of-3 kilat! Maksimal 3.5 detik per langkah—telat jalan = lawan dapat poin!</p>`;

    const startTurnClock = () => {
      clearInterval(turnTimer);
      if (!is2P && turn === 'O') return;
      const maxMs = 3500;
      const t0 = performance.now();
      turnTimer = setInterval(() => {
        const left = maxMs - (performance.now() - t0);
        const bar = document.getElementById('ttt-bar');
        if (bar) bar.style.width = `${Math.max(0, (left / maxMs) * 100)}%`;
        if (left <= 0) {
          clearInterval(turnTimer);
          if (turn === 'X') s2 += 1;
          else s1 += 1;
          ArcadeAudio.playError();
          checkSeriesOrReset();
        }
      }, 30);
      this.intervals.push(turnTimer);
    };

    const checkSeriesOrReset = () => {
      updateHud();
      if (s1 >= 2) {
        this.finishRound(350, is2P ? 'PLAYER 1 MENANG BO3!' : 'TIC-TAC-TOE CHAMPION!', `${is2P ? 'Player 1' : 'Kamu'} menang Best-of-3 (${s1}-${s2}) (+350 Tickets)!`);
        return;
      }
      if (s2 >= 2) {
        this.finishRound(is2P ? 350 : 0, is2P ? 'PLAYER 2 MENANG BO3!' : 'AI WINS BO3 — KALAH!', is2P ? `Player 2 menang Best-of-3 (${s2}-${s1}) (+350 Tickets)!` : `AI menang ${s2}-${s1}! (0 Tickets).`);
        return;
      }
      board = Array(9).fill('');
      turn = 'X';
      render();
      startTurnClock();
    };

    const aiPick = () => {
      const empty = board.map((v, i) => (v === '' ? i : -1)).filter((i) => i !== -1);
      for (const i of empty) { board[i] = 'O'; if (hasWon('O')) { board[i] = ''; return i; } board[i] = ''; }
      for (const i of empty) { board[i] = 'X'; if (hasWon('X')) { board[i] = ''; return i; } board[i] = ''; }
      if (empty.includes(4)) return 4;
      return empty[Math.floor(Math.random() * empty.length)];
    };

    const playCell = (idx) => {
      if (!this.isRoundActive || board[idx] !== '') return;
      clearInterval(turnTimer);
      board[idx] = turn;
      ArcadeAudio.playClick();
      render();

      if (hasWon(turn)) {
        if (turn === 'X') s1 += 1;
        else s2 += 1;
        ArcadeAudio.playCoinInsert();
        this.timeouts.push(setTimeout(checkSeriesOrReset, 450));
        return;
      }
      if (board.every((v) => v !== '')) {
        this.timeouts.push(setTimeout(checkSeriesOrReset, 450));
        return;
      }

      turn = turn === 'X' ? 'O' : 'X';
      updateHud();
      if (!is2P && turn === 'O') {
        this.timeouts.push(setTimeout(() => playCell(aiPick()), 350));
      } else {
        startTurnClock();
      }
    };

    const render = () => {
      this.domStage.innerHTML = `
        <div class="w-full max-w-xs mx-auto p-3 space-y-3">
          <div class="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div id="ttt-bar" class="h-full bg-gradient-to-r from-cyan-400 to-amber-400" style="width:100%"></div>
          </div>
          <div class="grid grid-cols-3 gap-2.5">
            ${board
              .map(
                (v, i) => `
              <button data-ttt="${i}" class="aspect-square rounded-2xl bg-slate-900 border-2 ${
                  v === 'X' ? 'border-cyan-400 text-cyan-300' : v === 'O' ? 'border-rose-400 text-rose-300' : 'border-slate-700 hover:border-cyan-400/50'
                } font-display font-black text-3xl">${v}</button>`
              )
              .join('')}
          </div>
        </div>`;

      this.domStage.querySelectorAll('[data-ttt]').forEach((btn) => {
        btn.addEventListener('click', () => {
          if (!is2P && turn === 'O') return;
          playCell(parseInt(btn.getAttribute('data-ttt'), 10));
        });
      });
    };
    updateHud();
    render();
    startTurnClock();
  },

  // ==================== 38. NEON LIGHT CYCLES — TRON (1P / 2P) ====================
  runTronCycles() {
    const W = 440, H = 440, CELL = 10, COLS = 44, ROWS = 44;
    this.useCanvasMode(W, H);
    const ctx = this.ctx;
    const is2P = this.playerMode === '2p';

    let s1 = 0, s2 = 0;
    let grid, p1, p2;

    const resetMatch = () => {
      grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
      p1 = { x: 8, y: 22, dx: 1, dy: 0, ndx: 1, ndy: 0 };
      p2 = { x: 35, y: 22, dx: -1, dy: 0, ndx: -1, ndy: 0 };
      grid[p1.y][p1.x] = 1;
      grid[p2.y][p2.x] = 2;
    };
    resetMatch();

    const updateHud = () => {
      this.setHud({
        scoreLabel: is2P ? 'BO3: P1 - P2' : 'BO3: You - AI',
        scoreVal: `${s1} - ${s2}`,
        infoLabel: 'Mode',
        infoVal: is2P ? '2P TRON' : '1P SOLO'
      });
    };
    updateHud();

    this.controlsBar.innerHTML = is2P
      ? `<p class="text-xs text-center text-purple-300 font-semibold">2P: P1 (WASD) vs P2 (Tombol Panah)! Jebak lawan dengan jejak laser hingga 2 kemenangan!</p>`
      : `<div class="flex items-center justify-between gap-2 w-full">
           <span class="text-xs text-cyan-300">Belok: WASD / Panah</span>
           <div class="flex gap-1">
             <button id="tr-l" class="px-3 py-2 rounded-lg bg-slate-900 border border-cyan-500/40 text-cyan-300 text-xs">◀</button>
             <button id="tr-u" class="px-3 py-2 rounded-lg bg-slate-900 border border-cyan-500/40 text-cyan-300 text-xs">▲</button>
             <button id="tr-d" class="px-3 py-2 rounded-lg bg-slate-900 border border-cyan-500/40 text-cyan-300 text-xs">▼</button>
             <button id="tr-r" class="px-3 py-2 rounded-lg bg-slate-900 border border-cyan-500/40 text-cyan-300 text-xs">▶</button>
           </div>
         </div>`;

    const setTurn = (p, x, y) => { if (x !== -p.dx || y !== -p.dy) { p.ndx = x; p.ndy = y; } };
    document.getElementById('tr-l')?.addEventListener('click', () => setTurn(p1, -1, 0));
    document.getElementById('tr-r')?.addEventListener('click', () => setTurn(p1, 1, 0));
    document.getElementById('tr-u')?.addEventListener('click', () => setTurn(p1, 0, -1));
    document.getElementById('tr-d')?.addEventListener('click', () => setTurn(p1, 0, 1));

    const onK = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault();
      if (e.key === 'a' || e.key === 'A' || (!is2P && e.key === 'ArrowLeft')) setTurn(p1, -1, 0);
      if (e.key === 'd' || e.key === 'D' || (!is2P && e.key === 'ArrowRight')) setTurn(p1, 1, 0);
      if (e.key === 'w' || e.key === 'W' || (!is2P && e.key === 'ArrowUp')) setTurn(p1, 0, -1);
      if (e.key === 's' || e.key === 'S' || (!is2P && e.key === 'ArrowDown')) setTurn(p1, 0, 1);
      if (is2P) {
        if (e.key === 'ArrowLeft') setTurn(p2, -1, 0);
        if (e.key === 'ArrowRight') setTurn(p2, 1, 0);
        if (e.key === 'ArrowUp') setTurn(p2, 0, -1);
        if (e.key === 'ArrowDown') setTurn(p2, 0, 1);
      }
    };
    window.addEventListener('keydown', onK);
    this.cleanupFns.push(() => window.removeEventListener('keydown', onK));

    const isSafe = (x, y) => x >= 0 && x < COLS && y >= 0 && y < ROWS && grid[y][x] === 0;

    let lastStep = performance.now();
    const loop = (now) => {
      if (!this.isRoundActive) return;
      if (now - lastStep >= 90) {
        lastStep = now;
        p1.dx = p1.ndx; p1.dy = p1.ndy;

        if (!is2P) {
          const opts = [[p2.dx, p2.dy], [-p2.dy, p2.dx], [p2.dy, -p2.dx]];
          for (const [ox, oy] of opts) {
            if ((ox !== -p2.dx || oy !== -p2.dy) && isSafe(p2.x + ox, p2.y + oy)) {
              p2.dx = ox; p2.dy = oy;
              break;
            }
          }
        } else {
          p2.dx = p2.ndx; p2.dy = p2.ndy;
        }

        p1.x += p1.dx; p1.y += p1.dy;
        p2.x += p2.dx; p2.y += p2.dy;

        const c1 = !isSafe(p1.x, p1.y);
        const c2 = !isSafe(p2.x, p2.y) || (p1.x === p2.x && p1.y === p2.y);

        if (c1 || c2) {
          if (c1 && !c2) s2 += 1;
          else if (c2 && !c1) s1 += 1;
          ArcadeAudio.playError();
          updateHud();

          if (s1 >= 2) {
            this.finishRound(450, is2P ? 'PLAYER 1 MENANG!' : 'TRON ARENA CHAMPION!', `${is2P ? 'Player 1' : 'Kamu'} menang balap cahaya (${s1}-${s2}) (+450 Tickets)!`);
            return;
          }
          if (s2 >= 2) {
            this.finishRound(is2P ? 450 : 0, is2P ? 'PLAYER 2 MENANG!' : 'AI CYCLE WINS — KALAH!', is2P ? `Player 2 menang balap cahaya (${s2}-${s1}) (+450 Tickets)!` : `AI menjebakmu ${s2}-${s1}! (0 Tickets).`);
            return;
          }
          resetMatch();
        } else {
          grid[p1.y][p1.x] = 1;
          grid[p2.y][p2.x] = 2;
        }
      }

      ctx.fillStyle = '#060913';
      ctx.fillRect(0, 0, W, H);
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (grid[r][c] === 1) { ctx.fillStyle = '#22d3ee'; ctx.fillRect(c * CELL, r * CELL, CELL - 1, CELL - 1); }
          else if (grid[r][c] === 2) { ctx.fillStyle = '#f43f5e'; ctx.fillRect(c * CELL, r * CELL, CELL - 1, CELL - 1); }
        }
      }

      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  },

  // ==================== 39. CYBER BLOCK DROP (TETRIS) ====================
  runTetrisMini() {
    const COLS = 10, ROWS = 18, SZ = 24, W = 240, H = 432;
    this.useCanvasMode(W, H);
    const ctx = this.ctx;

    const shapes = [
      { m: [[1, 1, 1, 1]], c: '#22d3ee' },
      { m: [[1, 1], [1, 1]], c: '#fbbf24' },
      { m: [[0, 1, 0], [1, 1, 1]], c: '#c084fc' },
      { m: [[1, 0, 0], [1, 1, 1]], c: '#38bdf8' },
      { m: [[0, 0, 1], [1, 1, 1]], c: '#f472b6' },
      { m: [[0, 1, 1], [1, 1, 0]], c: '#34d399' },
      { m: [[1, 1, 0], [0, 1, 1]], c: '#f43f5e' }
    ];

    const grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    let tickets = 0, lines = 0, dropMs = 560;
    let piece = null;

    const collides = (dx, dy, mat) => {
      for (let r = 0; r < mat.length; r++) {
        for (let c = 0; c < mat[r].length; c++) {
          if (!mat[r][c]) continue;
          const nx = piece.x + c + dx, ny = piece.y + r + dy;
          if (nx < 0 || nx >= COLS || ny >= ROWS || (ny >= 0 && grid[ny][nx])) return true;
        }
      }
      return false;
    };

    const spawn = () => {
      const s = shapes[Math.floor(Math.random() * shapes.length)];
      piece = { m: s.m.map((r) => [...r]), c: s.c, x: 3, y: 0 };
      if (collides(0, 0, piece.m)) {
        this.finishRound(tickets, 'STACK TOPPED OUT!', `Berhasil menghapus ${lines} baris! Total hadiah: ${tickets} Tickets.`);
        return false;
      }
      return true;
    };

    const mergeAndClear = () => {
      piece.m.forEach((row, r) => row.forEach((v, c) => { if (v && piece.y + r >= 0) grid[piece.y + r][piece.x + c] = piece.c; }));
      let cleared = 0;
      for (let r = ROWS - 1; r >= 0; r--) {
        if (grid[r].every((v) => v !== null)) {
          grid.splice(r, 1);
          grid.unshift(Array(COLS).fill(null));
          cleared++;
          r++;
        }
      }
      if (cleared > 0) {
        lines += cleared;
        tickets += cleared * 65 + (cleared === 4 ? 140 : 0);
        dropMs = Math.max(160, 560 - lines * 18);
        ArcadeAudio.playCoinInsert();
      } else {
        ArcadeAudio.playTick(0.4);
      }
      updateHud();
      spawn();
    };

    const rotate = () => {
      const rot = piece.m[0].map((_, i) => piece.m.map((r) => r[i]).reverse());
      if (!collides(0, 0, rot)) { piece.m = rot; ArcadeAudio.playClick(); }
    };
    const move = (dx) => { if (!collides(dx, 0, piece.m)) piece.x += dx; };
    const stepDown = () => {
      if (!collides(0, 1, piece.m)) piece.y += 1;
      else mergeAndClear();
    };

    const updateHud = () => {
      this.setHud({ scoreLabel: 'Tickets Won', scoreVal: tickets.toLocaleString(), infoLabel: 'Lines Cleared', infoVal: `${lines}` });
    };
    updateHud();

    this.controlsBar.innerHTML = `
      <div class="flex items-center justify-center gap-2 w-full">
        <button id="tt-l" class="px-4 py-2.5 rounded-xl bg-slate-900 border border-cyan-500/40 text-cyan-300 font-bold">◀</button>
        <button id="tt-rot" class="px-4 py-2.5 rounded-xl bg-purple-500/30 border border-purple-400 text-purple-200 font-bold text-xs">↻ PUTAR</button>
        <button id="tt-d" class="px-4 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-black text-xs">▼ TURUN</button>
        <button id="tt-r" class="px-4 py-2.5 rounded-xl bg-slate-900 border border-cyan-500/40 text-cyan-300 font-bold">▶</button>
      </div>`;
    document.getElementById('tt-l')?.addEventListener('click', () => move(-1));
    document.getElementById('tt-r')?.addEventListener('click', () => move(1));
    document.getElementById('tt-rot')?.addEventListener('click', rotate);
    document.getElementById('tt-d')?.addEventListener('click', stepDown);

    const onK = (e) => {
      if (!this.isRoundActive || !piece) return;
      if (e.key === 'ArrowLeft' || e.key === 'a') { e.preventDefault(); move(-1); }
      if (e.key === 'ArrowRight' || e.key === 'd') { e.preventDefault(); move(1); }
      if (e.key === 'ArrowUp' || e.key === 'w') { e.preventDefault(); rotate(); }
      if (e.key === 'ArrowDown' || e.key === 's') { e.preventDefault(); stepDown(); }
      if (e.code === 'Space') { e.preventDefault(); while (!collides(0, 1, piece.m)) piece.y += 1; mergeAndClear(); }
    };
    window.addEventListener('keydown', onK);
    this.cleanupFns.push(() => window.removeEventListener('keydown', onK));

    if (!spawn()) return;
    let lastDrop = performance.now();
    const loop = (now) => {
      if (!this.isRoundActive) return;
      if (now - lastDrop >= dropMs) { lastDrop = now; stepDown(); if (!this.isRoundActive) return; }

      ctx.fillStyle = '#060913';
      ctx.fillRect(0, 0, W, H);
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (grid[r][c]) { ctx.fillStyle = grid[r][c]; ctx.fillRect(c * SZ + 1, r * SZ + 1, SZ - 2, SZ - 2); }
        }
      }
      if (piece) {
        ctx.fillStyle = piece.c;
        piece.m.forEach((row, r) => row.forEach((v, c) => {
          if (v) ctx.fillRect((piece.x + c) * SZ + 1, (piece.y + r) * SZ + 1, SZ - 2, SZ - 2);
        }));
      }
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  },

  // ==================== 40. NEON 2048 MERGE ====================
  run2048Neon() {
    this.useDomMode();
    let grid = Array.from({ length: 4 }, () => Array(4).fill(0));
    let movesLeft = 45;
    let maxTile = 2;

    const spawnTile = () => {
      const empty = [];
      for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) if (grid[r][c] === 0) empty.push([r, c]);
      if (empty.length === 0) return false;
      const [r, c] = empty[Math.floor(Math.random() * empty.length)];
      grid[r][c] = Math.random() < 0.85 ? 2 : 4;
      return true;
    };
    spawnTile(); spawnTile();

    const updateHud = () => {
      this.setHud({
        scoreLabel: 'Max Tile (Goal 256)',
        scoreVal: `${maxTile}`,
        infoLabel: 'Moves Left',
        infoVal: `${movesLeft}`
      });
    };
    updateHud();

    const slideLine = (arr) => {
      const nums = arr.filter((x) => x > 0);
      for (let i = 0; i < nums.length - 1; i++) {
        if (nums[i] === nums[i + 1]) {
          nums[i] *= 2;
          if (nums[i] > maxTile) maxTile = nums[i];
          nums[i + 1] = 0;
        }
      }
      const res = nums.filter((x) => x > 0);
      while (res.length < 4) res.push(0);
      return res;
    };

    const stepMove = (dir) => {
      if (!this.isRoundActive || movesLeft <= 0) return;
      const before = JSON.stringify(grid);

      if (dir === 'left') {
        for (let r = 0; r < 4; r++) grid[r] = slideLine(grid[r]);
      } else if (dir === 'right') {
        for (let r = 0; r < 4; r++) grid[r] = slideLine([...grid[r]].reverse()).reverse();
      } else if (dir === 'up') {
        for (let c = 0; c < 4; c++) {
          const col = slideLine([grid[0][c], grid[1][c], grid[2][c], grid[3][c]]);
          for (let r = 0; r < 4; r++) grid[r][c] = col[r];
        }
      } else if (dir === 'down') {
        for (let c = 0; c < 4; c++) {
          const col = slideLine([grid[3][c], grid[2][c], grid[1][c], grid[0][c]]).reverse();
          for (let r = 0; r < 4; r++) grid[r][c] = col[r];
        }
      }

      if (JSON.stringify(grid) === before) return;
      movesLeft -= 1;
      ArcadeAudio.playClick();
      spawnTile();
      updateHud();
      render();

      if (maxTile >= 256) {
        this.finishRound(450, '256 FUSION COMPLETE!', `Kamu mencapai ubin 256 dalam ${45 - movesLeft} langkah (+450 Tickets)!`);
        return;
      }
      if (movesLeft <= 0) {
        const won = maxTile >= 128 ? 220 : maxTile >= 64 ? 90 : 0;
        this.finishRound(won, won > 0 ? 'MOVES FINISHED!' : 'BELUM TERCAPAI!', `Ubin tertinggimu: ${maxTile} (Target 256). Hadiah: ${won} Tickets.`);
      }
    };

    this.controlsBar.innerHTML = `
      <div class="flex items-center justify-center gap-2 w-full">
        <button id="n2-l" class="px-4 py-2 rounded-xl bg-slate-900 border border-cyan-500/40 text-cyan-300 font-bold">◀</button>
        <button id="n2-u" class="px-4 py-2 rounded-xl bg-slate-900 border border-cyan-500/40 text-cyan-300 font-bold">▲</button>
        <button id="n2-d" class="px-4 py-2 rounded-xl bg-slate-900 border border-cyan-500/40 text-cyan-300 font-bold">▼</button>
        <button id="n2-r" class="px-4 py-2 rounded-xl bg-slate-900 border border-cyan-500/40 text-cyan-300 font-bold">▶</button>
      </div>`;
    document.getElementById('n2-l')?.addEventListener('click', () => stepMove('left'));
    document.getElementById('n2-r')?.addEventListener('click', () => stepMove('right'));
    document.getElementById('n2-u')?.addEventListener('click', () => stepMove('up'));
    document.getElementById('n2-d')?.addEventListener('click', () => stepMove('down'));

    const onK = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') { e.preventDefault(); stepMove('left'); }
      if (e.key === 'ArrowRight' || e.key === 'd') { e.preventDefault(); stepMove('right'); }
      if (e.key === 'ArrowUp' || e.key === 'w') { e.preventDefault(); stepMove('up'); }
      if (e.key === 'ArrowDown' || e.key === 's') { e.preventDefault(); stepMove('down'); }
    };
    window.addEventListener('keydown', onK);
    this.cleanupFns.push(() => window.removeEventListener('keydown', onK));

    const colors = { 0: 'bg-slate-950 text-slate-700', 2: 'bg-slate-800 text-cyan-200', 4: 'bg-cyan-900/60 text-cyan-200', 8: 'bg-cyan-600/40 text-white', 16: 'bg-purple-600/50 text-white', 32: 'bg-purple-500 text-white', 64: 'bg-amber-500/80 text-slate-950', 128: 'bg-amber-400 text-slate-950', 256: 'bg-emerald-400 text-slate-950' };
    const render = () => {
      this.domStage.innerHTML = `
        <div class="grid grid-cols-4 gap-2 p-3 w-full max-w-xs mx-auto bg-slate-900 rounded-2xl border border-purple-500/30">
          ${grid.flat().map((v) => `<div class="aspect-square rounded-xl flex items-center justify-center font-mono-num font-black text-lg ${colors[v] || 'bg-amber-300 text-slate-950'}">${v || ''}</div>`).join('')}
        </div>`;
    };
    render();
  },

  // ==================== 41. NEON PIANO TILES (4-LANE RHYTHM, 3 HEARTS) ====================
  runPianoTiles() {
    const W = 400, H = 460, LANE_W = W / 4, HIT_Y = H - 70;
    this.useCanvasMode(W, H);
    const ctx = this.ctx;

    let tiles = [];
    let hits = 0;
    let hearts = 3;
    let speed = 2.6;
    let distAcc = 0;
    const TARGET = 28;
    const laneFlash = [0, 0, 0, 0];

    const updateHud = () => {
      this.setHud({
        scoreLabel: `Hits (${hits}/${TARGET})`,
        scoreVal: `${hits * 15} TIX`,
        infoLabel: 'Hearts',
        infoVal: '♥'.repeat(hearts) + '♡'.repeat(3 - hearts)
      });
    };
    updateHud();

    const triggerLane = (lane) => {
      if (!this.isRoundActive) return;
      laneFlash[lane] = 1;
      const idx = tiles.findIndex((t) => t.lane === lane && Math.abs(t.y + t.h / 2 - HIT_Y) <= 44);
      if (idx !== -1) {
        tiles.splice(idx, 1);
        hits += 1;
        if (hits > 5) speed = Math.min(6.2, 2.6 + (hits - 5) * 0.12);
        ArcadeAudio.playCoinInsert();
        updateHud();
        if (hits >= TARGET) {
          this.finishRound(450, 'RHYTHM MASTER!', `Berhasil menekan ${TARGET} nada tepat waktu dengan ${hearts} hati tersisa (+450 Tickets)!`);
        }
      } else {
        hearts -= 1;
        ArcadeAudio.playError();
        updateHud();
        if (hearts <= 0) {
          this.finishRound(0, 'HATI HABIS — KALAH!', `Salah tekan / meleset hingga 3 hati habis! (0 Tickets).`);
        }
      }
    };

    this.controlsBar.innerHTML = `
      <div class="grid grid-cols-4 gap-2 w-full">
        <button id="pt-0" class="py-3 rounded-xl bg-cyan-500/20 border border-cyan-400 text-cyan-200 font-display font-black text-xs">D</button>
        <button id="pt-1" class="py-3 rounded-xl bg-purple-500/20 border border-purple-400 text-purple-200 font-display font-black text-xs">F</button>
        <button id="pt-2" class="py-3 rounded-xl bg-amber-500/20 border border-amber-400 text-amber-200 font-display font-black text-xs">J</button>
        <button id="pt-3" class="py-3 rounded-xl bg-rose-500/20 border border-rose-400 text-rose-200 font-display font-black text-xs">K</button>
      </div>`;
    [0, 1, 2, 3].forEach((l) => document.getElementById(`pt-${l}`)?.addEventListener('pointerdown', (e) => { e.preventDefault(); triggerLane(l); }));

    const keyMap = { d: 0, D: 0, f: 1, F: 1, j: 2, J: 2, k: 3, K: 3 };
    const onK = (e) => { if (!e.repeat && keyMap[e.key] !== undefined) triggerLane(keyMap[e.key]); };
    const onCanvasTap = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mx = ((e.clientX - rect.left) / rect.width) * W;
      triggerLane(Math.max(0, Math.min(3, Math.floor(mx / LANE_W))));
    };
    window.addEventListener('keydown', onK);
    this.canvas.addEventListener('pointerdown', onCanvasTap);
    this.cleanupFns.push(() => { window.removeEventListener('keydown', onK); this.canvas.removeEventListener('pointerdown', onCanvasTap); });

    const laneColors = ['#22d3ee', '#c084fc', '#fbbf24', '#f43f5e'];
    const loop = () => {
      if (!this.isRoundActive) return;
      distAcc += speed;
      if (distAcc >= 92) {
        distAcc = 0;
        tiles.push({ lane: Math.floor(Math.random() * 4), y: -56, h: 52 });
      }

      for (let i = tiles.length - 1; i >= 0; i--) {
        tiles[i].y += speed;
        if (tiles[i].y > H) {
          tiles.splice(i, 1);
          hearts -= 1;
          ArcadeAudio.playError();
          updateHud();
          if (hearts <= 0) {
            this.finishRound(0, 'HATI HABIS — KALAH!', `Terlalu banyak nada terlewat! (0 Tickets).`);
            return;
          }
        }
      }

      ctx.fillStyle = '#060913';
      ctx.fillRect(0, 0, W, H);
      for (let l = 0; l < 4; l++) {
        if (laneFlash[l] > 0) laneFlash[l] = Math.max(0, laneFlash[l] - 0.1);
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.strokeRect(l * LANE_W, 0, LANE_W, H);
        if (laneFlash[l] > 0) {
          ctx.fillStyle = `rgba(34, 211, 238, ${laneFlash[l] * 0.25})`;
          ctx.fillRect(l * LANE_W, HIT_Y - 30, LANE_W, 60);
        }
      }
      ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(0, HIT_Y); ctx.lineTo(W, HIT_Y); ctx.stroke();

      for (const t of tiles) {
        ctx.fillStyle = laneColors[t.lane];
        ctx.fillRect(t.lane * LANE_W + 8, t.y, LANE_W - 16, t.h);
      }

      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }
});

