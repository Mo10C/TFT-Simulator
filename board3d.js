/* ============================================================
   🧊 board3d.js ─ 3D盤面モジュール（app.js から分離）
   ── 依存: three.js(r128 UMD) + OrbitControls + GLTFLoader、React（index.html で app.js より前に読込）
   ── 提供するグローバル: CHAMP_MODELS3D / Board3D
   ── app.js 側は <Board3D board={board} boardIcon={boardIcon} champModels={CHAMP_MODELS3D}
        onHexClick={...} selectedIdx={...} /> として使う。
   ── ⚠ JSX を含むため index.html では type="text/babel" data-presets="jsx-classic" で読み込むこと。
   ============================================================ */
const {useState:useState3D,useEffect:useEffect3D,useRef:useRef3D}=React;

/* 🧊 3D盤面：チャンピオンID → .glb ファイル名（実装中の全チャンピオン分）
   ── ファイル名の規則: <champ.id>_(tft_set_<セット番号>).glb
   ── 置き場所は index.html と同じ階層。別フォルダに置くなら B3D_MODEL_BASE を設定する。
   ── まだ用意していないモデルは、そのままカード表示になる（エラーにはならない）。
   ── 優先順: CHAMPS の model → CHAMP_MODELS3D → 自動生成 */
const CHAMP_MODELS3D = {
  /* ── 1コスト（14体） ── */
  akali:          'akali_(tft_set_18).glb',
  camille:        'camille_(tft_set_18).glb',
  cinderling:     'cinderling_(tft_set_18).glb',
  karma:          'karma_(tft_set_18).glb',
  kobuko:         'kobuko_(tft_set_18).glb',
  leona:          'leona_(tft_set_18).glb',
  ornn:           'ornn_(tft_set_18).glb',
  pebbles:        'pebbles_(tft_set_18).glb',
  rakan:          'rakan_(tft_set_18).glb',
  reksai:         'reksai_(tft_set_18).glb',
  varus:          'varus_(tft_set_18).glb',
  veigar:         'veigar_(tft_set_18).glb',
  xayah:          'xayah_(tft_set_18).glb',
  yorick:         'yorick_(tft_set_18).glb',
  /* ── 2コスト（13体） ── */
  alistar:        'alistar_(tft_set_18).glb',
  caitlyn:        'caitlyn_(tft_set_18).glb',
  elise:          'elise_(tft_set_18).glb',
  gromp:          'gromp_(tft_set_18).glb',
  kayle:          'kayle_(tft_set_18).glb',
  leblanc:        'leblanc_(tft_set_18).glb',
  murkwolf:       'murkwolf_(tft_set_18).glb',
  scuttlecrab:    'scuttlecrab_(tft_set_18).glb',
  sejuani:        'sejuani_(tft_set_18).glb',
  shen:           'shen_(tft_set_18).glb',
  teemo:          'teemo_(tft_set_18).glb',
  warwick:        'warwick_(tft_set_18).glb',
  yunara:         'yunara_(tft_set_18).glb',
  /* ── 3コスト（14体） ── */
  azir:           'azir_(tft_set_18).glb',
  cassiopeia:     'cassiopeia_(tft_set_18).glb',
  diana:          'diana_(tft_set_18).glb',
  fiddlesticks:   'fiddlesticks_(tft_set_18).glb',
  hecarim:        'hecarim_(tft_set_18).glb',
  khazix:         'khazix_(tft_set_18).glb',
  kogmaw:         'kogmaw_(tft_set_18).glb',
  krug:           'krug_(tft_set_18).glb',
  mamabeak:       'mamabeak_(tft_set_18).glb',
  masteryi:       'masteryi_(tft_set_18).glb',
  rammus:         'rammus_(tft_set_18).glb',
  rengar:         'rengar_(tft_set_18).glb',
  tristana:       'tristana_(tft_set_18).glb',
  vi:             'vi_(tft_set_18).glb',
  /* ── 4コスト（14体） ── */
  ahri:           'ahri_(tft_set_18).glb',
  amumu:          'amumu_(tft_set_18).glb',
  aphelios:       'aphelios_(tft_set_18).glb',
  brambleback:    'brambleback_(tft_set_18).glb',
  ezreal:         'ezreal_(tft_set_18).glb',
  lillia:         'lillia_(tft_set_18).glb',
  malphite:       'malphite_(tft_set_18).glb',
  morgana:        'morgana_(tft_set_18).glb',
  nidalee:        'nidalee_(tft_set_18).glb',
  sentinel:       'sentinel_(tft_set_18).glb',
  sett:           'sett_(tft_set_18).glb',
  sivir:          'sivir_(tft_set_18).glb',
  soraka:         'soraka_(tft_set_18).glb',
  zyra:           'zyra_(tft_set_18).glb',
  /* ── 5コスト（10体） ── */
  alune:          'alune_(tft_set_18).glb',
  ashe:           'ashe_(tft_set_18).glb',
  draven:         'draven_(tft_set_18).glb',
  elderdragon:    'elderdragon_(tft_set_18).glb',
  gnar:           'gnar_(tft_set_18).glb',
  ivern:          'ivern_(tft_set_18).glb',
  kennen:         'kennen_(tft_set_18).glb',
  lux:            'lux_(tft_set_18).glb',
  maokai:         'maokai_(tft_set_18).glb',
  taric:          'taric_(tft_set_18).glb',
};

/* 🗂️ モデルファイルの置き場と命名規則
   ── ファイル名は「<チャンピオンid>_(tft_set_<セット番号>).glb」で保存する運用。
      例) ahri → ahri_(tft_set_18).glb / aphelios → aphelios_(tft_set_18).glb
   ── CHAMP_MODELS3D に載っていないチャンピオン（新規追加など）は、この規則で自動生成する。
   ── セット番号は sim-config.js の set（'set18' 等）から自動で決まる。
   ── 置き場所を変える場合は B3D_MODEL_BASE だけ書き換える。 */
