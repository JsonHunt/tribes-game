// MapObject: Handles creation, updating, and lookup of map object DOM elements (trees, boulders, etc.)

export class MapObject {
    id = null;
    type = null;
    tile = null;
    size = 1;
    /**
     * Create or update a map object DOM element (tree, boulder, etc.)
     * @param {Object} obj - The map object data
     * @param {number} currentTileSize
     * @param {HTMLElement} [objElement]
     * @returns {HTMLElement}
     */
    static createOrUpdateElement(obj, currentTileSize, objElement) {
        if (!objElement) {
            objElement = document.createElement('div');
            objElement.className = `map-object object-${obj.type}`;
            objElement.dataset.objectId = obj.id;
        }
        objElement.style.position = 'absolute';
        objElement.style.zIndex = '5';
        const objSize = currentTileSize * obj.size;
        objElement.style.width = `${objSize}px`;
        objElement.style.height = `${objSize}px`;
        const offsetX = (currentTileSize - objSize) / 2;
        const offsetY = (currentTileSize - objSize) / 2;
        objElement.style.left = `${offsetX}px`;
        objElement.style.top = `${offsetY}px`;
        // All other appearance is handled by CSS classes
        return objElement;
    }

    /**
     * Lookup a map object element by id in a map.
     * @param {Map} mapObjectElements
     * @param {string|number} id
     * @returns {HTMLElement|null}
     */
    static getElementById(mapObjectElements, id) {
        return mapObjectElements.get(id) || null;
    }

    /**
     * Remove a map object element from the DOM and the map.
     * @param {Map} mapObjectElements
     * @param {string|number} id
     */
    static removeElement(mapObjectElements, id) {
        const el = mapObjectElements.get(id);
        if (el && el.parentElement) el.parentElement.removeChild(el);
        mapObjectElements.delete(id);
    }
}


