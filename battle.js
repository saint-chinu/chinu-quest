// ===== battle.js =====
// チヌクエスト 戦闘システム

import { atkMod, calcToll, getMonster } from './gamedata.js';

// ===== 先制判定 =====
export function getFirstStrike(attacker, defender, attackerWeapon, defenderWeapon, defenderMonster) {
  // 草の者は常に先制（防御側）
  if (defenderMonster?.alwaysFirstStrike) return 'defender';
  // カエンタケは先制（防御側）
  if (defenderMonster?.firstStrike) return 'defender';
  // クエは後攻（攻撃側としてデメリット）
  if (attacker.charId === 'kue') return 'defender';
  // 防御側がパッツモソード
  if (defenderWeapon?.isPattsmo) {
    // 攻撃側もパッツモなら相殺
    if (attackerWeapon?.isPattsmo) return 'attacker';
    return 'defender';
  }
  return 'attacker';
}

// ===== ダメージ計算 =====
export function calcDamage(atk, attackerAttr, defenderAttr) {
  const mod = atkMod(attackerAttr, defenderAttr);
  return Math.max(1, Math.floor(atk * mod));
}

// ===== プレイヤーの合計ATK =====
export function playerTotalAtk(player, weapon) {
  let atk = player.baseAtk + (weapon?.atk || 0);
  // ペーの杖効果
  if (player.effects?.atkBoost) atk = Math.floor(atk * player.effects.atkBoost.value);
  return atk;
}

// ===== プレイヤーの現在HP（基礎+加算-減算）=====
export function playerCurrentHp(player) {
  return player.baseHp + player.addHp - player.reductHp;
}

// ===== HPにダメージを与える（加算から先に削る）=====
export function applyDamage(player, damage) {
  let remaining = damage;
  let newAddHp = player.addHp;
  let newBaseHp = player.baseHp;

  if (newAddHp > 0) {
    const fromAdd = Math.min(remaining, newAddHp);
    newAddHp -= fromAdd;
    remaining -= fromAdd;
  }
  if (remaining > 0) {
    newBaseHp = Math.max(0, newBaseHp - remaining);
  }

  return { baseHp: newBaseHp, addHp: newAddHp };
}

