// Game state
let gameState = {
    worldWidth: 50,
    worldHeight: 50,
    tribeSize: 10,
    currentScreen: 'start',
    map: [],
    mapPosition: { x: 0, y: 0 },
    zoomLevel: 1,
    tileSize: 20,
    biomeAlgorithm: 'cluster', // Default biome generation algorithm
    characters: [], // Array to store character positions
    mapObjects: [], // Array to store trees, boulders, etc.
    isDragging: false, // Mouse drag state
    lastMousePos: { x: 0, y: 0 }, // Last mouse position for dragging
    gameLoop: null, // Game loop interval
    lastUpdate: Date.now() // Last update timestamp
};

// Terrain types
const TERRAIN_TYPES = {
    GRASS: 'grass',
    ROCK: 'rock', 
    WATER: 'water',
    SNOW: 'snow',
    SAND: 'sand'
};

// Character action types
const ACTION_TYPES = {
    MOVE_TO: 'move_to',
    WAIT: 'wait'
};

// Character states
const CHARACTER_STATES = {
    IDLE: 'idle',
    MOVING: 'moving',
    WAITING: 'waiting'
};

// Map object types
const OBJECT_TYPES = {
    TREE: 'tree',
    BOULDER: 'boulder'
};

// Pathfinding system
class PathfindingSystem {
    constructor() {
        this.movementRules = new Map();
        this.setupDefaultRules();
    }

    // Setup default movement rules
    setupDefaultRules() {
        // Basic rule: characters cannot move on water tiles
        this.addMovementRule('water_restriction', (fromTile, toTile, character, gameState) => {
            // Characters cannot enter water tiles
            if (gameState.map[toTile.y][toTile.x] === TERRAIN_TYPES.WATER) {
                return false;
            }
            return true;
        });

        // Rule: characters cannot move through objects that block movement
        this.addMovementRule('object_collision', (fromTile, toTile, character, gameState) => {
            // Check if there are blocking objects on the target tile
            const objectsOnTile = gameState.mapObjects.filter(obj => 
                Math.floor(obj.x) === toTile.x && Math.floor(obj.y) === toTile.y
            );
            
            // Boulders block movement
            for (const obj of objectsOnTile) {
                if (obj.type === OBJECT_TYPES.BOULDER) {
                    return false;
                }
            }
            return true;
        });
    }

    // Add a new movement rule
    addMovementRule(ruleId, ruleFunction) {
        this.movementRules.set(ruleId, ruleFunction);
    }

    // Remove a movement rule
    removeMovementRule(ruleId) {
        this.movementRules.delete(ruleId);
    }

    // Check if movement from one tile to another is allowed
    canMoveTo(fromTile, toTile, character, gameState) {
        // Check bounds
        if (toTile.x < 0 || toTile.x >= gameState.worldWidth || 
            toTile.y < 0 || toTile.y >= gameState.worldHeight) {
            return false;
        }

        // Apply all movement rules
        for (const [ruleId, ruleFunction] of this.movementRules) {
            if (!ruleFunction(fromTile, toTile, character, gameState)) {
                return false;
            }
        }

        return true;
    }

    // A* pathfinding algorithm
    findPath(startX, startY, endX, endY, character, gameState) {
        const start = { x: Math.floor(startX), y: Math.floor(startY) };
        const end = { x: Math.floor(endX), y: Math.floor(endY) };

        // Check if the destination is reachable
        if (!this.canMoveTo(start, end, character, gameState)) {
            return null; // No path possible
        }

        const openSet = [];
        const closedSet = new Set();
        const cameFrom = new Map();
        const gScore = new Map();
        const fScore = new Map();

        const getKey = (node) => `${node.x},${node.y}`;
        const getHeuristic = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y); // Manhattan distance

        // Initialize starting node
        openSet.push(start);
        gScore.set(getKey(start), 0);
        fScore.set(getKey(start), getHeuristic(start, end));

