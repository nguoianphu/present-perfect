export type ISpriteSpec = {
    key: string, frame: string
}


export type IDifficulty = IDifficultyWave | IDifficultyEnding;

export interface IDifficultyWave {
    wait: number;
    desc?: string;
    allowedEnemies: number;
    enemyHP: number;
    enemySpawnInterval: number;
    end?: boolean;
}

export interface IDifficultyEnding {
    wait: number;
    desc?: string;
    end: boolean;
}

export type IConfig = {
    cellWidth: number;
    cellHeight: number;
    cellCountW: number;
    cellCountH: number;

}


const c = require('json-loader!yaml-loader!./config.yml');

export const config = c.config as IConfig;
