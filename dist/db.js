const DB_NAME = "monster-smash-local";
const DB_VERSION = 1;
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
  return Promise.all(["monsters", "history", "settings"].map(store => transaction(store, "readwrite", s => s.clear())));
}

