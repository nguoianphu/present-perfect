

/// <reference path="../phaser.d.ts"/>

import "phaser";
import { MainScene } from "./scenes/mainScene";
import { config as configFile } from './config';

// main game configuration
const config: GameConfig = {
    width: 1920,
    height: 1080,
    disableContextMenu: true,
    type: Phaser.AUTO,
    parent: "game",
    scene: MainScene,
    physics: {
        default: "matter",
        matter: {
            // debug: true,
        }
    },
};

// game class
export class Game extends Phaser.Game {
    constructor(config: GameConfig) {
        super(config);
    }
}

// when the page is loaded, create our game instance
window.onload = () => {
    var game = new Game(config);

    // setTimeout(() => {
    // }, 100);
    function handleSizeUpdate(event?: Event) {
        const ww = window.innerWidth / 1920;
        const hh = window.innerHeight / 1080;

        const min = Math.min(ww, hh);
        console.log('handleSizeUpdate', window.innerWidth, ww, window.innerHeight, hh, min);

        game.canvas.style.width = `${min * 1920}px`;
        game.canvas.style.height = `${min * 1080}px`;
    }

    if (!window.location.search.includes('video')) {
        window.addEventListener('resize', handleSizeUpdate);

        console.log('init handleSizeUpdate');
        handleSizeUpdate();
    }
};

