export const BIOME_ALGORITHMS = {
    CLUSTER: 'cluster',
    VORONOI: 'voronoi',
    PERLIN: 'perlin'
};

export class MapGenerator {
    static generateMapTiles(width, height, algorithm = BIOME_ALGORITHMS.CLUSTER, terrainTypes) {
        if (algorithm === BIOME_ALGORITHMS.CLUSTER) {
            return this.generateClusterMap(width, height, terrainTypes);
        }
        else if (algorithm === BIOME_ALGORITHMS.VORONOI) {
            return this.generateVoronoiMap(width, height, terrainTypes);
        } else if (algorithm === BIOME_ALGORITHMS.PERLIN) {
            return this.generatePerlinMap(width, height, terrainTypes);
        } else {
            throw new Error(`Unknown map generation algorithm: ${algorithm}`);
        }
    }

    static generateClusterMap(width, height, terrainTypes) {
        // Simple cluster: randomly seed clusters, then expand
        const map = Array.from({ length: height }, () => Array(width).fill(null));
        const numClusters = Math.max(3, Math.floor((width * height) / 50));
        const seeds = [];
        for (let i = 0; i < numClusters; i++) {
            const x = Math.floor(Math.random() * width);
            const y = Math.floor(Math.random() * height);
            const terrain = terrainTypes[Math.floor(Math.random() * terrainTypes.length)];
            map[y][x] = terrain;
            seeds.push({ x, y, terrain });
        }
        // Expand clusters
        const directions = [ [0,1], [1,0], [0,-1], [-1,0] ];
        for (let iter = 0; iter < width * height; iter++) {
            for (const { x, y, terrain } of seeds) {
                for (const [dx, dy] of directions) {
                    const nx = x + dx * Math.floor(Math.random() * 3);
                    const ny = y + dy * Math.floor(Math.random() * 3);
                    if (nx >= 0 && nx < width && ny >= 0 && ny < height && !map[ny][nx]) {
                        map[ny][nx] = terrain;
                    }
                }
            }
        }
        // Fill any remaining nulls randomly
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (!map[y][x]) {
                    map[y][x] = terrainTypes[Math.floor(Math.random() * terrainTypes.length)];
                }
            }
        }
        return map;
    }

    static generateVoronoiMap(width, height, terrainTypes) {
        // Place random centers
        const numCenters = Math.max(3, Math.floor((width * height) / 100));
        const centers = [];
        for (let i = 0; i < numCenters; i++) {
            centers.push({
                x: Math.random() * width,
                y: Math.random() * height,
                terrain: terrainTypes[Math.floor(Math.random() * terrainTypes.length)]
            });
        }
        const map = Array.from({ length: height }, () => Array(width).fill(null));
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let minDist = Infinity;
                let chosen = centers[0];
                for (const center of centers) {
                    const dist = (center.x - x) ** 2 + (center.y - y) ** 2;
                    if (dist < minDist) {
                        minDist = dist;
                        chosen = center;
                    }
                }
                map[y][x] = chosen.terrain;
            }
        }
        return map;
    }

    static generatePerlinMap(width, height, terrainTypes) {
        // Simple noise: use Math.random for now, can be replaced with real Perlin/Simplex
        const map = Array.from({ length: height }, () => Array(width).fill(null));
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                // Fake noise: smooth random
                const value = (Math.sin(x * 0.3) + Math.cos(y * 0.3) + Math.random()) / 3;
                const idx = Math.floor(value * terrainTypes.length) % terrainTypes.length;
                map[y][x] = terrainTypes[Math.abs(idx)];
            }
        }
        return map;
    }



}
