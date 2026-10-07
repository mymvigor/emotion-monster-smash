import fs from"node:fs";
import{createLocalEncounter}from"../dist/v4/local-director.js";
import{CombatEngine,phaseFor}from"../dist/v4/combat-engine.js";
import{damageProp}from"../dist/v4/arena-generator.js";
import{findLibraryMatch,crossoverAssets}from"../dist/v4/monster-library.js";
import{aiAssetFromPayload,buildManualPrompt,validateAIDirectorDNA}from"../dist/v4/ai-director-adapter.js";

const fail=message=>{throw Error(message)},assert=(value,message)=>{if(!value)fail(message)};
const inputs=[
  ["有个同事很能装，领导一来就抢功","person"],["这个人当面一套背后一套","person"],["他说话总是阴阳怪气","person"],
  ["我特别怕别人超过我","emotion"],["感觉自己越来越没价值","emotion"],["领导找别人没找我，我很不舒服","emotion"],
  ["脑子一直瞎想，完全停不下来","emotion"],["他总爱越界控制我","person"],["今天莫名其妙很烦","emotion"],["最近总担心会出事","emotion"]
];
const variants=[];
for(let i=0;i<10;i++)variants.push(createLocalEncounter("有个同事很能装，领导一来就抢功","person",{seed:1000+i,recent:variants.map(x=>({novelty:x.novelty,mutations:x.mutationDNA.map(m=>m.id)}))}));
assert(new Set(variants.map(x=>x.novelty.silhouette)).size>=7,"10 variants lack silhouette novelty");
assert(new Set(variants.map(x=>x.novelty.arena)).size>=4,"10 variants lack arena novelty");
for(const encounter of variants){assert(encounter.semanticDNA.concepts.includes("performative")&&encounter.semanticDNA.concepts.includes("credit"),"variant lost semantic core");assert(encounter.symbolicArmorDNA.length>=1&&encounter.symbolicArmorDNA.length<=3,"armor count invalid")}
let totalAttacks=0,releaseChecks=0;
for(let i=0;i<500;i++){
  const [text,mode]=inputs[i%inputs.length],enc=createLocalEncounter(text,mode,{seed:7000+i,recent:[]}),clock={value:0},combat=new CombatEngine(enc,{now:()=>clock.value});
  assert(enc.version===4&&enc.arenaDNA.props.length>=3,"EncounterDNA incomplete");
  let guard=0;while(combat.mode==="battle"&&guard++<80){clock.value+=130;const event=combat.attack(["punch","slap","uppercut","smash","heavy"][guard%5],{charge:guard%5===0?1:.4,wall:guard%4===0,arenaChanged:guard%6===0});totalAttacks++;if(event.phaseChanged)assert(["CRACKED","BREAKDOWN"].includes(event.phase),"illegal phase transition")}
  assert(combat.mode==="release"&&combat.hp===0,"HP0 did not enter release");assert(combat.armor.some(x=>x.state==="broken"),"phase armor never broke");
  for(let j=0;j<9&&!combat.fullRelease;j++){clock.value+=170;combat.attack(["slap","uppercut","smash","heavy","weapon"][j%5],{charge:1,wall:j%2===0,arenaChanged:true,propType:j===4?"trophy":"crate"})}
  clock.value+=8100;assert(combat.tick().canFinish,"release did not unlock player finisher");assert(combat.finish(),"player finisher rejected");releaseChecks++;combat.destroy();
}
assert(phaseFor(.8)==="DEFIANT"&&phaseFor(.5)==="CRACKED"&&phaseFor(.1)==="BREAKDOWN","phase thresholds invalid");
let prop={id:"p",type:"chair",state:"normal",damage:0};prop=damageProp(prop);assert(prop.state==="damaged","prop damage state 1 invalid");prop=damageProp(prop);assert(prop.state==="broken","prop damage state 2 invalid");prop=damageProp(prop);assert(prop.state==="destroyed","prop damage state 3 invalid");
const payload={semanticCore:["抢功","表演"],semanticAliases:["邀功"],triggerConcepts:["credit","performative"],monsterName:"聚光奖牌盗兽",monsterConcept:"抢走成果并站到灯下",personality:"夸张自得",visualMetaphor:"会吸附奖牌的聚光台",visualTraits:["spotlight","medals","stickyHands"],symbolicArmor:["领导的注视","冒领的奖牌"],arenaConcept:"stage",combatPersonality:["绕场炫耀","护住奖牌"],storyBeats:["奖牌碎裂"],introLines:["灯光归我。"],defiantLines:["功劳本来就该发光。"],crackedLines:["这只是舞台事故。"],breakdownLines:["别拿走灯。"],koLines:["……安静了。"],finisherFlavor:"熄灯",reusableElements:["奖牌","聚光灯"]};
assert(validateAIDirectorDNA(payload).ok,"valid AI DNA rejected");assert(!validateAIDirectorDNA({}).ok,"invalid AI DNA accepted");assert(buildManualPrompt("测试","person").includes("只返回一个 JSON 对象"),"manual bridge prompt incomplete");
const profile={source:"同事爱抢功还很会装",concepts:["credit","performative"],keyPhrase:"抢功",coreBehavior:"冒领成果",coreEmotion:"愤怒"},a=aiAssetFromPayload(payload,profile),b=aiAssetFromPayload({...payload,monsterName:"舞台摘桃机",visualTraits:["podium","trophy","screen"]},profile),match=findLibraryMatch(profile,[a,b]);assert(match.best,"AI library failed semantic match");const cross=crossoverAssets(a,b,profile,{seed:22,recent:[]});assert(cross?.sourceAssetIds.length===2&&cross.origin==="ai-crossover","AI crossover failed");
const app=fs.readFileSync(new URL("../dist/app-v4.js",import.meta.url),"utf8"),sw=fs.readFileSync(new URL("../dist/sw.js",import.meta.url),"utf8");assert(!/fetch\([^)]*(openai|chatgpt)/i.test(app),"offline app contains AI network call");assert(sw.includes("v4/combat-engine.js")&&sw.includes("v4/ai-director-adapter.js"),"offline V4 modules missing");
console.log(`V4 verified: 500 encounters, ${totalAttacks} attacks, ${releaseChecks} releases, 10-variant novelty, AI library/match/crossover, phases, props, offline network guard`);
