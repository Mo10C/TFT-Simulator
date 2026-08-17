/* ============================================================
   データ: アイテム（素材・完成品・消費アイテム・アーティファクト）
   ============================================================ */

/* ── アイテム日本語名 ── */
/* ── 素材アイテム ── */
const ITEMS=[
  {id:'bfsword', name:'B.F.ソード', jaName: 'B.F.ソード', icon:'⚔️', type:'comp', imgId: 1}, 
  {id:'recurvebow', name:'recurvebow', jaName: 'リカーブボウ', icon:'🏹', type:'comp', imgId: 2},
  {id:'needlesslylargerod', name:'Needlessly Large needlesslylargerod', jaName: 'ムダニデカイロッド', icon:'🔮', type:'comp', imgId: 3}, 
  {id:'tearofthegoddess', name:'tearofthegoddess of the Goddess', jaName: '女神の涙', icon:'💧', type:'comp', imgId: 4},
  {id:'chainvest', name:'chainvest Vest', jaName: 'チェインベスト', icon:'🛡️', type:'comp', imgId: 5}, 
  {id:'negatroncloak', name:'Negatron negatroncloak', jaName: 'ネガトロンクローク', icon:'🧥', type:'comp', imgId: 6},
  {id:'giantsbelt', name:"giantsbelt", jaName: 'ジャイアントベルト', icon:'💖', type:'comp', imgId: 7}, 
  {id:'sparringgloves', name:'Sparring sparringglovess', jaName: 'スパーリンググローブ', icon:'🥊', type:'comp', imgId: 9},
  {id:'spatula', name:'Spatula', jaName: '黄金のへら', icon:'🍳', type:'comp', imgId: 8},
  {id:'fryingpan', name:'Frying fryingpan', jaName: 'フライパン', icon:'🥘', type:'comp', imgId: 10}
];

/* ── サイオニック専用アイテム ── */
const PSIONIC_ITEMS = [
  { name: 'tft17_item_psyops_targetlockmod', jaName: 'ターゲットロック スコープ' },
  { name: 'tft17_item_psyops_sympatheticimplantmod', jaName: '共感インプラント' },
  { name: 'tft17_item_psyops_dronemod', jaName: 'ドローン アップリンク' },
  { name: 'tft17_item_psyops_chemicalcapacitormod', jaName: 'マルウェア マトリックス' },
  { name: 'tft17_item_psyops_grenademod', jaName: 'バイオ物質保存装置' }
];

