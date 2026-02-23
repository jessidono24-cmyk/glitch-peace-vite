// ═══════════════════════════════════════════════════════════════════════
//  LEARNING HUB MODE — Multi-discipline educational mode
//  Players select from a grid of disciplines and sub-disciplines.
//  Each discipline presents contextual learning puzzles embedded in
//  the dreamscape — vocabulary in wandering NPCs, equations as terrain.
// ═══════════════════════════════════════════════════════════════════════

import GameMode from '../../core/interfaces/GameMode.js';

export const LEARNING_HUB_DISCIPLINES = [
  {
    id: 'language',
    name: 'LANGUAGE',
    icon: '🗣',
    sub: ['French', 'Spanish', 'Japanese', 'Arabic', 'Sanskrit', 'Ancient Greek'],
    mechanic: 'Spaced repetition + contextual immersion — words appear in dreamscape',
    color: '#44aaff',
  },
  {
    id: 'mathematics',
    name: 'MATHEMATICS',
    icon: '∑',
    sub: ['Arithmetic', 'Algebra', 'Geometry', 'Calculus', 'Statistics', 'Number Theory'],
    mechanic: 'Puzzle solving — equations become terrain obstacles',
    color: '#ffdd44',
  },
  {
    id: 'biology',
    name: 'BIOLOGY',
    icon: '🧬',
    sub: ['Cell Biology', 'Genetics', 'Ecology', 'Evolution', 'Mycology', 'Ornithology'],
    mechanic: 'Classification and systems identification',
    color: '#44ff88',
  },
  {
    id: 'physics',
    name: 'PHYSICS',
    icon: 'ⓟ',
    sub: ['Classical', 'Thermodynamics', 'Quantum', 'Electromagnetism', 'Relativity'],
    mechanic: 'Physical simulation — laws of nature as game rules',
    color: '#ff8844',
  },
  {
    id: 'engineering',
    name: 'ENGINEERING',
    icon: '⚙',
    sub: ['Mechanical', 'Electrical', 'Cognitive', 'Quantum', 'Petroleum', 'Structural'],
    mechanic: 'System design and optimization puzzles',
    color: '#aa88ff',
  },
  {
    id: 'psychology',
    name: 'PSYCHOLOGY',
    icon: '🧠',
    sub: ['Cognitive', 'Behavioral', 'Developmental', 'Social', 'Positive', 'Clinical'],
    mechanic: 'Pattern recognition in behavioral scenarios',
    color: '#ff88cc',
  },
  {
    id: 'neuroscience',
    name: 'NEUROSCIENCE',
    icon: '⚡',
    sub: ['Brain anatomy', 'Neural circuits', 'Neuroplasticity', 'Consciousness'],
    mechanic: 'Navigate neural network maps — signal routing puzzles',
    color: '#ffee44',
  },
  {
    id: 'sociology',
    name: 'SOCIOLOGY',
    icon: '👥',
    sub: ['Social structures', 'Culture', 'Institutions', 'Inequality', 'Community'],
    mechanic: 'Simulation of social dynamics — choices ripple through community',
    color: '#88ddff',
  },
  {
    id: 'meteorology',
    name: 'METEOROLOGY',
    icon: '🌩',
    sub: ['Atmospheric science', 'Climate', 'Weather systems', 'Forecasting'],
    mechanic: 'Predict and navigate weather patterns in dreamscape',
    color: '#44ccff',
  },
  {
    id: 'archaeology',
    name: 'ARCHAEOLOGY',
    icon: '⛏',
    sub: ['Excavation', 'Artifact analysis', 'Ancient civilizations', 'Dating methods'],
    mechanic: 'Excavation puzzles — careful uncovering of hidden layers',
    color: '#cc9966',
  },
];

// Sample quiz questions per discipline (shown during active learning)
const SAMPLE_QUESTIONS = {
  language:      ['What does "bonjour" mean?', 'Translate: "Merci beaucoup"', '"Sayōnara" is which language?'],
  mathematics:   ['What is π × r²?', 'Solve: 2x + 6 = 14', 'Area of triangle with base 6, height 4?'],
  biology:       ['What does DNA stand for?', 'Organelle that makes energy?', 'What kingdom do fungi belong to?'],
  physics:       ['F = ?', 'Speed of light (approx)?', 'What is entropy?'],
  engineering:   ['What is Ohm\'s Law?', 'Name a renewable energy source', 'What is a stress-strain curve?'],
  psychology:    ['What is cognitive dissonance?', 'Define classical conditioning', 'Name a defense mechanism'],
  neuroscience:  ['What is the hippocampus responsible for?', 'Myelin does what?', 'Name a neurotransmitter'],
  sociology:     ['What is social stratification?', 'Define culture', 'What is a social institution?'],
  meteorology:   ['What causes thunder?', 'What is a cold front?', 'Name a cloud type'],
  archaeology:   ['What is stratigraphy?', 'Carbon-14 is used for?', 'What is an artifact?'],
};

