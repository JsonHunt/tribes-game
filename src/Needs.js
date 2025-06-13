import needsData from "../config/needs.js";
import { Character } from "./Character.js";

class Needs {
  static getNeedByName(character, needName) {
    return character.needs.get(needName);
  }

  static getMostUrgentNeed(character) {
    if (!character || !character.needs) throw new Error("Character or needs not defined");
    let mostUrgent = null;
    let urgencyScore = Infinity;
    for (const [needName, need] of character.needs) {
      const score = need.satisfaction * need.priority;
      if (score < urgencyScore) {
        urgencyScore = score;
        mostUrgent = { name: needName, ...need };
      }
    }
    return mostUrgent;
  }

  static initializeNeeds(character) {
    for (const [needName, needConfig] of Object.entries(needsData)) {
      character.needs.set(
        needName,
        {
          satisfaction: needConfig.initial || needConfig.max,
          priority: needConfig.priority,
          decayRate: needConfig.decayRate,
          lastUpdate: Date.now(),
        }
      );
    }
  }

  static decayNeeds(character) {
    const currentTime = Date.now();
    for (const need of character.needs.values()) {
      const timeSinceLastUpdate = currentTime - (need.lastUpdate || currentTime);
      const hoursElapsed = timeSinceLastUpdate / (1000 * 60 * 60);
      const decay = need.decayRate * hoursElapsed * 10; // Adjust decay rate as needed
      need.satisfaction = Math.max(0, need.satisfaction - decay);
      need.lastUpdate = currentTime;
    }
  }

  static onGameLoopUpdate() {
    for (const character of Character.allCharacters) {
      Needs.decayNeeds(character);
    }
  }

  static startGameLoop() {
    Needs.loopInterval = setInterval(Needs.onGameLoopUpdate, 1000);
  }

  static stopGameLoop() {
    if (Needs.loopInterval) {
      clearInterval(Needs.loopInterval);
      Needs.loopInterval = null;
    }
  }
}

Needs.needsData = needsData;

export default Needs;