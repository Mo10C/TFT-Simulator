/* ============================================================
   データ: Wisp（ウィスプ）── TFT Set 18: Enchanted Wilds の新ショップ機構
   ── ショップの一番右（5枚目）にランダムで1体出現し、1ラウンドにつき1個まで購入できる
      「使い切りの魔法生物」。購入すると effect が発動し、その枠に元々いたチャンピオンが現れる。
   ── data-encounters.js と同じ思想：メタ情報（id/name/category/cost/icon/desc）は
      sim-editor.html から編集でき、effect（関数）は原文のまま保持される。
   ── 新規追加分は effect なし（表示のみ）で作成される。
   ── name/cost/desc はユーザー提供の公式一覧に準拠。category（7分類）と effect の
      実装内容はこちらでの近似実装（下記の注記を参照）。
   ── helpers(h): addGold/addXp/addItem/addChampToBenchDirect/addAnvilToBench/
                  addPassiveBuff/addFreeRerolls/setShop/transmuteUnitByUid/
                  removeCompItems/showMsg など（オーグメントと共通＋Wisp追加分）
   ── ⚠️ 実装メモ（このシムは戦闘・プレイヤー体力・連勝連敗・PvP結果を扱わないため）:
      体力消費/回復、連勝連敗、対人戦の勝敗条件、キル/アシスト集計、戦闘中バフ
      （シールド・マナリジェン等）は「効果なし・記録のみ」として showMsg のみ発動する。
      「瓶」系（がらくた瓶/小物瓶/装置瓶）はSet18のステータス別消費アイテムが
      このデータセットに無いため、素材アイテムのランダム付与で近似している。
   ============================================================ */

/* ── カテゴリ 日本語名（公式7分類） ── */
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

/* ── カテゴリ → アイコンURLのスラッグ（MetaTFTのカード分類アイコン用・URL形式は確認済み） ──
   例: https://cdn.metatft.com/cdn-cgi/image/width=72,format=auto/https://cdn.metatft.com/file/metatft/charms/categories/t_shopcardsicon18_champion_tier1.png
   スラッグは公式カテゴリ名（Champion/Combat/GoldXP/Item/Misc/Risky/Shop）の小文字表記。
   tier番号（価格帯との対応）は未確認の推測値。読み込み失敗時は絵文字アイコンに自動フォールバックする。 */
const WISP_CATEGORY_SLUG = {
  economy: 'goldxp',
  shop: 'shop',
  champion: 'champion',
  item: 'item',
  risky: 'risky',
  combat: 'combat',
  misc: 'misc',
};

