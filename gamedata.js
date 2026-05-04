// ===== gamedata.js =====
// チヌクエスト 全データ定義

// ===== キャラクター =====
export const CHARS = [
  {
    id: 'chinu', name: 'チヌ', icon: '🐟', attr: 'fire',
    baseAtk: 5, baseHp: 50,
    lapAtk: 3, lapHp: 5,
    special: '周回ごとに全ステータス+1（他キャラより多く成長）',
    desc: 'バランス型・先攻'
  },
  {
    id: 'kue', name: 'クエ', icon: '🐡', attr: 'fire',
    baseAtk: 7, baseHp: 50,
    lapAtk: 4, lapHp: 6,
    special: '必ず後攻になる。周回成長ボーナスが多い',
    desc: '重戦士型・後攻',
    isKue: true
  },
  {
    id: 'aji', name: 'アジ', icon: '🐠', attr: 'water',
    baseAtk: 3, baseHp: 30,
    lapAtk: 3, lapHp: 5,
    special: '1ターンに2回行動できる',
    desc: '俊敏型・2ターン行動'
  },
  {
    id: 'fugu', name: 'フグ', icon: '🐡', attr: 'water',
    baseAtk: 3, baseHp: 50,
    lapAtk: 3, lapHp: 5,
    special: 'ターン終了後に相手の最大HPの20%追加ダメージ（毒）',
    desc: 'HP特化型・毒攻撃'
  },
  {
    id: 'hitode', name: 'ヒトデ', icon: '⭐', attr: 'grass',
    baseAtk: 4, baseHp: 40,
    lapAtk: 3, lapHp: 5,
    special: '初期ゴールド+500G・周回ボーナス+10%',
    desc: '商人型',
    startGoldBonus: 500
  },
  {
    id: 'usagi', name: 'うさぎ', icon: '🐰', attr: 'grass',
    baseAtk: 4, baseHp: 40,
    lapAtk: 3, lapHp: 5,
    special: 'ダイス3回に1回ヘイスト（+1〜3マス）',
    desc: '幸運型・ヘイスト'
  }
];

// ===== 属性 =====
export const ATTR = {
  fire:  { label: '🔥火', color: '#ff6b35', strong: 'grass', weak: 'water' },
  water: { label: '💧水', color: '#58a6ff', strong: 'fire',  weak: 'grass' },
  grass: { label: '🌿草', color: '#3fb950', strong: 'water', weak: 'fire'  },
  none:  { label: '無属性', color: '#888',  strong: null,   weak: null    }
};

export function atkMod(attackerAttr, defenderAttr) {
  if (!attackerAttr || !defenderAttr || defenderAttr === 'none') return 1.0;
  if (ATTR[attackerAttr]?.strong === defenderAttr) return 1.5;
  if (ATTR[attackerAttr]?.weak   === defenderAttr) return 0.7;
  return 1.0;
}

// ===== 武器カード =====
export const WEAPONS = [
  {
    id: 'knife', name: '🗡 ナイフ', atk: 10, cost: 0,
    desc: 'ATK +10', initial: true
  },
  {
    id: 'missile', name: '🚀 プ〇ウスミサイル', atk: 20, addHp: 20, cost: 100,
    desc: 'ATK+20 / 加算HP+20（戦闘後消滅）。戦闘後に最大基礎HPの30%自傷',
    afterBattle: (p) => {
      const dmg = Math.floor(p.baseMaxHp * 0.3);
      return { selfDmg: dmg, msg: `🚀 プ〇ウスミサイルの自傷！ 基礎HP −${dmg}` };
    }
  },
  {
    id: 'pattsmo', name: '🗡 パッツモソード', atk: 20, cost: 80,
    desc: 'ATK+20。防御側装備で先制逆転。攻撃側装備で相手の防御パッツモを相殺',
    isPattsmo: true
  },
  {
    id: 'shikkoku', name: '⚫ しっこくのつるぎ', atk: 50, cost: 100,
    desc: 'ATK+50。戦闘終了後にHP強制1',
    afterBattle: () => ({ forceHp1: true, msg: '⚫ しっこくのつるぎ… HPが1になった' })
  },
  {
    id: 'moroba', name: '⚔ 諸刃の剣', atk: 30, reductHp: 30, cost: 0,
    desc: 'ATK+30 / 減算HP−30。戦闘開始時に現在HPから30を減算。0以下で強制敗北',
    isMoroba: true
  }
];