const B3D_MODEL_BASE = 'models/';   // モデルの置き場（末尾スラッシュ付き）。同階層なら '' にする
/* 置き場所が変わっても動くよう、候補を順に試す（最初に見つかったものを使う） */
function b3dModelCandidates(url){
  if(!url) return [];
  if(/^https?:\/\//.test(url)) return [url];          // 絶対URLはそのまま
  const file = url.replace(/^.*\//, '');
  const list = [url, 'models/' + file, file];
  return [...new Set(list)];
}
const B3D_SET_NO = (function(){
  try { return String((window.SIM_CONFIG && window.SIM_CONFIG.set) || 'set18').replace(/[^0-9]/g, '') || '18'; }
  catch(e){ return '18'; }
})();
function b3dAutoModelUrl(id){
  if(!id) return '';
  return `${B3D_MODEL_BASE}${String(id).toLowerCase()}_(tft_set_${B3D_SET_NO}).glb`;
}

/* ============================================================
   🧊 3D 盤面（Board3D）
   ── three.js(グローバルUMD) を index.html で読み込み。未ロード/WebGL不可なら
      2D にフォールバック表示。board 状態に追従して駒を同期。
   ── 駒 = コスト色の台座 ＋ (自前.glbモデル or ポートレート立て看板) ＋ ★ ＋ アイテムpip。
   ── CHAMP_MODELS3D[<champ.id>] に .glb パスを入れるとモデル表示に切替。
   ============================================================ */
const B3D = { R:1.0, TH:0.02, GAP:1.10, get HSP(){return Math.sqrt(3)*this.R*this.GAP;}, get VSP(){return 1.5*this.R*this.GAP;}, get TOP(){return this.TH/2;} };

/* ═══ 🏟️ アリーナ（盤面の地面）の設定 ═══
   ── sim-config.js の arena で上書きできる。例:
        arena: { image:'tft-arena-skin-runic.webp', width:22, depth:16, x:0, z:1.2 }
      image … 地面に貼る画像。index.html と同じ場所に置けばファイル名だけでOK（http〜のURLも可）。
              未設定・読み込み失敗時は画像なし（影だけ）になり、盤面は従来どおり動く。
      width/depth … 地面の板の大きさ。盤面がアリーナの内側（草地の部分）に収まるよう調整する。
      x / z … 地面の位置。盤面に対して画像がズレているときに動かす。
      y … 地面の高さ。ベンチ列(-0.06)より下でないと駒の足が地面に埋まるので既定は -0.09。
   ── 数値は「六角マス1個の半径=1.0」が基準。盤面は横約13・奥行約6の大きさ。 */
const B3D_ARENA = Object.assign(
  {
    mode:'built',          // 'built'（組み立て）または 'image'（1枚絵）
    // ── built のときに使う値 ──
    innerWidth:20,         // 石畳（戦うところ）の横幅。盤面＋ベンチは横17.2なので余白込みで20
    innerDepth:18,         // 石畳の奥行き。敵陣4列＋自陣4列＋ベンチで奥行15.5あるので余白込みで18
    wallThickness:0.75,    // 石壁の厚み
    wallHeight:0.85,       // 石壁の高さ
    grassMargin:6,         // 石畳の外に広がる草地の幅
    stoneCount:26,         // 床に散らす石の数（0 や stones:false で無し）
    merlonCount:6,         // 左右の壁に並べる窪みブロックの数
    torchIntensity:0.85,   // かがり火の明るさ
    // ── image のときに使う値 ──
    image:'TFT-arena.jpg', width:26, depth:17,
    // ── 共通 ──
    x:0, y:-0.09, z:-3.3,   // z は敵陣が増えたぶん奥へずらしてある
  },
  (typeof window!=='undefined' && window.SIM_CONFIG && window.SIM_CONFIG.arena) || {}
);

/* ═══ 💡 明るさの設定 ═══
   ── 合計が強すぎると明るい面が白飛びする（1.0 で頭打ちになるため）。
      toneMapping を切ると、その頭打ちがそのまま出るので白飛びしやすくなる。
   ── sim-config.js の light で上書きできる。例:
        light: { key: 1.0, exposure: 0.9 }
      hemi … 空と地面からの環境光 / ambient … 全体の底上げ
      key … 主光源（影を作る） / rim … 逆光側の青い縁取り
      exposure … 全体の露出。暗ければ上げ、明るすぎれば下げる。 */
const B3D_LIGHT = Object.assign(
  { hemi:0.55, ambient:0.25, key:1.15, rim:0.35, exposure:1.0, toneMapping:true },
  (typeof window!=='undefined' && window.SIM_CONFIG && window.SIM_CONFIG.light) || {}
);

/* ═══ 🔍 描画のきめ細かさ ═══
   ── ブラウザの拡大率100%だとモデルがギザついて見えるのは、
      表示するピクセル数と同じ数しか描いていないため（等倍描画）。
      拡大率33%で綺麗に見えるのは、小さく表示されるぶん実質的に
      高解像度で描いた絵を縮小しているのと同じ状態になるから。
   ── そこで superSample 倍の解像度で描いてから画面サイズに縮小する。
      2 にすると縦横2倍＝4倍のピクセルを描くので、その分だけ重くなる。
   ── sim-config.js の quality で上書きできる。重い場合は superSample を下げる。 */
const B3D_QUALITY = Object.assign(
  { superSample: 2, maxPixelRatio: 3, anisotropy: true },
  (typeof window!=='undefined' && window.SIM_CONFIG && window.SIM_CONFIG.quality) || {}
);
/* 実際に使うピクセル比。端末の解像度 × superSample を上限で頭打ちにする */
function b3dPixelRatio(){
  const dpr = (typeof window!=='undefined' && window.devicePixelRatio) || 1;
  return Math.min(dpr * B3D_QUALITY.superSample, B3D_QUALITY.maxPixelRatio);
}
/* テクスチャの異方性フィルタの最大値。斜めに見た面のボケ・ちらつきを抑える */
let B3D_MAX_ANISO = 1;

/* 🛡️ 敵陣（奥側4列）の淵。自陣より暗く出して「置けない側」だと分かるようにする */
const B3D_ENEMY_EDGE_COLOR = 0x8fa3bd;
const B3D_ENEMY_EDGE_OPACITY = 0.22;

/* 🪑 ベンチの枠の色（石のくぼみ）。アリーナの石材と揃えてある */
const B3D_BENCH_COLORS = { frame: 0x272016, inner: 0x14110b };

/* ✏️ 六角形の淵（駒を持ち上げている間だけ見える線）の色と濃さ */

/* ═══════════════════════════════════════════════════════════════
   🏟️ アリーナを組み立てる（画像を貼らず、箱と板だけで作る簡易版）
   ── 本家のステージを参考にした構成:
        草地 → 石畳の床 → 四方を囲む石壁 → 角のかがり火 → 外周の水面
   ── 数値の基準は「六角マス1個の半径 = 1.0」。盤面は横約14・奥行約9。
   ── 色は本家アリーナ画像から色を拾い、「ライトを当てた後にその色に見える」よう
      逆算した値を既定にしている（そのまま画像の色を入れると明るくなりすぎるため）。
      ※ three r128 はマテリアル色を sRGB として解釈せず、hex/255 をそのまま
        線形の明るさとして扱う。そのため見た目より かなり暗い値になっている。
        ここを普通の色感覚で明るくすると一気に白飛びするので注意。
      ライトの強さ（B3D_LIGHT）を大きく変えたときは色も合わなくなる点に注意。
   ── 色や大きさは sim-config.js の arena で変えられる。
   ═══════════════════════════════════════════════════════════════ */
function b3dBuildArena(THREE, A, renderer){
  const g = new THREE.Group();
  const C = A.colors || {};
  const mat = (color, rough, metal) => new THREE.MeshStandardMaterial({
    color, roughness: rough === undefined ? 0.95 : rough, metalness: metal === undefined ? 0 : metal, flatShading: true });

  const innerW = A.innerWidth, innerD = A.innerDepth;   // 石畳（戦うところ）の広さ
  const wallT  = A.wallThickness, wallH = A.wallHeight; // 壁の厚み・高さ
  const y = A.y;                                        // 地面の高さ
  const hw = innerW/2, hd = innerD/2;                   // 内側の半分の大きさ
  const ox = A.x, oz = A.z;                             // 全体のズラし

  /* ── ① 外側の草地（広めの板）── */
  const grass = new THREE.Mesh(new THREE.PlaneGeometry(innerW + A.grassMargin*2, innerD + A.grassMargin*2),
                               mat(C.grass || 0x080904));
  grass.rotation.x = -Math.PI/2;
  grass.position.set(ox, y - 0.06, oz);
  grass.receiveShadow = true;
  g.add(grass);

  /* ── ② 内側の石畳（駒が立つ面。影はここが受ける）── */
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(innerW, innerD), mat(C.floor || 0x1c150a, 1));
  floor.rotation.x = -Math.PI/2;
  floor.position.set(ox, y, oz);
  floor.receiveShadow = true;
  g.add(floor);

  // 石畳の上に、色味の違う大きな石を散らして単調さを消す（見た目だけ・影は受けない）
  if (A.stones !== false) {
    const stoneMat = [mat(C.stone1 || 0x261d0e, 1), mat(C.stone2 || 0x1d1309, 1), mat(C.stone3 || 0x17150b, 1)];
    let seed = 20260820;
    const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
    for (let i = 0; i < (A.stoneCount || 26); i++) {
      const r = 0.55 + rnd() * 1.15;
      const s = new THREE.Mesh(new THREE.CircleGeometry(r, 6), stoneMat[i % 3]);
      s.rotation.x = -Math.PI/2; s.rotation.z = rnd() * Math.PI;
      s.position.set(ox + (rnd() - 0.5) * (innerW - 1.5), y + 0.005 + i * 0.0004, oz + (rnd() - 0.5) * (innerD - 1.5));
      s.scale.set(1, 0.72, 1);
      g.add(s);
    }
  }

  /* ── ③ 四方の石壁 ── */
  const wallMat = mat(C.wall || 0x272016, 0.9);
  const addWall = (w, d, x, z) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, wallH, d), wallMat);
    m.position.set(x, y + wallH/2, z);
    m.castShadow = true; m.receiveShadow = true;
    g.add(m);
    return m;
  };
  const outer = wallT/2;
  addWall(innerW + wallT*2, wallT, ox,               oz - hd - outer);  // 奥
  addWall(innerW + wallT*2, wallT, ox,               oz + hd + outer);  // 手前
  addWall(wallT, innerD,           ox - hw - outer,  oz);               // 左
  addWall(wallT, innerD,           ox + hw + outer,  oz);               // 右

  // 左右の壁の上に、本家のような小さな窪みブロックを並べる
  if (A.merlons !== false) {
    const merlonMat = mat(C.merlon || 0x15130c, 0.9);
    const n = A.merlonCount || 6;
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n;
      const z = oz - hd + t * innerD;
      [-1, 1].forEach(side => {
        const m = new THREE.Mesh(new THREE.BoxGeometry(wallT * 1.5, wallH * 0.45, innerD / n * 0.62), merlonMat);
        m.position.set(ox + side * (hw + outer), y + wallH + wallH * 0.22, z);
        m.castShadow = true; m.receiveShadow = true;
        g.add(m);
      });
    }
  }

  /* ── ④ 四隅の台座とかがり火 ── */
  if (A.torches !== false) {
    const pedMat = mat(C.pedestal || 0x2e1b0f, 0.9);
    const flameMat = new THREE.MeshBasicMaterial({ color: C.flame || 0xff8a3d, toneMapped: false });
    const pedS = wallT * 2.4;
    [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx, sz]) => {
      const x = ox + sx * (hw + outer), z = oz + sz * (hd + outer);
      const ped = new THREE.Mesh(new THREE.BoxGeometry(pedS, wallH * 1.5, pedS), pedMat);
      ped.position.set(x, y + wallH * 0.75, z);
      ped.castShadow = true; ped.receiveShadow = true;
      g.add(ped);

      // 炎（板ではなく小さな多面体。常に明るく光って見えるよう Basic マテリアル）
      const flame = new THREE.Mesh(new THREE.OctahedronGeometry(pedS * 0.3, 0), flameMat);
      flame.position.set(x, y + wallH * 1.5 + pedS * 0.28, z);
      flame.scale.set(1, 1.5, 1);
      flame.userData.b3dFlame = true;     // アニメーション用の目印
      g.add(flame);

      const light = new THREE.PointLight(C.flame || 0xff8a3d, A.torchIntensity || 0.85, pedS * 9, 2);
      light.position.copy(flame.position);
      g.add(light);
    });
  }

  /* ── ⑤ さらに外側の水面（草地の外周を囲む）── */
  if (A.water !== false) {
    const water = new THREE.Mesh(new THREE.PlaneGeometry(innerW + A.grassMargin*2 + 24, innerD + A.grassMargin*2 + 24),
                                 mat(C.water || 0x060c0d, 0.35, 0.1));
    water.rotation.x = -Math.PI/2;
    water.position.set(ox, y - 0.5, oz);
    g.add(water);
  }

  /* ── 従来の「1枚絵を敷く」方式も残す ── */
  if (A.mode === 'image' && A.image) {
    // 組み立てた地面は消して、画像だけにする
    g.clear();
    const planeGeo = new THREE.PlaneGeometry(1,1);
    const catcher = new THREE.Mesh(planeGeo, new THREE.ShadowMaterial({ opacity:0.34 }));
    catcher.rotation.x = -Math.PI/2;
    catcher.position.set(ox, y, oz);
    catcher.scale.set(A.width, A.depth, 1);
    catcher.receiveShadow = true;
    g.add(catcher);
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin && loader.setCrossOrigin('anonymous');
    loader.load(A.image, (tex) => {
      b3dSetSRGB(tex);
      tex.minFilter = THREE.LinearFilter; tex.magFilter = THREE.LinearFilter;
      tex.anisotropy = (renderer && renderer.capabilities && renderer.capabilities.getMaxAnisotropy) ? renderer.capabilities.getMaxAnisotropy() : 1;
      const ground = new THREE.Mesh(planeGeo, new THREE.MeshBasicMaterial({ map:tex, toneMapped:false }));
      ground.rotation.x = -Math.PI/2;
      ground.position.set(ox, y - 0.01, oz);
      ground.scale.set(A.width, A.depth, 1);
      g.add(ground);
    }, undefined, () => {});
  }

  return g;
}

const B3D_HEX_EDGE_COLOR = 0x7fd8ff;      // 自陣グリッド線（水色）
const B3D_HEX_EDGE_OPACITY = 0.55;
/* カーソルが乗ったマスの光る色。グリッド線とは別に持たせてあるので、
   線の色を変えてもハイライトの色は変わらない。 */
const B3D_HEX_HOVER_COLOR = 0xffe9a8;
const B3D_HEX_HOVER_OPACITY = 0.18;
const B3D_COST = { 1:0x9aa7b5, 2:0x2ec77e, 3:0x2f9bff, 4:0xc46bff, 5:0xf4c04a };
const B3D_COST_CSS = { 1:'#9aa7b5', 2:'#2ec77e', 3:'#2f9bff', 4:'#c46bff', 5:'#f4c04a' };

/* テクスチャを sRGB として扱う（r128=encoding / r152+=colorSpace の両対応） */
function b3dSetSRGB(t){
  if(!t) return t;
  if(THREE.SRGBColorSpace !== undefined) t.colorSpace = THREE.SRGBColorSpace;
  else if(THREE.sRGBEncoding !== undefined) t.encoding = THREE.sRGBEncoding;
  return t;
}
function b3dRoundRect(g,x,y,w,h,r){ g.beginPath(); g.moveTo(x+r,y); g.arcTo(x+w,y,x+w,y+h,r); g.arcTo(x+w,y+h,x,y+h,r); g.arcTo(x,y+h,x,y,r); g.arcTo(x,y,x+w,y,r); g.closePath(); }

function b3dStandeeTexture(unit, boardIcon){
  const cv=document.createElement('canvas'); cv.width=256; cv.height=320; const g=cv.getContext('2d');
  const cost=B3D_COST_CSS[unit.cost]||'#9aa7b5';
  const draw=(imgEl)=>{ g.clearRect(0,0,256,320);
    g.fillStyle='#0c1626'; b3dRoundRect(g,8,8,240,304,20); g.fill();
    if(imgEl){ g.save(); b3dRoundRect(g,16,16,224,224,16); g.clip(); g.drawImage(imgEl,16,16,224,224); g.restore(); }
    else { g.fillStyle=cost+'33'; b3dRoundRect(g,16,16,224,224,16); g.fill();
      g.fillStyle=cost; g.font='900 96px Orbitron, sans-serif'; g.textAlign='center'; g.textBaseline='middle';
      g.fillText((unit.jaName||unit.name||'?')[0],128,128); }
    g.lineWidth=6; g.strokeStyle=cost; b3dRoundRect(g,8,8,240,304,20); g.stroke();
    g.fillStyle='#e6edf7'; g.font='900 30px "Noto Sans JP", sans-serif'; g.textAlign='center'; g.textBaseline='middle';
    g.fillText(unit.jaName||unit.name||'',128,276); tex.needsUpdate=true; };
  const tex=new THREE.CanvasTexture(cv); b3dSetSRGB(tex); draw(null);
  try{ const im=new Image(); im.crossOrigin='anonymous'; im.onload=()=>draw(im); im.onerror=()=>{}; im.src=boardIcon(unit.id); }catch(e){}
  return tex;
}
function b3dStarTexture(star){
  const cv=document.createElement('canvas'); cv.width=192; cv.height=48; const g=cv.getContext('2d');
  g.font='900 40px Orbitron, sans-serif'; g.textAlign='center'; g.textBaseline='middle';
  g.fillStyle=star>=3?'#f4c04a':(star>=2?'#d7dbe2':'#c98b52');
  g.strokeStyle='rgba(0,0,0,.8)'; g.lineWidth=5;
  const s='★'.repeat(Math.max(1,Math.min(3,star||1))); g.strokeText(s,96,26); g.fillText(s,96,26);
  const t=new THREE.CanvasTexture(cv); b3dSetSRGB(t); return t;
}
function b3dMakeBase(unit){

}
function b3dMakeStandee(unit, boardIcon){
  const R=B3D.R; const spr=new THREE.Sprite(new THREE.SpriteMaterial({map:b3dStandeeTexture(unit,boardIcon),transparent:true}));
  spr.scale.set(R*1.35,R*1.35*1.25,1); spr.position.y=B3D.TOP+0.14+R*0.78; spr.userData.b3dSprite=true; return spr;
}
function b3dMakeStars(star){
  const R=B3D.R; const spr=new THREE.Sprite(new THREE.SpriteMaterial({map:b3dStarTexture(star),transparent:true}));
  spr.scale.set(R*1.1,R*0.28,1); spr.position.y=B3D.TOP+0.14+R*3.0; return spr;
}
/* 🎒 装備アイテムは駒の頭上に表示する。
   ⚠ WebGLのテクスチャに外部画像を使うにはCDN側のCORS対応が必要で、現状は通らない
     （そのため以前は画像が出ずに文字だけになっていた）。
     ここではHTMLのアイコンを3D画面に重ねて、3D座標に追従させる方式にしている。 */