        while (openSet.length > 0) {
            // Find node with lowest fScore
            let current = openSet[0];
            let currentIndex = 0;
            for (let i = 1; i < openSet.length; i++) {
                if (fScore.get(getKey(openSet[i])) < fScore.get(getKey(current))) {
                    current = openSet[i];
                    currentIndex = i;
                }
            }

            // Remove current from openSet
            openSet.splice(currentIndex, 1);
            closedSet.add(getKey(current));

            // Check if we reached the goal
            if (current.x === end.x && current.y === end.y) {
                return this.reconstructPath(cameFrom, current);
            }

            // Check all neighbors
            const neighbors = this.getNeighbors(current);
            for (const neighbor of neighbors) {
                const neighborKey = getKey(neighbor);

                if (closedSet.has(neighborKey)) {
                    continue;
                }

                // Check if this neighbor is passable
                if (!this.canMoveTo(current, neighbor, character, gameState)) {
                    continue;
                }

                const tentativeGScore = gScore.get(getKey(current)) + 1;

                if (!openSet.some(node => node.x === neighbor.x && node.y === neighbor.y)) {
                    openSet.push(neighbor);
                } else if (tentativeGScore >= (gScore.get(neighborKey) || Infinity)) {
                    continue;
                }

                cameFrom.set(neighborKey, current);
                gScore.set(neighborKey, tentativeGScore);
                fScore.set(neighborKey, tentativeGScore + getHeuristic(neighbor, end));
            }
        }

        return null; // No path found
    }

    // Get neighboring tiles (4-directional movement)
    getNeighbors(node) {
        return [
            { x: node.x + 1, y: node.y },
            { x: node.x - 1, y: node.y },
            { x: node.x, y: node.y + 1 },
            { x: node.x, y: node.y - 1 }
        ];
    }

    // Reconstruct path from A* result
    reconstructPath(cameFrom, current) {
        const path = [current];
        const getKey = (node) => `${node.x},${node.y}`;

        while (cameFrom.has(getKey(current))) {
            current = cameFrom.get(getKey(current));
            path.unshift(current);
        }

        return path;
    }

    // Find a random reachable destination near a target
    findReachableDestination(startX, startY, targetX, targetY, character, gameState, maxSearchRadius = 5) {
        const start = { x: Math.floor(startX), y: Math.floor(startY) };
        const target = { x: Math.floor(targetX), y: Math.floor(targetY) };

        // First, try the exact target
        if (this.canMoveTo(start, target, character, gameState)) {
            const path = this.findPath(startX, startY, targetX, targetY, character, gameState);
            if (path) {
                return { x: targetX, y: targetY, path: path };
            }
        }

        // Try nearby positions in expanding circles
        for (let radius = 1; radius <= maxSearchRadius; radius++) {
            const candidates = [];
            
            // Generate candidates in a circle around the target
            for (let dx = -radius; dx <= radius; dx++) {
                for (let dy = -radius; dy <= radius; dy++) {
                    if (Math.abs(dx) === radius || Math.abs(dy) === radius) {
                        const candidate = { x: target.x + dx, y: target.y + dy };
                        
                        // Check bounds
                        if (candidate.x >= 0 && candidate.x < gameState.worldWidth &&
                            candidate.y >= 0 && candidate.y < gameState.worldHeight) {
                            
                            if (this.canMoveTo(start, candidate, character, gameState)) {
                                candidates.push(candidate);
                            }
                        }
                    }
                }
            }

            // Try candidates in random order
            candidates.sort(() => Math.random() - 0.5);
            
            for (const candidate of candidates) {
                const path = this.findPath(startX, startY, candidate.x, candidate.y, character, gameState);
                if (path) {
                    return { x: candidate.x, y: candidate.y, path: path };
                }
            }
        }

        return null; // No reachable destination found
    }
}

// Create global pathfinding system instance
const pathfindingSystem = new PathfindingSystem();

// Utility functions for pathfinding system extensibility
function addCharacterSkill(character, skillId, skillData) {
    if (!character.skills) {
        character.skills = new Map();
    }
    character.skills.set(skillId, skillData);
}

function removeCharacterSkill(character, skillId) {
    if (character.skills) {
        character.skills.delete(skillId);
    }
}

function hasCharacterSkill(character, skillId) {
    return character.skills && character.skills.has(skillId);
}

