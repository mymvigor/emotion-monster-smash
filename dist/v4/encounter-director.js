import{understand}from"../monster-brain-v3.js";
import{AIDirectorAdapter,aiAssetFromPayload,encounterFromAIAsset}from"./ai-director-adapter.js";
import{createLocalEncounter}from"./local-director.js";
import{crossoverAssets,MonsterLibrary}from"./monster-library.js";
import{hash}from"./utils.js";

export class DirectorError extends Error{constructor(code,cause){super(code);this.name="DirectorError";this.code=code;this.cause=cause}}
const withToyboxHints=(encounter,asset)=>Object.assign(encounter,{toyboxDNA:{preferredWeaponThemes:asset?.preferredWeaponThemes||[],destructionTargets:asset?.destructionTargets||[],comicSetPieces:asset?.comicSetPieces||[]}});
export class EncounterDirector{
  constructor(storage){this.storage=storage;this.ai=new AIDirectorAdapter();this.library=new MonsterLibrary(storage)}
  async create(text,inputMode="emotion",generationMode="offline",options={}){
    let recent;try{recent=await this.storage.getRecentEncounters(12)}catch(error){throw new DirectorError("STORAGE_ERROR",error)}
    const seed=options.seed??hash(`${text}|${Date.now()}|${Math.random()}`);
    if(generationMode==="offline")return{status:"ready",encounter:createLocalEncounter(text,inputMode,{seed,recent,includeDaily:true}),profile:understand(text,inputMode)};
    const profile=understand(text,inputMode);let match;try{match=await this.library.search(profile)}catch(error){throw new DirectorError("AI_LIBRARY_ERROR",error)}
    if(match.best){const encounter=await this.library.reuse(match.best.asset,{...profile,source:text},{seed,recent});return{status:"ready",encounter:withToyboxHints(encounter,match.best.asset),profile,reused:true,score:match.best.score}}
    if(match.medium.length>=2){const crossed=crossoverAssets(match.medium[0].asset,match.medium[1].asset,{...profile,source:text},{seed,recent});if(crossed){const hints={preferredWeaponThemes:[...(match.medium[0].asset.preferredWeaponThemes||[]),...(match.medium[1].asset.preferredWeaponThemes||[])],destructionTargets:[],comicSetPieces:[]};return{status:"ready",encounter:withToyboxHints(crossed,hints),profile,reused:true,crossover:true,score:(match.medium[0].score+match.medium[1].score)/2}}}
    return{status:"needs-ai",code:"AI_REQUIRED",profile,prompt:this.ai.buildPrompt(text,inputMode),text,inputMode,availability:this.ai.availability()}
  }
  async importAI(raw,context){const parsed=this.ai.parse(raw);if(!parsed.ok)return{...parsed,code:"AI_IMPORT_ERROR"};const asset=aiAssetFromPayload(parsed.value,context.profile);try{await this.library.save(asset)}catch(error){return{ok:false,code:"STORAGE_ERROR",errors:["AI 怪物无法保存到本地，请检查浏览器存储空间。"]}}let recent;try{recent=await this.storage.getRecentEncounters(12)}catch(error){return{ok:false,code:"STORAGE_ERROR",errors:["本地战斗记录读取失败。"]}}const encounter=withToyboxHints(encounterFromAIAsset(asset,{...context.profile,source:context.text},{seed:hash(`${asset.monsterId}|${Date.now()}`),recent,origin:"ai-new"}),asset);return{ok:true,asset,encounter}}
}
