import { config } from "./config";

export class Smoke extends Phaser.GameObjects.Container {
    g_smoke: Phaser.GameObjects.Image;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);
        const gap = config.ui.buttonGap;
        this.add(
            this.g_smoke = new Phaser.GameObjects.Image(this.scene, config.cellWidth / 2, config.cellHeight / 2, 'smoke')
        );
        this.scene.tweens.add({
            targets: this.g_smoke,
            alpha: 0,
            duration: 1000,
            onComplete: () => { this.destroy(); },
        })
    }
}