// Example: Add swimming skill to allow water crossing
function enableSwimmingForCharacter(character) {
    addCharacterSkill(character, 'swimming', { level: 1 });
    
    // Add a custom movement rule for this character
    const ruleId = `swimming_${character.id}`;
    pathfindingSystem.addMovementRule(ruleId, (fromTile, toTile, char, gameState) => {
        // If this is the character with swimming skill, allow water movement
        if (char.id === character.id && hasCharacterSkill(char, 'swimming')) {
            return true; // Can move through water
        }
        
        // For other characters or if no swimming skill, use default water restriction
        if (gameState.map[toTile.y][toTile.x] === TERRAIN_TYPES.WATER) {
            return false;
        }
        return true;
    });
}

// Example: Add climbing skill to allow movement through boulders
function enableClimbingForCharacter(character) {
    addCharacterSkill(character, 'climbing', { level: 1 });
    
    const ruleId = `climbing_${character.id}`;
    pathfindingSystem.addMovementRule(ruleId, (fromTile, toTile, char, gameState) => {
        // If this is the character with climbing skill, allow boulder movement
        if (char.id === character.id && hasCharacterSkill(char, 'climbing')) {
            return true; // Can move through boulders
        }
        
        // For other characters, check for blocking objects
        const objectsOnTile = gameState.mapObjects.filter(obj => 
            Math.floor(obj.x) === toTile.x && Math.floor(obj.y) === toTile.y
        );
        
        for (const obj of objectsOnTile) {
            if (obj.type === OBJECT_TYPES.BOULDER) {
                return false;
            }
        }
        return true;
    });
}

// Biome definitions
const BIOMES = {
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

// Screen management functions
function showScreen(screenId) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show the target screen
    document.getElementById(screenId).classList.add('active');
    gameState.currentScreen = screenId;
}

function showStartScreen() {
    showScreen('startScreen');
    // Stop game loop when returning to start screen
    stopGameLoop();
}

function showNewGameScreen() {
    showScreen('newGameScreen');
    // Ensure input fields are focusable
    setTimeout(() => {
        const firstInput = document.getElementById('worldSizeX');
        if (firstInput) {
            firstInput.focus();
        }
    }, 100);
}

function showGameplayScreen() {
    showScreen('gameplayScreen');
    // Ensure the window has focus for keyboard controls
    setTimeout(() => {
        window.focus();
        document.body.focus();
    }, 100);
}

// Menu functions
function loadGame() {
    alert('Load game functionality not implemented yet.');
}

function showSettings() {
    alert('Settings functionality not implemented yet.');
}

function exitGame() {
    if (confirm('Are you sure you want to exit?')) {
        // In Electron, we can close the window
        if (typeof require !== 'undefined') {
            const { remote } = require('electron');
            if (remote) {
                remote.getCurrentWindow().close();
            }
        }
    }
}

// Game configuration and initialization
function beginGame() {
    // Get configuration values
    gameState.worldWidth = parseInt(document.getElementById('worldSizeX').value);
    gameState.worldHeight = parseInt(document.getElementById('worldSizeY').value);
    gameState.tribeSize = parseInt(document.getElementById('tribeSize').value);
    gameState.biomeAlgorithm = document.getElementById('biomeAlgorithm').value;
    
    // Validate inputs
    if (gameState.worldWidth < 10 || gameState.worldWidth > 200 ||
        gameState.worldHeight < 10 || gameState.worldHeight > 200 ||
        gameState.tribeSize < 5 || gameState.tribeSize > 100) {
        alert('Please enter valid values within the specified ranges.');
        return;
    }  // Initialize the game
    generateMap();
    generateCharacters();
    generateMapObjects();
    initializePathfindingSystem();
    updateGameInfo();
    showGameplayScreen();
    
    // Reset map position and zoom
    gameState.mapPosition = { x: 0, y: 0 };
    gameState.zoomLevel = 1;
    renderMap();
    
    // Start the game loop
    startGameLoop();
}

// Map generation
function generateMap() {
    gameState.map = [];
    
    // Initialize empty map
    for (let y = 0; y < gameState.worldHeight; y++) {
        gameState.map[y] = [];
        for (let x = 0; x < gameState.worldWidth; x++) {
            gameState.map[y][x] = null;
        }
    }
    
    // Generate biomes using selected algorithm
    const generator = BiomeGeneratorFactory.createGenerator(
        gameState.biomeAlgorithm,
        TERRAIN_TYPES,
        BIOMES
    );
    generator.generateBiomes(gameState);
}

