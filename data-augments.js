/* ============================================================
   データ: オーグメント
   ============================================================ */

/* ── オーグメントのカラー定義 ── */
const TIER_LABELS = { silver: '銀', gold: '金', prismatic: '虹' };
const TIER_COLORS = { silver: 'var(--silver)', gold: 'var(--gold2)', prismatic: 'var(--prismatic)' };

/* ── オーグメントデータ本体 ── */
const AUGMENTS_DATA = {
  silver: [
    {
      id: 'protectors_pact', name: '庇護者のお供', tier: 'silver', category: 'combat', imgName: 'caretaker_s-chosen-i',
      desc: '即座にランダムなコスト2のチャンピオンを1体獲得する。レベルアップするごとに同じユニットをもう1体獲得する。',
      icon: '🤝',
      effect: (state, rng, helpers) => {
        const pool = CHAMPS.filter(c => c.cost === 2);
        const chosen = pool[Math.floor(rng() * pool.length)];
        helpers.addPendingUnits([{ ...chosen, star: 1, uid: rng(), items: [] }]);
        helpers.addPassiveBuff({ type: 'protectors_pact', champId: chosen.id });
        helpers.showMsg(`🤝 庇護者のお供: ${chosen.jaName}を獲得！レベルアップごとに追加で獲得します。`);
      }
    },
    {
      id: 'stellar_combo', name: 'ステラコンボ', tier: 'silver', category: 'combat', imgName: 'aatroxhero_i',
      desc: 'エイトロックスを1体獲得する。最も強いエイトロックスが、3種類の異なる攻撃を切り替えられる攻撃力ファイターになる',
      icon: '🌟',
      effect: (state, rng, helpers) => {
        helpers.addPendingUnits([{ ...CHAMPS.find(c => c.id === 'aatrox'), star: 1, uid: rng(), items: [] }]);
        helpers.addPassiveBuff({ type: 'stellar_combo' });
        helpers.showMsg('🌟 ステラコンボ: エイトロックスを獲得し、盤面のエイトロックスが強化されます！');
      }
    },
    {
      id: 'terminal_velocity', name: 'ターミィプナル ヴェロシティー', tier: 'silver', category: 'combat', imgName: 'poppyhero_i',
      desc: 'ポッピーを1体獲得する。最も強いポッピーが遠隔攻撃力キャスターとなり、対象に高速でミィプを投げつける。',
      icon: '🌠',
      effect: (state, rng, helpers) => {
        helpers.addPendingUnits([{ ...CHAMPS.find(c => c.id === 'poppy'), star: 1, uid: rng(), items: [] }]);
        helpers.addPassiveBuff({ type: 'terminal_velocity' });
        helpers.showMsg('🌠 ターミィプナル ヴェロシティー: ポッピーを獲得し、盤面のポッピーが強化されます！');
      }
    },
    {
      id: 'shield_maiden', name: 'シールドメイデン', tier: 'silver', category: 'combat', imgName: 'leonahero_i',
      desc: 'レオナを1体獲得する。最も強いレオナが攻撃力ファイターとなり、敵の間をダッシュして物理ダメージを与え、最初に命中した対象をスタンさせる。',
      icon: '🛡️',
      effect: (state, rng, helpers) => {
        helpers.addPendingUnits([{ ...CHAMPS.find(c => c.id === 'leona'), star: 1, uid: rng(), items: [] }]);
        helpers.addPassiveBuff({ type: 'shield_maiden' });
        helpers.showMsg('🛡️ シールドメイデン: レオナを獲得し、盤面のレオナが強化されます！');
      }
    },
    {
      id: 'afk', name: 'AFK', tier: 'silver', category: 'economy', imgName: 'afk-i',
      desc: '次の3ラウンドの間、アクションを行えなくなる。その後、20ゴールドを獲得する。',
      icon: '💤',
      effect: (state, rng, helpers) => {
        helpers.setAfkRoundsLeft(3);
        helpers.showMsg('💤 AFK: 次の3ラウンドはアクション不可。3ラウンド後に20G獲得！');
      }
    },
    {
      id: 'silver_spoon', name: '銀の匙', tier: 'silver', category: 'economy', imgName: 'silver-spoon-i',
      desc: '経験値を10XP獲得する。',
      icon: '🥄',
      effect: (state, rng, helpers) => {
        helpers.addXp(10);
        helpers.showMsg('🥄 銀の匙: 10XP獲得！');
      }
    },
    {
      id: 'cognitive_tax', name: 'コグニティブ タックス', tier: 'silver', category: 'economy', imgName: 'cognitivetax_i',
      desc: '8ゴールドと1XPを獲得する。',
      icon: '🧠',
      effect: (state, rng, helpers) => {
        helpers.addGold(8);
        helpers.addXp(1);
        helpers.showMsg('🧠 コグニティブ タックス: 8G + 1XP 獲得！');
      }
    },
    {
      id: 'augment_power', name: 'オーグメントパワー', tier: 'silver', category: 'economy', imgName: 'powerup_i',
      desc: '次のオーグメントのティアが1つ高くなる。',
      icon: '⬆️',
      effect: (state, rng, helpers) => {
        helpers.setAugmentTierBoost(1);
        helpers.showMsg('⬆️ オーグメントパワー: 次のオーグメントのティアが上昇！');
      }
    },
    {
      id: 'one_two_three', name: '一二三', tier: 'silver', category: 'economy', imgName: 'threes-company-i',
      desc: 'コスト1のチャンピオンを2体、コスト2と3のチャンピオンを各1体獲得する。',
      icon: '1️⃣',
      effect: (state, rng, helpers) => {
        helpers.addChampToBench(1, 2, rng);
        helpers.addChampToBench(2, 1, rng);
        helpers.addChampToBench(3, 1, rng);
        helpers.showMsg('1️⃣ 一二三: 1コスト×2、2・3コスト各1獲得！');
      }
    },
    {
      id: 'thieves_guild', name: '盗賊団', tier: 'silver', category: 'item', imgName: 'bandthieves1',
      desc: '「盗賊のグローブ」1個を獲得。',
      icon: '🧤',
      effect: (state, rng, helpers) => {
        helpers.addItem({...ITEM_RECIPES['glove_glove'], type:'completed'});
      }
    },
    {
      id: 'item_loot_bag', name: 'アイテム福袋', tier: 'silver', category: 'item', imgName: 'itemgrabbag1',
      desc: 'ランダムな完成アイテム1個を獲得。',
      icon: '🎁',
      effect: (state, rng, helpers) => {
        const recipes = Object.values(ITEM_RECIPES);
        const item = {...recipes[Math.floor(rng() * recipes.length)], type:'completed'};
        helpers.addItem(item);
      }
    },
    {
      id: 'continuous_magic', name: '連続魔法', tier: 'silver', category: 'item', imgName: 'hyperbolicrodextender_i',
      desc: '「ムダニ デカイ ロッド」を1個獲得する。味方チームが38000の魔法ダメージを与えると、さらに2個獲得する。',
      icon: '🔮',
      effect: (state, rng, helpers) => {
        helpers.addItem({...ITEMS.find(i=>i.id==='rod')});
      }
    },
    {
      id: 'pave_the_way', name: '道を切り拓け', tier: 'silver', category: 'item', imgName: 'carveapath_i',
      desc: '「B.F.ソード」を1個獲得する。味方チームが65000の物理ダメージを与えると、さらに2個獲得する。。',
      icon: '⚔️',
      effect: (state, rng, helpers) => {
        helpers.addItem({...ITEMS.find(i=>i.id==='bf')});
      }
    },
    {
      id: 'extra_buckle', name: '追加のバックル', tier: 'silver', category: 'item', imgName: 'extrabuckles_i',
      desc: '「ジャイアント ベルト」を1個獲得する。味方チームが75000ダメージを受けると、さらに2個獲得する。',
      icon: '💖',
      effect: (state, rng, helpers) => {
        helpers.addItem({...ITEMS.find(i=>i.id==='belt')});
      }
    },
    {
      id: 'makeshift_armor1', name: '即席アーマー I', tier: 'silver', category: 'combat', imgName: 'makeshift1',
      desc: 'アイテムを装備していない味方の物理防御と魔法防御が30増加する。',
      icon: '🛡️',
      effect: (state, rng, helpers) => {
        helpers.addPassiveBuff({ type: 'makeshift_armor', value: 30 });
      }
    },
    {
      id: 'focused_fire', name: 'エクスペディション', tier: 'silver', category: 'combat', imgName: 'expedition_i',
      desc: '各ラウンドの開始時、ベンチの一番右にいるチャンピオンを失う。この方法で33ゴールド分のチャンピオンを失うと、強力な報酬を獲得する。即座にコスト3のチャンピオンを1体獲得する。',
      icon: '🔥',
      effect: (state, rng, helpers) => {
        helpers.addPassiveBuff({ type: 'focused_fire', value: 10 });
        const pool = CHAMPS.filter(c => c.cost === 3);
        const chosen = pool[Math.floor(rng() * pool.length)];
        const unitData = { ...chosen, star: 1, uid: rng(), items: [] };
        helpers.addPendingUnits([unitData]);
      }
    },
    {
      id: 'the_tower', name: 'ザ・タワー', tier: 'silver', category: 'combat', imgName: 'thetower_i',
      desc: '巨大な「訓練用ダミー」を獲得する。その体力は(ステージに応じて)増加する。4秒ごとに、最も近くにいる敵3体に対して電撃を放ち、それぞれに最大体力の5%にあたる確定ダメージを与える。',
      icon: '🗼',
      effect: (state, rng, helpers) => {
        helpers.addPassiveBuff({ type: 'the_tower' });
      }
    },
    {
      id: 'small_giant', name: '小さな巨人', tier: 'silver', category: 'combat', imgName: 'tiny-titans-i',
      desc: 'プレイヤーの現在体力と最大体力が30増加する。',
      icon: '🏔️',
      effect: (state, rng, helpers) => {
        helpers.addPassiveBuff({ type: 'hp_boost', value: 30 });
      }
    },
    {
      id: 'team_building', name: 'チーム構築', tier: 'silver', category: 'combat', imgName: 'building-an-army-i',
      desc: '「小型チャンピオン複製器」を1個獲得する。対人戦を5回行うと、さらにもう1個獲得する。',
      icon: '👥',
      effect: (state, rng, helpers) => {
        helpers.addItem({...CONSUMABLES.LESSER_DUPE});
      }
    },
    {
      id: 'branching_out', name: '構成拡大', tier: 'silver', category: 'item', imgName: 'branching-out-i',
      desc: 'ランダムな紋章アイテムを1個獲得する。',
      icon: '🛡️',
      effect: (state, rng, helpers) => {
        const recipes = Object.values(ITEM_RECIPES);
        const emblems = recipes.filter(r => r.grantedTrait);
        const randomEmblem = { ...emblems[Math.floor(rng() * emblems.length)], type: 'completed' };
        helpers.addItem(randomEmblem);
      }
    },
    {
      id: 'kickstart', name: 'キックスタート', tier: 'silver', category: 'economy', imgName: 'kickstart_i',
      desc: 'ランダムな★2のコスト2チャンピオンを1体と1ゴールドを獲得する。',
      icon: '⚡',
      effect: (state, rng, helpers) => {
        helpers.addGold(1);
        const pool = CHAMPS.filter(c => c.cost === 2);
        const chosen = pool[Math.floor(rng() * pool.length)];
        const unitData = { ...chosen, star: 2, uid: rng(), items: [] };
        helpers.addPendingUnits([unitData]);
      }
    },
    {
      id: 'fire_sale', name: 'ファイアセール', tier: 'silver', category: 'economy', imgName: 'firesale_i',
      desc: '毎ラウンド、ショップからランダムなコスト3以下のチャンピオンを1体盗む。1ゴールドを獲得する。',
      icon: '🔥',
      effect: (state, rng, helpers) => {
        helpers.addGold(1);
        helpers.showMsg('🔥 ファイアセール: 1Gを獲得しました！');
      }
    },
    {
      id: 'ordinary_days', name: '普通の日々', tier: 'silver', category: 'economy', imgName: 'slice_of_life_i',
      desc: 'ステージごとに2回、ランダムなチャンピオンを1体獲得する。そのコストはステージごとに増加する。この効果はコスト5のチャンピオンを1体入手すると終了する。',
      icon: '📆',
      effect: (state, rng, helpers) => {
        helpers.addPassiveBuff({ type: 'ordinary_days' });
      }
    },
    {
      id: 'well_earned_1', name: '有効活用 I', tier: 'silver', category: 'economy', imgName: 'good-for-something-i',
      desc: 'アイテムを装備していないチャンピオンが、デス時に40%の確率で1ゴールドをドロップする。',
      icon: '💰',
      effect: (state, rng, helpers) => {
        helpers.addPassiveBuff({ type: 'well_earned_1' });
      }
    },
    {
      id: 'support_bow', name: '援護の弓', tier: 'silver', category: 'item', imgName: 'recurvewrecker_i',
      desc: '「リカーブ ボウ」を1個獲得する。味方チームが通常攻撃を1000回行うと、さらに2個獲得する。',
      icon: '🏹',
      effect: (state, rng, helpers) => {
        helpers.addItem({...ITEMS.find(i=>i.id==='bow')});
      }
    },
    {
      id: 'flowing_tears', name: '流れる涙', tier: 'silver', category: 'item', imgName: 'griefofthegreatgoddess_i',
      desc: '「女神の涙」を1個獲得する。味方チームが6500マナを使用すると、さらに2個獲得する。',
      icon: '💧',
      effect: (state, rng, helpers) => {
        helpers.addItem({...ITEMS.find(i=>i.id==='tear')});
        helpers.showMsg('💧 流れる涙: 「女神の涙」を1個獲得しました！');
      }
    },
    {
      id: 'critical_success', name: 'クリティカル サクセス', tier: 'silver', category: 'item', imgName: 'criticalsuccess_i',
      desc: '「スパーリング グローブ」を1個獲得する。味方チームの通常攻撃が320回クリティカルになると、さらに2個獲得する。',
      icon: '🥊',
      effect: (state, rng, helpers) => {
        helpers.addItem({...ITEMS.find(i=>i.id==='glove')});
        helpers.showMsg('🥊 クリティカル サクセス: 「スパーリング グローブ」を1個獲得しました！');
      }
    },
    {
      id: 'masterful_crafting', name: '巧みなクラフト', tier: 'silver', category: 'economy', imgName: 'craftedcrafting_i',
      desc: '完成アイテムを作成するたびに、リロールを2回獲得する。',
      icon: '🛠️',
      effect: (state, rng, helpers) => {
        helpers.addPassiveBuff({ type: 'masterful_crafting' });
      }
    },
  ],

  //ゴールドオーグメント
  gold: [
    {
      id: 'legion_of_three', name: '3の軍団', tier: 'gold', category: 'item', imgName: 'legionofthrees_ii',
      desc: 'ランダムな紋章アイテムを1個獲得する。味方のコスト3チャンピオンと紋章アイテムを装備したすべての味方の体力が150、攻撃速度が12%増加する。',
      icon: '🛡️',
      effect: (state, rng, helpers) => {
        const recipes = Object.values(ITEM_RECIPES);
        const emblems = recipes.filter(r => r.grantedTrait);
        const randomEmblem = { ...emblems[Math.floor(rng() * emblems.length)], type: 'completed' };
        helpers.addItem(randomEmblem);
      }
    },
    {
      id: 'epoch', name: 'エポック', tier: 'gold', category: 'economy', imgName: 'epoch_ii',
      desc: 'このオーグメント獲得時、および各ステージ開始時に4 XPの経験値を獲得する。また、2回分の無料リロールを獲得する。',
      icon: '⏳',
      effect: (state, rng, helpers) => {
        helpers.addXp(4);
        helpers.addFreeRerolls(2);
        helpers.addPassiveBuff({ type: 'epoch' });
      }
    },
    {
      id: 'trade_sector', name: 'トレードセクター', tier: 'gold', category: 'economy', imgName: 'trade2',
      desc: '毎ラウンド、ショップの無料リロール1回分を獲得する。2ゴールドを獲得する。',
      icon: '💹',
      effect: (state, rng, helpers) => {
        helpers.addGold(2);
        helpers.addPassiveBuff({ type: 'trade_sector' });
      }
    },
    {
      id: 'savings_account', name: '普通預金口座', tier: 'gold', category: 'economy', imgName: 'savingsaccount_ii',
      desc: '利子で50ゴールドを獲得後、30ゴールドを獲得する。最大利子が7に増加する。即座に4ゴールドを獲得する',
      icon: '🏦',
      effect: (state, rng, helpers) => {
        helpers.addGold(4);
        helpers.setMaxInterest(7);
        helpers.addPassiveBuff({ type: 'savings_account' });
      }
    },
    {
      id: 'slam_dunk', name: '叩きつけ', tier: 'gold', category: 'economy', imgName: 'slammin_ii',
      desc: '3ゴールドを獲得する。対人戦ラウンドが終了するたび、ベンチに消費アイテム以外のアイテムがなければ、2XPの経験値を獲得する',
      icon: '🏀',
      effect: (state, rng, helpers) => {
        helpers.addGold(3);
        helpers.addPassiveBuff({ type: 'slam_dunk' });
      }
    },
    {
      id: 'strategic_loss', name: '戦略的敗北', tier: 'gold', category: 'economy', imgName: 'calculatedloss2',
      desc: '戦闘に敗北すると、2ゴールドとショップの無料リロール1回分を獲得する。',
      icon: '📉',
      effect: (state, rng, helpers) => {
        helpers.addPassiveBuff({ type: 'strategic_loss' });
      }
    },
{
      id: 'pandoras_items2', name: 'パンドラのアイテム II', tier: 'gold', category: 'item', imgName: 'pandora2',
      desc: 'ラウンド開始時: ベンチのアイテムがランダムに変更される。ランダムな素材アイテムを2個獲得する。。',
      icon: '📦',
      effect: (state, rng, helpers) => {
        // 🌟 素材アイテムを2個即座に獲得する処理を追加
        const comps = ITEMS.filter(x => x.type === 'comp' && x.id !== 'spatula' && x.id !== 'pan');
        helpers.addItem({ ...comps[Math.floor(rng() * comps.length)] });
        helpers.addItem({ ...comps[Math.floor(rng() * comps.length)] });
        
        helpers.addPassiveBuff({ type: 'pandoras_items' });
      }
    },
    {
      id: 'pro_boxer', name: 'プロボクサー', tier: 'gold', category: 'item', imgName: 'prizefighter_ii',
      desc: '素材アイテムを2個獲得する。5勝するたびに、素材アイテムを1個獲得する。',
      icon: '🥊',
      effect: (state, rng, helpers) => {
        // 🌟 素材アイテムを2個即座に獲得する処理を追加
        const comps = ITEMS.filter(x => x.type === 'comp' && x.id !== 'spatula' && x.id !== 'pan');
        helpers.addItem({ ...comps[Math.floor(rng() * comps.length)] });
        helpers.addItem({ ...comps[Math.floor(rng() * comps.length)] });
        
        helpers.addPassiveBuff({ type: 'pro_boxer' });
      }
    },
    {
      id: 'fan_the_flames', name: '炎を強めて', tier: 'gold', category: 'item', imgName: 'feedtheflames_ii',
      desc: '「サンファイア ケープ」を1個獲得する。燃焼を付与された敵を攻撃するとき、味方チームのオムニヴァンプが12%増加する。',
      icon: '🔥',
      effect: (state, rng, helpers) => {
        helpers.addItem({...ITEM_RECIPES['chain_belt'], type:'completed'});
        helpers.addPassiveBuff({ type: 'fan_the_flames' });
      }
    },
    {
      id: 'seraphims_staff', name: 'セラフィムの杖', tier: 'gold', category: 'item', imgName: 'seraphimsstaff_ii',
      desc: '「アークエンジェル スタッフ」を1個獲得する。装備者の魔力が90%以上だった場合、「アークエンジェル スタッフ」から2のマナ自動回復を追加で獲得する。',
      icon: '👼',
      effect: (state, rng, helpers) => {
        helpers.addItem({...ITEM_RECIPES['rod_tear'], type:'completed'});
        helpers.addPassiveBuff({ type: 'seraphims_staff' });
      }
    },
    {
      id: 'redemption_soul', name: 'リデンプションの魂', tier: 'gold', category: 'item', imgName: 'spiritofredemption_ii',
      desc: '「スピリット ビサージュ」を1個獲得する。5秒ごとに、「スピリット ビサージュ」が1マス以内の味方を、減少体力の7.5%回復する。',
      icon: '😇',
      effect: (state, rng, helpers) => {
        helpers.addItem({...ITEM_RECIPES['tear_belt'], type:'completed'});
        helpers.addPassiveBuff({ type: 'redemption_soul' });
      }
    },
{
      id: 'charge', name: '出陣', tier: 'gold', category: 'combat', imgName: 'warpath_ii',
      desc: 'ランダムな★★の2コストチャンピオンを獲得する。',
      icon: '⚡',
      effect: (state, rng, helpers) => {
        const pool = CHAMPS.filter(c => c.cost === 2);
        const chosen = pool[Math.floor(rng() * pool.length)];
        const unitData = { ...chosen, star: 2, uid: rng(), items: [] };
        helpers.addChampToBenchDirect(unitData);
        
        // 🌟 「チャンピオン獲得」に特化したリッチなPOPアップ
        helpers.showMsg(
          <div className="champ-pop-up">
            <div style={{
              background: 'rgba(8, 13, 26, 0.95)',
              border: `2px solid ${COST_COLORS[2]}`,
              borderRadius: '16px',
              padding: '24px 40px',
              boxShadow: `0 0 40px ${COST_COLORS[2]}44, inset 0 0 20px rgba(0,0,0,0.6)`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ 
                color: 'var(--gold2)', 
                fontSize: '11px', 
                fontWeight: 900, 
                letterSpacing: '4px', 
                textTransform: 'uppercase',
                opacity: 0.8
              }}>
                Unit Acquired
              </div>
              
              <div style={{ position: 'relative', width: 84, height: 84, marginTop: 5 }}>
                <img 
                  src={boardIcon(chosen.img)} 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    borderRadius: '12px', 
                    border: `2px solid ${COST_COLORS[2]}`,
                    objectFit: 'cover'
                  }} 
                />
                {/* 2つ星の表示 */}
                <div style={{ 
                  position: 'absolute', 
                  bottom: -8, 
                  left: 0, 
                  right: 0, 
                  display: 'flex', 
                  justifyContent: 'center', 
                  gap: 3 
                }}>
                  {[1, 2].map(i => (
                    <div key={i} style={{ width: 12, height: 12, clipPath: 'polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)', background: STAR_COLORS[2], filter: 'drop-shadow(0 0 4px gold)' }} />
                  ))}
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 900, color: 'white', marginBottom: 2 }}>{chosen.jaName}</div>
                <div style={{ fontSize: '10px', color: 'var(--textdim)', fontWeight: 700 }}>2コスト / ★2</div>
              </div>
            </div>
          </div>
        );
      }
    },
    {
      id: 'makeshift_armor2', name: '即席アーマー II', tier: 'gold', category: 'combat', imgName: 'makeshift2',
      desc: 'アイテムを装備していない味方の物理防御と魔法防御が50増加する。',
      icon: '🛡️',
      effect: (state, rng, helpers) => {
        helpers.addPassiveBuff({ type: 'makeshift_armor', value: 50 });
      }
    },
    {
      id: 'bodyguard_training', name: 'ボディーガードの訓練', tier: 'gold', category: 'combat', imgName: 'bodyguardstraining_ii',
      desc: '味方の物理防御と魔法防御が10増加し、プレイヤーレベル1ごとに3ずつ増加する。',
      icon: '💪',
      effect: (state, rng, helpers) => {
        helpers.addPassiveBuff({ type: 'bodyguard_training' });
      }
    },
    {
      id: 'warlords_honor', name: 'ウォーロードの名誉', tier: 'gold', category: 'combat', imgName: 'unforgotten_ii',
      desc: '毎ラウンド、味方チームの攻撃力と魔力が5%増加する。チャンピオンはこの効果を1スタック持った状態で開始し、最大4回までスタックする。',
      icon: '🏆',
      effect: (state, rng, helpers) => {
        helpers.addPassiveBuff({ type: 'warlords_honor', stacks: 1 });
      }
    },
    {
      id: 'infinity_guardian', name: 'インフィニティの守護', tier: 'gold', category: 'combat', imgName: 'infinityprotection_ii',
      desc: '即座に3ゴールドを獲得する。ステージ3-7で「インフィニティ フォース」を1個獲得する。「インフィニティ フォース」が同じ列の味方に体力の12%にあたる耐久値を持つシールドを付与する。',
      icon: '♾️',
      effect: (state, rng, helpers) => {
        helpers.addGold(3);
        helpers.addPassiveBuff({ type: 'infinity_guardian' });
      }
    },
    {
      id: 'anima_commander', name: 'アニマ司令官', tier: 'gold', category: 'combat', imgName: 'animacommander_ii',
      desc: 'ブライアー、ジンクス、イラオイを1体ずつ獲得する。プレイヤーの現在体力と最大体力が10増加する。',
      icon: '🐰',
      effect: (state, rng, helpers) => {
        const briar = CHAMPS.find(c => c.id === 'briar');
        const jinx = CHAMPS.find(c => c.id === 'jinx');
        const illaoi = CHAMPS.find(c => c.id === 'illaoi');
        const units = [briar, jinx, illaoi].map(c => ({ ...c, star: 1, uid: rng(), items: [] }));
        helpers.addPendingUnits(units);
      }
    },
    {
      id: 'urf', name: 'U.R.F.', tier: 'gold', category: 'item', imgName: 'ultrarapidfire_ii',
      desc: '「へら」を1個獲得する。「へら」または「フライパン」アイテムを装備しているチャンピオンの攻撃速度が15%、マナ自動回復が2増加する。',
      icon: '🍳',
      effect: (state, rng, helpers) => {
        helpers.addItem({...ITEMS.find(i=>i.id==='spatula')});
      }
    },
    {
      id: 'backline_blueprint', name: '後衛の設計図', tier: 'gold', category: 'combat', imgName: 'backlineblueprint_ii',
      desc: 'タンク以外のコスト3チャンピオン1体と、そのチャンピオンの一番最後に記載されている特性の「紋章」を獲得する。',
      icon: '📜',
      effect: (state, rng, helpers) => {
        const tankTraits = ['Bastion', 'Brawler', 'Vanguard'];
        const emblems = Object.values(ITEM_RECIPES).filter(r => r.grantedTrait);
        const availableEmblemTraits = emblems.map(e => e.grantedTrait);
        
        // タンク特性を持たず、かつ最後の特性の紋章が存在する3コストチャンピオンを抽出
        const validPool = CHAMPS.filter(c => {
          if (c.cost !== 3) return false;
          if (c.traits.some(t => tankTraits.includes(t))) return false;
          const lastTrait = c.traits[c.traits.length - 1];
          return availableEmblemTraits.includes(lastTrait);
        });

        if (validPool.length > 0) {
          const chosen = validPool[Math.floor(rng() * validPool.length)];
          const lastTrait = chosen.traits[chosen.traits.length - 1];
          const emblem = emblems.find(e => e.grantedTrait === lastTrait);

          helpers.addPendingUnits([{ ...chosen, star: 1, uid: rng(), items: [] }]);
          if (emblem) helpers.addItem({ ...emblem, type: 'completed' });
          helpers.showMsg(`📜 後衛の設計図: ${chosen.jaName} と ${helpers.getJaName(emblem.name)} を獲得！`);
        }
      }
    },
    {
      id: 'frontline_foundation', name: '前衛の礎', tier: 'gold', category: 'combat', imgName: 'frontlinefoundation_ii',
      desc: '★2のコスト1タンクチャンピオン1体と、そのチャンピオンの一番最後に記載されている特性に一致する「紋章」を獲得する。',
      icon: '🛡️',
      effect: (state, rng, helpers) => {
        const tankTraits = ['Bastion', 'Brawler', 'Vanguard'];
        const emblems = Object.values(ITEM_RECIPES).filter(r => r.grantedTrait);
        const availableEmblemTraits = emblems.map(e => e.grantedTrait);
        
        // タンク特性を持ち、かつ最後の特性の紋章が存在する1コストチャンピオンを抽出
        const validPool = CHAMPS.filter(c => {
          if (c.cost !== 1) return false;
          if (!c.traits.some(t => tankTraits.includes(t))) return false;
          const lastTrait = c.traits[c.traits.length - 1];
          return availableEmblemTraits.includes(lastTrait);
        });

        if (validPool.length > 0) {
          const chosen = validPool[Math.floor(rng() * validPool.length)];
          const lastTrait = chosen.traits[chosen.traits.length - 1];
          const emblem = emblems.find(e => e.grantedTrait === lastTrait);

          helpers.addPendingUnits([{ ...chosen, star: 2, uid: rng(), items: [] }]);
          if (emblem) helpers.addItem({ ...emblem, type: 'completed' });
          helpers.showMsg(`🛡️ 前衛の礎: ★★${chosen.jaName} と ${helpers.getJaName(emblem.name)} を獲得！`);
        }
      }
    },
    {
      id: 'spreading_roots', name: '広がる根', tier: 'gold', category: 'item', imgName: 'spreadingroots_ii',
      desc: 'ランダムな紋章アイテム2個と1ゴールドを獲得する。',
      icon: '🌿',
      effect: (state, rng, helpers) => {
        helpers.addGold(1);
        const recipes = Object.values(ITEM_RECIPES);
        const emblems = recipes.filter(r => r.grantedTrait);
        helpers.addItem({ ...emblems[Math.floor(rng() * emblems.length)], type: 'completed' });
        helpers.addItem({ ...emblems[Math.floor(rng() * emblems.length)], type: 'completed' });
      }
    },
    {
      id: 'early_education', name: '早期教育', tier: 'gold', category: 'combat', imgName: 'earlylearning_ii',
      desc: '味方チームの攻撃力と魔力が8%増加する。この効果は各対人戦終了後に1%増加する。コスト1のチャンピオンは増加量が2倍になる',
      icon: '📚',
      effect: (state, rng, helpers) => {
        helpers.addPassiveBuff({ type: 'early_education' });
      }
    },
    {
      id: 'no_scouting_no_pivoting', name: '偵察なし、変更なし', tier: 'gold', category: 'combat', imgName: 'noscoutnopivot_ii',
      desc: '対人戦に参加するチャンピオンはベンチに戻すことも、売却することもできない。対人戦後、味方チームの体力が1%、攻撃力と魔力が1.5%増加する。',
      icon: '🚫',
      effect: (state, rng, helpers) => {
        helpers.addPassiveBuff({ type: 'no_scouting_no_pivoting' });
      }
    },
    {
      id: 'two_for_one', name: 'お得な2', tier: 'gold', category: 'economy', imgName: 'twomuchvalue_ii',
      desc: '前回の対人戦でボード上に配置していた種類の異なるコスト2のチャンピオン2体ごとに、1回のリロールを獲得する。コスト2のチャンピオンを1体獲得する。',
      icon: '✌️',
      effect: (state, rng, helpers) => {
        helpers.addPassiveBuff({ type: 'two_for_one' });
        // コスト2のチャンピオンを1体獲得
        const pool = CHAMPS.filter(c => c.cost === 2);
        const chosen = pool[Math.floor(rng() * pool.length)];
        helpers.addPendingUnits([{ ...chosen, star: 1, uid: rng(), items: [] }]);
      }
    },
    {
      id: 'advance_payment', name: '前借り', tier: 'gold', category: 'economy', imgName: 'advancedloan_ii',
      desc: '20ゴールドを獲得する。次のオーグメントのティアが1つ低くなる。',
      icon: '💸',
      effect: (state, rng, helpers) => {
        helpers.addGold(20);
        helpers.showMsg('💸 前借り: 20Gを獲得しました！');
      }
    },
    {
      id: 'cluttered_mind', name: '乱れる思考', tier: 'gold', category: 'economy', imgName: 'dizzy-ii',
      desc: '今すぐランダムなコスト1のチャンピオンを4体獲得する。対人戦ラウンド終了時にベンチが満員の場合、3 XPの経験値を獲得する。',
      icon: '🧠',
      effect: (state, rng, helpers) => {
        const pool = CHAMPS.filter(c => c.cost === 1);
        const selectedTypes = [];
        const tempPool = [...pool];
        
        for(let i = 0; i < 4; i++) {
          if (tempPool.length === 0) break;
          const idx = Math.floor(rng() * tempPool.length);
          selectedTypes.push(tempPool.splice(idx, 1)[0]);
        }
        const units = selectedTypes.map(c => ({ ...c, star: 1, uid: rng(), items: [] }));
        helpers.addPendingUnits(units);
        helpers.showMsg('🧠 乱れる思考: 異なる1コストチャンピオンを4体獲得しました！');
      }
    },
    {
      id: 'salvage_bin', name: '回収箱', tier: 'gold', category: 'item', imgName: 'salvage2',
      desc: '即座にランダムな完成アイテムを1個獲得する。また、対人戦を8回終えると、素材アイテムを1個獲得する。チャンピオンを売却すると、完成アイテムが素材に解体される(タクティシャンアイテムと紋章は除く)。',
      icon: '♻️',
      effect: (state, rng, helpers) => {
        const entries = Object.entries(ITEM_RECIPES);
        const normalComps = entries.filter(([k]) => !k.includes('spatula') && !k.includes('pan') && !k.includes('unbuildable')).map(e => e[1]);
        helpers.addItem({ ...normalComps[Math.floor(rng() * normalComps.length)], type: 'completed' });
      }
    },
    {
      id: 'two_tanks', name: '2体のタンク', tier: 'gold', category: 'combat', imgName: 'two-tanky-ii',
      desc: 'フィールド上にまったく同じチャンピオンを2体配置すると、両者の体力が600増加する。そのチャンピオンのいずれかが倒されると、もう一体のチャンピオンは12秒間、最大体力の40%の耐久値のシールドを獲得する。★3にアップグレードすると、★2のコピーを1体獲得する。',
      icon: '🛡️',
      effect: (state, rng, helpers) => {
        helpers.addPassiveBuff({ type: 'two_tanks' });
      }
    },
    {
      id: 'birthday_reunion', name: 'バースデー リユニオン', tier: 'gold', category: 'combat', imgName: 'birthdayreunion_ii',
      desc: 'ランダムな★2のコスト2チャンピオンを1体獲得する。レベル7に到達すると、「盗賊のグローブ」を1個獲得する。レベル9に到達すると、ランダムな★2のコスト5チャンピオンを1体獲得する。',
      icon: '🎉',
      effect: (state, rng, helpers) => {
        const pool = CHAMPS.filter(c => c.cost === 2);
        const chosen = pool[Math.floor(rng() * pool.length)];
        const unitData = { ...chosen, star: 2, uid: rng(), items: [] };
        helpers.addPendingUnits([unitData]);
      }
    },
    {
      id: 'studious', name: '研究熱心', tier: 'gold', category: 'economy', imgName: 'learning-from-experience-ii',
      desc: '対人戦ラウンドに勝利すると経験値を2 XP、敗北すると経験値を3 XP獲得する。',
      icon: '📚',
      effect: (state, rng, helpers) => {
        helpers.addPassiveBuff({ type: 'studious' });
      }
    },
    {
      id: 'sunfire_board', name: 'サンファイア ボード', tier: 'gold', category: 'combat', imgName: 'sunfireboard2',
      desc: '戦闘開始時: すべての敵を焼き、15秒かけて対象の最大体力の15%にあたるダメージを与え、対象が受ける回復効果を33%低下させる。',
      icon: '🔥',
      effect: (state, rng, helpers) => {
        helpers.addPassiveBuff({ type: 'sunfire_board' });
      }
    },
    {
      id: 'hustler', name: 'ハスラー', tier: 'gold', category: 'economy', imgName: 'hyperroll2',
      desc: '利子を獲得できなくなる代わりに、対人戦ラウンドの開始時に毎回3ゴールドを獲得する。即座に3ゴールドを獲得する。',
      icon: '🎲',
      effect: (state, rng, helpers) => {
        helpers.addGold(3);
        helpers.showMsg('🎲 ハスラー: 3Gを獲得しました！');
      }
    },
  ],
  prismatic: [
    {
      id: 'upward_mobility', name: '上方移動', tier: 'prismatic', category: 'economy', imgName: 'upwardmobility_iii',
      desc: '経験値の購入コストが1減少する。レベルアップするたびに、体力2と無料リロールを2獲得する。。',
      icon: '🚀',
      effect: (state, rng, helpers) => {
        helpers.setXpCostReduction(1);
        helpers.addPassiveBuff({ type: 'upward_mobility' });
      }
    },
    {
      id: 'hedge_fund', name: 'ヘッジファンド', tier: 'prismatic', category: 'economy', imgName: 'richgetricher3',
      desc: '25ゴールドを獲得する。利子の最大額が10まで増加する。',
      icon: '💰',
      effect: (state, rng, helpers) => {
        helpers.addGold(25);
        helpers.setMaxInterest(10);
      }
    },
    {
      id: 'prism_ticket', name: 'プリズムチケット', tier: 'prismatic', category: 'economy', imgName: 'goldenticket3',
      desc: 'ショップをリロールするたびに、50%の確率で無料リロール1回分を獲得する。',
      icon: '🎟️',
      effect: (state, rng, helpers) => {
        helpers.addPassiveBuff({ type: 'prism_ticket' });
      }
    },
    {
      id: 'sacrifice', name: '代償', tier: 'prismatic', category: 'economy', imgName: 'atwhatcost_iii',
      desc: '直ちにレベル6になり、12 XPの経験値を獲得する。今後、オーグメントは選択できない。',
      icon: '⚖️',
      effect: (state, rng, helpers) => {
        helpers.setLevel(6);
        helpers.addXp(12);
        helpers.setNoMoreAugments(true);
      }
    },
    {
      id: 'make_friends', name: '仲間を作ろう', tier: 'prismatic', category: 'economy', imgName: 'constructacompanion_iii',
      desc: 'ランダムな★3のコスト1チャンピオンを1体獲得する。8ゴールドを獲得する。',
      icon: '🌟',
      effect: (state, rng, helpers) => {
        helpers.addGold(8);
        const pool = CHAMPS.filter(c => c.cost === 1);
        const chosen = pool[Math.floor(rng() * pool.length)];
        const unitData = { ...chosen, star: 3, uid: rng(), items: [] };
        helpers.addPendingUnits([unitData]);
        helpers.showMsg(`★★★${chosen.jaName} と 8G を獲得！`);
      }
    },
    {
      id: 'level_up', name: 'レベルアップ！', tier: 'prismatic', category: 'economy', imgName: 'levelup3',
      desc: '経験値を購入する際、追加で経験値を2 XP獲得する。即座に経験値を8 XP獲得する。',
      icon: '📈',
      effect: (state, rng, helpers) => {
        helpers.addXp(8);
        helpers.addPassiveBuff({ type: 'level_up_aug' });
      }
    },
    {
      id: 'thieves_guild2', name: '盗賊団 II', tier: 'prismatic', category: 'item', imgName: 'bandthieves3',
      desc: '「盗賊のグローブ」2個を獲得。対人戦を8回行ったあとに、もう1個獲得する。',
      icon: '🧤',
      effect: (state, rng, helpers) => {
        helpers.addPassiveBuff({ type: 'thieves_guild2' });
      }
    },
    {
      id: 'scarier_cap', name: 'もっと怖いキャップ', tier: 'prismatic', category: 'item', imgName: 'https://tftips.b-cdn.net/aug/_deadliercaps.avif?v=1',
      desc: '「ラバドン デスキャップ」を1個獲得する。装備者がキルまたはアシストを獲得するたび、「ラバドン デスキャップ」の魔力が恒久的に1%増加する。',
      icon: '🎩',
      effect: (state, rng, helpers) => {
        helpers.addItem({...ITEM_RECIPES['rod_rod'], type:'completed'});
        helpers.addPassiveBuff({ type: 'scarier_cap' });
      }
    },
{
      id: 'sublime_adventure', 
      name: '崇高の冒険', 
      tier: 'prismatic', 
      category: 'combat', 
      imgName: 'exaltedadventure_iii', 
      desc: 'コスト2のチャンピオンを3体獲得する。そのうち2体を★3にすると、戦利品が詰まったオーブを1個獲得する。次の2ステージ開始時に、「小型チャンピオン複製器」を1個獲得する。',
      icon: '🏔️',
      effect: (state, rng, helpers) => {
        // 🌟 コスト2のチャンピオンから重複しないように3種類選ぶ
        const pool2 = CHAMPS.filter(c => c.cost === 2);
        const selectedTypes = [];
        const tempPool = [...pool2];
        
        for(let i = 0; i < 3; i++) {
          if (tempPool.length === 0) break;
          const idx = Math.floor(rng() * tempPool.length);
          selectedTypes.push(tempPool.splice(idx, 1)[0]);
        }

        // 🌟 獲得した3体をベンチ（または待機列）に追加
        const units = selectedTypes.map(c => ({ ...c, star: 1, uid: rng(), items: [] }));
        helpers.addPendingUnits(units);

        helpers.showMsg('コスト2チャンピオンを3種類獲得しました！');
      }
    },
    {
      id: 'deadlier_blade', name: 'デッドリアー ブレード', tier: 'prismatic', category: 'item', imgName: 'https://tftips.b-cdn.net/aug/_tragicalblade.avif?v=1',
      desc: '「デスブレード」を1個獲得する。装備者がキルまたはアシストを獲得するたび、「デスブレード」の攻撃力が恒久的に1%増加する。',
      icon: '🗡️',
      effect: (state, rng, helpers) => {
        helpers.addItem({...ITEM_RECIPES['bf_bf'], type:'completed'});
        helpers.addPassiveBuff({ type: 'deadlier_blade' });
      }
    },
    {
      id: 'cursed_crown', name: 'カースドのクラウン', tier: 'prismatic', category: 'combat', imgName: 'cursedcrown-iii',
      desc: 'チームサイズの上限が2増加し、味方チームの耐久力が4%増加するが、対人戦に敗北した際に受けるダメージが上昇する。',
      icon: '👑',
      effect: (state, rng, helpers) => {
        helpers.addPassiveBuff({ type: 'cursed_crown', teamSizeBonus: 2 });
      }
    },
    {
      id: 'last_stand', name: '逆転劇', tier: 'prismatic', category: 'combat', imgName: 'comebackstory_iii',
      desc: 'プレイヤーの体力が減少するごとに、味方チームの体力が5、攻撃速度が0.4%増加する。',
      icon: '🔁',
      effect: (state, rng, helpers) => {
        helpers.addPassiveBuff({ type: 'last_stand' });
      }
    },
    {
      id: 'worth_the_wait2', name: '待つ価値あり II', tier: 'prismatic', category: 'combat', imgName: 'worththewait_iii',
      desc: 'ランダムなコスト2のチャンピオン1種類を2体獲得する。', // 説明文もシンプルに
      effect: (state, rng, helpers) => {
        // 1. 2コストのプールから1種類だけ選ぶ
        const pool = CHAMPS.filter(c => c.cost === 2);
        const chosenUnit = pool[Math.floor(rng() * pool.length)];

        // 2. 同じユニットを2体ベンチに追加（即時実行のみ）
        const unitData = { ...chosenUnit, star: 1, uid: rng(), items: [] };
        helpers.addChampToBenchDirect(unitData);
        helpers.addChampToBenchDirect({ ...unitData, uid: rng() }); // uidだけ変えてもう1体

        // 通知メッセージ
        helpers.showMsg(
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <img src={boardIcon(chosenUnit.img)} style={{ width:20, height:20, borderRadius:4, border:'1px solid var(--blue)' }} />
            <span>{chosenUnit.jaName} を2体獲得しました</span>
          </div>
        );
      }
    },
    {
      id: 'birthday_gift', name: 'バースデープレゼント', tier: 'prismatic', category: 'combat', imgName: 'golden-gifts-iii',
      desc: 'プレイヤーがレベルアップするたびに、★★のチャンピオン1体と1ゴールドを獲得する。プレイヤーのレベルから4を引いた値が、獲得できるチャンピオンのコストティアになる(上限: コスト5)。',
      icon: '🎂',
      effect: (state, rng, helpers) => {
        helpers.addPassiveBuff({ type: 'birthday_gift' });
      }
    },
    {
      id: 'tacticians_kitchen', name: 'タクティシャンの台所', tier: 'prismatic', category: 'item', imgName: 'tacticianskitchen_iii',
      desc: 'ランダムな紋章アイテムを1個獲得する。3ラウンド終了後に「タクティシャンのケープ」を1個獲得する。',
      icon: '🍳',
      effect: (state, rng, helpers) => {
        const recipes = Object.values(ITEM_RECIPES);
        const emblems = recipes.filter(r => r.grantedTrait);
        const randomEmblem = { ...emblems[Math.floor(rng() * emblems.length)], type: 'completed' };
        helpers.addItem(randomEmblem);
      }
    },
    {
      id: 'trait_tree', name: '特性の木', tier: 'prismatic', category: 'item', imgName: 'thetraittree_iii',
      desc: 'ランダムな紋章アイテム3個、「再合成装置」1個と2ゴールドを獲得する。',
      icon: '🌳',
      effect: (state, rng, helpers) => {
        helpers.addGold(2);
        helpers.addItem({...CONSUMABLES.REFORGER});
        const recipes = Object.values(ITEM_RECIPES);
        const emblems = recipes.filter(r => r.grantedTrait);
        const tempEmblems = [...emblems];
        const selectedEmblems = [];
        
        for (let i = 0; i < 3; i++) {
          if (tempEmblems.length === 0) break;
          const idx = Math.floor(rng() * tempEmblems.length);
          selectedEmblems.push(tempEmblems.splice(idx, 1)[0]);
        }
        
        selectedEmblems.forEach(emblem => helpers.addItem({ ...emblem, type: 'completed' }));
      }
    },
    {
      id: 'buried_treasures', name: '埋もれた宝物', tier: 'prismatic', category: 'item', imgName: 'buried-treasures-iii',
      desc: '即座にランダムな素材アイテムを1個獲得し、次の5ラウンドに渡って、ラウンド開始時にランダムな素材アイテムを1個ずつ獲得する。',
      icon: '💎',
      effect: (state, rng, helpers) => {
        const comps = ITEMS.filter(x => x.type === 'comp' && x.id !== 'spatula' && x.id !== 'pan');
        helpers.addItem({ ...comps[Math.floor(rng() * comps.length)] });
      }
    },
  ]
};

