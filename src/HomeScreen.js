import Game from "./Game";
import { Screen } from "./Screen";

export class HomeScreen extends Screen {
  show() {
    super.show();
    this.name = "home";
    this.element.classList.add("home-screen");

    this.element.innerHTML = `
    <div class="screen start-screen active" id="startScreen">
        <h1 class="game-title">TRIBES</h1>
        <div class="menu">
            <button class="menu-button" id="startNewGameButton">Start New Game</button>
            <button class="menu-button" id="exitGameButton">Exit</button>
        </div>
    </div>
    `;

    // Create a new button for "Start New Game"
    this.startNewGameBtn = document.createElement("button");
    this.startNewGameBtn.textContent = "Start New Game";
    this.element.appendChild(this.startNewGameBtn);

    this.startNewGameButton = this.element.querySelector("#startNewGameButton");
    this.exitGameButton = this.element.querySelector("#exitGameButton");

    this.startNewGameButton.addEventListener("click", this.startNewGame);

    this.exitGameButton.addEventListener("click", () => {
      this.exitGame();
    });
  }

  startNewGame() {
    Game.startNewGame();
  }

  exitGame() {
    if (confirm("Are you sure you want to exit?")) {
      if (typeof require !== "undefined") {
        const { remote } = require("electron");
        if (remote) remote.getCurrentWindow().close();
      }
    }
  }

  loadGame() {
    alert("Load game functionality not implemented yet.");
  }
}
