import { UIScreens } from './ui-screens.js';
import { UIMap } from './ui-map.js';
import { UICharacters } from './ui-characters.js';
import { showCharacterInfo, hideCharacterInfo } from './ui-info-panel.js';
import { loadSettingsValues, getGameSettings, saveGameSettings, applySettings } from './ui-settings.js';

export class UIManager {
    constructor(gameState) {
        this.gameState = gameState;
        // Don't setup event listeners here - they'll be handled by ControlsManager
        
        // Load saved settings
        this.gameState.settings = getGameSettings();
    }

    // Screen management functions
    showScreen(screenId) { UIScreens.showScreen(screenId, this.gameState); }

    showStartScreen() { UIScreens.showStartScreen(this.gameState); }

    showNewGameScreen() { 
        UIScreens.showNewGameScreen(this.gameState); 
        // Ensure input fields are focusable
        setTimeout(() => {
            const firstInput = document.getElementById('worldSizeX');
            if (firstInput) {
                firstInput.focus();
            }
        }, 100);
    }

    showGameplayScreen() { 
        UIScreens.showGameplayScreen(this.gameState); 
        // Ensure the window has focus for keyboard controls
        setTimeout(() => {
            window.focus();
            document.body.focus();
        }, 100);
    }

    // Menu functions
    loadGame() { UIScreens.loadGame(); }

    showSettings() { 
        UIScreens.showSettings(this.gameState, () => loadSettingsValues(getGameSettings)); 
    }

    exitGame() { UIScreens.exitGame(); }

    // Map rendering
    renderMap() {
        UIMap.renderMap(this.gameState, this.renderCharactersOnTile.bind(this));
    }
    renderCharactersOnTile(tile, x, y, currentTileSize) {
        UICharacters.renderCharactersOnTile(tile, x, y, currentTileSize, this.gameState, getGameSettings);
    }

    renderMapObjectsOnTile(tile, x, y, currentTileSize) {
        UIMap.renderMapObjectsOnTile(tile, x, y, currentTileSize, this.gameState);
    }

    updateMapPosition() {
        UIMap.updateMapPosition(this.gameState);
    }

    // Map scrolling
    scrollMap(deltaX, deltaY) {
        UIMap.scrollMap(this.gameState, deltaX, deltaY);
    }

    zoomIn() {
        UIMap.zoomIn(this.gameState);
    }

    zoomOut() {
        UIMap.zoomOut(this.gameState);
    }    // Character info panel methods
    showCharacterInfo(character) {
        showCharacterInfo(character, this.gameState);
    }

    hideCharacterInfo() {
        hideCharacterInfo();
    }

    // Settings management
    loadSettingsValues() {
        loadSettingsValues(getGameSettings);
    }

    getGameSettings() {
        return getGameSettings();
    }

    saveGameSettings(settings) {
        saveGameSettings(settings);
    }

    applySettings() {
        applySettings(this.gameState);
        this.showStartScreen();
    }

    updateGameInfo() {
        // Update world size
        const worldSizeSpan = document.getElementById('worldSize');
        if (worldSizeSpan && this.gameState.worldWidth && this.gameState.worldHeight) {
            worldSizeSpan.textContent = `${this.gameState.worldWidth}x${this.gameState.worldHeight}`;
        }
        // Update tribe size
        const tribeSizeSpan = document.getElementById('currentTribeSize');
        if (tribeSizeSpan && this.gameState.tribeSize) {
            tribeSizeSpan.textContent = this.gameState.tribeSize;
        }
        // Update zoom level
        const zoomLevelSpan = document.getElementById('zoomLevel');
        if (zoomLevelSpan && this.gameState.zoomLevel) {
            zoomLevelSpan.textContent = Math.round(this.gameState.zoomLevel * 100) + '%';
        }
    }
}
