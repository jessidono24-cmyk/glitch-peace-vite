'use strict';
// ═══════════════════════════════════════════════════════════════════════
//  GLITCH·PEACE — language-content.js
//  Vocabulary for the Language Learning mode.
//  Words organized by dreamscape context (not alphabetically) so they
//  appear naturally as ambient labels in the immersion layer.
//
//  Each entry:
//    id        — unique string key for FSRS deck
//    word      — target-language word
//    meaning   — English meaning
//    context   — dreamscape theme ('nature','urban','sky','dream','body','action')
//    ipa       — pronunciation (IPA notation)
//    example   — short sentence using the word
// ═══════════════════════════════════════════════════════════════════════

export const LANGUAGE_CONTENT = {

  // ─── French ────────────────────────────────────────────────────────
  fr: {
    name: 'French',
    nativeName: 'Français',
    emoji: '🇫🇷',
    words: [
      // Nature / landscape
      { id: 'fr_eau',       word: 'eau',         meaning: 'water',       context: 'nature',  ipa: '/o/',           example: "L'eau coule doucement." },
      { id: 'fr_forêt',     word: 'forêt',       meaning: 'forest',      context: 'nature',  ipa: '/fɔ.ʁɛ/',       example: 'La forêt est calme.' },
      { id: 'fr_montagne',  word: 'montagne',    meaning: 'mountain',    context: 'nature',  ipa: '/mɔ̃.taɲ/',      example: 'La montagne est haute.' },
      { id: 'fr_ciel',      word: 'ciel',        meaning: 'sky',         context: 'sky',     ipa: '/sjɛl/',         example: 'Le ciel est bleu.' },
      { id: 'fr_étoile',    word: 'étoile',      meaning: 'star',        context: 'sky',     ipa: '/e.twal/',       example: "L'étoile brille la nuit." },
      { id: 'fr_lune',      word: 'lune',        meaning: 'moon',        context: 'sky',     ipa: '/lyn/',          example: 'La lune est pleine.' },
      { id: 'fr_soleil',    word: 'soleil',      meaning: 'sun',         context: 'sky',     ipa: '/sɔ.lɛj/',       example: 'Le soleil se lève.' },
      { id: 'fr_vent',      word: 'vent',        meaning: 'wind',        context: 'nature',  ipa: '/vɑ̃/',           example: 'Le vent souffle fort.' },
      { id: 'fr_feu',       word: 'feu',         meaning: 'fire',        context: 'nature',  ipa: '/fø/',           example: 'Le feu réchauffe.' },
      { id: 'fr_terre',     word: 'terre',       meaning: 'earth / land',context: 'nature',  ipa: '/tɛʁ/',          example: 'La terre est fertile.' },
      // Dream / inner world
      { id: 'fr_rêve',      word: 'rêve',        meaning: 'dream',       context: 'dream',   ipa: '/ʁɛv/',          example: "C'est un beau rêve." },
      { id: 'fr_lumière',   word: 'lumière',     meaning: 'light',       context: 'dream',   ipa: '/ly.mjɛʁ/',      example: 'La lumière guide.' },
      { id: 'fr_ombre',     word: 'ombre',       meaning: 'shadow',      context: 'dream',   ipa: '/ɔ̃bʁ/',          example: "L'ombre s'allonge." },
      { id: 'fr_silence',   word: 'silence',     meaning: 'silence',     context: 'dream',   ipa: '/si.lɑ̃s/',       example: 'Le silence est apaisant.' },
      { id: 'fr_paix',      word: 'paix',        meaning: 'peace',       context: 'dream',   ipa: '/pɛ/',           example: 'La paix intérieure.' },
      // Action / movement
      { id: 'fr_marcher',   word: 'marcher',     meaning: 'to walk',     context: 'action',  ipa: '/maʁ.ʃe/',       example: 'Je marche lentement.' },
      { id: 'fr_courir',    word: 'courir',      meaning: 'to run',      context: 'action',  ipa: '/ku.ʁiʁ/',       example: 'Il court vite.' },
      { id: 'fr_voir',      word: 'voir',        meaning: 'to see',      context: 'action',  ipa: '/vwaʁ/',         example: 'Je vois les étoiles.' },
      { id: 'fr_écouter',   word: 'écouter',     meaning: 'to listen',   context: 'action',  ipa: '/e.ku.te/',      example: 'Écoute la forêt.' },
      { id: 'fr_sentir',    word: 'sentir',      meaning: 'to feel/smell',context: 'body',   ipa: '/sɑ̃.tiʁ/',       example: 'Je sens la pluie.' },
      // Body / self
      { id: 'fr_cœur',      word: 'cœur',        meaning: 'heart',       context: 'body',    ipa: '/kœʁ/',          example: 'Le cœur bat.' },
      { id: 'fr_main',      word: 'main',        meaning: 'hand',        context: 'body',    ipa: '/mɛ̃/',           example: 'La main touche.' },
      { id: 'fr_voix',      word: 'voix',        meaning: 'voice',       context: 'body',    ipa: '/vwa/',          example: 'Sa voix est douce.' },
      { id: 'fr_esprit',    word: 'esprit',      meaning: 'mind / spirit',context: 'dream',  ipa: '/ɛs.pʁi/',       example: "L'esprit s'éveille." },
      // Urban / everyday
      { id: 'fr_ville',     word: 'ville',       meaning: 'city',        context: 'urban',   ipa: '/vil/',          example: 'La ville dort.' },
      { id: 'fr_maison',    word: 'maison',      meaning: 'house / home',context: 'urban',   ipa: '/mɛ.zɔ̃/',        example: 'La maison est grande.' },
      { id: 'fr_porte',     word: 'porte',       meaning: 'door',        context: 'urban',   ipa: '/pɔʁt/',         example: 'La porte est ouverte.' },
      { id: 'fr_chemin',    word: 'chemin',      meaning: 'path / way',  context: 'nature',  ipa: '/ʃə.mɛ̃/',        example: 'Le chemin mène loin.' },
      { id: 'fr_pont',      word: 'pont',        meaning: 'bridge',      context: 'urban',   ipa: '/pɔ̃/',           example: 'Le pont traverse la rivière.' },
      { id: 'fr_nuit',      word: 'nuit',        meaning: 'night',       context: 'sky',     ipa: '/nɥi/',          example: 'La nuit est profonde.' },
      { id: 'fr_aube',      word: 'aube',        meaning: 'dawn',        context: 'sky',     ipa: '/ob/',           example: "L'aube arrive doucement." },
      { id: 'fr_nuage',     word: 'nuage',       meaning: 'cloud',       context: 'sky',     ipa: '/nɥaʒ/',         example: 'Le nuage passe.' },
    ],
  },

  // ─── Spanish ───────────────────────────────────────────────────────
  es: {
    name: 'Spanish',
    nativeName: 'Español',
    emoji: '🇪🇸',
    words: [
      // Nature
      { id: 'es_agua',      word: 'agua',        meaning: 'water',       context: 'nature',  ipa: '/ˈa.ɣwa/',       example: 'El agua fluye.' },
      { id: 'es_bosque',    word: 'bosque',      meaning: 'forest',      context: 'nature',  ipa: '/ˈbos.ke/',      example: 'El bosque es oscuro.' },
      { id: 'es_montaña',   word: 'montaña',     meaning: 'mountain',    context: 'nature',  ipa: '/monˈta.ɲa/',    example: 'La montaña es alta.' },
      { id: 'es_cielo',     word: 'cielo',       meaning: 'sky',         context: 'sky',     ipa: '/ˈθje.lo/',      example: 'El cielo es azul.' },
      { id: 'es_estrella',  word: 'estrella',    meaning: 'star',        context: 'sky',     ipa: '/esˈtɾe.ʎa/',    example: 'La estrella brilla.' },
      { id: 'es_luna',      word: 'luna',        meaning: 'moon',        context: 'sky',     ipa: '/ˈlu.na/',       example: 'La luna llena ilumina.' },
      { id: 'es_sol',       word: 'sol',         meaning: 'sun',         context: 'sky',     ipa: '/sol/',          example: 'El sol calienta.' },
      { id: 'es_viento',    word: 'viento',      meaning: 'wind',        context: 'nature',  ipa: '/ˈbjen.to/',     example: 'El viento sopla.' },
      { id: 'es_fuego',     word: 'fuego',       meaning: 'fire',        context: 'nature',  ipa: '/ˈfwe.ɣo/',      example: 'El fuego arde.' },
      { id: 'es_tierra',    word: 'tierra',      meaning: 'earth / land',context: 'nature',  ipa: '/ˈtje.ra/',      example: 'La tierra es fértil.' },
      // Dream / inner
      { id: 'es_sueño',     word: 'sueño',       meaning: 'dream / sleep',context: 'dream', ipa: '/ˈswe.ɲo/',      example: 'Tengo un sueño.' },
      { id: 'es_luz',       word: 'luz',         meaning: 'light',       context: 'dream',   ipa: '/luθ/',          example: 'La luz guía.' },
      { id: 'es_sombra',    word: 'sombra',      meaning: 'shadow',      context: 'dream',   ipa: '/ˈsom.bɾa/',     example: 'La sombra se alarga.' },
      { id: 'es_silencio',  word: 'silencio',    meaning: 'silence',     context: 'dream',   ipa: '/siˈlen.θjo/',   example: 'El silencio es profundo.' },
      { id: 'es_paz',       word: 'paz',         meaning: 'peace',       context: 'dream',   ipa: '/paθ/',          example: 'La paz interior.' },
      // Action
      { id: 'es_caminar',   word: 'caminar',     meaning: 'to walk',     context: 'action',  ipa: '/ka.miˈnaɾ/',    example: 'Camino despacio.' },
      { id: 'es_correr',    word: 'correr',      meaning: 'to run',      context: 'action',  ipa: '/koˈreɾ/',       example: 'Corro rápido.' },
      { id: 'es_ver',       word: 'ver',         meaning: 'to see',      context: 'action',  ipa: '/beɾ/',          example: 'Veo las estrellas.' },
      { id: 'es_escuchar',  word: 'escuchar',    meaning: 'to listen',   context: 'action',  ipa: '/es.kuˈt͡ʃaɾ/',   example: 'Escucha el bosque.' },
      { id: 'es_sentir',    word: 'sentir',      meaning: 'to feel',     context: 'body',    ipa: '/senˈtiɾ/',      example: 'Siento la lluvia.' },
      // Body
      { id: 'es_corazón',   word: 'corazón',     meaning: 'heart',       context: 'body',    ipa: '/ko.ɾaˈθon/',    example: 'El corazón late.' },
      { id: 'es_mano',      word: 'mano',        meaning: 'hand',        context: 'body',    ipa: '/ˈma.no/',       example: 'La mano toca.' },
      { id: 'es_voz',       word: 'voz',         meaning: 'voice',       context: 'body',    ipa: '/boθ/',          example: 'Su voz es suave.' },
      { id: 'es_mente',     word: 'mente',       meaning: 'mind',        context: 'dream',   ipa: '/ˈmen.te/',      example: 'La mente descansa.' },
      // Urban
      { id: 'es_ciudad',    word: 'ciudad',      meaning: 'city',        context: 'urban',   ipa: '/θjuˈðað/',      example: 'La ciudad duerme.' },
      { id: 'es_casa',      word: 'casa',        meaning: 'house / home',context: 'urban',   ipa: '/ˈka.sa/',       example: 'La casa es cálida.' },
      { id: 'es_puerta',    word: 'puerta',      meaning: 'door',        context: 'urban',   ipa: '/ˈpweɾ.ta/',     example: 'La puerta está abierta.' },
      { id: 'es_camino',    word: 'camino',      meaning: 'path / road', context: 'nature',  ipa: '/kaˈmi.no/',     example: 'El camino es largo.' },
      { id: 'es_puente',    word: 'puente',      meaning: 'bridge',      context: 'urban',   ipa: '/ˈpwen.te/',     example: 'El puente es viejo.' },
      { id: 'es_noche',     word: 'noche',       meaning: 'night',       context: 'sky',     ipa: '/ˈno.t͡ʃe/',      example: 'La noche es oscura.' },
      { id: 'es_amanecer',  word: 'amanecer',    meaning: 'dawn / sunrise',context: 'sky',   ipa: '/a.ma.neˈθeɾ/',  example: 'El amanecer llega.' },
      { id: 'es_nube',      word: 'nube',        meaning: 'cloud',       context: 'sky',     ipa: '/ˈnu.βe/',       example: 'La nube pasa.' },
    ],
  },

  // ─── Japanese ──────────────────────────────────────────────────────
  ja: {
    name: 'Japanese',
    nativeName: '日本語',
    emoji: '🇯🇵',
    words: [
      // Nature
      { id: 'ja_mizu',      word: '水 (mizu)',    meaning: 'water',       context: 'nature',  ipa: '/mi.zɯ/',        example: '水が流れる。' },
      { id: 'ja_mori',      word: '森 (mori)',    meaning: 'forest',      context: 'nature',  ipa: '/mo.ɾi/',        example: '森は静かだ。' },
      { id: 'ja_yama',      word: '山 (yama)',    meaning: 'mountain',    context: 'nature',  ipa: '/ja.ma/',        example: '山は高い。' },
      { id: 'ja_sora',      word: '空 (sora)',    meaning: 'sky',         context: 'sky',     ipa: '/so.ɾa/',        example: '空は青い。' },
      { id: 'ja_hoshi',     word: '星 (hoshi)',   meaning: 'star',        context: 'sky',     ipa: '/ho.ɕi/',        example: '星が輝く。' },
      { id: 'ja_tsuki',     word: '月 (tsuki)',   meaning: 'moon',        context: 'sky',     ipa: '/tsɯ.ki/',       example: '月が丸い。' },
      { id: 'ja_taiyou',    word: '太陽 (taiyō)', meaning: 'sun',         context: 'sky',     ipa: '/ta.i.joː/',     example: '太陽が昇る。' },
      { id: 'ja_kaze',      word: '風 (kaze)',    meaning: 'wind',        context: 'nature',  ipa: '/ka.ze/',        example: '風が吹く。' },
      { id: 'ja_hi',        word: '火 (hi)',      meaning: 'fire',        context: 'nature',  ipa: '/çi/',           example: '火が燃える。' },
      { id: 'ja_tsuchi',    word: '土 (tsuchi)',  meaning: 'earth / soil',context: 'nature',  ipa: '/tsɯ.t͡ɕi/',     example: '土が暖かい。' },
      // Dream / inner
      { id: 'ja_yume',      word: '夢 (yume)',    meaning: 'dream',       context: 'dream',   ipa: '/jɯ.me/',        example: '夢を見る。' },
      { id: 'ja_hikari',    word: '光 (hikari)',  meaning: 'light',       context: 'dream',   ipa: '/çi.ka.ɾi/',     example: '光が差す。' },
      { id: 'ja_kage',      word: '影 (kage)',    meaning: 'shadow',      context: 'dream',   ipa: '/ka.ɡe/',        example: '影が伸びる。' },
      { id: 'ja_shizukesa', word: '静けさ',       meaning: 'silence / stillness', context: 'dream', ipa: '/ɕi.zɯ.ke.sa/', example: '静けさが広がる。' },
      { id: 'ja_heiwa',     word: '平和 (heiwa)', meaning: 'peace',       context: 'dream',   ipa: '/he.i.wa/',      example: '平和を願う。' },
      // Action
      { id: 'ja_aruku',     word: '歩く (aruku)', meaning: 'to walk',     context: 'action',  ipa: '/a.ɾɯ.kɯ/',     example: 'ゆっくり歩く。' },
      { id: 'ja_hashiru',   word: '走る (hashiru)',meaning: 'to run',     context: 'action',  ipa: '/ha.ɕi.ɾɯ/',    example: '速く走る。' },
      { id: 'ja_miru',      word: '見る (miru)',  meaning: 'to see / look',context: 'action', ipa: '/mi.ɾɯ/',        example: '星を見る。' },
      { id: 'ja_kiku',      word: '聞く (kiku)',  meaning: 'to listen',   context: 'action',  ipa: '/ki.kɯ/',        example: '音を聞く。' },
      { id: 'ja_kanjiru',   word: '感じる (kanjiru)',meaning: 'to feel',  context: 'body',    ipa: '/kan.dʑi.ɾɯ/',   example: '風を感じる。' },
      // Body
      { id: 'ja_kokoro',    word: '心 (kokoro)',  meaning: 'heart / mind',context: 'body',    ipa: '/ko.ko.ɾo/',     example: '心が静かだ。' },
      { id: 'ja_te',        word: '手 (te)',      meaning: 'hand',        context: 'body',    ipa: '/te/',           example: '手が触れる。' },
      { id: 'ja_koe',       word: '声 (koe)',     meaning: 'voice',       context: 'body',    ipa: '/ko.e/',         example: '声が響く。' },
      { id: 'ja_tamashii',  word: '魂 (tamashii)',meaning: 'soul / spirit',context: 'dream',  ipa: '/ta.ma.ɕiː/',    example: '魂が目覚める。' },
      // Urban / everyday
      { id: 'ja_machi',     word: '町 (machi)',   meaning: 'town / city', context: 'urban',   ipa: '/ma.t͡ɕi/',       example: '町は静かだ。' },
      { id: 'ja_ie',        word: '家 (ie)',      meaning: 'house / home',context: 'urban',   ipa: '/i.e/',          example: '家に帰る。' },
      { id: 'ja_tobira',    word: '扉 (tobira)',  meaning: 'door / gate', context: 'urban',   ipa: '/to.bi.ɾa/',     example: '扉が開く。' },
      { id: 'ja_michi',     word: '道 (michi)',   meaning: 'path / road / way', context: 'nature', ipa: '/mi.t͡ɕi/',  example: '道が続く。' },
      { id: 'ja_hashi',     word: '橋 (hashi)',   meaning: 'bridge',      context: 'urban',   ipa: '/ha.ɕi/',        example: '橋を渡る。' },
      { id: 'ja_yoru',      word: '夜 (yoru)',    meaning: 'night',       context: 'sky',     ipa: '/jo.ɾɯ/',        example: '夜は深い。' },
      { id: 'ja_yoake',     word: '夜明け (yoake)',meaning: 'dawn',       context: 'sky',     ipa: '/jo.a.ke/',      example: '夜明けが来る。' },
      { id: 'ja_kumo',      word: '雲 (kumo)',    meaning: 'cloud',       context: 'sky',     ipa: '/kɯ.mo/',        example: '雲が流れる。' },
    ],
  },
};

/**
 * Get all words for a language as a flat array.
 * @param {string} langCode - e.g. 'fr', 'es', 'ja'
 * @returns {Array} words array or []
 */
export function getWords(langCode) {
  return LANGUAGE_CONTENT[langCode]?.words || [];
}

/**
 * Get words filtered by dreamscape context.
 * @param {string} langCode
 * @param {string} context - 'nature','sky','dream','body','action','urban'
 * @returns {Array}
 */
export function getWordsByContext(langCode, context) {
  return getWords(langCode).filter(w => w.context === context);
}

/**
 * Get random distractors (wrong answers) for a quiz item.
 * Returns 3 other meanings from the same language that are NOT the correct answer.
 * @param {string} langCode
 * @param {string} correctId - id of the correct word
 * @param {number} count - how many distractors
 * @returns {string[]} array of distractor meanings
 */
export function getDistractors(langCode, correctId, count = 3) {
  const words   = getWords(langCode);
  const correct = words.find(w => w.id === correctId);
  if (!correct) return [];
  const others  = words.filter(w => w.id !== correctId);
  const shuffled = others.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map(w => w.meaning);
}

/** Supported language codes for the Language Learning mode */
export const LANG_LEARNING_CODES = ['fr', 'es', 'ja'];
