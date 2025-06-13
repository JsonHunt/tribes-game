import { TERRAIN_TYPES } from "./MapTile.js";

// Character action types
export const ACTION_TYPES = {
    MOVE_TO: 'move_to',
    WAIT: 'wait',
    DRINK: 'drink',
    EAT: 'eat',
    REST: 'rest',
    SOCIALIZE: 'socialize'
};

// Character states
export const CHARACTER_STATES = {
    IDLE: 'idle',
    MOVING: 'moving',
    WAITING: 'waiting'
};

// Map object types
export const OBJECT_TYPES = {
    TREE: 'tree',
    BOULDER: 'boulder'
};

// Biome definitions
export const BIOMES = {
    GRASSLAND: {
        primaryTerrain: TERRAIN_TYPES.GRASS,
        secondaryTerrains: [TERRAIN_TYPES.WATER],
        probability: { [TERRAIN_TYPES.GRASS]: 0.8, [TERRAIN_TYPES.WATER]: 0.2 }
    },
    MOUNTAINS: {
        primaryTerrain: TERRAIN_TYPES.ROCK,
        secondaryTerrains: [TERRAIN_TYPES.SNOW],
        probability: { [TERRAIN_TYPES.ROCK]: 0.7, [TERRAIN_TYPES.SNOW]: 0.3 }
    },
    DESERT: {
        primaryTerrain: TERRAIN_TYPES.SAND,
        secondaryTerrains: [TERRAIN_TYPES.ROCK],
        probability: { [TERRAIN_TYPES.SAND]: 0.85, [TERRAIN_TYPES.ROCK]: 0.15 }
    },
    TUNDRA: {
        primaryTerrain: TERRAIN_TYPES.SNOW,
        secondaryTerrains: [TERRAIN_TYPES.ROCK],
        probability: { [TERRAIN_TYPES.SNOW]: 0.9, [TERRAIN_TYPES.ROCK]: 0.1 }
    },
    COASTAL: {
        primaryTerrain: TERRAIN_TYPES.WATER,
        secondaryTerrains: [TERRAIN_TYPES.SAND, TERRAIN_TYPES.GRASS],
        probability: { [TERRAIN_TYPES.WATER]: 0.6, [TERRAIN_TYPES.SAND]: 0.25, [TERRAIN_TYPES.GRASS]: 0.15 }
    }
};

// Import game configuration from existing config file
// Note: Will be imported as GAME_CONFIG in modules that need it
