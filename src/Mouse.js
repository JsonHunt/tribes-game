import { Map } from "./Map.js";
import { Screen } from "./Screen.js";

// Game controls system - handles keyboard and mouse interactions
export class Controls {
    
    setupMouseControls() {
        const mapElement = Map.currentMap && Map.currentMap.mapElement;
        const map = Map.currentMap;
        
        document.addEventListener('wheel', (event) => {
            console.log('Mouse wheel event fired');
            if (Screen.currentScreen.name !== 'map') {
                return;
            }
            if (event.deltaY < 0) {
                map.zoomIn();
            } else {
                map.zoomOut();
            }
        });

        // Mouse drag functionality for panning (attach to map element)
        mapElement.addEventListener('mousedown', (event) => {
            if (event.button === 0) { // Left mouse button only
                this.isDragging = true;
                this.lastMousePos = { x: event.clientX, y: event.clientY };
                mapElement.style.cursor = 'grabbing';
                event.preventDefault();
            }
        });

        mapElement.addEventListener('mousemove', (event) => {
            if (this.isDragging && Screen.currentScreen.name === 'map') {
                const deltaX = event.clientX - this.lastMousePos.x;
                const deltaY = event.clientY - this.lastMousePos.y;

                Map.currentMap.move(deltaX, deltaY);
                this.lastMousePos = { x: event.clientX, y: event.clientY };
                event.preventDefault();
            }
        });

        mapElement.addEventListener('mouseup', (event) => {
            if (event.button === 0) { // Left mouse button
                this.isDragging = false;
                mapElement.style.cursor = 'grab';
                event.preventDefault();
            }
        });

        mapElement.addEventListener('mouseleave', () => {
            this.isDragging = false;
            mapElement.style.cursor = 'grab';
        });

        // Set initial cursor style
        mapElement.style.cursor = 'grab';

        console.log('Mouse controls setup');
    }
}
