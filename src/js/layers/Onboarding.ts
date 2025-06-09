import Layer from "./Layer";

class Onboarding extends Layer {
    orbitviewer: any;
    dom: any;
    startButtons: any;

    constructor(dom, orbitviewer) {
        super(dom);
        this.dom = dom;
        this.orbitviewer = orbitviewer;
        this.startButtons = this.dom.querySelectorAll('.button_launch');

        this.start();
    }

    start() {
        this.startButtons.forEach((el: Element) => {
            el.addEventListener('click', (event) => {
                event.preventDefault();
                this.close();

                this.orbitviewer.showUI();
            });
        });
    }
}

export default Onboarding;