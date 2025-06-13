import { TERRAIN_TYPES, OBJECT_TYPES } from './constants.js';
import GAME_CONFIG from './config.js';

export class MapObjectManager {
    constructor() {
        if (MapObjectManager._instance) {
            throw new Error('Use MapObjectManager.getInstance()');
        }
        this.mapObjects = [];
    }
    static getInstance() {
        if (!MapObjectManager._instance) {
            MapObjectManager._instance = new MapObjectManager();
        }
        return MapObjectManager._instance;
    }
    generateMapObjects(gameState) {
        this.mapObjects = [];
        this.generateTrees(gameState);
        this.generateBoulders(gameState);
        gameState.mapObjects = this.mapObjects;
    }
    generateTrees(gameState) {
        const grassTiles = [];
        for (let y = 0; y < gameState.worldHeight; y++) {
            for (let x = 0; x < gameState.worldWidth; x++) {
                if (gameState.map[y][x] === TERRAIN_TYPES.GRASS) {
                    grassTiles.push({ x, y });
                }
            }
        }
        const numTrees = Math.floor(grassTiles.length * GAME_CONFIG.trees.density);
        const shuffledTiles = grassTiles.sort(() => Math.random() - 0.5);
        for (let i = 0; i < Math.min(numTrees, shuffledTiles.length); i++) {
            const tile = shuffledTiles[i];
            const tree = {
                id: this.generateObjectId(),
                type: OBJECT_TYPES.TREE,
                x: tile.x,
                y: tile.y,
                size: Math.random() * (GAME_CONFIG.trees.maxSize - GAME_CONFIG.trees.minSize) + GAME_CONFIG.trees.minSize,
                maxSize: Math.random() * (GAME_CONFIG.trees.maxSize - GAME_CONFIG.trees.minSize) + GAME_CONFIG.trees.minSize,
                age: Math.random() * GAME_CONFIG.trees.growthTime,
                lastSpawnTime: Date.now() - Math.random() * GAME_CONFIG.trees.spawnRate
            };
            this.mapObjects.push(tree);
        }
    }
    generateBoulders(gameState) {
        const rockTiles = [];
        for (let y = 0; y < gameState.worldHeight; y++) {
            for (let x = 0; x < gameState.worldWidth; x++) {
                if (gameState.map[y][x] === TERRAIN_TYPES.ROCK) {
                    rockTiles.push({ x, y });
                }
            }
        }
        const numBoulders = Math.floor(rockTiles.length * GAME_CONFIG.boulders.density);
        const shuffledTiles = rockTiles.sort(() => Math.random() - 0.5);
        for (let i = 0; i < Math.min(numBoulders, shuffledTiles.length); i++) {
            const tile = shuffledTiles[i];
            const boulder = {
                id: this.generateObjectId(),
                type: OBJECT_TYPES.BOULDER,
                x: tile.x,
                y: tile.y,
                size: Math.random() * (GAME_CONFIG.boulders.maxSize - GAME_CONFIG.boulders.minSize) + GAME_CONFIG.boulders.minSize
            };
            this.mapObjects.push(boulder);
        }
    }
    generateObjectId() {
        return 'obj_' + Math.random().toString(36).substr(2, 9);
    }
    updateMapObjects(deltaTime, gameState) {
        const currentTime = Date.now();
        for (const obj of this.mapObjects) {
            if (obj.type === OBJECT_TYPES.TREE) {
                this.updateTree(obj, deltaTime, currentTime, gameState);
            }
        }
    }
    updateTree(tree, deltaTime, currentTime, gameState) {
        if (tree.size < tree.maxSize) {
            tree.age += deltaTime;
            const growthProgress = tree.age / GAME_CONFIG.trees.growthTime;
            tree.size = Math.min(
                tree.maxSize,
                GAME_CONFIG.trees.minSize + (tree.maxSize - GAME_CONFIG.trees.minSize) * growthProgress
            );
        }
        if (tree.size >= GAME_CONFIG.trees.matureThreshold * tree.maxSize) {
            if (currentTime - tree.lastSpawnTime >= GAME_CONFIG.trees.spawnRate) {
                this.attemptTreeSpawn(tree, currentTime, gameState);
                tree.lastSpawnTime = currentTime;
            }
        }
    }
    attemptTreeSpawn(parentTree, currentTime, gameState) {
        const spawnRadius = GAME_CONFIG.trees.spawnRadius;
        const attempts = 10;
        for (let i = 0; i < attempts; i++) {
            const angle = Math.random() * 2 * Math.PI;
            const distance = Math.random() * spawnRadius;
            const spawnX = Math.round(parentTree.x + Math.cos(angle) * distance);
            const spawnY = Math.round(parentTree.y + Math.sin(angle) * distance);
            if (spawnX >= 0 && spawnX < gameState.worldWidth &&
                spawnY >= 0 && spawnY < gameState.worldHeight &&
                gameState.map[spawnY][spawnX] === TERRAIN_TYPES.GRASS) {
                const existingObject = this.mapObjects.find(obj => obj.x === spawnX && obj.y === spawnY);
                if (!existingObject) {
                    const newTree = {
                        id: this.generateObjectId(),
                        type: OBJECT_TYPES.TREE,
                        x: spawnX,
                        y: spawnY,
                        size: GAME_CONFIG.trees.minSize,
                        maxSize: Math.random() * (GAME_CONFIG.trees.maxSize - GAME_CONFIG.trees.minSize) + GAME_CONFIG.trees.minSize,
                        age: 0,
                        lastSpawnTime: currentTime
                    };
                    this.mapObjects.push(newTree);
                    break;
                }
            }
        }
    }
    getObjectsAtTile(x, y) {
        return this.mapObjects.filter(obj => 
            Math.floor(obj.x) === x && Math.floor(obj.y) === y
        );
    }
}
MapObjectManager._instance = null;
