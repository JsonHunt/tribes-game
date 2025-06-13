export class Screen {
  constructor() {
    this.name = null;
  }

  show() {
    this.element = document.createElement('div');
    this.element.className = 'screen';
    document.body.appendChild(this.element);
    Screen.currentScreen = this;
  }

  hide() {
    if (this.element && this.element.parentElement) {
      this.element.parentElement.removeChild(this.element);
    }
  }
}

Screen.currentScreen = null;
