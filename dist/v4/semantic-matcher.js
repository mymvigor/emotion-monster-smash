import{normalizeText,semanticTokens,unique}from"./utils.js";

function setScore(a,b){const A=new Set(a),B=new Set(b);if(!A.size||!B.size)return 0;let hit=0;for(const token of A)if(B.has(token))hit++;return hit/Math.max(1,A.size+B.size-hit)}
export function profileTokens(profile){return unique([...(profile.concepts||[]),...(profile.keywords||[]),profile.keyPhrase,profile.coreBehavior,...semanticTokens(profile.source||"")])}
export function assetTokens(asset){return unique([...(asset.semanticCore||[]),...(asset.semanticAliases||[]),...(asset.triggerConcepts||[]),...(asset.originalSemanticProfile?.concepts||[]),...semanticTokens(asset.monsterConcept||"")])}
export function semanticSimilarity(profile,asset){const p=profileTokens(profile),a=assetTokens(asset),concepts=profile.concepts||[],conceptHits=concepts.filter(x=>a.includes(x)||(asset.triggerConcepts||[]).includes(x)).length,fullCoverage=concepts.length&&conceptHits===concepts.length?1:0;const key=normalizeText(profile.keyPhrase||"");const direct=key&&a.some(x=>normalizeText(x).includes(key)||key.includes(normalizeText(x)))?1:0;return Math.min(1,setScore(p,a)*.4+Math.min(.4,conceptHits*.2)+fullCoverage*.24+direct*.18)}
export function rankAssets(profile,assets){return assets.map(asset=>({asset,score:semanticSimilarity(profile,asset)})).sort((a,b)=>b.score-a.score)}
export function isCompatible(a,b){const left=new Set(assetTokens(a)),right=assetTokens(b);return right.some(x=>left.has(x))||((a.triggerConcepts||[]).some(x=>(b.triggerConcepts||[]).includes(x)))}