const B3D_ITEM_Y = 2.5;        // 頭上の表示高さ（ワールド単位）
const B3D_ITEM_PX = 34;        // アイコン1個の大きさ（画面上のピクセル）
const B3D_ITEM_GAP_PX = 4;     // アイコン同士の間隔

const B3D_ITEM_BORDER = (it) =>
  it?.type==='artifact' ? '#dc3545'
  : it?.type==='radiant' ? '#f0d074'
  : it?.type==='consumable' ? '#7fd0ff'
  : it?.type==='comp' ? '#9fb0c8' : '#d4af37';

function b3dItemsSig(u){ return (u && u.items || []).filter(Boolean).map(it=>it.id||it.name||'?').join(','); }

/* 駒の頭上に出すアイコン列（HTML）を作り直す */
function b3dBuildItemDom(S, key, u, itemIcon){
  if(!S || !S.itemLayer) return;
  let box = S.itemDom.get(key);
  if(!box){
    box = document.createElement('div');
    box.style.cssText = 'position:absolute;display:flex;gap:'+B3D_ITEM_GAP_PX+'px;transform:translate(-50%,-50%);pointer-events:none;will-change:transform;';
    S.itemLayer.appendChild(box);
    S.itemDom.set(key, box);
  }
  const list = (u && u.items || []).filter(Boolean).slice(0,3);
  box.innerHTML = list.map(it => {
    const url = (itemIcon && itemIcon(it)) || '';
    const col = B3D_ITEM_BORDER(it);
    const label = String(it.jaName || it.name || '?').slice(0,1);
    return '<div title="'+String(it.jaName||it.name||'').replace(/"/g,'')+'" style="width:'+B3D_ITEM_PX+'px;height:'+B3D_ITEM_PX+'px;border-radius:7px;'
      + 'border:2px solid '+col+';background:#0c1626;box-shadow:0 2px 6px rgba(0,0,0,.5);overflow:hidden;'
      + 'display:flex;align-items:center;justify-content:center;color:'+col+';font:900 15px \'Noto Sans JP\',sans-serif">'
      + (url ? '<img src="'+url+'" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display=\'none\'">' : label)
      + '</div>';
  }).join('');
  box.style.display = list.length ? 'flex' : 'none';
}

/* 装備の増減は駒を作り直さず、頭上の表示だけ差し替える（モデルの再読込を避けるため） */
function b3dRefreshItems(g, u, itemIcon, S, key){
  const sig = b3dItemsSig(u);
  if(g.userData.itemsSig === sig) return;
  g.userData.itemsSig = sig;
  if(S && key) b3dBuildItemDom(S, key, u, itemIcon);
}

/* 毎フレーム、3Dの駒の頭上に来るようアイコンの位置を合わせる */
function b3dSyncItemDom(S){
  if(!S || !S.itemLayer || !S.itemDom.size) return;
  const el = S.renderer.domElement;
  const w = el.clientWidth || 1, h = el.clientHeight || 1;
  const v = new THREE.Vector3();
  S.itemDom.forEach((box, key) => {
    const g = S.pieces.get(key);
    if(!g || !g.parent){ box.style.display='none'; return; }
    if(box.childElementCount === 0){ box.style.display='none'; return; }
    v.set(0, B3D_ITEM_Y, 0);
    g.localToWorld(v);
    v.project(S.camera);
    if(v.z > 1){ box.style.display='none'; return; }   // カメラの後ろ
    box.style.display = 'flex';
    box.style.left = ((v.x + 1) / 2 * w) + 'px';
    box.style.top  = ((-v.y + 1) / 2 * h) + 'px';
  });
}

/* 駒が消えたときにアイコンも片付ける */
function b3dRemoveItemDom(S, key){
  if(!S || !S.itemDom) return;
  const box = S.itemDom.get(key);
  if(box){ box.remove(); S.itemDom.delete(key); }
}

/* 🎯 チャンピオンごとの3Dモデル微調整
   ── 自動の中心合わせでズレる場合はここに書く。キーは champ.id。
      x / z : 六角形中心からの左右・前後のズレ補正
      y     : 高さ（浮く・沈む場合）
      scale : 大きさの倍率（1が既定）
      rotY  : 向き（ラジアン。Math.PI で180度）
   例: hecarim: { x:0.1, z:-0.05, scale:1.1 } */
const CHAMP_MODEL_TUNE = {
  akali: { scale:0.89, z:0.98 },   // アカリ
  cinderling: { scale:0.35 },   // シンダーリング
  karma: { scale:1.1 },   // カルマ
  kobuko: { scale:0.71, x:0.4, z:0.01 },   // コブコ
  leona: { z:-0.75 },   // レオナ
  ornn: { z:-0.66 },   // オーン
  pebbles: { scale:0.71, z:0.14 },   // 小石
  rakan: { x:-0.27, z:-0.19 },   // ラカン
  reksai: { scale:0.79, x:0.22 },   // レク＝サイ
  varus: { scale:1.2, y:-0.29, z:0.8 },   // ヴァルス
  veigar: { scale:0.82 },   // ベイガー
  xayah: { z:-0.3 },   // ザヤ
  yorick: { scale:1.24, x:0.2, y:-0.17, z:-0.46 },   // ヨリック
  caitlyn: { scale:0.87 },   // ケイトリン
  elise: { x:-0.14, z:0.19 },   // エリス
  gromp: { scale:0.69, x:-0.14, y:-0.24 },   // グロンプ
  kayle: { x:-0.01, y:-0.48, rotY:-21 * Math.PI/180 },   // ケイル
  leblanc: { scale:1.11, x:0.45, y:-0.2 },   // ルブラン
  murkwolf: { scale:0.49, x:-0.19, rotY:2 * Math.PI/180 },   // マークウルフ
  scuttlecrab: { scale:0.7 },   // スカトルクラブ
  sejuani: { scale:1.18, y:-0.13 },   // セジュアニ
  teemo: { scale:0.7, x:0.22, z:0.07 },   // ティーモ
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

/* 足元（下から25%）の重心を求める。武器やエフェクトが横に張り出したモデルでも
   外接箱の中心ではなく「立っている位置」を中心として扱えるようにするため。 */
function b3dFootprintCenter(obj){
  const box=new THREE.Box3().setFromObject(obj);
  const size=new THREE.Vector3(); box.getSize(size);
  const yCut = box.min.y + Math.max(1e-4, size.y*0.25);
  const v=new THREE.Vector3();
  let sx=0, sz=0, n=0;
  obj.updateMatrixWorld(true);
  obj.traverse(m=>{
    if(!m.isMesh || !m.geometry || !m.geometry.attributes || !m.geometry.attributes.position) return;
    const pos=m.geometry.attributes.position;
    const step=Math.max(1, Math.floor(pos.count/600));   // 間引いて走査（重いモデル対策）
    for(let i=0;i<pos.count;i+=step){
      v.fromBufferAttribute(pos,i); m.localToWorld(v);
      if(v.y<=yCut){ sx+=v.x; sz+=v.z; n++; }
    }
  });
  if(!n){ const c=new THREE.Vector3(); box.getCenter(c); return { x:c.x, z:c.z }; }
  return { x:sx/n, z:sz/n };
}

function b3dFitModel(obj, champId){
  const tune = (champId && CHAMP_MODEL_TUNE[champId]) || {};

  // 1. 初期化
  obj.position.set(0, 0, 0);
  obj.rotation.set(0, 0, 0);
  obj.scale.set(1, 1, 1);
  if(tune.rotY) obj.rotation.y = tune.rotY;

  // 2. スケーリング（高さを基準にそろえる）
  const box = new THREE.Box3().setFromObject(obj);
  const size = new THREE.Vector3();
  box.getSize(size);
  const height = size.y || 1;
  const targetHeight = B3D.R * 2.3 * (tune.scale || 1);
  obj.scale.setScalar(targetHeight / height);

  // 3. 位置合わせ：足元の重心を六角形の中心に、底面をマスの上面に置く
  obj.updateMatrixWorld(true);
  const foot = b3dFootprintCenter(obj);
  const scaledBox = new THREE.Box3().setFromObject(obj);
  obj.position.x = -foot.x + (tune.x || 0);
  obj.position.z = -foot.z + (tune.z || 0);
  obj.position.y = B3D.TOP - scaledBox.min.y + (tune.y || 0);

  // 4. マテリアル・影設定
  obj.traverse(n => {
    if(n.isMesh) {
      n.castShadow = true;
      if(n.material) {
        if(n.material.metalness !== undefined) n.material.metalness = 0.0;
        if(n.material.roughness !== undefined) n.material.roughness = 0.8;
      }
    }
  });
}
function b3dMakeAnvil(u){
  // 🔨 金床：チャンピオンではないので簡易マーカーで表示（見えないと置き場所を見失うため）
  const col = new THREE.Color(u.color || '#d9a05b');
  const g=new THREE.Group();
  const body=new THREE.Mesh(new THREE.BoxGeometry(B3D.R*0.72,B3D.R*0.42,B3D.R*0.56),
    new THREE.MeshStandardMaterial({color:col,metalness:0.75,roughness:0.35,emissive:col,emissiveIntensity:0.25}));
  body.position.y=B3D.TOP+0.24; body.castShadow=true; g.add(body);
  const foot=new THREE.Mesh(new THREE.CylinderGeometry(B3D.R*0.38,B3D.R*0.44,0.12,20),
    new THREE.MeshStandardMaterial({color:0x2a3a55,metalness:0.5,roughness:0.6}));
  foot.position.y=B3D.TOP+0.06; g.add(foot);
  return g;
}
/* ── モデル読み込みキャッシュ ──
   同じ .glb を何度も取りに行かないよう保持する。移動や★アップのたびに再読込すると
   立て看板が一瞬見えてしまうため。 */
const b3dModelCache = new Map();   // url -> { gltf } / Promise
const b3dFailedModels = new Set();   // 取得できなかったURL（毎回リトライしないよう記録）
/* 🚚 モデルの先読み。ショップから盤面に出した瞬間に「読み込み待ち」が起きないよう、
   3D表示を開いた時点で全チャンピオン分を裏で取っておく（同時数を絞って負荷を抑える）。 */
let b3dPreloadStarted = false;
function b3dPreloadModels(champs, champModels, limit){
  if(b3dPreloadStarted) return; b3dPreloadStarted = true;
  const list = (champs || []).map(c => c.model || (champModels && champModels[c.id]) || b3dAutoModelUrl(c.id)).filter(Boolean);
  const urls = [...new Set(list)];
  let i = 0;
  const next = () => {
    if(i >= urls.length) return;
    const url = urls[i++];
    b3dLoadModelAny(url).catch(()=>{}).then(()=>{ setTimeout(next, 30); });
  };
  for(let k = 0; k < (limit || 4); k++) next();   // 同時 4 本ずつ
}
/* 候補を順に試し、最初に読めたものを返す */
function b3dLoadModelAny(url){
  const cands = b3dModelCandidates(url);
  if(!cands.length) return Promise.reject(new Error('no url'));
  let i = 0;
  const next = () => b3dLoadModel(cands[i]).catch(err => {
    i++; return (i < cands.length) ? next() : Promise.reject(err);
  });
  return next();
}
function b3dLoadModel(url){
  if(b3dFailedModels.has(url)) return Promise.reject(new Error('model unavailable'));
  const hit=b3dModelCache.get(url);
  if(hit && hit.promise) return hit.promise;
  if(hit && hit.gltf) return Promise.resolve(hit.gltf);
  const p=new Promise((res,rej)=>{
    try{ new THREE.GLTFLoader().load(url,(gltf)=>{ b3dModelCache.set(url,{gltf}); res(gltf); }, undefined, rej); }
    catch(e){ rej(e); }
  });
  b3dModelCache.set(url,{promise:p});
  p.catch((err)=>{
    b3dModelCache.delete(url);
    if(b3dFailedModels.has(url)) return;
    b3dFailedModels.add(url);
    // モデル未用意なら立て看板表示にフォールバックする。切り分け用に1回だけ知らせる
    console.info('[Board3D] モデルが見つからないためカード表示にします:', url);
  });
  return p;
}

/* 🔎 モデル設定の一括チェック。ブラウザのコンソールで b3dCheckModels() を実行すると
   どのチャンピオンにモデルが割り当たっているか／実際に取得できるかを一覧表示する。 */
function b3dCheckModels(champs, champModels){
  const list = champs || (typeof CHAMPS!=='undefined' ? CHAMPS : []);
  const map = champModels || CHAMP_MODELS3D;
  const rows = list.map(c => ({ id:c.id, 名前:c.jaName,
    URL: c.model || map[c.id] || b3dAutoModelUrl(c.id),
    出所: c.model ? 'data-champions.js' : (map[c.id] ? 'CHAMP_MODELS3D' : '自動生成') }));
  if(console.table) console.table(rows); else console.log(rows);
  const urls=[...new Set(rows.map(r=>r.URL).filter(Boolean))];
  console.log('[Board3D] 設定済み', urls.length, '件を確認します…');
  urls.forEach(u=>{
    fetch(u, {method:'GET'})
      .then(r=> console.log(r.ok ? '  ✅ OK  ' : '  ❌ ' + r.status + '  ', u))
      .catch(e=> console.log('  ❌ 取得失敗  ', u, e.message));
  });
  return rows;
}
if (typeof window !== 'undefined') window.b3dCheckModels = b3dCheckModels;

/* ── 材質の補正 ──
   three r128 では outputEncoding / texture.encoding を sRGB にしないと暗く沈む。
   加えて metalness が高い素材は環境マップが無いと真っ黒になるため落としておく。

   🩹 「体が透ける・パーツが消える・裏側が見える」対策:
   LoLのモデルは髪・マント・羽根などがアルファ抜き（切り抜き）前提で作られているのに、
   glTFに変換すると alphaMode:BLEND（半透明合成）で出てくることが多い。
   半透明は描画順で結果が変わるため、同じモデル内で前後が入れ替わって
   胴体越しに内側が見えたり、パーツが消えたりする。
   → 半透明扱いをやめて alphaTest（切り抜き）に変換し、深度も書かせる。
     本当に半透明にしたいエフェクト系（glow/vfx等）だけは名前で除外する。 */
const B3D_KEEP_BLEND = /glow|vfx|_fx|flame|fire|smoke|particle|beam|aura|trail|light/i;

/* 🔬 テクスチャのアルファを実際に覗いて、どう扱うべきか判定する。
   ── 名前だけで判断すると、体や顔のテクスチャ（アルファをスペキュラ用マスクに使っている等）まで
      切り抜き扱いになって穴が開く。実データを見れば確実に分けられる。
        opaque … アルファがほぼ全部不透明 → 完全不透明として描く（体・顔はこれ）
        cutout … 0か255にほぼ二極化 → alphaTest で抜く（髪・マント・羽根）
        blend  … 中間値が多い本物の半透明 → エフェクト系だけ半透明のまま
   ── 64x64 に縮めて1回だけ調べ、結果はテクスチャ単位でキャッシュする。 */
const b3dAlphaKindCache = new Map();
function b3dTextureAlphaKind(tex){
  if(!tex || !tex.image) return 'unknown';
  if(b3dAlphaKindCache.has(tex.uuid)) return b3dAlphaKindCache.get(tex.uuid);
  let kind = 'unknown';
  try{
    const img = tex.image;
    const w = Math.min(64, img.width || 64), h = Math.min(64, img.height || 64);
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    const cx = cv.getContext('2d', { willReadFrequently: true });
    cx.drawImage(img, 0, 0, w, h);
    const d = cx.getImageData(0, 0, w, h).data;
    let min = 255, mid = 0, n = 0;
    for(let i = 3; i < d.length; i += 4){
      const a = d[i];
      if(a < min) min = a;
      if(a > 30 && a < 220) mid++;
      n++;
    }
    if(min >= 250) kind = 'opaque';
    else if(n && mid / n < 0.08) kind = 'cutout';
    else kind = 'blend';
  }catch(e){ kind = 'unknown'; }     // CORSで読めない等は判定しない
  b3dAlphaKindCache.set(tex.uuid, kind);
  return kind;
}

function b3dFixMaterials(root){
  root.traverse(n=>{
    if(!n.isMesh && !n.isSkinnedMesh) return;
    // スキニングで頂点が動くと元のバウンディングボックスから外れ、
    // 角度によってパーツごと消える（カリング）ため切っておく
    n.frustumCulled = false;
    n.castShadow = true;      // 🌑 アリーナの地面に影を落とす（接地感が出る）
    if(!n.material) return;
    const mats = Array.isArray(n.material) ? n.material : [n.material];
    mats.forEach(m=>{
      if(!m) return;
      // 🔍 テクスチャを鮮明に：異方性フィルタ＋ミップマップを効かせる
      const sharpen = (t) => {
        if(!t) return;
        if(B3D_QUALITY.anisotropy && B3D_MAX_ANISO > 1) t.anisotropy = B3D_MAX_ANISO;
        if(t.generateMipmaps !== false && THREE.LinearMipmapLinearFilter !== undefined){
          t.minFilter = THREE.LinearMipmapLinearFilter;
        }
        t.needsUpdate = true;
      };
      if(m.map){ b3dSetSRGB(m.map); sharpen(m.map); }
      if(m.emissiveMap){ b3dSetSRGB(m.emissiveMap); sharpen(m.emissiveMap); }
      sharpen(m.normalMap); sharpen(m.roughnessMap); sharpen(m.metalnessMap); sharpen(m.alphaMap);
      if(typeof m.metalness==='number' && m.metalness>0.25) m.metalness=0.15;  // 環境マップ無しの黒化を防ぐ
      if(typeof m.roughness==='number' && m.roughness<0.35) m.roughness=0.6;
      if(m.color && m.color.getHex()===0x000000 && m.map) m.color.setHex(0xffffff); // 黒ベースカラーで潰れるのを回避

      const isVfx = B3D_KEEP_BLEND.test(m.name || '') || B3D_KEEP_BLEND.test(n.name || '');
      const kind  = b3dTextureAlphaKind(m.map);
      if(isVfx && (kind === 'blend' || kind === 'unknown')){
        m.transparent = true; m.depthWrite = false;   // 本物の半透明（エフェクト）だけ残す
      } else if(kind === 'cutout'){
        m.transparent = false; m.alphaTest = m.alphaTest || 0.5; m.depthWrite = true; m.opacity = 1;
      } else if(kind === 'blend'){
        // 体や顔でアルファに中間値が入っている（マスク用途など）。穴が開かないよう最小限だけ抜く
        m.transparent = false; m.alphaTest = 0.02; m.depthWrite = true; m.opacity = 1;
      } else {
        // opaque / 判定不能：完全不透明にして透けを断つ
        m.transparent = false; m.alphaTest = 0; m.depthWrite = true; m.opacity = 1;
      }
      // 抜きのある素材だけ両面（マントや羽根の裏側用）。
      // 完全不透明まで両面にすると、体の内側の面が見えて「透けた」ように見える。
      m.side = (m.alphaTest > 0 || m.transparent) ? THREE.DoubleSide : THREE.FrontSide;
      m.needsUpdate=true;
    });
  });
}

/* ── 🗡️ 余計なパーツの除去 ──
   LoLのモデルは「投擲物（クナイ・矢・弾）」なども同じメッシュに含まれていて、
   ゲーム内ではアニメーションごとにサブメッシュ表示を切り替えて隠している。
   .glb に変換すると全部が出しっぱなしになるため、盤面の下にクナイが落ちていたり、
   矢が空中に浮いたままになる。名前と位置の2段構えで取り除く。

   1) 名前が投擲物っぽいもの（missile / arrow / kunai …）
   2) 本体からぽつんと離れているもの（本体の当たり判定を1.6倍に広げても触れないパーツ）

   ── 消えてほしくないものが消える場合は B3D_KEEP_PARTS にチャンピオンidと
      パーツ名の一部を書けば残せる。逆に残ってしまうものは B3D_HIDE_PARTS に足す。
   ── ブラウザのコンソールで b3dListParts('akali') を実行すると、
      そのモデルのパーツ名・大きさ・除去判定を一覧できる。 */
const B3D_STRAY_NAME = /missile|projectile|\bproj\b|_proj|kunai|shuriken|arrow|bolt|dart|spear_throw|throw|_mis\b|grenade|bomb|orb_cast/i;
const B3D_HIDE_PARTS = {
  // 例) akali: ['kunai'], ashe: ['arrow'],
};
const B3D_KEEP_PARTS = {
  // 例) ashe: ['bow'],   ← 弓は手に持っているので消さない（通常は自動で残ります）
  varus: ['weapon', 'bow', 'arrow'],   // 🏹 ヴァルス: 弓の実パーツ名は 'Weapon1'。本体から離れて持たれているため
                                        //    「本体の箱に触れない＝浮遊パーツ」と誤判定されて消えていた。明示的に保護する。
};
/* 🗡️ 手に持つ装備の一般的なパーツ名。これに当てはまるものは
   「本体から離れている／極小」だけを理由には消さない（明らかな飛翔体名なら消す）。
   ヴァルスの弓 'Weapon1' のように、本体の当たり判定から外れた位置で
   持たれている武器が丸ごと消えるのを防ぐための共通ガード。 */
const B3D_HELD_NAME = /weapon|bow|staff|sword|blade|scythe|hammer|axe|shield|glaive|lantern|book|orb\b/i;

function b3dPruneStrayParts(root, champId){
  const id = String(champId || '').toLowerCase();
  const hideList = (B3D_HIDE_PARTS[id] || []).map(x => x.toLowerCase());
  const keepList = (B3D_KEEP_PARTS[id] || []).map(x => x.toLowerCase());
  const meshes = [];
  root.updateWorldMatrix(true, true);
  root.traverse(n => { if(n.isMesh || n.isSkinnedMesh) meshes.push(n); });
  if(!meshes.length) return [];

  const info = meshes.map(n => {
    const box = new THREE.Box3().setFromObject(n);
    const size = new THREE.Vector3(); box.getSize(size);
    const pos = n.geometry && n.geometry.attributes && n.geometry.attributes.position;
    return { n, box, vol: Math.max(size.x * size.y * size.z, 1e-9),
             verts: pos ? pos.count : 0, name: (n.name || '').toLowerCase() };
  });
  // 頂点数が最大のメッシュ＝本体とみなす（大きいだけの浮遊板を本体と誤認しないため）
  const body = info.reduce((a, b) => (b.verts > a.verts ? b : a), info[0]);
  const bodyBox = body.box.clone();
  const c = new THREE.Vector3(); bodyBox.getCenter(c);
  const sz = new THREE.Vector3(); bodyBox.getSize(sz);
  bodyBox.setFromCenterAndSize(c, sz.multiplyScalar(1.6));   // 手に持った武器を巻き込まない程度に広げる

  const removed = [];
  info.forEach(it => {
    if(it === body) return;
    if(keepList.some(k => it.name.includes(k))) return;
    const byName     = B3D_STRAY_NAME.test(it.name) || hideList.some(k => it.name.includes(k));
    const held       = B3D_HELD_NAME.test(it.name);         // 手持ち装備っぽい名前
    const detached   = !bodyBox.intersectsBox(it.box) && !held;   // 本体から浮いている（手持ち装備は除く）
    const negligible = it.vol < body.vol * 0.00002 && !held;      // 極小のゴミ（手持ち装備は除く）
    if(byName || detached || negligible){
      // three の Box3 は非表示メッシュも含めて計算するので、隠すのではなく外す。
      // 隠すだけだと、浮いたクナイを含めた大きさに合わせて本体が縮んでしまう。
      if(it.n.parent) it.n.parent.remove(it.n); else it.n.visible = false;
      removed.push({ 名前: it.n.name || '(無名)', 理由: byName ? '名前' : (detached ? '本体から離れている' : '極小') });
    }
  });
  return removed;
}

/* 🔎 パーツ一覧の確認用。コンソールで b3dListParts('akali') と打つと中身が見られる */
function b3dListParts(champId){
  const champ = (typeof CHAMPS !== 'undefined' ? CHAMPS : []).find(c => c.id === champId) || {};
  const url = champ.model || (CHAMP_MODELS3D && CHAMP_MODELS3D[champId]) || b3dAutoModelUrl(champId);
  return b3dLoadModelAny(url).then(gltf => {
    const m = (THREE.SkeletonUtils && THREE.SkeletonUtils.clone) ? THREE.SkeletonUtils.clone(gltf.scene) : gltf.scene.clone(true);
    const rows = [];
    m.updateWorldMatrix(true, true);
    m.traverse(n => {
      if(!(n.isMesh || n.isSkinnedMesh)) return;
      const b = new THREE.Box3().setFromObject(n), sz = new THREE.Vector3(); b.getSize(sz);
      const c = new THREE.Vector3(); b.getCenter(c);
      rows.push({ パーツ名: n.name || '(無名)',
                  幅: +sz.x.toFixed(2), 高さ: +sz.y.toFixed(2), 奥行: +sz.z.toFixed(2),
                  中心: `${c.x.toFixed(1)},${c.y.toFixed(1)},${c.z.toFixed(1)}`,
                  材質: Array.isArray(n.material) ? n.material.map(x => x.name).join(',') : (n.material && n.material.name) || '' });
    });
    const removed = b3dPruneStrayParts(m, champId);
    const gone = new Set(removed.map(r => r.名前));
    rows.forEach(r => { r.判定 = gone.has(r.パーツ名) ? '✕ 除去' : '○ 表示'; });
    if(console.table) console.table(rows); else console.log(rows);
    console.log('除去したパーツ:', removed);
    return rows;
  });
}
if (typeof window !== 'undefined') window.b3dListParts = b3dListParts;

/* ── 読み込んだモデルを駒に取り付ける（複製して使う） ── */
function b3dAttachModel(S, g, key, gltf, champId){
  let m;
  if(THREE.SkeletonUtils && THREE.SkeletonUtils.clone) m=THREE.SkeletonUtils.clone(gltf.scene);
  else m=gltf.scene.clone(true);
  b3dPruneStrayParts(m, champId);   // 先に余計なパーツを消す（大きさ・位置の計算が狂うため）
  b3dFitModel(m, champId);
  b3dFixMaterials(m);
  if(gltf.animations && gltf.animations.length>0){
    const mixer=new THREE.AnimationMixer(m);
    const clip = gltf.animations.find(c=>c.name.toLowerCase().includes('idle1'))
      || gltf.animations.find(c=>c.name.toLowerCase().includes('idle'))
      || gltf.animations[0];
    mixer.clipAction(clip).play();
    S.mixers.set(key, mixer);
  }
  g.children.filter(c=>c.userData&&c.userData.b3dSprite).forEach(c=>g.remove(c));
  g.add(m);
}

/* 📐 盤面全体が画面いっぱいに収まる位置へカメラを合わせる。
   画面サイズやアスペクト比が変わっても余白が最小になるよう、距離を二分探索で詰める。 */
function b3dFitCamera(S){
  const { camera, controls, boardGroup } = S;
  // オーバーレイ（左パネル・右パネル・ショップ）に隠れない範囲を「見える枠」として扱う。
  // これをしないと、パネルの下に盤面が潜り込んで位置がずれて見える。
  const ins = S.insets || { left:0, right:0, top:0, bottom:0 };
  const W = (S.viewSize && S.viewSize.w) || 1, H = (S.viewSize && S.viewSize.h) || 1;
  const ndcL = -1 + (ins.left / W) * 2,  ndcR = 1 - (ins.right / W) * 2;
  const ndcB = -1 + (ins.bottom / H) * 2, ndcT = 1 - (ins.top / H) * 2;
  const cxWant = (ndcL + ndcR) / 2, cyWant = (ndcB + ndcT) / 2;
  const halfWNdc = Math.max(0.15, (ndcR - ndcL) / 2), halfHNdc = Math.max(0.15, (ndcT - ndcB) / 2);
  const box = new THREE.Box3().setFromObject(boardGroup);
  if(box.isEmpty()) return;
  box.max.y += 2.3;                       // 駒の高さ分の余白を確保
  const corners = [
    new THREE.Vector3(box.min.x,box.min.y,box.min.z), new THREE.Vector3(box.max.x,box.min.y,box.min.z),
    new THREE.Vector3(box.min.x,box.max.y,box.min.z), new THREE.Vector3(box.max.x,box.max.y,box.min.z),
    new THREE.Vector3(box.min.x,box.min.y,box.max.z), new THREE.Vector3(box.max.x,box.min.y,box.max.z),
    new THREE.Vector3(box.min.x,box.max.y,box.max.z), new THREE.Vector3(box.max.x,box.max.y,box.max.z),
  ];
  const elev = 46 * Math.PI/180;
  const dir = new THREE.Vector3(0, Math.sin(elev), Math.cos(elev)).normalize();
  const target = new THREE.Vector3(); box.getCenter(target);
  const m = new THREE.Matrix4();

  const place = (d) => {
    camera.position.copy(target).addScaledVector(dir, d);
    camera.lookAt(target);
    camera.updateMatrixWorld(true); camera.updateProjectionMatrix();
    m.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
  };
  // 画面内に収まっているか（余白 3%）
  const fits = (d) => { place(d);
    return corners.every(c => { const p=c.clone().applyMatrix4(m);
      return Math.abs(p.x - cxWant) <= halfWNdc*0.97 && Math.abs(p.y - cyWant) <= halfHNdc*0.97 && p.z<1; }); };
  // 投影後の見た目の中心（NDC）
  const projCenter = () => {
    let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
    corners.forEach(c=>{ const p=c.clone().applyMatrix4(m);
      minX=Math.min(minX,p.x); maxX=Math.max(maxX,p.x); minY=Math.min(minY,p.y); maxY=Math.max(maxY,p.y); });
    return { x:(minX+maxX)/2, y:(minY+maxY)/2 };
  };

  let d = 30;
  // 距離を詰める → 画面中央に来るよう注視点をずらす、を数回繰り返して収束させる
  for(let pass=0; pass<4; pass++){
    let lo=1, hi=200;
    if(!fits(hi)) hi=600;
    for(let i=0;i<40;i++){ const mid=(lo+hi)/2; if(fits(mid)) hi=mid; else lo=mid; }
    d = hi; place(d);
    const c = projCenter();
    const dx = c.x - cxWant, dy = c.y - cyWant;
    if(Math.abs(dx)<0.002 && Math.abs(dy)<0.002) break;
    // NDC のズレをワールド座標の移動量に変換して注視点を補正
    const halfH = d * Math.tan((camera.fov*Math.PI/180)/2);
    const halfW = halfH * camera.aspect;
    const right = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0);
    const up    = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 1);
    target.addScaledVector(right, dx * halfW).addScaledVector(up, dy * halfH);
  }
  place(d);
  controls.target.copy(target);
  controls.update();
  S.defaultCam = { pos: camera.position.clone(), target: target.clone() };
}

