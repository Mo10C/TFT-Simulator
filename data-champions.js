

/* ============================================================
   データ: チャンピオン / 特性 (トレイト) / 遭遇ギミック
   ============================================================ */

/* ── チャンピオン一覧 ── */
const CHAMPS=[
  {id:'aatrox', name:'Aatrox', jaName:'エイトロックス', cost:1, traits:['N.O.V.A.', 'Bastion'], img:'Aatrox'},
  {id:'briar', name:'Briar', jaName:'ブライアー', cost:1, traits:['Anima', 'Primordian', 'Rogue'], img:'Briar'},
  {id:'caitlyn', name:'Caitlyn', jaName:'ケイトリン', cost:1, traits:['N.O.V.A.', 'Fateweaver'], img:'Caitlyn'},
  {id:'chogath', name:"Cho'Gath", jaName:'チョ=ガス', cost:1, traits:['Dark Star', 'Brawler'], img:'Chogath'},
  {id:'ezreal', name:'Ezreal', jaName:'エズリアル', cost:1, traits:['Timebreaker', 'Sniper'], img:'Ezreal'},
  {id:'leona', name:'Leona', jaName:'レオナ', cost:1, traits:['Arbiter', 'Vanguard'], img:'Leona'},
  {id:'lissandra', name:'Lissandra', jaName:'リサンドラ', cost:1, traits:['Dark Star', 'Shepherd', 'Replicator'], img:'Lissandra'},
  {id:'nasus', name:'Nasus', jaName:'ナサス', cost:1, traits:['Space Groove', 'Vanguard'], img:'Nasus'},
  {id:'poppy', name:'Poppy', jaName:'ポッピー', cost:1, traits:['Meeple', 'Bastion'], img:'Poppy'},
  {id:'reksai', name:"Rek'Sai", jaName:'レク=サイ', cost:1, traits:['Primordian', 'Brawler'], img:'RekSai'},
  {id:'talon', name:'Talon', jaName:'タロン', cost:1, traits:['Stargazer', 'Rogue'], img:'Talon'},
  {id:'teemo', name:'Teemo', jaName:'ティーモ', cost:1, traits:['Space Groove', 'Shepherd'], img:'Teemo'},
  {id:'twistedfate', name:'Twisted Fate', jaName:'ツイステッド・フェイト', cost:1, traits:['Stargazer', 'Fateweaver'], img:'TwistedFate'},
  {id:'veigar', name:'Veigar', jaName:'ベイガー', cost:1, traits:['Meeple', 'Replicator'], img:'Veigar'},
  {id:'akali', name:'Akali', jaName:'アカリ', cost:2, traits:['N.O.V.A.', 'Marauder'], img:'Akali'},
  {id:'belveth', name:"Bel'Veth", jaName:'ベル=ヴェス', cost:2, traits:['Primordian', 'Challenger', 'Marauder'], img:'Belveth'},
  {id:'gnar', name:'Gnar', jaName:'ナー', cost:2, traits:['Meeple', 'Sniper'], img:'Gnar'},
  {id:'gragas', name:'Gragas', jaName:'グラガス', cost:2, traits:['Psionic', 'Brawler'], img:'Gragas'},
  {id:'gwen', name:'Gwen', jaName:'グウェン', cost:2, traits:['Space Groove', 'Rogue'], img:'Gwen'},
  {id:'jax', name:'Jax', jaName:'ジャックス', cost:2, traits:['Stargazer', 'Bastion'], img:'Jax'},
  {id:'jinx', name:'Jinx', jaName:'ジンクス', cost:2, traits:['Anima', 'Challenger'], img:'Jinx'},
  {id:'meepsie', name:'Meepsie', jaName:'ミープシー', cost:2, traits:['Meeple', 'Shepherd', 'Voyager'], img:'IvernMinion'},
  {id:'milio', name:'Milio', jaName:'ミリオ', cost:2, traits:['Timebreaker', 'Fateweaver'], img:'Milio'},
  {id:'mordekaiser', name:'Mordekaiser', jaName:'モルデカイザー', cost:2, traits:['Dark Star', 'Channeler', 'Vanguard'], img:'Mordekaiser'},
  {id:'pantheon', name:'Pantheon', jaName:'パンテオン', cost:2, traits:['Timebreaker', 'Brawler', 'Replicator'], img:'Pantheon'},
  {id:'pyke', name:'Pyke', jaName:'パイク', cost:2, traits:['Psionic', 'Voyager'], img:'Pyke'},
  {id:'zoe', name:'Zoe', jaName:'ゾーイ', cost:2, traits:['Arbiter', 'Channeler'], img:'Zoe'},
  {id:'aurora', name:'Aurora', jaName:'オーロラ', cost:3, traits:['Anima', 'Voyager'], img:'Aurora'},
  {id:'diana', name:'Diana', jaName:'ダイアナ', cost:3, traits:['Arbiter', 'Challenger'], img:'Diana'},
  {id:'fizz', name:'Fizz', jaName:'フィズ', cost:3, traits:['Meeple', 'Rogue'], img:'Fizz'},
  {id:'illaoi', name:'Illaoi', jaName:'イラオイ', cost:3, traits:['Anima', 'Vanguard', 'Shepherd'], img:'Illaoi'},
  {id:'kaisa', name:"Kai'Sa", jaName:'カイ=サ', cost:3, traits:['Dark Star', 'Rogue'], img:'Kaisa'},
  {id:'lulu', name:'Lulu', jaName:'ルル', cost:3, traits:['Stargazer', 'Replicator'], img:'Lulu'},
  {id:'maokai', name:'Maokai', jaName:'マオカイ', cost:3, traits:['N.O.V.A.', 'Brawler'], img:'Maokai'},
  {id:'missfortune', name:'Miss Fortune', jaName:'ミス・フォーチュン', cost:3, traits:['missfortuneuniquetrait'], img:'MissFortune'},
  {id:'ornn', name:'Ornn', jaName:'オーン', cost:3, traits:['Space Groove', 'Bastion'], img:'Ornn'},
  {id:'rhaast', name:'Rhaast', jaName:'ラスート', cost:3, traits:['Redeemer'], img:'Rhaast'},
  {id:'samira', name:'Samira', jaName:'サミーラ', cost:3, traits:['Space Groove', 'Sniper'], img:'Samira'},
  {id:'urgot', name:'Urgot', jaName:'アーゴット', cost:3, traits:['Mecha', 'Brawler', 'Marauder'], img:'Urgot'},
  {id:'viktor', name:'Viktor', jaName:'ビクター', cost:3, traits:['Psionic', 'Channeler'], img:'Viktor'},
  {id:'aurelionsol', name:'Aurelion Sol', jaName:'オレリオン・ソル', cost:4, traits:['Mecha', 'Channeler'], img:'AurelionSol'},
  {id:'karma', name:'Karma', jaName:'カルマ', cost:4, traits:['Dark Star', 'Voyager'], img:'Karma'},
  {id:'kindred', name:'Kindred', jaName:'キンドレッド', cost:4, traits:['N.O.V.A.', 'Challenger'], img:'Kindred'},
  {id:'corki', name:'Corki', jaName:'コーキ', cost:4, traits:['Meeple', 'Fateweaver'], img:'Corki'},
  {id:'xayah', name:'Xayah', jaName:'ザヤ', cost:4, traits:['Stargazer', 'Sniper'], img:'Xayah'},
  {id:'tahmkench', name:'Tahm Kench', jaName:'タム・ケンチ', cost:4, traits:['Oracle', 'Brawler'], img:'TahmKench'},
  {id:'nami', name:'Nami', jaName:'ナミ', cost:4, traits:['Space Groove', 'Replicator'], img:'Nami'},
  {id:'nunu', name:'Nunu', jaName:'ヌヌ＆ウィルンプ', cost:4, traits:['Stargazer', 'Vanguard'], img:'Nunu'},
  {id:'mightyrobo', name:'Mighty Robo', jaName:'マイティーロボ', cost:4, traits:['Mecha', 'Voyager'], img:'galio'},
  {id:'masteryi', name:'Master Yi', jaName:'マスター・イー', cost:4, traits:['Psionic', 'Marauder'], img:'MasterYi'},
  {id:'morgana', name:'Morgana', jaName:'モルガナ', cost:4, traits:['DarkEmpress'], img:'Morgana'},
  {id:'rammus', name:'Rammus', jaName:'ラムス', cost:4, traits:['Meeple', 'Bastion'], img:'Rammus'},
  {id:'riven', name:'Riven', jaName:'リヴェン', cost:4, traits:['Timebreaker', 'Rogue'], img:'Riven'},
  {id:'leblanc', name:'LeBlanc', jaName:'ルブラン', cost:4, traits:['Arbiter', 'Shepherd'], img:'Leblanc'},
  {id:'vex', name:'Vex', jaName:'ヴェックス', cost:5, traits:['Doomer'], img:'Vex'},
  {id:'graves', name:'Graves', jaName:'グレイブス', cost:5, traits:['Factory'], img:'Graves'},
  {id:'shen', name:'Shen', jaName:'シェン', cost:5, traits:['Bulwark', 'Bastion'], img:'Shen'},
  {id:'jhin', name:'Jhin', jaName:'ジン', cost:5, traits:['Dark Star', 'Eradicator', 'Sniper'], img:'Jhin'},
  {id:'zed', name:'Zed', jaName:'ゼド', cost:5, traits:['Galaxy'], img:'Zed'},
  {id:'sona', name:'Sona', jaName:'ソナ', cost:5, traits:['Commander', 'Psionic', 'Shepherd'], img:'Sona'},
  {id:'bard', name:'Bard', jaName:'バード', cost:5, traits:['Meeple', 'Channeler'], img:'Bard'},
  {id:'fiora', name:'Fiora', jaName:'フィオラ', cost:5, traits:['SacredDuelist', 'Anima', 'Marauder'], img:'Fiora'},
  {id:'blitzcrank', name:'Blitzcrank', jaName:'ブリッツクランク', cost:5, traits:['PartyTime', 'Space Groove', 'Vanguard'], img:'Blitzcrank'}
];

