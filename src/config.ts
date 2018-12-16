
export type IConfig = {
    cellWidth: number;
    cellHeight: number;
    cellCountW: integer;
    cellCountH: integer;
    debug: Debug;
    boy: Boy;
    level: Level;
}

export interface Debug {
    showWaypoint: boolean;
    showBoyFoot: boolean;
}
export interface Boy {
    startCellID: integer;
    speed: number;
}

export interface Level {
    waypoints: Waypoint[]
}

export interface Waypoint {
    id: integer;
    cellX: integer;
    cellY: integer;
    connects: integer[];
}



const c = require('json-loader!yaml-loader!./config.yml');

export const config = c.config as IConfig;
