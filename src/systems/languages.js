// ═══════════════════════════════════════════════════════════════════════
//  LANGUAGE SYSTEM — Phase 3 Language Learning
//  16 supported languages with progressive overload chains.
//  Includes Modern Greek (el) and Egyptian Hieroglyphs (egy, via transliteration).
//  Vocab challenges are drawn from game-relevant concept words so
//  the language practice reinforces the consciousness theme.
// ═══════════════════════════════════════════════════════════════════════

/**
 * All 14 supported languages.
 * Each entry: { id, name, nativeName, family, script }
 */
export const LANGUAGES = [
  { id: 'en', name: 'English',    nativeName: 'English',    family: 'germanic',  script: 'latin' },
  { id: 'de', name: 'German',     nativeName: 'Deutsch',    family: 'germanic',  script: 'latin' },
  { id: 'no', name: 'Norwegian',  nativeName: 'Norsk',      family: 'germanic',  script: 'latin' },
  { id: 'nl', name: 'Dutch',      nativeName: 'Nederlands', family: 'germanic',  script: 'latin' },
  { id: 'fr', name: 'French',     nativeName: 'Français',   family: 'romance',   script: 'latin' },
  { id: 'es', name: 'Spanish',    nativeName: 'Español',    family: 'romance',   script: 'latin' },
  { id: 'pt', name: 'Portuguese', nativeName: 'Português',  family: 'romance',   script: 'latin' },
  { id: 'it', name: 'Italian',    nativeName: 'Italiano',   family: 'romance',   script: 'latin' },
  { id: 'la', name: 'Latin',      nativeName: 'Latina',     family: 'romance',   script: 'latin' },
  { id: 'ru', name: 'Russian',    nativeName: 'Русский',    family: 'slavic',    script: 'cyrillic' },
  { id: 'zh', name: 'Mandarin',   nativeName: '普通话',      family: 'sinitic',   script: 'hanzi' },
  { id: 'ja', name: 'Japanese',   nativeName: '日本語',      family: 'japonic',   script: 'kana' },
  { id: 'ko', name: 'Korean',     nativeName: '한국어',      family: 'koreanic',  script: 'hangul' },
  { id: 'ar', name: 'Arabic',     nativeName: 'العربية',    family: 'semitic',   script: 'arabic' },
  { id: 'el', name: 'Greek',      nativeName: 'Ελληνικά',   family: 'hellenic',  script: 'greek' },
  // Egyptian Hieroglyphs: taught as pictographic script reading via Egyptological transliteration.
  // Afroasiatic language family (Gardiner sign list). Source: Allen, "Middle Egyptian" (2000).
  { id: 'egy', name: 'Hieroglyphs', nativeName: '𓇋𓏤 mdw-nṯr', family: 'afroasiatic', script: 'hieroglyphic' },
];

// ─── LANGUAGE FAMILY SIMILARITY ─────────────────────────────────────────
// Languages in the same family are "easier" when you already know one.
// The progression table defines the recommended learning order per native.

const FAMILY_ORDER = ['germanic', 'romance', 'hellenic', 'slavic', 'afroasiatic', 'sinitic', 'japonic', 'koreanic', 'semitic'];