function generateTerrain(x, y) {
    // Simple terrain generation using noise-like patterns (fallback)
    const centerX = gameState.worldWidth / 2;
    const centerY = gameState.worldHeight / 2;
    const distanceFromCenter = Math.sqrt((x - centerX) * (x - centerX) + (y - centerY) * (y - centerY));
    const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);
    
    // Create some randomness
    const noise = (Math.sin(x * 0.1) * Math.cos(y * 0.1) + Math.random() - 0.5) * 0.3;
    const normalizedDistance = distanceFromCenter / maxDistance + noise;
    
    // Determine terrain based on distance and some randomness
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

// Character generation
function generateCharacters() {
    gameState.characters = [];
    
    // Generate characters based on tribe size
    for (let i = 0; i < gameState.tribeSize; i++) {
        let x, y;
        let attempts = 0;
        
        // Try to place characters on land (not water)
        do {
            x = Math.floor(Math.random() * gameState.worldWidth);
            y = Math.floor(Math.random() * gameState.worldHeight);
            attempts++;
        } while (gameState.map[y][x] === TERRAIN_TYPES.WATER && attempts < 50);
        
        const character = {
            id: i,
            x: x,
            y: y,
            health: 100,
            energy: 100,
            state: CHARACTER_STATES.IDLE,
            currentAction: null,
            actionStartTime: 0,
            actionProgress: 0
        };
        
        // Assign initial action
        assignRandomAction(character);
        
        gameState.characters.push(character);
    }
}

// Map Objects Generation
function generateMapObjects() {
    gameState.mapObjects = [];
    
    // Generate trees on grass tiles
    generateTrees();
    
    // Generate boulders on rock tiles
    generateBoulders();
}

function generateTrees() {
    const grassTiles = [];
    
    // Find all grass tiles
    for (let y = 0; y < gameState.worldHeight; y++) {
        for (let x = 0; x < gameState.worldWidth; x++) {
            if (gameState.map[y][x] === TERRAIN_TYPES.GRASS) {
                grassTiles.push({ x, y });
            }
        }
    }
    
    // Calculate number of trees based on density
    const numTrees = Math.floor(grassTiles.length * GAME_CONFIG.trees.density);
    
    // Randomly select positions for trees
    const shuffledTiles = grassTiles.sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < Math.min(numTrees, shuffledTiles.length); i++) {
        const tile = shuffledTiles[i];
        const tree = {
            id: generateObjectId(),
            type: OBJECT_TYPES.TREE,
            x: tile.x,
            y: tile.y,
            size: Math.random() * (GAME_CONFIG.trees.maxSize - GAME_CONFIG.trees.minSize) + GAME_CONFIG.trees.minSize,
            maxSize: Math.random() * (GAME_CONFIG.trees.maxSize - GAME_CONFIG.trees.minSize) + GAME_CONFIG.trees.minSize,
            age: Math.random() * GAME_CONFIG.trees.growthTime, // Random initial age
            lastSpawnTime: Date.now() - Math.random() * GAME_CONFIG.trees.spawnRate
        };
        
        gameState.mapObjects.push(tree);
    }
}

function generateBoulders() {
    const rockTiles = [];
    
    // Find all rock tiles
    for (let y = 0; y < gameState.worldHeight; y++) {
        for (let x = 0; x < gameState.worldWidth; x++) {
            if (gameState.map[y][x] === TERRAIN_TYPES.ROCK) {
                rockTiles.push({ x, y });
            }
        }
    }
    
    // Calculate number of boulders based on density
    const numBoulders = Math.floor(rockTiles.length * GAME_CONFIG.boulders.density);
    
    // Randomly select positions for boulders
    const shuffledTiles = rockTiles.sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < Math.min(numBoulders, shuffledTiles.length); i++) {
        const tile = shuffledTiles[i];
        const boulder = {
            id: generateObjectId(),
            type: OBJECT_TYPES.BOULDER,
            x: tile.x,
            y: tile.y,
            size: Math.random() * (GAME_CONFIG.boulders.maxSize - GAME_CONFIG.boulders.minSize) + GAME_CONFIG.boulders.minSize
        };
        
        gameState.mapObjects.push(boulder);
    }
}

function generateObjectId() {
    return 'obj_' + Math.random().toString(36).substr(2, 9);
}

