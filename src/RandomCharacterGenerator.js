import { Character } from "../Character";
import names from "../config/names";

// Character initialization and system setup methods
export class RandomCharacterGenerator {
  static generateRandomCharacters(numCharacters) {
    for (let i = 0; i < numCharacters; i++) {
      const data = {
        name: RandomCharacterGenerator.getRandomName(),
        gender: RandomCharacterGenerator.getRandomGender(),
        age: RandomCharacterGenerator.getRandomAge(),
        position: Map.getRandomPosition(),
        skills: {},
        traits: {},
      };

      Character.spawn(data);
    }
  }

  static generateRandomName(gender) {
    const nameList = names[gender];
    if (!nameList || nameList.length === 0) {
      return `Character_${Math.random().toString(36).substr(2, 9)}`; // Fallback name
    }
    return nameList[Math.floor(Math.random() * nameList.length)];
  }

  static generateRandomAge() {
    return Math.floor(Math.random() * 60) + 18; // Age between 18 and 77
  }

  static generateRandomGender() {
    return Math.random() < 0.5 ? "male" : "female";
  }
}
