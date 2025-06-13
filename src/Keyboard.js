import { Map } from "./map";

// Game controls system - handles keyboard and mouse interactions
export class Controls {
    
    setupKeyboardControls() {
        window.addEventListener('keydown', (event) => {
            // Don't handle keyboard events if user is typing in an input field
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
                return;
            }
            
            // Only handle keyboard controls when in gameplay screen
            if (this.gameState.currentScreen !== 'map') {
                return;
            }
            
            let handled = false;
            
            switch(event.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    Map.move(0, this.scrollSpeed);
                    handled = true;
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    Map.move(0, -this.scrollSpeed);
                    handled = true;
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    Map.move(this.scrollSpeed, 0);
                    handled = true;
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    Map.move(-this.scrollSpeed, 0);
                    handled = true;
                    break;
                case '+':
                case '=':
                    Map.zoomIn();
                    handled = true;
                    break;
                case '-':
                case '_':
                    Map.zoomOut();
                    handled = true;
                    break;
                case 'Escape':
                    // TODO: show escape menu
                    handled = true;
                    break;
            }
            
            if (handled) {
                event.preventDefault();
                event.stopPropagation();
            }
        });

        console.log('Keyboard controls setup');
    }
}
