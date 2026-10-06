import { generateMonsters, hasImmediateSafetyRisk } from "./monster-brain.js";
import { getAllMonsters, saveEncounter, markDefeated, getSetting, setSetting, clearAllData } from "./db.js";

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const views = $$(".view");
const state = {
  mode: "emotion", monsters: [], activeIndex: 0, combo: 0, comboTimer: null,
  sound: true, saveRaw: false, deferredInstall: null, speechTimer: null
};

function showView(id) {
  views.forEach(view => view.classList.toggle("active", view.id === id));
  $(".topbar").classList.toggle("hidden", id === "battleView");
  document.body.style.overflow = id === "battleView" ? "hidden" : "";
  if (id === "dexView") renderDex();
  window.scrollTo(0, 0);
}

function toast(message) {
  const el = $("#toast"); el.textContent = message; el.classList.add("show");
  clearTimeout(el._timer); el._timer = setTimeout(() => el.classList.remove("show"), 2200);
}

function setupMode(mode) {
  state.mode = mode;
  const emotion = mode === "emotion";
  $("#modeBadge").textContent = emotion ? "脑内作乱" : "人间奇葩";
  $("#promptTitle").textContent = emotion ? "现在什么东西在折磨你？" : "今天又碰见什么玩意儿了？";
  $("#ventInput").placeholder = emotion ? "随便说，不用组织语言，也不用文明……" : "说吧，谁又干了什么破事……";
  const examples = emotion ? ["怕别人超过我", "脑子一直瞎想", "觉得自己不够好"] : ["同事又阴阳怪气", "那个人抢功还邀功", "总有人对我指手画脚"];
  $("#exampleChips").innerHTML = examples.map(x => `<button>${x}</button>`).join("");
  $("#ventInput").value = ""; updateInput(); showView("inputView");
  setTimeout(() => $("#ventInput").focus(), 320);
}

function updateInput() {
  const value = $("#ventInput").value.trim();
  $("#charCount").textContent = `${$("#ventInput").value.length} / 280`;
  $("#releaseBtn").disabled = value.length < 2;
}

function escapeXML(value) {
  return String(value).replace(/[<>&"']/g, c => ({"<":"&lt;",">":"&gt;","&":"&amp;","\"":"&quot;","'":"&apos;"}[c]));
}

function bodyPath(shape) {
  return {
    blob: "M75 226C60 148 94 68 168 62c87-8 144 60 136 152-6 71-44 122-120 125C106 342 87 295 75 226Z",
    pear: "M78 245c1-61 49-82 68-137 12-37 25-60 57-60 41 0 48 39 63 77 19 48 56 67 51 126-6 70-51 97-119 95-72-2-121-29-120-101Z",
    round: "M66 207C66 118 112 65 194 65s135 54 135 143-48 137-135 137S66 296 66 207Z",
    slug: "M45 259c21-29 39-23 47-84 10-76 48-113 107-105 45 6 66 39 83 96 16 52 45 58 70 94 21 30-11 72-50 63-25-5-39 14-68 16-39 3-45-16-75-17-34-2-42 14-74 5-40-11-64-37-40-68Z",
    spike: "M70 242 85 165l-19-49 56 15 30-69 35 45 47-62 19 75 70-26-25 69 50 38-46 31 24 72-74-5-35 48-36-37-67 25 3-66-47-35Z"
  }[shape] || bodyPath("blob");
}

function eyeMarkup(dna, hurt = 0) {
  const coords = dna.eyes === 1 ? [[195,181]] : dna.eyes === 3 ? [[143,180],[196,158],[245,180]] : [[157,174],[235,174]];
  return coords.map(([x,y],i) => {
    const shift = dna.eyeExpression === "side-eye" ? 7 : 0;
    const ry = dna.eyeExpression === "squint" ? 12 : dna.eyeExpression === "wide" ? 27 : 21;
    const pupilY = hurt > 45 ? y - 2 : y + 4;
    const brow = dna.eyeExpression === "smug" ? `<path d="M${x-20} ${y-34+i*2}q20 ${i%2?-11:9} 40 0" fill="none" stroke="#261c32" stroke-width="9" stroke-linecap="round"/>` : "";
    return `<g class="eye">${brow}<ellipse cx="${x}" cy="${y}" rx="22" ry="${ry}" fill="#fffaf2"/><circle cx="${x+shift}" cy="${pupilY}" r="8" fill="#21172c"/><circle cx="${x+shift+3}" cy="${pupilY-3}" r="2.5" fill="white"/></g>`;
  }).join("");
}

