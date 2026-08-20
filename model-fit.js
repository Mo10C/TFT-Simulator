/* ============================================================
   3Dモデルの配置ロジック（board3d.js と sim-editor.html の共通部分）
   ── ここに置いた関数を「ゲーム本体」と「エディタ」の両方が呼ぶ。
      以前は同じ計算を2箇所に別々に書いていたため、エディタで合わせたのに
      盤面ではズレる、という食い違いが起き続けていた。今後は片方だけ直すと
      いうことが起きないよう、必ずこのファイルを直す。
   ── 調整値そのものは data-model-tune.js（エディタが書き出すファイル）にある。
   ── このファイルは JSX を含まない素のJSなので、両方から普通に読み込める。
   ============================================================ */

/* 六角マス1個の大きさ。R=1.0 が半径、TOP がマスの上面の高さ */
const B3D = { R:1.0, TH:0.02, GAP:1.10, get HSP(){return Math.sqrt(3)*this.R*this.GAP;}, get VSP(){return 1.5*this.R*this.GAP;}, get TOP(){return this.TH/2;} };

/* モデルの調整値（data-model-tune.js から。無ければ空） */
const CHAMP_MODEL_TUNE = (typeof MODEL_TUNE !== 'undefined') ? MODEL_TUNE : {};

/* 消す／残すパーツの指定（data-model-tune.js から） */
const B3D_STRAY_NAME = /missile|projectile|\bproj\b|_proj|kunai|shuriken|arrow|bolt|dart|spear_throw|throw|_mis\b|grenade|bomb|orb_cast/i;
const B3D_HIDE_PARTS = (typeof MODEL_HIDE_PARTS !== 'undefined') ? MODEL_HIDE_PARTS : {};
const B3D_KEEP_PARTS = (typeof MODEL_KEEP_PARTS !== 'undefined') ? MODEL_KEEP_PARTS : {};
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