// ===== 防具カード =====
export const ARMORS = [
  {
    id: 'board', name: '🪵 木の板', addHp: 10, cost: 0,
    desc: '加算HP +10', initial: true
  },
  {
    id: 'dungeon_suit', name: '🤿 ダン〇ンのスーツ', addHp: 15, cost: 20,
    desc: '加算HP +15'
  },
  {
    id: 'marugila', name: '👛 マルジ〇ラの財布', addHp: 10, cost: 50,
    desc: '加算HP+10。攻撃側→通行料半額 / 防御側→通行料2倍',
    isMarugila: true
  },
  {
    id: 'cardboard', name: '📦 アマ〇ンの段ボール', addHp: 5, cost: 0,
    desc: '加算HP+5。生存時にランダムカード1枚入手（満杯→+100G）',
    isCardboard: true
  }
];

// ===== スペルカード =====
export const SPELLS = [
  {
    id: 'pe_staff', name: '🪄 ペーの杖', cost: 50,
    desc: '最終ATK×1.5倍（次のゴールまで）',
    duration: 'nextGoal', effect: 'atkBoost', value: 1.5
  },
  {
    id: 'haste', name: '⚡ ヘイスト', cost: 30,
    desc: 'サブダイス（1〜3）追加（2ターン）',
    duration: 2, effect: 'haste'
  },
  {
    id: 'gaisen', name: '🏆 凱旋', cost: 0,
    desc: '次の周回ボーナス×1.5倍',
    duration: 'nextGoal', effect: 'lapBoost', value: 1.5
  },
  {
    id: 'bukomi', name: '🎲 ぶっこみ', cost: 100,
    desc: '手持ちモンスターをランダムな空き地に召喚。空き地なし→+300G',
    duration: 'instant', effect: 'deployMonster'
  },
  {
    id: 'butsukari', name: '👴 ぶつかりおじさん', cost: 60,
    desc: '敵モンスター3体にランダムで基礎HP−7。1体なら×3',
    duration: 'instant', effect: 'damageMonsters', value: 7, count: 3
  },
  {
    id: 'gyuho', name: '🐢 牛歩戦術', cost: 50,
    desc: '対象のダイスを1〜2に制限（2ターン）',
    duration: 2, effect: 'slowDice', targetPlayer: true
  },
  {
    id: 'ikasama', name: '🎰 イカサマのダイス', cost: 90,
    desc: '対象のダイスを指定した目にする（次の1回）',
    duration: 1, effect: 'fixDice', targetPlayer: true
  },
  {
    id: 'jagian', name: '👊 ジャ〇アンの理屈', cost: 120,
    desc: '対象プレイヤーのカードを1枚ランダムで奪う',
    duration: 'instant', effect: 'stealCard', targetPlayer: true
  },
  {
    id: 'betaori', name: '🙅 ベタオリ', cost: 100,
    desc: '選んだモンスターが攻撃しない代わりに受けるダメージ半減（次の戦闘か通行料まで）',
    duration: 'nextBattle', effect: 'betaori', targetMonster: true
  },
  {
    id: 'morohiki', name: '🪤 モロ引っ掛け', cost: 100,
    desc: '選んだモンスターのマスを通過するプレイヤーを強制停止（1回）。自分は通行料なし',
    duration: 'once', effect: 'morohiki', targetMonster: true
  },
  {
    id: 'manjiro', name: '💉 マン〇ャロ', cost: 60,
    desc: '3ターン間、毎ターン終了時にHP+20%・ATK+5。終了後ATK上昇消滅',
    duration: 3, effect: 'manjiro', targetSelfOrMonster: true
  }
];

