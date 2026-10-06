import fs from "node:fs";
import path from "node:path";

const RATE=11025;
function seeded(seed){let v=seed|0;return()=>{v=Math.imul(1664525,v)+1013904223|0;return(v>>>0)/4294967296}}
function wav(file,duration,synth){const n=Math.floor(RATE*duration),data=Buffer.alloc(n*2);for(let i=0;i<n;i++){const t=i/RATE,v=Math.max(-1,Math.min(1,synth(t,i,n)));data.writeInt16LE(Math.round(v*32767),i*2)}const out=Buffer.alloc(44+n*2);out.write("RIFF",0);out.writeUInt32LE(36+n*2,4);out.write("WAVEfmt ",8);out.writeUInt32LE(16,16);out.writeUInt16LE(1,20);out.writeUInt16LE(1,22);out.writeUInt32LE(RATE,24);out.writeUInt32LE(RATE*2,28);out.writeUInt16LE(2,32);out.writeUInt16LE(16,34);out.write("data",36);out.writeUInt32LE(n*2,40);data.copy(out,44);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,out)}
const sq=x=>Math.sin(x)>=0?1:-1,tri=x=>2/Math.PI*Math.asin(Math.sin(x)),env=(t,d,a=.01,r=.12)=>Math.min(1,t/a)*Math.min(1,(d-t)/r);
function music(name,seed,bpm,notes,bassNotes,seconds=8){const r=seeded(seed),beat=60/bpm;wav(name,seconds,(t)=>{const step=Math.floor(t/(beat/2))%notes.length,bt=Math.floor(t/beat)%bassNotes.length,phase=t%(beat/2),kickPhase=t%beat;const lead=notes[step]?sq(2*Math.PI*notes[step]*t)*.13*(1-phase/(beat/2)):.0,bass=tri(2*Math.PI*bassNotes[bt]*t)*.16,arp=sq(2*Math.PI*(notes[(step+3)%notes.length]||220)*2*t)*.035,noise=(r()*2-1)*.026*(kickPhase<.045?1:0),kick=Math.sin(2*Math.PI*(62-35*kickPhase/beat)*t)*.22*Math.max(0,1-kickPhase/.14);return(lead+bass+arp+noise+kick)*.72})}
function sfx(file,seed,type,variant=0){const r=seeded(seed+variant*97),dur={light:.14,heavy:.32,slap:.22,wall:.3,launch:.45,combo:.28,critical:.42,monster:.25,ui:.12,finish:.72,ambient:1.0}[type]||.2;wav(file,dur,(t)=>{const e=env(t,dur,.004,Math.min(.2,dur*.7)),noise=(r()*2-1);if(type==="light")return(noise*.34+sq(2*Math.PI*(150+variant*18)*t)*.2)*e;if(type==="heavy")return(noise*.35+Math.sin(2*Math.PI*(105-70*t/dur)*t)*.55)*e;if(type==="slap")return(noise*.42+sq(2*Math.PI*(290-160*t/dur)*t)*.18)*e;if(type==="wall")return(noise*.36+tri(2*Math.PI*(70-30*t/dur)*t)*.48)*e;if(type==="launch")return(sq(2*Math.PI*(110+600*t/dur)*t)*.2+noise*.16)*e;if(type==="combo")return(sq(2*Math.PI*(330+variant*45+180*t/dur)*t)*.2)*e;if(type==="critical")return(noise*.28+sq(2*Math.PI*(82-45*t/dur)*t)*.5)*e;if(type==="monster")return(tri(2*Math.PI*(145+variant*30-80*t/dur)*t)*.35+noise*.1)*e;if(type==="ui")return sq(2*Math.PI*(520+variant*100)*t)*.16*e;if(type==="finish")return(noise*.22+sq(2*Math.PI*(95+variant*35+420*t/dur)*t)*.32)*e;if(type==="ambient")return Math.sin(2*Math.PI*55*t)*.22*(t<.12?1:0)+Math.sin(2*Math.PI*48*t)*.18*(t>.48&&t<.62?1:0);return noise*.2*e})}
const root="dist/assets/audio";
music(`${root}/music/menu_01.wav`,11,112,[330,392,440,0,392,330,294,0],[82,82,98,73]);
music(`${root}/music/menu_02.wav`,12,104,[262,330,392,0,330,294,262,0],[65,78,73,65]);
music(`${root}/music/battle_01.wav`,21,148,[220,262,330,294,220,392,330,262],[55,65,73,49]);
music(`${root}/music/battle_02.wav`,22,156,[196,247,294,370,294,247,196,165],[49,55,62,41]);
music(`${root}/music/boss_01.wav`,31,172,[147,175,220,0,147,233,220,175],[36.7,43.7,49,36.7]);
music(`${root}/music/boss_02.wav`,32,180,[131,165,196,247,220,196,165,147],[32.7,41.2,36.7,49]);
music(`${root}/music/victory_01.wav`,41,128,[262,330,392,523,659,523,659,784],[65,82,98,131],4);
const groups={"ui":["ui",2],"hits":["light",5],"heavy_hits":["heavy",4],"slaps":["slap",4],"launch":["launch",3],"impact":["wall",3],"combo":["combo",3],"critical":["critical",3],"finishers":["finish",6],"monster":["monster",4],"ambient":["ambient",2]};
for(const[dir,[type,count]]of Object.entries(groups))for(let i=1;i<=count;i++)sfx(`${root}/${dir}/${type}_${String(i).padStart(2,"0")}.wav`,100+i*13,type,i);
console.log("Generated local chiptune and SFX library");