/* 💾 保存済みの視点（管理者が決めた既定アングル）を適用する。
   savedView = { pos:[x,y,z], target:[x,y,z] } */
function b3dApplySavedView(S, savedView){
  const ok = (a) => Array.isArray(a) && a.length === 3 && a.every(n => typeof n === 'number' && isFinite(n));
  if(!S || !S.camera || !S.controls || !savedView || !ok(savedView.pos) || !ok(savedView.target)) return false;
  const { camera, controls } = S;
  // ⚠ 保存された位置をそのまま使う。
  //    以前は「盤面全体が収まるまで引く」補正を入れていたが、
  //    寄せて保存したい場合まで引き戻されてしまうため廃止した。
  camera.position.set(savedView.pos[0], savedView.pos[1], savedView.pos[2]);
  controls.target.set(savedView.target[0], savedView.target[1], savedView.target[2]);
  camera.lookAt(controls.target);
  camera.updateMatrixWorld(true); camera.updateProjectionMatrix(); controls.update();
  S.defaultCam = { pos: camera.position.clone(), target: controls.target.clone() };
  return true;
}

/* 現在の視点を保存できる形（小数2桁）で取り出す */
function b3dReadView(S){
  if(!S || !S.camera || !S.controls) return null;
  const r = (v)=>Math.round(v*100)/100;
  return { pos:[r(S.camera.position.x), r(S.camera.position.y), r(S.camera.position.z)],
           target:[r(S.controls.target.x), r(S.controls.target.y), r(S.controls.target.z)] };
}