/* ── 特性（トレイト）日本語名 ── */
const TRAIT_JA = {
  'unselected': '未選択',
  'missfortuneuniquetrait':'銃装機神', 'N.O.V.A.': 'N.O.V.A.', 'Bastion': 'バスティオン',
  'Anima': 'アニマ', 'Primordian': 'プライモーディアン', 'Rogue': 'ローグ',
  'Fateweaver': 'フェイトウィーバー', 'Dark Star': 'ダークスター', 'Brawler': 'ブローラー',
  'Timebreaker': 'タイムブレーカー', 'Sniper': 'スナイパー', 'Arbiter': 'アービター',
  'Vanguard': 'ヴァンガード', 'Shepherd': '導き手', 'Replicator': 'レプリケーター',
  'Space Groove': 'スペースグルーヴ', 'Meeple': 'ミィプル', 'Stargazer': '星の観測者',
  'Marauder': '略奪者', 'Challenger': 'チャレンジャー', 'Psionic': 'サイオニック',
  'Channeler': 'コンジット', 'Voyager': 'ヴォイジャー', 'Mecha': 'メカ', 'Redeemer': '救済者',
  'Oracle': '神託', 'DarkEmpress': '闇の女帝', 'Doomer': 'ドゥーマー', 'Factory': 'ファクトリー',
  'Bulwark': 'ブルワーク', 'Eradicator': '根絶者', 'Galaxy': 'ギャラクシー', 'Commander': 'コマンダー',
  'SacredDuelist': '聖なる決闘者', 'PartyTime': 'パーティータイム'
};

