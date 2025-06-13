// Main game orchestrator - coordinates all game modules
import { PathfindingSystem } from './pathfinding.js';
import { CharacterManager } from './character.js';
import { MapGenerator, MapObjectManager } from './map.js';
import { GameState } from './game-state.js';
import { UIManager } from './ui-manager.js';
import { GameLoop } from './game-loop.js';
import { ControlsManager } from './controls.js';
import GAME_CONFIG from './config.js';

// Global game instances
let gameState;
let pathfindingSystem;
let gameLoop;

// Initialize the game systems
function initializeGame() {
    gameState = new GameState();
    pathfindingSystem = new PathfindingSystem();
    UIManager.getInstance(gameState); // ensure singleton is initialized
    gameLoop = new GameLoop();
    ControlsManager.getInstance(gameState, UIManager.getInstance());
    
    // Make pathfinding system globally available for character updates
    window.pathfindingSystem = pathfindingSystem;
    window.gameState = gameState;
    window.gameLoop = gameLoop;
    window.characterManager = CharacterManager.getInstance();
    window.mapObjectManager = MapObjectManager.getInstance();
    window.uiManager = UIManager.getInstance();
    window.GAME_CONFIG = GAME_CONFIG;
    
    // Initialize controls
    ControlsManager.getInstance().initialize();
}

// Game configuration and initialization
function beginGame() {
    // Get configuration values
    const worldWidth = parseInt(document.getElementById('worldSizeX').value);
    const worldHeight = parseInt(document.getElementById('worldSizeY').value);
    const tribeSize = parseInt(document.getElementById('tribeSize').value);
    const biomeAlgorithm = document.getElementById('biomeAlgorithm').value;
    
    // Validate inputs
    if (!gameState.validateConfiguration(worldWidth, worldHeight, tribeSize)) {
        alert('Please enter valid values within the specified ranges.');
        return;
    }
    
    // Reset previous game state
    gameState.reset();
    
    // Update configuration
    gameState.updateConfiguration(worldWidth, worldHeight, tribeSize, biomeAlgorithm);
    
    // Initialize the game
    MapGenerator.generateMap(gameState);
    CharacterManager.getInstance().generateCharacters(gameState);
    MapObjectManager.getInstance().generateMapObjects(gameState);
    initializePathfindingSystem();
    
    // Update UI
    UIManager.getInstance().updateGameInfo();
    UIManager.getInstance().showGameplayScreen();
    UIManager.getInstance().renderMap();
    
    // Start the game loop
    gameLoop.start(gameState, CharacterManager.getInstance(), MapObjectManager.getInstance(), UIManager.getInstance());
    
    // Apply saved settings if any
    if (gameState.settings && gameState.settings.gameSpeed) {
        gameLoop.setSpeed(gameState.settings.gameSpeed);
    }
}

// Initialize pathfinding system for the current game
function initializePathfindingSystem() {
    // Clear any previous character-specific rules
    pathfindingSystem.clearCharacterRules();
    
    // Initialize special abilities for characters
    CharacterManager.getInstance().initializeCharacterAbilities(pathfindingSystem);
}

// Menu functions that need to be globally accessible
function showStartScreen() {
    UIManager.getInstance().showStartScreen();
    gameLoop.stop();
}

function showNewGameScreen() {
    UIManager.getInstance().showNewGameScreen();
}

function showGameplayScreen() {
    UIManager.getInstance().showGameplayScreen();
}

function loadGame() {
    UIManager.getInstance().loadGame();
}

function showSettings() {
    UIManager.getInstance().showSettings();
}

function exitGame() {
    UIManager.getInstance().exitGame();
}

function zoomIn() {
    UIManager.getInstance().zoomIn();
}

function zoomOut() {
    UIManager.getInstance().zoomOut();
}

function hideCharacterInfo() {
    UIManager.getInstance().hideCharacterInfo();
}

function applySettings() {
    UIManager.getInstance().applySettings();
}

// Make functions globally accessible for HTML onclick handlers
window.beginGame = beginGame;
window.showStartScreen = showStartScreen;
window.showNewGameScreen = showNewGameScreen;
window.showGameplayScreen = showGameplayScreen;
window.loadGame = loadGame;
window.showSettings = showSettings;
window.exitGame = exitGame;
window.zoomIn = zoomIn;
window.zoomOut = zoomOut;
window.hideCharacterInfo = hideCharacterInfo;
window.applySettings = applySettings;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing game...');
    initializeGame();
    
    // Set focus to the window for keyboard controls
    window.focus();
    console.log('Game initialization complete');
    
    const startNewGameBtn = document.getElementById('startNewGameButton');
    if (startNewGameBtn) {
        startNewGameBtn.addEventListener('click', showNewGameScreen);
    }
});
