import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../dist");
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(path.join(dir,entry.name)):[path.join(dir,entry.name)]);
const bytes=files=>files.reduce((total,file)=>total+fs.statSync(file).size,0);
const coreNames=["index.html","styles-v4.css","styles-v2.css","app-v4.js","monster-brain-v3.js","audio-manager.js","pixel-fx.js","db.js","v4/utils.js","v4/local-director.js","v4/encounter-director.js","v4/combat-engine.js","v4/monster-renderer.js","manifest.webmanifest","icons/icon.svg","icons/icon-192.png","icons/icon-512.png","icons/apple-touch-icon.png","assets/audio/music/menu_01.wav","assets/audio/ui/ui_01.wav"];
const core=coreNames.map(name=>path.join(root,name));
for(const file of core)if(!fs.existsSync(file))throw Error(`Missing core resource: ${path.relative(root,file)}`);
const coreBytes=bytes(core),offlineBytes=bytes(walk(root)),MB=1024*1024;
if(coreBytes>=10*MB)throw Error(`First-screen core is ${(coreBytes/MB).toFixed(2)} MB (limit < 10 MB)`);
if(offlineBytes>=50*MB)throw Error(`Offline package is ${(offlineBytes/MB).toFixed(2)} MB (target < 50 MB; hard limit < 100 MB)`);
console.log(`Budget OK: first-screen core ${(coreBytes/MB).toFixed(2)} MB / 10 MB; full dist ${(offlineBytes/MB).toFixed(2)} MB / 50 MB target`);
