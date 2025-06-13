import { ACTION_TYPES, CHARACTER_STATES } from './constants.js';

// Character update and behavior methods
export class CharacterUpdates {
    
    static updateCharacter(character, deltaTime, gameState, pathfindingSystem) {
        // Update needs first
        character.updateNeeds(deltaTime);
        
        if (!character.currentAction) {
            character.assignActionBasedOnNeeds(gameState, pathfindingSystem);
            return;
        }
        
        const currentTime = Date.now();
        const actionElapsed = currentTime - character.actionStartTime;
        
        if (character.currentAction.type === ACTION_TYPES.MOVE_TO) {
            this.updateMoveAction(character, actionElapsed, deltaTime, gameState, pathfindingSystem);
        } else if (character.currentAction.type === ACTION_TYPES.WAIT) {
            this.updateWaitAction(character, actionElapsed, gameState, pathfindingSystem);
        } else if (character.currentAction.type === ACTION_TYPES.DRINK) {
            this.updateDrinkAction(character, actionElapsed, gameState, pathfindingSystem);
        } else if (character.currentAction.type === ACTION_TYPES.EAT) {
            this.updateEatAction(character, actionElapsed, gameState, pathfindingSystem);
        } else if (character.currentAction.type === ACTION_TYPES.REST) {
            this.updateRestAction(character, actionElapsed, gameState, pathfindingSystem);
        }
    }

    static updateMoveAction(character, elapsed, deltaTime, gameState, pathfindingSystem) {
        const action = character.currentAction;
        
        // If no path, switch to waiting
        if (!action.path || action.path.length === 0) {
            character.currentAction = null;
            character.state = CHARACTER_STATES.IDLE;
            character.assignRandomAction(gameState, pathfindingSystem);
            return;
        }
        
        // Get current target waypoint
        if (action.currentPathIndex >= action.path.length) {
            // Path completed
            character.currentAction = null;
            character.state = CHARACTER_STATES.IDLE;
            character.assignRandomAction(gameState, pathfindingSystem);
            return;
        }
        
        const currentWaypoint = action.path[action.currentPathIndex];
        const dx = currentWaypoint.x - character.x;
        const dy = currentWaypoint.y - character.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Check if we've reached the current waypoint
        if (distance < 0.1) {
            action.currentPathIndex++;
            if (action.currentPathIndex >= action.path.length) {
                // Path completed
                character.x = action.targetX;
                character.y = action.targetY;
                character.currentAction = null;
                character.state = CHARACTER_STATES.IDLE;
                character.assignRandomAction(gameState, pathfindingSystem);
            }
            return;
        }
        
        // Move towards current waypoint
        const moveDistance = action.moveSpeed * (deltaTime / 1000); // Convert to seconds
        const moveRatio = Math.min(moveDistance / distance, 1);
        
        // Update direction based on movement
        character.updateDirection(dx, dy);
        
        character.x += dx * moveRatio;
        character.y += dy * moveRatio;
        
        // Keep character within map bounds
        character.x = Math.max(0, Math.min(gameState.worldWidth - 1, character.x));
        character.y = Math.max(0, Math.min(gameState.worldHeight - 1, character.y));
    }

    static updateWaitAction(character, elapsed, gameState, pathfindingSystem) {
        const action = character.currentAction;
        
        if (elapsed >= action.duration) {
            // Wait completed
            character.currentAction = null;
            character.state = CHARACTER_STATES.IDLE;
            character.assignActionBasedOnNeeds(gameState, pathfindingSystem);
        }
    }

    static updateDrinkAction(character, elapsed, gameState, pathfindingSystem) {
        const action = character.currentAction;
        
        // First move to the water source
        if (action.path && action.currentPathIndex < action.path.length) {
            this.updateMoveAction(character, elapsed, 16, gameState, pathfindingSystem); // deltaTime for movement
            return;
        }
        
        // At water source, drink
        if (elapsed >= action.duration) {
            // Drinking completed - restore thirst
            const thirstNeed = character.needs.get('thirst');
            if (thirstNeed) {
                thirstNeed.satisfaction = Math.min(100, thirstNeed.satisfaction + 40);
            }
            
            character.currentAction = null;
            character.state = CHARACTER_STATES.IDLE;
            character.assignActionBasedOnNeeds(gameState, pathfindingSystem);
        }
    }

    static updateEatAction(character, elapsed, gameState, pathfindingSystem) {
        const action = character.currentAction;
        
        // First move to the food source
        if (action.path && action.currentPathIndex < action.path.length) {
            this.updateMoveAction(character, elapsed, 16, gameState, pathfindingSystem);
            return;
        }
        
        // At food source, eat
        if (elapsed >= action.duration) {
            // Eating completed - restore hunger
            const hungerNeed = character.needs.get('hunger');
            if (hungerNeed) {
                hungerNeed.satisfaction = Math.min(100, hungerNeed.satisfaction + 35);
            }
            
            character.currentAction = null;
            character.state = CHARACTER_STATES.IDLE;
            character.assignActionBasedOnNeeds(gameState, pathfindingSystem);
        }
    }

    static updateRestAction(character, elapsed, gameState, pathfindingSystem) {
        const action = character.currentAction;
        
        // First move to the rest spot if needed
        if (action.path && action.currentPathIndex < action.path.length) {
            this.updateMoveAction(character, elapsed, 16, gameState, pathfindingSystem);
            return;
        }
        
        // Resting
        if (elapsed >= action.duration) {
            // Resting completed - restore rest and energy
            const restNeed = character.needs.get('rest');
            if (restNeed) {
                restNeed.satisfaction = Math.min(100, restNeed.satisfaction + 30);
            }
            
            character.energy = Math.min(100, character.energy + 25);
            
            character.currentAction = null;
            character.state = CHARACTER_STATES.IDLE;
            character.assignActionBasedOnNeeds(gameState, pathfindingSystem);
        }
    }
}
