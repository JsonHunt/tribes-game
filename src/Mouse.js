import { Map } from "./Map.js";
import { Screen } from "./Screen.js";

// Game controls system - handles keyboard and mouse interactions
export class Controls {
    
    setupMouseControls() {
        const viewport = document.getElementById('gameViewport');
        
        // Mouse wheel zoom
        viewport.addEventListener('wheel', (event) => {
            event.preventDefault();
            
            if (Screen.currentScreen !== 'map') {
                return;
            }
            
            if (event.deltaY < 0) {
                Map.zoomIn();
            } else {
                Map.zoomOut();
            }
        });

        // Mouse drag functionality for panning
        viewport.addEventListener('mousedown', (event) => {
            if (event.button === 0) { // Left mouse button only
                this.isDragging = true;
                this.lastMousePos = { x: event.clientX, y: event.clientY };
                viewport.style.cursor = 'grabbing';
                event.preventDefault();
            }
        });

        viewport.addEventListener('mousemove', (event) => {
            if (this.isDragging && Screen.currentScreen === 'map') {
                const deltaX = event.clientX - this.lastMousePos.x;
                const deltaY = event.clientY - this.lastMousePos.y;

                Map.move(deltaX, deltaY);
                this.lastMousePos = { x: event.clientX, y: event.clientY };
                event.preventDefault();
            }
        });

        viewport.addEventListener('mouseup', (event) => {
            if (event.button === 0) { // Left mouse button
                this.isDragging = false;
                viewport.style.cursor = 'grab';
                event.preventDefault();
            }
        });

        viewport.addEventListener('mouseleave', () => {
            this.isDragging = false;
            viewport.style.cursor = 'grab';
        });

        // Set initial cursor style
        viewport.style.cursor = 'grab';

        console.log('Mouse controls setup');
    }
}
