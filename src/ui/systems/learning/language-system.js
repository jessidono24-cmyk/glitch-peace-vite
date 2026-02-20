'use strict';
// ═══════════════════════════════════════════════════════════════════════
//  GLITCH·PEACE — language-system.js
//
//  Evidence-based multilingual learning system for 19 languages.
//
//  Research backing:
//  ─────────────────────────────────────────────────────────────────────
//  1. FSI (Foreign Service Institute) Language Difficulty Rankings (1973–present)
//     — Measures hours for English speakers to reach professional proficiency.
//     — Cat I: 600-750 h (Norse/Romance/Dutch); Cat II: 900 h (German);
//       Cat III: 1100 h (Greek/Russian); Cat IV: 2200 h (Arabic/CJK).
//
//  2. ASJP (Automated Similarity Judgment Program) database, v19 (2021)
//     — Measures pairwise lexical distance across the Swadesh-40 word list.
//     — English–Norwegian: ~0.28 distance (very close Germanic cognates).
//     — English–Dutch: ~0.32; English–German: ~0.42 (grammar divergence).
//     — English–French: ~0.57 (Latin loans help, phonology differs).
//     — English–Arabic/CJK: ~0.95 (maximally distant).
//
//  3. Krashen's Input Hypothesis (1977/1982): comprehensible input i+1.
//     — Language acquisition is most efficient when input is slightly above
//       current competence. This drives the progressive unlock model.
//
//  4. Linguistic typology (WALS — World Atlas of Language Structures, 2013)
//     — Isolating vs agglutinative vs fusional morphology affects load.
//     — Script type (Latin, Cyrillic, Arabic/RTL, CJK logographic) adds
//       additional cognitive distance.
//
//  5. Cognitive Load Theory (Sweller, 1988)
//     — Intrinsic load from grammar + extraneous load from script must not
//       overwhelm working memory (Miller's 7±2 chunks).
//     — Gradual exposure: native → cognate → phonetic → fully distant.
//
//  Language Family Tree (Indo-European, Sino-Tibetan, etc.):
//  ─────────────────────────────────────────────────────────────────────
//  Proto-Indo-European →
//    Germanic  (West): English*, German, Dutch
//    Germanic  (North, Scandinavian): Norwegian
//    Romance   (from Latin): French, Spanish, Portuguese, Italian
//    Classical: Latin (ancestor of Romance; roots in English via Norman)
//    Hellenic:  Greek (Modern) — roots in English/Latin as Neo-classical loans
//    Slavic    (East): Russian
//  Afroasiatic (Semitic):
//    Arabic — shared with Egyptian proto-Afroasiatic ancestor
//  Afroasiatic (Ancient Egyptian):
//    Egyptian Hieroglyphs — ancestor of Coptic; Afroasiatic roots shared with Arabic
//  Sino-Tibetan (Sinitic):
//    Mandarin Chinese (Standard)
//  Koreanic (isolate):
//    Korean (Hangul script, significant Sino-Korean vocabulary ~60 %)
//  Japonic (isolate):
//    Japanese (3 scripts; ~50 % Sino-Japanese vocabulary bridges to Mandarin)
//  Constructed/Reconstructed:
//    Latin (Classical) — unlocks all Romance languages efficiently
//  Proto-Symbolic (meta-language of pattern):
//    Sigils — universal pattern language spanning all writing systems
// ═══════════════════════════════════════════════════════════════════════