/* ── 完成アイテムのレシピ ── */
const ITEM_RECIPES = {
  'bfsword_bfsword':{id:'deathblade', name:'deathblade', jaName: 'デスブレード', icon:'🗡️', imgId: 11}, 
  'bfsword_recurvebow':{id:'giantslayer', name:'Giant Slayer', jaName: 'ジャイアントスレイヤー', icon:'🪚', imgId: 12},
  'bfsword_needlesslylargerod':{id:'hextechgunblade', name:'Hextech Gunblade', jaName: 'ヘクステックガンブレード', icon:'🔫', imgId: 13}, 
  'bfsword_tearofthegoddess':{id:'spearofshojin', name:'spearofshojin', jaName: 'ショウジンの矛', icon:'🔱', imgId: 14},
  'bfsword_chainvest':{id:'guardianangel', name:'guardianangel', jaName: 'ナイトエッジ', icon:'🌑', imgId: 15}, 
  'bfsword_negatroncloak':{id:'bloodthirster', name:'Bloodthirster', jaName: 'ブラッドサースター', icon:'🧛', imgId: 16},
  'bfsword_giantsbelt':{id:'steraksgage', name:"steraksgage", jaName: 'ステラックの篭手', icon:'💪', imgId: 17}, 
  'bfsword_sparringgloves':{id:'infinityedge', name:'Infinity Edge', jaName: 'インフィニティエッジ', icon:'✨', imgId: 19},
  'recurvebow_recurvebow':{id:'rapidfirecannon', name:'rapidfirecannon', jaName: 'レッドバフ', icon:'🔥', imgId: 22}, 
  'recurvebow_needlesslylargerod':{id:'guinsoosrageblade', name:"Guinsoo's Rageblade", jaName: 'グインソー レイジブレード', icon:'☄️', imgId: 23},
  'recurvebow_tearofthegoddess':{id:'statikkshiv', name:'statikkshiv', jaName: 'ヴォイドスタッフ', icon:'⚡', imgId: 24}, 
  'recurvebow_chainvest':{id:'titansresolve', name:"Titan's Resolve", jaName: '巨人の誓い', icon:'🗿', imgId: 25},
  'recurvebow_negatroncloak':{id:'runaanshurricane', name:"runaanshurricane", jaName: 'クラーケンの怒り', icon:'🌪️', imgId: 26}, 
  'recurvebow_giantsbelt':{id:'leviathan', name:"leviathan", jaName: 'ナッシャー トゥース', icon:'🦷', imgId: 27},
  'recurvebow_sparringgloves':{id:'lastwhisper', name:'Last Whisper', jaName: 'ラストウィスパー', icon:'🏹', imgId: 29},
  'needlesslylargerod_needlesslylargerod':{id:'rabadonsdeathcap', name:"Rabadon's Deathcap", jaName: 'ラバドンデスキャップ', icon:'🎩', imgId: 33}, 
  'needlesslylargerod_tearofthegoddess':{id:'archangelstaff', name:"Archangel's Staff", jaName: 'アークエンジェルスタッフ', icon:'👼', imgId: 34},
  'needlesslylargerod_chainvest':{id:'crownguard', name:'Crownguard', jaName: 'クラウンガード', icon:'👑', imgId: 35}, 
  'needlesslylargerod_negatroncloak':{id:'ionicspark', name:'Ionic Spark', jaName: 'アイオニックスパーク', icon:'🌩️', imgId: 36},
  'needlesslylargerod_giantsbelt':{id:'morellonomicon', name:'Morellonomicon', jaName: 'モレロノミコン', icon:'📜', imgId: 37}, 
  'needlesslylargerod_sparringgloves':{id:'jeweledgauntlet', name:'Jeweled Gauntlet', jaName: 'ジュエル ガントレット', icon:'💎', imgId: 39},
  'tearofthegoddess_tearofthegoddess':{id:'bluebuff', name:'Blue Buff', jaName: 'ブルーバフ', icon:'🟦', imgId: 44}, 
  'tearofthegoddess_chainvest':{id:'frozenheart', name:"frozenheart", jaName: 'プロテクターの誓い', icon:'🤝', imgId: 45},
  'tearofthegoddess_negatroncloak':{id:'adaptivehelm', name:'Adaptive Helm', jaName: 'アダプティブヘルム', icon:'🪖', imgId: 46}, 
  'tearofthegoddess_giantsbelt':{id:'redemption', name:'Redemption', jaName: 'スピリット ビサージュ', icon:'😇', imgId: 47},
  'tearofthegoddess_sparringgloves':{id:'unstableconcoction', name:'unstableconcoction', jaName: 'ハンド オブ ジャスティス', icon:'⚖️', imgId: 49},
  'chainvest_chainvest':{id:'bramblevest', name:'Bramble Vest', jaName: 'ブランブルベスト', icon:'🌵', imgId: 55}, 
  'chainvest_negatroncloak':{id:'gargoylestoneplate', name:'Gargoyle Stoneplate', jaName: 'ガーゴイルストーンプレート', icon:'🗿', imgId: 56},
  'chainvest_giantsbelt':{id:'redbuff', name:'redbuff', jaName: 'サンファイアケープ', icon:'☀️', imgId: 57}, 
  'chainvest_sparringgloves':{id:'nightharvester', name:'nightharvester', jaName: '揺るがぬ心', icon:'❤️', imgId: 59},
  'negatroncloak_negatroncloak':{id:'dragonclaw', name:"Dragon's Claw", jaName: 'ドラゴン クロウ', icon:'🐉', imgId: 66}, 
  'negatroncloak_giantsbelt':{id:'spectralgauntlet', name:'spectralgauntlet', jaName: 'イーブンシュラウド', icon:'🦇', imgId: 67},
  'negatroncloak_sparringgloves':{id:'quicksilver', name:'Quicksilver', jaName: 'クイックシルバー', icon:'🧣', imgId: 69}, 
  'giantsbelt_giantsbelt':{id:'warmogarmor', name:"Warmog's Armor", jaName: 'ワーモグ アーマー', icon:'🌿', imgId: 77}, 
  'giantsbelt_sparringgloves':{id:'powergauntlet', name:'powergauntlet', jaName: 'ストライカー フレイル', icon:'🔨', imgId: 79}, 
  'sparringgloves_sparringgloves':{id:'thiefssparringglovess', name:"Thief's sparringglovess", jaName: '盗賊のグローブ', icon:'🧤', imgId: 99},
   
   // --- ヘラ（Spatula）合成 ---
  'spatula_bfsword': { id: 'emblem_fae', name: 'Fae Emblem', jaName: 'フェイの紋章', icon: '🧚', imgId: 81, grantedTrait: 'Fae' },
  'spatula_recurvebow': { id: 'emblem_inferno', name: 'Inferno Emblem', jaName: 'インフェルノの紋章', icon: '🔥', imgId: 82, grantedTrait: 'Inferno' },
  'spatula_needlesslylargerod': { id: 'emblem_blossom', name: 'Blossom Emblem', jaName: 'ブロッサムの紋章', icon: '🌸', imgId: 83, grantedTrait: 'Blossom' },
  'spatula_tearofthegoddess': { id: 'emblem_lunar', name: 'Lunar Emblem', jaName: 'ルナーの紋章', icon: '🌙', imgId: 84, grantedTrait: 'Lunar' },
  'spatula_chainvest': { id: 'emblem_elderwood', name: 'Elderwood Emblem', jaName: 'エルダーウッドの紋章', icon: '🌲', imgId: 85, grantedTrait: 'Elderwood' },
  'spatula_negatroncloak': { id: 'emblem_sprykin', name: 'Sprykin Emblem', jaName: 'スプライキンの紋章', icon: '🦌', imgId: 86, grantedTrait: 'Sprykin' },
  'spatula_giantsbelt': { id: 'emblem_blackthorn', name: 'Blackthorn Emblem', jaName: 'ブラックソーンの紋章', icon: '🥀', imgId: 87, grantedTrait: 'Blackthorn' },
  'spatula_sparringgloves': { id: 'emblem_primal', name: 'Primal Emblem', jaName: 'プライマルの紋章', icon: '🐾', imgId: 88, grantedTrait: 'Primal' },
  'spatula_spatula':{id:'tacticians_crown', name:"forceofnature", jaName: 'タクティシャンの王冠', icon:'👑', imgId: 88, teamSizeBonus: 1},
  'spatula_fryingpan': { id: 'tacticians_cape', name: "Tactician's Cape", jaName: 'タクティシャン ケープ', icon: '🧥', imgId: 90,  teamSizeBonus: 1},

  // --- フライパン（Frying Pan）合成 ---
  'fryingpan_bfsword': { id: 'emblem_hunter', name: 'Hunter Emblem', jaName: 'ハンターの紋章', icon: '🎯', imgId: 91, grantedTrait: 'Hunter' },
  'fryingpan_recurvebow': { id: 'emblem_rapidfire', name: 'Rapidfire Emblem', jaName: 'ラピッドファイアの紋章', icon: '🏹', imgId: 92, grantedTrait: 'Rapidfire' },
  'fryingpan_needlesslylargerod': { id: 'emblem_spellweaver', name: 'Spellweaver Emblem', jaName: 'スペルウィーバーの紋章', icon: '✨', imgId: 93, grantedTrait: 'Spellweaver' },
  'fryingpan_tearofthegoddess': { id: 'emblem_invoker', name: 'Invoker Emblem', jaName: 'インヴォーカーの紋章', icon: '📜', imgId: 94, grantedTrait: 'Invoker' },
  'fryingpan_chainvest': { id: 'emblem_vanguard', name: 'Vanguard Emblem', jaName: 'ヴァンガードの紋章', icon: '🛡️', imgId: 95, grantedTrait: 'Vanguard' },
  'fryingpan_negatroncloak': { id: 'emblem_slayer', name: 'Slayer Emblem', jaName: 'ラヴィジャーの紋章', icon: '💀', imgId: 96, grantedTrait: 'slayer' },
  'fryingpan_giantsbelt': { id: 'emblem_brawler', name: 'Brawler Emblem', jaName: 'ブローラーの紋章', icon: '🥊', imgId: 97, grantedTrait: 'Brawler' },
  'fryingpan_sparringgloves': { id: 'emblem_executioner', name: 'Executioner Emblem', jaName: 'エクセキューショナーの紋章', icon: '🪓', imgId: 98, grantedTrait: 'Executioner' },
  'fryingpan_fryingpan': { id: 'tacticians_shield', name: "Tactician's Shield", jaName: 'タクティシャン シールド', icon: '🛡️', imgId: 99,  teamSizeBonus: 1 },

  // --- 作成不能（Unbuildable）紋章例 ---
  'unbuildable_coven': { id: 'emblem_coven', name: 'Coven Emblem', jaName: '盟約の魔女の紋章', icon: '🔮', imgId: 101, grantedTrait: 'Coven' },
  'unbuildable_solar': { id: 'emblem_solar', name: 'Solar Emblem', jaName: 'ソーラーの紋章', icon: '☀️', imgId: 102, grantedTrait: 'Solar' },
  'unbuildable_defender': { id: 'emblem_defender', name: 'Defender Emblem', jaName: 'ディフェンダーの紋章', icon: '🛡️', imgId: 103, grantedTrait: 'Defender' },
  'unbuildable_juggernaut': { id: 'emblem_juggernaut', name: 'Juggernaut Emblem', jaName: 'ジャガーノートの紋章', icon: '🦏', imgId: 104, grantedTrait: 'Juggernaut' },
  'unbuildable_summoner': { id: 'emblem_summoner', name: 'Summoner Emblem', jaName: 'サモナーの紋章', icon: '📖', imgId: 105, grantedTrait: 'Summoner' },
  'unbuildable_eclipse': { id: 'emblem_eclipse', name: 'Eclipse Emblem', jaName: 'エクリプスの紋章', icon: '🌘', imgId: 106, grantedTrait: 'Eclipse' },


   /*SET17
  'spatula_bf':{id:'emblem_darkstar', name:'Dark Star Emblem', jaName: 'ダークスターの紋章', icon:'🛡️', imgId: 81, grantedTrait: 'Dark Star'}, 
  'spatula_recurvebow':{id:'emblem_timebreaker', name:'pulsefire Emblem', jaName: 'タイムブレイカーの紋章', icon:'🏹', imgId: 82, grantedTrait: 'Timebreaker'},
  'spatula_needlesslylargerod':{id:'emblem_stargazer', name:'Stargazer Emblem', jaName: '星の観測者の紋章', icon:'🔮', imgId: 83, grantedTrait: 'Stargazer'}, 
  'spatula_tearofthegoddess':{id:'emblem_spacegroove', name:'SpaceGroove Emblem', jaName: 'スペースグルーヴの紋章', icon:'💧', imgId: 84, grantedTrait: 'Space Groove'},
  'spatula_chainvest':{id:'emblem_meeple', name:'astronaut Emblem', jaName: 'ミィプルの紋章', icon:'🛡️', imgId: 85, grantedTrait: 'Meeple'}, 
  'spatula_negatroncloak':{id:'emblem_arbiter', name:'favored Emblem', jaName: 'アービターの紋章', icon:'🧥', imgId: 86, grantedTrait: 'Arbiter'},
  'spatula_giantsbelt':{id:'emblem_primordian', name:'Primordian Emblem', jaName: 'プリモーディアンの紋章', icon:'💖', imgId: 87, grantedTrait: 'Primordian'}, 
  'spatula_sparringgloves':{id:'emblem_nova', name:'drx Emblem', jaName: 'N.O.V.A.の紋章', icon:'🥊', imgId: 89, grantedTrait: 'N.O.V.A.'},
  'spatula_spatula':{id:'tacticians_crown', name:"forceofnature", jaName: 'タクティシャンの王冠', icon:'👑', imgId: 88, teamSizeBonus: 1},
  'fryingpan_bf':{id:'emblem_marauder', name:'meleetrait Emblem', jaName: '略奪者の紋章', icon:'🛡️', imgId: 91, grantedTrait: 'Marauder'},
  'fryingpan_recurvebow':{id:'emblem_challenger', name:'astrait Emblem', jaName: 'チャレンジャーの紋章', icon:'🏹', imgId: 92, grantedTrait: 'Challenger'},
  'fryingpan_needlesslylargerod':{id:'emblem_voyager', name:'flextrait Emblem', jaName: 'ボイジャーの紋章', icon:'🔮', imgId: 93, grantedTrait: 'Voyager'},
  'fryingpan_tearofthegoddess':{id:'emblem_shepherd', name:'summontrait Emblem', jaName: '導き手の紋章', icon:'💧', imgId: 94, grantedTrait: 'Shepherd'},
  'fryingpan_chainvest':{id:'emblem_bastion', name:'resisttank Emblem', jaName: 'バスティオンの紋章', icon:'🛡️', imgId: 95, grantedTrait: 'Bastion'},
  'fryingpan_negatroncloak':{id:'emblem_vanguard', name:'shieldtank Emblem', jaName: 'ヴァンガードの紋章', icon:'🧥', imgId: 96, grantedTrait: 'Vanguard'},
  'fryingpan_giantsbelt':{id:'emblem_brawler', name:'hptank Emblem', jaName: 'ブローラーの紋章', icon:'💖', imgId: 97, grantedTrait: 'Brawler'},
  'fryingpan_sparringgloves':{id:'emblem_rogue', name:'assassintrait Emblem', jaName: 'ローグの紋章', icon:'🥊', imgId: 98, grantedTrait: 'Rogue'},
  'unbuildable_anima': {id:'emblem_anima', name:'animasquad Emblem', jaName: 'アニマの紋章', icon:'🛡️', imgId: 101, grantedTrait: 'Anima'},
  'unbuildable_psionic': {id:'emblem_psionic', name:'Psyops Emblem', jaName: 'サイオニックの紋章', icon:'🔮', imgId: 102, grantedTrait: 'Psionic'},
  'unbuildable_sniper': {id:'emblem_sniper', name:'rangedtrait Emblem', jaName: 'スナイパーの紋章', icon:'🏹', imgId: 103, grantedTrait: 'Sniper'}

  */
};


