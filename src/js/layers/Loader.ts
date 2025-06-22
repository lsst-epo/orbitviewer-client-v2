export class Loader {
  constructor(public dom:HTMLElement) {

  }

  show() {
    // console.log('SHOOOOOOOOW', this.dom);
    this.dom.setAttribute('aria-hidden', 'false');
  }

  hide() {
    // console.log('HIDEEEE')
    this.dom.setAttribute('aria-hidden', 'true');
  }
}