export class GameState {
    constructor() {
        this.worldWidth = 50;
        this.worldHeight = 50;
        this.tribeSize = 10;
        this.currentScreen = 'start';
        this.map = [];
        this.mapPosition = { x: 0, y: 0 };
        this.zoomLevel = 1;
        this.tileSize = 20;
        this.biomeAlgorithm = 'cluster'; // Default biome generation algorithm
        this.characters = []; // Array to store character positions
        this.mapObjects = []; // Array to store trees, boulders, etc.
        this.isDragging = false; // Mouse drag state
        this.lastMousePos = { x: 0, y: 0 }; // Last mouse position for dragging
        this.gameLoop = null; // Game loop interval
        this.lastUpdate = Date.now(); // Last update timestamp
        this.showPaths = false; // Debug option to show paths
    }

    // Reset state for new game
    reset() {
        this.map = [];
        this.characters = [];
        this.mapObjects = [];
        this.mapPosition = { x: 0, y: 0 };
        this.zoomLevel = 1;
        this.isDragging = false;
        this.lastMousePos = { x: 0, y: 0 };
        this.lastUpdate = Date.now();
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
    }

    // Validate configuration inputs
    validateConfiguration(worldWidth, worldHeight, tribeSize) {
        return !(worldWidth < 10 || worldWidth > 200 ||
                worldHeight < 10 || worldHeight > 200 ||
                tribeSize < 5 || tribeSize > 100);
    }

    // Update configuration from UI inputs
    updateConfiguration(worldWidth, worldHeight, tribeSize, biomeAlgorithm) {
        this.worldWidth = worldWidth;
        this.worldHeight = worldHeight;
        this.tribeSize = tribeSize;
        this.biomeAlgorithm = biomeAlgorithm;
    }
}
