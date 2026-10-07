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
export class ArenaView{
  constructor(root,dna,onWeapon){this.root=root;this.dna=structuredClone(dna);this.onWeapon=onWeapon;this.destroyed=0;this.render()}
  render(){this.root.dataset.arena=this.dna.theme;this.root.dataset.palette=this.dna.palette;this.root.classList.toggle("arena-glitch",Boolean(this.dna.glitch));this.layer=document.createElement("div");this.layer.className=`arena-world layout-${this.dna.layout}`;this.layer.innerHTML=`<div class="arena-backdrop"></div><div class="arena-floor"></div><div class="arena-props">${this.dna.props.map(p=>this.propHTML(p)).join("")}</div><div class="arena-rubble"></div>`;this.root.appendChild(this.layer);this.layer.addEventListener("click",e=>{const el=e.target.closest(".arena-prop.weapon-ready");if(!el)return;const prop=this.dna.props.find(p=>p.id===el.dataset.id);if(prop&&this.onWeapon){el.classList.add("weapon-thrown");this.onWeapon(prop);prop.state="destroyed";prop.damage=3;setTimeout(()=>this.updateProp(prop),320)}})}
  propHTML(p){return`<button class="arena-prop prop-${p.type} state-${p.state} ${p.weapon&&p.state==="broken"?"weapon-ready":""}" data-id="${p.id}" style="--px:${p.x}%;--py:${p.y}%;--tilt:${p.tilt}deg" aria-label="${p.type}${p.weapon&&p.state==="broken"?"，可投掷":""}"><i></i><b></b><span></span></button>`}
  updateProp(prop){const old=this.layer?.querySelector(`[data-id="${prop.id}"]`);if(!old)return;const wrap=document.createElement("div");wrap.innerHTML=this.propHTML(prop);old.replaceWith(wrap.firstElementChild)}
  hit({power=1,wall=false,targetX=50}={}){const candidates=this.dna.props.filter(p=>p.state!=="destroyed").sort((a,b)=>Math.abs(a.x-targetX)-Math.abs(b.x-targetX));const prop=candidates[0];if(!prop)return null;const before=prop.state;Object.assign(prop,damageProp(prop,wall?power+1:power));if(prop.state!==before){this.updateProp(prop);if(prop.state==="destroyed")this.destroyed++}return{prop,state:prop.state,changed:before!==prop.state,destroyed:this.destroyed}}
  ruin(){this.layer?.classList.add("arena-ruined");for(const p of this.dna.props){if(p.state!=="destroyed"){p.state=Math.random()>.45?"destroyed":"broken";p.damage=p.state==="destroyed"?3:2;this.updateProp(p)}}}
  signature(){return`${this.dna.theme}:${this.dna.layout}:${this.dna.props.map(p=>p.type).join(",")}`}
  destroy(){this.layer?.remove();this.layer=null;this.root?.removeAttribute("data-arena");this.root?.removeAttribute("data-palette");this.root=null;this.onWeapon=null}
}
