const DB_NAME = "monster-smash-local";
const DB_VERSION = 4;
let dbPromise;

function openDB() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("monsters")) db.createObjectStore("monsters", { keyPath: "category" });
      if (!db.objectStoreNames.contains("history")) {
        const history = db.createObjectStore("history", { keyPath: "id" });
        history.createIndex("at", "at");
      }
      if (!db.objectStoreNames.contains("settings")) db.createObjectStore("settings", { keyPath: "key" });
      if (!db.objectStoreNames.contains("aiMonsters")) {
        const ai = db.createObjectStore("aiMonsters", { keyPath: "monsterId" });
        ai.createIndex("lastUsedAt", "lastUsedAt");
      }
      if (!db.objectStoreNames.contains("encounters")) {
        const encounters = db.createObjectStore("encounters", { keyPath: "id" });
        encounters.createIndex("createdAt", "createdAt");
      }
      if (!db.objectStoreNames.contains("nemeses")) db.createObjectStore("nemeses", { keyPath: "semanticKey" });
      if (!db.objectStoreNames.contains("discoveries")) db.createObjectStore("discoveries", { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return dbPromise;
}

async function transaction(store, mode, action) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, mode);
    const objectStore = tx.objectStore(store);
    let result;
    try { result = action(objectStore); } catch (error) { reject(error); return; }
    tx.oncomplete = () => resolve(result?.result ?? result);
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAllMonsters() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const request = db.transaction("monsters").objectStore("monsters").getAll();
    request.onsuccess = () => resolve(request.result.sort((a,b) => b.lastSeen - a.lastSeen));
    request.onerror = () => reject(request.error);
  });
}

export async function saveEncounter(dna, rawText, saveRaw) {
  const existing = await new Promise(async (resolve, reject) => {
    const db = await openDB();
    const req = db.transaction("monsters").objectStore("monsters").get(dna.category);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  const now = Date.now();
  const record = {
    category: dna.category,
    dna,
    appearances: (existing?.appearances || 0) + 1,
    defeats: (existing?.defeats || 0),
    firstSeen: existing?.firstSeen || now,
    lastSeen: now,
    favoriteLine: dna.idleLines[0]
  };
  await transaction("monsters", "readwrite", store => store.put(record));
  await transaction("history", "readwrite", store => store.put({
    id: `${now}-${dna.id}`,
    at: now,
    category: dna.category,
    keywords: dna.keywords.slice(0, 4),
    raw: saveRaw ? rawText : undefined
  }));
  return record;
}

export async function markDefeated(category) {
  const db = await openDB();
  const tx = db.transaction("monsters", "readwrite");
  const store = tx.objectStore("monsters");
  const req = store.get(category);
  req.onsuccess = () => {
    if (req.result) store.put({ ...req.result, defeats: (req.result.defeats || 0) + 1, lastDefeated: Date.now() });
  };
}

export async function getSetting(key, fallback) {
  const db = await openDB();
  return new Promise(resolve => {
    const req = db.transaction("settings").objectStore("settings").get(key);
    req.onsuccess = () => resolve(req.result?.value ?? fallback);
    req.onerror = () => resolve(fallback);
  });
}

export async function setSetting(key, value) {
  return transaction("settings", "readwrite", store => store.put({ key, value }));
}

export async function clearAllData() {
  const db = await openDB();
  return Promise.all([...db.objectStoreNames].map(store => transaction(store, "readwrite", s => s.clear())));
}

function getAll(storeName) {
  return openDB().then(db => new Promise((resolve, reject) => {
    const req = db.transaction(storeName).objectStore(storeName).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  }));
}

export async function getAIAssets() {
  return (await getAll("aiMonsters")).sort((a,b)=>(b.lastUsedAt||b.createdAt)-(a.lastUsedAt||a.createdAt));
}

export async function putAIAsset(asset) {
  await transaction("aiMonsters", "readwrite", store => store.put(asset));
  return asset;
}

export async function touchAIAsset(monsterId, patch={}) {
  const db = await openDB();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction("aiMonsters","readwrite"),store=tx.objectStore("aiMonsters"),req=store.get(monsterId);
    req.onsuccess=()=>{if(!req.result){resolve(null);return}const next={...req.result,...patch,lastUsedAt:Date.now(),timesReused:(req.result.timesReused||0)+(patch.incrementReuse?1:0)};delete next.incrementReuse;store.put(next);tx.oncomplete=()=>resolve(next)};
    req.onerror=()=>reject(req.error);tx.onerror=()=>reject(tx.error);
  });
}

export async function saveEncounterV4(encounter, summary={}) {
  const record={id:encounter.id,createdAt:encounter.createdAt||Date.now(),origin:encounter.origin,semanticKey:(encounter.semanticDNA?.concepts||[]).join("+"),novelty:encounter.novelty,mutations:(encounter.mutationDNA||[]).map(x=>x.id),monsterName:encounter.monsterDNA?.name,arena:encounter.arenaDNA?.theme,summary};
  await transaction("encounters","readwrite",store=>store.put(record));
  return record;
}

export async function getRecentEncounters(limit=12) {
  return (await getAll("encounters")).sort((a,b)=>b.createdAt-a.createdAt).slice(0,limit);
}

export async function upsertNemesis(semanticKey, data={}) {
  const db=await openDB();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction("nemeses","readwrite"),store=tx.objectStore("nemeses"),req=store.get(semanticKey);
    req.onsuccess=()=>{const old=req.result||{},now=Date.now(),next={semanticKey,recurringMonsterId:old.recurringMonsterId||data.monsterId,generation:(old.generation||0)+(data.countEncounter===false?0:1),defeatCount:(old.defeatCount||0)+(data.defeated?1:0),finisherHistory:[...(old.finisherHistory||[]),...(data.finisher?[data.finisher]:[])].slice(-12),mutationHistory:[...(old.mutationHistory||[]),...(data.mutations||[])].slice(-20),visualScars:[...(old.visualScars||[]),...(data.scars||[])].slice(-8),combatEvolution:[...(old.combatEvolution||[]),...(data.combat||[])].slice(-8),personalityEvolution:[...(old.personalityEvolution||[]),...(data.personality?[data.personality]:[])].slice(-8),favoriteArena:data.arena||old.favoriteArena,lastSeen:now,name:data.name||old.name,origin:data.origin||old.origin};store.put(next);tx.oncomplete=()=>resolve(next)};
    req.onerror=()=>reject(req.error);tx.onerror=()=>reject(tx.error);
  });
}

export async function getNemeses(){return(await getAll("nemeses")).sort((a,b)=>b.generation-a.generation)}

export async function addDiscovery(id, type, label, data={}) {
  const db=await openDB();
  const existing=await new Promise(resolve=>{const req=db.transaction("discoveries").objectStore("discoveries").get(id);req.onsuccess=()=>resolve(req.result);req.onerror=()=>resolve(null)});
  const record={id,type,label,firstSeen:existing?.firstSeen||Date.now(),lastSeen:Date.now(),count:(existing?.count||0)+1,...data};
  await transaction("discoveries","readwrite",store=>store.put(record));
  return record;
}

export async function getDiscoveries(){return(await getAll("discoveries")).sort((a,b)=>b.lastSeen-a.lastSeen)}