function updateMapObjects(deltaTime) {
    const currentTime = Date.now();
    
    for (const obj of gameState.mapObjects) {
        if (obj.type === OBJECT_TYPES.TREE) {
            updateTree(obj, deltaTime, currentTime);
        }
    }
}

function updateTree(tree, deltaTime, currentTime) {
    // Tree growth
    if (tree.size < tree.maxSize) {
        tree.age += deltaTime;
        const growthProgress = tree.age / GAME_CONFIG.trees.growthTime;
        tree.size = Math.min(
            tree.maxSize,
            GAME_CONFIG.trees.minSize + (tree.maxSize - GAME_CONFIG.trees.minSize) * growthProgress
        );
    }
    
    // Tree spawning
    if (tree.size >= GAME_CONFIG.trees.matureThreshold * tree.maxSize) {
        if (currentTime - tree.lastSpawnTime >= GAME_CONFIG.trees.spawnRate) {
            attemptTreeSpawn(tree, currentTime);
            tree.lastSpawnTime = currentTime;
        }
    }
}

function attemptTreeSpawn(parentTree, currentTime) {
    const spawnRadius = GAME_CONFIG.trees.spawnRadius;
    const attempts = 10; // Maximum attempts to find a suitable spawn location
    
    for (let i = 0; i < attempts; i++) {
        // Random position within spawn radius
        const angle = Math.random() * 2 * Math.PI;
        const distance = Math.random() * spawnRadius;
        const spawnX = Math.round(parentTree.x + Math.cos(angle) * distance);
        const spawnY = Math.round(parentTree.y + Math.sin(angle) * distance);
        
        // Check if position is valid
        if (spawnX >= 0 && spawnX < gameState.worldWidth &&
            spawnY >= 0 && spawnY < gameState.worldHeight &&
            gameState.map[spawnY][spawnX] === TERRAIN_TYPES.GRASS) {
            
            // Check if there's already an object at this position
            const existingObject = gameState.mapObjects.find(obj => obj.x === spawnX && obj.y === spawnY);
            if (!existingObject) {
                // Spawn new tree
                const newTree = {
                    id: generateObjectId(),
                    type: OBJECT_TYPES.TREE,
                    x: spawnX,
                    y: spawnY,
                    size: GAME_CONFIG.trees.minSize,
                    maxSize: Math.random() * (GAME_CONFIG.trees.maxSize - GAME_CONFIG.trees.minSize) + GAME_CONFIG.trees.minSize,
                    age: 0,
                    lastSpawnTime: currentTime
                };
                
                gameState.mapObjects.push(newTree);
                break; // Successfully spawned, exit loop
            }
        }
    }
}

// Character Action System
function assignRandomAction(character) {
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

function updateCharacterActions(deltaTime) {
    const currentTime = Date.now();
    
    for (const character of gameState.characters) {
        if (!character.currentAction) {
            assignRandomAction(character);
            continue;
        }
        
        const actionElapsed = currentTime - character.actionStartTime;
        
        if (character.currentAction.type === ACTION_TYPES.MOVE_TO) {
            updateMoveAction(character, actionElapsed, deltaTime);
        } else if (character.currentAction.type === ACTION_TYPES.WAIT) {
            updateWaitAction(character, actionElapsed);
        }
    }
}

function updateMoveAction(character, elapsed, deltaTime) {
    const action = character.currentAction;
    
    // If no path, switch to waiting
    if (!action.path || action.path.length === 0) {
        character.currentAction = null;
        character.state = CHARACTER_STATES.IDLE;
        assignRandomAction(character);
        return;
    }
    
    // Get current target waypoint
    if (action.currentPathIndex >= action.path.length) {
        // Path completed
        character.currentAction = null;
        character.state = CHARACTER_STATES.IDLE;
        assignRandomAction(character);
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
            assignRandomAction(character);
        }
        return;
    }
    
    // Move towards current waypoint
    const moveDistance = action.moveSpeed * (deltaTime / 1000); // Convert to seconds
    const moveRatio = Math.min(moveDistance / distance, 1);
    
    character.x += dx * moveRatio;
    character.y += dy * moveRatio;
    
    // Keep character within map bounds
    character.x = Math.max(0, Math.min(gameState.worldWidth - 1, character.x));
    character.y = Math.max(0, Math.min(gameState.worldHeight - 1, character.y));
}