// For each native language: sorted list of target language IDs by similarity.
// Same family → first group; shared features → second; most distinct → last.
// Progressive overload chains: same family first, then adjacent families, most distant last.
// Evidence: Krashen (1985) Natural Order Hypothesis; Common European Framework of Reference (CEFR)
// Greek sits between Romance and Slavic in accessibility for Latin-script learners.
// Egyptian (egy) is last for most natives — it's a prestige/advanced script track.
const PROGRESSION = {
  en:  ['de', 'no', 'nl', 'fr', 'es', 'pt', 'it', 'la', 'el', 'ru', 'zh', 'ja', 'ko', 'ar', 'egy'],
  de:  ['no', 'nl', 'en', 'fr', 'it', 'es', 'pt', 'la', 'el', 'ru', 'zh', 'ja', 'ko', 'ar', 'egy'],
  no:  ['de', 'nl', 'en', 'fr', 'es', 'it', 'pt', 'la', 'el', 'ru', 'zh', 'ja', 'ko', 'ar', 'egy'],
  nl:  ['de', 'no', 'en', 'fr', 'es', 'pt', 'it', 'la', 'el', 'ru', 'zh', 'ja', 'ko', 'ar', 'egy'],
  fr:  ['es', 'pt', 'it', 'la', 'el', 'de', 'nl', 'no', 'en', 'ru', 'zh', 'ja', 'ko', 'ar', 'egy'],
  es:  ['pt', 'it', 'fr', 'la', 'el', 'de', 'nl', 'no', 'en', 'ru', 'zh', 'ja', 'ko', 'ar', 'egy'],
  pt:  ['es', 'it', 'fr', 'la', 'el', 'de', 'nl', 'no', 'en', 'ru', 'zh', 'ja', 'ko', 'ar', 'egy'],
  it:  ['es', 'pt', 'fr', 'la', 'el', 'de', 'nl', 'no', 'en', 'ru', 'zh', 'ja', 'ko', 'ar', 'egy'],
  // Latin → Greek very early: both Classical languages, shared vocabulary (logos, polis, etc.)
  la:  ['el', 'it', 'fr', 'es', 'pt', 'de', 'nl', 'no', 'en', 'ru', 'zh', 'ja', 'ko', 'ar', 'egy'],
  // Russian → Greek early: Cyrillic script derived from Greek uncial (9th c., Sts Cyril & Methodius)
  ru:  ['el', 'de', 'nl', 'no', 'fr', 'es', 'pt', 'it', 'la', 'en', 'zh', 'ja', 'ko', 'ar', 'egy'],
  zh:  ['ja', 'ko', 'de', 'no', 'nl', 'en', 'fr', 'es', 'pt', 'it', 'la', 'el', 'ru', 'ar', 'egy'],
  ja:  ['zh', 'ko', 'de', 'no', 'nl', 'en', 'fr', 'es', 'pt', 'it', 'la', 'el', 'ru', 'ar', 'egy'],
  ko:  ['ja', 'zh', 'de', 'no', 'nl', 'en', 'fr', 'es', 'pt', 'it', 'la', 'el', 'ru', 'ar', 'egy'],
  // Arabic → Egyptian early: both Afroasiatic family; Arabic script descended from Aramaic/Phoenician
  ar:  ['egy', 'ru', 'el', 'fr', 'es', 'pt', 'it', 'la', 'de', 'no', 'nl', 'en', 'zh', 'ja', 'ko'],
  // Greek → Latin first (most similar), then Romance, Slavic, then Germanic, then distant
  el:  ['la', 'it', 'fr', 'es', 'pt', 'ru', 'de', 'nl', 'no', 'en', 'ar', 'zh', 'ja', 'ko', 'egy'],
  // Egyptian Hieroglyphs → Arabic closest (Afroasiatic), then Greek (Hellenistic period contact)
  egy: ['ar', 'el', 'la', 'it', 'fr', 'es', 'pt', 'ru', 'de', 'nl', 'no', 'en', 'zh', 'ja', 'ko'],
};

/**
 * Returns a sorted array of language IDs in recommended learning order
 * for a given native language.  Languages not in our list are filtered out.
 */
export function getLanguageProgression(nativeLangId = 'en') {
  const chain = PROGRESSION[nativeLangId] || PROGRESSION['en'];
  const validIds = new Set(LANGUAGES.map(l => l.id));
  return chain.filter(id => validIds.has(id));
}

/**
 * Return a Language object by id, or null.
 */
export function getLanguage(id) {
  return LANGUAGES.find(l => l.id === id) || null;
}

// ─── VOCABULARY BANK ────────────────────────────────────────────────────
//  Each entry: game-relevant concept word translated to all 16 languages.
//  Shape: { concept, en, de, no, nl, fr, es, pt, it, la, ru, zh, ja, ko, ar, el, egy }
//  Egyptian (egy) uses Egyptological transliterations (Gardiner sign list, Allen 2000).
//  Greek (el) uses Modern Greek.
//  Used to generate multi-lingual challenges dynamically.

