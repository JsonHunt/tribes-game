// UI map rendering and controls
import { OBJECT_TYPES } from './constants.js';
import GAME_CONFIG from './config.js';
import { UICharacters } from './ui-characters.js';

export class UIMap {
    static renderMap(gameState, renderCharactersOnTile) {
        const gameMap = document.getElementById('gameMap');
        const viewport = document.getElementById('gameViewport');
        gameMap.innerHTML = '';
        const currentTileSize = gameState.tileSize * gameState.zoomLevel;
        gameMap.style.gridTemplateColumns = `repeat(${gameState.worldWidth}, ${currentTileSize}px)`;
        gameMap.style.gridTemplateRows = `repeat(${gameState.worldHeight}, ${currentTileSize}px)`;
        for (let y = 0; y < gameState.worldHeight; y++) {
            for (let x = 0; x < gameState.worldWidth; x++) {
                const tile = document.createElement('div');
                tile.className = `terrain-tile terrain-${gameState.map[y][x]}`;
                tile.style.width = `${currentTileSize}px`;
                tile.style.height = `${currentTileSize}px`;
                tile.dataset.x = x;
                tile.dataset.y = y;
                this.renderMapObjectsOnTile(tile, x, y, currentTileSize, gameState);
                renderCharactersOnTile(tile, x, y, currentTileSize);
                gameMap.appendChild(tile);
            }
        }
        this.updateMapPosition(gameState);
    }

    static renderMapObjectsOnTile(tile, x, y, currentTileSize, gameState) {
        const objectsOnTile = gameState.mapObjects.filter(obj => obj.x === x && obj.y === y);
        objectsOnTile.forEach(obj => {
            const objElement = document.createElement('div');
            objElement.className = `map-object object-${obj.type}`;
            const objSize = currentTileSize * obj.size;
            objElement.style.width = `${objSize}px`;
            objElement.style.height = `${objSize}px`;
            objElement.style.position = 'absolute';
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

    static updateMapPosition(gameState) {
        const gameMap = document.getElementById('gameMap');
        if (!gameMap) return;
        gameMap.style.transform = `translate(${gameState.mapPosition.x}px, ${gameState.mapPosition.y}px)`;
    }

    static scrollMap(gameState, deltaX, deltaY) {
        const viewport = document.getElementById('gameViewport');
        const gameMap = document.getElementById('gameMap');
        if (!viewport || !gameMap) return;
        const currentTileSize = gameState.tileSize * gameState.zoomLevel;
        const mapWidth = gameState.worldWidth * currentTileSize;
        const mapHeight = gameState.worldHeight * currentTileSize;
        const viewportWidth = viewport.clientWidth;
        const viewportHeight = viewport.clientHeight;
        let newX = gameState.mapPosition.x + deltaX;
        let newY = gameState.mapPosition.y + deltaY;
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
        newX = Math.min(maxX, Math.max(minX, newX));
        newY = Math.min(maxY, Math.max(minY, newY));
        gameState.mapPosition.x = newX;
        gameState.mapPosition.y = newY;
        this.updateMapPosition(gameState);
    }

    static zoomIn(gameState) {
        gameState.zoomLevel = Math.min(4, gameState.zoomLevel + 0.2);
    }

    static zoomOut(gameState) {
        gameState.zoomLevel = Math.max(0.5, gameState.zoomLevel - 0.2);
    }
}
