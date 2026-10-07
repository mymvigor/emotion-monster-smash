export function hash(value){let h=2166136261;for(const c of String(value)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
export function rng(seed){let v=(Number(seed)||1)>>>0;return()=>{v=v+0x6D2B79F5|0;let t=Math.imul(v^v>>>15,1|v);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
export const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
export const choose=(list,random=Math.random)=>list[Math.floor(random()*list.length)];
export const range=(min,max,random=Math.random)=>Math.round(min+random()*(max-min));
export const unique=list=>[...new Set(list.filter(Boolean))];
export function shuffle(list,random=Math.random){const out=[...list];for(let i=out.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[out[i],out[j]]=[out[j],out[i]]}return out}
export function normalizeText(text){return String(text||"").toLowerCase().replace(/[\s，。！？、,.!?；;：“”"（）()【】\[\]]/g,"")}
const STOP=new Set(["今天","现在","那个","这个","感觉","觉得","真的","特别","非常","就是","还是","然后","已经","自己","有个","一个","开始","一直"]);
export function semanticTokens(text){const n=normalizeText(text),tokens=[];for(let size=2;size<=4;size++)for(let i=0;i<=n.length-size;i++){const token=n.slice(i,i+size);if(!STOP.has(token))tokens.push(token)}return unique(tokens).slice(0,80)}
export function escapeHTML(value){return String(value??"").replace(/[<>&"']/g,c=>({"<":"&lt;",">":"&gt;","&":"&amp;","\"":"&quot;","'":"&#39;"}[c]))}
export function dateSeed(date=new Date()){return Number(`${date.getFullYear()}${String(date.getMonth()+1).padStart(2,"0")}${String(date.getDate()).padStart(2,"0")}`)}
export const uid=(prefix="id")=>`${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
