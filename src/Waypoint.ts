
type Pointer = Phaser.Input.Pointer;
type GameObject = Phaser.GameObjects.GameObject;
import { EventContext, defaultTextStyle } from './Utils';
import { config } from './config';

export class Waypoint extends Phaser.GameObjects.Container {
    public id: integer;
    public cellX: number;
    public cellY: number;

    constructor(scene: Phaser.Scene, id: integer, cellX: number, cellY: number, children: GameObject[] = []) {
        super(scene, cellX, cellY);
        this.id = id;
        this.cellX = cellX;
        this.cellY = cellY;

        this.x = cellX * config.cellWidth;
        this.y = cellY * config.cellHeight;
        this.add(new WaypointGraphics(scene, config.cellWidth / 2, config.cellHeight / 2));
        this.add(new Phaser.GameObjects.Text(scene, config.cellWidth / 2, config.cellHeight / 2, '' + this.id, defaultTextStyle));
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
        // return `${this.cellX},${this.cellY}`;
        return `${this.id}`;
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
