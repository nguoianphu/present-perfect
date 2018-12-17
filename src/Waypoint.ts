
type Pointer = Phaser.Input.Pointer;
type GameObject = Phaser.GameObjects.GameObject;
type Vector2 = Phaser.Math.Vector2;
type DistanceMap = {
    [x: number]: { dist: number },
};
type RoutingTable = {
    [x: number]: { nextHop: number, totalDist: number },
};

const Vector2 = Phaser.Math.Vector2;
import { EventContext, defaultTextStyle, compareNumber } from './Utils';
import { config } from './config';
import { EventItem } from './Items';

export class Waypoint extends Phaser.GameObjects.Container {
    public id: integer;
    public name: string = '';
    public cellX: number;
    public cellY: number;
    public connectsList: number[] = [];
    public g_connectorGroup: Phaser.GameObjects.Container;
    public debugColor: number; // color hex number
    public distanceMap: DistanceMap = {};
    public routingTable: RoutingTable = {};
    g_name: Phaser.GameObjects.Text;
    public items: EventItem[] = [];


    constructor(scene: Phaser.Scene, id: integer, name: string, cellX: number, cellY: number, connects: number[] = [], children: GameObject[] = []) {
        super(scene, cellX, cellY);
        this.id = id;
        this.name = name;
        this.cellX = cellX;
        this.cellY = cellY;
        this.connectsList = connects;
        this.debugColor = (<Phaser.Display.Color>(<any>new Phaser.Display.Color()).random()).color;

        this.x = cellX * config.cellWidth + config.cellOffsetX;
        this.y = cellY * config.cellHeight + config.cellOffsetY;

        this.g_connectorGroup = new Phaser.GameObjects.Container(scene, 0, 0);
        this.add(this.g_connectorGroup);

        if (config.debug.showWaypoint) {
            this.add(new WaypointGraphics(scene, this.debugColor, config.cellWidth / 2, config.cellHeight / 2));
            this.add(new Phaser.GameObjects.Text(scene, config.cellWidth / 2, config.cellHeight / 2, '' + this.id, {
                ...defaultTextStyle,
                color: 'magenta',
                // color: Phaser.Display.Color.ValueToColor(this.debugColor).rgba,
            }));
        }// this.add(children);

        if (config.debug.showNamedWaypoint && this.name != '') {
            this.g_name = (new Phaser.GameObjects.Text(scene, config.cellWidth / 2, config.cellHeight / 2, '' + this.name, {
                ...defaultTextStyle,
                textAlign: 'center',
                color: 'black',
                fontSize: 36,
                backgroundColor: 'rgba(255,255,255,0.8)',
                // color: Phaser.Display.Color.ValueToColor(this.debugColor).rgba,
            })
                .setOrigin(0, 1)
                .setAngle(-20)
            );
            this.add(this.g_name);
            this.add(new NamedWaypointGraphics(scene, this.debugColor, config.cellWidth / 2, config.cellHeight / 2));
        }
    }

    setCellPosition(cellX: number, cellY: number): this {
        this.cellX = cellX;
        this.cellY = cellY;
        this.x = cellX * config.cellWidth + config.cellOffsetX;
        this.y = cellY * config.cellHeight + config.cellOffsetY;
        return this;
    }

    toString() {
        // return `${this.cellX},${this.cellY}`;
        return `${this.id}`;
    }

    toYaml() {
        return (`- id: ${this.id}`
            + (this.name === '' ? '' : `\n  name: ${this.name}`)
            + `\n  cellX: ${this.cellX}`
            + `\n  cellY: ${this.cellY}`
            + `\n  connects: [${this.connectsList.sort(compareNumber).join(', ')}]`
            + ``);
    }

    updateConnectionsDebug(g_waypointList: Waypoint[]) {
        this.g_connectorGroup.removeAll(true);

        if (!config.debug.showWaypoint) return;

        this.connectsList.forEach(neighbourID => {
            const neighbour = g_waypointList[neighbourID];
            const g_line = new Phaser.GameObjects.Graphics(this.scene, {
                x: config.cellWidth / 2, y: config.cellHeight / 2,
                fillStyle: { color: this.debugColor, alpha: 1 },
                lineStyle: { width: 5, color: this.debugColor, alpha: 1 },
            });
            let delta = new Vector2(neighbour.x - this.x, neighbour.y - this.y);
            delta.scale(0.5);
            g_line.lineBetween(0, 0, delta.x, delta.y);

            this.g_connectorGroup.add(g_line);


            const g_text = new Phaser.GameObjects.Text(this.scene,
                delta.x + config.cellWidth / 2, delta.y + config.cellHeight / 2,
                '' + this.distanceMap[neighbourID].dist.toFixed(2),
                {
                    ...defaultTextStyle,
                    fontSize: 24,
                    color: 'red',
                }
            );

            this.g_connectorGroup.add(g_text);
        })
    }

