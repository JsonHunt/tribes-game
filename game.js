// Game state
let gameState = {
    worldWidth: 50,
    worldHeight: 50,
    tribeSize: 10,
    currentScreen: 'start',
    map: [],
    mapPosition: { x: 0, y: 0 },
    zoomLevel: 1,
    tileSize: 20
};

// Terrain types
const TERRAIN_TYPES = {
    GRASS: 'grass',
    ROCK: 'rock', 
    WATER: 'water',
    SNOW: 'snow',
    SAND: 'sand'
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
    
    // Validate inputs
    if (gameState.worldWidth < 10 || gameState.worldWidth > 200 ||
        gameState.worldHeight < 10 || gameState.worldHeight > 200 ||
        gameState.tribeSize < 5 || gameState.tribeSize > 100) {
        alert('Please enter valid values within the specified ranges.');
        return;
    }
    
    // Initialize the game
    generateMap();
    updateGameInfo();
    showGameplayScreen();
    
    // Reset map position and zoom
    gameState.mapPosition = { x: 0, y: 0 };
    gameState.zoomLevel = 1;
    renderMap();
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
    
    // Generate biomes
    generateBiomes();
}

function generateBiomes() {
    const biomeTypes = Object.keys(BIOMES);
    const numBiomes = Math.floor((gameState.worldWidth * gameState.worldHeight) / 400) + 3; // Roughly 1 biome per 400 tiles, minimum 3
    
    // Create biome seeds (starting points)
    const biomeSeeds = [];
    for (let i = 0; i < numBiomes; i++) {
        const biomeType = biomeTypes[Math.floor(Math.random() * biomeTypes.length)];
        const seed = {
            x: Math.floor(Math.random() * gameState.worldWidth),
            y: Math.floor(Math.random() * gameState.worldHeight),
            type: biomeType,
            size: Math.floor(Math.random() * 200) + 50 // Random size between 50-250 tiles
        };
        biomeSeeds.push(seed);
    }
    
    // Grow biomes from seeds using flood-fill-like algorithm
    for (const seed of biomeSeeds) {
        growBiome(seed);
    }
    
    // Fill any remaining null tiles with random terrain
    fillRemainingTiles();
}

function growBiome(seed) {
    const visited = new Set();
    const queue = [{ x: seed.x, y: seed.y, distance: 0 }];
    const biome = BIOMES[seed.type];
    let tilesPlaced = 0;
    
    while (queue.length > 0 && tilesPlaced < seed.size) {
        const current = queue.shift();
        const key = `${current.x},${current.y}`;
        
        if (visited.has(key) || 
            current.x < 0 || current.x >= gameState.worldWidth ||
            current.y < 0 || current.y >= gameState.worldHeight ||
            gameState.map[current.y][current.x] !== null) {
            continue;
        }
        
        visited.add(key);
        
        // Place terrain based on biome probabilities
        const terrain = selectTerrainFromBiome(biome);
        gameState.map[current.y][current.x] = terrain;
        tilesPlaced++;
        
        // Add neighboring tiles to queue with some randomness for irregular shapes
        const neighbors = getRandomizedNeighbors(current.x, current.y);
        for (const neighbor of neighbors) {
            const distanceFromSeed = Math.sqrt(
                (neighbor.x - seed.x) ** 2 + (neighbor.y - seed.y) ** 2
            );
            
            // Use distance and randomness to create irregular shapes
            const growthProbability = Math.max(0, 1 - (distanceFromSeed / (seed.size / 10))) * Math.random();
            
            if (growthProbability > 0.3) { // Threshold for growth
                queue.push({ x: neighbor.x, y: neighbor.y, distance: current.distance + 1 });
            }
        }
    }
}

function selectTerrainFromBiome(biome) {
    const rand = Math.random();
    let cumulativeProbability = 0;
    
    for (const [terrain, probability] of Object.entries(biome.probability)) {
        cumulativeProbability += probability;
        if (rand <= cumulativeProbability) {
            return terrain;
        }
    }
    
    return biome.primaryTerrain; // Fallback
}

function getRandomizedNeighbors(x, y) {
    const neighbors = [
        { x: x + 1, y: y },
        { x: x - 1, y: y },
        { x: x, y: y + 1 },
        { x: x, y: y - 1 }
    ];
    
    // Sometimes include diagonal neighbors for more interesting shapes
    if (Math.random() < 0.3) {
        neighbors.push(
            { x: x + 1, y: y + 1 },
            { x: x + 1, y: y - 1 },
            { x: x - 1, y: y + 1 },
            { x: x - 1, y: y - 1 }
        );
    }
    
    // Shuffle the neighbors array for randomness
    return neighbors.sort(() => Math.random() - 0.5);
}

function fillRemainingTiles() {
    for (let y = 0; y < gameState.worldHeight; y++) {
        for (let x = 0; x < gameState.worldWidth; x++) {
            if (gameState.map[y][x] === null) {
                // Use the old generation method for remaining tiles or pick random terrain
                gameState.map[y][x] = generateTerrain(x, y);
            }
        }
    }
}

function generateTerrain(x, y) {
    // Simple terrain generation using noise-like patterns
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
    
    // Clamp to boundaries
    const maxX = Math.max(0, viewportWidth - mapWidth);
    const maxY = Math.max(0, viewportHeight - mapHeight);
    
    newX = Math.min(0, Math.max(maxX, newX));
    newY = Math.min(0, Math.max(maxY, newY));
    
    gameState.mapPosition.x = newX;
    gameState.mapPosition.y = newY;
    
    updateMapPosition();
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {    // Keyboard controls for map scrolling - attach to window for better focus handling
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
        }
    });
    
    // Mouse wheel zoom
    document.getElementById('gameViewport').addEventListener('wheel', function(event) {
        event.preventDefault();
        
        if (event.deltaY < 0) {
            zoomIn();
        } else {
            zoomOut();
        }
    });
    
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
