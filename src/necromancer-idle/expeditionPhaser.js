import Phaser from 'phaser';
import { ExpeditionBattleScene } from './ExpeditionBattleScene.js';

/**
 * @param {HTMLElement} host
 * @returns {Phaser.Game}
 */
export function createExpeditionPhaserGame(host) {
  const w = Math.max(280, host.clientWidth || 320);
  const h = 148;
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: host,
    width: w,
    height: h,
    backgroundColor: '#08080d',
    scene: [ExpeditionBattleScene],
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    render: {
      pixelArt: true,
      antialias: false,
      roundPixels: true,
    },
  });

  const ro = new ResizeObserver(() => {
    game.scale.resize(Math.max(280, host.clientWidth || 320), h);
  });
  ro.observe(host);
  game.events.once('destroy', () => ro.disconnect());

  return game;
}
