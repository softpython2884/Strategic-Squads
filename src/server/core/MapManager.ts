
import * as fs from 'fs';
import * as path from 'path';
import { Grid } from 'pathfinding';
import type { Objective } from '@/lib/types';

export class MapManager {
    public grid: Grid;
    public mapWidth: number = 64;
    public mapHeight: number = 64;
    public tileWidth: number = 32;
    public tileHeight: number = 32;
    public objectives: Objective[] = [];
    public spawnPoints: { [key: string]: { x: number, y: number } } = {
        blue: { x: 10, y: 85 },
        red: { x: 90, y: 15 },
    };

    constructor() {
        this.grid = new Grid(this.mapWidth, this.mapHeight); // Default initialization
    }

    public initialize() {
        const tempObjectives: Objective[] = [];
        try {
            const mapPath = path.join(process.cwd(), 'public', 'map.json');
            // Check if file exists to avoid crash
            if (!fs.existsSync(mapPath)) {
                console.warn('Map file not found at', mapPath, 'using default empty grid.');
                return;
            }

            const mapData = JSON.parse(fs.readFileSync(mapPath, 'utf8'));

            this.mapWidth = mapData.width;
            this.mapHeight = mapData.height;
            this.tileWidth = mapData.tilewidth;
            this.tileHeight = mapData.tileheight;
            this.grid = new Grid(this.mapWidth, this.mapHeight);

            // --- Find Layers ---
            const logicLayer = mapData.layers.find((l: any) => l.name === 'Kevel 0');

            // --- Find Tilesets by name from source path ---
            const tilesets: { [key: string]: any } = {};
            if (mapData.tilesets) {
                mapData.tilesets.forEach((ts: any) => {
                    if (ts.source) {
                        const sourceName = ts.source.split('/').pop().replace('.tsx', '');
                        tilesets[sourceName] = ts;
                    }
                });
            }

            const WALL_TILESET_NAME = 'admin';
            const DEV_TILESET_NAME = 'dev'; // Towers, Idols
            const HELPER_TILESET_NAME = 'helper'; // Spawns

            const wallTileset = tilesets[WALL_TILESET_NAME];
            const devTileset = tilesets[DEV_TILESET_NAME];
            const helperTileset = tilesets[HELPER_TILESET_NAME];

            // --- Process Logic Layer ---
            if (logicLayer && logicLayer.type === 'tilelayer') {
                const processedTowers = new Set<string>();

                for (let y = 0; y < this.mapHeight; y++) {
                    for (let x = 0; x < this.mapWidth; x++) {
                        const tileIndex = y * this.mapWidth + x;
                        const gid = logicLayer.data[tileIndex];
                        if (gid === 0) continue;

                        // 1. Process Walls
                        if (wallTileset && gid >= wallTileset.firstgid && gid < wallTileset.firstgid + 10) {
                            this.grid.setWalkableAt(x, y, false);
                        }

                        // 2. Process Spawns
                        if (helperTileset && gid >= helperTileset.firstgid && gid < helperTileset.firstgid + 10) {
                            if (gid === helperTileset.firstgid) {
                                this.spawnPoints.blue = { x: (x / this.mapWidth) * 100, y: (y / this.mapHeight) * 100 };
                            } else if (gid === helperTileset.firstgid + 1) {
                                this.spawnPoints.red = { x: (x / this.mapWidth) * 100, y: (y / this.mapHeight) * 100 };
                            }
                        }

                        // 3. Process Towers/Idols
                        if (devTileset && gid >= devTileset.firstgid && gid < devTileset.firstgid + 10) {
                            const towerKey = `${x}-${y}`;
                            if (processedTowers.has(towerKey)) continue;

                            let team: 'blue' | 'red' | 'neutral' = 'neutral';
                            let type: 'tower' | 'idol' = 'tower';

                            // GID 347,348 for blue tower, 351,352 for red tower (Need robustness here)
                            if (gid === 347 || gid === 348) team = 'blue';
                            if (gid === 351 || gid === 352) team = 'red';

                            // Determine type (simplified logic, improves later)
                            // Assuming some GIDs map to Idols if needed.

                            const newObjective: Objective = {
                                id: `${type}-${team}-${x}-${y}`,
                                name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${team.charAt(0).toUpperCase() + team.slice(1)}`,
                                position: { x: ((x + 0.5) / this.mapWidth) * 100, y: ((y + 0.5) / this.mapHeight) * 100 },
                                teamId: team,
                                type: type,
                                stats: { hp: 5000, maxHp: 5000 }
                            };
                            tempObjectives.push(newObjective);

                            // Mark 2x2 area as unwalkable
                            for (let dy = 0; dy < 2; dy++) {
                                for (let dx = 0; dx < 2; dx++) {
                                    this.grid.setWalkableAt(x + dx, y + dy, false);
                                    processedTowers.add(`${x + dx}-${y + dy}`);
                                }
                            }
                        }
                    }
                }
                console.log('Pathfinding grid, spawns, and objectives initialized.');
            } else {
                console.warn("Could not find a 'Kevel 0' tile layer in map.json. Map logic will not be loaded.");
            }

        } catch (error) {
            console.error('Failed to initialize map data:', error);
            // Fallback defaults are already set in constructor/properties
        }
        this.objectives = tempObjectives;
    }
}
