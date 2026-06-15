/* ============================================================
   TFT Set 17 Simulator - アプリ本体（React / JSX）
   データは data-champions.js / data-items.js / data-augments.js
   から読み込まれるグローバル変数を参照しています。
   ============================================================ */

const {useState,useEffect,useRef,useMemo,useCallback}=React;


const COST_COLORS={1:'#8a9aaa',2:'#44cc66',3:'#3399ff',4:'#cc44ff',5:'#ffcc44'};
const STAR_COLORS={1:'#8a9aaa',2:'#44ccff',3:'#ffcc44'};
const XP_FOR_NEXT_LEVEL = { 1: 2, 2: 2, 3: 6, 4: 10, 5: 20 };

/* ── ヘルパー関数 ── */
const getJaName = (name) => {
  if (!name) return "";
  const specialItem = [...ARTIFACTS, ...RADIANT_ITEMS].find(a => a.name === name || a.id === name);
  if (specialItem && specialItem.jaName) return specialItem.jaName;
  return ITEM_JA[name] || name;
};
const getTraitJaName = (trait) => TRAIT_JA[trait] || trait;
const champIcon=(img)=>`https://cdn.metatft.com/cdn-cgi/image/width=256,format=webp/file/metatft/championsplashes/tft17_${img.toLowerCase()}.png`;
const boardIcon=(img)=>`https://cdn.metatft.com/cdn-cgi/image/width=96,format=webp/file/metatft/champions/tft17_${img.toLowerCase()}.png`;
const getTraitIconUrl = (name) => `https://cdn.metatft.com/cdn-cgi/image/width=48,format=webp/file/metatft/traits/${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.png`;

/* 🌟 神ポートレート用：rgpub(本来の絵) → blitz-cdn(チャンピオン四角) → CSS絵文字 の3段フォールバック。
   Riot CMS(cmsassets.rgpub.io)はローカル(file://)やホットリンクで弾かれて黒丸になりやすいため、
   読み込み失敗時に同じ環境で読めている blitz-cdn へ自動で切り替える。 */
const GOD_CHAMP_IMG = { soraka:'Soraka', ahri:'Ahri', asol:'AurelionSol', yasuo:'Yasuo', varus:'Varus', evelynn:'Evelynn', thresh:'Thresh', kayle:'Kayle', ekko:'Ekko' };
const GodImg = ({ god, style = {}, type = 'default' }) => {
  const [stage, setStage] = useState(0); // 0:rgpub/metatft 1:blitz 2:CSS
  if (stage >= 2) {
    const fbSize = typeof style.width === 'number' ? style.width * 0.5 : 40;
    return (
      <div style={{ ...style, display:'flex', alignItems:'center', justifyContent:'center', background:`${god.color}33` }}>
        <span style={{ fontSize: fbSize, lineHeight: 1 }}>⚡</span>
      </div>
    );
  }
  
  let src;
  if (type === 'icon') {
    const metaTftName = (GOD_CHAMP_IMG[god.id] || god.id).toLowerCase();
    src = stage === 0 ? `https://cdn.metatft.com/file/metatft/gods/tft17_god_${metaTftName}.png` : boardIcon(GOD_CHAMP_IMG[god.id] || god.id);
  } else {
    src = stage === 0 ? god.imgUrl : boardIcon(GOD_CHAMP_IMG[god.id] || god.id);
  }

  return <img src={src} style={style} onError={() => setStage(s => s + 1)} />;
};
const getMetaTFTItemUrl = (item) => {
  if (!item) return "";

  // 引数がオブジェクトで imgName がある場合は、直接URLを生成して返す
  if (typeof item === 'object' && item.imgName) {
    return `https://cdn.metatft.com/cdn-cgi/image/width=64,format=webp/file/metatft/items/${item.imgName}.png`;
  }

  const nameInput = typeof item === 'string' ? item : item.name;
  
  if (!nameInput) return "";

  // 1. サイオニック専用（ファイル名そのものが入っている場合）
  if (nameInput.startsWith('tft17_item_psyops_')) {
    return `https://cdn.metatft.com/cdn-cgi/image/width=64,format=webp/file/metatft/items/${nameInput}.png`;
  }
  
  // アーティファクトとレディアントを結合して検索
  const specialItem = [...ARTIFACTS, ...RADIANT_ITEMS].find(a => a.name === nameInput || a.id === nameInput || a.imgName === nameInput);
  if (specialItem) {
    if (specialItem.imgName) {
      return `https://cdn.metatft.com/cdn-cgi/image/width=64,format=webp/file/metatft/items/${specialItem.imgName}.png`;
    }
    const formatted = specialItem.name.toLowerCase().replace(/['.\s]/g, '').replace('artifact', '');
    return `https://cdn.metatft.com/cdn-cgi/image/width=64,format=webp/file/metatft/items/tft_item_${formatted}.png`;
  }

  // 1.5 紋章専用のURLフォーマット
  if (nameInput.includes('Emblem')) {
    const traitName = nameInput.replace(' Emblem', '').toLowerCase().replace(/\s+/g, '').replace(/\./g, '');
    return `https://cdn.metatft.com/cdn-cgi/image/width=64,format=webp/file/metatft/items/tft17_item_${traitName}emblemitem.png`;
  }

  // 2. 特殊消費アイテム
  if (nameInput === 'Tiny Champion Duplicator') return "https://cdn.metatft.com/file/metatft/items/tft_consumable_championduplicator_i.png";
  if (nameInput === 'Lesser Champion Duplicator') return "https://cdn.metatft.com/cdn-cgi/image/width=64,format=webp/file/metatft/items/tft_consumable_championduplicator_iii.png";
  if (nameInput === 'Champion Duplicator') return "https://cdn.metatft.com/cdn-cgi/image/width=64,format=webp/file/metatft/items/tft_consumable_neekoshelp.png";
  if (nameInput === 'Reforger') return "https://cdn.metatft.com/cdn-cgi/image/width=64,format=webp/file/metatft/items/tft_consumable_itemreroller.png";
  if (nameInput === 'itemremover') return "https://cdn.metatft.com/cdn-cgi/image/width=64,format=webp/file/metatft/items/tft_consumable_itemremover.png";

  // 3. 通常の完成アイテム・素材（名前を整形してURL化）
  // 既に日本語になっている場合でも、整形ロジックを通すとURLが壊れることがあるため注意
  const formatted = nameInput.toLowerCase().replace(/['.]/g, '').replace(/\s+/g, '');
  return `https://cdn.metatft.com/cdn-cgi/image/width=64,format=webp/file/metatft/items/tft_item_${formatted}.png`;
};

const getAugmentIconUrl = (aug) => {
  if (!aug || !aug.imgName) return "";
  // 🌟 修正：もし imgName が http から始まっていたら、そのまま返す
  if (aug.imgName.startsWith('http')) {
    return aug.imgName;
  }
  // MetaTFTのパスに合わせる（全て.png形式）
  return `https://cdn.metatft.com/cdn-cgi/image/width=64,format=webp/file/metatft/augments/${aug.imgName}.png`;
};



const createRNG = (seed) => {
  let h = 2166136261 >>> 0;
  const s = seed.toString();
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 16), 0x85ebca6b);
    h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
};

const shuffleArray = (arr, rng) => {
  const res = [...arr];
  for (let i = res.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [res[i], res[j]] = [res[j], res[i]];
  }
  return res;
};

/* ── 金床データの生成 ── */
const createAnvil = (type) => {
  let jaName = '金床', color = '#94a3b8'; // default
  if (type === 'component') { jaName = '素材の金床'; color = '#c0c0c0'; }
  else if (type === 'completed') { jaName = '完成品の金床'; color = '#d4af37'; }
  else if (type === 'artifact')  { jaName = 'アーティファクト金床'; color = '#dc3545'; }
  else if (type === 'radiant')   { jaName = 'レディアント金床'; color = '#facc15'; }
  return {
    isAnvil: true,
    anvilType: type,
    jaName, color,
    img: 'https://tftips.b-cdn.net/champ/ability/armorykeysupport.avif',
    cost: 0,
    star: 0,
    items: [],
    traits: [],
    uid: Math.random()
  };
};


function rollShop(level, rng){
  const odds={1:{1:100}, 2:{1:100}, 3:{1:75,2:25,3:0,4:0,5:0},4:{1:55,2:30,3:15,4:0,5:0},5:{1:45,2:33,3:20,4:2,5:0}}[level] || {1:100};
  return Array(5).fill(null).map(()=>{
    const roll = rng() * 100;
    let cum = 0;
    const cost = [1,2,3,4,5].find(c => { cum += (odds[c] || 0); return roll < cum; }) || 1;
    const pool = CHAMPS.filter(c => c.cost === cost);
    return {...pool[Math.floor(rng() * pool.length)], uid: rng(), star: 1};
  });
}

/* ── UIコンポーネント ── */
const Stars = ({star}) => (
  <div style={{display:'flex', gap:2, justifyContent:'center', alignItems:'center'}}>
    {Array.from({length: star}).map((_, i) => (
      <div key={i} style={{width:10, height:10, clipPath:'polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)', background:STAR_COLORS[star], filter:`drop-shadow(0 0 3px ${STAR_COLORS[star]})`}}/>
    ))}
  </div>
);

const HexCell = ({ champ, size = 78, onDragStart, onDrop, onMouseEnter, onMouseLeave, onTouchStartDrag, dropType, dropIdx, isGolden }) => {
  const [over, setOver] = useState(false);
  return (
    <div
      data-drop-type={dropType || 'board'}
      data-drop-idx={dropIdx != null ? dropIdx : -1}
      onDragOver={e => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={e => { e.preventDefault(); setOver(false); onDrop && onDrop(e); }}
      style={{ width: size, height: size, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
    >
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', filter: isGolden ? 'drop-shadow(0 0 6px var(--gold))' : 'none' }} viewBox="0 0 78 78">
        <polygon points="39,2 76,20 76,58 39,76 2,58 2,20" fill={over ? 'rgba(26,159,255,.18)' : champ ? `${COST_COLORS[champ.cost]}33` : 'var(--bg-hex)'} stroke={over ? 'rgba(26,159,255,.9)' : isGolden ? 'var(--gold2)' : champ ? COST_COLORS[champ.cost] : 'var(--border)'} strokeWidth={isGolden ? 4 : champ ? 3 : 1} />
      </svg>
      {champ && (
        <div
          draggable={!!onDragStart}
          onDragStart={(e) => { if (onMouseLeave) onMouseLeave(); if (onDragStart) onDragStart(e); }}
          onTouchStart={onTouchStartDrag ? (e) => { if (onMouseLeave) onMouseLeave(); onTouchStartDrag(e); } : undefined}
          onMouseEnter={(e) => onMouseEnter && onMouseEnter(e, champ)}
          onMouseLeave={onMouseLeave}
          style={{ width: '90%', height: '90%', clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)', overflow: 'hidden', position: 'relative', zIndex: 1, cursor: onDragStart ? 'grab' : 'default' }}
        >
          <img src={boardIcon(champ.img)} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 2 }}>
            {(champ.items || []).map((it, idx) => (
              <img key={idx} src={getMetaTFTItemUrl(it)} style={{ width: 14, height: 14, border: `1px solid ${it?.type==='artifact' ? 'var(--red)' : (it?.type==='radiant' ? 'var(--gold2)' : 'rgba(255,255,255,0.5)')}`, borderRadius: 2, background: 'black' }} />
            ))}
          </div>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent 55%,rgba(0,0,0,.9))' }} />
          <div style={{ position: 'absolute', bottom: 6, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}><Stars star={champ.star} /></div>
        </div>
      )}
    </div>
  );
};

const ChampionTooltip = ({ data }) => {
  if (!data) return null;
  const { champ, x, y, isRight } = data;
  const isBottom = y > window.innerHeight / 2;
  return (
    <div style={{ position:'fixed', top:isBottom?'auto':Math.max(10,y-20), bottom:isBottom?Math.max(10,window.innerHeight-y-70):'auto', left:isRight?'auto':x+80, right:isRight?window.innerWidth-x+10:'auto', zIndex:5000, width:260, background:'var(--bg1)', color:'var(--text-main)', border:`3px solid ${COST_COLORS[champ.cost]}`, borderRadius:4, overflow:'hidden', fontFamily:'Noto Sans JP', fontSize:12, boxShadow:'0 8px 24px rgba(0,0,0,0.3)', pointerEvents:'none', animation:'fadeIn 0.2s ease' }}>
      <div style={{ position:'relative', height:140 }}>
        <img src={champIcon(champ.img)} style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'top' }} />
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to right, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.2) 100%)' }} />
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(0,0,0,1) 0%, transparent 80%)' }} />
        <div style={{ position:'absolute', top:10, left:10 }}><div style={{ color:'var(--text-inv)', fontSize:18, fontWeight:900, textShadow:'1px 1px 2px #000' }}>{champ.jaName}</div></div>
<div style={{ position:'absolute', bottom:10, left:10, display:'flex', flexDirection:'column', gap:4 }}>
    {(() => {
      let displayTraits = [...champ.traits];
      if (champ.traits.includes('missfortuneuniquetrait')) displayTraits.push(champ.selectedMode || 'unselected');
      return displayTraits.map(t => (
        <div key={t} style={{ display:'flex', alignItems:'center', gap:6 }}>
          <img src={getTraitIconUrl(t)} style={{ width:14, height:14, filter: t==='unselected'?'grayscale(1) opacity(0.5)':'brightness(0) invert(1)' }} onError={(e)=>{if(t==='unselected')e.target.src="https://cdn.metatft.com/file/metatft/traits/unknown.png";else e.target.style.display='none';}}/>
          <span style={{ color: t==='unselected'?'var(--textdim)':'var(--text-inv)', fontWeight:700, fontSize:11, textShadow:'1px 1px 2px #000' }}>{getTraitJaName(t)}</span>
        </div>
      ));
    })()}
  </div>
        <div style={{ position:'absolute', bottom:0, right:0, background:'var(--bg-panel)', color:COST_COLORS[champ.cost], borderTopLeftRadius:6, borderTop:`3px solid ${COST_COLORS[champ.cost]}`, borderLeft:`3px solid ${COST_COLORS[champ.cost]}`, padding:'2px 10px', fontWeight:900, fontSize:13, display:'flex', alignItems:'center', gap:4 }}><span style={{color:'var(--gold)'}}>💰</span>{champ.cost}</div>
      </div>
    </div>
  );
};

const TraitTooltip = ({ data, stargazerDesc, psionicItems, arbiterRule }) => {
  if (!data) return null;
  const { trait, count, x, y } = data;
  const jaName = getTraitJaName(trait);
  
  let desc = TRAIT_DESCS[trait] || "特性の詳細は現在解析中です...";
  
  if (trait === 'Stargazer') {
    desc = stargazerDesc;
  } else if (trait === 'Psionic' && psionicItems) {
    desc = `任意の味方に装備できる「サイオニック」アイテムを獲得する。\n\n(2) 「${psionicItems[0].jaName}」を獲得する。\n(4) 「${psionicItems[1].jaName}」を獲得する。\n\n「サイオニック」アイテムを装備した「サイオニック」ユニットは追加効果を獲得する`;
  } else if (trait === 'Arbiter') {
    // 🌟 アービター専用の書き換え処理
    if (arbiterRule) {
      desc = `独自の聖なる掟を定め、所定の条件が発生した際に「アービター」に適用される効果を選択できるようにする。\n\n【現在の掟】\n⚖️ ${arbiterRule.cause.text}、${arbiterRule.effect.text}\n\n(2) 効果を発動\n(3) 効果が強化される`;
    } else {
      desc = `独自の聖なる掟を定め、所定の条件が発生した際に「アービター」に適用される効果を選択できるようにする。\n\n(2) 自分の掟の条件と効果を選択する。\n(3) 効果が強化される。`;
    }
  }

  const members = CHAMPS.filter(c => c.traits.includes(trait));
  return (
    <div style={{ position:'fixed', top:Math.min(y,window.innerHeight-250), left:x+130, zIndex:6000, width:'max-content', maxWidth:400, background:'var(--bg1)', border:'1px solid var(--gold)', borderRadius:8, padding:'12px', boxShadow:'0 8px 32px rgba(0,0,0,0.3)', animation:'fadeIn 0.2s ease', pointerEvents:'none' }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
        <img src={getTraitIconUrl(trait)} style={{ width:24, height:24, filter: 'brightness(0)' }} alt={jaName} />
        <span style={{ fontSize:16, fontWeight:900, color:'var(--gold)' }}>{jaName}</span>
        <span style={{ fontSize:12, color:'var(--text-main)', background:'var(--bg2)', padding:'2px 6px', borderRadius:4 }}>{count}</span>
      </div>

      {/* 🌟 サイオニック専用：獲得する2つのアイテムアイコンを並べて表示 */}
      {trait === 'Psionic' && psionicItems && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          {psionicItems.map(item => (
            <img 
              key={item.name} 
              src={getMetaTFTItemUrl(item.name)} 
              style={{ width: 32, height: 32, border: '1px solid rgba(255,255,255,0.4)', borderRadius: 4, background: '#1e293b' }} 
              alt={item.jaName} 
            />
          ))}
        </div>
      )}

      <div style={{ whiteSpace:'pre-wrap', fontSize:11, color:'var(--textdim)', lineHeight:1.6, marginBottom:12 }}>{desc}</div>
      <div style={{ borderTop:'1px solid rgba(255,255,255,0.1)', paddingTop:10 }}>
        <div style={{ fontSize:10, color:'var(--textdim)', marginBottom:6 }}>対象チャンピオン:</div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
          {members.map(m => (<div key={m.id}><img src={boardIcon(m.img)} alt={m.name} style={{ width:30, height:30, borderRadius:4, border:`1px solid ${COST_COLORS[m.cost]}` }} /></div>))}
        </div>
      </div>
    </div>
  );
};