function updateWaitAction(character, elapsed) {
    const action = character.currentAction;
    
    if (elapsed >= action.duration) {
        // Wait completed
        character.currentAction = null;
        character.state = CHARACTER_STATES.IDLE;
        assignRandomAction(character);
    }
}

// Initialize pathfinding system for the current game
function initializePathfindingSystem() {
    // Clear any previous character-specific rules
    const rulesToRemove = [];
    for (const [ruleId] of pathfindingSystem.movementRules) {
        if (ruleId.includes('_')) {
            const parts = ruleId.split('_');
            if (parts.length > 1 && !isNaN(parseInt(parts[1]))) {
                rulesToRemove.push(ruleId);
            }
        }
    }
    
    rulesToRemove.forEach(ruleId => {
        pathfindingSystem.removeMovementRule(ruleId);
    });
    
    // Example: Randomly give some characters special abilities for demonstration
    gameState.characters.forEach(character => {
        // Clear any existing skills
        character.skills = new Map();
        
        // 10% chance for swimming ability
        if (Math.random() < 0.1) {
            enableSwimmingForCharacter(character);
        }
        
        // 5% chance for climbing ability
        if (Math.random() < 0.05) {
            enableClimbingForCharacter(character);
        }
    });
}

// Game loop
function startGameLoop() {
    if (gameState.gameLoop) {
        clearInterval(gameState.gameLoop);
    }
    
    gameState.lastUpdate = Date.now();
    
    gameState.gameLoop = setInterval(() => {
        const currentTime = Date.now();
        const deltaTime = currentTime - gameState.lastUpdate;
        gameState.lastUpdate = currentTime;
        
        // Update character actions
        updateCharacterActions(deltaTime);
        
        // Update map objects (e.g., trees, boulders)
        updateMapObjects(deltaTime);
        
        // Re-render map to show updated character and object positions
        renderMap();
    }, 100); // Update every 100ms
}

function stopGameLoop() {
    if (gameState.gameLoop) {
        clearInterval(gameState.gameLoop);
        gameState.gameLoop = null;
    }
}

