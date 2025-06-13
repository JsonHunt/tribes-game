// Character rendering logic for the UI
import { CHARACTER_STATES, ACTION_TYPES } from './constants.js';

export class UICharacters {
    static renderCharactersOnTile(tile, x, y, currentTileSize, gameState, getGameSettings) {
        const charactersOnTile = gameState.characters.filter(char => {
            const charTileX = Math.floor(char.x);
            const charTileY = Math.floor(char.y);
            return charTileX === x && charTileY === y;
        });
        if (charactersOnTile.length > 0) {
            charactersOnTile.forEach(character => {
                // Container for character
                const charElement = document.createElement('div');
                charElement.className = 'character';
                charElement.style.width = `${currentTileSize * 0.8}px`;
                charElement.style.height = `${currentTileSize * 0.8}px`;
                charElement.style.position = 'absolute';
                charElement.style.top = `${currentTileSize * 0.1 + ((character.y - Math.floor(character.y)) * currentTileSize)}px`;
                charElement.style.left = `${currentTileSize * 0.1 + ((character.x - Math.floor(character.x)) * currentTileSize)}px`;
                charElement.style.borderRadius = '2px';
                charElement.style.zIndex = '10';
                charElement.dataset.characterId = character.id;

                // Add colored border based on character's most urgent need
                let borderColor = '#27ae60'; // Default green for content
                let urgentNeed = null;
                if (character.getMostUrgentNeed) {
                    urgentNeed = character.getMostUrgentNeed();
                    if (urgentNeed) {
                        switch (urgentNeed.name) {
                            case 'thirst': borderColor = '#3498db'; break;
                            case 'hunger': borderColor = '#e67e22'; break;
                            case 'rest': borderColor = '#9b59b6'; break;
                            case 'safety': borderColor = '#e74c3c'; break;
                            case 'social': borderColor = '#f39c12'; break;
                            default: borderColor = '#27ae60'; break;
                        }
                    } else if (character.state === CHARACTER_STATES.MOVING) {
                        borderColor = '#f39c12';
                    } else if (character.state === CHARACTER_STATES.WAITING) {
                        borderColor = '#9b59b6';
                    }
                }
                charElement.style.border = `2px solid ${borderColor}`;
                charElement.style.boxShadow = `0 0 4px ${borderColor}`;

                // --- Character image (rotated) ---
                const img = document.createElement('img');
                img.src = character.gender === 'male' ? 'assets/images/character-male.png' : 'assets/images/character-female.png';
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.display = 'block';
                img.style.borderRadius = '2px';
                img.style.pointerEvents = 'none';
                let rotation = 0;
                switch (character.direction) {
                    case 'up': rotation = 180; break;
                    case 'left': rotation = 90; break;
                    case 'right': rotation = -90; break;
                    case 'down': default: rotation = 0; break;
                }
                img.style.transform = `rotate(${rotation}deg)`;
                img.style.transition = 'transform 0.2s';
                charElement.appendChild(img);

                // --- Name label (not rotated) ---
                const settings = getGameSettings ? getGameSettings() : {};
                if (settings.showCharacterNames && gameState.zoomLevel >= 2.8) {
                    const nameLabel = document.createElement('div');
                    nameLabel.className = 'character-name-label';
                    nameLabel.textContent = character.name;
                    nameLabel.style.position = 'absolute';
                    nameLabel.style.bottom = `${currentTileSize * 0.9}px`;
                    nameLabel.style.left = '50%';
                    nameLabel.style.transform = 'translateX(-50%)';
                    nameLabel.style.fontSize = '10px';
                    nameLabel.style.fontWeight = 'bold';
                    nameLabel.style.color = 'white';
                    nameLabel.style.textShadow = '1px 1px 2px rgba(0,0,0,0.8)';
                    nameLabel.style.pointerEvents = 'none';
                    nameLabel.style.zIndex = '11';
                    nameLabel.style.whiteSpace = 'nowrap';
                    charElement.appendChild(nameLabel);

                    if (character.currentAction && settings.showActionIndicators) {
                        const actionLabel = document.createElement('div');
                        actionLabel.className = 'character-action-label';
                        actionLabel.textContent = character.currentAction.type.replace('_', ' ');
                        actionLabel.style.position = 'absolute';
                        actionLabel.style.bottom = `${currentTileSize * 1.1}px`;
                        actionLabel.style.left = '50%';
                        actionLabel.style.transform = 'translateX(-50%)';
                        actionLabel.style.fontSize = '8px';
                        actionLabel.style.color = 'rgba(255,255,255,0.8)';
                        actionLabel.style.textShadow = '1px 1px 2px rgba(0,0,0,0.8)';
                        actionLabel.style.pointerEvents = 'none';
                        actionLabel.style.zIndex = '11';
                        actionLabel.style.whiteSpace = 'nowrap';
                        charElement.appendChild(actionLabel);
                    }
                }

                tile.appendChild(charElement);
            });
        }
    }
}
