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
  spr.scale.set(R*1.1,R*0.28,1); spr.position.y=B3D.TOP+0.14+R*1.7; return spr;
}
function b3dMakeItemPips(items){
  const list=(items||[]).slice(0,3); if(!list.length) return null; const grp=new THREE.Group(); const R=B3D.R;
  list.forEach((it,i)=>{ const col=it?.type==='artifact'?0xdc3545:(it?.type==='radiant'?0xf0d074:(it?.type==='completed'?0xd4af37:0x9fb0c8));
    const m=new THREE.Mesh(new THREE.BoxGeometry(0.16,0.16,0.05), new THREE.MeshStandardMaterial({color:col,metalness:0.4,roughness:0.4,emissive:col,emissiveIntensity:0.3}));
    m.position.set((i-(list.length-1)/2)*0.2, B3D.TOP+0.16, R*0.55); grp.add(m); });
  return grp;
}
/* 🎯 チャンピオンごとの3Dモデル微調整
   ── 自動の中心合わせでズレる場合はここに書く。キーは champ.id。
      x / z : 六角形中心からの左右・前後のズレ補正
      y     : 高さ（浮く・沈む場合）
      scale : 大きさの倍率（1が既定）
      rotY  : 向き（ラジアン。Math.PI で180度）
   例: hecarim: { x:0.1, z:-0.05, scale:1.1 } */
