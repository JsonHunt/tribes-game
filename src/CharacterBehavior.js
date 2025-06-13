import ActionMove from "./ActionMove";

export default class CharacterBehavior {
  static chooseNextAction(character) {
    // next action is move to random location on the map
    const map = Map.currentMap;
    const randomX = Math.floor(Math.random() * map.width);
    const randomY = Math.floor(Math.random() * map.height);
    character.currentAction = new ActionMove(character, { x: randomX, y: randomY });
  }
}