/* ⬆⬇ 盤面の高さを微調整する（カメラと注視点を一緒に上下させる） */
function b3dNudgeView(S, dy){
  if(!S || !S.camera || !S.controls) return false;
  S.camera.position.y += dy;
  S.controls.target.y += dy;
  S.camera.lookAt(S.controls.target);
  S.camera.updateMatrixWorld(true); S.camera.updateProjectionMatrix(); S.controls.update();
  S.defaultCam = { pos:S.camera.position.clone(), target:S.controls.target.clone() };
  return true;
}

function b3dDispose(g){
  g.traverse(n=>{ if(n.geometry&&n.geometry.dispose) n.geometry.dispose();
    if(n.material){ const ms=Array.isArray(n.material)?n.material:[n.material];
      ms.forEach(mt=>{ if(mt.map&&mt.map.dispose) mt.map.dispose(); if(mt.dispose) mt.dispose(); }); } });
}
function b3dSync(S, board, bench, boardIcon, champModels, itemIcon){
  const { boardGroup, slots, pieces } = S;

  // ── 1) 各スロットに「本来あるべき駒」を割り出す
  const want=new Map();
  slots.forEach(h=>{
    const { kind, idx } = h.userData;
    const src = (kind==='bench') ? bench : board;
    const u = (src && src[idx]) || null;
    if(!u) return;
    const isAnvil = !!u.isAnvil;
    const modelUrl = !isAnvil ? (u.model || (champModels && champModels[u.id]) || b3dAutoModelUrl(u.id)) : '';
    const sig=`${u.uid||u.id}|${isAnvil?'anvil':u.star}|${modelUrl}`;   // アイテムは別途更新するので含めない
    want.set(kind+':'+idx, { slot:h, kind, idx, u, isAnvil, modelUrl, sig });
  });

  // ── 2) 既にある駒を sig で引けるようにする（同じ駒が別マスへ移動した場合の受け皿）
  const bySig=new Map();
  pieces.forEach((g,k)=>{ const s=g.userData.sig; if(!bySig.has(s)) bySig.set(s,[]); bySig.get(s).push(k); });

  // ── 3) 移動：同じ駒が別スロットに現れたら、作り直さずそのまま動かす（モデル再読込のちらつき防止）
  const moved=new Map();
  const movedMixers=new Map();   // 移動後のキー → ミキサー
  const movedFromKeys=[];       // 移動元のキー（あとでまとめて消す）
  want.forEach((w,key)=>{
    const cur=pieces.get(key);
    if(cur && cur.userData.sig===w.sig) return;           // 変化なし
    const cands=bySig.get(w.sig);
    if(!cands || !cands.length) return;
    // 別スロットにいる同一の駒を探す（そのスロットがもう同じ駒を必要としていない場合のみ）
    const fromKey=cands.find(k=>{ if(k===key) return false;
      const stillWanted=want.get(k); return !(stillWanted && stillWanted.sig===w.sig); });
    if(!fromKey) return;
    const g=pieces.get(fromKey); if(!g) return;
    cands.splice(cands.indexOf(fromKey),1);
    pieces.delete(fromKey);
    const home={x:w.slot.userData.x, y:w.slot.userData.y||0, z:w.slot.userData.z};
    g.position.set(home.x,home.y,home.z);
    g.userData.home=home; g.userData.kind=w.kind; g.userData.idx=w.idx;
    moved.set(key,g);
    // ⚠ ここで S.mixers を直接書き換えると、駒を入れ替えたときに
    //    先に移した側のミキサーを後の移動が上書きして消してしまい、待機アニメが止まる。
    //    いったん控えておき、全部の移動を決めてから反映する。
    if(S.mixers && S.mixers.has(fromKey)) movedMixers.set(key, S.mixers.get(fromKey));
    movedFromKeys.push(fromKey);
    b3dRemoveItemDom(S, fromKey); g.userData.itemsSig=null;
  });
  if(S.mixers){
    movedFromKeys.forEach(k=>S.mixers.delete(k));
    movedMixers.forEach((mx,key)=>S.mixers.set(key,mx));
  }
  moved.forEach((g,key)=>{ pieces.set(key,g); const w=want.get(key); if(w) b3dRefreshItems(g, w.u, itemIcon, S, key); });

  // ── 4) 残り（新規作成・削除）を処理
  slots.forEach(h=>{
    const { kind, idx } = h.userData;
    const key = kind + ':' + idx;
    const w = want.get(key);
    const u = w ? w.u : null;
    const isAnvil = w ? w.isAnvil : false;
    const modelUrl = w ? w.modelUrl : '';
    const sig = w ? w.sig : null;
    const cur=pieces.get(key);
    if(cur && cur.userData.sig===sig){ if(u) b3dRefreshItems(cur, u, itemIcon, S, key); return; }
    if(cur){ 
       boardGroup.remove(cur); 
       b3dDispose(cur); 
       pieces.delete(key); 
       b3dRemoveItemDom(S, key);
       if (S.mixers.has(key)) {
          S.mixers.get(key).stopAllAction();
          S.mixers.delete(key); // 🌟 ミキサーを削除
       }
    }
    if(!u) return;
    const g=new THREE.Group(); g.position.set(h.userData.x,h.userData.y||0,h.userData.z);
    g.userData.sig=sig; g.userData.kind=kind; g.userData.idx=idx; g.userData.home={x:h.userData.x,y:h.userData.y||0,z:h.userData.z};
    if(isAnvil){
      g.add(b3dMakeAnvil(u));
      g.userData.spawnT=0; boardGroup.add(g); pieces.set(key,g);
      if(S.spawning) S.spawning.add(g);
      return;
    }
    const base=b3dMakeBase(u); if(base) g.add(base);   // 台座（空実装なら何も足さない）
    if(modelUrl && THREE.GLTFLoader){
      const cached = b3dModelCandidates(modelUrl).map(u=>b3dModelCache.get(u)).find(c=>c&&c.gltf);
      if(b3dModelCandidates(modelUrl).every(u=>b3dFailedModels.has(u))){
        g.add(b3dMakeStandee(u,boardIcon));       // 取得できないと分かっているものは即カード表示
      } else if(cached && cached.gltf){
        // 読み込み済み：立て看板を挟まずそのままモデルを出す（ちらつき防止）
        b3dAttachModel(S, g, key, cached.gltf, u.id);
      } else {
        // ⚠ ここで立て看板を出すと、ショップから出した瞬間にカードが一瞬見えてしまう。
        //    モデルが用意されている駒は、読み込みが終わるまで何も出さずに待つ。
        b3dLoadModelAny(modelUrl).then(gltf=>{
          if(!g.parent) return;               // 待っている間に消えていたら何もしない
          b3dAttachModel(S, g, key, gltf, u.id);
        }).catch(()=>{ if(g.parent && !g.children.some(c=>c.userData&&c.userData.b3dSprite)) g.add(b3dMakeStandee(u,boardIcon)); });
      }
    } else {
      g.add(b3dMakeStandee(u,boardIcon));
    }
    g.add(b3dMakeStars(u.star));
    g.userData.itemsSig = null; b3dRefreshItems(g, u, itemIcon, S, key);
    g.userData.spawnT=0;
    boardGroup.add(g); pieces.set(key,g);
    if(S.spawning) S.spawning.add(g);
  });
}

