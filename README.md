# Simple Tribes Game

A desktop civilization game built with Electron where you manage a tribal society, gather resources, expand your population, and maintain happiness.

## Features

🏛️ **Tribal Management**: Grow your tribe from a small group to a thriving civilization
🌾 **Resource Gathering**: Collect resources to sustain and expand your tribe
👥 **Population Growth**: Recruit new members to increase your tribe's power
🎉 **Happiness System**: Keep your tribe happy through festivals and good management
🎲 **Random Events**: Experience unexpected events that challenge your leadership

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

1. Clone or download this project
2. Navigate to the project directory
3. Install dependencies:
   ```bash
   npm install
   ```

### Running the Game

To start the game:
```bash
npm start
```

To run in development mode with DevTools:
```bash
npm run dev
```

## How to Play

1. **Gather Resources**: Click the "Gather Resources" button to collect materials for your tribe
2. **Expand Tribe**: Spend 20 resources to add new members to your tribe
3. **Hold Festival**: Spend 15 resources to boost your tribe's happiness
4. **Manage Wisely**: Balance resource collection with spending to grow your civilization
5. **Handle Events**: Random events will occur that may help or challenge your tribe

## Game Mechanics

- **Population**: The number of people in your tribe
- **Resources**: Materials needed for expansion and festivals
- **Happiness**: Morale level of your tribe (affects productivity)
- **Random Events**: Occur every 30 seconds and can provide bonuses or challenges

## Technology Stack

- **Electron**: Cross-platform desktop application framework
- **HTML5/CSS3**: Modern web technologies for the user interface
- **JavaScript**: Game logic and interactions
- **Node.js**: Runtime environment

## Development

The project structure:
- `main.js` - Electron main process
- `index.html` - Game interface
- `renderer.js` - Game logic
- `package.json` - Project configuration

## Future Enhancements

Potential features to add:
- Save/load game state
- Multiple tribes or civilizations
- Trading system
- Technology research tree
- Map exploration
- Combat system
- Achievement system

## License

ISC License
