/* ============================================================
   データ: 遭遇（Opening Encounter） ── TFT Set 17 公式20種
   ── 神(GOD_DATA)とは別物。ゲーム開始時に prob で1つだけ加重抽選される。
   ── 効果の発動タイミング別フィールド（このシムは 1-1〜2-1 が範囲）:
        effect(state,rng,h) ... 開始時(1-1→1-2)に1回発動
        augmentForceTier .... 2-1のオーグメントのティアを強制 ('gold'|'prismatic')
        augmentRerollBonus .. 2-1のオーグメント再抽選回数を+N
        freeRerollsAt21 ..... 2-1到達時に無料リロールを+N
        displayOnly: true ... 2-1より後に発動する等で、表示のみ（効果なし）
   ── helpers(h): addGold/addXp/addItem/addChampToBench(cost,count,rng)/
                  addChampToBenchDirect/setXpCostReduction/showMsg など
   ── prob は出現確率(%)。合計≒100。
   ============================================================ */
const ENCOUNTERS = [

  { id:'viktor', champ:'ビクター', jaName:'アップグレード済みのチャンピオン', prob:7.3,
    desc:'ランダムなコスト1の★2チャンピオンを1体所持して試合を開始する。',
    icon:'⚙️', color:'#7fd0ff',
    effect:(s,rng,h)=>{ const pool=CHAMPS.filter(c=>c.cost===1); const c=pool[Math.floor(rng()*pool.length)];
      if(h.addChampToBoardDirect) { h.addChampToBoardDirect({...c, star:2, uid:rng(), items:[]}); } else { h.addChampToBenchDirect({...c, star:2, uid:rng(), items:[]}); } h.showMsg(`⚙️ ビクター: ★★${c.jaName} を獲得！`); } },

  { id:'miipsy', champ:'ミィプシー', jaName:'コスト2スタート', prob:7.3,
    desc:'ランダムなコスト2のチャンピオンを1体所持して試合を開始する。',
    icon:'⭐', color:'#44cc66',
    effect:(s,rng,h)=>{ if(h.addChampToBoard) { h.addChampToBoard(2,1,rng); } else { h.addChampToBench(2,1,rng); } h.showMsg('⭐ ミィプシー: 2コストを1体獲得！'); } },

  { id:'lissandra', champ:'リサンドラ', jaName:'ハウリングアビス', prob:7.3,
    desc:'ハウリングアビスの上で戦う、ランダムな1コストユニットを5体獲得する。',
    icon:'🌉', color:'#5b6cff',
    effect:(s,rng,h)=>{ 
      const pool = CHAMPS.filter(c => c.cost === 1);
      const tempPool = [...pool];
      const chosen = [];
      for (let i = 0; i < 5; i++) {
        if (tempPool.length === 0) break;
        const idx = Math.floor(rng() * tempPool.length);
        chosen.push({ ...tempPool.splice(idx, 1)[0], star: 1, uid: rng(), items: [] });
      }
      if (h.addChampToBoardDirect) {
        h.addChampToBoardDirect(chosen[0]);
        for (let i = 1; i < chosen.length; i++) h.addChampToBenchDirect(chosen[i]);
      } else {
        chosen.forEach(c => h.addChampToBenchDirect(c));
      }
      h.showMsg('🌉 リサンドラ: 異なる1コストを5体獲得！'); 
    } 
  },

  { id:'poppy', champ:'ポッピー', jaName:'素材アイテムの金床', prob:7.3,
    desc:'「素材アイテムの金床」を2個所持して試合を開始する。',
    icon:'🛠️', color:'#ff9f43',
    effect:(s,rng,h)=>{ 
      h.addAnvilToBench('component', 2); h.showMsg('🛠️ ポッピー: 金床を2個獲得！'); } },

  { id:'twistedfate', champ:'ツイステッドフェイト', jaName:'黄金の祭典', prob:7.3,
    desc:'この試合で提示されるオーグメントがすべてゴールドティアになる。',
    icon:'🪙', color:'#ffcc44', augmentForceTier:'gold' },

  { id:'missfortune', champ:'ミスフォーチュン', jaName:'コスト3スタート', prob:6.1,
    desc:'ランダムなコスト3のチャンピオンを1体所持して試合を開始する。',
    icon:'🌟', color:'#3399ff',
    effect:(s,rng,h)=>{ if(h.addChampToBoard) { h.addChampToBoard(3,1,rng); } else { h.addChampToBench(3,1,rng); } h.showMsg('🌟 ミスフォーチュン: 3コストを1体獲得！'); } },

  { id:'fiora', champ:'フィオラ', jaName:'Silver Scrapes', prob:4.9,
    desc:'最後に生存している2人のプレイヤーが70ゴールドを獲得し、壮大な最後の対決が始まる。',
    icon:'⚔️', color:'#c0c0c0', displayOnly:true },

  { id:'sona', champ:'ソナ', jaName:'お得なレベル', prob:4.9,
    desc:'各レベルで必要な経験値が2減少する。',
    icon:'🎵', color:'#7fe0d0',
    effect:(s,rng,h)=>{ h.setXpCostReduction(2); h.showMsg('🎵 ソナ: XPコスト -2！'); } },

  { id:'zoe', champ:'ゾーイ', jaName:'ゴールドのサブスク', prob:4.9,
    desc:'毎ステージ、ランダムな量のゴールドを獲得する。全プレイヤーが同じ量のゴールドを獲得する。',
    icon:'💳', color:'#ffd76e',
    effect:(s,rng,h)=>{ const g=2+Math.floor(rng()*5); h.addGold(g); h.showMsg(`💳 ゾーイ: ${g}G 獲得！`); } },

  { id:'graves', champ:'グレイブス', jaName:'プリズム フィナーレ', prob:4.9,
    desc:'この試合で最後に提示されるオーグメントがプリズムティアになる。',
    icon:'💎', color:'#ff7ad9', displayOnly:true },

  { id:'shen', champ:'シェン', jaName:'プリズム プレリュード', prob:4.9,
    desc:'この試合で最初に提示されるオーグメントがプリズムティアになる。',
    icon:'💠', color:'#7ad9ff', augmentForceTier:'prismatic' },

  { id:'talon', champ:'タロン', jaName:'偵察部隊', prob:4.9,
    desc:'この試合ではオーグメントのリロールを+1獲得する。',
    icon:'🗡️', color:'#9aa7b5', augmentRerollBonus:1 },

  { id:'velkoz', champ:'ヴェル=ヴェス', jaName:'複製器×2', prob:4.9,
    desc:'「小さなチャンピオン複製器」を1個獲得する。3-5で、「小型チャンピオン複製器」を獲得する。',
    icon:'🔹', color:'#a06bff',
    effect:(s,rng,h)=>{ h.addItem({...CONSUMABLES.TINY_DUPE}); h.showMsg('🔹 ヴェル=ヴェス: 小さなチャンピオン複製器を獲得！'); } },


  { id:'tahmkench', champ:'タムケンチ', jaName:'戦利品サブスク', prob:3.7,
    desc:'1ステージごとに、様々な戦利品の中からランダムな戦利品を獲得する。',
    icon:'🎁', color:'#e0a060', displayOnly:true },

  { id:'none', champ:'なし', jaName:'神々の世界', prob:3.7,
    desc:'この試合では誰にも遭遇しない。',
    icon:'🕊️', color:'#7a8aa0',
    effect:(s,rng,h)=>{ h.showMsg('🕊️ 神々の世界 ― 遭遇なし'); } },

  { id:'rastt', champ:'ラースト', jaName:'紋章アンサンブル', prob:3.7,
    desc:'3個のランダムな紋章アイテムを所持してスタートする。',
    icon:'🔰', color:'#66e0a0',
    effect:(s,rng,h)=>{
      const emblems = Object.values(ITEM_RECIPES).filter(r => r.grantedTrait);
      const tempEmblems = [...emblems];
      for (let i = 0; i < 3; i++) {
        if (tempEmblems.length === 0) break;
        const idx = Math.floor(rng() * tempEmblems.length);
        const emblem = tempEmblems.splice(idx, 1)[0];
        h.addItem({ ...emblem, type: 'completed' });
      }
      h.showMsg('🔰 ラースト: 異なる紋章を3個獲得しました！');
    } },

  { id:'ezreal', champ:'エズリアル', jaName:'開幕リロール', prob:3.7,
    desc:'2-1で、5回分の無料リロールを獲得する。',
    icon:'🎲', color:'#ffd76e', freeRerollsAt21:5 },

  { id:'ornn', champ:'オーン', jaName:'アーティファクトの金床', prob:2.4,
    desc:'3-3で全プレイヤーが「アーティファクトの金床」を獲得する。',
    icon:'🔨', color:'#d9a05b', displayOnly:true },

  { id:'morgana', champ:'モルガナ', jaName:'プリズムパーティー', prob:2.4,
    desc:'この試合で提示されるオーグメントがすべてプリズムティアになる。',
    icon:'💜', color:'#c46bff', augmentForceTier:'prismatic' },

];