function mouthMarkup(dna, hurt = 0) {
  if (hurt > 72) return `<path d="M158 246q37-30 76 0" fill="none" stroke="#281b32" stroke-width="13" stroke-linecap="round"/><path d="m176 235 11 14 12-16" fill="none" stroke="#fff" stroke-width="7"/>`;
  const map = {
    smirk: `<path d="M151 237q39 29 83-5" fill="none" stroke="#281b32" stroke-width="13" stroke-linecap="round"/>`,
    frown: `<path d="M155 250q37-31 76 0" fill="none" stroke="#281b32" stroke-width="13" stroke-linecap="round"/>`,
    grin: `<path d="M149 232q43 50 88-2-45 24-88 2Z" fill="#281b32"/><path d="M164 237h57" stroke="#fff" stroke-width="9"/>`,
    o: `<ellipse cx="195" cy="242" rx="22" ry="28" fill="#281b32"/>`
  };
  return map[dna.mouth] || map.smirk;
}

export function monsterSVG(dna, hurt = 0, compact = false) {
  const bandage = dna.accessory === "bandage" ? `<g transform="translate(221 115) rotate(19)"><rect width="54" height="20" rx="8" fill="#f2d5b5"/><circle cx="27" cy="10" r="5" fill="#c59e7a"/></g>` : "";
  const crown = dna.accessory === "crown" ? `<path d="m152 79 13-40 28 28 26-31 21 44Z" fill="#ffdb55" stroke="#3a2448" stroke-width="6"/>` : "";
  const medal = dna.accessory === "medal" ? `<g><path d="m179 276 15 25 17-25" fill="none" stroke="#f4d77a" stroke-width="8"/><circle cx="195" cy="306" r="17" fill="#ffce45" stroke="#a16c18" stroke-width="5"/></g>` : "";
  const tie = dna.accessory === "tie" ? `<path d="m185 260 20 0 9 20-20 39-19-39Z" fill="#271b35" opacity=".82"/>` : "";
  const horns = dna.horns ? `<path d="m119 100-25-56q45 15 56 51m118 9 27-56q-46 14-58 50" fill="${dna.secondaryColor}" stroke="#2b1d38" stroke-width="7" stroke-linejoin="round"/>` : "";
  const arms = dna.arms ? `<path d="M89 208Q36 195 35 244m274-36q52-19 57 30" fill="none" stroke="${dna.primaryColor}" stroke-width="25" stroke-linecap="round"/><circle cx="35" cy="247" r="15" fill="${dna.secondaryColor}"/><circle cx="366" cy="240" r="15" fill="${dna.secondaryColor}"/>` : "";
  const legs = dna.legs ? `<path d="M150 320q-3 35-27 45m121-45q5 35 28 45" fill="none" stroke="${dna.secondaryColor}" stroke-width="25" stroke-linecap="round"/>` : "";
  const tentacles = dna.tentacles ? `<path d="M103 291q-72 19-35 68t-35 16m263-82q72 20 34 67t36 15" fill="none" stroke="${dna.primaryColor}" stroke-width="13" stroke-linecap="round"/>` : "";
  const texture = dna.texture === "spots" ? `<circle cx="117" cy="225" r="17" fill="${dna.secondaryColor}" opacity=".36"/><circle cx="267" cy="256" r="25" fill="${dna.secondaryColor}" opacity=".28"/>` : dna.texture === "stripes" ? `<path d="M112 118q83 37 159 0M91 160q103 42 210 2" fill="none" stroke="${dna.secondaryColor}" stroke-width="13" opacity=".25"/>` : "";
  const shine = dna.texture !== "plain" ? `<path d="M112 137q12-34 46-45" fill="none" stroke="white" stroke-width="15" stroke-linecap="round" opacity=".25"/>` : "";
  return `<svg class="monster-svg" viewBox="0 0 400 400" role="img" aria-label="${escapeXML(dna.name)}">
    <defs><linearGradient id="g-${dna.id}" x1=".2" y1=".1" x2=".8" y2=".9"><stop stop-color="${dna.primaryColor}"/><stop offset="1" stop-color="${dna.secondaryColor}"/></linearGradient></defs>
    <g class="monster-core">${horns}${tentacles}${arms}${legs}<path class="monster-body" d="${bodyPath(dna.bodyShape)}" fill="url(#g-${dna.id})" stroke="#2a1d35" stroke-width="7" stroke-linejoin="round"/>${texture}${shine}${eyeMarkup(dna,hurt)}${mouthMarkup(dna,hurt)}${bandage}${crown}${medal}${tie}</g>
  </svg>`;
}