// ===== 戦闘シミュレーション =====
export function simulateBattle(attacker, defender, options = {}) {
  const {
    attackerWeapon = null,
    attackerArmor  = null,
    defenderMonster = null,
    defenderWeapon = null, // モンスター装備
    cell = null,
    allCells = {},
    N = 18
  } = options;

  const log = [];

  // 諸刃の剣チェック（攻撃側）
  if (attackerWeapon?.isMoroba) {
    const hp = playerCurrentHp(attacker);
    if (hp - 30 <= 0) {
      return {
        result: 'attacker_forfeit',
        log: ['⚔ 諸刃の剣の反動で戦闘開始前に力尽きた…'],
        attackerHpAfter: 0,
        defenderHpAfter: defenderMonster?.currentHp || defender?.baseHp || 0
      };
    }
  }

  // 初期HPセットアップ
  let aBaseHp   = attacker.baseHp;
  let aAddHp    = attacker.addHp + (attackerArmor?.addHp || 0) + (attackerWeapon?.addHp || 0);
  let aReductHp = attackerWeapon?.isMoroba ? 30 : 0;
  let mHp       = defenderMonster ? defenderMonster.currentHp : defender?.baseHp || 0;
  const mMaxHp  = defenderMonster ? defenderMonster.maxHp : defender?.baseMaxHp || mHp;

  // 攻撃力
  const aAtk = playerTotalAtk(attacker, attackerWeapon);
  const mAtk = (() => {
    let base = defenderMonster?.atk || defender?.baseAtk || 0;
    // モンスター装備武器
    if (defenderWeapon) base += defenderWeapon.atk || 0;
    // 隣接ボーナス
    if (cell && allCells) {
      const adj = Object.values(allCells).some(c =>
        c.id !== cell.id && c.owner === cell.owner && c.type === 'land' &&
        (Math.abs(c.id - cell.id) === 1 || Math.abs(c.id - cell.id) === N - 1)
      );
      if (adj) base = Math.floor(base * 1.5);
    }
    // ベタオリ
    if (cell?.flags?.betaori) return 0;
    return base;
  })();

  const defAttr  = cell?.attr || defenderMonster?.attr || 'none';
  const atkAttrA = attacker.attr;

  // 諸刃の剣：開始時に減算
  aBaseHp = Math.max(0, aBaseHp - aReductHp);

  // 先制判定
  const first = getFirstStrike(attacker, defender || {}, attackerWeapon, defenderWeapon, defenderMonster);
  log.push(`先攻: ${first === 'attacker' ? attacker.name : defenderMonster?.name || '守り手'}`);

  // 〇ちゃんねらー：35%で増殖（戦闘開始時）
  let channelerCloned = false;
  if (defenderMonster?.id === 'channeler' || defenderMonster?.onBattleStart === 'channeler_clone') {
    if (Math.random() < 0.35) {
      channelerCloned = true;
      log.push('💻 〇ちゃんねらーが空き地に増殖した！（そのまま戦闘続行）');
    }
  }

  // サボリーテンダー：50%でスキップ
  let saboriterSkip = false;
  if (defenderMonster?.skipChance && Math.random() < defenderMonster.skipChance) {
    saboriterSkip = true;
    log.push('🌵 サボリーテンダーはサボって攻撃しなかった！');
  }

  let aDmg = 0; // 攻撃側がモンスターに与えたダメージ
  let mDmg = 0; // 守り側がプレイヤーに与えたダメージ

  const doAttackerAttack = () => {
    aDmg = calcDamage(aAtk, atkAttrA, defAttr);
    // 不思議花：与えたダメージの30%を自己回復
    if (defenderMonster?.onAttack === 'fushigibana_drain') {
      const heal = Math.floor(aDmg * 0.3);
      mHp = Math.min(mMaxHp, mHp + heal);
      log.push(`🌸 不思議花が ${heal} 回復！`);
    }
    mHp = Math.max(0, mHp - aDmg);
    log.push(`${attacker.name} の攻撃！ ${aDmg} ダメージ → 残りHP ${mHp}`);
    // ヘドロ男：攻撃後に毒
    if (defenderMonster?.onAttack === 'hedoro_poison') {
      log.push('🟤 ヘドロ男の毒攻撃！');
    }
  };

  const doDefenderAttack = () => {
    if (saboriterSkip) return;
    mDmg = Math.max(0, mAtk); // モンスターは属性補正なし（シンプル化）
    const hpResult = applyDamage({ baseHp: aBaseHp, addHp: aAddHp }, mDmg);
    aBaseHp = hpResult.baseHp;
    aAddHp  = hpResult.addHp;
    log.push(`${defenderMonster?.name || '守り手'} の攻撃！ ${mDmg} ダメージ → 残りHP ${aBaseHp + aAddHp}`);
  };

  // カエンタケ先制毒
  if (defenderMonster?.onFirstStrike === 'kaentake_poison' && first === 'defender') {
    log.push('🍄 カエンタケの先制毒攻撃！');
  }

  if (first === 'attacker') {
    doAttackerAttack();
    if (mHp > 0) doDefenderAttack();
  } else {
    doDefenderAttack();
    if (aBaseHp + aAddHp > 0) doAttackerAttack();
  }

  // 結果判定
  let result;
  if (mHp <= 0 && aBaseHp <= 0) {
    result = 'draw_both_dead'; // 相打ち（へ〇ま竜特殊ケース）
  } else if (mHp <= 0) {
    result = 'attacker_win';
  } else if (aBaseHp <= 0) {
    result = 'defender_win';
  } else {
    result = 'draw'; // 1ターン終了
  }

  log.push(`結果: ${
    result === 'attacker_win' ? '攻撃側の勝利！' :
    result === 'defender_win' ? '防御側の勝利（敗北）…' :
    result === 'draw_both_dead' ? '相打ち！' : '引き分け'
  }`);

  return {
    result,
    log,
    attackerHpAfter: { baseHp: aBaseHp, addHp: aAddHp },
    defenderHpAfter: mHp,
    aDmg, mDmg,
    channelerCloned,
    saboriterSkip,
    poisonApplied: defenderMonster?.onAttack === 'hedoro_poison' ||
                   defenderMonster?.onFirstStrike === 'kaentake_poison',
    maxHp: mMaxHp
  };
}