const VOCAB_BANK = [
  {
    concept: 'peace',
    en: 'peace',     de: 'Frieden',      no: 'fred',       nl: 'vrede',
    fr: 'paix',      es: 'paz',          pt: 'paz',        it: 'pace',
    la: 'pax',       ru: 'мир',          zh: '和平',        ja: '平和',
    ko: '평화',       ar: 'سلام',
    el: 'ειρήνη',      egy: 'ḥtp (hotep)',
  },
  {
    concept: 'calm',
    en: 'calm',      de: 'Ruhe',         no: 'ro',         nl: 'rust',
    fr: 'calme',     es: 'calma',        pt: 'calma',      it: 'calma',
    la: 'tranquillitas', ru: 'спокойствие', zh: '平静',    ja: '穏やか',
    ko: '평온',       ar: 'هدوء',
    el: 'γαλήνη',      egy: 'nḏm (nedjem)',
  },
  {
    concept: 'hope',
    en: 'hope',      de: 'Hoffnung',     no: 'håp',        nl: 'hoop',
    fr: 'espoir',    es: 'esperanza',    pt: 'esperança',  it: 'speranza',
    la: 'spes',      ru: 'надежда',      zh: '希望',        ja: '希望',
    ko: '희망',       ar: 'أمل',
    el: 'ελπίδα',      egy: 'ꜣḫ (akh)',
  },
  {
    concept: 'fear',
    en: 'fear',      de: 'Angst',        no: 'frykt',      nl: 'angst',
    fr: 'peur',      es: 'miedo',        pt: 'medo',       it: 'paura',
    la: 'timor',     ru: 'страх',        zh: '恐惧',        ja: '恐れ',
    ko: '두려움',     ar: 'خوف',
    el: 'φόβος',      egy: 'snḏ (sened)',
  },
  {
    concept: 'pattern',
    en: 'pattern',   de: 'Muster',       no: 'mønster',    nl: 'patroon',
    fr: 'modèle',    es: 'patrón',       pt: 'padrão',     it: 'modello',
    la: 'exemplar',  ru: 'узор',         zh: '模式',        ja: 'パターン',
    ko: '패턴',       ar: 'نمط',
    el: 'πρότυπο',      egy: 'mdw-nṯr',
  },
  {
    concept: 'insight',
    en: 'insight',   de: 'Einsicht',     no: 'innsikt',    nl: 'inzicht',
    fr: 'perspicacité', es: 'perspicacia', pt: 'perspicácia', it: 'perspicacia',
    la: 'perspicacia', ru: 'понимание',  zh: '洞察',        ja: '洞察',
    ko: '통찰',       ar: 'بصيرة',
    el: 'νόηση',      egy: 'sꜣ (sa)',
  },
  {
    concept: 'courage',
    en: 'courage',   de: 'Mut',          no: 'mot',        nl: 'moed',
    fr: 'courage',   es: 'valor',        pt: 'coragem',    it: 'coraggio',
    la: 'virtus',    ru: 'храбрость',    zh: '勇气',        ja: '勇気',
    ko: '용기',       ar: 'شجاعة',
    el: 'θάρρος',      egy: 'qni (qeni)',
  },
  {
    concept: 'harmony',
    en: 'harmony',   de: 'Harmonie',     no: 'harmoni',    nl: 'harmonie',
    fr: 'harmonie',  es: 'armonía',      pt: 'harmonia',   it: 'armonia',
    la: 'harmonia',  ru: 'гармония',     zh: '和谐',        ja: '調和',
    ko: '조화',       ar: 'انسجام',
    el: 'αρμονία',      egy: 'mꜣꜥt (maat)',
  },
  {
    concept: 'light',
    en: 'light',     de: 'Licht',        no: 'lys',        nl: 'licht',
    fr: 'lumière',   es: 'luz',          pt: 'luz',        it: 'luce',
    la: 'lux',       ru: 'свет',         zh: '光',          ja: '光',
    ko: '빛',         ar: 'نور',
    el: 'φως',      egy: 'rꜥ (ra)',
  },
  {
    concept: 'dream',
    en: 'dream',     de: 'Traum',        no: 'drøm',       nl: 'droom',
    fr: 'rêve',      es: 'sueño',        pt: 'sonho',      it: 'sogno',
    la: 'somnium',   ru: 'мечта',        zh: '梦',          ja: '夢',
    ko: '꿈',         ar: 'حلم',
    el: 'όνειρο',      egy: 'rswt (rswt)',
  },
  {
    concept: 'mind',
    en: 'mind',      de: 'Geist',        no: 'sinn',       nl: 'geest',
    fr: 'esprit',    es: 'mente',        pt: 'mente',      it: 'mente',
    la: 'mens',      ru: 'разум',        zh: '心灵',        ja: '心',
    ko: '마음',       ar: 'عقل',
    el: 'νους',      egy: 'ib (ib)',
  },
  {
    concept: 'path',
    en: 'path',      de: 'Weg',          no: 'vei',        nl: 'pad',
    fr: 'chemin',    es: 'camino',       pt: 'caminho',    it: 'cammino',
    la: 'via',       ru: 'путь',         zh: '道路',        ja: '道',
    ko: '길',         ar: 'طريق',
    el: 'μονοπάτι',      egy: 'wꜣt (waat)',
  },
];

