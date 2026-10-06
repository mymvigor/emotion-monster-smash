const PALETTES = [
  ["#a95cff", "#753bd6"], ["#ff625a", "#d83a67"], ["#50dfca", "#179f9e"],
  ["#ffbd4a", "#e66a43"], ["#7be052", "#28a45f"], ["#ff73b9", "#a849c1"], ["#6c8cff", "#4754c7"]
];

const CATEGORIES = {
  comparison: {
    represents: "害怕别人超过自己",
    patterns: ["超过", "比我", "不如", "落后", "追不上", "别人.*厉害", "别人.*好", "输给", "比较", "差距", "甩开"],
    names: ["比较虫", "排名蜱", "超车精", "输赢蛞蝓"],
    quote: kw => `别人是不是已经比你${kw || "厉害"}了？`,
    personality: "挑拨又心虚"
  },
  insecurity: {
    represents: "怀疑自己不够好",
    patterns: ["没用", "不够好", "不重要", "不行", "失败", "废物", "配不上", "没价值", "自卑", "不被需要"],
    names: ["自贬团", "不配球", "唱衰兽", "缩水鬼"],
    quote: kw => `你确定自己真的${kw || "够好"}吗？`, personality: "嘴碎又胆小"
  },
  anxiety: {
    represents: "把未知提前演成灾难",
    patterns: ["焦虑", "担心", "害怕", "怕", "万一", "怎么办", "睡不着", "紧张", "忐忑", "不安"],
    names: ["万一鸡", "焦虑线团", "警报蛙", "忐忑球"],
    quote: kw => `${kw || "这事"}要是搞砸了怎么办？`, personality: "爱拉警报"
  },
  catastrophizing: {
    represents: "把小事脑补成世界末日",
    patterns: ["完了", "毁了", "彻底", "永远", "再也", "肯定会", "一切都", "天塌", "没救"],
    names: ["世界末日鸡", "天塌兽", "完蛋预言家", "灾难喇叭"],
    quote: () => "完了完了，这下全完了！", personality: "夸张预言家"
  },
  rumination: {
    represents: "在脑内反复回放和消耗",
    patterns: ["一直想", "反复想", "想太多", "脑补", "内耗", "停不下来", "纠结", "为什么", "后悔", "钻牛角尖"],
    names: ["内耗蛞蝓", "复读机怪", "脑补兽", "回放水母"],
    quote: kw => `来，再把${kw || "那件事"}想一百遍。`, personality: "黏人复读机"
  },
  jealousy: {
    represents: "嫉妒和不甘心",
    patterns: ["嫉妒", "眼红", "凭什么", "羡慕", "酸", "看不惯.*好", "不甘心"],
    names: ["酸柠怪", "眼红虫", "凭什么精", "嫉妒泡"],
    quote: () => "凭什么好事又轮到别人？", personality: "酸得冒泡"
  },
  grievance: {
    represents: "咽不下去的委屈",
    patterns: ["委屈", "冤枉", "误会", "不公平", "憋屈", "没人理解", "被忽略", "难受"],
    names: ["委屈包", "憋屈河豚", "冤枉团", "苦水怪"],
    quote: () => "反正也没人真的在乎你。", personality: "含泪拱火"
  },
  anger: {
    represents: "压不住的火气",
    patterns: ["生气", "愤怒", "火大", "烦死", "气死", "讨厌", "恶心", "滚", "他妈", "傻逼"],
    names: ["暴脾气煤球", "火药包", "烦躁刺球", "怒气锅"],
    quote: () => "来啊，让我再拱一把火！", personality: "一点就炸"
  },
  credit_grabbing: {
    represents: "抢功、邀功和窃取成果",
    patterns: ["抢功", "邀功", "功劳", "成果.*他的", "抢.*成果", "摘桃子", "占便宜", "冒领"],
    names: ["抢功王", "奖牌蜈蚣", "功劳吸尘器", "扩音器怪"],
    quote: () => "领导看我！这当然主要是我的功劳。", personality: "自带扩音器"
  },
  passive_aggressive: {
    represents: "阴阳怪气和话里有话",
    patterns: ["阴阳", "内涵", "话里有话", "夹枪带棒", "冷嘲", "讽刺", "酸言酸语", "呵呵"],
    names: ["阴阳精", "歪嘴喇叭", "暗箭水母", "含沙射影怪"],
    quote: () => "哎呀，我可什么都没说哦～", personality: "歪嘴拱火"
  },
  hypocrisy: {
    represents: "双标、虚伪和两面派",
    patterns: ["双标", "虚伪", "两面", "当面一套", "背后一套", "装", "假惺惺", "说一套做一套"],
    names: ["两面团", "双标秤", "假面糊", "变脸怪"],
    quote: () => "规矩当然是给别人守的呀。", personality: "翻面比翻书快"
  },
  boundary: {
    represents: "控制、冒犯和越界",
    patterns: ["控制", "越界", "冒犯", "管我", "指手画脚", "逼我", "不尊重", "骚扰", "干涉", "命令"],
    names: ["越界章鱼", "控制爪", "指手画脚怪", "边界啃食兽"],
    quote: () => "你的事？不，还是听我的吧。", personality: "爪子伸得太长"
  },
  showing_off: {
    represents: "炫耀、显摆和高高在上",
    patterns: ["炫耀", "显摆", "装逼", "优越", "瞧不起", "高高在上", "凡尔赛", "吹牛"],
    names: ["显摆孔雀球", "优越气球", "吹牛大王", "镀金喇叭"],
    quote: () => "不是吧，这点事你都不会？", personality: "膨胀过度"
  },
  blame: {
    represents: "甩锅、推责和倒打一耙",
    patterns: ["甩锅", "推卸", "怪我", "倒打一耙", "不负责", "赖我", "推给"],
    names: ["甩锅章鱼", "推责滑泥", "倒打一耙兽", "锅盖精"],
    quote: () => "出问题了？反正肯定不是我的错。", personality: "滑不留手"
  }
};