class SoundEngine {
  constructor() { this.context = null; this.enabled = true; }
  init() { if (!this.context) this.context = new (window.AudioContext || window.webkitAudioContext)(); if (this.context.state === "suspended") this.context.resume(); }
  tone(type = "hit", power = .5) {
    if (!this.enabled) return; this.init();
    const ctx = this.context, now = ctx.currentTime;
    const osc = ctx.createOscillator(), gain = ctx.createGain(), filter = ctx.createBiquadFilter();
    const configs = { hit:[150,70,"square",.09], slap:[230,60,"sawtooth",.13], heavy:[95,32,"sawtooth",.26], pop:[390,110,"sine",.18], charge:[80,240,"triangle",.35] };
    const [from,to,wave,duration] = configs[type] || configs.hit;
    osc.type = wave; osc.frequency.setValueAtTime(from + power*70, now); osc.frequency.exponentialRampToValueAtTime(Math.max(22,to), now+duration);
    filter.type = "lowpass"; filter.frequency.value = type === "slap" ? 1200 : 700;
    gain.gain.setValueAtTime(.0001, now); gain.gain.exponentialRampToValueAtTime(.08 + power*.12, now+.008); gain.gain.exponentialRampToValueAtTime(.0001, now+duration);
    osc.connect(filter).connect(gain).connect(ctx.destination); osc.start(now); osc.stop(now+duration+.03);
    if (navigator.vibrate) navigator.vibrate(type === "heavy" ? [22,18,28] : Math.round(7+power*9));
  }
}
const sounds = new SoundEngine();

function layoutFor(count, index) {
  if (count === 1) return { x: 0, y: 28, s: 1 };
  if (count === 2) return [{x:-92,y:50,s:.76},{x:92,y:25,s:.82}][index];
  return [{x:-118,y:72,s:.66},{x:0,y:7,s:.73},{x:118,y:68,s:.64}][index];
}

async function startBattle(text) {
  if (hasImmediateSafetyRisk(text)) { showView("safetyView"); return; }
  const records = await getAllMonsters();
  const familiarity = Object.fromEntries(records.map(r => [r.category, r.appearances]));
  state.monsters = generateMonsters(text, state.mode, familiarity).map((dna,index) => ({ dna, vitality: 100, state: "嚣张", defeated: false, x: 0, y: 0, rot: 0, index }));
  state.activeIndex = 0; state.combo = 0;
  for (const monster of state.monsters) await saveEncounter(monster.dna, text, state.saveRaw);
  renderBattle(); showView("battleView");
  setTimeout(() => speak(activeMonster().dna.idleLines[0]), 720);
}

function renderBattle() {
  const arena = $("#arena"); arena.innerHTML = "";
  state.monsters.forEach((monster,index) => {
    const pos = layoutFor(state.monsters.length,index);
    monster.x = pos.x; monster.y = pos.y;
    const wrap = document.createElement("div");
    wrap.className = `monster-wrap idle entering ${index === 0 ? "target" : ""}`;
    wrap.dataset.index = index; wrap.style.cssText = `--x:${pos.x}px;--y:${pos.y}px;--sx:${pos.s};--sy:${pos.s};--monster-color:${monster.dna.primaryColor}`;
    wrap.innerHTML = monsterSVG(monster.dna);
    arena.appendChild(wrap); attachGestures(wrap,index);
    setTimeout(() => wrap.classList.remove("entering"), 800);
  });
  renderRoster(); $("#battleEnd").classList.remove("show");
}

function renderRoster() {
  $("#roster").innerHTML = state.monsters.map((m,i) => `<button data-target="${i}" class="${i===state.activeIndex?"active":""}" ${m.defeated?"disabled":""}><i class="state-pip"></i><strong>${escapeXML(m.dna.name)}</strong><small>${m.defeated?"已闭嘴":m.state}</small></button>`).join("");
}

function activeMonster() { return state.monsters[state.activeIndex]; }
function activeElement() { return $(`.monster-wrap[data-index="${state.activeIndex}"]`); }

