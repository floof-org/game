import * as gameConfigs from "../../server/lib/config.js";
import Pathfinder from "./Pathfinder.js";
import { selectedMobSpawner } from "./state.js";
import { mainCellTypes, MobSpawner } from "./types.js";

/** @type {Map<number, MobSpawner>} */
export const spawners = new Map();

export class MapCell {
    constructor(x, y) {
        this.x = x;
        this.y = y;

        this.type = 0;
        this.score = 0;

        /** @type {MobSpawner} */
        this.mobSpawner = null;
    }
}

export default class FloofMap {
    constructor(width, height) {
        this.width = width;
        this.height = height;

        /** @type {MapCell[][]} */
        this.cells = new Array(height).fill(null).map((_, y) => new Array(width).fill(null).map((_, x) => new MapCell(x, y)));

        this.maxRarity = gameConfigs.tiers.length - 3;
    }

    at(x, y) {
        return this.cells[y][x];
    }

    set(x, y, type = 0) {
        this.cells[y][x].type = type;

        if (mainCellTypes[type].name === "Mob Spawn" && selectedMobSpawner !== null) {
            this.cells[y][x].mobSpawner = spawners.get(selectedMobSpawner);
        } else {
            this.cells[y][x].mobSpawner = null;
        }
    }

    checkSpawners() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const cell = this.cells[y][x];

                if (cell.mobSpawner !== null && !spawners.has(cell.mobSpawner.id)) {
                    cell.mobSpawner = null;
                }
            }
        }
    }

    /**
     * @param {HTMLCanvasElement} canvas
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw(canvas, ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const size = Math.min(canvas.width, canvas.height);
        const cellSize = size / Math.max(this.width, this.height);

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const cell = this.cells[y][x];

                ctx.fillStyle = mainCellTypes[cell.type].color;
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);

                if (cell.mobSpawner !== null) {
                    ctx.strokeStyle = cell.mobSpawner.color;
                    ctx.lineWidth = 1;
                    ctx.beginPath();

                    ctx.moveTo(x * cellSize, y * cellSize);
                    ctx.lineTo(x * cellSize + cellSize, y * cellSize + cellSize);

                    ctx.moveTo(x * cellSize + cellSize / 2, y * cellSize);
                    ctx.lineTo(x * cellSize + cellSize, y * cellSize + cellSize / 2);

                    ctx.moveTo(x * cellSize, y * cellSize + cellSize / 2);
                    ctx.lineTo(x * cellSize + cellSize / 2, y * cellSize + cellSize);

                    ctx.stroke();
                }

                if (cell.score > 0) {
                    ctx.fillStyle = gameConfigs.tiers[Math.round(cell.score * this.maxRarity)].color;

                    if (Math.round(cell.score * this.maxRarity) == 11) {
                        ctx.strokeStyle = "#acacac"
                        ctx.lineWidth = 2
                        ctx.strokeRect(x * cellSize + cellSize / 4, y * cellSize + cellSize / 4, cellSize / 2, cellSize / 2);
                    }

                    ctx.fillRect(x * cellSize + cellSize / 4, y * cellSize + cellSize / 4, cellSize / 2, cellSize / 2);
                }
            }
        }
    }

    resize(width, height) {
        const newCells = new Array(height).fill(null).map((_, y) => new Array(width).fill(null).map((_, x) => new MapCell(x, y)));

        for (let y = 0; y < Math.min(this.height, height); y++) {
            for (let x = 0; x < Math.min(this.width, width); x++) {
                newCells[y][x] = this.cells[y][x];
            }
        }

        this.width = width;
        this.height = height;
        this.cells = newCells;
    }

    scoreCells() {
        let maxScore = 0;

        function neighbors(x, y) {
            const n = [];

            if (x > 0) n.push(this.cells[y][x - 1]);
            if (x < this.width - 1) n.push(this.cells[y][x + 1]);
            if (y > 0) n.push(this.cells[y - 1][x]);
            if (y < this.height - 1) n.push(this.cells[y + 1][x]);

            return n;
        }

        let spawnX = -1,
            spawnY = -1;

        outer: for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.cells[y][x].type === 1) {
                    spawnX = x;
                    spawnY = y;
                    break outer;
                }
            }
        }

        if (spawnX === -1 || spawnY === -1) {
            alert("Map does not contain a spawn point.");
            throw new Error("Map does not contain a spawn point.");
        }

        // BFS for all distances
        const distances = new Array(this.height).fill().map(() => new Array(this.width).fill(Infinity));
        distances[spawnY][spawnX] = 0;
        const queue = [[spawnX, spawnY]];
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

        while (queue.length) {
            const [x, y] = queue.shift();
            const cell = this.cells[y][x];
            if (cell.type === 0) continue;

            for (const [dx, dy] of directions) {
                const nx = x + dx, ny = y + dy;
                if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height && distances[ny][nx] === Infinity) {
                    const neighbor = this.cells[ny][nx];
                    if (neighbor.type !== 0) {
                        distances[ny][nx] = distances[y][x] + 1;
                        if (neighbor.type === 2 || neighbor.type === 3) {
                        neighbor.score = distances[ny][nx];
                        maxScore = Math.max(maxScore, neighbor.score);
                        }
                        queue.push([nx, ny]);
                    }
                }
            }
        }

        // Normalize scores
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.cells[y][x].score > 0) {
                this.cells[y][x].score /= maxScore || 1; // Avoid division by zero
                }
            }
        }   
    }

    static deserialize(inputJSON) {
        const input = JSON.parse(inputJSON);
        const map = new FloofMap(input.width, input.height);

        input.mobSpawners.forEach(s => {
            spawners.set(s.id, MobSpawner.deserialize(s));
        });

        input.cells.forEach(c => {
            map.set(c.x, c.y, c.type);

            if (c.spawn !== null) {
                map.cells[c.y][c.x].mobSpawner = spawners.get(c.spawn);
            }

            if (c.score !== null) {
                map.cells[c.y][c.x].score = c.score;
            }
        });

        return map;
    }

    serialize() {
        const output = {
            width: this.width,
            height: this.height,
            cells: [],
            mobSpawners: [],
            maxRarity: this.maxRarity
        };

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const cell = this.cells[y][x];

                const cellObject = {
                    x: x,
                    y: y,
                    type: cell.type
                };

                if (cell.mobSpawner !== null) {
                    cellObject.spawn = cell.mobSpawner.id;
                }

                if (cell.type === 2 || cell.type === 3) {
                    cellObject.score = cell.score;
                }

                if (cell.type === 1) {
                    cellObject.score = 0
                }

                output.cells.push(cellObject);

                if (cell.mobSpawner !== null && output.mobSpawners.findIndex(s => s.id === cell.mobSpawner.id) === -1) {
                    output.mobSpawners.push(cell.mobSpawner.serialize());
                }
            }
        }

        return JSON.stringify(output);
    }

    deserialize(inputJSON) {
        const input = JSON.parse(inputJSON);

        this.resize(input.width, input.height);
        this.maxRarity = input.maxRarity;

        input.mobSpawners.forEach(s => {
            spawners.set(s.id, MobSpawner.deserialize(s));
        });

        input.cells.forEach(c => {
            this.set(c.x, c.y, c.type);

            if (c.spawn != null) {
                this.cells[c.y][c.x].mobSpawner = spawners.get(c.spawn);
            } else {
                this.cells[c.y][c.x].mobSpawner = null;
            }

            if (c.score != null) {
                this.cells[c.y][c.x].score = c.score;
            } else {
                this.cells[c.y][c.x].score = 0;
            }
        });
    }
}