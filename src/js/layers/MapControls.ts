import { GLOBALS } from "../core/Globals";
import Layer from "./Layer";

class MapControls extends Layer {
    buttons:NodeListOf<HTMLButtonElement>;

    constructor(public dom:HTMLElement) {
        super(dom, {
            openClass: 'map_controls--open',
            closeClass: 'map_controls--close',
            animationDuration: 500
        });

        this.buttons = dom.querySelectorAll('button');

        // center
        this.buttons[0].onclick = () => {
            GLOBALS.viewer.centerView();
        }

        const zoomIn = () => {
            GLOBALS.viewer.controls.zoom = -1;
        }

        const zoomOut = () => {
            GLOBALS.viewer.controls.zoom = 1;
        }

        const releaseZoom = () => {
            GLOBALS.viewer.controls.zoom = 0;
        }

        // zoom in
        this.attachUpDownActions(this.buttons[1], zoomIn, releaseZoom);

        // zoom out
        this.attachUpDownActions(this.buttons[2], zoomOut, releaseZoom);

        this.buttons[3].onclick = () => {
            GLOBALS.toggleFullscreen()
        }

        this.buttons[4].onclick = () => {
            GLOBALS.toggleFullscreen()
        }

        this.buttons[4].setAttribute('aria-hidden', 'true')
    }

    protected attachUpDownActions(btn:HTMLButtonElement, onDown, onUp) {
        btn.addEventListener('mousedown', onDown);
        btn.addEventListener('touchstart', onDown);
        btn.addEventListener('mouseup', onUp);
        btn.addEventListener('touchend', onUp);
        btn.addEventListener('touchcancel', onUp);
        btn.addEventListener('mouseleave', onUp);
    }
}

export default MapControls;