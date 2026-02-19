// ═══════════════════════════════════════════════════════════════════════
//  GLITCH·PEACE — emotion-recognition.js — Phase 9: Intelligence Enhancement
//  Develops EQ through emotion labeling and regulation-quality tracking.
//  Observes whether matrix choices align with the emotional field state.
//
//  Research basis:
//    Affect labeling reduces amygdala activation and emotional intensity
//    (Lieberman et al., 2007 — "Putting Feelings into Words")
//    Emotional granularity predicts wellbeing and resilience
//    (Barrett, 2017 — "How Emotions Are Made")
//    Self-compassion outperforms self-criticism for motivation
//    (Neff, 2003 — "Self-Compassion Scale")
// ═══════════════════════════════════════════════════════════════════════

// ─── Emotion label definitions ────────────────────────────────────────
const EMOTION_LABELS = {
  joy:          { label: 'Joy',           color: '#ffdd00', tip: 'Joy expands when expressed or shared.' },
  peace:        { label: 'Peace',         color: '#00ff88', tip: 'Peace emerges when internal resistance dissolves.' },
  trust:        { label: 'Trust',         color: '#00ccff', tip: 'Trust is built through consistent safety over time.' },
  anticipation: { label: 'Anticipation',  color: '#ff8800', tip: 'Anticipation is hope with a direction.' },
  surprise:     { label: 'Surprise',      color: '#ffaa00', tip: 'Surprise updates our mental model of reality.' },
  fear:         { label: 'Fear',          color: '#ff0044', tip: 'Fear signals threat — real or imagined.' },
  anxiety:      { label: 'Anxiety',       color: '#ff4488', tip: `Anxiety is fear of what hasn't happened yet.` },
  anger:        { label: 'Anger',         color: '#ff2200', tip: 'Anger often protects something that matters deeply.' },
  sadness:      { label: 'Sadness',       color: '#4488ff', tip: 'Sadness is a natural response to loss and change.' },
  disgust:      { label: 'Disgust',       color: '#88aa00', tip: 'Disgust protects boundaries against what harms.' },
  shame:        { label: 'Shame',         color: '#883300', tip: `Shame says "I am the problem." It can be unlearned.` },
  hope:         { label: 'Hope',          color: '#88ff88', tip: 'Hope is anticipation of something better.' },
  curiosity:    { label: 'Curiosity',     color: '#00aaff', tip: 'Curiosity keeps the nervous system open to learning.' },
  grief:        { label: 'Grief',         color: '#3366aa', tip: 'Grief is the price of love. It signals meaning.' },
  loneliness:   { label: 'Loneliness',    color: '#6644aa', tip: 'Loneliness signals connection is needed.' },
  awe:          { label: 'Awe',           color: '#aaddff', tip: 'Awe expands our sense of self and time.' },
  tender:       { label: 'Tenderness',    color: '#ffaacc', tip: 'Tenderness is strength held gently.' },
};

// ─── EQ insights (shown during pause / dashboard) ─────────────────────
const EQ_INSIGHTS = [
  'Naming an emotion reduces its intensity by ~50%.',
  'The pause between stimulus and response is where freedom lives.',
  'Emotions are information, not commands.',
  'Self-compassion outperforms self-criticism for long-term motivation.',
  'Emotional granularity — knowing precisely what you feel — predicts wellbeing.',
  'Your nervous system learned its patterns in the past. Patterns can change.',
  'Regulation begins with noticing — not control.',
  'The body holds emotional memory. Movement can shift states.',
  'Fear and excitement are physiologically identical. The label matters.',
  'Sadness and grief are not weaknesses — they are the signal of caring.',
];

// Emotions where Matrix B (coherence) is the regulating choice
const BENEFITS_FROM_COHERENCE = new Set(['fear', 'anxiety', 'sadness', 'shame', 'disgust', 'anger', 'grief', 'loneliness']);

const STORAGE_KEY     = 'gp_eq';
const LABEL_THRESHOLD = 0.2;  // emotion must exceed this to be labelled
const FLASH_DURATION  = 90;   // frames to display label flash

export class EmotionRecognition {
  constructor() {
    this._data           = this._load();
    this._labelledCount  = 0;  // times an emotion was dominant enough to label
    this._regulatedCount = 0;  // times matrix aligned well with dominant emotion
    this._insightIdx     = 0;
    this._flashLabel     = null; // { id, label, color, tip, timer }
    this._lastLabelledId = null; // prevent re-triggering same emotion each frame
  }

  // ─── Called each frame with the dominant emotional field reading ──
  observe(emotionId, emotionValue, matrixActive) {
    if (!emotionId || emotionValue < LABEL_THRESHOLD) { this._lastLabelledId = null; return; }
    const def = EMOTION_LABELS[emotionId];
    if (!def) return;

    // Only trigger once per dominant-emotion cycle
    if (emotionId !== this._lastLabelledId) {
      this._lastLabelledId = emotionId;
      this._labelledCount++;
      this._flashLabel = { id: emotionId, ...def, timer: FLASH_DURATION };
      // EQ: did the player choose the regulating matrix?
      if (BENEFITS_FROM_COHERENCE.has(emotionId) && matrixActive === 'B') {
        this._regulatedCount++;
      }
    } else if (this._flashLabel && this._flashLabel.id === emotionId) {
      // Keep timer alive while same emotion persists
      this._flashLabel.timer = Math.max(this._flashLabel.timer, 30);
    }
  }

  // ─── Tick (call each frame) ───────────────────────────────────────
  tick() {
    if (this._flashLabel) {
      this._flashLabel.timer--;
      if (this._flashLabel.timer <= 0) { this._flashLabel = null; this._lastLabelledId = null; }
    }
  }

  // ─── EQ score (0-100) ─────────────────────────────────────────────
  get eqScore() {
    if (this._labelledCount === 0) return 50;
    const regulationRatio = this._regulatedCount / this._labelledCount;
    const awarenessBonus  = Math.min(30, this._labelledCount * 2);
    return Math.round(Math.min(100, 20 + regulationRatio * 50 + awarenessBonus));
  }

  // ─── Accessors ────────────────────────────────────────────────────
  get flashLabel()    { return this._flashLabel && this._flashLabel.timer > 0 ? this._flashLabel : null; }
  get flashAlpha()    { return this._flashLabel ? Math.min(1, this._flashLabel.timer / 20) : 0; }
  get labelledCount() { return this._labelledCount; }
  get regulatedCount(){ return this._regulatedCount; }

  get currentInsight() { return EQ_INSIGHTS[this._insightIdx % EQ_INSIGHTS.length]; }
  nextInsight()        { this._insightIdx++; }

  resetSession() {
    this._labelledCount = 0; this._regulatedCount = 0;
    this._flashLabel = null; this._lastLabelledId = null;
    this._insightIdx = 0;
  }

  _save() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this._data)); } catch (_) {} }
  _load() {
    try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : {}; }
    catch (_) { return {}; }
  }
}

export const emotionRecognition = new EmotionRecognition();
