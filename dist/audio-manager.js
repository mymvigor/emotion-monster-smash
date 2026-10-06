const A="./assets/audio";
const LIB={
  menu:[`${A}/music/menu_01.wav`,`${A}/music/menu_02.wav`],
  battle:[`${A}/music/battle_01.wav`,`${A}/music/battle_02.wav`],
  boss:[`${A}/music/boss_01.wav`,`${A}/music/boss_02.wav`],
  victory:[`${A}/music/victory_01.wav`],
  ui:[`${A}/ui/ui_01.wav`,`${A}/ui/ui_02.wav`],
  punch:Array.from({length:5},(_,i)=>`${A}/hits/light_${String(i+1).padStart(2,"0")}.wav`),
  heavy:Array.from({length:4},(_,i)=>`${A}/heavy_hits/heavy_${String(i+1).padStart(2,"0")}.wav`),
  slap:Array.from({length:4},(_,i)=>`${A}/slaps/slap_${String(i+1).padStart(2,"0")}.wav`),
  uppercut:Array.from({length:3},(_,i)=>`${A}/launch/launch_${String(i+1).padStart(2,"0")}.wav`),
  smash:Array.from({length:4},(_,i)=>`${A}/heavy_hits/heavy_${String(i+1).padStart(2,"0")}.wav`),
  slam:Array.from({length:3},(_,i)=>`${A}/impact/wall_${String(i+1).padStart(2,"0")}.wav`),
  spin:Array.from({length:3},(_,i)=>`${A}/launch/launch_${String(i+1).padStart(2,"0")}.wav`),
  wall:Array.from({length:3},(_,i)=>`${A}/impact/wall_${String(i+1).padStart(2,"0")}.wav`),
  rush:Array.from({length:3},(_,i)=>`${A}/combo/combo_${String(i+1).padStart(2,"0")}.wav`),
  combo:Array.from({length:3},(_,i)=>`${A}/combo/combo_${String(i+1).padStart(2,"0")}.wav`),
  critical:Array.from({length:3},(_,i)=>`${A}/critical/critical_${String(i+1).padStart(2,"0")}.wav`),
  ko:Array.from({length:3},(_,i)=>`${A}/critical/critical_${String(i+1).padStart(2,"0")}.wav`),
  monster:Array.from({length:4},(_,i)=>`${A}/monster/monster_${String(i+1).padStart(2,"0")}.wav`),
  finisher:Array.from({length:6},(_,i)=>`${A}/finishers/finish_${String(i+1).padStart(2,"0")}.wav`),
  heartbeat:[`${A}/ambient/ambient_01.wav`,`${A}/ambient/ambient_02.wav`]
};
const pick=list=>list[Math.floor(Math.random()*list.length)];