/**
 * LearningHubMode — Select a discipline, select a sub-discipline, then
 * answer contextual questions in a dreamscape grid environment.
 */
export class LearningHubMode extends GameMode {
  constructor(config = {}) {
    super({
      ...config,
      type: 'learning_hub',
      name: 'Learning Hub',
    });
    this._screen = 'discipline'; // 'discipline' | 'subdiscipline' | 'playing'
    this._disciplineIdx = 0;
    this._subIdx = 0;
    this._activeDiscipline = null;
    this._activeSub = null;
    this._lastMoveTime = 0;
    this._moveDelay = 160;
    this._question = null;
    this._questionTimer = 0;
    this._questionResult = null;
    this._questionResultAt = 0;
  }

  init(gameState, canvas, ctx) {
    const w = canvas.width;
    const h = canvas.height;
    gameState.player = gameState.player || { x: 1, y: 1, hp: 100, maxHp: 100 };
    gameState.score = gameState.score || 0;
    gameState.peaceCollected = 0;
    gameState.peaceTotal = 5; // answer 5 questions to complete
    gameState._hubAnswers = 0;
    gameState._hubCorrect = 0;
    this._screen = gameState._hubScreenOverride || 'discipline';
    this._disciplineIdx = 0;
    this._subIdx = 0;
    this._question = null;
  }

  onResize(canvas, gameState) {}

  update(gameState, deltaTime) {
    if (this._questionTimer > 0) {
      this._questionTimer -= deltaTime;
      if (this._questionTimer <= 0) this._question = null;
    }
  }

  handleInput(gameState, input) {
    const now = Date.now();
    if (now - this._lastMoveTime < this._moveDelay) return;

    const dir = input.getDirectionalInput();

    if (this._screen === 'discipline') {
      if (dir.y !== 0) {
        this._disciplineIdx = (this._disciplineIdx + (dir.y > 0 ? 1 : -1) + LEARNING_HUB_DISCIPLINES.length) % LEARNING_HUB_DISCIPLINES.length;
        this._lastMoveTime = now;
        return;
      }
      if (input.isKeyPressed(' ') || input.isKeyPressed('Enter')) {
        this._activeDiscipline = LEARNING_HUB_DISCIPLINES[this._disciplineIdx];
        this._subIdx = 0;
        this._screen = 'subdiscipline';
        this._lastMoveTime = now;
        return;
      }
      return;
    }

    if (this._screen === 'subdiscipline') {
      if (dir.y !== 0) {
        const subs = this._activeDiscipline.sub;
        this._subIdx = (this._subIdx + (dir.y > 0 ? 1 : -1) + subs.length) % subs.length;
        this._lastMoveTime = now;
        return;
      }
      if (input.isKeyPressed('Escape') || input.isKeyPressed('q') || input.isKeyPressed('Q')) {
        this._screen = 'discipline';
        this._lastMoveTime = now;
        return;
      }
      if (input.isKeyPressed(' ') || input.isKeyPressed('Enter')) {
        this._activeSub = this._activeDiscipline.sub[this._subIdx];
        this._screen = 'playing';
        gameState._hubScreenOverride = 'playing';
        this._spawnQuestion(gameState);
        this._lastMoveTime = now;
        return;
      }
      return;
    }

    if (this._screen === 'playing') {
      if (this._question) {
        // Answer with number keys 1-4
        for (const k of ['1','2','3','4']) {
          if (input.isKeyPressed(k)) {
            this._resolveAnswer(gameState, parseInt(k) - 1);
            this._lastMoveTime = now;
            return;
          }
        }
        return;
      }
      if (input.isKeyPressed('Escape') || input.isKeyPressed('q') || input.isKeyPressed('Q')) {
        this._screen = 'discipline';
        gameState._hubScreenOverride = null;
        this._lastMoveTime = now;
        return;
      }
      // Move player
      if (dir.x !== 0 || dir.y !== 0) {
        const sz = 10;
        gameState.player.x = Math.max(0, Math.min(sz - 1, gameState.player.x + dir.x));
        gameState.player.y = Math.max(0, Math.min(sz - 1, gameState.player.y + dir.y));
        this._lastMoveTime = now;
        // Small chance to spawn a question on move
        if (Math.random() < 0.25 && gameState._hubAnswers < gameState.peaceTotal) {
          this._spawnQuestion(gameState);
        }
      }
    }
  }

