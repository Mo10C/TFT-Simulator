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
        if (helpers.setIsFinished) helpers.setIsFinished(true);
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
    /*
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
    */
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
    {
      id: 'big_bang', name: 'ビッグバン', tier: 'gold', category: 'combat', imgName: 'meepspace9_ii',
      desc: 'ミィプシーを1体獲得する。最も強いミィプシーが魔力ファイターとなり、近くのマスに跳躍して広範囲にダメージを与える。',
      icon: '💥',
      effect: (state, rng, helpers) => {
        const champ = CHAMPS.find(c => c.id === 'miipsy' || c.id === 'meepsie');
        if (champ) helpers.addPendingUnits([{ ...champ, star: 1, uid: rng(), items: [] }]);
        helpers.addPassiveBuff({ type: 'big_bang' });
        helpers.showMsg('💥 ビッグバン: ミィプシーを獲得しました！');
      }
    },
    {
      id: 'booster_pack', name: 'ブースターパック', tier: 'gold', category: 'economy', imgName: 'boosterpack1_ii',
      desc: 'ランダムなチャンピオンを合計12ゴールド分獲得する(コスト3が1体以上確定！)。',
      icon: '🎴',
      effect: (state, rng, helpers) => {
        const patterns = [
          { w: 13.5, l: [{c:3,s:1,n:3}, {c:1,s:2,n:1}] },
          { w: 13.5, l: [{c:1,s:1,n:2}, {c:2,s:1,n:2}, {c:3,s:1,n:2}] },
          { w: 13.5, l: [{c:1,s:2,n:1}, {c:1,s:1,n:3}, {c:3,s:1,n:2}] },
          { w: 13.5, l: [{c:1,s:2,n:2}, {c:3,s:1,n:1}, {c:1,s:1,n:1}, {c:2,s:1,n:1}] },
          { w: 16.0, l: [{c:2,s:2,n:1}, {c:3,s:1,n:1}, {c:1,s:1,n:1}, {c:2,s:1,n:1}] }, // 8%のパターン×2を統合
          { w: 1.5,  l: [{c:3,s:2,n:1}, {c:1,s:1,n:1}, {c:2,s:1,n:1}] },
          { w: 1.5,  l: [{c:1,s:1,n:3}, {c:3,s:1,n:1}, {c:4,s:1,n:1}, {c:2,s:1,n:1}] }
        ];
        
        const totalW = patterns.reduce((sum, p) => sum + p.w, 0);
        let roll = rng() * totalW;
        let chosenPattern = patterns[patterns.length - 1].l;
        for (const p of patterns) {
          roll -= p.w;
          if (roll <= 0) { chosenPattern = p.l; break; }
        }

        const unitsToAdd = [];
        for (const group of chosenPattern) {
          const pool = CHAMPS.filter(champ => champ.cost === group.c);
          for (let i = 0; i < group.n; i++) {
            const chosen = pool[Math.floor(rng() * pool.length)];
            unitsToAdd.push({ ...chosen, star: group.s, uid: rng(), items: [] });
          }
        }
        helpers.addPendingUnits(unitsToAdd);
        helpers.showMsg('🎴 ブースターパック: 12G分のチャンピオンを獲得しました！');
      }
    },
    {
      id: 'heavy_is_the_crown', name: '王冠とは重きもの', tier: 'gold', category: 'item', imgName: 'heavyisthecrown_ii',
      desc: '「デマーシアの王冠」を獲得する。装備者は大きなボーナスを獲得する。装備者が倒されると、そのラウンドに敗北する。',
      icon: '👑',
      effect: (state, rng, helpers) => {
        helpers.addItem({ ...ARTIFACTS.find(i => i.id === 'crown_of_demacia') });
        helpers.showMsg('👑 王冠とは重きもの: 「デマーシアの王冠」を獲得しました！');
      }
    },
    {
      id: 'heroic_grab_bag', name: '英雄のラッキーバッグ', tier: 'gold', category: 'item', imgName: 'heroic-grab-bag-ii',
      desc: '「小型チャンピオン複製器」2個と5ゴールドを獲得する。',
      icon: '🛍️',
      effect: (state, rng, helpers) => {
        helpers.addItem({...CONSUMABLES.LESSER_DUPE});
        helpers.addItem({...CONSUMABLES.LESSER_DUPE});
        helpers.addGold(5);
        helpers.showMsg('🛍️ 英雄のラッキーバッグ: 小型複製器2個と5Gを獲得しました！');
      }
    },
    {
      id: 'portable_forge', name: 'ポータブル フォージ', tier: 'gold', category: 'item', imgName: 'portableforge2',
      desc: '4個のアーティファクトから1個を選択する。アーティファクトは独自の効果を持つ強力なアイテム。',
      icon: '🔨',
      effect: (state, rng, helpers) => {
        helpers.triggerAnvilChoice('artifact');
        helpers.showMsg('🔨 ポータブル フォージ: アーティファクトを1つ選択してください！');
      }
    },
    {
      id: 'divine_forge', name: '神の鍛冶場', tier: 'gold', category: 'item', imgName: 'job_s-done-ii',
      desc: '4個の「神のアーティファクト」から1個を選択する。',
      icon: '✨',
      effect: (state, rng, helpers) => {
        helpers.triggerAnvilChoice('god_artifact');
        helpers.showMsg('✨ 神の鍛冶場: 神のアーティファクトを1つ選択してください！');
      }
    },
    {
      id: 'duplication', name: '複製', tier: 'gold', category: 'item', imgName: 'replication-ii',
      desc: '3つの素材アイテムから1つを選ぶ。次の2ラウンドの間、その素材アイテムのコピーを1個獲得する。',
      icon: '👯',
      effect: (state, rng, helpers) => {
        helpers.triggerAnvilChoice('duplication');
        helpers.showMsg('👯 複製: 複製する素材アイテムを選択してください！');
      }
    },
    {
      id: 'worth_the_wait', name: '待つ価値あり', tier: 'gold', category: 'combat', imgName: 'worththewait_ii',
      desc: 'ランダムなコスト1のチャンピオンを1体獲得する。',
      icon: '⏳',
      effect: (state, rng, helpers) => {
        const pool = CHAMPS.filter(c => c.cost === 1);
        const chosenUnit = pool[Math.floor(rng() * pool.length)];
        
        helpers.addChampToBenchDirect({ ...chosenUnit, star: 1, uid: rng(), items: [] });
        
        helpers.showMsg(
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <img src={boardIcon(chosenUnit.img)} style={{ width:20, height:20, borderRadius:4, border:'1px solid var(--blue)' }} />
            <span>{chosenUnit.jaName} を1体獲得しました</span>
          </div>
        );
      }
    },
    {
      id: 'pro_assassin', name: 'プロの殺し屋', tier: 'gold', category: 'combat', imgName: 'contractkiller_ii',
      desc: 'パイクを1体獲得する。最も強いパイクが攻撃力ファイターになり、チームがキルまたはアシストを獲得するとゴールドを生成し、キル時にリセットされるスキルを獲得する。',
      icon: '🗡️',
      effect: (state, rng, helpers) => {
        const champ = CHAMPS.find(c => c.id === 'pyke');
        if (champ) helpers.addPendingUnits([{ ...champ, star: 1, uid: rng(), items: [] }]);
        helpers.addPassiveBuff({ type: 'pro_assassin' });
        helpers.showMsg('🗡️ プロの殺し屋: パイクを獲得しました！');
      }
    },
    {
      id: 'root_singularity', name: 'ルート・シンギュラリティ', tier: 'gold', category: 'combat', imgName: 'whitehole_ii',
      desc: 'ブラックホールが敵を飲み込むと、敵が「スペースマター」に変わる。十分な量を集めると、ブラックホールがそれを戦利品に変換する！チョ＝ガスとリサンドラを1体ずつ獲得する。',
      icon: '🌌',
      effect: (state, rng, helpers) => {
        const chogath = CHAMPS.find(c => c.id === 'chogath');
        const lissandra = CHAMPS.find(c => c.id === 'lissandra');
        const units = [];
        if (chogath) units.push({ ...chogath, star: 1, uid: rng(), items: [] });
        if (lissandra) units.push({ ...lissandra, star: 1, uid: rng(), items: [] });
        helpers.addPendingUnits(units);
        helpers.showMsg('🌌 ルート・シンギュラリティ: チョ＝ガスとリサンドラを獲得しました！');
      }
    },
    {
      id: 'single_plate', name: '一人前プレート', tier: 'gold', category: 'combat', imgName: 'soloplate_ii',
      desc: '「ガーゴイル ストーンプレート」を1個獲得する。戦闘開始時: 「ガーゴイル ストーンプレート」を装備している味方の列に他のユニットがいない場合、最大体力が17%増加する。',
      icon: '🍽️',
      effect: (state, rng, helpers) => {
        helpers.addItem({...ITEM_RECIPES['chain_cloak'], type:'completed'});
        helpers.addPassiveBuff({ type: 'single_plate' });
        helpers.showMsg('🍽️ 一人前プレート: 「ガーゴイル ストーンプレート」を獲得しました！');
      }
    },
    {
      id: 'solo_leveling', name: '俺だけレベルアップ', tier: 'gold', category: 'combat', imgName: 'sololeveling_ii',
      desc: '次の5回の対人戦で、味方チームのサイズが1になるが、ボードに配置したチャンピオンはステータスが大幅に増加する。そのチャンピオンがキルを獲得するたびに1 XPの経験値を獲得する。その後、素材アイテムを2個獲得する。',
      icon: '🧗',
      effect: (state, rng, helpers) => {
        helpers.addPassiveBuff({ type: 'solo_leveling' });
        helpers.showMsg('🧗 俺だけレベルアップ: チームサイズが1になります！');
      }
    },
    {
      id: 'self_destruction', name: '自己破壊', tier: 'gold', category: 'combat', imgName: 'https://tftips.b-cdn.net/aug/17_gragascarry.avif?v=1',
      desc: 'グラガスを1体獲得する。最も強いグラガスが魔力ファイターとなり、大爆発を巻き起こすが自身もダメージを受ける。',
      icon: '💣',
      effect: (state, rng, helpers) => {
        const champ = CHAMPS.find(c => c.id === 'gragas');
        if (champ) helpers.addPendingUnits([{ ...champ, star: 1, uid: rng(), items: [] }]);
        helpers.addPassiveBuff({ type: 'self_destruction' });
        helpers.showMsg('💣 自己破壊: グラガスを獲得しました！');
      }
    },
    {
      id: 'focus', name: '集中', tier: 'gold', category: 'combat', imgName: 'concentration_ii',
      desc: '「コンジット」のスキルは、スキルに応じて効果時間が25% - 50%延長される。ゾーイとモルデカイザーを1体ずつ獲得する。',
      icon: '👁️',
      effect: (state, rng, helpers) => {
        const zoe = CHAMPS.find(c => c.id === 'zoe');
        const morde = CHAMPS.find(c => c.id === 'mordekaiser');
        const units = [];
        if (zoe) units.push({ ...zoe, star: 1, uid: rng(), items: [] });
        if (morde) units.push({ ...morde, star: 1, uid: rng(), items: [] });
        helpers.addPendingUnits(units);
        helpers.addPassiveBuff({ type: 'focus' });
        helpers.showMsg('👁️ 集中: ゾーイとモルデカイザーを獲得しました！');
      }
    },
    {
      id: 'discharge_2', name: '放電 II', tier: 'gold', category: 'combat', imgName: 'electrocharge-ii',
      desc: '味方が4回攻撃を受けるたびに、周囲の敵に50-140(現在のステージに応じて)の魔法ダメージを与える(クールダウン1秒)。',
      icon: '⚡',
      effect: (state, rng, helpers) => {
        helpers.addPassiveBuff({ type: 'discharge_2' });
        helpers.showMsg('⚡ 放電 II: 味方が攻撃を受けると魔法ダメージを放ちます！');
      }
    },
  {
      id: 'aura_training', name: 'オーラ育成中', tier: 'gold', category: 'combat', imgName: 'aurafarming_ii',
      desc: '推奨アイテムを装備した★2のコスト5チャンピオンを1体獲得する。これは、ステージ4-3までボードに配置できない。',
      icon: '🌀',
      effect: (state, rng, helpers) => {
        const pool = [
          { champId: 'vex', itemId: 'guinsoo' },
          { champId: 'graves', itemId: 'giantslayer' },
          { champId: 'shen', itemId: 'jeweled' },
          { champId: 'jhin', itemId: 'deathblade' },
          { champId: 'sona', itemId: 'bluebuff' },
          { champId: 'bard', itemId: 'rabadon' },
          { champId: 'fiora', itemId: 'edgeofnight' },
          { champId: 'blitzcrank', itemId: 'jeweled' }
        ];
        
        // このゲームに存在するチャンピオンのみをフィルタ（エラー回避用）
        const validPool = pool.filter(p => CHAMPS.some(c => c.id === p.champId));
        if (validPool.length === 0) return; 
        
        const selected = validPool[Math.floor(rng() * validPool.length)];
        const champData = CHAMPS.find(c => c.id === selected.champId);
        const itemObj = Object.values(ITEM_RECIPES).find(r => r.id === selected.itemId);
        
        const unitData = { 
          ...champData, star: 2, uid: rng(), 
          items: itemObj ? [{ ...itemObj, type: 'completed' }] : [] 
        };
        helpers.addAuraTrainingUnit(unitData);
        helpers.showMsg(`🌀 オーラ育成中: ★★${champData.jaName} と推奨アイテムを獲得しました！`);
      }
    },
    {
      id: 'lategame_scaling', name: 'レイトゲーム スケーリング', tier: 'gold', category: 'combat', imgName: 'lategamescaling_ii',
      desc: 'プレイヤーの戦闘ラウンド開始時に、2 XPの経験値を獲得する。味方のコスト5チャンピオンの体力が12%、攻撃速度が12%増加する。',
      icon: '📈',
      effect: (state, rng, helpers) => {
        helpers.addPassiveBuff({ type: 'lategame_scaling' });
        helpers.showMsg('📈 レイトゲーム スケーリング: 毎ラウンドXP獲得＆5コスト強化！');
      }
    },
    {
      id: 'galactic_journey', name: '銀河を巡る旅', tier: 'gold', category: 'combat', imgName: 'tourofthegalaxy_ii',
      desc: '「ボイジャー」の体力が130、攻撃力が13%、魔力が13%増加する。新たな対戦相手と戦うたびに、効果が10%ずつ増加する。直近で戦っていないプレイヤーと優先的に対戦する。パイクとミィプシーを1体ずつ獲得する。',
      icon: '🚀',
      effect: (state, rng, helpers) => {
        const pyke = CHAMPS.find(c => c.id === 'pyke');
        const miipsy = CHAMPS.find(c => c.id === 'miipsy' || c.id === 'meepsie');
        const units = [];
        if (pyke) units.push({ ...pyke, star: 1, uid: rng(), items: [] });
        if (miipsy) units.push({ ...miipsy, star: 1, uid: rng(), items: [] });
        helpers.addPendingUnits(units);
        helpers.showMsg('🚀 銀河を巡る旅: パイクとミィプシーを獲得しました！');
      }
    },
    {
      id: 'blood_offering', name: '血の供物', tier: 'gold', category: 'combat', imgName: 'trailofblood_ii',
      desc: '「ブラッドサースター」を1個獲得する。戦闘開始時: 「ブラッドサースター」を装備した味方の体力が20%減少するが、体力の30%にあたる耐久値を持つシールドを獲得し、攻撃力が10%増加する。',
      icon: '🩸',
      effect: (state, rng, helpers) => {
        helpers.addItem({...ITEM_RECIPES['bf_cloak'], type:'completed'});
        helpers.addPassiveBuff({ type: 'blood_offering' });
        helpers.showMsg('🩸 血の供物: 「ブラッドサースター」を獲得しました！');
      }
    },
    {
      id: 'heart_of_steel', name: '鋼の心', tier: 'gold', category: 'combat', imgName: 'healthygains_ii',
      desc: '「揺るがぬ心」を1個獲得する。戦闘で装備者が10秒生存するごとに、「揺るがぬ心」が最大体力を恒久的に16追加で獲得する。',
      icon: '🛡️',
      effect: (state, rng, helpers) => {
        helpers.addItem({...ITEM_RECIPES['chain_glove'], type:'completed'});
        helpers.addPassiveBuff({ type: 'heart_of_steel' });
        helpers.showMsg('🛡️ 鋼の心: 「揺るがぬ心」を獲得しました！');
      }
    },
    {
      id: 'spun_magic', name: '紡がれし魔法', tier: 'gold', category: 'item', imgName: 'wovenmagic_iii',
      desc: 'ランダムな素材アイテムを1個獲得する。味方チームが2200マナを消費するごとに、追加の素材アイテムを獲得する。',
      icon: '🪄',
      effect: (state, rng, helpers) => {
        const comps = ITEMS.filter(x => x.type === 'comp' && x.id !== 'spatula' && x.id !== 'pan');
        helpers.addItem({ ...comps[Math.floor(rng() * comps.length)] });
        helpers.showMsg('🪄 紡がれし魔法: 素材アイテムを1個獲得しました！');
      }
    },
    {
      id: 'cry_all_you_want', name: '好きなだけ泣くがいい', tier: 'gold', category: 'combat', imgName: 'crymeariver_ii',
      desc: '「女神の涙」を1個獲得する。味方チームが1のマナ自動回復を獲得する。戦闘開始から12秒後にこの効果は3になる。',
      icon: '😭',
      effect: (state, rng, helpers) => {
        helpers.addItem({...ITEMS.find(i=>i.id==='tear')});
        helpers.addPassiveBuff({ type: 'cry_all_you_want' });
        helpers.showMsg('😭 好きなだけ泣くがいい: 「女神の涙」を獲得しました！');
      }
    },
    {
      id: 'fast_double_kill', name: '高速ダブルキル', tier: 'gold', category: 'item', imgName: 'speedydoublekill_ii',
      desc: '「グインソー レイジブレード」を1個獲得する。2人のプレイヤーが敗退すると、40ゴールドを獲得する。',
      icon: '⚔️',
      effect: (state, rng, helpers) => {
        helpers.addItem({...ITEM_RECIPES['bow_rod'], type:'completed'});
        helpers.showMsg('⚔️ 高速ダブルキル: 「グインソー レイジブレード」を獲得しました！');
      }
    },
    {
      id: 'high_voltage', name: '高電圧', tier: 'gold', category: 'combat', imgName: 'highvoltage_ii',
      desc: '「アイオニック スパーク」を1個獲得する。「アイオニック スパーク」の半径が3マス増加し、ダメージが20%増加する。',
      icon: '⚡',
      effect: (state, rng, helpers) => {
        helpers.addItem({...ITEM_RECIPES['rod_cloak'], type:'completed'});
        helpers.addPassiveBuff({ type: 'high_voltage' });
        helpers.showMsg('⚡ 高電圧: 「アイオニック スパーク」を獲得しました！');
      }
    },
    {
      id: 'heat_death', name: '熱死', tier: 'gold', category: 'combat', imgName: 'starconqueror_ii',
      desc: 'モルデカイザーを1体獲得する。最も強いモルデカイザーが魔力ファイターとなり、徐々に拡大するオーラで継続ダメージを与える。',
      icon: '🥵',
      effect: (state, rng, helpers) => {
        const champ = CHAMPS.find(c => c.id === 'mordekaiser');
        if (champ) helpers.addPendingUnits([{ ...champ, star: 1, uid: rng(), items: [] }]);
        helpers.addPassiveBuff({ type: 'heat_death' });
        helpers.showMsg('🥵 熱死: モルデカイザーを獲得しました！');
      }
    },
    {
      id: 'clear_mind_2', name: '明鏡止水', tier: 'gold', category: 'economy', imgName: 'clearmind2',
      desc: '対人戦ラウンド終了時、ベンチにチャンピオンがいない場合は経験値を3XP獲得する。',
      icon: '🧘',
      effect: (state, rng, helpers) => {
        helpers.addPassiveBuff({ type: 'clear_mind_2' });
        helpers.showMsg('🧘 明鏡止水: ベンチを空にしてXPを獲得しましょう！');
      }
    },
    {
      id: 'timestream', name: 'タイムストリーム', tier: 'gold', category: 'combat', imgName: 'timestream_ii',
      desc: '「タイムブレーカー」は、リロールするたび(無料のリロールも含む)に体力が7と攻撃速度が0.25%増加する。エズリアルとパンテオンを1体ずつ獲得する。',
      icon: '⏱️',
      effect: (state, rng, helpers) => {
        const ezreal = CHAMPS.find(c => c.id === 'ezreal');
        const pantheon = CHAMPS.find(c => c.id === 'pantheon');
        const units = [];
        if (ezreal) units.push({ ...ezreal, star: 1, uid: rng(), items: [] });
        if (pantheon) units.push({ ...pantheon, star: 1, uid: rng(), items: [] });
        helpers.addPendingUnits(units);
        helpers.showMsg('⏱️ タイムストリーム: エズリアルとパンテオンを獲得しました！');
      }
    },
    {
      id: 'treasure_hunt', name: '宝探し', tier: 'gold', category: 'economy', imgName: 'treasurehunt_ii',
      desc: '現時点からステージ6まで、ステージごとにロックされた宝箱を1個獲得する。ショップのリロールで16ゴールドを使用すると、宝箱を1個開封できる。これらの宝箱は開封するまで消えずに残る。',
      icon: '🧰',
      effect: (state, rng, helpers) => {
        helpers.addPassiveBuff({ type: 'treasure_hunt' });
        helpers.showMsg('🧰 宝探し: ステージごとにロックされた宝箱を獲得します！');
      }
    },
    {
      id: 'reach_for_the_stars', name: '星を目指して', tier: 'gold', category: 'combat', imgName: 'reachforthestars_ii',
      desc: 'ジャックスを1体獲得する。最も強いジャックスが魔力ファイターになり、通常攻撃で追加魔法ダメージを与え、スキル発動時に攻撃速度が増加するスタックを獲得する。',
      icon: '✨',
      effect: (state, rng, helpers) => {
        const champ = CHAMPS.find(c => c.id === 'jax');
        if (champ) helpers.addPendingUnits([{ ...champ, star: 1, uid: rng(), items: [] }]);
        helpers.addPassiveBuff({ type: 'reach_for_the_stars' });
        helpers.showMsg('✨ 星を目指して: ジャックスを獲得しました！');
      }
    },
    {
      id: 'money_hungry', name: '金に飢えし者', tier: 'gold', category: 'economy', imgName: 'moneyhungry1_ii',
      desc: '即座に7ゴールドを獲得し、その後は各ステージの開始時に7ゴールドを獲得する。ゴールドを拾うとタクティシャンが大きくなる。',
      icon: '🤑',
      effect: (state, rng, helpers) => {
        helpers.addGold(7);
        helpers.addPassiveBuff({ type: 'money_hungry' });
        helpers.showMsg('🤑 金に飢えし者: 7Gを獲得しました！');
      }
    },
  ],

  //プリズム
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
    {
      id: 'pandoras_items3', name: 'パンドラのアイテム III', tier: 'prismatic', category: 'item', imgName: 'pandora3',
      desc: 'ラウンド開始時: ベンチのアイテムがランダムに変更される。ランダムなレディアントアイテムを1個獲得する。',
      icon: '📦',
      effect: (state, rng, helpers) => {
        const radiantPool = RADIANT_ITEMS;
        helpers.addItem({ ...radiantPool[Math.floor(rng() * radiantPool.length)] });
        helpers.addPassiveBuff({ type: 'pandoras_items_3' });
      }
    },
    {
      id: 'lucky_gloves', name: 'ラッキーグローブ', tier: 'prismatic', category: 'item', imgName: 'lucky-gloves-iii',
      desc: '「盗賊のグローブ」が毎回、そのチャンピオンにとって理想的なアイテムを付与するようになる。「スパーリング グローブ」を2個獲得する。',
      icon: '🧤',
      effect: (state, rng, helpers) => {
        const glove = ITEMS.find(i => i.id === 'glove');
        if (glove) { helpers.addItem({ ...glove }); helpers.addItem({ ...glove }); }
        helpers.addPassiveBuff({ type: 'lucky_gloves' });
        helpers.showMsg('🧤 ラッキーグローブ: スパーリンググローブを2個獲得しました！');
      }
    },
    {
      id: 'wise_spending', name: '賢い買い物', tier: 'prismatic', category: 'economy', imgName: 'wisespending3',
      desc: 'XPを購入できなくなる。ショップをリロールしてゴールドを消費するたびに、2XPを獲得する。即座に3ゴールドを獲得する。',
      icon: '🛒',
      effect: (state, rng, helpers) => {
        helpers.addGold(3);
        helpers.addPassiveBuff({ type: 'wise_spending' });
        helpers.showMsg('🛒 賢い買い物: 3Gを獲得！リロールでXPを獲得できるようになります。');
      }
    },
    {
      id: 'speculative_buying', name: '思惑買い', tier: 'prismatic', category: 'economy', imgName: 'going-long-iii',
      desc: '利子を獲得しなくなる。13ゴールドを即座に獲得する。ラウンド開始時: 4 XPの経験値を獲得する。',
      icon: '💸',
      effect: (state, rng, helpers) => {
        helpers.addGold(13);
        helpers.showMsg('💸 思惑買い: 13Gを獲得しました！');
      }
    },
    {
      id: 'flexibility', name: '柔軟性', tier: 'prismatic', category: 'item', imgName: 'https://tftips.b-cdn.net/aug/_flexible.avif?v=1',
      desc: 'ランダムな紋章アイテムを1個獲得する。毎ステージ開始時、ランダムな紋章を1個獲得する。装備した紋章1つごとに、味方チームの体力が30増加する。',
      icon: '🛡️',
      effect: (state, rng, helpers) => {
        const recipes = Object.values(ITEM_RECIPES);
        const emblems = recipes.filter(r => r.grantedTrait);
        const randomEmblem = { ...emblems[Math.floor(rng() * emblems.length)], type: 'completed' };
        helpers.addItem(randomEmblem);
        helpers.showMsg('🛡️ 柔軟性: ランダムな紋章を1個獲得しました！');
      }
    },
    {
      id: 'heart_and_soul', name: '全身全霊', tier: 'prismatic', category: 'item', imgName: 'hardcommit_iii',
      desc: 'ランダムな紋章アイテムを1個獲得する。今すぐ、および各ステージ開始時に、コストがステージ数と同じで(最大5)、その紋章の特性を持つ★1のユニットと3ゴールドを獲得する。',
      icon: '❤️',
      effect: (state, rng, helpers) => {
        helpers.addGold(3);
        
        const recipes = Object.values(ITEM_RECIPES);
        const emblems = recipes.filter(r => r.grantedTrait);
        
        // 指定された紋章とチャンピオンのペア
        const pairs = [
          { trait: 'Vanguard', champIds: ['mordekaiser'] },
          { trait: 'Psionic', champIds: ['gragas', 'pyke'] },
          { trait: 'Sniper', champIds: ['gnar'] },
          { trait: 'Space Groove', champIds: ['gwen'] },
          { trait: 'Dark Star', champIds: ['mordekaiser'] },
          { trait: 'Bastion', champIds: ['jax'] },
          { trait: 'Meeple', champIds: ['gnar', 'meepsie'] },
          { trait: 'Shepherd', champIds: ['miipsy', 'meepsie'] }, // 導き手
          { trait: 'Marauder', champIds: ['akali', 'belveth'] } // 略奪者
        ];

        // データ内に存在するペアだけをフィルタリング
        const validPairs = pairs.filter(p => {
          const hasEmblem = emblems.some(e => e.grantedTrait === p.trait);
          const hasChamp = p.champIds.some(cid => CHAMPS.some(c => c.id === cid));
          return hasEmblem && hasChamp;
        });

        // 抽選と獲得
        const chosenPair = validPairs.length > 0 ? validPairs[Math.floor(rng() * validPairs.length)] : { trait: emblems[Math.floor(rng() * emblems.length)].grantedTrait, champIds: [] };
        const chosenEmblem = { ...emblems.find(e => e.grantedTrait === chosenPair.trait), type: 'completed' };
        const validChamps = chosenPair.champIds.map(cid => CHAMPS.find(c => c.id === cid)).filter(Boolean);
        
        helpers.addItem(chosenEmblem);
        if (validChamps.length > 0) {
          const chosenChamp = validChamps[Math.floor(rng() * validChamps.length)];
          helpers.addPendingUnits([{ ...chosenChamp, star: 1, uid: rng(), items: [] }]);
          helpers.showMsg(`❤️ 全身全霊: 3G、${helpers.getJaName(chosenEmblem.name)}、${chosenChamp.jaName}を獲得しました！`);
        } else {
          helpers.showMsg(`❤️ 全身全霊: 3Gと${helpers.getJaName(chosenEmblem.name)}を獲得しました！`);
        }
      }
    },
    {
      id: 'swarm_heart', name: 'スワーム ハート', tier: 'prismatic', category: 'combat', imgName: 'heartoftheswarm_iii',
      desc: 'すべての★3チャンピオンがスワームリングのパワーとしてカウントされる。レベル9で、異なる★3チャンピオンを6体配置している場合、「プライモーディアン」がエイペックス・プライモーディアンを召喚する。「プライモーディアン」のチャンピオン3体と「小型チャンピオン複製器」を2個獲得する。',
      icon: '👾',
      effect: (state, rng, helpers) => {
        const pool = CHAMPS.filter(c => c.traits.includes('Primordian'));
        const units = [];
        if (pool.length > 0) {
          for (let i = 0; i < 3; i++) {
            const chosen = pool[Math.floor(rng() * pool.length)];
            units.push({ ...chosen, star: 1, uid: rng(), items: [] });
          }
        }
        helpers.addPendingUnits(units);
        helpers.addItem({...CONSUMABLES.LESSER_DUPE});
        helpers.addItem({...CONSUMABLES.LESSER_DUPE});
        helpers.showMsg('👾 スワーム ハート: プライモーディアン3体と小型複製器2個を獲得しました！');
      }
    },
    {
      id: 'living_forge', name: '歩く鍛冶場', tier: 'prismatic', category: 'item', imgName: 'living-forge-iii',
      desc: '「アーティファクトの金床」を即座に1個獲得し、その後は対人戦ラウンドを8回終えるたびに1個獲得する。',
      icon: '🔨',
      effect: (state, rng, helpers) => {
        helpers.addAnvilToBench('artifact', 1);
        helpers.showMsg('🔨 歩く鍛冶場: アーティファクトの金床を獲得しました！');
      }
    },
    {
      id: 'shimmerscale_essence', name: 'シマースケールのエッセンス', tier: 'prismatic', category: 'item', imgName: 'shimmerscaleessence_iii',
      desc: '「モーグル メイル」を1個獲得する。6ラウンド後に、「ギャンブラーの剣」を1個獲得する。',
      icon: '🪙',
      effect: (state, rng, helpers) => {
        helpers.addItem({ ...ARTIFACTS.find(i => i.id === 'mogulsmail') });
        helpers.showMsg('🪙 シマースケールのエッセンス: 「モーグル メイル」を獲得しました！');
      }
    },
    {
      id: 'golden_gamble', name: '黄金の博打', tier: 'prismatic', category: 'item', imgName: 'goldengamble_iii',
      desc: '1ゴールドを獲得してコインを投げる。表が出た場合、「レディアント 幸運のアイテムチェスト」を1個獲得する。裏が出た場合、「完成アイテムの金床」を2個獲得する。',
      icon: '🪙',
      effect: (state, rng, helpers) => {
        helpers.addGold(1);
        const isHeads = rng() < 0.5;
        if (isHeads) {
          helpers.addAnvilToBench('radiant', 1);
          helpers.showMsg('🪙 黄金の博打: 表！1Gとレディアント金床を獲得しました！');
        } else {
          helpers.addAnvilToBench('completed', 2);
          helpers.showMsg('🪙 黄金の博打: 裏！1Gと完成品の金床を2個獲得しました！');
        }
      }
    },
    {
      id: 'forged_in_force', name: '力に鍛えられしもの', tier: 'prismatic', category: 'item', imgName: 'forgedinstrength_iii',
      desc: 'ランダムなアーティファクトを1個獲得する。体力が35を下回ると、ランダムなアーティファクトを追加で3個獲得する',
      icon: '🛡️',
      effect: (state, rng, helpers) => {
        helpers.addItem({ ...ARTIFACTS[Math.floor(rng() * ARTIFACTS.length)] });
        helpers.showMsg('🛡️ 力に鍛えられしもの: ランダムなアーティファクトを獲得しました！');
      }
    },
    {
      id: 'always_together', name: 'いつでも一緒', tier: 'prismatic', category: 'item', imgName: 'westicktogether_iii',
      desc: 'ランダムな紋章アイテムを1個と、「完成アイテムの金床」を1個獲得する。その紋章と同じ特性を持っている味方の攻撃速度が30%増加する。',
      icon: '💞',
      effect: (state, rng, helpers) => {
        const recipes = Object.values(ITEM_RECIPES);
        const emblems = recipes.filter(r => r.grantedTrait);
        const randomEmblem = { ...emblems[Math.floor(rng() * emblems.length)], type: 'completed' };
        helpers.addItem(randomEmblem);
        helpers.addAnvilToBench('completed', 1);
        helpers.showMsg(`💞 いつでも一緒: ${helpers.getJaName(randomEmblem.name)}と完成品の金床を獲得しました！`);
      }
    },
    {
      id: 'subscription', name: 'サブスクリプション', tier: 'prismatic', category: 'economy', imgName: 'subscriptionservice_iii',
      desc: '現在、そして各ステージの開始時に、異なるコスト4チャンピオンが4体並ぶショップを開き、6ゴールドを獲得する',
      icon: '📦',
      effect: (state, rng, helpers) => {
        helpers.addGold(6);
        const pool = CHAMPS.filter(c => c.cost === 4);
        const tempPool = [...pool];
        const newShop = [];
        for (let i = 0; i < 4; i++) {
          if (tempPool.length === 0) break;
          const idx = Math.floor(rng() * tempPool.length);
          newShop.push({ ...tempPool.splice(idx, 1)[0], star: 1, uid: rng() });
        }
        newShop.push(null); // ショップは通常5枠なので、最後を空(null)にする
        if (helpers.setShop) helpers.setShop(newShop);
        helpers.showMsg('📦 サブスクリプション: 6Gとコスト4が並ぶ特別ショップを獲得しました！');
      }
    },
    {
      id: 'expected_surprise', name: '想定内の意外性', tier: 'prismatic', category: 'economy', imgName: 'addicted-to-rolling-iii',
      desc: '即座に、および次の2ステージの開始時に、3個のダイスを振る。その合計に応じて様々な報酬を獲得する。',
      icon: '🎲',
      effect: (state, rng, helpers) => {
        const roll = rng() * 100;
        if (roll < 46) {
          const pool = CHAMPS.filter(c => c.cost === 4);
          const units = [];
          for (let i = 0; i < 2; i++) {
            units.push({ ...pool[Math.floor(rng() * pool.length)], star: 1, uid: rng(), items: [] });
          }
          helpers.addPendingUnits(units);
          helpers.showMsg('🎲 想定内の意外性: ランダムなコスト4を2体獲得しました！');
        } else if (roll < 82) {
          helpers.addGold(9);
          helpers.showMsg('🎲 想定内の意外性: 9Gを獲得しました！');
        } else if (roll < 93) {
          helpers.addGold(2);
          helpers.addAnvilToBench('component', 2);
          for(let i = 0; i < 3; i++) helpers.addItem({...CONSUMABLES.REFORGER});
          helpers.showMsg('🎲 想定内の意外性: 2G、素材の金床2個、再合成装置3個を獲得しました！');
        } else if (roll < 97) {
          helpers.addGold(2);
          helpers.addAnvilToBench('artifact', 1);
          helpers.showMsg('🎲 想定内の意外性: 2Gとアーティファクトの金床を獲得しました！');
        } else {
          helpers.addGold(3);
          helpers.addItem({...ITEM_RECIPES['spatula_spatula'], type: 'completed'});
          helpers.showMsg('🎲 想定内の意外性: 3Gとタクティシャンの王冠を獲得しました！');
        }
      }
    },
  ]
};