export class GameAudio{
  constructor(){this.ctx=null;this.master=null;this.musicGain=null;this.sfxGain=null;this.buffers=new Map;this.scopes=new Map;this.sources=new Set;this.musicSource=null;this.heartbeatSource=null;this.enabled=true;this.currentScene="none";this.loadController=null}
  publish(){if(typeof document==="undefined")return;const s=this.stats(),root=document.documentElement;root.dataset.audioScene=s.scene;root.dataset.audioBuffers=String(s.decodedBuffers);root.dataset.audioBattleBuffers=String(s.battleBuffers);root.dataset.audioSources=String(s.liveSources)}
  async unlock(){if(!this.enabled)return false;if(!this.ctx){const AudioCtx=window.AudioContext||window.webkitAudioContext;if(!AudioCtx)return false;this.ctx=new AudioCtx();this.master=this.ctx.createGain();this.musicGain=this.ctx.createGain();this.sfxGain=this.ctx.createGain();this.master.gain.value=.72;this.musicGain.gain.value=.42;this.sfxGain.gain.value=.82;this.musicGain.connect(this.master);this.sfxGain.connect(this.master);this.master.connect(this.ctx.destination)}if(this.ctx.state==="suspended")await this.ctx.resume();return true}
  async load(file,scope="battle"){if(this.buffers.has(file))return this.buffers.get(file);await this.unlock();if(!this.ctx)return null;const response=await fetch(file,{signal:this.loadController?.signal});if(!response.ok)throw Error(`Audio ${response.status}`);const buffer=await this.ctx.decodeAudioData(await response.arrayBuffer());this.buffers.set(file,buffer);this.scopes.set(file,scope);this.publish();return buffer}
  source(buffer,gain=1,rate=1,loop=false,target=this.sfxGain){if(!buffer||!this.ctx||!this.enabled)return null;const src=this.ctx.createBufferSource(),amp=this.ctx.createGain();src.buffer=buffer;src.loop=loop;src.playbackRate.value=rate;amp.gain.value=gain;src.connect(amp).connect(target);src.onended=()=>{this.sources.delete(src);try{src.disconnect();amp.disconnect()}catch{}this.publish()};this.sources.add(src);src.start();this.publish();return src}
  async play(group,{gain=.8,rate=1,scope="battle"}={}){if(!this.enabled||!LIB[group])return;try{const file=pick(LIB[group]),buffer=await this.load(file,scope);return this.source(buffer,gain,rate)}catch{return null}}
  async music(scene){if(!this.enabled||!LIB[scene])return;await this.unlock();this.stopMusic();this.currentScene=scene;try{const file=pick(LIB[scene]),scope=scene==="menu"?"menu":"battle",buffer=await this.load(file,scope);if(scene!==this.currentScene)return;this.musicSource=this.source(buffer,1,1,true,this.musicGain)}catch{}}
  startMenu(){return this.music("menu")}
  startBattle(boss=false){this.releaseBattle(false);this.loadController=new AbortController();return this.music(boss?"boss":"battle")}
  stopMusic(){if(this.musicSource){try{this.musicSource.stop();this.musicSource.disconnect()}catch{}this.sources.delete(this.musicSource);this.musicSource=null}}
  async lowHp(active){if(!this.enabled)return;if(active&&!this.heartbeatSource){try{const buffer=await this.load(pick(LIB.heartbeat),"battle");this.heartbeatSource=this.source(buffer,.38,1,true,this.sfxGain)}catch{}}else if(!active&&this.heartbeatSource){try{this.heartbeatSource.stop()}catch{}this.sources.delete(this.heartbeatSource);this.heartbeatSource=null}}
  combo(level){if(level===10||level===20||level===30)this.play("combo",{gain:.75+Math.min(.2,level/100),rate:1+level/120})}
  async enterFinisher(){this.stopMusic();await this.play("critical",{gain:1});if(this.musicGain&&this.ctx)this.musicGain.gain.setValueAtTime(.18,this.ctx.currentTime)}
  async finish(){await this.play("finisher",{gain:1});}
  async victory(){this.releaseBattle(false);await this.music("victory");if(this.musicSource)this.musicSource.loop=false}
  setEnabled(value){this.enabled=value;if(!value){this.stopAll();if(this.ctx?.state==="running")this.ctx.suspend()}else this.unlock()}
  stopAll(){for(const src of [...this.sources])try{src.stop();src.disconnect()}catch{}this.sources.clear();this.musicSource=null;this.heartbeatSource=null;this.publish()}
  stats(){const scopes={menu:0,battle:0};for(const scope of this.scopes.values())scopes[scope]=(scopes[scope]||0)+1;return{context:this.ctx?.state||"closed",scene:this.currentScene,decodedBuffers:this.buffers.size,menuBuffers:scopes.menu,battleBuffers:scopes.battle,liveSources:this.sources.size}}
  releaseBattle(returnToMenu=true){this.loadController?.abort();this.loadController=null;this.stopAll();for(const[file,scope]of [...this.scopes])if(scope==="battle"){this.buffers.delete(file);this.scopes.delete(file)}this.currentScene="none";this.publish();if(returnToMenu&&this.enabled)this.startMenu()}
  async destroy(){this.releaseBattle(false);this.buffers.clear();this.scopes.clear();if(this.ctx){try{await this.ctx.close()}catch{}this.ctx=null;this.master=this.musicGain=this.sfxGain=null}this.publish()}
}