const AssetDrawer = ({ isOpen, onClose, setDragSrc, startTouchDrag }) => {
  const [tab, setTab] = useState('champ');
  
  const champsByCost = [1, 2, 3, 4, 5].map(cost => ({
    cost,
    champs: CHAMPS.filter(c => c.cost === cost)
  }));

  const compItems = ITEMS.filter(it => it.type === 'comp');
  const allCraftable = Object.values(ITEM_RECIPES);
  const realCompleted = allCraftable.filter(it => !it.grantedTrait && it.id !== 'tacticians_crown').map(it => ({...it, type: 'completed'}));
  const realEmblems = allCraftable.filter(it => it.grantedTrait || it.id === 'tacticians_crown').map(it => ({...it, type: 'completed'}));
  const consumablesList = Object.values(CONSUMABLES);
  const silverAugs = AUGMENTS_DATA.silver;
  const goldAugs = AUGMENTS_DATA.gold;
  const prismaticAugs = AUGMENTS_DATA.prismatic;
  
  const renderAssetItem = (it, type, borderColor = 'var(--border)') => (
    <div 
      key={it.id || it.name} 
      className="asset-icon-wrapper" 
      style={{ borderColor }}
      title={getJaName(it.name || it.jaName)}
      draggable
      onDragStart={() => setDragSrc({ type, item: it })}
      onTouchStart={(e) => startTouchDrag(e, { type, item: it })}
    >
      <img src={getMetaTFTItemUrl(it)} alt={it.jaName} />
    </div>
  );

  const renderChampItem = (c) => (
    <div 
      key={c.id} 
      className="asset-icon-wrapper" 
      style={{ borderColor: COST_COLORS[c.cost] }}
      title={c.jaName}
      draggable
      onDragStart={() => setDragSrc({ type: 'drawer_champ', champ: c })}
      onTouchStart={(e) => startTouchDrag(e, { type: 'drawer_champ', champ: c })}
    >
      <img src={boardIcon(c.img)} crossOrigin="anonymous" alt={c.jaName} />
    </div>
  );

  const renderAugmentItem = (aug) => (
    <div
      key={aug.id}
      className="asset-icon-wrapper"
      style={{ borderColor: TIER_COLORS[aug.tier] || 'var(--border)' }}
      title={aug.name}
      draggable
      onDragStart={() => setDragSrc({ type: 'drawer_augment', augment: aug })}
      onTouchStart={(e) => startTouchDrag(e, { type: 'drawer_augment', augment: aug })}
    >
      <img src={getAugmentIconUrl(aug)} alt={aug.name} onError={(e) => e.target.style.display='none'} />
    </div>
  );

  return (
    <div className={`asset-drawer ${isOpen ? 'open' : ''}`} style={{ boxShadow: isOpen ? '' : 'none' }}>
      <div className="drawer-header">
        <h3>🎒 チート</h3>
        <button className="close-drawer-btn" onClick={onClose}>×</button>
      </div>
      <div className="drawer-tabs">
        <button className={`drawer-tab ${tab==='champ'?'active':''}`} onClick={()=>setTab('champ')}>チャンピオン</button>
        <button className={`drawer-tab ${tab==='item'?'active':''}`} onClick={()=>setTab('item')}>アイテム</button>
        <button className={`drawer-tab ${tab==='aug'?'active':''}`} onClick={()=>setTab('aug')}>オーグメント</button>
      </div>
      <div className={`drawer-content ${tab==='champ'?'active':''}`}>
        {champsByCost.map(group => (
          <div key={group.cost}>
            <div className="drawer-section-title">{group.cost}コスト</div>
            <div className="drawer-grid">
              {group.champs.map(renderChampItem)}
            </div>
          </div>
        ))}
      </div>
      <div className={`drawer-content ${tab==='item'?'active':''}`}>
        <div className="drawer-section-title">素材アイテム</div>
        <div className="drawer-grid">
          {compItems.map(it => renderAssetItem(it, 'drawer_item'))}
        </div>
        <div className="drawer-section-title">消費アイテム</div>
        <div className="drawer-grid">
          {consumablesList.map(it => renderAssetItem(it, 'drawer_item'))}
        </div>
        <div className="drawer-section-title">完成アイテム</div>
        <div className="drawer-grid">
          {realCompleted.map(it => renderAssetItem(it, 'drawer_item'))}
        </div>
        <div className="drawer-section-title">紋章・その他</div>
        <div className="drawer-grid">
          {realEmblems.map(it => renderAssetItem(it, 'drawer_item'))}
        </div>
        <div className="drawer-section-title">アーティファクト</div>
        <div className="drawer-grid">
          {ARTIFACTS.map(it => renderAssetItem(it, 'drawer_item', 'var(--red)'))}
        </div>
        <div className="drawer-section-title">レディアント</div>
        <div className="drawer-grid">
          {RADIANT_ITEMS.map(it => renderAssetItem(it, 'drawer_item', 'var(--gold2)'))}
        </div>
        <div className="drawer-section-title">金床</div>
        <div className="drawer-grid">
          {['component', 'completed', 'artifact', 'radiant'].map(t => {
            const anvil = createAnvil(t);
            return (
              <div 
                key={`anvil_${t}`}
                className="asset-icon-wrapper" 
                style={{ borderColor: anvil.color }}
                title={anvil.jaName}
                draggable
                onDragStart={() => setDragSrc({ type: 'drawer_anvil', anvil })}
                onTouchStart={(e) => startTouchDrag(e, { type: 'drawer_anvil', anvil })}
              >
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1e293b', fontSize: 20 }}>
                  <img src={anvil.img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={anvil.jaName} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className={`drawer-content ${tab==='aug'?'active':''}`}>
        <div className="drawer-section-title">シルバー</div>
        <div className="drawer-grid">
          {silverAugs.map(renderAugmentItem)}
        </div>
        <div className="drawer-section-title">ゴールド</div>
        <div className="drawer-grid">
          {goldAugs.map(renderAugmentItem)}
        </div>
        <div className="drawer-section-title">プリズム</div>
        <div className="drawer-grid">
          {prismaticAugs.map(renderAugmentItem)}
        </div>
      </div>
    </div>
  );
};

/* ── ティアリスト作成ドロワー ── */
const TierListDrawer = ({ isOpen, onClose, showMsg }) => {
  const tabs = useMemo(() => [
    { id: 'champ', name: 'チャンピオン', type: 'champ', color: 'var(--blue)' },
    { id: 'aug_silver', name: '銀オーグ', type: 'aug_silver', color: 'var(--silver)' },
    { id: 'aug_gold', name: '金オーグ', type: 'aug_gold', color: 'var(--gold2)' },
    { id: 'aug_prismatic', name: '虹オーグ', type: 'aug_prismatic', color: 'var(--prismatic)' }
  ], []);
  
  const [activeTabId, setActiveTabId] = useState('champ');
  
  const [tiers, setTiers] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const encoded = params.get('tierlist');
      if (encoded) {
        const parsed = JSON.parse(decodeURIComponent(atob(encoded)));
        localStorage.setItem('tft_set17_tierlist', JSON.stringify(parsed));
        return parsed;
      }
      
      const saved = localStorage.getItem('tft_set17_tierlist');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch(e) {
      console.error('Failed to parse tierlist', e);
    }
    return {
      champ: { S: [], A: [], B: [], C: [], D: [] },
      aug_silver: { S: [], A: [], B: [], C: [], D: [] },
      aug_gold: { S: [], A: [], B: [], C: [], D: [] },
      aug_prismatic: { S: [], A: [], B: [], C: [], D: [] }
    };
  });

  useEffect(() => {
    localStorage.setItem('tft_set17_tierlist', JSON.stringify(tiers));
  }, [tiers]);
  const [importCode, setImportCode] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const copyTimerRef = useRef(null);
  
  const [dragItem, setDragItem] = useState(null);
  const touchGhostRef = useRef(null);

  const activeTabDef = tabs.find(t => t.id === activeTabId) || tabs[0];
  let allItems = CHAMPS;
  if (activeTabDef.type === 'aug_silver') allItems = AUGMENTS_DATA.silver;
  if (activeTabDef.type === 'aug_gold') allItems = AUGMENTS_DATA.gold;
  if (activeTabDef.type === 'aug_prismatic') allItems = AUGMENTS_DATA.prismatic;

  const placedIds = Object.values(tiers[activeTabId] || { S: [], A: [], B: [], C: [], D: [] }).flat();
  
  const poolItems = allItems.filter(item => !placedIds.includes(item.id));
  if (activeTabDef.type === 'champ') {
    poolItems.sort((a, b) => a.cost - b.cost || a.jaName.localeCompare(b.jaName));
  } else {
    poolItems.sort((a, b) => a.name.localeCompare(b.name));
  }

  const handleDrop = useCallback((targetTier, itemId, currentTab) => {
    setTiers(prev => {
      const newTiers = { ...prev };
      const currentTabTiers = { ...(newTiers[currentTab] || { S: [], A: [], B: [], C: [], D: [] }) };
      
      Object.keys(currentTabTiers).forEach(key => {
        currentTabTiers[key] = currentTabTiers[key].filter(id => id !== itemId);
      });
      
      if (targetTier !== 'pool') {
        currentTabTiers[targetTier].push(itemId);
      }
      
      newTiers[currentTab] = currentTabTiers;
      return newTiers;
    });
  }, []);

  const onDragStart = (e, id) => {
    e.dataTransfer.setData('text/plain', id);
    setDragItem(id);
  };
  const onDragOver = e => e.preventDefault();
  const onDrop = (e, targetTier) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (id) handleDrop(targetTier, id, activeTabId);
    setDragItem(null);
  };

  const onTouchStart = (e, id) => {
    const touch = e.touches[0];
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    
    const ghost = el.cloneNode(true);
    ghost.style.cssText = `
      position:fixed; pointer-events:none; z-index:100000;
      width:${rect.width}px; height:${rect.height}px;
      left:${touch.clientX - rect.width/2}px; top:${touch.clientY - rect.height/2}px;
      opacity:0.8; transform:scale(1.1); margin:0;
    `;
    document.body.appendChild(ghost);
    touchGhostRef.current = { id, el: ghost, width: rect.width, height: rect.height };
    setDragItem(id);
  };

  useEffect(() => {
    if (!isOpen) return;
    /** @param {TouchEvent} e */
    const handleTouchMove = (e) => {
      if (!touchGhostRef.current) return;
      e.preventDefault();
      const touch = e.touches[0];
      const { el, width, height } = touchGhostRef.current;
      el.style.left = `${touch.clientX - width/2}px`;
      el.style.top = `${touch.clientY - height/2}px`;
    };
    /** @param {TouchEvent} e */
    const handleTouchEnd = (e) => {
      if (!touchGhostRef.current) return;
      const touch = e.changedTouches[0];
      const { id, el } = touchGhostRef.current;
      el.remove();
      touchGhostRef.current = null;
      setDragItem(null);
      
      const targetEl = document.elementFromPoint(touch.clientX, touch.clientY);
      const dropZone = targetEl?.closest('[data-tier]');
      if (dropZone) {
        const tier = dropZone.getAttribute('data-tier');
        if (tier) {
          handleDrop(tier, id, activeTabId);
        }
      }
    };
    
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('touchcancel', handleTouchEnd);
    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [isOpen, activeTabId, handleDrop]);

  const handleCopyCode = () => {
    try {
      const encoded = btoa(encodeURIComponent(JSON.stringify(tiers)));
      
      navigator.clipboard.writeText(encoded).then(() => {
        setIsCopied(true);
        if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
        copyTimerRef.current = setTimeout(() => setIsCopied(false), 3000);

        if (showMsg) {
          showMsg(
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
              <span style={{ fontSize: '18px' }}>📋</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 900, color: 'white' }}>共有コードをコピーしました！</div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)' }}>入力ボックスに貼り付けて読み込めます</div>
              </div>
            </div>
          );
        }
      });
    } catch (e) {
      if (showMsg) showMsg("⚠️ コピーに失敗しました");
    }
  };

  const handleImport = () => {
    if (!importCode.trim()) return;
    try {
      let codeToParse = importCode.trim();
      // URLごと貼り付けられた場合はパラメータから抽出する
      if (codeToParse.startsWith('http')) {
        const url = new URL(codeToParse);
        codeToParse = url.searchParams.get('tierlist') || codeToParse;
      }
      
      const parsed = JSON.parse(decodeURIComponent(atob(codeToParse)));
      const newTiers = {
        champ: parsed.champ || { S: [], A: [], B: [], C: [], D: [] },
        aug_silver: parsed.aug_silver || { S: [], A: [], B: [], C: [], D: [] },
        aug_gold: parsed.aug_gold || { S: [], A: [], B: [], C: [], D: [] },
        aug_prismatic: parsed.aug_prismatic || { S: [], A: [], B: [], C: [], D: [] }
      };
      setTiers(newTiers);
      if (showMsg) showMsg("✅ ティアリストを読み込みました！");
      setImportCode("");
    } catch (e) {
      if (showMsg) showMsg("⚠️ 無効な共有コードです");
    }
  };

  const TIER_COLORS_BG = { S: '#ff7f7f', A: '#ffb37f', B: '#ffff7f', C: '#7fff7f', D: '#7fbfff' };

  const renderItem = (item, isSmall = false) => {
    const isChamp = activeTabDef.type === 'champ';
    const isAug = activeTabDef.type.startsWith('aug');

    let imgUrl = "";
    let title = "";
    let borderColor = "var(--border)";

    if (isChamp) {
      imgUrl = boardIcon(item.img);
      title = item.jaName;
      borderColor = COST_COLORS[item.cost] || 'var(--border)';
    } else if (isAug) {
      imgUrl = getAugmentIconUrl(item);
      title = item.name;
      borderColor = TIER_COLORS[item.tier] || 'var(--border)';
    }

    const size = isAug ? 48 : (isSmall ? 26 : 38); // 🌟 オーグメントは一番最初のサイズ(48px)に固定
    
    return (
      <div
        key={item.id}
        draggable
        onDragStart={(e) => onDragStart(e, item.id)}
        onTouchStart={(e) => onTouchStart(e, item.id)}
        title={title}
        style={{
          width: size, height: size,
          borderRadius: isAug ? 6 : 4,
          border: `2px solid ${borderColor}`,
          background: isAug ? '#1e293b' : '#000', // 🌟 オーグメントはチートと同じ背景色に
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'grab',
          opacity: dragItem === item.id ? 0.5 : 1,
          overflow: 'hidden',
          flexShrink: 0,
          touchAction: 'none'
        }}
      >
        <img src={imgUrl} style={{ width: '100%', height: '100%', objectFit: isChamp ? 'cover' : 'contain' }} alt={title} onError={(e) => e.target.style.display='none'} />
      </div>
    );
  };

  return (
    <div className={`asset-drawer ${isOpen ? 'open' : ''}`} style={{ zIndex: 10000, boxShadow: isOpen ? '' : 'none' }}>
      <div className="drawer-header" style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'stretch' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h3 style={{ margin: 0 }}>📊 ティアリスト</h3>
            <button 
              onClick={handleCopyCode}
              style={{ background: 'var(--blue)', border: '1px solid var(--blue)', borderRadius: 6, padding: '4px 10px', fontSize: 10, color: 'white', fontWeight: 900, cursor: 'pointer' }}
            >
              {isCopied ? '📋 コピー完了' : '📋 コードをコピー'}
            </button>
          </div>
          <button className="close-drawer-btn" onClick={onClose} style={{ position: 'relative', right: 0, top: 0 }}>×</button>
        </div>
        
        <div style={{ display: 'flex', gap: 6, paddingRight: 10 }}>
          <input 
            type="text" 
            placeholder="共有コードを貼り付け..." 
            value={importCode}
            onChange={e => setImportCode(e.target.value)}
            style={{ flex: 1, background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border)', borderRadius: 4, color: 'white', padding: '6px 10px', fontSize: 11, outline: 'none' }}
          />
          <button 
            onClick={handleImport}
            style={{ background: 'var(--blue)', border: 'none', borderRadius: 4, padding: '0 12px', fontSize: 11, color: 'white', fontWeight: 900, cursor: 'pointer', flexShrink: 0 }}
          >
            読み込む
          </button>
        </div>
      </div>
      
      <div className="drawer-tabs" style={{ display: 'flex', overflowX: 'auto', gap: 6, padding: '0 10px 10px', scrollbarWidth: 'none' }}>
        {tabs.map(t => (
          <div key={t.id} style={{ display: 'flex', alignItems: 'center', background: activeTabId === t.id ? t.color : 'rgba(255,255,255,0.1)', borderRadius: 8, flexShrink: 0 }}>
            <button 
              onClick={() => setActiveTabId(t.id)}
              style={{ background: 'transparent', border: 'none', color: 'white', textShadow: '0 0 4px black', padding: '6px 10px', fontWeight: 900, cursor: 'pointer', fontSize: 11, whiteSpace: 'nowrap' }}
            >
              {t.name}
            </button>
          </div>
        ))}
      </div>

      <div className="drawer-content active" style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 10px 10px', overflowY: 'auto' }}>
        {['S', 'A', 'B', 'C', 'D'].map(tierKey => {
          const itemsInTier = (tiers[activeTabId] || { S: [], A: [], B: [], C: [], D: [] })[tierKey] || [];
          const isSmall = itemsInTier.length > 14; // 🌟 元の閾値に戻す
          return (
            <div key={tierKey} data-tier={tierKey} onDragOver={onDragOver} onDrop={(e) => onDrop(e, tierKey)} style={{ display: 'flex', background: 'var(--bg-hex)', borderRadius: 6, overflow: 'hidden', minHeight: 50 }}>
              <div style={{ width: 40, background: TIER_COLORS_BG[tierKey], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 900, color: '#000', flexShrink: 0 }}>{tierKey}</div>
              <div style={{ flex: 1, padding: 6, display: 'flex', flexWrap: 'wrap', gap: 4, alignContent: 'flex-start' }}>{itemsInTier.map(id => { const item = allItems.find(x => x.id === id); return item ? renderItem(item, isSmall) : null; })}</div>
            </div>
          );
        })}
        <div data-tier="pool" onDragOver={onDragOver} onDrop={(e) => onDrop(e, 'pool')} style={{ marginTop: 5, flex: 1, background: 'var(--bg-hex)', borderRadius: 6, padding: 8, border: '2px dashed var(--border)', display: 'flex', flexWrap: 'wrap', gap: 4, alignContent: 'flex-start', minHeight: 120, overflowY: 'auto' }}>
          {poolItems.length === 0 ? <div style={{ width: '100%', textAlign: 'center', color: 'var(--textdim)', alignSelf: 'center', fontWeight: 700, fontSize: 12 }}>全て配置済み</div> : poolItems.map(item => renderItem(item, true))}
        </div>
      </div>
    </div>
  );
};

/* ── オーグメント選択画面（操作ロック・スケール0.8版） ── */
const AugmentScreen = ({ onPick, rng, augmentTierBoost = 0, isNoMoreAugments = false, forceTier = null, rerollBonus = 0 }) => {
  const maxRerolls = 1 + (rerollBonus || 0); // 各枠のリロール可能回数（タロンで+1）
  const [tier] = useState(() => {
    if (forceTier) return forceTier;          // 遭遇によるティア強制（TF=gold / シェン・モルガナ=prismatic）
    const baseTierRoll = rng() * 100;
    const adjusted = baseTierRoll - (augmentTierBoost * 30);
    if (adjusted < 9) return 'prismatic';
    if (adjusted < 74) return 'gold';
    return 'silver';
  });

  const [viewBoard, setViewBoard] = useState(false);

  const [augmentSetup] = useState(() => {
    const pool = [...AUGMENTS_DATA[tier]];
    const need = 3 + 3 * maxRerolls;          // 初期3 + (枠ごとmaxRerolls個)の控え
    const drawn = [];
    while (drawn.length < need && pool.length > 0) {
      const idx = Math.floor(rng() * pool.length);
      drawn.push(pool.splice(idx, 1)[0]);
    }
    const initial = drawn.slice(0, 3);
    const backups = [[], [], []];             // 枠ごとの控え（複数回リロール対応）
    let k = 3;
    for (let r = 0; r < maxRerolls; r++) {
      for (let s = 0; s < 3; s++) { if (drawn[k]) backups[s].push(drawn[k]); k++; }
    }
    return { initial, backups };
  });

  const [choices, setChoices] = useState(augmentSetup.initial);
  const [rerollUsed, setRerollUsed] = useState([0, 0, 0]); // 各枠の使用済みリロール回数

  const handleReroll = (idx) => {
    const used = rerollUsed[idx];
    if (used >= maxRerolls) return;
    const nextAug = augmentSetup.backups[idx][used];
    if (nextAug) {
      const nc = [...choices]; nc[idx] = nextAug; setChoices(nc);
      const nr = [...rerollUsed]; nr[idx] = used + 1; setRerollUsed(nr);
    }
  };

  if (isNoMoreAugments) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      // 🌟 オーグメント画面の背景を暗いすりガラス風に変更して白飛びを防止
      background: viewBoard ? 'rgba(0,0,0,0)' : 'rgba(15, 23, 42, 0.85)',
      backdropFilter: viewBoard ? 'none' : 'blur(8px)',
      zIndex: 2000,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s ease',
      // 🌟 viewBoardがtrueの時はイベントを通過させて下の盤面を操作可能にする
      pointerEvents: viewBoard ? 'none' : 'auto'
    }}>

      {/* 👇 盤面確認切り替えボタンを追加 */}
      <button 
        onClick={() => setViewBoard(!viewBoard)}
        style={{
          position: 'absolute',
          bottom: 30,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--blue)',
          color: 'white',
          border: '1px solid white',
          borderRadius: '8px',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
          fontWeight: 'bold',
          fontFamily: 'Noto Sans JP',
          cursor: 'pointer',
          boxShadow: '0 0 15px rgba(26,159,255,0.6)',
          zIndex: 2001,
          pointerEvents: 'auto' // 親がnoneでもこのボタンは押せるようにする
        }}
        title={viewBoard ? "オーグメント選択に戻る" : "盤面を確認する"}
      >
        {viewBoard ? '🔙 選択に戻る' : '👁️ 盤面を確認する'}
      </button>

      {/* 🌟 盤面確認中はカード全体を非表示に */}
      {!viewBoard && (
        <div style={{ 
          transform: 'scale(0.8)', 
          transformOrigin: 'center center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 30
        }}>
          <div style={{ textAlign: 'center', animation: 'fadeIn 0.4s ease' }}>
            <div style={{ fontFamily: 'Orbitron', fontSize: '14px', color: TIER_COLORS[tier], letterSpacing: 4, marginBottom: 8, fontWeight: 900 }}>{tier.toUpperCase()} TIER</div>
            <div style={{ fontFamily: 'Noto Sans JP,Orbitron', fontSize: '26px', fontWeight: 900, color: 'white', letterSpacing: 4, textShadow: '0 0 10px rgba(0,0,0,0.5)' }}>オーグメントを選択してください</div>
          </div>

          <div style={{ display: 'flex', gap: 25, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-start', animation: 'fadeIn 0.6s ease' }}>
            {choices.map((aug, i) => (
              <div key={aug.id} style={{ display: 'flex', flexDirection: 'column', gap: 15, width: 250 }}>
                <div
                  onClick={() => onPick(aug, { 
                    tier, 
                    initialChoices: augmentSetup.initial, 
                    rerolledSlots: rerollUsed.map(u => u > 0), 
                    finalChoices: choices 
                  })}
                  className={`aug-card-${aug.tier}`}
                  style={{
                    height: 350, width: 250, background: 'var(--bg1)', border: `2px solid ${TIER_COLORS[aug.tier]}`,
                    borderRadius: 16, padding: '30px 20px', cursor: 'pointer', transition: 'all 0.2s',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, position: 'relative', boxSizing: 'border-box'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.background = 'var(--bg3)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.background = 'var(--bg1)'; }}
                >
                  <div style={{ width: '100%', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 1)', borderRadius: 10, overflow: 'hidden', flexShrink: 0, boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)' }}>
                    {aug.imgName && (
                      <img src={getAugmentIconUrl(aug)} style={{ height: '85%', width: 'auto', objectFit: 'contain' }} />
                    )}
                  </div>
                  <div style={{ fontFamily: 'Noto Sans JP', fontSize: '17px', fontWeight: 900, color: 'var(--text-main)', textAlign: 'center', lineHeight: 1.2, minHeight: '40px', display: 'flex', alignItems: 'center' }}>
                    {aug.name}
                  </div>
                  <div style={{ fontFamily: 'Noto Sans JP', fontSize: '12px', color: 'var(--textdim)', lineHeight: 1.6, textAlign: 'center', overflowY: 'auto', width: '100%', paddingRight: '4px' }}>
                    {aug.desc}
                  </div>
                </div>

                <button
                  onClick={() => handleReroll(i)}
                  disabled={rerollUsed[i] >= maxRerolls}
                  style={{
                    background: rerollUsed[i] >= maxRerolls ? 'rgba(30,45,74,.4)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${rerollUsed[i] >= maxRerolls ? 'var(--border)' : TIER_COLORS[tier]}`,
                    color: rerollUsed[i] >= maxRerolls ? 'rgba(255,255,255,0.3)' : 'white',
                    borderRadius: 8, padding: '10px', cursor: rerollUsed[i] >= maxRerolls ? 'default' : 'pointer',
                    fontFamily: 'Noto Sans JP', fontSize: 12, fontWeight: 700, transition: 'all 0.2s'
                  }}
                >
                  {rerollUsed[i] >= maxRerolls ? '再抽選済み' : (maxRerolls > 1 ? `再抽選 (残り${maxRerolls - rerollUsed[i]})` : '再抽選')}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ── メインアプリ ── */
/* ── メインアプリ ── */
function Main() {
  // 🌟 URLからシード値を取得する処理
  const initialSeed = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('seed');
  }, []);

  // 🌟 URLにシードがあれば初期状態をGAMEにする
  const [view, setView] = useState(initialSeed ? 'GAME' : 'MENU');
  const [seed, setSeed] = useState(initialSeed ? initialSeed.toUpperCase() : "");
  const [gameKey, setGameKey] = useState(0);

  const startWithSeed = (targetSeed) => {
    const newSeed = targetSeed || Math.random().toString(36).substring(2, 9).toUpperCase();
    setSeed(newSeed);
    
    // 🌟 ゲーム開始時にURLをシード付きに書き換える（リロードなし）
    const newUrl = `${window.location.pathname}?seed=${newSeed}`;
    window.history.pushState({ path: newUrl }, '', newUrl);

    setGameKey(prev => prev + 1);
    setView('GAME');
  };


  if (view === 'MENU') {
    return (
      <div style={{ height:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:30, backgroundImage:`linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url("https://assets.st-note.com/production/uploads/images/263587712/rectangle_large_type_2_386d7257054746a6649e14bdb1432725.jpeg?width=4000&height=4000&fit=bounds&format=jpg&quality=90")`, backgroundSize:'cover', backgroundPosition:'center', padding:20, animation:'fadeIn 1s ease' }}>
<div style={{ 
  fontFamily:'Orbitron', 
  fontSize:'clamp(30px, 8vw, 70px)', // 改行するので少し小さめに調整
  fontWeight:900, 
  color:'#fff', 
  letterSpacing:15, 
  textShadow:`0 0 5px rgba(0,0,0,1),0 0 10px rgba(0,0,0,0.8),0 0 20px var(--gold),0 0 40px var(--gold)`, 
  textAlign:'center', 
  transform:'skewX(-5deg)', 
  opacity:0.95,
  lineHeight: 1.2 // 行間が広すぎないように調整
}}>
  TFT SET 17<br />
  <span style={{ fontSize: '0.7em', letterSpacing: 8 }}>1stage Simulator</span> 
</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <button 
            className="menu-btn" 
            style={{ width:220, background:'var(--blue)', color:'white', borderColor:'var(--blue)', boxShadow:'0 10px 30px rgba(0,0,0,0.5)', transition:'all 0.2s ease', cursor:'pointer' }} 
            onClick={() => startWithSeed()}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 15px 40px rgba(26,159,255,0.6)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)'; }}
          >
            ゲームスタート
          </button>
          <button 
            className="menu-btn" 
            style={{ width:220, background:'rgba(15,23,42,0.8)', color:'white', borderColor:'var(--border)', boxShadow:'0 10px 30px rgba(0,0,0,0.5)', transition:'all 0.2s ease', cursor:'pointer' }} 
            onClick={() => window.open('https://note.com/mo10c_/n/n10666b1fb74e', '_blank')}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.background = 'rgba(30,45,74,0.9)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'rgba(15,23,42,0.8)'; }}
          >
            使い方
          </button>
        </div>
      </div>
    );
  }
  return <App key={gameKey} seed={seed} onRestart={() => startWithSeed(seed)} onNewGame={() => startWithSeed()} />;
}

function App({ seed, onRestart, onNewGame }) {
  // 🌟 RNG（乱数生成器）をジャンルごとに独立させ、他の行動によるズレを防止！
  const rngSys = useMemo(() => createRNG(seed + "_sys"), [seed]);
  const rngShop = useMemo(() => createRNG(seed + "_shop"), [seed]);
  const rngDrop = useMemo(() => createRNG(seed + "_drop"), [seed]);
  const rngAug = useMemo(() => createRNG(seed + "_aug"), [seed]);
  const rngMisc = useMemo(() => createRNG(seed + "_misc"), [seed]);
  const rngEnc  = useMemo(() => createRNG(seed + "_enc"),  [seed]);

  const currentStargazerDesc = useMemo(() => stargazerVariants[Math.floor(rngSys() * stargazerVariants.length)], [rngSys]);

  // 1. 神の抽選
  const encounterGods = useMemo(() => {
    const shuffled = shuffleArray(GOD_DATA, rngSys);
    return [shuffled[0], shuffled[1]];
  }, [rngSys]);

  // 2. サイオニックアイテムの抽選
  const currentPsionicItems = useMemo(() => {
    const shuffled = shuffleArray(PSIONIC_ITEMS, rngSys);
    return [shuffled[0], shuffled[1]];
  }, [rngSys]);

  // 🌟 遭遇（Opening Encounter）の抽選 ── 神(GOD_DATA)とは別枠。専用RNGで出現確率(prob)による加重抽選。
  // data-encounters.js が未読込でも白画面で落ちないよう防御（その場合は遭遇なしで起動）。
  const encounter = useMemo(() => {
    const list = (typeof ENCOUNTERS !== 'undefined' && Array.isArray(ENCOUNTERS)) ? ENCOUNTERS : [];
    if (list.length === 0) return null;
    const total = list.reduce((sum, e) => sum + (e.prob || 0), 0);
    let r = rngEnc() * total;
    for (const e of list) { r -= (e.prob || 0); if (r <= 0) return e; }
    return list[list.length - 1];
  }, [rngEnc]);
  const encounterAppliedRef = useRef(false);    // 1-1→1-2 の開始効果ガード
  const encounter21AppliedRef = useRef(false);  // 2-1 到達時の効果ガード
  useEffect(() => {
    encounterAppliedRef.current = false;
    encounter21AppliedRef.current = false;
  }, [encounter]);

  // 3. 基本的なState（boardなど）を先に定義する 🌟重要
  const initBoard = () => Array(28).fill(null);
  const [gold, setGold] = useState(0);
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [round, setRound] = useState('1-1');
  const [shop, setShop] = useState(() => rollShop(1, rngShop));
  const [bench, setBench] = useState(Array(9).fill(null));
  const [board, setBoard] = useState(initBoard);
  const [inventory, setInventory] = useState([]);
  const [augments, setAugments] = useState([]);
  const [passiveBuffs, setPassiveBuffs] = useState([]);
  const [dragSrc, setDragSrc] = useState(null);
  const [dropMsg, setDropMsg] = useState(null);
  const [showAugment, setShowAugment] = useState(false);
  const [mergeToast, setMergeToast] = useState(null);
  const [isFinished, setIsFinished] = useState(false);
  const [traitTooltipData, setTraitTooltipData] = useState(null);
  const [tooltipData, setTooltipData] = useState(null);
  const [freeRerolls, setFreeRerolls] = useState(0);
  const [maxInterest, setMaxInterest] = useState(5);
  const [xpCostReduction, setXpCostReduction] = useState(0);
  const [augmentTierBoost, setAugmentTierBoost] = useState(0);
  const [noMoreAugments, setNoMoreAugments] = useState(false);
  const [afkRoundsLeft, setAfkRoundsLeft] = useState(0);
  const [droppedComps, setDroppedComps] = useState([]);
  const [showAssetDrawer, setShowAssetDrawer] = useState(false);
  const [showTierList, setShowTierList] = useState(false);
  const hoverTimer = useRef(null);
  const [pendingUnits, setPendingUnits] = useState([]);
  const [introStep, setIntroStep] = useState(0);
  const [auraTrainingUnit, setAuraTrainingUnit] = useState(null); // 🌟 オーラ育成中 専用の待機枠
  const [phase, setPhase] = useState('main'); // 🌟 追加: 'main' | 'drop'

  // 🌟 タッチドラッグ＆ピンチズーム用
  const [boardZoom, setBoardZoom] = useState(1.0);
  const touchDragRef = useRef(null); // { src, ghostEl }
  const pinchRef = useRef(null); // { startDist, startZoom }
  const boardContainerRef = useRef(null);
  const hDropRef = useRef(null); // hDropの最新参照

  // ── タッチドラッグ: ゴースト要素を生成して指で運ぶ ──
  const startTouchDrag = useCallback((e, src) => {
    e.preventDefault();
    const touch = e.touches[0];
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();

    // ゴースト（半透明コピー）を作る
    const ghost = el.cloneNode(true);
    ghost.style.cssText = `
      position:fixed; pointer-events:none; z-index:99999;
      width:${rect.width}px; height:${rect.height}px;
      left:${touch.clientX - rect.width/2}px; top:${touch.clientY - rect.height/2}px;
      opacity:0.7; transform:scale(1.1); transition:none;
    `;
    document.body.appendChild(ghost);
    touchDragRef.current = { src, ghostEl: ghost };
    setDragSrc(src);
  }, [setDragSrc]);

  const moveTouchDrag = useCallback((e) => {
    if (!touchDragRef.current) return;
    e.preventDefault();
    const touch = e.touches[0];
    const { ghostEl } = touchDragRef.current;
    if (ghostEl) {
      ghostEl.style.left = `${touch.clientX - parseFloat(ghostEl.style.width)/2}px`;
      ghostEl.style.top  = `${touch.clientY - parseFloat(ghostEl.style.height)/2}px`;
    }
  }, []);

  const endTouchDrag = useCallback((e) => {
    if (!touchDragRef.current) return;
    const touch = e.changedTouches[0];
    const { ghostEl } = touchDragRef.current;
    if (ghostEl) ghostEl.remove();
    touchDragRef.current = null;

    // 指を離した座標の要素を探してドロップターゲットを特定
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    const dropTarget = el && el.closest('[data-drop-type]');
    if (dropTarget && hDropRef.current) {
      const type = dropTarget.getAttribute('data-drop-type');
      const idx  = parseInt(dropTarget.getAttribute('data-drop-idx') || '-1');
      const syntheticE = { preventDefault: ()=>{}, stopPropagation: ()=>{} };
      hDropRef.current(type, idx)(syntheticE);
    } else {
      setDragSrc(null);
    }
  }, [setDragSrc]);

  // ── ピンチズーム ──
  const handleBoardTouchStart = useCallback((e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchRef.current = { startDist: Math.hypot(dx, dy), startZoom: boardZoom };
    }
  }, [boardZoom]);

  const handleBoardTouchMove = useCallback((e) => {
    if (e.touches.length === 2 && pinchRef.current) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const ratio = dist / pinchRef.current.startDist;
      const newZoom = Math.max(0.3, Math.min(1.2, pinchRef.current.startZoom * ratio));
      setBoardZoom(newZoom);
    }
  }, []);

  const handleBoardTouchEnd = useCallback((e) => {
    if (e.touches.length < 2) pinchRef.current = null;
  }, []);

  // ── グローバルtouchmove（ドラッグ中のスクロール抑止） ──
  useEffect(() => {
    const onMove = (e) => { if (touchDragRef.current) moveTouchDrag(e); };
    const onEnd  = (e) => { if (touchDragRef.current) endTouchDrag(e); };
    document.addEventListener('touchmove',  onMove, { passive: false });
    document.addEventListener('touchend',   onEnd);
    document.addEventListener('touchcancel',onEnd);
    return () => {
      document.removeEventListener('touchmove',  onMove);
      document.removeEventListener('touchend',   onEnd);
      document.removeEventListener('touchcancel',onEnd);
    };
  }, [moveTouchDrag, endTouchDrag]);

  // 🌟 アービター関連のState
  const [arbiterRule, setArbiterRule] = useState(null);
  const [showArbiterPopup, setShowArbiterPopup] = useState(false);
  const [arbiterStep, setArbiterStep] = useState('cause');
  const [tempCause, setTempCause] = useState(null);

  const [showMfPopup, setShowMfPopup] = useState(false);
  const [mfTargetUid, setMfTargetUid] = useState(null);
  const [anvilOptions, setAnvilOptions] = useState(null);

  // スマホ横持ち対応：ウィンドウリサイズ時に再レンダリング
  const [windowSize, setWindowSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  useEffect(() => {
    const onResize = () => setWindowSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    return () => { window.removeEventListener('resize', onResize); window.removeEventListener('orientationchange', onResize); };
  }, []);
  const isLandscapeMobile = windowSize.h <= 500;


  // シード値を基準に各カテゴリから1つずつ、指定の順序で抽出
  const arbiterOptions = useMemo(() => {
    const causeCategories = ['consistent', 'conditional', 'economy'];
    const causes = causeCategories.map(cat => {
      const options = ARBITER_CAUSES.filter(c => c.category === cat);
      return shuffleArray(options, rngSys)[0];
    });

    const effectCategories = ['offence', 'defence', 'economy'];
    const effects = effectCategories.map(cat => {
      const options = ARBITER_EFFECTS.filter(e => e.category === cat);
      return shuffleArray(options, rngSys)[0];
    });

    return { causes, effects };
  }, [rngSys]);

// ==========================================
  // 🌟 特性を計算する
  // ==========================================
  const traitCounts = {}; 
  const seenIds = new Set();
  board.filter(Boolean).forEach(c => { 
    if (!seenIds.has(c.id)) { 
      seenIds.add(c.id); 
      
      const unitTraits = new Set(c.traits);
      if (c.selectedMode) unitTraits.add(c.selectedMode);
      
      if (c.items) {
        c.items.forEach(it => {
          if (it.grantedTrait) unitTraits.add(it.grantedTrait);
        });
      }
      
      unitTraits.forEach(t => { traitCounts[t] = (traitCounts[t]||0)+1; }); 
    } 
  });

  // ==========================================
  // 🌟 修正：特性を計算した「後」に監視ロジックを置く！
  // ==========================================
  useEffect(() => {
    const count = traitCounts['Arbiter'] || 0;
    // アービターが(2)以上になり、かつまだルールが決まっていない場合にPOPを表示
    if (count >= 2 && !arbiterRule && !showArbiterPopup) {
      setShowArbiterPopup(true);
      setArbiterStep('cause'); // 開くときは必ず「原因」から
    }
  }, [traitCounts['Arbiter'], arbiterRule, showArbiterPopup]);



  // 5. サイオニックアイテムの自動管理（inventoryの更新）
  useEffect(() => {
    const count = traitCounts['Psionic'] || 0;
    setInventory(prev => {
      const otherItems = prev.filter(it => !it.isPsionic);
      const equippedNames = [...board, ...bench].filter(u => u?.items).flatMap(u => u.items).filter(it => it.isPsionic).map(it => it.name);
      let psionicToDisplay = [];
      if (count >= 2 && !equippedNames.includes(currentPsionicItems[0].jaName)) {
  psionicToDisplay.push({ 
    ...currentPsionicItems[0], 
    name: currentPsionicItems[0].jaName, // 画面表示用（日本語）
    imgName: currentPsionicItems[0].name, // 画像取得用（tft17_item...）
    isPsionic: true, 
    type: 'completed' 
  });
}
if (count >= 4 && !equippedNames.includes(currentPsionicItems[1].jaName)) {
  psionicToDisplay.push({ 
    ...currentPsionicItems[1], 
    name: currentPsionicItems[1].jaName, 
    imgName: currentPsionicItems[1].name, 
    isPsionic: true, 
    type: 'completed' 
  });
}
      return [...otherItems, ...psionicToDisplay];
    });
  }, [traitCounts['Psionic'], board, bench, currentPsionicItems]);

  // 6. サイオニックアイテムの自動管理（装備の強制削除）
  useEffect(() => {
    const count = traitCounts['Psionic'] || 0;
    const cleanup = (u) => {
      if (!u || !u.items) return u;
      const filtered = u.items.filter(it => {
        if (!it.isPsionic) return true;
        if (count < 2) return false;
        if (count < 4 && it.name === currentPsionicItems[1].name) return false;
        return true;
      });
      return filtered.length === u.items.length ? u : { ...u, items: filtered };
    };
    setBoard(prev => prev.map(cleanup));
    setBench(prev => prev.map(cleanup));
  }, [traitCounts['Psionic'], currentPsionicItems]);

  // 🌟 画像保存用のRefとStateを追加
  const resultRef = useRef(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // 🌟 今回遭遇した神（リザルト表示用。ランダムで選ばれた1体目を運命の神とする）
  const chosenGod = encounterGods[0];

  // 🌟 金床（アイテム選択）を展開する処理
  const triggerAnvilChoice = useCallback((anvilType) => {
    let pool = [];
    let count = 4;
    if (anvilType === 'component') {
      pool = ITEMS.filter(it => it.type === 'comp' && it.id !== 'spatula' && it.id !== 'pan');
    } else if (anvilType === 'completed') {
      const recipes = Object.values(ITEM_RECIPES);
      pool = recipes.filter(r => !r.grantedTrait && r.id !== 'tacticians_crown').map(r => ({...r, type: 'completed'}));
    } else if (anvilType === 'artifact') {
      pool = ARTIFACTS;
    } else if (anvilType === 'god_artifact') {
      pool = ARTIFACTS.filter(a => a.jaName.includes('の'));
    } else if (anvilType === 'radiant') {
      pool = RADIANT_ITEMS;
      count = pool.length;
    } else if (anvilType === 'duplication') {
      pool = ITEMS.filter(it => it.type === 'comp' && it.id !== 'spatula' && it.id !== 'pan');
      count = 3;
    }
    const shuffled = shuffleArray(pool, rngMisc).slice(0, count);
    setAnvilOptions({ items: shuffled, anvilType });
  }, [rngMisc]);

  // 🌟 POP用のタイマーを管理する箱（showMsg は依存配列で参照されるため、ここで先に宣言する）
  const dropMsgTimer = useRef(null);

  const showMsg = useCallback((msg, duration = 3000) => {
    setDropMsg(msg);
    // 🌟 前のタイマーが残っていたらキャンセルする（瞬殺されるのを防ぐ）
    if (dropMsgTimer.current) clearTimeout(dropMsgTimer.current);
    // 新しいタイマーをセット
    dropMsgTimer.current = setTimeout(() => setDropMsg(null), duration);
  }, []);

  // 🌟 キャプチャ処理
  const handleSaveImage = async () => {
    if (!resultRef.current) return;
    setIsSaving(true);
    try {
      // html2canvasでDOMを画像化 (外部画像も読み込めるように useCORS: true を指定)
      const canvas = await html2canvas(resultRef.current, {
        backgroundColor: '#04060e', // 背景色をアプリに合わせる
        scale: 2, // 高画質化
        useCORS: true 
      });
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `TFT_Set17_Result_${seed}.png`;
      link.click();
      showMsg('画像を保存しました！');
    } catch (err) {
      console.error(err);
      showMsg('画像の保存に失敗しました');
    }
    setIsSaving(false);
  };

  // 🌟 キャプチャした結果をクリップボードへコピー
  const handleCopyImage = async () => {
    if (!resultRef.current) return;
    setIsSaving(true);
    try {
      const canvas = await html2canvas(resultRef.current, {
        backgroundColor: '#04060e',
        scale: 2,
        useCORS: true
      });
      // canvas.toBlob は非同期なので Promise でラップ
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      if (blob && navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        showMsg('📋 画像をクリップボードにコピーしました！');
      } else {
        // クリップボード画像コピー非対応の環境では保存にフォールバック
        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = image;
        link.download = `TFT_Set17_Result_${seed}.png`;
        link.click();
        showMsg('お使いの環境はコピー非対応のため画像を保存しました');
      }
    } catch (err) {
      console.error(err);
      showMsg('画像のコピーに失敗しました');
    }
    setIsSaving(false);
  };


  


  const addXp = useCallback((amount) => {
    setXp(prevXp => {
      setLevel(prevLevel => {
        let curL = prevLevel;
        let curX = prevXp + amount;
        while (curX >= (XP_FOR_NEXT_LEVEL[curL] || 999) && curL < 9) {
          curX -= XP_FOR_NEXT_LEVEL[curL];
          curL++;
        }
        setXp(curX);
        return curL;
      });
      return prevXp; // will be overwritten by setLevel callback
    });
  }, []);

  const addGold = useCallback((amount) => setGold(g => g + amount), []);
  const addItem = useCallback((item) => setInventory(prev => [...prev, item]), []);
  const addPassiveBuff = useCallback((buff) => setPassiveBuffs(prev => [...prev, buff]), []);
  const setLevelDirect = useCallback((lv) => setLevel(lv), []);
  const setMaxInterestFn = useCallback((v) => setMaxInterest(v), []);
  const setXpCostReductionFn = useCallback((v) => setXpCostReduction(v), []);
  const setAugmentTierBoostFn = useCallback((v) => setAugmentTierBoost(v), []);
  const setNoMoreAugmentsFn = useCallback((v) => setNoMoreAugments(v), []);
  const setAfkRoundsLeftFn = useCallback((v) => setAfkRoundsLeft(v), []);
  const addFreeRerolls = useCallback((n) => setFreeRerolls(prev => prev + n), []);

  const addChampToBench = useCallback((cost, count, rngFn) => {
    setBench(prev => {
      const nb = [...prev];
      const pool = CHAMPS.filter(c => c.cost === cost);
      for (let i = 0; i < count; i++) {
        const slot = nb.findIndex(x => !x);
        if (slot !== -1) nb[slot] = { ...pool[Math.floor(rngFn() * pool.length)], star: 1, uid: rngFn(), items: [] };
      }
      return nb;
    });
  }, []);

  const addChampToBenchDirect = useCallback((champ) => {
    setBench(prev => {
      const nb = [...prev];
      const slot = nb.findIndex(x => !x);
      if (slot !== -1) nb[slot] = champ;
      return nb;
    });
  }, []);

  const addChampToBoard = useCallback((cost, count, rngFn, slotIdx = 17) => {
    const pool = CHAMPS.filter(c => c.cost === cost);
    const chosenChamps = [];
    for (let i = 0; i < count; i++) {
      chosenChamps.push({ ...pool[Math.floor(rngFn() * pool.length)], star: 1, uid: rngFn(), items: [] });
    }
    
    setBoard(prev => {
      const nb = [...prev];
      nb[slotIdx] = chosenChamps[0]; // 1体目は盤面へ
      return nb;
    });

    if (count > 1) {
      setBench(prev => {
        const nb = [...prev];
        for (let i = 1; i < count; i++) {
          const slot = nb.findIndex(x => !x);
          if (slot !== -1) nb[slot] = chosenChamps[i];
        }
        return nb;
      });
    }
  }, []);

  const addChampToBoardDirect = useCallback((champ, slotIdx = 17) => {
    setBoard(prev => {
      const nb = [...prev];
      nb[slotIdx] = champ;
      return nb;
    });
  }, []);

  const addAnvilToBench = useCallback((type, count) => {
    setBench(prev => {
      const nb = [...prev];
      for (let i = 0; i < count; i++) {
        const slot = nb.findIndex(x => !x);
        if (slot !== -1) nb[slot] = createAnvil(type);
        else { showMsg("⚠️ ベンチが一杯で金床を獲得できませんでした"); break; }
      }
      return nb;
    });
  }, [showMsg]);

  // 🌟 金床売却・選択（依存する showMsg / addPassiveBuff より後に宣言する）
  const handleSellAnvil = useCallback((anvil) => {
    triggerAnvilChoice(anvil.anvilType);
  }, [triggerAnvilChoice]);

  const handleAnvilSelect = useCallback((item) => {
    setInventory(prev => [...prev, item]);
    if (anvilOptions && anvilOptions.anvilType === 'duplication') {
      addPassiveBuff({ type: 'duplication_item', itemId: item.id, roundsLeft: 2 });
    }
    setAnvilOptions(null);
    showMsg(
      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
        <img src={getMetaTFTItemUrl(item)} style={{ width:18, height:18, borderRadius:2 }} />
        <span>{getJaName(item.name || item.id)} を獲得しました！</span>
      </div>
    );
  }, [showMsg, anvilOptions, addPassiveBuff]);

  // Appコンポーネント内のState定義のあたりに追加

// 🌟 ベンチの空きを監視して、待機ユニットを自動で追加するロジック
useEffect(() => {
  if (pendingUnits.length > 0) {
    const emptySlot = bench.findIndex(x => !x);
    if (emptySlot !== -1) {
      // 空きがある場合：1体ベンチに移動
      const nextUnit = pendingUnits[0];
      setBench(prev => {
        const nb = [...prev];
        nb[emptySlot] = nextUnit;
        return nb;
      });
      setPendingUnits(prev => prev.slice(1));
    } else {
      // 空きがない場合：警告を出す（1回だけ出るように調整）
      showMsg(
        <div style={{ color: 'var(--red)', fontWeight: 900 }}>
          ⚠️ ベンチが満杯です！<br/>チャンピオンを売却して空きを作ってください
        </div>
      );
    }
  }
}, [bench, pendingUnits, showMsg]);

  // 🌟 星アップ（合成）の自動チェック
  useEffect(() => {
    if (phase === 'drop') return; // ドロップフェーズ中は合成しない

    let nb = [...bench];
    let nbrd = [...board];
    let evolved = false;
    let newToast = null;
    let overflowItems = [];

    let checkAgain = true;
    while (checkAgain) {
      checkAgain = false;
      const counts = {};
      [...nb, ...nbrd].forEach(u => {
        if (u && !u.isAnvil) {
          const k = `${u.id}_${u.star || 1}`;
          counts[k] = (counts[k] || 0) + 1;
        }
      });

      for (const k in counts) {
        if (counts[k] >= 3) {
          const [id, s] = k.split('_');
          const star = parseInt(s);
          if (star < 3) {
            let toRem = 3;
            let collected = [];
            let targetBoardIdx = -1;

            // 1. ボード上の同名・同星ユニットを消去＆アイテム回収
            for (let j = 0; j < nbrd.length && toRem > 0; j++) {
              if (nbrd[j] && nbrd[j].id === id && nbrd[j].star === star) {
                if (targetBoardIdx === -1) targetBoardIdx = j; // 最初に見つけたボードの位置を記憶
                if (nbrd[j].items) collected.push(...nbrd[j].items);
                nbrd[j] = null;
                toRem--;
              }
            }
            // 2. ベンチからの消去＆アイテム回収
            for (let j = 0; j < nb.length && toRem > 0; j++) {
              if (nb[j] && nb[j].id === id && nb[j].star === star) {
                if (nb[j].items) collected.push(...nb[j].items);
                nb[j] = null;
                toRem--;
              }
            }

            // 3. 進化ユニット作成
            const up = { ...CHAMPS.find(c => c.id === id), star: star + 1, uid: rngMisc(), items: collected.slice(0, 3) };
            if (collected.length > 3) {
              overflowItems.push(...collected.slice(3));
            }

            // 4. 配置
            if (targetBoardIdx !== -1) {
              nbrd[targetBoardIdx] = up;
            } else {
              const slot = nb.findIndex(x => !x);
              if (slot !== -1) {
                nb[slot] = up;
              } else {
                nb[0] = up; // 万が一のためのフォールバック
              }
            }
            
            newToast = up;
            evolved = true;
            checkAgain = true;
            break;
          }
        }
      }
    }

    if (evolved) {
      setBench(nb);
      setBoard(nbrd);
      if (overflowItems.length > 0) {
        setInventory(prev => [...prev, ...overflowItems]);
        showMsg("⚠️ 溢れたアイテムを回収しました");
      }
      if (newToast) setMergeToast(newToast);
    }
  }, [phase, bench, board, rngMisc, showMsg]);

  // 🌟 レベルアップ時に発動するオーグメントを管理する（関数定義より後ろに移動）
  const prevLevelRef = useRef(level);
  useEffect(() => {
    if (prevLevelRef.current < level) {
      // Level up occurred!
      const hasBD = passiveBuffs.some(b => b.type === 'birthday_gift');
      if (hasBD) {
        const cost = Math.min(5, Math.max(1, level - 4));
        const pool = CHAMPS.filter(c => c.cost === cost);
        if (pool.length) {
          const champ = { ...pool[Math.floor(rngMisc() * pool.length)], star: 2, uid: rngMisc(), items: [] };
          addChampToBenchDirect(champ);
          setGold(g => g + 1);
          showMsg(`🎂 バースデープレゼント: ★★${champ.jaName}+1G！`);
        }
      }
      const hasUM = passiveBuffs.some(b => b.type === 'upward_mobility');
      if (hasUM) {
        setFreeRerolls(fr => fr + 2);
      }
      const protectorsPactBuff = passiveBuffs.find(b => b.type === 'protectors_pact');
      if (protectorsPactBuff) {
        const champData = CHAMPS.find(c => c.id === protectorsPactBuff.champId);
        if (champData) {
          setPendingUnits(prev => [...prev, { ...champData, star: 1, uid: rngMisc(), items: [] }]);
          showMsg(`🤝 庇護者のお供: レベルアップボーナスで${champData.jaName}を1体獲得！`);
        }
      }
    }
    prevLevelRef.current = level;
  }, [level, passiveBuffs, rngMisc, addChampToBenchDirect, showMsg, setGold, setFreeRerolls]);


  const augmentHelpers = useMemo(() => ({
    addGold, addXp, addItem, addPassiveBuff, showMsg, getJaName,
    addChampToBench: (cost, count, r) => addChampToBench(cost, count, r || rngMisc),
    addChampToBenchDirect,
    addChampToBoard: (cost, count, r) => addChampToBoard(cost, count, r || rngMisc),
    addChampToBoardDirect,
    addAnvilToBench,
    triggerAnvilChoice,
    addPendingUnits: (units) => setPendingUnits(prev => [...prev, ...units]),
    addAuraTrainingUnit: setAuraTrainingUnit, // 🌟 専用枠への追加ヘルパー
    setLevel: setLevelDirect, setMaxInterest: setMaxInterestFn,
    setXpCostReduction: setXpCostReductionFn, setAugmentTierBoost: setAugmentTierBoostFn,
    setNoMoreAugments: setNoMoreAugmentsFn, setAfkRoundsLeft: setAfkRoundsLeftFn,
    addFreeRerolls,
    setShop,
    setIsFinished,
  }), [addGold, addXp, addItem, addPassiveBuff, showMsg, addChampToBench, addChampToBenchDirect, addChampToBoard, addChampToBoardDirect, addAnvilToBench, triggerAnvilChoice, setLevelDirect, setMaxInterestFn, setXpCostReductionFn, setAugmentTierBoostFn, setNoMoreAugmentsFn, setAfkRoundsLeftFn, addFreeRerolls, rngMisc, setIsFinished]);

  useEffect(() => {
    if (mergeToast) {
      const timer = setTimeout(() => setMergeToast(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [mergeToast]);

  const [dropPlan] = useState(() => {
    const roll = rngDrop() * 100;
    let plan;
    // BASE (95%)
    if (roll < 33.25) plan = { comp: 3, gray: 3, blue: 0 };
    else if (roll < 66.50) plan = { comp: 3, gray: 0, blue: 1 };
    else if (roll < 77.90) plan = { comp: 2, gray: 1, blue: 1 };
    else if (roll < 89.30) plan = { comp: 2, gray: 2, blue: 1 };
    else if (roll < 95.00) plan = { comp: 1, gray: 1, blue: 2 };
    // HIGH (5%)
    else if (roll < 96.15) plan = { comp: 5, gray: 3, blue: 0 };
    else if (roll < 97.30) plan = { comp: 5, gray: 0, blue: 1 };
    else if (roll < 98.20) plan = { comp: 4, gray: 0, blue: 1 };
    else if (roll < 99.10) plan = { comp: 3, gray: 0, blue: 2 };
    else plan = { comp: 3, gray: 5, blue: 0 };

    const allDrops = [];
    for (let i = 0; i < plan.comp; i++) allDrops.push('comp');
    for (let i = 0; i < plan.gray; i++) allDrops.push('GRAY');
    for (let i = 0; i < plan.blue; i++) allDrops.push('BLUE');

    const drops = { '1-2': [], '1-3': [], '1-4': [] };

    // 1-2ラウンドの確定枠を確保
    // 1. 素材(comp)を1つ確保
    const compIdx = allDrops.indexOf('comp');
    if (compIdx > -1) {
      drops['1-2'].push(allDrops.splice(compIdx, 1)[0]);
    } else {
      drops['1-2'].push('comp');
    }

    // 2. 青オーブ(BLUE)を1つ確保、なければ灰色オーブ(GRAY)
    const blueIdx = allDrops.indexOf('BLUE');
    if (blueIdx > -1) {
      drops['1-2'].push(allDrops.splice(blueIdx, 1)[0]);
    } else {
      const grayIdx = allDrops.indexOf('GRAY');
      if (grayIdx > -1) {
        drops['1-2'].push(allDrops.splice(grayIdx, 1)[0]);
      } else if (allDrops.length > 0) {
        drops['1-2'].push(allDrops.pop());
      }
    }

    // ドロップをシャッフル
    const shuffled = shuffleArray(allDrops, rngDrop);
    
    // 各ラウンドに最低1個はドロップするように割り当て
    if (shuffled.length > 0) drops['1-3'].push(shuffled.pop());
    if (shuffled.length > 0) drops['1-4'].push(shuffled.pop());

    // 残りをランダムなラウンド(1-2, 1-3, 1-4)に振り分ける
    const rounds = ['1-2', '1-3', '1-4'];
    while (shuffled.length > 0) {
      const targetRound = rounds[Math.floor(rngDrop() * rounds.length)];
      drops[targetRound].push(shuffled.pop());
    }

    return drops;
  });

  const executeOrbDrop = (type) => {
    const roll = rngDrop() * 100;
    const rowStyle = { display: 'flex', alignItems: 'center', gap: 10, color: 'white', fontFamily: 'Noto Sans JP', fontWeight: 900, fontSize: '20px' };
    const iconStyle = (cost) => ({ width: 50, height: 50, border: `1px solid ${COST_COLORS[cost]}`, borderRadius: 3, background: '#1e293b' });

    // 🌟 複数体ドロップ用の汎用ヘルパー
    const rollMultiple = (cost, count) => {
      const pool = CHAMPS.filter(c => c.cost === cost);
      const droppedUnits = [];
      for (let i = 0; i < count; i++) {
        const c = pool[Math.floor(rngDrop() * pool.length)];
        const unit = { ...c, star: 1, uid: rngMisc(), items: [] };
        addChampToBenchDirect(unit);
        droppedUnits.push(unit);
      }
      return (
        <div style={rowStyle}>
          <div style={{ display:'flex', gap:2 }}>
            {droppedUnits.map((u, idx) => (
              <img key={idx} src={boardIcon(u.img)} style={iconStyle(cost)} title={u.jaName} />
            ))}
          </div>
          <span>{droppedUnits.length > 1 ? `${droppedUnits[0].jaName}等` : droppedUnits[0].jaName}</span>
        </div>
      );
    };

    if (type === 'GRAY') {
      if (roll < 48) return rollMultiple(1, 2); // 🌟 1コス×2体（個別抽選）
      if (roll < 95) return rollMultiple(2, 1); // 🌟 2コス×1体
      if (roll < 98) {
        setInventory(p => [...p, CONSUMABLES.REFORGER]); setGold(g => g + 2);
        return <div style={rowStyle}><img src={getMetaTFTItemUrl('Reforger')} style={iconStyle(1)} /><span>再合成 + 2G</span></div>;
      }
      if (roll < 99) {
        setInventory(p => {
          const nb = [...p];
          const ex = nb.findIndex(i => i.id === 'remover');
          if (ex !== -1) nb[ex] = { ...nb[ex], count: (nb[ex].count || 1) + 1 };
          else nb.push({ ...CONSUMABLES.REMOVER, count: 1 });
          return nb;
        });
        setGold(g => g + 2);
        return <div style={rowStyle}><img src={getMetaTFTItemUrl('itemremover')} style={iconStyle(1)} /><span>除去装置 + 2G</span></div>;
      }
      setInventory(p => [...p, CONSUMABLES.LESSER_DUPE]);
      return <div style={rowStyle}><img src={getMetaTFTItemUrl('Lesser Champion Duplicator')} style={iconStyle(1)} /><span>小型複製機</span></div>;

    } else if (type === 'BLUE') {
      if (roll < 33) return rollMultiple(3, 2); // 🌟 3コス×2体（個別抽選）
      if (roll < 64) {
        const res = rollMultiple(3, 1);
        setGold(g => g + 3);
        return <div style={rowStyle}>{res}<span> + 3G</span></div>;
      }
      if (roll < 95) return rollMultiple(2, 3); // 🌟 2コス×3体（個別抽選）
      if (roll < 97) {
        const res = rollMultiple(2, 2);
        setInventory(p => [...p, CONSUMABLES.LESSER_DUPE]);
        return <div style={rowStyle}><img src={getMetaTFTItemUrl('Lesser Champion Duplicator')} style={iconStyle(1)} /><span>＋</span>{res}</div>;
      }
      if (roll < 99) {
        setInventory(p => [...p, CONSUMABLES.REFORGER]); setGold(g => g + 6);
        return <div style={rowStyle}><img src={getMetaTFTItemUrl('Reforger')} style={iconStyle(1)} /><span>再合成 + 6G</span></div>;
      }
      const pool = CHAMPS.filter(c => c.cost === 3);
      const c = pool[Math.floor(rngDrop() * pool.length)];
      setInventory(p => [...p, CONSUMABLES.CHAMP_DUPE]);
      addChampToBenchDirect({ ...c, star: 1, uid: rngMisc(), items: [] });
      return <div style={rowStyle}><img src={getMetaTFTItemUrl('Champion Duplicator')} style={iconStyle(1)} /><span>＋</span><img src={boardIcon(c.img)} style={iconStyle(3)} /><span>{c.jaName}</span></div>;
    }
  };

  const triggerDrops = (currentRound) => {
    const drops = dropPlan[currentRound];
    if (!drops || drops.length === 0) return;

    let newItems = [];
    let dropElements = [];
    let newlyDroppedIds = [];

    drops.forEach((dropType, i) => {
      if (dropType === 'comp') {
        const comps = ITEMS.filter(it => it.type === 'comp' && it.id !== 'spatula' && it.id !== 'pan');
        let availableComps = comps.filter(c => !droppedComps.includes(c.id) && !newlyDroppedIds.includes(c.id));
        
        if (availableComps.length === 0) {
          availableComps = comps;
        }

        const item = availableComps[Math.floor(rngDrop() * availableComps.length)];
        
        newItems.push(item);
        newlyDroppedIds.push(item.id);
        
        dropElements.push(
          <div key={`item-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'white', fontFamily: 'Noto Sans JP', fontWeight: 900, fontSize: '20px' }}>
            <img src={getMetaTFTItemUrl(item.name)} style={{ width: 50, height: 50, border: '1px solid rgba(255,255,255,0.6)', borderRadius: 3, background: '#1e293b' }} />
            <span>{getJaName(item.name)}</span>
          </div>
        );
      } else {
        const orbResult = executeOrbDrop(dropType);
        dropElements.push(<div key={`orb-${i}`}>{orbResult}</div>);
      }
    });

    if (newItems.length > 0) setInventory(prev => [...prev, ...newItems]);
    
    if (newlyDroppedIds.length > 0) {
      setDroppedComps(prev => [...prev, ...newlyDroppedIds]);
    }

    // 🌟 古いタイマーをリセットする仕様になった showMsg を使用
    showMsg(
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 15, flexWrap:'wrap' }}>
        {dropElements}
      </div>, 
      4000
    );
  };

  // レベルアップ処理（addXpの安定版）
  const applyXp = (amount, curLevel, curXp) => {
    let lv = curLevel;
    let x = curXp + amount;
    while (x >= (XP_FOR_NEXT_LEVEL[lv] || 999) && lv < 9) {
      x -= XP_FOR_NEXT_LEVEL[lv];
      lv++;
    }
    return { level: lv, xp: x };
  };

  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleNextRound = (forcedRound) => {
    if (isTransitioning) return;

    const currentR = forcedRound || round;
    if (currentR === '2-1') {
      setIsFinished(true);
      return;
    }
    
    const schedule = ['1-1', '1-2', '1-3', '1-4', '2-1'];
    const nextR = schedule[schedule.indexOf(currentR) + 1];

    setIsTransitioning(true);

    if (currentR === '1-1') {
      const skipDefaultChamp = encounter && ['viktor', 'miipsy', 'lissandra', 'missfortune'].includes(encounter.id);

      if (!skipDefaultChamp) {
        const pool = CHAMPS.filter(c => c.cost === 1);
        const chosen = pool[Math.floor(rngMisc() * pool.length)];
        const unit = { ...chosen, star: 1, uid: rngMisc(), items: [] };
        
        setBoard(prev => {
          const nb = [...prev];
          nb[17] = unit; // 盤面中央に配置
          return nb;
        });
      }

      // 🌟 除去装置をスタック（重ねて）追加する処理
      setInventory(prev => {
        const nb = [...prev];
        const existingIdx = nb.findIndex(i => i && i.id === 'remover');
        if (existingIdx !== -1) {
          // すでにある場合はカウントを+4する
          nb[existingIdx] = { ...nb[existingIdx], count: (nb[existingIdx].count || 1) + 4 };
        } else {
          // ない場合はカウント4で新規追加する
          nb.push({ ...CONSUMABLES.REMOVER, count: 4 });
        }
        return nb;
      });



      // 1-2用の巨大POP（名前やアイコンのサイズはお好みで調整してください）

      // 🌟 遭遇（Opening Encounter）の開始効果を発動（1ゲーム1回だけ）
      if (encounter && encounter.effect && !encounterAppliedRef.current) {
        encounterAppliedRef.current = true;
        try {
          encounter.effect({ gold, level, xp }, rngEnc, augmentHelpers);
        } catch (e) {
          console.error('encounter effect error', e);
        }
      }

      setTimeout(() => {
        setRound(nextR);
        setPhase('main');
        processRoundStart(nextR, currentR);
        setIsTransitioning(false);
      }, 800);
      return;
    }

    if (phase === 'main') {
      if (currentR === '1-2') {
        triggerDrops(currentR);
        setTimeout(() => {
          setRound(nextR);
          setPhase('main');
          processRoundStart(nextR, currentR);
          setIsTransitioning(false);
        }, 800);
      } else {
        triggerDrops(currentR);
        setTimeout(() => {
          setPhase('drop');
          setIsTransitioning(false);
        }, 800);
      }
    } else if (phase === 'drop') {
      setTimeout(() => {
        setRound(nextR);
        setPhase('main');
        processRoundStart(nextR, currentR);
        setIsTransitioning(false);
      }, 800);
    }
  };

  const processRoundStart = (nextR, currentR) => {
    if (afkRoundsLeft > 0) {
      const newLeft = afkRoundsLeft - 1;
      setAfkRoundsLeft(newLeft);
      if (newLeft === 0) {
        setGold(g => g + 20);
        setDropMsg('💤 AFK解除！20G獲得！');
        setTimeout(() => setDropMsg(null), 2500);
      }
    }

    const hasTS = passiveBuffs.some(b => b.type === 'trade_sector');
    if (hasTS) setFreeRerolls(fr => fr + 1);

    let buffsChanged = false;
    let dupItemsToAdd = [];
    const nextBuffs = passiveBuffs.map(b => {
      if (b.type === 'warlords_honor' && b.stacks < 4) {
        buffsChanged = true;
        return { ...b, stacks: Math.min(4, b.stacks + 1) };
      }
      if (b.type === 'duplication_item' && b.roundsLeft > 0) {
        buffsChanged = true;
        const item = ITEMS.find(i => i.id === b.itemId);
        if (item) dupItemsToAdd.push(item);
        return { ...b, roundsLeft: b.roundsLeft - 1 };
      }
      return b;
    });
    if (buffsChanged) setPassiveBuffs(nextBuffs);
    if (dupItemsToAdd.length > 0) {
      setInventory(inv => [...inv, ...dupItemsToAdd]);
      setTimeout(() => showMsg(`👯 複製: ${getJaName(dupItemsToAdd[0].name)}を追加獲得！`), 1500);
    }

    setGold(g => {
      if (nextR === '1-2') return g + 0; 
      if (nextR === '1-3') return g + 2;
      const interest = Math.min(maxInterest, Math.floor(g / 10));
      const baseIncome = {  '1-4': 2, '2-1': 3 }[nextR] || 5;
      const hasSA = passiveBuffs.some(b => b.type === 'savings_account');
      const extraG = (hasSA && interest >= 5) ? 30 : 0;
      return g + baseIncome + interest + extraG;
    });

    const xpGain = (currentR === '1-1') ? 0 : 2;
    const { level: newLevel, xp: newXp } = applyXp(xpGain, level, xp);
    
    if (newLevel > level) {
      const hasBD = passiveBuffs.some(b => b.type === 'birthday_gift');
      if (hasBD) {
        const cost = Math.min(5, Math.max(1, newLevel - 4));
        const pool = CHAMPS.filter(c => c.cost === cost);
        if (pool.length) {
          const champ = { ...pool[Math.floor(rngMisc() * pool.length)], star: 2, uid: rngMisc(), items: [] };
          addChampToBenchDirect(champ);
          setGold(g => g + 1);
          setDropMsg(`🎂 バースデープレゼント: ★★${champ.jaName}+1G！`);
          setTimeout(() => setDropMsg(null), 2500);
        }
      }
      const hasUM = passiveBuffs.some(b => b.type === 'upward_mobility');
      if (hasUM) setFreeRerolls(fr => fr + 2);
      
      const hasEp = passiveBuffs.some(b => b.type === 'epoch');
      if (hasEp) {
        const r = applyXp(4, newLevel, newXp);
        setLevel(r.level);
        setXp(r.xp);
      }
    }

    setLevel(newLevel); 
    setXp(newXp);
    setShop(rollShop(newLevel, rngShop));

    if (nextR === '2-1' && !noMoreAugments) {
      setShowAugment(true);
    }

    if (nextR === '2-1' && encounter && encounter.freeRerollsAt21 && !encounter21AppliedRef.current) {
      encounter21AppliedRef.current = true;
      addFreeRerolls(encounter.freeRerollsAt21);
      showMsg(`🎲 ${encounter.champ}: 無料リロール +${encounter.freeRerollsAt21}！`);
    }
  };

const handleAugmentPick = (aug, historyContext) => {
  // 🌟 augデータの中に history オブジェクトとして文脈データをまるごと保存
  setAugments(prev => [...prev, { ...aug, history: historyContext }]);
  setAugmentTierBoost(0);
  aug.effect({ gold, level, xp }, rngAug, augmentHelpers);
  setShowAugment(false);

  // 通知メッセージを画像付きにする
  setDropMsg(
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
      <img src={getAugmentIconUrl(aug)} style={{ width: 24, height: 24, borderRadius: 4 }} />
      <span>{aug.name} を獲得しました</span>
    </div>
  );
  setTimeout(() => setDropMsg(null), 2000);
};

  // hDropRefを常に最新のhDropに同期
  useEffect(() => { hDropRef.current = hDrop; });

  const debugDropAllItems = () => {
    const allComps = ITEMS.filter(it => it.type === 'comp');
    const allEmblems = Object.values(ITEM_RECIPES)
      .filter(recipe => recipe.grantedTrait || recipe.id === 'tacticians_crown')
      .map(recipe => ({ ...recipe, type: 'completed' }));
    setInventory(prev => [...prev, ...allComps, ...allEmblems]);
    showMsg("🛠️ デバッグ: 素材と紋章をすべて追加しました");
  };

  const debugDropAllArtifacts = () => {
    setInventory(prev => [...prev, ...ARTIFACTS]);
    showMsg("🛠️ デバッグ: アーティファクトをすべて追加しました");
  };

  const hDrop = (targetType, targetIdx) => (e) => {
    e.preventDefault();
    e.stopPropagation(); // 🌟 重複判定を防ぐためのストッパー

    if (!dragSrc) return;

    // 🌟 素材ドロップフェーズ中の盤面への配置・移動制限
    if (phase === 'drop' && targetType === 'board') {
      if (dragSrc.type === 'bench' || dragSrc.type === 'drawer_champ' || dragSrc.type === 'board') {
        showMsg("⚠️ 素材ドロップフェーズ中は盤面への配置・移動はできません");
        setDragSrc(null);
        return;
      }
    }
    if (phase === 'drop' && dragSrc.type === 'board' && targetType !== 'board') {
      showMsg("⚠️ 素材ドロップフェーズ中は盤面からの移動はできません");
      setDragSrc(null);
      return;
    }

    let nb = [...bench], nbrd = [...board], ns = [...shop], ninv = [...inventory];

    // ==========================================
    // 0. 金床アイテムの選択（どこにドロップしてもインベントリに追加）
    // ==========================================
    if (dragSrc.type === 'anvil_item') {
      handleAnvilSelect(dragSrc.item);
      setDragSrc(null);
      return;
    }

    // ==========================================
    // 0. ドロワーからの金床追加
    // ==========================================
    if (dragSrc.type === 'drawer_anvil') {
      if (targetType === 'bench') {
        const slot = targetIdx !== -1 && !nb[targetIdx] ? targetIdx : nb.findIndex(x => !x);
        if (slot === -1) { showMsg("⚠️ ベンチに空きがありません"); setDragSrc(null); return; }
        nb[slot] = { ...dragSrc.anvil, uid: rngMisc() };
        setBench(nb);
      } else {
        showMsg("⚠️ 金床はベンチにのみ配置できます");
      }
      setDragSrc(null); return;
    }

    // --- リフォージ用の抽選ロジック ---
    const getReforgeTarget = (itemToReforge) => {
      if (itemToReforge.type === 'comp') {
        if (itemToReforge.id === 'spatula') return { ...ITEMS.find(x => x.id === 'pan') };
        if (itemToReforge.id === 'pan') return { ...ITEMS.find(x => x.id === 'spatula') };
        
        const comps = ITEMS.filter(x => x.type === 'comp' && x.id !== itemToReforge.id && x.id !== 'spatula' && x.id !== 'pan');
        const pool = comps.length > 0 ? comps : ITEMS.filter(x => x.type === 'comp' && x.id !== 'spatula' && x.id !== 'pan');
        return { ...pool[Math.floor(rngMisc() * pool.length)] };
      }
      if (itemToReforge.type === 'completed') {
        if (itemToReforge.id === 'tacticians_crown') return itemToReforge; // 王冠はそのまま
        const entries = Object.entries(ITEM_RECIPES);
        const normalComps = entries.filter(([k]) => !k.includes('spatula') && !k.includes('pan') && !k.includes('unbuildable')).map(e => e[1]);
        const craftEmblems = entries.filter(([k, v]) => (k.includes('spatula') || k.includes('pan')) && v.id !== 'tacticians_crown').map(e => e[1]);
        const uncraftEmblems = entries.filter(([k]) => k.includes('unbuildable')).map(e => e[1]);
        let pool = normalComps;
        if (uncraftEmblems.some(e => e.id === itemToReforge.id)) pool = uncraftEmblems;
        else if (craftEmblems.some(e => e.id === itemToReforge.id)) pool = craftEmblems;
        const validPool = pool.filter(e => e.id !== itemToReforge.id);
        const targetPool = validPool.length > 0 ? validPool : pool;
        return { ...targetPool[Math.floor(rngMisc() * targetPool.length)], type: 'completed' };
      }
      return itemToReforge;
    };

    // ==========================================
    // 0. ドロワーからのオーグメント獲得
    // ==========================================
    if (dragSrc.type === 'drawer_augment') {
      handleAugmentPick(dragSrc.augment, { tier: dragSrc.augment.tier, initialChoices: [], rerolledSlots: [], finalChoices: [dragSrc.augment] });
      setDragSrc(null); return;
    }

    // ==========================================
    // 1. アイテム関連の処理
    // ==========================================
    if ((targetType === 'board' || targetType === 'bench') && (dragSrc.type === 'inventory' || dragSrc.type === 'drawer_item')) {
      const targetArr = targetType === 'board' ? nbrd : nb;
      const unit = targetArr[targetIdx];
      const newItem = dragSrc.type === 'drawer_item' ? dragSrc.item : ninv[dragSrc.idx];
      
      if (unit && newItem) {
        if (unit.isAnvil) {
          showMsg("⚠️ 金床にアイテムは装備できません！"); setDragSrc(null); return;
        }
        if (!unit.items) unit.items = [];
        if (newItem.type === 'consumable') {
          if (newItem.id === 'remover') {
            if (unit.items.length === 0) { showMsg("⚠️ アイテムを持っていません！"); setDragSrc(null); return; }
            ninv.push(...unit.items); unit.items = []; 
            
            if (dragSrc.type === 'inventory') {
              if (newItem.count && newItem.count > 1) ninv[dragSrc.idx] = { ...newItem, count: newItem.count - 1 };
              else ninv.splice(dragSrc.idx, 1);
            }
            
            showMsg(<div style={{ display:'flex', alignItems:'center', gap:6 }}><img src={getMetaTFTItemUrl(newItem.name)} style={{ width:18, height:18 }} /><span>アイテムを取り外しました</span></div>);
          } else if (newItem.id === 'reforger') {
            if (unit.items.length === 0) { showMsg("⚠️ アイテムを持っていません！"); setDragSrc(null); return; }
            const newItems = unit.items.map(it => getReforgeTarget(it));
            ninv.push(...newItems); unit.items = []; 
            if (dragSrc.type === 'inventory') ninv.splice(dragSrc.idx, 1);
            showMsg(<div style={{ display:'flex', alignItems:'center', gap:6 }}><img src={getMetaTFTItemUrl(newItem.name)} style={{ width:18, height:18 }} /><span>アイテムを再合成して取り外しました</span></div>);
          } else if (newItem.id === 'champ_dupe' || newItem.id === 'lesser_dupe' || newItem.id === 'tiny_dupe') {
            if (newItem.id === 'tiny_dupe' && unit.cost > 1) { showMsg("⚠️ 1コストのみ使用可"); setDragSrc(null); return; }
            if (newItem.id === 'lesser_dupe' && unit.cost > 3) { showMsg("⚠️ 1〜3コストのみ使用可"); setDragSrc(null); return; }
            const emptySlot = nb.findIndex(x => !x);
            if (emptySlot === -1) { showMsg("⚠️ ベンチに空きがありません"); setDragSrc(null); return; }
            const copy = { ...CHAMPS.find(c => c.id === unit.id), star:1, uid:rngMisc(), items:[] };
            nb[emptySlot] = copy; 
            if (dragSrc.type === 'inventory') ninv.splice(dragSrc.idx, 1);
            showMsg(<div style={{ display:'flex', alignItems:'center', gap:6 }}><img src={getMetaTFTItemUrl(newItem.name)} style={{ width:18, height:18 }} /><span>{unit.jaName}を複製しました！</span></div>);
            // 簡易星アップ判定
            const counts = {}; [...nb, ...nbrd].forEach(u => { if (u && !u.isAnvil) { const k = `${u.id}_${u.star||1}`; counts[k] = (counts[k]||0)+1; } });
            for (const k in counts) {
              if (counts[k] >= 3) {
                const [id, s] = k.split('_'); const star = parseInt(s);
                if (star < 3) {
                  let toRem = 3; let collected = [];
                  for (let i = 0; i < nb.length && toRem > 0; i++) if (nb[i] && nb[i].id === id && nb[i].star === star) { if (nb[i].items) collected.push(...nb[i].items); nb[i] = null; toRem--; }
                  for (let i = 0; i < nbrd.length && toRem > 0; i++) if (nbrd[i] && nbrd[i].id === id && nbrd[i].star === star) { if (nbrd[i].items) collected.push(...nbrd[i].items); nbrd[i] = null; toRem--; }
                  const up = { ...CHAMPS.find(c => c.id === id), star: star+1, uid:rngMisc(), items: collected.slice(0, 3) };
                  if (collected.length > 3) { ninv.push(...collected.slice(3)); showMsg("⚠️ 溢れたアイテムを回収しました"); }
                  const slot = nb.findIndex(x => !x); if (slot !== -1) nb[slot] = up;
                  setMergeToast(up); break;
                }
              }
            }
          }
          setInventory(ninv.filter(Boolean)); setDragSrc(null); setBoard(nbrd); setBench(nb); return;
        }

        let merged = false;
        if (newItem.type === 'comp') {
          const existingCompIdx = unit.items.findIndex(it => it.type === 'comp');
          if (existingCompIdx !== -1) {
            const itemA = unit.items[existingCompIdx], itemB = newItem;
            const recipe = ITEM_RECIPES[`${itemA.id}_${itemB.id}`] || ITEM_RECIPES[`${itemB.id}_${itemA.id}`];
            if (recipe) {
              let bounced = false;
              if (recipe.grantedTrait) {
                const currentTraits = new Set(unit.traits);
                if (unit.selectedMode) currentTraits.add(unit.selectedMode);
                unit.items.forEach(it => { if (it !== itemA && it.grantedTrait) currentTraits.add(it.grantedTrait); });
                
                if (currentTraits.has(recipe.grantedTrait)) bounced = true;
              }

              if (bounced) {
                unit.items.splice(existingCompIdx, 1);
                ninv.push({ ...recipe, type:'completed' });
                merged = true;
                showMsg(<div style={{ display:'flex', alignItems:'center', gap:6 }}><img src={getMetaTFTItemUrl(recipe.name)} style={{ width:18, height:18 }} /><span>{getJaName(recipe.name)}完成 (特性重複のためインベントリへ)</span></div>);
                if (passiveBuffs.some(b => b.type === 'masterful_crafting')) setFreeRerolls(fr => fr + 2);
              } else {
                unit.items[existingCompIdx] = { ...recipe, type:'completed' }; merged = true;
                showMsg(<div style={{ display:'flex', alignItems:'center', gap:6 }}><img src={getMetaTFTItemUrl(recipe.name)} style={{ width:18, height:18 }} /><span>合成成功: {getJaName(recipe.name)}!</span></div>);
                if (passiveBuffs.some(b => b.type === 'masterful_crafting')) setFreeRerolls(fr => fr + 2);
              }
            }
          }
        }
        if (!merged) {
          if (unit.items.length < 3) {
            if (newItem.grantedTrait) {
              const currentTraits = new Set(unit.traits);
              if (unit.selectedMode) currentTraits.add(unit.selectedMode);
              unit.items.forEach(it => { if (it.grantedTrait) currentTraits.add(it.grantedTrait); });
              
              if (currentTraits.has(newItem.grantedTrait)) {
                showMsg("⚠️ このユニットはすでにその特性を持っています！");
                setDragSrc(null);
                return;
              }
            }
            if (newItem.id === 'thiefs' || newItem.name === "Thief's Gloves") {
              unit.items.push(newItem);
              const recipes = Object.values(ITEM_RECIPES);
              const randomFullItem = { 
                ...recipes[Math.floor(rngMisc() * recipes.length)], 
                type: 'completed',
                isTGGenerated: true 
              };
              unit.items.push(randomFullItem);
              const comps = ITEMS.filter(it => it.type === 'comp' && it.id !== 'spatula' && it.id !== 'pan');
              const randomCompItem = { 
                ...comps[Math.floor(rngMisc() * comps.length)],
                isTGGenerated: true 
              };
              unit.items.push(randomCompItem);

              showMsg(
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <img src={getMetaTFTItemUrl(newItem)} style={{ width:18, height:18, borderRadius:2 }} />
                  <span>🍀 {getJaName(newItem.name)}：追加アイテムを獲得！</span>
                </div>
              );
            } else {
              unit.items.push(newItem);
              showMsg(
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <img 
                    src={getMetaTFTItemUrl(newItem)} 
                    style={{ width: 18, height: 18, borderRadius: 2 }} 
                  />
                  <span>装備完了: {getJaName(newItem.name)}</span>
                </div>
              );
            }
          } else { 
            showMsg("⚠️ アイテムスロットが一杯です！"); 
            setDragSrc(null); 
            return; 
          }
        }
        if (dragSrc.type === 'inventory') ninv.splice(dragSrc.idx, 1); 
        setInventory(ninv.filter(Boolean));
      }
      setDragSrc(null); setBoard(nbrd); setBench(nb); return;
    }

    // ==========================================
    // 2. インベントリ内の入れ替え・ドロワーからの追加
    // ==========================================
    if (targetType === 'inventory') {
      if (dragSrc.type === 'drawer_item') {
        ninv.push(dragSrc.item);
        setInventory(ninv.filter(Boolean));
        setDragSrc(null); return;
      } else if (dragSrc.type === 'inventory') {
        const srcIdx = dragSrc.idx, itemA = ninv[srcIdx], itemB = ninv[targetIdx];
        if (itemA && itemB && srcIdx !== targetIdx) {
          if (itemA.type === 'comp' && itemB.type === 'comp') {
            const recipe = ITEM_RECIPES[`${itemA.id}_${itemB.id}`] || ITEM_RECIPES[`${itemB.id}_${itemA.id}`];
            if (recipe) {
              ninv[targetIdx] = { ...recipe, type:'completed' }; ninv.splice(srcIdx, 1); setInventory(ninv.filter(Boolean));
              showMsg(<div style={{ display:'flex', alignItems:'center', gap:6 }}><img src={getMetaTFTItemUrl(recipe.name)} style={{ width:18, height:18 }} /><span>作成完了: {getJaName(recipe.name)}</span></div>);
              if (passiveBuffs.some(b => b.type === 'masterful_crafting')) setFreeRerolls(fr => fr + 2);
              setDragSrc(null); return;
            }
          }
          if (itemA.id === 'reforger' && (itemB.type === 'comp' || itemB.type === 'completed')) {
            const transformedItem = getReforgeTarget(itemB);
            ninv[targetIdx] = transformedItem; ninv.splice(srcIdx, 1); setInventory(ninv.filter(Boolean));
            showMsg(<div style={{ display:'flex', alignItems:'center', gap:6 }}><img src={getMetaTFTItemUrl(transformedItem.name)} style={{ width:18, height:18 }} /><span>アイテムを再合成しました！</span></div>);
            setDragSrc(null); return;
          }
        }
        const temp = ninv[targetIdx]; ninv[targetIdx] = ninv[srcIdx]; ninv[srcIdx] = temp;
        setInventory(ninv.filter(Boolean));
      }
      setDragSrc(null); return;
    }

    // ==========================================
    // 3. ドロワーからのチャンピオン配置
    // ==========================================
    if (dragSrc.type === 'drawer_champ') {
      if (targetType === 'board' || targetType === 'bench') {
        const targetArr = targetType === 'board' ? nbrd : nb;
        if (targetType === 'board' && !targetArr[targetIdx]) {
          const cursedCrownBonus = passiveBuffs.find(b => b.type === 'cursed_crown')?.teamSizeBonus || 0;
          const crownBonus = nbrd.filter(Boolean).reduce((acc, c) => acc + (c.items ? c.items.filter(it => it.id === 'tacticians_crown').reduce((s, it) => s + (it.teamSizeBonus || 0), 0) : 0), 0);
          let currentMaxTeamSize = level + cursedCrownBonus + crownBonus;
          if (passiveBuffs.some(b => b.type === 'solo_leveling')) currentMaxTeamSize = 1;
          if (nbrd.filter(Boolean).length >= currentMaxTeamSize) {
            showMsg("⚠️ 盤面が一杯です！"); setDragSrc(null); return;
          }
        }
        targetArr[targetIdx] = { ...dragSrc.champ, star: 1, uid: rngMisc(), items: targetArr[targetIdx]?.items || [] };
        
        if (targetType === 'board' && dragSrc.champ.traits.includes('missfortuneuniquetrait') && !targetArr[targetIdx].selectedMode) {
          setMfTargetUid(targetArr[targetIdx].uid);
          setShowMfPopup(true);
        }
      } else {
        setDragSrc(null); return;
      }
    }
    // ==========================================
    // 4. ショップからの購入
    // ==========================================
    else if (dragSrc.type === 'shop' && targetType !== 'shop') {
      const unit = ns[dragSrc.idx];
      if (!unit || gold < unit.cost) { setDragSrc(null); return; }
      const slot = nb.findIndex(x => !x);
      if (slot === -1) { showMsg("⚠️ ベンチに空きがありません"); setDragSrc(null); return; }
      
      nb[slot] = { ...unit, star:1, uid:rngMisc(), items:[] };
      ns[dragSrc.idx] = null;
      setGold(g => g - unit.cost);
    }
    // ==========================================
    // 5. 売却と配置移動
    // ==========================================
    else if (targetType === 'shop') {
      const src = dragSrc.type === 'bench' ? nb : nbrd;
      const mover = src[dragSrc.idx];
      if (mover) { 
        if (mover.isAnvil) {
          handleSellAnvil(mover);
          src[dragSrc.idx] = null;
        } else {
          setGold(g => g + (mover.cost * (mover.star === 3 ? 9 : (mover.star === 2 ? 3 : 1)))); 
          if (mover.items && mover.items.length > 0) {
            const itemsToReturn = mover.items.filter(it => !it.isTGGenerated && !it.isPsionic);
            ninv.push(...itemsToReturn);
          }
          src[dragSrc.idx] = null; 
        }
      }
    } else {
      if (targetType === 'anywhere') { 
        setDragSrc(null); 
        return; 
      }
      const src = dragSrc.type === 'bench' ? nb : nbrd; 
      let mover = src[dragSrc.idx];
      
      if (mover && mover.isAnvil && targetType === 'board') {
        showMsg("⚠️ 金床は盤面に配置できません！"); setDragSrc(null); return;
      }

      if (dragSrc.type === 'bench' && targetType === 'board' && !nbrd[targetIdx]) {
        const cursedCrownBonus = passiveBuffs.find(b => b.type === 'cursed_crown')?.teamSizeBonus || 0;
        const crownBonus = nbrd.filter(Boolean).reduce((acc, c) => acc + (c.items ? c.items.filter(it => it.id === 'tacticians_crown').reduce((s, it) => s + (it.teamSizeBonus || 0), 0) : 0), 0);
        let currentMaxTeamSize = level + cursedCrownBonus + crownBonus;
        if (passiveBuffs.some(b => b.type === 'solo_leveling')) currentMaxTeamSize = 1;
        if (nbrd.filter(Boolean).length >= currentMaxTeamSize) {
          showMsg("⚠️ 盤面が一杯です！"); setDragSrc(null); return;
        }
      }
      src[dragSrc.idx] = null;
      if (mover) {
        const target = targetType === 'bench' ? nb : nbrd; 
        const ex = target[targetIdx]; 
        if (targetType === 'bench' && mover.traits.includes('missfortuneuniquetrait')) delete mover.selectedMode;
        target[targetIdx] = mover;
        if (ex) { 
          if (dragSrc.type === 'bench' && ex.traits.includes('missfortuneuniquetrait')) delete ex.selectedMode;
          if (dragSrc.type === 'bench') nb[dragSrc.idx] = ex; 
          else nbrd[dragSrc.idx] = ex; 
        }
      }
      if (targetType === 'board' && mover && mover.traits.includes('missfortuneuniquetrait') && !mover.selectedMode) {
        setMfTargetUid(mover.uid);
        setShowMfPopup(true);
      }
    }

    // ==========================================
    // 6. 共通: 配置・インベントリ・ショップの更新
    // ==========================================
    setShop(ns);
    setBench(nb); setBoard(nbrd); setInventory(ninv.filter(Boolean)); setDragSrc(null);
  };

  const handleMouseEnter = (e, champ) => {
    if (!champ) return;
    handleMouseLeave();
    const rect = e.currentTarget.getBoundingClientRect();
    const isRight = rect.left > window.innerWidth / 2;
    hoverTimer.current = setTimeout(() => { setTooltipData({ champ, x: rect.left, y: rect.top, isRight }); }, 1000);
  };
  const handleMouseLeave = () => { if (hoverTimer.current) { clearTimeout(hoverTimer.current); hoverTimer.current = null; } setTooltipData(null); };
  const handleTraitMouseEnter = (e, trait, count) => { const rect = e.currentTarget.getBoundingClientRect(); setTraitTooltipData({ trait, count, x: rect.left, y: rect.top }); };


  // 🌟 盤面のユニットが装備しているサイオニックアイテムも監視して削除
  useEffect(() => {
    const count = traitCounts['Psionic'] || 0;
    if (count < 2) {
      // 全ユニットの装備からサイオニックアイテムを強制除去
      const removePsionic = (u) => {
        if (!u || !u.items) return u;
        return { ...u, items: u.items.filter(it => !it.isPsionic) };
      };
      setBoard(prev => prev.map(removePsionic));
      setBench(prev => prev.map(removePsionic));
    } else if (count < 4) {
      // 4未満になったら2個目のアイテム（index 1）だけ除去
      const secondItemName = currentPsionicItems[1].name;
      const removeSecond = (u) => {
        if (!u || !u.items) return u;
        return { ...u, items: u.items.filter(it => it.name !== secondItemName) };
      };
      setBoard(prev => prev.map(removeSecond));
      setBench(prev => prev.map(removeSecond));
    }
  }, [traitCounts['Psionic']]);

  const TRAIT_TIERS = {
    'Anima':[3,6],'Arbiter':[2,3],'Dark Star':[2,4,6,9],'Mecha':[3,4,6],'Meeple':[3,5,7,10],
    'N.O.V.A.':[2,5],'Primordian':[2,3],'Psionic':[2,4],'Space Groove':[1,3,5,7,10],
    'Stargazer':[3,4,5,6,7],'Timebreaker':[2,3,4],'Bastion':[2,4,6],'Brawler':[2,4,6],
    'Challenger':[2,3,4,5],'Channeler':[2,3,4,5],'Fateweaver':[2,4],'Marauder':[2,4,6],
    'Replicator':[2,4],'Rogue':[2,3,4,5],'Shepherd':[3,5,7],'Sniper':[2,3,4,5],
    'Vanguard':[2,4,6],'Voyager':[2,3,4,5,6],'Redeemer':[1],'missfortuneuniquetrait':[1],
    'DarkEmpress':[1], 'Doomer':[1], 'Factory':[1], 'Galaxy':[1], 'PartyTime':[1],
    'Bulwark':[1], 'Eradicator':[1], 'Commander':[1], 'SacredDuelist':[1], 'Oracle':[1]
  };

  const getMinReq = (t) => TRAIT_TIERS[t] ? TRAIT_TIERS[t][0] : 2;
  const activeTraits = Object.entries(traitCounts).filter(([t,c]) => c >= getMinReq(t)).sort((a,b) => b[1]-a[1]);
  const inactiveTraits = Object.entries(traitCounts).filter(([t,c]) => c < getMinReq(t)).sort((a,b) => b[1]-a[1]);

  // 🌟 変数参照エラー回避のため、JSXのレンダリング前に宣言
  const protectorsPactBuff = passiveBuffs.find(b => b.type === 'protectors_pact');

  if (isFinished) {
    return (
      <div style={{height:'100vh',width:'100vw',background:'var(--bg0)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:20,animation:'fadeIn 0.8s ease',padding:20,overflowY:'auto'}}>
        
        {/* 🌟 1. ボタン類を上部に集約！シード値コピーもここへ移動 */}
        <div style={{display:'flex', gap:12, marginBottom:5}}>
          <button className="menu-btn" onClick={onRestart} style={{padding:'10px 20px',fontSize:13, background:'var(--blue)', color:'white', borderColor:'var(--blue)'}}>同じシードで再挑戦</button>
          <button className="menu-btn" onClick={onNewGame} style={{padding:'10px 20px',fontSize:13, background:'var(--teal)', color:'white', borderColor:'var(--teal)'}}>新しいゲーム</button>
<button 
  className="menu-btn" 
  onClick={() => {
    // URLを生成してコピー
    const shareUrl = `${window.location.origin}${window.location.pathname}?seed=${seed}`;
    navigator.clipboard.writeText(shareUrl); 
    
    // 🌟 アイコン付きのリッチな通知を出す
    showMsg(
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
        <span style={{ fontSize: '18px' }}>🔗</span>
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontWeight: 900, color: 'white' }}>URLをコピーしました！</div>
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)' }}>シード値: {seed} </div>
        </div>
      </div>
    );
  }} 
  style={{padding:'10px 20px', fontSize:13, background:'var(--gold)', color:'white', borderColor:'var(--gold)'}}
>
  共有URLをコピー
</button>
          <button 
            className="menu-btn" 
            onClick={handleCopyImage} 
            disabled={isSaving}
            style={{padding:'10px 20px', fontSize:13, background:'var(--purple)', color:'white', borderColor:'var(--purple)', opacity: isSaving ? 0.5 : 1, cursor: isSaving ? 'wait' : 'pointer'}}
          >
            {isSaving ? '⏳ 処理中...' : '📸 画像をコピー'}
          </button>
        </div>

        {/* 🌟 キャプチャ対象エリア */}
        <div ref={resultRef} id="result-capture" style={{background:'var(--bg0)',borderRadius:16,border:'1px solid var(--border)',padding:24,display:'flex',flexDirection:'column',gap:20,maxWidth:900,width:'100%'}}>
          
          {/* ヘッダー */}
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid var(--border)',paddingBottom:16, flexWrap:'wrap', gap:10}}>
            <div>
              <div style={{fontFamily:'Orbitron',fontSize:10,color:'var(--blue)',letterSpacing:4,marginBottom:4}}>TFT SET 17 — 1 STAGE RESULT</div>

            </div>
            
            <div style={{display:'flex',alignItems:'center',gap:16}}>
              {/* 🌟 2. 遭遇した2体の神を並べて表示（画像ブロック解除済み） */}
              <div style={{display:'flex',gap:10, flexWrap:'wrap', justifyContent:'flex-end'}}>

                {/* 🌟 星の観測者 */}
                <div style={{display:'flex',alignItems:'center',gap:6,background:'#c46bff33',border:'3px solid #c46bff',borderRadius:10,padding:'4px 8px'}}>
                  <div style={{width:28,height:28,borderRadius:'50%',border:'2px solid #c46bff',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden',background:'#4a148c',flexShrink:0}}>
                    <img src={getTraitIconUrl('Stargazer')} style={{width:14,height:14,filter:'brightness(0) invert(1)'}} onError={(e)=>e.target.style.display='none'} />
                  </div>
                  <div>
                    <div style={{fontSize:8,color:'var(--textdim)',marginBottom:1}}>星の観測者</div>
                    <div style={{fontSize:10,fontWeight:900,color:'#c46bff',lineHeight:1.2,whiteSpace:'nowrap'}}>{currentStargazerDesc.split('この試合: ')[1]?.split('\n')[0]}</div>
                  </div>
                </div>

                {/* 🌟 サイオニック */}
                <div style={{display:'flex',alignItems:'center',gap:6,background:'#4caf5033',border:'3px solid #4caf50',borderRadius:10,padding:'4px 8px'}}>
                  <div style={{width:28,height:28,borderRadius:'50%',border:'2px solid #4caf50',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden',background:'#1b5e20',flexShrink:0}}>
                    <img src={getTraitIconUrl('Psionic')} style={{width:14,height:14,filter:'brightness(0) invert(1)'}} onError={(e)=>e.target.style.display='none'} />
                  </div>
                  <div>
                    <div style={{fontSize:8,color:'var(--textdim)',marginBottom:1}}>サイオニック</div>
                    <div style={{display:'flex',gap:3,alignItems:'center'}}>
                      <img src={getMetaTFTItemUrl(currentPsionicItems[0].name)} style={{width:14,height:14,borderRadius:2}} />
                      <img src={getMetaTFTItemUrl(currentPsionicItems[1].name)} style={{width:14,height:14,borderRadius:2}} />
                    </div>
                  </div>
                </div>

                {/* 🌟 遭遇を同列に追加 */}
                {encounter && (
                  <div style={{display:'flex',alignItems:'center',gap:6,background:`${encounter.color}33`,border:`3px solid ${encounter.color}`,borderRadius:10,padding:'4px 8px'}}>
                    <div style={{width:28,height:28,borderRadius:'50%',border:`2px solid ${encounter.color}`,display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden',background:`${encounter.color}22`,flexShrink:0}}>
                      {(() => {
                        let encChamp = CHAMPS.find(c => c.id === encounter.id);
                        if (!encChamp) {
                          const map = { 'miipsy': 'meepsie', 'velkoz': 'belveth', 'rastt': 'rhaast' };
                          if (map[encounter.id]) encChamp = CHAMPS.find(c => c.id === map[encounter.id]);
                        }
                        if (!encChamp) {
                          encChamp = CHAMPS.find(c => c.jaName.replace(/[・=]/g, '') === encounter.champ.replace(/[・=]/g, ''));
                        }
                        return encChamp ? <img src={boardIcon(encChamp.img)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 14 }}>{encounter.icon}</span>;
                      })()}
                    </div>
                    <div>
                      <div style={{fontSize:8,color:'var(--textdim)',marginBottom:1}}>遭遇</div>
                      <div style={{fontSize: encounter.champ.length > 8 ? 9 : 10,fontWeight:900,color:encounter.color,lineHeight:1.2,whiteSpace:'nowrap'}}>{encounter.champ}</div>
                    </div>
                  </div>
                )}

                {/* 🌟 遭遇した神 */}
                {encounterGods.map((god) => (
                  <div key={god.id} style={{display:'flex',alignItems:'center',gap:6,background:`${god.color}33`,border:`3px solid ${god.color}`,borderRadius:10,padding:'4px 8px'}}>
                    {/* 🌟 GodImg: rgpub→blitz→絵文字の自動フォールバック */}
                    <GodImg god={god} type="icon" style={{width:28,height:28,borderRadius:'50%',border:`2px solid ${god.color}`,objectFit:'cover', background: 'white', flexShrink:0}} />
                    <div>
                      <div style={{fontSize:8,color:'var(--textdim)',marginBottom:1}}>遭遇した神</div>
                      {/* リザルト画面でレイアウト崩れを防ぐため、名前の改行をスペースに変換して表示 */}
                      <div style={{fontSize:god.name.replace('\n', ' ').length > 8 ? 9 : 10,fontWeight:900,color:god.color,lineHeight:1.2,whiteSpace:'nowrap'}}>{god.name.replace('\n', ' ')}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div style={{fontFamily:'Orbitron',fontSize:11,color:'var(--textdim)',textAlign:'right', borderLeft:'1px solid var(--border)', paddingLeft:16}}>
                <div>SEED</div>
                <div style={{color:'var(--text-main)',fontWeight:900}}>{seed}</div>
              </div>
            </div>
          </div>

          <div style={{display:'flex',gap:20,flexWrap:'wrap'}}>
            {/* 左カラム：ステータス */}
            <div style={{display:'flex',flexDirection:'column',gap:10,minWidth:200,width:260,flexShrink:0}}>
              
              {/* レベル・ゴールド */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                <div style={{background:'rgba(26,159,255,0.08)',border:'1px solid rgba(26,159,255,0.2)',borderRadius:10,padding:'12px 14px'}}>
                  <div style={{fontSize:9,color:'var(--blue)',fontFamily:'Noto Sans JP',marginBottom:4}}>最終レベル</div>
                  <div style={{fontSize:22,fontWeight:900,color:'var(--text-main)',fontFamily:'Orbitron'}}>LV {level}</div>
                </div>
                <div style={{background:'rgba(200,169,110,0.08)',border:'1px solid rgba(200,169,110,0.2)',borderRadius:10,padding:'12px 14px'}}>
                  <div style={{fontSize:9,color:'var(--gold)',fontFamily:'Noto Sans JP',marginBottom:4}}>最終ゴールド</div>
                  <div style={{fontSize:22,fontWeight:900,color:'var(--text-main)',fontFamily:'Orbitron'}}>{gold}G</div>
                </div>
              </div>

              {/* オーグメント履歴 */}
              {augments.length > 0 && (
                <div style={{background:'rgba(13,21,37,0.8)',border:'1px solid rgba(155,89,245,0.3)',borderRadius:10,padding:'12px 14px'}}>
                  <div style={{fontSize:9,color:'var(--purple)',fontFamily:'Noto Sans JP',marginBottom:10,fontWeight:700,letterSpacing:2}}>AUGMENT HISTORY</div>
                  <div style={{display:'flex',flexDirection:'column',gap:12}}>
                    {augments.map((a, i) => (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 6, background: 'rgba(0,0,0,0.3)', padding: '10px 8px', borderRadius: 8, border: `1px solid ${TIER_COLORS[a.tier]}44` }}>
                     
                        
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'space-between' }}>
                          {[0, 1, 2].map(slotIdx => {
                            const initAug = a.history?.initialChoices?.[slotIdx];
                            const finalAug = a.history?.finalChoices?.[slotIdx];
                            const isRerolled = a.history?.rerolledSlots?.[slotIdx];
                            const isPicked = finalAug?.id === a.id;

                            if (!finalAug) return null;

                            return (
                              <div key={slotIdx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, opacity: isPicked ? 1 : 0.5, background: isPicked ? 'rgba(255,255,255,0.05)' : 'transparent', border: isPicked ? `1px solid ${TIER_COLORS[a.tier]}` : '1px dashed rgba(255,255,255,0.1)', borderRadius: 6, padding: '8px 2px', position: 'relative' }}>
                                
                                {/* 🌟 リロールされた場合、元のオーグメントを名前付きで表示 */}
                                {isRerolled && (
                                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, width: '100%', marginBottom: 4 }}>
                                    <img src={getAugmentIconUrl(initAug)} style={{ width: 22, height: 22, filter: 'grayscale(0.8)', opacity: 0.6 }} />
                                    {/* 👇 名前を表示し、取り消し線（line-through）を引く */}
                                    <div style={{ fontSize: initAug?.name.length > 9 ? 7 : 9, color: 'var(--textdim)', textAlign: 'center', lineHeight: 1.1, textDecoration: 'line-through', padding: '0 2px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{initAug?.name}</div>
                                    <div style={{ fontSize: 10, color: 'var(--blue)', lineHeight: 1, marginTop: 2 }}>▼</div>
                                  </div>
                                )}
                                
                                {/* 最終的なオーグメント */}
                                <img src={getAugmentIconUrl(finalAug)} style={{ width: 28, height: 28, filter: isPicked ? 'none' : 'grayscale(0.5)' }} />
                                <div style={{ fontSize: finalAug.name.length > 9 ? 8 : 10, color: isPicked ? 'white' : 'var(--textdim)', textAlign: 'center', lineHeight: 1.1, wordBreak: 'break-all', padding: '0 2px', fontWeight: isPicked ? 900 : 400, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{finalAug.name}</div>
                                
                                {/* 選んだものにはチェックマーク */}
                                {isPicked && (
                                  <div style={{ position: 'absolute', top: -6, right: -6, background: 'var(--blue)', border: '1px solid var(--bg0)', borderRadius: '50%', width: 14, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: 'white', fontWeight: 900 }}>✓</div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* シナジー */}
              {activeTraits.length > 0 && (
                <div style={{background:'rgba(13,21,37,0.8)',border:'1px solid rgba(0,229,192,0.2)',borderRadius:10,padding:'12px 14px'}}>
                  <div style={{fontSize:9,color:'var(--teal)',fontFamily:'Noto Sans JP',marginBottom:10,fontWeight:700,letterSpacing:2}}>ACTIVE TRAITS</div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:4}}>
                    {activeTraits.map(([t, c]) => (
                      <div key={t} style={{display:'flex',alignItems:'center',gap:4,background:'rgba(200,169,110,0.12)',border:'1px solid rgba(200,169,110,0.3)',borderRadius:6,padding:'3px 6px',overflow:'hidden',whiteSpace:'nowrap'}}>
                        <img src={getTraitIconUrl(t)} style={{width:12,height:12, filter: 'brightness(0) invert(1)', flexShrink:0}} onError={e => e.target.style.display='none'}/>
                        <span style={{fontSize:10,color:'var(--gold)',fontWeight:900}}>{c}</span>
                        <span style={{fontSize:9,color:'white',textOverflow:'ellipsis',overflow:'hidden'}}>{getTraitJaName(t)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 右エリア全体：盤面・ベンチ・アイテム */}
            <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'rgba(255,255,255,0.02)',borderRadius:12,border:'1px solid var(--border)',padding:'24px 16px',minWidth:340, gap: 16}}>
              
              {/* 🌟 上部エリア：左にアイテム、右に盤面（主役） */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, width: '100%',transform: 'translateX(30px)' }}>
                
                {/* 🌟 アイテム一覧（左側に配置、縦長） */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, background: 'rgba(0,0,0,0.3)', padding: '12px 10px', borderRadius: 10, border: '1px solid rgba(30,45,74,0.5)', alignItems: 'center', minHeight: 120, minWidth: 50 }}>
                  <div style={{ fontSize: 9, color: 'var(--gold)', fontFamily: 'Orbitron', letterSpacing: 1 }}>ITEMS</div>
                  
                  {/* 👇 ここを flexDirection: 'column' に変更して縦長に！ */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center', maxHeight: 260, flexWrap: 'wrap', justifyContent: 'flex-start' }}>
                    {inventory.length > 0 ? inventory.map((it, i) => (
                      <div key={i} style={{
                        width: 28, height: 28, background: '#1e293b', borderRadius: 4,
                        border: `1px solid ${it?.type === 'artifact' ? 'var(--red)' : (it?.type === 'radiant' ? 'var(--gold2)' : (it?.type === 'completed' ? 'var(--gold)' : 'var(--border)'))}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'visible', position: 'relative', flexShrink: 0
                      }}>
                        {it?.name ? (<img src={getMetaTFTItemUrl(it)} crossOrigin="anonymous" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 3 }} />) : (<span style={{ fontSize: 12 }}>{it?.icon}</span>)}
                        
                        {/* 除去装置などのスタック表示 */}
                        {it?.id === 'remover' && (it.count || 1) > 1 && (
                          <div style={{ position: 'absolute', top: -6, left: -6, background: 'var(--blue)', color: 'white', fontSize: 9, fontWeight: 900, width: 14, height: 14, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--bg0)', zIndex: 10 }}>
                            {it.count}
                          </div>
                        )}
                      </div>
                    )) : <div style={{ fontSize: 10, color: 'var(--text)', padding: '6px 0', textAlign: 'center' }}>なし</div>}
                  </div>
                </div>

                {/* 🌟 盤面（主役なので大きく表示） */}
                <div style={{transform:'scale(0.8) translateX(-40px)',transformOrigin:'center center'}}>
                  {[0,1,2,3].map(row => (
                    <div key={row} style={{display:'flex',gap:2,marginLeft:row%2===1?30:0}}>
                      {[0,1,2,3,4,5,6].map(col => <HexCell key={row*7+col} champ={board[row*7+col]} size={60} isGolden={(passiveBuffs.some(b => b.type === 'shield_maiden') && board[row*7+col]?.id === 'leona') || (passiveBuffs.some(b => b.type === 'terminal_velocity') && board[row*7+col]?.id === 'poppy') || (passiveBuffs.some(b => b.type === 'stellar_combo') && board[row*7+col]?.id === 'aatrox') || (passiveBuffs.some(b => b.type === 'big_bang') && (board[row*7+col]?.id === 'miipsy' || board[row*7+col]?.id === 'meepsie')) || (passiveBuffs.some(b => b.type === 'pro_assassin') && board[row*7+col]?.id === 'pyke') || (passiveBuffs.some(b => b.type === 'self_destruction') && board[row*7+col]?.id === 'gragas') || (passiveBuffs.some(b => b.type === 'heat_death') && board[row*7+col]?.id === 'mordekaiser') || (passiveBuffs.some(b => b.type === 'reach_for_the_stars') && board[row*7+col]?.id === 'jax') || (protectorsPactBuff && board[row*7+col]?.id === protectorsPactBuff.champId)} />)}
                    </div>
                  ))}
                </div>

              </div>

              {/* 🌟 下部エリア：ベンチ（小さく控えめに） */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, background: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: 10, border: '1px solid rgba(30,45,74,0.5)', width: 'fit-content' }}>
                <div style={{ fontSize: 9, color: 'var(--textdim)', fontFamily: 'Orbitron', letterSpacing: 1, textAlign: 'center' }}>BENCH</div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {/* 🌟 リザルト画面：オーラ育成中 の専用待機枠 */}
                  {auraTrainingUnit && (
                    <div style={{
                      width: 34, height: 34, borderRadius: 6, background: 'rgba(13,21,37,0.5)',
                      border: `2px dashed ${COST_COLORS[auraTrainingUnit.cost]}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden',
                      marginRight: 4, opacity: 0.8
                    }}>
                      <img src={boardIcon(auraTrainingUnit.img)} crossOrigin="anonymous" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', top: 1, left: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {(auraTrainingUnit.items||[]).map((it, idx) => (<img key={idx} src={getMetaTFTItemUrl(it)} crossOrigin="anonymous" style={{ width: 8, height: 8, border: `1px solid ${it?.type==='artifact'?'var(--red)':(it?.type==='radiant'?'var(--gold2)':'white')}`, borderRadius: 1 }} />))}
                      </div>
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'center', transform: 'scale(0.6)', transformOrigin: 'bottom' }}><Stars star={auraTrainingUnit.star} /></div>
                      <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.5)' }}><span style={{ fontSize:14 }}>🔒</span></div>
                    </div>
                  )}

                  {bench.map((champ, i) => (
                    <div key={i} style={{
                      width: 34, height: 34, borderRadius: 6, background: 'rgba(13,21,37,0.5)',
                      border: `1px solid ${champ ? (champ.isAnvil ? champ.color : COST_COLORS[champ.cost]) : 'rgba(30,45,74,.4)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden'
                    }}>
                      {champ && (
                        champ.isAnvil ? (
                          <img src={champ.img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={champ.jaName} />
                        ) : (
                          <React.Fragment>
                            <img src={boardIcon(champ.img)} crossOrigin="anonymous" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', top: 1, left: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                              {(champ.items||[]).map((it, idx) => (<img key={idx} src={getMetaTFTItemUrl(it)} crossOrigin="anonymous" style={{ width: 8, height: 8, border: `1px solid ${it?.type==='artifact'?'var(--red)':(it?.type==='radiant'?'var(--gold2)':'white')}`, borderRadius: 1 }} />))}
                            </div>
                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'center', transform: 'scale(0.6)', transformOrigin: 'bottom' }}><Stars star={champ.star} /></div>
                          </React.Fragment>
                        )
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* フッター */}
          <div style={{borderTop:'1px solid var(--border)',paddingTop:12,display:'flex',justifyContent:'center'}}>
            <div style={{fontFamily:'Orbitron',fontSize:9,color:'var(--textdim)',letterSpacing:3}}>TFT SET 17 SIMULATOR</div>
          </div>
        </div>

        {dropMsg && (
          <div style={{ 
            position:'fixed', top:'15%', left:'50%', transform:'translateX(-50%)', 
            background:'rgba(26,159,255,.95)', border:'1px solid white', borderRadius:10, 
            padding:'12px 24px', zIndex:10000, fontFamily:'Noto Sans JP', fontSize:14, 
            textAlign:'center', maxWidth:'90%', boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            animation: 'fadeIn 0.3s ease', color: 'white'
          }}>
            {dropMsg}
          </div>
        )}
        
      </div>
    );
  }

  const xpCost = Math.max(1, 4 - xpCostReduction);
  const cursedCrownBonus = passiveBuffs.find(b => b.type === 'cursed_crown')?.teamSizeBonus || 0;
  const crownBonus = board.filter(Boolean).reduce((acc, c) => acc + (c.items ? c.items.filter(it => it.id === 'tacticians_crown').reduce((s, it) => s + (it.teamSizeBonus || 0), 0) : 0), 0);
  const teamSizeBonus = cursedCrownBonus + crownBonus;

  return (

  <div 
    onDragOver={e => e.preventDefault()} 
    onDrop={hDrop('anywhere', -1)} 
    style={{ height:'100vh', width:'100vw', background:'var(--bg0)', display:'flex', flexDirection:'column', overflow:'hidden', userSelect:'none', position:'relative' }}
  >
    


      <ChampionTooltip data={tooltipData} />


      {/* 🌟 アービターの掟選択POPアップ */}
      {showArbiterPopup && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(4,6,14,0.95)', zIndex: 9000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.3s ease' }}>
          <h2 style={{ color: 'var(--gold)', fontSize: 28, marginBottom: 40, fontFamily: 'Noto Sans JP', fontWeight: 900, textShadow: '0 0 20px var(--gold)' }}>
            アービター：掟を定めてください
          </h2>

          {/* 左右に並べるコンテナ */}
          <div style={{ display: 'flex', gap: 60, alignItems: 'flex-start' }}>
            
            {/* 左カラム：原因 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center' }}>
              <div style={{ color: 'var(--textdim)', fontSize: 16, fontWeight: 900, letterSpacing: 2 }}>【条件】</div>
              {arbiterOptions.causes.map((opt, i) => {
                const isSelected = tempCause?.id === opt.id;
                return (
                  <div 
                    key={`cause-${i}`} 
                    onClick={() => setTempCause(opt)} // 原因をセット
                    style={{ 
                      width: 240, height: 80, 
                      background: isSelected ? 'var(--blue)' : 'rgba(15,23,42,0.6)', 
                      border: `2px solid ${isSelected ? 'white' : 'var(--gold)'}`, 
                      borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      cursor: 'pointer', padding: '15px', textAlign: 'center', 
                      color: 'white', fontWeight: 700, fontSize: '15px', lineHeight: 1.4, 
                      transition: 'all 0.2s', 
                      boxShadow: isSelected ? '0 0 20px var(--blue)' : '0 0 10px rgba(200,169,110,0.1)',
                      transform: isSelected ? 'scale(1.05)' : 'scale(1)' // 選ばれたら少し大きく
                    }} 
                    onMouseEnter={e => { if(!isSelected) { e.currentTarget.style.background='rgba(15,23,42,0.9)'; e.currentTarget.style.transform='translateY(-3px)'; } }} 
                    onMouseLeave={e => { if(!isSelected) { e.currentTarget.style.background='rgba(15,23,42,0.6)'; e.currentTarget.style.transform='translateY(0)'; } }}
                  >
                    {opt.text}
                  </div>
                );
              })}
            </div>

            {/* 右カラム：結果 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center' }}>
              <div style={{ color: 'var(--textdim)', fontSize: 16, fontWeight: 900, letterSpacing: 2 }}>【効果】</div>
              {arbiterOptions.effects.map((opt, i) => {
                const isEnabled = !!tempCause; // 原因が選ばれていれば有効
                return (
                  <div 
                    key={`effect-${i}`} 
                    onClick={() => {
                      if (!isEnabled) return; // 有効でなければ何もしない
                      setArbiterRule({ cause: tempCause, effect: opt }); // 決定！
                      setShowArbiterPopup(false);
                      showMsg(
                        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                          <span style={{ fontSize:18 }}>⚖️</span>
                          <span>掟が決定しました: {tempCause.text} ➔ {opt.text}</span>
                        </div>
                      );
                    }} 
                    style={{ 
                      width: 240, height: 80, 
                      background: 'rgba(15,23,42,0.6)', 
                      border: `2px solid ${isEnabled ? 'var(--gold)' : 'var(--border)'}`, 
                      borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      cursor: isEnabled ? 'pointer' : 'not-allowed', 
                      padding: '15px', textAlign: 'center', 
                      color: isEnabled ? 'white' : 'var(--textdim)', 
                      fontWeight: 700, fontSize: '15px', lineHeight: 1.4, 
                      transition: 'all 0.2s', 
                      opacity: isEnabled ? 1 : 0.4, // 選べない時は暗くする
                      boxShadow: isEnabled ? '0 0 10px rgba(200,169,110,0.1)' : 'none'
                    }} 
                    onMouseEnter={e => { if(isEnabled) { e.currentTarget.style.background='rgba(15,23,42,0.9)'; e.currentTarget.style.transform='translateY(-3px)'; } }} 
                    onMouseLeave={e => { if(isEnabled) { e.currentTarget.style.background='rgba(15,23,42,0.6)'; e.currentTarget.style.transform='translateY(0)'; } }}
                  >
                    {opt.text}
                  </div>
                );
              })}
            </div>

            {dropMsg && <div style={{ position:'fixed', top:'15%', left:'50%', transform:'translateX(-50%)', background:'rgba(26,159,255,.95)', border:'1px solid white', borderRadius:10, padding:'10px 20px', zIndex:10000, fontFamily:'Noto Sans JP', fontSize:14, fontWeight:900, textAlign:'center', color:'white', boxShadow:'0 4px 20px rgba(0,0,0,0.5)' }}>{dropMsg}</div>}

          </div>

          {/* ユーザーへの操作案内 */}
          <div style={{ marginTop: 40, color: tempCause ? 'var(--gold)' : 'var(--textdim)', fontSize: 16, fontWeight: 700, animation: 'pulse 2s infinite' }}>
            {!tempCause ? 'まずは左側の【条件】を選択してください' : '次に右側の【効果】を選択して掟を決定します'}
          </div>
        </div>
      )}


      <TraitTooltip data={traitTooltipData} stargazerDesc={currentStargazerDesc} psionicItems={currentPsionicItems} arbiterRule={arbiterRule} />
      {showAugment && !noMoreAugments && <AugmentScreen onPick={handleAugmentPick} rng={rngAug} augmentTierBoost={augmentTierBoost} forceTier={encounter?.augmentForceTier || null} rerollBonus={encounter?.augmentRerollBonus || 0} />}
      {dropMsg && <div style={{ position:'fixed', top:'15%', left:'50%', transform:'translateX(-50%)', background:'rgba(26,159,255,.9)', border:'1px solid white', borderRadius:10, padding:'10px 20px', zIndex:3000, fontFamily:'Noto Sans JP', fontSize:14, fontWeight:900, color:'white', textAlign:'center', maxWidth:'90%', boxShadow:'0 4px 20px rgba(0,0,0,0.3)' }}>{dropMsg}</div>}
      {mergeToast && <div style={{ position:'fixed', top:'25%', left:'50%', transform:'translateX(-50%)', background:'rgba(8,13,26,.97)', border:`1px solid ${STAR_COLORS[mergeToast.star]}`, borderRadius:12, padding:20, zIndex:4000, animation:'starUpAnim .4s ease', display:'flex', alignItems:'center', gap:15 }}><img src={boardIcon(mergeToast.img)} style={{ width:60, height:60, borderRadius:8, objectFit:'cover', border:`2px solid ${STAR_COLORS[mergeToast.star]}` }}/><div><div style={{ fontFamily:'Noto Sans JP', fontSize:11, color:STAR_COLORS[mergeToast.star] }}>スター昇格！</div><div style={{ fontSize:20, fontWeight:900, color:'white' }}>{mergeToast.jaName}</div></div></div>}

      {isTransitioning && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,      // 全要素の最前面
          background: 'transparent', 
          cursor: 'wait',    
          pointerEvents: 'all' 
        }} />
      )}

      <AssetDrawer 
        isOpen={showAssetDrawer} 
        onClose={() => setShowAssetDrawer(false)} 
        setDragSrc={setDragSrc}
        startTouchDrag={startTouchDrag}
      />
      
      <TierListDrawer 
        isOpen={showTierList} 
        onClose={() => setShowTierList(false)} 
      />

      {/* 🌟 1-1 神との遭遇 （二回り縮小・比率維持版） */}
      {round === '1-1' && (() => {
        let encChamp = null;
        if (encounter) {
          encChamp = CHAMPS.find(c => c.id === encounter.id);
          if (!encChamp) {
            const map = { 'miipsy': 'meepsie', 'velkoz': 'belveth', 'rastt': 'rhaast' };
            if (map[encounter.id]) encChamp = CHAMPS.find(c => c.id === map[encounter.id]);
          }
          if (!encChamp) {
            encChamp = CHAMPS.find(c => c.jaName.replace(/[・=]/g, '') === encounter.champ.replace(/[・=]/g, ''));
          }
        }

        return (
          <div 
            onClick={() => {
              if (encounter && introStep === 0) {
                setIntroStep(1);
              } else {
                handleNextRound();
              }
            }} 
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1000,
              background: 'rgba(15, 23, 42, 0.4)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'fadeIn 1s ease',
              cursor: 'pointer',
            }}
          >
            {introStep === 0 ? (
              <>
                {/* タイトル */}
                <div style={{ textAlign: 'center', marginBottom: 45, pointerEvents: 'none' }}>
                  <div style={{ fontFamily: 'Orbitron', fontSize: '12px', color: 'var(--gold2)', letterSpacing: '8px', marginBottom: 15 }}>GOD ENCOUNTER</div>
                  <h1 style={{ fontFamily: 'Noto Sans JP', fontSize: '36px', fontWeight: 900, color: 'white', textShadow: '0 0 20px var(--gold)', letterSpacing: '3px' }}>神々の世界</h1>
                  <p style={{ color: 'var(--textdim)', marginTop: 15, fontSize: '12px', letterSpacing: '1px' }}>
                    画面をクリックして運命を受け入れる
                  </p>
                </div>

                {/* 神のカード */}
                <div style={{ display: 'flex', gap: 45, pointerEvents: 'none' }}>
                  {encounterGods.map((god) => (
                    <div 
                      key={god.id}
                      style={{
                        width: 240, height: 360,
                        background: 'rgba(8,13,26,0.9)',
                        border: `2px solid ${god.color}44`, 
                        borderRadius: 18, 
                        position: 'relative',
                        overflow: 'hidden',
                        display: 'flex', flexDirection: 'column',
                        boxShadow: `0 15px 30px rgba(0,0,0,0.6), 0 0 15px ${god.color}11`,
                        animation: 'popIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
                      }}
                    >
                      <div style={{ position: 'absolute', top: -75, left: -75, width: 225, height: 225, background: god.color, filter: 'blur(75px)', opacity: 0.15 }}></div>
                      <div style={{ width: '100%', height: '240px', position: 'relative', overflow: 'hidden', background: '#04060e' }}>
                        <GodImg god={god} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,13,26,1) 0%, transparent 40%)' }}></div>
                      </div>
                      <div style={{ padding: '0 18px 22px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                        <h2 style={{ fontSize: 18, color: 'white', fontWeight: 900, marginBottom: 8, fontFamily: 'Noto Sans JP', whiteSpace: 'pre-wrap' }}>{god.name}</h2>
                        <p style={{ fontSize: 11, color: 'var(--silver)', lineHeight: 1.6, opacity: 0.8, whiteSpace: 'pre-wrap' }}>{god.desc}</p>
                      </div>
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, transparent, ${god.color}, transparent)` }}></div>
                    </div>
                  ))}
                </div>
                
                <div style={{ marginTop: 45, fontSize: '11px', color: 'var(--gold)', opacity: 0.6, animation: 'pulse 2s infinite', pointerEvents: 'none' }}>
                  — CLICK TO CONTINUE —
                </div>
              </>
            ) : (
              <>
                {/* 🌟 遭遇（神とは別枠の Opening Encounter） */}
                {encounter && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'none', animation: 'fadeIn 0.6s ease' }}>
                    <div style={{ fontFamily: 'Orbitron', fontSize: 16, color: encounter.color, letterSpacing: 8, marginBottom: 20 }}>ENCOUNTER</div>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 24, maxWidth: 550,
                      background: 'rgba(8,13,26,0.9)',
                      border: `2px solid ${encounter.color}55`,
                      borderRadius: 16, padding: '24px 32px',
                      boxShadow: `0 15px 40px rgba(0,0,0,0.6), 0 0 20px ${encounter.color}33`,
                      animation: 'popIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
                    }}>
                      <div style={{
                        width: 80, height: 80, borderRadius: '50%', flexShrink: 0, fontSize: 40,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                        background: `${encounter.color}22`, border: `2px solid ${encounter.color}`
                      }}>
                        {encChamp ? (
                          <img src={boardIcon(encChamp.img)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span>{encounter.icon}</span>
                        )}
                      </div>
                      <div style={{ textAlign: 'left', flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: encounter.color, letterSpacing: 1, marginBottom: 4 }}>{encounter.champ}</div>
                        <div style={{ fontSize: 20, fontWeight: 900, color: 'white', fontFamily: 'Noto Sans JP', marginBottom: 8 }}>{encounter.jaName}</div>
                        <div style={{ fontSize: 14, color: 'var(--silver)', lineHeight: 1.5, opacity: 0.85 }}>{encounter.desc}</div>
                        <div style={{ fontSize: 10, color: 'var(--textdim)', marginTop: 10, display: 'flex', gap: 10, alignItems: 'center' }}>
                          <span>出現確率 {encounter.prob}%</span>
                          {encounter.displayOnly && <span style={{ color: '#ff9f43', fontWeight: 700 }}>※このシミュレーターでは表示のみ</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div style={{ marginTop: 50, fontSize: '11px', color: 'var(--gold)', opacity: 0.6, animation: 'pulse 2s infinite', pointerEvents: 'none' }}>
                  — CLICK ANYWHERE TO BEGIN —
                </div>
              </>
            )}
          </div>
        );
      })()}




      {/* ヘッダー：シンプル巨大ステージ表示版 */}
      <div className="sp-header-row" style={{ 
        height: isLandscapeMobile ? 40 : 60,
        background: 'var(--bg-panel)', 
        borderBottom: '1px solid rgba(30,45,74,.8)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '0 20px', 
        zIndex: 50, 
        flexShrink: 0,
        position: 'relative'
      }}>
        
        {/* 左側：シード値と今回の変動要素 */}
        <div style={{ position: 'absolute', left: 20, display: 'flex', alignItems: 'center', gap: 15 }}>
          <div style={{ fontFamily: 'Orbitron', fontWeight: 900, fontSize: 12, color: 'var(--textdim)', opacity: 0.6, letterSpacing: 1 }}>
            SEED: {seed}
          </div>
        </div>

        {/* 🌟 中央：遭遇 ＋ ステージ番号 ＋ 神様1 ＋ 神様2 */}
        <div style={{ 
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          whiteSpace: 'nowrap'
        }}>
          
          {/* 左側: 星の観測者 ＋ サイオニック ＋ 遭遇 */}
          <div style={{ width: 420, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', paddingRight: 20, gap: 8 }}>
            
            {/* 星の観測者 */}
            <div 
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#c46bff33', border: '3px solid #c46bff', borderRadius: 8, padding: '4px 12px', cursor: 'help' }}
              title={`【星の観測者】\n${currentStargazerDesc}`}
            >
              <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid #c46bff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: '#4a148c', flexShrink: 0 }}>
                <img src={getTraitIconUrl('Stargazer')} style={{ width: 16, height: 16, filter: 'brightness(0) invert(1)' }} onError={(e) => e.target.style.display='none'} />
              </div>
              <div>
                <div style={{ fontSize: 8, color: 'var(--textdim)', marginBottom: 1 }}>星の観測者</div>
                <div style={{ fontSize: 10, fontWeight: 900, color: '#c46bff', lineHeight: 1.1 }}>{currentStargazerDesc.split('この試合: ')[1]?.split('\n')[0]}</div>
              </div>
            </div>

            {/* サイオニック */}
            <div 
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#4caf5033', border: '3px solid #4caf50', borderRadius: 8, padding: '4px 12px', cursor: 'help' }}
              title={`【サイオニックアイテム】\n① ${currentPsionicItems[0].jaName}\n② ${currentPsionicItems[1].jaName}`}
            >
              <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid #4caf50', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: '#1b5e20', flexShrink: 0 }}>
                <img src={getTraitIconUrl('Psionic')} style={{ width: 16, height: 16, filter: 'brightness(0) invert(1)' }} onError={(e) => e.target.style.display='none'} />
              </div>
              <div>
                <div style={{ fontSize: 8, color: 'var(--textdim)', marginBottom: 1 }}>サイオニック</div>
                <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                  <img src={getMetaTFTItemUrl(currentPsionicItems[0].name)} style={{ width: 14, height: 14, borderRadius: 2 }} />
                  <img src={getMetaTFTItemUrl(currentPsionicItems[1].name)} style={{ width: 14, height: 14, borderRadius: 2 }} />
                </div>
              </div>
            </div>

            {/* 遭遇 (1-2以降) */}
            {round !== '1-1' && encounter && (
              <div style={{display:'flex',alignItems:'center',gap:8,background:`${encounter.color}33`,border:`3px solid ${encounter.color}`,borderRadius:8,padding:'4px 12px'}}>
                <div style={{width:28,height:28,borderRadius:'50%',border:`2px solid ${encounter.color}`,display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden',background:`${encounter.color}22`}}>
                  {(() => {
                    let encChamp = CHAMPS.find(c => c.id === encounter.id);
                    if (!encChamp) {
                      const map = { 'miipsy': 'meepsie', 'velkoz': 'belveth', 'rastt': 'rhaast' };
                      if (map[encounter.id]) encChamp = CHAMPS.find(c => c.id === map[encounter.id]);
                    }
                    if (!encChamp) {
                      encChamp = CHAMPS.find(c => c.jaName.replace(/[・=]/g, '') === encounter.champ.replace(/[・=]/g, ''));
                    }
                    return encChamp ? <img src={boardIcon(encChamp.img)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 14 }}>{encounter.icon}</span>;
                  })()}
                </div>
                <div>
                  <div style={{fontSize:8,color:'var(--textdim)',marginBottom:1}}>遭遇</div>
                  <div style={{fontSize:10,fontWeight:900,color:encounter.color,lineHeight:1.1}}>{encounter.champ}</div>
                </div>
              </div>
            )}
          </div>

          {/* ステージ番号 */}
          <div style={{ 
            fontFamily: 'Orbitron', 
            fontSize: isLandscapeMobile ? '20px' : '32px', 
            fontWeight: 900, 
            color: '#3399ff', 
            letterSpacing: '4px',
            textShadow: '0 0 15px rgba(26,159,255,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 15,
            flexShrink: 0
          }}>
            {round}
            {afkRoundsLeft > 0 && (
              <span style={{ fontSize: '12px', color: 'var(--red)', background: 'rgba(255,68,85,0.1)', padding: '2px 8px', borderRadius: 4, border: '1px solid var(--red)', letterSpacing: '0' }}>
                💤 AFK {afkRoundsLeft}
              </span>
            )}
          </div>

          {/* 右側: 神1 & 神2 (1-2以降) */}
          <div style={{ width: 420, display: 'flex', justifyContent: 'flex-start', paddingLeft: 20, gap: 10 }}>
            {round !== '1-1' && (
              <>
                {encounterGods[0] && (
                  <div style={{display:'flex',alignItems:'center',gap:8,background:`${encounterGods[0].color}33`,border:`3px solid ${encounterGods[0].color}`,borderRadius:8,padding:'4px 12px'}}>
                    <GodImg god={encounterGods[0]} type="icon" style={{width:28,height:28,borderRadius:'50%',border:`2px solid ${encounterGods[0].color}`,objectFit:'cover', background: 'white'}} />
                    <div>
                      <div style={{fontSize:8,color:'var(--textdim)',marginBottom:1}}>遭遇した神</div>
                      <div style={{fontSize:10,fontWeight:900,color:encounterGods[0].color,lineHeight:1.1}}>{encounterGods[0].name.replace('\n', ' ')}</div>
                    </div>
                  </div>
                )}
                {encounterGods[1] && (
                  <div style={{display:'flex',alignItems:'center',gap:8,background:`${encounterGods[1].color}33`,border:`3px solid ${encounterGods[1].color}`,borderRadius:8,padding:'4px 12px'}}>
                    <GodImg god={encounterGods[1]} type="icon" style={{width:28,height:28,borderRadius:'50%',border:`2px solid ${encounterGods[1].color}`,objectFit:'cover', background: 'white'}} />
                    <div>
                      <div style={{fontSize:8,color:'var(--textdim)',marginBottom:1}}>遭遇した神</div>
                      <div style={{fontSize:10,fontWeight:900,color:encounterGods[1].color,lineHeight:1.1}}>{encounterGods[1].name.replace('\n', ' ')}</div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

        </div>

        {/* 右側：ボタン類（変更なし） */}
        <div style={{ position: 'absolute', right: 20, display: 'flex', alignItems: 'center', gap: 10 }}>

          {freeRerolls > 0 && (
            <div style={{ background:'rgba(0,229,192,0.15)', border:'1px solid var(--teal)', borderRadius:4, padding:'4px 8px', fontSize:10, color:'var(--teal)', fontWeight:700 }}>
              🎲 ×{freeRerolls}
            </div>
          )}

          <button 
            onClick={() => setShowTierList(true)}
            style={{ background:'rgba(255,255,255,0.15)', border:'1px solid var(--border)', borderRadius:4, padding:'4px 8px', fontSize:10, color:'var(--text-main)', fontWeight:700, cursor:'pointer' }}
            title="ティアリスト"
          >
            📊 ティアリスト
          </button>

          <button 
            onClick={() => setShowAssetDrawer(true)}
            style={{ background:'rgba(255,255,255,0.15)', border:'1px solid var(--border)', borderRadius:4, padding:'4px 8px', fontSize:10, color:'var(--text-main)', fontWeight:700, cursor:'pointer' }}
            title="チート"
          >
            🎒 チート
          </button>


        </div>
      </div>

      {/* メインエリア */}
      <div style={{ flex:1, display:'flex', overflow:'hidden', position:'relative' }}>
        {/* 左サイドバー */}
        <div style={{ display:'flex', background:'var(--bg-sidebar)', borderRight:'1px solid var(--border)', flexShrink:0 }}>
          <div className="sp-left-trait" style={{ width: isLandscapeMobile ? 110 : 150, padding: isLandscapeMobile ? 4 : 8, overflowY:'auto', borderRight:'1px solid rgba(30,45,74,.3)' }}>
            
            

         
            <div style={{ background:'rgba(26,159,255,.1)', border:'1px solid var(--blue)', borderRadius:6, padding:6, marginBottom:10, textAlign:'center' }}>
              <div style={{ fontSize:8, color:'var(--blue)', fontFamily:'Noto Sans JP' }}>ユニット数</div>
              <div style={{ fontSize:14, color:'var(--text-main)', fontWeight:900, fontFamily:'Orbitron' }}>{board.filter(Boolean).length}/{passiveBuffs.some(b => b.type === 'solo_leveling') ? 1 : level + teamSizeBonus}</div>
            </div>
            {activeTraits.map(([t,c]) => (<div key={t} onMouseEnter={(e) => handleTraitMouseEnter(e, t, c)} onMouseLeave={() => setTraitTooltipData(null)} style={{ fontSize:10, marginBottom:4, background:'var(--bg1)', borderRadius:6, padding:6, border:'1px solid var(--gold)', color:'var(--text-main)', fontWeight:700, display:'flex', alignItems:'center', gap:6 }}><img src={getTraitIconUrl(t)} style={{ width:14, height:14, filter:'brightness(0)' }} onError={(e) => e.target.style.display='none'}/><span>{c} {getTraitJaName(t)}</span></div>))}
            {inactiveTraits.map(([t,c]) => (<div key={t} onMouseEnter={(e) => handleTraitMouseEnter(e, t, c)} onMouseLeave={() => setTraitTooltipData(null)} style={{ fontSize:10, marginBottom:4, background:'var(--bg2)', borderRadius:6, padding:6, border:'1px dashed var(--border)', color:'var(--textdim)', display:'flex', alignItems:'center', gap:6 }}><img src={getTraitIconUrl(t)} style={{ width:14, height:14, opacity:0.5, filter:'brightness(0)' }} onError={(e) => e.target.style.display='none'}/><span>{c} {getTraitJaName(t)}</span></div>))}
          </div>
          {/* アイテム欄 */}
          <div className="sp-left-item" style={{ width: isLandscapeMobile ? 44 : 56, padding: isLandscapeMobile ? 4 : 8, overflowY:'auto', display:'flex', flexDirection:'column', alignItems:'center', gap: isLandscapeMobile ? 4 : 8 }}>
            <div style={{ fontSize:9, color:'var(--gold)', fontFamily:'Noto Sans JP', fontWeight:900, textAlign:'center' }}>アイテム</div>
            {inventory.map((it, i) => (
              <div
                key={i}
                data-drop-type="inventory"
                data-drop-idx={i}
                draggable
                onDragStart={() => setDragSrc({ type:'inventory', idx:i })}
                onTouchStart={(e) => startTouchDrag(e, { type:'inventory', idx:i })}
                onDragOver={e => e.preventDefault()}
                onDrop={hDrop('inventory', i)}
                title={it?.name ? getJaName(it.name) : ""}
                style={{ width:36, height:36, background:'#1e293b', borderRadius:6, border:`1px solid ${it?.type==='artifact'?'var(--red)':(it?.type==='radiant'?'var(--gold2)':(it?.type==='completed'?'var(--gold)':'var(--border)'))}`, cursor:'grab', display:'flex', alignItems:'center', justifyContent:'center', overflow:'visible', flexShrink:0, boxShadow:it?.type==='artifact'?'0 0 10px rgba(220,53,69,0.5)':(it?.type==='radiant'?'0 0 10px rgba(212,175,55,0.5)':(it?.type==='completed'?'0 0 10px rgba(200,169,110,0.3)':'none')), position:'relative' }}>
                {it?.name ? (<img src={getMetaTFTItemUrl(it)} style={{ width:'100%', height:'100%', objectFit:'cover', pointerEvents:'none', borderRadius:4 }} />) : (<span style={{ fontSize:18, pointerEvents:'none' }}>{it?.icon}</span>)}
                
                {/* 🌟 除去装置のスタック数を左上にバッジ表示 */}
                {it?.id === 'remover' && (it.count || 1) > 1 && (
                  <div style={{ position:'absolute', top:-6, left:-6, background:'var(--blue)', color:'white', fontSize:10, fontWeight:900, width:16, height:16, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid var(--bg0)', zIndex:10, boxShadow:'0 2px 4px rgba(0,0,0,0.5)' }}>
                    {it.count}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 盤面 */}
        <div
          ref={boardContainerRef}
          onTouchStart={handleBoardTouchStart}
          onTouchMove={handleBoardTouchMove}
          onTouchEnd={handleBoardTouchEnd}
          style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}
        >
          <div style={{ transform: `scale(${isLandscapeMobile ? Math.min(0.62, boardZoom) : Math.min(0.9, boardZoom)})`, transition: pinchRef.current ? 'none' : 'transform 0.15s' }}>
            <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
              {[0,1,2,3].map(row => (
                <div key={row} style={{ display:'flex', gap:2, marginLeft:row%2===1?39:0 }}>
                  {[0,1,2,3,4,5,6].map(col => {
                    const idx = row*7+col;
                    return (
                      <div key={idx} style={{ display:'contents' }}>
                        <HexCell
                          size={78}
                          champ={board[idx]}
                          dropType="board"
                          dropIdx={idx}
                          isGolden={(passiveBuffs.some(b => b.type === 'shield_maiden') && board[idx]?.id === 'leona') || (passiveBuffs.some(b => b.type === 'terminal_velocity') && board[idx]?.id === 'poppy') || (passiveBuffs.some(b => b.type === 'stellar_combo') && board[idx]?.id === 'aatrox') || (passiveBuffs.some(b => b.type === 'big_bang') && (board[idx]?.id === 'miipsy' || board[idx]?.id === 'meepsie')) || (passiveBuffs.some(b => b.type === 'pro_assassin') && board[idx]?.id === 'pyke') || (passiveBuffs.some(b => b.type === 'self_destruction') && board[idx]?.id === 'gragas') || (passiveBuffs.some(b => b.type === 'heat_death') && board[idx]?.id === 'mordekaiser') || (passiveBuffs.some(b => b.type === 'reach_for_the_stars') && board[idx]?.id === 'jax') || (protectorsPactBuff && board[idx]?.id === protectorsPactBuff.champId)}
                          onDragStart={() => setDragSrc({ type:'board', idx })}
                          onTouchStartDrag={(e) => startTouchDrag(e, { type:'board', idx })}
                          onDrop={hDrop('board', idx)}
                          onMouseEnter={handleMouseEnter}
                          onMouseLeave={handleMouseLeave}
                        />
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 🌟 右サイドバー: 取得済みオーグメント */}
        <div className="sp-right-aug" style={{
          width: isLandscapeMobile ? 72 : 100,
          background: 'var(--bg-sidebar)',
          borderLeft: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: isLandscapeMobile ? '8px 3px' : '15px 5px',
          gap: isLandscapeMobile ? 10 : 20,
          overflowY: 'auto',
          flexShrink: 0
        }}>
          <div style={{ fontSize: 9, color: 'var(--gold2)', fontWeight: 900, marginBottom: 5, textAlign: 'center', fontFamily:'Noto Sans JP' }}>AUGMENTS</div>
          
          {augments.map((a, i) => (
            <div key={i} style={{
              display: 'flex',
              flexDirection: 'column', // 縦に並べる
              alignItems: 'center',
              gap: 6,
              textAlign: 'center',
              width: '100%'
            }}>
              {/* アイコン画像 */}
              <div style={{
                width: 50,
                height: 50,
                background: '#000',
                border: `2px solid ${TIER_COLORS[a.tier]}`,
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                boxShadow: `0 0 10px ${TIER_COLORS[a.tier]}33`,
                flexShrink: 0
              }}>
                <img 
                  src={getAugmentIconUrl(a)} 
                  style={{ width: '85%', height: '85%', objectFit: 'contain' }} 
                  onError={(e) => e.target.style.display = 'none'}
                />
              </div>
              
              {/* 名前 */}
              <span style={{
                fontSize: 10,
                color: TIER_COLORS[a.tier],
                fontWeight: 900,
                lineHeight: 1.2,
                fontFamily: 'Noto Sans JP',
                wordBreak: 'break-all',
                padding: '0 4px'
              }}>
                {a.name}
              </span>
            </div>
          ))}
        </div>
      {/* 🌟 メインエリア全体の閉じタグの直前まで */}


      </div>

      {/* ベンチ */}
      <div style={{ background:'var(--bg-panel)', borderTop:'1px solid var(--border)', padding: isLandscapeMobile ? '4px' : '8px', display:'flex', justifyContent:'center', gap: 4, flexShrink:0 }}>
        
        {/* 🌟 メイン画面：オーラ育成中 の専用待機枠（左側） */}
        {auraTrainingUnit && (
          <div 
            className="sp-bench-slot"
            style={{ 
              width: isLandscapeMobile ? 42 : 54, 
              height: isLandscapeMobile ? 42 : 54, 
              borderRadius:8, 
              background:'var(--bg-hex)', 
              border: `3px dashed ${COST_COLORS[auraTrainingUnit.cost]}`,
              display:'flex', 
              alignItems:'center', 
              justifyContent:'center', 
              position:'relative',
              marginRight: 4,
              opacity: 0.8
            }}
            onMouseEnter={(e) => handleMouseEnter(e, auraTrainingUnit)}
            onMouseLeave={handleMouseLeave}
          >
            <img src={boardIcon(auraTrainingUnit.img)} style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:8, pointerEvents:'none' }} />
            <div style={{ position:'absolute', top:2, left:2, display:'flex', flexDirection:'column', gap:1 }}>
              {(auraTrainingUnit.items||[]).map((it, idx) => (<img key={idx} src={getMetaTFTItemUrl(it)} style={{ width:12, height:12, border:`1px solid ${it?.type==='artifact'?'var(--red)':(it?.type==='radiant'?'var(--gold2)':'white')}`, borderRadius:2, background:'black' }} />))}
            </div>
            <div style={{ position:'absolute', bottom:2, left:0, right:0 }}><Stars star={auraTrainingUnit.star} /></div>
            <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.5)', borderRadius: 8 }}><span style={{ fontSize: 20 }}>🔒</span></div>
          </div>
        )}

        {bench.map((champ, i) => (
          <div 
            key={i}
            data-drop-type="bench"
            data-drop-idx={i}
            onDragOver={e => e.preventDefault()} 
            onDrop={hDrop('bench', i)} 
            className="sp-bench-slot"
            style={{ 
              width: isLandscapeMobile ? 42 : 54, 
              height: isLandscapeMobile ? 42 : 54, 
              borderRadius:8, 
              background:'var(--bg-hex)', 
              border: champ ? `3px solid ${COST_COLORS[champ.cost]}` : `1px solid var(--border)`,
              boxShadow: champ ? `inset 0 0 10px ${COST_COLORS[champ.cost]}33` : 'none',
              display:'flex', 
              alignItems:'center', 
              justifyContent:'center', 
              position:'relative',
              transition: 'border 0.2s ease'
            }}
          >
            {champ && (
              <div
                draggable
                onDragStart={() => setDragSrc({ type:'bench', idx:i })}
                onTouchStart={(e) => startTouchDrag(e, { type:'bench', idx:i })}
                onMouseEnter={champ.isAnvil ? undefined : (e) => handleMouseEnter(e, champ)}
                onMouseLeave={champ.isAnvil ? undefined : handleMouseLeave}
                style={{ width:'100%', height:'100%', cursor:'grab', position:'relative' }}
                title={champ.isAnvil ? champ.jaName : undefined}
              >
                {champ.isAnvil ? (
                  <div style={{ width:'100%', height:'100%', background:'rgba(0,0,0,0.6)', borderRadius:8, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', border:`2px solid ${champ.color}`, overflow:'hidden' }}>
                    <img src={champ.img + "?cors=1"} crossOrigin="anonymous" style={{ width:'100%', height:'100%', objectFit:'cover', pointerEvents:'none' }} alt={champ.jaName} />
                  </div>
                ) : (
                  <>
                    <img src={boardIcon(champ.img)} style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:8, pointerEvents:'none' }} />
                    <div style={{ position:'absolute', top:2, left:2, display:'flex', flexDirection:'column', gap:1 }}>
                      {(champ.items||[]).map((it, idx) => (<img key={idx} src={getMetaTFTItemUrl(it)} style={{ width:12, height:12, border:`1px solid ${it?.type==='artifact'?'var(--red)':(it?.type==='radiant'?'var(--gold2)':'white')}`, borderRadius:2, background:'black' }} />))}
                    </div>
                    <div style={{ position:'absolute', bottom:2, left:0, right:0 }}><Stars star={champ.star} /></div>
                  </>
                )}
              </div>
            )}
            {!champ && <span style={{ color:'var(--border)', fontSize:12 }}>＋</span>}
          </div>
        ))}
      </div>

      {/* ショップ */}
      {/* ショップエリア */}
     {/* 🌟 ショップ・NEXTボタン エリア 🌟 */}
      <div className="sp-shop-area" style={{ height: isLandscapeMobile ? 108 : 140, background:'var(--bg-panel)', borderTop:'2px solid var(--border)', display:'flex', flexShrink:0, position: 'relative' }}>
        
        {/* 左側〜中央：ショップ内容（ドロップ判定はここに残す） */}
        <div onDragOver={e => e.preventDefault()} onDrop={hDrop('shop', -1)} style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {anvilOptions ? (
            /* 🌟 金床のアイテム選択UI（ショップエリアを置き換え） */
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '8px 10px', background: 'rgba(15,23,42,0.95)' }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: 'var(--gold)', textAlign: 'center', marginBottom: 8, fontFamily: 'Noto Sans JP', flexShrink: 0 }}>
                アイテムを1つ選択してください
              </div>
              <div style={{ display: 'flex', gap: anvilOptions.items.length > 5 ? 8 : 12, justifyContent: 'center', alignItems: 'stretch', flex: 1, paddingBottom: 4, flexWrap: 'wrap', overflowY: 'auto', alignContent: 'flex-start' }}>
                {anvilOptions.items.map((it, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleAnvilSelect(it)}
                    draggable
                    onDragStart={() => setDragSrc({ type: 'anvil_item', item: it })}
                    onTouchStart={(e) => startTouchDrag(e, { type: 'anvil_item', item: it })}
                    style={{
                      flex: anvilOptions.items.length > 5 ? '0 0 auto' : 1,
                      width: anvilOptions.items.length > 5 ? 64 : 'auto',
                      minHeight: anvilOptions.items.length > 5 ? 74 : 'auto',
                      maxWidth: 140,
                      background: 'rgba(30,45,74,0.6)',
                      border: `2px solid ${it.type === 'artifact' ? 'var(--red)' : (it.type === 'radiant' ? 'var(--gold2)' : 'var(--gold)')}`,
                      borderRadius: 8,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      padding: '4px',
                      textAlign: 'center',
                      transition: 'all 0.2s',
                      boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.background = 'rgba(40,60,100,0.9)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.background = 'rgba(30,45,74,0.6)'; }}
                  >
                    <img src={getMetaTFTItemUrl(it)} style={{ width: anvilOptions.items.length > 5 ? 32 : 44, height: anvilOptions.items.length > 5 ? 32 : 44, borderRadius: 6, marginBottom: 4 }} />
                    <div style={{ fontSize: anvilOptions.items.length > 5 ? 9 : 11, fontWeight: 900, color: 'white', lineHeight: 1.1, wordBreak: 'keep-all' }}>{getJaName(it.name || it.id)}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : showMfPopup ? (
            /* 🌟 ミス・フォーチュンの武装モード選択UI（ショップエリアを置き換え） */
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '8px 10px', background: 'rgba(15,23,42,0.95)' }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: 'var(--red)', textAlign: 'center', marginBottom: 8, fontFamily: 'Noto Sans JP', flexShrink: 0 }}>
                ミス・フォーチュン：武装モードを選択
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', alignItems: 'stretch', flex: 1, paddingBottom: 4 }}>
                {['Channeler', 'Challenger', 'Replicator'].map(mode => (
                  <div 
                    key={mode}
                    onClick={() => {
                      const updateUnit = u => (u && u.uid === mfTargetUid) ? { ...u, selectedMode: mode } : u;
                      setBoard(prev => prev.map(updateUnit));
                      setBench(prev => prev.map(updateUnit));
                      setShowMfPopup(false);
                      setMfTargetUid(null);
                      showMsg(
                        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                          <span style={{ fontSize:18 }}>🔫</span>
                          <span>武装を【{TRAIT_JA[mode]}】に設定しました！</span>
                        </div>
                      );
                    }}
                    style={{ 
                      flex: 1,
                      maxWidth: 140,
                      background: 'rgba(30,45,74,0.6)', 
                      border: '2px solid var(--red)', borderRadius: 8, 
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                      cursor: 'pointer', padding: '4px', textAlign: 'center', color: 'white', 
                      transition: 'all 0.2s', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)' 
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.background = 'rgba(40,60,100,0.9)'; }} 
                    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.background = 'rgba(30,45,74,0.6)'; }}
                  >
                    <img src={getTraitIconUrl(mode)} style={{ width: 44, height: 44, marginBottom: 4, filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.5))' }} onError={e => e.target.style.display='none'} />
                    <div style={{ fontWeight: 900, fontSize: '11px', fontFamily: 'Noto Sans JP', lineHeight: 1.1 }}>{TRAIT_JA[mode]}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : round !== '1-1' && round !== '1-2' && !showAugment ? (
            <React.Fragment>
              {/* ヘッダー情報（レベル・XP・ゴールド・確率） */}
              <div className="sp-shop-header" style={{ height: isLandscapeMobile ? 20 : 26, display:'flex', alignItems:'center', padding:'0 15px', background:'var(--bg2)', borderBottom:'1px solid var(--border)', fontFamily:'Orbitron', position:'relative' }}>
                <div style={{ display:'flex', alignItems:'center' }}>
                  <div style={{ fontWeight:900, fontSize:13, color:'var(--text-main)', marginRight:10 }}>LV {level}{!passiveBuffs.some(b => b.type === 'solo_leveling') && teamSizeBonus > 0 ? `+${teamSizeBonus}` : ''}</div>
                  <div style={{ color:'var(--textdim)', fontSize:11, fontFamily:'Rajdhani', fontWeight:700 }}>{xp} / {XP_FOR_NEXT_LEVEL[level]||'-'}</div>
                </div>
                <div style={{ position:'absolute', left:'50%', transform:'translateX(-50%)', display:'flex', alignItems:'center', justifyContent:'center', height:'100%', padding:'0 30px', color:'var(--text-main)', fontSize:15, fontWeight:900, background:'linear-gradient(90deg, transparent 0%, var(--bg2) 20%, var(--bg2) 80%, transparent 100%)' }}>
                  <span style={{ color:'var(--gold2)', marginRight:8, fontSize:12, textShadow:'0 0 5px var(--gold)' }}>💰</span> {gold}
                </div>
                <div style={{ display:'flex', gap:12, fontSize:10, fontWeight:900, marginLeft:'auto' }}>
                  {(()=>{
                    const odds = {1:[100,0,0,0,0],2:[100,0,0,0,0],3:[75,25,0,0,0],4:[55,30,15,0,0],5:[45,33,20,2,0],6:[35,40,20,5,0],7:[19,35,35,10,1],8:[15,25,35,20,5],9:[10,20,25,35,10]}[level] || [100,0,0,0,0];
                    const colors = ['#8a9aaa','#44cc66','#3399ff','#cc44ff','#ffcc44'];
                    return odds.map((o,i) => o > 0 && <div key={i} style={{ color:colors[i] }}>• {o}%</div>);
                  })()}
                </div>
              </div>

              {/* 操作エリア（XP・リロール・チャンピオン枠） */}
              <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:12, padding:'0 20px', height:'100%' }}>
                <div style={{ display:'flex', flexDirection:'column', gap:6, width:130, flexShrink:0 }}>
                  {/* XP購入ボタン */}
                  <button
                    disabled={passiveBuffs.some(b => b.type === 'wise_spending')}
                    onClick={() => {
                      if (passiveBuffs.some(b => b.type === 'wise_spending')) return;
                      const cost = xpCost;
                      if (gold >= cost) {
                        setGold(g => g - cost);
                        const extraXp = passiveBuffs.some(b => b.type === 'level_up_aug') ? 2 : 0;
                        const { level: nl, xp: nx } = applyXp(4 + extraXp, level, xp);
                        setLevel(nl); setXp(nx);
                      }
                    }}
                    style={{ height:38, background:passiveBuffs.some(b => b.type === 'wise_spending') ? 'rgba(30,45,74,.4)' : 'var(--blue)', border:`1px solid ${passiveBuffs.some(b => b.type === 'wise_spending') ? 'var(--border)' : 'var(--blue)'}`, borderRadius:4, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 10px', cursor:passiveBuffs.some(b => b.type === 'wise_spending') ? 'not-allowed' : 'pointer', color:passiveBuffs.some(b => b.type === 'wise_spending') ? 'rgba(255,255,255,0.3)' : 'var(--text-inv)' }}>
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-start', fontFamily:'Noto Sans JP' }}>
                      <span style={{ fontSize:13, fontWeight:700, lineHeight:1.2 }}>XP購入</span>
                      <span style={{ fontSize:11, color:'white', fontFamily:'Orbitron' }}>💰 {xpCost}</span>
                    </div>
                    <div style={{ fontSize: 16 }}>⬆️</div>
                  </button>
                  {/* リロールボタン */}
                  <button
                    onClick={() => {
                      if (freeRerolls > 0) { setFreeRerolls(fr => fr - 1); setShop(rollShop(level, rngShop)); return; }
                      if (gold >= 2) {
                        setGold(g => g - 2); setShop(rollShop(level, rngShop));
                        if (passiveBuffs.some(b => b.type === 'prism_ticket') && rngShop() < 0.5) setFreeRerolls(fr => fr + 1);
                        if (passiveBuffs.some(b => b.type === 'wise_spending')) {
                          const { level: nl, xp: nx } = applyXp(2, level, xp);
                          setLevel(nl); setXp(nx);
                        }
                      }
                    }}
                    style={{ height:38, background:'var(--gold)', border:`1px solid ${freeRerolls>0?'var(--teal)':'var(--gold)'}`, borderRadius:4, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 10px', cursor:'pointer', color:'var(--text-inv)' }}>
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-start', fontFamily:'Noto Sans JP' }}>
                      <span style={{ fontSize:13, fontWeight:700, lineHeight:1.2 }}>リロール</span>
                      <span style={{ fontSize:11, color:freeRerolls>0?'var(--teal)':'white', fontFamily:'Orbitron' }}>{freeRerolls > 0 ? `🎲 無料(${freeRerolls})` : '💰 2'}</span>
                    </div>
                    <div style={{ fontSize: 16 }}>🔄</div>
                  </button>
                </div>

                {/* チャンピオン枠 */}
                <div style={{ display:'flex', gap:8, height:'100%', padding:'8px 0' }}>
                  {shop.map((champ, i) => (
                    <div key={i}
                      draggable={!!champ && gold>=champ.cost}
                      onDragStart={champ ? () => setDragSrc({ type:'shop', idx:i }) : undefined}
                      onTouchStart={champ && gold>=champ.cost ? (e) => startTouchDrag(e, { type:'shop', idx:i }) : undefined}
                      onClick={() => {
                        const unit = shop[i]; if (!unit || gold < unit.cost) return;
                        const slot = bench.findIndex(x => !x); if (slot === -1) return;
                        let nb = [...bench], ns = [...shop];
                        nb[slot] = { ...unit, star:1, uid:rngMisc(), items:[] }; ns[i] = null;
                        setGold(g => g - unit.cost); setShop(ns);
                        setBench(nb);
                      }}
                      style={{ height:'100%', aspectRatio:'400/237', flexShrink:0, borderRadius:4, background:champ?'var(--bg1)':'transparent', border:champ?`3px solid ${COST_COLORS[champ.cost]}`:'1px solid var(--border)', cursor:champ?'pointer':'default', position:'relative', overflow:'hidden', opacity:champ&&gold<champ.cost?0.4:1 }}>
                      {champ && (
                        <React.Fragment>
                          <img src={champIcon(champ.img)} style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', pointerEvents:'none' }}/>
                          <div style={{ position:'absolute', inset:0, background:'linear-gradient(0deg, rgba(15,23,42,0.95) 0%, transparent 45%, rgba(15,23,42,0.7) 100%)' }}></div>
                          <div style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', width:26, height:6, background:COST_COLORS[champ.cost], borderBottomLeftRadius:4, borderBottomRightRadius:4, border:'1px solid rgba(0,0,0,0.5)', borderTop:'none' }}></div>
<div style={{ position:'absolute', top:12, left:6, display:'flex', flexDirection:'column', gap:3 }}>
    {(() => {
      let displayTraits = [...champ.traits];
      if (champ.traits.includes('missfortuneuniquetrait')) displayTraits.push(champ.selectedMode || 'unselected');
      return displayTraits.map(t => (
        <div key={t} style={{ display:'flex', alignItems:'center', gap:4 }}>
          <img src={getTraitIconUrl(t)} style={{ width:12, height:12, filter: t==='unselected'?'grayscale(1) opacity(0.5)':'drop-shadow(1px 1px 2px rgba(0,0,0,0.8))' }} onError={(e)=>{if(t==='unselected')e.target.src="https://cdn.metatft.com/file/metatft/traits/unknown.png";else e.target.style.display='none';}}/>
          <span style={{ fontSize:10, color: t==='unselected'?'rgba(255,255,255,0.5)':'white', fontWeight:900, textShadow:'0 0 3px rgba(0,0,0,0.8)' }}>{getTraitJaName(t)}</span>
        </div>
      ));
    })()}
  </div>
                          <div style={{ position:'absolute', bottom:4, left:6, right:6, display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
                            <span style={{ fontSize:12, fontWeight:900, color:'white', textShadow:'0 0 3px rgba(0,0,0,1)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{champ.jaName}</span>
                            <span style={{ fontSize:12, fontWeight:900, color:'var(--gold2)', textShadow:'0 0 3px rgba(0,0,0,1)', fontFamily:'Orbitron' }}>💰 {champ.cost}</span>
                          </div>
                        </React.Fragment>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </React.Fragment>
          ) : (
            /* 🌟 隠されている時の表示 */
            <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Noto Sans JP', color:'var(--textdim)', fontSize:12, opacity:0.5 }}>
              {showAugment ? 'オーグメントを選択中...' : '・・・戦闘中・・　右下の「NEXT」を押してね'}
            </div>
          )}
        </div>

        {/* 🌟 右側：NEXTボタンエリア（常に表示） */}
        <div className="sp-next-btn-area" style={{ width: isLandscapeMobile ? 100 : 140, borderLeft: '1px solid var(--border)', background: 'var(--bg-sidebar)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: isLandscapeMobile ? '8px' : '15px', zIndex: 10 }}>
          <button 
            className="sp-next-btn"
            onClick={() => handleNextRound()} 
            style={{ 
              width: '100%', height: isLandscapeMobile ? 52 : 70,
              background: round === '2-1' ? 'var(--red)' : (phase === 'main' && round !== '1-1' && round !== '1-2' ? '#ff9f43' : 'var(--blue)'), 
              border: '1px solid white', borderRadius: 8, 
              fontFamily: 'Orbitron', fontSize: isLandscapeMobile ? '14px' : '18px', color: 'white', 
              cursor: 'pointer', fontWeight: 900,
              boxShadow: '0 0 15px rgba(26,159,255,0.3)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <span style={{ fontSize: '11px', opacity: 0.8, marginBottom: '2px', fontFamily: 'Noto Sans JP' }}>
              {round === '2-1' ? '最終結果へ' : (phase === 'main' && round !== '1-1' && round !== '1-2' ? 'フェーズ移行' : '次のラウンド')}
            </span>
            <span>{round === '2-1' ? 'FINISH' : (phase === 'main' && round !== '1-1' && round !== '1-2' ? '素材ドロップへ' : 'NEXT ➔')}</span>
          </button>
        </div>

      </div>

    </div>
  );
}



ReactDOM.createRoot(document.getElementById('root')).render(<Main/>);