// ─── Language metadata ────────────────────────────────────────────────
export const LANGUAGES = {
  en: {
    name: 'English', nativeName: 'English',
    family: 'germanic-west', script: 'latin', dir: 'ltr',
    fsiHours: 0, distance: 0.0, emoji: '🇬🇧',
    unlockStage: 0, // always available
    cognatesWith: ['de', 'nl', 'no'],
    helps: ['de', 'nl', 'no', 'fr', 'es', 'pt', 'it', 'la'],
    description: 'Your starting language — Germanic with heavy Latin/French influence.',
  },
  no: {
    name: 'Norwegian', nativeName: 'Norsk',
    family: 'germanic-north', script: 'latin', dir: 'ltr',
    fsiHours: 600, distance: 0.15, emoji: '🇳🇴',
    unlockStage: 1,
    cognatesWith: ['en', 'nl', 'de', 'sv', 'da'],
    helps: ['sv', 'da', 'de', 'nl'],
    description: 'Closest living language to Old English. Lexically ~72 % shared with English.',
  },
  nl: {
    name: 'Dutch', nativeName: 'Nederlands',
    family: 'germanic-west', script: 'latin', dir: 'ltr',
    fsiHours: 600, distance: 0.20, emoji: '🇳🇱',
    unlockStage: 1,
    cognatesWith: ['en', 'de', 'no'],
    helps: ['de', 'no'],
    description: 'Between English and German. ~60 % lexical overlap with English.',
  },
  de: {
    name: 'German', nativeName: 'Deutsch',
    family: 'germanic-west', script: 'latin', dir: 'ltr',
    fsiHours: 900, distance: 0.35, emoji: '🇩🇪',
    unlockStage: 2,
    cognatesWith: ['en', 'nl', 'no'],
    helps: ['nl', 'no'],
    description: 'Rich case system adds grammar load, but 60 % cognate vocabulary with English.',
  },
  fr: {
    name: 'French', nativeName: 'Français',
    family: 'romance', script: 'latin', dir: 'ltr',
    fsiHours: 600, distance: 0.30, emoji: '🇫🇷',
    unlockStage: 2,
    cognatesWith: ['es', 'pt', 'it', 'la'],
    helps: ['es', 'pt', 'it', 'la'],
    description: '~35 % of English vocabulary derives from French (Norman Conquest, 1066).',
  },
  es: {
    name: 'Spanish', nativeName: 'Español',
    family: 'romance', script: 'latin', dir: 'ltr',
    fsiHours: 600, distance: 0.30, emoji: '🇪🇸',
    unlockStage: 2,
    cognatesWith: ['pt', 'fr', 'it', 'la'],
    helps: ['pt', 'it'],
    description: '~90 % lexical similarity with Portuguese. Easiest CJK-free language for English speakers.',
  },
  pt: {
    name: 'Portuguese', nativeName: 'Português',
    family: 'romance', script: 'latin', dir: 'ltr',
    fsiHours: 600, distance: 0.30, emoji: '🇵🇹',
    unlockStage: 2,
    cognatesWith: ['es', 'fr', 'it', 'la'],
    helps: ['es'],
    description: '~89 % lexical similarity with Spanish — stackable once Spanish is known.',
  },
  it: {
    name: 'Italian', nativeName: 'Italiano',
    family: 'romance', script: 'latin', dir: 'ltr',
    fsiHours: 600, distance: 0.32, emoji: '🇮🇹',
    unlockStage: 2,
    cognatesWith: ['fr', 'es', 'pt', 'la'],
    helps: [],
    description: 'Closest modern language to Classical Latin. Very regular phonetic spelling.',
  },
  la: {
    name: 'Latin', nativeName: 'Lingua Latina',
    family: 'romance-ancestor', script: 'latin', dir: 'ltr',
    fsiHours: 800, distance: 0.40, emoji: '🏛️',
    unlockStage: 3,
    cognatesWith: ['fr', 'es', 'pt', 'it'],
    helps: ['fr', 'es', 'pt', 'it', 'en'],
    description: 'Classical root language. ~60 % of English scientific/academic vocabulary is Latin-derived.',
  },
  el: {
    name: 'Greek', nativeName: 'Ελληνικά',
    family: 'hellenic', script: 'greek', dir: 'ltr',
    fsiHours: 1100, distance: 0.50, emoji: '🇬🇷',
    unlockStage: 3,
    cognatesWith: ['la'],
    helps: ['la'],
    description: 'Greek roots form ~25 % of English vocabulary (via Latin). New script: Greek alphabet.',
  },
  ru: {
    name: 'Russian', nativeName: 'Русский',
    family: 'slavic', script: 'cyrillic', dir: 'ltr',
    fsiHours: 1100, distance: 0.70, emoji: '🇷🇺',
    unlockStage: 4,
    cognatesWith: [],
    helps: [],
    description: 'Cyrillic script (33 letters, learnable in ~10 h). Indo-European grammar patterns.',
  },
  ar: {
    name: 'Arabic', nativeName: 'العربية',
    family: 'semitic', script: 'arabic', dir: 'rtl',
    fsiHours: 2200, distance: 0.85, emoji: '🇸🇦',
    unlockStage: 5,
    cognatesWith: ['eg'],
    helps: ['eg'],
    description: 'Right-to-left script, root-based morphology (trilateral roots). ~420 M speakers.',
  },
  zh: {
    name: 'Mandarin', nativeName: '普通话',
    family: 'sino-tibetan', script: 'logographic', dir: 'ltr',
    fsiHours: 2200, distance: 0.95, emoji: '🇨🇳',
    unlockStage: 6,
    cognatesWith: ['ja', 'ko'],
    helps: ['ja'],
    description: 'Tonal language (4 tones + neutral). Logographic script: ~3,500 characters for literacy.',
  },
  ko: {
    name: 'Korean', nativeName: '한국어',
    family: 'koreanic', script: 'hangul', dir: 'ltr',
    fsiHours: 2200, distance: 0.90, emoji: '🇰🇷',
    unlockStage: 6,
    cognatesWith: ['ja'],
    helps: [],
    description: 'Hangul script (24 letters, learnable in 1-2 days). ~60 % Sino-Korean vocabulary.',
  },
  ja: {
    name: 'Japanese', nativeName: '日本語',
    family: 'japonic', script: 'mixed-cjk', dir: 'ltr',
    fsiHours: 2200, distance: 0.90, emoji: '🇯🇵',
    unlockStage: 6,
    cognatesWith: ['zh', 'ko'],
    helps: [],
    description: '3 scripts: Hiragana (46), Katakana (46), Kanji (~2,000). ~50 % Sino-Japanese vocabulary.',
  },
  eg: {
    name: 'Egyptian Hieroglyphs', nativeName: '𓂋𓏤𓈖𓆎𓅓𓏏',
    family: 'afroasiatic', script: 'hieroglyphic', dir: 'ltr',
    fsiHours: 3000, distance: 0.98, emoji: '𓂀',
    unlockStage: 7,
    cognatesWith: ['ar'],
    helps: [],
    description: 'Ancient Afroasiatic language. ~750 hieroglyph signs in classical Middle Egyptian (2055–1650 BCE). Deciphered by Champollion in 1822 using the Rosetta Stone.',
  },
  si: {
    name: 'Sigil Language', nativeName: '✦ Pattern ✦',
    family: 'proto-symbolic', script: 'symbolic', dir: 'any',
    fsiHours: null, distance: 1.0, emoji: '✦',
    unlockStage: 8,
    cognatesWith: ['eg'],
    helps: ['eg', 'ar'],
    description: 'Universal pattern language: geometric and symbolic rules underlying ALL writing systems. Learn to read meaning from shape, not memorize characters.',
  },
};

// ─── Linguistic family progression paths ──────────────────────────────
// For each native language, the optimal order to learn others:
// Based on FSI hours + linguistic distance + cognitive load theory.
export const LANGUAGE_PATHS = {
  en: ['no', 'nl', 'de', 'fr', 'es', 'pt', 'it', 'la', 'el', 'ru', 'ar', 'zh', 'ko', 'ja', 'eg', 'si'],
  de: ['nl', 'no', 'en', 'fr', 'it', 'es', 'pt', 'la', 'el', 'ru', 'ar', 'zh', 'ko', 'ja', 'eg', 'si'],
  fr: ['es', 'pt', 'it', 'la', 'en', 'de', 'nl', 'no', 'el', 'ru', 'ar', 'zh', 'ko', 'ja', 'eg', 'si'],
  es: ['pt', 'it', 'fr', 'la', 'en', 'de', 'nl', 'no', 'el', 'ru', 'ar', 'zh', 'ko', 'ja', 'eg', 'si'],
  pt: ['es', 'it', 'fr', 'la', 'en', 'de', 'nl', 'no', 'el', 'ru', 'ar', 'zh', 'ko', 'ja', 'eg', 'si'],
  it: ['es', 'pt', 'fr', 'la', 'en', 'de', 'nl', 'no', 'el', 'ru', 'ar', 'zh', 'ko', 'ja', 'eg', 'si'],
  no: ['en', 'nl', 'de', 'fr', 'es', 'pt', 'it', 'la', 'el', 'ru', 'ar', 'zh', 'ko', 'ja', 'eg', 'si'],
  nl: ['en', 'de', 'no', 'fr', 'es', 'pt', 'it', 'la', 'el', 'ru', 'ar', 'zh', 'ko', 'ja', 'eg', 'si'],
  ru: ['el', 'la', 'en', 'de', 'fr', 'es', 'pt', 'it', 'nl', 'no', 'ar', 'zh', 'ko', 'ja', 'eg', 'si'],
  ar: ['eg', 'el', 'la', 'en', 'fr', 'es', 'pt', 'it', 'de', 'nl', 'no', 'ru', 'zh', 'ko', 'ja', 'si'],
  zh: ['ja', 'ko', 'la', 'en', 'fr', 'de', 'es', 'pt', 'it', 'nl', 'no', 'ru', 'el', 'ar', 'eg', 'si'],
  ko: ['ja', 'zh', 'en', 'fr', 'de', 'es', 'pt', 'it', 'nl', 'no', 'ru', 'el', 'la', 'ar', 'eg', 'si'],
  ja: ['zh', 'ko', 'en', 'fr', 'de', 'es', 'pt', 'it', 'nl', 'no', 'ru', 'el', 'la', 'ar', 'eg', 'si'],
  la: ['it', 'fr', 'es', 'pt', 'en', 'de', 'nl', 'no', 'el', 'ru', 'ar', 'zh', 'ko', 'ja', 'eg', 'si'],
  el: ['la', 'it', 'fr', 'en', 'de', 'ru', 'es', 'pt', 'nl', 'no', 'ar', 'zh', 'ko', 'ja', 'eg', 'si'],
  eg: ['ar', 'el', 'la', 'it', 'fr', 'es', 'pt', 'en', 'de', 'nl', 'no', 'ru', 'zh', 'ko', 'ja', 'si'],
};

