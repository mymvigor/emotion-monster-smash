import{choose,range}from"./utils.js";

const EVENTS=["logo-hit","moon-blink","rare-pass","prop-carry","monster-fight","sign-flicker"];
export class AttractMode{
  constructor(root){this.root=root;this.timer=0;this.active=false;this.nodes=[]}
  start(){if(this.active)return;this.active=true;this.schedule(900)}
  schedule(delay=range(2200,6800)){clearTimeout(this.timer);this.timer=setTimeout(()=>this.fire(),delay)}
  fire(){if(!this.active||document.body.dataset.view!=="homeView"){this.schedule();return}const event=choose(EVENTS);this.root.classList.add(`attract-${event}`);const spark=document.createElement("i");spark.className=`attract-sprite sprite-${event}`;spark.setAttribute("aria-hidden","true");this.root.appendChild(spark);this.nodes.push(spark);setTimeout(()=>{this.root.classList.remove(`attract-${event}`);spark.remove();this.nodes=this.nodes.filter(x=>x!==spark)},1500+Math.random()*1100);this.schedule()}
  stop(){this.active=false;clearTimeout(this.timer);for(const n of this.nodes)n.remove();this.nodes=[];for(const e of EVENTS)this.root?.classList.remove(`attract-${e}`)}
  destroy(){this.stop();this.root=null}
}
