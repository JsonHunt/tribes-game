export class GameLoop {
    constructor() {
        this.isRunning = false;
        this.intervalId = null;
        this.lastUpdate = Date.now();
    }

    start(gameState, characterManager, mapObjectManager, uiManager) {
        if (this.isRunning) {
            this.stop();
        }
        
        this.isRunning = true;
        this.lastUpdate = Date.now();
        
        this.intervalId = setInterval(() => {
            const currentTime = Date.now();
            const deltaTime = currentTime - this.lastUpdate;
            this.lastUpdate = currentTime;
              // Update character actions
            characterManager.updateCharacters(deltaTime, gameState, window.pathfindingSystem);
            
            // Update map objects (e.g., trees, boulders)
            mapObjectManager.updateMapObjects(deltaTime, gameState);
            
            // Re-render map to show updated character and object positions
            uiManager.renderMap();
        }, 100); // Update every 100ms
        
        gameState.gameLoop = this.intervalId;
    }

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.isRunning = false;
    }

    isActive() {
        return this.isRunning;
    }
}