// ===== モンスターカード =====
export const MONSTERS = [
  // 初期ゴブリン
  { id: 'goblin_fire',  name: '🔥ゴブリン', attr: 'fire',  atk: 3,  baseHp: 10, maxHp: 10, cost: 0, initial: true },
  { id: 'goblin_water', name: '💧ゴブリン', attr: 'water', atk: 3,  baseHp: 10, maxHp: 10, cost: 0, initial: true },
  { id: 'goblin_grass', name: '🌿ゴブリン', attr: 'grass', atk: 3,  baseHp: 10, maxHp: 10, cost: 0, initial: true },

  // 🔥 火属性
  {
    id: 'heroma', name: '🦕 へ〇ま竜', attr: 'fire', atk: 15, baseHp: 40, maxHp: 40, cost: 70,
    desc: '戦闘終了後に敗者の最大基礎HP −20%（永続）。相打ち時→土地が更地に。通行料なし',
    onBattleEnd: 'heroma_debuff',
    onDraw: 'heroma_draw' // 相打ち処理
  },
  {
    id: 'kaenbin', name: '🔥 火炎瓶男', attr: 'fire', atk: 20, baseHp: 25, maxHp: 25, cost: 55,
    desc: '戦闘終了後に与えたダメージの15%を追加で基礎HPに',
    onBattleEnd: 'kaenbin_extra'
  },
  {
    id: 'hidauruma', name: '🔥 火だるま', attr: 'fire', atk: 10, baseHp: 30, maxHp: 30, cost: 50,
    desc: '戦闘終了後に自己の基礎HPを30%回復',
    onBattleEnd: 'hidauruma_heal'
  },
  {
    id: 'salary', name: '💼 サラリーマンダー', attr: 'fire', atk: 10, baseHp: 25, maxHp: 25, cost: 30,
    desc: '戦闘終了後に土地所有者が80G獲得',
    onBattleEnd: 'salary_gold'
  },
  {
    id: 'kaentake', name: '🍄 カエンタケ', attr: 'fire', atk: 15, baseHp: 20, maxHp: 20, cost: 20,
    desc: '先制攻撃で相手を毒状態にする',
    firstStrike: true, onFirstStrike: 'kaentake_poison'
  },

  // 💧 水属性
  {
    id: 'hedoro', name: '🟤 ヘドロ男', attr: 'water', atk: 15, baseHp: 30, maxHp: 30, cost: 20,
    desc: '攻撃後に相手を毒状態にする',
    onAttack: 'hedoro_poison'
  },
  {
    id: 'tamakai', name: '🐟 タマカイ', attr: 'water', atk: 25, baseHp: 40, maxHp: 40, cost: 60,
    desc: '攻撃終了後に土地所有者の手持ちG −5%（デメリット持ち）',
    onBattleEnd: 'tamakai_penalty'
  },
  {
    id: 'minato', name: '👩 港区女子', attr: 'water', atk: 30, baseHp: 40, maxHp: 40, cost: 90,
    desc: '通行料×1.3倍。攻撃後に侵略者のカードを1枚ランダムで奪う',
    tollMod: 1.3, onAttack: 'minato_steal'
  },
  {
    id: 'sealion', name: '🦁 シーライオン', attr: 'water', atk: 15, baseHp: 25, maxHp: 25, cost: 15,
    desc: '戦闘終了後に所有者の手持ちGが −50〜+50G ランダム変動',
    onBattleEnd: 'sealion_random'
  },
  {
    id: 'iyashi', name: '🌸 いやし系', attr: 'water', atk: 5, baseHp: 20, maxHp: 20, cost: 15,
    desc: '戦闘終了後に所有者の全モンスターの基礎HPを15%回復',
    onBattleEnd: 'iyashi_heal'
  },

  // 🌿 草属性
  {
    id: 'channeler', name: '💻 〇ちゃんねらー', attr: 'grass', atk: 15, baseHp: 10, maxHp: 10, cost: 25,
    desc: '戦闘開始時に35%の確率でランダムな空き地に増殖（元の土地にも残る）',
    onBattleStart: 'channeler_clone'
  },
  {
    id: 'kusamono', name: '🥷 草の者', attr: 'grass', atk: 20, baseHp: 20, maxHp: 20, cost: 40,
    desc: '防御側でも常に先制攻撃できる',
    alwaysFirstStrike: true
  },
  {
    id: 'yasugi', name: '🌲 屋〇杉', attr: 'grass', atk: 10, baseHp: 50, maxHp: 50, cost: 150,
    desc: '特殊効果なし。高耐久の壁モンスター'
  },
  {
    id: 'fushigibana', name: '🌸 不思議花', attr: 'grass', atk: 20, baseHp: 35, maxHp: 35, cost: 100,
    desc: '与えたダメージの30%を自己の基礎HPとして回復',
    onAttack: 'fushigibana_drain'
  },
  {
    id: 'saboriter', name: '🌵 サボリーテンダー', attr: 'grass', atk: 45, baseHp: 25, maxHp: 25, cost: 75,
    desc: '50%の確率で攻撃しない（完全スキップ）',
    skipChance: 0.5
  }
];

