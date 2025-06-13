import { TERRAIN_TYPES } from './constants.js';

// Character utility functions
export class CharacterUtils {
    
    static findNearbyTerrain(character, gameState, terrainType, maxDistance = 10) {
        const tiles = [];
        const currentX = Math.floor(character.x);
        const currentY = Math.floor(character.y);
        
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

    static getDistanceTo(character, otherCharacter) {
        return Math.sqrt(Math.pow(otherCharacter.x - character.x, 2) + Math.pow(otherCharacter.y - character.y, 2));
    }

    static updateDirection(character, dx, dy) {
        // Only update direction if there's significant movement
        if (Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01) {
            character.lastMovementDirection = { dx, dy };
            
            // Determine primary direction based on the larger component
            if (Math.abs(dx) > Math.abs(dy)) {
                character.direction = dx > 0 ? 'right' : 'left';
            } else {
                character.direction = dy > 0 ? 'down' : 'up';
            }
        }
    }
}