// Map rendering
function renderMap() {
    const gameMap = document.getElementById('gameMap');
    const viewport = document.getElementById('gameViewport');
    
    // Clear existing map
    gameMap.innerHTML = '';
    
    // Calculate tile size based on zoom
    const currentTileSize = gameState.tileSize * gameState.zoomLevel;
    
    // Set up grid
    gameMap.style.gridTemplateColumns = `repeat(${gameState.worldWidth}, ${currentTileSize}px)`;
    gameMap.style.gridTemplateRows = `repeat(${gameState.worldHeight}, ${currentTileSize}px)`;
    
    // Create tiles
    for (let y = 0; y < gameState.worldHeight; y++) {
        for (let x = 0; x < gameState.worldWidth; x++) {
            const tile = document.createElement('div');
            tile.className = `terrain-tile terrain-${gameState.map[y][x]}`;
            tile.style.width = `${currentTileSize}px`;
            tile.style.height = `${currentTileSize}px`;
              // Add coordinates as data attributes for potential future use
            tile.dataset.x = x;
            tile.dataset.y = y;
            
            // Check if there are map objects on this tile
            const objectsOnTile = gameState.mapObjects.filter(obj => obj.x === x && obj.y === y);
            objectsOnTile.forEach(obj => {
                const objElement = document.createElement('div');
                objElement.className = `map-object object-${obj.type}`;
                
                const objSize = currentTileSize * obj.size;
                objElement.style.width = `${objSize}px`;
                objElement.style.height = `${objSize}px`;
                objElement.style.position = 'absolute';
                
                // Center the object in the tile
                const offsetX = (currentTileSize - objSize) / 2;
                const offsetY = (currentTileSize - objSize) / 2;
                objElement.style.left = `${offsetX}px`;
                objElement.style.top = `${offsetY}px`;
                objElement.style.zIndex = '5';
                
                if (obj.type === OBJECT_TYPES.TREE) {
                    objElement.style.backgroundColor = GAME_CONFIG.visual.treeColor;
                    objElement.style.borderRadius = '50%';
                    objElement.style.border = `1px solid ${GAME_CONFIG.visual.treeHighlight}`;
                    objElement.style.boxShadow = 'inset 0 1px 2px rgba(255,255,255,0.3)';
                } else if (obj.type === OBJECT_TYPES.BOULDER) {
                    objElement.style.backgroundColor = GAME_CONFIG.visual.boulderColor;
                    objElement.style.borderRadius = '30%';
                    objElement.style.border = `1px solid ${GAME_CONFIG.visual.boulderHighlight}`;
                    objElement.style.boxShadow = 'inset 0 1px 2px rgba(255,255,255,0.2)';
                }
                
                objElement.dataset.objectId = obj.id;
                tile.appendChild(objElement);
            });
              // Check if there's a character on this tile (or nearby due to fractional positions)
            const charactersOnTile = gameState.characters.filter(char => {
                const charTileX = Math.floor(char.x);
                const charTileY = Math.floor(char.y);
                return charTileX === x && charTileY === y;
            });
            
            if (charactersOnTile.length > 0) {
                charactersOnTile.forEach(character => {
                    const charElement = document.createElement('div');
                    charElement.className = 'character';
                    charElement.style.width = `${currentTileSize * 0.8}px`;
                    charElement.style.height = `${currentTileSize * 0.8}px`;
                    
                    // Color based on character state
                    let color = '#e74c3c'; // Default red
                    if (character.state === CHARACTER_STATES.MOVING) {
                        color = '#f39c12'; // Orange for moving
                    } else if (character.state === CHARACTER_STATES.WAITING) {
                        color = '#9b59b6'; // Purple for waiting
                    }
                    
                    charElement.style.backgroundColor = color;
                    charElement.style.position = 'absolute';
                    
                    // Calculate precise position within the tile
                    const offsetX = (character.x - Math.floor(character.x)) * currentTileSize;
                    const offsetY = (character.y - Math.floor(character.y)) * currentTileSize;
                    
                    charElement.style.top = `${currentTileSize * 0.1 + offsetY}px`;
                    charElement.style.left = `${currentTileSize * 0.1 + offsetX}px`;
                    charElement.style.borderRadius = '2px';
                    charElement.style.zIndex = '10';
                    charElement.dataset.characterId = character.id;
                      // Add action indicator
                    if (character.currentAction && character.currentAction.type === ACTION_TYPES.MOVE_TO) {
                        charElement.style.boxShadow = '0 0 8px rgba(243, 156, 18, 0.6)';
                        
                        // Optional: Add path visualization (for debugging)
                        if (gameState.showPaths && character.currentAction.path) {
                            // This could be expanded to show the full path
                            charElement.style.border = '2px solid rgba(243, 156, 18, 0.8)';
                        }
                    } else if (character.currentAction && character.currentAction.type === ACTION_TYPES.WAIT) {
                        charElement.style.boxShadow = '0 0 8px rgba(155, 89, 182, 0.6)';
                    }
                    
                    tile.appendChild(charElement);
                });
            }
            
            gameMap.appendChild(tile);
        }
    }
    
    // Update map position
    updateMapPosition();
}

function updateMapPosition() {
    const gameMap = document.getElementById('gameMap');
    const viewport = document.getElementById('gameViewport');
    
    // Apply current position
    gameMap.style.transform = `translate(${gameState.mapPosition.x}px, ${gameState.mapPosition.y}px)`;
    
    // Update zoom level display
    document.getElementById('zoomLevel').textContent = Math.round(gameState.zoomLevel * 100) + '%';
}

function updateGameInfo() {
    document.getElementById('worldSize').textContent = `${gameState.worldWidth}x${gameState.worldHeight}`;
    document.getElementById('currentTribeSize').textContent = gameState.tribeSize;
}

// Zoom functions
function zoomIn() {
    if (gameState.zoomLevel < 3) {
        gameState.zoomLevel += 0.2;
        renderMap();
    }
}

function zoomOut() {
    if (gameState.zoomLevel > 0.3) {
        gameState.zoomLevel -= 0.2;
        renderMap();
    }
}

