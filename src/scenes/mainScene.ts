import { bindAll } from 'lodash';
import * as Debug from 'debug';


import { EventContext, defaultTextStyle, transpose, indent, compareNumber } from '../Utils';
import { CardButton } from '../UI/CardButton';

import { config } from '../config';
import { GM } from '../GM';
import { Waypoint } from '../Waypoint';
import { Boy } from '../Boy';
import { Girl } from '../Girl';

type Pointer = Phaser.Input.Pointer;
type Scene = Phaser.Scene;
const Vector2 = Phaser.Math.Vector2;

const log = Debug('Present:MainScene');

interface IMoveKeys {
    down: Phaser.Input.Keyboard.Key,
    up: Phaser.Input.Keyboard.Key,
    right: Phaser.Input.Keyboard.Key,
    left: Phaser.Input.Keyboard.Key,
}


export class MainScene extends Phaser.Scene implements GM {

    private moveKeys: IMoveKeys;
    private g_tilesContainer: Phaser.GameObjects.Container;
    private g_group2: Phaser.GameObjects.Container;
    public currentTool: Tool = null;

    private g_bg: Phaser.GameObjects.Image;
    private g_buildings: Phaser.GameObjects.Image;

    private g_tilesGroup: Phaser.GameObjects.Group;

    public g_waypointMatrix: Waypoint[][] = new Array(config.cellCountW).fill(1).map(_ => new Array(config.cellCountH));
    public g_waypointList: Waypoint[] = [];
    public g_namedWaypointList: Waypoint[] = [];

    public boy: Boy;
    public boyPredict: Phaser.GameObjects.Container;
    public girl: Girl;
    public girlPredict: Phaser.GameObjects.Container;

    constructor() {
        super({
            key: "MainScene"
        });

        if (config.debug.tool === 'WaypointTool') {
            this.currentTool = new WaypointTool();
        } else if (config.debug.tool === 'BoyDebugTool') {
            this.currentTool = new BoyDebugTool();
        } else {
            this.currentTool = new EmptyTool();
        }
    }

    preload(): void {
        // this.load.image('bg', './assets/publicDomain/paper_texture_cells_light_55327_1280x720.jpg');
        this.load.baseURL = './assets/brianTW/';
        this.load.image('base', 'base.png');
        this.load.image('boy', 'boy.png');
        this.load.image('building', 'building.png');

        this.load.image('event_A', 'event_A.png');
        this.load.image('event_B', 'event_B.png');
        this.load.image('event_bone', 'event_bone.png');
        this.load.image('event_C', 'event_C.png');
        this.load.image('girl', 'girl.png');
        this.load.image('item_A', 'item_A.png');
        this.load.image('item_B', 'item_B.png');
        this.load.image('item_bone', 'item_bone.png');
        this.load.image('item_C', 'item_C.png');
    }

    create(): void {
        (<any>window).scene = this;
        (<any>window).Debug = Debug;

        this.g_bg = this.add.image(0, 0, 'base')
            // .setScale(1920 / 1280 * 2, 1080 / 720 * 2)
            // .setScale(1920 / 1280 * 2, 1080 / 720 * 2)
            .setOrigin(0)
            ;

        const padding = 4;
        const w = (this.sys.canvas.width - padding - padding) / 7;
        const h = w / 0.75;

        this.g_tilesContainer = this.add.container(0, 0);

        this.g_buildings = this.add.image(0, 0, 'building')
            // .setScale(1920 / 1280 * 2, 1080 / 720 * 2)
            // .setScale(1920 / 1280 * 2, 1080 / 720 * 2)
            .setOrigin(0)
            ;
        this.spawnWaypoints();


        this.boyPredict = this.add.container(0, 0);
        this.girlPredict = this.add.container(0, 0);
        this.spawnGirl();
        this.spawnBoy();


        this.registerMouse();

        this.boy.wander();
        this.girl.wander();
    }

    update(time: number, delta: number): void {

    }

    private registerKeyboard(): void {
        // Creates object for input with WASD kets
        this.moveKeys = this.input.keyboard.addKeys({
            'up': Phaser.Input.Keyboard.KeyCodes.W,
            'down': Phaser.Input.Keyboard.KeyCodes.S,
            'left': Phaser.Input.Keyboard.KeyCodes.A,
            'right': Phaser.Input.Keyboard.KeyCodes.D
        }) as IMoveKeys;


        // Stops player acceleration on uppress of WASD keys
        this.input.keyboard.on('keyup_W', (event: any) => {
            if (this.moveKeys.down.isUp) {
                // this.plane.setAccelerationY(0);
            }
        });
        this.input.keyboard.on('keyup_S', (event: any) => {
            if (this.moveKeys.up.isUp) {
                // this.plane.setAccelerationY(0);
            }
        });
        this.input.keyboard.on('keyup_A', (event: any) => {
            if (this.moveKeys.right.isUp) {
                // this.plane.setAccelerationX(0);
            }
        });
        this.input.keyboard.on('keyup_D', (event: any) => {
            if (this.moveKeys.left.isUp) {
                // this.plane.setAccelerationX(0);
            }
        });
    }

