import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Character } from '../ui-characters';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

  static loadNeedsCofig() {
    const needsFilePath = path.join(__dirname, 'needs.json');
    Needs.needsData = JSON.parse(fs.readFileSync(needsFilePath, 'utf8'));
  }
    
  static initializeNeeds(character) {
    for (const needConfig of Object.values(Needs.needsData)) {
      character.needs.set(
        needConfig.name,
        {
          satisfaction: needConfig.initialSatisfaction || needConfig.max
        }
      );
    }
  }

  static decayNeeds(character) {
    const currentTime = Date.now();
    for (const need of character.needs.values()) {
      const timeSinceLastUpdate = currentTime - need.lastUpdate;
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

Needs.needsData;

export default Needs;