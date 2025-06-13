import { ACTION_OUTCOME } from "./Action";
import ActionRotate from "./ActionRotate";

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

    // Move the character towards the target position at the specified speed
    const speed = 2; // Adjust speed as needed
    const dx = this.targetPosition.x - this.character.position.x;
    const dy = this.targetPosition.y - this.character.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < speed) {
      // If the target is within one step, snap to the target
      this.character.position = this.targetPosition;
    } else {
      // Move the character in the direction of the target
      this.character.position.x += (dx / distance) * speed;
      this.character.position.y += (dy / distance) * speed;
    }
    // update characters dom element location
    this.character.charElement.style.left = `${this.character.position.x}px`;
    this.character.charElement.style.top = `${this.character.position.y}px`;

    return ACTION_OUTCOME.IN_PROGRESS;
  }
}