import abilitiesData from "../config/abilities.js";

class Abilities {
  addAbility(character, name) {
    character.abilities[name] = {
      ...Abilities.data[name],
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
}

Abilities.data = abilitiesData;

export default Abilities;