import{choose}from"./utils.js";

export class DialogueDirector{
  constructor(dialogue,{speak,grunt}={}){this.dialogue=dialogue;this.speak=speak;this.grunt=grunt;this.timer=0;this.stage="DEFIANT";this.active=false;this.lastFull=0}
  start(){this.active=true;this.full("intro",true);this.schedule()}
  schedule(){clearTimeout(this.timer);if(!this.active)return;this.timer=setTimeout(()=>{this.full(this.stage.toLowerCase());this.schedule()},3000+Math.random()*4000)}
  setStage(stage){if(stage===this.stage)return;this.stage=stage;this.full(stage.toLowerCase(),true)}
  hit(event){if(event.armorBroken)this.full("cracked",true);else if(event.critical&&performance.now()-this.lastFull>1800)this.full(this.stage.toLowerCase(),true);else this.grunt?.(choose(this.dialogue.grunts?.length?this.dialogue.grunts:["哼。","喂！","啧。"]))}
  special(){this.full("special",true)}
  ko(){this.full("ko",true)}
  full(group,force=false){const list=this.dialogue[group]||this.dialogue.defiant||[];if(!list.length)return;const now=performance.now();if(!force&&now-this.lastFull<2800)return;this.lastFull=now;this.speak?.(choose(list),group)}
  destroy(){this.active=false;clearTimeout(this.timer);this.speak=null;this.grunt=null}
}
