import Phaser from 'phaser';

/**
 * Mini-Szene: Parallax, marschierende Untote, Dorfbewohner-Encounters.
 */
export class ExpeditionBattleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ExpeditionBattleScene' });
    /** @type {Phaser.GameObjects.TileSprite | undefined} */
    this.layerFar = undefined;
    /** @type {Phaser.GameObjects.TileSprite | undefined} */
    this.layerNear = undefined;
    /** @type {Phaser.GameObjects.Group | undefined} */
    this.skeletonGroup = undefined;
    this.running = false;
    /** @type {(e: CustomEvent) => void} */
    this._onSync = (e) => this.#handleSync(e);
  }

  create() {
    const { width, height } = this.scale;

    const mkTile = (key, bg, stripe) => {
      const gg = this.make.graphics({ x: 0, y: 0, add: false });
      gg.fillStyle(bg, 1);
      gg.fillRect(0, 0, 64, 64);
      gg.fillStyle(stripe, 0.35);
      for (let i = 0; i < 64; i += 8) gg.fillRect(i, (i % 16 === 0 ? 2 : 0), 3, 64);
      gg.generateTexture(key, 64, 64);
      gg.destroy();
    };
    mkTile('exp-tile-far', 0x1a1528, 0x2d2440);
    mkTile('exp-tile-near', 0x120e18, 0x1f1a2a);

    this.layerFar = this.add
      .tileSprite(0, 0, width + 64, height, 'exp-tile-far')
      .setOrigin(0, 0);
    this.layerNear = this.add
      .tileSprite(0, height * 0.55, width + 64, height * 0.5, 'exp-tile-near')
      .setOrigin(0, 0);

    const g = this.add.graphics();
    g.fillStyle(0x2a2038, 1);
    g.fillRect(0, height * 0.72, width, height * 0.28);
    g.fillStyle(0x1f1828, 1);
    g.fillRect(0, height * 0.78, width, 4);

    this.skeletonGroup = this.add.group();

    for (let i = 0; i < 6; i += 1) {
      const sk = this.#makeSkeleton(width * 0.12 + i * 22, height * 0.62 + (i % 2) * 3);
      sk.setData('phase', i * 0.4);
      this.skeletonGroup.add(sk);
    }

    this.scale.on('resize', () => this.#layout());

    window.addEventListener('necro-expedition-sync', this._onSync);

    this.events.once('shutdown', () => {
      window.removeEventListener('necro-expedition-sync', this._onSync);
    });
  }

  #layout() {
    const { width, height } = this.scale;
    if (this.layerFar) {
      this.layerFar.setSize(width + 64, height);
    }
    if (this.layerNear) {
      this.layerNear.setPosition(0, height * 0.55);
      this.layerNear.setSize(width + 64, height * 0.5);
    }
  }

  /**
   * @param {number} x
   * @param {number} y
   */
  #makeSkeleton(x, y) {
    const c = this.add.container(x, y);
    const body = this.add.rectangle(0, 0, 10, 14, 0x39ff14, 1).setStrokeStyle(1, 0x9b59b6);
    const head = this.add.rectangle(0, -12, 8, 8, 0x7b1fa2, 1).setStrokeStyle(1, 0x39ff14);
    c.add(head);
    c.add(body);
    c.setDepth(5);
    return c;
  }

  /**
   * @param {boolean} won
   */
  #spawnVillager(won) {
    const { width, height } = this.scale;
    const pal = 0xc8b8a8;
    const vill = this.add.container(width + 24, height * 0.62);
    const body = this.add.rectangle(0, 0, 9, 13, pal, 0.92).setStrokeStyle(1, 0x9a9088);
    const head = this.add.rectangle(0, -11, 7, 7, 0xe8dcc8, 0.88).setStrokeStyle(1, 0xb0a090);
    vill.add(body);
    vill.add(head);
    vill.setDepth(8);

    this.tweens.add({
      targets: vill,
      x: width * 0.42,
      duration: 520,
      ease: 'Quad.easeIn',
      onComplete: () => {
        if (won) {
          this.tweens.add({
            targets: vill,
            alpha: 0,
            y: vill.y - 20,
            duration: 220,
            onComplete: () => vill.destroy(),
          });
          for (let i = 0; i < 7; i += 1) {
            const px = vill.x + (Math.random() - 0.5) * 16;
            const py = vill.y - 8 + (Math.random() - 0.5) * 10;
            const dot = this.add.rectangle(px, py, 3, 3, i % 2 ? 0x39ff14 : 0x9b59b6);
            dot.setDepth(20);
            this.tweens.add({
              targets: dot,
              x: px + (Math.random() - 0.5) * 50,
              y: py - 30 - Math.random() * 20,
              alpha: 0,
              duration: 320 + Math.random() * 120,
              onComplete: () => dot.destroy(),
            });
          }
        } else {
          this.cameras.main.flash(180, 80, 20, 20, false);
          this.tweens.add({
            targets: vill,
            x: vill.x + 40,
            duration: 400,
            onComplete: () => vill.destroy(),
          });
        }
      },
    });
  }

  /**
   * @param {CustomEvent} e
   */
  #handleSync(e) {
    const d = /** @type {any} */ (e.detail);
    if (!d) return;
    this.running = Boolean(d.running);
    if (d.encounter) {
      this.#spawnVillager(Boolean(d.encounter.won));
    }
  }

  update(_t, dtMs) {
    if (!this.layerFar || !this.layerNear) return;
    const dt = dtMs / 1000;
    if (this.running) {
      this.layerFar.tilePositionX += 12 * dt;
      this.layerNear.tilePositionX += 28 * dt;
    }

    const sk = this.skeletonGroup;
    if (sk && this.running) {
      sk.getChildren().forEach((ch) => {
        const ph = ch.getData('phase') ?? 0;
        ch.x += 18 * dt;
        ch.y += Math.sin((this.time.now / 200 + ph) * 1.7) * 0.35;
        const { width } = this.scale;
        if (ch.x > width + 20) ch.x = -30;
      });
    }
  }
}
