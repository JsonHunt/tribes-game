import { UIMapTile } from "./ui-map-tile.js";

export class Map {
  constructor() {
    this.tiles = []; // 2D array of tile data
    this.mapElement = document.createElement("div");
    this.width = 100; // Default width, number of tiles horizontally
    this.height = 100; // Default height, number of tiles vertically
    this.tileSize = 32; // Default tile size in pixels
    this.zoomLevel = 1;
  }

  static discardMap() {}

  spawnTiles() {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const tile = UIMapTile.createTile(x, y, this.map[y][x], this.tileSize);
        this.mapElement.appendChild(tile);
        this.tileElements.push(tile);
      }
    }
  }

  move(deltaX, deltaY) {
    this.mapElement.style.transform = `translate(${this.left + deltaX}px, ${this.top + deltaY}px)`;
  }

  zoomIn() {
    this.zoomLevel = Math.min(4, this.zoomLevel + 0.2);
    this.mapElement.style.transform = `scale(${this.zoomLevel})`;
  }

  zoomOut() {
    this.zoomLevel = Math.max(0.5, this.zoomLevel - 0.2);
    this.mapElement.style.transform = `scale(${this.zoomLevel})`;
  }

  findClosestTerrain(position, terrainType, maxDistance = 10) {
    const tiles = [];
    const currentX = Math.floor(position.x);
    const currentY = Math.floor(position.y);

    for (let y = Math.max(0, currentY - maxDistance); y < Math.min(this.height, currentY + maxDistance); y++) {
      for (let x = Math.max(0, currentX - maxDistance); x < Math.min(this.width, currentX + maxDistance); x++) {
        if (this.tiles[y][x] === terrainType) {
          const distance = Math.sqrt(Math.pow(x - currentX, 2) + Math.pow(y - currentY, 2));
          if (distance <= maxDistance) {
            tiles.push({ x, y, distance });
          }
        }
      }
    }

    // Sort by distance, closest first
    return tiles.sort((a, b) => a.distance - b.distance);
  }
}

Map.currentMap = null;
Map.tileElements = [];
