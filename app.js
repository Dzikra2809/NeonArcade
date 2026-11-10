/**
 * NEON CARNIVAL // ARCADE MINI-GAME PLATFORM
 * Pure Vanilla JavaScript — In-Memory State, Canvas Lucky Wheel,
 * WebAudio Synthesizer, Confetti Particle Engine & Responsive Catalog.
 */

// ==================== 1. IN-MEMORY APPLICATION STATE ====================
const ArcadeState = {
  tokens: 1000,
  tickets: 2450,
  currentWager: 25,
  soundEnabled: true,
  isSpinning: false,
  forceNextJackpot: false,
  sessionSpins: 0,
  bestMultiplier: 0,
  wheelAngle: 0, // Current rotation in radians
  activeCategory: 'all',
  searchQuery: '',
  activePreviewGame: null,
  communityJackpot: 1250840,

  // 8 Wheel Segments (Clockwise starting from angle 0 = East)
  wheelSegments: [
    {
      id: 'seg-50x',
      label: '50x JACKPOT',
      shortLabel: '50x',
      multiplier: 50,
      isTopPrize: true,
      tierName: 'MEGA CARNIVAL JACKPOT!',
      bgStart: '#f59e0b',
      bgEnd: '#b45309',
      accent: '#fde68a',
      weight: 6
    },
    {
      id: 'seg-2x',
      label: '2x TICKETS',
      shortLabel: '2x',
      multiplier: 2,
      isTopPrize: false,
      tierName: 'Double Ticket Boost',
      bgStart: '#0891b2',
      bgEnd: '#0e7490',
      accent: '#67e8f9',
      weight: 22
    },
    {
      id: 'seg-15x',
      label: '15x MYSTERY',
      shortLabel: '15x',
      multiplier: 15,
      isTopPrize: true,
      tierName: 'MYSTERY PRIZE SURGE!',
      bgStart: '#9333ea',
      bgEnd: '#6b21a8',
      accent: '#e9d5ff',
      weight: 11
    },
    {
      id: 'seg-1x',
      label: '1x REBATE',
      shortLabel: '1x',
      multiplier: 1,
      isTopPrize: false,
      tierName: 'Ticket Saver',
      bgStart: '#1e293b',
      bgEnd: '#0f172a',
      accent: '#94a3b8',
      weight: 18
    },
    {
      id: 'seg-25x',
      label: '25x CROWN',
      shortLabel: '25x',
      multiplier: 25,
      isTopPrize: true,
      tierName: 'ROYAL CARNIVAL CROWN!',
      bgStart: '#db2777',
      bgEnd: '#9d174d',
      accent: '#fbcfe8',
      weight: 8
    },
    {
      id: 'seg-3x',
      label: '3x BOOST',
      shortLabel: '3x',
      multiplier: 3,
      isTopPrize: false,
      tierName: 'Triple Neon Hit',
      bgStart: '#0284c7',
      bgEnd: '#0369a1',
      accent: '#7dd3fc',
      weight: 18
    },
    {
      id: 'seg-10x',
      label: '10x SUPER',
      shortLabel: '10x',
      multiplier: 10,
      isTopPrize: false,
      tierName: 'Super Midway Win',
      bgStart: '#7c3aed',
      bgEnd: '#5b21b6',
      accent: '#ddd6fe',
      weight: 12
    },
    {
      id: 'seg-5x',
      label: '5x NEON',
      shortLabel: '5x',
      multiplier: 5,
      isTopPrize: false,
      tierName: 'High-Five Multiplier',
      bgStart: '#d97706',
      bgEnd: '#92400e',
      accent: '#fde047',
      weight: 15
    }
  ],

  // Initial Spin History
  spinHistory: [
    { time: 'Just now', wager: 25, multiplier: 10, ticketsWon: 250, label: '10x SUPER', isTopPrize: false },
    { time: '2m ago', wager: 50, multiplier: 25, ticketsWon: 1250, label: '25x CROWN', isTopPrize: true },
    { time: '5m ago', wager: 10, multiplier: 3, ticketsWon: 30, label: '3x BOOST', isTopPrize: false }
  ],

  // Notifications List
  notifications: [
    {
      id: 1,
      title: 'Double Ticket Hour Active!',
      desc: 'All Lucky Wheel top prizes include bonus confetti & VIP progress.',
      time: '2m ago',
      unread: true,
      accent: 'cyan'
    },
    {
      id: 2,
      title: 'Welcome Gift Credited',
      desc: '1,000 Virtual Tokens & 2,450 Prize Tickets loaded into your pass.',
      time: '12m ago',
      unread: true,
      accent: 'amber'
    },
    {
      id: 3,
      title: 'New Cabinet: Pinball Bounce',
      desc: 'Hit the cyber bumpers for up to 500x ticket multipliers!',
      time: '1h ago',
      unread: true,
      accent: 'purple'
    }
  ],

  // Carnival Mini-Games Catalog (16 Friv-Style Hardcore Arcade Games)
  gamesCatalog: [
    {
      id: 'lucky-wheel',
      title: 'Lucky Wheel',
      subtitle: 'Main Stage Spinner',
      category: ['popular', 'jackpot'],
      difficulty: 'HARD',
      badge: 'Jackpot 1000x Tickets',
      badgeColor: 'amber',
      accentTheme: 'cyan',
      tokenCost: 25,
      maxTickets: '1,000x Tickets',
      players: 482,
      isPlayableOnPage: true,
      icon: '🎡',
      description: 'Spin the 8-segment neon carnival wheel right on this page for instant multiplier payouts and jackpot confetti showers!'
    },
    {
      id: 'pinball-bounce',
      title: 'Pinball Bounce',
      subtitle: 'Cyber Bumper Blitz',
      category: ['popular', 'skill'],
      difficulty: 'EXTREME',
      badge: 'Popular',
      badgeColor: 'cyan',
      accentTheme: 'purple',
      tokenCost: 15,
      maxTickets: '500x Tickets',
      players: 319,
      isPlayableOnPage: false,
      icon: '🎱',
      description: 'Hanya 2 bola & gravitasi cepat! Hindari Black Hole tengah yang menyedot combo dan jaga bola tetap memantul di bumper neon.'
    },
    {
      id: 'mystery-box',
      title: 'Mystery Box',
      subtitle: 'Bom & Jackpot Vault',
      category: ['jackpot', 'popular'],
      difficulty: 'HARD',
      badge: 'Risk & Cashout',
      badgeColor: 'purple',
      accentTheme: 'amber',
      tokenCost: 30,
      maxTickets: '1,000x Tickets',
      players: 274,
      isPlayableOnPage: false,
      icon: '🎁',
      description: 'Ada 2 Bom Tengkorak tersembunyi di antara 6 brankas! Buka kotak untuk tumpuk tiket atau klik CASH OUT sebelum meledak & hangus!'
    },
    {
      id: 'coin-drop',
      title: 'Coin Drop',
      subtitle: 'Laser Plinko Hazard',
      category: ['popular', 'skill'],
      difficulty: 'EXTREME',
      badge: 'Trap Slots',
      badgeColor: 'amber',
      accentTheme: 'cyan',
      tokenCost: 10,
      maxTickets: '350x Tickets',
      players: 410,
      isPlayableOnPage: false,
      icon: '🪙',
      description: 'Sisi kiri & kanan arena terbuka! Bidik jalur tengah—jika koin/bola terpental keluar arena, ronde langsung kalah & tiket hangus!'
    },
    {
      id: 'cyber-claw',
      title: 'Cyber Claw 3000',
      subtitle: 'Precision Sway Claw',
      category: ['skill'],
      difficulty: 'EXTREME',
      badge: '2 Tries Only',
      badgeColor: 'cyan',
      accentTheme: 'purple',
      tokenCost: 20,
      maxTickets: '500x Tickets',
      players: 198,
      isPlayableOnPage: false,
      icon: '🕹️',
      description: 'Capit berayun & cengkeraman licin! Kapsul 500 TIX akan terlepas jika tidak dicapit tepat di titik pusat.'
    },
    {
      id: 'neon-skeeball',
      title: 'Neon Skee-Ball',
      subtitle: 'Guarded Alley Roll',
      category: ['skill', 'popular'],
      difficulty: 'HARD',
      badge: 'Blocked Rings',
      badgeColor: 'purple',
      accentTheme: 'amber',
      tokenCost: 15,
      maxTickets: '250x Tickets',
      players: 245,
      isPlayableOnPage: false,
      icon: '🎳',
      description: '4 bola dengan palang pelindung bergerak! Meleset dari ring atau mengenai blocker = 0 tiket.'
    },
    {
      id: 'ring-toss',
      title: 'Ring Toss Blitz',
      subtitle: 'Crosswind Bottle Toss',
      category: ['skill', 'jackpot'],
      difficulty: 'EXTREME',
      badge: 'Wind Drift',
      badgeColor: 'cyan',
      accentTheme: 'cyan',
      tokenCost: 15,
      maxTickets: '600x Tickets',
      players: 164,
      isPlayableOnPage: false,
      icon: '⭕',
      description: 'Botol bergoyang cepat + angin samping acak! Hitbox leher botol super sempit, butuh kompensasi arah angin.'
    },
    {
      id: 'laser-duck',
      title: 'Laser Duck Alley',
      subtitle: 'Limited Ammo Gallery',
      category: ['skill', 'action'],
      difficulty: 'HARD',
      badge: '18 Ammo Limit',
      badgeColor: 'amber',
      accentTheme: 'purple',
      tokenCost: 20,
      maxTickets: '400x Tickets',
      players: 152,
      isPlayableOnPage: false,
      icon: '🦆',
      description: 'Tembak bebek super cepat dengan 18 peluru laser! Tembak bomb = -40 tiket, meleset = penalti & reset combo.'
    },
    {
      id: 'cyber-flap',
      title: 'Cyber Flap',
      subtitle: 'Laser Pipe Gauntlet',
      category: ['action', 'popular'],
      difficulty: 'INSANE',
      badge: 'Friv Classic',
      badgeColor: 'cyan',
      accentTheme: 'cyan',
      tokenCost: 15,
      maxTickets: '800x Tickets',
      players: 531,
      isPlayableOnPage: false,
      icon: '🚀',
      description: 'Terobos celah pipa laser sempit yang makin cepat! Sekali menyentuh pipa atau lantai, drone langsung hancur!'
    },
    {
      id: 'snake-rush',
      title: 'Neon Snake Blitz',
      subtitle: 'Minefield Grid',
      category: ['action', 'popular'],
      difficulty: 'HARD',
      badge: 'Speed Ramp',
      badgeColor: 'purple',
      accentTheme: 'purple',
      tokenCost: 15,
      maxTickets: '600x Tickets',
      players: 388,
      isPlayableOnPage: false,
      icon: '🐍',
      description: 'Makan orb energi sementara ranjau merah terus bermunculan & kecepatan ular meningkat drastis tiap 2 orb!'
    },
    {
      id: 'brick-breaker',
      title: 'Hyper Brick Breaker',
      subtitle: '1-Life Cyber Arkanoid',
      category: ['action', 'skill'],
      difficulty: 'EXTREME',
      badge: '3 Hati',
      badgeColor: 'amber',
      accentTheme: 'amber',
      tokenCost: 20,
      maxTickets: '750x Tickets',
      players: 294,
      isPlayableOnPage: false,
      icon: '🧱',
      description: '3 Hati (♥♥♥) & paddle makin mengecil! Bola memantul makin cepat tiap menghancurkan bata lapis baja. Hati habis = kalah!'
    },
    {
      id: 'meteor-dodge',
      title: 'Space Meteor Dodge',
      subtitle: '25s Bullet-Hell',
      category: ['action', 'jackpot'],
      difficulty: 'INSANE',
      badge: 'Survival 25s',
      badgeColor: 'purple',
      accentTheme: 'cyan',
      tokenCost: 25,
      maxTickets: '900x Tickets',
      players: 342,
      isPlayableOnPage: false,
      icon: '☄️',
      description: 'Bertahan hidup 25 detik dari hujan meteor berkecepatan tinggi! Kena 1 meteor = kalah & tiket terpotong 70%.'
    },
    {
      id: 'reflex-grid',
      title: 'Reflex Odd-Tile',
      subtitle: '1.5s Brain Speed Test',
      category: ['action', 'skill'],
      difficulty: 'INSANE',
      badge: '10 Rounds',
      badgeColor: 'cyan',
      accentTheme: 'purple',
      tokenCost: 15,
      maxTickets: '550x Tickets',
      players: 215,
      isPlayableOnPage: false,
      icon: '⚡',
      description: 'Temukan 1 ubin warna berbeda dalam batas waktu kurang dari 1.5 detik! Salah klik atau telat = langsung gugur!'
    },
    {
      id: 'tower-stack',
      title: 'Cyber Stacker',
      subtitle: 'Micro-Timing Tower',
      category: ['skill', 'jackpot'],
      difficulty: 'EXTREME',
      badge: 'Floor 12 Jackpot',
      badgeColor: 'amber',
      accentTheme: 'amber',
      tokenCost: 20,
      maxTickets: '850x Tickets',
      players: 267,
      isPlayableOnPage: false,
      icon: '🏗️',
      description: 'Tumpuk blok neon yang meluncur super cepat! Bagian berlebih langsung terpotong hingga setipis silet.'
    },
    {
      id: 'whack-glitch',
      title: 'Whack-a-Glitch',
      subtitle: '600ms Cyber Hammer',
      category: ['action'],
      difficulty: 'HARD',
      badge: 'Decoy Bombs',
      badgeColor: 'purple',
      accentTheme: 'cyan',
      tokenCost: 15,
      maxTickets: '450x Tickets',
      players: 189,
      isPlayableOnPage: false,
      icon: '🔨',
      description: 'Hantam glitch bot dalam 600ms sebelum kabur! Salah pukul bom merah akan membuat palu stun selama 1 detik.'
    },
    {
      id: 'cyber-dash',
      title: 'Cyber Dash Runner',
      subtitle: 'Hardcore Spike Jump',
      category: ['action', 'popular'],
      difficulty: 'INSANE',
      badge: 'Friv Endless',
      badgeColor: 'amber',
      accentTheme: 'purple',
      tokenCost: 20,
      maxTickets: '1,000x Tickets',
      players: 461,
      isPlayableOnPage: false,
      icon: '🦊',
      description: 'Lompati duri laser ganda & drone terbang dengan kecepatan brutal yang terus meningkat!'
    },
    {
      id: 'space-invaders',
      title: 'Cyber Invaders',
      subtitle: 'Alien Wave Shooter',
      category: ['action', 'popular'],
      difficulty: 'HARD',
      badge: 'Retro Classic',
      badgeColor: 'cyan',
      accentTheme: 'cyan',
      tokenCost: 15,
      maxTickets: '700x Tickets',
      players: 356,
      isPlayableOnPage: false,
      icon: '👾',
      description: 'Tembak jatuh pasukan alien sebelum mendarat! Kecepatan alien dan tembakan musuh meningkat saat jumlahnya berkurang.'
    },
    {
      id: 'memory-matrix',
      title: 'Neon Memory Matrix',
      subtitle: 'Sequence Brain Lock',
      category: ['skill'],
      difficulty: 'HARD',
      badge: '10-Step Test',
      badgeColor: 'purple',
      accentTheme: 'purple',
      tokenCost: 15,
      maxTickets: '650x Tickets',
      players: 211,
      isPlayableOnPage: false,
      icon: '🧠',
      description: 'Hafalkan urutan lampu grid 3x3 yang makin panjang dan cepat! Satu kesalahan urutan langsung mengakhiri ronde.'
    },
    {
      id: 'fruit-slash',
      title: 'Cyber Fruit Slash',
      subtitle: 'Holo-Katana Slicer',
      category: ['action', 'popular'],
      difficulty: 'EXTREME',
      badge: 'Combo Slicer',
      badgeColor: 'amber',
      accentTheme: 'amber',
      tokenCost: 20,
      maxTickets: '800x Tickets',
      players: 429,
      isPlayableOnPage: false,
      icon: '🍉',
      description: 'Geser kursor/jari untuk menebas buah neon yang melambung! Lewatkan 3 buah atau tebas bom 💣 = langsung kalah.'
    },
    {
      id: 'pong-duel',
      title: 'Hyper Pong Arena',
      subtitle: '1P vs AI / 2P Local 1v1',
      category: ['skill', 'action', '2p'],
      supportsTwoPlayer: true,
      difficulty: 'EXTREME',
      badge: '1P / 2P Duel',
      badgeColor: 'cyan',
      accentTheme: 'cyan',
      tokenCost: 20,
      maxTickets: '500x Tickets',
      players: 284,
      isPlayableOnPage: false,
      icon: '🏓',
      description: 'Pilih main sendiri lawan Cyber AI atau berdua 1v1 (W/S vs ↑/↓) di satu layar! Pertama mencapai 5 poin menang.'
    },
    {
      id: 'minesweeper-mini',
      title: 'Neon Mine Hunter',
      subtitle: '5x5 Tactical Sweeper',
      category: ['skill', 'jackpot'],
      difficulty: 'EXTREME',
      badge: 'Cashout Mode',
      badgeColor: 'amber',
      accentTheme: 'purple',
      tokenCost: 25,
      maxTickets: '900x Tickets',
      players: 237,
      isPlayableOnPage: false,
      icon: '🚩',
      description: 'Buka kotak aman berdasarkan petunjuk angka ranjau di sekitar! Amankan tiket dengan Cash Out atau sapu bersih untuk Jackpot.'
    },
    {
      id: 'math-blitz',
      title: 'Turbo Math Rush',
      subtitle: 'Speed Arithmetic',
      category: ['skill'],
      difficulty: 'HARD',
      badge: 'Brain Sprint',
      badgeColor: 'purple',
      accentTheme: 'cyan',
      tokenCost: 10,
      maxTickets: '450x Tickets',
      players: 176,
      isPlayableOnPage: false,
      icon: '🧮',
      description: 'Jawab soal hitung cepat sebelum waktu habis! Timer semakin sempit di setiap jawaban benar beruntun.'
    },
    {
      id: 'typing-storm',
      title: 'Cyber Word Hacker',
      subtitle: 'Firewall Code Defense',
      category: ['action', 'skill'],
      difficulty: 'EXTREME',
      badge: 'Code Breaker',
      badgeColor: 'cyan',
      accentTheme: 'purple',
      tokenCost: 15,
      maxTickets: '750x Tickets',
      players: 193,
      isPlayableOnPage: false,
      icon: '💻',
      description: 'Ketik atau klik target kata kode yang jatuh sebelum menembus firewall! Kecepatan jatuh meningkat tiap level.'
    },
    {
      id: 'gravity-flip',
      title: 'Gravity Switch',
      subtitle: 'G-Switch Cyber Tunnel',
      category: ['action', 'popular'],
      difficulty: 'INSANE',
      badge: 'Friv Hit',
      badgeColor: 'purple',
      accentTheme: 'amber',
      tokenCost: 20,
      maxTickets: '950x Tickets',
      players: 448,
      isPlayableOnPage: false,
      icon: '🧲',
      description: 'Balik gravitasi antara lantai dan langit-langit untuk menghindari dinding laser & gergaji neon yang makin cepat!'
    },
    {
      id: 'paddle-keepup',
      title: 'Neon Keepy-Uppy',
      subtitle: 'Anti-Gravity Juggle',
      category: ['skill', 'action'],
      difficulty: 'HARD',
      badge: 'Physics Skill',
      badgeColor: 'amber',
      accentTheme: 'cyan',
      tokenCost: 15,
      maxTickets: '500x Tickets',
      players: 205,
      isPlayableOnPage: false,
      icon: '⚽',
      description: 'Klik tepat di bawah bola energi untuk menendangnya ke atas! Makin tinggi kombo, makin liar pantulan & gravitasinya.'
    },
    {
      id: 'color-catch',
      title: 'Chroma Catcher',
      subtitle: 'Target Color Sorter',
      category: ['action', 'skill'],
      difficulty: 'HARD',
      badge: 'Shifting Rule',
      badgeColor: 'cyan',
      accentTheme: 'purple',
      tokenCost: 15,
      maxTickets: '550x Tickets',
      players: 229,
      isPlayableOnPage: false,
      icon: '🎨',
      description: 'Tangkap hanya orb yang sesuai Target Color di HUD! Warna target berubah tiap 6 detik dan salah tangkap memotong nyawa.'
    },
    {
      id: 'laser-maze',
      title: 'Wire Pulse Run',
      subtitle: 'Corridor Precision',
      category: ['skill', 'jackpot'],
      difficulty: 'INSANE',
      badge: 'No-Touch Test',
      badgeColor: 'amber',
      accentTheme: 'amber',
      tokenCost: 20,
      maxTickets: '850x Tickets',
      players: 314,
      isPlayableOnPage: false,
      icon: '⚡',
      description: 'Arahkan orb menyusuri celah gerbang laser yang terus menyempit dan melaju kencang tanpa menyentuh dinding!'
    },
    {
      id: 'crossy-neon',
      title: 'Neon Hopper',
      subtitle: 'Cyber Highway Dash',
      category: ['action', 'popular'],
      difficulty: 'EXTREME',
      badge: '6-Lane Rush',
      badgeColor: 'purple',
      accentTheme: 'cyan',
      tokenCost: 15,
      maxTickets: '700x Tickets',
      players: 372,
      isPlayableOnPage: false,
      icon: '🐸',
      description: 'Lompat menyeberangi 6 jalur lalu lintas kendaraan cyber yang kecepatannya meningkat setiap kali mencapai garis finis!'
    },
    {
      id: 'asteroid-turret',
      title: 'Orbital Defense',
      subtitle: '360° Core Turret',
      category: ['action'],
      difficulty: 'EXTREME',
      badge: '360° Shooter',
      badgeColor: 'cyan',
      accentTheme: 'purple',
      tokenCost: 20,
      maxTickets: '750x Tickets',
      players: 268,
      isPlayableOnPage: false,
      icon: '🛸',
      description: 'Tembak asteroid yang datang dari segala arah sebelum menghantam inti reaktor di tengah layar!'
    },
    {
      id: 'reaction-duel',
      title: 'Quick Draw Duel',
      subtitle: 'Millisecond Showdown',
      category: ['action', 'skill'],
      difficulty: 'INSANE',
      badge: '5-Round Duel',
      badgeColor: 'amber',
      accentTheme: 'amber',
      tokenCost: 20,
      maxTickets: '800x Tickets',
      players: 295,
      isPlayableOnPage: false,
      icon: '🤠',
      description: 'Tunggu sinyal hijau FIRE! dan klik lebih cepat dari rival cyborg. Menembak terlalu cepat = langsung diskualifikasi!'
    },
    {
      id: 'balloon-pop',
      title: 'Neon Balloon Blitz',
      subtitle: 'Sky Target Pop',
      category: ['action', 'popular'],
      difficulty: 'HARD',
      badge: 'Rising Speed',
      badgeColor: 'purple',
      accentTheme: 'cyan',
      tokenCost: 10,
      maxTickets: '450x Tickets',
      players: 251,
      isPlayableOnPage: false,
      icon: '🎈',
      description: 'Pecahkan balon neon yang terbang naik sebelum lolos! Lewatkan 4 balon atau pecahkan balon berduri = Game Over.'
    },
    {
      id: 'orbit-jump',
      title: 'Ring Orbit Dash',
      subtitle: 'Dual-Track Dodger',
      category: ['action', 'jackpot'],
      difficulty: 'INSANE',
      badge: 'Rhythm Dodge',
      badgeColor: 'amber',
      accentTheme: 'purple',
      tokenCost: 20,
      maxTickets: '900x Tickets',
      players: 331,
      isPlayableOnPage: false,
      icon: '🪐',
      description: 'Lompat antara lintasan orbit dalam dan luar untuk menghindari duri merah yang berputar makin cepat tiap putaran!'
    },
    {
      id: 'air-hockey',
      title: 'Neon Air Hockey',
      subtitle: '1P vs AI / 2P Table Duel',
      category: ['2p', 'popular', 'action'],
      supportsTwoPlayer: true,
      difficulty: 'HARD',
      badge: '1P / 2P Table',
      badgeColor: 'cyan',
      accentTheme: 'cyan',
      tokenCost: 20,
      maxTickets: '600x Tickets',
      players: 418,
      isPlayableOnPage: false,
      icon: '🏒',
      description: 'Meja Air Hockey neon! Main sendiri lawan Striker AI atau berdua (WASD / sentuh bawah vs Panah / sentuh atas) hingga 5 gol!'
    },
    {
      id: 'tank-duel',
      title: 'Cyber Tank Arena',
      subtitle: '1P vs AI / 2P Ricochet',
      category: ['2p', 'action', 'skill'],
      supportsTwoPlayer: true,
      difficulty: 'EXTREME',
      badge: '1P / 2P 3-Hati',
      badgeColor: 'purple',
      accentTheme: 'purple',
      tokenCost: 25,
      maxTickets: '750x Tickets',
      players: 349,
      isPlayableOnPage: false,
      icon: '🛡️',
      description: 'Duel tank berlapis baja dengan 3 Hati! Tembak peluru plasma memantul di balik dinding pelindung (1P atau 2P lokal).'
    },
    {
      id: 'tug-of-war',
      title: 'Neon Power Tug',
      subtitle: '1P vs AI / 2P Mash Battle',
      category: ['2p', 'popular', 'action'],
      supportsTwoPlayer: true,
      difficulty: 'HARD',
      badge: '1P / 2P Mash',
      badgeColor: 'amber',
      accentTheme: 'amber',
      tokenCost: 15,
      maxTickets: '500x Tickets',
      players: 392,
      isPlayableOnPage: false,
      icon: '⚡',
      description: 'Tarik tambang energi plasma! Tekan cepat A vs L (atau tombol tap kiri vs kanan) untuk mendorong inti ke gawang lawan.'
    },
    {
      id: 'sumo-bumpers',
      title: 'Neon Bumper Sumo',
      subtitle: '1P vs AI / 2P Ring-Out',
      category: ['2p', 'action', 'skill'],
      supportsTwoPlayer: true,
      difficulty: 'HARD',
      badge: '1P / 2P Sumo',
      badgeColor: 'cyan',
      accentTheme: 'purple',
      tokenCost: 20,
      maxTickets: '650x Tickets',
      players: 306,
      isPlayableOnPage: false,
      icon: '🛸',
      description: 'Tabrak lawan keluar dari ring neon yang makin menyusut! Pertama mencetak 3 Ring-Out menang (1P atau 2P lokal).'
    },
    {
      id: 'connect-four',
      title: 'Neon Connect 4',
      subtitle: '1P vs AI / 2P Strategy',
      category: ['2p', 'skill', 'popular'],
      supportsTwoPlayer: true,
      difficulty: 'HARD',
      badge: '1P / 2P Board',
      badgeColor: 'cyan',
      accentTheme: 'cyan',
      tokenCost: 15,
      maxTickets: '500x Tickets',
      players: 298,
      isPlayableOnPage: false,
      icon: '🔴',
      description: 'Jatuhkan keping neon untuk menyambung 4 warna segaris (horizontal, vertikal, diagonal)! Bisa 1P lawan AI atau 2P bergantian.'
    },
    {
      id: 'tic-tac-toe-4x4',
      title: 'Cyber Tic-Tac-Toe',
      subtitle: '1P vs AI / 2P Speed BO3',
      category: ['2p', 'skill'],
      supportsTwoPlayer: true,
      difficulty: 'HARD',
      badge: '1P / 2P 3s Turn',
      badgeColor: 'purple',
      accentTheme: 'purple',
      tokenCost: 10,
      maxTickets: '350x Tickets',
      players: 263,
      isPlayableOnPage: false,
      icon: '❌',
      description: 'Tic-Tac-Toe kilat Best-of-3 dengan batas 3.5 detik per giliran! Main sendiri lawan AI atau duel berdua.'
    },
    {
      id: 'tron-cycles',
      title: 'Neon Light Cycles',
      subtitle: '1P vs AI / 2P Tron Trail',
      category: ['2p', 'action', 'popular'],
      supportsTwoPlayer: true,
      difficulty: 'EXTREME',
      badge: '1P / 2P Tron',
      badgeColor: 'amber',
      accentTheme: 'amber',
      tokenCost: 20,
      maxTickets: '700x Tickets',
      players: 387,
      isPlayableOnPage: false,
      icon: '🏍️',
      description: 'Balap motor cahaya ala Tron! Jebak lawan dengan jejak lasermu—tabrak dinding atau jejak cahaya = langsung meledak!'
    },
    {
      id: 'tetris-mini',
      title: 'Cyber Block Drop',
      subtitle: 'Classic Neon Tetris',
      category: ['skill', 'popular', 'jackpot'],
      difficulty: 'HARD',
      badge: 'Classic Puzzle',
      badgeColor: 'cyan',
      accentTheme: 'cyan',
      tokenCost: 15,
      maxTickets: '800x Tickets',
      players: 472,
      isPlayableOnPage: false,
      icon: '🧩',
      description: 'Susun & putar blok tetromino yang jatuh makin cepat! Hapus baris untuk tiket besar; menumpuk sampai puncak = Game Over.'
    },
    {
      id: '2048-neon',
      title: 'Neon 2048 Merge',
      subtitle: '4x4 Number Fusion',
      category: ['skill'],
      difficulty: 'EXTREME',
      badge: 'Brain Puzzle',
      badgeColor: 'purple',
      accentTheme: 'purple',
      tokenCost: 15,
      maxTickets: '600x Tickets',
      players: 325,
      isPlayableOnPage: false,
      icon: '🔢',
      description: 'Gabungkan angka kembar (2→4→8→...→256) dalam 45 langkah! Capai ubin 256 sebelum papan terkunci untuk menang besar.'
    },
    {
      id: 'simon-rhythm',
      title: 'Neon Piano Tiles',
      subtitle: '4-Lane Rhythm Drop',
      category: ['action', 'popular'],
      difficulty: 'EXTREME',
      badge: '3 Hati Rhythm',
      badgeColor: 'amber',
      accentTheme: 'amber',
      tokenCost: 15,
      maxTickets: '750x Tickets',
      players: 415,
      isPlayableOnPage: false,
      icon: '🎹',
      description: 'Tekan tombol D/F/J/K (atau tap 4 jalur bawah) tepat saat balok musik neon turun! 3 Hati—meleset atau salah tekan mengurangi hati.'
    }
  ]
};