    getCellPosition(x: number, y: number) {
        return new Phaser.Math.Vector2(
            Phaser.Math.Clamp(Math.floor((x - config.cellOffsetX) / config.cellWidth), 0, config.cellCountW - 1),
            Phaser.Math.Clamp(Math.floor((y - config.cellOffsetY) / config.cellHeight), 0, config.cellCountH - 1),
        )
    }

    private registerMouse(): void {
        let activeWaypoint: Waypoint = null;
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            this.currentTool.pointerdown(this, pointer);
        });
        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            this.currentTool.pointermove(this, pointer);
        });
        this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
            this.currentTool.pointerup(this, pointer);
        });
    }

    private requestFullscreen() {
        const fullscreenName = this.sys.game.device.fullscreen.request;
        if (fullscreenName) {
            return (<any>this.sys.canvas)[fullscreenName]();
        }
    }

    public printWaypoints() {
        log(`Waypoints(${this.g_waypointMatrix.length},${this.g_waypointMatrix[0].length})`
            + `\n${transpose(this.g_waypointMatrix).map(row => row.map(item => (!item ? '_' : item.toString()).padEnd(4, ' ')).join(' ')).join('\n')}`
            + ``);
    }

    private packWaypoints(indentCount: integer) {
        const ymlString = (this.g_waypointList
            .sort((a, b) => a.id - b.id)
            .map(waypoint => waypoint.toYaml())
            .map(indent(indentCount, '  '))
            .join('\n')
        );
        log(`Waypoints(${this.g_waypointList.length})`
            + `\n${ymlString}`
            + ``);
    }

    public addWaypoint(id: number, name: string, cellX: number, cellY: number, connects: number[] = []): this {
        if (this.g_waypointMatrix[cellX][cellY] == null) {
            const activeWaypoint = this.add.existing(new Waypoint(this, id, name, cellX, cellY, connects)) as Waypoint;
            this.g_waypointMatrix[activeWaypoint.cellX][activeWaypoint.cellY] = activeWaypoint;

            if (this.g_waypointList.length < id + 1) this.g_waypointList.length = id + 1;
            this.g_waypointList[id] = activeWaypoint;

            return this;
        }
        throw `addWaypoint already occupied(${cellX}, ${cellY}`;
    }

    public spawnWaypoints() {
        config.level.waypoints.forEach((waypoint) => {
            const {
                id,
                name = '',
                cellX,
                cellY,
                connects,
            } = waypoint;
            this.addWaypoint(id, name, cellX, cellY, connects);
        });

        this.printWaypoints();

        this.g_waypointList.forEach(w => {
            w.updateDistanceList(this.g_waypointList);
            w.updateConnectionsDebug(this.g_waypointList);
        });
        this.g_namedWaypointList = this.g_waypointList.filter(w => w.name !== '');

        this.g_waypointList.forEach(w => {
            w.updateShortestPathTree(this.g_waypointList);
        });
    }

    public getWaypoints(from: number, to: number) {
        return Waypoint.getWaypoints(this.g_waypointList, from, to);
    }

    public drawWaypoints(route: number[], totalDist: number | null, color: integer, g_group: Phaser.GameObjects.Container) {
        // log(`hops: [${route.join(', ')}]`);

        let lastWaypoint = this.g_waypointList[route[0]];
        g_group.removeAll(true);
        const g_line = new Phaser.GameObjects.Graphics(this, {
            x: config.cellWidth / 2,
            y: config.cellHeight / 2,
            fillStyle: { color, alpha: 1 },
            lineStyle: { width: 10, color, alpha: 1 },
        });
        g_line.beginPath();
        g_line.moveTo(lastWaypoint.x, lastWaypoint.y);

        route.slice(1, route.length).forEach(waypointID => {
            const g_waypoint = this.g_waypointList[waypointID];
            g_line.lineTo(g_waypoint.x, g_waypoint.y);

            lastWaypoint = g_waypoint;
        })
        g_line.strokePath();
        g_line.closePath();
        g_group.add(g_line);

        if (totalDist != null) {
            g_group.add(new Phaser.GameObjects.Text(this,
                lastWaypoint.x, lastWaypoint.y,
                '' + totalDist,
                {
                    ...defaultTextStyle,
                    color: 'green'
                }));
        }

        const fromWaypoint = this.g_waypointList[route[route.length - 1]];
        const g_circle = new Phaser.GameObjects.Graphics(this, {
            x: fromWaypoint.x + config.cellWidth / 2, y: fromWaypoint.y + config.cellHeight / 2,
            fillStyle: { color, alpha: 1 },
            lineStyle: { width: 5, color, alpha: 1 },
        });
        g_circle.strokeCircle(0, 0, 20);
        g_group.add(g_circle);

        // this.tweens.add({
        //     targets: g_group,
        //     alpha: 0,
        //     duration: 4500,
        //     onComplete: () => {
        //         g_group.destroy();
        //     },
        // })
    }

    public spawnBoy() {
        const configBoy = config.boy;
        const cellID = configBoy.startCellID;
        const cell = this.g_waypointList[cellID];
        if (!cell) throw 'cell not found. id=' + cellID;
        this.boy = new Boy(this, cell.cellX, cell.cellY, this.boyPredict);
        this.add.existing(this.boy);
    }

    public spawnGirl() {
        const configGirl = config.girl;
        const cellID = configGirl.startCellID;
        const cell = this.g_waypointList[cellID];
        if (!cell) throw 'cell not found. id=' + cellID;
        this.girl = new Girl(this, cell.cellX, cell.cellY, this.girlPredict);
        this.add.existing(this.girl);
    }

    public changeToolTo(name: string) {
        if(name === 'UseItemTool'){
            this.currentTool = new UseItemTool;
        }
    }
}

