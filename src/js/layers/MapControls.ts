import Layer from "./Layer";

class MapControls extends Layer {
    orbitviewer: any;
    dom: any;
    startButtons: any;

    constructor(dom, orbitviewer) {
        super(dom);
        this.dom = dom;
        this.orbitviewer = orbitviewer;

        this.start();
    }

    start() {
    }
}

export default MapControls;