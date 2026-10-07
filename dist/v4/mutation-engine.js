import{choose,dateSeed,hash,rng,shuffle,unique}from"./utils.js";

export const MODIFIERS=[
  {id:"low-gravity",label:"LOW GRAVITY",physics:{gravity:.55,knockback:1.35},hidden:true},
  {id:"double-bounce",label:"DOUBLE WALL BOUNCE",physics:{wallBounce:2},hidden:true},
  {id:"giant",label:"GIANT",visual:{scale:1.24},hidden:false},
  {id:"mini",label:"MINI FURY",visual:{scale:.78},physics:{speed:1.25},hidden:false},
  {id:"clone",label:"FALSE CLONE",visual:{clones:2},hidden:true},
  {id:"glitch-arena",label:"GLITCH ARENA",arena:{glitch:true},hidden:false},
  {id:"extra-props",label:"EXTRA PROPS",arena:{extraProps:3},hidden:false},
  {id:"multi-armor",label:"MULTI ARMOR",armor:{extra:1},hidden:false},
  {id:"sticky-wall",label:"STICKY WALL",physics:{stickyWall:true},hidden:true},
  {id:"super-knockback",label:"SUPER KNOCKBACK",physics:{knockback:1.65},hidden:true}
];
export function todaysChaos(date=new Date()){const random=rng(dateSeed(date)),modifier=choose(MODIFIERS,random);return{...modifier,daily:true,label:`TODAY · ${modifier.label}`}}
export function createMutations(seed,recent=[]){const random=rng(hash(seed)),recentIds=new Set(recent.flatMap(x=>x.mutations||[])),pool=shuffle(MODIFIERS,random).sort((a,b)=>Number(recentIds.has(a.id))-Number(recentIds.has(b.id)));const count=random()>.76?2:random()>.2?1:0;return pool.slice(0,count).map(x=>({...x}))}
export function mutationSignature(list=[]){return unique(list.map(x=>x.id)).sort().join("+")||"classic"}
export function mergedMutation(list=[]){return list.reduce((acc,m)=>({physics:{...acc.physics,...m.physics},visual:{...acc.visual,...m.visual},arena:{...acc.arena,...m.arena},armor:{...acc.armor,...m.armor}}),{physics:{knockback:1,gravity:1,wallBounce:1},visual:{scale:1,clones:0},arena:{extraProps:0,glitch:false},armor:{extra:0}})}
