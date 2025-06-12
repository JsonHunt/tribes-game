// Biome Generation System
// Provides different biome generation algorithms that can be swapped at runtime

// Available biome generation algorithms
const BIOME_ALGORITHMS = {
    CLUSTER: 'cluster',
    VORONOI: 'voronoi',
    PERLIN: 'perlin'
};

// Base biome generator class
class BiomeGenerator {
    constructor(terrainTypes, biomes) {
        this.terrainTypes = terrainTypes;
        this.biomes = biomes;
    }

    // Override this method in subclasses
    generateBiomes(gameState) {
        throw new Error('generateBiomes method must be implemented by subclass');
    }

    // Helper method to select terrain from biome
    selectTerrainFromBiome(biome) {
        const rand = Math.random();
        let cumulativeProbability = 0;
        
        for (const [terrain, probability] of Object.entries(biome.probability)) {
            cumulativeProbability += probability;
            if (rand <= cumulativeProbability) {
                return terrain;
            }
        }
        
        return biome.primaryTerrain; // Fallback
    }

    // Helper method to get randomized neighbors
    getRandomizedNeighbors(x, y) {
        const neighbors = [
            { x: x + 1, y: y },
            { x: x - 1, y: y },
            { x: x, y: y + 1 },
            { x: x, y: y - 1 }
        ];
        
        // Sometimes include diagonal neighbors for more interesting shapes
        if (Math.random() < 0.3) {
            neighbors.push(
                { x: x + 1, y: y + 1 },
                { x: x + 1, y: y - 1 },
                { x: x - 1, y: y + 1 },
                { x: x - 1, y: y - 1 }
            );
        }
        
        // Shuffle the neighbors array for randomness
        return neighbors.sort(() => Math.random() - 0.5);
    }

    // Helper method for fallback terrain generation
    generateFallbackTerrain(x, y, gameState) {
        const centerX = gameState.worldWidth / 2;
        const centerY = gameState.worldHeight / 2;
        const distanceFromCenter = Math.sqrt((x - centerX) * (x - centerX) + (y - centerY) * (y - centerY));
        const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);
        
        const noise = (Math.sin(x * 0.1) * Math.cos(y * 0.1) + Math.random() - 0.5) * 0.3;
        const normalizedDistance = distanceFromCenter / maxDistance + noise;
        
        if (normalizedDistance < 0.2) {
            return Math.random() < 0.7 ? this.terrainTypes.GRASS : this.terrainTypes.WATER;
        } else if (normalizedDistance < 0.4) {
            return Math.random() < 0.5 ? this.terrainTypes.GRASS : this.terrainTypes.SAND;
        } else if (normalizedDistance < 0.6) {
            return Math.random() < 0.4 ? this.terrainTypes.SAND : this.terrainTypes.ROCK;
        } else if (normalizedDistance < 0.8) {
            return Math.random() < 0.6 ? this.terrainTypes.ROCK : this.terrainTypes.SNOW;
        } else {
            return this.terrainTypes.SNOW;
        }
    }
}

// Cluster-based biome generation (original algorithm)
class ClusterBiomeGenerator extends BiomeGenerator {
    generateBiomes(gameState) {
        const biomeTypes = Object.keys(this.biomes);
        const numBiomes = Math.floor((gameState.worldWidth * gameState.worldHeight) / 400) + 3;
        
        // Create biome seeds
        const biomeSeeds = [];
        for (let i = 0; i < numBiomes; i++) {
            const biomeType = biomeTypes[Math.floor(Math.random() * biomeTypes.length)];
            const seed = {
                x: Math.floor(Math.random() * gameState.worldWidth),
                y: Math.floor(Math.random() * gameState.worldHeight),
                type: biomeType,
                size: Math.floor(Math.random() * 200) + 50
            };
            biomeSeeds.push(seed);
        }
        
        // Grow biomes from seeds
        for (const seed of biomeSeeds) {
            this.growBiome(seed, gameState);
        }
        
        // Fill remaining tiles
        this.fillRemainingTiles(gameState);
    }

