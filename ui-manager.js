import { CHARACTER_STATES, ACTION_TYPES, OBJECT_TYPES } from './constants.js';
import GAME_CONFIG from './config.js';

// Remove the fallback GAME_CONFIG since we're importing it

export class UIManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.setupEventListeners();
    }

    // Screen management functions
    showScreen(screenId) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show the target screen
        document.getElementById(screenId).classList.add('active');
        this.gameState.currentScreen = screenId;
    }

    showStartScreen() {
        this.showScreen('startScreen');
    }

    showNewGameScreen() {
        this.showScreen('newGameScreen');
        // Ensure input fields are focusable
        setTimeout(() => {
            const firstInput = document.getElementById('worldSizeX');
            if (firstInput) {
                firstInput.focus();
            }
        }, 100);
    }

    showGameplayScreen() {
        this.showScreen('gameplayScreen');
        // Ensure the window has focus for keyboard controls
        setTimeout(() => {
            window.focus();
            document.body.focus();
        }, 100);
    }

    // Menu functions
    loadGame() {
        alert('Load game functionality not implemented yet.');
    }

    showSettings() {
        alert('Settings functionality not implemented yet.');
    }

    exitGame() {
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

    // Map rendering
    renderMap() {
        const gameMap = document.getElementById('gameMap');
        const viewport = document.getElementById('gameViewport');
        
        // Clear existing map
        gameMap.innerHTML = '';
        
        // Calculate tile size based on zoom
        const currentTileSize = this.gameState.tileSize * this.gameState.zoomLevel;
        
        // Set up grid
        gameMap.style.gridTemplateColumns = `repeat(${this.gameState.worldWidth}, ${currentTileSize}px)`;
        gameMap.style.gridTemplateRows = `repeat(${this.gameState.worldHeight}, ${currentTileSize}px)`;
        
        // Create tiles
        for (let y = 0; y < this.gameState.worldHeight; y++) {
            for (let x = 0; x < this.gameState.worldWidth; x++) {
                const tile = document.createElement('div');
                tile.className = `terrain-tile terrain-${this.gameState.map[y][x]}`;
                tile.style.width = `${currentTileSize}px`;
                tile.style.height = `${currentTileSize}px`;
                
                // Add coordinates as data attributes for potential future use
                tile.dataset.x = x;
                tile.dataset.y = y;
                
                // Add map objects to tile
                this.renderMapObjectsOnTile(tile, x, y, currentTileSize);
                
                // Add characters to tile
                this.renderCharactersOnTile(tile, x, y, currentTileSize);
                
                gameMap.appendChild(tile);
            }
        }
        
        // Update map position
        this.updateMapPosition();
    }

    renderMapObjectsOnTile(tile, x, y, currentTileSize) {
        // Check if there are map objects on this tile
        const objectsOnTile = this.gameState.mapObjects.filter(obj => obj.x === x && obj.y === y);
        
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
    }

    renderCharactersOnTile(tile, x, y, currentTileSize) {
        // Check if there's a character on this tile (or nearby due to fractional positions)
        const charactersOnTile = this.gameState.characters.filter(char => {
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
                    if (this.gameState.showPaths && character.currentAction.path) {
                        charElement.style.border = '2px solid rgba(243, 156, 18, 0.8)';
                    }
                } else if (character.currentAction && character.currentAction.type === ACTION_TYPES.WAIT) {
                    charElement.style.boxShadow = '0 0 8px rgba(155, 89, 182, 0.6)';
                }
                
                tile.appendChild(charElement);
            });
        }
    }

    updateMapPosition() {
        const gameMap = document.getElementById('gameMap');
        
        // Apply current position
        gameMap.style.transform = `translate(${this.gameState.mapPosition.x}px, ${this.gameState.mapPosition.y}px)`;
        
        // Update zoom level display
        const zoomElement = document.getElementById('zoomLevel');
        if (zoomElement) {
            zoomElement.textContent = Math.round(this.gameState.zoomLevel * 100) + '%';
        }
    }

    updateGameInfo() {
        const worldSizeElement = document.getElementById('worldSize');
        const tribeSizeElement = document.getElementById('currentTribeSize');
        
        if (worldSizeElement) {
            worldSizeElement.textContent = `${this.gameState.worldWidth}x${this.gameState.worldHeight}`;
        }
        if (tribeSizeElement) {
            tribeSizeElement.textContent = this.gameState.tribeSize;
        }
    }

    // Zoom functions
    zoomIn() {
        if (this.gameState.zoomLevel < 3) {
            this.gameState.zoomLevel += 0.2;
            this.renderMap();
        }
    }

    zoomOut() {
        if (this.gameState.zoomLevel > 0.3) {
            this.gameState.zoomLevel -= 0.2;
            this.renderMap();
        }
    }

    // Map scrolling
    scrollMap(deltaX, deltaY) {
        const viewport = document.getElementById('gameViewport');
        const gameMap = document.getElementById('gameMap');
        
        const currentTileSize = this.gameState.tileSize * this.gameState.zoomLevel;
        const mapWidth = this.gameState.worldWidth * currentTileSize;
        const mapHeight = this.gameState.worldHeight * currentTileSize;
        
        const viewportWidth = viewport.clientWidth;
        const viewportHeight = viewport.clientHeight;
        
        // Calculate new position
        let newX = this.gameState.mapPosition.x + deltaX;
        let newY = this.gameState.mapPosition.y + deltaY;
        
        // Calculate proper boundaries to allow full map exploration
        let minX, maxX, minY, maxY;
        
        if (mapWidth > viewportWidth) {
            minX = viewportWidth - mapWidth;
            maxX = 0;
        } else {
            const centerOffset = (viewportWidth - mapWidth) / 2;
            minX = maxX = centerOffset;
        }
        
        if (mapHeight > viewportHeight) {
            minY = viewportHeight - mapHeight;
            maxY = 0;
        } else {
            const centerOffset = (viewportHeight - mapHeight) / 2;
            minY = maxY = centerOffset;
        }
        
        // Clamp to calculated boundaries
        newX = Math.min(maxX, Math.max(minX, newX));
        newY = Math.min(maxY, Math.max(minY, newY));
        
        this.gameState.mapPosition.x = newX;
        this.gameState.mapPosition.y = newY;
        
        this.updateMapPosition();
    }

    // Setup event listeners
    setupEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            this.setupKeyboardControls();
            this.setupMouseControls();
            this.setupWindowEvents();
        });
    }

    setupKeyboardControls() {
        // Keyboard controls for map scrolling
        window.addEventListener('keydown', (event) => {
            // Don't handle keyboard events if user is typing in an input field
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
                return;
            }
            
            if (this.gameState.currentScreen !== 'gameplayScreen') return;
            
            const scrollSpeed = 20;
            
            switch(event.key) {
                case 'ArrowUp':
                    event.preventDefault();
                    this.scrollMap(0, scrollSpeed);
                    break;
                case 'ArrowDown':
                    event.preventDefault();
                    this.scrollMap(0, -scrollSpeed);
                    break;
                case 'ArrowLeft':
                    event.preventDefault();
                    this.scrollMap(scrollSpeed, 0);
                    break;
                case 'ArrowRight':
                    event.preventDefault();
                    this.scrollMap(-scrollSpeed, 0);
                    break;
            }
        });
    }

    setupMouseControls() {
        const viewport = document.getElementById('gameViewport');
        if (!viewport) return;

        // Mouse wheel zoom
        viewport.addEventListener('wheel', (event) => {
            event.preventDefault();
            
            if (event.deltaY < 0) {
                this.zoomIn();
            } else {
                this.zoomOut();
            }
        });

        // Mouse drag functionality
        viewport.addEventListener('mousedown', (event) => {
            if (event.button === 0) { // Left mouse button
                this.gameState.isDragging = true;
                this.gameState.lastMousePos = { x: event.clientX, y: event.clientY };
                viewport.style.cursor = 'grabbing';
                event.preventDefault();
            }
        });

        viewport.addEventListener('mousemove', (event) => {
            if (this.gameState.isDragging) {
                const deltaX = event.clientX - this.gameState.lastMousePos.x;
                const deltaY = event.clientY - this.gameState.lastMousePos.y;
                
                this.scrollMap(deltaX, deltaY);
                
                this.gameState.lastMousePos = { x: event.clientX, y: event.clientY };
                event.preventDefault();
            }
        });

        viewport.addEventListener('mouseup', (event) => {
            if (event.button === 0) { // Left mouse button
                this.gameState.isDragging = false;
                viewport.style.cursor = 'grab';
                event.preventDefault();
            }
        });

        viewport.addEventListener('mouseleave', () => {
            this.gameState.isDragging = false;
            viewport.style.cursor = 'grab';
        });

        // Set initial cursor style
        viewport.style.cursor = 'grab';
    }

    setupWindowEvents() {
        // Window resize handler
        window.addEventListener('resize', () => {
            if (this.gameState.currentScreen === 'gameplayScreen') {
                this.updateMapPosition();
            }
        });

        // Set focus to the window for keyboard controls
        window.focus();
    }
}
