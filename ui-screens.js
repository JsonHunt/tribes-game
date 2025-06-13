// UI screen and menu management
export class UIScreens {
    static showScreen(screenId, gameState) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
        if (gameState) gameState.currentScreen = screenId;
    }

    static showStartScreen(gameState) {
        this.showScreen('startScreen', gameState);
    }

    static showNewGameScreen(gameState) {
        this.showScreen('newGameScreen', gameState);
        setTimeout(() => {
            const firstInput = document.getElementById('worldSizeX');
            if (firstInput) firstInput.focus();
        }, 100);
    }

    static showGameplayScreen(gameState) {
        this.showScreen('gameplayScreen', gameState);
        setTimeout(() => {
            window.focus();
            document.body.focus();
        }, 100);
    }

    static showSettings(gameState, loadSettingsValues) {
        this.showScreen('settingsScreen', gameState);
        if (loadSettingsValues) loadSettingsValues();
    }

    static exitGame() {
        if (confirm('Are you sure you want to exit?')) {
            if (typeof require !== 'undefined') {
                const { remote } = require('electron');
                if (remote) remote.getCurrentWindow().close();
            }
        }
    }

    static loadGame() {
        alert('Load game functionality not implemented yet.');
    }
}
