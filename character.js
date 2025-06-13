import { CHARACTER_STATES, TERRAIN_TYPES } from './constants.js';
import { enableSwimmingForCharacter, enableClimbingForCharacter } from './pathfinding.js';
import { generateName, generateEthnicity, generateAge, generateGender } from './character-demographics.js';
import { CharacterActions } from './character-actions.js';
import { CharacterUpdates } from './character-updates.js';
import { CharacterInitialization } from './character-initialization.js';
import { CharacterUtils } from './character-utils.js';

export class Character {
    constructor(id, x, y) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.health = 100;
        this.energy = 100;
        this.state = CHARACTER_STATES.IDLE;
        this.currentAction = null;
        this.actionStartTime = 0;
        this.actionProgress = 0;
        this.skills = new Map();
        this.traits = new Map();
        this.needs = new Map();
        this.direction = 'down';
        this.lastMovementDirection = { dx: 0, dy: 0 };
        this.gender = generateGender();
        this.age = generateAge();
        this.ethnicity = generateEthnicity();
        this.name = generateName(this.gender);
        this.initializeCharacterSystems();
    }
    initializeCharacterSystems() {
        CharacterInitialization.initializeSkills(this);
        CharacterInitialization.initializeTraits(this);
        CharacterInitialization.initializeNeeds(this);
    }
    getMostUrgentNeed() {
        let mostUrgent = null;
        let urgencyScore = Infinity;
        for (const [needName, need] of this.needs) {
            const score = need.satisfaction * need.priority;
            if (score < urgencyScore) {
                urgencyScore = score;
                mostUrgent = { name: needName, ...need };
            }
        }
        return mostUrgent;
    }
    updateNeeds() {
        const currentTime = Date.now();
        for (const [, need] of this.needs) {
            const timeSinceLastUpdate = currentTime - need.lastUpdate;
            const hoursElapsed = timeSinceLastUpdate / (1000 * 60 * 60);
            const decay = need.decayRate * hoursElapsed * 10;
            need.satisfaction = Math.max(0, need.satisfaction - decay);
            need.lastUpdate = currentTime;
        }
    }
    update(deltaTime, gameState, pathfindingSystem) {
        this.updateNeeds(deltaTime);
        if (!this.currentAction) {
            this.assignActionBasedOnNeeds(gameState, pathfindingSystem);
            return;
        }
        CharacterUpdates.updateCharacter(this, deltaTime, gameState, pathfindingSystem);
    }
    assignActionBasedOnNeeds(gameState, pathfindingSystem) {
        CharacterActions.assignActionBasedOnNeeds(this, gameState, pathfindingSystem);
    }
    assignDrinkAction(gameState, pathfindingSystem) {
        CharacterActions.assignDrinkAction(this, gameState, pathfindingSystem);
    }
    assignEatAction(gameState, pathfindingSystem) {
        CharacterActions.assignEatAction(this, gameState, pathfindingSystem);
    }
    assignRestAction(gameState, pathfindingSystem) {
        CharacterActions.assignRestAction(this, gameState, pathfindingSystem);
    }
    assignSafetyAction(gameState, pathfindingSystem) {
        CharacterActions.assignSafetyAction(this, gameState, pathfindingSystem);
    }
    assignSocialAction(gameState, pathfindingSystem) {
        CharacterActions.assignSocialAction(this, gameState, pathfindingSystem);
    }
    assignExplorationAction(gameState, pathfindingSystem) {
        CharacterActions.assignExplorationAction(this, gameState, pathfindingSystem);
    }
    assignRandomAction(gameState, pathfindingSystem) {
        CharacterActions.assignRandomAction(this, gameState, pathfindingSystem);
    }
    findNearbyTerrain(gameState, terrainType, maxDistance = 10) {
        return CharacterUtils.findNearbyTerrain(this, gameState, terrainType, maxDistance);
    }
    getDistanceTo(otherCharacter) {
        return CharacterUtils.getDistanceTo(this, otherCharacter);
    }
    updateDirection(dx, dy) {
        CharacterUtils.updateDirection(this, dx, dy);
    }
    updateMoveAction(elapsed, deltaTime, gameState, pathfindingSystem) {
        CharacterUpdates.updateMoveAction(this, elapsed, deltaTime, gameState, pathfindingSystem);
    }
    updateWaitAction(elapsed, gameState, pathfindingSystem) {
        CharacterUpdates.updateWaitAction(this, elapsed, gameState, pathfindingSystem);
    }
    updateDrinkAction(elapsed, gameState, pathfindingSystem) {
        CharacterUpdates.updateDrinkAction(this, elapsed, gameState, pathfindingSystem);
    }
    updateEatAction(elapsed, gameState, pathfindingSystem) {
        CharacterUpdates.updateEatAction(this, elapsed, gameState, pathfindingSystem);
    }
    updateRestAction(elapsed, gameState, pathfindingSystem) {
        CharacterUpdates.updateRestAction(this, elapsed, gameState, pathfindingSystem);
    }
}

export class CharacterManager {
    constructor() {
        this.characters = [];
    }
    generateCharacters(gameState) {
        this.characters = [];
        for (let i = 0; i < gameState.tribeSize; i++) {
            let x, y;
            let attempts = 0;
            do {
                x = Math.floor(Math.random() * gameState.worldWidth);
                y = Math.floor(Math.random() * gameState.worldHeight);
                attempts++;
            } while (gameState.map[y][x] === TERRAIN_TYPES.WATER && attempts < 50);
            const character = new Character(i, x, y);
            this.characters.push(character);
        }
        gameState.characters = this.characters;
    }
    initializeCharacterAbilities(pathfindingSystem) {
        this.characters.forEach(character => {
            const swimmingSkill = character.skills.get('swimming') || 0;
            if (swimmingSkill > 30 || Math.random() < 0.1) {
                enableSwimmingForCharacter(character, pathfindingSystem);
                character.skills.set('swimming', Math.max(swimmingSkill, 50));
            }
            const climbingSkill = character.skills.get('climbing') || 0;
            if (climbingSkill > 25 || Math.random() < 0.05) {
                enableClimbingForCharacter(character, pathfindingSystem);
                character.skills.set('climbing', Math.max(climbingSkill, 40));
            }
        });
    }
    updateCharacters(deltaTime, gameState, pathfindingSystem) {
        for (const character of this.characters) {
            character.update(deltaTime, gameState, pathfindingSystem);
        }
    }
    getCharactersAtTile(x, y) {
        return this.characters.filter(char => {
            const charTileX = Math.floor(char.x);
            const charTileY = Math.floor(char.y);
            return charTileX === x && charTileY === y;
        });
    }
}
