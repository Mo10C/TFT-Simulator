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

  /* 🧊 3D盤面の既定アングル（任意）
     ── アプリを管理者アカウントで開き、3D → VIEW ON でカメラを好きな位置に合わせ、
        「📌 この視点を既定に」を押すと下の形式がクリップボードにコピーされる。
        それをここに貼り付けると、全員の既定アングルになる。
     ── 未設定（コメントのまま）なら、盤面が画面いっぱいに収まる位置を自動計算する。
     例: board3dView: {"pos":[0,12.4,15.1],"target":[0,1.1,0.3]}, */
  // board3dView: {"pos":[0,12.4,15.1],"target":[0,1.1,0.3]},

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
