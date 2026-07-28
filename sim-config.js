/* ============================================================
   TFT Simulator 共通設定
   ── app.js / sim-editor.html の両方がこのファイルを読み込む。
   ── ここだけ編集すればOK（app.js を触る必要はありません）
   ============================================================ */
window.SIM_CONFIG = {

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
