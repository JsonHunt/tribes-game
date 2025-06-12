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
    }
      // Initialize the game
    generateMap();
    generateCharacters();
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

// Character Action System
function assignRandomAction(character) {
    const actions = [ACTION_TYPES.MOVE_TO, ACTION_TYPES.WAIT];
    const actionType = actions[Math.floor(Math.random() * actions.length)];
    
    if (actionType === ACTION_TYPES.MOVE_TO) {
        // Choose a random target location
        const targetX = Math.floor(Math.random() * gameState.worldWidth);
        const targetY = Math.floor(Math.random() * gameState.worldHeight);
        
        character.currentAction = {
            type: ACTION_TYPES.MOVE_TO,
            targetX: targetX,
            targetY: targetY,
            moveSpeed: 0.5 // tiles per second
        };
        character.state = CHARACTER_STATES.MOVING;
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
    const dx = action.targetX - character.x;
    const dy = action.targetY - character.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < 0.1) {
        // Reached target
        character.x = action.targetX;
        character.y = action.targetY;
        character.currentAction = null;
        character.state = CHARACTER_STATES.IDLE;
        assignRandomAction(character);
        return;
    }
    
    // Move towards target
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
        
        // Re-render map to show updated character positions
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
