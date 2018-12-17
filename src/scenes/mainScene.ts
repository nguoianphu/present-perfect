import { bindAll } from 'lodash';
import * as Debug from 'debug';


import { EventContext, defaultTextStyle, transpose, indent, compareNumber } from '../Utils';
import { CardButton } from '../UI/CardButton';

import { config } from '../config';
import { GM } from '../GM';
import { Waypoint } from '../Waypoint';
import { Boy } from '../Boy';
import { Girl } from '../Girl';
import { ItemPanel } from '../ItemsPanel';
import { Smoke } from '../Smoke';
import { Tool, WaypointTool, BoyDebugTool, EmptyTool, UseItemTool } from '../Tools';
import { EventItem } from '../Items';

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
    public g_starsGroup: Phaser.GameObjects.Container;

    public boy: Boy;
    public boyPredict: Phaser.GameObjects.Container;
    public girl: Girl;
    public girlPredict: Phaser.GameObjects.Container;
    public g_itemsPanel: ItemPanel;
    public g_notice: Phaser.GameObjects.Text;
    g_itemsGroup: Phaser.GameObjects.Container;
    g_startBG: Phaser.GameObjects.Image;
    g_endScreen: Phaser.GameObjects.Container;

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
        // this.load.image('base', 'base.png');
        // this.load.image('building', 'building.png');
        this.load.image('background', 'background.png');
        this.load.image('opening', 'opening.png');

        this.load.image('girl', 'girl.png');
        this.load.image('boy', 'boy.png');

        this.load.image('item_empty', 'item_empty.png');
        // this.load.image('event_empty', 'event_empty.png');

        this.load.image('item_bone', 'item_bone.png');
        this.load.image('event_bone', 'event_bone.png');

        this.load.image('item_cat', 'item_cat.png');
        this.load.image('event_cat', 'event_cat.png');

        this.load.image('item_maid', 'item_maid.png');
        this.load.image('event_maid', 'event_maid.png');

        this.load.image('item_man', 'item_man.png');
        this.load.image('event_man', 'event_man.png');

        this.load.image('item_police', 'item_police.png');
        this.load.image('event_police', 'event_police.png');

        this.load.image('item_teen', 'item_teen.png');
        this.load.image('event_teen', 'event_teen.png');


        this.load.image('event_bus_left_boy', 'event_bus_left_boy.png');
        this.load.image('smoke', 'smoke.png');


        this.load.image('stars', '../freeiconspng/stars-png-616-s.png');
    }

    create(): void {
        (<any>window).scene = this;
        (<any>window).Debug = Debug;

        this.g_bg = this.add.image(0, 0, 'background')
            // .setScale(1920 / 1280 * 2, 1080 / 720 * 2)
            // .setScale(1920 / 1280 * 2, 1080 / 720 * 2)
            .setOrigin(0)
            ;

        const padding = 4;
        const w = (this.sys.canvas.width - padding - padding) / 7;
        const h = w / 0.75;

        this.g_tilesContainer = this.add.container(0, 0);

        // this.g_buildings = this.add.image(0, 0, 'building')
        //     // .setScale(1920 / 1280 * 2, 1080 / 720 * 2)
        //     // .setScale(1920 / 1280 * 2, 1080 / 720 * 2)
        //     .setOrigin(0)
        //     ;
        this.spawnWaypoints();


        this.boyPredict = this.add.container(0, 0);
        this.girlPredict = this.add.container(0, 0);
        this.spawnGirl();
        this.spawnBoy();

        this.g_starsGroup = this.add.container(0, 0);
        this.g_itemsGroup = this.add.container(0, 0);

        this.add.existing(this.g_itemsPanel = new ItemPanel(this, config.ui.panelX, config.ui.panelY, this.onItemButtonPressed));

        this.add.existing(new Phaser.GameObjects.Graphics(this, {
            x: 1920 / 2,
            y: 40,
            fillStyle: { color: 0xFFFFFF, alpha: 0.8 },
            lineStyle: { width: 10, color: 0xFFFFFF, alpha: 1 },
        }).fillRect(-1920 / 2, -20, 1920, 40));
        this.add.existing(this.g_notice = new Phaser.GameObjects.Text(this,
            1920 / 2, 40,
            '',
            {
                ...defaultTextStyle,
                width: '100%',
            }
        ).setOrigin(0.5));

        this.registerMouse();

        this.g_endScreen = this.add.container(0, 0);
        this.g_startBG = this.add.image(0, 0, 'opening').setOrigin(0);
        this.g_startBG.setInteractive().on('pointerup', () => {
            this.g_startBG.destroy();
            this.g_startBG = null;
            this.startGame();
        });
    }

    startGame() {
        this.boy.wander();
        this.girl.wander();

        this.time.addEvent({
            delay: 3000,
            callback: () => {
                if (this.currentTool.name === 'none') {
                    this.g_notice.setText('Click an icon at the top to choose an item');
                }
            }
        });
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
            log('pointerup')
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

    public onItemButtonPressed = (itemName: string) => {
        if (this.hasCurrentItemTool('UseItemTool', itemName)) {
            this.changeToolTo('none');
        } else {
            this.changeToolTo('UseItemTool', itemName);
        }
    }

    public hasCurrentItemTool(name: string, itemName: string): boolean {
        if (this.currentTool.name !== name) return false;
        return ((<UseItemTool>this.currentTool).itemName === itemName);
    }

    public changeToolTo(name: string, ...rest: any[]) {
        if (this.currentTool.name !== name) {
            this.currentTool.beforeLeave();
        }
        if (name === 'UseItemTool') {
            const [itemName] = rest;
            this.currentTool = new UseItemTool(this, itemName, this.g_starsGroup);
            this.currentTool.afterEnter();
        }
        if (name === 'none') {
            this.currentTool = new EmptyTool();
            this.currentTool.afterEnter();
        }
    }

    public addItem(ItemClass: (typeof EventItem), waypointID: integer) {
        const waypoint = this.g_waypointList[waypointID];
        const g_item = new ItemClass(this, waypoint.x, waypoint.y, waypoint);

        waypoint.items.push(g_item);
        this.g_itemsGroup.add(g_item);

        this.g_itemsGroup.add(new Smoke(this, waypoint.x, waypoint.y));

        if (g_item.name === 'event_cat') {
            this.girl.onCatAdded();
        }
    }

    public clearItems(waypointID: integer) {
        const waypoint = this.g_waypointList[waypointID];

        if (waypoint.items.length > 0) {
            waypoint.items.forEach(item => item.destroy());
            waypoint.items = [];
            this.g_itemsGroup.add(new Smoke(this, waypoint.x, waypoint.y));
        }
    }

    public endGame() {
        log('endGame');

        this.boy.setWaypointAndMove(this.boy.wayPoints[0]);
        this.boy.canMove = false;
        this.girl.setWaypointAndMove(this.girl.wayPoints[0]);
        this.girl.canMove = false;

        const score = {
            'Place': this.getPlaceScore(this.boy.wayPoints[0], this.girl.wayPoints[0]) * 1,
            'Time': this.getTimeScore(0) * 1,
        };

        const g_whiteBG = this.add.graphics({
            x: 0,
            y: 0,
            fillStyle: { color: 0xFFFFFF, alpha: 1 },
            lineStyle: { width: 10, color: 0xFFFFFF, alpha: 1 },
        }).fillRect(0, 0, 1920, 1080);
        this.g_endScreen.add(g_whiteBG);
        g_whiteBG.setAlpha(0);
        this.tweens.add({
            targets: g_whiteBG,
            alpha: 1,
            duration: 1000
        })

        const titleStr = (score.Place ? 'You win!' : 'Game Over!');
        const g_title = this.add.text(1920 / 2, 400, titleStr, {
            ...defaultTextStyle,
            fontSize: 72,
        })
        g_title.setOrigin(0.5, 1);
        this.g_endScreen.add(g_title);
        
        const reasonStr = (score.Place ? 'The place is Perfect, You then live happily ever after.' : 'You should have met her at ___ !');
        const g_reason = this.add.text(1920 / 2, 600, reasonStr, {
            ...defaultTextStyle,
            fontSize: 48,
        })
        g_reason.setOrigin(0.5, 1);
        this.g_endScreen.add(g_reason);
    }

    public getPlaceScore(boyWaypointID: integer, girlWaypointID: integer): number {
        return 0;
    }

    public getTimeScore(seconds: integer): number {
        return 0;
    }
}


