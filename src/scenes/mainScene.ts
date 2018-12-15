import { bindAll } from 'lodash';


import { EventContext, defaultFont, transpose } from '../Utils';
import { CardButton } from '../UI/CardButton';

import { config } from '../config';
import { GM } from '../GM';
import { Waypoint } from '../Waypoint';

type Pointer = Phaser.Input.Pointer;

interface IMoveKeys {
    down: Phaser.Input.Keyboard.Key,
    up: Phaser.Input.Keyboard.Key,
    right: Phaser.Input.Keyboard.Key,
    left: Phaser.Input.Keyboard.Key,
}


export class MainScene extends Phaser.Scene implements GM {

    private moveKeys: IMoveKeys;
    private tilesContainer: Phaser.GameObjects.Container;
    private group2: Phaser.GameObjects.Container;

    private bg: Phaser.GameObjects.Image;
    private tilesGroup: Phaser.GameObjects.Group;

    public waypointList: Waypoint[][] = new Array(config.cellCountW).fill(1).map(_ => new Array(config.cellCountH));

    constructor() {
        super({
            key: "MainScene"
        });
    }

    preload(): void {
        this.load.image('bg', './assets/publicDomain/paper_texture_cells_light_55327_1280x720.jpg');

    }

    create(): void {
        (<any>window).scene = this;

        this.bg = this.add.image(0, 0, 'bg')
            .setScale(1920 / 1280 * 2, 1080 / 720 * 2)
            ;

        const padding = 4;
        const w = (this.sys.canvas.width - padding - padding) / 7;
        const h = w / 0.75;

        this.tilesContainer = this.add.container(0, 0);

        this.registerMouse();
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
            Phaser.Math.Clamp(Math.round(x / config.cellWidth), 0, config.cellCountW - 1),
            Phaser.Math.Clamp(Math.round(y / config.cellHeight), 0, config.cellCountH - 1),
        )
    }

    private registerMouse(): void {
        let activeWaypoint: Waypoint = null;
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            const cellPos = this.getCellPosition(pointer.x, pointer.y);
            if (!activeWaypoint) {
                if (this.waypointList[cellPos.x][cellPos.y] != null) {
                    activeWaypoint = this.waypointList[cellPos.x][cellPos.y];
                    this.waypointList[cellPos.x][cellPos.y] = null;
                } else {
                    activeWaypoint = this.add.existing(new Waypoint(this, cellPos.x, cellPos.y)) as Waypoint;
                }
            }
        });
        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (activeWaypoint) {
                const cellPos = this.getCellPosition(pointer.x, pointer.y);
                activeWaypoint.setCellPosition(cellPos.x, cellPos.y);
            }
        });
        this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
            if (this.waypointList[activeWaypoint.cellX][activeWaypoint.cellY] == null) {
                this.waypointList[activeWaypoint.cellX][activeWaypoint.cellY] = activeWaypoint;
                this.printWaypoints();
                activeWaypoint = null;
            }
        });
    }

    private requestFullscreen() {
        const fullscreenName = this.sys.game.device.fullscreen.request;
        if (fullscreenName) {
            return (<any>this.sys.canvas)[fullscreenName]();
        }
    }

    private printWaypoints() {
        console.log(`Waypoints(${this.waypointList.length},${this.waypointList[0].length})`
            + `\n${transpose(this.waypointList).map(row => row.map(item => (!item ? '_' : item.toString()).padEnd(5 , ' ')).join(' ')).join('\n')}`
            + ``);
    }
}