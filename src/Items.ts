import { config } from "./config";
import { MainScene } from "./scenes/mainScene";
import { Waypoint } from "./Waypoint";

export class EventItem extends Phaser.GameObjects.Container {

    constructor(scene: MainScene, x: number, y: number, waypoint: Waypoint) {
        super(scene, x, y);
    }
}

export class EventStar extends Phaser.GameObjects.Container {
    g_star: Phaser.GameObjects.Image;
    name = 'stars';

    constructor(scene: MainScene, x: number, y: number) {
        super(scene, x, y);
        this.add(
            this.g_star = new Phaser.GameObjects.Image(this.scene, 0, 0, 'stars')
        );
        this.g_star.setScale(0.5);
        this.scene.tweens.add({
            targets: this.g_star,
            angle: 360,
            duration: 4000,
            repeat: -1,
        })
    }
}

export class EventBone extends EventItem {
    g_bone: Phaser.GameObjects.Image;
    name = 'event_bone';

    constructor(scene: MainScene, x: number, y: number, waypoint: Waypoint) {
        super(scene, x, y, waypoint);
        this.add(
            this.g_bone = new Phaser.GameObjects.Image(this.scene, config.cellWidth / 2, config.cellHeight / 2, 'event_bone')
        );
        this.g_bone.setOrigin(0.5, 0.7);
        this.scene.tweens.add({
            targets: this.g_bone,
            alpha: 0.5,
            duration: config.items.boneDuration,
            onComplete: () => scene.clearItems(waypoint.id)
        });
    }
}


export class EventPolice extends EventItem {
    g_police: Phaser.GameObjects.Image;
    name = 'event_police';

    constructor(scene: MainScene, x: number, y: number, waypoint: Waypoint) {
        super(scene, x, y, waypoint);
        this.add(
            this.g_police = new Phaser.GameObjects.Image(this.scene, config.cellWidth / 2, config.cellHeight / 2, 'event_police')
        );
        this.g_police.setOrigin(0.5, 0.9);
        this.scene.tweens.add({
            targets: this.g_police,
            alpha: 0.5,
            duration: config.items.policeDuration,
            onComplete: () => scene.clearItems(waypoint.id)
        });
    }
}


export class EventTeen extends EventItem {
    g_teen: Phaser.GameObjects.Image;
    name = 'event_teen';

    constructor(scene: MainScene, x: number, y: number, waypoint: Waypoint) {
        super(scene, x, y, waypoint);
        this.add(
            this.g_teen = new Phaser.GameObjects.Image(this.scene, config.cellWidth / 2, config.cellHeight / 2, 'event_teen')
        );
        this.g_teen.setOrigin(0.5, 0.9);
        this.scene.tweens.add({
            targets: this.g_teen,
            alpha: 0.5,
            duration: config.items.teenDuration,
            onComplete: () => scene.clearItems(waypoint.id)
        });
    }
}

export class EventCat extends EventItem {
    g_cat: Phaser.GameObjects.Image;
    name = 'event_cat';

    constructor(scene: MainScene, x: number, y: number, waypoint: Waypoint) {
        super(scene, x, y, waypoint);
        this.add(
            this.g_cat = new Phaser.GameObjects.Image(this.scene, config.cellWidth / 2, config.cellHeight / 2, 'event_cat')
        );
        this.g_cat.setOrigin(0.5, 0.7);
        this.scene.tweens.add({
            targets: this.g_cat,
            alpha: 0.5,
            duration: config.items.catDuration,
            onComplete: () => scene.clearItems(waypoint.id)
        });
    }
}

export class EventMan extends EventItem {
    g_man: Phaser.GameObjects.Image;
    name = 'event_man';

    constructor(scene: MainScene, x: number, y: number, waypoint: Waypoint) {
        super(scene, x, y, waypoint);
        this.add(
            this.g_man = new Phaser.GameObjects.Image(this.scene, config.cellWidth / 2, config.cellHeight / 2, 'event_man')
        );
        this.g_man.setOrigin(0.5, 0.7);
        this.scene.tweens.add({
            targets: this.g_man,
            alpha: 0.5,
            duration: config.items.catDuration,
            onComplete: () => scene.clearItems(waypoint.id)
        });
    }
}