const DEFAULTS = {
  emotion: ["anxiety", "rumination", "insecurity"],
  person: ["anger", "hypocrisy", "boundary"]
};

const intensityWords = ["特别", "非常", "真的", "太", "超级", "极其", "他妈", "死了", "爆了", "完全"];
const relationWords = ["领导", "同事", "老板", "朋友", "家人", "对象", "前任", "室友", "同学"];
const stopWords = new Set(["今天", "现在", "一个", "那个", "这个", "感觉", "觉得", "真的", "特别", "非常", "怎么", "什么", "就是", "还是", "然后", "已经", "自己"]);

function hashString(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

function seeded(seed) {
  let value = seed || 1;
  return () => { value |= 0; value = value + 0x6D2B79F5 | 0; let t = Math.imul(value ^ value >>> 15, 1 | value); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
const choose = (list, random) => list[Math.floor(random() * list.length)];

export function hasImmediateSafetyRisk(text) {
  const normalized = text.replace(/\s+/g, "");
  const direct = /(我)?(现在|马上|今晚|待会)?.{0,4}(想|要|准备|打算)(自杀|死掉|去死|结束生命|割腕|跳楼|跳下去|吞药)|已经.{0,4}(割腕|吞药)|不想活了.*(马上|现在)/;
  const negated = /(不想|不会|没有|别).*?(自杀|伤害自己|去死)/;
  return direct.test(normalized) && !negated.test(normalized);
}

export function extractKeywords(text) {
  const chunks = text
    .replace(/[，。！？、,.!?；;：“”"（）()]/g, " ")
    .split(/\s+/)
    .flatMap(s => s.length > 7 ? s.match(/.{2,5}/g) || [s] : [s])
    .filter(s => s.length >= 2 && !stopWords.has(s));
  const known = [];
  Object.values(CATEGORIES).forEach(cat => cat.patterns.forEach(pattern => {
    const plain = pattern.replace(/[.*+?^${}()|[\]\\]/g, "").slice(0, 5);
    if (plain.length >= 2 && text.includes(plain)) known.push(plain);
  }));
  return [...new Set([...known, ...chunks])].slice(0, 6);
}

export function analyzeText(text, mode = "emotion") {
  const scores = [];
  for (const [category, def] of Object.entries(CATEGORIES)) {
    let score = 0;
    const matches = [];
    def.patterns.forEach(pattern => {
      const match = text.match(new RegExp(pattern, "i"));
      if (match) { score += pattern.includes(".*") ? 3 : 2; matches.push(match[0]); }
    });
    intensityWords.forEach(word => { if (text.includes(word)) score += .3; });
    if (mode === "person" && ["credit_grabbing","passive_aggressive","hypocrisy","boundary","showing_off","blame"].includes(category)) score += .5;
    if (mode === "emotion" && ["comparison","insecurity","anxiety","catastrophizing","rumination","jealousy","grievance"].includes(category)) score += .5;
    if (score > .4) scores.push({ category, score, matches });
  }
  scores.sort((a,b) => b.score - a.score);
  const distinct = [];
  for (const item of scores) {
    if (distinct.length >= 3) break;
    if (!distinct.some(x => Math.abs(x.score - item.score) < .01 && x.matches.join() === item.matches.join())) distinct.push(item);
  }
  if (!distinct.length) distinct.push(...DEFAULTS[mode].slice(0, text.length > 35 ? 2 : 1).map((category,i) => ({category, score: 1-i*.1, matches: []})));
  const threshold = distinct[0].score >= 3 ? 1.2 : .6;
  return distinct.filter((x,i) => i === 0 || x.score >= threshold).slice(0, 3);
}

export function generateMonsters(text, mode = "emotion", familiarity = {}) {
  const analysis = analyzeText(text, mode);
  const keywords = extractKeywords(text);
  const intensity = Math.min(1, .38 + intensityWords.filter(w => text.includes(w)).length * .15 + text.length / 260);
  return analysis.map((match, index) => {
    const def = CATEGORIES[match.category];
    const seed = hashString(`${text}-${match.category}-${Date.now()}-${index}`);
    const random = seeded(seed);
    const palette = choose(PALETTES, random);
    const key = match.matches[0] || keywords[index] || relationWords.find(w => text.includes(w)) || "这件事";
    const oldCount = familiarity[match.category] || 0;
    const name = choose(def.names, random);
    const oldLine = oldCount ? `怎么又是你……我这次可没惹你。` : null;
    return {
      id: `m-${seed.toString(36)}-${index}`,
      category: match.category,
      sourceType: mode,
      represents: def.represents,
      name,
      bodyShape: choose(["blob","pear","round","slug","spike"], random),
      bodySize: +(0.88 + random() * .22).toFixed(2),
      bodySquishiness: +(0.72 + random() * .25).toFixed(2),
      primaryColor: palette[0], secondaryColor: palette[1],
      eyes: choose([1,2,2,2,3], random),
      eyeExpression: choose(["smug","squint","wide","side-eye"], random),
      mouth: choose(["smirk","frown","grin","o"], random),
      mouthExpression: choose(["cocky","mean","nervous"], random),
      arms: random() > .17, legs: random() > .3,
      horns: random() > .62, tentacles: random() > .78,
      accessory: oldCount ? "bandage" : choose(["none","medal","tie","crown","bandage"], random),
      texture: choose(["shine","spots","stripes","plain"], random),
      aura: choose(["buzz","smoke","none"], random),
      movementStyle: choose(["wobble","bounce","slink","swagger"], random),
      personality: def.personality,
      arrogance: +(0.55 + random() * .44).toFixed(2),
      cowardice: +(0.35 + random() * .64).toFixed(2),
      keywords,
      intensity,
      oldCount,
      idleLines: [oldLine, def.quote(key), mode === "person" ? `怎么，你对${key}有意见？` : `继续想啊，${key}可不会自己消失。`].filter(Boolean),
      lightHitLines: ["不是……你干嘛？", "就这？没吃饭吗？", "喂！别碰我的脸！", "我说错了吗？"],
      mediumHitLines: ["等等，这和说好的不一样！", "我的脸！我的脸歪了！", `行了，${key}也没那么严重！`, "停停停，我开始慌了！"],
      heavyHitLines: ["哇啊啊——我收回！", "别打了，我要漏气了！", "其实……我也没那么确定。"],
      surrenderLines: ["行行行，我闭嘴。", "服了，今天你说了算。", "我缩小还不行吗……"],
      escapeLines: ["我还会回来的——算了不回了！", "这地方没法待了！", "别送了！我自己滚！"],
      endingStyle: choose(["fly","pop","shrink","escape"], random)
    };
  });
}

export function getCategoryLabel(category) {
  return CATEGORIES[category]?.represents || category;
}