function Board3D({ board, bench, boardIcon, itemIcon, champs, champModels, onSlotClick, onPickup, onDropSlot, onCancel, selected, freeView, savedView, viewApi, insets, onDropOutside, onHoverSlot, onDomDrop }) {
  const mountRef = useRef3D(null);
  const S = useRef3D(null);
  const cbRef = useRef3D(onSlotClick);
  const pickRef = useRef3D(onPickup);
  const dropRef = useRef3D(onDropSlot);
  const cancelRef = useRef3D(onCancel);
  const savedViewRef = useRef3D(savedView);
  const insetsRef = useRef3D(insets);
  const outsideRef = useRef3D(onDropOutside);
  const domDropRef = useRef3D(onDomDrop);
  const hoverRef = useRef3D(onHoverSlot);
  useEffect3D(()=>{ outsideRef.current=onDropOutside; hoverRef.current=onHoverSlot; domDropRef.current=onDomDrop; }, [onDropOutside, onHoverSlot, onDomDrop]);
  // オーバーレイに隠れない範囲が変わったら、その枠の中央に収め直す
  useEffect3D(()=>{ insetsRef.current=insets; const s=S.current; if(!s) return;
    s.insets = insets || {left:0,right:0,top:0,bottom:0};
    if(!s.freeView && !savedViewRef.current) b3dFitCamera(s);
  }, [insets && insets.left, insets && insets.right, insets && insets.top, insets && insets.bottom]);
  const [failed, setFailed] = useState3D(false);
  useEffect3D(()=>{ savedViewRef.current = savedView; }, [savedView]);

  // 親（app.js）から視点を読み書きできるようにする
  useEffect3D(()=>{
    if(!viewApi) return;
    viewApi.current = {
      getView: () => b3dReadView(S.current),
      // v に null を渡すと「保存された見え方」を解除する（視点リセット用）
      applyView: (v) => { if(v == null){ savedViewRef.current = null; if(S.current) S.current.defaultCam = null; return true; }
        return b3dApplySavedView(S.current, v); },
      fitToScreen: () => { if(S.current) b3dFitCamera(S.current); },
      // 画面座標 → 盤面/ベンチのマス。2D側からのドラッグ（アイテム装備など）で使う
      slotAt: (clientX, clientY) => {
        const st = S.current; if(!st || !st.renderer) return null;
        const b = st.renderer.domElement.getBoundingClientRect();
        if(clientX < b.left || clientX > b.right || clientY < b.top || clientY > b.bottom) return null;
        const p = new THREE.Vector2(((clientX-b.left)/b.width)*2-1, -((clientY-b.top)/b.height)*2+1);
        const r = new THREE.Raycaster(); r.setFromCamera(p, st.camera);
        const hit = r.intersectObjects(st.slots, false)[0];
        return hit ? { kind: hit.object.userData.kind, idx: hit.object.userData.idx } : null;
      },
      nudge: (dy) => b3dNudgeView(S.current, dy),
    };
    return ()=>{ if(viewApi) viewApi.current = null; };
  }, [viewApi]);
  useEffect3D(()=>{ cbRef.current=onSlotClick; pickRef.current=onPickup; dropRef.current=onDropSlot; cancelRef.current=onCancel; },
    [onSlotClick,onPickup,onDropSlot,onCancel]);

  useEffect3D(() => {
    if (typeof THREE === 'undefined' || !THREE.WebGLRenderer) { setFailed(true); return; }
    const mount = mountRef.current; if (!mount) return;
    let s;
    try {
      const W = mount.clientWidth || 640, H = mount.clientHeight || 460;
      const scene = new THREE.Scene(); scene.background = null;
      const camera = new THREE.PerspectiveCamera(45, W/H, 0.1, 500); camera.position.set(0, 11.5, 14);
      const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
      renderer.setSize(W, H); renderer.setPixelRatio(b3dPixelRatio());
      if (renderer.capabilities && renderer.capabilities.getMaxAnisotropy) B3D_MAX_ANISO = renderer.capabilities.getMaxAnisotropy();
      renderer.shadowMap.enabled = true; if (THREE.PCFSoftShadowMap) renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      // 色空間：r128 は outputEncoding、r152+ は outputColorSpace。両対応にしないとモデルが暗くなる
      if (THREE.SRGBColorSpace !== undefined) renderer.outputColorSpace = THREE.SRGBColorSpace;
      else if (THREE.sRGBEncoding !== undefined) renderer.outputEncoding = THREE.sRGBEncoding;
      renderer.physicallyCorrectLights = false;
      /* 🌗 トーンマッピング。これが無いと明るい面（石畳・石壁など）が
         そのまま 1.0 で頭打ちになり、真っ白に飛んでしまう。 */
      if (B3D_LIGHT.toneMapping && THREE.ACESFilmicToneMapping !== undefined) {
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = B3D_LIGHT.exposure;
      }
      mount.appendChild(renderer.domElement);
      // 装備アイテムのアイコンを3Dの上に重ねる層（CORS不要でCDN画像をそのまま出せる）
      const itemLayer=document.createElement('div');
      itemLayer.style.cssText='position:absolute;inset:0;pointer-events:none;overflow:hidden;';
      mount.appendChild(itemLayer);

      const controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true; controls.dampingFactor = 0.08;
      controls.minDistance = 4; controls.maxDistance = 80; controls.maxPolarAngle = Math.PI*0.49;
      controls.target.set(0,0,0);

      /* 💡 明るさは B3D_LIGHT で一括管理（sim-config.js の light で上書きできる）。
         合計が強すぎると白飛びするので、環境光は控えめ・キーライト主体にする。 */
      scene.add(new THREE.HemisphereLight(0xdCE8ff, 0x33405c, B3D_LIGHT.hemi));
      scene.add(new THREE.AmbientLight(0xffffff, B3D_LIGHT.ambient));   // 影側が黒く潰れないよう底上げ
      const keyL = new THREE.DirectionalLight(0xffffff, B3D_LIGHT.key); keyL.position.set(6,14,7);
      keyL.castShadow = true; keyL.shadow.mapSize.set(2048,2048);
      keyL.shadow.camera.left=-12; keyL.shadow.camera.right=12; keyL.shadow.camera.top=12; keyL.shadow.camera.bottom=-12;
      scene.add(keyL);
      const rimL = new THREE.DirectionalLight(0x1a9fff, B3D_LIGHT.rim); rimL.position.set(-8,6,-8); scene.add(rimL);


      const boardGroup = new THREE.Group(); scene.add(boardGroup);

      /* 🟡 マスは「見えない当たり判定」にする。
         ── 本家と同じく、普段はアリーナの地面がそのまま見えて、
            駒を持ち上げたときだけ六角形の淵が浮かび上がる。
         ── visible=false にするとレイキャストから外れる three のバージョンがあるため、
            完全透明なマテリアル（opacity:0 / depthWrite:false）で「描かれないが当たる」状態にする。 */
      const hexGeo = new THREE.CylinderGeometry(B3D.R,B3D.R,B3D.TH,6);
      const mkInvisible = () => new THREE.MeshBasicMaterial({ transparent:true, opacity:0, depthWrite:false });
      const hexMat = mkInvisible();
      const benchMat = mkInvisible();
      // ドラッグ中にカーソルが乗っているマスだけ、うっすら光らせる
      const hexHover = new THREE.MeshBasicMaterial({ color:B3D_HEX_HOVER_COLOR, transparent:true, opacity:B3D_HEX_HOVER_OPACITY, depthWrite:false });

      /* ✏️ 六角形の淵（駒を持ち上げている間だけ表示） */
      const hexEdgeGroup = new THREE.Group(); hexEdgeGroup.visible = false; boardGroup.add(hexEdgeGroup);
      const hexEdgeMat = new THREE.LineBasicMaterial({ color:B3D_HEX_EDGE_COLOR, transparent:true, opacity:B3D_HEX_EDGE_OPACITY });
      const addHexEdge = (geo, x, y, z) => {
        const e = new THREE.LineSegments(new THREE.EdgesGeometry(geo), hexEdgeMat);
        e.rotation.y = Math.PI/6; e.position.set(x, y + 0.012, z);   // 地面と重なってチラつかないよう少し浮かせる
        hexEdgeGroup.add(e);
      };

      const hexes=[];
      const slots=[];
      for(let r=0;r<4;r++) for(let c=0;c<7;c++){
        const x=c*B3D.HSP+(r%2?B3D.HSP/2:0), z=r*B3D.VSP;
        const m=new THREE.Mesh(hexGeo, hexMat.clone()); m.rotation.y=Math.PI/6; m.position.set(x,0,z);
        m.userData={kind:'board',idx:r*7+c,x,y:0,z}; boardGroup.add(m); hexes.push(m); slots.push(m);
        addHexEdge(hexGeo, x, 0, z);
      }
      // 🪑 ベンチ（9スロット）── 盤面の手前に一列
      const benchGeo = new THREE.CylinderGeometry(B3D.R*0.92,B3D.R*0.92,B3D.TH,6);
      const benchZ = 3*B3D.VSP + B3D.VSP*1.35;
      const benchSpan = 9*B3D.HSP*0.98;
      const boardW = 6*B3D.HSP + B3D.HSP/2;
      const benchX0 = (boardW - (benchSpan - B3D.HSP*0.98))/2;
      const benchSlots=[];
      for(let i=0;i<9;i++){
        const x=benchX0 + i*B3D.HSP*0.98, z=benchZ;
        const m=new THREE.Mesh(benchGeo, benchMat.clone()); m.rotation.y=Math.PI/6; m.position.set(x,-0.06,z);
        m.userData={kind:'bench',idx:i,x,y:-0.06,z}; boardGroup.add(m); benchSlots.push(m); slots.push(m);
        addHexEdge(benchGeo, x, -0.06, z);
      }
      /* ⚠️ 中心合わせは「自陣の盤面＋ベンチ」だけで計算する。
         このあとに足す敵陣やベンチの枠は見た目だけの飾りなので、
         ここに含めると盤面全体がズレて既定カメラ・アリーナ位置が狂う。 */
      const bb=new THREE.Box3().setFromObject(boardGroup), ctr=new THREE.Vector3(); bb.getCenter(ctr);
      boardGroup.position.set(-ctr.x,0,-ctr.z);

      /* ── 🛡️ 敵陣（奥側の4列）── 見た目だけ。slots に入れないので駒は置けない。
         自陣の列（z = r*VSP）の裏側へ、六角形の並びを崩さないよう続ける。 */
      const enemyEdgeMat = new THREE.LineBasicMaterial({ color:B3D_ENEMY_EDGE_COLOR, transparent:true, opacity:B3D_ENEMY_EDGE_OPACITY });
      const enemyGroup = new THREE.Group(); enemyGroup.visible = false; boardGroup.add(enemyGroup);
      for(let e=1;e<=4;e++) for(let c=0;c<7;c++){
        const x=c*B3D.HSP+((e%2)?B3D.HSP/2:0), z=-e*B3D.VSP;
        const line=new THREE.LineSegments(new THREE.EdgesGeometry(hexGeo), enemyEdgeMat);
        line.rotation.y=Math.PI/6; line.position.set(x, 0.012, z);
        enemyGroup.add(line);
      }

      /* ── 🪑 ベンチの枠 ── 本家と同じく、1体ごとに石のくぼみを用意する。
         こちらは常に見えている（ドラッグ中だけ出る盤面の淵とは別物）。 */
      const benchFrameGroup = new THREE.Group(); boardGroup.add(benchFrameGroup);
      {
        const stone = new THREE.MeshStandardMaterial({ color:B3D_BENCH_COLORS.frame, roughness:0.95, flatShading:true });
        const inner = new THREE.MeshStandardMaterial({ color:B3D_BENCH_COLORS.inner, roughness:1, flatShading:true });
        const bw = B3D.R*0.92;
        benchSlots.forEach(s => {
          const { x, z } = s.userData;
          // 外枠（少し大きい六角柱）
          const frame = new THREE.Mesh(new THREE.CylinderGeometry(bw*1.16, bw*1.22, 0.34, 6), stone);
          frame.rotation.y = Math.PI/6; frame.position.set(x, -0.22, z);
          frame.castShadow = true; frame.receiveShadow = true;
          benchFrameGroup.add(frame);
          // くぼみの底（駒が乗る面）
          const dish = new THREE.Mesh(new THREE.CylinderGeometry(bw*0.98, bw*0.98, 0.06, 6), inner);
          dish.rotation.y = Math.PI/6; dish.position.set(x, -0.07, z);
          dish.receiveShadow = true;
          benchFrameGroup.add(dish);
        });

        /* ── 盤面とベンチの境界（石の帯）── どこからがベンチか一目で分かるようにする */
        const divZ = (3*B3D.VSP + benchZ) / 2;                 // 盤面最前列とベンチの中間
        const divW = Math.max(benchSpan, 6*B3D.HSP + B3D.HSP) + B3D.HSP*0.6;
        const divider = new THREE.Mesh(new THREE.BoxGeometry(divW, 0.30, B3D.VSP*0.34), stone);
        divider.position.set((0 + 6*B3D.HSP + B3D.HSP/2)/2, -0.15, divZ);
        divider.castShadow = true; divider.receiveShadow = true;
        benchFrameGroup.add(divider);
      }

      /* 🏟️ アリーナ。駒の影はここが受ける。
         ── sim-config.js の arena.mode で切り替え:
              'built' … 石壁・草地・かがり火を three.js の箱と板で組み立てる（既定）
              'image' … 1枚絵を敷く（従来方式。arena.image を使う）
         ── 詳しくは B3D_ARENA のコメントを参照。 */
      const arenaGroup = b3dBuildArena(THREE, B3D_ARENA, renderer);
      scene.add(arenaGroup);
      // 🔥 かがり火はゆらゆら揺らす（描画ループから参照する）
      const arenaFlames = [];
      arenaGroup.traverse(n => { if (n.userData && n.userData.b3dFlame) arenaFlames.push(n); });

      // 選択中マスのハイライト枠
      const selMarker=new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.CylinderGeometry(B3D.R*1.04,B3D.R*1.04,B3D.TH*1.35,6)),
        new THREE.LineBasicMaterial({color:0xf0d074}));
      selMarker.rotation.y=Math.PI/6; selMarker.visible=false; boardGroup.add(selMarker);

      const ray=new THREE.Raycaster(), ptr=new THREE.Vector2(); let hovered=null; let down=null;
      const dragPlane=new THREE.Plane(new THREE.Vector3(0,1,0), 0);
      const hitPt=new THREE.Vector3();
      let drag=null, pending=null;   // pending: 押下したが未確定 / drag: ドラッグ確定

      const setPtr=(e)=>{ const b=renderer.domElement.getBoundingClientRect();
        ptr.x=((e.clientX-b.left)/b.width)*2-1; ptr.y=-((e.clientY-b.top)/b.height)*2+1; ray.setFromCamera(ptr,camera); };
      const pickSlot=()=>{ const hit=ray.intersectObjects(slots,false)[0]; return hit?hit.object:null; };
      const clearHover=()=>{ if(hovered){ hovered.material = mkInvisible(); hovered=null; } };
      // 六角形の淵は「駒を持ち上げている / 何かをドラッグしている」間だけ見せる
      const showHexEdges=(on)=>{ hexEdgeGroup.visible = !!on; if (enemyGroup) enemyGroup.visible = !!on; };

      const onDown=(e)=>{
        down=[e.clientX,e.clientY];
        setPtr(e); const slot=pickSlot(); if(!slot) return;
        const key=slot.userData.kind+':'+slot.userData.idx;
        const piece=S.current && S.current.pieces.get(key);
        if(!piece) return;
        // 駒の上で押した＝カメラ回転ではなく駒操作。実際に動いた時点でドラッグ開始とする
        pending={ piece, kind:slot.userData.kind, idx:slot.userData.idx, home:{...piece.userData.home} };
        controls.enabled=false;
        try{ renderer.domElement.setPointerCapture(e.pointerId); }catch(err){}
      };

      const onMove=(e)=>{
        setPtr(e);
        if(pending && !drag && down && Math.hypot(e.clientX-down[0],e.clientY-down[1])>6){
          drag=pending; pending=null;
          if(S.current && S.current.spawning) S.current.spawning.delete(drag.piece);
          drag.piece.position.y = drag.home.y + 0.9;   // 持ち上げる
          showHexEdges(true);                          // 持ち上げた瞬間にマスの淵を出す
          if(pickRef.current) pickRef.current(drag.kind, drag.idx);
        }
        if(drag){
          if(ray.ray.intersectPlane(dragPlane,hitPt)){
            const local=boardGroup.worldToLocal(hitPt.clone());
            drag.piece.position.x=local.x; drag.piece.position.z=local.z;
          }
        }
        const slot=pickSlot();
        if(hovered && (!slot || slot!==hovered)) clearHover();
        if(slot && drag){ slot.material=hexHover; hovered=slot; }   // 持っているときだけ光らせる
        // 売却キーなど「カーソル下の駒」を使う機能のために、今どのマスを指しているか伝える
        if(hoverRef.current) hoverRef.current(slot ? slot.userData.kind : null, slot ? slot.userData.idx : null);
      };

      const onUp=(e)=>{
        const moved = down ? Math.hypot(e.clientX-down[0],e.clientY-down[1]) : 0;
        down=null;
        try{ renderer.domElement.releasePointerCapture(e.pointerId); }catch(err){}
        controls.enabled = !!(S.current && S.current.freeView);   // 固定視点のままなら戻さない
        clearHover(); showHexEdges(false);
        setPtr(e); const slot=pickSlot();
        if(drag){
          const d=drag; drag=null; pending=null;
          // 掴んだ駒は元位置へ戻す（実際の反映は board/bench の state 更新で行う）
          d.piece.position.set(d.home.x,d.home.y,d.home.z);
          if(slot && dropRef.current) dropRef.current(slot.userData.kind, slot.userData.idx);
          else if(outsideRef.current) outsideRef.current(e.clientX, e.clientY);   // 盤外＝ショップ等へのドロップ
          else if(cancelRef.current) cancelRef.current();
          return;
        }
        pending=null;
        if(moved>6) return;   // カメラを回しただけ
        if(slot && cbRef.current) cbRef.current(slot.userData.kind, slot.userData.idx);
      };
      // 2Dのアイテム欄などから canvas 上にドロップされた場合の受け口
      const onDragOver=(e)=>{ e.preventDefault(); setPtr(e); showHexEdges(true); const slot=pickSlot();
        if(hovered && (!slot || slot!==hovered)) clearHover();
        if(slot){ slot.material=hexHover; hovered=slot; } };
      const onDragLeaveEv=(e)=>{ clearHover(); showHexEdges(false); };
      const onDomDropEv=(e)=>{ e.preventDefault(); clearHover(); showHexEdges(false); setPtr(e); const slot=pickSlot();
        if(slot && domDropRef.current) domDropRef.current(slot.userData.kind, slot.userData.idx); };
      renderer.domElement.addEventListener('dragover', onDragOver);
      renderer.domElement.addEventListener('dragleave', onDragLeaveEv);
      renderer.domElement.addEventListener('drop', onDomDropEv);

      renderer.domElement.addEventListener('pointerdown', onDown);
      renderer.domElement.addEventListener('pointerup', onUp);
      renderer.domElement.addEventListener('pointermove', onMove);

      let raf; const loop=()=>{ 
         raf=requestAnimationFrame(loop); 
         if (!S.current) return;
         const delta = S.current.clock ? S.current.clock.getDelta() : 0.016;
         // 🌟 追加: すべてのモデルのアニメーションを進める
         if (S.current.mixers) {
            S.current.mixers.forEach(mixer => mixer.update(delta));
         }
         // 🔥 かがり火の炎を少しだけ揺らす（本数が少ないので負荷はほぼ無し）
         if (arenaFlames.length) {
            const t = performance.now() * 0.004;
            arenaFlames.forEach((f, i) => {
              const s = 1 + Math.sin(t + i * 1.7) * 0.16;
              f.scale.set(s, 1.5 / s, s);
              f.rotation.y += delta * 1.6;
            });
         }
         // 🌟 購入直後などで新しく置かれた駒を、上からストンと着地させる
         if (S.current.spawning && S.current.spawning.size) {
            const DUR = 0.32;
            S.current.spawning.forEach(g => {
               if (!g.parent || !g.userData.home) { S.current.spawning.delete(g); return; }
               g.userData.spawnT += delta;
               const p = Math.min(1, g.userData.spawnT / DUR);
               const ease = 1 - Math.pow(1 - p, 3);          // easeOutCubic
               g.position.y = g.userData.home.y + (1 - ease) * 2.6;
               if (p >= 1) { g.position.y = g.userData.home.y; S.current.spawning.delete(g); }
            });
         }
         controls.update(); 
         renderer.render(scene,camera);
         b3dSyncItemDom(S.current);   // 装備アイコンを駒の頭上へ追従させる
      }; loop();
       
      const ro=new ResizeObserver(()=>{ const w=mount.clientWidth||W, h=mount.clientHeight||H;
        // ブラウザの拡大率を変えると devicePixelRatio も変わるので、その都度入れ直す
        renderer.setPixelRatio(b3dPixelRatio());
        camera.aspect=w/h; camera.updateProjectionMatrix(); renderer.setSize(w,h);
        if(S.current) S.current.viewSize={w,h};
        // 自由視点でなければ、画面いっぱいに収まるよう合わせ直す
        if(S.current && !S.current.freeView){
          if(savedViewRef.current) b3dApplySavedView(S.current, savedViewRef.current);  // 角度は維持、距離だけ再調整
          else b3dFitCamera(S.current);
        } }); ro.observe(mount);

      s={ scene, camera, renderer, controls, boardGroup, hexes, benchSlots, slots, selMarker, freeView:false, onDragOver, onDomDropEv,
         itemLayer, itemDom:new Map(),
         viewSize:{w:W,h:H}, insets:insetsRef.current||{left:0,right:0,top:0,bottom:0}, 
         pieces:new Map(), 
         spawning:new Set(), // 出現アニメ中の駒
         mixers: new Map(), // 駒ごとのAnimationMixerを保持
         clock: new THREE.Clock(), // 経過時間計算用
         raf, ro, onDown, onUp, onMove, onDragLeaveEv };
      S.current=s;
      b3dFitCamera(s);          // まず画面いっぱいに収まる位置を算出
      if(savedViewRef.current) b3dApplySavedView(s, savedViewRef.current);  // 保存済みの視点があれば上書き
      controls.enabled=false;   // 既定は固定視点（駒操作でカメラが動かないように）
    } catch(err){ console.error('Board3D init failed', err); setFailed(true); return; }

    return ()=>{ 
      const x=S.current; if(!x) return;
      cancelAnimationFrame(x.raf);
      cancelAnimationFrame(x.raf); try{ x.ro.disconnect(); }catch(e){}
      const el=x.renderer.domElement; el.removeEventListener('dragover',x.onDragOver); el.removeEventListener('dragleave',x.onDragLeaveEv); el.removeEventListener('drop',x.onDomDropEv); el.removeEventListener('pointerdown',x.onDown); el.removeEventListener('pointerup',x.onUp); el.removeEventListener('pointermove',x.onMove);
      x.pieces.forEach(g=>b3dDispose(g));
      if(x.itemDom){ x.itemDom.forEach(b=>b.remove()); x.itemDom.clear(); }
      if(x.itemLayer && x.itemLayer.parentNode) x.itemLayer.parentNode.removeChild(x.itemLayer); try{ x.renderer.dispose(); }catch(e){}
      if(el.parentNode) el.parentNode.removeChild(el); S.current=null; };
  }, []);

  useEffect3D(()=>{ if(S.current) b3dSync(S.current, board, bench, boardIcon, champModels, itemIcon); }, [board, bench, champModels]);

  // 3D表示を開いたらモデルを先読みしておく
  useEffect3D(()=>{ if(champs && champs.length) b3dPreloadModels(champs, champModels); }, [champs]);

  // 保存済み視点が更新されたら既定として取り込む
  useEffect3D(()=>{ const s=S.current; if(!s) return;
    if(savedView) { if(!freeView) b3dApplySavedView(s, savedView); else s.defaultCam={
        pos:new THREE.Vector3(savedView.pos[0],savedView.pos[1],savedView.pos[2]),
        target:new THREE.Vector3(savedView.target[0],savedView.target[1],savedView.target[2]) }; }
  }, [savedView]);

  // 🎥 view: ON=自由に回せる / OFF=既定の視点に戻して固定
  useEffect3D(()=>{ const s=S.current; if(!s||!s.controls) return;
    s.freeView=!!freeView;
    s.controls.enabled=!!freeView;
    if(!freeView){
      if(s.defaultCam){ s.camera.position.copy(s.defaultCam.pos); s.controls.target.copy(s.defaultCam.target); }
      else b3dFitCamera(s);
      s.camera.lookAt(s.controls.target);
      s.camera.updateProjectionMatrix(); s.controls.update();
    }
  }, [freeView]);

  useEffect3D(()=>{ const s=S.current; if(!s||!s.selMarker) return;
    const slot = selected ? s.slots.find(h=>h.userData.kind===selected.kind && h.userData.idx===selected.idx) : null;
    if(!slot){ s.selMarker.visible=false; return; }
    s.selMarker.position.set(slot.userData.x, slot.userData.y||0, slot.userData.z); s.selMarker.visible=true;
  }, [selected]);

  if (failed) return (
    <div style={{ padding:20, textAlign:'center', color:'var(--textdim)', fontSize:13, maxWidth:360 }}>
      3D盤面を初期化できませんでした。<br/>three.js が読み込めていないか、WebGL 非対応の可能性があります。2Dに戻して続行できます。
    </div>
  );
  return <div ref={mountRef} style={{ position:'absolute', inset:0, borderRadius:12, overflow:'hidden' }} />;
}

