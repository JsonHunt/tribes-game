import { ACTION_TYPES, CHARACTER_STATES, TERRAIN_TYPES } from './constants.js';

// Character action assignment methods
export class CharacterActions {
    
    static assignActionBasedOnNeeds(character, gameState, pathfindingSystem) {
        const urgentNeed = character.getMostUrgentNeed();
        
        if (!urgentNeed) {
            this.assignRandomAction(character, gameState, pathfindingSystem);
            return;
        }

        // Behavior based on most urgent need
        switch (urgentNeed.name) {
            case 'thirst':
                this.assignDrinkAction(character, gameState, pathfindingSystem);
                break;
            case 'hunger':
                this.assignEatAction(character, gameState, pathfindingSystem);
                break;
            case 'rest':
                this.assignRestAction(character, gameState, pathfindingSystem);
                break;
            case 'safety':
                this.assignSafetyAction(character, gameState, pathfindingSystem);
                break;
            case 'social':
                this.assignSocialAction(character, gameState, pathfindingSystem);
                break;
            default:
                // For needs without specific actions, do exploration
                this.assignExplorationAction(character, gameState, pathfindingSystem);
                break;
        }
    }

    static assignDrinkAction(character, gameState, pathfindingSystem) {
        // Look for water tiles nearby
        const waterTiles = character.findNearbyTerrain(gameState, TERRAIN_TYPES.WATER, 10);
        
        if (waterTiles.length > 0) {
            const targetWater = waterTiles[Math.floor(Math.random() * waterTiles.length)];
            const result = pathfindingSystem.findReachableDestination(
                character.x, character.y, targetWater.x, targetWater.y, character, gameState, 3
            );
            
            if (result) {
                character.currentAction = {
                    type: ACTION_TYPES.DRINK,
                    targetX: result.x,
                    targetY: result.y,
                    path: result.path,
                    currentPathIndex: 0,
                    moveSpeed: 1.0,
                    duration: 2000 // 2 seconds to drink
                };
                character.state = CHARACTER_STATES.MOVING;
                character.actionStartTime = Date.now();
                return;
            }
        }
        
        // No water found, explore
        this.assignExplorationAction(character, gameState, pathfindingSystem);
    }

    static assignEatAction(character, gameState, pathfindingSystem) {
        // Look for grass or areas with potential food
        const grassTiles = character.findNearbyTerrain(gameState, TERRAIN_TYPES.GRASS, 8);
        
        if (grassTiles.length > 0) {
            const targetGrass = grassTiles[Math.floor(Math.random() * grassTiles.length)];
            const result = pathfindingSystem.findReachableDestination(
                character.x, character.y, targetGrass.x, targetGrass.y, character, gameState, 3
            );
            
            if (result) {
                character.currentAction = {
                    type: ACTION_TYPES.EAT,
                    targetX: result.x,
                    targetY: result.y,
                    path: result.path,
                    currentPathIndex: 0,
                    moveSpeed: 1.0,
                    duration: 3000 // 3 seconds to gather and eat
                };
                character.state = CHARACTER_STATES.MOVING;
                character.actionStartTime = Date.now();
                return;
            }
        }
        
        // No food source found, explore
        this.assignExplorationAction(character, gameState, pathfindingSystem);
    }

    static assignRestAction(character, gameState, pathfindingSystem) {
        // Find a safe place to rest (avoid water, prefer grass)
        const safeTiles = character.findNearbyTerrain(gameState, TERRAIN_TYPES.GRASS, 5);
        
        if (safeTiles.length > 0) {
            const restSpot = safeTiles[Math.floor(Math.random() * safeTiles.length)];
            const result = pathfindingSystem.findReachableDestination(
                character.x, character.y, restSpot.x, restSpot.y, character, gameState, 2
            );
            
            if (result) {
                character.currentAction = {
                    type: ACTION_TYPES.REST,
                    targetX: result.x,
                    targetY: result.y,
                    path: result.path,
                    currentPathIndex: 0,
                    moveSpeed: 0.8, // Move slower when tired
                    duration: 5000 // 5 seconds to rest
                };
                character.state = CHARACTER_STATES.MOVING;
                character.actionStartTime = Date.now();
                return;
            }
        }
        
        // Rest in place if no better spot
        character.currentAction = {
            type: ACTION_TYPES.REST,
            duration: 4000
        };
        character.state = CHARACTER_STATES.WAITING;
        character.actionStartTime = Date.now();
    }

