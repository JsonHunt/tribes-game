// Main game orchestrator - coordinates all game modules
import { HomeScreen } from "./HomeScreen.js";
import { BIOME_ALGORITHMS, MapGenerator } from "./MapGenerator.js";
import { MapScreen } from "./MapScreen.js";
import { MapTile } from "./MapTile.js";
import { RandomCharacterGenerator } from "./RandomCharacterGenerator.js";
import { Screen } from "./Screen.js";

export default class Game {
  static startNewGame() {
    const biomeAlgorithm = BIOME_ALGORITHMS.CLUSTER;
    const mapTiles = MapGenerator.generateMapTiles(100, 100, biomeAlgorithm, MapTile.TERRAIN_TYPES);
    const map = new Map(mapTiles);
    Map.currentMap = map;
    RandomCharacterGenerator.generateRandomCharacters();
    MapScreen.show();
  }

  static endGame() {}

  // Setup window events
  setupWindowEvents() {
    console.log("Window events setup");
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  window.focus();
  new HomeScreen().show();
});

// Window resize handler
window.addEventListener("resize", () => {
  if (this.gameState.currentScreen === "gameplayScreen") {
    // TODO: Update map position or resize logic
  }
});

// Ensure window has focus for keyboard controls
window.addEventListener("focus", () => {
  if (Screen.currentScreen.name === "map") {
    // Refocus to ensure keyboard events work
    setTimeout(() => window.focus(), 10);
  }
});
