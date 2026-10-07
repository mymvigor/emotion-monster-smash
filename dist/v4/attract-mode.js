export const ATTRACT_EVENTS = [
  { id: "logo-smack", duration: 1700, visibleChange: "logo", template: '<span class="attract-splat">啪!</span>' },
  { id: "moon-blink", duration: 1850, visibleChange: "moon", template: '<span class="attract-eye">◉</span>' },
  { id: "rare-flyby", duration: 2500, visibleChange: "sky", template: '<span class="attract-ufo">🛸</span><span class="attract-beam"></span>' },
  { id: "hammer-walk", duration: 2600, visibleChange: "street", template: '<span class="attract-hammer">🔨</span>' },
  { id: "bin-rattle", duration: 2100, visibleChange: "bin", template: '<span class="attract-bin-lid"></span><span class="attract-paws">••</span>' },
  { id: "door-prank", duration: 2500, visibleChange: "door", template: '<span class="attract-boot">🥾</span><span class="attract-puff">噗</span>' },
  { id: "vending-spit", duration: 2350, visibleChange: "vending", template: '<span class="attract-can">🥫</span><span class="attract-can second">🥫</span>' },
  { id: "pipe-sneeze", duration: 2100, visibleChange: "pipe", template: '<span class="attract-steam">哈啾!</span>' },
  { id: "sewer-peek", duration: 2200, visibleChange: "sewer", template: '<span class="attract-tentacle">〰</span><span class="attract-eye-pair">••</span>' },
  { id: "sign-fall", duration: 2450, visibleChange: "sign", template: '<span class="attract-spark">✦</span>' },
  { id: "monster-duel", duration: 3100, visibleChange: "midground", template: '<span class="duel-one">●</span><span class="duel-star">💥</span><span class="duel-two">▲</span>' },
  { id: "chase-chain", duration: 3800, visibleChange: "whole-scene", template: '<span class="chase-small">●</span><span class="chase-pan">🍳</span><span class="chase-big">◆</span>' }
];

export class AttractMode {
  constructor(root, onEvent) {
    this.root = root;
    this.stage = root?.querySelector(".living-events") || root;
    this.onEvent = onEvent;
    this.timer = null;
    this.cleanupTimer = null;
    this.recent = [];
    this.active = null;
    this.running = false;
  }
  start() { if (!this.root || this.running) return; this.running = true; this.schedule(900); }
  schedule(delay = 2000 + Math.random() * 6000) {
    clearTimeout(this.timer);
    if (!this.running) return;
    this.timer = setTimeout(() => { this.fire(); this.schedule(); }, delay);
  }
  fire(forcedId) {
    if (!this.running || this.active) return null;
    const pool = ATTRACT_EVENTS.filter((event) => !this.recent.includes(event.id));
    const event = ATTRACT_EVENTS.find((item) => item.id === forcedId) || pool[Math.floor(Math.random() * pool.length)] || ATTRACT_EVENTS[0];
    this.recent = [...this.recent.slice(-3), event.id];
    this.root.dataset.attract = event.id;
    const node = document.createElement("div");
    node.className = `attract-event attract-${event.id}`;
    node.dataset.event = event.id;
    node.innerHTML = event.template;
    this.stage?.appendChild(node);
    this.active = node;
    this.onEvent?.(event.id);
    clearTimeout(this.cleanupTimer);
    this.cleanupTimer = setTimeout(() => {
      node.remove();
      if (this.active === node) this.active = null;
      delete this.root.dataset.attract;
    }, event.duration);
    return event.id;
  }
  stop() {
    this.running = false;
    clearTimeout(this.timer);
    clearTimeout(this.cleanupTimer);
    this.active?.remove();
    this.active = null;
    if (this.root) delete this.root.dataset.attract;
  }
  destroy() { this.stop(); this.root = null; this.stage = null; }
}
