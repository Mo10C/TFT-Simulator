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

  /* 🏟️ 3D盤面のアリーナ画像（任意）
     ── 盤面の下に敷く地面。index.html と同じ場所に画像を置けばファイル名だけでOK。
        http〜 の完全URLも使える。image:'' にすると画像なし（影だけ）になる。
     ── width/depth を大きくすると地面が広がる。盤面がアリーナの内側（草地の部分）に
        ちょうど収まるよう width/depth/x/z を微調整する。
     ── y は地面の高さ。ベンチ列より下でないと駒の足が埋まるので -0.09 前後にしておく。
     ── 数値の基準は「六角マス1個の半径 = 1.0」。盤面は横およそ13・奥行およそ6。 */
  arena: {
    image: 'TFT-arena.jpg',
    width: 28.8,
    depth: 17,
    x: 0.3,
    y: -0.09,
    z: -0.2,
  },

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