// ─── CEFR LEVEL SYSTEM ──────────────────────────────────────────────────────
//  A1 → A2 → B1 → B2 → C1 → C2  (Common European Framework of Reference)
//  Level advances when accuracy is high; drops if accuracy falls.
//  Players can also manually set their level in Options.

export const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

// Minimum rolling accuracy required to *hold* a level before advancing/retreating
const CEFR_ADVANCE_ACCURACY = 0.82; // 82% correct over last 10 challenges → advance
const CEFR_RETREAT_ACCURACY = 0.45; // below 45% → retreat one level

/**
 * Read per-language CEFR progress from localStorage.
 * Returns { level, correct, total } for the given language.
 */
export function getLangProgress(langId) {
  try {
    const raw = localStorage.getItem(`gp.lang.${langId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        level: CEFR_LEVELS.includes(parsed.level) ? parsed.level : 'A1',
        correct: parsed.correct || 0,
        total: parsed.total || 0,
        // Rolling window: last 10 answers (array of booleans)
        recent: Array.isArray(parsed.recent) ? parsed.recent : [],
      };
    }
  } catch (_) {}
  return { level: 'A1', correct: 0, total: 0, recent: [] };
}

/**
 * Save per-language CEFR progress.
 */
export function saveLangProgress(langId, progress) {
  try {
    localStorage.setItem(`gp.lang.${langId}`, JSON.stringify(progress));
  } catch (_) {}
}

/**
 * Record the result of a language challenge answer and update CEFR level.
 * Returns the updated progress object.
 */
export function recordLangAnswer(langId, wasCorrect) {
  const progress = getLangProgress(langId);
  progress.total++;
  if (wasCorrect) progress.correct++;

  // Update rolling window (last 10)
  progress.recent.push(wasCorrect);
  if (progress.recent.length > 10) progress.recent.shift();

  // Level progression/regression based on rolling accuracy
  if (progress.recent.length >= 5) {
    const rollingAcc = progress.recent.filter(Boolean).length / progress.recent.length;
    const curIdx = CEFR_LEVELS.indexOf(progress.level);

    if (rollingAcc >= CEFR_ADVANCE_ACCURACY && curIdx < CEFR_LEVELS.length - 1) {
      // Advance level and reset rolling window
      progress.level = CEFR_LEVELS[curIdx + 1];
      progress.recent = [];
    } else if (rollingAcc < CEFR_RETREAT_ACCURACY && curIdx > 0) {
      // Retreat one level; keep rolling window
      progress.level = CEFR_LEVELS[curIdx - 1];
    }
  }

  saveLangProgress(langId, progress);
  return progress;
}

/**
 * Manually set CEFR level for a language (player override from Options).
 */
export function setLangLevel(langId, level) {
  if (!CEFR_LEVELS.includes(level)) return;
  const progress = getLangProgress(langId);
  progress.level = level;
  progress.recent = []; // reset rolling window on manual change
  saveLangProgress(langId, progress);
}

// ─── GRAMMAR CHALLENGE BANK ───────────────────────────────────────────────
// Grammar challenges are displayed when level >= B1.
// Each entry: { lang, level, prompt, options, correct, hint }
// 'hint' is shown after the answer for deeper learning.

export const GRAMMAR_CHALLENGES = [
  // Spanish
  { lang: 'es', level: 'A1', prompt: 'Ella ___ feliz.  (to be — permanent trait)', options: ['está', 'es', 'tiene', 'hay'], correct: 1,  hint: 'SER (es) for permanent states; ESTAR (está) for temporary.' },
  { lang: 'es', level: 'A2', prompt: '"I went" in Spanish:', options: ['voy', 'fui', 'iba', 'iré'], correct: 1,  hint: '"Fui" — irregular preterite of IR and SER.' },
  { lang: 'es', level: 'B1', prompt: 'Subjunctive: Quiero que tú ___ (venir)', options: ['vengas', 'vienes', 'viniste', 'vendrás'], correct: 0, hint: 'Subjunctive required after "quiero que". Stem-change: ven→veng.' },
  { lang: 'es', level: 'B2', prompt: '"Se habla español aquí" means:', options: ['One speaks Spanish here', 'He spoke Spanish here', 'Spanish is spoken here', 'They speak Spanish here'], correct: 2, hint: 'Pasiva refleja: se + 3rd person verb = passive construction.' },
  // French
  { lang: 'fr', level: 'A1', prompt: '"I have" in French:', options: ["j'ai", "je suis", "j'ai été", "j'avais"], correct: 0, hint: 'AVOIR (to have): j\'ai, tu as, il a…' },
  { lang: 'fr', level: 'A2', prompt: 'Passé composé of "manger" (I ate):', options: ["j'ai mangé", "je mangeais", "je mange", "j'avais mangé"], correct: 0, hint: 'Passé composé = avoir/être + past participle.' },
  { lang: 'fr', level: 'B1', prompt: 'Which takes ÊTRE in passé composé?', options: ['manger', 'avoir', 'partir', 'faire'], correct: 2, hint: 'House of être: verbs of motion + reflexives use ÊTRE, not AVOIR.' },
  { lang: 'fr', level: 'B2', prompt: 'Subjonctif: Il faut que tu ___ (être)', options: ['sois', 'es', 'soit', 'étais'], correct: 0, hint: 'Subjonctif of ÊTRE: sois, sois, soit, soyons, soyez, soient.' },
  // German
  { lang: 'de', level: 'A1', prompt: '"The house" in German (nominative):', options: ['der Haus', 'das Haus', 'die Haus', 'den Haus'], correct: 1, hint: 'Haus is neuter → das Haus.' },
  { lang: 'de', level: 'A2', prompt: '"I see the man" — accusative:', options: ['der Mann', 'den Mann', 'dem Mann', 'des Mannes'], correct: 1, hint: 'Definite article accusative masc.: der → den.' },
  { lang: 'de', level: 'B1', prompt: '"She gives him the book" — dative:', options: ['Er gibt ihr das Buch', 'Sie gibt ihm das Buch', 'Sie gibt den Mann das Buch', 'Sie gibt er das Buch'], correct: 1, hint: 'Dative of "he/him" is IHM; sie = she.' },
  { lang: 'de', level: 'B2', prompt: 'Konjunktiv II of "haben" (I would have):', options: ['ich habe', 'ich hatte', 'ich hätte', 'ich würde haben'], correct: 2, hint: 'Konjunktiv II of haben: hätte, hättest, hätte…' },
  // Japanese (romaji)
  { lang: 'ja', level: 'A1', prompt: '"I eat sushi" in Japanese:', options: ['わたしは すし が たべます', 'わたしは すし を たべます', 'わたしは すし に たべます', 'わたしは すし で たべます'], correct: 1, hint: 'Particle WO (を) marks the direct object of eating.' },
  { lang: 'ja', level: 'B1', prompt: 'て-form (te-form) of 食べる (taberu):', options: ['食べた', '食べて', '食べる', '食べます'], correct: 1, hint: 'RU-verbs: drop -ru, add -te. 食べ + て = 食べて.' },
  // Mandarin
  { lang: 'zh', level: 'A1', prompt: '"I am Chinese" in Mandarin:', options: ['我 是 中国人', '我 有 中国人', '我 在 中国人', '我 叫 中国人'], correct: 0, hint: '是 (shì) is the copula "to be" for identity.' },
  { lang: 'zh', level: 'B1', prompt: 'Resultative complement in "看完" means:', options: ['see quickly', 'finish seeing', 'cannot see', 'see again'], correct: 1, hint: '完 (wán) = complete/finish; 看完 = finish watching.' },
  // Russian
  { lang: 'ru', level: 'A2', prompt: '"I see a woman" — accusative:', options: ['женщина', 'женщиной', 'женщины', 'женщину'], correct: 3, hint: 'Feminine nouns in accusative: -а/-я endings become -у/-ю.' },
  // Arabic
  { lang: 'ar', level: 'A2', prompt: '"The book" in Arabic:', options: ['كتاب', 'الكتاب', 'كتابًا', 'للكتاب'], correct: 1, hint: 'Definite article in Arabic = ال (al-) prefixed to the noun.' },
];

/**
 * Get a grammar challenge for a given language and CEFR level.
 * Falls back to lower levels if no challenges at current level.
 */
export function getGrammarChallenge(langId, cefrLevel = 'A1') {
  const levelIdx = CEFR_LEVELS.indexOf(cefrLevel);
  // Try current level first, then lower levels
  for (let i = levelIdx; i >= 0; i--) {
    const pool = GRAMMAR_CHALLENGES.filter(c => c.lang === langId && c.level === CEFR_LEVELS[i]);
    if (pool.length > 0) {
      const c = pool[Math.floor(Math.random() * pool.length)];
      return {
        type: 'grammar',
        lang: langId,
        level: c.level,
        prompt: c.prompt,
        options: c.options,
        correct: c.correct,
        hint: c.hint,
      };
    }
  }
  return null; // no grammar challenges for this language yet
}

/**
 * Generate a language challenge for the given target language and CEFR level.
 * Returns an object compatible with the learning-modules challenge format.
 *
 * immersionMode: if true, show the concept in the target language (not English).
 * cefrLevel: used to modulate difficulty (higher levels prefer grammar challenges).
 */
export function getLangChallenge(targetLangId = 'fr', cefrLevel = 'A1', immersionMode = false) {
  const targetLang = getLanguage(targetLangId);
  if (!targetLang) return null;

  // B1+ levels: 40% chance of grammar challenge instead of vocabulary
  const levelIdx = CEFR_LEVELS.indexOf(cefrLevel);
  if (levelIdx >= 2 && Math.random() < 0.40) {
    const grammar = getGrammarChallenge(targetLangId, cefrLevel);
    if (grammar) return grammar;
  }

  // Pick a random word from vocab bank
  const entry = VOCAB_BANK[Math.floor(Math.random() * VOCAB_BANK.length)];
  const correctWord = entry[targetLangId];
  if (!correctWord) return null;

  // Build 3 distractors from other vocab entries, same language
  const distractors = [];
  const shuffled = [...VOCAB_BANK].sort(() => Math.random() - 0.5);
  for (const other of shuffled) {
    if (other.concept !== entry.concept && other[targetLangId]) {
      distractors.push(other[targetLangId]);
    }
    if (distractors.length >= 3) break;
  }

  // Assemble options (correct + 3 distractors), shuffle
  const allOptions = [correctWord, ...distractors];
  // Fisher-Yates
  for (let i = allOptions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allOptions[i], allOptions[j]] = [allOptions[j], allOptions[i]];
  }

  const correctIndex = allOptions.indexOf(correctWord);

  // Immersion mode: show concept in target language; English in parens for A1/A2
  let promptConcept = entry.concept;
  if (immersionMode && levelIdx >= 2) {
    // B1+ full immersion: concept shown only in target language (no English)
    promptConcept = entry[targetLangId] !== correctWord
      ? entry[targetLangId]
      : `"${entry.concept}"`;
  }

  const levelTag = cefrLevel !== 'A1' ? ` [${cefrLevel}]` : '';

  return {
    type: 'language',
    lang: targetLangId,
    cefrLevel,
    langName: targetLang.name,
    nativeName: targetLang.nativeName,
    prompt: `${targetLang.name.toUpperCase()}${levelTag}: "${entry.concept}" means...`,
    promptConcept: entry.concept,
    options: allOptions,
    correct: correctIndex,
  };
}

/**
 * Build the full list of language options for a menu selector.
 * nativeLangId: exclude from list (can't learn your own language).
 */
export function getLearnableLanguages(nativeLangId = 'en') {
  return LANGUAGES.filter(l => l.id !== nativeLangId);
}
