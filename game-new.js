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
let characterManager;
let mapObjectManager;
let uiManager;
let gameLoop;
let controlsManager;

// Initialize the game systems
function initializeGame() {
    gameState = new GameState();
    pathfindingSystem = new PathfindingSystem();
    characterManager = new CharacterManager();
    mapObjectManager = new MapObjectManager();
    uiManager = new UIManager(gameState);
    gameLoop = new GameLoop();
    controlsManager = new ControlsManager(gameState, uiManager);
    
    // Make pathfinding system globally available for character updates
    window.pathfindingSystem = pathfindingSystem;
    window.gameState = gameState;
    window.gameLoop = gameLoop;
    window.characterManager = characterManager;
    window.mapObjectManager = mapObjectManager;
    window.uiManager = uiManager;
    window.GAME_CONFIG = GAME_CONFIG;
    
    // Initialize controls
    controlsManager.initialize();
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
    characterManager.generateCharacters(gameState);
    mapObjectManager.generateMapObjects(gameState);
    initializePathfindingSystem();
    
    // Update UI
    uiManager.updateGameInfo();
    uiManager.showGameplayScreen();
    uiManager.renderMap();
    
    // Start the game loop
    gameLoop.start(gameState, characterManager, mapObjectManager, uiManager);
    
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
    characterManager.initializeCharacterAbilities(pathfindingSystem);
}

// Menu functions that need to be globally accessible
function showStartScreen() {
    uiManager.showStartScreen();
    gameLoop.stop();
}

function showNewGameScreen() {
    uiManager.showNewGameScreen();
}

function showGameplayScreen() {
    uiManager.showGameplayScreen();
}

function loadGame() {
    uiManager.loadGame();
}

function showSettings() {
    uiManager.showSettings();
}

function exitGame() {
    uiManager.exitGame();
}

function zoomIn() {
    uiManager.zoomIn();
}

function zoomOut() {
    uiManager.zoomOut();
}

function hideCharacterInfo() {
    uiManager.hideCharacterInfo();
}

function applySettings() {
    uiManager.applySettings();
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