    updateDistanceList(g_waypointList: Waypoint[]) {
        this.connectsList.forEach((neighbourID) => {
            const neighbour = g_waypointList[neighbourID];
            let delta = new Vector2(neighbour.cellX - this.cellX, neighbour.cellY - this.cellY);
            const dist = delta.distance(Phaser.Math.Vector2.ZERO as any);
            this.distanceMap[neighbourID] = { dist };
        });
    }

    updateShortestPathTree(g_waypointList: Waypoint[]) {
        const visited: { [x: number]: boolean } = {};
        const totalVertices = g_waypointList.length;
        let doneVerticies = 0;
        this.routingTable[this.id] = { nextHop: null, totalDist: 0 };
        // g_waypointList.forEach(g_waypoint => {
        //     if (g_waypoint.id === this.id) {
        //     }
        //     this.routingTable[g_waypoint.id] = { nextHop: null, totalDist: Infinity };
        // });

        let target = this as Waypoint;
        let minDist = 0;
        let minDistID = this.id;
        let minNeighbourID = -1;

        do {
            target = g_waypointList[minDistID];
            target.connectsList
                .filter((neighbourID) => visited[neighbourID] == null)  // for each unvisited pool neighbour
                .forEach((neighbourID) => {
                    if (visited[neighbourID] == null) {
                        visited[neighbourID] = false;
                    }
                    const neighbour = g_waypointList[neighbourID];
                    neighbour.routingTable[this.id] = {
                        nextHop: target.id,
                        totalDist: target.distanceMap[neighbourID].dist + minDist
                    };
                });
            visited[target.id] = true;

            minDist = Infinity;
            minDistID = -1;
            minNeighbourID = -1;

            // get min dist
            (Object.keys(visited).map(Number)
                .filter((neighbourID) => visited[neighbourID] === false)  // for each unvisited queued neighbour
                .forEach(neighbourID => {
                    const neighbour = g_waypointList[neighbourID];
                    (neighbour.connectsList
                        .filter(hisNeighbourID => visited[hisNeighbourID] === true)   // find neighbour whose neighbour is visited
                        .forEach((hisNeighbourID) => {
                            const distToMe = neighbour.routingTable[this.id].totalDist;
                            if (distToMe < minDist) {
                                minDistID = neighbourID;
                                minNeighbourID = hisNeighbourID;
                                minDist = distToMe;
                            }
                        })
                    );
                })
            );

            doneVerticies++;
        } while (doneVerticies + 1 < totalVertices);

    }
    getWaypointsTo(g_waypointList: Waypoint[], waypointID: integer) {
        const result = [];
        let target = this as Waypoint;
        while (target.id !== waypointID) {
            target = g_waypointList[target.routingTable[waypointID].nextHop];
            result.push(target.id);
        }
        return {
            route: result,
            totalDist: this.routingTable[waypointID].totalDist,
        };
    }

    static getWaypoints(g_waypointList: Waypoint[], from: integer, to: integer) {
        return g_waypointList[from].getWaypointsTo(g_waypointList, to);
    }
}



export class WaypointGraphics extends Phaser.GameObjects.Graphics {
    fillRoundedRect: (x: number, y: number, w: number, h: number, r: number | { tl: number, tr: number, bl: number, br: number }) => this;
    strokeRoundedRect: (x: number, y: number, w: number, h: number, r: number | { tl: number, tr: number, bl: number, br: number }) => this;

    w: number; h: number;
    debugColor: number;

    constructor(scene: Phaser.Scene, debugColor: number, x: number, y: number) {
        super(scene, {
            x, y,
            fillStyle: { color: debugColor, alpha: 1 },
            lineStyle: { width: 1, color: debugColor, alpha: 1 },
        });
        this.debugColor = debugColor;

        this.drawDot()

        // this.setInteractive(new Phaser.Geom.Rectangle(0, 0, w, h), Phaser.Geom.Rectangle.Contains);
    }

    drawDot() {
        this.clear();

        // const color = (<Phaser.Display.Color>(<any>new Phaser.Display.Color()).random()).color;
        // this.fillStyle(color, 1);
        this.fillCircle(0, 0, 10);
    }
}




export class NamedWaypointGraphics extends Phaser.GameObjects.Graphics {
    fillRoundedRect: (x: number, y: number, w: number, h: number, r: number | { tl: number, tr: number, bl: number, br: number }) => this;
    strokeRoundedRect: (x: number, y: number, w: number, h: number, r: number | { tl: number, tr: number, bl: number, br: number }) => this;

    w: number; h: number;
    debugColor: number;

    constructor(scene: Phaser.Scene, debugColor: number, x: number, y: number) {
        super(scene, {
            x, y,
            fillStyle: { color: debugColor, alpha: 1 },
            lineStyle: { width: 5, color: debugColor, alpha: 1 },
        });
        this.debugColor = debugColor;

        this.drawDot()

        // this.setInteractive(new Phaser.Geom.Rectangle(0, 0, w, h), Phaser.Geom.Rectangle.Contains);
    }

    drawDot() {
        this.clear();

        // const color = (<Phaser.Display.Color>(<any>new Phaser.Display.Color()).random()).color;
        // this.fillStyle(color, 1);
        this.strokeCircle(0, 0, 15);
    }
}

