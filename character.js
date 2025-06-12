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
        this.traits = new Map();
        this.needs = new Map();
        this.initializeCharacterSystems();
    }

    initializeCharacterSystems() {
        // Initialize skills with random values
        this.initializeSkills();
        
        // Initialize traits
        this.initializeTraits();
        
        // Initialize needs (Maslow's hierarchy-inspired)
        this.initializeNeeds();
    }

    initializeSkills() {
        // Core skills with random starting values
        const skillTypes = ['swimming', 'climbing', 'hunting', 'gathering', 'crafting', 'cooking', 'building', 'healing'];
        
        skillTypes.forEach(skill => {
            // Random starting skill level (0-50, can grow to 100)
            const startingLevel = Math.floor(Math.random() * 51);
            this.skills.set(skill, startingLevel);
        });
        
        // Ensure swimming skill exists (as mentioned in requirements)
        if (!this.skills.has('swimming')) {
            this.skills.set('swimming', Math.floor(Math.random() * 51));
        }
    }

    initializeTraits() {
        // Personality traits that affect behavior
        const traits = [
            { name: 'adventurous', probability: 0.3 },
            { name: 'cautious', probability: 0.25 },
            { name: 'social', probability: 0.4 },
            { name: 'independent', probability: 0.2 },
            { name: 'hardworking', probability: 0.35 },
            { name: 'lazy', probability: 0.15 },
            { name: 'brave', probability: 0.3 },
            { name: 'fearful', probability: 0.2 },
            { name: 'curious', probability: 0.4 },
            { name: 'practical', probability: 0.3 }
        ];

        traits.forEach(trait => {
            if (Math.random() < trait.probability) {
                // Trait strength from 1-5
                this.traits.set(trait.name, Math.floor(Math.random() * 5) + 1);
            }
        });
    }

    initializeNeeds() {
        // Human needs in order of priority (lower priority number = higher priority)
        const needsConfig = [
            { name: 'thirst', priority: 1, satisfaction: 80, decayRate: 0.8 },
            { name: 'hunger', priority: 2, satisfaction: 70, decayRate: 0.6 },
            { name: 'safety', priority: 3, satisfaction: 90, decayRate: 0.2 },
            { name: 'rest', priority: 4, satisfaction: 85, decayRate: 0.4 },
            { name: 'warmth', priority: 5, satisfaction: 75, decayRate: 0.3 },
            { name: 'social', priority: 6, satisfaction: 60, decayRate: 0.25 },
            { name: 'purpose', priority: 7, satisfaction: 50, decayRate: 0.15 },
            { name: 'creativity', priority: 8, satisfaction: 40, decayRate: 0.1 }
        ];

        needsConfig.forEach(need => {
            this.needs.set(need.name, {
                priority: need.priority,
                satisfaction: need.satisfaction + Math.random() * 20 - 10, // ±10 random variation
                decayRate: need.decayRate,
                lastUpdate: Date.now()
            });
        });
    }

    // Get the most urgent need (lowest satisfaction relative to priority)
    getMostUrgentNeed() {
        let mostUrgent = null;
        let urgencyScore = Infinity;

        for (const [needName, need] of this.needs) {
            // Lower satisfaction and higher priority (lower number) = more urgent
            const score = need.satisfaction * need.priority;
            if (score < urgencyScore) {
                urgencyScore = score;
                mostUrgent = { name: needName, ...need };
            }
        }

        return mostUrgent;
    }

    // Update needs over time
    updateNeeds(deltaTime) {
        const currentTime = Date.now();
        
        for (const [needName, need] of this.needs) {
            const timeSinceLastUpdate = currentTime - need.lastUpdate;
            const hoursElapsed = timeSinceLastUpdate / (1000 * 60 * 60); // Convert to hours
            
            // Decay satisfaction over time
            const decay = need.decayRate * hoursElapsed * 10; // Accelerated for game time
            need.satisfaction = Math.max(0, need.satisfaction - decay);
            need.lastUpdate = currentTime;
        }
    }    // Update character based on current action
    update(deltaTime, gameState, pathfindingSystem) {
        // Update needs first
        this.updateNeeds(deltaTime);
        
        if (!this.currentAction) {
            this.assignActionBasedOnNeeds(gameState, pathfindingSystem);
            return;
        }
        
        const currentTime = Date.now();
        const actionElapsed = currentTime - this.actionStartTime;
        
        if (this.currentAction.type === ACTION_TYPES.MOVE_TO) {
            this.updateMoveAction(actionElapsed, deltaTime, gameState, pathfindingSystem);
        } else if (this.currentAction.type === ACTION_TYPES.WAIT) {
            this.updateWaitAction(actionElapsed, gameState, pathfindingSystem);
        } else if (this.currentAction.type === ACTION_TYPES.DRINK) {
            this.updateDrinkAction(actionElapsed, gameState, pathfindingSystem);
        } else if (this.currentAction.type === ACTION_TYPES.EAT) {
            this.updateEatAction(actionElapsed, gameState, pathfindingSystem);
        } else if (this.currentAction.type === ACTION_TYPES.REST) {
            this.updateRestAction(actionElapsed, gameState, pathfindingSystem);
        }
    }

    // Assign action based on most urgent need instead of random
    assignActionBasedOnNeeds(gameState, pathfindingSystem) {
        const urgentNeed = this.getMostUrgentNeed();
        
        if (!urgentNeed) {
            this.assignRandomAction(gameState, pathfindingSystem);
            return;
        }

        // Behavior based on most urgent need
        switch (urgentNeed.name) {
            case 'thirst':
                this.assignDrinkAction(gameState, pathfindingSystem);
                break;
            case 'hunger':
                this.assignEatAction(gameState, pathfindingSystem);
                break;
            case 'rest':
                this.assignRestAction(gameState, pathfindingSystem);
                break;
            case 'safety':
                this.assignSafetyAction(gameState, pathfindingSystem);
                break;
            case 'social':
                this.assignSocialAction(gameState, pathfindingSystem);
                break;
            default:
                // For needs without specific actions, do exploration
                this.assignExplorationAction(gameState, pathfindingSystem);
                break;
        }
    }

    assignDrinkAction(gameState, pathfindingSystem) {
        // Look for water tiles nearby
        const waterTiles = this.findNearbyTerrain(gameState, TERRAIN_TYPES.WATER, 10);
        
        if (waterTiles.length > 0) {
            const targetWater = waterTiles[Math.floor(Math.random() * waterTiles.length)];
            const result = pathfindingSystem.findReachableDestination(
                this.x, this.y, targetWater.x, targetWater.y, this, gameState, 3
            );
            
            if (result) {
                this.currentAction = {
                    type: ACTION_TYPES.DRINK,
                    targetX: result.x,
                    targetY: result.y,
                    path: result.path,
                    currentPathIndex: 0,
                    moveSpeed: 1.0,
                    duration: 2000 // 2 seconds to drink
                };
                this.state = CHARACTER_STATES.MOVING;
                this.actionStartTime = Date.now();
                return;
            }
        }
        
        // No water found, explore
        this.assignExplorationAction(gameState, pathfindingSystem);
    }

    assignEatAction(gameState, pathfindingSystem) {
        // Look for grass or areas with potential food
        const grassTiles = this.findNearbyTerrain(gameState, TERRAIN_TYPES.GRASS, 8);
        
        if (grassTiles.length > 0) {
            const targetGrass = grassTiles[Math.floor(Math.random() * grassTiles.length)];
            const result = pathfindingSystem.findReachableDestination(
                this.x, this.y, targetGrass.x, targetGrass.y, this, gameState, 3
            );
            
            if (result) {
                this.currentAction = {
                    type: ACTION_TYPES.EAT,
                    targetX: result.x,
                    targetY: result.y,
                    path: result.path,
                    currentPathIndex: 0,
                    moveSpeed: 1.0,
                    duration: 3000 // 3 seconds to gather and eat
                };
                this.state = CHARACTER_STATES.MOVING;
                this.actionStartTime = Date.now();
                return;
            }
        }
        
        // No food source found, explore
        this.assignExplorationAction(gameState, pathfindingSystem);
    }

    assignRestAction(gameState, pathfindingSystem) {
        // Find a safe place to rest (avoid water, prefer grass)
        const safeTiles = this.findNearbyTerrain(gameState, TERRAIN_TYPES.GRASS, 5);
        
        if (safeTiles.length > 0) {
            const restSpot = safeTiles[Math.floor(Math.random() * safeTiles.length)];
            const result = pathfindingSystem.findReachableDestination(
                this.x, this.y, restSpot.x, restSpot.y, this, gameState, 2
            );
            
            if (result) {
                this.currentAction = {
                    type: ACTION_TYPES.REST,
                    targetX: result.x,
                    targetY: result.y,
                    path: result.path,
                    currentPathIndex: 0,
                    moveSpeed: 0.8, // Move slower when tired
                    duration: 5000 // 5 seconds to rest
                };
                this.state = CHARACTER_STATES.MOVING;
                this.actionStartTime = Date.now();
                return;
            }
        }
        
        // Rest in place if no better spot
        this.currentAction = {
            type: ACTION_TYPES.REST,
            duration: 4000
        };
        this.state = CHARACTER_STATES.WAITING;
        this.actionStartTime = Date.now();
    }

    assignSafetyAction(gameState, pathfindingSystem) {
        // Move away from water or dangerous areas
        const safeTiles = this.findNearbyTerrain(gameState, TERRAIN_TYPES.GRASS, 6);
        const rockTiles = this.findNearbyTerrain(gameState, TERRAIN_TYPES.ROCK, 6);
        const allSafeTiles = [...safeTiles, ...rockTiles];
        
        if (allSafeTiles.length > 0) {
            const safeSpot = allSafeTiles[Math.floor(Math.random() * allSafeTiles.length)];
            const result = pathfindingSystem.findReachableDestination(
                this.x, this.y, safeSpot.x, safeSpot.y, this, gameState
            );
            
            if (result) {
                this.currentAction = {
                    type: ACTION_TYPES.MOVE_TO,
                    targetX: result.x,
                    targetY: result.y,
                    path: result.path,
                    currentPathIndex: 0,
                    moveSpeed: 1.2 // Move faster when seeking safety
                };
                this.state = CHARACTER_STATES.MOVING;
                this.actionStartTime = Date.now();
                return;
            }
        }
        
        this.assignRandomAction(gameState, pathfindingSystem);
    }

    assignSocialAction(gameState, pathfindingSystem) {
        // Find another character to interact with
        const nearbyCharacters = gameState.characters.filter(char => 
            char.id !== this.id && this.getDistanceTo(char) < 15
        );
        
        if (nearbyCharacters.length > 0) {
            const targetCharacter = nearbyCharacters[Math.floor(Math.random() * nearbyCharacters.length)];
            const result = pathfindingSystem.findReachableDestination(
                this.x, this.y, targetCharacter.x, targetCharacter.y, this, gameState, 3
            );
            
            if (result) {
                this.currentAction = {
                    type: ACTION_TYPES.MOVE_TO,
                    targetX: result.x,
                    targetY: result.y,
                    path: result.path,
                    currentPathIndex: 0,
                    moveSpeed: 1.0,
                    socialTarget: targetCharacter.id
                };
                this.state = CHARACTER_STATES.MOVING;
                this.actionStartTime = Date.now();
                return;
            }
        }
        
        this.assignExplorationAction(gameState, pathfindingSystem);
    }

    assignExplorationAction(gameState, pathfindingSystem) {
        // Enhanced exploration based on traits
        const isAdventurous = this.traits.has('adventurous');
        const isCautious = this.traits.has('cautious');
        
        let maxDistance = 8;
        if (isAdventurous) maxDistance = 15;
        if (isCautious) maxDistance = 5;
        
        for (let attempt = 0; attempt < 10; attempt++) {
            const targetX = Math.floor(Math.random() * gameState.worldWidth);
            const targetY = Math.floor(Math.random() * gameState.worldHeight);
            
            const distance = Math.sqrt(Math.pow(targetX - this.x, 2) + Math.pow(targetY - this.y, 2));
            if (distance > maxDistance) continue;
            
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
                    moveSpeed: isAdventurous ? 1.1 : isCautious ? 0.9 : 1.0
                };
                this.state = CHARACTER_STATES.MOVING;
                this.actionStartTime = Date.now();
                return;
            }
        }
        
        // Fallback to waiting
        this.currentAction = {
            type: ACTION_TYPES.WAIT,
            duration: 2000
        };
        this.state = CHARACTER_STATES.WAITING;
        this.actionStartTime = Date.now();
    }

    findNearbyTerrain(gameState, terrainType, maxDistance = 10) {
        const tiles = [];
        const currentX = Math.floor(this.x);
        const currentY = Math.floor(this.y);
        
        for (let y = Math.max(0, currentY - maxDistance); y < Math.min(gameState.worldHeight, currentY + maxDistance); y++) {
            for (let x = Math.max(0, currentX - maxDistance); x < Math.min(gameState.worldWidth, currentX + maxDistance); x++) {
                if (gameState.map[y][x] === terrainType) {
                    const distance = Math.sqrt(Math.pow(x - currentX, 2) + Math.pow(y - currentY, 2));
                    if (distance <= maxDistance) {
                        tiles.push({ x, y, distance });
                    }
                }
            }
        }
        
        // Sort by distance, closest first
        return tiles.sort((a, b) => a.distance - b.distance);
    }

    getDistanceTo(otherCharacter) {
        return Math.sqrt(Math.pow(otherCharacter.x - this.x, 2) + Math.pow(otherCharacter.y - this.y, 2));
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
    }    updateWaitAction(elapsed, gameState, pathfindingSystem) {
        const action = this.currentAction;
        
        if (elapsed >= action.duration) {
            // Wait completed
            this.currentAction = null;
            this.state = CHARACTER_STATES.IDLE;
            this.assignActionBasedOnNeeds(gameState, pathfindingSystem);
        }
    }

    updateDrinkAction(elapsed, gameState, pathfindingSystem) {
        const action = this.currentAction;
        
        // First move to the water source
        if (action.path && action.currentPathIndex < action.path.length) {
            this.updateMoveAction(elapsed, 16, gameState, pathfindingSystem); // deltaTime for movement
            return;
        }
        
        // At water source, drink
        if (elapsed >= action.duration) {
            // Drinking completed - restore thirst
            const thirstNeed = this.needs.get('thirst');
            if (thirstNeed) {
                thirstNeed.satisfaction = Math.min(100, thirstNeed.satisfaction + 40);
            }
            
            this.currentAction = null;
            this.state = CHARACTER_STATES.IDLE;
            this.assignActionBasedOnNeeds(gameState, pathfindingSystem);
        }
    }

    updateEatAction(elapsed, gameState, pathfindingSystem) {
        const action = this.currentAction;
        
        // First move to the food source
        if (action.path && action.currentPathIndex < action.path.length) {
            this.updateMoveAction(elapsed, 16, gameState, pathfindingSystem);
            return;
        }
        
        // At food source, eat
        if (elapsed >= action.duration) {
            // Eating completed - restore hunger
            const hungerNeed = this.needs.get('hunger');
            if (hungerNeed) {
                hungerNeed.satisfaction = Math.min(100, hungerNeed.satisfaction + 35);
            }
            
            this.currentAction = null;
            this.state = CHARACTER_STATES.IDLE;
            this.assignActionBasedOnNeeds(gameState, pathfindingSystem);
        }
    }

    updateRestAction(elapsed, gameState, pathfindingSystem) {
        const action = this.currentAction;
        
        // First move to the rest spot if needed
        if (action.path && action.currentPathIndex < action.path.length) {
            this.updateMoveAction(elapsed, 16, gameState, pathfindingSystem);
            return;
        }
        
        // Resting
        if (elapsed >= action.duration) {
            // Resting completed - restore rest and energy
            const restNeed = this.needs.get('rest');
            if (restNeed) {
                restNeed.satisfaction = Math.min(100, restNeed.satisfaction + 30);
            }
            
            this.energy = Math.min(100, this.energy + 25);
            
            this.currentAction = null;
            this.state = CHARACTER_STATES.IDLE;
            this.assignActionBasedOnNeeds(gameState, pathfindingSystem);
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
    }    // Initialize special abilities for characters
    initializeCharacterAbilities(pathfindingSystem) {
        this.characters.forEach(character => {
            // Clear any existing skills (keep the random skills from character creation)
            // Just add special movement abilities based on skills
            
            // Swimming ability based on swimming skill
            const swimmingSkill = character.skills.get('swimming') || 0;
            if (swimmingSkill > 30 || Math.random() < 0.1) { // 30+ skill or 10% random chance
                enableSwimmingForCharacter(character, pathfindingSystem);
                character.skills.set('swimming', Math.max(swimmingSkill, 50)); // Boost swimming skill
            }
            
            // Climbing ability based on climbing skill
            const climbingSkill = character.skills.get('climbing') || 0;
            if (climbingSkill > 25 || Math.random() < 0.05) { // 25+ skill or 5% random chance
                enableClimbingForCharacter(character, pathfindingSystem);
                character.skills.set('climbing', Math.max(climbingSkill, 40)); // Boost climbing skill
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
