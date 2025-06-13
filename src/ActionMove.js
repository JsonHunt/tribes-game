import { ACTION_OUTCOME } from "./Action.js";
import ActionRotate from "./ActionRotate.js";
import { Map } from "./Map.js";

export default class ActionMove {
  constructor(character, targetPosition) {
    this.character = character;
    this.targetPosition = targetPosition;
  }

  execute() {
    // Check if the character is already at the target position
    if (this.character.position.x === this.targetPosition.x &&
        this.character.position.y === this.targetPosition.y) {
      console.log("Character is already at the target position.");
      return ACTION_OUTCOME.COMPLETED;
    }

    // Rotate the character towards the target position
    this.rotateAction = new ActionRotate(this.character, this.targetPosition);
    const rotationOutcome = this.rotateAction.execute();
    if (rotationOutcome === ACTION_OUTCOME.IN_PROGRESS) {
      return ACTION_OUTCOME.IN_PROGRESS;
    }

    // Move the character towards the target position at the specified speed (in tile units)
    const speed = 0.1; // Move in tile units per tick
    const dx = this.targetPosition.x - this.character.position.x;
    const dy = this.targetPosition.y - this.character.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < speed) {
      // If the target is within one step, snap to the target
      this.character.position.x = this.targetPosition.x;
      this.character.position.y = this.targetPosition.y;
    } else {
      // Move the character in the direction of the target
      this.character.position.x += (dx / distance) * speed;
      this.character.position.y += (dy / distance) * speed;
    }
    // update character's dom element location in pixels
    const tileSize = Map.currentMap.tileSize || 32;
    const size = 32;
    this.character.charElement.style.left = `${this.character.position.x * tileSize + (tileSize - size) / 2}px`;
    this.character.charElement.style.top = `${this.character.position.y * tileSize + (tileSize - size) / 2}px`;

    return ACTION_OUTCOME.IN_PROGRESS;
  }
}