const CHAMP_MODEL_TUNE = {
  akali: { z:0.98 },   // アカリ
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
  gromp: { scale:0.69, x:-0.14, y:-0.24 },   // グロンプ
  kayle: { x:0.1, rotY:-97 * Math.PI/180 },   // ケイル
  leblanc: { scale:1.11, x:0.45, y:-0.2 },   // ルブラン
  murkwolf: { scale:0.64, x:-0.27 },   // マークウルフ
  scuttlecrab: { scale:0.7 },   // スカトルクラブ
  sejuani: { scale:1.18, y:-0.13 },   // セジュアニ
  teemo: { scale:0.7, x:0.22, z:0.07 },   // ティーモ
  yunara: { x:0.1, y:-0.15 },   // ユナラ
  azir: { scale:1.23, x:0.3, y:-0.29 },   // アジール
  cassiopeia: { x:-1.55, z:0.18 },   // カシオペア
  diana: { scale:1.12 },   // ダイアナ
  fiddlesticks: { scale:1.05, x:0.07, y:-0.57, z:-0.34 },   // フィドルスティックス
  hecarim: { scale:1.26 },   // ヘカリム
  khazix: { scale:0.84, x:-0.19, z:0.22 },   // カ＝ジックス
  kogmaw: { scale:0.64 },   // コグ＝マウ
  krug: { scale:0.76, x:0.04 },   // クルーグ
  rammus: { z:-0.17 },   // ラムス
  rengar: { scale:0.94, rotY:-87 * Math.PI/180 },   // レンガー
  tristana: { scale:0.73, x:0.17, y:0.04, z:0.1 },   // トリスターナ
  ahri: { x:-0.81, z:-0.02 },   // アーリ
  amumu: { x:-0.1, z:0.07 },   // アムム
  aphelios: { scale:1.58, y:-1.5, z:1.17 },   // アフェリオス
  brambleback: { scale:0.87, x:0.27, z:-0.1 },   // ブランブルバック
  lillia: { scale:1.12 },   // リリア
  morgana: { x:-0.17, z:0.24 },   // モルガナ
  nidalee: { x:0.19, z:-0.24 },   // ニダリー
  sentinel: { scale:0.8 },   // 古の番人
  sett: { scale:0.97, x:0.01, z:-0.2 },   // セト
  sivir: { scale:0.94, x:0.34, z:0.16 },   // シヴィア
  soraka: { z:0.45 },   // ソラカ
  zyra: { z:-0.18 },   // ザイラ
  alune: { y:-0.45 },   // アルーン
  gnar: { scale:0.55, z:0.27 },   // ナー
  ivern: { rotY:-90 * Math.PI/180 },   // アイバーン
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
   加えて metalness が高い素材は環境マップが無いと真っ黒になるため落としておく。 */
function b3dFixMaterials(root){
  const sRGB = THREE.sRGBEncoding;
  root.traverse(n=>{
    if(!n.isMesh || !n.material) return;
    const mats = Array.isArray(n.material) ? n.material : [n.material];
    mats.forEach(m=>{
      if(!m) return;
      if(m.map){ b3dSetSRGB(m.map); m.map.needsUpdate=true; }
      if(m.emissiveMap) b3dSetSRGB(m.emissiveMap);
      if(typeof m.metalness==='number' && m.metalness>0.25) m.metalness=0.15;  // 環境マップ無しの黒化を防ぐ
      if(typeof m.roughness==='number' && m.roughness<0.35) m.roughness=0.6;
      if(m.color && m.color.getHex()===0x000000 && m.map) m.color.setHex(0xffffff); // 黒ベースカラーで潰れるのを回避
      m.side=THREE.DoubleSide;
      m.needsUpdate=true;
    });
  });
}

/* ── 読み込んだモデルを駒に取り付ける（複製して使う） ── */
function b3dAttachModel(S, g, key, gltf, champId){
  let m;
  if(THREE.SkeletonUtils && THREE.SkeletonUtils.clone) m=THREE.SkeletonUtils.clone(gltf.scene);
  else m=gltf.scene.clone(true);
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
  const target = new THREE.Vector3(savedView.target[0], savedView.target[1], savedView.target[2]);
  const pos = new THREE.Vector3(savedView.pos[0], savedView.pos[1], savedView.pos[2]);
  const place = (p) => {
    camera.position.copy(p); controls.target.copy(target); camera.lookAt(target);
    camera.updateMatrixWorld(true); camera.updateProjectionMatrix(); controls.update();
  };
  place(pos);

  // 保存時と画面比が違うと端が切れることがあるので、角度はそのままに距離だけ引いて収める
  if(S.boardGroup){
    const box = new THREE.Box3().setFromObject(S.boardGroup);
    if(!box.isEmpty()){
      box.max.y += 2.3;
      const corners = [
        new THREE.Vector3(box.min.x,box.min.y,box.min.z), new THREE.Vector3(box.max.x,box.min.y,box.min.z),
        new THREE.Vector3(box.min.x,box.max.y,box.min.z), new THREE.Vector3(box.max.x,box.max.y,box.min.z),
        new THREE.Vector3(box.min.x,box.min.y,box.max.z), new THREE.Vector3(box.max.x,box.min.y,box.max.z),
        new THREE.Vector3(box.min.x,box.max.y,box.max.z), new THREE.Vector3(box.max.x,box.max.y,box.max.z),
      ];
      const m = new THREE.Matrix4();
      const fitsAt = (d) => {
        place(target.clone().addScaledVector(dir, d));
        m.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
        return corners.every(c => { const p=c.clone().applyMatrix4(m);
          return Math.abs(p.x)<=0.995 && Math.abs(p.y)<=0.995 && p.z<1; });
      };
      const dir = pos.clone().sub(target);
      const d0 = dir.length() || 1;
      dir.normalize();
      if(!fitsAt(d0)){
        let lo = d0, hi = d0;
        for(let i=0;i<12 && !fitsAt(hi);i++) hi *= 1.5;   // 収まる距離まで下がる
        for(let i=0;i<32;i++){ const mid=(lo+hi)/2; if(fitsAt(mid)) hi=mid; else lo=mid; }
        fitsAt(hi);
      } else {
        place(pos);
      }
    }
  }
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
function b3dSync(S, board, bench, boardIcon, champModels){
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
    const sig=`${u.uid||u.id}|${isAnvil?'anvil':u.star}|${(u.items||[]).length}|${modelUrl}`;
    want.set(kind+':'+idx, { slot:h, kind, idx, u, isAnvil, modelUrl, sig });
  });

  // ── 2) 既にある駒を sig で引けるようにする（同じ駒が別マスへ移動した場合の受け皿）
  const bySig=new Map();
  pieces.forEach((g,k)=>{ const s=g.userData.sig; if(!bySig.has(s)) bySig.set(s,[]); bySig.get(s).push(k); });

  // ── 3) 移動：同じ駒が別スロットに現れたら、作り直さずそのまま動かす（モデル再読込のちらつき防止）
  const moved=new Map();
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
    if(S.mixers && S.mixers.has(fromKey)){ const mx=S.mixers.get(fromKey); S.mixers.delete(fromKey); S.mixers.set(key,mx); }
  });
  moved.forEach((g,key)=>pieces.set(key,g));

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
    if(cur && cur.userData.sig===sig) return;
    if(cur){ 
       boardGroup.remove(cur); 
       b3dDispose(cur); 
       pieces.delete(key); 
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
        g.add(b3dMakeStandee(u,boardIcon));   // 初回のみ、ロード完了まで立て看板
        b3dLoadModelAny(modelUrl).then(gltf=>{
          if(!g.parent) return;               // 待っている間に消えていたら何もしない
          b3dAttachModel(S, g, key, gltf, u.id);
        }).catch(()=>{});
      }
    } else {
      g.add(b3dMakeStandee(u,boardIcon));
    }
    g.add(b3dMakeStars(u.star));
    const pips=b3dMakeItemPips(u.items); if(pips) g.add(pips);
    g.userData.spawnT=0;
    boardGroup.add(g); pieces.set(key,g);
    if(S.spawning) S.spawning.add(g);
  });
}