// ==================== 2. WEB AUDIO SYNTHESIZER ====================
const ArcadeAudio = {
  ctx: null,

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  },

  playTick(speedRatio = 0.5) {
    if (!ArcadeState.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Higher pitch when fast, slightly deeper as wheel slows down
    osc.type = 'triangle';
    const baseFreq = 520 + Math.min(speedRatio * 400, 450);
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.035);

    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  },

  playClick() {
    if (!ArcadeState.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.05);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.055);
  },

  playCoinInsert() {
    if (!ArcadeState.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    [987.77, 1318.51].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);
      gain.gain.setValueAtTime(0.15, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.19);
    });
  },

  playWinFanfare(isJackpot = false) {
    if (!ArcadeState.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = isJackpot
      ? [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5, 1318.51]
      : [523.25, 659.25, 783.99, 1046.5];

    notes.forEach((freq, index) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = isJackpot ? 'triangle' : 'sine';
      const startTime = now + index * 0.09;
      const duration = index === notes.length - 1 ? 0.45 : 0.12;

      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + duration + 0.02);
    });
  },

  playBounce() {
    if (!ArcadeState.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(680, now + 0.08);
    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  },

  playLaser() {
    if (!ArcadeState.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(920, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.11);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  },

  playError() {
    if (!ArcadeState.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(190, now);
    osc.frequency.linearRampToValueAtTime(110, now + 0.18);
    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  }
};

// ==================== 3. ANIMATED NUMBER COUNTER UTILITY ====================
function animateBalanceCounter(el, startVal, endVal, duration = 650) {
  if (!el) return;
  el.classList.remove('counter-bump');
  void el.offsetWidth; // Reflow to restart animation
  el.classList.add('counter-bump');

  const startTime = performance.now();
  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(startVal + (endVal - startVal) * eased);
    el.textContent = current.toLocaleString();
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = endVal.toLocaleString();
    }
  }
  requestAnimationFrame(update);
}

