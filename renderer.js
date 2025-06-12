// Game state
let gameState = {
    population: 10,
    resources: 50,
    happiness: 75
};

// Update display elements
function updateDisplay() {
    document.getElementById('population').textContent = gameState.population;
    document.getElementById('resources').textContent = gameState.resources;
    document.getElementById('happiness').textContent = gameState.happiness;
}

// Show message to player
function showMessage(message) {
    const messagesDiv = document.getElementById('messages');
    messagesDiv.innerHTML = `<p>${message}</p>`;
    
    // Clear message after 3 seconds
    setTimeout(() => {
        messagesDiv.innerHTML = '<p>Click the buttons above to grow your tribe!</p>';
    }, 3000);
}

// Game actions
function gatherResources() {
    const gathered = Math.floor(Math.random() * 15) + 5;
    gameState.resources += gathered;
    showMessage(`🌾 Your tribe gathered ${gathered} resources!`);
    updateDisplay();
}

function expandTribe() {
    if (gameState.resources >= 20) {
        gameState.resources -= 20;
        const newMembers = Math.floor(Math.random() * 3) + 1;
        gameState.population += newMembers;
        gameState.happiness = Math.max(0, gameState.happiness - 5);
        showMessage(`👥 ${newMembers} new members joined your tribe! (-20 resources)`);
    } else {
        showMessage(`❌ Not enough resources to expand tribe! (Need 20 resources)`);
    }
    updateDisplay();
}

function celebrateFestival() {
    if (gameState.resources >= 15) {
        gameState.resources -= 15;
        const happinessBoost = Math.floor(Math.random() * 20) + 10;
        gameState.happiness = Math.min(100, gameState.happiness + happinessBoost);
        showMessage(`🎉 Great festival! Happiness increased by ${happinessBoost}! (-15 resources)`);
    } else {
        showMessage(`❌ Not enough resources for a festival! (Need 15 resources)`);
    }
    updateDisplay();
}

// Random events
function triggerRandomEvent() {
    const events = [
        {
            message: "🌧️ A good harvest season! Gained 10 resources.",
            effect: () => gameState.resources += 10
        },
        {
            message: "🎭 Wandering entertainers visited! Happiness +15!",
            effect: () => gameState.happiness = Math.min(100, gameState.happiness + 15)
        },
        {
            message: "🐺 Wild animals threatened the tribe. Lost 5 resources defending.",
            effect: () => gameState.resources = Math.max(0, gameState.resources - 5)
        }
    ];
    
    const randomEvent = events[Math.floor(Math.random() * events.length)];
    randomEvent.effect();
    showMessage(randomEvent.message);
    updateDisplay();
}

// Initialize the game
document.addEventListener('DOMContentLoaded', function() {
    updateDisplay();
    
    // Trigger random events every 30 seconds
    setInterval(triggerRandomEvent, 30000);
    
    console.log('Simple Tribes Game loaded successfully!');
});
