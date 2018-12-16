
export type IConfig = {
    cellOffsetX: number;
    cellOffsetY: number;
    cellWidth: number;
    cellHeight: number;
    cellCountW: integer;
    cellCountH: integer;
    debug: Debug;
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
export interface Boy {
    startCellID: integer;
    speed: number;
}
export interface Girl {
    startCellID: integer;
    speed: number;
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
