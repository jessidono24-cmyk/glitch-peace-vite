'use strict';
// ═══════════════════════════════════════════════════════════════════════
//  GLITCH·PEACE — vocabulary-engine.js — Phase 6: Learning Systems
//  Teaches vocabulary through tile interactions and dreamscape context.
//  Each tile type + dreamscape emotion unlocks contextual words.
//  Words are stored in localStorage and progress is tracked.
// ═══════════════════════════════════════════════════════════════════════

// ─── Vocabulary banks by tile type ────────────────────────────────────
const TILE_VOCAB = {
  // T values (numeric tile IDs match constants.js)
  1: [ // DESPAIR
    { word: 'despair',      def: 'complete loss of hope', pos: 'noun' },
    { word: 'melancholy',   def: 'a deep, persistent sadness', pos: 'noun' },
    { word: 'languish',     def: 'to lose vitality and grow weak', pos: 'verb' },
    { word: 'desolate',     def: 'feeling utterly alone', pos: 'adj' },
    { word: 'abyss',        def: 'a deep, immeasurable void', pos: 'noun' },
  ],
  2: [ // TERROR
    { word: 'apprehension', def: 'anxiety about the future', pos: 'noun' },
    { word: 'trepidation',  def: 'trembling fear', pos: 'noun' },
    { word: 'visceral',     def: 'deeply felt, instinctive', pos: 'adj' },
    { word: 'confront',     def: 'to face directly and boldly', pos: 'verb' },
    { word: 'fortitude',    def: 'courage in the face of pain', pos: 'noun' },
  ],
  3: [ // SELF_HARM
    { word: 'compassion',   def: 'tender concern for suffering', pos: 'noun' },
    { word: 'tenderness',   def: 'gentle kindness and care', pos: 'noun' },
    { word: 'resilience',   def: 'ability to recover from adversity', pos: 'noun' },
    { word: 'impermanence', def: 'the quality of not lasting forever', pos: 'noun' },
    { word: 'nourish',      def: 'to support and strengthen', pos: 'verb' },
  ],
  4: [ // PEACE
    { word: 'serenity',     def: 'the state of being calm and peaceful', pos: 'noun' },
    { word: 'equanimity',   def: 'mental calmness under pressure', pos: 'noun' },
    { word: 'tranquil',     def: 'free from agitation', pos: 'adj' },
    { word: 'stillness',    def: 'absence of movement or sound', pos: 'noun' },
    { word: 'sanctuary',    def: 'a place of safety and refuge', pos: 'noun' },
    { word: 'luminous',     def: 'radiating light; glowing', pos: 'adj' },
  ],
  6: [ // INSIGHT
    { word: 'perspicacity', def: 'sharp readiness of insight', pos: 'noun' },
    { word: 'discern',      def: 'to perceive or understand clearly', pos: 'verb' },
    { word: 'epiphany',     def: 'a sudden revelation', pos: 'noun' },
    { word: 'lucid',        def: 'clearly expressed; easy to understand', pos: 'adj' },
    { word: 'cognizance',   def: 'knowledge; awareness', pos: 'noun' },
  ],
  8: [ // RAGE
    { word: 'catharsis',    def: 'purging of emotion through experience', pos: 'noun' },
    { word: 'transmute',    def: 'to change into something different', pos: 'verb' },
    { word: 'intensity',    def: 'extreme force or energy', pos: 'noun' },
    { word: 'volatile',     def: 'liable to change rapidly', pos: 'adj' },
    { word: 'fervor',       def: 'intense and passionate feeling', pos: 'noun' },
  ],
  9: [ // HOPELESS
    { word: 'nihilism',     def: 'the rejection of all values', pos: 'noun' },
    { word: 'inertia',      def: 'tendency to do nothing or resist change', pos: 'noun' },
    { word: 'persist',      def: 'to continue firmly despite difficulty', pos: 'verb' },
    { word: 'tenacity',     def: 'persistence in the face of difficulty', pos: 'noun' },
    { word: 'emerge',       def: 'to come out from a hidden state', pos: 'verb' },
  ],
  10: [ // GLITCH
    { word: 'anomaly',      def: 'something that deviates from normal', pos: 'noun' },
    { word: 'entropy',      def: 'tendency toward disorder', pos: 'noun' },
    { word: 'liminal',      def: 'relating to a transitional state', pos: 'adj' },
    { word: 'paradox',      def: 'a seemingly contradictory truth', pos: 'noun' },
    { word: 'permutation',  def: 'each of several ways to arrange things', pos: 'noun' },
  ],
  12: [ // TELEPORT
    { word: 'quantum',      def: 'the smallest discrete quantity of energy', pos: 'adj/noun' },
    { word: 'traverse',     def: 'to travel across or through', pos: 'verb' },
    { word: 'nonlinear',    def: 'not arranged in a straight line; complex', pos: 'adj' },
    { word: 'threshold',    def: 'the point of entering a new state', pos: 'noun' },
    { word: 'flux',         def: 'continuous change', pos: 'noun' },
  ],
  15: [ // MEMORY
    { word: 'reminisce',    def: 'to recall pleasant past experiences', pos: 'verb' },
    { word: 'ephemeral',    def: 'lasting for a very short time', pos: 'adj' },
    { word: 'nostalgia',    def: 'sentimental longing for the past', pos: 'noun' },
    { word: 'vestige',      def: 'a trace or remnant of the past', pos: 'noun' },
    { word: 'indelible',    def: 'making marks that cannot be removed', pos: 'adj' },
  ],
};