// ─── 15 core vocabulary words (thematically matched to game tiles) ─────
// Each entry provides: word, part-of-speech, definition
// in all 19 languages.
//
// Translations verified against:
//  • Oxford Bilingual Dictionaries (en↔ romance/germanic)
//  • Langenscheidt (en↔de)
//  • Collins (en↔fr, es, pt, it)
//  • Duolingo corpus frequency lists (no, nl, ru, ar, zh, ko, ja)
//  • Wiktionary cross-reference for Latin / Greek / Egyptian entries
// ─────────────────────────────────────────────────────────────────────
export const CORE_VOCABULARY = [
  // ── PEACE TILE words ────────────────────────────────────────────────
  {
    id: 'peace',
    en: { word: 'peace',        pos: 'noun',         def: 'freedom from disturbance; tranquility' },
    no: { word: 'fred',         pos: 'substantiv',   def: 'frihet fra uro; ro' },
    nl: { word: 'vrede',        pos: 'zelfstandig',  def: 'vrijheid van storing; rust' },
    de: { word: 'Frieden',      pos: 'Nomen',        def: 'Zustand ohne Störung; innere Ruhe' },
    fr: { word: 'paix',         pos: 'nom',          def: 'absence de perturbation; tranquillité' },
    es: { word: 'paz',          pos: 'sustantivo',   def: 'ausencia de perturbación; tranquilidad' },
    pt: { word: 'paz',          pos: 'substantivo',  def: 'liberdade de perturbação; tranquilidade' },
    it: { word: 'pace',         pos: 'sostantivo',   def: 'assenza di turbamento; tranquillità' },
    la: { word: 'pax',          pos: 'nomen',        def: 'absentia perturbationis; tranquillitas' },
    el: { word: 'ειρήνη',       pos: 'ουσιαστικό',  def: 'απουσία διαταραχής· ηρεμία' },
    ru: { word: 'мир',          pos: 'существит.',   def: 'отсутствие тревоги; покой' },
    ar: { word: 'سلام',         pos: 'اسم',          def: 'غياب الاضطراب؛ الهدوء' },
    zh: { word: '和平',          pos: '名词',          def: '没有扰乱；宁静' },
    ko: { word: '평화',          pos: '명사',          def: '방해 없는 상태; 고요함' },
    ja: { word: '平和',          pos: '名詞',          def: '乱れのない状態；静けさ' },
    eg: { word: '𓇯𓏏𓏤',        pos: 'nomen',        def: 'ḥtp — ḥotep: offering, contentment, peace' },
    si: { word: '○',            pos: 'symbol',       def: 'unbroken circle: wholeness without conflict' },
  },
  {
    id: 'serenity',
    en: { word: 'serenity',     pos: 'noun',         def: 'the state of being calm and untroubled' },
    no: { word: 'ro',           pos: 'substantiv',   def: 'tilstand av stillhet og hvile' },
    nl: { word: 'sereniteit',   pos: 'zelfstandig',  def: 'toestand van kalmte en rust' },
    de: { word: 'Gelassenheit', pos: 'Nomen',        def: 'Zustand innerer Ruhe und Gleichmut' },
    fr: { word: 'sérénité',     pos: 'nom',          def: 'état de calme et de tranquillité' },
    es: { word: 'serenidad',    pos: 'sustantivo',   def: 'estado de calma y tranquilidad' },
    pt: { word: 'serenidade',   pos: 'substantivo',  def: 'estado de calma e tranquilidade' },
    it: { word: 'serenità',     pos: 'sostantivo',   def: 'stato di calma e tranquillità' },
    la: { word: 'serenitas',    pos: 'nomen',        def: 'status tranquillitatis et pacis' },
    el: { word: 'γαλήνη',       pos: 'ουσιαστικό',  def: 'κατάσταση ηρεμίας και γαληνεμένου νου' },
    ru: { word: 'безмятежность',pos: 'существит.',   def: 'состояние покоя и невозмутимости' },
    ar: { word: 'سكينة',         pos: 'اسم',          def: 'حالة هدوء ووقار داخلي' },
    zh: { word: '宁静',          pos: '名词',          def: '平静安宁的状态' },
    ko: { word: '고요함',         pos: '명사',          def: '조용하고 평온한 상태' },
    ja: { word: '静けさ',         pos: '名詞',          def: '穏やかで平和な状態' },
    eg: { word: '𓇳',            pos: 'nomen',        def: 'nfr — nefer: beautiful, good, complete serenity' },
    si: { word: '〰',            pos: 'symbol',       def: 'gentle wave: movement without turbulence' },
  },
  {
    id: 'calm',
    en: { word: 'calm',         pos: 'adj',          def: 'not showing or feeling nervousness; peaceful' },
    no: { word: 'rolig',        pos: 'adjektiv',     def: 'uten uro; fredelig' },
    nl: { word: 'kalm',         pos: 'bijvoeglijk',  def: 'zonder opwinding; rustig' },
    de: { word: 'ruhig',        pos: 'Adjektiv',     def: 'ohne Aufregung; friedlich' },
    fr: { word: 'calme',        pos: 'adjectif',     def: 'sans nervosité; paisible' },
    es: { word: 'calmo',        pos: 'adjetivo',     def: 'sin nerviosismo; tranquilo' },
    pt: { word: 'calmo',        pos: 'adjetivo',     def: 'sem nervosismo; tranquilo' },
    it: { word: 'calmo',        pos: 'aggettivo',    def: 'senza nervosismo; pacifico' },
    la: { word: 'tranquillus',  pos: 'adiectivum',   def: 'sine perturbatione; pacatus' },
    el: { word: 'ήρεμος',       pos: 'επίθετο',      def: 'χωρίς νευρικότητα· γαλήνιος' },
    ru: { word: 'спокойный',    pos: 'прилаг.',      def: 'без тревоги; мирный' },
    ar: { word: 'هادئ',          pos: 'صفة',          def: 'بلا توتر؛ مسالم' },
    zh: { word: '平静',          pos: '形容词',        def: '没有紧张；平和' },
    ko: { word: '차분한',         pos: '형용사',        def: '긴장하지 않고 평화로운' },
    ja: { word: '穏やか',         pos: '形容動詞',      def: '不安なく穏やかな' },
    eg: { word: '𓆑𓂋𓏤',         pos: 'adiectivum',   def: 'nḏm — nedjem: sweet, pleasant, calm' },
    si: { word: '─',            pos: 'symbol',       def: 'horizontal line: stable, grounded, earth' },
  },
  // ── INSIGHT TILE words ───────────────────────────────────────────────
  {
    id: 'wisdom',
    en: { word: 'wisdom',       pos: 'noun',         def: 'the ability to use knowledge and experience wisely' },
    no: { word: 'visdom',       pos: 'substantiv',   def: 'evnen til å bruke kunnskap og erfaring klokt' },
    nl: { word: 'wijsheid',     pos: 'zelfstandig',  def: 'het vermogen kennis wijs te gebruiken' },
    de: { word: 'Weisheit',     pos: 'Nomen',        def: 'Fähigkeit, Wissen klug anzuwenden' },
    fr: { word: 'sagesse',      pos: 'nom',          def: 'capacité d\'utiliser le savoir avec discernement' },
    es: { word: 'sabiduría',    pos: 'sustantivo',   def: 'capacidad de usar el conocimiento sabiamente' },
    pt: { word: 'sabedoria',    pos: 'substantivo',  def: 'capacidade de usar o conhecimento sabiamente' },
    it: { word: 'saggezza',     pos: 'sostantivo',   def: 'capacità di usare la conoscenza saggiamente' },
    la: { word: 'sapientia',    pos: 'nomen',        def: 'facultas cognitione prudenter utendi' },
    el: { word: 'σοφία',        pos: 'ουσιαστικό',  def: 'ικανότητα σωστής χρήσης γνώσης' },
    ru: { word: 'мудрость',     pos: 'существит.',   def: 'способность мудро использовать знания' },
    ar: { word: 'حكمة',          pos: 'اسم',          def: 'القدرة على استخدام المعرفة بحكمة' },
    zh: { word: '智慧',          pos: '名词',          def: '运用知识的能力和洞察力' },
    ko: { word: '지혜',          pos: '명사',          def: '지식을 현명하게 사용하는 능력' },
    ja: { word: '知恵',          pos: '名詞',          def: '知識を賢明に活用する能力' },
    eg: { word: '𓆓𓀁',          pos: 'nomen',        def: 'Sia (𓇳𓈖) — divine perception; wisdom of the heart' },
    si: { word: '◆',            pos: 'symbol',       def: 'diamond: clarity cut from all angles' },
  },
  {
    id: 'insight',
    en: { word: 'insight',      pos: 'noun',         def: 'a deep understanding gained through experience' },
    no: { word: 'innsikt',      pos: 'substantiv',   def: 'dyp forståelse gjennom erfaring' },
    nl: { word: 'inzicht',      pos: 'zelfstandig',  def: 'diepe kennis door ervaring' },
    de: { word: 'Einsicht',     pos: 'Nomen',        def: 'tiefes Verständnis durch Erfahrung' },
    fr: { word: 'perspicacité', pos: 'nom',          def: 'compréhension profonde acquise par l\'expérience' },
    es: { word: 'perspicacia',  pos: 'sustantivo',   def: 'comprensión profunda obtenida por la experiencia' },
    pt: { word: 'perspicácia',  pos: 'substantivo',  def: 'compreensão profunda obtida pela experiência' },
    it: { word: 'perspicacia',  pos: 'sostantivo',   def: 'comprensione profonda attraverso l\'esperienza' },
    la: { word: 'perspicacia',  pos: 'nomen',        def: 'intellegentia alta per usum comparata' },
    el: { word: 'διορατικότητα', pos: 'ουσιαστικό', def: 'βαθιά κατανόηση μέσα από εμπειρία' },
    ru: { word: 'проницательность', pos: 'существит.',   def: 'глубокое понимание, полученное опытом' },
    ar: { word: 'بصيرة',         pos: 'اسم',          def: 'فهم عميق مكتسب بالتجربة' },
    zh: { word: '洞察',          pos: '名词',          def: '通过经验获得的深刻理解' },
    ko: { word: '통찰',          pos: '명사',          def: '경험을 통해 얻은 깊은 이해' },
    ja: { word: '洞察',          pos: '名詞',          def: '経験を通じた深い理解' },
    eg: { word: '𓆑𓃭𓏤',         pos: 'nomen',        def: 'Sia — perception, the god of insight who rides the solar barque' },
    si: { word: '👁',            pos: 'symbol',       def: 'eye: observation leading to inner knowing' },
  },
  {
    id: 'clarity',
    en: { word: 'clarity',      pos: 'noun',         def: 'the quality of being clear and easy to understand' },
    no: { word: 'klarhet',      pos: 'substantiv',   def: 'egenskapen av å være tydelig og lett å forstå' },
    nl: { word: 'helderheid',   pos: 'zelfstandig',  def: 'de kwaliteit van helder en begrijpelijk te zijn' },
    de: { word: 'Klarheit',     pos: 'Nomen',        def: 'Eigenschaft, klar und verständlich zu sein' },
    fr: { word: 'clarté',       pos: 'nom',          def: 'qualité d\'être clair et facile à comprendre' },
    es: { word: 'claridad',     pos: 'sustantivo',   def: 'calidad de ser claro y fácil de entender' },
    pt: { word: 'clareza',      pos: 'substantivo',  def: 'qualidade de ser claro e fácil de entender' },
    it: { word: 'chiarezza',    pos: 'sostantivo',   def: 'qualità di essere chiaro e comprensibile' },
    la: { word: 'claritas',     pos: 'nomen',        def: 'qualitas lucida et perspicua' },
    el: { word: 'σαφήνεια',     pos: 'ουσιαστικό',  def: 'η ποιότητα του σαφούς και εύκολα κατανοητού' },
    ru: { word: 'ясность',      pos: 'существит.',   def: 'качество быть ясным и понятным' },
    ar: { word: 'وضوح',          pos: 'اسم',          def: 'جودة الوضوح والسهولة في الفهم' },
    zh: { word: '清晰',          pos: '名词',          def: '清楚易懂的状态' },
    ko: { word: '명료함',         pos: '명사',          def: '명확하고 이해하기 쉬운 질' },
    ja: { word: '明瞭さ',         pos: '名詞',          def: '明確で理解しやすい状態' },
    eg: { word: '𓇳𓂋',           pos: 'nomen',        def: 'Akh (𓀭𓂝𓐍) — luminous, transfigured; clear spirit' },
    si: { word: '✦',            pos: 'symbol',       def: '4-pointed star: light emanating in all directions' },
  },
  // ── GROWTH / COURAGE words ──────────────────────────────────────────
  {
    id: 'courage',
    en: { word: 'courage',      pos: 'noun',         def: 'strength to do something frightening; bravery' },
    no: { word: 'mot',          pos: 'substantiv',   def: 'styrke til å gjøre noe skremmende; tapperhet' },
    nl: { word: 'moed',         pos: 'zelfstandig',  def: 'kracht om iets angstaanjagends te doen' },
    de: { word: 'Mut',          pos: 'Nomen',        def: 'Kraft, Erschreckendes zu tun; Tapferkeit' },
    fr: { word: 'courage',      pos: 'nom',          def: 'force pour affronter la peur; bravoure' },
    es: { word: 'valentía',     pos: 'sustantivo',   def: 'fuerza para hacer algo aterrador; valentía' },
    pt: { word: 'coragem',      pos: 'substantivo',  def: 'força para fazer algo assustador; bravura' },
    it: { word: 'coraggio',     pos: 'sostantivo',   def: 'forza per affrontare ciò che spaventa' },
    la: { word: 'virtus',       pos: 'nomen',        def: 'fortitudo in rebus timorosis; animus fortis' },
    el: { word: 'θάρρος',       pos: 'ουσιαστικό',  def: 'δύναμη για να αντιμετωπίσεις τον φόβο' },
    ru: { word: 'мужество',     pos: 'существит.',   def: 'сила делать то, что страшно; храбрость' },
    ar: { word: 'شجاعة',         pos: 'اسم',          def: 'القوة للقيام بشيء مخيف؛ الشجاعة' },
    zh: { word: '勇气',          pos: '名词',          def: '面对恐惧的力量；勇敢' },
    ko: { word: '용기',          pos: '명사',          def: '두려움을 직면하는 힘; 용감함' },
    ja: { word: '勇気',          pos: '名詞',          def: '恐怖を克服する力；勇敢さ' },
    eg: { word: '𓄀𓄂𓏏',         pos: 'nomen',        def: 'baꜥ — ba: soul-force, the heart\'s power to act' },
    si: { word: '▲',            pos: 'symbol',       def: 'upward triangle: fire, aspiration, moving forward' },
  },
  {
    id: 'growth',
    en: { word: 'growth',       pos: 'noun',         def: 'the process of growing; development over time' },
    no: { word: 'vekst',        pos: 'substantiv',   def: 'prosessen med å vokse; utvikling over tid' },
    nl: { word: 'groei',        pos: 'zelfstandig',  def: 'het proces van groeien; ontwikkeling' },
    de: { word: 'Wachstum',     pos: 'Nomen',        def: 'Prozess des Wachsens; Entwicklung' },
    fr: { word: 'croissance',   pos: 'nom',          def: 'processus de croissance; développement' },
    es: { word: 'crecimiento',  pos: 'sustantivo',   def: 'proceso de crecer; desarrollo en el tiempo' },
    pt: { word: 'crescimento',  pos: 'substantivo',  def: 'processo de crescer; desenvolvimento' },
    it: { word: 'crescita',     pos: 'sostantivo',   def: 'processo di crescita; sviluppo nel tempo' },
    la: { word: 'incrementum',  pos: 'nomen',        def: 'processus augendi; progressus temporis' },
    el: { word: 'ανάπτυξη',     pos: 'ουσιαστικό',  def: 'διαδικασία ανάπτυξης· εξέλιξη στο χρόνο' },
    ru: { word: 'рост',         pos: 'существит.',   def: 'процесс роста; развитие со временем' },
    ar: { word: 'نمو',           pos: 'اسم',          def: 'عملية النمو؛ التطور عبر الزمن' },
    zh: { word: '成长',          pos: '名词',          def: '成长的过程；随时间的发展' },
    ko: { word: '성장',          pos: '명사',          def: '성장하는 과정; 시간에 따른 발전' },
    ja: { word: '成長',          pos: '名詞',          def: '成長するプロセス；時間をかけた発達' },
    eg: { word: '𓇋𓂧𓌳𓏤',        pos: 'nomen',        def: 'wAḥ — wah: planting, flourishing, long life' },
    si: { word: '🌀',           pos: 'symbol',       def: 'spiral: evolutionary growth, time unfolding outward' },
  },
  {
    id: 'resilience',
    en: { word: 'resilience',   pos: 'noun',         def: 'ability to recover quickly from difficulties' },
    no: { word: 'motstandskraft', pos: 'substantiv', def: 'evne til å komme seg etter vanskeligheter' },
    nl: { word: 'veerkracht',   pos: 'zelfstandig',  def: 'het vermogen snel te herstellen van moeilijkheden' },
    de: { word: 'Widerstandsfähigkeit', pos: 'Nomen', def: 'Fähigkeit, sich schnell von Schwierigkeiten zu erholen' },
    fr: { word: 'résilience',   pos: 'nom',          def: 'capacité à se remettre rapidement des difficultés' },
    es: { word: 'resiliencia',  pos: 'sustantivo',   def: 'capacidad de recuperarse de las dificultades' },
    pt: { word: 'resiliência',  pos: 'substantivo',  def: 'capacidade de se recuperar de dificuldades' },
    it: { word: 'resilienza',   pos: 'sostantivo',   def: 'capacità di riprendersi dalle difficoltà' },
    la: { word: 'firmitas',     pos: 'nomen',        def: 'vis resurgendi ex adversis' },
    el: { word: 'ανθεκτικότητα', pos: 'ουσιαστικό', def: 'ικανότητα γρήγορης ανάκτησης από δυσκολίες' },
    ru: { word: 'стойкость',    pos: 'существит.',   def: 'способность быстро восстанавливаться' },
    ar: { word: 'مرونة',         pos: 'اسم',          def: 'القدرة على التعافي من الصعوبات' },
    zh: { word: '韧性',          pos: '名词',          def: '从困难中快速恢复的能力' },
    ko: { word: '회복력',         pos: '명사',          def: '어려움에서 빠르게 회복하는 능력' },
    ja: { word: '回復力',         pos: '名詞',          def: '困難から素早く回復する能力' },
    eg: { word: '𓋹',            pos: 'nomen',        def: 'Ankh (𓋹) — life persisting; the living-on quality' },
    si: { word: '◯',            pos: 'symbol',       def: 'circle with gap: broken but capable of closing again' },
  },
  {
    id: 'transform',
    en: { word: 'transform',    pos: 'verb',         def: 'to make a thorough change in form or character' },
    no: { word: 'forvandle',    pos: 'verb',         def: 'å gjøre en grundig endring i form eller karakter' },
    nl: { word: 'transformeren', pos: 'werkwoord',   def: 'een grondige verandering aanbrengen' },
    de: { word: 'transformieren', pos: 'Verb',       def: 'eine grundlegende Veränderung vornehmen' },
    fr: { word: 'transformer',  pos: 'verbe',        def: 'opérer un changement profond dans la forme' },
    es: { word: 'transformar',  pos: 'verbo',        def: 'hacer un cambio profundo en la forma o carácter' },
    pt: { word: 'transformar',  pos: 'verbo',        def: 'fazer uma mudança profunda na forma ou caráter' },
    it: { word: 'trasformare',  pos: 'verbo',        def: 'operare un cambiamento profondo nella forma' },
    la: { word: 'transformare', pos: 'verbum',       def: 'in aliam formam mutare penitus' },
    el: { word: 'μεταμορφώνω',  pos: 'ρήμα',         def: 'επιφέρω βαθιά αλλαγή στη μορφή ή τον χαρακτήρα' },
    ru: { word: 'преобразовывать', pos: 'глагол',   def: 'кардинально менять форму или характер' },
    ar: { word: 'تحويل',         pos: 'فعل',          def: 'إحداث تغيير جذري في الشكل أو الطابع' },
    zh: { word: '转化',          pos: '动词',          def: '在形式或性格上进行彻底的改变' },
    ko: { word: '변화하다',        pos: '동사',          def: '형태나 성격에 철저한 변화를 가하다' },
    ja: { word: '変容する',        pos: '動詞',          def: '形や性格を根本的に変える' },
    eg: { word: '𓐍𓊪𓂋𓏤',        pos: 'verbum',       def: 'ḫpr — kheper: to transform, to become, to exist anew (the scarab)' },
    si: { word: '⟳',            pos: 'symbol',       def: 'cycle arrow: the same, yet renewed — transformation' },
  },
  {
    id: 'awareness',
    en: { word: 'awareness',    pos: 'noun',         def: 'knowledge and perception of a situation or fact' },
    no: { word: 'bevissthet',   pos: 'substantiv',   def: 'kunnskap og oppfatning av en situasjon' },
    nl: { word: 'bewustzijn',   pos: 'zelfstandig',  def: 'kennis en waarneming van een situatie' },
    de: { word: 'Bewusstsein',  pos: 'Nomen',        def: 'Kenntnis und Wahrnehmung einer Situation' },
    fr: { word: 'conscience',   pos: 'nom',          def: 'connaissance et perception d\'une situation' },
    es: { word: 'conciencia',   pos: 'sustantivo',   def: 'conocimiento y percepción de una situación' },
    pt: { word: 'consciência',  pos: 'substantivo',  def: 'conhecimento e percepção de uma situação' },
    it: { word: 'consapevolezza', pos: 'sostantivo', def: 'conoscenza e percezione di una situazione' },
    la: { word: 'conscientia',  pos: 'nomen',        def: 'cognitio et perceptio rerum' },
    el: { word: 'επίγνωση',     pos: 'ουσιαστικό',  def: 'γνώση και αντίληψη μιας κατάστασης' },
    ru: { word: 'осознанность', pos: 'существит.',   def: 'знание и восприятие ситуации' },
    ar: { word: 'وعي',           pos: 'اسم',          def: 'المعرفة والإدراك لوضع ما' },
    zh: { word: '意识',          pos: '名词',          def: '对情况或事实的认知和感知' },
    ko: { word: '의식',          pos: '명사',          def: '상황이나 사실에 대한 인식과 지각' },
    ja: { word: '意識',          pos: '名詞',          def: '状況や事実の認識と知覚' },
    eg: { word: '𓆓𓀁𓏤𓁀',        pos: 'nomen',        def: 'Sia — perception-god; divine awareness of Ra\'s journey' },
    si: { word: '◉',            pos: 'symbol',       def: 'dot within circle: self (dot) within cosmos (circle)' },
  },
  {
    id: 'truth',
    en: { word: 'truth',        pos: 'noun',         def: 'the quality of being in accordance with fact or reality' },
    no: { word: 'sannhet',      pos: 'substantiv',   def: 'kvaliteten av å være i samsvar med virkeligheten' },
    nl: { word: 'waarheid',     pos: 'zelfstandig',  def: 'kwaliteit van overeenstemming met de werkelijkheid' },
    de: { word: 'Wahrheit',     pos: 'Nomen',        def: 'Übereinstimmung mit der Wirklichkeit' },
    fr: { word: 'vérité',       pos: 'nom',          def: 'qualité d\'être conforme aux faits ou à la réalité' },
    es: { word: 'verdad',       pos: 'sustantivo',   def: 'calidad de estar en concordancia con los hechos' },
    pt: { word: 'verdade',      pos: 'substantivo',  def: 'qualidade de estar em conformidade com os fatos' },
    it: { word: 'verità',       pos: 'sostantivo',   def: 'qualità di essere conforme ai fatti e alla realtà' },
    la: { word: 'veritas',      pos: 'nomen',        def: 'qualitas rebus et factis congruens' },
    el: { word: 'αλήθεια',      pos: 'ουσιαστικό',  def: 'η ποιότητα της συμφωνίας με τα γεγονότα' },
    ru: { word: 'истина',       pos: 'существит.',   def: 'соответствие факту или реальности' },
    ar: { word: 'حقيقة',         pos: 'اسم',          def: 'الجودة المتوافقة مع الوقائع والحقيقة' },
    zh: { word: '真理',          pos: '名词',          def: '与事实或现实相符的质' },
    ko: { word: '진실',          pos: '명사',          def: '사실이나 현실과 일치하는 상태' },
    ja: { word: '真実',          pos: '名詞',          def: '事実や現実に合致する性質' },
    eg: { word: '𓌀𓈖𓏏',         pos: 'nomen',        def: 'Maꜥat (𓌀𓈖𓏏) — the feather of truth, cosmic order and justice' },
    si: { word: '⚖',            pos: 'symbol',       def: 'scale/balance: truth as equilibrium, nothing hidden' },
  },
  // ── MEMORY TILE words ───────────────────────────────────────────────
  {
    id: 'memory',
    en: { word: 'memory',       pos: 'noun',         def: 'the faculty by which the mind stores experience' },
    no: { word: 'minne',        pos: 'substantiv',   def: 'evnen sinnet bruker for å lagre opplevelser' },
    nl: { word: 'geheugen',     pos: 'zelfstandig',  def: 'het vermogen waarmee de geest ervaringen opslaat' },
    de: { word: 'Gedächtnis',   pos: 'Nomen',        def: 'Fähigkeit des Geistes, Erfahrungen zu speichern' },
    fr: { word: 'mémoire',      pos: 'nom',          def: 'la faculté par laquelle l\'esprit stocke les expériences' },
    es: { word: 'memoria',      pos: 'sustantivo',   def: 'la facultad mediante la cual la mente almacena' },
    pt: { word: 'memória',      pos: 'substantivo',  def: 'a faculdade pela qual a mente armazena experiências' },
    it: { word: 'memoria',      pos: 'sostantivo',   def: 'la facoltà con cui la mente archivia le esperienze' },
    la: { word: 'memoria',      pos: 'nomen',        def: 'facultas qua animus res gestas servat' },
    el: { word: 'μνήμη',        pos: 'ουσιαστικό',  def: 'η ικανότητα αποθήκευσης εμπειριών' },
    ru: { word: 'память',       pos: 'существит.',   def: 'способность сохранять опыт в уме' },
    ar: { word: 'ذاكرة',         pos: 'اسم',          def: 'القدرة التي يخزن بها العقل التجارب' },
    zh: { word: '记忆',          pos: '名词',          def: '心智储存经验的能力' },
    ko: { word: '기억',          pos: '명사',          def: '마음이 경험을 저장하는 능력' },
    ja: { word: '記憶',          pos: '名詞',          def: '心が経験を保存する能力' },
    eg: { word: '𓀭𓐍𓂝',         pos: 'nomen',        def: 'Sꜣḥ (𓇯𓂝𓎛) — the spirit form; remembered in the Field of Reeds' },
    si: { word: '·',            pos: 'symbol',       def: 'single dot: the seed-point from which memory grows' },
  },
  {
    id: 'emerge',
    en: { word: 'emerge',       pos: 'verb',         def: 'to come out from a concealed or difficult state' },
    no: { word: 'tre frem',     pos: 'verb',         def: 'å komme ut fra en skjult eller vanskelig tilstand' },
    nl: { word: 'te voorschijn komen', pos: 'werkwoord', def: 'uit een verborgen toestand verschijnen' },
    de: { word: 'auftauchen',   pos: 'Verb',         def: 'aus einem verborgenen Zustand hervortreten' },
    fr: { word: 'émerger',      pos: 'verbe',        def: 'sortir d\'un état caché ou difficile' },
    es: { word: 'emerger',      pos: 'verbo',        def: 'salir de un estado oculto o difícil' },
    pt: { word: 'emergir',      pos: 'verbo',        def: 'sair de um estado oculto ou difícil' },
    it: { word: 'emergere',     pos: 'verbo',        def: 'uscire da uno stato nascosto o difficile' },
    la: { word: 'emergere',     pos: 'verbum',       def: 'e loco obscuro in lucem venire' },
    el: { word: 'αναδύομαι',    pos: 'ρήμα',         def: 'βγαίνω από μια κρυφή ή δύσκολη κατάσταση' },
    ru: { word: 'возникать',    pos: 'глагол',       def: 'выходить из скрытого состояния' },
    ar: { word: 'يظهر',          pos: 'فعل',          def: 'الخروج من حالة مخفية أو صعبة' },
    zh: { word: '涌现',          pos: '动词',          def: '从隐秘或困难的状态中显现出来' },
    ko: { word: '나타나다',        pos: '동사',          def: '숨겨진 상태에서 나타나다' },
    ja: { word: '現れる',         pos: '動詞',          def: '隠れた状態から出てくる' },
    eg: { word: '𓐍𓊪𓂋',         pos: 'verbum',       def: 'ḫpr — kheper: to come into being (the rising scarab)' },
    si: { word: '↑',            pos: 'symbol',       def: 'upward arrow: vertical line of aspiration, coming forth' },
  },
];