/* ── 特性（トレイト）説明文 ── */
const TRAIT_DESCS = {
  'Anima': '対人戦に敗北すると15「テック」を獲得し、さらに連敗数x5の「テック」を追加で獲得する。さらに、「アニマ」がキルまたはアシストを獲得するたびに、「テック」を2獲得する。\n\n「アニマ」が「テック」を100獲得するたびに、新たな「アニマ武器」が試作される。その武器を獲得するか、「テック」を温存して次回により強力な武器を得ることも可能。\n\n(3) 研究開始！\n(6) 対人戦に勝利後、戦利品を獲得！',
  'Arbiter': '【独自の聖なる掟を定め、所定の原因が発生した際に「アービター」に適用される効果を選択できるようにする。\n(2) 自分の掟の原因と結果を選択する。\n(3) 効果が強化される。',
  'N.O.V.A.': '(2) 戦闘開始から6秒後に、「N.O.V.A.」がチャンピオンに応じて味方にパワーサージを付与する。\n(5) 「ストライクセレクター」を1個獲得する。選ばれし「N.O.V.A.」は、パワーサージ中にストライク効果を発動する。\n\nエイトロックス: 味方のダメージが、敵に30%の細断と分解を付与する\nケイトリン: 味方の攻撃速度を20%増加させる\nアカリ: 味方が正確無比を獲得する\nマオカイ: 味方が最大体力の12%を回復する\nキンドレッド: 最も強いタンクに耐久値800のシールドを付与する\n紋章: 味方が10%の追加確定ダメージを与えるスタックを獲得する',
  'Space Groove': '(1) 「グルーヴィアン」は「ザ・グルーヴ」に入れる。その効果中、「グルーヴィアン」の攻撃力と最大体力自動回復が増加する。この効果量は、味方チームの「グルーヴィアン」1体ごとにさらに増加する。\n(3) 戦闘開始時、すべての「グルーヴィアン」は3秒間、「ザ・グルーヴ」に入る。\n(5) 「ザ・グルーヴ」の発動時間1秒ごとに、攻撃力と魔力が5%増加する(スタック可能)。\n(7) これらの効果が 10%増加する！\n(10) さあグルーヴを楽しもう！',
  'Vanguard': '「ヴァンガード」はシールドを獲得している間、耐久力が5%増加する。\n\n戦闘開始時、および体力が50%に低下したとき: 自身の最大体力の一定割合にあたるシールドを10秒間獲得する。\n\n(2) 最大体力の16%\n(4) 最大体力の30%\n(6) 最大体力の40% 8% (シールド展開中)',
  'Psionic': '任意の味方に装備できる「サイオニック」アイテムを獲得する。',
  'Sniper': '「スナイパー」はダメージ増加効果を獲得する。対象が遠いほど効果が増加する。\n\n(2) 18% 、マスごとに+2% \n(3) 24% 、マスごとに+3% \n(4) 28% 、マスごとに+4%',
  'Dark Star': '(2) 「ダークスター」が最大体力8%以下の敵を飲み込むブラックホールを生成する。\n(4) さらに、40% を獲得する。\n(6) さらに、最も強い「ダークスター」ユニットがスーパーマッシブ状態になり、受ける「ダークスター」の効果が85%増加し、2つのミニブラックホールを生成する。\n(9) すべての「ダークスター」がスーパーマッシブ状態になる。レベル10で全員を飲み込む。',
  'Timebreaker': '(2) 味方の攻撃速度が15%増加する。\n(3) さらに、敗北時に無料のリロールを獲得する。勝利時には「時空の核」にXPを蓄積する(ステージに応じて増加)。\n(4) さらに、「タイムブレーカー」の攻撃速度が追加で50%増加する\n\n敗北時のリロール: 1\n勝利時のXP: 2',
  'Channeler': 'インネイト: 「コンジット」は、あらゆるソースから獲得するマナが20%増加する。\n\n味方チームがマナ自動回復を獲得する。「コンジット」は回復量が増加する。\n\n(2) 1  | 3 \n(3) 1  | 5 \n(4) 2  | 7 \n(5) 3  | 9',
  'Challenger': '味方チームの攻撃速度が10%増加する。「チャレンジャー」の攻撃速度はさらに増加する。対象が倒された際、新たな対象までダッシュして、攻撃速度が2.5秒間50%増加する。\n\n(2) 15% \n(3) 22% \n(4) 36% \n(5) 48%',
  'Bastion': '味方チームの物理防御と魔法防御が15増加する。\n\n「バスティオン」はさらに増加し、戦闘開始後10秒間は値が2倍になる。\n\n(2) 16 \n(4) 40 \n(6) 60 、「バスティオン」以外は追加で20 を獲得する。',
  'Fateweaver': 'インネイト: 「フェイトウィーバー」は正確無比を持つ。\n\n(2) スキルの確率発動効果がラッキーになる。\n(4) クリティカル率が20%、クリティカルダメージが20%増加する。クリティカルヒットもラッキーになる。\n\n\n正確無比: スキルはクリティカル判定を持つ。「正確無比」を追加で獲得すると、クリティカルダメージが10%増加する。\nラッキー: 2回判定を行い、良い方の結果を適用する。',
  'Brawler': '味方チームの体力が5%増加する。「ブローラー」はより多く増加する。\n\n(2) +最大体力の20%\n(4) +最大体力の40%\n(6) +最大体力の60%',
  'Voyager': '戦闘開始: 味方のタンクが15秒間持続するシールドを獲得する。その他の味方はダメージ増加効果を獲得する。\n\n「ボイジャー」は効果が2倍になる。\n\n(2) 175シールド、9% \n(3) 250シールド、15% \n(4) 350シールド、18% \n(5) 500シールド、22% \n(6) 700シールド、27%',
  'Meeple': 'ミィプルはミィプを引き寄せ、ミィプらしくスキルを強化する。また、体力が増加する。\n\n(3) 2 , 100 \n(5) 3 , 400 \n(7) 4 , 400 .ベンチに「クローンスロット」を1つ作成する。クローンが完了すると、配置したチャンピオンの★1コピーとゴールドを獲得する。\n(10) 6、500。4体のミィプロードを召喚！\n\n\nクローン時間＝チャンピオンのコスト',
  'Mecha': 'インネイト: 「メカ」ユニットが究極形態に変身する。スキルがアップグレードされ、体力が50%増加する。変身した「メカ」はチームスロットを2つ使用する。「メカ」特性が2倍にカウントされる。\n\n(3) エナジーセル: 「メカ」が20% を獲得する。\n(4) オーバークロックセル: 35% に増加する。\n(6) 精密工学: チームの最大サイズ+1\n\n\n「メカフォーマー」アイテムを使うと、「メカ」ユニットの形態が切り替わる',
  'Replicator': '「レプリケーター」のスキルが2回発動するが、2回目の効果は低下する。\n\n(2) 22%の威力\n(4) 45%の威力',
  'Rogue': '「ローグ」の攻撃力と魔力が増加する。体力が初めて50%未満になったとき、影の中に姿を消す。このユニットを対象にしている敵は、近くにいる別のユニットに対象を変更する(タンクを優先)。\n\n(2) 12%  \n(3) 25%  \n(4) 40%  \n(5) 55%',
  'Redeemer': '(1) 発動している特性1つにつき(固有特性を除く)、\n味方チームの攻撃速度が2%/2.5%/3%、\n物理防御と魔法防御が2/2.5/3増加する。',
  'missfortuneuniquetrait': 'コンジット/チャレンジャー/レプリケーターモードから選択。',
  'Shepherd': '「導き手」は「星々の絆」を召喚して、戦いの助けとする。\n\n(3) ビアを召喚\n(5) バインを召喚\n(7) ビアとバインの絆が深まる\n\n\nビアとバインの力は、「導き手」全員の合計スターレベルに応じて増加する。',
  'Marauder': '味方チームのオムニヴァンプが5%増加する。「略奪者」が獲得するオムニヴァンプと攻撃力が増加し、オムニヴァンプによる余剰の体力回復量はシールドに変換される(上限: 最大体力の25%)。\n\n(2) 5% 、20% \n(4) 7% 、40% \n(6) 10% 、60% 。',
  'Primordian': '(2) ダメージを与えると、「プライモーディアン」のスターレベルに応じてスワームリングを召喚する。\n(3) さらに多くのスワームリングを召喚する！毎ラウンド、ランダムなコスト1またはコスト2のチャンピオンを1体獲得する。\n\n\n被ダメージの8%が与ダメージに変換される。',
  'Stargazer': '試合ごとに異なる星座の効果を持つ。',
};