function Board3D({ board, bench, boardIcon, champModels, onSlotClick, onPickup, onDropSlot, onCancel, selected, freeView, savedView, viewApi, insets, onDropOutside, onHoverSlot }) {
  const mountRef = useRef3D(null);
  const S = useRef3D(null);
  const cbRef = useRef3D(onSlotClick);
  const pickRef = useRef3D(onPickup);
  const dropRef = useRef3D(onDropSlot);
  const cancelRef = useRef3D(onCancel);
  const savedViewRef = useRef3D(savedView);
  const insetsRef = useRef3D(insets);
  const outsideRef = useRef3D(onDropOutside);
  const hoverRef = useRef3D(onHoverSlot);
  useEffect3D(()=>{ outsideRef.current=onDropOutside; hoverRef.current=onHoverSlot; }, [onDropOutside, onHoverSlot]);
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
      applyView: (v) => b3dApplySavedView(S.current, v),
      fitToScreen: () => { if(S.current) b3dFitCamera(S.current); },
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
      renderer.setSize(W, H); renderer.setPixelRatio(Math.min(window.devicePixelRatio||1, 2));
      renderer.shadowMap.enabled = true; if (THREE.PCFSoftShadowMap) renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      // 色空間：r128 は outputEncoding、r152+ は outputColorSpace。両対応にしないとモデルが暗くなる
      if (THREE.SRGBColorSpace !== undefined) renderer.outputColorSpace = THREE.SRGBColorSpace;
      else if (THREE.sRGBEncoding !== undefined) renderer.outputEncoding = THREE.sRGBEncoding;
      renderer.physicallyCorrectLights = false;
      mount.appendChild(renderer.domElement);

      const controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true; controls.dampingFactor = 0.08;
      controls.minDistance = 4; controls.maxDistance = 80; controls.maxPolarAngle = Math.PI*0.49;
      controls.target.set(0,0,0);

      scene.add(new THREE.HemisphereLight(0xdCE8ff, 0x33405c, 1.15));
      scene.add(new THREE.AmbientLight(0xffffff, 0.55));   // 影側が黒く潰れないよう底上げ
      const keyL = new THREE.DirectionalLight(0xffffff, 1.8); keyL.position.set(6,14,7);
      keyL.castShadow = true; keyL.shadow.mapSize.set(1024,1024);
      keyL.shadow.camera.left=-12; keyL.shadow.camera.right=12; keyL.shadow.camera.top=12; keyL.shadow.camera.bottom=-12;
      scene.add(keyL);
      const rimL = new THREE.DirectionalLight(0x1a9fff, 0.5); rimL.position.set(-8,6,-8); scene.add(rimL);


      const boardGroup = new THREE.Group(); scene.add(boardGroup);
      const hexGeo = new THREE.CylinderGeometry(B3D.R,B3D.R,B3D.TH,6);
      const hexMat = new THREE.MeshStandardMaterial({color:0x16233c,metalness:0.35,roughness:0.6,emissive:0x0a1424,emissiveIntensity:0.6});
      const hexHover = new THREE.MeshStandardMaterial({color:0x274063,metalness:0.4,roughness:0.5,emissive:0x1a9fff,emissiveIntensity:0.5});
      const hexes=[];
      const slots=[];
      for(let r=0;r<4;r++) for(let c=0;c<7;c++){
        const x=c*B3D.HSP+(r%2?B3D.HSP/2:0), z=r*B3D.VSP;
        const m=new THREE.Mesh(hexGeo, hexMat.clone()); m.rotation.y=Math.PI/6; m.position.set(x,0,z);
        m.receiveShadow=true; m.userData={kind:'board',idx:r*7+c,x,y:0,z}; boardGroup.add(m); hexes.push(m); slots.push(m);
      }
      // 🪑 ベンチ（9スロット）── 盤面の手前に一列。少し低く、色を変えて区別する
      const benchMat = new THREE.MeshStandardMaterial({color:0x121d31,metalness:0.3,roughness:0.7,emissive:0x0a1424,emissiveIntensity:0.4});
      const benchGeo = new THREE.CylinderGeometry(B3D.R*0.92,B3D.R*0.92,B3D.TH,6);
      const benchZ = 3*B3D.VSP + B3D.VSP*1.35;
      const benchSpan = 9*B3D.HSP*0.98;
      const boardW = 6*B3D.HSP + B3D.HSP/2;
      const benchX0 = (boardW - (benchSpan - B3D.HSP*0.98))/2;
      const benchSlots=[];
      for(let i=0;i<9;i++){
        const x=benchX0 + i*B3D.HSP*0.98, z=benchZ;
        const m=new THREE.Mesh(benchGeo, benchMat.clone()); m.rotation.y=Math.PI/6; m.position.set(x,-0.06,z);
        m.receiveShadow=true; m.userData={kind:'bench',idx:i,x,y:-0.06,z}; boardGroup.add(m); benchSlots.push(m); slots.push(m);
      }
      const bb=new THREE.Box3().setFromObject(boardGroup), ctr=new THREE.Vector3(); bb.getCenter(ctr);
      boardGroup.position.set(-ctr.x,0,-ctr.z);

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
      const clearHover=()=>{ if(hovered){ hovered.material = hovered.userData.kind==='bench'?benchMat.clone():hexMat.clone(); hovered=null; } };

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
        if(slot){ slot.material=hexHover; hovered=slot; }
        // 売却キーなど「カーソル下の駒」を使う機能のために、今どのマスを指しているか伝える
        if(hoverRef.current) hoverRef.current(slot ? slot.userData.kind : null, slot ? slot.userData.idx : null);
      };

      const onUp=(e)=>{
        const moved = down ? Math.hypot(e.clientX-down[0],e.clientY-down[1]) : 0;
        down=null;
        try{ renderer.domElement.releasePointerCapture(e.pointerId); }catch(err){}
        controls.enabled = !!(S.current && S.current.freeView);   // 固定視点のままなら戻さない
        clearHover();
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
      }; loop();
       
      const ro=new ResizeObserver(()=>{ const w=mount.clientWidth||W, h=mount.clientHeight||H;
        camera.aspect=w/h; camera.updateProjectionMatrix(); renderer.setSize(w,h);
        if(S.current) S.current.viewSize={w,h};
        // 自由視点でなければ、画面いっぱいに収まるよう合わせ直す
        if(S.current && !S.current.freeView){
          if(savedViewRef.current) b3dApplySavedView(S.current, savedViewRef.current);  // 角度は維持、距離だけ再調整
          else b3dFitCamera(S.current);
        } }); ro.observe(mount);

      s={ scene, camera, renderer, controls, boardGroup, hexes, benchSlots, slots, selMarker, freeView:false,
         viewSize:{w:W,h:H}, insets:insetsRef.current||{left:0,right:0,top:0,bottom:0}, 
         pieces:new Map(), 
         spawning:new Set(), // 出現アニメ中の駒
         mixers: new Map(), // 駒ごとのAnimationMixerを保持
         clock: new THREE.Clock(), // 経過時間計算用
         raf, ro, onDown, onUp, onMove };
      S.current=s;
      b3dFitCamera(s);          // まず画面いっぱいに収まる位置を算出
      if(savedViewRef.current) b3dApplySavedView(s, savedViewRef.current);  // 保存済みの視点があれば上書き
      controls.enabled=false;   // 既定は固定視点（駒操作でカメラが動かないように）
    } catch(err){ console.error('Board3D init failed', err); setFailed(true); return; }

    return ()=>{ 
      const x=S.current; if(!x) return;
      cancelAnimationFrame(x.raf);
      cancelAnimationFrame(x.raf); try{ x.ro.disconnect(); }catch(e){}
      const el=x.renderer.domElement; el.removeEventListener('pointerdown',x.onDown); el.removeEventListener('pointerup',x.onUp); el.removeEventListener('pointermove',x.onMove);
      x.pieces.forEach(g=>b3dDispose(g)); try{ x.renderer.dispose(); }catch(e){}
      if(el.parentNode) el.parentNode.removeChild(el); S.current=null; };
  }, []);

  useEffect3D(()=>{ if(S.current) b3dSync(S.current, board, bench, boardIcon, champModels); }, [board, bench, champModels]);

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
