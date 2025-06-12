<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Simple Tribes Game - Copilot Instructions

This is an Electron-based desktop game application that simulates a simple tribal civilization.

## Project Structure
- `main.js` - Electron main process that creates the application window
- `index.html` - The main game interface with modern styling
- `renderer.js` - Game logic and UI interactions
- `package.json` - Project configuration with Electron dependencies

## Game Mechanics
The game includes:
- Resource gathering system
- Population management
- Happiness/morale system
- Random events that affect the tribe
- Interactive buttons for different actions

## Development Guidelines
- Use modern JavaScript ES6+ features
- Maintain responsive and attractive UI design
- Follow Electron best practices for security
- Keep game mechanics simple but engaging
- Add visual feedback for user actions

## Styling
- Uses gradient backgrounds and glassmorphism effects
- Modern button designs with hover animations
- Responsive layout that works on different screen sizes
- Color scheme: purple/blue gradients with accent colors

When given a list of tasks, execute them one by one in provided order.

## Programming tasks
- Create a separate branch for each task and commit after successfully completing it.
- Do not create try catch blocks unless specifically requested.
- Prefer using await async over .then
- Do not run the app to verify if it works.
- keep the code clean and well-commented
- Use meaningful variable and function names
- Keep the code modular and organized
- Use ES6+ features like arrow functions, destructuring, and template literals
- keep css, js and html code in separate files