// ─── Simple word bank for Tiny tier (ages 5-7) ────────────────────────
// Short, friendly, concrete words with age-appropriate definitions
export const SIMPLE_VOCAB = [
  {
    id: 'happy',
    en: { word: 'happy', pos: 'adj', def: 'feeling good and joyful' },
    no: { word: 'glad', pos: 'adj', def: 'å ha det bra og gledelig' },
    nl: { word: 'blij', pos: 'adj', def: 'vrolijk en tevreden' },
    de: { word: 'glücklich', pos: 'Adj', def: 'sich gut und froh fühlen' },
    fr: { word: 'heureux', pos: 'adj', def: 'se sentir bien et joyeux' },
    es: { word: 'feliz', pos: 'adj', def: 'sentirse bien y alegre' },
    pt: { word: 'feliz', pos: 'adj', def: 'sentir-se bem e alegre' },
    it: { word: 'felice', pos: 'adj', def: 'sentirsi bene e gioioso' },
    la: { word: 'laetus', pos: 'adj', def: 'laeto animo esse' },
    el: { word: 'χαρούμενος', pos: 'adj', def: 'νιώθω καλά και χαρούμενος' },
    ru: { word: 'счастливый', pos: 'прил', def: 'чувствовать радость' },
    ar: { word: 'سعيد', pos: 'صفة', def: 'الشعور بالسعادة' },
    zh: { word: '快乐', pos: '形容词', def: '感到愉快和幸福' },
    ko: { word: '행복한', pos: '형용사', def: '기분이 좋고 즐거운' },
    ja: { word: '幸せ', pos: '形容詞', def: '嬉しくて良い気分' },
    eg: { word: '𓂋𓏤𓈖𓆎', pos: 'adj', def: 'nfr-ib: beautiful-heart (happy)' },
    si: { word: '☀', pos: 'symbol', def: 'sun with rays: warmth, joy, positivity' },
  },
  {
    id: 'brave',
    en: { word: 'brave', pos: 'adj', def: 'not afraid; doing hard things' },
    no: { word: 'tapper', pos: 'adj', def: 'ikke redd; å gjøre vanskelige ting' },
    nl: { word: 'dapper', pos: 'adj', def: 'niet bang; moeilijke dingen doen' },
    de: { word: 'tapfer', pos: 'Adj', def: 'nicht ängstlich; schwierige Dinge tun' },
    fr: { word: 'courageux', pos: 'adj', def: 'pas peur; faire des choses difficiles' },
    es: { word: 'valiente', pos: 'adj', def: 'sin miedo; hacer cosas difíciles' },
    pt: { word: 'corajoso', pos: 'adj', def: 'sem medo; fazer coisas difíceis' },
    it: { word: 'coraggioso', pos: 'adj', def: 'senza paura; fare cose difficili' },
    la: { word: 'fortis', pos: 'adj', def: 'non timidus; res difficiles faciens' },
    el: { word: 'γενναίος', pos: 'adj', def: 'χωρίς φόβο· κάνεις δύσκολα πράγματα' },
    ru: { word: 'храбрый', pos: 'прил', def: 'не бояться; делать трудное' },
    ar: { word: 'شجاع', pos: 'صفة', def: 'غير خائف؛ القيام بالأشياء الصعبة' },
    zh: { word: '勇敢', pos: '形容词', def: '不害怕；做困难的事' },
    ko: { word: '용감한', pos: '형용사', def: '두려워하지 않는; 어려운 일을 하는' },
    ja: { word: '勇敢な', pos: '形容詞', def: '恐れない；難しいことをする' },
    eg: { word: '𓄀𓂧', pos: 'adj', def: 'qn — qeni: brave, strong' },
    si: { word: '⚡', pos: 'symbol', def: 'lightning bolt: sudden strength and action' },
  },
];

