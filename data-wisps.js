/* ============================================================
   データ: Wisp（ウィスプ）── TFT Set 18: Enchanted Wilds の新ショップ機構
   ── ショップの一番右にランダムで1体出現し、1ラウンドにつき1個まで購入できる
      「使い切りの魔法生物」。購入すると effect が発動し、リストから消える。
   ── data-encounters.js と同じ思想：メタ情報（id/name/category/cost/icon/desc）は
      sim-editor.html から編集でき、effect（関数）は原文のまま保持される。
   ── 新規追加分は effect なし（表示のみ）で作成される。
   ── helpers(h): addGold/addXp/addItem/addChampToBenchDirect/addAnvilToBench/
                  addPassiveBuff/addFreeRerolls/showMsg など（オーグメントと共通）
   ============================================================ */

/* ── カテゴリ 日本語名 ── */
const WISP_CATEGORY_JA = {
  economy: 'ゴールド/XP',
  shop: 'ショップ',
  champion: 'チャンピオン',
  item: 'アイテム',
  risky: 'リスク',
  combat: '戦闘',
  misc: 'その他',
};

/* ── カテゴリ カラー ── */
const WISP_CATEGORY_COLORS = {
  economy: '#ffd76e',
  shop: '#44cc66',
  champion: '#ff9f43',
  item: '#7fd0ff',
  risky: '#c084fc',
  combat: '#dc3545',
  misc: '#94a3b8',
};

/* ── Wisp データ本体 ── */
const WISPS_DATA = [
  {
    id: 'wisp_gold_small', name: '金貨のウィスプ', category: 'economy', cost: 1, icon: '💰',
    desc: '即座に2ゴールドを獲得する。',
    effect: (state, rng, helpers) => { helpers.addGold(2); helpers.showMsg('💰 金貨のウィスプ: 2G獲得！'); }
  },
  {
    id: 'wisp_gold_medium', name: '金貨袋のウィスプ', category: 'economy', cost: 2, icon: '💰',
    desc: '即座に4ゴールドを獲得する。',
    effect: (state, rng, helpers) => { helpers.addGold(4); helpers.showMsg('💰 金貨袋のウィスプ: 4G獲得！'); }
  },
  {
    id: 'wisp_xp_small', name: '知恵の粉のウィスプ', category: 'economy', cost: 1, icon: '📘',
    desc: '4XPを獲得する。',
    effect: (state, rng, helpers) => { helpers.addXp(4); helpers.showMsg('📘 知恵の粉のウィスプ: 4XP獲得！'); }
  },
  {
    id: 'wisp_xp_medium', name: '知恵の実のウィスプ', category: 'economy', cost: 2, icon: '📗',
    desc: '8XPを獲得する。',
    effect: (state, rng, helpers) => { helpers.addXp(8); helpers.showMsg('📗 知恵の実のウィスプ: 8XP獲得！'); }
  },
  {
    id: 'wisp_reroll_1', name: '導きのウィスプ', category: 'shop', cost: 1, icon: '🔄',
    desc: '無料リロールを1回獲得する。',
    effect: (state, rng, helpers) => { helpers.addFreeRerolls(1); helpers.showMsg('🔄 導きのウィスプ: 無料リロール+1！'); }
  },
  {
    id: 'wisp_reroll_2', name: '導きのウィスプ・改', category: 'shop', cost: 2, icon: '🔄',
    desc: '無料リロールを2回獲得する。',
    effect: (state, rng, helpers) => { helpers.addFreeRerolls(2); helpers.showMsg('🔄 導きのウィスプ・改: 無料リロール+2！'); }
  },
  {
    id: 'wisp_champ_1cost', name: '森の子のウィスプ', category: 'champion', cost: 1, icon: '🌱',
    desc: 'ランダムな1コストチャンピオンを1体獲得する。',
    effect: (state, rng, helpers) => {
      const pool = CHAMPS.filter(c => c.cost === 1);
      const c = pool[Math.floor(rng() * pool.length)];
      helpers.addChampToBenchDirect({ ...c, star: 1, uid: rng(), items: [] });
      helpers.showMsg(`🌱 森の子のウィスプ: ${c.jaName}を獲得！`);
    }
  },
  {
    id: 'wisp_champ_2cost', name: '森の賢者のウィスプ', category: 'champion', cost: 2, icon: '🌿',
    desc: 'ランダムな2コストチャンピオンを1体獲得する。',
    effect: (state, rng, helpers) => {
      const pool = CHAMPS.filter(c => c.cost === 2);
      const c = pool[Math.floor(rng() * pool.length)];
      helpers.addChampToBenchDirect({ ...c, star: 1, uid: rng(), items: [] });
      helpers.showMsg(`🌿 森の賢者のウィスプ: ${c.jaName}を獲得！`);
    }
  },
  {
    id: 'wisp_item_comp', name: '素材のきざはしウィスプ', category: 'item', cost: 1, icon: '🧩',
    desc: 'ランダムな素材アイテムを1個獲得する。',
    effect: (state, rng, helpers) => {
      const it = ITEMS[Math.floor(rng() * ITEMS.length)];
      helpers.addItem({ ...it });
      helpers.showMsg(`🧩 素材のきざはしウィスプ: ${it.jaName}を獲得！`);
    }
  },
  {
    id: 'wisp_item_anvil', name: '完成の金床ウィスプ', category: 'item', cost: 3, icon: '⚒️',
    desc: '「完成アイテムの金床」を1個獲得する。',
    effect: (state, rng, helpers) => { helpers.addAnvilToBench('completed', 1); helpers.showMsg('⚒️ 完成の金床ウィスプ: 金床を獲得！'); }
  },
  {
    id: 'wisp_risky_fog', name: '霧の妖精ウィスプ', category: 'risky', cost: 1, icon: '🌫️',
    desc: 'ランダムに1〜5ゴールドを獲得する。',
    effect: (state, rng, helpers) => { const g = 1 + Math.floor(rng() * 5); helpers.addGold(g); helpers.showMsg(`🌫️ 霧の妖精ウィスプ: ${g}G獲得！`); }
  },
  {
    id: 'wisp_risky_gamble', name: '賭けの妖精ウィスプ', category: 'risky', cost: 2, icon: '🎲',
    desc: '50%の確率で7ゴールド、50%の確率で1ゴールドを獲得する。',
    effect: (state, rng, helpers) => {
      const win = rng() < 0.5;
      const g = win ? 7 : 1;
      helpers.addGold(g);
      helpers.showMsg(win ? '🎲 賭けの妖精ウィスプ: 大当たり！7G獲得！' : '🎲 賭けの妖精ウィスプ: 残念…1Gのみ。');
    }
  },
  {
    id: 'wisp_combat_glow', name: '戦意のウィスプ', category: 'combat', cost: 2, icon: '⚔️',
    desc: '次の戦闘に向けて士気が高まる（記録用フラグ・表示のみ）。',
    effect: (state, rng, helpers) => { helpers.addPassiveBuff({ type: 'wisp_combat_glow' }); helpers.showMsg('⚔️ 戦意のウィスプ: 士気が高まった！'); }
  },
  {
    id: 'wisp_misc_remover', name: '解呪のウィスプ', category: 'misc', cost: 1, icon: '🧪',
    desc: '除去装置を1個獲得する。',
    effect: (state, rng, helpers) => { helpers.addItem({ ...CONSUMABLES.REMOVER, count: 1 }); helpers.showMsg('🧪 解呪のウィスプ: 除去装置を獲得！'); }
  },
];
