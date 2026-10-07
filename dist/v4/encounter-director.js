import{understand}from"../monster-brain-v3.js";
import{AIDirectorAdapter,aiAssetFromPayload,encounterFromAIAsset}from"./ai-director-adapter.js";
import{createLocalEncounter}from"./local-director.js";
import{crossoverAssets,MonsterLibrary}from"./monster-library.js";
import{hash}from"./utils.js";

export class EncounterDirector{
  constructor(storage){this.storage=storage;this.ai=new AIDirectorAdapter();this.library=new MonsterLibrary(storage)}
  async create(text,inputMode="emotion",generationMode="offline",options={}){const recent=await this.storage.getRecentEncounters(12),seed=options.seed??hash(`${text}|${Date.now()}|${Math.random()}`);if(generationMode==="offline")return{status:"ready",encounter:createLocalEncounter(text,inputMode,{seed,recent,includeDaily:true}),profile:understand(text,inputMode)};const profile=understand(text,inputMode),match=await this.library.search(profile);if(match.best)return{status:"ready",encounter:await this.library.reuse(match.best.asset,{...profile,source:text},{seed,recent}),profile,reused:true,score:match.best.score};if(match.medium.length>=2){const crossed=crossoverAssets(match.medium[0].asset,match.medium[1].asset,{...profile,source:text},{seed,recent});if(crossed)return{status:"ready",encounter:crossed,profile,reused:true,crossover:true,score:(match.medium[0].score+match.medium[1].score)/2}}return{status:"needs-ai",profile,prompt:this.ai.buildPrompt(text,inputMode),text,inputMode,availability:this.ai.availability()}}
  async importAI(raw,context){const parsed=this.ai.parse(raw);if(!parsed.ok)return parsed;const asset=aiAssetFromPayload(parsed.value,context.profile);await this.library.save(asset);const recent=await this.storage.getRecentEncounters(12),encounter=encounterFromAIAsset(asset,{...context.profile,source:context.text},{seed:hash(`${asset.monsterId}|${Date.now()}`),recent,origin:"ai-new"});return{ok:true,asset,encounter}}
}