// ─── Dreamscape-context words ─────────────────────────────────────────
const DREAMSCAPE_VOCAB = {
  'numbness':     [
    { word: 'dissociation', def: 'feeling detached from your thoughts', pos: 'noun' },
    { word: 'dormant',      def: 'alive but not active', pos: 'adj' },
  ],
  'fear':         [
    { word: 'primal',       def: 'relating to the most basic instincts', pos: 'adj' },
    { word: 'sovereignty',  def: 'supreme power or authority over self', pos: 'noun' },
  ],
  'frustration':  [
    { word: 'perseverance', def: 'continuing despite difficulty', pos: 'noun' },
    { word: 'samsara',      def: 'the cycle of death and rebirth', pos: 'noun' },
  ],
  'vulnerability':[
    { word: 'authenticity', def: 'being true to one\'s own personality', pos: 'noun' },
    { word: 'buoyancy',     def: 'ability to stay afloat; cheerfulness', pos: 'noun' },
  ],
  'exhaustion':   [
    { word: 'zenith',       def: 'the time at which something is most powerful', pos: 'noun' },
    { word: 'transcend',    def: 'to go beyond ordinary limits', pos: 'verb' },
  ],
  'panic':        [
    { word: 'grounding',    def: 'connection to the present moment', pos: 'noun' },
    { word: 'equilibrium',  def: 'a state of balance', pos: 'noun' },
  ],
  'chaos':        [
    { word: 'centripetal',  def: 'moving toward a center', pos: 'adj' },
    { word: 'steadfast',    def: 'resolutely firm and unwavering', pos: 'adj' },
  ],
  'anxiety':      [
    { word: 'labyrinthine', def: 'like a labyrinth; complex', pos: 'adj' },
    { word: 'waypoint',     def: 'a stopping place on a journey', pos: 'noun' },
  ],
  'hope':         [
    { word: 'luminescence', def: 'soft light not caused by heat', pos: 'noun' },
    { word: 'liberation',   def: 'the act of freeing from restriction', pos: 'noun' },
  ],
  'integration':  [
    { word: 'synthesis',    def: 'combining elements into a whole', pos: 'noun' },
    { word: 'holistic',     def: 'treating the whole, not just parts', pos: 'adj' },
    { word: 'sovereignty',  def: 'supreme authority over oneself', pos: 'noun' },
  ],
};

const STORAGE_KEY = 'gp_vocab_learned';

export class VocabularyEngine {
  constructor() {
    this._learned = this._load();
    this._recentWord = null;       // { word, def, pos } — shown in HUD
    this._recentTimer = 0;         // countdown frames
    this._sessionWords = [];       // words learned this session
    this._totalLearned = this._learned.size;
  }

  // ─── Called when player steps on a tile ──────────────────────────
  onTileStep(tileId, dreamscapeEmotion) {
    const tileWords  = TILE_VOCAB[tileId]         || [];
    const dsWords    = DREAMSCAPE_VOCAB[dreamscapeEmotion] || [];
    const pool       = [...tileWords, ...dsWords];
    if (pool.length === 0) return null;

    // Prefer unseen words
    const unseen = pool.filter(w => !this._learned.has(w.word));
    const entry  = unseen.length > 0
      ? unseen[Math.floor(Math.random() * unseen.length)]
      : pool[Math.floor(Math.random() * pool.length)];

    // Record
    if (!this._learned.has(entry.word)) {
      this._learned.add(entry.word);
      this._sessionWords.push(entry);
      this._totalLearned = this._learned.size;
      this._save();
    }

    this._recentWord  = { ...entry, tileType: tileId }; // tileType enables language-system lookup
    this._recentTimer = 150; // ~5s at 30fps
    return this._recentWord;
  }

  // ─── Update — call each frame ─────────────────────────────────────
  tick() {
    if (this._recentTimer > 0) this._recentTimer--;
    else this._recentWord = null;
  }

  // ─── Accessors ────────────────────────────────────────────────────
  get activeWord()    { return this._recentTimer > 0 ? this._recentWord : null; }
  get wordProgress()  { return this._recentTimer / 150; }   // 1→0
  get recentTimer()   { return this._recentTimer; }         // 150→0, for renderer alpha
  get sessionCount()  { return this._sessionWords.length; }
  get totalCount()    { return this._totalLearned; }
  get sessionWords()  { return [...this._sessionWords]; }

  // ─── Random word for interlude screen ────────────────────────────
  getInterludeWord(emotion) {
    const pool = DREAMSCAPE_VOCAB[emotion] || TILE_VOCAB[4] || [];
    if (pool.length === 0) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  // ─── Persistence ─────────────────────────────────────────────────
  _save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...this._learned]));
    } catch (_) {}
  }

  _load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch (_) {
      return new Set();
    }
  }

  resetSession() { this._sessionWords = []; }
}

export const vocabularyEngine = new VocabularyEngine();
