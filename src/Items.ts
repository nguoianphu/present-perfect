import { config } from "./config";
import { MainScene } from "./scenes/mainScene";

export class EventItem extends Phaser.GameObjects.Container {

    constructor(scene: MainScene, x: number, y: number) {
        super(scene, x, y);
    }
}

export class EventStar extends Phaser.GameObjects.Container {
    g_star: Phaser.GameObjects.Image;
    name = 'stars';

    constructor(scene: MainScene, x: number, y: number) {
        super(scene, x, y);
        const gap = config.ui.buttonGap;
        this.add(
            this.g_star = new Phaser.GameObjects.Image(this.scene, 0, 0, 'stars')
        );
        this.g_star.setScale(0.5);
    }
}

export class EventBone extends EventItem {
    g_bone: Phaser.GameObjects.Image;
    name = 'event_bone';

    constructor(scene: MainScene, x: number, y: number) {
        super(scene, x, y);
        const gap = config.ui.buttonGap;
        this.add(
            this.g_bone = new Phaser.GameObjects.Image(this.scene, config.cellWidth / 2, config.cellHeight / 2, 'event_bone')
        );
        this.g_bone.setOrigin(0.5, 0.7);
    }
}


export class EventPolice extends EventItem {
    g_police: Phaser.GameObjects.Image;
    name = 'event_police';

    constructor(scene: MainScene, x: number, y: number) {
        super(scene, x, y);
        const gap = config.ui.buttonGap;
        this.add(
            this.g_police = new Phaser.GameObjects.Image(this.scene, config.cellWidth / 2, config.cellHeight / 2, 'event_police')
        );
        this.g_police.setOrigin(0.5, 0.9);
    }
}
