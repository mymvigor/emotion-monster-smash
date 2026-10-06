import fs from "node:fs";
import { analyzeText, generateMonsters, hasImmediateSafetyRisk } from "../dist/monster-brain.js";

const required = ["index.html","styles.css","app.js","monster-brain.js","db.js","sw.js","manifest.webmanifest","icons/icon.svg","icons/icon-192.png","icons/icon-512.png","icons/apple-touch-icon.png"];
for (const file of required) {
  if (!fs.existsSync(new URL(`../dist/${file}`, import.meta.url))) throw new Error(`Missing ${file}`);
}
const manifest = JSON.parse(fs.readFileSync(new URL("../dist/manifest.webmanifest", import.meta.url),"utf8"));
if (manifest.display !== "standalone" || !manifest.icons?.length) throw new Error("Invalid PWA manifest");
const cases = [
  ["我现在特别怕别人超过我", "emotion", "comparison"],
  ["同事阴阳怪气还抢功", "person", "passive_aggressive"],
  ["他总是双标还爱甩锅", "person", "hypocrisy"]
];
for (const [text, mode, expected] of cases) {
  const analysis = analyzeText(text, mode);
  if (!analysis.some(item => item.category === expected)) throw new Error(`Brain missed ${expected}: ${text}`);
  const monsters = generateMonsters(text, mode);
  if (!monsters.length || monsters.length > 3) throw new Error(`Invalid monster count: ${text}`);
  const requiredDNA = ["id","category","sourceType","represents","name","bodyShape","bodySquishiness","eyes","mouth","movementStyle","personality","idleLines","surrenderLines","endingStyle"];
  for (const key of requiredDNA) if (monsters[0][key] == null) throw new Error(`Missing DNA field ${key}`);
}
if (!hasImmediateSafetyRisk("我现在准备自杀")) throw new Error("Safety risk missed");
if (hasImmediateSafetyRisk("我不会自杀，只是很生气")) throw new Error("Safety false positive");
console.log("Verified: assets, manifest, local brain, DNA, safety gate");
