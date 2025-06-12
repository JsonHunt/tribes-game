import { TERRAIN_TYPES, BIOMES, OBJECT_TYPES } from './constants.js';
import { BiomeGeneratorFactory } from './biome-generator.js';
import GAME_CONFIG from './config.js';

// Remove the fallback GAME_CONFIG since we're importing it

export class MapGenerator {
    static generateMap(gameState) {
        gameState.map = [];
        
        // Initialize empty map
        for (let y = 0; y < gameState.worldHeight; y++) {
            gameState.map[y] = [];
            for (let x = 0; x < gameState.worldWidth; x++) {
                gameState.map[y][x] = null;
            }
        }
        
        // Generate biomes using selected algorithm
        const generator = BiomeGeneratorFactory.createGenerator(
            gameState.biomeAlgorithm,
            TERRAIN_TYPES,
            BIOMES
        );
        generator.generateBiomes(gameState);
    }

    static generateTerrain(x, y, gameState) {
        // Simple terrain generation using noise-like patterns (fallback)
        const centerX = gameState.worldWidth / 2;
        const centerY = gameState.worldHeight / 2;
        const distanceFromCenter = Math.sqrt((x - centerX) * (x - centerX) + (y - centerY) * (y - centerY));
        const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);
        
        // Create some randomness
        const noise = (Math.sin(x * 0.1) * Math.cos(y * 0.1) + Math.random() - 0.5) * 0.3;
        const normalizedDistance = distanceFromCenter / maxDistance + noise;
        
        // Determine terrain based on distance and some randomness
        if (normalizedDistance < 0.2) {
            return Math.random() < 0.7 ? TERRAIN_TYPES.GRASS : TERRAIN_TYPES.WATER;
        } else if (normalizedDistance < 0.4) {
            return Math.random() < 0.5 ? TERRAIN_TYPES.GRASS : TERRAIN_TYPES.SAND;
        } else if (normalizedDistance < 0.6) {
            return Math.random() < 0.4 ? TERRAIN_TYPES.SAND : TERRAIN_TYPES.ROCK;
        } else if (normalizedDistance < 0.8) {
            return Math.random() < 0.6 ? TERRAIN_TYPES.ROCK : TERRAIN_TYPES.SNOW;
        } else {
            return TERRAIN_TYPES.SNOW;
        }
    }
}

export class MapObjectManager {
    constructor() {
        this.mapObjects = [];
    }

    // Generate all map objects
    generateMapObjects(gameState) {
        this.mapObjects = [];
        
        // Generate trees on grass tiles
        this.generateTrees(gameState);
        
        // Generate boulders on rock tiles
        this.generateBoulders(gameState);
        
        gameState.mapObjects = this.mapObjects;
    }

    generateTrees(gameState) {
        const grassTiles = [];
        
        // Find all grass tiles
        for (let y = 0; y < gameState.worldHeight; y++) {
            for (let x = 0; x < gameState.worldWidth; x++) {
                if (gameState.map[y][x] === TERRAIN_TYPES.GRASS) {
                    grassTiles.push({ x, y });
                }
            }
        }
        
        // Calculate number of trees based on density
        const numTrees = Math.floor(grassTiles.length * GAME_CONFIG.trees.density);
        
        // Randomly select positions for trees
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
                age: Math.random() * GAME_CONFIG.trees.growthTime, // Random initial age
                lastSpawnTime: Date.now() - Math.random() * GAME_CONFIG.trees.spawnRate
            };
            
            this.mapObjects.push(tree);
        }
    }

    generateBoulders(gameState) {
        const rockTiles = [];
        
        // Find all rock tiles
        for (let y = 0; y < gameState.worldHeight; y++) {
            for (let x = 0; x < gameState.worldWidth; x++) {
                if (gameState.map[y][x] === TERRAIN_TYPES.ROCK) {
                    rockTiles.push({ x, y });
                }
            }
        }
        
        // Calculate number of boulders based on density
        const numBoulders = Math.floor(rockTiles.length * GAME_CONFIG.boulders.density);
        
        // Randomly select positions for boulders
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
    }    // Update map objects (trees growing, spawning, etc.)
    updateMapObjects(deltaTime, gameState) {
        const currentTime = Date.now();
        
        for (const obj of this.mapObjects) {
            if (obj.type === OBJECT_TYPES.TREE) {
                this.updateTree(obj, deltaTime, currentTime, gameState);
            }
        }
    }updateTree(tree, deltaTime, currentTime, gameState) {
        // Tree growth
        if (tree.size < tree.maxSize) {
            tree.age += deltaTime;
            const growthProgress = tree.age / GAME_CONFIG.trees.growthTime;
            tree.size = Math.min(
                tree.maxSize,
                GAME_CONFIG.trees.minSize + (tree.maxSize - GAME_CONFIG.trees.minSize) * growthProgress
            );
        }
        
        // Tree spawning
        if (tree.size >= GAME_CONFIG.trees.matureThreshold * tree.maxSize) {
            if (currentTime - tree.lastSpawnTime >= GAME_CONFIG.trees.spawnRate) {
                this.attemptTreeSpawn(tree, currentTime, gameState);
                tree.lastSpawnTime = currentTime;
            }
        }
    }

    attemptTreeSpawn(parentTree, currentTime, gameState) {
        const spawnRadius = GAME_CONFIG.trees.spawnRadius;
        const attempts = 10; // Maximum attempts to find a suitable spawn location
        
        for (let i = 0; i < attempts; i++) {
            // Random position within spawn radius
            const angle = Math.random() * 2 * Math.PI;
            const distance = Math.random() * spawnRadius;
            const spawnX = Math.round(parentTree.x + Math.cos(angle) * distance);
            const spawnY = Math.round(parentTree.y + Math.sin(angle) * distance);
            
            // Check if position is valid
            if (spawnX >= 0 && spawnX < gameState.worldWidth &&
                spawnY >= 0 && spawnY < gameState.worldHeight &&
                gameState.map[spawnY][spawnX] === TERRAIN_TYPES.GRASS) {
                
                // Check if there's already an object at this position
                const existingObject = this.mapObjects.find(obj => obj.x === spawnX && obj.y === spawnY);
                if (!existingObject) {
                    // Spawn new tree
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
                    break; // Successfully spawned, exit loop
                }
            }
        }
    }

    // Get objects at a specific tile (for rendering and collision)
    getObjectsAtTile(x, y) {
        return this.mapObjects.filter(obj => 
            Math.floor(obj.x) === x && Math.floor(obj.y) === y
        );
    }
}
