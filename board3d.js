/* ============================================================
   🧊 board3d.js ─ 3D盤面モジュール（app.js から分離）
   ── 依存: three.js(r128 UMD) + OrbitControls + GLTFLoader、React（index.html で app.js より前に読込）
   ── 提供するグローバル: CHAMP_MODELS3D / Board3D
   ── app.js 側は <Board3D board={board} boardIcon={boardIcon} champModels={CHAMP_MODELS3D}
        onHexClick={...} selectedIdx={...} /> として使う。
   ── ⚠ JSX を含むため index.html では type="text/babel" data-presets="jsx-classic" で読み込むこと。
   ============================================================ */
const {useState:useState3D,useEffect:useEffect3D,useRef:useRef3D}=React;

/* 🧊 3D盤面：チャンピオンID → .glb パス。設定した駒だけ3Dモデル、それ以外はポートレート立て看板。
   例: const CHAMP_MODELS3D = { akali:'models/akali.glb', sett:'models/sett.glb' }; */
const CHAMP_MODELS3D = {
  varus: 'models/infernal_varus.glb',
  reksai: "models/elderwood_rek'sai.glb",
  leona: 'models/solar_eclipse_leona.glb',
  rakan: 'models/elderwood_rakan.glb',
  yorick: 'models/spirit_blossom_yorick.glb',
  veigar: 'models/elderwood_veigar.glb',
  xayah: 'models/elderwood_xayah.glb',
  karma: 'models/spirit_blossom_karma.glb',
  ornn: 'models/elderwood_ornn.glb',
  camille: 'models/coven_camille.glb',
  alistar: 'models/elderwood_alistar.glb',
  akali: 'models/infernal_akali.glb',
};

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
function b3dFitModel(obj){
  // 1. 初期化
  obj.position.set(0, 0, 0);
  obj.rotation.set(0, 0, 0);
  obj.scale.set(1, 1, 1);

  // 2. スケーリング（現在のサイズ感を維持）
  const box = new THREE.Box3().setFromObject(obj);
  const size = new THREE.Vector3();
  box.getSize(size);

  const height = size.y || 1;
  const targetHeight = B3D.R * 2.3; 
  const s = targetHeight / height;
  obj.scale.setScalar(s);

  // 3. 精密な位置合わせ（底面中央をマス目の中央に配置）
  const scaledBox = new THREE.Box3().setFromObject(obj);

  const centerX = (scaledBox.min.x + scaledBox.max.x) / 2;
  const centerZ = (scaledBox.min.z + scaledBox.max.z) / 2;
  const minY = scaledBox.min.y;

  obj.position.x = -centerX;
  obj.position.z = -centerZ;
  obj.position.y = B3D.TOP - minY;

  // 💡 モデルごとに向きや微調整を行いたい場合は、以下の値を変更できます
  // obj.rotation.y = Math.PI; // 正面に向かせる（180度回転）
  // obj.position.x += 0.0;    // 左右の微調整
  // obj.position.z += 0.0;    // 前後の微調整
  // obj.position.y += 0.0;    // 上下の微調整

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
function b3dLoadModel(url){
  const hit=b3dModelCache.get(url);
  if(hit && hit.promise) return hit.promise;
  if(hit && hit.gltf) return Promise.resolve(hit.gltf);
  const p=new Promise((res,rej)=>{
    try{ new THREE.GLTFLoader().load(url,(gltf)=>{ b3dModelCache.set(url,{gltf}); res(gltf); }, undefined, rej); }
    catch(e){ rej(e); }
  });
  b3dModelCache.set(url,{promise:p});
  p.catch(()=>b3dModelCache.delete(url));
  return p;
}

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
function b3dAttachModel(S, g, key, gltf){
  let m;
  if(THREE.SkeletonUtils && THREE.SkeletonUtils.clone) m=THREE.SkeletonUtils.clone(gltf.scene);
  else m=gltf.scene.clone(true);
  b3dFitModel(m);
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
    const modelUrl = !isAnvil ? (u.model || (champModels && champModels[u.id]) || '') : '';
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
      const cached = b3dModelCache.get(modelUrl);
      if(cached && cached.gltf){
        // 読み込み済み：立て看板を挟まずそのままモデルを出す（ちらつき防止）
        b3dAttachModel(S, g, key, cached.gltf);
      } else {
        g.add(b3dMakeStandee(u,boardIcon));   // 初回のみ、ロード完了まで立て看板
        b3dLoadModel(modelUrl).then(gltf=>{
          if(!g.parent) return;               // 待っている間に消えていたら何もしない
          b3dAttachModel(S, g, key, gltf);
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

function Board3D({ board, bench, boardIcon, champModels, onSlotClick, onPickup, onDropSlot, onCancel, selected }) {
  const mountRef = useRef3D(null);
  const S = useRef3D(null);
  const cbRef = useRef3D(onSlotClick);
  const pickRef = useRef3D(onPickup);
  const dropRef = useRef3D(onDropSlot);
  const cancelRef = useRef3D(onCancel);
  const [failed, setFailed] = useState3D(false);
  useEffect3D(()=>{ cbRef.current=onSlotClick; pickRef.current=onPickup; dropRef.current=onDropSlot; cancelRef.current=onCancel; },
    [onSlotClick,onPickup,onDropSlot,onCancel]);

  useEffect3D(() => {
    if (typeof THREE === 'undefined' || !THREE.WebGLRenderer) { setFailed(true); return; }
    const mount = mountRef.current; if (!mount) return;
    let s;
    try {
      const W = mount.clientWidth || 640, H = mount.clientHeight || 460;
      const scene = new THREE.Scene(); scene.background = null;
      const camera = new THREE.PerspectiveCamera(45, W/H, 0.1, 200); camera.position.set(0, 11.5, 14);
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
      controls.minDistance = 6; controls.maxDistance = 26; controls.maxPolarAngle = Math.PI*0.49;
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
      };

      const onUp=(e)=>{
        const moved = down ? Math.hypot(e.clientX-down[0],e.clientY-down[1]) : 0;
        down=null;
        try{ renderer.domElement.releasePointerCapture(e.pointerId); }catch(err){}
        controls.enabled=true;
        clearHover();
        setPtr(e); const slot=pickSlot();
        if(drag){
          const d=drag; drag=null; pending=null;
          // 掴んだ駒は元位置へ戻す（実際の反映は board/bench の state 更新で行う）
          d.piece.position.set(d.home.x,d.home.y,d.home.z);
          if(slot && dropRef.current) dropRef.current(slot.userData.kind, slot.userData.idx);
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
        camera.aspect=w/h; camera.updateProjectionMatrix(); renderer.setSize(w,h); }); ro.observe(mount);

      s={ scene, camera, renderer, controls, boardGroup, hexes, benchSlots, slots, selMarker, 
         pieces:new Map(), 
         spawning:new Set(), // 出現アニメ中の駒
         mixers: new Map(), // 駒ごとのAnimationMixerを保持
         clock: new THREE.Clock(), // 経過時間計算用
         raf, ro, onDown, onUp, onMove };
      S.current=s;
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
  return <div ref={mountRef} style={{ width:'100%', height:'60vh', maxWidth:820, minHeight:340, borderRadius:12, overflow:'hidden' }} />;
}
