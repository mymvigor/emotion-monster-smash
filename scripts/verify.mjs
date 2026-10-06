import fs from "node:fs";
import { analyzeText, generateMonsters, hasImmediateSafetyRisk, understand } from "../dist/monster-brain-v3.js";

const required = ["index.html","styles-v2.css","app-v2.js","monster-brain-v3.js","audio-manager.js","pixel-fx.js","db.js","sw.js","manifest.webmanifest","icons/icon.svg","icons/icon-192.png","icons/icon-512.png","icons/apple-touch-icon.png"];
for (const file of required) {
  if (!fs.existsSync(new URL(`../dist/${file}`, import.meta.url))) throw new Error(`Missing ${file}`);
}
const manifest = JSON.parse(fs.readFileSync(new URL("../dist/manifest.webmanifest", import.meta.url),"utf8"));
if (manifest.display !== "standalone" || !manifest.icons?.length) throw new Error("Invalid PWA manifest");
const cases = [
  ["有个同事很能装", "person", "performative"],
  ["这个人特别虚伪", "person", "hypocrisy"],
  ["他特别喜欢抢功", "person", "credit"],
  ["他说话一直阴阳怪气", "person", "passive"],
  ["我特别怕别人超过我", "emotion", "comparison"],
  ["我感觉自己越来越没价值", "emotion", "insecurity"],
  ["今天就是莫名其妙很烦", "emotion", "irritation"],
  ["领导找别人没找我，我很不舒服", "emotion", "exclusion"]
];
for (const [text, mode, expected] of cases) {
  const profile = understand(text, mode);
  if (!profile.concepts.includes(expected)) throw new Error(`UNDERSTAND missed ${expected}: ${text}`);
  const analysis = analyzeText(text, mode);
  if (!analysis.some(item => item.category === expected)) throw new Error(`Brain missed ${expected}: ${text}`);
  const monsters = generateMonsters(text, mode);
  if (!monsters.length || monsters.length > 3) throw new Error(`Invalid monster count: ${text}`);
  const requiredDNA = ["id","category","sourceType","semanticProfile","semanticAnchor","represents","name","rarity","maxHp","blueprint","visualTraits","visualExplanation","eyes","mouth","movementStyle","personality","idleLines","panicLines","lowHpLines","defeatedLines","endingStyle"];
  for (const key of requiredDNA) if (monsters[0][key] == null) throw new Error(`Missing DNA field ${key}`);
  if (!monsters[0].category.includes(expected)) throw new Error(`CREATE lost ${expected}: ${text}`);
  if (monsters[0].visualTraits.length < 3 || !monsters[0].visualExplanation.includes(profile.coreBehavior.slice(0,2))) throw new Error(`Semantic visual check failed: ${text}`);
}
if (!hasImmediateSafetyRisk("我现在准备自杀")) throw new Error("Safety risk missed");
if (hasImmediateSafetyRisk("我不会自杀，只是很生气")) throw new Error("Safety false positive");
const boss = generateMonsters("最近我感觉工作、别人、未来全部都压着我", "emotion");
if (boss.length !== 1 || boss[0].rarity !== "BOSS" || boss[0].maxHp < 300) throw new Error("Boss generation failed");
const hybrid = generateMonsters("那个阴阳怪气又爱抢功的人今天又把我恶心到了", "person");
if (!hybrid.some(m => m.category.includes("+") && m.visualTraits.length >= 3)) throw new Error("Hybrid visual DNA failed");
if (hybrid.some(m => m.maxHp < 90 || !["COMMON","UNCOMMON","RARE","BOSS"].includes(m.rarity))) throw new Error("Rarity or HP invalid");
const variants = Array.from({length:5},()=>generateMonsters("有个同事很能装","person")[0]);
const silhouettes = new Set(variants.map(m=>JSON.stringify([m.blueprint.coreShape,m.blueprint.coreCount,m.blueprint.width,m.blueprint.height,m.blueprint.symmetry,m.blueprint.headCount,m.blueprint.limbs,m.blueprint.locomotion])));
if (silhouettes.size < 2 || variants.some(m=>!m.category.includes("performative"))) throw new Error("Creative diversity or semantic consistency failed");
const audioFiles = fs.readdirSync(new URL("../dist/assets/audio", import.meta.url), {recursive:true}).filter(file=>file.endsWith(".wav"));
if (audioFiles.length !== 46) throw new Error(`Expected 46 local audio files, got ${audioFiles.length}`);
const sw = fs.readFileSync(new URL("../dist/sw.js", import.meta.url),"utf8");
if (!sw.includes("monster-smash-v3") || !sw.includes("assets/audio") || !sw.includes("monster-brain-v3.js")) throw new Error("V3 offline cache is incomplete");
const html = fs.readFileSync(new URL("../dist/index.html", import.meta.url),"utf8");
for (const forbidden of ["IndexedDB","GitHub Pages","零成本运行","本地运行"]) if (html.includes(forbidden)) throw new Error(`Homepage contains technical copy: ${forbidden}`);
console.log("Verified: 8 Chinese semantic cases, diverse Pixel DNA, 46 local audio files, offline cache, Boss, safety gate");
