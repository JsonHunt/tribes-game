import { Screen } from "./Screen";

export class MapScreen extends Screen {
  show() {
    super.show();
    this.name = "map";
    this.element.innerHTML = `
        <div class="screen gameplay-screen" id="gameplayScreen">
        <div class="game-header">
            <div class="game-info">
                <div class="info-item">World: <span id="worldSize">0x0</span></div>
                <div class="info-item">Tribe Size: <span id="currentTribeSize">0</span></div>
                <div class="info-item">Zoom: <span id="zoomLevel">100%</span></div>
            </div>
            <button class="menu-button secondary-button" onclick="showStartScreen()">Main Menu</button>
        </div>        <div class="game-viewport" id="gameViewport">
            <div class="game-map" id="gameMap"></div>
            <div class="zoom-controls-overlay">
                <button class="zoom-button" onclick="zoomOut()">-</button>
                <button class="zoom-button" onclick="zoomIn()">+</button>
            </div>
            <div class="character-info-panel" id="characterInfoPanel" style="display: none;">
                <div class="panel-header">
                    <h3>Character <span id="selectedCharacterId">0</span></h3>
                    <button class="close-btn" onclick="hideCharacterInfo()">×</button>
                </div>
                <div class="panel-content">
                    <div class="section">
                        <h4>Current Need</h4>
                        <div id="currentNeed">-</div>
                    </div>
                    <div class="section">
                        <h4>Needs</h4>
                        <div id="needsList"></div>
                    </div>
                    <div class="section">
                        <h4>Skills</h4>
                        <div id="skillsList"></div>
                    </div>
                    <div class="section">
                        <h4>Traits</h4>
                        <div id="traitsList"></div>
                    </div>
                </div>
            </div>
        </div></div>
        `;
    this.mapContainer = Map.currentMap.mapElement;
    this.element.appendChild(this.mapContainer);
  }
}