/* ── Wisp データ本体（39種・公式一覧準拠） ── */
const WISPS_DATA = [
  { id:"wisp_all1", name:"オール1", category:"shop", cost:0, icon:"🔀", desc:"コスト1チャンピオンのみが並ぶショップのリロールを行う。", effect:(state, rng, helpers) => {
      const pool = CHAMPS.filter(c => c.cost === 1);
      const ns = Array(5).fill(null).map(() => ({ ...pool[Math.floor(rng() * pool.length)], uid: rng(), star: 1 }));
      helpers.setShop(ns);
      helpers.showMsg('🔀 オール1: コスト1のみのショップにリロール！');
    } },
  { id:"wisp_begging", name:"おねだりウィスプ", category:"economy", cost:0, icon:"🙏", desc:"今回のロールでは、ウィスプが見つからなかった。4ゴールドを獲得する。", effect:(state, rng, helpers) => { helpers.addGold(4); helpers.showMsg('🙏 おねだりウィスプ: 4G獲得！'); } },
  { id:"wisp_junk_bottle", name:"がらくた瓶", category:"misc", cost:0, icon:"🧴", desc:"魔力またはマナ自動回復を付与するランダムな消費アイテムを1個獲得する。", effect:(state, rng, helpers) => { const it = ITEMS[Math.floor(rng() * ITEMS.length)]; helpers.addItem({ ...it }); helpers.showMsg(`🧴 がらくた瓶: ${it.jaName}を獲得！`); } },
  { id:"wisp_coin_toss", name:"コイントス", category:"economy", cost:0, icon:"🪙", desc:"コインを投げ、表が出た場合1ゴールドを獲得する。", effect:(state, rng, helpers) => {
      if (rng() < 0.5) { helpers.addGold(1); helpers.showMsg('🪙 コイントス: 表！1G獲得！'); }
      else { helpers.showMsg('🪙 コイントス: 裏…獲得なし。'); }
    } },
  { id:"wisp_ominous_deal", name:"不吉な取引", category:"misc", cost:0, icon:"🩸", desc:"プレイヤー体力を4失う。2ゴールドを獲得する。", effect:(state, rng, helpers) => { helpers.addGold(2); helpers.showMsg('🩸 不吉な取引: 2G獲得！'); } },
  { id:"wisp_ceasefire", name:"停戦協定", category:"economy", cost:0, icon:"🤝", desc:"1ゴールドを獲得する。相手は1ゴールドを獲得する。", effect:(state, rng, helpers) => { helpers.addGold(1); helpers.showMsg('🤝 停戦協定: 1G獲得！'); } },
  { id:"wisp_novice_transmute", name:"初級変身術", category:"risky", cost:0, icon:"🧪", desc:"所持しているランダムなコスト1のユニット1体が、コスト2のユニット1体に恒久的に変化する。", effect:(state, rng, helpers) => {
      const owned = [...(state.board || []), ...(state.bench || [])].filter(u => u && !u.isAnvil && u.cost === 1);
      if (!owned.length) { helpers.showMsg('🧪 初級変身術: 対象のコスト1ユニットがいません'); return; }
      const target = owned[Math.floor(rng() * owned.length)];
      const nc = helpers.transmuteUnitByUid(target.uid, 2, rng);
      if (nc) helpers.showMsg(`🧪 初級変身術: ${target.jaName} → ${nc.jaName}！`);
    } },
  { id:"wisp_found_friend", name:"友だち見つけた", category:"combat", cost:0, icon:"🧸", desc:"「ジャイアント ベルト」を装備した一時的なダミーを1体獲得する。", effect:(state, rng, helpers) => { helpers.addPassiveBuff({ type: 'wisp_temp_dummy' }); helpers.showMsg('🧸 友だち見つけた: 一時的な仲間が加勢！'); } },
  { id:"wisp_transmute", name:"変身術", category:"risky", cost:0, icon:"⚗️", desc:"所持しているランダムなコスト2のユニット1体が、コスト3のユニット1体に恒久的に変化する。", effect:(state, rng, helpers) => {
      const owned = [...(state.board || []), ...(state.bench || [])].filter(u => u && !u.isAnvil && u.cost === 2);
      if (!owned.length) { helpers.showMsg('⚗️ 変身術: 対象のコスト2ユニットがいません'); return; }
      const target = owned[Math.floor(rng() * owned.length)];
      const nc = helpers.transmuteUnitByUid(target.uid, 3, rng);
      if (nc) helpers.showMsg(`⚗️ 変身術: ${target.jaName} → ${nc.jaName}！`);
    } },
  { id:"wisp_trinket_bottle", name:"小物瓶", category:"misc", cost:0, icon:"🍾", desc:"攻撃力または攻撃速度を付与するランダムな消費アイテムを1個獲得する。", effect:(state, rng, helpers) => { const it = ITEMS[Math.floor(rng() * ITEMS.length)]; helpers.addItem({ ...it }); helpers.showMsg(`🍾 小物瓶: ${it.jaName}を獲得！`); } },
  { id:"wisp_early_fix", name:"早期修正", category:"misc", cost:0, icon:"🔧", desc:"「再合成装置」を1個獲得する。", effect:(state, rng, helpers) => { helpers.addItem({ ...CONSUMABLES.REFORGER }); helpers.showMsg('🔧 早期修正: 再合成装置を獲得！'); } },
  { id:"wisp_bark_armor", name:"樹皮アーマー", category:"combat", cost:0, icon:"🛡️", desc:"味方チャンピオンが10秒間、耐久値150のシールドを獲得する。", effect:(state, rng, helpers) => { helpers.addPassiveBuff({ type: 'wisp_bark_armor' }); helpers.showMsg('🛡️ 樹皮アーマー: 次の戦闘でシールドを獲得！'); } },
  { id:"wisp_gadget_bottle", name:"装置瓶", category:"misc", cost:0, icon:"⚙️", desc:"物理防御と魔法防御、または体力を付与するランダムな消費アイテムを1個獲得する。", effect:(state, rng, helpers) => { const it = ITEMS[Math.floor(rng() * ITEMS.length)]; helpers.addItem({ ...it }); helpers.showMsg(`⚙️ 装置瓶: ${it.jaName}を獲得！`); } },
  { id:"wisp_overflow_water", name:"あふれる水", category:"misc", cost:1, icon:"💦", desc:"連勝数が1増える。", effect:(state, rng, helpers) => { helpers.addPassiveBuff({ type: 'wisp_winstreak_plus' }); helpers.showMsg('💦 あふれる水: 連勝数+1（記録のみ）'); } },
  { id:"wisp_all2", name:"オール2", category:"shop", cost:1, icon:"🔀", desc:"コスト2チャンピオンのみが並ぶショップのリロールを行う。", effect:(state, rng, helpers) => {
      const pool = CHAMPS.filter(c => c.cost === 2);
      const ns = Array(5).fill(null).map(() => ({ ...pool[Math.floor(rng() * pool.length)], uid: rng(), star: 1 }));
      helpers.setShop(ns);
      helpers.showMsg('🔀 オール2: コスト2のみのショップにリロール！');
    } },
  { id:"wisp_have_one", name:"おひとつどうぞ", category:"misc", cost:1, icon:"🎁", desc:"敗北しても敵を1体以上キルしていれば、4XPを獲得する。", effect:(state, rng, helpers) => { helpers.showMsg('🎁 おひとつどうぞ:（対戦結果に依存するため今回は効果なし）'); } },
  { id:"wisp_minor_chaos", name:"下級カオス", category:"risky", cost:1, icon:"🌀", desc:"ランダムなウィスプを1つ使用する。", effect:(state, rng, helpers) => {
      const pool = WISPS_DATA.filter(w => w.id !== 'wisp_minor_chaos' && typeof w.effect === 'function');
      if (!pool.length) return;
      const picked = pool[Math.floor(rng() * pool.length)];
      helpers.showMsg(`🌀 下級カオス: 「${picked.name}」を代わりに使用！`);
      try { picked.effect(state, rng, helpers); } catch (e) { console.error('wisp chain effect error', e); }
    } },
  { id:"wisp_opening_book", name:"定跡(初級)", category:"economy", cost:1, icon:"📖", desc:"次の対人戦で勝利すると、2ゴールドを獲得する。", effect:(state, rng, helpers) => { helpers.showMsg('📖 定跡(初級):（対戦結果に依存するため今回は効果なし）'); } },
  { id:"wisp_drought", name:"日照り", category:"misc", cost:1, icon:"☀️", desc:"連敗数が2増えます。", effect:(state, rng, helpers) => { helpers.addPassiveBuff({ type: 'wisp_lossstreak_plus' }); helpers.showMsg('☀️ 日照り: 連敗数+2（記録のみ）'); } },
  { id:"wisp_mitosis", name:"有糸分裂", category:"item", cost:1, icon:"🧫", desc:"「小さなチャンピオン複製器」を1個獲得する。", effect:(state, rng, helpers) => { helpers.addItem({ ...CONSUMABLES.TINY_DUPE }); helpers.showMsg('🧫 有糸分裂: 小さなチャンピオン複製器を獲得！'); } },
  { id:"wisp_life_drain", name:"生気吸引", category:"combat", cost:1, icon:"🩸", desc:"この戦闘で追加の「魔女」エッセンスを50%獲得する。", effect:(state, rng, helpers) => { helpers.showMsg('🩸 生気吸引:（このシムは戦闘を扱わないため効果なし）'); } },
  { id:"wisp_veteran", name:"経験者", category:"economy", cost:1, icon:"🎓", desc:"経験値を2 XP獲得する。", effect:(state, rng, helpers) => { helpers.addXp(2); helpers.showMsg('🎓 経験者: 2XP獲得！'); } },
  { id:"wisp_fertilizer", name:"肥料", category:"economy", cost:1, icon:"🌾", desc:"敵がキルされるたびに、経験値を1XP獲得する。", effect:(state, rng, helpers) => { helpers.showMsg('🌾 肥料:（このシムは戦闘を扱わないため効果なし）'); } },
  { id:"wisp_artifactinate", name:"アーティファクティネート", category:"item", cost:2, icon:"🔺", desc:"素材アイテムを3個失う。アイテムに組み込まれているものも含む。「アーティファクトの金床」を1個獲得する。", effect:(state, rng, helpers) => {
      helpers.removeCompItems(3);
      helpers.addAnvilToBench('artifact', 1);
      helpers.showMsg('🔺 アーティファクティネート: アーティファクトの金床を獲得！');
    } },
  { id:"wisp_trophy_hunter", name:"トロフィー ハンター", category:"combat", cost:2, icon:"🏆", desc:"ライバルからのキル/アシストを追加で100%獲得する。", effect:(state, rng, helpers) => { helpers.showMsg('🏆 トロフィー ハンター:（このシムは戦闘を扱わないため効果なし）'); } },
  { id:"wisp_free_roller", name:"フリーローラー", category:"shop", cost:2, icon:"🎲", desc:"2回分のリロールを獲得する。", effect:(state, rng, helpers) => { helpers.addFreeRerolls(2); helpers.showMsg('🎲 フリーローラー: 無料リロール+2！'); } },
  { id:"wisp_propagation", name:"伝播", category:"champion", cost:2, icon:"🧬", desc:"最初に倒された味方チャンピオンのコピーを1体獲得する。", effect:(state, rng, helpers) => { helpers.showMsg('🧬 伝播:（このシムは戦闘を扱わないため効果なし）'); } },
  { id:"wisp_healing_pool", name:"回復プール", category:"misc", cost:2, icon:"💧", desc:"プレイヤー体力を5回復する。", effect:(state, rng, helpers) => { helpers.showMsg('💧 回復プール:（体力システムがこのシムに無いため効果なし）'); } },
  { id:"wisp_golden_path", name:"黄金の道", category:"economy", cost:2, icon:"🛤️", desc:"対人戦を3回行ったあと、1勝利あたり2ゴールドを獲得する。", effect:(state, rng, helpers) => { helpers.showMsg('🛤️ 黄金の道:（対戦結果に依存するため今回は効果なし）'); } },
  { id:"wisp_starting_town", name:"はじまりの街", category:"shop", cost:3, icon:"🏘️", desc:"★2のコスト1チャンピオンのみが並ぶショップのリロールを行う。", effect:(state, rng, helpers) => {
      const pool = CHAMPS.filter(c => c.cost === 1);
      const ns = Array(5).fill(null).map(() => ({ ...pool[Math.floor(rng() * pool.length)], uid: rng(), star: 2 }));
      helpers.setShop(ns);
      helpers.showMsg('🏘️ はじまりの街: ★2のコスト1のみのショップにリロール！');
    } },
  { id:"wisp_bronze_spoon", name:"ブロンズ スプーン", category:"economy", cost:3, icon:"🥄", desc:"経験値を4 XP獲得する。", effect:(state, rng, helpers) => { helpers.addXp(4); helpers.showMsg('🥄 ブロンズ スプーン: 4XP獲得！'); } },
  { id:"wisp_blood_ritual", name:"血の儀式(初級)", category:"item", cost:3, icon:"🩸", desc:"プレイヤー体力を3失う。「小型チャンピオン複製器」を1個獲得する。", effect:(state, rng, helpers) => { helpers.addItem({ ...CONSUMABLES.LESSER_DUPE }); helpers.showMsg('🩸 血の儀式(初級): 小型チャンピオン複製器を獲得！'); } },
  { id:"wisp_apprentice", name:"見習い", category:"champion", cost:3, icon:"🌱", desc:"ランダムな★2のコスト1チャンピオンを1体獲得する。", effect:(state, rng, helpers) => {
      const pool = CHAMPS.filter(c => c.cost === 1);
      const c = pool[Math.floor(rng() * pool.length)];
      helpers.addChampToBenchDirect({ ...c, star: 2, uid: rng(), items: [] });
      helpers.showMsg(`🌱 見習い: ★★${c.jaName}を獲得！`);
    } },
  { id:"wisp_lost_travelers", name:"迷える旅人たち", category:"champion", cost:3, icon:"🧭", desc:"3ゴールドに相当するランダムなチャンピオンを獲得する。", effect:(state, rng, helpers) => {
      const pool = CHAMPS.filter(c => c.cost === 3);
      const c = pool[Math.floor(rng() * pool.length)];
      helpers.addChampToBenchDirect({ ...c, star: 1, uid: rng(), items: [] });
      helpers.showMsg(`🧭 迷える旅人たち: ${c.jaName}を獲得！`);
    } },
  { id:"wisp_heated_rivalry", name:"過熱するライバル関係", category:"champion", cost:3, icon:"🔥", desc:"レンガーまたはカ＝ジックスを1体獲得する。キルまたはアシストを3回達成する。", effect:(state, rng, helpers) => {
      const ids = ['rengar', 'khazix'];
      const c = CHAMPS.find(x => x.id === ids[Math.floor(rng() * ids.length)]);
      if (c) { helpers.addChampToBenchDirect({ ...c, star: 1, uid: rng(), items: [] }); helpers.showMsg(`🔥 過熱するライバル関係: ${c.jaName}を獲得！`); }
    } },
  { id:"wisp_forest_twins", name:"森の双子", category:"champion", cost:4, icon:"🌳", desc:"所持していないコスト2のチャンピオンを2体獲得する。", effect:(state, rng, helpers) => {
      const ownedIds = new Set([...(state.board || []), ...(state.bench || [])].filter(u => u && !u.isAnvil).map(u => u.id));
      const tmp = CHAMPS.filter(c => c.cost === 2 && !ownedIds.has(c.id));
      const chosen = [];
      for (let i = 0; i < 2 && tmp.length; i++) { const idx = Math.floor(rng() * tmp.length); chosen.push(tmp.splice(idx, 1)[0]); }
      chosen.forEach(c => helpers.addChampToBenchDirect({ ...c, star: 1, uid: rng(), items: [] }));
      helpers.showMsg(chosen.length ? `🌳 森の双子: ${chosen.map(c => c.jaName).join('・')}を獲得！` : '🌳 森の双子: 対象となる未所持のコスト2チャンピオンがいません');
    } },
  { id:"wisp_forest_guide", name:"森のガイド", category:"champion", cost:5, icon:"🧙", desc:"ランダムなコスト4のチャンピオンを1体獲得する。", effect:(state, rng, helpers) => {
      const pool = CHAMPS.filter(c => c.cost === 4);
      const c = pool[Math.floor(rng() * pool.length)];
      helpers.addChampToBenchDirect({ ...c, star: 1, uid: rng(), items: [] });
      helpers.showMsg(`🧙 森のガイド: ${c.jaName}を獲得！`);
    } },
  { id:"wisp_suns_gift", name:"太陽の贈り物", category:"champion", cost:6, icon:"☀️", desc:"レオナ、セジュアニ、ケイルを1体ずつ獲得する", effect:(state, rng, helpers) => {
      ['leona', 'sejuani', 'kayle'].forEach(id => {
        const c = CHAMPS.find(x => x.id === id);
        if (c) helpers.addChampToBenchDirect({ ...c, star: 1, uid: rng(), items: [] });
      });
      helpers.showMsg('☀️ 太陽の贈り物: レオナ・セジュアニ・ケイルを獲得！');
    } },
  { id:"wisp_wanderer", name:"渡り人", category:"champion", cost:6, icon:"🚶", desc:"ランダムな★2のコスト2チャンピオンを1体獲得する。", effect:(state, rng, helpers) => {
      const pool = CHAMPS.filter(c => c.cost === 2);
      const c = pool[Math.floor(rng() * pool.length)];
      helpers.addChampToBenchDirect({ ...c, star: 2, uid: rng(), items: [] });
      helpers.showMsg(`🚶 渡り人: ★★${c.jaName}を獲得！`);
    } },
];