/* ── 消費アイテム ── */
const CONSUMABLES = {
  TINY_DUPE: { id: 'championduplicator_i', name: 'Tiny Champion Duplicator', jaName: '小さなチャンピオン複製機', icon: '🔹', type:'consumable', imgId: 905 },
  LESSER_DUPE: { id: 'championduplicator_iii', name: 'Lesser Champion Duplicator', jaName: '小型チャンピオン複製機', icon: '🔹', type:'consumable', imgId: 901 },
  CHAMP_DUPE: { id: 'neekoshelp', name: 'Champion Duplicator', jaName: 'チャンピオン複製機', icon: '🔸', type:'consumable', imgId: 902 },
  REFORGER: { id: 'itemreroller', name: 'Reforger', jaName: '再合成装置', icon: '🔨', type:'consumable', imgId: 903 },
  REMOVER: { id: 'itemremover', name: 'itemremover', jaName: '磁力式除去装置', icon: '🧲', type:'consumable', imgId: 904 }

};

/* ── アーティファクト ── */
const ARTIFACTS = [
  { id: 'ahris_aura', name: "Ahri's Aura", jaName: 'アーリのオーラ', type: 'artifact', imgName: 'tft17_item_artifact_ahriartifact' },
  { id: 'evelynns_intuition', name: "Evelynn's Intuition", jaName: 'イブリンの直感', type: 'artifact', imgName: 'tft17_item_artifact_evelynnartifact' },
  { id: 'trinityforce', name: 'Trinity Force', jaName: 'インフィニティ フォース', type: 'artifact', imgName: 'tft4_item_ornninfinityforce' },
  { id: 'varuss_tenacity', name: "Varus's Tenacity", jaName: 'ヴァルスの執念', type: 'artifact', imgName: 'tft17_item_artifact_varusartifact' },
  { id: 'witsend', name: "Wit's End", jaName: 'ウィッツ エンド', type: 'artifact', imgName: 'tft_item_artifact_witsend' },
  { id: 'voidgauntlet', name: 'Void Gauntlet', jaName: 'ヴォイド ガントレット', type: 'artifact', imgName: 'tft_item_artifact_voidgauntlet' },
  { id: 'ekkos_patience', name: "Ekko's Patience", jaName: 'エコーの忍耐', type: 'artifact', imgName: 'tft17_item_artifact_ekkoartifact' },
  { id: 'gamblersblade', name: "Gambler's Blade", jaName: 'ギャンブラーの剣', type: 'artifact', imgName: 'tft7_item_shimmerscalegamblersblade' },
  { id: 'goldcollector', name: 'The Collector', jaName: 'ゴールド コレクター', type: 'artifact', imgName: 'tft4_item_ornnthecollector' },
  { id: 'seekersarmguard', name: "Seeker's Armguard", jaName: 'シーカー アームガード', type: 'artifact', imgName: 'tft_item_artifact_seekersarmguard' },
  { id: 'silvermeredawn', name: 'Silvermere Dawn', jaName: 'シルバーミアの夜明け', type: 'artifact', imgName: 'tft_item_artifact_silvermeredawn' },
  { id: 'statikkshiv_artifact', name: 'Statikk Shiv Artifact', jaName: 'スタティック シヴ', type: 'artifact', imgName: 'tft_item_artifact_statikkshiv' },
  { id: 'snipersfocus', name: "Sniper's Focus", jaName: 'スナイパー フォーカス', type: 'artifact', imgName: 'tft9_item_ornnhorizonfocus' },
  { id: 'threshs_lantern', name: "Thresh's Lantern", jaName: 'スレッシュのランタン', type: 'artifact', imgName: 'tft17_item_artifact_threshlantern' },
  { id: 'zhonyasparadox', name: "Zhonya's Paradox", jaName: 'ゾーニャの砂時計', type: 'artifact', imgName: 'tft4_item_ornnzhonyasparadox' },
  { id: 'sorakas_miracle', name: "Soraka's Miracle", jaName: 'ソラカの奇跡', type: 'artifact', imgName: 'tft17_item_artifact_sorakaartifact' },
  { id: 'titanichydra', name: 'Titanic Hydra', jaName: 'タイタン ハイドラ', type: 'artifact', imgName: 'tft_item_artifact_titanichydra' },
  { id: 'deathsdefiance', name: "Death's Defiance", jaName: 'デス ディファイアンス', type: 'artifact', imgName: 'tft4_item_ornndeathsdefiance' },
  { id: 'dawncore', name: 'Dawncore', jaName: 'ドーンコア', type: 'artifact', imgName: 'tft_item_artifact_dawncore' },
  { id: 'hullcrusher', name: 'Hullcrusher', jaName: 'ハルクラッシャー', type: 'artifact', imgName: 'tft9_item_ornnhullbreaker' },
  { id: 'fishbones', name: 'Fishbones', jaName: 'フィッシュボーン', type: 'artifact', imgName: 'tft_item_artifact_fishbones' },
  { id: 'flickerblade', name: 'Flickerblade', jaName: 'フリッカーブレード', type: 'artifact', imgName: 'tft_item_artifact_navoriflickerblades' },
  { id: 'prowlersclaw', name: "Prowler's Claw", jaName: 'プローラー クロウ', type: 'artifact', imgName: 'tft_item_artifact_prowlersclaw' },
  { id: 'mittens', name: 'Mittens', jaName: 'ミトン', type: 'artifact', imgName: 'tft_item_artifact_mittens' },
  { id: 'mogulsmail', name: "Mogul's Mail", jaName: 'モーグル メイル', type: 'artifact', imgName: 'tft7_item_shimmerscalemogulsmail' },
  { id: 'yasuos_bladework', name: "Yasuo's Bladework", jaName: 'ヤスオのブレードワーク', type: 'artifact', imgName: 'tft17_item_artifact_yasuoartifact' },
  { id: 'lightshieldcrest', name: 'Lightshield Crest', jaName: 'ライトシールドのクレスト', type: 'artifact', imgName: 'tft_item_artifact_lightshieldcrest' },
  { id: 'rapidfirecannon_artifact', name: 'Rapid Firecannon Artifact', jaName: 'ラピッド ファイアキャノン', type: 'artifact', imgName: 'tft_item_artifact_rapidfirecannon' },
  { id: 'lichbane', name: 'Lich Bane', jaName: 'リッチ ベイン', type: 'artifact', imgName: 'tft_item_artifact_lichbane' },
  { id: 'ludenstempest', name: "Luden's Tempest", jaName: 'ルーデン テンペスト', type: 'artifact', imgName: 'tft_item_artifact_ludenstempest' },
  { id: 'unendingdespair', name: 'Unending Despair', jaName: '不屈', type: 'artifact', imgName: 'tft_item_artifact_unendingdespair' },
  { id: 'everlastingpact', name: 'Everlasting Pact', jaName: '不滅の協定', type: 'artifact', imgName: 'tft_item_artifact_eternalpact' },
  { id: 'dusksblessing', name: "Dusk's Blessing", jaName: '夕闇の加護', type: 'artifact', imgName: 'tft_item_artifact_aegisofdusk' },
  { id: 'dawnsblessing', name: "Dawn's Blessing", jaName: '夜明けの加護', type: 'artifact', imgName: 'tft_item_artifact_aegisofdawn' },
  { id: 'hatjuice', name: 'Hat Juice', jaName: '帽子ジュース', type: 'artifact', imgName: 'tft_item_artifact_cappajuice' },
  { id: 'blightingjewel', name: 'Blighting Jewel', jaName: '枯死の宝石', type: 'artifact', imgName: 'tft_item_artifact_blightingjewel' },
  { id: 'hellfirehatchet', name: 'Hellfire Hatchet', jaName: '獄炎のハチェット', type: 'artifact', imgName: 'tft_item_artifact_hellfirehatchet' },
  { id: 'talismanofascension', name: 'Talisman of Ascension', jaName: '超越のタリスマン', type: 'artifact', imgName: 'tft_item_artifact_talismanofascension' },
  { id: 'crown_of_demacia', name: 'Crown of Demacia', jaName: 'デマーシアの王冠', type: 'artifact', imgName: 'tft9_item_crownofdemacia' }
];