function selectMonster(index) {
  if (state.monsters[index]?.defeated) return;
  state.activeIndex = index;
  $$(".monster-wrap").forEach((el,i) => el.classList.toggle("target",i===index));
  renderRoster(); speak(activeMonster().dna.idleLines[Math.floor(Math.random()*activeMonster().dna.idleLines.length)]);
}

function speak(line, duration = 1600) {
  const bubble = $("#speechBubble"); bubble.textContent = line; bubble.classList.add("show");
  clearTimeout(state.speechTimer); state.speechTimer = setTimeout(() => bubble.classList.remove("show"),duration);
}

function randomLine(list) { return list[Math.floor(Math.random()*list.length)]; }

function createImpact(x,y,power,type) {
  const arena = $("#arena"), colors = ["#dfff52","#ff625a","#61e5df","#fff"];
  const amount = Math.min(15, 6 + Math.round(power*8));
  for (let i=0;i<amount;i++) {
    const p = document.createElement("i"); p.className="particle";
    const angle = Math.random()*Math.PI*2, dist = 45+Math.random()*85*power;
    p.style.cssText=`--px:${x}px;--py:${y}px;--dx:${Math.cos(angle)*dist}px;--dy:${Math.sin(angle)*dist}px;--pc:${colors[i%colors.length]}`;
    arena.appendChild(p); setTimeout(()=>p.remove(),650);
  }
  const word=document.createElement("b"); word.className="impact-word"; word.textContent=type==="heavy"?"砰！":type==="slap"?"啪！":"啵！";
  word.style.cssText=`--px:${x-25}px;--py:${y-20}px;--wr:${-15+Math.random()*30}deg`; arena.appendChild(word); setTimeout(()=>word.remove(),620);
}

function updateMonsterState(monster) {
  monster.state = monster.vitality > 72 ? "嚣张" : monster.vitality > 43 ? "开始慌" : monster.vitality > 15 ? "怂了" : "崩溃";
}

function hitMonster(index, power, type, point, vector={x:0,y:0}) {
  const monster=state.monsters[index]; if (!monster || monster.defeated) return;
  selectMonster(index); const el=activeElement();
  const damage = type==="heavy" ? 34+power*15 : type==="slap" ? 17+power*16 : 8+power*6;
  monster.vitality = Math.max(0,monster.vitality-damage); updateMonsterState(monster);
  state.combo++; $("#comboCount").textContent=state.combo; $(".combo-wrap").classList.add("active");
  clearTimeout(state.comboTimer); state.comboTimer=setTimeout(()=>{state.combo=0;$(".combo-wrap").classList.remove("active")},1050);
  el.classList.remove("hit","heavy","hurt"); void el.offsetWidth; el.classList.add(type==="heavy"?"heavy":"hit","hurt");
  if (type==="slap" || type==="heavy") {
    monster.x += Math.max(-150,Math.min(150,vector.x*(type==="heavy"?1.3:.7)));
    monster.y += Math.max(-100,Math.min(100,vector.y*.5)); monster.rot += Math.max(-24,Math.min(24,vector.x*.12));
    el.style.setProperty("--x",`${monster.x}px`); el.style.setProperty("--y",`${monster.y}px`); el.style.setProperty("--rot",`${monster.rot}deg`);
    setTimeout(()=>{if(!monster.defeated){ const home=layoutFor(state.monsters.length,index); monster.x=home.x;monster.y=home.y;monster.rot=0;el.style.transition="transform .55s cubic-bezier(.18,1.5,.35,1)"; el.style.setProperty("--x",`${home.x}px`);el.style.setProperty("--y",`${home.y}px`);el.style.setProperty("--rot","0deg");setTimeout(()=>el.style.transition="",570);}},330);
  }
  createImpact(point.x,point.y,power,type); sounds.tone(type,power);
  if (type==="heavy") { $("#battleView").classList.add("screen-shake"); setTimeout(()=>$("#battleView").classList.remove("screen-shake"),240); }
  const lines = monster.vitality>65?monster.dna.lightHitLines:monster.vitality>25?monster.dna.mediumHitLines:monster.dna.heavyHitLines;
  speak(randomLine(lines)); renderRoster();
  setTimeout(()=>el.classList.remove("hit","heavy","hurt"),560);
  if (monster.vitality<=0) setTimeout(()=>defeatMonster(index),260);
}

