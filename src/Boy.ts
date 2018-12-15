
type Pointer = Phaser.Input.Pointer;
type GameObject = Phaser.GameObjects.GameObject;
import { EventContext, defaultTextStyle } from './Utils';
import { config } from './config';
import { Waypoint } from './Waypoint';
import { MainScene } from './scenes/mainScene';

export class Boy extends Phaser.GameObjects.Container {
    public cellX: number;
    public cellY: number;

    private g_boyGraphic: Phaser.GameObjects.Graphics;
    private g_boyFoot: BoyFoot;
    private g_debugText: Phaser.GameObjects.Text;

    public wayPoints: number[] = [];
    public isMoving: boolean;

    public scene: MainScene;
    public speed: number = 10;

    constructor(scene: Phaser.Scene, cellX: number, cellY: number, children: GameObject[] = []) {
        super(scene, cellX, cellY);
        
        this.wayPoints = [this.scene.g_waypointMatrix[cellX][cellY].id];
        this.setCellPosition(cellX, cellY);


        this.isMoving = false;

        this.g_boyGraphic = new Phaser.GameObjects.Graphics(scene, {
            x: config.cellWidth / 2, y: config.cellHeight / 2,
            fillStyle: { color: 0xfcfcf9, alpha: 1 },
            lineStyle: { width: 1, color: 0xAAAAAA, alpha: 1 },
        });

        const color = (<Phaser.Display.Color>(<any>new Phaser.Display.Color()).random()).color;
        this.g_boyGraphic.fillStyle(color, 1);
        this.g_boyGraphic.fillRect(-20, -64, 40, 64);
        this.g_boyGraphic.setAlpha(0.8);
        this.add(this.g_boyGraphic);

        this.g_boyFoot = new BoyFoot(scene, config.cellWidth / 2, config.cellHeight / 2);
        this.g_boyFoot.setVisible(config.debug.showBoyFoot);
        this.add(this.g_boyFoot);

        this.g_debugText = new Phaser.GameObjects.Text(scene, config.cellWidth / 2, config.cellHeight / 2, '', defaultTextStyle)
        this.g_debugText.setVisible(config.debug.showBoyFoot);
        this.add(this.g_debugText);
        // this.add(children);
    }

    setCellPosition(cellX: number, cellY: number): this {
        this.cellX = cellX;
        this.cellY = cellY;
        this.x = cellX * config.cellWidth;
        this.y = cellY * config.cellHeight;
        return this;
    }

    pushWaypoints(waypointIDs: number[]): this {
        this.wayPoints = this.wayPoints.concat(waypointIDs);
        return this;
    }

    tryStartMoving() {
        if (this.isMoving) throw 'Boy is already moving';

        if (this.wayPoints.length > 1) {
            this.moveToWaypoint(this.scene.g_waypointList[this.wayPoints[0]], this.scene.g_waypointList[this.wayPoints[1]]);
        }
    }

    moveToWaypoint(fromWaypoint: Waypoint, toWaypoint: Waypoint): this {
        this.scene.tweens.add({
            targets: this,
            x: toWaypoint.x,
            y: toWaypoint.y,
            duration: fromWaypoint.distanceMap[toWaypoint.id].dist * 1000 / this.speed,
            onComplete: () => {
                this.onWaypointArrived(fromWaypoint.id, toWaypoint.id);
            },
        });
        this.isMoving = true;
        return this;
    }

    onWaypointArrived(from: number, to: number) {
        const toWaypoint = this.scene.g_waypointList[to];
        this.setCellPosition(toWaypoint.cellX, toWaypoint.cellY);
        this.isMoving = false;
        this.wayPoints.shift();
        if (this.wayPoints.length > 1) {
            this.moveToWaypoint(this.scene.g_waypointList[this.wayPoints[0]], this.scene.g_waypointList[this.wayPoints[1]]);
        }
    }

    toString() {
        return `Boy ${this.cellX},${this.cellY}`;
    }
}



export class BoyFoot extends Phaser.GameObjects.Graphics {
    fillRoundedRect: (x: number, y: number, w: number, h: number, r: number | { tl: number, tr: number, bl: number, br: number }) => this;
    strokeRoundedRect: (x: number, y: number, w: number, h: number, r: number | { tl: number, tr: number, bl: number, br: number }) => this;

    w: number; h: number;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, {
            x, y,
            fillStyle: { color: 0xfcfcf9, alpha: 1 },
            lineStyle: { width: 2, color: 0xAAAAAA, alpha: 1 },
        });


        this.drawDot()

        // this.setInteractive(new Phaser.Geom.Rectangle(0, 0, w, h), Phaser.Geom.Rectangle.Contains);
    }

    drawDot() {
        this.clear();

        const color = (<Phaser.Display.Color>(<any>new Phaser.Display.Color()).random()).color;
        this.lineStyle(2, color, 1);
        this.strokeCircle(0, 0, 20);
    }
}
