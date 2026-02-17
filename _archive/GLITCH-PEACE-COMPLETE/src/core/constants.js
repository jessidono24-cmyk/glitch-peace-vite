// ═══════════════════════════════════════════════════════════════════════
//  COMPLETE CONSTANTS - All tiles, colors, configs from entire thread
// ═══════════════════════════════════════════════════════════════════════

// Tile Types (17 total - comprehensive)
export const T = {
  VOID:0, DESPAIR:1, TERROR:2, HARM:3, PEACE:4, WALL:5, INSIGHT:6, HIDDEN:7,
  RAGE:8, HOPELESS:9, GLITCH:10, ARCH:11, TELE:12, COVER:13, TRAP:14, MEM:15, PAIN:16
};

// Comprehensive tile definitions
export const TILE_DEF = {
  [T.VOID]:     {d:0,  s:0, p:0, bg:'#06060f', bd:'rgba(255,255,255,0.04)', g:null,      sy:''},
  [T.DESPAIR]:  {d:8,  s:1, p:0, bg:'#0d0d55', bd:'#1a1aff', g:'#2233ff', sy:'↓'},
  [T.TERROR]:   {d:20, s:0, p:0, bg:'#500000', bd:'#cc1111', g:'#ff2222', sy:'!'},
  [T.HARM]:     {d:14, s:0, p:0, bg:'#360000', bd:'#880000', g:'#aa0000', sy:'✕'},
  [T.PEACE]:    {d:0,  s:0, p:0, bg:'#002810', bd:'#00ff88', g:'#00ffcc', sy:'◈', heal:20, score:150},
  [T.WALL]:     {d:0,  s:0, p:0, bg:'#0e0e18', bd:'#252535', g:null,      sy:''},
  [T.INSIGHT]:  {d:0,  s:0, p:0, bg:'#001a18', bd:'#00ddbb', g:'#00ffee', sy:'◆', token:1, score:300},
  [T.HIDDEN]:   {d:0,  s:0, p:0, bg:'#04040a', bd:'rgba(0,200,100,0.08)', g:null, sy:''},
  [T.RAGE]:     {d:18, s:0, p:2, bg:'#3a0010', bd:'#cc0044', g:'#ff0066', sy:'▲'},
  [T.HOPELESS]: {d:12, s:1, p:0, bg:'#002040', bd:'#0044cc', g:'#0066ff', sy:'~'},
  [T.GLITCH]:   {d:5,  s:0, p:0, bg:'#1a0a1a', bd:'#aa00ff', g:'#dd00ff', sy:'?'},
  [T.ARCH]:     {d:0,  s:0, p:0, bg:'#0a1a0a', bd:'#ffdd00', g:'#ffee44', sy:'☆'},
  [T.TELE]:     {d:0,  s:0, p:0, bg:'#001820', bd:'#00aaff', g:'#00ccff', sy:'⇒'},
  [T.COVER]:    {d:0,  s:0, p:0, bg:'#101018', bd:'#446688', g:null,      sy:'▪'},
  [T.TRAP]:     {d:16, s:0, p:1, bg:'#1a0800', bd:'#cc6600', g:'#ff8800', sy:'×'},
  [T.MEM]:      {d:0,  s:0, p:0, bg:'#06060a', bd:'rgba(100,200,150,0.2)', g:null, sy:'·'},
  [T.PAIN]:     {d:6,  s:0, p:0, bg:'#200808', bd:'#661111', g:'#880000', sy:'·'},
};

// FIXED Player Identity (never changes)
export const PLAYER = { CORE:'#ffffff', OUTLINE:'#00e5ff', GLOW:'#00ccff' };

// Grid & Display
export const CELL=42, GAP=2;
export const GRID_SIZES={small:10,medium:13,large:17};

// Difficulty Configs
export const DIFF_CFG={
  easy:{eSpeedBase:1000,eSpeedMin:400,dmgMul:0.5,hazMul:0.6},
  normal:{eSpeedBase:750,eSpeedMin:220,dmgMul:1.0,hazMul:1.0},
  hard:{eSpeedBase:550,eSpeedMin:160,dmgMul:1.5,hazMul:1.4}
};

// Session Modes (3 total from thread)
export const SESSION_MODES={
  UNLIMITED:{name:'Unlimited Exploration',timeWarnings:false,fatigue:false,sessionLimit:null},
  TIMED:{name:'Timed Practice (30min)',timeWarnings:true,fatigue:true,sessionLimit:30,bonusOnCompletion:true},
  PATTERN_TRAINING:{name:'Pattern Recognition (45min)',timeWarnings:true,fatigue:true,sessionLimit:45,
    hazardPull:true,impulseBuffer:true,consequencePreview:true,patternEcho:true,routeAlternatives:true}
};