async function defeatMonster(index) {
  const monster=state.monsters[index]; if(monster.defeated)return; monster.defeated=true; monster.state="认输";
  const el=$(`.monster-wrap[data-index="${index}"]`); speak(randomLine(monster.dna.surrenderLines),900); sounds.tone("pop",1);
  setTimeout(()=>{speak(randomLine(monster.dna.escapeLines),900);el.classList.add("ko");},650);
  await markDefeated(monster.dna.category); renderRoster();
  const next=state.monsters.findIndex(m=>!m.defeated); if(next>=0)setTimeout(()=>selectMonster(next),1150);
  else setTimeout(showBattleEnd,1700);
}

function showBattleEnd() {
  $("#endEyebrow").textContent=state.combo>=10?`${state.combo} 连击 · 全场安静`:"全场安静";
  $("#endTitle").textContent=Math.random()>.5?"清净了。":"这只今天先闭嘴。";
  $("#battleEnd").classList.add("show"); sounds.tone("pop",.7);
}

function attachGestures(el,index) {
  let start=null,last=null,charging=false,chargeTimer=null,pointerId=null;
  el.addEventListener("pointerdown",e=>{
    if(state.monsters[index].defeated)return; selectMonster(index); pointerId=e.pointerId; el.setPointerCapture(pointerId);
    start=last={x:e.clientX,y:e.clientY,t:performance.now()};
    chargeTimer=setTimeout(()=>{charging=true;el.classList.add("charging");sounds.tone("charge",.4);},480);
  });
  el.addEventListener("pointermove",e=>{
    if(!start||e.pointerId!==pointerId)return; const now={x:e.clientX,y:e.clientY,t:performance.now()};
    const total=Math.hypot(now.x-start.x,now.y-start.y);
    if(total>12&&!charging){clearTimeout(chargeTimer);el.classList.add("dragging");const m=state.monsters[index];el.style.setProperty("--x",`${m.x+now.x-start.x}px`);el.style.setProperty("--y",`${m.y+now.y-start.y}px`);el.style.setProperty("--sx",`${.88+Math.min(total,160)/500}`);el.style.setProperty("--sy",`${1.12-Math.min(total,160)/600}`);}
    last=now;
  });
  const end=e=>{
    if(!start||e.pointerId!==pointerId)return; clearTimeout(chargeTimer); const now={x:e.clientX,y:e.clientY,t:performance.now()};
    const dx=now.x-start.x,dy=now.y-start.y,distance=Math.hypot(dx,dy),duration=now.t-start.t;
    const recentDt=Math.max(16,now.t-(last?.t||start.t)),vx=(now.x-(last?.x||start.x))/recentDt*16,vy=(now.y-(last?.y||start.y))/recentDt*16;
    el.classList.remove("dragging","charging");const m=state.monsters[index],home=layoutFor(state.monsters.length,index);m.x=home.x;m.y=home.y;m.rot=0;el.style.setProperty("--sx",home.s);el.style.setProperty("--sy",home.s);
    if(charging){const p=Math.min(1,(duration-480)/900+.45);hitMonster(index,p,"heavy",{x:now.x,y:now.y},{x:dx*.5,y:dy*.5});}
    else if(distance<14&&duration<390)hitMonster(index,Math.min(1,.35+state.combo*.035),"hit",{x:now.x,y:now.y});
    else {const speed=Math.hypot(vx,vy),p=Math.min(1,.35+distance/260+speed/35);hitMonster(index,p,"slap",{x:now.x,y:now.y},{x:dx+vx*4,y:dy+vy*4});}
    start=last=null;charging=false;pointerId=null;
  };
  el.addEventListener("pointerup",end); el.addEventListener("pointercancel",e=>{clearTimeout(chargeTimer);el.classList.remove("dragging","charging");start=null;charging=false;pointerId=null;});
}

async function renderDex() {
  const records=await getAllMonsters(), list=$("#dexList");
  $("#dexEmpty").classList.toggle("show",!records.length); list.innerHTML=records.map(record=>{
    const dna=record.dna,status=record.defeats>=4?"见到你就发抖":record.defeats?"看到你已经有点怂":"还在嘴硬";
    return `<article class="dex-item"><div class="dex-avatar">${monsterSVG(dna,record.defeats?55:0,true)}</div><div class="dex-copy"><h3>${escapeXML(dna.name)}</h3><p>${escapeXML(dna.represents)}</p><div class="dex-meta"><span>出现 ${record.appearances} 次</span><span>被揍飞 ${record.defeats||0} 次</span><span class="dex-status">${status}</span></div></div></article>`;
  }).join("");
}

