import * as Phaser from "phaser";
import "./style.css";
import { gameState } from "./core/GameState";
import { MainScene } from "./scenes/MainScene";

gameState.loadFromLocalStorage();

window.addEventListener("beforeunload", () => {
  gameState.saveToLocalStorage();
});

/** Messung + Fallback, falls Phaser startet bevor Flex/CSS-Layout final ist (sonst 0×0 → nichts sichtbar). */
function mountSize(el: HTMLElement): { w: number; h: number } {
  let w = el.clientWidth;
  let h = el.clientHeight;
  if (w > 8 && h > 8) return { w, h };

  const vw = window.innerWidth || 800;
  const vh = window.innerHeight || 600;
  const reserve = 200;
  return {
    w: Math.max(w, vw - 32),
    h: Math.max(h, Math.max(260, vh - reserve)),
  };
}

function bootPhaser(): void {
  const parent = document.getElementById("gameMount");
  if (!parent) {
    throw new Error("#gameMount fehlt");
  }

  const { w, h } = mountSize(parent);

  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    backgroundColor: "#0a1210",
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: w,
      height: h,
    },
    scene: [MainScene],
  });

  function syncPhaserSize(): void {
    const el = document.getElementById("gameMount");
    if (!el) return;
    const { w: rw, h: rh } = mountSize(el);
    if (rw > 0 && rh > 0) {
      game.scale.resize(rw, rh);
    }
  }

  syncPhaserSize();
  requestAnimationFrame(() => syncPhaserSize());

  const resizeObserver = new ResizeObserver(() => syncPhaserSize());
  resizeObserver.observe(parent);
  window.addEventListener("orientationchange", () => {
    window.setTimeout(syncPhaserSize, 400);
  });
}

function scheduleBoot(): void {
  requestAnimationFrame(() => {
    bootPhaser();
  });
}

if (document.readyState === "complete") {
  scheduleBoot();
} else {
  window.addEventListener("load", scheduleBoot);
}
