import { ACTION_OUTCOME } from "./Action.js";
import ActionRotate from "./ActionRotate.js";
import { Map } from "./Map.js";
import { TERRAIN_TYPES } from "./MapTile.js";

function findPath(start, end, mapTiles) {
  // Simple A* pathfinding, avoiding water tiles
  const width = mapTiles[0].length;
  const height = mapTiles.length;
  const openSet = [];
  const closedSet = new Set();
  const cameFrom = {};
  const gScore = Array.from({ length: height }, () => Array(width).fill(Infinity));
  const fScore = Array.from({ length: height }, () => Array(width).fill(Infinity));

  function hash(x, y) { return `${x},${y}`; }
  function heuristic(x, y) { return Math.abs(x - end.x) + Math.abs(y - end.y); }

  openSet.push({ x: start.x, y: start.y });
  gScore[start.y][start.x] = 0;
  fScore[start.y][start.x] = heuristic(start.x, start.y);

  while (openSet.length > 0) {
    // Get node with lowest fScore
    openSet.sort((a, b) => fScore[a.y][a.x] - fScore[b.y][b.x]);
    const current = openSet.shift();
    if (current.x === end.x && current.y === end.y) {
      // Reconstruct path
      const path = [];
      let node = hash(current.x, current.y);
      while (cameFrom[node]) {
        path.unshift({ x: current.x, y: current.y });
        const prev = cameFrom[node];
        current.x = prev.x;
        current.y = prev.y;
        node = hash(current.x, current.y);
      }
      return path;
    }
    closedSet.add(hash(current.x, current.y));
    // 4 directions
    for (const [dx, dy] of [[0,1],[1,0],[0,-1],[-1,0]]) {
      const nx = current.x + dx;
      const ny = current.y + dy;
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      if (mapTiles[ny][nx].terrainType === TERRAIN_TYPES.WATER) continue;
      if (closedSet.has(hash(nx, ny))) continue;
      const tentative_gScore = gScore[current.y][current.x] + 1;
      if (tentative_gScore < gScore[ny][nx]) {
        cameFrom[hash(nx, ny)] = { x: current.x, y: current.y };
        gScore[ny][nx] = tentative_gScore;
        fScore[ny][nx] = tentative_gScore + heuristic(nx, ny);
        if (!openSet.some(n => n.x === nx && n.y === ny)) {
          openSet.push({ x: nx, y: ny });
        }
      }
    }
  }
  return null; // No path found
}

export default class ActionMove {
  constructor(character, targetPosition) {
    this.character = character;
    this.targetPosition = targetPosition;
    this.path = null;
    this.pathIndex = 0;
  }

  execute() {
    // If no path, calculate it
    if (!this.path) {
      const start = { x: Math.round(this.character.position.x), y: Math.round(this.character.position.y) };
      const end = { x: Math.round(this.targetPosition.x), y: Math.round(this.targetPosition.y) };
      this.path = findPath(start, end, Map.currentMap.tiles);
      this.pathIndex = 0;
      this.lastDirection = null;
      if (!this.path || this.path.length === 0) {
        // No path found or already at target
        return ACTION_OUTCOME.COMPLETED;
      }
    }
    // If at the end of the path
    if (this.pathIndex >= this.path.length) {
      return ACTION_OUTCOME.COMPLETED;
    }
    // Move smoothly through all points in the path
    while (this.pathIndex < this.path.length) {
      const next = this.path[this.pathIndex];
      const dx = next.x - this.character.position.x;
      const dy = next.y - this.character.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const speed = 0.1;
      // Rotate if direction changes
      const direction = Math.atan2(dy, dx);
      if (this.lastDirection === undefined || Math.abs(direction - this.lastDirection) > 0.01) {
        // Use ActionRotate to rotate character
        if (!this.rotateAction || this.rotateAction.targetDirection !== direction) {
          this.rotateAction = new ActionRotate(this.character, { x: next.x, y: next.y });
          this.rotateAction.targetDirection = direction;
        }
        const rotationOutcome = this.rotateAction.execute();
        if (rotationOutcome === ACTION_OUTCOME.IN_PROGRESS) {
          return ACTION_OUTCOME.IN_PROGRESS;
        }
        this.lastDirection = direction;
      }
      if (distance < speed) {
        this.character.position.x = next.x;
        this.character.position.y = next.y;
        this.pathIndex++;
      } else {
        this.character.position.x += (dx / distance) * speed;
        this.character.position.y += (dy / distance) * speed;
        break;
      }
    }
    // update character's dom element location in pixels
    const tileSize = Map.currentMap.tileSize || 32;
    const size = 32;
    this.character.charElement.style.left = `${this.character.position.x * tileSize + (tileSize - size) / 2}px`;
    this.character.charElement.style.top = `${this.character.position.y * tileSize + (tileSize - size) / 2}px`;
    return (this.pathIndex >= this.path.length) ? ACTION_OUTCOME.COMPLETED : ACTION_OUTCOME.IN_PROGRESS;
  }
}