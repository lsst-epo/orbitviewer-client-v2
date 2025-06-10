import Layer from "./Layer";

class MapControls extends Layer {
    orbitviewer: any;
    dom: any;

    constructor(dom, orbitviewer) {
        super(dom, {
            openClass: 'map_controls--open',
            closeClass: 'map_controls--close',
            animationDuration: 500
        });
        this.dom = dom;
        this.orbitviewer = orbitviewer;
    }
}

export default MapControls;