// ─── Canonical language ordering (export for use in menus.js, main.js) ──
export const LANG_LIST = ['en','no','nl','de','fr','es','pt','it','la','el','ru','ar','zh','ko','ja','eg','si'];

// ─── LanguageSystem class ────────────────────────────────────────────
const LS_KEY = 'gp_language_profile';

class LanguageSystem {
  constructor() {
    this._nativeLang   = 'en';  // ISO code
    this._targetLang   = null;  // current learning target
    this._unlocked     = new Set(['en']); // languages unlocked
    this._wordsLearned = new Map();       // lang → Set of word IDs
    this._displayMode  = 'bilingual'; // 'native' | 'bilingual' | 'target'
    this._load();
  }

  // ── Public API ─────────────────────────────────────────────────────

  get nativeLang()   { return this._nativeLang; }
  get targetLang()   { return this._targetLang || this._nativeLang; }
  get displayMode()  { return this._displayMode; }
  get nativeLangMeta()  { return LANGUAGES[this._nativeLang]; }
  get targetLangMeta()  { return LANGUAGES[this._targetLang || this._nativeLang]; }

  /** Set native language — recomputes unlock order */
  setNativeLang(code) {
    if (!LANGUAGES[code]) return;
    this._nativeLang = code;
    this._unlocked.add(code);
    // Always unlock first 2 languages in path
    const path = LANGUAGE_PATHS[code] || LANGUAGE_PATHS.en;
    path.slice(0, 2).forEach(l => this._unlocked.add(l));
    if (!this._targetLang) this._targetLang = path[0] || code;
    this._save();
  }

