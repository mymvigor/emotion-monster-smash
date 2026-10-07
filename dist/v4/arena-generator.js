import{choose,hash,range,rng,shuffle}from"./utils.js";

const PROP_LIBRARY={
  stage:["spotlight","screen","speaker","podium","mirror","sign"],
  office:["desk","chair","cabinet","screen","files","trophy"],
  corridor:["door","sign","bench","lamp","locker","bin"],
  factory:["pipe","crate","pillar","screen","barrel","chain"],
  void:["obelisk","frame","screen","pillar","orb","gate"],
  ranking:["scoreboard","ladder","telescope","podium","screen","sign"],
  maze:["door","mirror","sign","frame","lamp","chain"]
};
const THEMES=["stage","office","corridor","factory","void","ranking","maze"];
export function createArenaDNA(concepts=[],seed=Date.now(),mutations=[],preferred){const random=rng(hash(`${seed}|arena`)),mutation=mutations.reduce((n,m)=>n+(m.arena?.extraProps||0),0),theme=preferred&&PROP_LIBRARY[preferred]?preferred:concepts.includes("performative")?choose(["stage","office"],random):concepts.includes("comparison")?choose(["ranking","corridor"],random):concepts.includes("exclusion")?choose(["corridor","maze"],random):choose(THEMES,random),pool=shuffle(PROP_LIBRARY[theme],random),count=Math.min(pool.length,range(3,5,random)+mutation);return{id:`arena-${hash(`${theme}|${seed}`).toString(36)}`,theme,layout:choose(["wide","stacked","tunnel","split","pit"],random),palette:choose(["violet","acid","ember","cyan","mono"],random),props:pool.slice(0,count).map((type,index)=>({id:`prop-${index}-${type}`,type,state:"normal",damage:0,weapon:["chair","crate","trophy","sign","bin","brick","barrel"].includes(type),x:8+index*(84/Math.max(1,count-1)),y:range(49,76,random),tilt:range(-5,5,random)})),seed,glitch:mutations.some(m=>m.arena?.glitch)}}
export function damageProp(prop,power=1){const next={...prop,damage:prop.damage+power};next.state=next.damage>=3?"destroyed":next.damage>=2?"broken":next.damage>=1?"damaged":"normal";return next}
const ICONS={
  spotlight:'<svg viewBox="0 0 64 64"><path d="M9 10h28l-7 22H15z"/><path d="M24 32v22M13 55h23"/><path class="beam" d="M36 16l24 12-28 8z"/></svg>',
  screen:'<svg viewBox="0 0 64 64"><rect x="7" y="8" width="50" height="35" rx="3"/><path d="M27 43v9M37 43v9M18 54h28"/><path class="detail" d="M15 18h34M15 27h22"/></svg>',
  speaker:'<svg viewBox="0 0 64 64"><rect x="12" y="5" width="40" height="54" rx="4"/><circle cx="32" cy="41" r="12"/><circle class="detail" cx="32" cy="17" r="6"/></svg>',
  podium:'<svg viewBox="0 0 64 64"><path d="M12 9h40l-5 12H17zM21 21h22l5 38H16z"/><path class="detail" d="M25 31h14"/></svg>',
  mirror:'<svg viewBox="0 0 64 64"><path d="M32 4c15 0 22 12 22 25S47 54 32 54 10 42 10 29 17 4 32 4z"/><path d="M28 54v5M20 60h24"/><path class="detail" d="M22 14l22 29"/></svg>',
  sign:'<svg viewBox="0 0 64 64"><path d="M5 9h48l7 13-7 13H5zM28 35v24M18 59h30"/><path class="detail" d="M14 22h31"/></svg>',
  desk:'<svg viewBox="0 0 64 64"><path d="M5 21h54v13H5zM12 34v25M52 34v25M18 40h28"/><path class="detail" d="M38 9h16v12H38z"/></svg>',
  chair:'<svg viewBox="0 0 64 64"><path d="M15 7h31v29H15zM10 36h44v9H10zM18 45l-6 14M46 45l6 14"/></svg>',
  cabinet:'<svg viewBox="0 0 64 64"><rect x="12" y="5" width="40" height="54"/><path d="M12 23h40M12 41h40"/><circle class="detail" cx="32" cy="17" r="2"/><circle class="detail" cx="32" cy="35" r="2"/></svg>',
  files:'<svg viewBox="0 0 64 64"><path d="M8 19h19l5 6h24v31H8z"/><path d="M14 9h34v10H14z"/><path class="detail" d="M17 36h30M17 45h24"/></svg>',
  trophy:'<svg viewBox="0 0 64 64"><path d="M20 8h24v17c0 11-24 11-24 0zM25 36h14v10H25zM16 48h32v10H16z"/><path d="M20 13H8c0 13 5 18 14 18M44 13h12c0 13-5 18-14 18"/></svg>',
  door:'<svg viewBox="0 0 64 64"><path d="M12 4h40v56H12zM20 11h24v49H20z"/><circle class="detail" cx="39" cy="36" r="3"/></svg>',
  bench:'<svg viewBox="0 0 64 64"><path d="M6 23h52v13H6zM12 36v19M52 36v19M9 15h46v8"/></svg>',
  lamp:'<svg viewBox="0 0 64 64"><path d="M18 20h28L39 6H25zM32 20v34M21 58h22"/><path class="beam" d="M19 21L7 42h50L45 21z"/></svg>',
  locker:'<svg viewBox="0 0 64 64"><rect x="10" y="4" width="44" height="56" rx="2"/><path d="M32 4v56M17 14h9M38 14h9M17 20h9M38 20h9"/><circle class="detail" cx="27" cy="34" r="2"/><circle class="detail" cx="37" cy="34" r="2"/></svg>',
  bin:'<svg viewBox="0 0 64 64"><path d="M13 19h38l-4 40H17zM9 12h46v8H9zM23 6h18v6"/><path class="detail" d="M25 28v22M39 28v22"/></svg>',
  pipe:'<svg viewBox="0 0 64 64"><path d="M8 5h17v29h22v25H30V50H8z"/><path d="M4 13h25M38 30v24"/><circle class="detail" cx="47" cy="43" r="8"/></svg>',
  crate:'<svg viewBox="0 0 64 64"><path d="M7 8h50v50H7zM7 8l50 50M57 8L7 58"/><path class="detail" d="M15 8v50M49 8v50"/></svg>',
  barrel:'<svg viewBox="0 0 64 64"><path d="M16 6h32l5 9-3 40-5 5H19l-5-5-3-40z"/><path d="M13 18h38M14 47h36"/><path class="detail" d="M32 24v17"/></svg>',
  chain:'<svg viewBox="0 0 64 64"><path d="M19 5c9 0 9 15 0 15S10 5 19 5zm13 15c9 0 9 15 0 15s-9-15 0-15zm13 15c9 0 9 15 0 15s-9-15 0-15z"/></svg>',
  pillar:'<svg viewBox="0 0 64 64"><path d="M13 5h38v9H13zM18 14h28v36H18zM10 50h44v10H10z"/><path class="detail" d="M27 18v28M37 18v28"/></svg>',
  obelisk:'<svg viewBox="0 0 64 64"><path d="M32 3l13 18-5 33H24l-5-33zM16 54h32v7H16z"/><path class="detail" d="M32 13l5 11-5 9-5-9z"/></svg>',
  frame:'<svg viewBox="0 0 64 64"><path d="M8 7h48v50H8zM16 15v34h32V15z"/><path class="detail" d="M20 20l24 24M44 20L20 44"/></svg>',
  orb:'<svg viewBox="0 0 64 64"><circle cx="32" cy="25" r="19"/><path d="M28 44h8v8M18 58h28M24 52h16"/><path class="detail" d="M21 25c7-13 16-13 23 0-7 13-16 13-23 0z"/></svg>',
  gate:'<svg viewBox="0 0 64 64"><path d="M7 59V20L18 5h28l11 15v39H45V23L39 14H25l-6 9v36z"/><path class="detail" d="M25 29h14v30H25z"/></svg>',
  scoreboard:'<svg viewBox="0 0 64 64"><path d="M5 8h54v37H5zM20 45v14M44 45v14"/><path class="detail" d="M14 17h15v18H14zM35 17h15v18H35z"/></svg>',
  ladder:'<svg viewBox="0 0 64 64"><path d="M15 4v56M49 4v56M15 14h34M15 27h34M15 40h34M15 53h34"/></svg>',
  telescope:'<svg viewBox="0 0 64 64"><path d="M8 12l40 13-5 17L3 29zM48 25l11 8-3 10-13-1zM31 38v19M20 59h22"/></svg>'
};
export const propSVG=type=>ICONS[type]||'<svg viewBox="0 0 64 64"><path d="M8 8h48v48H8z"/></svg>';
export const propSignature=type=>propSVG(type).replace(/\s/g,"");
const ARCH={stage:"CURTAIN // LIVE",office:"OPEN PLAN // 99+",corridor:"EXIT? // LEVEL 13",factory:"PRESSURE // MAX",void:"NULL // ECHO",ranking:"RANK // AGAIN",maze:"THIS WAY? // NO"};
export class ArenaView{
  constructor(root,dna,onWeapon){this.root=root;this.dna=structuredClone(dna);this.onWeapon=onWeapon;this.destroyed=0;this.stage="defiant";this.chaosNodes=new Set;this.render()}
  render(){this.root.dataset.arena=this.dna.theme;this.root.dataset.palette=this.dna.palette;this.root.classList.toggle("arena-glitch",Boolean(this.dna.glitch));this.layer=document.createElement("div");this.layer.className=`arena-world layout-${this.dna.layout}`;this.layer.innerHTML=`<div class="arena-backdrop"><i></i><i></i><i></i><b>${ARCH[this.dna.theme]}</b></div><div class="arena-architecture"><span></span><span></span><span></span></div><div class="arena-floor"></div><div class="arena-props">${this.dna.props.map(p=>this.propHTML(p)).join("")}</div><div class="arena-rubble"></div><div class="arena-chaos"></div>`;this.root.appendChild(this.layer);this.layer.addEventListener("click",e=>{const el=e.target.closest(".arena-prop.weapon-ready");if(!el)return;const prop=this.dna.props.find(p=>p.id===el.dataset.id);if(prop&&this.onWeapon){el.classList.add("weapon-thrown");this.onWeapon(prop);prop.state="destroyed";prop.damage=3;setTimeout(()=>this.updateProp(prop),320)}})}
  propHTML(p){return`<button class="arena-prop prop-${p.type} state-${p.state} ${p.weapon&&p.state==="broken"?"weapon-ready":""}" data-id="${p.id}" style="--px:${p.x}%;--py:${p.y}%;--tilt:${p.tilt}deg" aria-label="${p.type}${p.weapon&&p.state==="broken"?"，可投掷":""}"><i class="prop-shape">${propSVG(p.type)}</i><b class="prop-crack"></b><span class="prop-label">${p.type}</span></button>`}
  updateProp(prop){const old=this.layer?.querySelector(`[data-id="${prop.id}"]`);if(!old)return;const wrap=document.createElement("div");wrap.innerHTML=this.propHTML(prop);old.replaceWith(wrap.firstElementChild)}
  hit({power=1,wall=false,targetX=50}={}){const candidates=this.dna.props.filter(p=>p.state!=="destroyed").sort((a,b)=>Math.abs(a.x-targetX)-Math.abs(b.x-targetX));const prop=candidates[0];if(!prop)return null;const before=prop.state;Object.assign(prop,damageProp(prop,wall?power+1:power));if(prop.state!==before){this.updateProp(prop);if(prop.state==="destroyed")this.destroyed++}return{prop,state:prop.state,changed:before!==prop.state,destroyed:this.destroyed}}
  setStage(stage){this.stage=stage;this.layer.dataset.stage=stage;this.layer.classList.toggle("arena-ruined",stage==="release"||stage==="full");if(stage==="CRACKED"||stage==="RAGING")this.hit({power:1,targetX:range(12,88)});if(stage==="release")this.hit({power:2,wall:true,targetX:50})}
  chaos(kind=choose(["bin-roll","chandelier-drop","vending-spit"])) {const zone=this.layer?.querySelector(".arena-chaos");if(!zone)return null;const node=document.createElement("div");node.className=`chaos-setpiece chaos-${kind}`;node.innerHTML=kind==="bin-roll"?'<span>🗑</span><i>咣</i>':kind==="chandelier-drop"?'<span>✦</span><i>哐!</i>':'<span>▥</span><i>🥫 🥫 🥫</i>';zone.appendChild(node);this.chaosNodes.add(node);setTimeout(()=>{node.remove();this.chaosNodes.delete(node)},2200);return kind}
  interact(kind,power=1){if(kind==="dismantle-metal"){const metal=this.dna.props.find(p=>["locker","pipe","barrel","chain","cabinet"].includes(p.type)&&p.state!=="destroyed");if(metal){Object.assign(metal,damageProp(metal,power+1));this.updateProp(metal);this.flashInteraction("metal-yank");return metal}}const className={"scatter-props":"scatter-jolt","crack-floor":"floor-crater","stamp-stage":"stage-stamped","shred-prop":"prop-shred","ricochet":"prop-ricochet","wall-launch":"wall-launch","collect-and-spit":"collect-spit"}[kind];if(className)this.flashInteraction(className,kind==="stamp-stage"?1700:650);return this.hit({power:kind==="shred-prop"?power+1:power,targetX:range(15,85)})?.prop}
  flashInteraction(className,duration=650){this.layer?.classList.remove(className);void this.layer?.offsetWidth;this.layer?.classList.add(className);setTimeout(()=>this.layer?.classList.remove(className),duration)}
  ruin(){this.layer?.classList.add("arena-ruined");for(const p of this.dna.props){if(p.state!=="destroyed"){p.state=Math.random()>.45?"destroyed":"broken";p.damage=p.state==="destroyed"?3:2;this.updateProp(p)}}}
  signature(){return`${this.dna.theme}:${this.dna.layout}:${this.dna.props.map(p=>p.type).join(",")}`}
  destroy(){for(const n of this.chaosNodes)n.remove();this.chaosNodes.clear();this.layer?.remove();this.layer=null;this.root?.removeAttribute("data-arena");this.root?.removeAttribute("data-palette");this.root=null;this.onWeapon=null}
}
