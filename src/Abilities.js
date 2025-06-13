import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Abilities {

  addAbility(character, name) {
     character.abilities[name] = {
      ...this.abilities[name],
      level: 1, // Default level
      experience: 0 // Default experience
    };
  }

  getAbility(character, name) {
    return character.abilities[name];
  }

  removeAbility(character, name) {
    delete character.abilities[name];
  }

  listAbilities(character) {
    return Object.keys(character.abilities);
  }

  loadAbilitiesFromConfig() {
    const filePath = path.join(__dirname, 'abilities.json');
    Abilities.data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }

}

Abilities.data = {};

export default Abilities;