  _spawnQuestion(gameState) {
    const id = this._activeDiscipline?.id || 'mathematics';
    const questions = SAMPLE_QUESTIONS[id] || SAMPLE_QUESTIONS.mathematics;
    const q = questions[Math.floor(Math.random() * questions.length)];
    // Generate dummy multiple choice (one real hint + 3 distractors)
    this._question = {
      text: q,
      options: ['Think carefully…', 'Use your knowledge', 'Apply what you know', 'Trust the pattern'],
      correctIdx: 0, // simplified — all "correct" for now (tracking engagement, not testing)
      discipline: this._activeDiscipline?.name || '',
      sub: this._activeSub || '',
    };
    this._questionTimer = 15000; // 15s
  }

  _resolveAnswer(gameState, idx) {
    if (!this._question) return;
    const correct = idx === this._question.correctIdx;
    gameState._hubAnswers = (gameState._hubAnswers || 0) + 1;
    if (correct) gameState._hubCorrect = (gameState._hubCorrect || 0) + 1;
    gameState.score = (gameState.score || 0) + (correct ? 200 : 50);
    gameState.peaceCollected = Math.min(gameState.peaceTotal, gameState._hubAnswers);
    this._questionResult = { correct, text: correct ? '✓ Engaged!' : '✓ Keep learning', color: '#00ff88' };
    this._questionResultAt = Date.now();
    this._question = null;
    this._questionTimer = 0;
  }

  render(gameState, ctx) {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    const now = Date.now();

    // Full-canvas background
    ctx.fillStyle = '#01010a';
    ctx.fillRect(0, 0, w, h);

    if (this._screen === 'discipline') {
      this._renderDisciplineSelect(ctx, w, h, now);
      return;
    }
    if (this._screen === 'subdiscipline') {
      this._renderSubDisciplineSelect(ctx, w, h, now);
      return;
    }
    // Playing screen
    this._renderPlaying(ctx, w, h, gameState, now);
  }

  _renderDisciplineSelect(ctx, w, h, now) {
    ctx.textAlign = 'center';
    ctx.fillStyle = '#44aaff';
    ctx.shadowColor = '#44aaff';
    ctx.shadowBlur = 16;
    ctx.font = `bold ${Math.floor(w / 18)}px monospace`;
    ctx.fillText('LEARNING HUB', w / 2, h * 0.10);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#334455';
    ctx.font = `${Math.floor(w / 44)}px monospace`;
    ctx.fillText('Expand your mind through the dreamscape', w / 2, h * 0.17);

    const COLS = 2;
    const ROWS = Math.ceil(LEARNING_HUB_DISCIPLINES.length / COLS);
    const cellW = w * 0.44;
    const cellH = h * 0.10;
    const startX = (w - COLS * cellW) / 2;
    const startY = h * 0.22;

    LEARNING_HUB_DISCIPLINES.forEach((d, i) => {
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      const cx = startX + col * (cellW + w * 0.02);
      const cy = startY + row * (cellH + 6);
      const isSelected = i === this._disciplineIdx;
      const pulse = 0.4 + 0.6 * Math.sin(now / 800 + i);

      ctx.fillStyle = isSelected ? '#0a1a2a' : '#050810';
      ctx.fillRect(cx, cy, cellW, cellH);
      ctx.strokeStyle = isSelected ? d.color : '#1a2030';
      ctx.lineWidth = isSelected ? 2 : 1;
      ctx.strokeRect(cx, cy, cellW, cellH);

      if (isSelected) {
        ctx.shadowColor = d.color;
        ctx.shadowBlur = 8 * pulse;
      }
      ctx.fillStyle = isSelected ? d.color : '#445566';
      ctx.font = `${isSelected ? 'bold ' : ''}${Math.floor(cellW / 14)}px monospace`;
      ctx.textAlign = 'left';
      ctx.fillText(`${d.icon} ${d.name}`, cx + 10, cy + cellH * 0.52);
      ctx.shadowBlur = 0;

      if (isSelected) {
        ctx.fillStyle = '#334455';
        ctx.font = `${Math.floor(cellW / 22)}px monospace`;
        // Truncate mechanic text
        let mech = d.mechanic;
        while (mech.length > 0 && ctx.measureText(mech).width > cellW - 16) {
          mech = mech.substring(0, mech.lastIndexOf(' ')) + '…';
        }
        ctx.fillText(mech, cx + 10, cy + cellH * 0.82);
      }
    });

    ctx.textAlign = 'center';
    ctx.fillStyle = '#223344';
    ctx.font = `${Math.floor(w / 48)}px monospace`;
    ctx.fillText('↑↓ navigate  ·  SPACE/ENTER select', w / 2, h * 0.96);
  }

