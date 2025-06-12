import { TERRAIN_TYPES, OBJECT_TYPES } from './constants.js';

// Pathfinding system
export class PathfindingSystem {
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

    // Clear character-specific rules (used when starting a new game)
    clearCharacterRules() {
        const rulesToRemove = [];
        for (const [ruleId] of this.movementRules) {
            if (ruleId.includes('_')) {
                const parts = ruleId.split('_');
                if (parts.length > 1 && !isNaN(parseInt(parts[1]))) {
                    rulesToRemove.push(ruleId);
                }
            }
        }
        
        rulesToRemove.forEach(ruleId => {
            this.removeMovementRule(ruleId);
        });
    }
}

// Utility functions for pathfinding system extensibility
export function addCharacterSkill(character, skillId, skillData) {
    if (!character.skills) {
        character.skills = new Map();
    }
    character.skills.set(skillId, skillData);
}

export function removeCharacterSkill(character, skillId) {
    if (character.skills) {
        character.skills.delete(skillId);
    }
}

export function hasCharacterSkill(character, skillId) {
    return character.skills && character.skills.has(skillId);
}

// Example: Add swimming skill to allow water crossing
export function enableSwimmingForCharacter(character, pathfindingSystem) {
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
export function enableClimbingForCharacter(character, pathfindingSystem) {
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