// モンスターIDで検索
export function getMonster(id) {
  return MONSTERS.find(m => m.id === id);
}

// キャラIDで検索
export function getChar(id) {
  return CHARS.find(c => c.id === id);
}

// ===== 通行料計算 =====
export function calcToll(cell, monster = null) {
  const base = 50 * Math.pow(1.5, (cell.level || 1) - 1);
  const monsterMod = monster?.tollMod || 1;
  return Math.floor(base * monsterMod);
}

// ===== 土地資産価値計算 =====
export function landAssetValue(cell, allCells, ownerId) {
  if (!cell || cell.owner !== ownerId || cell.type !== 'land') return 0;
  const base = cell.investedCost || 100;
  const bonus = chainBonus(cell.attr, allCells, ownerId);
  return Math.floor(base * (1 + bonus));
}

// ===== 連鎖ボーナス =====
export function chainBonus(attr, allCells, ownerId) {
  if (!attr || attr === 'none') return 0;
  const count = Object.values(allCells).filter(
    c => c.owner === ownerId && c.attr === attr && c.type === 'land'
  ).length;
  if (count >= 5) return 0.4;
  if (count >= 4) return 0.3;
  if (count >= 3) return 0.2;
  if (count >= 2) return 0.1;
  return 0;
}

// ===== 総資産計算 =====
export function totalAssets(player, allCells) {
  const landVal = Object.values(allCells || {}).filter(
    c => c.owner === player.uid && c.type === 'land'
  ).reduce((sum, c) => sum + landAssetValue(c, allCells, player.uid), 0);
  return (player.gold || 0) + landVal;
}

// ===== 隣接ボーナス =====
export function hasAdjacentBonus(cell, allCells, N = 18) {
  const id = cell.id;
  return Object.values(allCells).some(c =>
    c.id !== id && c.owner === cell.owner && c.type === 'land' &&
    (Math.abs(c.id - id) === 1 || Math.abs(c.id - id) === N - 1)
  );
}

// ===== 売却価格 =====
export function sellPrice(cell) {
  return Math.floor((cell.investedCost || 100) * 0.7);
}

// ===== プレイヤー初期データ =====
export function createPlayerData(uid, name, charId, isAdmin = false) {
  const char = getChar(charId);
  if (!char) throw new Error(`Unknown char: ${charId}`);

  const goblinAttr = char.attr;
  const goblinId = `goblin_${goblinAttr}`;
  const goblin = getMonster(goblinId);

  return {
    uid,
    name,
    charId,
    icon: char.icon,
    attr: char.attr,
    color: { fire: '#ff6b35', water: '#58a6ff', grass: '#3fb950' }[char.attr] || '#888',
    isAdmin,
    isAI: false,

    // ステータス
    baseAtk: char.baseAtk,
    baseMaxHp: char.baseHp,
    baseHp: char.baseHp,   // 現在の基礎HP
    addHp: 0,              // 加算HP（土地Lv・防具）
    reductHp: 0,           // 減算HP（諸刃の剣等）

    // ゴールド
    gold: 250 + (char.startGoldBonus || 0),
    landAssets: 0,

    // 位置
    pos: 0,
    lap: 0,
    cpDone: false,

    // 装備・カード
    weapons: [{ ...WEAPONS.find(w => w.id === 'knife') }],
    armors:  [{ ...ARMORS.find(a => a.id === 'board') }],
    spells:  [],
    monsters: [
      { ...goblin, currentHp: goblin.baseHp },
      { ...goblin, currentHp: goblin.baseHp }
    ],

    // 状態フラグ
    effects: {
      poisoned: false,
      atkBoost: null,    // { value, until: 'nextGoal' }
      lapBoost: null,    // { value, until: 'nextGoal' }
      haste: 0,          // 残りターン数
      slowDice: 0,       // 残りターン数
      fixDice: null,     // 指定ダイス目
      manjiro: null,     // { turns, targetMonsterIdx }
    },

    lapCount: 0,         // 周回数
    diceRollCount: 0,    // うさぎのヘイスト判定用
    ready: false,        // ゲーム開始準備完了フラグ
    isAlive: true,
  };
}

// AI プレイヤー
export function createAIPlayer(charId) {
  const char = getChar(charId);
  const data = createPlayerData(`ai_${charId}`, `${char.name}(AI)`, charId, false);
  data.isAI = true;
  return data;
}