function updateBalances(tokenDelta = 0, ticketDelta = 0) {
  const tokenEl = document.getElementById('nav-token-balance');
  const ticketEl = document.getElementById('nav-ticket-balance');

  if (tokenDelta !== 0) {
    const oldTokens = ArcadeState.tokens;
    ArcadeState.tokens = Math.max(0, ArcadeState.tokens + tokenDelta);
    animateBalanceCounter(tokenEl, oldTokens, ArcadeState.tokens);
  }

  if (ticketDelta !== 0) {
    const oldTickets = ArcadeState.tickets;
    ArcadeState.tickets = Math.max(0, ArcadeState.tickets + ticketDelta);
    animateBalanceCounter(ticketEl, oldTickets, ArcadeState.tickets);
  }
}

// ==================== 4. LUCKY WHEEL CANVAS RENDERER & SPIN LOGIC ====================
const WheelController = {
  canvas: null,
  ctx: null,
  lastSegmentIndex: -1,
  ledPhase: 0,

  init() {
    this.canvas = document.getElementById('lucky-wheel-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.renderLegend();
    this.renderHistory();
    this.drawWheel(ArcadeState.wheelAngle);

    // Subtle ambient LED ring pulse
    setInterval(() => {
      this.ledPhase = (this.ledPhase + 1) % 2;
      if (!ArcadeState.isSpinning) {
        this.drawWheel(ArcadeState.wheelAngle);
      }
    }, 650);
  },

  drawWheel(angleOffset) {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;
    const cx = width / 2;
    const cy = height / 2;
    const outerRadius = width / 2 - 14;
    const wheelRadius = outerRadius - 22;

    ctx.clearRect(0, 0, width, height);

    const segments = ArcadeState.wheelSegments;
    const numSegments = segments.length;
    const arcSize = (Math.PI * 2) / numSegments;

    // 1. Draw Outer Metallic Bezel Ring
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, outerRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#090d1a';
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.45)';
    ctx.stroke();
    ctx.restore();

    // 2. Draw Each Pie Segment
    for (let i = 0; i < numSegments; i++) {
      const seg = segments[i];
      const startAngle = angleOffset + i * arcSize;
      const endAngle = startAngle + arcSize;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, wheelRadius, startAngle, endAngle);
      ctx.closePath();

      // Radial gradient per slice
      const grad = ctx.createRadialGradient(cx, cy, 40, cx, cy, wheelRadius);
      grad.addColorStop(0, seg.bgEnd);
      grad.addColorStop(1, seg.bgStart);
      ctx.fillStyle = grad;
      ctx.fill();

      // Segment divider lines
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#070913';
      ctx.stroke();

      // Highlight top prize border glow
      if (seg.isTopPrize) {
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.7)';
        ctx.stroke();
      }
      ctx.restore();

      // 3. Draw Segment Text Labels
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(startAngle + arcSize / 2);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';

      // Big Multiplier Label
      ctx.font = '900 32px Orbitron, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 8;
      ctx.fillText(seg.shortLabel, wheelRadius - 34, -8);

      // Sub-label
      ctx.font = '700 15px Outfit, sans-serif';
      ctx.fillStyle = seg.accent;
      ctx.fillText(seg.label.replace(seg.shortLabel + ' ', ''), wheelRadius - 34, 18);
      ctx.restore();
    }

    // 4. Draw Perimeter Pegs & Carnival Bulb Lights
    const totalBulbs = numSegments * 2;
    for (let b = 0; b < totalBulbs; b++) {
      const bulbAngle = angleOffset + (b * Math.PI * 2) / totalBulbs;
      const bx = cx + Math.cos(bulbAngle) * (outerRadius - 11);
      const by = cy + Math.sin(bulbAngle) * (outerRadius - 11);

      const isLit = (b + this.ledPhase) % 2 === 0;
      ctx.save();
      ctx.beginPath();
      ctx.arc(bx, by, isLit ? 6 : 4.5, 0, Math.PI * 2);
      ctx.fillStyle = isLit ? '#fbbf24' : '#22d3ee';
      if (isLit) {
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 12;
      }
      ctx.fill();
      ctx.restore();
    }

    // 5. Inner Ring Shadow around Center Hub
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, 88, 0, Math.PI * 2);
    ctx.lineWidth = 6;
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.5)';
    ctx.stroke();
    ctx.restore();
  },

  // Calculate which segment is currently under the TOP pointer (-Math.PI / 2)
  getSegmentIndexAtPointer(angleOffset) {
    const numSegments = ArcadeState.wheelSegments.length;
    const arcSize = (Math.PI * 2) / numSegments;
    const pointerAngle = (Math.PI * 1.5 - (angleOffset % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    return Math.floor(pointerAngle / arcSize) % numSegments;
  },

  // Pick a weighted random segment (or jackpot if Lucky Charm mode is toggled)
  pickWinningSegmentIndex() {
    const segments = ArcadeState.wheelSegments;
    if (ArcadeState.forceNextJackpot) {
      ArcadeState.forceNextJackpot = false;
      const btnDemo = document.getElementById('btn-demo-jackpot');
      if (btnDemo) {
        btnDemo.classList.remove('glow-amber', 'border-amber-400', 'text-amber-300');
      }
      return 0; // Index 0 is 50x JACKPOT
    }

    const totalWeight = segments.reduce((acc, s) => acc + s.weight, 0);
    let rand = Math.random() * totalWeight;
    for (let i = 0; i < segments.length; i++) {
      rand -= segments[i].weight;
      if (rand <= 0) return i;
    }
    return 0;
  },

  spin() {
    if (ArcadeState.isSpinning) return;

    const wager = ArcadeState.currentWager;
    if (ArcadeState.tokens < wager) {
      showToast('Not enough Virtual Tokens! Click "+FREE" in the top bar for a token refill.', 'amber');
      return;
    }

    // Deduct tokens & play coin sound
    ArcadeState.isSpinning = true;
    ArcadeAudio.playCoinInsert();
    updateBalances(-wager, 0);

    // Update UI state
    const spinBtn = document.getElementById('btn-spin-main');
    const spinLabel = document.getElementById('btn-spin-label');
    const statusText = document.getElementById('wheel-status-text');
    const statusDot = document.getElementById('wheel-status-dot');

    if (spinBtn) spinBtn.disabled = true;
    if (spinLabel) spinLabel.textContent = 'WHEEL SPINNING...';
    if (statusText) statusText.textContent = `Spinning for ${wager} Tokens... Good luck!`;
    if (statusDot) statusDot.className = 'w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping';

    // Determine target segment & target angle
    const targetIndex = this.pickWinningSegmentIndex();
    const numSegments = ArcadeState.wheelSegments.length;
    const arcSize = (Math.PI * 2) / numSegments;

    // Center of targetIndex segment needs to land at -Math.PI / 2 (or 1.5 * Math.PI)
    // Add slight random jitter inside the slice so it feels natural
    const sliceOffset = (0.25 + Math.random() * 0.5) * arcSize;
    const desiredModAngle = (Math.PI * 1.5 - (targetIndex * arcSize + sliceOffset) + Math.PI * 2) % (Math.PI * 2);

    const currentMod = ((ArcadeState.wheelAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    let deltaAngle = (desiredModAngle - currentMod + Math.PI * 2) % (Math.PI * 2);

    // Add 6 to 8 full rotations
    const extraSpins = (6 + Math.floor(Math.random() * 2)) * Math.PI * 2;
    const totalRotation = extraSpins + deltaAngle;

    const startAngle = ArcadeState.wheelAngle;
    const duration = 4300; // ms
    const startTime = performance.now();
    this.lastSegmentIndex = this.getSegmentIndexAtPointer(startAngle);

    const flapperEl = document.getElementById('wheel-flapper');

    const animateFrame = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Quartic ease-out for realistic carnival wheel deceleration
      const eased = 1 - Math.pow(1 - progress, 4);
      ArcadeState.wheelAngle = startAngle + totalRotation * eased;

      // Detect segment boundary crossing for flapper bounce & audio tick
      const currentSegIdx = this.getSegmentIndexAtPointer(ArcadeState.wheelAngle);
      if (currentSegIdx !== this.lastSegmentIndex) {
        this.lastSegmentIndex = currentSegIdx;
        const speedRemaining = 1 - progress;
        ArcadeAudio.playTick(speedRemaining);

        if (flapperEl) {
          flapperEl.classList.add('tick');
          setTimeout(() => flapperEl.classList.remove('tick'), 55);
        }
      }

      this.drawWheel(ArcadeState.wheelAngle);

      if (progress < 1) {
        requestAnimationFrame(animateFrame);
      } else {
        this.onSpinComplete(targetIndex, wager);
      }
    };

    requestAnimationFrame(animateFrame);
  },

  onSpinComplete(winningIndex, wager) {
    ArcadeState.isSpinning = false;
    const winningSeg = ArcadeState.wheelSegments[winningIndex];
    const ticketsWon = wager * winningSeg.multiplier;

    // Update stats & balances
    ArcadeState.sessionSpins += 1;
    if (winningSeg.multiplier > ArcadeState.bestMultiplier) {
      ArcadeState.bestMultiplier = winningSeg.multiplier;
    }

    updateBalances(0, ticketsWon);

    // Update Session UI counters
    const sessionSpinsEl = document.getElementById('wheel-session-spins');
    const bestMultEl = document.getElementById('wheel-best-multiplier');
    if (sessionSpinsEl) sessionSpinsEl.textContent = ArcadeState.sessionSpins;
    if (bestMultEl) bestMultEl.textContent = `${ArcadeState.bestMultiplier}x`;

    // Re-enable Spin button
    const spinBtn = document.getElementById('btn-spin-main');
    const spinLabel = document.getElementById('btn-spin-label');
    const statusText = document.getElementById('wheel-status-text');
    const statusDot = document.getElementById('wheel-status-dot');

    if (spinBtn) spinBtn.disabled = false;
    if (spinLabel) spinLabel.textContent = `LAUNCH SPIN (${ArcadeState.currentWager} TOKENS)`;
    if (statusText) {
      statusText.innerHTML = `Landed on <strong class="text-amber-300">${winningSeg.label}</strong>! Won <strong class="text-cyan-300">+${ticketsWon.toLocaleString()} Tickets</strong>!`;
    }
    if (statusDot) statusDot.className = 'w-2.5 h-2.5 rounded-full bg-emerald-400';

    // Prepend to Spin History
    ArcadeState.spinHistory.unshift({
      time: 'Just now',
      wager,
      multiplier: winningSeg.multiplier,
      ticketsWon,
      label: winningSeg.label,
      isTopPrize: winningSeg.isTopPrize
    });
    if (ArcadeState.spinHistory.length > 8) ArcadeState.spinHistory.pop();
    this.renderHistory();

    // Play audio & trigger celebration
    ArcadeAudio.playWinFanfare(winningSeg.isTopPrize);

    if (winningSeg.isTopPrize) {
      // Push notification to Carnival Feed
      addNotification(
        `Jackpot Hit: ${winningSeg.label}!`,
        `You won +${ticketsWon.toLocaleString()} Prize Tickets on a ${wager}-token spin!`,
        'amber'
      );
      openJackpotModal(winningSeg, ticketsWon);
    } else {
      // Standard prize burst
      ConfettiEngine.burst(45);
      showToast(`🎯 ${winningSeg.label}! +${ticketsWon.toLocaleString()} Prize Tickets added!`, 'cyan');
    }
  },

  renderLegend() {
    const grid = document.getElementById('wheel-legend-grid');
    if (!grid) return;

    grid.innerHTML = ArcadeState.wheelSegments
      .slice()
      .sort((a, b) => b.multiplier - a.multiplier)
      .map(
        (seg) => `
        <div class="p-2.5 rounded-xl bg-slate-950/90 border ${
          seg.isTopPrize ? 'border-amber-400/50 glow-amber' : 'border-slate-800'
        } flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full" style="background:${seg.bgStart}"></span>
            <span class="font-mono-num font-bold text-xs text-white">${seg.shortLabel}</span>
          </div>
          <span class="text-[10px] ${
            seg.isTopPrize ? 'text-amber-300 font-bold' : 'text-slate-400'
          }">${seg.isTopPrize ? '★ TOP' : 'Ticket'}</span>
        </div>
      `
      )
      .join('');
  },

  renderHistory() {
    const list = document.getElementById('spin-history-list');
    if (!list) return;

    list.innerHTML = ArcadeState.spinHistory
      .map(
        (item) => `
        <div class="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-950/80 border ${
          item.isTopPrize ? 'border-amber-500/40' : 'border-slate-800/80'
        } text-xs">
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded font-mono-num font-bold text-[11px] ${
              item.isTopPrize
                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                : 'bg-cyan-500/15 text-cyan-300'
            }">${item.multiplier}x</span>
            <span class="font-medium text-slate-200">${item.label}</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="font-mono-num font-bold text-amber-300">+${item.ticketsWon.toLocaleString()} TIX</span>
            <span class="text-[10px] text-slate-500">${item.time}</span>
          </div>
        </div>
      `
      )
      .join('');
  }
};

// ==================== 5. CONFETTI & PARTICLE ENGINE ====================
const ConfettiEngine = {
  canvas: null,
  ctx: null,
  particles: [],
  animating: false,

  init() {
    this.canvas = document.getElementById('confetti-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());
  },

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  },

  burst(count = 130) {
    if (!this.canvas) return;
    const colors = ['#22d3ee', '#fbbf24', '#c084fc', '#f472b6', '#34d399', '#fde047'];
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight * 0.42;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 13;
      this.particles.push({
        x: cx + (Math.random() - 0.5) * 60,
        y: cy + (Math.random() - 0.5) * 40,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4,
        size: 6 + Math.random() * 7,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        gravity: 0.24 + Math.random() * 0.1,
        drag: 0.985,
        alpha: 1,
        decay: 0.008 + Math.random() * 0.008
      });
    }

    if (!this.animating) {
      this.animating = true;
      this.loop();
    }
  },

  loop() {
    if (!this.ctx || !this.canvas) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.vx *= p.drag;
      p.vy *= p.drag;
      p.vy += p.gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;
      p.alpha -= p.decay;

      if (p.alpha <= 0 || p.y > this.canvas.height + 30) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, p.alpha);
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.fillStyle = p.color;
      this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.65);
      this.ctx.restore();
    }

    if (this.particles.length > 0) {
      requestAnimationFrame(() => this.loop());
    } else {
      this.animating = false;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
};

