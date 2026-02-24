'use strict';
// ═══════════════════════════════════════════════════════════════════════
//  GLITCH·PEACE — language-content.js
//  Vocabulary for the Language Learning mode.
//
//  LANG1a structure:
//    LANGUAGE_FAMILIES — groups languages by family
//    LANGUAGE_CONTENT  — per-language data with core + byDreamscape vocab
//    getDreamscapeVocab(language, dreamscape) — contextual words first
//
//  Each word entry has exactly these four fields:
//    word    — target-language word/phrase
//    meaning — English meaning
//    ipa     — pronunciation (IPA or romaji syllables)
//    context — full example sentence in target language
// ═══════════════════════════════════════════════════════════════════════

export const LANGUAGE_FAMILIES = {
  romance: ['french', 'spanish'],
  japonic: ['japanese'],
};

export const LANGUAGE_CONTENT = {

  // ─── French ──────────────────────────────────────────────────────────
  french: {
    name: 'French',
    nativeName: 'Français',
    family: 'romance',
    script: 'latin',
    core: [
      // Consciousness / inner life
      { word: 'la conscience',  meaning: 'consciousness',  ipa: '/la kɔ̃sjɑ̃s/',  context: 'La conscience est un outil puissant.' },
      { word: 'la paix',        meaning: 'peace',           ipa: '/la pɛ/',        context: 'La paix commence en soi.' },
      { word: "l'éveil",        meaning: 'awakening',       ipa: '/levɛj/',        context: "L'éveil est un voyage, pas une destination." },
      { word: "l'âme",          meaning: 'soul',            ipa: '/lam/',          context: "L'âme cherche toujours la lumière." },
      { word: 'la sagesse',     meaning: 'wisdom',          ipa: '/la saʒɛs/',     context: 'La sagesse vient avec le temps.' },
      { word: 'le rêve',        meaning: 'dream',           ipa: '/ʁɛv/',          context: 'Le rêve guide nos pas.' },
      { word: 'la lumière',     meaning: 'light',           ipa: '/ly.mjɛʁ/',      context: 'La lumière guide.' },
      { word: "l'esprit",       meaning: 'mind / spirit',   ipa: '/ɛs.pʁi/',       context: "L'esprit s'éveille." },
      // High-frequency verbs
      { word: 'être',           meaning: 'to be',           ipa: '/ɛtʁ/',          context: 'Être ici, maintenant.' },
      { word: 'avoir',          meaning: 'to have',         ipa: '/avwaʁ/',        context: "Avoir la paix de l'esprit." },
      { word: 'voir',           meaning: 'to see',          ipa: '/vwaʁ/',         context: 'Voir clairement.' },
      { word: 'savoir',         meaning: 'to know',         ipa: '/savwaʁ/',       context: 'Savoir sans comprendre.' },
      { word: 'guérir',         meaning: 'to heal',         ipa: '/ɡeʁiʁ/',        context: 'On peut toujours guérir.' },
      { word: 'vouloir',        meaning: 'to want',         ipa: '/vulwaʁ/',       context: "Vouloir, c'est pouvoir." },
      { word: 'pouvoir',        meaning: 'to be able',      ipa: '/puvwaʁ/',       context: 'Tout est possible.' },
      { word: 'sentir',         meaning: 'to feel',         ipa: '/sɑ̃tiʁ/',        context: 'Sentir la terre sous ses pieds.' },
      { word: 'respirer',       meaning: 'to breathe',      ipa: '/ʁɛspiʁe/',      context: 'Respirer profondément.' },
      { word: 'choisir',        meaning: 'to choose',       ipa: '/ʃwaziʁ/',       context: 'Choisir son chemin.' },
      // Time
      { word: 'maintenant',     meaning: 'now',             ipa: '/mɛ̃tnɑ̃/',        context: 'Sois ici, maintenant.' },
      { word: 'toujours',       meaning: 'always',          ipa: '/tuʒuʁ/',        context: "L'espoir est toujours là." },
      { word: 'jamais',         meaning: 'never',           ipa: '/ʒamɛ/',         context: 'Ne dis jamais jamais.' },
      // Numbers
      { word: 'un',             meaning: 'one',             ipa: '/œ̃/',            context: 'Un seul moment suffit.' },
      { word: 'deux',           meaning: 'two',             ipa: '/dø/',           context: "Deux chemins s'ouvrent." },
      { word: 'trois',          meaning: 'three',           ipa: '/tʁwa/',         context: "Trois choix s'offrent à toi." },
      // Colors
      { word: 'rouge',          meaning: 'red',             ipa: '/ʁuʒ/',          context: 'Le rouge du coucher de soleil.' },
      { word: 'bleu',           meaning: 'blue',            ipa: '/blø/',          context: 'Le ciel est bleu.' },
      { word: 'vert',           meaning: 'green',           ipa: '/vɛʁ/',          context: 'La forêt est verte.' },
      // Body / somatic
      { word: 'le corps',       meaning: 'body',            ipa: '/kɔʁ/',          context: 'Le corps parle sa vérité.' },
      { word: 'le cœur',        meaning: 'heart',           ipa: '/kœʁ/',          context: 'Le cœur bat.' },
      { word: 'la voix',        meaning: 'voice',           ipa: '/vwa/',          context: 'La voix du silence.' },
    ],
    byDreamscape: {
      'Void State': [
        { word: 'le vide',      meaning: 'void / emptiness', ipa: '/vid/',         context: 'Le vide est une porte.' },
        { word: "l'infini",     meaning: 'infinity',         ipa: '/ɛ̃fini/',       context: "L'infini nous contient." },
        { word: 'le néant',     meaning: 'nothingness',      ipa: '/neɑ̃/',         context: 'Le néant est calme.' },
        { word: 'le silence',   meaning: 'silence',          ipa: '/si.lɑ̃s/',      context: 'Le silence parle.' },
      ],
      'Forest Cathedral': [
        { word: 'la forêt',     meaning: 'forest',           ipa: '/fɔ.ʁɛ/',       context: 'La forêt respire lentement.' },
        { word: "l'arbre",      meaning: 'tree',             ipa: '/aʁbʁ/',        context: "L'arbre touche le ciel." },
        { word: 'la mousse',    meaning: 'moss',             ipa: '/mus/',         context: 'La mousse recouvre les pierres.' },
        { word: 'la sève',      meaning: 'sap / life force', ipa: '/sɛv/',         context: 'La sève monte en silence.' },
      ],
      'Mountain Dragon Realm': [
        { word: 'la montagne',  meaning: 'mountain',         ipa: '/mɔ̃.taɲ/',      context: 'La montagne porte les nuages.' },
        { word: 'le dragon',    meaning: 'dragon',           ipa: '/dʁaɡɔ̃/',       context: 'Le dragon garde la cime.' },
        { word: 'le sommet',    meaning: 'summit / peak',    ipa: '/sɔmɛ/',        context: 'Le sommet est enveloppé de brume.' },
        { word: 'la force',     meaning: 'strength',         ipa: '/fɔʁs/',        context: 'La force vient du calme.' },
      ],
    },
  },

  // ─── Spanish ─────────────────────────────────────────────────────────
  spanish: {
    name: 'Spanish',
    nativeName: 'Español',
    family: 'romance',
    script: 'latin',
    core: [
      // Consciousness / inner life
      { word: 'la conciencia',  meaning: 'consciousness',   ipa: '/la konˈθjenθja/', context: 'La conciencia es el primer paso.' },
      { word: 'la paz',         meaning: 'peace',            ipa: '/la paθ/',         context: 'La paz comienza adentro.' },
      { word: 'el alma',        meaning: 'soul',             ipa: '/el ˈalma/',       context: 'El alma nunca miente.' },
      { word: 'la sabiduría',   meaning: 'wisdom',           ipa: '/la saβiðuˈɾia/',  context: 'La sabiduría llega con calma.' },
      { word: 'el sueño',       meaning: 'dream',            ipa: '/ˈswe.ɲo/',        context: 'El sueño guía el camino.' },
      { word: 'la luz',         meaning: 'light',            ipa: '/luθ/',            context: 'La luz guía.' },
      { word: 'la mente',       meaning: 'mind',             ipa: '/ˈmen.te/',        context: 'La mente descansa.' },
      // High-frequency verbs
      { word: 'ser',            meaning: 'to be (essence)',  ipa: '/seɾ/',            context: 'Ser, no parecer.' },
      { word: 'estar',          meaning: 'to be (state)',    ipa: '/esˈtaɾ/',         context: 'Estar completamente presente.' },
      { word: 'sanar',          meaning: 'to heal',          ipa: '/saˈnaɾ/',         context: 'Es posible sanar.' },
      { word: 'despertar',      meaning: 'to awaken',        ipa: '/despeɾˈtaɾ/',     context: 'Es hora de despertar.' },
      { word: 'respirar',       meaning: 'to breathe',       ipa: '/respiˈɾaɾ/',      context: 'Respirar es vivir.' },
      { word: 'sentir',         meaning: 'to feel',          ipa: '/senˈtiɾ/',        context: 'Sentir el momento presente.' },
      { word: 'ver',            meaning: 'to see',           ipa: '/beɾ/',            context: 'Ver con claridad.' },
      { word: 'saber',          meaning: 'to know',          ipa: '/saˈβeɾ/',         context: 'Saber escuchar.' },
      { word: 'querer',         meaning: 'to want',          ipa: '/keˈɾeɾ/',         context: 'Querer es poder.' },
      { word: 'poder',          meaning: 'to be able',       ipa: '/poˈðeɾ/',         context: 'Poder cambiar.' },
      { word: 'elegir',         meaning: 'to choose',        ipa: '/eleˈxiɾ/',        context: 'Elegir con sabiduría.' },
      // Time
      { word: 'ahora',          meaning: 'now',              ipa: '/aˈoɾa/',          context: 'Vive ahora.' },
      { word: 'siempre',        meaning: 'always',           ipa: '/ˈsjempɾe/',       context: 'Siempre hay esperanza.' },
      { word: 'nunca',          meaning: 'never',            ipa: '/ˈnunka/',         context: 'Nunca te rindas.' },
      // Numbers
      { word: 'uno',            meaning: 'one',              ipa: '/ˈuno/',           context: 'Un solo momento.' },
      { word: 'dos',            meaning: 'two',              ipa: '/dos/',            context: 'Dos caminos se abren.' },
      { word: 'tres',           meaning: 'three',            ipa: '/tɾes/',           context: 'Tres opciones.' },
      // Colors
      { word: 'rojo',           meaning: 'red',              ipa: '/ˈroxo/',          context: 'El rojo del amanecer.' },
      { word: 'azul',           meaning: 'blue',             ipa: '/aˈθul/',          context: 'El cielo azul.' },
      { word: 'verde',          meaning: 'green',            ipa: '/ˈbeɾðe/',         context: 'El bosque verde.' },
      // Body / somatic
      { word: 'el cuerpo',      meaning: 'body',             ipa: '/el ˈkweɾpo/',     context: 'El cuerpo habla.' },
      { word: 'el corazón',     meaning: 'heart',            ipa: '/ko.ɾaˈθon/',      context: 'El corazón siente.' },
      { word: 'la voz',         meaning: 'voice',            ipa: '/boθ/',            context: 'La voz del silencio.' },
    ],
    byDreamscape: {
      'Void State': [
        { word: 'el vacío',     meaning: 'void / emptiness', ipa: '/baˈθio/',         context: 'El vacío es una puerta.' },
        { word: 'el infinito',  meaning: 'infinity',         ipa: '/infiˈnito/',      context: 'El infinito nos contiene.' },
        { word: 'la nada',      meaning: 'nothingness',      ipa: '/ˈnaða/',          context: 'En la nada, todo existe.' },
        { word: 'el silencio',  meaning: 'silence',          ipa: '/siˈlenθjo/',      context: 'El silencio habla.' },
      ],
      'Forest Cathedral': [
        { word: 'el bosque',    meaning: 'forest',           ipa: '/ˈbos.ke/',        context: 'El bosque respira despacio.' },
        { word: 'el árbol',     meaning: 'tree',             ipa: '/ˈaɾβol/',         context: 'El árbol toca el cielo.' },
        { word: 'el musgo',     meaning: 'moss',             ipa: '/ˈmusɣo/',         context: 'El musgo cubre las piedras.' },
        { word: 'la raíz',      meaning: 'root',             ipa: '/raˈiθ/',          context: 'La raíz sostiene todo.' },
      ],
      'Mountain Dragon Realm': [
        { word: 'la montaña',   meaning: 'mountain',         ipa: '/monˈta.ɲa/',      context: 'La montaña guarda secretos.' },
        { word: 'el dragón',    meaning: 'dragon',           ipa: '/dɾaˈɣon/',        context: 'El dragón guarda la cima.' },
        { word: 'la cima',      meaning: 'summit / peak',    ipa: '/ˈθima/',          context: 'La cima está entre las nubes.' },
        { word: 'la fuerza',    meaning: 'strength',         ipa: '/ˈfweɾθa/',        context: 'La fuerza nace en calma.' },
      ],
    },
  },

  // ─── Japanese ────────────────────────────────────────────────────────
  japanese: {
    name: 'Japanese',
    nativeName: '日本語',
    family: 'japonic',
    script: 'mixed',
    core: [
      // Consciousness / inner life
      { word: '意識 (ishiki)',    meaning: 'consciousness',  ipa: 'i·shi·ki',       context: '意識を高める。' },
      { word: '平和 (heiwa)',     meaning: 'peace',          ipa: 'hei·wa',         context: '平和な心を保つ。' },
      { word: '魂 (tamashii)',    meaning: 'soul',           ipa: 'ta·ma·shi·i',    context: '魂の声を聞く。' },
      { word: '知恵 (chie)',      meaning: 'wisdom',         ipa: 'chi·e',          context: '知恵は経験から生まれる。' },
      { word: '癒し (iyashi)',    meaning: 'healing',        ipa: 'i·ya·shi',       context: '心の癒しを求める。' },
      { word: '目覚め (mezame)',  meaning: 'awakening',      ipa: 'me·za·me',       context: '新しい目覚めが来た。' },
      { word: '道 (michi)',       meaning: 'path / way',     ipa: 'mi·chi',         context: '自分の道を歩む。' },
      { word: '夢 (yume)',        meaning: 'dream',          ipa: 'yu·me',          context: '夢を見る。' },
      { word: '光 (hikari)',      meaning: 'light',          ipa: 'hi·ka·ri',       context: '光が差す。' },
      { word: '心 (kokoro)',      meaning: 'heart / mind',   ipa: 'ko·ko·ro',       context: '心が静かだ。' },
      // High-frequency verbs
      { word: '呼吸 (kokyū)',     meaning: 'breathing',      ipa: 'ko·kyū',         context: '深い呼吸をする。' },
      { word: '感じる (kanjiru)', meaning: 'to feel',        ipa: 'kan·ji·ru',      context: '今を感じる。' },
      { word: '選ぶ (erabu)',     meaning: 'to choose',      ipa: 'e·ra·bu',        context: '自分で選ぶ。' },
      { word: '見る (miru)',      meaning: 'to see',         ipa: 'mi·ru',          context: '星を見る。' },
      { word: '知る (shiru)',     meaning: 'to know',        ipa: 'shi·ru',         context: '真実を知る。' },
      { word: '歩く (aruku)',     meaning: 'to walk',        ipa: 'a·ru·ku',        context: 'ゆっくり歩く。' },
      // Time
      { word: '今 (ima)',         meaning: 'now',            ipa: 'i·ma',           context: '今ここにいる。' },
      { word: 'いつも (itsumo)', meaning: 'always',          ipa: 'i·tsu·mo',       context: 'いつも前を向く。' },
      { word: '決して (kesshite)', meaning: 'never',         ipa: 'ke·sshi·te',     context: '決して諦めない。' },
      // Numbers
      { word: '一 (ichi)',        meaning: 'one',            ipa: 'i·chi',          context: '一つの道がある。' },
      { word: '二 (ni)',          meaning: 'two',            ipa: 'ni',             context: '二つの選択がある。' },
      { word: '三 (san)',         meaning: 'three',          ipa: 'san',            context: '三つの答えがある。' },
      // Colors
      { word: '赤 (aka)',         meaning: 'red',            ipa: 'a·ka',           context: '赤い空が広がる。' },
      { word: '青 (ao)',          meaning: 'blue',           ipa: 'a·o',            context: '青い海が続く。' },
      { word: '緑 (midori)',      meaning: 'green',          ipa: 'mi·do·ri',       context: '緑の森が広がる。' },
      // Body / somatic
      { word: '体 (karada)',      meaning: 'body',           ipa: 'ka·ra·da',       context: '体の声を聞く。' },
      { word: '空 (sora)',        meaning: 'sky',            ipa: 'so·ra',          context: '空は広い。' },
      { word: '森 (mori)',        meaning: 'forest',         ipa: 'mo·ri',          context: '森は静かだ。' },
      { word: '声 (koe)',         meaning: 'voice',          ipa: 'ko·e',           context: '声が響く。' },
      { word: '息 (iki)',         meaning: 'breath',         ipa: 'i·ki',           context: '深い息を吸う。' },
    ],
    byDreamscape: {
      'Void State': [
        { word: '虚空 (kokū)',    meaning: 'void / emptiness', ipa: 'ko·kū',        context: '虚空に溶けていく。' },
        { word: '無限 (mugen)',   meaning: 'infinity',         ipa: 'mu·gen',       context: '無限の宇宙を感じる。' },
        { word: '無 (mu)',        meaning: 'nothingness',      ipa: 'mu',           context: '無の境地に達する。' },
        { word: '静寂 (seijaku)', meaning: 'silence / stillness', ipa: 'sei·ja·ku', context: '静寂が広がる。' },
      ],
      'Forest Cathedral': [
        { word: '木 (ki)',        meaning: 'tree',             ipa: 'ki',           context: '木が空に伸びる。' },
        { word: '苔 (koke)',      meaning: 'moss',             ipa: 'ko·ke',        context: '苔が岩を覆う。' },
        { word: '根 (ne)',        meaning: 'root',             ipa: 'ne',           context: '根が大地に広がる。' },
        { word: '葉 (ha)',        meaning: 'leaf',             ipa: 'ha',           context: '葉が風に揺れる。' },
      ],
      'Mountain Dragon Realm': [
        { word: '山 (yama)',      meaning: 'mountain',         ipa: 'ya·ma',        context: '山は高くそびえる。' },
        { word: '龍 (ryū)',       meaning: 'dragon',           ipa: 'ryū',          context: '龍が空を舞う。' },
        { word: '頂 (itadaki)',   meaning: 'summit / peak',    ipa: 'i·ta·da·ki',   context: '頂に近づく。' },
        { word: '嵐 (arashi)',    meaning: 'storm',            ipa: 'a·ra·shi',     context: '嵐の中に静けさがある。' },
      ],
    },
  },
};

