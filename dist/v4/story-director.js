import{choose,hash,rng}from"./utils.js";

const PATTERNS=["armor-first","world-cracks","false-triumph","core-glimpse","prop-revenge","mask-collapse","arena-collapse"];
export function createStoryDNA(profile,rarity,seed){const random=rng(hash(`${seed}|story`)),weight={COMMON:1,UNCOMMON:2,RARE:3,BOSS:4,NEMESIS:4}[rarity]||1,pattern=choose(PATTERNS.slice(0,Math.min(PATTERNS.length,weight+3)),random),coreReveal=weight>=3&&random()>.48;return{pattern,intensity:weight,beats:["intro","show","fight","armor-break","persona-crack","world-collapse","break","release","finish","silence"],coreReveal,coreSymbol:coreReveal?choose(["一颗缩小的眼睛","一张皱掉的名单","一盏快熄灭的灯","一枚空心奖牌","一个不停后退的影子"],random):null}}
export class StoryDirector{
  constructor(dna,emit){this.dna=dna;this.emit=emit;this.seen=new Set}
  beat(name,data={}){if(this.seen.has(name)&&!["arena-hit","special"].includes(name))return;this.seen.add(name);this.emit?.({type:"story",beat:name,data,core:name==="breakdown"&&this.dna.coreReveal?this.dna.coreSymbol:null})}
  destroy(){this.emit=null;this.seen.clear()}
}
