
type Pointer = Phaser.Input.Pointer;
type GameObject = Phaser.GameObjects.GameObject;
import { EventContext } from './Utils';
import { config } from './config';

export class Waypoint extends Phaser.GameObjects.Container {
    public cellX: number;
    public cellY: number;

    constructor(scene: Phaser.Scene, cellX: number, cellY: number, children: GameObject[] = []) {
        super(scene, cellX, cellY);
        this.cellX = cellX;
        this.cellY = cellY;

        this.x = cellX * config.cellWidth;
        this.y = cellY * config.cellHeight;
        this.add(new WaypointGraphics(scene, 0, 0));
        // this.add(children);
    }

    setCellPosition(cellX: number, cellY: number): this {
        this.cellX = cellX;
        this.cellY = cellY;
        this.x = cellX * config.cellWidth;
        this.y = cellY * config.cellHeight;
        return this;
    }

    toString() {
        return `${this.cellX},${this.cellY}`;
    }
}



export class WaypointGraphics extends Phaser.GameObjects.Graphics {
    fillRoundedRect: (x: number, y: number, w: number, h: number, r: number | { tl: number, tr: number, bl: number, br: number }) => this;
    strokeRoundedRect: (x: number, y: number, w: number, h: number, r: number | { tl: number, tr: number, bl: number, br: number }) => this;

    w: number; h: number;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, {
            x, y,
            fillStyle: { color: 0xfcfcf9, alpha: 1 },
            lineStyle: { width: 1, color: 0xAAAAAA, alpha: 1 },
        });


        this.drawDot()

        // this.setInteractive(new Phaser.Geom.Rectangle(0, 0, w, h), Phaser.Geom.Rectangle.Contains);
    }

    drawDot() {
        this.clear();

        const color = (<Phaser.Display.Color>(<any>new Phaser.Display.Color()).random()).color;
        this.fillStyle(color, 1);
        this.fillCircle(0, 0, 10);
    }
}