// Map scrolling
function scrollMap(deltaX, deltaY) {
    const viewport = document.getElementById('gameViewport');
    const gameMap = document.getElementById('gameMap');
    
    const currentTileSize = gameState.tileSize * gameState.zoomLevel;
    const mapWidth = gameState.worldWidth * currentTileSize;
    const mapHeight = gameState.worldHeight * currentTileSize;
    
    const viewportWidth = viewport.clientWidth;
    const viewportHeight = viewport.clientHeight;
    
    // Calculate new position
    let newX = gameState.mapPosition.x + deltaX;
    let newY = gameState.mapPosition.y + deltaY;
    
    // Calculate proper boundaries to allow full map exploration
    // When map is larger than viewport, allow scrolling to show all parts
    let minX, maxX, minY, maxY;
    
    if (mapWidth > viewportWidth) {
        // Map is wider than viewport - allow horizontal scrolling
        minX = viewportWidth - mapWidth; // Minimum position (shows right edge of map)
        maxX = 0; // Maximum position (shows left edge of map)
    } else {
        // Map fits within viewport - center it
        const centerOffset = (viewportWidth - mapWidth) / 2;
        minX = maxX = centerOffset;
    }
    
    if (mapHeight > viewportHeight) {
        // Map is taller than viewport - allow vertical scrolling
        minY = viewportHeight - mapHeight; // Minimum position (shows bottom edge of map)
        maxY = 0; // Maximum position (shows top edge of map)
    } else {
        // Map fits within viewport - center it
        const centerOffset = (viewportHeight - mapHeight) / 2;
        minY = maxY = centerOffset;
    }
    
    // Clamp to calculated boundaries
    newX = Math.min(maxX, Math.max(minX, newX));
    newY = Math.min(maxY, Math.max(minY, newY));
    
    gameState.mapPosition.x = newX;
    gameState.mapPosition.y = newY;
    
    updateMapPosition();
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Keyboard controls for map scrolling - attach to window for better focus handling
    window.addEventListener('keydown', function(event) {
        // Don't handle keyboard events if user is typing in an input field
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }
        
        if (gameState.currentScreen !== 'gameplayScreen') return;
        
        const scrollSpeed = 20;
        
        switch(event.key) {
            case 'ArrowUp':
                event.preventDefault();
                scrollMap(0, scrollSpeed);
                break;
            case 'ArrowDown':
                event.preventDefault();
                scrollMap(0, -scrollSpeed);
                break;
            case 'ArrowLeft':
                event.preventDefault();
                scrollMap(scrollSpeed, 0);
                break;
            case 'ArrowRight':
                event.preventDefault();
                scrollMap(-scrollSpeed, 0);
                break;
        }    });
    
    // Mouse wheel zoom
    document.getElementById('gameViewport').addEventListener('wheel', function(event) {
        event.preventDefault();
        
        if (event.deltaY < 0) {
            zoomIn();
        } else {
            zoomOut();
        }
    });

    // Mouse drag functionality
    const viewport = document.getElementById('gameViewport');
    
    viewport.addEventListener('mousedown', function(event) {
        if (event.button === 0) { // Left mouse button
            gameState.isDragging = true;
            gameState.lastMousePos = { x: event.clientX, y: event.clientY };
            viewport.style.cursor = 'grabbing';
            event.preventDefault();
        }
    });

    viewport.addEventListener('mousemove', function(event) {
        if (gameState.isDragging) {
            const deltaX = event.clientX - gameState.lastMousePos.x;
            const deltaY = event.clientY - gameState.lastMousePos.y;
            
            scrollMap(deltaX, deltaY);
            
            gameState.lastMousePos = { x: event.clientX, y: event.clientY };
            event.preventDefault();
        }
    });

    viewport.addEventListener('mouseup', function(event) {
        if (event.button === 0) { // Left mouse button
            gameState.isDragging = false;
            viewport.style.cursor = 'grab';
            event.preventDefault();
        }
    });

    viewport.addEventListener('mouseleave', function(event) {
        gameState.isDragging = false;
        viewport.style.cursor = 'grab';
    });

    // Set initial cursor style
    viewport.style.cursor = 'grab';
    
    // Window resize handler
    window.addEventListener('resize', function() {
        if (gameState.currentScreen === 'gameplayScreen') {
            updateMapPosition();
        }
    });
});

// Initialize default values on page load
document.addEventListener('DOMContentLoaded', function() {
    // Set focus to the window for keyboard controls
    window.focus();
});
