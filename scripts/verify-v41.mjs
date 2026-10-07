import fs from "node:fs";
import { createLocalEncounter } from "../dist/v4/local-director.js";
import { EncounterDirector, DirectorError } from "../dist/v4/encounter-director.js";
import { MONSTER_REACTIONS, WEAPONS, selectToybox, weaponSVG } from "../dist/v4/weapon-director.js";
import { ATTRACT_EVENTS } from "../dist/v4/attract-mode.js";
import { propSignature } from "../dist/v4/arena-generator.js";
import { sanitizeAIDNA, validateAIDirectorDNA } from "../dist/v4/ai-director-adapter.js";

const assert=(value,message)=>{if(!value)throw Error(message)};
const personCases=["这个同事很能装。","平时什么都不干，领导来了突然特别积极。","老是阴阳怪气。","喜欢抢功劳。","总喜欢控制别人。"];
const encounters=personCases.map((text,index)=>createLocalEncounter(text,"person",{seed:4100+index,recent:[]}));
for(const [index,encounter] of encounters.entries()){
  assert(encounter.semanticDNA.mode==="person",`person mode lost for case ${index+1}`);
  assert(encounter.monsterDNA.name&&encounter.dialogueDNA.intro.length,`person encounter incomplete for case ${index+1}`);
  assert(encounter.symbolicArmorDNA.length>=1&&encounter.arenaDNA.props.length>=3,`person scene incomplete for case ${index+1}`);
}

const weapons=Object.values(WEAPONS);
assert(weapons.length===8,"Toybox must contain exactly eight weapon families");
for(const field of ["input","motion","impact","sound","reaction","interaction"])assert(new Set(weapons.map(w=>w[field])).size===8,`weapon ${field} is not unique`);
assert(new Set(weapons.map(w=>weaponSVG(w.id))).size===8,"weapon SVG silhouettes are not unique");
assert(MONSTER_REACTIONS.length===17&&new Set(MONSTER_REACTIONS).size===17,"monster reaction library is incomplete");
const toyEncounter=encounters[0],first=selectToybox(toyEncounter,[],4),second=selectToybox(toyEncounter,first.map(w=>w.id),4);
assert(first.length===4&&second.length===4,"Toybox selection count invalid");
assert(second.filter(w=>first.some(a=>a.id===w.id)).length<4,"recent weapon penalty did not refresh selection");

assert(ATTRACT_EVENTS.length>=10&&ATTRACT_EVENTS.length<=15,"attract event count must be 10–15");
assert(new Set(ATTRACT_EVENTS.map(x=>x.id)).size===ATTRACT_EVENTS.length,"attract event ids repeat");
assert(ATTRACT_EVENTS.every(x=>x.template&&x.visibleChange&&x.duration>=1500),"attract event lacks visible behavior");
const props=["desk","chair","spotlight","trophy","screen","bin","pipe","mirror","door","barrel"];
assert(new Set(props.map(propSignature)).size===props.length,"arena props do not have distinct SVG silhouettes");

const payload={semanticCore:["控制"],semanticAliases:["操控"],triggerConcepts:["control"],monsterName:"遥控王",monsterConcept:"把别人当按钮",personality:"霸道",visualMetaphor:"巨大遥控器",visualTraits:["buttons","antenna"],symbolicArmor:["命令外壳"],arenaConcept:"office",combatPersonality:["指挥"],storyBeats:["按钮脱落"],introLines:["听我的。"],defiantLines:["不许动。"],crackedLines:["只是失灵。"],breakdownLines:["回来！"],koLines:["失控了。"],finisherFlavor:"断电",reusableElements:["按钮"],preferredWeaponThemes:["magnet","hammer"],destructionTargets:["locker"],comicSetPieces:["vending-spit"]};
assert(validateAIDirectorDNA(payload).ok,"AI DNA with optional V4.1 fields rejected");
const safe=sanitizeAIDNA(payload);assert(safe.preferredWeaponThemes.length===2&&safe.comicSetPieces[0]==="vending-spit","AI weapon hints were not sanitized");

const assets=[];const storage={getRecentEncounters:async()=>[],getAIAssets:async()=>assets,putAIAsset:async asset=>{assets.push(asset);return asset},touchAIAsset:async()=>{}};
const director=new EncounterDirector(storage),offline=await director.create(personCases[0],"person","offline",{seed:99});
assert(offline.status==="ready"&&offline.encounter.origin!=="ai-new"&&offline.encounter.id,"offline director flow failed");
const ai=await director.create("从来没有见过的测试语义","person","ai",{seed:100});
assert(ai.status==="needs-ai"&&ai.code==="AI_REQUIRED"&&ai.prompt,"AI missing-library flow is not a normal bridge state");
const controlContext=await director.create("总喜欢控制别人。","person","ai",{seed:101}),manual=await director.importAI(JSON.stringify(payload),controlContext);
assert(manual.ok&&manual.encounter.origin==="ai-new"&&manual.encounter.toyboxDNA.preferredWeaponThemes.includes("magnet"),"manual AI import or weapon hints failed");
const reused=await director.create("总喜欢控制别人。","person","ai",{seed:102});assert(reused.status==="ready"&&reused.reused&&reused.encounter.origin==="ai-library","AI local-library reuse failed");
const broken=new EncounterDirector({...storage,getAIAssets:async()=>{throw Error("db")}});
let code="";try{await broken.create("测试","person","ai")}catch(error){assert(error instanceof DirectorError);code=error.code}assert(code==="AI_LIBRARY_ERROR","AI library failure was not classified");
const badImport=await director.importAI("not json",ai);assert(!badImport.ok&&badImport.code==="AI_IMPORT_ERROR","AI import failure was not classified");

const app=fs.readFileSync(new URL("../dist/app-v4.js",import.meta.url),"utf8");
assert(!app.includes("生成失败，已切回离线导演"),"legacy silent offline fallback remains");
assert(!/catch\([^)]*\)\s*\{[^}]*setDirectorMode\("offline"\)/s.test(app),"error handler changes director mode");
for(const codeName of ["AI_LIBRARY_ERROR","AI_IMPORT_ERROR","ENCOUNTER_RENDER_ERROR","STORAGE_ERROR","UNKNOWN_ERROR"])assert(app.includes(codeName),`missing ${codeName} message`);
console.log("V4.1 verified: 5 person cases, 8 unique weapons, 12 attract events, distinct arena props, AI/offline/error flows, no silent fallback");
