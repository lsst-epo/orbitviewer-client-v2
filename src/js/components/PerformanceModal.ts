export class PerformanceWarning {
  constructor(public dom:HTMLElement) {

  }

  show() {
    this.dom.setAttribute('aria-hidden', 'false');
  }

  hide() {
    this.dom.setAttribute('aria-hidden', 'true');
  }
}