/* ── レディアントアイテム ── */
const RADIANT_ITEMS = [
  { id: 'r_deathblade', name: 'Luminous Deathblade', jaName: 'レディアント デスブレード', type: 'radiant', imgName: 'tft5_item_deathbladeradiant' },
  { id: 'r_giantslayer', name: 'Demonslayer', jaName: 'レディアント ジャイアントスレイヤー', type: 'radiant', imgName: 'tft5_item_giantslayerradiant' },
  { id: 'r_hextechgunblade', name: 'Hextech Lifeblade', jaName: 'レディアント ヘクステックガンブレード', type: 'radiant', imgName: 'tft5_item_hextechgunbladeradiant' },
  { id: 'r_spearofshojin', name: 'Spear of Hirana', jaName: 'レディアント ショウジンの矛', type: 'radiant', imgName: 'tft5_item_spearofshojinradiant' },
  { id: 'r_guardianangel', name: 'Brink of Dawn', jaName: 'レディアント ナイトエッジ', type: 'radiant', imgName: 'tft5_item_guardianangelradiant' },
  { id: 'r_bloodthirster', name: 'Blessed Bloodthirster', jaName: 'レディアント ブラッドサースター', type: 'radiant', imgName: 'tft5_item_bloodthirsterradiant' },
  { id: 'r_steraksgage', name: "Sterak's Megashield", jaName: 'レディアント ステラックの篭手', type: 'radiant', imgName: 'tft5_item_steraksgageradiant' },
  { id: 'r_infinityedge', name: 'Zenith Edge', jaName: 'レディアント インフィニティエッジ', type: 'radiant', imgName: 'tft5_item_infinityedgeradiant' },
  { id: 'r_rapidfirecannon', name: 'Crest of Cinders', jaName: 'レディアント レッドバフ', type: 'radiant', imgName: 'tft5_item_rapidfirecannonradiant' }, 
  { id: 'r_guinsoosrageblade', name: "Guinsoo's Reckoning", jaName: 'レディアント グインソー レイジブレード', type: 'radiant', imgName: 'tft5_item_guinsoosragebladeradiant' },
  { id: 'r_statikkshiv', name: "Statikk's Favor", jaName: 'レディアント ヴォイドスタッフ', type: 'radiant', imgName: 'tft5_item_statikkshivradiant' },
  { id: 'r_titansresolve', name: "Titan's Vow", jaName: 'レディアント 巨人の誓い', type: 'radiant', imgName: 'tft5_item_titansresolveradiant' },
  { id: 'r_runaanshurricane', name: "Runaan's Tempest", jaName: 'レディアント クラーケンの怒り', type: 'radiant', imgName: 'tft5_item_runaanshurricaneradiant' },
  { id: 'r_leviathan', name: "Baron's Gift", jaName: 'レディアント ナッシャー トゥース', type: 'radiant', imgName: 'tft5_item_leviathanradiant' },
  { id: 'r_lastwhisper', name: 'Eternal Whisper', jaName: 'レディアント ラストウィスパー', type: 'radiant', imgName: 'tft5_item_lastwhisperradiant' },
  { id: 'r_rabadonsdeathcap', name: "Rabadon's Ascended Deathcap", jaName: 'レディアント ラバドンデスキャップ', type: 'radiant', imgName: 'tft5_item_rabadonsdeathcapradiant' },
  { id: 'r_archangel', name: "Urf-Angel's Staff", jaName: 'レディアント アークエンジェルスタッフ', type: 'radiant', imgName: 'tft5_item_archangelsstaffradiant' },
  { id: 'r_crownguard', name: 'Royal Crownshield', jaName: 'レディアント クラウンガード', type: 'radiant', imgName: 'tft5_item_crownguardradiant' },
  { id: 'r_ionicspark', name: 'Covalent Spark', jaName: 'レディアント アイオニックスパーク', type: 'radiant', imgName: 'tft5_item_ionicsparkradiant' },
  { id: 'r_morellonomicon', name: 'More More-ellonomicon', jaName: 'レディアント モレロノミコン', type: 'radiant', imgName: 'tft5_item_morellonomiconradiant' },
  { id: 'r_jeweledgauntlet', name: 'Glamorous Gauntlet', jaName: 'レディアント ジュエル ガントレット', type: 'radiant', imgName: 'tft5_item_jeweledgauntletradiant' },
  { id: 'r_bluebuff', name: 'Blue Blessing', jaName: 'レディアント ブルーバフ', type: 'radiant', imgName: 'tft5_item_bluebuffradiant' },
  { id: 'r_frozenheart', name: "Bulwark's Oath", jaName: 'レディアント プロテクターの誓い', type: 'radiant', imgName: 'tft5_item_frozenheartradiant' },
  { id: 'r_adaptivehelm', name: 'Jaksho the Protean', jaName: 'レディアント アダプティブヘルム', type: 'radiant', imgName: 'tft5_item_adaptivehelmradiant' },
  { id: 'r_redemption', name: 'Absolution', jaName: 'レディアント スピリット ビサージュ', type: 'radiant', imgName: 'tft5_item_redemptionradiant' },
  { id: 'r_unstableconcoction', name: 'Fist of Fairness', jaName: 'レディアント ハンド オブ ジャスティス', type: 'radiant', imgName: 'tft5_item_handofjusticeradiant' },
  { id: 'r_bramblevest', name: 'Rosethorn Vest', jaName: 'レディアント ブランブルベスト', type: 'radiant', imgName: 'tft5_item_bramblevestradiant' },
  { id: 'r_gargoylestoneplate', name: 'Dvarapala Stoneplate', jaName: 'レディアント ガーゴイルストーンプレート', type: 'radiant', imgName: 'tft5_item_gargoylestoneplateradiant' },
  { id: 'r_redbuff', name: 'Sunlight Cape', jaName: 'レディアント サンファイアケープ', type: 'radiant', imgName: 'tft5_item_sunfirecaperadiant' },
  { id: 'r_nightharvester', name: 'Legacy of the Colossus', jaName: 'レディアント 揺るがぬ心', type: 'radiant', imgName: 'tft5_item_nightharvesterradiant' },
  { id: 'r_dragonsclaw', name: "Dragon's Will", jaName: 'レディアント ドラゴン クロウ', type: 'radiant', imgName: 'tft5_item_dragonsclawradiant' },
  { id: 'r_spectralgauntlet', name: 'Equinox', jaName: 'レディアント イーブンシュラウド', type: 'radiant', imgName: 'tft5_item_spectralgauntletradiant' },
  { id: 'r_quicksilver', name: 'Quickestsilver', jaName: 'レディアント クイックシルバー', type: 'radiant', imgName: 'tft5_item_quicksilverradiant' },
  { id: 'r_warmogsarmor', name: "Warmog's Pride", jaName: 'レディアント ワーモグ アーマー', type: 'radiant', imgName: 'tft5_item_warmogsarmorradiant' },
  { id: 'r_powergauntlet', name: 'Willbreaker', jaName: 'レディアント ストライカー フレイル', type: 'radiant', imgName: 'tft5_item_trapclawradiant' },
  { id: 'r_thiefsgloves', name: "Rascal's sparringglovess", jaName: 'レディアント 盗賊のグローブ', type: 'radiant', imgName: 'tft5_item_thiefssparringglovessradiant' }
];


