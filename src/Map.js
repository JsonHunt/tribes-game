import { MapTile } from "./MapTile.js";

export class Map {
  constructor(mapTiles) {
    this.tiles = []; // 2D array of tile data
    this.mapElement = document.createElement("div");
    this.width = mapTiles[0].length; // Default width, number of tiles horizontally
    this.height =  mapTiles.length; // Default height, number of tiles vertically
    this.tileSize = 32; // Default tile size in pixels
    this.zoomLevel = 1;
    this.left = 0; // Track map X offset
    this.top = 0;  // Track map Y offset
    this.spawnTiles(mapTiles);
  }

  static discardMap() {}

  spawnTiles(mapTiles) {
    // Set up mapElement as a grid container
    this.mapElement.style.display = 'grid';
    this.mapElement.style.gridTemplateColumns = `repeat(${this.width}, ${this.tileSize}px)`;
    this.mapElement.style.gridTemplateRows = `repeat(${this.height}, ${this.tileSize}px)`;
    this.mapElement.style.position = 'relative';
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const tile = new MapTile(mapTiles[y][x]);
        this.mapElement.appendChild(tile.domElement);
        tile.domElement.style.width = `${this.tileSize}px`;
        tile.domElement.style.height = `${this.tileSize}px`;
        tile.domElement.style.position = 'relative';
        tile.domElement.style.left = '';
        tile.domElement.style.top = '';
        tile.domElement.style.gridColumn = x + 1;
        tile.domElement.style.gridRow = y + 1;
        if (!this.tiles[y]) this.tiles[y] = [];
        this.tiles[y][x] = tile;
      }
    }
  }

  move(deltaX, deltaY) {
    this.left += deltaX;
    this.top += deltaY;
    this._updateTransform();
  }

  zoomIn() {
    this.zoomLevel = Math.min(4, this.zoomLevel + 0.2);
    this._updateTransform();
  }

  zoomOut() {
    this.zoomLevel = Math.max(0.5, this.zoomLevel - 0.2);
    this._updateTransform();
  }

  _updateTransform() {
    this.mapElement.style.transform = `translate(${this.left}px, ${this.top}px) scale(${this.zoomLevel})`;
  }

  static getRandomPosition() {
    const map = Map.currentMap;
    const x = Math.floor(Math.random() * map.width);
    const y = Math.floor(Math.random() * map.height);
    return { x, y };
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