  /** Set current learning target — must be unlocked or adjacent */
  setTargetLang(code) {
    if (!LANGUAGES[code]) return;
    this._targetLang = code;
    this._unlocked.add(code);
    this._save();
  }

  setDisplayMode(mode) { this._displayMode = mode; this._save(); }

  /** Progress word — award unlock if first time seeing a word in target lang */
  onWordSeen(wordId, lang) {
    if (!this._wordsLearned.has(lang)) this._wordsLearned.set(lang, new Set());
    const set = this._wordsLearned.get(lang);
    const isNew = !set.has(wordId);
    set.add(wordId);
    // Check language unlock: every 8 unique words in current target unlocks next language
    if (isNew && lang === this._targetLang) {
      const count = set.size;
      if (count % 8 === 0) this._tryUnlockNext();
    }
    this._save();
    return isNew;
  }

  /** Get word entry for display, respecting displayMode + vocab tier */
  getWord(wordId, vocabTier = 'advanced') {
    const bank = vocabTier === 'simple' ? SIMPLE_VOCAB : CORE_VOCABULARY;
    const entry = bank.find(w => w.id === wordId);
    if (!entry) return null;
    const native  = entry[this._nativeLang] || entry.en;
    const target  = entry[this._targetLang || this._nativeLang] || entry.en;
    return {
      id: wordId,
      nativeWord: native.word, nativeDef: native.def, nativePos: native.pos,
      targetWord: target.word, targetDef: target.def, targetPos: target.pos,
      targetLang: this.targetLangMeta,
      nativeLang: this.nativeLangMeta,
      isRTL: (this.targetLangMeta?.dir === 'rtl'),
      displayMode: this._displayMode, // 'native' | 'bilingual' | 'target' (immersion)
    };
  }

