import { ACTION_TYPES, CHARACTER_STATES, TERRAIN_TYPES } from './constants.js';
import { enableSwimmingForCharacter, enableClimbingForCharacter } from './pathfinding.js';

export class Character {
    constructor(id, x, y) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.health = 100;
        this.energy = 100;
        this.state = CHARACTER_STATES.IDLE;
        this.currentAction = null;
        this.actionStartTime = 0;
        this.actionProgress = 0;
        this.skills = new Map();
    }

    // Update character based on current action
    update(deltaTime, gameState, pathfindingSystem) {
        if (!this.currentAction) {
            this.assignRandomAction(gameState, pathfindingSystem);
            return;
        }
        
        const currentTime = Date.now();
        const actionElapsed = currentTime - this.actionStartTime;
        
        if (this.currentAction.type === ACTION_TYPES.MOVE_TO) {
            this.updateMoveAction(actionElapsed, deltaTime, gameState, pathfindingSystem);
        } else if (this.currentAction.type === ACTION_TYPES.WAIT) {
            this.updateWaitAction(actionElapsed, gameState, pathfindingSystem);
        }
    }

    assignRandomAction(gameState, pathfindingSystem) {
        const actions = [ACTION_TYPES.MOVE_TO, ACTION_TYPES.WAIT];
        const actionType = actions[Math.floor(Math.random() * actions.length)];
        
        if (actionType === ACTION_TYPES.MOVE_TO) {
            // Choose a random target location
            const maxAttempts = 10;
            let targetFound = false;
            
            for (let attempt = 0; attempt < maxAttempts; attempt++) {
                const targetX = Math.floor(Math.random() * gameState.worldWidth);
                const targetY = Math.floor(Math.random() * gameState.worldHeight);
                
                // Use pathfinding to find a reachable destination
                const result = pathfindingSystem.findReachableDestination(
                    this.x, this.y, targetX, targetY, this, gameState
                );
                
                if (result) {
                    this.currentAction = {
                        type: ACTION_TYPES.MOVE_TO,
                        targetX: result.x,
                        targetY: result.y,
                        path: result.path,
                        currentPathIndex: 0,
                        moveSpeed: 1.0 // tiles per second
                    };
                    this.state = CHARACTER_STATES.MOVING;
                    targetFound = true;
                    break;
                }
            }
            
            if (!targetFound) {
                // If no path found, just wait
                this.currentAction = {
                    type: ACTION_TYPES.WAIT,
                    duration: 3000 // 3 seconds
                };
                this.state = CHARACTER_STATES.WAITING;
            }
        } else {
            // Wait action
            this.currentAction = {
                type: ACTION_TYPES.WAIT,
                duration: 2000 // 2 seconds in milliseconds
            };
            this.state = CHARACTER_STATES.WAITING;
        }
        
        this.actionStartTime = Date.now();
        this.actionProgress = 0;
    }

    updateMoveAction(elapsed, deltaTime, gameState, pathfindingSystem) {
        const action = this.currentAction;
        
        // If no path, switch to waiting
        if (!action.path || action.path.length === 0) {
            this.currentAction = null;
            this.state = CHARACTER_STATES.IDLE;
            this.assignRandomAction(gameState, pathfindingSystem);
            return;
        }
        
        // Get current target waypoint
        if (action.currentPathIndex >= action.path.length) {
            // Path completed
            this.currentAction = null;
            this.state = CHARACTER_STATES.IDLE;
            this.assignRandomAction(gameState, pathfindingSystem);
            return;
        }
        
        const currentWaypoint = action.path[action.currentPathIndex];
        const dx = currentWaypoint.x - this.x;
        const dy = currentWaypoint.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Check if we've reached the current waypoint
        if (distance < 0.1) {
            action.currentPathIndex++;
            if (action.currentPathIndex >= action.path.length) {
                // Path completed
                this.x = action.targetX;
                this.y = action.targetY;
                this.currentAction = null;
                this.state = CHARACTER_STATES.IDLE;
                this.assignRandomAction(gameState, pathfindingSystem);
            }
            return;
        }
        
        // Move towards current waypoint
        const moveDistance = action.moveSpeed * (deltaTime / 1000); // Convert to seconds
        const moveRatio = Math.min(moveDistance / distance, 1);
        
        this.x += dx * moveRatio;
        this.y += dy * moveRatio;
        
        // Keep character within map bounds
        this.x = Math.max(0, Math.min(gameState.worldWidth - 1, this.x));
        this.y = Math.max(0, Math.min(gameState.worldHeight - 1, this.y));
    }

    updateWaitAction(elapsed, gameState, pathfindingSystem) {
        const action = this.currentAction;
        
        if (elapsed >= action.duration) {
            // Wait completed
            this.currentAction = null;
            this.state = CHARACTER_STATES.IDLE;
            this.assignRandomAction(gameState, pathfindingSystem);
        }
    }
}

export class CharacterManager {
    constructor() {
        this.characters = [];
    }

    // Generate characters based on tribe size
    generateCharacters(gameState) {
        this.characters = [];
        
        for (let i = 0; i < gameState.tribeSize; i++) {
            let x, y;
            let attempts = 0;
            
            // Try to place characters on land (not water)
            do {
                x = Math.floor(Math.random() * gameState.worldWidth);
                y = Math.floor(Math.random() * gameState.worldHeight);
                attempts++;
            } while (gameState.map[y][x] === TERRAIN_TYPES.WATER && attempts < 50);
            
            const character = new Character(i, x, y);
            
            // Assign initial action will be called in first update
            this.characters.push(character);
        }

        gameState.characters = this.characters;
    }

    // Initialize special abilities for characters
    initializeCharacterAbilities(pathfindingSystem) {
        this.characters.forEach(character => {
            // Clear any existing skills
            character.skills = new Map();
            
            // 10% chance for swimming ability
            if (Math.random() < 0.1) {
                enableSwimmingForCharacter(character, pathfindingSystem);
            }
            
            // 5% chance for climbing ability
            if (Math.random() < 0.05) {
                enableClimbingForCharacter(character, pathfindingSystem);
            }
        });
    }

    // Update all characters
    updateCharacters(deltaTime, gameState, pathfindingSystem) {
        for (const character of this.characters) {
            character.update(deltaTime, gameState, pathfindingSystem);
        }
    }

    // Get characters at a specific tile (for rendering)
    getCharactersAtTile(x, y) {
        return this.characters.filter(char => {
            const charTileX = Math.floor(char.x);
            const charTileY = Math.floor(char.y);
            return charTileX === x && charTileY === y;
        });
    }
}