/* ── 星の観測者（Stargazer）バリエーション ── */
const stargazerVariants = [
  '星の観測者たちは、試合ごとに異なる星座を描き出す。この試合: イノシシ\n\n勝利時にゴールドを獲得する。強化マスにいる味方は体力、攻撃力、魔力が8%増加する。「星の観測者」は獲得量が増加する。\n\n(3) 1ゴールド、2%、16%\n(4) 2ゴールド、7%、24%\n(5) 3ゴールド、12%、32%\n(6) 5ゴールド、17%、37%',
  '星の観測者たちは、試合ごとに異なる星座を描き出す。この試合: メダル\n\n(3) 強化マスにいる味方が12%のダメージ増加効果を獲得し、味方の★3ユニット1体ごとに効果量が9%増加する。',
  '星の観測者たちは、試合ごとに異なる星座を描き出す。この試合: 女狩人\n\n戦闘開始時: 最も体力が高い敵にマークを付与する。\n\n(3) 15%、3マーク\n(5) 30%、5マーク\n(7) 45%、7マーク',
  '星の観測者たちは、試合ごとに異なる星座を描き出す。この試合: 蛇\n\n(3) 7%耐久力、30%毒ダメージ\n(5) 12%、45%\n(7) 17%、60%',
  '星の観測者たちは、試合ごとに異なる星座を描き出す。この試合: 祭壇\n\n(3) 体力+8%、攻撃速度+12%。生贄60回で星の観測者が追加効果獲得',
  '星の観測者たちは、試合ごとに異なる星座を描き出す。この試合: 泉\n\n強化マスにいる味方は、2秒ごとに最大体力の1%を回復する。強化マスにいる「星の観測者」は、追加で体力を2.5%回復し、2秒ごとに攻撃力と魔力が累積しながら増加する。\n\n(3) 4% \n\n (5) 7%', 
  '星の観測者たちは、試合ごとに異なる星座を描き出す。この試合: 山\n\n対人戦5回ごとに「星の観測者の紋章」を1つ獲得。各ラウンド様々なボーナスを獲得。'
];

