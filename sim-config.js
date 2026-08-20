/* ============================================================
   TFT Simulator 共通設定
   ── app.js / sim-editor.html の両方がこのファイルを読み込む。
   ── ここだけ編集すればOK（app.js を触る必要はありません）
   ============================================================ */
window.SIM_CONFIG = {

  /* 🏷️ 現在のセット（画像URLの tftXX_ 接頭辞に使用。'set18' → tft18_）
     ── app.js のチャンピオン画像・紋章URLはこの1箇所を見て切り替わる。
     ── sim-editor.html は各チャンピオンの set タグを優先し、この値は既定値として使う。
     ── セットが変わったらここだけ 'set19' 等に更新すればOK。 */
  set: 'set18',

  /* 🖼️ ホーム・メニューの背景画像（任意）
     ── 未設定なら Set 18 のキービジュアルを使う。セットが変わったらここを差し替える。 */
  // homeBackground: 'https://example.com/set19.jpg',

  /* 🖼️ 背景の見せ方（任意）── 位置や拡大の仕方を調整したいときだけ設定する。
     homeBackgroundPosition: 画像のどこを画面中央に持ってくるか
        'center'      … 中央（既定）
        'center 30%'  … 上寄り（人物の顔を出したいときなど）
        'center 70%'  … 下寄り
        '30% center'  … 左寄り  /  '70% center' … 右寄り
     homeBackgroundSize: 拡大の仕方
        'cover'       … 画面いっぱいに敷き詰める（既定・端は切れる）
        'contain'     … 画像全体を収める（余白が出る）
        '120% auto'   … 横幅を120%に拡大（数値で微調整） */
  // homeBackgroundPosition: 'center 35%',
  // homeBackgroundSize: 'cover',

  /* 🧊 盤面の初期表示（任意）
     ── 既定では3D盤面で起動する。2Dで起動したい場合だけ true にする。 */
  // default2D: true,

  /* 🧊 3D盤面の既定アングル（任意）
     ── アプリを管理者アカウントで開き、3D → VIEW ON でカメラを好きな位置に合わせ、
        「📌 この視点を既定に」を押すと下の形式がクリップボードにコピーされる。
        それをここに貼り付けると、全員の既定アングルになる。
     ── 未設定（コメントのまま）なら、盤面が画面いっぱいに収まる位置を自動計算する。
     例: board3dView: {"pos":[0,12.4,15.1],"target":[0,1.1,0.3]}, */
  board3dView: {"pos":[-0.66,10.58,11.63],"target":[-0.66,-0.13,1.29]},

  /* 🏟️ 3D盤面のアリーナ（任意）
     ── mode: 'built' … 石壁・草地・かがり火を three.js で組み立てる（既定・画像ファイル不要）
              'image' … 1枚絵を敷く従来方式（image / width / depth を使う）
     ── 数値の基準は「六角マス1個の半径 = 1.0」。盤面＋ベンチは横17.2・奥行9.7。
     ── x / z は全体のズラし。y は地面の高さ（ベンチ列より下にすること）。
     ── colors で色を変えられる（省略可）:
          grass 草地 / floor 石畳 / wall 石壁 / merlon 壁の窪み /
          pedestal かがり火の台座 / flame 炎 / water 水面 /
          stone1〜3 床に散らす石
     ── stones:false で床の石を、merlons:false で壁の窪みを、
        torches:false でかがり火を、water:false で水面を消せる。 */
  arena: {
    mode: 'built',

    // 組み立て（built）用
    innerWidth: 20,        // 石畳の横幅（壁の内側）
    innerDepth: 18,        // 石畳の奥行き（敵陣4列＋自陣4列＋ベンチが収まる広さ）
    wallThickness: 0.75,   // 石壁の厚み
    wallHeight: 0.85,      // 石壁の高さ
    grassMargin: 6,        // 石畳の外に広がる草地の幅
    stoneCount: 26,        // 床に散らす石の数
    merlonCount: 6,        // 左右の壁に並べる窪みブロックの数
    torchIntensity: 0.85,  // かがり火の明るさ

    // 1枚絵（image）用
    image: 'TFT-arena.jpg',
    width: 28.8,
    depth: 17,

    // 共通
    x: 0.3,
    y: -0.09,
    z: -3.3,
  },

  /* 💡 3D盤面の明るさ（任意・省略すると既定値）
     ── 白飛びする場合は exposure か key を下げる。暗い場合は上げる。
     ── toneMapping:false にすると明るい面が白く飛びやすくなるので基本は true のまま。
     light: { hemi: 0.55, ambient: 0.25, key: 1.15, rim: 0.35, exposure: 1.0, toneMapping: true }, */

  /* 🔍 3D描画のきめ細かさ（任意・省略すると既定値）
     ── superSample: 画面の何倍の解像度で描いてから縮小するか。
          2 = 縦横2倍（＝4倍のピクセル）でモデルのギザつきがほぼ消える。
          動作が重い場合は 1.5 や 1 に下げる。
     ── maxPixelRatio: 上限。高解像度の端末で描画量が増えすぎるのを防ぐ。
     ── anisotropy: 斜めに見た面のテクスチャのボケ・ちらつきを抑える。
     quality: { superSample: 2, maxPixelRatio: 3, anisotropy: true }, */

  /* 🎨 チャンピオンモデルだけの明るさ（任意・1.0 で無調整）
     ── アリーナの色には影響しません。モデルが白っぽい／のっぺりして見えるときに下げる。
     ── 既定は 1.0（無調整）。落ち着かせたいときだけ 0.8 → 0.68 などに下げる。
     modelTint: 0.68, */

  /* 📊 みんなの結果（Firestore）
     Firebase コンソール > プロジェクトの設定 > 全般 の値 */
  firebase: {
    apiKey: 'AIzaSyDeg92vX9vqWODJ8TbufZv_-H2abGEDLfo',
    projectId: 'st-simulator',
    collection: 'sim_seed_stats',
  },

  /* 🎮 Riot ID 連携用の Cloudflare Worker プロキシURL（末尾スラッシュなし）
     例: 'https://tft-riot-proxy.xxxx.workers.dev'
     Worker は /riot/account/... と /tft/league/... をRiot APIへ転送する想定 */
  riotProxyUrl: 'https://tft-sim-riot-proxy.moto-moto-tennis.workers.dev',

  /* 💬 Discord 連携用のアプリケーションID（Discord Developer Portal）
     OAuth2 > Redirects にこのシミュレーターのURLを登録しておくこと */
  discordClientId: '1522295861994848398',

  /* 🛡️ 管理者（メニューにエディタボタンが表示され、sim-editor.html を開ける）
     riotIds: 連携した Riot ID（大文字小文字は区別しない）
     discordIds: 連携した Discord のユーザーID（アカウント連携画面に表示される数字） */
  admins: {
    riotIds: ['Mo10C#819'],
    discordIds: [],
  },
};