interface Tool {
    activeWaypoint: Waypoint;
    pointerdown(scene: MainScene, pointer: Phaser.Input.Pointer): void;
    pointermove(scene: MainScene, pointer: Phaser.Input.Pointer): void;
    pointerup(scene: MainScene, pointer: Phaser.Input.Pointer): void;
}

class WaypointTool implements Tool {
    activeWaypoint: Waypoint = null;

    pointerdown(scene: MainScene, pointer: Phaser.Input.Pointer) {
        const cellPos = scene.getCellPosition(pointer.x, pointer.y);
        if (!this.activeWaypoint) {
            if (scene.g_waypointMatrix[cellPos.x][cellPos.y] != null) {
                this.activeWaypoint = scene.g_waypointMatrix[cellPos.x][cellPos.y];
                scene.g_waypointMatrix[cellPos.x][cellPos.y] = null;
            } else {
                this.activeWaypoint = scene.add.existing(new Waypoint(scene, scene.g_waypointList.length, '', cellPos.x, cellPos.y)) as Waypoint;
            }
        }
    }
    pointermove(scene: MainScene, pointer: Phaser.Input.Pointer) {
        if (this.activeWaypoint) {
            const cellPos = scene.getCellPosition(pointer.x, pointer.y);
            this.activeWaypoint.setCellPosition(cellPos.x, cellPos.y);
        }
    }
    pointerup(scene: MainScene, pointer: Phaser.Input.Pointer) {
        if (scene.g_waypointMatrix[this.activeWaypoint.cellX][this.activeWaypoint.cellY] == null) {
            scene.g_waypointMatrix[this.activeWaypoint.cellX][this.activeWaypoint.cellY] = this.activeWaypoint;
            if (scene.g_waypointList.indexOf(this.activeWaypoint) < 0) scene.g_waypointList.push(this.activeWaypoint);
            scene.printWaypoints();
            this.activeWaypoint = null;
        }
    }
}

class BoyDebugTool implements Tool {
    activeWaypoint: Waypoint = null;

    pointerdown(scene: MainScene, pointer: Phaser.Input.Pointer) {
    }
    pointermove(scene: MainScene, pointer: Phaser.Input.Pointer) {
    }
    pointerup(scene: MainScene, pointer: Phaser.Input.Pointer) {
        const cellPos = scene.getCellPosition(pointer.x, pointer.y);
        log('pointerup', cellPos);
        const boyPosID = scene.g_waypointMatrix[scene.boy.cellX][scene.boy.cellY].id;
        const wayPoint = scene.g_waypointMatrix[cellPos.x][cellPos.y];
        if (wayPoint != null) {
            scene.boy.setWaypointAndMove(wayPoint.id);
        }
    }
}


class EmptyTool implements Tool {
    activeWaypoint: Waypoint = null;

    pointerdown(scene: MainScene, pointer: Phaser.Input.Pointer) { }
    pointermove(scene: MainScene, pointer: Phaser.Input.Pointer) { }
    pointerup(scene: MainScene, pointer: Phaser.Input.Pointer) { }
}

class UseItemTool implements Tool {
    activeWaypoint: Waypoint = null;

    pointerdown(scene: MainScene, pointer: Phaser.Input.Pointer) { }
    pointermove(scene: MainScene, pointer: Phaser.Input.Pointer) { }
    pointerup(scene: MainScene, pointer: Phaser.Input.Pointer) { }
}