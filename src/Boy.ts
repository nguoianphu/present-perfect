
type Pointer = Phaser.Input.Pointer;
type GameObject = Phaser.GameObjects.GameObject;
import { EventContext, defaultTextStyle, compareNumber } from './Utils';
import { config } from './config';
import { Waypoint } from './Waypoint';
import { MainScene } from './scenes/mainScene';
import * as Debug from 'debug';
import { Utils } from 'phaser';
import { ManSmoke } from './Smoke';

const log = Debug('Present:Boy');

export class Boy extends Phaser.GameObjects.Container {
    public cellX: number;
    public cellY: number;

    private g_predictGroup: Phaser.GameObjects.Container;
    private g_boyContainer: Phaser.GameObjects.Container;
    private g_boyFoot: BoyFoot;
    private g_debugText: Phaser.GameObjects.Text;

    public wayPoints: number[] = [];
    public canMove: boolean = true;
    public isMoving: boolean;
    public predictColor = 0x69d7ff;
    public currentEdge = '';

    public scene: MainScene;
    private movementTween: Phaser.Tweens.Timeline = null;

    public mode: string = 'none';
    public manPower: integer = 0;

    constructor(scene: Phaser.Scene, cellX: number, cellY: number, g_predictGroup: Phaser.GameObjects.Container, bchildren: GameObject[] = []) {
        super(scene, cellX, cellY);


        this.g_predictGroup = g_predictGroup;
        this.wayPoints = [this.scene.g_waypointMatrix[cellX][cellY].id];
        this.setCellPosition(cellX, cellY);


        this.isMoving = false;

        this.g_boyContainer = new Phaser.GameObjects.Container(this.scene, config.cellWidth / 2, config.cellHeight / 2);
        this.add(this.g_boyContainer);

        this.g_boyFoot = new BoyFoot(scene, config.cellWidth / 2, config.cellHeight / 2);
        this.g_boyFoot.setVisible(config.debug.showBoyFoot);
        this.add(this.g_boyFoot);

        this.g_debugText = new Phaser.GameObjects.Text(scene, config.cellWidth / 2, config.cellHeight / 2, '', defaultTextStyle)
        this.g_debugText.setVisible(config.debug.showBoyFoot);
        this.add(this.g_debugText);
        // this.add(children);

        this.updateFace();
    }

    updateFace() {
        let g_boy: Phaser.GameObjects.Image;
        log('updateFace ' + this.mode);
        switch (this.mode) {
            case 'none':
                this.g_boyContainer.removeAll(true);
                this.g_boyContainer.add(
                    g_boy = new Phaser.GameObjects.Image(this.scene, 0, 0, 'boy')
                );
                g_boy.setOrigin(0.5, 0.9);
                break;
            case 'police_boy':
                let g_police: Phaser.GameObjects.Image;
                this.g_boyContainer.removeAll(true);
                this.g_boyContainer.add([
                    g_police = new Phaser.GameObjects.Image(this.scene, 0, 0, 'event_police'),
                    g_boy = new Phaser.GameObjects.Image(this.scene, -40, -30, 'boy'),
                ]);
                g_police.setOrigin(0.5, 0.9);
                g_boy.setOrigin(0.5, 0.5).setScale(0.9).setAngle(45);
                break;
            case 'man_boy':
                let g_man: Phaser.GameObjects.Image;
                this.g_boyContainer.removeAll(true);
                this.g_boyContainer.add([
                    g_man = new Phaser.GameObjects.Image(this.scene, 30, 0, 'event_man'),
                    g_boy = new Phaser.GameObjects.Image(this.scene, -30, 0, 'boy'),
                ]);
                g_man.setOrigin(0.5, 0.9);
                g_boy.setOrigin(0.5, 0.9);
                break;
            case 'scared_boy':
                this.g_boyContainer.removeAll(true);
                this.g_boyContainer.add(
                    g_boy = new Phaser.GameObjects.Image(this.scene, 0, -40, 'boy')
                );
                g_boy.setOrigin(0.5, 0.5);
                this.scene.tweens.add({
                    targets: g_boy,
                    angle: '+=360',
                    duration: 500,
                    repeat: -1,
                })
                break;

            case 'bus_boy':
                let g_bus: Phaser.GameObjects.Image;
                this.g_boyContainer.removeAll(true);
                this.g_boyContainer.add([
                    g_bus = new Phaser.GameObjects.Image(this.scene, 0, 0, 'event_bus_left_boy'),
                ]);
                g_bus.setOrigin(0.5, 0.9);
                break;
        }
    }

