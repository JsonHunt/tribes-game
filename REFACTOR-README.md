# Tribes Game - Refactored Architecture

## Overview
The game has been refactored from a single large `game.js` file into a modular, object-oriented architecture. This improves maintainability, testability, and code organization.

## File Structure

### Core Modules

#### `game.js` (Main Orchestrator)
- **Purpose**: Coordinates all game modules and handles initialization
- **Key Functions**: `beginGame()`, `initializeGame()`, menu functions
- **Exports**: Global functions for HTML event handlers

#### `game-state.js`
- **Purpose**: Manages the core game state
- **Class**: `GameState`
- **Responsibilities**: World configuration, state validation, reset functionality

#### `pathfinding.js`
- **Purpose**: Handles all pathfinding logic and movement rules
- **Class**: `PathfindingSystem`
- **Features**: A* pathfinding, extensible movement rules, character skills
- **Functions**: Character skill management (swimming, climbing)

#### `character.js`
- **Purpose**: Character management and behavior
- **Classes**: `Character`, `CharacterManager`
- **Responsibilities**: Character actions, movement, AI behavior

#### `map.js`
- **Purpose**: Map generation and object management
- **Classes**: `MapGenerator`, `MapObjectManager`
- **Responsibilities**: Terrain generation, trees, boulders, object spawning

#### `ui-manager.js`
- **Purpose**: User interface and rendering
- **Class**: `UIManager`
- **Responsibilities**: Screen management, map rendering, event handling

#### `game-loop.js`
- **Purpose**: Game loop management
- **Class**: `GameLoop`
- **Responsibilities**: Update timing, delta time calculations

### Configuration and Constants

#### `constants.js`
- **Purpose**: Game constants and enums
- **Exports**: `TERRAIN_TYPES`, `ACTION_TYPES`, `CHARACTER_STATES`, `OBJECT_TYPES`, `BIOMES`

#### `config.js`
- **Purpose**: Game configuration parameters
- **Export**: `GAME_CONFIG` (default export)

#### `biome-generator.js`
- **Purpose**: Biome generation algorithms
- **Classes**: Various biome generators
- **Export**: `BiomeGeneratorFactory`

## Architecture Benefits

### Modularity
- Each module has a single responsibility
- Easy to modify individual systems without affecting others
- Clear separation of concerns

### Object-Oriented Design
- Classes encapsulate related data and behavior
- Better code organization and reusability
- Easier to extend with new features

### ES6 Module System
- Clean import/export structure
- Proper dependency management
- No global namespace pollution (except for HTML handlers)

### Testability
- Individual modules can be unit tested
- Dependencies can be mocked
- Clear interfaces between modules

## Usage

The game is initialized through `game.js` which imports and coordinates all modules:

```javascript
// Game initialization flow:
1. initializeGame() - Creates all manager instances
2. beginGame() - User starts new game
3. Game systems coordinate through the main orchestrator
```

## Adding New Features

### New Character Abilities
Add to `pathfinding.js` following the pattern of swimming/climbing skills.

### New Map Objects
Extend `MapObjectManager` in `map.js` with new object types.

### New UI Elements
Add to `UIManager` in `ui-manager.js`.

### New Game Mechanics
Create new module files and import them in `game.js`.

## Migration Notes

- Old `game.js` is backed up as `game-old.js`
- HTML file updated to use ES6 modules
- All functionality preserved with improved structure
- Global functions still available for HTML onclick handlers
