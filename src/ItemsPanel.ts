
type Pointer = Phaser.Input.Pointer;
type GameObject = Phaser.GameObjects.GameObject;
type Vector2 = Phaser.Math.Vector2;


const Vector2 = Phaser.Math.Vector2;
import { EventContext, defaultTextStyle, compareNumber } from './Utils';
import { config } from './config';

export class ItemPanel extends Phaser.GameObjects.Container {
    callback: (itemName: string) => void;
    buttons: ItemButton[];

    constructor(scene: Phaser.Scene, x: number, y: number, callback: (itemName: string) => void, children: GameObject[] = []) {
        super(scene, x, y);
        const gap = config.ui.buttonGap;
        this.add(this.buttons = config.ui.buttons
            .map((itemName, i) => {
                return new ItemButton(this.scene,
                    itemName,
                    (config.ui.buttonW + gap) * i,
                    0,
                    config.ui.buttonW,
                    config.ui.buttonH,
                    this.onButtonPressed
                );
            })
        );
        this.callback = callback;
    }

    onButtonPressed = (itemName: string) => {
        console.log('onButtonPressed', itemName);
        this.callback(itemName);
    }

    setButtonActive(itemName: string, val: boolean) {
        const btn = this.buttons.find(btn => btn.itemName === itemName);
        if (btn != null) btn.setOnUse(val);
        this.buttons.filter(btn => btn.itemName !== itemName)
            .forEach((btn) => btn.setOnUse(false));
    }


    toString() {
        // return `${this.cellX},${this.cellY}`;
    }

    toYaml() {
        return (``);
    }
}



export class ItemButton extends Phaser.GameObjects.Container {
    public g_icon: Phaser.GameObjects.Image;
    public callback: (itemName: string) => void;
    public itemName: string;
    bounceLoop: Phaser.Tweens.Tween;

    constructor(scene: Phaser.Scene, itemName: string, x: number, y: number, w: number, h: number, callback: (itemName: string) => void) {
        super(scene, x, y);
        this.width = w;
        this.height = h;
        this.itemName = itemName;
        this.callback = callback;
        this.drawCircle(itemName);

        this.bounceLoop = this.scene.tweens.add({
            targets: this.g_icon,
            y: '+=5',
            duration: 200,
            yoyo: true,
            repeat: -1,
            paused: true,
        })
    }

    setOnUse(val: boolean) {
        this.g_icon.y = 0;
        if (val) {
            this.bounceLoop.restart();
        } else {
            this.bounceLoop.stop();
        }
    }

    drawCircle(itemName: string) {
        this.g_icon = new Phaser.GameObjects.Image(this.scene, 0, 0, itemName);
        (this.g_icon
            .setOrigin(0.5)
        );
        var shape = new Phaser.Geom.Circle(this.width / 2, this.height / 2, this.width / 2);
        this.g_icon.setInteractive(shape, Phaser.Geom.Circle.Contains);


        this.g_icon.on('pointerover', (pointer: Pointer) => {
            this.g_icon.setTint(0xfffc96);
        });

        this.g_icon.on('pointerout', (pointer: Pointer) => {
            this.g_icon.clearTint();
        });

        this.g_icon.on('pointerdown', (pointer: Pointer) => {
            this.g_icon.setTint(0x919081);
        });

        this.g_icon.on('pointerup', (pointer: Pointer, eventX: number, eventY: number, evt: EventContext) => {
            this.g_icon.clearTint();
            this.callback(this.itemName);
        });
        this.add(this.g_icon);
    }
}




export class NamedWaypointGraphics extends Phaser.GameObjects.Graphics {
    fillRoundedRect: (x: number, y: number, w: number, h: number, r: number | { tl: number, tr: number, bl: number, br: number }) => this;
    strokeRoundedRect: (x: number, y: number, w: number, h: number, r: number | { tl: number, tr: number, bl: number, br: number }) => this;

    w: number; h: number;
    debugColor: number;

    constructor(scene: Phaser.Scene, debugColor: number, x: number, y: number) {
        super(scene, {
            x, y,
            fillStyle: { color: debugColor, alpha: 1 },
            lineStyle: { width: 5, color: debugColor, alpha: 1 },
        });
        this.debugColor = debugColor;

        this.drawDot()

        // this.setInteractive(new Phaser.Geom.Rectangle(0, 0, w, h), Phaser.Geom.Rectangle.Contains);
    }

    drawDot() {
        this.clear();

        // const color = (<Phaser.Display.Color>(<any>new Phaser.Display.Color()).random()).color;
        // this.fillStyle(color, 1);
        this.strokeCircle(0, 0, 15);
    }
}