/**
 * Returns contextual dreamscape words first, then core words.
 * @param {string} language - e.g. 'french', 'spanish', 'japanese'
 * @param {string} dreamscape - e.g. 'Forest Cathedral'
 * @returns {Array} combined word list, contextual words first
 */
export function getDreamscapeVocab(language, dreamscape) {
  const lang = LANGUAGE_CONTENT[language];
  if (!lang) return [];
  const contextual = lang.byDreamscape?.[dreamscape] || [];
  return [...contextual, ...lang.core];
}

// ─── Backward-compatible helpers (used by language-mode.js) ──────────

const CODE_TO_NAME = { fr: 'french', es: 'spanish', ja: 'japanese' };

/**
 * Get all words for a language as a flat array with id/example fields
 * added for backward compatibility.
 * @param {string} langCode - e.g. 'fr', 'es', 'ja', or full name
 * @returns {Array} words array
 */
export function getWords(langCode) {
  const name = CODE_TO_NAME[langCode] || langCode;
  const lang = LANGUAGE_CONTENT[name];
  if (!lang) return [];

  const seen = new Set();
  const result = [];

  const addWords = (words, prefix) => {
    words.forEach((w, i) => {
      if (seen.has(w.word)) return;
      seen.add(w.word);
      result.push({ ...w, id: `${langCode}_${prefix}_${i}`, example: w.context });
    });
  };

  addWords(lang.core, 'core');
  for (const [scene, words] of Object.entries(lang.byDreamscape || {})) {
    addWords(words, scene.replace(/\s+/g, '_'));
  }
  return result;
}

/**
 * Get words filtered by dreamscape context label.
 * @param {string} langCode
 * @param {string} dreamscape - dreamscape name key
 * @returns {Array}
 */
export function getWordsByDreamscape(langCode, dreamscape) {
  const name = CODE_TO_NAME[langCode] || langCode;
  const lang = LANGUAGE_CONTENT[name];
  if (!lang) return [];
  return (lang.byDreamscape?.[dreamscape] || []).map((w, i) => ({
    ...w,
    id: `${langCode}_${dreamscape.replace(/\s+/g, '_')}_${i}`,
    example: w.context,
  }));
}

/**
 * Get random distractors (wrong answers) for a quiz item.
 * @param {string} langCode
 * @param {string} correctId - id of the correct word
 * @param {number} count - how many distractors
 * @returns {string[]} array of distractor meanings
 */
export function getDistractors(langCode, correctId, count = 3) {
  const words = getWords(langCode);
  const correct = words.find(w => w.id === correctId);
  if (!correct) return [];
  const others = words.filter(w => w.id !== correctId);
  const shuffled = others.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map(w => w.meaning);
}

/** Supported language codes for the Language Learning mode */
export const LANG_LEARNING_CODES = ['fr', 'es', 'ja'];
