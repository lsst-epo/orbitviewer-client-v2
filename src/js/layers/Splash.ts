import Layer from "./Layer";

class Splash extends Layer {
    dom: HTMLElement;
    buttonStart: HTMLElement;
    splash: any;
    orbitViewer: any;

    constructor(dom, orbitViewer) {
        super(dom);
        this.dom = dom;
        this.orbitViewer = orbitViewer;

        this.buttonStart = this.dom.querySelector('.button_start');

        this.start();
    }

    start() {
        this.buttonStart.addEventListener('click', (event) => {
            event.preventDefault();

            if (this.orbitViewer.onboarding) {
                this.orbitViewer.onboarding.open();
                this.close();
            }
        });
    }
}

export default Splash;