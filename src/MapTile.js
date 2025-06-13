// UIMapTile: Handles creation, updating, and lookup of map tile DOM elements

export const TERRAIN_TYPES = {
    GRASS: 'grass',
    ROCK: 'rock', 
    WATER: 'water',
    SNOW: 'snow',
    SAND: 'sand'
};

export class MapTile {
    constructor(terrainType) {
        this.terrainType = terrainType;
        this.domElement = document.createElement('div');
        this.domElement.className = `terrain-tile terrain-${terrainType}`;
    }

    updateTerrain(terrainType) {
        this.terrainType = terrainType;
        this.domElement.className = `terrain-tile terrain-${terrainType}`;    }
}