    static assignSafetyAction(character, gameState, pathfindingSystem) {
        // Move away from water or dangerous areas
        const safeTiles = character.findNearbyTerrain(gameState, TERRAIN_TYPES.GRASS, 6);
        const rockTiles = character.findNearbyTerrain(gameState, TERRAIN_TYPES.ROCK, 6);
        const allSafeTiles = [...safeTiles, ...rockTiles];
        
        if (allSafeTiles.length > 0) {
            const safeSpot = allSafeTiles[Math.floor(Math.random() * allSafeTiles.length)];
            const result = pathfindingSystem.findReachableDestination(
                character.x, character.y, safeSpot.x, safeSpot.y, character, gameState
            );
            
            if (result) {
                character.currentAction = {
                    type: ACTION_TYPES.MOVE_TO,
                    targetX: result.x,
                    targetY: result.y,
                    path: result.path,
                    currentPathIndex: 0,
                    moveSpeed: 1.2 // Move faster when seeking safety
                };
                character.state = CHARACTER_STATES.MOVING;
                character.actionStartTime = Date.now();
                return;
            }
        }
        
        this.assignRandomAction(character, gameState, pathfindingSystem);
    }

    static assignSocialAction(character, gameState, pathfindingSystem) {
        // Find another character to interact with
        const nearbyCharacters = gameState.characters.filter(char => 
            char.id !== character.id && character.getDistanceTo(char) < 15
        );
        
        if (nearbyCharacters.length > 0) {
            const targetCharacter = nearbyCharacters[Math.floor(Math.random() * nearbyCharacters.length)];
            const result = pathfindingSystem.findReachableDestination(
                character.x, character.y, targetCharacter.x, targetCharacter.y, character, gameState, 3
            );
            
            if (result) {
                character.currentAction = {
                    type: ACTION_TYPES.MOVE_TO,
                    targetX: result.x,
                    targetY: result.y,
                    path: result.path,
                    currentPathIndex: 0,
                    moveSpeed: 1.0,
                    socialTarget: targetCharacter.id
                };
                character.state = CHARACTER_STATES.MOVING;
                character.actionStartTime = Date.now();
                return;
            }
        }
        
        // No social targets found, explore
        this.assignExplorationAction(character, gameState, pathfindingSystem);
    }

    static assignExplorationAction(character, gameState, pathfindingSystem) {
        // Enhanced exploration based on traits
        const isAdventurous = character.traits.has('adventurous');
        const isCautious = character.traits.has('cautious');
        
        let maxDistance = 8;
        if (isAdventurous) maxDistance = 15;
        if (isCautious) maxDistance = 5;
        
        for (let attempt = 0; attempt < 10; attempt++) {
            const targetX = Math.floor(Math.random() * gameState.worldWidth);
            const targetY = Math.floor(Math.random() * gameState.worldHeight);
            
            const distance = Math.sqrt(Math.pow(targetX - character.x, 2) + Math.pow(targetY - character.y, 2));
            if (distance > maxDistance) continue;
            
            const result = pathfindingSystem.findReachableDestination(
                character.x, character.y, targetX, targetY, character, gameState
            );
            
            if (result) {
                character.currentAction = {
                    type: ACTION_TYPES.MOVE_TO,
                    targetX: result.x,
                    targetY: result.y,
                    path: result.path,
                    currentPathIndex: 0,
                    moveSpeed: isAdventurous ? 1.1 : isCautious ? 0.9 : 1.0
                };
                character.state = CHARACTER_STATES.MOVING;
                character.actionStartTime = Date.now();
                return;
            }
        }
        
        // Fallback to waiting
        character.currentAction = {
            type: ACTION_TYPES.WAIT,
            duration: 2000
        };
        character.state = CHARACTER_STATES.WAITING;
        character.actionStartTime = Date.now();
    }

    static assignRandomAction(character, gameState, pathfindingSystem) {
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
                    character.x, character.y, targetX, targetY, character, gameState
                );
                
                if (result) {
                    character.currentAction = {
                        type: ACTION_TYPES.MOVE_TO,
                        targetX: result.x,
                        targetY: result.y,
                        path: result.path,
                        currentPathIndex: 0,
                        moveSpeed: 1.0 // tiles per second
                    };
                    character.state = CHARACTER_STATES.MOVING;
                    targetFound = true;
                    break;
                }
            }
            
            if (!targetFound) {
                // If no path found, just wait
                character.currentAction = {
                    type: ACTION_TYPES.WAIT,
                    duration: 3000 // 3 seconds
                };
                character.state = CHARACTER_STATES.WAITING;
            }
        } else {
            // Wait action
            character.currentAction = {
                type: ACTION_TYPES.WAIT,
                duration: 2000 // 2 seconds in milliseconds
            };
            character.state = CHARACTER_STATES.WAITING;
        }
        
        character.actionStartTime = Date.now();
        character.actionProgress = 0;
    }
}