// ==================== 6. CELEBRATORY JACKPOT MODAL ====================
function openJackpotModal(segment, ticketsWon) {
  const modal = document.getElementById('jackpot-modal');
  const tierEl = document.getElementById('modal-prize-tier');
  const titleEl = document.getElementById('modal-prize-title');
  const ticketsEl = document.getElementById('modal-tickets-won');

  if (!modal) return;
  if (tierEl) tierEl.textContent = segment.tierName;
  if (titleEl) titleEl.textContent = `${segment.shortLabel} MULTIPLIER!`;

  modal.classList.remove('hidden');
  modal.classList.add('flex');

  if (ticketsEl) {
    animateBalanceCounter(ticketsEl, 0, ticketsWon, 900);
  }

  // Double wave of celebratory confetti
  ConfettiEngine.burst(150);
  setTimeout(() => ConfettiEngine.burst(100), 450);
}

function closeJackpotModal() {
  const modal = document.getElementById('jackpot-modal');
  if (!modal) return;
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

// ==================== 7. MINI-GAME CATALOG RENDERER & FILTERING ====================
function renderGamesCatalog(category = ArcadeState.activeCategory) {
  const grid = document.getElementById('games-grid');
  if (!grid) return;

  const query = (ArcadeState.searchQuery || '').trim().toLowerCase();
  const filtered = ArcadeState.gamesCatalog.filter((g) => {
    const matchCat = category === 'all' || g.category.includes(category);
    const matchSearch =
      !query ||
      g.title.toLowerCase().includes(query) ||
      g.subtitle.toLowerCase().includes(query) ||
      g.description.toLowerCase().includes(query);
    return matchCat && matchSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full text-center py-12 glass-panel rounded-3xl border border-slate-800">
        <p class="text-sm text-slate-400">Tidak ada game yang cocok dengan pencarian "<span class="text-cyan-300 font-bold">${query}</span>".</p>
      </div>
    `;
    return;
  }

  const badgeStyles = {
    amber: 'bg-amber-500/20 text-amber-300 border-amber-400/50 glow-amber',
    cyan: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 glow-cyan',
    purple: 'bg-purple-500/20 text-purple-300 border-purple-400/50 glow-purple'
  };

  const diffStyles = {
    HARD: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
    EXTREME: 'bg-rose-500/15 text-rose-300 border-rose-500/40',
    INSANE: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-400/50'
  };

  const cardHoverStyles = {
    cyan: 'game-card-cyan',
    amber: 'game-card-amber',
    purple: 'game-card-purple'
  };

  grid.innerHTML = filtered
    .map((game) => {
      const bStyle = badgeStyles[game.badgeColor] || badgeStyles.cyan;
      const dStyle = diffStyles[game.difficulty] || diffStyles.HARD;
      const cHover = cardHoverStyles[game.accentTheme] || 'game-card-cyan';

      return `
      <article class="game-card ${cHover} glass-panel rounded-3xl p-5 flex flex-col justify-between border border-slate-800/90 relative overflow-hidden group">
        
        <!-- Top Row: Icon & High-Energy Badge -->
        <div>
          <div class="flex items-start justify-between gap-2 mb-3.5">
            <div class="w-14 h-14 p-3 rounded-2xl bg-slate-900/95 border border-slate-700/80 text-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              ${game.icon}
            </div>
            <div class="flex flex-col items-end gap-1">
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${bStyle}">
                ${game.badge}
              </span>
              <div class="flex items-center gap-1">
                ${game.supportsTwoPlayer ? '<span class="px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">👥 1P/2P</span>' : ''}
                <span class="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border ${dStyle}">
                  💀 ${game.difficulty || 'HARD'}
                </span>
              </div>
            </div>
          </div>

          <span class="text-[11px] font-mono-num uppercase tracking-wider text-slate-400 block">${game.subtitle}</span>
          <h3 class="font-display font-bold text-lg text-white mt-0.5 group-hover:text-cyan-300 transition-colors">
            ${game.title}
          </h3>
          <p class="text-xs text-slate-400 mt-2 leading-relaxed line-clamp-3">
            ${game.description}
          </p>
        </div>

        <!-- Bottom Info & Play Trigger -->
        <div class="pt-5 mt-5 border-t border-slate-800/80 space-y-3">
          <div class="flex items-center justify-between text-xs">
            <div>
              <span class="text-slate-500 block text-[10px] uppercase">Entry</span>
              <span class="font-mono-num font-bold text-cyan-300">${game.tokenCost} Tokens</span>
            </div>
            <div class="text-right">
              <span class="text-slate-500 block text-[10px] uppercase">Max Reward</span>
              <span class="font-mono-num font-bold text-amber-300">${game.maxTickets}</span>
            </div>
          </div>

          <button
            data-game-id="${game.id}"
            class="btn-launch-game w-full py-2.5 px-4 rounded-xl font-display font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              game.isPlayableOnPage
                ? 'bg-gradient-to-r from-cyan-400 to-purple-500 text-slate-950 shadow-md shadow-cyan-500/20 hover:opacity-95'
                : 'bg-slate-900/90 hover:bg-slate-800 text-cyan-200 border border-cyan-500/40 hover:border-cyan-400'
            }">
            <span>${game.isPlayableOnPage ? '🎡 Spin On Page' : '🕹️ Play Game'}</span>
          </button>
        </div>
      </article>
    `;
    })
    .join('');

  // Attach click listeners to game cards
  grid.querySelectorAll('.btn-launch-game').forEach((btn) => {
    btn.addEventListener('click', () => {
      ArcadeAudio.playClick();
      const gameId = btn.getAttribute('data-game-id');
      const game = ArcadeState.gamesCatalog.find((g) => g.id === gameId);
      if (!game) return;

      if (game.isPlayableOnPage) {
        document.getElementById('lucky-wheel-section')?.scrollIntoView({ behavior: 'smooth' });
      } else if (typeof MiniGamesArcade !== 'undefined') {
        MiniGamesArcade.open(game);
      }
    });
  });
}

// ==================== 8. (CABINET HANDLED BY games.js) ====================

// ==================== 9. NOTIFICATIONS & TOAST ENGINE ====================
function renderNotifications() {
  const list = document.getElementById('notif-list');
  const badge = document.getElementById('notif-badge');
  if (!list || !badge) return;

  const unreadCount = ArcadeState.notifications.filter((n) => n.unread).length;
  if (unreadCount > 0) {
    badge.textContent = unreadCount;
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }

  list.innerHTML = ArcadeState.notifications
    .map(
      (n) => `
      <div class="p-3 rounded-xl bg-slate-900/90 border ${
        n.unread ? 'border-purple-500/40' : 'border-slate-800/70 opacity-75'
      } text-xs space-y-1">
        <div class="flex items-center justify-between">
          <span class="font-bold text-white">${n.title}</span>
          <span class="text-[10px] text-slate-400 font-mono-num">${n.time}</span>
        </div>
        <p class="text-slate-300 text-[11px] leading-relaxed">${n.desc}</p>
      </div>
    `
    )
    .join('');
}

function addNotification(title, desc, accent = 'cyan') {
  ArcadeState.notifications.unshift({
    id: Date.now(),
    title,
    desc,
    time: 'Just now',
    unread: true,
    accent
  });
  renderNotifications();
}

function showToast(message, theme = 'cyan') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const borderMap = {
    cyan: 'border-cyan-400/60 glow-cyan text-cyan-200',
    amber: 'border-amber-400/60 glow-amber text-amber-200',
    purple: 'border-purple-400/60 glow-purple text-purple-200'
  };

  const toast = document.createElement('div');
  toast.className = `glass-panel-strong px-4 py-3 rounded-2xl border ${
    borderMap[theme] || borderMap.cyan
  } text-xs font-semibold shadow-2xl transition-all duration-300 translate-y-2 opacity-0 pointer-events-auto`;
  toast.textContent = message;

  container.appendChild(toast);
  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  });

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// ==================== 10. INITIALIZATION & EVENT LISTENERS ====================
document.addEventListener('DOMContentLoaded', () => {
  const tokenEl = document.getElementById('nav-token-balance');
  const ticketEl = document.getElementById('nav-ticket-balance');
  if (tokenEl) tokenEl.textContent = ArcadeState.tokens.toLocaleString();
  if (ticketEl) ticketEl.textContent = ArcadeState.tickets.toLocaleString();

  ConfettiEngine.init();
  WheelController.init();
  if (typeof MiniGamesArcade !== 'undefined') MiniGamesArcade.init();
  renderGamesCatalog('all');
  renderNotifications();

  // 1. Wager Tier Selector
  const wagerBtns = document.querySelectorAll('.wager-btn');
  wagerBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (ArcadeState.isSpinning) return;
      ArcadeAudio.playClick();
      const selectedWager = parseInt(btn.getAttribute('data-wager'), 10);
      ArcadeState.currentWager = selectedWager;

      wagerBtns.forEach((b) => {
        b.className =
          'wager-btn py-2.5 px-3 rounded-xl font-mono-num font-bold text-xs border transition-all bg-slate-950/80 border-slate-800 text-slate-300 hover:border-cyan-500/40';
      });
      btn.className =
        'wager-btn py-2.5 px-3 rounded-xl font-mono-num font-bold text-xs border transition-all bg-cyan-500/20 border-cyan-400 text-cyan-200 glow-cyan';

      const spinLabel = document.getElementById('btn-spin-label');
      const centerCost = document.getElementById('center-token-cost');
      if (spinLabel) spinLabel.textContent = `LAUNCH SPIN (${selectedWager} TOKENS)`;
      if (centerCost) centerCost.textContent = `${selectedWager} TKN`;
    });
  });

  // 2. Spin Triggers (Main CTA, Center Wheel Cap, Hero Quick Spin)
  document.getElementById('btn-spin-main')?.addEventListener('click', () => WheelController.spin());
  document.getElementById('btn-wheel-center')?.addEventListener('click', () => WheelController.spin());

  document.getElementById('btn-hero-quick-spin')?.addEventListener('click', (e) => {
    e.stopPropagation();
    document.getElementById('lucky-wheel-section')?.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => WheelController.spin(), 450);
  });

  document.getElementById('hero-featured-card')?.addEventListener('click', () => {
    document.getElementById('lucky-wheel-section')?.scrollIntoView({ behavior: 'smooth' });
  });

  // 3. Hero Card Subtle 3D Tilt Micro-Interaction
  const heroCard = document.getElementById('hero-featured-card');
  if (heroCard) {
    heroCard.addEventListener('mousemove', (e) => {
      const rect = heroCard.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      heroCard.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-4px)`;
    });
    heroCard.addEventListener('mouseleave', () => {
      heroCard.style.transform = '';
    });
  }

  // 4. Lucky Charm (Guaranteed Jackpot Spin Toggle)
  const btnDemoJackpot = document.getElementById('btn-demo-jackpot');
  btnDemoJackpot?.addEventListener('click', () => {
    ArcadeAudio.playClick();
    ArcadeState.forceNextJackpot = !ArcadeState.forceNextJackpot;
    if (ArcadeState.forceNextJackpot) {
      btnDemoJackpot.classList.add('glow-amber', 'border-amber-400', 'text-amber-300');
      showToast('✨ Lucky Charm Armed! Your next wheel spin is guaranteed to hit 50x MEGA JACKPOT!', 'amber');
    } else {
      btnDemoJackpot.classList.remove('glow-amber', 'border-amber-400', 'text-amber-300');
      showToast('Lucky Charm disabled. Standard carnival odds active.', 'cyan');
    }
  });

  // 5. Free Token Refill Button
  document.getElementById('btn-refill-tokens')?.addEventListener('click', () => {
    ArcadeAudio.playCoinInsert();
    updateBalances(250, 0);
    showToast('🪙 +250 Free Virtual Arcade Tokens added to your balance!', 'cyan');
  });

  // 6. Sound Toggle Button
  const soundBtn = document.getElementById('btn-sound-toggle');
  const iconOn = document.getElementById('icon-sound-on');
  const iconOff = document.getElementById('icon-sound-off');

  soundBtn?.addEventListener('click', () => {
    ArcadeState.soundEnabled = !ArcadeState.soundEnabled;
    if (ArcadeState.soundEnabled) {
      iconOn?.classList.remove('hidden');
      iconOff?.classList.add('hidden');
      soundBtn.title = 'Arcade Synth Sound: ON';
      ArcadeAudio.playClick();
      showToast('🔊 Arcade Synth Audio Enabled', 'cyan');
    } else {
      iconOn?.classList.add('hidden');
      iconOff?.classList.remove('hidden');
      soundBtn.title = 'Arcade Synth Sound: MUTED';
      showToast('🔇 Arcade Synth Audio Muted', 'purple');
    }
  });

  // 7. Notifications Dropdown Toggle
  const notifBtn = document.getElementById('btn-notifications');
  const notifDropdown = document.getElementById('notif-dropdown');

  notifBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    ArcadeAudio.playClick();
    notifDropdown?.classList.toggle('hidden');
  });

  document.getElementById('btn-clear-notifs')?.addEventListener('click', () => {
    ArcadeState.notifications.forEach((n) => (n.unread = false));
    renderNotifications();
  });

  document.addEventListener('click', (e) => {
    if (notifDropdown && !notifDropdown.contains(e.target) && e.target !== notifBtn) {
      notifDropdown.classList.add('hidden');
    }
  });

  // 8. Category Filter Buttons
  const catBtns = document.querySelectorAll('.cat-btn');
  catBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      ArcadeAudio.playClick();
      const cat = btn.getAttribute('data-cat');
      ArcadeState.activeCategory = cat;

      catBtns.forEach((b) => {
        b.className =
          'cat-btn px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white transition-all';
      });
      btn.className =
        'cat-btn px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 transition-all';

      renderGamesCatalog(cat);
    });
  });

  document.getElementById('game-search-input')?.addEventListener('input', (e) => {
    ArcadeState.searchQuery = e.target.value;
    renderGamesCatalog(ArcadeState.activeCategory);
  });

  // 9. Jackpot Modal Close Actions
  const jackpotModal = document.getElementById('jackpot-modal');
  document.getElementById('btn-close-jackpot')?.addEventListener('click', closeJackpotModal);
  document.getElementById('btn-claim-jackpot')?.addEventListener('click', () => {
    ArcadeAudio.playClick();
    closeJackpotModal();
  });
  jackpotModal?.addEventListener('click', (e) => {
    if (e.target === jackpotModal) closeJackpotModal();
  });

  // 10. Close open modals & notification dropdown on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeJackpotModal();
      if (typeof MiniGamesArcade !== 'undefined') MiniGamesArcade.close();
      notifDropdown?.classList.add('hidden');
    }
  });

  // 11. Live Community Jackpot Ticker
  setInterval(() => {
    const tickerEl = document.getElementById('hero-jackpot-ticker');
    if (tickerEl) {
      ArcadeState.communityJackpot += Math.floor(Math.random() * 18) + 3;
      tickerEl.textContent = ArcadeState.communityJackpot.toLocaleString();
    }
  }, 2600);
});