/* ============================================================
   🎭 遭遇の3Dお披露目（EncounterModel3D）
   ── 1-1の遭遇提示で、アイコンの代わりにキャラクターの .glb を1体だけ大きく映す。
   ── 盤面用のBoard3Dとは独立した小さなシーン。カメラ操作は無しで、
      ゆっくり回転＋idleアニメーションだけを再生する。
   ── モデルが用意されていない／three.jsが無い／WebGL不可のときは onFail() を呼ぶので、
      呼び出し側で従来のアイコン表示に戻すこと（表示が消えることはない）。
   ── URLの決まり方: 遭遇の model → CHAMP_MODELS3D[id] → models/<id>_(tft_set_NN).glb
      遭遇のキャラはセットのチャンピオン一覧に居ないことが多いので、
      sim-editor.html の遭遇タブで model を直接指定できるようにしてある。
   ============================================================ */
function b3dEncounterModelUrl(enc, champ){
  if(!enc) return '';
  if(enc.model) return enc.model;                                   // 遭遇に直接指定（最優先）
  const id = (champ && champ.id) || enc.id;
  if(!id) return '';
  if(typeof CHAMP_MODELS3D !== 'undefined' && CHAMP_MODELS3D[id]) return CHAMP_MODELS3D[id];
  return b3dAutoModelUrl(id);
}