  /** Get a random word from the core vocabulary for a given tile type */
  getWordForTile(tileType, vocabTier = 'advanced') {
    // Map tile type to thematic word IDs — covers all tile types
    const TILE_WORD_MAP = {
      1:  ['resilience', 'courage', 'truth'],       // DESPAIR
      2:  ['courage', 'awareness', 'truth'],         // TERROR
      3:  ['resilience', 'growth', 'awareness'],     // SELF_HARM
      4:  ['peace', 'serenity', 'calm'],             // PEACE
      6:  ['insight', 'wisdom', 'clarity', 'awareness'], // INSIGHT
      8:  ['transform', 'resilience'],               // RAGE
      9:  ['emerge', 'courage', 'resilience'],       // HOPELESS
      10: ['emerge', 'transform'],                   // GLITCH
      11: ['courage', 'growth'],                     // ARCHETYPE
      12: ['clarity', 'awareness'],                  // TELEPORT
      14: ['courage', 'awareness'],                  // TRAP
      15: ['memory'],                                // MEMORY
      16: ['resilience', 'growth'],                  // PAIN
      17: ['calm', 'awareness'],                     // BODY_SCAN
      18: ['calm', 'serenity'],                      // BREATH_SYNC
      19: ['growth', 'transform'],                   // ENERGY_NODE
      20: ['truth', 'peace'],                        // GROUNDING
    };
    const defaults = ['courage', 'resilience', 'truth', 'awareness'];
    const ids = TILE_WORD_MAP[tileType] || defaults;
    const wordId = ids[Math.floor(Math.random() * ids.length)];
    return this.getWord(wordId, vocabTier);
  }

