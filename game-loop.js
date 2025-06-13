import { CharacterManager } from './character.js';
import { MapObjectManager } from './map.js';
import { UIManager } from './ui-manager.js';

export class GameLoop {
    constructor() {
        this.isRunning = false;
        this.intervalId = null;
        this.lastUpdate = Date.now();
        this.gameSpeed = 1.0; // Default speed multiplier
        this.baseInterval = 100; // Base update interval in ms
    }

    start(gameState) {
        if (this.isRunning) {
            this.stop();
        }
        
        this.isRunning = true;
        this.lastUpdate = Date.now();
        
        const updateInterval = this.baseInterval / this.gameSpeed;
        
        this.intervalId = setInterval(() => {
            const currentTime = Date.now();
            const deltaTime = (currentTime - this.lastUpdate) * this.gameSpeed; // Apply speed multiplier
            this.lastUpdate = currentTime;
            
            // Update character actions
            CharacterManager.getInstance().updateCharacters(deltaTime, gameState, window.pathfindingSystem);
            
            // Update map objects (e.g., trees, boulders)
            MapObjectManager.getInstance().updateMapObjects(deltaTime, gameState);
            
            // Re-render map to show updated character and object positions
            UIManager.getInstance().renderMap();
        }, updateInterval);
        
        gameState.gameLoop = this.intervalId;
    }

    setSpeed(speed) {
        this.gameSpeed = Math.max(0.1, Math.min(5.0, speed)); // Clamp between 0.1x and 5.0x
        
        // If running, restart with new speed
        if (this.isRunning) {
            const gameState = window.gameState;
            
            if (gameState) {
                this.start(gameState);
            }
        }
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
