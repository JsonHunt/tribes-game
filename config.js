// Game Configuration
// Contains all configurable parameters for map objects and game mechanics

const GAME_CONFIG = {
    // Tree configuration
    trees: {
        minSize: 0.3,           // Minimum tree size (relative to tile)
        maxSize: 1.2,           // Maximum tree size (relative to tile)
        growthTime: 45000,      // Time for tree to reach maturity (45 seconds)
        growthRate: 0.02,       // Growth per update cycle
        spawnRate: 30000,       // Time between spawning new trees (30 seconds)
        spawnRadius: 3,         // Radius around mature tree to spawn new trees
        density: 0.15,          // Percentage of grass tiles that should have trees (15%)
        matureThreshold: 0.8    // Size at which tree is considered mature
    },
    
    // Boulder configuration
    boulders: {
        minSize: 0.4,           // Minimum boulder size (relative to tile)
        maxSize: 0.9,           // Maximum boulder size (relative to tile)
        density: 0.08           // Percentage of rock tiles that should have boulders (8%)
    },
    
    // Visual configuration
    visual: {
        treeColor: '#2d5016',       // Dark green for trees
        treeHighlight: '#4a7c59',   // Lighter green for tree highlights
        boulderColor: '#5d5d5d',    // Dark gray for boulders
        boulderHighlight: '#7f7f7f' // Lighter gray for boulder highlights
    }
};

// Export for ES6 modules
export default GAME_CONFIG;