// ===== 戦闘後処理 =====
export function processBattleAfterEffects(result, attacker, cell, defenderMonster, allPlayers, allCells) {
  const effects = [];

  if (result.result === 'attacker_win' || result.result === 'draw') {
    // 火炎瓶男：与えたダメージの15%追加
    if (defenderMonster?.onBattleEnd === 'kaenbin_extra') {
      const extra = Math.floor(result.aDmg * 0.15);
      effects.push({ type: 'extraDmg', target: 'attacker', value: extra, msg: `🔥 火炎瓶男の追加ダメージ！ −${extra}` });
    }
    // へ〇ま竜：敗者の最大基礎HP−20%
    if (defenderMonster?.onBattleEnd === 'heroma_debuff') {
      const debuff = Math.floor(attacker.baseMaxHp * 0.2);
      effects.push({ type: 'maxHpDebuff', target: 'attacker', value: debuff, msg: `🦕 へ〇ま竜の呪い！ 最大基礎HP −${debuff}` });
    }
  }

  if (result.result === 'attacker_win') {
    // 火だるま：自己回復
    if (defenderMonster?.onBattleEnd === 'hidauruma_heal') {
      effects.push({ type: 'monsterHeal', value: 0.3, msg: '🔥 火だるまが基礎HPを30%回復！' });
    }
    // サラリーマンダー：所有者に80G
    if (defenderMonster?.onBattleEnd === 'salary_gold') {
      effects.push({ type: 'ownerGold', value: 80, msg: '💼 サラリーマンダーが80G稼いだ！' });
    }
    // タマカイ：所有者の手持ちG −5%
    if (defenderMonster?.onBattleEnd === 'tamakai_penalty') {
      effects.push({ type: 'ownerGoldPct', value: -0.05, msg: '🐟 タマカイのデメリット！ 所有者の手持ち −5%' });
    }
    // シーライオン：ランダム変動
    if (defenderMonster?.onBattleEnd === 'sealion_random') {
      const rand = Math.floor(Math.random() * 101) - 50;
      effects.push({ type: 'ownerGold', value: rand, msg: `🦁 シーライオン！ 所有者の手持ち ${rand >= 0 ? '+' : ''}${rand}G` });
    }
    // いやし系：全モンスター15%回復
    if (defenderMonster?.onBattleEnd === 'iyashi_heal') {
      effects.push({ type: 'allMonsterHeal', value: 0.15, msg: '🌸 いやし系の癒し！ 全モンスター基礎HP+15%' });
    }
    // 港区女子：カード奪取
    if (defenderMonster?.onAttack === 'minato_steal') {
      effects.push({ type: 'stealCard', target: 'attacker', msg: '👩 港区女子がカードを奪った！' });
    }
  }

  // プ〇ウスミサイル自傷
  if (attacker._usedWeapon?.id === 'missile') {
    const selfDmg = Math.floor(attacker.baseMaxHp * 0.3);
    effects.push({ type: 'selfDmg', value: selfDmg, msg: `🚀 プ〇ウスミサイルの自傷 −${selfDmg}` });
  }
  // しっこくのつるぎ
  if (attacker._usedWeapon?.id === 'shikkoku') {
    effects.push({ type: 'forceHp1', msg: '⚫ しっこくのつるぎ… HPが1になった' });
  }
  // アマ〇ンの段ボール（生存時）
  if (attacker._usedArmor?.id === 'cardboard' && result.attackerHpAfter.baseHp > 0) {
    effects.push({ type: 'randomCard', msg: '📦 アマ〇ンの段ボール！ ランダムカードを入手' });
  }

  return effects;
}
