
export type IConfig = {
    cellOffsetX: number;
    cellOffsetY: number;
    cellWidth: number;
    cellHeight: number;
    cellCountW: integer;
    cellCountH: integer;
    debug: Debug;

    items: Items;
    ui: UI;
    boy: Boy;
    girl: Girl;
    level: Level;
}

export interface Debug {
    showWaypoint: boolean;
    showNamedWaypoint: boolean;
    showBoyFoot: boolean;
    showGirlFoot: boolean;
    tool: 'none' | 'WaypointTool' | 'BoyDebugTool';
}
export interface UI {
    buttons: string[];
    panelX: number;
    panelY: number;

    buttonW: number;
    buttonH: number;
    buttonGap: number;
}


export interface Boy {
    startCellID: integer;
    speed: number;
    stayTime: number;
    mode: BoyMode;
}
export interface Girl {
    startCellID: integer;
    speed: number;
    stayTime: number;
}

export interface BoyMode {
    policeSpeed: number;
    busSpeed: number;
    manSpeed: number;
}

export interface Items {
    catDuration: number;
    boneDuration: number;
    policeDuration: number;
    teenDuration: number;
    manDuration: number;
}
export interface Level {
    waypoints: Waypoint[]
}

export interface Waypoint {
    id: integer;
    name?: string;
    cellX: integer;
    cellY: integer;
    connects: integer[];
}



const c = require('json-loader!yaml-loader!./config.yml');

(<any>window).config = c.config;
export const config = c.config as IConfig;
