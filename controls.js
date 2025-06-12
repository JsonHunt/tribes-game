// Game controls system - handles keyboard and mouse interactions
export class ControlsManager {
    constructor(gameState, uiManager) {
        this.gameState = gameState;
        this.uiManager = uiManager;
        this.scrollSpeed = 20;
        this.isInitialized = false;
    }

    // Initialize all control event listeners
    initialize() {
        if (this.isInitialized) {
            return; // Prevent double initialization
        }

        this.setupKeyboardControls();
        this.setupMouseControls();
        this.setupWindowEvents();
        this.isInitialized = true;
        console.log('Controls initialized');
    }

    // Setup keyboard controls for map navigation
    setupKeyboardControls() {
        window.addEventListener('keydown', (event) => {
            // Don't handle keyboard events if user is typing in an input field
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
                return;
            }
            
            // Only handle keyboard controls when in gameplay screen
            if (this.gameState.currentScreen !== 'gameplayScreen') {
                return;
            }
            
            let handled = false;
            
            switch(event.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    this.uiManager.scrollMap(0, this.scrollSpeed);
                    handled = true;
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    this.uiManager.scrollMap(0, -this.scrollSpeed);
                    handled = true;
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    this.uiManager.scrollMap(this.scrollSpeed, 0);
                    handled = true;
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    this.uiManager.scrollMap(-this.scrollSpeed, 0);
                    handled = true;
                    break;
                case '+':
                case '=':
                    this.uiManager.zoomIn();
                    handled = true;
                    break;
                case '-':
                case '_':
                    this.uiManager.zoomOut();
                    handled = true;
                    break;
                case 'Escape':
                    this.uiManager.hideCharacterInfo();
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

    // Setup mouse controls for map interaction
    setupMouseControls() {
        const viewport = document.getElementById('gameViewport');
        if (!viewport) {
            console.error('Game viewport not found!');
            return;
        }

        // Mouse wheel zoom
        viewport.addEventListener('wheel', (event) => {
            event.preventDefault();
            
            if (this.gameState.currentScreen !== 'gameplayScreen') {
                return;
            }
            
            if (event.deltaY < 0) {
                this.uiManager.zoomIn();
            } else {
                this.uiManager.zoomOut();
            }
        });

        // Mouse drag functionality for panning
        viewport.addEventListener('mousedown', (event) => {
            if (event.button === 0) { // Left mouse button only
                this.gameState.isDragging = true;
                this.gameState.lastMousePos = { x: event.clientX, y: event.clientY };
                viewport.style.cursor = 'grabbing';
                event.preventDefault();
            }
        });

        viewport.addEventListener('mousemove', (event) => {
            if (this.gameState.isDragging && this.gameState.currentScreen === 'gameplayScreen') {
                const deltaX = event.clientX - this.gameState.lastMousePos.x;
                const deltaY = event.clientY - this.gameState.lastMousePos.y;
                
                this.uiManager.scrollMap(deltaX, deltaY);
                this.gameState.lastMousePos = { x: event.clientX, y: event.clientY };
                event.preventDefault();
            }
        });

        viewport.addEventListener('mouseup', (event) => {
            if (event.button === 0) { // Left mouse button
                this.gameState.isDragging = false;
                viewport.style.cursor = 'grab';
                event.preventDefault();
            }
        });

        viewport.addEventListener('mouseleave', () => {
            this.gameState.isDragging = false;
            viewport.style.cursor = 'grab';
        });

        // Set initial cursor style
        viewport.style.cursor = 'grab';

        console.log('Mouse controls setup');
    }

    // Setup window events
    setupWindowEvents() {
        // Window resize handler
        window.addEventListener('resize', () => {
            if (this.gameState.currentScreen === 'gameplayScreen') {
                this.uiManager.updateMapPosition();
            }
        });

        // Ensure window has focus for keyboard controls
        window.addEventListener('focus', () => {
            if (this.gameState.currentScreen === 'gameplayScreen') {
                // Refocus to ensure keyboard events work
                setTimeout(() => window.focus(), 10);
            }
        });

        console.log('Window events setup');
    }

    // Clean up event listeners
    destroy() {
        // In a real implementation, you'd store references to the event listeners
        // and remove them here to prevent memory leaks
        this.isInitialized = false;
    }

    // Update scroll speed (useful for accessibility or user preferences)
    setScrollSpeed(speed) {
        this.scrollSpeed = Math.max(1, Math.min(100, speed)); // Clamp between 1 and 100
    }
}