/* ═══ SIM-EDITOR MANAGED BLOCK START（自動生成・手動で編集しない） ═══ */
(function(){
  const HIDDEN = ["emblem_timebreaker","emblem_stargazer","emblem_spacegroove","emblem_meeple","emblem_arbiter","emblem_primordian","emblem_nova","emblem_marauder","emblem_challenger","emblem_voyager","emblem_bastion","emblem_shepherd","emblem_rogue","emblem_anima","emblem_psionic","emblem_sniper","ahris_aura","evelynns_intuition","varuss_tenacity","sorakas_miracle","threshs_lantern","emblem_solar","emblem_eclipse"];
  const TAGS = {"emblem_timebreaker":"set17","emblem_stargazer":"set17","emblem_spacegroove":"set17","emblem_meeple":"set17","emblem_arbiter":"set17","emblem_primordian":"set17","emblem_nova":"set17","emblem_marauder":"set17","emblem_voyager":"set17","emblem_challenger":"set17","emblem_shepherd":"set17","emblem_bastion":"set17","emblem_rogue":"set17","emblem_anima":"set17","emblem_psionic":"set17","emblem_sniper":"set17","ahris_aura":"set17","evelynns_intuition":"set17","varuss_tenacity":"set17","threshs_lantern":"set17","sorakas_miracle":"set17","yasuos_bladework":"set17"};
  const ADDED = [];
  const ADDED_JA = {};
  const EDITS = {"archangelstaff":{"id":"archangelsstaff"},"dragonclaw":{"id":"dragonsclaw"},"warmogarmor":{"id":"warmogsarmor"},"thiefssparringglovess":{"id":"thiefsgloves"},"r_archangel":{"id":"r_archangelsstaff"},"trinityforce":{"imgUrl":"https://tftips.b-cdn.net/item/4_ornninfinityforce.avif?v=1"},"statikkshiv_artifact":{"id":"statikkshiv"},"snipersfocus":{"imgUrl":"https://tftips.b-cdn.net/item/9_ornnhorizonfocus.avif?v=1"},"flickerblade":{"id":"navoriflickerblade"},"rapidfirecannon_artifact":{"id":"rapidfirecannon"},"unendingdespair":{"id":"theindomitable"},"everlastingpact":{"id":"eternalpact"},"dusksblessing":{"id":"aegisofdusk"},"dawnsblessing":{"id":"aegisofdawn"},"hatjuice":{"id":"cappajuice"},"crown_of_demacia":{"imgUrl":"https://tftips.b-cdn.net/item/9_crownofdemacia.avif?v=1","type":"completed"},"tacticians_crown":{"id":"forceofnature"},"emblem_darkstar":{"id":"emblem_fae","imgUrl":"https://tftips.b-cdn.net/item/18_emblemfae.avif?v=1","jaName":"フェイの紋章"},"tacticians_cape":{"id":"tacticianscape","jaName":"タクティシャンのケープ"},"tacticians_shield":{"id":"tacticiansshield","jaName":"タクティシャンの盾"},"emblem_summoner":{"id":"emblem?florafatalis"}};
  const mark = (it) => { if (!it || !it.id) return;
    if (HIDDEN.includes(it.id)) it.hidden = true;
    if (TAGS[it.id]) it.setTag = TAGS[it.id]; };
  (typeof ITEMS !== 'undefined' ? ITEMS : []).forEach(mark);
  Object.values(typeof ITEM_RECIPES !== 'undefined' ? ITEM_RECIPES : {}).forEach(mark);
  (typeof ARTIFACTS !== 'undefined' ? ARTIFACTS : []).forEach(mark);
  // 日本語名は各アイテムの jaName に直接反映する（ITEM_JA は旧形式のデータ用）
  const setJa = (it) => { if (it && it.name && ADDED_JA[it.name]) it.jaName = ADDED_JA[it.name]; };
  (typeof ITEMS !== 'undefined' ? ITEMS : []).forEach(setJa);
  Object.values(typeof ITEM_RECIPES !== 'undefined' ? ITEM_RECIPES : {}).forEach(setJa);
  Object.values(typeof CONSUMABLES !== 'undefined' ? CONSUMABLES : {}).forEach(setJa);
  (typeof ARTIFACTS !== 'undefined' ? ARTIFACTS : []).forEach(setJa);
  (typeof RADIANT_ITEMS !== 'undefined' ? RADIANT_ITEMS : []).forEach(setJa);
  if (typeof ITEM_JA !== 'undefined') Object.assign(ITEM_JA, ADDED_JA);
  // エディタで変更した id / 日本語名 / 種類を元データへ反映する（画像URLは id と種類から作られる）
  const applyEdit = (it) => { if (!it || !it.id) return; const e = EDITS[it.id]; if (!e) return;
    if (e.jaName) it.jaName = e.jaName;
    if (e.type) it.type = e.type;
    if (e.imgUrl) it.imgUrl = e.imgUrl;   // 画像URLの例外指定（規則から外れるものはこれで上書き）
    if (e.id && e.id !== it.id) it.id = e.id; };
  (typeof ITEMS !== 'undefined' ? ITEMS : []).forEach(applyEdit);
  Object.values(typeof ITEM_RECIPES !== 'undefined' ? ITEM_RECIPES : {}).forEach(applyEdit);
  Object.values(typeof CONSUMABLES !== 'undefined' ? CONSUMABLES : {}).forEach(applyEdit);
  (typeof ARTIFACTS !== 'undefined' ? ARTIFACTS : []).forEach(applyEdit);
  (typeof RADIANT_ITEMS !== 'undefined' ? RADIANT_ITEMS : []).forEach(applyEdit);
  ADDED.forEach(it => { if (it.type === 'comp' && typeof ITEMS !== 'undefined') ITEMS.push(it);
    else if (it.type === 'artifact' && typeof ARTIFACTS !== 'undefined') ARTIFACTS.push(it);
    else if (it.type === 'radiant' && typeof RADIANT_ITEMS !== 'undefined') RADIANT_ITEMS.push(it); });
})();
/* ═══ SIM-EDITOR MANAGED BLOCK END ═══ */
