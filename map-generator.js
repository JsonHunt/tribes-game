import { TERRAIN_TYPES, BIOMES } from './constants.js';
import { BiomeGeneratorFactory } from './biome-generator.js';

export class MapGenerator {
    static generateMap(gameState) {
        gameState.map = [];
        for (let y = 0; y < gameState.worldHeight; y++) {
            gameState.map[y] = [];
            for (let x = 0; x < gameState.worldWidth; x++) {
                gameState.map[y][x] = null;
            }
        }
        const generator = BiomeGeneratorFactory.createGenerator(
            gameState.biomeAlgorithm,
            TERRAIN_TYPES,
            BIOMES
        );
        generator.generateBiomes(gameState);
    }

    static generateTerrain(x, y, gameState) {
        const centerX = gameState.worldWidth / 2;
        const centerY = gameState.worldHeight / 2;
        const distanceFromCenter = Math.sqrt((x - centerX) * (x - centerX) + (y - centerY) * (y - centerY));
        const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);
        const noise = (Math.sin(x * 0.1) * Math.cos(y * 0.1) + Math.random() - 0.5) * 0.3;
        const normalizedDistance = distanceFromCenter / maxDistance + noise;
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