/* ── アービター 条件データ ── */
const ARBITER_CAUSES = [
  { id: 'c8', text: '4秒ごとに', category: 'consistent' },
  { id: 'c3', text: '戦闘開始時: 「アービター」のスターレベルごとに', category: 'consistent' },
  { id: 'c6', text: '「アービター」が3回攻撃すると', category: 'conditional' },
  { id: 'c5', text: '「アービター」が50マナを消費すると', category: 'conditional' },
  { id: 'c2', text: '戦闘開始時: 獲得予定の利子ごとに、さらに', category: 'economy' },
  { id: 'c7', text: '戦闘開始時: 直前の戦闘準備フェーズ中にリロールした場合', category: 'economy' }
];

/* ── アービター 効果データ ── */
const ARBITER_EFFECTS = [
  { id: 'e4', text: 'すべての「アービター」の魔力がX増加する。', category: 'offence' },
  { id: 'e1', text: 'すべての「アービター」の攻撃速度がX%増加する。', category: 'offence' },
  { id: 'e6', text: 'すべての「アービター」の最大体力が恒久的にX増加する。', category: 'defence' },
  { id: 'e9', text: 'X秒間、すべての「アービター」が最大体力のX%にあたる耐久値を持つシールドを獲得する。', category: 'defence' },
  { id: 'e7', text: 'すべての「アービター」の物理防御と魔法防御がX増加する。', category: 'defence' },
  { id: 'e2', text: '戦闘終了時、X%の確率でレオナを1体獲得する。', category: 'economy' },
  { id: 'e5', text: '戦闘終了時、X%の確率でXゴールドを獲得する。', category: 'economy' }
];

