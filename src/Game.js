// Main game orchestrator - coordinates all game modules
import { HomeScreen } from "./HomeScreen.js";
import { BIOME_ALGORITHMS, MapGenerator } from "./MapGenerator.js";
import { MapScreen } from "./MapScreen.js";
import { TERRAIN_TYPES } from "./MapTile.js";
import { RandomCharacterGenerator } from "./RandomCharacterGenerator.js";
import { Screen } from "./Screen.js";
import { Map } from "./Map.js";

export default class Game {
  static startNewGame() {
    const biomeAlgorithm = BIOME_ALGORITHMS.CLUSTER;
    const mapTiles = MapGenerator.generateMapTiles(100, 100, biomeAlgorithm, Object.values(TERRAIN_TYPES));
    const map = new Map(mapTiles);
    Map.currentMap = map;
    RandomCharacterGenerator.generateRandomCharacters();
    new MapScreen().show();
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
  if (Screen.currentScreen === "map") {
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
