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
  economy: '#4B52E3',
  shop: '#FFBA38',
  champion: '#E13062',
  item: '#11ECB9',
  risky: '#c084fc',
  combat: '#F56653',
  misc: '#99F252',
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

/* ── Wisp データ本体（39種・公式一覧準拠） ──
   appear: 公式の出現ラウンド（表示用）／ cond: 公式の出現条件（表示用）
   req: シムでの出現判定に使う条件キー（app.js の wispReqOk が解釈。すべて満たすと2-1の抽選対象）
     gold:N       … Nゴールド以上            hpOver:N / hpLost:N … 体力がNより多い／N以上減っている
     own:N        … コストNのチャンピオンを所持  trait:X     … 特性Xが発動中（盤面）
     winStreak:N  … N連勝以上                 lossStreak:N … N連敗以上
     comps:N      … 素材アイテムがN個以上（完成品は2個と数える）
     itemCarry:ap/ad … アイテムを装備したタンク以外のチャンピオンがいる（魔法/物理の区別は未実装）
     aug:id,id    … いずれかのオーグメントを所持
     先頭に ! を付けると否定（例: !trait:Coven ＝ 魔女が未発動） */
const WISPS_DATA = [
  { id:"wisp_all1", name:"オール1", category:"shop", cost:0, icon:"🔀", desc:"コスト1チャンピオンのみが並ぶショップをリロールする。", appear:"2-1〜2-7", cond:"5ゴールド以上", req:["gold:5"], effect:(state, rng, helpers) => {
      const pool = CHAMPS.filter(c => c.cost === 1);
      const ns = Array(5).fill(null).map(() => ({ ...pool[Math.floor(rng() * pool.length)], uid: rng(), star: 1 }));
      helpers.setShop(ns);
      helpers.showMsg('🔀 オール1: コスト1のみのショップにリロール！');
    } },
  { id:"wisp_begging", name:"おねだりウィスプ", category:"economy", cost:0, icon:"🙏", desc:"今回のロールでは、ウィスプが見つからなかった。2ゴールドを獲得する。", appear:"2-1〜", cond:"", req:[], effect:(state, rng, helpers) => { helpers.addGold(2); helpers.showMsg('🙏 おねだりウィスプ: 2G獲得！'); } },
  { id:"wisp_junk_bottle", name:"がらくた瓶", category:"misc", cost:0, icon:"🧴", desc:"魔力またはマナ自動回復を恒久的に付与する消費アイテムを1個獲得する。", appear:"2-1〜2-7", cond:"アイテムを装備した魔法ダメージのキャスター・ファイター・マークスマンまたはアサシンがいる／体力が20より多い", req:["itemCarry:ap", "hpOver:20"], effect:(state, rng, helpers) => { const it = ITEMS[Math.floor(rng() * ITEMS.length)]; helpers.addItem({ ...it }); helpers.showMsg(`🧴 がらくた瓶: ${it.jaName}を獲得！`); } },
  { id:"wisp_coin_toss", name:"コイントス", category:"economy", cost:0, icon:"🪙", desc:"コインを投げ、表が出た場合1ゴールドを獲得する。", appear:"2-1〜2-7", cond:"", req:[], effect:(state, rng, helpers) => {
      if (rng() < 0.5) { helpers.addGold(1); helpers.showMsg('🪙 コイントス: 表！1G獲得！'); }
      else { helpers.showMsg('🪙 コイントス: 裏…獲得なし。'); }
    } },
  { id:"wisp_ominous_deal", name:"不吉な取引", category:"misc", cost:0, icon:"🩸", desc:"プレイヤー体力を4失う。2ゴールドを獲得する。", appear:"2-1〜3-4", cond:"体力が4より多い", req:["hpOver:4"], effect:(state, rng, helpers) => { helpers.addGold(2); helpers.showMsg('🩸 不吉な取引: 2G獲得！'); }, tier:2 },
  { id:"wisp_ceasefire", name:"停戦協定", category:"economy", cost:0, icon:"🤝", desc:"1ゴールドを獲得する。相手は1ゴールドを獲得する。", appear:"2-1〜2-7", cond:"", req:[], effect:(state, rng, helpers) => { helpers.addGold(1); helpers.showMsg('🤝 停戦協定: 1G獲得！'); } },
  { id:"wisp_novice_transmute", name:"変身術(初級)", category:"risky", cost:0, icon:"🧪", desc:"所持しているランダムなコスト1のユニット1体が、コスト2のユニット1体に恒久的に変化する。", appear:"2-1〜3-4", cond:"1コストのチャンピオンがいる／準備フェーズの最初の2秒のみ／次のオーグメントを持っていない: 偵察なし、変更なし", req:["own:1", "!aug:no_scouting_no_pivoting"], effect:(state, rng, helpers) => {
      const owned = [...(state.board || []), ...(state.bench || [])].filter(u => u && !u.isAnvil && u.cost === 1);
      if (!owned.length) { helpers.showMsg('🧪 変身術(初級): 対象のコスト1ユニットがいません'); return; }
      const target = owned[Math.floor(rng() * owned.length)];
      const nc = helpers.transmuteUnitByUid(target.uid, 2, rng);
      if (nc) helpers.showMsg(`🧪 変身術(初級): ${target.jaName} → ${nc.jaName}！`);
    } },
  { id:"wisp_found_friend", name:"友だち見つけた", category:"combat", cost:0, icon:"🧸", desc:"「ジャイアント ベルト」を装備した一時的なダミーを1体獲得する。", appear:"2-1〜2-7", cond:"連勝中", req:["winStreak:1"], effect:(state, rng, helpers) => { helpers.addPassiveBuff({ type: 'wisp_temp_dummy' }); helpers.showMsg('🧸 友だち見つけた: 一時的な仲間が加勢！'); } },
  { id:"wisp_transmute", name:"変身術", category:"risky", cost:0, icon:"⚗️", desc:"所持しているランダムなコスト2のユニット1体が、コスト3のユニット1体に恒久的に変化する。", appear:"2-1〜4-1", cond:"2コストのチャンピオンがいる／準備フェーズの最初の2秒のみ／次のオーグメントを持っていない: 偵察なし、変更なし", req:["own:2", "!aug:no_scouting_no_pivoting"], effect:(state, rng, helpers) => {
      const owned = [...(state.board || []), ...(state.bench || [])].filter(u => u && !u.isAnvil && u.cost === 2);
      if (!owned.length) { helpers.showMsg('⚗️ 変身術: 対象のコスト2ユニットがいません'); return; }
      const target = owned[Math.floor(rng() * owned.length)];
      const nc = helpers.transmuteUnitByUid(target.uid, 3, rng);
      if (nc) helpers.showMsg(`⚗️ 変身術: ${target.jaName} → ${nc.jaName}！`);
    } },
  { id:"wisp_trinket_bottle", name:"小物瓶", category:"misc", cost:0, icon:"🍾", desc:"攻撃力または攻撃速度を恒久的に付与する消費アイテムを1個獲得する。", appear:"2-1〜2-7", cond:"アイテムを装備した物理ダメージのアサシン・キャスター・マークスマン・ファイターまたはスペシャリストがいる／体力が20より多い", req:["itemCarry:ad", "hpOver:20"], effect:(state, rng, helpers) => { const it = ITEMS[Math.floor(rng() * ITEMS.length)]; helpers.addItem({ ...it }); helpers.showMsg(`🍾 小物瓶: ${it.jaName}を獲得！`); } },
  { id:"wisp_early_fix", name:"早期修正", category:"misc", cost:0, icon:"🔧", desc:"「再合成装置」を1個獲得する。", appear:"2-1〜2-7", cond:"", req:[], effect:(state, rng, helpers) => { helpers.addItem({ ...CONSUMABLES.REFORGER }); helpers.showMsg('🔧 早期修正: 再合成装置を獲得！'); } },
  { id:"wisp_bark_armor", name:"樹皮アーマー", category:"combat", cost:0, icon:"🛡️", desc:"味方チャンピオンが10秒間、耐久値150のシールドを獲得する。", appear:"2-1〜2-7", cond:"連勝中", req:["winStreak:1"], effect:(state, rng, helpers) => { helpers.addPassiveBuff({ type: 'wisp_bark_armor' }); helpers.showMsg('🛡️ 樹皮アーマー: 次の戦闘でシールドを獲得！'); } },
  { id:"wisp_gadget_bottle", name:"装置瓶", category:"misc", cost:0, icon:"⚙️", desc:"物理防御と魔法防御、または体力を恒久的に付与する消費アイテムを1個獲得する。", appear:"2-1〜2-7", cond:"体力が20より多い", req:["hpOver:20"], effect:(state, rng, helpers) => { const it = ITEMS[Math.floor(rng() * ITEMS.length)]; helpers.addItem({ ...it }); helpers.showMsg(`⚙️ 装置瓶: ${it.jaName}を獲得！`); }, tier:2 },
  { id:"wisp_overflow_water", name:"あふれる水", category:"risky", cost:1, icon:"💦", desc:"連勝数が1増える。", appear:"2-1〜2-7", cond:"連勝も連敗もしていないまたは連勝中", req:["!lossStreak:1"], effect:(state, rng, helpers) => { helpers.addPassiveBuff({ type: 'wisp_winstreak_plus' }); helpers.showMsg('💦 あふれる水: 連勝数+1（記録のみ）'); } },
  { id:"wisp_all2", name:"オール2", category:"shop", cost:1, icon:"🔀", desc:"コスト2チャンピオンのみが並ぶショップをリロールする。", appear:"2-1〜3-4", cond:"5ゴールド以上", req:["gold:5"], effect:(state, rng, helpers) => {
      const pool = CHAMPS.filter(c => c.cost === 2);
      const ns = Array(5).fill(null).map(() => ({ ...pool[Math.floor(rng() * pool.length)], uid: rng(), star: 1 }));
      helpers.setShop(ns);
      helpers.showMsg('🔀 オール2: コスト2のみのショップにリロール！');
    } },
  { id:"wisp_have_one", name:"おひとつどうぞ", category:"risky", cost:1, icon:"🎁", desc:"敗北しても敵を1体以上キルしていれば、4XPを獲得する。", appear:"2-1〜2-7", cond:"3連勝以上していない", req:["!winStreak:3"], effect:(state, rng, helpers) => { helpers.showMsg('🎁 おひとつどうぞ:（対戦結果に依存するため今回は効果なし）'); } },
  { id:"wisp_minor_chaos", name:"下級カオス", category:"misc", cost:1, icon:"🌀", desc:"ランダムなウィスプを1つ使用する。", appear:"2-1〜3-4", cond:"", req:[], effect:(state, rng, helpers) => {
      const pool = WISPS_DATA.filter(w => w.id !== 'wisp_minor_chaos' && !w.hidden && typeof w.effect === 'function');
      if (!pool.length) return;
      const picked = pool[Math.floor(rng() * pool.length)];
      helpers.showMsg(`🌀 下級カオス: 「${picked.name}」を代わりに使用！`);
      try { picked.effect(state, rng, helpers); } catch (e) { console.error('wisp chain effect error', e); }
    } },
  { id:"wisp_opening_book", name:"定跡(初級)", category:"risky", cost:1, icon:"📖", desc:"次の対人戦で勝利すると、2ゴールドを獲得する。", appear:"2-1〜2-7", cond:"3連敗以上していない／魔女が未発動", req:["!lossStreak:3", "!trait:Coven"], effect:(state, rng, helpers) => { helpers.showMsg('📖 定跡(初級):（対戦結果に依存するため今回は効果なし）'); } },
  { id:"wisp_drought", name:"日照り", category:"risky", cost:1, icon:"☀️", desc:"連敗数が2増えます。", appear:"2-1〜2-7", cond:"連勝も連敗もしていないまたは連敗中", req:["!winStreak:1"], effect:(state, rng, helpers) => { helpers.addPassiveBuff({ type: 'wisp_lossstreak_plus' }); helpers.showMsg('☀️ 日照り: 連敗数+2（記録のみ）'); } },
  { id:"wisp_mitosis", name:"有糸分裂", category:"champion", cost:1, icon:"🧫", desc:"「小さなチャンピオン複製器」を1個獲得する。", appear:"2-1〜2-7", cond:"", req:[], effect:(state, rng, helpers) => { helpers.addItem({ ...CONSUMABLES.TINY_DUPE }); helpers.showMsg('🧫 有糸分裂: 小さなチャンピオン複製器を獲得！'); } },
  { id:"wisp_life_drain", name:"生気吸引", category:"risky", cost:1, icon:"🩸", desc:"この戦闘で追加の「魔女」エッセンスを50%獲得する。", appear:"2-1〜4-1", cond:"魔女が発動中", req:["trait:Coven"], effect:(state, rng, helpers) => { helpers.showMsg('🩸 生気吸引:（このシムは戦闘を扱わないため効果なし）'); } },
  { id:"wisp_veteran", name:"経験者", category:"economy", cost:1, icon:"🎓", desc:"経験値を2XP獲得する。", appear:"2-1〜2-7", cond:"", req:[], effect:(state, rng, helpers) => { helpers.addXp(2); helpers.showMsg('🎓 経験者: 2XP獲得！'); } },
  { id:"wisp_fertilizer", name:"肥料", category:"risky", cost:1, icon:"🌾", desc:"敵がキルされるたびに、1XPを獲得する。", appear:"2-1〜3-4", cond:"", req:[], effect:(state, rng, helpers) => { helpers.showMsg('🌾 肥料:（このシムは戦闘を扱わないため効果なし）'); } },
  { id:"wisp_artifactinate", name:"アーティファクティネート", category:"item", cost:2, icon:"🔺", desc:"素材アイテムを3個失う。アイテムに組み込まれているものも含む。「アーティファクトの金床」を1個獲得する。", appear:"2-1〜3-4", cond:"素材アイテムが3個以上 (完成品も数える)／ほかのウィスプが20回出るまで再登場しない／次のオーグメントを持っていない: リデンプションの魂・確約された守護・ラッキーグローブ・ラッキーグローブ+・一人前プレート・セラフィムの杖・デッドリアー ブレード・もっと怖いキャップ・歩く鍛冶場・力に鍛えられしもの・ポータブル フォージ", req:["comps:3", "!aug:redemption_soul,guaranteed_protection,lucky_gloves,single_plate,seraphims_staff,deadlier_blade,scarier_cap,living_forge,forged_in_force,portable_forge"], effect:(state, rng, helpers) => {
      helpers.removeCompItems(3);
      helpers.addAnvilToBench('artifact', 1);
      helpers.showMsg('🔺 アーティファクティネート: アーティファクトの金床を獲得！');
    }, tier:2 },
  { id:"wisp_trophy_hunter", name:"トロフィー ハンター", category:"risky", cost:2, icon:"🏆", desc:"次の対人戦では、「ライバル」のキルまたはアシストが2倍としてカウントされる。", appear:"2-1〜4-7", cond:"ライバルが発動中", req:["trait:Rival"], effect:(state, rng, helpers) => { helpers.showMsg('🏆 トロフィー ハンター:（このシムは戦闘を扱わないため効果なし）'); } },
  { id:"wisp_free_roller", name:"フリーローラー", category:"shop", cost:2, icon:"🎲", desc:"2回分のリロールを獲得する。", appear:"2-1〜4-1", cond:"", req:[], effect:(state, rng, helpers) => { helpers.addFreeRerolls(2); helpers.showMsg('🎲 フリーローラー: 無料リロール+2！'); } },
  { id:"wisp_propagation", name:"伝播", category:"champion", cost:2, icon:"🧬", desc:"最初に倒された味方チャンピオンのコピーを1体獲得する。", appear:"2-1〜4-1", cond:"", req:[], effect:(state, rng, helpers) => { helpers.showMsg('🧬 伝播:（このシムは戦闘を扱わないため効果なし）'); }, tier:2 },
  { id:"wisp_healing_pool", name:"回復プール", category:"misc", cost:2, icon:"💧", desc:"プレイヤー体力を5回復する。", appear:"2-1〜3-4", cond:"体力が10以上減っている／ほかのウィスプが10回出るまで再登場しない", req:["hpLost:10"], effect:(state, rng, helpers) => { helpers.showMsg('💧 回復プール:（体力システムがこのシムに無いため効果なし）'); }, tier:2 },
  { id:"wisp_golden_path", name:"黄金の道", category:"risky", cost:2, icon:"🛤️", desc:"対人戦を3回行うと、1勝利あたり2ゴールドを獲得する。", appear:"2-1〜3-4", cond:"3連敗以上していない", req:["!lossStreak:3"], effect:(state, rng, helpers) => { helpers.showMsg('🛤️ 黄金の道:（対戦結果に依存するため今回は効果なし）'); }, tier:2 },
  { id:"wisp_starting_town", name:"はじまりの街", category:"shop", cost:2, icon:"🏘️", desc:"★2のコスト1チャンピオンのみが並ぶショップでリロールを行う。", appear:"2-1〜3-4", cond:"", req:[], effect:(state, rng, helpers) => {
      const pool = CHAMPS.filter(c => c.cost === 1);
      const ns = Array(5).fill(null).map(() => ({ ...pool[Math.floor(rng() * pool.length)], uid: rng(), star: 2 }));
      helpers.setShop(ns);
      helpers.showMsg('🏘️ はじまりの街: ★2のコスト1のみのショップにリロール！');
    }, tier:3 },
  { id:"wisp_bronze_spoon", name:"ブロンズ スプーン", category:"economy", cost:3, icon:"🥄", desc:"経験値を4XP獲得する。", appear:"2-1〜4-1", cond:"", req:[], effect:(state, rng, helpers) => { helpers.addXp(4); helpers.showMsg('🥄 ブロンズ スプーン: 4XP獲得！'); }, tier:2 },
  { id:"wisp_blood_ritual", name:"血の儀式(初級)", category:"misc", cost:3, icon:"🩸", desc:"プレイヤー体力を3失う。「小型チャンピオン複製器」を1個獲得する。", appear:"2-1〜3-4", cond:"体力が3より多い", req:["hpOver:3"], effect:(state, rng, helpers) => { helpers.addItem({ ...CONSUMABLES.LESSER_DUPE }); helpers.showMsg('🩸 血の儀式(初級): 小型チャンピオン複製器を獲得！'); }, tier:2 },
  { id:"wisp_apprentice", name:"見習い", category:"champion", cost:3, icon:"🌱", desc:"ランダムな★2のコスト1チャンピオンを1体獲得する。", appear:"2-1〜2-7", cond:"", req:[], effect:(state, rng, helpers) => {
      const pool = CHAMPS.filter(c => c.cost === 1);
      const c = pool[Math.floor(rng() * pool.length)];
      helpers.addChampToBenchDirect({ ...c, star: 2, uid: rng(), items: [] });
      helpers.showMsg(`🌱 見習い: ★★${c.jaName}を獲得！`);
    }, tier:2 },
  { id:"wisp_lost_travelers", name:"迷える旅人たち", category:"champion", cost:3, icon:"🧭", desc:"3ゴールドに相当するランダムなチャンピオンを獲得する。", appear:"2-1〜2-7", cond:"", req:[], effect:(state, rng, helpers) => {
      const pool = CHAMPS.filter(c => c.cost === 3);
      const c = pool[Math.floor(rng() * pool.length)];
      helpers.addChampToBenchDirect({ ...c, star: 1, uid: rng(), items: [] });
      helpers.showMsg(`🧭 迷える旅人たち: ${c.jaName}を獲得！`);
    } },
  { id:"wisp_heated_rivalry", name:"過熱するライバル関係", category:"champion", cost:3, icon:"🔥", desc:"レンガーまたはカ＝ジックスを1体獲得する。キルまたはアシストを3回達成する。", appear:"2-1〜2-7", cond:"", req:[], effect:(state, rng, helpers) => {
      const ids = ['rengar', 'khazix'];
      const c = CHAMPS.find(x => x.id === ids[Math.floor(rng() * ids.length)]);
      if (c) { helpers.addChampToBenchDirect({ ...c, star: 1, uid: rng(), items: [] }); helpers.showMsg(`🔥 過熱するライバル関係: ${c.jaName}を獲得！`); }
    } },
  { id:"wisp_forest_twins", name:"森の双子", category:"champion", cost:4, icon:"🌳", desc:"所持していないコスト2のチャンピオンを2体獲得する。", appear:"2-1〜2-7", cond:"", req:[], effect:(state, rng, helpers) => {
      const ownedIds = new Set([...(state.board || []), ...(state.bench || [])].filter(u => u && !u.isAnvil).map(u => u.id));
      // 未所持のコスト2から1種類を選び、同じチャンピオンを2体獲得する（ベンチが満員なら空き待ち）
      const tmp = CHAMPS.filter(c => c.cost === 2 && !ownedIds.has(c.id));
      if (!tmp.length) { helpers.showMsg('🌳 森の双子: 対象となる未所持のコスト2チャンピオンがいません'); return; }
      const c = tmp[Math.floor(rng() * tmp.length)];
      helpers.addPendingUnits([{ ...c, star: 1, uid: rng(), items: [] }, { ...c, star: 1, uid: rng(), items: [] }]);
      helpers.showMsg(`🌳 森の双子: ${c.jaName}を2体獲得！`);
    }, tier:2 },
  { id:"wisp_forest_guide", name:"森のガイド", category:"champion", cost:6, icon:"🧙", desc:"ランダムなコスト4のチャンピオンを1体獲得する。", appear:"2-1〜2-7", cond:"", req:[], effect:(state, rng, helpers) => {
      const pool = CHAMPS.filter(c => c.cost === 4);
      const c = pool[Math.floor(rng() * pool.length)];
      helpers.addChampToBenchDirect({ ...c, star: 1, uid: rng(), items: [] });
      helpers.showMsg(`🧙 森のガイド: ${c.jaName}を獲得！`);
    }, tier:3 },
  { id:"wisp_suns_gift", name:"太陽の贈り物", category:"champion", cost:6, icon:"☀️", desc:"レオナ、セジュアニ、ケイルを1体ずつ獲得する。", appear:"2-1〜3-4", cond:"ソーラーが発動中", req:["trait:Solar"], effect:(state, rng, helpers) => {
      ['leona', 'sejuani', 'kayle'].forEach(id => {
        const c = CHAMPS.find(x => x.id === id);
        if (c) helpers.addChampToBenchDirect({ ...c, star: 1, uid: rng(), items: [] });
      });
      helpers.showMsg('☀️ 太陽の贈り物: レオナ・セジュアニ・ケイルを獲得！');
    }, tier:2 },
  { id:"wisp_wanderer", name:"渡り人", category:"champion", cost:6, icon:"🚶", desc:"ランダムな★2のコスト2チャンピオンを1体獲得する。", appear:"2-1〜3-4", cond:"", req:[], effect:(state, rng, helpers) => {
      const pool = CHAMPS.filter(c => c.cost === 2);
      const c = pool[Math.floor(rng() * pool.length)];
      helpers.addChampToBenchDirect({ ...c, star: 2, uid: rng(), items: [] });
      helpers.showMsg(`🚶 渡り人: ★★${c.jaName}を獲得！`);
    }, tier:2 },
];