// Vision Words (floating messages)
export const VISION_WORDS=[
  'memory…','choice…','echo…','void…','self…','signal…','fragment…','persist…','clarity…','dissolve…',
  'boundary…','witness…','anchor…','pattern…','emergence…','dragon…','guide…','orb…','fear…','hope…',
  'breath…','pause…','notice…','release…','return…','becoming…','cessation…','resonance…'
];

// Emotional Synergy Messages
export const SYNERGY_MSG={
  focused_force:'Anger + Coherence → Focused Force',
  chaos_burst:'Anger + Chaos → Destructive Burst',
  deep_insight:'Grief + Curiosity → Deep Understanding',
  collapse_event:'Shame + Awe → Identity Collapse',
  protective:'Tenderness + Fear → Protective Instinct',
  resonance:'Joy + Hope → Resonance Wave',
  dissolution:'Despair Overwhelms'
};

// Exit Affirmations (Cessation Machine)
export const EXIT_MESSAGES=[
  'Thank you for playing.\nYou made the choice to stop—that takes strength.',
  'Your progress is saved.\nTake care of yourself.',
  'Returning to reality.\nYou are more than this simulation.',
  'Session complete.\nYour wellbeing matters most.',
  'You played well.\nNow rest well.',
  'The pattern is visible.\nYou have the tools.',
  'Consciousness persists.\nBe gentle with yourself.'
];

// Play Modes (31+ from thread - condensed)
export const PLAY_MODES={
  classic:{name:'Classic',peace:1.0,haz:1.0,ins:1.0,score:1.2,eSpd:1.0,vision:999,moves:999},
  zen:{name:'Zen Garden',peace:1.5,haz:0.0,ins:2.0,score:0.5,eSpd:0.0,vision:999,moves:999,autoHeal:1},
  speedrun:{name:'Speedrun',peace:0.8,haz:1.2,ins:0.5,score:2.0,eSpd:1.3,vision:999,moves:999,timer:180},
  puzzle:{name:'Puzzle',peace:1.0,haz:0.8,ins:1.5,score:1.5,eSpd:0.0,vision:999,moves:50,undo:true},
  horror:{name:'Horror',peace:0.5,haz:1.5,ins:0.8,score:3.0,eSpd:0.8,vision:4,moves:999,permadeath:true},
  roguelike:{name:'Roguelike',peace:0.7,haz:1.3,ins:1.2,score:1.0,eSpd:1.1,vision:999,moves:999,random:true},
  recovery:{name:'Recovery',peace:1.3,haz:0.7,ins:1.5,score:0.8,eSpd:0.7,vision:999,moves:999,tools:true},
  bossrush:{name:'Boss Rush',peace:2.0,haz:0.5,ins:3.0,score:5.0,eSpd:1.5,vision:999,moves:999,bossOnly:true},
  pacifist:{name:'Pacifist',peace:1.5,haz:0.3,ins:2.0,score:2.0,eSpd:1.2,vision:999,moves:999,noCombat:true},
  reverse:{name:'Reverse',peace:1.0,haz:1.0,ins:1.0,score:1.5,eSpd:1.0,vision:999,moves:999,reversed:true},
  ritual:{name:'Ritual',peace:1.0,haz:1.0,ins:1.5,score:1.0,eSpd:0.5,vision:999,moves:999,slowmo:0.7},
  explorer:{name:'Explorer',peace:0.9,haz:0.9,ins:1.6,score:1.0,eSpd:0.9,vision:999,moves:999},
  daily:{name:'Daily',peace:1.0,haz:1.0,ins:1.0,score:1.0,eSpd:1.0,vision:999,moves:999,seed:'daily'},
  // 3D-style modes
  moral:{name:'Moral Choice',type:'fable',alignment:true,consequences:true},
  dialogue:{name:'Dialogue',type:'masseffect',companions:true,romance:true},
  openworld:{name:'Open World',type:'elderscrolls',infinite:true,quests:true},
  shooter:{name:'Twin-Stick',type:'shooter',weapons:4,waves:true},
  rts:{name:'RTS',type:'strategy',units:4,base:true},
  tactical:{name:'Tactical',type:'xcom',squad:4,cover:true,permadeath:true}
};

// Cosmology Realms (12 from thread)
export const COSMOLOGIES=[
  'hindu_chakra','buddhist_wheel','tantric_union','taoist_wuwei',
  'norse_yggdrasil','celtic_otherworld','zoroastrian_duality',
  'hermetic_principles','confucian_harmony','french_myth','egyptian_duat','mayan_calendar'
];

// Fibonacci sequence for peace scaling
export const fib=n=>{const s=[1,1];for(let i=2;i<n;i++)s.push(s[i-1]+s[i-2]);return s;};