function EncounterModel3D({ url, color, width, height, onFail, spin = 0, faceY = 0, champId = '' }){
  /* spin: 自転の速さ(rad/秒)。既定 0 ＝ 回さず正面を向いたまま。
     faceY: 正面の向きが合わないモデル用の固定回転(ラジアン)。例) Math.PI で背面向きを直す。 */
  const mountRef = useRef3D(null);
  const failRef  = useRef3D(onFail);
  failRef.current = onFail;

  useEffect3D(() => {
    const giveUp = (why) => { if(failRef.current) failRef.current(why); };
    if(typeof THREE === 'undefined' || !THREE.WebGLRenderer || !THREE.GLTFLoader){ giveUp('three.js なし'); return; }
    if(!url){ giveUp('モデル未指定'); return; }
    const mount = mountRef.current; if(!mount) return;

    let raf = 0, disposed = false, renderer = null;
    try{
      const W = mount.clientWidth || width || 360, H = mount.clientHeight || height || 400;
      const scene  = new THREE.Scene(); scene.background = null;
      const camera = new THREE.PerspectiveCamera(32, W/H, 0.1, 100);
      camera.position.set(0, 2.05, 6.4); camera.lookAt(0, 1.35, 0);

      renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
      renderer.setSize(W, H);
      renderer.setPixelRatio(b3dPixelRatio());
      if (renderer.capabilities && renderer.capabilities.getMaxAnisotropy) B3D_MAX_ANISO = renderer.capabilities.getMaxAnisotropy();
      if(THREE.SRGBColorSpace !== undefined) renderer.outputColorSpace = THREE.SRGBColorSpace;
      else if(THREE.sRGBEncoding !== undefined) renderer.outputEncoding = THREE.sRGBEncoding;
      mount.appendChild(renderer.domElement);
      renderer.domElement.style.cssText = 'width:100%;height:100%;display:block';

      // 照明：正面から柔らかく当て、遭遇の色でリムライトを入れて浮かせる
      const rim = new THREE.Color(color || '#7fd0ff');
      scene.add(new THREE.HemisphereLight(0xdce8ff, 0x2a3550, 1.1));
      scene.add(new THREE.AmbientLight(0xffffff, 0.6));
      const key = new THREE.DirectionalLight(0xffffff, 1.7); key.position.set(3, 6, 6); scene.add(key);
      const back = new THREE.DirectionalLight(rim, 1.5); back.position.set(-4, 3, -5); scene.add(back);

      // 足元の光の円（モデルが宙に浮いて見えないように）
      const disc = new THREE.Mesh(
        new THREE.CircleGeometry(1.5, 48),
        new THREE.MeshBasicMaterial({ color: rim, transparent:true, opacity:0.16 })
      );
      disc.rotation.x = -Math.PI/2; disc.position.y = 0.01; scene.add(disc);

      const pivot = new THREE.Group(); pivot.rotation.y = faceY || 0; scene.add(pivot);
      let mixer = null;
      const clock = new THREE.Clock();

      b3dLoadModelAny(url).then(gltf => {
        if(disposed) return;
        const m = (THREE.SkeletonUtils && THREE.SkeletonUtils.clone)
          ? THREE.SkeletonUtils.clone(gltf.scene) : gltf.scene.clone(true);
        b3dPruneStrayParts(m, champId || (url.match(/([a-z0-9]+)_\(tft_set/i) || [])[1] || '');
        b3dFixMaterials(m);
        // 高さ2.6になるよう正規化し、足元を原点に、中心を軸に合わせる（非表示パーツは無視される）
        const box = new THREE.Box3().setFromObject(m);
        const sz  = new THREE.Vector3(); box.getSize(sz);
        const ctr = new THREE.Vector3(); box.getCenter(ctr);
        const s = 2.6 / Math.max(sz.y || 1, 0.001);
        m.scale.setScalar(s);
        m.position.set(-ctr.x*s, -box.min.y*s, -ctr.z*s);
        pivot.add(m);
        if(gltf.animations && gltf.animations.length){
          mixer = new THREE.AnimationMixer(m);
          const clip = gltf.animations.find(c => c.name.toLowerCase().includes('idle1'))
                    || gltf.animations.find(c => c.name.toLowerCase().includes('idle'))
                    || gltf.animations[0];
          mixer.clipAction(clip).play();
        }
      }).catch(() => { if(!disposed) giveUp('モデルを取得できません: ' + url); });

      const tick = () => {
        if(disposed) return;
        raf = requestAnimationFrame(tick);
        const dt = clock.getDelta();
        if(mixer) mixer.update(dt);
        if(spin) pivot.rotation.y += dt * spin;   // 既定は回さない（spin に数値を渡したときだけ回る）
        renderer.render(scene, camera);
      };
      tick();

      const onResize = () => {
        if(disposed || !mount) return;
        const w = mount.clientWidth || W, h = mount.clientHeight || H;
        renderer.setSize(w, h); camera.aspect = w/h; camera.updateProjectionMatrix();
      };
      window.addEventListener('resize', onResize);

      return () => {
        disposed = true;
        cancelAnimationFrame(raf);
        window.removeEventListener('resize', onResize);
        try{ renderer.dispose(); }catch(e){}
        if(renderer && renderer.domElement && renderer.domElement.parentNode)
          renderer.domElement.parentNode.removeChild(renderer.domElement);
      };
    }catch(err){
      giveUp(err && err.message);
      try{ if(renderer) renderer.dispose(); }catch(e){}
    }
  }, [url, color, spin, faceY, champId]);

  return <div ref={mountRef} style={{ width: width || '100%', height: height || '100%', pointerEvents:'none' }} />;
}
