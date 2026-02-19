// ═══════════════════════════════════════════════════════════════════════
//  LANGUAGE SYSTEM — Phase 3 Language Learning
//  14 supported languages with progressive overload chains.
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
];

// ─── LANGUAGE FAMILY SIMILARITY ─────────────────────────────────────────
// Languages in the same family are "easier" when you already know one.
// The progression table defines the recommended learning order per native.

const FAMILY_ORDER = ['germanic', 'romance', 'slavic', 'sinitic', 'japonic', 'koreanic', 'semitic'];

// For each native language: sorted list of target language IDs by similarity.
// Same family → first group; shared features → second; most distinct → last.
const PROGRESSION = {
  en: ['de', 'no', 'nl', 'fr', 'es', 'pt', 'it', 'la', 'ru', 'zh', 'ja', 'ko', 'ar'],
  de: ['no', 'nl', 'en', 'fr', 'it', 'es', 'pt', 'la', 'ru', 'zh', 'ja', 'ko', 'ar'],
  no: ['de', 'nl', 'en', 'fr', 'es', 'it', 'pt', 'la', 'ru', 'zh', 'ja', 'ko', 'ar'],
  nl: ['de', 'no', 'en', 'fr', 'es', 'pt', 'it', 'la', 'ru', 'zh', 'ja', 'ko', 'ar'],
  fr: ['es', 'pt', 'it', 'la', 'de', 'nl', 'no', 'en', 'ru', 'zh', 'ja', 'ko', 'ar'],
  es: ['pt', 'it', 'fr', 'la', 'de', 'nl', 'no', 'en', 'ru', 'zh', 'ja', 'ko', 'ar'],
  pt: ['es', 'it', 'fr', 'la', 'de', 'nl', 'no', 'en', 'ru', 'zh', 'ja', 'ko', 'ar'],
  it: ['es', 'pt', 'fr', 'la', 'de', 'nl', 'no', 'en', 'ru', 'zh', 'ja', 'ko', 'ar'],
  la: ['it', 'fr', 'es', 'pt', 'de', 'nl', 'no', 'en', 'ru', 'zh', 'ja', 'ko', 'ar'],
  ru: ['de', 'nl', 'no', 'fr', 'es', 'pt', 'it', 'la', 'en', 'zh', 'ja', 'ko', 'ar'],
  zh: ['ja', 'ko', 'de', 'no', 'nl', 'en', 'fr', 'es', 'pt', 'it', 'la', 'ru', 'ar'],
  ja: ['zh', 'ko', 'de', 'no', 'nl', 'en', 'fr', 'es', 'pt', 'it', 'la', 'ru', 'ar'],
  ko: ['ja', 'zh', 'de', 'no', 'nl', 'en', 'fr', 'es', 'pt', 'it', 'la', 'ru', 'ar'],
  ar: ['ru', 'fr', 'es', 'pt', 'it', 'la', 'de', 'no', 'nl', 'en', 'zh', 'ja', 'ko'],
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
//  Each entry: game-relevant concept word translated to all 14 languages.
//  Shape: { concept, en, de, no, nl, fr, es, pt, it, la, ru, zh, ja, ko, ar }
//  Used to generate multi-lingual challenges dynamically.

const VOCAB_BANK = [
  {
    concept: 'peace',
    en: 'peace',     de: 'Frieden',      no: 'fred',       nl: 'vrede',
    fr: 'paix',      es: 'paz',          pt: 'paz',        it: 'pace',
    la: 'pax',       ru: 'мир',          zh: '和平',        ja: '平和',
    ko: '평화',       ar: 'سلام',
  },
  {
    concept: 'calm',
    en: 'calm',      de: 'Ruhe',         no: 'ro',         nl: 'rust',
    fr: 'calme',     es: 'calma',        pt: 'calma',      it: 'calma',
    la: 'tranquillitas', ru: 'спокойствие', zh: '平静',    ja: '穏やか',
    ko: '평온',       ar: 'هدوء',
  },
  {
    concept: 'hope',
    en: 'hope',      de: 'Hoffnung',     no: 'håp',        nl: 'hoop',
    fr: 'espoir',    es: 'esperanza',    pt: 'esperança',  it: 'speranza',
    la: 'spes',      ru: 'надежда',      zh: '希望',        ja: '希望',
    ko: '희망',       ar: 'أمل',
  },
  {
    concept: 'fear',
    en: 'fear',      de: 'Angst',        no: 'frykt',      nl: 'angst',
    fr: 'peur',      es: 'miedo',        pt: 'medo',       it: 'paura',
    la: 'timor',     ru: 'страх',        zh: '恐惧',        ja: '恐れ',
    ko: '두려움',     ar: 'خوف',
  },
  {
    concept: 'pattern',
    en: 'pattern',   de: 'Muster',       no: 'mønster',    nl: 'patroon',
    fr: 'modèle',    es: 'patrón',       pt: 'padrão',     it: 'modello',
    la: 'exemplar',  ru: 'узор',         zh: '模式',        ja: 'パターン',
    ko: '패턴',       ar: 'نمط',
  },
  {
    concept: 'insight',
    en: 'insight',   de: 'Einsicht',     no: 'innsikt',    nl: 'inzicht',
    fr: 'perspicacité', es: 'perspicacia', pt: 'perspicácia', it: 'perspicacia',
    la: 'perspicacia', ru: 'понимание',  zh: '洞察',        ja: '洞察',
    ko: '통찰',       ar: 'بصيرة',
  },
  {
    concept: 'courage',
    en: 'courage',   de: 'Mut',          no: 'mot',        nl: 'moed',
    fr: 'courage',   es: 'valor',        pt: 'coragem',    it: 'coraggio',
    la: 'virtus',    ru: 'храбрость',    zh: '勇气',        ja: '勇気',
    ko: '용기',       ar: 'شجاعة',
  },
  {
    concept: 'harmony',
    en: 'harmony',   de: 'Harmonie',     no: 'harmoni',    nl: 'harmonie',
    fr: 'harmonie',  es: 'armonía',      pt: 'harmonia',   it: 'armonia',
    la: 'harmonia',  ru: 'гармония',     zh: '和谐',        ja: '調和',
    ko: '조화',       ar: 'انسجام',
  },
  {
    concept: 'light',
    en: 'light',     de: 'Licht',        no: 'lys',        nl: 'licht',
    fr: 'lumière',   es: 'luz',          pt: 'luz',        it: 'luce',
    la: 'lux',       ru: 'свет',         zh: '光',          ja: '光',
    ko: '빛',         ar: 'نور',
  },
  {
    concept: 'dream',
    en: 'dream',     de: 'Traum',        no: 'drøm',       nl: 'droom',
    fr: 'rêve',      es: 'sueño',        pt: 'sonho',      it: 'sogno',
    la: 'somnium',   ru: 'мечта',        zh: '梦',          ja: '夢',
    ko: '꿈',         ar: 'حلم',
  },
  {
    concept: 'mind',
    en: 'mind',      de: 'Geist',        no: 'sinn',       nl: 'geest',
    fr: 'esprit',    es: 'mente',        pt: 'mente',      it: 'mente',
    la: 'mens',      ru: 'разум',        zh: '心灵',        ja: '心',
    ko: '마음',       ar: 'عقل',
  },
  {
    concept: 'path',
    en: 'path',      de: 'Weg',          no: 'vei',        nl: 'pad',
    fr: 'chemin',    es: 'camino',       pt: 'caminho',    it: 'cammino',
    la: 'via',       ru: 'путь',         zh: '道路',        ja: '道',
    ko: '길',         ar: 'طريق',
  },
];

/**
 * Generate a language challenge for the given target language.
 * Returns an object compatible with the learning-modules challenge format.
 *
 * The question shows the English concept and asks the player to identify
 * the correct translation in the target language.
 */
export function getLangChallenge(targetLangId = 'fr') {
  const targetLang = getLanguage(targetLangId);
  if (!targetLang) return null;

  // Pick a random word from vocab bank
  const entry = VOCAB_BANK[Math.floor(Math.random() * VOCAB_BANK.length)];
  const correctWord = entry[targetLangId];
  if (!correctWord) return null; // shouldn't happen

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

  return {
    type: 'language',
    lang: targetLangId,
    langName: targetLang.name,
    nativeName: targetLang.nativeName,
    prompt: `${targetLang.name.toUpperCase()}: "${entry.concept}" means...`,
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
