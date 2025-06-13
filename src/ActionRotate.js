import { ACTION_OUTCOME } from "./Action.js";

export default class ActionRotate {
  constructor(character, targetLocation) {
    this.character = character;
    // Calculate the target rotation based on character location and the target location
    const dx = targetLocation.x - character.position.x;
    const dy = targetLocation.y - character.position.y;
    // Calculate angle in degrees, normalized to [0, 360)
    this.targetRotation = Math.atan2(dy, dx) * (180 / Math.PI);
    this.targetRotation = (this.targetRotation + 360) % 360;
  }

  execute() {
    // If already at the target rotation (allow small epsilon for float errors)
    const epsilon = 1;
    let rotationDifference = this.targetRotation - this.character.rotation;
    // Normalize to [-180, 180] for shortest rotation
    rotationDifference = ((rotationDifference + 180) % 360) - 180;
    if (Math.abs(rotationDifference) < epsilon) {
      this.character.rotation = this.targetRotation;
      // Apply a -90 degree offset to the image rotation
      this.character.imageElement.style.transform = `rotate(${this.character.rotation - 90}deg)`;
      return ACTION_OUTCOME.COMPLETED;
    }
    // Only rotate if not already facing target
    const rotationSpeed = 25; // Degrees per frame
    this.character.rotation += Math.sign(rotationDifference) * Math.min(rotationSpeed, Math.abs(rotationDifference));
    this.character.rotation = (this.character.rotation + 360) % 360; // Keep in [0, 360)
    // Apply a -90 degree offset to the image rotation
    this.character.imageElement.style.transform = `rotate(${this.character.rotation - 90}deg)`;
    return ACTION_OUTCOME.IN_PROGRESS;
  }
}
