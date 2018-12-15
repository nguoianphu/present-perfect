
type Pointer = Phaser.Input.Pointer;
type GameObject = Phaser.GameObjects.GameObject;
const Vector2 = Phaser.Math.Vector2;
import { EventContext, defaultTextStyle, compareNumber } from './Utils';
import { config } from './config';

export class Waypoint extends Phaser.GameObjects.Container {
    public id: integer;
    public cellX: number;
    public cellY: number;
    public connectsList: number[] = [];
    public g_connectorGroup: Phaser.GameObjects.Container;
    public debugColor: number; // color hex number


    constructor(scene: Phaser.Scene, id: integer, cellX: number, cellY: number, connects: number[] = [], children: GameObject[] = []) {
        super(scene, cellX, cellY);
        this.id = id;
        this.cellX = cellX;
        this.cellY = cellY;
        this.connectsList = connects;
        this.debugColor = (<Phaser.Display.Color>(<any>new Phaser.Display.Color()).random()).color;

        this.x = cellX * config.cellWidth;
        this.y = cellY * config.cellHeight;

        this.g_connectorGroup = new Phaser.GameObjects.Container(scene, 0, 0);
        this.add(this.g_connectorGroup);

        this.add(new WaypointGraphics(scene, this.debugColor, config.cellWidth / 2, config.cellHeight / 2));
        this.add(new Phaser.GameObjects.Text(scene, config.cellWidth / 2, config.cellHeight / 2, '' + this.id, defaultTextStyle));
        // this.add(children);
        this.setVisible(config.debug.showWaypoint);
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

    toYaml() {
        return (`- id: ${this.id}`
            + `\n  cellX: ${this.cellX}`
            + `\n  cellY: ${this.cellY}`
            + `\n  connects: [${this.connectsList.sort(compareNumber).join(', ')}]`
            + ``);
    }

    updateConnectionsDebug(waypointlist: Waypoint[]) {
        this.g_connectorGroup.removeAll(true);
        this.connectsList.forEach(neighbourID => {
            const neighbour = waypointlist[neighbourID];
            const lineGraphics = new Phaser.GameObjects.Graphics(this.scene, {
                x: config.cellWidth / 2, y: config.cellHeight / 2,
                fillStyle: { color: this.debugColor, alpha: 1 },
                lineStyle: { width: 5, color: this.debugColor, alpha: 1 },
            });
            let delta = new Vector2(neighbour.x - this.x, neighbour.y - this.y);
            delta.scale(0.5);
            lineGraphics.lineBetween(0, 0, delta.x, delta.y);

            this.g_connectorGroup.add(lineGraphics);
        })
    }
}



export class WaypointGraphics extends Phaser.GameObjects.Graphics {
    fillRoundedRect: (x: number, y: number, w: number, h: number, r: number | { tl: number, tr: number, bl: number, br: number }) => this;
    strokeRoundedRect: (x: number, y: number, w: number, h: number, r: number | { tl: number, tr: number, bl: number, br: number }) => this;

    w: number; h: number;
    debugColor:number;

    constructor(scene: Phaser.Scene, debugColor:number, x: number, y: number) {
        super(scene, {
            x, y,
            fillStyle: { color: debugColor, alpha: 1 },
            lineStyle: { width: 1, color: debugColor, alpha: 1 },
        });
        this.debugColor = debugColor;

        this.drawDot()

        // this.setInteractive(new Phaser.Geom.Rectangle(0, 0, w, h), Phaser.Geom.Rectangle.Contains);
    }

    drawDot() {
        this.clear();

        // const color = (<Phaser.Display.Color>(<any>new Phaser.Display.Color()).random()).color;
        // this.fillStyle(color, 1);
        this.fillCircle(0, 0, 10);
    }
}