function registerWebMCP() {
  const context=document.modelContext; if(!context?.registerTool)return;
  const controller=new AbortController();
  Promise.resolve(context.registerTool({
    name:"release_emotion_monsters",title:"放出情绪小怪兽",description:"根据一段中文情绪或人际事件描述，在页面中本地生成虚构怪物并进入战斗。不会上传内容。",
    inputSchema:{type:"object",properties:{text:{type:"string",minLength:2,maxLength:280},mode:{type:"string",enum:["emotion","person"]}},required:["text","mode"],additionalProperties:false},
    annotations:{readOnlyHint:false,untrustedContentHint:true},
    async execute(input){if(!input||typeof input.text!=="string"||input.text.trim().length<2||!["emotion","person"].includes(input.mode))throw new Error("请输入 2–280 字，并选择 emotion 或 person 模式");state.mode=input.mode;await startBattle(input.text.trim().slice(0,280));return{status:"battle_started",monsterNames:state.monsters.map(m=>m.dna.name),count:state.monsters.length};}
  },{signal:controller.signal})).catch(()=>{});
}

function bindEvents() {
  $$(".mode-card").forEach(btn=>btn.addEventListener("click",()=>setupMode(btn.dataset.mode)));
  $("#ventInput").addEventListener("input",updateInput);
  $("#exampleChips").addEventListener("click",e=>{if(e.target.tagName!=="BUTTON")return;$("#ventInput").value=e.target.textContent;updateInput();$("#ventInput").focus();});
  $("#releaseBtn").addEventListener("click",()=>startBattle($("#ventInput").value.trim()));
  $$("[data-back='home'],#homeBtn,#endHomeBtn,#safetyHomeBtn").forEach(btn=>btn.addEventListener("click",()=>showView("homeView")));
  $("#dexBtn").addEventListener("click",()=>showView("dexView"));
  $("#roster").addEventListener("click",e=>{const btn=e.target.closest("button[data-target]");if(btn)selectMonster(+btn.dataset.target);});
  $("#againBtn").addEventListener("click",()=>setupMode(state.mode));
  $("#soundBtn").addEventListener("click",()=>{state.sound=!state.sound;sounds.enabled=state.sound;$("#soundBtn").textContent=state.sound?"◖))":"静音";$("#soundBtn").setAttribute("aria-pressed",String(!state.sound));setSetting("sound",state.sound);if(state.sound)sounds.tone("pop",.4);});
  $("#saveRawToggle").addEventListener("change",e=>{state.saveRaw=e.target.checked;setSetting("saveRaw",state.saveRaw);toast(state.saveRaw?"今后会保留原始输入":"今后不再保留原始输入");});
  $("#clearDataBtn").addEventListener("click",()=>$("#confirmDialog").showModal());
  $("#confirmClearBtn").addEventListener("click",async()=>{await clearAllData();state.saveRaw=false;$("#saveRawToggle").checked=false;setTimeout(()=>{renderDex();toast("本地数据已清空")},80);});
  $("#installBtn").addEventListener("click",async()=>{if(state.deferredInstall){state.deferredInstall.prompt();await state.deferredInstall.userChoice;state.deferredInstall=null;$("#installBtn").classList.add("hidden");}else toast("在 Safari 分享菜单中选择“添加到主屏幕”");});
  window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();state.deferredInstall=e;$("#installBtn").classList.remove("hidden");});
}

async function init() {
  state.sound=await getSetting("sound",true);state.saveRaw=await getSetting("saveRaw",false);sounds.enabled=state.sound;
  $("#saveRawToggle").checked=state.saveRaw;$("#soundBtn").textContent=state.sound?"◖))":"静音";
  bindEvents(); registerWebMCP();
  if("serviceWorker" in navigator) navigator.serviceWorker.register("./sw.js").catch(()=>{});
  const standalone=window.matchMedia("(display-mode: standalone)").matches||navigator.standalone;
  if(!standalone && /iPhone|iPad|iPod/.test(navigator.userAgent))$("#installBtn").classList.remove("hidden");
}
init();
