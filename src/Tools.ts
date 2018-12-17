import * as Debug from 'debug';
const log = Debug('Present:Tool');

import { MainScene } from "./scenes/mainScene";
import { EventStar, EventBone, EventPolice, EventTeen, EventCat, EventMan } from "./Items";
import { Waypoint } from "./Waypoint";
import { config } from "./config";


export interface Tool {
    activeWaypoint: Waypoint;
    name: string;
    pointerdown(scene: MainScene, pointer: Phaser.Input.Pointer): void;
    pointermove(scene: MainScene, pointer: Phaser.Input.Pointer): void;
    pointerup(scene: MainScene, pointer: Phaser.Input.Pointer): void;
    beforeLeave(): void;
    afterEnter(): void;
}

export class WaypointTool implements Tool {
    activeWaypoint: Waypoint = null;
    name = 'WaypointTool';

    beforeLeave(): void { };
    afterEnter(): void { };
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

export class BoyDebugTool implements Tool {
    activeWaypoint: Waypoint = null;
    name = 'BoyDebugTool';

    beforeLeave(): void { };
    afterEnter(): void { };
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


export class EmptyTool implements Tool {
    activeWaypoint: Waypoint = null;
    name = 'none';

    beforeLeave(): void { };
    afterEnter(): void { };
    pointerdown(scene: MainScene, pointer: Phaser.Input.Pointer) { }
    pointermove(scene: MainScene, pointer: Phaser.Input.Pointer) { }
    pointerup(scene: MainScene, pointer: Phaser.Input.Pointer) { }
}

export class UseItemTool implements Tool {
    activeWaypoint: Waypoint = null;
    itemName: string;
    scene: MainScene;
    name = 'UseItemTool';
    g_starsGroup: Phaser.GameObjects.Container;

    constructor(scene: MainScene, itemName: string, g_starsGroup: Phaser.GameObjects.Container) {
        this.scene = scene;
        this.itemName = itemName;
        this.g_starsGroup = g_starsGroup;
    }

    afterEnter(): void {
        log('UseItemTool setUp');
        switch (this.itemName) {
            case 'item_bone':
                // this.scene.g_waypointList
                this.scene.g_itemsPanel.setButtonActive('item_bone', true);
                this.g_starsGroup.add(this.scene.g_waypointList
                    .filter(waypoint => waypoint.name == '' && waypoint.items.length <= 0)
                    .map(waypoint => new EventStar(this.scene, waypoint.x + config.cellWidth / 2, waypoint.y + config.cellHeight / 2))
                )
                this.scene.g_notice.setText('click a star to place a dog');
                break;
            case 'item_police':
                // this.scene.g_waypointList
                this.scene.g_itemsPanel.setButtonActive('item_police', true);
                this.g_starsGroup.add(this.scene.g_waypointList
                    .filter(waypoint => waypoint.name == '' && waypoint.items.length <= 0)
                    .map(waypoint => new EventStar(this.scene, waypoint.x + config.cellWidth / 2, waypoint.y + config.cellHeight / 2))
                )
                this.scene.g_notice.setText('click a star to place a policeman');
                break;
            case 'item_teen':
                // this.scene.g_waypointList
                this.scene.g_itemsPanel.setButtonActive('item_teen', true);
                this.g_starsGroup.add(this.scene.g_waypointList
                    .filter(waypoint => waypoint.name == '' && waypoint.items.length <= 0)
                    .map(waypoint => new EventStar(this.scene, waypoint.x + config.cellWidth / 2, waypoint.y + config.cellHeight / 2))
                )
                this.scene.g_notice.setText('click a star to place a gangster');
                break;
            case 'item_cat':
                // this.scene.g_waypointList
                this.scene.g_itemsPanel.setButtonActive('item_cat', true);
                this.g_starsGroup.add(this.scene.g_waypointList
                    .filter(waypoint => waypoint.items.length <= 0)
                    .map(waypoint => new EventStar(this.scene, waypoint.x + config.cellWidth / 2, waypoint.y + config.cellHeight / 2))
                )
                this.scene.g_notice.setText('click a star to place a little kitty');
                break;
            case 'item_man':
                // this.scene.g_waypointList
                this.scene.g_itemsPanel.setButtonActive('item_man', true);
                this.g_starsGroup.add(this.scene.g_waypointList
                    .filter(waypoint => waypoint.name == '' && waypoint.items.length <= 0)
                    .map(waypoint => new EventStar(this.scene, waypoint.x + config.cellWidth / 2, waypoint.y + config.cellHeight / 2))
                )
                this.scene.g_notice.setText('click a star to place an old man');
                break;
        }
    }

    beforeLeave(): void {
        this.scene.g_itemsPanel.setButtonActive('', true);
        this.g_starsGroup.removeAll(true);
        this.scene.g_notice.setText('');
    };
    pointerdown(scene: MainScene, pointer: Phaser.Input.Pointer) { }
    pointermove(scene: MainScene, pointer: Phaser.Input.Pointer) { }
    pointerup(scene: MainScene, pointer: Phaser.Input.Pointer) {
        const cellPos = scene.getCellPosition(pointer.x, pointer.y);
        if (scene.g_waypointMatrix[cellPos.x][cellPos.y] != null) {
            const waypoint = scene.g_waypointMatrix[cellPos.x][cellPos.y];

            log('waypoint', waypoint.id);

            switch (this.itemName) {
                case 'item_bone':
                    if (waypoint.items.length <= 0) {
                        this.scene.addItem(EventBone, waypoint.id);
                    }
                    break;
                case 'item_police':
                    if (waypoint.items.length <= 0) {
                        this.scene.addItem(EventPolice, waypoint.id);
                    }
                    break;
                case 'item_teen':
                    if (waypoint.items.length <= 0) {
                        this.scene.addItem(EventTeen, waypoint.id);
                    }
                    break;
                case 'item_cat':
                    if (waypoint.items.length <= 0) {
                        this.scene.addItem(EventCat, waypoint.id);
                    }
                    break;
                case 'item_man':
                    if (waypoint.items.length <= 0) {
                        this.scene.addItem(EventMan, waypoint.id);
                    }
                    break;
            }
            this.scene.changeToolTo('none');
        }


    }
}