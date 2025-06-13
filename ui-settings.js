// Settings management logic extracted from UIManager
export function loadSettingsValues(getGameSettings) {
    const settings = getGameSettings();
    document.getElementById('showCharacterNames').checked = settings.showCharacterNames;
    document.getElementById('showActionIndicators').checked = settings.showActionIndicators;
    document.getElementById('enableSmoothAnimations').checked = settings.enableSmoothAnimations;
    document.getElementById('gameSpeed').value = settings.gameSpeed;
    document.getElementById('autoPause').checked = settings.autoPause;
    document.getElementById('masterVolume').value = settings.masterVolume;
    document.getElementById('enableSoundEffects').checked = settings.enableSoundEffects;
    document.getElementById('masterVolumeValue').textContent = settings.masterVolume + '%';
    const volumeSlider = document.getElementById('masterVolume');
    volumeSlider.addEventListener('input', (e) => {
        document.getElementById('masterVolumeValue').textContent = e.target.value + '%';
    });
}

export function getGameSettings() {
    const defaultSettings = {
        showCharacterNames: true,
        showActionIndicators: true,
        enableSmoothAnimations: true,
        gameSpeed: 1,
        autoPause: false,
        masterVolume: 50,
        enableSoundEffects: true
    };
    try {
        const savedSettings = localStorage.getItem('tribesGameSettings');
        return savedSettings ? { ...defaultSettings, ...JSON.parse(savedSettings) } : defaultSettings;
    } catch (e) {
        console.warn('Failed to load settings from localStorage:', e);
        return defaultSettings;
    }
}

export function saveGameSettings(settings) {
    try {
        localStorage.setItem('tribesGameSettings', JSON.stringify(settings));
    } catch (e) {
        console.warn('Failed to save settings to localStorage:', e);
    }
}

export function applySettings(gameState) {
    const settings = {
        showCharacterNames: document.getElementById('showCharacterNames').checked,
        showActionIndicators: document.getElementById('showActionIndicators').checked,
        enableSmoothAnimations: document.getElementById('enableSmoothAnimations').checked,
        gameSpeed: parseFloat(document.getElementById('gameSpeed').value),
        autoPause: document.getElementById('autoPause').checked,
        masterVolume: parseInt(document.getElementById('masterVolume').value),
        enableSoundEffects: document.getElementById('enableSoundEffects').checked
    };
    saveGameSettings(settings);
    if (gameState) {
        gameState.settings = settings;
        if (window.gameLoop && window.gameLoop.setSpeed) {
            window.gameLoop.setSpeed(settings.gameSpeed);
        }
    }
    alert('Settings saved successfully!');
    // The UIManager should handle navigation after saving
}