/* ── 神々（Set 17 遭遇ギミック） ── */
const GOD_DATA = [
  { id: 'soraka', name: '星々の神 ソラカ', desc: 'ソラカは「体力」を授ける', imgUrl: 'https://cmsassets.rgpub.io/sanity/images/dsfx7636/news_live/5290323ec83e76ae4dcce502e0242f6b8095eb8a-800x800.png', color: '#00897b' }, // 濃い青緑
  { id: 'ahri', name: '富の神 アーリ', desc: 'アーリは「富」を授ける', imgUrl: 'https://cmsassets.rgpub.io/sanity/images/dsfx7636/news_live/ebc83fe16b5eda244d817fa5dea982b902a40c26-800x800.png', color: '#00897b' }, // 濃い青緑
  { id: 'asol', name: '驚異の神\nオレリオン・ソル', desc: 'オレリオン・ソルは\n「価値ある試練」を授ける', imgUrl: 'https://cmsassets.rgpub.io/sanity/images/dsfx7636/news_live/2c497150be7a305a776b53224ef3d0dd7831c449-800x800.png', color: '#0066cc' }, // 濃い青
  { id: 'yasuo', name: '深淵の神 ヤスオ', desc: 'ヤスオは「マス」を授ける', imgUrl: 'https://cmsassets.rgpub.io/sanity/images/dsfx7636/news_live/5889c75974c9aa9e2d6d11ef38b78195f4f4c751-800x800.png', color: '#8e24aa' }, // 濃い紫
  { id: 'varus', name: '愛の神 ヴァルス', desc: 'ヴァルスは「チャンピオン」を授ける', imgUrl: 'https://cmsassets.rgpub.io/sanity/images/dsfx7636/news_live/e142690ed342c22dd2fbb6cb560758a506de09b9-800x800.png', color: '#d81b60' }, // 濃いピンク
  { id: 'evelynn', name: '誘惑の神 イブリン', desc: 'イブリンは「死の取引」を授ける', imgUrl: 'https://cmsassets.rgpub.io/sanity/images/dsfx7636/news_live/f208d197f0e823b2b9ff0ec0be184501eb68a7db-800x800.png', color: '#673ab7' }, // 深い紫
  { id: 'thresh', name: '契約の神 スレッシュ', desc: 'スレッシュは「ランダム」を授ける', imgUrl: 'https://cmsassets.rgpub.io/sanity/images/dsfx7636/news_live/cc01d2af8a1ca3de86ce513f7ca34261e8b40596-800x800.png', color: '#FF4500' }, // オレンジレッド
  { id: 'kayle', name: '秩序の神 ケイル', desc: 'ケイルは「アイテム」を授ける', imgUrl: 'https://cmsassets.rgpub.io/sanity/images/dsfx7636/news_live/b2422b8bf1679f10d0e642fb6ebffa241ed4b962-800x800.png', color: '#000080' }, // ネイビー
  { id: 'ekko', name: '時の神 エコー', desc: 'エコーは「フラッシュバック」を授ける', imgUrl: 'https://cmsassets.rgpub.io/sanity/images/dsfx7636/news_live/4c3157efdcb09e79c2882fbc167c52a727d7656c-800x800.png', color: '#b8860b' }, // ダークゴールド
];