    growBiome(seed, gameState) {
        const visited = new Set();
        const queue = [{ x: seed.x, y: seed.y, distance: 0 }];
        const biome = this.biomes[seed.type];
        let tilesPlaced = 0;
        
        while (queue.length > 0 && tilesPlaced < seed.size) {
            const current = queue.shift();
            const key = `${current.x},${current.y}`;
            
            if (visited.has(key) || 
                current.x < 0 || current.x >= gameState.worldWidth ||
                current.y < 0 || current.y >= gameState.worldHeight ||
                gameState.map[current.y][current.x] !== null) {
                continue;
            }
            
            visited.add(key);
            
            const terrain = this.selectTerrainFromBiome(biome);
            gameState.map[current.y][current.x] = terrain;
            tilesPlaced++;
            
            const neighbors = this.getRandomizedNeighbors(current.x, current.y);
            for (const neighbor of neighbors) {
                const distanceFromSeed = Math.sqrt(
                    (neighbor.x - seed.x) ** 2 + (neighbor.y - seed.y) ** 2
                );
                
                const growthProbability = Math.max(0, 1 - (distanceFromSeed / (seed.size / 10))) * Math.random();
                
                if (growthProbability > 0.3) {
                    queue.push({ x: neighbor.x, y: neighbor.y, distance: current.distance + 1 });
                }
            }
        }
    }

    fillRemainingTiles(gameState) {
        for (let y = 0; y < gameState.worldHeight; y++) {
            for (let x = 0; x < gameState.worldWidth; x++) {
                if (gameState.map[y][x] === null) {
                    gameState.map[y][x] = this.generateFallbackTerrain(x, y, gameState);
                }
            }
        }
    }
}

// Voronoi-based biome generation
class VoronoiBiomeGenerator extends BiomeGenerator {
    generateBiomes(gameState) {
        const biomeTypes = Object.keys(this.biomes);
        const numSeeds = Math.floor((gameState.worldWidth * gameState.worldHeight) / 300) + 5;
        
        // Create Voronoi seeds
        const seeds = [];
        for (let i = 0; i < numSeeds; i++) {
            seeds.push({
                x: Math.floor(Math.random() * gameState.worldWidth),
                y: Math.floor(Math.random() * gameState.worldHeight),
                biomeType: biomeTypes[Math.floor(Math.random() * biomeTypes.length)]
            });
        }
        
        // Assign each tile to the nearest seed
        for (let y = 0; y < gameState.worldHeight; y++) {
            for (let x = 0; x < gameState.worldWidth; x++) {
                let nearestSeed = seeds[0];
                let minDistance = Infinity;
                
                for (const seed of seeds) {
                    const distance = Math.sqrt((x - seed.x) ** 2 + (y - seed.y) ** 2);
                    if (distance < minDistance) {
                        minDistance = distance;
                        nearestSeed = seed;
                    }
                }
                
                const biome = this.biomes[nearestSeed.biomeType];
                gameState.map[y][x] = this.selectTerrainFromBiome(biome);
            }
        }
    }
}

// Perlin noise-based biome generation (simplified)
class PerlinBiomeGenerator extends BiomeGenerator {
    generateBiomes(gameState) {
        const biomeTypes = Object.keys(this.biomes);
        
        for (let y = 0; y < gameState.worldHeight; y++) {
            for (let x = 0; x < gameState.worldWidth; x++) {
                // Simple noise function
                const noise1 = Math.sin(x * 0.05) * Math.cos(y * 0.05);
                const noise2 = Math.sin(x * 0.1) * Math.cos(y * 0.1) * 0.5;
                const combinedNoise = noise1 + noise2 + Math.random() * 0.2;
                
                // Map noise to biome type
                let biomeIndex = Math.floor((combinedNoise + 1.5) * biomeTypes.length / 3);
                biomeIndex = Math.max(0, Math.min(biomeTypes.length - 1, biomeIndex));
                
                const biomeType = biomeTypes[biomeIndex];
                const biome = this.biomes[biomeType];
                gameState.map[y][x] = this.selectTerrainFromBiome(biome);
            }
        }
    }
}

// Biome generator factory
class BiomeGeneratorFactory {
    static createGenerator(algorithm, terrainTypes, biomes) {
        switch (algorithm) {
            case BIOME_ALGORITHMS.CLUSTER:
                return new ClusterBiomeGenerator(terrainTypes, biomes);
            case BIOME_ALGORITHMS.VORONOI:
                return new VoronoiBiomeGenerator(terrainTypes, biomes);
            case BIOME_ALGORITHMS.PERLIN:
                return new PerlinBiomeGenerator(terrainTypes, biomes);
            default:
                return new ClusterBiomeGenerator(terrainTypes, biomes);
        }
    }
}

// Export for ES6 modules
export { BIOME_ALGORITHMS, BiomeGeneratorFactory };
