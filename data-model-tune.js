/* ============================================================
   データ: 3Dモデルの調整値 ── sim-editor.html の「🧊 3Dモデル」タブで編集する
   ── board3d.js（ゲーム本体）と sim-editor.html（エディタ）の両方がこのファイルを読む。
   ── エディタで調整 →「⬇ data-model-tune.js をダウンロード」→ このファイルを差し替え。
      board3d.js を触る必要はない。

   MODEL_TUNE       … 大きさ・位置・向きの微調整
        scale … 1.0 が標準の背丈 / x・z … 立ち位置 / y … 高さ / rotY … 向き（ラジアン）
   MODEL_HIDE_PARTS … 消したいパーツ（名前の一部でも可・大文字小文字は無視）
   MODEL_KEEP_PARTS … 自動判定で消えてしまうが残したいパーツ
   ============================================================ */

const MODEL_TUNE = {
  akali: { scale:0.89, z:0.59 },   // アカリ
  cinderling: { scale:0.35 },   // シンダーリング
  karma: { scale:1.1 },   // カルマ
  kobuko: { scale:0.71, x:0.4, z:0.01, rotY:-18 * Math.PI/180 },   // コブコ
  leona: { z:-0.75 },   // レオナ
  ornn: { z:-0.66 },   // オーン
  pebbles: { scale:0.71, z:0.14 },   // 小石
  rakan: { x:-0.27, z:-0.19 },   // ラカン
  reksai: { scale:0.79, x:0.22 },   // レク＝サイ
  varus: { scale:1.2, x:-0.14, y:-0.29, z:0.8 },   // ヴァルス
  veigar: { scale:0.82 },   // ベイガー
  xayah: { z:-0.3 },   // ザヤ
  yorick: { scale:1.24, x:0.2, y:-0.17, z:-0.46 },   // ヨリック
  caitlyn: { scale:0.87 },   // ケイトリン
  elise: { x:-0.14, z:0.19 },   // エリス
  gromp: { scale:0.69, x:-0.14, y:-0.24 },   // グロンプ
  kayle: { x:-0.01, y:-0.27, rotY:-21 * Math.PI/180 },   // ケイル
  leblanc: { scale:1.11, x:0.45, y:-0.2 },   // ルブラン
  murkwolf: { scale:0.49, x:-0.19, rotY:2 * Math.PI/180 },   // マークウルフ
  scuttlecrab: { scale:0.7 },   // スカトルクラブ
  sejuani: { scale:1.18, y:-0.13 },   // セジュアニ
  teemo: { scale:0.7, x:0.22, z:0.07 },   // ティーモ
  warwick: { scale:0.78 },   // ワーウィック
  yunara: { x:-0.03, y:-0.18 },   // ユナラ
  azir: { scale:1.23, x:0.3, y:-0.29 },   // アジール
  cassiopeia: { x:-1.55, z:0.18 },   // カシオペア
  diana: { scale:1.12 },   // ダイアナ
  fiddlesticks: { scale:1.05, x:0.07, y:-0.57, z:-0.34 },   // フィドルスティックス
  hecarim: { scale:1.26 },   // ヘカリム
  khazix: { scale:0.84, x:-0.19, z:0.22 },   // カ＝ジックス
  kogmaw: { scale:0.64 },   // コグ＝マウ
  krug: { scale:0.76, x:0.04 },   // クルーグ
  mamabeak: { scale:0.6 },   // ラプター
  masteryi: { x:0.08, z:-0.55 },   // マスター・イー
  rammus: { z:-0.17 },   // ラムス
  rengar: { scale:0.94, x:0.13, z:-0.17, rotY:10 * Math.PI/180 },   // レンガー
  tristana: { scale:0.73, x:0.17, y:0.04, z:0.1 },   // トリスターナ
  ahri: { x:-0.81, z:-0.02 },   // アーリ
  amumu: { x:-0.1, z:0.07 },   // アムム
  aphelios: { scale:1.24, x:0.12, y:-1, z:1.5 },   // アフェリオス
  brambleback: { scale:0.79, x:-0.2, z:0.3, rotY:-111 * Math.PI/180 },   // ブランブルバック
  ezreal: { x:-0.14, z:0.01 },   // エズリアル
  lillia: { scale:1.12 },   // リリア
  malphite: { x:-0.15, z:-0.15 },   // マルファイト
  morgana: { x:-0.17, z:0.24 },   // モルガナ
  nidalee: { x:0.19, z:-0.24 },   // ニダリー
  sentinel: { scale:0.8 },   // 古の番人
  sett: { scale:0.97, x:0.01, z:-0.05 },   // セト
  sivir: { scale:0.94, x:0.34, z:0.16 },   // シヴィア
  soraka: { z:0.45 },   // ソラカ
  zyra: { scale:0.98, z:-0.18 },   // ザイラ
  alune: { y:-0.45 },   // アルーン
  ashe: { scale:1.13, y:-0.09, z:-0.39 },   // アッシュ
  draven: { x:-0.1 },   // ドレイヴン
  elderdragon: { scale:1.07, x:-1.03, y:-0.83, z:-0.23, rotY:-4 * Math.PI/180 },   // エルダードラゴン
  gnar: { scale:0.55, z:0.27 },   // ナー
  ivern: { x:-0.16 },   // アイバーン
  kennen: { scale:0.82, x:-0.17, z:0.04 },   // ケネン
  lux: { z:0.6 },   // ラックス
  maokai: { z:0.77 },   // マオカイ
};

const MODEL_HIDE_PARTS = {
  yunara: ["dragon_head","tail"],
  akali: ["kama_right"],
};

const MODEL_KEEP_PARTS = {
  varus: ["weapon","bow","arrow"],
  aphelios: ["calibrum"],
  alune: ["weapon1"],
  yunara: ["bead_5"],
};