  _renderSubDisciplineSelect(ctx, w, h, now) {
    const d = this._activeDiscipline;
    ctx.textAlign = 'center';
    ctx.fillStyle = d.color;
    ctx.shadowColor = d.color;
    ctx.shadowBlur = 12;
    ctx.font = `bold ${Math.floor(w / 20)}px monospace`;
    ctx.fillText(`${d.icon}  ${d.name}`, w / 2, h * 0.12);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#334455';
    ctx.font = `${Math.floor(w / 44)}px monospace`;
    ctx.fillText('Choose a sub-discipline', w / 2, h * 0.20);

    d.sub.forEach((sub, i) => {
      const isSelected = i === this._subIdx;
      const oy = h * (0.28 + i * 0.10);
      const bW = w * 0.55;
      const bX = (w - bW) / 2;
      ctx.fillStyle = isSelected ? '#0a1520' : '#050810';
      ctx.fillRect(bX, oy - 14, bW, 30);
      ctx.strokeStyle = isSelected ? d.color : '#1a2030';
      ctx.lineWidth = isSelected ? 2 : 1;
      ctx.strokeRect(bX, oy - 14, bW, 30);
      ctx.fillStyle = isSelected ? d.color : '#445566';
      ctx.font = `${isSelected ? 'bold ' : ''}${Math.floor(w / 30)}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(sub, w / 2, oy + 4);
    });

    ctx.fillStyle = '#223344';
    ctx.font = `${Math.floor(w / 48)}px monospace`;
    ctx.fillText('↑↓ navigate  ·  SPACE/ENTER confirm  ·  Q/ESC back', w / 2, h * 0.96);
  }

  _renderPlaying(ctx, w, h, gameState, now) {
    const d = this._activeDiscipline;
    const sz = 10;
    const tW = Math.floor(w / sz);
    const tH = Math.floor((h * 0.80) / sz);

    // Grid background tiles
    for (let y = 0; y < sz; y++) {
      for (let x = 0; x < sz; x++) {
        const shade = ((x + y) % 2 === 0) ? '#050810' : '#080d18';
        ctx.fillStyle = shade;
        ctx.fillRect(x * tW, y * tH, tW, tH);
      }
    }

    // Subtle grid lines
    ctx.strokeStyle = 'rgba(68,170,255,0.08)';
    ctx.lineWidth = 1;
    for (let y = 0; y <= sz; y++) {
      ctx.beginPath(); ctx.moveTo(0, y * tH); ctx.lineTo(sz * tW, y * tH); ctx.stroke();
    }
    for (let x = 0; x <= sz; x++) {
      ctx.beginPath(); ctx.moveTo(x * tW, 0); ctx.lineTo(x * tW, sz * tH); ctx.stroke();
    }

    // Player
    const plx = gameState.player.x * tW + tW / 2;
    const ply = gameState.player.y * tH + tH / 2;
    ctx.save();
    ctx.fillStyle = d ? d.color : '#44aaff';
    ctx.shadowColor = d ? d.color : '#44aaff';
    ctx.shadowBlur = 12;
    ctx.font = `bold ${Math.floor(Math.min(tW, tH) * 0.7)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('◈', plx, ply);
    ctx.shadowBlur = 0;
    ctx.restore();

    // HUD
    const hudY = sz * tH + 4;
    ctx.fillStyle = '#0a0d18';
    ctx.fillRect(0, hudY, w, h - hudY);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = d ? d.color : '#44aaff';
    ctx.font = `bold ${Math.floor(w / 36)}px monospace`;
    ctx.fillText(`${d?.icon || '📚'} ${d?.name || 'Learning Hub'} — ${this._activeSub || ''}`, 8, hudY + 4);
    ctx.fillStyle = '#334455';
    ctx.font = `${Math.floor(w / 48)}px monospace`;
    ctx.fillText(`Progress: ${gameState.peaceCollected || 0} / ${gameState.peaceTotal}  ·  Score: ${gameState.score || 0}  ·  Move to trigger questions`, 8, hudY + 24);
    ctx.fillStyle = '#223344';
    ctx.fillText('Q/ESC: change discipline', 8, hudY + 40);

    // Question overlay
    if (this._question) {
      this._renderQuestion(ctx, w, h, now);
    }

    // Answer result flash
    if (this._questionResult && this._questionResultAt) {
      const age = now - this._questionResultAt;
      if (age < 1800) {
        const fade = age > 1300 ? (1800 - age) / 500 : 1;
        ctx.save();
        ctx.globalAlpha = fade;
        ctx.fillStyle = this._questionResult.color;
        ctx.font = `bold ${Math.floor(w / 20)}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = this._questionResult.color;
        ctx.shadowBlur = 12;
        ctx.fillText(this._questionResult.text, w / 2, h * 0.14);
        ctx.shadowBlur = 0;
        ctx.restore();
      } else {
        this._questionResult = null;
      }
    }
  }

  _renderQuestion(ctx, w, h, now) {
    const q = this._question;
    const d = this._activeDiscipline;
    const timeLeft = Math.max(0, Math.ceil(this._questionTimer / 1000));

    const popW = w * 0.62;
    const popH = h * 0.55;
    const popX = (w - popW) / 2;
    const popY = (h - popH) / 2;

    ctx.save();
    ctx.globalAlpha = 0.96;
    ctx.fillStyle = '#030610';
    ctx.fillRect(popX, popY, popW, popH);
    ctx.strokeStyle = d ? d.color : '#44aaff';
    ctx.lineWidth = 2;
    ctx.strokeRect(popX, popY, popW, popH);
    ctx.globalAlpha = 1;

    const cx = w / 2;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Discipline label
    ctx.fillStyle = d ? d.color : '#44aaff';
    ctx.font = `bold ${Math.floor(popW / 20)}px monospace`;
    ctx.fillText(`${d?.icon || '📚'} ${q.discipline} — ${q.sub}`, cx, popY + popH * 0.11);

    // Question
    ctx.fillStyle = '#aaccff';
    ctx.font = `bold ${Math.floor(popW / 17)}px monospace`;
    // word-wrap question text
    const maxLineW = popW * 0.88;
    const words = q.text.split(' ');
    let line = '';
    const lines = [];
    for (const word of words) {
      const test = line ? line + ' ' + word : word;
      if (ctx.measureText(test).width > maxLineW && line) {
        lines.push(line); line = word;
      } else { line = test; }
    }
    if (line) lines.push(line);
    lines.forEach((l, i) => {
      ctx.fillText(l, cx, popY + popH * 0.26 + i * Math.floor(popW / 14));
    });

    // Options
    q.options.forEach((opt, i) => {
      const oy = popY + popH * (0.46 + i * 0.11);
      const optW = popW * 0.84;
      const optX = popX + (popW - optW) / 2;
      ctx.fillStyle = '#080d18';
      ctx.fillRect(optX, oy - 13, optW, 28);
      ctx.strokeStyle = '#1a2a44';
      ctx.lineWidth = 1;
      ctx.strokeRect(optX, oy - 13, optW, 28);
      ctx.fillStyle = '#6688aa';
      ctx.font = `${Math.floor(popW / 24)}px monospace`;
      ctx.textAlign = 'left';
      ctx.fillText(`[${i + 1}]  ${opt}`, optX + 10, oy + 4);
    });

    // Timer
    ctx.textAlign = 'center';
    ctx.fillStyle = timeLeft <= 4 ? '#ff4455' : '#334455';
    ctx.font = `${Math.floor(popW / 26)}px monospace`;
    ctx.fillText(`${timeLeft}s`, cx, popY + popH * 0.94);
    ctx.restore();
  }
}

export default LearningHubMode;