    setCellPosition(cellX: number, cellY: number): this {
        this.cellX = cellX;
        this.cellY = cellY;
        this.x = cellX * config.cellWidth + config.cellOffsetX;
        this.y = cellY * config.cellHeight + config.cellOffsetY;
        return this;
    }

    setWaypointAndMove(waypointID: number): this {
        log('setWaypointAndMove', waypointID, this.wayPoints);

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
        log('pushWaypoints', this.wayPoints);

        return this;
    }

    tryStartMoving() {
        if (this.isMoving) {
            console.warn('Boy is already moving');
            return;
        }

        if (this.wayPoints.length > 1) {
            this.moveToWaypoint(this.scene.g_waypointList[this.wayPoints[0]], this.scene.g_waypointList[this.wayPoints[1]]);
            this.scene.drawWaypoints(this.wayPoints.slice(), null, this.predictColor, this.g_predictGroup);
        }
    }

    moveToWaypoint(fromWaypoint: Waypoint, toWaypoint: Waypoint): this {
        let speed = config.boy.speed;
        switch (this.mode) {
            case 'police_boy':
                speed = config.boy.mode.policeSpeed;
                break;
            case 'bus_boy':
                speed = config.boy.mode.busSpeed;
                break;
            case 'man_boy':
                speed = config.boy.mode.manSpeed;
                break;

        }

        const duration = fromWaypoint.distanceMap[toWaypoint.id].dist * 1000 / speed;

        const swing = 2.5;
        const hop = 10

        this.currentEdge = [fromWaypoint.id, toWaypoint.id].join(',');
        this.g_boyContainer.setAngle(-swing);
        if (this.movementTween) {
            this.movementTween.stop();
        }
        this.movementTween = this.scene.tweens.timeline({
            duration,
            tweens: [
                {
                    targets: this,
                    x: toWaypoint.x,
                    y: toWaypoint.y,
                    offset: 0,
                    ease: 'Linear',
                },
                {
                    targets: this.g_boyContainer,
                    y: config.cellHeight / 2 - hop,
                    yoyo: true,
                    duration: 100,
                    repeat: Math.floor(Math.max(1, duration / 100 / 2)),
                    offset: 0,
                },
                {
                    targets: this.g_boyContainer,
                    angle: swing,
                    yoyo: true,
                    duration: 100,
                    repeat: Math.max(1, duration / 100 / 2 - 1),
                    offset: 0,
                },
            ],
            onComplete: () => {
                this.g_boyContainer.setAngle(0);

                this.currentEdge = [toWaypoint.id].join(',');
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

        log('onWaypointArrived A', [from, to], toWaypoint);
        this.wayPoints.shift();

        log('onWaypointArrived collision', this.mode, toWaypoint.items);
        switch (this.mode) {
            case 'none':
                if (this.scene.girl.isAtWaypoint(toWaypoint.id)) {
                    this.scene.endGame();
                }
                if (toWaypoint.items.length > 0) {
                    toWaypoint.items.forEach((item) => {
                        switch (item.name) {
                            case 'event_police':
                                this.mode = 'police_boy';
                                this.updateFace();
                                const policeStation = this.scene.g_namedWaypointList.find(w => w.name === 'police station');
                                this.scene.clearItems(toWaypoint.id);
                                this.setWaypointAndMove(policeStation.id);
                                return;
                                break;
                            case 'event_man':
                                this.mode = 'man_boy';
                                this.manPower = 2;
                                this.updateFace();
                                const girlWaypointID = this.scene.girl.wayPoints[0];
                                this.scene.clearItems(toWaypoint.id);
                                this.setWaypointAndMove(girlWaypointID);
                                return;
                                break;
                            case 'event_bone':
                                this.mode = 'scared_boy';
                                this.updateFace();
                                this.scene.clearItems(toWaypoint.id);
                                this.setWaypointAndMove(toWaypoint.id);
                                this.scene.time.addEvent({
                                    delay: config.boy.stayTime,
                                    callback: () => {
                                        this.mode = 'none';
                                        this.updateFace();
                                        this.wander();
                                    },
                                });
                                return;
                                break;
                        }
                    })
                }

                const waypoint = this.scene.g_waypointList[this.wayPoints[0]];

                const nearBonePos = waypoint.connectsList.find(waypointID =>
                    (this.scene.g_waypointList[waypointID].items.map(i => i.name).includes('event_bone'))
                );
                if (nearBonePos != null) {
                    log('nearBonePos has bones');
                    this.wander();
                    return;
                }
                if (waypoint.name === 'bus stop 1') {
                    this.mode = 'bus_boy';
                    this.updateFace();
                    const nextBusStop = this.scene.g_namedWaypointList.find(w => w.name === 'bus stop 2');
                    this.setWaypointAndMove(nextBusStop.id);
                }
                if (waypoint.name === 'bus stop 2') {
                    this.mode = 'bus_boy';
                    this.updateFace();
                    const nextBusStop = this.scene.g_namedWaypointList.find(w => w.name === 'bus stop 3');
                    this.setWaypointAndMove(nextBusStop.id);
                }
                if (waypoint.name === 'bus stop 3') {
                    this.mode = 'bus_boy';
                    this.updateFace();
                    const nextBusStop = this.scene.g_namedWaypointList.find(w => w.name === 'bus stop 1');
                    this.setWaypointAndMove(nextBusStop.id);
                }
                break;
            case 'police_boy':
                if (toWaypoint.name === 'police station') {
                    this.mode = 'none';
                    this.updateFace();
                }
                break;
            case 'man_boy':
                this.manPower--;
                if (this.manPower <= 0) {
                    this.mode = 'none';
                    this.updateFace();
                    this.setWaypointAndMove(toWaypoint.id);
                    this.scene.g_itemsGroup.add(new ManSmoke(this.scene, toWaypoint.x - 20, toWaypoint.y));
                }
                break;
            case 'bus_boy':
                if (toWaypoint.name === 'bus stop 1' || toWaypoint.name === 'bus stop 2' || toWaypoint.name === 'bus stop 3') {
                    this.mode = 'none';
                    this.updateFace();
                }
                break;
        }

        log('onWaypointArrived B', this.wayPoints);

        this.scene.drawWaypoints(this.wayPoints.slice(), null, this.predictColor, this.g_predictGroup);
        if (this.wayPoints.length > 1) {
            this.moveToWaypoint(this.scene.g_waypointList[this.wayPoints[0]], this.scene.g_waypointList[this.wayPoints[1]]);
        } else {
            this.scene.time.addEvent({
                delay: config.boy.stayTime,
                callback: () => {
                    this.wander();
                },
            });
        }
    }

    isAtWaypoint(waypointID: integer) {
        if (this.isMoving) return false;
        if (this.wayPoints[0] === waypointID) return true;
        return false;
    }

    wander() {
        log('wander');
        if (!this.canMove) return;
        let choices = (this.scene.g_namedWaypointList.slice()
            .filter(waypoint => waypoint.id !== this.wayPoints[0])
            .filter(waypoint =>
                !(waypoint.items.map(i => i.name).includes('event_bone'))
            )
        );

        const nearBonePos = this.scene.g_waypointList[this.wayPoints[0]].connectsList.find(waypointID =>
            (this.scene.g_waypointList[waypointID].items.map(i => i.name).includes('event_bone'))
        );
        if (nearBonePos != null) {
            choices = this.scene.g_waypointList[this.wayPoints[0]].connectsList.filter(waypointID =>
                !(this.scene.g_waypointList[waypointID].items.map(i => i.name).includes('event_bone'))
            ).map(i => this.scene.g_waypointList[i]);
        }
        const waypoint = Phaser.Math.RND.pick(choices);
        this.setWaypointAndMove(waypoint.id);

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
