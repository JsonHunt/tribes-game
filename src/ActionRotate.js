import { ACTION_OUTCOME } from "./Action.js";

export default class ActionRotate {
  constructor(character, targetLocation) {
    this.character = character;
    // Calculate the target rotation based on character location and the target location
    const dx = targetLocation.x - character.position.x;
    const dy = targetLocation.y - character.position.y;
    this.targetRotation = Math.atan2(dy, dx) * (180 / Math.PI);
    this.targetRotation = (this.targetRotation + 360) % 360; // Normalize to [0, 360)
  }

  execute() {
    // Check if the character is already at the target rotation
    if (this.character.rotation === this.targetRotation) {
      console.log("Character is already at the target rotation.");
      return ACTION_OUTCOME.COMPLETED;
    }
    // Rotate the character towards the target rotation
    const rotationSpeed = 5; // Degrees per frame, adjust as needed
    const rotationDifference = this.targetRotation - this.character.rotation;
    if (Math.abs(rotationDifference) < rotationSpeed) {
      this.character.rotation = this.targetRotation;
    } else {
      this.character.rotation += Math.sign(rotationDifference) * rotationSpeed;
    }

    this.character.imageElement.style.transform = `rotate(${this.character.rotation}deg)`;

    return ACTION_OUTCOME.IN_PROGRESS;
  }
}
