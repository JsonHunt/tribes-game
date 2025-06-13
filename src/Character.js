import { ACTION_OUTCOME } from "./Action.js";
import CharacterBehavior from "./CharacterBehavior.js";
import { CharacterInfoPanel } from "./CharacterInfoPanel.js";
import Needs from "./Needs.js";

export class Character {
  constructor(id) {
    this.id = id;
    this.skills = new Map();
    this.traits = new Map();
    this.needs = new Map();
    this.position = { x: 0, y: 0 };
    this.rotation = 0;
    this.lastMovementDirection = { dx: 0, dy: 0 };
    this.currentAction = null;
  }

  static spawn(data) {
    const character = new Character(Character.nextID++);
    Object.assign(character, data);
    character.createElement();

    Character.allCharacters.push(character);
  }

  createElement() {
    const charElement = document.createElement("div");
    charElement.className = "character";
    charElement.style.position = "absolute"; // keep for layout
    charElement.dataset.characterId = this.id;
    
    // Hover logic
    charElement.addEventListener("mouseenter", () => {
      charElement.classList.add("hovered");
    });

    charElement.addEventListener("mouseleave", () => {
      if (charElement.classList.contains("hovered")) {
        charElement.classList.remove("hovered");
      }
    });

    // Click logic to show info panel
    charElement.addEventListener("click", (e) => {
      e.stopPropagation();
      CharacterInfoPanel.showCharacterInfo(this); 
    });

    // Image
    this.imageElement = document.createElement("img");
    this.imageElement.className = "character-img";
    charElement.appendChild(this.imageElement);
    
    const nameLabel = document.createElement("div");
    nameLabel.className = "character-name-label";
    charElement.appendChild(nameLabel);
    
    const actionLabel = document.createElement("div");
    actionLabel.className = "character-action-label";
    charElement.appendChild(actionLabel);
    
    Map.currentMap.mapElement.appendChild(charElement);
  }

  resizeElement(newSize) {
    this.charElement.style.width = `${newSize}px`;
    this.charElement.style.height = `${newSize}px`;
    this.charElement.style.top =  `${newSize * 0.1 + (this.y - Math.floor(this.y)) * newSize}px`;
    this.charElement.style.left = `${newSize * 0.1 + (this.x - Math.floor(this.x)) * newSize}px`;
  }

  showLabels() {
    this.charElement.querySelector(".character-name-label").style.display = "block";
    this.charElement.querySelector(".character-action-label").style.display = "block";
  }

  hideLabels() {
    this.charElement.querySelector(".character-name-label").style.display = "none";
    this.charElement.querySelector(".character-action-label").style.display = "none";
  }

  getMostUrgentNeed() {
    return Needs.getMostUrgentNeed(this);
  }

  doAction() {
    if (this.currentAction) {
      const outcome = this.currentAction.execute(this);
      if (outcome === ACTION_OUTCOME.IN_PROGRESS) return;
    }
    CharacterBehavior.chooseNextAction(this);
  }

  static onGameLoopUpdate() {
    for (const character of Character.allCharacters) {
      character.doAction();
    }
  }

  static startGameLoop() {
    Character.loopInterval = setInterval(Character.onGameLoopUpdate, 100);
  }

  static stopGameLoop() {
    if (Character.loopInterval) {
      clearInterval(Character.loopInterval);
      Character.loopInterval = null;
    }
  }
}

Character.nextID = 1;
Character.loopInterval = null;
Character.allCharacters = [];