
type Pointer = Phaser.Input.Pointer;
type GameObject = Phaser.GameObjects.GameObject;
import { EventContext, defaultTextStyle } from './Utils';
import { config } from './config';
import { Waypoint } from './Waypoint';
import { MainScene } from './scenes/mainScene';

export class Girl extends Phaser.GameObjects.Container {
    public cellX: number;
    public cellY: number;

    private g_predictGroup: Phaser.GameObjects.Container;
    private g_girlGraphic: Phaser.GameObjects.Image;
    private g_girlFoot: GirlFoot;
    private g_debugText: Phaser.GameObjects.Text;

    public wayPoints: number[] = [];
    public isMoving: boolean;
    public predictColor = 0xFF69B4;

    public scene: MainScene;
    private movementTween: Phaser.Tweens.Timeline;

    constructor(scene: Phaser.Scene, cellX: number, cellY: number, g_predictGroup: Phaser.GameObjects.Container, children: GameObject[] = []) {
        super(scene, cellX, cellY);

        this.g_predictGroup = g_predictGroup;
        this.wayPoints = [this.scene.g_waypointMatrix[cellX][cellY].id];
        this.setCellPosition(cellX, cellY);


        this.isMoving = false;

        this.g_girlGraphic = new Phaser.GameObjects.Image(scene, config.cellWidth / 2, config.cellHeight / 2, 'girl');
        this.g_girlGraphic.setOrigin(0.5, 0.94);
        this.add(this.g_girlGraphic);

        this.g_girlFoot = new GirlFoot(scene, config.cellWidth / 2, config.cellHeight / 2);
        this.g_girlFoot.setVisible(config.debug.showGirlFoot);
        this.add(this.g_girlFoot);

        this.g_debugText = new Phaser.GameObjects.Text(scene, config.cellWidth / 2, config.cellHeight / 2, '', defaultTextStyle)
        this.g_debugText.setVisible(config.debug.showGirlFoot);
        this.add(this.g_debugText);
        // this.add(children);
    }

    setCellPosition(cellX: number, cellY: number): this {
        this.cellX = cellX;
        this.cellY = cellY;
        this.x = cellX * config.cellWidth + config.cellOffsetX;
        this.y = cellY * config.cellHeight + config.cellOffsetY;
        return this;
    }

    setWaypointAndMove(waypointID: number): this {
        // console.log('setWaypointAndMove', waypointID, this.wayPoints);

        let posID;
        if (this.isMoving) {
            this.wayPoints = [this.wayPoints[0], this.wayPoints[1]];
            posID = this.wayPoints[1];
        } else {
            this.wayPoints = [this.wayPoints[0]];
            posID = this.wayPoints[0];
        }
        const { route, totalDist } = this.scene.getWaypoints(posID, waypointID);
        this.pushWaypoints(route);
        this.tryStartMoving();
        return this;
    }

    pushWaypoints(waypointIDs: number[]): this {
        this.wayPoints = this.wayPoints.concat(waypointIDs);
        // console.log('pushWaypoints', this.wayPoints);

        return this;
    }

    tryStartMoving() {
        if (this.isMoving) {
            console.warn('Girl is already moving');
            return;
        }

        if (this.wayPoints.length > 1) {
            this.moveToWaypoint(this.scene.g_waypointList[this.wayPoints[0]], this.scene.g_waypointList[this.wayPoints[1]]);
            this.scene.drawWaypoints(this.wayPoints.slice(), null, this.predictColor, this.g_predictGroup);
        }
    }

    moveToWaypoint(fromWaypoint: Waypoint, toWaypoint: Waypoint): this {
        const duration = fromWaypoint.distanceMap[toWaypoint.id].dist * 1000 / config.girl.speed;

        const swing = 2.5;
        const hop = 10
        this.g_girlGraphic.setAngle(-swing);
        this.movementTween = this.scene.tweens.timeline({
            duration,
            tweens: [
                {
                    targets: this,
                    x: toWaypoint.x,
                    y: toWaypoint.y,
                    offset: 0,
                },
                {
                    targets: this.g_girlGraphic,
                    y: config.cellHeight / 2 - hop,
                    yoyo: true,
                    duration: 100,
                    repeat: Math.max(1, duration / 100 / 2 - 1),
                    offset: 0,
                },
                {
                    targets: this.g_girlGraphic,
                    angle: swing,
                    yoyo: true,
                    duration: 100,
                    repeat: Math.max(1, duration / 100 / 2 - 1),
                    offset: 0,
                },
            ],
            onComplete: () => {
                this.g_girlGraphic.setAngle(0);
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
        // console.log('onWaypointArrived', this.wayPoints);
        this.scene.drawWaypoints(this.wayPoints.slice(), null, this.predictColor, this.g_predictGroup);
        if (this.wayPoints.length > 1) {
            this.moveToWaypoint(this.scene.g_waypointList[this.wayPoints[0]], this.scene.g_waypointList[this.wayPoints[1]]);
        } else {
            this.scene.time.addEvent({
                delay: 3000,
                callback: () => {
                    this.wander();
                },
            })
        }
    }

    wander() {
        const waypoint = Phaser.Math.RND.pick(this.scene.g_namedWaypointList);
        this.setWaypointAndMove(waypoint.id);
    }

    toString() {
        return `Girl ${this.cellX},${this.cellY}`;
    }
}



export class GirlFoot extends Phaser.GameObjects.Graphics {
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