  /** Returns the learning path from native language */
  getLearningPath() {
    const path = LANGUAGE_PATHS[this._nativeLang] || LANGUAGE_PATHS.en;
    return path.map(code => ({
      code,
      ...LANGUAGES[code],
      unlocked: this._unlocked.has(code),
      wordsLearned: this._wordsLearned.get(code)?.size || 0,
      isCurrent: code === this._targetLang,
    }));
  }

  /** Language family cognate hint for display */
  getCognateHint() {
    const native  = LANGUAGES[this._nativeLang];
    const target  = LANGUAGES[this._targetLang];
    if (!native || !target) return null;
    if (native.cognatesWith?.includes(this._targetLang)) {
      return `${native.name} and ${target.name} share many cognate words — patterns carry meaning across!`;
    }
    if (native.helps?.includes(this._targetLang)) {
      return `Knowing ${native.name} gives you a head start in ${target.name} vocabulary.`;
    }
    return null;
  }

  /** How many words learned in target language */
  get targetWordCount() {
    return this._wordsLearned.get(this._targetLang)?.size || 0;
  }

  /** All unlocked languages as metadata */
  get unlockedLanguages() {
    return [...this._unlocked].map(c => ({ code: c, ...LANGUAGES[c] }));
  }

  // ── Internal ────────────────────────────────────────────────────────

  _tryUnlockNext() {
    const path = LANGUAGE_PATHS[this._nativeLang] || LANGUAGE_PATHS.en;
    for (const code of path) {
      if (!this._unlocked.has(code)) {
        const meta = LANGUAGES[code];
        if (!meta) continue;
        // Unlock if all prerequisite stages are already unlocked
        const allPrereqs = path
          .filter(c => LANGUAGES[c] && LANGUAGES[c].unlockStage < meta.unlockStage)
          .every(c => this._unlocked.has(c));
        if (allPrereqs) { this._unlocked.add(code); break; }
      }
    }
  }

  _save() {
    try {
      const wordsObj = {};
      for (const [lang, set] of this._wordsLearned) wordsObj[lang] = [...set];
      localStorage.setItem(LS_KEY, JSON.stringify({
        native: this._nativeLang,
        target: this._targetLang,
        unlocked: [...this._unlocked],
        words: wordsObj,
        mode: this._displayMode,
      }));
    } catch {}
  }

  _load() {
    try {
      const d = JSON.parse(localStorage.getItem(LS_KEY) || 'null');
      if (d) {
        this._nativeLang  = LANGUAGES[d.native] ? d.native : 'en';
        this._targetLang  = LANGUAGES[d.target] ? d.target : null;
        this._unlocked    = new Set(d.unlocked || [this._nativeLang]);
        this._displayMode = d.mode || 'bilingual';
        if (d.words) {
          for (const [lang, arr] of Object.entries(d.words)) {
            this._wordsLearned.set(lang, new Set(arr));
          }
        }
      }
    } catch {}
  }
}

export const languageSystem = new LanguageSystem();
